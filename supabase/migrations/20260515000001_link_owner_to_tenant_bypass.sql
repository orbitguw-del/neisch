-- Bridge between the link_owner_to_tenant trigger and the new immutability trigger.
--
-- When a Google-OAuth contractor creates their first tenant (INSERT into tenants),
-- on_tenant_created fires link_owner_to_tenant, which does:
--   UPDATE profiles SET tenant_id = <new tenant>, role = 'contractor' WHERE id = owner
--
-- That UPDATE is now blocked by enforce_profile_field_immutability (added in
-- 20260515000000) because role + tenant_id are immutable for non-superadmin /
-- non-service-role callers.
--
-- Fix: link_owner_to_tenant sets a TRANSACTION-LOCAL config flag before its UPDATE.
-- The immutability trigger honours that flag. set_config(..., true) auto-clears at
-- end of transaction, so the bypass cannot leak across statements.

CREATE OR REPLACE FUNCTION link_owner_to_tenant()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Local to this transaction only. Cleared automatically on commit/rollback.
  PERFORM set_config('app.bypass_profile_immutability', 'on', true);

  UPDATE profiles
  SET tenant_id = NEW.id, role = 'contractor'
  WHERE id = NEW.owner_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_profile_field_immutability()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Trusted SECURITY DEFINER callers (link_owner_to_tenant for first tenant
  -- creation) set this flag locally. The `true` second arg on current_setting
  -- returns null instead of erroring when the flag isn't set.
  IF current_setting('app.bypass_profile_immutability', true) = 'on' THEN
    RETURN NEW;
  END IF;

  -- Edge functions / migrations use the service-role JWT — full write access.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Superadmins manage other users from the admin panel.
  IF my_role() = 'superadmin' THEN
    RETURN NEW;
  END IF;

  -- Everyone else: these fields are immutable from the client.
  IF OLD.id IS DISTINCT FROM NEW.id THEN
    RAISE EXCEPTION 'profiles.id is immutable';
  END IF;
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'profiles.role can only be changed by a superadmin';
  END IF;
  IF OLD.tenant_id IS DISTINCT FROM NEW.tenant_id THEN
    RAISE EXCEPTION 'profiles.tenant_id can only be changed by a superadmin';
  END IF;
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    RAISE EXCEPTION 'profiles.phone must be changed via the OTP enrollment flow';
  END IF;
  IF OLD.phone_verified IS DISTINCT FROM NEW.phone_verified THEN
    RAISE EXCEPTION 'profiles.phone_verified is server-managed';
  END IF;
  IF OLD.auth_method IS DISTINCT FROM NEW.auth_method THEN
    RAISE EXCEPTION 'profiles.auth_method is server-managed';
  END IF;

  RETURN NEW;
END;
$$;
