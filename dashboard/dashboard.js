/**
 * Mavis Stock Tracker — Dashboard.js v32.21 (2026-09-25)
 * 拉 /data/dashboard.json, 填充 hero / 三段式 / 持仓 / 已清仓 / 交易 + 渲染 2 张 Chart.js 图
 *
 * 视觉风格: elsewhere.news 母题 + 铜版画装饰 (Round 1 收口)
 * 比例分母副行: 副行 in-line (Round 2 Option A)
 * carry_forward: 纯文字注释 (Round 3 Option D)
 * v23.0 Fix Round 1:
 *   - P1-A settings tab 视觉: 走完整切 pane 路径, placeholder pane 真显示
 *   - P1-B carry-forward 兜底: HTML hardcode 改 "数据加载中…", 异常路径不显示过期值
 *   - P1-C Hero 跨 tab 永久: hero 从 tab-pane#tab-today 抽出, 4 tab 都可见
 *   - P1-D 港股后缀契约: holdings/closed_holdings 支持可选 market 字段 (兜底 .SH)
 * v24.0 反馈调整 (用户 9-21 验证后反馈):
 *   - P1-C 反悔: hero 回归 tab-pane#tab-today, 只在今日 tab 显示 (跨 tab 撤掉)
 *   - closed-trades nth-child(3) → nth-child(5): 修 CSS 选错 bug, 卡片数字从总投改回已实现
 *   - analysis tab 关 .seg-op (不需要 + = 符号) + 两列 stretch 对齐
 * v25.0 反馈调整 round 2 (用户 9-21 验证后反馈):
 *   - 今日 tab + = 符号: desktop align-self center → flex-start + margin-top 50px,
 *     跟 seg-amount 数字行 baseline 对齐 (替代 居中在 .seg 4 行 content 中心导致符号偏低)
 *   - closed-trades 已实现盈亏卡片: flex baseline → flex column + align-items center +
 *     text-align center, 内容垂直堆叠水平居中
 * v26.0 反馈调整 round 3 (用户 9-21 验证后反馈):
 *   - 三段 column 严格等宽: 1fr → minmax(0, 1fr) (desktop + mobile 同步改),
 *     之前 1fr 默认 minmax(auto, 1fr), 内容 min-content 撑开 column, 持仓 column
 *     比另外两段窄, 两条竖向分割线 (seg 1 右 border + seg 3 右 border) 在卡片内
 *     偏左, 跟中间符号对不上. minmax(0, 1fr) 强制 1fr 不被内容撑开, 三段 column
 *     严格 1/3 宽度, 两条分割线落在卡片 33% / 66% 位置 (水平均匀分布).
 *     mobile overflow 已有 text-overflow: ellipsis 截断, OK.
 * v27.0 反馈调整 round 4 (用户 9-21 像素级验证后反馈):
 *   - 三段白底面积真正等宽: grid 1fr auto 1fr auto 1fr → 1fr 1fr 1fr (去掉两个
 *     auto 列), .seg-op 改 position: absolute + left: 33.333% / 66.667% +
 *     transform translateX(-50%) 浮动在 1/3 + 2/3 borders 上, 背景 transparent +
 *     box-shadow none, 不再视觉扩展相邻 block 的白底面积.
 *     之前 v26.0 .seg-op 在 auto 列里 + 白色背景 + box-shadow 各扩 2px, 让已实现
 *     + 总投两段的白底比持仓宽 60+ px (实测持仓 311 px, 已实现 375 px, 总投 374 px,
 *     差异 64 px), 三段白底面积不等.
 *   - closed-trades 模式 nth-child 同步更新 (grid 5 列 → 3 列, 已实现从
 *     nth-child(3) 变 nth-child(2)).
 * v28.0 反馈调整 round 5 (用户 9-21 反馈 borders 中段需要留空 + symbol 下移到视觉 Y 轴中心):
 *   - .seg border-right 改用 ::before 伪元素 (position: absolute 1px 宽) 模拟,
 *     然后用 mask-image (linear-gradient to bottom, alpha 0 at 26-67% vertical)
 *     让 symbol 高度范围内的 border 透明, 形成"border 中段留空"镂空效果.
 *     (之前 v26.0 box-shadow 也能做, 但 box-shadow 横向扩展会破坏三段白底等宽.
 *     用 mask 让 border 本身在某 vertical range 透明, 不影响横向宽度)
 *   - symbol 下移到 .seg visual Y 轴中心 (从 v27.0 跟 seg-amount 数字行对齐,
 *     改成跟 .seg 整体 vertical center 对齐): top: 54→64 desktop, 22→30 mobile.
 * v29.0 反馈调整 round 6 (用户 9-21 反馈 v28.0 mask 效果不理想, 改用 symbol 底层
 *   白色圆形 background 方案):
 *   - 撤销 v28.0 .seg::before + mask, 改回 .seg border-right 直接 (border 连续)
 *   - .seg-op 加 padding 0.4em + background var(--bg-card) + border-radius 50%,
 *     形成白色圆形 background 略大于 symbol (跨平台 em 单位同步 font-size),
 *     覆盖 border 一小段形成镂空, 跟 card 装饰风格统一 (跟 hero 4 角 + divider
 *     锚点圆点一脉相承).
 *   - 三段 column 白底因圆形 background 损失 < 15 px (从 v27.0 严格等宽 6 px 差异,
 *     移到 ~14 px 差异 = 4%), 但 borders 中段镂空 + 圆形凸起视觉比 v28.0 mask 更直接.
 * v30.0 反馈调整 round 7 (用户 9-21 询问 mobile 触屏横滑切换 tab):
 *   - 重构 initTabs → 拆出 named method changeTab(target), 让 swipe 完成后也能复用
 *   - 加 initSwipeTabs: touchstart/move/end on document.body, 横移 > 50px + 时间 < 500ms + 
 *     不在 chart-card/trade-grid/canvas 内触发 (避免干扰 chart pan + table scroll)
 *   - swipe 进行中显示 peek preview (active pane translateX 跟手 0.6 + opacity 衰减 0.4),
 *     边界 rubber band (0.3 比例有限反馈)
 *   - commit 后 280ms 飞出动画 + changeTab 切到下一/上一 tab
 *   - snap back 280ms (未达阈值时回到原位)
 * v31.0 反馈调整 round 8 (用户 9-21 反馈 v30.0 单 pane transform 看起来像"卡片滞留",
 *   想要 native iOS page swipe 体验 — 整个 drawer 4 page 一起跟手指方向推移, 能看到下一 page
 *   从边缘 peek 进来):
 *   - HTML wrap 5 个 sections (hero + summary + closed-trades + analysis + settings) 到
 *     .tab-drawer > .tab-page × 4 (page-today 含 hero + summary, 其他各含 1 pane).
 *     去掉 closed-trades / analysis / settings 的 hidden 属性 (drawer 控制 visibility).
 *   - CSS .tab-drawer: flex 横排 + overflow hidden + touch-action pan-y.
 *     .tab-page: flex 0 0 100% 各占 viewport.
 *   - JS changeTab 重构成 drawer transform (translateX(-idx * 100%)) 代替之前 hidden 切换,
 *     接 animMs 参数控制 transition 时长 (0 = no anim 用于 init, 280 = swipe commit + click).
 *   - JS initSwipeTabs 重写: 整个 .tab-drawer 1:1 跟手 (drawer.style.transform =
 *     translateX(calc(-currentIdx * 100% + dx px))), 边界 rubber band 0.3 比例.
 *     commit 后 drawer 动画 280ms 到目标 idx (transition + transform).
 *   - tabOrder 常量提到 module 级 (让 changeTab + initSwipeTabs 共用).
 * v31.1 bugfix (用户 9-22 反馈: swipe 切到 analysis / settings 后内容不显示, 实际展示 closed-trades.
 *   根因: v31.0 HTML wrap 顺序是 today→closed-trades→analysis→settings, 但 tabOrder +
 *   nav.tabs 顺序是 today→analysis→closed-trades→settings, drawer translateX(-100%) 切到 idx 1
 *   时实际偏移到 page-closed-trades. 修法: HTML 调换 page-analysis 与 page-closed-trades 位置,
 *   drawer 顺序 = tabOrder 顺序, changeTab('analysis', 280) 后 drawer 展示 page-analysis).
 *   教训: v31.0 wrap 时没注意 HTML 物理顺序, 假设顺序是 today/analysis/closed/... 实际是
 *   today/summary (今日) / closed-trades / analysis / settings. 跨 session 接手必知: drawer
 *   横排顺序必须跟 nav.tabs + tabOrder 严格一致, 不一致时 changeTab() 用错 idx 切到错 page.
 * v31.2 bugfix #2 (用户 9-22 反馈 v31.1 切到非今日 tab 内容还是不显示. 根因: v31.0/v31.1 .tab-drawer
 *   自带 overflow:hidden + transform translateX, 浏览器对 transformed element 的 overflow 裁剪
 *   行为不稳定. getBoundingClientRect 返回的 viewport 位置看似在 viewport 内, 但 elementFromPoint
 *   返回 BODY 说明元素被裁剪掉 — CSS overflow:hidden 在 transform 元素上 clipping reference frame
 *   行为不明确, transform 之前的 overflow bounds (-328 to 0 in drawer local) 把 page-analysis
 *   (在 drawer local x=328+) 裁掉, 实际渲染不出来.
 *   修法: 加 .tab-stage 外壳负责 overflow:hidden (不 transform), .tab-drawer 内层负责 transform.
 *   overflow 边界跟 transform 完全解耦. drawer width = 400% (= 4 page), 1 page = 25% of drawer,
 *   translateX(-idx * 25%) 让 drawer 偏移 1 page width. 跨 session 接手必知: transformed element
 *   上不要同时设 overflow:hidden, 必须分两层 — 外层 overflow, 内层 transform. 9-7 瞎归因教训 #8)
 * v31.3 bugfix (用户 9-22 反馈: 分析 / 清仓&交易 tab 顶部置顶卡片不见了 (mini 三段 + mini 持仓
 *   / 已实现盈亏). 根因: v31.0 wrap 把 summary 误放进 page-today 内, 切到非今日 tab 时 summary
 *   跟 page-today 一起被 drawer 切走. 修法: 把 summary 从 page-today 移到 tab-stage 内 tab-drawer
 *   外面 (跟 v29.0 之前 HTML 结构一致), summary 永远顶部可见, dataset.tabMode 切 4 种形态
 *   (today 完整 / analysis mini 三段 + mini 持仓 / closed-trades 已实现 + 单行 / hidden).
 *   跨 session 接手必知: summary 是 sticky 顶部卡片, 在 tab-drawer 外, 不参与 drawer translateX.
 *   之前 v22.x 时 summary 是独立 section, v31.0 wrap 时误放进 page-today, 9-22 用户反馈后才
 *   修复回 sticky 位置.)
 * v31.4 bugfix (用户 9-22 反馈 v31.3 今日 tab 顶部 hero 卡片 (大数字 -1,938 元 -7.70%) 消失了.
 *   根因: v31.3 把 summary 放在 tab-stage 顶部 (drawer 之前), drawer 内 page-today 第一个 child
 *   (hero) 被挤到 summary 下面 1165 px, 用户看不到 hero. 调换位置 — drawer 在前 (hero 顶部可见),
 *   summary 在后 (all 4 tab 都可见). today tab 顺序: nav → drawer(page-today 含 hero) → summary.
 *   教训: drawer 内第一个 child 会被推到 drawer 内容区顶部, drawer 上面不能放高 summary (会挤压).
 *   tab-stage 内 child 顺序: drawer 第一个 (含 tab-specific hero), summary 第二个 (tab-shared).
 *   跨 session 接手必知: hero 是 tab-specific 顶部卡片 (只在今日 tab 可见), summary 是 tab-shared
 *   卡片 (4 tab 都可见 + dataset.tabMode 切形态), 必须 drawer 在前 summary 在后, 不能反.)
 * v31.5 bugfix: hero 跟 summary 都从 drawer 拆出, 一起放到 tab-stage 顶部 (drawer 之前).
 *   summary `position: sticky; top:0; z-index:2` 顶部 sticky. hero dataset.tab-mode 切 today-only
 *   visibility (today → 'today', 其他 → 'hidden'). today tab 滚屏时 hero 出顶部, summary sticky
 *   顶部固定; 切到非今日 tab hero hidden, summary 仍顶部 sticky 切形态 (mini 三段 / 已实现).
 *   changeTab() 同时设 hero.dataset.tabMode + summary.dataset.tabMode. 跨 session 接手必知:
 *   tab-stage 内 child 顺序: hero (today-only, position default flow) → summary (sticky top:0,
 *   tab-shared) → drawer (切 page, 不含 hero 也不含 summary). 三者都在 overflow:hidden 的 stage 内,
 *   sticky summary 在 drawer 之前意味着 drawer 内容滚屏时 summary 顶部固定不动.)
 * v31.6 bugfix: 部署后实测 summaryPosition='static' (sticky 没生效). 根因: tab-stage overflow:hidden
 *   阻止 sticky 在 tab-stage 内生效 (CSS sticky 在 overflow:hidden ancestor 下失效). 修法: 把 summary
 *   移出 tab-stage 到 body level (header 之后, tab-stage 之前). sticky 直接生效.
 * v31.7 bugfix: 部署后实测 today tab 时 summary 顶部 sticky 正确, 但 hero 在 tab-stage 内 (stage top=1307),
 *   summary 下方 1165 px 看不到. 修法: hero 也移到 tab-stage 外 (body level), 放在 summary 之前.
 * layout: nav → hero (today-only, default flow) → summary (sticky top:0) → tab-stage (drawer) → footer.
 * today tab scroll=0: hero 顶部可见 (大数字 -1,938 元 -7.70%), summary 默认位置在 hero 之后 (510+).
 * 滚屏时 hero 出顶部, summary sticky 顶部固定.
 * 切到非今日 tab: hero hidden, summary sticky 顶部 0-1165 切形态 (mini / 已实现).
 * 跨 session 接手必知: tab-stage 内**只能放** drawer (切 page), 其他 sticky / tab-shared element
 * 必须在 tab-stage 外. 任何 drawer / stage overflow:hidden 都会破坏 sticky. 早期 v31.0 wrap
 * 时把 hero 跟 summary 都放进 drawer / stage, 导致今天 tab 顶部 hero 不见 + 分析/清仓 tab 顶部
 * summary 不见, 三次迭代 (v31.3 / v31.4 / v31.5) 才定位到根因. 教训: sticky element 必须
 * 在 overflow:hidden ancestor 之外, 否则 silently fail.)
 * v32.0 bugfix (用户 9-22 反馈: 切到 analysis tab 时数据未加载静默):
 *   根因 — 三个叠加:
 *     a) nav.tabs click handler 只在 initTabs 内绑, initTabs 在 load() 完成才跑. 用户 fetch
 *        未完成时点 tab, handler 没绑, click 无声无息, 完全没反应.
 *     b) initTabs 内 `this.drawer.style.transform = 'translateX(0)'` 强制重置 drawer, 即使
 *        changeTab 已经写过 currentTabIdx, 也被 initTabs 覆盖回 today tab.
 *     c) changeTab 守卫 `if (target === 'analysis' && this.data)` 在 fetch 未完成时跳过
 *        renderCharts, fetch 完成 render(data) 跑了但 renderCharts 没补触发, charts 区
 *        永远空白 + carry-forward note 永远显示 "数据加载中…".
 *   修法 —
 *     1) HTML: chart-canvas-wrap 内加 <div class="chart-skeleton"> 默认显示
 *     2) JS bindNavTabs() 独立方法, IIFE 启动时立即绑 nav.tabs click handler (DOMContentLoaded
 *        后), fetch 未完成时点 tab 也能触发 changeTab. initTabs 不再绑 click, 只负责 swipe + drawer.
 *     3) JS changeTab: 总是 this.currentTabIdx = idx; 用 drawer query 查 .tab-drawer 元素 fallback,
 *        即使 this.drawer 还没赋值也能视觉切 tab. initTabs 保留 currentTabIdx (用户已切过就不重置).
 *     4) JS renderCharts 成功 → hideAllSkeletons() 双保险隐藏
 *     5) JS load() catch → markSkeletonError() 改 "加载失败,点击重试" + cursor pointer
 *        + 点击触发 load()
 *     6) JS changeTab analysis 内 this.data undefined → startChartsPolling() 100ms ×100
 *        (10s 超时) 轮询 this.data 就绪 → renderCharts. 超过改 "加载超时,请下拉刷新"
 * v32.2 polish (用户 9-22 反馈: 每个 tab 底部留白, 页面不能自适应长度):
 *   根因 — .tab-drawer 是 flex row, 默认 align-items: stretch 把 4 个 page 高度强制拉到 max.
 *     短 tab (设置) 内容少但 drawer 仍是今日 tab 的高, tab-stage 撑到 max, 短 tab 底部大量空白
 *     直到 footer.
 *   修法 —
 *     1) CSS .tab-drawer 加 align-items: flex-start (page 不被 flex stretch, 各自 content 高度)
 *     2) CSS .tab-stage 加 transition: height 280ms cubic-bezier(0.16, 1, 0.3, 1) 平滑过渡
 *     3) JS 加 updateTabStageHeight() 方法: tab-stage.style.height = 当前 active page.offsetHeight
 *     4) JS 触发时机: changeTab 末尾 (rAF 一帧) / initTabs 末尾 (初次进入) / renderCharts 末尾
 *        (chart 画完撑高) / window resize (debounce 200ms) / document.fonts.ready (字体异步加载)
 *
 * 数据契约 (dashboard.json schema_version=2 / 3):
 *   v2: holdings[]/closed_holdings[] 无 market 字段, 前端兜底 .SH
 *   v3: holdings[]/closed_holdings[] 补 market: 'SH'|'SZ'|'HK'|'US', 前端按 market 拼后缀
 *   meta: {generated_at, trade_date, source, schema_version}
 *   summary: {floating_pnl_abs/pct, realized_pnl_abs/pct, total_pnl_abs/pct,
 *              initial_principal, excess_csi300_pct, excess_sh_pct}
 *   holdings: [{code, name, market?, shares, cost, close, pnl_abs, pnl_pct, change_pct, change_amount, daily_pnl}]
 *   closed_holdings: [{code, name, market?, closed_at, cost_total, recv_total, realized_abs, realized_pct}]
 *   transactions_recent: [{trade_date, code, name, side, shares, price}]
 *   trade_summary: {buy_count, sell_count, total_buy_amount, total_sell_amount, total_fee}
 *   pnl_series: [{trade_date, total_cost, total_mkt, total_pnl, total_pct, cost_basis}]
 *   benchmark: {first_buy_date, my_portfolio:[{trade_date, cum_pct}],
 *               sh:[...], sz:[...], csi300:[...]}
 */
