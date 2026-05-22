// Storey — illustration library v2: 12 construction subjects.
// Stroke-only, terracotta on sand, no text labels.
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const TERRACOTTA = '#B85042';
const SAND       = '#E7E8D1';
const DARK       = '#2A1410';
const GRAY200    = '#E5E7EB';
const GRAY400    = '#9CA3AF';
const GRAY600    = '#4B5563';
const GRAY800    = '#1F2937';
const RED        = '#DC2626';
const GREEN      = '#059669';
const BG         = '#F9FAFB';

const sw = 3;
const strokeAttrs = `stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

function frame(x, y, size) {
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size*0.08}" fill="${SAND}"/>`;
}

// ─── 12 illustrations, drawn as pure stroke art ──────────────

// 1. CEMENT BAG (single, with gusset seam) — REPLACES the text-in-box version
function illuCement(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <path d="M${s*0.3} ${s*0.25} Q${s*0.3} ${s*0.2} ${s*0.4} ${s*0.2}
               L${s*0.6} ${s*0.2} Q${s*0.7} ${s*0.2} ${s*0.7} ${s*0.25}
               L${s*0.75} ${s*0.82} Q${s*0.75} ${s*0.85} ${s*0.7} ${s*0.85}
               L${s*0.3} ${s*0.85} Q${s*0.25} ${s*0.85} ${s*0.25} ${s*0.82} Z"/>
      <line x1="${s*0.3}" y1="${s*0.35}" x2="${s*0.7}" y2="${s*0.35}"/>
      <line x1="${s*0.4}" y1="${s*0.2}" x2="${s*0.6}" y2="${s*0.2}"/>
      <line x1="${s*0.5}" y1="${s*0.35}" x2="${s*0.5}" y2="${s*0.85}" stroke-dasharray="3,4"/>
    </g>
  `;
}

// 2. STACKED CEMENT BAGS (3-bag stack — alt for inventory)
function illuCementStack(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      ${[0.55, 0.4, 0.25].map((py, i) => `
        <rect x="${s*0.22}" y="${s*py}" width="${s*0.56}" height="${s*0.13}" rx="${s*0.02}"/>
        <line x1="${s*0.5}" y1="${s*py}" x2="${s*0.5}" y2="${s*(py+0.13)}" stroke-dasharray="2,3"/>
      `).join('')}
      <line x1="${s*0.15}" y1="${s*0.82}" x2="${s*0.85}" y2="${s*0.82}" stroke="${DARK}" stroke-width="2"/>
    </g>
  `;
}

// 3. SAND PILE (conical heap)
function illuSand(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <path d="M${s*0.12} ${s*0.78} Q${s*0.3} ${s*0.45} ${s*0.5} ${s*0.3}
               Q${s*0.7} ${s*0.45} ${s*0.88} ${s*0.78} Z"/>
      <path d="M${s*0.25} ${s*0.65} Q${s*0.35} ${s*0.55} ${s*0.42} ${s*0.6}" stroke-width="${sw*0.6}"/>
      <path d="M${s*0.55} ${s*0.6} Q${s*0.62} ${s*0.55} ${s*0.72} ${s*0.65}" stroke-width="${sw*0.6}"/>
      <circle cx="${s*0.35}" cy="${s*0.72}" r="2" fill="${TERRACOTTA}" stroke="none"/>
      <circle cx="${s*0.5}" cy="${s*0.55}" r="2" fill="${TERRACOTTA}" stroke="none"/>
      <circle cx="${s*0.65}" cy="${s*0.7}" r="2" fill="${TERRACOTTA}" stroke="none"/>
      <line x1="${s*0.08}" y1="${s*0.82}" x2="${s*0.92}" y2="${s*0.82}" stroke="${DARK}" stroke-width="2"/>
    </g>
  `;
}

// 4. BRICK STACK (cross-hatched layers)
function illuBricks(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      ${[0.25, 0.42, 0.59].map((py, row) => {
        const offset = row % 2 === 1 ? s*0.075 : 0;
        return [0, 1, 2, 3].map(c => {
          const px = s*0.18 + offset + c*s*0.15;
          if (px + s*0.13 > s*0.88) return '';
          return `<rect x="${px}" y="${s*py}" width="${s*0.13}" height="${s*0.13}" rx="${s*0.015}"/>`;
        }).join('');
      }).join('')}
      <line x1="${s*0.1}" y1="${s*0.78}" x2="${s*0.9}" y2="${s*0.78}" stroke="${DARK}" stroke-width="2"/>
    </g>
  `;
}

