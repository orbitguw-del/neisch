# Storey — Master Product Requirements Document
### Draft v0.1 · 2026-05-24 · Author: Karun (Founder)

> **Status:** Living draft. Update when product decisions change.
> **This is the single source of truth for what Storey is, who it is for, and what it must do.**
> All feature specs, roadmap decisions, and design choices should trace back here.

---

## 1. Problem Statement

Construction contractors in Northeast India run multi-crore projects using WhatsApp, paper registers, and verbal instructions. The result:

- **Material leakage** — cement, steel, and consumables disappear between delivery and use. No paper trail to investigate.
- **Labour disputes** — "you were absent on Tuesday" vs "I was not" — no witness, no record. The contractor always loses.
- **Budget blindness** — the contractor finds out he's overrun only when money runs out. No real-time visibility.
- **Sub-contractor chaos** — agreed amounts get disputed because there's no signed document. Money owed vs money paid tracked in a personal diary.
- **Document loss** — an accountant's hard drive, a WhatsApp message, a printed ledger — all three have failed real contractors.

**Existing tools fail this user:**
- Tally: books-only. No daily operations. No mobile. No offline. Requires an accountant.
- Excel: on a laptop. Not updated in the field. Crashes. Not shared.
- ERP software (Procore, BuilderTrend): built for the US market. English-heavy, $300+/month, require training.
- Paper: works until the rain, the fire, or the dishonest supervisor.

---

## 2. Our Bet

> **A supervisor with an 8th-class education and a 4-year-old Android phone must be able to use Storey in 10 minutes without training.**

If we win that bet, every other advantage — offline support, WhatsApp integration, regional pricing — compounds on top of it. If we lose that bet, none of the other advantages matter.

---

## 3. Target Market

### Primary: Main Contractors, NE India
- Owner-operators running 1–20 active construction sites
- Revenue: ₹50L–₹20Cr per year
- Team: 5–100 workers per site, 1–5 site managers
- Location: Guwahati, Shillong, Dimapur, Aizawl, Agartala, and surrounding districts
- Language: English (primary), Assamese, Mizo, Bengali, Hindi (secondary — v1.x toggle)
- Tech comfort: WhatsApp daily user; some use Tally; almost none use site-ops software

### Secondary: Specialist Trades (Dual-Market)
- Small electrical, plumbing, masonry, painting contractors
- Running 2–10 simultaneous jobs ("sites")
- Fewer workers, smaller material spend — same daily ops pain
- ~10× more of them than main contractors
- Faster sales cycle (single owner-operator decision)
- Lower ARPU (₹300–1,000/month) but higher volume potential

### Out of Scope (Phase 1)
- Vendors / suppliers (no vendor login, no self-registration — Phase 2 only)
- General public / consumers
- International markets
- Government / PWD tendering (different procurement rules)

---

## 4. User Personas

### 4.1 The Contractor (Buyer + Power User)
**Who:** Ramesh Gogoi, 42, runs a civil construction firm in Guwahati. 3 active sites, 8 workers per site on average.
**Goal:** See his money — where it went, who took it, what's left.
**Device:** iPhone 13 (personal) + Samsung Galaxy A-series (field phone).
**Pain:** He gets called 40 times a day because nothing is recorded. His site manager forgets, his supervisor lies, his accountant finds out too late.
**How he uses Storey:** Morning dashboard check. Approve expenses from home. Call the app, not his site manager.

### 4.2 The Site Manager (Daily Operator)
**Who:** Dimple Bora, 31, civil engineer, manages 2 sites under Ramesh.
**Goal:** Get his approvals done without driving to site.
**Device:** Redmi Note 10.
**Pain:** Has to chase the supervisor for daily logs. Paper registers get wet.
**How he uses Storey:** Confirms attendance. Reviews daily logs. Approves transfers. Flags budget overruns.

### 4.3 The Supervisor (Field User — most critical)
**Who:** Bijit Das, 27, no formal education beyond 10th class. On-site all day.
**Goal:** Mark done, go home.
**Device:** Samsung Galaxy A02s, 3 years old, 32 GB storage.
**Pain:** His boss doesn't trust him. He wants the record to prove he was right.
**How he uses Storey:** Morning attendance. Afternoon material allocation. End-of-day task update + photo.

