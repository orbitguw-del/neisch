// COURSING — Plate I
// Museum-quality print: English-bond brick coursing as field composition.
// Subtle reference: the rhythm any mason recognises at a glance.

const fs   = require('fs');
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const OUT     = path.join(__dirname, 'COURSING-plate-i.png');
const OUT_PDF = path.join(__dirname, 'COURSING-plate-i.pdf');
const { execSync } = require('child_process');

// ── canvas ────────────────────────────────────────────────────────────────
const W = 1500, H = 2100;

// ── palette ───────────────────────────────────────────────────────────────
const GROUND = '#ECE4D2';            // warmer rag-paper cream, slightly dustier
const INK    = '#2A1B14';            // burnt-bistre ink, near-black
const SOFT   = '#8C7868';            // weathered grey for sub-text
// Tight, related terracotta palette — five hues only, all in the same kiln family
const TERRA  = ['#A2402F','#A94735','#B0492F','#9D3F2C','#AC4632'];
const STEEL  = '#445A6B';            // mill-blue, mute / accent — slightly deeper for presence

// ── field geometry ────────────────────────────────────────────────────────
const FX = 150, FY = 380;           // field origin (top-left)
const FW = W - 2 * FX;              // field width 1200
const FH = 1500;                    // field height
const M  = 5;                       // mortar gap (px)
const BH = 55;                      // brick height
const STRETCH_N = 6;                // stretchers per course
const STRETCH_W = (FW - (STRETCH_N - 1) * M) / STRETCH_N;     // = ~199.17
const HEADER_W  = (STRETCH_W - M) / 2;                        // header is half a stretcher (less the mortar joint)
const HEADER_N  = STRETCH_N * 2;                              // = 12 headers per course
const ROW_PITCH = BH + M;
const COURSES   = Math.floor(FH / ROW_PITCH);                 // ~26

// ── deviation set: a sparse hand-placed deviation, NOT random ────────────
//   format: { row, col, type: 'stretcher' | 'header' }
// Three deviations — a quiet triangle across the field.
// Each placed against the field's invisible armature, not random.
// Odd rows = header courses (small bricks), even rows = stretcher courses (long bricks)
const DEVIATIONS = [
  { row: 3,  col: 2,  type: 'header'    },    // upper-left, small
  { row: 11, col: 8,  type: 'header'    },    // mid-right, small
  { row: 20, col: 3,  type: 'stretcher' },    // lower-left, long — anchors the bottom
];

const isDeviation = (row, col, type) =>
  DEVIATIONS.some(d => d.row === row && d.col === col && d.type === type);

// Deterministic per-brick colour variation — reproducible, not random per run
const hashPick = (row, col, type) => {
  const h = (row * 131 + col * 17 + (type === 'header' ? 7 : 3)) % TERRA.length;
  return TERRA[h];
};
const hashOpacity = (row, col) => {
  const v = ((row * 53 + col * 29) % 7) / 100;  // 0.00–0.06
  return (0.96 - v).toFixed(3);
};

// ── build brick rects ─────────────────────────────────────────────────────
let bricks = '';
for (let row = 0; row < COURSES; row++) {
  const y = FY + row * ROW_PITCH;
  const isHeader = row % 2 === 1;   // courses alternate stretcher / header
  if (isHeader) {
    for (let col = 0; col < HEADER_N; col++) {
      const x = FX + col * (HEADER_W + M);
      const fill = isDeviation(row, col, 'header') ? STEEL : hashPick(row, col, 'header');
      const op   = isDeviation(row, col, 'header') ? '0.95' : hashOpacity(row, col);
      bricks += `<rect x="${x.toFixed(2)}" y="${y}" width="${HEADER_W.toFixed(2)}" height="${BH}" fill="${fill}" fill-opacity="${op}"/>`;
    }
  } else {
    // Stretcher course — all stretchers aligned. The visual offset in
    // English bond comes from the headers between them, not from shifting
    // the stretcher courses themselves.
    for (let col = 0; col < STRETCH_N; col++) {
      const x = FX + col * (STRETCH_W + M);
      const fill = isDeviation(row, col, 'stretcher') ? STEEL : hashPick(row, col, 'stretcher');
      const op   = isDeviation(row, col, 'stretcher') ? '0.95' : hashOpacity(row, col);
      bricks += `<rect x="${x.toFixed(2)}" y="${y}" width="${STRETCH_W.toFixed(2)}" height="${BH}" fill="${fill}" fill-opacity="${op}"/>`;
    }
  }
}

