const CACHE_NAME = 'bi-map-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/fire.html',
    '/contact.html',
    '/style.css',
    '/js/main.js',
    '/js/fire.js',
    '/js/casernes.js',
    '/css/style.css',
    '/images/favicon.ico',
    'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js',
    'https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.css'
];

// Installation du service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Stratégie de cache : Network First avec fallback sur le cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Copie de la réponse
                const responseClone = response.clone();
                
                // Mise en cache de la nouvelle ressource
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseClone);
                    });

                return response;
            })
            .catch(() => {
                // Si offline, on utilise le cache
                return caches.match(event.request);
            })
    );
});
