-- ─── Migration: Store Keeper can approve material transfers ───────────────────
-- material_transfers are confirmed/rejected on receipt. Previously only
-- site_manager (+ contractor/superadmin) could update a transfer. Store keepers
-- handle the physical material, so they should be able to approve transfers
-- for their assigned sites too.

drop policy if exists "mt_update" on material_transfers;
create policy "mt_update" on material_transfers for update
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() in ('site_manager', 'store_keeper') and (
      from_site_id in (select site_id from site_assignments where profile_id = auth.uid())
      or to_site_id in (select site_id from site_assignments where profile_id = auth.uid())
    ))
  );
