# Storey — contractor pitch
### What you say when a contractor asks "what is this?"
*Last updated 2026-05-22*

> Single source of truth for how Storey is described to prospective customers.
> If you change the pitch, change it here first — then propagate to website,
> WhatsApp templates, demo decks.

---

## The 10-second elevator

> Storey is a mobile-first site-operations app for construction contractors
> in Northeast India. Daily attendance, materials, tasks, photo-stamped logs,
> sub-contractor management, expenses — one app, works offline, your data
> stays yours.

If they only hear one sentence: that's it.

---

## The 30-second pitch *(for a phone call)*

> You know how every site has WhatsApp groups for attendance, paper diaries
> for daily progress, Tally for the books, and three different spreadsheets
> for materials — nobody knows what's where, sub-contractor payments slip,
> and material leakage eats your margin? Storey replaces that mess. One app
> on your supervisor's phone runs attendance, daily logs with date-time-stamped
> photos, material tracking, tasks, expenses. Live on Play Store in closed
> beta, 12 contractors testing now. ₹500–5,000 a month per site depending on
> size. Built specifically for NE India — the offline mode handles your 4G
> patches, the workflows match how you actually run sites here. Free 30-day
> trial.

---

## The 3-minute pitch *(for a sit-down meeting)*

### What it does — the three layers

1. **Daily ops** — attendance, daily logs with photos, tasks for the team, material allocation, expenses. Same data your supervisor maintains in notebooks today, just digital and searchable.

2. **Sub-contractor management** *(launching mid-June 2026)* — onboard Mistri-types with scope + agreed amount, generate a **signed Work Order PDF** in one tap, track every payment + variation against that agreement. The Work Order is the same legal-looking document that contractors today get from their CA — but auto-generated and stacked with every scope change. Sub-contractor disputes about "you said this scope" disappear.

3. **Your data, your Drive** *(also mid-June)* — every night, Storey saves a complete backup of your data to **your own Google Drive**. Like Tally's data folder, but cloud. If Storey disappears tomorrow (it won't), you keep every record. Better than Tally because it's already cloud + mobile + multi-user; better than other ConTech apps because your data physically lives with you.

### Who's it for

A contractor running 1–20 sites with 10–200 workers across them, sub-contracting parts of the work to specialists (electrical, plumbing, masonry, painting). NE India first — but the architecture serves anyone running construction work, from a 50-crore main contractor down to a single-mistri electrician with 3 jobs.

### What's it not

Not an accounting app. Tally still owns your books. Storey owns your operations. The two are complementary — Storey will have a Tally-export integration in v2.

Not a quality-management or compliance tool. That's a v2 / v3 consideration. We cover *daily operations*, not statutory.

### How much does it cost

Free 30-day trial. After that, ₹500–5,000 per month per site depending on size and feature tier — final pricing locked when we have 5 paying contractors. Pilot users get permanent founder-pricing.

### Why now

You've been running sites on WhatsApp + paper + Tally for years. It works, but you know where it breaks — material can't be reconciled, sub-contractor disputes eat your time, supervisors send fuzzy update photos at 9 PM. The cost of that overhead is real. Storey closes those holes without making your team learn a fancy ERP.

### Who's building this

Karun Roongta — solo founder, NE India based, contractor background. Built Storey himself over the last 4 months with AI assistance. 12 testers actively using it now. Aiming for public launch by mid-June 2026, with a 4-week feature window driven by your feedback.

---

## The differentiators *(say if asked)*

### vs Tally
- Tally tracks **money**. Storey tracks **operations**.
- Tally is desktop-first. Storey is mobile-first.
- Tally has no concept of sites, workers on attendance, or photos. Storey is built around them.
- Both fit on the same site — Storey for the supervisor, Tally for the CA. Tally export is on the v2 roadmap.

### vs paper / WhatsApp groups
- Searchable. Three months later, you can find the daily log from the day the column was cast.
- Auditable. Material movements have a ledger. Attendance is timestamped + confirmed.
- Cross-site visible. You don't have to be on a site to know what's happening there.

