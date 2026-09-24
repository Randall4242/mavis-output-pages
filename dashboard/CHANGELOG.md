# Mavis Stock Tracker Dashboard — Changelog

按 dashboard_fix1.md plan P3-B 实施。footer 简版只保留版本号 + 日期 + 母题,变动摘要归档到此文件。

---

## v32.11 · 2026-09-24 · 总盈亏% 分母改净投入

- **后端 summary 默认分母改 net_invested (净投入)**: user 9-24 反馈 "同一笔钱反复买卖, 累计投入做分母偏大", 选 (c) 算法。render_dashboard.py compute_summary 加 `net_invested` 字段 (= 当前 active 持仓总成本 = 还留在市场里的钱), `summary.total_pnl_pct` 默认改基于 net_invested 算。同时输出 `total_pnl_pct_initial` (旧, 累计投入) 和 `total_pnl_pct_net` (新, 净投入), initial_principal 字段保留向后兼容
- **chart-benchmark my_portfolio 同步改 net_invested 算法**: 每日 cum_pct = 当日 active 持仓成本 (动态) 做分母, 跟 summary 同口径。历史每个日期 net_invested 不同, 反映"当时还在市场里的钱的盈亏率"。末条 = summary.total_pnl_pct 跟 user 期望对齐 (v32.9 已 include today)
- **settings tab 文案更新**: 描述改 "默认用净投入算总盈亏%, 同一笔钱反复买卖不会重复计", placeholder 改 "留空: 净投入 (当前持仓总成本)"
- 4 处版本号同步 v32.11

---

## v32.10 · 2026-09-24 · tooltip 改回持仓盈亏 + 账户资金设置

- **chart-pnl-trend tooltip 改回持仓盈亏**: v32.8/v32.9 chart line 改 realized_pnl (累计已实现), tooltip 跟 chart line 一致也用 realized_pnl。user 9-24 反馈 "悬浮窗应该还是持仓盈亏金额的数字" — tooltip 跟 chart line 解耦, tooltip 改读 `series[i].total_pnl` (当日浮盈, 即持仓盈亏)
- **settings tab 启用 (账户资金)**: 用户 "同一笔钱反复买卖, 累计投入做分母偏大" 反馈 → 加 settings input "账户资金 (元)", localStorage 保存 (`mavis.accountFunds`), renderThreeSeg 用它覆写总盈亏% `(floating + realized) / account_funds × 100`。留空 → fallback 后端累计投入 (`summary.total_pnl_pct`)。3 tab 三段式 "③ 总投资盈亏" 卡片百分比跟着改
- 4 处版本号同步 v32.10

---

## v32.9 · 2026-09-24 · 用户反馈修 3 处

- **chart-pnl-trend 首次渲染也用 realized_pnl**: v32.8 只改了 `appendChartsWith` + `updatePnlTrendChartFull` 两条路径, 但 `renderPnlTrendChart` (首次 new Chart) 仍用 `s.total_pnl` → 刷新页面后图表显示持仓盈亏, 切 closed-trades 再切回 analysis 才走 `updatePnlTrendChartFull` 切回 realized_pnl。v32.9 把 `renderPnlTrendChart` 也改 `realized_pnl != null ? realized_pnl : total_pnl`, 三条路径一致
- **closed-trades tab CSS 改 class selector**: v32.8 用 `.seg:nth-of-type(2)` 还是错的 — 5 元素全是 div, nth-of-type 按 tag name 算 div 选第二个 div = `seg-op-plus` (一个 `+`), 不是 seg, 卡片显示 + 没数字。v32.9 给 3 个 seg 加显式 class (`seg-floating` / `seg-realized` / `seg-total`), CSS 改用 `.seg-realized` selector, 不靠 nth-* 位置选择
- **chart-benchmark include today (跟 summary 卡片同口径)**: 后端 `compute_benchmark_from_holding_pnl` 老 9-18 行为把 series 截到 `yesterday`, 所以 `my_portfolio` 末条是 9-23 cum_pct (-1.46%), 跟今天三段式 summary 总盈亏 (9-24 -2.72%) 差 1 个交易日。v32.9 删 `if d <= yesterday` 截断, my_portfolio 末条 = today cum_pct = summary.total_pnl_pct 同口径
- 4 处版本号同步 v32.9

