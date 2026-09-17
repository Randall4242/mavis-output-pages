// Mavis Stock Tracker - Service Worker (v11)
// 缓存策略: stale-while-revalidate (优先缓存, 后台更新)
// v5: 缓存策略升级 — 缓存 dashboard.js + chart.umd.min.js + dashboard.json
// v6: UI 视觉升级 (elsewhere 母题 + 铜版画装饰) — 缓存 v6 强制刷新
// v8: mobile 装饰重排布 (Hero 4 角 96→64, Holding 卡左边框 6→5, 数字 48-56, tooltip bottom)
// v9: Hero 4 角藤蔓 → 4 边细密花纹带
// v10: 修花纹带超画面 + 花纹密度升级
// v11: 装饰从 SVG 几何花纹换成 AI 绘制铜版画 PNG (images/hero-border-h.png 1584×284 + images/hero-border-v.png 692×1376, 透明背景, 深棕 #3A2E26)

const CACHE_NAME = 'mavis-dashboard-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './dashboard.js',
  './vendor/chart.umd.min.js',
  './data/dashboard.json',
  './images/icon-192.svg',
  './images/hero-border-h.png',
  './images/hero-border-v.png',
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