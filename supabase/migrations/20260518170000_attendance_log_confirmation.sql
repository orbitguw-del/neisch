-- ─── Migration: Confirmation layer for attendance & daily logs ────────────────
-- Supervisor work is now confirmed by the Site Manager. attendance and
-- daily_logs each get an approval_status: submitted → confirmed (+ rejected),
-- with confirmed_by / confirmed_at.
-- Existing rows are backfilled to 'confirmed' so historical payroll/reports
-- are unaffected; only NEW records start as 'submitted'.

-- ── attendance ────────────────────────────────────────────────────────────────
alter table attendance
  add column if not exists approval_status text not null default 'submitted',
  add column if not exists confirmed_by     uuid references profiles(id) on delete set null,
  add column if not exists confirmed_at     timestamptz;

alter table attendance drop constraint if exists attendance_approval_status_check;
alter table attendance add constraint attendance_approval_status_check
  check (approval_status in ('submitted', 'confirmed', 'rejected'));

-- backfill existing rows (all currently 'submitted' from the default)
update attendance set approval_status = 'confirmed' where approval_status = 'submitted';

create index if not exists attendance_approval_idx on attendance (site_id, date, approval_status);

-- ── daily_logs ────────────────────────────────────────────────────────────────
alter table daily_logs
  add column if not exists approval_status text not null default 'submitted',
  add column if not exists confirmed_by     uuid references profiles(id) on delete set null,
  add column if not exists confirmed_at     timestamptz;

alter table daily_logs drop constraint if exists daily_logs_approval_status_check;
alter table daily_logs add constraint daily_logs_approval_status_check
  check (approval_status in ('submitted', 'confirmed', 'rejected'));

update daily_logs set approval_status = 'confirmed' where approval_status = 'submitted';
