import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-platform",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const serviceKey = (Deno.env.get("SB_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))!
const admin = createClient(supabaseUrl, serviceKey)

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  let createdUserId: string | null = null

  try {
    const { email, password, full_name, tenant_name, consent } = await req.json()
    if (!email || !password || !tenant_name) {
      return json({ error: "Missing email, password, or tenant_name" }, 400)
    }
    // `consent` shape (optional):
    //   { accepted_at: ISO string, terms_version: string, privacy_version: string }

    // ── Step 0: detect orphan / existing user before trying to create.
    // An "orphan" is an auth.users row created earlier (often by a half-finished
    // registration or invite flow) that has no profile + no tenant attached.
    // The user can never sign in or reset their password — they need cleanup
    // before re-registering.
    //
    // We look up the user by email via the admin API.
    // Note: the Supabase query builder is thenable but does NOT implement
    // `.catch()` — chaining it raises "catch is not a function" at runtime.
    // Wrap in try/catch instead.
    let lookup: { id: string; tenant_id: string | null } | null = null
    try {
      const { data } = await admin
        .from("profiles")
        .select("id, tenant_id")
        .ilike("email", email)
        .maybeSingle()
      lookup = data ?? null
    } catch (_) {
      lookup = null
    }

    const { data: existingList } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })
    const existing = existingList?.users?.find(
      (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
    )

    if (existing && lookup?.tenant_id) {
      // Real complete account — should sign in, not register.
      return json({
        error:
          "This email already has a Storey account. Please sign in instead — use 'Forgot password' if you need to reset.",
        code: "EMAIL_EXISTS_WITH_TENANT",
      }, 409)
    }

    if (existing && !lookup?.tenant_id) {
      // Orphan — clean it up so the user can register fresh.
      await admin.auth.admin.deleteUser(existing.id).catch((e) =>
        console.error("Failed to delete orphan user", existing.id, e),
      )
      // Fall through to the regular create flow below.
    }

    // ── Step 1: create auth user (email_confirm true so they can sign in immediately).
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name ?? null },
    })
    if (createError || !userData?.user) {
      // Surface the actual Supabase error message instead of a generic one.
      const msg = createError?.message ?? "Failed to create account"
      const isDuplicate = /already.*regist|already.*exist|duplicate/i.test(msg)
      return json({
        error: isDuplicate
          ? "This email is already registered. Please sign in instead."
          : msg,
        code: isDuplicate ? "EMAIL_EXISTS" : "AUTH_CREATE_FAILED",
      }, isDuplicate ? 409 : 400)
    }
    createdUserId = userData.user.id

    // ── Step 2: insert tenant — owned by the new user.
    const { error: tenantError } = await admin
      .from("tenants")
      .insert({ name: tenant_name, owner_id: createdUserId })

    if (tenantError) {
      // Rollback: delete the orphaned auth user.
      await admin.auth.admin.deleteUser(createdUserId).catch((e) =>
        console.error("Rollback failed for user", createdUserId, e),
      )
      return json({
        error: `Failed to create company: ${tenantError.message}`,
        code: "TENANT_INSERT_FAILED",
      }, 400)
    }

    // ── Step 3: record ToS / Privacy Policy consent on the profile row
    // (the profile itself is created by the handle_new_user trigger).
    // Best-effort — a failure here should not roll back the user.
    if (consent && typeof consent === "object") {
      try {
        await admin
          .from("profiles")
          .update({
            consent_at:              consent.accepted_at ?? new Date().toISOString(),
            consent_terms_version:   consent.terms_version ?? null,
            consent_privacy_version: consent.privacy_version ?? null,
          })
          .eq("id", createdUserId)
      } catch (e) {
        console.error("Consent stamp failed for", createdUserId, e)
      }
    }

    return json({ success: true, user_id: createdUserId })
  } catch (error) {
    // Best-effort rollback on any unexpected error after user creation.
    if (createdUserId) {
      await admin.auth.admin.deleteUser(createdUserId).catch((e) =>
        console.error("Rollback failed for user", createdUserId, e),
      )
    }
    return json({
      error: (error as Error).message,
      code: "UNEXPECTED",
    }, 500)
  }
})
