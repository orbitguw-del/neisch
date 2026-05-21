# Storey — origin retrospective
### Apr 4, 2026 → May 21, 2026 (48 days)

> **Honest framing:** this document is reconstructed from git history, the
> project memory file, and the docs that survived in the repo. It is not a
> live diary of those days — those entries weren't written. It's the closest
> thing to a faithful record I can build retroactively, anchored to artifacts
> rather than memory.
>
> Future diary entries (starting `2026-05-21.md`) are live. Use this only as
> the spine — the daily record builds on top.

---

## Phase 0 — The idea exists, the repo doesn't *(pre-April)*

Karun's domain: contracting and site operations in Northeast India. Lived
experience of running and observing real sites — labour rosters on paper,
material leakage uncounted, supervisors on WhatsApp groups for everything,
contractors using Tally for accounting and nothing for operations.

The decision to build "the missing layer between WhatsApp and Tally" had
already happened by the time the repo was created.

---

## Phase 1 — Initial build *(Apr 4–7, ~4 days)*

```
2026-04-04  Initial commit — ConsNE Beta 1
2026-04-04  Fix gitignore
2026-04-06  Dashboard KPIs — team count + low stock alert
2026-04-06  fix: SPA rewrite for Vercel
2026-04-07  fix: simplify vercel rewrite
```

The first name was **ConsNE** (Construction Northeast). A working Vite + React
+ Supabase + Tailwind app shipped to Vercel in under 72 hours. The first
working screen had **team count + low-stock alert** — already an honest
signal that the product was thinking about *operations*, not just CRUD.

The repo went quiet for ~4 weeks after this. Behind the scenes: schema
design, RLS thinking, the first tenant model.

---

## Phase 2 — Rebrand + auth + first real modules *(May 5–7, 3 days)*

The dam broke. ~30 commits in 3 days.

```
2026-05-05  Responsive mobile layout
2026-05-05  Debug invite flow, auth loading, role guard
2026-05-06  feat: full rebrand from ConsNE to Storey
2026-05-06  Multiple OAuth fixes — PKCE, AuthCallback, Google OAuth
2026-05-06  feat: Labour module — worker onboarding, ID proof, vendor tracking, attendance
2026-05-07  feat: complete Reports module with Monthly + Budget vs Actual
2026-05-07  feat: SMS OTP + invite tabs to login page
2026-05-07  refactor: Supabase native phone auth for SMS OTP login
2026-05-07  Switch SMS OTP login to custom edge functions with phone-lookup
2026-05-07  Redesign login page with full user-type workflows
2026-05-07  Add marketing landing page at /
2026-05-07  Fix team invite flow end-to-end
```

### The rebrand from ConsNE to Storey

Names get harder to change the longer you wait. Karun pulled the trigger on
**Day 33** of the project — late enough to feel established, early enough that
no customer would notice. *ConsNE* read like an internal codename. *Storey*
told a story: every site is built one level at a time, and the app tracks
each level.

### Labour-first, materials-second

Most ConTech founders start with materials (because it's where the money
is). Storey started with **Labour** (workers, attendance, ID proof, vendor
tracking) — because that's where contractors actually feel the daily pain.
Right call. Materials came next.

### Auth — the longest single bug battle of the project

3 days, ~10 commits on auth alone (May 5–7). PKCE flows, OAuth redirects,
AuthCallback closures, magic-link race conditions, SMS OTP via custom edge
functions, invite-trigger fixes. The cost of getting authentication right
once — so it never has to be revisited.

---

## Phase 3 — Materials, transactions, the multi-tenant ledger *(May 8–14, ~7 days)*

```
Migrations laid in this window:
  001_roles_permissions.sql       — 5-role hierarchy
  002_material_transactions.sql   — first ledger
  003_material_flow.sql           — receipts, allocations, transfers
  004_asset_tracking_grn.sql      — equipment + goods-received notes
  005_labour_attendance.sql       — formalised attendance schema
  006_budget_lines.sql            — site-level budgets
```

Six migrations in a week. By May 14, the **multi-tenant RLS-enforced operational
ledger** was working: receipts → allocations → transfers, all scoped per
tenant per site per role. This is the part most "vibe-coded" apps never
get to. Storey got there in week two of real building.

---

## Phase 4 — Hardening *(May 15–17)*

```
20260515000000_lock_profile_sensitive_fields.sql
20260515000001_link_owner_to_tenant_bypass.sql
20260516000000_mask_id_proof_to_last4.sql
20260516010000_site_expenses.sql
```

