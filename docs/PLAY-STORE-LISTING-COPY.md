# Play Store listing — paste-ready copy

*Prepared 2026-06-13. Everything you paste into Play Console to get Open
testing (and later Production) live. Work top to bottom.*

> Companion file: `docs/PLAY-DATA-SAFETY.md` (the Data Safety form answers).
> Screenshots: `screenshot-1..8-*.jpg` at repo root. Icon: `app-icon-512.png`.
> Feature graphic: `feature-graphic.jpg`.

---

## 1. CONTENT RATING — IARC questionnaire
**Path:** Policy → App content → Content rating → Start questionnaire

- **Email address:** help@storeyinfra.com
- **Category:** choose **"Utility, Productivity, Communication, or Other"**
  (NOT Game)

Then answer the questionnaire — every answer is **No** for Storey:

| Question | Answer |
|---|---|
| Does the app contain violence? | **No** |
| Sexual content / nudity? | **No** |
| Profanity or crude humour? | **No** |
| Controlled substances (drugs/alcohol/tobacco)? | **No** |
| Gambling (real or simulated)? | **No** |
| Does the app share the user's current physical location with other users? | **No** |
| Does the app allow users to interact or exchange content/communicate? | **No** *(data is private per tenant; no public social features)* |
| Does the app allow users to purchase digital goods? | **No** *(free during beta)* |
| Is the app a web browser or search engine? | **No** |
| Does the app collect/share personal info with third parties for ads? | **No** |

**Result:** "Rated for 3+" / "Everyone". Accept IARC terms → Save.

---

## 2. TARGET AUDIENCE & CONTENT
**Path:** Policy → App content → Target audience and content

- **Target age groups:** select **18 and over** ONLY. Uncheck all younger bands.
- **"Could the store listing unintentionally appeal to children?"** → **No**
- **Ads:** "Does your app contain ads?" → **No**

---

## 3. APP ACCESS (reviewer login)
**Path:** Policy → App content → App access

Storey requires login, so Google needs a working test account.

- Select: **"All or some functionality is restricted"**
- Add an instruction with these fields:

**Name of the instruction:** `Contractor login`

**Username / email:**
```
[CREATE A DEMO ACCOUNT FIRST — see below, then paste the email here]
```

**Password:**
```
[the demo account password]
```

**Any other information:**
```
Sign in with the email and password above on the first screen.
This is a contractor (admin) account with sample sites, workers,
materials and reports already populated so all features are visible.
Google sign-in and phone OTP are alternative login methods but the
email/password above is the simplest for review.
```

> ⚠️ **BEFORE pasting:** create the demo account on storeyinfra.com.
> 1. Go to storeyinfra.com → Register → make a contractor account
>    (e.g. `playreview@storeyinfra.com` / a strong password).
> 2. Add 1 site, 2-3 workers, a couple of materials so the reviewer
>    sees populated screens, not empty states.
> 3. Confirm you can log out and back in with those credentials.
> 4. THEN paste them above. A broken login = automatic rejection.

---

## 4. MAIN STORE LISTING
**Path:** Grow → Store presence → Main store listing

### App name (max 30 chars)
```
Storey — Site Manager
```
*(21 chars. Or just "Storey" if you prefer.)*

### Short description (max 80 chars)
```
Site management for India contractors — attendance, materials, reports.
```
*(71 chars.)*

