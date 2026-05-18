-- ─── Migration 009: RLS Hardening ─────────────────────────────────────────────
-- Fixes from the RLS audit (2026-05-18). Run in Supabase SQL Editor.
-- Safe to re-run — all statements are idempotent.
--
--  1. phone_verifications — OTP codes were world-readable (USING TRUE + anon grant)
--  2. profiles           — users could self-escalate role / switch tenant on UPDATE
--  3. attendance         — not role/site scoped; any tenant user could edit/delete
--  4. pending_invites    — no DELETE policy (invites could not be revoked)

-- ── 1. phone_verifications — lock down ────────────────────────────────────────
-- Edge functions use the service-role key, which bypasses RLS. No client-facing
-- policy should grant blanket access. Remove the permissive policy and revoke
-- the anon/authenticated grants.

DROP POLICY IF EXISTS "pv_service_all" ON public.phone_verifications;
REVOKE ALL ON public.phone_verifications FROM anon, authenticated;

-- Optional: let an authenticated user read only their own verification rows.
DROP POLICY IF EXISTS "pv_own_select" ON public.phone_verifications;
CREATE POLICY "pv_own_select" ON public.phone_verifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ── 2. profiles — freeze privileged columns on self-update ────────────────────
-- The profiles_update policy allows id = auth.uid(); without a column lock a
-- user could UPDATE their own role to 'superadmin' or change tenant_id.
-- This BEFORE UPDATE trigger reverts role/tenant_id changes unless the caller
-- is a superadmin.

CREATE OR REPLACE FUNCTION public.lock_profile_privileged_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Superadmins may change anything; everyone else cannot touch role/tenant_id
  -- on any profile row.
  IF public.my_role() IS DISTINCT FROM 'superadmin' THEN
    NEW.role      := OLD.role;
    NEW.tenant_id := OLD.tenant_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_lock_privileged ON public.profiles;
CREATE TRIGGER profiles_lock_privileged
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.lock_profile_privileged_cols();

-- NOTE: the link_owner_to_tenant trigger sets role/tenant_id during onboarding.
-- It runs as SECURITY DEFINER updating profiles; my_role() for the calling
-- contractor at that moment is 'contractor', so the lock above would block it.
-- Guard it with a transaction-local bypass flag.

CREATE OR REPLACE FUNCTION public.link_owner_to_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('storey.bypass_profile_lock', 'on', true);
  UPDATE public.profiles
     SET tenant_id = NEW.id, role = 'contractor'
   WHERE id = NEW.owner_id;
  PERFORM set_config('storey.bypass_profile_lock', 'off', true);
  RETURN NEW;
END;
$$;

-- Re-define the lock to honour the bypass flag.
CREATE OR REPLACE FUNCTION public.lock_profile_privileged_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('storey.bypass_profile_lock', true) = 'on' THEN
    RETURN NEW;  -- onboarding / trusted server path
  END IF;
  IF public.my_role() IS DISTINCT FROM 'superadmin' THEN
    NEW.role      := OLD.role;
    NEW.tenant_id := OLD.tenant_id;
  END IF;
  RETURN NEW;
END;
$$;

-- ── 3. attendance — role + site scoped RLS ────────────────────────────────────
-- Replace the tenant-only policies with the same site-scoped model used by
-- workers / daily_logs.

DROP POLICY IF EXISTS "attendance_select" ON public.attendance;
DROP POLICY IF EXISTS "attendance_insert" ON public.attendance;
DROP POLICY IF EXISTS "attendance_update" ON public.attendance;
DROP POLICY IF EXISTS "attendance_delete" ON public.attendance;

-- SELECT: superadmin all; contractor whole tenant; sub-roles only assigned sites
CREATE POLICY "attendance_select" ON public.attendance FOR SELECT
  USING (
    my_role() = 'superadmin'
    OR (my_role() = 'contractor' AND tenant_id = my_tenant_id())
    OR site_id IN (SELECT site_id FROM site_assignments WHERE profile_id = auth.uid())
  );

-- INSERT: supervisor and above, scoped to assigned sites
CREATE POLICY "attendance_insert" ON public.attendance FOR INSERT
  WITH CHECK (
    my_role() = 'superadmin'
    OR (my_role() IN ('contractor', 'site_manager') AND tenant_id = my_tenant_id())
    OR (my_role() IN ('site_manager', 'supervisor')
        AND site_id IN (SELECT site_id FROM site_assignments WHERE profile_id = auth.uid()))
  );

-- UPDATE: same as insert
CREATE POLICY "attendance_update" ON public.attendance FOR UPDATE
  USING (
    my_role() = 'superadmin'
    OR (my_role() IN ('contractor', 'site_manager') AND tenant_id = my_tenant_id())
    OR (my_role() IN ('site_manager', 'supervisor')
        AND site_id IN (SELECT site_id FROM site_assignments WHERE profile_id = auth.uid()))
  );

-- DELETE: contractor / superadmin only
CREATE POLICY "attendance_delete" ON public.attendance FOR DELETE
  USING (
    my_role() = 'superadmin'
    OR (my_role() = 'contractor' AND tenant_id = my_tenant_id())
  );

-- ── 4. pending_invites — allow revoking an invite ─────────────────────────────
DROP POLICY IF EXISTS "pi_contractor_delete" ON public.pending_invites;
CREATE POLICY "pi_contractor_delete" ON public.pending_invites
  FOR DELETE USING (
    my_role() = 'superadmin'
    OR (my_role() = 'contractor' AND tenant_id = my_tenant_id())
  );
