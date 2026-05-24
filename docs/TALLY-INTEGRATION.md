# Storey — Tally Integration Plan
### Feature Spec + Technical Blueprint + GTM Strategy
*Created 2026-05-24 · Owner: Karun*

> **Why this document exists:**
> Every contractor we sell to has Tally running in their office.
> Their accountant re-enters every Storey transaction into Tally by hand.
> This document is the plan to eliminate that permanently.

---

## The Problem We Are Solving

```
TODAY (without integration)

  Site Manager logs material receipt in Storey       ~2 min
           ↓
  Accountant re-enters same receipt in Tally         ~5 min
  as Purchase Voucher
           ↓
  Site Manager logs site expense in Storey           ~1 min
           ↓
  Accountant re-enters expense in Tally              ~4 min
  as Payment Voucher
           ↓
  Month-end: accountant reconciles both systems      ~3–4 hours
           ↓
  Errors found. Arguments. Delays in GST filing.

TOTAL WASTED TIME: 3–6 hours/week per contractor
TOTAL WASTED COST: ₹3,000–8,000/month (accountant time)
```

```
TOMORROW (with Storey–Tally integration)

  Site Manager logs receipt in Storey                ~2 min
           ↓
  Accountant clicks "Export to Tally"                ~30 sec
  Downloads XML, imports in Tally
  OR: Storey pushes directly (v2.0)                  ~0 sec
           ↓
  Done. Tally is up to date. GST data is clean.

TOTAL SAVED: 3–6 hours/week
STOREY COST: ₹2,999/month (Basic)
NET ROI: 10–20x
```

---

## Tally in the NE-India Contractor Market

- **~95%** of contractors in this market use Tally ERP 9 or TallyPrime
- Tally is the first software any Indian business buys — before WhatsApp Business, before anything else
- Their CA insists on it for GST filing
- The accountant is a separate person from the site manager — the accountant does NOT use Storey
- The site manager does NOT use Tally
- **These two worlds never talk to each other. We bridge them.**

---

## Data Mapping: Storey → Tally

| Storey Entity | Tally Equivalent | Tally Object Type |
|---|---|---|
| Material Receipt | Purchase Voucher | Voucher |
| Site Expense | Payment Voucher | Voucher |
| Vendor / Supplier | Party Ledger | Ledger (Sundry Creditors) |
| Site | Cost Centre | Cost Centre |
| Material (stock item) | Stock Item | Inventory Item |
| Expense Category (Fuel, Transport…) | Expense Ledger | Ledger (Indirect Expenses) |
| Subcontractor Payment | Payment Voucher | Voucher |
| Work Order | Purchase Order | Voucher |
| GST on receipt | Input CGST + Input SGST / IGST | Ledger (Duties & Taxes) |

---

## Three Versions — Build in Order

---

### VERSION 1 — XML Export *(v1.3, build first)*
**Time to build: 2–3 days**
**Gate: BASIC and above**

**How it works:**
1. Contractor goes to Reports → Export → Tally
2. Selects date range + site
3. Storey generates a `.xml` file in Tally import format
4. Accountant opens Tally: `Gateway of Tally → Import Data → Vouchers`
5. Selects the file. Done. All transactions appear in Tally.

**What gets exported:**
- Material Receipts → Purchase Vouchers
- Site Expenses → Payment Vouchers

**What does NOT get exported in v1.3:**
- Subcontractor payments (v1.4)
- Stock item masters (v1.4)
- GST split (v2.1)

**Limitations:**
- Manual step (download + import) — not real-time
- Works with Tally ERP 9 and TallyPrime
- Does NOT require Tally to be running or network-accessible
- Zero IT setup required from contractor

---

### VERSION 2 — Live Push *(v2.0, after first 10 paying contractors)*
**Time to build: 5–7 days**
**Gate: ADVANCED and above**

**How it works:**
1. Contractor's accountant installs a small **TallyBridge connector** on the office PC
2. TallyBridge opens a secure tunnel to Storey (like ngrok, but purpose-built)
3. When a receipt is approved in Storey → auto-pushed to Tally within 60 seconds
4. Status shows in Storey: ✅ Synced / ⏳ Pending / ❌ Failed

**Architecture:**
```
Storey (cloud)
    ↓ HTTPS webhook
TallyBridge (Windows service on contractor PC)
    ↓ HTTP POST to localhost:9000
TallyPrime (running on same machine)
```

