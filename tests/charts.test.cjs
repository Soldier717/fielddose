// Patient chart lifecycle — on-device treatment tracking worksheets.
// Verifies: auto-create on patient selection, snapshot on log events,
// survival across New Patient, reopen, delete, and 7-day expiry.
const assert = require('assert');
const { loadApp } = require('./load-app.cjs');

const app = loadApp();
const { cr, ctState, BROSELOW } = app;

// 1. Selecting a patient creates a chart
app.crSetBroselow(BROSELOW[4]); // Red · 8.5 kg
let charts = app.chartsLoadAll();
assert.strictEqual(charts.length, 1, 'chart created on patient selection');
assert.strictEqual(charts[0].patient.zone, 'red');
const firstId = charts[0].id;
assert.strictEqual(cr.chartId, firstId, 'session linked to chart');

// 2. Log events snapshot into the chart
app.ctLogEvent('Drug', 'Epinephrine given @ 00:00');
app.ctLogEvent('Shock', 'Shock delivered @ 00:30');
charts = app.chartsLoadAll();
assert.strictEqual(charts[0].log.length, 2, 'log events saved to chart');

// 3. New Patient detaches but does not destroy the chart
app.crNewPatient();
assert.strictEqual(cr.chartId, null, 'chart detached on New Patient');
charts = app.chartsLoadAll();
assert.strictEqual(charts.length, 1, 'chart survives New Patient');
assert.strictEqual(charts[0].log.length, 2, 'saved log not wiped by reset');

// 4. A second patient adds a second chart, newest first
app.crSetAdultIBW({ lbs: 154, kg: 70, height: "5'7\"" });
charts = app.chartsLoadAll();
assert.strictEqual(charts.length, 2, 'second chart created');
assert.strictEqual(charts[0].patient.type, 'adult', 'newest chart first');
app.crNewPatient();

// 5. Reopening restores the full session, landing on the Pt. Log
app.chartOpen(firstId);
assert.strictEqual(cr.chartId, firstId, 'reopened chart is active');
assert.strictEqual(cr.patient.zone, 'red', 'patient restored');
assert.strictEqual(ctState.log.length, 2, 'event log restored');
assert.strictEqual(ctState.running, false, 'timer not running after reopen');
assert.strictEqual(ctState.activeTab, 'more', 'reopens onto Pt. Log tab');
app.crNewPatient();

// 6. Delete removes a chart
app.chartDelete(firstId);
charts = app.chartsLoadAll();
assert.strictEqual(charts.length, 1, 'chart deleted');
assert.notStrictEqual(charts[0].id, firstId);

// 7. Worksheet text renders chronologically with the safety framing
app.crSetBroselow(BROSELOW[6]); // Yellow · 13 kg
app.ctLogEvent('Drug', 'Epinephrine 0.13 mg IV given');
app.ctLogEvent('Shock', 'Shock delivered 52 J');
const ws = app.chartWorksheetText(app.chartsLoadAll()[0]);
assert.ok(ws.includes('NOT a patient care record'), 'worksheet carries disclaimer');
assert.ok(ws.includes('Yellow · 13 kg'), 'worksheet has patient summary');
assert.ok(
  ws.indexOf('Epinephrine 0.13 mg') < ws.indexOf('Shock delivered 52 J'),
  'worksheet log is chronological (oldest first)'
);
app.crNewPatient();
app.chartDelete(app.chartsLoadAll()[0].id);

// 8. Narcotic photo log: entries carry unique ids, photoIds survive
//    save/reopen, and the worksheet marks photographed entries
app.crSetBroselow(BROSELOW[4]);
app.ctLogEvent('Drug', 'Fentanyl 25 mcg IV given');
app.ctLogEvent('Waste', 'Fentanyl — wasted 75 mcg · witness: JD');
assert.ok(ctState.log[0].id && ctState.log[1].id, 'log entries have ids');
assert.notStrictEqual(ctState.log[0].id, ctState.log[1].id, 'entry ids unique');
ctState.log[1].photoIds = ['p-test-1'];
ctState.log[0].photoIds = ['p-test-2', 'p-test-3'];
app.chartSaveActive();
const csId = cr.chartId;
app.crNewPatient();
app.chartOpen(csId);
assert.deepStrictEqual(ctState.log[0].photoIds, ['p-test-2', 'p-test-3'], 'photoIds survive save/reopen');
const csWs = app.chartWorksheetText(app.chartsLoadAll().find((c) => c.id === csId));
assert.ok(csWs.includes('[photo ×1]') && csWs.includes('[photo ×2]'), 'worksheet marks photographed entries');
assert.ok(csWs.includes('3 photos attached'), 'worksheet counts photos');
app.crNewPatient();
app.chartDelete(csId);

// 9. The device holds at most 10 charts — the 11th pushes the oldest off
for (let i = 0; i < 11; i++) {
  app.crSetBroselow(BROSELOW[i % BROSELOW.length]);
  app.ctLogEvent('Note', `call ${i}`);
  app.crNewPatient();
}
charts = app.chartsLoadAll();
assert.strictEqual(charts.length, 10, 'store capped at 10 charts');
assert.ok(
  charts.every((c) => !(c.log || []).some((e) => e.note === 'call 0')),
  'oldest chart fell off when the 11th was saved'
);
assert.ok(
  charts[0].log.some((e) => e.note === 'call 10'),
  'newest chart retained at the top'
);
charts.forEach((c) => app.chartDelete(c.id));

// 10. Charts older than 7 days fall off on load
const stale = charts[0];
stale.createdAt = Date.now() - 8 * 24 * 60 * 60 * 1000;
app.chartsSaveAll([stale]);
assert.strictEqual(app.chartsLoadAll().length, 0, '8-day-old chart purged');

console.log('OK — chart lifecycle: create, snapshot, survive reset, reopen, delete, worksheet text, 7-day expiry.');
