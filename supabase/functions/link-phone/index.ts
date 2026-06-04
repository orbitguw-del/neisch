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
const supabase = createClient(supabaseUrl, supabaseKey)

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!
const TWILIO_AUTH_TOKEN  = Deno.env.get("TWILIO_AUTH_TOKEN")!
const TWILIO_PHONE       = Deno.env.get("TWILIO_PHONE")!

const isE164 = (s: unknown) =>
  typeof s === "string" && /^\+\d{8,15}$/.test(s)

serve(async (req) => {
  const corsHeaders = makeCors(req.headers.get("origin"))
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders })

  // â"€â"€ Authenticate the calling user from their JWT â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const authHeader = req.headers.get("Authorization") ?? ""
  const jwt = authHeader.replace("Bearer ", "")
  if (!jwt) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt)
  if (authErr || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    const body = await req.json()
    const { action, phone_number, otp_code } = body

    // â"€â"€ STEP 1: send OTP â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
    if (action === "send") {
      if (!isE164(phone_number)) {
        return new Response(
          JSON.stringify({ error: "Provide phone in E.164 format, e.g. +919876543210" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // Check the phone isn't already linked to a different account
      const { data: existing } = await supabase
        .rpc("get_auth_user_by_phone", { p_phone: phone_number })
      if (existing && existing.length > 0 && existing[0].user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: "This phone number is already linked to another account." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const buf = new Uint32Array(1)
      crypto.getRandomValues(buf)
      const otp = String(100000 + (buf[0] % 900000))

      const { error: insertErr } = await supabase
        .from("phone_verifications")
        .insert([{ user_id: user.id, phone_number, otp_code: otp }])
      if (insertErr) {
        return new Response(
          JSON.stringify({ error: "Failed to generate OTP", detail: insertErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: TWILIO_PHONE,
            To: phone_number,
            Body: `Your Storey verification code is: ${otp}. Valid for 10 minutes.`,
          }),
        }
      )

      if (!twilioRes.ok) {
        console.error("Twilio error:", await twilioRes.text())
        return new Response(
          JSON.stringify({ error: "Failed to send SMS" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // â"€â"€ STEP 2: verify OTP and link phone â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
    if (action === "verify") {
      if (!isE164(phone_number) || !/^\d{6}$/.test(String(otp_code))) {
        return new Response(
          JSON.stringify({ error: "Invalid phone number or code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const { data: verification, error: verifyErr } = await supabase
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

      if (verifyErr || !verification) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired OTP." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // Mark verified
      await supabase
        .from("phone_verifications")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", verification.id)

      // Link phone to auth.users
      await supabase.auth.admin.updateUserById(user.id, { phone: phone_number })

      // Update profile
      await supabase
        .from("profiles")
        .update({ phone: phone_number, phone_verified: true })
        .eq("id", user.id)

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'send' or 'verify'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
