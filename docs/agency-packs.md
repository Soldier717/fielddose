# Agency Packs

Per-agency protocol overlays over the SWFL regional baseline. A pack is a
static JSON file at `public/packs/<CODE>.json`; the join code IS the filename
(uppercase A–Z 0–9 - _). Medics enroll once on the entry screen ("Enter agency
code"); the pack stores on-device, works fully offline, and refreshes in the
background whenever the device is online. No pack = regional defaults.

Publishing a pack update = edit the JSON, push, Vercel deploys — every online
enrolled device picks it up on next open (toast: "<Agency> protocols updated").

## Format

```json
{
  "agency":  { "id": "gnfr", "name": "Greater Naples Fire Rescue", "shortName": "GNFR" },
  "version": "2026-09-10",
  "defib":   { "adultLadder": [120, 150, 200] },
  "drugOverrides": [
    { "name": "Ketorolac (Toradol)", "set": { "weightDose": "30 mg", "deliveryDose": "Push 1 mL IV/IO/IM" } }
  ],
  "contacts": [
    { "group": "Medical Direction", "name": "…", "sub": "role / code", "num": "239-555-0100" }
  ]
}
```

- `agency` (required): `name` shown on the entry screen; `shortName` tags the header.
- `defib.adultLadder`: adult escalating biphasic sequence; last value repeats
  for subsequent shocks. Pediatric 2/4 J/kg is universal and not overridable.
- `drugOverrides`: matched by exact row `name`; `set` fields shallow-merge over
  the baseline entry (any drug field: weightDose, deliveryDose, packageSpec,
  detail, routeDoses…). Overrides are static strings — they cannot do per-kg
  math, so weight-based drugs should be overridden with care (or added to the
  baseline as a conditional instead).
- `contacts`: replaces the built-in contact seed for enrolled, unedited
  devices. Same shape as the in-app list.

## Cautions

- Packs are public URLs (guessable-code protection only). Don't put anything
  in a pack that can't be public; real access control arrives with accounts.
- Every pack change is protocol content: have the agency's medical director
  sign off the JSON diff, same standard as the baseline golden re-review.
- `DEMO01` is a sample agency (flat different ladder) kept for demos.
