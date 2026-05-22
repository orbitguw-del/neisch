# Storey — financial projection + cost analysis
### 24-month month-wise outlook · CA handover document
*Prepared 2026-05-22 · For internal reference + CA / advisor briefing*

> ⚠️ **These are projections, not commitments.** All assumptions are
> stated explicitly so they can be challenged and revised. Re-baseline
> this document every quarter against actuals.

---

## Executive summary

| Metric | Month 0 (today) | Month 12 (May 2027) | Month 24 (May 2028) |
|---|---|---|---|
| Paying contractors | 0 | 25 | 70 |
| Total sites under management | 0 | 90 | 320 |
| MRR | ₹0 | ₹1,80,000 | ₹6,90,000 |
| Annualised revenue | ₹0 | ₹21.6 L | ₹82.8 L |
| Monthly operating cost | ₹6,000 | ₹1,20,000 | ₹3,40,000 |
| Monthly profit | -₹6,000 | +₹60,000 | +₹3,50,000 |
| Cumulative cashflow from operations | -₹40,000 | -₹2,80,000 | +₹13,50,000 |
| Team size | 1 | 2 | 4 |

**Cashflow-positive by Month 9-10** (Q1 FY27). Break-even on cumulative spend by **Month 18-19**. No external funding required to reach these milestones at base-case assumptions.

---

## Section 1 — Past costs (Apr 4 → May 22, 2026)

Real out-of-pocket spending so far. CA needs this to set up the opening balance sheet + capture pre-incorporation expenses for tax deduction.

| Category | Cost | Notes |
|---|---|---|
| Domain (storeyinfra.com, GoDaddy) | ₹1,500 | One-time renewal, annual basis |
| Supabase Pro (6-8 weeks active) | ₹4,000 | Started after free tier outgrown |
| Vercel Pro (4-6 weeks active) | ₹3,000 | Started after free tier limits |
| Resend (free tier so far) | ₹0 | Will activate paid tier at scale |
| Google Play Console (one-time) | ₹2,000 | Developer account fee |
| AI tooling subscriptions (Claude / GPT / Copilot) | ₹15,000 | ~4 months × ₹3,000-4,000/month |
| Test devices, mobile data | Already personally owned | Not separately attributable |
| Misc (fonts, design assets) | ₹0 | All open / free assets |
| **Total out-of-pocket dev cost so far** | **~₹25,000-30,000** | Spread over Apr-May 2026 |

**Imputed (replacement) development cost:**

If the work had been outsourced to a hired team:

| Role | Time | Market rate | Imputed cost |
|---|---|---|---|
| Senior full-stack developer | 4 months FT | ₹2.5-3 L/mo | ₹10-12 L |
| Capacitor / Android specialist | 1 month | ₹2 L/mo | ₹2 L |
| Postgres / RLS expert | 0.5 month | ₹3 L/mo | ₹1.5 L |
| UI/UX designer | 1 month | ₹1.5 L/mo | ₹1.5 L |
| QA / testing | 0.5 month | ₹1 L/mo | ₹0.5 L |
| **Total replacement cost** | | | **₹15-17 L** |

For book purposes the CA will likely **expense actual spend** rather than capitalise the imputed value. The imputed number is for IP valuation context (future fundraise / acquisition).

---

## Section 2 — Site size classification

To project revenue meaningfully, we classify customer sites by size + complexity. This taxonomy is for projection purposes; actual final pricing tiers may differ.

| Site size | Definition | Examples | Pricing tier (₹/site/month) |
|---|---|---|---|
| **Small** | Single-mistri / specialist trade / residential single-family / sub-contractor's own job | Electrician's wiring contract · Plumber's residential project · Small renovation | ₹500 - ₹1,000 |
| **Medium** | Mid-residential 2-3 floor · small commercial · small road work | 4-unit apartment · 2-floor commercial · 5-km rural road | ₹1,500 - ₹3,000 |
| **Large** | Commercial multi-floor · road extension · govt-tied project | Office building · 18-km highway extension · NH PWD project | ₹3,000 - ₹5,000 |
| **Enterprise** | Tier-2 builder projects · multi-acre · complex sub-contractor mix | Township phase · multi-acre commercial · large infra | ₹5,000 - ₹15,000 |

**Site size weighting evolves over the 24 months:**

| Period | Small | Medium | Large | Enterprise |
|---|---|---|---|---|
| Months 1-6 | 60% | 30% | 10% | 0% |
| Months 7-12 | 40% | 40% | 18% | 2% |
| Months 13-18 | 30% | 40% | 25% | 5% |
| Months 19-24 | 25% | 40% | 28% | 7% |

