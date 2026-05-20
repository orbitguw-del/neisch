-- 20260520020000_supervisor_can_allocate.sql
--
-- Bug fix (reported 2026-05-20 by devraaj at BuildNE): the supervisor role
-- could see materials and transfer them, but could NOT allocate material to
-- work. RLS policy `ma_insert` (from 003_material_flow.sql) only allowed
-- contractor + site_manager + superadmin.
--
-- The supervisor is the on-site role who actually witnesses material being
-- used. Excluding them forces the supervisor to call the site_manager every
-- time a bag of cement is consumed — defeats the point of the app.
--
-- Fix: supervisor can insert material_allocations ONLY for sites they're
-- assigned to via site_assignments. Tenant + site scoping enforced.
-- Frontend (Inventory.jsx:250) is updated in the same commit; this migration
-- is defence-in-depth so direct API calls are also accepted.

drop policy if exists "ma_insert" on material_allocations;

create policy "ma_insert" on material_allocations for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and tenant_id = my_tenant_id())
    or (
      my_role() = 'supervisor'
      and tenant_id = my_tenant_id()
      and site_id in (
        select site_id from site_assignments where profile_id = auth.uid()
      )
    )
  );
