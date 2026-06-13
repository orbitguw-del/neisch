'use strict'
// Storey info pack — what Karun attaches to WhatsApp replies to summit
// scanner-card leads. Designed for PHONE reading (contractor opens it in
// WhatsApp on their phone), so portrait + readable type sizes + short.
//
// A5 portrait at ~150dpi via Chrome headless print-to-PDF, ~6 pages.
//
// Renders branded HTML, then uses Chrome headless to print to
// storey-info-pack.pdf.

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = __dirname
const OUT_PDF  = path.join(ROOT, 'storey-info-pack.pdf')
const TMP_HTML = path.join(ROOT, '.tmp-info-pack.html')

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p))
if (!CHROME) { console.error('No Chrome/Edge'); process.exit(1) }

// Storey bar-chart logo as inline SVG (matches storey-logo.svg)
const LOGO = `<svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#B85042"/>
  <rect x="5"  y="18" width="6" height="9"  rx="1" fill="white"/>
  <rect x="13" y="13" width="6" height="14" rx="1" fill="white"/>
  <rect x="21" y="7"  width="6" height="20" rx="1" fill="white"/>
</svg>`

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Storey · Info Pack</title>
<style>
  :root {
    --terra: #B85042;
    --terra-dk: #9A3F33;
    --sand: #E7E8D1;
    --sage: #A7BEAE;
    --cocoa: #2A1410;
    --gray: #6B5750;
    --light: #FAF7F2;
  }
  @page { size: A5; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Calibri', 'Segoe UI', system-ui, Arial, sans-serif;
    font-size: 11pt; line-height: 1.55;
    color: var(--cocoa); background: #fff;
  }

  .page {
    width: 148mm; height: 210mm;
    padding: 14mm 14mm 12mm 14mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }
  .page:last-of-type { page-break-after: auto; }

  /* ─── COVER ──────────────────────────────────── */
  .cover {
    background: linear-gradient(135deg, var(--terra) 0%, var(--terra-dk) 100%);
    color: #fff;
    padding: 18mm 14mm;
  }
  .cover .brand-row { display: flex; align-items: center; gap: 10px; }
  .cover .wordmark {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 36pt; letter-spacing: 4px; margin: 0;
  }
  .cover .tagline {
    font-size: 9pt; letter-spacing: 3px; color: var(--sand);
    margin-top: 2px;
  }
  .cover h1 {
    font-family: Georgia, serif;
    font-size: 28pt; line-height: 1.15; margin: 30mm 0 10mm 0;
  }
  .cover .sub {
    font-size: 14pt; color: var(--sand); margin-bottom: 28mm;
  }
  .cover .pill {
    display: inline-block; padding: 6mm 9mm; border-radius: 28mm;
    background: #fff; color: var(--terra); font-family: Georgia, serif;
    font-weight: bold; font-size: 14pt;
  }
  .cover .pill-sub { color: var(--cocoa); font-size: 8.5pt; font-family: Calibri, sans-serif; font-weight: normal; margin-top: 1mm; display: block; }
  .cover .footer-line {
    position: absolute; bottom: 12mm; left: 14mm; right: 14mm;
    font-size: 9pt; color: var(--sand);
    border-top: 1px solid rgba(255,255,255,0.25);
    padding-top: 4mm;
  }

  /* ─── INSIDE PAGES ───────────────────────────── */
  .page.body { background: var(--light); }
  .pheader {
    display: flex; align-items: center; gap: 8px;
    border-bottom: 2px solid var(--terra);
    padding-bottom: 4mm; margin-bottom: 7mm;
  }
  .pheader .wm {
    font-family: Impact, sans-serif; font-size: 11pt; letter-spacing: 2px;
    color: var(--terra);
  }
  .pheader .tag {
    font-size: 7.5pt; letter-spacing: 1.5px; color: var(--gray);
    text-transform: uppercase; margin-left: auto;
  }
  h2.title {
    font-family: Georgia, serif; font-size: 19pt; color: var(--terra);
    margin: 0 0 5mm 0; line-height: 1.15;
  }
  h2.title .sub { display:block; font-size: 11pt; color: var(--cocoa); font-style: italic; margin-top: 2mm; font-weight: normal; }

  .row { display: flex; gap: 5mm; align-items: flex-start; margin-bottom: 5mm; }
  .row .num {
    flex: 0 0 9mm; height: 9mm; border-radius: 50%;
    background: var(--sage); color: var(--cocoa);
    font-family: Georgia, serif; font-weight: bold; font-size: 13pt;
    display: flex; align-items: center; justify-content: center;
  }
  .row .txt { flex: 1; }
  .row .txt b { font-size: 12pt; }
  .row .txt p { margin: 1mm 0 0 0; color: var(--gray); font-size: 10pt; }

  .quote {
    border-left: 4px solid var(--sage); background: #f5f3ea;
    padding: 4mm 5mm; margin: 5mm 0;
    font-style: italic; color: var(--cocoa); font-size: 10pt;
  }

  .tile {
    background: #fff; border-radius: 4mm; padding: 5mm;
    box-shadow: 0 1mm 3mm rgba(0,0,0,0.06);
    margin-bottom: 4mm;
  }
  .tile h3 {
    margin: 0 0 2mm 0; font-family: Georgia, serif; font-size: 13pt; color: var(--terra);
  }
  .tile p { margin: 0; font-size: 10pt; color: var(--cocoa); }

  .grid-2 { display: flex; gap: 4mm; }
  .grid-2 .tile { flex: 1; }

  /* Pricing card */
  .price-card {
    background: var(--terra); color: #fff; border-radius: 5mm;
    padding: 7mm; margin: 4mm 0;
    text-align: center;
  }
  .price-card .free-pill {
    display: inline-block; background: #fff; color: var(--terra);
    padding: 2mm 5mm; border-radius: 12mm;
    font-family: Georgia, serif; font-weight: bold; font-size: 13pt;
  }
  .price-card .note {
    margin-top: 3mm; font-size: 9pt; color: var(--sand);
  }

  /* CTA section */
  .cta {
    background: var(--sand); border-radius: 4mm; padding: 6mm;
    margin-top: 6mm; text-align: center;
  }
  .cta h3 {
    margin: 0 0 3mm 0; font-family: Georgia, serif; color: var(--terra); font-size: 16pt;
  }
  .cta .url {
    display: inline-block; padding: 3mm 6mm; background: var(--terra);
    color: #fff; border-radius: 8mm; font-weight: bold; font-size: 12pt;
    margin: 3mm 0; text-decoration: none;
  }
  .cta p { margin: 2mm 0; font-size: 10pt; }

  .pfooter {
    position: absolute; bottom: 8mm; left: 14mm; right: 14mm;
    border-top: 1px solid #d9d4c4;
    padding-top: 3mm;
    display: flex; justify-content: space-between;
    font-size: 8.5pt; color: var(--gray);
  }

  /* Last page */
  .page.last { background: linear-gradient(180deg, var(--sand) 0%, #fff 100%); }
</style>
</head>
<body>

<!-- ─────────────── PAGE 1 — COVER ─────────────── -->
<div class="page cover">
  <div class="brand-row">
    ${LOGO}
    <div>
      <p class="wordmark">STOREY</p>
      <p class="tagline">SITE OPERATIONS · BUILT IN GUWAHATI</p>
    </div>
  </div>

  <h1>Run your sites.<br/>Not your phone.</h1>
  <p class="sub">Attendance · Materials · Daily logs · Reports — one app.</p>

  <span class="pill">
    FREE during launch beta
    <span class="pill-sub">No card. Start today. Your data stays yours.</span>
  </span>

  <p class="footer-line">Storey Infra · Guwahati, Assam · For NE-India contractors</p>
</div>

<!-- ─────────────── PAGE 2 — THE PROBLEM ─────────────── -->
<div class="page body">
  <div class="pheader">
    <span class="wm">STOREY</span>
    <span class="tag">Info Pack · 1 of 4</span>
  </div>

  <h2 class="title">The problem<span class="sub">— that every contractor knows too well</span></h2>

  <div class="row"><div class="num">!</div><div class="txt"><b>Workers, supervisors and material — spread across phones, paper, Excel.</b><p>By the time you reconcile, the day is over and the cement is gone.</p></div></div>

  <div class="row"><div class="num">!</div><div class="txt"><b>"Where did the 50 bags go?"</b><p>Issued to the wrong supervisor, transferred to the wrong site, or just nobody wrote it down.</p></div></div>

  <div class="row"><div class="num">!</div><div class="txt"><b>Monthly closing takes 4-5 days.</b><p>Attendance from supervisors, expenses from foremen, material from store keeper — all on WhatsApp, all manual.</p></div></div>

  <div class="row"><div class="num">!</div><div class="txt"><b>ERPs that took 6 months to set up.</b><p>And broke in Assamese on flaky 4G the moment your supervisor left.</p></div></div>

  <div class="quote">"I just want to know how many people showed up today and how much cement I have left. Why is this so hard?" — every contractor, ever.</div>

  <div class="pfooter"><span>storeyinfra.com</span><span>Karun · +91 98640 66898</span></div>
</div>

<!-- ─────────────── PAGE 3 — WHAT STOREY DOES ─────────────── -->
<div class="page body">
  <div class="pheader">
    <span class="wm">STOREY</span>
    <span class="tag">Info Pack · 2 of 4</span>
  </div>

  <h2 class="title">What Storey does<span class="sub">— five workflows your site already runs, but on paper</span></h2>

  <div class="row"><div class="num">1</div><div class="txt"><b>Worker attendance</b><p>Supervisor marks who's present. Site manager confirms. Day done in 60 seconds.</p></div></div>

  <div class="row"><div class="num">2</div><div class="txt"><b>Material in, issued, transferred</b><p>Cement, steel, sand — every bag tracked. With delivery photo + challan + tax invoice number.</p></div></div>

  <div class="row"><div class="num">3</div><div class="txt"><b>Daily site logs with photos</b><p>Supervisor posts what happened today, with date-stamped photos as proof. Site manager confirms.</p></div></div>

  <div class="row"><div class="num">4</div><div class="txt"><b>Sub-contractors + payments</b><p>Directory of all sub-contractors, what you paid, what's still due. Plus work orders and variation orders.</p></div></div>

  <div class="row"><div class="num">5</div><div class="txt"><b>Site expenses with approval</b><p>Supervisor records, site manager approves. Reports straight to WhatsApp or Excel.</p></div></div>

  <div class="quote">Works offline. Works on a 4-year-old phone. Works in patchy 4G.</div>

  <div class="pfooter"><span>storeyinfra.com</span><span>Karun · +91 98640 66898</span></div>
</div>

<!-- ─────────────── PAGE 4 — WHY DIFFERENT + PRICING ─────────────── -->
<div class="page body">
  <div class="pheader">
    <span class="wm">STOREY</span>
    <span class="tag">Info Pack · 3 of 4</span>
  </div>

  <h2 class="title">Why Storey<span class="sub">— different from the ERP / Tally / Excel mix</span></h2>

  <div class="tile">
    <h3>Pay per SITE, not per user</h3>
    <p>Your whole team — site managers, supervisors, store keepers — uses Storey. No per-head charges. Competitors charge ₹12-15k per user per year. We don't.</p>
  </div>

  <div class="tile">
    <h3>Made for NE-India sites</h3>
    <p>Built in Guwahati for sites in Assam, Meghalaya, Nagaland. Works offline. Works on old phones. Plain English. (Hindi / Assamese coming as a toggle.)</p>
  </div>

  <div class="tile">
    <h3>Your data stays yours</h3>
    <p>Each company's data is private. We don't sell it, share across tenants, or use it for AI training. Export to Excel anytime.</p>
  </div>

  <div class="price-card">
    <span class="free-pill">FREE during launch beta</span>
    <div class="note">Pricing kicks in only when we ship the full Pro bundle — and even then it's per-site, not per-user, with 30-day notice.</div>
  </div>

  <div class="pfooter"><span>storeyinfra.com</span><span>Karun · +91 98640 66898</span></div>
</div>

<!-- ─────────────── PAGE 5 — HOW TO START + CONTACT ─────────────── -->
<div class="page body last">
  <div class="pheader">
    <span class="wm">STOREY</span>
    <span class="tag">Info Pack · 4 of 4</span>
  </div>

  <h2 class="title">How to start<span class="sub">— takes 3 minutes</span></h2>

  <div class="row"><div class="num">1</div><div class="txt"><b>Install Storey from Google Play</b><p>Search "Storey - Const Site Manager" or open: <br/><b>play.google.com/store/apps/details?id=com.storeyinfra.app</b></p></div></div>

  <div class="row"><div class="num">2</div><div class="txt"><b>Register your company</b><p>Tap "Register". Enter your firm name + your details. That's it — you're the contractor / admin.</p></div></div>

  <div class="row"><div class="num">3</div><div class="txt"><b>Add your first site + 2-3 workers</b><p>Add a site name. Add a couple of workers to test attendance. Try the camera + daily log.</p></div></div>

  <div class="row"><div class="num">4</div><div class="txt"><b>Invite your supervisor</b><p>Send an invite to your site supervisor's number. They sign up, you assign them to the site. Done.</p></div></div>

  <div class="cta">
    <h3>Stuck? Just message me.</h3>
    <p><b>WhatsApp: +91 98640 66898</b></p>
    <p>I'll walk you through it on a call or screen-share — usually 10 minutes is enough.</p>
    <a class="url" href="https://storeyinfra.com">storeyinfra.com</a>
    <p style="font-size: 9pt; color: var(--gray); margin-top: 4mm;">
      — Karun Roongta · Founder · Storey Labs Private Limited (registration in progress)
    </p>
  </div>

  <div class="pfooter"><span>Info Pack v1 · June 2026</span><span>storeyinfra.com</span></div>
</div>

</body>
</html>`

fs.writeFileSync(TMP_HTML, html, 'utf8')

const fileUrl = 'file:///' + TMP_HTML.replace(/\\/g, '/')
execFileSync(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--no-pdf-header-footer',
  `--print-to-pdf=${OUT_PDF}`,
  fileUrl,
], { stdio: 'pipe' })

// Cleanup tmp html
try { fs.unlinkSync(TMP_HTML) } catch (_) {}

const kb = (fs.statSync(OUT_PDF).size / 1024).toFixed(0)
console.log(`✓ ${OUT_PDF}  (${kb} KB, 5 pages, A5 portrait)`)
console.log(``)
console.log(`Attach in WhatsApp replies (see _reference/WHATSAPP-REPLY-TEMPLATES.md).`)
