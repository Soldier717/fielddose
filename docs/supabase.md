# FieldDose — Supabase (narcotics backend)

Dedicated project for the narcotics chain-of-custody suite. The offline
dosing tool NEVER depends on this — auth gates narcotics/admin features
only.

## Connection (client-safe values)

- **Project URL:** `https://qxqrvaxewtodsfrwfdyh.supabase.co`
- **Publishable key:** `sb_publishable_E6VIgQxAVAjbOKD8GTEeww_9yHD4Frb`
  (safe to ship in the PWA — it's the public client key)
- **Never** put the `service_role` / secret key in this repo or the app.

Verified Sep 17, 2026: Auth API healthy (GoTrue v2.197.0). Data API
returned 401 at that time — likely the "Data API" toggle in Project
Settings; must be enabled before schema work.

## Dashboard checklist (Sean)

- [ ] Enable Data API (Settings → Data API) — REST 401 as of Sep 17
- [ ] Confirm **Pro plan** (free tier pauses on inactivity — disqualifying
      for chain of custody; Pro adds daily backups)
- [ ] Auth → Providers: enable **Email** with **magic links** (no passwords)
- [ ] Auth → URL Configuration: Site URL `https://www.fielddose.com`,
      add it to redirect allowlist
- [ ] Later/optional: custom SMTP (Resend/Postmark on fielddose.com DNS)
      so magic links come from login@fielddose.com — skip for GNFR pilot

## Gates before schema/build starts

1. **Retention answer** — medical-review doc Q7.1 (how long custody
   records are kept) drives table + archival design.
2. **PHI line** — phase one is patient-free (drug, mg, lot, seal,
   signatures, timestamps = not PHI; Pro plan fine). Patient-tracking-
   by-user later would need a BAA = Supabase Team plan; separate decision.

## Planned build (when gates clear)

Schema: agencies, memberships (user ↔ agency + role), narc inventory
(lot/expiration), transfers (two signatures, seal/key modes), waste/usage
events. RLS: every table scoped to agency membership. Auth: email magic
link, session cached for station use. The "Agency Login" button on the
landing page becomes the real entry point.
