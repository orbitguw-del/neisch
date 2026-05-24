# Storey — Monetization 90-Day Launch Plan
### May 24, 2026 → Aug 21, 2026

> **This document is the single source of truth for turning Storey into
> a revenue-generating product.** Every week has clear deliverables.
> Every milestone has a binary done/not-done check.
>
> Read this every Monday. Mark what shipped. Plan the week.
> If you skip a Monday review, the plan doesn't work.

---

## The Three Numbers That Matter

```
DAY 30  →  Paywall infrastructure live in production (no contractor blocked yet)
DAY 60  →  First paying contractor on Razorpay subscription
DAY 90  →  5 paying contractors · ₹15,000+ MRR · Founding offer closed
```

---

## Pricing (Final — Do Not Re-Debate)

| Tier | Price | Sites | Team | Key unlock |
|---|---|---|---|---|
| **FREE** | ₹0 forever | 1 | 3 | Core ops only |
| **BASIC** | ₹2,999/month | 3 | 15 | Full ops + Reports |
| **ADVANCED** | ₹6,999/month | Unlimited | Unlimited | Budgeting + Analytics + Export |
| **ENTERPRISE** | ₹14,999/month | Unlimited | Unlimited | White-glove + custom reports |

**Annual pricing (push hard):**
- Basic annual: ₹24,999/year (save ₹11k — 3.7 months free)
- Advanced annual: ₹59,999/year (save ₹24k — 3.4 months free)

**Founding Contractor Offer (first 25 only):**
- Advanced features at Basic price: ₹2,999/month, locked for life
- Show "Founding Contractor" badge on their account
- Hard deadline: closes when 25 slots fill OR Day 90, whichever first
- Purpose: creates urgency, rewards early trust, still trains market on ₹2,999 floor

---

## Feature Gate Map

### FREE tier (1 site, 3 team, 10 workers)
- ✅ Sites (1 only)
- ✅ Workers (10 max)
- ✅ Tasks
- ✅ Inventory (view + basic add)
- ✅ Expenses (add + view)
- ❌ Material Receipts (locked)
- ❌ Equipment Tracking (locked)
- ❌ Vendors (locked)
- ❌ Reports — all tabs (locked)
- ❌ Material Budgeting (locked)
- ❌ XLS Export (locked)

### BASIC tier (3 sites, 15 team, 50 workers)
- ✅ Everything in FREE
- ✅ Material Receipts
- ✅ Equipment Tracking
- ✅ Vendors
- ✅ Reports — Consumption, Materials In
- ✅ Workers (50 max)
- ❌ Material Budgeting (locked — Advanced only)
- ❌ Budget vs Actual report (locked)
- ❌ Budget Health widget (shows teaser)
- ❌ XLS Export (locked)

### ADVANCED tier (unlimited)
- ✅ Everything in BASIC
- ✅ Material Budgeting (budget_qty + budget_rate)
- ✅ Budget vs Actual report
- ✅ Budget Health dashboard widget
- ✅ XLS Export (all reports)
- ✅ Full data export
- ✅ Priority WhatsApp support

---

## The ROI Message (memorise this — use on every call)

> *"A contractor with 3 active sites loses an average of ₹47,000/month
> to material leakage and untracked expenses. Storey costs ₹2,999.
> That's 6% of what you're already losing."*

Never lead with features. Always lead with what they lose without it.

---

## Phase 1 — Days 1–30: Infrastructure (May 24 – Jun 22)
**Goal: Paywall system built and deployed. No contractor blocked yet. Foundation solid.**

### Week 1 (May 24–30): Database + Feature Flags

