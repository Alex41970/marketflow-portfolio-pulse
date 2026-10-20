-- Ledgerline client portal: full database setup. Paste into the Supabase SQL editor and run once on a fresh project.

-- ===== drizzle/migrations/0000_migration.sql =====
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
-- ===== drizzle/migrations/0001_migration.sql =====
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  symbol text not null,
  side text not null check (side in ('buy','sell')),
  order_type text not null default 'limit' check (order_type in ('market','limit')),
  quantity numeric(14,4) not null check (quantity > 0),
  limit_price numeric(14,4),
  status text not null default 'working' check (status in ('working','filled','cancelled')),
  created_at timestamptz not null default now(),
  filled_at timestamptz
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders read" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "own orders insert" on public.orders for insert to authenticated with check (user_id = auth.uid() and status = 'working');
create policy "own orders update" on public.orders for update to authenticated using (user_id = auth.uid() and status = 'working') with check (user_id = auth.uid() and status in ('cancelled','filled'));

alter table public.profiles add column disclaimer_accepted_at timestamptz;
alter table public.profiles add column last_seen_at timestamptz;

create or replace function public.accept_disclaimer()
returns void language sql security definer set search_path = public as $$
  update public.profiles set disclaimer_accepted_at = now() where id = auth.uid() $$;
revoke execute on function public.accept_disclaimer from public, anon;
grant execute on function public.accept_disclaimer to authenticated;

create or replace function public.touch_seen()
returns void language sql security definer set search_path = public as $$
  update public.profiles set last_seen_at = now() where id = auth.uid() $$;
revoke execute on function public.touch_seen from public, anon;
grant execute on function public.touch_seen to authenticated;
-- ===== drizzle/migrations/0002_funding.sql =====
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('crypto','wire')),
  label text NOT NULL,
  network text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read payment methods" ON public.payment_methods FOR SELECT TO authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert pm" ON public.payment_methods FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update pm" ON public.payment_methods FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete pm" ON public.payment_methods FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.funding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('deposit','withdrawal')),
  method text NOT NULL CHECK (method IN ('crypto','wire')),
  amount numeric NOT NULL CHECK (amount > 0),
  network text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  reference text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  admin_note text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.funding_requests TO authenticated;
GRANT ALL ON public.funding_requests TO service_role;
ALTER TABLE public.funding_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or admin requests" ON public.funding_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.create_funding_request(_kind text, _method text, _amount numeric, _network text, _details jsonb, _reference text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare uid uuid := auth.uid(); bal numeric; pend numeric; rid uuid;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  if _kind not in ('deposit','withdrawal') or _method not in ('crypto','wire') then raise exception 'Invalid request'; end if;
  if _amount is null or _amount <= 0 then raise exception 'Amount must be positive'; end if;
  if _kind = 'withdrawal' then
    select virtual_balance into bal from public.profiles where id = uid for update;
    select coalesce(sum(amount),0) into pend from public.funding_requests where user_id = uid and kind='withdrawal' and status='pending';
    if _amount + pend > bal then raise exception 'Amount exceeds available balance'; end if;
  end if;
  insert into public.funding_requests (user_id, kind, method, amount, network, details, reference)
  values (uid, _kind, _method, round(_amount,2), _network, coalesce(_details,'{}'::jsonb), nullif(trim(_reference),''))
  returning id into rid;
  return rid;
end $$;

CREATE OR REPLACE FUNCTION public.decide_funding_request(_id uuid, _approve boolean, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare r record;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  select * into r from public.funding_requests where id = _id for update;
  if r is null then raise exception 'Request not found'; end if;
  if r.status <> 'pending' then raise exception 'Already decided'; end if;
  if _approve then
    if r.kind = 'deposit' then
      update public.profiles set virtual_balance = virtual_balance + r.amount where id = r.user_id;
      insert into public.transactions (user_id, kind, amount, note) values (r.user_id, 'topup', r.amount, 'Top-up via ' || r.method);
    else
      update public.profiles set virtual_balance = virtual_balance - r.amount where id = r.user_id and virtual_balance >= r.amount;
      if not found then raise exception 'Insufficient balance'; end if;
      insert into public.transactions (user_id, kind, amount, note) values (r.user_id, 'withdrawal', -r.amount, 'Withdrawal via ' || r.method);
    end if;
  end if;
  update public.funding_requests set status = case when _approve then 'approved' else 'declined' end,
    admin_note = nullif(trim(_note),''), decided_by = auth.uid(), decided_at = now() where id = _id;
  insert into public.admin_audit_log (admin_id, target_user_id, action, amount, reason)
  values (auth.uid(), r.user_id, r.kind || (case when _approve then '_approved' else '_declined' end), r.amount, coalesce(nullif(trim(_note),''), '—'));
end $$;