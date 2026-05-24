-- 20260524000000_material_budget.sql
--
-- Adds project-total budget columns to materials table +
-- a reporting view that joins consumption and receipt actuals.
--
-- Layer 1: materials.budget_qty / budget_rate  → project total budget
-- Layer 2: budget_lines (existing, period_month) → monthly targets for trend chart
--
-- The view site_material_budget_v is security_invoker so it respects the
-- caller's RLS policies on materials, material_transactions, material_receipts.

-- ── 1. Columns on materials ────────────────────────────────────────────────────

alter table materials
  add column if not exists budget_qty  numeric(12, 2),   -- planned total qty for whole project
  add column if not exists budget_rate numeric(12, 2);   -- planned ₹ per unit

-- ── 2. View: site_material_budget_v ───────────────────────────────────────────
-- One row per material. Actual figures computed from ledger + receipts.

create or replace view site_material_budget_v
with (security_invoker = true)
as
select
  m.id,
  m.site_id,
  m.tenant_id,
  m.name,
  m.unit,
  m.category,
  m.work_type,
  m.quantity_available,

  -- budget targets (may be null when not set)
  m.budget_qty,
  m.budget_rate,
  case
    when m.budget_qty is not null and m.budget_rate is not null
    then m.budget_qty * m.budget_rate
    else null
  end as budget_amount,

  -- total consumed (sum of all consumption transactions)
  coalesce(cons.consumed_qty, 0) as consumed_qty,

  -- total received qty (confirmed receipts)
  coalesce(rcpt.received_qty, 0) as received_qty,

  -- total actual cost (confirmed receipts × unit_cost)
  coalesce(rcpt.actual_cost, 0) as actual_cost,

  -- derived: % of budget quantity consumed (null if no budget set)
  case
    when m.budget_qty > 0
    then round((coalesce(cons.consumed_qty, 0) / m.budget_qty) * 100, 1)
    else null
  end as pct_consumed,

  -- derived: quantity variance (positive = under budget, negative = over)
  case
    when m.budget_qty is not null
    then m.budget_qty - coalesce(cons.consumed_qty, 0)
    else null
  end as qty_variance,

  -- derived: cost variance
  case
    when m.budget_qty is not null and m.budget_rate is not null
    then (m.budget_qty * m.budget_rate) - coalesce(rcpt.actual_cost, 0)
    else null
  end as cost_variance

from materials m

left join (
  select
    material_id,
    sum(quantity) as consumed_qty
  from material_transactions
  where txn_type = 'consumption'
  group by material_id
) cons on cons.material_id = m.id

left join (
  select
    material_id,
    sum(quantity)                              as received_qty,
    sum(quantity * coalesce(unit_cost, 0))     as actual_cost
  from material_receipts
  where status = 'received'
  group by material_id
) rcpt on rcpt.material_id = m.id;

-- Grant read access
grant select on site_material_budget_v to anon, authenticated, service_role;
