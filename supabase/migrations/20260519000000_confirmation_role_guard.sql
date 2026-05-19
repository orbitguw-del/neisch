-- ─── Migration: enforce the confirmation workflow at the database ─────────────
-- RLS can gate WHICH rows a role updates, but not WHICH columns. So a supervisor
-- could self-confirm their own attendance / daily log / task via a direct API
-- call (RLS-AUDIT-2026-05-19 finding #1). These BEFORE UPDATE triggers make the
-- "Site Manager confirms" rule real — not just a UI convention.

-- ── attendance & daily_logs — only a manager may confirm ──────────────────────
-- A non-manager update can never land the row in 'confirmed', and never carries
-- a confirmer. Managers (and service-role edge functions) pass through.
CREATE OR REPLACE FUNCTION public.enforce_record_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF public.my_role() IN ('superadmin', 'contractor', 'site_manager') THEN
    RETURN NEW;                       -- managers may confirm
  END IF;

  -- Non-managers: block confirmation, strip any confirmer fields.
  IF NEW.approval_status = 'confirmed'
     AND COALESCE(OLD.approval_status, '') <> 'confirmed' THEN
    RAISE EXCEPTION 'Only a Site Manager can confirm this record';
  END IF;
  NEW.confirmed_by := NULL;
  NEW.confirmed_at := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS attendance_confirm_guard ON public.attendance;
CREATE TRIGGER attendance_confirm_guard
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.enforce_record_confirmation();

DROP TRIGGER IF EXISTS daily_logs_confirm_guard ON public.daily_logs;
CREATE TRIGGER daily_logs_confirm_guard
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_record_confirmation();

-- ── tasks — the assignee may not confirm their own task ───────────────────────
-- The cascade rule: the assigner confirms, not the doer. So a user cannot move
-- a task assigned to THEMSELVES into 'done'. Worker-level tasks (no profile
-- assignee) are confirmed by their supervisor — unaffected.
CREATE OR REPLACE FUNCTION public.enforce_task_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF public.my_role() = 'superadmin' THEN RETURN NEW; END IF;

  -- Is this the caller's own task?
  IF OLD.assigned_to_profile IS NOT DISTINCT FROM auth.uid() THEN
    IF NEW.status = 'done' AND OLD.status <> 'done' THEN
      RAISE EXCEPTION 'You cannot confirm your own task — the assigner must confirm it';
    END IF;
    -- not their place to stamp the confirmer either
    NEW.confirmed_by := OLD.confirmed_by;
    NEW.confirmed_at := OLD.confirmed_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tasks_confirm_guard ON public.tasks;
CREATE TRIGGER tasks_confirm_guard
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.enforce_task_confirmation();
