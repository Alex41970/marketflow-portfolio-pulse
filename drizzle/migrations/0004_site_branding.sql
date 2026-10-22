create table public.site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'Ledgerline',
  brand_suffix text not null default 'Markets',
  brand_mark text not null default 'L',
  tagline text not null default 'Institutional-grade client portal',
  footer_text text not null default 'Market prices shown on this website are indicative only and are not live exchange data. Trading leveraged products carries a high level of risk and may not be suitable for all investors.',
  copyright text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "site settings public read" on public.site_settings for select to anon, authenticated using (true);
create policy "site settings admin update" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings (id) values (1);