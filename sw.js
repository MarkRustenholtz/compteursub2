const CACHE_NAME = 'cr-gendarmerie-qrcode-v9'; // ⚠️ change le numéro à chaque mise à jour
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Installation : mise en cache des fichiers de base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation : suppression des anciens caches + notification nouvelle version
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Supprimer les anciens caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );

      // Informer les pages clientes qu'une nouvelle version est prête
      const clientsArr = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsArr) {
        client.postMessage({ type: 'NEW_VERSION' });
      }
    })()
  );
  self.clients.claim();
});

// Fetch : réseau prioritaire, cache en secours
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return caches.match(event.request);
      })
  );
});
