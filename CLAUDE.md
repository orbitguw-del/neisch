# Storey — Project Instructions for Claude

## Before making ANY change, think through side effects first

Before executing, ask yourself:
- Does this affect **both web (Vercel) AND Android (Capacitor)**?
- Does this work across **all three envs**: localhost · Vercel preview · storeyinfra.com?
- If touching build config — will assets still load on the web server?
- If touching auth — does it work for Google OAuth, invite flow, AND SMS OTP?
- If touching routing — does the hash router vs real-path split still work?
- If touching RLS or DB — does every role still get the right data?

State the risks out loud before pushing. Don't fix one thing and break another silently.

---

## Working Discipline (rules — apply every session)

These exist because past sessions shipped large amounts of untested code and let
v1 scope quietly expand. Claude must hold the line on these; the owner (Karun)
should expect Claude to enforce them even when not reminded.

### Engineering discipline
1. **Build → test → commit, in small steps.** Never batch many untested features.
2. **A green build is NOT a tested feature.** "It compiles" ≠ "it works." Each
   feature needs a real run-through before the next one starts.
3. **End every phase with a verification step**, not just a build. If it can't be
   verified now (e.g. needs the live app), say so explicitly and add a TODO.
4. **After a migration**, confirm it applied and the affected screen still works
   before moving on.
5. **One change in flight at a time.** Finish (build + test + commit) before starting the next.

### Scope control
First, **classify every request** — they are not all "scope creep":
- **Bug fix** — something built is broken. Always in scope.
- **Hardening / checks & balances** — adding a control, approval, audit trail or
  validation to a feature that *already exists* (e.g. "attendance now needs
  manager confirmation"). This is legitimate v1 work — it makes v1 sturdier, in
  line with the "integrity and sturdiness" philosophy. Not scope creep.
- **New feature** — a net-new capability/module that didn't exist (e.g. the Task
  module, offline mode, on-site photos). This *is* scope and must be tagged.

Rules:
1. **Define "done" before starting** — for *any* of the three. Write the one-line
   acceptance check first.
2. **When a new "also…" request appears mid-feature, write it to `docs/TODO.md`
   — do not build it now.** Finish the current thing first.
3. **Tag new *features* (only): v1 / v1.x / v2.** Don't silently grow v1 with
   net-new modules. Hardening and bug fixes don't need a version tag — but they
   still need rule 1 and a test.
4. **A change is not done until a real user has tested it** — feature *or*
   hardening. "Built" and "shipped" are different states.
5. Prefer **shipping a smaller verified thing** over a larger unverified one.

### Building technical depth (for the owner)
1. **Skim every file Claude writes or changes.** Don't approve a change you
   can't explain back in one plain sentence.
2. **Learn the 5 load-bearing concepts of this stack**, one at a time:
   React components/state · Supabase RLS · SQL migrations · git basics
   (branch/commit/push/pull) · Capacitor (web vs native).
3. **Keep a running "things I didn't understand" note**; ask Claude to explain
   one per session.
4. **git first** — it has caused real confusion. Learn: what a branch is, what
   commit/push/pull do, what a worktree is. Ask for a walkthrough.
5. When Claude proposes an approach, **ask "what breaks if this is wrong?"**
   before approving — that one question builds judgement fastest.

---

## Tech stack

- **Frontend**: React + Vite + Zustand + React Router (hash router via `createHashRouter`)
- **Backend**: Supabase (Postgres + RLS + Edge Functions + Auth)
- **Mobile**: Capacitor (Android)
- **Hosting**: Vercel (web), GitHub → Vercel CI/CD

---

## Environment facts — things that have burned us before

### Vite / Build
- `base` must be `'/'` on Vercel (web server, absolute paths needed)
- `base` must be `'./'` on Android (Capacitor uses `file://`, needs relative paths)
- Use `process.env.VERCEL ? '/' : './'` to switch automatically
- Never use `rewrites: [{ source: "/(.*)" }]` in vercel.json — it catches `/assets/*` too
- Always use `{ "handle": "filesystem" }` first in Vercel routes, then the fallback

