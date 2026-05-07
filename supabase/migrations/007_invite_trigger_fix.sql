-- ── Fix handle_new_user trigger to correctly set role/tenant for invited users ─
-- Run this in Supabase SQL editor or via migration.
--
-- When a user signs up via an invite (either magic-link or code-based),
-- their user_metadata contains invited_role, tenant_id, and site_id.
-- This trigger reads those values and sets the profile + site_assignment correctly.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invited_role  text;
  _tenant_id     uuid;
  _site_id       uuid;
BEGIN
  -- Pull invite metadata if present
  _invited_role := NEW.raw_user_meta_data ->> 'invited_role';
  _tenant_id    := (NEW.raw_user_meta_data ->> 'tenant_id')::uuid;
  _site_id      := (NEW.raw_user_meta_data ->> 'site_id')::uuid;

  -- Insert profile, picking up invited role/tenant when available
  INSERT INTO public.profiles (id, email, full_name, role, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(_invited_role, 'contractor'),   -- default to contractor for self-sign-ups
    _tenant_id                               -- NULL for contractors (they create their own tenant)
  )
  ON CONFLICT (id) DO UPDATE
    SET
      email      = EXCLUDED.email,
      full_name  = COALESCE(EXCLUDED.full_name, profiles.full_name),
      role       = COALESCE(EXCLUDED.role, profiles.role),
      tenant_id  = COALESCE(EXCLUDED.tenant_id, profiles.tenant_id);

  -- Create site assignment when invited to a specific site
  IF _site_id IS NOT NULL AND _tenant_id IS NOT NULL AND _invited_role IS NOT NULL THEN
    INSERT INTO public.site_assignments (site_id, profile_id, tenant_id, role)
    VALUES (_site_id, NEW.id, _tenant_id, _invited_role)
    ON CONFLICT (site_id, profile_id) DO UPDATE
      SET role = EXCLUDED.role;
  END IF;

  RETURN NEW;
END;
$$;

-- Re-attach trigger (drop + create is idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
