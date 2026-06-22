-- Garchuk site: add 3 more materials John actually uses
-- (stone dust, AAC block 5", jointing mortar) per Karun 2026-06-22.
-- Idempotent — NOT EXISTS check skips duplicates.

DO $$
DECLARE
  v_tenant uuid;
  v_site uuid;
  v_site_name text;
  v_inserted int;
BEGIN
  SELECT s.id, s.tenant_id, s.name INTO v_site, v_tenant, v_site_name
  FROM public.sites s
  JOIN public.profiles p ON p.tenant_id = s.tenant_id AND p.role = 'contractor'
  WHERE p.full_name ILIKE '%pathak%'
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_site IS NULL THEN
    SELECT s.id, s.tenant_id, s.name INTO v_site, v_tenant, v_site_name
    FROM public.sites s
    WHERE s.name ILIKE '%garchuk%'
    ORDER BY s.created_at DESC
    LIMIT 1;
  END IF;

  IF v_site IS NULL THEN
    RAISE NOTICE 'No Garchuk / Pathak site found — nothing seeded.';
    RETURN;
  END IF;

  WITH seed (name, unit) AS (VALUES
    ('Stone dust',          'cft'),
    ('AAC block 5 inch',    'nos'),
    ('Jointing mortar',     'bags')
  )
  INSERT INTO public.materials (site_id, tenant_id, name, unit)
  SELECT v_site, v_tenant, s.name, s.unit
  FROM seed s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.materials m
    WHERE m.site_id = v_site AND lower(m.name) = lower(s.name)
  );

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Added % new materials to % (id=%).', v_inserted, v_site_name, v_site;
END $$;
