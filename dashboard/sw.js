// Mavis Stock Tracker - Service Worker
// 缓存策略: stale-while-revalidate (优先缓存, 后台更新)

const CACHE_NAME = 'mavis-dashboard-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './i18n.js',
  './images/pnl_trend.png',
  './images/benchmark_compare.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // 只处理 GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(networkRes => {
          // 缓存成功的网络响应
          if (networkRes.ok && event.request.url.startsWith(self.location.origin)) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => cached);  // 网络失败返缓存
      return cached || fetchPromise;
    })
  );
});