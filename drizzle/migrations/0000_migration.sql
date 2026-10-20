create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null,
  virtual_balance numeric(14,2) not null default 100000 check (virtual_balance >= 0),
  bonus numeric(14,2) not null default 0 check (bonus >= 0),
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  symbol text not null,
  quantity numeric(14,4) not null default 0,
  avg_cost numeric(14,4) not null default 0,
  unique(user_id, symbol)
);
grant select on public.holdings to authenticated;
grant all on public.holdings to service_role;
alter table public.holdings enable row level security;
create policy "own holdings" on public.holdings for select to authenticated using (user_id = auth.uid());

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  symbol text,
  quantity numeric(14,4),
  price numeric(14,4),
  amount numeric(14,2) not null,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;
create policy "own tx" on public.transactions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  target_user_id uuid not null,
  action text not null,
  amount numeric(14,2),
  reason text not null,
  created_at timestamptz not null default now()
);
grant select on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;
alter table public.admin_audit_log enable row level security;
create policy "admins read audit" on public.admin_audit_log for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1) || '_' || substr(new.id::text,1,4)), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  insert into public.transactions (user_id, kind, amount, note) values (new.id, 'deposit', 100000, 'Starting virtual balance');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Trading: atomic buy/sell at a client-supplied simulated price
create or replace function public.place_trade(_symbol text, _side text, _qty numeric, _price numeric)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); cost numeric; h record;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  if _qty <= 0 or _price <= 0 then raise exception 'Invalid order'; end if;
  cost := round(_qty * _price, 2);
  if _side = 'buy' then
    update public.profiles set virtual_balance = virtual_balance - cost where id = uid and virtual_balance >= cost;
    if not found then raise exception 'Insufficient virtual funds'; end if;
    insert into public.holdings (user_id, symbol, quantity, avg_cost) values (uid, _symbol, _qty, _price)
    on conflict (user_id, symbol) do update set
      avg_cost = (holdings.avg_cost*holdings.quantity + excluded.avg_cost*excluded.quantity)/(holdings.quantity+excluded.quantity),
      quantity = holdings.quantity + excluded.quantity;
    insert into public.transactions (user_id, kind, symbol, quantity, price, amount) values (uid,'buy',_symbol,_qty,_price,-cost);
  elsif _side = 'sell' then
    select * into h from public.holdings where user_id = uid and symbol = _symbol for update;
    if h is null or h.quantity < _qty then raise exception 'Not enough shares'; end if;
    if h.quantity = _qty then delete from public.holdings where id = h.id;
    else update public.holdings set quantity = quantity - _qty where id = h.id; end if;
    update public.profiles set virtual_balance = virtual_balance + cost where id = uid;
    insert into public.transactions (user_id, kind, symbol, quantity, price, amount) values (uid,'sell',_symbol,_qty,_price,cost);
  else raise exception 'Invalid side'; end if;
end $$;
revoke execute on function public.place_trade from public, anon;
grant execute on function public.place_trade to authenticated;

-- Admin adjustments
create or replace function public.admin_adjust(_target uuid, _field text, _delta numeric, _reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  if coalesce(trim(_reason),'') = '' then raise exception 'Reason required'; end if;
  if _field = 'balance' then
    update public.profiles set virtual_balance = virtual_balance + _delta where id = _target and virtual_balance + _delta >= 0;
  elsif _field = 'bonus' then
    update public.profiles set bonus = bonus + _delta where id = _target and bonus + _delta >= 0;
  else raise exception 'Invalid field'; end if;
  if not found then raise exception 'Result would be negative or user not found'; end if;
  insert into public.transactions (user_id, kind, amount, note) values (_target, 'admin_' || _field, _delta, _reason);
  insert into public.admin_audit_log (admin_id, target_user_id, action, amount, reason) values (auth.uid(), _target, _field, _delta, _reason);
end $$;
revoke execute on function public.admin_adjust from public, anon;
grant execute on function public.admin_adjust to authenticated;

create or replace function public.clear_password_flag()
returns void language sql security definer set search_path = public as $$
  update public.profiles set must_change_password = false where id = auth.uid() $$;
revoke execute on function public.clear_password_flag from public, anon;
grant execute on function public.clear_password_flag to authenticated;

-- profiles: users can't update directly (balances protected)
revoke update on public.profiles from authenticated;