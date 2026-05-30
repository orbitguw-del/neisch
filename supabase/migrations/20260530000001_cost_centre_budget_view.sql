-- 20260530000001_cost_centre_budget_view.sql
--
-- Budget-vs-Actual rollup, one row per cost centre.
-- Actual = confirmed material receipts of materials tagged to the centre.
-- security_invoker = true → respects the caller's RLS on every base table,
-- same pattern as site_material_budget_v.
--
-- FORWARD-COMPATIBLE: when the Sub-Contractor module ships, its payments
-- become a second left join here and actual_cost = material_actual +
-- subcontractor_actual. The view's shape (one row per centre, budget vs
-- actual) does not change, so the Reports UI built now keeps working.

create or replace view cost_centre_budget_v
with (security_invoker = true)
as
select
  cc.id,
  cc.site_id,
  cc.tenant_id,
  cc.name,
  cc.sort_order,
  cc.budget_amount,

  -- actual spend from confirmed receipts of tagged materials
  coalesce(mat.actual_cost, 0) as actual_cost,

  -- % of budget spent (null when no budget set)
  case
    when cc.budget_amount > 0
    then round((coalesce(mat.actual_cost, 0) / cc.budget_amount) * 100, 1)
    else null
  end as pct_spent,

  -- variance: positive = under budget, negative = over
  case
    when cc.budget_amount is not null
    then cc.budget_amount - coalesce(mat.actual_cost, 0)
    else null
  end as cost_variance

from cost_centres cc

left join (
  select
    m.cost_centre_id,
    sum(r.quantity * coalesce(r.unit_cost, 0)) as actual_cost
  from materials m
  join material_receipts r
    on r.material_id = m.id
   and r.status = 'received'
  where m.cost_centre_id is not null
  group by m.cost_centre_id
) mat on mat.cost_centre_id = cc.id;

grant select on cost_centre_budget_v to anon, authenticated, service_role;
