# Agency Packs

Per-agency **usage overlays** over the SWFL regional baseline. A pack is a
static JSON file at `public/packs/<CODE>.json`; the join code IS the filename
(uppercase A–Z 0–9 - _). Medics enroll once on the entry screen ("Enter agency
code" — e.g. **`GNFR2026`**); the pack stores on-device, works fully offline, and
refreshes in the background whenever the device is online. **No pack = full
regional defaults** (every drug on the SWFL cards).

Publishing a pack update = edit the JSON, push, Vercel deploys — every online
enrolled device picks it up on next open (toast: "<Agency> protocols updated").

## What belongs where

| Layer | Lives in | Example |
|---|---|---|
| Printed SWFL doses / protocols | `public/index.html` baseline | Ketamine 0.2 mg/kg pain; Droperidol on delirium card |
| Agency does **not** carry / display a drug | Pack `clinical.omitDrugs` | GNFR omits Droperidol & Promethazine |
| Agency defib / contacts / narcotics SOP | Pack `defib`, `contacts`, `narcotics` | Zoll ladder, GNFR units |
| Static string dose tweak (rare) | Pack `drugOverrides` | Fixed-dose kit change |

GNFR-specific medical direction should **not** be hardcoded into the regional
baseline — put it in `GNFR2026.json` so other agencies still see the printed
guideline when unenrolled.

## Format

```json
{
  "agency":  { "id": "gnfr", "name": "Greater Naples Fire Rescue", "shortName": "GNFR" },
  "version": "2026-09-21",
  "clinical": {
    "omitDrugs": ["Droperidol", "Promethazine"],
    "usage": "Short note shown on entry + protocol screens"
  },
  "defib":   { "adultLadder": [120, 150, 200], "cardioversion": "zoll" },
  "drugOverrides": [
    { "name": "Ketorolac (Toradol)", "set": { "weightDose": "30 mg", "deliveryDose": "Push 1 mL IV/IO/IM" } }
  ],
  "contacts": [
    { "group": "Medical Direction", "name": "…", "sub": "role / code", "num": "239-555-0100" }
  ]
}
```

- `agency` (required): `name` on the entry screen; `shortName` in the header.
- `clinical.omitDrugs`: case-insensitive substring/regex list. Matching **drug
  rows** are hidden from the med list; matching **By Protocol** lines are
  hidden too. Use agency-local removals here (not regional deletions).
- `clinical.usage`: one-line usage note under the agency name and on protocol
  detail.
- `defib.adultLadder` / `defib.cardioversion`: energy policy overlays.
- `drugOverrides`: exact row `name`; `set` shallow-merges (static strings only —
  no per-kg math). Prefer baseline conditionals for weight-based changes.
- `contacts` / `narcotics`: as before.

## Cautions

- Packs are public URLs (guessable-code protection only). Don't put secrets in
  a pack; real access control arrives with accounts.
- Every pack change is protocol content: MD sign-off on the JSON diff, same as
  golden re-review for baseline dosing.
- `DEMO01` is a sample agency (different defib ladder) for demos — **`clinical.omitDrugs` is empty**, so it pulls normal regional guideline usage (Droperidol / Promethazine visible). Contrast with `GNFR2026`, which omits those drugs.
