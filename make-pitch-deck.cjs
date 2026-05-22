// Storey — pitch deck (widescreen PPTX).
// 12 slides matching docs/PITCH.md. Brand-coherent per
// .claude/skills/marketing/SKILL.md. Built 2026-05-22.
//
// Output: C:\consne\storey-pitch-deck.pptx — editable in PowerPoint.

const path = require('path');
const { execSync } = require('child_process');
const PptxGenJS = require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'pptxgenjs'));

const OUT = 'C:\\consne\\storey-pitch-deck.pptx';

const TERRACOTTA = 'B85042';
const SAND       = 'E7E8D1';
const SAGE       = 'A7BEAE';
const WHITE      = 'FFFFFF';
const DARK       = '2A1410';
const AMBER      = 'D97706';
const GREEN      = '059669';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';  // 13.33 × 7.5 inches, 16:9
pptx.title = 'Storey — pitch deck';
pptx.author = 'Karun Roongta';
pptx.company = 'Storey Infra';

// ── Helpers ─────────────────────────────────────────────────────────
function logo(slide, x, y, size) {
  // 3-bar Storey mark on a rounded terracotta square
  const u = size / 32;
  slide.addShape('roundRect', { x, y, w: size, h: size, fill: { color: TERRACOTTA }, line: { color: TERRACOTTA }, rectRadius: size * 0.15 });
  slide.addShape('roundRect', { x: x + 5*u,  y: y + 18*u, w: 6*u, h: 9*u,  fill: { color: WHITE }, line: { color: WHITE }, rectRadius: u * 0.4 });
  slide.addShape('roundRect', { x: x + 13*u, y: y + 13*u, w: 6*u, h: 14*u, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: u * 0.4 });
  slide.addShape('roundRect', { x: x + 21*u, y: y + 7*u,  w: 6*u, h: 20*u, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: u * 0.4 });
}

function footer(slide, color = SAND) {
  slide.addText('storeyinfra.com  ·  +91 98640 66898  ·  Karun Roongta', {
    x: 0.5, y: 7.05, w: 12.33, h: 0.3,
    align: 'center',
    fontFace: 'Calibri', fontSize: 11, color: color, italic: true,
  });
}

function title(slide, text, y = 0.5, color = DARK) {
  slide.addText(text, {
    x: 0.6, y, w: 12.13, h: 0.85,
    fontFace: 'Georgia', fontSize: 36, color, bold: true,
  });
}

function subhead(slide, text, y = 1.3, color = '6B6B6B') {
  slide.addText(text, {
    x: 0.6, y, w: 12.13, h: 0.5,
    fontFace: 'Calibri', fontSize: 18, color, italic: true,
  });
}

// ── Slide 1 — Title ─────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: TERRACOTTA };
  logo(s, 5.85, 1.4, 1.6);
  s.addText('STOREY', {
    x: 0, y: 3.3, w: 13.33, h: 1.1,
    align: 'center',
    fontFace: 'Impact', fontSize: 96, color: WHITE, charSpacing: 24, bold: true,
  });
  s.addText('Site-operations app for construction contractors in NE India.', {
    x: 0, y: 4.6, w: 13.33, h: 0.5,
    align: 'center',
    fontFace: 'Georgia', fontSize: 24, color: SAND, italic: true,
  });
  s.addText('storeyinfra.com', {
    x: 0, y: 5.3, w: 13.33, h: 0.4,
    align: 'center',
    fontFace: 'Calibri', fontSize: 18, color: SAND,
  });
  s.addText('Karun Roongta  ·  +91 98640 66898', {
    x: 0, y: 6.7, w: 13.33, h: 0.3,
    align: 'center',
    fontFace: 'Calibri', fontSize: 14, color: SAND, italic: true,
  });
}

