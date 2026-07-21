const CACHE = 'galaxy-sprite-checklist-v45';
const CORE = [
  './',
  './index.html',
  './styles.css?v=55',
  './published-design.js',
  './art-config.js?v=55',
  './data.js?v=55',
  './app.js?v=55',
  './manifest.webmanifest',
  './fonts/comic-neue-regular.woff2',
  './fonts/comic-neue-bold.woff2',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/variant-backgrounds/variant-well-base.webp',
  './assets/variant-backgrounds/variant-well-gold.webp',
  './assets/variant-backgrounds/variant-well-gummy.webp',
  './assets/variant-backgrounds/variant-well-galaxy.webp',
  './assets/variant-backgrounds/variant-well-cube.webp',
  './assets/variant-backgrounds/variant-well-gem.webp',
  './assets/variant-backgrounds/variant-well-quack.webp',
  './assets/variant-backgrounds/variant-well-holofoil.webp',
  './assets/page-backgrounds/page-bg-rare.webp',
  './assets/page-backgrounds/page-bg-epic.webp',
  './assets/page-backgrounds/page-bg-legendary.webp',
  './assets/page-backgrounds/page-bg-mythic.webp',
  './assets/header/main-header.webp?v=2'
];
const FRESH_CODE_FILES = new Set(['styles.css','art-config.js','data.js','app.js','manifest.webmanifest']);

async function freshOrCached(networkRequest, cachedResponse) {
  try {
    const response = await networkRequest;
    return response?.ok ? response : (cachedResponse || response);
  } catch {
    return cachedResponse || Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => Promise.all(CORE.map((path) => cache.add(path).catch(() => null))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (requestUrl.pathname.endsWith('/published-design.js')) {
    const cacheKey = new URL(event.request.url);
    cacheKey.search = '';
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(event.request,{ cache:'no-cache' });
        if (response.ok) await cache.put(cacheKey.toString(),response.clone());
        return response;
      } catch {
        return (await cache.match(cacheKey.toString())) || Response.error();
      }
    })());
    return;
  }

  const requestedFile = requestUrl.pathname.split('/').pop();
  if (FRESH_CODE_FILES.has(requestedFile)) {
    const networkUpdate = caches.open(CACHE).then((cache) =>
      fetch(event.request,{ cache:'no-cache' }).then(async (response) => {
        if (response.ok) await cache.put(event.request,response.clone());
        return response;
      })
    );
    event.waitUntil(networkUpdate.catch(() => null));
    event.respondWith(
      caches.match(event.request).then((cached) => freshOrCached(networkUpdate,cached))
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    const networkUpdate = fetch(event.request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put('./index.html',response.clone());
      }
      return response;
    });
    event.waitUntil(networkUpdate.catch(() => null));
    event.respondWith(
      caches.match('./index.html').then((cached) => freshOrCached(networkUpdate,cached))
    );
    return;
  }

  const networkUpdate = caches.open(CACHE).then((cache) =>
    fetch(event.request).then(async (response) => {
      if (response.ok) await cache.put(event.request,response.clone());
      return response;
    })
  );
  event.waitUntil(networkUpdate.catch(() => null));
  event.respondWith(
    caches.match(event.request).then((cached) => cached || networkUpdate).catch(() => networkUpdate)
  );
});
