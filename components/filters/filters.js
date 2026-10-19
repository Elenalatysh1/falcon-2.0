/**
 * Filters. Load lucide UMD, button.js, and badges.js, then this script.
 *
 * createFilterPill({ label, state, count })
 *   state: "default" | "hover" | "open" | "applied" | "count" | "disabled"
 * createBranchMenu()
 * createAmountMenu()
 * createQuickFilters()
 * createTransactionFilters()
 * createSalesFilters()
 * createCardFilters()
 * createActivityFilters()
 *
 * Web applies a filter as soon as it changes. The mobile sheet collects
 * choices and applies them with one button. iOS and Android share that sheet.
 */
(function () {
  const DATES = [
    ["today", "Today"],
    ["7d", "Last 7 days"],
    ["30d", "Last 30 days"],
    ["all", "All time"],
  ];
  const STATUSES = ["Settled", "Pending", "Refunded", "Declined"];
  const METHODS = ["mada", "Visa", "Apple Pay", "Transfer"];
  const BRANCHES = [
    ["Olaya", 412],
    ["Malqa", 228],
    ["Jeddah Corniche", 301],
    ["Khobar Mall", 96],
  ];
  const TX_BRANCHES = ["Olaya", "Malqa", "Jeddah", "Online"];
  const CARDS = ["Marketing •• 4417", "Operations •• 2086"];
  const AMOUNTS = [
    ["any", "Any", "0%", "0%", "Any", "Any"],
    ["lt", "< 500", "0%", "90%", "0", "500"],
    ["mid", "500 – 5k", "10%", "55%", "500", "5,000"],
    ["gt", "> 5k", "45%", "0%", "5,000", "Any"],
  ];
  const DAY = { Today: 0, Yesterday: 1, "12 Oct": 3, "11 Oct": 4 };
  const TRANSACTIONS = [
    ["Al Baik · Olaya", "Today 12:41", "Today", "Olaya", "mada", 86.25, "Settled", "Marketing •• 4417"],
    ["Jarir Bookstore", "Today 11:08", "Today", "Malqa", "Visa", -1249, "Settled", "Operations •• 2086"],
    ["Nour Trading", "Today 09:30", "Today", "Olaya", "Transfer", -25000, "Pending", ""],
    ["Careem", "Yesterday", "Yesterday", "Jeddah", "Visa", -38.5, "Settled", "Operations •• 2086"],
    ["Online store #2041", "Yesterday", "Yesterday", "Online", "Apple Pay", 420, "Settled", "Marketing •• 4417"],
    ["Hungerstation", "12 Oct", "12 Oct", "Malqa", "mada", 212, "Refunded", "Marketing •• 4417"],
    ["STC Pay top-up", "12 Oct", "12 Oct", "Online", "Transfer", 5000, "Declined", ""],
    ["Panda", "11 Oct", "11 Oct", "Jeddah", "mada", -640.75, "Settled", "Marketing •• 4417"],
  ].map(([merchant, when, day, branch, method, amount, status, card]) => ({
    merchant, when, day, branch, method, amount, status, card,
  }));
  const CARD_ROWS = [
    ["Marketing", "Omar Bakr", "4417", "Active", "brand"],
    ["Operations", "Sara Al-Otaibi", "2086", "Frozen", "metal"],
    ["Travel", "Omar Bakr", "7731", "Active", "ink"],
    ["Fuel", "Fahad Al-Qahtani", "9902", "Active", "fuel"],
    ["Old supplier", "Sara Al-Otaibi", "1180", "Cancelled", "cancelled"],
  ].map(([name, holder, last, status, art]) => ({ name, holder, last, status, art }));
  const PERIODS = [
    ["7D", 7],
    ["1M", 12],
    ["3M", 12],
    ["1Y", 12],
  ];
  const SERIES = [
    ["POS", "pos"],
    ["Online", "online"],
    ["Delivery", "delivery"],
  ];
  const TONE = { Settled: "settled", Pending: "pending", Refunded: "refunded", Declined: "declined" };
  const BADGE = { Active: "settled", Frozen: "frozen", Cancelled: "neutral" };

  let seq = 0;

  function nextId(name) {
    seq += 1;
    return `flt-${name}-${seq}`;
  }

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
    svg.style.strokeWidth = "var(--icon-stroke)";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function visible(node) {
    return node.isConnected && !node.closest("[hidden]");
  }

  function focusables(node) {
    return [...node.querySelectorAll("button, input, a[href], [tabindex]")].filter((item) => !item.disabled && item.tabIndex !== -1 && !item.closest("[hidden]"));
  }

  function money(amount) {
    const sign = amount > 0 ? "+ " : "− ";
    const body = Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return sign + body;
  }

  function toggle(list, value) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function inRange(day, preset) {
    if (preset === "all") return true;
    const rank = DAY[day];
    if (rank == null) return false;
    if (preset === "today") return rank === 0;
    if (preset === "7d") return rank <= 7;
    return rank <= 30;
  }

  function matchesQuery(row, query) {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const amount = Math.abs(row.amount);
    const plain = String(amount);
    const fixed = amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return row.merchant.toLowerCase().includes(q) || plain.includes(q) || fixed.toLowerCase().includes(q);
  }

  function liveBadge() {
    return el("span", "flt-live", "Live");
  }

  function bindMenuKeys(menu) {
    menu.addEventListener("keydown", (event) => {
      const options = [...menu.querySelectorAll(".flt-option")];
      const index = options.indexOf(document.activeElement);
      if (!options.length || index < 0) return;
      let next = -1;
      if (event.key === "ArrowDown") next = (index + 1) % options.length;
      else if (event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = options.length - 1;
      else return;
      event.preventDefault();
      options[next].focus();
    });
  }

  function trap(event, dialog) {
    if (event.key !== "Tab") return;
    const items = focusables(dialog);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function optionButton({ label, count, on, multiple, onPick, key }) {
    const button = el("button", "flt-option");
    button.type = "button";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", on ? "true" : "false");
    if (!multiple) button.dataset.single = "true";
    if (key) button.dataset.key = key;
    const mark = el("span", "flt-mark");
    mark.dataset.on = on ? "true" : "false";
    mark.dataset.shape = multiple ? "box" : "dot";
    if (on && multiple) {
      const glyph = icon("check", "inline");
      if (glyph) mark.append(glyph);
    }
    button.append(mark, el("span", "flt-option-label", label));
    if (count != null) button.append(el("span", "flt-meta", String(count)));
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onPick();
    });
    return button;
  }

  function chipButton(label, on, tone, key, onPick) {
    const button = el("button", "flt-chip", label);
    button.type = "button";
    button.dataset.on = on ? "true" : "false";
    if (tone) button.dataset.tone = tone;
    button.setAttribute("aria-pressed", on ? "true" : "false");
    if (key) button.dataset.key = key;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onPick();
    });
    return button;
  }

  function searchField(placeholder) {
    const wrap = el("label", "flt-search");
    const glyph = icon("search", "inline");
    const input = document.createElement("input");
    input.type = "search";
    input.placeholder = placeholder;
    input.setAttribute("aria-label", placeholder);
    input.autocomplete = "off";
    if (glyph) wrap.append(glyph);
    wrap.append(input);
    return { wrap, input };
  }

  function actionButton(label, variant, extra) {
    if (window.createButton) return window.createButton({ label, variant, size: "md", type: "button", ...extra });
    const button = el("button", "", label);
    button.type = "button";
    return button;
  }

  function setButtonLabel(button, label, disabled) {
    const text = button.querySelector(".button-label");
    if (text) text.textContent = label;
    else button.textContent = label;
    button.disabled = !!disabled;
  }

  function appliedTag(key, value, onRemove) {
    if (window.createBadge) {
      return window.createBadge({ variant: "tag", key, label: value, dismissible: true, onDismiss: onRemove });
    }
    return el("span", "", `${key}: ${value}`);
  }

  function statusBadge(status) {
    if (window.createBadge) return window.createBadge({ label: status, tone: BADGE[status] || "neutral", size: "sm" });
    return el("span", "", status);
  }

  function createFilterPill(options = {}) {
    const pill = el("span", "flt-pill");
    pill.dataset.state = options.state || "default";
    pill.append(el("span", "", options.label || "Status"));
    if (options.count) pill.append(el("span", "flt-count", String(options.count)));
    if (options.clear) {
      const mark = el("span", "flt-pill-x");
      const glyph = icon("x", "inline");
      if (glyph) mark.append(glyph);
      pill.append(mark);
    } else {
      const glyph = icon("chevron-down", "inline");
      if (glyph) {
        glyph.classList.add("flt-chevron");
        pill.append(glyph);
      }
    }
    return pill;
  }

  function createBranchMenu() {
    const selected = new Set(["Olaya", "Malqa"]);
    let query = "";
    const menu = el("div", "flt-menu");
    menu.setAttribute("role", "group");
    menu.setAttribute("aria-label", "Branches");
    const find = el("label", "flt-find");
    const glyph = icon("search", "inline");
    const input = document.createElement("input");
    input.type = "search";
    input.placeholder = "Search branches";
    input.setAttribute("aria-label", "Search branches");
    if (glyph) find.append(glyph);
    find.append(input);
    const list = el("div", "flt-options");
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-multiselectable", "true");
    list.setAttribute("aria-label", "Branches");
    const foot = el("div", "flt-menu-foot");
    const clear = el("button", "flt-text", "Clear");
    clear.type = "button";
    const sum = el("span", "", "");
    foot.append(clear, sum);
    menu.append(find, list, foot);
    input.addEventListener("input", () => {
      query = input.value;
      paint();
    });
    clear.addEventListener("click", () => {
      selected.clear();
      paint();
    });
    function paint(focusName) {
      const q = query.trim().toLowerCase();
      const shown = BRANCHES.filter(([name]) => name.toLowerCase().includes(q));
      list.replaceChildren();
      if (!shown.length) list.append(el("p", "flt-meta flt-pad", "No branches match"));
      shown.forEach(([name, count]) => {
        list.append(optionButton({
          label: name,
          count,
          on: selected.has(name),
          multiple: true,
          key: name,
          onPick: () => {
            if (selected.has(name)) selected.delete(name);
            else selected.add(name);
            paint(name);
          },
        }));
      });
      const n = selected.size;
      sum.textContent = n ? `${n} selected` : "All branches";
      if (focusName) {
        const node = list.querySelector(`[data-key="${CSS.escape(focusName)}"]`);
        if (node) node.focus();
      }
    }
    bindMenuKeys(menu);
    paint();
    return menu;
  }

  function createAmountMenu() {
    let current = "lt";
    const menu = el("div", "flt-menu");
    menu.dataset.pad = "roomy";
    const presets = el("div", "flt-presets");
    presets.setAttribute("role", "radiogroup");
    presets.setAttribute("aria-label", "Amount");
    const slider = el("div", "flt-slider");
    slider.setAttribute("aria-hidden", "true");
    slider.append(el("span", "flt-track"), el("span", "flt-fill"), el("span", "flt-thumb flt-thumb-start"), el("span", "flt-thumb flt-thumb-end"));
    const fields = el("div", "flt-fields");
    const min = el("div", "flt-field");
    const max = el("div", "flt-field");
    min.append(el("span", "flt-field-label", "Min, SAR"), el("span", "flt-field-value"));
    max.append(el("span", "flt-field-label", "Max, SAR"), el("span", "flt-field-value"));
    fields.append(min, max);
    menu.append(presets, slider, fields);
    const buttons = AMOUNTS.map(([value, label]) => {
      const button = el("button", "flt-preset", label);
      button.type = "button";
      button.setAttribute("role", "radio");
      button.addEventListener("click", () => {
        current = value;
        paint();
      });
      presets.append(button);
      return button;
    });
    function paint() {
      const row = AMOUNTS.find((item) => item[0] === current) || AMOUNTS[0];
      buttons.forEach((button, index) => {
        const on = AMOUNTS[index][0] === current;
        button.setAttribute("aria-checked", on ? "true" : "false");
        button.tabIndex = on ? 0 : -1;
      });
      const fill = slider.querySelector(".flt-fill");
      const start = slider.querySelector(".flt-thumb-start");
      const end = slider.querySelector(".flt-thumb-end");
      fill.style.insetInlineStart = row[2];
      fill.style.insetInlineEnd = row[3];
      start.style.insetInlineStart = row[2];
      end.style.insetInlineEnd = row[3];
      min.querySelector(".flt-field-value").textContent = row[4];
      max.querySelector(".flt-field-value").textContent = row[5];
    }
    presets.addEventListener("keydown", (event) => {
      const index = AMOUNTS.findIndex((item) => item[0] === current);
      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % AMOUNTS.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + AMOUNTS.length) % AMOUNTS.length;
      else return;
      event.preventDefault();
      current = AMOUNTS[next][0];
      paint();
      buttons[next].focus();
    });
    paint();
    return menu;
  }

  function createQuickFilters() {
    const root = el("div", "flt-stack");
    let direction = "all";
    const methods = new Set();
    const directions = [
      ["all", "All"],
      ["in", "Money in"],
      ["out", "Money out"],
    ];
    function paint() {
      const active = document.activeElement;
      const activeKey = active && root.contains(active) ? active.dataset.key : "";
      const segment = el("div", "flt-segment");
      segment.setAttribute("role", "radiogroup");
      segment.setAttribute("aria-label", "Direction");
      directions.forEach(([value, label]) => {
        const button = el("button", "flt-seg", label);
        button.type = "button";
        button.setAttribute("role", "radio");
        const on = direction === value;
        button.setAttribute("aria-checked", on ? "true" : "false");
        button.tabIndex = on ? 0 : -1;
        button.dataset.key = `dir:${value}`;
        button.addEventListener("click", () => {
          direction = value;
          paint();
        });
        segment.append(button);
      });
      segment.addEventListener("keydown", (event) => {
        const index = directions.findIndex((item) => item[0] === direction);
        let next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % directions.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + directions.length) % directions.length;
        else return;
        event.preventDefault();
        direction = directions[next][0];
        paint();
        root.querySelectorAll(".flt-seg")[next].focus();
      });
      const chips = el("div", "flt-chips");
      METHODS.forEach((method) => {
        chips.append(chipButton(method, methods.has(method), "", `method:${method}`, () => {
          if (methods.has(method)) methods.delete(method);
          else methods.add(method);
          paint();
        }));
      });
      root.replaceChildren(segment, chips);
      if (activeKey) {
        const node = root.querySelector(`[data-key="${CSS.escape(activeKey)}"]`);
        if (node) node.focus();
      }
    }
    paint();
    return root;
  }

  function filteredTransactions(state) {
    return TRANSACTIONS.filter((row) => {
      if (!matchesQuery(row, state.q)) return false;
      if (!inRange(row.day, state.date)) return false;
      if (state.status.length && !state.status.includes(row.status)) return false;
      if (state.method.length && !state.method.includes(row.method)) return false;
      if (state.dir === "Money in" && row.amount <= 0) return false;
      if (state.dir === "Money out" && row.amount >= 0) return false;
      if (state.branch.length && !state.branch.includes(row.branch)) return false;
      if (state.card.length && !state.card.includes(row.card)) return false;
      return true;
    });
  }

  function createTransactionFilters() {
    const state = {
      q: "",
      open: null,
      more: false,
      date: "30d",
      status: [],
      method: [],
      dir: "All",
      branch: [],
      card: [],
    };
    let pendingReturn = "";
    const root = el("div", "flt-stage");
    const head = el("div", "flt-stage-head");
    head.append(el("h3", "flt-title", "Transactions"), liveBadge());
    const toolbar = el("div", "flt-toolbar");
    const search = searchField("Search merchant or amount");
    const pills = el("div", "flt-pills");
    toolbar.append(search.wrap, pills);
    const tags = el("div", "flt-tags");
    const table = el("div", "flt-table");
    const layer = el("div", "flt-layer");
    layer.hidden = true;
    root.append(head, toolbar, tags, table, layer);
    search.input.addEventListener("input", () => {
      state.q = search.input.value;
      paint();
    });
    root.addEventListener("click", (event) => event.stopPropagation());
    root.addEventListener("keydown", (event) => {
      const dialog = root.querySelector(".flt-drawer");
      if (dialog) trap(event, dialog);
      const menu = event.target.closest(".flt-menu");
      if (!menu) return;
      const options = [...menu.querySelectorAll(".flt-option")];
      const index = options.indexOf(document.activeElement);
      if (index < 0) return;
      let next = -1;
      if (event.key === "ArrowDown") next = (index + 1) % options.length;
      else if (event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = options.length - 1;
      else return;
      event.preventDefault();
      options[next].focus();
    });

    function rows() {
      return filteredTransactions(state);
    }

    function clearAll() {
      state.q = "";
      state.date = "all";
      state.status = [];
      state.method = [];
      state.dir = "All";
      state.branch = [];
      state.card = [];
      state.open = null;
      search.input.value = "";
      paint();
    }

    function pill(key, label, applied) {
      const button = el("button", "flt-pill", label);
      button.type = "button";
      button.dataset.key = key;
      button.dataset.open = state.open === key ? "true" : "false";
      if (applied) button.dataset.applied = "true";
      button.setAttribute("aria-haspopup", "listbox");
      button.setAttribute("aria-expanded", state.open === key ? "true" : "false");
      const glyph = icon("chevron-down", "inline");
      if (glyph) {
        glyph.classList.add("flt-chevron");
        button.append(glyph);
      }
      button.addEventListener("click", () => {
        state.open = state.open === key ? null : key;
        state.more = false;
        paint();
      });
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown") return;
        event.preventDefault();
        state.open = key;
        state.more = false;
        const first = key === "date" ? "date:today" : `${key}:${key === "status" ? STATUSES[0] : METHODS[0]}`;
        pendingReturn = first;
        paint();
      });
      return button;
    }

    function menuFor(key) {
      const menu = el("div", "flt-menu flt-pop");
      menu.id = nextId(key);
      menu.setAttribute("role", "listbox");
      menu.setAttribute("aria-label", key);
      const multiple = key !== "date";
      if (multiple) menu.setAttribute("aria-multiselectable", "true");
      const options = key === "date" ? DATES : (key === "status" ? STATUSES : METHODS).map((item) => [item, item]);
      const list = el("div", "flt-options");
      options.forEach(([value, label]) => {
        const on = multiple ? state[key].includes(value) : state.date === value;
        list.append(optionButton({
          label,
          on,
          multiple,
          key: `${key}:${value}`,
          onPick: () => {
            if (multiple) state[key] = toggle(state[key], value);
            else {
              state.date = value;
              state.open = null;
              pendingReturn = key;
            }
            paint();
          },
        }));
      });
      menu.append(list);
      return menu;
    }

    function paintPills() {
      const dateLabel = state.date === "all" ? "Date" : (DATES.find((item) => item[0] === state.date) || ["", "Date"])[1];
      const statusLabel = !state.status.length ? "Status" : state.status.length === 1 ? `Status: ${state.status[0]}` : `Status · ${state.status.length}`;
      const methodLabel = !state.method.length ? "Method" : state.method.length === 1 ? `Method: ${state.method[0]}` : `Method · ${state.method.length}`;
      const specs = [
        ["date", dateLabel, state.date !== "all"],
        ["status", statusLabel, state.status.length > 0],
        ["method", methodLabel, state.method.length > 0],
      ];
      pills.replaceChildren();
      specs.forEach(([key, label, applied]) => {
        const anchor = el("div", "flt-anchor");
        const button = pill(key, label, applied);
        anchor.append(button);
        if (state.open === key) {
          const menu = menuFor(key);
          button.setAttribute("aria-controls", menu.id);
          anchor.append(menu);
        }
        pills.append(anchor);
      });
      const moreCount = (state.dir === "All" ? 0 : 1) + state.branch.length + state.card.length;
      const more = el("button", "flt-more");
      more.type = "button";
      more.dataset.key = "more";
      if (moreCount) more.dataset.applied = "true";
      more.setAttribute("aria-haspopup", "dialog");
      more.setAttribute("aria-expanded", state.more ? "true" : "false");
      const glyph = icon("sliders-horizontal", "inline");
      if (glyph) more.append(glyph);
      more.append(document.createTextNode("More filters"));
      if (moreCount) more.append(el("span", "flt-count", String(moreCount)));
      more.addEventListener("click", () => {
        state.more = !state.more;
        state.open = null;
        if (state.more) pendingReturn = "drawer-close";
        paint();
      });
      pills.append(more);
    }

    function paintTags(list) {
      const items = [];
      if (state.date !== "all") {
        const label = (DATES.find((item) => item[0] === state.date) || ["", state.date])[1];
        items.push(appliedTag("Date", label, () => { state.date = "all"; paint(); }));
      }
      state.status.forEach((value) => items.push(appliedTag("Status", value, () => { state.status = state.status.filter((item) => item !== value); paint(); })));
      state.method.forEach((value) => items.push(appliedTag("Method", value, () => { state.method = state.method.filter((item) => item !== value); paint(); })));
      if (state.dir !== "All") items.push(appliedTag("Type", state.dir, () => { state.dir = "All"; paint(); }));
      state.branch.forEach((value) => items.push(appliedTag("Branch", value, () => { state.branch = state.branch.filter((item) => item !== value); paint(); })));
      state.card.forEach((value) => items.push(appliedTag("Card", value, () => { state.card = state.card.filter((item) => item !== value); paint(); })));
      tags.replaceChildren();
      items.forEach((item) => {
        item.classList.add("flt-tag");
        tags.append(item);
      });
      if (items.length) {
        const clear = el("button", "flt-text", "Clear all");
        clear.type = "button";
        clear.addEventListener("click", clearAll);
        tags.append(clear);
      }
      const count = el("span", "flt-count-text", `${list.length} of ${TRANSACTIONS.length} transactions`);
      count.setAttribute("aria-live", "polite");
      tags.append(count);
    }

    function paintTable(list) {
      table.replaceChildren();
      const headRow = el("div", "flt-grid flt-thead");
      ["Merchant", "Branch", "Method", "Amount", "Status"].forEach((label, index) => {
        const cell = el("span", "", label);
        if (index === 3) cell.className = "flt-amount";
        headRow.append(cell);
      });
      table.append(headRow);
      if (!list.length) {
        const empty = el("div", "flt-empty");
        empty.setAttribute("role", "status");
        const mark = el("span", "flt-empty-icon");
        const glyph = icon("search");
        if (glyph) mark.append(glyph);
        const copy = el("p");
        copy.append(document.createTextNode("Try removing one, or "));
        const clear = el("button", "flt-text", "clear all filters");
        clear.type = "button";
        clear.addEventListener("click", clearAll);
        copy.append(clear, document.createTextNode("."));
        empty.append(mark, el("strong", "", "No transactions match these filters"), copy);
        table.append(empty);
        return;
      }
      list.forEach((row) => {
        const line = el("div", "flt-grid flt-row");
        const merchant = el("div", "flt-merchant");
        merchant.append(el("strong", "", row.merchant), el("span", "", row.when));
        const amount = el("span", "flt-amount", money(row.amount));
        amount.dataset.sign = row.amount > 0 ? "in" : "out";
        const status = el("span", "flt-status");
        const dot = el("span", "flt-dot");
        dot.dataset.tone = TONE[row.status] || "refunded";
        status.append(dot, document.createTextNode(row.status));
        line.append(merchant, el("span", "flt-quiet", row.branch), el("span", "flt-quiet", row.method), amount, status);
        table.append(line);
      });
    }

    function paintDrawer(list) {
      layer.hidden = !state.more;
      if (!state.more) {
        layer.replaceChildren();
        return;
      }
      const titleId = nextId("drawer-title");
      const scrim = el("button", "flt-scrim");
      scrim.type = "button";
      scrim.setAttribute("aria-label", "Close more filters");
      scrim.addEventListener("click", () => {
        state.more = false;
        pendingReturn = "more";
        paint();
      });
      const drawer = el("div", "flt-drawer");
      drawer.setAttribute("role", "dialog");
      drawer.setAttribute("aria-modal", "true");
      drawer.setAttribute("aria-labelledby", titleId);
      const headRow = el("div", "flt-drawer-head");
      const title = el("h3", "", "More filters");
      title.id = titleId;
      const close = el("button", "flt-icon-btn");
      close.type = "button";
      close.dataset.key = "drawer-close";
      close.setAttribute("aria-label", "Close");
      const glyph = icon("x", "inline");
      if (glyph) close.append(glyph);
      close.addEventListener("click", () => {
        state.more = false;
        pendingReturn = "more";
        paint();
      });
      headRow.append(title, close);
      const body = el("div", "flt-drawer-body");
      const groups = [
        ["Type", ["All", "Money in", "Money out"], "dir", false],
        ["Branch", TX_BRANCHES, "branch", true],
        ["Card", CARDS, "card", true],
      ];
      groups.forEach(([label, options, key, multiple]) => {
        const group = el("div", "flt-group");
        group.append(el("span", "flt-group-label", label));
        const chips = el("div", "flt-chips");
        options.forEach((option) => {
          const on = multiple ? state[key].includes(option) : state[key] === option;
          chips.append(chipButton(option, on, "", `${key}:${option}`, () => {
            if (multiple) state[key] = toggle(state[key], option);
            else state[key] = option;
            paint();
          }));
        });
        group.append(chips);
        body.append(group);
      });
      const foot = el("div", "flt-footer");
      const reset = actionButton("Reset", "secondary");
      reset.addEventListener("click", () => {
        state.dir = "All";
        state.branch = [];
        state.card = [];
        paint();
      });
      const show = actionButton(`Show ${list.length} result${list.length === 1 ? "" : "s"}`, "ink");
      show.classList.add("flt-apply");
      show.addEventListener("click", () => {
        state.more = false;
        pendingReturn = "more";
        paint();
      });
      foot.append(reset, show);
      drawer.append(headRow, body, foot);
      drawer.addEventListener("keydown", (event) => trap(event, drawer));
      layer.replaceChildren(scrim, drawer);
    }

    function paint() {
      const activeKey = document.activeElement && root.contains(document.activeElement) ? document.activeElement.dataset.key : "";
      const scroller = root.querySelector(".flt-drawer-body");
      const scrollTop = scroller ? scroller.scrollTop : 0;
      const list = rows();
      paintPills();
      paintTags(list);
      paintTable(list);
      paintDrawer(list);
      const nextScroller = root.querySelector(".flt-drawer-body");
      if (nextScroller) nextScroller.scrollTop = scrollTop;
      const card = root.getBoundingClientRect();
      root.querySelectorAll(".flt-pop").forEach((menu) => {
        const bounds = menu.getBoundingClientRect();
        if (bounds.right > card.right) {
          menu.style.insetInlineStart = "auto";
          menu.style.insetInlineEnd = "0";
        } else if (bounds.left < card.left) {
          menu.style.insetInlineStart = "0";
          menu.style.insetInlineEnd = "auto";
        }
      });
      const target = pendingReturn || activeKey;
      pendingReturn = "";
      if (target) {
        const node = root.querySelector(`[data-key="${CSS.escape(target)}"]`);
        if (node) node.focus();
      }
    }

    document.addEventListener("click", () => {
      if (!visible(root) || (!state.open && !state.more)) return;
      state.open = null;
      if (state.more) pendingReturn = "more";
      state.more = false;
      paint();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !visible(root) || (!state.open && !state.more)) return;
      event.preventDefault();
      event.stopPropagation();
      pendingReturn = state.more ? "more" : state.open;
      state.open = null;
      state.more = false;
      paint();
    });
    paint();
    return root;
  }

  function createSalesFilters() {
    const root = el("div", "flt-stage flt-stage-hug");
    let period = 1;
    let compare = true;
    const series = { POS: true, Online: true, Delivery: false };
    const head = el("div", "flt-chart-head");
    const totals = el("div", "flt-total-wrap");
    totals.append(el("span", "flt-kicker", "POS sales"), el("span", "flt-total"), el("span", "flt-delta"));
    const tools = el("div", "flt-chart-tools");
    const bars = el("div", "flt-bars");
    const seriesRow = el("div", "flt-series-row");
    seriesRow.setAttribute("role", "group");
    seriesRow.setAttribute("aria-label", "Channels");
    const warn = el("p", "flt-warn", "Select at least one channel to see data.");
    warn.setAttribute("role", "status");
    root.append(head, seriesRow, bars, warn);

    function paint() {
      const focused = document.activeElement;
      const activeKey = focused && root.contains(focused) ? focused.dataset.key : "";
      const segment = el("div", "flt-segment");
      segment.dataset.size = "xs";
      segment.setAttribute("role", "radiogroup");
      segment.setAttribute("aria-label", "Period");
      PERIODS.forEach(([label], index) => {
        const button = el("button", "flt-seg", label);
        button.type = "button";
        button.setAttribute("role", "radio");
        const on = period === index;
        button.setAttribute("aria-checked", on ? "true" : "false");
        button.tabIndex = on ? 0 : -1;
        button.dataset.key = `period:${label}`;
        button.addEventListener("click", () => {
          period = index;
          paint();
        });
        segment.append(button);
      });
      const compareButton = el("button", "flt-compare");
      compareButton.type = "button";
      compareButton.dataset.key = "compare";
      compareButton.setAttribute("aria-pressed", compare ? "true" : "false");
      compareButton.append(el("span", "flt-dash"), document.createTextNode("Compare to previous"));
      compareButton.addEventListener("click", () => {
        compare = !compare;
        paint();
      });
      tools.replaceChildren(segment, compareButton);
      head.replaceChildren(totals, tools);
      const active = SERIES.filter(([name]) => series[name]).map(([name]) => name);
      const base = { POS: 184320, Online: 42180, Delivery: 18640 };
      const mult = [0.24, 1, 2.9, 11.6][period];
      const total = Math.round(active.reduce((sum, name) => sum + base[name], 0) * mult);
      totals.querySelector(".flt-total").textContent = `SAR ${total.toLocaleString("en-US")}`;
      const delta = totals.querySelector(".flt-delta");
      delta.dataset.up = compare && active.length ? "true" : "false";
      delta.textContent = active.length ? (compare ? "↑ 12.4% vs previous period" : `${PERIODS[period][0]} · ${active.join(" + ")}`) : "—";
      seriesRow.replaceChildren();
      SERIES.forEach(([name, swatch]) => {
        const button = el("button", "flt-series");
        button.type = "button";
        button.dataset.key = `series:${name}`;
        const on = !!series[name];
        button.setAttribute("aria-pressed", on ? "true" : "false");
        const mark = el("span", "flt-swatch");
        mark.dataset.series = swatch;
        button.append(mark, document.createTextNode(name));
        button.addEventListener("click", () => {
          series[name] = !series[name];
          paint();
        });
        seriesRow.append(button);
      });
      const count = PERIODS[period][1];
      bars.dataset.density = count > 7 ? "compact" : "comfy";
      bars.replaceChildren();
      for (let i = 0; i < count; i += 1) {
        const pos = series.POS ? (0.35 + 0.5 * Math.abs(Math.sin(i * 1.7 + 2.3 + period))) * 52 : 0;
        const online = series.Online ? (0.35 + 0.5 * Math.abs(Math.sin(i * 1.7 + 4.6 + period))) * 26 : 0;
        const delivery = series.Delivery ? (0.35 + 0.5 * Math.abs(Math.sin(i * 1.7 + 6.9 + period))) * 18 : 0;
        const tot = pos + online + delivery;
        const col = el("div", "flt-col");
        const prev = el("span", "flt-prev");
        prev.style.bottom = `${tot * (0.82 + 0.1 * Math.cos(i))}%`;
        if (compare && tot) prev.dataset.show = "true";
        const top = delivery ? "delivery" : online ? "online" : pos ? "pos" : "";
        col.append(prev);
        [["delivery", delivery], ["online", online], ["pos", pos]].forEach(([name, value]) => {
          const part = el("span", `flt-part flt-part-${name}`);
          part.style.height = `${value}%`;
          if (name === top && value) part.dataset.top = "true";
          col.append(part);
        });
        bars.append(col);
      }
      warn.hidden = active.length > 0;
      if (activeKey) {
        const node = root.querySelector(`[data-key="${CSS.escape(activeKey)}"]`);
        if (node) node.focus();
      }
    }

    paint();
    return root;
  }

  function createCardFilters() {
    const root = el("div", "flt-stage flt-stage-hug");
    let tab = "All";
    let holder = "Everyone";
    const holders = ["Everyone", "Omar Bakr", "Sara Al-Otaibi", "Fahad Al-Qahtani"];
    const head = el("div", "flt-stage-head");
    head.append(el("h3", "flt-title", "Cards"), liveBadge());
    const tabs = el("div", "flt-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Card status");
    const chips = el("div", "flt-chips");
    const list = el("div", "flt-cards");
    root.append(head, tabs, chips, list);

    function paint() {
      const active = document.activeElement;
      const activeKey = active && root.contains(active) ? active.dataset.key : "";
      const byHolder = CARD_ROWS.filter((card) => holder === "Everyone" || card.holder === holder);
      tabs.replaceChildren();
      ["All", "Active", "Frozen", "Cancelled"].forEach((name) => {
        const count = byHolder.filter((card) => name === "All" || card.status === name).length;
        const button = el("button", "flt-tab");
        button.type = "button";
        button.dataset.key = `tab:${name}`;
        button.setAttribute("role", "tab");
        const on = tab === name;
        button.setAttribute("aria-selected", on ? "true" : "false");
        button.tabIndex = on ? 0 : -1;
        button.append(document.createTextNode(name), el("span", "flt-tab-count", String(count)));
        button.addEventListener("click", () => {
          tab = name;
          paint();
        });
        tabs.append(button);
      });
      chips.replaceChildren();
      holders.forEach((name) => {
        chips.append(chipButton(name, holder === name, "", `holder:${name}`, () => {
          holder = name;
          paint();
        }));
      });
      const shown = byHolder.filter((card) => tab === "All" || card.status === tab);
      list.replaceChildren();
      if (!shown.length) {
        const empty = el("p", "flt-muted", `No ${tab.toLowerCase()} cards for ${holder}.`);
        empty.setAttribute("role", "status");
        list.append(empty);
        return;
      }
      shown.forEach((card) => {
        const row = el("div", "flt-card");
        const art = el("span", "flt-art");
        art.dataset.art = card.art;
        const person = el("div", "flt-person");
        person.append(el("strong", "", card.name), el("span", "", `${card.holder} · •• ${card.last}`));
        row.append(art, person, statusBadge(card.status));
        list.append(row);
      });
      if (activeKey) {
        const node = root.querySelector(`[data-key="${CSS.escape(activeKey)}"]`);
        if (node) node.focus();
      }
    }

    paint();
    return root;
  }

  function createActivityFilters() {
    const root = el("div", "flt-stage flt-stage-hug");
    const applied = { type: "All", status: [], method: [], q: "" };
    let draft = null;
    let sheet = false;
    let pendingReturn = "";
    const head = el("div", "flt-stage-head");
    head.append(el("span", "flt-kicker", "Activity · chip row + sheet"), liveBadge());
    const phone = el("div", "flt-phone");
    root.append(head, phone);
    root.addEventListener("click", (event) => event.stopPropagation());

    function countOf(source) {
      return (source.type === "All" ? 0 : 1) + source.status.length + source.method.length;
    }

    function match(source) {
      return TRANSACTIONS.filter((row) => {
        if (source.q && !matchesQuery(row, source.q)) return false;
        if (source.type === "Money in" && row.amount <= 0) return false;
        if (source.type === "Money out" && row.amount >= 0) return false;
        if (source.status.length && !source.status.includes(row.status)) return false;
        if (source.method.length && !source.method.includes(row.method)) return false;
        return true;
      });
    }

    function paint() {
      const active = document.activeElement;
      const activeKey = active && root.contains(active) ? active.dataset.key : "";
      const caret = activeKey === "search" && active.selectionStart != null ? active.selectionStart : null;
      const list = match(applied);
      const draftList = draft ? match(draft) : list;
      phone.replaceChildren();
      const top = el("div", "flt-phone-head");
      top.append(el("div", "flt-phone-title", "Activity"));
      const searchRow = el("div", "flt-phone-search");
      const search = searchField("Search");
      search.wrap.classList.add("flt-search-fill");
      search.input.dataset.key = "search";
      search.input.value = applied.q;
      search.input.addEventListener("input", () => {
        applied.q = search.input.value;
        paint();
      });
      const filter = el("button", "flt-filter-btn");
      filter.type = "button";
      filter.dataset.key = "filters";
      const n = countOf(applied);
      if (n) filter.dataset.applied = "true";
      filter.setAttribute("aria-label", n ? `Filters, ${n} applied` : "Filters");
      filter.setAttribute("aria-expanded", sheet ? "true" : "false");
      filter.setAttribute("aria-haspopup", "dialog");
      const glyph = icon("sliders-horizontal");
      if (glyph) filter.append(glyph);
      if (n) filter.append(el("span", "flt-count flt-float", String(n)));
      filter.addEventListener("click", () => {
        draft = { type: applied.type, status: [...applied.status], method: [...applied.method], q: applied.q };
        sheet = true;
        pendingReturn = "sheet-close";
        paint();
      });
      searchRow.append(search.wrap, filter);
      const chips = el("div", "flt-chip-row");
      ["All", "Money in", "Money out"].forEach((label) => {
        chips.append(chipButton(label, applied.type === label, "ink", `type:${label}`, () => {
          applied.type = label;
          paint();
        }));
      });
      ["Pending", "Refunded"].forEach((label) => {
        chips.append(chipButton(label, applied.status.includes(label), "", `status:${label}`, () => {
          applied.status = toggle(applied.status, label);
          paint();
        }));
      });
      top.append(searchRow, chips);
      const activity = el("div", "flt-activity");
      const noun = list.length === 1 ? "transaction" : "transactions";
      activity.append(el("span", "flt-activity-label", `${list.length} ${noun}`));
      const card = el("div", "flt-list");
      if (!list.length) {
        const empty = el("p", "flt-muted");
        empty.append(document.createTextNode("Nothing matches. "));
        const reset = el("button", "flt-text", "Reset filters");
        reset.type = "button";
        reset.addEventListener("click", () => {
          applied.type = "All";
          applied.status = [];
          applied.method = [];
          applied.q = "";
          paint();
        });
        empty.append(reset);
        card.append(empty);
      } else {
        list.forEach((row) => {
          const line = el("div", "flt-tx");
          const initials = row.merchant.split(" ").map((word) => word[0] || "").join("").slice(0, 2).toUpperCase();
          const copy = el("div", "flt-tx-copy");
          copy.append(el("strong", "", row.merchant), el("span", "", `${row.when} · ${row.method}`));
          const amount = el("span", "flt-amount", money(row.amount));
          amount.dataset.sign = row.amount > 0 ? "in" : "out";
          line.append(el("span", "flt-avatar", initials), copy, amount);
          card.append(line);
        });
      }
      activity.append(card);
      phone.append(top, activity);
      if (sheet && draft) {
        const titleId = nextId("sheet-title");
        const scrim = el("button", "flt-scrim");
        scrim.type = "button";
        scrim.dataset.tone = "sheet";
        scrim.setAttribute("aria-label", "Close filters");
        scrim.addEventListener("click", () => {
          sheet = false;
          pendingReturn = "filters";
          paint();
        });
        const dialog = el("div", "flt-sheet");
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("aria-labelledby", titleId);
        dialog.append(el("span", "flt-handle"));
        const bar = el("div", "flt-sheet-head");
        const reset = el("button", "flt-text flt-sheet-actions", "Reset");
        reset.type = "button";
        reset.addEventListener("click", () => {
          draft = { type: "All", status: [], method: [], q: applied.q };
          paint();
        });
        const title = el("h3", "flt-sheet-title", "Filters");
        title.id = titleId;
        const closeWrap = el("span", "flt-sheet-actions");
        closeWrap.dataset.align = "end";
        const close = el("button", "flt-icon-btn");
        close.type = "button";
        close.dataset.shape = "circle";
        close.dataset.key = "sheet-close";
        close.setAttribute("aria-label", "Close");
        const mark = icon("x", "inline");
        if (mark) close.append(mark);
        close.addEventListener("click", () => {
          sheet = false;
          pendingReturn = "filters";
          paint();
        });
        closeWrap.append(close);
        bar.append(reset, title, closeWrap);
        const body = el("div", "flt-sheet-body");
        [
          ["Type", ["All", "Money in", "Money out"], "type", false],
          ["Status", STATUSES, "status", true],
          ["Method", METHODS, "method", true],
        ].forEach(([label, options, key, multiple]) => {
          const group = el("div", "flt-group");
          group.append(el("span", "flt-group-label", label));
          const row = el("div", "flt-chips");
          options.forEach((option) => {
            const on = multiple ? draft[key].includes(option) : draft[key] === option;
            row.append(chipButton(option, on, "", `draft:${key}:${option}`, () => {
              draft = { ...draft, [key]: multiple ? toggle(draft[key], option) : option };
              paint();
            }));
          });
          group.append(row);
          body.append(group);
        });
        const foot = el("div", "flt-sheet-foot");
        const apply = actionButton(draftList.length ? `Show ${draftList.length} result${draftList.length === 1 ? "" : "s"}` : "No results · change filters", "primary", { block: true, disabled: !draftList.length });
        apply.addEventListener("click", () => {
          if (!draftList.length) return;
          applied.type = draft.type;
          applied.status = [...draft.status];
          applied.method = [...draft.method];
          sheet = false;
          pendingReturn = "filters";
          paint();
        });
        foot.append(apply);
        dialog.append(bar, body, foot);
        dialog.addEventListener("keydown", (event) => trap(event, dialog));
        phone.append(scrim, dialog);
      }
      const target = pendingReturn || activeKey;
      pendingReturn = "";
      if (target) {
        const node = root.querySelector(`[data-key="${CSS.escape(target)}"]`);
        if (node) {
          node.focus();
          if (target === "search" && caret != null && node.setSelectionRange) node.setSelectionRange(caret, caret);
        }
      }
    }

    document.addEventListener("click", () => {
      if (!visible(root) || !sheet) return;
      sheet = false;
      pendingReturn = "filters";
      paint();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !visible(root) || !sheet) return;
      event.preventDefault();
      event.stopPropagation();
      sheet = false;
      pendingReturn = "filters";
      paint();
    });
    paint();
    return root;
  }

  window.createFilterPill = createFilterPill;
  window.createBranchMenu = createBranchMenu;
  window.createAmountMenu = createAmountMenu;
  window.createQuickFilters = createQuickFilters;
  window.createTransactionFilters = createTransactionFilters;
  window.createSalesFilters = createSalesFilters;
  window.createCardFilters = createCardFilters;
  window.createActivityFilters = createActivityFilters;
})();
