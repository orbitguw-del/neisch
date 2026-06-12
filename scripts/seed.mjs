// ConsNE Demo Seed — runs via Supabase Admin API + REST API
//
// What this does:
//   • KEEPS login data unchanged: the 5 auth users, their profiles, the tenant
//     and the 3 sites are upserted (idempotent) — same IDs, same passwords.
//   • POPULATES every module so all screens have data: cost centres (per site,
//     with material tagging), workers, materials (with budgets), material
//     transactions / receipts / transfers / allocations, budget_lines (8-month
//     trend), equipment assets, site expenses, attendance (30 days), tasks +
//     updates, daily logs, and sub-contractors (directory + site assignments +
//     daily labour headcount logs).
//
// Idempotency / safety:
//   • Every row uses a FIXED deterministic UUID and is UPSERTED. Re-running
//     overwrites the seed rows in place and NEVER deletes anything — so data
//     you add through the live UI survives a re-run.
//   • The ORIGINAL seed inserted workers/materials/logs with RANDOM UUIDs. To
//     remove those legacy rows once and reset to a clean demo state, run with
//     the CLEAN_LEGACY flag (see below). This deletes tenant rows whose id is
//     NOT in this script's fixed-UUID set — it will also remove anything a user
//     hand-added, so only use it for a deliberate reset.
//
// Run (safe, no deletes):   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed.mjs
// Run (one-time reset):     CLEAN_LEGACY=1 SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed.mjs
//   (PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY="<key>"; node scripts/seed.mjs)
//
// The service_role key bypasses ALL row-level security — NEVER hardcode it here
// or commit it. Pass it via the SUPABASE_SERVICE_ROLE_KEY env var at run time.
const URL  = process.env.SUPABASE_URL || 'https://zgvbogxibiilnblmuohg.supabase.co'
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY env var.')
  console.error('   Run:  SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/seed.mjs')
  console.error('   (PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY="<your-key>"; node scripts/seed.mjs)')
  process.exit(1)
}

const HEADERS = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'resolution=merge-duplicates' }
const CLEAN_LEGACY = process.env.CLEAN_LEGACY === '1'

// ─── Fixed UUIDs (login data — DO NOT CHANGE) ─────────────────────────────────
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

// deterministic fixed-UUID minters
const pad = (n) => String(n).padStart(12, '0')
const wId = (n) => `dddddddd-0000-0000-0000-${pad(n)}`   // workers
const mId = (n) => `eeeeeeee-0000-0000-0000-${pad(n)}`   // materials
const tId = (n) => `ffffffff-0000-0000-0000-${pad(n)}`   // tasks
const ccId  = (n) => `cc000000-0000-0000-0000-${pad(n)}` // cost centres
const subId = (n) => `5c000000-0000-0000-0000-${pad(n)}` // sub-contractors
const _seq = {}
const nid = (prefix) => { _seq[prefix] = (_seq[prefix] || 0) + 1; return `${prefix}-0000-0000-0000-${pad(_seq[prefix])}` }

// ─── Date helpers ─────────────────────────────────────────────────────────────
const today = new Date()
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }
// last 8 calendar months ending this month
const MONTHS = (() => {
  const arr = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return arr
})()
const LAST = MONTHS.length - 1
const monthTs = (m, day = 12, hh = 10) => `${m}-${String(day).padStart(2, '0')}T${String(hh).padStart(2, '0')}:00:00`
// gentle ramp-up weights that always sum to 1 (so total consumed = budget_qty × cf)
const WEIGHTS = (() => {
  const raw = MONTHS.map((_, i) => i + 3)
  const s = raw.reduce((a, b) => a + b, 0)
  return raw.map((r) => r / s)
})()

