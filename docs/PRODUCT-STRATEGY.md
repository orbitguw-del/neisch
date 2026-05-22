# Storey — product strategy

> Captured 2026-05-22, the day after the 12-tester gate cleared.
>
> Strategic positioning decisions, not feature spec. Things that affect *who*
> Storey sells to, *how* it positions itself, and *what* the long-term
> shape of the company looks like. Update when reality changes the
> assumptions.

---

## The current positioning (locked, May 2026)

> **Storey is a site-operations app for construction contractors in
> Northeast India.**

- **Buyer:** the main contractor (or owner-operator of a contracting firm)
- **Operator:** the supervisor + site_manager on the contractor's payroll
- **Sub-contractors:** *entities* in the contractor's workflow — tracked, paid, given Work Orders, but not logged into Storey themselves (Path A, decided 2026-05-20)
- **Region:** NE India first, then adjacent geographies (Eastern UP, Bihar, Jharkhand, Odisha at 365-day horizon)
- **Tally is the trust benchmark** — not the feature benchmark. Storey beats Tally on operations + data ownership; Tally still owns the books.

---

## The dual-market insight *(2026-05-22)*

**Sub-contractors can also be customers of Storey, not just entities.**

A small electrical contractor running 3 simultaneous wiring jobs has the same
daily ops pain as a main contractor running 3 sites — workers to track,
material to allocate, expenses to log, photos to document. Storey's data
model already supports him without any code change — he's just a "tenant"
with sites that happen to be smaller scopes.

### The market math

| | Main contractors in NE India | Sub-contractors / specialist trades |
|---|---|---|
| Approximate count | ~5,000–10,000 | ~50,000–100,000 |
| Daily ops pain | High (multi-site, multi-trade) | High (multi-job, multi-worker) |
| Willingness to pay | Higher (₹2–5k/month/site) | Lower (₹300–1k/month) |
| Decision speed | Slow (committee, partner) | Faster (single owner-operator) |
| Storey product fit today | Strong | Strong — just a smaller-scale instance |

**10× more sub-contractors than main contractors.** Lower individual ARPU,
but volume + faster sales cycles compensate. Plus referrals: every
sub-contractor on Storey is a recommendation node for their main contractor
+ their trade peers.

### What this means for positioning

Tagline evolves from:

> *"Storey: site-operations app for construction contractors in NE India."*

to:

> *"Storey: site-operations app for everyone running construction work in
> NE India — from 50-site main contractors to specialist trades managing
> their own jobs."*

### What this requires in code

**Almost nothing.** Multi-tenancy already supports any tenant at any scale.

| Feature | Main contractor uses it as... | Sub-contractor uses it as... |
|---|---|---|
| `tenants` table | Their construction firm | Their specialist trade firm |
| `sites` | Each construction project | Each job (could be "Mr Sharma's 5th-floor wiring") |
| `workers` | Their labour roster | Their helpers |
| `materials` | Steel, cement, etc. | Wires, conduit, switches |
| `expenses` | Site expenses | Site expenses |
| `tasks` | Construction phases | Wiring phases (DBs · main runs · finishing) |
| `subcontractors` (v1.2) | Their hired specialists | Their hired sub-sub-contractors |

Same fields, smaller numbers. Storey doesn't care about scale.

### What this requires in marketing

1. **Landing page subhead** — broaden from *"for construction contractors"* to
   *"for anyone running construction work — big or small."*
2. **Beta poster v2** — add a one-line callout: *"Are you an electrician /
   plumber / mason running your own jobs? Storey works for you too."*
3. **Sub-contractor onboarding flow inside Storey becomes a soft recruitment
   funnel** — when a main contractor adds "Mistri Ramesh" with his WhatsApp
   number, Ramesh (opt-in, not automatic) later gets a one-line WhatsApp
   from Storey: *"Karun added you to a project on Storey. Want your own free
   Storey account to track your own jobs?"*

That last point is the **viral loop** — ride the main contractor's adoption
as a recruitment channel for the 10× sub-contractor population.

---

## Pricing tier framework *(when MRR justifies, not now)*

A natural 2-tier model emerges from the dual-market insight:

```
Storey Solo — single-site, single-tenant
  ₹500/month
  For specialist trades, single sub-contractors, micro-firms
  Self-onboard, minimal support
  Upgrade path → Storey Pro when adding the 2nd site

Storey Pro — multi-site, multi-user, full features
  ₹2,000–5,000/month per site (volume discount at >5 sites)
  For main contractors with site teams
  Manual onboarding, dedicated support, advisory call quarterly

Storey Enterprise — for the future
  Custom pricing (₹50k+/month, multi-year)
  For tier-2 builders, govt-tied work, large project consortia
  Dedicated DB, premium support, custom reporting
  Discussed but parked until 50+ paying customers signal the need
```

**Don't introduce tiers yet.** Single price for v1.2 testers. Tiering
becomes a Phase 3 (Day 60–90) decision per ROADMAP-90.md.

---

## Why dual-marketing is Option C *(not A or B)*

Three strategic options were considered 2026-05-22:

| Option | Description | Verdict |
|---|---|---|
| **A** — Same product, ignore the new audience | Status quo. Sub-contractors stay as entities only. Leaves 10× audience on the table. | ❌ Misses a big upside |
| **B** — Two separate product lines (Pro + Lite) | Different marketing, channels, pricing. Maintains TWO products = solo-founder death by feature divergence. | ❌ Operational risk too high |
| **C** — Same product, dual marketing posture | Storey is one product that markets to anyone running construction site work. Each customer is a tenant at their own scale. | ✅ Recommended |

Option C wins because:
- **Zero code divergence** — same product, broader pitch
- **Natural upgrade path** — sub-contractors graduate to Pro tier as they add sites
- **Viral mechanic built in** — every sub-contractor on Storey is a node introducing the main contractor (or vice versa) into the network
- **No channel conflict** — both audiences are using the same product; if the main contractor sees his electrician is on Storey, that's *validation*, not threat

---

## What's deliberately deferred

These ideas are real but wrong-timing right now:

| Decision | Defer until... |
|---|---|
| Landing page rewrite to broaden pitch | 5 paying main contractors validate current positioning first |
| Sub-contractor self-signup flow | After v1.2 ships (the entity model is settled) |
| Tier pricing introduction | Day 60-90 (per ROADMAP-90.md Phase 3) |
| Viral WhatsApp recruitment | After 12 testers cleared *(done 2026-05-21)* + v1.2 ships *(planned ~Day 60)* — needs the onboarding flow to be polished first |
| Enterprise tier | After 50+ paying customers signal demand |

---

## How to know when these decisions are wrong

Update this doc when any of these data points shift:

| Signal | What it means |
|---|---|
| 5+ paying main contractors say *"this is too feature-heavy for me"* | Solo tier is needed sooner than expected |
| First sub-contractor self-signs up unprompted | Soft validation of dual-market thesis |
| Main contractor complains *"my electrician is also on this"* | Channel conflict is real — needs a positioning answer |
| Adjacent geography (Bihar / UP / Odisha) customer signs up cold | Geographic expansion possible earlier than 365-day plan |
| Tally adds operational features (workers / materials / sites) | Real competitive threat — need to defend the wedge |
| First "I want to install Storey on my own server" with serious money | Enterprise tier becomes urgent, not deferred |
