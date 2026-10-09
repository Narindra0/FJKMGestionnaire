/*
 | Commentaire technique
 | Ce fichier contient les scripts JavaScript de l'interface : il améliore l'interactivité côté navigateur.
 */
// Cache PWA : nom versionné pour éviter qu'un ancien bundle reste chargé après déploiement.
// L'application React est servie depuis /react/ ; les assets filés (hash) sont cache-immutables.
const CACHE_NAME = 'fjkm-gestionnaire-v20261008-landing';
const ASSETS = [
  './',
  './react/index.html',
  './assets/img/logo.svg'
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
