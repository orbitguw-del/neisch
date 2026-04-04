const PptxGenJS = require('pptxgenjs')
const pptx = new PptxGenJS()

pptx.layout = 'LAYOUT_WIDE'
pptx.title = 'ConsNE — Construction Site Management Platform'

// ── Colors ──────────────────────────────────────────────────────────────────
const BRAND   = '0284C7'
const BRAND_L = 'E0F2FE'
const EARTH   = 'A16207'
const EARTH_L = 'FEF3C7'
const DARK    = '1E293B'
const MID     = '475569'
const LIGHT   = 'F1F5F9'
const WHITE   = 'FFFFFF'
const GREEN   = '16A34A'
const GREEN_L = 'DCFCE7'
const PURPLE  = '7C3AED'
const PURPLE_L= 'EDE9FE'
const AMBER   = 'D97706'
const AMBER_L = 'FEF3C7'
const RED     = 'DC2626'
const RED_L   = 'FEE2E2'
const SLATE   = 'CBD5E1'

function slideLight(title, fn) {
  const s = pptx.addSlide()
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: 'F8FAFC' } })
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.05, fill: { color: DARK } })
  s.addText(title, { x: 0.4, y: 0.15, w: 12.2, h: 0.72, fontSize: 24, bold: true, color: WHITE, fontFace: 'Calibri' })
  fn(s)
  return s
}

function card(s, x, y, w, h, color, lightColor, title, lines) {
  s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: lightColor }, line: { color, width: 1.5 }, rectRadius: 0.08 })
  s.addText(title, { x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.38, fontSize: 13, bold: true, color, fontFace: 'Calibri' })
  const body = lines.map(l => ({ text: l, options: { bullet: { type: 'bullet' }, fontSize: 10.5, color: DARK, fontFace: 'Calibri', paraSpaceAfter: 3 } }))
  s.addText(body, { x: x + 0.15, y: y + 0.54, w: w - 0.3, h: h - 0.66 })
}

// ── Slide 1: Title ───────────────────────────────────────────────────────────
{
  const s = pptx.addSlide()
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: DARK } })
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 3.1, w: '100%', h: 0.07, fill: { color: BRAND } })
  s.addText('ConsNE', { x: 1, y: 0.55, w: 11, h: 1.5, fontSize: 72, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center' })
  s.addText('Construction Site Management Platform', { x: 1, y: 2.05, w: 11, h: 0.65, fontSize: 26, color: BRAND, fontFace: 'Calibri', align: 'center' })
  s.addText('Built for Northeast India Contractors', { x: 1, y: 2.7, w: 11, h: 0.45, fontSize: 16, color: '94A3B8', fontFace: 'Calibri', align: 'center' })
  s.addText('Assam  Manipur  Meghalaya  Nagaland  Mizoram  Tripura  Arunachal Pradesh', {
    x: 1, y: 3.3, w: 11, h: 0.4, fontSize: 13, color: '64748B', fontFace: 'Calibri', align: 'center'
  })
  const roles = [
    { label: 'Superadmin', color: PURPLE },
    { label: 'Contractor', color: BRAND },
    { label: 'Site Manager', color: EARTH },
    { label: 'Supervisor', color: GREEN },
    { label: 'Store Keeper', color: AMBER },
  ]
  roles.forEach((r, i) => {
    const x = 1.0 + i * 2.3
    s.addShape(pptx.ShapeType.rect, { x, y: 3.9, w: 2.05, h: 0.55, fill: { color: r.color }, rectRadius: 0.07 })
    s.addText(r.label, { x, y: 3.9, w: 2.05, h: 0.55, fontSize: 12.5, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' })
  })
  s.addText('5-Role RBAC  |  Multi-Tenant  |  Supabase RLS  |  React 18 + Vite', {
    x: 1, y: 4.65, w: 11, h: 0.35, fontSize: 11, color: '64748B', fontFace: 'Calibri', align: 'center'
  })
}

// ── Slide 2: What is ConsNE ──────────────────────────────────────────────────
slideLight('What is ConsNE?', (s) => {
  s.addText('A cloud-based SaaS platform that helps construction firms in NE India manage sites, workers, materials, and daily progress from a single dashboard.', {
    x: 0.4, y: 1.15, w: 12.2, h: 0.6, fontSize: 13.5, color: MID, fontFace: 'Calibri', italic: true
  })
  const problems = [
    { title: 'Manual Registers', desc: 'Daily logs in notebooks — no backup, no search', color: RED, lc: RED_L },
    { title: 'No Budget Visibility', desc: 'Material costs in Excel, always outdated', color: EARTH, lc: EARTH_L },
    { title: 'Labour Chaos', desc: 'No digital attendance; wage disputes common', color: AMBER, lc: AMBER_L },
    { title: 'Stock-outs Mid-Project', desc: 'Cement/steel runs out due to poor tracking', color: RED, lc: RED_L },
    { title: 'No Access Control', desc: 'Everyone sees everything — no role separation', color: PURPLE, lc: PURPLE_L },
  ]
  problems.forEach((p, i) => {
    const col = i < 3 ? i : i - 3
    const row = i < 3 ? 0 : 1
    const x = i < 3 ? 0.35 + col * 4.1 : 2.45 + col * 4.1
    const y = 1.95 + row * 1.35
    s.addShape(pptx.ShapeType.rect, { x, y, w: 3.85, h: 1.15, fill: { color: p.lc }, line: { color: p.color, width: 1.2 }, rectRadius: 0.07 })
    s.addText(p.title, { x: x + 0.15, y: y + 0.1, w: 3.55, h: 0.35, fontSize: 12, bold: true, color: p.color, fontFace: 'Calibri' })
    s.addText(p.desc, { x: x + 0.15, y: y + 0.48, w: 3.55, h: 0.55, fontSize: 10.5, color: DARK, fontFace: 'Calibri' })
  })
  s.addShape(pptx.ShapeType.rect, { x: 0.35, y: 4.65, w: 12.3, h: 0.6, fill: { color: BRAND }, rectRadius: 0.08 })
  s.addText('ConsNE solves all of this — digitally, in INR, for NE India contractors', {
    x: 0.35, y: 4.65, w: 12.3, h: 0.6, fontSize: 15, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle'
  })
})

// ── Slide 3: Role System ─────────────────────────────────────────────────────
slideLight('5-Role Access Control System', (s) => {
  s.addText('Every user gets exactly the access their job requires — no more, no less', {
    x: 0.4, y: 1.12, w: 12.2, h: 0.42, fontSize: 13, color: MID, fontFace: 'Calibri', italic: true
  })
  const roles = [
    { color: PURPLE, lc: PURPLE_L, role: 'Superadmin', name: 'Karun Baruah', scope: 'Platform-wide', access: ['View all tenants & companies', 'Platform KPIs & analytics', 'No tenant restriction (RLS bypass)', 'Manage any data'] },
    { color: BRAND,  lc: BRAND_L,  role: 'Contractor', name: 'Rajiv Nath', scope: 'Own company only', access: ['Create & manage all sites', 'Hire workers, track budgets', 'Assign team members to sites', 'View all reports & logs'] },
    { color: EARTH,  lc: EARTH_L,  role: 'Site Manager', name: 'Pranab Gogoi', scope: 'Assigned sites only', access: ['Manage workers on assigned sites', 'Update materials & inventory', 'File daily progress logs', 'Cannot see other sites'] },
    { color: GREEN,  lc: GREEN_L,  role: 'Supervisor', name: 'Merina Devi', scope: 'Assigned sites only', access: ['File daily logs & attendance', 'View workers on assigned site', 'Cannot manage materials', 'Cannot create sites'] },
    { color: AMBER,  lc: AMBER_L,  role: 'Store Keeper', name: 'Biplab Das', scope: 'Assigned sites only', access: ['Track material inventory', 'Set reorder thresholds', 'Low-stock alerts', 'Cannot manage workers'] },
  ]
  roles.forEach((r, i) => {
    const x = 0.35 + i * 2.52
    s.addShape(pptx.ShapeType.rect, { x, y: 1.65, w: 2.35, h: 3.45, fill: { color: r.lc }, line: { color: r.color, width: 1.5 }, rectRadius: 0.08 })
    s.addShape(pptx.ShapeType.rect, { x, y: 1.65, w: 2.35, h: 0.75, fill: { color: r.color }, rectRadius: 0.08 })
    s.addText(r.role, { x, y: 1.65, w: 2.35, h: 0.4, fontSize: 13, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' })
    s.addText(r.scope, { x, y: 2.05, w: 2.35, h: 0.32, fontSize: 9.5, color: WHITE, fontFace: 'Calibri', align: 'center' })
    s.addText(r.name, { x: x + 0.1, y: 2.5, w: 2.15, h: 0.3, fontSize: 10, bold: true, color: r.color, fontFace: 'Calibri' })
    const bullets = r.access.map(a => ({ text: '- ' + a, options: { fontSize: 9.5, color: DARK, fontFace: 'Calibri', paraSpaceAfter: 4 } }))
    s.addText(bullets, { x: x + 0.1, y: 2.82, w: 2.15, h: 2.15 })
  })
})

// ── Slide 4: Platform Workflow ───────────────────────────────────────────────
slideLight('End-to-End Platform Workflow', (s) => {
  const steps = [
    { n: '1', label: 'Contractor\nRegisters', color: BRAND, x: 0.3 },
    { n: '2', label: 'Creates\nSites', color: BRAND, x: 2.5 },
    { n: '3', label: 'Assigns\nTeam', color: EARTH, x: 4.7 },
    { n: '4', label: 'Workers\nEnrolled', color: GREEN, x: 6.9 },
    { n: '5', label: 'Materials\nTracked', color: AMBER, x: 9.1 },
    { n: '6', label: 'Daily\nLogs Filed', color: GREEN, x: 11.3 },
  ]
  steps.forEach((st, i) => {
    s.addShape(pptx.ShapeType.ellipse, { x: st.x, y: 1.3, w: 1.85, h: 1.85, fill: { color: st.color } })
    s.addText(st.n, { x: st.x, y: 1.38, w: 1.85, h: 0.75, fontSize: 28, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center' })
    s.addText(st.label, { x: st.x - 0.08, y: 2.1, w: 2.0, h: 0.58, fontSize: 10, color: WHITE, fontFace: 'Calibri', align: 'center' })
    if (i < steps.length - 1)
      s.addShape(pptx.ShapeType.line, { x: st.x + 1.9, y: 2.2, w: 0.55, h: 0, line: { color: MID, width: 1.5, endArrowType: 'arrow' } })
  })
  const details = [
    { title: 'Setup Phase', color: BRAND, lc: BRAND_L, x: 0.35, items: ['Sign up => auto profile created', 'Create tenant company', 'Add construction sites', 'Set budget + timeline'] },
    { title: 'Team Phase', color: EARTH, lc: EARTH_L, x: 4.4, items: ['Invite site_manager / supervisor', 'Invite store_keeper', 'Assign each to specific sites', 'Role-based access activated'] },
    { title: 'Operations Phase', color: GREEN, lc: GREEN_L, x: 8.45, items: ['Workers added per site', 'Materials stocked + reorder set', 'Daily logs filed each evening', 'Low-stock alerts triggered'] },
  ]
  details.forEach(d => {
    s.addShape(pptx.ShapeType.rect, { x: d.x, y: 3.55, w: 3.9, h: 1.55, fill: { color: d.lc }, line: { color: d.color, width: 1 }, rectRadius: 0.07 })
    s.addText(d.title, { x: d.x + 0.12, y: 3.62, w: 3.7, h: 0.35, fontSize: 12, bold: true, color: d.color, fontFace: 'Calibri' })
    const b = d.items.map(i => ({ text: '- ' + i, options: { fontSize: 10, color: DARK, fontFace: 'Calibri', paraSpaceAfter: 3 } }))
    s.addText(b, { x: d.x + 0.12, y: 3.98, w: 3.7, h: 1.05 })
  })
})

// ── Slide 5: Contractor Dashboard ───────────────────────────────────────────
slideLight('Contractor Dashboard — Rajiv Nath (BuildNE)', (s) => {
  s.addText('Full company overview — sites, budget, team, and quick actions', {
    x: 0.4, y: 1.12, w: 12.2, h: 0.42, fontSize: 12, color: MID, fontFace: 'Calibri', italic: true
  })
  const kpis = [
    { label: 'Total Sites', value: '3', color: BRAND, lc: BRAND_L },
    { label: 'Active Sites', value: '2', color: GREEN, lc: GREEN_L },
    { label: 'Planning', value: '1', color: AMBER, lc: AMBER_L },
    { label: 'Total Budget', value: 'Rs 3.25 Cr', color: EARTH, lc: EARTH_L },
  ]
  kpis.forEach((k, i) => {
    const x = 0.35 + i * 3.1
    s.addShape(pptx.ShapeType.rect, { x, y: 1.65, w: 2.85, h: 1.1, fill: { color: k.lc }, line: { color: k.color, width: 1.5 }, rectRadius: 0.08 })
    s.addText(k.value, { x, y: 1.72, w: 2.85, h: 0.55, fontSize: 28, bold: true, color: k.color, fontFace: 'Calibri', align: 'center' })
    s.addText(k.label, { x, y: 2.27, w: 2.85, h: 0.35, fontSize: 11, color: MID, fontFace: 'Calibri', align: 'center' })
  })
  const sites = [
    { name: 'NH-37 Extension — Furkating to Mariani', loc: 'Jorhat, Assam', budget: 'Rs 2.40 Cr', status: 'Active', sc: GREEN, slc: GREEN_L },
    { name: 'Manipur University Hostel Block-C', loc: 'Imphal, Manipur', budget: 'Rs 85 L', status: 'Active', sc: GREEN, slc: GREEN_L },
    { name: 'Laitumkhrah Commercial Hub Phase 1', loc: 'Shillong, Meghalaya', budget: 'Rs 4.50 Cr', status: 'Planning', sc: AMBER, slc: AMBER_L },
  ]
  s.addText('Sites', { x: 0.35, y: 2.88, w: 3, h: 0.35, fontSize: 12, bold: true, color: DARK, fontFace: 'Calibri' })
  sites.forEach((site, i) => {
    const y = 3.28 + i * 0.62
    s.addShape(pptx.ShapeType.rect, { x: 0.35, y, w: 7.8, h: 0.54, fill: { color: LIGHT }, line: { color: SLATE, width: 0.5 }, rectRadius: 0.05 })
    s.addText(site.name, { x: 0.5, y: y + 0.07, w: 4.9, h: 0.24, fontSize: 10.5, bold: true, color: DARK, fontFace: 'Calibri' })
    s.addText(site.loc + ' | ' + site.budget, { x: 0.5, y: y + 0.3, w: 4.9, h: 0.2, fontSize: 9.5, color: MID, fontFace: 'Calibri' })
    s.addShape(pptx.ShapeType.rect, { x: 5.6, y: y + 0.12, w: 1.2, h: 0.3, fill: { color: site.slc }, line: { color: site.sc, width: 0.8 }, rectRadius: 0.04 })
    s.addText(site.status, { x: 5.6, y: y + 0.12, w: 1.2, h: 0.3, fontSize: 9, bold: true, color: site.sc, fontFace: 'Calibri', align: 'center', valign: 'middle' })
  })
  const actions = ['+ New Site', 'Team Management', 'Inventory', 'Reports']
  s.addText('Quick Actions', { x: 8.4, y: 2.88, w: 4.2, h: 0.35, fontSize: 12, bold: true, color: DARK, fontFace: 'Calibri' })
  actions.forEach((a, i) => {
    const ay = 3.28 + i * 0.62
    s.addShape(pptx.ShapeType.rect, { x: 8.4, y: ay, w: 4.2, h: 0.54, fill: { color: BRAND_L }, line: { color: BRAND, width: 1 }, rectRadius: 0.06 })
    s.addText(a, { x: 8.4, y: ay, w: 4.2, h: 0.54, fontSize: 12, bold: true, color: BRAND, fontFace: 'Calibri', align: 'center', valign: 'middle' })
  })
})

// ── Slide 6: Site Manager Dashboard ─────────────────────────────────────────
slideLight('Site Manager Dashboard — Pranab Gogoi', (s) => {
  s.addText('Manages NH-37 (Jorhat) and Manipur Hostel — cannot see Laitumkhrah (not assigned)', {
    x: 0.4, y: 1.12, w: 12.2, h: 0.42, fontSize: 12, color: MID, fontFace: 'Calibri', italic: true
  })
  card(s, 0.35, 1.65, 5.9, 3.4, EARTH, EARTH_L, 'Assigned Sites (RLS restricted)',
    ['NH-37 Extension — Furkating to Mariani (Active)',
     'Manipur University Hostel Block-C (Active)',
     '',
     'X  Laitumkhrah Hub — NOT visible (not assigned)',
     '',
     'RLS ensures site_manager only sees sites where',
     'they have a record in site_assignments table'])
  card(s, 6.55, 1.65, 6.1, 1.55, BRAND, BRAND_L, 'Workers',
    ['View and add workers on assigned sites',
     'Update worker status (active / inactive)',
     'Cannot see workers from unassigned sites'])
  card(s, 6.55, 3.35, 6.1, 1.7, GREEN, GREEN_L, 'Daily Logs',
    ['File progress logs for assigned sites',
     'View all logs filed by supervisors',
     'Edit or delete logs on their own sites'])
  s.addShape(pptx.ShapeType.rect, { x: 0.35, y: 5.18, w: 12.3, h: 0.5, fill: { color: EARTH_L }, line: { color: EARTH, width: 1 }, rectRadius: 0.06 })
  s.addText('Sees: Sites  Workers  Materials  Logs  |  Cannot: Other tenants  Unassigned sites  Team management', {
    x: 0.35, y: 5.18, w: 12.3, h: 0.5, fontSize: 10.5, color: EARTH, fontFace: 'Calibri', align: 'center', valign: 'middle'
  })
})

// ── Slide 7: Supervisor Dashboard ────────────────────────────────────────────
slideLight('Supervisor Dashboard — Merina Devi', (s) => {
  s.addText('Files daily construction logs for NH-37 site (Jorhat, Assam)', {
    x: 0.4, y: 1.12, w: 12.2, h: 0.42, fontSize: 12, color: MID, fontFace: 'Calibri', italic: true
  })
  card(s, 0.35, 1.65, 6.1, 1.6, GREEN, GREEN_L, "Today's Log Status",
    ["Today's log filed",
     "Workers present: 8",
     "Quality check inspection with PWD engineer",
     "Core samples taken at Ch. 2+600, 2+800, 3+000"])
  card(s, 6.65, 1.65, 5.95, 1.6, BRAND, BRAND_L, 'Recent Logs (last 7 days)',
    ['Day -1: Seal coat BC laid, 10 workers present',
     'Day -2: Drain pipe laying, health incident noted',
     'Day -3: Bituminous prime coat applied',
     'Day -4: Bridge abutment RCC work completed'])
  card(s, 0.35, 3.45, 6.1, 1.8, AMBER, AMBER_L, 'Filing a Daily Log',
    ['Select site  =>  Select date',
     'Enter workers present count',
     'Describe work done in detail',
     'Note any issues or incidents',
     'Select weather  =>  Submit'])
  card(s, 6.65, 3.45, 5.95, 1.8, RED, RED_L, 'Supervisor Cannot',
    ['Add new sites',
     'Manage materials or inventory',
     'Assign team members to sites',
     'View other tenants data',
     'See unassigned sites'])
})

// ── Slide 8: Store Keeper Dashboard ──────────────────────────────────────────
slideLight('Store Keeper Dashboard — Biplab Das', (s) => {
  s.addText('Manages inventory across all 3 BuildNE sites — assigned to NH-37, Manipur Hostel, and Laitumkhrah', {
    x: 0.4, y: 1.12, w: 12.2, h: 0.42, fontSize: 12, color: MID, fontFace: 'Calibri', italic: true
  })
  const kpis = [
    { label: 'Total Items', value: '22', color: BRAND, lc: BRAND_L },
    { label: 'Low Stock', value: '2', color: RED, lc: RED_L },
    { label: 'Sites Covered', value: '3', color: GREEN, lc: GREEN_L },
    { label: 'Inventory Value', value: 'Rs 68 L+', color: EARTH, lc: EARTH_L },
  ]
  kpis.forEach((k, i) => {
    const x = 0.35 + i * 3.1
    s.addShape(pptx.ShapeType.rect, { x, y: 1.65, w: 2.85, h: 1.0, fill: { color: k.lc }, line: { color: k.color, width: 1.5 }, rectRadius: 0.08 })
    s.addText(k.value, { x, y: 1.72, w: 2.85, h: 0.5, fontSize: 26, bold: true, color: k.color, fontFace: 'Calibri', align: 'center' })
    s.addText(k.label, { x, y: 2.22, w: 2.85, h: 0.3, fontSize: 11, color: MID, fontFace: 'Calibri', align: 'center' })
  })
  s.addShape(pptx.ShapeType.rect, { x: 0.35, y: 2.82, w: 12.3, h: 0.5, fill: { color: RED_L }, line: { color: RED, width: 1 }, rectRadius: 0.06 })
  s.addText('2 items below reorder level at Laitumkhrah — procurement needed', {
    x: 0.35, y: 2.82, w: 12.3, h: 0.5, fontSize: 12.5, bold: true, color: RED, fontFace: 'Calibri', align: 'center', valign: 'middle'
  })
  const headers = ['Material', 'Site', 'Available', 'Reorder At', 'Status']
  const cols = [0.5, 3.6, 6.5, 8.6, 10.6]
  headers.forEach((h, i) => {
    s.addText(h, { x: cols[i], y: 3.48, w: 2.8, h: 0.32, fontSize: 10.5, bold: true, color: MID, fontFace: 'Calibri' })
  })
  const rows = [
    ['OPC 53 Grade Cement', 'Laitumkhrah Hub', '60 bags', '80 bags', 'LOW'],
    ['River Sand', 'Laitumkhrah Hub', '8 cu m', '10 cu m', 'LOW'],
  ]
  rows.forEach((row, ri) => {
    const y = 3.85 + ri * 0.6
    s.addShape(pptx.ShapeType.rect, { x: 0.35, y, w: 12.3, h: 0.52, fill: { color: RED_L }, line: { color: SLATE, width: 0.5 }, rectRadius: 0.04 })
    row.forEach((cell, ci) => {
      if (ci === 4) {
        s.addShape(pptx.ShapeType.rect, { x: cols[ci], y: y + 0.1, w: 1.5, h: 0.3, fill: { color: RED }, rectRadius: 0.04 })
        s.addText(cell, { x: cols[ci], y: y + 0.1, w: 1.5, h: 0.3, fontSize: 9.5, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' })
      } else {
        s.addText(cell, { x: cols[ci], y: y + 0.12, w: 2.8, h: 0.3, fontSize: 10, color: DARK, fontFace: 'Calibri' })
      }
    })
  })
})

// ── Slide 9: Daily Log Workflow ──────────────────────────────────────────────
slideLight('Daily Log Workflow', (s) => {
  s.addText('How supervisors and site managers record site progress every day', {
    x: 0.4, y: 1.12, w: 12.2, h: 0.42, fontSize: 12, color: MID, fontFace: 'Calibri', italic: true
  })
  const flow = [
    { step: '1', title: 'Open Daily Logs', desc: 'Sidebar => Logs\nSelect site', color: GREEN, lc: GREEN_L },
    { step: '2', title: 'Fill Log Form', desc: 'Date, workers present,\nwork done description', color: BRAND, lc: BRAND_L },
    { step: '3', title: 'Add Issues', desc: 'Record incidents, delays\nor material shortages', color: AMBER, lc: AMBER_L },
    { step: '4', title: 'Select Weather', desc: 'Sunny / Cloudy / Rainy\nFoggy / Stormy', color: MID, lc: LIGHT },
    { step: '5', title: 'Submit Log', desc: 'Saved to Supabase,\nvisible to contractor', color: EARTH, lc: EARTH_L },
  ]
  flow.forEach((f, i) => {
    const x = 0.3 + i * 2.62
    s.addShape(pptx.ShapeType.rect, { x, y: 1.65, w: 2.4, h: 2.8, fill: { color: f.lc }, line: { color: f.color, width: 1.5 }, rectRadius: 0.08 })
    s.addShape(pptx.ShapeType.ellipse, { x: x + 0.72, y: 1.78, w: 0.95, h: 0.95, fill: { color: f.color } })
    s.addText(f.step, { x: x + 0.72, y: 1.78, w: 0.95, h: 0.95, fontSize: 20, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' })
    s.addText(f.title, { x: x + 0.1, y: 2.85, w: 2.2, h: 0.42, fontSize: 12, bold: true, color: f.color, fontFace: 'Calibri', align: 'center' })
    s.addText(f.desc, { x: x + 0.1, y: 3.3, w: 2.2, h: 0.78, fontSize: 10.5, color: DARK, fontFace: 'Calibri', align: 'center' })
    if (i < flow.length - 1)
      s.addShape(pptx.ShapeType.line, { x: x + 2.45, y: 3.08, w: 0.12, h: 0, line: { color: MID, width: 1.5, endArrowType: 'arrow' } })
  })
  s.addShape(pptx.ShapeType.rect, { x: 0.35, y: 4.6, w: 12.3, h: 0.95, fill: { color: LIGHT }, line: { color: SLATE, width: 1 }, rectRadius: 0.07 })
  s.addText('Sample Log — NH-37, Today:', { x: 0.5, y: 4.66, w: 3.5, h: 0.3, fontSize: 10.5, bold: true, color: DARK, fontFace: 'Calibri' })
  s.addText('"Quality check inspection with PWD engineer. Core samples taken at Ch. 2+600, 2+800, 3+000. Reinstatement of service road near Furkating junction — 120 m length. Issue: minor surface irregularity at Ch. 2+750 flagged for patch work."', {
    x: 0.5, y: 4.95, w: 11.8, h: 0.52, fontSize: 10, color: MID, fontFace: 'Calibri', italic: true
  })
})

// ── Slide 10: Tech Stack ─────────────────────────────────────────────────────
slideLight('Technology Stack', (s) => {
  const stack = [
    { layer: 'Frontend', color: BRAND, lc: BRAND_L, items: [['React 18 + Vite', 'Fast SPA, runs on port 3000'], ['Tailwind CSS', 'brand (sky) + earth (amber) palette'], ['Zustand', '6 global stores (auth, site, worker...)'], ['React Router v6', 'Role-guarded nested routes']] },
    { layer: 'Backend', color: EARTH, lc: EARTH_L, items: [['Supabase Auth', 'Email/password authentication'], ['PostgreSQL 15', 'Multi-tenant schema with RLS'], ['Row Level Security', '40+ policies, my_role() + my_tenant_id()'], ['PostgREST API', 'Auto-generated REST from schema']] },
    { layer: 'Security', color: RED, lc: RED_L, items: [['RLS Policies', '40+ policies across 7 tables'], ['RoleGuard Component', 'Frontend route-level guard'], ['SECURITY DEFINER', 'my_role() bypasses RLS safely'], ['site_assignments', 'Fine-grained per-site access']] },
    { layer: 'Demo Data', color: GREEN, lc: GREEN_L, items: [['5 demo users', 'One per role, real NE India names'], ['3 NE India sites', 'Real locations, INR budgets'], ['22 workers', 'Authentic NE trades + wages'], ['22 materials + 10 logs', 'Realistic construction data']] },
  ]
  stack.forEach((sec, i) => {
    const x = 0.35 + i * 3.2
    s.addShape(pptx.ShapeType.rect, { x, y: 1.6, w: 3.0, h: 3.6, fill: { color: sec.lc }, line: { color: sec.color, width: 1.5 }, rectRadius: 0.08 })
    s.addShape(pptx.ShapeType.rect, { x, y: 1.6, w: 3.0, h: 0.55, fill: { color: sec.color }, rectRadius: 0.08 })
    s.addText(sec.layer, { x, y: 1.6, w: 3.0, h: 0.55, fontSize: 14, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' })
    sec.items.forEach((item, j) => {
      const iy = 2.28 + j * 0.82
      s.addText(item[0], { x: x + 0.15, y: iy, w: 2.7, h: 0.3, fontSize: 11, bold: true, color: sec.color, fontFace: 'Calibri' })
      s.addText(item[1], { x: x + 0.15, y: iy + 0.3, w: 2.7, h: 0.3, fontSize: 10, color: MID, fontFace: 'Calibri' })
    })
  })
})

// ── Slide 11: Demo Accounts ───────────────────────────────────────────────────
slideLight('Demo Accounts — Try It Now', (s) => {
  s.addText('All accounts belong to BuildNE Infrastructure Pvt. Ltd. (except Karun — platform superadmin)', {
    x: 0.4, y: 1.12, w: 12.2, h: 0.42, fontSize: 12, color: MID, fontFace: 'Calibri', italic: true
  })
  const accounts = [
    { role: 'Superadmin', color: PURPLE, lc: PURPLE_L, email: 'karun@consne.in', pass: 'Karun@SuperAdmin1', see: 'All tenants, platform KPIs, every site across the platform' },
    { role: 'Contractor', color: BRAND, lc: BRAND_L, email: 'rajiv@buildne.in', pass: 'BuildNE@2024!', see: '3 sites, full budget view, team management, all reports' },
    { role: 'Site Manager', color: EARTH, lc: EARTH_L, email: 'pranab@buildne.in', pass: 'BuildNE@2024!', see: 'NH-37 + Manipur Hostel only (Laitumkhrah hidden by RLS)' },
    { role: 'Supervisor', color: GREEN, lc: GREEN_L, email: 'merina@buildne.in', pass: 'BuildNE@2024!', see: 'NH-37 only — daily logs, workers — no materials access' },
    { role: 'Store Keeper', color: AMBER, lc: AMBER_L, email: 'biplab@buildne.in', pass: 'BuildNE@2024!', see: 'All 3 sites inventory, 2 low-stock alerts (Shillong site)' },
  ]
  accounts.forEach((a, i) => {
    const y = 1.67 + i * 0.75
    s.addShape(pptx.ShapeType.rect, { x: 0.35, y, w: 12.3, h: 0.65, fill: { color: a.lc }, line: { color: a.color, width: 1 }, rectRadius: 0.06 })
    s.addShape(pptx.ShapeType.rect, { x: 0.38, y: y + 0.1, w: 1.5, h: 0.42, fill: { color: a.color }, rectRadius: 0.05 })
    s.addText(a.role, { x: 0.38, y: y + 0.1, w: 1.5, h: 0.42, fontSize: 10.5, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' })
    s.addText(a.email, { x: 2.05, y: y + 0.07, w: 3.2, h: 0.28, fontSize: 11, bold: true, color: DARK, fontFace: 'Calibri' })
    s.addText('Password: ' + a.pass, { x: 2.05, y: y + 0.35, w: 3.2, h: 0.22, fontSize: 9.5, color: MID, fontFace: 'Calibri' })
    s.addText(a.see, { x: 5.45, y: y + 0.12, w: 7.1, h: 0.42, fontSize: 10.5, color: DARK, fontFace: 'Calibri', valign: 'middle' })
  })
  s.addShape(pptx.ShapeType.rect, { x: 0.35, y: 5.55, w: 12.3, h: 0.5, fill: { color: DARK }, rectRadius: 0.07 })
  s.addText('http://localhost:3000  |  Start with: npm run dev  |  All data live from Supabase', {
    x: 0.35, y: 5.55, w: 12.3, h: 0.5, fontSize: 12, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle'
  })
})

// ── Save ─────────────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: 'C:/consne/ConsNE_Workflow.pptx' })
  .then(() => console.log('Saved: C:/consne/ConsNE_Workflow.pptx'))
  .catch(e => console.error(e))
