// Mavis Stock Tracker - Service Worker (v12)
// 缓存策略: stale-while-revalidate (优先缓存, 后台更新)
// v5-v10: 见前议
// v11: 装饰从 SVG 几何花纹换成 AI 绘制铜版画 PNG
// v12: 花纹缩小 (top/bottom 56→36, left/right 64→40) + 淡观感 (opacity 0.62) + 角过渡 smooth (CSS mask 边缘 fade out) + PNG 压缩 (1MB→334KB, 2.4MB→820KB)

const CACHE_NAME = 'mavis-dashboard-v12';
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