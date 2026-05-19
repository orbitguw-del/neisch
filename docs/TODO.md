# Operational TODOs

Running list of follow-up items, ordered by priority (highest first).
Last reprioritised: 2026-05-18.

---

## ⚠️ Scope decision (2026-05-18)

- [ ] **Decide: launch lean v1 now, or bundle the 2026-05-18 additions.**
  The app was feature-complete and launchable *before* 2026-05-18. The work
  done that day — offline mode, on-site photos, the Task/Work-Assignment
  module, the 4-stage transfer redesign, the attendance/daily-log confirmation
  layer — is genuinely **beyond original v1 scope** (effectively v1.5 / v2).
  It is also untested (see P0 below). Decision needed:
  • **Option A** — ship the original lean v1 now; treat the 2026-05-18 work as a
    fast-follow once verified. Faster to market, less launch risk.
  • **Option B** — fold everything into one bigger launch. More to test and
    stabilise first; later launch.
  Recommendation: A — don't let unverified v2 scope hold up a launchable v1.

---

## 🔴 P0 — Critical / blocking

- [ ] **Verify the 2026-05-18 build end-to-end — NOT yet tested in the app.**
  A large amount shipped on 2026-05-18 (offline mode, on-site photos, the
  Task/Work-Assignment module, the 4-stage material-transfer redesign, the
  attendance/daily-log confirmation layer). It all builds and the logic is
  sound, but **none of it has been exercised by a real user.** Before relying
  on it or adding anything new: walk each flow on `storeyinfra.com` —
  task assign→update→submit→confirm; transfer initiate→dispatch→approve→receive;
  attendance mark→confirm-day→payroll flag; photo capture (timestamp + zoom);
  offline entry → reconnect → sync. Fix whatever breaks before further work.

- [ ] **Upload `storey-v1.1.0.aab`** to Play Console (closed testing) — gets the
  offline + photo features to testers.

- [ ] **Fix broken IPv4 internet on the office network** — router gets IPv6 but
  no IPv4. PC has no IPv4 default gateway; `tracert 8.8.8.8` returns
  "destination net unreachable" at the router (`192.168.0.1`). IPv4-only
  services (Supabase dashboard, `auth.supabase.io`) are unreachable. This blocks
  the DB work below. Action: restart router → check WAN/IPv4 status in router
  admin → call ISP for IPv4 / dual-stack (likely moved to IPv6-only or CGNAT).

---

## 🟠 P1 — High (launch blockers + security)

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

- [ ] **SPF/DKIM warm-up for `noreply@storeyinfra.com`** — confirm green in
  Resend after first production sends; new domains get throttled by Gmail/Outlook
  for a few days.

---

## 🆕 New features — backlog (post-v1, tag before building)

- [ ] **Notifications** _(v1.x / v2 — new feature)_ — requested by viewers at the
  2026-05-18 presentation. Decide scope before building:
  • **In-app notification centre** — a bell + list (task assigned, transfer
    awaiting dispatch, item needs your confirmation). Lowest effort — the
    underlying data already drives the dashboard widgets; this consolidates it.
  • **Push notifications** — phone push via Capacitor + Firebase (FCM). Bigger:
    FCM project, device tokens, permissions, an Android rebuild.
  • **Email alerts** — via Resend (already wired) for key events.
  Recommended start: in-app centre first (reuses existing data); push later.
  Do NOT build until the 2026-05-18 build is verified (see P0).

> _Emergency work assignment — considered and dropped (2026-05-18). The Task
> module's existing `priority` field (low / normal / high) already covers urgent
> work; a separate feature isn't needed._

- [ ] **Project timeline / Gantt view** _(v1.x / v2 — new feature)_ — requested
  at the 2026-05-18 presentation: track a project's time frame. Good news —
  most of the data already exists: Task module tasks carry `start_date`,
  `due_date`, a parent→sub-task hierarchy and status; sites carry start/end
  dates. So this is mainly a **chart UI**, not new data work.
  Scope options:
  • **Read-only timeline** — tasks (and sub-tasks) drawn as bars on a date axis,
    grouped by site, with a "today" line and overdue bars in red. Lower effort,
    likely enough.
  • **Full Gantt** — plus drag-to-reschedule and dependencies. Much heavier;
    only if genuinely needed.
  Recommended: start with the read-only timeline. Could live as a Reports tab.
  Do NOT build until the 2026-05-18 build is verified (see P0).

- [ ] **"Return material" action** _(enhancement / hardening of the materials flow)_
  — when material is over-allocated to a work item, the leftover must go back to
  stock. Allocations are immutable (correct — like the ledger), so the fix is
  NOT editing/deleting the allocation. The `material_transactions` schema
  already has a `return` txn_type ("unused material returned to stock"); it
  just needs a UI action: pick the material + quantity returned + (optionally)
  link the originating allocation → posts a `return` transaction → stock rises.
  Closes RLS-audit finding #5.

- [ ] **Stock-adjustment approval workflow** _(enhancement / hardening)_ — the
  material ledger is now append-only (migration 20260519030000). The only way
  to correct stock outside normal receipts/transfers/consumption is an
  `adjustment` transaction. Per owner decision (2026-05-19), adjustments are an
  *audit* action and must be **approved by the Contractor**. Plan:
  • a store keeper / site manager *proposes* an adjustment (proposed quantity +
    reason), it does not change stock yet;
  • the Contractor reviews and approves → only then the `adjustment` ledger
    entry posts and stock updates;
  • rejected proposals are recorded but post nothing.
  Until built, treat `adjustment` as contractor-only by convention.

- [ ] **Material master list** _(enhancement / hardening of the materials feature)_
  — requested 2026-05-18. Today materials are free-typed per site, so the same
  material gets inconsistent names ("Cement" / "cement" / "OPC Cement"). This
  also quietly breaks transfers (the transfer code matches receiver material by
  name + unit). Plan:
  • a tenant-level `material_master` catalogue (name · unit · category · optional
    default rate);
  • when adding a material to a site, pick from the master list;
  • an "add new" option that creates the master entry once, then reuses it.
  Done = consistent material names across all sites; transfers match reliably.
  Also seed the master list with common construction materials.
  Do NOT build until the 2026-05-18 build is verified (see P0).

- [ ] **AI features — voice input first** _(v1.x / v2 — new feature)_ — explored
  2026-05-18. Principle: add AI only where it removes real friction for
  NE-India site users, never as decoration. Prioritised list:
  • **1. Voice input for daily logs / notes** _(start here)_ — speech-to-text,
    ideally Hindi/Assamese, so supervisors dictate instead of typing on a phone
    on site. The strongest, most demo-able, most defensible AI feature.
  • **2. Weekly AI digest for the contractor** — summarise all sites' daily logs
    + pending approvals into one short briefing.
  • **3. Anomaly flags in reports** — surface "labour cost up 30%", "worker
    present at two sites same day", etc.
  Avoid AI-washing: no generic chatbot, no "AI-powered" labels on plain rules,
  no auto-BOQ. Build ONE genuinely useful AI feature, not AI everywhere.
  Do NOT build until the 2026-05-18 build is verified (see P0).

> _BOQ / quantity take-off — parked as a LONG-TERM idea (~2 years out), 2026-05-18.
> Decided it is a specialised tool (Bluebeam/PlanSwift territory), a separate
> product rather than part of Storey's site-operations scope. Not on the active
> roadmap. Revisit only as a deliberate future product decision._

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