---

## v32.8 · 2026-09-24 · 用户反馈调整

- **chart-pnl-trend 改用 realized_pnl 序列**: dashboard.js `appendChartsWith` + `updatePnlTrendChartFull` 优先读 `pnl_series[].realized_pnl`(后端新增字段),fallback `total_pnl`。index.html chart-title 改"已实现盈亏 · 累计",section-title 改"已实现盈亏趋势"
- **closed-trades tab CSS nth-child bug**: v24.0 + v27.0 累积错位,三段 HTML 5 元素 (seg/seg-op/seg/seg-op/seg),nth-child(2) 选到 seg-op-plus,seg 都没选中,实际显示 nth-child(5) 也就是"③ 总投资盈亏",headpiece 标题写"已实现盈亏"。改用 `.seg:nth-of-type(2)` (第二个 seg 元素,不算 seg-op),现在 closed-trades tab 正确显示"② 已实现盈亏"数字 (+873.2)
- **后端 pnl_series 加 realized_pnl**: render_dashboard.py compute_pnl_series 算累计已实现盈亏 (FIFO 配对),每条 pnl_series 加 `realized_pnl` 字段,跟 summary.realized_pnl_abs (今日 +873.2) 一致
- 4 处版本号同步 v32.8

---

## v32.6 · 2026-09-23 · cleanup

plan **P4-C** + **P4-D** 实施

- **P4-C**: CSS 16 处 `v22.X` 版本号修订史注释清理(`v22.27` Liquid Glass / `v22.28` mobile nav.tabs / `v22.29` logo+meta / `v22.30-v27.0` 三段式算式 / `v22.31` mobile 5 列 / `v22.34` gap / `v22.36` flex column),全部移到 CHANGELOG.md。CSS 注释只保留"为什么这样" (设计意图),不保留"改了什么" (历史信息)。
- **P4-D**: sw.js CACHE 列表加 `./images/icon-512.svg`(manifest.json 早就引了 192+512,但 sw.js 只预缓存 192 → PWA 离线时 512 找不到)。二选一选了 (a) 加 512 缓存,避免 manifest 定义跟 sw cache 不一致。
- 4 处版本号同步 v32.6。

## v32.5 · 2026-09-23 · 加固

plan **Phase 3** 实施 — 5 项加固

- **P3-A** dashboard.js line 2 注释版本号 v32.5 (9-20 硬规则保证,自动同步)
- **P3-B** footer 文字清理 (CSS 关键字从 footer 移除) + 创建 `CHANGELOG.md` 归档变动摘要
- **P3-C** renderHoldings `change_amount` 加 NULL guard(`if (h.change_pct != null && h.change_amount != null)`,后端漏字段不崩)
- **P3-D** appendChartsWith 改用预转 Map 替代 `.find()` O(N):`myMap.get(fullDate)` 替代 `(bench.my_portfolio || []).find(x => x.trade_date === fullDate)`,append N day 时 3N find → 3 + N Map lookup
- **P3-E** t.side 三元映射 buy/sell/dividend/fee → 显示文本 + 颜色 class,其他值兜底原值:`({buy:'up',sell:'down'})[t.side] || ''` 配 class,`({buy:'买',sell:'卖',dividend:'分红',fee:'费用'})[t.side] || t.side` 配文本

## v32.4 · 2026-09-22 · cleanup

plan **P2-C** + **P4-A** 实施

- 公开仓根 `dashboard.js` / `sw.js` / `preview.html` + `dashboard/i18n.js` 移到 `archive/legacy-v4/`(4 个废弃文件 + README 标注 deprecated)
- 私有仓 `mavis-output` + `mavis-output-backup` 根 `i18n.js` 同步移到 `archive/legacy-v4/`
- 保留私有仓根 `dashboard.js` / `sw.js`(私有仓生产入口,非冗余)
- live URL `/mavis-output-pages/dashboard.js` + `sw.js` + `preview.html` + `dashboard/i18n.js` → 404(死/冗余代码不再服务)

## v32.3 · 2026-09-22 · hotfix

