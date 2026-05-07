-- ─── Migration 006: Budget Lines (per-site, per-material budgets) ─────────────
-- Enables Budget vs Actual reporting in the Reports module.

create table if not exists budget_lines (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  site_id             uuid not null references sites(id)   on delete cascade,
  material_id         uuid not null references materials(id) on delete cascade,
  budgeted_quantity   numeric(12, 2) not null check (budgeted_quantity > 0),
  budgeted_cost       numeric(14, 2) not null check (budgeted_cost >= 0),
  period_month        char(7) not null,  -- 'YYYY-MM' e.g. '2026-05'
  note                text,
  created_by          uuid references profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (site_id, material_id, period_month)
);

grant all on budget_lines to anon, authenticated, service_role;
alter table budget_lines enable row level security;

-- Contractors see all budget lines for their tenant
create policy "bl_select" on budget_lines for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

-- Contractors and site managers can create budget lines
create policy "bl_insert" on budget_lines for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

-- Contractors and site managers can update budget lines
create policy "bl_update" on budget_lines for update
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

-- Only contractors can delete budget lines
create policy "bl_delete" on budget_lines for delete
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );
