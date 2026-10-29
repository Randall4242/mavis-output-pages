/* 最小 service worker —— 只为让站点满足 PWA 安装条件, 不做任何缓存。
 *
 * 为什么需要它:
 *   Samsung Internet 在三星设备上会把满足条件的站点装成 WebAPK (真 app,
 *   没有地址栏和底部按钮栏); 条件不满足的只给一个「带浏览器标识的快捷方式」,
 *   点开还是浏览器窗口, 底部那排 返回/前进/主页/AI/收藏 一直在。
 *   少了 service worker 的站点在部分版本上直接被判为不可安装。
 *
 * 为什么不做缓存:
 *   这个页面每次打开都要拿最新的体重、饮食记录, 而且线上域名每次部署都会变。
 *   一旦 SW 开始缓存 index.html, 用户会拿到旧版本 —— 那个 bug 比地址栏难看得多。
 *   所以这里**一个字节都不缓存**, fetch 原样透传给网络。
 *
 * 只接管同源 GET:
 *   跨域的 Supabase API 请求不碰, 让浏览器走默认路径, 避免在 SW 上下文里
 *   重建跨域请求时踩到 mode 限制。
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 兜底: 万一将来有人加过缓存版本, 激活时清干净
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET') return;
  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch(e){ return; }
  if(!sameOrigin) return;                       // 跨域不管, 走浏览器默认
  event.respondWith(fetch(req));                // 纯透传, 不缓存
});

self.addEventListener('message', (event) => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
});
