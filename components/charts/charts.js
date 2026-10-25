/**
 * HALA DNA Charts: Bar chart, Chart card, Share bar, Ranked row.
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

  const FLOW_MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const FLOW_MONTHS_AR = ["نوفمبر", "ديسمبر", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر"];
  const FLOW_IN = [412, 388, 455, 430, 498, 520, 476, 540, 565, 512, 590, 612];
  const FLOW_OUT = [365, 402, 398, 421, 450, 470, 488, 455, 510, 530, 520, 548];

  function money(value) {
    return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function sparkPath(values, width, height, pad) {
    const low = Math.min(...values);
    const high = Math.max(...values);
    const span = high - low || 1;
    const points = values.map((value, index) => [
      (index / (values.length - 1)) * width,
      pad + (1 - (value - low) / span) * (height - pad * 2),
    ]);
    const line = points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
    return { line, area: `${line} L${width} ${height} L0 ${height} Z` };
  }

  function createSparkline(options = {}) {
    const values = options.values && options.values.length ? options.values : [12, 18, 15, 22, 25, 21, 25];
    const path = sparkPath(values, 200, 44, 4);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 200 44");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("ch-spark");
    svg.dataset.tone = options.tone || "up";
    svg.setAttribute("aria-hidden", "true");
    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", path.area);
    area.classList.add("ch-spark-area");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", path.line);
    svg.append(area, line);
    return svg;
  }

  function createCashFlowChart(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    let range = options.range === 6 ? 6 : 12;
    let hover = null;
    const root = el("article", "ch-dash ch-flow");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const head = el("div", "ch-dash-head");
    const sums = el("div", "ch-flow-sums");
    const tools = el("div", "ch-dash-tools");
    if (window.createButtonGroup) {
      tools.append(createButtonGroup({
        kind: "segment",
        size: "sm",
        label: lang === "ar" ? "المدى" : "Range",
        value: String(range),
        options: [
          { label: lang === "ar" ? "6 أشهر" : "6 months", value: "6" },
          { label: lang === "ar" ? "12 شهرًا" : "12 months", value: "12" },
        ],
        onChange(value) {
          range = Number(value);
          hover = null;
          paint();
        },
      }));
    }
    head.append(sums, tools);
    const plot = el("div", "ch-flow-plot");
    const axis = el("div", "ch-flow-axis");
    ["600K", "400K", "200K", "0"].forEach((label) => axis.append(el("span", "", label)));
    const body = el("div", "ch-flow-body");
    const grid = el("div", "ch-flow-grid");
    grid.setAttribute("aria-hidden", "true");
    [1, 2, 3, 4].forEach(() => grid.append(el("span")));
    const cols = el("div", "ch-flow-cols");
    const tip = el("div", "ch-flow-tip");
    tip.hidden = true;
    body.append(grid, cols, tip);
    plot.append(axis, body);
    root.append(head, plot);

    function slice() {
      const offset = 12 - range;
      return {
        months: (lang === "ar" ? FLOW_MONTHS_AR : FLOW_MONTHS).slice(offset),
        income: FLOW_IN.slice(offset),
        spend: FLOW_OUT.slice(offset),
        offset,
      };
    }

    function paint() {
      const data = slice();
      const totalIn = data.income.reduce((sum, value) => sum + value, 0) * 1000;
      const totalOut = data.spend.reduce((sum, value) => sum + value, 0) * 1000;
      const net = totalIn - totalOut;
      sums.replaceChildren();
      [
        [lang === "ar" ? "وارد" : "Money in", totalIn, "in", ""],
        [lang === "ar" ? "صادر" : "Money out", totalOut, "out", ""],
        [lang === "ar" ? "الصافي" : "Net", Math.abs(net), "net", net >= 0 ? "up" : "down"],
      ].forEach(([label, value, swatch, tone]) => {
        const item = el("div", "ch-flow-sum");
        if (tone) item.dataset.tone = tone;
        const name = el("span", "ch-kicker");
        const mark = el("span", "ch-swatch");
        mark.dataset.tone = swatch === "in" ? "1" : swatch === "out" ? "out" : "net";
        name.append(mark, document.createTextNode(label));
        const figure = amount(value, "s");
        if (tone === "down") figure.dataset.kind = "muted";
        item.append(name, figure);
        sums.append(item);
      });
      cols.replaceChildren();
      data.months.forEach((month, index) => {
        const col = el("button", "ch-flow-col");
        col.type = "button";
        col.setAttribute("aria-label", month);
        const pair = el("div", "ch-flow-pair");
        [["in", data.income[index]], ["out", data.spend[index]]].forEach(([name, value]) => {
          const bar = el("span", "ch-flow-bar");
          bar.dataset.series = name;
          bar.style.height = `${Math.min(100, (value / 600) * 100)}%`;
          pair.append(bar);
        });
        col.append(pair, el("span", "", month));
        col.addEventListener("mouseenter", () => { hover = index; paintHover(); });
        col.addEventListener("focus", () => { hover = index; paintHover(); });
        cols.append(col);
      });
      paintHover();
    }

    function paintHover() {
      const data = slice();
      [...cols.children].forEach((col, index) => {
        col.dataset.on = hover === index ? "true" : "false";
        col.dataset.dim = hover != null && hover !== index ? "true" : "false";
      });
      if (hover == null) {
        tip.hidden = true;
        return;
      }
      const netMonth = (data.income[hover] - data.spend[hover]) * 1000;
      tip.hidden = false;
      tip.dataset.side = hover > data.months.length / 2 ? "end" : "start";
      tip.style.insetInlineStart = `${((hover + 0.5) / data.months.length) * 100}%`;
      tip.replaceChildren(el("strong", "", `${data.months[hover]} ${hover + data.offset >= 2 ? "2026" : "2025"}`));
      [
        [lang === "ar" ? "وارد" : "In", data.income[hover] * 1000, "in"],
        [lang === "ar" ? "صادر" : "Out", data.spend[hover] * 1000, "out"],
      ].forEach(([label, value, tone]) => {
        const row = el("div", "ch-flow-tip-row");
        const name = el("span", "", label);
        name.dataset.tone = tone;
        row.append(name, amount(value, "xs"));
        tip.append(row);
      });
      const netRow = el("div", "ch-flow-tip-row");
      netRow.dataset.net = "true";
      netRow.append(el("span", "", lang === "ar" ? "الصافي" : "Net"), amount(netMonth, "xs"));
      tip.append(netRow);
    }

    plot.addEventListener("mouseleave", () => {
      if (hover == null) return;
      hover = null;
      paintHover();
    });
    paint();
    return root;
  }

  function createBalanceLine(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const width = 600;
    const height = 200;
    const low = 300000;
    const high = 1400000;
    const rows = [];
    let value = 1150000;
    for (let index = 0; index < 30; index += 1) {
      value += Math.sin(index * 1.7) * 26000 + (index % 7 === 3 ? -62000 : 14000) + (index === 24 ? -120000 : 0) + (index === 26 ? 160000 : 0);
      rows.push(Math.round(value * 100) / 100);
    }
    rows[29] = 1284530.2;
    let point = null;
    const root = el("article", "ch-dash ch-line");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const head = el("div", "ch-dash-head");
    const totals = el("div", "ch-line-totals");
    const label = el("span", "ch-kicker", lang === "ar" ? "الحساب الرئيسي · اليوم" : "Main account · today");
    const figure = el("div", "ch-line-figure");
    const delta = el("span", "ch-delta");
    totals.append(label, figure, delta);
    head.append(totals);
    const plot = el("div", "ch-line-plot");
    const stage = el("div", "ch-line-stage");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("ch-line-svg");
    svg.setAttribute("aria-hidden", "true");
    const payroll = el("span", "ch-line-payroll", lang === "ar" ? "الرواتب · 340,000" : "Payroll due · 340,000");
    const cross = el("span", "ch-line-cross");
    const dot = el("span", "ch-line-dot");
    cross.hidden = true;
    dot.hidden = true;
    const hits = el("div", "ch-line-hits");
    stage.append(svg, payroll, cross, dot, hits);
    const dates = el("div", "ch-line-dates");
    ["22 Sep", "29 Sep", "6 Oct", "13 Oct", "21 Oct"].forEach((text) => dates.append(el("span", "", text)));
    plot.append(stage, dates);
    root.append(head, plot);

    function dayLabel(index) {
      return new Date(2026, 8, 22 + index).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB", { day: "numeric", month: "short" });
    }

    function paint() {
      const points = rows.map((row, index) => [
        (index / 29) * width,
        height - ((row - low) / (high - low)) * height,
      ]);
      const line = points.map((pt, index) => `${index ? "L" : "M"}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ");
      svg.replaceChildren();
      const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
      area.setAttribute("d", `${line} L${width} ${height} L0 ${height} Z`);
      area.classList.add("ch-line-area");
      const threshold = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const thresholdY = height - ((340000 - low) / (high - low)) * height;
      threshold.setAttribute("x1", "0");
      threshold.setAttribute("x2", String(width));
      threshold.setAttribute("y1", thresholdY.toFixed(1));
      threshold.setAttribute("y2", thresholdY.toFixed(1));
      threshold.classList.add("ch-line-threshold");
      const stroke = document.createElementNS("http://www.w3.org/2000/svg", "path");
      stroke.setAttribute("d", line);
      stroke.classList.add("ch-line-stroke");
      svg.append(area, threshold, stroke);
      payroll.style.insetBlockStart = `${(thresholdY / height) * 100}%`;
      const index = point == null ? 29 : point;
      const change = rows[index] - rows[0];
      label.textContent = point == null
        ? (lang === "ar" ? "الحساب الرئيسي · اليوم" : "Main account · today")
        : `${dayLabel(index)} · ${lang === "ar" ? "الرصيد" : "closing balance"}`;
      figure.replaceChildren(amount(rows[index], "l"));
      delta.dataset.up = change >= 0 ? "true" : "false";
      delta.textContent = `${change >= 0 ? (lang === "ar" ? "ارتفاع " : "Up ") : (lang === "ar" ? "انخفاض " : "Down ")}${money(Math.abs(change))} ${lang === "ar" ? "منذ 22 سبتمبر" : "since 22 Sep"}`;
      const active = point != null;
      cross.hidden = !active;
      dot.hidden = !active;
      if (active) {
        cross.style.insetInlineStart = `${(points[index][0] / width) * 100}%`;
        dot.style.insetInlineStart = `${(points[index][0] / width) * 100}%`;
        dot.style.insetBlockStart = `${(points[index][1] / height) * 100}%`;
      }
    }

    hits.replaceChildren();
    rows.forEach((_, index) => {
      const hit = el("button", "ch-line-hit");
      hit.type = "button";
      hit.setAttribute("aria-label", dayLabel(index));
      hit.addEventListener("mouseenter", () => { point = index; paint(); });
      hit.addEventListener("focus", () => { point = index; paint(); });
      hits.append(hit);
    });
    plot.addEventListener("mouseleave", () => {
      if (point == null) return;
      point = null;
      paint();
    });
    paint();
    return root;
  }

  function createSparkRows(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const rows = options.rows || [
      { label: "Nour Trading Co", labelAr: "نور للتجارة", values: [12, 18, 15, 22, 25, 21, 25], amount: 25000, change: "+ 19%", tone: "up" },
      { label: "Google Ads", labelAr: "إعلانات غوغل", values: [4, 3.2, 3.8, 2.6, 2.4, 2.2, 2], amount: 2000, change: "− 9%", tone: "up" },
      { label: "Careem Business", labelAr: "كريم للأعمال", values: [0.8, 1.1, 1.4, 1.2, 1.7, 2.1, 2.4], amount: 2412.75, change: "+ 34%", tone: "down" },
      { label: "Elm Software", labelAr: "علم", values: [12, 12, 12, 12, 12, 12, 12], amount: 12000, change: "0%", tone: "flat" },
    ];
    const root = el("div", "ch-sparks");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    rows.forEach((row) => {
      const line = el("div", "ch-spark-row");
      const change = el("span", "ch-spark-change", row.change);
      change.dataset.tone = row.tone || "flat";
      line.append(
        el("span", "ch-spark-label", lang === "ar" ? (row.labelAr || row.label) : row.label),
        createSparkline({ values: row.values, tone: row.tone }),
        amount(row.amount, "s"),
        change,
      );
      root.append(line);
    });
    return root;
  }

  function createCategoryMeter(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const parts = (options.parts || [
      { label: "Suppliers", labelAr: "الموردون", value: 268400, tone: 1 },
      { label: "Payroll", labelAr: "الرواتب", value: 182000, tone: 2 },
      { label: "Advertising", labelAr: "الإعلان", value: 52000, tone: 4 },
      { label: "Travel", labelAr: "السفر", value: 28300, tone: 3 },
      { label: "Other", labelAr: "أخرى", value: 17500, tone: 5 },
    ]).slice(0, 5);
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    const root = el("div", "ch-meter");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.append(el("span", "ch-kicker", lang === "ar" ? "الإنفاق حسب الفئة · أكتوبر" : "Spend by category · October"));
    const bar = el("div", "ch-meter-bar");
    const list = el("div", "ch-meter-list");
    parts.forEach((part) => {
      const share = part.value / total;
      const piece = el("span", "ch-meter-seg");
      piece.dataset.tone = String(part.tone);
      piece.style.flex = String(part.value);
      bar.append(piece);
      const row = el("div", "ch-meter-row");
      const swatch = el("span", "ch-swatch");
      swatch.dataset.tone = String(part.tone);
      const pct = el("span", "ch-pct", `${Math.round(share * 100)}%`);
      pct.dir = "ltr";
      row.append(swatch, el("span", "ch-legend-label", lang === "ar" ? (part.labelAr || part.label) : part.label), amount(part.value, "xs"), pct);
      list.append(row);
    });
    root.append(bar, list);
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
  window.createCashFlowChart = createCashFlowChart;
  window.createBalanceLine = createBalanceLine;
  window.createSparkline = createSparkline;
  window.createSparkRows = createSparkRows;
  window.createCategoryMeter = createCategoryMeter;
  window.CHART_DAYS = DAYS;
  window.CHART_WEEK = WEEK;
})();
