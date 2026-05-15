-- ═══════════════════════════════════════════════════════════════════════════
-- STOREY — DUMMY DATA SEED
-- Run this in Supabase SQL Editor (service role / postgres)
-- Seeds data for the tenant owned by karunroongta@gmail.com
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  v_tenant_id   uuid;
  v_owner_id    uuid;

  -- Sites
  v_site1       uuid;
  v_site2       uuid;
  v_site3       uuid;

  -- Workers
  v_w1 uuid; v_w2 uuid; v_w3 uuid; v_w4 uuid;
  v_w5 uuid; v_w6 uuid; v_w7 uuid; v_w8 uuid;

  -- Materials site 1
  v_m1 uuid; v_m2 uuid; v_m3 uuid; v_m4 uuid; v_m5 uuid; v_m6 uuid;
  -- Materials site 2
  v_m7 uuid; v_m8 uuid; v_m9 uuid;

begin

  -- ── 1. Find tenant ────────────────────────────────────────────────────────
  select p.tenant_id, p.id
    into v_tenant_id, v_owner_id
    from profiles p
    join auth.users u on u.id = p.id
    where u.email = 'karunroongta@gmail.com'
    limit 1;

  if v_tenant_id is null then
    raise exception 'Tenant not found for karunroongta@gmail.com — create the company first';
  end if;

  -- ── 2. Sites ──────────────────────────────────────────────────────────────
  insert into sites (id, tenant_id, name, location, status, budget, start_date, end_date)
  values
    (gen_random_uuid(), v_tenant_id, 'Guwahati Residential Complex',
      'Beltola, Guwahati, Assam', 'active', 18500000, '2025-11-01', '2026-10-31'),
    (gen_random_uuid(), v_tenant_id, 'Jorhat Commercial Plaza',
      'AT Road, Jorhat, Assam', 'active', 12000000, '2026-01-15', '2026-12-31'),
    (gen_random_uuid(), v_tenant_id, 'Dibrugarh Highway Widening',
      'NH-37, Dibrugarh, Assam', 'planning', 35000000, '2026-06-01', '2027-05-31');

  select id into v_site1 from sites where tenant_id = v_tenant_id and name = 'Guwahati Residential Complex';
  select id into v_site2 from sites where tenant_id = v_tenant_id and name = 'Jorhat Commercial Plaza';
  select id into v_site3 from sites where tenant_id = v_tenant_id and name = 'Dibrugarh Highway Widening';

  -- ── 3. Workers ────────────────────────────────────────────────────────────
  insert into workers (id, tenant_id, site_id, name, trade, daily_wage, employment_type,
                        id_proof_type, id_proof_number, phone, address)
  values
    (gen_random_uuid(), v_tenant_id, v_site1, 'Ramesh Kumar',   'Mason',       650, 'direct',
      'aadhaar', '1234-5678-9012', '+919876543210', 'Sijubari, Guwahati'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'Sunil Das',      'Carpenter',   700, 'direct',
      'voter_id', 'VTR00123456',   '+919876543211', 'Dispur, Guwahati'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'Prakash Sharma', 'Plumber',     720, 'direct',
      'aadhaar', '2345-6789-0123', '+919876543212', 'Narengi, Guwahati'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'Bikash Gogoi',   'Electrician', 780, 'vendor',
      'pan',     'ABCPG1234D',    '+919876543213', 'Jalukbari, Guwahati'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'Ratan Borah',    'Helper',      500, 'direct',
      'aadhaar', '3456-7890-1234', '+919876543214', 'Hengrabari, Guwahati'),
    (gen_random_uuid(), v_tenant_id, v_site2, 'Dinesh Singh',   'Mason',       650, 'direct',
      'aadhaar', '4567-8901-2345', '+919876543215', 'AT Road, Jorhat'),
    (gen_random_uuid(), v_tenant_id, v_site2, 'Amit Kalita',    'Bar Bender',  580, 'direct',
      'voter_id', 'VTR00234567',   '+919876543216', 'Cinnamara, Jorhat'),
    (gen_random_uuid(), v_tenant_id, v_site2, 'Hemanta Saikia', 'Helper',      500, 'direct',
      'aadhaar', '5678-9012-3456', '+919876543217', 'Gar Ali, Jorhat');

  select id into v_w1 from workers where tenant_id = v_tenant_id and name = 'Ramesh Kumar';
  select id into v_w2 from workers where tenant_id = v_tenant_id and name = 'Sunil Das';
  select id into v_w3 from workers where tenant_id = v_tenant_id and name = 'Prakash Sharma';
  select id into v_w4 from workers where tenant_id = v_tenant_id and name = 'Bikash Gogoi';
  select id into v_w5 from workers where tenant_id = v_tenant_id and name = 'Ratan Borah';
  select id into v_w6 from workers where tenant_id = v_tenant_id and name = 'Dinesh Singh';
  select id into v_w7 from workers where tenant_id = v_tenant_id and name = 'Amit Kalita';
  select id into v_w8 from workers where tenant_id = v_tenant_id and name = 'Hemanta Saikia';

  -- ── 4. Materials — Site 1 (Guwahati) ─────────────────────────────────────
  insert into materials (id, tenant_id, site_id, name, unit, category,
                          quantity_available, quantity_minimum, unit_cost, supplier)
  values
    (gen_random_uuid(), v_tenant_id, v_site1, 'OPC 53 Cement',        'bags',   'consumable', 310,  50,  385, 'ACC Cement Depot, Guwahati'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'TMT Steel 10mm',       'kg',     'consumable', 4800, 1000, 68, 'SAIL Stockist, Beltola'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'River Sand (Zone-II)', 'cu m',   'consumable', 28,   5,  1800, 'Brahmaputra Sand Depot'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'Coarse Aggregate 20mm','cu m',   'consumable', 18,   4,  2200, 'Kalapahar Stone Quarry'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'Red Bricks (1st class)','nos',   'consumable', 12500, 2000, 8, 'Palashbari Brick Kiln'),
    (gen_random_uuid(), v_tenant_id, v_site1, 'Ceramic Floor Tiles',  'sq ft',  'consumable', 420,  100,  55, 'Kajaria Dealer, Fancy Bazaar');

  -- Materials — Site 2 (Jorhat)
  insert into materials (id, tenant_id, site_id, name, unit, category,
                          quantity_available, quantity_minimum, unit_cost, supplier)
  values
    (gen_random_uuid(), v_tenant_id, v_site2, 'OPC 53 Cement',        'bags',   'consumable', 180,  40,  390, 'Ambuja Dealer, Jorhat'),
    (gen_random_uuid(), v_tenant_id, v_site2, 'TMT Steel 12mm',       'kg',     'consumable', 3200, 800,  70, 'JSW Stockist, Jorhat'),
    (gen_random_uuid(), v_tenant_id, v_site2, 'Hollow Blocks 6"',     'nos',    'consumable', 3800, 500,  45, 'Jorhat Block Works');

  select id into v_m1 from materials where tenant_id = v_tenant_id and name = 'OPC 53 Cement'        and site_id = v_site1;
  select id into v_m2 from materials where tenant_id = v_tenant_id and name = 'TMT Steel 10mm'       and site_id = v_site1;
  select id into v_m3 from materials where tenant_id = v_tenant_id and name = 'River Sand (Zone-II)' and site_id = v_site1;
  select id into v_m4 from materials where tenant_id = v_tenant_id and name = 'Coarse Aggregate 20mm'and site_id = v_site1;
  select id into v_m5 from materials where tenant_id = v_tenant_id and name = 'Red Bricks (1st class)'and site_id = v_site1;
  select id into v_m6 from materials where tenant_id = v_tenant_id and name = 'Ceramic Floor Tiles'  and site_id = v_site1;
  select id into v_m7 from materials where tenant_id = v_tenant_id and name = 'OPC 53 Cement'        and site_id = v_site2;
  select id into v_m8 from materials where tenant_id = v_tenant_id and name = 'TMT Steel 12mm'       and site_id = v_site2;
  select id into v_m9 from materials where tenant_id = v_tenant_id and name = 'Hollow Blocks 6"'     and site_id = v_site2;

  -- ── 5. Attendance — last 7 days, Site 1 workers ───────────────────────────
  insert into attendance (worker_id, site_id, tenant_id, date, status, marked_by)
  select w.id, v_site1, v_tenant_id,
         current_date - d.delta,
         case
           when d.delta = 0 and w.name in ('Ramesh Kumar', 'Sunil Das', 'Bikash Gogoi', 'Ratan Borah') then 'present'
           when d.delta = 0 then 'absent'
           when d.delta = 1 then 'present'
           when d.delta = 2 and w.name = 'Prakash Sharma' then 'half_day'
           when d.delta = 2 then 'present'
           when d.delta = 3 then 'present'
           when d.delta = 4 and w.name = 'Ratan Borah' then 'absent'
           when d.delta = 4 then 'present'
           when d.delta = 5 then 'present'
           when d.delta = 6 then 'paid_leave'
         end,
         v_owner_id
  from (values('Ramesh Kumar'), ('Sunil Das'), ('Prakash Sharma'), ('Bikash Gogoi'), ('Ratan Borah')) as n(name)
  join workers w on w.name = n.name and w.tenant_id = v_tenant_id
  cross join (values(0),(1),(2),(3),(4),(5),(6)) as d(delta)
  on conflict (worker_id, date) do nothing;

  -- Attendance Site 2 workers (last 5 days)
  insert into attendance (worker_id, site_id, tenant_id, date, status, marked_by)
  select w.id, v_site2, v_tenant_id,
         current_date - d.delta,
         case when d.delta in (1,2) and w.name = 'Hemanta Saikia' then 'absent' else 'present' end,
         v_owner_id
  from (values('Dinesh Singh'), ('Amit Kalita'), ('Hemanta Saikia')) as n(name)
  join workers w on w.name = n.name and w.tenant_id = v_tenant_id
  cross join (values(0),(1),(2),(3),(4)) as d(delta)
  on conflict (worker_id, date) do nothing;

  -- ── 6. Daily Logs ─────────────────────────────────────────────────────────
  insert into daily_logs (tenant_id, site_id, log_date, weather, workers_present,
                           work_done, issues, created_by)
  values
    (v_tenant_id, v_site1, current_date,
     'Sunny', 5,
     'Column casting for 3rd floor slab (Grid A-D). Shuttering work completed on east wing. Plumbing rough-in for Block B bathrooms in progress.',
     null, v_owner_id),
    (v_tenant_id, v_site1, current_date - 1,
     'Partly cloudy', 4,
     'Brick masonry work on 2nd floor walls. 450 bricks laid today. Steel reinforcement binding for column C7 and C8.',
     'One mason absent — Prakash Sharma on leave. Work slightly behind schedule on east wing.',
     v_owner_id),
    (v_tenant_id, v_site2, current_date,
     'Sunny', 3,
     'Foundation excavation completed for Block B. PCC (M15) work in progress. Shuttering material shifted to site.',
     null, v_owner_id);

  -- ── 7. Material Receipts (GRN) ────────────────────────────────────────────
  insert into material_receipts (tenant_id, site_id, material_id, source_type, source_name,
    quantity, unit_cost, lr_number, lr_date, challan_number, challan_date,
    vehicle_number, status, created_by, received_by, received_at, grn_number)
  values
    -- Received
    (v_tenant_id, v_site1, v_m1, 'supplier', 'ACC Cement Depot, Guwahati',
     200, 385, 'LR/2026/4521', '2026-05-05', 'CHN-2026-0892', '2026-05-06',
     'AS 01 AC 2345', 'received', v_owner_id, v_owner_id, now() - interval '5 days',
     'GRN-0001'),
    -- Received
    (v_tenant_id, v_site1, v_m2, 'supplier', 'SAIL Stockist, Beltola',
     2000, 68, 'LR/2026/4601', '2026-05-07', 'CHN-2026-0910', '2026-05-08',
     'AS 01 BD 7788', 'received', v_owner_id, v_owner_id, now() - interval '3 days',
     'GRN-0002'),
    -- Pending
    (v_tenant_id, v_site1, v_m3, 'supplier', 'Brahmaputra Sand Depot',
     15, 1800, 'LR/2026/4698', '2026-05-10', null, null,
     'AS 14 AB 1122', 'pending', v_owner_id, null, null,
     null),
    -- Received at Site 2
    (v_tenant_id, v_site2, v_m7, 'supplier', 'Ambuja Dealer, Jorhat',
     150, 390, 'LR/2026/4511', '2026-05-04', 'CHN-2026-0880', '2026-05-05',
     'AS 05 CD 5566', 'received', v_owner_id, v_owner_id, now() - interval '6 days',
     'GRN-0003');

  -- ── 8. Material Transfer ──────────────────────────────────────────────────
  insert into material_transfers (tenant_id, from_site_id, to_site_id, material_id,
    quantity, status, lr_number, vehicle_number, note, created_by, transfer_number)
  values
    (v_tenant_id, v_site1, v_site2, v_m1,
     50, 'confirmed', 'LR/2026/INT-001', 'AS 01 EF 9901',
     'Surplus cement transferred from Guwahati to Jorhat site',
     v_owner_id, 'TRF-0001');

  raise notice 'Seed complete! Tenant: %, Sites: %, %, %', v_tenant_id, v_site1, v_site2, v_site3;

end $$;
