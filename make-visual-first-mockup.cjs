// Storey — visual-first design principle mockup.
// Shows the SAME Tasks list: text-heavy (today) vs visual-first (proposed).
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const TERRACOTTA = '#B85042';
const SAND       = '#E7E8D1';
const SAGE       = '#A7BEAE';
const DARK       = '#2A1410';
const RED        = '#DC2626';
const AMBER      = '#D97706';
const GREEN      = '#059669';
const BLUE       = '#2563EB';
const GRAY100    = '#F3F4F6';
const GRAY200    = '#E5E7EB';
const GRAY400    = '#9CA3AF';
const GRAY600    = '#4B5563';
const GRAY800    = '#1F2937';
const BG         = '#F9FAFB';

// Tiny construction-themed "photo" placeholders rendered with shapes
function fakePhoto(x, y, size, motif) {
  // motif: 'foundation' | 'paver' | 'railing' — different gradients
  const grads = {
    foundation: ['#8B7355', '#A18A6E'],
    paver:      ['#7B7B7B', '#9B9B9B'],
    railing:    ['#3A3A3A', '#5A5A5A'],
  };
  const [c1, c2] = grads[motif] || ['#999', '#bbb'];
  return `
    <defs>
      <linearGradient id="g_${motif}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="12" fill="url(#g_${motif})"/>
    ${motif === 'foundation' ? `
      <rect x="${x+10}" y="${y+size*0.55}" width="${size-20}" height="${size*0.35}" fill="#5C4A38" opacity="0.6"/>
      <rect x="${x+18}" y="${y+size*0.4}" width="6" height="${size*0.5}" fill="#1F1810"/>
      <rect x="${x+34}" y="${y+size*0.35}" width="6" height="${size*0.55}" fill="#1F1810"/>
      <rect x="${x+50}" y="${y+size*0.32}" width="6" height="${size*0.58}" fill="#1F1810"/>
    ` : ''}
    ${motif === 'paver' ? `
      ${Array.from({length: 4}).map((_,r) =>
        Array.from({length: 4}).map((_,c) => {
          const px = x + 8 + c*16 + (r%2?8:0);
          const py = y + 8 + r*16;
          return `<rect x="${px}" y="${py}" width="14" height="14" rx="2" fill="${c1}" stroke="#3A3A3A" stroke-width="0.5"/>`;
        }).join('')
      ).join('')}
    ` : ''}
    ${motif === 'railing' ? `
      <rect x="${x+6}" y="${y+size*0.25}" width="${size-12}" height="6" fill="#888"/>
      <rect x="${x+6}" y="${y+size*0.75}" width="${size-12}" height="6" fill="#888"/>
      ${Array.from({length: 5}).map((_,i) =>
        `<rect x="${x+12+i*14}" y="${y+size*0.25}" width="4" height="${size*0.5}" fill="#888"/>`
      ).join('')}
    ` : ''}
  `;
}

// Tiny avatar bubble
function avatar(x, y, r, initials, bg) {
  return `
    <circle cx="${x}" cy="${y}" r="${r}" fill="${bg}"/>
    <text x="${x}" y="${y + r*0.35}" text-anchor="middle"
          font-family="Arial Black, Arial, sans-serif"
          font-size="${r}" fill="white" font-weight="900">${initials}</text>
  `;
}

