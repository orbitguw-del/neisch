-- Privacy / compliance hardening: store only the last 4 digits of worker ID proof.
--
-- Storing full Aadhaar / PAN numbers in plain text is a significant risk under
-- the Aadhaar Act and India's DPDP Act 2023. Going forward the app collects
-- only the last 4 digits. This migration:
--   1. Masks every existing id_proof_number to its last 4 characters.
--   2. Adds a CHECK constraint so no value longer than 4 chars can be stored again.

-- 1. Mask existing data (irreversible — full numbers are intentionally discarded).
UPDATE workers
SET id_proof_number = RIGHT(id_proof_number, 4)
WHERE id_proof_number IS NOT NULL
  AND LENGTH(id_proof_number) > 4;

-- 2. Enforce the 4-digit cap at the database level (defence in depth — the
--    client form already restricts input to 4 numeric digits).
ALTER TABLE workers
  DROP CONSTRAINT IF EXISTS workers_id_proof_number_last4_check;
ALTER TABLE workers
  ADD CONSTRAINT workers_id_proof_number_last4_check
  CHECK (id_proof_number IS NULL OR LENGTH(id_proof_number) <= 4);
