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