Started thinking like a senior engineer about *what could be exploited*.
Locked sensitive profile fields. Masked Aadhaar/PAN to last 4 digits only
(privacy by design — most Indian apps don't do this). Added site expenses.

---

## Phase 5 — The big v1 sprint *(May 18, single day)*

**A historic day. 20+ commits.**

```
2026-05-18  feat(offline): phase 1 — offline foundation (IndexedDB queue)
2026-05-18  feat(offline): phases 2–4 — attendance, daily logs, expenses, photos
2026-05-18  feat(photos): live-camera-only capture, date-time stamp, lightbox
2026-05-18  feat(tasks): phase 1 — work-assignment schema
2026-05-18  feat(tasks): phases 2–4 — store, page, nav, cascade
2026-05-18  feat(transfers): 4-stage lifecycle
2026-05-18  feat(transfers): store-keeper visibility + 4-stage transfer flow
2026-05-18  feat(transfers): supervisor dashboard dispatch alert
2026-05-18  feat(confirmation): retrofit submit→confirm onto attendance & logs
2026-05-18  feat(confirmation): flag unconfirmed attendance in payroll report
2026-05-18  feat(dashboard): site manager — "needs your confirmation" widget
2026-05-18  feat(auth): tell users to check spam after password reset
2026-05-18  docs: log notifications feature request from the presentation
2026-05-18  docs: log project timeline / Gantt feature request
2026-05-18  docs: log emergency work-assignment feature request
2026-05-18  docs: log BOQ feature request — with honest feasibility tiers
```

This is the day Storey transitioned from *"a CRUD app that tracks workers"*
to *"a real site-operations system"*: offline mode, on-site photos with
time stamps, full Task cascade with sub-tasks, the 4-stage material transfer
lifecycle, the confirmation layer on attendance/logs/tasks. All in one
day. Solo. AI-augmented but every architectural call was the founder's.

Also a presentation happened this day — multiple "feature requests from the
presentation" commits suggest Karun showed Storey to a group of contractors
and captured every ask without committing to build them. Discipline visible
in the doc-only commits.

---

## Phase 6 — Audit, ship to Play closed testing, advisor plan *(May 19–20)*

```
2026-05-19  RLS audit + hardening migrations 20260519000000 → 040000
2026-05-19  docs: P0 verification signed off — v1.1.1 cleared for Play upload
2026-05-19  build(android): v1.1.1 (versionCode 15) — first signed release
2026-05-19  feat(dashboard): "My Tasks" widget on supervisor & site-manager
2026-05-19  fix(profiles): backfill email from auth.users
2026-05-20  docs: advisor plan — areas to cover, tracking table, outreach playbook
2026-05-20  docs(advisors): Avinash Chirania (4Line Designs) — slot #1 candidate
2026-05-20  docs(advisors): Upmanyu Sharma — initially #2, reclassified to #7 (tech)
2026-05-20  docs(advisors): specific specializations to look for per category
```

By May 20: **app live on `storeyinfra.com`**, **APK signed and uploaded to Play
Store closed testing**, **2 of 12 testers enrolled**, **advisor pipeline started**.
A contractor named Arun (family connection — father's friend's son) had a
60-minute pitch meeting and named three v1.2 features. The "your data, your
Drive" pitch — Tally-style data ownership via daily Google Drive backup —
was born from misinterpreting his "self-hosted" ask correctly on the
second pass.

---

## Phase 7 — The 12-tester gate cleared *(May 21, today)*

```
80bcf89f   fix(roles): supervisor sees Inventory/Receipts/Transfers/Equipment
d6af1be9   fix(tasks): block sub-tasks on submitted/done parent
b5ca5055   feat(supervisor-dashboard): allocations today + stock widgets
df2caf52   fix(roles): supervisor can allocate material
6e09bda8   fix(android): camera crash — permissions, queries, file paths
9ab6c1d8   fix(camera): Base64 result type
6d28f79f   fix(camera): bypass @capacitor/camera — use file input on Android
fa82776e   fix(workers): progressive disclosure on worker form
b391b6dc   fix(ui): PageHeader squashes title on phones
10eaa807   feat(supervisor-dashboard): visual-first redesign — Path A Day 1
59971eeb   fix(register): gracefully handle orphan users
```

The full day-in-the-life is documented in `diary/2026-05-21.md` — including
three wall-and-workaround arcs (camera, registration, layout). The headline:
broadcast went out, **testers landed: 2 → 4 → 10 → 12 in under 24 hours**,
14-day production countdown started.

---

## The shape of the journey, told plainly

| Phase | Duration | What got built | Cost |
|---|---|---|---|
| 1 — Initial build | 4 days | Repo, Vercel, first KPI screen | Founder's solo time |
| (gap) | ~28 days | Schema design, RLS thinking | — |
| 2 — Rebrand + auth + first modules | 3 days | Labour, Reports, full auth (PKCE/OAuth/SMS) | 30 commits, 1 brand identity |
| 3 — Multi-tenant ledger | 7 days | Materials flow, equipment, expenses, attendance | 6 migrations |
| 4 — Hardening | 3 days | Profile locks, ID masking, site expenses | 4 migrations |
| 5 — The v1 sprint | 1 day | Offline mode, photos, Tasks, 4-stage transfers, confirmation layer | 20+ commits, 1 historic day |
| 6 — Audit + ship + advisors | 2 days | RLS audit, signed APK, advisor pipeline, Arun's pitch | First customer signal |
| 7 — Gate cleared | 1 day | 12 testers, camera fix, dashboard redesign | 14-day countdown started |

**48 days from `git init` to "ready to launch."** Solo founder. Family-funded.
AI-augmented. NE-India based. Done at a cadence almost nobody believes is
possible until they see it.

---

## What's worth remembering, when next session forgets

- **The labour-first instinct was right.** Most ConTech founders chase
  materials first because that's where the cash is. Storey chased labour
  because that's where the *daily pain* is. Customers respond to pain, not
  spreadsheets.

- **Auth is a one-time tax.** Three days of bug-chasing in week 2 felt
  endless at the time, but never had to be revisited.

- **The May 18 sprint is the model.** When the architecture is settled and
  the priorities are clear, one day of focused solo work can ship what
  most teams take a month to ship. Repeat that pattern when the next big
  feature window opens.

- **The 12-tester gate took less than 24 hours of broadcast work.**
  Imposter syndrome assumed it would take a week. The gates are smaller
  than founder anxiety paints them.

- **The advisor plan was started *before* the equity could be issued.**
  Pvt Ltd is still not registered (as of today). The smart move was
  starting the relationships first; the legal entity catches up.

- **One real contractor meeting (Arun) shaped 4 weeks of roadmap.** That
  ratio — hours of conversation → weeks of focused build — is the right
  one. Don't break it.

---

*Reconstructed 2026-05-21. Future entries: live, in this folder, dated.*
