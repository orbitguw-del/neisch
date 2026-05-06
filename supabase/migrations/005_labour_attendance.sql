-- ─── Migration 005: Enhanced workers + daily attendance ──────────────────────
-- Adds ID proof, vendor/direct employment, and per-worker daily attendance.

-- 1. Alter workers table — add new columns (safe: all nullable with defaults)
alter table workers
  add column if not exists employment_type  text not null default 'direct',   -- direct | vendor
  add column if not exists vendor_name      text,
  add column if not exists id_proof_type    text,   -- aadhaar | pan | voter_id | driving_licence | other
  add column if not exists id_proof_number  text,
  add column if not exists address          text,
  add column if not exists emergency_contact text,
  add column if not exists updated_at       timestamptz not null default now();

-- Enforce employment_type values
alter table workers
  drop constraint if exists workers_employment_type_check;
alter table workers
  add constraint workers_employment_type_check
  check (employment_type in ('direct', 'vendor'));

-- updated_at trigger for workers
drop trigger if exists workers_updated_at on workers;
create trigger workers_updated_at
  before update on workers
  for each row execute procedure set_updated_at();

-- 2. Create attendance table
create table if not exists attendance (
  id           uuid primary key default uuid_generate_v4(),
  worker_id    uuid not null references workers(id) on delete cascade,
  site_id      uuid not null references sites(id)   on delete cascade,
  tenant_id    uuid not null references tenants(id)  on delete cascade,
  date         date not null default current_date,
  status       text not null default 'present',   -- present | absent | half_day | paid_leave
  notes        text,
  marked_by    uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- One record per worker per day per site
  unique (worker_id, date)
);

-- Enforce status values
alter table attendance
  drop constraint if exists attendance_status_check;
alter table attendance
  add constraint attendance_status_check
  check (status in ('present', 'absent', 'half_day', 'paid_leave'));

-- updated_at trigger
drop trigger if exists attendance_updated_at on attendance;
create trigger attendance_updated_at
  before update on attendance
  for each row execute procedure set_updated_at();

-- 3. RLS
alter table attendance enable row level security;

create policy "attendance_select" on attendance
  for select using (tenant_id = my_tenant_id());

create policy "attendance_insert" on attendance
  for insert with check (tenant_id = my_tenant_id());

create policy "attendance_update" on attendance
  for update using (tenant_id = my_tenant_id());

create policy "attendance_delete" on attendance
  for delete using (tenant_id = my_tenant_id());

-- 4. Index for fast daily roster lookups
create index if not exists attendance_site_date_idx on attendance (site_id, date);
create index if not exists attendance_worker_date_idx on attendance (worker_id, date);
create index if not exists workers_site_idx on workers (site_id, status);
create index if not exists workers_tenant_idx on workers (tenant_id);
