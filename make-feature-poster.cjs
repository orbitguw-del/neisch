// Storey — "Feature ready, beta open" A4 portrait poster (PPTX + JPG).
// Follows .claude/skills/marketing/SKILL.md brand tokens. Uses storey-logo.svg.

const path = require('path');
const { execSync } = require('child_process');
const PptxGenJS = require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'pptxgenjs'));
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const OUT_PPTX = 'C:\\consne\\storey-feature-poster.pptx';
const OUT_JPG  = 'C:\\consne\\storey-feature-poster.jpg';

const TERRACOTTA = 'B85042';
const SAND       = 'E7E8D1';
const SAGE       = 'A7BEAE';
const WHITE      = 'FFFFFF';
const DARK       = '2A1410';

const FEATURES = [
  ['ATTENDANCE', 'Mark workers on site. Works offline.'],
  ['MATERIALS',  'Stock, transfers, ledger — append-only.'],
  ['DAILY LOGS', 'Photos with date-time burned in.'],
  ['TASKS',      'Assign down the chain. Track every delay.'],
  ['EXPENSES',   'Receipts, approvals, site-wise totals.'],
  ['REPORTS',    'One screen for every site, every day.'],
];

// ── Storey logo drawn from primitives (3 ascending white bars on rounded square) ─
function drawLogoPptx(slide, x, y, size) {
  const u = size / 32; // 32x32 viewBox
  slide.addShape('roundRect', {
    x, y, w: size, h: size,
    fill: { color: WHITE }, line: { color: WHITE }, rectRadius: size * 0.18,
  });
  slide.addShape('roundRect', {
    x: x + 0.5 * u, y: y + 0.5 * u, w: 31 * u, h: 31 * u,
    fill: { color: TERRACOTTA }, line: { color: TERRACOTTA }, rectRadius: size * 0.18,
  });
  // 3 bars
  const bars = [[5, 18, 6, 9], [13, 13, 6, 14], [21, 7, 6, 20]];
  bars.forEach(([bx, by, bw, bh]) => {
    slide.addShape('roundRect', {
      x: x + bx * u, y: y + by * u, w: bw * u, h: bh * u,
      fill: { color: WHITE }, line: { color: WHITE }, rectRadius: u * 0.6,
    });
  });
}

