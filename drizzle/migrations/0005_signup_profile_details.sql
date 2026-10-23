ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, virtual_balance, bonus, first_name, last_name, account_type, phone, terms_accepted_at)
  VALUES (
    NEW.id,
    coalesce(nullif(trim(NEW.raw_user_meta_data->>'username'), ''), 'client_' || replace(NEW.id::text, '-', '')),
    NEW.email, 0, 0,
    nullif(trim(NEW.raw_user_meta_data->>'first_name'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'last_name'), ''),
    CASE WHEN NEW.raw_user_meta_data->>'account_type' = 'business' THEN 'business' ELSE 'personal' END,
    nullif(trim(NEW.raw_user_meta_data->>'phone'), ''),
    CASE WHEN NEW.raw_user_meta_data->>'terms_accepted' = 'true' THEN now() ELSE NULL END
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;