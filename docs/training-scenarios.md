# Training scenario library — September 30, 2026

The library contains 70 authored fictional cases: 10 in each of seven categories,
with 38 adult and 32 pediatric patients. The existing eight medication exercises
are preserved; 62 additions practice a focused source-linked protocol decision.
These are case-based exercises, not full treatment algorithms or a physiology model.

Users can choose a category and adult/pediatric population. A randomized bag
avoids repeats until the selected pool is exhausted and avoids an immediate
repeat at the next round. Changing a filter starts a new pool. Browser storage
preserves rotation, with blocked/corrupt-storage fallback.

Medication exercises retain allergy checks, six rights, partner cross-check,
dose/unit/route matching, and post-medication reassessment. Decision exercises
require the case's assessment findings and baseline measurements for the
learning checkpoint, check the selected answer against its source fact, and
require reassessment and a supported response note before handoff. These
training gates do not require delaying immediate care in practice.

A correct decision does not administer medication, start CPR, deliver a shock,
or change patient physiology. Decision-case reassessment remains explicitly
unchanged; vitals and observations are scripted. The compressed action clock
does not predict response or medication onset. Cases do not determine refusal
or release. Clinical-review-pending notices and PDF links remain visible.

Source question banks, medication setup drills, and the bundled SWFL Revised
8/2026 PDF are unchanged. Added cases link to existing source facts; no runtime
clinical text generation is used. Adult dosing questions are used for adult
cases; pediatric cases use pediatric rows or relevant assessment/safety facts.

