# Plan — FieldDose Quick-Reference Library (left drawer)

> Status: **Plan only** — not yet built. Awaiting confirmation of the
> persistence approach (Option A below) before implementation.

## Goal
A left-side, hamburger-triggered **dashboard drawer** holding **quick-reference
cards** — you upload a PDF or image, give it a name, and tap to view it in the
field. **Zero changes** to the existing code calculator, its bottom tab bar, or
any working structure. Purely additive.

## The one real constraint → where files live
The app has **no backend**. No `/api` directory exists; `vercel.json` just
rewrites `/` → `public/index.html`, and the 7 `/api/...` calls in the HTML are
dead code from the old class dashboard (they would 404 in production). So
uploaded files have nowhere on a server to live — they must persist in the
browser, or we add a backend.

| Approach | Upload "easily" in-app? | Shared across devices/crew? | Backend? | Cost | Offline |
|---|---|---|---|---|---|
| **A. IndexedDB (device-local)** ✅ recommended | Yes | No — per phone/browser | None | $0 | Yes |
| B. Bundled in repo | No — needs git commit + deploy | Yes (everyone) | None | $0 | Yes |
| C. Vercel Blob + upload API + admin login | Yes | Yes | Yes (revive dormant auth) | small | No (needs network) |

**Recommendation: Option A.** It delivers the full upload-and-name experience
with no server, no deploy step, works offline (critical in the field), and stays
completely isolated from the calculator. IndexedDB (not localStorage) because
PDFs/images exceed localStorage's ~5 MB string cap; IndexedDB stores large
binary blobs natively.

**Tradeoff to accept:** the library is **per-device**. Cards added on one phone
won't appear on a partner's. A shared official set is a clean **Phase 2**
(bundle a curated manifest in the repo, or add Vercel Blob) — the Phase 1 data
model is designed so that bolts on without rework.

## UX / interaction
- **Hamburger button** — fixed, top-left, high z-index. Pure overlay; doesn't
  shift the calculator layout.
- **Slide-out drawer** from the left + dimmed backdrop. Tap backdrop or swipe to
  close.
- **Card list** inside the drawer: each card shows a name + type icon (image
  thumbnail when possible, PDF glyph otherwise). Optional category headers and a
  search box at top.
- **➕ Add reference**: file picker (`accept="image/*,application/pdf"`) → name
  field prefilled from filename → optional category → Save.
- **Tap a card** → viewer overlay: images inline; PDFs in an `<iframe>` with an
  "Open in new tab" fallback (mobile PDF embedding is finicky).
- **Per-card ⋯ menu**: Rename, Change category, Delete.
- **Export / Import** (backup): download the whole library as a file and
  re-import it — mitigates the eviction risk below.
- **Empty state**: "No references yet — add your first" prompt.

## Data model (IndexedDB DB `fielddose-qref`, store `cards`)
```
{ id, name, type:'image'|'pdf', mime, size, blob, thumb?, category?, order, createdAt }
```
Render via `URL.createObjectURL(blob)`; revoke on close to avoid leaks.

## Isolation strategy (how it can't break the calculator)
- All new CSS under a unique prefix **`qref-`** (existing code uses `fd-`,
  `cr-`, `rc-`, `ct-`, `cc-`, `nav-` — verified no collision).
- All new JS in its own self-contained `QRef` module (IIFE) with its own
  IndexedDB. It does **not** touch `render()`, `ctState`, `cr`, `currentPage`,
  or any `.nav-item` wiring.
- DOM is **appended to `<body>`** (button + drawer + viewer) and initialized on
  load. Nothing existing is modified or removed — the diff is purely insertions
  in three spots: a `<style>` block, a small HTML mount, and a `<script>`
  module.

## Build phases (when green-lit)
1. Drawer shell + hamburger + backdrop (CSS/HTML), open/close, isolated.
2. IndexedDB layer (open, add, list, rename, delete, reorder).
3. Add-reference flow (file picker, name, category, save) + thumbnails.
4. Card list rendering + search + empty state.
5. Viewer overlay (image + PDF) with new-tab fallback.
6. Export/Import backup.
7. Polish: clinical theme match (`--clin-blue/red`), responsive, touch targets.

## Risks & mitigations
- **iOS Safari may evict IndexedDB** under storage pressure → Export/Import
  backup (step 6) is the safety net; warn the user to back up.
- **Large PDFs** → warn over a threshold (e.g. 25 MB) and store anyway.
- **Device-local only** → explicitly Phase-2 territory if sharing is needed.
