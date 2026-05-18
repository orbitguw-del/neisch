-- ─── Migration: photo_path columns ────────────────────────────────────────────
-- On-site photo support. Each row stores a single Storage path into the
-- `site-photos` bucket (see 20260518100000_site_photos_storage.sql).
--   daily_logs        — site progress photo
--   site_expenses     — bill / receipt photo
--   material_receipts — challan / delivery photo
--   workers           — worker face photo (NOT an ID-proof scan)

alter table daily_logs        add column if not exists photo_path text;
alter table site_expenses     add column if not exists photo_path text;
alter table material_receipts add column if not exists photo_path text;
alter table workers           add column if not exists photo_path text;
