// Generates StoreyInfra WhatsApp ad: portrait 9:16 PPTX + JPG.
// Brand: terracotta #B85042 (dominant), sand #E7E8D1, sage #A7BEAE, white.

const path = require('path');
const fs = require('fs');
const pptxgenPath = require('child_process')
  .execSync('npm root -g', { encoding: 'utf8' }).trim();
const PptxGenJS = require(path.join(pptxgenPath, 'pptxgenjs'));
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const OUT_PPTX = 'C:\\consne\\storey-whatsapp-ad.pptx';
const OUT_JPG  = 'C:\\consne\\storey-whatsapp-ad.jpg';

// ── Colors ───────────────────────────────────────────────────────────────────
const TERRACOTTA = 'B85042';
const SAND       = 'E7E8D1';
const SAGE       = 'A7BEAE';
const WHITE      = 'FFFFFF';
const DARK       = '2A1410';

// ── PPTX (portrait 9:16, ~5.625" x 10") ──────────────────────────────────────
async function makePptx() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'WA916', width: 5.625, height: 10 });
  pptx.layout = 'WA916';
  pptx.title  = 'StoreyInfra — WhatsApp ad';

  const s = pptx.addSlide();
  s.background = { color: TERRACOTTA };

  // Top sand band — small brand strip
  s.addShape('rect', { x: 0, y: 0, w: 5.625, h: 0.55, fill: { color: SAND }, line: { color: SAND } });
  s.addText('STOREY', {
    x: 0, y: 0.05, w: 5.625, h: 0.45,
    align: 'center', valign: 'middle',
    fontFace: 'Impact', fontSize: 24, color: TERRACOTTA, charSpacing: 8, bold: true,
  });

  // Hero headline (big)
  s.addText('Run your sites.\nNot your phone.', {
    x: 0.4, y: 0.95, w: 4.825, h: 2.2,
    align: 'left', valign: 'top',
    fontFace: 'Georgia', fontSize: 40, color: WHITE, bold: true, lineSpacingMultiple: 1.05,
  });

  // Subhead
  s.addText('A site-operations app built for contractors in Northeast India.', {
    x: 0.4, y: 3.1, w: 4.825, h: 0.8,
    align: 'left', valign: 'top',
    fontFace: 'Calibri', fontSize: 16, color: SAND, italic: true,
  });

  // Sage card with features
  s.addShape('roundRect', {
    x: 0.4, y: 4.1, w: 4.825, h: 3.7,
    fill: { color: SAND }, line: { color: SAND },
    rectRadius: 0.18,
  });

  // Card header
  s.addText('What you get', {
    x: 0.65, y: 4.25, w: 4.4, h: 0.45,
    fontFace: 'Georgia', fontSize: 18, color: TERRACOTTA, bold: true,
  });

  // Feature rows — sage circle bullet + bold + sub
  const features = [
    ['ATTENDANCE',  'Mark labour on site, even offline'],
    ['MATERIALS',   'Stock, transfers and ledger — clean'],
    ['DAILY LOGS',  'Photos with date-time stamp'],
    ['TASKS',       'Assign down the chain. Track delays'],
  ];
  const rowY0 = 4.85;
  const rowH  = 0.7;
  features.forEach(([title, sub], i) => {
    const y = rowY0 + i * rowH;
    // Sage circle
    s.addShape('ellipse', {
      x: 0.65, y: y + 0.08, w: 0.42, h: 0.42,
      fill: { color: SAGE }, line: { color: SAGE },
    });
    // Number/dot inside
    s.addText(String(i + 1), {
      x: 0.65, y: y + 0.08, w: 0.42, h: 0.42,
      align: 'center', valign: 'middle',
      fontFace: 'Impact', fontSize: 18, color: WHITE, bold: true,
    });
    s.addText(title, {
      x: 1.2, y: y + 0.02, w: 3.9, h: 0.32,
      fontFace: 'Arial Black', fontSize: 13, color: TERRACOTTA, charSpacing: 3, bold: true,
    });
    s.addText(sub, {
      x: 1.2, y: y + 0.32, w: 3.9, h: 0.32,
      fontFace: 'Calibri', fontSize: 13, color: DARK,
    });
  });

  // CTA band at the bottom — dark/terracotta button + URL
  s.addShape('roundRect', {
    x: 0.4, y: 8.05, w: 4.825, h: 0.95,
    fill: { color: WHITE }, line: { color: WHITE },
    rectRadius: 0.14,
  });
  s.addText('Try free at  storeyinfra.com', {
    x: 0.4, y: 8.05, w: 4.825, h: 0.95,
    align: 'center', valign: 'middle',
    fontFace: 'Georgia', fontSize: 20, color: TERRACOTTA, bold: true,
  });

  // Footer line — phone
  s.addText('Karun  ·  +91 98640 66898  ·  WhatsApp us', {
    x: 0.4, y: 9.15, w: 4.825, h: 0.55,
    align: 'center', valign: 'middle',
    fontFace: 'Calibri', fontSize: 13, color: SAND, italic: true,
  });

  // Tiny corner motif — sage dot ribbon
  for (let i = 0; i < 6; i++) {
    s.addShape('ellipse', {
      x: 0.4 + i * 0.18, y: 9.75, w: 0.08, h: 0.08,
      fill: { color: SAGE }, line: { color: SAGE },
    });
  }

  await pptx.writeFile({ fileName: OUT_PPTX });
  console.log('PPTX written:', OUT_PPTX);
}

