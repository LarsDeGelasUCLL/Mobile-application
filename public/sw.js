// Service worker for the web build (registered by useServiceWorker).
// Network first: same-origin GET requests fall back to the browser cache when
// offline; everything else passes through untouched.

// Take over right away instead of waiting for old tabs to close.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Chrome throws on these cross-origin "only-if-cached" requests; let them pass.
  if (
    event.request.cache === "only-if-cached" &&
    event.request.mode !== "same-origin"
  ) {
    return;
  }

  // Only same-origin reads; writes and API calls (Supabase) go straight to the network.
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || new Response("Offline", { status: 503 });
    }),
  );
});