### vs other ConTech apps (HazelTree, Doxel, Procore)
- Built for NE India SMB contractors, not US enterprises. Pricing matches.
- Works offline — most ConTech apps assume good internet.
- Mobile-first throughout — most ConTech apps are desktop with a "mobile companion."

### vs hiring more office staff
- One app on 5 phones for ₹15,000 / month total replaces ~₹40,000 / month of clerical overhead.

---

## Common objections + honest answers

### "My supervisors don't read English well."

Today's UI is English with heavy visual cues — colour-coded status, icons, big numbers, photo thumbnails. Most supervisors recognise these in seconds without reading. A Hindi / Assamese toggle will arrive once a paying customer specifically asks for it — we don't default to it because most contractor buyers in NE India consider their business apps (Tally, GST portal, banking) in English, and a Hindi-default app reads as condescension.

### "I want my data on my own server, not yours."

Coming in mid-June: **"Your data, your Drive"** — daily automatic backup to your own Google Drive. You'll have a complete copy you can touch, copy to a pen drive, restore on any machine. Same data sovereignty as Tally's local folder, with cloud + mobile + multi-user on top.

If you literally need the database itself on your AWS or office server — that's an enterprise tier (₹3–5 lakh setup + ₹50k+/month, multi-year). Not in the SMB pricing.

### "What if Storey shuts down?"

Two protections. First — the data is yours via the daily Drive backup (post v1.2). Second — Storey is built on Postgres, the most portable database in existence. Your data can move to any other Postgres-compatible system without translation.

### "I already pay for Tally. Why another app?"

Tally is for your CA. Storey is for your supervisor. They don't overlap. Most contractors who try Storey find they save more in sub-contractor billing disputes alone than the monthly fee.

### "My internet at the site is unreliable."

Built for that. Attendance, daily logs, photos, expenses all queue locally and sync when you reconnect. No data loss. Designed assuming flaky 4G — because that's the NE-India site reality.

### "Why should I trust a beta?"

We're transparent about being beta. Currently 12 testers on closed Play Store testing, including BuildNE Infrastructure (active pilot). v1.0 is operationally stable — auth, multi-tenant data isolation, daily ops modules are all production-grade. v1.2 features in 4 weeks build on top. You're not joining a vaporware pitch — you're joining real software with real users, helping shape the next features.

### "How long until it's production-ready?"

It already is for the v1.0 daily-ops features. The "beta" label is about feedback velocity, not stability. Public launch (open Play Store) is mid-June 2026.

---

## What we deliberately don't say

- Don't promise "AI-powered." Storey is mostly classic CRUD with smart workflows, not AI. The first real AI feature (Hindi/Assamese voice input for daily logs) is a v1.x experiment, not a current capability.
- Don't lead with "phone OTP / SMS login." Currently in preview — works but reliability varies. Lead with Google sign-in or email signup.
- Don't claim full compliance / statutory features. We don't do PWD inspections, fire safety records, or PF / ESI tracking yet.
- Don't quote specific pricing as "fixed." We're in pricing-discovery — final tier numbers lock when we have 5 paying contractors.

---

## How to start a tester / pilot today

The same flow that's already documented in `docs/TESTER-ONBOARDING.md`:

1. They send you the **Gmail they use on their Android phone** via WhatsApp to **+91 98640 66898**
2. You add them to Play Console closed testing (one click)
3. You reply with the opt-in link + the onboarding poster *(`storey-tester-guide.jpg`)*
4. They install via Play Store, sign up with email or Google, create their company

Total time from "yes" to "first daily log filed": 30–60 minutes.

---

## Karun's line — the founder credibility close

> I'm a contractor, not a tech founder. I built Storey because I needed it on my own sites and nothing existed that didn't try to make us look like a Bangalore office. If anything breaks, you message me directly on WhatsApp and I reply within 24 hours, usually within one. If you want a feature, you tell me and if 3 contractors ask for the same thing, it's in the next release. That's how it works while I'm building this.

That sentence has closed more conversations than any feature list.
