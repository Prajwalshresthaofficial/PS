const CACHE_NAME = 'prajwal-portfolio-v1';
const OFFLINE_PAGE = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about/index.html',
  '/blogs/index.html',
  '/contact/index.html',
  '/gallery/index.html',
  '/incometax/index.html',
  '/loan/index.html',
  '/share/index.html',
  '/sip/index.html',
  '/terms/index.html',
  '/tools/index.html',
  '/wacc/index.html',
  '/blogs/accounting-standards/index.html',
  '/blogs/motivation-&-mindset/index.html',
  '/blogs/personal-finance-tools/index.html',
  '/blogs/taxation-guide/index.html',
  '/blogs/time-management/index.html',
  '/style.css',
  '/script.js',
  '/about/style.css',
  '/blogs/style.css',
  '/contact/style.css',
  '/gallery/style.css',
  '/incometax/style.css',
  '/loan/style.css',
  '/share/style.css',
  '/share/script.js',
  '/sip/style.css',
  '/terms/style.css',
  '/tools/style.css',
  '/wacc/style.css',
  '/wacc/script.js',
  '/fav.png',
  '/picture.jpg',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      // Cache only available local assets, skip external CDNs for now
      const localAssets = STATIC_ASSETS.filter(asset => !asset.includes('http'));
      return cache.addAll(localAssets).catch((error) => {
        console.log('Some assets failed to cache during install:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip external APIs and tracking
  if (url.origin !== location.origin) {
    return;
  }

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((response) => {
        // Try network first for fresh content
        return fetch(request).catch(() => {
          // If network fails, use cached version
          return response || caches.match(OFFLINE_PAGE);
        });
      })
    );
    return;
  }

  // For other requests (CSS, JS, images)
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Fallback for failed requests
        if (request.destination === 'image') {
          return caches.match('/fav.png');
        }
        return new Response('Offline - Resource not available', { status: 503 });
      });
    })
  );
});
