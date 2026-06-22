# FieldDose

Field ACLS reference for EMS — weight-based drug dosing, treatment
protocols (By Protocol), and an electrical (defib / cardioversion /
pacing) reference. Built from the SWFL Regional Common Treatment
Guidelines (2025) for GNFR 26-02.

Standalone, fully client-side: a single `public/index.html` with no
backend, database, or API. (Extracted from the 2602 Misfits class
dashboard; the dashboard links here rather than embedding the tool.)

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
