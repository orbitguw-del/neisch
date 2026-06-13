'use strict'
// Storey — booth scanner card (A6 portrait).
// Place on the booth table next to the handbill stack.
// Contractor scans QR → opens WhatsApp with a pre-filled message to Karun
// ("I met you at InfraTech, send me the Storey info pack"). They tap send,
// Karun receives their phone number + a real conversation starts.
// He replies with the info pack PDF + Play Store link.
//
// A6 portrait @ 300dpi = 1240 × 1748 px.
//
// Run:  node make-scanner-card.cjs
// Out:  storey-scanner-card.jpg
//       storey-scanner-card.pptx

const fs    = require('fs')
const sharp = require('sharp')
const QR    = require('qrcode')
const Pptx  = require('pptxgenjs')

const TERRA = '#B85042', TERRA_DK = '#9A3F33'
const SAND  = '#E7E8D1', SAGE = '#A7BEAE'
const WHITE = '#FFFFFF', COCOA = '#2A1410'

const W = 1240, H = 1748   // A6 @ 300dpi

// Pre-filled WhatsApp message — what the contractor's WhatsApp opens with
// after they scan. They just tap send.
const MSG = "Hi Karun, I met you at the InfraTech Summit. Please send me the Storey info pack."
const WA_URL = `https://wa.me/919864066898?text=${encodeURIComponent(MSG)}`

function logoBadge(x, y, s, badgeFill = WHITE) {
  const pad = s * 0.11, ix = x + pad, iy = y + pad, isz = s - pad * 2, k = isz / 32
  const bar = (bx, by, bw, bh) =>
    `<rect x="${ix + bx*k}" y="${iy + by*k}" width="${bw*k}" height="${bh*k}" rx="${1.2*k}" fill="${WHITE}"/>`
  return `
    <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s*0.2}" fill="${badgeFill}"/>
    <rect x="${ix}" y="${iy}" width="${isz}" height="${isz}" rx="${isz*0.2}" fill="${TERRA}"/>
    ${bar(5,18,6,9)}${bar(13,13,6,14)}${bar(21,7,6,20)}`
}

function qrViewBox(s) {
  const m = s.match(/viewBox="0 0 (\d+) (\d+)"/)
  return m ? m[1] : '25'
}

