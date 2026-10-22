(function () {
  const page = document.querySelector('[data-page="dash"]');
  if (!page || !window.createButton || !window.createButtonGroup || !window.createBadge || !window.createFeedback) return;

  const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const INCOME = [412, 388, 455, 430, 498, 520, 476, 540, 565, 512, 590, 612];
  const SPEND = [365, 402, 398, 421, 450, 470, 488, 455, 510, 530, 520, 548];
  const ACCOUNTS = [
    { id: "main", name: "Main account", type: "Current · SAR", last4: "7519", balance: 1284530.2, hold: 18400, iban: "SA03 8000 0000 6080 1016 7519", icon: "account", tone: "success" },
    { id: "pay", name: "Payroll account", type: "Current · SAR", last4: "2086", balance: 268400, hold: 0, iban: "SA03 8000 0000 6080 1016 2086", icon: "users", tone: "info" },
    { id: "sav", name: "Savings", type: "Savings · 4.1% p.a.", last4: "4410", balance: 520000, hold: 0, iban: "SA03 8000 0000 6080 1016 4410", icon: "savings", tone: "warning" },
  ];
  const store = { range: 12, bar: null, point: null, hide: false, account: "main", copied: false, loaded: false };
  let toastTimer;
  let copyTimer;
  const balances = buildBalances();

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-dd="${name}"]`);
  }

  function icon(name) {
    const iconSet = window.halaIcons;
    const map = {
      account: "landmark",
      confirm: "check",
      error: "circle-alert",
      savings: "piggy-bank",
      users: "users",
    };
    const kebab = map[name] || name;
    const pascal = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    if (!iconSet || !iconSet.icons[pascal]) return null;
    const svg = iconSet.createElement(iconSet.icons[pascal]);
    svg.classList.add("hala-icon");
    svg.dataset.size = "inline";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function button(options, onClick) {
    const node = createButton(options);
    if (onClick) node.addEventListener("click", onClick);
    return node;
  }

  function money(value) {
    return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function signed(value) {
    const minus = "\u2212";
    return `${value >= 0 ? "+ " : `${minus} `}${money(Math.abs(value))}`;
  }

  function sar(size) {
    const node = el("span", "dd-sar");
    node.dataset.size = size || "row";
    node.setAttribute("role", "img");
    node.setAttribute("aria-label", "Saudi Riyal");
    return node;
  }

  function amount(value, size, muted) {
    const row = el("span", "dd-amount");
    row.dataset.size = size || "row";
    if (muted) row.dataset.muted = "true";
    row.append(sar(size), document.createTextNode(value));
    return row;
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

  function spark(values, tone) {
    const path = sparkPath(values, 200, 44, 4);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 200 44");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("dd-spark");
    svg.dataset.tone = tone;
    svg.setAttribute("aria-hidden", "true");
    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", path.area);
    area.classList.add("dd-area");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", path.line);
    svg.append(area, line);
    return svg;
  }

  function currentAccount() {
    return ACCOUNTS.find((account) => account.id === store.account) || ACCOUNTS[0];
  }

  function toast(message) {
    const slot = mount("toast");
    slot.replaceChildren(createFeedback({ kind: "snackbar", tone: "success", title: message }));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => slot.replaceChildren(), 2200);
  }

  function series() {
    const offset = 12 - store.range;
    return {
      months: MONTHS.slice(offset),
      income: INCOME.slice(offset),
      spend: SPEND.slice(offset),
      offset,
    };
  }

  function paintKpis() {
    const tiles = [
      ["Total balance", true, "1,284,530.20", "+ 4.2%", "up", [1180, 1195, 1172, 1210, 1236, 1221, 1248, 1262, 1240, 1270, 1284], "All accounts · vs 30 days ago"],
      ["Money in", true, "612,000.00", "+ 3.7%", "up", [520, 498, 540, 565, 512, 590, 612], "October · vs September"],
      ["Money out", true, "548,200.00", "+ 5.4%", "down", [470, 488, 455, 510, 530, 520, 548], "October · vs September"],
      ["Pending approvals", false, "6", "71,300.25", "flat", [2, 4, 3, 5, 4, 7, 6], "Riyals waiting for you"],
    ];
    const root = mount("kpis");
    tiles.forEach(([label, currency, value, change, tone, values, note]) => {
      const card = el("div", "card dd-tile");
      const head = el("div", "dd-head");
      head.append(el("span", "dd-quiet", label));
      head.append(createBadge({
        label: change,
        tone: tone === "up" ? "settled" : tone === "down" ? "declined" : "neutral",
        size: "sm",
        mono: true,
      }));
      const figure = currency ? amount(value, "kpi") : el("span", "dd-amount", value);
      if (!currency) figure.dataset.size = "kpi";
      card.append(head, figure, spark(values, tone), el("span", "dd-meta", note));
      root.append(card);
    });
  }

  function paintError() {
    const root = mount("error");
    root.replaceChildren();
    root.append(el("span", "dd-meta", store.loaded ? "Loaded" : "Error"));
    root.append(el("span", "dd-quiet", "Money in"));
    if (!store.loaded) {
      const message = el("span", "dd-fail");
      const glyph = icon("error");
      if (glyph) message.append(glyph);
      message.append(document.createTextNode(" Couldn't load this figure"));
      root.append(message, button({ label: "Try again", variant: "secondary", size: "sm" }, () => {
        store.loaded = true;
        paintError();
      }));
      return;
    }
    root.append(amount("612,000.00", "kpi"), el("span", "dd-meta", "October · vs September"));
  }

  function paintFlow() {
    const data = series();
    const totalIn = data.income.reduce((sum, value) => sum + value, 0) * 1000;
    const totalOut = data.spend.reduce((sum, value) => sum + value, 0) * 1000;
    const net = totalIn - totalOut;
    const sums = mount("flow-sums");
    sums.replaceChildren();
    [
      ["Money in", money(totalIn), "in", ""],
      ["Money out", money(totalOut), "out", ""],
      ["Net", money(Math.abs(net)), "net", net >= 0 ? "up" : "down"],
    ].forEach(([label, value, swatch, tone]) => {
      const item = el("div", "dd-sum dd-stack");
      if (tone) item.dataset.tone = tone;
      const name = el("span", "dd-meta");
      const mark = el("span", "dd-swatch");
      mark.dataset.tone = swatch;
      name.append(mark, document.createTextNode(label));
      item.append(name, amount(tone === "down" ? `\u2212 ${value}` : tone === "up" ? `+ ${value}` : value, "flow"));
      sums.append(item);
    });
    paintFlowHover();
  }

  function buildFlow() {
    const data = series();
    const cols = mount("flow-cols");
    cols.replaceChildren();
    data.months.forEach((month, index) => {
      const col = el("button", "dd-col");
      col.type = "button";
      col.setAttribute("aria-label", month);
      const pair = el("div", "dd-pair");
      ["in", "out"].forEach((seriesName) => {
        const bar = el("span", "dd-bar");
        bar.dataset.series = seriesName;
        const value = seriesName === "in" ? data.income[index] : data.spend[index];
        bar.style.height = `${Math.min(100, (value / 600) * 100)}%`;
        pair.append(bar);
      });
      col.append(pair, el("span", "", month));
      col.addEventListener("mouseenter", () => selectBar(index));
      col.addEventListener("focus", () => selectBar(index));
      cols.append(col);
    });
    paintFlow();
  }

  function paintFlowHover() {
    const data = series();
    [...mount("flow-cols").children].forEach((col, index) => {
      const on = store.bar === index;
      col.dataset.on = on ? "true" : "false";
      col.dataset.dim = store.bar != null && !on ? "true" : "false";
    });
    const tip = mount("flow-tip");
    if (store.bar == null) {
      tip.hidden = true;
      return;
    }
    const index = store.bar;
    const netMonth = (data.income[index] - data.spend[index]) * 1000;
    tip.hidden = false;
    tip.dataset.side = index > data.months.length / 2 ? "end" : "start";
    tip.style.left = `${((index + 0.5) / data.months.length) * 100}%`;
    tip.replaceChildren();
    const year = index + data.offset >= 2 ? "2026" : "2025";
    tip.append(el("strong", "", `${data.months[index]} ${year}`));
    [
      ["In", money(data.income[index] * 1000), "in"],
      ["Out", money(data.spend[index] * 1000), "out"],
    ].forEach(([label, value, tone]) => {
      const row = el("div", "dd-tip-row");
      const name = el("span", "", label);
      name.dataset.tone = tone;
      const figure = el("span", "", value);
      figure.prepend(sar("inline"));
      row.append(name, figure);
      tip.append(row);
    });
    const netRow = el("div", "dd-tip-row dd-tip-net");
    const netValue = el("span", "", signed(netMonth));
    netValue.dataset.tone = netMonth >= 0 ? "up" : "down";
    netRow.append(el("span", "", "Net"), netValue);
    tip.append(netRow);
  }

  function selectBar(index) {
    if (store.bar === index) return;
    store.bar = index;
    paintFlowHover();
  }

  function paintLine() {
    const width = 600;
    const height = 200;
    const low = 300000;
    const high = 1400000;
    const points = balances.map((value, index) => [
      (index / 29) * width,
      height - ((value - low) / (high - low)) * height,
    ]);
    const line = points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
    const svg = mount("line-svg");
    svg.replaceChildren();
    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", `${line} L${width} ${height} L0 ${height} Z`);
    area.classList.add("dd-area");
    const threshold = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const thresholdY = height - ((340000 - low) / (high - low)) * height;
    threshold.setAttribute("x1", "0");
    threshold.setAttribute("x2", String(width));
    threshold.setAttribute("y1", thresholdY.toFixed(1));
    threshold.setAttribute("y2", thresholdY.toFixed(1));
    threshold.classList.add("dd-threshold");
    const stroke = document.createElementNS("http://www.w3.org/2000/svg", "path");
    stroke.setAttribute("d", line);
    stroke.classList.add("dd-stroke");
    svg.append(area, threshold, stroke);
    mount("line-payroll").style.top = `${(thresholdY / height) * 100}%`;

    const index = store.point == null ? 29 : store.point;
    const delta = balances[index] - balances[0];
    mount("line-label").textContent = store.point == null ? "Main account · today" : `${dayLabel(index)} 2026 · closing balance`;
    const value = mount("line-value");
    value.replaceChildren(amount(money(balances[index]), "flow"));
    const change = mount("line-delta");
    change.textContent = `${delta >= 0 ? "Up " : "Down "}${money(Math.abs(delta))} since 22 Sep`;
    change.dataset.tone = delta >= 0 ? "up" : "down";

    const cross = mount("line-cross");
    const dot = mount("line-dot");
    const active = store.point != null;
    cross.hidden = !active;
    dot.hidden = !active;
    if (active) {
      const x = `${(points[index][0] / width) * 100}%`;
      const y = `${(points[index][1] / height) * 100}%`;
      cross.style.left = x;
      dot.style.left = x;
      dot.style.top = y;
    }
  }

  function dayLabel(index) {
    return new Date(2026, 8, 22 + index).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function buildBalances() {
    const rows = [];
    let value = 1150000;
    for (let index = 0; index < 30; index += 1) {
      value += Math.sin(index * 1.7) * 26000 + (index % 7 === 3 ? -62000 : 14000) + (index === 24 ? -120000 : 0) + (index === 26 ? 160000 : 0);
      rows.push(Math.round(value * 100) / 100);
    }
    rows[29] = 1284530.2;
    return rows;
  }

  function paintSparks() {
    const rows = [
      ["Nour Trading Co", [12, 18, 15, 22, 25, 21, 25], "25,000.00", "+ 19%", "up"],
      ["Google Ads", [4, 3.2, 3.8, 2.6, 2.4, 2.2, 2], "2,000.00", "\u2212 9%", "up"],
      ["Careem Business", [0.8, 1.1, 1.4, 1.2, 1.7, 2.1, 2.4], "2,412.75", "+ 34%", "down"],
      ["Elm Software", [12, 12, 12, 12, 12, 12, 12], "12,000.00", "0%", "flat"],
    ];
    rows.forEach(([label, values, value, change, tone]) => {
      const row = el("div", "dd-spark-row");
      const chart = spark(values, tone);
      row.append(el("span", "", label), chart, amount(value, "row"), el("span", "dd-change", change));
      row.querySelector(".dd-change").dataset.tone = tone;
      mount("sparks").append(row);
    });
  }

  function paintMeter() {
    const parts = [
      ["Suppliers", 268400, "1"],
      ["Payroll", 182000, "2"],
      ["Advertising", 52000, "3"],
      ["Travel", 28300, "4"],
      ["Other", 17500, "5"],
    ];
    const total = parts.reduce((sum, part) => sum + part[1], 0);
    const bar = mount("meter");
    const list = mount("meter-rows");
    parts.forEach(([label, value, tone]) => {
      const share = value / total;
      const piece = el("span");
      piece.dataset.tone = tone;
      piece.style.width = `${share * 100}%`;
      bar.append(piece);
      const row = el("div", "dd-legend");
      const swatch = el("span", "dd-swatch");
      swatch.dataset.tone = tone;
      row.append(swatch, el("span", "", label), amount(money(value), "inline"), el("span", "dd-meta", `${Math.round(share * 100)}%`));
      list.append(row);
    });
  }

  function paintAccount() {
    const account = currentAccount();
    const hidden = store.hide;
    const mask = "\u2022\u2022\u2022,\u2022\u2022\u2022.\u2022\u2022";
    const root = mount("account");
    root.replaceChildren();
    const head = el("div", "dd-head");
    const who = el("div", "dd-row");
    const brand = el("span", "dd-brand");
    brand.append(el("span", "dd-mark"));
    const names = el("div", "dd-stack");
    names.append(el("strong", "", account.name), el("span", "dd-meta", account.type));
    who.append(brand, names);
    const tools = el("div", "dd-row");
    tools.append(createBadge({ label: "Live", variant: "feature", tone: "brand", size: "sm" }));
    tools.append(button({
      icon: hidden ? "show" : "hide",
      iconOnly: true,
      variant: "secondary",
      size: "sm",
      ariaLabel: hidden ? "Show balances" : "Hide balances",
    }, toggleHide));
    tools.querySelector(".button").classList.add("dd-eye");
    head.append(who, tools);

    const balance = el("div", "dd-stack");
    balance.append(el("span", "dd-quiet", "Available balance"));
    balance.append(amount(hidden ? mask : money(account.balance), "balance"));
    const hold = hidden ? "On hold hidden" : account.hold ? `${money(account.hold)} on hold · 2 card payments` : "Nothing on hold";
    const holdRow = el("span", "dd-meta");
    if (!hidden && account.hold) holdRow.append(sar("inline"));
    holdRow.append(document.createTextNode(hold));
    balance.append(holdRow);

    const iban = el("div", "dd-iban");
    const copy = el("div", "dd-stack");
    copy.append(el("span", "dd-meta", "IBAN"), el("span", "dd-mono", hidden ? `SA03 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${account.last4}` : account.iban));
    iban.append(copy, button({
      label: store.copied ? "Copied" : "Copy",
      icon: store.copied ? "confirm" : "copy",
      variant: store.copied ? "primary" : "secondary",
      size: "sm",
    }, () => copyIban(account)));
    if (!store.copied) iban.querySelector(".button").classList.add("dd-eye");

    const actions = el("div", "dd-actions");
    [
      ["Transfer", "transfers", "primary"],
      ["Add", "add", "secondary"],
      ["Statement", "file", "secondary"],
      ["More", "more", "secondary"],
    ].forEach(([label, glyph, variant]) => {
      actions.append(button({ label, icon: glyph, variant, size: "sm" }, () => toast(`${label} · ${account.name}`)));
    });
    root.append(head, balance, iban, actions);
    paintAccounts();
    paintPhone();
  }

  function paintAccounts() {
    const hidden = store.hide;
    const mask = "\u2022\u2022\u2022,\u2022\u2022\u2022.\u2022\u2022";
    const list = mount("accounts");
    list.replaceChildren();
    ACCOUNTS.forEach((account) => {
      const row = el("button", "dd-account-row");
      row.type = "button";
      row.setAttribute("aria-pressed", account.id === store.account ? "true" : "false");
      const avatar = el("span", "dd-avatar");
      avatar.dataset.tone = account.tone;
      const glyph = icon(account.icon);
      if (glyph) avatar.append(glyph);
      const copy = el("div", "dd-stack");
      copy.append(el("strong", "", account.name), el("span", "dd-meta dd-mono", `\u2022\u2022 ${account.last4}`));
      row.append(avatar, copy, amount(hidden ? mask : money(account.balance), "row"));
      row.addEventListener("click", () => {
        store.account = account.id;
        store.copied = false;
        paintAccount();
      });
      list.append(row);
    });
    const total = ACCOUNTS.reduce((sum, account) => sum + account.balance, 0);
    const foot = mount("total");
    foot.replaceChildren(el("span", "", "Total"), amount(hidden ? mask : money(total), "row"));
  }

  function paintPhone() {
    const account = currentAccount();
    const hidden = store.hide;
    const mask = "\u2022\u2022\u2022,\u2022\u2022\u2022.\u2022\u2022";
    const root = mount("phone");
    root.replaceChildren();
    const bar = el("div", "dd-head");
    bar.append(el("strong", "", "Home"));
    bar.append(button({
      icon: hidden ? "show" : "hide",
      iconOnly: true,
      variant: "secondary",
      size: "sm",
      ariaLabel: hidden ? "Show balances" : "Hide balances",
    }, toggleHide));
    const card = el("div", "dd-phone-card");
    card.append(el("span", "dd-meta", `${account.name} · \u2022\u2022 ${account.last4}`));
    card.append(amount(hidden ? mask : money(account.balance), "phone"));
    const actions = el("div", "dd-actions");
    [
      ["Transfer", "transfers", "primary"],
      ["Add", "add", "secondary"],
      ["Statement", "file", "secondary"],
      ["More", "more", "secondary"],
    ].forEach(([label, glyph, variant]) => {
      actions.append(button({ label, icon: glyph, variant, size: "sm" }, () => toast(`${label} · ${account.name}`)));
    });
    card.append(actions);

    const kpis = el("div", "dd-phone-kpis");
    [
      ["Money in", "612,000", [520, 498, 540, 565, 512, 590, 612], "+ 3.7%", "up"],
      ["Money out", "548,200", [470, 488, 455, 510, 530, 520, 548], "+ 5.4%", "down"],
    ].forEach(([label, value, values, change, tone]) => {
      const tile = el("div", "card dd-tile");
      const changeNode = el("span", "dd-change", change);
      changeNode.dataset.tone = tone;
      tile.append(el("span", "dd-quiet", label), amount(hidden ? mask : value, "row"), spark(values, tone), changeNode);
      kpis.append(tile);
    });

    const chart = el("div", "card dd-phone-chart");
    const income = INCOME.slice(6);
    const spend = SPEND.slice(6);
    const net = (income.reduce((sum, value) => sum + value, 0) - spend.reduce((sum, value) => sum + value, 0)) * 1000;
    const title = el("div", "dd-head");
    title.append(el("strong", "", "Cash flow"), amount(`+ ${money(net)} net`, "inline"));
    const bars = el("div", "dd-phone-bars");
    MONTHS.slice(6).forEach((month, index) => {
      const col = el("div", "dd-phone-col");
      const pair = el("div", "dd-phone-pair");
      const incoming = el("span", "dd-bar");
      incoming.dataset.series = "in";
      incoming.style.height = `${(income[index] / 640) * 100}%`;
      const outgoing = el("span", "dd-bar");
      outgoing.dataset.series = "out";
      outgoing.style.height = `${(spend[index] / 640) * 100}%`;
      pair.append(incoming, outgoing);
      col.append(pair, el("span", "dd-meta dd-mono", month));
      bars.append(col);
    });
    chart.append(title, bars);
    root.append(bar, card, kpis, chart);
  }

  function toggleHide() {
    store.hide = !store.hide;
    paintAccount();
  }

  function copyIban(account) {
    const value = account.iban.replace(/\s/g, "");
    if (navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {});
    store.copied = true;
    toast("IBAN copied");
    paintAccount();
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      store.copied = false;
      paintAccount();
    }, 1600);
  }

  function paintRules() {
    [
      [true, "Always show the number next to the chart. The chart explains the shape."],
      [true, "Color a change by whether it is good for the business, not by up or down."],
      [true, "Compare like periods: October against September, not a rolling 30 days."],
      [true, "Start bar charts at zero. A line can start higher when the axis says so."],
      [true, "Use mono with tabular numbers for every amount and axis label."],
      [true, "Give every tile a loading skeleton, an empty state, and an error with retry."],
      [false, "Don't use a pie or donut for more than 3 parts. Use a meter."],
      [false, "Don't use more than 2 series colors in one chart, plus a threshold line."],
      [false, "Don't show a percentage without the amount it refers to."],
      [false, "Don't animate a chart on every update. Animate the first time it appears."],
    ].forEach(([ok, text]) => {
      const card = el("div", "rule dd-do");
      const mark = el("span", "dd-do-mark");
      mark.dataset.ok = ok ? "true" : "false";
      const glyph = icon(ok ? "confirm" : "error");
      if (glyph) mark.append(glyph);
      else mark.textContent = ok ? "\u2713" : "\u00d7";
      card.append(mark, el("span", "", text));
      mount("rules").append(card);
    });
    [
      ["Compare money in and out for a period", "Bars"],
      ["A balance changing over time", "Line"],
      ["A trend inside a tile or a row", "Sparkline"],
      ["Parts of one total", "Meter"],
      ["One number against a limit", "Progress bar"],
    ].forEach(([label, chart]) => {
      const row = el("div", "dd-which");
      row.append(el("span", "", label), el("strong", "", chart));
      mount("which").append(row);
    });
    [
      "Show 6 months on phones, and 12 on web.",
      "Tap a bar to show its tooltip. Tap outside to close it.",
      "Keep a chart at least 160 pt tall, and labels at least 11 pt.",
      "Pair every chart with its total, so it can be read without the chart.",
      "Swipe a chart sideways only when it does not fit. Don't pinch to zoom.",
    ].forEach((text) => {
      const row = el("span", "dd-quiet", text);
      const glyph = icon("confirm");
      if (glyph) row.prepend(glyph);
      mount("mobile-rules").append(row);
    });
  }

  paintKpis();
  paintError();
  paintSparks();
  paintMeter();
  paintRules();
  paintAccount();
  mount("empty-action").append(button({ label: "Create a card", variant: "ghost", size: "sm" }, () => toast("Create a card")));
  mount("flow-live").append(createBadge({ label: "Live", variant: "feature", tone: "brand", size: "sm" }));
  mount("line-live").append(createBadge({ label: "Live · hover", variant: "feature", tone: "brand", size: "sm" }));

  mount("ranges").append(createButtonGroup({
    kind: "segment",
    size: "sm",
    label: "Range",
    value: "12",
    options: [
      { label: "6 months", value: "6" },
      { label: "12 months", value: "12" },
    ],
    onChange(value) {
      store.range = Number(value);
      store.bar = null;
      buildFlow();
    },
  }));
  mount("ranges").classList.add("dd-ranges");

  const plot = mount("flow-plot");
  plot.addEventListener("mouseleave", () => {
    if (store.bar == null) return;
    store.bar = null;
    paintFlowHover();
  });
  buildFlow();

  const hits = mount("line-hits");
  balances.forEach((_, index) => {
    const hit = el("button", "dd-hit");
    hit.type = "button";
    hit.setAttribute("aria-label", dayLabel(index));
    hit.addEventListener("mouseenter", () => {
      store.point = index;
      paintLine();
    });
    hit.addEventListener("focus", () => {
      store.point = index;
      paintLine();
    });
    hits.append(hit);
  });
  mount("line-plot").addEventListener("mouseleave", () => {
    if (store.point == null) return;
    store.point = null;
    paintLine();
  });
  paintLine();
})();
