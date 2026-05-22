'use strict'
// Guwahati travel poster — portrait vector, Ghibli-inspired warm scene.
const fs = require('fs')
const sharp = require('sharp')

const W = 1200, H = 1800

// ── Palette (warm Ghibli sunset) ──────────────────────────────────────────────
const CLOUD   = '#FBF4E7'
const SUNCORE = '#F8CE86'
const HILL_FAR = '#9FB9AE', HILL_MID = '#739C88', HILL_NEAR = '#557F6B'
const TERRA = '#B85042', TERRA_DK = '#8F3D32', GOLD = '#E7C46A'
const BRIDGE = '#3C4A52'
const LAND = '#3B5847', LAND_DK = '#2E4639'
const DARK = '#2C1810', CREAM = '#F6EFE0'
const RHINO = '#2A3930'

// ── Helpers ───────────────────────────────────────────────────────────────────
function cloud(x, y, s, op = 0.92) {
  const e = (cx, cy, rx, ry) =>
    `<ellipse cx="${x + cx * s}" cy="${y + cy * s}" rx="${rx * s}" ry="${ry * s}" fill="${CLOUD}" opacity="${op}"/>`
  return e(0, 14, 52, 22) + e(34, 6, 40, 30) + e(74, 16, 46, 24) + e(-30, 16, 34, 20) + e(20, 22, 60, 20)
}
function bird(x, y, s) {
  return `<path d="M${x},${y} q ${7*s},${-7*s} ${14*s},0 q ${7*s},${-7*s} ${14*s},0"
    fill="none" stroke="${DARK}" stroke-width="${2.4*s}" stroke-linecap="round" opacity="0.55"/>`
}
function label(x, y, text, w) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="40" rx="20" fill="${CREAM}" opacity="0.96"/>
    <circle cx="${x + 20}" cy="${y + 20}" r="6" fill="${TERRA}"/>
    <text x="${x + 36}" y="${y + 26}" font-family="Arial, sans-serif" font-size="19"
          font-weight="bold" fill="${TERRA_DK}" letter-spacing="0.3">${text}</text>`
}
// stylised tree
function tree(x, y, s, c) {
  return `
    <rect x="${x - 4*s}" y="${y - 14*s}" width="${8*s}" height="${20*s}" rx="3" fill="${LAND_DK}"/>
    <circle cx="${x}" cy="${y - 24*s}" r="${22*s}" fill="${c}"/>
    <circle cx="${x - 16*s}" cy="${y - 14*s}" r="${15*s}" fill="${c}"/>
    <circle cx="${x + 16*s}" cy="${y - 14*s}" r="${15*s}" fill="${c}"/>`
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#6E8FB8"/>
      <stop offset="0.45" stop-color="#C98F86"/>
      <stop offset="0.72" stop-color="#EBAE81"/>
      <stop offset="1"   stop-color="#F8D9AC"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0"   stop-color="#FCEFCB"/>
      <stop offset="0.55" stop-color="${SUNCORE}"/>
      <stop offset="1"   stop-color="${SUNCORE}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CFE0DF"/>
      <stop offset="1" stop-color="#7FA6B6"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="${W}" height="1180" fill="url(#sky)"/>

  <!-- Sun glow + core -->
  <circle cx="820" cy="470" r="320" fill="url(#sun)"/>
  <circle cx="820" cy="470" r="118" fill="#FCEFCB"/>
  <circle cx="820" cy="470" r="118" fill="none" stroke="#FBE3AE" stroke-width="14" opacity="0.6"/>

  <!-- Clouds -->
  ${cloud(210, 360, 1.5, 0.95)}
  ${cloud(880, 250, 1.15, 0.9)}
  ${cloud(420, 600, 1.05, 0.85)}
  ${cloud(120, 720, 0.9, 0.8)}

  <!-- Birds -->
  ${bird(520, 330, 1.4)}${bird(580, 360, 1.1)}${bird(470, 380, 1.0)}
  ${bird(940, 540, 1.2)}${bird(1000, 565, 0.9)}

  <!-- Title -->
  <text x="${W/2}" y="240" font-family="Georgia, serif" font-size="118" font-weight="bold"
        fill="${DARK}" text-anchor="middle" letter-spacing="14">GUWAHATI</text>
  <text x="${W/2}" y="292" font-family="Arial, sans-serif" font-size="24"
        fill="${TERRA_DK}" text-anchor="middle" letter-spacing="7">ASSAM · GATEWAY TO NORTHEAST INDIA</text>
  <line x1="${W/2 - 130}" y1="320" x2="${W/2 + 130}" y2="320" stroke="${TERRA}" stroke-width="3"/>

  <!-- Far hills (Nilachal range) -->
  <path d="M0,820 Q200,690 430,760 T880,710 T1200,780 V1180 H0 Z" fill="${HILL_FAR}"/>
  <path d="M0,900 Q260,790 540,860 T1040,820 T1200,880 V1180 H0 Z" fill="${HILL_MID}"/>

  <!-- Kamakhya Temple on the hill -->
  <g transform="translate(232,612)">
    <ellipse cx="74" cy="232" rx="150" ry="34" fill="${HILL_MID}"/>
    <rect x="14" y="176" width="120" height="44" rx="4" fill="#C9B79C"/>
    <rect x="34" y="120" width="80" height="60" fill="${TERRA}"/>
    <path d="M30,120 C30,34 118,34 118,120 Z" fill="${TERRA}"/>
    <path d="M30,120 C30,34 118,34 118,120" fill="none" stroke="${TERRA_DK}" stroke-width="3"/>
    <line x1="38" y1="92" x2="110" y2="92" stroke="${TERRA_DK}" stroke-width="3" opacity="0.7"/>
    <line x1="33" y1="64" x2="115" y2="64" stroke="${TERRA_DK}" stroke-width="3" opacity="0.7"/>
    <circle cx="74" cy="34" r="11" fill="${GOLD}"/>
    <rect x="71" y="6" width="6" height="22" fill="${GOLD}"/>
  </g>

  <!-- Brahmaputra River -->
  <path d="M0,930 Q300,890 620,930 T1200,945 V1190 H0 Z" fill="url(#river)"/>
  <path d="M120,1010 q70,-14 150,0" stroke="#E8F0EF" stroke-width="4" fill="none" opacity="0.7"/>
  <path d="M520,1070 q90,-16 190,0" stroke="#E8F0EF" stroke-width="4" fill="none" opacity="0.6"/>
  <path d="M820,1010 q70,-12 150,0" stroke="#E8F0EF" stroke-width="4" fill="none" opacity="0.6"/>

  <!-- Saraighat Bridge -->
  <g>
    <rect x="0" y="980" width="1200" height="16" fill="${BRIDGE}"/>
    ${[120,360,600,840,1080].map((x)=>`<rect x="${x-7}" y="996" width="14" height="60" fill="${BRIDGE}"/>`).join('')}
    ${[120,360,600,840].map((x)=>`<path d="M${x},980 L${x+240},980 L${x+120},936 Z" fill="none" stroke="${BRIDGE}" stroke-width="7"/>`).join('')}
  </g>

  <!-- Umananda Temple on Peacock Island -->
  <g transform="translate(905,946)">
    <ellipse cx="40" cy="40" rx="78" ry="22" fill="${HILL_NEAR}"/>
    <rect x="22" y="6" width="36" height="30" fill="${CREAM}"/>
    <path d="M20,6 C20,-26 60,-26 60,6 Z" fill="${TERRA}"/>
    <circle cx="40" cy="-22" r="6" fill="${GOLD}"/>
  </g>

  <!-- Foreground land + tea-garden rows -->
  <path d="M0,1150 Q320,1090 680,1140 T1200,1130 V1800 H0 Z" fill="${LAND}"/>
  <path d="M0,1320 Q380,1260 760,1320 T1200,1330 V1800 H0 Z" fill="${LAND_DK}"/>
  ${[1190,1235,1280].map((y,i)=>
    `<g opacity="0.5">${Array.from({length:14},(_,k)=>
      `<circle cx="${70+k*82}" cy="${y+ (k%2)*8}" r="${11-i*1.5}" fill="#4C6B58"/>`).join('')}</g>`).join('')}

  <!-- Areca palms -->
  ${tree(150, 1300, 2.0, '#3F6151')}
  ${tree(1070, 1340, 2.3, '#3A5A4B')}

  <!-- Meadow + one-horned rhino — emblem of Assam -->
  <ellipse cx="600" cy="1585" rx="440" ry="150" fill="#4E7361"/>
  <g transform="translate(470,1392)">
    <ellipse cx="320" cy="196" rx="150" ry="20" fill="#3A584A" opacity="0.6"/>
    <!-- legs -->
    <rect x="86"  y="150" width="32" height="58" rx="12" fill="${RHINO}"/>
    <rect x="150" y="150" width="32" height="58" rx="12" fill="${RHINO}"/>
    <rect x="282" y="150" width="34" height="58" rx="12" fill="${RHINO}"/>
    <rect x="344" y="150" width="34" height="58" rx="12" fill="${RHINO}"/>
    <!-- body + back hump -->
    <ellipse cx="240" cy="104" rx="158" ry="66" fill="${RHINO}"/>
    <ellipse cx="170" cy="62"  rx="86"  ry="54" fill="${RHINO}"/>
    <!-- tail -->
    <path d="M392,92 q34,14 26,86 q-16,-6 -24,-34 q-6,-22 -16,-40 Z" fill="${RHINO}"/>
    <!-- head (lowered, front-left) -->
    <ellipse cx="74" cy="120" rx="70" ry="52" fill="${RHINO}"/>
    <ellipse cx="118" cy="64" rx="18" ry="24" fill="${RHINO}"/>
    <!-- single horn -->
    <path d="M30,128 L48,34 L84,120 Z" fill="${RHINO}"/>
  </g>

  <!-- Landmark labels -->
  ${label(96, 560, 'KAMAKHYA TEMPLE', 232)}
  ${label(640, 760, 'NILACHAL HILLS', 210)}
  ${label(96, 1000, 'BRAHMAPUTRA RIVER', 252)}
  ${label(852, 866, 'UMANANDA TEMPLE', 240)}
  ${label(360, 940, 'SARAIGHAT BRIDGE', 240)}

  <!-- Bottom caption strip -->
  <rect x="0" y="1700" width="${W}" height="100" fill="${DARK}"/>
  <text x="${W/2}" y="1748" font-family="Georgia, serif" font-size="34" font-weight="bold"
        fill="${CREAM}" text-anchor="middle" letter-spacing="3">Land of the Red River</text>
  <text x="${W/2}" y="1782" font-family="Arial, sans-serif" font-size="18"
        fill="${GOLD}" text-anchor="middle" letter-spacing="5">VISIT GUWAHATI · ASSAM · INDIA</text>

  <!-- Poster frame -->
  <rect x="22" y="22" width="${W-44}" height="${H-44}" fill="none" stroke="${CREAM}"
        stroke-width="5" opacity="0.85"/>
</svg>`

async function main() {
  const out = await sharp(Buffer.from(svg)).png().toBuffer()
  fs.writeFileSync('C:\\consne\\guwahati-poster.png', out)
  console.log('Saved guwahati-poster.png', `${(out.length/1024).toFixed(0)} KB`, `${W}x${H}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
