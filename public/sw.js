const APP_SHELL_CACHE = 'crossword-shell-v1'
const PUZZLE_CACHE = 'crossword-puzzles-v1'
const API_CACHE = 'crossword-api-v1'
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![APP_SHELL_CACHE, PUZZLE_CACHE, API_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin === self.location.origin && request.destination === 'document') {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE))
    return
  }

  if (url.origin === self.location.origin && (request.destination === 'style' || request.destination === 'script')) {
    event.respondWith(staleWhileRevalidate(request, APP_SHELL_CACHE))
    return
  }

  if (/\.(puz|ipuz|jpz|xd)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(request, PUZZLE_CACHE))
    return
  }

  if (url.protocol.startsWith('http')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE))
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'puzzle-sync') {
    event.waitUntil(notifyClients({ type: 'REQUEST_SYNC' }))
  }
})

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  for (const client of clients) {
    client.postMessage(message)
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  cache.put(request, response.clone())
  return response
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) return cached
    throw error
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  const networkFetch = fetch(request)
    .then((response) => {
      cache.put(request, response.clone())
      return response
    })
    .catch(() => cachedResponse)

  return cachedResponse || networkFetch
}
