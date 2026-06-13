'use strict'
// Renders docs/PRIVACY-POLICY-DRAFT.md and docs/TERMS-OF-SERVICE-DRAFT.md
// into STATIC HTML files at:
//   public/privacy/index.html
//   public/terms/index.html
//
// Why: Google's policy-validator bot doesn't reliably execute SPA
// JavaScript, so it sees an empty React shell at storeyinfra.com/privacy
// and flags the URL as "Invalid privacy policy" (enforced 2026-06-13).
// Vercel's filesystem handler will serve these static files before
// falling through to the SPA, so /privacy and /terms now return real,
// crawlable HTML.

const fs = require('fs')
const path = require('path')
const { marked } = require('marked')

const ROOT = __dirname

const PAGES = [
  {
    src:   'docs/PRIVACY-POLICY-DRAFT.md',
    out:   'public/privacy/index.html',
    title: 'Privacy Policy · Storey',
    label: 'Privacy Policy',
  },
  {
    src:   'docs/TERMS-OF-SERVICE-DRAFT.md',
    out:   'public/terms/index.html',
    title: 'Terms of Service · Storey',
    label: 'Terms of Service',
  },
]

function shell(title, label, bodyHtml) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="description" content="Storey ${label} — Storey Infra, Guwahati. Plain-English policy for our construction site-operations app, written to comply with India's DPDP Act 2023 and IT Act 2000."/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="https://storeyinfra.com/${label.toLowerCase().includes('privacy') ? 'privacy' : 'terms'}/"/>
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
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--light); color: var(--cocoa); }
  body {
    font-family: 'Calibri', 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.65;
  }
  header {
    background: linear-gradient(135deg, var(--terra), var(--terra-dk));
    color: #fff;
    padding: 32px 24px;
    text-align: center;
  }
  header .brand {
    font-family: 'Impact', 'Arial Black', sans-serif;
    font-size: 36px;
    letter-spacing: 6px;
    margin: 0;
  }
  header .doctype {
    margin-top: 6px;
    font-size: 13px;
    letter-spacing: 4px;
    color: var(--sand);
  }
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 24px 80px;
    background: #fff;
    box-shadow: 0 2px 24px rgba(0,0,0,0.05);
  }
  main h1 {
    font-family: Georgia, 'Cambria', serif;
    font-size: 28px;
    color: var(--terra);
    margin-top: 0;
    border-bottom: 3px solid var(--sand);
    padding-bottom: 10px;
  }
  main h2 {
    font-family: Georgia, 'Cambria', serif;
    font-size: 20px;
    color: var(--cocoa);
    margin-top: 32px;
    margin-bottom: 8px;
  }
  main h3 {
    font-size: 16px;
    color: var(--terra);
    margin-top: 22px;
    margin-bottom: 6px;
  }
  main p, main li { color: #2A1410; }
  main ul, main ol { padding-left: 22px; }
  main a { color: var(--terra); }
  main blockquote {
    border-left: 4px solid var(--sage);
    background: #F5F3EA;
    margin: 16px 0;
    padding: 12px 16px;
    color: #4a3a30;
  }
  main code {
    background: #F1EFE9;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'Consolas', monospace;
    font-size: 14px;
  }
  main table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 14px;
  }
  main th, main td {
    border: 1px solid #d6d2c5;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }
  main th { background: var(--sand); }
  footer {
    background: var(--terra-dk);
    color: var(--sand);
    text-align: center;
    padding: 24px;
    font-size: 13px;
  }
  footer a { color: #fff; }
  .nav {
    background: var(--sand);
    padding: 10px 24px;
    text-align: center;
    font-size: 14px;
  }
  .nav a { color: var(--terra-dk); margin: 0 12px; text-decoration: none; font-weight: 600; }
  .nav a:hover { text-decoration: underline; }
</style>
</head>
<body>
<header>
  <p class="brand">STOREY</p>
  <p class="doctype">${label.toUpperCase()}</p>
</header>
<nav class="nav">
  <a href="/">Home</a>
  <a href="/privacy/">Privacy Policy</a>
  <a href="/terms/">Terms of Service</a>
  <a href="mailto:help@storeyinfra.com">help@storeyinfra.com</a>
</nav>
<main>
${bodyHtml}
</main>
<footer>
  Storey Infra · Guwahati, Assam, India ·
  <a href="mailto:help@storeyinfra.com">help@storeyinfra.com</a> ·
  WhatsApp +91 98640 66898
</footer>
</body>
</html>`
}

function main() {
  for (const p of PAGES) {
    const md = fs.readFileSync(path.join(ROOT, p.src), 'utf8')
    const html = marked.parse(md, { gfm: true })
    const outPath = path.join(ROOT, p.out)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, shell(p.title, p.label, html), 'utf8')
    const kb = (fs.statSync(outPath).size / 1024).toFixed(0)
    console.log(`  ✓ ${p.out}  (${kb} KB)`)
  }
}

main()
