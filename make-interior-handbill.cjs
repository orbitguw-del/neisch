// Storey handbill for Interior Designers (A5 portrait).
// V3 — WhatsApp-readable: BIG fonts, fewer cards, terser copy.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_HTML = path.join(__dirname, '_tmp-interior-handbill.html');
const OUT_JPG  = path.join(__dirname, 'storey-handbill-interior-designers.jpg');

const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1748px; height: 2480px; font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; color: #2A1410; }
  .page { width: 100%; height: 100%; display: flex; flex-direction: column; background: #fff; }

  /* TOP brand strip */
  .top {
    flex: 0 0 140px;
    background: #E7E8D1;
    display: flex; align-items: center; justify-content: center; gap: 22px;
  }
  .top svg { width: 70px; height: 70px; }
  .top .name {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 64px; letter-spacing: 16px; color: #B85042;
  }

  /* HERO */
  .hero {
    flex: 0 0 660px;
    background: linear-gradient(160deg, #B85042 0%, #9A3F33 100%);
    color: #fff;
    padding: 70px 90px 60px;
    position: relative;
    overflow: hidden;
  }
  .hero:before {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(135deg, transparent 0 60px, rgba(255,255,255,0.025) 60px 120px);
  }
  .hero .label {
    display: inline-block;
    background: rgba(255,255,255,0.20);
    padding: 16px 32px;
    border-radius: 36px;
    font-size: 32px;
    letter-spacing: 6px;
    font-weight: 700;
    margin-bottom: 36px;
  }
  .hero h1 {
    font-family: Georgia, 'Cambria', serif;
    font-size: 108px;
    line-height: 1.02;
    margin-bottom: 36px;
    font-weight: 700;
    letter-spacing: -2px;
  }
  .hero h1 em { font-style: normal; color: #E7E8D1; }
  .hero .sub {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 40px;
    line-height: 1.35;
    color: rgba(255,255,255,0.95);
  }

  /* NOW SECTION */
  .now {
    flex: 1;
    background: #FAF7F2;
    padding: 60px 90px 50px;
    display: flex;
    flex-direction: column;
  }
  .section-label {
    align-self: flex-start;
    background: #2A1410;
    color: #E7E8D1;
    padding: 14px 30px;
    border-radius: 32px;
    font-size: 30px;
    letter-spacing: 6px;
    font-weight: 700;
    margin-bottom: 26px;
  }
  .section-label.soon {
    background: #A7BEAE;
    color: #2A1410;
  }
  .section-title {
    font-family: Georgia, serif;
    font-size: 66px;
    color: #B85042;
    margin-bottom: 36px;
    font-weight: 700;
    line-height: 1.05;
  }
  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
  .feature {
    background: #fff;
    padding: 32px 36px;
    border-radius: 16px;
    border-left: 9px solid #B85042;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    gap: 26px;
  }
  .feature .dot {
    flex: 0 0 68px;
    height: 68px;
    background: #A7BEAE;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #2A1410;
    font-family: Georgia, serif;
    font-size: 36px;
    font-weight: 700;
  }
  .feature .body { flex: 1; }
  .feature .name {
    font-size: 40px;
    color: #B85042;
    font-weight: 700;
    margin-bottom: 6px;
    line-height: 1.1;
  }
  .feature .desc {
    font-size: 30px;
    line-height: 1.25;
    color: #4A3A30;
  }

  /* SOON SECTION */
  .soon-block {
    background: #E7E8D1;
    padding: 55px 90px 50px;
  }
  .soon-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 22px;
  }
  .soon-card {
    background: #fff;
    padding: 30px 32px;
    border-radius: 16px;
    border-top: 9px solid #A7BEAE;
    text-align: center;
  }
  .soon-card .dot {
    width: 60px;
    height: 60px;
    background: #E7E8D1;
    border: 3px solid #A7BEAE;
    border-radius: 50%;
    color: #2A1410;
    font-family: Georgia, serif;
    font-size: 30px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  .soon-card .name {
    font-size: 34px;
    color: #2A1410;
    font-weight: 700;
    margin-bottom: 10px;
    line-height: 1.1;
  }
  .soon-card .desc {
    font-size: 26px;
    line-height: 1.3;
    color: #4A3A30;
  }

  /* FOOTER */
  .footer {
    margin-top: auto;
    background: #2A1410;
    color: #E7E8D1;
    padding: 50px 90px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
  }
  .footer .left { flex: 1.3; }
  .footer .price {
    font-family: Georgia, serif;
    font-size: 42px;
    color: #fff;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.15;
  }
  .footer .price em { color: #A7BEAE; font-style: normal; }
  .footer .sub2 {
    font-size: 26px;
    color: rgba(231,232,209,0.85);
  }
  .footer .right { text-align: right; font-size: 30px; line-height: 1.4; }
  .footer .right b { color: #fff; font-size: 36px; display: block; margin-bottom: 4px; }
  .footer .right .url { color: #A7BEAE; font-weight: 700; }
</style>
</head>
<body>

<div class="page">

  <div class="top">
    <svg viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#B85042"/>
      <rect x="6"  y="18" width="6" height="9"  rx="1" fill="#fff"/>
      <rect x="13" y="13" width="6" height="14" rx="1" fill="#fff"/>
      <rect x="20" y="7"  width="6" height="20" rx="1" fill="#fff"/>
    </svg>
    <div class="name">STOREY</div>
  </div>

  <div class="hero">
    <span class="label">FOR INTERIOR DESIGNERS</span>
    <h1>Run 5 projects.<br/>Not 50 <em>WhatsApp</em><br/>groups.</h1>
    <p class="sub">One app for every site you run — built so your supervisors actually use it.</p>
  </div>

  <div class="now">
    <span class="section-label">AVAILABLE NOW</span>
    <div class="section-title">What you get today</div>
    <div class="feature-grid">
      <div class="feature">
        <div class="dot">1</div>
        <div class="body">
          <div class="name">Daily logs + photos</div>
          <div class="desc">See every site, every day.</div>
        </div>
      </div>
      <div class="feature">
        <div class="dot">2</div>
        <div class="body">
          <div class="name">Material tracking</div>
          <div class="desc">Every kg in. Every kg out.</div>
        </div>
      </div>
      <div class="feature">
        <div class="dot">3</div>
        <div class="body">
          <div class="name">Expense vs budget</div>
          <div class="desc">Catch overruns live.</div>
        </div>
      </div>
      <div class="feature">
        <div class="dot">4</div>
        <div class="body">
          <div class="name">Vendor management</div>
          <div class="desc">Carpenter, electrician, painter — all in one.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="soon-block">
    <span class="section-label soon">COMING SOON</span>
    <div class="section-title" style="color:#2A1410;">Being built next</div>
    <div class="soon-grid">
      <div class="soon-card">
        <div class="dot">5</div>
        <div class="name">Site documents</div>
        <div class="desc">Drawings, BOQs, contracts — one place.</div>
      </div>
      <div class="soon-card">
        <div class="dot">6</div>
        <div class="name">Vendor dossier</div>
        <div class="desc">Everything about each vendor in one screen.</div>
      </div>
      <div class="soon-card">
        <div class="dot">7</div>
        <div class="name">Client share link</div>
        <div class="desc">Live progress page for clients.</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="left">
      <div class="price">Free during launch beta</div>
      <div class="sub2">Per-site pricing later · 10-minute setup</div>
    </div>
    <div class="right">
      <b>Karun Roongta</b>
      WhatsApp +91 98640 66898<br/>
      <span class="url">storeyinfra.com</span>
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

const tmpPng = path.join(__dirname, '_tmp-interior-handbill.png');
const url = 'file:///' + OUT_HTML.replace(/\\/g, '/');
execSync(`"${chrome}" --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=1748,2480 --screenshot="${tmpPng}" "${url}"`, { stdio: 'inherit' });

const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));
sharp(tmpPng).jpeg({ quality: 92 }).toFile(OUT_JPG).then(() => {
  fs.unlinkSync(tmpPng);
  fs.unlinkSync(OUT_HTML);
  const kb = Math.round(fs.statSync(OUT_JPG).size / 1024);
  console.log('Handbill created:', OUT_JPG, `(${kb} KB)`);
});
