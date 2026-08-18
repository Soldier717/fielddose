/* FieldDose service worker — offline support.
 *
 * Strategy (clinical tool: freshness beats cache when online):
 *  - App shell ('/'):      network-first, cached copy when offline.
 *  - /api/qref list:       network-first, cached copy when offline.
 *  - Blob uploads:         cache-first (reference cards viewable offline once loaded).
 *  - Fonts + static files: cache-first.
 */
const CACHE = 'fielddose-v3';

const PRECACHE = [
  '/',
  '/manifest.json',
  '/fielddose-logo.png',
  '/favicon-32.png',
  '/favicon-192.png',
  '/favicon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch from network; on success mirror into the cache, on failure fall back to it.
async function networkFirst(req, cacheKey) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(cacheKey || req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(cacheKey || req);
    if (hit) return hit;
    throw err;
  }
}

// Serve from cache; on miss fetch and backfill. Opaque cross-origin responses
// (fonts, blob-store files) are cached as-is.
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
  return res;
}

// Warm the cache with every file in a fresh card list, so references are
// available offline even if never opened; prune files for deleted cards.
async function warmCardCache(listResponse) {
  try {
    const { cards = [] } = await listResponse.json();
    const cache = await caches.open(CACHE);
    const wanted = new Set(cards.map((c) => c.url).filter(Boolean));

    for (const key of await cache.keys()) {
      const u = new URL(key.url);
      if (u.hostname.endsWith('.public.blob.vercel-storage.com') && !wanted.has(key.url)) {
        await cache.delete(key);
      }
    }
    await Promise.all([...wanted].map(async (fileUrl) => {
      if (await cache.match(fileUrl)) return;
      try {
        let res = await fetch(fileUrl).catch(() => fetch(fileUrl, { mode: 'no-cors' }));
        if (res && (res.ok || res.type === 'opaque')) await cache.put(fileUrl, res);
      } catch (_) { /* offline or blocked — will retry on next list fetch */ }
    }));
  } catch (_) { /* malformed list — skip warming */ }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return; // mutations always hit the network

  const url = new URL(req.url);

  // App navigation → the single-page shell
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req, '/'));
    return;
  }

  // Quick-reference card list — also pre-cache every card file it names
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/qref')) {
    e.respondWith((async () => {
      const res = await networkFirst(req);
      if (res && res.ok) e.waitUntil(warmCardCache(res.clone()));
      return res;
    })());
    return;
  }

  // Uploaded reference files (Vercel Blob), fonts, and same-origin static assets
  if (
    url.hostname.endsWith('.public.blob.vercel-storage.com') ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.origin === self.location.origin
  ) {
    e.respondWith(cacheFirst(req));
  }
});
