-- Garchuk site: show both English and local names side-by-side so John
-- finds materials whether he searches "rod" or "TMT", "gitti" or "aggregate".

DO $$
DECLARE
  v_site uuid;
  v_site_name text;
BEGIN
  SELECT s.id, s.name INTO v_site, v_site_name
  FROM public.sites s
  JOIN public.profiles p ON p.tenant_id = s.tenant_id AND p.role = 'contractor'
  WHERE p.full_name ILIKE '%pathak%'
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_site IS NULL THEN
    SELECT id, name INTO v_site, v_site_name
    FROM public.sites
    WHERE name ILIKE '%garchuk%'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF v_site IS NULL THEN
    RAISE NOTICE 'No Garchuk / Pathak site found — nothing renamed.';
    RETURN;
  END IF;

  UPDATE public.materials SET name = 'TMT bar / Rod 8mm'   WHERE site_id = v_site AND lower(name) = lower('TMT 8mm');
  UPDATE public.materials SET name = 'TMT bar / Rod 10mm'  WHERE site_id = v_site AND lower(name) = lower('TMT 10mm');
  UPDATE public.materials SET name = 'TMT bar / Rod 12mm'  WHERE site_id = v_site AND lower(name) = lower('TMT 12mm');
  UPDATE public.materials SET name = 'TMT bar / Rod 16mm'  WHERE site_id = v_site AND lower(name) = lower('TMT 16mm');
  UPDATE public.materials SET name = 'TMT bar / Rod 20mm'  WHERE site_id = v_site AND lower(name) = lower('TMT 20mm');
  UPDATE public.materials SET name = 'Aggregate / Gitti 1/2 inch (10mm)' WHERE site_id = v_site AND lower(name) = lower('Stone aggregate 10mm');
  UPDATE public.materials SET name = 'Aggregate / Gitti 3/4 inch (20mm)' WHERE site_id = v_site AND lower(name) = lower('Stone aggregate 20mm');
  UPDATE public.materials SET name = 'Sand / Balu'         WHERE site_id = v_site AND lower(name) = lower('River sand');
  UPDATE public.materials SET name = 'Cement / Cement OPC 53'   WHERE site_id = v_site AND lower(name) = lower('OPC 53 Grade Cement');
  UPDATE public.materials SET name = 'Cement PPC'              WHERE site_id = v_site AND lower(name) = lower('PPC Cement');
  UPDATE public.materials SET name = 'Stone dust / Patharer guri'  WHERE site_id = v_site AND lower(name) = lower('Stone dust');
  UPDATE public.materials SET name = 'Bricks / Eint'           WHERE site_id = v_site AND lower(name) = lower('Red bricks');
  UPDATE public.materials SET name = 'Fly-ash bricks / Eint'   WHERE site_id = v_site AND lower(name) = lower('Fly-ash bricks');
  UPDATE public.materials SET name = 'Brick chips / Bati'      WHERE site_id = v_site AND lower(name) = lower('Brick chips');
  UPDATE public.materials SET name = 'AAC block 5 inch / Block' WHERE site_id = v_site AND lower(name) = lower('AAC block 5 inch');
  UPDATE public.materials SET name = 'Binding wire / Tar'      WHERE site_id = v_site AND lower(name) = lower('Binding wire');
  UPDATE public.materials SET name = 'Diesel / Tel'            WHERE site_id = v_site AND lower(name) = lower('Diesel');
  UPDATE public.materials SET name = 'Water tanker / Paani'    WHERE site_id = v_site AND lower(name) = lower('Water tanker');

  RAISE NOTICE 'Renamed materials with bilingual aliases at site % (id=%).', v_site_name, v_site;
END $$;
