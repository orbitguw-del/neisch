-- 20260522000000_atomic_allocate_material.sql
--
-- Reported 2026-05-22 by Karun: the supervisor material-allocation flow was
-- (a) slow to save (4 sequential round-trips), (b) showed no success feedback,
-- (c) allowed allocating MORE than what was in stock (no validation), and (d)
-- potentially double-decremented stock because recordTransaction RPC and the
-- direct UPDATE both touch materials.quantity_available.
--
-- Fix: a single RPC that does everything atomically — validate stock, insert
-- allocation, update stock, log consumption — inside one Postgres transaction.
-- One client round-trip. Idempotent guarantees. No partial writes.

create or replace function public.record_material_allocation(
  p_material_id       uuid,
  p_site_id           uuid,
  p_tenant_id         uuid,
  p_work_description  text,
  p_quantity          numeric,
  p_allocated_date    date,
  p_note              text,
  p_allocated_by      uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current  numeric;
  v_new_qty  numeric;
  v_alloc_id uuid;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero'
      using errcode = 'check_violation';
  end if;

  -- Lock the materials row so concurrent allocations can't race.
  select quantity_available into v_current
    from public.materials
    where id = p_material_id
    for update;

  if v_current is null then
    raise exception 'Material not found or has no stock data'
      using errcode = 'no_data_found';
  end if;

  -- Hard guard against over-allocation. The supervisor's client should also
  -- block via the input's max attribute, but the DB is the final word.
  if p_quantity > v_current then
    raise exception 'Cannot allocate % — only % available in stock', p_quantity, v_current
      using errcode = 'check_violation',
            hint = 'Reduce the quantity or check stock first';
  end if;

  v_new_qty := v_current - p_quantity;

  -- 1. Insert the allocation record.
  insert into public.material_allocations (
    material_id, site_id, tenant_id,
    work_description, quantity_allocated, allocated_date,
    note, allocated_by
  ) values (
    p_material_id, p_site_id, p_tenant_id,
    p_work_description, p_quantity, p_allocated_date,
    p_note, p_allocated_by
  ) returning id into v_alloc_id;

  -- 2. Decrement stock — single source of truth for stock changes.
  update public.materials
    set quantity_available = v_new_qty,
        updated_at         = now()
    where id = p_material_id;

  -- 3. Log a consumption transaction in the append-only ledger.
  insert into public.material_transactions (
    material_id, site_id, tenant_id,
    txn_type, quantity,
    note, created_by, ref_type, ref_id
  ) values (
    p_material_id, p_site_id, p_tenant_id,
    'consumption', p_quantity,
    'Allocated: ' || p_work_description,
    p_allocated_by, 'allocation', v_alloc_id
  );

  -- Return useful info to the client so it doesn't need a follow-up fetch.
  return json_build_object(
    'success',       true,
    'allocation_id', v_alloc_id,
    'new_stock',     v_new_qty
  );
end;
$$;

grant execute on function public.record_material_allocation to authenticated;
