'use strict'
const fs    = require('fs')
const sharp = require('sharp')

const W = 1080, H = 1920
const TERRA = '#B85042', SAND = '#E7E8D1', SAGE = '#A7BEAE'
const WHITE = '#FFFFFF', DARK = '#2C1810', GRAY = '#6B7280'
const LIGHT = '#F9F5F0', BORDER = '#E5E0D8'

function card(x, y, w, h, fill = WHITE, radius = 16) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" filter="url(#card)"/>`
}

function pill(x, y, w, h, fill, text, textColor = WHITE, fontSize = 24) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${fill}"/>
    <text x="${x+w/2}" y="${y+h/2}" font-family="serif" font-size="${fontSize}" fill="${textColor}"
          text-anchor="middle" dominant-baseline="middle" font-weight="bold">${text}</text>`
}

function row(x, y, w, label, value, valueColor = DARK) {
  return `
    <line x1="${x}" y1="${y+52}" x2="${x+w}" y2="${y+52}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${x}" y="${y+34}" font-family="serif" font-size="26" fill="${GRAY}">${label}</text>
    <text x="${x+w}" y="${y+34}" font-family="serif" font-size="28" fill="${valueColor}"
          text-anchor="end" font-weight="bold">${value}</text>`
}

const defs = `<defs>
  <filter id="card" x="-4%" y="-4%" width="108%" height="116%">
    <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#00000014"/>
  </filter>
