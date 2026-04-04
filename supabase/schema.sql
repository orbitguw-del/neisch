-- ConsNE — Multi-tenant Construction Site Management
-- Run this in your Supabase SQL editor to bootstrap the schema.

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Tenants (contractor companies) ─────────────────────────────────────────
create table tenants (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  owner_id    uuid references auth.users(id) on delete set null,
  plan        text not null default 'free',  -- free | pro | enterprise
  created_at  timestamptz not null default now()
);

-- ─── Profiles (one per auth user) ────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid references tenants(id) on delete cascade,
  full_name   text,
  role        text not null default 'member',  -- owner | admin | member
  created_at  timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Link profile to tenant when tenant is created
create or replace function link_owner_to_tenant()
returns trigger language plpgsql security definer as $$
begin
  update profiles
  set tenant_id = new.id, role = 'owner'
  where id = new.owner_id;
  return new;
end;
$$;

create trigger on_tenant_created
  after insert on tenants
  for each row execute procedure link_owner_to_tenant();

-- ─── Sites ────────────────────────────────────────────────────────────────────
create table sites (
  id           uuid primary key default uuid_generate_v4(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  name         text not null,
  location     text,
  description  text,
  status       text not null default 'planning',  -- planning | active | on_hold | completed
  budget       numeric(14, 2),
  start_date   date,
  end_date     date,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Workers ─────────────────────────────────────────────────────────────────
create table workers (
  id           uuid primary key default uuid_generate_v4(),
  site_id      uuid not null references sites(id) on delete cascade,
  tenant_id    uuid not null references tenants(id) on delete cascade,
  name         text not null,
  trade        text,
  phone        text,
  daily_wage   numeric(10, 2),
  status       text not null default 'active',  -- active | inactive
  joined_at    date,
  created_at   timestamptz not null default now()
);

-- ─── Materials ───────────────────────────────────────────────────────────────
create table materials (
  id                  uuid primary key default uuid_generate_v4(),
  site_id             uuid not null references sites(id) on delete cascade,
  tenant_id           uuid not null references tenants(id) on delete cascade,
  name                text not null,
  unit                text not null default 'bags',
  unit_cost           numeric(12, 2),
  quantity_available  numeric(12, 2),
  quantity_minimum    numeric(12, 2),   -- reorder threshold
  supplier            text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── Daily Progress Logs ─────────────────────────────────────────────────────
create table daily_logs (
  id           uuid primary key default uuid_generate_v4(),
  site_id      uuid not null references sites(id) on delete cascade,
  tenant_id    uuid not null references tenants(id) on delete cascade,
  log_date     date not null default current_date,
  workers_present int,
  work_done    text,
  issues       text,
  weather      text,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table tenants      enable row level security;
alter table profiles     enable row level security;
alter table sites        enable row level security;
alter table workers      enable row level security;
alter table materials    enable row level security;
alter table daily_logs   enable row level security;

-- Helper: get calling user's tenant_id
create or replace function my_tenant_id()
returns uuid language sql stable security definer as $$
  select tenant_id from profiles where id = auth.uid()
$$;

-- tenants — owner can read/update their own tenant
create policy "tenant_select" on tenants for select using (id = my_tenant_id());
create policy "tenant_update" on tenants for update using (owner_id = auth.uid());

-- profiles — members see only their tenant
create policy "profile_select" on profiles for select using (tenant_id = my_tenant_id());
create policy "profile_update" on profiles for update using (id = auth.uid());

-- sites
create policy "sites_select" on sites for select using (tenant_id = my_tenant_id());
create policy "sites_insert" on sites for insert with check (tenant_id = my_tenant_id());
create policy "sites_update" on sites for update using (tenant_id = my_tenant_id());
create policy "sites_delete" on sites for delete using (tenant_id = my_tenant_id());

-- workers
create policy "workers_select" on workers for select using (tenant_id = my_tenant_id());
create policy "workers_insert" on workers for insert with check (tenant_id = my_tenant_id());
create policy "workers_update" on workers for update using (tenant_id = my_tenant_id());
create policy "workers_delete" on workers for delete using (tenant_id = my_tenant_id());

-- materials
create policy "materials_select" on materials for select using (tenant_id = my_tenant_id());
create policy "materials_insert" on materials for insert with check (tenant_id = my_tenant_id());
create policy "materials_update" on materials for update using (tenant_id = my_tenant_id());
create policy "materials_delete" on materials for delete using (tenant_id = my_tenant_id());

-- daily_logs
create policy "logs_select" on daily_logs for select using (tenant_id = my_tenant_id());
create policy "logs_insert" on daily_logs for insert with check (tenant_id = my_tenant_id());
create policy "logs_update" on daily_logs for update using (tenant_id = my_tenant_id());
create policy "logs_delete" on daily_logs for delete using (tenant_id = my_tenant_id());

-- ─── updated_at triggers ──────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sites_updated_at     before update on sites     for each row execute procedure set_updated_at();
create trigger materials_updated_at before update on materials for each row execute procedure set_updated_at();
