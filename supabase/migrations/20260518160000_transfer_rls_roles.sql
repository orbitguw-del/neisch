-- ─── Migration: Transfer RLS for the 4-stage lifecycle ───────────────────────
-- INSERT — Store Keeper or Site Manager can initiate a transfer.
-- UPDATE — Supervisor (prepare dispatch), Site Manager / Store Keeper
--          (approve / receive). Each scoped to their assigned sites.

drop policy if exists "mt_insert" on material_transfers;
create policy "mt_insert" on material_transfers for insert with check (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'site_manager', 'store_keeper') and tenant_id = my_tenant_id())
);

drop policy if exists "mt_update" on material_transfers;
create policy "mt_update" on material_transfers for update using (
  my_role() = 'superadmin'
  or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  or (my_role() in ('site_manager', 'store_keeper', 'supervisor') and (
    from_site_id in (select site_id from site_assignments where profile_id = auth.uid())
    or to_site_id in (select site_id from site_assignments where profile_id = auth.uid())
  ))
);
