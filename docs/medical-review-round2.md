# FieldDose — Medical Direction Review, Round 2

**To:** Dr. Dunavant, Medical Director
**From:** Sean Russ, FieldDose / GNFR 26-02
**Date:** September 18, 2026
**App version under review:** `cd37cc1` (live at fielddose.com)
**Supersedes:** the Sept 10 sheet, version `ad6ab5d` — that version is 27 commits
old and dosing moved in between, so please answer against the numbers here.

Thank you for the answers returned today. They are implemented and live. This
sheet covers three things: **one urgent safety item created by those changes**,
the items that came back blank, and two items that were accidentally left off
the sheet you were sent.

Section A is the one that matters. If you read nothing else, read A1.

---

## A · URGENT — Ketamine preparation

Your direction was: *"Currently we carry 100mg/1ml — Dr. Dunavant wants
0.1–0.2 mg/kg for both pain and sedation repeat prn no need to dilute 1:1."*

That is now live. It created a problem we cannot solve without you.

### A1 — The draw volume is below a syringe graduation

At 0.1–0.2 mg/kg drawn undiluted from the 100 mg/mL vial:

| Patient | Dose at 0.1 mg/kg | Volume to draw | At 0.2 mg/kg |
|---|---|---|---|
| 100 kg adult | 10 mg | **0.100 mL** | 0.200 mL |
| 70 kg adult | 7 mg | **0.070 mL** | 0.140 mL |
| 50 kg adult | 5 mg | **0.050 mL** | 0.100 mL |
| 20 kg child | 2 mg | **0.020 mL** | 0.040 mL |
| 10.5 kg child | 1.05 mg | **0.011 mL** | 0.021 mL |
| 6.5 kg child | 0.65 mg | **0.007 mL** | 0.013 mL |

The finest graduation on a 1 mL syringe is **0.01 mL**. Every pediatric volume
is at or below one graduation, and a typical adult starting dose is 0.07 mL.
The app is currently instructing a draw that cannot be measured accurately.

Removing the 1:1 dilution is not what caused this on its own — a 1:1 only
doubled the volume. The issue is that a 10× lower dose from the same 100 mg/mL
vial leaves nothing measurable.

**Proposed fix — a working dilution:**

> Draw 1 mL of 100 mg/mL into a 10 mL syringe, add 9 mL NS → **10 mg/mL**.

That gives these volumes:

| Patient | 0.1 mg/kg | 0.2 mg/kg |
|---|---|---|
| 70 kg adult | 0.70 mL | 1.40 mL |
| 20 kg child | 0.20 mL | 0.40 mL |
| 6.5 kg child | 0.07 mL | 0.13 mL |

**Please choose one:**

- ☐ **Approve the 10 mg/mL dilution above** as written, all IV/IO ketamine
- ☐ **Approve a different preparation** — specify diluent, final concentration,
  and whether a running line is required: ________________________________
- ☐ **No dilution — give it undiluted** and accept the volumes in the first
  table as displayed
- ☐ **Other:** ____________________________________________________________

**Decision:**

### A2 — Confirm the pediatric sedation reduction was intended

Your answer addressed pain and sedation together. Applied to pediatrics, it
takes **procedural sedation from 1 mg/kg IV/IO to 0.1 mg/kg IV/IO — a 10×
reduction.** A 20 kg child now calculates 2 mg instead of 20 mg.

We implemented it as written. Please confirm this is intended for children and
not only for adults.

- ☐ Intended — pediatric IV/IO sedation is 0.1–0.2 mg/kg
- ☐ Not intended — pediatric IV/IO sedation remains ____________ mg/kg

**Decision:**

### A3 — Confirm the route scope (interpreted locally — needs your sign-off)

Your answer did not say whether 0.1–0.2 mg/kg applies to IM and IN as well as
IV/IO. **We interpreted it as IV/IO only** and left IM/IN unchanged, because
0.2 mg/kg IM is an analgesic dose rather than a sedation dose. Currently live:

| | IV/IO | IM/IN |
|---|---|---|
| **Pain** | 0.1 mg/kg (titratable to 0.2) | 0.2 mg/kg |
| **Sedation** | 0.1 mg/kg (titratable to 0.2) | **2 mg/kg** (unchanged) |

- ☐ Correct as displayed
- ☐ Revise — IM/IN should be: __________________________________________

**Decision:**

### A4 — Ketamine for hyperactive delirium (not mentioned in your answer)

Unchanged and still live: **4 mg/kg IM, max 500 mg, IM only.** Your answer
covered pain and sedation only. With droperidol now removed at your direction,
this is the **only** dissociation agent left on the delirium protocol.

- ☐ Confirmed, no change
- ☐ Revise: ___________________________________________________________

**Decision:**

---

## B · Coverage left after the removals you ordered

Droperidol and promethazine are removed, per *"remove from app please"* and
*"remove from App."* The consequence on two protocol cards:

- **Nausea & Vomiting** — was Ondansetron / Promethazine / Droperidol,
  now **Ondansetron only**
