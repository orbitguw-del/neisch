-- ─── ConsNE Demo Seed — "BuildNE" Tenant ─────────────────────────────────────
-- Run AFTER schema.sql and 001_roles_permissions.sql in the Supabase SQL Editor.
-- Passwords use bcrypt via pgcrypto (available in Supabase by default).
--
-- Accounts created:
--   superadmin : karun@consne.in        / Karun@SuperAdmin1
--   contractor : rajiv@buildne.in       / BuildNE@2024!
--   site_mgr   : pranab@buildne.in      / BuildNE@2024!
--   supervisor : merina@buildne.in      / BuildNE@2024!
--   storekeeper: biplab@buildne.in      / BuildNE@2024!

do $$
declare
  -- Fixed UUIDs for cross-table references
  v_karun_id       uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_rajiv_id       uuid := 'aaaaaaaa-0000-0000-0000-000000000002';
  v_pranab_id      uuid := 'aaaaaaaa-0000-0000-0000-000000000003';
  v_merina_id      uuid := 'aaaaaaaa-0000-0000-0000-000000000004';
  v_biplab_id      uuid := 'aaaaaaaa-0000-0000-0000-000000000005';

  v_tenant_id      uuid := 'bbbbbbbb-0000-0000-0000-000000000001';

  v_site1_id       uuid := 'cccccccc-0000-0000-0000-000000000001';
  v_site2_id       uuid := 'cccccccc-0000-0000-0000-000000000002';
  v_site3_id       uuid := 'cccccccc-0000-0000-0000-000000000003';

  v_pass_super     text;
  v_pass_demo      text;