async function buildJPG() {
  const qrSvg = await QR.toString(WA_URL, {
    type: 'svg', margin: 0, errorCorrectionLevel: 'Q',
    color: { dark: COCOA, light: '#00000000' },
  })
  const qrInner = qrSvg.replace(/<\?xml[^>]*\?>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')
  const vb = qrViewBox(qrSvg)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <filter id="cardShadow" x="-6%" y="-6%" width="112%" height="112%">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#00000033"/>
    </filter>
    <linearGradient id="terraGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${TERRA}"/>
      <stop offset="100%" stop-color="${TERRA_DK}"/>
    </linearGradient>
  </defs>

  <!-- terracotta dominant background -->
  <rect width="${W}" height="${H}" fill="url(#terraGrad)"/>

  <!-- sage motif -->
  <circle cx="1140" cy="100" r="42" fill="${SAGE}" opacity="0.85"/>
  <circle cx="80" cy="1640" r="46" fill="${SAGE}" opacity="0.85"/>

  <!-- ── Header: logo + brand ──────────────────────────── -->
  ${logoBadge(70, 70, 120)}
  <text x="220" y="135" font-family="Impact, Arial Black, sans-serif" font-size="90"
        letter-spacing="8" fill="${WHITE}">STOREY</text>
  <text x="222" y="180" font-family="Calibri, Arial, sans-serif" font-size="26"
        letter-spacing="4" fill="${SAND}">INFRATECH SUMMIT</text>

  <rect x="${W/2-70}" y="220" width="140" height="5" rx="2.5" fill="${SAGE}"/>

  <!-- ── Hero promise ──────────────────────────────────── -->
  <text x="${W/2}" y="340" font-family="Georgia, serif" font-size="78" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">Want more</text>
  <text x="${W/2}" y="420" font-family="Georgia, serif" font-size="78" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">info?</text>

  <text x="${W/2}" y="490" font-family="Calibri, Arial, sans-serif" font-size="34"
        fill="${SAND}" text-anchor="middle">Scan — and we'll send the Storey pack</text>
  <text x="${W/2}" y="535" font-family="Calibri, Arial, sans-serif" font-size="34"
        fill="${SAND}" text-anchor="middle">to your WhatsApp.</text>

  <!-- ── QR card ───────────────────────────────────────── -->
  <rect x="170" y="600" width="900" height="900" rx="40" fill="${WHITE}" filter="url(#cardShadow)"/>

  <!-- WhatsApp chip on QR card -->
  <rect x="${W/2-200}" y="640" width="400" height="80" rx="40" fill="#25D366"/>
  <text x="${W/2}" y="693" font-family="Calibri, Arial, sans-serif" font-size="36" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">📱 OPENS WHATSAPP</text>

  <!-- QR -->
  <svg x="295" y="760" width="650" height="650" viewBox="0 0 ${vb} ${vb}">${qrInner}</svg>

  <text x="${W/2}" y="1450" font-family="Calibri, Arial, sans-serif" font-size="28"
        fill="${COCOA}" text-anchor="middle">Just tap "Send" — Karun will reply.</text>

  <!-- ── Footer band ───────────────────────────────────── -->
  <rect x="0" y="1560" width="${W}" height="188" fill="${TERRA_DK}"/>
  <text x="170" y="1620" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="${WHITE}">Karun · Founder</text>
  <text x="170" y="1670" font-family="Calibri, Arial, sans-serif" font-size="32" fill="${SAND}">WhatsApp +91 98640 66898</text>
  <text x="170" y="1715" font-family="Calibri, Arial, sans-serif" font-size="28" fill="${SAGE}">storeyinfra.com</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer()
  fs.writeFileSync('C:\\consne\\storey-scanner-card.jpg', buf)
  return buf.length
}

async function logoBadgePngDataUrl(size, badgeFill) {
  const pad = size * 0.11, isz = size - pad * 2, k = isz / 32
  const bar = (bx, by, bw, bh) =>
    `<rect x="${pad + bx*k}" y="${pad + by*k}" width="${bw*k}" height="${bh*k}" rx="${1.2*k}" fill="#FFFFFF"/>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${size*0.2}" fill="${badgeFill}"/>
    <rect x="${pad}" y="${pad}" width="${isz}" height="${isz}" rx="${isz*0.2}" fill="${TERRA}"/>
    ${bar(5,18,6,9)}${bar(13,13,6,14)}${bar(21,7,6,20)}</svg>`
  return 'data:image/png;base64,' + (await sharp(Buffer.from(svg)).png().toBuffer()).toString('base64')
}

async function buildPPTX() {
  const pptx = new Pptx()
  pptx.defineLayout({ name: 'A6P', width: 4.13, height: 5.83 })
  pptx.layout = 'A6P'
  const s = pptx.addSlide()
  s.background = { color: 'B85042' }

  const logoData = await logoBadgePngDataUrl(280, '#FFFFFF')
  s.addImage({ data: logoData, x: 0.23, y: 0.23, w: 0.5, h: 0.5 })
  s.addText('STOREY', { x: 0.78, y: 0.28, w: 3.2, h: 0.45, fontFace: 'Impact', fontSize: 36, color: 'FFFFFF', charSpacing: 4 })
  s.addText('INFRATECH SUMMIT', { x: 0.8, y: 0.72, w: 3.2, h: 0.25, fontFace: 'Calibri', fontSize: 10, color: 'E7E8D1', charSpacing: 2 })

  s.addText('Want more info?', { x: 0, y: 1.2, w: 4.13, h: 0.6, align: 'center', fontFace: 'Georgia', fontSize: 32, bold: true, color: 'FFFFFF' })
  s.addText("Scan — we'll send the Storey pack to your WhatsApp.", {
    x: 0.4, y: 1.85, w: 3.33, h: 0.55, align: 'center', fontFace: 'Calibri', fontSize: 13, color: 'E7E8D1',
  })

  s.addShape(pptx.ShapeType.roundRect, { x: 0.55, y: 2.55, w: 3.03, h: 2.4, rectRadius: 0.15, fill: { color: 'FFFFFF' } })

  s.addShape(pptx.ShapeType.roundRect, { x: 1.05, y: 2.7, w: 2.03, h: 0.35, rectRadius: 0.18, fill: { color: '25D366' } })
  s.addText('OPENS WHATSAPP', { x: 1.05, y: 2.71, w: 2.03, h: 0.33, align: 'center', fontFace: 'Calibri', fontSize: 11, bold: true, color: 'FFFFFF' })

  const qrData = await QR.toDataURL(WA_URL, { margin: 1, width: 500, errorCorrectionLevel: 'Q', color: { dark: '#2A1410', light: '#FFFFFF' } })
  s.addImage({ data: qrData, x: 1.0, y: 3.13, w: 2.13, h: 2.13 })

  s.addShape(pptx.ShapeType.rect, { x: 0, y: 5.05, w: 4.13, h: 0.78, fill: { color: '9A3F33' } })
  s.addText('Karun · Founder', { x: 0.3, y: 5.1, w: 3.5, h: 0.3, fontFace: 'Georgia', fontSize: 14, bold: true, color: 'FFFFFF' })
  s.addText('WhatsApp +91 98640 66898   ·   storeyinfra.com', { x: 0.3, y: 5.42, w: 3.5, h: 0.3, fontFace: 'Calibri', fontSize: 10, color: 'E7E8D1' })

  await pptx.writeFile({ fileName: 'C:\\consne\\storey-scanner-card.pptx' })
}

async function main() {
  const jpgLen = await buildJPG()
  console.log('JPG :', (jpgLen/1024).toFixed(0), 'KB  → storey-scanner-card.jpg')
  await buildPPTX()
  console.log('PPTX: storey-scanner-card.pptx')
  console.log('')
  console.log('QR opens WhatsApp to +919864066898 with pre-filled message:')
  console.log('  "' + MSG + '"')
}
main().catch(e => { console.error(e); process.exit(1) })
