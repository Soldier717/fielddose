# FieldDose — Open Questions for Medical Direction

**Purpose:** Every item below is an assumption currently rendered in the live app
(fielddose.com) that needs physician confirmation, or a decision that shapes how
dosing is displayed. Source of truth: SWFL Regional Common Treatment Guidelines,
2025 revision (GNFR 26-02). Each item has a **Decision:** line for the answer;
approved changes go through the app's dose-regression review process.

**Prepared:** Sept 10, 2026 · App version: `ad6ab5d`

---

## 1 · Ketamine

The app now splits Ketamine into per-indication rows (Pain 0.2 mg/kg · Sedation
1 mg/kg IV/IO / 2 mg/kg IM/IN · Delirium 4 mg/kg IM max 500 mg) with volumes
computed from concentration.

**1.1 — IV/IO dilution workflow.** App displays: *"Draw X mL of 100 mg/mL +
X mL NS → push Y mL (50 mg/mL)"* — dose calculated first, drawn, then diluted
1:1. Is this the approved procedure for ALL IV/IO ketamine indications?
**Decision:**

**1.2 — IM/IN concentration.** App assumes IM and IN are given **undiluted at
100 mg/mL**. Correct for both routes? Any per-naris volume limit for IN we
should display?
**Decision:**

**1.3 — Small pediatric volumes.** For small children the computed draw gets
un-measurable (e.g., 6.5 kg Pink zone, pain: draw 0.01 mL). Does the protocol
intend a further pediatric dilution (e.g., to 10 mg/mL) for pain-dose ketamine?
If yes: recipe, and below what weight?
**Decision:**

**1.4 — ≤ 3 months contraindication cutoff.** App hard-stops ketamine
("CONTRAINDICATED ≤ 3 mo", no dose computed) for patients under **6 kg** — the
Broselow 3/4/5 kg zones, which the tape labels "< 3 months." Is weight < 6 kg
the right proxy, or should the cutoff behave differently for a custom-entered
weight/age?
**Decision:**

**1.5 — Sedation maximum.** Sedation dosing is currently uncapped (a 100 kg
patient computes 200 mg IM). Should a max apply, as Delirium has (500 mg)?
**Decision:**

**1.6 — Peds delirium.** App keeps pediatric hyperactive delirium as "contact
medical control" (no dose row). Confirm.
**Decision:**

## 2 · Benzodiazepines

**2.1 — Lorazepam dilution.** App displays draw → dilute 1:1 NS → push for
**IV/IO**, and undiluted for **IM**. Confirm IO follows the IV (diluted) rule.
**Decision:**

**2.2 — Midazolam route-dose.** App: Seizure 5 mg IV/IO vs 10 mg IM/IN (adult),
0.2 mg/kg max 5 IV / max 10 IM-IN (peds), with the drug card swapping dose when
the route is toggled. Confirm mapping.
**Decision:**

**2.3 — Midazolam — Anxiety row.** "Severe anxiety 2 mg" is displayed
route-agnostic (IV/IO/IM/IN) with no repeat guidance. Correct route set? Repeat
allowed?
**Decision:**

## 3 · Droperidol

**3.1 —** Nausea 1.25 mg (0.5 mL) and Delirium 5 mg (2 mL) both show routes
IV/IO/IM with no max. Any route preference for delirium, repeat limit, or
cumulative max to display beyond the long-QT caution?
**Decision:**

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

**Decision:**

## 5 · Promethazine

**5.1 —** App shows "IV — dilute, infuse slowly" with no numbers. Specify the
dilution recipe (dilute to what volume/with what, minimum infusion time, running
line required?) so it can get the same explicit draw → dilute → push display as
ketamine/lorazepam.
**Decision:**

## 6 · Hard-stop contraindications

Ketamine ≤ 3 months is the first contraindication the app *enforces* (refuses
to compute a dose). Candidates for the same treatment — which should hard-stop
vs display as a caution note?

- D50 in pediatrics (data already says "NEVER D50 in peds")
- Diltiazem in WPW / wide-complex
- Nitroglycerin with ED meds < 72 h (cannot be auto-detected — note only?)
- TXA beyond 3 h from injury
- Ketorolac > 75 y/o, GI bleed, renal failure

**Decision:**

## 7 · Documentation & narcotics workflow

**7.1 — Treatment worksheet policy.** Charts save on-device only, newest 10
kept, auto-deleted after 7 days, labeled "not a patient care record," shareable
by the medic via their own mail/messaging. Bless retention window and framing.
**Decision:**

**7.2 — Controlled-substance photo log.** Narcotic log entries accept photos
(vial, wasting) stored on-device and auto-deleted with the chart; waste entries
capture amount + witness initials. Confirm this worksheet posture is compatible
with the official CS log process, and the witness field wording.
**Decision:**

**7.3 — Med scanning (planned).** Barcode scan before administration
(narcotics-only scope) to verify drug/concentration and pre-fill lot/expiry.
Confirm scope and what the CS log expects from it.
**Decision:**

## 8 · Display policy

**8.1 —** Computed volumes render as the headline number (pink chip). The app
disclaims "training & reference; confirm against protocols and medical control;
partner cross-check." Is this framing sufficient for agency deployment, or does
medical direction want additional wording anywhere dose math is displayed?
**Decision:**