// ── JPG (1080 x 1920 via SVG → sharp) ────────────────────────────────────────
async function makeJpg() {
  const W = 1080, H = 1920;
  // px helpers (slide is 5.625" x 10" → 192 dpi for 1080x1920)
  const features = [
    ['ATTENDANCE',  'Mark labour on site, even offline'],
    ['MATERIALS',   'Stock, transfers and ledger — clean'],
    ['DAILY LOGS',  'Photos with date-time stamp'],
    ['TASKS',       'Assign down the chain. Track delays'],
  ];

  const featRowsSvg = features.map(([t, sub], i) => {
    const y = 1000 + i * 135;
    return `
      <circle cx="160" cy="${y + 35}" r="42" fill="#${SAGE}"/>
      <text x="160" y="${y + 52}" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="46" fill="#${WHITE}" font-weight="700">${i + 1}</text>
      <text x="240" y="${y + 28}" font-family="'Arial Black', Arial, sans-serif" font-size="30" letter-spacing="3" fill="#${TERRACOTTA}" font-weight="900">${t}</text>
      <text x="240" y="${y + 70}" font-family="Calibri, Arial, sans-serif" font-size="28" fill="#${DARK}">${sub}</text>
    `;
  }).join('\n');

  const dots = Array.from({ length: 6 }).map((_, i) =>
    `<circle cx="${90 + i * 36}" cy="1875" r="8" fill="#${SAGE}"/>`).join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#${TERRACOTTA}"/>

  <!-- Top sand band -->
  <rect x="0" y="0" width="${W}" height="106" fill="#${SAND}"/>
  <text x="${W/2}" y="74" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif"
        font-size="56" letter-spacing="14" fill="#${TERRACOTTA}" font-weight="900">STOREY</text>

  <!-- Hero headline -->
  <text x="78" y="270" font-family="Georgia, serif" font-size="92" fill="#${WHITE}" font-weight="700">Run your sites.</text>
  <text x="78" y="370" font-family="Georgia, serif" font-size="92" fill="#${WHITE}" font-weight="700">Not your phone.</text>

  <!-- Subhead -->
  <text x="78" y="470" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="34" fill="#${SAND}">A site-operations app built for contractors</text>
  <text x="78" y="514" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="34" fill="#${SAND}">in Northeast India.</text>

  <!-- Sand feature card -->
  <rect x="78" y="787" width="924" height="710" rx="32" fill="#${SAND}"/>
  <text x="125" y="870" font-family="Georgia, serif" font-size="40" fill="#${TERRACOTTA}" font-weight="700">What you get</text>

  ${featRowsSvg}

  <!-- CTA white pill -->
  <rect x="78" y="1545" width="924" height="180" rx="28" fill="#${WHITE}"/>
  <text x="${W/2}" y="1660" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#${TERRACOTTA}" font-weight="700">Try free at storeyinfra.com</text>

  <!-- Footer line -->
  <text x="${W/2}" y="1790" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="32" fill="#${SAND}">Karun  ·  +91 98640 66898  ·  WhatsApp us</text>

  ${dots}
</svg>`;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile(OUT_JPG);
  console.log('JPG  written:', OUT_JPG);
}

(async () => {
  await makePptx();
  await makeJpg();
})().catch((e) => { console.error(e); process.exit(1); });
