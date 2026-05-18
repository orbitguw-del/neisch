-- ─── Migration: Fix profile-lock bypass regression ───────────────────────────
-- Migration 009 redefined link_owner_to_tenant() to set a NEW bypass flag
-- (storey.bypass_profile_lock) and added a second, redundant lock trigger
-- (lock_profile_privileged_cols).
--
-- But the active immutability trigger — enforce_profile_field_immutability(),
-- from 20260515000000 — honours a DIFFERENT flag: app.bypass_profile_immutability.
-- Result: when a Google-OAuth contractor creates their first company, the
-- on_tenant_created → link_owner_to_tenant UPDATE is no longer bypassed and
-- fails with: "profiles.tenant_id can only be changed by a superadmin".
--
-- Fix:
--   1. Drop migration 009's redundant trigger/function — enforce_profile_field_
--      immutability already covers role/tenant_id (and id/phone/phone_verified/
--      auth_method) more completely.
--   2. Restore link_owner_to_tenant() to set the flag the active trigger honours.

-- 1. Remove the redundant lock added by migration 009
DROP TRIGGER IF EXISTS profiles_lock_privileged ON public.profiles;
DROP FUNCTION IF EXISTS public.lock_profile_privileged_cols();

-- 2. Restore link_owner_to_tenant with the correct transaction-local bypass flag
CREATE OR REPLACE FUNCTION public.link_owner_to_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Transaction-local; auto-clears on commit/rollback. Honoured by
  -- enforce_profile_field_immutability().
  PERFORM set_config('app.bypass_profile_immutability', 'on', true);

  UPDATE public.profiles
     SET tenant_id = NEW.id,
         role      = 'contractor'
   WHERE id = NEW.owner_id;

  RETURN NEW;
END;
$$;
