/* ==========================================================================
   FocusOnFocus (FonF) - Service Worker for PWA Offline Caching
   ========================================================================== */

const CACHE_NAME = 'fonf-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/store.js',
  './js/components/dashboard.js',
  './js/components/tasks.js',
  './js/components/insights.js',
  './js/components/focus.js',
  './js/components/overlay.js',
  './js/components/onboarding.js',
  './js/components/settings.js',
  './js/components/confetti.js',
  './images/foflogo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