**TallyBridge is a lightweight Windows app:**
- Built in Node.js (pkg → .exe) or Electron
- Runs as a system tray app / Windows service
- Polls Storey API for pending sync jobs
- Pushes to Tally HTTP API (port 9000)
- ~3MB download, installs in 30 seconds

**What gets synced in v2.0:**
- Material Receipts → Purchase Vouchers (real-time on approval)
- Site Expenses → Payment Vouchers (real-time on approval)
- Sync log visible in Storey (what synced, when, any errors)

---

### VERSION 2.1 — GST-Aware Export *(add-on to v2.0)*
**Time to build: 2–3 days**
**Gate: ADVANCED and above**

**How it works:**
- Contractor sets GST rate per material category (0%, 5%, 12%, 18%, 28%)
- Storey auto-splits: base amount + CGST + SGST (or IGST for interstate)
- Export includes separate ledger lines for each GST component
- Tally GSTR-2B reconciliation works cleanly

**This is the feature their CA will love most.**

---

## The Mapping Problem (Critical — Solve This First)

The hard part is not generating XML.
The hard part is **name matching.**

Storey has: `vendor = "Ramesh Traders"`
Tally has: `ledger = "Ramesh Traders Pvt Ltd"` (accountant created it with full name)

If names don't match exactly → Tally creates a **duplicate ledger** on import.
Duplicate ledgers = accounting chaos = accountant blames Storey.

**Solution: One-time Tally Mapping screen in Settings**

```
Settings → Integrations → Tally Setup

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VENDOR → TALLY PARTY LEDGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ramesh Traders          →  Ramesh Traders Pvt Ltd
Gupta Cement Works      →  Gupta Cement & Hardware
Local Transport Co.     →  Transport Expenses (General)
[+ Add vendor mapping]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SITE → TALLY COST CENTRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NH-27 Bridge Work       →  NH-27 (Site A)
Dimapur Warehouse       →  Dimapur Store
[+ Add site mapping]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPENSE CATEGORY → TALLY LEDGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fuel                    →  Fuel & Conveyance
Transport               →  Transport Charges
Food & refreshment      →  Staff Welfare Expenses
Equipment rental        →  Machinery Hire Charges
Repairs & maintenance   →  Repairs & Maintenance
Labour advance          →  Labour Advance (Current Asset)
Office / admin          →  Office Expenses
Miscellaneous           →  Miscellaneous Expenses

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PURCHASE LEDGER (for material receipts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Default purchase ledger:  Purchase @ 18% GST
(Contractor types this exactly as it appears in their Tally)
```

**Contractor fills this once. Storey remembers it forever.
Every export uses the exact ledger names from their Tally.**

---

## Tally XML Format Reference

### Purchase Voucher (Material Receipt)

```xml
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>BuildNE Constructions</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Purchase" ACTION="Create"
                   OBJVIEW="Invoice Voucher View">
            <DATE>20260524</DATE>
            <NARRATION>Steel bars 10mm - 500 kg · NH-27 Bridge Site</NARRATION>
            <VOUCHERTYPENAME>Purchase</VOUCHERTYPENAME>
            <PARTYLEDGERNAME>Ramesh Traders Pvt Ltd</PARTYLEDGERNAME>
            <COSTCENTRENAME>NH-27 (Site A)</COSTCENTRENAME>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Purchase @ 18% GST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-84746</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Input CGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-7627</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Input SGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-7627</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Ramesh Traders Pvt Ltd</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>100000</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>
```

### Payment Voucher (Site Expense)

```xml
<TALLYMESSAGE xmlns:UDF="TallyUDF">
  <VOUCHER VCHTYPE="Payment" ACTION="Create">
    <DATE>20260524</DATE>
    <NARRATION>Diesel for JCB - NH-27 Bridge Site</NARRATION>
    <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
    <COSTCENTRENAME>NH-27 (Site A)</COSTCENTRENAME>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>Fuel &amp; Conveyance</LEDGERNAME>
      <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
      <AMOUNT>-3500</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>Cash</LEDGERNAME>
      <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
      <AMOUNT>3500</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
  </VOUCHER>
</TALLYMESSAGE>
```

---

## Database Schema Changes

