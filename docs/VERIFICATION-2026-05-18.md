# Verification Checklist — 2026-05-18 Build

Purpose: verify the work shipped on 2026-05-18 before relying on it or building
anything new (TODO item P0). Walk each test on `storeyinfra.com`, tick the box,
note anything that breaks.

Build: offline mode · on-site photos · Task/Work-Assignment module · 4-stage
material-transfer redesign · attendance & daily-log confirmation layer · spinner
fixes · password-reset fixes.

---

## Part 1 — Backend & deployment  ✅ verified 2026-05-18

| Check | Result |
|---|---|
| Web app live (`storeyinfra.com`) | ✅ HTTP 200 |
| Edge functions responding | ✅ HTTP 200 |
| All migrations applied to live DB (`009` … `20260518170000`) | ✅ |
| New tables `tasks`, `task_updates` exist | ✅ |
| `attendance` / `daily_logs` / `material_transfers` columns applied | ✅ |
| `site-photos` storage bucket migration applied | ✅ |

The plumbing is confirmed. Part 2 below is the user-facing walk-through.

---

## Part 2 — Manual UI tests (walk these on `storeyinfra.com`)

Mark each: ✅ pass · ❌ fail (note what happened) · ⏭ skipped

### T1 — Tasks: cascade assignment
- [ ] Contractor creates a task, assigns it to a Site Manager
- [ ] Site Manager opens it, adds a sub-task, assigns to a Supervisor
- [ ] Supervisor opens the sub-task, adds a sub-task assigned to a Worker
- [ ] **Expected:** the assignee dropdown shows only the next role down each time
- Result: _____   Notes: _____

### T2 — Tasks: daily update + status
- [ ] On a task, log a daily update with a note + photo
- [ ] Move it Pending → In progress → Submitted
- [ ] As the assigner, Confirm it → status becomes Done
- [ ] Try "Send back" on a Submitted task → returns to In progress
- [ ] **Expected:** overdue tasks show a red "N days late" badge
- Result: _____   Notes: _____

### T3 — Material transfer: 4 stages
- [ ] Store Keeper / Site Manager initiates a transfer (from/to site, material, qty)
- [ ] Supervisor of the from-site sees it on their dashboard → confirms dispatch
      (vehicle/challan) → **from-site stock drops**
- [ ] Store Keeper / Site Manager approves it
- [ ] Receiving site accepts with quantity → **to-site stock rises**
- [ ] **Expected:** the transfer's Activity log shows who did each stage + when
- Result: _____   Notes: _____

### T4 — Attendance confirmation
- [ ] Supervisor marks attendance for a site+date → shows "pending confirmation"
- [ ] Site Manager opens the same day → "Confirm Day" → shows ✓ Confirmed
- [ ] Reports → Attendance: an unconfirmed day shows the amber "pending" banner
- Result: _____   Notes: _____

### T5 — Daily log confirmation
- [ ] Supervisor files a daily log → badge shows "Pending"
- [ ] Site Manager confirms it → badge shows "Confirmed"
- [ ] Edit a confirmed log → it returns to "Pending"
- Result: _____   Notes: _____

### T6 — On-site photos
- [ ] Add a photo on a daily log / expense / receipt / worker
- [ ] **Expected:** camera opens (not gallery first) on a phone
- [ ] The saved photo shows a date-time stamp burned into the corner
- [ ] Tap a photo thumbnail → it opens full-size; tap again / ✕ to close
- Result: _____   Notes: _____

### T7 — Offline mode
- [ ] Turn off the network (airplane mode)
- [ ] Mark attendance / file a daily log / add an expense
- [ ] **Expected:** an offline banner appears; the entry saves locally
- [ ] Turn the network back on
- [ ] **Expected:** the banner shows syncing, then the data appears server-side
- Result: _____   Notes: _____

### T8 — Loading spinner
- [ ] Use the app normally for a while, switch browser tabs and back
- [ ] **Expected:** no endless "Loading Storey…" spinner; no full-screen
      blank-out when a token refresh happens in the background
- Result: _____   Notes: _____

### T9 — Password reset
- [ ] Login page → Forgot password → enter email
- [ ] **Expected:** "check your email (incl. spam)" message
- [ ] Email arrives from `noreply@storeyinfra.com`
- [ ] The link opens the **Set new password** page (not login/dashboard)
- [ ] Set a new password → lands in the dashboard
- Result: _____   Notes: _____

### T10 — Dashboards
- [ ] Supervisor dashboard shows "transfers awaiting your dispatch" when relevant
- [ ] Site Manager dashboard shows the "Needs your confirmation" panel
- Result: _____   Notes: _____

---

## Sign-off

- Tested by: ______________________
- Date: ______________________
- Overall: ☐ all pass — build verified  ☐ issues found (listed below)

Issues found (paste here, then send to Claude to fix):
1.
2.
3.