// 5. REBAR BUNDLE (rods seen end-on with a binding band)
function illuRebar(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <ellipse cx="${s*0.5}" cy="${s*0.5}" rx="${s*0.3}" ry="${s*0.3}" stroke-width="${sw*0.7}" stroke-dasharray="3,4"/>
      ${[
        [0.5, 0.32], [0.38, 0.42], [0.62, 0.42],
        [0.32, 0.55], [0.5, 0.55], [0.68, 0.55],
        [0.38, 0.68], [0.62, 0.68], [0.5, 0.78]
      ].map(([cx, cy]) => `<circle cx="${s*cx}" cy="${s*cy}" r="${s*0.05}"/>`).join('')}
    </g>
  `;
}

// 6. REBAR LONG (long bars laid out — alt for transfer/receipt)
function illuRebarLong(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <line x1="${s*0.1}" y1="${s*0.35}" x2="${s*0.9}" y2="${s*0.35}"/>
      <line x1="${s*0.1}" y1="${s*0.5}" x2="${s*0.9}" y2="${s*0.5}"/>
      <line x1="${s*0.1}" y1="${s*0.65}" x2="${s*0.9}" y2="${s*0.65}"/>
      <!-- ribbed marks -->
      ${[0.2, 0.35, 0.5, 0.65, 0.8].map(px => `
        <line x1="${s*px}" y1="${s*0.32}" x2="${s*px}" y2="${s*0.38}" stroke-width="1.5"/>
        <line x1="${s*px}" y1="${s*0.47}" x2="${s*px}" y2="${s*0.53}" stroke-width="1.5"/>
        <line x1="${s*px}" y1="${s*0.62}" x2="${s*px}" y2="${s*0.68}" stroke-width="1.5"/>
      `).join('')}
    </g>
  `;
}

// 7. RAILING (kept — already good)
function illuRailing(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <line x1="${s*0.15}" y1="${s*0.32}" x2="${s*0.85}" y2="${s*0.32}"/>
      <line x1="${s*0.15}" y1="${s*0.68}" x2="${s*0.85}" y2="${s*0.68}"/>
      ${[0,1,2,3,4].map(i => {
        const px = s*0.2 + i * (s*0.6/4);
        return `<line x1="${px}" y1="${s*0.25}" x2="${px}" y2="${s*0.75}"/>`;
      }).join('')}
      <line x1="${s*0.1}" y1="${s*0.82}" x2="${s*0.9}" y2="${s*0.82}" stroke="${DARK}" stroke-width="2"/>
    </g>
  `;
}

// 8. PAVER (kept)
function illuPaver(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g stroke="${TERRACOTTA}" stroke-width="${sw*0.85}" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(${x}, ${y})">
      ${Array.from({length: 3}).map((_,r) =>
        Array.from({length: 3}).map((_,c) => {
          const px = s*0.18 + c*(s*0.22) + (r%2?s*0.11:0);
          const py = s*0.22 + r*(s*0.22);
          return `<rect x="${px}" y="${py}" width="${s*0.18}" height="${s*0.18}" rx="2"/>`;
        }).join('')
      ).join('')}
    </g>
  `;
}

