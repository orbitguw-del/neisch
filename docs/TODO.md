# Operational TODOs

Running list of follow-up items, ordered by priority (highest first).
Last reprioritised: 2026-05-31.

---

> _Scope decision (2026-05-18) — RESOLVED 2026-05-19: bundled. v1.1.1 ships the
> 2026-05-18 work (offline, photos, tasks, transfer redesign, confirmation
> layer) together. Build verified by the owner; uploading v1.1.1 to Play
> closed testing._
> _Build verified 2026-05-19 — see docs/VERIFICATION-2026-05-18.md. Any issues
> found from here on are tagged and added below as they surface._

---

## 🔴 P0 — Critical / blocking

- [x] ~~**Recruit 10 more closed-testers for Play Production access**~~ ✅ **DONE 2026-05-31.**
  12/12 testers opted in and 14-day window completed. App can now be promoted
  from closed to production track.
- [x] ~~**Office IPv4 stability**~~ ✅ **DONE 2026-05-31.**
  ISP dual-stack confirmed. 48+ hours stable IPv4, no drop.
- [x] ~~**Disable the duplicate slow NIC (Ethernet 2)**~~ ✅ **DONE 2026-05-31.**
  Ethernet 2 disabled, interface metrics set (LAN = 10, tether = 50).

---

## 🟠 P1 — High (launch blockers + security)

- [ ] **🔔 Notification forgery within a tenant** *(found 2026-06-12 module audit)* —
  the `notif_tenant_insert` RLS policy on `notifications` only checks
  `tenant_id = my_tenant_id()`; it does NOT constrain `user_id`. Any authenticated
  tenant member can insert a notification to **any colleague** in the same tenant
  with arbitrary title/body (fake "Transfer approved", phishing-style). Bounded to
  one tenant — no cross-tenant leak or privilege escalation. **Fix (coordinated
  deploy — migration + client together):** add a `SECURITY DEFINER create_notification()`
  RPC that stamps the row server-side, switch the client `createNotification()` helper
  (`src/stores/notificationStore.js`) to call it, then tighten/replace the broad INSERT
  policy. Do NOT remove the INSERT policy before the client is on the RPC or in-app
  notifications break. Migration NOT yet written — deferred off the live DB deliberately.

- [x] ~~**🧹 Dead `service_role` JWT tracked in `.claude/settings.local.json`**~~ ✅
  **FIXED 2026-06-12.** File untracked (`git rm --cached`) + added to `.gitignore`.
  Key was already disabled 2026-06-05 so no rotation needed; this closes the
  repo-hygiene tail (the disabled key still sits in git history — harmless).