// ── compose SVG ───────────────────────────────────────────────────────────
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">

  <!-- paper ground -->
  <rect width="${W}" height="${H}" fill="${GROUND}"/>

  <!-- field clip so half-offset stretchers don't escape the margin -->
  <defs>
    <clipPath id="field-clip">
      <rect x="${FX}" y="${FY}" width="${FW}" height="${COURSES * ROW_PITCH - M}"/>
    </clipPath>
  </defs>

  <!-- corner: serial, top-left -->
  <text x="${FX}" y="220"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="11" letter-spacing="3" fill="${SOFT}">№ 001 / I</text>

  <!-- corner: title block, top-right -->
  <text x="${W - FX}" y="200"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-weight="500"
        font-size="13" letter-spacing="6" fill="${INK}" text-anchor="end">COURSING</text>
  <text x="${W - FX}" y="220"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="10" letter-spacing="3" fill="${SOFT}" text-anchor="end">PLATE I · MMXXVI</text>

  <!-- thin string-line above field -->
  <line x1="${FX}" y1="320" x2="${W - FX}" y2="320"
        stroke="${INK}" stroke-width="0.4"/>

  <!-- THE FIELD: English-bond coursing -->
  <g clip-path="url(#field-clip)">${bricks}</g>

  <!-- thin string-line below field -->
  <line x1="${FX}" y1="${FY + COURSES * ROW_PITCH + 18}"
        x2="${W - FX}" y2="${FY + COURSES * ROW_PITCH + 18}"
        stroke="${INK}" stroke-width="0.4"/>

  <!-- bottom block: footnote + clinical reference -->
  <text x="${FX}" y="${FY + COURSES * ROW_PITCH + 70}"
        font-family="Georgia, 'Times New Roman', serif"
        font-style="italic" font-size="16" fill="${INK}">
    The deviation is the signal.
  </text>

  <text x="${W - FX}" y="${FY + COURSES * ROW_PITCH + 64}"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="10" letter-spacing="3" fill="${SOFT}" text-anchor="end">
    ENGLISH BOND · IS 1077
  </text>
  <text x="${W - FX}" y="${FY + COURSES * ROW_PITCH + 80}"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="9"  letter-spacing="2" fill="${SOFT}" text-anchor="end">
    fig. 1 of 1
  </text>

  <!-- thinnest hairline at very bottom: the page edge -->
  <line x1="${FX}" y1="${H - 90}" x2="${W - FX}" y2="${H - 90}"
        stroke="${SOFT}" stroke-width="0.3" stroke-opacity="0.5"/>

  <text x="${W / 2}" y="${H - 60}"
        font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-size="9" letter-spacing="4" fill="${SOFT}" text-anchor="middle">
    A STUDY IN ACCUMULATED PATIENCE
  </text>

</svg>`;

// ── render PNG (raster, for screen / web) ─────────────────────────────────
sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(OUT)
  .then(() => {
    const kb = Math.round(fs.statSync(OUT).size / 1024);
    console.log('PNG  created:', OUT, `(${kb} KB, ${W}×${H})`);

    // ── render PDF (vector, for print at any size up to A2 / A1) ─────────
    const htmlPath = path.join(__dirname, '_tmp-coursing.html');
    const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  @page { size: ${W / 150}in ${H / 150}in; margin: 0; }
  html, body { margin: 0; padding: 0; background: ${GROUND}; }
  svg { display: block; width: 100%; height: 100%; }
</style></head><body>${svg}</body></html>`;
    fs.writeFileSync(htmlPath, html, 'utf8');

    const chromePaths = [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
    ];
    const chrome = chromePaths.find(p => p && fs.existsSync(p));
    if (!chrome) { console.error('Chrome not found — PDF skipped.'); return; }

    const url = 'file:///' + htmlPath.replace(/\\/g, '/');
    execSync(`"${chrome}" --headless --disable-gpu --no-sandbox --print-to-pdf="${OUT_PDF}" --print-to-pdf-no-header "${url}"`, { stdio: 'pipe' });
    fs.unlinkSync(htmlPath);

    const pdfKb = Math.round(fs.statSync(OUT_PDF).size / 1024);
    console.log('PDF  created:', OUT_PDF, `(${pdfKb} KB, vector — print up to A2)`);
  });
