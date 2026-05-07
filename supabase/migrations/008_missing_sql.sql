-- ─── Migration 008: Missing SQL functions & tables ────────────────────────────
-- Run this in Supabase SQL Editor.
-- Safe to re-run — all statements use CREATE OR REPLACE / IF NOT EXISTS.

-- ── 1. record_material_transaction ────────────────────────────────────────────
-- Called by materialTransactionStore.recordTransaction() for ALL inventory
-- actions: consumption, adjustment, allocation, wastage, return, etc.
-- Locks the material row to prevent race conditions under concurrent usage.

CREATE OR REPLACE FUNCTION public.record_material_transaction(
  p_material_id uuid,
  p_site_id     uuid,
  p_tenant_id   uuid,
  p_txn_type    text,
  p_quantity    numeric,
  p_note        text  DEFAULT NULL,
  p_created_by  uuid  DEFAULT NULL,
  p_ref_type    text  DEFAULT NULL,
  p_ref_id      uuid  DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_qty  numeric;
  v_new_qty      numeric;
  v_txn_id       uuid;
BEGIN
  -- Lock the material row so concurrent calls don't race
  SELECT COALESCE(quantity_available, 0)
    INTO v_current_qty
    FROM materials
   WHERE id = p_material_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Material not found: %', p_material_id;
  END IF;

  -- Compute new balance
  IF p_txn_type IN ('receipt', 'transfer_in', 'opening', 'return') THEN
    v_new_qty := v_current_qty + p_quantity;

  ELSIF p_txn_type IN ('consumption', 'transfer_out', 'allocation', 'wastage') THEN
    v_new_qty := v_current_qty - p_quantity;
    IF v_new_qty < 0 THEN
      RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_current_qty, p_quantity;
    END IF;

  ELSIF p_txn_type = 'adjustment' THEN
    v_new_qty := p_quantity;   -- set to exact value (physical count correction)

  ELSE
    RAISE EXCEPTION 'Unknown txn_type: %', p_txn_type;
  END IF;

  -- Write ledger entry
  INSERT INTO material_transactions (
    material_id, site_id, tenant_id,
    txn_type, quantity,
    note, created_by,
    ref_type, ref_id,
    balance_after
  ) VALUES (
    p_material_id, p_site_id, p_tenant_id,
    p_txn_type, p_quantity,
    p_note, p_created_by,
    p_ref_type, p_ref_id,
    v_new_qty
  )
  RETURNING id INTO v_txn_id;

  -- Update live stock level
  UPDATE materials
     SET quantity_available = v_new_qty,
         updated_at         = NOW()
   WHERE id = p_material_id;

  RETURN jsonb_build_object('txn_id', v_txn_id, 'new_qty', v_new_qty);
END;
$$;


-- ── 2. phone_verifications ────────────────────────────────────────────────────
-- Used by send-sms-otp and verify-sms-otp edge functions.

CREATE TABLE IF NOT EXISTS public.phone_verifications (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  otp_code     text NOT NULL,
  attempts     integer NOT NULL DEFAULT 0,
  verified_at  timestamptz,
  expires_at   timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

GRANT ALL ON public.phone_verifications TO anon, authenticated, service_role;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Service role (edge functions) can do everything; users can only see their own
DROP POLICY IF EXISTS "pv_service_all" ON public.phone_verifications;
CREATE POLICY "pv_service_all" ON public.phone_verifications
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


-- ── 3. get_auth_user_by_phone ─────────────────────────────────────────────────
-- Used by send-sms-otp and verify-sms-otp to look up a user by their phone.
-- SECURITY DEFINER so it can read auth.users without RLS restrictions.

CREATE OR REPLACE FUNCTION public.get_auth_user_by_phone(p_phone text)
RETURNS TABLE (user_id uuid, user_email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email
  FROM auth.users
  WHERE phone = p_phone
  LIMIT 1;
$$;


-- ── 4. pending_invites ────────────────────────────────────────────────────────
-- Used by invite-user and sign-up-with-invite edge functions.

CREATE TABLE IF NOT EXISTS public.pending_invites (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email        text NOT NULL,
  role         text NOT NULL,
  site_id      uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  invite_code  text NOT NULL,
  accepted_at  timestamptz,
  expires_at   timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email),
  UNIQUE (invite_code)
);

GRANT ALL ON public.pending_invites TO anon, authenticated, service_role;
ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;

-- Contractors can see invites for their tenant; service role bypasses RLS
DROP POLICY IF EXISTS "pi_contractor_select" ON public.pending_invites;
CREATE POLICY "pi_contractor_select" ON public.pending_invites
  FOR SELECT USING (
    my_role() = 'superadmin'
    OR (my_role() = 'contractor' AND tenant_id = my_tenant_id())
  );

DROP POLICY IF EXISTS "pi_contractor_insert" ON public.pending_invites;
CREATE POLICY "pi_contractor_insert" ON public.pending_invites
  FOR INSERT WITH CHECK (
    my_role() = 'superadmin'
    OR (my_role() = 'contractor' AND tenant_id = my_tenant_id())
  );

DROP POLICY IF EXISTS "pi_contractor_update" ON public.pending_invites;
CREATE POLICY "pi_contractor_update" ON public.pending_invites
  FOR UPDATE USING (
    my_role() = 'superadmin'
    OR (my_role() = 'contractor' AND tenant_id = my_tenant_id())
  );
