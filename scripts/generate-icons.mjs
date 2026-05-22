import sharp from 'sharp'
import { readFileSync } from 'fs'
import path from 'path'

const svgPath   = new URL('../storey-logo.svg', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const resBase   = new URL('../android/app/src/main/res', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const svgBuffer = readFileSync(svgPath)

// Standard launcher icon sizes (full icon with background)
const ICONS = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
]

// Adaptive icon foreground sizes (108dp base, logo centred in safe zone)
const FOREGROUND = [
  { dir: 'mipmap-mdpi',    size: 108 },
  { dir: 'mipmap-hdpi',    size: 162 },
  { dir: 'mipmap-xhdpi',   size: 216 },
  { dir: 'mipmap-xxhdpi',  size: 324 },
  { dir: 'mipmap-xxxhdpi', size: 432 },
]

async function generate() {
  // ── Regular launcher icons ──────────────────────────────────────────────────
  for (const { dir, size } of ICONS) {
    const out = path.join(resBase, dir, 'ic_launcher.png')
    await sharp(svgBuffer).resize(size, size).png().toFile(out)
    console.log(`✓ ${out}`)

    const outR = path.join(resBase, dir, 'ic_launcher_round.png')
    // Round icon: same image (background is already square with rx)
    await sharp(svgBuffer).resize(size, size).png().toFile(outR)
    console.log(`✓ ${outR}`)
  }

  // ── Adaptive foreground icons ───────────────────────────────────────────────
  // Centre the logo inside the safe-zone circle (66% of the total foreground)
  for (const { dir, size } of FOREGROUND) {
    const logoSize = Math.round(size * 0.6)
    const padding  = Math.round((size - logoSize) / 2)

    const logoBuffer = await sharp(svgBuffer)
      .resize(logoSize, logoSize)
      .png()
      .toBuffer()

    const out = path.join(resBase, dir, 'ic_launcher_foreground.png')
    await sharp({
      create: {
        width:      size,
        height:     size,
        channels:   4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent background
      },
    })
      .composite([{ input: logoBuffer, top: padding, left: padding }])
      .png()
      .toFile(out)

    console.log(`✓ ${out}`)
  }

  // ── Play Store icon (512×512) ───────────────────────────────────────────────
  const psOut = path.join(resBase, '..', '..', '..', '..', '..', 'play-store-icon.png')
  await sharp(svgBuffer).resize(512, 512).png().toFile(
    path.join(process.cwd(), 'play-store-icon.png')
  )
  console.log('✓ play-store-icon.png (512×512, for Play Store listing)')

  console.log('\nAll icons generated ✅')
}

generate().catch(err => { console.error(err); process.exit(1) })
