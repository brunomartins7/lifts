/* ============================================================================
   BRUNIAN LIFTS — service worker (shell precache only)
   Makes the app open with no network. Deliberately narrow:
   - Only same-origin GET is handled (index.html, app.js, manifest, icons).
   - GIF demos (raw.githubusercontent.com) and the Gist API (api.github.com)
     are cross-origin, so they bypass this worker entirely — this cannot
     reintroduce the old GIF-blocking bug, and sync/PATCH requests are untouched.
   - Network-first: online always gets the freshest app.js/index.html, so the
     "replace the file in the repo, same URL" update workflow still works;
     cache is only used as the offline fallback.
   ========================================================================== */
const CACHE = 'brunian-lifts-shell-v8';
/* CORE is atomic: if any of it fails to cache, the worker must not install,
   because a half-cached shell serves an app with no styles. Icons and the
   manifest are cosmetic, so they stay best-effort. */
const CORE = ['./', './index.html', './app.js', './tokens.css'];
const OPTIONAL = ['./manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);                              // all or nothing
    await Promise.all(OPTIONAL.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // Scope the sweep to this app's own caches. github.io is a shared origin —
    // every Pages project of the same user lives on it, so deleting every cache
    // here would evict other apps' offline data.
    await Promise.all(keys.filter(k => k.startsWith('brunian-lifts-shell-') && k !== CACHE)
                          .map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // never touch Gist PATCH/POST
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;        // GIFs + api.github.com go straight to network
  e.respondWith((async () => {
    try {
      const res = await fetch(req);                  // network-first: keeps the push-to-update workflow
      // Await the write, but never let it sink the response. e.waitUntil() here
      // would fire after the fetch event went inactive (InvalidStateError), and
      // an unguarded await would let a quota rejection discard a good response
      // and fall through to the stale-cache branch below.
      if (res && res.ok) {
        try { const c = await caches.open(CACHE); await c.put(req, res.clone()); }
        catch (_) { /* quota or eviction — the network response is still valid */ }
      }
      return res;
    } catch (_) {
      const cached = await caches.match(req);         // offline: serve the cached shell
      if (cached) return cached;
      // Only a page navigation may fall back to index.html. Returning HTML for a
      // missing .css or .js hands the browser a document where it expects a
      // stylesheet or a script, which silently strips the whole design system.
      if (req.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
