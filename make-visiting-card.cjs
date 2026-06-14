'use strict'
// Storey — visiting / business card (double-sided).
// FRONT: brand + Karun's contact details.
// BACK:  "Scan to save my number" vCard QR — phone adds the contact directly.
//
// Standard card 3.5in × 2in @ 300dpi = 1050 × 600 px (landscape).
// (Add 3mm bleed at the printer; safe margins kept ~40px from edges.)
//
// Run:  node make-visiting-card.cjs
// Out:  storey-visiting-card-front.jpg
//       storey-visiting-card-back.jpg
//       storey-visiting-card.pptx   (2 slides)

const fs    = require('fs')
const sharp = require('sharp')
const QR    = require('qrcode')
const Pptx  = require('pptxgenjs')

const TERRA = '#B85042', TERRA_DK = '#9A3F33'
const SAND  = '#E7E8D1', SAGE = '#A7BEAE'
const WHITE = '#FFFFFF', COCOA = '#2A1410'

const W = 1050, H = 600

// vCard — scanning this QR offers "Add to contacts" on any phone.
const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Roongta;Karun;;;',
  'FN:Karun Roongta',
  'ORG:Storey',
  'TITLE:Founder',
  'TEL;TYPE=CELL:+919864066898',
  'EMAIL:help@storeyinfra.com',
  'URL:https://storeyinfra.com',
  'END:VCARD',
].join('\n')

// Bar-chart logo badge (white badge so terra logo reads on any bg).
function logoBadge(x, y, s, badgeFill = WHITE) {
  const pad = s * 0.11, ix = x + pad, iy = y + pad, isz = s - pad * 2, k = isz / 32
  const bar = (bx, by, bw, bh) =>
    `<rect x="${ix + bx*k}" y="${iy + by*k}" width="${bw*k}" height="${bh*k}" rx="${1.2*k}" fill="${WHITE}"/>`
  return `
    <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s*0.2}" fill="${badgeFill}"/>
    <rect x="${ix}" y="${iy}" width="${isz}" height="${isz}" rx="${isz*0.2}" fill="${TERRA}"/>
    ${bar(5,18,6,9)}${bar(13,13,6,14)}${bar(21,7,6,20)}`
}

function qrViewBox(svgStr) {
  const m = svgStr.match(/viewBox="0 0 (\d+) (\d+)"/)
  return m ? m[1] : '25'
}

const defs = `<defs>
  <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#00000022"/>
  </filter>
  <linearGradient id="terraGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${TERRA}"/>
    <stop offset="100%" stop-color="${TERRA_DK}"/>
  </linearGradient>
</defs>`

