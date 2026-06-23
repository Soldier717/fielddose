# Plan — FieldDose Left Dashboard (Tools + Reference cards)

> Status: **Plan only** — not yet built. Reflects decisions made 2026-06-23.

## Goal
A left-side, hamburger-triggered **dashboard drawer** listing named **cards** of
two kinds:

1. **Tool cards** — built-in interactive widgets I code into the app (first one:
   **MAP Calculator**). Fixed order, shipped to every device, version-controlled.
2. **Reference / document cards** — **PDFs or images you upload and name**
   (e.g. Adult Trauma Criteria, Ped Trauma Criteria, Cardiac Arrest Algorithm).
   Device-local, and you can rename / reorder / delete them.

**Zero changes** to the existing code calculator, its bottom tab bar, or any
working structure. Purely additive and isolated.

## Decisions (locked)
- Reference content (trauma criteria, algorithm) = **uploaded images/PDFs**, not
  hand-coded native content.
- First build cards: **MAP Calculator** (coded) + upload slots the user fills
  with Adult Trauma Criteria, Ped Trauma Criteria, Cardiac Arrest Algorithm
  (and others — "Other" noted, extensible).
- Curation: **built-in tools fixed; uploaded cards curatable** (rename, reorder,
  delete).

## Drawer layout
```
┌─ FieldDose ──────────┐
│  TOOLS               │   built-in, fixed
│   ▸ MAP Calculator   │
│                      │
│  REFERENCES      [+] │   your uploads, curatable
│   ▸ Adult Trauma     │
│   ▸ Ped Trauma       │
│   ▸ Cardiac Arrest   │
│   …                  │
└──────────────────────┘
```
- **Hamburger button** — fixed, top-left, high z-index. Pure overlay; never
  shifts the calculator layout.
- **Slide-out drawer** + dimmed backdrop. Tap backdrop / swipe to close.
- **TOOLS** section: static list from a code registry.
- **REFERENCES** section: dynamic list from IndexedDB, with **➕ Add** and a
  search box. Per-card ⋯ menu: Rename, Reorder, Delete.
- **Empty state** for references: "No references yet — add your first."

## Card types & data

### Tool cards (built-in, in code)
A small registry array, e.g.:
```
TOOL_CARDS = [ { id:'map', name:'MAP Calculator', render: renderMapTool } ]
```
Fixed order, not user-editable. Adding a tool later = one registry entry + a
render fn. Opens in the same viewer overlay used for documents.

**MAP Calculator (first tool):**
- Inputs: Systolic (SBP) and Diastolic (DBP), numeric.
- `MAP = (SBP + 2 × DBP) / 3`, rounded to whole mmHg.
- Shows the MAP value + a reference note (common perfusion target MAP ≥ 65 mmHg)
  with the training-only disclaimer. No data stored.

### Document cards (uploaded, device-local)
IndexedDB DB `fielddose-qref`, store `cards`:
```
{ id, name, type:'image'|'pdf', mime, size, blob, thumb?, order, createdAt }
```
- IndexedDB (not localStorage) — PDFs/images exceed localStorage's ~5 MB cap.
- Add flow: file picker (`accept="image/*,application/pdf"`) → name field
  prefilled from filename → Save.
- View: tap → viewer overlay; images inline, PDFs in `<iframe>` with an "Open in
  new tab" fallback (mobile PDF embedding is finicky).
- Render via `URL.createObjectURL(blob)`; revoke on close.

## Why this persistence split
The app has **no backend** (no `/api` dir; `vercel.json` only rewrites `/` →
`public/index.html`; the `/api/...` calls in the HTML are dead dashboard code).
So:
- **Built-in tools** live in the app code → shared to everyone, version-
  controlled, offline.
- **Uploaded documents** live in the browser (IndexedDB) → per-device, offline,
  no server needed.

Future Phase 2 if shared uploads are ever needed: a curated manifest bundled in
the repo, or Vercel Blob + the dormant admin auth. The data model bolts onto
that without rework.

## Isolation strategy (can't break the calculator)
- New CSS under a unique prefix **`qref-`** (existing code uses `fd-`, `cr-`,
  `rc-`, `ct-`, `cc-`, `nav-` — verified no collision).
- New JS in a self-contained `QRef` module (IIFE) with its own IndexedDB. Does
  **not** touch `render()`, `ctState`, `cr`, `currentPage`, or `.nav-item`.
- DOM appended to `<body>` (button + drawer + viewer), initialized on load.
  Diff = pure insertions in three spots: a `<style>` block, a small HTML mount,
  a `<script>` module.

## Build phases (when green-lit)
1. Drawer shell + hamburger + backdrop + open/close, isolated.
2. Tool registry + viewer overlay; build **MAP Calculator** card.
3. IndexedDB layer (open, add, list, rename, delete, reorder).
4. References section: add flow, list, search, thumbnails, empty state.
5. Document viewer (image inline + PDF iframe with new-tab fallback).
6. Export / Import backup (mitigates IndexedDB eviction).
7. Polish: clinical theme (`--clin-blue/red`), responsive, touch targets.

## Risks & mitigations
- **iOS Safari may evict IndexedDB** under storage pressure → Export/Import
  backup (step 6); warn user to back up important uploads.
- **Large PDFs** → warn over a threshold (e.g. 25 MB), store anyway.
- **Uploaded cards are device-local** → Phase-2 territory if crew-sharing needed.
