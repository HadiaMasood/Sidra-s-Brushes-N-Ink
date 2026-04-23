// Service Worker for Offline Support
const CACHE_NAME = 'sidra-art-v5'; // bumped to v5 to clear old localhost API cache
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

  // NEVER cache API requests - always go to network directly
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.hostname !== location.hostname) {
    return; // let the browser handle it normally
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses for static assets (not API)
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
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/').then((rootResponse) => {
              if (rootResponse) {
                return rootResponse;
              }
              return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            });
          }
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
