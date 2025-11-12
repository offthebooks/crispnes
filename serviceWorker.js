const CACHE_NAME = 'auto-cache'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (evt) =>
  evt.waitUntil(self.registration.navigationPreload.enable())
)
self.addEventListener('fetch', (evt) => evt.respondWith(handleFetch(evt)))

// Always fetch and cache new files, App is intentionally very lean
// Only fallback to cached files in an offline scenario (failed GET requests)
async function handleFetch({ request: req }) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const res = await fetch(req)
    if (req.method === 'GET' && res.ok) {
      await cache.put(req, res.clone())
    }
    return res
  } catch (err) {
    const cached = await cache.match(req)
    if (cached) return cached
    throw err
  }
}
