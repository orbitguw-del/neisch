'use strict'
const fs    = require('fs')
const React = require('react')
const RDS   = require('react-dom/server')
const sharp = require('sharp')
const { FaHardHat, FaBoxes, FaClipboardList, FaMobileAlt } = require('react-icons/fa')

async function iconPng(IconComp, color, size) {
  const svg = RDS.renderToStaticMarkup(React.createElement(IconComp, { color, size: String(size) }))
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function main() {
  const W = 1024, H = 500
  const TERRA = '#B85042'
  const SAND  = '#E7E8D1'
  const SAGE  = '#A7BEAE'
  const WHITE = '#FFFFFF'
  const DARK  = '#2C1810'

  const [iMobile, iHat, iBox, iClip] = await Promise.all([
    iconPng(FaMobileAlt,     WHITE, 110),
    iconPng(FaHardHat,       TERRA,  56),
    iconPng(FaBoxes,         TERRA,  56),
    iconPng(FaClipboardList, TERRA,  56),
  ])

  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">

  <!-- Terracotta left 62% -->
  <rect width="${Math.round(W*0.62)}" height="${H}" fill="${TERRA}"/>

  <!-- Sand right 38% -->
  <rect x="${Math.round(W*0.62)}" width="${Math.round(W*0.38)}" height="${H}" fill="${SAND}"/>

  <!-- Sage vertical accent divider -->
  <rect x="${Math.round(W*0.62)-4}" y="0" width="8" height="${H}" fill="${SAGE}"/>

  <!-- Sage top bar -->
  <rect x="0" y="0" width="${W}" height="7" fill="${SAGE}"/>

  <!-- Sage bottom bar -->
  <rect x="0" y="${H-7}" width="${W}" height="7" fill="${SAGE}"/>

  <!-- Brand name -->
  <text x="64" y="112" font-family="serif" font-size="88" font-weight="bold"
        fill="${WHITE}" letter-spacing="-2">STOREY</text>

  <!-- Tagline -->
  <text x="66" y="162" font-family="serif" font-size="28" fill="${SAND}" font-style="italic">
    Run your sites from your phone
  </text>

  <!-- Divider under tagline -->
  <line x1="66" y1="185" x2="380" y2="185" stroke="${SAGE}" stroke-width="2"/>

  <!-- Feature 1 -->
  <circle cx="96" cy="248" r="34" fill="${WHITE}" fill-opacity="0.15"/>
  <text x="144" y="254" font-family="serif" font-size="22" fill="${WHITE}" dominant-baseline="middle">Worker attendance and logs</text>

  <!-- Feature 2 -->
  <circle cx="96" cy="318" r="34" fill="${WHITE}" fill-opacity="0.15"/>
  <text x="144" y="324" font-family="serif" font-size="22" fill="${WHITE}" dominant-baseline="middle">Materials and inventory</text>

  <!-- Feature 3 -->
  <circle cx="96" cy="388" r="34" fill="${WHITE}" fill-opacity="0.15"/>
  <text x="144" y="394" font-family="serif" font-size="22" fill="${WHITE}" dominant-baseline="middle">Multi-site reports and transfers</text>

  <!-- Right side: storeyinfra.com -->
  <text x="${Math.round(W*0.62) + 60}" y="200" font-family="serif" font-size="26"
        font-weight="bold" fill="${DARK}">storeyinfra.com</text>

  <text x="${Math.round(W*0.62) + 60}" y="245" font-family="serif" font-size="20"
        fill="${DARK}" font-style="italic">Free on Android</text>

  <!-- Sage pill badge -->
  <rect x="${Math.round(W*0.62) + 58}" y="290" width="220" height="46" rx="23"
        fill="${SAGE}"/>
  <text x="${Math.round(W*0.62) + 168}" y="319" font-family="serif" font-size="19"
        font-weight="bold" fill="${DARK}" text-anchor="middle">Built for NE India</text>

  <!-- Manage smarter tagline -->
  <text x="${Math.round(W*0.62) + 60}" y="410" font-family="serif" font-size="18"
        fill="${SAGE}" font-style="italic">Manage smarter. Build faster.</text>

</svg>`

  // Composite icons onto circles
  const composites = [
    { input: iMobile, top: Math.round(H/2 - 55), left: Math.round(W*0.62) + 60 - 20 },
    { input: iHat,    top: 248 - 28, left: 96 - 28 },
    { input: iBox,    top: 318 - 28, left: 96 - 28 },
    { input: iClip,   top: 388 - 28, left: 96 - 28 },
  ]

  // Position mobile icon better on right side centred
  composites[0] = { input: iMobile, top: 168, left: Math.round(W*0.62) + 200 }

  const buf = await sharp(Buffer.from(bg))
    .composite(composites)
    .jpeg({ quality: 97 })
    .toBuffer()

  fs.writeFileSync('C:\\consne\\feature-graphic.jpg', buf)
  console.log('Saved: C:\\consne\\feature-graphic.jpg', `(${(buf.length/1024).toFixed(0)} KB)`)
}

main().catch(e => { console.error(e); process.exit(1) })
