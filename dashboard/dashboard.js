/**
 * Mavis Stock Tracker — Dashboard.js v29.0 (2026-09-21)
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
      const tabs = document.querySelectorAll('nav.tabs a[data-tab]');
      tabs.forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const target = a.dataset.tab;
          // 切 tab 时改 summary 形态 + headpiece text + holding-card data-mode
          // (today 标准 / analysis 紧凑 / closed-trades 已实现单行 + holding 隐藏 / settings 全隐)
          const summaryEl = document.querySelector('.summary');
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
          // settings tab 占位: 走完整切 pane 路径, placeholder (⚙️ 设置: 即将上线)
          // 在 #tab-settings 自身显示 (index.html line 1350-1356 已有 placeholder)
          // 切换 active class
          tabs.forEach(x => x.classList.toggle('active', x === a));
          // 切换 pane visibility
          document.querySelectorAll('.tab-pane').forEach(p => {
            p.hidden = (p.id !== 'tab-' + target);
          });
          // 切到分析时画 charts (canvas 这时才 visible, width 正确, Chart.js 内部 layout 正常)
          // rAF 单帧: tab-analysis 在 v22.12 提到 tab-closed-trades 之外做 body 直接子, 切 tab 时
          // tab-closed-trades 仍是 hidden 不影响, tab-analysis 自身 hidden=false 后 wrap 立即有真实 clientWidth,
          // 不需要任何 retry / layout-ready 检测
          if (target === 'analysis' && this.data) {
            requestAnimationFrame(() => this.renderCharts(this.data));
          }
        });
      });
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
      const tPct = $('total-pct');
      if (tPct) {
        tPct.textContent = fmtPct(s.total_pnl_pct);
        tPct.classList.remove('up', 'down', 'neutral');
        tPct.classList.add(pnlClass(tp));
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
        if (h.change_pct != null) {
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
      const cells = [
        ['买入次数', s.buy_count != null ? s.buy_count + ' 次' : '—', 'neutral'],
        ['卖出次数', s.sell_count != null ? s.sell_count + ' 次' : '—', 'neutral'],
        ['累计买入金额', s.total_buy_amount != null ? fmtMoneyAbs(s.total_buy_amount) + ' 元' : '—', 'neutral'],
        ['累计卖出金额', s.total_sell_amount != null ? fmtMoneyAbs(s.total_sell_amount) + ' 元' : '—', 'neutral'],
        ['累计手续费', s.total_fee != null ? s.total_fee + ' 元' : '—', 'neutral'],
      ];
      grid.innerHTML = cells.map(([label, val, cls]) => `
        <div class="trade-cell">
          <div class="trade-cell-key">${label}</div>
          <div class="trade-cell-val ${cls}">${val}</div>
        </div>
      `).join('');
    },

    renderTransactions(data) {
      const list = data.transactions_recent || [];
      $('tx-count').textContent = list.length;
      $('tx-tbody').innerHTML = list.map(t => `
        <tr>
          <td>${t.trade_date}</td>
          <td class="${t.side === 'buy' ? 'up' : 'down'}">${t.side === 'buy' ? '买' : '卖'}</td>
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

      // pnlTrend: 3 datasets (红 area / 绿 area / 主 line)
      const c1 = this.charts.pnlTrend;
      if (c1) {
        newDays.forEach(r => {
          const v = r.total_pnl;
          c1.data.labels.push(r.trade_date.substring(5));
          c1.data.datasets[0].data.push(v >= 0 ? v : null);  // 红 area
          c1.data.datasets[1].data.push(v < 0 ? v : null);   // 绿 area
          c1.data.datasets[2].data.push(v);                    // 主 line
        });
        c1.update('none');  // 'none' = 不带动画
        console.log(`[charts] pnlTrend append ${newDays.length} day(s), labels=${c1.data.labels.length}`);
      }

      // benchmark: 找 my_portfolio / sh / csi300 里对应 trade_date 的 cum_pct / pct_from_baseline
      const c2 = this.charts.benchmark;
      const bench = (this.dataCache && this.dataCache.benchmark) || {};
      if (c2) {
        newDays.forEach(r => {
          const fullDate = r.trade_date;
          const myR = (bench.my_portfolio || []).find(x => x.trade_date === fullDate);
          const shR = (bench.sh || []).find(x => x.trade_date === fullDate);
          const csiR = (bench.csi300 || []).find(x => x.trade_date === fullDate);
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
      c.data.labels = series.map(r => r.trade_date.substring(5));
      c.data.datasets[0].data = series.map(r => r.total_pnl >= 0 ? r.total_pnl : null);
      c.data.datasets[1].data = series.map(r => r.total_pnl < 0 ? r.total_pnl : null);
      c.data.datasets[2].data = series.map(r => r.total_pnl);
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
      c.update('none');
      console.log(`[charts] benchmark full update, labels=${c.data.labels.length}`);
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
      const pnls = series.map(s => s.total_pnl);
      const isMobile = this._isMobile();
      const maxTicks = isMobile ? 5 : 10;

      // sub line: date range
      const rangeEl = $('pnl-range');
      if (rangeEl && series.length > 0) {
        rangeEl.textContent = `${series[0].trade_date} → ${series[series.length-1].trade_date}`;
      }
      const daysEl = $('pnl-days-count');
      if (daysEl) daysEl.textContent = series.length;

      // 折线图按 0 基准线分段面积: y>=0 红 (accent-up #C45C4F), y<0 绿 (accent-down #7A8A76)
      const ctx = el.getContext('2d');
      // 用 3 datasets: 红 area + 绿 area + 主 line (line 不 fill)
      // 红 area 只在 y>=0 时有值 (其余 null), 绿 area 只在 y<0 时有值
      const redData = pnls.map(v => v >= 0 ? v : null);
      const greenData = pnls.map(v => v < 0 ? v : null);

      this.charts.pnlTrend = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            // 红 area (y>=0) — 高透明红
            {
              label: '正面积',
              data: redData,
              borderWidth: 0,
              fill: { target: { value: 0 } },
              backgroundColor: 'rgba(196, 92, 79, 0.16)',  // accent-up #C45C4F @ 16%
              pointRadius: 0,
              tension: 0.3,
              order: 3,
            },
            // 绿 area (y<0) — 高透明绿
            {
              label: '负面积',
              data: greenData,
              borderWidth: 0,
              fill: { target: { value: 0 } },
              backgroundColor: 'rgba(122, 138, 118, 0.16)',  // accent-down #7A8A76 @ 16%
              pointRadius: 0,
              tension: 0.3,
              order: 4,
            },
            // 主 line (line 不 fill, 跨 0 连续)
            {
              label: '总 P&L',
              data: pnls,
              borderColor: '#1A1A1A',
              borderWidth: 1.5,
              fill: false,
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHoverBackgroundColor: '#1A1A1A',
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 2,
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
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
                label: (ctx) => {
                  const i = ctx.dataIndex;
                  const pnl = pnls[i];
                  const sign = pnl >= 0 ? '+' : '';
                  return sign + pnl.toLocaleString('zh-CN', {minimumFractionDigits: 2}) + ' 元';
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
        }
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
          label: `我的持仓 (${fmtPct(myData[myData.length - 1])})`,
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

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.load());
  } else {
    App.load();
  }

  window.DashboardApp = App;
})();