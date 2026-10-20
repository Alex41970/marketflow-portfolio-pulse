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