### 4.4 The Store Keeper
**Who:** Raju, 35. Sits at the material store.
**Goal:** Record what came in without filling a 3-page GRN form.
**Device:** Whatever's available.
**How he uses Storey:** GRN entry when truck arrives. Stock check when supervisor asks.

### 4.5 The Accountant (Indirect Stakeholder)
**Who:** Manoj Sharma, CA firm in Guwahati.
**Goal:** Get the numbers without chasing the contractor every month-end.
**Touchpoint:** Tally export (v1.3+). No Storey login required.

---

## 5. Design Principles (Non-Negotiable)

### 5.1 Visual First
- Status = colour + icon, never text alone. Green = done. Amber = pending. Red = blocked.
- Numbers are big (40px+). A "₹14.2L" in red at 40px communicates faster than any paragraph.
- Empty states have an illustration + a single action button. Never a blank page.
- Supervisor must understand any screen in 2 seconds without reading.

### 5.2 Mobile First
- Design for 360px wide Android first. Desktop is a bonus.
- Touch targets ≥ 44px. No drag-and-drop on mobile.
- Offline-first data entry (mark attendance, log material, add expense) — sync when signal returns.
- Images compressed to ≤ 80KB before upload. Low-bandwidth aware.

### 5.3 English + Short Words
- Default UI is English. Short verbs: "Mark done" not "Confirm completion". "Add worker" not "Onboard new resource".
- Language toggle (Hindi / Assamese) is a Settings option — v1.x. We do not choose the language for the user.

### 5.4 Append-Only Data Integrity
- Material ledger, attendance, expense log — immutable. Corrections are new entries, not edits. This is the system's trust anchor — it's why a court will believe the record.

### 5.5 WhatsApp as the Delivery Channel
- Reports share to WhatsApp in one tap. Help requests go via WhatsApp. CTA posters are WhatsApp-forwardable. The contractor's phone IS the office.

---

## 6. Modules — Live (v1.2.1, May 2026)

### 6.1 Sites
**What:** Create and manage construction projects.
**Fields:** name, location, status (active / planning / completed / on-hold), start date, projected end date, total budget, description.
**Rules:** Contractor can create unlimited sites (Free plan: 1 site). Site is the top-level container for all other data.
**Acceptance criteria:**
- [ ] Contractor can create a site with name + budget in < 30 seconds
- [ ] Site status visible at a glance from list view (colour chip)
- [ ] Deleting a site is blocked if it has active workers, open tasks, or any inventory

### 6.2 Workers
**What:** Labour roster — onboard field workers.
**Fields:** name, trade, daily wage, phone, ID type + last 4 digits, join date, status (active / inactive).
**Rules:** Progressive disclosure — 5 essential fields visible, rest behind "More details" toggle. No full ID number stored.
**Acceptance criteria:**
- [ ] Supervisor can add a worker in < 1 minute
- [ ] ID proof shows only last 4 digits
- [ ] Inactive workers are hidden from daily attendance by default

### 6.3 Attendance
**What:** Daily presence marking for all workers on a site.
**Flow:** Supervisor marks present/absent for each worker → Site Manager confirms → Record locked.
**Rules:** Append-only. Cannot be edited after confirmation. Corrections need a flag + approval.
**Acceptance criteria:**
- [ ] Supervisor can mark 20 workers in < 2 minutes
- [ ] Unconfirmed attendance shows amber; confirmed shows green
- [ ] Attendance report exportable per month

### 6.4 Daily Logs
**What:** Site progress reports — what happened today.
**Fields:** date, weather, workers-present count, work-done description, issues, photos.
**Rules:** Photos get a date-time stamp burned in at capture. Camera-first (no gallery picker).
**Acceptance criteria:**
- [ ] Supervisor can file a daily log in < 3 minutes
- [ ] Photo upload compresses to ≤ 80KB before sending
- [ ] Log is viewable by Contractor from their phone

### 6.5 Tasks
**What:** Work assignment cascade from Contractor → Site Manager → Supervisor → Workers.
**Fields:** title, description, category, assigned to, due date, status (pending / in-progress / submitted / done / blocked), sub-tasks.
**Rules:** Sub-tasks are blocked for editing once parent task is submitted or done.
**Acceptance criteria:**
- [ ] Contractor can assign a task and see real-time status update
- [ ] Status visible by colour on list view (no reading required)
- [ ] Task photo attachment supported