async function buildFront() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="url(#terraGrad)"/>

  <!-- sage motif -->
  <circle cx="980" cy="70" r="46" fill="${SAGE}" opacity="0.85"/>
  <circle cx="1030" cy="200" r="20" fill="${SAGE}" opacity="0.7"/>

  <!-- logo + wordmark -->
  ${logoBadge(60, 60, 110)}
  <text x="195" y="120" font-family="Impact, Arial Black, sans-serif" font-size="78"
        letter-spacing="6" fill="${WHITE}">STOREY</text>
  <text x="197" y="160" font-family="Calibri, Arial, sans-serif" font-size="24"
        letter-spacing="3" fill="${SAND}">SITE OPERATIONS · GUWAHATI</text>

  <!-- divider -->
  <rect x="60" y="225" width="120" height="5" rx="2.5" fill="${SAGE}"/>

  <!-- name + title -->
  <text x="60" y="320" font-family="Georgia, serif" font-size="58" font-weight="bold" fill="${WHITE}">Karun Roongta</text>
  <text x="62" y="362" font-family="Calibri, Arial, sans-serif" font-size="30" letter-spacing="2" fill="${SAND}">Founder</text>

  <!-- contact rows -->
  <text x="60" y="450" font-family="Calibri, Arial, sans-serif" font-size="34" font-weight="bold" fill="${WHITE}">WhatsApp  +91 98640 66898</text>
  <text x="60" y="500" font-family="Calibri, Arial, sans-serif" font-size="30" fill="${SAND}">help@storeyinfra.com</text>
  <text x="60" y="546" font-family="Calibri, Arial, sans-serif" font-size="30" fill="${SAND}">storeyinfra.com</text>
  </svg>`
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer()
  fs.writeFileSync('C:\\consne\\storey-visiting-card-front.jpg', buf)
  return buf.length
}

async function buildBack() {
  const qrSvg = await QR.toString(VCARD, {
    type: 'svg', margin: 0, errorCorrectionLevel: 'M',
    color: { dark: COCOA, light: '#00000000' },
  })
  const qrInner = qrSvg.replace(/<\?xml[^>]*\?>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')
  const vb = qrViewBox(qrSvg)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="${SAND}"/>

  <!-- left: QR in white card -->
  <rect x="55" y="95" width="410" height="410" rx="28" fill="${WHITE}" filter="url(#cardShadow)"/>
  <svg x="95" y="135" width="330" height="330" viewBox="0 0 ${vb} ${vb}">${qrInner}</svg>

  <!-- right: instruction -->
  <text x="520" y="200" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="${TERRA}">Scan to</text>
  <text x="520" y="262" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="${TERRA}">save my number</text>

  <text x="522" y="330" font-family="Calibri, Arial, sans-serif" font-size="30" fill="${COCOA}">Point your camera at the code —</text>
  <text x="522" y="370" font-family="Calibri, Arial, sans-serif" font-size="30" fill="${COCOA}">your phone adds me as a contact.</text>

  ${logoBadge(522, 415, 70, TERRA)}
  <text x="610" y="448" font-family="Impact, Arial Black, sans-serif" font-size="40" letter-spacing="4" fill="${TERRA}">STOREY</text>
  <text x="612" y="482" font-family="Calibri, Arial, sans-serif" font-size="24" fill="#6B5750">storeyinfra.com</text>
  </svg>`
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer()
  fs.writeFileSync('C:\\consne\\storey-visiting-card-back.jpg', buf)
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
  pptx.defineLayout({ name: 'CARD', width: 3.5, height: 2.0 })
  pptx.layout = 'CARD'

  // ── FRONT ──
  const f = pptx.addSlide()
  f.background = { color: 'B85042' }
  const logoW = await logoBadgePngDataUrl(220, '#FFFFFF')
  f.addImage({ data: logoW, x: 0.2, y: 0.2, w: 0.37, h: 0.37 })
  f.addText('STOREY', { x: 0.65, y: 0.18, w: 2.6, h: 0.34, fontFace: 'Impact', fontSize: 26, color: 'FFFFFF', charSpacing: 2 })
  f.addText('SITE OPERATIONS · GUWAHATI', { x: 0.66, y: 0.5, w: 2.6, h: 0.2, fontFace: 'Calibri', fontSize: 8, color: 'E7E8D1', charSpacing: 1 })
  f.addText('Karun Roongta', { x: 0.2, y: 0.92, w: 3.1, h: 0.32, fontFace: 'Georgia', fontSize: 20, bold: true, color: 'FFFFFF' })
  f.addText('Founder', { x: 0.21, y: 1.22, w: 3.1, h: 0.2, fontFace: 'Calibri', fontSize: 11, color: 'E7E8D1' })
  f.addText('WhatsApp  +91 98640 66898', { x: 0.2, y: 1.5, w: 3.1, h: 0.22, fontFace: 'Calibri', fontSize: 12, bold: true, color: 'FFFFFF' })
  f.addText('help@storeyinfra.com   ·   storeyinfra.com', { x: 0.2, y: 1.72, w: 3.1, h: 0.2, fontFace: 'Calibri', fontSize: 10, color: 'E7E8D1' })

  // ── BACK ──
  const b = pptx.addSlide()
  b.background = { color: 'E7E8D1' }
  const qrData = await QR.toDataURL(VCARD, { margin: 1, width: 600, errorCorrectionLevel: 'M', color: { dark: '#2A1410', light: '#FFFFFF' } })
  b.addShape(pptx.ShapeType.roundRect, { x: 0.18, y: 0.32, w: 1.36, h: 1.36, rectRadius: 0.1, fill: { color: 'FFFFFF' } })
  b.addImage({ data: qrData, x: 0.3, y: 0.44, w: 1.12, h: 1.12 })
  b.addText('Scan to save my number', { x: 1.7, y: 0.45, w: 1.65, h: 0.7, fontFace: 'Georgia', fontSize: 17, bold: true, color: 'B85042' })
  b.addText('Point your camera at the code — your phone adds me as a contact.', { x: 1.7, y: 1.12, w: 1.65, h: 0.5, fontFace: 'Calibri', fontSize: 9, color: '2A1410' })
  b.addText('storeyinfra.com', { x: 1.7, y: 1.65, w: 1.65, h: 0.2, fontFace: 'Calibri', fontSize: 9, color: '6B5750' })

  await pptx.writeFile({ fileName: 'C:\\consne\\storey-visiting-card.pptx' })
}

async function main() {
  const fLen = await buildFront()
  const bLen = await buildBack()
  console.log('FRONT:', (fLen/1024).toFixed(0), 'KB  → storey-visiting-card-front.jpg')
  console.log('BACK :', (bLen/1024).toFixed(0), 'KB  → storey-visiting-card-back.jpg')
  await buildPPTX()
  console.log('PPTX : storey-visiting-card.pptx (2 slides: front, back)')
}
main().catch(e => { console.error(e); process.exit(1) })
