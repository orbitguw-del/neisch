-- Who's using Storey — daily founder dashboard.
-- Run in Supabase → SQL Editor every morning during the 14-day production gate.
-- Shows sign-up + login activity per user, colour-coded by recency.

select
  p.full_name                  as name,
  u.email,
  u.phone,
  p.role,
  t.name                       as company,
  u.created_at::date           as signed_up,
  u.last_sign_in_at::date      as last_login,
  case
    when u.last_sign_in_at is null                       then '⚪ never opened'
    when u.last_sign_in_at >= now() - interval '1 day'   then '🟢 active today'
    when u.last_sign_in_at >= now() - interval '7 days'  then '🟡 active this week'
    else                                                       '🔴 cold'
  end                          as status
from auth.users u
left join public.profiles p on p.id    = u.id
left join public.tenants  t on t.id    = p.tenant_id
order by u.created_at desc;
