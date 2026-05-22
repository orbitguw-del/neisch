// Storey — UX mockups: toast vs alert, empty states with CTA.
// Pure SVG → sharp pipeline. No browser dependency.
const path = require('path');
const { execSync } = require('child_process');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

// Brand colours per .claude/skills/marketing/SKILL.md
const TERRACOTTA = '#B85042';
const SAND       = '#E7E8D1';
const SAGE       = '#A7BEAE';
const DARK       = '#2A1410';
const RED        = '#DC2626';
const GREEN      = '#059669';
const GRAY100    = '#F3F4F6';
const GRAY200    = '#E5E7EB';
const GRAY400    = '#9CA3AF';
const GRAY600    = '#4B5563';
const GRAY800    = '#1F2937';
const BG         = '#F9FAFB';

// ─────────────────────────────────────────────────────────────────
// Mockup 1 — alert() vs toast
// ─────────────────────────────────────────────────────────────────
async function makeToastMockup() {
  const W = 1800, H = 1000;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Title -->
  <text x="${W/2}" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="${DARK}" font-weight="700">
    Error handling — current vs proposed
  </text>
  <text x="${W/2}" y="98" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY600}" font-style="italic">
    Same form, same error. Different UX.
  </text>

  <!-- LEFT: BEFORE label -->
  <rect x="60" y="135" width="160" height="40" rx="20" fill="${RED}"/>
  <text x="140" y="162" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="2">BEFORE</text>

  <!-- LEFT: phone mockup frame -->
  <rect x="60" y="200" width="800" height="720" rx="32" fill="white" stroke="${GRAY200}" stroke-width="2"/>

  <!-- Top bar -->
  <rect x="60" y="200" width="800" height="80" rx="32" fill="${TERRACOTTA}"/>
  <rect x="60" y="248" width="800" height="32" fill="${TERRACOTTA}"/>
  <text x="120" y="252" font-family="Arial Black, Arial, sans-serif" font-size="24" fill="white" font-weight="900" letter-spacing="4">STOREY</text>
  <text x="780" y="252" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="18" fill="white">Daily Log</text>

  <!-- Form, blurred under modal -->
  <g opacity="0.4">
    <text x="100" y="320" font-family="Georgia, serif" font-size="24" fill="${DARK}" font-weight="700">Daily Log — 20 May 2026</text>
    <text x="100" y="370" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY600}">Workers present</text>
    <rect x="100" y="385" width="660" height="50" rx="8" fill="white" stroke="${GRAY200}"/>
    <text x="120" y="418" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${DARK}">12</text>
    <text x="100" y="470" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY600}">Work done</text>
    <rect x="100" y="485" width="660" height="100" rx="8" fill="white" stroke="${GRAY200}"/>
    <text x="120" y="518" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${DARK}">Foundation pour, Block A</text>
    <rect x="100" y="620" width="120" height="44" rx="8" fill="${TERRACOTTA}"/>
    <text x="160" y="649" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="white" font-weight="700">Save</text>
  </g>

  <!-- Dim overlay -->
  <rect x="60" y="280" width="800" height="640" fill="black" opacity="0.4"/>

  <!-- BROWSER ALERT (centered) -->
  <rect x="180" y="500" width="560" height="200" rx="6" fill="#FAFAFA" stroke="${GRAY200}" stroke-width="1"/>
  <text x="200" y="545" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY600}">storeyinfra.com says:</text>
  <line x1="200" y1="560" x2="720" y2="560" stroke="${GRAY200}"/>
  <text x="200" y="608" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${DARK}" font-weight="600">Failed to save: Network error</text>
  <rect x="600" y="650" width="100" height="38" rx="4" fill="#1976D2"/>
  <text x="650" y="675" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="15" fill="white" font-weight="600">OK</text>

  <!-- Caption -->
  <text x="460" y="970" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${GRAY800}" font-style="italic">
    Blocks the page · Looks like a 1995 dialog · Contractor instinct: close it
  </text>

  <!-- RIGHT: AFTER label -->
  <rect x="940" y="135" width="160" height="40" rx="20" fill="${GREEN}"/>
  <text x="1020" y="162" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="2">AFTER</text>

  <!-- RIGHT: phone mockup frame -->
  <rect x="940" y="200" width="800" height="720" rx="32" fill="white" stroke="${GRAY200}" stroke-width="2"/>

  <!-- Top bar -->
  <rect x="940" y="200" width="800" height="80" rx="32" fill="${TERRACOTTA}"/>
  <rect x="940" y="248" width="800" height="32" fill="${TERRACOTTA}"/>
  <text x="1000" y="252" font-family="Arial Black, Arial, sans-serif" font-size="24" fill="white" font-weight="900" letter-spacing="4">STOREY</text>
  <text x="1660" y="252" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="18" fill="white">Daily Log</text>

  <!-- Form, fully interactive -->
  <text x="980" y="320" font-family="Georgia, serif" font-size="24" fill="${DARK}" font-weight="700">Daily Log — 20 May 2026</text>
  <text x="980" y="370" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY600}">Workers present</text>
  <rect x="980" y="385" width="660" height="50" rx="8" fill="white" stroke="${GRAY200}"/>
  <text x="1000" y="418" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${DARK}">12</text>
  <text x="980" y="470" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY600}">Work done</text>
  <rect x="980" y="485" width="660" height="100" rx="8" fill="white" stroke="${GRAY200}"/>
  <text x="1000" y="518" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${DARK}">Foundation pour, Block A</text>
  <rect x="980" y="620" width="120" height="44" rx="8" fill="${TERRACOTTA}"/>
  <text x="1040" y="649" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="white" font-weight="700">Save</text>

  <!-- TOAST (bottom-right) -->
  <rect x="1310" y="800" width="400" height="90" rx="12" fill="white" stroke="${GRAY200}" stroke-width="1.5"/>
  <rect x="1310" y="800" width="6" height="90" rx="3" fill="${RED}"/>
  <circle cx="1345" cy="845" r="14" fill="${RED}"/>
  <text x="1345" y="852" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="white" font-weight="900">!</text>
  <text x="1372" y="835" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${DARK}" font-weight="700">Couldn't save</text>
  <text x="1372" y="858" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY600}">Network slow. Try again in a moment.</text>
  <text x="1690" y="822" text-anchor="end" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY400}">✕</text>

  <!-- Caption -->
  <text x="1340" y="970" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${GRAY800}" font-style="italic">
    Form stays interactive · Auto-dismiss in 4s · Looks like a real app
  </text>
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile('C:\\consne\\mockup-toast.jpg');
  console.log('JPG written: C:\\consne\\mockup-toast.jpg');
}