```sql
-- Migration: 20260524000001_tally_mapping.sql

-- Store Tally mapping per tenant
CREATE TABLE tally_mappings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type     text NOT NULL
    CHECK (entity_type IN ('vendor', 'site', 'expense_category', 'purchase_ledger')),
  storey_id       text,         -- uuid for vendor/site, or category string
  storey_label    text NOT NULL, -- display name in Storey
  tally_name      text NOT NULL, -- exact ledger/cost centre name in Tally
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE (tenant_id, entity_type, storey_id)
);

-- Default purchase ledger (text, not FK — just a string the contractor types)
ALTER TABLE tenants
  ADD COLUMN tally_purchase_ledger  text,  -- e.g. "Purchase @ 18% GST"
  ADD COLUMN tally_company_name     text,  -- Tally company name (for XML header)
  ADD COLUMN tally_cash_ledger      text DEFAULT 'Cash';  -- for expense vouchers

-- RLS
ALTER TABLE tally_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_own" ON tally_mappings
  USING (tenant_id = my_tenant_id());
```

---

## File Structure

```
src/
  pages/
    settings/
      TallySetup.jsx          ← Mapping UI (vendor/site/category)
  lib/
    tallyExport.js            ← XML generation functions
      generatePurchaseVoucher(receipt, mapping)
      generatePaymentVoucher(expense, mapping)
      generateTallyXML(vouchers[])
      downloadTallyXML(xml, filename)
  components/
    tally/
      TallyExportButton.jsx   ← "Export to Tally" button with date-range picker
      TallySyncStatus.jsx     ← (v2.0) synced/pending/failed indicator

supabase/
  migrations/
    20260524000001_tally_mapping.sql
  functions/
    tally-sync/               ← (v2.0) webhook endpoint for TallyBridge
```

---

## UI Flows

### Flow 1: First-time Setup (one-time, 5 minutes)

```
Contractor opens Settings → Integrations → Tally
         ↓
Sees: "Connect Storey to Tally"
      [Set up Tally mapping]
         ↓
Step 1: Enter your Tally company name
        "BuildNE Constructions" [text input]
         ↓
Step 2: Map your vendors to Tally ledgers
        (pre-filled with Storey vendor names,
         contractor types matching Tally name)
         ↓
Step 3: Map your sites to Tally cost centres
         ↓
Step 4: Map expense categories to Tally ledgers
        (sensible defaults pre-filled — contractor
         only changes what's different)
         ↓
Step 5: Set your purchase ledger name
        "Purchase @ 18% GST" [text input]
         ↓
[Save mapping] → "Tally setup complete ✓"
```

### Flow 2: Monthly Export (30 seconds, every month)

```
Accountant asks contractor: "Send me the bills for May"
         ↓
Contractor opens Reports → Tally Export
         ↓
Selects: Date range: 01 May – 31 May
         Site: All sites (or one specific site)
         ↓
[Download Tally XML] → storey-tally-may-2026.xml
         ↓
Accountant: Tally → Import Data → Vouchers
           → selects file → Import
         ↓
All receipts and expenses appear as vouchers in Tally
Tally GST reports update automatically
```

### Flow 3: Live Sync (v2.0)

```
Receipt approved in Storey
         ↓ (within 60 seconds)
TallyBridge on office PC receives push
         ↓
HTTP POST to localhost:9000
         ↓
Voucher appears in Tally
         ↓
Storey shows: ✅ Synced to Tally (2 min ago)
```

---

## Paywall Placement

```
FREE      →  No Tally integration. Not shown.
BASIC     →  ✅ Tally XML Export (manual import)
              Shows in: Reports → Tally Export
              Shows in: Settings → Integrations → Tally Setup
ADVANCED  →  ✅ Tally XML Export
              ✅ Live Tally Sync (v2.0, after build)
              ✅ GST-split export (v2.1)
ENTERPRISE→  ✅ All above + custom ledger mapping support
              ✅ Priority setup call with Karun
```

**Upgrade trigger copy (when FREE user finds the locked feature):**

> *"Your accountant is entering these bills in Tally by hand.
> Upgrade to Basic and send them a file instead.
> Saves 3 hours a month. Costs ₹2,999."*

---

## Go-to-Market for This Feature

### The One-Liner
*"Storey talks directly to Tally. Your accountant never re-enters a bill again."*

### Who to Show It To
Not the contractor. **Show it to the accountant.**

The accountant is the person suffering. The accountant will tell the contractor to pay for it. This is called bottom-up SaaS — the end-user (accountant) pulls the decision-maker (contractor) into paying.

**Script for contractor:**
> *"Ask your accountant how long he spends entering site bills into Tally every month.
> Then show him Storey. He'll ask you to subscribe."*

**Script for accountant (if you get access):**
> *"I know you re-enter everything from the site register into Tally.
> Storey generates a Tally XML file — one import, everything's in.
> Takes 30 seconds instead of 3 hours."*

