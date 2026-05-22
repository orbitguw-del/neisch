'use strict'
const fs     = require('fs')
const path   = require('path')
const React  = require('react')
const RDS    = require('react-dom/server')
const sharp  = require('sharp')
const { FaHardHat, FaBoxes, FaClipboardList, FaMobileAlt, FaMapMarkerAlt } =
  require('react-icons/fa')

// Render a react-icon to PNG buffer
async function iconPng(IconComp, color, size) {
  const svg = RDS.renderToStaticMarkup(
    React.createElement(IconComp, { color, size: String(size) })
  )
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function main() {
  const W     = 1080
  const H     = 1920
  const SC    = W / 5.63          // pixels per inch ≈ 191.8

  const TERRA = '#B85042'
  const SAND  = '#E7E8D1'
  const SAGE  = '#A7BEAE'
  const WHITE = '#FFFFFF'
  const DARK  = '#2C1810'

  const creamY = Math.round(6.22 * SC)   // ≈ 1194

  // ── Icon sizes in px ──────────────────────────────────────────────────────
  const MOBILE_SZ = Math.round(1.1 * SC)   // ≈ 211
  const MAP_SZ    = Math.round(0.32 * SC)  // ≈ 61
  const FEAT_SZ   = Math.round(0.30 * SC)  // ≈ 57

  // ── Render all icons ──────────────────────────────────────────────────────
  const [pMobile, pMap, pHat, pBox, pClip] = await Promise.all([
    iconPng(FaMobileAlt,     WHITE,  MOBILE_SZ),
    iconPng(FaMapMarkerAlt,  DARK,   MAP_SZ),
    iconPng(FaHardHat,       TERRA,  FEAT_SZ),
    iconPng(FaBoxes,         TERRA,  FEAT_SZ),
    iconPng(FaClipboardList, TERRA,  FEAT_SZ),
  ])

  // ── Background SVG (no embedded images) ───────────────────────────────────
  const btnX = Math.round(0.45 * SC)
  const btnY = Math.round((6.22 + 0.78) * SC)
  const btnW = Math.round((5.63 - 0.90) * SC)
  const btnH = Math.round(0.72 * SC)
  const pillX = Math.round((W - 1.9 * SC) / 2)
  const pillW = Math.round(1.9 * SC)
  const pillH = Math.round(0.38 * SC)
  const featCircleR = Math.round(0.19 * SC)

  const featureCircles = [0, 1, 2].map(i => {
    const fy  = Math.round((4.55 + i * 0.55) * SC)
    const cx  = Math.round(0.45 * SC) + featCircleR
    const cy  = fy + featCircleR
    return `<circle cx="${cx}" cy="${cy}" r="${featCircleR}" fill="${SAND}"/>`
  }).join('\n  ')

  const featureLabels = [
    'Worker attendance and daily logs',
    'Materials, inventory and receipts',
    'Multi-site reports and transfers',
  ].map((label, i) => {
    const fy = Math.round((4.55 + i * 0.55) * SC)
    const tx = Math.round(1.05 * SC)
    const ty = fy + featCircleR
    return `<text x="${tx}" y="${ty}" font-family="serif" font-size="38" fill="${WHITE}" dominant-baseline="middle">${label}</text>`
  }).join('\n  ')

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">

  <!-- Terracotta background -->
  <rect width="${W}" height="${H}" fill="${TERRA}"/>

  <!-- Sage top bar -->
  <rect x="0" y="0" width="${W}" height="${Math.round(0.06 * SC)}" fill="${SAGE}"/>

  <!-- Brand pill -->
  <rect x="${pillX}" y="${Math.round(0.25 * SC)}" width="${pillW}" height="${pillH}"
        rx="${Math.round(0.12 * SC)}" fill="${WHITE}" fill-opacity="0.18"
        stroke="${WHITE}" stroke-width="2"/>
  <text x="${W / 2}" y="${Math.round((0.25 + 0.19) * SC)}"
        font-family="serif" font-size="22" fill="${WHITE}" letter-spacing="4"
        text-anchor="middle" dominant-baseline="middle">STOREY  .  STOREYINFRA</text>

  <!-- Main headline -->
  <text x="${W / 2}" y="${Math.round(2.18 * SC)}"
        font-family="serif" font-size="100" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">Run Your Sites</text>
  <text x="${W / 2}" y="${Math.round(2.72 * SC)}"
        font-family="serif" font-size="100" font-weight="bold"
        fill="${WHITE}" text-anchor="middle">From Your Phone</text>

  <!-- Sub-headline -->
  <text x="${W / 2}" y="${Math.round(3.65 * SC)}"
        font-family="serif" font-size="36" fill="${SAND}"
        text-anchor="middle" font-style="italic">Built for contractors and builders</text>
  <text x="${W / 2}" y="${Math.round(3.85 * SC)}"
        font-family="serif" font-size="36" fill="${SAND}"
        text-anchor="middle" font-style="italic">across Northeast India</text>

  <!-- Divider -->
  <line x1="${Math.round(1.4 * SC)}" y1="${Math.round(4.38 * SC)}"
        x2="${Math.round((5.63 - 1.4) * SC)}" y2="${Math.round(4.38 * SC)}"
        stroke="${SAGE}" stroke-width="2"/>

  <!-- Feature icon circles -->
  ${featureCircles}

  <!-- Feature labels -->
  ${featureLabels}

  <!-- Sand bottom zone -->
  <rect x="0" y="${creamY}" width="${W}" height="${H - creamY}" fill="${SAND}"/>

  <!-- Sage fold accent -->
  <rect x="0" y="${creamY}" width="${W}" height="${Math.round(0.07 * SC)}" fill="${SAGE}"/>

  <!-- Location text -->
  <text x="${Math.round(0.95 * SC)}" y="${Math.round((6.22 + 0.42) * SC)}"
        font-family="serif" font-size="32" fill="${DARK}" font-style="italic">
    Available across Northeast India
  </text>

  <!-- CTA button -->
  <rect x="${btnX}" y="${btnY}" width="${btnW}" height="${btnH}" rx="12" fill="${TERRA}"/>
  <text x="${btnX + btnW / 2}" y="${btnY + Math.round(btnH / 2)}"
        font-family="serif" font-size="44" font-weight="bold"
        fill="${WHITE}" text-anchor="middle" dominant-baseline="middle">
    Download Free on Android
  </text>

  <!-- Website -->
  <text x="${W / 2}" y="${Math.round((6.22 + 1.72) * SC)}"
        font-family="serif" font-size="40" font-weight="bold"
        fill="${DARK}" text-anchor="middle">storeyinfra.com</text>

  <!-- Tagline -->
  <text x="${W / 2}" y="${Math.round((6.22 + 2.1) * SC)}"
        font-family="serif" font-size="32" fill="${SAGE}"
        text-anchor="middle" font-style="italic">Manage smarter. Build faster.</text>

  <!-- Sage bottom bar -->
  <rect x="0" y="${H - Math.round(0.06 * SC)}" width="${W}"
        height="${Math.round(0.06 * SC)}" fill="${SAGE}"/>

</svg>`

  // ── Composite: background + icons ─────────────────────────────────────────
  const mobileX = Math.round((W - MOBILE_SZ) / 2)
  const mobileY = Math.round(0.75 * SC)

  const mapX = Math.round(0.5 * SC)
  const mapY = Math.round((6.22 + 0.26) * SC)

  const composites = [
    { input: pMobile, top: mobileY, left: mobileX },
    { input: pMap,    top: mapY,    left: mapX    },
  ]

  // Feature icons — centred inside each circle
  const featIcons = [pHat, pBox, pClip]
  featIcons.forEach((buf, i) => {
    const fy  = Math.round((4.55 + i * 0.55) * SC)
    const cx  = Math.round(0.45 * SC) + featCircleR
    const cy  = fy + featCircleR
    composites.push({
      input: buf,
      top:  Math.round(cy - FEAT_SZ / 2),
      left: Math.round(cx - FEAT_SZ / 2),
    })
  })

  const outPath = 'C:\\consne\\storey-whatsapp-ad.jpg'
  const buf = await sharp(Buffer.from(bgSvg))
    .composite(composites)
    .jpeg({ quality: 95 })
    .toBuffer()

  fs.writeFileSync(outPath, buf)
  console.log('Saved:', outPath, `(${(buf.length / 1024).toFixed(0)} KB)`)
}

main().catch(err => { console.error(err); process.exit(1) })
