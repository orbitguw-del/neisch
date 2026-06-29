# Onboarding an Existing Site to Storey
### Sales aid + intern playbook. ~4–6 hours of focused work per site.

> Use when a contractor says *"we're already 3 months into the project — can we still use Storey?"* Yes — here's the checklist.

---

## The 60-second pitch line (memorise)

> *"To get you started, we need 4–6 hours. Someone counts the materials on site, lists your workers and subs, and we set you up. After that, you log deliveries and consumption from that day. Past data stays as your memory — Storey starts from today."*

---

## ESSENTIAL (must finish before "going live") — ~3 hours

| # | Step | Effort | Where in Storey |
|---|------|--------|-----------------|
| 1 | **Create site shell** — name, address, contractor, cost centres (Building / Boundary wall / Utilities / etc.) | 15 min | Sites → Add site |
| 2 | **Materials master list** — what materials are in use on this site | 30 min | Materials → Add material (or paste from existing site as template) |
| 3 | **Worker register** — current team + wage rates | 20 min per 10 workers | Workers → Add worker |
| 4 | **Subcontractor register** — active subs + scope | 15 min per sub | Subcontractors → Add |
| 5 | **Vendor / supplier list** — current suppliers with contacts | 15 min | Vendors module |
| 6 | **Opening stock count** — physical count of every material currently on site | **1–3 hrs (THE bottleneck)** | Materials → Opening Stock Modal (superadmin path) |

---

## HIGHLY RECOMMENDED (within first week) — ~1 hour

| # | Step | Why |
|---|------|-----|
| 7 | Budget per cost centre | "Expense vs budget" needs a baseline |
| 8 | Current outstanding payments to subs | Payments report otherwise looks wrong |
| 9 | Reorder levels per material | So low-stock alerts work |
| 10 | For TMT: `unit_weight_kg` per rod size | Variance feature needs this (Phase 1+2 just shipped) |

---

## CAN WAIT (do gradually, or never)

| # | Item | Why optional |
|---|------|--------------|
| 11 | Historical receipts (past months of deliveries) | Too much work, too little value |
| 12 | Past attendance | Start fresh from today |
| 13 | Old expense records | Same |
| 14 | Architect drawings, contracts, BOQs | Upload when documents module ships (V1) |

---

## The bottleneck — opening stock count

This is THE only painful step. For a typical residential RCC site mid-construction:
- 30–50 distinct material types in stock
- Each needs a physical count

Counting tips:
- **Cement bags:** count, no estimation
- **Steel rods:** count pieces by diameter (8/10/12/16/20mm)
- **Sand, aggregate, brick chips:** measure pile dimensions or trust contractor estimate (cft)
- **Tiles, fittings:** count packs/boxes
- **Wood, plywood:** count by dimension

**Time-box: 90 min for a typical residential site, 3–4 hours for a larger commercial site.**

---

## Suggested team

| Role | Why |
|------|-----|
| **Contractor** present | He knows what's where, signs off on quantities |
| **Intern** doing data entry | Saves contractor's time; gives intern field exposure |
| **Storekeeper** if available | Has the inventory in his head already |
| A measuring tape | For sand/aggregate piles |

---

## Day-one onboarding script (for interns)

1. **Arrive on site with laptop + power bank + measuring tape + this checklist**
2. **Walk the whole site with the contractor first** (15 min) — note what's stored where, who works there
3. **Open Storey on your laptop, sign in as the contractor's account**
4. **Work through steps 1–6** in order. Don't skip. Don't backfill history.
5. **Test one real entry** — record one material delivery in Storey while you're there
6. **Show the contractor the Materials list + Daily Log on his phone** — confirm he can find it
7. **Hand over: contractor's WhatsApp will get a daily summary** (when implemented)
8. **Schedule a 1-week check-in** — call the contractor in 7 days to ensure he's logging

---

## What's MISSING in Storey today (product gaps)

These would smooth onboarding but don't block sales — see `docs/TODO.md` for build queue.

| Gap | Effort | Impact |
|-----|--------|--------|
| Self-service "Onboard existing site" wizard | ~3 days | Removes superadmin-only barrier |
| Bulk-paste opening stock (paste from Excel "Material, Qty") | ~1 day | Cuts opening-stock time from 90 min to 30 min |
| Pre-seeded material list per project type ("Residential RCC", "Commercial", "Interior") | ~4 hours | Skip step 2 entirely for standard projects |

---

## Connects to intern strategy

**This is exactly what interns do best.** Each intern can onboard 1 contractor per day after Day 1 training.

5 interns × 4 days = **20 contractors onboarded in week 1** of an intern cycle.

The intern hiring plan ([project_intern_hiring_2026_06](../memory)) is directly load-bearing for Storey's contractor-acquisition rate.

---

## Status

- **Last updated:** 2026-06-23
- **Tested at:** Garchuk (John Pathak) — partially (materials seeded centrally, not via this full flow)
- **Next site to onboard with this checklist:** TBD
