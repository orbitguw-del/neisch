# Storey — competitive landscape
### Honest comparison · who Storey competes with · where it wins and loses
*Last updated 2026-05-22*

> Reality-check for the founder + canned-answer source for "why not X?"
> objections in sales conversations. Update this doc whenever the competitive
> picture shifts — especially if a competitor adds the "your Drive" data
> sovereignty feature or a Hindi-default app launches.

---

## Who Storey actually competes with

The honest answer is layered. There are *direct competitors* (other ConTech apps in India), *category cousins* (Tally, WhatsApp), and *non-competitors that prospects bring up* (Procore, Buildertrend — too enterprise/Western for your buyer).

### Direct competitors — India ConTech for SMB contractors

| Name | Position | Where they're strong | Where they're weak vs Storey |
|---|---|---|---|
| **Powerplay** | India SMB ConTech, established 2020 | Sub-contractor focus, all-India coverage, raised funding | Not NE-India-specific, less offline depth, higher pricing tier |
| **iFieldSmart** | India ConTech for builders | Drawings / RFI module | Desktop-leaning, not mobile-first |
| **CivilOn / CivilPro / CivilDesk** | Various India SMB players | Some have decent labour modules | Inconsistent UX, low traction |
| **Constro / Construct App** | Smaller India SMB | — | Not category-defining |
| **OnSite by Falcon Brick** | India-built | More established for larger sites | Enterprise-leaning |

### Category cousins (different layer, often complementary not competitive)

| Name | What they do | Relationship to Storey |
|---|---|---|
| **Tally** | Accounting + GST + statutory books | Complementary — Tally owns the books, Storey owns operations. Will integrate via Tally export in v2. |
| **Vyapar / Marg ERP / Busy** | SMB billing + accounting | Same as Tally — complementary |
| **Khatabook / OkCredit** | Small-business ledger | Different scope (no construction ops) |
| **WhatsApp + paper + Excel** | The actual incumbent | Storey replaces this mess. The real competitor. |

### Non-competitors that prospects mention

| Name | Why they're not a real Storey competitor |
|---|---|
| **Procore** | US enterprise. $375+/mo. NE-India contractor would never adopt — wrong audience entirely. |
| **Buildertrend** | US residential focus. Doesn't fit Indian commercial / road / govt-tied work. |
| **Autodesk Construction Cloud (PlanGrid)** | Drawings-first, enterprise. Different layer. |
| **Fieldwire** | Field-first project management for larger projects. Out of scope for SMB. |

---

## Head-to-head comparison — Storey vs the realistic alternatives

The 5 alternatives a prospect actually considers:

| Dimension | **Storey** *(today)* | Powerplay | iFieldSmart | Tally | WhatsApp + Excel |
|---|---|---|---|---|---|
| Target customer | NE-India SMB contractors + specialist trades | India SMB contractors | India builders + larger sites | All SMB (accounting) | Everyone |
| Mobile-first | ✅ Built for phone | ⚠️ Phone + desktop | ⚠️ Desktop-leaning | ❌ Desktop | ✅ Phone |
| Offline mode | ✅ Full (IndexedDB queue + auto-sync) | ⚠️ Partial | ❌ Limited | ✅ Desktop only | ⚠️ |
| Multi-tenant RLS | ✅ Postgres RLS, 2 audits | ✅ | ⚠️ App-layer | n/a | ❌ |
| Sub-contractor module | 🟡 v1.2 (mid-June) | ✅ Mature | ⚠️ Basic | ❌ | ❌ |
| Printable Work Order PDF | 🟡 v1.2 | ⚠️ Partial | ⚠️ | ❌ | ❌ |
| Append-only material ledger | ✅ | ✅ | ✅ | ❌ | ❌ |
| Data sovereignty (your Drive) | 🟡 v1.2 (unique) | ❌ | ❌ | ✅ Local file | ✅ Your phone |
| Photo with date-time burn-in | ✅ | ⚠️ | ⚠️ | ❌ | ❌ Manual |
| Approval workflows (logs, attendance, transfers) | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| NE-India regional fit | ✅ Built for it | ⚠️ Pan-India | ⚠️ Pan-India | ⚠️ Pan-India | ✅ |
| Hindi / Assamese UI | 🟡 Future toggle | Partial | Limited | ✅ | ✅ |
| Founder-direct support | ✅ WhatsApp · same day | ❌ Ticket queue | ❌ | ❌ Reseller | n/a |
| Pricing (per site / month) | ₹500–5,000 | ₹999–5,000+ | Enterprise tier | ₹18k one-time + AMC | Effectively free |
| Public launch | 🟡 Mid-June 2026 | ✅ Live | ✅ Live | ✅ Decades | ✅ |

