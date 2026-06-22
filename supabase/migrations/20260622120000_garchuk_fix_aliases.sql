-- Fix language: Karun confirmed Assamese (Garchuk site).
-- Sand = "Bali" in Assamese (বালি), not "Balu" (Hindi).

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

  UPDATE public.materials SET name = 'Sand / Bali' WHERE site_id = v_site AND name = 'Sand / Balu';
  RAISE NOTICE 'Fixed sand alias to Bali (Assamese).';
END $$;
