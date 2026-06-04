-- ── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text,
  type        text NOT NULL, -- task_assigned | log_confirmed | transfer_pending | general
  entity_id   uuid,          -- FK to the relevant entity (task, log, transfer)
  entity_type text,          -- 'task' | 'daily_log' | 'transfer'
  read_at     timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_own_read" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notif_own_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notif_tenant_insert" ON public.notifications
  FOR INSERT WITH CHECK (tenant_id = my_tenant_id());

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;

CREATE INDEX idx_notif_user    ON public.notifications(user_id, read_at, created_at DESC);
CREATE INDEX idx_notif_tenant  ON public.notifications(tenant_id);

-- ── Push subscriptions ────────────────────────────────────────────────────────
CREATE TABLE public.push_subscriptions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint      text NOT NULL,
  p256dh        text NOT NULL,
  auth_key      text NOT NULL,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ps_own" ON public.push_subscriptions
  FOR ALL USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
