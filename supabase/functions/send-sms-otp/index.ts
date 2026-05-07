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
    const { phone_number } = await req.json()

    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: "Missing phone_number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Look up user by phone number in auth.users
    const { data: userData, error: lookupError } = await supabase
      .rpc("get_auth_user_by_phone", { p_phone: phone_number })

    if (lookupError || !userData || userData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No account found with this phone number. Sign in with email first and add your phone in settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const user = { id: userData[0].user_id }

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString()

    const { error: otpError } = await supabase
      .from("phone_verifications")
      .insert([{ user_id: user.id, phone_number, otp_code }])

    if (otpError) {
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP", detail: otpError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

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

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent to phone" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
