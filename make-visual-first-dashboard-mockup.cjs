// Storey — visual-first dashboard across both surfaces (phone + desktop).
// One JPG, side-by-side comparison. English copy. Big numbers, colour stripes,
// thumb photos, icon-led nav. Per CLAUDE.md visual-first principles.
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const TERRACOTTA = '#B85042';
const TERRA_LITE = '#D9785F';
const SAND       = '#E7E8D1';
const SAGE       = '#A7BEAE';
const DARK       = '#2A1410';
const RED        = '#DC2626';
const AMBER      = '#D97706';
const GREEN      = '#059669';
const BLUE       = '#2563EB';
const GRAY100    = '#F3F4F6';
const GRAY200    = '#E5E7EB';
const GRAY400    = '#9CA3AF';
const GRAY500    = '#6B7280';
const GRAY600    = '#4B5563';
const GRAY800    = '#1F2937';
const BG         = '#F9FAFB';

// Tiny "work photo" placeholders
function fakePhoto(x, y, size, motif) {
  const grads = {
    foundation: ['#8B7355', '#A18A6E'],
    paver:      ['#7B7B7B', '#9B9B9B'],
    railing:    ['#3A3A3A', '#5A5A5A'],
    site:       ['#6E8B6E', '#9DB89D'],
  };
  const [c1, c2] = grads[motif] || ['#999', '#bbb'];
  return `
    <defs>
      <linearGradient id="g_${motif}_${x}_${y}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${Math.max(6, size*0.12)}" fill="url(#g_${motif}_${x}_${y})"/>
    ${motif === 'foundation' ? `
      <rect x="${x+size*0.15}" y="${y+size*0.55}" width="${size*0.7}" height="${size*0.35}" fill="#5C4A38" opacity="0.6"/>
      <rect x="${x+size*0.22}" y="${y+size*0.4}" width="${size*0.07}" height="${size*0.5}" fill="#1F1810"/>
      <rect x="${x+size*0.42}" y="${y+size*0.35}" width="${size*0.07}" height="${size*0.55}" fill="#1F1810"/>
      <rect x="${x+size*0.62}" y="${y+size*0.32}" width="${size*0.07}" height="${size*0.58}" fill="#1F1810"/>` : ''}
    ${motif === 'paver' ? Array.from({length: 4}).map((_,r) =>
        Array.from({length: 4}).map((_,c) => {
          const px = x + size*0.1 + c*(size*0.18) + (r%2?size*0.09:0);
          const py = y + size*0.1 + r*(size*0.18);
          return `<rect x="${px}" y="${py}" width="${size*0.16}" height="${size*0.16}" rx="2" fill="${c1}" stroke="#3A3A3A" stroke-width="0.5"/>`;
        }).join('')
      ).join('') : ''}
    ${motif === 'railing' ? `
      <rect x="${x+size*0.07}" y="${y+size*0.25}" width="${size*0.86}" height="${size*0.07}" fill="#888"/>
      <rect x="${x+size*0.07}" y="${y+size*0.75}" width="${size*0.86}" height="${size*0.07}" fill="#888"/>
      ${Array.from({length: 5}).map((_,i) =>
        `<rect x="${x+size*0.15+i*(size*0.18)}" y="${y+size*0.25}" width="${size*0.05}" height="${size*0.5}" fill="#888"/>`
      ).join('')}` : ''}
    ${motif === 'site' ? `
      <rect x="${x+size*0.15}" y="${y+size*0.45}" width="${size*0.7}" height="${size*0.45}" fill="#8B6E4D" opacity="0.8"/>
      <polygon points="${x+size*0.15},${y+size*0.45} ${x+size*0.5},${y+size*0.18} ${x+size*0.85},${y+size*0.45}" fill="#A0816A" opacity="0.7"/>
      <rect x="${x+size*0.4}" y="${y+size*0.65}" width="${size*0.2}" height="${size*0.25}" fill="#3A3A3A"/>` : ''}
  `;
}

function avatar(x, y, r, initials, bg) {
  return `
    <circle cx="${x}" cy="${y}" r="${r}" fill="${bg}"/>
    <text x="${x}" y="${y + r*0.35}" text-anchor="middle"
          font-family="Arial Black, Arial, sans-serif"
          font-size="${r}" fill="white" font-weight="900">${initials}</text>
  `;
}

