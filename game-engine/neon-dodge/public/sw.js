
const CACHE_NAME = 'neon-dodge-v3';

const APP_FILES = [
    './',
    './index.html'
];

// Install the new service worker.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_FILES);
        })
    );

    self.skipWaiting();
});

// Activate the new worker and remove old caches.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );

    self.clients.claim();
});

// Network-first for HTML and generated configurations.
// Cache-first for other static assets.
self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    const isHTML = request.mode === 'navigate' ||
        url.pathname.endsWith('.html');

    const isGeneratedConfig =
        url.pathname.includes('/generated-configs/');

    if (isHTML || isGeneratedConfig) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, copy);
                        });
                    }

                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);

                    if (cached) {
                        return cached;
                    }

                    return new Response('Offline and resource unavailable', {
                        status: 503
                    });
                })
        );

        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, copy);
                    });
                }

                return response;
            })
            .catch(async () => {
                const cached = await caches.match(request);

                if (cached) {
                    return cached;
                }

                return new Response('Resource unavailable offline', {
                    status: 503
                });
            })
    );
});