Rationale: early adopters are small specialist trades + small contractors who are willing to beta-test. As Storey matures and builds trust, larger contractors come in. By month 24, ~10% of sites are large or enterprise but contribute ~40% of revenue.

---

## Section 3 — Customer + site growth (24-month projection, base case)

### Customer count by month

| Month | Calendar | Paying customers (cumulative) | New this month | Churned this month |
|---|---|---|---|---|
| 1 | Jun 2026 | 0 | 0 | 0 |
| 2 | Jul 2026 | 1 (Arun) | 1 | 0 |
| 3 | Aug 2026 | 3 | 2 | 0 |
| 4 | Sep 2026 | 5 | 2 | 0 |
| 5 | Oct 2026 | 8 | 3 | 0 |
| 6 | Nov 2026 | 12 | 4 | 0 |
| 7 | Dec 2026 | 16 | 5 | 1 |
| 8 | Jan 2027 | 20 | 5 | 1 |
| 9 | Feb 2027 | 22 | 3 | 1 |
| 10 | Mar 2027 | 24 | 3 | 1 |
| 11 | Apr 2027 | 25 | 2 | 1 |
| 12 | May 2027 | 25 | 1 | 1 |
| 13 | Jun 2027 | 30 | 6 | 1 |
| 14 | Jul 2027 | 35 | 6 | 1 |
| 15 | Aug 2027 | 40 | 6 | 1 |
| 16 | Sep 2027 | 45 | 6 | 1 |
| 17 | Oct 2027 | 50 | 6 | 1 |
| 18 | Nov 2027 | 55 | 6 | 1 |
| 19 | Dec 2027 | 58 | 4 | 1 |
| 20 | Jan 2028 | 61 | 4 | 1 |
| 21 | Feb 2028 | 64 | 4 | 1 |
| 22 | Mar 2028 | 67 | 4 | 1 |
| 23 | Apr 2028 | 69 | 3 | 1 |
| 24 | May 2028 | 70 | 2 | 1 |

**Growth assumptions:**
- 90-day roadmap target: 5 paying by Day 90 *(Month 4)*
- Conservative ramp through year 1 — solo founder bandwidth limited
- First hire (customer success) at Month 10-12 unlocks faster onboarding
- Year 2: steadier 4-6 new customers per month
- Churn assumed at ~4% monthly steady-state from month 6 onward (industry SMB SaaS)

### Sites under management by month

Average sites per paying customer grows over time as customers expand from pilot site to full portfolio.

| Month | Customers | Avg sites/customer | Total sites | Of which: Small / Medium / Large / Enterprise |
|---|---|---|---|---|
| 1 | 0 | 0 | 0 | — |
| 3 | 3 | 2.0 | 6 | 4 / 2 / 0 / 0 |
| 6 | 12 | 2.5 | 30 | 18 / 9 / 3 / 0 |
| 9 | 22 | 3.0 | 66 | 32 / 26 / 7 / 1 |
| 12 | 25 | 3.6 | 90 | 36 / 36 / 16 / 2 |
| 15 | 40 | 4.0 | 160 | 56 / 64 / 36 / 4 |
| 18 | 55 | 4.4 | 240 | 72 / 96 / 60 / 12 |
| 21 | 64 | 4.7 | 300 | 75 / 120 / 84 / 21 |
| 24 | 70 | 4.6 | 320 | 80 / 128 / 90 / 22 |

---

## Section 4 — Revenue projection (base case, 24 months)

### Revenue per site (weighted average by site mix)

| Period | Small × weighting | Medium × weighting | Large × weighting | Enterprise × weighting | Weighted avg/site |
|---|---|---|---|---|---|
| Months 1-6 | ₹750 × 60% | ₹2,250 × 30% | ₹4,000 × 10% | ₹0 × 0% | ~₹1,525/site |
| Months 7-12 | ₹750 × 40% | ₹2,250 × 40% | ₹4,000 × 18% | ₹8,000 × 2% | ~₹2,080/site |
| Months 13-18 | ₹750 × 30% | ₹2,250 × 40% | ₹4,000 × 25% | ₹8,000 × 5% | ~₹2,525/site |
| Months 19-24 | ₹750 × 25% | ₹2,250 × 40% | ₹4,000 × 28% | ₹8,000 × 7% | ~₹2,765/site |

### MRR by month (₹)

