'use strict'
// Storey — InfraTech Summit handbill (A5 portrait leaflet for booth handout).
// Emits both an editable PPTX and a ready-to-print JPG from one script.
//
// A5 portrait @ 300dpi = 1748 × 2480 px.  PPTX layout = 5.83in × 8.27in.
//
// Run:  node make-infratech-handbill.cjs
// Out:  storey-infratech-handbill.jpg
//       storey-infratech-handbill.pptx

const fs    = require('fs')
const sharp = require('sharp')
const QR    = require('qrcode')
const Pptx  = require('pptxgenjs')

// ── Brand tokens ──────────────────────────────────────────────────────────
const TERRA = '#B85042'
const TERRA_DK = '#9A3F33'
const SAND  = '#E7E8D1'
const SAGE  = '#A7BEAE'
const WHITE = '#FFFFFF'
const COCOA = '#2A1410'

const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.storeyinfra.app'

// A5 @ 300dpi
const W = 1748, H = 2480

function esc(s) {
  return String(s).replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]))
}

async function buildJPG() {
  // QR code as SVG paths (crisp at any size). White modules on transparent.
  const qrSvg = await QR.toString(PLAY_URL, {
    type: 'svg', margin: 0, errorCorrectionLevel: 'M',
    color: { dark: COCOA, light: '#00000000' },
  })
  // Extract the inner <path> from the qr svg, we re-embed scaled in a white card.
  const qrInner = qrSvg
    .replace(/<\?xml[^>]*\?>/, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')

  // sage decorative circle helper
  const sageDot = (cx, cy, r) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SAGE}" opacity="0.9"/>`

  // numbered sage bullet
  const bullet = (cx, cy, n) => `
    <circle cx="${cx}" cy="${cy}" r="34" fill="${SAGE}"/>
    <text x="${cx}" y="${cy+13}" font-family="Georgia, serif" font-size="38" font-weight="bold"
          fill="${COCOA}" text-anchor="middle">${n}</text>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="cardShadow" x="-6%" y="-6%" width="112%" height="112%">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#00000033"/>
    </filter>
    <linearGradient id="terraGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${TERRA}"/>
      <stop offset="100%" stop-color="${TERRA_DK}"/>
    </linearGradient>
  </defs>

  <!-- Terracotta full-bleed background (dominant) -->
  <rect width="${W}" height="${H}" fill="url(#terraGrad)"/>

  <!-- faint sage motif circles, top corners -->
  ${sageDot(120, 150, 60)}
  ${sageDot(1640, 110, 38)}
  ${sageDot(1690, 360, 22)}

  <!-- ── Wordmark + event line ───────────────────────────────────── -->
  <text x="${W/2}" y="210" font-family="Impact, Arial Black, sans-serif" font-size="150"
        letter-spacing="14" fill="${WHITE}" text-anchor="middle">STOREY</text>
  <text x="${W/2}" y="278" font-family="Calibri, Arial, sans-serif" font-size="44"
        letter-spacing="6" fill="${SAND}" text-anchor="middle">SITE OPERATIONS · BUILT IN GUWAHATI</text>

  <!-- thin sand divider (not under a title — a section break) -->
  <rect x="${W/2-90}" y="320" width="180" height="6" rx="3" fill="${SAGE}"/>

  <!-- ── Hero promise ────────────────────────────────────────────── -->
  <text x="${W/2}" y="470" font-family="Georgia, serif" font-size="92" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">Run your sites.</text>
  <text x="${W/2}" y="575" font-family="Georgia, serif" font-size="92" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">Not your phone.</text>

  <text x="${W/2}" y="660" font-family="Calibri, Arial, sans-serif" font-size="46"
        fill="${SAND}" text-anchor="middle">Attendance · Materials · Daily logs · Reports — one app.</text>

  <!-- ── FREE beta band ──────────────────────────────────────────── -->
  <rect x="${W/2-460}" y="720" width="920" height="116" rx="58" fill="${WHITE}"/>
  <text x="${W/2}" y="775" font-family="Georgia, serif" font-size="52" font-weight="bold"
        fill="${TERRA}" text-anchor="middle">FREE during launch beta</text>
  <text x="${W/2}" y="815" font-family="Calibri, Arial, sans-serif" font-size="30"
        fill="${COCOA}" text-anchor="middle">No card. Start today. Your data stays yours.</text>

  <!-- ── Sand card: why Storey ───────────────────────────────────── -->
  <rect x="90" y="895" width="${W-180}" height="700" rx="36" fill="${SAND}" filter="url(#cardShadow)"/>

  <text x="150" y="985" font-family="Georgia, serif" font-size="50" font-weight="bold" fill="${COCOA}">Why contractors pick Storey</text>

  ${bullet(180, 1095, 1)}
  <text x="250" y="1082" font-family="Calibri, Arial, sans-serif" font-size="42" font-weight="bold" fill="${COCOA}">Pay per SITE — not per user</text>
  <text x="250" y="1132" font-family="Calibri, Arial, sans-serif" font-size="34" fill="#4A3530">Your whole team works on it. No per-head charges.</text>

  ${bullet(180, 1235, 2)}
  <text x="250" y="1222" font-family="Calibri, Arial, sans-serif" font-size="42" font-weight="bold" fill="${COCOA}">Made for NE-India sites</text>
  <text x="250" y="1272" font-family="Calibri, Arial, sans-serif" font-size="34" fill="#4A3530">Works on a 4-year-old phone, patchy 4G, offline too.</text>

  ${bullet(180, 1375, 3)}
  <text x="250" y="1362" font-family="Calibri, Arial, sans-serif" font-size="42" font-weight="bold" fill="${COCOA}">See where the cement went</text>
  <text x="250" y="1412" font-family="Calibri, Arial, sans-serif" font-size="34" fill="#4A3530">Material in, issued, transferred — every bag tracked.</text>

  ${bullet(180, 1515, 4)}
  <text x="250" y="1502" font-family="Calibri, Arial, sans-serif" font-size="42" font-weight="bold" fill="${COCOA}">Reports on WhatsApp</text>
  <text x="250" y="1552" font-family="Calibri, Arial, sans-serif" font-size="34" fill="#4A3530">Daily attendance + spend, one tap to your phone.</text>

  <!-- ── QR card ─────────────────────────────────────────────────── -->
  <rect x="90" y="1650" width="${W-180}" height="470" rx="36" fill="${WHITE}" filter="url(#cardShadow)"/>

  <!-- QR block: scale qr modules into a 360x360 box -->
  <svg x="150" y="1715" width="360" height="360" viewBox="0 0 ${qrViewBox(qrSvg)} ${qrViewBox(qrSvg)}">
    ${qrInner}
  </svg>

  <text x="580" y="1790" font-family="Georgia, serif" font-size="50" font-weight="bold" fill="${COCOA}">Get the app</text>
  <text x="580" y="1850" font-family="Calibri, Arial, sans-serif" font-size="36" fill="#4A3530">Scan the code →  Google Play</text>
  <rect x="580" y="1890" width="520" height="80" rx="40" fill="${TERRA}"/>
  <text x="840" y="1943" font-family="Calibri, Arial, sans-serif" font-size="38" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">storeyinfra.com</text>
  <text x="580" y="2035" font-family="Calibri, Arial, sans-serif" font-size="30" fill="#6B5750">Or visit our booth — we'll set</text>
  <text x="580" y="2075" font-family="Calibri, Arial, sans-serif" font-size="30" fill="#6B5750">it up with you in 5 minutes.</text>

  <!-- ── Founder footer band ─────────────────────────────────────── -->
  <rect x="0" y="2160" width="${W}" height="320" fill="${TERRA_DK}"/>
  ${sageDot(110, 2300, 46)}
  <text x="200" y="2270" font-family="Georgia, serif" font-size="46" font-weight="bold" fill="${WHITE}">Talk to the founder</text>
  <text x="200" y="2330" font-family="Calibri, Arial, sans-serif" font-size="44" fill="${SAND}">Karun · WhatsApp +91 98640 66898</text>
  <text x="200" y="2390" font-family="Calibri, Arial, sans-serif" font-size="40" fill="${SAND}">help@storeyinfra.com</text>
  <text x="200" y="2448" font-family="Calibri, Arial, sans-serif" font-size="34" fill="${SAGE}">InfraTech Summit · come say hello at the Storey booth</text>
</svg>`

  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 94 }).toBuffer()
  fs.writeFileSync('C:\\consne\\storey-infratech-handbill.jpg', buf)
  return buf.length
}