| Day | Task | Done = |
|---|---|---|
| **May 24** | Write migration: add `plan`, `plan_expires_at`, `trial_ends_at`, `plan_updated_at` to `tenants` table | Migration file created, tested locally |
| **May 24** | Default all existing tenants to `plan = 'advanced'` (grace period — they keep everything) | Existing users not disrupted |
| **May 25** | Create `src/lib/planFeatures.js` — the single source of truth for all feature gates | File created, all features mapped |
| **May 26** | Update `authStore` to include `tenant.plan` in profile load | `profile.plan` accessible everywhere |
| **May 26** | Create `<PlanGate>` component — wraps any feature, shows locked overlay if plan insufficient | Component renders correctly in both locked + unlocked states |
| **May 27** | Create `usePlan()` hook — `canAccess(feature)`, `planLimits()`, `isAtLimit(type)` | Hook tested with hardcoded plan values |
| **May 28** | Deploy migration to production | `tenants.plan` column live on storeyinfra.com |
| **May 29–30** | Smoke test: existing contractor sessions still work, no regressions | All existing screens unaffected |

### Week 2 (May 31 – Jun 6): PlanGate + Upgrade Modal

| Day | Task | Done = |
|---|---|---|
| **Jun 1** | Build `<UpgradeModal>` — shows tier comparison, price, Founding Offer badge, WhatsApp CTA | Modal visually complete |
| **Jun 2** | Build `<PlanLimitBanner>` — inline banner when approaching limits ("You've used 2 of 3 sites") | Banner renders at 67% and 100% of limit |
| **Jun 3** | Build `<LockedFeatureCard>` — blurred preview with "Unlock with Advanced ↗" overlay | Card renders for Budget Health, Reports tabs |
| **Jun 4** | Gate: Reports tabs — Consumption + Materials In locked on FREE | FREE user sees locked overlay on these tabs |
| **Jun 5** | Gate: Budget vs Actual report tab locked on FREE + BASIC | Both tiers see locked overlay |
| **Jun 6** | Gate: Budget Health widget on dashboard — show teaser/locked card on FREE + BASIC | Teaser shows value without data |

### Week 3 (Jun 7–13): Razorpay Integration

| Day | Task | Done = |
|---|---|---|
| **Jun 7** | Set up Razorpay account + create Subscription Plans (Basic monthly, Basic annual, Advanced monthly, Advanced annual) | 4 plans created in Razorpay dashboard |
| **Jun 7** | Add Razorpay keys to Supabase secrets + Vercel env vars | Keys stored, not committed to git |
| **Jun 8** | Create Supabase Edge Function: `create-subscription` — creates Razorpay subscription, returns checkout URL | Function deployed |
| **Jun 9** | Create Supabase Edge Function: `razorpay-webhook` — handles `subscription.activated`, `subscription.cancelled`, `payment.failed` | Webhook handler deployed |
| **Jun 10** | Webhook: on `subscription.activated` → update `tenants.plan` to correct tier | Plan upgrades automatically on payment |
| **Jun 10** | Webhook: on `subscription.cancelled` → downgrade `tenants.plan` to `free` at period end | Cancellations handled gracefully |
| **Jun 11** | Test full payment flow end-to-end in Razorpay test mode | Checkout → payment → plan upgrade confirmed |
| **Jun 12** | Add `<UpgradeButton>` that calls `create-subscription` and redirects to Razorpay checkout | Button works from UpgradeModal |
| **Jun 13** | Deploy to production (still Razorpay test mode) — verify on storeyinfra.com | Full flow testable on production URL |

### Week 4 (Jun 14–22): Hard Limits + Polish

| Day | Task | Done = |
|---|---|---|
| **Jun 14** | Site creation limit: check `sites.count` vs `planLimits().maxSites` before allowing create | Creating 4th site on Basic shows upgrade prompt |
| **Jun 15** | Worker limit: check count before add | Worker limit enforced per plan |
| **Jun 16** | Team member limit enforcement | Team limit enforced |
| **Jun 17** | Gate remaining features: Material Receipts, Equipment, Vendors (locked on FREE) | All three show PlanGate overlay for FREE users |
| **Jun 18** | Gate: XLS Export button disabled/hidden on FREE + BASIC | Export locked appropriately |
| **Jun 19** | Build `/settings/billing` page — shows current plan, next renewal, upgrade options, cancel button | Billing page fully functional |
| **Jun 20** | 14-day FREE trial of ADVANCED — set `trial_ends_at` on new signups | New signups get 14-day advanced trial |
| **Jun 21** | Trial expiry: cron job or edge function that downgrades expired trials to FREE | Trials expire correctly |
| **Jun 22** | **Phase 1 complete review** — test every gate, every limit, every upgrade flow | All gates work. No regressions. Razorpay still in test mode. |

