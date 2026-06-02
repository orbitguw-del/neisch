// Edge function: invite-user — creates a team invite and emails it via Resend.
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

const ROLE_LABELS: Record<string, string> = {
  site_manager: "Site Manager",
  supervisor:   "Supervisor",
  store_keeper: "Store Keeper",
}

const isEmail = (s: unknown) =>
  typeof s === "string" && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

function generateCode(len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/I/1 ambiguity
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => chars[b % chars.length]).join("")
}

function inviteEmailHtml(code: string, roleLabel: string, siteUrl: string): string {
  const host = siteUrl.replace(/^https?:\/\//, "")
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#2C1810">
      <h2 style="color:#B85042;margin-bottom:4px">You're invited to Storey</h2>
      <p>You've been invited to join a construction team on <strong>Storey</strong>
         as a <strong>${roleLabel}</strong>.</p>
      <p style="margin-bottom:6px">Your invite code:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#B85042;
                background:#E7E8D1;padding:16px;text-align:center;border-radius:8px;margin:0">
        ${code}
      </p>
      <p style="margin-top:20px">To join:</p>
      <ol style="line-height:1.6">
        <li>Open <a href="${siteUrl}" style="color:#B85042">${host}</a></li>
        <li>Choose <strong>Join with invite code</strong></li>
        <li>Enter the code above and create your account</li>
      </ol>
      <p style="color:#8b7b72;font-size:13px;margin-top:20px">
        This code expires in 7 days. If you weren't expecting this invite, you can ignore this email.
      </p>
    </div>`
}

serve(async (req) => {
  const corsHeaders = makeCors(req.headers.get("origin"))
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Missing authorization header")

    const { email, role, site_id, tenant_id } = await req.json()
    if (!email || !role || !site_id || !tenant_id) {
      throw new Error("email, role, site_id and tenant_id are all required")
    }
    if (!isEmail(email)) {
      throw new Error("Please enter a valid email address")
    }
    if (!ROLE_LABELS[role]) {
      throw new Error("Invalid role — must be site_manager, supervisor, or store_keeper")
    }

    // Verify the caller is a contractor on this tenant
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      (Deno.env.get("SB_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY"))!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized")

    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("role, tenant_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile)       throw new Error("Profile not found")
    if (profile.role !== "contractor")  throw new Error("Only contractors can invite team members")
    if (profile.tenant_id !== tenant_id) throw new Error("Tenant mismatch")

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      (Deno.env.get("SB_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))!
    )

    const siteUrl    = Deno.env.get("SITE_URL") ?? "https://storeyinfra.com"
    const cleanEmail = email.trim().toLowerCase()

    // Create pending_invite record with a unique code
    let invite_code = generateCode()
    const { error: insertErr } = await supabaseAdmin
      .from("pending_invites")
      .insert({ tenant_id, email: cleanEmail, role, site_id, invite_code })

    if (insertErr) {
      if (insertErr.message.includes("unique") || insertErr.code === "23505") {
        // Duplicate email for this tenant - refresh the existing invite instead
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
          .eq("email", cleanEmail)
      } else {
        throw new Error(insertErr.message)
      }
    }

    // Send the invite email via Resend.
    // Non-fatal: the invite code is returned regardless, so the contractor can
    // always share it directly (e.g. over WhatsApp) even if email delivery fails.
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    const INVITE_FROM    = Deno.env.get("INVITE_FROM_EMAIL")
                        ?? Deno.env.get("SUPPORT_FROM_EMAIL")
                        ?? "noreply@storeyinfra.com"
    let email_sent = false

    if (RESEND_API_KEY) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: INVITE_FROM,
            to: cleanEmail,
            subject: "You're invited to join Storey",
            html: inviteEmailHtml(invite_code, ROLE_LABELS[role] ?? role, siteUrl),
          }),
        })
        if (resendRes.ok) {
          email_sent = true
        } else {
          console.error("Resend invite email error:", resendRes.status, await resendRes.text())
        }
      } catch (e) {
        console.error("Resend invite email exception:", (e as Error).message)
      }
    } else {
      console.error("RESEND_API_KEY not set - invite email skipped")
    }

    return new Response(
      JSON.stringify({ success: true, invite_code, email_sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
