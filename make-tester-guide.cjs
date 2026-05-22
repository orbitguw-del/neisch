// Storey — tester onboarding visual guide (A4 portrait).
// Send to every new tester immediately after adding their Gmail to Play Console.
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const OUT_JPG = 'C:\\consne\\storey-tester-guide.jpg';
const OUT_PNG = 'C:\\consne\\storey-tester-guide.png';

const TERRACOTTA = '#B85042';
const SAND       = '#E7E8D1';
const SAGE       = '#A7BEAE';
const WHITE      = '#FFFFFF';
const DARK       = '#2A1410';
const GREEN      = '#059669';
const AMBER      = '#D97706';

const ICON = {
  link:      s => `<path d="M${s*0.3} ${s*0.5} L${s*0.7} ${s*0.5}"/><path d="M${s*0.3} ${s*0.5} L${s*0.2} ${s*0.4} L${s*0.2} ${s*0.6} Z" fill="${TERRACOTTA}"/><path d="M${s*0.7} ${s*0.5} L${s*0.8} ${s*0.4} L${s*0.8} ${s*0.6} Z" fill="${TERRACOTTA}"/>`,
  check:     s => `<circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.38}"/><path d="M${s*0.32} ${s*0.5} L${s*0.45} ${s*0.63} L${s*0.68} ${s*0.37}"/>`,
  download:  s => `<line x1="${s*0.5}" y1="${s*0.2}" x2="${s*0.5}" y2="${s*0.65}"/><path d="M${s*0.32} ${s*0.5} L${s*0.5} ${s*0.65} L${s*0.68} ${s*0.5}"/><line x1="${s*0.25}" y1="${s*0.8}" x2="${s*0.75}" y2="${s*0.8}"/>`,
  search:    s => `<circle cx="${s*0.42}" cy="${s*0.42}" r="${s*0.22}"/><line x1="${s*0.6}" y1="${s*0.6}" x2="${s*0.78}" y2="${s*0.78}"/>`,
  phone:     s => `<rect x="${s*0.3}" y="${s*0.15}" width="${s*0.4}" height="${s*0.7}" rx="${s*0.05}"/><line x1="${s*0.4}" y1="${s*0.78}" x2="${s*0.6}" y2="${s*0.78}"/>`,
  site:      s => `<path d="M${s*0.15} ${s*0.85} L${s*0.5} ${s*0.3} L${s*0.85} ${s*0.85} Z"/><line x1="${s*0.1}" y1="${s*0.85}" x2="${s*0.9}" y2="${s*0.85}"/>`,
  pencil:    s => `<path d="M${s*0.2} ${s*0.8} L${s*0.7} ${s*0.3} L${s*0.8} ${s*0.4} L${s*0.3} ${s*0.9} Z"/><line x1="${s*0.6}" y1="${s*0.4}" x2="${s*0.7}" y2="${s*0.5}"/>`,
  camera:    s => `<rect x="${s*0.12}" y="${s*0.3}" width="${s*0.76}" height="${s*0.5}" rx="4"/><circle cx="${s*0.5}" cy="${s*0.55}" r="${s*0.12}"/><rect x="${s*0.4}" y="${s*0.22}" width="${s*0.2}" height="${s*0.08}"/>`,
  wa:        s => `<circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.4}"/><path d="M${s*0.35} ${s*0.5} Q${s*0.35} ${s*0.65} ${s*0.5} ${s*0.65} Q${s*0.6} ${s*0.65} ${s*0.62} ${s*0.58} L${s*0.55} ${s*0.55} Q${s*0.5} ${s*0.6} ${s*0.45} ${s*0.55} Q${s*0.4} ${s*0.5} ${s*0.45} ${s*0.45} L${s*0.42} ${s*0.38} Q${s*0.35} ${s*0.4} ${s*0.35} ${s*0.5}"/>`,
};

function ic(name, cx, cy, size, color, sw = 4) {
  return `<g stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(${cx - size/2}, ${cy - size/2})">${ICON[name](size)}</g>`;
}

