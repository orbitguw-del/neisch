'use strict'
const path    = require('path')
const React   = require('react')
const RDS     = require('react-dom/server')
const sharp   = require('sharp')
const pptxgen = require('pptxgenjs')

// ── Icon helper ──────────────────────────────────────────────────────────────
async function icon(IconComp, color = '#FFFFFF', size = 256) {
  const svg = RDS.renderToStaticMarkup(
    React.createElement(IconComp, { color, size: String(size) })
  )
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  return 'image/png;base64,' + buf.toString('base64')
}

async function main() {
  const { FaHardHat, FaBoxes, FaClipboardList, FaMobileAlt, FaMapMarkerAlt } =
    require('react-icons/fa')

  // ── Icons ────────────────────────────────────────────────────────────────
  const [iHat, iBox, iClip, iMobile, iMap] = await Promise.all([
    icon(FaHardHat,       '#B85042', 256),
    icon(FaBoxes,         '#B85042', 256),
    icon(FaClipboardList, '#B85042', 256),
    icon(FaMobileAlt,     '#E7E8D1', 256),
    icon(FaMapMarkerAlt,  '#E7E8D1', 256),
  ])

  // ── Presentation setup ────────────────────────────────────────────────────
  // 9:16 portrait — define custom layout
  const W = 5.63   // inches
  const H = 10.0   // inches

  const pres = new pptxgen()
  pres.defineLayout({ name: 'PORTRAIT_916', width: W, height: H })
  pres.layout = 'PORTRAIT_916'
  pres.title  = 'Storey WhatsApp Ad'

  // ── Colours ───────────────────────────────────────────────────────────────
  const TERRA  = 'B85042'
  const SAND   = 'E7E8D1'
  const SAGE   = 'A7BEAE'
  const WHITE  = 'FFFFFF'
  const DARK   = '2C1810'   // deep brown for sand-section text

  // ── Slide ─────────────────────────────────────────────────────────────────
  const s = pres.addSlide()
  s.background = { color: TERRA }

  // ── Top terracotta zone (0 – 5.8") ───────────────────────────────────────

  // Subtle diagonal texture strip (sage accent)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.06, fill: { color: SAGE }, line: { color: SAGE },
  })

  // Brand pill
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: (W - 1.9) / 2, y: 0.25, w: 1.9, h: 0.38,
    fill: { color: WHITE, transparency: 85 },
    line: { color: WHITE, width: 1 },
    rectRadius: 0.12,
  })
  s.addText('STOREY  ·  STOREYINFRA', {
    x: (W - 1.9) / 2, y: 0.25, w: 1.9, h: 0.38,
    fontSize: 7, bold: true, color: WHITE, align: 'center', valign: 'middle',
    charSpacing: 1.5, margin: 0,
  })

  // Mobile icon (large, centred)
  s.addImage({ data: iMobile, x: (W - 1.1) / 2, y: 0.75, w: 1.1, h: 1.1 })

  // Main headline
  s.addText('Run Your Sites\nFrom Your Phone', {
    x: 0.35, y: 1.95, w: W - 0.7, h: 1.55,
    fontSize: 34, bold: true, color: WHITE,
    fontFace: 'Georgia', align: 'center', valign: 'top',
    paraSpaceAfter: 4,
  })

  // Sub-headline
  s.addText('Built for contractors & builders\nacross Northeast India', {
    x: 0.4, y: 3.55, w: W - 0.8, h: 0.75,
    fontSize: 13, color: SAND, align: 'center',
    fontFace: 'Calibri', italic: true,
  })

  // Divider
  s.addShape(pres.shapes.LINE, {
    x: 1.4, y: 4.38, w: W - 2.8, h: 0,
    line: { color: SAGE, width: 1.2 },
  })

  // ── Feature rows (on terracotta, above the cream fold) ───────────────────
  const features = [
    { ico: iHat,  label: 'Worker attendance & daily logs' },
    { ico: iBox,  label: 'Materials, inventory & receipts' },
    { ico: iClip, label: 'Multi-site reports & transfers'  },
  ]

  features.forEach(({ ico, label }, i) => {
    const y = 4.55 + i * 0.55
    // Icon circle
    s.addShape(pres.shapes.OVAL, {
      x: 0.45, y: y + 0.02, w: 0.38, h: 0.38,
      fill: { color: SAND }, line: { color: SAND },
    })
    s.addImage({ data: ico, x: 0.52, y: y + 0.05, w: 0.24, h: 0.24 })
    // Label
    s.addText(label, {
      x: 1.0, y: y, w: W - 1.5, h: 0.42,
      fontSize: 13, color: WHITE, fontFace: 'Calibri',
      valign: 'middle', margin: 0,
    })
  })

  // ── Cream bottom zone (6.2" → bottom) ────────────────────────────────────
  const creamY = 6.22
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: creamY, w: W, h: H - creamY,
    fill: { color: SAND }, line: { color: SAND },
  })

  // Sage accent bar at fold
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: creamY, w: W, h: 0.07,
    fill: { color: SAGE }, line: { color: SAGE },
  })

  // Map pin + "Available across NE India"
  s.addImage({ data: iMap, x: 0.5, y: creamY + 0.28, w: 0.32, h: 0.32 })
  s.addText('Available across Northeast India', {
    x: 0.95, y: creamY + 0.25, w: W - 1.1, h: 0.38,
    fontSize: 11, color: DARK, fontFace: 'Calibri', italic: true, valign: 'middle', margin: 0,
  })

  // CTA button
  const btnY = creamY + 0.78
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: btnY, w: W - 0.9, h: 0.72,
    fill: { color: TERRA }, line: { color: TERRA },
    shadow: { type: 'outer', color: '000000', blur: 8, offset: 3, angle: 135, opacity: 0.18 },
  })
  s.addText('📲  Download Free on Android', {
    x: 0.45, y: btnY, w: W - 0.9, h: 0.72,
    fontSize: 15, bold: true, color: WHITE,
    fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0,
  })

  // QR / website
  s.addText('storeyinfra.com', {
    x: 0, y: creamY + 1.65, w: W, h: 0.38,
    fontSize: 12, color: DARK, fontFace: 'Calibri',
    align: 'center', valign: 'middle', bold: true,
  })

  // Tagline
  s.addText('Manage smarter. Build faster.', {
    x: 0, y: creamY + 2.0, w: W, h: 0.35,
    fontSize: 11, color: SAGE, fontFace: 'Georgia',
    align: 'center', italic: true,
  })

  // Bottom sage bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: H - 0.06, w: W, h: 0.06,
    fill: { color: SAGE }, line: { color: SAGE },
  })

  // ── Save ──────────────────────────────────────────────────────────────────
  const outPath = path.join('C:\\consne', 'storey-whatsapp-ad.pptx')
  await pres.writeFile({ fileName: outPath })
  console.log('✓ Saved:', outPath)
}

main().catch(err => { console.error(err); process.exit(1) })
