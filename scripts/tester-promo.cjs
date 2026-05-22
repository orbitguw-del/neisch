'use strict'
// Minimalist high-resolution WhatsApp promo — beta tester invite.
const fs = require('fs')
const sharp = require('sharp')

const W = 1440, H = 1800
const TERRA = '#B85042'
const DARK  = '#2C1810'
const MUTE  = '#8b7b72'
const LINE  = '#e7e1d8'
const WHITE = '#FFFFFF'

// Logo badge — terracotta icon, centred near top
const ICON = 150
const ICON_X = Math.round((W - ICON) / 2)
const ICON_Y = 220

const features = [
  'Mark attendance, auto-calculate wages',
  'Track materials, stock & purchases',
  'Record site expenses & daily work',
  'See live reports on your phone',
]
const featureSvg = features.map((f, i) => {
  const y = 980 + i * 84
  return `
    <circle cx="${W/2 - 290}" cy="${y - 9}" r="4" fill="${TERRA}"/>
    <text x="${W/2 - 262}" y="${y}" font-family="Arial, sans-serif" font-size="40"
          fill="${DARK}" letter-spacing="0.3">${f.replace(/&/g, '&amp;')}</text>`
}).join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${WHITE}"/>

  <!-- Wordmark -->
  <text x="${W/2}" y="540" font-family="Georgia, serif" font-size="92"
        font-weight="bold" fill="${DARK}" text-anchor="middle" letter-spacing="6">STOREY</text>
  <text x="${W/2}" y="600" font-family="Arial, sans-serif" font-size="26"
        fill="${MUTE}" text-anchor="middle" letter-spacing="5">CONSTRUCTION, ORGANISED</text>

  <!-- Thin rule -->
  <line x1="${W/2 - 90}" y1="666" x2="${W/2 + 90}" y2="666" stroke="${TERRA}" stroke-width="3"/>

  <!-- Headline -->
  <text x="${W/2}" y="800" font-family="Georgia, serif" font-size="84"
        fill="${DARK}" text-anchor="middle">Be a beta tester</text>
  <text x="${W/2}" y="864" font-family="Arial, sans-serif" font-size="36"
        fill="${MUTE}" text-anchor="middle">A free app for contractors</text>

  <!-- Features -->
  ${featureSvg}

  <!-- Divider -->
  <line x1="200" y1="1420" x2="${W - 200}" y2="1420" stroke="${LINE}" stroke-width="2"/>

  <!-- Call to action -->
  <text x="${W/2}" y="1520" font-family="Georgia, serif" font-size="52"
        fill="${TERRA}" text-anchor="middle">Reply with your Gmail to join</text>
  <text x="${W/2}" y="1576" font-family="Arial, sans-serif" font-size="32"
        fill="${MUTE}" text-anchor="middle">Free · 2-week test · install in 2 minutes</text>

  <!-- Footer -->
  <text x="${W/2}" y="1690" font-family="Georgia, serif" font-size="34"
        fill="${DARK}" text-anchor="middle">Karun</text>
  <text x="${W/2}" y="1734" font-family="Arial, sans-serif" font-size="28"
        fill="${MUTE}" text-anchor="middle" letter-spacing="1">WhatsApp +91 98640 66898</text>
  <text x="${W/2}" y="1772" font-family="Arial, sans-serif" font-size="26"
        fill="${TERRA}" text-anchor="middle" letter-spacing="1">storeyinfra.com</text>
</svg>`

async function main() {
  const roundedMask = Buffer.from(
    `<svg width="${ICON}" height="${ICON}"><rect width="${ICON}" height="${ICON}" rx="34" fill="#fff"/></svg>`
  )
  const iconBuf = await sharp('C:\\consne\\app-icon-512.png')
    .resize(ICON, ICON)
    .composite([{ input: roundedMask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  const out = await sharp(Buffer.from(svg))
    .composite([{ input: iconBuf, top: ICON_Y, left: ICON_X }])
    .jpeg({ quality: 95 })
    .toBuffer()

  fs.writeFileSync('C:\\consne\\storey-tester-invite.jpg', out)
  console.log('Saved storey-tester-invite.jpg', `${(out.length/1024).toFixed(0)} KB`, `${W}x${H}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