### 6.6 Materials — Inventory
**What:** Per-site stock tracking for all materials.
**Fields:** material name, category (consumable / equipment), unit, quantity on hand, minimum reorder level, material budget (per-site, v1.2+).
**Rules:** Quantity changes only via GRN (receipt) or allocation — never direct edit. Budget vs actual tracked in real time.
**Acceptance criteria:**
- [ ] Store Keeper can add a new material in < 1 minute
- [ ] Low-stock alert triggers when quantity ≤ reorder level
- [ ] Budget column shows ₹X spent of ₹Y budgeted with progress chip

### 6.7 Material Receipts (GRN)
**What:** Inward register — record every delivery.
**Fields:** material, vendor, quantity, rate, total value, date, vehicle number, notes, receipt photo.
**Flow:** Store Keeper records → Site Manager confirms → Stock updates → Ledger entry created.
**Acceptance criteria:**
- [ ] GRN entry takes < 2 minutes
- [ ] Unconfirmed GRN shows amber; confirmed updates stock immediately
- [ ] Receipt photo attachable

### 6.8 Material Transfers
**What:** Move material between sites.
**Flow (4 stages):** Initiate → Supervisor confirms dispatch → Store Keeper / Site Manager approves → Receiving site accepts.
**Rules:** Stock at source decreases at dispatch confirmation; stock at destination increases at acceptance.
**Acceptance criteria:**
- [ ] Transfer status visible to both source and destination sites at each stage
- [ ] Cannot transfer more than current stock quantity

### 6.9 Material Ledger
**What:** Immutable transaction history per material.
**Entries:** receipts, allocations, transfers, adjustments.
**Rules:** No edits. No deletes. Corrections = new offsetting entry with reason.
**Acceptance criteria:**
- [ ] Every stock movement creates a ledger entry automatically
- [ ] Ledger shows running balance
- [ ] Ledger is exportable

### 6.10 Equipment / Assets
**What:** Non-consumable equipment tracking (drills, scaffolding, vehicles, helmets).
**Fields:** equipment name, category, condition, assigned to, issue date, return date, maintenance notes.
**Flow:** Issue to worker → Return on completion → Maintenance log.
**Rules:** Supervisor can issue and return. Equipment assigned to a worker cannot be re-issued until returned.
**Acceptance criteria:**
- [ ] Equipment status (available / issued / maintenance) visible by colour
- [ ] Supervisor can issue and return equipment on his sites

### 6.11 Expenses
**What:** Site-level spend tracking — fuel, transport, advance, misc.
**Fields:** date, category, amount, description, receipt photo, requested by, status (pending / approved / rejected).
**Flow:** Supervisor logs → Site Manager / Contractor approves.
**Rules:** Approved expenses feed budget vs actual calculation.
**Acceptance criteria:**
- [ ] Expense entry < 1 minute
- [ ] Approval / rejection notifies the requester (in-app)
- [ ] Monthly expense summary per site

### 6.12 Reports
**What:** Summary views — consumption, stock snapshot, attendance, tasks, budget vs actual.
**Sub-tabs:** Stock Snapshot · Consumption · Budget vs Actual · Tasks · (future: Payroll)
**Output:** Readable on mobile. Shareable to WhatsApp in one tap.
**Acceptance criteria:**
- [ ] Contractor can share a site report on WhatsApp in < 30 seconds
- [ ] Budget vs Actual shows donut chart (material categories) + bar chart (site vs budget) + trend
- [ ] Reports work with zero data (empty state shown, not an error)

### 6.13 Team
**What:** Roster of users (logins) in the tenant.
**Fields:** name, role, email, phone, invite status, last active.
**Rules:** Contractor can invite team members. Role is set at invite time.

### 6.14 Vendors
**What:** Contractor's supplier contact book.
**Phase 1:** Contractor adds vendors manually (name, contact, address, GST, trade category).
**Phase 2 (blocked):** Vendor self-registration → superadmin approval → shared directory.
**Acceptance criteria:**
- [ ] Contractor can add a vendor in < 1 minute
- [ ] Vendor linked to Material Receipts (GRN) as supplier

---

## 7. Modules — In Progress (v1.2)

