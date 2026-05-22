// Storey — final dashboard mockup applying the three-tier visual rule.
// Tier 1 icons for nav/chips, Tier 2 line illustrations for task cards.
// No photo thumbnails. Same layout as the previous dashboard mockup,
// now visually consistent with CLAUDE.md visual-first + three-tier rules.
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const TERRACOTTA = '#B85042';
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

// ─── Tier 2 LINE ILLUSTRATIONS — construction subjects ────────
function illuRailing(x, y, size) {
  const sw = 3;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${SAND}"/>
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <line x1="${x+size*0.15}" y1="${y+size*0.32}" x2="${x+size*0.85}" y2="${y+size*0.32}"/>
      <line x1="${x+size*0.15}" y1="${y+size*0.68}" x2="${x+size*0.85}" y2="${y+size*0.68}"/>
      ${[0,1,2,3,4].map(i => {
        const px = x + size*0.2 + i * (size*0.6/4);
        return `<line x1="${px}" y1="${y+size*0.25}" x2="${px}" y2="${y+size*0.75}"/>`;
      }).join('')}
      <line x1="${x+size*0.1}" y1="${y+size*0.82}" x2="${x+size*0.9}" y2="${y+size*0.82}" stroke="${DARK}" stroke-width="2"/>
    </g>
  `;
}
function illuPaver(x, y, size) {
  const sw = 2.5;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${SAND}"/>
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      ${Array.from({length: 3}).map((_,r) =>
        Array.from({length: 3}).map((_,c) => {
          const px = x + size*0.18 + c*(size*0.22) + (r%2?size*0.11:0);
          const py = y + size*0.22 + r*(size*0.22);
          return `<rect x="${px}" y="${py}" width="${size*0.18}" height="${size*0.18}" rx="2"/>`;
        }).join('')
      ).join('')}
    </g>
  `;
}
function illuFoundation(x, y, size) {
  const sw = 3;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${SAND}"/>
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <line x1="${x+size*0.1}" y1="${y+size*0.78}" x2="${x+size*0.9}" y2="${y+size*0.78}"/>
      <line x1="${x+size*0.25}" y1="${y+size*0.4}" x2="${x+size*0.25}" y2="${y+size*0.78}"/>
      <line x1="${x+size*0.5}" y1="${y+size*0.3}" x2="${x+size*0.5}" y2="${y+size*0.78}"/>
      <line x1="${x+size*0.75}" y1="${y+size*0.35}" x2="${x+size*0.75}" y2="${y+size*0.78}"/>
    </g>
    <rect x="${x+size*0.18}" y="${y+size*0.78}" width="${size*0.14}" height="${size*0.08}" fill="${TERRACOTTA}"/>
    <rect x="${x+size*0.43}" y="${y+size*0.78}" width="${size*0.14}" height="${size*0.08}" fill="${TERRACOTTA}"/>
    <rect x="${x+size*0.68}" y="${y+size*0.78}" width="${size*0.14}" height="${size*0.08}" fill="${TERRACOTTA}"/>
  `;
}
function illuSlab(x, y, size) {
  const sw = 3;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${SAND}"/>
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <polygon points="${x+size*0.15},${y+size*0.45} ${x+size*0.55},${y+size*0.3} ${x+size*0.9},${y+size*0.4} ${x+size*0.5},${y+size*0.55}"/>
      <line x1="${x+size*0.15}" y1="${y+size*0.45}" x2="${x+size*0.15}" y2="${y+size*0.6}"/>
      <line x1="${x+size*0.9}" y1="${y+size*0.4}" x2="${x+size*0.9}" y2="${y+size*0.55}"/>
      <line x1="${x+size*0.5}" y1="${y+size*0.55}" x2="${x+size*0.5}" y2="${y+size*0.7}"/>
      <line x1="${x+size*0.15}" y1="${y+size*0.6}" x2="${x+size*0.5}" y2="${y+size*0.7}"/>
      <line x1="${x+size*0.9}" y1="${y+size*0.55}" x2="${x+size*0.5}" y2="${y+size*0.7}"/>
    </g>
  `;
}
function illuCementBag(x, y, size) {
  const sw = 2.5;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${SAND}"/>
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <rect x="${x+size*0.25}" y="${y+size*0.25}" width="${size*0.5}" height="${size*0.6}" rx="3"/>
      <line x1="${x+size*0.25}" y1="${y+size*0.4}" x2="${x+size*0.75}" y2="${y+size*0.4}"/>
      <text x="${x+size*0.5}" y="${y+size*0.65}" text-anchor="middle" font-family="Arial Black, Arial" font-size="${size*0.12}" fill="${TERRACOTTA}" font-weight="900">CEMENT</text>
    </g>
  `;
}
function illuRebar(x, y, size) {
  const sw = 3;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${SAND}"/>
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <line x1="${x+size*0.15}" y1="${y+size*0.3}" x2="${x+size*0.85}" y2="${y+size*0.3}"/>
      <line x1="${x+size*0.15}" y1="${y+size*0.5}" x2="${x+size*0.85}" y2="${y+size*0.5}"/>
      <line x1="${x+size*0.15}" y1="${y+size*0.7}" x2="${x+size*0.85}" y2="${y+size*0.7}"/>
      <circle cx="${x+size*0.18}" cy="${y+size*0.3}" r="3" fill="${TERRACOTTA}"/>
      <circle cx="${x+size*0.18}" cy="${y+size*0.5}" r="3" fill="${TERRACOTTA}"/>
      <circle cx="${x+size*0.18}" cy="${y+size*0.7}" r="3" fill="${TERRACOTTA}"/>
    </g>
  `;
}

