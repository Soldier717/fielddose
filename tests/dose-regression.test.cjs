// Dose-math regression test.
//
// Drives the app's real dosing functions through the same setters the UI
// uses, for a panel of reference patients, and compares every computed
// dose/energy/drip against tests/golden.json.
//
//   node tests/dose-regression.test.cjs            # verify (CI / pre-push)
//   node tests/dose-regression.test.cjs --update   # re-baseline after an
//                                                  # INTENTIONAL dosing change
//
// The golden file is the clinically-reviewed baseline. A failure here means
// an edit changed a computed dose — never re-baseline without reviewing the
// diff against the SWFL guidelines.
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./load-app.cjs');

const GOLDEN_PATH = path.join(__dirname, 'golden.json');

function capturePatient(app, label, setup) {
  setup();
  const kg = app.ccGetWeightKg();
  return {
    label,
    state: { weight: app.ccState.weight, unit: app.ccState.unit, ageBand: app.ccState.ageBand, kg },
    drugs: app.ccGetDrugs(),
    electrical: app.ccGetElectrical(),
    airway: app.ccGetAirway(),
    drips: app.rcGetDrips(kg),
    expectedVitals: app.rcGetExpectedVitals(),
  };
}

function buildSnapshot() {
  const app = loadApp();
  const snap = { patients: {}, bands: {} };

  // Band boundaries (pure function)
  for (const kg of [0.5, 3, 4.9, 5, 10, 25, 39.9, 40, 70, 150]) {
    snap.bands[kg] = app.rcDeriveBand(kg);
  }

  // Every Broselow zone
  for (const zone of app.BROSELOW) {
    snap.patients[`broselow-${zone.code}`] =
      capturePatient(app, `Broselow ${zone.label}`, () => app.crSetBroselow(zone));
  }
  // Peds custom weights (weight + age drive vitals tiers)
  snap.patients['peds-3kg-newborn'] = capturePatient(app, 'Peds 3 kg newborn', () => app.crSetPedsCustom(3, 0));
  snap.patients['peds-10kg-1yr'] = capturePatient(app, 'Peds 10 kg 1 yr', () => app.crSetPedsCustom(10, 1));
  snap.patients['peds-25kg-8yr'] = capturePatient(app, 'Peds 25 kg 8 yr', () => app.crSetPedsCustom(25, 8));
  // Adults
  for (const ibw of app.ADULT_IBW) {
    snap.patients[`adult-ibw-${ibw.kg}kg`] =
      capturePatient(app, `Adult IBW ${ibw.kg} kg`, () => app.crSetAdultIBW(ibw));
  }
  snap.patients['adult-custom-100kg'] = capturePatient(app, 'Adult custom 100 kg', () => app.crSetAdultCustom(100));

  return snap;
}

// Universal ACLS anchors — independent of the golden file, these guard the
// highest-stakes numbers even if someone blindly re-baselines.
function anchorChecks(snap) {
  const errors = [];
  const drug = (patient, name) => (snap.patients[patient].drugs || []).find((d) => d.name && d.name.startsWith(name));

  const adultEpi = drug('adult-ibw-70kg', 'Epinephrine 1:10,000');
  if (!adultEpi) errors.push('anchor: adult epi 1:10,000 missing');
  else if (adultEpi.weightDose !== '1 mg') errors.push(`anchor: adult arrest epi should be 1 mg, got "${adultEpi.weightDose}"`);

  const pedsEpi = (snap.patients['peds-10kg-1yr'].drugs || []).find(
    (d) => /^Epinephrine/.test(d.name || '') && /cardiac arrest/i.test(d.indication || '')
  );
  if (!pedsEpi) errors.push('anchor: peds cardiac-arrest epi missing');
  else if (!/0\.10? mg/.test(pedsEpi.weightDose)) errors.push(`anchor: peds arrest epi at 10 kg should be 0.10 mg (0.01 mg/kg), got "${pedsEpi.weightDose}"`);

  const bands = snap.bands;
  if (bands[3] !== 'neonatal' || bands[10] !== 'pediatric' || bands[40] !== 'adult') {
    errors.push(`anchor: rcDeriveBand boundaries moved: 3→${bands[3]}, 10→${bands[10]}, 40→${bands[40]}`);
  }
  return errors;
}

function diffDeep(a, b, pathStr, out, limit) {
  if (out.length >= limit) return;
  if (a === b) return;
  const ta = Object.prototype.toString.call(a);
  const tb = Object.prototype.toString.call(b);
  if (ta !== tb || typeof a !== 'object' || a == null || b == null) {
    out.push(`  ${pathStr}\n    golden: ${JSON.stringify(a)}\n    now:    ${JSON.stringify(b)}`);
    return;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) diffDeep(a[k], b[k], `${pathStr}.${k}`, out, limit);
}

const snap = buildSnapshot();

if (process.argv.includes('--update')) {
  fs.writeFileSync(GOLDEN_PATH, JSON.stringify(snap, null, 1));
  const n = Object.keys(snap.patients).length;
  console.log(`golden.json re-baselined: ${n} patients, ` +
    `${Object.values(snap.patients).reduce((s, p) => s + p.drugs.length, 0)} drug entries.`);
  console.log('REVIEW THE DIFF against the SWFL guidelines before committing.');
  process.exit(0);
}

const errors = anchorChecks(snap);

if (!fs.existsSync(GOLDEN_PATH)) {
  console.error('tests/golden.json missing — run with --update to create the baseline.');
  process.exit(1);
}
const golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf8'));
const diffs = [];
diffDeep(golden, snap, 'snapshot', diffs, 40);

if (diffs.length) {
  console.error(`DOSE REGRESSION: ${diffs.length}${diffs.length >= 40 ? '+' : ''} value(s) differ from golden baseline:\n`);
  console.error(diffs.join('\n'));
  console.error('\nIf this change is INTENTIONAL and clinically reviewed, re-baseline with:');
  console.error('  node tests/dose-regression.test.cjs --update');
}
for (const e of errors) console.error(e);

if (diffs.length || errors.length) process.exit(1);
const nDrugs = Object.values(snap.patients).reduce((s, p) => s + p.drugs.length, 0);
console.log(`OK — ${Object.keys(snap.patients).length} patients, ${nDrugs} drug doses, electrical + drips + airway all match golden baseline.`);
