// Clinical safety helpers grounded in SWFL baseline + Round 2 A1.
// Does not invent doses — only verifies measurable-volume warnings and
// arrest-epi cumulative accounting stay consistent across entry paths.
const assert = require('assert');
const { loadApp } = require('./load-app.cjs');

const app = loadApp();
const {
  fdParseDrawMl, fdMeasurableVolWarn, FD_SYRINGE_GRAD_ML,
  crSetAdultIBW, crSetBroselow, crSetPedsCustom, BROSELOW, ADULT_IBW,
  ccGetDrugs, ctState, ctMarkEpiGiven, crNewPatient,
} = app;

// ---- Draw-volume parsing ----
assert.strictEqual(fdParseDrawMl('0.070 mL IV/IO of 100 mg/mL (undiluted)'), 0.07);
assert.strictEqual(fdParseDrawMl('Push 5–10 mL IV/IO'), 5);
assert.strictEqual(fdParseDrawMl('0.007 mL of 100 mg/mL'), 0.007);
assert.strictEqual(fdParseDrawMl('Chew 4 tablets'), null);
assert.ok(FD_SYRINGE_GRAD_ML === 0.01, '1 mL syringe graduation constant');

// Unmeasurable — below one graduation
const below = fdMeasurableVolWarn('0.007 mL of 100 mg/mL');
assert.ok(below && /below a 1 mL syringe graduation/i.test(below), 'flags sub-graduation draws');

// Difficult but measurable (< 0.1 mL)
const near = fdMeasurableVolWarn('0.07 mL of 100 mg/mL');
assert.ok(near && /difficult to measure/i.test(near), 'cautions sub-0.1 mL draws');

// Comfortable volume — no warn
assert.strictEqual(fdMeasurableVolWarn('Push 1 mL IV/IO'), null);

// Adult ketamine — SWFL: pain 0.2 mg/kg all routes; sedation 1 mg/kg IV / 2 mg/kg IM
crSetAdultIBW(ADULT_IBW.find(a => a.kg === 70) || { lbs: 154, kg: 70, height: "5'7\"" });
const ketPain = ccGetDrugs().find(d => d.name && /ketamine/i.test(d.name) && /pain/i.test(d.name));
const ketSed = ccGetDrugs().find(d => d.name && /ketamine/i.test(d.name) && /sedation/i.test(d.name));
assert.ok(ketPain && ketSed, 'adult ketamine rows present');
assert.ok(/0\.2 mg\/kg/.test(ketPain.weightDose), `adult pain 0.2 mg/kg, got "${ketPain.weightDose}"`);
assert.ok(/70 mg IV\/IO/.test(ketSed.weightDose) && /140 mg IM\/IN/.test(ketSed.weightDose),
  `adult sedation 1/2 mg/kg at 70 kg, got "${ketSed.weightDose}"`);
// 0.2 mg/kg at 70 kg = 0.14 mL — above 0.1 mL caution floor; sedation 0.70 mL is fine
assert.strictEqual(fdMeasurableVolWarn(ketSed.deliveryDose), null, 'adult sedation IV volume should be measurable');

// Peds pain 0.2 mg/kg undiluted is still a tiny draw at Pink-zone weights
crNewPatient();
crSetBroselow(BROSELOW.find(z => z.code === 'pink') || BROSELOW[0]);
const pedsPain = ccGetDrugs().find(d => d.name && /ketamine/i.test(d.name) && /pain/i.test(d.name));
const pedsKet = ccGetDrugs().find(d => d.name && /ketamine/i.test(d.name) && /sedation/i.test(d.name));
assert.ok(pedsPain, 'peds ketamine pain row present (SWFL 0.2 mg/kg)');
assert.ok(pedsKet, 'peds ketamine sedation row present');
assert.ok(/0\.2 mg\/kg/.test(pedsPain.weightDose || '') || /0\.2 mg\/kg/.test(JSON.stringify(pedsPain.routeDoses || {})),
  `peds pain dose is 0.2 mg/kg, got "${pedsPain.weightDose}"`);
