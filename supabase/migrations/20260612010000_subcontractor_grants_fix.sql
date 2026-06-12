-- 20260612010000_subcontractor_grants_fix.sql
--
-- The sub-contractor tables (migrations 20260603000000 / 20260603000003) granted
-- privileges to `authenticated` only and never to `service_role`. Anything using
-- the service-role / secret key — the seed script, admin tooling, future edge
-- functions — therefore hit:
--   42501  permission denied for table subcontractors
-- (cost_centres avoided this because its migration granted to service_role too.)
--
-- Grant the missing privileges. RLS is unchanged, so authenticated/anon access is
-- still gated by the existing policies; this only un-breaks service-role callers.

grant all on public.subcontractors                 to anon, authenticated, service_role;
grant all on public.subcontractor_site_assignments to anon, authenticated, service_role;
grant all on public.subcontractor_daily_logs       to anon, authenticated, service_role;
grant all on public.subcontractor_labour_photos    to anon, authenticated, service_role;
