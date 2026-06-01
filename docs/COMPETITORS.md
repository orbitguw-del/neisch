# Storey — Competitive landscape & pricing comparison

*Snapshot: 2026-06-01. Refresh when revisiting pricing or GTM. Sources at bottom.*

Comparison is against Indian construction / contractor apps in Storey's band
(SMB contractors). Storey figures shown annual (monthly × 10, "pay 10 use 12").

## Pricing comparison (annual, India)

| App | Entry / free | Mid tier | Top tier | Pricing model |
|---|---|---|---|---|
| **Storey** | **Free** — 1 site, 1 user, recording only (no material workflows) | Standard ₹9,990 (1 site) / ₹24,990 (3 sites) | **Pro ₹19,990 (1 site) / ₹49,990 (3 sites)** + ₹7,990/extra site | **Per SITE, multi-user included** |
| **Yojo** | **Free** — attendance, payroll, material calculators, BOQ, DPR, multi-site, Hindi + regional langs | "Affordable" paid (undisclosed) | — | Freemium |
| **Onsite** | — (min 3 users) | Business ₹36,000 (3 users) / Business+ ₹45,000 | Enterprise ₹10,00,000+ | **Per USER** (₹12–15k/user/yr) |
| **Powerplay** | — | Pro ₹71,999/yr | Pro+ ₹1,19,999/yr (~₹10k/mo) | Per module / per user |
| **SiteSetu** | Entry (low — attendance + basic material + photos) | Professional (quote; 3–10 sites; GST billing, BOQ, RA bills, client portal) | Enterprise ₹25k–2L/**month** | Per team / quote |
| **Tally** (accounting anchor, not site-ops) | — | ~₹18,000 one-time | — | One-time licence |

## Where Storey wins

1. **Per-site pricing with multi-user included = structural cost advantage.**
   Onsite/Powerplay charge *per user* (min 3). A contractor with 8 staff on one
   site pays Onsite ~₹96k–120k/yr; on Storey Pro it's ₹19,990 — same team, ~5×
   cheaper, because we charge by site not head. **Lead the sales pitch with this.**
2. **Value player vs mid-market.** Pro 3-site (₹49,990) ≈ Onsite Business+
   (₹45k for *3 users*) and far under Powerplay (₹72k–1.2L). Undercuts while
   including the team.
3. **Signed Work Order PDF + sub-contractor dispute trail** — genuinely
   differentiated; none of these emphasise it. The moat that justifies Pro.

## Where Storey is exposed (honest)

1. **Free tier thinner than Yojo's.** Yojo free = attendance, payroll,
   calculators, BOQ, DPR, multi-site + Hindi. Storey free = recording only,
   1 site, no material workflows. Free-to-free, Yojo looks more generous.
   → Decision logged in TODO: does Storey free need to give a bit more as a funnel?
2. **No GST billing / RA bills / BOQ.** Onsite Business+ and SiteSetu
   Professional bundle GST-compliant client billing — a real contractor need.
   → **DECISION (owner, 2026-06-01): build GST billing for customers in v2** —
   it accelerates contractor onboarding (they want to bill clients from the app).
   Tagged v2; positioning until then = "Storey does site-ops, keep Tally for accounts."
3. **No regional language yet.** Yojo ships Hindi/Marathi/Tamil/Telugu now;
   Storey is English-default by deliberate choice (see CLAUDE.md). Defensible,
   but a field talking-point against us. Hindi/Assamese toggle already a v1.x TODO.

## Bottom line

Pricing sits well in the SMB value band — cheaper than Powerplay/Onsite, and the
**per-site model is the standout advantage**. The risks are not price points but
positioning/feature gaps: free-tier depth vs Yojo, and GST billing (now slated v2).

## Monetization thesis — marketplace harnessing the unorganised market *(owner, 2026-06-01)*

Storey's longer-term monetization is **not subscription-only** — the bigger play
is a **marketplace that organises the unorganised NE-India construction supply
market** (materials, vendors, sub-contractors, labour). Revenue: commission /
lead-gen / take-rate on transactions, not just SaaS fees.

**Why it's defensible:**
- Storey captures the **demand-side data as a byproduct of the SaaS** — what
  materials each contractor consumes, which vendors/sub-contractors/labour they
  use. Most marketplaces must buy that data; Storey gets it free from daily use.
- The supply side (NE material suppliers, vendors, labour) is genuinely informal
  and fragmented — ripe to organise.
- **Already in the architecture:** the Vendor Module **Phase 2** in `CLAUDE.md`
  (superadmin-approved, *shared* vendor directory, "approved vendors visible to
  all contractors, not tenant-scoped") IS the marketplace seed. Marketplace =
  that directory + transactions on top.

**How it reframes the free tier:** with a marketplace endgame, free contractors
are **marketplace liquidity (demand-side density)**, not a revenue leak — so a
*generous* free tier becomes a strategic acquisition investment, monetized via
transactions rather than subscription. Make the free-tier-depth decision with
this thesis explicit.

**Sequencing (non-negotiable):**
- Marketplace is **two-sided** — cold-start problem; needs contractor + vendor
  density in the same geography before any transaction happens.
- **SaaS is the wedge that builds the demand side first.** Cannot build the
  marketplace before contractor density exists.
- **NE geographic concentration = the moat.** Own NE contractors densely before
  national players (Udaan-type) care about the region.
- **Day-365+ / v2–v3 play — NOT in the 90-day plan.** The 90-day SaaS milestones
  (paying contractors) are the prerequisite. Belongs in `ROADMAP-365.md` horizon.

## Sources
- Powerplay pricing — https://www.techjockey.com/detail/powerplay
- Onsite ERP pricing — https://onsiteteams.com/onsite-pricing/
- Yojo (free contractor apps comparison) — https://yojoapp.com/en/blog/thekedar-ke-liye-free-app/
- SiteSetu (construction software cost India 2026) — https://sitesetu.in/blog/construction-software-cost-india-2026
