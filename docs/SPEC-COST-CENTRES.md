# Spec — Cost Centres within a Site
### Draft v0.1 · 2026-05-30 · for approval before build

> **Classification:** New feature (net-new capability). Tag: **v1.2**.
> **Scope (locked this round):** Entity with its own budget · Materials now ·
> **designed as a shared hub so Sub-Contractor work plugs in when that module ships.**
> **Acceptance check (write before code):**
> *A contractor can create cost centres under a site (e.g. Building, Utilities,
> Boundary Wall), give each a budget, tag each material to one, and see
> Budget-vs-Actual roll up per cost centre in Reports.*

---

## 1. Why

Today a site has **one** budget and materials roll up to the whole site. A real
project has internal buckets — the building structure, the utilities (electrical
+ plumbing), the compound wall, external development. The contractor budgets
*per bucket* and wants to know which bucket is overrunning, not just the site
total.

"Cost centre" is deliberate Tally terminology — when Tally export ships (v1.3),
each Storey cost centre maps 1:1 to a Tally cost centre. Modelling it as a real
entity now means that export is a join, not a migration.

### The hub insight (added 2026-05-30)

A cost centre is **the spend bucket**, not "a material grouping." The same
"Utilities" bucket should absorb **both** the wiring material *and* the
electrician sub-contractor's payment — that's how a contractor actually thinks
about "what did Utilities cost me." So `cost_centres` is designed as a **hub**
that multiple spend types reference:

```
                 ┌─────────────────┐
   materials ───▶│                 │
                 │  cost_centres   │──▶ Budget vs Actual per bucket
 (future)        │  (the bucket)   │
 subcontractor ─▶│                 │
 assignments     └─────────────────┘
```

- **Now (this build):** `materials.cost_centre_id` → actual = material receipts.
- **When the Sub-Contractor module ships (v1.2):** that module's assignment row
  carries its own `cost_centre_id`, and its payments fold into the **same**
  `cost_centre_budget_v` rollup. No reshaping of `cost_centres` needed — just one
  more `left join` in the view.

**Dependency:** the Sub-Contractor module does **not exist yet** (no table, no
screen). So we build the hub + materials link now; the sub-contractor link is a
*follow-on* delivered with that module — not in this round.

---

## 2. Data model

### 2.1 New table — `cost_centres`

```sql
create table cost_centres (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  site_id       uuid not null references sites(id)   on delete cascade,
  name          text not null,                       -- "Building", "Utilities"
  budget_amount numeric(14,2),                        -- planned ₹ for this centre (nullable)
  sort_order    int  not null default 0,             -- display order on the site
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (site_id, name)                             -- no two centres same name per site
);
```

**Budget is top-down and independent** — the contractor sets "Utilities = ₹5L".
Actual is computed from the receipts of materials tagged to that centre. We do
**not** derive the centre budget from the sum of material budgets — contractors
budget the bucket first, then fill it.

### 2.2 New column — `materials.cost_centre_id`

```sql
alter table materials
  add column if not exists cost_centre_id uuid
    references cost_centres(id) on delete set null;
```

- **Nullable.** Existing materials get `NULL` = an implicit **"Unassigned"** bucket.
  Nothing breaks; nothing needs backfilling.
- `on delete set null` — deleting a cost centre orphans its materials back to
  Unassigned rather than cascading away real stock data. **Safe by design.**

### 2.3 Reporting view — `cost_centre_budget_v`

One row per cost centre, with budget vs actual rolled up from tagged materials.
`security_invoker = true` so it respects the caller's RLS, same pattern as
`site_material_budget_v`.

```sql
create view cost_centre_budget_v with (security_invoker = true) as
select
  cc.id, cc.site_id, cc.tenant_id, cc.name, cc.sort_order,
  cc.budget_amount,
  coalesce(act.actual_cost, 0)                                as actual_cost,
  case when cc.budget_amount > 0
       then round((coalesce(act.actual_cost,0)/cc.budget_amount)*100, 1)
       else null end                                          as pct_spent,
  case when cc.budget_amount is not null
       then cc.budget_amount - coalesce(act.actual_cost,0)
       else null end                                          as cost_variance
from cost_centres cc
left join (
  select m.cost_centre_id,
         sum(r.quantity * coalesce(r.unit_cost,0)) as actual_cost
  from materials m
  join material_receipts r on r.material_id = m.id and r.status = 'received'
  where m.cost_centre_id is not null
  group by m.cost_centre_id
) act on act.cost_centre_id = cc.id;
```

