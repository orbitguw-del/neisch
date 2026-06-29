-- Cleanup: remove diagnostic test rows inserted while verifying the
-- vendor_registrations anon-grant fix (20260623150000).

DELETE FROM public.vendor_registrations
WHERE business_name IN ('_TEST_DELETE_ME', '_DIAG_DELETE_ME');
