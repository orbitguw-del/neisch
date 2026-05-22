-- 20260522010000_supervisor_can_issue_equipment.sql
--
-- Reported 2026-05-22 by Karun: the supervisor cannot issue equipment
-- (non-consumable assets — drills, scaffolding, helmets, etc.) to workers
-- or sub-contractors on the site he supervises. The equipment_assignments
-- ledger is therefore empty for assets a supervisor would naturally hand out.
--
-- Root cause: three RLS policies excluded the supervisor role:
--   ea_update     (equipment_assets — required to update status + assignee)
--   easgn_insert  (equipment_assignments — required to create the issue record)
--   easgn_update  (equipment_assignments — required to close on return)
--
-- The same shape of bug we fixed yesterday for material_allocations
-- (commit df2caf52). Same shape of fix: include supervisor with site-
-- assignment scoping so they can only act on assets at sites they're
-- assigned to.
--
-- Frontend gate (EquipmentAssets.jsx `canManage`) updated in the same
-- commit — both layers need to open together.

-- ── 1. equipment_assets UPDATE — supervisor can flip status + assignee ──
drop policy if exists "ea_update" on equipment_assets;

create policy "ea_update" on equipment_assets for update
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (
      my_role() in ('site_manager', 'store_keeper', 'supervisor')
      and tenant_id = my_tenant_id()
      and site_id in (
        select site_id from site_assignments where profile_id = auth.uid()
      )
    )
  );

-- ── 2. equipment_assignments INSERT — supervisor can issue ─────────────
drop policy if exists "easgn_insert" on equipment_assignments;

create policy "easgn_insert" on equipment_assignments for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (
      my_role() in ('site_manager', 'supervisor')
      and tenant_id = my_tenant_id()
      and site_id in (
        select site_id from site_assignments where profile_id = auth.uid()
      )
    )
  );

-- ── 3. equipment_assignments UPDATE — supervisor can close on return ───
drop policy if exists "easgn_update" on equipment_assignments;

create policy "easgn_update" on equipment_assignments for update
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (
      my_role() in ('site_manager', 'supervisor')
      and tenant_id = my_tenant_id()
      and site_id in (
        select site_id from site_assignments where profile_id = auth.uid()
      )
    )
  );