### Routing
- App uses `createHashRouter` — all in-app routes live at `/#/path`
- OAuth callback comes in as a real path: `/auth/callback?code=...` (no hash)
- `main.jsx` intercepts `/auth/callback` BEFORE React mounts and exchanges the PKCE code
- While intercepting, React is NOT mounted — inject DOM spinner manually if needed
- The `AuthCallback` component in the router is for `/#/auth/callback` (currently unused)

### Auth / Supabase
- PKCE verifier is stored in `localStorage` per origin
- `storeyinfra.com` and `www.storeyinfra.com` are DIFFERENT origins = different localStorage
- Always canonicalise to `www.storeyinfra.com` at boot (see `main.jsx`)
- `profiles` table has NO `email` column — use `get_auth_user_id_by_email` RPC to look up by email
- `handle_new_user` trigger creates profile with `role='contractor'`, `tenant_id=NULL` for new users
- `link_owner_to_tenant` trigger sets `tenant_id` after a tenant row is inserted
- Google OAuth contractors land with `tenant_id=NULL` — redirect them to `/create-company`
- `onAuthStateChange` fires `INITIAL_SESSION` immediately — skip it to avoid double `fetchProfile`

### Roles (in order of permission level)
```
superadmin > contractor > site_manager > supervisor > store_keeper
```
- `contractor` with `tenant_id = null` → must go through `/create-company` onboarding
- All RLS policies use `my_tenant_id()` and `my_role()` SECURITY DEFINER helpers

### Supabase project
- Project ref: `zgvbogxibiilnblmuohg`
- URL: `https://zgvbogxibiilnblmuohg.supabase.co`
- Allowed redirect URLs include both `storeyinfra.com/auth/callback` and `www.storeyinfra.com/auth/callback`
- Edge functions: `sign-up-with-invite`, `verify-sms-otp`, `send-sms-otp`

