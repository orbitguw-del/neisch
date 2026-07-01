-- Reset passwords for all 4 demo users on the BuildNE tenant to a single
-- known value: Storey@Demo2026.
--
-- Only accounts with the hand-crafted aaaa-... UUIDs are touched — these are
-- the seeded demo profiles. Real Gmail accounts on the same tenant
-- (orbitguw@gmail.com — Karun; orbitdona@gmail.com — devraaj) are untouched.
--
-- Single shared password so Karun can switch between roles during a sales
-- demo without keeping four passwords in his head.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

UPDATE auth.users
   SET encrypted_password = extensions.crypt('Storey@Demo2026', extensions.gen_salt('bf'))
 WHERE id IN (
   'aaaaaaaa-0000-0000-0000-000000000002',  -- Rajiv Nath      · contractor    · rajiv@buildne.in
   'aaaaaaaa-0000-0000-0000-000000000003',  -- Pranab Gogoi    · site_manager  · pranab@buildne.in
   'aaaaaaaa-0000-0000-0000-000000000004',  -- Merina Devi     · supervisor    · merina@buildne.in
   'aaaaaaaa-0000-0000-0000-000000000005'   -- Biplab Das      · store_keeper  · biplab@buildne.in
 );

DO $$
DECLARE cnt int;
BEGIN
  SELECT count(*) INTO cnt FROM auth.users
   WHERE id IN (
     'aaaaaaaa-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000004',
     'aaaaaaaa-0000-0000-0000-000000000005'
   );
  RAISE NOTICE 'Reset % demo passwords to Storey@Demo2026', cnt;
END $$;