begin
  -- Generate password hashes
  v_pass_super := crypt('Karun@SuperAdmin1', gen_salt('bf'));
  v_pass_demo  := crypt('BuildNE@2024!',    gen_salt('bf'));

  -- ── Auth users ───────────────────────────────────────────────────────────────
  insert into auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_super_admin, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values
  -- Karun (superadmin — platform owner)
  (
    v_karun_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'karun@consne.in', v_pass_super,
    now(), now(), now(),
    '{"full_name":"Karun Baruah"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Rajiv Nath (contractor — BuildNE owner)
  (
    v_rajiv_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'rajiv@buildne.in', v_pass_demo,
    now(), now(), now(),
    '{"full_name":"Rajiv Nath"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Pranab Gogoi (site_manager)
  (
    v_pranab_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'pranab@buildne.in', v_pass_demo,
    now(), now(), now(),
    '{"full_name":"Pranab Gogoi"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Merina Devi (supervisor)
  (
    v_merina_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'merina@buildne.in', v_pass_demo,
    now(), now(), now(),
    '{"full_name":"Merina Devi"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Biplab Das (store_keeper)
  (
    v_biplab_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'biplab@buildne.in', v_pass_demo,
    now(), now(), now(),
    '{"full_name":"Biplab Das"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    false, '', '', '', ''
  )
  on conflict (id) do nothing;

  -- ── Profiles (bypass trigger — insert manually with correct roles) ───────────
  insert into profiles (id, tenant_id, full_name, role) values
  (v_karun_id,  null,         'Karun Baruah', 'superadmin'),
  (v_rajiv_id,  v_tenant_id,  'Rajiv Nath',   'contractor'),
  (v_pranab_id, v_tenant_id,  'Pranab Gogoi',  'site_manager'),
  (v_merina_id, v_tenant_id,  'Merina Devi',   'supervisor'),
  (v_biplab_id, v_tenant_id,  'Biplab Das',    'store_keeper')
  on conflict (id) do update set
    tenant_id = excluded.tenant_id,
    full_name = excluded.full_name,
    role      = excluded.role;

  -- ── BuildNE Tenant ───────────────────────────────────────────────────────────
  insert into tenants (id, name, owner_id, plan) values
  (v_tenant_id, 'BuildNE Infrastructure Pvt. Ltd.', v_rajiv_id, 'pro')
  on conflict (id) do nothing;

  -- ── Sites ────────────────────────────────────────────────────────────────────
  insert into sites (id, tenant_id, name, location, description, status, budget, start_date, end_date, created_by)
  values
  (
    v_site1_id, v_tenant_id,
    'NH-37 Extension — Furkating to Mariani',
    'Jorhat District, Assam',
    'Two-lane highway extension covering 18 km along NH-37 from Furkating junction to Mariani town. Scope includes earthwork, sub-base preparation, WMM layer, bituminous surfacing, and two minor bridges over Dehing river tributaries. Funded under PMGSY Phase III.',
    'active',
    24000000,
    '2024-03-01', '2025-09-30',
    v_rajiv_id
  ),
  (
    v_site2_id, v_tenant_id,
    'Manipur University Hostel Block-C',
    'Canchipur, Imphal West, Manipur',
    'G+3 residential hostel block for 120 students. RCC framed structure with earthquake-resistant design (IS 1893, Zone V). Includes mess hall, common rooms, and solar water heating. Funded by RUSA 2.0.',
    'active',
    8500000,
    '2024-08-15', '2025-06-30',
    v_rajiv_id
  ),
  (
    v_site3_id, v_tenant_id,
    'Laitumkhrah Commercial Hub — Phase 1',
    'Laitumkhrah, East Khasi Hills, Meghalaya',
    'Mixed-use commercial complex under Shillong Smart City Mission. G+6 structure with basement parking (60 cars), retail ground floor, food court on first floor, and office spaces on floors 2–6. RCC frame with AAC block infill. Pre-construction stage — site clearance and foundation piling underway.',
    'planning',
    45000000,
    '2025-02-01', '2026-12-31',
    v_rajiv_id
  )
  on conflict (id) do nothing;

  -- ── Site Assignments ─────────────────────────────────────────────────────────
  insert into site_assignments (site_id, profile_id, tenant_id, role, assigned_by)
  values
  -- Pranab manages NH-37 and Manipur Hostel
  (v_site1_id, v_pranab_id, v_tenant_id, 'site_manager', v_rajiv_id),
  (v_site2_id, v_pranab_id, v_tenant_id, 'site_manager', v_rajiv_id),
  -- Merina supervises NH-37
  (v_site1_id, v_merina_id, v_tenant_id, 'supervisor', v_rajiv_id),
  -- Biplab manages inventory for all 3 sites
  (v_site1_id, v_biplab_id, v_tenant_id, 'store_keeper', v_rajiv_id),
  (v_site2_id, v_biplab_id, v_tenant_id, 'store_keeper', v_rajiv_id),
  (v_site3_id, v_biplab_id, v_tenant_id, 'store_keeper', v_rajiv_id)
  on conflict (site_id, profile_id) do nothing;

  -- ── Workers — Site 1: NH-37 Furkating–Mariani ────────────────────────────────
  insert into workers (site_id, tenant_id, name, trade, phone, daily_wage, status, joined_at)
  values
  (v_site1_id, v_tenant_id, 'Bhupen Kalita',      'Mason',            '+91 94350 11203', 650,  'active',   '2024-03-05'),
  (v_site1_id, v_tenant_id, 'Prodip Das',          'Mason',            '+91 98641 33021', 650,  'active',   '2024-03-05'),
  (v_site1_id, v_tenant_id, 'Ranjit Sonowal',      'Carpenter',        '+91 86380 44512', 700,  'active',   '2024-03-10'),
  (v_site1_id, v_tenant_id, 'Kamal Singh',         'Electrician',      '+91 99540 77831', 780,  'active',   '2024-04-01'),
  (v_site1_id, v_tenant_id, 'Hemanta Bora',        'Helper / Labourer','+91 94013 56209', 480,  'active',   '2024-03-05'),
  (v_site1_id, v_tenant_id, 'Dibya Hazarika',      'Helper / Labourer','+91 85430 99012', 480,  'active',   '2024-03-05'),
  (v_site1_id, v_tenant_id, 'Nilofar Begum',       'Helper / Labourer','+91 96782 14530', 460,  'active',   '2024-03-08'),
  (v_site1_id, v_tenant_id, 'Arpita Devi',         'Helper / Labourer','+91 91230 88741', 460,  'inactive', '2024-03-08'),
  (v_site1_id, v_tenant_id, 'Dhiren Moran',        'Welder',           '+91 98011 62304', 720,  'active',   '2024-05-15'),
  (v_site1_id, v_tenant_id, 'Sanjay Boro',         'Helper / Labourer','+91 97060 34510', 480,  'active',   '2024-06-01');

  -- ── Workers — Site 2: Manipur University Hostel ──────────────────────────────
  insert into workers (site_id, tenant_id, name, trade, phone, daily_wage, status, joined_at)
  values
  (v_site2_id, v_tenant_id, 'Thoiba Meitei',        'Mason',            '+91 79690 21304', 620, 'active',  '2024-08-20'),
  (v_site2_id, v_tenant_id, 'Iboyaima Singh',        'Mason',            '+91 98566 43210', 620, 'active',  '2024-08-20'),
  (v_site2_id, v_tenant_id, 'Somorjit Ningombam',    'Carpenter',        '+91 89760 12340', 680, 'active',  '2024-08-22'),
  (v_site2_id, v_tenant_id, 'Suresh Sharma',         'Plumber',          '+91 94350 55671', 740, 'active',  '2024-09-01'),
  (v_site2_id, v_tenant_id, 'Romen Chanam',          'Electrician',      '+91 98711 87620', 750, 'active',  '2024-09-01'),
  (v_site2_id, v_tenant_id, 'Leichombam Devi',       'Helper / Labourer','+91 79560 23401', 430, 'active',  '2024-08-20'),
  (v_site2_id, v_tenant_id, 'Ngangbam Devi',         'Helper / Labourer','+91 86350 77102', 430, 'active',  '2024-08-20'),
  (v_site2_id, v_tenant_id, 'Khomdram Ranjit',       'Helper / Labourer','+91 97360 44510', 450, 'active',  '2024-09-10');

  -- ── Workers — Site 3: Laitumkhrah Commercial Hub ─────────────────────────────
  insert into workers (site_id, tenant_id, name, trade, phone, daily_wage, status, joined_at)
  values
  (v_site3_id, v_tenant_id, 'Bapdor Nongkynmaw',  'Mason',            '+91 94361 20045', 600, 'active',  '2025-02-10'),
  (v_site3_id, v_tenant_id, 'Pynsuk Rynjah',       'Carpenter',        '+91 98110 55620', 660, 'active',  '2025-02-10'),
  (v_site3_id, v_tenant_id, 'Bonbom Shullai',      'Helper / Labourer','+91 87660 33421', 440, 'active',  '2025-02-10'),
  (v_site3_id, v_tenant_id, 'Shanborlang Mawlong', 'Helper / Labourer','+91 91230 12360', 440, 'active',  '2025-02-12');

  -- ── Materials — Site 1: NH-37 ─────────────────────────────────────────────────
  insert into materials (site_id, tenant_id, name, unit, unit_cost, quantity_available, quantity_minimum, supplier)
  values
  (v_site1_id, v_tenant_id, 'OPC 53 Grade Cement',        'bags',    385,   840,   200,  'Ambuja Cements Depot, Jorhat'),
  (v_site1_id, v_tenant_id, 'TMT Steel Bars Fe500 (12mm)','tonnes', 65000,  18.5,    5,  'SAIL Distribution Centre, Dimapur'),
  (v_site1_id, v_tenant_id, 'Crushed Stone 20mm Aggregate','cu m',   1200,   85,    20,  'Dhansiri Stone Quarry, Golaghat'),
  (v_site1_id, v_tenant_id, 'River Sand (Brahmaputra)',    'cu m',   1800,   42,    15,  'Lakhimpur Sand Depot'),
  (v_site1_id, v_tenant_id, 'Bitumen VG-30',              'tonnes', 48000,    8,     3,  'BPCL Terminal, Guwahati'),
  (v_site1_id, v_tenant_id, 'Concrete Drain Pipes 600mm', 'nos',    3200,   45,    20,  'Assam Pipe Industries, Guwahati'),
  (v_site1_id, v_tenant_id, 'Reinforced Cement Concrete (M25 Ready Mix)', 'cu m', 5200, 22, 8, 'Ultratech RMC Plant, Jorhat'),
  (v_site1_id, v_tenant_id, 'GSB Material (Granular Sub-Base)', 'cu m', 950, 110, 30, 'Kaziranga Crushers, Bokakhat');

  -- ── Materials — Site 2: Manipur University Hostel ────────────────────────────
  insert into materials (site_id, tenant_id, name, unit, unit_cost, quantity_available, quantity_minimum, supplier)
  values
  (v_site2_id, v_tenant_id, 'OPC 53 Grade Cement',        'bags',    420,   320,   100,  'Ultratech Cement Depot, Imphal'),
  (v_site2_id, v_tenant_id, 'TMT Steel Bars Fe500 (10mm)','tonnes', 68000,   6.2,    2,  'Vizag Steel Depot, Imphal'),
  (v_site2_id, v_tenant_id, 'Red Clay Bricks (Standard)', 'nos',       8, 25000,  5000, 'Kakching Brick Kiln, Thoubal'),
  (v_site2_id, v_tenant_id, 'River Sand (Iril River)',     'cu m',   2200,   18,     8,  'Senapati Sand Suppliers'),
  (v_site2_id, v_tenant_id, 'Structural Plywood 18mm',     'nos',    1650,   85,    20,  'North East Timber Mart, Imphal'),
  (v_site2_id, v_tenant_id, 'PVC Water Pipes 4 inch',      'bundles', 1800,  12,     5,  'Ashirvad Pipes Depot, Imphal'),
  (v_site2_id, v_tenant_id, 'TMT Steel Bars Fe500 (16mm)','tonnes', 67000,   4.8,    2,  'Vizag Steel Depot, Imphal'),
  (v_site2_id, v_tenant_id, 'Fly Ash (Class C)',           'bags',    220,   180,   60,  'NTPC Loktak Ash Depot');

  -- ── Materials — Site 3: Laitumkhrah Commercial Hub ───────────────────────────
  insert into materials (site_id, tenant_id, name, unit, unit_cost, quantity_available, quantity_minimum, supplier)
  values
  (v_site3_id, v_tenant_id, 'OPC 53 Grade Cement',        'bags',    440,    60,    80,  'ACC Cement, Shillong'),      -- LOW STOCK
  (v_site3_id, v_tenant_id, 'TMT Steel Bars Fe500 (16mm)','tonnes', 67500,    4,     3,  'SAIL Steel, Guwahati'),
  (v_site3_id, v_tenant_id, 'AAC Blocks 600×200×150mm',   'nos',      55,  2400,   500, 'Meghalaya AAC Products, Byrnihat'),
  (v_site3_id, v_tenant_id, 'River Sand',                 'cu m',   2400,    8,    10,  'Umiam Sand Depot, Ri-Bhoi'),  -- LOW STOCK
  (v_site3_id, v_tenant_id, 'Granite Stone Chips 20mm',   'cu m',   1500,   22,     8,  'Umroi Quarry, Ri-Bhoi'),
  (v_site3_id, v_tenant_id, 'Piling Casing Steel Tubes',  'nos',   12500,   18,     5,  'Kalinga Steel, Guwahati');

  -- ── Daily Logs — Site 1: NH-37 (last 7 days) ─────────────────────────────────
  insert into daily_logs (site_id, tenant_id, log_date, workers_present, work_done, issues, weather, created_by)
  values
  (
    v_site1_id, v_tenant_id,
    current_date - 6,
    8,
    'Earthwork cutting completed for Ch. 4+200 to Ch. 4+600. Sub-grade preparation and compaction done using vibratory roller. Total earthwork: 320 cu m.',
    'Soft soil encountered at Ch. 4+380; geotextile fabric ordered.',
    'Partly cloudy, heavy showers 14:00–15:30. Work suspended during rain.',
    v_merina_id
  ),
  (
    v_site1_id, v_tenant_id,
    current_date - 5,
    9,
    'WMM (Wet Mix Macadam) laying completed for Ch. 3+800 to Ch. 4+100 — 300 m stretch. Roller passes: 8. Camber maintained at 2.5%.',
    null,
    'Clear skies, hot and humid. Max temp 33°C.',
    v_merina_id
  ),
  (
    v_site1_id, v_tenant_id,
    current_date - 4,
    7,
    'Minor bridge abutment RCC work at Km 6.3: formwork erected, reinforcement placed (8 MT TMT 12mm), concrete poured (M30 grade, 24 cu m). Curing started.',
    'Concrete mixer breakdown at 11:00; manual mixing for 2 hours. Mixer repaired.',
    'Overcast with light drizzle. Work continued.',
    v_merina_id
  ),
  (
    v_site1_id, v_tenant_id,
    current_date - 3,
    10,
    'Bituminous Prime Coat applied using bitumen distributor — Ch. 2+500 to Ch. 3+200. Dense Bituminous Macadam (DBM) laying started for 400 m stretch.',
    null,
    'Sunny, light breeze. Ideal paving conditions.',
    v_merina_id
  ),
  (
    v_site1_id, v_tenant_id,
    current_date - 2,
    9,
    'Drain pipe laying (600mm RCC) on LHS — Ch. 3+000 to Ch. 3+600. Cement concrete bedding for pipes. Road side slope protection pitching at Ch. 5+000.',
    'One labourer (Hemanta Bora) reported mild fever; sent home. Medical first-aid administered.',
    'Partly cloudy, comfortable temperature.',
    v_merina_id
  ),
  (
    v_site1_id, v_tenant_id,
    current_date - 1,
    10,
    'Seal coat (BC — Bituminous Concrete) laid for Ch. 2+500 to Ch. 2+900. Surface finished and rolled. Traffic barricades checked and adjusted.',
    null,
    'Clear and sunny. Excellent working conditions.',
    v_merina_id
  ),
  (
    v_site1_id, v_tenant_id,
    current_date,
    8,
    'Quality check inspection with PWD engineer. Core samples taken at Ch. 2+600, 2+800, 3+000. Reinstatement of service road near Furkating junction — 120 m length.',
    'Inspection snagging: minor surface irregularity at Ch. 2+750 flagged; scheduled for patch work tomorrow.',
    'Morning fog cleared by 08:30. Cloudy afternoon.',
    v_merina_id
  ),
  -- Site 2 logs
  (
    v_site2_id, v_tenant_id,
    current_date - 2,
    7,
    'Slab formwork for 2nd floor completed (Block C, Grid 3–6). Steel reinforcement binding in progress — top and bottom mats for 200 sqm area.',
    null,
    'Intermittent drizzle. Work continued with temporary shelter.',
    v_pranab_id
  ),
  (
    v_site2_id, v_tenant_id,
    current_date - 1,
    8,
    '2nd floor slab concrete poured: M25 grade, 48 cu m. Vibration and levelling completed. Curing compound applied immediately after striking.',
    'Ready-mix concrete truck arrived 45 minutes late from Imphal; adjusted schedule.',
    'Clear skies, moderate temperature.',
    v_pranab_id
  ),
  (
    v_site2_id, v_tenant_id,
    current_date,
    6,
    'Brick masonry (1st floor, west wing) — 900 sqft of 230mm thick walls. Curing of 2nd floor slab: 2nd day water curing.',
    null,
    'Partly cloudy. Cool breeze from the hills.',
    v_pranab_id
  );

end $$;