</defs>`

// ── Screenshot 1: Dashboard ───────────────────────────────────────────────────
function makeDashboard() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${LIGHT}"/>

  <!-- Status bar -->
  <rect width="${W}" height="60" fill="${TERRA}"/>
  <text x="54" y="42" font-family="serif" font-size="24" fill="${WHITE}">9:41</text>
  <text x="${W-54}" y="42" font-family="serif" font-size="24" fill="${WHITE}" text-anchor="end">●●●</text>

  <!-- Header -->
  <rect width="${W}" height="180" fill="${TERRA}"/>
  <text x="54" y="130" font-family="serif" font-size="42" font-weight="bold" fill="${WHITE}">Good morning, Karun</text>
  <text x="54" y="168" font-family="serif" font-size="26" fill="${SAND}" font-style="italic">Wednesday, 14 May 2026</text>

  <!-- Stat cards row -->
  ${card(40, 200, 290, 180, WHITE)}
  <text x="185" y="295" font-family="serif" font-size="72" font-weight="bold" fill="${TERRA}" text-anchor="middle">3</text>
  <text x="185" y="350" font-family="serif" font-size="24" fill="${GRAY}" text-anchor="middle">Active Sites</text>

  ${card(350, 200, 290, 180, WHITE)}
  <text x="495" y="295" font-family="serif" font-size="72" font-weight="bold" fill="${TERRA}" text-anchor="middle">24</text>
  <text x="495" y="350" font-family="serif" font-size="24" fill="${GRAY}" text-anchor="middle">Workers Today</text>

  ${card(660, 200, 380, 180, WHITE)}
  <text x="850" y="295" font-family="serif" font-size="72" font-weight="bold" fill="${TERRA}" text-anchor="middle">98%</text>
  <text x="850" y="350" font-family="serif" font-size="24" fill="${GRAY}" text-anchor="middle">Attendance Rate</text>

  <!-- Sites section -->
  <text x="54" y="440" font-family="serif" font-size="34" font-weight="bold" fill="${DARK}">Your Sites</text>

  ${card(40, 460, W-80, 160, WHITE)}
  <rect x="40" y="460" width="10" height="160" rx="5" fill="${TERRA}"/>
  <text x="80" y="530" font-family="serif" font-size="30" font-weight="bold" fill="${DARK}">NH-37 Jorhat Bypass</text>
  <text x="80" y="572" font-family="serif" font-size="24" fill="${GRAY}">12 workers  •  Site Manager: Ravi</text>
  ${pill(W-180, 490, 120, 44, SAGE, 'Active', DARK, 22)}

  ${card(40, 640, W-80, 160, WHITE)}
  <rect x="40" y="640" width="10" height="160" rx="5" fill="${TERRA}"/>
  <text x="80" y="710" font-family="serif" font-size="30" font-weight="bold" fill="${DARK}">Manipur Univ. Hostel</text>
  <text x="80" y="752" font-family="serif" font-size="24" fill="${GRAY}">8 workers  •  Site Manager: Priya</text>
  ${pill(W-180, 668, 120, 44, SAGE, 'Active', DARK, 22)}

  ${card(40, 820, W-80, 160, WHITE)}
  <rect x="40" y="820" width="10" height="160" rx="5" fill="${TERRA}"/>
  <text x="80" y="890" font-family="serif" font-size="30" font-weight="bold" fill="${DARK}">Laitumkhrah Commercial</text>
  <text x="80" y="932" font-family="serif" font-size="24" fill="${GRAY}">4 workers  •  Site Manager: Aman</text>
  ${pill(W-180, 848, 120, 44, SAGE, 'Active', DARK, 22)}

  <!-- Recent activity -->
  <text x="54" y="1060" font-family="serif" font-size="34" font-weight="bold" fill="${DARK}">Recent Activity</text>

  ${card(40, 1080, W-80, 380, WHITE)}
  ${row(70, 1100, W-140, 'Raju Das — Attendance marked', 'NH-37 Jorhat', TERRA)}
  ${row(70, 1160, W-140, 'Cement 50 bags received', 'Manipur Hostel', TERRA)}
  ${row(70, 1220, W-140, 'Daily log submitted', 'Laitumkhrah', TERRA)}
  ${row(70, 1280, W-140, 'Steel rods transferred', 'NH-37 → Manipur', TERRA)}
  ${row(70, 1340, W-140, 'Mohan Singh — Attendance', 'NH-37 Jorhat', TERRA)}

  <!-- Bottom nav -->
  <rect x="0" y="${H-110}" width="${W}" height="110" fill="${WHITE}" filter="url(#card)"/>
  <text x="108" y="${H-52}" font-family="serif" font-size="22" fill="${TERRA}" text-anchor="middle" font-weight="bold">Home</text>
  <text x="324" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Sites</text>
  <text x="540" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Workers</text>
  <text x="756" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Materials</text>
  <text x="972" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Reports</text>
  <rect x="68" y="${H-106}" width="80" height="4" rx="2" fill="${TERRA}"/>
</svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 96 }).toBuffer()
}

// ── Screenshot 2: Worker Attendance ──────────────────────────────────────────
function makeAttendance() {
  const workers = [
    { name: 'Raju Das',       role: 'Mason',      status: 'Present', color: '#22C55E' },
    { name: 'Mohan Singh',    role: 'Carpenter',  status: 'Present', color: '#22C55E' },
    { name: 'Bikash Bora',    role: 'Helper',     status: 'Present', color: '#22C55E' },
    { name: 'Sanjay Nath',    role: 'Electrician',status: 'Absent',  color: '#EF4444' },
    { name: 'Dilip Kalita',   role: 'Mason',      status: 'Present', color: '#22C55E' },
    { name: 'Hemanta Das',    role: 'Helper',     status: 'Present', color: '#22C55E' },
    { name: 'Ramen Gogoi',    role: 'Plumber',    status: 'Half day',color: '#F59E0B' },
    { name: 'Prasanta Deka',  role: 'Mason',      status: 'Present', color: '#22C55E' },
  ]
  const rows = workers.map((w, i) => {
    const y = 560 + i * 130
    return `
      ${card(40, y, W-80, 115, WHITE)}
      <circle cx="104" cy="${y+58}" r="38" fill="${TERRA}" fill-opacity="0.12"/>
      <text x="104" y="${y+64}" font-family="serif" font-size="30" fill="${TERRA}"
            text-anchor="middle" font-weight="bold">${w.name.split(' ').map(n=>n[0]).join('')}</text>
      <text x="164" y="${y+42}" font-family="serif" font-size="28" font-weight="bold" fill="${DARK}">${w.name}</text>
      <text x="164" y="${y+76}" font-family="serif" font-size="23" fill="${GRAY}">${w.role}</text>
      ${pill(W-200, y+30, 148, 48, w.color + '22', w.status, w.color, 22)}`
  }).join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${LIGHT}"/>
  <rect width="${W}" height="60" fill="${TERRA}"/>
  <text x="54" y="42" font-family="serif" font-size="24" fill="${WHITE}">9:41</text>

  <!-- Header -->
  <rect width="${W}" height="220" fill="${TERRA}"/>
  <text x="54" y="116" font-family="serif" font-size="40" font-weight="bold" fill="${WHITE}">Worker Attendance</text>
  <text x="54" y="160" font-family="serif" font-size="26" fill="${SAND}">NH-37 Jorhat Bypass  •  14 May 2026</text>

  <!-- Summary pills -->
  ${pill(54,  182, 200, 52, '#22C55E22', '10 Present', '#22C55E', 24)}
  ${pill(270, 182, 180, 52, '#EF444422', '2 Absent',   '#EF4444', 24)}
  ${pill(466, 182, 200, 52, '#F59E0B22', '1 Half Day', '#F59E0B', 24)}

  <!-- Search bar -->
  ${card(40, 238, W-80, 72, WHITE, 36)}
  <text x="96" y="282" font-family="serif" font-size="26" fill="${GRAY}">Search workers...</text>

  <!-- Mark all present button -->
  <rect x="40" y="328" width="${W-80}" height="68" rx="12" fill="${TERRA}"/>
  <text x="${W/2}" y="370" font-family="serif" font-size="28" font-weight="bold" fill="${WHITE}"
        text-anchor="middle">Mark All Present</text>

  <!-- Worker rows -->
  ${rows}

  <!-- Bottom nav -->
  <rect x="0" y="${H-110}" width="${W}" height="110" fill="${WHITE}" filter="url(#card)"/>
  <text x="108" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Home</text>
  <text x="324" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Sites</text>
  <text x="540" y="${H-52}" font-family="serif" font-size="22" fill="${TERRA}" text-anchor="middle" font-weight="bold">Workers</text>
  <text x="756" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Materials</text>
  <text x="972" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Reports</text>
  <rect x="500" y="${H-106}" width="80" height="4" rx="2" fill="${TERRA}"/>
</svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 96 }).toBuffer()
}

// ── Screenshot 3: Materials ───────────────────────────────────────────────────
function makeMaterials() {
  const items = [
    { name: 'Cement (OPC 53)',    qty: '240 bags',  status: 'Good',    color: '#22C55E' },
    { name: 'TMT Steel Bars',     qty: '3.2 MT',    status: 'Good',    color: '#22C55E' },
    { name: 'River Sand',         qty: '12 cubic m',status: 'Low',     color: '#F59E0B' },
    { name: 'Bricks (Red)',       qty: '1,200 pcs', status: 'Good',    color: '#22C55E' },
    { name: 'Coarse Aggregate',   qty: '8 cubic m', status: 'Low',     color: '#F59E0B' },
    { name: 'PVC Pipes (4 inch)', qty: '18 pcs',    status: 'Critical',color: '#EF4444' },
    { name: 'Binding Wire',       qty: '22 kg',     status: 'Good',    color: '#22C55E' },
  ]
  const rows = items.map((m, i) => {
    const y = 480 + i * 130
    return `
      ${card(40, y, W-80, 115, WHITE)}
      <text x="70" y="${y+44}" font-family="serif" font-size="28" font-weight="bold" fill="${DARK}">${m.name}</text>
      <text x="70" y="${y+80}" font-family="serif" font-size="24" fill="${GRAY}">In stock: ${m.qty}</text>
      ${pill(W-200, y+30, 148, 48, m.color + '22', m.status, m.color, 22)}`
  }).join('\n')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${LIGHT}"/>
  <rect width="${W}" height="60" fill="${TERRA}"/>
  <text x="54" y="42" font-family="serif" font-size="24" fill="${WHITE}">9:41</text>

  <!-- Header -->
  <rect width="${W}" height="200" fill="${TERRA}"/>
  <text x="54" y="116" font-family="serif" font-size="40" font-weight="bold" fill="${WHITE}">Materials &amp; Inventory</text>
  <text x="54" y="158" font-family="serif" font-size="26" fill="${SAND}">NH-37 Jorhat Bypass</text>

  <!-- Summary -->
  ${pill(54,  178, 200, 52, '#22C55E22', '5 Adequate', '#22C55E', 23)}
  ${pill(270, 178, 170, 52, '#F59E0B22', '2 Low Stock', '#F59E0B', 22)}
  ${pill(456, 178, 200, 52, '#EF444422', '1 Critical',  '#EF4444', 23)}

  <!-- Search -->
  ${card(40, 218, W-80, 72, WHITE, 36)}
  <text x="96" y="262" font-family="serif" font-size="26" fill="${GRAY}">Search materials...</text>

  <!-- Add receipt button -->
  <rect x="40" y="306" width="${(W-100)/2}" height="68" rx="12" fill="${TERRA}"/>
  <text x="${40+(W-100)/4}" y="348" font-family="serif" font-size="26" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">+ Add Receipt</text>

  <rect x="${(W-100)/2+60}" y="306" width="${(W-100)/2}" height="68" rx="12"
        fill="${WHITE}" stroke="${TERRA}" stroke-width="2"/>
  <text x="${(W-100)/2+60+(W-100)/4}" y="348" font-family="serif" font-size="26"
        font-weight="bold" fill="${TERRA}" text-anchor="middle">Transfer</text>

  <!-- Items -->
  ${rows}

  <!-- Bottom nav -->
  <rect x="0" y="${H-110}" width="${W}" height="110" fill="${WHITE}" filter="url(#card)"/>
  <text x="108" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Home</text>
  <text x="324" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Sites</text>
  <text x="540" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Workers</text>
  <text x="756" y="${H-52}" font-family="serif" font-size="22" fill="${TERRA}" text-anchor="middle" font-weight="bold">Materials</text>
  <text x="972" y="${H-52}" font-family="serif" font-size="22" fill="${GRAY}" text-anchor="middle">Reports</text>
  <rect x="716" y="${H-106}" width="80" height="4" rx="2" fill="${TERRA}"/>
</svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 96 }).toBuffer()
}

async function main() {
  const [b1, b2, b3] = await Promise.all([makeDashboard(), makeAttendance(), makeMaterials()])
  fs.writeFileSync('C:\\consne\\screenshot-1-dashboard.jpg', b1)
  fs.writeFileSync('C:\\consne\\screenshot-2-attendance.jpg', b2)
  fs.writeFileSync('C:\\consne\\screenshot-3-materials.jpg', b3)
  console.log('Saved 3 screenshots')
  console.log('  C:\\consne\\screenshot-1-dashboard.jpg', (b1.length/1024).toFixed(0)+'KB')
  console.log('  C:\\consne\\screenshot-2-attendance.jpg', (b2.length/1024).toFixed(0)+'KB')
  console.log('  C:\\consne\\screenshot-3-materials.jpg', (b3.length/1024).toFixed(0)+'KB')
}
main().catch(e => { console.error(e); process.exit(1) })
