# Storey — 90-day roadmap
### 2026-05-21 → 2026-08-19

> **This is the only roadmap that matters right now.**
>
> The 180-day and 365-day documents exist. Do **not** open them until this
> 90-day document is at least 70% complete. Indian founders get distracted
> by distant milestones and miss the near ones. This document is the
> antidote to that.
>
> **Open this every Monday morning.** Mark what's done. Plan the week.

---

## The three milestones — nothing else matters until these are hit

```
DAY 30  →  Production-track release approved + 12 testers active
DAY 60  →  v1.2 bundle shipped + Arun's site running on it
DAY 90  →  5 paying contractors + ₹5k–15k MRR + Pvt Ltd certificate
```

Everything below serves these three milestones. If a task doesn't
connect to one of them, defer it.

---

## Phase 1A — Week 1 (May 21 → May 27): "Send the broadcast. Get to 12."

| Day | Action | Done = |
|---|---|---|
| **Wed May 21** | Send Arun the WhatsApp message + attach poster | Message sent, "delivered" tick visible |
| **Wed May 21** | Save 30 contractor phone numbers in personal phone | All 30 saved (required for WhatsApp Broadcast to deliver) |
| **Thu May 22** | Send 1-line probe to all 30: *"Hi, this is Karun from Storey. Save my number — I'll send the beta link tomorrow."* | 30 messages sent |
| **Fri May 23** | Run WhatsApp Broadcast: feature poster + the broadcast caption from the marketing skill | Broadcast sent. Replies start arriving at `help@storeyinfra.com` |
| **Sat May 24** | Triage replies. Add every Gmail → Play Console closed testers list. Send each tester the install link reply. | Every Gmail processed within 12h of reply |
| **Sun May 25** | Follow-up nudge to Arun *if no reply* — single line, nothing pushy | Sent (or skipped if Arun has replied) |
| **Mon May 26** | Count: testers active in Play Console | ≥6/12 by end of week 1 |

---

## Phase 1B — Week 2 (May 28 → Jun 3): "Close the tester gate."

| Day | Action | Done = |
|---|---|---|
| **Wed May 28** | Round 2 broadcast — to anyone who didn't reply the first time, with a different angle ("3 contractors already on board") | Round 2 sent |
| **Thu May 29** | Re-engage the 3 "never signed in" prospects (Budhi, Parth, etc. from the CSV) — direct WhatsApp to each | 3 individual messages sent |
| **Fri May 30** | Call your CA — get a quote for Pvt Ltd registration | Quote received: ₹X, Y weeks |
| **Mon Jun 2** | Count again | ≥10/12 by end of week 2 |
| **Tue Jun 3** | If <10/12 — visit 2 contractor offices in person with printed poster | At least 2 face-to-face conversations done |

---

## Phase 1C — Week 3 (Jun 4 → Jun 10): "Hit 12/12. Start the 14-day clock."

| Day | Action | Done = |
|---|---|---|
| **Wed Jun 4** | 12/12 testers in Play Console, all opted in | Confirmed in dashboard |
| **Wed Jun 4** | Push the **14-day Production-track clock** start. Document the start date. | Date written in `docs/TODO.md`: "14-day clock started Jun 4" |
| **Thu–Sun** | NO new features. Bug-fix mode only. Every tester complaint → 24h response | Tester confidence holds. <2 bugs open at any time |
| **Mon Jun 9** | Send personal thank-you message to each tester | 12 messages sent |

---

## Phase 1D — Week 4 (Jun 11 → Jun 18): "Production track. Start v1.2."

| Day | Action | Done = |
|---|---|---|
| **Wed Jun 18** | **14-day clock complete.** Promote v1.1.1 to Production track | Production-track release submitted |
| **Wed Jun 18** | Pvt Ltd registration filed with CA | Documents signed, CA filing |
| **Thu Jun 19** | Start v1.2 build — migration first, item (1): Material budget vs actual | Migration `20260619000000_material_budgets.sql` drafted |

---

## Phase 2 — Days 31–60 (Jun 20 → Jul 19): "Ship v1.2 with conviction."

Build the bundle in this order — each piece depends on the previous:

