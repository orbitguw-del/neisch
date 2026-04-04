-- ─── Migration 002: Material Transactions (Consumption Ledger) ────────────────
-- Creates the material_transactions table to track receipts and consumption.
-- A trigger automatically updates materials.quantity_available on each insert.
-- Run in Supabase SQL Editor after 001_roles_permissions.sql.

-- 1. Table
create table if not exists material_transactions (
  id           uuid primary key default uuid_generate_v4(),
  material_id  uuid not null references materials(id) on delete cascade,
  site_id      uuid not null references sites(id)     on delete cascade,
  tenant_id    uuid not null references tenants(id)   on delete cascade,
  txn_type     text not null check (txn_type in ('receipt', 'consumption', 'adjustment')),
  quantity     numeric(12, 2) not null check (quantity > 0),
  note         text,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- 2. Grant permissions (required for PostgreSQL 15 / Supabase)
grant all on material_transactions to anon, authenticated, service_role;

-- 3. Enable RLS
alter table material_transactions enable row level security;

-- 4. RLS policies
create policy "txn_select" on material_transactions for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "txn_insert" on material_transactions for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager', 'store_keeper') and tenant_id = my_tenant_id())
    or (my_role() in ('store_keeper', 'supervisor') and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "txn_delete" on material_transactions for delete
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );

-- 5. Trigger: auto-update quantity_available on insert
create or replace function apply_material_transaction()
returns trigger language plpgsql security definer as $$
begin
  if new.txn_type = 'receipt' then
    update materials
    set quantity_available = coalesce(quantity_available, 0) + new.quantity,
        updated_at = now()
    where id = new.material_id;
  elsif new.txn_type = 'consumption' then
    update materials
    set quantity_available = coalesce(quantity_available, 0) - new.quantity,
        updated_at = now()
    where id = new.material_id;
  elsif new.txn_type = 'adjustment' then
    update materials
    set quantity_available = new.quantity,
        updated_at = now()
    where id = new.material_id;
  end if;
  return new;
end;
$$;

create trigger on_material_transaction
  after insert on material_transactions
  for each row execute procedure apply_material_transaction();