// ─── Tier 1 ICONS — Lucide-style monochrome stroke ─────────────
function iconStroke(color = TERRACOTTA, sw = 2) {
  return `stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
}
function icHome(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <path d="M${s*0.1} ${s*0.5} L${s*0.5} ${s*0.1} L${s*0.9} ${s*0.5} L${s*0.9} ${s*0.9} L${s*0.1} ${s*0.9} Z"/>
    <path d="M${s*0.35} ${s*0.9} L${s*0.35} ${s*0.6} L${s*0.65} ${s*0.6} L${s*0.65} ${s*0.9}"/>
  </g>`;
}
function icList(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <line x1="${s*0.15}" y1="${s*0.25}" x2="${s*0.85}" y2="${s*0.25}"/>
    <line x1="${s*0.15}" y1="${s*0.5}" x2="${s*0.85}" y2="${s*0.5}"/>
    <line x1="${s*0.15}" y1="${s*0.75}" x2="${s*0.85}" y2="${s*0.75}"/>
  </g>`;
}
function icBox(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <rect x="${s*0.15}" y="${s*0.25}" width="${s*0.7}" height="${s*0.55}" rx="3"/>
    <line x1="${s*0.15}" y1="${s*0.45}" x2="${s*0.85}" y2="${s*0.45}"/>
    <line x1="${s*0.5}" y1="${s*0.25}" x2="${s*0.5}" y2="${s*0.45}"/>
  </g>`;
}
function icBar(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <rect x="${s*0.15}" y="${s*0.6}" width="${s*0.15}" height="${s*0.3}"/>
    <rect x="${s*0.4}" y="${s*0.35}" width="${s*0.15}" height="${s*0.55}"/>
    <rect x="${s*0.65}" y="${s*0.15}" width="${s*0.15}" height="${s*0.75}"/>
  </g>`;
}
function icDots(cx, cy, s, color) {
  return `<g fill="${color}" transform="translate(${cx-s/2}, ${cy-s/2})">
    <circle cx="${s*0.25}" cy="${s*0.5}" r="${s*0.07}"/>
    <circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.07}"/>
    <circle cx="${s*0.75}" cy="${s*0.5}" r="${s*0.07}"/>
  </g>`;
}
function icHardhat(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <path d="M${s*0.15} ${s*0.65} Q${s*0.5} ${s*0.2} ${s*0.85} ${s*0.65}"/>
    <line x1="${s*0.1}" y1="${s*0.7}" x2="${s*0.9}" y2="${s*0.7}"/>
    <line x1="${s*0.5}" y1="${s*0.25}" x2="${s*0.5}" y2="${s*0.65}"/>
  </g>`;
}
function icSite(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <line x1="${s*0.25}" y1="${s*0.85}" x2="${s*0.25}" y2="${s*0.3}"/>
    <path d="M${s*0.25} ${s*0.3} L${s*0.75} ${s*0.4} L${s*0.25} ${s*0.55}"/>
  </g>`;
}
function icMoney(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <rect x="${s*0.15}" y="${s*0.3}" width="${s*0.7}" height="${s*0.4}" rx="3"/>
    <circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.1}"/>
  </g>`;
}
function icClipboard(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <rect x="${s*0.25}" y="${s*0.2}" width="${s*0.5}" height="${s*0.7}" rx="3"/>
    <rect x="${s*0.35}" y="${s*0.12}" width="${s*0.3}" height="${s*0.14}" rx="2"/>
    <line x1="${s*0.35}" y1="${s*0.5}" x2="${s*0.65}" y2="${s*0.5}"/>
    <line x1="${s*0.35}" y1="${s*0.65}" x2="${s*0.55}" y2="${s*0.65}"/>
  </g>`;
}
function icPencil(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <path d="M${s*0.2} ${s*0.8} L${s*0.7} ${s*0.3} L${s*0.8} ${s*0.4} L${s*0.3} ${s*0.9} Z"/>
    <line x1="${s*0.6}" y1="${s*0.4}" x2="${s*0.7}" y2="${s*0.5}"/>
  </g>`;
}
function icCheck(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.4}"/>
    <path d="M${s*0.3} ${s*0.5} L${s*0.45} ${s*0.65} L${s*0.7} ${s*0.35}"/>
  </g>`;
}
function icTruck(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <rect x="${s*0.1}" y="${s*0.35}" width="${s*0.5}" height="${s*0.35}" rx="2"/>
    <path d="M${s*0.6} ${s*0.45} L${s*0.85} ${s*0.45} L${s*0.85} ${s*0.7} L${s*0.6} ${s*0.7}"/>
    <circle cx="${s*0.3}" cy="${s*0.78}" r="${s*0.08}"/>
    <circle cx="${s*0.7}" cy="${s*0.78}" r="${s*0.08}"/>
  </g>`;
}
function icCam(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <rect x="${s*0.15}" y="${s*0.3}" width="${s*0.7}" height="${s*0.5}" rx="4"/>
    <circle cx="${s*0.5}" cy="${s*0.55}" r="${s*0.12}"/>
    <rect x="${s*0.4}" y="${s*0.22}" width="${s*0.2}" height="${s*0.08}"/>
  </g>`;
}
function icBell(cx, cy, s, color) {
  return `<g ${iconStroke(color)} transform="translate(${cx-s/2}, ${cy-s/2})">
    <path d="M${s*0.25} ${s*0.7} L${s*0.25} ${s*0.45} Q${s*0.25} ${s*0.2} ${s*0.5} ${s*0.2} Q${s*0.75} ${s*0.2} ${s*0.75} ${s*0.45} L${s*0.75} ${s*0.7} Z"/>
    <line x1="${s*0.4}" y1="${s*0.8}" x2="${s*0.6}" y2="${s*0.8}"/>
  </g>`;
}

function avatar(cx, cy, r, initials, bg) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}"/>
    <text x="${cx}" y="${cy + r*0.35}" text-anchor="middle"
          font-family="Arial Black, Arial, sans-serif"
          font-size="${r}" fill="white" font-weight="900">${initials}</text>
  `;
}