- [x] ~~**🔑 Rotate exposed Supabase `service_role` key**~~ ✅ **VERIFIED DEAD 2026-06-05T07:31 UTC.**
  Audit history (corrects an earlier inaccurate "done 2026-05-31" claim):
  - **May 30:** Vercel `VITE_SUPABASE_ANON_KEY` migrated to new publishable
    key (`sb_publishable_zeHTe…`). Frontend on new key. **Legacy
    service_role JWT was NOT killed at this point — only anon was
    re-pointed in Vercel.**
  - **2026-06-05 12:00 IST:** Live curl with the leaked JWT from the
    public GitHub repo (`.claude/settings.local.json`, in repo since
    initial commit Apr 4) returned HTTP 200 with a real profile row.
    94-day exposure window confirmed.
  - **2026-06-05 12:30 IST:** All 9 edge functions verified using
    `SB_SECRET_KEY` (new `sb_secret_…`) via deployed keyprobe function.
    `SUPABASE_SERVICE_ROLE_KEY` env var Supabase auto-injects to edge
    functions was already auto-pointing to the new secret key.
  - **2026-06-05 12:55 IST:** v1.2.4 AAB (versionCode 27) built with
    new publishable key baked into the Android bundle. Legacy JWT
    string NOT present in the bundle (grep verified).
  - **2026-06-05 13:01 IST / 07:31 UTC:** Karun clicked
    "Disable JWT-based API keys" in Supabase dashboard → API Keys →
    Legacy tab.
  - **2026-06-05 13:02 IST:** Re-tested leaked JWT → HTTP 401 with
    Supabase message *"Legacy API keys are disabled. Disabled on
    2026-06-05T07:31:19.361753+00:00"*. **Kill verified.**
  - **2026-06-05 13:02 IST:** Smoke test `register-tenant` edge
    function returned expected HTTP 400 ("Missing email…") — function
    handler reached using new secret key. Backend integrity verified.
  Pending follow-up:
  - Upload v1.2.4 AAB to Play Console closed testing (release
    `C:\Users\model\Desktop\storey-v1.2.4.aab`) so installed v1.2.3
    APKs (built with legacy anon JWT) get updated within an hour.
  - Remove the dead legacy JWT string from `.claude/settings.local.json`
    as repo hygiene (no security value once disabled, but it's clutter).
  - Forensics: review Supabase Postgres logs for any service_role
    queries during the 94-day exposure window (Apr 4 → Jun 5) from
    IPs that aren't yours, Vercel, or Supabase Edge runtime. If clean
    → no incident. If hits found → open incident doc per
    INCIDENT-RESPONSE.md runbook.

- [ ] **Play Store icon + screenshots upload** — manual upload via Play Console
  (asset paths under `C:\consne\*`).

- [x] ~~**Upload v1.2.1 AAB to Play Console**~~ ✅ **DONE 2026-05-24.**
  versionCode 23, versionName "1.2.1", 3.3 MB. Submitted to closed testing track.

- [ ] **Data Safety form** — fill in Play Console with declared data types
  (name, email, phone, address, worker ID-proof, app content; collected not shared).

---

## 💳 Pricing & payment tiers *(NEW feature — set 2026-06-01; NOW IN 90-day plan)*

> **Moved into `docs/ROADMAP-90.md` on owner instruction (2026-06-01).**
> - **Pricing model: DECIDED** (below).
> - **Feature gating: Phase 2 (Day 31–60), item 9** — build the tier gate on the
>   `tenants` plan column as the Pro/v1.2 features are built (low marginal cost).
> - **Payment collection: Phase 3 (Day 61–90), LEAN** — first 5 contractors via
>   manual UPI/bank + manual plan-flag flip. **Razorpay self-serve is a
>   fast-follow AFTER 5 manual payments validate the price — not a Day-90 blocker.**
> This avoids over-building billing before the price is proven.

**Tiers as stated by owner (2×2 on sites × feature-depth, + Free):**

| Plan | 1 site | 3 sites | Each site beyond 3 | What you get |
|---|---|---|---|---|
| **Free** | ₹0 (1 user) | — | — | **Recording only** — no budgeting, no cost-centres, **no material workflows** (no goods-receipt-from-vendor inward register, no material transfer). Manual stock entry only. |
| **Standard** | ₹999 | ₹2499 | +₹799 | Multi-user (all roles), full recording, basic reports |
| **Pro / full suite** | ₹1999 | ₹4999 | +₹799 | + budgeting, cost-centres, **sub-contractor module + Work Order PDF** |

**Billing: BOTH monthly and annual — monthly is the on-ramp, annual is the
conversion.** Funnel: **Free** (acquire) → **Monthly** (low-commitment try, no
big upfront — beats the Tally one-time objection) → **Annual** (convert once
hooked; "pay for 10 months, use 12" = 2 months free as the lever; also fixes
cash flow with a year prepaid). Prices above are the monthly rate; annual =
monthly × 10. Annual figures: Standard 1-site ₹9,990 · Standard 3-site ₹24,990
· Pro 1-site ₹19,990 · Pro 3-site ₹49,990 · extra site ₹7,990 each.
Conversion mechanics for build time: a gentle in-app nudge after N active months
("you've used Storey 4 months — go annual, get 2 months free"). Switching cost
(their data + team already in the system) makes annual the natural choice.

- "Multi-user at different capacity" = the existing role hierarchy (site_manager
  / supervisor / store_keeper). Free = contractor solo; paid unlocks team.
- **Pro = the v1.2 bundle features.** Clean GTM: Free/Standard ship now,
  **Pro unlocks when v1.2 lands** ("upgrade to Pro" = the v1.2 launch moment).
- Per-site economics: Standard 3-site ≈ ₹833/site; Pro 3-site ≈ ₹1666/site;
  add-on flat ₹799/site beyond 3 (note: on Pro this is <½ the in-bundle rate —
  big marginal discount, fine if a deliberate scale play).

**Open questions (owner dismissed the clarifier — resolve before building):**
- [x] **Billing period — RESOLVED 2026-06-01: BOTH monthly + annual.** Monthly =
  on-ramp/trial; annual = conversion (pay 10 months, use 12 = 2 free). Contractor
  starts monthly, converts to annual when happy.
- [ ] Exactly what Free excludes — known so far: **no budgeting, no cost-centres,
  no goods-receipt-from-vendor, no material transfer** (manual stock entry only —
  the structured material workflows are paid). Still to pin down: does Free get
  basic reports? attendance confirmation flow? (sub-contractor is Pro-only.)
- [ ] Does the ₹799 add-on site inherit the plan's tier (Pro extra = Pro features)?
  Assume **yes** until told otherwise. Should the add-on scale with tier instead
  of flat ₹799 (e.g. +₹799 Standard / +₹1299 Pro)?
- [ ] Does the **₹999 Standard "dead middle"** survive? Only ₹1k below Pro, but
  Pro holds the real value — risk customers skip Standard (Free → Pro). Keep only
  if "multi-user without budgeting" is a real heard need; else collapse to Free→Pro.
- [ ] Annual discount? Free-trial-then-pay path? Grace period / read-only lock on
  downgrade (don't delete extra-site data)?

**Build notes (for when it's time):**
- Plan enforcement already has a foundation: `tenants` has a plan column + a
  plan-lock migration (`20260519020000`). Tier limits (site count, user count,
  feature flags) should be enforced in RLS / app guards keyed off the tenant plan.
- Free→paid upgrade and paid→free downgrade need a defined data-handling rule
  (e.g. downgrade to free with >1 site: read-only lock on extra sites, not delete).
- Ties to legal: paid tiers change the liability picture (see Owner directive #2
  — free/pilot ₹0-liability clause vs paying-customer terms).

---

## 🏛️ Owner strategic directives *(set 2026-06-01)*

> Eight directives from Karun. **Execution rule (his #3): nothing matters
> except the 90-day checklist — follow `docs/ROADMAP-90.md` exactly, don't
> build beyond it.** So these are RECORDED + classified here; only the ones
> already inside the 90-day plan get built now. The infra/feature items
> (DBs, environments, KYC, offboarding) are gated to the milestone noted on
> each. This block is the canonical reference for all eight.

**1. Company in a limited-liability entity, NOT personal name.** *(already
P2 "Register a legal entity" + roadmap Day-30 file / Day-90 certificate.)*
Reinforced: launch under the Pvt Ltd / LLP for security, branding, legal &
financial protection. Operating personally = unlimited personal liability.
Status: in the 90-day plan (CA quote Fri May 30 → file Day 30 → cert Day 90).

**2 + 7. Legal / Terms of Service — VALIDATE WITH A REAL LAWYER.** *(extends
P2 "Terms of Service".)* The PDFs on disk are boilerplate — not sufficient.
Two clauses are **critical** and must be lawyer-drafted before more pilots use it:
- **Liability waiver for non-paying pilot users** — explicitly state Storey is
  NOT responsible for any business loss, construction delay, or damage arising
  from use, *especially* for free/trial contractors evaluating the product.
  Without this, the software can be blamed for site delays and you could be
  bound to pay.
  → **Draft written 2026-06-01** in `docs/TERMS-OF-SERVICE-DRAFT.md` §8.7
  (construction & operational outcomes — delays, defects, safety, cost overruns,
  data accuracy) + §9.0 (free/trial/pilot users: ₹0 liability, at-own-risk).
  **Still TODO:** (a) lawyer validates both clauses; (b) only then port the
  validated text into the live `src/pages/Terms.jsx`; (c) capture explicit
  consent (the consent-stamp flow in register-tenant already records
  terms_version — bump it when these land).
- **Data-privacy indemnity (#7)** — explicitly state the DB holds the
  contractor's inventory / HR / financial data, the contractor consents to
  this, and Storey is not liable for that data being held.
- ⚠️ Claude must NOT present any drafted clause as legally validated — a
  qualified Indian lawyer signs off. Gate: before onboarding any contractor
  who isn't Arun; hard-required before charging (Day 90).

**3. Execution discipline — follow the 90-day checklist exactly.** Meta-rule,
not a build item. Don't be pulled beyond `ROADMAP-90.md`. (This is why 4/5/6/8
below are recorded, not built now.)

**4. Three databases — test · quality · production.** *(NEW infra — v1.x,
gate: when real paying contractors are on prod, ~Day 90+.)*
- **Test DB** — junk/demo data only. NEVER given to a live customer.
- **Quality DB** *(optional, suggested)* — refreshed from prod every 6 months;
  lets a change that passed test be re-tried against real-shaped data before prod.
- **Production DB** — live customer data, audited, sacrosanct. Only real
  contractors with valid govt permits + GST IDs (ties to #6).
- ⚠️ **Near-term risk to flag now:** today there is effectively one Supabase
  project; dev/test activity and would-be-real data share it. Minimum viable
  step before real paying data lands = a **separate Supabase project for prod**,
  distinct from the dev/test project. Full 3-tier split can come later.

**5. Three code environments — development · quality · production.** *(NEW
infra — v1.x, pairs with #4.)* Dev env → Test DB (in-dev work, fix-and-retest
here). Quality env → Quality DB (only changes that passed dev testing).
Production env → Production DB (golden code + live data). Today: `main` →
Vercel prod auto-deploy, single Supabase. Gate same as #4.

**6. Builder/contractor KYC at sign-up.** *(NEW onboarding hardening — v1.x,
gate: before production/charging.)* A contractor account must capture + store
**govt-issued proof of incorporation + GST ID** — Gmail alone is insufficient
to prove they're a legally registered builder. Feeds #4's rule that prod data =
only verified contractors. Schema: KYC fields + document upload on the
tenant/contractor record, with a verified/pending status.

**8. User offboarding + Storey ID ↔ login mapping.** *(NEW security — v1.x;
best-practice design below, interim hardening can land sooner.)* When a
supervisor/contractor leaves (e.g. joins a competitor), their Gmail must NOT
still return either tenant's data. **Confirmed gap:** today `my_role()` /
tenant resolution read straight from `profiles` (one tenant per profile) and
there is **no status/is_active flag** — no clean deactivation path exists.
Design (see session 2026-06-01 / project memory):
- Mint a stable **Storey ID** per person; map it to login methods (Gmail/phone).
  Storey ID — not the Gmail — is what's granted access to a tenant.
- Move tenant access to a **`memberships`** row `(user_id, tenant_id,
  storey_user_id, role, status[active|suspended|offboarded], joined_at,
  offboarded_at, offboarded_by)`. RLS keys off *active* membership only. Same
  person at a new company = new membership; sessions are scoped to one tenant
  (Slack-workspace model) so two tenants' data never co-mingle.
- **Offboarding workflow** (contractor/site_manager action): set status →
  offboarded, clear `site_assignments`, **revoke refresh tokens / force
  sign-out** via an admin edge function, write an audit row.
- **Interim low-cost hardening (can ship before the full memberships refactor):**
  add `profiles.status`; make `my_role()`/`my_tenant_id()` return NULL when not
  active (instantly cuts all data); add the offboarding action + token revoke.

---

## 🔐 Senior Dev Audit Bundle — v1.3 *(2026-05-31)*

Full-stack audit pass across frontend · edge functions · DB · build config.
All findings below are **verified against live code** (not hypothetical).
Ship as one migration + one deploy after Play Store promotion is done.

### 🟠 HIGH — Ship this sprint

- [x] ~~**OTP generation uses Math.random()**~~ ✅ **DONE 2026-05-31.**
  Replaced with `crypto.getRandomValues()` in send-sms-otp, enroll-phone-otp,
  link-phone, and invite code in invite-user. Commit `46fc9e95`.

- [x] ~~**CORS wildcard on all 9 edge functions**~~ ✅ **DONE 2026-05-31.**
  Replaced `*` with origin whitelist (storeyinfra.com + *.vercel.app).
  Capacitor/no-origin passes through. Commit `46fc9e95`.

- [x] ~~**All edge functions return HTTP 200 for errors**~~ ✅ **DONE 2026-05-31.**
  sign-up-with-invite now returns 400/403/500 correctly. All other functions
  already had correct status codes. Commit `46fc9e95`.

### 🟡 MEDIUM — Ship this sprint

- [x] ~~**6x console.log() in AuthCallback.jsx leaking session data**~~ ✅ **DONE 2026-05-31.**
  Routed through a dev-only `dlog()` helper guarded by `import.meta.env.DEV` —
  silent in prod builds, available in dev. Commit `8f14b832`.

- [x] ~~**`.env.txt` stale duplicate tracked in git**~~ ✅ **DONE 2026-05-31.**
  Removed via `git rm .env.txt`, committed and pushed.

- [x] ~~**Missing input validation in edge functions**~~ ✅ **DONE 2026-05-31.**
  Added 400-on-bad-input across 7 functions: email format, E.164 phone, 6-digit
  OTP, min password length, role whitelist, company-name length. Verified
  deployed — bad input → 400, valid input still passes. Commit `80c760b3`.

### 🟢 LOW — Next cleanup pass

- [x] ~~**No error boundaries on list renders**~~ ✅ **DONE 2026-06-01.**
  ErrorBoundary gained an optional inline `fallback`; Workers/Materials/Sites
  lists now wrapped so a bad row shows a "Try again" card, not a blank page.
  Commit `0dff9fd7`.

- [x] ~~**Workers toggle doesn't revert UI on DB failure**~~ ✅ **DONE 2026-06-01.**
  Corrected the diagnosis: `updateWorker` commits to local state only AFTER the
  DB write succeeds, so there was never a stale-UI mismatch — the real bug was a
  silently-swallowed failure. Now surfaced as a dismissible banner. Commit `0dff9fd7`.

> Build order: finish Play Store promotion first, then ship this as one focused
> deploy — one PR, one migration, one `supabase functions deploy --all`.

- [x] ~~**Resolve frontend branch divergence from `main`**~~ ✅ **DONE 2026-05-24.**
  All 10 stale local branches deleted (`claude/*`, `session/*`, `security/*`, `master`).
  Single orphan worktree (`heuristic-kepler-947fd0`) removed. `main` is the only
  local branch. `backup/local-main-20260518` kept — has 3 unique commits
  (native Google Sign-In, RLS hardening, deep-link fix) not yet in main.

- [x] ~~**Confirm `help@storeyinfra.com` mailbox is live**~~ ✅
  **VERIFIED 2026-05-20.** Round-trip test fired via the deployed
  `send-support-email` edge function (Resend → help@) — mail arrived at
  Karun's forwarding inbox. Beta poster is safe to broadcast.
  `info@storeyinfra.com` remains blocked behind Google verification; using
  `help@` going forward on all customer-facing assets.

---

## 📱 Bugs queued for next APK release *(batch — ship in one go)*

> **Pattern:** small UI fixes get shipped to **web** (storeyinfra.com) immediately
> via Vercel auto-deploy, but the **APK has to be rebuilt + Play Console
> reviewed** to reach installed testers. Don't ship a new APK for each bug —
> batch them. Build the next APK when (a) v1.2 is ready, OR (b) the list below
> hits ~5 bugs, OR (c) one of them is severe enough to justify a one-off ship.
>
> When you build the next APK: bump versionCode + versionName, list the fixes
> in release notes, mark them resolved here.

### Bundled into v1.2.3 (versionCode 25) — built 2026-06-03 ✅

Sub-contractor module (Phase 1 — directory + daily labour) + daily log multi-photo + invite hardening + logo fix.
AAB at `android\app\build\outputs\bundle\release\app-release.aab`.

- [x] **Sub-contractor directory** — contractor adds sub-contractors (name, phone, type with 12 presets + custom "Other")
- [x] **Sub-contractor site assignments** — many-to-many: one sub-contractor across multiple sites, multiple sub-contractors per site. Contractor assigns via checklist. Supervisor logs only see assigned sub-contractors.
- [x] **Daily labour headcount log** — supervisor logs headcount per sub-contractor per site per day, with up to 20 photos (each captioned, timestamped). Upsert-safe — re-logging same day updates in place.
- [x] **Sub-contractor presence in daily log** — each daily log card now shows labour counts from all sub-contractors on that site+date inline.
- [x] **Daily log multi-photo** — replaced single `photo_path` with `daily_log_photos` table; up to 20 photos per log, each with optional caption. Backwards-compatible — old single-photo logs still display.
- [x] **Invite flow hardened** — email locked from server (SECURITY DEFINER RPC prevents typos like `gmail.con`); switched to `supabase.functions.invoke`; CORS fixed for Android; better post-creation UX.
- [x] **StoreyIcon logo clip fixed** — "TORE'" clipping resolved; `textLength` constrains label to viewBox; `showText={false}` at small sizes where label is redundant.

**v1.2.3 ready to upload:**
- `app-release.aab` → Play Console closed track

---

### Bundled into v1.2.2 (versionCode 24) — built 2026-06-01 ✅

v1.3 senior-dev audit bundle (frontend portion) + SMS country-code removal.
AAB at `android\app\build\outputs\bundle\release\app-release.aab` (3.9 MB, signed).
- [x] SMS OTP — drop country-code entry, default +91 (10-digit input + prefix box)
- [x] Error boundaries on Workers / Materials / Sites lists (inline fallback)
- [x] Worker status-toggle failures surfaced (was silently swallowed)
- [x] AuthCallback debug logs gated behind `import.meta.env.DEV`
- (edge-function security fixes — OTP entropy, CORS, validation, status codes —
  are server-side, already live, no APK needed)

**v1.2.2 ready to upload:**
- `app-release.aab` (3.9 MB, versionCode 24) → Play Console closed track

---

### Bundled into v1.2.1 (versionCode 23) — built 2026-05-24 ✅

All tester bug fixes (Tm Kazip rounds 1 & 2) + full UI audit (critical + medium
passes). 28 fixes total. AAB at `android\app\build\outputs\bundle\release\app-release.aab` (3.3 MB).
- [x] Equipment stat card label overflow
- [x] Landing page ✕ bullet misalignment
- [x] Landing page logo doubled
- [x] Attendance bottom bar overflowing on mobile (pill buttons + stacked bar)
- [x] Attendance P button confusing → proper colour-coded pill buttons
- [x] Inventory unit_cost / reorder not editable → EditMaterialForm added
- [x] Workers Activate button invisible → green outlined button
- [x] Full UI audit critical pass (11 fixes — StatCard colours, Reports tabs overflow, tables responsive, StoreKeeper empty state, Settings version)
- [x] Full UI audit medium pass (17 fixes — Dashboard "View all" buttons, status stripes, SupervisorDashboard, weather, Tasks errors inline, Expenses colours, Team/Equipment/Header polish)
- [x] Android debug symbols enabled (`ndk { debugSymbolLevel 'FULL' }`) — Play Console warning resolved

**v1.2.1 ready to upload:**
- `app-release.aab` (3.3 MB, versionCode 23) → Play Console closed track

---

### Bundled into v1.1.6 (versionCode 20) — built 2026-05-21 ✅

- [x] ~~Worker form too long~~ (`fa82776e`) — progressive disclosure: 5
  essential fields + photo, rest behind "+ Add more details" toggle.
- [x] ~~Site detail title squashing + action buttons clipping~~ (`b391b6dc`)
  — PageHeader stacks vertically on mobile + `min-w-0` on title; SiteDetail
  action row gets `flex-wrap`. Fixes every page using PageHeader.
- [x] ~~Supervisor Dashboard visual-first redesign~~ (`10eaa807`) — new
  HeroStatsCard + QuickActionTile components; rewritten layout per
  `mockup-visual-first-dashboard.jpg`. Path A Day 1 of dashboard rewrite.
- [x] ~~Orphan-user registration failure~~ (`59971eeb`) — edge-function-only
  fix, already live for installed apps. Bundled here for completeness.

**v1.1.6 ready to upload:**
- `app-release.aab` (3.28 MB, versionCode 20) → Play Console closed track
- `app-release.apk` (2.5 MB, versionCode 20) → side-load to Arun directly

*(add new bugs below as testers report them — keep entries one line each
when possible, with: what's broken · where · severity · commit hash if
fixed on web · APK status)*

---

## 🐞 P1.5 — Known bugs

- [ ] **Beta activation funnel leak** *(observed 2026-05-20 from User Activity
  CSV)* — of 10 real prospects in the DB, **3 never signed in** (budhi
  roongta, parthroongta756, ...) and **2 are inactive 14+ days** (naturalnidhs,
  sarmahupamanyu — duplicate of Upamanyu's primary account). That's a 50%
  drop-off between sign-up and first login. Action: re-engage the 3
  "never-signed-in" prospects directly via WhatsApp before any cold outreach
  — they've already handed over their email, the friction is at install /
  first-login.

- [ ] **Auth-only users (no profile) — investigate** *(2026-05-20)* — a user
  ("Rishab" / variants) is reported as registered but does not appear in the
  profiles-based User Activity CSV. Possible causes: (a) `handle_new_user`
  trigger failed silently, leaving them in `auth.users` with no `profiles`
  row; (b) different spelling (Rishabh / Rishav / Rishu); (c) they never
  actually completed signup. Diagnostic query saved at
  `docs/snippets/find-user-rishab.sql` — paste in SQL Editor. If any rows
  return with `state = 'auth-only (no profile)'`, that's a real bug — fix
  `handle_new_user` or add a one-off insert.


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

- [🟢 IN PROGRESS] **Register a legal entity — "Storey Labs Private Limited"** (Pvt Ltd)
  **Filed with MCA on 2026-06-05** via CA. Awaiting name approval (Day 1-3),
  then SPICe+ Part B incorporation review (Day 7-15), then COI + PAN + TAN.
  Live status tracked in `_reference/MCA-application-status.md`.
  *(Name + structure set 2026-06-01; filed 2026-06-05 — 4 days ahead of
  TIMELINE.md Day 16 plan.)*
  - **Name (1st preference):** Storey Labs Private Limited
  - **Name (2nd preference / fallback):** Storey Infra Private Limited
  - **Directors:** Karun Roongta + father (decision made 2026-06-05 over
    son-as-director option; rationale: adult evaluation capacity, cleaner
    separation from personal debt exposure, lower fraudulent-transfer risk).
  - **Cap table (proposed, pending CA confirmation):** founder ~99% / father
    ~1% to meet the 2-shareholder minimum.
  - **⚠️ Founder has personal debt** → structure for clean separation; **no new
    personal guarantees, no personal borrowing to fund the company, route all
    revenue (clinic ₹30k, Storey) to the company not personal accounts.** The
    son-shareholding allocation must be a clean founding allocation, not
    asset-shielding — **CA + insolvency-aware lawyer to vet intent/timing.**
  - **Downstream once name is final:** swap "Storey Infra Pvt Ltd" → "Storey
    Infra Tech Private Limited" in Privacy draft, ToS draft, lawyer brief, clinic SOW.
  - Keep the **"Storey" trademark** filing separate (company name ≠ trademark).

- [ ] **Consolidate accounts to one company email** — split across
  `orbitguw@gmail.com` and `karunroongta@gmail.com`. Create
  `admin@storeyinfra.com`; transfer Play Console, Supabase, Vercel, GoDaddy,
  Resend ownership to it.

- [ ] **Terms of Service** — write and add a `/terms` route (companion to `/privacy`).

- [ ] **Trademark "Storey" / "Storey Infra"** — file in the relevant class(es) in India.

> _`help@storeyinfra.com` mailbox check moved to P1 (2026-05-20) — it's now
> printed on the beta poster, so it's a launch blocker, not a P2 cleanup._

> NOTE: legal items are not legal advice — engage a CA + lawyer for India-specific items.

---

## 🚶 P0 — Local field marketing *(set 2026-06-05)*

**Decision:** 50% of founder time → local field marketing. No more PDF/PPT
production unless it directly supports a site visit.

**The 14-day target (Day 0 = 2026-06-05, Day 14 = 2026-06-19):**

- [ ] **6 site visits done** (one referral → one in-person demo at a working site)
- [ ] **2–3 new tester sign-ups** from those visits
- [ ] **1 paying customer** at founder pricing (₹500–1500/site/month — must be real money, no free pilots)
- [ ] **Running objections log** captured after every visit (in `docs/FIELD-VISITS-LOG.md`)

**Channel discipline:** local field only. No LinkedIn, no YouTube, no broadcasts
this fortnight. One channel, executed seriously.

### Week 1 — referral mining (Day 0–7)

- [ ] WhatsApp each of the 12 testers individually (NOT a broadcast). Ask for
      1–2 contractor referrals each. Target: **6 warm referrals from 12 testers
      in 5 days**.
- [ ] If fewer than 3 referrals come back → testers aren't getting enough value.
      That's a product problem; pause field push and diagnose.
- [ ] Of the 12, pre-bet on the 3 most likely to refer. Karun to name them in
      next session.

### Week 1–2 — site visits (Day 3–14)

- [ ] Minimum **3 site visits per week**. Each visit must be at a working
      construction site, not an office or cafe.
- [ ] Use the 3-question diagnostic BEFORE pitching anything:
      1. Aapke kitne sites abhi active hain?
      2. Worker attendance kaise track karte ho — abhi?
      3. Pichhle hafte kitna time excel/notebook pe gaya?
- [ ] Qualified prospect = **3+ active sites AND 5+ hrs/week on Excel**. Anyone
      else: friendly chat, ask for referral upward, leave.
- [ ] Demo on **their** phone, not yours. Sign them up live, add 1 site, mark
      1 worker present.

### Physical channels to test in Guwahati

- [ ] Mid-morning site rounds in Bhangagarh / Six Mile / Khanapara
- [ ] Hardware + material supplier shops in Athgaon / Fancy Bazar
- [ ] CREDAI Assam Guwahati branch — get a tester to introduce to the secretary
- [ ] GIDC industrial estate site offices

### Tools to build — ONLY after first 2 cold visits done

Karun's decision: build tooling *after* using bare-hands version twice, so we
know what actually hurts.

- [ ] One-page A4 leave-behind (face + number + QR + 3 bullets). Printable.
- [ ] Pre-loaded demo tenant seed (resets phone to realistic 1-site / 8-worker
      / 3-day-attendance state in 30 seconds before each visit)
- [ ] `docs/FIELD-VISITS-LOG.md` template (contractor, site, date, 3 diagnostic
      answers, what they said, next action, follow-up date)

### What NOT to make this fortnight

- ❌ Another pitch deck
- ❌ Another brochure / poster / PDF
- ❌ Landing page redesign
- ❌ Anything that doesn't get a contractor to download the APK

### Day-14 review gate

If at Day 14: **0 paid customers AND <3 new sign-ups AND >0 new PDFs created**
→ the 50% was wasted. Recalibrate channel choice and try again. Do not extend
without honest assessment.

---

## 🤝 P1 — Pilot prospects *(new — 2026-05-20)*

Track every contractor who's been pitched, in order of how close they are to
saying yes. Update statuses here, not in WhatsApp memory.

Statuses: **Pitched** → **On beta (trial)** → **Active pilot** → **Paying** → **Passed**

| Name | Org / role | Source | Status | Gmail | Asked-for features | Last touch | Next step |
|---|---|---|---|---|---|---|---|
| **Arun** | Contractor (own firm) | Family — father's friend's son | **Pitched** (WhatsApp sent 2026-05-20: data-security + Tally backup + beta invite + soft pilot Q) | _awaiting_ | (1) Material budget vs actual · (2) Sub-contractor onboarding · (3) "Like Tally" data ownership | 2026-05-20 | Wait 24–48h. If no reply, follow up *once* with a single line — no more. |

> Rules:
> 1. **Don't chase.** After WhatsApp, wait 48 hours. One polite nudge if silent. After that — move on, come back in 4 weeks.
> 2. **Capture every "no" as well** — passes today often become yeses in 12 months.
> 3. **A pitched prospect is not a tester.** They only count toward the 12-tester gate after they install + sign in.
> 4. **Don't start the v1.2 build for any prospect's request unless they confirm pilot intent.** Real contractor + real "yes" + real install is the trigger.

---

## 🤝 P2 — Advisors & fundraising *(new — 2026-05-20)*

Tracked in detail in `docs/ADVISORS.md`. Headline items:

- [ ] **Send a 15-min intro message to Avinash Chirania** (4Line Designs) — slot
  #1 priority (construction industry + NE network). Already on advisor pipeline
  as "Target".
- [ ] **Send a 15-min intro message to Upmanyu Sharma** — slot #7 (technical /
  ERP architecture sounding-board), not slot #2.
- [ ] **Fill slots #2 (SMB-SaaS GTM) and #3 (NE network) with 2 candidates
  each** — these are the two highest-leverage open slots. For slot #3, a former
  head of an NE incubation centre is the strongest single profile (one
  connector replaces five rolodexes).
- [ ] **Apply to Assam Startup / Nest-i + NEDFi seed schemes** — non-dilutive
  grants (₹2–50 lakh), based in Guwahati. Free money to apply for; slow but
  reduces the angel round you actually need.
- [ ] **Apply to Startup India Seed Fund (SISFS)** via IIM Shillong or IIT-G
  incubator — ₹20L grant + ₹50L convertible.
- [ ] **Defer angel raise** until: (a) Pvt Ltd registered, (b) 10+ paying
  contractors live, (c) entity-level bank account opened. Standard cheque size
  to plan for: ₹10–25 lakh on a **SAFE / CCD** with ₹5 cr valuation cap + 20%
  discount → ~2% equity per ₹10 lakh. **Never sign a priced equity round at
  this size — fees alone eat 10% of the cheque.**

---

## 🟢 P3 — Lower (infra / devops / housekeeping)

- [ ] **SPF/DKIM warm-up for `noreply@storeyinfra.com`** — confirm green in
  Resend after first production sends; new domains get throttled by Gmail/Outlook
  for a few days.

- [ ] **Revisit native camera plugin** *(2026-05-21 — punted to v1.x cleanup)*
  — v1.1.5 bypasses `@capacitor/camera` entirely on Android, routing through
  the HTML file-input path that already worked on storeyinfra.com. Native
  plugin crashed Android 16 (targetSdk 36) WebView between steps [3] and
  [4] of the diagnostic build (`v1.1.4-debug`). Two likely root causes
  (unverified):
  1. `@capacitor/camera@8.2.0` not yet patched for Android 16 / targetSdk 36
  2. Some manifest / FileProvider config we missed in v1.1.2
  Resolution path: when @capacitor/camera publishes a version >8.2.0, test
  on a real Android 16 device. If still broken, capture logcat + file an
  issue at github.com/ionic-team/capacitor-plugins. Until then, the file-
  input path serves real users fine. Trade-off: gallery option may appear
  alongside camera in the picker — acceptable for v1, fix later if any
  customer flags it. Also: re-evaluate the `READ_MEDIA_IMAGES` /
  `<queries>` / FileProvider entries in AndroidManifest — they were added
  for the now-bypassed native plugin. After 30 days of stable file-input
  capture, trim the manifest down to just `INTERNET` + `CAMERA` if file-
  input doesn't need the rest.

- [ ] **Evaluate removing `READ_MEDIA_IMAGES` permission post-v1.2**
  *(2026-05-21 — tech-debt review)* — v1.1.2 declared READ_MEDIA_IMAGES
  defensively to fix the camera crash on Android 13+ (commit `6e09bda8`).
  Justified in Play Console "Photo and video permissions" form on
  2026-05-21. Capacitor's pure `CameraSource.Camera` flow technically
  doesn't need this permission — captured photos live in app-private
  storage, not the media store. After 30 days of stable photo telemetry
  in v1.2 (Day 90), test removing it on Android 13+ devices and shipping
  a manifest-trimmed v1.x release. Less permission = cleaner Play Store
  listing + one less "this app accesses your photos" warning to users.
  Trigger to revisit: 2026-06-20 (Day 30 of v1.2 in production).

- [ ] **Illustration system — proper version** *(v1.x — design quality, not engineering)*
  *(2026-05-20)* — visual-first + three-tier rule locked in CLAUDE.md.
  A v1 line-art library was rendered (`src/components/illustrations/index.jsx`,
  preview at `illustration-library-preview.html`) but owner judged the render
  quality not satisfactory — strokes mechanical, proportions programmer-art,
  not distinctive enough for the brand. **Style is open: it does NOT have
  to be strict line art.** Real options to evaluate before re-attempting:
  1. **Hire a designer** (Fiverr / Dribbble, ~₹5–20k for a 16-set pack,
     1–2 weeks). Best result, smallest opportunity cost vs Karun's time.
     Recommended path once cashflow allows.
  2. **Storyset** (storyset.com) — free customisable SVG illustrations,
     professional quality, terracotta-tintable. Quick win, distinctive
     look. Check construction / business categories.
  3. **Iconify + construction sets** (Mdi, Fontisto, Game-Icons) — large
     coverage, good for Tier 1 + decent for Tier 2.
  4. **Two-tone filled silhouettes** (no stroke, terracotta primary +
     sand secondary fill) — more distinctive than pure line art, still
     lightweight. Iterate myself.
  5. **Isometric line + fill** — Notion / Slack style. More character,
     slightly heavier files. Iterate myself.
  v1 files stay on disk as a placeholder reference. Do NOT integrate them
  into Supervisor dashboard / Inventory / Tasks. Wait until v2 lands.
  Pre-requisite for re-attempt: pick a style (1–5 above), then re-render
  in that style, get owner approval, then ship.

- [ ] **Hindi / Assamese language toggle** *(v1.x — Settings option, opt-in)*
  — set 2026-05-20: in-app UI stays English by default (most NE-India
  contractors find a Hindi-default app condescending — Tally, GST portal,
  banking apps are all English and that's the respected posture). When a
  contractor wants to roll Storey out to a low-English supervisor, they
  flip a Settings toggle: **Language → English (default) / हिन्दी /
  অসমীয়া**. Per-tenant or per-user — decide before building. Stack:
  `react-i18next` + JSON translation packs. Effort: ~2 days wiring +
  ongoing translation. Build only after one customer explicitly asks
  ("my supervisor can't read English").

- [ ] **Project memory refresh — every 2 days** *(2026-05-20)* — the
  Claude memory file at
  `C:\Users\model\.claude\projects\C--consne\memory\project_consne.md`
  was rebuilt from scratch on 2026-05-20 after going 6 days stale. Cadence
  set: every 2 days. Three triggers (any one is enough):
  • a Claude session cron fires every ~2 days at 09:43 (in-memory, dies
    when the Claude session restarts — best-effort)
  • Karun says "update project memory" / "refresh project context"
    (`CLAUDE.md` instructs Claude to do this without further prompting)
  • Karun manually opens the file and notices `nextUpdateDue` is in the
    past — say the trigger phrase to a fresh Claude session
  Most reliable trigger: **the manual phrase**. Don't depend on the cron.

- [x] ~~**Sweep orphan worktree directories**~~ ✅ **DONE 2026-05-24.**
  Active worktree (`heuristic-kepler-947fd0`) removed via `git worktree remove --force`.
  Only `main` worktree remains. Orphan `.claude/worktrees/*` dirs on disk are harmless
  and can be deleted manually if disk space is needed.

- [ ] **Marketing assets ready to send** *(captured 2026-05-20)* — portrait 9:16
  WhatsApp ad shipped (`storey-whatsapp-ad.pptx` + `storey-whatsapp-ad.jpg`),
  travel poster and 8-slide deck already on disk. Source generator script:
  `make-whatsapp-ad.cjs`. Iterate copy / add product screenshot when ready to
  push to broadcast lists.

---

## 🎯 v1.2 — Contractor-requested bundle *(2026-05-20)*

Contractor **Arun** (family connection — father's friend's son) named three
blockers in a face-to-face meeting on 2026-05-20. Follow-up WhatsApp sent
same day with the data-security write-up, Tally-style backup pitch, beta
invite, and a soft pilot-commitment question. **Awaiting his Gmail + reply.**

Build as ONE focused increment (single migration + unified UI plan) once
**both** the 12-tester gate is cleared AND Arun confirms pilot intent.

> **Honest delivery estimate (2026-05-20):** ~11 days of focused work
> across 8 items below. Real calendar time: **4 weeks** (allowing for
> bugs, prospect support, IPv4 dropouts, Play Console admin). Tell Arun
> 4 weeks. Aim for 3.5. Under-promise.

Issues:

- [ ] **(1) Material budgeting at site setup, with deviation tracking** —
  when a site is created, the contractor plans expected material quantities
  per material ("500 bags cement, 200 m³ sand"). As receipts / consumption /
  transfers flow through `material_transactions`, the system shows planned
  vs actual deviation in real time. Data shape: `materials.budget_qty`
  (+ optional `budget_rate` for ₹ deviation) + a `site_material_budget_v`
  view. New "Budget vs Actual" report screen. Closes the cash-leak surface
  every contractor cares about.

- [ ] **(1d) Budget actuals must include LABOUR (+ expenses)** *(owner flagged
  2026-06-02 — real gap)* — TODAY `cost_centre_budget_v` computes `actual_cost`
  from **confirmed material receipts ONLY** (see migration `20260530000001`
  line 25). Labour, expenses, and sub-contractor are NOT counted — so a cost
  centre's "spent" is half-blind (labour is often 30–50% of a site's cost).
  Fix (same hub pattern): add `cost_centre_id` to the labour source
  (attendance/wages) + expenses, then extend the view so
  `actual_cost = materials + labour + expenses (+ sub-contractor when it ships)`.
  View shape unchanged → Reports UI keeps working. Build with item (1) / the
  sub-contractor cost-centre work in the **v1.2 window**.
  *(Also clarify with owner whether "no budgeting for cost centre" means a
  budget OVERVIEW screen, material-qty budgeting (item 1), or a site-total
  budget — cost-centre ₹ budgets themselves already exist.)*

- [ ] **(1e) Budget MODEL — site budget = Σ cost centres + a "rest of site"
  general bucket** *(owner clarified 2026-06-02)* — the agreed budgeting shape:
  • A **site's total budget rolls up from its cost centres** (Σ of each centre's
    budget), so the site total is always the sum of its parts.
  • Plus an implicit/default **"general / rest of site" cost centre** that absorbs
    spend (material + labour + expenses) NOT tagged to a specific centre — so the
    site total is complete and nothing is unaccounted.
  • A contractor can create a **specific cost centre** to track one part of the
    site closely; everything else lands in the general bucket.
  • **Both material AND labour** (and expenses) allocate to cost centres (see 1b/1d)
    → each centre's budget-vs-actual reflects the FULL cost, not just materials.
  Build with items (1)/(1b)/(1d) + the sub-contractor cost-centre work in the
  **v1.2 window**. Material-quantity budgeting (item 1) feeds the material side;
  labour allocation (1d) feeds the labour side; this item is the roll-up model.

  > **📋 FULL SPEC: `docs/SPEC-BUDGETING-MODULE.md`** *(owner-approved 2026-06-02)* —
  > items (1)/(1b)/(1d)/(1e) are consolidated into ONE unified Budgeting &
  > Cost-Centre module that replaces the three fragmented systems (`budget_lines`,
  > `materials.budget_qty`, `cost_centres`). Build the budgeting backbone FIRST,
  > before sub-contractor. Decisions D1–D5 locked in the spec.

- [ ] **(1b) Task-aware + sub-contractor-aware material allocation**
  *(2026-05-20 — clarified by Arun's three-context framing)* — the
  `material_allocations` table already exists from migration
  `003_material_flow.sql` with a free-text `work_description`. Three
  allocation contexts to support, single form:
  • **Case 1 — General site work** → both FKs null, free-text only
  • **Case 2 — Task** → `task_id` FK to tasks
  • **Case 3 — Sub-contractor** → `subcontractor_id` FK to new subcontractors
    table (from issue 2)
  Migration: add nullable `task_id` and `subcontractor_id` to
  `material_allocations` + a CHECK constraint enforcing at most one is set.
  Mirror the columns on `material_transactions` so the ledger preserves
  attribution. UI: one dropdown "Allocate to..." with three radio options.
  ~0.5 day on top of the budget feature — small delta, big value.
  Unlocks "by task" and "by sub-contractor" consumption reports.

- [ ] **(1c) Flag-and-correct workflow for material allocations**
  *(2026-05-20 — Arun-pattern, matches existing confirmation rhythm)* — a
  supervisor who realises he logged a wrong allocation cannot self-correct;
  he **flags it for review**. Site_manager / contractor sees a "Needs your
  review" panel, can approve (system writes offsetting `return` +
  re-allocation, preserving ledger) or reject (flag removed, original stands).
  Original entry never disappears — court-defensible. Schema:
  add `flag_status [none|pending|corrected|rejected]`, `flag_reason`,
  `flagged_at`, `flagged_by`, `reviewed_at`, `reviewed_by`, `review_note`,
  `correction_of FK` to `material_allocations`. BEFORE UPDATE trigger
  enforces only site_manager+ can transition to corrected/rejected
  (same Postgres recipe as migration `20260519000000`). Two new
  dashboard widgets (supervisor's "🚩 1 pending" badge + site_manager's
  "Allocations to review" panel). Zero new pages. **~0.5 day** — small
  but high-value, closes the #1 fraud surface in NE-India construction
  (supervisor over-allocating to hide leakage).

- [ ] **(2) Sub-contractor onboarding — Path A (entity-only) — PHASE 1 SHIPPED 2026-06-03**
  > **Phase 1 (directory + daily labour) is live.** Sub-contractor directory (name, phone, type),
  > site assignments (many-to-many), daily labour headcount + photos, sub-contractor presence
  > on daily log cards. Scope below is Phase 2 (payments, work orders, variations) — still open.

- [ ] **(2) Sub-contractor onboarding — Path A (entity-only) — Phase 2 remaining** — sub-contractors
  are tracked as entities, NOT as login users. **Onboarding restricted to
  contractor + site_manager** (commercial roles). Supervisor sees them at
  their sites (RLS) and can allocate material to them, but cannot create
  or edit. Schema locked 2026-05-20 after Arun confirmed Q1 = one entry
  per site:
  `subcontractors (id, tenant_id, name, contact_person, phone, email,
   work_type, pan, gst, address, site_id NOT NULL, agreed_amount,
   advance_paid, scope_description, start_date, expected_end_date,
   status, onboarded_by, created_at, updated_at)`.
  Work-type taxonomy (fixed): electrical · plumbing · masonry · RCC ·
  finishing · MEP · interiors · flooring · waterproofing · earthworks ·
  scaffolding · structural steel · other.
  **+ `cost_centre_id uuid references cost_centres(id) on delete set null`**
  *(Karun 2026-05-30)* — assign each sub-contractor's work to a cost centre
  so their payments fold into `cost_centre_budget_v` alongside material spend.
  The `cost_centres` hub ships first (see `docs/SPEC-COST-CENTRES.md`); this
  column + the view's second `left join` land **with this module**. Until then,
  the hub tracks material spend only.

- [ ] **(2b) Sub-contractor payment ledger** *(new — Arun confirmed v1.2)* —
  track every payment to a sub-contractor against the agreed amount.
  Schema:
  `subcontractor_payments (id, subcontractor_id FK, tenant_id, amount,
   payment_date, payment_type [advance | running_bill | final],
   payment_mode [cash | cheque | upi | bank_transfer], reference_no,
   note, recorded_by FK profile, created_at)`.
  Reports: balance due = `agreed_amount - sum(payments)`, payment
  passbook, total liability across all sub-contractors per site.
  Onboarding restriction inherits — only contractor + site_manager
  record payments.

- [ ] **(2d) Variation Orders — scope additions on existing sub-contractor**
  *(new — 2026-05-20, addresses the #1 real-world dispute scenario)* — when
  additional work is added to an existing sub-contractor's scope (e.g. "5th
  floor added", "DB upgraded"), record it as a **Variation** linked to the
  original record, NOT by editing the original. Each variation has its own
  scope, amount, date, signatures. Total agreed = original + sum of
  variations. RLS: only contractor + site_manager can create variations.
  Schema:
  `subcontractor_variations (id, subcontractor_id FK, variation_no,
   reason, scope_description, additional_amount [can be negative for
   reduction], variation_date, approved_by FK profile, note, created_at)`.
  Balance / payment reports recompute against `total_agreed`. ~1 day on
  top of base sub-contractor work.

- [ ] **(2c) Printable Work Order PDF** *(new — Arun's breakthrough idea
  2026-05-20)* — generate a signed Work Order PDF per sub-contractor with
  contractor letterhead, sub-contractor details, scope, agreed amount
  (figures + words), advance paid, balance, start/end dates, signature
  blocks for both parties, and a QR code linking back to the digital
  record. Indian construction WO standard format — CAs respect it,
  makes Storey the *paper trail* sub-contractors didn't have. Build with
  `pdfmake` or `jspdf` client-side (same SVG/sharp skillset as the
  marketing posters). One-click generate + share via WhatsApp / email.
  **This is the differentiator** — Tally doesn't do it, no ConTech SaaS at
  this price point does it, NE-India sub-contractor disputes are constant
  and this stops them at the door. **WO PDF stacks the original + every
  variation** (see 2d above) so the latest document is always the complete
  consolidated agreement.

- [ ] **(3) "Your data, your Drive" — Tally-style data ownership**
  *(re-scoped 2026-05-20)* — same contractor clarified by analogy to Tally,
  where his data sits in a folder on his hard drive. He doesn't actually
  need Postgres-on-his-AWS — he needs the **feeling and practical reality
  of a copy he can touch**. Two-phase build:
  • **Phase 1 (1 day):** "Download my data" button in Settings → edge
    function exports all tenant tables as a single JSON / SQL bundle →
    saved via Capacitor Filesystem (mobile) or browser download (web).
  • **Phase 2 (2 days):** Daily auto-export to *his* Google Drive. OAuth
    connect once in Settings, scheduled edge function pushes nightly
    snapshot to a "Storey Backups" folder in his Drive, with a daily
    email confirmation.
  Marketing pitch this enables: *"Better than Tally — your data backed
  up to your Drive every day, plus mobile + multi-user + offline."*
  Closes the trust gap with NE-India contractors who anchor on Tally.
  ~3 days total — fits cleanly in the v1.2 bundle.

> Build order: do NOT start until 12-tester / 14-day Production gate is
> cleared. Then ship as v1.2 in one tight increment — single migration,
> unified UI plan, one commit per layer (db / store / pages).

---

## 🏢 Enterprise / on-prem — kept for future requests only *(2026-05-20)*

> _The 2026-05-20 contractor turned out to mean "like Tally" — not literal
> on-prem. That request is now covered by the v1.2 item "Your data, your
> Drive" above. This section is kept for **future** asks that genuinely
> want their own server (large corporates, govt, regulated industries)._

When someone in future asks for "my own database on my own server", it is
not automatically a feature — it's a commercial decision needing more
information.

**Step 1 — diagnose the real concern.** Ask the contractor:
1. What specifically are you worried about — competitor seeing data, hack,
   regulatory, or something else?
2. How many sites + users in the first 12 months?
3. Does a **dedicated database** on Storey's managed cloud (only your data,
   no shared tenants) solve the concern, or do you specifically need the
   server in your office / your own AWS?

**Step 2 — match concern to option (don't skip to engineering):**

| Concern | Cheapest fix | Engineering cost |
|---|---|---|
| Competitor seeing data | RLS audit summary + DPA + monthly DB export | **Zero** (already enforced) |
| Trust / due-diligence | One-page Data Protection Agreement + audit log access | 1 day |
| Dedicated DB acceptable | Separate Supabase project per tenant ("Pro" tier) | 2 days |
| BYOD (his Postgres, our app) | Connection-string per tenant + ops runbook | 2–3 weeks |
| Full self-hosted | Storey installer + Supabase OSS + support | 2–3 months |
| Air-gapped / govt-grade | Enterprise edition + offline updates | 4–6 months |

**Step 3 — pricing rule, non-negotiable:** anything beyond a Dedicated DB
("Pro" tier) is **enterprise pricing**: ₹3–5L+ setup, ₹50k+/mo, multi-year
contract, signed Pvt Ltd entity (P2 TODO). Don't engineer self-hosting at
v1 price — it's the fastest way to burn 3 months and a year of runway.

**Step 4 — entity prerequisite.** You cannot sign an enterprise contract
without a registered Pvt Ltd. The legal-entity TODO (P2) is a hard
dependency on any on-prem conversation. It's now also a commercial
blocker, not just a liability concern.

---

## 🆕 New features — backlog (post-v1, tag before building)

- [ ] **GST billing for customers** _(v2 — new feature; owner-approved 2026-06-01)_
  — generate GST-compliant invoices / RA bills for the contractor to bill THEIR
  client from inside Storey. **Rationale: accelerates contractor onboarding** —
  competitors (Onsite Business+, SiteSetu Professional) bundle GST billing and
  contractors want to bill clients from the app; offering it lowers the switch
  barrier. Scope to decide before building: invoice/RA-bill templates, GST
  number capture (ties to KYC directive #6), tax computation, numbering series,
  PDF + share. NOT v1 — positioning until then is "Storey = site-ops, keep Tally
  for accounts." See `docs/COMPETITORS.md` for the gap analysis. Pairs naturally
  with the Pro tier (a billing-capable plan is an upsell lever).

- [ ] **Free-tier depth vs Yojo — decision** _(pricing/GTM, not a build yet)_ —
  Yojo's FREE plan (attendance, payroll, calculators, BOQ, DPR, multi-site,
  Hindi) is more generous than Storey free (recording only, 1 site). As a funnel,
  Storey free may be too thin to compete head-to-head. Decide: keep free as a
  pure teaser (rely on per-site pricing + WO PDF moat to convert), or widen it
  (e.g. allow basic reports / 1 extra user) to match Yojo as an acquisition tool.
  See `docs/COMPETITORS.md`.

- [x] ~~**Daily log — multiple photos per log, per site-part, with captions**~~
  ✅ **DONE 2026-06-03.** `daily_log_photos` table shipped; up to 20 photos per
  log, each with caption. Gallery display on log cards. Backwards-compatible.
  Committed in v1.2.3. Cost-centre photo tagging still open (see item 1e).

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

- [ ] **Task update cadence** _(enhancement of the Task module)_ — discussed
  2026-05-19. When a task is assigned, the assigner sets a required update
  interval (every 1h / 2h / 4h / 8h / daily / none). Plan:
  • add `tasks.update_interval_hours`;
  • assign form gets an "update every" dropdown;
  • next-update-due = last task_update time (or task start) + interval; if past
    due → an "Update overdue" flag on the task card, detail and "My Tasks"
    widget. Makes the vague "stalled" idea precise.
  Reminders/notifications for due updates build on this via the Notifications item.

- [ ] **Supervisor "Today" work schedule** _(v1.2 — enhancement of Tasks)_ —
  requested 2026-05-20 by devraaj (Supervisor at BuildNE). A focused
  "today" view: tasks where assignee = me AND start_date ≤ today ≤ due_date,
  grouped by **Overdue → Due today → In progress**, with last update time and
  the next-update-due flag from the Task update cadence item above. Lives as
  a tab on the Tasks page (`/tasks?view=today`) or as the default view for
  supervisors. ~2 hours of work — small win once the beta tester gate is
  cleared. Do NOT build until 12-tester / 14-day Production gate is cleared.

- [ ] **Material allocation to a task** _(v1.2 — new feature, ConTech-specific)_
  — requested 2026-05-20. Today a supervisor can SEE materials at their site
  (post fix `80bcf89f`) but can't tie material usage to a work item. Plan:
  • add `material_transactions.task_id` (nullable FK to `tasks`);
  • "Allocate to task" button on a task detail → pick material + qty →
    inserts a `consumption` row with `task_id`;
  • task detail card surfaces "materials used: 20 bags cement, 5 m³ sand";
  • over-allocation handling routes through the existing "Return material"
    TODO above.
  ~1–2 days of work. Closes a meaningful gap (right now consumption is
  tenant-bucket, not work-item-attributed) but is NOT a beta blocker.
  Decide scope when at least 5 supervisors have asked for it across distinct
  tenants — until then, contractors track allocation manually. Do NOT build
  until 12-tester gate cleared.

- [ ] **Team activity log** _(v2 — new feature)_ — requested 2026-05-19.
  A contractor should see what their team is doing (attendance marked, logs
  filed, tasks updated, transfers actioned), and the same view cascades down
  the hierarchy — a Site Manager sees their site team's activity, etc. Likely
  an `activity_log` table written by triggers / app events, with a per-role
  scoped feed. Sizeable — needs its own plan.

- [ ] **Team view down the hierarchy** _(enhancement)_ — the Team page (with the
  new member roster: name · role · email · phone) is currently contractor-only.
  Extend it so a Site Manager can see the contact details of their own site
  team (supervisors / store keepers on their assigned sites), scoped by RLS.

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
