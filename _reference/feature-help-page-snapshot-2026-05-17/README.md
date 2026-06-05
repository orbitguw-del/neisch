# Help page snapshot — 2026-05-17

Salvaged from the `feature/help-page` branch before it was deleted.

The branch was 190 commits behind `main` and could not be cleanly merged.
Rather than throw the work away, these two files are kept here as a
**design reference** for when the in-app Help page is rebuilt as part
of v1.2.x or v1.3.

## What's here

| File | Status in `main` | Use |
|---|---|---|
| `HelpDesk.jsx` | ✅ already in `main` at `src/components/auth/HelpDesk.jsx` | Comparison reference if HelpDesk diverges |
| `Help.jsx` | ❌ **not in `main`** — never landed | Reference structure for the rebuilt Help page |

## What `Help.jsx` does (from the original commit `855b48aa`)

> *"feat(help): in-app role-aware Help & How-To page"*

A single `/help` route rendering role-specific sections — what a
contractor needs to know, what a site manager needs to know, etc.

## DO NOT just copy-paste

The file was written against the 2026-05-17 codebase. Major changes
since then that affect it:

- Role names / RoleGuard structure
- HashRouter routing
- The 3-tier visual system (icon · line illustration · photo) locked into CLAUDE.md
- Dashboard rewrites (Contractor / Site Manager / Supervisor)
- Tailwind class conventions evolved
- StoreyIcon / branding component changes

When rebuilding the Help page:
1. Read this file for **structure and information architecture** only
2. Rewrite from scratch using current components and conventions
3. Delete this `_reference/` folder once the new Help page ships

## Why this folder exists

Karun's decision (session 2026-06-05): salvage as reference, then delete the
remote branch. See `docs/TODO.md` and git history around commit
`feat: salvage help page source from feature/help-page before deletion`.
