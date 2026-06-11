# MCA application — Storey Labs Private Limited
### Live status tracker · update each time CA gives an update

> Single source of truth on where the Pvt Ltd registration stands.
> Update the **Status** + **Last update** lines whenever there's
> movement. Don't lose track of the 15-day MCA query window — that's
> what burns ₹15k filing fees.

---

## Snapshot

| Field | Value |
|---|---|
| **Entity name (1st preference)** | Storey Labs Private Limited |
| **Entity name (2nd preference)** | Storey Infra Private Limited |
| **Directors** | Karun Roongta · [Father's full name — fill in] |
| **Cap table (proposed)** | Karun ~99% · Father ~1% |
| **Registered office** | [Address — fill in once filed copy received from CA] |
| **CA / filer** | [CA name + WhatsApp number — fill in] |
| **SRN (Service Request Number)** | [Fill in from CA's MCA portal acknowledgement] |
| **Filing date** | 2026-06-05 |
| **Filing form** | SPICe+ Part B (integrated — incorporation + DIN + PAN + TAN) |
| **Current status** | 🟡 Pending MCA review |
| **Last status update** | 2026-06-05 (filed) |
| **Expected COI date** | 2026-06-12 to 2026-06-20 (7-15 working days) |

---

## Timeline (update as events happen)

| Date | Event | Notes |
|---|---|---|
| 2026-06-05 | ✅ Filed via CA | SPICe+ submitted |
| | ⏳ Name reservation result | Within 1-3 days |
| | ⏳ DIN allotted (both directors) | If new DINs needed |
| | ⏳ MCA query raised? | If yes, **15-day response window starts** |
| | ⏳ COI (Certificate of Incorporation) issued | 7-15 days from filing |
| | ⏳ PAN issued | 24h after COI |
| | ⏳ TAN issued | 24h after COI |
| | ⏳ Current account opened (bank: ___) | After COI + PAN |
| | ⏳ Initial capital deposited (₹___ to current account) | Within 60 days of COI |
| | ⏳ GST registration triggered | If included in SPICe+ |
| | ⏳ EPF / ESI registered | If applicable |

---

## Things that can derail this

| Risk | Action if it happens |
|---|---|
| **MCA "Resubmission required" query** | Respond within **15 days** or filing fee lapses. Check CA email + MCA portal every 48 hours. |
| **Name rejected** | Auto-falls to Storey Infra Private Limited (2nd preference). If both rejected, brainstorm new 3rd name with CA same day. |
| **DSC expired mid-process** | Renew immediately (~2 days, ~₹2k). Don't wait for ROC to flag it. |
| **Utility bill rejected** | Resubmit a newer one (≤2 months old) via CA. |
| **Address NOC missing or wrong** | Re-sign with father's signature + Aadhaar copy. |

---

## Parallel work to do while waiting (do NOT just wait)

- [ ] Reserve `storeylabs.in` domain (once name approval lands)
- [ ] File trademark application for "Storey" wordmark — Class 9 + 42 via IP India (~₹9,000 for both classes)
- [ ] Pre-line a current account with bank of choice — ask their RM for the post-COI document checklist
- [ ] Razorpay / Cashfree merchant account application as "Storey Labs Pvt Ltd" with PAN once issued
- [ ] Draft initial paid-up capital deposit plan with CA (typically ₹1L = 10,000 shares × ₹10)
- [ ] Plan director remuneration structure (salary vs sitting fees vs dividends) — impacts TDS + personal tax slabs

---

## Downstream document updates (after name + COI land)

- [ ] `docs/PRIVACY-POLICY-DRAFT.md` — swap "Storey Infra" → "Storey Labs Private Limited" in operator name
- [ ] `docs/TERMS-OF-SERVICE-DRAFT.md` — same swap throughout
- [ ] `src/pages/Privacy.jsx` — same swap in §1 ("Who we are")
- [ ] `src/pages/Terms.jsx` — same swap in §2 ("About Storey")
- [ ] `docs/CLINICFLOW_SOW_DRAFT.md` (if exists) — same swap
- [ ] Lawyer brief — swap
- [ ] Footer of storeyinfra.com once published — swap
- [ ] Postal correspondence line in both Privacy + ToS — replace interim "until our registered office is published" language with the real address

---

## Once you have COI + PAN

The single most important post-COI action: **stop running everything through your personal accounts.** Specifically:

- Reroute Supabase + Vercel + Resend + Twilio billing → company current account / company card
- Reroute Play Console developer account → company name (Google allows org→individual conversion)
- Issue clinic invoice (₹30k pilot) to **Storey Labs Pvt Ltd** as payee, not personal
- Issue first contractor invoice to **Storey Labs Pvt Ltd**
- Save all incorporation documents (COI, PAN card, TAN, MOA, AOA, share certificates) in a "Founding Documents" folder — backed up to 2 locations
