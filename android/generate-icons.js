/**
 * Generates Android launcher icons and splash screen from a source PNG.
 *
 * Usage:
 *   1. Place a 1024x1024 PNG at android/source-icon.png
 *   2. Run: node android/generate-icons.js
 *
 * Requires: npm install -g sharp-cli   (or install sharp locally)
 *
 * Sizes generated (mipmap folders):
 *   mdpi    48x48
 *   hdpi    72x72
 *   xhdpi   96x96
 *   xxhdpi  144x144
 *   xxxhdpi 192x192
 */

const path = require('path')
const fs   = require('fs')

const sizes = {
  'mipmap-mdpi':    48,
  'mipmap-hdpi':    72,
  'mipmap-xhdpi':   96,
  'mipmap-xxhdpi':  144,
  'mipmap-xxxhdpi': 192,
}

console.log('Run this with sharp-cli installed:')
console.log()
Object.entries(sizes).forEach(([folder, size]) => {
  const dir = path.join(__dirname, 'app/src/main/res', folder)
  console.log(`sharp -i source-icon.png -o ${dir}/ic_launcher.png resize ${size} ${size}`)
  console.log(`sharp -i source-icon-round.png -o ${dir}/ic_launcher_round.png resize ${size} ${size}`)
})
