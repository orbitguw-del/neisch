/* ============================================================================
   EOSS DEALER CREDIT-NOTE TOOL
   Run:  node creditnote.cjs
   Edit the CONFIG block below per dealer file, then run. Output = a summary
   .xlsx next to the input + totals printed to the screen.
   (Lives in C:\consne so it can find the xlsx library installed there.)
   ============================================================================ */
const X = require('C:/consne/node_modules/xlsx');
const path = require('path');

// ─── CONFIG — edit this per dealer file ──────────────────────────────────────
const CONFIG = {
  inputFile: 'C:/Users/model/Downloads/SQ High Street.xlsx',
  sheet: 'ALL',
  headerRow: 1,                 // 1-based row number that holds the column names

  // map STANDARD fields -> the exact column header in this file (or null)
  map: {
    dealer:         'STORE NAME',
    brand:          'CAT',
    qty:            'Sale Qty',
    type:           'TYPE',                  // SALE / RTV
    mrp:            'MRP - D2R',
    netSale:        'Net Sales- D2R',        // net (discounted) sale value; or null
    discount:       null,                    // absolute discount/unit; used if netSale null
    costPct:        'Cost % - D2R',          // normal cost % (if file has it)
    revisedCostPct: 'Revised Cost %- D2R',   // EOSS reduced cost % (if file has it)
    cost:           null,                    // absolute cost/unit column (if file has it)
  },

  rtvValues: ['RTV'],            // type values treated as returns (clawback)
  valuesArePerLine: true,        // SQ D2R cols are already qty-applied + signed.
                                 // For raw files (MRP=unit price, Qty separate) set false.

  // brand scheme — used when the file has NO cost%/revisedCost% columns
  defaults: {
    mode: 'A',                   // 'A' margin-protection | 'B' 50/50 discount share
    base: 'NRP',                 // 'NRP' | 'MRP'
    netMarginPct: null,          // e.g. 0.40  -> derive cost (NEEDS your margin rule)
    eossDiscountPct: 0.30,       // used to derive netSale if not in file
  },
  brands: {
    // 'W':       { mode:'A', netMarginPct: 0.?? },
    // 'AURELIA': { mode:'A', netMarginPct: 0.?? },
  },

  gstSlabs: [{ upTo: 2500, rate: 0.05 }, { upTo: Infinity, rate: 0.18 }],
};

// ─── engine ──────────────────────────────────────────────────────────────────
const num = v => { const n = Number(v); return isFinite(n) ? n : 0; };
const gstRate = price => CONFIG.gstSlabs.find(s => Math.abs(price) <= s.upTo).rate;

function deriveRates(brand, mrp) {
  // PLACEHOLDER for files with no cost% columns (e.g. W / Aurelia).
  // Needs your net-margin + GST-slab "extra margin" rule. Simple first-cut:
  const b = { ...CONFIG.defaults, ...(CONFIG.brands[brand] || {}) };
  if (b.netMarginPct == null) return null;          // not configured yet
  const costPct = 1 - b.netMarginPct;               // gross cost% (pre GST-slab adj — TODO)
  const revisedCostPct = costPct;                   // TODO: apply reduced-EOSS-margin rule
  return { costPct, revisedCostPct, eossDiscountPct: b.eossDiscountPct };
}

