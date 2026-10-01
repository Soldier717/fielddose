/* Shared device-local theme preference; runs before paint in both documents. */
(function () {
  'use strict';
  const key = 'fielddose-theme-v1';
  const valid = value => ['light', 'dark', 'system'].includes(value);
  const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  let preference = 'light';
  try { const saved = localStorage.getItem(key); if (valid(saved)) preference = saved; } catch (_) {}
  function syncControls() {
    document.querySelectorAll('[data-fd-theme]').forEach(control => { if (control.value !== preference) control.value = preference; });
  }
  function apply() {
    const mode = preference === 'system' ? (media && media.matches ? 'dark' : 'light') : preference;
    document.documentElement.setAttribute('data-fd-theme', mode);
    document.documentElement.style.colorScheme = mode;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#10151c' : '#fdfaf4');
    syncControls();
  }
  function set(value) {
    if (!valid(value)) return;
    preference = value;
    try { localStorage.setItem(key, value); } catch (_) {}
    apply();
  }
  apply();
  document.addEventListener('change', event => {
    if (event.target && event.target.matches('[data-fd-theme]')) set(event.target.value);
  });
  document.addEventListener('DOMContentLoaded', syncControls);
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(syncControls).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (media && typeof media.addEventListener === 'function') media.addEventListener('change', () => { if (preference === 'system') apply(); });
  else if (media && typeof media.addListener === 'function') media.addListener(() => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = valid(event.newValue) ? event.newValue : 'light';
      apply();
    }
  });
})();
