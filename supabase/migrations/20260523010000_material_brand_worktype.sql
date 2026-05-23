-- 20260523010000_material_brand_worktype.sql
--
-- Adds brand (nullable, free text) and work_type (nullable, enum)
-- to the materials table.
--
-- brand: manufacturer / supplier brand. NULL = "Generic".
-- work_type: which trade this material belongs to — used for filtering
--   and grouping in inventory, reports, and the opening-stock upload.

alter table materials
  add column if not exists brand     text,
  add column if not exists work_type text
    check (work_type in (
      'civil', 'painting', 'interior', 'electrical',
      'plumbing', 'finishing', 'fabrication', 'other'
    ));
