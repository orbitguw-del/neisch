-- 20260524000001_material_budget_view_v2.sql
--
-- Replaces site_material_budget_v with a version that selects m.*
-- so all materials columns (brand, unit_cost, supplier, quantity_minimum, etc.)
-- are available alongside the computed budget/consumption columns.

drop view if exists site_material_budget_v;

create view site_material_budget_v
with (security_invoker = true)
as
select
  m.*,

  -- budget derived
  case
    when m.budget_qty is not null and m.budget_rate is not null
    then m.budget_qty * m.budget_rate
    else null
  end as budget_amount,

  -- total consumed qty
  coalesce(cons.consumed_qty, 0) as consumed_qty,

  -- total received qty + cost (confirmed receipts)
  coalesce(rcpt.received_qty, 0) as received_qty,
  coalesce(rcpt.actual_cost,  0) as actual_cost,

  -- % of budget quantity consumed (null if no budget set)
  case
    when m.budget_qty > 0
    then round((coalesce(cons.consumed_qty, 0) / m.budget_qty) * 100, 1)
    else null
  end as pct_consumed,

  -- qty variance: positive = under budget, negative = over
  case
    when m.budget_qty is not null
    then m.budget_qty - coalesce(cons.consumed_qty, 0)
    else null
  end as qty_variance,

  -- cost variance
  case
    when m.budget_qty is not null and m.budget_rate is not null
    then (m.budget_qty * m.budget_rate) - coalesce(rcpt.actual_cost, 0)
    else null
  end as cost_variance

from materials m

left join (
  select material_id, sum(quantity) as consumed_qty
  from material_transactions
  where txn_type = 'consumption'
  group by material_id
) cons on cons.material_id = m.id

left join (
  select
    material_id,
    sum(quantity)                          as received_qty,
    sum(quantity * coalesce(unit_cost, 0)) as actual_cost
  from material_receipts
  where status = 'received'
  group by material_id
) rcpt on rcpt.material_id = m.id;

grant select on site_material_budget_v to anon, authenticated, service_role;
