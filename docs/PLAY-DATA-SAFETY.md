# Play Console — Data Safety form answers (Storey)

*Prepared 2026-06-01 from the Privacy Policy draft. Answers MUST stay consistent
with the published Privacy Policy — Play cross-checks. Declare honestly.*

> Path in Play Console: **App content → Data safety → Manage → Start**.

---

## Section A — Overview (3 questions)

1. **Does your app collect or share any of the required user data types?** → **YES**
2. **Is all of the user data collected by your app encrypted in transit?** → **YES**
   (TLS/HTTPS — Supabase + Vercel; no plaintext transport.)
3. **Do you provide a way for users to request that their data be deleted?** → **YES**
   - Mechanism: closing the account → personal data deleted/anonymised within 90 days
     (per Privacy Policy §4). Request via **help@storeyinfra.com**.
   - Play will ask for a **URL** — give your Privacy Policy URL
     (`storeyinfra.com/privacy`) which describes the deletion route, or a dedicated
     deletion-request page if you add one.

> **"Shared" = NO for everything.** Using Supabase/Vercel/Resend/Google as
> *processors acting on your behalf* is **not** "sharing" under Play's definition
> (they don't use the data for their own purposes). You do not sell or share
> across tenants. So mark **Shared: No** on every type below.

---

## Section B — Data types to declare (all: Collected = Yes, Shared = No)

| Play category → data type | Collected | Optional? | Purposes |
|---|---|---|---|
| **Personal info → Name** | Yes | Required | App functionality, Account management |
| **Personal info → Email address** | Yes | Required | App functionality, Account management, Developer communications |
| **Personal info → Phone number** | Yes | Optional | App functionality, Account management |
| **Personal info → Address** | Yes | Optional | App functionality *(site/worker addresses you store)* |
| **Personal info → User IDs** | Yes | Required | App functionality, Account management |
| **Personal info → Other info** (last-4 of Aadhaar/PAN/Voter) | Yes | Optional | App functionality *(human verification of workers)* |
| **Photos and videos → Photos** | Yes | Optional | App functionality *(site logs, attendance, receipts)* |
| **App activity → Other user-generated content** (daily logs, tasks, notes) | Yes | Required | App functionality |
| **App info and performance → Crash logs** | Yes | Required* | Analytics, App functionality |
| **App info and performance → Diagnostics** | Yes | Required* | Analytics, App functionality |

\* "App info/performance" types are typically auto-collected, so Play treats them
as not user-optional.

---

## Section C — 3 judgment calls — CONFIRM against what the app actually does

1. **Financial info?** — Storey records **wages, expenses, budgets, material costs**.
   - These are your *business operational* financials (and workers' wages), not the
     app user's personal payment data. Play's "Financial info" is ambiguous here.
   - **Safe/honest choice:** declare **Financial info → Other financial info = Yes**
     (Collected, Shared: No, Required, Purpose: App functionality). Over-declaring is
     safer than under-declaring.
   - **Payment card info → NO** (no in-app payments yet — confirm before launch).

2. **Location?** — Privacy says you do **NOT** collect continuous location; only an
   **optional GPS tag on a photo if the user chooses**.
   - If the geo-photo feature actually captures + stores device GPS → declare
     **Location → Approximate/Precise = Yes, Optional, App functionality.**
   - If it's currently off / site "location" is just a typed address → **Location = NO**
     (the typed address is covered by "Address" above).
   - **Verify the live app behavior before answering.**

3. **Device or other IDs?** — You collect device model/OS/app version + IP for
   debugging (Privacy §3).
   - If you use **no analytics SDK that assigns a device/advertising ID** → **Device
     or other IDs = NO** (model/OS/IP map to "App info & performance: Diagnostics").
   - If you later add Firebase Analytics / GA → revisit and declare **Yes**.

---

## Section D — Final checks before submitting
- [ ] Privacy Policy is **published and live** at the URL you enter (Play requires a
      working privacy-policy URL — confirm `storeyinfra.com/privacy` resolves).
- [ ] Answers above match the Privacy Policy wording (name, email, phone, address,
      ID-proof, photos, content). Update one if you change the other.
- [ ] Confirm the 3 judgment calls (financial / location / device IDs) against the
      shipped app, not assumptions.
- [ ] Not a "designed for families/kids" app → skip Families policy.
