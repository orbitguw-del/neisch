-- Stamp use-based groups onto the 32 Garchuk materials.
-- Idempotent: re-running just re-sets the same values.

DO $$
DECLARE v_site uuid;
BEGIN
  SELECT s.id INTO v_site FROM public.sites s
  JOIN public.profiles p ON p.tenant_id = s.tenant_id AND p.role = 'contractor'
  WHERE p.full_name ILIKE '%pathak%' ORDER BY s.created_at DESC LIMIT 1;

  IF v_site IS NULL THEN
    SELECT id INTO v_site FROM public.sites WHERE name ILIKE '%garchuk%' ORDER BY created_at DESC LIMIT 1;
  END IF;

  IF v_site IS NULL THEN
    RAISE NOTICE 'No Garchuk site found.';
    RETURN;
  END IF;

  UPDATE public.materials SET material_group = 'Cement'      WHERE site_id = v_site AND name LIKE 'Cement%';
  UPDATE public.materials SET material_group = 'Steel'       WHERE site_id = v_site AND (name LIKE 'TMT bar / Rod%' OR name LIKE 'Binding wire%');
  UPDATE public.materials SET material_group = 'Aggregate'   WHERE site_id = v_site AND (name LIKE 'Aggregate%' OR name LIKE 'Sand%' OR name LIKE 'Stone dust%' OR name LIKE 'Brick chips%');
  UPDATE public.materials SET material_group = 'Masonry'     WHERE site_id = v_site AND (name LIKE 'Red bricks%' OR name LIKE 'Fly-ash bricks%' OR name LIKE 'Concrete blocks%' OR name LIKE 'AAC block%' OR name LIKE 'Jointing mortar%');
  UPDATE public.materials SET material_group = 'Electrical'  WHERE site_id = v_site AND (name LIKE 'Conduit pipe%' OR name LIKE 'Wire %');
  UPDATE public.materials SET material_group = 'Plumbing'    WHERE site_id = v_site AND (name LIKE 'PVC pipe%' OR name LIKE 'CPVC pipe%');
  UPDATE public.materials SET material_group = 'Finishing'   WHERE site_id = v_site AND (name LIKE 'White cement%' OR name LIKE 'Wall putty%' OR name LIKE 'POP%' OR name LIKE 'Primer%' OR name LIKE 'Emulsion paint%' OR name LIKE 'Waterproofing chemical%');
  UPDATE public.materials SET material_group = 'Site'        WHERE site_id = v_site AND (name = 'Diesel' OR name LIKE 'Water tanker%');

  RAISE NOTICE 'Grouped Garchuk materials by use.';
END $$;