// ─────────────────────────────────────────────────────────────────
// Mockup 2 — Empty state on Tasks page
// ─────────────────────────────────────────────────────────────────
async function makeEmptyStateMockup() {
  const W = 1800, H = 1000;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Title -->
  <text x="${W/2}" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="${DARK}" font-weight="700">
    Empty states — current vs proposed
  </text>
  <text x="${W/2}" y="98" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="20" fill="${GRAY600}" font-style="italic">
    Same Tasks page with zero tasks. Different outcomes.
  </text>

  <!-- LEFT: BEFORE label -->
  <rect x="60" y="135" width="160" height="40" rx="20" fill="${RED}"/>
  <text x="140" y="162" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="2">BEFORE</text>

  <!-- LEFT: page frame -->
  <rect x="60" y="200" width="800" height="720" rx="20" fill="white" stroke="${GRAY200}" stroke-width="2"/>

  <!-- Page header -->
  <text x="100" y="260" font-family="Georgia, serif" font-size="32" fill="${DARK}" font-weight="700">Tasks</text>
  <text x="100" y="294" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY600}">Assign work, track daily progress and confirm.</text>

  <!-- Toolbar -->
  <rect x="100" y="330" width="200" height="44" rx="8" fill="white" stroke="${GRAY200}"/>
  <text x="118" y="358" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${DARK}">All sites</text>
  <text x="280" y="358" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY400}">▾</text>

  <rect x="700" y="330" width="160" height="44" rx="8" fill="${TERRACOTTA}"/>
  <text x="780" y="358" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="white" font-weight="700">+ New Task</text>

  <!-- Vast emptiness -->
  <text x="460" y="640" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY400}" font-style="italic">
    (just blank white space)
  </text>

  <!-- Caption -->
  <text x="460" y="970" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${GRAY800}" font-style="italic">
    Supervisor thinks: "Is the app broken? Where do I tap?"
  </text>

  <!-- RIGHT: AFTER label -->
  <rect x="940" y="135" width="160" height="40" rx="20" fill="${GREEN}"/>
  <text x="1020" y="162" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="18" fill="white" font-weight="900" letter-spacing="2">AFTER</text>

  <!-- RIGHT: page frame -->
  <rect x="940" y="200" width="800" height="720" rx="20" fill="white" stroke="${GRAY200}" stroke-width="2"/>

  <!-- Page header -->
  <text x="980" y="260" font-family="Georgia, serif" font-size="32" fill="${DARK}" font-weight="700">Tasks</text>
  <text x="980" y="294" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${GRAY600}">Assign work, track daily progress and confirm.</text>

  <!-- Toolbar -->
  <rect x="980" y="330" width="200" height="44" rx="8" fill="white" stroke="${GRAY200}"/>
  <text x="998" y="358" font-family="Calibri, Arial, sans-serif" font-size="16" fill="${DARK}">All sites</text>
  <text x="1160" y="358" font-family="Calibri, Arial, sans-serif" font-size="14" fill="${GRAY400}">▾</text>

  <rect x="1580" y="330" width="160" height="44" rx="8" fill="${TERRACOTTA}"/>
  <text x="1660" y="358" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="16" fill="white" font-weight="700">+ New Task</text>

  <!-- Empty state card -->
  <rect x="1140" y="450" width="400" height="380" rx="20" fill="${SAND}"/>

  <!-- Icon circle -->
  <circle cx="1340" cy="540" r="44" fill="${SAGE}"/>
  <text x="1340" y="558" text-anchor="middle" font-family="Arial, sans-serif" font-size="42">📋</text>

  <!-- Title + body -->
  <text x="1340" y="640" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="${TERRACOTTA}" font-weight="700">No tasks yet.</text>
  <text x="1340" y="685" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="15" fill="${DARK}">Create your first task to assign work</text>
  <text x="1340" y="707" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="15" fill="${DARK}">to your team and track progress.</text>

  <!-- CTA button -->
  <rect x="1190" y="755" width="300" height="50" rx="10" fill="${TERRACOTTA}"/>
  <text x="1340" y="787" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="17" fill="white" font-weight="700">+ Create your first task</text>

  <!-- Caption -->
  <text x="1340" y="970" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="18" fill="${GRAY800}" font-style="italic">
    Supervisor knows exactly what to do next
  </text>
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile('C:\\consne\\mockup-empty.jpg');
  console.log('JPG written: C:\\consne\\mockup-empty.jpg');
}

(async () => { await makeToastMockup(); await makeEmptyStateMockup(); })()
  .catch((e) => { console.error(e); process.exit(1); });