function run() {
  const wb = X.readFile(CONFIG.inputFile);
  const aoa = X.utils.sheet_to_json(wb.Sheets[CONFIG.sheet], { header: 1, blankrows: false, defval: null });
  const H = aoa[CONFIG.headerRow - 1];
  const col = name => (name == null ? -1 : H.indexOf(name));
  const m = {}; for (const k in CONFIG.map) m[k] = col(CONFIG.map[k]);

  const byDealer = {}, byBrand = {}, byType = {};
  let total = 0, nrows = 0, derivedMissing = 0;

  for (let r = CONFIG.headerRow; r < aoa.length; r++) {
    const row = aoa[r];
    if (m.mrp < 0 || row[m.mrp] == null) continue;
    const mrp = num(row[m.mrp]);
    const qty = m.qty >= 0 ? num(row[m.qty]) : 1;
    const dealer = (m.dealer >= 0 ? row[m.dealer] : 'Dealer') || 'Dealer';
    const brand = (m.brand >= 0 ? row[m.brand] : 'ALL') || 'ALL';
    const type = ((m.type >= 0 ? row[m.type] : 'SALE') || 'SALE').toString().trim().toUpperCase();

    // cost rates: from file if present, else derive from brand margin
    let costPct = m.costPct >= 0 ? num(row[m.costPct]) : null;
    let revisedCostPct = m.revisedCostPct >= 0 ? num(row[m.revisedCostPct]) : null;
    let netSale = m.netSale >= 0 ? num(row[m.netSale]) : null;

    if (costPct == null || revisedCostPct == null) {
      const d = deriveRates(brand, mrp);
      if (!d) { derivedMissing++; continue; }       // brand margin not configured
      costPct = costPct ?? d.costPct;
      revisedCostPct = revisedCostPct ?? d.revisedCostPct;
      if (netSale == null) {
        const disc = m.discount >= 0 ? num(row[m.discount]) : mrp * d.eossDiscountPct;
        netSale = mrp - disc;
      }
    }
    if (netSale == null) netSale = mrp;

    // CN = original cost - revised cost   (mode A)
    let cn = mrp * costPct - netSale * revisedCostPct;
    if (!CONFIG.valuesArePerLine) cn *= qty;        // raw files: per-unit × qty

    nrows++; total += cn;
    (byDealer[dealer] = byDealer[dealer] || { cn: 0, qty: 0 }).cn += cn;
    byDealer[dealer].qty += qty;
    (byBrand[brand] = byBrand[brand] || { cn: 0, qty: 0 }).cn += cn;
    byBrand[brand].qty += qty;
    const tk = CONFIG.rtvValues.includes(type) ? 'RTV' : 'SALE';
    (byType[tk] = byType[tk] || { cn: 0, qty: 0 }).cn += cn;
    byType[tk].qty += qty;
  }

  // ── print ──
  const R = n => 'Rs ' + n.toFixed(2);
  console.log('File   :', path.basename(CONFIG.inputFile), '| rows:', nrows);
  if (derivedMissing) console.log('  (skipped', derivedMissing, 'rows — brand margin not configured for derive path)');
  console.log('TOTAL CREDIT NOTE:', R(total));
  console.log('\nBy type :'); for (const t in byType) console.log('  ', t, R(byType[t].cn), '| qty', byType[t].qty);
  console.log('\nBy dealer:'); for (const d in byDealer) console.log('  ', d, '->', R(byDealer[d].cn));
  console.log('\nBy brand:'); Object.entries(byBrand).sort((a, b) => b[1].cn - a[1].cn)
    .forEach(([k, v]) => console.log('  ', String(k).padEnd(10), R(v.cn).padStart(14), '| qty', v.qty));

  // ── write summary xlsx ──
  const out = [['EOSS Dealer Credit-Note Summary'], ['File', path.basename(CONFIG.inputFile)],
    ['Rows', nrows], ['TOTAL CREDIT NOTE (Rs)', +total.toFixed(2)], [],
    ['By type', 'CN (Rs)', 'Qty']];
  for (const t in byType) out.push([t, +byType[t].cn.toFixed(2), byType[t].qty]);
  out.push([], ['By dealer', 'CN (Rs)', 'Qty']);
  for (const d in byDealer) out.push([d, +byDealer[d].cn.toFixed(2), byDealer[d].qty]);
  out.push([], ['By brand', 'CN (Rs)', 'Qty']);
  Object.entries(byBrand).sort((a, b) => b[1].cn - a[1].cn).forEach(([k, v]) => out.push([k, +v.cn.toFixed(2), v.qty]));
  const ws = X.utils.aoa_to_sheet(out); ws['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 8 }];
  const owb = X.utils.book_new(); X.utils.book_append_sheet(owb, ws, 'CN Summary');
  const outFile = CONFIG.inputFile.replace(/\.xlsx?$/i, '') + ' - CN Summary.xlsx';
  X.writeFile(owb, outFile);
  console.log('\nSaved:', outFile);
}
run();
