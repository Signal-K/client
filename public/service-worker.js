// Service Worker for Star Sailors PWA
// Keep cache scope narrow to avoid stale app chunks/API payloads after deploys.
const CACHE_VERSION = "v3";
const CACHE_NAME = `star-sailors-static-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

// Only pre-cache truly static shell assets.
const CACHE_URLS = [
  OFFLINE_URL,
  "/manifest.json",
  "/favicon.ico",
  "/assets/Captn.jpg",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // addAll fails atomically if any resource is unavailable; catch to avoid
        // blocking install when offline or when an asset is temporarily missing.
        return cache.addAll(CACHE_URLS).catch((err) => {
          console.warn("Service worker: pre-cache partially failed, continuing install.", err);
        });
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error("Service worker install failed:", err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event strategy:
// - Navigations: network-first with offline fallback.
// - API, Next runtime/chunks, and application routes: browser/network managed.
// - Selected static assets: stale-while-revalidate.
//
// Next.js route-data requests use application URLs such as `/game?_rsc=...`
// without `request.mode === "navigate"`. Treating every remaining GET as a
// static asset cached stale RSC payloads and manufactured 408 responses when a
// route-data request failed. Only explicitly static URLs belong in this cache.
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const isApiRequest = url.pathname.startsWith("/api/");
  const isNextRuntimeRequest = url.pathname.startsWith("/_next/");
  const isNavigation = request.mode === "navigate";
  const isCacheableStaticAsset =
    CACHE_URLS.includes(url.pathname) ||
    url.pathname.startsWith("/assets/") ||
    /\.(?:avif|gif|ico|jpe?g|json|mp3|mp4|png|svg|wav|webm|webp|woff2?)$/i.test(url.pathname);

  if (isApiRequest || isNextRuntimeRequest) {
    // Let the browser and Next.js observe the real response/error.
    return;
  }

  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  if (!isCacheableStaticAsset) {
    // Application routes and RSC requests must never enter the static cache.
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      // stale-while-revalidate for static assets
      return cachedResponse || networkPromise;
    })
  );
});

// Background sync for offline actions (optional enhancement)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement any background sync logic here
  console.log("Background sync triggered");
}

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
