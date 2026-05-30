-- 20260530000000_cost_centres.sql
--
-- Cost centres within a site — the SPEND BUCKET hub.
-- A site (e.g. a building project) is split into internal buckets:
--   Building · Utilities · Boundary Wall · External Development …
-- Each carries its own top-down budget. Materials are tagged to a centre;
-- actual cost rolls up from that material's confirmed receipts.
--
-- Designed as a HUB: the future Sub-Contractor module will add its own
-- cost_centre_id and fold its payments into cost_centre_budget_v alongside
-- material spend. See docs/SPEC-COST-CENTRES.md.
--
-- RLS mirrors budget_lines (006) exactly — no new security surface.

-- ── 1. Table ───────────────────────────────────────────────────────────────────

create table if not exists cost_centres (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  site_id       uuid not null references sites(id)   on delete cascade,
  name          text not null,                       -- "Building", "Utilities"
  budget_amount numeric(14, 2),                       -- planned ₹ for this centre (nullable)
  sort_order    int  not null default 0,             -- display order on the site
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (site_id, name)                             -- no two centres same name per site
);

create index if not exists cost_centres_site_idx on cost_centres (site_id);

grant all on cost_centres to anon, authenticated, service_role;
alter table cost_centres enable row level security;

-- select: superadmin · contractor (own tenant) · anyone assigned to the site
create policy "cc_select" on cost_centres for select
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or site_id in (select site_id from site_assignments where profile_id = auth.uid())
  );

-- insert: superadmin · contractor (own tenant) · site_manager (assigned site)
create policy "cc_insert" on cost_centres for insert
  with check (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

-- update: superadmin · contractor (own tenant) · site_manager (assigned site)
create policy "cc_update" on cost_centres for update
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
    or (my_role() = 'site_manager' and site_id in (select site_id from site_assignments where profile_id = auth.uid()))
  );

-- delete: superadmin · contractor only
create policy "cc_delete" on cost_centres for delete
  using (
    my_role() = 'superadmin'
    or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  );

-- ── 2. Link column on materials ────────────────────────────────────────────────
-- Nullable → existing materials become the implicit "Unassigned" bucket.
-- on delete set null → deleting a centre returns its materials to Unassigned;
-- real stock data is never cascaded away.

alter table materials
  add column if not exists cost_centre_id uuid
    references cost_centres(id) on delete set null;

create index if not exists materials_cost_centre_idx on materials (cost_centre_id);
