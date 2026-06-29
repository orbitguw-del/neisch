-- Add unit_weight_kg to materials. Enables kg<->pieces conversion
-- for steel rods and any other material where the contractor wants
-- to track both weight and count.
--
-- Source for TMT defaults: IS 1786 (Indian Standard for High Strength
-- Deformed Steel Bars). Formula: 0.006165 * d^2 kg/m * 12m length.
-- Real bars vary +-2-5% per IS 1786 tolerance bands — which is
-- exactly why variance tracking matters.
--
-- Nullable: the field only activates when set. Materials without a
-- weight keep working as before (no conversion).

ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS unit_weight_kg numeric(8, 3);

COMMENT ON COLUMN public.materials.unit_weight_kg IS
  'Weight in kg per single piece. Enables auto kg<->pcs conversion. For TMT rods: use IS 1786 standard (e.g. 12mm @ 12m = 10.66 kg). Contractor can edit per their supplier.';

-- Seed Garchuk TMT rods with IS 1786 x 12m defaults. Idempotent.
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
    RAISE NOTICE 'No Garchuk site found — TMT weights not seeded.';
    RETURN;
  END IF;

  UPDATE public.materials SET unit_weight_kg = 4.74  WHERE site_id = v_site AND name = 'TMT bar / Rod 8mm';
  UPDATE public.materials SET unit_weight_kg = 7.40  WHERE site_id = v_site AND name = 'TMT bar / Rod 10mm';
  UPDATE public.materials SET unit_weight_kg = 10.66 WHERE site_id = v_site AND name = 'TMT bar / Rod 12mm';
  UPDATE public.materials SET unit_weight_kg = 18.96 WHERE site_id = v_site AND name = 'TMT bar / Rod 16mm';
  UPDATE public.materials SET unit_weight_kg = 29.61 WHERE site_id = v_site AND name = 'TMT bar / Rod 20mm';

  RAISE NOTICE 'Seeded TMT unit weights (IS 1786 x 12m) at Garchuk.';
END $$;
