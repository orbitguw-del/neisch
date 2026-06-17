-- Public vendor registration form — lead capture for storeyinfra.com/vendor.
-- Anon can INSERT only; superadmin reads via the app.

create table if not exists vendor_registrations (
  id            uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name  text not null,
  phone         text not null,
  email         text,
  city          text,
  work_type     text,
  gst_number    text,
  note          text,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

alter table vendor_registrations enable row level security;

create policy "anon_insert_vendor_reg"
  on vendor_registrations for insert
  to anon
  with check (true);

create policy "superadmin_all_vendor_reg"
  on vendor_registrations for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'superadmin'
    )
  );
