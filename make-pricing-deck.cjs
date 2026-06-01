// Storey — Plans & Pricing deck. Emits editable PPTX (16:9 pitch) + JPG per slide.
// Brand: terracotta #B85042 (dominant), sand #E7E8D1, sage #A7BEAE, white, cocoa #2A1410.

const path = require('path');
const fs = require('fs');
const pptxRoot = require('child_process').execSync('npm root -g', { encoding: 'utf8' }).trim();
const PptxGenJS = require(path.join(pptxRoot, 'pptxgenjs'));
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const TERRACOTTA = 'B85042', SAND = 'E7E8D1', SAGE = 'A7BEAE', WHITE = 'FFFFFF', DARK = '2A1410';
const H = (c) => '#' + c;

// ── JPG canvas (1280x720, 16:9) ───────────────────────────────────────────────
const W = 1280, HT = 720;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// content shared by both renderers
const PRICE = {
  free:   { name: 'FREE',     mo1: '₹0',     mo3: '—',      yr1: '—',       yr3: '—' },
  std:    { name: 'STANDARD', mo1: '₹999',   mo3: '₹2,499', yr1: '₹9,990',  yr3: '₹24,990' },
  pro:    { name: 'PRO',      mo1: '₹1,999', mo3: '₹4,999', yr1: '₹19,990', yr3: '₹49,990' },
};

// =================== SVG SLIDES ===================
function svgCover() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HT}">
  <rect width="${W}" height="${HT}" fill="${H(TERRACOTTA)}"/>
  <rect x="0" y="0" width="${W}" height="70" fill="${H(SAND)}"/>
  <text x="60" y="48" font-family="Impact, Arial Black" font-size="34" letter-spacing="10" fill="${H(TERRACOTTA)}">STOREY</text>
  <circle cx="1120" cy="150" r="70" fill="${H(SAGE)}" opacity="0.55"/>
  <circle cx="1190" cy="250" r="38" fill="${H(SAGE)}" opacity="0.4"/>
  <text x="60" y="300" font-family="Georgia, serif" font-size="84" font-weight="bold" fill="${H(WHITE)}">Plans &amp; Pricing</text>
  <text x="64" y="370" font-family="Georgia, serif" font-size="32" font-style="italic" fill="${H(SAND)}">Start free. Pay only when it pays you back.</text>
  <text x="60" y="540" font-family="Calibri, Arial" font-size="24" fill="${H(SAND)}">Site-operations built for contractors in Northeast India.</text>
  <text x="60" y="${HT-45}" font-family="Calibri, Arial" font-size="26" font-weight="bold" fill="${H(WHITE)}">storeyinfra.com</text>
  <text x="${W-60}" y="${HT-45}" text-anchor="end" font-family="Calibri, Arial" font-size="20" fill="${H(SAND)}">Karun · +91 98640 66898</text>
</svg>`;
}

function card(x, y, w, h, titleColor) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${H(SAND)}"/>`;
}

