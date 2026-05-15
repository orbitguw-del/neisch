# Operational TODOs

Running list of follow-up items that aren't urgent enough to block ship but should be handled when convenient.

---

## 🔐 Security hygiene

- [ ] **Rotate the Resend API key** — current key was pasted in Claude chat on 2026-05-15. Action:
  1. Resend → API Keys → delete the existing `Storey Support` key
  2. Create a new key with the same name + permissions (Sending access, all domains)
  3. Run `supabase secrets set RESEND_API_KEY=<new-key>` (Claude can do this when you share the new key)
  4. Confirm with a test send via curl

- [ ] **Audit other tables' RLS** for the same `WITH CHECK` gap we fixed on `profiles` — candidates: `tenants`, `sites`, `pending_invites`, `budget_lines`

---

## 🚀 Launch blockers

- [ ] **Play Store icon + screenshots upload** — automation paths exhausted. Manual upload via Play Console (see chat for the asset paths under `C:\consne\*`)

- [ ] **Resolve frontend branch divergence from `main`** — `claude/heuristic-kepler-947fd0` is 5 ahead, 43+ behind. Either rebase + manual conflict resolve OR cherry-pick security-only commits

---

## ⚡ Performance / scale

- [ ] **Add `phone_verifications` index** — prevents OTP rate-limit query slowdown at scale:
  ```sql
  CREATE INDEX IF NOT EXISTS phone_verifications_user_created_idx
    ON phone_verifications(user_id, created_at DESC);
  ```

---

## 🎨 UX polish

- [ ] **Inline "enroll your phone" hint in SMSOTPLogin** — when a user without an enrolled phone tries SMS OTP login, currently they get a silent generic success and no SMS. Add a one-line hint after 2 failed sends pointing them to Settings → Phone enrollment.

- [ ] **Self-service phone change flow** — currently locked to support escalation. Build a verified flow where a user can change their phone using their existing one as a 2FA step.

---

## 📨 Email / help desk

- [ ] **Verify `help@storeyinfra.com` mailbox exists** — Resend can now send to it, but if the GoDaddy email account doesn't have it set up as a mailbox or alias, mail will bounce. Check Inbox or check GoDaddy email control panel.

- [ ] **Switch `noreply@storeyinfra.com` to a real send domain SPF/DKIM** — confirm it shows green in Resend after first production sends; many providers (Gmail, Outlook) reject mail from new domains for a few days as a reputation cool-down.

---

## 🧹 Housekeeping

- [ ] **Formalise the manually-applied `006_budget_lines` migration history** — already reconciled via `supabase migration repair`, but worth documenting what other migrations may have been ad-hoc'd to avoid future "out of order" headaches.

- [ ] **Add `dist/` to `.gitignore` (and untrack it)** — `dist/` is in `.gitignore` but was committed historically, so files still appear in `git status`. One-time cleanup: `git rm -r --cached dist/` then commit.

---

## 📊 Telemetry / observability

- [ ] **Edge function status counters** — add a small dashboard or log dashboard for 200/400/401/429/500 responses on each function, so unusual error rates can be spotted.

- [ ] **`phone_verifications.attempts` distribution alert** — surface when a single user hits the 5-attempt cap repeatedly (indicates targeted brute-force attempt).
