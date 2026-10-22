-- =====================================================================
-- Full Database Setup Script
-- Paste everything into the SQL Editor of a NEW, EMPTY project and click Run once.
-- =====================================================================

-- 1. Roles and Users
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  email text NOT NULL,
  virtual_balance numeric(14,2) NOT NULL DEFAULT 0 CHECK (virtual_balance >= 0),
  bonus numeric(14,2) NOT NULL DEFAULT 0 CHECK (bonus >= 0),
  must_change_password boolean NOT NULL DEFAULT false,
  disclaimer_accepted_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own profile read" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 2. Holdings & Transactions
CREATE TABLE public.holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  quantity numeric(14,4) NOT NULL DEFAULT 0,
  avg_cost numeric(14,4) NOT NULL DEFAULT 0,
  UNIQUE(user_id, symbol)
);
GRANT SELECT ON public.holdings TO authenticated;
GRANT ALL ON public.holdings TO service_role;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own holdings" ON public.holdings
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  symbol text,
  quantity numeric(14,4),
  price numeric(14,4),
  amount numeric(14,2) NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tx" ON public.transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 3. Audit Log
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL,
  amount numeric(14,2),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.admin_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Automatic Profile Creation on Signup (new accounts start at $0)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, virtual_balance, bonus)
  VALUES (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1) || '_' || substr(new.id::text,1,4)),
    new.email, 0, 0
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user');
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Orders (legacy, unused but referenced by app types)
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  order_type text NOT NULL DEFAULT 'limit' CHECK (order_type IN ('market','limit')),
  quantity numeric(14,4) NOT NULL CHECK (quantity > 0),
  limit_price numeric(14,4),
  status text NOT NULL DEFAULT 'working' CHECK (status IN ('working','filled','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  filled_at timestamptz
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 6. Payment Methods (Crypto & Bank Wire)
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

-- 7. Funding Requests (Top-ups & Withdrawals)
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

-- 8. Dynamic Branding Settings (edited from the admin Branding page)
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  brand_name text NOT NULL DEFAULT 'Ledgerline',
  brand_suffix text NOT NULL DEFAULT 'Markets',
  brand_mark text NOT NULL DEFAULT 'LM',
  tagline text NOT NULL DEFAULT 'Institutional-grade execution and multi-asset liquidity.',
  footer_text text NOT NULL DEFAULT 'Ledgerline Markets operates as an independent liquidity and technology provider.',
  copyright text NOT NULL DEFAULT '© 2026 Ledgerline Markets. All rights reserved.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow read branding" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin update branding" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Secure Functions (only way balances can change)
CREATE OR REPLACE FUNCTION public.create_funding_request(_kind text, _method text, _amount numeric, _network text, _details jsonb, _reference text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); bal numeric; pend numeric; rid uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _kind NOT IN ('deposit','withdrawal') OR _method NOT IN ('crypto','wire') THEN RAISE EXCEPTION 'Invalid request'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  IF _kind = 'withdrawal' THEN
    SELECT virtual_balance INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
    SELECT coalesce(sum(amount),0) INTO pend FROM public.funding_requests WHERE user_id = uid AND kind='withdrawal' AND status='pending';
    IF _amount + pend > bal THEN RAISE EXCEPTION 'Amount exceeds available balance'; END IF;
  END IF;
  INSERT INTO public.funding_requests (user_id, kind, method, amount, network, details, reference)
  VALUES (uid, _kind, _method, round(_amount,2), _network, coalesce(_details,'{}'::jsonb), nullif(trim(_reference),''))
  RETURNING id INTO rid;
  RETURN rid;
END;
$$;

CREATE OR REPLACE FUNCTION public.decide_funding_request(_id uuid, _approve boolean, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT * INTO r FROM public.funding_requests WHERE id = _id FOR UPDATE;
  IF r IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF r.status <> 'pending' THEN RAISE EXCEPTION 'Already decided'; END IF;
  IF _approve THEN
    IF r.kind = 'deposit' THEN
      UPDATE public.profiles SET virtual_balance = virtual_balance + r.amount WHERE id = r.user_id;
      INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (r.user_id, 'topup', r.amount, 'Top-up via ' || r.method);
    ELSE
      UPDATE public.profiles SET virtual_balance = virtual_balance - r.amount WHERE id = r.user_id AND virtual_balance >= r.amount;
      IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
      INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (r.user_id, 'withdrawal', -r.amount, 'Withdrawal via ' || r.method);
    END IF;
  END IF;
  UPDATE public.funding_requests SET status = CASE WHEN _approve THEN 'approved' ELSE 'declined' END,
    admin_note = nullif(trim(_note),''), decided_by = auth.uid(), decided_at = now() WHERE id = _id;
  INSERT INTO public.admin_audit_log (admin_id, target_user_id, action, amount, reason)
  VALUES (auth.uid(), r.user_id, r.kind || (CASE WHEN _approve THEN '_approved' ELSE '_declined' END), r.amount, coalesce(nullif(trim(_note),''), '—'));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_adjust(_target uuid, _field text, _delta numeric, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF coalesce(trim(_reason),'') = '' THEN RAISE EXCEPTION 'Reason required'; END IF;
  IF _field = 'balance' THEN
    UPDATE public.profiles SET virtual_balance = virtual_balance + _delta WHERE id = _target AND virtual_balance + _delta >= 0;
  ELSIF _field = 'bonus' THEN
    UPDATE public.profiles SET bonus = bonus + _delta WHERE id = _target AND bonus + _delta >= 0;
  ELSE RAISE EXCEPTION 'Invalid field'; END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'Result would be negative or user not found'; END IF;
  INSERT INTO public.transactions (user_id, kind, amount, note) VALUES (_target, 'admin_' || _field, _delta, _reason);
  INSERT INTO public.admin_audit_log (admin_id, target_user_id, action, amount, reason) VALUES (auth.uid(), _target, _field, _delta, _reason);
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_password_flag()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET must_change_password = false WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.accept_disclaimer()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET disclaimer_accepted_at = now() WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.touch_seen()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET last_seen_at = now() WHERE id = auth.uid();
$$;

-- Only signed-in users may call these functions
REVOKE EXECUTE ON FUNCTION public.create_funding_request(text,text,numeric,text,jsonb,text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.decide_funding_request(uuid,boolean,text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.admin_adjust(uuid,text,numeric,text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.clear_password_flag() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.accept_disclaimer() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.touch_seen() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_funding_request(text,text,numeric,text,jsonb,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_funding_request(uuid,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust(uuid,text,numeric,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_password_flag() TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_disclaimer() TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_seen() TO authenticated;

-- =====================================================================
-- AFTER RUNNING: make the first admin.
-- 1) Sign up on the live site with the admin email (or add the user under Authentication -> Users, Auto Confirm on).
-- 2) Run this, with the real email:
--    insert into public.user_roles (user_id, role)
--    select id, 'admin' from auth.users where email = 'admin@yourcompany.com'
--    on conflict do nothing;
-- =====================================================================