- **修今日 tab 仍留 ~1992px 空白 bug**(`updateTabStageHeight` 的 `if (h > 0)` 守卫把 `height=0` 情况挡掉,inline style 没设 → tab-stage 仍走 drawer 默认 max 高度)
- 移除守卫,直接 `stage.style.height = h + 'px'`(含 0),今日 tab-stage 缩到 0,footer 紧贴 summary 底部
- 其他 tab(分析 1146 / 清仓 1992 / 设置 279)不变

## v32.2 · 2026-09-22 · polish

- **tab-stage 高度自适应每个 tab 内容长度**(.tab-drawer 加 `align-items: flex-start` + JS `updateTabStageHeight()` + 280ms `transition: height` 平滑过渡)
- 触发时机:changeTab / initTabs / renderCharts / window resize(debounce)/ `document.fonts.ready`
- 切到短 tab(设置)时 footer 自动往上贴,不留空白

## v32.1 · 2026-09-22 · polish

plan **P2-B** 实施 — trade-grid 5 cell 桌面失衡

- 累计手续费 cell `grid-column: 1 / -1` 横跨整行 + 米白底 + 深棕 2px 边 + 24px 字号(其他 20px)
- desktop 3 列布局:`3 + 1 + 1wide-row`
- mobile 2 列布局:`2 + 2 + 1wide-row`
- "累计手续费"两个 viewport 都视觉独占一行加大,信息层级突显

## v32.0 · 2026-09-22 · bugfix

plan **P2-A** 实施 — 切到 analysis tab 数据未加载静默(三个叠加根因)

- (1) `nav.tabs` click handler 只在 initTabs 内绑,initTabs 在 load 完成才跑,fetch 未完成时点 tab 无声无息
- (2) initTabs 强制重置 `drawer transform translateX(0)`,即使用户已切过也被覆盖
- (3) changeTab 守卫 `if (target === 'analysis' && this.data)` 在 fetch 未完成时跳过 renderCharts,charts 区永远空白 + carry-forward note 永远显示"数据加载中…"
- **修法**:
  - HTML `chart-canvas-wrap` 加 `<div class="chart-skeleton">` 默认显示
  - `bindNavTabs()` 独立方法 IIFE 启动时立即绑 nav.tabs click handler(DOMContentLoaded 后)
  - changeTab 总是 `this.currentTabIdx = idx`,drawer query 查 `.tab-drawer` 元素 fallback,即使 `this.drawer` 还没赋值也能视觉切 tab
  - initTabs 保留 currentTabIdx 不重置
  - renderCharts 成功 → `hideAllSkeletons()` 双保险隐藏
  - load() catch → `markSkeletonError()` 改 "加载失败,点击重试" + cursor pointer + 点击触发 load()
  - changeTab 内 `this.data` 未就绪 → `startChartsPolling()` 100ms ×100(10s 超时)轮询 → renderCharts

## v31.9 · 2026-09-22 · bugfix

- 提高横滑切 tab 阈值,`dx` 必须 ≥ `dy × 1.8` + threshold 80px(commit 阈值提高 60%),减少轻微偏移误触
- 今日 `+ =` 符号跟 seg-amount 数字行 baseline 对齐(`align-self center` → `flex-start` + `margin-top 50px`)
- closed-trades 卡片内容居中(`flex baseline` → `flex column` + `align-items center` + `text-align center`)

## v31.8 · 2026-09-22 · bugfix

- 撤销 `summary position: sticky top:0`(用户 9-22 反馈"顶部置顶卡片不需要固定在顶部,下拉时随页面滚动就行")
- summary 跟 hero 一起 document flow 随滚屏走

## v31.7 · 2026-09-22 · bugfix

- hero 从 tab-stage 内 → tab-stage 外(body level,放在 summary 之前)
- 部署后实测 today tab 时 summary 顶部 sticky 正确,hero 仍在 tab-stage 内(stage top=1307)看不到
- layout:`nav → hero(today-only, default flow) → summary(sticky top:0) → tab-stage(drawer) → footer`

## v31.6 · 2026-09-22 · bugfix

