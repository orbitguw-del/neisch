-- ─── Migration: Material Transfer — 4-stage lifecycle ─────────────────────────
-- Old flow: pending → confirmed (2 stages).
-- New flow: initiated → prepared → approved → received  (+ rejected).
--   initiated — Store Keeper / Site Manager raises the request
--   prepared  — from-site Supervisor fills dispatch detail & confirms (stock OUT)
--   approved  — Store Keeper / Site Manager signs off
--   received  — receiving site accepts (stock IN)
-- Every stage stamps who + when — a built-in activity trail.

-- 1. New stage columns (initiated_by / confirmed_by already exist).
alter table material_transfers
  add column if not exists prepared_by  uuid references profiles(id) on delete set null,
  add column if not exists prepared_at  timestamptz,
  add column if not exists approved_by  uuid references profiles(id) on delete set null,
  add column if not exists approved_at  timestamptz,
  add column if not exists received_by  uuid references profiles(id) on delete set null,
  add column if not exists received_at  timestamptz;

-- 2. Drop the old status constraint FIRST, so the data migration can run.
alter table material_transfers drop constraint if exists material_transfers_status_check;

-- 3. Migrate existing rows to the new status vocabulary.
update material_transfers
   set received_by = confirmed_by, received_at = confirmed_at
 where status = 'confirmed' and received_at is null;
update material_transfers set status = 'received'  where status = 'confirmed';
update material_transfers set status = 'initiated' where status = 'pending';

-- 4. Add the new status check constraint.
alter table material_transfers add constraint material_transfers_status_check
  check (status in ('initiated', 'prepared', 'approved', 'received', 'rejected'));

alter table material_transfers alter column status set default 'initiated';

create index if not exists material_transfers_status_idx
  on material_transfers (tenant_id, status);