---

## Phase 2 — Days 31–60: Activate (Jun 23 – Jul 22)
**Goal: First paying contractor. Razorpay live. Outreach machine running.**

### Week 5 (Jun 23–29): Pricing Page + Go Live

| Day | Task | Done = |
|---|---|---|
| **Jun 23** | Build `/pricing` page — tier comparison table, ROI message, Founding Offer countdown, annual toggle | Page live at storeyinfra.com/pricing |
| **Jun 24** | Pricing page mobile-first: 360px single-column card stack | No horizontal scroll on Android |
| **Jun 25** | **Switch Razorpay to live mode** — real money now flows | Confirmed with a ₹1 test transaction |
| **Jun 25** | Email + WhatsApp notification to existing contractors: "Storey is now free for 14 days — here's what's coming" | Outreach sent to all current testers |
| **Jun 26** | Set all existing contractor accounts to `plan = 'advanced'`, `trial_ends_at = Jul 10` | Grace period: they see full features, know it's a trial |
| **Jun 27** | Build trial countdown banner: "Your full access trial ends in X days — upgrade to keep everything" | Banner appears in header during trial |
| **Jun 28** | Add `/settings/billing` link to sidebar nav | Easy path to upgrade visible always |
| **Jun 29** | Smoke test entire flow on real phone (Android, 360px) | Every gate, every upgrade path works on mobile |

### Week 6 (Jun 30 – Jul 6): Arun Conversion

| Day | Task | Done = |
|---|---|---|
| **Jun 30** | Call Arun personally — walk through the value, explain Founding Offer | Call done. Objections noted. |
| **Jul 1** | Send Arun a personalised WhatsApp: *"Your trial ends Jul 10. Lock in Founding price — ₹2,999 for Advanced forever."* | Message sent with payment link |
| **Jul 2** | For each of the 12 testers — send individual WhatsApp (not broadcast) with their usage stats: *"You've tracked X materials, Y expenses. Here's your Storey summary."* | 12 personal messages sent |
| **Jul 3** | Set up Resend email: trial expiry reminders at Day -7, Day -3, Day -1 | Automated emails running |
| **Jul 4** | Create WhatsApp message templates for: trial expiry, payment success, payment failed | 3 templates ready |
| **Jul 5** | Add "Refer a contractor, get 1 month free" referral mechanics — basic tracking only | Referral link generates + tracks |
| **Jul 6** | **Target: Arun pays.** First Razorpay subscription activated. | ✅ or escalate |

### Week 7 (Jul 7–13): Convert 3 More

| Day | Task | Done = |
|---|---|---|
| **Jul 7** | Trial expiry for most contractors — upgrade prompts go live | Paywall enforced for expired trials |
| **Jul 8** | Personal call to each tester who hasn't upgraded: understand objections | Objections documented |
| **Jul 9** | If price objection: offer 2 months free on annual (not discount on monthly) | Annual plan closed if needed |
| **Jul 10** | WhatsApp broadcast to the 30-person list from Week 1: *"3 contractors now use Storey. Founding price closes soon."* | Broadcast sent |
| **Jul 11** | Fix any payment flow friction uncovered from first conversions | Issues resolved within 48h |
| **Jul 12** | **Target: 3 paying contractors total** | ₹8,997/month MRR minimum |
| **Jul 13** | Document every objection heard — product/pricing/trust. This is gold. | Objection map written in docs/OBJECTIONS.md |

### Week 8 (Jul 14–22): Scale Outreach

