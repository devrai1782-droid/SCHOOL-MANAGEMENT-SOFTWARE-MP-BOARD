// RSK ERP Service Worker — Auto Update Version
const CACHE_NAME = 'rsk-erp-v3';
const CACHE_FILES = [
  './',
  './index.html',
  './rsk_backend.js'
];

// ── INSTALL: cache karo aur turant activate ho jao ──
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting(); // purana SW hato, naya turant aao
});

// ── ACTIVATE: purane cache delete karo ──
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME; // sirf purane delete karo
        }).map(function(key) {
          console.log('[SW] Purana cache delete:', key);
          return caches.delete(key);
        })
      );
    }).then(function() {
      return clients.claim(); // sab tabs par control lo
    })
  );
});

// ── FETCH: Network First, Cache Fallback ──
self.addEventListener('fetch', function(e) {
  // Sirf GET requests handle karo
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(function(networkResponse) {
        // Network se mila → cache update karo
        if (networkResponse && networkResponse.status === 200) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(function() {
        // Internet nahi → cache se do
        return caches.match(e.request).then(function(cached) {
          return cached || new Response('Offline — Internet connect karein', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// ── MESSAGE: Page se "SKIP_WAITING" aaye toh turant update ──
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
