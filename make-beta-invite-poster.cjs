// Storey — "Beta invite v3" A4 portrait poster.
// Live-now features + coming-in-v1.2 features + WhatsApp CTA.
// Built 2026-05-21 after v1.1.5 ships (camera fix landed).
// Bigger fonts + WhatsApp-first CTA.
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const OUT_JPG  = 'C:\\consne\\storey-beta-invite.jpg';
const OUT_PNG  = 'C:\\consne\\storey-beta-invite.png';

const TERRACOTTA = '#B85042';
const SAND       = '#E7E8D1';
const SAGE       = '#A7BEAE';
const WHITE      = '#FFFFFF';
const DARK       = '#2A1410';
const AMBER      = '#D97706';
const GREEN      = '#059669';

// ── Lucide-style icon set ─────────────────────────────────────────
const ICON = {
  hardhat:    s => `<path d="M${s*0.15} ${s*0.7} Q${s*0.5} ${s*0.25} ${s*0.85} ${s*0.7}"/><line x1="${s*0.1}" y1="${s*0.72}" x2="${s*0.9}" y2="${s*0.72}"/><line x1="${s*0.5}" y1="${s*0.3}" x2="${s*0.5}" y2="${s*0.7}"/>`,
  pencil:     s => `<path d="M${s*0.2} ${s*0.8} L${s*0.7} ${s*0.3} L${s*0.8} ${s*0.4} L${s*0.3} ${s*0.9} Z"/><line x1="${s*0.6}" y1="${s*0.4}" x2="${s*0.7}" y2="${s*0.5}"/>`,
  list:       s => `<line x1="${s*0.15}" y1="${s*0.25}" x2="${s*0.85}" y2="${s*0.25}"/><line x1="${s*0.15}" y1="${s*0.5}" x2="${s*0.85}" y2="${s*0.5}"/><line x1="${s*0.15}" y1="${s*0.75}" x2="${s*0.85}" y2="${s*0.75}"/>`,
  box:        s => `<rect x="${s*0.15}" y="${s*0.25}" width="${s*0.7}" height="${s*0.55}" rx="3"/><line x1="${s*0.15}" y1="${s*0.45}" x2="${s*0.85}" y2="${s*0.45}"/><line x1="${s*0.5}" y1="${s*0.25}" x2="${s*0.5}" y2="${s*0.45}"/>`,
  money:      s => `<rect x="${s*0.15}" y="${s*0.3}" width="${s*0.7}" height="${s*0.4}" rx="3"/><circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.12}"/>`,
  bar:        s => `<rect x="${s*0.15}" y="${s*0.6}" width="${s*0.15}" height="${s*0.3}"/><rect x="${s*0.42}" y="${s*0.35}" width="${s*0.15}" height="${s*0.55}"/><rect x="${s*0.7}" y="${s*0.15}" width="${s*0.15}" height="${s*0.75}"/>`,
  signature:  s => `<path d="M${s*0.15} ${s*0.5} Q${s*0.3} ${s*0.3} ${s*0.45} ${s*0.5} T${s*0.75} ${s*0.5}"/><line x1="${s*0.1}" y1="${s*0.7}" x2="${s*0.9}" y2="${s*0.7}"/>`,
  check:      s => `<circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.4}"/><path d="M${s*0.32} ${s*0.5} L${s*0.45} ${s*0.63} L${s*0.68} ${s*0.37}"/>`,
  truck:      s => `<rect x="${s*0.1}" y="${s*0.35}" width="${s*0.5}" height="${s*0.35}" rx="2"/><path d="M${s*0.6} ${s*0.45} L${s*0.85} ${s*0.45} L${s*0.85} ${s*0.7} L${s*0.6} ${s*0.7}"/><circle cx="${s*0.3}" cy="${s*0.78}" r="${s*0.08}"/><circle cx="${s*0.7}" cy="${s*0.78}" r="${s*0.08}"/>`,
  cloud:      s => `<path d="M${s*0.3} ${s*0.7} Q${s*0.1} ${s*0.7} ${s*0.18} ${s*0.5} Q${s*0.2} ${s*0.3} ${s*0.45} ${s*0.32} Q${s*0.55} ${s*0.2} ${s*0.7} ${s*0.32} Q${s*0.92} ${s*0.32} ${s*0.85} ${s*0.55} Q${s*0.92} ${s*0.7} ${s*0.75} ${s*0.7} Z"/>`,
  bell:       s => `<path d="M${s*0.25} ${s*0.7} L${s*0.25} ${s*0.45} Q${s*0.25} ${s*0.2} ${s*0.5} ${s*0.2} Q${s*0.75} ${s*0.2} ${s*0.75} ${s*0.45} L${s*0.75} ${s*0.7} Z"/><line x1="${s*0.4}" y1="${s*0.8}" x2="${s*0.6}" y2="${s*0.8}"/>`,
  wa:         s => `<circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.4}"/><path d="M${s*0.35} ${s*0.5} Q${s*0.35} ${s*0.65} ${s*0.5} ${s*0.65} Q${s*0.6} ${s*0.65} ${s*0.62} ${s*0.58} L${s*0.55} ${s*0.55} Q${s*0.5} ${s*0.6} ${s*0.45} ${s*0.55} Q${s*0.4} ${s*0.5} ${s*0.45} ${s*0.45} L${s*0.42} ${s*0.38} Q${s*0.35} ${s*0.4} ${s*0.35} ${s*0.5}"/>`,
};

