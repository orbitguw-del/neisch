'use strict'
// Storey — marketing pitch deck. Warm Terracotta palette, vector iconography.
const pptxgen = require('pptxgenjs')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const sharp = require('sharp')
const fa = require('react-icons/fa')

// ── Palette ───────────────────────────────────────────────────────────────────
const TERRA   = 'B85042'
const SAND    = 'E7E8D1'
const SAND_LT = 'F4F2E9'
const SAGE    = 'A7BEAE'
const DARK    = '2C1810'
const MUTE    = '8B7B72'
const WHITE   = 'FFFFFF'
const INK     = '3A2A20'

const HEAD = 'Georgia'
const BODY = 'Arial'

// ── Icon rasteriser ───────────────────────────────────────────────────────────
async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color, size: String(size) }),
  )
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  return 'image/png;base64,' + png.toString('base64')
}

async function main() {
  // Pre-rasterise every icon used.
  const I = {
    hat:    await icon(fa.FaHardHat,        '#' + TERRA),
    box:    await icon(fa.FaBoxOpen,        '#' + TERRA),
    clip:   await icon(fa.FaClipboardList,  '#' + TERRA),
    wallet: await icon(fa.FaWallet,         '#' + TERRA),
    chart:  await icon(fa.FaChartBar,       '#' + TERRA),
    wifi:   await icon(fa.FaWifi,           '#' + TERRA),
    file:   await icon(fa.FaFileAlt,        '#' + TERRA),
    wa:     await icon(fa.FaWhatsapp,       '#' + TERRA),
    waW:    await icon(fa.FaWhatsapp,       '#' + WHITE),
    globe:  await icon(fa.FaGlobe,          '#' + WHITE),
    mail:   await icon(fa.FaEnvelope,       '#' + WHITE),
    check:  await icon(fa.FaCheckCircle,    '#' + TERRA),
    checkS: await icon(fa.FaCheckCircle,    '#' + SAGE),
    pin:    await icon(fa.FaMapMarkerAlt,   '#' + WHITE),
    users:  await icon(fa.FaUsers,          '#' + TERRA),
    user:   await icon(fa.FaUserTie,        '#' + TERRA),
    cam:    await icon(fa.FaCamera,         '#' + TERRA),
  }

  const pres = new pptxgen()
  pres.layout = 'LAYOUT_16x9'        // 10 x 5.625 in
  pres.author = 'Storey'
  pres.title  = 'Storey — Construction, Organised'
  const W = 10, H = 5.625

  // ── helpers ─────────────────────────────────────────────────────────────────
  const iconChip = (s, data, x, y, d, bg) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg } })
    const ic = d * 0.52
    s.addImage({ data, x: x + (d - ic) / 2, y: y + (d - ic) / 2, w: ic, h: ic })
  }

  // ════════════════════════ SLIDE 1 — TITLE ════════════════════════
  let s = pres.addSlide()
  s.background = { color: DARK }
  s.addShape(pres.shapes.OVAL, { x: 7.0, y: -1.7, w: 5.2, h: 5.2, fill: { color: TERRA, transparency: 86 } })
  s.addShape(pres.shapes.OVAL, { x: -1.4, y: 3.4, w: 3.2, h: 3.2, fill: { color: SAGE, transparency: 88 } })
  s.addImage({ path: 'app-icon-512.png', x: (W - 1.0) / 2, y: 0.62, w: 1.0, h: 1.0 })
  s.addText('STOREY', {
    x: 0, y: 1.72, w: W, h: 0.95, fontFace: HEAD, fontSize: 56, bold: true,
    color: WHITE, align: 'center', charSpacing: 8,
  })
  s.addText('CONSTRUCTION, ORGANISED', {
    x: 0, y: 2.66, w: W, h: 0.35, fontFace: BODY, fontSize: 12.5,
    color: SAND, align: 'center', charSpacing: 5,
  })
  s.addShape(pres.shapes.LINE, { x: (W - 1.3) / 2, y: 3.18, w: 1.3, h: 0, line: { color: TERRA, width: 2.5 } })
  s.addText('The site-management app built for construction\ncontractors in Northeast India.', {
    x: 1.5, y: 3.34, w: W - 3.0, h: 0.8, fontFace: BODY, fontSize: 15,
    color: 'D8CFC6', align: 'center', lineSpacing: 21,
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: (W - 5.0) / 2, y: 4.42, w: 5.0, h: 0.56, rectRadius: 0.28,
    fill: { color: TERRA },
    shadow: { type: 'outer', color: '000000', blur: 8, offset: 3, angle: 90, opacity: 0.35 },
  })
  s.addText('FREE during beta  ·  fair pricing at launch', {
    x: (W - 5.0) / 2, y: 4.42, w: 5.0, h: 0.56, fontFace: BODY, fontSize: 13,
    bold: true, color: WHITE, align: 'center', valign: 'middle', charSpacing: 1,
  })

  // ════════════════════════ SLIDE 2 — PROBLEM ════════════════════════
  s = pres.addSlide()
  s.background = { color: SAND_LT }
  s.addText('Running a site the hard way', {
    x: 0.6, y: 0.45, w: W - 1.2, h: 0.7, fontFace: HEAD, fontSize: 33, bold: true, color: DARK,
  })
  s.addText('Most contractors still juggle three things that never talk to each other.', {
    x: 0.6, y: 1.14, w: W - 1.2, h: 0.4, fontFace: BODY, fontSize: 14, color: MUTE,
  })
  const probs = [
    { ic: I.file, t: 'On paper',     d: 'Attendance and wages live in a register that tears, fades and travels off-site.' },
    { ic: I.box,  t: 'From memory',  d: 'Material stock is guessed — until something runs out in the middle of a pour.' },
    { ic: I.wa,   t: 'Lost in chat', d: 'Expenses and site updates get buried in endless WhatsApp threads.' },
  ]
  probs.forEach((p, i) => {
    const x = 0.6 + i * 3.025
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.78, w: 2.75, h: 2.95, rectRadius: 0.12, fill: { color: WHITE },
      line: { color: 'E7E1D8', width: 1 },
      shadow: { type: 'outer', color: '000000', blur: 7, offset: 2, angle: 135, opacity: 0.1 },
    })
    iconChip(s, p.ic, x + 0.35, 2.12, 0.92, SAND)
    s.addText(p.t, { x: x + 0.32, y: 3.18, w: 2.1, h: 0.4, fontFace: HEAD, fontSize: 18, bold: true, color: DARK })
    s.addText(p.d, { x: x + 0.32, y: 3.58, w: 2.15, h: 1.0, fontFace: BODY, fontSize: 11.5, color: MUTE, lineSpacing: 15 })
  })
  s.addText('Storey replaces all three with one simple app.', {
    x: 0.6, y: 4.92, w: W - 1.2, h: 0.4, fontFace: BODY, fontSize: 12.5, italic: true, color: TERRA,
  })

  // ════════════════════════ SLIDE 3 — MEET STOREY ════════════════════════
  s = pres.addSlide()
  s.background = { color: WHITE }
  s.addText('THE FIX', { x: 0.7, y: 0.62, w: 3, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: TERRA, charSpacing: 3 })
  s.addText('One app for the\nwhole site', {
    x: 0.7, y: 0.92, w: 5.0, h: 1.5, fontFace: HEAD, fontSize: 36, bold: true, color: DARK, lineSpacing: 38,
  })
  s.addText('Storey puts workers, materials, daily progress, expenses and reports in one place — on the phone that is already in every supervisor’s pocket.', {
    x: 0.7, y: 2.45, w: 4.95, h: 1.1, fontFace: BODY, fontSize: 13.5, color: INK, lineSpacing: 19,
  })
  const fixPts = ['Set up in 2 minutes', 'Works without an office computer', 'Every site, every day, in sync']
  fixPts.forEach((t, i) => {
    s.addImage({ data: I.check, x: 0.7, y: 3.62 + i * 0.46, w: 0.26, h: 0.26 })
    s.addText(t, { x: 1.06, y: 3.58 + i * 0.46, w: 4.4, h: 0.36, fontFace: BODY, fontSize: 12.5, color: DARK, valign: 'middle' })
  })
  // phone-style app illustration (vector)
  const px = 6.55, py = 0.62, pw = 2.8, ph = 4.4
  s.addShape(pres.shapes.OVAL, { x: px - 0.5, y: py + 0.4, w: 3.7, h: 3.7, fill: { color: SAND, transparency: 35 } })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: px, y: py, w: pw, h: ph, rectRadius: 0.34, fill: { color: DARK },
    shadow: { type: 'outer', color: '000000', blur: 12, offset: 4, angle: 135, opacity: 0.22 },
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px + 0.16, y: py + 0.16, w: pw - 0.32, h: ph - 0.32, rectRadius: 0.24, fill: { color: SAND_LT } })
  s.addImage({ path: 'app-icon-512.png', x: px + pw / 2 - 0.3, y: py + 0.45, w: 0.6, h: 0.6 })
  s.addText('STOREY', { x: px, y: py + 1.05, w: pw, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: DARK, align: 'center', charSpacing: 2 })
  const rowY = py + 1.55
  ;[TERRA, SAGE, TERRA, SAGE].forEach((c, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px + 0.34, y: rowY + i * 0.62, w: pw - 0.68, h: 0.46, rectRadius: 0.08, fill: { color: WHITE }, line: { color: 'E7E1D8', width: 0.75 } })
    s.addShape(pres.shapes.OVAL, { x: px + 0.46, y: rowY + i * 0.62 + 0.1, w: 0.26, h: 0.26, fill: { color: c } })
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px + 0.84, y: rowY + i * 0.62 + 0.15, w: 1.1, h: 0.15, rectRadius: 0.07, fill: { color: 'D8D2C6' } })
  })

  // ════════════════════════ SLIDE 4 — FEATURES ════════════════════════
  s = pres.addSlide()
  s.background = { color: SAND_LT }
  s.addText('Everything the site needs — in one place', {
    x: 0.6, y: 0.42, w: W - 1.2, h: 0.65, fontFace: HEAD, fontSize: 29, bold: true, color: DARK,
  })
  const feats = [
    { ic: I.hat,    t: 'Attendance & wages',  d: 'Mark attendance, auto-calculate daily wages.' },
    { ic: I.box,    t: 'Materials & stock',   d: 'Track inventory, receipts and transfers.' },
    { ic: I.clip,   t: 'Daily logs',          d: 'Record progress, weather and site issues.' },
    { ic: I.wallet, t: 'Site expenses',       d: 'Log expenses with a manager approval flow.' },
    { ic: I.chart,  t: 'Reports on your phone', d: 'Attendance, payroll and cost reports, instantly.' },
    { ic: I.wifi,   t: 'Offline + site photos', d: 'Works with no signal; snap photos on site.' },
  ]
  feats.forEach((f, i) => {
    const col = i % 3, row = Math.floor(i / 3)
    const x = 0.6 + col * 3.025, y = 1.28 + row * 1.78
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 2.75, h: 1.62, rectRadius: 0.1, fill: { color: WHITE }, line: { color: 'E7E1D8', width: 1 },
      shadow: { type: 'outer', color: '000000', blur: 6, offset: 2, angle: 135, opacity: 0.09 },
    })
    iconChip(s, f.ic, x + 0.26, y + 0.28, 0.72, SAND)
    s.addText(f.t, { x: x + 1.1, y: y + 0.26, w: 1.55, h: 0.6, fontFace: HEAD, fontSize: 13.5, bold: true, color: DARK, valign: 'middle' })
    s.addText(f.d, { x: x + 0.26, y: y + 0.95, w: 2.3, h: 0.55, fontFace: BODY, fontSize: 10.5, color: MUTE, lineSpacing: 13 })
  })

  // ════════════════════════ SLIDE 5 — NORTHEAST INDIA ════════════════════════
  s = pres.addSlide()
  s.background = { color: SAND_LT }
  s.addText('Built for Northeast India', {
    x: 0.6, y: 0.5, w: W - 1.2, h: 0.7, fontFace: HEAD, fontSize: 32, bold: true, color: DARK,
  })
  s.addText('Not a generic tool — shaped around how contractors here actually work.', {
    x: 0.6, y: 1.2, w: 6.0, h: 0.4, fontFace: BODY, fontSize: 13, color: MUTE,
  })
  const ne = [
    'Every amount in ₹ — wages, expenses and budgets',
    'The trades you hire — mason, carpenter, bar-bender, helper',
    'Built for patchy 2G/3G — a full offline mode',
    'Shaped with contractors in Assam, Meghalaya, Nagaland & Manipur',
  ]
  ne.forEach((t, i) => {
    s.addImage({ data: I.checkS, x: 0.62, y: 1.9 + i * 0.72, w: 0.32, h: 0.32 })
    s.addText(t, { x: 1.06, y: 1.82 + i * 0.72, w: 5.1, h: 0.5, fontFace: BODY, fontSize: 13.5, color: DARK, valign: 'middle' })
  })
  // decorative location illustration
  const cx = 8.05, cy = 2.95
  s.addShape(pres.shapes.OVAL, { x: cx - 1.5, y: cy - 1.5, w: 3.0, h: 3.0, fill: { color: SAGE, transparency: 55 } })
  s.addShape(pres.shapes.OVAL, { x: cx - 1.0, y: cy - 1.0, w: 2.0, h: 2.0, fill: { color: SAND } })
  s.addShape(pres.shapes.OVAL, { x: cx - 0.62, y: cy - 0.62, w: 1.24, h: 1.24, fill: { color: TERRA } })
  s.addImage({ data: I.pin, x: cx - 0.32, y: cy - 0.34, w: 0.64, h: 0.64 })

  // ════════════════════════ SLIDE 6 — TEAM ════════════════════════
  s = pres.addSlide()
  s.background = { color: WHITE }
  s.addText('Works for your whole team', {
    x: 0.6, y: 0.5, w: W - 1.2, h: 0.7, fontFace: HEAD, fontSize: 32, bold: true, color: DARK,
  })
  s.addText('Each role sees exactly what they need — nothing more.', {
    x: 0.6, y: 1.2, w: W - 1.2, h: 0.4, fontFace: BODY, fontSize: 13, color: MUTE,
  })
  const roles = [
    { ic: I.user,   t: 'Contractor',   d: 'Owns the company — every site, report and approval.' },
    { ic: I.hat,    t: 'Site Manager', d: 'Runs assigned sites, approves expenses & transfers.' },
    { ic: I.clip,   t: 'Supervisor',   d: 'Marks attendance and files the daily log.' },
    { ic: I.box,    t: 'Store Keeper', d: 'Manages material receipts, stock and equipment.' },
  ]
  roles.forEach((r, i) => {
    const x = 0.6 + i * 2.275
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.85, w: 2.05, h: 2.9, rectRadius: 0.11, fill: { color: SAND_LT }, line: { color: 'E7E1D8', width: 1 },
    })
    iconChip(s, r.ic, x + (2.05 - 0.82) / 2, 2.12, 0.82, WHITE)
    s.addText(r.t, { x, y: 3.05, w: 2.05, h: 0.4, fontFace: HEAD, fontSize: 14.5, bold: true, color: DARK, align: 'center' })
    s.addText(r.d, { x: x + 0.16, y: 3.46, w: 1.73, h: 1.1, fontFace: BODY, fontSize: 10.5, color: MUTE, align: 'center', lineSpacing: 14 })
  })

  // ════════════════════════ SLIDE 7 — PRICING / CTA ════════════════════════
  s = pres.addSlide()
  s.background = { color: DARK }
  s.addShape(pres.shapes.OVAL, { x: 7.4, y: -1.6, w: 4.6, h: 4.6, fill: { color: TERRA, transparency: 86 } })
  s.addText('PRICING', { x: 0.7, y: 0.6, w: 3, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: SAGE, charSpacing: 3 })
  s.addText('Free while we build it.', {
    x: 0.7, y: 0.9, w: W - 1.4, h: 0.85, fontFace: HEAD, fontSize: 38, bold: true, color: WHITE,
  })
  s.addText('Storey is completely free during the beta. When it launches on Google Play, pricing will be simple and fair — built for small contractors, not enterprises.', {
    x: 0.7, y: 1.75, w: 8.4, h: 0.8, fontFace: BODY, fontSize: 13.5, color: 'D8CFC6', lineSpacing: 19,
  })
  const plans = [
    { tag: 'NOW · BETA',   big: 'Free', sub: 'Full app, every feature, no card needed.' },
    { tag: 'AT LAUNCH',    big: 'Fair monthly plan', sub: 'Contractor-friendly pricing. No surprises.' },
  ]
  plans.forEach((p, i) => {
    const x = 0.7 + i * 4.35
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.7, w: 4.0, h: 1.35, rectRadius: 0.12,
      fill: { color: i === 0 ? TERRA : '3C2A20' },
      line: i === 0 ? undefined : { color: '5A4436', width: 1 },
    })
    s.addText(p.tag, { x: x + 0.3, y: 2.85, w: 3.4, h: 0.3, fontFace: BODY, fontSize: 10.5, bold: true, color: i === 0 ? 'F4D9D2' : SAGE, charSpacing: 2 })
    s.addText(p.big, { x: x + 0.3, y: 3.1, w: 3.4, h: 0.45, fontFace: HEAD, fontSize: 19, bold: true, color: WHITE })
    s.addText(p.sub, { x: x + 0.3, y: 3.55, w: 3.5, h: 0.4, fontFace: BODY, fontSize: 10.5, color: i === 0 ? 'F4D9D2' : 'C9BCB1' })
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 4.42, w: 6.3, h: 0.62, rectRadius: 0.31, fill: { color: SAGE },
  })
  s.addImage({ data: await icon(fa.FaWhatsapp, '#' + DARK), x: 1.0, y: 4.58, w: 0.3, h: 0.3 })
  s.addText('Start your free trial — message us on WhatsApp', {
    x: 1.4, y: 4.42, w: 5.5, h: 0.62, fontFace: BODY, fontSize: 12.5, bold: true, color: DARK, valign: 'middle',
  })

  // ════════════════════════ SLIDE 8 — CLOSING ════════════════════════
  s = pres.addSlide()
  s.background = { color: DARK }
  s.addShape(pres.shapes.OVAL, { x: -1.5, y: -1.6, w: 4.2, h: 4.2, fill: { color: TERRA, transparency: 88 } })
  s.addShape(pres.shapes.OVAL, { x: 7.6, y: 3.4, w: 3.4, h: 3.4, fill: { color: SAGE, transparency: 88 } })
  s.addImage({ path: 'app-icon-512.png', x: (W - 0.95) / 2, y: 1.05, w: 0.95, h: 0.95 })
  s.addText('STOREY', {
    x: 0, y: 2.1, w: W, h: 0.8, fontFace: HEAD, fontSize: 44, bold: true, color: WHITE, align: 'center', charSpacing: 7,
  })
  s.addText('Construction, organised.', {
    x: 0, y: 2.92, w: W, h: 0.4, fontFace: BODY, fontSize: 14, color: SAND, align: 'center', charSpacing: 2,
  })
  s.addShape(pres.shapes.LINE, { x: (W - 1.2) / 2, y: 3.45, w: 1.2, h: 0, line: { color: TERRA, width: 2.5 } })
  const contacts = [
    { ic: I.waW,   t: 'WhatsApp  +91 98640 66898' },
    { ic: I.globe, t: 'storeyinfra.com' },
    { ic: I.mail,  t: 'help@storeyinfra.com' },
  ]
  contacts.forEach((c, i) => {
    const y = 3.78 + i * 0.42
    s.addImage({ data: c.ic, x: 3.5, y: y + 0.02, w: 0.24, h: 0.24 })
    s.addText(c.t, { x: 3.86, y, w: 4.0, h: 0.3, fontFace: BODY, fontSize: 12.5, color: 'D8CFC6', valign: 'middle' })
  })

  await pres.writeFile({ fileName: 'C:/consne/storey-marketing.pptx' })
  console.log('Saved storey-marketing.pptx — 8 slides')
}

main().catch((e) => { console.error(e); process.exit(1) })
