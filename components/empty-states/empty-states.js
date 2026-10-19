/**
 * Empty and error states. Load lucide UMD, then this script.
 *
 * createEmptyAnatomy()
 * createEmptyCharts()
 * createEmptyTable()
 * createEmptyWidgets()
 * createEmptyPages()
 * createEmptyPhones()
 * createEmptyWriting()
 *
 * Chart and table examples keep their frame. Retry shows a short loading
 * state, then the data. Search filters the live table.
 */
(function () {
  const LOAD_MS = 1100;
  const NS = "http://www.w3.org/2000/svg";
  const MIRROR = new Set(["arrow-left-right", "arrow-down"]);

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size) {
    const lucide = window.lucide;
    if (!lucide || !name) return null;
    const node = lucide.icons[pascal(name)];
    if (!node) return null;
    const svg = lucide.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = name;
    if (size) svg.dataset.size = size;
    if (MIRROR.has(name)) svg.dataset.mirror = "true";
    svg.style.strokeWidth = "var(--icon-stroke)";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function show(node, visible) {
    node.toggleAttribute("hidden", !visible);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function live() {
    return el("span", "es-live", "Live");
  }

  function svgEl(name, attrs) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function tile(name, tone, className) {
    const node = el("span", className || "es-tile");
    node.dataset.tone = tone;
    const glyph = icon(name);
    if (glyph) node.append(glyph);
    return node;
  }

  function cta(label, kind, onClick, glyph) {
    const node = onClick ? el("button", "es-cta") : el("span", "es-cta");
    node.dataset.kind = kind;
    if (onClick) {
      node.type = "button";
      node.addEventListener("click", onClick);
    }
    if (glyph) {
      const mark = icon(glyph);
      if (mark) node.append(mark);
    }
    node.append(document.createTextNode(label));
    return node;
  }

  function tabs(labels, get, set) {
    const bar = el("div", "es-tabs");
    bar.setAttribute("role", "tablist");
    const buttons = labels.map((label) => {
      const button = el("button", "es-tab", label);
      button.type = "button";
      button.setAttribute("role", "tab");
      button.addEventListener("click", () => set(label));
      bar.append(button);
      return button;
    });
    function paint() {
      const current = get();
      buttons.forEach((button) => {
        const on = button.textContent === current;
        button.dataset.on = on ? "true" : "false";
        button.setAttribute("aria-selected", on ? "true" : "false");
      });
    }
    return { bar, paint };
  }

  function createEmptyAnatomy() {
    const root = el("div", "es-stack");
    const board = el("div", "es-anatomy");
    const sample = el("div", "es-sample");
    const mark = tile("arrow-left-right", "brand");
    mark.append(el("span", "es-num", "①"));
    const title = el("h3", "", "No transactions yet");
    title.append(el("span", "es-num", "②"));
    const copy = el("p", "", "Payments you send and receive will appear here.");
    copy.append(el("span", "es-num", "③"));
    const action = cta("Add money", "primary");
    action.append(el("span", "es-num", "④"));
    sample.append(mark, title, copy, action);
    const legend = el("div", "es-legend");
    [
      ["①", "Icon", "64 px tile in a soft tint. Green for neutral, red for errors. No illustrations of people or money."],
      ["②", "Title", "What is going on, in plain words: \"No transactions yet\"."],
      ["③", "Description", "One sentence: why it is empty or what happens next."],
      ["④", "Action", "One button that fixes it. Skip it if there is nothing to do."],
    ].forEach(([n, name, text]) => {
      const row = el("div", "es-legend-row");
      const copy = el("div", "");
      copy.append(el("strong", "", name), el("p", "", text));
      row.append(el("span", "", n), copy);
      legend.append(row);
    });
    board.append(sample, legend);

    const types = el("div", "es-types");
    [
      ["First use", "Nothing created yet. Explain the value, offer the first step.", "brand", "plus"],
      ["No results", "Search or filters match nothing. Offer to clear them.", "neutral", "search"],
      ["All done", "User cleared everything. Positive, no action needed.", "brand", "check"],
      ["Error", "Loading failed. Say it is safe and offer Retry.", "danger", "circle-alert"],
      ["No access", "User lacks permission. Say who can grant it.", "warning", "lock"],
      ["Offline", "No connection. Show cached data if possible.", "info", "wifi-off"],
    ].forEach(([name, text, tone, glyph]) => {
      const card = el("div", "es-type-card");
      card.append(tile(glyph, tone, "es-mini"), el("strong", "", name), el("p", "", text));
      types.append(card);
    });
    root.append(board, types);
    return root;
  }

  function createEmptyCharts() {
    const root = el("div", "es-stack");
    let mode = "Data";
    let timer = 0;
    const modes = ["Data", "Empty", "Loading", "Error"];
    const switcher = tabs(modes, () => mode, (label) => {
      clearTimeout(timer);
      mode = label;
      paint();
    });
    const toolbar = el("div", "es-toolbar");
    toolbar.append(live(), switcher.bar);

    const card = el("div", "es-stage");
    const head = el("div", "es-kpi-row");
    const figures = el("div", "");
    figures.append(el("span", "", "POS sales · last 30 days"));
    const kpi = el("span", "es-kpi");
    figures.append(kpi);
    const trend = el("span", "es-trend");
    head.append(figures, trend);
    const plot = el("div", "es-plot-wrap");
    const chart = svgEl("svg", { viewBox: "0 0 600 220", preserveAspectRatio: "none" });
    chart.append(svgEl("path", { d: "M0 40H600M0 90H600M0 140H600M0 190H600", class: "es-grid" }));
    const area = svgEl("path", { d: "M0 170 C40 160 60 150 100 152 S160 120 200 118 S260 135 300 110 S370 70 400 78 S470 60 500 52 S570 40 600 30 L600 190 L0 190Z", class: "es-area" });
    const line = svgEl("path", { d: "M0 170 C40 160 60 150 100 152 S160 120 200 118 S260 135 300 110 S370 70 400 78 S470 60 500 52 S570 40 600 30", class: "es-line" });
    const flat = svgEl("path", { d: "M0 190H600", class: "es-flat" });
    const loading = svgEl("path", { d: "M0 160 C80 150 120 140 200 130 S340 110 400 100 S520 80 600 70", class: "es-load es-pulse" });
    chart.append(area, line, flat, loading);
    const emptyMsg = el("div", "es-overlay");
    emptyMsg.append(tile("chart-line", "neutral", "es-spot"), el("strong", "", "No sales in this period"), el("p", "", "Sales from your terminals will show up here."));
    const errorMsg = el("div", "es-overlay");
    errorMsg.dataset.error = "true";
    errorMsg.append(
      tile("circle-alert", "danger", "es-spot"),
      el("strong", "", "Couldn't load sales"),
      el("p", "", "Your data is safe. Try again in a moment."),
      cta("Retry", "secondary", () => {
        clearTimeout(timer);
        mode = "Loading";
        paint();
        timer = setTimeout(() => { mode = "Data"; paint(); }, LOAD_MS);
      }, "refresh-cw"),
    );
    errorMsg.querySelector(".es-cta").dataset.size = "sm";
    plot.append(chart, emptyMsg, errorMsg);
    const axis = el("div", "es-axis");
    ["15 Sep", "22 Sep", "29 Sep", "6 Oct", "14 Oct"].forEach((label) => axis.append(el("span", "", label)));
    card.append(head, plot, axis);

    const side = el("div", "es-side");
    const barsCard = el("div", "es-stage");
    barsCard.append(el("span", "es-panel-label", "Sales by branch"));
    const bars = el("div", "es-bars");
    const columns = ["OLY", "MLQ", "JED", "KHB", "WEB"].map((label, index) => {
      const col = el("div", "es-col");
      const bar = el("i", "");
      col.append(bar, el("span", "", label));
      bars.append(col);
      return { bar, index };
    });
    const barMsg = el("span", "es-bar-msg");
    bars.append(barMsg);
    barsCard.append(bars);
    const donutCard = el("div", "es-stage es-donut-row");
    const donut = svgEl("svg", { viewBox: "0 0 42 42", class: "es-donut" });
    donut.append(
      svgEl("circle", { cx: "21", cy: "21", r: "15.9", class: "es-track" }),
      svgEl("circle", { cx: "21", cy: "21", r: "15.9", class: "es-arc-a" }),
      svgEl("circle", { cx: "21", cy: "21", r: "15.9", class: "es-arc-b" }),
    );
    const donutCopy = el("div", "es-donut-copy");
    donutCopy.append(el("span", "", "Payment methods"));
    const donutTitle = el("strong", "");
    const donutSub = el("span", "");
    donutCopy.append(donutTitle, donutSub);
    donutCard.append(donut, donutCopy);
    side.append(barsCard, donutCard);

    const grid = el("div", "es-charts");
    grid.append(card, side);

    function paint() {
      switcher.paint();
      const data = mode === "Data";
      const empty = mode === "Empty";
      const wait = mode === "Loading";
      const failed = mode === "Error";
      kpi.textContent = data ? "SAR 184,320" : empty ? "SAR 0.00" : "—";
      kpi.dataset.muted = data || empty ? "false" : "true";
      trend.replaceChildren();
      if (data) {
        const up = icon("trending-up");
        if (up) trend.append(up);
        trend.append(document.createTextNode("12.4%"));
      } else trend.textContent = empty ? "No change" : "—";
      trend.dataset.up = data ? "true" : "false";
      show(area, data);
      show(line, data);
      show(flat, empty);
      show(loading, wait);
      show(emptyMsg, empty);
      show(errorMsg, failed);
      const heights = data ? [62, 44, 80, 30, 52] : wait ? [30, 39, 48, 57, 66] : [8, 8, 8, 8, 8];
      columns.forEach(({ bar, index }) => {
        bar.style.height = data || wait ? `${heights[index]}%` : "var(--size-badge-dot)";
        bar.dataset.live = data ? "true" : "false";
        bar.dataset.dashed = empty ? "true" : "false";
      });
      show(barMsg, !(data || wait));
      barMsg.textContent = failed ? "Couldn't load" : "No sales yet";
      barMsg.dataset.danger = failed ? "true" : "false";
      donut.dataset.mode = data ? "data" : empty ? "empty" : wait ? "loading" : "error";
      show(donut.querySelector(".es-arc-a"), data);
      show(donut.querySelector(".es-arc-b"), data);
      donutTitle.textContent = data ? "mada 58% · Visa 27%" : empty ? "No payments yet" : wait ? "Loading…" : "Couldn't load";
      donutSub.textContent = data ? "Apple Pay and others 15%" : empty ? "Shares appear after the first sale" : failed ? "Retry from the sales chart" : "";
      show(donutSub, Boolean(donutSub.textContent));
    }
    paint();
    root.append(toolbar, grid, chartMatrix(), chartNotes());
    return root;
  }

  function chartMatrix() {
    const wrap = el("div", "es-matrix");
    const head = el("div", "es-mhead");
    head.append(el("span", ""));
    ["Empty", "Loading", "Error", "No access"].forEach((label) => head.append(el("span", "", label)));
    wrap.append(head);
    const tones = { empty: "neutral", loading: "neutral", error: "danger", access: "warning" };
    const icons = { empty: "chart-line", loading: "refresh-cw", error: "circle-alert", access: "lock" };
    const rows = [
      {
        name: "Line / area", sub: "Trends over time", title: "POS sales · 30 days", kind: "line",
        cells: {
          empty: ["No sales in this period", "Sales from terminals appear here.", "Change period", false],
          loading: ["Loading sales…", "Usually under 2 seconds.", "", false],
          error: ["Couldn't load sales", "Your data is safe.", "Retry", true],
          access: ["Only admins see sales", "Ask Abdulaziz Ali for access.", "Request access", true],
        },
      },
      {
        name: "Bar", sub: "Compare categories", title: "Sales by branch", kind: "bar",
        cells: {
          empty: ["No sales by branch yet", "Bars fill in after the first sale.", "Order terminals", false],
          loading: ["Loading branches…", "", "", false],
          error: ["Couldn't load branches", "Other cards still work.", "Retry", true],
          access: ["Restricted to managers", "You can see only your branch.", "View my branch", true],
        },
      },
      {
        name: "Donut", sub: "Parts of a whole", title: "Payment methods", kind: "donut",
        cells: {
          empty: ["No payments yet", "Shares appear after the first sale.", "", false],
          loading: ["Loading methods…", "", "", false],
          error: ["Couldn't load methods", "Try again in a moment.", "Retry", true],
          access: ["Hidden for your role", "Ask an admin for Finance access.", "Request access", true],
        },
      },
      {
        name: "KPI tile", sub: "Single numbers", title: "Net revenue", kind: "kpi",
        cells: {
          empty: ["No revenue this month", "Zero is shown as a real value.", "", false],
          loading: ["Loading…", "Skeleton, not a spinner.", "", false],
          error: ["Couldn't calculate", "Unknown shows as \"—\", never 0.", "Retry", true],
          access: ["Hidden for your role", "Value is masked, not removed.", "", false],
        },
      },
    ];
    rows.forEach((row) => {
      const line = el("div", "es-mrow");
      const name = el("div", "es-mname");
      name.append(el("strong", "", row.name), el("span", "", row.sub));
      line.append(name);
      ["empty", "loading", "error", "access"].forEach((key) => {
        const [title, desc, link, ink] = row.cells[key];
        const cell = el("div", "es-cell");
        cell.append(el("span", "", row.title));
        cell.append(miniChart(row.kind, key));
        const foot = el("div", "es-cell-foot");
        const pico = tile(icons[key], key === "loading" ? "neutral" : tones[key], "es-pico");
        const copy = el("div", "");
        copy.append(el("strong", "", title));
        if (desc) copy.append(el("p", "", desc));
        if (link) {
          const more = el("span", "es-link", link);
          if (ink) more.dataset.ink = "true";
          copy.append(more);
        }
        foot.append(pico, copy);
        cell.append(foot);
        line.append(cell);
      });
      wrap.append(line);
    });
    return wrap;
  }

  function miniChart(kind, key) {
    if (kind === "kpi") {
      const slot = el("div", "es-kpi-slot");
      const value = el("strong", "", key === "empty" ? "SAR 0.00" : key === "error" ? "—" : key === "access" ? "••••••" : "");
      if (key !== "empty") value.dataset.muted = "true";
      slot.append(value);
      if (key === "loading") slot.append(el("i", "es-bone"));
      return slot;
    }
    const chart = svgEl("svg", { viewBox: "0 0 240 84", class: "es-mini-chart" });
    if (kind === "line") chart.append(svgEl("path", { d: "M0 10H240M0 34H240M0 58H240M0 82H240", class: "es-grid" }));
    if (kind === "donut") {
      const ring = svgEl("circle", { cx: "120", cy: "42", r: "30", fill: "none", "stroke-width": "12", class: "es-ring" });
      ring.dataset.ink = key === "loading" ? "muted" : key === "error" ? "error" : key === "access" ? "soft" : "grid";
      if (key === "empty") ring.setAttribute("stroke-dasharray", "4 4");
      chart.append(ring);
      return chart;
    }
    const drawing = svgEl("path", { class: "es-plot", "stroke-linecap": "round" });
    if (kind === "line") {
      const paths = {
        empty: ["M0 82H240", "quiet", "2", "5 5"],
        loading: ["M0 70C50 64 80 56 120 50S200 34 240 28", "muted", "8", ""],
        error: ["", "", "0", ""],
        access: ["M0 82H240", "muted", "2", ""],
      };
      const [d, ink, width, dash] = paths[key];
      drawing.setAttribute("d", d || "M0 0");
      if (ink) drawing.dataset.ink = ink;
      if (width) drawing.setAttribute("stroke-width", width);
      if (dash) drawing.setAttribute("stroke-dasharray", dash);
      if (!d) drawing.setAttribute("hidden", "");
    } else {
      const heights = key === "loading" ? [40, 56, 30, 64, 46] : [4, 4, 4, 4, 4];
      const d = heights.map((h, i) => `M${14 + i * 46} 82V${82 - h}h30V82Z`).join("");
      drawing.setAttribute("d", d);
      drawing.dataset.fill = key === "loading" ? "sunken" : key === "error" ? "error" : key === "access" ? "soft" : "";
      if (key === "empty") {
        drawing.dataset.ink = "strong";
        drawing.setAttribute("stroke-width", "1");
        drawing.setAttribute("stroke-dasharray", "3 3");
        delete drawing.dataset.fill;
      }
    }
    chart.append(drawing);
    return chart;
  }

  function chartNotes() {
    const grid = el("div", "es-notes");
    [
      ["Same size", "Empty, loading and error keep the card height. Nothing below moves."],
      ["KPI values", "Zero is a real value: show \"SAR 0.00\". Unknown is \"—\", never 0."],
      ["Loading", "Gray skeleton of the chart shape, pulsing. Never a spinner on its own."],
      ["Partial data", "Missing days are gaps in the line, not drops to zero."],
    ].forEach(([name, text]) => {
      const note = el("div", "es-note");
      note.append(el("strong", "", name), el("p", "", text));
      grid.append(note);
    });
    return grid;
  }

  const ROWS = [
    ["Al Baik · Olaya", "Today, 12:41", "+ 86.25", "Settled", "settled"],
    ["Jarir Bookstore", "Today, 11:08", "− 1,249.00", "Settled", "settled"],
    ["Nour Trading", "Today, 09:30", "− 25,000.00", "Pending", "pending"],
    ["Careem", "Yesterday", "− 38.50", "Settled", "settled"],
    ["Online store #2041", "Yesterday", "+ 420.00", "Refunded", "refunded"],
  ];

  function createEmptyTable() {
    const root = el("div", "es-stack");
    let mode = "Data";
    let query = "";
    let timer = 0;
    const labels = ["Data", "First use", "Loading", "No results", "Error", "No access"];
    const switcher = tabs(labels, () => mode, (label) => {
      clearTimeout(timer);
      mode = label;
      paint();
    });
    const toolbar = el("div", "es-toolbar");
    toolbar.append(live(), switcher.bar);

    const card = el("div", "es-stage");
    const filters = el("div", "es-filters");
    const search = el("label", "es-search");
    const glyph = icon("search", "inline");
    if (glyph) search.append(glyph);
    const input = el("input");
    input.type = "search";
    input.placeholder = "Search transactions";
    input.setAttribute("aria-label", "Search transactions");
    input.addEventListener("input", () => {
      clearTimeout(timer);
      query = input.value;
      mode = "Data";
      paint();
    });
    search.append(input);
    const chip = el("span", "es-chip");
    filters.append(search, chip);
    const thead = el("div", "es-thead");
    ["Merchant", "Date", "Amount", "Status"].forEach((name) => thead.append(el("span", "", name)));
    const body = el("div", "es-body");
    card.append(filters, thead, body);

    function stateBlock(key) {
      const block = el("div", "es-empty");
      const specs = {
        first: ["arrow-left-right", "brand", "No transactions yet", "Payments you send and receive will appear here. Add money or share your IBAN to get started.", "Add money", "primary", "Copy IBAN"],
        none: ["search-x", "neutral", "", "Try a different search, or clear the filters to see everything.", "Clear search and filters", "ink"],
        error: ["circle-alert", "danger", "Couldn't load transactions", "Something went wrong on our side. Your money and data are safe.", "Try again", "ink", "Contact support"],
        access: ["lock", "warning", "You don't have access to transactions", "Ask an account admin (Abdulaziz Ali) to give you the Viewer or Finance role.", "Request access", "ink"],
      };
      const [glyphName, tone, title, desc, primary, kind, secondary] = specs[key];
      block.append(tile(glyphName, tone));
      const heading = title || (query ? `No results for "${query}"` : "No transactions match these filters");
      block.append(el("h3", "", heading), el("p", "", desc));
      const actions = el("div", "es-actions");
      if (key === "none") {
        actions.append(cta(primary, kind, () => {
          query = "";
          input.value = "";
          mode = "Data";
          paint();
        }));
      } else if (key === "error") {
        actions.append(cta(primary, kind, () => {
          clearTimeout(timer);
          mode = "Loading";
          paint();
          timer = setTimeout(() => { mode = "Data"; paint(); }, LOAD_MS);
        }));
      } else actions.append(cta(primary, kind));
      if (secondary) actions.append(cta(secondary, "secondary"));
      block.append(actions);
      if (key === "error") block.append(el("span", "es-id", "Error ID 7F3A-21C9 · share it with support"));
      return block;
    }

    function paint() {
      switcher.paint();
      if (document.activeElement !== input) input.value = query;
      const narrowed = mode === "No results";
      chip.replaceChildren(document.createTextNode("Status: "), el("b", "", narrowed ? "Declined" : "All"));
      chip.dataset.on = narrowed ? "true" : "false";
      const q = query.trim().toLowerCase();
      const matches = mode === "Data" ? ROWS.filter((row) => !q || row[0].toLowerCase().includes(q)) : [];
      const noResults = (mode === "Data" && q && !matches.length) || mode === "No results";
      const key = mode === "First use" ? "first" : noResults ? "none" : mode === "Error" ? "error" : mode === "No access" ? "access" : "";
      body.replaceChildren();
      if (mode === "Loading") {
        ["70%", "55%", "80%", "45%", "65%"].forEach((width) => {
          const row = el("div", "es-skel");
          const merchant = el("i", "");
          merchant.style.width = width;
          const date = el("i", "");
          date.style.width = "60%";
          const amount = el("i", "");
          amount.style.width = "50%";
          amount.dataset.end = "true";
          const status = el("i", "");
          status.style.width = "70%";
          row.append(merchant, date, amount, status);
          body.append(row);
        });
        return;
      }
      matches.forEach((row) => {
        const line = el("div", "es-trow");
        const amount = el("span", "es-amt", row[2]);
        const status = el("span", "es-status", row[3]);
        const pip = el("span", "es-pip");
        pip.dataset.tone = row[4];
        status.prepend(pip);
        line.append(el("strong", "", row[0]), el("span", "", row[1]), amount, status);
        body.append(line);
      });
      if (key) body.append(stateBlock(key));
    }
    paint();
    const notes = el("div", "es-notes");
    [
      ["First use vs no results", "First use sells the feature. No results helps fix the search. Never mix them."],
      ["Skeleton rows", "Show 5 gray rows while loading; switch to empty only after the response."],
      ["Errors keep context", "Header, search and filters stay. Only the rows area changes."],
      ["Error ID", "Show a short ID on server errors so support can find the log."],
    ].forEach(([name, text]) => {
      const note = el("div", "es-note");
      note.append(el("strong", "", name), el("p", "", text));
      notes.append(note);
    });
    root.append(toolbar, card, notes);
    return root;
  }

  function createEmptyWidgets() {
    const root = el("div", "es-widgets");
    [
      ["Cards", "first", "brand", "No cards yet", "Create virtual cards for your team in seconds.", "Create a card", "credit-card"],
      ["Beneficiaries", "first", "brand", "No saved beneficiaries", "Save people you pay often to send faster.", "Add beneficiary", "user-plus"],
      ["POS terminals", "first", "brand", "No terminals yet", "Accept mada, Visa and Apple Pay in your store.", "Order terminals", "smartphone"],
      ["Tasks", "done", "brand", "You're all caught up", "New approvals and tasks will show up here.", "", "check"],
      ["Invoices", "none", "neutral", "No unpaid invoices", "All invoices in this period are paid.", "View paid invoices", "receipt"],
      ["Settlements", "error", "danger", "Couldn't load settlements", "This card failed; the rest of the page works.", "Retry", "circle-alert"],
      ["Payroll", "access", "warning", "Only admins can see payroll", "Ask Abdulaziz Ali for the Payroll role.", "Request access", "lock"],
      ["Balance", "offline", "info", "You're offline", "Showing balance from 10:42. It updates when you reconnect.", "Retry now", "wifi-off"],
    ].forEach(([head, type, tone, title, desc, link, glyph]) => {
      const card = el("div", "es-widget");
      const top = el("div", "es-widget-head");
      const badge = el("span", "es-type", type.replace("first", "First use").replace("done", "All done").replace("none", "No results").replace("error", "Error").replace("access", "No access").replace("offline", "Offline"));
      badge.dataset.tone = tone === "brand" && type === "none" ? "neutral" : tone;
      if (type === "none") badge.dataset.tone = "neutral";
      if (type === "error") badge.dataset.tone = "danger";
      if (type === "access") badge.dataset.tone = "warning";
      if (type === "offline") badge.dataset.tone = "info";
      if (type === "first" || type === "done") badge.dataset.tone = "brand";
      top.append(el("strong", "", head), badge);
      const body = el("div", "es-widget-body");
      const mark = tile(glyph, badge.dataset.tone, "es-badge");
      const copy = el("div", "");
      copy.append(el("strong", "", title), el("p", "", desc));
      if (link) {
        const more = el("span", "es-link", link);
        if (tone !== "brand" || type === "none") more.dataset.ink = type === "error" || type === "access" || type === "offline" ? "true" : "false";
        if (type === "first" || type === "done" || type === "none") delete more.dataset.ink;
        if (type === "error" || type === "access" || type === "offline") more.dataset.ink = "true";
        copy.append(more);
      }
      body.append(mark, copy);
      card.append(top, body);
      root.append(card);
    });
    return root;
  }

  function createEmptyPages() {
    const root = el("div", "es-pages");
    [
      ["404", "quiet", "Page not found", "The link may be old or mistyped.", "Go to dashboard", ""],
      ["500", "danger", "Something went wrong", "We've been notified and are fixing it. Your money is safe.", "Try again", "Status page"],
      ["03:00", "brand", "Back soon", "Scheduled maintenance until 3:00 am. POS keeps accepting payments.", "See status", ""],
      ["0:00", "warning", "Session expired", "For your security we signed you out after 15 minutes.", "Sign in again", ""],
    ].forEach(([code, tone, title, desc, primary, secondary]) => {
      const card = el("div", "es-page");
      const mark = el("span", "es-code", code);
      mark.dataset.tone = tone;
      const actions = el("div", "es-actions");
      actions.append(cta(primary, "ink"));
      if (secondary) actions.append(cta(secondary, "secondary"));
      card.append(mark, el("h3", "", title), el("p", "", desc), actions);
      root.append(card);
    });
    return root;
  }

  function createEmptyPhones() {
    const root = el("div", "es-phones");
    const phones = [
      { kicker: "First use · home", tone: "brand", icon: "plus", title: "Your account is ready", desc: "Add money or share your IBAN to receive your first payment.", button: "Add money", kind: "primary" },
      { kicker: "No results · search", tone: "neutral", icon: "search-x", title: "No matches for \"Nour Tradng\"", desc: "Check the spelling or search by IBAN or amount.", button: "Clear search", kind: "secondary", search: true },
      { kicker: "Error · list", tone: "danger", icon: "circle-alert", title: "Couldn't load activity", desc: "Your money is safe. Pull down or tap to try again.", button: "Try again", kind: "ink", hint: true },
      { kicker: "Offline · cards", tone: "info", icon: "wifi-off", title: "Can't freeze cards offline", desc: "Card controls need a connection. Your cards keep their last settings.", button: "Open settings", kind: "secondary", banner: true },
    ];
    phones.forEach((item) => {
      const card = el("div", "es-phone");
      card.append(el("span", "es-kicker", item.kicker));
      if (item.banner) {
        const banner = el("div", "es-banner", "Offline · showing data from 10:42");
        const mark = icon("wifi-off", "inline");
        if (mark) banner.prepend(mark);
        card.append(banner);
      }
      if (item.search) {
        const find = el("div", "es-find");
        const mark = icon("search", "inline");
        if (mark) find.append(mark);
        find.append(el("b", "", "Nour Tradng"), el("span", "es-clear"));
        card.append(find);
      }
      const body = el("div", "es-phone-body");
      body.append(tile(item.icon, item.tone, "es-phone-tile"), el("h3", "", item.title), el("p", "", item.desc));
      card.append(body, cta(item.button, item.kind));
      if (item.hint) {
        const hint = el("div", "es-hint", "Pull down to refresh");
        const mark = icon("arrow-down");
        if (mark) hint.prepend(mark);
        card.append(hint);
      }
      root.append(card);
    });
    return root;
  }

  function createEmptyWriting() {
    const root = el("div", "es-stack");
    const table = el("div", "es-write");
    const head = el("div", "es-wrow es-whead");
    ["Case", "✓ Write", "× Avoid"].forEach((label) => head.append(el("span", "", label)));
    table.append(head);
    [
      ["First use", "No cards yet. Create one for each team member.", "Nothing here!"],
      ["No results", "No transactions match \"Nour\". Try another name or clear filters.", "Your search returned 0 results."],
      ["Error", "Couldn't load transactions. Your money is safe. Try again.", "Error 500: Internal server error."],
      ["No access", "Only admins can see payroll. Ask Abdulaziz Ali for access.", "Access denied."],
      ["Offline", "You're offline. Showing balance from 10:42.", "Network request failed."],
    ].forEach(([name, good, bad]) => {
      const row = el("div", "es-wrow");
      row.append(el("strong", "", name), el("span", "", good), el("span", "es-avoid", bad));
      table.append(row);
    });
    const rules = el("div", "es-rules");
    [
      [true, "Design the empty state together with the full state, in the same space."],
      [true, "One action at most. If nothing can be done, say when it will change."],
      [true, "Show loading skeletons first; decide between empty and error only after the response."],
      [true, "Errors in one card never blank the whole page."],
      [false, "Don't show \"0\" or an empty chart for data that failed to load. Use \"—\" and an error."],
      [false, "Don't use jokes, illustrations of people, or exclamation marks for errors involving money."],
    ].forEach(([ok, text]) => {
      const rule = el("div", "es-rule");
      const mark = el("span", "es-mark", ok ? "✓" : "×");
      mark.dataset.ok = ok ? "true" : "false";
      rule.append(mark, el("span", "", text));
      rules.append(rule);
    });
    root.append(table, rules);
    return root;
  }

  window.createEmptyAnatomy = createEmptyAnatomy;
  window.createEmptyCharts = createEmptyCharts;
  window.createEmptyTable = createEmptyTable;
  window.createEmptyWidgets = createEmptyWidgets;
  window.createEmptyPages = createEmptyPages;
  window.createEmptyPhones = createEmptyPhones;
  window.createEmptyWriting = createEmptyWriting;
})();
