import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const admin = createClient(supabaseUrl, serviceKey)

const MAX_ATTEMPTS = 5

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return json({ error: "Unauthorized" }, 401)

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) return json({ error: "Unauthorized" }, 401)

    const { phone_number, otp_code } = await req.json()
    if (!phone_number || !otp_code) return json({ error: "Missing phone_number or otp_code" }, 400)

    // Re-check enrollment guard (defense in depth — send-side already rejects mismatch).
    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .single()
    if (profile?.phone && profile.phone !== phone_number) {
      return json({ error: "Phone already enrolled" }, 409)
    }

    // Hard cap on attempts.
    const { data: latest } = await admin
      .from("phone_verifications")
      .select("id, attempts")
      .eq("user_id", user.id)
      .eq("phone_number", phone_number)
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (latest && (latest.attempts || 0) >= MAX_ATTEMPTS) {
      return json({ error: "Too many attempts. Request a new code." }, 429)
    }

    const { data: verification, error: verifyError } = await admin
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
        await admin
          .from("phone_verifications")
          .update({ attempts: (latest.attempts || 0) + 1 })
          .eq("id", latest.id)
      }
      return json({ error: "Invalid or expired OTP" }, 400)
    }

    await admin
      .from("phone_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verification.id)

    // Enroll: set profile.phone only if not already set.
    if (!profile?.phone) {
      await admin
        .from("profiles")
        .update({ phone: phone_number, phone_verified: true })
        .eq("id", user.id)
    }

    return json({ success: true, message: "Phone enrolled." })
  } catch (error) {
    return json({ error: (error as Error).message }, 500)
  }
})
