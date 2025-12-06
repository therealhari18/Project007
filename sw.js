const CACHE_NAME = 'mood-stamps-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// 1. INSTALL: Cache all files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching files');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Force activation immediately
});

// 2. ACTIVATE: Clean up old caches (Versioning)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. FETCH: Serve from Cache -> Fallback to Network -> Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached file if found
      if (cachedResponse) {
        return cachedResponse;
      }
      // If not in cache, try network
      return fetch(event.request).catch(() => {
        // If network fails (Offline), we could return a fallback page here
        // But since we cached index.html, the app will just work.
        console.log('Offline: Could not fetch', event.request.url);
      });
    })
  );
});