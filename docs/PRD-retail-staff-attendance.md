# Product Requirements Document
## Remote Store-Management App (Retail / Garment)

**Author:** Claude (with Karun)
**Date:** 2026-06-13
**Status:** 🟢 DRAFT v0.3 — core decisions locked with owner. Build-ready scope below.
**Project:** SEPARATE from Storey (construction ERP). Sits alongside the EOSS
dealer credit-note tools in `C:\consne\`. Reuse Storey *patterns*, not the product.

---

## 1. What it is

An app to **run retail stores remotely**. An owner oversees one or more stores
without being on-site: sees daily condition through photos, tracks sales KPIs and
staff attendance, and pays staff sales-based incentives — with the incentive and
photo rules **configured by the owner per store**.

---

## 2. Scale & roles (LOCKED)

- **Multiple stores under one owner.** Each store has its own manager, staff, KPIs.
- Three roles, **all with their own logins**:

| Role | Scope | Does |
|------|-------|------|
| **Owner** | All their stores | Configures incentive rules + photo requirements; reviews KPIs, attendance, photos, incentive payouts across stores. |
| **Manager** | One store | Approves staff sales daily, confirms attendance, uploads required photos. |
| **Staff** | Self | Logs in; records own sales; sees own attendance, sales, earned incentive. |

---

## 3. Core features (LOCKED decisions in **bold**)

### 3.1 KPI / sales logging + manager approval
- **All KPIs are entered manually — no POS/billing integration in v1.**
- **Staff log their own sales** (the individual-KPI input). Other KPIs `[TBD: full
  list]` are entered by staff/manager too.
- Entries are **`pending` until the manager approves the day's sales** (manager
  checks against the actual cash/bill total before approving). Only **approved**
  figures count toward KPIs and incentives.
- States: `pending → approved` (or `rejected`, with reason). No edits after approval.
- → This is the anti-gaming control: staff earn from these numbers, so a manager
  gate sits between entry and payout. (Manual entry makes this gate essential.)

### 3.2 Attendance (FULL detail) + weekly holiday + geo-fencing
- Per staff, per day. Statuses: **Present · Absent · Late · Half-day · Leave ·
  Weekly-off** (no overtime).
- **Geo-fenced check-in (LOCKED):** a staff member can only mark themselves
  present **from within the store's location** — the app captures GPS at check-in
  and rejects it if outside the store's geofence (lat/lng + radius). **Radius = 30m
  (LOCKED).** Blocks remote/buddy check-ins. Out-of-fence attempts are flagged,
  not silently dropped (manager can still approve — see risk note below).
- **Date-stamped check-in photo (LOCKED):** at check-in the staff also takes a
  **photo, stamped with date + time** (and ideally GPS). This is the physical proof
  of presence that backs up the geofence — so even if GPS drifts, the photo shows
  the person was actually at the store. Stored with the attendance row.
- **Manager confirms** attendance (geo + photo check-in still goes through the
  manager's confirmation, consistent with the sales-approval model).
- **Manager override (LOCKED):** when there's a genuine issue — GPS falsely
  rejected an on-site staff, phone/camera failure, dead battery, no signal — the
  **manager can override and mark the staff present** (or correct any status). The
  override:
  - **requires a reason** (free text / pick-list), and
  - is **logged with who/when/old→new value** (audit trail), and
  - is **visible to the owner** (overrides are surfaced, not hidden) — so the
    override is a controlled escape hatch, not a silent loophole.
- ⚠️ **30m is a tight fence.** On older Android phones in dense markets, GPS drift
  (~20–50m) can falsely reject a staff member who IS inside. Mitigation: the fence
  *flags* rather than blocks, the **date-stamped photo** is the real proof, the
  **manager override** handles edge cases, and overrides are owner-visible. Revisit
  the radius if false rejects are common.
- **Fixed weekly holiday, but swappable:** each staff has a default weekly off day
  (e.g. Tuesday). For a given week the manager can **move that week's off to a
  different day** so an unplanned absence is re-designated as the weekly holiday
  instead of an unpaid absence. Constraint: **one weekly-off per staff per week**
  (moving it, not adding one). Weekly-off is paid; absence is not.
- **Monthly attendance view** — per staff, a month grid/summary: days present,
  absent, late, half-days, leave, OT, and which day was the weekly-off each week.
  This is the input to salary (§3.5).
- Feeds incentive eligibility (see 3.4) and salary (see 3.5).

### 3.5 Monthly salary calculation
Staff have a **fixed monthly salary** in addition to incentives. At month end the
app computes pay from the confirmed monthly attendance:

  **Pay = base salary − absence deductions (± half-day/leave/OT) + incentive**

- **Base salary** — fixed per staff (owner/manager sets it).
- **Weekly-offs are paid** — they do NOT deduct.
- **Per-day rate = base salary ÷ 30** (LOCKED). One absence deducts one such day.
- **Deduction ladder (LOCKED):**
  - **Weekly-off** → paid (no deduction)
  - **Approved leave / absence** → 1× per-day deduction (unpaid, but no penalty)
  - **Unapproved absence** → 2× per-day deduction (penalty — see §3.6)
- **Half-day** = half the per-day deduction. **No overtime** — OT is not tracked or paid.
- **Incentive** (from §3.4) is added on top.
- Output: a **monthly salary sheet** per staff and per store (and a store roll-up
  for the owner). Manager/owner review before it's final `[TBD: who finalises?]`.

### 3.6 Leave / off requests + approval (with no-show penalty)
- **Every off/leave must be requested in advance and approved** — staff cannot
  just take a day.
- **Minimum notice: ≥ 2 days before the off date.** Requests with less notice
  `[TBD: auto-rejected, or manager-discretion?]`.
- Flow: staff submits request (date + reason) → **manager approves / rejects** →
  if approved, that day is recorded as approved leave/off (1× or paid per policy).
- **No-show penalty:** if a staff is absent **without an approved request, the
  salary deduction is 2× the normal per-day rate** (vs 1× for an approved absence).
- The weekly-off swap (§3.2) is the *planned* mechanism; this §3.6 flow governs
  *additional* offs/leave beyond the weekly holiday.
- Data: `leave_requests` (staff_id, store_id, date, reason, status, decided_by,
  requested_at) — `requested_at` vs `date` enforces the 2-day rule.

### 3.3 Visual store reporting — OWNER-CONFIGURABLE
- **The owner chooses** which photo categories are required and how often
  (per store). Examples: housekeeping, display, opening shot, closing shot.
- Manager uploads to satisfy the owner's rule; owner reviews remotely.
- Each photo: category, timestamp, store, uploaded-by. Compress on upload (cost).

### 3.4 Incentive system — OWNER-CONFIGURABLE
The differentiator. Three mechanisms, **all active**, with **owner-set rules per store**:

1. **Individual** — from a staff member's own (approved) sales.
2. **Collective** — whole-store sales hit a target → a pool shared across staff.
3. **Attendance gate** — staff below the owner's attendance threshold earn
   reduced/zero incentive regardless of sales.

**Calculation basis is configurable by the owner** (can be changed per store):
- **% of sales value**, and/or
- **per unit sold**, and/or
- **tiered / threshold** (rate kicks in or steps up above a target).

So the incentive engine must store a **rule config per store** (mode mix, rate(s),
thresholds, attendance gate %, payout period) rather than hard-coded numbers.

---

## 4. Data model (first cut)

- `owners` / `users` (role: owner | manager | staff) — auth + role + store link
- `stores` (owner_id, name, logo_url, geo_lat, geo_lng, geofence_radius_m, …)
  — owner can upload a per-store logo (Supabase Storage); shown in header + store cards
- `store_members` (store_id, user_id, role)
- `sales_entries` (store_id, staff_id, date, units, value, status, approved_by, bill_ref?)
- `attendance` (store_id, staff_id, date, status [+ weekly-off], approved [bool],
  check_in_lat, check_in_lng, geo_ok [bool], check_in_photo_url, check_in_at
  [timestamp], confirmed_by, overridden_by, override_reason, override_at)
- `leave_requests` (store_id, staff_id, date, reason, status, requested_at, decided_by)
- `staff_pay` (staff_id, base_salary, default_weekly_off_day, per_day_divisor, …)
- `photos` (store_id, category, url, uploaded_by, taken_at)
- `incentive_rules` (store_id, mode flags, rate config JSON, attendance_gate_pct, period)
- `incentive_payouts` (store_id, staff_id, period, computed_amount, basis snapshot)
- `salary_runs` (store_id, staff_id, month, base, deductions, incentive, net, status)
  — the computed monthly salary sheet (auditable snapshot of the inputs)

RLS: staff see only their own rows; manager sees their store; owner sees their stores.
(Same SECURITY-DEFINER `my_role()` / store-scoping pattern as Storey.)

---

## 5. Roles × permissions (RLS sketch)

| Action | Staff | Manager | Owner |
|--------|:-----:|:-------:|:-----:|
| Log own sales | ✅ | ✅ | ✅ |
| Approve sales | — | ✅ (own store) | ✅ |
| Confirm attendance | — | ✅ | ✅ |
| Override attendance (logged, owner-visible) | — | ✅ | ✅ |
| Upload photos | — | ✅ | ✅ |
| Set incentive rules | — | — | ✅ |
| Set photo requirements | — | — | ✅ |
| See own incentive | ✅ | ✅ | ✅ |
| See store KPIs/payouts | own only | own store | all stores |
| Request leave/off (≥2 days ahead) | ✅ | ✅ | ✅ |
| Approve/reject leave | — | ✅ (own store) | ✅ |
| Move weekly-off day | — | ✅ | ✅ |
| Set base salary | — | `[TBD]` | ✅ |
| Run/finalise monthly salary | — | `[TBD]` | ✅ |

---

## 6. Format / tech (STACK LOCKED — project scaffolded 2026-06-13)

- **Web/mobile app** (multi-user, photos, live KPIs, logins) — Excel is ruled out.
- **Repo:** `C:\store-manager` — own git repo, own `package.json`, own Supabase.
  Fully separate from Storey (`C:\consne`). **Do NOT merge into Storey.**
- **Stack = Storey stack + `@capacitor/geolocation`:**
  - React 18 + Vite + **Capacitor (Android)** — staff on cheap Androids; native GPS + camera
  - **`@capacitor/geolocation`** — the 30m attendance geo-fence (the one new dep vs Storey)
  - `@capacitor/camera` + `browser-image-compression` — date-stamped check-in photo
  - **Supabase** (its OWN project) — auth, multi-role RLS, Postgres (payroll/incentives), Storage (photos)
  - Zustand + React Router (**hash router** — Capacitor `file://`)
  - Tailwind + `lucide-react` (visual-first; staff may be low-literacy) · `recharts` (KPI charts)
