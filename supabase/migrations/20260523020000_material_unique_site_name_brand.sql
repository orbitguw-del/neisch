-- 20260523020000_material_unique_site_name_brand.sql
--
-- Prevents duplicate materials at the same site with the same name + brand.
-- Uses a unique index (not a constraint) so we can apply lower() for
-- case-insensitive matching and coalesce(brand,'') to treat NULL brand
-- as "Generic" for uniqueness purposes.
--
-- "Ultratech — OPC 53 Cement" and "ACC — OPC 53 Cement" remain distinct.
-- "OPC 53 Cement" (no brand) and "opc 53 cement" (no brand) are duplicates.
--
-- Step 1: collapse any pre-existing duplicates, keeping the row with the
--   highest quantity_available (or the one created first if qty is tied).
--   We set the surviving row's quantity to the sum of all duplicates so
--   no stock is silently lost.

with dupes as (
  select
    site_id,
    lower(name)                   as lname,
    lower(coalesce(brand, ''))    as lbrand,
    array_agg(id order by quantity_available desc nulls last, created_at asc) as ids,
    sum(coalesce(quantity_available, 0))  as total_qty
  from materials
  group by site_id, lower(name), lower(coalesce(brand, ''))
  having count(*) > 1
),
-- keep the first id in each group, delete the rest
to_delete as (
  select unnest(ids[2:]) as id from dupes
),
-- update survivors with the summed quantity
survivors as (
  update materials m
  set quantity_available = d.total_qty
  from dupes d
  where m.id = d.ids[1]
  returning m.id
)
delete from materials where id in (select id from to_delete);

-- Step 2: now safe to create the unique index
create unique index if not exists materials_site_name_brand_unique
  on materials (site_id, lower(name), lower(coalesce(brand, '')));
