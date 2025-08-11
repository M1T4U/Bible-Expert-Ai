/// <reference lib="webworker" />

// service-worker.ts

const CACHE_NAME = 'bible-expert-ai-cache-v1';

// List of assets to cache during installation
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/background.css',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap'
];

// Install event - cache specified files
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell...');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Fetch event - stale-while-revalidate
self.addEventListener('fetch', (event: FetchEvent) => {
  // Ignore non-GET requests and Gemini API calls
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('generativelanguage.googleapis.com')
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // fallback to cache on network error

      return cachedResponse || fetchPromise;
    })
  );
});

// Activate event - remove old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