// helper: QR svg default viewBox is "0 0 N N" — read N
function qrViewBox(svgStr) {
  const m = svgStr.match(/viewBox="0 0 (\d+) (\d+)"/)
  return m ? m[1] : '25'
}

// ── PPTX (editable) ──────────────────────────────────────────────────────
async function buildPPTX() {
  const pptx = new Pptx()
  // A5 portrait in inches
  pptx.defineLayout({ name: 'A5P', width: 5.83, height: 8.27 })
  pptx.layout = 'A5P'
  const s = pptx.addSlide()

  s.background = { color: 'B85042' }

  // Wordmark
  s.addText('STOREY', {
    x: 0, y: 0.25, w: 5.83, h: 0.7, align: 'center',
    fontFace: 'Impact', fontSize: 50, color: 'FFFFFF', charSpacing: 6,
  })
  s.addText('SITE OPERATIONS · BUILT IN GUWAHATI', {
    x: 0, y: 0.92, w: 5.83, h: 0.3, align: 'center',
    fontFace: 'Calibri', fontSize: 12, color: 'E7E8D1', charSpacing: 3,
  })

  // Hero
  s.addText('Run your sites.\nNot your phone.', {
    x: 0, y: 1.3, w: 5.83, h: 1.3, align: 'center',
    fontFace: 'Georgia', fontSize: 34, bold: true, color: 'FFFFFF',
  })
  s.addText('Attendance · Materials · Daily logs · Reports — one app.', {
    x: 0.3, y: 2.55, w: 5.23, h: 0.4, align: 'center',
    fontFace: 'Calibri', fontSize: 13, color: 'E7E8D1',
  })

  // FREE pill
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 3.05, w: 3.83, h: 0.62, rectRadius: 0.3, fill: { color: 'FFFFFF' },
  })
  s.addText('FREE during launch beta', {
    x: 1.0, y: 3.1, w: 3.83, h: 0.32, align: 'center',
    fontFace: 'Georgia', fontSize: 17, bold: true, color: 'B85042',
  })
  s.addText('No card. Start today. Your data stays yours.', {
    x: 1.0, y: 3.42, w: 3.83, h: 0.22, align: 'center',
    fontFace: 'Calibri', fontSize: 10, color: '2A1410',
  })

  // Why card (sand)
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 3.85, w: 5.23, h: 2.35, rectRadius: 0.12, fill: { color: 'E7E8D1' },
  })
  s.addText('Why contractors pick Storey', {
    x: 0.5, y: 3.95, w: 4.8, h: 0.4, fontFace: 'Georgia', fontSize: 17, bold: true, color: '2A1410',
  })
  const points = [
    ['1', 'Pay per SITE — not per user', 'Your whole team works on it. No per-head charges.'],
    ['2', 'Made for NE-India sites', 'Works on an old phone, patchy 4G, offline too.'],
    ['3', 'See where the cement went', 'Material in, issued, transferred — every bag tracked.'],
    ['4', 'Reports on WhatsApp', 'Daily attendance + spend, one tap to your phone.'],
  ]
  points.forEach((p, i) => {
    const y = 4.4 + i * 0.44
    s.addShape(pptx.ShapeType.ellipse, { x: 0.5, y: y, w: 0.3, h: 0.3, fill: { color: 'A7BEAE' } })
    s.addText(p[0], { x: 0.5, y: y, w: 0.3, h: 0.3, align: 'center', fontFace: 'Georgia', fontSize: 13, bold: true, color: '2A1410' })
    s.addText([
      { text: p[1] + '   ', options: { bold: true, fontSize: 12, color: '2A1410' } },
      { text: p[2], options: { fontSize: 10, color: '4A3530' } },
    ], { x: 0.92, y: y - 0.04, w: 4.4, h: 0.4, fontFace: 'Calibri', valign: 'middle' })
  })

  // QR card (white) + QR image
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 6.35, w: 5.23, h: 1.05, rectRadius: 0.12, fill: { color: 'FFFFFF' },
  })
  const qrDataUrl = await QR.toDataURL(PLAY_URL, { margin: 1, width: 300, errorCorrectionLevel: 'M', color: { dark: '#2A1410', light: '#FFFFFF' } })
  s.addImage({ data: qrDataUrl, x: 0.45, y: 6.5, w: 0.75, h: 0.75 })
  s.addText('Get the app — scan with your phone', {
    x: 1.35, y: 6.55, w: 4.0, h: 0.3, fontFace: 'Georgia', fontSize: 15, bold: true, color: '2A1410',
  })
  s.addText('Google Play · Android   ·   storeyinfra.com', {
    x: 1.35, y: 6.9, w: 4.0, h: 0.3, fontFace: 'Calibri', fontSize: 12, color: '4A3530',
  })

  // Founder footer
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.5, w: 5.83, h: 0.77, fill: { color: '9A3F33' } })
  s.addText('Talk to the founder — Karun · WhatsApp +91 98640 66898', {
    x: 0.3, y: 7.55, w: 5.23, h: 0.3, fontFace: 'Calibri', fontSize: 13, bold: true, color: 'FFFFFF',
  })
  s.addText('help@storeyinfra.com   ·   InfraTech Summit — come say hello at the Storey booth', {
    x: 0.3, y: 7.88, w: 5.23, h: 0.3, fontFace: 'Calibri', fontSize: 10, color: 'E7E8D1',
  })

  await pptx.writeFile({ fileName: 'C:\\consne\\storey-infratech-handbill.pptx' })
}

async function main() {
  const jpgLen = await buildJPG()
  console.log('JPG :', (jpgLen/1024).toFixed(0), 'KB  → storey-infratech-handbill.jpg')
  await buildPPTX()
  console.log('PPTX: storey-infratech-handbill.pptx')
}
main().catch(e => { console.error(e); process.exit(1) })
