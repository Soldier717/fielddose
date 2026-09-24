# Scenario expansion — September 24, 2026

Eight focused adult cases now share a configurable engine. These are authored simulations, not a physiology model, clinical certification, or complete treatment algorithms. Beta / clinical-review-pending notices remain visible.

| ID | Focus | Initial medication exercise | Response | Source PDF pages |
|---|---|---|---|---|
| dust | Adult reactive airway | Albuterol 2.5 mg nebulized | Improved | 60, 100, 222, 97 |
| exercise | Adult reactive airway | Albuterol 2.5 mg nebulized | Improved | 60, 100, 222, 97 |
| garden | Adult reactive airway | Albuterol 2.5 mg nebulized | Improved | 60, 100, 222, 97 |
| workshop | Persistent respiratory distress | Albuterol 2.5 mg nebulized | Unchanged | 60, 100, 222, 97 |
| overnight | Deteriorating respiratory distress | Albuterol 2.5 mg nebulized | Worse | 60, 100, 222, 97 |
| chest-pressure | Suspected ACS / initial aspirin | Aspirin 324 mg PO, chewed | Pain unchanged; ongoing ACS care | 69, 102, 97 |
| missed-meal | Alert hypoglycemic adult with safe swallow | Oral glucose gel 30 g PO | Improved | 56, 137, 97 |
| nausea-home | Adult nausea / oral-disintegrating medication | Ondansetron 4 mg PO (ODT) | Improved | 49, 136, 97 |

Clinical anchors were checked against the included SWFL Revised 8/2026 PDF. Medication amount, unit, route, and safety prerequisites are separate case fields. Glucose gel requires documented airway/swallow and BGL checks; aspirin requires history and ECG assessment in this exercise. These prerequisites are training gates, not newly claimed protocol-mandated treatment delays. Instructor/medical-direction review remains needed.

All vitals, symptom severity, and responses are fictional. The action clock compresses learning time; it does not predict medication onset. Each case covers one initial drug only. Repeats, additional medication bundles, definitive care and advanced interventions are outside this version. Aspirin is not scored as an immediate analgesic. Nonhypoxemic cases do not require oxygen for a checkpoint.

Next scenario on the debrief draws a different case and opens its dispatch screen. Replay resets the current case without consuming another from the bag. Scenario library returns to the selector. The eight-case bag avoids repeats until exhausted and preserves browser rotation with storage fallback.

Source question banks, setup drills and PDF are unchanged. app.js is intentionally no longer byte-identical to the handoff because it now supports non-respiratory cases; new scenario regressions cover medication matching, incorrect units, missing safety checks, reassessment, replay and next-case rotation.
