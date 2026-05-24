// Storey v1.2.0 feature-update WhatsApp asset
// Portrait 9:16 PPTX + JPG  +  plain-text broadcast message
// Brand: terracotta #B85042 (dominant), sand #E7E8D1, sage #A7BEAE, white #FFFFFF

const path = require('path');
const fs   = require('fs');
const pptxgenPath = require('child_process')
  .execSync('npm root -g', { encoding: 'utf8' }).trim();
const PptxGenJS = require(path.join(pptxgenPath, 'pptxgenjs'));
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const OUT_PPTX = 'C:\\consne\\storey-v120-update.pptx';
const OUT_JPG  = 'C:\\consne\\storey-v120-update.jpg';
const OUT_TXT  = 'C:\\consne\\storey-v120-broadcast.txt';

const TERRACOTTA = 'B85042';
const SAND       = 'E7E8D1';
const SAGE       = 'A7BEAE';
const WHITE      = 'FFFFFF';
const DARK       = '2A1410';

// ── Broadcast text message ────────────────────────────────────────────────────
const broadcastText = `*Storey v1.2.0 is live on Play Store.*

Big update this week. Here is what changed:

*Reports, rebuilt from scratch*
Stock levels across all sites, material consumption by work type, tasks with overdue tracking — all on one screen.

*Excel export on every report*
Attendance, materials, budget vs actual, site report — download any of them as an Excel file in one tap.

*WhatsApp share*
Open any report and send a summary straight to your client or owner. No screenshots, no typing.

*Material presets and brands*
60+ ready-made materials to pick from. Add brand name and work type (civil, painting, electrical, etc.) so your reports are always clean.

Update on Play Store and let me know how it runs on your site.

— Karun
+91 98640 66898
storeyinfra.com`;

// ── 4 feature rows ────────────────────────────────────────────────────────────
const features = [
  ['REPORTS',       'Stock, consumption, tasks — one screen'],
  ['EXCEL EXPORT',  'Download any report in one tap'],
  ['WHATSAPP SHARE','Send site summary to client instantly'],
  ['MATERIALS',     '60+ presets, brands, work types'],
];

// ── PPTX ──────────────────────────────────────────────────────────────────────
async function makePptx() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'WA916', width: 5.625, height: 10 });
  pptx.layout = 'WA916';
  pptx.title  = 'Storey v1.2.0 update';

  const s = pptx.addSlide();
  s.background = { color: TERRACOTTA };

  // Top sand band
  s.addShape('rect', { x: 0, y: 0, w: 5.625, h: 0.55, fill: { color: SAND }, line: { color: SAND } });
  s.addText('STOREY', {
    x: 0, y: 0.05, w: 5.625, h: 0.45,
    align: 'center', valign: 'middle',
    fontFace: 'Impact', fontSize: 24, color: TERRACOTTA, charSpacing: 8, bold: true,
  });

  // "NEW UPDATE" sage pill
  s.addShape('roundRect', {
    x: 1.8, y: 0.75, w: 2.025, h: 0.42,
    fill: { color: SAGE }, line: { color: SAGE }, rectRadius: 0.18,
  });
  s.addText('NEW UPDATE', {
    x: 1.8, y: 0.75, w: 2.025, h: 0.42,
    align: 'center', valign: 'middle',
    fontFace: 'Impact', fontSize: 14, color: WHITE, charSpacing: 4,
  });

  // Hero headline
  s.addText('Reports,\nexports,\nand WhatsApp\nshare.', {
    x: 0.4, y: 1.3, w: 4.825, h: 2.9,
    align: 'left', valign: 'top',
    fontFace: 'Georgia', fontSize: 46, color: WHITE, bold: true, lineSpacingMultiple: 1.0,
  });

  // Subhead
  s.addText('Everything you asked for. Now live in v1.2.0.', {
    x: 0.4, y: 4.25, w: 4.825, h: 0.6,
    align: 'left', valign: 'top',
    fontFace: 'Calibri', fontSize: 15, color: SAND, italic: true,
  });

  // Sand feature card
  s.addShape('roundRect', {
    x: 0.4, y: 5.0, w: 4.825, h: 3.0,
    fill: { color: SAND }, line: { color: SAND }, rectRadius: 0.18,
  });
  s.addText("What's new", {
    x: 0.65, y: 5.12, w: 4.4, h: 0.45,
    fontFace: 'Georgia', fontSize: 17, color: TERRACOTTA, bold: true,
  });

  const rowY0 = 5.68;
  const rowH  = 0.62;
  features.forEach(([title, sub], i) => {
    const y = rowY0 + i * rowH;
    s.addShape('ellipse', {
      x: 0.65, y: y + 0.06, w: 0.38, h: 0.38,
      fill: { color: SAGE }, line: { color: SAGE },
    });
    s.addText(String(i + 1), {
      x: 0.65, y: y + 0.06, w: 0.38, h: 0.38,
      align: 'center', valign: 'middle',
      fontFace: 'Impact', fontSize: 16, color: WHITE, bold: true,
    });
    s.addText(title, {
      x: 1.18, y: y, w: 3.9, h: 0.28,
      fontFace: 'Arial Black', fontSize: 12, color: TERRACOTTA, charSpacing: 3, bold: true,
    });
    s.addText(sub, {
      x: 1.18, y: y + 0.28, w: 3.9, h: 0.28,
      fontFace: 'Calibri', fontSize: 12, color: DARK,
    });
  });

  // CTA pill
  s.addShape('roundRect', {
    x: 0.4, y: 8.2, w: 4.825, h: 0.88,
    fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.14,
  });
  s.addText('Update now  ·  storeyinfra.com', {
    x: 0.4, y: 8.2, w: 4.825, h: 0.88,
    align: 'center', valign: 'middle',
    fontFace: 'Georgia', fontSize: 19, color: TERRACOTTA, bold: true,
  });

  // Footer
  s.addText('Karun  ·  +91 98640 66898  ·  WhatsApp us', {
    x: 0.4, y: 9.2, w: 4.825, h: 0.5,
    align: 'center', valign: 'middle',
    fontFace: 'Calibri', fontSize: 13, color: SAND, italic: true,
  });

  // Sage dot ribbon
  for (let i = 0; i < 6; i++) {
    s.addShape('ellipse', {
      x: 0.4 + i * 0.18, y: 9.77, w: 0.08, h: 0.08,
      fill: { color: SAGE }, line: { color: SAGE },
    });
  }

  await pptx.writeFile({ fileName: OUT_PPTX });
  console.log('PPTX written:', OUT_PPTX);
}

