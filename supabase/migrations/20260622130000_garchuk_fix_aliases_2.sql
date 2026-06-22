-- Fix language: Karun's corrections 2026-06-22.
--  binding wire = Bandha tar (not just Tar)
--  water tanker = Pani tanki (not just Paani)
--  diesel       = just "Diesel" (no Tel — confusing)
--  bricks       = just "Red bricks" / "Fly-ash bricks" (English is fine)

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

  UPDATE public.materials SET name = 'Binding wire / Bandha tar' WHERE site_id = v_site AND name = 'Binding wire / Tar';
  UPDATE public.materials SET name = 'Water tanker / Pani tanki' WHERE site_id = v_site AND name = 'Water tanker / Paani';
  UPDATE public.materials SET name = 'Diesel'                    WHERE site_id = v_site AND name = 'Diesel / Tel';
  UPDATE public.materials SET name = 'Red bricks'                WHERE site_id = v_site AND name = 'Bricks / Eint';
  UPDATE public.materials SET name = 'Fly-ash bricks'            WHERE site_id = v_site AND name = 'Fly-ash bricks / Eint';

  RAISE NOTICE 'Updated 5 material aliases per Karun.';
END $$;