- 部署后实测 `summaryPosition='static'`(sticky 没生效)
- 根因:tab-stage `overflow:hidden` 阻止 sticky 在 tab-stage 内生效(CSS sticky 在 overflow:hidden ancestor 下失效)
- 修法:把 summary 移出 tab-stage 到 body level(header 之后,tab-stage 之前)

## v31.5 · 2026-09-22 · bugfix

- hero 跟 summary 都从 drawer 拆出,一起放到 tab-stage 顶部(drawer 之前)
- summary `position: sticky; top:0; z-index:2` 顶部 sticky
- hero dataset.tab-mode 切 today-only visibility(today → 'today',其他 → 'hidden')

## v31.4 · 2026-09-22 · bugfix

- 部署后实测今日 tab 顶部 hero 卡片(大数字 -1,938 元 -7.70%)消失了
- 根因:v31.3 把 summary 放在 tab-stage 顶部(drawer 之前),drawer 内 page-today 第一个 child(hero)被挤到 summary 下面 1165 px
- 调换位置:drawer 在前(hero 顶部可见),summary 在后

## v31.3 · 2026-09-22 · bugfix

- 分析 / 清仓&交易 tab 顶部置顶卡片不见了(mini 三段 + mini 持仓 / 已实现盈亏)
- 根因:v31.0 wrap 把 summary 误放进 page-today 内,切到非今日 tab 时 summary 跟 page-today 一起被 drawer 切走
- 修法:把 summary 从 page-today 移到 tab-stage 内 tab-drawer 外面

## v31.2 · 2026-09-22 · bugfix

- v31.1 切到非今日 tab 内容还是不显示
- 根因:v31.0/v31.1 `.tab-drawer` 自带 `overflow:hidden` + `transform translateX` 同时,浏览器对 transformed element 的 overflow 裁剪行为不稳定
- 修法:加 `.tab-stage` 外壳负责 overflow:hidden(不 transform),`.tab-drawer` 内层负责 transform。overflow 边界跟 transform 解耦
- 跨 session 接手必知: transformed element 上不要同时设 overflow:hidden,必须分两层(外层 overflow,内层 transform)

## v31.1 · 2026-09-22 · bugfix

- swipe 切到 analysis / settings 后内容不显示,实际展示 closed-trades
- 根因:v31.0 HTML wrap 顺序是 `today → closed-trades → analysis → settings`,但 tabOrder + nav.tabs 顺序是 `today → analysis → closed-trades → settings`
- 修法:HTML 调换 page-analysis 与 page-closed-trades 位置
- 跨 session 接手必知:drawer 横排顺序必须跟 nav.tabs + tabOrder 严格一致

## v31.0 · 2026-09-22 · 重构

- 触屏横滑切换 tab(native iOS page swipe 体验):整个 drawer 4 page 一起跟手指方向推移,能看到下一 page 从边缘 peek 进来
- HTML wrap 5 个 sections(hero + summary + closed-trades + analysis + settings)到 `.tab-drawer > .tab-page × 4`
- CSS .tab-drawer:`flex` 横排 + `overflow hidden` + `touch-action pan-y`
- JS changeTab 重构成 drawer transform(translateX(-idx * 100%))
- JS initSwatch 支持 swipe peek preview(rubber band 0.3 比例)

## v30.0 · 2026-09-21 · 触屏横滑切 tab 初版

- 重构 initTabs → 拆出 named method `changeTab(target)`
- 加 `initSwipeTabs`:touchstart/move/end on document.body,横移 > 50px + 时间 < 500ms + 不在 chart/table 内触发

## v29.0 · 2026-09-21 · 反馈调整 round 6

- 撤销 v28.0 `.seg::before` + mask,改回 `.seg border-right` 直接
- `.seg-op` 加 `padding 0.4em + background var(--bg-card) + border-radius 50%`,形成白色圆形 background 略大于 symbol

## v28.0 · 2026-09-21 · 反馈调整 round 5

- `.seg border-right` 改用 `::before` 伪元素 + `mask-image` 让 symbol 高度范围内 border 透明,形成"border 中段留空"镂空效果

## v27.0 · 2026-09-21 · 反馈调整 round 4

- 三段白底面积真正等宽:grid `1fr auto 1fr auto 1fr` → `1fr 1fr 1fr`
- `.seg-op` 改 `position: absolute` + `left: 33.333% / 66.667%` + `transform translateX(-50%)` 浮动在 1/3 + 2/3 borders 上

