# Storey — Customer Support Bot
### Full Plan · Knowledge Base · Technical Build
*Created 2026-05-24 · Owner: Karun*

---

## The Goal

Every contractor who pays ₹2,999/month expects support.
At 5 contractors you handle it manually.
At 50 you cannot.
This bot handles 80% of queries instantly, escalates the rest to Karun on WhatsApp.

---

## Channel: WhatsApp First. Everything Else Later.

Your customers will never email. They will never use a web widget.
They will WhatsApp your personal number the moment something breaks.
The bot must live on WhatsApp.

---

## Three Phases

```
Phase 1  →  WATI keyword bot         (₹999/mo, 1 day setup)
Phase 2  →  Claude AI bot            (₹2,000/mo, 1 week build)
Phase 3  →  In-app help widget       (free with Crisp, 2 days build)
```

---

## Phase 1 — WATI Keyword Bot

**Platform:** WATI (wati.io) or Interakt (interakt.ai)
**Cost:** ₹999–2,999/month
**Setup time:** 1 day
**What it does:** Keyword triggers → canned answers → escalate to Karun

### Setup Steps

1. Sign up at wati.io → connect WhatsApp Business number
2. Create these keyword flows:

```
Keyword: "inventory", "material", "stock"
→ Reply: [Inventory guide — see Knowledge Base #1]

Keyword: "expense", "bill", "payment"
→ Reply: [Expense guide — see Knowledge Base #2]

Keyword: "tally", "xml", "export"
→ Reply: [Tally guide — see Knowledge Base #3]

Keyword: "login", "otp", "sign in", "password"
→ Reply: [Login guide — see Knowledge Base #4]

Keyword: "plan", "upgrade", "price", "cost"
→ Reply: [Pricing guide — see Knowledge Base #5]

Keyword: "team", "assign", "manager", "supervisor"
→ Reply: [Team guide — see Knowledge Base #6]

Keyword: "help", "hi", "hello", "start"
→ Reply: [Main menu]

Keyword: "talk", "karun", "human", "person"
→ Escalate to Karun immediately
```

### Main Menu Message

```
Hi! 👋 I'm the Storey support bot.

What do you need help with?

1️⃣  Using a feature
2️⃣  Billing & plans
3️⃣  Something isn't working
4️⃣  Tally integration
5️⃣  Talk to Karun directly

Reply with a number or just type your question.
```

### Escalation Message to Contractor

```
Got it — connecting you with Karun now.
He'll respond within 2 hours.

For urgent issues call: [Karun's number]
```

### Escalation Alert to Karun

```
🚨 SUPPORT ESCALATION

From: [Contractor Name]
Phone: [Number]
Plan: [Free/Basic/Advanced]
Message: "[their message]"

Reply to this chat to take over.
```

---

## Phase 2 — Claude AI Bot (Edge Function)

**Stack:** Twilio WhatsApp API + Supabase Edge Function + Claude Haiku
**Cost:** ~₹1,500–3,000/month at 50 contractors
**Build time:** 5–7 days

### Architecture

```
Contractor WhatsApps support number
           ↓
    Twilio receives message
           ↓
    POST to Supabase Edge Function
    /functions/v1/whatsapp-bot
           ↓
    Look up contractor by phone
    (get their plan, sites, tenant)
           ↓
    Build prompt with context +
    Storey knowledge base
           ↓
    Claude Haiku API call
           ↓
    Check if escalation needed
           ↓
    Reply via Twilio WhatsApp
```

### Edge Function: `supabase/functions/whatsapp-bot/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ANTHROPIC_KEY  = Deno.env.get("ANTHROPIC_API_KEY")!
const TWILIO_SID     = Deno.env.get("TWILIO_ACCOUNT_SID")!
const TWILIO_TOKEN   = Deno.env.get("TWILIO_AUTH_TOKEN")!
const TWILIO_FROM    = Deno.env.get("TWILIO_WHATSAPP_FROM")!
const KARUN_NUMBER   = Deno.env.get("KARUN_WHATSAPP_NUMBER")!

const ESCALATION_TRIGGERS = [
  "cancel", "refund", "lost data", "all gone", "deleted",
  "urgent", "emergency", "broken since", "not working for days",
  "client is asking", "site stopped", "money deducted", "charged twice"
]

