/**
 * Falcon Charts: Bar chart, Chart card, Share bar, Ranked row.
 * Load vendor/hala-icons.js, lists.js (createAmount), filters.css (web header), progress.js first.
 *
 * createBarChart({ values, labels, selected, average, lang, onSelect })
 *   values 7, 12 or 24. Latest period is last in LTR and first in Arabic.
 * createChartCard({ platform, state, lang, title, total, trend, stats, values, labels, selected, onSelect, onPeriod })
 *   platform "web" | "app". state "default" | "empty". Web header is the Chart filter header.
 * createShareBar({ segments, lang })  segments: { label, labelAr, value, tone }. Max 5; last fills.
 * createRankedRow({ label, labelAr, amount, share, lang })  share is 0–100 of the leader.
 *
 * Amounts and percents stay left to right in Arabic.
 */
(function () {
  const COPY = {
    en: {
      sales: "POS sales",
      appTitle: "Total sales value",
      vs: "vs previous period",
      compare: "Compare to previous",
      transactions: "Transactions",
      average: "Average sale",
      refunds: "Refunds",
      empty: "No sales in this period",
      emptyHint: "Sales show here once card payments come in.",
      schemes: "Sales by card scheme",
      branches: "Top branches",
      seeAll: "See all",
      pos: "POS",
      online: "Online",
      delivery: "Delivery",
    },
    ar: {
      sales: "مبيعات نقاط البيع",
      appTitle: "إجمالي المبيعات",
      vs: "مقابل الفترة السابقة",
      compare: "مقارنة بالفترة السابقة",
      transactions: "العمليات",
      average: "متوسط العملية",
      refunds: "المستردات",
      empty: "لا مبيعات في هذه الفترة",
      emptyHint: "تظهر المبيعات هنا بعد عمليات البطاقات.",
      schemes: "المبيعات حسب الشبكة",
      branches: "أعلى الفروع",
      seeAll: "عرض الكل",
      pos: "نقاط البيع",
      online: "إلكتروني",
      delivery: "توصيل",
    },
  };

  const DAYS = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
  const DAYS_AR = ["جمعة", "سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس"];
  const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const MONTHS_AR = ["مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر", "يناير", "فبراير", "مارس", "أبريل"];
  const WEEK = [0.58, 0.72, 0.68, 0.48, 0.51, 0.56, 0.92];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== "") node.textContent = text;
    return node;
  }

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name) {
    const set = window.halaIcons;
    if (!set || !name) return null;
    const kebab = (set.catalog && set.catalog[name]) || name;
    const node = set.icons[pascal(kebab)];
    if (!node) return null;
    const svg = set.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function amount(value, size) {
    return window.createAmount ? createAmount(value, { size: size || "s" }) : el("span", "ch-mono", Number(value).toLocaleString("en-US"));
  }

  function labelsFor(count, lang) {
    const ar = lang === "ar";
    if (count === 24) return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
    if (count === 12) return ar ? MONTHS_AR.slice() : MONTHS.slice();
    return ar ? DAYS_AR.slice() : DAYS.slice();
  }

  function valuesFor(count) {
    if (count === 7) return WEEK.map((n) => n);
    if (count === 12) return [0.42, 0.5, 0.48, 0.55, 0.62, 0.7, 0.58, 0.64, 0.72, 0.68, 0.8, 0.92];
    return Array.from({ length: 24 }, (_, i) => 0.28 + 0.55 * Math.abs(Math.sin((i + 3) / 3.4)) + (i === 18 ? 0.2 : 0));
  }

  function createBarChart(options = {}) {
    const values = options.values && options.values.length ? options.values : valuesFor(options.count || 7);
    const lang = options.lang === "ar" ? "ar" : "en";
    const labels = options.labels || labelsFor(values.length, lang);
    const max = Math.max(...values, 0.01);
    const mean = values.reduce((sum, n) => sum + n, 0) / values.length;
    let selected = options.selected;
    const root = el("div", "ch-bars");
    root.dataset.count = String(values.length);
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const plot = el("div", "ch-plot");
    [1, 2, 3].forEach(() => plot.append(el("span", "ch-grid")));
    plot.append(el("span", "ch-base"));
    const cols = el("div", "ch-cols");
    const avg = options.average !== false;
    values.forEach((value, index) => {
      const last = index === values.length - 1;
      const button = el("button", "ch-bar");
      button.type = "button";
      const ratio = value / max;
      const pos = Math.max(8, Math.round(ratio * 62));
      const online = Math.max(6, Math.round(ratio * 28));
      button.style.setProperty("--ch-h", `${pos + online}%`);
      function state() {
        if (selected === index) return "selected";
        if (selected != null) return "muted";
        return last ? "current" : "default";
      }
      button.dataset.state = state();
      button.setAttribute("aria-pressed", selected === index ? "true" : "false");
      button.setAttribute("aria-label", `${labels[index]} ${Math.round(value * 226500)}`);
      const stack = el("span", "ch-stack");
      const onlinePart = el("span", "ch-part");
      onlinePart.dataset.series = "online";
      onlinePart.style.height = `${online}%`;
      const posPart = el("span", "ch-part");
      posPart.dataset.series = "pos";
      posPart.style.height = `${pos}%`;
      stack.append(onlinePart, posPart);
      const tip = el("span", "ch-tip");
      tip.append(amount(Math.round(value * 226500), "xs"));
      tip.dir = "ltr";
      button.append(stack, tip);
      button.addEventListener("click", () => {
        selected = selected === index ? undefined : index;
        [...cols.children].forEach((child, childIndex) => {
          const on = selected === childIndex;
          child.dataset.state = on ? "selected" : selected != null ? "muted" : (childIndex === values.length - 1 ? "current" : "default");
          child.setAttribute("aria-pressed", on ? "true" : "false");
        });
        if (options.onSelect) options.onSelect(selected, { value, label: labels[index] });
      });
      cols.append(button);
    });
    plot.append(cols);
    if (avg) {
      const line = el("span", "ch-avg");
      line.style.setProperty("--ch-avg", `${Math.round((mean / max) * 100)}%`);
      plot.append(line);
    }
    const axis = el("div", "ch-axis");
    labels.forEach((label) => axis.append(el("span", "", label)));
    root.append(plot, axis);
    return root;
  }

  function emptyPlot(copy, tall) {
    const wrap = el("div", "ch-empty");
    if (tall) wrap.dataset.tall = "true";
    wrap.append(el("span", "ch-empty-line"));
    wrap.append(el("strong", "", copy.empty), el("p", "", copy.emptyHint));
    return wrap;
  }

  function statsRow(copy, lang, extras) {
    const row = el("div", "ch-stats");
    const items = [
      [copy.transactions, extras && extras.transactions != null ? extras.transactions : 5494, "count"],
      [copy.average, extras && extras.average != null ? extras.average : 52.5, "amount"],
    ];
    if (extras && extras.refunds != null) items.push([copy.refunds, extras.refunds, "amount"]);
    items.forEach(([label, value, kind]) => {
      const cell = el("div", "ch-stat");
      cell.append(el("span", "ch-stat-label", label));
      if (kind === "amount") cell.append(amount(value, "s"));
      else cell.append(el("span", "ch-stat-value", Number(value).toLocaleString("en-US")));
      row.append(cell);
    });
    return row;
  }

  function webHeader(options, copy, lang) {
    const head = el("div", "flt-chart-head ch-web-head");
    const totals = el("div", "flt-total-wrap");
    const kicker = el("span", "flt-kicker", options.title || copy.sales);
    const total = el("span", "ch-total");
    total.append(amount(options.total == null ? 226500 : options.total, "l"));
    const delta = el("span", "ch-delta");
    delta.dataset.up = "true";
    const up = icon("trend-up");
    if (up) delta.append(up);
    delta.append(el("span", "", `${options.trend == null ? "12.4" : options.trend}% ${copy.vs}`));
    totals.append(kicker, total, delta);
    const tools = el("div", "flt-chart-tools");
    const periods = ["7D", "1M", "3M", "1Y"];
    let period = options.period || 0;
    const segment = el("div", "flt-segment");
    segment.dataset.size = "xs";
    segment.setAttribute("role", "radiogroup");
    segment.setAttribute("aria-label", lang === "ar" ? "الفترة" : "Period");
    periods.forEach((label, index) => {
      const button = el("button", "flt-seg", label);
      button.type = "button";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", index === period ? "true" : "false");
      button.addEventListener("click", () => {
        period = index;
        [...segment.children].forEach((child, childIndex) => {
          child.setAttribute("aria-checked", childIndex === period ? "true" : "false");
        });
        if (options.onPeriod) options.onPeriod(index, [7, 12, 12, 12][index]);
      });
      segment.append(button);
    });
    const compare = el("button", "flt-compare");
    compare.type = "button";
    compare.setAttribute("aria-pressed", "true");
    compare.append(el("span", "flt-dash"), document.createTextNode(copy.compare));
    compare.addEventListener("click", () => {
      const on = compare.getAttribute("aria-pressed") !== "true";
      compare.setAttribute("aria-pressed", on ? "true" : "false");
      const card = head.closest(".ch-card");
      if (card) card.querySelectorAll(".ch-avg").forEach((line) => { line.hidden = !on; });
    });
    tools.append(segment, compare);
    head.append(totals, tools);
    const seriesRow = el("div", "flt-series-row");
    seriesRow.setAttribute("role", "group");
    [["POS", copy.pos, "pos", true], ["Online", copy.online, "online", true], ["Delivery", copy.delivery, "delivery", false]].forEach(([key, label, swatch, on]) => {
      const button = el("button", "flt-series", label);
      button.type = "button";
      button.setAttribute("aria-pressed", on ? "true" : "false");
      const mark = el("span", "flt-swatch");
      mark.dataset.series = swatch;
      button.prepend(mark);
      button.addEventListener("click", () => {
        const next = button.getAttribute("aria-pressed") !== "true";
        const pressed = [...seriesRow.querySelectorAll("[aria-pressed='true']")];
        if (!next && pressed.length === 1 && pressed[0] === button) return;
        button.setAttribute("aria-pressed", next ? "true" : "false");
      });
      seriesRow.append(button);
    });
    return { head, seriesRow };
  }

  function createChartCard(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const platform = options.platform === "app" ? "app" : "web";
    const empty = options.state === "empty";
    const root = el("article", "ch-card");
    root.dataset.platform = platform;
    root.dataset.state = empty ? "empty" : "default";
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const count = options.values ? options.values.length : (options.count || 7);
    const values = options.values || valuesFor(count);
    const labels = options.labels || labelsFor(values.length, lang);
    let chart = null;

    function plot(nextValues, nextLabels) {
      if (empty) return emptyPlot(copy, platform === "web");
      return createBarChart({
        values: nextValues || values,
        labels: nextLabels || labels,
        selected: options.selected,
        lang,
        onSelect: options.onSelect,
      });
    }

    if (platform === "web") {
      const header = webHeader({
        ...options,
        onPeriod: (index, bars) => {
          const next = valuesFor(bars);
          const nextLabels = labelsFor(bars, lang);
          const fresh = plot(next, nextLabels);
          if (chart && chart.parentNode) chart.replaceWith(fresh);
          chart = fresh;
          if (options.onPeriod) options.onPeriod(index, bars);
        },
      }, copy, lang);
      chart = plot();
      root.append(header.head, header.seriesRow, chart);
      if (!empty) {
        root.append(el("hr", "ch-rule"), statsRow(copy, lang, { transactions: 5494, average: 52.5, refunds: 1240 }));
      }
      return root;
    }

    const total = el("div", "ch-app-total");
    total.append(el("span", "ch-kicker", options.title || copy.appTitle));
    const figure = el("div", "ch-app-figure");
    figure.append(amount(empty ? 0 : (options.total == null ? 288410 : options.total), "l"));
    if (!empty) {
      const delta = el("span", "ch-delta");
      delta.dataset.up = "true";
      const up = icon("trend-up");
      if (up) delta.append(up);
      delta.append(el("span", "", `${options.trend == null ? "6.2" : options.trend}% ${copy.vs}`));
      figure.append(delta);
    }
    total.append(figure);
    chart = plot();
    root.append(total, chart);
    if (!empty) root.append(el("hr", "ch-rule"), statsRow(copy, lang, { transactions: 5494, average: 52.5 }));
    return root;
  }

  function createShareBar(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const segments = (options.segments || [
      { label: "mada", labelAr: "مدى", value: 38.8, tone: 1 },
      { label: "Visa", labelAr: "فيزا", value: 27.4, tone: 2 },
      { label: "Mastercard", labelAr: "ماستركارد", value: 21.6, tone: 3 },
      { label: "Other", labelAr: "أخرى", value: 12.2, tone: 4 },
    ]).slice(0, 5);
    const root = el("div", "ch-share");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const track = el("div", "ch-segments");
    const legend = el("div", "ch-legend");
    segments.forEach((item, index) => {
      const part = el("span", "ch-seg");
      part.dataset.tone = String(item.tone || index + 1);
      part.style.flex = String(item.value);
      track.append(part);
      const row = el("span", "ch-legend-item");
      const swatch = el("span", "ch-swatch");
      swatch.dataset.tone = String(item.tone || index + 1);
      const pct = el("span", "ch-pct", `${item.value}%`);
      pct.dir = "ltr";
      row.append(swatch, el("span", "ch-legend-label", lang === "ar" ? (item.labelAr || item.label) : item.label), pct);
      legend.append(row);
    });
    root.append(track, legend);
    return root;
  }

  function createRankedRow(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const root = el("div", "ch-rank");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const top = el("div", "ch-rank-top");
    top.append(el("span", "ch-rank-label", lang === "ar" ? (options.labelAr || options.label) : options.label || "Olaya, Riyadh"));
    top.append(amount(options.amount == null ? 412600 : options.amount, "s"));
    const bar = window.createProgressBar
      ? createProgressBar({ value: options.share == null ? 100 : options.share, size: "s", label: options.label || "Olaya, Riyadh" })
      : el("span", "ch-rank-bar");
    root.append(top, bar);
    return root;
  }

  window.createBarChart = createBarChart;
  window.createChartCard = createChartCard;
  window.createShareBar = createShareBar;
  window.createRankedRow = createRankedRow;
  window.CHART_DAYS = DAYS;
  window.CHART_WEEK = WEEK;
})();
