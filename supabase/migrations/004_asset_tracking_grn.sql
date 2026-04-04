-- ─── Migration 004: Asset Tracking, GRN, Running Balance, Discrepancy ─────────
-- Run AFTER 003_material_flow.sql

-- 1. Extend txn_type on material_transactions
alter table material_transactions
  drop constraint if exists material_transactions_txn_type_check;

alter table material_transactions
  add constraint material_transactions_txn_type_check
    check (txn_type in (
      'opening',       -- opening stock when material first created
      'receipt',       -- confirmed GRN inward
      'transfer_in',   -- received from another site
      'transfer_out',  -- sent to another site
      'consumption',   -- direct consumption by site manager
      'allocation',    -- consumption via work allocation
      'wastage',       -- damage / breakage
      'return',        -- unused material returned to stock
      'adjustment'     -- physical count correction
    ));

-- Add reference linkage and running balance column
alter table material_transactions
  add column if not exists ref_type     text check (ref_type in ('receipt', 'transfer', 'allocation', 'manual', 'opening')),
  add column if not exists ref_id       uuid,
  add column if not exists balance_after numeric(12, 2);

create index if not exists idx_material_txn_material_created
  on material_transactions (material_id, created_at asc);

-- 2. Opening stock tracking on materials
alter table materials
  add column if not exists opening_stock_recorded boolean not null default false;

-- 3. Tenant-level sequence counters (GRN numbers + asset codes)
create table if not exists material_sequences (
  tenant_id   uuid primary key references tenants(id) on delete cascade,
  grn_last    integer not null default 0,
  asset_last  integer not null default 0
);

grant all on material_sequences to anon, authenticated, service_role;
alter table material_sequences enable row level security;

create policy "seq_all" on material_sequences for all
  using  (my_role() = 'superadmin' or tenant_id = my_tenant_id())
  with check (my_role() = 'superadmin' or tenant_id = my_tenant_id());

-- 4. GRN number generator (atomic, sequential per tenant)
create or replace function next_grn_number(p_tenant_id uuid)
returns text language plpgsql security definer as $$
declare
  v_next integer;
  v_year text := to_char(current_date, 'YYYY');
begin
  insert into material_sequences (tenant_id, grn_last, asset_last)
    values (p_tenant_id, 1, 0)
    on conflict (tenant_id) do update
      set grn_last = material_sequences.grn_last + 1
    returning grn_last into v_next;
  return 'GRN-' || v_year || '-' || lpad(v_next::text, 5, '0');
end;
$$;

-- 5. Asset code generator (atomic, sequential per tenant)
create or replace function next_asset_code(p_tenant_id uuid)
returns text language plpgsql security definer as $$
declare
  v_next integer;
begin
  insert into material_sequences (tenant_id, grn_last, asset_last)
    values (p_tenant_id, 0, 1)
    on conflict (tenant_id) do update
      set asset_last = material_sequences.asset_last + 1
    returning asset_last into v_next;
  return 'EQ-' || lpad(v_next::text, 5, '0');
end;
$$;

-- 6. Enhance material_receipts with GRN + discrepancy fields
alter table material_receipts
  add column if not exists grn_number          text,
  add column if not exists quantity_received   numeric(12, 2),
  add column if not exists discrepancy_reason  text,
  add column if not exists discrepancy_action  text
    check (discrepancy_action in ('accept_partial', 'reject_balance', 'pending_balance'));

create index if not exists idx_material_receipts_grn
  on material_receipts (grn_number) where grn_number is not null;

-- 7. Enhance material_transfers with discrepancy fields
alter table material_transfers
  add column if not exists quantity_received   numeric(12, 2),
  add column if not exists discrepancy_reason  text,
  add column if not exists discrepancy_action  text
    check (discrepancy_action in ('accept_partial', 'reject_balance', 'pending_balance'));

-- 8. Equipment assets — one row per physical unit
create table if not exists equipment_assets (
  id              uuid primary key default uuid_generate_v4(),
  asset_code      text not null,              -- EQ-00001, unique per tenant
  material_id     uuid not null references materials(id)  on delete restrict,
  site_id         uuid not null references sites(id)      on delete restrict,
  tenant_id       uuid not null references tenants(id)    on delete cascade,

  -- Identity
  serial_number   text,
  make            text,
  model           text,
  year_of_mfg     integer,

  -- Purchase
  purchase_date   date,
  purchase_cost   numeric(12, 2),
  purchase_order  text,
  supplier        text,
  warranty_expiry date,

  -- GRN linkage
  grn_receipt_id  uuid references material_receipts(id) on delete set null,

  -- Status
  status          text not null default 'available'
    check (status in ('available', 'in_use', 'maintenance', 'retired')),

  -- Current assignment (denormalised for fast lookup)
  current_assignee_id   uuid references profiles(id) on delete set null,
  current_assignee_name text,
  current_zone          text,

  -- Service
  last_service_date  date,
  next_service_date  date,
  notes              text,

  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (tenant_id, asset_code)
);

