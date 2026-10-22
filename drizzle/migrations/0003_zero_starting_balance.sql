alter table public.profiles alter column virtual_balance set default 0;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, email, virtual_balance)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1) || '_' || substr(new.id::text,1,4)), new.email, 0);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end $$;