### 7.1 Sub-Contractor Module
**What:** Track specialist sub-contractors working on a site.
**Fields:** name, trade (17-trade taxonomy), agreed amount, scope, start date, end date.
**Ledger:** Advance paid, progress payments, balance owed.
**Path A (v1.2):** Sub-contractors are entities — they don't log in. Contractor / Site Manager manages their record.
**Acceptance criteria:**
- [ ] Contractor can onboard a sub-contractor and record agreed amount in < 2 minutes
- [ ] Payment ledger shows running balance (agreed → paid → balance)
- [ ] Cannot overpay beyond agreed amount without explicit override

### 7.2 Work Order PDF
**What:** One-click signed Work Order per sub-contractor.
**Contents:** Contractor letterhead, sub-contractor name + trade, scope of work, agreed amount (figures + words), advance, expected balance, site, dates, signature blocks, QR code linking to digital record.
**Acceptance criteria:**
- [ ] PDF generates in < 5 seconds
- [ ] PDF is shareable on WhatsApp
- [ ] Variation Orders stack onto the base Work Order in the PDF

---

## 8. Modules — Planned

### 8.1 Tally Integration (v1.3, ~Jun 2026)
**What:** Export Storey expense and GRN data to Tally XML format.
**Version 1.3 (3 days):** Manual XML export. Contractor downloads and imports into Tally.
**Version 2.0 (7 days):** Live push via TallyBridge — Tally runs locally, Storey pushes via HTTP.
**Gating:** BASIC plan+.
**Acceptance criteria:**
- [ ] One-click XML export from Expenses tab
- [ ] XML is valid Tally 9 / Tally Prime format (Purchase Voucher + Payment Voucher)
- [ ] Mapping UI for vendor → Tally ledger, site → Tally cost centre

### 8.2 Paywall / Plans (v1.3, ~Jun 2026)
**Plans:**

| Plan | Price | Sites | Key gating |
|------|-------|-------|------------|
| **Free** | ₹0 | 1 site | All core ops. Forever free first site. |
| **Basic** | ₹2,999/mo | 3 sites | Sub-contractors, Work Order PDF, Tally export |
| **Advanced** | ₹6,999/mo | 10 sites | Budget vs Actual advanced charts, Google Drive backup, priority support |
| **Enterprise** | ₹14,999/mo | Unlimited | Custom roles, API access, dedicated onboarding |

**Founding Contractor Offer:** First 25 contractors get Advanced locked at ₹2,999/mo forever.
**Payment:** Razorpay subscriptions.
**Acceptance criteria:**
- [ ] Contractor can upgrade plan from inside the app
- [ ] Razorpay checkout works on Android WebView
- [ ] Plan gates enforced server-side (not just frontend)
- [ ] Downgrade path: data not deleted, features locked until plan restored

### 8.3 Offline Mode (v1.x, ~Aug 2026)
**What:** Core data entry works without internet.
**Offline actions:** Mark attendance, add material allocation, log expense, file daily log.
**Sync:** IndexedDB queue, auto-sync when signal returns. Conflict resolution: last-write-wins with timestamp.
**Acceptance criteria:**
- [ ] Offline indicator visible (amber banner)
- [ ] Queued entries show "pending sync" badge
- [ ] Sync completes within 30 seconds of reconnection

### 8.4 "Your Data, Your Drive" Backup (v1.x)
**What:** Daily automatic backup of tenant data to contractor's own Google Drive.
**Format:** JSON per module + CSV for financial records.
**Acceptance criteria:**
- [ ] Contractor authorises Google Drive once
- [ ] Backup runs automatically at midnight IST
- [ ] Backup file named `storey-[tenant]-[date].zip`

### 8.5 Customer Support Bot (v1.x)
**What:** WhatsApp-based support bot — keyword matching → KB articles → escalate to Karun.
**Phase 1:** WATI keyword bot (deployed on help@).
**Phase 2:** Supabase Edge Function + Claude Haiku API for natural language.
**Acceptance criteria:**
- [ ] Bot responds within 5 seconds to a keyword query
- [ ] Escalates to Karun (WhatsApp) when bot cannot resolve in 2 exchanges
- [ ] Full KB covers 8 topic areas (inventory, expenses, tally, login, plans, team, reports, workers)

---

## 9. Auth & Roles

