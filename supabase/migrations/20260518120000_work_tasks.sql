-- ─── Migration: Work Assignment (tasks + daily updates) ───────────────────────
-- Cascading task assignment: Contractor → Site Manager → Supervisor → Worker.
-- A task is broken into sub-tasks (parent_task_id). Each task is assigned to
-- EITHER a profile (manager/supervisor) OR a worker. Status flows
-- pending → in_progress → submitted → done, with the assigner confirming.
-- task_updates holds the daily progress log (note + photo) per task.

-- ── tasks ─────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  site_id             uuid not null references sites(id)   on delete cascade,
  parent_task_id      uuid references tasks(id) on delete cascade,   -- null = top-level

  title               text not null,
  description         text,

  -- exactly one assignee: a profile (manager/supervisor) OR a worker
  assigned_to_profile uuid references profiles(id) on delete set null,
  assigned_to_worker  uuid references workers(id)  on delete set null,
  assigned_by         uuid references profiles(id) on delete set null,

  status              text not null default 'pending',   -- pending|in_progress|submitted|done|blocked
  priority            text not null default 'normal',     -- low|normal|high
  start_date          date,
  due_date            date,

  confirmed_by        uuid references profiles(id) on delete set null,
  confirmed_at        timestamptz,
  completed_at        timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table tasks drop constraint if exists tasks_status_check;
alter table tasks add constraint tasks_status_check
  check (status in ('pending', 'in_progress', 'submitted', 'done', 'blocked'));

alter table tasks drop constraint if exists tasks_priority_check;
alter table tasks add constraint tasks_priority_check
  check (priority in ('low', 'normal', 'high'));

-- exactly one assignee set
alter table tasks drop constraint if exists tasks_one_assignee_check;
alter table tasks add constraint tasks_one_assignee_check
  check ((assigned_to_profile is not null) <> (assigned_to_worker is not null));

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at before update on tasks
  for each row execute procedure set_updated_at();

create index if not exists tasks_tenant_idx        on tasks (tenant_id);
create index if not exists tasks_site_status_idx   on tasks (site_id, status);
create index if not exists tasks_parent_idx        on tasks (parent_task_id);
create index if not exists tasks_assignee_prof_idx on tasks (assigned_to_profile);
create index if not exists tasks_due_idx           on tasks (due_date);

-- ── task_updates (daily progress log) ────────────────────────────────────────
create table if not exists task_updates (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references tasks(id)    on delete cascade,
  tenant_id    uuid not null references tenants(id)  on delete cascade,
  site_id      uuid not null references sites(id)    on delete cascade,
  update_date  date not null default current_date,
  note         text,
  photo_path   text,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists task_updates_task_idx on task_updates (task_id, update_date desc);
create index if not exists task_updates_site_idx on task_updates (site_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table tasks        enable row level security;
alter table task_updates enable row level security;
grant all on tasks        to anon, authenticated, service_role;
grant all on task_updates to anon, authenticated, service_role;

-- tasks: contractor sees the whole tenant; sub-roles see their assigned sites
create policy "tasks_select" on tasks for select using (
  my_role() = 'superadmin'
  or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);

create policy "tasks_insert" on tasks for insert with check (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'site_manager', 'supervisor') and tenant_id = my_tenant_id())
);

create policy "tasks_update" on tasks for update using (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'site_manager', 'supervisor') and tenant_id = my_tenant_id())
);

create policy "tasks_delete" on tasks for delete using (
  my_role() = 'superadmin'
  or (my_role() = 'contractor' and tenant_id = my_tenant_id())
);

-- task_updates: same visibility as tasks
create policy "task_updates_select" on task_updates for select using (
  my_role() = 'superadmin'
  or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);

create policy "task_updates_insert" on task_updates for insert with check (
  my_role() = 'superadmin'
  or (my_role() in ('contractor', 'site_manager', 'supervisor') and tenant_id = my_tenant_id())
);

create policy "task_updates_delete" on task_updates for delete using (
  my_role() = 'superadmin'
  or (my_role() = 'contractor' and tenant_id = my_tenant_id())
);
