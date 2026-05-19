-- ─── Migration: backfill profiles.email ──────────────────────────────────────
-- profiles.email is filled by the handle_new_user trigger on sign-up, but
-- demo / seeded accounts (and any users created before that trigger) have a
-- NULL email on their profile — so the Team roster shows "no email" for them.
-- Copy it across from auth.users for every profile that's missing it.

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and u.email is not null
  and (p.email is null or p.email = '');
