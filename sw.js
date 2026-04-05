const CACHE = 'game-tracker-v1';
const ASSETS = [
    '/games/',
    '/games/index.html',
    '/games/manifest.json',
    '/games/icons/icon-192.png',
    '/games/icons/icon-512.png'
];

// Install — cache all core assets
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — cache-first for assets, network-first for everything else
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(response => {
                // Cache successful GET responses for app assets
                if (e.request.method === 'GET' && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE).then(cache => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => caches.match('/games/index.html'));
        })
    );
});