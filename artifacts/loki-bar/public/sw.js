// public/sw.js
// Minimal app-shell cache so the PWA installs cleanly.
// Intentionally simple — this app is mostly real-time Firestore data, which
// should never be served stale from cache.
const CACHE_NAME = "loki-shell-v1"
const SHELL_ASSETS = ["/", "/logo.png", "/icon-192.png", "/icon-512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {})),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  )
})

// Network-first: never let a cached response shadow live Firestore-backed pages.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  )
})
