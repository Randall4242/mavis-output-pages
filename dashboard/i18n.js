// Dashboard i18n
const I18N = {
  zh: {
    title: "持仓 Dashboard",
    updateAt: "更新于",
    section1: "三段式盈亏 (今日)",
    label1: "① 持仓盈亏",
    sublabel1: "(持仓浮盈/亏)",
    label2: "② 已实现盈亏",
    sublabel2: "(已落袋)",
    label3: "③ 总投资盈亏",
    sublabel3: "①+②",
    sublabel3b: "总% vs 初始总投入",
    initialPrincipal: "初始总投入",
    section2: "当前持仓",
    section3: "已清仓",
    released: "清仓释放本金",
    realizedTotal: "累计实现",
    section4: "持仓贡献排行 (今日)",
    section5: "交易汇总",
    buyCount: "买入次数",
    sellCount: "卖出次数",
    totalBuy: "累计买入金额",
    totalSell: "累计卖出金额",
    totalFee: "累计手续费",
    section6: "累计盈亏趋势",
    section7: "累计收益率 vs 大盘",
    section8: "交易记录",
    footer: "Mavis Stock Tracker · v4.0 · 部署于 GitHub Pages",
    repo: "代码仓库",
    langLabel: "EN",
  },
  en: {
    title: "Portfolio Dashboard",
    updateAt: "Updated at",
    section1: "Three-section P&L (Today)",
    label1: "① Holding P&L",
    sublabel1: "Unrealized gain/loss",
    label2: "② Realized P&L",
    sublabel2: "Already cashed",
    label3: "③ Total P&L",
    sublabel3: "①+②",
    sublabel3b: "Total % vs initial investment",
    initialPrincipal: "Initial investment",
    section2: "Current Holdings",
    section3: "Closed Positions",
    released: "Released principal",
    realizedTotal: "Realized P&L",
    section4: "Holdings Contribution (Today)",
    section5: "Trade Summary",
    buyCount: "Buy count",
    sellCount: "Sell count",
    totalBuy: "Total buy amount",
    totalSell: "Total sell amount",
    totalFee: "Total fees",
    section6: "P&L Trend",
    section7: "Cumulative Return vs Market",
    section8: "Transactions",
    footer: "Mavis Stock Tracker · v4.0 · Deployed via GitHub Pages",
    repo: "Source",
    langLabel: "中",
  }
};

let currentLang = (new URLSearchParams(location.search).get("lang")) || "zh";
function t(key) { return I18N[currentLang][key] || key; }

function applyLang() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (k && typeof t(k) === "string") el.textContent = t(k);
  });
  const btn = document.getElementById("lang-btn");
  if (btn) btn.textContent = t("langLabel");
}
function toggleLang() {
  currentLang = currentLang === "zh" ? "en" : "zh";
  const url = new URL(location.href);
  if (currentLang === "en") url.searchParams.set("lang", "en");
  else url.searchParams.delete("lang");
  history.replaceState(null, "", url);
  applyLang();
}
document.addEventListener("DOMContentLoaded", applyLang);
