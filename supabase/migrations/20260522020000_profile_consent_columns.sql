-- Tester / contractor consent capture for DPDP + ToS audit trail.
--
-- consent_at:   timestamp when the user first accepted ToS + Privacy Policy
-- consent_terms_version:    e.g. '2026-05-22' — bump when ToS revised materially
-- consent_privacy_version:  same idea for Privacy Policy
--
-- Set during sign-up by the register-tenant edge function.
-- We do NOT require consent for already-existing accounts (grandfathered) —
-- those will be prompted in-app on next login and the columns backfilled then.

alter table public.profiles
  add column if not exists consent_at timestamptz,
  add column if not exists consent_terms_version text,
  add column if not exists consent_privacy_version text;

comment on column public.profiles.consent_at is
  'Timestamp the user accepted ToS + Privacy Policy. Required for new signups (2026-05-22 onwards).';
comment on column public.profiles.consent_terms_version is
  'Version of Terms of Service accepted, typically the doc Last-updated date.';
comment on column public.profiles.consent_privacy_version is
  'Version of Privacy Policy accepted, typically the doc Last-updated date.';

-- RLS: users can read their own consent fields (already covered by existing
-- self-select policies on profiles); update is restricted to service role
-- via the register-tenant edge function. No new policy needed.
