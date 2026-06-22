-- One-off data seed: pre-load 29 standard construction materials into
-- John Pathak's Garchuk site so he doesn't have to type them on-site.
--
-- Idempotent: re-running this migration inserts nothing the second time.
-- If no matching site is found (e.g. data was reset), the migration logs
-- a NOTICE and exits cleanly without failing the push.
--
-- Built 2026-06-21 as pilot-support work for the Garchuk live site.

DO $$
DECLARE
  v_tenant uuid;
  v_site uuid;
  v_site_name text;
  v_inserted int;
BEGIN
  -- 1. Find John Pathak's site. Try by contractor name, then by site name.
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

  RAISE NOTICE 'Seeding materials into site: % (id=%)', v_site_name, v_site;

  -- 2. Insert each material only if it does not already exist (case-insensitive).
  WITH seed (name, unit) AS (VALUES
    ('OPC 53 Grade Cement',        'bags'),
    ('PPC Cement',                 'bags'),
    ('TMT 8mm',                    'kg'),
    ('TMT 10mm',                   'kg'),
    ('TMT 12mm',                   'kg'),
    ('TMT 16mm',                   'kg'),
    ('TMT 20mm',                   'kg'),
    ('Binding wire',               'kg'),
    ('River sand',                 'cft'),
    ('Stone aggregate 10mm',       'cft'),
    ('Stone aggregate 20mm',       'cft'),
    ('Brick chips',                'cft'),
    ('Red bricks',                 'nos'),
    ('Fly-ash bricks',             'nos'),
    ('Concrete blocks 6"',         'nos'),
    ('Conduit pipe 25mm',          'm'),
    ('Wire 1.5 sqmm',              'm'),
    ('Wire 2.5 sqmm',              'm'),
    ('PVC pipe 1/2"',              'm'),
    ('PVC pipe 1"',                'm'),
    ('CPVC pipe 1/2"',             'm'),
    ('White cement',               'kg'),
    ('Wall putty',                 'kg'),
    ('Primer',                     'litres'),
    ('Emulsion paint (interior)',  'litres'),
    ('POP',                        'bags'),
    ('Waterproofing chemical',     'kg'),
    ('Diesel',                     'litres'),
    ('Water tanker',               'trips')
  )
  INSERT INTO public.materials (site_id, tenant_id, name, unit)
  SELECT v_site, v_tenant, s.name, s.unit
  FROM seed s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.materials m
    WHERE m.site_id = v_site AND lower(m.name) = lower(s.name)
  );

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Inserted % new materials (existing duplicates skipped).', v_inserted;
END $$;