// ─────────────────────────────────────────────────────────────────
async function makeMockup() {
  const W = 2600, H = 1500;

  // ── MOBILE (LEFT) — phone frame 540 × 1140
  const phX = 100, phY = 180, phW = 540, phH = 1140;
  // ── DESKTOP (RIGHT) — frame 1720 × 1140
  const dkX = 780, dkY = 180, dkW = 1720, dkH = 1140;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Title -->
  <text x="${W/2}" y="65" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${DARK}" font-weight="700">
    Storey — visual-first dashboard
  </text>
  <text x="${W/2}" y="108" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="22" fill="${GRAY600}" font-style="italic">
    Same data. Phone for the supervisor on site. Desktop for the contractor in his office.
  </text>

  <!-- ============ MOBILE FRAME ============ -->
  <text x="${phX + phW/2}" y="160" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="16" fill="${TERRACOTTA}" font-weight="900" letter-spacing="3">📱 PHONE</text>

  <!-- phone outer frame -->
  <rect x="${phX-15}" y="${phY-15}" width="${phW+30}" height="${phH+30}" rx="40" fill="${DARK}"/>
  <rect x="${phX}" y="${phY}" width="${phW}" height="${phH}" rx="28" fill="white"/>

  <!-- mobile top bar -->
  <rect x="${phX}" y="${phY}" width="${phW}" height="100" rx="28" fill="${TERRACOTTA}"/>
  <rect x="${phX}" y="${phY+50}" width="${phW}" height="50" fill="${TERRACOTTA}"/>
  <text x="${phX+30}" y="${phY+62}" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="white" font-weight="900" letter-spacing="3">STOREY</text>
  ${avatar(phX + phW - 50, phY+60, 20, 'D', SAGE)}
  <circle cx="${phX + phW - 110}" cy="${phY+60}" r="12" fill="white" opacity="0.2"/>
  <text x="${phX + phW - 110}" y="${phY+66}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">🔔</text>

  <!-- Greeting -->
  <text x="${phX+30}" y="${phY+155}" font-family="Georgia, serif" font-size="28" fill="${DARK}" font-weight="700">Good morning, devraaj</text>
  <text x="${phX+30}" y="${phY+185}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">Wed · 20 May · NH-37 Furkating</text>

  <!-- Hero stat card (today snapshot) -->
  <rect x="${phX+30}" y="${phY+210}" width="${phW-60}" height="170" rx="16" fill="${TERRACOTTA}"/>
  <text x="${phX+50}" y="${phY+240}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${SAND}" letter-spacing="3" font-weight="700">TODAY ON SITE</text>
  <!-- big numbers -->
  <text x="${phX+50}" y="${phY+310}" font-family="Arial Black, Arial, sans-serif" font-size="64" fill="white" font-weight="900">12</text>
  <text x="${phX+50}" y="${phY+340}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${SAND}">👷 workers</text>
  <text x="${phX+200}" y="${phY+310}" font-family="Arial Black, Arial, sans-serif" font-size="64" fill="white" font-weight="900">3</text>
  <text x="${phX+200}" y="${phY+340}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${SAND}">📋 tasks</text>
  <text x="${phX+330}" y="${phY+310}" font-family="Arial Black, Arial, sans-serif" font-size="64" fill="white" font-weight="900">₹14k</text>
  <text x="${phX+330}" y="${phY+340}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${SAND}">💰 spend</text>
  <!-- weather strip -->
  <text x="${phX+50}" y="${phY+370}" font-family="Calibri, Arial, sans-serif" font-size="15" fill="white">☀️ Clear · 28°C · No rain expected</text>

  <!-- Quick action tiles (3x2) -->
  <g transform="translate(${phX+30}, ${phY+405})">
    ${[
      ['#FEF3C7', AMBER, '✏️', 'File Log'],
      ['#DBEAFE', BLUE,  '👷', 'Attendance'],
      ['#FEE2E2', RED,   '📦', 'Allocate'],
      ['#DCFCE7', GREEN, '🚚', 'Transfer'],
      ['#F3E8FF', '#7C3AED', '💸', 'Expense'],
      ['#FED7AA', '#EA580C', '📷', 'Photo'],
    ].map((tile, i) => {
      const c = i % 3, r = Math.floor(i / 3);
      const x = c * 160, y = r * 95;
      const [bg, fg, icon, label] = tile;
      return `
        <rect x="${x}" y="${y}" width="150" height="85" rx="12" fill="${bg}"/>
        <text x="${x+20}" y="${y+42}" font-family="Arial, sans-serif" font-size="28">${icon}</text>
        <text x="${x+20}" y="${y+70}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${fg}" font-weight="700">${label}</text>
      `;
    }).join('')}
  </g>

  <!-- Tasks section header -->
  <text x="${phX+30}" y="${phY+635}" font-family="Georgia, serif" font-size="20" fill="${DARK}" font-weight="700">📋 My Tasks · 3</text>
  <text x="${phX+phW-30}" y="${phY+635}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${TERRACOTTA}" font-weight="700">View all →</text>

  <!-- Task card 1 — IN PROGRESS -->
  <rect x="${phX+30}" y="${phY+655}" width="${phW-60}" height="100" rx="12" fill="white" stroke="${GRAY200}"/>
  <rect x="${phX+30}" y="${phY+655}" width="10" height="100" rx="5" fill="${AMBER}"/>
  ${fakePhoto(phX+55, phY+670, 70, 'railing')}
  <text x="${phX+140}" y="${phY+693}" font-family="Georgia, serif" font-size="18" fill="${DARK}" font-weight="700">Install Railing</text>
  <text x="${phX+140}" y="${phY+712}" font-family="Calibri, Arial, sans-serif" font-size="12" fill="${GRAY600}">Block A · Pranab</text>
  <rect x="${phX+140}" y="${phY+722}" width="100" height="22" rx="11" fill="#FEF3C7"/>
  <text x="${phX+190}" y="${phY+737}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${AMBER}" font-weight="700">🏗️  Working</text>
  <text x="${phX+phW-50}" y="${phY+700}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="32" fill="${AMBER}" font-weight="900">2</text>
  <text x="${phX+phW-50}" y="${phY+720}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">days</text>

  <!-- Task card 2 — DONE -->
  <rect x="${phX+30}" y="${phY+770}" width="${phW-60}" height="100" rx="12" fill="white" stroke="${GRAY200}"/>
  <rect x="${phX+30}" y="${phY+770}" width="10" height="100" rx="5" fill="${GREEN}"/>
  ${fakePhoto(phX+55, phY+785, 70, 'paver')}
  <text x="${phX+140}" y="${phY+808}" font-family="Georgia, serif" font-size="18" fill="${DARK}" font-weight="700">Lay Pavers</text>
  <text x="${phX+140}" y="${phY+827}" font-family="Calibri, Arial, sans-serif" font-size="12" fill="${GRAY600}">Entrance · Pranab</text>
  <rect x="${phX+140}" y="${phY+837}" width="80" height="22" rx="11" fill="#DCFCE7"/>
  <text x="${phX+180}" y="${phY+852}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GREEN}" font-weight="700">✅  Done</text>
  <text x="${phX+phW-50}" y="${phY+815}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="28" fill="${GREEN}" font-weight="900">100%</text>

  <!-- Material allocated today widget -->
  <text x="${phX+30}" y="${phY+910}" font-family="Georgia, serif" font-size="20" fill="${DARK}" font-weight="700">📦 Allocated Today · 3</text>
  <rect x="${phX+30}" y="${phY+930}" width="${phW-60}" height="60" rx="10" fill="white" stroke="${GRAY200}"/>
  <circle cx="${phX+60}" cy="${phY+960}" r="18" fill="${SAND}"/>
  <text x="${phX+60}" y="${phY+967}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18">🧱</text>
  <text x="${phX+95}" y="${phY+955}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">Cement</text>
  <text x="${phX+95}" y="${phY+975}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">Foundation pour, Block A</text>
  <text x="${phX+phW-50}" y="${phY+965}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="${TERRACOTTA}" font-weight="900">30 <tspan font-size="12" fill="${GRAY600}">bags</tspan></text>

  <rect x="${phX+30}" y="${phY+1000}" width="${phW-60}" height="60" rx="10" fill="white" stroke="${GRAY200}"/>
  <circle cx="${phX+60}" cy="${phY+1030}" r="18" fill="${SAND}"/>
  <text x="${phX+60}" y="${phY+1037}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18">⚙️</text>
  <text x="${phX+95}" y="${phY+1025}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">Rebar 12mm</text>
  <text x="${phX+95}" y="${phY+1045}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">Retaining wall task</text>
  <text x="${phX+phW-50}" y="${phY+1035}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="${TERRACOTTA}" font-weight="900">80 <tspan font-size="12" fill="${GRAY600}">kg</tspan></text>

  <!-- Bottom nav -->
  <rect x="${phX}" y="${phY + phH - 80}" width="${phW}" height="80" fill="white" stroke="${GRAY200}"/>
  ${[
    ['🏠', 'Home', true],
    ['📋', 'Tasks', false],
    ['📦', 'Stock', false],
    ['📊', 'Reports', false],
    ['⚙️', 'More', false],
  ].map((nav, i) => {
    const x = phX + 30 + i * 95;
    const [icon, label, active] = nav;
    const color = active ? TERRACOTTA : GRAY400;
    return `
      <text x="${x + 30}" y="${phY + phH - 40}" text-anchor="middle" font-family="Arial, sans-serif" font-size="22">${icon}</text>
      <text x="${x + 30}" y="${phY + phH - 18}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="10" fill="${color}" font-weight="${active?700:400}">${label}</text>
      ${active ? `<rect x="${x+10}" y="${phY+phH-78}" width="40" height="3" rx="1.5" fill="${TERRACOTTA}"/>` : ''}
    `;
  }).join('')}

  <!-- ============ DESKTOP FRAME ============ -->
  <text x="${dkX + dkW/2}" y="160" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="16" fill="${TERRACOTTA}" font-weight="900" letter-spacing="3">💻 DESKTOP (WEB)</text>

  <!-- desktop outer frame (browser chrome) -->
  <rect x="${dkX}" y="${dkY}" width="${dkW}" height="${dkH}" rx="14" fill="white" stroke="${GRAY200}" stroke-width="2"/>
  <rect x="${dkX}" y="${dkY}" width="${dkW}" height="50" rx="14" fill="${GRAY100}"/>
  <rect x="${dkX}" y="${dkY+30}" width="${dkW}" height="20" fill="${GRAY100}"/>
  <circle cx="${dkX+24}" cy="${dkY+25}" r="6" fill="#EF4444"/>
  <circle cx="${dkX+46}" cy="${dkY+25}" r="6" fill="#F59E0B"/>
  <circle cx="${dkX+68}" cy="${dkY+25}" r="6" fill="#10B981"/>
  <rect x="${dkX+100}" y="${dkY+13}" width="380" height="24" rx="12" fill="white" stroke="${GRAY200}"/>
  <text x="${dkX+115}" y="${dkY+30}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY500}">🔒 storeyinfra.com/dashboard</text>

  <!-- Sidebar -->
  <rect x="${dkX}" y="${dkY+50}" width="220" height="${dkH-50}" fill="${DARK}"/>
  <text x="${dkX+25}" y="${dkY+95}" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="white" font-weight="900" letter-spacing="3">STOREY</text>
  <text x="${dkX+25}" y="${dkY+118}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${SAND}">BuildNE Infra Pvt. Ltd.</text>

  ${[
    ['🏠', 'Dashboard', true],
    ['🏗️', 'Sites', false],
    ['👷', 'Workers', false],
    ['📋', 'Tasks', false],
    ['📦', 'Inventory', false],
    ['🚚', 'Transfers', false],
    ['💸', 'Expenses', false],
    ['📊', 'Reports', false],
    ['👥', 'Team', false],
    ['⚙️', 'Settings', false],
  ].map((nav, i) => {
    const y = dkY + 170 + i * 50;
    const [icon, label, active] = nav;
    const color = active ? 'white' : '#94A3B8';
    return `
      ${active ? `<rect x="${dkX}" y="${y-12}" width="220" height="40" fill="${TERRACOTTA}" opacity="0.25"/>` : ''}
      ${active ? `<rect x="${dkX}" y="${y-12}" width="4" height="40" fill="${TERRACOTTA}"/>` : ''}
      <text x="${dkX+25}" y="${y+12}" font-family="Arial, sans-serif" font-size="18">${icon}</text>
      <text x="${dkX+62}" y="${y+12}" font-family="Calibri, Arial, sans-serif" font-size="15" fill="${color}" font-weight="${active?700:400}">${label}</text>
    `;
  }).join('')}

  <!-- Main content area -->
  <g transform="translate(${dkX+220}, ${dkY+50})">
    <!-- Top bar -->
    <rect x="0" y="0" width="${dkW-220}" height="80" fill="white"/>
    <text x="40" y="35" font-family="Georgia, serif" font-size="28" fill="${DARK}" font-weight="700">Dashboard</text>
    <text x="40" y="58" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">Wed, 20 May 2026 · All sites</text>
    ${avatar(dkW-220-60, 40, 20, 'KR', TERRACOTTA)}
    <text x="${dkW-220-100}" y="46" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">Karun</text>
    <text x="${dkW-220-100}" y="62" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">Contractor</text>
    <text x="${dkW-220-130}" y="48" text-anchor="end" font-family="Arial, sans-serif" font-size="18">🔔</text>

    <!-- HERO STAT CARDS (4 columns) -->
    ${[
      ['👷', 'Workers on site', '47', '+3', GREEN, '#DCFCE7'],
      ['🏗️', 'Active sites',     '3',  '',   BLUE,  '#DBEAFE'],
      ['📋', 'Tasks due today',  '8',  '2 overdue', RED,   '#FEE2E2'],
      ['💸', 'Spend today',      '₹62k', '−12% vs avg', AMBER, '#FEF3C7'],
    ].map((card, i) => {
      const x = 40 + i * 360;
      const [icon, label, value, delta, color, bg] = card;
      return `
        <rect x="${x}" y="100" width="340" height="160" rx="14" fill="white" stroke="${GRAY200}"/>
        <rect x="${x}" y="100" width="340" height="6" fill="${color}"/>
        <circle cx="${x+45}" cy="155" r="24" fill="${bg}"/>
        <text x="${x+45}" y="163" text-anchor="middle" font-family="Arial, sans-serif" font-size="24">${icon}</text>
        <text x="${x+85}" y="148" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}" letter-spacing="1" font-weight="700">${label.toUpperCase()}</text>
        <text x="${x+85}" y="200" font-family="Arial Black, Arial, sans-serif" font-size="48" fill="${DARK}" font-weight="900">${value}</text>
        ${delta ? `<text x="${x+85}" y="232" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${color}" font-weight="700">${delta}</text>` : ''}
      `;
    }).join('')}

    <!-- KANBAN (Tasks board, 3 columns) -->
    <text x="40" y="305" font-family="Georgia, serif" font-size="22" fill="${DARK}" font-weight="700">📋 Tasks across all sites</text>
    <text x="${dkW-220-40}" y="305" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${TERRACOTTA}" font-weight="700">View all →</text>

    ${[
      ['To Do',       6, GRAY400, GRAY100, [['Roof Slab', 'Block C', 'PG', 'paver']]],
      ['In Progress', 4, AMBER,   '#FEF3C7', [['Install Railing', 'Block A · NH-37', 'PG', 'railing']]],
      ['Done',        2, GREEN,   '#DCFCE7', [['Lay Pavers', 'Entrance', 'PG', 'paver']]],
    ].map((col, i) => {
      const x = 40 + i * 380;
      const [name, count, color, bg, cards] = col;
      return `
        <rect x="${x}" y="330" width="360" height="290" rx="14" fill="${bg}"/>
        <text x="${x+20}" y="358" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${color}" letter-spacing="2" font-weight="900">${name.toUpperCase()}</text>
        <text x="${x+340}" y="358" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="${color}" font-weight="900">${count}</text>
        ${cards.map((card, j) => {
          const cy = 380 + j*120;
          const [title, sub, init, motif] = card;
          return `
            <rect x="${x+20}" y="${cy}" width="320" height="100" rx="10" fill="white" stroke="${GRAY200}"/>
            <rect x="${x+20}" y="${cy}" width="6" height="100" rx="3" fill="${color}"/>
            ${fakePhoto(x+40, cy+15, 70, motif)}
            <text x="${x+125}" y="${cy+38}" font-family="Georgia, serif" font-size="16" fill="${DARK}" font-weight="700">${title}</text>
            <text x="${x+125}" y="${cy+58}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">${sub}</text>
            ${avatar(x+300, cy+82, 14, init, SAGE)}
            <text x="${x+125}" y="${cy+85}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY500}">📅 due 22 May</text>
          `;
        }).join('')}
        <text x="${x+180}" y="${380+cards.length*120 + 30}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY500}">+ ${count - cards.length} more</text>
      `;
    }).join('')}

    <!-- BOTTOM ROW: Activity + Stock at a glance -->
    <!-- Recent activity -->
    <rect x="40" y="650" width="730" height="370" rx="14" fill="white" stroke="${GRAY200}"/>
    <text x="60" y="685" font-family="Georgia, serif" font-size="18" fill="${DARK}" font-weight="700">🔔 Recent activity</text>

    ${[
      ['D',  SAGE,    'devraaj allocated 30 bags Cement → Foundation pour',          '8:42 AM'],
      ['MG', BLUE,    'Merina marked 12 workers present at NH-37',                   '8:30 AM'],
      ['PG', AMBER,   'Pranab confirmed daily log for NH-37',                        '7:55 AM'],
      ['BD', '#7C3AED', 'Biplab received 200 bags Cement transfer at Shillong',      'Yesterday'],
      ['D',  SAGE,    'devraaj completed task "Lay Pavers"',                         'Yesterday'],
    ].map((act, i) => {
      const y = 720 + i * 58;
      const [init, color, msg, time] = act;
      return `
        ${avatar(80, y, 18, init, color)}
        <text x="115" y="${y+5}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${DARK}">${msg}</text>
        <text x="750" y="${y+5}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY500}">${time}</text>
      `;
    }).join('')}

    <!-- Stock at a glance -->
    <rect x="790" y="650" width="${dkW-220-820}" height="370" rx="14" fill="white" stroke="${GRAY200}"/>
    <text x="810" y="685" font-family="Georgia, serif" font-size="18" fill="${DARK}" font-weight="700">📦 Stock at a glance</text>
    <text x="${dkW-220-50}" y="685" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY500}">lowest first</text>

    ${[
      ['🧱', 'Cement', 'NH-37',     '12',   'bags', RED,    true],
      ['⚙️', 'Rebar 12mm', 'NH-37', '85',   'kg',   AMBER,  false],
      ['🪨', 'Sand', 'Shillong',    '1.4',  'm³',   GREEN,  false],
      ['🔩', 'Tie wire', 'NH-37',   '24',   'kg',   GREEN,  false],
      ['🧱', 'Bricks', 'Imphal',    '4500', 'pcs',  GREEN,  false],
    ].map((row, i) => {
      const y = 720 + i * 58;
      const [icon, name, site, qty, unit, color, low] = row;
      return `
        <circle cx="830" cy="${y-2}" r="18" fill="${SAND}"/>
        <text x="830" y="${y+5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18">${icon}</text>
        <text x="865" y="${y-4}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">${name}</text>
        <text x="865" y="${y+12}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">${site}</text>
        <text x="${dkW-220-50}" y="${y+5}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="20" fill="${color}" font-weight="900">${qty} <tspan font-size="12" fill="${GRAY600}" font-weight="400">${unit}</tspan></text>
        ${low ? `<rect x="${dkW-220-110}" y="${y-12}" width="50" height="20" rx="10" fill="#FEE2E2"/><text x="${dkW-220-85}" y="${y+2}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="10" fill="${RED}" font-weight="900">LOW</text>` : ''}
      `;
    }).join('')}
  </g>

  <!-- footer caption -->
  <text x="${W/2}" y="1470" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${GRAY800}" font-style="italic">
    Photos · colour stripes · big numbers · icon-led nav · empty states with CTAs. English plain copy. Same principle, two surfaces.
  </text>
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile('C:\\consne\\mockup-visual-first-dashboard.jpg');
  console.log('JPG written: C:\\consne\\mockup-visual-first-dashboard.jpg');
}

makeMockup().catch((e) => { console.error(e); process.exit(1); });
