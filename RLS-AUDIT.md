# Storey — Row-Level Security (RLS) Audit

_Date: 2026-05-18 · Scope: `supabase/schema.sql` + migrations 001–008_

Audited every table for: RLS enabled, SELECT/INSERT/UPDATE/DELETE coverage,
tenant isolation, role scoping, site scoping, and column-level exposure.

## Severity summary

| # | Finding | Table | Severity |
|---|---|---|---|
| 1 | OTP codes world-readable | `phone_verifications` | 🔴 CRITICAL |
| 2 | Role / tenant self-escalation on UPDATE | `profiles` | 🔴 CRITICAL |
| 3 | Attendance not role/site-scoped | `attendance` | 🟠 HIGH |
| 4 | SELECT policies not site-scoped for sub-roles | several | 🟡 MEDIUM |
| 5 | Security migrations missing from main repo | — | 🟡 MEDIUM |
| 6 | `pending_invites` exposes invite codes; no DELETE | `pending_invites` | 🟡 MEDIUM |
| 7 | No DELETE policy on receipts/transfers/ledger | several | 🟢 LOW (by design) |

---

## 🔴 1. `phone_verifications` — OTP codes are world-readable

Migration 008 defines:
```sql
CREATE POLICY "pv_service_all" ON public.phone_verifications
  FOR ALL USING (TRUE) WITH CHECK (TRUE);
```
Combined with `GRANT ALL ... TO anon`, this means **anyone holding the public
anon key can read every row** — every user's OTP code, phone number, and user_id.
An attacker can read a victim's current OTP and verify as them.

The comment claims "users can only see their own" — the policy does NOT do that.

**Fix:** edge functions use the service-role key, which bypasses RLS entirely —
so the table needs NO permissive policy at all. Lock it down:
```sql
DROP POLICY IF EXISTS "pv_service_all" ON public.phone_verifications;
REVOKE ALL ON public.phone_verifications FROM anon, authenticated;
-- service_role keeps access and bypasses RLS; no policy = no client access.
-- (Optional) allow a user to read only their own rows:
CREATE POLICY "pv_own_select" ON public.phone_verifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
```

---

## 🔴 2. `profiles` — a user can promote themselves

Migration 001:
```sql
create policy "profiles_update" on profiles for update
  using (my_role() = 'superadmin' or id = auth.uid());
```
There is **no `WITH CHECK` and no column restriction**. A logged-in user can run
`update profiles set role = 'superadmin'` (or change `tenant_id`) on their own
row and escalate to platform admin / jump tenants.

**Fix:** keep users able to edit their own profile, but make `role` and
`tenant_id` immutable from the client via a BEFORE UPDATE trigger:
```sql
CREATE OR REPLACE FUNCTION public.lock_profile_privileged_cols()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() = NEW.id AND public.my_role() <> 'superadmin' THEN
    NEW.role      := OLD.role;
    NEW.tenant_id := OLD.tenant_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS profiles_lock_privileged ON public.profiles;
CREATE TRIGGER profiles_lock_privileged
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.lock_profile_privileged_cols();
```
> NOTE: a hardening migration for this was written earlier on a feature branch
> but is **not in the main repo's `migrations/` folder** (see finding 5).
> Verify whether it is actually applied to the live database.

---

## 🟠 3. `attendance` — not role or site scoped

Migration 005:
```sql
create policy "attendance_select" on attendance for select using (tenant_id = my_tenant_id());
create policy "attendance_insert" ... with check (tenant_id = my_tenant_id());
create policy "attendance_update" ... using (tenant_id = my_tenant_id());
create policy "attendance_delete" ... using (tenant_id = my_tenant_id());
```
Every other module scopes sub-roles to their assigned sites. Attendance does not:
**any** tenant user (including `store_keeper`) can read, edit, and **delete**
attendance for **every site** in the company. Wage data is sensitive and
deletion is destructive.

**Fix:** align with the site-scoped pattern, e.g.:
```sql
drop policy if exists "attendance_select" on attendance;
create policy "attendance_select" on attendance for select using (
  my_role() = 'superadmin'
  or (my_role() = 'contractor' and tenant_id = my_tenant_id())
  or site_id in (select site_id from site_assignments where profile_id = auth.uid())
);
-- insert/update: supervisor+ on assigned sites
-- delete: contractor / superadmin only
```

---

## 🟡 4. SELECT policies expose the whole tenant to sub-roles

`site_assignments` SELECT uses `tenant_id = my_tenant_id()` — every tenant user
sees all assignments. The `site_expenses` table (added on a feature branch) does
the same. Low-impact, but inconsistent with the site-scoped model and leaks
which staff are on which sites. Tighten to site scoping or accept as a
documented decision.

---

## 🟡 5. Security migrations not in the main repo

The main branch `supabase/migrations/` folder contains only `001`–`008`.
Earlier work produced additional migrations (role-immutability trigger, Aadhaar
masking to last-4, site_expenses) — these live on feature branches / worktrees.

**Risk:** the canonical repo does not reflect the live database; a clean
re-deploy from `main` would silently drop those protections.

**Fix:** merge those migration files into `main`, in order, and confirm each is
applied to the live DB.

---

## 🟡 6. `pending_invites`

- Only SELECT / INSERT / UPDATE policies — **no DELETE**. Contractors cannot
  revoke a pending invite from the client (only via service role).
- SELECT returns `invite_code` to every contractor in the tenant. Fine for a
  single-contractor tenant; revisit if multiple contractors per tenant.

**Fix:** add a DELETE policy for `contractor` / `superadmin` so invites can be
revoked.

---

## 🟢 7. Tables with no DELETE / UPDATE policy — by design, OK

`material_transactions` (no UPDATE → immutable ledger ✅), `material_receipts`
and `material_transfers` (no DELETE), `tenants` (no DELETE). RLS denies by
default, so these are correctly locked. No action — just confirming intent.

---

## Good practices already in place ✅

- RLS enabled on every table.
- Tenant isolation via `my_tenant_id()` everywhere.
- `my_role()` / `my_tenant_id()` are `SECURITY DEFINER` `stable` helpers.
- Immutable transaction ledger (`material_transactions` has no UPDATE policy).
- `anon` role is granted table access but RLS policies require `auth.uid()`,
  so anon effectively sees nothing — **except** `phone_verifications` (finding 1).
- Atomic, row-locked stock updates via `record_material_transaction`.

---

## Recommended action order

1. **Today:** fix `phone_verifications` (finding 1) — live data exposure.
2. **Today:** confirm the role-immutability trigger (finding 2) is applied; if
   not, apply it.
3. **This week:** re-scope `attendance` RLS (finding 3).
4. **This week:** merge stray security migrations into `main` (finding 5).
5. **Backlog:** site-scope `site_assignments` / `site_expenses` SELECT, add
   `pending_invites` DELETE policy.

> Verification: after fixes, test each role with the Supabase SQL editor
> "Run as" feature or a per-role JWT, attempting cross-tenant and cross-site
> reads/writes — they must all return zero rows / be rejected.
