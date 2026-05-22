// Three visual tiers — when to use icon vs line illustration vs photo.
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const TERRACOTTA = '#B85042';
const SAND       = '#E7E8D1';
const SAGE       = '#A7BEAE';
const DARK       = '#2A1410';
const AMBER      = '#D97706';
const GRAY200    = '#E5E7EB';
const GRAY400    = '#9CA3AF';
const GRAY600    = '#4B5563';
const GRAY800    = '#1F2937';
const BG         = '#F9FAFB';

// Tier 1 — ICON only (Lucide-style, single stroke symbol, monochrome)
function iconRailing(x, y, size) {
  const sw = 2.2;
  const cx = x + size/2, cy = y + size/2;
  const w = size * 0.55, h = size * 0.5;
  const x0 = cx - w/2, y0 = cy - h/2;
  return `
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <line x1="${x0}" y1="${y0+h*0.2}" x2="${x0+w}" y2="${y0+h*0.2}"/>
      <line x1="${x0}" y1="${y0+h*0.8}" x2="${x0+w}" y2="${y0+h*0.8}"/>
      ${[0,1,2,3].map(i => {
        const px = x0 + w*0.1 + i*(w*0.8/3);
        return `<line x1="${px}" y1="${y0}" x2="${px}" y2="${y0+h}"/>`;
      }).join('')}
    </g>
  `;
}

// Tier 2 — LINE ILLUSTRATION (more detail, scene-like)
function illustrationRailing(x, y, size) {
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

// Tier 3 — PHOTO (real image, simulated here as grey gradient)
function fakePhoto(x, y, size) {
  return `
    <defs>
      <linearGradient id="ph_${x}_${y}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3A3A3A"/>
        <stop offset="100%" stop-color="#6B6B6B"/>
      </linearGradient>
    </defs>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="url(#ph_${x}_${y})"/>
    <rect x="${x+size*0.07}" y="${y+size*0.25}" width="${size*0.86}" height="${size*0.07}" fill="#999"/>
    <rect x="${x+size*0.07}" y="${y+size*0.75}" width="${size*0.86}" height="${size*0.07}" fill="#999"/>
    ${[0,1,2,3,4].map(i =>
      `<rect x="${x+size*0.15+i*(size*0.18)}" y="${y+size*0.25}" width="${size*0.05}" height="${size*0.5}" fill="#999"/>`
    ).join('')}
    <rect x="${x+size*0.6}" y="${y+size*0.05}" width="${size*0.35}" height="${size*0.15}" fill="white" opacity="0.85" rx="3"/>
    <text x="${x+size*0.775}" y="${y+size*0.15}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="${size*0.07}" fill="${DARK}">20 May · 9:42</text>
  `;
}

async function makeMockup() {
  const W = 1900, H = 1200;
  const cardW = 540, cardH = 200;
  const startX = 100, startY = 240, gap = 60;

  const renderCard = (x, y, visual, stripe = AMBER) => `
    <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="16" fill="white" stroke="${GRAY200}" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="12" height="${cardH}" rx="6" fill="${stripe}"/>
    ${visual}
    <text x="${x+170}" y="${y+65}" font-family="Georgia, serif" font-size="24" fill="${DARK}" font-weight="700">Install Railing</text>
    <text x="${x+170}" y="${y+92}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">Block A · Pranab</text>
    <rect x="${x+170}" y="${y+108}" width="120" height="28" rx="14" fill="#FEF3C7"/>
    <text x="${x+230}" y="${y+128}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${AMBER}" font-weight="700">Working</text>
    <text x="${x+cardW-30}" y="${y+75}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="40" fill="${AMBER}" font-weight="900">2</text>
    <text x="${x+cardW-30}" y="${y+100}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}">days</text>
  `;

  // Visual blocks for each tier
  const iconBlock = (x, y) => `
    <circle cx="${x+65}" cy="${y+100}" r="38" fill="${SAND}"/>
    ${iconRailing(x+30, y+65, 70)}
  `;
  const illustrationBlock = (x, y) => illustrationRailing(x+30, y+50, 100);
  const photoBlock = (x, y) => fakePhoto(x+30, y+50, 100);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="${W/2}" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="${DARK}" font-weight="700">
    Three visual tiers — when to use which
  </text>
  <text x="${W/2}" y="100" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY600}" font-style="italic">
    Same task card. Three legitimate visual systems. Pick by purpose.
  </text>

  <!-- Tier labels -->
  <rect x="${startX}" y="160" width="${cardW}" height="44" rx="22" fill="${TERRACOTTA}"/>
  <text x="${startX + cardW/2}" y="190" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="3">TIER 1 · ICON</text>

  <rect x="${startX + cardW + gap}" y="160" width="${cardW}" height="44" rx="22" fill="${TERRACOTTA}"/>
  <text x="${startX + cardW + gap + cardW/2}" y="190" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="3">TIER 2 · ILLUSTRATION</text>

  <rect x="${startX + 2*(cardW + gap)}" y="160" width="${cardW}" height="44" rx="22" fill="${TERRACOTTA}"/>
  <text x="${startX + 2*(cardW + gap) + cardW/2}" y="190" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="3">TIER 3 · PHOTO</text>

  <!-- The three cards -->
  ${renderCard(startX, startY, iconBlock(startX, startY))}
  ${renderCard(startX + cardW + gap, startY, illustrationBlock(startX + cardW + gap, startY))}
  ${renderCard(startX + 2*(cardW + gap), startY, photoBlock(startX + 2*(cardW + gap), startY))}

  <!-- When to use each -->
  <g transform="translate(${startX}, 510)">
    ${[
      ['When to use it',
        'Compact display. Category recognition. Stripe alongside text.',
        'Card thumbnails. Empty states. Hero placeholders. Anything between 60–120px where a single icon would feel thin.',
        'Real evidence — site visit, worker ID, delivery proof, damage report. The image IS the data.'],
      ['Size',          '16–32px',                              '60–120px',                                                       'variable, 200px+ in galleries'],
      ['Source',        'Lucide React (1500+ icons, in repo)',  'Custom inline SVG components',                                   'User-uploaded photos via the existing photo pipeline'],
      ['File size',     '~0.5 KB',                              '~1–2 KB',                                                        '~30–80 KB JPG (compressed)'],
      ['Cost to add',   'Zero (already imported as needed)',    '~30 mins to design one new construction-specific illustration',  'Captured via the in-app camera, free'],
      ['Storey examples', 'Nav items · status chip icons · ledger row · small avatars', 'Task category · material category · empty state · onboarding screens', 'Daily log photo · attendance face · receipt scan · damage record'],
    ].map((row, i) => {
      const y = i * 70;
      const [label, c1, c2, c3] = row;
      return `
        <text x="0" y="${y+25}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700" letter-spacing="1">${label.toUpperCase()}</text>
        <text x="160" y="${y+25}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY800}">${c1}</text>
        <text x="760" y="${y+25}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY800}">${c2}</text>
        <text x="1360" y="${y+25}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY800}">${c3}</text>
        <line x1="0" y1="${y+45}" x2="${W-160}" y2="${y+45}" stroke="${GRAY200}" stroke-width="1"/>
      `;
    }).join('')}
  </g>

  <text x="${W/2}" y="1160" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${GRAY800}" font-style="italic">
    Never mix two tiers in the same card. Pick the smallest tier that does the job.
  </text>
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile('C:\\consne\\mockup-visual-tiers.jpg');
  console.log('JPG written: C:\\consne\\mockup-visual-tiers.jpg');
}

makeMockup().catch((e) => { console.error(e); process.exit(1); });
