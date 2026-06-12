-- 20260612000000_notification_create_rpc.sql
--
-- SECURITY: harden notification creation.
--
-- The old `notif_tenant_insert` policy let ANY authenticated tenant member
-- insert a notification row directly with an arbitrary `user_id`, `title`,
-- `body` and `tenant_id` (it only checked `tenant_id = my_tenant_id()`).
-- That allowed in-tenant notification forgery (fake "Transfer approved",
-- phishing-style messages to colleagues) and client-side tenant spoofing.
--
-- Fix: funnel ALL creation through a SECURITY DEFINER RPC that:
--   • stamps tenant_id from the caller's own auth context (never trusts the client),
--   • verifies the target user belongs to the caller's tenant,
--   • is the only path allowed to insert (the raw INSERT policy is dropped).
--
-- Deploy order: apply THIS migration BEFORE shipping the client that calls the
-- RPC. The client helper degrades gracefully (fire-and-forget) either way, so
-- the worst case during the deploy window is a few notifications silently not
-- created — never a crash.

create or replace function public.create_notification(
  p_user_id     uuid,
  p_title       text,
  p_body        text default null,
  p_type        text default 'general',
  p_entity_id   uuid default null,
  p_entity_type text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant        uuid := my_tenant_id();
  v_target_tenant uuid;
  v_id            uuid;
begin
  if p_user_id is null or p_title is null then
    raise exception 'user_id and title are required';
  end if;

  select tenant_id into v_target_tenant from profiles where id = p_user_id;
  if v_target_tenant is null then
    raise exception 'Target user has no tenant';
  end if;

  -- superadmin (no tenant of their own) acts within the target's tenant;
  -- everyone else may only notify users inside their own tenant.
  if my_role() = 'superadmin' then
    v_tenant := v_target_tenant;
  elsif v_tenant is null or v_target_tenant is distinct from v_tenant then
    raise exception 'Target user is not in your tenant';
  end if;

  insert into public.notifications
    (tenant_id, user_id, title, body, type, entity_id, entity_type)
  values
    (v_tenant, p_user_id, p_title, p_body, coalesce(p_type, 'general'), p_entity_id, p_entity_type)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_notification(uuid, text, text, text, uuid, uuid) to authenticated;

-- Close the raw-insert forgery surface — creation now only via the RPC above.
drop policy if exists "notif_tenant_insert" on public.notifications;