// Pink 6.5 kg → 1 mg/kg = 6.5 mg IV/IO · 2 mg/kg = 13 mg IM/IN
assert.ok(/6\.5 mg IV\/IO/.test(pedsKet.weightDose || '') && /13 mg IM\/IN/.test(pedsKet.weightDose || ''),
  `peds sedation is 1 mg/kg IV/IO · 2 mg/kg IM/IN, got "${pedsKet.weightDose}"`);
const pedsPainWarn = fdMeasurableVolWarn(pedsPain.deliveryDose);
assert.ok(pedsPainWarn, `peds pain delivery "${pedsPain.deliveryDose}" should warn (tiny undiluted draw)`);

// ---- Arrest epi cumulative: timer shortcut counts ----
crNewPatient();
crSetAdultIBW(ADULT_IBW.find(a => a.kg === 70) || { lbs: 154, kg: 70, height: "5'7\"" });
assert.strictEqual(ctState.cumulativeEpiMg, 0);
ctMarkEpiGiven();
assert.strictEqual(ctState.cumulativeEpiMg, 1, 'adult timer epi counts 1 mg (high end of 0.5–1)');
assert.ok(ctState.log[0].amt === 1 && ctState.log[0].unit === 'mg', 'structured amt/unit on timer log');
ctMarkEpiGiven();
ctMarkEpiGiven();
assert.strictEqual(ctState.cumulativeEpiMg, 3, 'three timer epis reach SWFL 3 mg cumulative');

// ---- Midazolam route map (SWFL / Round 2 C1) ----
crNewPatient();
crSetAdultIBW(ADULT_IBW.find(a => a.kg === 70) || { lbs: 154, kg: 70, height: "5'7\"" });
const adultMz = ccGetDrugs().find(d => d.name === 'Midazolam — Seizure');
assert.ok(adultMz && adultMz.routeDoses, 'adult midazolam seizure row');
assert.strictEqual(adultMz.routeDoses.IV.dose, '5 mg');
assert.strictEqual(adultMz.routeDoses.IM.dose, '10 mg');
assert.ok(/every 5 minutes PRN/i.test(adultMz.detail), 'adult midazolam says every 5 min PRN');

crNewPatient();
crSetBroselow(BROSELOW.find(z => z.code === 'yellow') || BROSELOW[6]); // 13 kg
const pedsMz = ccGetDrugs().find(d => /Midazolam/i.test(d.name));
assert.ok(pedsMz && pedsMz.routeDoses, 'peds midazolam row');
// 0.2*13 = 2.6 → under both caps
assert.ok(/0\.2 mg\/kg, max 5/.test(pedsMz.routeDoses.IV.dose), `peds IV ${pedsMz.routeDoses.IV.dose}`);
assert.ok(/0\.2 mg\/kg, max 10/.test(pedsMz.routeDoses.IM.dose), `peds IM ${pedsMz.routeDoses.IM.dose}`);
assert.ok(/every 5 minutes PRN/i.test(pedsMz.detail), 'peds midazolam says every 5 min PRN');

// Cap check: Green 33 kg — IV max 5 (0.2*33=6.6), IM uncapped at 6.6 (<10)
crNewPatient();
crSetBroselow(BROSELOW.find(z => z.code === 'green') || BROSELOW[9]);
const bigMz = ccGetDrugs().find(d => /Midazolam/i.test(d.name));
assert.ok(/5(\.0)? mg \(0\.2 mg\/kg, max 5\)/.test(bigMz.routeDoses.IV.dose),
  `33 kg IV capped at 5, got ${bigMz.routeDoses.IV.dose}`);
assert.ok(/6\.6 mg \(0\.2 mg\/kg, max 10\)/.test(bigMz.routeDoses.IM.dose),
  `33 kg IM = 6.6 mg under 10 cap, got ${bigMz.routeDoses.IM.dose}`);

console.log('clinical-safety: ALL CHECKS PASSED');
