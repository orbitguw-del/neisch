import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabase   = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { invite_code, email, password, full_name } = await req.json()

    if (!invite_code || !email || !password) {
      return new Response(
        JSON.stringify({ error: "invite_code, email and password are required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // ── 1. Look up the invite ────────────────────────────────────────────────
    const { data: invite, error: inviteErr } = await supabase
      .from("pending_invites")
      .select("*")
      .eq("invite_code", invite_code.trim().toUpperCase())
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (inviteErr || !invite) {
      return new Response(
        JSON.stringify({ error: "Invite code is invalid or has expired. Ask your contractor to resend." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // ── 2. Email must match what the contractor invited ──────────────────────
    if (invite.email.toLowerCase() !== email.toLowerCase().trim()) {
      return new Response(
        JSON.stringify({ error: "This invite code was sent to a different email address. Use the email your contractor invited." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // ── 3. Create the auth user ──────────────────────────────────────────────
    const { data: authData, error: createErr } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name:    full_name ?? email.split("@")[0],
        invited_role: invite.role,
        tenant_id:    invite.tenant_id,
        site_id:      invite.site_id,
      },
    })

    let userId = authData?.user?.id

    if (createErr) {
      if (createErr.message.toLowerCase().includes("already")) {
        // User already exists — look up by email via auth.users (SECURITY DEFINER RPC)
        // profiles table has no 'email' column, so we use a dedicated helper function.
        const { data: existingId } = await supabase
          .rpc("get_auth_user_id_by_email", { p_email: email.toLowerCase().trim() })
        userId = existingId ?? undefined
      } else {
        return new Response(
          JSON.stringify({ error: createErr.message }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    // ── 4. Set profile role + tenant (trigger may have already done this) ────
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          role:      invite.role,
          tenant_id: invite.tenant_id,
          full_name: full_name ?? email.split("@")[0],
        })
        .eq("id", userId)

      // ── 5. Create site assignment if a site was specified ──────────────────
      if (invite.site_id) {
        await supabase
          .from("site_assignments")
          .upsert({
            site_id:    invite.site_id,
            profile_id: userId,
            tenant_id:  invite.tenant_id,
            role:       invite.role,
          }, { onConflict: "site_id,profile_id" })
      }
    }

    // ── 6. Mark invite as accepted ───────────────────────────────────────────
    await supabase
      .from("pending_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
