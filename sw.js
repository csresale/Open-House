const CACHE = "open-house-v9";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(FILES.map((f) => fetch(new Request(f, { cache: "reload" })).then((r) => (r.ok ? c.put(f, r) : null)).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Network first so updates show up right away; falls back to the saved copy when offline. */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then((r) => { if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
  );
});
