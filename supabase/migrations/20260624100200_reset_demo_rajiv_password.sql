-- Reset the DEMO Rajiv Nath account password to a known value so Karun
-- can sign in and share credentials for sales demos.
--
-- Only the demo account (fake UUID aaaaaaaa-...) is affected.
-- The real Karun account (orbitguw@gmail.com) on the same tenant is untouched.
--
-- Password set to: RajivDemo@2026

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

UPDATE auth.users
   SET encrypted_password = extensions.crypt('RajivDemo@2026', extensions.gen_salt('bf'))
 WHERE id    = 'aaaaaaaa-0000-0000-0000-000000000002'
   AND email = 'rajiv@buildne.in';

DO $$
DECLARE r auth.users;
BEGIN
  SELECT * INTO r FROM auth.users WHERE id = 'aaaaaaaa-0000-0000-0000-000000000002';
  IF r.id IS NULL THEN
    RAISE NOTICE 'Demo Rajiv user not found — nothing changed.';
  ELSE
    RAISE NOTICE 'Password reset OK for % (id=%). New password: RajivDemo@2026',
      r.email, r.id;
  END IF;
END $$;
