-- ─── Migration: Site Expenses ────────────────────────────────────────────────
-- General site-level cash/expense recording (fuel, transport, food, rentals,
-- repairs, advances, misc). Supervisors and above can log an expense; it starts
-- as 'pending' and must be approved by a site manager / contractor before it
-- counts in financial reports.

create table if not exists site_expenses (
  id           uuid primary key default uuid_generate_v4(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  site_id      uuid not null references sites(id)   on delete cascade,
  expense_date date not null default current_date,
  category     text not null,            -- see app-side category list
  amount       numeric(12, 2) not null check (amount > 0),
  paid_by      text,                     -- free text, e.g. "Cash — Karun"
  note         text,
  status       text not null default 'pending',  -- pending | approved | rejected
  created_by   uuid references profiles(id) on delete set null,
  approved_by  uuid references profiles(id) on delete set null,
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table site_expenses
  drop constraint if exists site_expenses_status_check;
alter table site_expenses
  add constraint site_expenses_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- updated_at trigger
drop trigger if exists site_expenses_updated_at on site_expenses;
create trigger site_expenses_updated_at
  before update on site_expenses
  for each row execute procedure set_updated_at();

-- Indexes for the common report queries
create index if not exists site_expenses_site_date_idx
  on site_expenses (site_id, expense_date);
create index if not exists site_expenses_tenant_status_idx
  on site_expenses (tenant_id, status);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table site_expenses enable row level security;
grant all on site_expenses to anon, authenticated, service_role;

-- SELECT: anyone in the tenant can see their tenant's expenses
create policy "site_expenses_select" on site_expenses
  for select using (tenant_id = my_tenant_id());

-- INSERT: supervisor and above may log an expense for their tenant
create policy "site_expenses_insert" on site_expenses
  for insert with check (
    tenant_id = my_tenant_id()
    and my_role() in ('superadmin', 'contractor', 'site_manager', 'supervisor')
  );

-- UPDATE: only site_manager / contractor / superadmin may modify
-- (this is the approve / reject action)
create policy "site_expenses_update" on site_expenses
  for update using (
    tenant_id = my_tenant_id()
    and my_role() in ('superadmin', 'contractor', 'site_manager')
  );

-- DELETE: contractor / superadmin only
create policy "site_expenses_delete" on site_expenses
  for delete using (
    tenant_id = my_tenant_id()
    and my_role() in ('superadmin', 'contractor')
  );
