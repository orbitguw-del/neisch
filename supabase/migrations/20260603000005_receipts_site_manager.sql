ALTER POLICY mr_insert ON public.material_receipts
  WITH CHECK (
    (my_role() = 'superadmin')
    OR (my_role() = ANY(ARRAY['contractor','site_manager','store_keeper']) AND tenant_id = my_tenant_id())
  );
