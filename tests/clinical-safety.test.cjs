// Clinical safety helpers grounded in SWFL baseline + Round 2 A1.
// Does not invent doses — only verifies measurable-volume warnings and
// arrest-epi cumulative accounting stay consistent across entry paths.
const assert = require('assert');
const { loadApp } = require('./load-app.cjs');

const app = loadApp();
const {
  fdParseDrawMl, fdMeasurableVolWarn, FD_SYRINGE_GRAD_ML,
  crSetAdultIBW, crSetBroselow, BROSELOW, ADULT_IBW,
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

// Live ketamine adult 70 kg IV/IO delivery should warn (0.07 mL undiluted)
crSetAdultIBW(ADULT_IBW.find(a => a.kg === 70) || { lbs: 154, kg: 70, height: "5'7\"" });
const ketPain = ccGetDrugs().find(d => d.name && /ketamine/i.test(d.name) && /pain/i.test(d.name));
const ketSed = ccGetDrugs().find(d => d.name && /ketamine/i.test(d.name) && /sedation/i.test(d.name));
assert.ok(ketPain || ketSed, 'adult ketamine row present');
const ketRow = ketPain || ketSed;
const ketWarn = fdMeasurableVolWarn(ketRow.deliveryDose);
assert.ok(ketWarn, `adult ketamine delivery "${ketRow.deliveryDose}" should warn`);

// Peds sedation draw at small weight is unmeasurable / difficult undiluted
crNewPatient();
crSetBroselow(BROSELOW.find(z => z.code === 'pink') || BROSELOW[0]);
const pedsKet = ccGetDrugs().find(d => d.name && /ketamine/i.test(d.name) && /sedation/i.test(d.name));
assert.ok(pedsKet, 'peds ketamine sedation row present');
const pedsWarn = fdMeasurableVolWarn(pedsKet.deliveryDose);
assert.ok(pedsWarn, `peds ketamine delivery "${pedsKet.deliveryDose}" should warn`);

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

console.log('clinical-safety: ALL CHECKS PASSED');
