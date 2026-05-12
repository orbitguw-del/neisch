const sharp = require('sharp')
const fs    = require('fs')
const path  = require('path')

const svgBuffer = fs.readFileSync(path.join(__dirname, '..', 'storey-logo.svg'))
const resBase   = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res')

const ICONS = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
]

const FOREGROUND = [
  { dir: 'mipmap-mdpi',    size: 108 },
  { dir: 'mipmap-hdpi',    size: 162 },
  { dir: 'mipmap-xhdpi',   size: 216 },
  { dir: 'mipmap-xxhdpi',  size: 324 },
  { dir: 'mipmap-xxxhdpi', size: 432 },
]

async function generate() {
  // Regular launcher icons
  for (const { dir, size } of ICONS) {
    const out  = path.join(resBase, dir, 'ic_launcher.png')
    const outR = path.join(resBase, dir, 'ic_launcher_round.png')
    await sharp(svgBuffer).resize(size, size).png().toFile(out)
    await sharp(svgBuffer).resize(size, size).png().toFile(outR)
    console.log(`✓ ${dir}/ic_launcher.png  (${size}×${size})`)
  }

  // Adaptive foreground icons (logo centred, transparent bg)
  for (const { dir, size } of FOREGROUND) {
    const logoSize   = Math.round(size * 0.6)
    const padding    = Math.round((size - logoSize) / 2)
    const logoBuffer = await sharp(svgBuffer).resize(logoSize, logoSize).png().toBuffer()
    const out        = path.join(resBase, dir, 'ic_launcher_foreground.png')
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: logoBuffer, top: padding, left: padding }])
      .png()
      .toFile(out)
    console.log(`✓ ${dir}/ic_launcher_foreground.png  (${size}×${size})`)
  }

  // Play Store 512×512
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(__dirname, '..', 'play-store-icon.png'))
  console.log('✓ play-store-icon.png  (512×512)')

  console.log('\nAll icons generated ✅')
}

generate().catch(err => { console.error(err); process.exit(1) })