> **Legend:** ✅ live + solid · 🟡 v1.2 (4 weeks) · ⚠️ exists but weaker · ❌ missing

---

## Where Storey wins *(genuine, defensible)*

1. **NE-India specificity.** Most India ConTech apps treat NE as an after-thought. Storey is built by someone running sites here. The monsoon-aware tasks, the Assam-sand-mining context, the brick-from-kiln supply chain — these aren't features, they're assumptions baked into the product.

2. **Founder-as-contractor authenticity.** Powerplay's founders are tech people. Storey's founder is a contractor who codes. When you say *"if anything breaks, message me on WhatsApp"* — competitors can't say that. Won't be true forever (eventually scale forces a support team), but is true for the next 12-18 months — your real positioning window.

3. **"Your data, your Drive" — coming v1.2.** Daily auto-backup to the contractor's own Google Drive. Nobody else does this. Tally has the *file* sovereignty, but on a single PC. Powerplay/iFieldSmart have neither. This single feature is the strongest answer to *"what if you shut down?"* — and it's three weeks away.

4. **Mobile-first throughout.** Most competitors built desktop first, bolted on mobile. Storey was phone-first from day one. The new visual-first dashboards (terracotta hero card, colour-stripe site lists, quick-action tiles) read fast on a 4-year-old Android in dust.

5. **Honest beta + transparent roadmap.** "Live with 12 testers, 4 weeks from public launch, here's what's coming and what isn't" — competitors can't be this transparent. The 90/180/365-day roadmap is committed to the public repo. That's unusual.

6. **AI-augmented dev velocity.** Storey ships features faster than any competitor at the same team size — because the team is one contractor + AI, and the pattern is proven (171 commits in 48 days). When v1.2 ships in mid-June, you'll be at near-parity with apps that took 3 years to build.

---

## Where Storey loses *(honest gaps)*

Be candid about these in sales conversations. Honesty earns more trust than evasion.

1. **Maturity.** 12 testers vs Powerplay's 1,000+ paying customers. Reputation hasn't been built yet. A risk-averse buyer will see this.

2. **No quality / compliance modules.** Slump tests, cube tests, PWD inspection records, fire safety — Storey doesn't track these. Some Indian ConTech competitors do, badly. v2 candidate.

3. **No drawings / RFI management.** iFieldSmart leads here. For a contractor whose pain is paper drawings, Storey isn't the answer yet. v2 / v3.

4. **No Tally integration yet.** Tally export is on the v2 roadmap. Until then, the books still happen on Tally separately. Some contractors will hesitate without an integration in hand.

5. **Solo founder = resilience concern.** A serious enterprise procurement team will ask *"what if Karun gets hit by a bus?"* The honest answer is currently: the data is on Supabase (Mumbai), the code is open in your tenant's Drive after v1.2, and Postgres is portable. But the honest answer doesn't fully comfort a 50-crore-revenue procurement officer.

6. **Pan-India brand absence.** Outside NE India, nobody's heard of Storey. Powerplay is on Google Ads. iFieldSmart is at industry expos. Brand-building lag is real.

7. **Hindi / Assamese UI not default.** Some contractors will assume "no Hindi" means "not for us" before reading the actual product. The visual-first design mitigates this but doesn't eliminate it.

---

## The blue-ocean — what only Storey does

If you stack the feature columns against the realistic alternatives, Storey is the **only** option that has all four of these at once:

```
✓ Mobile-first AND offline-ready
✓ Built specifically for NE-India SMB contractors
✓ Daily auto-backup to YOUR Google Drive (v1.2)
✓ Founder-direct WhatsApp support
```

No other app — at any price point — combines these four. Powerplay has 1 + 4 but not 2 + 3. Tally has 3 (in file form) but not 1, 2, or 4. WhatsApp has 1 + 4 but is not a product.