function ic(name, cx, cy, size, color, sw = 4) {
  return `<g stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(${cx - size/2}, ${cy - size/2})">${ICON[name](size)}</g>`;
}

function logoSvg(x, y, size) {
  const u = size / 32;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.18}" fill="${TERRACOTTA}"/>
    <rect x="${x + 5*u}"  y="${y + 18*u}" width="${6*u}" height="${9*u}"  rx="${u*0.6}" fill="${WHITE}"/>
    <rect x="${x + 13*u}" y="${y + 13*u}" width="${6*u}" height="${14*u}" rx="${u*0.6}" fill="${WHITE}"/>
    <rect x="${x + 21*u}" y="${y + 7*u}"  width="${6*u}" height="${20*u}" rx="${u*0.6}" fill="${WHITE}"/>
  `;
}

async function makePoster() {
  const W = 2480, H = 3508;
  const bandH = 400;

  const LIVE = [
    ['hardhat',   'Attendance',     'Mark workers on site'],
    ['pencil',    'Daily Logs',     'Photos + timestamp'],
    ['list',      'Tasks',          'Cascade to your team'],
    ['box',       'Materials',      'Stock, transfers, ledger'],
    ['money',     'Expenses',       'Receipts + approvals'],
    ['bar',       'Reports',        'One screen per site'],
  ];

  const SOON = [
    ['signature', 'Work Order PDF', 'Signed sub-contractor agreement'],
    ['check',     'Budget vs Actual', 'See material deviation live'],
    ['truck',     'Sub-contractors', 'Onboard, pay, track scope'],
    ['cloud',     'Your data, your Drive', 'Daily backup to your Google Drive'],
  ];

  const cardX  = 178;
  const cardW  = W - 356;

  // ── Vertical layout (3508 total) ──────────────────────────────
  // 0–400       Top band (logo + wordmark)
  // 460–600     Beta pill
  // 760–1080    Hero (2 lines × 200pt)
  // 1200–1320   Subhead (2 lines × 56pt)
  // 1380–2280   Live now panel (900h — 3 rows × ~250)
  // 2340–3000   Coming soon panel (660h — 2 rows × ~280)
  // 3060–3380   CTA card (320h — compressed, big number)
  // 3430        Footer text
  // 3480        Dots

  // Actually the CTA needs more room for big WhatsApp number. Let me re-plan:
  // 0–400        Top band
  // 460–600      Beta pill (140)
  // 760–1080     Hero
  // 1200–1320    Subhead
  // 1390–2200    Live now (810 — 3 rows × 220 + header 130)
  // 2260–2870    Coming soon (610 — 2 rows × 240 + header 130)
  // 2930–3390    CTA (460 — title + 2 steps + helper)
  // 3430         Footer + dots

  const liveY     = 1390;
  const liveH     = 810;
  const liveColW  = (cardW - 90) / 2;
  const liveRowH  = 220;

  const soonY     = 2260;
  const soonH     = 610;
  const soonColW  = (cardW - 90) / 2;
  const soonRowH  = 240;

  const ctaY      = 2930;
  const ctaH      = 460;

  function renderFeature(x, y, icon, label, desc, labelColor, iconColor, iconBg) {
    return `
      <circle cx="${x + 60}" cy="${y + 60}" r="56" fill="${iconBg}"/>
      ${ic(icon, x + 60, y + 60, 70, iconColor, 6)}
      <text x="${x + 150}" y="${y + 55}" font-family="'Arial Black', Arial, sans-serif" font-size="46" letter-spacing="3" fill="${labelColor}" font-weight="900">${label.toUpperCase()}</text>
      <text x="${x + 150}" y="${y + 105}" font-family="Calibri, Arial, sans-serif" font-size="36" fill="${DARK}">${desc}</text>
    `;
  }

  const liveSvg = LIVE.map(([icon, label, desc], i) => {
    const c = i % 2, r = Math.floor(i / 2);
    const x = cardX + 45 + c * (liveColW + 30);
    const y = liveY + 145 + r * liveRowH;
    return renderFeature(x, y, icon, label, desc, TERRACOTTA, TERRACOTTA, SAND);
  }).join('\n');

  const soonSvg = SOON.map(([icon, label, desc], i) => {
    const c = i % 2, r = Math.floor(i / 2);
    const x = cardX + 45 + c * (soonColW + 30);
    const y = soonY + 145 + r * soonRowH;
    return renderFeature(x, y, icon, label, desc, AMBER, AMBER, '#FEF3C7');
  }).join('\n');

  const dots = Array.from({ length: 6 }).map((_, i) =>
    `<circle cx="${190 + i * 60}" cy="${H - 50}" r="12" fill="${SAGE}"/>`).join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${TERRACOTTA}"/>

  <!-- ── Top sand band: logo + wordmark + website ─────────────── -->
  <rect x="0" y="0" width="${W}" height="${bandH}" fill="${SAND}"/>
  ${logoSvg(620, 75, 260)}
  <text x="930" y="210" font-family="Impact, 'Arial Black', sans-serif" font-size="170" letter-spacing="34" fill="${TERRACOTTA}" font-weight="900">STOREY</text>
  <text x="930" y="295" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="52" letter-spacing="5" fill="${TERRACOTTA}">storeyinfra.com</text>

  <!-- ── Beta pill ──────────────────────────────────────────── -->
  <rect x="178" y="460" width="980" height="140" rx="70" fill="${SAGE}"/>
  <text x="${178 + 980/2}" y="552" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-size="50" letter-spacing="8" fill="${WHITE}" font-weight="900">● BETA TESTERS WANTED</text>

  <!-- ── Hero headline ──────────────────────────────────────── -->
  <text x="178" y="840" font-family="Georgia, serif" font-size="190" fill="${WHITE}" font-weight="700">Try Storey today.</text>
  <text x="178" y="1050" font-family="Georgia, serif" font-size="190" fill="${WHITE}" font-weight="700">Shape what's next.</text>

  <!-- Subhead -->
  <text x="178" y="1230" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="54" fill="${SAND}">Site-operations app built for contractors in NE India.</text>
  <text x="178" y="1305" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="54" fill="${SAND}">Live in closed beta — your feedback shapes v1.2.</text>

  <!-- ── LIVE NOW panel ──────────────────────────────────────── -->
  <rect x="${cardX}" y="${liveY}" width="${cardW}" height="${liveH}" rx="36" fill="${SAND}"/>
  ${ic('check', cardX + 90, liveY + 85, 64, TERRACOTTA, 6)}
  <text x="${cardX + 150}" y="${liveY + 105}" font-family="Georgia, serif" font-size="58" fill="${TERRACOTTA}" font-weight="700">Live right now</text>
  <text x="${cardX + cardW - 40}" y="${liveY + 105}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="30" fill="${DARK}">v1.1.5 · Android + web</text>
  ${liveSvg}

  <!-- ── COMING SOON panel ───────────────────────────────────── -->
  <rect x="${cardX}" y="${soonY}" width="${cardW}" height="${soonH}" rx="36" fill="${WHITE}"/>
  ${ic('bell', cardX + 90, soonY + 85, 64, AMBER, 6)}
  <text x="${cardX + 150}" y="${soonY + 105}" font-family="Georgia, serif" font-size="58" fill="${AMBER}" font-weight="700">Coming in 3 weeks</text>
  <text x="${cardX + cardW - 40}" y="${soonY + 105}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="30" fill="${DARK}">v1.2 · shaped by your feedback</text>
  ${soonSvg}

  <!-- ── CTA — WhatsApp + Gmail capture ────────────────────── -->
  <rect x="${cardX}" y="${ctaY}" width="${cardW}" height="${ctaH}" rx="36" fill="${SAND}"/>
  <text x="${W/2}" y="${ctaY + 95}" text-anchor="middle" font-family="Georgia, serif" font-size="68" fill="${TERRACOTTA}" font-weight="700">Get beta access — WhatsApp me</text>

  <!-- Sage WhatsApp ribbon -->
  <rect x="${cardX + 80}" y="${ctaY + 145}" width="${cardW - 160}" height="180" rx="22" fill="${GREEN}"/>
  ${ic('wa', cardX + 165, ctaY + 235, 90, WHITE, 7)}
  <text x="${cardX + 240}" y="${ctaY + 215}" font-family="Calibri, Arial, sans-serif" font-size="40" fill="${WHITE}">WhatsApp your Gmail to</text>
  <text x="${cardX + 240}" y="${ctaY + 285}" font-family="Georgia, serif" font-size="78" fill="${WHITE}" font-weight="700">+91 98640 66898</text>

  <!-- Helper -->
  <text x="${W/2}" y="${ctaY + 380}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="36" fill="${DARK}">Send the Gmail you use on your Android phone —</text>
  <text x="${W/2}" y="${ctaY + 425}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="36" fill="${DARK}">you'll get the Play Store install link within 1 hour.</text>

  <!-- ── Founder footer ─────────────────────────────────────── -->
  <text x="${W/2}" y="${H - 100}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="42" fill="${SAND}">Karun  ·  storeyinfra.com</text>

  ${dots}
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(OUT_JPG);
  await sharp(Buffer.from(svg)).png().toFile(OUT_PNG);
  console.log('JPG written:', OUT_JPG);
  console.log('PNG written:', OUT_PNG);
}

makePoster().catch((e) => { console.error(e); process.exit(1); });
