const CACHE_NAME = "mgi-cs-v4";
const ASSETS = [
  "/",
  "/index.html",
  "/portfolio.html",
  "/runner.html",
  "/officer-dashboard.html",
  "/styles.css",
  "/app.js",
  "/portfolio.js",
  "/runner.js",
  "/officer-dashboard.js",
  "/pwa-init.js",
  "/manifest.webmanifest",
  "/images/loading_logo.png",
  "/images/mgi_logo.png"
];

// Files that should always be fetched fresh from network (network-first)
const NETWORK_FIRST = [".html", ".js", ".css", "manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const isNetworkFirst = NETWORK_FIRST.some((ext) => url.pathname.endsWith(ext)) || url.pathname === "/";

  if (isNetworkFirst) {
    // Network-first: always try to get latest from server, fall back to cache if offline
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html")))
    );
  } else {
    // Cache-first for images and other static assets
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response;
            }
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
            return response;
          })
          .catch(() => caches.match("/index.html"));
      })
    );
  }
});
