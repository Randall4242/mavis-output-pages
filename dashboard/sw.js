// Mavis Stock Tracker - Service Worker (v12)
// 缓存策略: stale-while-revalidate (优先缓存, 后台更新)
// v5-v10: 见前议
// v11: 装饰从 SVG 几何花纹换成 AI 绘制铜版画 PNG
// v12: 花纹缩小 + opacity 0.62 + 角过渡 smooth + PNG 压缩
// v13: 微调再缩 (top/bottom 22, left/right 22, opacity 0.5, mask 22)
// v14: 删 4 边 PNG 花纹带 → 4 角 SVG 小纹章 (corner-emblem)
// v15: fallback — 用 v11 浓密铜版画 PNG, 改 layout: top+bottom 各 1 张 no-repeat 居中, opacity 0.38, 保留 4 角纹章
// v21: 删 v20 全部装饰 (太丑: 4 角啃一口 + 短刻线像订书钉 + 中点圆印像眼睛), 只留 hero 1px border (CSS 已自带)
// v22: 用户反馈 — 4 角斜切跟卡片直角冲突, 改为沿 4 边画 guilloche 编织花纹 (2 条 sine 互绕), 4 角留 6px 空白, stroke-linecap=round 让端点圆头丝滑过渡
// v32.23: install + fetch 都强制 cache-bust 绕过 github.io Fastly CDN stale cache
//         (之前 v32.22 推送 8.5h 后 live github.io 还是 v32.21, CDN 没 invalidate)
//         install 用 cache: 'reload' 强制 fresh fetch, fetch 用 cache: 'no-store' + URL 加 _t 时间戳

const CACHE_NAME = 'mavis-dashboard-v32-26';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './dashboard.js',
  './vendor/chart.umd.min.js',
  './data/dashboard.json',
  './images/icon-192.svg',
  './images/icon-512.svg',
  './images/hero-border-h.png',
  './images/hero-border-v.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // cache: 'reload' 强制 fresh fetch, 绕过 HTTP cache (含 github.io CDN)
      .then(cache => Promise.all(ASSETS.map(url =>
        fetch(new Request(url, { cache: 'reload' }))
          .then(res => { if (res.ok) cache.put(url, res); })
          .catch(e => console.warn('[sw] install cache fail for', url, e))
      )))
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

  const reqUrl = event.request.url;
  // 同源请求加 cache-bust 时间戳 query param + cache: 'no-store'
  // 强制 github.io CDN 走 fresh fetch (绕过 stale cache)
  const isSameOrigin = reqUrl.startsWith(self.location.origin);
  const bustUrl = isSameOrigin
    ? reqUrl + (reqUrl.includes('?') ? '&' : '?') + '_=' + Date.now()
    : reqUrl;

  event.respondWith(
    fetch(bustUrl, { cache: 'no-store' })
      .then(networkRes => {
        // 用原 URL (不带 _t) 作 cache key, 否则 cache 里全是带 _t 的 key
        if (networkRes.ok && isSameOrigin) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkRes;
      })
      .catch(() => caches.match(event.request))  // 离线 fallback
  );
});