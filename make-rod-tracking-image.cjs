// Storey — Rod tracking WhatsApp asset (problem validation).
// Outputs portrait JPG (1080x1920) + editable PPTX (9:16).
// Brand: terracotta #B85042 dominant, sand #E7E8D1, sage #A7BEAE accent.

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_HTML = path.join(__dirname, '_tmp-rod-image.html');
const OUT_JPG  = path.join(__dirname, 'storey-rod-tracking-problem.jpg');
const OUT_PPTX = path.join(__dirname, 'storey-rod-tracking-problem.pptx');

// ─── HTML → JPG (the shareable asset) ────────────────────────────────────────

const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1080px; height: 1920px; font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; }
  .canvas { width: 100%; height: 100%; display: flex; flex-direction: column; }

  /* ── TOP: PROBLEM (terracotta dominant) ─────────────────────────── */
  .problem {
    flex: 0 0 870px;
    background: linear-gradient(160deg, #B85042 0%, #9A3F33 100%);
    color: #fff;
    padding: 60px 70px 50px;
    position: relative;
    overflow: hidden;
  }
  /* faint diagonal stripes for depth */
  .problem:before {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(135deg, transparent 0 40px, rgba(255,255,255,0.025) 40px 80px);
    pointer-events: none;
  }
  .pill {
    display: inline-block;
    background: #E7E8D1;
    color: #B85042;
    padding: 9px 22px;
    border-radius: 24px;
    font-size: 19px;
    letter-spacing: 5px;
    font-weight: 700;
  }
  .problem h1 {
    font-family: Georgia, 'Cambria', serif;
    font-size: 76px;
    line-height: 1.08;
    margin: 38px 0 36px;
    color: #fff;
    font-weight: 700;
    letter-spacing: -1px;
  }
  .problem h1 em { font-style: normal; color: #E7E8D1; }

  /* Visceral conversion card — fills the empty space + makes the problem visible */
  .conv {
    background: #E7E8D1;
    color: #2A1410;
    padding: 32px 36px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 12px 30px rgba(0,0,0,0.22);
    margin-bottom: 26px;
  }
  .conv .side { text-align: center; flex: 1; }
  .conv .num {
    font-family: Georgia, serif;
    font-size: 68px;
    font-weight: 700;
    color: #B85042;
    line-height: 1;
  }
  .conv .lbl {
    font-size: 17px;
    letter-spacing: 2px;
    font-weight: 700;
    color: #6B5750;
    margin-top: 6px;
    text-transform: uppercase;
  }
  .conv .arrow {
    flex: 0 0 70px;
    text-align: center;
    color: #B85042;
    font-size: 50px;
    font-weight: 300;
    line-height: 1;
  }

  .problem .sub {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 28px;
    line-height: 1.4;
    color: rgba(255,255,255,0.92);
    max-width: 880px;
  }

  /* ── DIVIDER STRIP ──────────────────────────────────────────────── */
  .divider {
    flex: 0 0 70px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .divider .chip {
    background: #2A1410;
    color: #fff;
    padding: 11px 30px;
    border-radius: 26px;
    font-size: 20px;
    letter-spacing: 4px;
    font-weight: 700;
  }

  /* ── BOTTOM: SOLUTION (sand) ────────────────────────────────────── */
  .solution {
    flex: 1;
    background: #E7E8D1;
    padding: 56px 70px 50px;
    display: flex;
    flex-direction: column;
  }
  .pill-dark {
    align-self: flex-start;
    background: #2A1410;
    color: #E7E8D1;
    padding: 9px 22px;
    border-radius: 24px;
    font-size: 19px;
    letter-spacing: 5px;
    font-weight: 700;
  }
  .solution h2 {
    font-family: Georgia, 'Cambria', serif;
    font-size: 56px;
    line-height: 1.06;
    color: #B85042;
    font-weight: 700;
    margin: 24px 0 32px;
    letter-spacing: -0.5px;
  }
  .steps { display: flex; flex-direction: column; gap: 16px; }
  .step {
    display: flex;
    align-items: center;
    gap: 24px;
    background: #fff;
    padding: 22px 28px;
    border-radius: 14px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.07);
  }
  /* SAGE numbered circle — per brand motif */
  .step .num {
    flex: 0 0 60px;
    height: 60px;
    background: #A7BEAE;
    color: #2A1410;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Georgia, serif;
    font-size: 30px;
    font-weight: 700;
  }
  .step .txt {
    flex: 1;
    font-size: 24px;
    line-height: 1.3;
    color: #2A1410;
  }
  .step .txt b { color: #B85042; font-weight: 700; }
  .step .txt .small {
    display: block;
    font-size: 17px;
    color: #6B5750;
    margin-top: 5px;
    line-height: 1.4;
  }

  /* ── FOOTER ─────────────────────────────────────────────────────── */
  .footer {
    margin-top: auto;
    padding-top: 26px;
    border-top: 1.5px solid rgba(0,0,0,0.10);
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand .mark { width: 52px; height: 52px; }
  .brand .name {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 36px;
    letter-spacing: 6px;
    color: #B85042;
    line-height: 1;
  }
  .brand .sub {
    font-size: 13px;
    letter-spacing: 2px;
    color: #6B5750;
    margin-top: 4px;
    font-weight: 600;
  }
  .contact {
    text-align: right;
    font-size: 17px;
    color: #2A1410;
    line-height: 1.55;
  }
  .contact .nm { color: #B85042; font-weight: 700; font-size: 18px; }
</style>
</head>
<body>

<div class="canvas">

  <!-- PROBLEM ─────────────────────────────────────────────────────── -->
  <div class="problem">
    <span class="pill">THE PROBLEM</span>
    <h1>Steel comes in <em>tons</em>.<br/>Mistry issues in <em>pieces</em>.</h1>

    <div class="conv">
      <div class="side">
        <div class="num">1 TON</div>
        <div class="lbl">supplier bill</div>
      </div>
      <div class="arrow">≈</div>
      <div class="side">
        <div class="num">94 pcs</div>
        <div class="lbl">on site (12mm)</div>
      </div>
      <div class="arrow">=</div>
      <div class="side">
        <div class="num">?</div>
        <div class="lbl">your stock</div>
      </div>
    </div>

    <p class="sub">Har delivery pe physical count. Time waste, galti bhi hoti hai. Month-end pe register kabhi match nahi karta.</p>
  </div>

  <!-- DIVIDER ─────────────────────────────────────────────────────── -->
  <div class="divider">
    <span class="chip">↓  STOREY KA ANSWER  ↓</span>
  </div>

  <!-- SOLUTION ────────────────────────────────────────────────────── -->
  <div class="solution">
    <span class="pill-dark">THE FIX</span>
    <h2>Receive in tons.<br/>Issue in pieces.<br/>App tracks both.</h2>

    <div class="steps">
      <div class="step">
        <div class="num">1</div>
        <div class="txt"><b>Supplier delivers</b> — record in tons or kg.
          <span class="small">App auto-converts using IS 1786 standard weights (1 ton 12mm ≈ 94 pcs).</span>
        </div>
      </div>
      <div class="step">
        <div class="num">2</div>
        <div class="txt"><b>Mistry issues on site</b> — record in pieces.
          <span class="small">App deducts both pieces AND kg automatically.</span>
        </div>
      </div>
      <div class="step">
        <div class="num">3</div>
        <div class="txt"><b>Weekly physical count</b> — app shows variance.
          <span class="small">Under 5% = normal. Above 5% = investigate (cuts, theft, miscount).</span>
        </div>
      </div>
      <div class="step">
        <div class="num">4</div>
        <div class="txt"><b>Month-end register always matches.</b>
          <span class="small">No more two-hour reconciliation. No more guesswork.</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="brand">
        <svg class="mark" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="7" fill="#B85042"/>
          <rect x="6"  y="18" width="6" height="9"  rx="1" fill="#fff"/>
          <rect x="13" y="13" width="6" height="14" rx="1" fill="#fff"/>
          <rect x="20" y="7"  width="6" height="20" rx="1" fill="#fff"/>
        </svg>
        <div>
          <div class="name">STOREY</div>
          <div class="sub">SITE OPERATIONS · GUWAHATI</div>
        </div>
      </div>
      <div class="contact">
        <div class="nm">Karun Roongta</div>
        WhatsApp +91 98640 66898<br/>
        storeyinfra.com
      </div>
    </div>
  </div>

</div>
</body></html>`;

fs.writeFileSync(OUT_HTML, html, 'utf8');

const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
];
const chrome = chromePaths.find(p => p && fs.existsSync(p));
if (!chrome) { console.error('Chrome not found.'); process.exit(1); }

const tmpPng = path.join(__dirname, '_tmp-rod-image.png');
const url    = 'file:///' + OUT_HTML.replace(/\\/g, '/');
execSync(`"${chrome}" --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=1080,1920 --screenshot="${tmpPng}" "${url}"`, { stdio: 'inherit' });

const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

async function makePptx() {
  const pptxgenPath = execSync('npm root -g', { encoding: 'utf8' }).trim();
  const PptxGenJS = require(path.join(pptxgenPath, 'pptxgenjs'));

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'WA916', width: 5.625, height: 10 });
  pptx.layout = 'WA916';
  pptx.title  = 'Storey — Rod tracking problem';

  const TERRA = 'B85042', SAND = 'E7E8D1', SAGE = 'A7BEAE', WHITE = 'FFFFFF', DARK = '2A1410', GREY = '6B5750';
  const s = pptx.addSlide();
  s.background = { color: TERRA };

  // ── PROBLEM block (top ~45%) ────────────────────────────────────────
  s.addText('THE PROBLEM', {
    x: 0.4, y: 0.35, w: 1.8, h: 0.32,
    fontFace: 'Calibri', fontSize: 11, bold: true, color: TERRA,
    fill: { color: SAND }, align: 'center', valign: 'middle',
    charSpacing: 5, rectRadius: 0.12,
  });
  s.addText([
    { text: 'Steel comes in ', options: { fontFace: 'Georgia', fontSize: 36, color: WHITE, bold: true } },
    { text: 'tons',             options: { fontFace: 'Georgia', fontSize: 36, color: SAND, bold: true } },
    { text: '.\nMistry issues in ', options: { fontFace: 'Georgia', fontSize: 36, color: WHITE, bold: true, breakLine: false } },
    { text: 'pieces',           options: { fontFace: 'Georgia', fontSize: 36, color: SAND, bold: true } },
    { text: '.',                options: { fontFace: 'Georgia', fontSize: 36, color: WHITE, bold: true } },
  ], { x: 0.4, y: 0.85, w: 4.85, h: 1.4, valign: 'top' });

  // Conversion card
  s.addShape('roundRect', { x: 0.4, y: 2.4, w: 4.85, h: 1.0, fill: { color: SAND }, line: { color: SAND }, rectRadius: 0.1 });
  const colW = 1.45, gap = 0.15;
  ['1 TON', '94 pcs', '?'].forEach((num, i) => {
    const x = 0.45 + i * (colW + gap);
    s.addText(num, { x, y: 2.5, w: colW, h: 0.55, fontFace: 'Georgia', fontSize: 32, bold: true, color: TERRA, align: 'center' });
  });
  ['supplier bill', 'on site (12mm)', 'your stock'].forEach((lbl, i) => {
    const x = 0.45 + i * (colW + gap);
    s.addText(lbl.toUpperCase(), { x, y: 3.02, w: colW, h: 0.32, fontFace: 'Calibri', fontSize: 9, color: GREY, align: 'center', charSpacing: 2, bold: true });
  });

  s.addText('Har delivery pe physical count. Time waste, galti bhi hoti hai.\nMonth-end pe register kabhi match nahi karta.', {
    x: 0.4, y: 3.6, w: 4.85, h: 0.7,
    fontFace: 'Georgia', italic: true, fontSize: 14, color: SAND, valign: 'top',
  });

  // ── DIVIDER ─────────────────────────────────────────────────────────
  s.addShape('rect', { x: 0, y: 4.45, w: 5.625, h: 0.35, fill: { color: WHITE }, line: { color: WHITE } });
  s.addText('↓  STOREY KA ANSWER  ↓', {
    x: 1.5, y: 4.51, w: 2.625, h: 0.23,
    fontFace: 'Calibri', fontSize: 10, bold: true, color: WHITE,
    fill: { color: DARK }, align: 'center', valign: 'middle',
    charSpacing: 4, rectRadius: 0.1,
  });

  // ── SOLUTION ────────────────────────────────────────────────────────
  s.addShape('rect', { x: 0, y: 4.8, w: 5.625, h: 5.2, fill: { color: SAND }, line: { color: SAND } });

  s.addText('THE FIX', {
    x: 0.4, y: 4.95, w: 1.0, h: 0.3,
    fontFace: 'Calibri', fontSize: 10, bold: true, color: SAND,
    fill: { color: DARK }, align: 'center', valign: 'middle',
    charSpacing: 5, rectRadius: 0.1,
  });
  s.addText('Receive in tons.\nIssue in pieces.\nApp tracks both.', {
    x: 0.4, y: 5.4, w: 4.85, h: 1.45,
    fontFace: 'Georgia', fontSize: 26, bold: true, color: TERRA, valign: 'top',
  });

  // 4 step cards
  const steps = [
    { t: 'Supplier delivers', d: 'record in tons or kg. App auto-converts using IS 1786 (1 ton 12mm ≈ 94 pcs).' },
    { t: 'Mistry issues on site', d: 'record in pieces. App deducts both pieces and kg automatically.' },
    { t: 'Weekly physical count', d: 'app shows variance. Under 5% = normal. Above = investigate.' },
    { t: 'Month-end register matches', d: 'no two-hour reconciliation. No guesswork.' },
  ];
  const stepH = 0.6, stepGap = 0.12, stepY0 = 6.95;
  steps.forEach((st, i) => {
    const y = stepY0 + i * (stepH + stepGap);
    s.addShape('roundRect', { x: 0.4, y, w: 4.85, h: stepH, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.07 });
    // sage circle
    s.addShape('ellipse', { x: 0.5, y: y + 0.13, w: 0.34, h: 0.34, fill: { color: SAGE }, line: { color: SAGE } });
    s.addText(String(i + 1), { x: 0.5, y: y + 0.13, w: 0.34, h: 0.34, fontFace: 'Georgia', fontSize: 16, bold: true, color: DARK, align: 'center', valign: 'middle' });
    s.addText([
      { text: st.t + ' — ', options: { fontFace: 'Calibri', fontSize: 12, bold: true, color: TERRA } },
      { text: st.d,         options: { fontFace: 'Calibri', fontSize: 11, color: DARK } },
    ], { x: 0.95, y: y + 0.08, w: 4.2, h: 0.45, valign: 'middle' });
  });

  // Footer
  s.addShape('line', { x: 0.4, y: 9.45, w: 4.85, h: 0, line: { color: GREY, width: 0.5 } });
  s.addShape('roundRect', { x: 0.4, y: 9.6, w: 0.35, h: 0.35, fill: { color: TERRA }, line: { color: TERRA }, rectRadius: 0.06 });
  s.addText('STOREY', { x: 0.85, y: 9.6, w: 2.0, h: 0.22, fontFace: 'Impact', fontSize: 18, color: TERRA, charSpacing: 5, bold: true });
  s.addText('SITE OPERATIONS · GUWAHATI', { x: 0.85, y: 9.8, w: 2.5, h: 0.18, fontFace: 'Calibri', fontSize: 7, color: GREY, charSpacing: 2, bold: true });
  s.addText([
    { text: 'Karun Roongta\n', options: { color: TERRA, bold: true, fontSize: 11 } },
    { text: 'WhatsApp +91 98640 66898\nstoreyinfra.com', options: { color: DARK, fontSize: 10 } },
  ], { x: 3.0, y: 9.55, w: 2.25, h: 0.45, fontFace: 'Calibri', align: 'right', valign: 'top' });

  await pptx.writeFile({ fileName: OUT_PPTX });
}

(async () => {
  await sharp(tmpPng).jpeg({ quality: 92 }).toFile(OUT_JPG);
  fs.unlinkSync(tmpPng);
  fs.unlinkSync(OUT_HTML);
  const jpgKb = Math.round(fs.statSync(OUT_JPG).size / 1024);
  console.log('JPG  created:', OUT_JPG, `(${jpgKb} KB)`);

  await makePptx();
  const pptxKb = Math.round(fs.statSync(OUT_PPTX).size / 1024);
  console.log('PPTX created:', OUT_PPTX, `(${pptxKb} KB)`);
})();
