---
name: marketing
description: Use when the user asks for Storey / StoreyInfra marketing assets — WhatsApp ads, posters, social posts, pitch slides, landing-page copy, broadcast messages, ad creative, or any customer-facing content. Enforces brand identity (colours, type, voice) and ships portrait/landscape image + PPTX assets the same way every time. Invoke whenever the user says "make a WhatsApp ad / poster / banner / brochure / one-pager / pitch slide / social post / broadcast message" for Storey.
---

# Storey — Marketing skill

Storey is a site-operations SaaS for **construction contractors in Northeast
India**. Every marketing asset must sound like a contractor's tool, not a
SaaS brochure. Built for people who run sites in 38°C heat with patchy 4G —
not for people who pitch decks.

---

## Brand identity (non-negotiable)

| Token | Hex | Role |
|---|---|---|
| **Terracotta** | `#B85042` | Dominant — 60–70% of any canvas |
| **Sand / cream** | `#E7E8D1` | Supporting — cards, bands, breathing space |
| **Sage** | `#A7BEAE` | Accent — circles, dots, motifs |
| **White** | `#FFFFFF` | CTAs, key text on terracotta |
| **Dark cocoa** | `#2A1410` | Body text on light surfaces only |

Type pairing: **Georgia** for headlines (serif, has weight), **Calibri / Arial**
for body, **Impact / Arial Black** for the "STOREY" wordmark and feature labels
(use letter-spacing 3–14 to feel deliberate).

Visual motif (carry across every asset): **sage circles** for numbered bullets,
**sand cards on terracotta backgrounds**, **white pill for CTA**. Never accent
lines under titles — they read as AI-generated.

---

## Voice

- **Active, short, on-site.** "Run your sites. Not your phone." Not "Empower
  your construction operations with AI-driven workflows."
- **Lead with the contractor's pain** — labour attendance, material leakage,
  daily logs, delays.
- **One promise per asset.** Don't list 12 features. Pick 4.
- **No SaaS jargon.** Avoid: "platform", "ecosystem", "transform", "leverage",
  "empower", "AI-powered", "next-gen", "seamless", "synergy".
- **Hindi/Assamese-OK words allowed** sparingly when they read naturally
  ("hisaab", "site", "mistri", "supervisor"). Don't fake it.
- **Footer the founder, not the company.** People trust a name + WhatsApp
  number more than a generic logo. Karun · +91 98640 66898.

---

## Visual-first principle *(applies to both in-app UI and marketing assets)*

The Storey user has 5th–10th class education and **recognises rather than
reads**. Both marketing posters AND in-app screens must:

- Lead with **pictures, icons, colours, and big numbers** — not paragraphs
- Use **colour-coded status** (green=done, amber=in-progress, red=problem)
  consistently across every asset
- Use **short, plain English** for in-app UI. Do NOT default to Hindi /
  Hinglish — most NE-India contractors use English in Tally, banking apps,
  and GST forms, and find a Hindi-default app condescending. Hindi /
  Assamese will ship as a Settings toggle in a future release, opted into
  by the contractor for their team. Marketing assets may use selective
  Hindi/Assamese where it lands naturally for a *broadcast* audience
  (e.g. WhatsApp ad headline), but the app interior stays English-default.
- Use **photo thumbnails** of real work wherever possible
- Big bold numbers (40px+) for anything urgent or measurable
- Never a blank canvas — empty states illustrate the next action

Reference: `C:\consne\mockup-visual-first.jpg` (in-app), the WhatsApp ad
and feature poster (marketing). Same audience, same rules.

---

## Audience cues

- The buyer is a **general contractor or developer**, age 35–55, NE India,
  reads/types Hinglish, lives on WhatsApp, distrusts software.
- They've been burned by ERPs that took 6 months to set up and broke in
  Assamese on flaky 4G.
- They respond to: **photos**, **simple numbers**, **a name they recognise**,
  **a friend's referral**. They do not respond to: feature matrices, demo
  videos longer than 30s, English-only copy, anything that looks "American".

---

## Asset formats — sizes and where they go

| Asset | Size (px) | Aspect | Where | Format |
|---|---|---|---|---|
| **WhatsApp status / ad** | 1080 × 1920 | 9:16 portrait | WhatsApp Status, broadcast | JPG + PPTX |
| **WhatsApp post (square)** | 1080 × 1080 | 1:1 | Chats, groups | JPG |
| **WhatsApp landscape** | 1280 × 720 | 16:9 | Chats, link previews | JPG |
| **Instagram post** | 1080 × 1350 | 4:5 | IG feed | JPG |
| **Pitch slide** | 13.33" × 7.5" | 16:9 widescreen | Deck | PPTX |
| **A4 poster / flyer** | 2480 × 3508 (300dpi) | A4 portrait | Print, PDF | PNG + PDF |
| **Landing-page hero** | 1920 × 1080 | 16:9 | Website | JPG |

