-- Performance indexes from 2026-06-21 ultra code review.
-- All four are composite (site/tenant + date) — match the app's hottest queries:
--   - Attendance.jsx loads attendance by site_id + date window
--   - DailyLogs loads by site_id + log_date window
--   - Material receipts list filtered by site_id ordered by recency
--   - Profile lookups inside a tenant filtered by role (RLS helpers + role pages)
-- IF NOT EXISTS is safe to re-run.

create index if not exists daily_logs_site_logdate_idx
  on public.daily_logs (site_id, log_date desc);

create index if not exists attendance_site_date_idx
  on public.attendance (site_id, date desc);

create index if not exists material_receipts_site_created_idx
  on public.material_receipts (site_id, created_at desc);

create index if not exists profiles_tenant_role_idx
  on public.profiles (tenant_id, role);
