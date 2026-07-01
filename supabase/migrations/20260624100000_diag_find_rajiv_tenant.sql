-- Diagnostic ONLY — no writes. Finds Rajiv Nath / BuildNE tenant + profile
-- and logs details via NOTICE so we can retrieve credentials info.

DO $$
DECLARE
  r_tenant RECORD;
  r_profile RECORD;
  cnt int;
BEGIN
  RAISE NOTICE '=== Tenants matching Rajiv / BuildNE ===';
  FOR r_tenant IN
    SELECT id, name, created_at
    FROM public.tenants
    WHERE name ILIKE '%buildne%' OR name ILIKE '%rajiv%'
    ORDER BY created_at DESC
  LOOP
    RAISE NOTICE 'Tenant: % | id=% | created=%', r_tenant.name, r_tenant.id, r_tenant.created_at;
  END LOOP;

  RAISE NOTICE '=== Profiles matching Rajiv / Nath ===';
  FOR r_profile IN
    SELECT p.id, p.full_name, p.role, p.tenant_id, p.created_at, t.name AS tenant_name
    FROM public.profiles p
    LEFT JOIN public.tenants t ON t.id = p.tenant_id
    WHERE p.full_name ILIKE '%rajiv%' OR p.full_name ILIKE '%nath%'
    ORDER BY p.created_at DESC
  LOOP
    RAISE NOTICE 'Profile: % | role=% | id=% | tenant=% (%)',
      r_profile.full_name, r_profile.role, r_profile.id,
      COALESCE(r_profile.tenant_name, 'NULL'), COALESCE(r_profile.tenant_id::text, 'NULL');
  END LOOP;

  SELECT count(*) INTO cnt FROM public.tenants WHERE name ILIKE '%buildne%' OR name ILIKE '%rajiv%';
  RAISE NOTICE '=== Total tenants matched: % ===', cnt;
END $$;