| Month | Sites | Wt. avg/site | MRR | Cumulative revenue (CY) |
|---|---|---|---|---|
| 1 | 0 | — | 0 | 0 |
| 2 | 2 | 1,525 | 3,050 | 3,050 |
| 3 | 6 | 1,525 | 9,150 | 12,200 |
| 4 | 12 | 1,525 | 18,300 | 30,500 |
| 5 | 22 | 1,525 | 33,550 | 64,050 |
| 6 | 30 | 1,525 | 45,750 | 1,09,800 |
| 7 | 42 | 2,080 | 87,360 | 1,97,160 |
| 8 | 55 | 2,080 | 1,14,400 | 3,11,560 |
| 9 | 66 | 2,080 | 1,37,280 | 4,48,840 |
| 10 | 76 | 2,080 | 1,58,080 | 6,06,920 |
| 11 | 85 | 2,080 | 1,76,800 | 7,83,720 |
| 12 | 90 | 2,080 | 1,87,200 | 9,70,920 |
| 13 | 110 | 2,525 | 2,77,750 | 2,77,750 *(FY28 starts)* |
| 14 | 130 | 2,525 | 3,28,250 | 6,06,000 |
| 15 | 160 | 2,525 | 4,04,000 | 10,10,000 |
| 16 | 185 | 2,525 | 4,67,125 | 14,77,125 |
| 17 | 210 | 2,525 | 5,30,250 | 20,07,375 |
| 18 | 240 | 2,525 | 6,06,000 | 26,13,375 |
| 19 | 260 | 2,765 | 7,18,900 | 33,32,275 |
| 20 | 275 | 2,765 | 7,60,375 | 40,92,650 |
| 21 | 300 | 2,765 | 8,29,500 | 49,22,150 |
| 22 | 310 | 2,765 | 8,57,150 | 57,79,300 |
| 23 | 315 | 2,765 | 8,71,000 | 66,50,300 |
| 24 | 320 | 2,765 | 8,84,800 | 75,35,100 |

**Year 1 (FY27, Jun 26 – May 27) revenue:** ~₹9.7 L
**Year 2 (FY28, Jun 27 – May 28) revenue:** ~₹75 L
**Two-year cumulative revenue:** ~₹85 L

---

## Section 5 — Cost projection (base case, 24 months)

### Cost categories

| Category | Type | Month 1 | Month 12 | Month 24 |
|---|---|---|---|---|
| **Supabase** | Tech infra | ₹2,100 | ₹2,100 (Pro) | ₹50,000 (Team tier) |
| **Vercel** | Tech infra | ₹1,700 | ₹1,700 | ₹7,000 (Pro+ seats) |
| **Resend** | Tech infra | ₹0 (free) | ₹1,700 | ₹3,000 |
| **Storage / bandwidth overage** | Variable | ₹0 | ₹1,000 | ₹6,000 |
| **Edge function overage** | Variable | ₹0 | ₹200 | ₹2,500 |
| **Domain (amortised)** | Fixed | ₹125 | ₹125 | ₹125 |
| **Tools** (Notion, Linear, Figma, etc.) | Fixed | ₹2,000 | ₹5,000 | ₹10,000 |
| **AI subscriptions** | Variable | ₹3,000 | ₹4,000 | ₹6,000 |
| **WhatsApp Business API** | Variable | ₹0 | ₹0 | ₹10,000 |
| **Cloudflare / security** | Fixed | ₹0 | ₹2,000 | ₹5,000 |
| **CA retainer** | Fixed | ₹3,000 | ₹5,000 | ₹10,000 |
| **Legal retainer** | Variable | ₹0 (one-time fees) | ₹3,000 | ₹8,000 |
| **Marketing** (Google Ads, content, events) | Variable | ₹0 | ₹25,000 | ₹70,000 |
| **Founder salary** | Fixed | ₹0 | ₹60,000 | ₹1,20,000 |
| **First hire (customer success)** | Fixed | ₹0 | ₹35,000 (from M10) | ₹50,000 |
| **Second hire (engineer)** | Fixed | ₹0 | ₹0 | ₹70,000 (from M20) |
| **Office / coworking** | Fixed | ₹0 | ₹0 | ₹15,000 |
| **Statutory** (GST, audits, ROC) | Variable | ₹0 | ₹2,000 | ₹5,000 |

### Monthly operating cost by month (₹)