## v26.0 · 2026-09-21 · 反馈调整 round 3

- 三段 column 严格等宽:`1fr` → `minmax(0, 1fr)`(desktop + mobile 同步改)
- 之前 `1fr` 默认 `minmax(auto, 1fr)`,内容 min-content 撑开 column,持仓 column 比另外两段窄

## v25.0 · 2026-09-21 · 反馈调整 round 2

- 今日 tab `+ =` 符号:`align-self center` → `flex-start` + `margin-top 50px`,跟 seg-amount 数字行 baseline 对齐
- closed-trades 已实现盈亏卡片:`flex baseline` → `flex column` + `align-items center` + `text-align center`,内容垂直堆叠水平居中

## v24.0 · 2026-09-21 · 反馈调整

- **P1-C 反悔**: hero 回归 tab-pane#tab-today,只在今日 tab 显示(跨 tab 撤掉)
- closed-trades nth-child(3) → nth-child(5):修 CSS 选错 bug,卡片数字从总投改回已实现
- analysis tab 关 `.seg-op`(不需要 `+ =` 符号) + 两列 stretch 对齐

## v23.0 · 2026-09-21 · Fix Round 1

- **P1-A** settings tab 视觉错乱:`settings-soon` class 加 opacity:0.5 + cursor:not-allowed + `#tab-settings` pane 真显示(`placeholder pane` 接出)
- **P1-B** carry-forward 兜底:HTML 默认文本 hardcode 改"数据加载中…",异常路径不显示过期值
- **P1-D** 港股后缀契约漏洞:holdings[]/closed_holdings[] 加 `market` 字段,前端按 market 拼后缀,schema_version 升 3
- 风险:后端一旦推真实港股(00700.HK 腾讯 / 09988.HK 阿里),显示成 `00700.SH` 错误

## v22.x · 2026-09-20 · 视觉迭代

- v22.27-v22.43 多次 border + decoration 微调
- v6 视觉迭代历史(铜版画装饰 hero 4 角 / 章节分隔符 / 持仓卡左边框)

---

**4 处版本号同步硬规则**(9-20 user-pinned):
每次 commit 必同步 `index.html footer` + `dashboard.js?v=X.X` query string + `dashboard.js line 2 注释` + `sw.js CACHE_NAME`。漏掉 user 看页面不知道是新版本,会怀疑没生效。
---

## v32.7 (2026-09-23) — mobile UX polish (2 项)

### 任务 2: closed-trades 标题 "已清仓" 挤两行 fix
- **症状**: S24 (360×800) 清仓 tab 标题 "已清仓" 被挤压成两行 ("已清" + "仓"), 后面 count span "2 只 · 累计实现 +547.20 · 释放本金 16,247.30" 顶开 title 宽度
- **修法**: mobile @media (max-width: 600px) 内 `.section-title { flex-wrap: wrap; row-gap: 4px; }` + `.section-title > .count { flex-basis: 100%; white-space: normal; word-break: break-word; }`
- **效果**: title "已清仓" 单行大字, count span 拆下一行独占
- **desktop 不动**: gap 12px 还够用, 没破坏现有 desktop 布局

### 任务 3: summary 切 tab fade transition
- **症状**: 切 tab 时 summary 直接 swap 形态 (today→analysis/closed/settings), 视觉上略生硬
- **修法**: CSS `.summary { transition: opacity 0.18s ease-out; } .summary.switching { opacity: 0; }` + JS changeTab 加 needsFade guard + _summaryFadeTimer 锁防快速连切
- **机制**: 
  - needsFade = prevTabMode && prevTabMode !== target (避免初次加载空白)
  - 加 .switching (同步, opacity 0) → 切 dataset.tabMode → 100ms 后移除 .switching (opacity 0→1, 0.18s transition)
  - 锁 this._summaryFadeTimer: 快速连切时 clearTimeout 上次 timer, 只 fade-in 一次 (实测 60ms 内 3 次切 tab 只 fade-in 1 次)
- **不影响**: drawer transform animation (并行), chart renderCharts (并行), hero dataset.tabMode 切换 (并行)
