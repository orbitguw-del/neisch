-- Fix: vendor registration form on storeyinfra.com/vendor was returning
-- HTTP 401 (permission denied) on every public submission. Root cause:
-- migration 20260617 created the RLS policy targeting `anon` but never
-- ran `GRANT INSERT`. Postgres requires BOTH a policy AND a grant.
--
-- Only INSERT is granted to anon. SELECT/UPDATE/DELETE remain superadmin-
-- only (already enforced by superadmin_all_vendor_reg policy). The grant
-- gives the publishable-key client the privilege to call insert; RLS
-- still gates which rows are allowed (anon's check is `true`).

GRANT INSERT ON public.vendor_registrations TO anon;