That's Storey's wedge. Not a feature list — a *configuration* of properties.

---

## Canned answers to "why not X?" objections

### "Why not Powerplay?"

> Powerplay is solid for pan-India contractors and we'd recommend it if you were running 50 sites across 6 states. For NE India SMB contractors, three differences matter: (1) offline is full, not partial — your supervisor on a Manipur site won't lose data on 4G outages; (2) your data is backed up daily to your own Google Drive starting mid-June, which Powerplay doesn't do; and (3) you message me directly on WhatsApp and get a reply within 24 hours, not a ticket queue. Different stage of company, different posture.

### "Why not Tally? I already have it."

> Tally tracks your money. Storey tracks your operations. They don't overlap. Your CA will keep using Tally; your supervisor will use Storey. Tally has no concept of sites, workers on attendance, photos, or material allocations — try doing those in Tally, you'll see. We're building a Tally export in v2 so the two systems talk to each other.

### "Why not Procore / Buildertrend?"

> Procore is genuinely good — for $400 a month per user, US-style enterprises, drawings-heavy commercial builds. It's built for a contractor in Texas, not NE India. The pricing alone makes it a non-starter for SMB Indian contractors. Buildertrend is residential US — also wrong audience. Both are the wrong shape of solution.

### "Why not iFieldSmart?"

> iFieldSmart is strong on drawings and RFI — if your daily pain is managing architectural drawings across stakeholders, that's where they shine. Storey isn't a drawings app. We're stronger on daily operations: attendance, materials, tasks, sub-contractor agreements. Different problem to solve.

### "Why not just WhatsApp + Excel? It's free."

> It's not free — it's just hidden cost. Material that walks off site without being recorded, sub-contractor disputes that cost ₹50k each to settle, supervisors who forget to share daily logs until prompted. The contractors who switched to Storey from WhatsApp + Excel are saving 3-5 hours of admin work per week per site, and recovering material leakage that adds up to ₹2-5k / site / month. The app pays for itself in week one.

### "Why are you a solo founder?"

> Because nobody else in NE India was building this, and I have the domain knowledge. The trade-off is genuine — if I disappear, you'd need to migrate. That's why Storey's data sovereignty matters: from mid-June your data is auto-backed-up to your own Google Drive, and the database is Postgres which moves to any other system. You'd lose me, not your data. As we hit 50 paying customers, the team grows. That's the plan, transparently.

---

## What to monitor in this landscape

Update this doc when any of these signals fire:

| Signal | What it means | Action |
|---|---|---|
| Powerplay launches a "your Drive backup" feature | Our biggest v1.2 differentiator narrows | Lean harder on NE-India + founder authenticity |
| iFieldSmart releases a mobile-first version | Mobile gap narrows | Lean on offline depth + RLS audit + sub-contractor PDF |
| A Hindi-default ConTech app gains traction with NE contractors | The "English-default" thesis weakens | Accelerate the language toggle |
| Tally adds operational features (workers, attendance, materials) | Real competitive threat — they have brand and reach | Lean on mobile + multi-user + photos — Tally won't catch up there |
| A US/global ConTech enters NE India with localised pricing | Distribution threat | Lean on regional context + founder ground game |
| A new India ConTech raises $5M+ Series A | They'll outspend on marketing | Lean on product depth + customer retention |

The competitive position is **a snapshot, not a destination**. Storey's edge in May 2026 isn't the same edge it'll have in May 2027. Re-read this doc at every roadmap milestone.

---

## What Storey is NOT trying to become

Worth being explicit about — these are deliberate non-paths:

- **Not Procore for India.** Enterprise ConTech is a different game with different margins, different sales motion, and different feature surfaces.
- **Not Tally 2.0.** Storey doesn't try to do books. The integration is the relationship.
- **Not a generic CRM.** No leads pipeline, no contact management, no marketing automation.
- **Not a marketplace.** No connecting contractors with sub-contractors algorithmically. Trust networks in NE construction don't work that way.
- **Not a financial product.** No invoice factoring, no working-capital loans, no insurance. Tempting adjacencies, but distraction.

Stay in the operations lane. The operations lane has plenty of room.
