// Basic Service Worker
const CACHE_NAME = 'ktrh-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Basic pass-through fetch
    event.respondWith(fetch(event.request));
});