const SYSTEM_PROMPT = `
You are Storey Support — the helpful assistant for Storey,
a construction site management app for contractors in Northeast India.

PERSONALITY:
- Friendly, direct, like a knowledgeable friend on WhatsApp
- Short replies — contractors are busy and on site
- Never use corporate language ("your query has been logged")
- Use simple English. Avoid jargon.
- Occasionally use relevant emojis (✅ ❌ 📦 💰 🏗️)

YOUR JOB:
- Answer how-to questions about Storey features
- Help with billing and plan questions
- Troubleshoot common issues
- If you cannot resolve: say "Let me get Karun on this" and write ESCALATE

NEVER:
- Make up features that don't exist
- Promise things you aren't sure about
- Give financial or legal advice

STOREY KNOWLEDGE BASE:
[KNOWLEDGE BASE INJECTED BELOW]
`

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } })
  }

  try {
    // Parse Twilio webhook (form-encoded)
    const body = await req.text()
    const params = new URLSearchParams(body)
    const from    = params.get("From")?.replace("whatsapp:", "") ?? ""
    const message = params.get("Body") ?? ""
    const name    = params.get("ProfileName") ?? "Contractor"

    if (!from || !message) {
      return new Response("ok", { status: 200 })
    }

    // Check for instant escalation triggers
    const lowerMsg = message.toLowerCase()
    const needsEscalation = ESCALATION_TRIGGERS.some(t => lowerMsg.includes(t))

    if (needsEscalation) {
      await sendWhatsApp(KARUN_NUMBER, escalationAlert(name, from, message))
      await sendWhatsApp(from,
        `Got it — connecting you with Karun directly.\nHe'll respond within 2 hours. 🙏`)
      return new Response("ok", { status: 200 })
    }

    // Look up contractor in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, tenant_id, tenants(name, plan)")
      .eq("phone", from.replace("+", ""))
      .maybeSingle()

    const planContext = profile?.tenants
      ? `This contractor is on the ${profile.tenants.plan} plan.`
      : `This person may not be a Storey customer yet.`

    // Call Claude
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT + `\n\nCONTEXT: ${planContext}`,
        messages: [{ role: "user", content: message }],
      }),
    })

    const aiData = await aiResponse.json()
    const reply  = aiData.content?.[0]?.text ?? "Let me get Karun on this — ESCALATE"

    // Check if AI decided to escalate
    if (reply.includes("ESCALATE")) {
      await sendWhatsApp(KARUN_NUMBER, escalationAlert(name, from, message))
      await sendWhatsApp(from,
        `This one needs Karun's attention — he'll be with you within 2 hours. 🙏`)
      return new Response("ok", { status: 200 })
    }

    await sendWhatsApp(from, reply)
    return new Response("ok", { status: 200 })

  } catch (err) {
    console.error("whatsapp-bot error:", err)
    return new Response("ok", { status: 200 }) // Always 200 to Twilio
  }
})

async function sendWhatsApp(to: string, body: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: `whatsapp:${TWILIO_FROM}`,
      To:   `whatsapp:${to}`,
      Body: body,
    }),
  })
}

