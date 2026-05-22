# Storey — daily workflows by role
### How each role actually uses Storey on a real site
*Last updated 2026-05-22*

> This doc is for prospect contractors, new testers, and partners who want to see *what Storey does in practice* — not the feature list, but the flow. Walk it through end-to-end in 10 minutes.

---

## Contractor — owner-operator daily flow

**Persona:** Karun, owner of BuildNE Infrastructure. Runs 3 sites, ~50 workers across them.
**Time on app:** ~10 minutes morning, ~10 minutes evening.

### Morning (8 AM — over coffee)

1. **Open the dashboard.** Big-number snapshot: workers across all sites, sites active, tasks due today, ₹ spent yesterday.
2. **Check the bottom strip.** "✓ All clear" or "⚠ 2 materials below reorder." If red — tap, see which sites + materials, decide whether to phone the supplier.
3. **Scan "Your sites" list.** Status colour stripe per site — green / amber / blue / gray. Any stripe you don't expect?
4. **Tap Reports** for the spend summary if a payroll cycle is closing.

### During the day (drop-in)

- New contractor / vendor / sub-contractor to register? → **Sites** or **Team**.
- A site_manager asks for budget approval → review and confirm in seconds.
- Material delivery you want to verify after a phone call → **Inventory** → recent receipts.

### Evening (8 PM — wrap-up)

1. **Re-open dashboard.** Spend today number — sanity-check against the day's events.
2. **Tap "Reports"** for any anomalies in the day. Big variances trigger a phone call to the site_manager tomorrow.

### Recurring rhythm

- **Weekly:** review pending sub-contractor payments (v1.2). Approve advances. Print Work Order PDFs for newly hired specialists.
- **Monthly:** budget vs actual reports per site. Decide which sites are over-spending.
- **Quarterly:** ledger audit — flag anything suspicious in the append-only history.

---

## Site Manager — day-to-day reviewer

**Persona:** Pranab Gogoi, site manager at NH-37 Furkating-Mariani.
**Time on app:** ~30 minutes morning, intermittent through day, ~15 minutes evening.

### Morning (8 AM — before the first site visit)

1. **Open dashboard.** First thing you see: 🔔 *"5 items need your sign-off."*
2. **Tap "Approvals" tile** (or the Needs-your-confirmation panel). Triages in priority order:
   - Attendance entries from supervisors yesterday (~2 minutes)
   - Daily logs submitted yesterday (~3 minutes)
   - Tasks supervisors marked submitted (~5 minutes)
   - Material transfers prepared (~3 minutes)
   - Expenses awaiting approval (~5 minutes)
3. **Check workers on site today.** From hero stat — is the number what you expected?

### During the day (in the field)

- **Supervisor calls** with a question → open the site → see today's daily log + active tasks → answer with context.
- **New worker onboarding** at a site → use the simplified worker form, 5 essential fields visible, "+ Add more details" hides the rest.
- **Equipment to issue** to a sub-contractor team arriving on site → Equipment → Assign → record assignee + zone.
- **Material running low at a site** → check stock → initiate transfer from another site OR phone the supplier.

### Evening (7 PM — close-out)

1. **Confirm any remaining items** from the day's submissions.
2. **Scan tomorrow's task load** in My Tasks widget.
3. **Spot-check one supervisor's daily log** for completeness (photos, work-done, issues called out).

---

## Supervisor — on-site operator

**Persona:** Devraaj, supervisor at NH-37 Furkating-Mariani.
**Time on app:** ~20 minutes spread across the day, mostly bursts of 1–2 minutes.

### Start of day (7 AM — workers gathering)

1. **Open dashboard.** Hero stats: workers today (number will fill in as you mark attendance), tasks open, sites count.
2. **Tap "Attendance" tile.** Mark each worker present / absent / half-day. Save → status becomes "pending confirmation" awaiting site_manager.
3. **Glance at "My Tasks"** — see what's due today. Plan the order.

### During the day (every 1–2 hours)

- **Material going to a work** → Inventory → tap the material → Allocate → enter quantity + work description → save. New flow validates stock first, atomic save, success confirmation in ~500ms.
- **Issue a drill to Ramesh's electrical team** → Equipment → tap the drill → Assign → enter "Ramesh / Block A wiring." Ledger updates automatically.
- **Daily log photo** at the foundation pour → Daily Logs → New log → tap camera → photo captured with date-time stamp burned in.
- **A worker completes a task** → Tasks → tap the task → Mark finished — submit. Status moves to "submitted" awaiting site_manager.

