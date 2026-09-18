# FieldDose — Open Questions for Medical Direction

**Purpose:** Every item below is an assumption currently rendered in the live app
(fielddose.com) that needs physician confirmation, or a decision that shapes how
dosing is displayed. Source of truth: SWFL Regional Common Treatment Guidelines,
2025 revision (GNFR 26-02). Each item has a **Decision:** line for the answer;
approved changes go through the app's dose-regression review process.

**Prepared:** Sept 10, 2026 · App version reviewed: `ad6ab5d`
**Returned:** Sept 18, 2026 · answers recorded below on each **Decision:** line.

### Status of this review

| | Items |
|---|---|
| **Answered — change needed** | 1.1, 1.3, 1.5, 2.3, 3.1, 5.1 |
| **Answered — confirmed as displayed** | 1.2, 1.4, 1.6, 2.1 |
| **Open — returned blank** | 2.2, 4, 6, 9.1 |
| **Deferred by the agency** | 7.1, 7.2, 7.3 ("let's talk about this later") |
| **Never asked** | 8.1, 8.2 — absent from the form that was sent |

**Not a signed approval.** The review block (Reviewed by / Title / Date /
Signature, and the Approved / Approved-with-revisions / Requires-additional-review
checkbox) came back **blank**. These answers are working direction, attributed in
1.1 to Dr. Dunavant, and are being implemented as such — they are not yet a
countersigned medical-direction approval of the app's dosing.

**Version drift.** The reviewed version `ad6ab5d` is 27 commits behind current
`main`. Dosing did move in that window — notably `66b8a95` (align dosing &
protocols with SWFL Revised 8/2026), `959b7d2` (route-dependent dosing),
`9718fa4` (Magnesium Sulfate split), `ec0a0fc` (Ipratropium added) and `be08007`
(given-tracking / cumulative max lockout). Anything re-submitted should be
re-stated against the current build, not `ad6ab5d`.

---

## 1 · Ketamine

The app now splits Ketamine into per-indication rows (Pain 0.2 mg/kg · Sedation
1 mg/kg IV/IO / 2 mg/kg IM/IN · Delirium 4 mg/kg IM max 500 mg) with volumes
computed from concentration.

**1.1 — IV/IO dilution workflow.** App displays: *"Draw X mL of 100 mg/mL +
X mL NS → push Y mL (50 mg/mL)"* — dose calculated first, drawn, then diluted
1:1. Is this the approved procedure for ALL IV/IO ketamine indications?
**Decision:** **ANSWERED — CHANGE.** Verbatim: *"Currently we carry 100mg/1ml - Dr.
Dunavant wants 0.1-0.2 mg/kg for both pain and sedation repeat prn no need to
dilute 1:1"*

Effect: the 1:1 NS dilution is **removed entirely** — ketamine is given undiluted
from the 100 mg/mL vial on every route. Pain and Sedation both become
**0.1–0.2 mg/kg, repeat PRN**. This supersedes the 1 mg/kg IV/IO / 2 mg/kg IM/IN
sedation dosing. See open item A (does the range apply to IM/IN?) and B (range
display) before implementing.

**1.2 — IM/IN concentration.** App assumes IM and IN are given **undiluted at
100 mg/mL**. Correct for both routes? Any per-naris volume limit for IN we
should display?
**Decision:** **ANSWERED — CONFIRMED.** *"Correct."* IM and IN are undiluted at
100 mg/mL. Per-naris volume limit: **No** — do not display one. (With 1.1
removing dilution, all routes are now undiluted 100 mg/mL.)

**1.3 — Small pediatric volumes.** For small children the computed draw gets
un-measurable (e.g., 6.5 kg Pink zone, pain: draw 0.01 mL). Does the protocol
intend a further pediatric dilution (e.g., to 10 mg/mL) for pain-dose ketamine?
If yes: recipe, and below what weight?
**Decision:** **ANSWERED — CHANGE.** *"No Ketamine for pediatric pain."* The
pediatric Ketamine — Pain row is withdrawn; no pediatric dilution recipe is
needed. Pediatric sedation was not addressed — see open item D.

**1.4 — ≤ 3 months contraindication cutoff.** App hard-stops ketamine
("CONTRAINDICATED ≤ 3 mo", no dose computed) for patients under **6 kg** — the
Broselow 3/4/5 kg zones, which the tape labels "< 3 months." Is weight < 6 kg
the right proxy, or should the cutoff behave differently for a custom-entered
weight/age?
**Decision:** **ANSWERED — CONFIRMED.** *"YES"* — < 6 kg is an acceptable proxy
for the ≤ 3 month contraindication. Current hard-stop behavior stands, no change.

