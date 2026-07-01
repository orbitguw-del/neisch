-- Diagnostic ONLY — no writes. Get email addresses for both Rajiv profiles
-- from auth.users so we know which login belongs to which profile.

DO $$
DECLARE r RECORD;
BEGIN
  RAISE NOTICE '=== Auth users for both Rajiv profiles ===';
  FOR r IN
    SELECT
      p.id                             AS profile_id,
      p.full_name,
      p.tenant_id,
      u.email                          AS auth_email,
      u.phone                          AS auth_phone,
      u.email_confirmed_at,
      u.last_sign_in_at,
      u.created_at                     AS auth_created_at,
      u.raw_user_meta_data->>'full_name' AS meta_name
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE p.id IN (
      '2f2e32de-31f6-4380-960a-46101220f3c7',
      'aaaaaaaa-0000-0000-0000-000000000002'
    )
  LOOP
    RAISE NOTICE 'profile_id=% | full_name=% | email=% | phone=% | confirmed=% | last_sign_in=% | auth_created=%',
      r.profile_id, r.full_name, COALESCE(r.auth_email, 'NULL'),
      COALESCE(r.auth_phone, 'NULL'),
      COALESCE(r.email_confirmed_at::text, 'NULL'),
      COALESCE(r.last_sign_in_at::text, 'never'),
      COALESCE(r.auth_created_at::text, 'NULL');
  END LOOP;
END $$;
