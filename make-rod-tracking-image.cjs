// Generate a WhatsApp-shareable image for the rod-tracking problem.
// 1080x1920 (9:16), brand colours, problem-on-top / solution-on-bottom.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_HTML = path.join(__dirname, '_tmp-rod-image.html');
const OUT_JPG  = path.join(__dirname, 'storey-rod-tracking-problem.jpg');

const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1080px; height: 1920px; font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; }
  .wrap { width: 100%; height: 100%; display: flex; flex-direction: column; }

  /* PROBLEM half */
  .problem {
    flex: 0 0 38%;
    background: linear-gradient(160deg, #B85042 0%, #9A3F33 100%);
    color: #fff;
    padding: 50px 60px 40px;
    position: relative;
    overflow: hidden;
  }
  .tag {
    display: inline-block;
    background: rgba(255,255,255,0.18);
    color: #fff;
    padding: 8px 22px;
    border-radius: 24px;
    font-size: 22px;
    letter-spacing: 4px;
    font-weight: 700;
    margin-bottom: 30px;
  }
  .scene {
    display: flex;
    align-items: center;
    gap: 30px;
    margin-top: 18px;
  }
  .contractor-svg { flex: 0 0 200px; }
  .bubble {
    flex: 1;
    background: #fff;
    color: #2A1410;
    padding: 30px 34px;
    border-radius: 24px;
    position: relative;
    font-family: Georgia, serif;
    font-size: 38px;
    line-height: 1.35;
    box-shadow: 0 12px 30px rgba(0,0,0,0.25);
  }
  .bubble:before {
    content: '';
    position: absolute;
    left: -28px;
    top: 60px;
    width: 0; height: 0;
    border-top: 18px solid transparent;
    border-bottom: 18px solid transparent;
    border-right: 30px solid #fff;
  }
  .bubble b { color: #B85042; }
  .bubble .small { display: block; font-size: 26px; color: #6B5750; margin-top: 14px; font-style: italic; font-family: 'Calibri', sans-serif; }

  /* ARROW transition */
  .arrow-row {
    flex: 0 0 80px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .arrow-row .label {
    background: #2A1410;
    color: #fff;
    padding: 12px 32px;
    border-radius: 30px;
    font-size: 22px;
    letter-spacing: 4px;
    font-weight: 700;
  }

  /* SOLUTION half */
  .solution {
    flex: 1;
    background: #E7E8D1;
    color: #2A1410;
    padding: 50px 70px 50px;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .footer { margin-top: auto; }
  .tag-sol {
    align-self: flex-start;
    background: #2A1410;
    color: #E7E8D1;
    padding: 8px 22px;
    border-radius: 24px;
    font-size: 22px;
    letter-spacing: 4px;
    font-weight: 700;
    margin-bottom: 26px;
  }
  .sol-head {
    font-family: Georgia, serif;
    font-size: 50px;
    line-height: 1.1;
    color: #B85042;
    font-weight: 700;
    margin-bottom: 28px;
  }
  .steps { display: flex; flex-direction: column; gap: 18px; }
  .step {
    display: flex;
    align-items: center;
    gap: 22px;
    background: #fff;
    padding: 20px 26px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }
  .step .num {
    flex: 0 0 56px;
    height: 56px;
    background: #B85042;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Georgia, serif;
    font-size: 28px;
    font-weight: 700;
  }
  .step .txt {
    flex: 1;
    font-size: 26px;
    line-height: 1.3;
    color: #2A1410;
  }
  .step .txt b { color: #B85042; }
  .step .txt .small { display: block; font-size: 18px; color: #6B5750; margin-top: 4px; }

  .footer {
    margin-top: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 22px;
    border-top: 2px solid rgba(0,0,0,0.12);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand .name {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 38px;
    letter-spacing: 5px;
    color: #B85042;
    line-height: 1;
  }
  .brand .sub {
    font-size: 14px;
    letter-spacing: 2px;
    color: #6B5750;
    margin-top: 4px;
  }
  .contact {
    text-align: right;
    font-size: 18px;
    color: #2A1410;
    line-height: 1.45;
  }
  .contact b { color: #B85042; }
</style>
</head>
<body>

<div class="wrap">

  <!-- PROBLEM HALF -->
  <div class="problem">
    <span class="tag">THE PROBLEM</span>
    <div class="scene">
      <svg class="contractor-svg" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <!-- Hard hat -->
        <ellipse cx="100" cy="48" rx="55" ry="20" fill="#E7E8D1"/>
        <path d="M 50 50 Q 50 12 100 12 Q 150 12 150 50 Z" fill="#E7E8D1" stroke="#fff" stroke-width="2"/>
        <rect x="48" y="48" width="104" height="8" fill="#fff" rx="2"/>
        <!-- Face -->
        <circle cx="100" cy="92" r="32" fill="#D4A574"/>
        <!-- Eyes (thinking, looking up) -->
        <circle cx="88" cy="88" r="3" fill="#2A1410"/>
        <circle cx="112" cy="88" r="3" fill="#2A1410"/>
        <!-- Eyebrows raised (puzzled) -->
        <path d="M 80 80 Q 88 75 96 80" stroke="#2A1410" stroke-width="2.5" fill="none"/>
        <path d="M 104 80 Q 112 75 120 80" stroke="#2A1410" stroke-width="2.5" fill="none"/>
        <!-- Mouth (slight frown) -->
        <path d="M 90 108 Q 100 104 110 108" stroke="#2A1410" stroke-width="2.5" fill="none"/>
        <!-- Body / shirt -->
        <path d="M 60 130 L 60 240 L 140 240 L 140 130 Q 120 122 100 122 Q 80 122 60 130 Z" fill="#A7BEAE"/>
        <!-- Vest stripe -->
        <rect x="60" y="170" width="80" height="14" fill="#fff" opacity="0.5"/>
        <!-- Clipboard in hand -->
        <rect x="40" y="170" width="34" height="44" fill="#fff" stroke="#2A1410" stroke-width="2" rx="2"/>
        <line x1="44" y1="180" x2="70" y2="180" stroke="#2A1410" stroke-width="1.5"/>
        <line x1="44" y1="186" x2="68" y2="186" stroke="#2A1410" stroke-width="1.5"/>
        <line x1="44" y1="192" x2="70" y2="192" stroke="#2A1410" stroke-width="1.5"/>
        <line x1="44" y1="198" x2="64" y2="198" stroke="#2A1410" stroke-width="1.5"/>
        <!-- Thought dots -->
        <circle cx="158" cy="50" r="6" fill="#fff" opacity="0.85"/>
        <circle cx="172" cy="38" r="9" fill="#fff" opacity="0.9"/>
      </svg>
      <div class="bubble">
        Mera steel <b>tons</b> mein aata hai…<br/>
        par site pe mistry <b>pieces</b> mein issue karta hai.<br/>
        <span class="small">Har delivery pe physical count karna padta hai. Time waste, galti bhi hoti hai. Month-end pe stock register kabhi match nahi karta.</span>
      </div>
    </div>
  </div>

  <!-- TRANSITION -->
  <div class="arrow-row">
    <span class="label">↓  STOREY KA SOLUTION  ↓</span>
  </div>

  <!-- SOLUTION HALF -->
  <div class="solution">
    <span class="tag-sol">THE FIX</span>
    <div class="sol-head">Receive in tons.<br/>Issue in pieces.<br/>App tracks both.</div>

    <div class="steps">
      <div class="step">
        <div class="num">1</div>
        <div class="txt"><b>Supplier deliver karta hai</b> — record in tons / kg
          <span class="small">App auto-converts using IS 1786 standard weights (1 ton 12mm ≈ 94 pcs)</span>
        </div>
      </div>
      <div class="step">
        <div class="num">2</div>
        <div class="txt"><b>Mistry use karta hai</b> — record in pieces
          <span class="small">App deducts both pieces AND kg automatically</span>
        </div>
      </div>
      <div class="step">
        <div class="num">3</div>
        <div class="txt"><b>Hafte mein ek baar physical count</b> — app shows variance
          <span class="small">Variance &lt;5% = tolerance. &gt;5% = investigate (cuts, theft, miscount)</span>
        </div>
      </div>
      <div class="step">
        <div class="num">4</div>
        <div class="txt"><b>Month-end stock register ALWAYS matches</b>
          <span class="small">No more 2-hour reconciliation. No more guesswork.</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="brand">
        <svg width="56" height="56" viewBox="0 0 32 32">
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
        <b>Karun Roongta</b><br/>
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
const url = 'file:///' + OUT_HTML.replace(/\\/g, '/');
execSync(`"${chrome}" --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=1080,1920 --screenshot="${tmpPng}" "${url}"`, { stdio: 'inherit' });

// PNG → JPG via sharp (smaller, WhatsApp-friendly)
const sharp = require('sharp');
sharp(tmpPng).jpeg({ quality: 90 }).toFile(OUT_JPG).then(() => {
  fs.unlinkSync(tmpPng);
  fs.unlinkSync(OUT_HTML);
  const kb = Math.round(fs.statSync(OUT_JPG).size / 1024);
  console.log('Image created:', OUT_JPG, `(${kb} KB)`);
});
