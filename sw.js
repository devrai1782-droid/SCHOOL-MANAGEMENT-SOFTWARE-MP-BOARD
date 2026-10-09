// RSK ERP Service Worker
const CACHE_NAME = 'rsk-erp-v2';

self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) { e.waitUntil(clients.claim()); });

// Network first for same-origin GET only. Cross-origin (Worker API, fonts) and
// non-GET (POST/beacon) go straight to the browser — SW never touches them.
self.addEventListener('fetch', function(e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).catch(function() {
      return caches.match(req).then(function(r) {
        return r || new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
