import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  try {
    const { email, phone_number, otp_code } = await req.json()

    if (!email || !phone_number || !otp_code) {
      return new Response(
        JSON.stringify({ error: "Missing email, phone_number, or otp_code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Look up user via Auth Admin REST API (profiles don't store email)
    const adminRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&per_page=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    const adminJson = await adminRes.json()
    const authUser = adminJson?.users?.[0]

    if (!authUser?.id) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const user = { id: authUser.id }
    const MAX_ATTEMPTS = 5

    // Hard cap brute force on the most recent unverified record for this user+phone.
    const { data: latest } = await supabase
      .from("phone_verifications")
      .select("id, attempts")
      .eq("user_id", user.id)
      .eq("phone_number", phone_number)
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latest && (latest.attempts || 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Request a new code." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Phone-ownership binding: profile.phone must be set AND match.
    // First-time enrollment is no longer allowed via the login flow.
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .single()
    if (!profile?.phone || profile.phone !== phone_number) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data: verification, error: verifyError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("phone_number", phone_number)
      .eq("otp_code", otp_code)
      .gt("expires_at", new Date().toISOString())
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (verifyError || !verification) {
      if (latest) {
        await supabase
          .from("phone_verifications")
          .update({ attempts: (latest.attempts || 0) + 1 })
          .eq("id", latest.id)
      }

      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    await supabase
      .from("phone_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verification.id)

    // Generate a magic-link token so the frontend can verifyOtp() and mint a session.
    // Return only the hashed_token + type — never the full action_link URL.
    const { data: magicData, error: magicError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    const token_hash = magicError ? null : magicData?.properties?.hashed_token ?? null

    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        message: "Phone verified successfully",
        token_hash,
        otp_type: "magiclink",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
