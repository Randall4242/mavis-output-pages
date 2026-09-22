# archive/legacy-v4 · Deprecated Files (moved 2026-09-22, v32.4)

本目录是 v4-v5 时期的历史遗留代码,已废弃 (deprecated)。当前生产不要引用。

## 来源

来自 dashboard_fix1.md plan P2-C (Phase 2 应修 · 第 3 项) + P4-A 实施。
2026-09-22 移入 (commit v32.4)。

## 包含的文件

| 文件 | 字节 | 类型 | 移走原因 |
|---|---|---|---|
| `dashboard.js` | 52867 | 冗余副本 | 当前 production = `../dashboard/dashboard.js` (v32.3)。根目录副本没人引用 — `index.html` 引用 `<script src="dashboard.js?v=32.3">` 解析到 `dashboard/dashboard.js` 子目录。GitHub Pages 服务路径不进根目录。 |
| `sw.js` | 2346 | 冗余副本 | 当前 production = `../dashboard/sw.js` (v32.3)。Service Worker 注册在 `dashboard/index.html` 内,引用子目录的 sw.js。根目录副本没人引用。 |
| `preview.html` | 5280 | v22.3 mockup | v22.3 边框预览 mockup,临时设计稿。production 从未引用。 |
| `i18n.js` | 2772 | 死代码 | i18n 框架未启用 — `applyLang()` 找 `data-i18n` 属性,但 `index.html` 全无该属性。`lang-btn` 元素不存在。`toggleLang()` 永远不被调用。 |

## 验证 (实施日 2026-09-22)

- ✅ live URL `/mavis-output-pages/dashboard.js` → **404** (文件已移走)
- ✅ live URL `/mavis-output-pages/sw.js` → **404**
- ✅ live URL `/mavis-output-pages/preview.html` → **404**
- ✅ live URL `/mavis-output-pages/dashboard/i18n.js` → **404**
- ✅ live URL `/mavis-output-pages/dashboard/` 仍然正常服务 (`index.html` v32.3 production)

## 跨 session 接手必知

- 接手 stock-tracker dashboard 类任务时,**不要假设** 根目录 `dashboard.js` / `sw.js` 是当前 production
- 真实生产代码 = `dashboard/dashboard.js` (公开仓) / `index.html` 同目录 (私有仓)
- Service Worker 注册: `dashboard/sw.js` (公开仓) / `sw.js` (私有仓根)
- 若发现有人 commit 新代码到本目录,提醒: "这里只是 archive, 真实生产在 `../dashboard/` 或根目录"

## 关联

- 9-20 user-pinned 硬规则: footer / `?v=` / line 2 注释 / CACHE_NAME 4 处版本号同步
- dashboard_fix1.md P2-C: 根目录 dashboard.js / sw.js / preview.html 静默失败陷阱 (实施)
- dashboard_fix1.md P4-A: dashboard/i18n.js 死代码 (本目录内,实施)