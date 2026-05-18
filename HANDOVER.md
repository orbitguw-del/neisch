# Storey (ConsNE) — Project Handover

_Last updated: 2026-05-18 · Prepared for migration / ownership transfer_

Storey is a multi-tenant construction-site management SaaS for contractors in
Northeast India. Web app + Android app, live in Google Play Closed Testing.

---

## 1. Accounts & services to transfer

| Service | Used for | Action on migration |
|---|---|---|
| **GitHub** | Source code repository | Transfer repo to new org / account |
| **Supabase** | DB, Auth, Edge Functions, Storage | Transfer project to new org |
| **Vercel** | Web hosting | Re-link under new account |
| **Google Play Console** | Android app listing | Cannot transfer easily — see §6 |
| **Google Cloud / OAuth** | Google Sign-In client | Move to new GCP project |
| **Resend** | Transactional email (help desk) | Re-create under new account |
| **Twilio** | SMS OTP | Transfer or re-create |
| **GoDaddy** | Domain + email | Transfer domain + DNS |
| **Android signing key** | App release signing | **CRITICAL — back up, never lose** |

> ⚠️ The Android upload/signing keystore is irreplaceable. If lost, you cannot
> publish updates to the existing Play listing. Back it up securely before any
> migration.

> NOTE: This is the audit copy — all credentials, keys, project refs, account
> logins and secret file paths have been removed. Refer to the secure
> credential store (password manager / vault) for actual values and locations.
> Rotate every key after handover.

---

## 2. Tech stack

- **Frontend**: React 18 + Vite + Tailwind + Zustand + React Router (hash router)
- **Backend**: Supabase — Postgres + RLS + Edge Functions (Deno) + Auth
- **Mobile**: Capacitor (Android), package `com.storeyinfra.app`
- **Hosting**: Vercel (web), GitHub → Vercel CI/CD on `main`
- `@` alias → `src/`

Supabase project ref + URL: see secure credential store.

Edge functions: `invite-user`, `link-phone`, `send-sms-otp`, `sign-up-with-invite`,
`verify-sms-otp`. **Not auto-deployed** — run
`npx supabase functions deploy <name> --project-ref <ref>`.

---

## 3. Repository layout

| Path | Purpose |
|---|---|
| `src/main.jsx` | App entry — OAuth callback intercept + canonical redirect |
| `src/router/index.jsx` | All routes + role guards |
| `src/stores/` | Zustand stores (auth, site, worker, material, etc.) |
| `src/pages/` | Page components (role-scoped) |
| `src/lib/supabase.js` | Supabase client config |
| `supabase/migrations/` | DB schema migrations |
| `supabase/functions/` | Edge functions |
| `android/` | Capacitor Android project |
| `capacitor.config.ts` | Capacitor config |
| `vite.config.js` | Build config — `base` differs web vs Android |
| `vercel.json` | Vercel routing |
| `CLAUDE.md` | Detailed engineering notes / gotchas |
| `docs/` | Auth flow docs |

Branches: `main` is production. Active feature branches:
`claude/heuristic-kepler-*` etc. — review and merge or delete before handover.

---

## 4. Roles & multi-tenancy

`superadmin > contractor > site_manager > supervisor > store_keeper`

Multi-tenant via `tenant_id` column + RLS helpers `my_tenant_id()` / `my_role()`.
Key tables: tenants, profiles, sites, workers, materials, daily_logs,
site_assignments, site_expenses.

---

## 5. Build & deploy

**Web** — push to `main` → Vercel auto-deploys.

**Android**:
```
npm run build
npx cap sync android
cd android && ./gradlew bundleRelease
```
Output AAB → upload to Play Console. Bump `versionCode` + `versionName` in
`android/app/build.gradle` each release. Current: versionCode 13 / v1.0.13 (LIVE).

Pre-push checklist is in `CLAUDE.md` §"Deployment checklist".

---

## 6. Google Play status

- The Android app is on **Closed Testing**, v1.0.13 live (100% rollout).
- Need **12 testers opted-in for 14 continuous days** before Production access.
- Play Console developer accounts are tied to a Google account and are
  **not freely transferable** — to move ownership, use Play Console's
  account transfer process (Google support) or plan a new account + new listing.

---

## 7. Outstanding tasks (from docs/TODO.md)

- [ ] Register the company as a legal entity
- [ ] Consolidate everything to one company email/account
- [ ] Terms of Service page (Privacy Policy already done — `src/pages/Privacy.jsx`)
- [ ] Trademark "Storey"
- [ ] RLS audit: tenants, sites, pending_invites, budget_lines
- [ ] Add index on `phone_verifications`
- [ ] Untrack `dist/` from git
- [ ] Migration history cleanup
- [ ] Merge/close stale feature branches
- [ ] Set up GoDaddy email forwarding (help@/info@ → company inbox)
- [ ] Recruit 12 beta testers (promo image: `storey-tester-invite.jpg`)

---

## 8. Migration order (recommended)

1. Create the new company entity + company Google account.
2. Transfer the GitHub repo; re-link Vercel.
3. Transfer the Supabase project (or migrate DB via dump/restore).
4. Move the Google OAuth client to a new GCP project; update redirect URLs.
5. Re-create Resend + Twilio under company accounts; update edge-function secrets.
6. Transfer the domain (GoDaddy) + DNS.
7. Handle Play Console account transfer (slowest — start early).
8. **Rotate every key** once migration is complete.
9. Back up the Android signing keystore securely — losing it ends Play updates.
