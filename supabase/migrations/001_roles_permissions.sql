-- ─── Migration 001: Role & Permission System Redesign ────────────────────────
-- New roles: superadmin | contractor | site_manager | supervisor | store_keeper
-- Run in Supabase SQL Editor (service role required).

-- 1. Update profiles.role default and migrate existing data
alter table profiles alter column role set default 'contractor';

update profiles set role = 'contractor' where role = 'owner';
update profiles set role = 'site_manager' where role = 'admin';
update profiles set role = 'supervisor'   where role = 'member';

-- 2. Update trigger: new registrations become 'contractor'
create or replace function link_owner_to_tenant()
returns trigger language plpgsql security definer as $$
begin
  update profiles
  set tenant_id = new.id, role = 'contractor'
  where id = new.owner_id;
  return new;
end;
$$;

-- 3. Helper: returns calling user's role (security definer bypasses RLS)
create or replace function my_role()
returns text language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- 4. site_assignments — links sub-contractor roles to specific sites
create table if not exists site_assignments (
  id           uuid primary key default uuid_generate_v4(),
  site_id      uuid not null references sites(id)    on delete cascade,
  profile_id   uuid not null references profiles(id) on delete cascade,
  tenant_id    uuid not null references tenants(id)  on delete cascade,
  role         text not null,  -- site_manager | supervisor | store_keeper
  assigned_by  uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique(site_id, profile_id)
);

alter table site_assignments enable row level security;

-- 5. Drop old RLS policies
drop policy if exists "tenant_select"   on tenants;
drop policy if exists "tenant_update"   on tenants;
drop policy if exists "profile_select"  on profiles;
drop policy if exists "profile_update"  on profiles;
drop policy if exists "sites_select"    on sites;
drop policy if exists "sites_insert"    on sites;
drop policy if exists "sites_update"    on sites;
drop policy if exists "sites_delete"    on sites;
drop policy if exists "workers_select"  on workers;
drop policy if exists "workers_insert"  on workers;
drop policy if exists "workers_update"  on workers;
drop policy if exists "workers_delete"  on workers;
drop policy if exists "materials_select" on materials;
drop policy if exists "materials_insert" on materials;
drop policy if exists "materials_update" on materials;
drop policy if exists "materials_delete" on materials;
drop policy if exists "logs_select"     on daily_logs;
drop policy if exists "logs_insert"     on daily_logs;
drop policy if exists "logs_update"     on daily_logs;
drop policy if exists "logs_delete"     on daily_logs;

-- 6. Tenants
-- superadmin sees all; contractor sees own tenant
create policy "tenants_select" on tenants for select
  using (my_role() = 'superadmin' or id = my_tenant_id());

create policy "tenants_update" on tenants for update
  using (my_role() = 'superadmin' or owner_id = auth.uid());

create policy "tenants_insert" on tenants for insert
  with check (my_role() = 'superadmin' or owner_id = auth.uid());

-- 7. Profiles
-- Own profile always readable; superadmin sees all; same tenant sees each other
create policy "profiles_select" on profiles for select
  using (
    id = auth.uid()
    or my_role() = 'superadmin'
    or tenant_id = my_tenant_id()
  );

create policy "profiles_update" on profiles for update
  using (my_role() = 'superadmin' or id = auth.uid());

create policy "profiles_insert" on profiles for insert
  with check (my_role() = 'superadmin' or id = auth.uid());

-- 8. Sites
-- contractor: all their tenant sites
-- site_manager / supervisor / store_keeper: only assigned sites
create policy "sites_select" on sites for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "sites_insert" on sites for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );

create policy "sites_update" on sites for update
  using (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager') and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "sites_delete" on sites for delete
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );

-- 9. Workers
create policy "workers_select" on workers for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "workers_insert" on workers for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager') and tenant_id = my_tenant_id())
    or (my_role() in ('site_manager', 'supervisor') and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "workers_update" on workers for update
  using (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager') and tenant_id = my_tenant_id())
    or (my_role() in ('site_manager', 'supervisor') and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "workers_delete" on workers for delete
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

-- 10. Materials
create policy "materials_select" on materials for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "materials_insert" on materials for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager', 'store_keeper') and tenant_id = my_tenant_id())
    or (my_role() = 'store_keeper' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "materials_update" on materials for update
  using (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager', 'store_keeper') and tenant_id = my_tenant_id())
    or (my_role() = 'store_keeper' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "materials_delete" on materials for delete
  using (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager') and tenant_id = my_tenant_id())
  );

-- 11. Daily logs
create policy "logs_select" on daily_logs for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

create policy "logs_insert" on daily_logs for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager', 'supervisor') and tenant_id = my_tenant_id())
    or (my_role() = 'supervisor' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "logs_update" on daily_logs for update
  using (
    my_role() = 'superadmin'
    or (my_role() in ('contractor', 'site_manager', 'supervisor') and tenant_id = my_tenant_id())
    or (my_role() = 'supervisor' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

create policy "logs_delete" on daily_logs for delete
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );

-- 12. Site assignments
create policy "assignments_select" on site_assignments for select
  using (
    my_role() = 'superadmin'
    or tenant_id = my_tenant_id()
    or profile_id = auth.uid()
  );

create policy "assignments_insert" on site_assignments for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );

create policy "assignments_update" on site_assignments for update
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );

create policy "assignments_delete" on site_assignments for delete
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );
