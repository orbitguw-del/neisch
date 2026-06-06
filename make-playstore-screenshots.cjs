'use strict'
// Generates 5 additional Play Store screenshots in the same SVG-mockup style
// as scripts/screenshots.cjs (1080×1920, terracotta + sand + sage brand).
//
// Total store-listing screenshots after this runs: 8 (3 existing + 5 new).
//
// Run:  node make-playstore-screenshots.cjs
// Out:  screenshot-4-daily-log.jpg
//       screenshot-5-reports.jpg
//       screenshot-6-subcontractors.jpg
//       screenshot-7-tasks.jpg
//       screenshot-8-expenses.jpg

const fs    = require('fs')
const sharp = require('sharp')

const W = 1080, H = 1920
const TERRA = '#B85042', SAND = '#E7E8D1', SAGE = '#A7BEAE'
const WHITE = '#FFFFFF', DARK = '#2C1810', GRAY = '#6B7280'
const LIGHT = '#F9F5F0', BORDER = '#E5E0D8'
const GREEN = '#22C55E', AMBER = '#F59E0B', RED = '#EF4444', BLUE = '#3B82F6'

const defs = `<defs>
  <filter id="card" x="-4%" y="-4%" width="108%" height="116%">
    <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#00000014"/>
  </filter>
</defs>`

function card(x, y, w, h, fill = WHITE, radius = 16) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" filter="url(#card)"/>`
}

function pill(x, y, w, h, fill, text, textColor = WHITE, fontSize = 24) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${fill}"/>
    <text x="${x+w/2}" y="${y+h/2}" font-family="serif" font-size="${fontSize}" fill="${textColor}"
          text-anchor="middle" dominant-baseline="middle" font-weight="bold">${text}</text>`
}

function statusBar() {
  return `
    <rect width="${W}" height="60" fill="${TERRA}"/>
    <text x="54" y="42" font-family="serif" font-size="24" fill="${WHITE}">9:41</text>
    <text x="${W-54}" y="42" font-family="serif" font-size="24" fill="${WHITE}" text-anchor="end">●●●</text>`
}

function bottomNav(active) {
  const items = ['Home', 'Sites', 'Workers', 'Materials', 'Reports']
  const xs = [108, 324, 540, 756, 972]
  const i = items.indexOf(active)
  const indicatorX = i >= 0 ? xs[i] - 40 : -100
  return `
    <rect x="0" y="${H-110}" width="${W}" height="110" fill="${WHITE}" filter="url(#card)"/>
    ${items.map((label, idx) => `
      <text x="${xs[idx]}" y="${H-52}" font-family="serif" font-size="22"
            fill="${idx === i ? TERRA : GRAY}"
            text-anchor="middle" font-weight="${idx === i ? 'bold' : 'normal'}">${label}</text>
    `).join('')}
    <rect x="${indicatorX}" y="${H-106}" width="80" height="4" rx="2" fill="${TERRA}"/>`
}

// ── Screenshot 4: Daily Log with photo ──────────────────────────────────────
function makeDailyLog() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${LIGHT}"/>
  ${statusBar()}

  <!-- Header -->
  <rect width="${W}" height="220" fill="${TERRA}"/>
  <text x="54" y="116" font-family="serif" font-size="40" font-weight="bold" fill="${WHITE}">Daily Site Log</text>
  <text x="54" y="160" font-family="serif" font-size="26" fill="${SAND}">NH-37 Jorhat Bypass · 5 June 2026</text>
  ${pill(54, 182, 180, 52, SAGE, 'Confirmed', DARK, 22)}
  ${pill(250, 182, 200, 52, '#FFFFFF33', 'By Site Manager', WHITE, 22)}

  <!-- Stats row -->
  ${card(40, 260, 320, 130, WHITE)}
  <text x="200" y="330" font-family="serif" font-size="56" font-weight="bold" fill="${TERRA}" text-anchor="middle">12</text>
  <text x="200" y="370" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Workers present</text>

  ${card(380, 260, 320, 130, WHITE)}
  <text x="540" y="330" font-family="serif" font-size="56" font-weight="bold" fill="${TERRA}" text-anchor="middle">3</text>
  <text x="540" y="370" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Sub-contractors</text>

  ${card(720, 260, 320, 130, WHITE)}
  <text x="880" y="330" font-family="serif" font-size="56" font-weight="bold" fill="${TERRA}" text-anchor="middle">4</text>
  <text x="880" y="370" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Photos attached</text>

  <!-- Photo card with simulated site photo -->
  ${card(40, 410, W-80, 600, WHITE, 16)}
  <rect x="60" y="430" width="${W-120}" height="440" rx="12" fill="${SAND}"/>
  <!-- Simulated photo content: gradient + construction-y shapes -->
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#9CC5E8"/>
      <stop offset="100%" stop-color="#E8DCC4"/>
    </linearGradient>
  </defs>
  <rect x="60" y="430" width="${W-120}" height="270" rx="12" fill="url(#sky)"/>
  <!-- Building outline (simulated work-in-progress) -->
  <rect x="200" y="540" width="280" height="160" fill="#A8907A"/>
  <rect x="240" y="580" width="50" height="60" fill="#7A6655"/>
  <rect x="320" y="580" width="50" height="60" fill="#7A6655"/>
  <rect x="400" y="580" width="50" height="60" fill="#7A6655"/>
  <rect x="510" y="490" width="200" height="210" fill="#C2A78F"/>
  <rect x="540" y="540" width="50" height="60" fill="#7A6655"/>
  <rect x="620" y="540" width="50" height="60" fill="#7A6655"/>
  <!-- Ground -->
  <rect x="60" y="700" width="${W-120}" height="170" fill="#9D8B73"/>
  <!-- Crane silhouette -->
  <rect x="750" y="450" width="6" height="250" fill="#5A4A3A"/>
  <rect x="750" y="450" width="180" height="6" fill="#5A4A3A"/>
  <line x1="930" y1="456" x2="930" y2="480" stroke="#5A4A3A" stroke-width="4"/>
  <!-- Date-time burn -->
  <rect x="80" y="820" width="280" height="36" rx="4" fill="#000000AA"/>
  <text x="220" y="845" font-family="monospace" font-size="20" fill="${WHITE}" text-anchor="middle">2026-06-05 09:14 IST</text>

  <!-- Photo caption -->
  <text x="80" y="900" font-family="serif" font-size="24" font-weight="bold" fill="${DARK}">Ground-floor slab — concrete pour 80% done</text>
  <text x="80" y="936" font-family="serif" font-size="22" fill="${GRAY}">Posted by Suresh (Supervisor) · 4 of 4 photos</text>
  <line x1="80" y1="960" x2="${W-80}" y2="960" stroke="${BORDER}" stroke-width="1"/>
  <text x="80" y="990" font-family="serif" font-size="22" fill="${GRAY}">Note: Curing started, expected completion tomorrow EOD.</text>

  <!-- Activity row -->
  ${card(40, 1040, W-80, 380, WHITE)}
  <text x="70" y="1090" font-family="serif" font-size="28" font-weight="bold" fill="${DARK}">Today's activity</text>

  <circle cx="100" cy="1150" r="10" fill="${GREEN}"/>
  <text x="130" y="1158" font-family="serif" font-size="24" fill="${DARK}">Attendance marked for 12 workers</text>

  <circle cx="100" cy="1210" r="10" fill="${GREEN}"/>
  <text x="130" y="1218" font-family="serif" font-size="24" fill="${DARK}">Cement: 40 bags issued to NSC sub-contractor</text>

  <circle cx="100" cy="1270" r="10" fill="${BLUE}"/>
  <text x="130" y="1278" font-family="serif" font-size="24" fill="${DARK}">Daily log submitted for confirmation</text>

  <circle cx="100" cy="1330" r="10" fill="${GREEN}"/>
  <text x="130" y="1338" font-family="serif" font-size="24" fill="${DARK}">Site manager confirmed at 18:32</text>

  ${bottomNav('Home')}
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 96 }).toBuffer()
}

// ── Screenshot 5: Reports + Excel/WhatsApp export ───────────────────────────
function makeReports() {
  // Bar chart card lives at y=600..1020 (h=420).
  // Bars baseline = y=950, max height 280, so tallest bar tops at y=670 (well inside card).
  const bars = [
    { label: 'Mon', h: 150 }, { label: 'Tue', h: 195 }, { label: 'Wed', h: 125 },
    { label: 'Thu', h: 235 }, { label: 'Fri', h: 280 }, { label: 'Sat', h: 180 },
    { label: 'Sun', h: 85 },
  ]
  const barsSvg = bars.map((b, i) => {
    const x = 100 + i * 130
    return `
      <rect x="${x}" y="${950 - b.h}" width="80" height="${b.h}" rx="8" fill="${TERRA}"/>
      <text x="${x + 40}" y="${985}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">${b.label}</text>`
  }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${LIGHT}"/>
  ${statusBar()}

  <rect width="${W}" height="200" fill="${TERRA}"/>
  <text x="54" y="116" font-family="serif" font-size="40" font-weight="bold" fill="${WHITE}">Reports</text>
  <text x="54" y="158" font-family="serif" font-size="26" fill="${SAND}">All sites · 1 — 5 June 2026</text>

  <!-- Tabs row -->
  ${card(40, 220, W-80, 80, WHITE, 12)}
  <text x="120" y="270" font-family="serif" font-size="24" font-weight="bold" fill="${TERRA}" text-anchor="middle">Attendance</text>
  <text x="300" y="270" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Materials</text>
  <text x="450" y="270" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Tasks</text>
  <text x="580" y="270" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Stock</text>
  <text x="720" y="270" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Site</text>
  <text x="870" y="270" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Use</text>
  <line x1="50" y1="295" x2="190" y2="295" stroke="${TERRA}" stroke-width="3"/>

  <!-- Big stat -->
  ${card(40, 330, W-80, 240, WHITE)}
  <text x="80" y="395" font-family="serif" font-size="24" fill="${GRAY}">Total worker-days · this week</text>
  <text x="80" y="500" font-family="serif" font-size="108" font-weight="bold" fill="${TERRA}">137</text>
  <text x="${W-80}" y="500" font-family="serif" font-size="30" fill="${GREEN}" text-anchor="end" font-weight="bold">+18% vs last week</text>

  <!-- Bar chart -->
  ${card(40, 600, W-80, 420, WHITE)}
  <text x="80" y="660" font-family="serif" font-size="26" font-weight="bold" fill="${DARK}">Daily attendance</text>
  <line x1="80" y1="950" x2="${W-80}" y2="950" stroke="${BORDER}" stroke-width="1"/>
  ${barsSvg}

  <!-- Export buttons row -->
  ${card(40, 1060, W-80, 350, WHITE)}
  <text x="80" y="1115" font-family="serif" font-size="26" font-weight="bold" fill="${DARK}">Share or export</text>

  <rect x="70" y="1145" width="455" height="110" rx="14" fill="${TERRA}"/>
  <text x="297" y="1187" font-family="serif" font-size="28" font-weight="bold" fill="${WHITE}" text-anchor="middle">📱 Send on WhatsApp</text>
  <text x="297" y="1222" font-family="serif" font-size="20" fill="${SAND}" text-anchor="middle">PDF summary in one tap</text>

  <rect x="555" y="1145" width="455" height="110" rx="14" fill="${WHITE}" stroke="${TERRA}" stroke-width="2.5"/>
  <text x="782" y="1187" font-family="serif" font-size="28" font-weight="bold" fill="${TERRA}" text-anchor="middle">📊 Download Excel</text>
  <text x="782" y="1222" font-family="serif" font-size="20" fill="${GRAY}" text-anchor="middle">Full data, your laptop</text>

  <text x="${W/2}" y="1340" font-family="serif" font-size="24" fill="${GRAY}" text-anchor="middle" font-style="italic">Your data, your decisions — export anytime.</text>

  ${bottomNav('Reports')}
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 96 }).toBuffer()
}

// ── Screenshot 6: Sub-contractors directory + balance ───────────────────────
function makeSubcontractors() {
  const subs = [
    { name: 'NSC Builders',          trade: 'Civil', advance: '₹2,50,000', balance: '₹85,000',  bal_color: AMBER },
    { name: 'Borah Tiles Pvt Ltd',   trade: 'Tiling', advance: '₹1,20,000', balance: '₹0',       bal_color: GREEN },
    { name: 'Bikash Electricals',    trade: 'Electrical', advance: '₹80,000',  balance: '₹40,000',  bal_color: AMBER },
    { name: 'Modern Plumbing Works', trade: 'Plumbing',  advance: '₹60,000',  balance: '₹0',       bal_color: GREEN },
    { name: 'Sharma Steel Fabrics',  trade: 'Steel',     advance: '₹3,80,000', balance: '₹1,20,000', bal_color: RED },
  ]
  const rows = subs.map((s, i) => {
    const y = 480 + i * 200
    return `
      ${card(40, y, W-80, 180, WHITE)}
      <circle cx="120" cy="${y+90}" r="48" fill="${TERRA}" fill-opacity="0.12"/>
      <text x="120" y="${y+100}" font-family="serif" font-size="36" fill="${TERRA}"
            text-anchor="middle" font-weight="bold">${s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</text>
      <text x="200" y="${y+50}" font-family="serif" font-size="30" font-weight="bold" fill="${DARK}">${s.name}</text>
      <text x="200" y="${y+85}" font-family="serif" font-size="22" fill="${GRAY}">${s.trade}</text>
      <line x1="200" y1="${y+100}" x2="${W-60}" y2="${y+100}" stroke="${BORDER}" stroke-width="1"/>
      <text x="200" y="${y+135}" font-family="serif" font-size="20" fill="${GRAY}">Paid so far</text>
      <text x="200" y="${y+165}" font-family="serif" font-size="26" font-weight="bold" fill="${DARK}">${s.advance}</text>
      <text x="600" y="${y+135}" font-family="serif" font-size="20" fill="${GRAY}">Balance due</text>
      <text x="600" y="${y+165}" font-family="serif" font-size="26" font-weight="bold" fill="${s.bal_color}">${s.balance}</text>`
  }).join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${LIGHT}"/>
  ${statusBar()}

  <rect width="${W}" height="220" fill="${TERRA}"/>
  <text x="54" y="116" font-family="serif" font-size="40" font-weight="bold" fill="${WHITE}">Sub-contractors</text>
  <text x="54" y="160" font-family="serif" font-size="26" fill="${SAND}">5 active · ₹8,90,000 paid out</text>
  ${pill(54, 182, 180, 52, '#FFFFFF33', 'All sites', WHITE, 22)}

  <!-- Stat strip -->
  ${card(40, 260, 320, 180, WHITE)}
  <text x="200" y="335" font-family="serif" font-size="56" font-weight="bold" fill="${TERRA}" text-anchor="middle">5</text>
  <text x="200" y="375" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Active sub-contractors</text>
  <text x="200" y="410" font-family="serif" font-size="20" fill="${SAGE}" text-anchor="middle" font-weight="bold">across 3 sites</text>

  ${card(380, 260, 320, 180, WHITE)}
  <text x="540" y="335" font-family="serif" font-size="40" font-weight="bold" fill="${TERRA}" text-anchor="middle">₹2.45L</text>
  <text x="540" y="375" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Balance due</text>
  <text x="540" y="410" font-family="serif" font-size="20" fill="${AMBER}" text-anchor="middle" font-weight="bold">3 pending payments</text>

  ${card(720, 260, 320, 180, WHITE)}
  <text x="880" y="335" font-family="serif" font-size="56" font-weight="bold" fill="${TERRA}" text-anchor="middle">11</text>
  <text x="880" y="375" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Work Orders issued</text>
  <text x="880" y="410" font-family="serif" font-size="20" fill="${GREEN}" text-anchor="middle" font-weight="bold">2 variations logged</text>

  ${rows}

  ${bottomNav('Workers')}
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 96 }).toBuffer()
}

// ── Screenshot 7: Tasks (the cascade) ───────────────────────────────────────
function makeTasks() {
  const tasks = [
    { title: 'Lay ground floor slab',          assignee: 'Suresh (Supervisor)',  due: 'Today',      status: 'In progress', color: AMBER },
    { title: 'Plaster work — first floor',     assignee: 'NSC Builders',         due: 'Tomorrow',   status: 'Assigned',    color: BLUE },
    { title: 'Electrical conduit layout',      assignee: 'Bikash Electricals',   due: 'Jun 7',      status: 'Assigned',    color: BLUE },
    { title: 'Sand delivery confirmation',     assignee: 'Biplab (Store Keeper)',due: 'Yesterday',  status: '2 days late', color: RED },
    { title: 'Curing — slab section A',         assignee: 'Suresh (Supervisor)',  due: 'Today',      status: 'Done',        color: GREEN },
    { title: 'Inspect column rebars',           assignee: 'Ravi (Site Manager)',  due: 'Jun 8',      status: 'Assigned',    color: BLUE },
  ]
  const rows = tasks.map((t, i) => {
    const y = 480 + i * 180
    return `
      ${card(40, y, W-80, 160, WHITE)}
      <rect x="40" y="${y}" width="10" height="160" rx="5" fill="${t.color}"/>
      <text x="80" y="${y+50}" font-family="serif" font-size="28" font-weight="bold" fill="${DARK}">${t.title}</text>
      <text x="80" y="${y+90}" font-family="serif" font-size="22" fill="${GRAY}">${t.assignee}</text>
      <text x="80" y="${y+130}" font-family="serif" font-size="22" fill="${GRAY}">Due: ${t.due}</text>
      ${pill(W-220, y+55, 170, 52, t.color + '22', t.status, t.color, 22)}`
  }).join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${LIGHT}"/>
  ${statusBar()}

  <rect width="${W}" height="220" fill="${TERRA}"/>
  <text x="54" y="116" font-family="serif" font-size="40" font-weight="bold" fill="${WHITE}">Tasks</text>
  <text x="54" y="160" font-family="serif" font-size="26" fill="${SAND}">NH-37 Jorhat · contractor view</text>
  ${pill(54,  182, 180, 52, '#22C55E33', '1 Done',     WHITE, 22)}
  ${pill(250, 182, 200, 52, '#F59E0B33', '2 Pending',  WHITE, 22)}
  ${pill(466, 182, 200, 52, '#EF444433', '1 Overdue',  WHITE, 22)}

  <!-- "Assign to" hierarchy hint -->
  ${card(40, 260, W-80, 180, WHITE)}
  <text x="80" y="310" font-family="serif" font-size="26" font-weight="bold" fill="${DARK}">Assign down the chain</text>
  <text x="80" y="350" font-family="serif" font-size="22" fill="${GRAY}">Contractor → Site Manager → Supervisor → Worker / Sub-contractor</text>

  <circle cx="120" cy="400" r="22" fill="${TERRA}"/><text x="120" y="408" font-family="serif" font-size="22" font-weight="bold" fill="${WHITE}" text-anchor="middle">C</text>
  <line x1="148" y1="400" x2="220" y2="400" stroke="${GRAY}" stroke-width="2"/>
  <circle cx="248" cy="400" r="22" fill="${SAGE}"/><text x="248" y="408" font-family="serif" font-size="22" font-weight="bold" fill="${DARK}" text-anchor="middle">SM</text>
  <line x1="276" y1="400" x2="348" y2="400" stroke="${GRAY}" stroke-width="2"/>
  <circle cx="376" cy="400" r="22" fill="${BLUE}" fill-opacity="0.8"/><text x="376" y="408" font-family="serif" font-size="22" font-weight="bold" fill="${WHITE}" text-anchor="middle">SV</text>
  <line x1="404" y1="400" x2="476" y2="400" stroke="${GRAY}" stroke-width="2"/>
  <circle cx="504" cy="400" r="22" fill="${AMBER}"/><text x="504" y="408" font-family="serif" font-size="22" font-weight="bold" fill="${WHITE}" text-anchor="middle">W</text>

  ${rows}

  ${bottomNav('Home')}
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 96 }).toBuffer()
}

// ── Screenshot 8: Expenses with approval ────────────────────────────────────
function makeExpenses() {
  const items = [
    { label: 'Diesel — generator',  amount: '₹4,200',  status: 'Approved', color: GREEN },
    { label: 'Lunch for crew (12)', amount: '₹1,800',  status: 'Approved', color: GREEN },
    { label: 'Concrete vibrator hire', amount: '₹3,500', status: 'Pending', color: AMBER },
    { label: 'JCB driver wages',     amount: '₹2,000',  status: 'Approved', color: GREEN },
    { label: 'Site board paint',     amount: '₹950',    status: 'Approved', color: GREEN },
    { label: 'Misc tooling',         amount: '₹6,200',  status: 'Rejected', color: RED },
  ]
  const rows = items.map((e, i) => {
    const y = 540 + i * 160
    return `
      ${card(40, y, W-80, 140, WHITE)}
      <text x="80" y="${y+50}" font-family="serif" font-size="28" font-weight="bold" fill="${DARK}">${e.label}</text>
      <text x="80" y="${y+90}" font-family="serif" font-size="22" fill="${GRAY}">Site Supervisor · 5 June</text>
      <text x="${W-80}" y="${y+50}" font-family="serif" font-size="32" font-weight="bold" fill="${DARK}" text-anchor="end">${e.amount}</text>
      ${pill(W-220, y+74, 170, 48, e.color + '22', e.status, e.color, 22)}`
  }).join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${LIGHT}"/>
  ${statusBar()}

  <rect width="${W}" height="220" fill="${TERRA}"/>
  <text x="54" y="116" font-family="serif" font-size="40" font-weight="bold" fill="${WHITE}">Site Expenses</text>
  <text x="54" y="160" font-family="serif" font-size="26" fill="${SAND}">NH-37 Jorhat · this week</text>
  ${pill(54, 182, 200, 52, '#FFFFFF33', '₹18,650 spent', WHITE, 22)}

  <!-- Big number card -->
  ${card(40, 260, W-80, 250, WHITE)}
  <text x="80" y="320" font-family="serif" font-size="24" fill="${GRAY}">Spent this week · NH-37</text>
  <text x="80" y="430" font-family="serif" font-size="100" font-weight="bold" fill="${TERRA}">₹18,650</text>
  <text x="${W-100}" y="380" font-family="serif" font-size="22" fill="${AMBER}" text-anchor="end" font-weight="bold">2 pending approval</text>
  <text x="${W-100}" y="420" font-family="serif" font-size="22" fill="${RED}" text-anchor="end" font-weight="bold">1 rejected</text>
  <text x="${W-100}" y="460" font-family="serif" font-size="22" fill="${GREEN}" text-anchor="end" font-weight="bold">3 approved</text>

  ${rows}

  ${bottomNav('Home')}
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 96 }).toBuffer()
}

async function main() {
  const start = Date.now()
  const [b4, b5, b6, b7, b8] = await Promise.all([
    makeDailyLog(),
    makeReports(),
    makeSubcontractors(),
    makeTasks(),
    makeExpenses(),
  ])
  const out = [
    ['screenshot-4-daily-log.jpg',       b4],
    ['screenshot-5-reports.jpg',         b5],
    ['screenshot-6-subcontractors.jpg',  b6],
    ['screenshot-7-tasks.jpg',           b7],
    ['screenshot-8-expenses.jpg',        b8],
  ]
  console.log('Saving 5 Play Store screenshots:\n')
  out.forEach(([name, buf]) => {
    fs.writeFileSync(`C:\\consne\\${name}`, buf)
    console.log(`  C:\\consne\\${name}  ${(buf.length/1024).toFixed(0)} KB`)
  })
  console.log(`\nDone in ${((Date.now()-start)/1000).toFixed(1)}s. Existing 1-3 unchanged.`)
}

main().catch(e => { console.error(e); process.exit(1) })
