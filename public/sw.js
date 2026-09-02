/**
 * ============================================================================
 * منصة المدرسة الرقمية | Service Worker for Offline Caching & PWA (Self-Healing)
 * ============================================================================
 */

const CACHE_NAME = 'madrasa-pwa-v7';

// Safe install handler with individual asset caching (no all-or-nothing fail)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const basePath = self.location.pathname.replace(/\/sw\.js$/, '') || '';
      const assets = [
        `${basePath}/`,
        `${basePath}/index.html`,
        `${basePath}/manifest.json`,
        `${basePath}/favicon.ico`,
        `${basePath}/logo.png`
      ];

      // Cache each asset safely; ignore any individual 404s
      await Promise.allSettled(
        assets.map((url) =>
          fetch(url, { cache: 'no-cache' })
            .then((res) => {
              if (res && res.status === 200) {
                return cache.put(url, res);
              }
            })
            .catch(() => {})
        )
      );
    })
  );
});

// Activate handler to clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first with Cache Fallback for dynamic assets
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  // Ignore browser extensions and unsupported protocols
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
    return;
  }

  // Ignore SSE and API live sync streams
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network succeeds, cache fresh copy
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, responseClone).catch(() => {});
            } catch {}
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache if offline
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // HTML navigation fallback to index.html
        if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
          const fallbackIndex = await caches.match('./index.html') || await caches.match('/');
          if (fallbackIndex) return fallbackIndex;
        }

        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