For PPTX, set `defineLayout` to the matching inches (9:16 portrait = 5.625 × 10).

---

## Generator pattern (use this, don't reinvent)

The repo already has a working pattern in `make-whatsapp-ad.cjs` that emits
**both PPTX (editable) and JPG (ready to send)** from one Node script.
Reuse it for any new asset:

1. **PPTX side** — `pptxgenjs` with the matching `defineLayout` and brand tokens.
2. **JPG side** — handcrafted SVG string → `sharp` → JPG. SVG gives you
   pixel-perfect control without LibreOffice / Chromium dependencies. Use the
   same colours, fonts and motif as the PPTX so they read as one design.
3. Output to `C:\consne\<asset>.pptx` and `C:\consne\<asset>.jpg` at the project
   root unless the user specifies otherwise.
4. **Always view the JPG with the Read tool after generating** — typos and
   overlap are invisible in code but obvious in the image.

Dependencies already installed: `pptxgenjs` (global), `sharp` (project
`node_modules`). Do not install Pillow / LibreOffice / Chromium — they are not
available on this machine.

---

## Headline patterns that work

- **Pain + product** — "Run your sites. Not your phone."
- **Contractor truth** — "Where did the cement go?" / "How many workers showed
  up today?"
- **Specific local pride** — "Built in Guwahati. For sites in Assam, Meghalaya,
  Nagaland."
- **Plain promise** — "Attendance, materials, daily logs — one app."

Avoid: questions that sound rhetorical-clever ("Is your site smart?"),
generic urgency ("Don't get left behind"), founder-y abstractions ("The
future of construction is here").

---

## What every asset must include

1. **The wordmark STOREY** (Impact, letter-spacing 8–14) somewhere prominent
2. **One hero promise** in Georgia 36pt+ (40–92pt depending on canvas)
3. **A CTA destination** — `storeyinfra.com` (always lowercase, no `https://`)
4. **Founder line** — Karun · +91 98640 66898 · WhatsApp us
5. **At least one visual element** beyond text — sage circles, a feature card,
   a product screenshot, or an icon. Never ship a text-only asset.

---

## QA checklist (run before declaring done)

- [ ] Brand colours match the table above to the hex
- [ ] Terracotta is **dominant**, not equal-weight with sand/sage
- [ ] No SaaS jargon, no banned words ("empower", "leverage", "synergy", etc.)
- [ ] The CTA reads first within 2 seconds of glance
- [ ] WhatsApp number `+91 98640 66898` correct, with spaces
- [ ] Domain spelled `storeyinfra.com` — not `storey.com`, not `storey.in`
- [ ] Image rendered, opened, and visually inspected (use Read tool on the JPG)
- [ ] Overlap / cropping / text-cut-off check — especially long Hindi words
- [ ] If the asset will go on Play Store, IG, or the website, confirm the
      size matches the table above

---

## What NOT to do

- **Don't add an "AI-powered" label.** Storey has AI on the *roadmap* (voice
  input first). Until shipped, calling it AI is AI-washing — and the buyer
  doesn't care.
- **Don't promise enterprise things** ("audit-ready", "SOC2", "uptime SLA").
  The buyer is a contractor, not a CIO.
- **Don't use stock photos of Western construction sites.** If you use imagery,
  it must look like an NE India site — bamboo scaffolding, lungi/gamosa,
  Assam-type roofs, not glass towers.
- **Don't show a screenshot of a feature that hasn't shipped.** If you screenshot
  the app, screenshot what's live in v1.1.1.
- **Don't put more than 4 feature bullets.** Cut.
- **Don't use generative AI images** in production marketing (they're tells).
  Photos > illustrations > AI art for this audience.
- **Don't accept emojis-in-copy unless the user explicitly asks.** Even on
  WhatsApp, plain copy reads more credibly to a 45-year-old contractor than
  one peppered with rockets and fire emojis.

---

## Reference assets shipped so far

- `storey-whatsapp-ad.pptx` / `.jpg` — 9:16 WhatsApp Status ad (2026-05-20)
- `make-whatsapp-ad.cjs` — generator script, copy-paste pattern for new portrait
  assets
- 8-slide pitch deck and Guwahati travel poster — earlier in the repo, ask
  before duplicating
