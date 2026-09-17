# FieldDose — Supabase (narcotics backend)

Dedicated project for the narcotics chain-of-custody suite. The offline
dosing tool NEVER depends on this — auth gates narcotics/admin features
only.

## Connection (client-safe values)

- **Project URL:** `https://qxqrvaxewtodsfrwfdyh.supabase.co`
- **Publishable key:** `sb_publishable_E6VIgQxAVAjbOKD8GTEeww_9yHD4Frb`
  (safe to ship in the PWA — it's the public client key)
- **Never** put the `service_role` / secret key in this repo or the app.

Verified Sep 17, 2026: Auth ✓ (GoTrue v2.197.0) · Storage ✓ · Data API ✓
(public schema reachable). NOTE: exposed schemas list `graphql_public`
first, so unqualified REST requests default to the wrong schema — either
reorder so `public` is first (Settings → Data API → Exposed schemas), or
pin it client-side: `createClient(url, key, { db: { schema: 'public' } })`.
The legacy anon JWT also works and is recorded in the project's Vercel
env if ever needed; the publishable key above is the one the app uses.

## Dashboard checklist (Sean)

- [x] Enable Data API — done Sep 17 (was disabled at creation)
- [ ] Reorder exposed schemas so `public` is first (optional, recommended)
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
