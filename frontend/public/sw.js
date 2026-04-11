// Service Worker for Offline Support
const CACHE_NAME = 'sidra-art-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/sidra-inkbox-brushes-logo.jpeg',
  '/manifest.json',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache addAll failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.log('Cache put failed:', error);
            });
        }
        
        return response;
      })
      .catch(() => {
        // When offline / network fails, fall back to cache.
        // Ensure we always resolve to a Response (not undefined).
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // As a final fallback, return the cached root page (SPA fallback) ONLY for HTML requests or navigations.
          if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/').then((rootResponse) => {
              if (rootResponse) {
                return rootResponse;
              }
              return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
              });
            });
          }
          // If it's a module script or asset, just return a generic 404 so we don't return text/html for scripts
          return new Response('Resource completely unavailable offline', { status: 404 });
        });
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});