### Edge functions — known issues fixed
- `sign-up-with-invite`: use `get_auth_user_id_by_email` RPC (not `profiles.email` — column doesn't exist)
- `verify-sms-otp`: use `SITE_URL` env var for `redirectTo`, not a hardcoded domain

---

## Deployment checklist before pushing

- [ ] Does `vite.config.js` base work for web AND Android?
- [ ] Does `vercel.json` serve static assets before falling back to `index.html`?
- [ ] Are all new routes added to `router/index.jsx` AND guarded with the right `RoleGuard`?
- [ ] Does the change work when `tenant_id` is null (new contractor)?
- [ ] Are edge functions deployed after changes? (`npx supabase functions deploy <name> --project-ref zgvbogxibiilnblmuohg`)
- [ ] Is any new SQL function/trigger needed in the DB?

---

## Vendor Module — Policy Decisions (DO NOT OVERRIDE)

### Phase 1 (build now — next 10 days)
- Vendor module lives INSIDE the contractor app only
- **Contractor adds vendors manually** — fills in vendor details themselves
- No vendor self-registration in Phase 1 at all
- No vendor login in Phase 1
- Contractor owns and manages all vendor data (documents, catalogue, assignments)

### Phase 2 (BLOCKED until Phase 1 is battle-tested with 10+ contractors)
- Independent vendor portal (vendor gets their own login)
- **Vendor self-registration = request only** — vendor submits registration request
- **Only superadmin can approve** vendor registration — contractor cannot approve
- Superadmin reviews on `/admin/vendors` → approves or rejects
- Only after superadmin approval is the vendor active and visible to contractors
- No open/public auto-approval — prevents data pollution
- Also unlocks: own profile, catalogue, geo-tagging, public directory

### Vendor registration flow (Phase 2 only)
```
Vendor fills public registration form (no login needed) →
  vendors row created with status = 'pending_approval' →
  superadmin sees pending list on /admin/vendors →
  superadmin approves → status = 'approved' →
    vendor gets login credentials
    vendor becomes discoverable by contractors
  superadmin rejects → status = 'rejected' → vendor notified with reason
```

### RLS rule for vendors
- `pending_approval` vendors: superadmin only (contractors cannot see or action)
- `approved` vendors: visible to all contractors (not tenant-scoped — shared directory)
- Vendor data linked to a contractor only via `vendor_connections` table
- Vendor data NEVER writable by contractors — read only after connection

---

## Key files

| File | Purpose |
|------|---------|
| `src/main.jsx` | App entry — OAuth callback intercept + canonical redirect |
| `src/stores/authStore.js` | Auth state, session, profile, tenant |
| `src/components/auth/ProtectedRoute.jsx` | Session guard + contractor onboarding gate |
| `src/components/auth/RoleGuard.jsx` | Role-based access control |
| `src/router/index.jsx` | All routes and role restrictions |
| `src/lib/supabase.js` | Supabase client config |
| `supabase/functions/` | Edge functions |
| `vite.config.js` | Build config — mind the `base` setting |
| `vercel.json` | Vercel routing — mind asset serving order |

---

## Visual-first UX — non-negotiable design principle (set 2026-05-20)

The Storey user is a **NE-India construction supervisor in his 40s, with
5th–10th class education, working on a 4-year-old Android phone on a dusty
site**. He does not *read* — he **recognises**. If a screen forces him to
read English text, he closes it and calls his boss.

Every UI change in this codebase must hold to:

### 1. Picture beats text
- A **line illustration** of the work beats the word "Railing"
- A **colour stripe** down the side of a card beats a text status badge
- A **big number with an icon** beats a label-value pair
- A **worker avatar (coloured initials circle, or a real photo when one exists)** beats a name string
- An **emoji** in a status chip is communication, not decoration

### 1a. Three visual tiers — pick the smallest tier that does the job

**Tier 1 — ICON** (~16–32px, Lucide-style, monochrome single-stroke symbol)
- Use for: nav items · status chip icons · ledger row markers · small avatars · inline metadata
- Source: **Lucide React** (already in the project)
- File size: ~0.5 KB

**Tier 2 — LINE ILLUSTRATION** (~60–120px, custom inline SVG, terracotta stroke ~3px on sand frame)
- Use for: task category · material category · empty-state visual · onboarding screens · card thumbnails where an icon alone feels thin
- Source: **custom inline-SVG components** under `src/components/illustrations/*.jsx`
- File size: ~1–2 KB

**Tier 3 — PHOTO** (real image, ~30–80 KB JPG, variable size)
- Use **only for real evidence**: site-visit documentation, worker ID, delivery proof, damage record. The image IS the data.
- Source: the existing photo pipeline (`src/lib/photos.js`)
- File size: ~30–80 KB compressed

**Hard rules:**
- **Never mix two tiers in the same card.** Pick one.
- **Default upward, not downward** — start with Tier 1 (icon). Move to Tier 2 only when an icon feels thin at the size needed. Move to Tier 3 only when nothing else is the data.
- **Never use AI-generated photo imagery.** Reads fake instantly to contractors who know real sites.
- **Brand discipline applies to Tiers 1 & 2** — terracotta and sand only. No third-party blue/green icons.

**Reference renderings:**
- `C:\consne\mockup-visual-tiers.jpg` — the three tiers side by side
- `C:\consne\mockup-line-vs-photo.jpg` — line illustration vs photo deep-dive
- `C:\consne\mockup-visual-first-dashboard.jpg` — both surfaces, full dashboard

### 2. Status = colour, never just text
- 🟢 Green   = done / good / on track
- 🟡 Amber   = in progress / pending action
- 🔴 Red     = blocked / overdue / problem
- 🔵 Blue    = submitted / awaiting confirmation
- ⚪ Gray    = inactive / not started

A supervisor must be able to identify status from across the room without
zooming in. Status badges should always have **colour + icon + (optional) text**,
never text alone.

### 3. English is the default, language is the user's choice (NOT ours)
- **Default UI is English.** Most NE-India contractors use Tally,
  WhatsApp Business, GST portal, and banking apps in English — and they
  feel respected by that posture. Defaulting an app to Hindi/Hinglish
  reads as condescension ("we assume you can't handle English") and
  signals downmarket positioning. Don't do it.
- **Hindi / Assamese support is a Settings TOGGLE**, planned for v1.x.
  The contractor enables it for their team's phones if and when they
  want to. We never make the choice for them.
- Until the toggle ships, use **short, plain English** — verbs over
  jargon. "Mark done" not "Confirm completion". "Add worker" not
  "Onboard new resource". Concise English + visuals is more
  accessible than verbose English + visuals, AND respects the user.

### 4. Numbers are visual elements
- Big bold numbers (40px+) carry meaning. "2" in amber = "2 days left, hurry".
  "100%" in green = "this is done". The number itself does the work.

### 5. Empty states must illustrate the next action
- Never a blank page. Always: **icon in a coloured circle + 1-line Hindi/Hinglish
  prompt + a single big button that creates the missing thing.**

### 6. Avoid in this audience
- Long English paragraphs in body copy
- Status badges that are *only* text ("Pending" with no colour stripe)
- Drop-downs with text-only options when icons would do
- Multi-step forms when a single bottom-sheet picker would do
- Drag-and-drop on phone (it fails for fat fingers on smudged screens)
- Modals that block the whole screen for non-critical actions

### 7. Apply this lens *before* committing any UI work
Before writing a new screen or changing an existing one, ask:
- Can a supervisor with 8th-class English understand this in 2 seconds?
- Where can I replace a word with an icon, a colour, a photo, or a number?
- What's the worst-case 4G phone going to render of this screen?

If the answer to any of these is bad, redesign before coding.

**Reference rendering:** `C:\consne\mockup-visual-first.jpg` shows the
principle applied to the Tasks list — text-heavy vs visual-first
side-by-side. This is the standard.

---

## Diary auto-commit at session start (set 2026-05-21)

The `diary/` folder is Karun's founder journey record. Entries get written
during sessions but often aren't committed immediately. Karun has asked that
**any new Claude session that finds uncommitted diary changes must commit
them within the first response of that session** — so nothing gets lost when
the laptop reboots, the worktree gets cleaned, or the next session starts on
a different machine.

**Trigger on every new session:**

1. Run `git status diary/` *(silently, in the same turn as your first
   substantive action — don't ask permission, this is non-negotiable
   maintenance)*
2. If there are uncommitted changes in `diary/`:
   - Stage `diary/`
   - Commit with a message describing what changed (use the filenames as
     hints: `diary: capture YYYY-MM-DD entry` for daily files,
     `diary: stats snapshot Day-N` for STATS files)
   - Push to origin
3. If `diary/` is clean, do nothing — don't mention it

**Do not block** Karun's actual request to perform this housekeeping. Run
the diary commit in parallel / between substantive tool calls. Mention it in
one line at the end of your reply ("also auto-committed diary entry from
last session"), not as a centrepiece.

This rule is the diary analogue of the project memory refresh — same posture,
same non-negotiable maintenance.

---

## Project memory refresh cadence (set 2026-05-20)

Karun has asked for the project memory at
`C:\Users\model\.claude\projects\C--consne\memory\project_consne.md`
to be refreshed every **2 days**. When that file's `nextUpdateDue` date is
today or in the past — OR when Karun says *"update project memory"* (or any
similar phrase like "refresh project context", "memory update", "project
status update") — perform the refresh without further prompting:

1. `git log --since="3 days ago" --oneline` for recent commits
2. Read `docs/TODO.md` for new entries since `lastUpdated`
3. Update sections: Recent changes · Active blockers · v1.2 status · Pilot prospects
4. Bump YAML `lastUpdated` to today and `nextUpdateDue` to today+2
5. Keep file under ~200 lines (it's a map, not a history)
6. Report what changed in 3–5 bullets

This is non-negotiable maintenance — don't ask, just do it.
