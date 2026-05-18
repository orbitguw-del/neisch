# Operational TODOs

Running list of follow-up items, ordered by priority (highest first).
Last reprioritised: 2026-05-18.

---

## 🔴 P0 — Critical / blocking

- [ ] **Fix broken IPv4 internet on the office network** — router gets IPv6 but
  no IPv4. PC has no IPv4 default gateway; `tracert 8.8.8.8` returns
  "destination net unreachable" at the router (`192.168.0.1`). IPv4-only
  services (Supabase dashboard, `auth.supabase.io`) are unreachable. This blocks
  the DB work below. Action: restart router → check WAN/IPv4 status in router
  admin → call ISP for IPv4 / dual-stack (likely moved to IPv6-only or CGNAT).

---

## 🟠 P1 — High (launch blockers + security)

- [ ] **Audit other tables' RLS** for the `WITH CHECK` gap fixed on `profiles`
  — candidates: `tenants`, `sites`, `pending_invites`, `budget_lines`.

- [ ] **Play Store icon + screenshots upload** — manual upload via Play Console
  (asset paths under `C:\consne\*`).

- [ ] **Data Safety form** — fill in Play Console with declared data types
  (name, email, phone, address, worker ID-proof, app content; collected not shared).

- [ ] **Resolve frontend branch divergence from `main`** —
  `claude/heuristic-kepler-947fd0` is behind. Rebase + resolve, or cherry-pick.

---

## 🐞 P1.5 — Known bugs

- [ ] **Invite resend / revoke actions** — the Reports → Invites tab now lists
  all pending invites (email, role, site, code, sent, expiry, status). Still
  missing: resend and revoke buttons on the Team page (revoke DELETE policy is
  already in place from migration 009).

- [ ] **Invite allows already-registered emails** — `invite-user` creates a
  `pending_invite` for any email without checking if it's already a registered
  user. Result: existing users (in another role/tenant) get invited as if new,
  which is confusing and may break on accept. Fix: in `invite-user`, look up the
  email in `auth.users` first — if it already exists, either reject with a clear
  message ("this email already has a Storey account") or handle re-assignment
  deliberately. Decide the intended behaviour before coding.

---

## 🎯 P2 — Branding / polish

- [ ] **Google sign-in shows Supabase domain** — the consent screen says
  "continue to zgvbogxibiilnblmuohg.supabase.co". Branding (App name "STOREY" +
  logo) is already set in Google Cloud Console, but the domain line only changes
  once the OAuth app is **published + verified**. Google verification requires:
  1. Verify `storeyinfra.com` ownership in Google Search Console
  2. Add a visible privacy-policy link on the landing page (`Landing.jsx`)
  3. Submit for verification → 2–3 business day review
  App currently stays in **Testing** mode (fine — name/logo saved, nothing broken).
  Alternative: Supabase custom auth domain add-on (paid) → `auth.storeyinfra.com`.

---

## 🟡 P2 — Medium (legal / business)

- [ ] **Register a legal entity** (Pvt Ltd / LLP) via a CA — operating as an
  individual means unlimited personal liability. Move services under it once formed.

- [ ] **Consolidate accounts to one company email** — split across
  `orbitguw@gmail.com` and `karunroongta@gmail.com`. Create
  `admin@storeyinfra.com`; transfer Play Console, Supabase, Vercel, GoDaddy,
  Resend ownership to it.

- [ ] **Terms of Service** — write and add a `/terms` route (companion to `/privacy`).

- [ ] **Trademark "Storey" / "Storey Infra"** — file in the relevant class(es) in India.

- [ ] **Verify `help@storeyinfra.com` mailbox exists** — Resend can send to it,
  but if GoDaddy has no mailbox/alias, mail bounces. Check the GoDaddy email panel.

> NOTE: legal items are not legal advice — engage a CA + lawyer for India-specific items.

---

## 🟢 P3 — Lower (infra / devops / housekeeping)

- [ ] **Automate edge function deployment** — GitHub Actions workflow
  (`.github/workflows/deploy-functions.yml`) to auto-deploy all functions on
  push to `main` when `supabase/functions/**` changes. Needs repo secrets
  `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF`. Claude can build it.

- [ ] **SPF/DKIM warm-up for `noreply@storeyinfra.com`** — confirm green in
  Resend after first production sends; new domains get throttled by Gmail/Outlook
  for a few days.

- [ ] **Untrack `dist/` from git** — it's in `.gitignore` but was committed
  historically. One-time: `git rm -r --cached dist/` then commit.

---

## ⚪ P4 — Nice to have (UX / telemetry)

- [ ] **Inline "enroll your phone" hint in SMSOTPLogin** — after 2 failed sends,
  point users to Settings → Phone enrollment instead of a silent generic success.

- [ ] **Self-service phone change flow** — verified flow using the existing
  phone as a 2FA step (currently locked to support escalation).

- [ ] **Edge function status counters** — dashboard for 200/400/401/429/500
  responses per function, to spot unusual error rates.

- [ ] **`phone_verifications.attempts` distribution alert** — surface when a
  single user repeatedly hits the 5-attempt cap (brute-force signal).