| Month | Tech | People | Marketing | Other | **Total** |
|---|---|---|---|---|---|
| 1 (Jun 26) | 4,000 | 0 | 0 | 5,000 | **9,000** |
| 2 | 4,000 | 0 | 2,000 | 5,000 | 11,000 |
| 3 | 4,500 | 0 | 5,000 | 6,000 | 15,500 |
| 4 | 5,000 | 0 | 8,000 | 7,000 | 20,000 |
| 5 | 5,500 | 0 | 10,000 | 8,000 | 23,500 |
| 6 | 6,000 | 0 | 12,000 | 8,000 | 26,000 |
| 7 | 6,500 | 30,000 | 15,000 | 9,000 | 60,500 |
| 8 | 7,000 | 40,000 | 18,000 | 9,500 | 74,500 |
| 9 | 7,500 | 50,000 | 20,000 | 10,000 | 87,500 |
| 10 | 8,000 | 90,000 | 22,000 | 11,000 | 1,31,000 |
| 11 | 8,500 | 95,000 | 24,000 | 12,000 | 1,39,500 |
| 12 (May 27) | 9,000 | 95,000 | 25,000 | 12,500 | **1,41,500** |
| 13 | 12,000 | 1,00,000 | 30,000 | 15,000 | 1,57,000 |
| 14 | 16,000 | 1,00,000 | 35,000 | 16,000 | 1,67,000 |
| 15 | 22,000 | 1,05,000 | 40,000 | 17,000 | 1,84,000 |
| 16 | 30,000 | 1,05,000 | 45,000 | 18,000 | 1,98,000 |
| 17 | 40,000 | 1,10,000 | 50,000 | 20,000 | 2,20,000 |
| 18 | 50,000 | 1,10,000 | 55,000 | 22,000 | 2,37,000 |
| 19 | 55,000 | 1,15,000 | 60,000 | 25,000 | 2,55,000 |
| 20 | 60,000 | 1,85,000 | 60,000 | 28,000 | 3,33,000 |
| 21 | 65,000 | 1,90,000 | 65,000 | 30,000 | 3,50,000 |
| 22 | 70,000 | 1,90,000 | 65,000 | 32,000 | 3,57,000 |
| 23 | 72,000 | 1,95,000 | 70,000 | 34,000 | 3,71,000 |
| 24 (May 28) | 76,000 | 2,00,000 | 70,000 | 36,000 | **3,82,000** |

---

## Section 6 — Profit + cumulative cashflow (base case)

| Month | MRR | Operating cost | Monthly P/L | Cumulative |
|---|---|---|---|---|
| 1 | 0 | 9,000 | -9,000 | -9,000 |
| 2 | 3,050 | 11,000 | -7,950 | -16,950 |
| 3 | 9,150 | 15,500 | -6,350 | -23,300 |
| 4 | 18,300 | 20,000 | -1,700 | -25,000 |
| 5 | 33,550 | 23,500 | +10,050 | -14,950 |
| 6 | 45,750 | 26,000 | +19,750 | +4,800 |
| 7 | 87,360 | 60,500 | +26,860 | +31,660 |
| 8 | 1,14,400 | 74,500 | +39,900 | +71,560 |
| 9 | 1,37,280 | 87,500 | +49,780 | +1,21,340 |
| 10 | 1,58,080 | 1,31,000 | +27,080 | +1,48,420 |
| 11 | 1,76,800 | 1,39,500 | +37,300 | +1,85,720 |
| 12 | 1,87,200 | 1,41,500 | +45,700 | **+2,31,420** |
| 13 | 2,77,750 | 1,57,000 | +1,20,750 | +3,52,170 |
| 14 | 3,28,250 | 1,67,000 | +1,61,250 | +5,13,420 |
| 15 | 4,04,000 | 1,84,000 | +2,20,000 | +7,33,420 |
| 16 | 4,67,125 | 1,98,000 | +2,69,125 | +10,02,545 |
| 17 | 5,30,250 | 2,20,000 | +3,10,250 | +13,12,795 |
| 18 | 6,06,000 | 2,37,000 | +3,69,000 | +16,81,795 |
| 19 | 7,18,900 | 2,55,000 | +4,63,900 | +21,45,695 |
| 20 | 7,60,375 | 3,33,000 | +4,27,375 | +25,73,070 |
| 21 | 8,29,500 | 3,50,000 | +4,79,500 | +30,52,570 |
| 22 | 8,57,150 | 3,57,000 | +5,00,150 | +35,52,720 |
| 23 | 8,71,000 | 3,71,000 | +5,00,000 | +40,52,720 |
| 24 | 8,84,800 | 3,82,000 | +5,02,800 | **+45,55,520** |

