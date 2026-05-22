/**
 * Storey-Infra Pitch Deck — Builders & Contractors
 * Design: Warm Terracotta palette · Georgia + Calibri · Vertical bar motif
 */

const pptxgen = require("pptxgenjs");
const React   = require("react");
const RDS     = require("react-dom/server");
const sharp   = require("sharp");
const {
  FaBuilding, FaHardHat, FaBoxes, FaClipboardList, FaChartBar,
  FaUsers, FaTools, FaTruck, FaCheckCircle, FaMobileAlt,
  FaExclamationTriangle, FaTimesCircle, FaQuestionCircle,
  FaArrowRight, FaRocket, FaMapMarkerAlt, FaCalendarCheck,
  FaFileInvoice, FaBell, FaCamera, FaQrcode, FaMoneyBillWave,
  FaWhatsapp, FaStar, FaShieldAlt, FaCloud
} = require("react-icons/fa");

// ── COLOUR PALETTE ────────────────────────────────────────────────────────────
const C = {
  terra:   "B85042",   // terracotta primary
  terDark: "8C3A2E",   // darker terracotta for shadows
  dark:    "1E293B",   // dark slate
  darkMid: "2D3748",   // mid-dark
  sand:    "FAF7F2",   // off-white background
  sand2:   "F0EDE7",   // slightly darker sand for cards
  sand3:   "E2DDD7",   // even darker sand for borders
  white:   "FFFFFF",
  charco:  "2D3748",   // body text
  muted:   "64748B",   // muted text
  sage:    "A7BEAE",   // accent sage
  amber:   "D97706",   // amber for highlights
  green:   "059669",   // emerald
  slate:   "475569",   // medium slate
};

