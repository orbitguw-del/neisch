-- Indexes for common query patterns
CREATE INDEX idx_scdl_site_date  ON public.subcontractor_daily_logs(site_id, date DESC);
CREATE INDEX idx_scdl_tenant     ON public.subcontractor_daily_logs(tenant_id);
CREATE INDEX idx_sc_tenant       ON public.subcontractors(tenant_id);

-- Allow supervisors to delete photos (needed for re-log photo replacement)
CREATE POLICY "sclp_supervisor_delete" ON public.subcontractor_labour_photos
  FOR DELETE USING (
    log_id IN (
      SELECT id FROM public.subcontractor_daily_logs WHERE tenant_id = my_tenant_id()
    )
    AND my_role() IN ('contractor', 'site_manager', 'supervisor', 'superadmin')
  );
