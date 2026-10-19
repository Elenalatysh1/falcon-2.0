/**
 * Navigation. Load lucide UMD, then this script.
 *
 * createNavSidebar()
 * createNavMobileWeb()
 * createNavHeaders()
 * createNavFooters()
 * createNavMobile()
 * createNavGuide()
 *
 * The sidebar remembers expanded, rail, or drawer. Mobile web shares one
 * destination across the two phone specimens. Escape closes drawers and menus.
 */
(function () {
  const WORDMARK = "../media/type=full, color=brand.svg";
  const SYMBOL = "../media/type=short, color=brand.svg";
  const NAMES = {
    home: "house",
    transactions: "arrow-left-right",
    transfers: "send",
    cards: "credit-card",
    pos: "smartphone",
    ecommerce: "shopping-cart",
    users: "users",
    settings: "settings",
    help: "circle-help",
    search: "search",
    notifications: "bell",
    close: "x",
    expand: "chevron-down",
    previous: "chevron-left",
    back: "arrow-left",
    sidebar: "panel-left",
    more: "ellipsis-vertical",
    sort: "arrow-up-down",
    "sign-out": "log-out",
    receipt: "receipt",
    menu: "menu",
    linkedin: "linkedin",
    x: "x",
    instagram: "instagram",
  };
  const MIRROR = new Set(["arrow-left", "arrow-right", "chevron-left", "chevron-right", "send", "log-out", "undo-2", "panel-left"]);
  const SECTIONS = [
    { label: "Main", items: [["Dashboard", "home"], ["Transactions", "transactions"]] },
    { label: "Pay", items: [["Transfers", "transfers", ["Local", "International", "Beneficiaries"], "3"], ["Payroll", "users"], ["Cards", "cards"]] },
    { label: "Accept payments", items: [["POS", "pos", ["Terminals", "Order POS", "Settlements"]], ["eCommerce", "ecommerce"], ["Invoicing", "receipt"]] },
    { label: "Manage", items: [["Settings", "settings"], ["Help", "help"]] },
  ];

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size, active) {
    const lucide = window.lucide;
    const kebab = NAMES[name] || name;
    if (!lucide || !kebab || !lucide.icons[pascal(kebab)]) return null;
    const svg = lucide.createElement(lucide.icons[pascal(kebab)]);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    if (size) svg.dataset.size = size;
    if (active) svg.dataset.active = "true";
    if (MIRROR.has(kebab)) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function live(text) {
    return el("span", "nv-live", text || "Live");
  }

  function logo(word) {
    const img = document.createElement("img");
    img.className = "nv-logo";
    img.alt = "";
    img.src = word ? WORDMARK : SYMBOL;
    if (word) img.classList.add("nv-word");
    return img;
  }

  function avatar(text) {
    return el("span", "nv-avatar", text);
  }

  function button(className, label, onClick, key) {
    const node = el("button", className);
    node.type = "button";
    if (key) node.dataset.key = key;
    if (onClick) node.addEventListener("click", onClick);
    if (label) node.append(document.createTextNode(label));
    return node;
  }

  function focusKey(root, key) {
    if (!key) return;
    const node = root.querySelector(`[data-key="${CSS.escape(key)}"]`);
    if (node) node.focus();
  }

  function sections() {
    return SECTIONS.map((group) => ({
      label: group.label,
      items: group.items.map(([label, glyph, kids, badge]) => ({ label, glyph, kids: kids || null, badge: badge || "" })),
    }));
  }

  function createNavSidebar() {
    const root = el("div", "nv-stack");
    let mode = "expanded";
    let page = "Cards";
    let sub = null;
    const open = { Transfers: false, POS: true };
    let drawer = false;
    let restore = "";
    const modes = [
      ["expanded", "Expanded"],
      ["rail", "Collapsed rail"],
      ["drawer", "< 1024 px · drawer"],
    ];
    const toolbar = el("div", "nv-toolbar");
    const modeBar = el("div", "nv-modes");
    modeBar.setAttribute("role", "tablist");
    modes.forEach(([id, label]) => {
      const tab = button("nv-mode", label, () => {
        mode = id;
        drawer = false;
        restore = `mode-${id}`;
        paint();
      }, `mode-${id}`);
      tab.setAttribute("role", "tab");
      modeBar.append(tab);
    });
    toolbar.append(live(), modeBar);

    const stage = el("div", "nv-stage");
    const side = el("aside", "nv-side");
    side.setAttribute("aria-label", "Hala Business");
    const head = el("div", "nv-head");
    const search = el("div", "nv-search");
    const nav = el("nav", "nv-nav");
    const foot = el("div", "nv-foot");
    side.append(head, search, nav, foot);
    const canvas = el("div", "nv-canvas");
    const crumb = el("span", "nv-crumb");
    const title = el("h3", "nv-title");
    const cards = el("div", "nv-cards");
    cards.append(el("span", "nv-bone"), el("span", "nv-bone"), el("span", "nv-bone"));
    canvas.append(crumb, title, cards, el("span", "nv-bone nv-grow"));
    const sheet = el("div", "nv-sheet");
    const sheetBar = el("div", "nv-sheet-bar");
    const sheetBody = el("div", "nv-sheet-body");
    const sheetTitle = el("h3", "nv-title");
    sheetBody.append(sheetTitle, el("span", "nv-bone"), el("span", "nv-bone"));
    const scrim = el("div", "nv-scrim");
    const drawerEl = el("div", "nv-drawer");
    drawerEl.setAttribute("role", "dialog");
    drawerEl.setAttribute("aria-label", "Menu");
    sheet.append(sheetBar, sheetBody, scrim, drawerEl);
    stage.append(side, canvas, sheet);

    function go(nextPage, nextSub, key) {
      page = nextPage;
      sub = nextSub || null;
      drawer = false;
      restore = key || "";
      paint();
    }

    function paint() {
      stage.dataset.mode = mode;
      modes.forEach(([id]) => {
        const tab = modeBar.querySelector(`[data-key="mode-${id}"]`);
        const on = mode === id;
        tab.dataset.on = on ? "true" : "false";
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      const expanded = mode === "expanded";
      head.replaceChildren(logo(expanded));
      if (expanded) {
        const collapse = button("nv-icon-btn", "", () => { mode = "rail"; restore = "expand"; paint(); }, "collapse");
        collapse.setAttribute("aria-label", "Collapse sidebar");
        const glyph = icon("sidebar", "default");
        if (glyph) collapse.append(glyph);
        head.append(collapse);
      }
      search.replaceChildren();
      const searchIcon = icon("search", "inline");
      if (searchIcon) search.append(searchIcon);
      if (expanded) {
        search.append(document.createTextNode("Search"), el("span", "nv-kbd", "⌘K"));
      }
      search.setAttribute("aria-label", "Search");
      nav.replaceChildren();
      sections().forEach((group) => {
        const block = el("div", "nv-group");
        block.append(el("span", "nv-kicker", group.label));
        group.items.forEach((item) => {
          const on = page === item.label;
          const opened = expanded && item.kids && open[item.label];
          const selected = on && (!item.kids || !expanded || !sub);
          const row = button("nv-item", "", () => {
            if (item.kids) {
              if (expanded) open[item.label] = !open[item.label];
              else { mode = "expanded"; open[item.label] = true; }
              restore = `item-${item.label}`;
              paint();
              return;
            }
            go(item.label, null, `item-${item.label}`);
          }, `item-${item.label}`);
          row.dataset.on = selected ? "true" : "false";
          row.dataset.section = on ? "true" : "false";
          row.setAttribute("aria-current", selected ? "page" : "false");
          if (!expanded) row.title = item.label;
          const glyph = icon(item.glyph);
          if (glyph) row.append(glyph);
          if (expanded) row.append(el("span", "nv-label", item.label));
          if (item.badge) row.append(el("span", "nv-count", item.badge));
          if (expanded && item.kids) {
            row.setAttribute("aria-expanded", opened ? "true" : "false");
            const chev = icon("expand", "inline");
            if (chev) { chev.classList.add("nv-chev"); row.append(chev); }
          }
          block.append(row);
          if (item.kids) {
            const kids = el("div", "nv-kids");
            kids.dataset.open = opened ? "true" : "false";
            const clip = el("div", "nv-kids-clip");
            item.kids.forEach((name) => {
              const active = on && sub === name;
              const child = button("nv-sub", name, () => go(item.label, name, `sub-${item.label}-${name}`), `sub-${item.label}-${name}`);
              child.dataset.on = active ? "true" : "false";
              if (active) child.setAttribute("aria-current", "page");
              clip.append(child);
            });
            kids.append(clip);
            if (!opened) kids.inert = true;
            block.append(kids);
          }
        });
        nav.append(block);
      });
      foot.replaceChildren();
      if (!expanded) {
        const expand = button("nv-icon-btn", "", () => { mode = "expanded"; restore = "collapse"; paint(); }, "expand");
        expand.setAttribute("aria-label", "Expand sidebar");
        const glyph = icon("sidebar");
        if (glyph) expand.append(glyph);
        foot.append(expand);
      }
      const user = el("div", "nv-user");
      user.append(avatar("AA"));
      const copy = el("div", "nv-user-copy");
      copy.append(el("strong", "", "Abdulaziz Ali"), el("span", "", "Khamis Arabia · Admin"));
      user.append(copy);
      if (expanded) {
        const sort = icon("sort", "inline");
        if (sort) user.append(sort);
      }
      foot.append(user);

      crumb.textContent = sub ? `${page} › ${sub}` : "Hala Business";
      title.textContent = sub || page;
      sheetTitle.textContent = sub || page;
      sheetBar.replaceChildren();
      const menu = button("nv-icon-btn", "", () => { drawer = true; restore = "close-menu"; paint(); }, "open-menu");
      menu.dataset.sunken = "true";
      menu.setAttribute("aria-label", "Open menu");
      menu.setAttribute("aria-expanded", drawer ? "true" : "false");
      const menuIcon = icon("menu");
      if (menuIcon) menu.append(menuIcon);
      sheetBar.append(menu, logo(true), avatar("AA"));
      scrim.dataset.open = drawer ? "true" : "false";
      drawerEl.dataset.open = drawer ? "true" : "false";
      drawerEl.inert = !drawer;
      scrim.onclick = () => { drawer = false; restore = "open-menu"; paint(); };
      const dHead = el("div", "nv-drawer-head");
      const close = button("nv-icon-btn", "", () => { drawer = false; restore = "open-menu"; paint(); }, "close-menu");
      close.dataset.sunken = "true";
      close.setAttribute("aria-label", "Close menu");
      const closeIcon = icon("close", "inline");
      if (closeIcon) close.append(closeIcon);
      dHead.append(logo(true), close);
      const dNav = el("nav", "nv-nav");
      sections().forEach((group) => {
        group.items.forEach((item) => {
          const row = button("nv-item", "", () => go(item.label, null, "open-menu"), `drawer-${item.label}`);
          const selected = page === item.label && !sub;
          row.dataset.on = selected ? "true" : "false";
          row.setAttribute("aria-current", selected ? "page" : "false");
          const glyph = icon(item.glyph);
          if (glyph) row.append(glyph);
          row.append(el("span", "nv-label", item.label));
          dNav.append(row);
        });
      });
      drawerEl.replaceChildren(dHead, dNav);
      if (restore) focusKey(root, restore);
      restore = "";
    }

    root.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !drawer) return;
      drawer = false;
      restore = "open-menu";
      paint();
    });
    paint();

    const states = el("div", "nv-states");
    [
      ["Default", "default", "Text secondary"],
      ["Hover", "hover", "Subtle fill"],
      ["Active", "active", "Mint fill + 3 px bar"],
      ["Focus", "focus", "Keyboard ring"],
      ["Pressed", "pressed", "Darker mint"],
      ["Disabled", "disabled", "No permission; tooltip says why"],
    ].forEach(([name, state, caption]) => {
      const card = el("div", "nv-state");
      const sample = el("div", "nv-item nv-demo");
      sample.dataset.state = state;
      sample.dataset.on = state === "active" ? "true" : "false";
      if (state === "disabled") sample.title = "You don't have permission to view Cards";
      const glyph = icon("cards");
      if (glyph) sample.append(glyph);
      sample.append(el("span", "nv-label", "Cards"));
      card.append(el("span", "", name), sample, el("p", "", caption));
      states.append(card);
    });
    root.append(toolbar, stage, states);
    return root;
  }

  function createNavMobileWeb() {
    const root = el("div", "nv-stack");
    let page = "Transfers";
    let sub = "Beneficiaries";
    const opened = { Transfers: true };
    const drawers = [false, false];
    let restore = "";
    const phones = el("div", "nv-phones");
    const variants = [
      ["A · drawer only", false, "Simplest. Everything lives in the drawer; good when people use one or two areas per visit."],
      ["B · drawer + bottom bar", true, "Four most used areas one tap away; Menu opens the same drawer for the rest. Recommended for daily users."],
    ];
    const tabs = [["Home", "Dashboard", "home"], ["Activity", "Transactions", "transactions"], ["Pay", "Transfers", "transfers"], ["Cards", "Cards", "cards"], ["Menu", null, "menu"]];

    function go(next, nextSub, key) {
      page = next;
      sub = nextSub || null;
      drawers[0] = false;
      drawers[1] = false;
      restore = key || "";
      paint();
    }

    const frames = variants.map((spec, index) => {
      const card = el("div", "nv-phone-card");
      const header = el("header");
      header.append(el("h3", "", spec[0]), live("Live · tap menu"));
      const phone = el("div", "nv-phone");
      phone.dataset.index = String(index);
      card.append(header, phone, el("p", "nv-note", spec[2]));
      phones.append(card);
      return phone;
    });

    function paint() {
      frames.forEach((phone, index) => {
        const bottom = variants[index][1];
        const open = drawers[index];
        phone.replaceChildren();
        phone.append(el("span", "nv-url", "business.hala.com"));
        const bar = el("div", "nv-top");
        const menu = button("nv-icon-btn", "", () => { drawers[index] = true; restore = `close-${index}`; paint(); }, `open-${index}`);
        menu.setAttribute("aria-label", "Open menu");
        menu.setAttribute("aria-expanded", open ? "true" : "false");
        const menuIcon = icon("menu", "nav");
        if (menuIcon) menu.append(menuIcon);
        const bell = el("span", "nv-bell");
        const bellIcon = icon("notifications");
        if (bellIcon) bell.append(bellIcon);
        bell.append(el("i", "nv-dot"));
        bar.append(menu, el("strong", "", sub || page), bell, avatar("AA"));
        const body = el("div", "nv-phone-body");
        body.append(el("span", "nv-crumb", sub ? `${page} › ${sub}` : "Hala Business"));
        body.append(el("span", "nv-bone"), el("span", "nv-bone nv-short"), el("span", "nv-bone nv-short"), el("span", "nv-bone nv-short"));
        phone.append(bar, body);
        if (bottom) {
          const nav = el("nav", "nv-tabs");
          nav.setAttribute("aria-label", "Primary");
          tabs.forEach(([label, dest, glyph]) => {
            const on = Boolean(dest && page === dest);
            const tab = button("nv-tab", "", () => {
              if (!dest) { drawers[index] = true; restore = `close-${index}`; paint(); return; }
              go(dest, null, `tab-${index}-${label}`);
            }, `tab-${index}-${label}`);
            tab.dataset.on = on ? "true" : "false";
            tab.setAttribute("aria-current", on ? "page" : "false");
            const wrap = el("span", "nv-tab-icon");
            const mark = icon(glyph, "inline", on);
            if (mark) wrap.append(mark);
            tab.append(wrap, el("span", "", label));
            nav.append(tab);
          });
          phone.append(nav);
        }
        const scrim = el("div", "nv-scrim");
        scrim.dataset.open = open ? "true" : "false";
        scrim.addEventListener("click", () => { drawers[index] = false; restore = `open-${index}`; paint(); });
        const drawer = el("div", "nv-drawer");
        drawer.dataset.open = open ? "true" : "false";
        drawer.inert = !open;
        drawer.setAttribute("role", "dialog");
        drawer.setAttribute("aria-label", "Menu");
        const dHead = el("div", "nv-drawer-head");
        const close = button("nv-icon-btn", "", () => { drawers[index] = false; restore = `open-${index}`; paint(); }, `close-${index}`);
        close.dataset.sunken = "true";
        close.setAttribute("aria-label", "Close menu");
        const closeIcon = icon("close", "inline");
        if (closeIcon) close.append(closeIcon);
        dHead.append(logo(true), close);
        const account = el("div", "nv-account");
        account.append(el("span", "nv-mark", "K"));
        const who = el("div", "nv-user-copy");
        who.append(el("strong", "", "Khamis Arabia Trading"), el("span", "", "SA •• 1951"));
        account.append(who);
        const chev = icon("expand", "inline");
        if (chev) { chev.classList.add("nv-chev"); account.append(chev); }
        const search = el("div", "nv-drawer-search");
        const searchIcon = icon("search", "inline");
        if (searchIcon) search.append(searchIcon);
        search.append(document.createTextNode("Search"));
        const nav = el("nav", "nv-nav");
        sections().forEach((group) => {
          const block = el("div", "nv-group");
          block.append(el("span", "nv-kicker", group.label));
          group.items.forEach((item) => {
            const on = page === item.label;
            const isOpen = item.kids && opened[item.label];
            const selected = on && !sub;
            const row = button("nv-item", "", () => {
              if (item.kids) { opened[item.label] = !opened[item.label]; restore = `m-${index}-${item.label}`; paint(); return; }
              go(item.label, null, `open-${index}`);
            }, `m-${index}-${item.label}`);
            row.dataset.on = selected ? "true" : "false";
            row.dataset.section = on ? "true" : "false";
            if (selected) row.setAttribute("aria-current", "page");
            const glyph = icon(item.glyph);
            if (glyph) row.append(glyph);
            row.append(el("span", "nv-label", item.label));
            if (item.badge) row.append(el("span", "nv-count", item.badge));
            if (item.kids) {
              row.setAttribute("aria-expanded", isOpen ? "true" : "false");
              const mark = icon("expand", "inline");
              if (mark) { mark.classList.add("nv-chev"); row.append(mark); }
            }
            block.append(row);
            if (item.kids) {
              const kids = el("div", "nv-kids");
              kids.dataset.open = isOpen ? "true" : "false";
              const clip = el("div", "nv-kids-clip");
              item.kids.forEach((name) => {
                const active = on && sub === name;
                const child = button("nv-sub", name, () => go(item.label, name, `open-${index}`), `ms-${index}-${name}`);
                child.dataset.on = active ? "true" : "false";
                if (active) child.setAttribute("aria-current", "page");
                clip.append(child);
              });
              kids.append(clip);
              if (!isOpen) kids.inert = true;
              block.append(kids);
            }
          });
          nav.append(block);
        });
        const sign = el("div", "nv-signout");
        const out = icon("sign-out", "inline");
        if (out) sign.append(out);
        sign.append(avatar("AA"), el("span", "", "Abdulaziz Ali · Admin"), el("span", "", "Sign out"));
        drawer.append(dHead, account, search, nav, sign);
        phone.append(scrim, drawer);
      });
      if (restore) focusKey(root, restore);
      restore = "";
    }

    root.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const index = drawers.findIndex(Boolean);
      if (index < 0) return;
      drawers[index] = false;
      restore = `open-${index}`;
      paint();
    });
    paint();

    const specs = el("div", "nv-specs");
    [
      ["Breakpoint", "≤ 767 px: drawer. 768–1023 px: collapsed rail. ≥ 1024 px: full sidebar."],
      ["Top bar", "56 px, white. Menu 44 px left, page title, bell and avatar right."],
      ["Drawer", "86% width, max 320 px. Slides from the start edge. Scrim closes it."],
      ["Rows", "48 px items, 44 px sub-items. Same groups and order as desktop."],
      ["Closing", "Closes on item tap, scrim tap, close, or Escape. Focus returns to the menu button."],
      ["Bottom bar", "Optional, 4 areas + Menu. Hidden while typing so the keyboard has room."],
    ].forEach(([name, text]) => {
      const spec = el("div", "nv-spec");
      spec.append(el("strong", "", name), el("p", "", text));
      specs.append(spec);
    });
    root.append(phones, specs);
    return root;
  }

  function createNavHeaders() {
    const root = el("div", "nv-stack");
    const grid = el("div", "nv-stack");

    let bell = false;
    let read = false;
    const app = el("div", "nv-panel");
    const appHead = el("header");
    const appCopy = el("div");
    appCopy.append(el("h3", "", "App header · 64 px"), el("p", "", "Page title, search, notifications, one primary action. Sticky; gets a border once you scroll."));
    appHead.append(appCopy, live());
    const bar = el("div", "nv-appbar");
    const id = el("div", "nv-id");
    id.append(el("span", "", "Pay › Transfers"), el("strong", "", "Transfers"));
    const search = el("span", "nv-search-btn");
    const searchIcon = icon("search", "inline");
    if (searchIcon) search.append(searchIcon);
    search.append(document.createTextNode("Search anything"), el("span", "nv-kbd", "⌘K"));
    const wrap = el("div", "nv-bell-wrap");
    const bellBtn = button("nv-icon-btn", "", () => { bell = !bell; paintBell(); });
    bellBtn.setAttribute("aria-label", "Notifications");
    const pop = el("div", "nv-pop");
    pop.hidden = true;
    function paintBell() {
      bellBtn.dataset.open = bell ? "true" : "false";
      bellBtn.setAttribute("aria-expanded", bell ? "true" : "false");
      bellBtn.replaceChildren();
      const glyph = icon("notifications");
      if (glyph) bellBtn.append(glyph);
      if (!read) bellBtn.append(el("span", "nv-count", "3"));
      pop.hidden = !bell;
      pop.replaceChildren();
      const head = el("header");
      const mark = button("nv-text-btn", "Mark all read", () => { read = true; paintBell(); });
      head.append(el("strong", "", "Notifications"), mark);
      pop.append(head);
      [
        ["Transfer needs approval", "Nour Trading · SAR 25,000"],
        ["Card frozen", "Operations •• 2086"],
        ["Statement ready", "September 2026"],
      ].forEach(([name, detail]) => {
        const row = el("div", "nv-note-row");
        row.dataset.unread = read ? "false" : "true";
        const copy = el("div");
        copy.append(el("strong", "", name), el("span", "", detail));
        row.append(el("i", "nv-pip"), copy);
        pop.append(row);
      });
    }
    wrap.append(bellBtn, pop);
    const cluster = el("div", "nv-cluster");
    cluster.append(search, wrap, el("span", "nv-primary", "New transfer"));
    bar.append(id, cluster);
    app.append(appHead, bar);
    paintBell();
    app.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && bell) { bell = false; paintBell(); bellBtn.focus(); }
    });
    document.addEventListener("click", (event) => {
      if (!bell || wrap.contains(event.target)) return;
      bell = false;
      paintBell();
    });

    let mega = false;
    const market = el("div", "nv-panel");
    const marketHead = el("header");
    const marketCopy = el("div");
    marketCopy.append(el("h3", "", "Marketing header · 72 px"), el("p", "", "Logo, 4–5 links, sign in and one call to action. Products open a mega menu."));
    marketHead.append(marketCopy, live("Live · hover Products"));
    const frame = el("div", "nv-market");
    const mbar = el("div", "nv-mbar");
    const links = el("nav", "nv-links");
    const products = [
      ["Business account", "IBAN in minutes", "cards"],
      ["POS terminals", "Smart, Mini, Tap on Phone", "pos"],
      ["eCommerce", "Online checkout", "ecommerce"],
      ["Transfers", "Local and international", "transfers"],
      ["Payroll", "WPS compliant", "users"],
      ["Invoicing", "Payment links", "receipt"],
    ];
    const menu = el("div", "nv-mega");
    function paintMega() {
      links.querySelector("[data-key='products']").setAttribute("aria-expanded", mega ? "true" : "false");
      menu.hidden = !mega;
    }
    [["Products", true], ["Pricing", false], ["Business", false], ["Help", false]].forEach(([label, dropdown]) => {
      const link = button("nv-link", label, (event) => {
        if (!dropdown || event.detail !== 0) return;
        mega = !mega;
        paintMega();
      }, dropdown ? "products" : "");
      if (dropdown) {
        link.setAttribute("aria-expanded", "false");
        link.setAttribute("aria-haspopup", "true");
        const chev = icon("expand", "inline");
        if (chev) link.append(chev);
        link.addEventListener("mouseenter", () => { mega = true; paintMega(); });
      }
      links.append(link);
    });
    products.forEach(([name, detail, glyph]) => {
      const prod = el("div", "nv-prod");
      const tile = el("span", "nv-prod-icon");
      const mark = icon(glyph);
      if (mark) tile.append(mark);
      const copy = el("div");
      copy.append(el("strong", "", name), el("span", "", detail));
      prod.append(tile, copy);
      menu.append(prod);
    });
    const feature = el("div", "nv-feature");
    feature.append(el("em", "", "New"), el("strong", "", "Tap on Phone"), el("span", "", "Accept cards on any Android phone. No terminal needed."));
    menu.append(feature);
    menu.hidden = true;
    mbar.append(logo(true), links, el("span", "nv-secondary", "Sign in"), el("span", "nv-primary", "Open an account"));
    frame.append(mbar, menu);
    frame.addEventListener("mouseleave", () => { mega = false; paintMega(); });
    frame.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mega) { mega = false; paintMega(); links.querySelector("[data-key='products']").focus(); }
    });
    market.append(marketHead, frame);

    const flow = el("div", "nv-panel");
    const flowCopy = el("div");
    flowCopy.append(el("h3", "", "Flow header · 72 px"), el("p", "", "Onboarding, POS order, card request. No navigation; only close, steps and help."));
    const flowBar = el("div", "nv-flow");
    const close = el("span", "nv-close");
    const closeIcon = icon("close", "inline");
    if (closeIcon) close.append(closeIcon);
    const steps = el("div", "nv-steps");
    [true, true, false, false].forEach((on) => {
      const step = el("span", "nv-step");
      if (on) step.dataset.on = "true";
      steps.append(step);
    });
    flowBar.append(close, el("strong", "", "Order POS"), steps, el("span", "nv-quiet", "Need help?"));
    flow.append(flowCopy, flowBar, el("p", "nv-note", "Close asks to confirm if anything was entered. Progress shows steps without labels when space is tight."));

    let tab = "Overview";
    const tabsCard = el("div", "nv-panel");
    const tabsCopy = el("div");
    tabsCopy.append(el("h3", "", "Section tabs · under the header"), el("p", "", "For sibling views of one object, like a card's details."));
    const tablist = el("div", "nv-section-tabs");
    tablist.setAttribute("role", "tablist");
    const tabButtons = [["Overview"], ["Transactions", "38"], ["Limits"], ["Settings"]].map(([label, count]) => {
      const node = button("", label, () => { tab = label; paintTabs(); });
      node.dataset.label = label;
      node.setAttribute("role", "tab");
      if (count) node.append(el("span", "nv-pill", count));
      tablist.append(node);
      return node;
    });
    function paintTabs() {
      tabButtons.forEach((node) => {
        node.setAttribute("aria-selected", node.dataset.label === tab ? "true" : "false");
      });
    }
    paintTabs();
    tabsCard.append(tabsCopy, tablist, el("p", "nv-note", "Ink underline 2 px for the active tab. Scrolls sideways on narrow screens."));

    grid.append(app, market, flow, tabsCard);
    root.append(grid);
    return root;
  }

  function createNavFooters() {
    const root = el("div", "nv-stack");
    const footer = el("footer", "nv-footer");
    const top = el("div", "nv-footer-top");
    const brand = el("div", "nv-brand");
    brand.append(logo(true), el("p", "", "Business banking, payments and POS for Saudi companies."));
    const social = el("div", "nv-social");
    [["LinkedIn", "linkedin"], ["X", "x"], ["Instagram", "instagram"]].forEach(([label, name]) => {
      const item = el("span");
      item.setAttribute("aria-label", label);
      item.setAttribute("role", "img");
      const glyph = icon(name);
      if (glyph) item.append(glyph);
      social.append(item);
    });
    brand.append(social);
    top.append(brand);
    [
      ["Products", ["Business account", "POS terminals", "Cards", "Payroll"]],
      ["Company", ["About", "Careers", "Press", "Contact"]],
      ["Resources", ["Help center", "Pricing", "API docs", "Status"]],
      ["Legal", ["Terms", "Privacy", "Complaints", "Security"]],
    ].forEach(([heading, links]) => {
      const col = el("div", "nv-col");
      col.append(el("strong", "", heading));
      links.forEach((link) => col.append(el("span", "", link)));
      top.append(col);
    });
    const legal = el("div", "nv-legal");
    legal.append(
      el("span", "", "© 2026 Hala. Licensed by the Saudi Central Bank (SAMA). CR 1010000000 · VAT 300000000000003. Placeholder details, replace before launch."),
      el("span", "", "English · العربية"),
    );
    footer.append(top, legal);

    const slimCard = el("div", "nv-panel");
    const slimCopy = el("div");
    slimCopy.append(el("h3", "", "App footer · 48 px"), el("p", "", "Bottom of long app pages. Legal links and status only."));
    const slim = el("div", "nv-slim");
    const status = el("span", "nv-status");
    status.append(el("i"), document.createTextNode("All systems normal"));
    const inline = el("div", "nv-links-inline");
    inline.append(el("span", "", "Terms"), el("span", "", "Privacy"), el("span", "", "© 2026 Hala"));
    slim.append(status, inline);
    slimCard.append(slimCopy, slim);

    const stickyCard = el("div", "nv-panel");
    const stickyCopy = el("div");
    stickyCopy.append(el("h3", "", "Sticky action footer · 72 px"), el("p", "", "Forms and drawers. Appears when there are unsaved changes."));
    const sticky = el("div", "nv-sticky");
    const dirty = el("span", "nv-dirty");
    dirty.append(el("i"), document.createTextNode("2 unsaved changes"));
    sticky.append(dirty, el("span", "nv-grow"), el("span", "nv-secondary", "Discard"), el("span", "nv-primary", "Save changes"));
    stickyCard.append(stickyCopy, sticky);
    const pair = el("div", "nv-cards-2");
    pair.append(slimCard, stickyCard);
    root.append(footer, pair);
    return root;
  }

  function createNavMobile() {
    const root = el("div", "nv-stack");
    const phoneCard = el("div", "nv-phone-card");
    const header = el("header");
    header.append(el("h3", "", "Tab bar + large title"), live("Live · tap tabs"));
    const phone = el("div", "nv-phone nv-app-phone");
    let tab = "Cards";
    const blocks = {
      Home: ["150", "90", "180"],
      Cards: ["200", "70", "70"],
      Pay: ["120", "120", "120"],
      POS: ["90", "220"],
      More: ["300"],
    };
    const items = [["Home", "home", ""], ["Cards", "cards", ""], ["Pay", "transfers", ""], ["POS", "pos", ""], ["More", "menu", "2"]];
    const scroller = el("div", "nv-phone-body");
    function paint() {
      scroller.replaceChildren(el("div", "nv-large", tab));
      const list = el("div", "nv-blocks");
      blocks[tab].forEach((size) => {
        const block = el("span", "nv-block");
        block.style.height = size === "300" ? "calc(var(--space-14) * 5 + var(--space-5))"
          : size === "220" ? "calc(var(--space-14) * 4)"
          : size === "200" ? "calc(var(--space-14) * 3 + var(--space-8))"
          : size === "180" ? "calc(var(--space-14) * 3 + var(--space-3))"
          : size === "150" ? "calc(var(--space-14) * 2 + var(--space-10))"
          : size === "120" ? "calc(var(--space-14) * 2 + var(--space-2))"
          : size === "90" ? "calc(var(--space-14) + var(--space-8))"
          : "calc(var(--space-14) + var(--space-3))";
        list.append(block);
      });
      scroller.append(list);
      const nav = phone.querySelector(".nv-tabs");
      if (!nav) return;
      [...nav.children].forEach((node) => {
        const on = node.dataset.label === tab;
        node.dataset.on = on ? "true" : "false";
        node.setAttribute("aria-current", on ? "page" : "false");
        const glyph = node.querySelector(".hala-icon");
        if (glyph) glyph.dataset.active = on ? "true" : "false";
      });
    }
    const nav = el("nav", "nv-tabs");
    nav.setAttribute("aria-label", "App");
    items.forEach(([label, glyph, count]) => {
      const node = button("nv-tab", "", () => {
        if (tab === label) scroller.scrollTop = 0;
        tab = label;
        paint();
      });
      node.dataset.label = label;
      const wrap = el("span", "nv-tab-icon");
      const mark = icon(glyph, "inline", label === tab);
      if (mark) wrap.append(mark);
      node.append(wrap, el("span", "", label));
      if (count) node.append(el("span", "nv-count", count));
      nav.append(node);
    });
    phone.append(scroller, nav);
    paint();
    phoneCard.append(header, phone, el("p", "nv-note", "5 tabs max, icon + label always. Active: mint pill + filled weight. Tapping the active tab scrolls to top."));

    const bars = el("div", "nv-panel");
    bars.append(el("h3", "", "Top bars"));
    const list = el("div", "nv-topbars");
    [
      ["iOS · pushed screen", false, "start", "previous", "Cards", "Marketing card", "Edit"],
      ["Android · pushed screen", false, "start-title", "back", "", "Marketing card", "more"],
      ["Modal / sheet", false, "center", "", "Cancel", "New card", "Next"],
      ["Flow with progress", false, "center", "close", "", "Step 2 of 3", "Help"],
      ["Over a dark hero", true, "center", "previous", "", "Card details", ""],
    ].forEach(([caption, ink, align, glyph, back, title, end]) => {
      const card = el("div", "nv-topbar-card");
      const bar = el("div", "nv-topbar");
      if (ink) bar.dataset.ink = "true";
      if (align === "start-title") bar.dataset.align = "start";
      const start = el("span", "nv-side-slot");
      if (glyph) {
        const mark = icon(glyph, "inline");
        if (mark) start.append(mark);
      }
      if (back) start.append(document.createTextNode(back));
      const ending = el("span", "nv-end");
      if (end === "more") {
        const mark = icon("more");
        if (mark) ending.append(mark);
      } else if (end) ending.textContent = end;
      bar.append(start, el("strong", "", title), ending);
      card.append(bar, el("span", "", caption));
      list.append(card);
    });
    bars.append(list);

    const more = el("div", "nv-panel");
    more.append(el("h3", "", "More screen · everything else"));
    const sheet = el("div", "nv-more");
    sheet.append(el("h3", "", "More"));
    const account = el("div", "nv-account");
    account.append(el("span", "nv-mark", "K"));
    const who = el("div", "nv-user-copy");
    who.append(el("strong", "", "Khamis Arabia Trading"), el("span", "", "CR 2346041544"));
    account.append(who, el("span", "nv-switch", "Switch"));
    sheet.append(account);
    [
      ["Business", [["Payroll", "users"], ["Invoicing", "receipt"], ["eCommerce", "ecommerce"]]],
      ["Account", [["Settings", "settings"], ["Notifications", "notifications"]]],
      ["Support", [["Help and chat", "help"]]],
    ].forEach(([heading, rows]) => {
      const group = el("div", "nv-group-list");
      group.append(el("span", "", heading));
      const box = el("div", "nv-rows");
      rows.forEach(([label, glyph]) => {
        const row = el("div", "nv-row");
        const mark = icon(glyph);
        if (mark) row.append(mark);
        row.append(el("span", "", label));
        box.append(row);
      });
      group.append(box);
      sheet.append(group);
    });
    more.append(sheet, el("p", "nv-note", "No hamburger drawer in the app. Secondary areas live here in grouped lists, account switch on top."));
    root.append(phoneCard, bars, more);
    return root;
  }

  function createNavGuide() {
    const root = el("div", "nv-stack");
    const table = el("div");
    const head = el("div", "nv-which");
    ["Context", "Web", "Mobile", "Notes"].forEach((label) => head.append(el("span", "", label)));
    table.append(head);
    [
      ["Hala Business app", "Sidebar + app header", "Tab bar + top bar + More", "Sidebar collapses to rail; drawer below 1024 px"],
      ["Marketing site", "Marketing header + full footer", "Header with menu sheet", "Products in a mega menu"],
      ["Task flow", "Flow header, no sidebar", "Top bar with close + progress", "Remove all other navigation"],
      ["Object detail", "Breadcrumb + section tabs", "Back + segmented or list", "Tabs for sibling views only"],
      ["Forms", "Sticky action footer", "Primary button above keyboard", "Appears with unsaved changes"],
      ["Long app page", "Slim app footer", "None", "Legal links and status only"],
    ].forEach(([context, web, mobile, notes]) => {
      const row = el("div", "nv-wrow");
      row.append(el("strong", "", context), el("span", "", web), el("span", "", mobile), el("span", "", notes));
      table.append(row);
    });
    const rules = el("div", "nv-rules");
    [
      [true, "Keep labels identical across sidebar, tab bar, page titles and breadcrumbs."],
      [true, "Show where you are: active fill + bar on web, mint pill on mobile."],
      [true, "Group sidebar items by job (Pay, Accept payments, Manage) with mono captions."],
      [true, "Tooltips on every item in the collapsed rail."],
      [true, "One primary action in the header, on the right."],
      [true, "Tab bar: 5 items max with icon and label."],
      [false, "Don't use a hamburger menu in the mobile app."],
      [false, "Don't nest more than one level in the sidebar."],
      [false, "Don't show app navigation inside task flows."],
      [false, "Don't hide the account switcher; it belongs on top of More and in the sidebar footer."],
    ].forEach(([ok, text]) => {
      const rule = el("div", "nv-rule");
      rule.dataset.ok = ok ? "true" : "false";
      rule.append(el("i", "", ok ? "✓" : "×"), el("p", "", text));
      rules.append(rule);
    });
    root.append(table, rules);
    return root;
  }

  window.createNavSidebar = createNavSidebar;
  window.createNavMobileWeb = createNavMobileWeb;
  window.createNavHeaders = createNavHeaders;
  window.createNavFooters = createNavFooters;
  window.createNavMobile = createNavMobile;
  window.createNavGuide = createNavGuide;
})();
