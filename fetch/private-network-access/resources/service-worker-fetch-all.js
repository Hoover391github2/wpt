self.addEventListener("install", () => {
    // Skip waiting before replacing the previously-active service worker, if any.
    // This allows the bridge script to notice the controller change and query
    // the install time via fetch.
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    // Claim all clients so that the bridge script notices the activation.
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(url));
  });
