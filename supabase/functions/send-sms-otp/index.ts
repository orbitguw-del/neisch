import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabase = createClient(supabaseUrl, supabaseKey)

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!
const TWILIO_PHONE = Deno.env.get("TWILIO_PHONE")!

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  try {
    const { email, phone_number } = await req.json()

    if (!email || !phone_number) {
      return new Response(
        JSON.stringify({ error: "Missing email or phone_number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Generic response — never leaks whether the email/phone is registered.
    const genericOk = new Response(
      JSON.stringify({ success: true, message: "If the details are correct, an OTP has been sent." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

    // Look up user via Auth Admin REST API (profiles don't store email)
    const adminRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&per_page=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    const adminJson = await adminRes.json()
    const authUser = adminJson?.users?.[0]
    if (!authUser?.id) return genericOk

    const user = { id: authUser.id }

    // Phone-ownership binding: profile.phone must be set AND match.
    // First-time enrollment goes through the dedicated enroll-phone-otp endpoint.
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .single()
    if (!profile?.phone || profile.phone !== phone_number) return genericOk

    // Rate limit: reject if an unexpired OTP was issued in the last 60s.
    const cutoff = new Date(Date.now() - 60_000).toISOString()
    const { data: recent } = await supabase
      .from("phone_verifications")
      .select("id")
      .eq("user_id", user.id)
      .gt("created_at", cutoff)
      .limit(1)
      .maybeSingle()
    if (recent) return genericOk

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString()

    const { error: otpError } = await supabase
      .from("phone_verifications")
      .insert([{ user_id: user.id, phone_number, otp_code }])

    if (otpError) return genericOk

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    const authString = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE,
        To: phone_number,
        Body: `Your Storey login code is: ${otp_code}. Valid for 10 minutes.`,
      }),
    })

    if (!twilioResponse.ok) {
      console.error("Twilio error:", await twilioResponse.text())
      return new Response(
        JSON.stringify({ error: "Failed to send SMS" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return genericOk
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
