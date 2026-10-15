/**
 * Command menu. Load lucide UMD, then this script.
 * createButton is used for the empty-state support action when it is loaded.
 *
 * createCommandMenu({
 *   variant: "web" | "mobile",
 *   query, scope, shortcut, label,
 *   onRun
 * })
 *
 * Web: type to filter, arrows move, Enter runs, Esc clears, Tab scopes.
 * Mobile: chips replace Tab. Cancel clears the query and scope.
 */
(function () {
  const catalog = {
    transfers: "send",
    cards: "credit-card",
    users: "user-plus",
    freeze: "snowflake",
    pos: "smartphone",
    dashboard: "layout-dashboard",
    transactions: "arrow-left-right",
    settings: "settings",
    pending: "clock",
    invoicing: "file-text",
    search: "search",
    "search-x": "search-x",
    close: "x",
    refresh: "loader-circle",
  };

  const mirror = new Set(["send", "arrow-left-right"]);
  const scopes = ["Transactions", "People", "Cards", "Documents"];
  const order = ["RECENT", "ACTIONS", "GO TO", "TRANSACTIONS", "PEOPLE", "CARDS", "DOCUMENTS"];

  const items = [
    { group: "RECENT", title: "Nour Trading", sub: "Beneficiary · SA03 •• 6080", icon: "pending", recent: true, scope: "People" },
    { group: "RECENT", title: "September statement", sub: "Main account · PDF", icon: "pending", recent: true, scope: "Documents" },
    { group: "ACTIONS", title: "New transfer", sub: "Local, international or own accounts", icon: "transfers", kbd: ["T"], tone: "brand" },
    { group: "ACTIONS", title: "Create virtual card", icon: "cards", kbd: ["C"], tone: "brand" },
    { group: "ACTIONS", title: "Add beneficiary", icon: "users", tone: "brand" },
    { group: "ACTIONS", title: "Freeze a card", sub: "Pick which card next", icon: "freeze", tone: "danger" },
    { group: "ACTIONS", title: "Order POS terminals", icon: "pos", tone: "brand" },
    { group: "GO TO", title: "Dashboard", icon: "dashboard", kbd: ["G", "D"] },
    { group: "GO TO", title: "Transactions", icon: "transactions", kbd: ["G", "T"] },
    { group: "GO TO", title: "Cards", icon: "cards", kbd: ["G", "C"] },
    { group: "GO TO", title: "Settings & Preferences", icon: "settings" },
    { group: "PEOPLE", title: "Nour Trading", sub: "Beneficiary · SA03 •• 6080", initials: "NT", scope: "People" },
    { group: "PEOPLE", title: "Khalid Al-Harbi", sub: "Beneficiary · SA44 •• 7519", initials: "KH", scope: "People" },
    { group: "PEOPLE", title: "Omar Bakr", sub: "Team · Accountant", initials: "OB", scope: "People" },
    { group: "TRANSACTIONS", title: "Nour Trading", sub: "Today 09:30 · Transfer · Pending", initials: "NT", meta: "− 25,000.00", scope: "Transactions" },
    { group: "TRANSACTIONS", title: "Al Baik · Olaya", sub: "Today 12:41 · mada", initials: "AB", meta: "+ 86.25", positive: true, scope: "Transactions" },
    { group: "TRANSACTIONS", title: "Careem", sub: "Yesterday · Visa •• 4417", initials: "CA", meta: "− 38.50", scope: "Transactions" },
    { group: "CARDS", title: "Marketing card", sub: "Virtual · •• 4417 · Active", icon: "cards", scope: "Cards" },
    { group: "CARDS", title: "Operations card", sub: "Physical · •• 2086 · Frozen", icon: "cards", scope: "Cards" },
    { group: "DOCUMENTS", title: "September statement", sub: "Main account · PDF", icon: "invoicing", scope: "Documents" },
    { group: "DOCUMENTS", title: "CR certificate", sub: "Uploaded 3 Mar 2026", icon: "invoicing", scope: "Documents" },
  ];

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function drawIcon(name) {
    const lucide = window.lucide;
    if (!lucide || !name) return null;
    const kebab = catalog[name] || name;
    const node = lucide.icons[pascal(kebab)];
    if (!node) return null;
    const svg = lucide.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    svg.style.strokeWidth = "var(--icon-stroke)";
    if (mirror.has(kebab)) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function haystack(item) {
    return `${item.title} ${item.sub || ""} ${item.meta || ""}`.toLowerCase();
  }

  function createCommandMenu(options = {}) {
    const variant = options.variant === "mobile" ? "mobile" : "web";
    const listId = `command-list-${Math.random().toString(36).slice(2, 8)}`;
    let query = options.query || "";
    let scope = options.scope || null;
    let active = 0;
    let status = "";
    let shortcutBound = false;

    const root = el("div", "command-menu");
    root.dataset.variant = variant;
    if (variant === "web") {
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-label", options.label || "Command menu");
    }

    const field = el("div", "command-menu-field");
    const search = drawIcon("search");
    if (search) field.append(search);
    const scopeHost = el("span", "command-menu-scope");
    scopeHost.hidden = true;
    const input = el("input", "command-menu-input");
    input.type = "text";
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-controls", listId);
    input.setAttribute("aria-label", variant === "mobile" ? "Search Hala" : "Search");
    const spin = drawIcon("refresh");
    if (spin) {
      spin.classList.add("command-menu-spin");
      spin.hidden = true;
    }
    const esc = el("span", "command-menu-kbd", "ESC");
    field.append(scopeHost, input);
    if (spin) field.append(spin);
    if (variant === "web") field.append(esc);

    const results = el("div", "command-menu-results");
    results.id = listId;
    results.setAttribute("role", "listbox");
    results.setAttribute("aria-label", "Results");

    const foot = el("div", "command-menu-foot");
    const statusNode = el("span", "command-menu-status");
    statusNode.setAttribute("role", "status");
    if (variant === "web") {
      [["↑↓", "Move"], ["↵", "Open"], ["TAB", "Scope"]].forEach(([key, label]) => {
        const hint = el("span", "command-menu-hint");
        hint.append(el("span", "command-menu-kbd", key), document.createTextNode(label));
        foot.append(hint);
      });
      foot.append(statusNode);
    }

    const chips = el("div", "command-menu-chips");
    const mobileScopes = ["Transactions", "People", "Cards", "Documents", "Actions"];
    const cancel = el("button", "command-menu-cancel", "Cancel");
    cancel.type = "button";

    if (variant === "mobile") {
      const bar = el("div", "command-menu-bar");
      bar.append(field, cancel);
      root.append(bar, chips, results);
    } else {
      root.append(field, results, foot);
    }

    function resultsFor() {
      const q = query.trim().toLowerCase();
      let list;
      if (variant === "mobile") {
        const all = items.filter((item) => !item.recent && item.group !== "GO TO");
        const matched = all.filter((item) => {
          const scopeOk = !scope || item.scope === scope || (scope === "Actions" && item.group === "ACTIONS");
          const textOk = !q || haystack(item).includes(q);
          return scopeOk && textOk;
        });
        if (!q && !scope) {
          list = all.filter((item) => item.group === "ACTIONS" && item.tone === "brand").slice(0, 3)
            .concat(all.filter((item) => item.group === "TRANSACTIONS").slice(0, 2));
        } else {
          list = matched.slice(0, 8);
        }
        return list;
      }
      if (!q && !scope) {
        list = items.filter((item) => item.recent || (item.group === "ACTIONS" && item.tone === "brand" && item.kbd) || (item.group === "GO TO" && item.kbd));
      } else {
        list = items.filter((item) => !item.recent && (!scope || item.scope === scope) && (!q || haystack(item).includes(q)));
      }
      list.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
      return list.slice(0, 12);
    }

    function groupLabel(item, listQuery) {
      if (variant === "mobile" && item.group === "ACTIONS" && !listQuery && !scope) return "SUGGESTED";
      return item.group;
    }

    function run(item) {
      status = `${item.group === "ACTIONS" ? "Starting" : "Opening"}: ${item.title}`;
      if (options.onRun) options.onRun(item, status);
      paint();
    }

    function paintScope() {
      scopeHost.replaceChildren();
      scopeHost.hidden = !scope;
      if (!scope) return;
      scopeHost.append(document.createTextNode(scope));
      const clear = el("button", "command-menu-scope-clear");
      clear.type = "button";
      clear.setAttribute("aria-label", "Remove scope");
      const mark = drawIcon("close");
      if (mark) clear.append(mark);
      clear.addEventListener("click", () => {
        scope = null;
        active = 0;
        paint();
        input.focus();
      });
      scopeHost.append(clear);
    }

    function paintChips() {
      if (variant !== "mobile") return;
      chips.replaceChildren();
      mobileScopes.forEach((name) => {
        const chip = el("button", "command-menu-chip", name);
        chip.type = "button";
        const on = scope === name;
        chip.setAttribute("aria-pressed", on ? "true" : "false");
        chip.addEventListener("click", () => {
          scope = on ? null : name;
          active = 0;
          status = "";
          paint();
        });
        chips.append(chip);
      });
    }

    function paint() {
      const list = resultsFor();
      const q = query.trim().toLowerCase();
      if (active > list.length - 1) active = Math.max(0, list.length - 1);
      input.value = query;
      input.placeholder = scope && variant === "web" ? `Search ${scope.toLowerCase()}…` : variant === "mobile" ? "Search Hala" : "Search or type a command…";
      if (spin) spin.dataset.on = q.length > 0 && q.length < 2 ? "true" : "false";
      paintScope();
      paintChips();
      results.replaceChildren();

      if (!list.length && (q || scope)) {
        const empty = el("div", "command-menu-empty");
        const iconWrap = el("span", "command-menu-empty-icon");
        const glyph = drawIcon("search-x");
        if (glyph) iconWrap.append(glyph);
        const title = variant === "mobile" ? "No results" : `No results for "${query}"`;
        const hint = variant === "mobile"
          ? "Try a name, amount or card digits."
          : "Try a name, IBAN, amount or the last 4 card digits.";
        empty.append(iconWrap, el("span", "command-menu-empty-title", title), el("span", "command-menu-empty-hint", hint));
        if (variant === "web" && window.createButton) {
          const support = window.createButton({
            label: `Ask support about "${query}"`,
            variant: "secondary",
            size: "sm",
          });
          support.classList.add("command-menu-support");
          support.addEventListener("click", () => {
            status = "Opening chat with support";
            paint();
          });
          empty.append(support);
        }
        results.append(empty);
      } else {
        const groups = [];
        list.forEach((item, index) => {
          const label = groupLabel(item, q);
          let group = groups.find((entry) => entry.label === label);
          if (!group) {
            group = { label, items: [] };
            groups.push(group);
          }
          group.items.push({ item, index });
        });
        groups.forEach((group) => {
          const block = el("div", "command-menu-group");
          block.append(el("span", "command-menu-label", group.label));
          group.items.forEach(({ item, index }) => {
            const on = index === active;
            const row = el("button", "command-menu-row");
            row.type = "button";
            row.setAttribute("role", "option");
            row.id = `${listId}-${index}`;
            row.setAttribute("aria-selected", on ? "true" : "false");
            const tile = el("span", "command-menu-tile");
            if (item.tone === "brand" || (variant === "web" && item.tone)) tile.dataset.tone = item.tone;
            if (item.icon) {
              const glyph = drawIcon(item.icon);
              if (glyph) tile.append(glyph);
            } else {
              tile.textContent = item.initials || item.title.slice(0, 2).toUpperCase();
            }
            const copy = el("span", "command-menu-copy");
            const title = el("span", "command-menu-title");
            const at = q ? item.title.toLowerCase().indexOf(q) : -1;
            if (at >= 0) {
              title.append(document.createTextNode(item.title.slice(0, at)));
              title.append(el("b", "command-menu-hit", item.title.slice(at, at + q.length)));
              title.append(document.createTextNode(item.title.slice(at + q.length)));
            } else {
              title.textContent = item.title;
            }
            copy.append(title);
            const sub = item.sub || (variant === "mobile" && item.group === "ACTIONS" ? "Action" : "");
            if (sub) copy.append(el("span", "command-menu-sub", sub));
            row.append(tile, copy);
            if (item.meta) {
              const meta = el("span", "command-menu-meta", item.meta);
              if (item.positive) meta.dataset.positive = "true";
              row.append(meta);
            }
            if (item.kbd && !on && variant === "web") {
              const keys = el("span", "command-menu-keys");
              item.kbd.forEach((key) => keys.append(el("span", "command-menu-key", key)));
              row.append(keys);
            }
            if (on && variant === "web") row.append(el("span", "command-menu-enter", "↵"));
            row.addEventListener("mouseenter", () => {
              if (active !== index) {
                active = index;
                paint();
              }
            });
            row.addEventListener("click", () => run(item));
            block.append(row);
          });
          results.append(block);
        });
      }

      const current = results.querySelector(`[id="${listId}-${active}"]`);
      if (current) input.setAttribute("aria-activedescendant", current.id);
      else input.removeAttribute("aria-activedescendant");

      if (variant === "web") {
        if (status) statusNode.textContent = status;
        else if (list.length) statusNode.textContent = `${list.length} result${list.length > 1 ? "s" : ""}`;
        else statusNode.textContent = "";
      }
    }

    function onKey(event) {
      const list = resultsFor();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        active = (active + 1) % Math.max(1, list.length);
        paint();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        active = (active - 1 + list.length) % Math.max(1, list.length);
        paint();
      } else if (event.key === "Enter" && list[active]) {
        event.preventDefault();
        run(list[active]);
      } else if (event.key === "Escape") {
        event.preventDefault();
        if (query) {
          query = "";
          active = 0;
          status = "";
        } else {
          scope = null;
          active = 0;
        }
        paint();
      } else if (event.key === "Tab" && variant === "web") {
        event.preventDefault();
        const index = scopes.indexOf(scope);
        scope = scopes[(index + 1) % scopes.length];
        active = 0;
        status = "";
        paint();
      } else if (event.key === "Backspace" && !query && scope) {
        scope = null;
        active = 0;
        paint();
      }
    }

    input.addEventListener("input", () => {
      query = input.value;
      active = 0;
      status = "";
      paint();
    });
    input.addEventListener("keydown", onKey);
    cancel.addEventListener("click", () => {
      query = "";
      scope = null;
      active = 0;
      status = "";
      paint();
      input.focus();
    });

    function onShortcut(event) {
      if (root.closest("[hidden]")) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.focus();
      }
    }

    if (options.shortcut && variant === "web") {
      window.addEventListener("keydown", onShortcut);
      shortcutBound = true;
    }

    root.setQuery = (value, nextScope) => {
      query = value || "";
      if (nextScope !== undefined) scope = nextScope;
      active = 0;
      status = "";
      paint();
      input.focus();
    };
    root.focusField = () => input.focus();
    root.destroy = () => {
      if (shortcutBound) window.removeEventListener("keydown", onShortcut);
    };

    paint();
    return root;
  }

  window.createCommandMenu = createCommandMenu;
})();
