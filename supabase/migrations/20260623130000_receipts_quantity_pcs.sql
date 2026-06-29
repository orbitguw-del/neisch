-- Phase 3 of rod variance: dual-unit recording at receipt time.
--
-- Adds quantity_pcs (order) and quantity_received_pcs (confirm) columns
-- to material_receipts. Both nullable — only populated for materials
-- with unit_weight_kg set (e.g. TMT rods). Existing receipts unaffected.
--
-- Why both columns: the variance feature compares ordered vs received
-- in pcs AND kg. Storing the piece count explicitly avoids drift if
-- unit_weight_kg changes later.

ALTER TABLE public.material_receipts
  ADD COLUMN IF NOT EXISTS quantity_pcs           numeric(12, 2),
  ADD COLUMN IF NOT EXISTS quantity_received_pcs  numeric(12, 2);

COMMENT ON COLUMN public.material_receipts.quantity_pcs IS
  'Piece count at order time for dual-unit materials (e.g. TMT rods). When set, quantity (kg) and quantity_pcs both hold the same delivery expressed in two units.';

COMMENT ON COLUMN public.material_receipts.quantity_received_pcs IS
  'Piece count at confirmation time. Allows variance reporting: (ordered_pcs - received_pcs) and (ordered_kg - received_kg) computed independently.';
