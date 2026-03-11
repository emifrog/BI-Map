const CACHE_NAME = 'bi-map-cache-v2';
const DATA_CACHE_NAME = 'bi-map-data-v1';
const TILES_CACHE_NAME = 'bi-map-tiles-v1';

// Ressources critiques à pré-cacher
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/js/main.js',
    '/images/favicon.ico',
    '/images/bi.png',
    '/data/nice.json',
    '/data/bv.json',
    '/data/fires.json',
    '/fire.html',
    '/css/fire.css',
    '/js/fire.js',
    '/contact.html',
    '/css/contact.css',
    'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.css',
    'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js'
];

// Installation : pré-cache des ressources critiques
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
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

// Stratégie de fetch selon le type de ressource
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Tuiles Mapbox : cache-first (les tuiles changent rarement)
    if (url.hostname.includes('mapbox.com') && url.pathname.includes('/tiles/')) {
        event.respondWith(cacheFirst(event.request, TILES_CACHE_NAME));
        return;
    }

    // Données JSON locales : network-first avec fallback cache
    if (url.pathname.endsWith('.json')) {
        event.respondWith(networkFirst(event.request, DATA_CACHE_NAME));
        return;
    }

    // Autres ressources : network-first avec fallback cache
    event.respondWith(networkFirst(event.request, CACHE_NAME));
});

/**
 * Stratégie network-first : essaie le réseau, sinon le cache
 */
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

/**
 * Stratégie cache-first : utilise le cache, sinon le réseau
 */
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
