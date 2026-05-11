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
    const { phone_number, otp_code, platform } = await req.json()
    const isNative = platform === 'native'

    if (!phone_number || !otp_code) {
      return new Response(
        JSON.stringify({ error: "Missing phone_number or otp_code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Look up user by phone number in auth.users
    const { data: userData, error: lookupError } = await supabase
      .rpc("get_auth_user_by_phone", { p_phone: phone_number })

    if (lookupError || !userData || userData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No account found with this phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const user = { id: userData[0].user_id, email: userData[0].user_email }

    // Verify OTP
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
      // Increment attempts on the latest unverified record
      const { data: latest } = await supabase
        .from("phone_verifications")
        .select("id, attempts")
        .eq("user_id", user.id)
        .eq("phone_number", phone_number)
        .is("verified_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

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

    // Mark OTP as verified
    await supabase
      .from("phone_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verification.id)

    // Update profile
    await supabase
      .from("profiles")
      .update({ phone: phone_number, phone_verified: true })
      .eq("id", user.id)

    // Generate a magic-link token so the frontend can establish a real auth
    // session WITHOUT opening any browser.
    // We return the hashed_token — the client calls
    //   supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })
    // which hits POST /auth/v1/verify server-side and returns a session
    // directly, no redirect or browser tab needed.
    const siteUrl    = (Deno.env.get("SITE_URL") ?? "https://storeyinfra.com").replace(/\/$/, "")
    const redirectTo = isNative ? "storeyapp://auth/callback" : `${siteUrl}/auth/callback`

    const { data: magicData, error: magicError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
      options: { redirectTo },
    })

    if (magicError) {
      console.error("Magic link error:", magicError.message)
    }

    const hashedToken = magicData?.properties?.hashed_token ?? null
    const actionLink  = magicData?.properties?.action_link  ?? null

    return new Response(
      JSON.stringify({
        success:      true,
        user_id:      user.id,
        message:      "Phone verified successfully",
        // hashed_token: client calls verifyOtp({ token_hash }) — no browser needed
        hashed_token: magicError ? null : hashedToken,
        // magic_link: fallback for web if verifyOtp is not available
        magic_link:   magicError ? null : actionLink,
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