// ── Slide 2 — The problem ────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  title(s, 'The problem every contractor knows');
  subhead(s, 'Today\'s site = three apps + paper + ₹ leaking everywhere.');

  const pains = [
    ['📱', 'WhatsApp groups',          'Attendance, photos, status updates — all buried in chat'],
    ['📓', 'Paper diaries',            'Supervisors write daily logs; nobody can find them next month'],
    ['💼', 'Tally',                    'Tracks money. Does nothing for site operations.'],
    ['📊', 'Three Excel sheets',       'Material, labour, expenses — out of sync within a week'],
    ['👥', 'Sub-contractor disputes',  '"You promised me 5 lakh." "I said 4." No paper trail.'],
    ['🧱', 'Material leakage',         'Cement walks off site. Nobody knows where it went.'],
  ];

  pains.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.3, y = 2.1 + row * 1.5;
    s.addShape('roundRect', { x, y, w: 6.0, h: 1.3, fill: { color: SAND }, line: { color: SAND }, rectRadius: 0.12 });
    s.addText(p[0], { x: x + 0.2, y: y + 0.25, w: 0.8, h: 0.8, fontSize: 36, align: 'center', valign: 'middle' });
    s.addText(p[1], { x: x + 1.0, y: y + 0.18, w: 4.8, h: 0.5, fontFace: 'Georgia', fontSize: 18, color: TERRACOTTA, bold: true });
    s.addText(p[2], { x: x + 1.0, y: y + 0.65, w: 4.8, h: 0.6, fontFace: 'Calibri', fontSize: 13, color: DARK });
  });

  footer(s, DARK);
}

// ── Slide 3 — Solution overview ──────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  title(s, 'One app. Three layers. Mobile-first.');
  subhead(s, 'Built for the daily reality of construction in NE India.');

  const layers = [
    [TERRACOTTA, 'DAILY OPS',            'Attendance · Daily logs with photos · Tasks · Materials · Expenses', 'On the supervisor\'s phone, offline-ready'],
    [AMBER,      'SUB-CONTRACTORS',      'Onboard · Pay · Track scope · Printable Work Order PDF',           'Stops disputes before they start (mid-June)'],
    [GREEN,      'YOUR DATA, YOUR DRIVE','Daily backup to YOUR Google Drive — like Tally\'s data folder',     'Better than Tally because it\'s also cloud + mobile + multi-user'],
  ];

  layers.forEach((l, i) => {
    const y = 2.3 + i * 1.55;
    s.addShape('rect', { x: 0.6, y, w: 0.18, h: 1.3, fill: { color: l[0] }, line: { color: l[0] } });
    s.addText(l[1], { x: 0.95, y: y + 0.05, w: 4.0, h: 0.5, fontFace: 'Arial Black', fontSize: 18, color: l[0], charSpacing: 4, bold: true });
    s.addText(l[2], { x: 0.95, y: y + 0.5, w: 11.5, h: 0.5, fontFace: 'Georgia', fontSize: 16, color: DARK, bold: true });
    s.addText(l[3], { x: 0.95, y: y + 0.95, w: 11.5, h: 0.4, fontFace: 'Calibri', fontSize: 13, color: '6B6B6B', italic: true });
  });

  footer(s, DARK);
}

// ── Slide 4 — Live right now (v1.1.6) ───────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: SAND };
  title(s, 'Live right now', 0.5, TERRACOTTA);
  subhead(s, 'v1.1.6 · Android + web · 12 contractors testing today', 1.3, DARK);

  const features = [
    ['Attendance',     'Mark workers on site, offline-ready'],
    ['Daily Logs',     'Photos with date-time stamp burned in'],
    ['Tasks',          'Cascade work from contractor → site_manager → supervisor → worker'],
    ['Materials',      'Stock, receipts, transfers (4-stage), append-only ledger'],
    ['Equipment',      'Issue + return non-consumable assets, maintenance log'],
    ['Expenses',       'Site spend with receipts + approval flow'],
    ['Reports',        'Per-site summaries — labour, materials, expenses, budget'],
    ['Multi-tenant',   'Strict data isolation via Postgres RLS, audited twice'],
  ];

  features.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.3, y = 2.1 + row * 1.05;
    s.addShape('roundRect', { x, y, w: 6.0, h: 0.9, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.1 });
    s.addShape('ellipse', { x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.55, fill: { color: SAGE }, line: { color: SAGE } });
    s.addText('✓', { x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.55, align: 'center', valign: 'middle', fontFace: 'Arial Black', fontSize: 22, color: WHITE, bold: true });
    s.addText(f[0], { x: x + 0.9, y: y + 0.1, w: 5.0, h: 0.4, fontFace: 'Arial Black', fontSize: 16, color: TERRACOTTA, charSpacing: 3, bold: true });
    s.addText(f[1], { x: x + 0.9, y: y + 0.5, w: 5.0, h: 0.4, fontFace: 'Calibri', fontSize: 13, color: DARK });
  });

  footer(s, DARK);
}