async function makeMockup() {
  const W = 2000, H = 1300;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Title -->
  <text x="${W/2}" y="58" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="${DARK}" font-weight="700">
    A supervisor with low literacy — same data, two designs
  </text>
  <text x="${W/2}" y="98" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY600}" font-style="italic">
    Picture-first design lets him understand his day in 2 seconds, without reading.
  </text>

  <!-- ============ LEFT: TEXT-HEAVY (current) ============ -->
  <rect x="60" y="135" width="190" height="42" rx="21" fill="${RED}"/>
  <text x="155" y="164" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="2">TEXT-HEAVY</text>

  <!-- phone frame -->
  <rect x="60" y="195" width="880" height="1050" rx="32" fill="white" stroke="${GRAY200}" stroke-width="2"/>

  <!-- header -->
  <rect x="60" y="195" width="880" height="90" rx="32" fill="${TERRACOTTA}"/>
  <rect x="60" y="245" width="880" height="40" fill="${TERRACOTTA}"/>
  <text x="100" y="252" font-family="Arial Black, Arial, sans-serif" font-size="26" fill="white" font-weight="900" letter-spacing="4">STOREY</text>
  <text x="900" y="252" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="20" fill="white">Tasks</text>

  <text x="100" y="345" font-family="Georgia, serif" font-size="34" fill="${DARK}" font-weight="700">Tasks</text>
  <text x="100" y="382" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY600}">Assign work, track daily progress and confirm.</text>

  <!-- filter + new -->
  <rect x="100" y="412" width="220" height="44" rx="8" fill="white" stroke="${GRAY200}"/>
  <text x="118" y="442" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${DARK}">All sites ▾</text>
  <rect x="760" y="412" width="180" height="44" rx="8" fill="${TERRACOTTA}"/>
  <text x="850" y="441" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="white" font-weight="700">+ New Task</text>

  <!-- card 1 -->
  <rect x="100" y="490" width="840" height="100" rx="10" fill="white" stroke="${GRAY200}"/>
  <rect x="120" y="510" width="100" height="22" rx="11" fill="#FEF3C7"/>
  <text x="170" y="526" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${AMBER}" font-weight="700">In progress</text>
  <text x="120" y="558" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${DARK}" font-weight="700">RAILING</text>
  <text x="120" y="582" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">NH-37 Extension — Furkating to Mariani · Pranab Gogoi · due 22 May 2026</text>

  <!-- card 2 -->
  <rect x="100" y="620" width="840" height="100" rx="10" fill="white" stroke="${GRAY200}"/>
  <rect x="120" y="640" width="100" height="22" rx="11" fill="#DCFCE7"/>
  <text x="170" y="656" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GREEN}" font-weight="700">Done</text>
  <text x="120" y="688" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${DARK}" font-weight="700">LAY PAVERS</text>
  <text x="120" y="712" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">NH-37 Extension — Furkating to Mariani · Pranab Gogoi · due 19 May 2026 · 1/1 sub-tasks</text>

  <!-- card 3 -->
  <rect x="100" y="750" width="840" height="100" rx="10" fill="white" stroke="${GRAY200}"/>
  <rect x="120" y="770" width="100" height="22" rx="11" fill="${GRAY100}"/>
  <text x="170" y="786" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}" font-weight="700">Pending</text>
  <text x="120" y="818" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${DARK}" font-weight="700">FOUNDATION POUR — B BLOCK</text>
  <text x="120" y="842" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">NH-37 Extension — Furkating to Mariani · Pranab Gogoi · due 24 May 2026</text>

  <!-- supervisor thought bubble -->
  <rect x="100" y="900" width="840" height="220" rx="16" fill="#FEF2F2" stroke="${RED}" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="130" y="940" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${RED}" font-weight="700">SUPERVISOR THINKS:</text>
  <text x="130" y="980" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${DARK}" font-style="italic">"In progress... pending... what's the difference?"</text>
  <text x="130" y="1015" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${DARK}" font-style="italic">"Which one do I do first?"</text>
  <text x="130" y="1050" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${DARK}" font-style="italic">"What's the work look like?"</text>
  <text x="130" y="1085" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${DARK}" font-style="italic">"...let me call Pranab."</text>

  <text x="500" y="1200" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY800}" font-style="italic">
    He reads slowly. He hesitates. He calls his boss.
  </text>

  <!-- ============ RIGHT: VISUAL-FIRST (proposed) ============ -->
  <rect x="1060" y="135" width="190" height="42" rx="21" fill="${GREEN}"/>
  <text x="1155" y="164" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="2">VISUAL-FIRST</text>

  <!-- phone frame -->
  <rect x="1060" y="195" width="880" height="1050" rx="32" fill="white" stroke="${GRAY200}" stroke-width="2"/>

  <!-- header -->
  <rect x="1060" y="195" width="880" height="90" rx="32" fill="${TERRACOTTA}"/>
  <rect x="1060" y="245" width="880" height="40" fill="${TERRACOTTA}"/>
  <text x="1100" y="252" font-family="Arial Black, Arial, sans-serif" font-size="26" fill="white" font-weight="900" letter-spacing="4">STOREY</text>
  <text x="1900" y="252" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="20" fill="white">📋 Tasks</text>

  <!-- big icon header -->
  <text x="1100" y="358" font-family="Georgia, serif" font-size="50" fill="${DARK}" font-weight="700">📋 My Tasks</text>
  <text x="1100" y="392" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${GRAY600}">3 tasks today</text>

  <!-- segmented chips -->
  <rect x="1100" y="412" width="120" height="44" rx="22" fill="${SAGE}"/>
  <text x="1160" y="441" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="white" font-weight="700">All · 3</text>
  <rect x="1230" y="412" width="100" height="44" rx="22" fill="white" stroke="${GRAY200}"/>
  <text x="1280" y="441" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${DARK}">🔥 1</text>
  <rect x="1340" y="412" width="100" height="44" rx="22" fill="white" stroke="${GRAY200}"/>
  <text x="1390" y="441" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${DARK}">✅ 1</text>

  <!-- card 1: IN PROGRESS  - amber stripe + work photo + worker avatar -->
  <rect x="1100" y="490" width="800" height="160" rx="14" fill="white" stroke="${GRAY200}" stroke-width="1.5"/>
  <rect x="1100" y="490" width="14" height="160" rx="7" fill="${AMBER}"/>
  ${fakePhoto(1135, 510, 120, 'railing')}
  <text x="1275" y="540" font-family="Georgia, serif" font-size="26" fill="${DARK}" font-weight="700">Install Railing</text>
  <text x="1275" y="568" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">NH-37 · Block A</text>
  <!-- status chip -->
  <rect x="1275" y="586" width="190" height="34" rx="17" fill="#FEF3C7"/>
  <text x="1370" y="608" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${AMBER}" font-weight="700">🏗️  Working</text>
  <!-- due chip -->
  <text x="1700" y="540" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="40" fill="${AMBER}" font-weight="900">2</text>
  <text x="1700" y="568" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}">days left</text>
  ${avatar(1850, 615, 20, 'PG', SAGE)}

  <!-- card 2: DONE — green stripe + work photo -->
  <rect x="1100" y="680" width="800" height="160" rx="14" fill="white" stroke="${GRAY200}" stroke-width="1.5"/>
  <rect x="1100" y="680" width="14" height="160" rx="7" fill="${GREEN}"/>
  ${fakePhoto(1135, 700, 120, 'paver')}
  <text x="1275" y="730" font-family="Georgia, serif" font-size="26" fill="${DARK}" font-weight="700">Lay Pavers</text>
  <text x="1275" y="758" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">NH-37 · Entrance</text>
  <rect x="1275" y="776" width="180" height="34" rx="17" fill="#DCFCE7"/>
  <text x="1365" y="798" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GREEN}" font-weight="700">✅  Done</text>
  <text x="1700" y="740" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="32" fill="${GREEN}" font-weight="900">100%</text>
  ${avatar(1850, 805, 20, 'PG', SAGE)}

  <!-- card 3: PENDING — gray stripe + photo -->
  <rect x="1100" y="870" width="800" height="160" rx="14" fill="white" stroke="${GRAY200}" stroke-width="1.5"/>
  <rect x="1100" y="870" width="14" height="160" rx="7" fill="${GRAY400}"/>
  ${fakePhoto(1135, 890, 120, 'foundation')}
  <text x="1275" y="920" font-family="Georgia, serif" font-size="26" fill="${DARK}" font-weight="700">Foundation Pour</text>
  <text x="1275" y="948" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">NH-37 · Block B</text>
  <rect x="1275" y="966" width="180" height="34" rx="17" fill="${GRAY100}"/>
  <text x="1365" y="988" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}" font-weight="700">⏰  Not Started</text>
  <text x="1700" y="930" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="40" fill="${GRAY400}" font-weight="900">4</text>
  <text x="1700" y="958" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}">days left</text>
  ${avatar(1850, 995, 20, 'PG', SAGE)}

  <!-- supervisor thought bubble -->
  <rect x="1100" y="1070" width="800" height="120" rx="16" fill="#ECFDF5" stroke="${GREEN}" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="1130" y="1110" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GREEN}" font-weight="700">SUPERVISOR THINKS:</text>
  <text x="1130" y="1148" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${DARK}" font-style="italic">"Yellow one first — only 2 days left."</text>
  <text x="1130" y="1178" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${DARK}" font-style="italic">"Photo shows it's the railing — got it."</text>

  <text x="1500" y="1230" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY800}" font-style="italic">
    He glances. He sees. He acts.
  </text>
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile('C:\\consne\\mockup-visual-first.jpg');
  console.log('JPG written: C:\\consne\\mockup-visual-first.jpg');
}

makeMockup().catch((e) => { console.error(e); process.exit(1); });