### When to Launch This Feature
- Build v1.3 XML Export in Days 61–75 of the 90-day plan
- Demo it to Arun's accountant directly (not just Arun)
- Use it as the upgrade lever for the final 15 days of the Founding Offer

---

## Build Plan

### v1.3 — XML Export (Days 61–63, 3 days)

| Day | Task | Done = |
|---|---|---|
| Day 61 | Migration: `tally_mappings` table + `tally_*` columns on tenants | Migration applied, no regressions |
| Day 61 | `src/lib/tallyExport.js` — XML generation for Purchase + Payment vouchers | Unit test: generates valid XML for a sample receipt |
| Day 62 | `TallySetup.jsx` — mapping UI (5-step setup flow, mobile-friendly) | Contractor can complete mapping in under 5 minutes |
| Day 62 | Wire mappings into XML generator — uses saved Tally names | Export uses contractor's actual Tally ledger names |
| Day 63 | `TallyExportButton.jsx` — date range picker + download | Button downloads valid XML file |
| Day 63 | Gate: hide behind BASIC plan | FREE users see upgrade prompt |
| Day 63 | Test end-to-end: export XML → import in Tally ERP 9 + TallyPrime | Vouchers appear correctly in both versions |

### v2.0 — Live Sync (Post Day 90, 7 days)

| Day | Task | Done = |
|---|---|---|
| v2.0-1 | TallyBridge Windows app — Node.js service, polls Storey API | App runs as system tray on Windows |
| v2.0-2 | `tally-sync` Edge Function — queues pending vouchers | Queue persists across Tally downtime |
| v2.0-3 | TallyBridge pushes to Tally HTTP API (port 9000) | Vouchers appear in Tally within 60s of approval |
| v2.0-4 | Sync status in Storey UI (✅/⏳/❌ per voucher) | Contractor can see what synced |
| v2.0-5 | Error handling: Tally offline → queue → retry when back online | No data loss when Tally is closed |
| v2.0-6 | Gate: ADVANCED and above | Clear upgrade prompt for BASIC users |
| v2.0-7 | Installer + setup guide (PDF + video) | Non-technical accountant can install in 10 min |

### v2.1 — GST-Aware (Post v2.0, 3 days)

| Day | Task | Done = |
|---|---|---|
| v2.1-1 | GST rate per material category in Settings | Contractor sets 0/5/12/18/28% per category |
| v2.1-2 | Inter-state flag per vendor (IGST vs CGST+SGST) | Correct GST type used per transaction |
| v2.1-3 | Split amounts in XML: base + CGST + SGST/IGST ledger lines | CA verifies Tally GSTR-2B matches Storey data |

---

## Risks + Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Ledger name mismatch creates duplicates in Tally | High (if mapping is skipped) | Make mapping mandatory before first export; validate on save |
| Contractor uses different Tally company for each site | Medium | Allow per-site company name override in mapping |
| Accountant imports same XML twice (duplicate vouchers) | Medium | Add `GUID` to each voucher in XML; Tally deduplicates by GUID |
| TallyPrime API port 9000 blocked by firewall | Medium (v2.0) | Fallback to XML export; document firewall exception in setup guide |
| Contractor's Tally is a cracked version (no support) | High (reality of market) | XML import works on all versions; live sync needs genuine Tally |
| Accountant refuses to change workflow | Low | Pitch the accountant directly, not the contractor |

---

## Success Metrics

| Metric | Target |
|---|---|
| % of paying contractors with Tally mapping set up | ≥ 60% within 30 days of feature launch |
| % of Basic subscribers using Tally export monthly | ≥ 40% |
| Tally integration as reason for upgrade (self-reported) | ≥ 30% of Basic upgrades cite it |
| Accountant NPS (informal) | 4.5+/5 |
| Support tickets about duplicate ledgers | < 5% of users who export |

---

## Competitive Advantage

No other construction SaaS in NE-India (or India at this price point) integrates with Tally.

- **ProcureSense**: No Tally integration
- **BuildSupply**: Enterprise only, ₹15,000+/month, manual export only
- **Hippo CMMS**: No Tally
- **FieldEZ**: No Tally
- **Custom Excel sheets**: No integration anywhere

This is a **defensible moat** at the BASIC price point. A contractor who has set up Tally mapping and is running clean books will never switch to a competitor — the switching cost is too high.

---

## Revision History

| Date | Change |
|---|---|
| 2026-05-24 | Document created — v1 |

---

*This document lives at `docs/TALLY-INTEGRATION.md`.*
*Update it as each version ships. Do not start v2.0 before v1.3 is in real use.*