// ── Slide 5 — Coming in 4 weeks (v1.2) ──────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  title(s, 'Coming in 4 weeks (v1.2)', 0.5, AMBER);
  subhead(s, 'Driven by contractor feedback — shapes what we build by mid-June.');

  const v12 = [
    ['📄', 'Printable Work Order PDF',     'One-click signed sub-contractor agreement.\nStops scope disputes cold.'],
    ['📊', 'Material Budget vs Actual',    'Plan material per site at setup.\nSee deviation live as material flows.'],
    ['👷', 'Sub-contractor Module',        'Onboard with scope + agreed amount.\nPayment ledger. Variation orders.'],
    ['☁️', 'Your Data, Your Drive',       'Daily backup to YOUR Google Drive.\nTally-style data sovereignty + cloud.'],
  ];

  v12.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.3, y = 2.1 + row * 2.4;
    s.addShape('roundRect', { x, y, w: 6.0, h: 2.1, fill: { color: 'FEF3C7' }, line: { color: AMBER }, rectRadius: 0.14 });
    s.addText(f[0], { x: x + 0.3, y: y + 0.4, w: 1.0, h: 1.0, fontSize: 56, align: 'center', valign: 'middle' });
    s.addText(f[1], { x: x + 1.4, y: y + 0.35, w: 4.5, h: 0.5, fontFace: 'Georgia', fontSize: 19, color: AMBER, bold: true });
    s.addText(f[2], { x: x + 1.4, y: y + 0.85, w: 4.5, h: 1.1, fontFace: 'Calibri', fontSize: 14, color: DARK, lineSpacingMultiple: 1.2 });
  });

  footer(s, DARK);
}

// ── Slide 6 — Tally comparison ──────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  title(s, 'Better than Tally — on the dimension contractors care about');
  subhead(s, 'Tally still owns your books. Storey owns your operations.');

  const rows = [
    ['',                       'Tally',                'Storey'],
    ['Tracks',                 'Money + bookkeeping',  'Operations + people + material'],
    ['Where data lives',       'On one PC\'s hard drive', 'Your Google Drive + cloud + phones'],
    ['Mobile',                 'Limited',              'Mobile-first'],
    ['Multi-user',             'Tally Server (₹extra)', 'Built in, RLS-enforced'],
    ['Offline use',            'Yes (desktop)',        'Yes (mobile + auto-sync)'],
    ['Sub-contractor PDF',     'Manual / not built-in','One-click signed Work Order (mid-June)'],
    ['Audit trail',            'Limited',              'Append-only ledger across all modules'],
  ];

  const startX = 0.6, startY = 2.3, w = [3.4, 4.4, 4.5], rowH = 0.5;
  rows.forEach((r, i) => {
    const y = startY + i * rowH;
    const bg = i === 0 ? TERRACOTTA : (i % 2 === 0 ? 'F9FAFB' : WHITE);
    const color = i === 0 ? WHITE : DARK;
    const bold = i === 0;
    let x = startX;
    r.forEach((cell, ci) => {
      s.addShape('rect', { x, y, w: w[ci], h: rowH, fill: { color: bg }, line: { color: 'E5E7EB', width: 0.5 } });
      s.addText(cell, {
        x: x + 0.15, y, w: w[ci] - 0.3, h: rowH,
        valign: 'middle',
        fontFace: 'Calibri', fontSize: ci === 0 ? 14 : 13,
        color, bold: bold || ci === 0,
      });
      x += w[ci];
    });
  });

  footer(s, DARK);
}

// ── Slide 7 — Who uses it ───────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  title(s, 'Built for the way your sites actually work');
  subhead(s, 'Each role sees what they need — nothing more, nothing less.');

  const roles = [
    [TERRACOTTA, 'CONTRACTOR',    'Sees everything. Approves expenses + transfers + sub-contractors.',  'Karun · runs the company'],
    [SAGE,       'SITE MANAGER',  'Reviews + confirms attendance, logs, tasks, transfers daily.',       'Pranab · oversees 1-3 sites'],
    [AMBER,      'SUPERVISOR',    'On-site. Marks attendance, files logs, allocates material, issues equipment.', 'Devraaj · runs the day'],
    ['2563EB',   'STORE KEEPER',  'Stock, receipts (GRN), transfers between sites.',                   'Biplab · the warehouse'],
  ];

  roles.forEach((r, i) => {
    const y = 2.1 + i * 1.15;
    s.addShape('ellipse', { x: 0.6, y: y + 0.1, w: 0.85, h: 0.85, fill: { color: r[0] }, line: { color: r[0] } });
    s.addText(r[1].slice(0, 1), {
      x: 0.6, y: y + 0.1, w: 0.85, h: 0.85, align: 'center', valign: 'middle',
      fontFace: 'Arial Black', fontSize: 36, color: WHITE, bold: true,
    });
    s.addText(r[1], { x: 1.65, y: y + 0.1, w: 4.0, h: 0.4, fontFace: 'Arial Black', fontSize: 18, color: r[0], charSpacing: 3, bold: true });
    s.addText(r[3], { x: 1.65, y: y + 0.55, w: 4.0, h: 0.4, fontFace: 'Calibri', fontSize: 12, color: '6B6B6B', italic: true });
    s.addText(r[2], { x: 5.8, y: y + 0.2, w: 7.0, h: 0.8, fontFace: 'Calibri', fontSize: 14, color: DARK });
  });

  footer(s, DARK);
}

