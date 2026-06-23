# BOQ / BIM Integration — Storey's Position
### Considered, scoped, **deliberately deferred**. Last reviewed: 2026-06-23.

> Use this doc when an investor, advisor, contractor, or partner asks Storey about Revit / BIM / BOQ integration. It is our honest position: we know what to build, we know how to scope it, and we know why we're not building it yet.

---

## Field signal (2026-06-23)

Karun spoke to a working architect — **he uses SketchUp**, not Revit. This single data point is consistent with the broader pattern: in NE-India residential architecture, SketchUp dominates, Revit is for enterprise. **Consequence:** Revit-specific integration is now treated as a **customisation-only** offering for enterprise customers — not a default product feature.

---

## TL;DR (the one-line answer)

> *"BOQ entry is on our roadmap as manual + Excel-paste. Revit / IFC auto-extraction is offered only as a paid customisation for enterprise customers — most of our contractors work with SketchUp or AutoCAD, where auto-extraction doesn't add value."*

---

## What we considered

A BIM / Revit integration that would let a contractor upload an architect's model file once at project start and auto-populate the materials list ("Bill of Quantities" — BOQ) for that site. Source doc: `Revit_Integration_Strategy_Storey.pdf` (June 2026).

The doc proposed two paths:
- **Autodesk APS** (paid, ~₹375 per model upload)
- **Open-source IFC stack** (IFC.js + IfcOpenShell, MIT-licensed, zero per-call cost)

And two use surfaces:
- A 3D viewer on site supervisor's phone with tap-to-log progress
- Contractor-office BOQ extraction (back-office)

---

## What we kept, what we discarded

| Element | Decision | Why |
|---------|----------|-----|
| 3D model viewer on the supervisor's phone | **Discarded** | Storey's user is a 40s supervisor on a 4-year-old Android in patchy 4G. A 3D viewer will crash, drain battery, or both. Wrong user, wrong device, wrong context. |
| Tap-to-log on the 3D model | **Discarded** | Same reason. The mistry's job is to bind rebar, not navigate WebGL meshes. |
| Contractor-office BOQ extraction | **Kept as future feature** | Right user (the contractor at his laptop), real pain (BOQ takes days, costs ₹15k–50k per project to outsource to a QS), and a clean data foundation for variance reporting that we already want. |
| IFC.js + IfcOpenShell (open-source path) | **Preferred path** | Zero per-upload cost, no Autodesk lock-in, supports Archicad / Tekla / Vectorworks not just Revit. |

---

## The phased plan (when we DO build this)

We will build BOQ extraction as a **three-tier feature**, not as a Revit-only thing. All three tiers feed the same backend `planned_quantity` column on each material.

### Tier 1 — Manual BOQ entry *(builds for 100% of contractors)*
At project creation, the contractor types or pastes the planned material quantities. The materials list pre-populates with planned values. **Variance tracking** (planned vs received vs consumed) becomes possible immediately.
**Effort:** ~1 week.

### Tier 2 — Excel BOQ paste *(builds for ~70% of contractors)*
Contractor pastes their existing Excel BOQ. App auto-parses rows, fuzzy-matches material names, confirms each row.
**Effort:** ~2 weeks.

### Tier 3 — IFC / Revit auto-extract *(custom enterprise only — NOT default product)*
IfcOpenShell parses the IFC file, extracts material schedules, maps to Storey materials. Contractor reviews and confirms.
**Effort:** ~3–4 weeks.
**Positioning:** offered only as a paid customisation to enterprise customers (large commercial builders who actually work with Revit). Not in the default roadmap. Most NE-India residential contractors do not have Revit files; SketchUp models don't carry quantity data by default; AutoCAD / PDF plans don't either. Auto-extract from a model file is a small-segment feature.

---

## Why we are NOT building this yet

1. **Feature freeze:** Storey has 1 live pilot site and 0 paying customers. Internal rule: NO new features until 5 paying customers.
2. **Unknown demand in our segment:** Most NE-India residential contractors work from hand-drawn or basic AutoCAD plans, not Revit. The percentage with Revit files is the **decision-blocking variable** — we haven't measured it.
3. **Scarce engineering time:** Every week spent building BOQ is a week not spent getting John (Garchuk pilot) to log materials reliably. The pilot's survival is the more existential bet.
4. **Build sequence:** Even if we build it tomorrow, Tier 1 must come before Tier 3. The world is full of beautiful BIM integrations that no contractor uses because manual entry was missing.

---

## What would change our answer

Two conditions, either of which triggers Tier 1:

| Trigger | What it means |
|---------|---------------|
| **5+ paying contractors** | The freeze rule lifts; we have signal that the base product works. |
| **5+ contractors specifically ask for BOQ import** (unprompted, not when we ask leading questions) | Real demand surfaced. |

To upgrade to Tier 3 (Revit parsing specifically), we need one more trigger:

| Trigger | What it means |
|---------|---------------|
| **Survey shows 30%+ of our contractors work from Revit files** | The Revit-specific work is worth doing. |

---

## The data we are missing (the survey we need to run)

One WhatsApp message to 10 active prospects:

> *"Quick question — do you usually have a Revit or AutoCAD file from your architect, or do you work mostly from paper / hand-drawn plans? And how do you currently make your BOQ — your own calculation, Excel, or hire a quantity surveyor?"*

Until this survey is done, all BOQ feature talk is speculation.

---

## If someone asks "why no BIM integration in Storey?"

Use this answer:

> *"BOQ entry is on our roadmap as manual and Excel-paste. Most of our contractors get SketchUp models or AutoCAD plans from their architects — neither carries quantity data, so auto-extract doesn't help them. Revit integration is offered only as a paid customisation for enterprise customers who already work in Revit."*

---

## If an investor / advisor pushes "you should ship BIM to differentiate"

Use this answer:

> *"BIM differentiation matters for the ~10% of contractors who use Revit. For the 90% we serve, BIM is a non-starter — most of them work with SketchUp, AutoCAD, or paper. The differentiator that wins our segment is not 'we have BIM' — it's 'the supervisor in his 40s can use it on day one without training'. We will earn BIM as a paid customisation once we earn the 90%. Order of operations matters."*

---

## If a contractor specifically asks "can I import my Revit model?"

> *"Yes, that's a paid customisation we set up project-by-project. It needs your architect to export the model as IFC4. Let's first get your basic site running on Storey; once you're using us daily, we'll quote the Revit setup as an add-on."*

Translation: don't refuse; price it as bespoke; let revenue decide whether it's worth productising.

---

## Status

- **Today (2026-06-23):** Shelved. No code, no design work, no UI. This doc exists so the idea is not lost.
- **Re-review trigger:** when Storey hits 5 paying customers, or when 5+ contractors ask unprompted.
- **Owner of decision:** Karun.
- **Re-review action:** run the 10-contractor survey above, then re-read this doc, then decide whether to build Tier 1.

---

*Source doc: `Revit_Integration_Strategy_Storey.pdf` (saved separately).*
*Analysis: Claude conversation 2026-06-23.*
