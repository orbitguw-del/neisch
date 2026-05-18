-- ─── Migration: Store Keeper — tenant-wide material visibility ────────────────
-- The Store Keeper oversees material across every site + the warehouse. These
-- SELECT policies previously scoped store_keeper to assigned sites; now they
-- see all material data for their tenant, like the Contractor.
-- Only SELECT is widened — write permissions are unchanged.

drop policy if exists "materials_select" on materials;
create policy "materials_select" on materials for select using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);

drop policy if exists "txn_select" on material_transactions;
create policy "txn_select" on material_transactions for select using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);

drop policy if exists "mr_select" on material_receipts;
create policy "mr_select" on material_receipts for select using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);

drop policy if exists "mt_select" on material_transfers;
create policy "mt_select" on material_transfers for select using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
  or from_site_id in (select site_id from site_assignments where profile_id = auth.uid())
  or to_site_id   in (select site_id from site_assignments where profile_id = auth.uid())
);

drop policy if exists "ma_select" on material_allocations;
create policy "ma_select" on material_allocations for select using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);

drop policy if exists "ea_select" on equipment_assets;
create policy "ea_select" on equipment_assets for select using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);

drop policy if exists "easgn_select" on equipment_assignments;
create policy "easgn_select" on equipment_assignments for select using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);

drop policy if exists "em_select" on equipment_maintenance;
create policy "em_select" on equipment_maintenance for select using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'store_keeper') and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);