### 9.1 Login Methods
| Method | Status | Notes |
|--------|--------|-------|
| Email + password | ✅ Live | Primary path for all roles |
| Google OAuth | ✅ Live | One-tap. OAuth consent screen in Testing mode (verification pending) |
| Magic link | ✅ Live | Email-based passwordless |
| Invite flow | ✅ Live | Site Managers / Supervisors / Store Keepers invited by Contractor |
| SMS OTP | 🧪 Preview | Not recommended as primary path — delivery unreliable in some NE-India areas |

### 9.2 Roles & Permission Matrix

| Capability | Contractor | Site Manager | Supervisor | Store Keeper | Superadmin |
|-----------|-----------|-------------|-----------|-------------|-----------|
| Create/edit sites | ✅ | ✅ (own) | ❌ | ❌ | ✅ |
| Invite team members | ✅ | ❌ | ❌ | ❌ | ✅ |
| Mark attendance | ✅ | ✅ | ✅ | ❌ | ✅ |
| Confirm attendance | ✅ | ✅ | ❌ | ❌ | ✅ |
| Create tasks | ✅ | ✅ | ✅ (own) | ❌ | ✅ |
| Approve expenses | ✅ | ✅ | ❌ | ❌ | ✅ |
| Record GRN | ✅ | ✅ | ❌ | ✅ | ✅ |
| Confirm GRN | ✅ | ✅ | ❌ | ❌ | ✅ |
| Allocate material | ✅ | ✅ | ✅ | ❌ | ✅ |
| Issue equipment | ✅ | ✅ | ✅ | ❌ | ✅ |
| Initiate transfer | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve transfer | ✅ | ✅ | ❌ | ✅ | ✅ |
| View reports | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage vendors | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage sub-contractors | ✅ | ✅ | ❌ | ❌ | ✅ |
| Approve sub-contractor payment | ✅ | ❌ | ❌ | ❌ | ✅ |
| Upgrade plan | ✅ | ❌ | ❌ | ❌ | ✅ |
| Platform admin (all tenants) | ❌ | ❌ | ❌ | ❌ | ✅ |

All permissions enforced via Postgres RLS (`my_role()`, `my_tenant_id()` SECURITY DEFINER helpers). Application-layer guards are UX only — RLS is the real defence.

---

## 10. Non-Functional Requirements

### 10.1 Performance
- First meaningful paint: < 3 seconds on 4G (10 Mbps, 150ms latency)
- Attendance mark to DB confirmed: < 2 seconds
- Report generation: < 5 seconds for 90-day window
- Photo upload: compresses to ≤ 80KB before send; progress indicator shown

### 10.2 Mobile
- Minimum screen: 360px wide Android phone
- Touch targets: ≥ 44px for all interactive elements
- No horizontal scroll on any screen
- Works in bright sunlight (high-contrast text: ≥ 4.5:1 ratio)
- Camera integration: native Android camera via Capacitor plugin (not WebRTC)

### 10.3 Offline
- Core entry actions (attendance, material allocation, expense, daily log) queue offline
- Sync within 30 seconds of reconnection
- Conflict resolution: last-write-wins with UTC timestamp
- User sees "offline mode" amber banner when disconnected

### 10.4 Data Integrity
- Material ledger: append-only. No UPDATE or DELETE. Corrections = new entries.
- Attendance: append-only after Site Manager confirmation.
- Supabase query builder: NEVER chain `.catch()` — use `try/catch` or `.then(ok, err)`.

### 10.5 Security
- All RLS policies use `my_tenant_id()` — no cross-tenant data leakage possible
- ID proof: only last 4 digits stored. Full number never reaches the DB.
- OAuth PKCE flow. No implicit grant.
- Canonical domain: always redirect to `www.storeyinfra.com` at boot
- Session tokens: Supabase JWT, 1-hour expiry, refresh token rotation

### 10.6 Hosting / Build
- Web: Vercel (auto-deploy on `main` push)
- Mobile: Capacitor Android (APK / AAB via `npx cap build android`)
- `vite.config.js` base: `'/'` on Vercel, `'./'` on Android — auto-switched by `process.env.VERCEL`
- Router: `createHashRouter` — all in-app routes at `/#/path`
- OAuth callback: real path `/auth/callback` — intercepted in `main.jsx` before React mounts

---