function logoSvg(x, y, size) {
  const u = size / 32;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.18}" fill="#${TERRACOTTA}"/>
    <rect x="${x + 5*u}"  y="${y + 18*u}" width="${6*u}" height="${9*u}"  rx="${u*0.6}" fill="#${WHITE}"/>
    <rect x="${x + 13*u}" y="${y + 13*u}" width="${6*u}" height="${14*u}" rx="${u*0.6}" fill="#${WHITE}"/>
    <rect x="${x + 21*u}" y="${y + 7*u}"  width="${6*u}" height="${20*u}" rx="${u*0.6}" fill="#${WHITE}"/>
  `;
}

// ── PPTX (A4 portrait 8.27" × 11.69") ────────────────────────────────────────
async function makePptx() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'A4P', width: 8.27, height: 11.69 });
  pptx.layout = 'A4P';
  pptx.title  = 'Storey — Feature ready · Beta open';

  const s = pptx.addSlide();
  s.background = { color: TERRACOTTA };

  // Top sand band with logo + wordmark + website
  s.addShape('rect', { x: 0, y: 0, w: 8.27, h: 1.4, fill: { color: SAND }, line: { color: SAND } });

  // Logo (left of wordmark)
  drawLogoPptx(s, 2.05, 0.25, 0.9);

  // Wordmark
  s.addText('STOREY', {
    x: 3.1, y: 0.25, w: 4.0, h: 0.7,
    valign: 'middle',
    fontFace: 'Impact', fontSize: 54, color: TERRACOTTA, charSpacing: 14, bold: true,
  });
  // Website under wordmark
  s.addText('storeyinfra.com', {
    x: 3.1, y: 0.95, w: 4.0, h: 0.3,
    valign: 'middle',
    fontFace: 'Calibri', fontSize: 16, color: TERRACOTTA, italic: true, charSpacing: 3,
  });

  // "APP IN BETA TESTING" tag
  s.addShape('roundRect', {
    x: 0.6, y: 1.65, w: 3.1, h: 0.5,
    fill: { color: SAGE }, line: { color: SAGE }, rectRadius: 0.25,
  });
  s.addText('● APP IN BETA TESTING', {
    x: 0.6, y: 1.65, w: 3.1, h: 0.5,
    align: 'center', valign: 'middle',
    fontFace: 'Arial Black', fontSize: 15, color: WHITE, charSpacing: 4, bold: true,
  });

  // Hero headline — bigger
  s.addText('Every feature\nis ready.', {
    x: 0.6, y: 2.3, w: 7.07, h: 2.6,
    fontFace: 'Georgia', fontSize: 76, color: WHITE, bold: true, lineSpacingMultiple: 1.0,
  });

  // Subhead — bigger
  s.addText('Six modules. One app. Built for contractors\nin Northeast India — open for beta now.', {
    x: 0.6, y: 4.9, w: 7.07, h: 1.0,
    fontFace: 'Calibri', fontSize: 22, color: SAND, italic: true, lineSpacingMultiple: 1.2,
  });

  // Feature card
  s.addShape('roundRect', {
    x: 0.6, y: 6.05, w: 7.07, h: 3.0,
    fill: { color: SAND }, line: { color: SAND }, rectRadius: 0.2,
  });

  const colW = 3.35;
  const rowH = 0.92;
  const startX = 0.85, startY = 6.2;
  FEATURES.forEach(([title, sub], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = startX + col * (colW + 0.1);
    const y = startY + row * rowH;
    s.addShape('ellipse', {
      x, y: y + 0.04, w: 0.55, h: 0.55,
      fill: { color: SAGE }, line: { color: SAGE },
    });
    s.addText(String(i + 1), {
      x, y: y + 0.04, w: 0.55, h: 0.55,
      align: 'center', valign: 'middle',
      fontFace: 'Impact', fontSize: 24, color: WHITE, bold: true,
    });
    s.addText(title, {
      x: x + 0.7, y: y, w: colW - 0.7, h: 0.36,
      fontFace: 'Arial Black', fontSize: 16, color: TERRACOTTA, charSpacing: 4, bold: true,
    });
    s.addText(sub, {
      x: x + 0.7, y: y + 0.36, w: colW - 0.7, h: 0.5,
      fontFace: 'Calibri', fontSize: 14, color: DARK, lineSpacingMultiple: 1.15,
    });
  });

  // CTA panel
  s.addShape('roundRect', {
    x: 0.6, y: 9.2, w: 7.07, h: 1.85,
    fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.18,
  });
  s.addText('Join the beta in 2 steps', {
    x: 0.6, y: 9.3, w: 7.07, h: 0.55,
    align: 'center',
    fontFace: 'Georgia', fontSize: 28, color: TERRACOTTA, bold: true,
  });

  // Step 1
  s.addShape('ellipse', {
    x: 0.95, y: 9.95, w: 0.42, h: 0.42,
    fill: { color: TERRACOTTA }, line: { color: TERRACOTTA },
  });
  s.addText('1', {
    x: 0.95, y: 9.95, w: 0.42, h: 0.42,
    align: 'center', valign: 'middle',
    fontFace: 'Impact', fontSize: 20, color: WHITE, bold: true,
  });
  s.addText('Visit', {
    x: 1.5, y: 9.9, w: 0.9, h: 0.5,
    fontFace: 'Calibri', fontSize: 18, color: DARK, valign: 'middle',
  });
  s.addText('storeyinfra.com', {
    x: 2.05, y: 9.9, w: 5.6, h: 0.5,
    fontFace: 'Georgia', fontSize: 22, color: TERRACOTTA, bold: true, valign: 'middle',
  });

  // Step 2
  s.addShape('ellipse', {
    x: 0.95, y: 10.42, w: 0.42, h: 0.42,
    fill: { color: TERRACOTTA }, line: { color: TERRACOTTA },
  });
  s.addText('2', {
    x: 0.95, y: 10.42, w: 0.42, h: 0.42,
    align: 'center', valign: 'middle',
    fontFace: 'Impact', fontSize: 20, color: WHITE, bold: true,
  });
  s.addText('Email', {
    x: 1.5, y: 10.37, w: 0.9, h: 0.5,
    fontFace: 'Calibri', fontSize: 18, color: DARK, valign: 'middle',
  });
  s.addText('help@storeyinfra.com', {
    x: 2.1, y: 10.37, w: 5.5, h: 0.5,
    fontFace: 'Georgia', fontSize: 22, color: TERRACOTTA, bold: true, valign: 'middle',
  });

  // Founder footer
  s.addText('Karun  ·  +91 98640 66898  ·  WhatsApp us', {
    x: 0.6, y: 11.2, w: 7.07, h: 0.4,
    align: 'center', valign: 'middle',
    fontFace: 'Calibri', fontSize: 15, color: SAND, italic: true,
  });

  // Sage dots motif
  for (let i = 0; i < 6; i++) {
    s.addShape('ellipse', {
      x: 0.6 + i * 0.22, y: 11.55, w: 0.1, h: 0.1,
      fill: { color: SAGE }, line: { color: SAGE },
    });
  }

  await pptx.writeFile({ fileName: OUT_PPTX });
  console.log('PPTX written:', OUT_PPTX);
}

// ── JPG (A4 @ 300dpi = 2480 × 3508) ──────────────────────────────────────────
async function makeJpg() {
  const W = 2480, H = 3508;
  const bandH = 420;

  // Feature grid
  const cardX = 178, cardY = 1820, cardW = W - 356, cardH = 990;
  const colW = (cardW - 90) / 2;
  const rowH = 295;
  const padX = 75;

  const featSvg = FEATURES.map(([title, sub], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = cardX + padX + col * (colW + 30);
    const y = cardY + 65 + row * rowH;
    return `
      <circle cx="${x + 60}" cy="${y + 60}" r="58" fill="#${SAGE}"/>
      <text x="${x + 60}" y="${y + 82}" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="68" fill="#${WHITE}" font-weight="900">${i + 1}</text>
      <text x="${x + 155}" y="${y + 52}" font-family="'Arial Black', Arial, sans-serif" font-size="48" letter-spacing="5" fill="#${TERRACOTTA}" font-weight="900">${title}</text>
      <text x="${x + 155}" y="${y + 110}" font-family="Calibri, Arial, sans-serif" font-size="38" fill="#${DARK}">${sub}</text>
    `;
  }).join('\n');

  const dots = Array.from({ length: 6 }).map((_, i) =>
    `<circle cx="${190 + i * 65}" cy="3475" r="13" fill="#${SAGE}"/>`).join('');

  const ctaY = 2860;
  const ctaH = 500;

  // Logo position in top band: centered horizontally with wordmark beside it
  const logoSize = 270;
  const logoX = 610;
  const logoY = 75;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#${TERRACOTTA}"/>

  <!-- Top sand band: logo + wordmark + website -->
  <rect x="0" y="0" width="${W}" height="${bandH}" fill="#${SAND}"/>
  ${logoSvg(logoX, logoY, logoSize)}
  <text x="${logoX + logoSize + 50}" y="200"
        font-family="Impact, 'Arial Black', sans-serif"
        font-size="160" letter-spacing="32" fill="#${TERRACOTTA}" font-weight="900">STOREY</text>
  <text x="${logoX + logoSize + 50}" y="290"
        font-family="Calibri, Arial, sans-serif" font-style="italic"
        font-size="50" letter-spacing="5" fill="#${TERRACOTTA}">storeyinfra.com</text>

  <!-- BETA TESTING pill -->
  <rect x="180" y="490" width="950" height="140" rx="70" fill="#${SAGE}"/>
  <text x="${180 + 950/2}" y="582" text-anchor="middle"
        font-family="'Arial Black', Arial, sans-serif"
        font-size="46" letter-spacing="8" fill="#${WHITE}" font-weight="900">● APP IN BETA TESTING</text>

  <!-- Hero headline — bigger -->
  <text x="180" y="850" font-family="Georgia, serif" font-size="240" fill="#${WHITE}" font-weight="700">Every feature</text>
  <text x="180" y="1110" font-family="Georgia, serif" font-size="240" fill="#${WHITE}" font-weight="700">is ready.</text>

  <!-- Subhead — bigger -->
  <text x="180" y="1480" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="68" fill="#${SAND}">Six modules. One app. Built for contractors</text>
  <text x="180" y="1570" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="68" fill="#${SAND}">in Northeast India — open for beta now.</text>

  <!-- Sand feature card -->
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="40" fill="#${SAND}"/>

  ${featSvg}

  <!-- CTA panel -->
  <rect x="180" y="${ctaY}" width="${W - 360}" height="${ctaH}" rx="50" fill="#${WHITE}"/>

  <text x="${W/2}" y="${ctaY + 100}" text-anchor="middle"
        font-family="Georgia, serif" font-size="80" fill="#${TERRACOTTA}" font-weight="700">Join the beta in 2 steps</text>

  <!-- Step 1 -->
  <circle cx="290" cy="${ctaY + 220}" r="44" fill="#${TERRACOTTA}"/>
  <text x="290" y="${ctaY + 238}" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="56" fill="#${WHITE}" font-weight="900">1</text>
  <text x="365" y="${ctaY + 238}" font-family="Calibri, Arial, sans-serif" font-size="50" fill="#${DARK}">Visit</text>
  <text x="510" y="${ctaY + 238}" font-family="Georgia, serif" font-size="62" fill="#${TERRACOTTA}" font-weight="700">storeyinfra.com</text>

  <!-- Step 2 -->
  <circle cx="290" cy="${ctaY + 360}" r="44" fill="#${TERRACOTTA}"/>
  <text x="290" y="${ctaY + 378}" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="56" fill="#${WHITE}" font-weight="900">2</text>
  <text x="365" y="${ctaY + 378}" font-family="Calibri, Arial, sans-serif" font-size="50" fill="#${DARK}">Email</text>
  <text x="530" y="${ctaY + 378}" font-family="Georgia, serif" font-size="62" fill="#${TERRACOTTA}" font-weight="700">help@storeyinfra.com</text>

  <!-- Founder footer (below CTA card) -->
  <text x="${W/2}" y="3420" text-anchor="middle"
        font-family="Calibri, Arial, sans-serif" font-style="italic"
        font-size="52" fill="#${SAND}">Karun  ·  +91 98640 66898  ·  WhatsApp us</text>

  ${dots}
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(OUT_JPG);
  console.log('JPG  written:', OUT_JPG);
}

(async () => { await makePptx(); await makeJpg(); })()
  .catch((e) => { console.error(e); process.exit(1); });