// 9. FOUNDATION (kept — columns rising from ground)
function illuFoundation(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <line x1="${s*0.1}" y1="${s*0.78}" x2="${s*0.9}" y2="${s*0.78}"/>
      <line x1="${s*0.25}" y1="${s*0.4}" x2="${s*0.25}" y2="${s*0.78}"/>
      <line x1="${s*0.5}" y1="${s*0.3}" x2="${s*0.5}" y2="${s*0.78}"/>
      <line x1="${s*0.75}" y1="${s*0.35}" x2="${s*0.75}" y2="${s*0.78}"/>
    </g>
    <rect x="${x+s*0.18}" y="${y+s*0.78}" width="${s*0.14}" height="${s*0.08}" fill="${TERRACOTTA}"/>
    <rect x="${x+s*0.43}" y="${y+s*0.78}" width="${s*0.14}" height="${s*0.08}" fill="${TERRACOTTA}"/>
    <rect x="${x+s*0.68}" y="${y+s*0.78}" width="${s*0.14}" height="${s*0.08}" fill="${TERRACOTTA}"/>
  `;
}

// 10. SLAB v2 — clearer concrete plank
function illuSlab(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <!-- top isometric face -->
      <polygon points="${s*0.15},${s*0.5} ${s*0.5},${s*0.3} ${s*0.85},${s*0.5} ${s*0.5},${s*0.7}"/>
      <!-- bottom of slab edge -->
      <line x1="${s*0.15}" y1="${s*0.5}" x2="${s*0.15}" y2="${s*0.6}"/>
      <line x1="${s*0.85}" y1="${s*0.5}" x2="${s*0.85}" y2="${s*0.6}"/>
      <line x1="${s*0.5}" y1="${s*0.7}" x2="${s*0.5}" y2="${s*0.8}"/>
      <line x1="${s*0.15}" y1="${s*0.6}" x2="${s*0.5}" y2="${s*0.8}"/>
      <line x1="${s*0.85}" y1="${s*0.6}" x2="${s*0.5}" y2="${s*0.8}"/>
      <!-- rebar grid on top -->
      <line x1="${s*0.3}" y1="${s*0.43}" x2="${s*0.6}" y2="${s*0.58}" stroke-width="1.5"/>
      <line x1="${s*0.4}" y1="${s*0.38}" x2="${s*0.7}" y2="${s*0.52}" stroke-width="1.5"/>
      <line x1="${s*0.4}" y1="${s*0.58}" x2="${s*0.7}" y2="${s*0.43}" stroke-width="1.5"/>
      <line x1="${s*0.3}" y1="${s*0.52}" x2="${s*0.6}" y2="${s*0.38}" stroke-width="1.5"/>
    </g>
  `;
}

// 11. SCAFFOLD (X-braced uprights)
function illuScaffold(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <!-- uprights -->
      <line x1="${s*0.25}" y1="${s*0.2}" x2="${s*0.25}" y2="${s*0.82}"/>
      <line x1="${s*0.55}" y1="${s*0.2}" x2="${s*0.55}" y2="${s*0.82}"/>
      <line x1="${s*0.85}" y1="${s*0.2}" x2="${s*0.85}" y2="${s*0.82}"/>
      <!-- horizontal rungs -->
      <line x1="${s*0.2}" y1="${s*0.35}" x2="${s*0.9}" y2="${s*0.35}"/>
      <line x1="${s*0.2}" y1="${s*0.65}" x2="${s*0.9}" y2="${s*0.65}"/>
      <!-- X-bracing -->
      <line x1="${s*0.25}" y1="${s*0.35}" x2="${s*0.55}" y2="${s*0.65}" stroke-width="${sw*0.7}"/>
      <line x1="${s*0.55}" y1="${s*0.35}" x2="${s*0.25}" y2="${s*0.65}" stroke-width="${sw*0.7}"/>
      <line x1="${s*0.55}" y1="${s*0.35}" x2="${s*0.85}" y2="${s*0.65}" stroke-width="${sw*0.7}"/>
      <line x1="${s*0.85}" y1="${s*0.35}" x2="${s*0.55}" y2="${s*0.65}" stroke-width="${sw*0.7}"/>
    </g>
  `;
}

// 12. TILE STACK (top-down + isometric layers)
function illuTiles(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      ${[0, 0.05, 0.1, 0.15].map((offset, i) => `
        <rect x="${s*(0.22 + offset)}" y="${s*(0.6 - offset)}" width="${s*0.55}" height="${s*0.12}" rx="2"/>
      `).join('')}
    </g>
  `;
}

