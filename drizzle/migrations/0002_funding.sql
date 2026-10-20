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