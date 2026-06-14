// Storey — Trial Users tracker (.xlsx). Uses the project's SheetJS (xlsx) lib.
const path = require('path');
const XLSX = require(path.join(process.cwd(), 'node_modules', 'xlsx'));

const wb = XLSX.utils.book_new();

// ── Sheet 1: Trial Tracker ────────────────────────────────────────────────────
const headers = [
  '#', 'Contact Name', 'Org / Firm', 'Type', 'Source', 'Phone (WhatsApp)',
  'Email', 'Status', 'Trial Start', 'Trial End (+3 mo)', 'Plan Trialing',
  'Sites', 'Last Touch', 'Next Step', 'Convert to (paid plan)', 'Notes',
];
const rows = [
  [1, 'Arun', '', 'Contractor', 'Family referral', '', '(awaiting Gmail)',
   'Active pilot', '', '', 'Pro', '', '', 'Confirm trial start date',
   'Pro 1-site / 3-site', 'Existing pilot — confirmed intent'],
  [2, '', '', 'Contractor', '', '', '', 'Target', '', '', '', '', '', '', '', ''],
  [3, '', '', 'Contractor', '', '', '', 'Target', '', '', '', '', '', '', '', ''],
  [4, '', '', 'Contractor', '', '', '', 'Target', '', '', '', '', '', '', '', ''],
  [5, '', '', 'Developer',  '', '', '', 'Target', '', '', '', '', '', '', '', ''],
  [6, '', '', '',           '', '', '', 'Target', '', '', '', '', '', '', '', ''],
  [7, '', '', '',           '', '', '', 'Target', '', '', '', '', '', '', '', ''],
];
const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
ws1['!cols'] = [
  { wch: 4 }, { wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 16 }, { wch: 18 },
  { wch: 24 }, { wch: 13 }, { wch: 12 }, { wch: 16 }, { wch: 13 }, { wch: 6 },
  { wch: 12 }, { wch: 24 }, { wch: 22 }, { wch: 32 },
];
ws1['!freeze'] = { xSplit: 0, ySplit: 1 }; // freeze header row (Excel honours on open)
XLSX.utils.book_append_sheet(wb, ws1, 'Trial Tracker');

// ── Sheet 2: Plans (reference) ────────────────────────────────────────────────
const plans = [
  ['Plan', '1 site / mo', '3 sites / mo', '1 site / yr', '3 sites / yr', 'Beyond 3 sites'],
  ['Free', '₹0', '—', '—', '—', '—'],
  ['Standard', '₹999', '₹2,499', '₹9,990', '₹24,990', '+₹799 / site'],
  ['Pro (full suite)', '₹1,999', '₹4,999', '₹19,990', '₹49,990', '+₹799 / site'],
  [],
  ['Trial', '3 months free → convert to a paid plan when the payment gateway is live.'],
  ['Billing', 'Annual = pay for 10 months (2 free). Monthly is the on-ramp; convert to annual when happy.'],
  ['Pro features', 'Budgeting, cost centres, sub-contractor + Work Order PDF (ship with v1.2).'],
];
const ws2 = XLSX.utils.aoa_to_sheet(plans);
ws2['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
XLSX.utils.book_append_sheet(wb, ws2, 'Plans');

// ── Sheet 3: Guide ────────────────────────────────────────────────────────────
const guide = [
  ['Storey — Trial Users Tracker'],
  [],
  ['Goal: line up 5 trial users on a 3-month free trial; convert them to paying when'],
  ['the payment gateway launches (Day-90 target: 5 paying contractors).'],
  [],
  ['How to use:'],
  ['1. Add each prospect as a row in "Trial Tracker".'],
  ['2. Move Status as they progress: Target -> Pitched -> Onboarded -> Active trial -> Converting -> Paying (or Passed).'],
  ['3. Trial Start = the day they go live. Trial End = Start + 3 months.'],
  ['4. "Convert to" = the paid plan you move them to when the gateway is live (see Plans sheet).'],
  [],
  ['Status values: Target | Pitched | Onboarded | Active trial | Converting | Paying | Passed'],
  [],
  ['Sources for prospects: see docs/PROSPECTS-NE-SOURCES.md (BAI Guwahati, CREDAI Assam, referrals).'],
  [],
  ['PRIVACY: keep this file OFF the public git repo — it holds contractor phones/emails (PII).'],
];
const ws3 = XLSX.utils.aoa_to_sheet(guide);
ws3['!cols'] = [{ wch: 110 }];
XLSX.utils.book_append_sheet(wb, ws3, 'Guide');

XLSX.writeFile(wb, 'C:\\consne\\storey-trial-users.xlsx');
console.log('wrote C:\\consne\\storey-trial-users.xlsx');
