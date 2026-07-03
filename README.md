# FieldDose

Field ACLS reference for EMS — weight-based drug dosing, treatment
protocols (By Protocol), and an electrical (defib / cardioversion /
pacing) reference. Built from the SWFL Regional Common Treatment
Guidelines (2025) for GNFR 26-02.

Mostly client-side: a single `public/index.html`. The one server piece is
`api/qref.js` — the Quick Reference document cloud sync (Vercel Blob).
(Extracted from the 2602 Misfits class dashboard; the dashboard links here
rather than embedding the tool.)

> **Training & reference only.** Always confirm against current local
> protocols and medical control, and perform a partner cross-check of
> drug, dose, and delivery method before administration.

## Run locally
```
npx serve public -l 5056
# open http://localhost:5056
```

## Deploy to fielddose.com (Vercel)
1. Push this repo to GitHub (e.g. `fielddose`).
2. https://vercel.com/new → Import the repo → Deploy (defaults are fine;
   `vercel.json` serves `public/index.html` at `/`).
3. Project → **Settings → Domains** → add `fielddose.com` and
   `www.fielddose.com`; add the DNS records Vercel shows you at your
   registrar. Propagation is usually 5–30 min.

## Updating
Edit `public/index.html` and push — Vercel auto-deploys on every push.

## Offline mode
A service worker (`public/sw.js`) caches the app shell and pre-caches every
uploaded reference card, so the tool works with no signal after one online
visit. It is installable to a phone home screen (web manifest, standalone
display). Content is network-first: devices pick up new deploys and new cards
automatically whenever they're online. When changing any precached asset
in place (e.g. swapping a logo), bump `CACHE` in `sw.js` so installed
clients re-fetch it.

## Quick Reference cloud sync (uploaded documents)
The left-drawer **References** (uploaded PDFs/images) sync across all devices via
a small serverless API (`api/qref.js`) backed by **Vercel Blob**. Viewing is
public; uploading / renaming / deleting requires a password.

One-time setup in Vercel → your **fielddose** project:
1. **Storage → Create → Blob** store, connect it to the project. This auto-adds
   the `BLOB_READ_WRITE_TOKEN` environment variable.
2. **Settings → Environment Variables** → add `QREF_ADMIN_PASSWORD` = the upload
   password you choose (Production + Preview).
3. Redeploy (any push triggers it). On first upload the app prompts for the
   password and caches it for the browser session.

Notes:
- Files route through the function, so individual uploads are capped at ~4.4 MB
  (Vercel payload limit). Compress larger PDFs/images first.
- Files live in Blob at `qref/files/…`; an ordered `qref/manifest.json` blob
  holds the card list (name, type, size, order, url).
