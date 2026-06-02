# Spec — Unified Budgeting & Cost-Centre Module

### Draft v0.1 · 2026-06-02 · for build in the v1.2 window (NOT pre-production)

> **Classification:** Rewrite/consolidation — replaces three fragmented budget
> systems with one. Tag: **v1.2**. Build the **budgeting backbone first**, before
> the sub-contractor module (which plugs into this hub).
>
> **Acceptance check (write before code):**
> *A contractor sets a budget for the "Building" cost centre (e.g. ₹5L material,
> ₹3L labour). As materials are consumed and attendance is marked against
> "Building", the Budget screen shows — Building: material ₹4.2L/₹5L, labour
> ₹3.4L/₹3L (over), total ₹7.6L/₹8L. The site total = the sum of all cost centres,
> including an auto-created "General" bucket that holds any untagged spend.*

---

## 1. Why — the current state is three systems that don't reconcile

| System | Budgets | Computes "actual" | Cost centres | Labour |
|---|---|---|---|---|
| `budget_lines` (006) | per-material, per-month ₹+qty | nothing | No | No |
| `materials.budget_qty` + `site_material_budget_v` (20260524) | per-material project total | consumption (qty) + receipts (cost) | No | No |
| `cost_centres` + `cost_centre_budget_v` (20260530) | per-cost-centre ₹ | receipts of tagged materials | master-tag | No |

Three "actual" calculations, none agree, none include labour. **Five fixes:**
1. Three systems → one.
2. Material cost is tagged to the material *master* (`materials.cost_centre_id`) —
   wrong (one material serves many centres). Move attribution to the **point of use**.
3. "Actual" computed inconsistently → one definition.
4. No labour / expenses / sub-contractor in any actual.
5. No site-total roll-up, no "general" bucket.

## 2. Locked design decisions (owner-approved 2026-06-02)
- **D1 — material attribution: at CONSUMPTION** (not master tag, not receipt).
- **D2 — budget granularity: BY CATEGORY** (material · labour · sub-contractor · other),
  with optional per-material qty budget inside the material category.
- **D3 — material "actual" = CONSUMPTION** (cost of material *used*); receipts stay for
  stock value, not cost-centre actuals.
- **D4 — labour attribution: per ATTENDANCE record** (which part of site that day);
  defaults to the General bucket.
- **D5 — migrate data + retire `budget_lines` and the old `cost_centre_budget_v`;**
  keep `cost_centres` (evolved) and `materials.budget_qty` + `site_material_budget_v`
  (the material-qty deviation layer, which is orthogonal and stays useful).

## 3. The model
- **Cost centre = the budget bucket** (keep `cost_centres`). Every site auto-gets one
  **`is_general` "General"** bucket that absorbs untagged spend → site total always =
  Σ centres, nothing unaccounted.
- **Budget per centre, by category.** Each centre carries category budgets; total = sum.
- **Actuals = a true hub.** Every cost source carries `cost_centre_id` at the
  transaction level; the view sums them per centre.

```
   material consumption ─┐
   labour (attendance)  ─┤
   expenses             ─┼─▶ cost_centres ─▶ budget vs actual (by category)
   sub-contractor (v1.2)─┘                  ─▶ site total = Σ centres
```

## 4. Schema changes
**`cost_centres`** (evolve)
- add `is_general boolean not null default false`
- add `budget_material`, `budget_labour`, `budget_subcontractor`, `budget_other`
  `numeric(14,2)` (nullable). *(Migrate existing `budget_amount` → `budget_material`.)*
- keep `budget_amount` as a generated total or drop after migration (decide at build).

**Attribution columns (the hub)** — all nullable FK `→ cost_centres(id) on delete set null`:
- `material_allocations.cost_centre_id` (+ the `task_id`/`subcontractor_id` from item 1b)
- `material_transactions.cost_centre_id` (consumption rows carry the centre)
- `attendance.cost_centre_id`
- `site_expenses.cost_centre_id`
- *(future)* `subcontractor_assignments.cost_centre_id`

**Cost basis**
- Material consumption cost = consumed qty × `materials.unit_cost` (current rate).
  *(Note: weighted-average costing is a later refinement; current unit_cost is fine for v1.)*
- Labour cost = present-day count × `workers.daily_wage`.
- Expense cost = approved `site_expenses.amount`.

## 5. The unified view
Rewrite **`cost_centre_budget_v`** (security_invoker), one row per centre:
- `budget_material/labour/subcontractor/other` + `budget_total`
- `actual_material` (Σ consumption × unit_cost, by `cost_centre_id`)
- `actual_labour` (Σ attendance × daily_wage, by `cost_centre_id`)
- `actual_expense` (Σ approved expenses, by `cost_centre_id`)
- `actual_subcontractor` (0 until that module ships → then a left join)
- `actual_total`, `pct_spent`, `variance` (per category + total)

Add **`site_budget_v`**: per site, Σ of its centres (budget_total, actual_total, variance).

Keep `site_material_budget_v` (material-qty deviation, per material). Retire old
`cost_centre_budget_v` (replaced) and **deprecate `budget_lines`** (stop writing;
drop after verification).

## 6. Data migration (from 3 systems → 1)
1. Add new columns/tables.
2. **Auto-create a "General" (`is_general=true`) cost centre for every existing site.**
3. Backfill `material_transactions.cost_centre_id` on existing consumption rows:
   use the material's old `materials.cost_centre_id` if set, else the site's General.
4. Migrate `cost_centres.budget_amount` → `budget_material`.
5. Backfill `attendance.cost_centre_id` / `site_expenses.cost_centre_id` → General
   (no historical attribution exists; new entries pick a centre).
6. Stop writing `budget_lines`; keep table read-only until verified, then drop.
7. Build the new view; switch Reports to it.

## 7. UI
- **Budget screen** per site (Reports tab or site detail):
  - Set per-centre **category budgets** (material/labour/sub-contractor/other).
  - Budget-vs-actual roll-up per centre (by category) + **site total**.
  - Drill into a centre → material/labour/expense breakdown.
  - Material-qty deviation sub-view (from `site_material_budget_v`).
- **Entry forms gain a cost-centre picker** (defaults to General):
  material allocation/consumption · attendance · expenses.

## 8. Build order
1. Migration (schema + data) — one set.
2. Cost-centre picker on allocation / attendance / expense forms.
3. Unified `cost_centre_budget_v` + `site_budget_v`.
4. Budget UI (replaces the scattered budget bits).
5. Sub-contractor module plugs into the hub afterward.

## 9. Out of scope (this module)
- Sub-contractor tables/payments (separate v1.2 item; this just leaves the FK + view slot).
- Weighted-average material costing (later refinement).
- Per-centre per-material qty budgets (site-level material qty budget is enough for v1).
- Daily-log multi-photo (unrelated enhancement, separate item).
