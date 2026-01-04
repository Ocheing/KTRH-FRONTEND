// sw.js
self.addEventListener('install', event => {
  console.log('Service worker installed');
});

self.addEventListener('activate', event => {
  console.log('Service worker activated');
});

self.addEventListener('fetch', event => {
  // Just use the network for now
  event.respondWith(fetch(event.request));
});