function svgThreePlans() {
  const cw = 360, gap = 30, x0 = 60, y0 = 170, ch = 420;
  const cards = [
    { p: PRICE.free, sub: 'Record one site, on your own.', price: '₹0', note: 'free forever' },
    { p: PRICE.std,  sub: 'Add your team. One site.',       price: '₹999', note: 'per month' },
    { p: PRICE.pro,  sub: 'Full control + sub-contractors.', price: '₹1,999', note: 'per month' },
  ];
  let body = '';
  cards.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    body += card(x, y0, cw, ch);
    body += `<circle cx="${x + 50}" cy="${y0 + 56}" r="26" fill="${H(SAGE)}"/>`;
    body += `<text x="${x + 50}" y="${y0 + 65}" text-anchor="middle" font-family="Arial Black" font-size="26" fill="${H(WHITE)}">${i + 1}</text>`;
    body += `<text x="${x + 92}" y="${y0 + 66}" font-family="Impact, Arial Black" font-size="30" letter-spacing="3" fill="${H(TERRACOTTA)}">${c.p.name}</text>`;
    body += `<text x="${x + 30}" y="${y0 + 130}" font-family="Calibri, Arial" font-size="22" fill="${H(DARK)}">${esc(c.sub)}</text>`;
    body += `<text x="${x + 30}" y="${y0 + 250}" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="${H(TERRACOTTA)}">${c.price}</text>`;
    body += `<text x="${x + 32}" y="${y0 + 290}" font-family="Calibri, Arial" font-size="20" font-style="italic" fill="${H(DARK)}">${c.note}</text>`;
    body += `<text x="${x + 30}" y="${y0 + ch - 30}" font-family="Calibri, Arial" font-size="18" fill="${H(DARK)}">${i === 0 ? '1 user · 1 site' : i === 1 ? 'your whole team · 1 site' : 'your team · sub-contractors'}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HT}">
  <rect width="${W}" height="${HT}" fill="${H(TERRACOTTA)}"/>
  <text x="60" y="95" font-family="Georgia, serif" font-size="50" font-weight="bold" fill="${H(WHITE)}">Three plans. Pick your size.</text>
  <text x="62" y="138" font-family="Calibri, Arial" font-size="22" font-style="italic" fill="${H(SAND)}">Prices shown per month, one site. Three-site plans on the next slide.</text>
  ${body}
  <text x="60" y="${HT-28}" font-family="Calibri, Arial" font-size="20" fill="${H(SAND)}">storeyinfra.com · Karun · +91 98640 66898</text>
</svg>`;
}

