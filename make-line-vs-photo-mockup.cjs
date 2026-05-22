// Line illustration vs photo thumbnail — Storey task cards.
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const TERRACOTTA = '#B85042';
const SAND       = '#E7E8D1';
const SAGE       = '#A7BEAE';
const DARK       = '#2A1410';
const RED        = '#DC2626';
const AMBER      = '#D97706';
const GREEN      = '#059669';
const GRAY200    = '#E5E7EB';
const GRAY400    = '#9CA3AF';
const GRAY500    = '#6B7280';
const GRAY600    = '#4B5563';
const GRAY800    = '#1F2937';
const BG         = '#F9FAFB';

// ─── PHOTO-style placeholder (the previous approach) ──────────
function fakePhoto(x, y, size, motif) {
  const grads = {
    foundation: ['#8B7355', '#A18A6E'],
    paver:      ['#7B7B7B', '#9B9B9B'],
    railing:    ['#3A3A3A', '#5A5A5A'],
    pour:       ['#6E5A45', '#8B7355'],
  };
  const [c1, c2] = grads[motif] || ['#999', '#bbb'];
  return `
    <defs>
      <linearGradient id="p_${motif}_${x}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="url(#p_${motif}_${x})"/>
    ${motif === 'foundation' ? `
      <rect x="${x+size*0.22}" y="${y+size*0.4}" width="${size*0.07}" height="${size*0.5}" fill="#1F1810"/>
      <rect x="${x+size*0.42}" y="${y+size*0.35}" width="${size*0.07}" height="${size*0.55}" fill="#1F1810"/>
      <rect x="${x+size*0.62}" y="${y+size*0.32}" width="${size*0.07}" height="${size*0.58}" fill="#1F1810"/>` : ''}
    ${motif === 'paver' ? Array.from({length: 4}).map((_,r) =>
        Array.from({length: 4}).map((_,c) => {
          const px = x + size*0.1 + c*(size*0.18) + (r%2?size*0.09:0);
          const py = y + size*0.1 + r*(size*0.18);
          return `<rect x="${px}" y="${py}" width="${size*0.16}" height="${size*0.16}" rx="2" fill="${c1}" stroke="#3A3A3A" stroke-width="0.5"/>`;
        }).join('')
      ).join('') : ''}
    ${motif === 'railing' ? `
      <rect x="${x+size*0.07}" y="${y+size*0.25}" width="${size*0.86}" height="${size*0.07}" fill="#888"/>
      <rect x="${x+size*0.07}" y="${y+size*0.75}" width="${size*0.86}" height="${size*0.07}" fill="#888"/>
      ${Array.from({length: 5}).map((_,i) =>
        `<rect x="${x+size*0.15+i*(size*0.18)}" y="${y+size*0.25}" width="${size*0.05}" height="${size*0.5}" fill="#888"/>`
      ).join('')}` : ''}
    ${motif === 'pour' ? `
      <rect x="${x+size*0.2}" y="${y+size*0.55}" width="${size*0.6}" height="${size*0.3}" fill="#5C4A38"/>
      <ellipse cx="${x+size*0.5}" cy="${y+size*0.55}" rx="${size*0.3}" ry="${size*0.07}" fill="#3D3025"/>` : ''}
  `;
}

