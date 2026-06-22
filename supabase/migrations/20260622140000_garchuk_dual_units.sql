-- Garchuk: show both cft and cubic-meter units for volume materials so John
-- can record measurements in whichever unit the supplier uses.

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

  UPDATE public.materials SET unit = 'cft / cum'
   WHERE site_id = v_site
     AND unit = 'cft';

  RAISE NOTICE 'Set dual units (cft / cum) on volume materials.';
END $$;