function svgTable() {
  const x0 = 60, y0 = 175, rowH = 78, col = [300, 215, 215, 215, 215];
  const cx = [x0]; for (let i = 0; i < col.length; i++) cx.push(cx[i] + col[i]);
  const tableW = col.reduce((a, b) => a + b, 0);
  const heads = ['Plan', '1 site / mo', '3 sites / mo', '1 site / yr', '3 sites / yr'];
  const rows = [
    [PRICE.free.name, PRICE.free.mo1, PRICE.free.mo3, PRICE.free.yr1, PRICE.free.yr3],
    [PRICE.std.name,  PRICE.std.mo1,  PRICE.std.mo3,  PRICE.std.yr1,  PRICE.std.yr3],
    [PRICE.pro.name,  PRICE.pro.mo1,  PRICE.pro.mo3,  PRICE.pro.yr1,  PRICE.pro.yr3],
  ];
  let body = '';
  // header band
  body += `<rect x="${x0}" y="${y0}" width="${tableW}" height="${rowH}" fill="${H(DARK)}"/>`;
  heads.forEach((hd, i) => {
    body += `<text x="${cx[i] + (i === 0 ? 24 : col[i] / 2)}" y="${y0 + 50}" ${i === 0 ? '' : 'text-anchor="middle"'} font-family="Arial Black" font-size="22" fill="${H(SAND)}">${esc(hd)}</text>`;
  });
  rows.forEach((r, ri) => {
    const y = y0 + rowH * (ri + 1);
    body += `<rect x="${x0}" y="${y}" width="${tableW}" height="${rowH}" fill="${ri % 2 ? H(WHITE) : H(SAND)}"/>`;
    r.forEach((cell, ci) => {
      const big = ci > 0 && cell !== '—';
      body += `<text x="${cx[ci] + (ci === 0 ? 24 : col[ci] / 2)}" y="${y + 52}" ${ci === 0 ? '' : 'text-anchor="middle"'} font-family="${ci === 0 ? 'Impact, Arial Black' : 'Georgia, serif'}" font-size="${ci === 0 ? 26 : 28}" ${ci === 0 ? `letter-spacing="2" fill="${H(TERRACOTTA)}"` : `font-weight="bold" fill="${H(DARK)}"`}>${esc(cell)}</text>`;
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HT}">
  <rect width="${W}" height="${HT}" fill="${H(TERRACOTTA)}"/>
  <text x="60" y="110" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="${H(WHITE)}">What it costs</text>
  ${body}
  <text x="60" y="${y0 + rowH * 4 + 55}" font-family="Calibri, Arial" font-size="22" fill="${H(SAND)}">Beyond 3 sites: <tspan font-weight="bold" fill="${H(WHITE)}">+₹799 per site.</tspan>   Yearly = pay for 10 months — <tspan font-weight="bold" fill="${H(WHITE)}">2 months free.</tspan></text>
  <text x="60" y="${HT-28}" font-family="Calibri, Arial" font-size="20" fill="${H(SAND)}">storeyinfra.com · Karun · +91 98640 66898</text>
</svg>`;
}

function svgFeatures() {
  const cw = 360, gap = 30, x0 = 60, y0 = 165, ch = 440;
  const cols = [
    { name: 'FREE', items: ['Attendance', 'Daily logs', 'Expenses', 'Manual stock entry', '1 user · 1 site'] },
    { name: 'STANDARD', head: 'Everything in Free, plus', items: ['Your whole team — manager, supervisor, store keeper', 'Goods receipt from vendor', 'Material transfer between sites', 'Reports'] },
    { name: 'PRO', head: 'Everything in Standard, plus', badge: 'Coming soon', items: ['Budget vs actual', 'Sub-contractors & payments', 'Printable Work Order', 'Daily backup to your Drive'] },
  ];
  let body = '';
  cols.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    body += card(x, y0, cw, ch);
    body += `<text x="${x + 28}" y="${y0 + 56}" font-family="Impact, Arial Black" font-size="30" letter-spacing="3" fill="${H(TERRACOTTA)}">${c.name}</text>`;
    if (c.badge) {
      body += `<rect x="${x + cw - 158}" y="${y0 + 30}" width="130" height="34" rx="17" fill="${H(SAGE)}"/>`;
      body += `<text x="${x + cw - 93}" y="${y0 + 53}" text-anchor="middle" font-family="Calibri, Arial" font-size="17" font-weight="bold" fill="${H(WHITE)}">${esc(c.badge)}</text>`;
    }
    let ty = y0 + 100;
    if (c.head) { body += `<text x="${x + 28}" y="${ty}" font-family="Calibri, Arial" font-size="18" font-style="italic" fill="${H(DARK)}">${esc(c.head)}</text>`; ty += 40; }
    c.items.forEach((it) => {
      body += `<circle cx="${x + 38}" cy="${ty - 6}" r="7" fill="${H(SAGE)}"/>`;
      // wrap long item into up to 2 lines
      const words = it.split(' '); let line = '', lines = [];
      words.forEach(w => { if ((line + ' ' + w).trim().length > 30) { lines.push(line.trim()); line = w; } else line = (line + ' ' + w).trim(); });
      if (line) lines.push(line);
      lines.forEach((ln, li) => { body += `<text x="${x + 58}" y="${ty + li * 26}" font-family="Calibri, Arial" font-size="20" fill="${H(DARK)}">${esc(ln)}</text>`; });
      ty += 30 + (lines.length - 1) * 26;
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HT}">
  <rect width="${W}" height="${HT}" fill="${H(TERRACOTTA)}"/>
  <text x="60" y="110" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="${H(WHITE)}">What's in each plan</text>
  ${body}
  <text x="60" y="${HT-24}" font-family="Calibri, Arial" font-size="20" fill="${H(SAND)}">storeyinfra.com · Karun · +91 98640 66898</text>
</svg>`;
}

function svgDeal() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HT}">
  <rect width="${W}" height="${HT}" fill="${H(TERRACOTTA)}"/>
  <circle cx="1140" cy="140" r="80" fill="${H(SAGE)}" opacity="0.5"/>
  <text x="60" y="180" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="${H(WHITE)}">Pay for 10 months.</text>
  <text x="60" y="255" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="${H(WHITE)}">Use it for 12.</text>
  <text x="62" y="305" font-family="Calibri, Arial" font-size="26" font-style="italic" fill="${H(SAND)}">Switch to yearly and get two months free.</text>
  <rect x="60" y="350" width="${W-120}" height="120" rx="16" fill="${H(SAND)}"/>
  <text x="90" y="400" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="${H(TERRACOTTA)}">You pay per site — your whole team is included.</text>
  <text x="90" y="440" font-family="Calibri, Arial" font-size="22" fill="${H(DARK)}">No charge per person. Add as many supervisors and store keepers as you need.</text>
  <rect x="60" y="540" width="430" height="86" rx="43" fill="${H(WHITE)}"/>
  <text x="275" y="595" text-anchor="middle" font-family="Calibri, Arial" font-size="34" font-weight="bold" fill="${H(TERRACOTTA)}">storeyinfra.com</text>
  <text x="60" y="${HT-30}" font-family="Calibri, Arial" font-size="24" font-weight="bold" fill="${H(WHITE)}">Karun · +91 98640 66898 · WhatsApp us</text>
</svg>`;
}

const SVGS = [svgCover(), svgThreePlans(), svgTable(), svgFeatures(), svgDeal()];

// =================== render JPGs ===================
async function renderJpgs() {
  for (let i = 0; i < SVGS.length; i++) {
    const out = `C:\\consne\\storey-pricing-${i + 1}.jpg`;
    await sharp(Buffer.from(SVGS[i])).jpeg({ quality: 90 }).toFile(out);
    console.log('wrote', out);
  }
}

// =================== PPTX (13.33 x 7.5) ===================
function tx(s, t, o) { s.addText(t, o); }
async function makePptx() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'P169', width: 13.33, height: 7.5 });
  pptx.layout = 'P169';
  pptx.title = 'Storey — Plans & Pricing';
  const FOOT = { x: 0.6, y: 7.0, w: 12.1, h: 0.4, fontFace: 'Calibri', fontSize: 12, color: SAND };

  // S1 cover
  let s = pptx.addSlide(); s.background = { color: TERRACOTTA };
  s.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.7, fill: { color: SAND }, line: { color: SAND } });
  tx(s, 'STOREY', { x: 0.6, y: 0.12, w: 5, h: 0.45, fontFace: 'Impact', fontSize: 28, color: TERRACOTTA, charSpacing: 10, bold: true });
  s.addShape('ellipse', { x: 11.3, y: 1.0, w: 1.5, h: 1.5, fill: { color: SAGE } });
  tx(s, 'Plans & Pricing', { x: 0.6, y: 2.3, w: 11, h: 1.3, fontFace: 'Georgia', fontSize: 72, bold: true, color: WHITE });
  tx(s, 'Start free. Pay only when it pays you back.', { x: 0.62, y: 3.7, w: 11, h: 0.6, fontFace: 'Georgia', fontSize: 26, italic: true, color: SAND });
  tx(s, 'Site-operations built for contractors in Northeast India.', { x: 0.6, y: 5.4, w: 11, h: 0.5, fontFace: 'Calibri', fontSize: 20, color: SAND });
  tx(s, 'storeyinfra.com', { x: 0.6, y: 6.95, w: 6, h: 0.4, fontFace: 'Calibri', fontSize: 22, bold: true, color: WHITE });
  tx(s, 'Karun · +91 98640 66898', { x: 6.7, y: 6.95, w: 6, h: 0.4, align: 'right', fontFace: 'Calibri', fontSize: 16, color: SAND });

  // S2 three plans
  s = pptx.addSlide(); s.background = { color: TERRACOTTA };
  tx(s, 'Three plans. Pick your size.', { x: 0.6, y: 0.4, w: 12, h: 0.8, fontFace: 'Georgia', fontSize: 40, bold: true, color: WHITE });
  tx(s, 'Prices shown per month, one site. Three-site plans on the next slide.', { x: 0.62, y: 1.15, w: 12, h: 0.4, fontFace: 'Calibri', fontSize: 16, italic: true, color: SAND });
  const plans = [
    { n: 'FREE', sub: 'Record one site, on your own.', pr: '₹0', note: 'free forever', foot: '1 user · 1 site' },
    { n: 'STANDARD', sub: 'Add your team. One site.', pr: '₹999', note: 'per month', foot: 'your whole team · 1 site' },
    { n: 'PRO', sub: 'Full control + sub-contractors.', pr: '₹1,999', note: 'per month', foot: 'your team · sub-contractors' },
  ];
  plans.forEach((p, i) => {
    const x = 0.6 + i * 4.15;
    s.addShape('roundRect', { x, y: 1.75, w: 3.85, h: 4.6, fill: { color: SAND }, line: { color: SAND }, rectRadius: 0.15 });
    s.addShape('ellipse', { x: x + 0.25, y: 2.0, w: 0.6, h: 0.6, fill: { color: SAGE } });
    tx(s, String(i + 1), { x: x + 0.25, y: 2.0, w: 0.6, h: 0.6, align: 'center', valign: 'middle', fontFace: 'Arial Black', fontSize: 24, color: WHITE, bold: true });
    tx(s, p.n, { x: x + 1.0, y: 2.05, w: 2.7, h: 0.55, fontFace: 'Impact', fontSize: 28, charSpacing: 3, color: TERRACOTTA });
    tx(s, p.sub, { x: x + 0.3, y: 2.75, w: 3.3, h: 0.7, fontFace: 'Calibri', fontSize: 17, color: DARK });
    tx(s, p.pr, { x: x + 0.3, y: 3.6, w: 3.3, h: 1.0, fontFace: 'Georgia', fontSize: 56, bold: true, color: TERRACOTTA });
    tx(s, p.note, { x: x + 0.32, y: 4.6, w: 3.3, h: 0.4, fontFace: 'Calibri', fontSize: 16, italic: true, color: DARK });
    tx(s, p.foot, { x: x + 0.3, y: 5.8, w: 3.3, h: 0.4, fontFace: 'Calibri', fontSize: 14, color: DARK });
  });
  tx(s, 'storeyinfra.com · Karun · +91 98640 66898', FOOT);

  // S3 table
  s = pptx.addSlide(); s.background = { color: TERRACOTTA };
  tx(s, 'What it costs', { x: 0.6, y: 0.45, w: 12, h: 0.9, fontFace: 'Georgia', fontSize: 44, bold: true, color: WHITE });
  const head = ['Plan', '1 site / mo', '3 sites / mo', '1 site / yr', '3 sites / yr'];
  const trows = [
    [PRICE.free.name, PRICE.free.mo1, PRICE.free.mo3, PRICE.free.yr1, PRICE.free.yr3],
    [PRICE.std.name, PRICE.std.mo1, PRICE.std.mo3, PRICE.std.yr1, PRICE.std.yr3],
    [PRICE.pro.name, PRICE.pro.mo1, PRICE.pro.mo3, PRICE.pro.yr1, PRICE.pro.yr3],
  ];
  const mkRow = (cells, opts) => cells.map((c, i) => ({
    text: c,
    options: { align: i === 0 ? 'left' : 'center', valign: 'middle',
      fontFace: i === 0 ? 'Impact' : 'Georgia', fontSize: i === 0 ? 18 : 22, bold: i !== 0,
      color: opts.color, fill: { color: opts.fill }, charSpacing: i === 0 ? 2 : 0 },
  }));
  const rowsData = [];
  rowsData.push(head.map((c, i) => ({ text: c, options: { align: i === 0 ? 'left' : 'center', valign: 'middle', fontFace: 'Arial', fontSize: 16, bold: true, color: SAND, fill: { color: DARK } } })));
  trows.forEach((r, ri) => rowsData.push(mkRow(r, { color: ri === 2 ? TERRACOTTA : DARK, fill: ri % 2 ? WHITE : SAND }).map((cell, i) => { if (i === 0) cell.options.color = TERRACOTTA; return cell; })));
  s.addTable(rowsData, { x: 0.6, y: 1.6, w: 12.1, colW: [3.1, 2.25, 2.25, 2.25, 2.25], rowH: 0.85, border: { type: 'solid', color: TERRACOTTA, pt: 1 } });
  tx(s, 'Beyond 3 sites: +₹799 per site.   Yearly = pay for 10 months — 2 months free.', { x: 0.6, y: 5.7, w: 12, h: 0.5, fontFace: 'Calibri', fontSize: 18, color: SAND });
  tx(s, 'storeyinfra.com · Karun · +91 98640 66898', FOOT);

  // S4 features
  s = pptx.addSlide(); s.background = { color: TERRACOTTA };
  tx(s, "What's in each plan", { x: 0.6, y: 0.45, w: 12, h: 0.9, fontFace: 'Georgia', fontSize: 44, bold: true, color: WHITE });
  const fcols = [
    { n: 'FREE', head: '', items: ['Attendance', 'Daily logs', 'Expenses', 'Manual stock entry', '1 user · 1 site'] },
    { n: 'STANDARD', head: 'Everything in Free, plus', items: ['Your whole team — manager, supervisor, store keeper', 'Goods receipt from vendor', 'Material transfer between sites', 'Reports'] },
    { n: 'PRO', head: 'Everything in Standard, plus', badge: 'Coming soon', items: ['Budget vs actual', 'Sub-contractors & payments', 'Printable Work Order', 'Daily backup to your Drive'] },
  ];
  fcols.forEach((c, i) => {
    const x = 0.6 + i * 4.15;
    s.addShape('roundRect', { x, y: 1.6, w: 3.85, h: 4.9, fill: { color: SAND }, line: { color: SAND }, rectRadius: 0.15 });
    tx(s, c.n, { x: x + 0.28, y: 1.8, w: 3.3, h: 0.5, fontFace: 'Impact', fontSize: 26, charSpacing: 3, color: TERRACOTTA });
    if (c.badge) {
      s.addShape('roundRect', { x: x + 2.3, y: 1.83, w: 1.35, h: 0.38, fill: { color: SAGE }, line: { color: SAGE }, rectRadius: 0.19 });
      tx(s, c.badge, { x: x + 2.3, y: 1.83, w: 1.35, h: 0.38, align: 'center', valign: 'middle', fontFace: 'Calibri', fontSize: 12, bold: true, color: WHITE });
    }
    const bullets = (c.head ? [{ text: c.head, options: { italic: true, fontSize: 14, color: DARK, bullet: false, paraSpaceAfter: 8 } }] : [])
      .concat(c.items.map((it) => ({ text: it, options: { fontSize: 16, color: DARK, bullet: { code: '2022', indent: 18 }, paraSpaceAfter: 8 } })));
    s.addText(bullets, { x: x + 0.28, y: 2.4, w: 3.35, h: 3.9, fontFace: 'Calibri', valign: 'top' });
  });
  tx(s, 'storeyinfra.com · Karun · +91 98640 66898', FOOT);

  // S5 deal
  s = pptx.addSlide(); s.background = { color: TERRACOTTA };
  s.addShape('ellipse', { x: 11.2, y: 0.7, w: 1.7, h: 1.7, fill: { color: SAGE } });
  tx(s, 'Pay for 10 months.\nUse it for 12.', { x: 0.6, y: 1.0, w: 11, h: 1.9, fontFace: 'Georgia', fontSize: 60, bold: true, color: WHITE, lineSpacingMultiple: 1.0 });
  tx(s, 'Switch to yearly and get two months free.', { x: 0.62, y: 3.0, w: 11, h: 0.5, fontFace: 'Calibri', fontSize: 22, italic: true, color: SAND });
  s.addShape('roundRect', { x: 0.6, y: 3.6, w: 12.1, h: 1.4, fill: { color: SAND }, line: { color: SAND }, rectRadius: 0.12 });
  tx(s, 'You pay per site — your whole team is included.', { x: 0.85, y: 3.8, w: 11.6, h: 0.6, fontFace: 'Georgia', fontSize: 28, bold: true, color: TERRACOTTA });
  tx(s, 'No charge per person. Add as many supervisors and store keepers as you need.', { x: 0.85, y: 4.4, w: 11.6, h: 0.5, fontFace: 'Calibri', fontSize: 18, color: DARK });
  s.addShape('roundRect', { x: 0.6, y: 5.45, w: 4.5, h: 0.95, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.47 });
  tx(s, 'storeyinfra.com', { x: 0.6, y: 5.45, w: 4.5, h: 0.95, align: 'center', valign: 'middle', fontFace: 'Calibri', fontSize: 30, bold: true, color: TERRACOTTA });
  tx(s, 'Karun · +91 98640 66898 · WhatsApp us', { x: 0.6, y: 6.95, w: 12, h: 0.4, fontFace: 'Calibri', fontSize: 22, bold: true, color: WHITE });

  await pptx.writeFile({ fileName: 'C:\\consne\\storey-pricing-deck.pptx' });
  console.log('wrote C:\\consne\\storey-pricing-deck.pptx');
}

(async () => { await renderJpgs(); await makePptx(); })();
