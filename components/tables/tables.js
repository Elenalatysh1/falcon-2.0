/**
 * Tables. Load lucide UMD, button.js, badges.js, and selection.js, then this script.
 *
 * createCellTypes()
 * createSpendTable()
 * createTeamTable()
 * createInvoiceTable()
 * createTableStates()
 * createReviewList()
 * createTerminalCards()
 * createStatementTable()
 *
 * Web tables sort, select, expand, and edit in place. On mobile, rows become
 * list items or cards. A statement is the one table that still scrolls sideways.
 */
(function () {
  const SPEND = [
    ["Jarir Bookstore", "Office supplies", "info", "Marketing", "brand", "4417", "Omar Bakr", "2026-10-14", "11:08", true, 1249, "Pending"],
    ["Google Ads", "Advertising", "warning", "Marketing", "brand", "4417", "Omar Bakr", "2026-10-12", "09:00", true, 2000, "Pending"],
    ["Careem", "Transport", "success", "Travel", "ink", "7731", "Omar Bakr", "2026-10-13", "22:10", false, 38.5, "Missing receipt"],
    ["Saudia Airlines", "Travel", "success", "Travel", "ink", "7731", "Sara Al-Otaibi", "2026-10-10", "14:22", true, 4380, "Approved"],
    ["ADNOC Fuel", "Fuel", "neutral", "Fuel", "fuel", "9902", "Fahad Al-Qahtani", "2026-10-11", "07:45", true, 210, "Pending"],
    ["Amazon Web Services", "Software", "scheduled", "Operations", "metal", "2086", "Sara Al-Otaibi", "2026-10-09", "00:00", false, 1875.4, "Declined"],
  ].map(([merchant, category, tone, card, art, last, holder, date, time, receipt, amount, status], index) => ({
    id: index + 1, merchant, category, tone, card, art, last, holder, date, time, receipt, amount, status,
  }));

  const COLUMNS = [
    ["merchant", "Merchant", "merchant", "start", true],
    ["card", "Card", "", "start", false],
    ["holder", "Holder", "holder", "start", false],
    ["date", "Date", "date", "start", false],
    ["receipt", "Receipt", "", "center", false],
    ["amount", "Amount", "amount", "end", true],
    ["status", "Status", "status", "start", true],
    ["actions", "", "", "end", true],
  ].map(([id, label, sort, align, lock]) => ({ id, label, sort, align, lock }));

  const WIDTH = {
    merchant: "minmax(calc(var(--space-14) * 3 + var(--space-8)), 1.6fr)",
    card: "calc(var(--space-14) * 2 + var(--space-2))",
    holder: "minmax(calc(var(--space-14) * 2 + var(--space-4)), 1fr)",
    date: "calc(var(--space-14) + var(--space-12))",
    receipt: "calc(var(--space-14) + var(--pad-input-x))",
    amount: "calc(var(--space-14) * 2 + var(--space-2))",
    status: "calc(var(--space-14) * 2 + var(--space-8) + var(--space-1))",
    actions: "calc(var(--space-14) * 2 + var(--space-7))",
  };

  const USERS = [
    ["Abdulaziz Ali", "abdulaziz@khamis.sa", "Owner", "Now", "info", true, true, false],
    ["Omar Bakr", "omar@khamis.sa", "Approver", "2 h ago", "warning", true, true, false],
    ["Sara Al-Otaibi", "sara@khamis.sa", "Viewer", "Yesterday", "scheduled", false, false, false],
    ["Fahad Al-Qahtani", "fahad@khamis.sa", "Viewer", "—", "success", false, false, true],
  ].map(([name, email, role, seen, tone, online, access, invited]) => ({ name, email, role, seen, tone, online, access, invited }));

  const ROLES = [
    ["Admin", "Everything, incl. users"],
    ["Approver", "Approve payments and cards"],
    ["Viewer", "Read only"],
  ];

  const TONE = { Pending: "pending", "Missing receipt": "error", Approved: "settled", Declined: "declined" };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  function money(amount, signed) {
    const body = Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (!signed) return body;
    return `${amount > 0 ? "+ " : "− "}${body}`;
  }

  function shortDate(iso) {
    const parts = iso.split("-").map(Number);
    return `${parts[2]} ${MONTHS[parts[1] - 1]}`;
  }

  function initials(name) {
    return name.split(" ").map((word) => word[0] || "").join("").slice(0, 2).toUpperCase();
  }

  function liveBadge(label) {
    return el("span", "tbl-live", label || "Live");
  }

  function choice(options) {
    const node = window.createChoice ? createChoice({ bare: true, ...options }) : el("button", "tbl-check");
    if (!options.visual && node.tabIndex === -1) node.tabIndex = 0;
    return node;
  }

  function badge(label, tone, variant) {
    if (!window.createBadge) return el("span", "", label);
    return createBadge({ label, tone, variant: variant || "subtle", size: "sm" });
  }

  function action(label, variant, extra) {
    const button = window.createButton
      ? createButton({ label, variant, size: "xs", ...(extra || {}) })
      : el("button", "", label);
    button.type = "button";
    return button;
  }

  function restore(root, key) {
    if (!key) return;
    const node = root.querySelector(`[data-key="${CSS.escape(key)}"]`);
    if (node) node.focus();
  }

  function batch(render) {
    let token = 0;
    return function paint() {
      const current = ++token;
      queueMicrotask(() => {
        if (current === token) render();
      });
    };
  }

  function watch(root, open, close, keep) {
    root.addEventListener("click", (event) => {
      if (!open() || (keep && event.target.closest(keep))) return;
      close(false);
    }, true);
    document.addEventListener("click", (event) => {
      if (!visible(root) || !open() || (keep && event.target.closest(keep))) return;
      close(true);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !visible(root) || !open()) return;
      event.preventDefault();
      close(true);
    });
  }

  function menuKeys(menu) {
    menu.addEventListener("keydown", (event) => {
      const items = [...menu.querySelectorAll("button:not(:disabled)")];
      const index = items.indexOf(document.activeElement);
      if (index < 0) return;
      let next = -1;
      if (event.key === "ArrowDown") next = (index + 1) % items.length;
      else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = items.length - 1;
      else return;
      event.preventDefault();
      items[next].focus();
    });
  }

  function tick(on, lock) {
    const mark = el("span", "tbl-tick");
    mark.dataset.on = on ? "true" : "false";
    if (lock) mark.dataset.lock = "true";
    if (on) {
      const glyph = icon("check", "inline");
      if (glyph) mark.append(glyph);
    }
    return mark;
  }

  function createCellTypes() {
    const card = el("div", "tbl-catalog");
    const grid = el("div", "tbl-catalog-grid");
    const head = el("div", "tbl-catalog-row");
    ["Type", "Example", "Align", "Rules"].forEach((label) => head.append(el("span", "tbl-overline", label)));
    grid.append(head);

    const text = el("span", "tbl-clip", "Office supplies for Olaya branch");
    text.title = text.textContent;
    const title = el("span", "tbl-pair");
    title.append(el("strong", "tbl-name", "Jarir Bookstore"), el("span", "tbl-sub", "Retail · Riyadh"));
    const person = el("span", "tbl-person");
    person.append(el("span", "tbl-avatar", "OB"), el("span", "tbl-pair", ""));
    person.lastChild.append(el("strong", "tbl-name", "Omar Bakr"), el("span", "tbl-sub", "omar@khamis.sa"));
    person.querySelector(".tbl-avatar").dataset.tone = "info";
    const file = el("span", "tbl-person");
    file.append(el("span", "tbl-thumb"), el("span", "tbl-pair"));
    file.lastChild.append(el("strong", "tbl-name", "Receipt"), el("span", "tbl-sub", "IMG_2041.jpg"));
    const art = el("span", "tbl-person");
    art.append(el("span", "tbl-mini"), el("span", "tbl-mono", "•• 4417"));
    const amount = el("span", "tbl-amount", "+ 1,249.00");
    amount.dataset.sign = "in";
    const number = el("span", "tbl-amount", "42");
    const when = el("span", "tbl-pair");
    when.append(el("span", "tbl-name", "14 Oct 2026"), el("span", "tbl-time", "12:41"));
    const ref = el("span", "tbl-id", "TRF-88213");
    const copy = el("button", "tbl-copy");
    copy.type = "button";
    copy.setAttribute("aria-label", "Copy reference");
    const copyIcon = icon("copy", "inline");
    if (copyIcon) copy.append(copyIcon);
    copy.addEventListener("click", () => {
      const value = "TRF-88213";
      if (navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {});
      copy.setAttribute("aria-label", "Copied");
    });
    ref.append(copy);
    const progress = el("span", "tbl-progress");
    progress.append(el("span", "tbl-track", ""), el("strong", "", "82%"));
    progress.firstChild.append(el("span", "tbl-fill"));
    const trend = el("span", "tbl-trend");
    const spark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    spark.setAttribute("viewBox", "0 0 64 22");
    spark.classList.add("tbl-spark");
    spark.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M1 18 12 14 22 16 33 9 44 11 54 5 63 3");
    spark.append(path);
    trend.append(spark, el("strong", "", "↑ 12%"));
    const actions = el("span", "tbl-sample-row");
    actions.append(el("span", "tbl-sample", "Approve"), el("span", "tbl-sample-more"));
    const more = icon("ellipsis");
    if (more) actions.lastChild.append(more);

    const rows = [
      ["Text", text, "left", "One line, truncate with … and show full text on hover."],
      ["Title + subtitle", title, "left", "Main identifier column. 500 weight, caption below."],
      ["Avatar + name", person, "left", "Initials when no photo. 32 px, circle."],
      ["Image / logo", file, "left", "40 px thumbnail, radius 10. Click opens a preview."],
      ["Card art", art, "left", "Mini card 44 × 28 + last 4 in Mono."],
      ["Amount", amount, "right", "Mono, sign, 2 decimals. Green only for money in."],
      ["Number / %", number, "right", "Mono, thousands comma. Same decimals in a column."],
      ["Date / time", when, "left", "Relative for today (\"Today, 12:41\"). Time as caption."],
      ["ID / reference", ref, "left", "Mono, tertiary color. Copy icon on hover."],
      ["Status badge", badge("Pending", "pending", "dot"), "left", "Dot style in tables, tinted badge in cards."],
      ["Tags", null, "left", "Max 2 visible, then \"+N\"."],
      ["Progress", progress, "left", "Card limits, plan usage. Same color thresholds as Progress."],
      ["Trend", trend, "right", "Sparkline 64 × 22 + delta. No axes."],
      ["Checkbox", choice({ kind: "checkbox", checked: true, visual: true }), "center", "First column, 44 px wide. Header box selects page."],
      ["Toggle", choice({ kind: "switch", checked: true, visual: true }), "center", "Instant settings only (e.g. online payments on/off)."],
      ["Actions", actions, "right", "One visible button max, rest in ⋯ menu. Last column."],
    ];

    rows.forEach(([name, demo, align, rule]) => {
      const row = el("div", "tbl-catalog-row");
      const example = el("div", "tbl-example");
      example.style.justifyContent = align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";
      if (name === "Tags") {
        const tags = el("span", "tbl-tags");
        tags.append(badge("Marketing", "scheduled"), badge("+2", "neutral"));
        example.append(tags);
      } else if (demo) example.append(demo);
      row.append(el("strong", "", name), example, el("span", "tbl-align", align), el("span", "tbl-rule-copy", rule));
      grid.append(row);
    });
    card.append(grid);
    return card;
  }

  function createSpendTable() {
    const root = el("div", "tbl-stage");
    const state = {
      density: "default",
      columns: { card: true, holder: true, date: true, receipt: true },
      sort: ["date", -1],
      selected: {},
      status: {},
      open: null,
      colsOpen: false,
      message: "",
      focus: "",
    };
    const densities = [["compact", "Compact"], ["default", "Default"], ["relaxed", "Relaxed"]];

    function rows() {
      const list = SPEND.map((row) => ({ ...row, status: state.status[row.id] || row.status }));
      const [key, dir] = state.sort;
      list.sort((a, b) => {
        const left = a[key];
        const right = b[key];
        return (left > right ? 1 : left < right ? -1 : 0) * dir;
      });
      return list;
    }

    function visibleColumns() {
      return COLUMNS.filter((column) => column.lock || state.columns[column.id]);
    }

    function pending(row) {
      return row.status === "Pending" || row.status === "Missing receipt";
    }

    function render() {
      const list = rows();
      const columns = visibleColumns();
      const template = ["var(--target-web)", ...columns.map((column) => WIDTH[column.id])].join(" ");
      const selected = list.filter((row) => state.selected[row.id]);
      const focus = state.focus;
      state.focus = "";
      root.replaceChildren();

      const toolbar = el("div", "tbl-toolbar");
      if (!selected.length) {
        const title = el("div", "tbl-person");
        title.append(el("h3", "tbl-title", "Card spend"), el("span", "tbl-count", `${SPEND.length} transactions`));
        toolbar.append(title);
      } else {
        const bulk = el("div", "tbl-bulk");
        const sum = selected.reduce((total, row) => total + row.amount, 0);
        bulk.append(el("strong", "", `${selected.length} selected`), el("span", "tbl-bulk-sum", `SAR ${money(sum)}`));
        const approve = action("Approve", "primary");
        approve.dataset.key = "bulk-approve";
        approve.addEventListener("click", () => {
          const next = { ...state.status };
          let count = 0;
          list.forEach((row) => {
            if (state.selected[row.id] && pending(row)) {
              next[row.id] = "Approved";
              count += 1;
            }
          });
          state.status = next;
          state.selected = {};
          state.message = count ? `${count} approved` : "Nothing to approve in selection";
          state.focus = "bulk-approve";
          paint();
        });
        const exportRows = action("Export", "ghost");
        exportRows.dataset.key = "bulk-export";
        exportRows.addEventListener("click", () => {
          state.message = `Exported ${selected.length} rows as CSV`;
          state.selected = {};
          state.focus = "bulk-export";
          paint();
        });
        const clear = action("", "ghost", { icon: "x", iconOnly: true, ariaLabel: "Clear selection" });
        clear.dataset.key = "bulk-clear";
        clear.addEventListener("click", () => {
          state.selected = {};
          state.focus = "select-all";
          paint();
        });
        bulk.append(approve, exportRows, clear);
        toolbar.append(bulk);
      }

      const tools = el("div", "tbl-tools");
      const density = el("div", "tbl-density");
      density.setAttribute("role", "radiogroup");
      density.setAttribute("aria-label", "Density");
      densities.forEach(([value, label]) => {
        const button = el("button", "", label);
        button.type = "button";
        button.dataset.key = `density:${value}`;
        button.setAttribute("role", "radio");
        button.setAttribute("aria-checked", state.density === value ? "true" : "false");
        button.tabIndex = state.density === value ? 0 : -1;
        button.addEventListener("click", () => {
          state.density = value;
          state.focus = button.dataset.key;
          paint();
        });
        density.append(button);
      });
      density.addEventListener("keydown", (event) => {
        const index = densities.findIndex(([value]) => value === state.density);
        let next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % densities.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + densities.length) % densities.length;
        else return;
        event.preventDefault();
        state.density = densities[next][0];
        state.focus = `density:${state.density}`;
        paint();
      });

      const cols = el("div", "tbl-cols");
      const colsButton = action("Columns", "secondary", { icon: "columns-3", size: "sm" });
      colsButton.dataset.size = "sm";
      colsButton.dataset.key = "columns";
      colsButton.dataset.open = state.colsOpen ? "true" : "false";
      colsButton.setAttribute("aria-expanded", state.colsOpen ? "true" : "false");
      colsButton.setAttribute("aria-haspopup", "true");
      colsButton.addEventListener("click", () => {
        state.colsOpen = !state.colsOpen;
        state.focus = "columns";
        paint();
      });
      cols.append(colsButton);
      if (state.colsOpen) {
        const menu = el("div", "tbl-menu");
        menu.setAttribute("role", "menu");
        menu.setAttribute("aria-label", "Columns");
        COLUMNS.filter((column) => column.id !== "actions").forEach((column) => {
          const on = column.lock || state.columns[column.id];
          const option = el("button", "", column.label);
          option.type = "button";
          option.dataset.key = `col:${column.id}`;
          option.setAttribute("role", "menuitemcheckbox");
          option.setAttribute("aria-checked", on ? "true" : "false");
          if (column.lock) option.disabled = true;
          option.prepend(tick(on, column.lock));
          option.addEventListener("click", () => {
            if (column.lock) return;
            state.columns = { ...state.columns, [column.id]: !state.columns[column.id] };
            state.focus = option.dataset.key;
            paint();
          });
          menu.append(option);
        });
        menuKeys(menu);
        cols.append(menu);
      }
      tools.append(density, cols);
      toolbar.append(tools);

      const scroll = el("div", "tbl-scroll");
      const table = el("div", "tbl-table");
      table.dataset.density = state.density;
      table.setAttribute("role", "table");
      table.setAttribute("aria-label", "Card spend");
      table.setAttribute("aria-rowcount", String(list.length));
      const head = el("div", "tbl-head");
      head.setAttribute("role", "row");
      head.style.gridTemplateColumns = template;
      const allOn = selected.length === list.length;
      const selectAll = choice({
        kind: "checkbox",
        checked: allOn,
        mixed: selected.length > 0 && !allOn,
        label: "Select all",
        onChange: () => {
          state.selected = allOn ? {} : Object.fromEntries(list.map((row) => [row.id, true]));
          state.focus = "select-all";
          paint();
        },
      });
      selectAll.dataset.key = "select-all";
      const selectCell = el("div", "tbl-check");
      selectCell.setAttribute("role", "columnheader");
      selectCell.append(selectAll);
      head.append(selectCell);
      columns.forEach((column) => {
        const cell = el("div", "");
        cell.setAttribute("role", "columnheader");
        cell.style.justifyContent = column.align === "end" ? "flex-end" : column.align === "center" ? "center" : "flex-start";
        cell.style.display = "flex";
        if (!column.label) cell.setAttribute("aria-label", "Actions");
        if (column.sort) {
          const on = state.sort[0] === column.sort;
          const button = el("button", "tbl-sort", column.label);
          button.type = "button";
          button.dataset.key = `sort:${column.id}`;
          button.dataset.sorted = on ? "true" : "false";
          button.style.justifyContent = cell.style.justifyContent;
          button.setAttribute("aria-sort", on ? (state.sort[1] > 0 ? "ascending" : "descending") : "none");
          const arrow = el("span", "", on ? (state.sort[1] > 0 ? "▲" : "▼") : "↕");
          button.append(arrow);
          button.addEventListener("click", () => {
            const descending = column.sort === "amount" || column.sort === "date";
            state.sort = [column.sort, on ? -state.sort[1] : (descending ? -1 : 1)];
            state.focus = button.dataset.key;
            paint();
          });
          cell.append(button);
        } else if (column.label) cell.append(el("span", "tbl-head-label", column.label));
        head.append(cell);
      });
      table.append(head);

      list.forEach((row) => {
        const on = !!state.selected[row.id];
        const opened = state.open === row.id;
        const entry = el("div", "tbl-entry");
        entry.dataset.selected = on ? "true" : "false";
        entry.dataset.open = opened ? "true" : "false";
        const line = el("div", "tbl-line");
        line.setAttribute("role", "row");
        line.style.gridTemplateColumns = template;
        line.addEventListener("click", (event) => {
          if (event.target.closest("button")) return;
          state.open = opened ? null : row.id;
          state.focus = `expand:${row.id}`;
          paint();
        });
        const box = choice({
          kind: "checkbox",
          checked: on,
          label: `Select ${row.merchant}`,
          onChange: () => {
            state.selected = { ...state.selected, [row.id]: !on };
            state.focus = `select:${row.id}`;
            paint();
          },
        });
        box.dataset.key = `select:${row.id}`;
        const check = el("div", "tbl-check");
        check.setAttribute("role", "cell");
        check.append(box);
        line.append(check);

        columns.forEach((column) => {
          const cell = el("div", "");
          cell.setAttribute("role", "cell");
          if (column.id === "merchant") {
            const logo = el("span", "tbl-logo", initials(row.merchant));
            logo.dataset.tone = row.tone;
            const copy = el("span", "tbl-pair");
            const name = el("strong", "tbl-name", row.merchant);
            name.title = row.merchant;
            copy.append(name, el("span", "tbl-sub", row.category));
            const merchant = el("div", "tbl-merchant");
            merchant.append(logo, copy);
            cell.append(merchant);
          } else if (column.id === "card") {
            const wrap = el("div", "tbl-person");
            const mini = el("span", "tbl-mini");
            mini.dataset.art = row.art;
            mini.dataset.size = "row";
            wrap.append(mini, el("span", "tbl-mono", `•• ${row.last}`));
            cell.append(wrap);
          } else if (column.id === "holder") {
            const holder = el("span", "tbl-quiet", row.holder);
            holder.title = row.holder;
            cell.append(holder);
          } else if (column.id === "date") {
            const when = el("span", "tbl-pair");
            when.append(el("span", "tbl-name", shortDate(row.date)), el("span", "tbl-time tbl-sub", row.time));
            cell.append(when);
          } else if (column.id === "receipt") {
            const mark = el("span", "tbl-receipt");
            mark.dataset.ok = row.receipt ? "true" : "false";
            mark.title = row.receipt ? "Receipt attached" : "Receipt missing";
            const glyph = icon(row.receipt ? "file-check" : "file-warning", "inline");
            if (glyph) mark.append(glyph);
            cell.append(mark);
            cell.style.display = "flex";
            cell.style.justifyContent = "center";
          } else if (column.id === "amount") {
            cell.append(el("span", "tbl-amount", `− ${money(row.amount)}`));
            cell.style.display = "flex";
            cell.style.justifyContent = "flex-end";
          } else if (column.id === "status") {
            cell.append(badge(row.status, TONE[row.status], "dot"));
          } else if (column.id === "actions") {
            const actions = el("div", "tbl-actions");
            if (pending(row)) {
              const approve = action("Approve", "secondary");
              approve.dataset.key = `approve:${row.id}`;
              approve.addEventListener("click", (event) => {
                event.stopPropagation();
                state.status = { ...state.status, [row.id]: "Approved" };
                state.message = `${row.merchant} approved`;
                state.focus = approve.dataset.key;
                paint();
              });
              actions.append(approve);
            }
            const expander = el("button", "tbl-expander");
            expander.type = "button";
            expander.dataset.key = `expand:${row.id}`;
            expander.setAttribute("aria-expanded", opened ? "true" : "false");
            expander.setAttribute("aria-label", `${opened ? "Hide" : "Show"} details for ${row.merchant}`);
            const chevron = icon("chevron-down");
            if (chevron) expander.append(chevron);
            expander.addEventListener("click", (event) => {
              event.stopPropagation();
              state.open = opened ? null : row.id;
              state.focus = expander.dataset.key;
              paint();
            });
            actions.append(expander);
            cell.append(actions);
          }
          line.append(cell);
        });
        entry.append(line);
        if (opened) {
          const detail = el("div", "tbl-detail");
          [
            ["Category", row.category],
            ["Card", `${row.card} •• ${row.last}`],
            ["Reference", `TXN-${40200 + row.id * 37}`],
            ["Note", row.receipt ? "Receipt matched automatically" : "Ask holder to upload receipt"],
          ].forEach(([label, value]) => {
            const item = el("div", "");
            item.append(el("span", "", label), el("strong", "", value));
            detail.append(item);
          });
          entry.append(detail);
        }
        table.append(entry);
      });
      scroll.append(table);

      const foot = el("div", "tbl-foot");
      const waiting = list.filter(pending).length;
      const total = list.reduce((sum, row) => sum + row.amount, 0);
      foot.append(el("span", "", `${waiting} waiting for review · total SAR ${money(total)}`));
      const message = el("span", "tbl-msg", state.message);
      message.setAttribute("aria-live", "polite");
      const reset = el("button", "tbl-reset", "Reset demo");
      reset.type = "button";
      reset.addEventListener("click", () => {
        state.density = "default";
        state.columns = { card: true, holder: true, date: true, receipt: true };
        state.sort = ["date", -1];
        state.selected = {};
        state.status = {};
        state.open = null;
        state.colsOpen = false;
        state.message = "";
        state.focus = "reset";
        paint();
      });
      reset.dataset.key = "reset";
      foot.append(message, reset);
      root.append(toolbar, scroll, foot);
      restore(root, focus);
    }

    const paint = batch(render);
    watch(root, () => state.colsOpen, (restoreFocus) => {
      state.colsOpen = false;
      if (restoreFocus) state.focus = state.focus || "columns";
      paint();
    }, ".tbl-cols");
    render();
    return root;
  }

  function createTeamTable() {
    const root = el("div", "tbl-stage");
    const state = { role: {}, access: {}, menu: null, message: "Owner role can't be changed. Changes save instantly.", focus: "" };

    function render() {
      const focus = state.focus;
      state.focus = "";
      root.replaceChildren();
      const head = el("div", "tbl-card-head");
      head.append(el("h3", "tbl-title", "Team members"));
      head.querySelector(".tbl-title").dataset.size = "s";
      head.append(liveBadge("Live · editable"));
      const scroll = el("div", "tbl-scroll");
      const table = el("div", "tbl-team");
      table.setAttribute("role", "table");
      table.setAttribute("aria-label", "Team members");
      const columns = ["Member", "Role", "Last active", "Card access"];
      const header = el("div", "tbl-team-line tbl-team-head");
      header.setAttribute("role", "row");
      columns.forEach((label, index) => {
        const cell = el("span", "tbl-overline", label);
        if (index === 3) cell.classList.add("tbl-center");
        header.append(cell);
      });
      table.append(header);
      USERS.forEach((user, index) => {
        const role = state.role[index] || user.role;
        const access = index in state.access ? state.access[index] : user.access;
        const owner = user.role === "Owner";
        const open = state.menu === index;
        const line = el("div", "tbl-team-line");
        line.setAttribute("role", "row");
        const person = el("div", "tbl-person");
        const avatar = el("span", "tbl-avatar", initials(user.name));
        avatar.dataset.tone = user.tone;
        const presence = el("span", "tbl-presence");
        presence.dataset.on = user.online ? "true" : "false";
        avatar.append(presence);
        const copy = el("span", "tbl-pair");
        const nameRow = el("span", "tbl-name-row");
        nameRow.append(el("strong", "tbl-name", user.name));
        if (user.invited) nameRow.append(badge("Invited", "info"));
        copy.append(nameRow, el("span", "tbl-sub", user.email));
        person.append(avatar, copy);

        const roleCell = el("div", "tbl-role");
        const roleButton = el("button", "", role);
        roleButton.type = "button";
        roleButton.dataset.key = `role:${index}`;
        roleButton.disabled = owner;
        roleButton.setAttribute("aria-expanded", open ? "true" : "false");
        roleButton.setAttribute("aria-haspopup", owner ? "false" : "listbox");
        if (!owner) {
          const chevron = icon("chevron-down", "inline");
          if (chevron) roleButton.append(chevron);
          roleButton.addEventListener("click", () => {
            state.menu = open ? null : index;
            state.focus = roleButton.dataset.key;
            paint();
          });
        }
        roleCell.append(roleButton);
        if (open) {
          const menu = el("div", "tbl-menu");
          menu.dataset.place = "start";
          menu.setAttribute("role", "listbox");
          menu.setAttribute("aria-label", `Role for ${user.name}`);
          ROLES.forEach(([label, detail]) => {
            const option = el("button", "");
            option.type = "button";
            option.dataset.key = `role-option:${index}:${label}`;
            option.setAttribute("role", "option");
            option.setAttribute("aria-selected", label === role ? "true" : "false");
            const text = el("span", "tbl-menu-copy");
            text.append(el("span", "", label), el("small", "", detail));
            option.append(text);
            option.addEventListener("click", () => {
              state.role = { ...state.role, [index]: label };
              state.menu = null;
              state.message = `${user.name} is now ${label}`;
              state.focus = `role:${index}`;
              paint();
            });
            menu.append(option);
          });
          menuKeys(menu);
          roleCell.append(menu);
        }

        const seen = el("span", "tbl-quiet", user.seen);
        const accessCell = el("div", "tbl-center");
        const toggle = choice({
          kind: "switch",
          checked: access,
          label: `Card access for ${user.name}`,
          onChange: () => {
            const next = !access;
            state.access = { ...state.access, [index]: next };
            state.message = `Card access ${next ? "on" : "off"} for ${user.name}`;
            state.focus = `access:${index}`;
            paint();
          },
        });
        toggle.dataset.key = `access:${index}`;
        accessCell.append(toggle);
        line.append(person, roleCell, seen, accessCell);
        table.append(line);
      });
      scroll.append(table);
      const note = el("p", "tbl-note", state.message);
      note.setAttribute("aria-live", "polite");
      root.append(head, scroll, note);
      restore(root, focus);
    }

    const paint = batch(render);
    watch(root, () => state.menu != null, (restoreFocus) => {
      const current = state.menu;
      state.menu = null;
      if (restoreFocus && current != null) state.focus = state.focus || `role:${current}`;
      paint();
    }, ".tbl-role");
    render();
    return root;
  }

  function createInvoiceTable() {
    const items = [
      ["Office chairs", 6, 850],
      ["Standing desks", 3, 2400],
      ["Delivery and assembly", 1, 450],
    ];
    const subtotal = items.reduce((sum, [, qty, price]) => sum + qty * price, 0);
    const root = el("div", "tbl-stage");
    root.append(el("h3", "tbl-title", "Invoice INV-2041 · line items"));
    root.querySelector(".tbl-title").dataset.size = "s";
    const scroll = el("div", "tbl-scroll");
    const table = el("div", "");
    table.setAttribute("role", "table");
    table.setAttribute("aria-label", "Invoice INV-2041");
    const head = el("div", "tbl-invoice-line tbl-invoice-head");
    ["Item", "Qty", "Price", "Total"].forEach((label, index) => {
      const cell = el("span", "tbl-overline", label);
      if (index) cell.classList.add("tbl-end");
      head.append(cell);
    });
    table.append(head);
    items.forEach(([name, qty, price]) => {
      const line = el("div", "tbl-invoice-line");
      line.setAttribute("role", "row");
      line.append(el("span", "", name), el("span", "tbl-mono tbl-end", String(qty)), el("span", "tbl-mono tbl-end", money(price)), el("span", "tbl-mono tbl-end", money(qty * price)));
      table.append(line);
    });
    [["Subtotal", subtotal, false], ["VAT 15%", subtotal * 0.15, false], ["Total SAR", subtotal * 1.15, true]].forEach(([label, value, total]) => {
      const line = el("div", "tbl-invoice-line tbl-sum");
      if (total) line.dataset.total = "true";
      const name = el("span", "tbl-end", label);
      const amount = el("span", "tbl-mono tbl-end", money(value));
      line.append(name, amount);
      table.append(line);
    });
    scroll.append(table);
    root.append(scroll, el("p", "tbl-note", "Totals row: subtle fill, 600 weight, a 1 px strong border above it."));
    return root;
  }

  function createTableStates() {
    const wrap = el("div", "tbl-states");
    const states = [
      ["Loading", "skeleton"],
      ["Empty · first use", "No cards yet", "Create a card to start spending.", "Create card", "success", "plus"],
      ["No results · filtered", "Nothing matches", "Try fewer filters.", "Clear filters", "neutral", "search"],
      ["Error", "Couldn't load transactions", "Check your connection.", "Retry", "danger", "triangle-alert"],
    ];
    states.forEach(([kicker, title, body, button, tone, glyph]) => {
      const card = el("div", "tbl-state");
      card.append(el("span", "tbl-overline", kicker));
      const panel = el("div", "tbl-state-body");
      const head = el("div", "tbl-state-head");
      head.append(el("span", "tbl-bar"), el("span", "tbl-bar"), el("span", "tbl-bar"));
      head.children[0].style.width = "var(--space-14)";
      head.children[1].style.width = "var(--space-10)";
      head.children[2].style.marginInlineStart = "auto";
      head.children[2].style.width = "var(--space-10)";
      panel.append(head);
      if (title === "skeleton") {
        ["60%", "45%", "70%"].forEach((width) => {
          const row = el("div", "tbl-skel");
          const mark = el("span", "tbl-bone");
          mark.dataset.shape = "mark";
          const line = el("span", "tbl-bone");
          line.style.width = width;
          const end = el("span", "tbl-bar");
          end.style.marginInlineStart = "auto";
          end.style.width = "var(--space-12)";
          row.append(mark, line, end);
          panel.append(row);
        });
      } else {
        const empty = el("div", "tbl-empty");
        const mark = el("span", "tbl-empty-icon");
        mark.dataset.tone = tone;
        const drawn = icon(glyph);
        if (drawn) mark.append(drawn);
        empty.append(mark, el("strong", "", title), el("p", "", body), el("span", "tbl-sample", button));
        panel.append(empty);
      }
      card.append(panel);
      wrap.append(card);
    });
    return wrap;
  }

  function createReviewList() {
    const root = el("div", "tbl-phone-card");
    const state = { status: {}, open: null, focus: "" };
    const list = SPEND.slice(0, 5);

    function render() {
      const focus = state.focus;
      state.focus = "";
      root.replaceChildren();
      const head = el("div", "tbl-card-head");
      head.append(el("span", "tbl-kicker", "List rows · swipe actions"), liveBadge("Live · tap ⋯"));
      const phone = el("div", "tbl-phone");
      phone.append(el("h3", "tbl-phone-title", "To review"), el("span", "tbl-overline", "This week"));
      const group = el("div", "tbl-list");
      list.forEach((row) => {
        const status = state.status[row.id] || row.status;
        const open = state.open === row.id;
        const item = el("div", "tbl-swipe");
        item.dataset.open = open ? "true" : "false";
        const actions = el("div", "tbl-swipe-actions");
        const approve = el("button", "tbl-swipe-approve", "Approve");
        approve.type = "button";
        approve.dataset.key = `swipe-approve:${row.id}`;
        const check = icon("check");
        if (check) approve.prepend(check);
        approve.addEventListener("click", () => {
          state.status = { ...state.status, [row.id]: "Approved" };
          state.open = null;
          state.focus = `swipe:${row.id}`;
          paint();
        });
        const later = el("button", "tbl-swipe-later", "Later");
        later.type = "button";
        later.addEventListener("click", () => {
          state.open = null;
          state.focus = `swipe:${row.id}`;
          paint();
        });
        actions.append(approve, later);
        const face = el("div", "tbl-swipe-face");
        const logo = el("span", "tbl-logo", initials(row.merchant));
        logo.dataset.tone = row.tone;
        const copy = el("div", "tbl-tx-copy");
        copy.append(el("strong", "tbl-name", row.merchant), el("span", "tbl-sub", `${row.holder.split(" ")[0]} · ${row.card} •• ${row.last}`));
        const side = el("div", "tbl-tx-side");
        side.append(el("span", "tbl-amount", `− ${money(row.amount)}`), badge(status, TONE[status]));
        const more = el("button", "tbl-more", "⋯");
        more.type = "button";
        more.dataset.key = `swipe:${row.id}`;
        more.setAttribute("aria-label", `Actions for ${row.merchant}`);
        more.setAttribute("aria-expanded", open ? "true" : "false");
        more.addEventListener("click", () => {
          state.open = open ? null : row.id;
          state.focus = more.dataset.key;
          paint();
        });
        face.append(logo, copy, side, more);
        item.append(actions, face);
        group.append(item);
      });
      phone.append(group, el("p", "tbl-hint", "Swipe left on a row (or tap ⋯) for quick actions."));
      root.append(head, phone);
      restore(root, focus);
    }

    const paint = batch(render);
    watch(root, () => state.open != null, (restoreFocus) => {
      const current = state.open;
      state.open = null;
      if (restoreFocus && current != null) state.focus = state.focus || `swipe:${current}`;
      paint();
    }, ".tbl-swipe");
    render();
    return root;
  }

  function createTerminalCards() {
    const root = el("div", "tbl-phone-card");
    const head = el("div", "tbl-card-head");
    head.append(el("span", "tbl-kicker", "Cards · rich rows"));
    root.append(head);
    const phone = el("div", "tbl-phone");
    phone.dataset.scroll = "true";
    phone.append(el("h3", "tbl-phone-title", "Terminals"));
    [
      ["Olaya · Counter 1", "T-0412", "Online", "success", [["Today", "18,420"], ["Payments", "214"], ["Last seen", "2 min"]]],
      ["Olaya · Drive-thru", "T-0413", "Low paper", "warning", [["Today", "9,105"], ["Payments", "131"], ["Last seen", "5 min"]]],
      ["Malqa · Counter", "T-0521", "Offline", "danger", [["Today", "0"], ["Payments", "0"], ["Last seen", "3 h"]]],
    ].forEach(([name, id, status, tone, metrics]) => {
      const card = el("div", "tbl-terminal");
      const top = el("div", "tbl-terminal-top");
      const mark = el("span", "tbl-terminal-mark");
      mark.append(el("span", ""));
      const copy = el("div", "tbl-terminal-copy");
      copy.append(el("strong", "", name), el("span", "tbl-mono", id));
      const state = el("span", "tbl-status-inline", status);
      const dot = el("span", "tbl-dot");
      dot.dataset.tone = tone;
      state.prepend(dot);
      top.append(mark, copy, state);
      const grid = el("div", "tbl-metrics");
      metrics.forEach(([label, value]) => {
        const item = el("div", "");
        const amount = el("strong", "", value);
        if (tone === "danger" && label === "Last seen") amount.dataset.tone = "danger";
        item.append(el("span", "", label), amount);
        grid.append(item);
      });
      card.append(top, grid);
      phone.append(card);
    });
    root.append(phone);
    return root;
  }

  function createStatementTable() {
    const root = el("div", "tbl-phone-card");
    const head = el("div", "tbl-card-head");
    head.append(el("span", "tbl-kicker", "Scrolling table · statement"));
    root.append(head);
    const phone = el("div", "tbl-phone");
    phone.append(el("h3", "tbl-phone-title", "September statement"));
    const scroller = el("div", "tbl-stmt");
    const grid = el("div", "tbl-stmt-grid");
    grid.setAttribute("role", "table");
    grid.setAttribute("aria-label", "September statement");
    const rows = [
      ["Date", "Type", "In", "Out", "Balance"],
      ["30 Sep", "POS", "18,420.00", "", "175,000.00"],
      ["29 Sep", "Transfer", "", "25,000.00", "156,580.00"],
      ["28 Sep", "Card", "", "1,249.00", "181,580.00"],
      ["27 Sep", "POS", "12,880.00", "", "182,829.00"],
      ["26 Sep", "Payroll", "", "96,000.00", "169,949.00"],
    ];
    const kind = ["date", "type", "in", "out", "balance"];
    rows.forEach((row, rowIndex) => {
      row.forEach((value, index) => {
        const cell = el("span", "tbl-stmt-cell", value || "—");
        cell.setAttribute("role", rowIndex ? "cell" : "columnheader");
        if (!rowIndex) cell.dataset.head = "true";
        if (!index) cell.dataset.pin = "true";
        if (rowIndex && index >= 2) cell.dataset.kind = kind[index];
        if (rowIndex && !value) cell.dataset.empty = "true";
        grid.append(cell);
      });
    });
    scroller.append(grid);
    phone.append(scroller, el("p", "tbl-hint", "The first column stays fixed while you scroll sideways. A shadow shows there's more to the right."));
    root.append(phone);
    return root;
  }

  window.createCellTypes = createCellTypes;
  window.createSpendTable = createSpendTable;
  window.createTeamTable = createTeamTable;
  window.createInvoiceTable = createInvoiceTable;
  window.createTableStates = createTableStates;
  window.createReviewList = createReviewList;
  window.createTerminalCards = createTerminalCards;
  window.createStatementTable = createStatementTable;
})();