| Day | Task | Done = |
|---|---|---|
| **Jul 14** | Visit 3 contractor offices in person — with printed one-pager showing ROI | 3 face-to-face meetings done |
| **Jul 15** | Post first WhatsApp Business Status: "₹47,000 saved this month across our contractor network" | Post published |
| **Jul 16** | Build simple `/demo` page — 60-second screen-recording walkthrough embedded | Demo page live |
| **Jul 17** | Ask Arun for a 30-second WhatsApp video testimonial: *"Storey bachaya mera X rupiya"* | Video received or scheduled |
| **Jul 18** | Identify 10 new contractors through Arun's referrals + personal network | 10 new numbers in contact list |
| **Jul 19** | Send personalised intro to each of 10 new contacts | 10 messages sent |
| **Jul 20** | **Target: 5 paying contractors** | ₹14,995/month MRR minimum |
| **Jul 21–22** | Review what's converting, what isn't. Update ROI message if needed. | Review done. Changes documented. |

---

## Phase 3 — Days 61–90: Scale + Harden (Jul 23 – Aug 21)
**Goal: 5+ paying. Founding offer closed. System bulletproof. First referral.**

### Week 9 (Jul 23–29): Tighten the Machine

| Day | Task | Done = |
|---|---|---|
| **Jul 23** | Payment failure handling — email + WhatsApp if card declines | Retry flow working |
| **Jul 24** | Cancellation flow — survey on cancel: "Why are you leaving?" | Cancellation reason captured |
| **Jul 25** | Dunning: 3-day grace on failed payment before downgrade | Dunning working correctly |
| **Jul 26** | Admin panel (`/admin/tenants` — superadmin only): see all plans, MRR, trial status, override plan | Admin view live |
| **Jul 27** | Usage analytics: which features do paying contractors use most? | Basic event tracking in Supabase |
| **Jul 28** | Fix the top 3 issues reported by paying contractors this week | Issues resolved |
| **Jul 29** | **MRR check** — update FINANCIAL-PROJECTION.md with actuals | Actual vs projected documented |

### Week 10 (Jul 30 – Aug 5): Referral + Expansion

| Day | Task | Done = |
|---|---|---|
| **Jul 30** | Referral program live: unique link per contractor, 1 month free per activated referral | Referral mechanic working |
| **Jul 31** | Ask every paying contractor for 2 referrals via personal WhatsApp | Messages sent |
| **Aug 1** | Founding Offer: send final countdown to any contractors still on trial | "48 hours left on Founding Price" |
| **Aug 2** | Post contractor case study on storeyinfra.com — with permission, real numbers | Published |
| **Aug 3** | Identify contractors who've added 2+ sites — candidates for Advanced upgrade | Expansion list built |
| **Aug 4** | Personal call to each single-site Basic contractor: "You're managing X. Advanced unlocks budget tracking — here's why it matters for your sites." | Calls done |
| **Aug 5** | **Target: First upgrade from Basic → Advanced** | Revenue per contractor increases |

### Week 11 (Aug 6–12): Enterprise Pipeline

| Day | Task | Done = |
|---|---|---|
| **Aug 6** | Identify 3 large contractors in the network (5+ sites, big projects) | 3 names identified |
| **Aug 7** | Personal approach to each — offer live demo, 30-day free Advanced trial | Meetings booked |
| **Aug 8** | Build Enterprise pitch: 1-page PDF with ROI math for a ₹5Cr project | PDF created |
| **Aug 9** | Demo to first enterprise prospect | Demo done |
| **Aug 10** | Follow up with custom proposal if needed | Proposal sent |
| **Aug 11** | File Pvt Ltd documents with CA if not already done | CA confirms filing |
| **Aug 12** | **MRR check: ₹15,000+?** | Verify against target |

### Week 12 (Aug 13–21): Day 90 Wrap

