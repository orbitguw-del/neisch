-- ─── Migration: enforce material-transfer stage transitions ───────────────────
-- RLS-AUDIT-2026-05-19 finding #2. RLS lets any allowed role update a transfer,
-- so a supervisor could jump it straight to 'received', skipping approval.
-- This BEFORE UPDATE trigger enforces the legal lifecycle and keeps the
-- approval step manager-only.
--
-- Legal flow:  initiated → prepared → approved → received
--              initiated / prepared / approved → rejected
--              received, rejected = terminal

CREATE OR REPLACE FUNCTION public.enforce_transfer_stage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;   -- non-status edit, ignore

  -- Legal transitions only — no stage-skipping, no reviving a terminal transfer.
  IF NOT (
       (OLD.status = 'initiated' AND NEW.status IN ('prepared', 'rejected'))
    OR (OLD.status = 'prepared'  AND NEW.status IN ('approved', 'rejected'))
    OR (OLD.status = 'approved'  AND NEW.status IN ('received', 'rejected'))
  ) THEN
    RAISE EXCEPTION 'Illegal transfer transition: % -> %', OLD.status, NEW.status;
  END IF;

  -- The approval gate is manager-only — a supervisor may dispatch and receive,
  -- but not approve.
  IF NEW.status = 'approved'
     AND public.my_role() NOT IN ('superadmin', 'contractor', 'site_manager', 'store_keeper') THEN
    RAISE EXCEPTION 'Only a Site Manager or Store Keeper can approve a transfer';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transfer_stage_guard ON public.material_transfers;
CREATE TRIGGER transfer_stage_guard
  BEFORE UPDATE ON public.material_transfers
  FOR EACH ROW EXECUTE FUNCTION public.enforce_transfer_stage();
