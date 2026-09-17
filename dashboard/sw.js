// Mavis Stock Tracker - Service Worker (v7)
// 缓存策略: stale-while-revalidate (优先缓存, 后台更新)
// v5: 缓存策略升级 — 缓存 dashboard.js + chart.umd.min.js + dashboard.json
//     不再缓存 PNG (改 client-rendered chart)
// v6: UI 视觉升级 (elsewhere 母题 + 铜版画装饰) — 缓存 v6 强制刷新, 不再 serve v5 旧 HTML/JS
// v7: Mobile 适配 (装饰重设计 + 字号缩 + tooltip bottom yAlign) — 缓存 v7 强制刷新

const CACHE_NAME = 'mavis-dashboard-v7';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './dashboard.js',
  './vendor/chart.umd.min.js',
  './data/dashboard.json',
  './images/icon-192.svg',
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