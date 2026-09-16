/**
 * Mavis Stock Tracker — Dashboard.js
 * 拉 /data/dashboard.json, 填充三段式 / 持仓 / 已清仓 / 交易 + 渲染 2 张 Chart.js 图
 *
 * 数据契约 (dashboard.json schema_version=2):
 *   meta: {generated_at, trade_date, source, schema_version}
 *   summary: {floating_pnl_abs/pct, realized_pnl_abs/pct, total_pnl_abs/pct,
 *              initial_principal, excess_csi300_pct, excess_sh_pct}
 *   holdings: [{code, name, shares, cost, close, pnl_abs, pnl_pct, contribution_pct}]
 *   closed_holdings: [{code, name, closed_at, cost_total, recv_total, realized_abs, realized_pct}]
 *   transactions_recent: [{trade_date, code, name, side, shares, price}]
 *   trade_summary: {buy_count, sell_count, total_buy_amount, total_sell_amount, total_fee}
 *   pnl_series: [{trade_date, total_cost, total_mkt, total_pnl, total_pct}]
 *   benchmark: {first_buy_date, my_portfolio:[{trade_date, cum_pct}],
 *               sh:[...], sz:[...], csi300:[...]}
 */
(function () {
  'use strict';

  const DATA_URL = 'data/dashboard.json';
  const $ = (id) => document.getElementById(id);
  const fmtMoney = (x) => x == null ? '—' : (x >= 0 ? '+' : '') + x.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const fmtMoneyAbs = (x) => x == null ? '—' : Math.abs(x).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const fmtPct = (x) => x == null ? '—' : (x >= 0 ? '+' : '') + x.toFixed(2) + '%';
  const pnlClass = (x) => x > 0 ? 'red' : (x < 0 ? 'green' : '');  // 中文习惯: 盈=红, 亏=绿

  const App = {
    charts: {},

    async load() {
      try {
        const r = await fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-cache' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        if (data.meta && data.meta.schema_version !== 2) {
          console.warn('[dashboard] schema_version 不匹配, 当前=' + data.meta.schema_version);
        }
        this.render(data);
        return data;
      } catch (e) {
        this.showError('数据加载失败: ' + e.message);
        throw e;
      }
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

    render(data) {
      this.renderHeader(data);
      this.renderHero(data);
      this.renderInitialPrincipal(data);
      this.renderExcess(data);
      this.renderHoldings(data);
      this.renderClosed(data);
      this.renderContribution(data);
      this.renderTradeSummary(data);
      this.renderTransactions(data);
      this.renderCharts(data);
    },

    renderHeader(data) {
      const m = data.meta || {};
      const t = m.trade_date || '—';
      const g = m.generated_at || '';
      const time = g ? g.split('T')[1]?.substring(0, 5) : '';
      const dateEl = $('header-date');
      if (dateEl) dateEl.textContent = `${t} · 更新于 ${time || '—'}`;
      document.title = `持仓 Dashboard · ${t}`;
    },

    renderHero(data) {
      const s = data.summary || {};
      const set = (id, v, withSign) => {
        const el = $(id);
        if (!el) return;
        el.textContent = withSign ? fmtMoney(v) : fmtMoneyAbs(v);
      };
      // floating
      const fp = s.floating_pnl_abs;
      const fEl = $('floating-abs');
      if (fEl) {
        fEl.textContent = fmtMoney(fp);
        fEl.className = 'hero-money ' + pnlClass(fp);
      }
      $('floating-pct').textContent = fmtPct(s.floating_pnl_pct);

      const rp = s.realized_pnl_abs;
      const rEl = $('realized-abs');
      if (rEl) {
        rEl.textContent = fmtMoney(rp);
        rEl.className = 'hero-money ' + pnlClass(rp);
      }
      $('realized-pct').textContent = fmtPct(s.realized_pnl_pct);

      const tp = s.total_pnl_abs;
      const tEl = $('total-abs');
      if (tEl) {
        tEl.textContent = fmtMoney(tp);
        tEl.className = 'hero-money ' + pnlClass(tp);
      }
      $('total-pct').textContent = fmtPct(s.total_pnl_pct);

      // hero bg color
      const hero = $('hero-pnl');
      if (hero) {
        hero.style.setProperty('--hero-bg',
          tp >= 0 ? 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)'
                  : 'linear-gradient(135deg, #047857 0%, #064e3b 100%)');
      }
    },

    renderInitialPrincipal(data) {
      const s = data.summary || {};
      const el = $('initial-principal');
      if (el) el.textContent = (s.initial_principal || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    },

    renderExcess(data) {
      const s = data.summary || {};
      const box = $('excess-box');
      if (!box) return;
      if (s.excess_csi300_pct == null && s.excess_sh_pct == null) {
        box.style.display = 'none';
        return;
      }
      box.style.display = '';
      $('excess-csi300').textContent = (s.excess_csi300_pct >= 0 ? '🔴 跑赢' : '🟢 跑输') + ' 沪深 300: ' + fmtPct(s.excess_csi300_pct);
      $('excess-sh').textContent = (s.excess_sh_pct >= 0 ? '🔴 跑赢' : '🟢 跑输') + ' 上证指数: ' + fmtPct(s.excess_sh_pct);
    },

    renderHoldings(data) {
      const list = data.holdings || [];
      const container = $('holdings-list');
      $('holdings-count').textContent = list.length;
      if (!container) return;
      container.innerHTML = list.map(h => {
        const loss = h.pnl_abs < 0;
        return `
          <div class="holding-card ${loss ? 'loss' : ''}">
            <div class="name">${escapeHtml(h.name)} <span style="color:#9ca3af;font-weight:normal">(${h.code})</span></div>
            <div class="row"><span class="k">持仓</span><span>${h.shares.toLocaleString()} 股</span></div>
            <div class="row"><span class="k">成本</span><span>${h.cost.toFixed(3)}</span></div>
            <div class="row"><span class="k">现价</span><span>${h.close.toFixed(3)}</span></div>
            <div class="row"><span class="k">盈亏</span><span class="${pnlClass(h.pnl_abs)}">${fmtMoney(h.pnl_abs)} (${fmtPct(h.pnl_pct)})</span></div>
          </div>`;
      }).join('');
    },

    renderClosed(data) {
      const list = data.closed_holdings || [];
      const section = $('closed-section');
      $('closed-count').textContent = list.length;
      if (list.length === 0) {
        section.style.display = 'none';
        return;
      }
      section.style.display = '';
      const totalRealized = list.reduce((s, c) => s + (c.realized_abs || 0), 0);
      const totalReleased = list.reduce((s, c) => s + (c.cost_total || 0), 0);
      $('closed-summary').innerHTML = `清仓释放本金 <b>${fmtMoneyAbs(totalReleased)}</b> 元 · 累计实现 <b style="color:${totalRealized>=0?'#ef4444':'#10b981'}">${fmtMoney(totalRealized)}</b> 元`;
      $('closed-list').innerHTML = list.map(c => `
        <div class="holding-card loss" style="border-left-color:#6b7280">
          <div class="name">${escapeHtml(c.name)} <span style="color:#9ca3af;font-weight:normal">(${c.code}) 已清仓</span></div>
          <div class="row"><span class="k">清仓日</span><span>${c.closed_at}</span></div>
          <div class="row"><span class="k">成本</span><span>${fmtMoneyAbs(c.cost_total)}</span></div>
          <div class="row"><span class="k">收回</span><span>${fmtMoneyAbs(c.recv_total)}</span></div>
          <div class="row"><span class="k">实现盈亏</span><span class="${pnlClass(c.realized_abs)}">${fmtMoney(c.realized_abs)} (${fmtPct(c.realized_pct)})</span></div>
        </div>`).join('');
    },

    renderContribution(data) {
      const list = data.holdings || [];
      const tbody = $('contribution-tbody');
      if (!tbody) return;
      tbody.innerHTML = list.map(h => `
        <tr>
          <td>${escapeHtml(h.name)}</td>
          <td class="num">${h.shares.toLocaleString()}</td>
          <td class="num">${h.cost.toFixed(3)}</td>
          <td class="num">${h.close.toFixed(3)}</td>
          <td class="num ${pnlClass(h.pnl_abs)}">${fmtMoney(h.pnl_abs)}</td>
          <td class="num ${pnlClass(h.pnl_abs)}">${fmtPct(h.pnl_pct)}</td>
          <td class="num ${h.contribution_pct >= 0 ? 'red' : 'green'}">${h.contribution_pct >= 0 ? '+' : ''}${h.contribution_pct.toFixed(1)}%</td>
        </tr>`).join('');
    },

    renderTradeSummary(data) {
      const s = data.trade_summary || {};
      const grid = $('trade-summary-grid');
      if (!grid) return;
      const cells = [
        ['买入次数', s.buy_count, '#10b981'],
        ['卖出次数', s.sell_count, '#ef4444'],
        ['累计买入金额', s.total_buy_amount != null ? s.total_buy_amount.toLocaleString('zh-CN') : '—', null],
        ['累计卖出金额', s.total_sell_amount != null ? s.total_sell_amount.toLocaleString('zh-CN') : '—', null],
        ['累计手续费', s.total_fee + ' 元', '#f59e0b'],
      ];
      grid.innerHTML = cells.map(([label, val, color]) => {
        const isWide = label === '累计手续费';
        return `<div style="background:#1f1f1f;padding:12px;border-radius:6px;text-align:center${isWide ? ';grid-column:span 2' : ''}">
          <div style="font-size:11px;color:#9ca3af">${label}</div>
          <div style="font-size:${isWide ? 20 : 24}px;font-weight:${isWide ? 700 : 700};color:${color || '#fff'}">${val}</div>
        </div>`;
      }).join('');
    },

    renderTransactions(data) {
      const list = data.transactions_recent || [];
      $('tx-count').textContent = list.length;
      $('tx-tbody').innerHTML = list.map(t => `
        <tr>
          <td>${t.trade_date}</td>
          <td>${t.side === 'buy' ? '🟢 买' : '🔴 卖'}</td>
          <td>${escapeHtml(t.name)}</td>
          <td class="num">${t.shares.toLocaleString()}</td>
          <td class="num">${t.price.toFixed(3)}</td>
        </tr>`).join('');
    },

    renderCharts(data) {
      this.renderPnlTrendChart(data.pnl_series || []);
      this.renderBenchmarkChart(data.benchmark || {});
    },

    renderPnlTrendChart(series) {
      const el = $('chart-pnl-trend');
      if (!el) return;
      if (this.charts.pnlTrend) this.charts.pnlTrend.destroy();
      if (series.length === 0) {
        el.parentElement.innerHTML = '<div class="chart-loading">暂无 PnL 数据</div>';
        return;
      }
      const labels = series.map(s => s.trade_date);
      const pnls = series.map(s => s.total_pnl);
      const pcts = series.map(s => s.total_pct);
      const colors = pnls.map(p => p >= 0 ? '#ef4444' : '#10b981');
      const fillColors = pnls.map(p => p >= 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)');

      this.charts.pnlTrend = new Chart(el.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              type: 'line',
              label: '总盈亏金额 (元)',
              data: pnls,
              borderColor: pnls[pnls.length - 1] >= 0 ? '#ef4444' : '#10b981',
              backgroundColor: fillColors[fillColors.length - 1],
              fill: false,
              tension: 0.25,
              pointRadius: 5,
              pointBackgroundColor: '#fff',
              pointBorderColor: colors.map(c => c),
              pointBorderWidth: 2,
              order: 1,
              yAxisID: 'y',
            },
            {
              type: 'bar',
              label: '总盈亏率 (%)',
              data: pcts,
              backgroundColor: colors,
              borderColor: colors,
              borderWidth: 0,
              order: 2,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { labels: { color: '#e5e5e5', font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const v = ctx.parsed.y;
                  if (ctx.dataset.yAxisID === 'y') return `盈亏: ${v >= 0 ? '+' : ''}${v.toFixed(2)} 元`;
                  return `盈亏率: ${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
                },
              },
            },
            title: { display: true, text: `总盈亏金额变化 · 过去 ${series.length} 个交易日`, color: '#fbbf24', font: { size: 13, weight: 'bold' } },
          },
          scales: {
            x: { ticks: { color: '#9ca3af', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }, grid: { color: '#262626' } },
            y: { position: 'left', ticks: { color: '#e5e5e5', callback: (v) => v.toFixed(0) + '元' }, grid: { color: '#262626' }, title: { display: true, text: '金额 (元)', color: '#e5e5e5' } },
            y1: { position: 'right', ticks: { color: '#e5e5e5', callback: (v) => v.toFixed(1) + '%' }, grid: { display: false }, title: { display: true, text: '盈亏率 (%)', color: '#e5e5e5' } },
          },
        },
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

      const labels = my.map(r => r.trade_date);
      const myData = my.map(r => r.cum_pct);
      // For sh/csi300, align to same labels (取对应日期的 pct_from_baseline)
      const lookup = (arr) => Object.fromEntries((arr || []).map(r => [r.trade_date, r.pct_from_baseline]));
      const shMap = lookup(bench.sh);
      const csiMap = lookup(bench.csi300);
      const shData = labels.map(d => shMap[d] ?? null);
      const csiData = labels.map(d => csiMap[d] ?? null);

      const datasets = [
        {
          label: `我的持仓 (${fmtPct(myData[myData.length - 1])})`,
          data: myData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.1)',
          pointRadius: 5,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#ef4444',
          pointBorderWidth: 2,
          tension: 0.25,
        },
      ];
      if (shData.some(v => v != null)) {
        datasets.push({
          label: `上证指数 (${fmtPct(shData[shData.length - 1] || 0)})`,
          data: shData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.1)',
          pointRadius: 3,
          tension: 0.25,
          spanGaps: true,
        });
      }
      if (csiData.some(v => v != null)) {
        datasets.push({
          label: `沪深 300 (${fmtPct(csiData[csiData.length - 1] || 0)})`,
          data: csiData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          pointRadius: 3,
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
            legend: { labels: { color: '#e5e5e5', font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${fmtPct(ctx.parsed.y)}`,
              },
            },
            title: { display: true, text: '累计收益率对比 · 持仓 vs 大盘', color: '#fbbf24', font: { size: 13, weight: 'bold' } },
          },
          scales: {
            x: { ticks: { color: '#9ca3af', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }, grid: { color: '#262626' } },
            y: { ticks: { color: '#e5e5e5', callback: (v) => v.toFixed(1) + '%' }, grid: { color: '#262626' }, title: { display: true, text: '累计收益率 (%)', color: '#e5e5e5' } },
          },
        },
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