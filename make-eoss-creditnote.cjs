// EOSS Dealer Credit-Note calculator (.xlsx) using the project's SheetJS.
// Credit note = (old cost to dealer, net GST) - (new cost from EOSS price & margin),
//   per unit x EOSS qty sold. new cost = NRP_new * (1 - margin); NRP_new = price (NRP)
//   or price/(1+GST) (MRP base). Negative credits optionally clamped to 0.
const path = require('path');
const XLSX = require(path.join(process.cwd(), 'node_modules', 'xlsx'));
const enc = (r, c) => XLSX.utils.encode_cell({ r, c }); // 0-indexed

const FIRST = 8, LAST = 27;            // Excel data rows (1-indexed) 8..27
const ws = {};
const set = (addr, v, opts = {}) => { ws[addr] = { ...opts, v: v }; };
// placeholder v:0 required — SheetJS 0.18.5 drops formula cells with no cached value; Excel recalcs on open
const setf = (addr, f) => { ws[addr] = { t: 'n', f, v: 0 }; };

// ── Title + declared block ─────────────────────────────────────────────────────
set('A1', 'EOSS — Dealer Credit-Note Calculator');
set('A2', 'EOSS Start:'); set('B2', '');           set('D2', 'EOSS End:'); set('E2', '');
set('A3', 'Margin %:');   set('B3', 0.30, { t: 'n', z: '0.0%' });
set('D3', 'Base (NRP/MRP):'); set('E3', 'NRP');
set('A4', 'Clamp negative credits to 0?'); set('B4', 'Yes');
set('A5', 'Credit note = (old cost net GST) − (new cost = NRP_new × (1 − margin)).  Margin is % of NRP/selling price.');
set('A6', 'NRP_new = price if Base=NRP, else price ÷ (1+GST) if Base=MRP.  GST% is per-line (col D), used only for MRP base.');

// ── Table header (row 7) ────────────────────────────────────────────────────────
const head = ['Dealer', 'SKU', 'Qty (EOSS)', 'GST %', 'Old cost/unit (net GST)',
  'New price/unit (per Base)', 'NRP new', 'New cost/unit (net)', 'Credit/unit', 'Line credit'];
head.forEach((h, c) => set(enc(6, c), h));

// ── Example row (row 8) — overwrite or delete ───────────────────────────────────
set('A8', 'Example Dealer'); set('B8', 'SKU-1'); set('C8', 10, { t: 'n' });
set('D8', '', { t: 'n' }); set('E8', 600, { t: 'n' }); set('F8', 800, { t: 'n' });

// ── Computed formula columns G..J for every data row ────────────────────────────
for (let R = FIRST; R <= LAST; R++) {
  setf(`G${R}`, `IF(F${R}="","",IF($E$3="MRP",F${R}/(1+D${R}),F${R}))`);
  setf(`H${R}`, `IF(G${R}="","",G${R}*(1-$B$3))`);
  setf(`I${R}`, `IF(H${R}="","",IF($B$4="Yes",MAX(0,E${R}-H${R}),E${R}-H${R}))`);
  setf(`J${R}`, `IF(I${R}="","",I${R}*C${R})`);
}

// ── Grand total (row 29) ────────────────────────────────────────────────────────
set('A29', 'TOTAL CREDIT NOTE');
setf('J29', `SUM(J${FIRST}:J${LAST})`);

// ── Per-dealer summary (cols L,M) ───────────────────────────────────────────────
set('L7', 'Dealer'); set('M7', 'Credit note (₹)');
for (let i = 0; i < 6; i++) {
  const R = 8 + i;
  set(`L${R}`, '');
  setf(`M${R}`, `IF(L${R}="","",SUMIF($A$${FIRST}:$A$${LAST},L${R},$J$${FIRST}:$J$${LAST}))`);
}
set('L15', 'Tip: type each dealer name in column L; their total credit note auto-sums.');

ws['!ref'] = `A1:M30`;
ws['!cols'] = [
  { wch: 16 }, { wch: 10 }, { wch: 11 }, { wch: 7 }, { wch: 22 }, { wch: 24 },
  { wch: 10 }, { wch: 18 }, { wch: 11 }, { wch: 12 }, { wch: 2 }, { wch: 18 }, { wch: 16 },
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Credit Note');
XLSX.writeFile(wb, 'C:\\consne\\eoss-dealer-creditnote.xlsx');
console.log('wrote C:\\consne\\eoss-dealer-creditnote.xlsx');

// ── sanity-check the math in JS (Excel computes the real cells on open) ──────────
const margin = 0.30, base = 'NRP';
function lineCredit({ qty, gst, oldCost, newPrice }) {
  const nrp = base === 'MRP' ? newPrice / (1 + (gst || 0)) : newPrice;
  const newCost = nrp * (1 - margin);
  const perUnit = Math.max(0, oldCost - newCost);
  return perUnit * qty;
}
console.log('example line credit (expect 400):', lineCredit({ qty: 10, gst: 0, oldCost: 600, newPrice: 800 }));
console.log('MRP example (896 incl 12%, expect 400):',
  (() => { const b='MRP'; const nrp=896/(1.12); const nc=nrp*(1-0.30); return Math.max(0,600-nc)*10; })());