### Key cashflow milestones

| Milestone | Month | Notes |
|---|---|---|
| **First positive monthly P/L** | Month 5 | Once 22 sites under management |
| **Cumulative breakeven (operations)** | Month 6 | All prior losses recovered |
| **Cumulative breakeven including dev cost (~₹50k)** | Month 6 | Soon after operations breakeven |
| **First hire affordable** | Month 9-10 | MRR > ₹1.3 L sustained |
| **Founder salary fully drawn** | Month 7-8 | Self-sustaining |
| **Cumulative ₹10 L** | Month 16-17 | Equity dilution headroom |
| **Cumulative ₹40 L** | Month 23 | Series-A-credible balance sheet |

---

## Section 7 — Scenarios (sensitivity)

### Bear case *(growth 50% slower)*

- 12 paying by Month 12 *(half of base)*
- 35 paying by Month 24
- MRR by Month 24: ₹4 L (vs ₹8.8 L base)
- Year 2 revenue: ~₹35 L (vs ₹75 L base)
- Still cashflow-positive from Month 8-9, but ~₹15 L cumulative profit by Month 24 (vs ₹45 L)
- Mitigation: defer first hire by 6 months; founder salary stays at ₹40k longer

### Base case *(as above)*

- 25 paying by Month 12
- 70 paying by Month 24
- Year 2 revenue: ~₹75 L

### Bull case *(growth 50% faster + bigger sites)*

- 40 paying by Month 12 *(60% above base)*
- 120 paying by Month 24
- Higher average site size mix shifts toward Large/Enterprise earlier
- MRR by Month 24: ~₹14 L
- Year 2 revenue: ~₹1.2 cr
- Triggers earlier second engineer hire + Supabase Team tier earlier
- Strong case for Series A by Month 18-20

---

## Section 8 — Capital + tax structure recommendations *(for CA discussion)*

### Pvt Ltd structure

| Item | Recommendation | Rationale |
|---|---|---|
| **Entity type** | Private Limited Company | Limited liability + investor-friendly + standard for SaaS |
| **Authorised capital** | ₹10,00,000 | Headroom for advisor equity (0.5–2% slices) without re-filing |
| **Paid-up capital** | ₹1,00,000 (or ₹2 L if you can spare) | Standard for a solo founder Pvt Ltd |
| **Number of shares** | 10,000 × ₹10 each | Or 1,00,000 × ₹1 — CA will recommend |
| **Founder shareholding** | 100% at incorporation | Standard. Advisor / employee equity via grants later. |
| **Directors** | 1 (Karun) initially; add 2nd (spouse / family / advisor) within 6 months | Solo director Pvt Ltd is legal but having 2 is more conventional |

### GST registration

| Trigger | When |
|---|---|
| Mandatory | When cumulative annual turnover crosses ₹20 L *(expected Month 11-12)* |
| Voluntary | Could register earlier for input tax credit on hosting + tools (≈₹3-4k/year savings) |
| **Recommendation** | Register voluntarily within 30 days of first invoice | Cleaner books · proper TDS handling · input credit on tech expenses |

### Tax planning

| Year | Expected revenue | Expected profit | Notes |
|---|---|---|---|
| **FY27** (Apr 27 – Mar 28, partial — Jun 26 onwards) | ₹9-10 L | ₹2-3 L | Low corporate tax: 25% on profit = ₹50-75k |
| **FY28** (Apr 28 – Mar 29) | ₹70-80 L | ₹35-45 L | Higher tax: ₹9-11 L corporate tax + GST collected ~₹13-14 L (pass-through) |

### Founder remuneration

| Stage | Method | Monthly amount |
|---|---|---|
| Months 1-6 | No salary (pre-revenue) | ₹0 |
| Months 7-9 | Founder salary | ₹40,000 |
| Months 10-12 | Founder salary | ₹60,000 |
| Months 13-18 | Founder salary + bonus | ₹80,000 - ₹1,00,000 |
| Months 19-24 | Founder salary + bonus | ₹1,00,000 - ₹1,50,000 |

Salary recommendation: pay yourself as **director's remuneration** (deductible expense, taxed in your personal return) rather than dividend (post-tax distribution). CA will structure.

### One-time setup costs (not in monthly projection above)