grant all on equipment_assets to anon, authenticated, service_role;
alter table equipment_assets enable row level security;

create policy "ea_select" on equipment_assets for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "ea_insert" on equipment_assets for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager', 'store_keeper') and tenant_id = my_tenant_id())
  );

create policy "ea_update" on equipment_assets for update
  using (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager', 'store_keeper') and tenant_id = my_tenant_id())
    or (my_role() in ('site_manager', 'store_keeper') and site_id in (
      select site_id from site_assignments where profile_id = auth.uid()
    ))
  );

create trigger ea_updated_at before update on equipment_assets
  for each row execute procedure set_updated_at();

create index if not exists idx_ea_site_status on equipment_assets (site_id, status);
create index if not exists idx_ea_material    on equipment_assets (material_id);

-- 9. Equipment assignment history
create table if not exists equipment_assignments (
  id                    uuid primary key default uuid_generate_v4(),
  asset_id              uuid not null references equipment_assets(id) on delete cascade,
  site_id               uuid not null references sites(id)            on delete cascade,
  tenant_id             uuid not null references tenants(id)          on delete cascade,
  assigned_to_profile   uuid references profiles(id) on delete set null,
  assigned_to_name      text,
  zone                  text,
  assigned_by           uuid references profiles(id) on delete set null,
  assigned_at           timestamptz not null default now(),
  returned_at           timestamptz,
  return_condition      text check (return_condition in ('good', 'damaged', 'lost')),
  note                  text
);

grant all on equipment_assignments to anon, authenticated, service_role;
alter table equipment_assignments enable row level security;

create policy "easgn_select" on equipment_assignments for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "easgn_insert" on equipment_assignments for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager') and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "easgn_update" on equipment_assignments for update
  using (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager') and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create index if not exists idx_easgn_asset on equipment_assignments (asset_id, assigned_at desc);

-- 10. Equipment maintenance records
create table if not exists equipment_maintenance (
  id                uuid primary key default uuid_generate_v4(),
  asset_id          uuid not null references equipment_assets(id) on delete cascade,
  site_id           uuid not null references sites(id)            on delete cascade,
  tenant_id         uuid not null references tenants(id)          on delete cascade,
  service_type      text not null check (service_type in ('scheduled', 'breakdown', 'inspection')),
  description       text,
  cost              numeric(12, 2),
  serviced_by       text,
  service_date      date not null,
  next_service_date date,
  status            text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at      timestamptz,
  created_by        uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

grant all on equipment_maintenance to anon, authenticated, service_role;
alter table equipment_maintenance enable row level security;

create policy "em_select" on equipment_maintenance for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "em_insert" on equipment_maintenance for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager', 'store_keeper') and tenant_id = my_tenant_id())
    or (my_role() in ('site_manager', 'store_keeper') and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "em_update" on equipment_maintenance for update
  using (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager') and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create index if not exists idx_em_asset on equipment_maintenance (asset_id, service_date desc);

-- 11. Backfill opening stock transactions for existing materials with quantity > 0
--     that have no transaction rows yet.
insert into material_transactions (
  material_id, site_id, tenant_id, txn_type, quantity,
  ref_type, balance_after, note, created_at
)
select
  m.id, m.site_id, m.tenant_id,
  'opening', m.quantity_available,
  'opening', m.quantity_available,
  'Opening stock — initial entry',
  m.created_at
from materials m
where m.quantity_available > 0
  and not exists (
    select 1 from material_transactions t where t.material_id = m.id
  );

update materials set opening_stock_recorded = true
where quantity_available > 0
  and not exists (
    select 1 from material_transactions t
    where t.material_id = m.id and t.txn_type != 'opening'
  );
-- The above uses a correlated alias; rewrite correctly:
update materials m set opening_stock_recorded = true
where exists (
  select 1 from material_transactions t
  where t.material_id = m.id and t.txn_type = 'opening'
);
