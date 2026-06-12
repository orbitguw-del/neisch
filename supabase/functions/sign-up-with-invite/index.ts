import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ALLOWED_ORIGINS = ["https://storeyinfra.com", "https://www.storeyinfra.com"]

function makeCors(origin: string | null) {
  const o = origin ?? ""
  const reflect = ALLOWED_ORIGINS.includes(o) || o.endsWith(".vercel.app") || o === "http://localhost" || o === "capacitor://localhost"
  return {
    "Access-Control-Allow-Origin": reflect ? o : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-platform",
  }
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseKey = (Deno.env.get("SB_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))!
const supabase   = createClient(supabaseUrl, supabaseKey)

const isEmail = (s: unknown) =>
  typeof s === "string" && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

serve(async (req) => {
  const corsHeaders = makeCors(req.headers.get("origin"))
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  try {
    const body = await req.json()
    const { invite_code, email, password, full_name, validate_only } = body

    if (!invite_code) {
      return json({ error: "invite_code is required" }, 400)
    }

    // -- Validate-only mode: just check the code and return the invite email
    if (validate_only) {
      const { data: invite } = await supabase
        .from("pending_invites")
        .select("email, role")
        .eq("invite_code", invite_code.trim().toUpperCase())
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .single()

      if (!invite) {
        return json({ error: "Invite code is invalid or has expired. Ask your contractor to resend." }, 400)
      }
      return json({ email: invite.email, role: invite.role })
    }

    // -- Full sign-up mode
    if (!email || !password) {
      return json({ error: "invite_code, email and password are required" }, 400)
    }
    if (!isEmail(email)) {
      return json({ error: "Please enter a valid email address" }, 400)
    }
    if (typeof password !== "string" || password.length < 8) {
      return json({ error: "Password must be at least 8 characters" }, 400)
    }

    // -- 1. Look up the invite
    const { data: invite, error: inviteErr } = await supabase
      .from("pending_invites")
      .select("*")
      .eq("invite_code", invite_code.trim().toUpperCase())
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (inviteErr || !invite) {
      return json({ error: "Invite code is invalid or has expired. Ask your contractor to resend." }, 400)
    }

    // -- 2. Email must match what the contractor invited
    if (invite.email.toLowerCase() !== email.toLowerCase().trim()) {
      return json({ error: "This invite code was sent to a different email address. Use the email your contractor invited." }, 403)
    }

    // -- 3. Create the auth user
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
      // SECURITY: if the email already has an account, do NOT silently re-assign
      // its profile (role + tenant_id) to this invite's tenant. The profile
      // immutability trigger waves service-role callers through, so re-assigning
      // here would let an invite *capture* an existing user — including a member
      // of another tenant — into the inviter's tenant, with no authentication as
      // that user (only their email needs to be known). Reject and route them to
      // sign-in instead. Moving a user between tenants must be a deliberate,
      // authenticated action, never an invite side-effect.
      if (createErr.message.toLowerCase().includes("already")) {
        return json({ error: "An account with this email already exists. Please sign in directly with your email and password." }, 400)
      }
      return json({ error: createErr.message }, 400)
    }

    // -- 4. Set profile role + tenant (trigger may have already done this)
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          role:      invite.role,
          tenant_id: invite.tenant_id,
          full_name: full_name ?? email.split("@")[0],
        })
        .eq("id", userId)

      // -- 5. Create site assignment if a site was specified
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

    // -- 6. Mark invite as accepted
    await supabase
      .from("pending_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id)

    return json({ success: true })
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
})
