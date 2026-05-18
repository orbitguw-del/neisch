-- ─── Migration: site-photos Storage bucket ────────────────────────────────────
-- Private bucket for on-site photos (daily logs, expenses, receipts, workers).
-- Objects are stored under  <tenant_id>/<site_id>/<entity>/<uuid>.jpg  and RLS
-- restricts every operation to objects whose first path segment is the caller's
-- own tenant.

insert into storage.buckets (id, name, public)
values ('site-photos', 'site-photos', false)
on conflict (id) do nothing;

-- SELECT — view photos in your own tenant
drop policy if exists "site_photos_select" on storage.objects;
create policy "site_photos_select" on storage.objects for select
  using (
    bucket_id = 'site-photos'
    and (storage.foldername(name))[1] = public.my_tenant_id()::text
  );

-- INSERT — upload photos into your own tenant's folder
drop policy if exists "site_photos_insert" on storage.objects;
create policy "site_photos_insert" on storage.objects for insert
  with check (
    bucket_id = 'site-photos'
    and (storage.foldername(name))[1] = public.my_tenant_id()::text
  );

-- UPDATE — replace a photo (upsert) in your own tenant's folder
drop policy if exists "site_photos_update" on storage.objects;
create policy "site_photos_update" on storage.objects for update
  using (
    bucket_id = 'site-photos'
    and (storage.foldername(name))[1] = public.my_tenant_id()::text
  );

-- DELETE — remove a photo in your own tenant's folder
drop policy if exists "site_photos_delete" on storage.objects;
create policy "site_photos_delete" on storage.objects for delete
  using (
    bucket_id = 'site-photos'
    and (storage.foldername(name))[1] = public.my_tenant_id()::text
  );