- **Status:** scaffold committed (builds green, dev server serves). No real screens yet.
- **Build order:** auth/roles → attendance check-in (geo + photo) → sales+approval
  → incentive engine → payroll → store photos.

---

## 7. Acceptance check (v1)

> An owner at home can, for any store and day: see the required photos, see who
> was present (with status), see approved sales + KPIs, and see each staff
> member's computed incentive under the rules they configured — without calling
> the store. A staff member can log their sales and see their own attendance and
> earned incentive. A manager can approve the day's sales, confirm attendance, and
> move a staff member's weekly-off to absorb an absence. At month end, the app
> produces a per-staff **monthly salary sheet** (base − absence deductions +
> incentive) that the owner can review per store.

---

## 8. Open items still to decide (smaller, not blocking)

- Incentive **payout period** — monthly? weekly? (owner-config field, default monthly)
- Sales unit definition — per bill, per item line, or per quantity?
- Does the owner approve manager-approved sales too, or trust the manager?
- **<2-day-notice requests** — auto-rejected, or manager discretion?
- Other KPIs beyond sales — define the full list, or is sales the only KPI for v1?
- **Who sets base salary & finalises the salary run** — owner only, or manager too?
- Multi-language / phone-tier constraints (if staff are low-literacy, apply the
  Storey visual-first principles).

---

## 9. Risks / notes

- **Incentive logic is the complexity sink** — three modes + configurable rates +
  tiers + attendance gate. Build the **rule engine once, data-driven**; do not
  hard-code. Ship with ONE simple default config, prove it, then expose all knobs.
- **Sales trust** rests on the manager approval gate — make that step fast and
  hard to skip.
- **Photo storage** across many stores daily — compress, set retention.
- **Keep separate from Storey** — shared patterns, separate product/data.

---

_Linked: `docs/TODO.md` → "Remote store-management app" entry._
_History: v0.1 attendance-only skeleton → v0.2 concept capture → v0.3 core
decisions locked → v0.4 monthly attendance + salary + swappable weekly-off →
v0.5 leave/off request workflow (≥2-day advance approval; unapproved absence = 2×
deduction penalty) → v0.6 per-day rate locked at base ÷ 30; overtime dropped → v0.7 deduction ladder
locked (weekly-off paid · approved 1× unpaid · unapproved 2× penalty) → v0.8
KPIs entered manually (no POS); geo-fenced attendance check-in → v0.9 geofence
radius locked at 30m; date-stamped check-in photo → v0.10 (2026-06-13) manager
override for attendance edge cases (reason required, logged, owner-visible)._
