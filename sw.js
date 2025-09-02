const CACHE_NAME = "cr-gendarmerie-esr-v1";
const urlsToCache = [
  "/",               // page principale
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
];

// Installation → mise en cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation → nettoyage des vieux caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      )
    )
  );
});

// Interception des requêtes → offline support
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Si on est hors ligne et que c'est une navigation
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        // Sinon on regarde si la ressource est en cache
        return caches.match(event.request);
      })
  );
});