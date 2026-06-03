CREATE TABLE public.daily_log_photos (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id     uuid NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  photo_path text NOT NULL,
  caption    text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.daily_log_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dlp_tenant_read" ON public.daily_log_photos
  FOR SELECT USING (
    log_id IN (
      SELECT id FROM public.daily_logs WHERE tenant_id = my_tenant_id()
    )
  );

CREATE POLICY "dlp_supervisor_insert" ON public.daily_log_photos
  FOR INSERT WITH CHECK (
    log_id IN (
      SELECT id FROM public.daily_logs WHERE tenant_id = my_tenant_id()
    )
    AND my_role() IN ('contractor', 'site_manager', 'supervisor', 'superadmin')
  );

CREATE POLICY "dlp_supervisor_delete" ON public.daily_log_photos
  FOR DELETE USING (
    log_id IN (
      SELECT id FROM public.daily_logs WHERE tenant_id = my_tenant_id()
    )
    AND my_role() IN ('contractor', 'site_manager', 'supervisor', 'superadmin')
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_log_photos TO authenticated;

CREATE INDEX idx_dlp_log_id ON public.daily_log_photos(log_id);