// ── Slide 8 — Trust signals ──────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: SAND };
  title(s, 'Why trust this build today', 0.5, TERRACOTTA);
  subhead(s, 'Real users · real engineering · real data discipline.', 1.3, DARK);

  const points = [
    ['12',     'beta testers',           'on closed Play Store testing right now'],
    ['171',    'commits in 48 days',     'all on main, deployed continuously'],
    ['30',     'database migrations',    'with 17 commits explicitly hardening RLS'],
    ['2',      'independent RLS audits', 'multi-tenant isolation verified twice'],
    ['100 %',  'data-sovereignty path',  'mid-June: daily backup to YOUR Drive'],
    ['0',      'tenants leak data',      'Postgres RLS + role helpers, not app-level guards'],
  ];

  points.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.2, y = 2.3 + row * 2.0;
    s.addShape('roundRect', { x, y, w: 4.0, h: 1.7, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.14 });
    s.addText(p[0], { x: x + 0.15, y: y + 0.1, w: 3.7, h: 0.9, fontFace: 'Impact', fontSize: 64, color: TERRACOTTA, bold: true, align: 'left' });
    s.addText(p[1], { x: x + 0.15, y: y + 0.95, w: 3.7, h: 0.35, fontFace: 'Arial Black', fontSize: 13, color: DARK, charSpacing: 2, bold: true });
    s.addText(p[2], { x: x + 0.15, y: y + 1.25, w: 3.7, h: 0.4, fontFace: 'Calibri', fontSize: 11, color: '6B6B6B' });
  });

  footer(s, DARK);
}

// ── Slide 9 — Pricing ───────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  title(s, 'Pricing — honest and pilot-friendly');
  subhead(s, 'Free 30-day trial. Final pricing locks when 5 contractors are paying.');

  const tiers = [
    [SAGE,     'STOREY SOLO',  '₹500 / month',     'Single-site specialists\nElectricians, plumbers, masons running their own jobs', 'Self-onboard · minimal support'],
    [TERRACOTTA,'STOREY PRO',  '₹2,000 – 5,000 / month / site', 'Main contractors with site teams\nMulti-site, multi-role, full features', 'Manual onboarding · quarterly advisory call'],
    [DARK,     'STOREY ENTERPRISE', 'Custom', 'Tier-2 builders, govt-tied work, consortiums\nDedicated DB, premium support', '(when MRR justifies the engineering)'],
  ];

  tiers.forEach((t, i) => {
    const x = 0.6 + i * 4.2;
    s.addShape('roundRect', { x, y: 2.1, w: 4.0, h: 4.5, fill: { color: WHITE }, line: { color: t[0], width: 2 }, rectRadius: 0.16 });
    s.addShape('rect', { x, y: 2.1, w: 4.0, h: 0.5, fill: { color: t[0] }, line: { color: t[0] } });
    s.addText(t[1], { x: x + 0.15, y: 2.1, w: 3.7, h: 0.5, valign: 'middle', fontFace: 'Arial Black', fontSize: 14, color: WHITE, charSpacing: 3, bold: true });
    s.addText(t[2], { x: x + 0.2, y: 2.8, w: 3.6, h: 0.6, fontFace: 'Georgia', fontSize: 22, color: t[0], bold: true });
    s.addText(t[3], { x: x + 0.2, y: 3.6, w: 3.6, h: 1.5, fontFace: 'Calibri', fontSize: 13, color: DARK, lineSpacingMultiple: 1.3 });
    s.addText(t[4], { x: x + 0.2, y: 5.5, w: 3.6, h: 0.8, fontFace: 'Calibri', fontSize: 11, color: '6B6B6B', italic: true, lineSpacingMultiple: 1.3 });
  });

  footer(s, DARK);
}