function escalationAlert(name: string, phone: string, message: string): string {
  return `🚨 SUPPORT ESCALATION\n\nFrom: ${name}\nPhone: ${phone}\nMessage: "${message}"\n\nReply to take over the conversation.`
}
```

### Required Secrets (add in Supabase Dashboard)

```
ANTHROPIC_API_KEY         Your Anthropic API key
TWILIO_ACCOUNT_SID        From twilio.com dashboard
TWILIO_AUTH_TOKEN         From twilio.com dashboard
TWILIO_WHATSAPP_FROM      Your Twilio WhatsApp number e.g. +14155238886
KARUN_WHATSAPP_NUMBER     Your personal number e.g. +919876543210
```

---

## Phase 3 — In-App Help Widget

**Platform:** Crisp (crisp.chat) — free tier to start
**Build time:** 2 hours

Add to `index.html`:
```html
<script>
  window.$crisp=[];
  window.CRISP_WEBSITE_ID="YOUR-CRISP-ID";
  (function(){d=document;s=d.createElement("script");
  s.src="https://client.crisp.chat/l.js";
  s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
</script>
```

Pass user context to Crisp (in `authStore` after login):
```javascript
$crisp.push(["set", "user:nickname", [profile.full_name]])
$crisp.push(["set", "user:email",    [profile.email]])
$crisp.push(["set", "session:data",  [[
  ["plan",    tenant.plan],
  ["sites",   sites.length],
  ["company", tenant.name],
]]])
```

Crisp then shows you the contractor's plan + site count when they message — no need to ask.

---

## Complete Knowledge Base

### KB-1: Inventory & Materials

**Q: How do I add a new material?**
Go to Inventory → tap the + button → fill in material name, unit, category → Save.
Tip: Set a Budget Qty and Rate if you want to track budget vs actual spend.

**Q: How do I record stock coming in (material receipt)?**
Go to Inventory → Material Receipts tab → tap + Add Receipt → fill in vendor, quantity, amount, date → Save.
The quantity will automatically add to your stock.

**Q: How do I mark materials as used on site?**
Go to Inventory → tap any material → Allocate → enter quantity used, which site, which task.
This reduces the available stock and appears in your Consumption report.

**Q: Why is stock showing wrong quantity?**
Check if receipts have been entered for that material. Also check if any allocations were done incorrectly. Go to Reports → Consumption to see all usage.

**Q: How do I set a reorder alert?**
Edit a material → set Minimum Quantity → Save.
The dashboard will show a red alert when stock falls below this level.

**Q: How do I set a budget for a material?**
Edit any material → set Budget Qty and Budget Rate → Save.
The Budget Health widget on your dashboard will now track spend vs budget.
*This feature requires Advanced plan.*

---

### KB-2: Expenses

**Q: How do I log a site expense?**
Go to Expenses → tap + Add Expense → select site, date, category, amount → Save.
New expenses are Pending until approved by your Site Manager.

**Q: How do I approve an expense?**
Go to Expenses → find the pending expense → tap Approve.
Only Contractors and Site Managers can approve.

**Q: Why can't I see the Approve button?**
Only Contractors and Site Managers can approve expenses. Supervisors can only add them.
Check your role in Settings → Profile.

**Q: How do I add a bill photo to an expense?**
When adding an expense, tap the camera icon at the bottom of the form. Take a photo or upload from gallery.

**Q: How do I see total spending for a month?**
Go to Expenses → set the date filter to the month you want → the summary cards at the top show Approved spend and Pending approval totals.

---

### KB-3: Tally Integration

**Q: How do I export data to Tally?**
Go to Reports → Tally Export tab → select date range → tap Download Tally XML.
Then in Tally: Gateway of Tally → Import Data → Vouchers → select the file.
*This feature requires Basic plan or above.*

**Q: Why are duplicate ledgers appearing in Tally after import?**
The vendor or ledger names in Storey don't exactly match what's in Tally.
Go to Settings → Integrations → Tally Setup → map each vendor to its exact Tally ledger name.
After mapping, re-export and re-import.

**Q: Which Tally versions does this work with?**
Tally ERP 9 (Release 6+) and TallyPrime 1.x, 2.x, 3.x, 4.x.

**Q: My accountant imported the file twice — now there are double entries.**
In Tally: go to the voucher → delete the duplicate entry manually.
Future exports include a unique ID per voucher so Tally won't duplicate on re-import.

**Q: How do I set up the Tally mapping?**
Go to Settings → Integrations → Tally Setup → map your vendors, sites, and expense categories to the exact names they appear in your Tally.
Do this once — Storey remembers it forever.

---

### KB-4: Login & Access

**Q: I'm not receiving the OTP.**
1. Check that your phone number is correct (with country code +91)
2. Wait 60 seconds — OTP can be slow on some networks
3. Check SMS inbox AND DND settings on your phone
4. Try again — tap Resend OTP
5. If still not working, message Karun directly

**Q: My team member can't log in.**
Ask them to use the invite link you sent them. The invite link is different from the app login.
If the link has expired: Go to Team → find the person → Resend Invite.

**Q: I forgot which email I used to sign up.**
Message Karun with your company name and phone number. He'll look it up.

**Q: Can I use the app on multiple phones?**
Yes — Storey works on any phone and browser. Same account, multiple devices.

**Q: How do I add a new team member?**
Go to Team → Invite Member → enter their phone number or email → Send Invite.
They will receive an SMS/email with a link to set up their account.

---

### KB-5: Plans & Billing

**Q: What's included in the Free plan?**
1 site, 3 team members, 10 workers, basic inventory and expenses.
No reports, no Tally export, no material receipts.

**Q: What's included in Basic (₹2,999/month)?**
Up to 3 sites, 15 team members, 50 workers.
Full inventory, material receipts, expenses, equipment, vendors.
Reports: Consumption + Materials In.
Tally XML export.

**Q: What's included in Advanced (₹6,999/month)?**
Unlimited sites, team, workers.
Everything in Basic PLUS:
Material budgeting, Budget vs Actual report, Budget Health dashboard widget.
XLS export for all reports.
Live Tally sync (coming soon).
Priority WhatsApp support.

**Q: How do I upgrade my plan?**
Go to Settings → Billing → tap Upgrade → select your plan → pay via Razorpay.
The upgrade is instant — features unlock immediately after payment.

**Q: Can I pay annually and save money?**
Yes.
Basic annual: ₹24,999/year (save ₹11,000 — 3.7 months free)
Advanced annual: ₹59,999/year (save ₹24,000)
Go to Settings → Billing → switch to Annual billing.

**Q: How do I cancel?**
Go to Settings → Billing → Cancel subscription.
You keep access until the end of your current billing period.
No refunds on partial months.

**Q: My payment failed.**
Check that your card has sufficient balance and is enabled for online transactions.
Try a different card or UPI via Razorpay.
If still failing, message Karun — he can raise a manual invoice.

---

### KB-6: Team & Sites

**Q: How do I assign a Site Manager to a site?**
Go to Team → Assign to Site → select the person, site, and role → Save.
That person will now see that site when they log in.

**Q: What can a Site Manager do vs a Supervisor?**
Site Manager: can approve expenses, view all reports, manage inventory.
Supervisor: can add materials, log attendance, add expenses (pending approval).
Store Keeper: manages inventory only.

**Q: How do I create a new site?**
Go to Sites → tap + New Site → fill in name, location, status, budget → Save.

**Q: I've reached my site limit.**
You're on a plan that allows a limited number of sites.
Free: 1 site · Basic: 3 sites · Advanced: unlimited.
Go to Settings → Billing → Upgrade to add more sites.

**Q: How do I mark a site as completed?**
Go to Sites → tap the site → Edit → change Status to Completed → Save.
Completed sites are kept for records but don't count toward your active site limit.

---

### KB-7: Reports

**Q: Where do I find the Consumption report?**
Go to Reports → Consumption tab.
Shows all materials used across your sites with quantities and total value.
*Requires Basic plan or above.*

**Q: How do I see Budget vs Actual?**
Go to Reports → Budget vs Actual tab.
Shows how much you planned to spend vs what you actually spent per material.
*Requires Advanced plan.*

**Q: How do I export a report to Excel?**
Go to any report → tap Export XLS button.
Downloads a .xlsx file you can open in Excel or Google Sheets.
*Requires Advanced plan.*

**Q: The report shows no data.**
Check that:
1. The date range covers the period you want
2. The correct site is selected (or "All sites")
3. Materials have been allocated (Consumption) or receipts entered (Materials In)

---

### KB-8: Workers & Attendance

**Q: How do I add a worker?**
Go to Workers → tap + Add Worker → fill in name, role, phone → Save.

**Q: How do I mark attendance?**
Go to Workers → tap Mark Attendance → select date → mark each worker Present/Absent → Save.

**Q: I've reached my worker limit.**
Free: 10 workers · Basic: 50 workers · Advanced: unlimited.
Go to Settings → Billing → Upgrade to add more workers.

---

## Escalation Rules

### Escalate Immediately (do not try to resolve):

- "Cancel", "want refund"
- "Lost data", "all deleted", "everything gone"
- "Urgent", "emergency"
- "Not working for X days"
- "Client is asking" / "deadline tomorrow"
- "Charged twice" / "wrong amount deducted"
- Any message with a phone number (they want a call)
- 3+ unanswered messages in a row

### Karun's SLA

| Priority | Response time |
|---|---|
| 🔴 Data loss / payment issue | Within 1 hour |
| 🟡 Feature broken | Within 4 hours |
| 🟢 How-to question | Within 24 hours |

---

## Bot Personality Rules

✅ DO:
- Sound like a knowledgeable friend on WhatsApp
- Keep replies under 5 lines
- Use emojis for status (✅ ❌ 📦 💰)
- End with "Did that help?" on how-to replies
- Offer to connect to Karun proactively

❌ DON'T:
- "Your query has been logged and will be addressed..."
- "Please refer to our documentation..."
- "As per our terms and conditions..."
- Multi-paragraph essays
- Ask for more information before giving any answer

---

## Cost Summary

| Phase | Tool | Monthly Cost | Covers |
|---|---|---|---|
| Phase 1 | WATI / Interakt | ₹999–2,999 | Keyword bot, FAQ, escalation |
| Phase 2 | Twilio + Claude API | ₹1,500–3,000 | AI responses, account-aware |
| Phase 3 | Crisp free tier | ₹0 | In-app chat widget |
| **Total at 50 contractors** | | **~₹3,000–5,000/mo** | **Full support stack** |

A part-time support person costs ₹15,000/month.
The bot pays for itself at 5 paying contractors.

---

## 30-Day Setup Checklist

- [ ] Sign up for WATI / Interakt → connect WhatsApp Business number
- [ ] Build 8 keyword flows using Knowledge Base above
- [ ] Test every flow from a personal phone
- [ ] Set up Karun escalation number
- [ ] Add support WhatsApp number to storeyinfra.com footer
- [ ] Add support number to every payment confirmation email
- [ ] Add "Chat with us" button in app → Settings → Help
- [ ] (Week 3) Set up Twilio account for Phase 2
- [ ] (Week 4) Deploy `whatsapp-bot` Edge Function with Claude API
- [ ] (Week 4) Set all required secrets in Supabase Dashboard

---

## Revision History

| Date | Change |
|---|---|
| 2026-05-24 | Document created — v1 |

---

*This document lives at `docs/CUSTOMER-SUPPORT-BOT.md`*
*Update the Knowledge Base every time a new feature ships.*
*The bot is only as good as what you teach it.*
