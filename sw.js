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
const CACHE = 'brunian-lifts-shell-v3';
const SHELL = ['./', './index.html', './app.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Cache each item independently so a missing icon/manifest never fails install.
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
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
      if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    } catch (_) {
      const cached = await caches.match(req);         // offline: serve the cached shell
      return cached || (await caches.match('./index.html')) || Response.error();
    }
  })());
});
