const CACHE_NAME = 'nodepress-v5';

// Install - skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - minimal interception, let most requests pass through
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept these - let them pass through directly
  if (event.request.mode === 'navigate') return; // All page navigations
  if (url.pathname.startsWith('/admin')) return; // Admin panel
  if (url.pathname.startsWith('/api/')) return; // API calls
  if (url.pathname.includes('/socket.io')) return; // WebSocket
  if (url.pathname.includes('/messages')) return; // Messages
  if (url.pathname.includes('/lms')) return; // LMS pages
  if (url.pathname.includes('/courses')) return; // Course pages
  if (url.pathname.includes('/shop')) return; // Shop pages
  if (url.origin !== self.location.origin) return; // External URLs

  // Only cache static assets (images, CSS, JS, fonts)
  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);

  if (!isStaticAsset) return; // Don't intercept non-static assets

  // For static assets: try network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

