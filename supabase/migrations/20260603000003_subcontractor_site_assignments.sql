CREATE TABLE public.subcontractor_site_assignments (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id        uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  site_id          uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  subcontractor_id uuid NOT NULL REFERENCES public.subcontractors(id) ON DELETE CASCADE,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (site_id, subcontractor_id)
);

ALTER TABLE public.subcontractor_site_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scsa_tenant_read" ON public.subcontractor_site_assignments
  FOR SELECT USING (tenant_id = my_tenant_id());

CREATE POLICY "scsa_contractor_insert" ON public.subcontractor_site_assignments
  FOR INSERT WITH CHECK (
    tenant_id = my_tenant_id()
    AND my_role() IN ('contractor', 'superadmin')
  );

CREATE POLICY "scsa_contractor_delete" ON public.subcontractor_site_assignments
  FOR DELETE USING (
    tenant_id = my_tenant_id()
    AND my_role() IN ('contractor', 'superadmin')
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subcontractor_site_assignments TO authenticated;

CREATE INDEX idx_scsa_subcontractor ON public.subcontractor_site_assignments(subcontractor_id);
CREATE INDEX idx_scsa_site          ON public.subcontractor_site_assignments(site_id);