**1.5 — Sedation maximum.** Sedation dosing is currently uncapped (a 100 kg
patient computes 200 mg IM). Should a max apply, as Delirium has (500 mg)?
**Decision:** **ANSWERED — CHANGE (same as 1.1).** Verbatim: *"Dose should be
0.1-0.2 mg/kg for both pain and sedation repeat prn We are not using that dose
per Medical direction."* The 1 mg/kg / 2 mg/kg sedation dosing is not in use, so
the uncapped-maximum concern is moot at the new dose. No separate sedation max
was specified.

**1.6 — Peds delirium.** App keeps pediatric hyperactive delirium as "contact
medical control" (no dose row). Confirm.
**Decision:** **ANSWERED — CONFIRMED.** *"Correct."* Pediatric hyperactive
delirium remains "contact medical control," no dose row. No change.

## 2 · Benzodiazepines

**2.1 — Lorazepam dilution.** App displays draw → dilute 1:1 NS → push for
**IV/IO**, and undiluted for **IM**. Confirm IO follows the IV (diluted) rule.
**Decision:** **ANSWERED — CONFIRMED, with a carry note.** *"Yes Currently not
carrying."* IO follows the IV (diluted 1:1) rule. GNFR does not currently stock
lorazepam — see open item E on whether to withdraw the row or keep it with the
confirmed rule.

**2.2 — Midazolam route-dose.** App: Seizure 5 mg IV/IO vs 10 mg IM/IN (adult),
0.2 mg/kg max 5 IV / max 10 IM-IN (peds), with the drug card swapping dose when
the route is toggled. Confirm mapping.
**Decision:** **OPEN — NOT ANSWERED.** Neither Approved nor Revise was marked and
the decision line came back blank. The adult 5 mg IV/IO vs 10 mg IM/IN and peds
0.2 mg/kg (max 5 IV / 10 IM-IN) route-swap mapping is **unconfirmed**. Current
behavior left in place pending an answer.

**2.3 — Midazolam — Anxiety row.** "Severe anxiety 2 mg" is displayed
route-agnostic (IV/IO/IM/IN) with no repeat guidance. Correct route set? Repeat
allowed?
**Decision:** **ANSWERED — CHANGE (inline).** Routes: *"Yes"* — all four
(IV/IO/IM/IN) are appropriate. Repeat dosing: *"PRN"* — permitted. No interval
and no cumulative maximum were specified, so the app will display "repeat PRN"
with no numeric interval or max.

## 3 · Droperidol

**3.1 —** Nausea 1.25 mg (0.5 mL) and Delirium 5 mg (2 mL) both show routes
IV/IO/IM with no max. Any route preference for delirium, repeat limit, or
cumulative max to display beyond the long-QT caution?
**Decision:** **ANSWERED — REMOVE.** *"Remove from app please."* Droperidol is
withdrawn entirely — both the Nausea (1.25 mg) and Hyperactive Delirium (5 mg)
drug rows, its entry in the drug index, and its references in the Nausea and
Hyperactive Delirium protocol cards.

## 4 · Computed volumes (arithmetic sign-off)

The app derives these from dose ÷ stocked concentration. Confirm each
concentration matches what GNFR stocks, and bless the display (examples at
70 kg adult / 20 kg child):

| Drug | Conc assumed | Adult 70 kg | Peds 20 kg |
|---|---|---|---|
| Fentanyl | 50 mcg/mL | 1.4 mL | 0.40 mL |
| Morphine | 4 mg/mL | 3.5 mL (0.2 mg/kg) | 0.50 mL (0.1 mg/kg) |
| Hydromorphone | 1 mg/mL | 1 mL (1 mg fixed) | 0.10 mL (5 mcg/kg) |
| Ketorolac | 30 mg/mL | 0.5 mL (15 mg) | 0.33 mL (0.5 mg/kg max 15) |
| Diazepam | 5 mg/mL | 1 mL (5 mg) | 0.80 mL (0.2 mg/kg max 5) |

**Decision:** **OPEN — NOT ANSWERED.** Neither the Concentrations nor the
Calculated-volume display checkbox was marked, and no corrections were given.
Fentanyl, Morphine, Hydromorphone, Ketorolac and Diazepam concentrations and the
derived volumes remain **unsigned-off**. Current values left in place pending an
answer.

## 5 · Promethazine