(function () {
  'use strict';

  const DATA_URL = 'data/dashboard.json';
  // v31.0: 4 tab 顺序常量提到 module 级, 让 changeTab + initSwipeTabs 都能引用
  const tabOrder = ['today', 'analysis', 'closed-trades', 'settings'];
  const $ = (id) => document.getElementById(id);

  // 中文习惯: 盈=红/涨, 亏=绿/跌 (跟视觉 token --accent-up/--accent-down 一致)
  const pnlClass = (x) => x > 0 ? 'up' : (x < 0 ? 'down' : 'neutral');

  const fmtMoney = (x) => x == null ? '—' : (x >= 0 ? '+' : '') + x.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const fmtMoneyAbs = (x) => x == null ? '—' : Math.abs(x).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const fmtMoneyBig = (x) => x == null ? '—' : Math.abs(x).toLocaleString('zh-CN', {minimumFractionDigits: 0, maximumFractionDigits: 0});
  const fmtPct = (x) => x == null ? '—' : (x >= 0 ? '+' : '') + x.toFixed(2) + '%';

  const App = {
    charts: {},
    dataCache: null,  // 上次 load 的 JSON, 用于 diff 增量更新 charts
    lastPnlLabels: null,  // pnl_series 头部指纹, diff 用来判断是否历史改动

    async load() {
      try {
        const r = await fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-cache' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        if (data.meta && data.meta.schema_version !== 2 && data.meta.schema_version !== 3) {
          console.warn('[dashboard] schema_version 不匹配, 当前=' + data.meta.schema_version);
        }
        this.data = data;

        const isFirstLoad = !this.dataCache;
        const diff = isFirstLoad ? { kind: 'full' } : this.diffData(this.dataCache, data);
        this.dataCache = data;

        // v32.0: data 到了, 隐藏所有 skeleton (切到 analysis 时 polling 触发 renderCharts 是另一码,
        // 但首次 load 后用户也可能已切到 analysis, 这边 hide 兜底)
        this.hideAllSkeletons();

        // 文字部分: 全量重画 (DOM 替换原子, 没有增量需求)
        this.render(data);

        if (isFirstLoad) {
          // 首次: 只 initTabs, chart 等切到分析 tab 时 ensureCharts 创建
          this.initTabs();
        } else {
          // 后续 load: 文字已重画, chart 用 diff 增量/full
          if (diff.kind === 'append') {
            this.appendChartsWith(diff.newDays);
          } else if (diff.kind === 'full') {
            // chart 存在 → 重设 data + update('none'); 不存在 → 等切 tab 时 ensure
            if (this.charts.pnlTrend) this.updatePnlTrendChartFull(data.pnl_series || []);
            if (this.charts.benchmark) this.updateBenchmarkChartFull(data.benchmark || {});
          }
          // 'noop' 啥都不干
          console.log('[load] diff=' + diff.kind + (diff.newDays ? `, newDays=${diff.newDays.length}` : ''));
        }
        return data;
      } catch (e) {
        this.showError('数据加载失败: ' + e.message);
        // v32.0: skeleton 改 "加载失败,点击重试" + cursor pointer + 点击触发 load()
        this.markSkeletonError();
        throw e;
      }
    },

    // diff 两个 dashboard.json, 看 pnl_series 是 noop / append / full
    diffData(oldData, newData) {
      const oldPnl = (oldData && oldData.pnl_series) || [];
      const newPnl = (newData && newData.pnl_series) || [];
      if (newPnl.length === 0) return { kind: 'noop' };

      // 头部 (旧长度) 完全相同 → append
      if (newPnl.length >= oldPnl.length && oldPnl.length > 0) {
        let headSame = true;
        for (let i = 0; i < oldPnl.length; i++) {
          if (oldPnl[i].trade_date !== newPnl[i].trade_date) { headSame = false; break; }
        }
        if (headSame) {
          if (newPnl.length === oldPnl.length) return { kind: 'noop' };
          return { kind: 'append', newDays: newPnl.slice(oldPnl.length) };
        }
      }
      // 长度相同但日期变了, 或头部不同 → full
      return { kind: 'full' };
    },

    showError(msg) {
      const headerDate = $('header-date');
      if (headerDate) headerDate.textContent = msg;
      const fab = $('refresh-fab');
      if (fab) {
        fab.classList.remove('loading');
        fab.classList.add('error');
      }
      this.toast(msg);
    },

    toast(msg) {
      const el = $('refresh-toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3000);
    },

    initTabs() {
      // v31.0: 拆出 changeTab named method, 让 initSwipeTabs swipe 完成后也能复用
      this.drawer = document.querySelector('.tab-drawer');
      // v32.0: currentTabIdx 默认 0; 但如果用户在 fetch 未完成时已切过 tab (load 未 resolve,
      // initTabs 还没跑前), changeTab 已经把 currentTabIdx 写到这里, 不要覆盖, 保留用户选择.
      if (this.currentTabIdx === undefined) {
        this.currentTabIdx = 0;
      }
      if (this.drawer) {
        this.drawer.style.transform = `translateX(-${this.currentTabIdx * 25}%)`;
      }
      // v31.5: hero 初始 today visible (nav active = today)
      const heroEl = document.getElementById('tab-today');
      if (heroEl && heroEl.classList.contains('hero')) {
        // v32.0: 同上, 如果用户已切过, 保留 summary/hero 形态
        if (!heroEl.dataset.tabMode) {
          heroEl.dataset.tabMode = 'today';
        }
      }
      // v32.0: click handler 移到 bindNavTabs(), 在 IIFE 启动时立即绑, 不必等 load 完成.
      // initTabs 只负责 swipe + drawer/hero 初始化.
      // v30.0: 触屏 swipe 切换 tab (mobile UX)
      this.initSwipeTabs();
      // v32.2: initTabs 完成设 tab-stage 高度 = 当前 page (默认 today tab) 高度.
      // 初次进入 dashboard 时立即应用, 不等切 tab 才生效.
      requestAnimationFrame(() => this.updateTabStageHeight());
    },

    // v32.0: 单独绑 nav.tabs click handler — IIFE 启动时立即调, 不必等 load() 完成.
    // 修切到 analysis tab 时数据未加载静默的根因 (用户 fetch 未完成时点 tab, handler 没绑, click 无声无息).
    bindNavTabs() {
      document.querySelectorAll('nav.tabs a[data-tab]').forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          this.changeTab(a.dataset.tab, 280);
        });
      });
    },

    changeTab(target, animMs = 0) {
      const idx = tabOrder.indexOf(target);
      // v32.0: 总是记 currentTabIdx — initTabs 后 drawer 用, 即使现在没 drawer 也要记.
      this.currentTabIdx = idx;
      // 切 tab 时改 summary 形态 + headpiece text + holding-card data-mode
      // (today 标准 / analysis 紧凑 / closed-trades 已实现单行 + holding 隐藏 / settings 全隐)
      const summaryEl = document.querySelector('.summary');
      // v32.7 polish: summary 切 tab fade. 只在已加载过的形态变化时 fade (避免初次加载看不见).
      // 锁防快速连切: 同一 summary 上 stale timer clearTimeout 掉.
      const prevTabMode = summaryEl?.dataset.tabMode;
      const needsFade = summaryEl && prevTabMode && prevTabMode !== target;
      if (this._summaryFadeTimer) {
        clearTimeout(this._summaryFadeTimer);
        this._summaryFadeTimer = null;
      }
      if (needsFade) summaryEl.classList.add('switching');
      if (summaryEl) {
        summaryEl.dataset.tabMode = target;
        const headpieceText = summaryEl.querySelector('.headpiece-text');
        if (headpieceText) {
          headpieceText.textContent = ({
            'analysis': 'PORTFOLIO SNAPSHOT · 投资速览',
            'closed-trades': 'REALIZED P&L · 已实现盈亏',
          })[target] || '';
        }
        const cardMode = ({ 'today':'standard', 'analysis':'compact', 'closed-trades':'hidden', 'settings':'hidden' })[target] || 'standard';
        summaryEl.querySelectorAll('.holding-card').forEach(c => { c.dataset.mode = cardMode; });
      }
      // 切换 active class
      document.querySelectorAll('nav.tabs a[data-tab]').forEach(a => {
        a.classList.toggle('active', a.dataset.tab === target);
      });
      // v31.5: hero dataset.tabMode 切 today-only visibility (today → visible, 其他 → hidden)
      const heroEl = document.getElementById('tab-today');
      if (heroEl && heroEl.classList.contains('hero')) {
        heroEl.dataset.tabMode = target === 'today' ? 'today' : 'hidden';
      }
      // v31.0: drawer transform 控制显示哪个 page (取代之前 hidden 切换)
      // v32.0: 用 DOM 查询 fallback, 不依赖 this.drawer — load 未完成时 this.drawer 是 null,
      // 但 .tab-drawer 元素在 HTML 里, 能查到. 改 transform 让用户看到 tab 切换视觉.
      const drawer = this.drawer || document.querySelector('.tab-drawer');
      if (idx >= 0 && drawer) {
        if (animMs > 0) {
          drawer.style.transition = `transform ${animMs}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        } else {
          drawer.style.transition = 'none';
        }
        drawer.style.transform = `translateX(-${idx * 25}%)`;
        this.drawer = drawer;
        if (animMs > 0) {
          setTimeout(() => {
            drawer.style.transition = '';
            // v32.0: animation 路径 — analysis tab 时 data 已就绪 → 直接画; 未就绪 → polling
            if (target === 'analysis') {
              if (this.data) {
                requestAnimationFrame(() => this.renderCharts(this.data));
              } else {
                this.startChartsPolling();
              }
            }
          }, animMs);
        } else if (target === 'analysis' && this.data) {
          // 立即路径 (animMs=0, drawer 已就绪): 已有 data 就画
          requestAnimationFrame(() => this.renderCharts(this.data));
        }
      }
      // v32.0: polling 启动必须在 drawer 守卫外 — drawer 现在 query 即使 DOM (load 未完也能查),
      // 但保险起见 polling 还是放外面, 万一 drawer 元素真的缺失也不阻塞 polling.
      if (target === 'analysis' && !this.data) {
        this.startChartsPolling();
      }
      // v32.2: 切 tab 后立即设 tab-stage 高度 = 当前 page 高度 (CSS transition 平滑过渡).
      // rAF 等一帧让 layout 完成 (drawer transform 还没应用前先读 offsetHeight 更稳).
      requestAnimationFrame(() => this.updateTabStageHeight());
      // v32.7 polish: summary fade in. 100ms 后移除 .switching (opacity 0→1, CSS transition 0.18s).
      // 锁 this._summaryFadeTimer 在上面, 快速连切时上次的 timer 已被 clear, 只 fade-in 一次.
      if (needsFade) {
        this._summaryFadeTimer = setTimeout(() => {
          summaryEl.classList.remove('switching');
          this._summaryFadeTimer = null;
        }, 100);
      }
    },

    initSwipeTabs() {
      // v31.0: 触屏横滑切换 tab (native iOS page swipe 体验)
      // 整个 .tab-drawer (4 page 横排) 一起跟手指 translateX, 用户能看到下一 page 从边缘 peek 进来.
      // 检测 touchstart → touchmove → touchend 序列:
      //   - 横移 > 50px + 时间 < 500ms + 不在 chart/table 内触发 → commit (drawer 动画到下一 page)
      //   - 否则 snap back (drawer 动画回当前 page)
      // 边界 (今日右滑 / 设置左滑) rubber band: drag 量只跟 0.30 倍, commit 失败 snap back
      const tabOrder = ['today', 'analysis', 'closed-trades', 'settings'];
      let touchState = null;  // {startX, startY, startTime, currentIdx}

      // v31.9: 提高横滑触发门槛, 避免轻微偏移就切 tab (用户 9-22 反馈)
      // - SWIPE_DX_THRESHOLD 50 → 80 px (commit 阈值提高 60%)
      // - SWIPE_DY_RATIO: dx 必须 ≥ dy * 1.8 才算横滑 (vertical scroll 主导时不触发)
      //   之前用 dy > dx 直接 return, 但 dy=10 dx=15 仍能触发. 改成 dx/dy >= 1.8 更鲁棒.
      // - SWIPE_RUBBER_RATIO 0.3 → 0.15 (边界 rubber band 反馈更弱, 减少边界误触)
      const SWIPE_DX_THRESHOLD = 80;
      const SWIPE_DY_RATIO = 1.8;  // dx / dy >= 1.8 才算横滑主导
      const SWIPE_TIME_LIMIT = 500;
      const SWIPE_MIN_START = 30;
      const SWIPE_RUBBER_RATIO = 0.15;
      const SWIPE_ANIM_MS = 280;

      const shouldIgnore = (target) => {
        if (!target) return true;
        if (target.closest('.chart-card')) return true;
        if (target.closest('.trade-grid')) return true;
        if (target.closest('canvas')) return true;
        if (target.closest('nav.tabs')) return true;
        return false;
      };

      const onTouchStart = (e) => {
        if (shouldIgnore(e.target)) return;
        const t = e.touches[0];
        touchState = {
          startX: t.clientX,
          startY: t.clientY,
          startTime: Date.now(),
          currentIdx: this.currentTabIdx
        };
      };

      const onTouchMove = (e) => {
        if (!touchState) return;
        if (shouldIgnore(e.target)) return;
        const t = e.touches[0];
        const dx = t.clientX - touchState.startX;
        const dy = t.clientY - touchState.startY;
        if (Math.abs(dy) > 0 && Math.abs(dx) < Math.abs(dy) * SWIPE_DY_RATIO) return;  // vertical scroll 主导, dx/dy < 1.8 不触发
        if (Math.abs(dx) < SWIPE_MIN_START) return;

        const currentIdx = touchState.currentIdx;
        const nextIdx = dx < 0 ? currentIdx + 1 : currentIdx - 1;
        const inBounds = nextIdx >= 0 && nextIdx < tabOrder.length;

        this.drawer.style.transition = 'none';
        if (!inBounds) {
          // 边界 rubber band (0.3 比例)
          // v31.2: drawer width = 400% (4 page), 1 page = 25% of drawer. translateX(-idx * 25%) = drawer offset
          const rubberDx = dx * SWIPE_RUBBER_RATIO;
          this.drawer.style.transform = `translateX(calc(-${currentIdx * 25}% + ${rubberDx}px))`;
        } else {
          // 1:1 跟手 (drawer 整个跟手指)
          this.drawer.style.transform = `translateX(calc(-${currentIdx * 25}% + ${dx}px))`;
        }
      };

      const onTouchEnd = (e) => {
        if (!touchState) return;
        const t = (e.changedTouches && e.changedTouches[0]) || null;
        const dx = t ? t.clientX - touchState.startX : 0;
        const dt = Date.now() - touchState.startTime;
        const currentIdx = touchState.currentIdx;
        const nextIdx = dx < 0 ? currentIdx + 1 : currentIdx - 1;
        const triggered = Math.abs(dx) > SWIPE_DX_THRESHOLD && dt < SWIPE_TIME_LIMIT && nextIdx >= 0 && nextIdx < tabOrder.length;

        if (triggered) {
          this.changeTab(tabOrder[nextIdx], SWIPE_ANIM_MS);
        } else {
          // snap back (边界 or 未达阈值都回 currentIdx)
          this.drawer.style.transition = `transform ${SWIPE_ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
          this.drawer.style.transform = `translateX(-${currentIdx * 25}%)`;
          setTimeout(() => {
            this.drawer.style.transition = '';
          }, SWIPE_ANIM_MS);
        }
        touchState = null;
      };

      document.body.addEventListener('touchstart', onTouchStart, { passive: true });
      document.body.addEventListener('touchmove', onTouchMove, { passive: true });
      document.body.addEventListener('touchend', onTouchEnd, { passive: true });
      document.body.addEventListener('touchcancel', onTouchEnd, { passive: true });
    },

    render(data) {
      this.renderHeader(data);
      this.renderHero(data);
      this.renderThreeSeg(data);
      this.renderExcess(data);
      this.renderHoldings(data);
      this.renderClosed(data);
      this.renderTradeSummary(data);
      this.renderTransactions(data);
      // 不在 load() 里 renderCharts — canvas 在 hidden pane 时 width=0, Chart.js 内部 layout 坏了, 后续 destroy + 重画也救不回来
      // charts 改在 initTabs 切到分析 tab 时画 (pane visible, width 正确)
    },

    renderHeader(data) {
      const m = data.meta || {};
      const t = m.trade_date || '—';
      const g = m.generated_at || '';
      const time = g ? g.split('T')[1]?.substring(0, 5) : '';
      const dateEl = $('header-date');
      if (dateEl) dateEl.textContent = `${t} · ${time || '—'}`;
      document.title = `持仓 Dashboard · ${t}`;
    },

    renderHero(data) {
      const s = data.summary || {};
      const tp = s.total_pnl_abs;

      // 大字总额 (绝对值, 跟符号一起显)
      const heroAmount = $('hero-amount');
      if (heroAmount) {
        heroAmount.innerHTML = (tp < 0 ? '-' : '+') + fmtMoneyBig(tp) + '<span class="unit">元</span>';
        // 颜色: 跟百分比同色 (盈暖红 / 亏冷灰绿 / 持平灰)
        heroAmount.classList.remove('up', 'down', 'neutral');
        heroAmount.classList.add(pnlClass(tp));
      }

      const heroPct = $('hero-percent');
      if (heroPct) {
        heroPct.textContent = fmtPct(s.total_pnl_pct);
        heroPct.classList.remove('up', 'down', 'neutral');
        heroPct.classList.add(pnlClass(tp));
      }

      // 副信息: 持仓 X / 已实现 Y / 初始总投入 Z
      const heroSub = $('hero-sub');
      if (heroSub) {
        const fp = s.floating_pnl_abs;
        const rp = s.realized_pnl_abs;
        const init = s.initial_principal || 0;
        heroSub.innerHTML =
          `持仓 ${fp < 0 ? '-' : '+'}${fmtMoneyBig(fp)}` +
          `<span class="sep">·</span>` +
          `已实现 ${rp < 0 ? '-' : '+'}${fmtMoneyBig(rp)}` +
          `<span class="sep">·</span>` +
          `初始总投入 ${fmtMoneyBig(init)}`;
      }
    },

    renderThreeSeg(data) {
      const s = data.summary || {};
      // ① 持仓
      const fp = s.floating_pnl_abs;
      const fAmt = $('floating-amount');
      if (fAmt) {
        fAmt.innerHTML = (fp < 0 ? '-' : '+') + fmtMoneyBig(fp) + '<span class="unit">元</span>';
        fAmt.classList.remove('up', 'down', 'neutral');
        fAmt.classList.add(pnlClass(fp));
      }
      const fPct = $('floating-pct');
      if (fPct) {
        fPct.textContent = fmtPct(s.floating_pnl_pct);
        fPct.classList.remove('up', 'down', 'neutral');
        fPct.classList.add(pnlClass(fp));
      }
      // ② 已实现
      const rp = s.realized_pnl_abs;
      const rAmt = $('realized-amount');
      if (rAmt) {
        rAmt.innerHTML = (rp < 0 ? '-' : '+') + fmtMoneyBig(rp) + '<span class="unit">元</span>';
        rAmt.classList.remove('up', 'down', 'neutral');
        rAmt.classList.add(pnlClass(rp));
      }
      const rPct = $('realized-pct');
      if (rPct) {
        rPct.textContent = fmtPct(s.realized_pnl_pct);
        rPct.classList.remove('up', 'down', 'neutral');
        rPct.classList.add(pnlClass(rp));
      }
      // ③ 总
      const tp = s.total_pnl_abs;
      const tAmt = $('total-amount');
      if (tAmt) {
        tAmt.innerHTML = (tp < 0 ? '-' : '+') + fmtMoneyBig(tp) + '<span class="unit">元</span>';
        tAmt.classList.remove('up', 'down', 'neutral');
        tAmt.classList.add(pnlClass(tp));
      }
      // v32.10: total_pnl_pct 优先用 localStorage account_funds 算
      // (没设 → fallback 后端 summary.total_pnl_pct, 即基于累计投入 initial_principal)
      const tPct = $('total-pct');
      if (tPct) {
        const tPctVal = (this.accountFunds && this.accountFunds > 0)
          ? Math.round((tp / this.accountFunds) * 10000) / 100
          : s.total_pnl_pct;
        tPct.textContent = fmtPct(tPctVal);
        tPct.classList.remove('up', 'down', 'neutral');
        tPct.classList.add(pnlClass(tp));
      }
    },

    // v32.10: 账户资金 (本地设置, 用户在 settings tab 输入, 用于覆写总盈亏% 分母)
    // v32.15: 语义改 "最大占用本金 (Max Invested Capital)" — 内部变量 / localStorage key 保留向后兼容
    accountFunds: null,
    initAccountFunds() {
      try {
        const saved = localStorage.getItem('mavis.accountFunds');
        this.accountFunds = saved ? parseFloat(saved) : null;
      } catch (e) { this.accountFunds = null; }
      const input = $('account-funds-input');
      if (input) {
        if (this.accountFunds) input.value = this.accountFunds.toString();
        input.addEventListener('change', () => {
          const v = parseFloat(input.value);
          if (!isNaN(v) && v > 0) {
            localStorage.setItem('mavis.accountFunds', String(v));
            this.accountFunds = v;
            this.toast('已保存最大占用本金 ¥' + v.toLocaleString('zh-CN') + ' · 总盈亏% / 累计收益率 vs 大盘 已更新');
          } else {
            localStorage.removeItem('mavis.accountFunds');
            this.accountFunds = null;
            this.toast('已清空最大占用本金 · 总盈亏% 回到累计投入');
          }
          if (this.data) {
            this.renderThreeSeg(this.data);
            // v32.15: chart-benchmark legend label 末条也用 accountFunds 算, 同步触发
            if (this.charts.benchmark && this.dataCache && this.dataCache.benchmark) {
              this.updateBenchmarkChartFull(this.dataCache.benchmark);
            }
          }
        });
      }
      const clearBtn = $('account-funds-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          localStorage.removeItem('mavis.accountFunds');
          this.accountFunds = null;
          if (input) input.value = '';
          this.toast('已清空最大占用本金 · 总盈亏% 回到累计投入');
          if (this.data) {
            this.renderThreeSeg(this.data);
            if (this.charts.benchmark && this.dataCache && this.dataCache.benchmark) {
              this.updateBenchmarkChartFull(this.dataCache.benchmark);
            }
          }
        });
      }
    },

    renderExcess(data) {
      const s = data.summary || {};

      const exCsi = $('excess-csi300-val');
      if (exCsi) {
        if (s.excess_csi300_pct == null) {
          exCsi.textContent = '—';
          exCsi.className = 'hero-stat-val';
        } else {
          exCsi.textContent = (s.excess_csi300_pct >= 0 ? '▲ 跑赢' : '▼ 跑输') + ' ' + fmtPct(s.excess_csi300_pct);
          exCsi.className = 'hero-stat-val ' + pnlClass(s.excess_csi300_pct);
        }
      }

      const exSh = $('excess-sh-val');
      if (exSh) {
        if (s.excess_sh_pct == null) {
          exSh.textContent = '—';
          exSh.className = 'hero-stat-val';
        } else {
          exSh.textContent = (s.excess_sh_pct >= 0 ? '▲ 跑赢' : '▼ 跑输') + ' ' + fmtPct(s.excess_sh_pct);
          exSh.className = 'hero-stat-val ' + pnlClass(s.excess_sh_pct);
        }
      }

      const initEl = $('initial-principal-val');
      if (initEl) {
        initEl.textContent = s.initial_principal != null ? fmtMoneyBig(s.initial_principal) + ' 元' : '—';
      }
    },

    renderHoldings(data) {
      const list = data.holdings || [];
      const container = $('holdings-list');
      $('holdings-count').textContent = list.length;
      if (!container) return;

      container.innerHTML = list.map(h => {
        const gain = h.pnl_abs > 0;
        const loss = h.pnl_abs < 0;
        const cls = gain ? 'gain' : (loss ? 'loss' : '');

        const dailyRows = [];
        // v32.5: change_amount 加 null guard (plan P3-C) — 后端漏字段不会崩, 跳过该行
        if (h.change_pct != null && h.change_amount != null) {
          dailyRows.push(`<div class="holding-row"><span class="holding-key">今日涨跌</span><span class="holding-val ${pnlClass(h.change_amount)}">${h.change_amount >= 0 ? '+' : ''}${h.change_amount.toFixed(3)} (${fmtPct(h.change_pct)})</span></div>`);
        }
        if (h.daily_pnl != null) {
          dailyRows.push(`<div class="holding-row"><span class="holding-key">今日盈亏</span><span class="holding-val ${pnlClass(h.daily_pnl)}">${fmtMoney(h.daily_pnl)}</span></div>`);
        }

        const statusArrow = gain ? '▲ 持仓' : (loss ? '▼ 持仓' : '· 持仓');
        const statusClass = pnlClass(h.pnl_abs);

        return `
          <div class="holding-card ${cls}" data-mode="standard">
            <div class="holding-head">
              <span class="holding-name">${escapeHtml(h.name)}</span>
              <span class="holding-code">${h.code}.${h.market || 'SH'}</span>
              <span class="holding-status ${statusClass}">${statusArrow}</span>
            </div>
            <div class="holding-row"><span class="holding-key">持仓</span><span class="holding-val">${h.shares.toLocaleString()} 股</span></div>
            <div class="holding-row"><span class="holding-key">成本</span><span class="holding-val">${h.cost.toFixed(3)}</span></div>
            <div class="holding-row"><span class="holding-key">现价</span><span class="holding-val">${h.close.toFixed(3)}</span></div>
            ${dailyRows.join('\n            ')}
            <div class="holding-pnl">
              <span class="holding-pnl-key">累计盈亏</span>
              <span class="holding-pnl-val ${pnlClass(h.pnl_abs)}">${fmtMoney(h.pnl_abs)} (${fmtPct(h.pnl_pct)})</span>
            </div>
          </div>`;
      }).join('');
    },

    renderClosed(data) {
      const list = data.closed_holdings || [];
      const section = $('closed-section');
      const closedCountEl = $('closed-summary');
      if (list.length === 0) {
        section.style.display = 'none';
        return;
      }
      section.style.display = '';
      const totalRealized = list.reduce((s, c) => s + (c.realized_abs || 0), 0);
      const totalReleased = list.reduce((s, c) => s + (c.cost_total || 0), 0);
      // 已清仓 count + 累计 + 释放本金 放在 title
      if (closedCountEl) {
        closedCountEl.innerHTML = `<span id="closed-count">${list.length}</span> 只 · 累计实现 <span class="${pnlClass(totalRealized)}">${fmtMoney(totalRealized)}</span> · 释放本金 ${fmtMoneyAbs(totalReleased)}`;
      }

      $('closed-list').innerHTML = list.map(c => {
        const status = '— 已清仓';
        return `
          <div class="holding-card closed-card">
            <div class="holding-head">
              <span class="holding-name" style="color: var(--ink-secondary);">${escapeHtml(c.name)}</span>
              <span class="holding-code">${c.code}.${c.market || 'SH'}</span>
              <span class="holding-status" style="color: var(--ink-muted);">${status}</span>
            </div>
            <div class="holding-row"><span class="holding-key">清仓日</span><span class="holding-val">${c.closed_at}</span></div>
            <div class="holding-row"><span class="holding-key">成本</span><span class="holding-val">${fmtMoneyAbs(c.cost_total)}</span></div>
            <div class="holding-row"><span class="holding-key">收回</span><span class="holding-val">${fmtMoneyAbs(c.recv_total)}</span></div>
            <div class="holding-pnl">
              <span class="holding-pnl-key">实现盈亏</span>
              <span class="holding-pnl-val ${pnlClass(c.realized_abs)}">${fmtMoney(c.realized_abs)} (${fmtPct(c.realized_pct)})</span>
            </div>
          </div>`;
      }).join('');
    },

    renderTradeSummary(data) {
      const s = data.trade_summary || {};
      const grid = $('trade-summary-grid');
      if (!grid) return;
      // P2-B: 第三个 arg 改为 trade-cell 上的 extra class (原 'neutral' 实际无 CSS 依赖, 移走);
      // 最后一个 cell (累计手续费) 加 trade-cell-fee class, CSS 把它 grid-column: 1/-1 横跨整行加大
      const cells = [
        ['买入次数', s.buy_count != null ? s.buy_count + ' 次' : '—', ''],
        ['卖出次数', s.sell_count != null ? s.sell_count + ' 次' : '—', ''],
        ['累计买入金额', s.total_buy_amount != null ? fmtMoneyAbs(s.total_buy_amount) + ' 元' : '—', ''],
        ['累计卖出金额', s.total_sell_amount != null ? fmtMoneyAbs(s.total_sell_amount) + ' 元' : '—', ''],
        ['累计手续费', s.total_fee != null ? s.total_fee + ' 元' : '—', 'trade-cell-fee'],
      ];
      grid.innerHTML = cells.map(([label, val, extra]) => `
        <div class="trade-cell${extra ? ' ' + extra : ''}">
          <div class="trade-cell-key">${label}</div>
          <div class="trade-cell-val">${val}</div>
        </div>
      `).join('');
    },

    renderTransactions(data) {
      const list = data.transactions_recent || [];
      $('tx-count').textContent = list.length;
      $('tx-tbody').innerHTML = list.map(t => `
        <tr>
          <td>${t.trade_date}</td>
          <td class="${({buy:'up',sell:'down'})[t.side] || ''}">${({buy:'买',sell:'卖',dividend:'分红',fee:'费用'})[t.side] || t.side}</td>
          <td class="name-cell">${escapeHtml(t.name)} <span style="color:var(--ink-muted);font-size:11px">${t.code}</span></td>
          <td class="num">${t.shares.toLocaleString()}</td>
          <td class="num">${t.price.toFixed(3)}</td>
        </tr>`).join('');
    },

    renderCharts(data) {
      // v22.26: 改为 ensureCharts — chart 已存在就不 destroy (Excel-like 增量更新),
      // 不存在才 new Chart 初始化. 切 tab / 后续 load 都走这条路, chart 实例跨刷新活着.
      try {
        this.ensureCharts(data);
      } catch (e) {
        console.error('[charts] ensureCharts failed:', e);
        this.toast('图表加载失败: ' + (e.message || 'unknown'));
      }
      // 动态更新 carry_forward 注释
      try {
        this.updateCarryForwardNote(data.pnl_series || []);
      } catch (e) {
        console.warn('[charts] carry_forward note update failed:', e);
      }
      // v32.0: 成功 → hide skeleton (覆盖正常路径 + polling 触发路径)
      this.hideAllSkeletons();
      // v32.2: analysis tab 内容画完 (chart / carry_forward note), 重新算 tab-stage 高度
      // (chart canvas 撑高, 或 skeleton 隐藏后高度变化)
      requestAnimationFrame(() => this.updateTabStageHeight());
    },

    // v32.0: 切到 analysis tab 时 this.data 还未就绪 → polling 100ms ×100 等 fetch 完成
    startChartsPolling() {
      if (this._pollingActive) return;
      this._pollingActive = true;
      let attempts = 0;
      const tick = () => {
        if (!this._pollingActive) return;
        attempts++;
        if (this.data) {
          this._pollingActive = false;
          requestAnimationFrame(() => this.renderCharts(this.data));
          return;
        }
        if (attempts >= 100) {
          // 10s 超时: 停止 polling, skeleton 改 "加载超时"
          this._pollingActive = false;
          this.markSkeletonError('加载超时,请下拉刷新');
          return;
        }
        setTimeout(tick, 100);
      };
      tick();
    },

    // v32.0: 隐藏所有 skeleton (renderCharts 成功 / load 成功 路径调用)
    hideAllSkeletons() {
      document.querySelectorAll('.chart-skeleton').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('error');
        el.onclick = null;
      });
    },

    // v32.0: skeleton 改 "加载失败" + cursor pointer + 点击触发 load() 重试
    markSkeletonError(msg) {
      const text = msg || '加载失败,点击重试';
      document.querySelectorAll('.chart-skeleton').forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('error');
        el.innerHTML = `<span>${text}</span><div class="skeleton-bar"></div>`;
        el.onclick = () => this.load();
      });
    },

    // v32.2: tab-stage 高度 = 当前 active page offsetHeight, 让 footer 紧贴无空白.
    // 触发: changeTab / initTabs / renderCharts 完成 / window resize / fonts ready.
    // CSS .tab-stage 有 280ms height transition 平滑过渡 (跟 swipe commit 同 timing).
    // 注意: page-today 是空容器 (今日 tab 实际内容在 body level 的 hero + summary),
    // page-today.offsetHeight = 0, 必须把 height 设成 0 让 tab-stage 真缩, 否则 inline
    // style 空 → computed height 走 drawer 默认 = max(page heights) ≈ 1992px 留白.
    updateTabStageHeight() {
      const stage = document.querySelector('.tab-stage');
      if (!stage) return;
      const idx = this.currentTabIdx != null ? this.currentTabIdx : 0;
      const target = tabOrder[idx];
      if (!target) return;
      const page = document.getElementById('page-' + target);
      if (!page) return;
      const h = page.offsetHeight;
      stage.style.height = h + 'px';  // 包括 h=0, 不守卫, 否则今日 tab 留白
    },

    // v22.26: chart 已存在 → updateChartsFull 重设 data + update('none');
    // 不存在 → renderXxxChart 走 new Chart. 这样 chart 跨刷新活着.
    ensureCharts(data) {
      if (!this.charts.pnlTrend) {
        try {
          this.renderPnlTrendChart(data.pnl_series || []);
        } catch (e) {
          console.error('[charts] PnL trend render failed:', e);
          this.toast('P&L 图表加载失败: ' + (e.message || 'unknown'));
        }
      } else {
        this.updatePnlTrendChartFull(data.pnl_series || []);
      }
      if (!this.charts.benchmark) {
        try {
          this.renderBenchmarkChart(data.benchmark || {});
        } catch (e) {
          console.error('[charts] benchmark render failed:', e);
          this.toast('基准对比图表加载失败: ' + (e.message || 'unknown'));
        }
      } else {
        this.updateBenchmarkChartFull(data.benchmark || {});
      }
    },

    // v22.26: 增量 push 新一天 + update('none'), 不 destroy 不 recreate
    appendChartsWith(newDays) {
      if (!newDays || newDays.length === 0) return;

      // pnlTrend: 3 datasets (v32.19: 删 gap fill dataset[2], 改用右侧 connector plugin)
      //   [0] 已实现盈亏 line + fill, [1] 总盈亏 line + fill, [2] 重叠区 fill (斜线)
      // gap (持仓盈亏) 不再用 fill, 改用 plugin afterDatasetsDraw 在右侧画大括号 connector
      const c1 = this.charts.pnlTrend;
      if (c1) {
        newDays.forEach(r => {
          const realized = r.realized_pnl != null ? r.realized_pnl : r.total_pnl;
          // v32.21: total = 累计已实现 + 当日持仓浮盈 (累计总盈亏), 不是 pnl_series.total_pnl (当日浮盈)
          const total = realized + (r.total_pnl != null ? r.total_pnl : 0);
          // overlap: 两线同号部分 = min(realized, total) if 都 >= 0 else 0
          const overlap = (realized >= 0 && total >= 0) ? Math.min(realized, total) : 0;
          c1.data.labels.push(r.trade_date.substring(5));
          c1.data.datasets[0].data.push(realized);
          c1.data.datasets[1].data.push(total);
          c1.data.datasets[2].data.push(overlap);
        });
        c1.update('none');  // 'none' = 不带动画
        console.log(`[charts] pnlTrend append ${newDays.length} day(s), labels=${c1.data.labels.length}`);
      }

      // benchmark: 找 my_portfolio / sh / csi300 里对应 trade_date 的 cum_pct / pct_from_baseline
      // v32.5: bench 3 个数组预转 Map (plan P3-D 性能优化), append N day 时 O(3N) → O(3 + N) lookup
      const c2 = this.charts.benchmark;
      const bench = (this.dataCache && this.dataCache.benchmark) || {};
      if (c2) {
        const myMap = new Map((bench.my_portfolio || []).map(r => [r.trade_date, r]));
        const shMap = new Map((bench.sh || []).map(r => [r.trade_date, r]));
        const csiMap = new Map((bench.csi300 || []).map(r => [r.trade_date, r]));
        newDays.forEach(r => {
          const fullDate = r.trade_date;
          const myR = myMap.get(fullDate);
          const shR = shMap.get(fullDate);
          const csiR = csiMap.get(fullDate);
          c2.data.labels.push(fullDate.substring(5));
          // dataset 0: 我的持仓
          c2.data.datasets[0].data.push(myR ? myR.cum_pct : null);
          // dataset 1: 上证指数 (if exists)
          if (c2.data.datasets[1]) c2.data.datasets[1].data.push(shR ? shR.pct_from_baseline : null);
          // dataset 2: 沪深 300 (if exists)
          if (c2.data.datasets[2]) c2.data.datasets[2].data.push(csiR ? csiR.pct_from_baseline : null);
        });
        c2.update('none');
        console.log(`[charts] benchmark append ${newDays.length} day(s), labels=${c2.data.labels.length}`);
      }
    },

    // v22.26: 全量重设 chart.data (历史改了时 fallback), 不 destroy
    updatePnlTrendChartFull(series) {
      const c = this.charts.pnlTrend;
      if (!c) return;
      const labels = series.map(r => r.trade_date.substring(5));
      const realizedPnls = series.map(r => r.realized_pnl != null ? r.realized_pnl : r.total_pnl);
      const totalPnls = series.map(r => {
        const floating = r.total_pnl != null ? r.total_pnl : 0;
        const realized = r.realized_pnl != null ? r.realized_pnl : 0;
        return floating + realized;
      });
      const overlapData = realizedPnls.map((r, i) => {
        const t = totalPnls[i];
        return (r >= 0 && t >= 0) ? Math.min(r, t) : 0;
      });
      c.data.labels = labels;
      c.data.datasets[0].data = realizedPnls;
      c.data.datasets[1].data = totalPnls;
      c.data.datasets[2].data = overlapData;
      c.update('none');
      console.log(`[charts] pnlTrend full update, labels=${c.data.labels.length}`);
    },

    updateBenchmarkChartFull(bench) {
      const c = this.charts.benchmark;
      if (!c) return;
      const my = bench.my_portfolio || [];
      const labels = my.map(r => r.trade_date.substring(5));
      const shMap = Object.fromEntries((bench.sh || []).map(r => [r.trade_date, r.pct_from_baseline]));
      const csiMap = Object.fromEntries((bench.csi300 || []).map(r => [r.trade_date, r.pct_from_baseline]));
      c.data.labels = labels;
      c.data.datasets[0].data = my.map(r => r.cum_pct);
      if (c.data.datasets[1]) c.data.datasets[1].data = labels.map((_, i) => shMap[my[i].trade_date] ?? null);
      if (c.data.datasets[2]) c.data.datasets[2].data = labels.map((_, i) => csiMap[my[i].trade_date] ?? null);
      // v32.15: dataset[0].label 末条数字也同步用 max invested capital 算 (跟 summary 卡片同口径)
      c.data.datasets[0].label = `我的总盈亏 (含已实现) (${this._computeMyPctLabel()})`;
      c.update('none');
      console.log(`[charts] benchmark full update, labels=${c.data.labels.length}`);
    },

    // v32.15: 算我的总盈亏% 末条 label (chart legend / dataset[0].label 共享)
    // 优先用 accountFunds (settings 填的 max invested capital), 没设 → fallback cum_pct 末条
    _computeMyPctLabel() {
      const bench = (this.dataCache && this.dataCache.benchmark) || {};
      const my = bench.my_portfolio || [];
      const cumPctLast = my.length > 0 ? my[my.length - 1].cum_pct : null;
      if (this.accountFunds && this.accountFunds > 0 && this.data && this.data.summary) {
        const tp = this.data.summary.total_pnl_abs;
        const myPctLast = Math.round((tp / this.accountFunds) * 10000) / 100;
        return fmtPct(myPctLast);
      }
      return cumPctLast != null ? fmtPct(cumPctLast) : '—';
    },

    // 移动端检测兜底: 旧 WebView / 某些 Android 浏览器可能没 window.matchMedia, 之前 v22.8 在 raf 回调里抛错被吞
    _isMobile() {
      try {
        return !!(window.matchMedia && window.matchMedia('(max-width: 600px)').matches);
      } catch (e) {
        return false; // 默认 desktop
      }
    },

    // Round 3 Option D: 纯文字注释 "X 天为假设性回填" (动态范围)
    updateCarryForwardNote(series) {
      const note = $('carry-forward-note');
      if (!note) return;
      const cfDays = series.filter(s => s.cost_basis === 'carry_forward').length;
      if (cfDays === 0) {
        note.style.display = 'none';
        return;
      }
      // 计算 contiguous ranges (carry_forward 不一定连续)
      const ranges = [];
      let start = null;
      for (let i = 0; i < series.length; i++) {
        const isCf = series[i].cost_basis === 'carry_forward';
        if (isCf && start === null) start = i;
        else if (!isCf && start !== null) { ranges.push([start, i - 1]); start = null; }
      }
      if (start !== null) ranges.push([start, series.length - 1]);

      note.style.display = '';
      if (ranges.length === 1 && ranges[0][0] === 0) {
        // 单一连续段且从开始
        note.innerHTML = `<span class="legend-mark"></span>前 ${cfDays} 天为假设性回填`;
      } else if (ranges.length === 1) {
        // 单一连续段但不在开始
        const [s, e] = ranges[0];
        note.innerHTML = `<span class="legend-mark"></span>${cfDays} 天为假设性回填 (${series[s].trade_date.substring(5)} ~ ${series[e].trade_date.substring(5)})`;
      } else {
        // 多段 (典型: 初始 3 天 + 4-6 月空仓 62 天)
        const short = ranges.map(([s, e]) => `${series[s].trade_date.substring(5)}~${series[e].trade_date.substring(5)}`).join(' + ');
        note.innerHTML = `<span class="legend-mark"></span>${cfDays} 天为假设性回填 (${short})`;
      }
    },

    renderPnlTrendChart(series) {
      const el = $('chart-pnl-trend');
      if (!el) return;
      if (this.charts.pnlTrend) this.charts.pnlTrend.destroy();
      if (series.length === 0) {
        el.parentElement.innerHTML = '<div class="chart-loading">暂无 PnL 数据</div>';
        return;
      }
      const labels = series.map(s => s.trade_date.substring(5)); // MM-DD
      // v32.21: 双线 (realized 累计已实现 + total 累计总盈亏 = total_pnl + realized_pnl)
      // gap (持仓盈亏) 不再用 fill, 改用 plugin afterDatasetsDraw 在右侧画大括号 connector + 竖排文字
      const realizedPnls = series.map(s => s.realized_pnl != null ? s.realized_pnl : s.total_pnl);
      const totalPnls = series.map(s => {
        const floating = s.total_pnl != null ? s.total_pnl : 0;
        const realized = s.realized_pnl != null ? s.realized_pnl : 0;
        return floating + realized;
      });
      // overlap: 两线同号部分 = min(realized, total) if 都 >= 0 else 0 (realized 累计总 >= 0, 所以此值通常 = total >= 0 时 min)
      const overlapData = realizedPnls.map((r, i) => {
        const t = totalPnls[i];
        return (r >= 0 && t >= 0) ? Math.min(r, t) : 0;
      });
      const isMobile = this._isMobile();
      const maxTicks = isMobile ? 5 : 10;

      // sub line: date range + 末点持仓盈亏 (gap)
      const rangeEl = $('pnl-range');
      if (rangeEl && series.length > 0) {
        const lastIdx = series.length - 1;
        const gapLast = (totalPnls[lastIdx] || 0) - (realizedPnls[lastIdx] || 0);
        const sign = gapLast >= 0 ? '+' : '';
        rangeEl.textContent = `${series[0].trade_date} → ${series[lastIdx].trade_date} · 末点持仓盈亏 ${sign}${gapLast.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 元`;
      }
      const daysEl = $('pnl-days-count');
      if (daysEl) daysEl.textContent = series.length;

      // canvas pattern for overlap 区域 — 细斜线
      const ctx = el.getContext('2d');
      function makeDiagonalPattern(c) {
        const pat = document.createElement('canvas');
        pat.width = 6;
        pat.height = 6;
        const pc = pat.getContext('2d');
        pc.strokeStyle = 'rgba(196, 92, 79, 0.45)';  // accent-up 红, 半透明
        pc.lineWidth = 1;
        pc.beginPath();
        pc.moveTo(0, 6);
        pc.lineTo(6, 0);
        pc.stroke();
        return c.createPattern(pat, 'repeat');
      }

      // v32.19: 右侧大括号 connector plugin (持仓盈亏 = total - realized, 末点)
      // 大括号从 chart area 右外侧画, 中间竖排 "持仓盈亏 ±X.XX 元" 文字
      const gapConnectorPlugin = {
        id: 'gapConnector',
        afterDatasetsDraw(chart) {
          const cctx = chart.ctx;
          const cArea = chart.chartArea;
          if (!cArea) return;
          const realizedSeries = chart.data.datasets[0].data;
          const totalSeries = chart.data.datasets[1].data;
          if (!realizedSeries.length || !totalSeries.length) return;
          const lastIdx = realizedSeries.length - 1;
          const realizedLast = realizedSeries[lastIdx];
          const totalLast = totalSeries[lastIdx];
          if (realizedLast == null || totalLast == null) return;
          const gap = totalLast - realizedLast;
          if (Math.abs(gap) < 1) return;  // gap 太小不画 (避免重叠)

          const yScale = chart.scales.y;
          const realizedY = yScale.getPixelForValue(realizedLast);
          const totalY = yScale.getPixelForValue(totalLast);
          const topY = Math.min(realizedY, totalY);
          const botY = Math.max(realizedY, totalY);

          // 大括号 `{` 几何: 两条短横线 (top/bottom) + 中心尖角
          const braceX = cArea.right + 6;
          const braceW = 14;
          const tipX = braceX - 3;

          cctx.save();
          cctx.strokeStyle = '#3A2E26';  // accent-engrave 深棕铜版画
          cctx.lineWidth = 1.2;
          cctx.lineCap = 'round';
          cctx.lineJoin = 'round';
          cctx.beginPath();
          // 顶部横线 (大括号上端)
          cctx.moveTo(braceX, topY);
          cctx.lineTo(braceX + braceW, topY);
          // 底部横线 (大括号下端)
          cctx.moveTo(braceX, botY);
          cctx.lineTo(braceX + braceW, botY);
          // 中心尖角 (从顶部到中心到底部)
          cctx.moveTo(braceX, topY);
          cctx.lineTo(tipX, (topY + botY) / 2);
          cctx.lineTo(braceX, botY);
          cctx.stroke();

          // 竖排文字 "持仓盈亏 ±X.XX 元" 中心位置
          const labelX = braceX + braceW + 8;
          const labelY = (topY + botY) / 2;
          cctx.save();
          cctx.translate(labelX, labelY);
          cctx.rotate(-Math.PI / 2);  // 竖排 (逆时针 90°)
          cctx.fillStyle = '#3A2E26';
          cctx.font = '11px JetBrains Mono';
          cctx.textAlign = 'center';
          cctx.textBaseline = 'middle';
          const sign = gap >= 0 ? '+' : '';
          cctx.fillText(`持仓盈亏 ${sign}${gap.toFixed(2)} 元`, 0, 0);
          cctx.restore();

          cctx.restore();
        }
      };

      this.charts.pnlTrend = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            // [0] 已实现盈亏 line + fill (A 股惯例涨红跌绿) — 实线, line 本身颜色按 y 正负变色
            {
              label: '已实现盈亏',
              data: realizedPnls,
              borderColor: 'rgba(196, 92, 79, 0.85)',  // 默认红 (segment 染色覆盖)
              borderWidth: 1.8,
              borderDash: [],  // 实线
              fill: {
                target: { value: 0 },
                above: 'rgba(196, 92, 79, 0.12)',   // y>0 红 (A 股涨)
                below: 'rgba(122, 138, 118, 0.12)', // y<0 绿 (A 股跌)
              },
              // v32.20: line 本身按 y 正负变色 (A 股惯例涨红跌绿) — segment 中点判断
              segment: {
                borderColor: ctx => {
                  const midY = (ctx.p0.parsed.y + ctx.p1.parsed.y) / 2;
                  return midY >= 0 ? 'rgba(196, 92, 79, 0.85)' : 'rgba(122, 138, 118, 0.85)';
                }
              },
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHoverBackgroundColor: '#1A1A1A',  // hover 点固定深色
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 2,
              order: 1,
            },
            // [1] 总盈亏 line + fill (A 股惯例涨红跌绿) — 虚线, line 本身颜色按 y 正负变色
            {
              label: '总盈亏',
              data: totalPnls,
              borderColor: 'rgba(196, 92, 79, 0.85)',  // 默认红
              borderWidth: 1.8,
              borderDash: [5, 3],  // 短虚线 (跟 chart-benchmark 上证指数样式一致)
              fill: {
                target: { value: 0 },
                above: 'rgba(196, 92, 79, 0.10)',   // y>0 红 (涨) — 透明度低一点让虚线突出
                below: 'rgba(122, 138, 118, 0.10)', // y<0 绿 (跌)
              },
              // v32.20: line 本身按 y 正负变色 (A 股惯例涨红跌绿) — segment 中点判断
              segment: {
                borderColor: ctx => {
                  const midY = (ctx.p0.parsed.y + ctx.p1.parsed.y) / 2;
                  return midY >= 0 ? 'rgba(196, 92, 79, 0.85)' : 'rgba(122, 138, 118, 0.85)';
                }
              },
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHoverBackgroundColor: '#1A1A1A',  // hover 点固定深色
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 2,
              order: 2,
            },
            // [2] 重叠区 fill (canvas 斜线 pattern, min(realized, total) 同号部分)
            {
              label: '已实现 + 总盈亏 重叠',
              data: overlapData,
              borderWidth: 0,
              fill: { target: { value: 0 } },
              backgroundColor: makeDiagonalPattern(ctx),
              pointRadius: 0,
              tension: 0.3,
              order: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          layout: {
            // v32.19: 右侧 padding 给大括号 connector + 竖排文字留位置 (约 80px)
            right: 90,
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1A1A1A',
              titleColor: '#F7F7F5',
              bodyColor: '#F7F7F5',
              titleFont: { family: 'JetBrains Mono', size: isMobile ? 10 : 11, weight: 600 },
              bodyFont: { family: 'JetBrains Mono', size: isMobile ? 10 : 12 },
              padding: isMobile ? 8 : 10,
              borderColor: '#3A2E26',
              borderWidth: 1,
              displayColors: false,
              yAlign: isMobile ? 'bottom' : undefined,
              xAlign: isMobile ? 'center' : undefined,
              callbacks: {
                title: (ctx) => {
                  const i = ctx[0].dataIndex;
                  return series[i].trade_date + (series[i].cost_basis === 'carry_forward' ? ' · 假设回填' : '');
                },
                // v32.19: filter 过滤掉 overlap fill dataset, 只让 dataset[1] (总盈亏 line) 进 tooltip, 输出完整三行
                filter: (tooltipItem) => tooltipItem.datasetIndex === 1,
                label: (ctx) => {
                  if (ctx.datasetIndex !== 1) return '';
                  const i = ctx.dataIndex;
                  const r = realizedPnls[i] || 0;
                  const t = totalPnls[i] || 0;
                  const f = t - r;
                  const fmtN = (n) => (n >= 0 ? '+' : '') + n.toLocaleString('zh-CN', {minimumFractionDigits: 2});
                  return [
                    '已实现: ' + fmtN(r) + ' 元',
                    '总盈亏: ' + fmtN(t) + ' 元',
                    '持仓盈亏 (gap): ' + fmtN(f) + ' 元'
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: '#F0EFEB', drawTicks: false },
              border: { display: false },
              ticks: {
                color: '#A8A8A8',
                font: { family: 'JetBrains Mono', size: 10 },
                maxTicksLimit: maxTicks,
                padding: 8
              }
            },
            y: {
              grid: { color: '#F0EFEB', drawTicks: false },
              border: { display: false },
              ticks: {
                color: '#A8A8A8',
                font: { family: 'JetBrains Mono', size: 10 },
                padding: 8,
                callback: function(value) {
                  return (value >= 0 ? '+' : '') + value.toLocaleString('zh-CN');
                }
              }
            }
          }
        },
        // v32.19: 注册右侧大括号 connector plugin (持仓盈亏 = total - realized, 末点)
        plugins: [gapConnectorPlugin],
      });
    },

    renderBenchmarkChart(bench) {
      const el = $('chart-benchmark');
      if (!el) return;
      if (this.charts.benchmark) this.charts.benchmark.destroy();
      const my = bench.my_portfolio || [];
      if (my.length === 0) {
        el.parentElement.innerHTML = '<div class="chart-loading">暂无基准对比数据</div>';
        return;
      }

      const labels = my.map(r => r.trade_date.substring(5));
      const myData = my.map(r => r.cum_pct);
      const lookup = (arr) => Object.fromEntries((arr || []).map(r => [r.trade_date, r.pct_from_baseline]));
      const shMap = lookup(bench.sh);
      const csiMap = lookup(bench.csi300);
      const shData = labels.map((_, i) => {
        const fullDate = my[i].trade_date;
        return shMap[fullDate] ?? null;
      });
      const csiData = labels.map((_, i) => {
        const fullDate = my[i].trade_date;
        return csiMap[fullDate] ?? null;
      });

      const isMobile = this._isMobile();
      const maxTicks = isMobile ? 5 : 10;

      const datasets = [
        {
          // v32.15: 末条数字同步用 max invested capital 算 (跟 summary 卡片同口径)
          label: `我的总盈亏 (含已实现) (${this._computeMyPctLabel()})`,
          data: myData,
          borderColor: '#1A1A1A',
          backgroundColor: 'rgba(26,26,26,0.06)',
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
          tension: 0.25,
        },
      ];
      if (shData.some(v => v != null)) {
        datasets.push({
          label: `上证指数 (${fmtPct(shData[shData.length - 1] || 0)})`,
          data: shData,
          borderColor: '#C45C4F',  // accent-up 暖红
          backgroundColor: 'rgba(196, 92, 79, 0.05)',
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 1.5,
          borderDash: [5, 3],  // 短虚线 (跟沪深 300 [2,4] 点线区分)
          tension: 0.25,
          spanGaps: true,
        });
      }
      if (csiData.some(v => v != null)) {
        datasets.push({
          label: `沪深 300 (${fmtPct(csiData[csiData.length - 1] || 0)})`,
          data: csiData,
          borderColor: '#3A2E26',  // accent-engrave 深棕铜版画
          backgroundColor: 'rgba(58, 46, 38, 0.05)',
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 1.5,
          borderDash: [2, 4],  // 点线 (跟上证指数 [5,3] 短虚线区分)
          tension: 0.25,
          spanGaps: true,
        });
      }

      this.charts.benchmark = new Chart(el.getContext('2d'), {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: {
                color: '#1A1A1A',
                font: { family: 'JetBrains Mono', size: isMobile ? 10 : 11 },
                boxWidth: 28,
                boxHeight: 2,
                usePointStyle: false,
                padding: 12,
              }
            },
            tooltip: {
              backgroundColor: '#1A1A1A',
              titleColor: '#F7F7F5',
              bodyColor: '#F7F7F5',
              titleFont: { family: 'JetBrains Mono', size: isMobile ? 10 : 11, weight: 600 },
              bodyFont: { family: 'JetBrains Mono', size: isMobile ? 10 : 12 },
              padding: isMobile ? 8 : 10,
              borderColor: '#3A2E26',
              borderWidth: 1,
              yAlign: isMobile ? 'bottom' : undefined,
              xAlign: isMobile ? 'center' : undefined,
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${fmtPct(ctx.parsed.y)}`,
              },
            }
          },
          scales: {
            x: {
              grid: { color: '#F0EFEB', drawTicks: false },
              border: { display: false },
              ticks: {
                color: '#A8A8A8',
                font: { family: 'JetBrains Mono', size: 10 },
                maxTicksLimit: maxTicks,
                padding: 8
              }
            },
            y: {
              grid: { color: '#F0EFEB', drawTicks: false },
              border: { display: false },
              ticks: {
                color: '#A8A8A8',
                font: { family: 'JetBrains Mono', size: 10 },
                padding: 8,
                callback: (v) => v.toFixed(1) + '%'
              }
            }
          }
        }
      });
    },

    async refresh() {
      const fab = $('refresh-fab');
      if (fab) fab.classList.add('loading');
      try {
        const data = await this.load();
        this.toast('已刷新 · ' + (data.meta?.trade_date || ''));
        if (fab) {
          fab.classList.remove('loading');
          fab.classList.add('success');
          setTimeout(() => fab.classList.remove('success'), 1500);
        }
      } catch (e) {
        if (fab) {
          fab.classList.remove('loading');
          fab.classList.add('error');
          setTimeout(() => fab.classList.remove('error'), 1500);
        }
      }
    },
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // v32.0: 启动 — bindNavTabs() 立即绑 nav.tabs click handler (不必等 load 完成),
  // 用户 fetch 未完成时点 tab 立即触发 changeTab.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      App.bindNavTabs();
      App.initAccountFunds();  // v32.10: settings tab 账户资金输入
      App.load();
    });
  } else {
    App.bindNavTabs();
    App.load();
  }

  // v32.2: window resize 监听 (debounce 200ms) 重算 tab-stage 高度 — 横竖屏切换 / 浏览器
  // 窗口 resize / 软键盘弹出收回 都会触发, 防止 tab-stage 高度 stale.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => App.updateTabStageHeight(), 200);
  });
  // v32.2: 字体异步加载完 (Google Fonts / 系统字体回落) 后, 行高变化 → 重算 tab-stage 高度.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => App.updateTabStageHeight());
  }

  window.DashboardApp = App;
})();