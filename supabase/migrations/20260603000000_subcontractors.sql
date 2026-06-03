-- ── Sub-contractor directory (tenant-level) ─────────────────────────────────
CREATE TABLE public.subcontractors (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id  uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name       text NOT NULL,
  phone      text,
  type       text NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;

-- All roles on the tenant can read
CREATE POLICY "sc_tenant_read" ON public.subcontractors
  FOR SELECT USING (tenant_id = my_tenant_id());

-- Only contractor / superadmin can write
CREATE POLICY "sc_contractor_insert" ON public.subcontractors
  FOR INSERT WITH CHECK (
    tenant_id = my_tenant_id()
    AND my_role() IN ('contractor', 'superadmin')
  );

CREATE POLICY "sc_contractor_update" ON public.subcontractors
  FOR UPDATE USING (
    tenant_id = my_tenant_id()
    AND my_role() IN ('contractor', 'superadmin')
  );

CREATE POLICY "sc_contractor_delete" ON public.subcontractors
  FOR DELETE USING (
    tenant_id = my_tenant_id()
    AND my_role() IN ('contractor', 'superadmin')
  );

-- ── Daily labour headcount log (site-level) ──────────────────────────────────
CREATE TABLE public.subcontractor_daily_logs (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id        uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  site_id          uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  subcontractor_id uuid NOT NULL REFERENCES public.subcontractors(id) ON DELETE CASCADE,
  date             date NOT NULL DEFAULT CURRENT_DATE,
  headcount        integer NOT NULL CHECK (headcount >= 0),
  notes            text,
  logged_by        uuid REFERENCES public.profiles(id),
  created_at       timestamptz DEFAULT now(),
  UNIQUE (site_id, subcontractor_id, date)
);

ALTER TABLE public.subcontractor_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scdl_tenant_read" ON public.subcontractor_daily_logs
  FOR SELECT USING (tenant_id = my_tenant_id());

CREATE POLICY "scdl_supervisor_insert" ON public.subcontractor_daily_logs
  FOR INSERT WITH CHECK (
    tenant_id = my_tenant_id()
    AND my_role() IN ('contractor', 'site_manager', 'supervisor', 'superadmin')
  );

CREATE POLICY "scdl_supervisor_update" ON public.subcontractor_daily_logs
  FOR UPDATE USING (
    tenant_id = my_tenant_id()
    AND my_role() IN ('contractor', 'site_manager', 'supervisor', 'superadmin')
  );

-- ── Labour photos per daily log ───────────────────────────────────────────────
CREATE TABLE public.subcontractor_labour_photos (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id     uuid NOT NULL REFERENCES public.subcontractor_daily_logs(id) ON DELETE CASCADE,
  photo_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subcontractor_labour_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sclp_tenant_read" ON public.subcontractor_labour_photos
  FOR SELECT USING (
    log_id IN (
      SELECT id FROM public.subcontractor_daily_logs WHERE tenant_id = my_tenant_id()
    )
  );

CREATE POLICY "sclp_supervisor_insert" ON public.subcontractor_labour_photos
  FOR INSERT WITH CHECK (
    log_id IN (
      SELECT id FROM public.subcontractor_daily_logs WHERE tenant_id = my_tenant_id()
    )
    AND my_role() IN ('contractor', 'site_manager', 'supervisor', 'superadmin')
  );