| ID | Category | Population | Focus | Exercise | Source PDF pages |
|---|---|---|---|---|---|
| dust | Airway / Respiratory | adult (34 y) | A breath at a time. | medication | 60, 100, 222, 97 |
| exercise | Airway / Respiratory | adult (45 y) | Trouble at the park. | medication | 60, 100, 222, 97 |
| garden | Airway / Respiratory | adult (58 y) | A difficult afternoon. | medication | 60, 100, 222, 97 |
| workshop | Airway / Respiratory | adult (39 y) | Wheeze that persists. | medication | 60, 100, 222, 97 |
| overnight | Airway / Respiratory | adult (52 y) | Watch the response. | medication | 60, 100, 222, 97 |
| chest-pressure | Cardiac | adult (62 y) | Pressure in the aisle. | medication | 69, 102, 97 |
| missed-meal | AMS | adult (47 y) | A missed meal. | medication | 56, 137, 97 |
| nausea-home | Medical | adult (36 y) | An unsettled morning. | medication | 49, 136, 97 |
| peds-wheeze | Airway / Respiratory | pediatric (8 y) | Pediatric nebulized bronchodilator | decision | 60, 97 |
| croup-rebound | Airway / Respiratory | pediatric (3 y) | Croup reassessment | decision | 139, 97 |
| peds-steroid | Airway / Respiratory | pediatric (12 y) | Pediatric steroid limit | decision | 60, 97 |
| resp-mag-caution | Airway / Respiratory | adult (54 y) | Refractory wheeze with hypoperfusion | decision | 129, 97 |
| neb-no-mist | Airway / Respiratory | pediatric (6 y) | Nebulizer delivery check | decision | 222, 97 |
| svt-stable | Cardiac | adult (32 y) | Stable adult SVT | decision | 67, 97 |
| vt-infusion | Cardiac | adult (67 y) | Stable VT preparation | decision | 67, 97 |
| brady-first-dose | Cardiac | adult (74 y) | Symptomatic adult bradycardia | decision | 68, 97 |
| brady-no-response | Cardiac | adult (69 y) | Ineffective atropine reassessment | decision | 68, 97 |
| pulmonary-edema | Cardiac | adult (61 y) | Pulmonary edema support | decision | 70, 97 |
| peds-rosc-ecg | Cardiac | pediatric (15 y) | Pediatric post-arrest handoff | decision | 76, 97 |
| peds-arrest-naloxone | Cardiac | pediatric (16 y) | Pediatric arrest priorities | decision | 72, 97 |
| chest-pain-serial-ecg | Cardiac | adult (43 y) | Serial ECG reassessment | decision | 69, 97 |
| peds-diltiazem-caution | Cardiac | pediatric (17 y) | Wide-complex medication safety | decision | 110, 97 |
| seizure-iv | Neuro | adult (40 y) | Adult seizure with IV access | decision | 61, 97 |
| seizure-no-iv | Neuro | adult (29 y) | Adult seizure without IV access | decision | 61, 97 |
| seizure-repeat | Neuro | adult (55 y) | Seizure medication timing | decision | 61, 97 |
| adult-refractory-seizure | Neuro | adult (46 y) | Refractory adult seizure | decision | 61, 97 |
| peds-refractory-seizure | Neuro | pediatric (7 y) | Pediatric seizure escalation | decision | 61, 97 |
| peds-stroke-mimic | Neuro | pediatric (14 y) | Low-glucose neurologic presentation | decision | 62, 97 |
| adult-stroke-checklist | Neuro | adult (71 y) | Adult stroke assessment | decision | 62, 97 |
| peds-benzodiazepine-monitor | Neuro | pediatric (11 y) | Pediatric post-seizure respiratory monitoring | decision | 109, 97 |
| peds-keppra-route | Neuro | pediatric (9 y) | Authorized pediatric anticonvulsant setup | decision | 126, 97 |
| peds-sedation-reassessment | Neuro | pediatric (13 y) | Pediatric sedation reassessment | decision | 48, 97 |
| ams-diabetes-threshold | AMS | adult (63 y) | Adult hypoglycemia recognition | decision | 56, 97 |
| peds-recurrent-hypoglycemia | AMS | pediatric (4 y) | Recurrent pediatric hypoglycemia | decision | 56, 97 |
| ams-dextrose-concentration | AMS | adult (52 y) | Adult IV glucose preparation | decision | 56, 97 |
| peds-glucose-endpoint | AMS | pediatric (10 y) | Pediatric glucose-treatment endpoint | decision | 56, 97 |
| peds-unsafe-swallow | AMS | pediatric (5 y) | Pediatric oral-route safety | decision | 137, 97 |
| ams-opioid-breathing | AMS | adult (38 y) | AMS with respiratory depression | decision | 133, 97 |
| peds-heat-ams | AMS | pediatric (15 y) | Pediatric environmental heat illness | decision | 51, 97 |
| adult-cold-ams | AMS | adult (76 y) | Cold exposure with AMS | decision | 51, 97 |
| peds-sepsis-screen | AMS | pediatric (6 y) | Pediatric sepsis recognition | decision | 64, 97 |
| adult-opioid-goal | Toxicology / Pharmacology | adult (31 y) | Opioid reversal goal | decision | 65, 97 |
| adult-cholinergic | Toxicology / Pharmacology | adult (44 y) | Cholinergic exposure | decision | 65, 97 |
| adult-tca-wide-qrs | Toxicology / Pharmacology | adult (27 y) | TCA overdose criteria | decision | 65, 97 |
| adult-dystonia | Toxicology / Pharmacology | adult (35 y) | Medication-associated dystonia | decision | 65, 97 |
| peds-opioid-recurrence | Toxicology / Pharmacology | pediatric (14 y) | Pediatric opioid recurrence | decision | 133, 97 |
| peds-benzodiazepine-opioid | Toxicology / Pharmacology | pediatric (16 y) | Mixed depressant exposure | decision | 131, 97 |
| peds-apap-alcohol | Toxicology / Pharmacology | pediatric (17 y) | Acetaminophen co-ingestion risk | decision | 98, 97 |
| peds-local-anesthetic | Toxicology / Pharmacology | pediatric (12 y) | Local-anesthetic toxicity recognition | decision | 127, 97 |
| adult-naloxone-withdrawal | Toxicology / Pharmacology | adult (42 y) | Post-reversal adverse effects | decision | 133, 97 |
| peds-epinephrine-confusion | Toxicology / Pharmacology | pediatric (11 y) | Pediatric formulation safety | decision | 113, 97 |
| adult-hemorrhage-txa | Trauma | adult (39 y) | Adult hemorrhage medication check | decision | 79, 97 |
| peds-open-fracture | Trauma | pediatric (9 y) | Pediatric open-fracture prophylaxis | decision | 79, 97 |
| adult-open-fracture | Trauma | adult (48 y) | Adult open-fracture preparation | decision | 79, 97 |
| peds-trauma-warming | Trauma | pediatric (7 y) | Pediatric trauma thermal preservation | decision | 79, 97 |
| adult-before-moving | Trauma | adult (57 y) | Stabilization before movement | decision | 79, 97 |
| peds-burn-jewelry | Trauma | pediatric (13 y) | Pediatric burn constriction risk | decision | 82, 97 |
| adult-critical-burn | Trauma | adult (33 y) | Critical-burn temperature protection | decision | 82, 97 |
| adult-delayed-txa | Trauma | adult (62 y) | Hemorrhage treatment-window check | decision | 143, 97 |
| peds-antibiotic-allergy | Trauma | pediatric (11 y) | Pediatric antibiotic safety | decision | 105, 97 |
| peds-trauma-analgesia-monitor | Trauma | pediatric (16 y) | Pediatric analgesia reassessment | decision | 118, 97 |
| peds-nausea-odt | Medical | pediatric (8 y) | Pediatric nausea medication check | decision | 49, 97 |
| peds-fever-oral | Medical | pediatric (5 y) | Pediatric fever treatment reference | decision | 51, 97 |
| peds-fever-prior-dose | Medical | pediatric (4 y) | Pediatric duplicate-dose prevention | decision | 51, 97 |
| adult-sepsis-fluid | Medical | adult (68 y) | Adult sepsis fluid planning | decision | 64, 97 |
| peds-perfusion-fluid | Medical | pediatric (10 y) | Pediatric hypoperfusion planning | decision | 52, 97 |
| adult-dive-oxygen | Medical | adult (37 y) | Dive emergency oxygen | decision | 90, 97 |
| adult-dive-computer | Medical | adult (45 y) | Dive emergency handoff | decision | 90, 97 |
| peds-snakebite | Medical | pediatric (12 y) | Pediatric bite-site safety | decision | 88, 97 |
| adult-postpartum | Medical | adult (30 y) | Postpartum hypertension recognition | decision | 92, 97 |

Regression coverage checks all 70 cases, exactly 10 per category, population
counts, existing medication paths, decision gates and incorrect choices,
reassessment, replay, filters, and full-round rotation with normal, blocked
and corrupt browser storage.
