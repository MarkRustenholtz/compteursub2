const CACHE_NAME_ESR = "cr-gendarmerie-esr-v1";
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
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // si trouvé en cache → retourne
      if (response) return response;
      // sinon → tente un fetch réseau
      return fetch(event.request).catch(() =>
        caches.match("/index.html") // fallback si offline
      );
    })
  );
});
