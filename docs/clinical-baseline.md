# FieldDose — Clinical Baseline

**Source of truth:** SWFL Regional Common Treatment Guidelines, Revised 8/2026
(GNFR 26-02). Everything clinical in the app starts here.

## Layers (in order)

1. **Regional baseline** — doses, routes, protocols from SWFL (full printed card).
2. **Agency pack** (`GNFR2026`, etc.) — **usage** overlays: omit drugs not carried,
   defib/contacts/narcotics, rare static `drugOverrides`. Enroll via agency code.
3. **No pack** — pure regional defaults for any department on the common guidelines.

GNFR medical-direction choices (e.g. droperidol/promethazine not carried) live in
`public/packs/GNFR2026.json` → `clinical.omitDrugs`, **not** by deleting rows from
the regional baseline.

## What is already regional

Aligned in commit `66b8a95` and follow-ups (`9718fa4` Mag split, `ec0a0fc`
Ipratropium, `959b7d2` route-dependent dosing, cardioversion rhythm ladder):

- Arrest / non-arrest pharmacology tables in `public/index.html` (`ccGetDrugsBase`)
- Protocol cards (By Protocol)
- Adult defib default ladder + 8/2026 cardioversion energy policy
- Tools that cite SWFL (qSOFA / sepsis screen)

Regression guard: `tests/dose-regression.test.cjs` + `tests/golden.json`.
Any regional content change must update the golden file and be re-reviewed.

## Known MD / agency usage (via pack, not baseline deletes)

| Usage | Where | Status |
|---|---|---|
| Drop droperidol & promethazine | `GNFR2026` `clinical.omitDrugs` | Live when enrolled with code **GNFR2026** |
| Midazolam anxiety — all routes, repeat PRN | Regional + Round 1 §2.3 | Live in baseline |
| Zoll cardioversion ladder | `GNFR2026` `defib.cardioversion` | Live on enroll |

Regional baseline still lists Droperidol / Promethazine for agencies that carry them.

### Ketamine — regional (adult + pediatric)

| Indication | Adult | Pediatric |
|---|---|---|
| Pain & Anxiety | **0.2 mg/kg** IV/IO/IM/IN every 20 min | **0.2 mg/kg** IV/IO/IM/IN every 20 min |
| Procedural Sedation | **1 mg/kg** IV/IO every 10 min PRN, **or 2 mg/kg** IM/IN | **1 mg/kg** IV/IO every 10 min PRN, **or 2 mg/kg** IM/IN |

≤ 3 months / &lt; 6 kg hard-stop unchanged (Round 1 §1.4). Small undiluted pain
draws (especially peds) still trigger the measurable-volume warning until A1
dilution is decided.

## Open — cannot invent from the guideline alone

Still need MD / agency answers (see Round 2). Until answered, **do not invent
doses** — keep current display, warn where engineering can help, and leave TBD
rows as contact-medical-control:

- A1 Ketamine measurable preparation (10 mg/mL dilution proposed) — still relevant for small **pain** draws; adult/peds **sedation** IV volumes are now measurable at 1 mg/kg undiluted
- A2 Pediatric sedation 10× reduction — **resolved: regional 1 mg/kg IV/IO restored**
- A3 IM/IN ketamine scope — **resolved** (pain 0.2 all routes; sedation 2 mg/kg IM/IN adult+peds)
- Adult ketamine 0.1–0.2 MD delta — **resolved: regional 0.2 pain / 1 mg/kg sedation IV**
- A4 Delirium ketamine confirmation — **resolved SWFL 2026:** Dissociation 4 mg/kg IM max 500; Emergence 1 mg/kg IV/IO max 500; peds contact medical control. Droperidol remains on regional card; **GNFR omits via pack**.
- B Coverage after droperidol/promethazine removal — **GNFR:** handled by pack omit (Ondansetron-only / Midazolam alternate). Other agencies still see full regional choose-one lists.
- C1 Midazolam route-dose map — **confirmed SWFL:** adult 5 mg IV/IO / 10 mg IM/IN; peds 0.2 mg/kg (max 5 IV/IO / 10 IM/IN); may repeat every 5 min PRN
- C2 Stocked concentrations
- C3 Hard-stop vs caution list
- C4 Disclaimer blessing
- D1 Hydrocortisone dose (guideline lists drug, no dose)
- D2 Cardioversion agency vs regional energy policy

## Engineering rules for clinical work

1. **Guideline first.** Prefer SWFL wording and numbers; MD deltas are explicit.
2. **No silent dose changes.** Every dosing edit updates golden + a short note
   in the PR describing guideline cite or MD sheet item.
3. **Warn, don’t invent.** Unmeasurable draws, TBD doses, and unconfirmed maps
   get caution UI — not guessed recipes — until MD answers.
4. **Packs are usage overlays.** Regional baseline stays complete; agency omits /
   defib / contacts / narcotics live in the pack (`docs/agency-packs.md`).
   `drugOverrides` are static strings only (no per-kg math).
5. **Version the claim.** Footer / meta should name the guideline revision the
   build claims to follow (currently Revised 8/2026).