// ── ICON HELPER ───────────────────────────────────────────────────────────────
async function ico(Icon, color = C.white, size = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Icon, { color: `#${color}`, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ── SHADOW FACTORY (fresh object each time to avoid pptxgenjs mutation bug) ───
const sh  = () => ({ type: "outer", blur: 8,  offset: 2, angle: 135, color: "000000", opacity: 0.12 });
const shS = () => ({ type: "outer", blur: 4,  offset: 1, angle: 135, color: "000000", opacity: 0.08 });
const shL = () => ({ type: "outer", blur: 14, offset: 3, angle: 135, color: "000000", opacity: 0.16 });

// ── ADD LEFT-SIDE VERTICAL BAR MOTIF (3 bars, like the logo) ─────────────────
function addLogoMotif(slide, opts = {}) {
  const { x = 0.22, y = 1.1, barW = 0.08, gap = 0.07, opacity = 0.35 } = opts;
  const heights = [0.55, 0.85, 1.15];
  heights.forEach((h, i) => {
    const bx = x + i * (barW + gap);
    const by = y + (heights[2] - h);
    slide.addShape("rect", { x: bx, y: by, w: barW, h, fill: { color: C.terra, transparency: Math.round(opacity * 100) }, line: { type: "none" } });
  });
}

// ── SECTION ACCENT BAR (top edge colour strip) ────────────────────────────────
function addTopBar(slide, color = C.terra, h = 0.06) {
  slide.addShape("rect", { x: 0, y: 0, w: 10, h, fill: { color }, line: { type: "none" } });
}

// ── LEFT ACCENT STRIPE (full-height) ─────────────────────────────────────────
function addLeftStripe(slide, color = C.terra, w = 0.18) {
  slide.addShape("rect", { x: 0, y: 0, w, h: 5.625, fill: { color }, line: { type: "none" } });
}

// ── FEATURE CARD ─────────────────────────────────────────────────────────────
async function addFeatureCard(slide, opts) {
  const { x, y, w = 2.9, h = 1.55, icon, iconColor = C.terra, title, body, bg = C.white } = opts;
  slide.addShape("rect", { x, y, w, h, fill: { color: bg }, line: { color: C.sand3, pt: 1 }, shadow: shS() });
  const icoCircX = x + 0.18;
  const icoCircY = y + 0.18;
  slide.addShape("oval", { x: icoCircX, y: icoCircY, w: 0.42, h: 0.42, fill: { color: C.terra, transparency: 85 }, line: { type: "none" } });
  const icoData = await ico(icon, iconColor);
  slide.addImage({ data: icoData, x: icoCircX + 0.07, y: icoCircY + 0.07, w: 0.28, h: 0.28 });
  slide.addText(title, { x: x + 0.7, y: y + 0.18, w: w - 0.82, h: 0.32, fontFace: "Georgia", fontSize: 11, bold: true, color: C.charco, margin: 0 });
  slide.addText(body,  { x: x + 0.18, y: y + 0.68, w: w - 0.3,  h: 0.78, fontFace: "Calibri", fontSize: 9.5, color: C.muted, margin: 0, wrap: true });
}

// ── STAT CALLOUT ─────────────────────────────────────────────────────────────
function addStat(slide, x, y, number, label) {
  slide.addText(number, { x, y,       w: 2.2, h: 0.72, fontFace: "Georgia", fontSize: 40, bold: true, color: C.terra, align: "center", margin: 0 });
  slide.addText(label,  { x, y: y + 0.7, w: 2.2, h: 0.38, fontFace: "Calibri", fontSize: 10, color: C.muted, align: "center", margin: 0 });
}

// ─────────────────────────────────────────────────────────────────────────────
async function buildDeck() {
  const pres = new pptxgen();
  pres.layout  = "LAYOUT_16x9";
  pres.title   = "Storey – Construction, organised.";
  pres.subject = "Pitch Deck for Builders & Contractors";
  pres.author  = "Storey Infra";

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 1 — TITLE (dark)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };

    // Full-height terracotta left panel
    s.addShape("rect", { x: 0, y: 0, w: 3.6, h: 5.625, fill: { color: C.terra }, line: { type: "none" } });

    // 3-bar logo mark inside panel
    const bars = [{ h: 1.1, y: 2.6 }, { h: 1.65, y: 2.05 }, { h: 2.2, y: 1.5 }];
    bars.forEach(({ h, y }, i) => {
      s.addShape("rect", { x: 0.42 + i * 0.52, y, w: 0.34, h, fill: { color: C.white, transparency: 25 }, line: { type: "none" } });
    });
    s.addText("STOREY", { x: 0.22, y: 4.0, w: 3.16, h: 0.55, fontFace: "Georgia", fontSize: 26, bold: true, color: C.white, align: "center", charSpacing: 8, margin: 0 });
    s.addText("storeyinfra.com", { x: 0.22, y: 4.6, w: 3.16, h: 0.3, fontFace: "Calibri", fontSize: 9, color: C.white, align: "center", transparency: 40, margin: 0 });

    // Right content
    s.addText("Construction,\norganised.", {
      x: 4.1, y: 1.2, w: 5.5, h: 1.8,
      fontFace: "Georgia", fontSize: 46, bold: true, color: C.white, align: "left", margin: 0
    });
    s.addText("The all-in-one site management platform built for\nIndian builders and contractors.", {
      x: 4.1, y: 3.15, w: 5.5, h: 0.8,
      fontFace: "Calibri", fontSize: 15, color: C.sand2, align: "left", margin: 0
    });

    // CTA pill
    s.addShape("rect", { x: 4.1, y: 4.15, w: 2.2, h: 0.5, fill: { color: C.white }, line: { type: "none" }, rectRadius: 0.08 });
    s.addText("Get Started Free", { x: 4.1, y: 4.15, w: 2.2, h: 0.5, fontFace: "Calibri", fontSize: 12, bold: true, color: C.terra, align: "center", margin: 0 });

    // Web + App tags
    s.addText("🌐 Web  ·  📱 Android App  ·  ☁️ Cloud", {
      x: 4.1, y: 4.85, w: 5.0, h: 0.3,
      fontFace: "Calibri", fontSize: 10, color: C.sand3, align: "left", margin: 0
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — THE PROBLEM (sand bg)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.sand };
    addTopBar(s, C.terra, 0.07);

    s.addText("The Problem", { x: 0.5, y: 0.25, w: 9, h: 0.45, fontFace: "Georgia", fontSize: 11, bold: true, color: C.terra, align: "left", margin: 0, charSpacing: 2 });
    s.addText("Managing construction sites is still stuck in 2005", {
      x: 0.5, y: 0.7, w: 9, h: 0.55,
      fontFace: "Georgia", fontSize: 26, bold: true, color: C.charco, align: "left", margin: 0
    });

    const problems = [
      { icon: FaClipboardList, title: "Paper registers & WhatsApp chaos", body: "Attendance is marked on paper. Materials are tracked in WhatsApp groups. Nothing matches at month-end." },
      { icon: FaExclamationTriangle, title: "Zero visibility across sites", body: "Contractors manage 3–10 sites but can't see what's happening in real time. They find out about problems days later." },
      { icon: FaMoneyBillWave, title: "Budget overruns go unnoticed", body: "Material costs spiral because no one is tracking usage vs. budget. Theft and wastage are invisible until audits." },
    ];

    for (let i = 0; i < 3; i++) {
      const { icon, title, body } = problems[i];
      const x = 0.4 + i * 3.1;
      // Red-tinted card
      s.addShape("rect", { x, y: 1.52, w: 2.95, h: 3.5, fill: { color: "FEF2F2" }, line: { color: "FECACA", pt: 1 }, shadow: shS() });
      // Icon circle
      s.addShape("oval", { x: x + 0.2, y: 1.7, w: 0.5, h: 0.5, fill: { color: C.terra }, line: { type: "none" } });
      const icoD = await ico(icon, C.white);
      s.addImage({ data: icoD, x: x + 0.28, y: 1.78, w: 0.34, h: 0.34 });
      s.addText(title, { x: x + 0.2, y: 2.35, w: 2.55, h: 0.6, fontFace: "Georgia", fontSize: 12, bold: true, color: C.charco, margin: 0, wrap: true });
      s.addText(body,  { x: x + 0.2, y: 3.08, w: 2.55, h: 1.7,  fontFace: "Calibri", fontSize: 10, color: C.muted, margin: 0, wrap: true });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 3 — INTRODUCING STOREY (terracotta dark bg)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.terra };

    // Dark overlay panel right
    s.addShape("rect", { x: 5.5, y: 0, w: 4.5, h: 5.625, fill: { color: C.dark, transparency: 15 }, line: { type: "none" } });

    s.addText("Introducing", { x: 0.55, y: 0.7, w: 4.8, h: 0.4, fontFace: "Calibri", fontSize: 14, color: C.white, margin: 0, transparency: 25 });
    s.addText("STOREY", { x: 0.55, y: 1.1, w: 4.8, h: 1.1, fontFace: "Georgia", fontSize: 64, bold: true, color: C.white, charSpacing: 12, margin: 0 });
    s.addText("Construction, organised.", { x: 0.55, y: 2.25, w: 4.8, h: 0.45, fontFace: "Georgia", fontSize: 18, italic: true, color: C.white, margin: 0 });
    s.addText("One app for your entire construction business —\nsites, workers, materials, daily logs, reports\nand your whole team. On web and Android.", {
      x: 0.55, y: 2.9, w: 4.8, h: 1.4,
      fontFace: "Calibri", fontSize: 13, color: C.white, margin: 0, wrap: true
    });

    // Right column — key numbers
    const stats = [
      { n: "10+", l: "Modules out of the box" },
      { n: "5",   l: "User roles, all in one system" },
      { n: "∞",   l: "Sites you can manage" },
    ];
    stats.forEach(({ n, l }, i) => {
      const y = 0.9 + i * 1.5;
      s.addText(n, { x: 5.8, y, w: 4.0, h: 0.85, fontFace: "Georgia", fontSize: 54, bold: true, color: C.white, align: "center", margin: 0 });
      s.addText(l, { x: 5.8, y: y + 0.85, w: 4.0, h: 0.38, fontFace: "Calibri", fontSize: 11, color: C.white, align: "center", margin: 0, transparency: 25 });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 4 — CURRENT FEATURES 6-GRID (sand)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.sand };
    addTopBar(s, C.terra, 0.07);

    s.addText("What's in Storey Today", {
      x: 0.5, y: 0.22, w: 9, h: 0.5,
      fontFace: "Georgia", fontSize: 24, bold: true, color: C.charco, margin: 0
    });
    s.addText("Everything a contractor needs — live, production-ready, on web and mobile.", {
      x: 0.5, y: 0.72, w: 9, h: 0.3,
      fontFace: "Calibri", fontSize: 11, color: C.muted, margin: 0
    });

    const features = [
      { icon: FaMapMarkerAlt, title: "Multi-Site Management",   body: "Manage unlimited sites from one dashboard. Drill into any site for full detail." },
      { icon: FaHardHat,      title: "Worker Registry",        body: "Maintain worker profiles, skills, trade type and assignment across sites." },
      { icon: FaCalendarCheck,title: "Daily Attendance",       body: "Supervisors mark attendance on their phone. Contractor sees it instantly." },
      { icon: FaBoxes,        title: "Materials & Inventory",  body: "GRN receipts, inventory levels, material ledger — every item tracked end to end." },
      { icon: FaTruck,        title: "Inter-Site Transfers",   body: "Record cement, steel or any material moving between your sites in seconds." },
      { icon: FaClipboardList,title: "Daily Logs",             body: "Short daily updates from site supervisors. Progress visible without phone calls." },
      { icon: FaTools,        title: "Equipment & Assets",     body: "Track machinery, tools and assets assigned to each site with status." },
      { icon: FaChartBar,     title: "Reports & Analytics",    body: "Monthly spend, material usage vs. budget, attendance summaries — one click." },
      { icon: FaUsers,        title: "Team & Role Management", body: "Invite managers, supervisors, store keepers. Each role sees exactly what they need." },
    ];

    const cols = 3, rows = 3;
    const cw = 2.95, ch = 1.35, gx = 0.12, gy = 0.1;
    const startX = 0.27, startY = 1.15;

    for (let i = 0; i < features.length; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const fx  = startX + col * (cw + gx);
      const fy  = startY + row * (ch + gy);
      await addFeatureCard(s, { x: fx, y: fy, w: cw, h: ch, ...features[i] });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 5 — WHO USES STOREY (dark)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    addLeftStripe(s, C.terra, 0.22);

    s.addText("Built for your whole team", {
      x: 0.6, y: 0.35, w: 9.0, h: 0.52,
      fontFace: "Georgia", fontSize: 26, bold: true, color: C.white, margin: 0
    });
    s.addText("5 roles, one system. Each person sees only what they need.", {
      x: 0.6, y: 0.88, w: 9.0, h: 0.3,
      fontFace: "Calibri", fontSize: 12, color: C.sand3, margin: 0
    });

    const roles = [
      { emoji: "🏢", role: "Contractor",    color: C.terra,  pts: ["Full dashboard across all sites", "Financial reports & budget tracking", "Team management & invites", "Monthly & cost reports"] },
      { emoji: "📍", role: "Site Manager",  color: "0D9488", pts: ["Site-level overview & detail", "Approve material receipts", "Daily log review", "Worker & attendance view"] },
      { emoji: "🦺", role: "Supervisor",    color: "7C3AED", pts: ["Mark daily attendance", "Write daily site logs", "View workers on their site", "Access materials list"] },
      { emoji: "🗄️", role: "Store Keeper",  color: "0369A1", pts: ["Record GRN / material receipts", "Manage inventory levels", "Log inter-site transfers", "Track equipment assets"] },
    ];

    for (let i = 0; i < roles.length; i++) {
      const { emoji, role, color, pts } = roles[i];
      const x = 0.55 + i * 2.35;
      s.addShape("rect", { x, y: 1.35, w: 2.2, h: 3.85, fill: { color: C.darkMid }, line: { color: color, pt: 2 }, shadow: sh() });
      // Colour top accent strip
      s.addShape("rect", { x, y: 1.35, w: 2.2, h: 0.08, fill: { color }, line: { type: "none" } });
      s.addText(emoji, { x, y: 1.5, w: 2.2, h: 0.5, fontFace: "Calibri", fontSize: 28, align: "center", margin: 0 });
      s.addText(role,  { x: x + 0.12, y: 2.05, w: 1.96, h: 0.38, fontFace: "Georgia", fontSize: 13, bold: true, color: C.white, align: "center", margin: 0 });

      const bulletTexts = pts.map((t, j) => ({
        text: t,
        options: { bullet: true, breakLine: j < pts.length - 1, fontSize: 9.5, color: C.sand2, fontFace: "Calibri" }
      }));
      s.addText(bulletTexts, { x: x + 0.14, y: 2.55, w: 1.92, h: 2.5, margin: 0, paraSpaceAfter: 4 });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 6 — HOW IT WORKS (sand)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.sand };
    addTopBar(s, C.terra, 0.07);

    s.addText("Up and running in under 10 minutes", {
      x: 0.5, y: 0.22, w: 9, h: 0.5,
      fontFace: "Georgia", fontSize: 24, bold: true, color: C.charco, margin: 0
    });

    const steps = [
      { n: "01", title: "Register your company",  body: "Enter your company name and email — your account is ready instantly. No credit card required." },
      { n: "02", title: "Add your sites",          body: "Create each site in seconds with a name and address. Add as many sites as you manage." },
      { n: "03", title: "Invite your team",        body: "Send email invites to your site managers, supervisors and store keepers. They join in one click." },
      { n: "04", title: "Start tracking",          body: "Your team logs materials, marks attendance and writes daily updates. You see everything live." },
    ];

    // Connector line
    s.addShape("rect", { x: 0.95, y: 2.82, w: 8.1, h: 0.05, fill: { color: C.sand3 }, line: { type: "none" } });

    for (let i = 0; i < 4; i++) {
      const { n, title, body } = steps[i];
      const x = 0.42 + i * 2.3;

      // Step card
      s.addShape("rect", { x, y: 1.12, w: 2.1, h: 3.95, fill: { color: C.white }, line: { color: C.sand3, pt: 1 }, shadow: shS() });

      // Number circle
      s.addShape("oval", { x: x + 0.6, y: 2.55, w: 0.88, h: 0.88, fill: { color: C.terra }, line: { type: "none" } });
      s.addText(n, { x: x + 0.6, y: 2.55, w: 0.88, h: 0.88, fontFace: "Georgia", fontSize: 18, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

      s.addText(title, { x: x + 0.14, y: 1.3, w: 1.82, h: 0.7, fontFace: "Georgia", fontSize: 12, bold: true, color: C.charco, margin: 0, wrap: true });
      s.addText(body,  { x: x + 0.14, y: 3.6, w: 1.82, h: 1.35, fontFace: "Calibri", fontSize: 9.5, color: C.muted, margin: 0, wrap: true });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 7 — MATERIALS & INVENTORY deep-dive (sand)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.sand };
    addTopBar(s, C.terra, 0.07);

    // Left content
    s.addText("Materials & Inventory", {
      x: 0.5, y: 0.22, w: 5.0, h: 0.45,
      fontFace: "Georgia", fontSize: 22, bold: true, color: C.charco, margin: 0
    });
    s.addText("Complete end-to-end tracking for every material on every site.", {
      x: 0.5, y: 0.68, w: 5.0, h: 0.3,
      fontFace: "Calibri", fontSize: 11, color: C.muted, margin: 0
    });

    const matFeatures = [
      { icon: FaFileInvoice, title: "GRN / Material Receipts",   body: "Log every delivery with supplier, quantity, and date. Full inward register maintained automatically." },
      { icon: FaBoxes,       title: "Live Inventory Levels",     body: "Real-time stock per material per site. Alerts when levels run low." },
      { icon: FaTruck,       title: "Inter-Site Transfers",      body: "Transfer cement, steel, pipes between your sites. Both inventories update instantly." },
      { icon: FaClipboardList, title: "Material Ledger",        body: "Full transaction history per material — receipts, usage, transfers, all in one place." },
    ];

    for (let i = 0; i < 4; i++) {
      const { icon, title, body } = matFeatures[i];
      await addFeatureCard(s, { x: 0.42, y: 1.08 + i * 1.1, w: 4.8, h: 1.0, icon, title, body });
    }

    // Right stats panel
    s.addShape("rect", { x: 5.5, y: 0.3, w: 4.15, h: 5.0, fill: { color: C.terra }, line: { type: "none" }, shadow: sh() });
    s.addText("The material problem\nis costing you", {
      x: 5.65, y: 0.55, w: 3.85, h: 0.9,
      fontFace: "Georgia", fontSize: 18, bold: true, color: C.white, margin: 0, wrap: true
    });

    const matStats = [
      { n: "15–20%", l: "of materials wasted on avg. construction project" },
      { n: "₹5–8L",  l: "lost per year on untracked material theft per site" },
      { n: "3 days", l: "wasted monthly reconciling paper records" },
    ];
    matStats.forEach(({ n, l }, i) => {
      const y = 1.65 + i * 1.3;
      s.addText(n, { x: 5.65, y, w: 3.85, h: 0.65, fontFace: "Georgia", fontSize: 30, bold: true, color: C.white, align: "center", margin: 0 });
      s.addText(l, { x: 5.65, y: y + 0.65, w: 3.85, h: 0.5, fontFace: "Calibri", fontSize: 10, color: C.white, align: "center", margin: 0, wrap: true });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 8 — ATTENDANCE & DAILY LOGS (sand)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.sand };
    addTopBar(s, C.terra, 0.07);

    s.addText("Attendance & Daily Logs", {
      x: 0.5, y: 0.22, w: 9, h: 0.45,
      fontFace: "Georgia", fontSize: 22, bold: true, color: C.charco, margin: 0
    });
    s.addText("Replace paper registers and WhatsApp updates with a 30-second daily workflow.", {
      x: 0.5, y: 0.68, w: 9, h: 0.3,
      fontFace: "Calibri", fontSize: 11, color: C.muted, margin: 0
    });

    // Two-column layout
    const leftFeats = [
      { icon: FaCalendarCheck, title: "One-tap attendance",     body: "Supervisors open the app, mark each worker present or absent. Done in under a minute." },
      { icon: FaUsers,         title: "Multi-site overview",    body: "Contractor sees attendance across ALL sites on one screen. No phone calls needed." },
      { icon: FaHardHat,       title: "Worker profiles",        body: "ID details, trade type, daily wage, join date — all in one place per worker." },
    ];
    const rightFeats = [
      { icon: FaClipboardList, title: "Daily progress logs",   body: "Supervisors write a short update on what was done. Contractors read it from anywhere." },
      { icon: FaChartBar,      title: "Attendance reports",    body: "Monthly summary per worker — days present, absent, overtime. Export-ready." },
      { icon: FaBuilding,      title: "Site assignments",      body: "Workers assigned to specific sites. Transfers recorded. History preserved." },
    ];

    for (let i = 0; i < 3; i++) {
      await addFeatureCard(s, { x: 0.42,  y: 1.12 + i * 1.42, w: 4.4, h: 1.3, ...leftFeats[i] });
      await addFeatureCard(s, { x: 5.12,  y: 1.12 + i * 1.42, w: 4.4, h: 1.3, ...rightFeats[i] });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 9 — REPORTS & ANALYTICS (dark)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    addLeftStripe(s, C.terra, 0.22);

    s.addText("Reports that actually show up", {
      x: 0.6, y: 0.3, w: 9.0, h: 0.52,
      fontFace: "Georgia", fontSize: 26, bold: true, color: C.white, margin: 0
    });
    s.addText("No spreadsheets. No phone calls. All data collected by your team — reports ready in one click.", {
      x: 0.6, y: 0.85, w: 8.8, h: 0.32,
      fontFace: "Calibri", fontSize: 12, color: C.sand3, margin: 0
    });

    // Bar chart showing fictitious but realistic monthly spend
    s.addChart("bar", [{
      name: "Monthly Material Spend (₹ Lakh)",
      labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
      values: [4.2, 5.8, 3.9, 6.1, 5.3, 4.7]
    }], {
      x: 0.5, y: 1.32, w: 5.8, h: 3.5, barDir: "col",
      chartColors: [C.terra],
      chartArea: { fill: { color: C.darkMid }, roundedCorners: true },
      catAxisLabelColor: C.sand3,
      valAxisLabelColor: C.sand3,
      valGridLine: { color: "334155", size: 0.5 },
      catGridLine: { style: "none" },
      showValue: true,
      dataLabelColor: C.white,
      dataLabelFontSize: 9,
      showLegend: false,
      valAxisNumFmt: "0.0",
    });

    const rpts = [
      { icon: FaChartBar,     title: "Monthly Budget Report",  body: "Actual spend vs. planned budget per month, per site. Spot overruns instantly." },
      { icon: FaBoxes,        title: "Material Usage Report",  body: "What arrived, what was used, what's left. Catch wastage before it compounds." },
      { icon: FaCalendarCheck,title: "Attendance Summary",     body: "Monthly attendance per worker per site. Input for payroll calculation." },
    ];
    for (let i = 0; i < 3; i++) {
      const y = 1.32 + i * 1.25;
      s.addShape("rect", { x: 6.6, y, w: 3.1, h: 1.15, fill: { color: C.darkMid }, line: { color: C.slate, pt: 1 }, shadow: shS() });
      s.addShape("oval", { x: 6.78, y: y + 0.3, w: 0.42, h: 0.42, fill: { color: C.terra }, line: { type: "none" } });
      const icoD = await ico(rpts[i].icon, C.white);
      s.addImage({ data: icoD, x: 6.86, y: y + 0.38, w: 0.26, h: 0.26 });
      s.addText(rpts[i].title, { x: 7.3, y: y + 0.24, w: 2.3, h: 0.35, fontFace: "Georgia", fontSize: 10.5, bold: true, color: C.white, margin: 0 });
      s.addText(rpts[i].body,  { x: 6.78, y: y + 0.65, w: 2.82, h: 0.45, fontFace: "Calibri", fontSize: 9, color: C.sand3, margin: 0, wrap: true });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 10 — UPCOMING FEATURES (sand)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.sand };
    addTopBar(s, C.terra, 0.07);

    s.addText("Coming Soon — The Roadmap", {
      x: 0.5, y: 0.22, w: 9, h: 0.45,
      fontFace: "Georgia", fontSize: 22, bold: true, color: C.charco, margin: 0
    });
    s.addText("We're building fast. Here's what's landing next.", {
      x: 0.5, y: 0.68, w: 9, h: 0.28,
      fontFace: "Calibri", fontSize: 11, color: C.muted, margin: 0
    });

    const upcoming = [
      { icon: FaCamera,       title: "Photo Attachments",        body: "Attach photos to daily logs, receipts, and site progress. Visual proof at your fingertips.", tag: "Q3 2025" },
      { icon: FaWhatsapp,     title: "WhatsApp Notifications",   body: "Get daily summaries and critical alerts directly on WhatsApp. No app needed for alerts.", tag: "Q3 2025" },
      { icon: FaQrcode,       title: "QR Code Material Scan",    body: "Scan QR tags on material bags and equipment. Instant receipt logging — no typing required.", tag: "Q3 2025" },
      { icon: FaMoneyBillWave,title: "Payroll & Labour Costs",   body: "Auto-calculate monthly wages from attendance records. Export payroll sheet in one click.", tag: "Q4 2025" },
      { icon: FaFileInvoice,  title: "Vendor Management",        body: "Maintain supplier profiles, track POs, and compare vendor pricing across sites.", tag: "Q4 2025" },
      { icon: FaRocket,       title: "iOS App",                  body: "Native iPhone app for all roles — same power as Android, optimised for iOS.", tag: "Q1 2026" },
    ];

    const cols = 3;
    const cw = 2.95, ch = 1.4, gx = 0.12, gy = 0.14;
    const startX = 0.27, startY = 1.05;

    for (let i = 0; i < upcoming.length; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const fx = startX + col * (cw + gx);
      const fy = startY + row * (ch + gy);
      const { icon, title, body, tag } = upcoming[i];

      s.addShape("rect", { x: fx, y: fy, w: cw, h: ch, fill: { color: C.white }, line: { color: C.sand3, pt: 1 }, shadow: shS() });

      // Tag pill
      const tagColor = tag.startsWith("Q3") ? "0D9488" : tag.startsWith("Q4") ? C.amber : "7C3AED";
      s.addShape("rect", { x: fx + cw - 0.82, y: fy + 0.1, w: 0.75, h: 0.22, fill: { color: tagColor }, line: { type: "none" } });
      s.addText(tag, { x: fx + cw - 0.82, y: fy + 0.1, w: 0.75, h: 0.22, fontFace: "Calibri", fontSize: 7, bold: true, color: C.white, align: "center", margin: 0 });

      // Icon
      s.addShape("oval", { x: fx + 0.18, y: fy + 0.18, w: 0.42, h: 0.42, fill: { color: C.terra, transparency: 85 }, line: { type: "none" } });
      const icoD = await ico(icon, C.terra);
      s.addImage({ data: icoD, x: fx + 0.25, y: fy + 0.25, w: 0.28, h: 0.28 });

      s.addText(title, { x: fx + 0.7,  y: fy + 0.18, w: cw - 1.55, h: 0.35, fontFace: "Georgia", fontSize: 11, bold: true, color: C.charco, margin: 0 });
      s.addText(body,  { x: fx + 0.18, y: fy + 0.68, w: cw - 0.3,  h: 0.65, fontFace: "Calibri", fontSize: 9.5, color: C.muted, margin: 0, wrap: true });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 11 — WHY STOREY (dark)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };
    addLeftStripe(s, C.terra, 0.22);

    s.addText("Why Storey wins", {
      x: 0.6, y: 0.3, w: 9.0, h: 0.52,
      fontFace: "Georgia", fontSize: 28, bold: true, color: C.white, margin: 0
    });

    const wins = [
      { icon: FaMobileAlt,   title: "Built for the field",       body: "Designed for site supervisors and store keepers who aren't tech-savvy. Works on any Android phone with basic internet. No training needed." },
      { icon: FaShieldAlt,   title: "Role-based access control", body: "Each user sees only what their role requires. A store keeper can't see financials. A supervisor can't see other sites. Data stays secure." },
      { icon: FaCloud,       title: "Cloud-first, always in sync", body: "All data stored securely in the cloud. Update on one phone — the contractor sees it in seconds. Works across sites, cities, and teams." },
      { icon: FaStar,        title: "Made for India",            body: "Hindi-friendly UI on the way. Priced for Indian SME contractors. Phone OTP login for workers without email. Indian support team." },
    ];

    for (let i = 0; i < 4; i++) {
      const { icon, title, body } = wins[i];
      const x = i < 2 ? 0.55 : 5.3;
      const y = i % 2 === 0 ? 1.1 : 3.1;
      s.addShape("rect", { x, y, w: 4.4, h: 1.85, fill: { color: C.darkMid }, line: { color: C.terra, pt: 1 }, shadow: sh() });
      s.addShape("oval", { x: x + 0.2, y: y + 0.2, w: 0.48, h: 0.48, fill: { color: C.terra }, line: { type: "none" } });
      const icoD = await ico(icon, C.white);
      s.addImage({ data: icoD, x: x + 0.28, y: y + 0.28, w: 0.32, h: 0.32 });
      s.addText(title, { x: x + 0.82, y: y + 0.2, w: 3.38, h: 0.42, fontFace: "Georgia", fontSize: 13, bold: true, color: C.white, margin: 0 });
      s.addText(body,  { x: x + 0.2,  y: y + 0.75, w: 4.0,  h: 1.0,  fontFace: "Calibri", fontSize: 10.5, color: C.sand3, margin: 0, wrap: true });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 12 — CTA / GET STARTED (terracotta dark)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };

    // Large terracotta panel right half
    s.addShape("rect", { x: 5.2, y: 0, w: 4.8, h: 5.625, fill: { color: C.terra }, line: { type: "none" } });

    // Left: contact / tagline
    s.addText("Ready to bring order\nto your sites?", {
      x: 0.55, y: 0.8, w: 4.5, h: 1.8,
      fontFace: "Georgia", fontSize: 30, bold: true, color: C.white, margin: 0
    });
    s.addText("Join builders and contractors who have\nalready moved their sites to Storey.", {
      x: 0.55, y: 2.7, w: 4.5, h: 0.7,
      fontFace: "Calibri", fontSize: 13, color: C.sand3, margin: 0
    });
    // Website
    s.addShape("rect", { x: 0.55, y: 3.6, w: 3.2, h: 0.52, fill: { color: C.white }, line: { type: "none" } });
    s.addText("🌐  storeyinfra.com", { x: 0.55, y: 3.6, w: 3.2, h: 0.52, fontFace: "Calibri", fontSize: 13, bold: true, color: C.terra, align: "center", margin: 0 });
    s.addText("📧  hello@storeyinfra.com", { x: 0.55, y: 4.25, w: 3.5, h: 0.35, fontFace: "Calibri", fontSize: 11, color: C.sand3, margin: 0 });

    // Right: 3 quick points
    s.addText("STOREY", { x: 5.35, y: 0.55, w: 4.4, h: 0.65, fontFace: "Georgia", fontSize: 36, bold: true, color: C.white, align: "center", charSpacing: 8, margin: 0 });
    s.addText("Construction, organised.", { x: 5.35, y: 1.22, w: 4.4, h: 0.35, fontFace: "Georgia", fontSize: 14, italic: true, color: C.white, align: "center", margin: 0 });

    const ctas = ["✅  Free to get started", "✅  No credit card required", "✅  Works on any Android phone", "✅  Your team onboards in minutes"];
    ctas.forEach((t, i) => {
      s.addText(t, {
        x: 5.4, y: 1.9 + i * 0.65, w: 4.2, h: 0.52,
        fontFace: "Calibri", fontSize: 13, color: C.white, margin: 0
      });
    });

    // Download pill
    s.addShape("rect", { x: 5.7, y: 4.65, w: 3.6, h: 0.55, fill: { color: C.white }, line: { type: "none" } });
    s.addText("📱  Download on Android", { x: 5.7, y: 4.65, w: 3.6, h: 0.55, fontFace: "Calibri", fontSize: 12, bold: true, color: C.terra, align: "center", margin: 0 });
  }

  // ── WRITE FILE ────────────────────────────────────────────────────────────
  const outPath = "C:\\consne\\storey-pitch-deck.pptx";
  await pres.writeFile({ fileName: outPath });
  console.log(`\n✅  Saved: ${outPath}`);
}

buildDeck().catch(err => { console.error(err); process.exit(1); });
