-- Add a use-based grouping column to materials (Cement, Steel, Aggregate, etc.)
-- Separate from existing `category` (consumable/equipment) which drives
-- equipment-tracking logic.

ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS material_group text;

COMMENT ON COLUMN public.materials.material_group IS
  'Use-based grouping shown on the materials list (e.g. Cement, Steel, Aggregate, Masonry, Electrical, Plumbing, Finishing, Site). Free text, nullable.';

CREATE INDEX IF NOT EXISTS materials_site_group_idx
  ON public.materials (site_id, material_group);