| Day | Task | Done = |
|---|---|---|
| **Aug 13** | **CLOSE Founding Offer** — anyone who hasn't upgraded loses the price lock | Founding Offer officially closed |
| **Aug 14** | New signups now see full pricing (₹2,999 Basic, ₹6,999 Advanced) | Pricing page updated |
| **Aug 15** | Publish transparent "How we got to 5 paying customers in 90 days" WhatsApp post | Trust-building content published |
| **Aug 16** | Update ROADMAP-90.md with actuals — what hit, what missed | Honest review documented |
| **Aug 17** | Update FINANCIAL-PROJECTION.md with Month 1-3 actuals | Projection re-baselined |
| **Aug 18** | Identify top-requested feature from paying contractors (the v1.3 candidate) | Feature logged in TODO.md, NOT built |
| **Aug 19** | Send personal thank-you to every paying contractor | 5+ thank-you messages sent |
| **Aug 21** | **Day 90 Review** — open ROADMAP-90.md, assess all three milestones | Decide: graduate to ROADMAP-180.md or extend |

---

## Technical Architecture Reference

### Database Migration

```sql
-- Migration: 20260524000000_tenant_plans.sql
ALTER TABLE tenants
  ADD COLUMN plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'basic', 'advanced', 'enterprise')),
  ADD COLUMN plan_expires_at timestamptz,
  ADD COLUMN trial_ends_at timestamptz,
  ADD COLUMN plan_updated_at timestamptz DEFAULT now(),
  ADD COLUMN razorpay_subscription_id text,
  ADD COLUMN razorpay_customer_id text;

-- Existing tenants get advanced plan during grace period
UPDATE tenants SET plan = 'advanced', trial_ends_at = now() + interval '21 days';

-- Index for webhook lookups
CREATE INDEX tenants_razorpay_sub_idx ON tenants(razorpay_subscription_id);
```

### Feature Flag Map — `src/lib/planFeatures.js`

```js
export const PLANS = {
  free:       { maxSites: 1,        maxTeam: 3,        maxWorkers: 10  },
  basic:      { maxSites: 3,        maxTeam: 15,       maxWorkers: 50  },
  advanced:   { maxSites: Infinity, maxTeam: Infinity, maxWorkers: Infinity },
  enterprise: { maxSites: Infinity, maxTeam: Infinity, maxWorkers: Infinity },
}

export const FEATURES = {
  receipts:       { minPlan: 'basic'    },
  equipment:      { minPlan: 'basic'    },
  vendors:        { minPlan: 'basic'    },
  reports:        { minPlan: 'basic'    },
  budgeting:      { minPlan: 'advanced' },
  budget_report:  { minPlan: 'advanced' },
  export_xls:     { minPlan: 'advanced' },
}

const PLAN_ORDER = ['free', 'basic', 'advanced', 'enterprise']

export function canAccess(feature, plan) {
  const req = FEATURES[feature]?.minPlan ?? 'free'
  return PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(req)
}

export function planLimits(plan) {
  return PLANS[plan] ?? PLANS.free
}
```

### Key Components to Build

```
src/components/paywall/
  PlanGate.jsx          — wraps any feature, shows locked overlay
  UpgradeModal.jsx      — tier comparison + pricing + Razorpay CTA
  PlanLimitBanner.jsx   — "2 of 3 sites used" warning
  LockedFeatureCard.jsx — blurred teaser for premium features
  TrialBanner.jsx       — countdown banner during trial period
  FoundingBadge.jsx     — "Founding Contractor" badge on account

src/pages/settings/
  Billing.jsx           — current plan, renewal date, upgrade/cancel

src/hooks/
  usePlan.js            — canAccess(), planLimits(), isAtLimit()

supabase/functions/
  create-subscription/  — creates Razorpay subscription
  razorpay-webhook/     — handles payment events → updates plan
  expire-trials/        — cron: downgrades expired trials
```

### Edge Function: `razorpay-webhook`

```js
// Handles these events:
// subscription.activated   → plan = 'basic' or 'advanced'
// subscription.cancelled   → plan = 'free' at period end
// subscription.expired     → plan = 'free'
// payment.failed           → send WhatsApp alert, start dunning
```

---

## Conversion Playbook (WhatsApp Scripts)

### Initial outreach to existing tester

> *"Hi [Name], I'm Karun from Storey. You've been using the app for [X weeks].
> Quick question — have you seen the material tracking saving you time?
> I'm giving the first 25 contractors Founding access — Advanced features
> at ₹2,999/month, locked for life. Interested to know more?"*

### After they say "sounds expensive"

> *"Totally fair. Let me ask — what does one bag of cement cost right now?
> If Storey prevents even 50 bags of leakage a month, it's paid for itself
> 3x over. Most contractors I've talked to find 80-120 bags. Want me to
> show you how the tracking works on your own site data?"*

### After they say "let me think"

> *"No pressure. Founding price closes when we hit 25 contractors — already
> have [X]. After that it's ₹6,999 for the same features. Just letting you
> know so you have the full picture."*

### After they pay

> *"Welcome to Storey, [Name]. You're one of our Founding Contractors.
> My number is your direct line — any issue, message me personally.
> Can you do me one favour? If you know any other contractors who track
> materials manually, send them my number."*

---

## Success Metrics — Check Weekly

| Metric | Day 30 target | Day 60 target | Day 90 target |
|---|---|---|---|
| Paying contractors | 0 (infra live) | 3 | 5+ |
| MRR | ₹0 | ₹8,997 | ₹15,000+ |
| Contractors on trial | All existing | — | — |
| Trial → paid conversion | — | ≥ 30% | ≥ 40% |
| Founding slots used | — | 10 | 25 (closed) |
| Razorpay payment failures | 0 | ≤ 1 | ≤ 2 |
| Support issues (billing) | 0 | ≤ 2 | ≤ 3 |
| Referrals received | 0 | 2 | 5 |
| NPS (informal WhatsApp check) | — | — | 4+ out of 5 avg |

---

## What NOT to Do in These 90 Days

- ❌ **Don't discount the monthly price** — offer annual or founding lock instead
- ❌ **Don't build new features** for any contractor until they've paid
- ❌ **Don't offer "free forever" deals** — it devalues every future sale
- ❌ **Don't wait for the pricing page to be perfect** before collecting payment
- ❌ **Don't take payment via UPI/bank transfer** — Razorpay subscription only (recurring billing)
- ❌ **Don't build Enterprise features** before you have an Enterprise customer
- ❌ **Don't spend on Google Ads** until organic conversion is understood
- ❌ **Don't redesign the app** — the product is good enough, the problem is sales

---

## Dependencies + Blockers (Resolve Before Day 30)

| Item | Owner | Blocker if unresolved |
|---|---|---|
| Razorpay account approved | Karun | Cannot collect payment |
| Pvt Ltd registration (or sole proprietorship for interim) | CA | Cannot open business bank account |
| Business bank account | Karun + CA | Razorpay payouts stalled |
| GST registration (voluntary, early) | CA | Required for B2B invoices |
| Resend email domain verified | Karun | Trial expiry emails go to spam |
| WhatsApp Business API (or use personal number for now) | Karun | Broadcast limit 256 contacts; fine for now |

---

## Escalation Rules

If Day 60 arrives and 0 contractors have paid:
1. Do NOT change the price down
2. Do NOT add more features
3. DO have 5 one-on-one calls and ask: "What would make you pay today?"
4. Document every answer in OBJECTIONS.md
5. Fix the thing that comes up 3+ times — it's product, not price

If Day 90 arrives and MRR < ₹10,000:
1. Extend the 90-day plan by 30 days
2. Activate the referral program aggressively
3. Consider a single Founding Enterprise deal at ₹8,000/month to anchor
4. Still do NOT open ROADMAP-180.md until MRR target is hit

---

## Revision History

| Date | Change |
|---|---|
| 2026-05-24 | Document created — first version |

---

*This document lives at `docs/MONETIZATION-90-DAY-PLAN.md`.
Update it every Monday. It is the operating plan, not a wish list.*
