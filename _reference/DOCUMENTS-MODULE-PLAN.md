# Documents Module — V1 + V2 Plan
### Scoped 2026-06-23. **V1 queued (after rod variance). V2 deferred to post-V1 validation.**

> Use this doc to keep the documents-module scope intact across sessions. V1 ships site-level only. V2 (subcontractor + material linking) is the differentiation moat — built once V1 validates demand.

---

## Sequencing decision (2026-06-23)

| # | Work | Status |
|---|------|--------|
| 1 | **Rod-tracking variance feature** (for John / Garchuk) | **NEXT — build first** |
| 2 | **Documents V1** — site-level upload/list/share | Queued after #1 |
| 3 | **Documents V2** — subcontractor + material-issue linking + dossier view | Deferred, scope saved below |
| Parallel | Interior designer + architect discovery conversations | Run alongside engineering |

Karun's rationale: John is the only paying-pilot data point in hand. Build for him first. Documents is for the designer segment we haven't closed yet — validate via conversations while John gets variance.

---

## V1 — Site-level documents (build after rod variance)

**Effort:** ~2.5 days
**Branch:** `feat/site-documents`

### Scope

| Piece | Detail |
|-------|--------|
| **Storage** | New Supabase bucket `site-documents`, private, signed URLs |
| **Tables** | `documents` (site_id, tenant_id, name, mime_type, size_bytes, category, uploaded_by, storage_path, uploaded_at, visible_roles jsonb), `tenant_document_categories` (tenant_id, name) for custom additions, `document_shares` (document_id, created_by, expires_at, revoked_at, signed_url_token) |
| **Upload** | Drag-drop on web, Capacitor file picker on mobile, 25 MB per file |
| **Categories** | Dropdown — Drawing · Contract · BOQ · Quote · Approval · Invoice · Sample · Plumbing · Electrical · Wiring · Lighting · Carpentry · Civil/Masonry · Painting · Tiling · HVAC · False Ceiling · Other · **+ Add custom** (per tenant) |
| **Access** | Default: all 4 roles can see. Contractor can restrict on upload or after via "Manage access" |
| **Share** | Per-document button → modal with copy-link / WhatsApp / duration (24h / 7d / 30d) / revoke. Signed URL, no Storey login needed. |
| **RLS** | Caller's `my_role()` must be in document's `visible_roles` |

### What's OUT of V1 (parking lot)

- Folder hierarchy (use category filtering)
- In-app PDF preview (phones open PDFs natively)
- Version history (overwrite replaces)
- Bulk ZIP download
- Email share
- Watermark

---

## V2 — Subcontractor + Material linkage + Dossier view

**Effort:** ~1.5 days on top of V1
**Trigger to build:** V1 used regularly AND a paying contractor or designer asks for subcontractor-attached docs

### Why this is the differentiation moat

Google Drive cannot link a document to a subcontractor or a material delivery, because Drive doesn't know what those are. Storey does. This unlocks the **subcontractor dossier view** — one screen showing everything about a subcontractor: scope drawing, BOQ, materials issued, daily labour, payments, snags, final invoice.

### Scope additions

| Piece | Detail |
|-------|--------|
| **`documents.subcontractor_id`** — nullable FK | Document can be tagged to a specific subcontractor |
| **`documents.material_issue_id`** — nullable FK | Document can be tagged to a specific material issue / delivery |
| **Upload UI changes** | Optional "Link to subcontractor" + "Link to material issue" dropdowns |
| **Subcontractor detail page** | New tab "Documents" + new section "Linked materials & payments" already exists |
| **Subcontractor dossier view** | New page aggregating: scope doc + BOQ + materials issued + labour log + payments + snags + invoices for one subcontractor on one site |
| **Material receipt page** | Show linked delivery challan / invoice if present |

### Demo line for designers / contractors

> *"Open the plumbing subcontractor on this site. You see his scope drawing, his agreed BOQ, the materials you issued him, his daily labour count, his payments, his snags, and his final invoice — all on one screen. Try doing that in Google Drive."*

---

## Parallel discovery (interior designers + architects)

While engineering builds, Karun runs discovery to validate the V2 hypothesis:

| Audience | Channel | Ask |
|----------|---------|-----|
| Interior designers (2–3 conversations) | WhatsApp / call | "How do you store project documents today? Drive? Dropbox? Do you tag them by trade or by subcontractor? Would attaching a document to a specific contractor in one app be useful?" |
| Architects (1–2 more after current SketchUp contact) | Same | "How do you share drawings with contractors? Once shared, do you know who opened them? Would per-trade access control matter?" |

If 3+ designers/architects say *"yes, attaching documents to specific subcontractors would be a game-changer"* — V2 is validated. Build.

If they say *"we just use a Drive folder and it's fine"* — V2 doesn't ship; site-level (V1) is enough.

---

## Status

- **V1:** queued. Builds after rod-variance feature ships.
- **V2:** scope locked. Builds only after V1 validates AND discovery confirms demand.
- **Discovery:** Karun's parallel track, no code required.
- **Owner:** Karun
- **Last reviewed:** 2026-06-23
