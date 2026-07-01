-- Diagnostic: list all users on the BuildNE demo tenant (all roles) with
-- their emails, so we can reset every demo login and document them.

DO $$
DECLARE r RECORD;
BEGIN
  RAISE NOTICE '=== All profiles on BuildNE tenant ===';
  FOR r IN
    SELECT
      p.id                  AS profile_id,
      p.full_name,
      p.role,
      u.email               AS auth_email,
      u.phone               AS auth_phone,
      u.last_sign_in_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE p.tenant_id = 'bbbbbbbb-0000-0000-0000-000000000001'
    ORDER BY
      CASE p.role
        WHEN 'contractor'    THEN 1
        WHEN 'site_manager'  THEN 2
        WHEN 'supervisor'    THEN 3
        WHEN 'store_keeper'  THEN 4
        ELSE 5 END,
      p.full_name
  LOOP
    RAISE NOTICE 'role=% | name=% | email=% | phone=% | last_login=% | profile_id=%',
      r.role, r.full_name,
      COALESCE(r.auth_email, 'NULL'),
      COALESCE(r.auth_phone, 'NULL'),
      COALESCE(r.last_sign_in_at::text, 'never'),
      r.profile_id;
  END LOOP;
END $$;
