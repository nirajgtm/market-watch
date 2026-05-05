// Market Watch service worker.
// Strategy: cache the app shell on install; for everything else, network first
// with a cache fallback. Briefs.json is fetched fresh-only (network bypass).
const SHELL_CACHE = "mw-shell-v4";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Always go to network for the briefs payload so users get fresh data.
  if (url.pathname.endsWith("/briefs.json")) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Network-first for everything else, falling back to the cached shell.
  event.respondWith(
    fetch(req)
      .then((res) => {
        // Update the shell cache for files we're tracking
        if (SHELL_FILES.some((p) => url.pathname.endsWith(p.replace("./", "")))) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
