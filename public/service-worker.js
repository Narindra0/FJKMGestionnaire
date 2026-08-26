/*
 | Commentaire technique
 | Ce fichier contient les scripts JavaScript de l'interface : il améliore l'interactivité côté navigateur.
 */
// Cache PWA : nom versionné pour éviter que l'ancien CSS/JS reste chargé après correction.
const CACHE_NAME = 'fjkm-obligation-v20260709-communion-safe-v1';
const ASSETS = [
  './', './assets/css/app.css', './assets/js/app.js', './assets/js/dashboard.js', './assets/img/logo.svg'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => null));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => null);
    return response;
  }).catch(() => caches.match(event.request)));
});
