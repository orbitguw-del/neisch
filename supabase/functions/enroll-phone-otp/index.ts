import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const admin = createClient(supabaseUrl, serviceKey)

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!
const TWILIO_PHONE = Deno.env.get("TWILIO_PHONE")!

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  try {
    // Require an authenticated session — this is enrollment, not login.
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return json({ error: "Unauthorized" }, 401)

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) return json({ error: "Unauthorized" }, 401)

    const { phone_number } = await req.json()
    if (!phone_number || !/^\+\d{8,15}$/.test(phone_number)) {
      return json({ error: "Provide phone in E.164 format, e.g. +919876543210" }, 400)
    }

    // Block re-enrollment to a different number — must be done via a dedicated change flow.
    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .single()
    if (profile?.phone && profile.phone !== phone_number) {
      return json({ error: "Phone already enrolled. Contact support to change." }, 409)
    }

    // 60s server-side rate limit.
    const cutoff = new Date(Date.now() - 60_000).toISOString()
    const { data: recent } = await admin
      .from("phone_verifications")
      .select("id")
      .eq("user_id", user.id)
      .gt("created_at", cutoff)
      .limit(1)
      .maybeSingle()
    if (recent) return json({ error: "Please wait before requesting another code." }, 429)

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString()

    const { error: insertError } = await admin
      .from("phone_verifications")
      .insert([{ user_id: user.id, phone_number, otp_code }])
    if (insertError) return json({ error: "Failed to create verification" }, 500)

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    const authString = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE,
        To: phone_number,
        Body: `Your Storey verification code is: ${otp_code}. Valid for 10 minutes.`,
      }),
    })
    if (!twilioRes.ok) {
      console.error("Twilio error:", await twilioRes.text())
      return json({ error: "Failed to send SMS" }, 500)
    }

    return json({ success: true, message: "Verification code sent." })
  } catch (error) {
    return json({ error: (error as Error).message }, 500)
  }
})
