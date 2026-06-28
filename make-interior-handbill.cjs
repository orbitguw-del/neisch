// Storey handbill for Interior Designers (A5 portrait).
// Shows V1 (Available now) + V2 (Coming soon) clearly separated.
// Brand: terracotta dominant, sand cards, sage accent dots, white CTA.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUT_HTML = path.join(__dirname, '_tmp-interior-handbill.html');
const OUT_JPG  = path.join(__dirname, 'storey-handbill-interior-designers.jpg');

// A5 portrait at 300dpi = 1748 × 2480
const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1748px; height: 2480px; font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; color: #2A1410; }
  .page { width: 100%; height: 100%; display: flex; flex-direction: column; background: #fff; }

  /* TOP brand strip */
  .top {
    flex: 0 0 110px;
    background: #E7E8D1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
  }
  .top svg { width: 50px; height: 50px; }
  .top .name {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 44px;
    letter-spacing: 12px;
    color: #B85042;
  }

  /* HERO */
  .hero {
    flex: 0 0 580px;
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
    pointer-events: none;
  }
  .hero .label {
    display: inline-block;
    background: rgba(255,255,255,0.18);
    padding: 12px 26px;
    border-radius: 28px;
    font-size: 24px;
    letter-spacing: 5px;
    font-weight: 700;
    margin-bottom: 30px;
  }
  .hero h1 {
    font-family: Georgia, 'Cambria', serif;
    font-size: 84px;
    line-height: 1.05;
    margin-bottom: 30px;
    font-weight: 700;
    letter-spacing: -1px;
  }
  .hero h1 em { font-style: normal; color: #E7E8D1; }
  .hero .sub {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 32px;
    line-height: 1.42;
    color: rgba(255,255,255,0.92);
    max-width: 1500px;
  }

  /* WHAT YOU GET — Available now */
  .now {
    background: #FAF7F2;
    padding: 70px 90px 60px;
  }
  .section-label {
    display: inline-block;
    background: #2A1410;
    color: #E7E8D1;
    padding: 12px 26px;
    border-radius: 28px;
    font-size: 24px;
    letter-spacing: 5px;
    font-weight: 700;
    margin-bottom: 26px;
  }
  .section-label.soon {
    background: #A7BEAE;
    color: #2A1410;
  }
  .section-title {
    font-family: Georgia, serif;
    font-size: 52px;
    color: #B85042;
    margin-bottom: 34px;
    font-weight: 700;
    line-height: 1.1;
  }
  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }
  .feature {
    background: #fff;
    padding: 28px 32px;
    border-radius: 14px;
    border-left: 7px solid #B85042;
    box-shadow: 0 3px 12px rgba(0,0,0,0.05);
    display: flex;
    align-items: flex-start;
    gap: 22px;
  }
  .feature .dot {
    flex: 0 0 48px;
    height: 48px;
    background: #A7BEAE;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2A1410;
    font-family: Georgia, serif;
    font-size: 24px;
    font-weight: 700;
    margin-top: 2px;
  }
  .feature .body { flex: 1; }
  .feature .name {
    font-size: 30px;
    color: #B85042;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.15;
  }
  .feature .desc {
    font-size: 22px;
    line-height: 1.4;
    color: #4A3A30;
  }

  /* COMING SOON */
  .soon-block {
    background: #E7E8D1;
    padding: 60px 90px 50px;
  }
  .soon-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }
  .soon-card {
    background: #fff;
    padding: 26px 30px;
    border-radius: 14px;
    border-left: 7px solid #A7BEAE;
    display: flex;
    align-items: flex-start;
    gap: 22px;
  }
  .soon-card .dot {
    flex: 0 0 48px;
    height: 48px;
    background: #E7E8D1;
    border: 2px solid #A7BEAE;
    border-radius: 50%;
    color: #2A1410;
    font-family: Georgia, serif;
    font-size: 22px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .soon-card .name {
    font-size: 28px;
    color: #2A1410;
    font-weight: 700;
    margin-bottom: 7px;
    line-height: 1.15;
  }
  .soon-card .desc {
    font-size: 21px;
    line-height: 1.4;
    color: #4A3A30;
  }

  /* WHY US */
  .why {
    flex: 1;
    background: #FAF7F2;
    padding: 50px 90px 50px;
    border-top: 1px solid #E0DBCF;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .why h2 {
    font-family: Georgia, serif;
    font-size: 40px;
    color: #B85042;
    margin-bottom: 26px;
    font-weight: 700;
  }
  .why ul {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    list-style: none;
  }
  .why li {
    background: #fff;
    padding: 24px 28px;
    border-radius: 12px;
    font-size: 22px;
    line-height: 1.45;
    color: #2A1410;
  }
  .why li b { color: #B85042; display: block; margin-bottom: 8px; font-size: 26px; }

  /* FOOTER */
  .footer {
    background: #2A1410;
    color: #E7E8D1;
    padding: 40px 90px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .footer .left { flex: 1; }
  .footer .price {
    font-family: Georgia, serif;
    font-size: 30px;
    color: #fff;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .footer .price em { color: #A7BEAE; font-style: normal; }
  .footer .sub2 {
    font-size: 20px;
    color: rgba(231,232,209,0.80);
  }
  .footer .right { text-align: right; font-size: 22px; line-height: 1.5; }
  .footer .right b { color: #fff; font-size: 26px; }
  .footer .right .url { color: #A7BEAE; font-weight: 700; }
</style>
</head>
<body>

<div class="page">

  <!-- BRAND STRIP -->
  <div class="top">
    <svg viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#B85042"/>
      <rect x="6"  y="18" width="6" height="9"  rx="1" fill="#fff"/>
      <rect x="13" y="13" width="6" height="14" rx="1" fill="#fff"/>
      <rect x="20" y="7"  width="6" height="20" rx="1" fill="#fff"/>
    </svg>
    <div class="name">STOREY</div>
  </div>

  <!-- HERO -->
  <div class="hero">
    <span class="label">FOR INTERIOR DESIGNERS</span>
    <h1>Run 5 projects<br/>without 50 <em>WhatsApp</em><br/>groups.</h1>
    <p class="sub">One app for every site you run — materials, daily logs, expenses, vendors, photos. Built so your supervisors actually use it, even on a 4-year-old phone.</p>
  </div>

  <!-- AVAILABLE NOW -->
  <div class="now">
    <span class="section-label">AVAILABLE NOW</span>
    <div class="section-title">What you get today</div>
    <div class="feature-grid">
      <div class="feature">
        <div class="dot">1</div>
        <div class="body">
          <div class="name">Daily site logs with photos</div>
          <div class="desc">See exactly what happened on every site each day — without a single phone call.</div>
        </div>
      </div>
      <div class="feature">
        <div class="dot">2</div>
        <div class="body">
          <div class="name">Material tracking</div>
          <div class="desc">Every receipt, transfer and consumption logged. Know where every bag of cement went.</div>
        </div>
      </div>
      <div class="feature">
        <div class="dot">3</div>
        <div class="body">
          <div class="name">Expense vs budget</div>
          <div class="desc">Real-time spending against your project budget. Catch overruns before the client does.</div>
        </div>
      </div>
      <div class="feature">
        <div class="dot">4</div>
        <div class="body">
          <div class="name">Subcontractor management</div>
          <div class="desc">Carpenter, electrician, painter, plumber — track scope, labour, payments, snags in one place.</div>
        </div>
      </div>
      <div class="feature">
        <div class="dot">5</div>
        <div class="body">
          <div class="name">Snag &amp; task list</div>
          <div class="desc">Assign snags to specific contractors with photos. Status open / done. Handover-ready.</div>
        </div>
      </div>
      <div class="feature">
        <div class="dot">6</div>
        <div class="body">
          <div class="name">Multi-site dashboard</div>
          <div class="desc">All your active projects on one screen. Workers today, materials low, expenses pending.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- COMING SOON -->
  <div class="soon-block">
    <span class="section-label soon">COMING SOON</span>
    <div class="section-title" style="color:#2A1410;">Being built next</div>
    <div class="soon-grid">
      <div class="soon-card">
        <div class="dot">7</div>
        <div>
          <div class="name">Site documents</div>
          <div class="desc">Drawings, BOQs, contracts, approvals, vendor quotes — all attached to the site, accessible from any phone, shareable with one tap.</div>
        </div>
      </div>
      <div class="soon-card">
        <div class="dot">8</div>
        <div>
          <div class="name">Subcontractor dossier</div>
          <div class="desc">One screen per contractor: scope drawing + BOQ + materials issued + labour log + payments + snags. Google Drive can't do this.</div>
        </div>
      </div>
      <div class="soon-card">
        <div class="dot">9</div>
        <div>
          <div class="name">Client share link</div>
          <div class="desc">A read-only progress page you send to the client. Photos + updates, no login needed. Stop sending 30 photos a day on WhatsApp.</div>
        </div>
      </div>
      <div class="soon-card">
        <div class="dot">10</div>
        <div>
          <div class="name">Excel BOQ import</div>
          <div class="desc">Paste your BOQ from Excel — Storey pre-populates your materials list with planned quantities. Variance tracking comes free.</div>
        </div>
      </div>
    </div>
  </div>

  <!-- WHY -->
  <div class="why">
    <h2>Why Storey, not Drive + Excel + WhatsApp?</h2>
    <ul>
      <li><b>Built in India</b><span>Made for the messy reality of multi-vendor sites in Indian cities — not adapted from a US contractor app.</span></li>
      <li><b>Works on any phone</b><span>Your supervisor's 4-year-old Android in 4G. No 50 MB app, no plug-in, no friction.</span></li>
      <li><b>Free during launch beta</b><span>Per-site pricing later, never per-user. Your whole team uses it free for now.</span></li>
    </ul>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="left">
      <div class="price">Free during launch beta · <em>per-SITE pricing later</em></div>
      <div class="sub2">No credit card · 10-minute setup · Cancel anytime</div>
    </div>
    <div class="right">
      <b>Karun Roongta</b><br/>
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