| Item | Cost | Timing |
|---|---|---|
| Pvt Ltd registration | ₹15,000 - ₹25,000 | Month 1-2 |
| Trademark filing | ₹10,000 - ₹15,000 | Month 3-6 |
| Privacy Policy + ToS lawyer review | ₹5,000 - ₹10,000 | Month 1 |
| Bank account opening + setup | ₹2,000 - ₹5,000 | Month 1 |
| Digital signature certificates (DSCs) | ₹2,000 - ₹3,000 | Month 1 (for filings) |
| Accounting software (Tally / Zoho Books) | ₹6,000 - ₹15,000/year | Month 2 |
| **Total one-time setup** | **₹40,000 - ₹75,000** | First 6 months |

---

## Section 9 — Action items for the CA

Ranked by urgency. Marked with the CA's likely answer.

1. **Pvt Ltd registration** *(P0)*
   - Quote requested + decision needed by end of May 2026
   - Name reservation: "Storey Infra Pvt Ltd" or alternatives
   - DIN + DSC + MOA + AOA + filings
   - Recommend authorised capital ₹10 L, paid-up ₹1-2 L

2. **Pre-incorporation expense capture** *(P1)*
   - Out-of-pocket Apr-May 2026 (~₹30-50k) should be admissible as pre-incorporation expense
   - One-time deduction in Year 1 of new company

3. **Accounting software setup** *(P1)*
   - Choose Zoho Books or Tally — CA preference
   - Set up chart of accounts before first invoice

4. **GST voluntary registration timing** *(P1)*
   - Apply within 30 days of first invoice (currently expected Jun-Jul 2026)
   - Get input tax credit on hosting + tools (₹3-5k/year savings)

5. **Founder remuneration structure** *(P2)*
   - Set up director's remuneration agreement
   - Start salary disbursement from Month 7

6. **TDS compliance setup** *(P2)*
   - TAN registration
   - Setup for TDS on any contractor / consultant payments

7. **Annual filing calendar** *(P2)*
   - ROC filings (AOC-4, MGT-7 annually)
   - Income tax return (October-November each year)
   - GST returns (monthly + quarterly + annual)

8. **DSC for directors** *(P0)*
   - Class 2 / Class 3 DSC required for MCA filings
   - One-time cost ~₹1,500-2,500

9. **Bank account** *(P1)*
   - Current account in Pvt Ltd name (HDFC / ICICI / Axis recommended for tech startups)
   - Setup with cheque book, debit card, internet banking

10. **Term life + critical illness insurance for founder** *(P2)*
    - ₹1-2 cr term cover, ₹2-5k/year
    - Critical illness rider, ₹2-3k/year
    - Founder-key-person policy when team grows (later)

---

## Section 10 — Assumptions to challenge

If the CA wants to stress-test this:

| Assumption | Range | Sensitivity |
|---|---|---|
| Customer acquisition rate | 2-6 new/month early, 4-6 steady | ±50% → ±₹35 L Year-2 revenue |
| Churn rate | 4% monthly | Doubling to 8% → ~25% lower Year-2 MRR |
| Avg site size mix shift | Per table in Section 2 | If small stays dominant longer → ~₹15 L lower Year-2 revenue |
| First hire timing | Month 10 | Earlier → faster growth, higher burn |
| Marketing spend efficiency | ~₹2,000-5,000 CAC | If CAC doubles → halved growth rate |
| Supabase pricing stability | 2026 prices held flat | 2× hike adds ₹50k/year by year 2 |
| INR/USD stability | ₹83-87 | Major depreciation adds 5-10% to tech costs |

Re-baseline this projection every quarter against actuals. The numbers are useful as a planning artifact, not as targets.

---

## Section 11 — What this means strategically

The base case shows Storey is **cashflow-positive by Month 6, hire-affordable by Month 10, and Series-A-credible by Month 18-20** — without any external funding.

This makes Storey a **bootstrappable opportunity** at base-case execution. Two paths from here:

1. **Stay bootstrapped** — keep 100% equity, slower growth, ~₹45 L profit by Month 24, organically grow to ₹1-2 cr revenue by Year 3. Founder takes home most of the upside.

2. **Raise a seed round at Month 18-20** — give up 15-20% equity for ₹1-3 cr, accelerate growth, hit ₹5-10 cr ARR by Year 3, position for Series A. Higher absolute outcome, lower founder share.

Either path is supported by these projections. The CA can help model both at the time of decision (Day 270 per ROADMAP-365.md).

---

*This document was prepared on 2026-05-22 based on operational data
through May 22 and reasonable industry-standard assumptions for Indian
SMB SaaS. All projections are planning artifacts, not commitments.
Re-baseline quarterly against actuals.*
