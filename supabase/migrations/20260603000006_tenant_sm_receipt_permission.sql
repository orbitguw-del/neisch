ALTER TABLE public.tenants
  ADD COLUMN sm_can_create_receipts boolean NOT NULL DEFAULT true;