| Order | Item | Days | Done = |
|---|---|---|---|
| 1 | **Material budget vs actual** — `materials.budget_qty` column + Budget vs Actual report | 1.5 d | Contractor sees "planned 500 / consumed 480 / 20 under" per site |
| 2 | **Sub-contractor onboarding (Path A)** — table + form for contractor/site_manager only | 2 d | Arun can add Mistri Ramesh with name, GST, agreed amount |
| 3 | **Payment ledger + balance** — `subcontractor_payments` table + statement view | 1.5 d | Each sub-contractor has a passbook view: agreed → advance → balance |
| 4 | **Variation Orders** — `subcontractor_variations` table + UI | 1 d | "Add 5th floor → ₹1L extra" stored as variation, original untouched |
| 5 | **Work Order PDF** — pdfmake client-side, stacks variations | 1 d | One-click PDF download with both parties' signature blocks |
| 6 | **Task / sub-contractor aware allocation** — `task_id` + `subcontractor_id` columns on `material_allocations` | 0.5 d | Three-radio dropdown live in Inventory page |
| 7 | **Flag-and-correct workflow** — flag columns on allocation, BEFORE UPDATE trigger | 0.5 d | Supervisor can flag; site_manager approves; ledger preserved |
| 8 | **"Your data, your Drive" backup** — daily export to contractor's Google Drive | 3 d | OAuth connect once, nightly backup lands automatically |

**Calendar buffer:** 4 weeks (28 days) for ~11 days of focused work. The buffer absorbs: testers reporting bugs · phone calls with Arun · IPv4 dropouts · admin time.

**Weekly cadence during v1.2 build:**
- **Monday:** Plan the week's items. Commit to ≤3 features for the week.
- **Tue–Thu:** Build. One commit per day minimum.
- **Friday:** Demo what's live to Arun via WhatsApp (10-sec screen recording).
- **Saturday:** Bugs only. No new features after lunch.
- **Sunday:** Rest. Or: outreach. Never both code AND family on Sunday.

---

## Phase 3 — Days 61–90 (Jul 20 → Aug 19): "Prove pricing. Convert pilots."

| Lane | Target | Done = |
|---|---|---|
| **Customer** | 5 paying contractors @ ₹500–2000/site/month | ₹5–15k MRR — small, real, validated |
| **Customer** | First **referral** from existing customer | One pilot says "talk to my friend" — customer N+1 came from customer N |
| **Customer** | First testimonial video | 30-sec contractor on camera saying "this works" |
| **Product** | v1.2 in real-site use at Arun's pilot — daily | Daily logs, allocations, WO PDFs being generated for real |
| **Product** | Top-asked v1.3 feature identified from real usage | One feature emerges that 3+ pilots ask for. Tag for build, do NOT start. |
| **Business** | **Pvt Ltd certificate in hand** | Incorporated. Bank account in company name. |
| **Business** | First Work Order PDF signed by a real sub-contractor | The feature drives a real commercial document |
| **Business** | First invoice raised — even ₹500 | Real money received. Founder cashflow starts. |
| **Advisor** | First proper call with Avinash | 60-min call done. 3 contractor intros requested. |
| **Advisor** | First proper call with Upmanyu | Architecture review of materials ledger done |
| **Advisor** | Apply to Assam Startup / Nest-i + NEDFi seed schemes | Application submitted (non-dilutive ₹2-50L) |
| **Marketing** | Single-page landing redesign — *"The only ConTech app with a printable Work Order"* | Live on storeyinfra.com root |
| **Marketing** | One detailed customer case study published | Long-form post: storeyinfra.com/customers/buildne (or similar) |

---

## What NOT to do in the next 90 days

- ❌ **Don't build v1.3 features** — they only get planned (in TODO), not built
- ❌ **Don't redesign the illustration library** — defer to designer / Storyset (logged in TODO)
- ❌ **Don't pitch to angels** — ₹10L cheques will offer worse terms before MRR exists
- ❌ **Don't hire** — every "I need help" is really "I'm doing the wrong things"
- ❌ **Don't open the 180-day or 365-day documents.** They will tempt you with bigger ideas that don't matter yet.
- ❌ **Don't shop for a Hindi/Assamese translator.** Wait for a pilot to ask.
- ❌ **Don't take on Karun's father's friend's nephew's startup as a side gig.** Family pressure to "help" is the silent killer.

---

## Weekly review — every Monday at 9 AM

Open this document. Mark every item ✅ or ❌ for last week. Plan the
upcoming week. Reply to the WhatsApp Broadcast replies that piled up
over the weekend. Then code.

If you miss a Monday review, do it Tuesday. If you miss a week, this
roadmap doesn't help you — you're not running the playbook.

---

## When to graduate to the 180-day roadmap

Open `docs/ROADMAP-180.md` only when **all three** of these are true:

1. Production track promoted in Play Console
2. v1.2 shipped — all 8 items live
3. ≥5 paying contractors with ≥₹5k MRR

If you hit only 2 of 3 by Aug 19, the 90-day roadmap extends — don't
skip ahead. Discipline.
