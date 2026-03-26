const CACHE_NAME = 'bi-map-cache-v4';
const DATA_CACHE_NAME = 'bi-map-data-v3';
const TILES_CACHE_NAME = 'bi-map-tiles-v1';

// Ressources locales a pre-cacher
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './js/main.js',
    './images/favicon.ico',
    './images/bi.png',
    './images/bi-hs.png',
    './fire.html',
    './css/fire.css',
    './js/fire.js',
    './contact.html',
    './css/contact.css'
];

// Donnees JSON (cache separe)
const DATA_TO_CACHE = [
    './data/fires.json'
];

// Installation : pre-cache resilient (fichier par fichier, sans bloquer si un echoue)
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then((cache) =>
                Promise.all(
                    ASSETS_TO_CACHE.map((url) =>
                        cache.add(url).catch((err) =>
                            console.warn('SW: echec cache', url, err.message)
                        )
                    )
                )
            ),
            caches.open(DATA_CACHE_NAME).then((cache) =>
                Promise.all(
                    DATA_TO_CACHE.map((url) =>
                        cache.add(url).catch((err) =>
                            console.warn('SW: echec cache data', url, err.message)
                        )
                    )
                )
            )
        ]).then(() => self.skipWaiting())
    );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    const validCaches = [CACHE_NAME, DATA_CACHE_NAME, TILES_CACHE_NAME];
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((name) => !validCaches.includes(name))
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// Strategie de fetch selon le type de ressource
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Ignorer les requetes non-GET
    if (event.request.method !== 'GET') return;

    // Tuiles Mapbox : cache-first
    if (url.hostname.includes('mapbox.com') && url.pathname.includes('/tiles/')) {
        event.respondWith(cacheFirst(event.request, TILES_CACHE_NAME));
        return;
    }

    // Donnees JSON locales : network-first
    if (url.pathname.endsWith('.json')) {
        event.respondWith(networkFirst(event.request, DATA_CACHE_NAME));
        return;
    }

    // Ressources locales : network-first
    if (url.origin === self.location.origin) {
        event.respondWith(networkFirst(event.request, CACHE_NAME));
        return;
    }
});

async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw e;
    }
}

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (e) {
        throw e;
    }
}
