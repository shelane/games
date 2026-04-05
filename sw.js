const CACHE = 'game-tracker-v1.1.0-alpha2';
const ASSETS = [
    '/games/',
    '/games/index.html',
    '/games/manifest.json',
    '/games/favicon.ico',
    '/games/icons/icon-192.png',
    '/games/icons/icon-512.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(response => {
                if (e.request.method === 'GET' && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE).then(cache => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => caches.match('/games/index.html'));
        })
    );
});

// Notify all open tabs when a new version is waiting
self.addEventListener('message', e => {
    if (e.data === 'skipWaiting') self.skipWaiting();
});