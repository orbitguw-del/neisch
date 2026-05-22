# Storey — features reference
### What's live · what's coming · who uses what
*Last updated 2026-05-22 (after v1.1.6 + the day's dashboard rewrites)*

---

## What Storey is

Storey is a site-operations app for construction contractors in Northeast India — and for the specialist trades (electricians, plumbers, masons, painters) running their own field work. Built for the daily reality of construction: workers, materials, tasks, photos, sub-contractors, expenses. One app, mobile-first, offline-aware, multi-tenant with strict data isolation.

---

## Modules — what's live in v1.1.6

| Module | What it does | Live since |
|---|---|---|
| **Sites** | Create and manage construction sites. Status (active, planning, completed, on-hold), budget, dates, location. | v1.0 |
| **Workers** | Labour roster — onboard workers, trade/skill, daily wage, ID proof masked to last 4 digits. Progressive disclosure: 5 essential fields visible, rest behind a toggle. | v1.0 (UX simplified v1.1.6) |
| **Attendance** | Daily presence marking by supervisor → confirmation by site manager. Append-only audit log. | v1.0 (confirmation layer v1.1.0) |
| **Daily Logs** | Site progress reports with photos, weather, workers-present, work-done, issues. Photos carry date-time stamps burned in. | v1.0 (photo capture v1.1.0) |
| **Tasks** | Work-assignment cascade from contractor → site_manager → supervisor → worker. Daily updates with photos, status transitions, sub-tasks. Sub-tasks blocked once parent is submitted or done. | v1.0 (sub-task fix v1.1.5) |
| **Materials — Inventory** | Per-site stock. Materials tracked with quantity, unit, category (consumable vs equipment), minimum reorder level. Supervisor can now allocate to work. | v1.0 (allocation atomic + validated v1.1.7) |
| **Material Receipts (GRN)** | Inward register — store keeper records receipt → site manager confirms. | v1.0 |
| **Material Transfers** | 4-stage transfer between sites: initiate → supervisor confirms dispatch → store keeper / site manager approves → receiving site accepts. Stock updates per stage. | v1.1.0 |
| **Material Ledger** | Append-only transaction history per material — receipts, allocations, transfers, adjustments. Cannot be edited or deleted; corrections happen as offsetting entries. | v1.1.0 |
| **Equipment / Assets** | Non-consumable equipment (drills, scaffolding, helmets, vehicles). Issue to worker / sub-contractor, return on completion, maintenance tracking. Supervisor can now issue + return. | v1.0 (supervisor access v1.1.7) |
| **Expenses** | Site-level spend tracking with receipts + approval flow. | v1.0 |
| **Reports** | Per-site summaries — attendance, materials, expenses, payroll, budget vs actual. | v1.0 |
| **Team** | Roster of users in your tenant — name, role, email, phone. | v1.0 |
| **Invites** | Send signup invites via email; expiry, pending status visible. | v1.0 |
| **Offline mode** | Mark attendance, file daily logs, add expenses without internet. IndexedDB queue, auto-sync when online. | v1.1.0 |
| **Photo capture** | On-site photos with timestamp burned into the corner. Camera-first (no gallery picker by default). | v1.1.0 |

---

## What's coming in v1.2 (the 4-week window)

Driven by feedback from real contractors (Arun, 2026-05-20). Built when both the 12-tester gate and pilot confirmation clear.

| Feature | What it does |
|---|---|
| **Material budget vs actual** | Site-level material budgets set during setup. Real-time deviation tracking as receipts and consumption flow. |
| **Sub-contractor onboarding** | Onboard sub-contractors as entities (Path A — they don't log in; site_manager / contractor manages their record). 17-trade taxonomy. Agreed amount, scope, dates. |
| **Sub-contractor payment ledger** | Track every payment to a sub-contractor against the agreed amount. Running balance. Payment passbook view. |
| **Variation Orders** | Scope additions to existing sub-contractor agreements without rewriting the original. Variations stack on the Work Order PDF. |
| **Printable Work Order PDF** | One-click signed Work Order per sub-contractor — contractor letterhead, scope, agreed amount in figures + words, advance/balance, signature blocks, QR code linking back to the digital record. |
| **Task / sub-contractor aware allocation** | Material allocation can attribute consumption to a specific task or sub-contractor. Three modes: general site work, to a task, to a sub-contractor. |
| **Flag-and-correct workflow** | Supervisor flags his own allocation mistakes; site_manager / contractor reviews and approves the correction. Original entry preserved in the append-only ledger. |
| **"Your data, your Drive"** | Daily automatic backup of your tenant's data to your own Google Drive. Tally-style data ownership — your data lives where you can touch it. |

---

## Roles & permissions

| Role | Who they are | What they do |
|---|---|---|
| **Contractor** | Owner-operator, business head | Sets up the company, sites, budgets. Approves expenses + transfers + sub-contractor agreements. Sees everything in their tenant. |
| **Site Manager** | Engineer or PM overseeing one or more sites | Confirms attendance, daily logs, tasks. Approves transfers + expenses. Operates as primary day-to-day reviewer. |
| **Supervisor** | On-site role — runs the day | Marks attendance, files daily logs, creates tasks for workers, allocates material to work, issues equipment, dispatches transfers. |
| **Store Keeper** | Materials warehouse / store | Records material receipts, manages stock, initiates transfers. |
| **Super Admin** | Platform-level (Storey team only) | Tenant management, platform stats. Not a customer-facing role. |

All cross-role data access is enforced via Postgres RLS + role-helper functions. No application-layer guards are the only line of defence.

---

## Login & sign-up options

| Option | State | Notes |
|---|---|---|
| **Email + password** | ✅ Live | Primary recommended path for all roles. Email goes to `noreply@storeyinfra.com` via Resend SMTP. |
| **Google sign-in (OAuth)** | ✅ Live | One-tap; OAuth consent screen currently in Testing mode (verification pending — labelled "STOREY" + logo). |
| **Magic link** | ✅ Live | Email-based passwordless login. Useful for users without strong password recall. |
| **Invite flow** | ✅ Live | Site Managers / Supervisors / Store Keepers invited by contractor via email link. |
| **Phone OTP (SMS)** | 🧪 Preview | Currently functional but not the recommended primary path. Workable for users without email, but reliability + delivery in NE India can vary. We'll mature this in v1.x. |

> **Recommended pitch posture:** lead with Google sign-in or email signup for new contractors. Use SMS OTP only when a tester specifically can't use the other paths.

---

## Brand & UX principles applied throughout

- **Visual-first** — picture beats text, status = colour + icon (never text alone), big numbers carry meaning, empty states illustrate the next action
- **Three visual tiers** — Lucide-style icons (small), inline-SVG line illustrations (medium), real photos (only for evidence)
- **English-default UI** — Hindi / Assamese will be an opt-in Settings toggle in a future release; defaulting to Hindi would read as condescension to most NE-India contractor buyers
- **Mobile-first** — every page works on a phone first; desktop is a wider composition of the same components
- **Offline-first writes** — every form queues locally and syncs when online; no data loss on flaky 4G
- **Append-only ledgers** — materials, tasks, attendance, daily logs all preserve history. Corrections happen via offsetting entries, never destructive edits.

---

## What's deliberately NOT yet in Storey

Honest about gaps so prospects know what to expect.

| Gap | When it'll appear |
|---|---|
| Quality assurance (slump test, cube test, level surveys) | v2 candidate |
| Compliance / statutory (PWD inspections, electrical sign-off) | v2 candidate |
| Logistics / transport (vehicles, fuel, drivers) | v2 candidate |
| Drawings / RFI management | v2 / v3 |
| Client communication thread | v2 wedge |
| Hindi / Assamese UI toggle | v1.x when a paying customer asks |
| Project timeline / Gantt | v1.x backlog |
| In-app notifications centre | v1.x backlog |
| AI voice input for daily logs (Hindi/Assamese) | v1.x experiment after v1.2 |

Storey today covers about **70 % of daily ops well** — the daily-bread workflow that supervisors and site managers run every day. The remaining 30 % is mostly *episodic* (compliance) or *enterprise-grade* (RFI, drawings) — not what the NE-India SMB beachhead needs at v1.