// ── Slide 10 — How to start ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: TERRACOTTA };
  title(s, 'Start a free trial in 3 steps', 0.5, WHITE);
  subhead(s, '5 minutes from "yes" to "first daily log filed."', 1.3, SAND);

  const steps = [
    ['1', 'WhatsApp your Gmail to +91 98640 66898',  'Send the Gmail you use on your Android phone.\nThat\'s the only credential we need.'],
    ['2', 'I add you to Play Store closed testing',  'Within an hour, you get an opt-in link.\nTap it on your phone → "Become a tester".'],
    ['3', 'Install · sign in · use it',              'Open Play Store → search "Storey" → install.\nGoogle sign-in is one tap.'],
  ];

  steps.forEach((st, i) => {
    const y = 2.3 + i * 1.4;
    s.addShape('roundRect', { x: 0.6, y, w: 12.13, h: 1.2, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.16 });
    s.addShape('ellipse', { x: 0.85, y: y + 0.27, w: 0.65, h: 0.65, fill: { color: TERRACOTTA }, line: { color: TERRACOTTA } });
    s.addText(st[0], { x: 0.85, y: y + 0.27, w: 0.65, h: 0.65, align: 'center', valign: 'middle', fontFace: 'Impact', fontSize: 28, color: WHITE, bold: true });
    s.addText(st[1], { x: 1.7, y: y + 0.2, w: 10.3, h: 0.5, fontFace: 'Georgia', fontSize: 18, color: TERRACOTTA, bold: true });
    s.addText(st[2], { x: 1.7, y: y + 0.65, w: 10.3, h: 0.55, fontFace: 'Calibri', fontSize: 13, color: DARK, lineSpacingMultiple: 1.2 });
  });

  footer(s, SAND);
}

// ── Slide 11 — Founder slide ────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  title(s, 'Built by a contractor, for contractors');

  s.addText('Karun Roongta', {
    x: 0.6, y: 1.5, w: 12.13, h: 0.7,
    fontFace: 'Georgia', fontSize: 38, color: TERRACOTTA, bold: true,
  });
  s.addText('Founder · Storey Infra · Guwahati, Assam', {
    x: 0.6, y: 2.2, w: 12.13, h: 0.5,
    fontFace: 'Calibri', fontSize: 18, color: '6B6B6B', italic: true,
  });

  s.addText(
    '"I built Storey because I needed it on my own sites and nothing existed that didn\'t try to make us look like a Bangalore office.\n\n' +
    'If anything breaks, you message me directly on WhatsApp and I reply within 24 hours, usually within one.\n\n' +
    'If you want a feature, you tell me. If 3 contractors ask for the same thing, it\'s in the next release.\n\n' +
    'That\'s how it works while I\'m building this."',
    {
      x: 0.6, y: 3.1, w: 12.13, h: 3.0,
      fontFace: 'Georgia', fontSize: 19, color: DARK, italic: true, lineSpacingMultiple: 1.3,
    }
  );

  footer(s, DARK);
}

// ── Slide 12 — Closing ──────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: TERRACOTTA };
  logo(s, 6.0, 1.7, 1.3);
  s.addText('STOREY', {
    x: 0, y: 3.3, w: 13.33, h: 0.9,
    align: 'center',
    fontFace: 'Impact', fontSize: 72, color: WHITE, charSpacing: 20, bold: true,
  });
  s.addText('Try free at storeyinfra.com', {
    x: 0, y: 4.4, w: 13.33, h: 0.6,
    align: 'center',
    fontFace: 'Georgia', fontSize: 30, color: SAND, italic: true,
  });
  s.addShape('roundRect', { x: 3.5, y: 5.4, w: 6.33, h: 0.9, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.4 });
  s.addText('WhatsApp Karun  ·  +91 98640 66898', {
    x: 3.5, y: 5.4, w: 6.33, h: 0.9,
    align: 'center', valign: 'middle',
    fontFace: 'Georgia', fontSize: 22, color: TERRACOTTA, bold: true,
  });
}

pptx.writeFile({ fileName: OUT })
  .then(() => console.log('PPTX written:', OUT))
  .catch((e) => { console.error(e); process.exit(1); });
