#!/usr/bin/env node
/**
 * Convert all docs/*.md to branded PDFs with Storey logo + document-type header.
 * Uses installed Chrome in headless mode (no Chromium download needed).
 *
 * Output: docs/pdf/<NAME>.pdf
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { marked } = require('marked');

const ROOT = __dirname;
const DOCS_DIR = path.join(ROOT, 'docs');
const OUT_DIR = path.join(DOCS_DIR, 'pdf');
const TMP_DIR = path.join(ROOT, '.tmp-pdf');

// --- Chrome path -----------------------------------------------------------
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error('No Chrome/Edge found.');
  process.exit(1);
}

// --- Brand -----------------------------------------------------------------
// SVG bar-chart logo (matches storey-logo.svg) — embedded inline.
const LOGO_SVG = `<svg width="44" height="44" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#B85042"/>
  <rect x="5"  y="18" width="6" height="9"  rx="1" fill="white"/>
  <rect x="13" y="13" width="6" height="14" rx="1" fill="white"/>
  <rect x="21" y="7"  width="6" height="20" rx="1" fill="white"/>
</svg>`;

// --- Document-type registry -------------------------------------------------
// Each doc gets a short human label shown in the page header.
const DOC_TYPES = {
  'ADVISORS.md':                   'Advisors',
  'CHANGELOG-2026-05-15.md':       'Changelog',
  'COMPETITIVE-LANDSCAPE.md':      'Competitive Landscape',
  'CONSTRUCTION-ACTIVITIES.md':    'Construction Activities Reference',
  'FEATURES.md':                   'Feature Reference',
  'FINANCIAL-PROJECTION.md':       'Financial Projection · 24-month',
  'INCIDENT-RESPONSE.md':          'Incident Response Runbook',
  'LEGAL-COMPLIANCE.md':           'Legal Compliance Map',
  'PITCH.md':                      'Contractor Pitch',
  'PRD-2026-05-15-auth-hardening.md': 'PRD · Auth Hardening',
  'PRIVACY-POLICY-DRAFT.md':       'Privacy Policy · DRAFT',
  'PRODUCT-STRATEGY.md':           'Product Strategy',
  'RLS-AUDIT-2026-05-19.md':       'RLS Audit · 2026-05-19',
  'ROADMAP-90.md':                 'Roadmap · 90-day',
  'ROADMAP-180.md':                'Roadmap · 180-day',
  'ROADMAP-365.md':                'Roadmap · 365-day',
  'TERMS-OF-SERVICE-DRAFT.md':     'Terms of Service · DRAFT',
  'TESTER-ONBOARDING.md':          'Tester Onboarding Guide',
  'TODO.md':                       'TODO Queue',
  'VERIFICATION-2026-05-18.md':    'Verification · 2026-05-18',
  'VIDEO-SCRIPT.md':               'Video Script',
  'WORKFLOWS.md':                  'Day-in-the-Life Workflows',
};

const TODAY = new Date().toISOString().slice(0, 10);

// --- HTML template ----------------------------------------------------------
function buildHTML(title, docType, bodyHTML) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(title)}</title>
<style>
  @page {
    size: A4;
    margin: 22mm 16mm 18mm 16mm;
  }
  * { box-sizing: border-box; }
  html, body {
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.5;
    color: #2b2b2b;
    margin: 0;
  }
  /* Brand header band at top of first page */
  .brand-band {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 0 14px 0;
    border-bottom: 3px solid #B85042;
    margin-bottom: 22px;
  }
  .brand-band .logo { flex: 0 0 44px; }
  .brand-band .titles { flex: 1; }
  .brand-band .name {
    font-family: Georgia, 'Cambria', serif;
    font-size: 18pt;
    font-weight: 700;
    color: #B85042;
    letter-spacing: 0.3px;
    line-height: 1;
  }
  .brand-band .doctype {
    margin-top: 4px;
    font-size: 10pt;
    color: #6a6a6a;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }
  .brand-band .meta {
    flex: 0 0 auto;
    text-align: right;
    font-size: 8.5pt;
    color: #888;
    line-height: 1.4;
  }
  /* Markdown content */
  h1 { font-family: Georgia, serif; font-size: 20pt; color: #B85042; margin: 18px 0 10px; }
  h2 { font-family: Georgia, serif; font-size: 14.5pt; color: #2b2b2b; margin: 22px 0 8px; border-bottom: 1px solid #E7E8D1; padding-bottom: 4px; }
  h3 { font-size: 12pt; color: #B85042; margin: 16px 0 6px; }
  h4 { font-size: 10.5pt; color: #2b2b2b; margin: 12px 0 4px; }
  p, li { font-size: 10.5pt; }
  ul, ol { padding-left: 22px; }
  li { margin: 3px 0; }
  blockquote {
    border-left: 3px solid #A7BEAE;
    background: #F5F4ED;
    margin: 10px 0;
    padding: 8px 12px;
    color: #4a4a4a;
    font-style: italic;
  }
  code {
    background: #F1EFE9;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9.5pt;
    color: #7a3328;
  }
  pre {
    background: #1f1f1f;
    color: #f3f3f3;
    padding: 10px 12px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.4;
  }
  pre code { background: transparent; color: inherit; padding: 0; font-size: 9pt; }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0;
    font-size: 9.5pt;
  }
  th, td {
    border: 1px solid #d6d2c5;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  th { background: #E7E8D1; color: #2b2b2b; font-weight: 600; }
  tr:nth-child(even) td { background: #FAF9F4; }
  hr { border: 0; border-top: 1px solid #E7E8D1; margin: 18px 0; }
  a { color: #B85042; text-decoration: none; }
  strong { color: #1f1f1f; }
  /* Page-break friendly */
  h1, h2, h3 { break-after: avoid; }
  table, pre, blockquote { break-inside: avoid; }
</style>
</head>
<body>
  <div class="brand-band">
    <div class="logo">${LOGO_SVG}</div>
    <div class="titles">
      <div class="name">Storey</div>
      <div class="doctype">${escapeHtml(docType)}</div>
    </div>
    <div class="meta">
      Storey Infra · Guwahati<br/>
      Generated ${TODAY}
    </div>
  </div>
  ${bodyHTML}
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// --- Convert one file -------------------------------------------------------
function convertOne(mdFile) {
  const base = path.basename(mdFile);
  const docType = DOC_TYPES[base] || base.replace(/\.md$/i, '');
  const md = fs.readFileSync(mdFile, 'utf8');
  const bodyHTML = marked.parse(md, { gfm: true, breaks: false });
  const html = buildHTML(docType, docType, bodyHTML);

  const htmlPath = path.join(TMP_DIR, base.replace(/\.md$/i, '.html'));
  fs.writeFileSync(htmlPath, html, 'utf8');

  const pdfPath = path.join(OUT_DIR, base.replace(/\.md$/i, '.pdf'));
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    fileUrl,
  ], { stdio: 'pipe' });

  return pdfPath;
}

// --- Main -------------------------------------------------------------------
function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  const onlyArg = process.argv[2]; // optional: filter to one file
  const files = fs.readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => !onlyArg || f.toLowerCase().includes(onlyArg.toLowerCase()))
    .sort();

  console.log(`Converting ${files.length} doc(s) → PDF...`);
  console.log(`Using: ${CHROME}\n`);

  let ok = 0, fail = 0;
  for (const f of files) {
    const src = path.join(DOCS_DIR, f);
    try {
      const out = convertOne(src);
      const kb = (fs.statSync(out).size / 1024).toFixed(0);
      console.log(`  ok  ${f}  →  ${path.relative(ROOT, out)}  (${kb} KB)`);
      ok++;
    } catch (e) {
      console.log(`  FAIL ${f}: ${e.message}`);
      fail++;
    }
  }

  // Clean temp html
  try {
    for (const f of fs.readdirSync(TMP_DIR)) fs.unlinkSync(path.join(TMP_DIR, f));
    fs.rmdirSync(TMP_DIR);
  } catch (_) {}

  console.log(`\nDone. ${ok} ok, ${fail} failed.  Output: docs/pdf/`);
}

main();