### End of day (6 PM — close out)

1. **File today's daily log** if not already done — workers, work done, weather, issues, one summary photo.
2. **Submit any tasks** that wrapped up.
3. **Mark any inbound material transfers as received** if a truck delivered something.

---

## Store Keeper — materials warehouse

**Persona:** Biplab Das, store keeper at BuildNE's main warehouse.
**Time on app:** ~30 minutes morning, drop-in during deliveries, ~15 minutes evening.

### Morning (8 AM)

1. **Open dashboard.** Stock at a glance — lowest items first. Red badges for items below reorder level.
2. **Check pending receipts** from yesterday — confirm any that aren't.
3. **Plan today's transfers** between sites based on supervisor requests.

### During the day

- **Truck arrives with cement** → Inventory → Add Receipt → enter quantity + supplier + photo of challan → submit. Site manager confirms.
- **Site manager calls for stock at another site** → Transfers → New Transfer → from-site, to-site, material, quantity → submit. Supervisor at from-site confirms dispatch.
- **Supplier asks for the last 6 months of cement receipts** → Inventory → tap cement → Ledger → export visible to clipboard / WhatsApp.

### Evening

1. **Close any open transfers** that should have been received by now.
2. **Send tomorrow's expected deliveries** as a WhatsApp message to relevant site supervisors.

---

## Sub-contractor — *(coming in v1.2)*

**Persona:** Mistri Ramesh, electrical sub-contractor handling 3 sites for BuildNE.

Sub-contractors don't log into Storey directly (Path A model). They appear as **entities** in the contractor / site manager workflow:

- Site Manager **onboards Ramesh** when he's hired: trade (Electrical), agreed amount (₹5L), scope description.
- A **printable Work Order PDF** is generated, signed by both parties.
- Supervisor **allocates material** to Ramesh's team as he requests it (cement for fixing conduit, wire from store).
- Supervisor **issues equipment** like drills + ladders to him.
- Contractor **records advance + running-bill payments** in the sub-contractor payment ledger. Balance updates automatically.
- If scope **expands mid-project** ("5th floor added") — a Variation Order is recorded; doesn't rewrite the original. The Work Order PDF stacks the original + variations as one signed document.

This entire flow lives in v1.2. The Path A model means Ramesh himself just gets the PDF on his phone via WhatsApp — no install, no signup required from him.

---

## A typical inter-role day at one site

Cross-checking the flows with real timing:

```
7:00 AM   Workers gather. Supervisor marks attendance.
7:15 AM   Supervisor files morning daily log start.
8:00 AM   Material receipt: cement truck arrives.
8:05 AM   Store keeper records GRN, photo of challan.
8:15 AM   Site manager (off-site, on phone) confirms attendance + GRN.
9:00 AM   Supervisor allocates 30 bags cement to "Foundation pour, Block A."
10:30 AM  Sub-contractor's electrical team arrives. Supervisor issues a drill.
12:00 PM  Lunch break.
1:00 PM   Sub-contractor requests 5 bags cement for conduit-fixing. Allocated.
2:00 PM   A task ("Build retaining wall") is marked finished by supervisor.
2:30 PM   Site manager reviews + confirms the task.
5:00 PM   Day winds down. Supervisor finalises daily log with end-of-day photo.
5:30 PM   Sub-contractor returns the drill. Equipment status: Available.
6:00 PM   Contractor checks the dashboard from home. ₹14k spend, 12 workers,
          3 tasks closed. Approves one expense waiting for sign-off.
```

The whole flow is captured. Nothing in a notebook. Photos with timestamps. Material movements all traceable. Audit history append-only.

---

## What changes for users in offline conditions

- **Attendance, daily logs, expenses** can be entered offline — they queue in IndexedDB and sync when the phone re-connects.
- **Photos** are captured and held locally; upload happens on next sync.
- **Reading data** (stock levels, task lists, sites) requires a brief online connection per session to load. Once loaded, the user can scroll without internet for ~30 minutes before it goes stale.

Storey is built assuming flaky 4G on construction sites in NE India.