## 11. Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React 18 + Vite + Tailwind CSS | |
| State | Zustand | Auth + tenant state |
| Router | React Router v6 (hash router) | `createHashRouter` |
| Backend | Supabase (Postgres + RLS + Edge Functions + Auth) | Project ref: `zgvbogxibiilnblmuohg` |
| Mobile | Capacitor (Android) | `npx cap build android` |
| Hosting | Vercel (web) | Auto-deploy from `main` |
| Email | Resend via Supabase SMTP | `noreply@storeyinfra.com` |
| SMS OTP | Custom Edge Function | `send-sms-otp`, `verify-sms-otp` |
| Payments | Razorpay (planned v1.3) | Subscriptions |
| Analytics | (none yet — planned v1.x) | |
| Charts | Recharts | Bar, line, donut |
| Icons | Lucide React | |
| Photos | `html2canvas` (help screenshots), Capacitor Camera | |

---

## 12. Key Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| Google OAuth | Contractor sign-in | ✅ Live (verification pending) |
| Resend | Transactional email (invites, magic links) | ✅ Live |
| WhatsApp (wa.me) | Report sharing, help requests, support | ✅ Live |
| Tally XML | Accounting export | 🗓 v1.3 |
| Razorpay | Subscription payments | 🗓 v1.3 |
| Google Drive | Data backup | 🗓 v1.x |
| WATI | WhatsApp bot (support) | 🗓 v1.x |

---

## 13. Out of Scope (Current Version)

- **Vendor login / self-registration** — Phase 2. Superadmin approval required.
- **Worker app** — Workers are tracked *by* supervisors; they don't log in themselves.
- **Client / Owner portal** — The project owner (Ramesh's client) doesn't log in.
- **Invoicing / billing** — Storey is operations, not accounts. Tally owns the books.
- **HR / payroll processing** — Attendance + wages tracked; payroll *disbursement* is out.
- **Government tendering / BoQ** — Different procurement rules; different product.
- **International markets** — Until NE India is fully captured.
- **AI / ML features** — Nice to have, not required for v1.

---

## 14. Success Metrics

### 14.1 User Metrics
| Metric | Day 30 | Day 60 | Day 90 |
|--------|--------|--------|--------|
| Active testers (Play Console) | 12 | 12 | — |
| Contractors on paid plan | — | 1 | 5 |
| MRR | ₹0 | ₹3k | ₹15k |
| Sites created by real contractors | 5 | 15 | 30 |
| Attendance marks in last 7 days | 50 | 200 | 500 |
| WhatsApp reports shared | 10 | 50 | 150 |

### 14.2 Quality Metrics
| Metric | Target |
|--------|--------|
| Crash-free sessions (Android) | ≥ 99% |
| P0 bugs open | 0 at any time |
| Support ticket resolution | < 24 hours |
| Time to first attendance mark (new user) | < 10 minutes |

### 14.3 Business Metrics
| Metric | Target |
|--------|--------|
| Pvt Ltd registration | Before Day 90 |
| Razorpay account live | Day 30 |
| First payment received | Day 60 |
| 5 paying contractors | Day 90 |

---

## 15. Open Questions

| # | Question | Owner | Due |
|---|----------|-------|-----|
| Q1 | Should sub-contractor module be on Free plan (as a trial hook) or gated at Basic? | Karun | Before v1.2 ship |
| Q2 | What is the price floor for "Founding Contractor" offer? ₹1,499/mo? ₹1,999/mo? ₹2,999/mo? | Karun | Before paywall launch |
| Q3 | Should the offline queue show a count badge on the nav icon? | Design | v1.x |
| Q4 | Do we need a "worker app" (limited view for workers to see their own attendance + tasks)? | Karun | v2 planning |
| Q5 | Assamese language: is a community translator willing to do it for equity / credit? | Karun | v1.x |
| Q6 | Should daily logs have a mandatory "work done today" field or can it be optional? | Tester feedback | v1.2 |

---

## 16. Revision History

| Date | Version | Change |
|------|---------|--------|
| 2026-05-24 | v0.1 | First draft — created from FEATURES.md, PRODUCT-STRATEGY.md, ROADMAP-90.md, MONETIZATION-90-DAY-PLAN.md |

---

*Next update: after v1.2 ships (target: Jun 2026) or when a major product decision changes.*
