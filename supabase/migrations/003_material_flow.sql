-- ─── Migration 003: Full Material Flow ────────────────────────────────────────
-- Adds: category on materials, material_receipts (LR/challan), material_transfers,
--       material_allocations. Removes the auto-update trigger on material_transactions
--       so all quantity changes are handled explicitly in application code.
-- Run AFTER 002_material_transactions.sql

-- 1. Drop old auto-update trigger (was auto-updating on every transaction insert)
drop trigger if exists on_material_transaction on material_transactions;
drop function if exists apply_material_transaction();

-- 2. Add category to materials
alter table materials
  add column if not exists category text not null default 'consumable'
    check (category in ('consumable', 'equipment'));

-- ─── Material Receipts (Inward Register) ──────────────────────────────────────
-- Contractor / Store Keeper creates; Site Manager confirms.
-- On confirmation the application code updates quantity_available + logs transaction.

create table if not exists material_receipts (
  id              uuid primary key default uuid_generate_v4(),
  material_id     uuid not null references materials(id) on delete cascade,
  site_id         uuid not null references sites(id)     on delete cascade,
  tenant_id       uuid not null references tenants(id)   on delete cascade,
  source_type     text not null check (source_type in ('supplier', 'warehouse')),
  source_name     text not null,
  quantity        numeric(12, 2) not null check (quantity > 0),
  unit_cost       numeric(12, 2),
  -- Lorry Receipt
  lr_number       text,
  lr_date         date,
  -- Challan
  challan_number  text,
  challan_date    date,
  -- Logistics
  vehicle_number  text,
  note            text,
  status          text not null default 'pending'
                    check (status in ('pending', 'received', 'rejected')),
  created_by      uuid references profiles(id) on delete set null,
  received_by     uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  received_at     timestamptz
);

grant all on material_receipts to anon, authenticated, service_role;
alter table material_receipts enable row level security;

create policy "mr_select" on material_receipts for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "mr_insert" on material_receipts for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
    or (my_role() = 'store_keeper' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "mr_update" on material_receipts for update
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

-- ─── Material Transfers (Inter-site) ──────────────────────────────────────────
-- Sender site_manager initiates (pending); receiver site_manager confirms.
-- Application code handles deduct/add on confirmation.

create table if not exists material_transfers (
  id              uuid primary key default uuid_generate_v4(),
  material_id     uuid not null references materials(id) on delete cascade,
  from_site_id    uuid not null references sites(id) on delete cascade,
  to_site_id      uuid not null references sites(id) on delete cascade,
  tenant_id       uuid not null references tenants(id) on delete cascade,
  quantity        numeric(12, 2) not null check (quantity > 0),
  lr_number       text,
  lr_date         date,
  challan_number  text,
  challan_date    date,
  vehicle_number  text,
  note            text,
  status          text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'rejected')),
  initiated_by    uuid references profiles(id) on delete set null,
  confirmed_by    uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  confirmed_at    timestamptz
);

grant all on material_transfers to anon, authenticated, service_role;
alter table material_transfers enable row level security;

create policy "mt_select" on material_transfers for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or from_site_id in (select site_id from site_assignments where profile_id = auth.uid())
    or to_site_id   in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "mt_insert" on material_transfers for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and from_site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "mt_update" on material_transfers for update
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and (
      from_site_id in (select site_id from site_assignments where profile_id = auth.uid())
      or to_site_id in (select site_id from site_assignments where profile_id = auth.uid())
    ))
  );

-- ─── Material Allocations (Work Allocation) ────────────────────────────────────
-- Site Manager allocates consumables to specific work.
-- Application code deducts quantity_available and logs transaction.

create table if not exists material_allocations (
  id                  uuid primary key default uuid_generate_v4(),
  material_id         uuid not null references materials(id) on delete cascade,
  site_id             uuid not null references sites(id)     on delete cascade,
  tenant_id           uuid not null references tenants(id)   on delete cascade,
  work_description    text not null,
  quantity_allocated  numeric(12, 2) not null check (quantity_allocated > 0),
  allocated_date      date not null default current_date,
  note                text,
  allocated_by        uuid references profiles(id) on delete set null,
  created_at          timestamptz not null default now()
);

grant all on material_allocations to anon, authenticated, service_role;
alter table material_allocations enable row level security;

create policy "ma_select" on material_allocations for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "ma_insert" on material_allocations for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager') and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );
