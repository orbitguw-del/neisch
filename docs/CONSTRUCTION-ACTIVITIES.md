# Construction site activities — phase-based + trade-based reference

> Canonical reference for what happens on a construction site, organized two
> ways: by **phase** (chronological) and by **trade** (people-shaped). Used as
> source-of-truth for:
>
> - v1.2 sub-contractor `work_type` dropdown (17-trade taxonomy at the end)
> - v1.2 Work Order PDF (scope categorization)
> - Future v2 reports (filter by trade)
> - Onboarding new engineers / partners — domain map in 10 minutes
>
> *Last updated 2026-05-22*

---

## Part 1 — Phase-based view (chronological)

Markers: ✅ Storey covers this today · 🟡 v1.2 in development · — out of scope

### A. Pre-construction & site setup *(weeks 1–3 of a project)*

| Activity | Storey today? |
|---|---|
| Land survey, boundary marking | — |
| Soil / strata testing | — |
| Site office + labour quarters + material store setup | — *(could be a site detail field)* |
| Utility connections — power, water, sanitation | — |
| Compound wall / temporary fencing | ✅ trackable as a Task |
| Material procurement plan (initial BOQ) | 🟡 v1.2 (budget tracking) |
| Sub-contractor sourcing + scope freezing | 🟡 v1.2 (onboarding) |
| Workforce planning (head-count + skills) | ✅ Workers module |
| Insurance + statutory registrations (PF, ESI, labour licence) | — |

### B. Earthwork & foundation *(weeks 3–8)*

- Excavation (manual / JCB) — ✅
- Cutting and filling — ✅
- Soil compaction — ✅
- Foundation pit digging — ✅
- Shoring / strutting — ✅
- Dewatering (monsoon-critical in NE) — ✅
- PCC (footing concrete) — ✅
- Reinforcement (rebar) cutting, bending, tying — ✅
- Footing casting — ✅
- Column starters — ✅
- Plinth beam casting — ✅
- Anti-termite treatment — ✅
- Damp-proof course (DPC) — ✅

### C. Superstructure (RCC) *(weeks 6–20+, per floor)*

- Column casting (each floor) — ✅
- Beam casting — ✅
- Slab casting — ✅ *(the iconic milestone — Storey supports Task photos for this)*
- Staircase — ✅
- Lintel + chajja — ✅
- Curing schedule + verification — 🟡 *Storey could prompt this via tasks; not automated yet*

### D. Masonry & roofing *(weeks 12–24)*

- Brickwork (external + partition) — ✅
- Block work (lightweight / AAC) — ✅
- Stone masonry — ✅
- Sloped roof (CGI / Mangalore tile — common in NE) — ✅
- Waterproofing — ✅
- Insulation — ✅

### E. MEP — Mechanical / Electrical / Plumbing *(parallel to F, weeks 16–30)*

- Conduit laying (electrical, pre-plaster) — ✅
- Wiring + switchboards + DBs — ✅
- Earthing — ✅
- Inverter / generator integration — ✅
- Underground drainage, vent pipes, soil pipes — ✅
- Water supply lines — ✅
- Plumbing fixtures (basins, WCs, taps) — ✅
- Septic tank / soak pit — ✅

### F. Finishing *(weeks 22–36)*

- Internal plaster — ✅
- External plaster — ✅
- Putty / smoothing — ✅
- Flooring — sub-floor leveling — ✅
- Tile / marble / vitrified laying — ✅
- Skirting — ✅
- Outdoor paving (pavers, kota stone, IPS) — ✅
- Door & window frame fixing — ✅
- Shutter installation + glazing — ✅
- Locks + fittings — ✅
- Painting — primer, putty, paint — ✅
- POP / false ceiling — ✅
- Wood polish / textures — ✅

### G. External works *(weeks 30–40)*

- Storm water drainage — ✅
- Compound paving — ✅
- Landscaping / horticulture — ✅
- Gates + boundary wall — ✅
- Signage — ✅

### H. Daily site operations *(every day)*

| Activity | Storey today? |
|---|---|
| Worker attendance | ✅ |
| Daily log / progress report | ✅ (with photo) |
| Material receipt + GRN | ✅ |
| Material allocation to work | ✅ (since v1.1.5) |
| Material transfer between sites | ✅ (4-stage flow) |
| Equipment issue + return | ✅ |
| Equipment maintenance log | 🟡 *partial — v2 enhancement* |
| Petty cash + site expenses | ✅ |
| Vehicle / transport coordination | — *no logistics module* |
| Visitor log | — |
| Quality checks (slump test, cube test, level) | — *v2 candidate* |
| Photo documentation | ✅ |
| Daily huddle / standup notes | — *could fit Daily Log* |

### I. Project coordination *(weekly + ad-hoc)*

| Activity | Storey today? |
|---|---|
| Drawings / RFI management | — *v2 candidate* |
| Variation / change orders | 🟡 v1.2 (Variation Orders for sub-contractors) |
| Sub-contractor coordination | 🟡 v1.2 |
| Vendor / supplier follow-up | — *v2 candidate* |
| Client communication log | — |
| Payment milestone tracking | 🟡 v1.2 (sub-contractor payment ledger) |
| Running bills + certification | 🟡 v1.2 partial |
| Weekly progress review | ✅ Reports |
| Project timeline / Gantt | — *v1.x backlog* |

### J. Safety & compliance *(daily + statutory)*

| Activity | Storey today? |
|---|---|
| PPE issue & sign-off | — *v2 candidate* |
| Safety drills + records | — |
| Fire safety checks | — |
| Site safety officer rounds | 🟡 *could be a Task* |
| Govt inspections (PWD, electrical, fire, pollution) | — |
| Statutory compliance (PF, ESI, labour licence renewals) | — |

### K. NE-India specific context

| Activity | Storey today? |
|---|---|
| Monsoon planning (Jun–Sep heavy rain, work paused on certain activities) | — *v2: weather-aware tasks* |
| Labour migration (tea-garden cycles, festival season) | — |
| Brick supply from local kilns | ✅ via Materials |
| Sand mining permits (state-wise rules) | — |
| Transport — NH-37 / NH-2 logistics, mountain road delays | — |

---

## Part 2 — Trade-based view (people-shaped)

Each trade below corresponds to a typical sub-contractor scope.

### L1. Civil / structural trades

| Trade | What they do | Phase(s) | NE-India term |
|---|---|---|---|
| **Excavation / earthwork** | JCB ops, manual digging, soil shifting | B | Mati ka kaam |
| **Bar bending / rebar** | Cutting, bending, tying steel | B, C | Sarbandhwala |
| **Form work / shuttering** | Plywood + props for casting columns/beams/slabs | C | Shuttering wala |
| **RCC / concreting** | Pour, vibrate, level, cure | B, C | RCC mistri / Concrete contractor |
| **Mason — brickwork** | Brick + mortar walls | D | Raj mistri |
| **Mason — block work** | AAC / concrete block walls | D | Block mistri |
| **Mason — stone** | Random rubble, dressed stone | D | Patthar mistri |
| **Plastering** | Internal + external, sand-cement | F | Plaster mistri |
| **Roofing — sloped** | CGI, Mangalore tile, GI sheet | D | Tin / chal mistri |
| **Waterproofing** | Terraces, bathrooms, basements | D, F | Waterproofing contractor |

### L2. MEP trades

| Trade | What they do | Phase(s) | NE-India term |
|---|---|---|---|
| **Electrical — wiring** | Conduit, wiring, switchboards, DB | E | Electrical mistri / Bijli wala |
| **Electrical — earthing** | Pits, copper plate, strip | E | (same) |
| **Electrical — fixtures** | Lights, fans, plugs, switches | E, F | (same) |
| **Solar / inverter** | Panel install, battery, inverter integration | E | Solar contractor |
| **Plumbing — water supply** | Pipes, taps, valves, overhead tank | E | Plumbing mistri / Naloowala |
| **Plumbing — drainage** | Soil pipes, vent pipes, traps | E | (same) |
| **Plumbing — fixtures** | WCs, basins, kitchen sinks | E, F | (same) |
| **Septic tank / soak pit** | Excavation + masonry combo | E | (same) |
| **HVAC** | AC, ducting, chiller | E | HVAC contractor *(rare in SMB NE-India)* |
| **Fire safety** | Sprinklers, hydrants, fire panels | E | Fire contractor *(commercial only)* |

### L3. Finishing trades

| Trade | What they do | Phase(s) | NE-India term |
|---|---|---|---|
| **Tiling — floor** | Vitrified, ceramic, anti-skid | F | Tile mistri / Marble mistri |
| **Tiling — wall** | Kitchen, bathroom, dado | F | (same) |
| **Marble / granite** | Slab, polishing, edging | F | Marble mistri |
| **Painting — internal** | Primer, putty, emulsion | F | Painter / Rang mistri |
| **Painting — external** | Weatherproof, texture | F | (same) |
| **POP / false ceiling** | Gypsum ceiling, cove lighting | F | POP mistri |
| **Wallpaper / texture** | Decorative finishes | F | (rarely standalone) |
| **Wood polish** | French polish, melamine | F | Polish mistri |

### L4. Joinery / carpentry trades

| Trade | What they do | Phase(s) | NE-India term |
|---|---|---|---|
| **Carpentry — door/window frames** | Sal wood / engineered frames | F | Carpenter / Kaath mistri |
| **Carpentry — shutters** | Flush doors, panel doors | F | (same) |
| **Carpentry — built-ins** | Wardrobes, kitchen cabinets, shelves | F | (same) |
| **Wooden flooring** | Strip / engineered planks | F | *(specialised contractor)* |

### L5. Metal trades

| Trade | What they do | Phase(s) | NE-India term |
|---|---|---|---|
| **Steel fabrication / welding** | Railings, gates, grills, trusses | C, F, G | Welding mistri / Lohaar |
| **Aluminum** | Windows, sliding doors, façade | F | Aluminum contractor |
| **Glass** | Glazing, shower partitions, façade | F | Glass contractor |
| **Structural steel** | Trusses, columns, beams (pre-fab) | C | Steel fabricator |

### L6. Site services *(specialist support, not stand-alone scope)*

| Trade | What they do | Phase(s) |
|---|---|---|
| **Scaffolding contractor** | Erects + dismantles | C, D, F |
| **Crane / hoist operator** | Material lifting | C, D |
| **Stone polishing** | Marble / kota grinding | F |
| **Anti-termite treatment** | Pre + post construction | B, F |
| **Pest control** | Final hand-over | G |
| **Landscape / horticulture** | Lawn, plants, irrigation | G |

### L7. Specialty / less-common in SMB NE-India

| Trade | When you'd see them |
|---|---|
| **Acoustic** | Auditoriums, recording studios |
| **Cladding** | Premium façades — stone, ACP, composites |
| **Lift / elevator** | 4+ floor buildings — usually mfr-installed (Otis, Kone, Schindler) |
| **Swimming pool** | Resorts, premium villas |
| **Smart-home / automation** | Premium residential, last 2 years only |

---

## Part 3 — Locked taxonomy for v1.2 `subcontractor.work_type`

17 entries — enough to cover ~95% of NE-India SMB jobs without making the dropdown unusable on a phone.

```
1.  Excavation / earthwork
2.  RCC / concreting
3.  Rebar / bar bending
4.  Form work / shuttering
5.  Masonry (brick + block)
6.  Plastering
7.  Waterproofing
8.  Roofing
9.  Electrical (wiring + fixtures)
10. Plumbing (water + drainage)
11. Tiling / flooring
12. Painting
13. Carpentry / joinery
14. Steel fabrication / welding
15. POP / false ceiling
16. Aluminum / glass
17. Other  ← always the safety valve
```

Deliberately excluded from v1.2 (use "Other" until a paying customer asks):

- HVAC, Fire safety, Lift / elevator — rare in SMB NE-India
- Sub-trade-level granularity (e.g. "Plumbing — water" vs "Plumbing — drainage") — one category covers both
- Solar / smart-home / automation — high-end residential, not the beachhead
- NE-India regional terms in the UI — per CLAUDE.md, English-default; Hindi/Assamese is a future Settings toggle

---

## What's currently missing from Storey *(honest gaps)*

Storey covers ~70% of daily ops well today. The big gaps to evaluate post-v1.2:

1. **Quality assurance** — slump tests, cube tests, level surveys. Real contractors keep these in notebooks. *Could be a v2 lab/QA module.*
2. **Compliance / statutory** — PWD inspections, electrical sign-off, labour licences. *High-pain, low-glamour. v2 candidate.*
3. **Logistics / transport** — vehicle dispatch, fuel logs, driver attendance. *Sizable.*
4. **Drawings / RFI** — most sites still pass paper drawings around. Could be a big differentiator. *v2 or v3.*
5. **Client communication** — site → contractor → client thread. *Could be a v2 wedge for higher-value contracts.*

**The 70% Storey has is the right 70%** — it's the daily-bread work that supervisors actually do every day. The remaining 30% is mostly *episodic* (compliance) or *enterprise-grade* (RFI, drawings) — not what the NE-India SMB beachhead needs at v1.
