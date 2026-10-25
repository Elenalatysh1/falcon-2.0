/**
 * HALA DNA Data table: Table filters, Table header cell, Table cell, Responsive row,
 * Bulk bar, pagination and the Loading, Empty and Error states.
 * Load badges.js, button.js, selection.js and lists.js before this script.
 *
 * createDataTable({ lang, state, density, pageSize, filters, live })
 *   The preset. Rows restack below 800 (Tablet) and drop the outline below 600 (Mobile).
 * createColumnTable({ columns, rows, footer, density, label })
 *   A custom table built from Table columns. Column types: avatar, two-line, text, date,
 *   status, amount, checkbox, actions, slot. priority "desktop" hides the column below 800.
 * createHeaderCell({ label, sort, state, align }) and createTableCell({ type, row, state })
 *   Single cells for specimens.
 */
(function () {
  const BASE = [
    { id: "albaik", ago: 0, name: "Al Baik · Olaya", ar: "البيك · العليا", sub: "Olaya branch", subAr: "فرع العليا", time: "12:41", method: "mada", last: "3301", status: "Pending", amount: -64, tone: 4 },
    { id: "almarai", ago: 0, name: "Almarai Supply Co.", ar: "شركة المراعي", sub: "Transfer in", subAr: "تحويل وارد", time: "10:05", method: "bank", status: "Settled", amount: 12500, tone: 2 },
    { id: "stc", ago: 0, name: "STC Pay", ar: "STC Pay", sub: "Wallet top-up", subAr: "شحن المحفظة", time: "09:12", method: "visa", last: "1951", status: "Settled", amount: -300, tone: 3 },
    { id: "jarir", ago: 1, name: "Jarir Bookstore", ar: "مكتبة جرير", sub: "Olaya", subAr: "العليا", time: "18:30", method: "visa", last: "1951", status: "Declined", amount: -1149, tone: 1 },
    { id: "careem", ago: 1, name: "Careem", ar: "كريم", sub: "Ride", subAr: "رحلة", time: "08:44", method: "mada", last: "3301", status: "Settled", amount: -42.5, tone: 5 },
    { id: "danube", ago: 1, name: "Danube · Hittin", ar: "الدانوب · حطين", sub: "Groceries", subAr: "مشتريات", time: "08:02", method: "mada", last: "3301", status: "Refunded", amount: 187.25, tone: 4 },
    { id: "nahdi", ago: 2, name: "Nahdi Pharmacy", ar: "صيدلية النهدي", sub: "Malqa", subAr: "الملقا", time: "21:15", method: "mada", last: "3301", status: "Settled", amount: -96.4, tone: 2 },
    { id: "sec", ago: 2, name: "Saudi Electricity", ar: "السعودية للكهرباء", sub: "Bill · SADAD", subAr: "فاتورة · سداد", time: "11:00", method: "sadad", status: "Scheduled", amount: -1280, tone: 3 },
    { id: "payroll", ago: 3, name: "Payroll · October", ar: "رواتب · أكتوبر", sub: "42 employees", subAr: "42 موظفاً", time: "09:00", method: "bank", status: "Processing", amount: -186400, tone: 1 },
    { id: "amazon", ago: 4, name: "Amazon.sa", ar: "أمازون", sub: "Online", subAr: "عبر الإنترنت", time: "16:22", method: "visa", last: "1951", status: "Settled", amount: -349, tone: 5 },
  ];
  const TOTAL = 248;
  const TODAY = Date.UTC(2026, 9, 19);
  const DAY = 86400000;
  function when(row, cycle) {
    const [hours, minutes] = row.time.split(":").map(Number);
    return TODAY - (row.ago + cycle * 5) * DAY + (hours * 60 + minutes) * 60000;
  }
  BASE.forEach((row) => { row.when = when(row, 0); });
  const ALL = Array.from({ length: TOTAL }, (_, index) => {
    const base = BASE[index % BASE.length];
    return { ...base, key: `${base.id}-${index}`, when: when(base, Math.floor(index / BASE.length)) };
  });
  const TONE = { Settled: "settled", Pending: "pending", Processing: "processing", Scheduled: "scheduled", Declined: "declined", Refunded: "refunded" };

  const COPY = {
    en: {
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      merchant: "Merchant", date: "Date", method: "Method", status: "Status", amount: "Amount", actions: "Row actions",
      search: "Search merchant or amount", last30: "Last 30 days", more: "More filters",
      keyDate: "Date", keyStatus: "Status", keyMethod: "Method", clearAll: "Clear all",
      count: (shown, total) => `${shown} of ${total} transactions`,
      selected: (count) => `${count} selected`, export: "Export", approve: "Approve", remove: "Delete", clear: "Clear",
      range: (from, to, total) => [`${from}–${to}`, ` of ${total}`], perPage: "Rows per page", prev: "Previous page", next: "Next page", page: (page) => `Page ${page}`,
      selectAll: "Select all on this page", selectRow: (name) => `Select ${name}`, rowMenu: (name) => `More actions for ${name}`,
      emptyTitle: "No transactions match", emptyBody: "Try fewer filters or a different search.", emptyAction: "Clear filters",
      errorTitle: "Couldn’t load transactions", errorBody: "Check your connection and try again.", errorAction: "Try again",
      loading: "Loading transactions",
      methods: { mada: "mada", visa: "Visa", bank: "Bank transfer", sadad: "SADAD" },
      statuses: { Settled: "Settled", Pending: "Pending", Processing: "Processing", Scheduled: "Scheduled", Declined: "Declined", Refunded: "Refunded" },
    },
    ar: {
      months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
      merchant: "التاجر", date: "التاريخ", method: "طريقة الدفع", status: "الحالة", amount: "المبلغ", actions: "إجراءات الصف",
      search: "ابحث بالتاجر أو المبلغ", last30: "آخر 30 يوماً", more: "فلاتر أخرى",
      keyDate: "التاريخ", keyStatus: "الحالة", keyMethod: "الطريقة", clearAll: "مسح الكل",
      count: (shown, total) => `${shown} من ${total} عملية`,
      selected: (count) => `${count} محددة`, export: "تصدير", approve: "موافقة", remove: "حذف", clear: "إلغاء التحديد",
      range: (from, to, total) => [`${from}–${to}`, ` من ${total}`], perPage: "لكل صفحة", prev: "الصفحة السابقة", next: "الصفحة التالية", page: (page) => `الصفحة ${page}`,
      selectAll: "تحديد كل الصفحة", selectRow: (name) => `تحديد ${name}`, rowMenu: (name) => `إجراءات ${name}`,
      emptyTitle: "لا توجد عمليات مطابقة", emptyBody: "جرّب فلاتر أقل أو بحثاً مختلفاً.", emptyAction: "مسح الفلاتر",
      errorTitle: "تعذّر تحميل العمليات", errorBody: "تحقق من الاتصال وحاول مرة أخرى.", errorAction: "حاول مجدداً",
      loading: "جارٍ تحميل العمليات",
      methods: { mada: "مدى", visa: "فيزا", bank: "تحويل بنكي", sadad: "سداد" },
      statuses: { Settled: "مُسدَّد", Pending: "معلّق", Processing: "قيد المعالجة", Scheduled: "مجدولة", Declined: "مرفوضة", Refunded: "مُسترد" },
    },
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(name, size) {
    const set = window.halaIcons;
    if (!set) return null;
    const kebab = (set.catalog && set.catalog[name]) || name;
    const pascal = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    const node = set.icons[pascal];
    if (!node) return null;
    const svg = set.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    svg.dataset.size = size || "default";
    if (set.mirror && set.mirror.has(kebab)) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function initials(name) {
    const words = name.split(/[\s·]+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
  }

  function dateText(row, copy) {
    const date = new Date(row.when);
    return `${date.getUTCDate()} ${copy.months[date.getUTCMonth()]}${copy === COPY.ar ? "" : ","} ${row.time}`;
  }

  function methodText(row, copy) {
    const name = copy.methods[row.method];
    return row.last ? `${name} •• ${row.last}` : name;
  }

  function amount(row, size) {
    const declined = row.status === "Declined";
    return createAmount(declined ? Math.abs(row.amount) : row.amount, {
      signed: !declined,
      kind: declined ? "muted" : row.amount > 0 ? "credit" : "plain",
      size: size || "s",
    });
  }

  function status(row, copy) {
    return createBadge({ label: copy.statuses[row.status], tone: TONE[row.status], variant: "subtle", size: "sm", icon: true });
  }

  function avatar(row) {
    const node = el("span", "list-avatar", initials(row.name));
    node.dataset.tone = String(row.tone);
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function checkbox(options) {
    const node = createChoice({ kind: "checkbox", bare: true, ...options });
    node.tabIndex = 0;
    return node;
  }

  function iconButton(name, label, onClick) {
    const button = el("button", "dt-icon-btn");
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.title = label;
    const glyph = icon(name, "default");
    if (glyph) button.append(glyph);
    if (onClick) button.addEventListener("click", onClick);
    return button;
  }

  function cue(node) {
    node.dataset.motion = "enter";
    node.addEventListener("animationend", () => delete node.dataset.motion, { once: true });
  }

  function createHeaderCell(options = {}) {
    const { label = "", sort = "none", state, align = "start", onSort } = options;
    const sortable = sort !== "off";
    const cell = el(sortable ? "button" : "span", "dt-th");
    cell.dataset.align = align;
    cell.dataset.sort = sort;
    if (state) cell.dataset.state = state;
    if (sortable) {
      cell.type = "button";
      if (state) cell.tabIndex = -1;
      if (onSort) cell.addEventListener("click", onSort);
    }
    cell.append(el("span", "", label));
    if (sort === "asc" || sort === "desc") {
      const glyph = icon(sort === "asc" ? "chevron-up" : "chevron-down", "inline");
      if (glyph) cell.append(glyph);
    }
    return cell;
  }

  function identity(row, copy, lang, withMeta) {
    const wrap = el("span", "dt-identity");
    const text = el("span", "dt-identity-copy");
    text.append(el("span", "dt-name", lang === "ar" ? row.ar : row.name), el("span", "dt-sub", lang === "ar" ? row.subAr : row.sub));
    if (withMeta) {
      const meta = el("span", "dt-meta");
      meta.append(el("span", "dt-mono", dateText(row, copy)), el("span", "dt-dot", "·"), el("span", "dt-mono", methodText(row, copy)));
      text.append(meta);
    }
    wrap.append(avatar(row), text);
    return wrap;
  }

  function createTableCell(options = {}) {
    const { type = "text", row = BASE[0], state, lang = "en", node } = options;
    const copy = COPY[lang];
    const cell = el("span", "dt-td");
    cell.dataset.type = type;
    if (state) cell.dataset.state = state;
    if (type === "avatar") cell.append(identity(row, copy, lang));
    else if (type === "two-line") {
      const text = el("span", "dt-identity-copy");
      text.append(el("span", "dt-name", methodText(row, copy)), el("span", "dt-sub", lang === "ar" ? row.subAr : row.sub));
      cell.append(text);
    } else if (type === "text") cell.append(el("span", "dt-text", methodText(row, copy)));
    else if (type === "date") cell.append(el("span", "dt-mono dt-date", dateText(row, copy)));
    else if (type === "status") cell.append(status(row, copy));
    else if (type === "amount") cell.append(amount(row));
    else if (type === "checkbox") cell.append(createChoice({ kind: "checkbox", visual: true, checked: state === "selected" }));
    else if (type === "actions") {
      const glyph = icon("more", "default");
      const mark = el("span", "dt-icon-btn");
      if (glyph) mark.append(glyph);
      cell.append(mark);
    } else if (type === "slot") cell.append(node || el("span", "dt-slot", "Swap content"));
    return cell;
  }

  function pager(page, pages, copy, onPage) {
    const nav = el("nav", "dt-pager");
    nav.setAttribute("aria-label", copy === COPY.ar ? "الصفحات" : "Pagination");
    const prev = iconButton("chevron-left", copy.prev, () => onPage(page - 1));
    prev.classList.add("dt-page-step");
    prev.disabled = page <= 1;
    prev.dataset.key = "page-prev";
    const next = iconButton("chevron-right", copy.next, () => onPage(page + 1));
    next.classList.add("dt-page-step");
    next.disabled = page >= pages;
    next.dataset.key = "page-next";
    const numbers = el("span", "dt-pages");
    const list = new Set([1, pages, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pages));
    let last = 0;
    [...list].sort((a, b) => a - b).forEach((value) => {
      if (value - last > 1) numbers.append(el("span", "dt-gap", "…"));
      const button = el("button", "dt-page", String(value));
      button.type = "button";
      button.dataset.key = `page-${value}`;
      button.setAttribute("aria-label", copy.page(value));
      if (value === page) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => onPage(value));
      numbers.append(button);
      last = value;
    });
    const compact = el("span", "dt-pages-compact", `${page} / ${pages}`);
    compact.setAttribute("aria-hidden", "true");
    nav.append(prev, numbers, compact, next);
    return nav;
  }

  function sizes(current, copy, onSize) {
    const wrap = el("div", "dt-sizes");
    wrap.append(el("span", "dt-sizes-label", copy.perPage));
    const group = el("div", "dt-segment");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", copy.perPage);
    [10, 25, 50].forEach((value) => {
      const button = el("button", "dt-seg", String(value));
      button.type = "button";
      button.dataset.key = `size-${value}`;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", value === current ? "true" : "false");
      button.tabIndex = value === current ? 0 : -1;
      button.addEventListener("click", () => onSize(value));
      group.append(button);
    });
    wrap.append(group);
    return wrap;
  }

  function filterPill(label, options = {}) {
    const pill = el("button", "flt-pill");
    pill.type = "button";
    pill.dataset.key = options.key;
    pill.dataset.state = options.applied ? "applied" : "default";
    pill.setAttribute("aria-pressed", options.applied ? "true" : "false");
    pill.append(el("span", "", label));
    if (options.count) pill.append(el("span", "flt-count", String(options.count)));
    const glyph = icon(options.applied && !options.count ? "x" : "chevron-down", "inline");
    if (glyph) {
      glyph.classList.add(options.applied && !options.count ? "flt-pill-x" : "flt-chevron");
      pill.append(glyph);
    }
    pill.addEventListener("click", options.onClick);
    return pill;
  }

  function createDataTable(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const live = options.live !== false;
    const state = {
      view: options.state || "default",
      query: "",
      date: true,
      status: !!options.applied,
      method: !!options.applied,
      sort: "desc",
      page: options.page || 1,
      size: options.pageSize || 10,
      selected: new Set(options.selected || []),
      focus: "",
    };
    const root = el("div", "dt dt-preset");
    root.dir = lang === "ar" ? "rtl" : "ltr";
    if (lang === "ar") root.lang = "ar";
    root.dataset.density = options.density || "default";
    const top = el("div", "dt-top");
    const card = el("div", "dt-card");
    card.setAttribute("role", "region");
    card.setAttribute("aria-label", lang === "ar" ? "العمليات" : "Transactions");
    root.append(top, card);
    let previousSelection = state.selected.size;

    function list() {
      const query = state.query.trim().toLowerCase();
      const rows = ALL.filter((row) => {
        if (state.date && row.when < TODAY - 30 * DAY) return false;
        if (state.status && row.status !== "Settled") return false;
        if (state.method && row.method !== "mada") return false;
        if (!query) return true;
        return [row.name, row.ar, row.sub, String(Math.abs(row.amount))].some((value) => value.toLowerCase().includes(query));
      });
      return rows.sort((a, b) => (state.sort === "asc" ? a.when - b.when : b.when - a.when));
    }

    function clearAll() {
      state.date = false;
      state.status = false;
      state.method = false;
      state.query = "";
      state.page = 1;
      state.focus = "search";
      paint();
    }

    function paintTop(rows) {
      top.replaceChildren();
      if (state.selected.size && state.view !== "loading") {
        const bar = el("div", "dt-bulk");
        bar.setAttribute("role", "toolbar");
        bar.setAttribute("aria-label", copy.selected(state.selected.size));
        const count = el("strong", "dt-bulk-count", copy.selected(state.selected.size));
        count.setAttribute("aria-live", "polite");
        const actions = el("div", "dt-bulk-actions");
        actions.append(
          createButton({ label: copy.export, variant: "secondary", size: "sm", icon: "download" }),
          createButton({ label: copy.approve, variant: "secondary", size: "sm" }),
          createButton({ label: copy.remove, variant: "destructive", size: "sm", icon: "delete" }),
        );
        const clear = createButton({ label: copy.clear, variant: "ghost", size: "sm" });
        clear.dataset.key = "bulk-clear";
        clear.addEventListener("click", () => { state.selected.clear(); state.focus = "select-all"; paint(); });
        bar.append(count, actions, clear);
        if (!previousSelection) cue(bar);
        top.append(bar);
        return;
      }
      if (options.filters === false) return;
      const toolbar = el("div", "dt-toolbar");
      const search = el("label", "flt-search dt-search");
      const glyph = icon("search", "inline");
      if (glyph) search.append(glyph);
      const input = el("input");
      input.type = "search";
      input.placeholder = copy.search;
      input.setAttribute("aria-label", copy.search);
      input.value = state.query;
      input.dataset.key = "search";
      input.addEventListener("input", () => { state.query = input.value; state.page = 1; state.focus = "search"; paint(); });
      search.append(input);
      const pills = el("div", "dt-pills");
      pills.append(
        filterPill(copy.last30, { key: "pill-date", applied: state.date, onClick: () => { state.date = !state.date; state.page = 1; state.focus = "pill-date"; paint(); } }),
        filterPill(state.status ? `${copy.keyStatus}: ${copy.statuses.Settled}` : copy.keyStatus, { key: "pill-status", applied: state.status, onClick: () => { state.status = !state.status; state.page = 1; state.focus = "pill-status"; paint(); } }),
        filterPill(copy.keyMethod, { key: "pill-method", applied: state.method, count: state.method ? 1 : 0, onClick: () => { state.method = !state.method; state.page = 1; state.focus = "pill-method"; paint(); } }),
      );
      toolbar.append(search, pills);
      const tags = el("div", "dt-tags");
      const applied = [];
      if (state.date) applied.push([copy.keyDate, copy.last30, () => { state.date = false; }]);
      if (state.status) applied.push([copy.keyStatus, copy.statuses.Settled, () => { state.status = false; }]);
      if (state.method) applied.push([copy.keyMethod, copy.methods.mada, () => { state.method = false; }]);
      applied.forEach(([key, value, drop]) => {
        tags.append(createBadge({ variant: "tag", key, label: value, dismissible: true, onDismiss: () => { drop(); state.page = 1; state.focus = "search"; paint(); } }));
      });
      if (applied.length) {
        const clear = el("button", "flt-text", copy.clearAll);
        clear.type = "button";
        clear.addEventListener("click", clearAll);
        tags.append(clear);
      }
      const count = el("span", "dt-count", copy.count(rows.length, TOTAL));
      count.setAttribute("aria-live", "polite");
      tags.append(count);
      top.append(toolbar, tags);
    }

    function header(pageRows) {
      const head = el("div", "dt-row dt-head");
      head.setAttribute("role", "row");
      const on = pageRows.filter((row) => state.selected.has(row.key)).length;
      const all = pageRows.length > 0 && on === pageRows.length;
      const selectCell = el("span", "dt-cell dt-cell-check");
      selectCell.setAttribute("role", "columnheader");
      const box = checkbox({
        checked: all,
        mixed: on > 0 && !all,
        label: copy.selectAll,
        onChange: () => {
          pageRows.forEach((row) => (all ? state.selected.delete(row.key) : state.selected.add(row.key)));
          state.focus = "select-all";
          paint();
        },
      });
      box.dataset.key = "select-all";
      selectCell.append(box);
      head.append(selectCell);
      [["merchant", "off", "start"], ["date", state.sort, "start"], ["method", "off", "start"], ["status", "off", "start"], ["amount", "off", "end"]].forEach(([key, sort, align]) => {
        const cell = el("span", `dt-cell dt-cell-${key}`);
        cell.setAttribute("role", "columnheader");
        if (key === "date") cell.setAttribute("aria-sort", state.sort === "asc" ? "ascending" : "descending");
        const th = createHeaderCell({ label: copy[key], sort, align, onSort: () => { state.sort = state.sort === "asc" ? "desc" : "asc"; state.focus = "sort-date"; paint(); } });
        if (key === "date") th.dataset.key = "sort-date";
        cell.append(th);
        head.append(cell);
      });
      const menu = el("span", "dt-cell dt-cell-menu");
      menu.setAttribute("role", "columnheader");
      menu.setAttribute("aria-label", copy.actions);
      head.append(menu);
      return head;
    }

    function bodyRow(row, index) {
      const name = lang === "ar" ? row.ar : row.name;
      const line = el("div", "dt-row");
      line.setAttribute("role", "row");
      line.dataset.selected = state.selected.has(row.key) ? "true" : "false";
      line.style.setProperty("--dt-order", String(Math.min(index, 4)));
      const check = el("span", "dt-cell dt-cell-check");
      check.setAttribute("role", "cell");
      const box = checkbox({
        checked: state.selected.has(row.key),
        label: copy.selectRow(name),
        onChange: () => {
          if (state.selected.has(row.key)) state.selected.delete(row.key);
          else state.selected.add(row.key);
          state.focus = `row-${row.key}`;
          paint();
        },
      });
      box.dataset.key = `row-${row.key}`;
      check.append(box);
      const who = el("span", "dt-cell dt-cell-merchant");
      who.setAttribute("role", "cell");
      who.append(identity(row, copy, lang, true));
      const date = el("span", "dt-cell dt-cell-date dt-mono", dateText(row, copy));
      const method = el("span", "dt-cell dt-cell-method dt-mono", methodText(row, copy));
      const badge = el("span", "dt-cell dt-cell-status");
      badge.append(status(row, copy));
      const money = el("span", "dt-cell dt-cell-amount");
      money.append(amount(row), status(row, copy));
      const menu = el("span", "dt-cell dt-cell-menu");
      menu.append(iconButton("more", copy.rowMenu(name)));
      [date, method, badge, money, menu].forEach((cell) => cell.setAttribute("role", "cell"));
      line.append(check, who, date, method, badge, money, menu);
      return line;
    }

    function skeleton() {
      const body = el("div", "dt-body");
      body.setAttribute("role", "status");
      body.setAttribute("aria-label", copy.loading);
      for (let index = 0; index < 5; index += 1) {
        const line = el("div", "dt-row dt-row-bones");
        line.setAttribute("aria-hidden", "true");
        ["check", "merchant", "date", "method", "status", "amount", "menu"].forEach((key) => {
          const cell = el("span", `dt-cell dt-cell-${key}`);
          if (key !== "menu") cell.append(el("span", `list-bone dt-bone dt-bone-${key}`));
          line.append(cell);
        });
        body.append(line);
      }
      return body;
    }

    function message(kind) {
      const box = el("div", "dt-message");
      box.setAttribute("role", kind === "error" ? "alert" : "status");
      const tile = el("span", "dt-message-tile");
      const glyph = icon(kind === "error" ? "receipt" : "search", "feature");
      if (glyph) tile.append(glyph);
      box.append(tile, el("strong", "dt-message-title", kind === "error" ? copy.errorTitle : copy.emptyTitle), el("p", "dt-message-body", kind === "error" ? copy.errorBody : copy.emptyBody));
      const action = createButton({ label: kind === "error" ? copy.errorAction : copy.emptyAction, variant: kind === "error" ? "primary" : "secondary", size: "md" });
      action.dataset.key = "message-action";
      action.addEventListener("click", () => {
        if (kind === "error") {
          state.view = "loading";
          paint();
          setTimeout(() => { state.view = "default"; paint(); }, 900);
        } else clearAll();
      });
      if (live) box.append(action);
      return box;
    }

    function footer(rows, pages) {
      const foot = el("div", "dt-foot");
      const from = rows.length ? (state.page - 1) * state.size + 1 : 0;
      const to = Math.min(state.page * state.size, rows.length);
      const [range, of] = copy.range(from, to, rows.length);
      const count = el("span", "dt-range");
      count.append(el("strong", "", range), el("span", "dt-range-of", of));
      foot.append(count, pager(state.page, pages, copy, (page) => { state.page = page; state.focus = `page-${page}`; paint(true); }), sizes(state.size, copy, (size) => { state.size = size; state.page = 1; state.focus = `size-${size}`; paint(true); }));
      return foot;
    }

    function paint(motion) {
      const rows = list();
      const pages = Math.max(1, Math.ceil(rows.length / state.size));
      state.page = Math.min(state.page, pages);
      const pageRows = rows.slice((state.page - 1) * state.size, state.page * state.size);
      const view = state.view === "default" && !rows.length ? "empty" : state.view;
      root.dataset.state = view;
      paintTop(rows);
      previousSelection = state.selected.size;
      card.replaceChildren();
      const grid = el("div", "dt-grid");
      grid.setAttribute("role", "table");
      grid.setAttribute("aria-label", lang === "ar" ? "العمليات" : "Transactions");
      grid.append(header(pageRows));
      if (view === "loading") grid.append(skeleton());
      else if (view === "error" || view === "empty") grid.append(message(view));
      else {
        const body = el("div", "dt-body");
        body.setAttribute("role", "rowgroup");
        pageRows.forEach((row, index) => body.append(bodyRow(row, index)));
        if (motion) cue(body);
        grid.append(body);
      }
      card.append(grid);
      if (view !== "error" && view !== "empty") card.append(footer(rows, pages));
      if (state.focus) {
        const target = root.querySelector(`[data-key="${CSS.escape(state.focus)}"]`);
        if (target) {
          target.focus();
          if (target.tagName === "INPUT") target.setSelectionRange(target.value.length, target.value.length);
        }
        state.focus = "";
      }
    }

    root.setState = (view) => { state.view = view; paint(); };
    paint();
    return root;
  }

  const WIDTH = {
    avatar: "minmax(var(--table-identity-min), 2fr)",
    "two-line": "minmax(0, 1.2fr)",
    text: "minmax(max-content, 1fr)",
    date: "minmax(max-content, 1fr)",
    status: "minmax(0, 1fr)",
    amount: "var(--table-amount-col-width)",
    checkbox: "var(--target-web)",
    actions: "var(--target-web)",
    slot: "max-content",
  };

  function createColumnTable(options = {}) {
    const { columns = [], rows = BASE, footer, label = "Table", lang = "en" } = options;
    const copy = COPY[lang];
    const root = el("div", "dt dt-columns");
    root.dataset.density = options.density || "default";
    const card = el("div", "dt-card");
    const grid = el("div", "dt-grid");
    grid.setAttribute("role", "table");
    grid.setAttribute("aria-label", label);
    const track = (list) => list.map((column) => WIDTH[column.type] || WIDTH.text).join(" ");
    root.style.setProperty("--dt-cols-full", track(columns));
    root.style.setProperty("--dt-cols-tablet", track(columns.filter((column) => column.priority !== "desktop")));
    const selected = new Set(options.selected || []);

    function rowNode(kind) {
      const line = el("div", `dt-row${kind ? ` dt-${kind}` : ""}`);
      line.setAttribute("role", "row");
      return line;
    }

    const head = rowNode("head");
    columns.forEach((column) => {
      const cell = el("span", "dt-cell");
      cell.dataset.type = column.type;
      if (column.priority) cell.dataset.priority = column.priority;
      cell.setAttribute("role", "columnheader");
      if (column.type === "checkbox") cell.append(createChoice({ kind: "checkbox", visual: true }));
      else if (column.label) cell.append(createHeaderCell({ label: column.label, sort: column.sort || "off", align: column.type === "amount" ? "end" : "start" }));
      else cell.setAttribute("aria-label", copy.actions);
      head.append(cell);
    });
    grid.append(head);
    const body = el("div", "dt-body");
    body.setAttribute("role", "rowgroup");
    rows.forEach((row) => {
      const line = rowNode();
      line.dataset.selected = selected.has(row.id) ? "true" : "false";
      columns.forEach((column) => {
        const cell = el("span", "dt-cell");
        cell.dataset.type = column.type;
        if (column.priority) cell.dataset.priority = column.priority;
        cell.setAttribute("role", "cell");
        if (column.type === "avatar") cell.append(identity(row, copy, lang));
        else if (column.type === "date") cell.append(el("span", "dt-mono", dateText(row, copy)));
        else if (column.type === "text") cell.append(el("span", "dt-text", methodText(row, copy)));
        else if (column.type === "status") cell.append(status(row, copy));
        else if (column.type === "amount") cell.append(amount(row));
        else if (column.type === "checkbox") {
          const draw = () => {
            const on = selected.has(row.id);
            line.dataset.selected = on ? "true" : "false";
            const box = checkbox({ checked: on, label: copy.selectRow(row.name), onChange: () => { if (on) selected.delete(row.id); else selected.add(row.id); draw(); cell.firstChild.focus(); } });
            cell.replaceChildren(box);
          };
          draw();
        }
        else if (column.type === "actions") cell.append(iconButton("more", copy.rowMenu(row.name)));
        else if (column.type === "slot" && column.render) cell.append(column.render(row));
        line.append(cell);
      });
      body.append(line);
    });
    grid.append(body);
    if (footer) {
      const foot = rowNode("total");
      columns.forEach((column, index) => {
        const cell = el("span", "dt-cell");
        cell.dataset.type = column.type;
        if (column.priority) cell.dataset.priority = column.priority;
        if (index === 1) cell.append(el("span", "dt-total-label", footer.label));
        if (column.type === "amount") cell.append(createAmount(footer.total, { size: "s" }));
        foot.append(cell);
      });
      grid.append(foot);
    }
    card.append(grid);
    root.append(card);
    return root;
  }

  window.createDataTable = createDataTable;
  window.createColumnTable = createColumnTable;
  window.createHeaderCell = createHeaderCell;
  window.createTableCell = createTableCell;
  window.DATA_TABLE_ROWS = BASE;
})();
