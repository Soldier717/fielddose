// Loads the FieldDose app's main <script> block in a Node vm with stubbed
// browser globals, and exports its pure dosing/calculation functions for tests.
const vm = require('vm');
const fs = require('fs');
const path = require('path');

function magicStub() {
  const fn = function () {};
  const stub = new Proxy(fn, {
    get(_t, p) {
      if (p === Symbol.toPrimitive || p === 'toString' || p === 'valueOf') return () => '';
      if (p === Symbol.iterator) return function* () {};
      return stub;
    },
    apply() { return stub; },
    construct() { return {}; },
    set() { return true; },
  });
  return stub;
}

function loadApp() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const start = html.indexOf('<script>') + '<script>'.length;
  const end = html.indexOf('</script>');
  const src = html.slice(start, end);

  const dom = magicStub();
  const storage = () => {
    const m = {};
    return {
      getItem: (k) => (k in m ? m[k] : null),
      setItem: (k, v) => { m[k] = String(v); },
      removeItem: (k) => { delete m[k]; },
    };
  };
  const ctx = {
    document: dom,
    window: dom,
    navigator: dom,
    location: { origin: 'http://localhost' },
    localStorage: storage(),
    sessionStorage: storage(),
    console,
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
    fetch: () => Promise.reject(new Error('network disabled in tests')),
    alert: () => {}, confirm: () => true,
    Audio: function () { return { play: () => Promise.resolve() }; },
    AudioContext: undefined, webkitAudioContext: undefined,
    speechSynthesis: dom, SpeechSynthesisUtterance: function () {},
    JSON, Math, Date, Object, Array, String, Number, parseFloat, parseInt, isNaN, Promise, Set, Map, URL,
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);

  const EXPORTS = [
    'ccState', 'cr', 'ccGetWeightKg', 'ccGetAirway', 'ccGetElectrical', 'ccGetDrugs',
    'ccFilterDrugsByRhythm', 'ccFilterArrestDrugs', 'ccFmt',
    'rcDeriveBand', 'rcGetDrips', 'rcParseConc', 'rcParseVol', 'rcParseRoute',
    'rcGetExpectedVitals', 'rcPickPedsTier',
    'crSetAdultIBW', 'crSetAdultCustom', 'crSetBroselow', 'crSetPedsCustom', 'crNewPatient',
    'BROSELOW', 'ADULT_IBW',
    'ctState', 'ctLogEvent',
    'chartsLoadAll', 'chartsSaveAll', 'chartSaveActive', 'chartDelete', 'chartOpen',
    'chartWorksheetText',
  ];
  vm.runInContext(
    src + `\n;globalThis.__app = { ${EXPORTS.map((n) => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(', ')} };`,
    ctx,
    { filename: 'fielddose-app.js' }
  );
  return ctx.__app;
}

module.exports = { loadApp };