// ─── REST helpers ─────────────────────────────────────────────────────────────
async function rest(path, body, method = 'POST') {
  const r = await fetch(`${URL}/rest/v1/${path}`, { method, headers: HEADERS, body: body ? JSON.stringify(body) : undefined })
  const text = await r.text()
  if (!r.ok) throw new Error(`REST ${method} ${path} → ${r.status}: ${text}`)
  return text ? JSON.parse(text) : null
}
async function up(table, rows, conflict = 'id') {
  if (!rows.length) return
  // PostgREST requires every object in a bulk insert to share the SAME keys.
  // Normalise: take the union of all keys and fill missing ones with null.
  const keys = [...new Set(rows.flatMap(Object.keys))]
  const norm = rows.map((r) => Object.fromEntries(keys.map((k) => [k, k in r ? r[k] : null])))
  await rest(`${table}?on_conflict=${conflict}`, norm)
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
  // ── 1. Auth users (login data — unchanged) ──────────────────────────────────
  console.log('1. Creating / confirming auth users…')
  const users = [
    { id: IDS.karun,  email: 'karun@consne.in',   password: 'Karun@SuperAdmin1', email_confirm: true, user_metadata: { full_name: 'Karun Baruah' } },
    { id: IDS.rajiv,  email: 'rajiv@buildne.in',  password: 'BuildNE@2024!',     email_confirm: true, user_metadata: { full_name: 'Rajiv Nath' } },
    { id: IDS.pranab, email: 'pranab@buildne.in', password: 'BuildNE@2024!',     email_confirm: true, user_metadata: { full_name: 'Pranab Gogoi' } },
    { id: IDS.merina, email: 'merina@buildne.in', password: 'BuildNE@2024!',     email_confirm: true, user_metadata: { full_name: 'Merina Devi' } },
    { id: IDS.biplab, email: 'biplab@buildne.in', password: 'BuildNE@2024!',     email_confirm: true, user_metadata: { full_name: 'Biplab Das' } },
  ]
  for (const u of users) { await adminUser(u); console.log(`   ✓ ${u.email}`) }

  // ── 2. Profiles / tenant / sites / assignments (login data — unchanged) ─────
  console.log('2. Upserting profiles / tenant / sites / assignments…')
  await up('profiles', [
    { id: IDS.karun,  tenant_id: null,        full_name: 'Karun Baruah', role: 'superadmin' },
    { id: IDS.rajiv,  tenant_id: IDS.tenant,  full_name: 'Rajiv Nath',   role: 'contractor' },
    { id: IDS.pranab, tenant_id: IDS.tenant,  full_name: 'Pranab Gogoi', role: 'site_manager' },
    { id: IDS.merina, tenant_id: IDS.tenant,  full_name: 'Merina Devi',  role: 'supervisor' },
    { id: IDS.biplab, tenant_id: IDS.tenant,  full_name: 'Biplab Das',   role: 'store_keeper' },
  ])
  await up('tenants', [{ id: IDS.tenant, name: 'BuildNE Infrastructure Pvt. Ltd.', owner_id: IDS.rajiv, plan: 'pro' }])
  await up('sites', [
    { id: IDS.site1, tenant_id: IDS.tenant, name: 'NH-37 Extension — Furkating to Mariani', location: 'Jorhat District, Assam',
      description: 'Two-lane highway extension covering 18 km along NH-37 from Furkating junction to Mariani town. Earthwork, sub-base, WMM, bituminous surfacing, two minor bridges. PMGSY Phase III.',
      status: 'active', budget: 24000000, start_date: '2024-03-01', end_date: '2025-09-30', created_by: IDS.rajiv },
    { id: IDS.site2, tenant_id: IDS.tenant, name: 'Manipur University Hostel Block-C', location: 'Canchipur, Imphal West, Manipur',
      description: 'G+3 residential hostel block for 120 students. RCC framed, earthquake-resistant (IS 1893, Zone V). RUSA 2.0.',
      status: 'active', budget: 8500000, start_date: '2024-08-15', end_date: '2025-06-30', created_by: IDS.rajiv },
    { id: IDS.site3, tenant_id: IDS.tenant, name: 'Laitumkhrah Commercial Hub — Phase 1', location: 'Laitumkhrah, East Khasi Hills, Meghalaya',
      description: 'Mixed-use commercial complex under Shillong Smart City Mission. G+6, basement parking. Site clearance + foundation piling underway.',
      status: 'planning', budget: 45000000, start_date: '2025-02-01', end_date: '2026-12-31', created_by: IDS.rajiv },
  ])
  await up('site_assignments', [
    { site_id: IDS.site1, profile_id: IDS.pranab, tenant_id: IDS.tenant, role: 'site_manager', assigned_by: IDS.rajiv },
    { site_id: IDS.site2, profile_id: IDS.pranab, tenant_id: IDS.tenant, role: 'site_manager', assigned_by: IDS.rajiv },
    { site_id: IDS.site1, profile_id: IDS.merina, tenant_id: IDS.tenant, role: 'supervisor',   assigned_by: IDS.rajiv },
    { site_id: IDS.site1, profile_id: IDS.biplab, tenant_id: IDS.tenant, role: 'store_keeper', assigned_by: IDS.rajiv },
    { site_id: IDS.site2, profile_id: IDS.biplab, tenant_id: IDS.tenant, role: 'store_keeper', assigned_by: IDS.rajiv },
    { site_id: IDS.site3, profile_id: IDS.biplab, tenant_id: IDS.tenant, role: 'store_keeper', assigned_by: IDS.rajiv },
  ], 'site_id,profile_id')
  console.log('   ✓ 5 profiles · tenant · 3 sites · 6 assignments')

  // ── 2b. Cost centres (spend buckets within each site) ───────────────────────
  // Each carries a top-down ₹ budget; materials get tagged to one (see MCC below).
  console.log('2b. Upserting cost centres…')
  const COST_CENTRES = [
    [ccId(1), IDS.site1, 'Earthwork & Sub-base', 6500000, 0],
    [ccId(2), IDS.site1, 'Bituminous Works',     7200000, 1],
    [ccId(3), IDS.site1, 'Bridge & Drainage',    5400000, 2],
    [ccId(4), IDS.site2, 'Substructure',         2600000, 0],
    [ccId(5), IDS.site2, 'Superstructure',       3400000, 1],
    [ccId(6), IDS.site2, 'Finishing',            1800000, 2],
    [ccId(7), IDS.site3, 'Piling & Foundation',  9000000, 0],
  ]
  await up('cost_centres', COST_CENTRES.map((c) => ({
    id: c[0], tenant_id: IDS.tenant, site_id: c[1], name: c[2],
    budget_amount: c[3], sort_order: c[4], created_by: IDS.rajiv,
  })))
  console.log(`   ✓ ${COST_CENTRES.length} cost centres`)

  // ── 3. Workers (fixed IDs) ───────────────────────────────────────────────────
  console.log('3. Upserting workers…')
  const W = [
    // Site 1 — NH-37 (highway)
    [IDS.site1, 'Bhupen Kalita',      'Mason',             '+91 94350 11203', 650, 'active',   '2024-03-05'],
    [IDS.site1, 'Prodip Das',          'Mason',             '+91 98641 33021', 650, 'active',   '2024-03-05'],
    [IDS.site1, 'Ranjit Sonowal',      'Carpenter',         '+91 86380 44512', 700, 'active',   '2024-03-10'],
    [IDS.site1, 'Kamal Singh',         'Electrician',       '+91 99540 77831', 780, 'active',   '2024-04-01'],
    [IDS.site1, 'Hemanta Bora',        'Helper / Labourer', '+91 94013 56209', 480, 'active',   '2024-03-05'],
    [IDS.site1, 'Dibya Hazarika',      'Helper / Labourer', '+91 85430 99012', 480, 'active',   '2024-03-05'],
    [IDS.site1, 'Nilofar Begum',       'Helper / Labourer', '+91 96782 14530', 460, 'active',   '2024-03-08'],
    [IDS.site1, 'Arpita Devi',         'Helper / Labourer', '+91 91230 88741', 460, 'inactive', '2024-03-08'],
    [IDS.site1, 'Dhiren Moran',        'Welder',            '+91 98011 62304', 720, 'active',   '2024-05-15'],
    [IDS.site1, 'Sanjay Boro',         'Helper / Labourer', '+91 97060 34510', 480, 'active',   '2024-06-01'],
    [IDS.site1, 'Jiten Tirkey',        'Mason',             '+91 90854 22107', 640, 'active',   '2024-07-12'],
    [IDS.site1, 'Lakhi Pegu',          'Bar Bender',        '+91 94352 66318', 690, 'active',   '2024-07-12'],
    // Site 2 — Manipur Hostel
    [IDS.site2, 'Thoiba Meitei',       'Mason',             '+91 79690 21304', 620, 'active',   '2024-08-20'],
    [IDS.site2, 'Iboyaima Singh',      'Mason',             '+91 98566 43210', 620, 'active',   '2024-08-20'],
    [IDS.site2, 'Somorjit Ningombam',  'Carpenter',         '+91 89760 12340', 680, 'active',   '2024-08-22'],
    [IDS.site2, 'Suresh Sharma',       'Plumber',           '+91 94350 55671', 740, 'active',   '2024-09-01'],
    [IDS.site2, 'Romen Chanam',        'Electrician',       '+91 98711 87620', 750, 'active',   '2024-09-01'],
    [IDS.site2, 'Leichombam Devi',     'Helper / Labourer', '+91 79560 23401', 430, 'active',   '2024-08-20'],
    [IDS.site2, 'Ngangbam Devi',       'Helper / Labourer', '+91 86350 77102', 430, 'active',   '2024-08-20'],
    [IDS.site2, 'Khomdram Ranjit',     'Helper / Labourer', '+91 97360 44510', 450, 'active',   '2024-09-10'],
    [IDS.site2, 'Tomba Singh',         'Helper / Labourer', '+91 89765 30021', 440, 'active',   '2024-10-05'],
    [IDS.site2, 'Premananda Sharma',   'Painter',           '+91 94360 71182', 660, 'active',   '2024-11-01'],
    // Site 3 — Laitumkhrah
    [IDS.site3, 'Bapdor Nongkynmaw',   'Mason',             '+91 94361 20045', 600, 'active',   '2025-02-10'],
    [IDS.site3, 'Pynsuk Rynjah',       'Carpenter',         '+91 98110 55620', 660, 'active',   '2025-02-10'],
    [IDS.site3, 'Bonbom Shullai',      'Helper / Labourer', '+91 87660 33421', 440, 'active',   '2025-02-10'],
    [IDS.site3, 'Shanborlang Mawlong', 'Helper / Labourer', '+91 91230 12360', 440, 'active',   '2025-02-12'],
    [IDS.site3, 'Wanphrang Lyngdoh',   'Mason',             '+91 94367 88012', 610, 'active',   '2025-03-01'],
    [IDS.site3, 'Kyrshan Marbaniang',  'Helper / Labourer', '+91 98631 22904', 450, 'active',   '2025-03-01'],
    [IDS.site3, 'Dapmain Suchiang',    'Carpenter',         '+91 87000 45561', 650, 'active',   '2025-03-15'],
    [IDS.site3, 'Banshan Kharkongor',  'Helper / Labourer', '+91 91234 77820', 450, 'active',   '2025-03-15'],
  ]
  const workers = W.map((w, i) => ({
    id: wId(i + 1), site_id: w[0], tenant_id: IDS.tenant, name: w[1], trade: w[2],
    phone: w[3], daily_wage: w[4], status: w[5], joined_at: w[6], employment_type: 'direct',
  }))

  // ── 4. Materials (fixed IDs, mostly budgeted) ───────────────────────────────
  // cols: [site, name, unit, unit_cost, qty_avail, qty_min, supplier, category, work_type,
  //        budget_qty, budget_rate, consumeFactor, receiveFactor, priceFactor]
  // consumeFactor → pct_consumed = cf×100 (drives the green/amber/red chip)
  const M = [
    // Site 1 — NH-37
    [IDS.site1, 'OPC 53 Grade Cement',                'bags',    385,   840,   200,  'Ambuja Cements Depot, Jorhat',     'consumable', 'civil',      4200,   385,   0.62, 0.70, 1.02],
    [IDS.site1, 'TMT Steel Bars Fe500 (12mm)',        'tonnes',  65000, 18.5,  5,    'SAIL Distribution Centre, Dimapur','consumable', 'fabrication',60,     65000, 0.48, 0.55, 1.05],
    [IDS.site1, 'Crushed Stone 20mm Aggregate',       'cu m',    1200,  85,    20,   'Dhansiri Stone Quarry, Golaghat',  'consumable', 'civil',      900,    1200,  0.95, 0.90, 0.98],
    [IDS.site1, 'River Sand (Brahmaputra)',           'cu m',    1800,  42,    15,   'Lakhimpur Sand Depot',             'consumable', 'civil',      450,    1800,  1.08, 1.00, 1.10],
    [IDS.site1, 'Bitumen VG-30',                      'tonnes',  48000, 8,     3,    'BPCL Terminal, Guwahati',          'consumable', 'civil',      40,     48000, 0.35, 0.50, 1.00],
    [IDS.site1, 'Concrete Drain Pipes 600mm',         'nos',     3200,  45,    20,   'Assam Pipe Industries, Guwahati',  'consumable', 'civil',      80,     3200,  0.70, 0.75, 1.00],
    [IDS.site1, 'RCC M25 Ready Mix',                  'cu m',    5200,  22,    8,    'Ultratech RMC Plant, Jorhat',      'consumable', 'civil',      320,    5200,  0.80, 0.85, 1.03],
    [IDS.site1, 'GSB Material (Granular Sub-Base)',   'cu m',    950,   110,   30,   'Kaziranga Crushers, Bokakhat',     'consumable', 'civil',      1500,   950,   0.55, 0.60, 1.00],
    [IDS.site1, 'Concrete Mixer (Diesel, 10/7 CFT)',  'nos',     185000,3,     1,    'Universal Construction Equip.',    'equipment',  'fabrication',null,   null,  0,    0,    1],
    [IDS.site1, 'Geotextile Fabric (Non-woven)',      'sq m',    95,    1200,  300,  'Garware Technical Fibres',         'consumable', 'civil',      6000,   95,    1.15, 1.00, 1.04],
    [IDS.site1, 'Tack Coat Emulsion (RS-1)',          'litres',  62,    3000,  500,  'Hincol Bitumen, Guwahati',         'consumable', 'civil',      18000,  62,    0.42, 0.50, 1.00],
    // Site 2 — Manipur Hostel
    [IDS.site2, 'OPC 53 Grade Cement',                'bags',    420,   320,   100,  'Ultratech Cement Depot, Imphal',   'consumable', 'civil',      1600,   420,   0.55, 0.60, 1.00],
    [IDS.site2, 'TMT Steel Bars Fe500 (10mm)',        'tonnes',  68000, 6.2,   2,    'Vizag Steel Depot, Imphal',        'consumable', 'fabrication',8,      68000, 0.90, 0.95, 1.02],
    [IDS.site2, 'Red Clay Bricks (Standard)',         'nos',     8,     25000, 5000, 'Kakching Brick Kiln, Thoubal',     'consumable', 'civil',      90000,  8,     0.90, 0.95, 1.00],
    [IDS.site2, 'River Sand (Iril River)',            'cu m',    2200,  18,    8,    'Senapati Sand Suppliers',          'consumable', 'civil',      230,    2200,  0.65, 0.70, 1.05],
    [IDS.site2, 'Structural Plywood 18mm',            'nos',     1650,  85,    20,   'North East Timber Mart, Imphal',   'consumable', 'finishing',  null,   null,  0,    0,    1],
    [IDS.site2, 'PVC Water Pipes 4 inch',             'bundles', 1800,  12,    5,    'Ashirvad Pipes Depot, Imphal',     'consumable', 'plumbing',   90,     1800,  0.50, 0.60, 1.00],
    [IDS.site2, 'TMT Steel Bars Fe500 (16mm)',        'tonnes',  67000, 4.8,   2,    'Vizag Steel Depot, Imphal',        'consumable', 'fabrication',10,     67000, 1.15, 1.00, 1.08],
    [IDS.site2, 'Vibratory Plate Compactor',          'nos',     95000, 2,     1,    'NE Equipment Rentals, Imphal',     'equipment',  'civil',      null,   null,  0,    0,    1],
    [IDS.site2, 'Vitrified Tiles 600×600mm',          'boxes',   780,   400,   80,   'Somany Ceramics, Guwahati',        'consumable', 'finishing',  700,    780,   1.05, 1.00, 1.02],
    // Site 3 — Laitumkhrah (early stage; only piling budgeted)
    [IDS.site3, 'OPC 53 Grade Cement',                'bags',    440,   60,    80,   'ACC Cement, Shillong',             'consumable', 'civil',      null,   null,  0,    0,    1],
    [IDS.site3, 'TMT Steel Bars Fe500 (16mm)',        'tonnes',  67500, 4,     3,    'SAIL Steel, Guwahati',             'consumable', 'fabrication',null,   null,  0,    0,    1],
    [IDS.site3, 'AAC Blocks 600×200×150mm',           'nos',     55,    2400,  500,  'Meghalaya AAC Products, Byrnihat', 'consumable', 'civil',      null,   null,  0,    0,    1],
    [IDS.site3, 'Piling Casing Steel Tubes',          'nos',     12500, 18,    5,    'Kalinga Steel, Guwahati',          'consumable', 'fabrication',120,    12500, 0.38, 0.45, 1.03],
    [IDS.site3, 'RCC M30 Ready Mix (Piling)',         'cu m',    5600,  12,    10,   'Lafarge RMC, Byrnihat',            'consumable', 'civil',      600,    5600,  0.25, 0.35, 1.00],
  ]
  // Cost-centre tag per material (index-aligned with M; null = Unassigned / equipment)
  const MCC = [
    ccId(1), ccId(3), ccId(1), ccId(1), ccId(2), ccId(3), ccId(3), ccId(1), null, ccId(1), ccId(2), // site1 (0-10)
    ccId(4), ccId(5), ccId(5), ccId(4), ccId(5), ccId(6), ccId(4), null, ccId(6),                   // site2 (11-19)
    ccId(7), ccId(7), null, ccId(7), ccId(7),                                                        // site3 (20-24)
  ]
  const materials = M.map((m, i) => ({
    id: mId(i + 1), site_id: m[0], tenant_id: IDS.tenant, name: m[1], unit: m[2], unit_cost: m[3],
    quantity_available: m[4], quantity_minimum: m[5], supplier: m[6], category: m[7], work_type: m[8],
    budget_qty: m[9], budget_rate: m[10], cost_centre_id: MCC[i] ?? null, opening_stock_recorded: true,
  }))

  // ── one-time legacy reset (opt-in) ───────────────────────────────────────────
  if (CLEAN_LEGACY) {
    console.log('   ⚠ CLEAN_LEGACY=1 — removing legacy (random-UUID) rows for tenant…')
    const keepW = workers.map((w) => w.id).join(',')
    const keepM = materials.map((m) => m.id).join(',')
    // child/module tables: delete everything for tenant (all module rows are reseeded below)
    for (const t of [
      'task_updates', 'tasks', 'equipment_maintenance', 'equipment_assignments', 'equipment_assets',
      'material_allocations', 'material_transactions', 'material_receipts', 'material_transfers',
      'budget_lines', 'attendance', 'site_expenses', 'daily_logs',
      // newer modules (labour photos cascade-delete from their parent log)
      'subcontractor_daily_logs', 'subcontractor_site_assignments', 'subcontractors', 'cost_centres',
    ]) {
      await rest(`${t}?tenant_id=eq.${IDS.tenant}`, null, 'DELETE')
    }
    // parents: keep only our fixed-UUID rows
    await rest(`workers?tenant_id=eq.${IDS.tenant}&id=not.in.(${keepW})`, null, 'DELETE')
    await rest(`materials?tenant_id=eq.${IDS.tenant}&id=not.in.(${keepM})`, null, 'DELETE')
    console.log('   ✓ legacy rows cleared')
  }

  await up('workers', workers)
  console.log(`   ✓ ${workers.length} workers`)
  await up('materials', materials)
  console.log(`   ✓ ${materials.length} materials (${materials.filter((x) => x.budget_qty).length} budgeted)`)

  // ── 5. Material flow: opening + receipts + consumption + budget_lines ────────
  console.log('5. Upserting material flow (txns, receipts, budget lines, allocations)…')
  const txns = [], receipts = [], budgetLines = [], allocations = []

  materials.forEach((mt, i) => {
    const meta = M[i]
    const qtyAvail = meta[4], bq = meta[9], br = meta[10], cf = meta[11], rf = meta[12], pf = meta[13]
    if (qtyAvail > 0) {
      txns.push({ id: nid('e1000000'), material_id: mt.id, site_id: mt.site_id, tenant_id: IDS.tenant,
        txn_type: 'opening', quantity: qtyAvail, ref_type: 'opening', note: 'Opening stock', created_at: monthTs(MONTHS[0], 1, 8) })
    }
    if (!bq) return

    const totalRecv = bq * rf, totalCons = bq * cf, rcptCost = Math.round(br * pf)
    MONTHS.forEach((mo, mi) => {
      const w = WEIGHTS[mi]
      const recvQ = +(totalRecv * w).toFixed(2)
      const consQ = +(totalCons * w).toFixed(2)
      const plannedQ = +(bq * w).toFixed(2)
      budgetLines.push({ id: nid('e3000000'), tenant_id: IDS.tenant, site_id: mt.site_id, material_id: mt.id,
        budgeted_quantity: plannedQ, budgeted_cost: Math.round(plannedQ * br), period_month: mo, note: 'Monthly plan', created_by: IDS.rajiv })
      if (recvQ > 0) {
        receipts.push({ id: nid('e2000000'), material_id: mt.id, site_id: mt.site_id, tenant_id: IDS.tenant,
          source_type: 'supplier', source_name: mt.supplier, quantity: recvQ, unit_cost: rcptCost,
          lr_number: `LR-${mo.replace('-', '')}-${i + 1}`, lr_date: `${mo}-10`, challan_number: `CH-${mo.replace('-', '')}-${i + 1}`,
          status: 'received', created_by: IDS.biplab, received_by: IDS.pranab, received_at: monthTs(mo, 12, 11), created_at: monthTs(mo, 12, 11) })
        txns.push({ id: nid('e1000000'), material_id: mt.id, site_id: mt.site_id, tenant_id: IDS.tenant,
          txn_type: 'receipt', quantity: recvQ, ref_type: 'receipt', note: 'GRN inward', created_at: monthTs(mo, 12, 12) })
      }
      if (consQ > 0) {
        txns.push({ id: nid('e1000000'), material_id: mt.id, site_id: mt.site_id, tenant_id: IDS.tenant,
          txn_type: 'consumption', quantity: consQ, ref_type: 'allocation', note: 'Site consumption', created_at: monthTs(mo, 15, 10) })
      }
    })
    // one pending receipt this month (awaiting confirmation — blue state)
    receipts.push({ id: nid('e2000000'), material_id: mt.id, site_id: mt.site_id, tenant_id: IDS.tenant,
      source_type: 'supplier', source_name: mt.supplier, quantity: +(bq * 0.05).toFixed(2), unit_cost: rcptCost,
      lr_number: `LR-PEND-${i + 1}`, status: 'pending', created_by: IDS.biplab, created_at: monthTs(MONTHS[LAST], 24, 9) })
    // recent work allocations (consumption report)
    allocations.push({ id: nid('e4000000'), material_id: mt.id, site_id: mt.site_id, tenant_id: IDS.tenant,
      work_description: 'Allocated to active work front', quantity_allocated: +(totalCons * 0.18).toFixed(2),
      allocated_date: daysAgo(5), note: 'Current phase', allocated_by: IDS.merina })
  })

  await up('material_transactions', txns)
  console.log(`   ✓ ${txns.length} transactions`)
  await up('material_receipts', receipts)
  console.log(`   ✓ ${receipts.length} receipts`)
  await up('budget_lines', budgetLines, 'site_id,material_id,period_month')
  console.log(`   ✓ ${budgetLines.length} budget lines`)
  await up('material_allocations', allocations)
  console.log(`   ✓ ${allocations.length} allocations`)

  // ── 6. Material transfers (inter-site, plausible quantities) ─────────────────
  console.log('6. Upserting material transfers…')
  await up('material_transfers', [
    { id: nid('e5000000'), material_id: mId(1),  from_site_id: IDS.site1, to_site_id: IDS.site2, tenant_id: IDS.tenant,
      quantity: 120, lr_number: 'TR-1001', lr_date: daysAgo(20), vehicle_number: 'AS-03-K-7781',
      status: 'confirmed', initiated_by: IDS.pranab, confirmed_by: IDS.pranab, confirmed_at: daysAgo(18), created_at: monthTs(MONTHS[LAST - 1], 22) },
    { id: nid('e5000000'), material_id: mId(3),  from_site_id: IDS.site1, to_site_id: IDS.site3, tenant_id: IDS.tenant,
      quantity: 30, lr_number: 'TR-1002', lr_date: daysAgo(9), vehicle_number: 'ML-05-C-2210',
      status: 'pending', initiated_by: IDS.pranab, created_at: daysAgo(9) },
    { id: nid('e5000000'), material_id: mId(12), from_site_id: IDS.site2, to_site_id: IDS.site1, tenant_id: IDS.tenant,
      quantity: 80, lr_number: 'TR-1003', lr_date: daysAgo(30), vehicle_number: 'MN-01-A-9087',
      status: 'confirmed', initiated_by: IDS.pranab, confirmed_by: IDS.pranab, confirmed_at: daysAgo(28), created_at: monthTs(MONTHS[LAST - 2], 15) },
  ])
  console.log('   ✓ 3 transfers')

  // ── 7. Equipment assets ──────────────────────────────────────────────────────
  console.log('7. Upserting equipment assets…')
  await up('equipment_assets', [
    { id: nid('e6000000'), asset_code: 'EQ-00001', material_id: mId(9),  site_id: IDS.site1, tenant_id: IDS.tenant,
      serial_number: 'CM-2023-8841', make: 'Universal', model: 'UCE-10/7', year_of_mfg: 2023, purchase_date: '2024-02-15',
      purchase_cost: 185000, supplier: 'Universal Construction Equip.', status: 'in_use',
      current_assignee_id: IDS.merina, current_assignee_name: 'Merina Devi', current_zone: 'Bridge abutment Km 6.3', created_by: IDS.rajiv },
    { id: nid('e6000000'), asset_code: 'EQ-00002', material_id: mId(9),  site_id: IDS.site1, tenant_id: IDS.tenant,
      serial_number: 'CM-2023-8842', make: 'Universal', model: 'UCE-10/7', year_of_mfg: 2023, purchase_date: '2024-02-15',
      purchase_cost: 185000, supplier: 'Universal Construction Equip.', status: 'available', created_by: IDS.rajiv },
    { id: nid('e6000000'), asset_code: 'EQ-00003', material_id: mId(9),  site_id: IDS.site1, tenant_id: IDS.tenant,
      serial_number: 'CM-2022-5510', make: 'Universal', model: 'UCE-10/7', year_of_mfg: 2022, purchase_date: '2023-11-01',
      purchase_cost: 178000, supplier: 'Universal Construction Equip.', status: 'maintenance', notes: 'Gearbox overhaul', created_by: IDS.rajiv },
    { id: nid('e6000000'), asset_code: 'EQ-00004', material_id: mId(19), site_id: IDS.site2, tenant_id: IDS.tenant,
      serial_number: 'VPC-2024-1190', make: 'Wacker', model: 'WP1550', year_of_mfg: 2024, purchase_date: '2024-07-20',
      purchase_cost: 95000, supplier: 'NE Equipment Rentals, Imphal', status: 'in_use',
      current_assignee_id: IDS.pranab, current_assignee_name: 'Pranab Gogoi', current_zone: 'Block-C plinth', created_by: IDS.rajiv },
    { id: nid('e6000000'), asset_code: 'EQ-00005', material_id: mId(19), site_id: IDS.site2, tenant_id: IDS.tenant,
      serial_number: 'VPC-2024-1191', make: 'Wacker', model: 'WP1550', year_of_mfg: 2024, purchase_date: '2024-07-20',
      purchase_cost: 95000, supplier: 'NE Equipment Rentals, Imphal', status: 'available', created_by: IDS.rajiv },
  ])
  console.log('   ✓ 5 equipment assets')

  // ── 8. Site expenses ─────────────────────────────────────────────────────────
  console.log('8. Upserting site expenses…')
  const E = [
    [IDS.site1, daysAgo(1),  'fuel',      8500,  'Cash — Merina',  'Diesel for rollers & mixer',     'approved'],
    [IDS.site1, daysAgo(3),  'transport', 14200, 'Cash — Pranab',  'Aggregate haulage from quarry',  'approved'],
    [IDS.site1, daysAgo(4),  'food',      3200,  'Cash — Merina',  'Labour lunch (38 workers)',      'approved'],
    [IDS.site1, daysAgo(2),  'repairs',   6700,  'UPI — Pranab',   'Mixer gearbox repair',           'pending'],
    [IDS.site1, daysAgo(6),  'rentals',   22000, 'Bank — BuildNE', 'Bitumen distributor weekly rent','approved'],
    [IDS.site1, daysAgo(12), 'fuel',      9100,  'Cash — Merina',  'Diesel top-up',                  'approved'],
    [IDS.site1, daysAgo(18), 'misc',      2800,  'Cash — Merina',  'Barricade tape & cones',         'approved'],
    [IDS.site2, daysAgo(1),  'fuel',      4100,  'Cash — Pranab',  'Genset diesel',                  'approved'],
    [IDS.site2, daysAgo(2),  'transport', 9800,  'Cash — Pranab',  'Brick cartage from Kakching',    'pending'],
    [IDS.site2, daysAgo(5),  'misc',      1500,  'Cash — Pranab',  'Safety helmets & gloves',        'approved'],
    [IDS.site2, daysAgo(7),  'advances',  15000, 'Bank — BuildNE', 'Mason advance — Thoiba',         'approved'],
    [IDS.site2, daysAgo(14), 'rentals',   12000, 'Bank — BuildNE', 'Scaffolding rental',             'approved'],
    [IDS.site3, daysAgo(3),  'transport', 18500, 'Bank — BuildNE', 'Piling rig mobilisation',        'pending'],
    [IDS.site3, daysAgo(8),  'rentals',   35000, 'Bank — BuildNE', 'Piling rig weekly rent',         'approved'],
    [IDS.site3, daysAgo(10), 'food',      2400,  'Cash — Bapdor',  'Crew meals',                     'rejected'],
    [IDS.site3, daysAgo(20), 'misc',      5600,  'Cash — Bapdor',  'Survey instruments rental',      'approved'],
  ]
  await up('site_expenses', E.map((e) => ({
    id: nid('c1000000'), tenant_id: IDS.tenant, site_id: e[0], expense_date: e[1], category: e[2], amount: e[3],
    paid_by: e[4], note: e[5], status: e[6], created_by: IDS.merina,
    approved_by: e[6] === 'pending' ? null : IDS.rajiv, approved_at: e[6] === 'pending' ? null : `${e[1]}T18:00:00`,
  })))
  console.log(`   ✓ ${E.length} expenses`)

  // ── 9. Attendance (last 30 days, active workers) ─────────────────────────────
  console.log('9. Upserting attendance…')
  const attendance = []
  const active = workers.filter((w) => w.status === 'active')
  for (let d = 29; d >= 0; d--) {
    const date = daysAgo(d)
    active.forEach((w, idx) => {
      const seed = (idx * 7 + d) % 10
      let status = 'present'
      if (seed === 3) status = 'half_day'
      else if (seed === 7) status = 'absent'
      else if (seed === 9) status = 'paid_leave'
      attendance.push({ id: nid('c2000000'), worker_id: w.id, site_id: w.site_id, tenant_id: IDS.tenant, date, status,
        approval_status: 'confirmed', confirmed_by: IDS.pranab, confirmed_at: `${date}T19:00:00`, marked_by: IDS.merina })
    })
  }
  await up('attendance', attendance, 'worker_id,date')
  console.log(`   ✓ ${attendance.length} attendance rows`)

  // ── 10. Tasks + updates ───────────────────────────────────────────────────────
  console.log('10. Upserting tasks…')
  const T = [
    [tId(1),  IDS.site1, 'Complete BC seal coat Ch.2+500–2+900', 'Bituminous concrete final layer + rolling', 'profile', IDS.merina, 'in_progress', 'high',   daysAgo(3),  daysAgo(-1)],
    [tId(2),  IDS.site1, 'Drain pipe laying LHS Ch.3+000–3+600', '600mm RCC pipes with CC bedding',           'profile', IDS.merina, 'done',        'normal', daysAgo(8),  daysAgo(2)],
    [tId(3),  IDS.site1, 'Bridge abutment curing — Km 6.3',      '14-day water curing schedule',              'worker',  wId(1),     'in_progress', 'normal', daysAgo(4),  daysAgo(-10)],
    [tId(4),  IDS.site1, 'Patch surface irregularity Ch.2+750',  'Snagging from PWD inspection',              'worker',  wId(3),     'pending',     'high',   daysAgo(0),  daysAgo(-1)],
    [tId(5),  IDS.site1, 'Reinstate service road Furkating jn',  '120 m length',                              'profile', IDS.merina, 'submitted',   'normal', daysAgo(1),  daysAgo(0)],
    [tId(6),  IDS.site1, 'Lay GSB Ch.5+000–5+400',               'Granular sub-base, 2 layers',               'worker',  wId(11),    'in_progress', 'normal', daysAgo(2),  daysAgo(-3)],
    [tId(7),  IDS.site2, '2nd floor slab concrete pour',         'M25, 48 cu m + curing compound',            'profile', IDS.pranab, 'done',        'high',   daysAgo(5),  daysAgo(1)],
    [tId(8),  IDS.site2, 'Brick masonry 1st floor west wing',    '230mm walls, 900 sqft',                     'worker',  wId(13),    'in_progress', 'normal', daysAgo(2),  daysAgo(-4)],
    [tId(9),  IDS.site2, 'Plumbing rough-in ground floor',       'PVC 4inch lines + fixtures',                'worker',  wId(16),    'pending',     'low',    daysAgo(0),  daysAgo(-7)],
    [tId(10), IDS.site2, 'Electrical conduit 2nd floor',         'Concealed conduit before plaster',          'worker',  wId(17),    'blocked',     'high',   daysAgo(3),  daysAgo(-2)],
    [tId(11), IDS.site2, 'Vitrified tile laying — common rooms', '600×600 tiles, 4 rooms',                    'worker',  wId(22),    'pending',     'normal', daysAgo(0),  daysAgo(-9)],
    [tId(12), IDS.site3, 'Foundation piling — bore set 1',       'Casing + boring for 6 piles',               'profile', IDS.pranab, 'in_progress', 'high',   daysAgo(6),  daysAgo(-5)],
    [tId(13), IDS.site3, 'Site clearance & levelling',           'Clear debris, level to FFL',                'worker',  wId(23),    'done',        'normal', daysAgo(15), daysAgo(7)],
    [tId(14), IDS.site3, 'Survey & layout marking',              'Grid lines + benchmark transfer',           'worker',  wId(28),    'done',        'normal', daysAgo(18), daysAgo(12)],
    [tId(15), IDS.site3, 'Piling concrete pour — set 1',         'M30 RMC, 6 piles',                          'profile', IDS.pranab, 'pending',     'high',   daysAgo(0),  daysAgo(-6)],
  ]
  await up('tasks', T.map((t) => ({
    id: t[0], tenant_id: IDS.tenant, site_id: t[1], title: t[2], description: t[3],
    assigned_to_profile: t[4] === 'profile' ? t[5] : null,
    assigned_to_worker:  t[4] === 'worker'  ? t[5] : null,
    assigned_by: IDS.rajiv, status: t[6], priority: t[7], start_date: t[8], due_date: t[9],
    completed_at: t[6] === 'done' ? `${t[9]}T17:00:00` : null,
    confirmed_by: t[6] === 'done' ? IDS.pranab : null,
    confirmed_at: t[6] === 'done' ? `${t[9]}T17:30:00` : null,
  })))
  console.log(`   ✓ ${T.length} tasks`)

  await up('task_updates', [
    { id: nid('f1000000'), task_id: tId(1),  tenant_id: IDS.tenant, site_id: IDS.site1, update_date: daysAgo(1), note: 'BC laid Ch.2+500–2+700, rolling done. Remaining 200 m tomorrow.', created_by: IDS.merina },
    { id: nid('f1000000'), task_id: tId(3),  tenant_id: IDS.tenant, site_id: IDS.site1, update_date: daysAgo(1), note: 'Day-3 curing complete. No cracks observed.', created_by: IDS.merina },
    { id: nid('f1000000'), task_id: tId(8),  tenant_id: IDS.tenant, site_id: IDS.site2, update_date: daysAgo(0), note: '600 sqft completed, 300 sqft pending. Brick stock adequate.', created_by: IDS.pranab },
    { id: nid('f1000000'), task_id: tId(12), tenant_id: IDS.tenant, site_id: IDS.site3, update_date: daysAgo(1), note: '2 of 6 piles bored. Casing for pile-3 in progress.', created_by: IDS.pranab },
  ])
  console.log('   ✓ 4 task updates')

  // ── 11. Daily logs ──────────────────────────────────────────────────────────
  console.log('11. Upserting daily logs…')
  const L = [
    [IDS.site1, daysAgo(6), 8,  'Earthwork cutting Ch.4+200–4+600. Sub-grade prep + compaction. 320 cu m.', 'Soft soil at Ch.4+380; geotextile ordered.', 'Partly cloudy, showers 14:00–15:30.', IDS.merina],
    [IDS.site1, daysAgo(5), 9,  'WMM laying Ch.3+800–4+100, 300 m. 8 roller passes. Camber 2.5%.', null, 'Clear, hot, 33°C.', IDS.merina],
    [IDS.site1, daysAgo(4), 7,  'Bridge abutment RCC Km 6.3: formwork, 8 MT TMT, 24 cu m M30 poured.', 'Mixer breakdown 2 hrs; manual mixing.', 'Overcast, light drizzle.', IDS.merina],
    [IDS.site1, daysAgo(3), 10, 'Prime coat Ch.2+500–3+200. DBM laying started 400 m.', null, 'Sunny, ideal paving.', IDS.merina],
    [IDS.site1, daysAgo(2), 9,  'Drain pipe laying LHS Ch.3+000–3+600. Slope pitching Ch.5+000.', 'Hemanta Bora fever; sent home.', 'Partly cloudy.', IDS.merina],
    [IDS.site1, daysAgo(1), 10, 'BC seal coat Ch.2+500–2+900 laid + rolled. Barricades checked.', null, 'Clear, sunny.', IDS.merina],
    [IDS.site1, daysAgo(0), 8,  'QC inspection w/ PWD. Core samples Ch.2+600/2+800/3+000. Service road reinstatement 120 m.', 'Snag at Ch.2+750 flagged for patch.', 'Morning fog cleared 08:30.', IDS.merina],
    [IDS.site2, daysAgo(2), 7,  '2nd floor slab formwork (Grid 3–6). Reinforcement binding 200 sqm.', null, 'Intermittent drizzle.', IDS.pranab],
    [IDS.site2, daysAgo(1), 8,  '2nd floor slab poured M25 48 cu m. Curing compound applied.', 'RMC truck 45 min late.', 'Clear, moderate.', IDS.pranab],
    [IDS.site2, daysAgo(0), 6,  'Brick masonry 1st floor west wing 900 sqft. Slab day-2 curing.', null, 'Partly cloudy, cool.', IDS.pranab],
    [IDS.site3, daysAgo(1), 5,  'Pile boring set-1: 2 of 6 piles complete. Casing for pile-3.', null, 'Foggy hills, dry.', IDS.pranab],
    [IDS.site3, daysAgo(4), 6,  'Site levelling to FFL. Benchmark transfer + grid layout.', null, 'Clear, cool.', IDS.pranab],
  ]
  await up('daily_logs', L.map((l) => ({
    id: nid('d1000000'), tenant_id: IDS.tenant, site_id: l[0], log_date: l[1], workers_present: l[2],
    work_done: l[3], issues: l[4], weather: l[5], created_by: l[6], approval_status: 'confirmed', confirmed_by: IDS.pranab,
  })))
  console.log(`   ✓ ${L.length} daily logs`)

  // ── 12. Sub-contractors: directory + site assignments + daily labour logs ────
  console.log('12. Upserting sub-contractors…')
  const SUBS = [
    [subId(1), 'Sharma Electrical Works',   'Electrical',    '9864011220'],
    [subId(2), 'Borah Plumbing & Sanitary', 'Plumbing',      '9954033112'],
    [subId(3), 'Das Waterproofing Co.',     'Waterproofing', '8638044556'],
    [subId(4), 'Nongrum Civil Contractors', 'Masonry',       '9436120045'],
    [subId(5), 'Imphal Fabrication Unit',   'Fabrication',   '7969021304'],
  ]
  await up('subcontractors', SUBS.map((s) => ({
    id: s[0], tenant_id: IDS.tenant, name: s[1], type: s[2], phone: s[3], created_by: IDS.rajiv,
  })))
  console.log(`   ✓ ${SUBS.length} sub-contractors`)

  // many-to-many sc ↔ site
  const SCSA = [
    [subId(1), IDS.site1], [subId(1), IDS.site2],
    [subId(2), IDS.site2],
    [subId(3), IDS.site2], [subId(3), IDS.site3],
    [subId(4), IDS.site3],
    [subId(5), IDS.site2],
  ]
  await up('subcontractor_site_assignments', SCSA.map((a) => ({
    id: nid('5ca00000'), tenant_id: IDS.tenant, subcontractor_id: a[0], site_id: a[1],
  })), 'site_id,subcontractor_id')
  console.log(`   ✓ ${SCSA.length} sub-contractor site assignments`)

  // daily labour headcount logs (unique per site+sc+date; counts[0] = today, [1] = yesterday…)
  const scLogs = []
  const SC_LOG_PLAN = [
    [subId(1), IDS.site1, [6, 5, 7, 6]],
    [subId(1), IDS.site2, [4, 4, 5]],
    [subId(2), IDS.site2, [3, 3, 4, 2]],
    [subId(3), IDS.site2, [5, 6]],
    [subId(3), IDS.site3, [4, 5, 4]],
    [subId(4), IDS.site3, [8, 7, 9, 8, 6]],
    [subId(5), IDS.site2, [3, 4, 3]],
  ]
  SC_LOG_PLAN.forEach(([sc, site, counts]) => {
    counts.forEach((hc, di) => {
      scLogs.push({
        id: nid('5cd00000'), tenant_id: IDS.tenant, site_id: site, subcontractor_id: sc,
        date: daysAgo(di), headcount: hc,
        notes: di === 0 ? 'On site today' : null, logged_by: IDS.merina,
      })
    })
  })
  await up('subcontractor_daily_logs', scLogs, 'site_id,subcontractor_id,date')
  console.log(`   ✓ ${scLogs.length} sub-contractor daily logs`)

  console.log('\n✅ Demo data populated across ALL modules.')
  console.log('\nLogin accounts (unchanged):')
  console.log('  superadmin  : karun@consne.in   / Karun@SuperAdmin1')
  console.log('  contractor  : rajiv@buildne.in  / BuildNE@2024!')
  console.log('  site_manager: pranab@buildne.in / BuildNE@2024!')
  console.log('  supervisor  : merina@buildne.in / BuildNE@2024!')
  console.log('  store_keeper: biplab@buildne.in / BuildNE@2024!')
  if (!CLEAN_LEGACY) console.log('\nℹ Ran in safe mode (no deletes). To clear the original random-UUID demo rows once, re-run with CLEAN_LEGACY=1.')
}

run().catch((e) => { console.error('❌', e.message); process.exit(1) })
