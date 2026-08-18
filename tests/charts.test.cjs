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

// 7. Charts older than 7 days fall off on load
const stale = charts[0];
stale.createdAt = Date.now() - 8 * 24 * 60 * 60 * 1000;
app.chartsSaveAll([stale]);
assert.strictEqual(app.chartsLoadAll().length, 0, '8-day-old chart purged');

console.log('OK — chart lifecycle: create, snapshot, survive reset, reopen, delete, 7-day expiry.');
