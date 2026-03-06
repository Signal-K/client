// Service Worker for Star Sailors PWA
// Keep cache scope narrow to avoid stale app chunks/API payloads after deploys.
const CACHE_VERSION = "v2";
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
// - API and Next runtime/chunks: network-only.
// - Selected static assets: stale-while-revalidate.
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

  if (isApiRequest || isNextRuntimeRequest) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "Network unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
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
        .catch(() => cachedResponse || new Response("Network error occurred", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        }));

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
