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

## Schema — supabase/migrations/001_narcotics.sql

Written Sep 17, 2026. Apply: dashboard → SQL Editor → New query → paste
the whole file → Run. Creates:

- `agencies` (code, transfer_mode seal/keys, timezone, retention_days
  floor — no auto-purge in phase one), seeded with GNFR2026 (keys mode)
- `memberships` (user ↔ agency, role medic/officer/admin, display name)
- `narc_items` (inventory: unit, drug, qty, lot, expiration, mg/unit;
  soft-delete only)
- `transfers` (daily sign-over: seal or keys mode, both signatures as
  data-URLs, items snapshot jsonb, attestation text) — **IMMUTABLE**:
  no update/delete policy exists for anyone
- `narc_events` (use/waste/restock/adjust, witness) — **IMMUTABLE**;
  corrections are new 'adjust' rows, never edits
- RLS on everything, scoped by `my_agency_ids()` (security-definer
  helper); roster managed by agency admins only

Verify after apply (no auth needed — RLS returns empty, 404 means the
table is missing): GET `rest/v1/agencies?select=id` with the publishable
key + `Accept-Profile: public` → expect `200 []`.

## App integration — DONE Sep 17, 2026

- supabase-js 2.116.0 vendored at public/vendor/supabase-js.js,
  SW-precached (no runtime CDN). Account module in index.html
  (fdSb/fdSbInit/fdSbSignIn — magic link, schema pinned to public).
- Daily-transfer screen: account strip (sign in / signed in / roster-
  pending states), fdNarcSync pushes unsynced transfers to the ledger
  on screen open + after completion; "☁ agency" badge on synced rows.
  Signed-out/offline behavior is byte-for-byte the old device-local flow.

## Activation (Sean, one time)

1. Dashboard → Auth → Providers: enable **Email**, magic links on.
   Auth → URL Configuration: Site URL `https://www.fielddose.com`,
   add it to the redirect allowlist.
2. On the deployed app: Narcotics screen → "Sign in — agency ledger"
   → enter email → tap the emailed link on the same device.
3. That first sign-in creates your auth.users row. Then SQL Editor:

   insert into public.memberships (user_id, agency_id, role, display_name)
   select u.id, a.id, 'admin', 'Sean — GNFR'
   from auth.users u, public.agencies a
   where u.email = 'sean@ppssfl.com' and a.code = 'GNFR2026';

   (Edit display_name to taste.) Reopen the narcotics screen — the
   strip goes green and the next transfer records to the ledger.
