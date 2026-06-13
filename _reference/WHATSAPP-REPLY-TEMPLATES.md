# WhatsApp reply templates — InfraTech booth scanner card

When a contractor scans the booth scanner card, their WhatsApp opens
with this pre-filled message addressed to Karun:

> *"Hi Karun, I met you at the InfraTech Summit. Please send me the Storey info pack."*

They tap Send. **You see their phone number + the message. Now reply.**

---

## Reply template A — the standard info pack (use this most of the time)

Copy-paste, replace `[Name]` if they introduced themselves, and attach the PDF.

```
Hi [Name] 👋

Great meeting you at InfraTech! Thanks for stopping by.

Here's the Storey info pack — what it does, who it's for, and how to
get started:

[ATTACH: storey-pitch-deck.pdf]

The short version:
• Free during launch beta
• Pay per SITE, not per user — whole team works on it
• Attendance, materials, daily logs, expenses, reports — one app
• Built for NE-India sites, works offline

📱 Install:
https://play.google.com/store/apps/details?id=com.storeyinfra.app

Or open storeyinfra.com on your phone.

Couple of quick questions (helps me show you what's relevant):
1. How many sites are you running right now?
2. How are you tracking worker attendance today?

Reply here any time — I'm on WhatsApp 7 days a week.

— Karun
+91 98640 66898
```

---

## Reply template B — short version (when you're at the booth, busy)

```
Hi [Name] — Karun here, met you at InfraTech.

Quick install: https://play.google.com/store/apps/details?id=com.storeyinfra.app

Free during beta. I'll send the full info pack tonight.

Few quick questions when you have a minute:
1. How many sites are you running?
2. How do you do worker attendance today?

— Karun
```

---

## Reply template C — they're clearly a serious prospect

```
Hi [Name] — Karun from Storey, met you at InfraTech.

Glad you scanned. I think Storey will fit your operation well.

How about a 15-minute call tomorrow or this week — I'll walk you
through the app on your phone, you can decide if it's worth a try
on one of your sites.

Tomorrow 11am, 3pm, or 5pm — which works?

Meanwhile, install link:
https://play.google.com/store/apps/details?id=com.storeyinfra.app

— Karun
+91 98640 66898
```

---

## What to do after each reply

**Don't let the contact go cold.** Within 24 hours of any scan:

1. **Save the contact in your phone** — name them whatever they said at
   the booth + "Infratech" so you can search later
   (e.g. `Avinash Infratech 2026-06-14`).
2. **Log them in `docs/FIELD-VISITS-LOG.md`** with:
   - Name + phone
   - Where they're from (city / site)
   - Their answers to the diagnostic questions
   - Next-step (call scheduled / install confirmed / pass)
3. **Send the diagnostic 3 questions** if they haven't answered yet:
   - How many sites are active right now?
   - How do you track worker attendance today?
   - Roughly how many hours/week on Excel or notebook?
4. **48-hour follow-up** if they go silent: one polite line, then move on
   (don't chase past that — per your existing rule).

---

## What document to send (the "info pack" PDF)

You already have it: `storey-pitch-deck.pdf` (12-slide deck from the
earlier session). If you want a smaller info pack:

- Page 1: Why Storey (the 4 reasons from the handbill)
- Page 2: 4 screenshots
- Page 3: Pricing (per-site, multi-user, free beta)
- Page 4: How to start + Karun's contact

If you don't have a single-page info pack yet, **send the existing
12-slide pitch deck as-is**. It's better than waiting.

---

## Booth-day operating discipline

- **Every scan = a lead.** Reply within 60 minutes (or have a helper reply
  with template B and you follow up that evening).
- **Don't only reply with text.** Send the PDF + voice note ("Hi [Name],
  this is Karun, great to meet you, sending the Storey info pack now")
  — voice notes feel personal and contractors trust them.
- **Don't be a pitch deck robot.** Two replies in, switch from template
  to actual conversation. The replies above are starters, not scripts.

---

## Tracking — how many scans you actually got

WhatsApp itself doesn't analytics-track scans. But you can count
**how many new chats opened today that came from `wa.me`** by glancing
at your WhatsApp chat list at the end of each day.

If you want hard analytics, you'd need a redirect URL (
`storeyinfra.com/wa → wa.me/919864066898?text=...`) and count visits
in Vercel. Not needed for the first event — count manually.
