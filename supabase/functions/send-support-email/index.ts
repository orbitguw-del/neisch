import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Required: set in Supabase Dashboard → Edge Functions → Secrets
//   RESEND_API_KEY        Your Resend API key (resend.com)
// Optional:
//   SUPPORT_TO_EMAIL      Inbox that receives requests (default: help@storeyinfra.com)
//   SUPPORT_FROM_EMAIL    Verified sender on your Resend account
//                         (default: noreply@storeyinfra.com — must be on a verified domain)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPPORT_TO     = Deno.env.get("SUPPORT_TO_EMAIL")   ?? "help@storeyinfra.com"
const SUPPORT_FROM   = Deno.env.get("SUPPORT_FROM_EMAIL") ?? "noreply@storeyinfra.com"

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  try {
    const payload = await req.json().catch(() => null)
    if (!payload || typeof payload !== "object") {
      return json({ error: "Invalid request body" }, 400)
    }

    const { name, from_email, message, page } = payload as Record<string, unknown>

    if (typeof message !== "string" || message.trim().length < 3) {
      return json({ error: "Please describe your issue (at least 3 characters)." }, 400)
    }
    if (message.length > 5000) {
      return json({ error: "Message too long (max 5000 characters)." }, 400)
    }

    // If the email provider isn't configured, return a specific status so the
    // client knows to fall back to mailto. NOT a generic 500 — we want this signal.
    if (!RESEND_API_KEY) {
      return json({ error: "Email provider not configured", fallback: "mailto" }, 503)
    }

    const safeName    = typeof name       === "string" ? name.slice(0, 100)       : ""
    const safeFrom    = typeof from_email === "string" ? from_email.slice(0, 200) : ""
    const safeMessage = message.slice(0, 5000)
    const safePage    = typeof page       === "string" ? page.slice(0, 200)       : ""

    const subject = `Storey support: ${safeName || "anonymous"}`
    const replyTo = /@/.test(safeFrom) ? safeFrom : undefined

    const html = [
      "<p><strong>From:</strong> ",
      htmlEscape(safeName) || "(no name)",
      safeFrom ? ` &lt;${htmlEscape(safeFrom)}&gt;` : "",
      "</p>",
      `<p><strong>Page:</strong> ${htmlEscape(safePage) || "unknown"}</p>`,
      "<hr>",
      `<p>${htmlEscape(safeMessage).replace(/\n/g, "<br>")}</p>`,
    ].join("")

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SUPPORT_FROM,
        to: SUPPORT_TO,
        subject,
        html,
        reply_to: replyTo,
      }),
    })

    if (!resendRes.ok) {
      const errBody = await resendRes.text()
      console.error("Resend error:", resendRes.status, errBody)
      // Return 502 so the client knows the upstream failed and can fall back.
      return json({ error: "Failed to send email", fallback: "mailto" }, 502)
    }

    return json({ success: true })
  } catch (error) {
    console.error("send-support-email error:", error)
    return json({ error: (error as Error).message, fallback: "mailto" }, 500)
  }
})
