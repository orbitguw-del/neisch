// ConsNE Demo Seed — runs via Supabase Admin API + REST API
const URL  = 'https://zgvbogxibiilnblmuohg.supabase.co'
const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndmJvZ3hpYmlpbG5ibG11b2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY5Mjc2OSwiZXhwIjoyMDg4MjY4NzY5fQ.mRLEyTSnH127gCOGr4PG2A4Ekh9cAFHLJvxj8is-OsA'

const HEADERS = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'resolution=merge-duplicates' }

// Fixed UUIDs
const IDS = {
  karun:    'aaaaaaaa-0000-0000-0000-000000000001',
  rajiv:    'aaaaaaaa-0000-0000-0000-000000000002',
  pranab:   'aaaaaaaa-0000-0000-0000-000000000003',
  merina:   'aaaaaaaa-0000-0000-0000-000000000004',
  biplab:   'aaaaaaaa-0000-0000-0000-000000000005',
  tenant:   'bbbbbbbb-0000-0000-0000-000000000001',
  site1:    'cccccccc-0000-0000-0000-000000000001',
  site2:    'cccccccc-0000-0000-0000-000000000002',
  site3:    'cccccccc-0000-0000-0000-000000000003',
}

async function rest(path, body, method = 'POST') {
  const r = await fetch(`${URL}/rest/v1/${path}`, { method, headers: HEADERS, body: JSON.stringify(body) })
  const text = await r.text()
  if (!r.ok) throw new Error(`REST ${path} → ${r.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

async function adminUser(user) {
  const r = await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(user),
  })
  const json = await r.json()
  if (!r.ok && !json.msg?.includes('already been registered')) throw new Error(`auth user ${user.email} → ${r.status}: ${JSON.stringify(json)}`)
  return json
}

async function run() {
  console.log('1. Creating auth users…')
  const users = [
    { id: IDS.karun,  email: 'karun@consne.in',   password: 'Karun@SuperAdmin1', email_confirm: true, user_metadata: { full_name: 'Karun Baruah' } },
    { id: IDS.rajiv,  email: 'rajiv@buildne.in',  password: 'BuildNE@2024!',     email_confirm: true, user_metadata: { full_name: 'Rajiv Nath' } },
    { id: IDS.pranab, email: 'pranab@buildne.in', password: 'BuildNE@2024!',     email_confirm: true, user_metadata: { full_name: 'Pranab Gogoi' } },
    { id: IDS.merina, email: 'merina@buildne.in', password: 'BuildNE@2024!',     email_confirm: true, user_metadata: { full_name: 'Merina Devi' } },
    { id: IDS.biplab, email: 'biplab@buildne.in', password: 'BuildNE@2024!',     email_confirm: true, user_metadata: { full_name: 'Biplab Das' } },
  ]
  for (const u of users) {
    await adminUser(u)
    console.log(`   ✓ ${u.email}`)
  }

  console.log('2. Upserting profiles…')
  await rest('profiles?on_conflict=id', [
    { id: IDS.karun,  tenant_id: null,        full_name: 'Karun Baruah', role: 'superadmin' },
    { id: IDS.rajiv,  tenant_id: IDS.tenant,  full_name: 'Rajiv Nath',   role: 'contractor' },
    { id: IDS.pranab, tenant_id: IDS.tenant,  full_name: 'Pranab Gogoi', role: 'site_manager' },
    { id: IDS.merina, tenant_id: IDS.tenant,  full_name: 'Merina Devi',  role: 'supervisor' },
    { id: IDS.biplab, tenant_id: IDS.tenant,  full_name: 'Biplab Das',   role: 'store_keeper' },
  ])
  console.log('   ✓ 5 profiles')

  console.log('3. Upserting tenant…')
  await rest('tenants?on_conflict=id', [
    { id: IDS.tenant, name: 'BuildNE Infrastructure Pvt. Ltd.', owner_id: IDS.rajiv, plan: 'pro' },
  ])
  console.log('   ✓ BuildNE tenant')

  console.log('4. Upserting sites…')
  await rest('sites?on_conflict=id', [
    {
      id: IDS.site1, tenant_id: IDS.tenant,
      name: 'NH-37 Extension — Furkating to Mariani',
      location: 'Jorhat District, Assam',
      description: 'Two-lane highway extension covering 18 km along NH-37 from Furkating junction to Mariani town. Scope includes earthwork, sub-base preparation, WMM layer, bituminous surfacing, and two minor bridges over Dehing river tributaries. Funded under PMGSY Phase III.',
      status: 'active', budget: 24000000,
      start_date: '2024-03-01', end_date: '2025-09-30', created_by: IDS.rajiv,
    },
    {
      id: IDS.site2, tenant_id: IDS.tenant,
      name: 'Manipur University Hostel Block-C',
      location: 'Canchipur, Imphal West, Manipur',
      description: 'G+3 residential hostel block for 120 students. RCC framed structure with earthquake-resistant design (IS 1893, Zone V). Includes mess hall, common rooms, and solar water heating. Funded by RUSA 2.0.',
      status: 'active', budget: 8500000,
      start_date: '2024-08-15', end_date: '2025-06-30', created_by: IDS.rajiv,
    },
    {
      id: IDS.site3, tenant_id: IDS.tenant,
      name: 'Laitumkhrah Commercial Hub — Phase 1',
      location: 'Laitumkhrah, East Khasi Hills, Meghalaya',
      description: 'Mixed-use commercial complex under Shillong Smart City Mission. G+6 structure with basement parking, retail ground floor, food court, and office spaces. RCC frame with AAC block infill. Pre-construction stage — site clearance and foundation piling underway.',
      status: 'planning', budget: 45000000,
      start_date: '2025-02-01', end_date: '2026-12-31', created_by: IDS.rajiv,
    },
  ])
  console.log('   ✓ 3 sites')

  console.log('5. Upserting site assignments…')
  await rest('site_assignments?on_conflict=site_id,profile_id', [
    { site_id: IDS.site1, profile_id: IDS.pranab, tenant_id: IDS.tenant, role: 'site_manager', assigned_by: IDS.rajiv },
    { site_id: IDS.site2, profile_id: IDS.pranab, tenant_id: IDS.tenant, role: 'site_manager', assigned_by: IDS.rajiv },
    { site_id: IDS.site1, profile_id: IDS.merina, tenant_id: IDS.tenant, role: 'supervisor',   assigned_by: IDS.rajiv },
    { site_id: IDS.site1, profile_id: IDS.biplab, tenant_id: IDS.tenant, role: 'store_keeper', assigned_by: IDS.rajiv },
    { site_id: IDS.site2, profile_id: IDS.biplab, tenant_id: IDS.tenant, role: 'store_keeper', assigned_by: IDS.rajiv },
    { site_id: IDS.site3, profile_id: IDS.biplab, tenant_id: IDS.tenant, role: 'store_keeper', assigned_by: IDS.rajiv },
  ])
  console.log('   ✓ 6 assignments')

  console.log('6. Inserting workers…')
  const workers = [
    // Site 1 — NH-37
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Bhupen Kalita',       trade: 'Mason',             phone: '+91 94350 11203', daily_wage: 650,  status: 'active',   joined_at: '2024-03-05' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Prodip Das',           trade: 'Mason',             phone: '+91 98641 33021', daily_wage: 650,  status: 'active',   joined_at: '2024-03-05' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Ranjit Sonowal',       trade: 'Carpenter',         phone: '+91 86380 44512', daily_wage: 700,  status: 'active',   joined_at: '2024-03-10' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Kamal Singh',          trade: 'Electrician',       phone: '+91 99540 77831', daily_wage: 780,  status: 'active',   joined_at: '2024-04-01' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Hemanta Bora',         trade: 'Helper / Labourer', phone: '+91 94013 56209', daily_wage: 480,  status: 'active',   joined_at: '2024-03-05' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Dibya Hazarika',       trade: 'Helper / Labourer', phone: '+91 85430 99012', daily_wage: 480,  status: 'active',   joined_at: '2024-03-05' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Nilofar Begum',        trade: 'Helper / Labourer', phone: '+91 96782 14530', daily_wage: 460,  status: 'active',   joined_at: '2024-03-08' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Arpita Devi',          trade: 'Helper / Labourer', phone: '+91 91230 88741', daily_wage: 460,  status: 'inactive', joined_at: '2024-03-08' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Dhiren Moran',         trade: 'Welder',            phone: '+91 98011 62304', daily_wage: 720,  status: 'active',   joined_at: '2024-05-15' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Sanjay Boro',          trade: 'Helper / Labourer', phone: '+91 97060 34510', daily_wage: 480,  status: 'active',   joined_at: '2024-06-01' },
    // Site 2 — Manipur Hostel
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Thoiba Meitei',        trade: 'Mason',             phone: '+91 79690 21304', daily_wage: 620,  status: 'active',   joined_at: '2024-08-20' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Iboyaima Singh',        trade: 'Mason',             phone: '+91 98566 43210', daily_wage: 620,  status: 'active',   joined_at: '2024-08-20' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Somorjit Ningombam',   trade: 'Carpenter',         phone: '+91 89760 12340', daily_wage: 680,  status: 'active',   joined_at: '2024-08-22' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Suresh Sharma',         trade: 'Plumber',           phone: '+91 94350 55671', daily_wage: 740,  status: 'active',   joined_at: '2024-09-01' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Romen Chanam',          trade: 'Electrician',       phone: '+91 98711 87620', daily_wage: 750,  status: 'active',   joined_at: '2024-09-01' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Leichombam Devi',       trade: 'Helper / Labourer', phone: '+91 79560 23401', daily_wage: 430,  status: 'active',   joined_at: '2024-08-20' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Ngangbam Devi',         trade: 'Helper / Labourer', phone: '+91 86350 77102', daily_wage: 430,  status: 'active',   joined_at: '2024-08-20' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Khomdram Ranjit',       trade: 'Helper / Labourer', phone: '+91 97360 44510', daily_wage: 450,  status: 'active',   joined_at: '2024-09-10' },
    // Site 3 — Laitumkhrah
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'Bapdor Nongkynmaw',    trade: 'Mason',             phone: '+91 94361 20045', daily_wage: 600,  status: 'active',   joined_at: '2025-02-10' },
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'Pynsuk Rynjah',         trade: 'Carpenter',         phone: '+91 98110 55620', daily_wage: 660,  status: 'active',   joined_at: '2025-02-10' },
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'Bonbom Shullai',        trade: 'Helper / Labourer', phone: '+91 87660 33421', daily_wage: 440,  status: 'active',   joined_at: '2025-02-10' },
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'Shanborlang Mawlong',   trade: 'Helper / Labourer', phone: '+91 91230 12360', daily_wage: 440,  status: 'active',   joined_at: '2025-02-12' },
  ]
  await rest('workers', workers)
  console.log(`   ✓ ${workers.length} workers`)

  console.log('7. Inserting materials…')
  const materials = [
    // Site 1 — NH-37
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'OPC 53 Grade Cement',                       unit: 'bags',    unit_cost: 385,   quantity_available: 840,   quantity_minimum: 200, supplier: 'Ambuja Cements Depot, Jorhat' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'TMT Steel Bars Fe500 (12mm)',               unit: 'tonnes',  unit_cost: 65000, quantity_available: 18.5,  quantity_minimum: 5,   supplier: 'SAIL Distribution Centre, Dimapur' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Crushed Stone 20mm Aggregate',              unit: 'cu m',    unit_cost: 1200,  quantity_available: 85,    quantity_minimum: 20,  supplier: 'Dhansiri Stone Quarry, Golaghat' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'River Sand (Brahmaputra)',                  unit: 'cu m',    unit_cost: 1800,  quantity_available: 42,    quantity_minimum: 15,  supplier: 'Lakhimpur Sand Depot' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Bitumen VG-30',                             unit: 'tonnes',  unit_cost: 48000, quantity_available: 8,     quantity_minimum: 3,   supplier: 'BPCL Terminal, Guwahati' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Concrete Drain Pipes 600mm',               unit: 'nos',     unit_cost: 3200,  quantity_available: 45,    quantity_minimum: 20,  supplier: 'Assam Pipe Industries, Guwahati' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'Reinforced Cement Concrete (M25 Ready Mix)', unit: 'cu m',  unit_cost: 5200,  quantity_available: 22,    quantity_minimum: 8,   supplier: 'Ultratech RMC Plant, Jorhat' },
    { site_id: IDS.site1, tenant_id: IDS.tenant, name: 'GSB Material (Granular Sub-Base)',          unit: 'cu m',    unit_cost: 950,   quantity_available: 110,   quantity_minimum: 30,  supplier: 'Kaziranga Crushers, Bokakhat' },
    // Site 2 — Manipur Hostel
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'OPC 53 Grade Cement',                       unit: 'bags',    unit_cost: 420,   quantity_available: 320,   quantity_minimum: 100, supplier: 'Ultratech Cement Depot, Imphal' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'TMT Steel Bars Fe500 (10mm)',               unit: 'tonnes',  unit_cost: 68000, quantity_available: 6.2,   quantity_minimum: 2,   supplier: 'Vizag Steel Depot, Imphal' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Red Clay Bricks (Standard)',                unit: 'nos',     unit_cost: 8,     quantity_available: 25000, quantity_minimum: 5000,supplier: 'Kakching Brick Kiln, Thoubal' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'River Sand (Iril River)',                   unit: 'cu m',    unit_cost: 2200,  quantity_available: 18,    quantity_minimum: 8,   supplier: 'Senapati Sand Suppliers' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Structural Plywood 18mm',                   unit: 'nos',     unit_cost: 1650,  quantity_available: 85,    quantity_minimum: 20,  supplier: 'North East Timber Mart, Imphal' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'PVC Water Pipes 4 inch',                    unit: 'bundles', unit_cost: 1800,  quantity_available: 12,    quantity_minimum: 5,   supplier: 'Ashirvad Pipes Depot, Imphal' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'TMT Steel Bars Fe500 (16mm)',               unit: 'tonnes',  unit_cost: 67000, quantity_available: 4.8,   quantity_minimum: 2,   supplier: 'Vizag Steel Depot, Imphal' },
    { site_id: IDS.site2, tenant_id: IDS.tenant, name: 'Fly Ash (Class C)',                         unit: 'bags',    unit_cost: 220,   quantity_available: 180,   quantity_minimum: 60,  supplier: 'NTPC Loktak Ash Depot' },
    // Site 3 — Laitumkhrah
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'OPC 53 Grade Cement',                       unit: 'bags',    unit_cost: 440,   quantity_available: 60,    quantity_minimum: 80,  supplier: 'ACC Cement, Shillong' },
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'TMT Steel Bars Fe500 (16mm)',               unit: 'tonnes',  unit_cost: 67500, quantity_available: 4,     quantity_minimum: 3,   supplier: 'SAIL Steel, Guwahati' },
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'AAC Blocks 600×200×150mm',                  unit: 'nos',     unit_cost: 55,    quantity_available: 2400,  quantity_minimum: 500, supplier: 'Meghalaya AAC Products, Byrnihat' },
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'River Sand',                                unit: 'cu m',    unit_cost: 2400,  quantity_available: 8,     quantity_minimum: 10,  supplier: 'Umiam Sand Depot, Ri-Bhoi' },
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'Granite Stone Chips 20mm',                  unit: 'cu m',    unit_cost: 1500,  quantity_available: 22,    quantity_minimum: 8,   supplier: 'Umroi Quarry, Ri-Bhoi' },
    { site_id: IDS.site3, tenant_id: IDS.tenant, name: 'Piling Casing Steel Tubes',                 unit: 'nos',     unit_cost: 12500, quantity_available: 18,    quantity_minimum: 5,   supplier: 'Kalinga Steel, Guwahati' },
  ]
  await rest('materials', materials)
  console.log(`   ✓ ${materials.length} materials`)

  console.log('8. Inserting daily logs…')
  const today = new Date()
  const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }
  const logs = [
    { site_id: IDS.site1, tenant_id: IDS.tenant, log_date: daysAgo(6), workers_present: 8,  work_done: 'Earthwork cutting completed for Ch. 4+200 to Ch. 4+600. Sub-grade preparation and compaction done using vibratory roller. Total earthwork: 320 cu m.', issues: 'Soft soil encountered at Ch. 4+380; geotextile fabric ordered.', weather: 'Partly cloudy, heavy showers 14:00–15:30. Work suspended during rain.', created_by: IDS.merina },
    { site_id: IDS.site1, tenant_id: IDS.tenant, log_date: daysAgo(5), workers_present: 9,  work_done: 'WMM (Wet Mix Macadam) laying completed for Ch. 3+800 to Ch. 4+100 — 300 m stretch. Roller passes: 8. Camber maintained at 2.5%.', issues: null, weather: 'Clear skies, hot and humid. Max temp 33°C.', created_by: IDS.merina },
    { site_id: IDS.site1, tenant_id: IDS.tenant, log_date: daysAgo(4), workers_present: 7,  work_done: 'Minor bridge abutment RCC work at Km 6.3: formwork erected, reinforcement placed (8 MT TMT 12mm), concrete poured (M30 grade, 24 cu m). Curing started.', issues: 'Concrete mixer breakdown at 11:00; manual mixing for 2 hours. Mixer repaired.', weather: 'Overcast with light drizzle. Work continued.', created_by: IDS.merina },
    { site_id: IDS.site1, tenant_id: IDS.tenant, log_date: daysAgo(3), workers_present: 10, work_done: 'Bituminous Prime Coat applied using bitumen distributor — Ch. 2+500 to Ch. 3+200. Dense Bituminous Macadam (DBM) laying started for 400 m stretch.', issues: null, weather: 'Sunny, light breeze. Ideal paving conditions.', created_by: IDS.merina },
    { site_id: IDS.site1, tenant_id: IDS.tenant, log_date: daysAgo(2), workers_present: 9,  work_done: 'Drain pipe laying (600mm RCC) on LHS — Ch. 3+000 to Ch. 3+600. Cement concrete bedding for pipes. Road side slope protection pitching at Ch. 5+000.', issues: 'One labourer (Hemanta Bora) reported mild fever; sent home. Medical first-aid administered.', weather: 'Partly cloudy, comfortable temperature.', created_by: IDS.merina },
    { site_id: IDS.site1, tenant_id: IDS.tenant, log_date: daysAgo(1), workers_present: 10, work_done: 'Seal coat (BC — Bituminous Concrete) laid for Ch. 2+500 to Ch. 2+900. Surface finished and rolled. Traffic barricades checked and adjusted.', issues: null, weather: 'Clear and sunny. Excellent working conditions.', created_by: IDS.merina },
    { site_id: IDS.site1, tenant_id: IDS.tenant, log_date: daysAgo(0), workers_present: 8,  work_done: 'Quality check inspection with PWD engineer. Core samples taken at Ch. 2+600, 2+800, 3+000. Reinstatement of service road near Furkating junction — 120 m length.', issues: 'Inspection snagging: minor surface irregularity at Ch. 2+750 flagged; scheduled for patch work tomorrow.', weather: 'Morning fog cleared by 08:30. Cloudy afternoon.', created_by: IDS.merina },
    { site_id: IDS.site2, tenant_id: IDS.tenant, log_date: daysAgo(2), workers_present: 7,  work_done: 'Slab formwork for 2nd floor completed (Block C, Grid 3–6). Steel reinforcement binding in progress — top and bottom mats for 200 sqm area.', issues: null, weather: 'Intermittent drizzle. Work continued with temporary shelter.', created_by: IDS.pranab },
    { site_id: IDS.site2, tenant_id: IDS.tenant, log_date: daysAgo(1), workers_present: 8,  work_done: '2nd floor slab concrete poured: M25 grade, 48 cu m. Vibration and levelling completed. Curing compound applied immediately after striking.', issues: 'Ready-mix concrete truck arrived 45 minutes late from Imphal; adjusted schedule.', weather: 'Clear skies, moderate temperature.', created_by: IDS.pranab },
    { site_id: IDS.site2, tenant_id: IDS.tenant, log_date: daysAgo(0), workers_present: 6,  work_done: 'Brick masonry (1st floor, west wing) — 900 sqft of 230mm thick walls. Curing of 2nd floor slab: 2nd day water curing.', issues: null, weather: 'Partly cloudy. Cool breeze from the hills.', created_by: IDS.pranab },
  ]
  await rest('daily_logs', logs)
  console.log(`   ✓ ${logs.length} daily logs`)

  console.log('\n✅ Demo data populated successfully!')
  console.log('\nDemo accounts:')
  console.log('  superadmin  : karun@consne.in       / Karun@SuperAdmin1')
  console.log('  contractor  : rajiv@buildne.in      / BuildNE@2024!')
  console.log('  site_manager: pranab@buildne.in     / BuildNE@2024!')
  console.log('  supervisor  : merina@buildne.in     / BuildNE@2024!')
  console.log('  store_keeper: biplab@buildne.in     / BuildNE@2024!')
}

run().catch((e) => { console.error('❌', e.message); process.exit(1) })