function logoSvg(x, y, size) {
  const u = size / 32;
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.18}" fill="${TERRACOTTA}"/>
    <rect x="${x + 5*u}"  y="${y + 18*u}" width="${6*u}" height="${9*u}"  rx="${u*0.6}" fill="${WHITE}"/>
    <rect x="${x + 13*u}" y="${y + 13*u}" width="${6*u}" height="${14*u}" rx="${u*0.6}" fill="${WHITE}"/>
    <rect x="${x + 21*u}" y="${y + 7*u}"  width="${6*u}" height="${20*u}" rx="${u*0.6}" fill="${WHITE}"/>
  `;
}

async function makeGuide() {
  const W = 2480, H = 3508;

  const installSteps = [
    ['link',     '1', 'Tap the link I sent you',          'Opens the Play Store opt-in page on your phone'],
    ['check',    '2', 'Tap "Become a tester"',            'Confirms you want to join the Storey beta'],
    ['search',   '3', 'Search "Storey" in Play Store',    'Wait 5–10 minutes if it doesn\'t show yet'],
    ['download', '4', 'Tap Install',                      '3 MB download · same as any Play Store app'],
  ];

  const firstUseSteps = [
    ['phone',  '5', 'Sign up with your mobile number', 'Enter the OTP we send via SMS'],
    ['site',   '6', 'Add your first site',             'Name, location, team assigned'],
    ['pencil', '7', 'File one daily log',              'Workers, work done, weather'],
    ['camera', '8', 'Add a photo',                     'Camera opens — date-time stamped automatically'],
  ];

  const cardX = 178;
  const cardW = W - 356;

  function renderStep(x, y, icon, num, title, desc, color, accentBg) {
    return `
      <!-- Numbered circle -->
      <circle cx="${x + 60}" cy="${y + 60}" r="56" fill="${color}"/>
      <text x="${x + 60}" y="${y + 80}" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="72" fill="${WHITE}" font-weight="900">${num}</text>

      <!-- Icon -->
      <circle cx="${x + 195}" cy="${y + 60}" r="48" fill="${accentBg}"/>
      ${ic(icon, x + 195, y + 60, 60, color, 5)}

      <!-- Text -->
      <text x="${x + 280}" y="${y + 50}" font-family="Georgia, serif" font-size="44" fill="${DARK}" font-weight="700">${title}</text>
      <text x="${x + 280}" y="${y + 95}" font-family="Calibri, Arial, sans-serif" font-size="32" fill="#4B5563">${desc}</text>
    `;
  }

  // Section 1: Install
  const installY = 760;
  const installH = 870;
  const installRowH = 180;

  // Section 2: First use
  const firstUseY = 1690;
  const firstUseH = 870;
  const firstUseRowH = 180;

  // CTA: WhatsApp help
  const helpY = 2620;
  const helpH = 460;

  const installSvg = installSteps.map(([icon, num, title, desc], i) => {
    const x = cardX + 50;
    const y = installY + 130 + i * installRowH;
    return renderStep(x, y, icon, num, title, desc, TERRACOTTA, SAND);
  }).join('\n');

  const firstUseSvg = firstUseSteps.map(([icon, num, title, desc], i) => {
    const x = cardX + 50;
    const y = firstUseY + 130 + i * firstUseRowH;
    return renderStep(x, y, icon, num, title, desc, AMBER, '#FEF3C7');
  }).join('\n');

  const dots = Array.from({ length: 6 }).map((_, i) =>
    `<circle cx="${190 + i * 60}" cy="${H - 50}" r="12" fill="${SAGE}"/>`).join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${TERRACOTTA}"/>

  <!-- ── Top band: logo + wordmark + site ─────────────────── -->
  <rect x="0" y="0" width="${W}" height="380" fill="${SAND}"/>
  ${logoSvg(540, 70, 240)}
  <text x="830" y="200" font-family="Impact, 'Arial Black', sans-serif" font-size="160" letter-spacing="32" fill="${TERRACOTTA}" font-weight="900">STOREY</text>
  <text x="830" y="285" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="50" letter-spacing="5" fill="${TERRACOTTA}">tester onboarding · 10 minutes</text>

  <!-- Hero -->
  <text x="178" y="540" font-family="Georgia, serif" font-size="120" fill="${WHITE}" font-weight="700">Welcome to the Storey beta.</text>
  <text x="178" y="660" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="44" fill="${SAND}">Two simple parts. ~10 minutes total. WhatsApp me if anything's stuck.</text>

  <!-- ── Section 1: GET INSTALLED ──────────────────────── -->
  <rect x="${cardX}" y="${installY}" width="${cardW}" height="${installH}" rx="36" fill="${SAND}"/>
  <text x="${cardX + 40}" y="${installY + 80}" font-family="Georgia, serif" font-size="62" fill="${TERRACOTTA}" font-weight="700">Get installed</text>
  <text x="${cardX + cardW - 40}" y="${installY + 80}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="30" fill="${DARK}">~ 3 minutes</text>
  ${installSvg}

  <!-- ── Section 2: FIRST USE ─────────────────────────── -->
  <rect x="${cardX}" y="${firstUseY}" width="${cardW}" height="${firstUseH}" rx="36" fill="${WHITE}"/>
  <text x="${cardX + 40}" y="${firstUseY + 80}" font-family="Georgia, serif" font-size="62" fill="${AMBER}" font-weight="700">First 5 minutes in the app</text>
  <text x="${cardX + cardW - 40}" y="${firstUseY + 80}" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="30" fill="${DARK}">~ 5 minutes</text>
  ${firstUseSvg}

  <!-- ── CTA: WhatsApp Karun ───────────────────────────── -->
  <rect x="${cardX}" y="${helpY}" width="${cardW}" height="${helpH}" rx="36" fill="${SAND}"/>
  <text x="${W/2}" y="${helpY + 90}" text-anchor="middle" font-family="Georgia, serif" font-size="60" fill="${TERRACOTTA}" font-weight="700">Stuck? WhatsApp me directly</text>

  <rect x="${cardX + 80}" y="${helpY + 130}" width="${cardW - 160}" height="160" rx="22" fill="${GREEN}"/>
  ${ic('wa', cardX + 165, helpY + 210, 80, WHITE, 7)}
  <text x="${cardX + 230}" y="${helpY + 195}" font-family="Calibri, Arial, sans-serif" font-size="36" fill="${WHITE}">Reply on the same WhatsApp chat</text>
  <text x="${cardX + 230}" y="${helpY + 255}" font-family="Georgia, serif" font-size="68" fill="${WHITE}" font-weight="700">+91 98640 66898</text>

  <text x="${W/2}" y="${helpY + 350}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="34" fill="${DARK}">Reply within 24 hours — usually within an hour.</text>
  <text x="${W/2}" y="${helpY + 395}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="32" fill="${DARK}">If something breaks, just tell me. Your feedback shapes v1.2.</text>

  <!-- Footer -->
  <text x="${W/2}" y="${H - 110}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="42" fill="${SAND}">Karun  ·  storeyinfra.com</text>

  ${dots}
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(OUT_JPG);
  await sharp(Buffer.from(svg)).png().toFile(OUT_PNG);
  console.log('JPG written:', OUT_JPG);
  console.log('PNG written:', OUT_PNG);
}

makeGuide().catch((e) => { console.error(e); process.exit(1); });
