// Narcotic transfer wizard test.
//
// Drives fdShowNarcTransfer through its three steps -- Verify, Sign, Confirm --
// against a small recording DOM that captures the HTML painted per step plus
// the click handlers, so step gating, collect() and the commit path are all
// exercised for real rather than eyeballed.
//
//   node tests/narc-transfer.test.cjs
//
// The load-app.cjs harness cannot serve this: its magic-Proxy document returns
// a stub for every query, so no handler can be fired and no markup inspected.
//
// Guards in particular: collect() must not blank state belonging to a step
// that is currently off-screen (the unit survives Verify -> Sign), and the
// signature pads must only be read while step 2 is mounted.
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..', 'public', 'index.html');

let fail = 0;
const ok = (c, m) => { if (!c) { console.log('  FAIL ' + m); fail++; } else console.log('  ok   ' + m); };

// ---- recording DOM -------------------------------------------------------
const state = { html: '', listeners: {}, values: {}, toasts: [] };

function makeEl(key) {
  const el = {
    _key: key,
    style: {}, classList: { add() {}, remove() {}, contains: () => false },
    dataset: {},
    scrollTop: 0,
    get value() { return state.values[key] != null ? state.values[key] : ''; },
    set value(v) { state.values[key] = v; },
    set innerHTML(v) { if (key === 'BG') state.html = v; },
    get innerHTML() { return key === 'BG' ? state.html : ''; },
    addEventListener(evt, fn) { (state.listeners[key] = state.listeners[key] || {})[evt] = fn; },
    removeEventListener() {},
    querySelector: (sel) => makeEl(sel),
    querySelectorAll: () => [],
    closest: () => null,
    appendChild() {}, remove() {}, focus() {}, setPointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 110 }),
    getContext: () => ({ beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, clearRect(){}, drawImage(){} }),
    toDataURL: () => 'data:image/png;base64,SIG',
    parentNode: { appendChild() {} },
  };
  return el;
}
const bgEl = makeEl('BG');
bgEl.querySelector = (sel) => (state.html.indexOf(sel.replace(/^[#.]/, '')) === -1 && sel !== '.fd-narc-body' ? null : makeEl(sel));

const click = (sel) => {
  const l = state.listeners[sel];
  if (!l || !l.click) throw new Error('no click handler for ' + sel);
  l.click();
};

const doc = {
  createElement: () => bgEl,
  body: { appendChild() {}, contains: () => true, classList: { add(){}, remove(){} }, style: {} },
  addEventListener() {}, removeEventListener() {},
  querySelector: () => null, querySelectorAll: () => [],
  getElementById: () => null,
  visibilityState: 'visible',
  fonts: { ready: { then() {} } },
};

const storage = () => { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k,v) => { m[k]=String(v); }, removeItem: k => { delete m[k]; } }; };

const winStub = { addEventListener(){}, removeEventListener(){}, matchMedia: () => ({ matches:false, addEventListener(){} }), scrollTo(){}, innerWidth: 400 };

const ctx = {
  document: doc, window: winStub, navigator: { share: undefined, clipboard: undefined, userAgent: 'test' },
  location: { origin: 'http://localhost', pathname: '/' },
  localStorage: storage(), sessionStorage: storage(),
  console,
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
  fetch: () => Promise.reject(new Error('offline')),
  alert: () => {}, confirm: () => true, prompt: () => '',
  Image: function () { return { set src(v) {}, onload: null }; },
  Audio: function () { return { play: () => Promise.resolve() }; },
  AudioContext: undefined, webkitAudioContext: undefined,
  speechSynthesis: undefined, SpeechSynthesisUtterance: function () {},
  supabase: undefined,
  JSON, Math, Date, Object, Array, String, Number, parseFloat, parseInt, isNaN, isFinite, Promise, Set, Map, URL, RegExp, Error,
};
ctx.globalThis = ctx;
vm.createContext(ctx);

const html = fs.readFileSync(APP, 'utf8');
const start = html.indexOf('<script>') + '<script>'.length;
const src = html.slice(start, html.indexOf('</script>', start));
vm.runInContext(src + '\n;globalThis.__show = fdShowNarcTransfer; globalThis.__load = fdNarcLoad; globalThis.__save = fdNarcSave;', ctx, { filename: 'app.js' });

// showToast is what surfaces gating failures — capture instead of render
vm.runInContext('showToast = function (m, bad) { globalThis.__toasts.push([m, !!bad]); };', ctx);
ctx.__toasts = state.toasts;

// ---- seed a GNFR-style box (keys mode comes from the pack; none loaded here,
// so this exercises seal mode, the stricter path) --------------------------
ctx.__save({ unit: '', seal: '', items: [
  { drug: 'Dilaudid 2 mg/mL', qty: '4', mg: '8', lot: 'A1', exp: '2027-06' },
  { drug: 'Versed 5 mg/mL',   qty: '4', mg: '20', lot: 'B2', exp: '2027-09' },
], transfers: [] });

console.log('STEP 1 — Verify');
ctx.__show();
ok(/Step|Verify/.test(state.html), 'paints without throwing');
ok(state.html.indexOf('fdn-unit') > -1, 'unit field present');
ok(state.html.indexOf('fdn-next') > -1, 'Next button present');
ok(state.html.indexOf('fdn-sig-a') === -1, 'signature pad NOT on step 1');
ok(state.html.indexOf('fdn-complete') === -1, 'Complete NOT reachable from step 1');
ok(state.html.indexOf('Dilaudid 2 mg/mL') > -1, 'prefilled inventory shown');

// gating: no unit yet
state.toasts.length = 0;
click('#fdn-next');
ok(state.toasts.length === 1 && /Unit/.test(state.toasts[0][0]), 'blocks with no Unit/Box ID: ' + JSON.stringify(state.toasts[0] || null));
ok(state.html.indexOf('fdn-sig-a') === -1, 'stayed on step 1');

// fill the unit, advance
state.values['#fdn-unit'] = 'MED 71 · Box 2';
state.toasts.length = 0;
click('#fdn-next');
console.log('STEP 2 — Sign');
ok(state.toasts.length === 0, 'advanced with no complaint');
ok(state.html.indexOf('fdn-sig-a') > -1, 'signature pads present on step 2');
ok(state.html.indexOf('fdn-back') > -1, 'Back button present');
ok(state.html.indexOf('fdn-unit') === -1, 'unit field gone from step 2');

// THE REGRESSION THIS GUARDS: unit must survive a step change even though
// #fdn-unit is no longer in the DOM for collect() to read.
ok(ctx.__load().unit === 'MED 71 · Box 2', 'unit survived the step change (collect did not blank it), got: ' + JSON.stringify(ctx.__load().unit));

// gating on step 2
state.toasts.length = 0;
click('#fdn-next');
ok(state.toasts.length === 1, 'step 2 blocks when incomplete: ' + JSON.stringify(state.toasts[0] || null));

// Appended to narc-wizard.test.cjs: continue through Confirm + commit.
// Signatures: swap in a pad that always reports a capture, then satisfy step 2.
vm.runInContext('fdSigPad = function () { return { isDrawn: () => true, clear() {}, data: () => "data:image/png;base64,SIG", restore() {} }; };', ctx);
state.values['#fdn-newseal'] = 'SEAL-99812';
state.values['#fdn-to'] = 'Santana';
state.values['#fdn-from'] = 'Russ';
click('#fdn-back'); click('#fdn-next');          // repaint step 2 so the new pad is used
click('#fdn-attest');
state.toasts.length = 0;
click('#fdn-next');
console.log('STEP 3 - Confirm');
ok(state.toasts.length === 0, 'advanced to step 3: ' + JSON.stringify(state.toasts[0] || null));
ok(state.html.indexOf('fdn-complete') > -1, 'Complete button present');
ok(state.html.indexOf('Read this back') > -1, 'read-back panel rendered');
ok(state.html.indexOf('SEAL-99812') > -1, 'new seal shown in read-back');
ok(state.html.indexOf('Santana') > -1 && state.html.indexOf('Russ') > -1, 'both names shown');
ok(state.html.indexOf('Dilaudid 2 mg/mL') > -1, 'items listed in read-back');
ok(state.html.indexOf('data:image/png;base64,SIG') > -1, 'signature thumbnails rendered');
ok(state.html.indexOf('fdn-note') > -1, 'notes field on step 3');

// Commit
state.toasts.length = 0;
click('#fdn-complete');
const after = ctx.__load();
ok(after.transfers.length === 1, 'transfer recorded, count=' + after.transfers.length);
const rec = after.transfers[0] || {};
ok(rec.newSeal === 'SEAL-99812', 'new seal on record: ' + JSON.stringify(rec.newSeal));
ok(rec.assumed && rec.assumed.name === 'Santana', 'assumed-by on record');
ok(rec.witness && rec.witness.name === 'Russ', 'witness on record');
ok(rec.items && rec.items.length === 2, 'both drugs on record');
ok(!!rec.unit, 'unit on record: ' + JSON.stringify(rec.unit));
ok(after.seal === 'SEAL-99812', 'seal chain advanced for next shift');
ok(state.html.indexOf('fdn-unit') > -1, 'returned to step 1 after completing');

// ---- GNFR pack mode: units dropdown, seeded stock, auto lot/expiry, keys mode.
console.log('\nGNFR PACK — keys mode, seeded stock');
{
  const pack = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'packs', 'GNFR2026.json'), 'utf8'));
  // fresh state: no prior inventory, so the pack stock should seed it
  ctx.__save({ unit: '', seal: '', items: [], transfers: [] });
  vm.runInContext('localStorage.setItem(FD_PACK_KEY, JSON.stringify({ code: "GNFR2026", pack: ' + JSON.stringify(pack) + ', fetchedAt: Date.now() }));', ctx);

  state.html = ''; state.listeners = {}; state.values = {}; state.toasts.length = 0;
  ctx.__show();

  const seeded = ctx.__load();
  ok(seeded.items.length === 2, 'pack seeded 2 narcotics, got ' + seeded.items.length);
  ok(!!seeded.items.find((i) => /Fentanyl 100 mcg \/ 2 mL/.test(i.drug)), 'Fentanyl 100 mcg / 2 mL seeded');
  ok(!!seeded.items.find((i) => /Ketamine 500 mg \/ 5 mL/.test(i.drug)), 'Ketamine 500 mg / 5 mL seeded');

  const now = new Date();
  const p2 = (n) => (n < 10 ? '0' : '') + n;
  const today = now.getFullYear() + '-' + p2(now.getMonth() + 1) + '-' + p2(now.getDate());
  const exp3 = (now.getFullYear() + 3) + '-' + p2(now.getMonth() + 1);
  ok(seeded.items.every((i) => i.lot === today), 'lot auto-dated today (' + today + '), got ' + JSON.stringify(seeded.items.map((i) => i.lot)));
  ok(seeded.items.every((i) => i.exp === exp3), 'expiry auto-set 3 years out (' + exp3 + '), got ' + JSON.stringify(seeded.items.map((i) => i.exp)));
  ok(seeded.items.every((i) => i.qty === ''), 'quantities left blank for the crew to count');

  // units dropdown
  ok(state.html.indexOf('fdn-unit-sel') > -1, 'unit rendered as a dropdown');
  ['L21', 'E22', 'E23', 'E24', 'E25'].forEach((u) => {
    ok(state.html.indexOf('>' + u + '<') > -1, 'unit ' + u + ' listed');
  });
  ok(state.html.indexOf('Other — type a unit') > -1, 'Other option present');

  // keys mode: no seal step
  state.values['#fdn-unit'] = 'E24';
  state.values['#fdn-qty'] = '';
  ok(state.html.indexOf('fdn-seal-ok') === -1, 'no seal buttons in keys mode');

  // quantities are still required
  state.toasts.length = 0;
  click('#fdn-next');
  ok(state.toasts.length === 1 && /quantity/i.test(state.toasts[0][0]), 'still blocks without counts: ' + JSON.stringify(state.toasts[0] || null));

  // seeding must not re-fire once an inventory exists
  const s2 = ctx.__load();
  s2.items[0].drug = 'EDITED';
  ctx.__save(s2);
  ctx.__show();
  ok(ctx.__load().items[0].drug === 'EDITED', 'pack stock does not overwrite an existing inventory');
}

console.log(fail ? '\n' + fail + ' CHECK(S) FAILED' : '\nALL CHECKS PASSED');
process.exit(fail ? 1 : 0);