// ─── LINE illustration set ────────────────────────────────────
// Stroke 3px, terracotta on sand background, square frame.
function lineFrame(x, y, size) {
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${SAND}"/>`;
}
function lineRailing(x, y, size) {
  // Two horizontal rails + 5 vertical posts
  const sw = 3;
  return `
    ${lineFrame(x, y, size)}
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <line x1="${x+size*0.15}" y1="${y+size*0.32}" x2="${x+size*0.85}" y2="${y+size*0.32}"/>
      <line x1="${x+size*0.15}" y1="${y+size*0.68}" x2="${x+size*0.85}" y2="${y+size*0.68}"/>
      ${[0,1,2,3,4].map(i => {
        const px = x + size*0.2 + i * (size*0.6/4);
        return `<line x1="${px}" y1="${y+size*0.25}" x2="${px}" y2="${y+size*0.75}"/>`;
      }).join('')}
      <line x1="${x+size*0.1}" y1="${y+size*0.82}" x2="${x+size*0.9}" y2="${y+size*0.82}" stroke="${DARK}" stroke-width="2"/>
    </g>
  `;
}
function linePaver(x, y, size) {
  const sw = 2.5;
  return `
    ${lineFrame(x, y, size)}
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      ${Array.from({length: 3}).map((_,r) =>
        Array.from({length: 3}).map((_,c) => {
          const px = x + size*0.18 + c*(size*0.22) + (r%2?size*0.11:0);
          const py = y + size*0.22 + r*(size*0.22);
          return `<rect x="${px}" y="${py}" width="${size*0.18}" height="${size*0.18}" rx="2"/>`;
        }).join('')
      ).join('')}
    </g>
  `;
}
function lineFoundation(x, y, size) {
  const sw = 3;
  return `
    ${lineFrame(x, y, size)}
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <!-- Ground line -->
      <line x1="${x+size*0.1}" y1="${y+size*0.78}" x2="${x+size*0.9}" y2="${y+size*0.78}"/>
      <!-- 3 columns rising from ground -->
      <line x1="${x+size*0.25}" y1="${y+size*0.4}" x2="${x+size*0.25}" y2="${y+size*0.78}"/>
      <line x1="${x+size*0.5}" y1="${y+size*0.3}" x2="${x+size*0.5}" y2="${y+size*0.78}"/>
      <line x1="${x+size*0.75}" y1="${y+size*0.35}" x2="${x+size*0.75}" y2="${y+size*0.78}"/>
      <!-- Footing pads -->
      <rect x="${x+size*0.18}" y="${y+size*0.78}" width="${size*0.14}" height="${size*0.08}" fill="${TERRACOTTA}" stroke="none"/>
      <rect x="${x+size*0.43}" y="${y+size*0.78}" width="${size*0.14}" height="${size*0.08}" fill="${TERRACOTTA}" stroke="none"/>
      <rect x="${x+size*0.68}" y="${y+size*0.78}" width="${size*0.14}" height="${size*0.08}" fill="${TERRACOTTA}" stroke="none"/>
    </g>
  `;
}
function lineSlab(x, y, size) {
  const sw = 3;
  return `
    ${lineFrame(x, y, size)}
    <g stroke="${TERRACOTTA}" stroke-width="${sw}" stroke-linecap="round" fill="none">
      <!-- Top slab plate (perspective) -->
      <polygon points="${x+size*0.15},${y+size*0.45} ${x+size*0.55},${y+size*0.3} ${x+size*0.9},${y+size*0.4} ${x+size*0.5},${y+size*0.55}"/>
      <!-- Side -->
      <line x1="${x+size*0.15}" y1="${y+size*0.45}" x2="${x+size*0.15}" y2="${y+size*0.6}"/>
      <line x1="${x+size*0.9}" y1="${y+size*0.4}" x2="${x+size*0.9}" y2="${y+size*0.55}"/>
      <line x1="${x+size*0.5}" y1="${y+size*0.55}" x2="${x+size*0.5}" y2="${y+size*0.7}"/>
      <line x1="${x+size*0.15}" y1="${y+size*0.6}" x2="${x+size*0.5}" y2="${y+size*0.7}"/>
      <line x1="${x+size*0.9}" y1="${y+size*0.55}" x2="${x+size*0.5}" y2="${y+size*0.7}"/>
      <!-- Rebar grid lines on top -->
      <line x1="${x+size*0.28}" y1="${y+size*0.4}" x2="${x+size*0.62}" y2="${y+size*0.5}" stroke-width="1.5"/>
      <line x1="${x+size*0.4}" y1="${y+size*0.35}" x2="${x+size*0.76}" y2="${y+size*0.46}" stroke-width="1.5"/>
    </g>
  `;
}

