# Claude Code — Command Cheat Sheet for Storey

A quick reference for which `/` commands (skills) actually help on this project, and when
to reach for each. Type the command (e.g. `/code-review`) in Claude Code to run it.

## Use these often

| Command | What it does | When to use |
|---|---|---|
| `/code-review` | Reviews your current changes for bugs + cleanups. `low`/`medium` = few high-confidence findings; `high` = broader. | **Before any merge.** Use `high` before pushing to `main`. |
| `/code-review ultra` | Deep multi-agent review in the cloud (billed, takes longer). | **Before a release / Play Store build.** This is the one run on 2026-06-21. |
| `/verify` | Runs the app and checks a change actually works (not just compiles). | After a bug fix — "does it really work?" |
| `/simplify` | Strips over-engineering from changed code (quality only, no bug hunt). | After a feature lands, before commit. |
| `/run` | Launches the dev server / screenshots a screen. | "Show me this screen working." |
| `marketing` | Posters, WhatsApp ads, pitch slides — brand-locked. | Any customer-facing asset. |

## Use occasionally

| Command | What it does |
|---|---|
| `/security-review` | Security pass over the current branch's changes. |
| `/review` | Review a specific pull request. |
| `claude-api` | Reference for the Claude API / model ids / pricing — only if building AI features. |

## Maintenance (mostly automatic now)

| Command | What it does |
|---|---|
| `/fewer-permission-prompts` | Trims the permission allowlist so you get fewer prompts. Run when prompts pile up. |
| update-config skill | Edits `.claude/settings.json` (hooks, permissions, env). |
| "update project memory" | Refreshes `~/.claude/.../memory/project_consne.md` (also auto-due every 2 days). |

## Already automated (you don't run these — they just happen)

- **Diary saver** — `SessionStart` hook commits + pushes uncommitted `diary/` changes at each session start.
- **Supabase `.catch()` bug catcher** — `PreToolUse` hook warns if a `.catch()` is chained on a query builder in `src/` or `supabase/functions/`. See `.claude/hooks/check-supabase-catch.mjs`.

## Skip / not for this project

`design-sync` (design-system repos only — Storey is a product app), `init`,
`statusline-setup`, `keybindings-help`.

---
_Reference only — not loaded into Claude's context automatically. Updated 2026-06-21._
