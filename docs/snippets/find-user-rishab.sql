-- Find any user matching "rishab*" — checks auth.users + profiles + phone.
-- Paste in Supabase Dashboard → SQL Editor.
-- Catches: Rishabh, Rishav, Rishu, typos, and auth-only signups missing a profile.

select
  u.id                    as user_id,
  u.email,
  u.phone,
  u.created_at::date      as signed_up,
  u.last_sign_in_at::date as last_login,
  u.email_confirmed_at is not null as email_verified,
  p.full_name,
  p.role,
  t.name                  as tenant,
  case when p.id is null then 'auth-only (no profile)' else 'has profile' end as state
from auth.users u
left join public.profiles p on p.id    = u.id
left join public.tenants  t on t.id    = p.tenant_id
where u.email      ilike '%rishab%'
   or u.phone      ilike '%rishab%'
   or p.full_name  ilike '%rishab%'
order by u.created_at desc;

-- If state = 'auth-only (no profile)' for any row, the `handle_new_user`
-- trigger failed for that user. Fix options:
--   (a) Manually insert a profile row: insert into profiles (id, role) values (...);
--   (b) Re-run the trigger logic against that user.
--   (c) Investigate why the trigger errored (check Supabase Logs → Database).
