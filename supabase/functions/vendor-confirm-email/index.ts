import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ALLOWED_ORIGINS = ["https://storeyinfra.com", "https://www.storeyinfra.com"]

function makeCors(origin: string | null) {
  const o = origin ?? ""
  const reflect = ALLOWED_ORIGINS.includes(o) || o.endsWith(".vercel.app") || o === "http://localhost"
  return {
    "Access-Control-Allow-Origin": reflect ? o : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = Deno.env.get("SUPPORT_FROM_EMAIL") ?? "noreply@storeyinfra.com"
const NOTIFY_TO = Deno.env.get("SUPPORT_TO_EMAIL") ?? "help@storeyinfra.com"

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function vendorConfirmHtml(name: string, business: string): string {
  return `
<!doctype html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:Calibri,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px 20px;">
  <div style="background:linear-gradient(160deg,#B85042,#9A3F33);border-radius:16px;padding:28px 24px;color:#fff;text-align:center;">
    <div style="font-family:Impact,Arial Black,sans-serif;font-size:28px;letter-spacing:4px;margin-bottom:4px;">STOREY</div>
    <div style="font-size:11px;letter-spacing:2px;color:#E7E8D1;">SITE OPERATIONS</div>
  </div>

  <div style="background:#fff;border-radius:16px;padding:28px 24px;margin-top:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <h2 style="font-family:Georgia,serif;font-size:22px;color:#2A1410;margin:0 0 12px;">Hi ${esc(name)},</h2>
    <p style="font-size:15px;color:#6B5750;line-height:1.6;margin:0 0 16px;">
      Thank you for registering <strong>${esc(business)}</strong> as a vendor on Storey.
    </p>
    <p style="font-size:15px;color:#6B5750;line-height:1.6;margin:0 0 16px;">
      We've received your details and our team will review them within <strong>2 business days</strong>.
      Once approved, contractors across North-East India will be able to discover and connect with you through Storey.
    </p>
    <p style="font-size:15px;color:#6B5750;line-height:1.6;margin:0 0 20px;">
      In the meantime, feel free to reach out if you have any questions.
    </p>
    <a href="https://wa.me/919864066898" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
      💬 WhatsApp Karun
    </a>
  </div>

  <div style="text-align:center;padding:20px 0 0;font-size:12px;color:#A7BEAE;">
    Storey · Built in Guwahati · <a href="https://storeyinfra.com" style="color:#B85042;text-decoration:none;">storeyinfra.com</a>
  </div>
</div>
</body>
</html>`
}

function notifyKarunHtml(data: Record<string, string>): string {
  const rows = Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 8px;font-weight:600;color:#B85042;">${esc(k)}</td><td style="padding:4px 8px;color:#2A1410;">${esc(v)}</td></tr>`)
    .join("")
  return `<h3 style="font-family:Georgia,serif;color:#B85042;">New Vendor Registration</h3><table style="font-size:14px;font-family:Calibri,Arial,sans-serif;">${rows}</table>`
}

serve(async (req) => {
  const corsHeaders = makeCors(req.headers.get("origin"))
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } })

  try {
    const payload = await req.json().catch(() => null)
    if (!payload) return json({ error: "Invalid body" }, 400)

    const { contact_name, business_name, email, phone, city, work_type, gst_number, note } = payload as Record<string, string>

    if (!contact_name || !business_name) return json({ error: "Missing name or business" }, 400)
    if (!RESEND_API_KEY) return json({ error: "Email not configured" }, 503)

    const sends: Promise<Response>[] = []

    if (email && /@/.test(email)) {
      sends.push(fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: `Storey — Registration received, ${contact_name}`,
          html: vendorConfirmHtml(contact_name, business_name),
        }),
      }))
    }

    sends.push(fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: NOTIFY_TO,
        subject: `New vendor: ${business_name} (${contact_name})`,
        html: notifyKarunHtml({ Business: business_name, Contact: contact_name, Phone: phone, Email: email, City: city, "Work Type": work_type, GST: gst_number, Note: note }),
      }),
    }))

    const results = await Promise.allSettled(sends)
    const anyFailed = results.some(r => r.status === "rejected")

    return json({ success: !anyFailed, emails_sent: results.length })
  } catch (error) {
    console.error("vendor-confirm-email error:", error)
    return json({ error: (error as Error).message }, 500)
  }
})
