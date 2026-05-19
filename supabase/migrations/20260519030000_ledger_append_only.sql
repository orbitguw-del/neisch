-- ─── Migration: material ledger is append-only ───────────────────────────────
-- RLS-AUDIT-2026-05-19 finding #4. material_transactions is the audit trail of
-- every stock movement. An audit trail must never be edited or deleted — a
-- posted entry stands forever. Corrections are posted as NEW 'adjustment'
-- transactions, not by altering history.
--
-- Today there is no UPDATE policy (good — already immutable to edits) but a
-- DELETE policy lets a contractor/superadmin remove ledger rows. Remove it:
-- the ledger becomes strictly append-only.
--
-- NOTE: 'adjustment' transactions (physical-count corrections) should require
-- Contractor sign-off — that approval workflow is tracked separately on the
-- TODO; this migration only makes the ledger itself tamper-proof.

drop policy if exists "txn_delete" on material_transactions;

-- material_transactions now has SELECT + INSERT policies only:
-- no UPDATE, no DELETE — a posted transaction is permanent.