// ── JPG (1080 × 1920 via SVG → sharp) ────────────────────────────────────────
async function makeJpg() {
  const W = 1080, H = 1920;

  const featRowsSvg = features.map(([t, sub], i) => {
    const y = 940 + i * 118;
    return `
      <circle cx="155" cy="${y + 32}" r="36" fill="#${SAGE}"/>
      <text x="155" y="${y + 46}" text-anchor="middle" font-family="Impact,'Arial Black',sans-serif"
            font-size="38" fill="#${WHITE}" font-weight="700">${i + 1}</text>
      <text x="228" y="${y + 24}" font-family="'Arial Black',Arial,sans-serif"
            font-size="26" letter-spacing="3" fill="#${TERRACOTTA}" font-weight="900">${t}</text>
      <text x="228" y="${y + 62}" font-family="Calibri,Arial,sans-serif"
            font-size="24" fill="#${DARK}">${sub}</text>`;
  }).join('\n');

  const dots = Array.from({ length: 6 }).map((_, i) =>
    `<circle cx="${88 + i * 34}" cy="1878" r="7" fill="#${SAGE}"/>`).join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#${TERRACOTTA}"/>

  <!-- Top sand band -->
  <rect x="0" y="0" width="${W}" height="106" fill="#${SAND}"/>
  <text x="${W/2}" y="76" text-anchor="middle"
        font-family="Impact,'Arial Black',sans-serif"
        font-size="54" letter-spacing="14" fill="#${TERRACOTTA}" font-weight="900">STOREY</text>

  <!-- NEW UPDATE sage pill -->
  <rect x="350" y="130" width="380" height="68" rx="34" fill="#${SAGE}"/>
  <text x="540" y="176" text-anchor="middle"
        font-family="Impact,'Arial Black',sans-serif"
        font-size="30" letter-spacing="5" fill="#${WHITE}" font-weight="700">NEW UPDATE</text>

  <!-- Hero headline — 4 lines so nothing overlaps -->
  <text x="78" y="330" font-family="Georgia,serif" font-size="96" fill="#${WHITE}" font-weight="700">Reports,</text>
  <text x="78" y="440" font-family="Georgia,serif" font-size="96" fill="#${WHITE}" font-weight="700">exports,</text>
  <text x="78" y="550" font-family="Georgia,serif" font-size="96" fill="#${WHITE}" font-weight="700">WhatsApp</text>
  <text x="78" y="660" font-family="Georgia,serif" font-size="96" fill="#${WHITE}" font-weight="700">share.</text>

  <!-- Subhead -->
  <text x="78" y="740" font-family="Calibri,Arial,sans-serif" font-style="italic"
        font-size="32" fill="#${SAND}">Everything you asked for. Now live in v1.2.0.</text>

  <!-- Sand feature card -->
  <rect x="78" y="810" width="924" height="660" rx="32" fill="#${SAND}"/>
  <text x="122" y="876" font-family="Georgia,serif" font-size="38"
        fill="#${TERRACOTTA}" font-weight="700">What's new</text>

  ${featRowsSvg}

  <!-- CTA white pill -->
  <rect x="78" y="1510" width="924" height="160" rx="28" fill="#${WHITE}"/>
  <text x="${W/2}" y="1610" text-anchor="middle"
        font-family="Georgia,serif" font-size="46"
        fill="#${TERRACOTTA}" font-weight="700">Update now · storeyinfra.com</text>

  <!-- Footer -->
  <text x="${W/2}" y="1750" text-anchor="middle"
        font-family="Calibri,Arial,sans-serif" font-style="italic"
        font-size="30" fill="#${SAND}">Karun  ·  +91 98640 66898  ·  WhatsApp us</text>

  ${dots}
</svg>`;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 93 })
    .toFile(OUT_JPG);
  console.log('JPG  written:', OUT_JPG);
}

(async () => {
  fs.writeFileSync(OUT_TXT, broadcastText, 'utf8');
  console.log('TXT  written:', OUT_TXT);
  await makePptx();
  await makeJpg();
  console.log('\nAll done. Files:\n', OUT_TXT, '\n', OUT_PPTX, '\n', OUT_JPG);
})().catch((e) => { console.error(e); process.exit(1); });