**5.1 —** App shows "IV — dilute, infuse slowly" with no numbers. Specify the
dilution recipe (dilute to what volume/with what, minimum infusion time, running
line required?) so it can get the same explicit draw → dilute → push display as
ketamine/lorazepam.
**Decision:** **ANSWERED — REMOVE.** *"Remove from App."* Promethazine is
withdrawn entirely — the drug row, its entry in the drug index, and its reference
in the Nausea protocol card. No dilution recipe needed.

## 6 · Hard-stop contraindications

Ketamine ≤ 3 months is the first contraindication the app *enforces* (refuses
to compute a dose). Candidates for the same treatment — which should hard-stop
vs display as a caution note?

- D50 in pediatrics (data already says "NEVER D50 in peds")
- Diltiazem in WPW / wide-complex
- Nitroglycerin with ED meds < 72 h (cannot be auto-detected — note only?)
- TXA beyond 3 h from injury
- Ketorolac > 75 y/o, GI bleed, renal failure

**Decision:** **OPEN — NOT ANSWERED.** The entire hard-stop vs caution table came
back blank (D50 peds, diltiazem WPW/wide-complex, nitroglycerin + ED meds < 72 h,
TXA > 3 h, ketorolac > 75 y/o / GI bleed / renal failure), and no additional
hard-stop conditions were named. Ketamine ≤ 3 months remains the only enforced
hard stop.

## 7 · Documentation & narcotics workflow

**7.1 — Treatment worksheet policy.** Charts save on-device only, newest 10
kept, auto-deleted after 7 days, labeled "not a patient care record," shareable
by the medic via their own mail/messaging. Bless retention window and framing.
**Decision:** **DEFERRED.** *"LET'S TALK ABOUT THIS LATER"* (applies to all of
section 7). Retention window, storage model and worksheet framing are unblessed.
Current behavior left in place.

**7.2 — Controlled-substance photo log.** Narcotic log entries accept photos
(vial, wasting) stored on-device and auto-deleted with the chart; waste entries
capture amount + witness initials. Confirm this worksheet posture is compatible
with the official CS log process, and the witness field wording.
**Decision:** **DEFERRED.** Covered by the same *"LET'S TALK ABOUT THIS LATER"* on
section 7. Photo-log posture and the "Witness Initials" wording are unconfirmed.

**7.3 — Med scanning (planned).** Barcode scan before administration
(narcotics-only scope) to verify drug/concentration and pre-fill lot/expiry.
Confirm scope and what the CS log expects from it.
**Decision:** **DEFERRED.** Covered by the same *"LET'S TALK ABOUT THIS LATER"* on
section 7. Barcode-scanning scope and required CS-log capture fields are
unconfirmed — do not build against an assumed scope.

## 8 · New in the 8/2026 revision

**8.1 — Hydrocortisone dosing.** Hydrocortisone was added to the 8/2026
pharmacology reference (adrenal insufficiency / Addisonian crisis) but the
reference carries no dose. The app currently displays "Dose/route TBD —
contact Medical Control." Provide adult and pediatric dosing and route so
the app can display real numbers.
**Decision:** **NOT ASKED — still open.** This item was **absent from the form that
went to medical direction**; the returned document has no section 8.1 and jumps
from Promethazine/hard-stops to the display-policy question. Hydrocortisone still
displays "Dose/route TBD — contact Medical Control." Must be re-submitted.

**8.2 — Cardioversion energy policy.** The 8/2026 regional guideline moved
synchronized cardioversion to rhythm-based settings (narrow regular 100 J;
narrow irregular / wide regular 200 J; wide irregular — defibrillate 200 J
unsynchronized). Per direction, GNFR devices continue to display the Zoll
recommended escalating ladder (70 → 120 → 150 J) via the GNFR agency pack,
while the regional baseline shows the new settings. Confirm this is the
intended standing policy for GNFR.
**Decision:** **NOT ASKED — still open.** Also **absent from the form that went to
medical direction.** The GNFR Zoll escalating ladder (70 → 120 → 150 J) vs the
8/2026 regional rhythm-based settings (100 J / 200 J / 200 J unsync) remains
unconfirmed as standing policy. Must be re-submitted.

## 9 · Display policy

**9.1 —** Computed volumes render as the headline number (pink chip). The app
disclaims "training & reference; confirm against protocols and medical control;
partner cross-check." Is this framing sufficient for agency deployment, or does
medical direction want additional wording anywhere dose math is displayed?
**Decision:** **OPEN — NOT ANSWERED.** Returned as section 8.1 "Computed Volume
Framing" with a blank decision line. The training-and-reference framing and
partner cross-check wording are **not blessed for agency deployment**. Current
wording left in place.