- **Hyperactive Delirium alternatives** — was Droperidol / Midazolam,
  now **Midazolam only** (with ketamine first-line, see A4)

Please confirm single-agent coverage is acceptable, or name a replacement.

- ☐ Acceptable as is
- ☐ Add: _____________________________________________________________

**Decision:**

---

## C · Returned blank on the Sept 10 sheet

These four came back with no answer. Current behavior is unchanged and
**unconfirmed** — it is displaying to crews without your sign-off.

### C1 — Midazolam route-dose mapping *(was 2.2)*

Currently displayed, dose swaps automatically when the medic selects a route:

| | IV/IO | IM/IN |
|---|---|---|
| **Adult seizure** | 5 mg | 10 mg |
| **Peds seizure** | 0.2 mg/kg, max 5 mg | 0.2 mg/kg, max 10 mg |

- ☐ Approved  ☐ Revise: ______________________________________________

**Decision:**

### C2 — Stocked concentrations and computed volumes *(was §4)*

The app divides ordered dose by stocked concentration to show a volume. If a
concentration below is wrong, every volume derived from it is wrong.

| Drug | Concentration assumed | 70 kg adult | 20 kg peds |
|---|---|---|---|
| Fentanyl | 50 mcg/mL | 1.4 mL | 0.40 mL |
| Morphine | 4 mg/mL | 3.5 mL (0.2 mg/kg) | 0.50 mL (0.1 mg/kg) |
| Hydromorphone | 1 mg/mL | 1 mL (1 mg fixed) | 0.10 mL (5 mcg/kg) |
| Ketorolac | 30 mg/mL | 0.5 mL (15 mg) | 0.33 mL (0.5 mg/kg, max 15) |
| Diazepam | 5 mg/mL | 1 mL (5 mg) | 0.80 mL (0.2 mg/kg, max 5) |

- ☐ All concentrations correct  ☐ Corrections: ________________________

**Decision:**

### C3 — Hard stop vs caution *(was §6)*

Ketamine ≤ 3 months is the only contraindication the app **enforces** — it
refuses to compute a dose. Everything else displays as a warning but still
shows numbers. Please mark each:

| Condition | Hard stop (no dose shown) | Caution only |
|---|---|---|
| D50 in pediatrics | ☐ | ☐ |
| Diltiazem — WPW / wide-complex | ☐ | ☐ |
| Nitroglycerin — ED meds < 72 h | ☐ | ☐ |
| TXA — > 3 h from injury | ☐ | ☐ |
| Ketorolac — age > 75 | ☐ | ☐ |
| Ketorolac — active GI bleed | ☐ | ☐ |
| Ketorolac — renal failure | ☐ | ☐ |

Anything else that should hard stop: ____________________________________

**Decision:**

### C4 — Is the disclaimer wording sufficient? *(was 9.1)*

Computed volumes display as the headline number. The app states it is a
training and reference tool, requires confirmation against current protocols
and medical control, and calls for a partner cross-check of drug, dose, and
route.

- ☐ Sufficient for agency deployment
- ☐ Additional wording required: ______________________________________

**Decision:**

---

## D · Never asked — omitted from the sheet you received

These two were on our list but did not make it onto the form sent September 10.
Apologies — they have never been in front of you.

### D1 — Hydrocortisone dosing

Added to the 8/2026 pharmacology reference for adrenal insufficiency /
Addisonian crisis, but the reference carries **no dose**. The app currently
displays *"Dose/route TBD — contact Medical Control."*

- Adult dose and route: ______________________________________________
- Pediatric dose and route: __________________________________________

**Decision:**

### D2 — Cardioversion energy policy

The 8/2026 regional guideline moved synchronized cardioversion to rhythm-based
settings:

- Narrow regular — 100 J
- Narrow irregular / wide regular — 200 J
- Wide irregular — defibrillate 200 J unsynchronized

GNFR devices are Zoll, and the app currently shows the Zoll escalating ladder
(**70 → 120 → 150 J**) through the GNFR agency pack, while the regional
baseline shows the new settings above.

- ☐ Confirmed — GNFR continues on the Zoll ladder as standing policy
- ☐ Revise — GNFR should use: ________________________________________

**Decision:**

---

## E · Deferred, for awareness only — no answer needed today

Section 7 of the last sheet (treatment worksheet retention, controlled-substance
photo log, barcode scanning scope) was deferred by the agency — *"let's talk
about this later."* No action requested here. One note: the narcotic transfer
screen currently auto-fills a placeholder lot date and a three-year expiry for
seeded stock, which is a stand-in until the barcode-scan question in that
section is settled.

---

## Sign-off

The September 10 sheet came back with the review block blank, so those answers
are recorded in our documentation as **working direction, not a countersigned
approval**. Please complete this block so the dosing changes now live have a
signed record behind them.

Reviewed by: _______________________________________________

Title: _____________________________________________________

Date: ______________________________________________________

App version reviewed: `cd37cc1`

- ☐ Approved as displayed
- ☐ Approved with the revisions noted above
- ☐ Requires additional review

Signature: _________________________________________________