### Full description (max 4000 chars)
```
Storey is a simple, mobile-first app for construction contractors and
builders in India. Run your sites from your phone — attendance,
materials, daily logs, expenses and reports, all in one place.

Built in Guwahati, for sites across Northeast India and beyond. Works on
an everyday Android phone, on patchy 4G, and keeps working offline when
the network drops.

WHY CONTRACTORS USE STOREY

• Pay per SITE, not per user. Your whole team — site managers,
  supervisors, store keepers — works on it. No per-head charges.

• Worker attendance in seconds. Mark who showed up, your site manager
  confirms, and the day's count is done. No paper register, no end-of-month
  guesswork.

• Know where the material went. Record cement, steel, sand and more as it
  arrives, gets issued, and moves between sites. Every bag is tracked, with
  delivery photos and challan/invoice details.

• Daily site logs with photos. Supervisors post what happened on site —
  with date-stamped photos as proof — and the site manager confirms.

• Sub-contractor management. Keep a directory of your sub-contractors,
  track what you have paid and what is still due.

• Expenses with approval. Site spends are recorded and approved, so you
  always know where the money went.

• Reports you can share. Attendance, materials, stock and spend — view by
  site and send a summary straight to WhatsApp, or export to Excel.

MADE FOR THE WAY YOU ACTUALLY WORK

Storey speaks plain English with clear icons and big numbers, so anyone on
your team can use it — not just the office. It is designed for the real
construction site: dust, heat, an old phone, and a network that comes and
goes.

YOUR DATA STAYS YOURS

Each company's data is private and isolated. You can export or delete your
data at any time. We do not sell your data or share it across companies.

FREE DURING LAUNCH

Storey is free to use during our launch beta. No card needed. Start today.

ROLES THAT MATCH YOUR SITE

Contractor, Site Manager, Supervisor, Store Keeper — each person sees
exactly what they need, nothing more.

Questions? WhatsApp the founder directly: +91 98640 66898
or email help@storeyinfra.com

Storey — run your sites, not your phone.
```

### Graphics to upload
- **App icon:** `app-icon-512.png` (512×512)
- **Feature graphic:** `feature-graphic.jpg` (1024×500)
- **Phone screenshots (upload all 8, in this order):**
  1. `screenshot-1-dashboard.jpg`
  2. `screenshot-2-attendance.jpg`
  3. `screenshot-3-materials.jpg`
  4. `screenshot-4-daily-log.jpg`
  5. `screenshot-5-reports.jpg`
  6. `screenshot-6-subcontractors.jpg`
  7. `screenshot-7-tasks.jpg`
  8. `screenshot-8-expenses.jpg`

### App category
- **App category:** Business *(or Productivity)*
- **Tags:** construction, site management, attendance, inventory
- **Contact details:**
  - Email: help@storeyinfra.com
  - Phone: +91 98640 66898
  - Website: https://storeyinfra.com
- **Privacy Policy URL:** https://storeyinfra.com/privacy
  *(confirm this resolves before saving — Play checks it)*

---

## 5. DATA SAFETY
**Path:** Policy → App content → Data safety
→ Full answers in `docs/PLAY-DATA-SAFETY.md`. Paste from there.

Key reminders:
- Collects data: **Yes** · Encrypted in transit: **Yes** · Deletion route: **Yes**
- **Shared: No** for every type (processors ≠ sharing)
- Privacy Policy URL: https://storeyinfra.com/privacy

---

## 6. CREATE THE OPEN TESTING RELEASE
**Path:** Test and release → Testing → Open testing → Create new release

- **App bundle:** Add from library → **28 (1.2.5)**
- **Release name:** `28 (1.2.5)` (auto)
- **Release notes:**
```
<en-IN>
Storey beta — site operations for construction contractors.
Attendance, materials, daily logs, expenses and reports. Free during launch.
</en-IN>
```
- **Countries/regions:** add **India** (add more later if needed)
- Save → Review release → **Start rollout to Open testing**

---

## Order of operations (fastest path)

1. Content rating — 5 min ✅
2. Target audience — 3 min ✅
3. Create demo account on storeyinfra.com — 5 min
4. App access (paste demo login) — 5 min
5. Data safety (from PLAY-DATA-SAFETY.md) — 25 min
6. Main store listing (paste copy + upload 8 screenshots) — 25 min
7. Open testing release — 5 min

When all show green in **Policy → App content**, the rollout button unlocks.

---

## After rollout

- Open testing review: few hours to ~2 days
- Once live, the **public install URL** is:
  `https://play.google.com/store/apps/details?id=com.storeyinfra.app`
  — this is the URL your InfraTech handbill QR already points to. Strangers
  can now install it. Field marketing is unblocked.