// ─────────────────────────────────────────────────────────────────
async function makeMockup() {
  const W = 2600, H = 1500;
  const phX = 100, phY = 180, phW = 540, phH = 1140;
  const dkX = 780, dkY = 180, dkW = 1720, dkH = 1140;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="${W/2}" y="65" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${DARK}" font-weight="700">
    Storey dashboard — three-tier visual rule applied
  </text>
  <text x="${W/2}" y="108" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="22" fill="${GRAY600}" font-style="italic">
    Tier 1 icons (nav, chips, KPI heads) · Tier 2 line illustrations (task + material categories) · zero photo placeholders.
  </text>

  <!-- ============ MOBILE ============ -->
  <text x="${phX + phW/2}" y="160" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="16" fill="${TERRACOTTA}" font-weight="900" letter-spacing="3">PHONE</text>

  <rect x="${phX-15}" y="${phY-15}" width="${phW+30}" height="${phH+30}" rx="40" fill="${DARK}"/>
  <rect x="${phX}" y="${phY}" width="${phW}" height="${phH}" rx="28" fill="white"/>

  <!-- top bar -->
  <rect x="${phX}" y="${phY}" width="${phW}" height="100" rx="28" fill="${TERRACOTTA}"/>
  <rect x="${phX}" y="${phY+50}" width="${phW}" height="50" fill="${TERRACOTTA}"/>
  <text x="${phX+30}" y="${phY+62}" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="white" font-weight="900" letter-spacing="3">STOREY</text>
  ${icBell(phX + phW - 110, phY+60, 22, 'white')}
  ${avatar(phX + phW - 50, phY+60, 20, 'D', SAGE)}

  <!-- Greeting -->
  <text x="${phX+30}" y="${phY+155}" font-family="Georgia, serif" font-size="28" fill="${DARK}" font-weight="700">Good morning, devraaj</text>
  <text x="${phX+30}" y="${phY+185}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">Wed · 20 May · NH-37 Furkating</text>

  <!-- Hero stat card -->
  <rect x="${phX+30}" y="${phY+210}" width="${phW-60}" height="170" rx="16" fill="${TERRACOTTA}"/>
  <text x="${phX+50}" y="${phY+240}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${SAND}" letter-spacing="3" font-weight="700">TODAY ON SITE</text>
  ${icHardhat(phX+70, phY+285, 26, SAND)}
  <text x="${phX+100}" y="${phY+295}" font-family="Arial Black, Arial, sans-serif" font-size="46" fill="white" font-weight="900">12</text>
  <text x="${phX+100}" y="${phY+330}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${SAND}">workers</text>
  ${icClipboard(phX+220, phY+285, 26, SAND)}
  <text x="${phX+250}" y="${phY+295}" font-family="Arial Black, Arial, sans-serif" font-size="46" fill="white" font-weight="900">3</text>
  <text x="${phX+250}" y="${phY+330}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${SAND}">tasks</text>
  ${icMoney(phX+360, phY+285, 26, SAND)}
  <text x="${phX+390}" y="${phY+295}" font-family="Arial Black, Arial, sans-serif" font-size="40" fill="white" font-weight="900">14k</text>
  <text x="${phX+390}" y="${phY+330}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${SAND}">spend</text>
  <line x1="${phX+50}" y1="${phY+350}" x2="${phX+phW-50}" y2="${phY+350}" stroke="${SAND}" stroke-opacity="0.3"/>
  <text x="${phX+50}" y="${phY+371}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="white">☀️ Clear · 28°C · No rain expected</text>

  <!-- Quick action tiles -->
  <g transform="translate(${phX+30}, ${phY+405})">
    ${[
      ['#FEF3C7', AMBER, icPencil, 'File Log'],
      ['#DBEAFE', BLUE,  icHardhat, 'Attendance'],
      ['#FEE2E2', RED,   icBox, 'Allocate'],
      ['#DCFCE7', GREEN, icTruck, 'Transfer'],
      ['#F3E8FF', '#7C3AED', icMoney, 'Expense'],
      ['#FED7AA', '#EA580C', icCam, 'Photo'],
    ].map((tile, i) => {
      const c = i % 3, r = Math.floor(i / 3);
      const x = c * 160, y = r * 95;
      const [bg, fg, iconFn, label] = tile;
      return `
        <rect x="${x}" y="${y}" width="150" height="85" rx="12" fill="${bg}"/>
        ${iconFn(x+28, y+38, 30, fg)}
        <text x="${x+60}" y="${y+45}" font-family="Calibri, Arial, sans-serif" font-size="15" fill="${fg}" font-weight="700">${label}</text>
      `;
    }).join('')}
  </g>

  <!-- Tasks section -->
  ${icClipboard(phX+45, phY+635, 22, DARK)}
  <text x="${phX+70}" y="${phY+642}" font-family="Georgia, serif" font-size="20" fill="${DARK}" font-weight="700">My Tasks · 3</text>
  <text x="${phX+phW-30}" y="${phY+642}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${TERRACOTTA}" font-weight="700">View all →</text>

  <!-- Task card 1 — line illustration -->
  <rect x="${phX+30}" y="${phY+660}" width="${phW-60}" height="100" rx="12" fill="white" stroke="${GRAY200}"/>
  <rect x="${phX+30}" y="${phY+660}" width="10" height="100" rx="5" fill="${AMBER}"/>
  ${illuRailing(phX+55, phY+675, 70)}
  <text x="${phX+140}" y="${phY+695}" font-family="Georgia, serif" font-size="18" fill="${DARK}" font-weight="700">Install Railing</text>
  <text x="${phX+140}" y="${phY+714}" font-family="Calibri, Arial, sans-serif" font-size="12" fill="${GRAY600}">Block A · Pranab</text>
  <rect x="${phX+140}" y="${phY+724}" width="100" height="22" rx="11" fill="#FEF3C7"/>
  <text x="${phX+190}" y="${phY+739}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${AMBER}" font-weight="700">Working</text>
  <text x="${phX+phW-50}" y="${phY+703}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="32" fill="${AMBER}" font-weight="900">2</text>
  <text x="${phX+phW-50}" y="${phY+723}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">days</text>

  <!-- Task card 2 -->
  <rect x="${phX+30}" y="${phY+775}" width="${phW-60}" height="100" rx="12" fill="white" stroke="${GRAY200}"/>
  <rect x="${phX+30}" y="${phY+775}" width="10" height="100" rx="5" fill="${GREEN}"/>
  ${illuPaver(phX+55, phY+790, 70)}
  <text x="${phX+140}" y="${phY+810}" font-family="Georgia, serif" font-size="18" fill="${DARK}" font-weight="700">Lay Pavers</text>
  <text x="${phX+140}" y="${phY+829}" font-family="Calibri, Arial, sans-serif" font-size="12" fill="${GRAY600}">Entrance · Pranab</text>
  <rect x="${phX+140}" y="${phY+839}" width="80" height="22" rx="11" fill="#DCFCE7"/>
  <text x="${phX+180}" y="${phY+854}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GREEN}" font-weight="700">Done</text>
  <text x="${phX+phW-50}" y="${phY+820}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="28" fill="${GREEN}" font-weight="900">100%</text>

  <!-- Allocated today -->
  ${icBox(phX+45, phY+912, 22, DARK)}
  <text x="${phX+70}" y="${phY+918}" font-family="Georgia, serif" font-size="20" fill="${DARK}" font-weight="700">Allocated Today · 3</text>

  <rect x="${phX+30}" y="${phY+935}" width="${phW-60}" height="60" rx="10" fill="white" stroke="${GRAY200}"/>
  ${illuCementBag(phX+45, phY+945, 40)}
  <text x="${phX+105}" y="${phY+960}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">Cement</text>
  <text x="${phX+105}" y="${phY+980}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">Foundation pour, Block A</text>
  <text x="${phX+phW-50}" y="${phY+972}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="${TERRACOTTA}" font-weight="900">30 <tspan font-size="12" fill="${GRAY600}">bags</tspan></text>

  <rect x="${phX+30}" y="${phY+1005}" width="${phW-60}" height="60" rx="10" fill="white" stroke="${GRAY200}"/>
  ${illuRebar(phX+45, phY+1015, 40)}
  <text x="${phX+105}" y="${phY+1030}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">Rebar 12mm</text>
  <text x="${phX+105}" y="${phY+1050}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">Retaining wall task</text>
  <text x="${phX+phW-50}" y="${phY+1042}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="${TERRACOTTA}" font-weight="900">80 <tspan font-size="12" fill="${GRAY600}">kg</tspan></text>

  <!-- Bottom nav with proper Tier-1 icons -->
  <rect x="${phX}" y="${phY + phH - 80}" width="${phW}" height="80" fill="white" stroke="${GRAY200}"/>
  ${[
    [icHome,      'Home',    true],
    [icList,      'Tasks',   false],
    [icBox,       'Stock',   false],
    [icBar,       'Reports', false],
    [icDots,      'More',    false],
  ].map((nav, i) => {
    const x = phX + 30 + i * 95;
    const [iconFn, label, active] = nav;
    const color = active ? TERRACOTTA : GRAY400;
    return `
      ${iconFn(x+30, phY+phH-48, 26, color)}
      <text x="${x + 30}" y="${phY + phH - 18}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="10" fill="${color}" font-weight="${active?700:400}">${label}</text>
      ${active ? `<rect x="${x+10}" y="${phY+phH-78}" width="40" height="3" rx="1.5" fill="${TERRACOTTA}"/>` : ''}
    `;
  }).join('')}

  <!-- ============ DESKTOP ============ -->
  <text x="${dkX + dkW/2}" y="160" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="16" fill="${TERRACOTTA}" font-weight="900" letter-spacing="3">DESKTOP (WEB)</text>

  <rect x="${dkX}" y="${dkY}" width="${dkW}" height="${dkH}" rx="14" fill="white" stroke="${GRAY200}" stroke-width="2"/>
  <rect x="${dkX}" y="${dkY}" width="${dkW}" height="50" rx="14" fill="${GRAY100}"/>
  <rect x="${dkX}" y="${dkY+30}" width="${dkW}" height="20" fill="${GRAY100}"/>
  <circle cx="${dkX+24}" cy="${dkY+25}" r="6" fill="#EF4444"/>
  <circle cx="${dkX+46}" cy="${dkY+25}" r="6" fill="#F59E0B"/>
  <circle cx="${dkX+68}" cy="${dkY+25}" r="6" fill="#10B981"/>
  <rect x="${dkX+100}" y="${dkY+13}" width="380" height="24" rx="12" fill="white" stroke="${GRAY200}"/>
  <text x="${dkX+115}" y="${dkY+30}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY500}">🔒 storeyinfra.com/dashboard</text>

  <!-- Sidebar with Tier-1 icons -->
  <rect x="${dkX}" y="${dkY+50}" width="220" height="${dkH-50}" fill="${DARK}"/>
  <text x="${dkX+25}" y="${dkY+95}" font-family="Arial Black, Arial, sans-serif" font-size="22" fill="white" font-weight="900" letter-spacing="3">STOREY</text>
  <text x="${dkX+25}" y="${dkY+118}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${SAND}">BuildNE Infra Pvt. Ltd.</text>

  ${[
    [icHome,      'Dashboard',  true],
    [icSite,      'Sites',      false],
    [icHardhat,   'Workers',    false],
    [icList,      'Tasks',      false],
    [icBox,       'Inventory',  false],
    [icTruck,     'Transfers',  false],
    [icMoney,     'Expenses',   false],
    [icBar,       'Reports',    false],
    [icClipboard, 'Team',       false],
    [icDots,      'Settings',   false],
  ].map((nav, i) => {
    const y = dkY + 170 + i * 50;
    const [iconFn, label, active] = nav;
    const color = active ? 'white' : '#94A3B8';
    return `
      ${active ? `<rect x="${dkX}" y="${y-12}" width="220" height="40" fill="${TERRACOTTA}" opacity="0.25"/>` : ''}
      ${active ? `<rect x="${dkX}" y="${y-12}" width="4" height="40" fill="${TERRACOTTA}"/>` : ''}
      ${iconFn(dkX+35, y+8, 22, color)}
      <text x="${dkX+62}" y="${y+12}" font-family="Calibri, Arial, sans-serif" font-size="15" fill="${color}" font-weight="${active?700:400}">${label}</text>
    `;
  }).join('')}

  <!-- Main content -->
  <g transform="translate(${dkX+220}, ${dkY+50})">
    <rect x="0" y="0" width="${dkW-220}" height="80" fill="white"/>
    <text x="40" y="35" font-family="Georgia, serif" font-size="28" fill="${DARK}" font-weight="700">Dashboard</text>
    <text x="40" y="58" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">Wed, 20 May 2026 · All sites</text>
    ${icBell(dkW-220-145, 42, 22, GRAY600)}
    ${avatar(dkW-220-60, 40, 20, 'KR', TERRACOTTA)}
    <text x="${dkW-220-100}" y="46" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">Karun</text>
    <text x="${dkW-220-100}" y="62" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">Contractor</text>

    <!-- HERO STATS with Tier-1 icons -->
    ${[
      [icHardhat, 'Workers on site',  '47',   '+3',         GREEN, '#DCFCE7'],
      [icSite,    'Active sites',     '3',    '',           BLUE,  '#DBEAFE'],
      [icList,    'Tasks due today',  '8',    '2 overdue',  RED,   '#FEE2E2'],
      [icMoney,   'Spend today',      '₹62k', '−12% vs avg',AMBER, '#FEF3C7'],
    ].map((card, i) => {
      const x = 40 + i * 360;
      const [iconFn, label, value, delta, color, bg] = card;
      return `
        <rect x="${x}" y="100" width="340" height="160" rx="14" fill="white" stroke="${GRAY200}"/>
        <rect x="${x}" y="100" width="340" height="6" fill="${color}"/>
        <circle cx="${x+45}" cy="155" r="26" fill="${bg}"/>
        ${iconFn(x+45, 155, 30, color)}
        <text x="${x+90}" y="148" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}" letter-spacing="1" font-weight="700">${label.toUpperCase()}</text>
        <text x="${x+90}" y="200" font-family="Arial Black, Arial, sans-serif" font-size="48" fill="${DARK}" font-weight="900">${value}</text>
        ${delta ? `<text x="${x+90}" y="232" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${color}" font-weight="700">${delta}</text>` : ''}
      `;
    }).join('')}

    <!-- KANBAN with Tier-2 line illustrations -->
    ${icClipboard(50, 297, 24, DARK)}
    <text x="78" y="305" font-family="Georgia, serif" font-size="22" fill="${DARK}" font-weight="700">Tasks across all sites</text>
    <text x="${dkW-220-40}" y="305" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${TERRACOTTA}" font-weight="700">View all →</text>

    ${[
      ['To Do',       6, GRAY400, GRAY100,  illuSlab,        'Roof Slab',      'Block C'],
      ['In Progress', 4, AMBER,   '#FEF3C7', illuRailing,    'Install Railing','Block A · NH-37'],
      ['Done',        2, GREEN,   '#DCFCE7', illuPaver,      'Lay Pavers',     'Entrance'],
    ].map((col, i) => {
      const x = 40 + i * 380;
      const [name, count, color, bg, illuFn, title, sub] = col;
      return `
        <rect x="${x}" y="330" width="360" height="290" rx="14" fill="${bg}"/>
        <text x="${x+20}" y="358" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${color}" letter-spacing="2" font-weight="900">${name.toUpperCase()}</text>
        <text x="${x+340}" y="358" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="${color}" font-weight="900">${count}</text>
        <rect x="${x+20}" y="380" width="320" height="100" rx="10" fill="white" stroke="${GRAY200}"/>
        <rect x="${x+20}" y="380" width="6" height="100" rx="3" fill="${color}"/>
        ${illuFn(x+40, 395, 70)}
        <text x="${x+125}" y="418" font-family="Georgia, serif" font-size="16" fill="${DARK}" font-weight="700">${title}</text>
        <text x="${x+125}" y="438" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">${sub}</text>
        ${avatar(x+300, 462, 14, 'PG', SAGE)}
        <text x="${x+125}" y="465" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY500}">due 22 May</text>
        <text x="${x+180}" y="540" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY500}">+ ${count - 1} more</text>
      `;
    }).join('')}

    <!-- Activity feed -->
    <rect x="40" y="650" width="730" height="370" rx="14" fill="white" stroke="${GRAY200}"/>
    ${icBell(60, 678, 20, DARK)}
    <text x="85" y="685" font-family="Georgia, serif" font-size="18" fill="${DARK}" font-weight="700">Recent activity</text>

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

    <!-- Stock with Tier-2 illustrations as thumbs -->
    <rect x="790" y="650" width="${dkW-220-820}" height="370" rx="14" fill="white" stroke="${GRAY200}"/>
    ${icBox(810, 678, 20, DARK)}
    <text x="835" y="685" font-family="Georgia, serif" font-size="18" fill="${DARK}" font-weight="700">Stock at a glance</text>
    <text x="${dkW-220-50}" y="685" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY500}">lowest first</text>

    ${[
      [illuCementBag, 'Cement',     'NH-37',     '12',   'bags', RED,    true],
      [illuRebar,     'Rebar 12mm', 'NH-37',     '85',   'kg',   AMBER,  false],
      [illuPaver,     'Sand',       'Shillong',  '1.4',  'm³',   GREEN,  false],
      [illuRebar,     'Tie wire',   'NH-37',     '24',   'kg',   GREEN,  false],
      [illuFoundation,'Bricks',     'Imphal',    '4500', 'pcs',  GREEN,  false],
    ].map((row, i) => {
      const y = 715 + i * 58;
      const [illuFn, name, site, qty, unit, color, low] = row;
      return `
        ${illuFn(815, y-18, 38)}
        <text x="868" y="${y-2}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">${name}</text>
        <text x="868" y="${y+15}" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}">${site}</text>
        <text x="${dkW-220-50}" y="${y+5}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="20" fill="${color}" font-weight="900">${qty} <tspan font-size="12" fill="${GRAY600}" font-weight="400">${unit}</tspan></text>
        ${low ? `<rect x="${dkW-220-110}" y="${y-12}" width="50" height="20" rx="10" fill="#FEE2E2"/><text x="${dkW-220-85}" y="${y+2}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="10" fill="${RED}" font-weight="900">LOW</text>` : ''}
      `;
    }).join('')}
  </g>

  <text x="${W/2}" y="1470" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${GRAY800}" font-style="italic">
    Tier 1 icons for nav + chips · Tier 2 line illustrations for category thumbs · Tier 3 photo reserved for real evidence. Brand-coherent throughout.
  </text>
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile('C:\\consne\\mockup-final-dashboard.jpg');
  console.log('JPG written: C:\\consne\\mockup-final-dashboard.jpg');
}

makeMockup().catch((e) => { console.error(e); process.exit(1); });
