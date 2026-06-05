-- Add Invoice Number + Invoice Date to material_receipts, parallel to LR + Challan.
--
-- Use case: when the supplier issues a tax invoice that's separate from the
-- delivery challan (common with cement/steel suppliers), the contractor now
-- has a place to record it. Useful for GST reconciliation when the contractor
-- starts billing.
--
-- Both fields nullable — invoice is optional like LR and Challan.

alter table public.material_receipts
  add column if not exists invoice_number text,
  add column if not exists invoice_date   date;

comment on column public.material_receipts.invoice_number is
  'Supplier tax invoice number (separate from LR and challan). Optional.';
comment on column public.material_receipts.invoice_date is
  'Date on the supplier tax invoice. Optional.';