// 13. PAINT BUCKET
function illuPaint(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <path d="M${s*0.28} ${s*0.35} L${s*0.32} ${s*0.85} Q${s*0.32} ${s*0.88} ${s*0.36} ${s*0.88}
               L${s*0.64} ${s*0.88} Q${s*0.68} ${s*0.88} ${s*0.68} ${s*0.85}
               L${s*0.72} ${s*0.35}"/>
      <ellipse cx="${s*0.5}" cy="${s*0.35}" rx="${s*0.22}" ry="${s*0.07}"/>
      <path d="M${s*0.3} ${s*0.32} Q${s*0.5} ${s*0.18} ${s*0.7} ${s*0.32}" stroke-width="${sw*0.7}"/>
      <!-- paint drip -->
      <path d="M${s*0.4} ${s*0.5} Q${s*0.42} ${s*0.58} ${s*0.4} ${s*0.62}" stroke-width="${sw*0.7}"/>
    </g>
  `;
}

// 14. HARDHAT (worker symbol)
function illuHardhat(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <path d="M${s*0.18} ${s*0.7} Q${s*0.5} ${s*0.25} ${s*0.82} ${s*0.7}"/>
      <line x1="${s*0.12}" y1="${s*0.72}" x2="${s*0.88}" y2="${s*0.72}"/>
      <line x1="${s*0.5}" y1="${s*0.3}" x2="${s*0.5}" y2="${s*0.7}"/>
      <path d="M${s*0.35} ${s*0.4} L${s*0.35} ${s*0.7}" stroke-width="${sw*0.7}"/>
      <path d="M${s*0.65} ${s*0.4} L${s*0.65} ${s*0.7}" stroke-width="${sw*0.7}"/>
    </g>
  `;
}