// ─── Build the side-by-side comparison ────────────────────────
async function makeMockup() {
  const W = 1900, H = 1500;

  const cards = [
    { title: 'Install Railing', sub: 'Block A · Pranab', stat: 'Working', stripe: AMBER, chip:'#FEF3C7', chipFg: AMBER, daysLabel:'2', daysSub:'days', daysColor: AMBER, photoMotif: 'railing', lineFn: lineRailing },
    { title: 'Lay Pavers',      sub: 'Entrance · Pranab', stat: 'Done',    stripe: GREEN, chip:'#DCFCE7', chipFg: GREEN, daysLabel:'100%', daysSub:'',     daysColor: GREEN, photoMotif: 'paver',   lineFn: linePaver },
    { title: 'Foundation Pour', sub: 'Block B · Pranab',  stat: 'Not Started', stripe: GRAY400, chip:'#F3F4F6', chipFg: GRAY600, daysLabel:'4', daysSub:'days', daysColor: GRAY400, photoMotif: 'foundation', lineFn: lineFoundation },
    { title: 'Roof Slab',       sub: 'Block C · Pranab', stat: 'Blocked', stripe: RED, chip:'#FEE2E2', chipFg: RED, daysLabel:'!', daysSub:'overdue', daysColor: RED, photoMotif: 'pour', lineFn: lineSlab },
  ];

  const renderCard = (card, x, y, cardW, useLine) => {
    const stripeW = 12;
    const photoSize = 90;
    const photoX = x + 25;
    const photoY = y + 25;
    const titleX = photoX + photoSize + 25;
    const visual = useLine
      ? card.lineFn(photoX, photoY, photoSize)
      : fakePhoto(photoX, photoY, photoSize, card.photoMotif);
    return `
      <rect x="${x}" y="${y}" width="${cardW}" height="140" rx="14" fill="white" stroke="${GRAY200}" stroke-width="1.5"/>
      <rect x="${x}" y="${y}" width="${stripeW}" height="140" rx="6" fill="${card.stripe}"/>
      ${visual}
      <text x="${titleX}" y="${y+55}" font-family="Georgia, serif" font-size="22" fill="${DARK}" font-weight="700">${card.title}</text>
      <text x="${titleX}" y="${y+80}" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}">${card.sub}</text>
      <rect x="${titleX}" y="${y+92}" width="135" height="28" rx="14" fill="${card.chip}"/>
      <text x="${titleX+67}" y="${y+111}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${card.chipFg}" font-weight="700">${card.stat}</text>
      <text x="${x+cardW-30}" y="${y+65}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-size="36" fill="${card.daysColor}" font-weight="900">${card.daysLabel}</text>
      <text x="${x+cardW-30}" y="${y+88}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="13" fill="${GRAY600}">${card.daysSub}</text>
    `;
  };

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="${W/2}" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="${DARK}" font-weight="700">
    Photo thumbnail vs line illustration
  </text>
  <text x="${W/2}" y="100" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY600}" font-style="italic">
    Same task cards, two visual systems. The right side scales better to every site, every screen.
  </text>

  <!-- LEFT label -->
  <rect x="80" y="140" width="200" height="44" rx="22" fill="${GRAY500}"/>
  <text x="180" y="170" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="2">PHOTO STYLE</text>

  <!-- RIGHT label -->
  <rect x="1020" y="140" width="200" height="44" rx="22" fill="${TERRACOTTA}"/>
  <text x="1120" y="170" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="2">LINE STYLE</text>

  ${cards.map((card, i) => {
    const y = 220 + i * 165;
    return `
      ${renderCard(card, 80, y, 880, false)}
      ${renderCard(card, 1020, y, 800, true)}
    `;
  }).join('')}

  <!-- Comparison footer table -->
  <text x="${W/2}" y="930" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="${DARK}" font-weight="700">Why line beats photo for Storey</text>

  <g transform="translate(80, 970)">
    ${[
      ['Consistency',  'Every site, every angle, every lighting = different.', 'Same symbol on every device, every site, forever.'],
      ['File size',    '~30–80 KB per thumb, downloaded over 4G.',             '~1–2 KB inline SVG, instant render.'],
      ['Brand fit',    'Whatever the user uploaded — off-brand colours.',      'Always terracotta + sand. Brand-coherent.'],
      ['Privacy',      'May contain people, faces, location clues.',           'Neutral. Nothing identifying.'],
      ['Abstract verbs', 'Cannot photograph "Allocate" or "Transfer".',        'Single icon does the job.'],
      ['Recognition',  'Half-literate user has to decode what the photo is.',  'Universally read symbol — instant.'],
    ].map((row, i) => {
      const y = i * 60;
      const [label, photoText, lineText] = row;
      return `
        <text x="0" y="${y+25}" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${DARK}" font-weight="700" letter-spacing="1">${label.toUpperCase()}</text>
        <text x="280" y="${y+25}" font-family="Calibri, Arial, sans-serif" font-size="15" fill="${RED}">${photoText}</text>
        <text x="1010" y="${y+25}" font-family="Calibri, Arial, sans-serif" font-size="15" fill="${GREEN}">${lineText}</text>
        <line x1="0" y1="${y+45}" x2="${W-160}" y2="${y+45}" stroke="${GRAY200}" stroke-width="1"/>
      `;
    }).join('')}
  </g>

  <text x="${W/2}" y="1450" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY800}" font-style="italic">
    Use photos only for real evidence (site visit, worker ID, delivery proof). Line illustrations everywhere else.
  </text>
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile('C:\\consne\\mockup-line-vs-photo.jpg');
  console.log('JPG written: C:\\consne\\mockup-line-vs-photo.jpg');
}

makeMockup().catch((e) => { console.error(e); process.exit(1); });
