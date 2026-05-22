-- ─── Migration 010: Performance Indexes ───────────────────────────────────────
-- Adds indexes on columns hit by RLS policies on every query, plus unindexed
-- foreign keys (Postgres does NOT auto-index FKs). From the DB performance review.
-- Run in Supabase SQL Editor. Safe to re-run — all use IF NOT EXISTS.
--
-- NOTE: at current data volume plain CREATE INDEX is fine (sub-second, brief
-- lock). On large tables later, prefer CREATE INDEX CONCURRENTLY (cannot run
-- inside a transaction block).

-- ── 1. site_assignments — RLS sub-select runs on almost every SELECT ──────────
-- Policies do: site_id IN (SELECT site_id FROM site_assignments WHERE profile_id = auth.uid())
-- The unique(site_id, profile_id) index leads with site_id, so a profile_id-only
-- lookup cannot use it.
CREATE INDEX IF NOT EXISTS site_assignments_profile_idx
  ON site_assignments (profile_id);

-- ── 2. tenant_id on hot tables — RLS filters tenant_id = my_tenant_id() ───────
CREATE INDEX IF NOT EXISTS sites_tenant_idx
  ON sites (tenant_id);
CREATE INDEX IF NOT EXISTS materials_tenant_idx
  ON materials (tenant_id);
CREATE INDEX IF NOT EXISTS daily_logs_tenant_idx
  ON daily_logs (tenant_id);
CREATE INDEX IF NOT EXISTS profiles_tenant_idx
  ON profiles (tenant_id);

-- ── 3. tenants.owner_id — policies check owner_id = auth.uid() ────────────────
CREATE INDEX IF NOT EXISTS tenants_owner_idx
  ON tenants (owner_id);

-- ── 4. Unindexed foreign keys — speeds joins and ON DELETE CASCADE ────────────
-- materials / daily_logs site_id
CREATE INDEX IF NOT EXISTS materials_site_idx
  ON materials (site_id);
CREATE INDEX IF NOT EXISTS daily_logs_site_idx
  ON daily_logs (site_id);

-- budget_lines
CREATE INDEX IF NOT EXISTS budget_lines_site_idx
  ON budget_lines (site_id);
CREATE INDEX IF NOT EXISTS budget_lines_material_idx
  ON budget_lines (material_id);
CREATE INDEX IF NOT EXISTS budget_lines_tenant_idx
  ON budget_lines (tenant_id);

-- material_transactions site_id (material_id already indexed in 004)
CREATE INDEX IF NOT EXISTS material_txn_site_idx
  ON material_transactions (site_id);

-- material_receipts foreign keys
CREATE INDEX IF NOT EXISTS material_receipts_site_idx
  ON material_receipts (site_id);
CREATE INDEX IF NOT EXISTS material_receipts_material_idx
  ON material_receipts (material_id);

-- material_transfers foreign keys
CREATE INDEX IF NOT EXISTS material_transfers_from_site_idx
  ON material_transfers (from_site_id);
CREATE INDEX IF NOT EXISTS material_transfers_to_site_idx
  ON material_transfers (to_site_id);
CREATE INDEX IF NOT EXISTS material_transfers_material_idx
  ON material_transfers (material_id);

-- material_allocations foreign keys
CREATE INDEX IF NOT EXISTS material_allocations_site_idx
  ON material_allocations (site_id);
CREATE INDEX IF NOT EXISTS material_allocations_material_idx
  ON material_allocations (material_id);

-- ── 5. phone_verifications — OTP rate-limit lookups ───────────────────────────
CREATE INDEX IF NOT EXISTS phone_verifications_user_created_idx
  ON phone_verifications (user_id, created_at DESC);

-- ── 6. Refresh planner statistics ─────────────────────────────────────────────
ANALYZE;
