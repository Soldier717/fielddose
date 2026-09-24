# Training integration

Training is a separate static document at /training and /training/. It uses the existing Vercel project and has its own styles and script globals. It does not read or modify treatment worksheets, narcotics records, or account sessions. The clinical home link opens a new tab so entering training cannot interrupt an active patient screen or timer. The landing page also links to training.

## Supplied content

Imported from FieldDose-Codex-Handoff.zip (source snapshot f407dc2c498c8833ef5e70ef859b287bc6d90eef, September 24, 2026). Original hashes are in training-source-hashes.json. Original training data, expanded question bank, and source PDF are unchanged. The scenario engine was expanded after launch; see training-scenarios.md. Integration edits add absolute asset/reference URLs, isolated FieldDose branding, navigation, and a visible training-only notice.

- 200 unique questions: 114 protocol questions and 160 drug questions, with 74 shared.
- 20 protocol topics, 36 medications, 14 setup drills.
- Eight scripted adult scenarios across four topics; not live AI generation.
- Multiple choice and dropdown blanks; filtering, capped rounds, feedback and retry.
- Allergy, six-rights, partner-check and post-medication reassessment gates preserved.

## Limits

Clinical content is supplied training material, not independently clinically validated by this integration. Clinical review remains pending. No certificate or account progress database. Quiz results exist in memory; only the scenario rotation persists in localStorage. No training login gate has been added; existing Supabase authentication remains scoped to the narcotics ledger.

The root service worker keeps visited training assets fresh online and caches them separately from the dosing shell. Full offline training readiness is not promised: resources, including the 9.4 MB source PDF, are not eagerly downloaded. Initial access requires connectivity.

## Verification — September 24, 2026

- Existing dose (23 patients / 859 entries), chart and narcotics tests passed.
- New npm test guard checks bank counts, unique questions, four choices, source hashes, script order, assets and training routes.
- Chromium at 390 and 1280 px: both quiz formats, wrong-answer feedback/retry, short-bank 50-question cap, 107 medication/type filter combinations, all 14 drills.
- Scenario end-to-end: allergies and rights block administration; partner cross-check required; editing dose clears checks; reassessment plus response narrative required; transport and handoff reach debrief.
- Three-case bag exhaustion and no consecutive repeats; rotation survives reload; blocked/corrupt storage falls back safely.
- PDF loads; no JavaScript errors. Mobile and desktop screenshots inspected.

Release: preview reviewed by Sean; production publication as Training Beta authorized September 24, 2026. Training-only and clinical-review-pending notices remain visible.
