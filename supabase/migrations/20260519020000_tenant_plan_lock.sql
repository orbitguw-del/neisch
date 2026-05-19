-- ─── Migration: lock tenants.plan ─────────────────────────────────────────────
-- RLS-AUDIT-2026-05-19 finding #3. tenants_update lets a tenant owner update
-- their tenant row with no column restriction, so they could run
-- `UPDATE tenants SET plan='enterprise'` — a free self-upgrade.
-- This BEFORE UPDATE trigger freezes `plan` for everyone except a superadmin /
-- service-role caller (billing). A normal tenant-name edit still works — the
-- plan column is just silently kept at its old value.

CREATE OR REPLACE FUNCTION public.enforce_tenant_plan_lock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF public.my_role() = 'superadmin' THEN RETURN NEW; END IF;

  -- Everyone else: plan is immutable from the client.
  NEW.plan := OLD.plan;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tenants_plan_lock ON public.tenants;
CREATE TRIGGER tenants_plan_lock
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_plan_lock();