`site_material_budget_v` already does `select m.*`, so `cost_centre_id` flows
into it automatically — **no change needed** to the existing material view.

**Forward-compatible by design:** when the Sub-Contractor module lands, its
payments become a second `left join` in `cost_centre_budget_v` and `actual_cost`
becomes `material_actual + subcontractor_actual`. The view's shape (one row per
centre, budget vs actual) doesn't change — so the Reports UI built now keeps
working unchanged.

### 2.4 RLS (mirror `budget_lines` exactly — proven pattern)

| Policy | Who |
|--------|-----|
| select | superadmin · contractor (own tenant) · anyone assigned to the site |
| insert | superadmin · contractor (own tenant) · site_manager (assigned site) |
| update | superadmin · contractor (own tenant) · site_manager (assigned site) |
| delete | superadmin · contractor only |

Same `my_role()` / `my_tenant_id()` / `site_assignments` helpers as every other
table. No new security surface.

---

## 3. UI changes

| Screen | Change |
|--------|--------|
| **Site Detail** | New "Cost Centres" section: list of centres with name + budget + a spent progress chip (green/amber/red). "＋ Add cost centre" button (contractor/site_manager only). |
| **Inventory — add/edit material** | New "Cost centre" dropdown (options = this site's centres + "Unassigned"). Optional. |
| **Inventory — list** | Cost-centre chip on each material row (small, colour-coded). Optional group-by-cost-centre toggle. |
| **Reports → Budget vs Actual** | New "By Cost Centre" bar chart: each centre's budget vs actual. Sits beside the existing per-material donut. |

Visual-first rules apply: progress chip = colour + number, not text. Empty state
("No cost centres yet") gets the standard icon-in-circle + single Add button.

---

## 4. Migration & rollout

1. `20260530000000_cost_centres.sql` — table + RLS + `materials.cost_centre_id`.
2. `20260530000001_cost_centre_budget_view.sql` — the rollup view.
3. Apply to Supabase (`zgvbogxibiilnblmuohg`), confirm Inventory still loads
   (cost_centre_id NULL on all existing rows = Unassigned).
4. Ship UI behind nothing — feature is additive, safe for all roles.

**No gating in v1.** (Open question Q1: should cost centres be Basic-plan-only?
Deferred — ship free, gate later if needed.)

---

## 5. Side-effects checked (per CLAUDE.md)

- **Web + Android:** pure data + React UI. Both unaffected by build config. ✅
- **All 3 envs:** no env-specific paths touched. ✅
- **RLS / roles:** new table copies `budget_lines` policies verbatim — every role
  gets the same scoping it already has. ✅
- **tenant_id NULL (new contractor):** can't reach Site Detail without a tenant,
  so never hits this code. ✅
- **Existing data:** `cost_centre_id` nullable → zero backfill, zero breakage. ✅
- **Append-only ledger:** untouched — cost centre is a tag on `materials`, not on
  transactions. ✅

---

## 6. Out of scope (this round)

- **Sub-contractor → cost centre link** — *planned and designed-for* (§2 hub), but
  delivered **with the Sub-Contractor module** (v1.2, not yet built), not now.
  The hub is built ready for it; the assignment-side `cost_centre_id` + the view's
  second join ship when that module ships.
- Cost centres on **expenses** (Scope option 2) — deferred, not yet designed-for.
- Re-tagging a material's **past receipts** to a different centre retroactively —
  actuals follow the material's *current* centre; history isn't re-bucketed.
- Cost-centre-level **plan gating** (Q1).

---

## 7. Acceptance criteria (binary, test before "done")

- [ ] Contractor creates 3 cost centres on a site in < 2 min
- [ ] Each centre can be given a ₹ budget; total is **not** forced to equal site budget
- [ ] Material add/edit shows a cost-centre dropdown; saving persists it
- [ ] Deleting a cost centre sets its materials back to Unassigned (stock intact)
- [ ] Reports → Budget vs Actual shows a per-cost-centre bar (budget vs actual)
- [ ] Inventory still loads for a site with **zero** cost centres (Unassigned only)
- [ ] site_manager assigned to the site can add centres; supervisor cannot
- [ ] A real run-through on storeyinfra.com before marking shipped

---

*Approve this and I'll build migration 1 → verify → migration 2 → UI, one step
at a time. Or tell me what to change in the model first.*