// 15. TRUCK (transfer)
function illuTruck(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <rect x="${s*0.15}" y="${s*0.4}" width="${s*0.4}" height="${s*0.3}" rx="2"/>
      <path d="M${s*0.55} ${s*0.5} L${s*0.75} ${s*0.5} L${s*0.8} ${s*0.6} L${s*0.8} ${s*0.7} L${s*0.55} ${s*0.7} Z"/>
      <circle cx="${s*0.3}" cy="${s*0.75}" r="${s*0.06}"/>
      <circle cx="${s*0.7}" cy="${s*0.75}" r="${s*0.06}"/>
    </g>
  `;
}

// 16. SITE / BUILDING
function illuBuilding(x, y, s) {
  return `
    ${frame(x, y, s)}
    <g ${strokeAttrs} transform="translate(${x}, ${y})">
      <rect x="${s*0.25}" y="${s*0.3}" width="${s*0.5}" height="${s*0.55}"/>
      <line x1="${s*0.12}" y1="${s*0.85}" x2="${s*0.88}" y2="${s*0.85}" stroke="${DARK}" stroke-width="2"/>
      <rect x="${s*0.32}" y="${s*0.4}" width="${s*0.1}" height="${s*0.12}"/>
      <rect x="${s*0.58}" y="${s*0.4}" width="${s*0.1}" height="${s*0.12}"/>
      <rect x="${s*0.32}" y="${s*0.58}" width="${s*0.1}" height="${s*0.12}"/>
      <rect x="${s*0.58}" y="${s*0.58}" width="${s*0.1}" height="${s*0.12}"/>
      <rect x="${s*0.43}" y="${s*0.7}" width="${s*0.14}" height="${s*0.15}"/>
    </g>
  `;
}

// ─────────────────────────────────────────────────────────────────
async function makeMockup() {
  const W = 1900, H = 1500;

  // Old cement (text-in-box) for the BEFORE block
  function oldCement(x, y, s) {
    return `
      ${frame(x, y, s)}
      <g ${strokeAttrs} transform="translate(${x}, ${y})">
        <rect x="${s*0.25}" y="${s*0.25}" width="${s*0.5}" height="${s*0.6}" rx="3"/>
        <line x1="${s*0.25}" y1="${s*0.4}" x2="${s*0.75}" y2="${s*0.4}"/>
      </g>
      <text x="${x+s*0.5}" y="${y+s*0.65}" text-anchor="middle" font-family="Arial Black, Arial" font-size="${s*0.13}" fill="${TERRACOTTA}" font-weight="900">CEMENT</text>
    `;
  }

  const subjects = [
    [illuCement,      'Cement bag',         'material · primary',       0],
    [illuCementStack, 'Cement stack',       'material · alt',           1],
    [illuSand,        'Sand pile',          'material',                 2],
    [illuBricks,      'Brick stack',        'material',                 3],
    [illuRebar,       'Rebar bundle',       'material · end-on',        4],
    [illuRebarLong,   'Rebar long',         'material · alt',           5],
    [illuRailing,     'Railing',            'work type',                6],
    [illuPaver,       'Paver',              'work type',                7],
    [illuFoundation,  'Foundation columns', 'work type',                8],
    [illuSlab,        'Slab + rebar grid',  'work type',                9],
    [illuScaffold,    'Scaffold',           'work type · equipment',   10],
    [illuTiles,       'Tile stack',         'material',                11],
    [illuPaint,       'Paint bucket',       'material · finishing',    12],
    [illuHardhat,     'Hardhat',            'role · worker',           13],
    [illuTruck,       'Truck',              'verb · transfer',         14],
    [illuBuilding,    'Building / site',    'site',                    15],
  ];

  const cellW = 220, cellH = 230, illuSize = 130;
  const cols = 4;
  const gridStartX = 80, gridStartY = 340;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="${W/2}" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${DARK}" font-weight="700">
    Storey illustration library v2 — 16 subjects
  </text>
  <text x="${W/2}" y="100" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY600}" font-style="italic">
    Stroke-only · terracotta on sand · no text labels. Ship as React components under src/components/illustrations/.
  </text>

  <!-- BEFORE / AFTER for cement -->
  <text x="${W/2}" y="160" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="15" fill="${GRAY800}" font-weight="700" letter-spacing="2">CEMENT — REDESIGNED</text>

  <rect x="500" y="180" width="180" height="40" rx="20" fill="${RED}"/>
  <text x="590" y="207" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="16" fill="white" font-weight="900" letter-spacing="2">BEFORE</text>

  <rect x="1220" y="180" width="180" height="40" rx="20" fill="${GREEN}"/>
  <text x="1310" y="207" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="16" fill="white" font-weight="900" letter-spacing="2">AFTER</text>

  ${oldCement(515, 235, 150)}
  <text x="590" y="410" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}" font-style="italic">Text in a box. Defeats the rule.</text>

  ${illuCement(1235, 235, 150)}
  <text x="1310" y="410" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}" font-style="italic">Bag silhouette with seam — reads as cement.</text>

  <!-- Library grid -->
  <text x="80" y="490" font-family="Georgia, serif" font-size="22" fill="${DARK}" font-weight="700">Full library</text>
  <line x1="80" y1="510" x2="${W-80}" y2="510" stroke="${GRAY200}"/>

  ${subjects.map(([fn, label, kind], i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const cx = gridStartX + c * (cellW + 220) + (cellW - illuSize) / 2;
    const cy = 540 + r * 230;
    return `
      ${fn(cx, cy, illuSize)}
      <text x="${cx + illuSize/2}" y="${cy + illuSize + 28}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700">${label}</text>
      <text x="${cx + illuSize/2}" y="${cy + illuSize + 48}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="11" fill="${GRAY600}" font-style="italic">${kind}</text>
    `;
  }).join('')}

  <text x="${W/2}" y="${H - 30}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY800}" font-style="italic">
    Each ~1–2 KB inline SVG. Pure stroke art. No text. Drop-in React component on approval.
  </text>
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile('C:\\consne\\mockup-illustration-library.jpg');
  console.log('JPG written: C:\\consne\\mockup-illustration-library.jpg');
}

makeMockup().catch((e) => { console.error(e); process.exit(1); });
