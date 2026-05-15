-- Closes a privilege-escalation hole.
--
-- The profiles_update RLS policy in 001_roles_permissions.sql allows a user to
-- update their own row, but doesn't restrict WHICH columns they can change.
-- That means any signed-in user could run, from the browser console:
--
--   UPDATE profiles SET role = 'superadmin' WHERE id = auth.uid();
--   UPDATE profiles SET tenant_id = '<other-tenant>' WHERE id = auth.uid();
--   UPDATE profiles SET phone = '<their-phone>', phone_verified = true WHERE id = auth.uid();
--
-- A BEFORE UPDATE trigger enforces field immutability against PostgREST callers.
-- Service-role callers (edge functions, migrations) and superadmins bypass.

CREATE OR REPLACE FUNCTION enforce_profile_field_immutability()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Edge functions use the service-role JWT — they need full write access.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Superadmins manage other users from the admin panel — let them through.
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

DROP TRIGGER IF EXISTS profiles_enforce_field_immutability ON profiles;
CREATE TRIGGER profiles_enforce_field_immutability
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_profile_field_immutability();
