import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function generateCode(len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/I/1 ambiguity
  let code = ""
  for (let i = 0; i < len; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Missing authorization header")

    const { email, role, site_id, tenant_id } = await req.json()
    if (!email || !role || !site_id || !tenant_id) {
      throw new Error("email, role, site_id and tenant_id are all required")
    }

    // ── Verify the caller is a contractor on this tenant ────────────────────
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized")

    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("role, tenant_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile)      throw new Error("Profile not found")
    if (profile.role !== "contractor") throw new Error("Only contractors can invite team members")
    if (profile.tenant_id !== tenant_id) throw new Error("Tenant mismatch")

    // ── Use service role for admin operations ────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://storeyinfra.com"

    // ── Create pending_invite record with a unique code ──────────────────────
    let invite_code = generateCode()
    // Retry once if there's a collision (extremely rare)
    const { error: insertErr } = await supabaseAdmin
      .from("pending_invites")
      .insert({
        tenant_id,
        email:       email.trim().toLowerCase(),
        role,
        site_id,
        invite_code,
      })

    if (insertErr) {
      if (insertErr.message.includes("unique") || insertErr.code === "23505") {
        // Duplicate email for this tenant — update the existing invite instead
        invite_code = generateCode()
        await supabaseAdmin
          .from("pending_invites")
          .update({
            role,
            site_id,
            invite_code,
            accepted_at: null,
            expires_at:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("tenant_id", tenant_id)
          .eq("email", email.trim().toLowerCase())
      } else {
        throw new Error(insertErr.message)
      }
    }

    // ── Send Supabase native invite email (magic link) ───────────────────────
    const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      {
        data: {
          invited_role: role,
          tenant_id,
          site_id,
        },
        redirectTo: `${siteUrl}/auth/callback`,
      }
    )

    if (inviteErr) {
      // Non-fatal: magic link may fail for existing users — the code still works
      console.error("inviteUserByEmail error:", inviteErr.message)
    }

    return new Response(
      JSON.stringify({ success: true, invite_code }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
