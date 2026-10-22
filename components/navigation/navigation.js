/**
 * Navigation and app shell. Load vendor/hala-icons.js, components/button/button.js,
 * components/button-groups/button-groups.js and components/tabs/tabs.js, then this script.
 *
 * createNavShell({ locale })          Web app shell: Sidebar, Web top bar and the page.
 *                                     Desktop shows the 272 sidebar, Tablet the 80 rail.
 * createNavWebTopBar({ locale })      72 tall bar: search, account switcher, notifications, avatar.
 * createNavMobile({ locale, controls }) Phone app shell: status bar, Mobile top bar, Tab bar.
 * createNavTopBars()                  Mobile top bar types for iOS and Android.
 * createNavStates()                   Sidebar item, Tab bar item and large title states.
 * createNavMobileWeb()
 * createNavHeaders()
 * createNavFooters()
 * createNavGuide()
 *
 * locale is "en" or "ar". Arabic must sit inside dir="rtl" lang="ar".
 * In the web shell, G then a letter jumps to a main item (G D, G T, G S, G P, G C).
 * Escape closes drawers, menus and the notifications panel.
 */
(function () {
  const WORDMARK = "../media/type=full, color=brand.svg";
  const SYMBOL = "../media/type=short, color=brand.svg";
  const NAMES = {
    dashboard: "category",
    transactions: "arrow-swap-horizontal",
    transfers: "send",
    payroll: "calendar",
    cards: "credit-card",
    sadad: "receipt",
    pos: "smartphone",
    invoicing: "file-text",
    locations: "map-pin",
    team: "people",
    help: "circle-help",
    settings: "settings",
    home: "home",
    payments: "send",
    inbox: "bell",
    search: "search-normal",
    notifications: "notifications",
    close: "close",
    expand: "chevron-down",
    previous: "chevron-left",
    next: "chevron-right",
    back: "arrow-left",
    sidebar: "panel-left",
    more: "ellipsis-vertical",
    "sign-out": "log-out",
    menu: "menu",
    ecommerce: "shopping-cart",
    users: "users",
    receipt: "receipt",
    linkedin: "linkedin",
    x: "x",
    instagram: "instagram",
  };
  const MIRROR = new Set(["arrow-left", "arrow-right", "chevron-left", "chevron-right", "send", "log-out", "panel-left", "arrow-swap-horizontal"]);

  const SIDEBAR = [
    { id: "dashboard", group: "main", key: "G D", en: "Dashboard", ar: "لوحة التحكم",
      enNote: "Balances, sales and what needs your attention.", arNote: "الأرصدة والمبيعات وما يحتاج إلى انتباهك.",
      enAction: "New transfer", arAction: "تحويل جديد" },
    { id: "transactions", group: "main", key: "G T", count: "4", en: "Transactions", ar: "العمليات",
      enNote: "Every payment in and out, with filters and export.", arNote: "كل المدفوعات الواردة والصادرة مع التصفية والتصدير." },
    { id: "transfers", group: "main", key: "G S", en: "Transfers", ar: "التحويلات",
      enNote: "Send money, schedule payouts and track approvals.", arNote: "أرسل الأموال وجدول الدفعات وتابع الموافقات.",
      enAction: "New transfer", arAction: "تحويل جديد" },
    { id: "payroll", group: "main", key: "G P", en: "Payroll", ar: "الرواتب",
      enNote: "Pay your team through WPS.", arNote: "ادفع رواتب فريقك عبر نظام حماية الأجور.",
      enAction: "Run payroll", arAction: "تشغيل الرواتب" },
    { id: "cards", group: "main", key: "G C", en: "Cards", ar: "البطاقات",
      enNote: "Corporate and purchase cards, limits and spend.", arNote: "بطاقات الشركة والمشتريات وحدودها والإنفاق.",
      enAction: "Request card", arAction: "طلب بطاقة" },
    { id: "sadad", group: "business", en: "SADAD", ar: "سداد",
      enNote: "Pay government and utility bills.", arNote: "ادفع الفواتير الحكومية وفواتير الخدمات.",
      enAction: "Pay a bill", arAction: "دفع فاتورة" },
    { id: "pos", group: "business", count: "4", en: "POS terminals", ar: "نقاط البيع",
      enNote: "Terminals, orders and settlements.", arNote: "الأجهزة والطلبات والتسويات.",
      enAction: "Order POS", arAction: "طلب جهاز" },
    { id: "invoicing", group: "business", en: "Invoicing", ar: "الفواتير",
      enNote: "Create invoices and payment links.", arNote: "أنشئ الفواتير وروابط الدفع.",
      enAction: "New invoice", arAction: "فاتورة جديدة" },
    { id: "locations", group: "business", en: "Locations", ar: "الفروع",
      enNote: "Branches and their terminals.", arNote: "الفروع والأجهزة التابعة لها.",
      enAction: "Add location", arAction: "إضافة فرع" },
    { id: "team", group: "business", en: "Team", ar: "الفريق",
      enNote: "People, roles and permissions.", arNote: "الأشخاص والأدوار والصلاحيات.",
      enAction: "Invite member", arAction: "دعوة عضو" },
    { id: "help", group: "foot", en: "Help", ar: "المساعدة",
      enNote: "Guides and chat with support.", arNote: "الأدلة والمحادثة مع الدعم.",
      enAction: "Contact support", arAction: "تواصل مع الدعم" },
    { id: "settings", group: "foot", en: "Settings", ar: "الإعدادات",
      enNote: "Company profile, security and notifications.", arNote: "ملف الشركة والأمان والإشعارات." },
  ];

  const TABBAR = [
    { id: "home", en: "Home", ar: "الرئيسية" },
    { id: "cards", en: "Cards", ar: "البطاقات" },
    { id: "payments", en: "Payments", ar: "المدفوعات", count: "4" },
    { id: "inbox", en: "Inbox", ar: "الوارد", count: "4" },
  ];

  const COPY = {
    en: {
      lang: "en", sidebar: "Hala Business", search: "Search or jump to…", company: "Khamis Arabia Trading", role: "Admin",
      initials: "KA", user: "MA", userName: "Mona Alharbi", business: "Business", home: "Home", export: "Export",
      tabs: ["Overview", "Activity", "Settings"], collapse: "Collapse sidebar", expand: "Expand sidebar",
      notifications: "Notifications", switcher: "Switch account", desktop: "Desktop · 272", tablet: "Tablet · 80 rail",
      breakpoint: "Breakpoint", back: "Back", close: "Close", done: "Done", tabbar: "App", time: "9:41",
      markRead: "Mark all read", alerts: [["Transfer needs approval", "Nour Trading · today"], ["Card frozen", "Operations •• 2086"], ["Statement ready", "September 2026"]],
    },
    ar: {
      lang: "ar", sidebar: "حلا للأعمال", search: "ابحث أو انتقل إلى…", company: "خميس العربية للتجارة", role: "مسؤول",
      initials: "KA", user: "MA", userName: "منى الحربي", business: "الأعمال", home: "الرئيسية", export: "تصدير",
      tabs: ["نظرة عامة", "النشاط", "الإعدادات"], collapse: "طي الشريط الجانبي", expand: "توسيع الشريط الجانبي",
      notifications: "الإشعارات", switcher: "تبديل الحساب", desktop: "سطح المكتب · 272", tablet: "الجهاز اللوحي · 80",
      breakpoint: "نقطة التوقف", back: "رجوع", close: "إغلاق", done: "تم", tabbar: "التطبيق", time: "9:41",
      markRead: "تحديد الكل كمقروء", alerts: [["تحويل بانتظار الموافقة", "نور للتجارة · اليوم"], ["تم تجميد البطاقة", "العمليات •• 2086"], ["الكشف جاهز", "سبتمبر 2026"]],
    },
  };

  function copy(locale) {
    return COPY[locale === "ar" ? "ar" : "en"];
  }

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size, active) {
    const iconSet = window.halaIcons;
    const kebab = NAMES[name] || name;
    if (!iconSet || !kebab || !iconSet.icons[pascal(kebab)]) return null;
    const svg = iconSet.createElement(iconSet.icons[pascal(kebab)]);
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

  function avatar(text, size) {
    const node = el("span", "nv-avatar", text);
    if (size) node.dataset.size = size;
    return node;
  }

  function button(className, label, onClick, key) {
    const node = el("button", className);
    node.type = "button";
    if (key) node.dataset.key = key;
    if (onClick) node.addEventListener("click", onClick);
    if (label) node.append(document.createTextNode(label));
    return node;
  }

  function iconButton(name, label, onClick, key) {
    const node = button("nv-icon-btn", "", onClick, key);
    node.setAttribute("aria-label", label);
    node.title = label;
    const glyph = icon(name);
    if (glyph) node.append(glyph);
    return node;
  }

  function counter(value, kind) {
    const node = el("span", kind === "alert" ? "nv-count" : "nv-pill", value);
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function focusKey(root, key) {
    if (!key) return;
    const node = root.querySelector(`[data-key="${CSS.escape(key)}"]`);
    if (node) node.focus();
  }

  function modeBar(modes, current, onPick, label) {
    const bar = el("div", "nv-modes");
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", label);
    modes.forEach(([id, text]) => {
      const tab = button("nv-mode", text, () => onPick(id), `mode-${id}`);
      tab.setAttribute("aria-pressed", id === current ? "true" : "false");
      tab.dataset.on = id === current ? "true" : "false";
      bar.append(tab);
    });
    return bar;
  }

  function paintModes(bar, current) {
    bar.querySelectorAll(".nv-mode").forEach((tab) => {
      const on = tab.dataset.key === `mode-${current}`;
      tab.dataset.on = on ? "true" : "false";
      tab.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* Sidebar item: icon, label, counter and shortcut. Rail shows the icon, a red counter and a tooltip. */
  function sideItem(entry, t, rail, on, onClick, state) {
    const label = entry[t.lang];
    const row = button("nv-item", "", onClick, `side-${entry.id}`);
    row.dataset.on = on ? "true" : "false";
    if (on) row.setAttribute("aria-current", "page");
    if (state) {
      row.dataset.state = state;
      row.tabIndex = -1;
      if (state === "disabled") row.setAttribute("aria-disabled", "true");
    }
    const glyph = icon(entry.id);
    if (glyph) row.append(glyph);
    if (rail) {
      row.dataset.tip = label;
      row.setAttribute("aria-label", entry.count ? `${label}, ${entry.count}` : label);
      if (entry.count) row.append(counter(entry.count, "alert"));
    } else {
      row.append(el("span", "nv-label", label));
      if (entry.count) row.append(counter(entry.count));
      if (entry.key) {
        const keys = el("span", "nv-shortcut", entry.key);
        keys.setAttribute("aria-hidden", "true");
        row.append(keys);
      }
    }
    return row;
  }

  /* Web top bar: search at the start; account switcher, notifications and avatar at the end. */
  function createNavWebTopBar(options = {}) {
    const t = copy(options.locale);
    const bar = el("header", "nv-webbar");
    const search = button("nv-websearch", "", null, "search");
    search.setAttribute("aria-label", `${t.search} ⌘K`);
    const glyph = icon("search", "inline");
    if (glyph) search.append(glyph);
    search.append(el("span", "nv-placeholder", t.search));
    const keycap = el("kbd", "nv-keycap", "⌘K");
    keycap.setAttribute("aria-hidden", "true");
    search.append(keycap);

    const actions = el("div", "nv-webbar-actions");
    const switcher = button("nv-switcher", "", null, "switcher");
    switcher.setAttribute("aria-label", `${t.switcher}: ${t.company}`);
    switcher.append(el("span", "nv-label", t.company));
    const chev = icon("expand", "inline");
    if (chev) switcher.append(chev);

    let open = false;
    let read = false;
    const wrap = el("div", "nv-bell-wrap");
    const bell = iconButton("notifications", t.notifications, () => { open = !open; paint(); }, "bell");
    bell.setAttribute("aria-haspopup", "dialog");
    const dot = el("i", "nv-dot");
    dot.setAttribute("aria-hidden", "true");
    bell.append(dot);
    const pop = el("div", "nv-pop");
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", t.notifications);

    function paint() {
      bell.dataset.open = open ? "true" : "false";
      bell.setAttribute("aria-expanded", open ? "true" : "false");
      dot.hidden = read;
      pop.hidden = !open;
      pop.replaceChildren();
      const head = el("header");
      head.append(el("strong", "", t.notifications), button("nv-text-btn", t.markRead, () => { read = true; paint(); }));
      pop.append(head);
      t.alerts.forEach(([name, detail]) => {
        const row = el("div", "nv-note-row");
        row.dataset.unread = read ? "false" : "true";
        const text = el("div");
        text.append(el("strong", "", name), el("span", "", detail));
        row.append(el("i", "nv-pip"), text);
        pop.append(row);
      });
    }
    wrap.append(bell, pop);
    wrap.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !open) return;
      event.stopPropagation();
      open = false;
      paint();
      bell.focus();
    });
    document.addEventListener("click", (event) => {
      if (!open || wrap.contains(event.target)) return;
      open = false;
      paint();
    });
    paint();

    actions.append(switcher, wrap, avatar(t.user, "md"));
    bar.append(search, actions);
    return bar;
  }

  function createNavShell(options = {}) {
    const t = copy(options.locale);
    const root = el("div", "nv-stack");
    let mode = "desktop";
    let page = "dashboard";
    let restore = "";
    let pending = 0;

    const toolbar = el("div", "nv-toolbar");
    const modes = modeBar([["desktop", t.desktop], ["tablet", t.tablet]], mode, (id) => {
      mode = id;
      restore = `mode-${id}`;
      paint();
    }, t.breakpoint);
    toolbar.append(live(t.lang === "ar" ? "مباشر" : "Live · G then D, T, S, P or C"), modes);

    const stage = el("div", "nv-stage");
    const side = el("aside", "nv-side");
    side.setAttribute("aria-label", t.sidebar);
    const main = el("div", "nv-main");
    const pageEl = el("div", "nv-page");
    main.append(createNavWebTopBar(options), pageEl);
    stage.append(side, main);

    function go(id, key) {
      page = id;
      restore = key || `side-${id}`;
      paint();
    }

    function paintSide() {
      const rail = mode === "tablet";
      side.replaceChildren();
      const head = el("div", "nv-head");
      if (rail) {
        const home = button("nv-logo-btn", "", () => { mode = "desktop"; restore = "collapse"; paint(); }, "expand");
        home.setAttribute("aria-label", t.expand);
        home.dataset.tip = t.expand;
        home.append(logo(false));
        head.append(home);
      } else {
        head.append(logo(true), iconButton("sidebar", t.collapse, () => { mode = "tablet"; restore = "expand"; paint(); }, "collapse"));
      }
      const nav = el("nav", "nv-nav");
      nav.setAttribute("aria-label", t.sidebar);
      const groups = [["main", ""], ["business", t.business]];
      groups.forEach(([group, title]) => {
        const block = el("div", "nv-group");
        if (title) {
          const kicker = el("span", "nv-kicker", rail ? "" : title);
          kicker.setAttribute("role", rail ? "separator" : "presentation");
          block.append(kicker);
        }
        SIDEBAR.filter((entry) => entry.group === group).forEach((entry) => {
          block.append(sideItem(entry, t, rail, entry.id === page, () => go(entry.id)));
        });
        nav.append(block);
      });
      const foot = el("div", "nv-group nv-foot-items");
      SIDEBAR.filter((entry) => entry.group === "foot").forEach((entry) => {
        foot.append(sideItem(entry, t, rail, entry.id === page, () => go(entry.id)));
      });
      const account = button("nv-account-row", "", null, "account");
      account.setAttribute("aria-label", `${t.switcher}: ${t.company}, ${t.role}`);
      if (rail) account.dataset.tip = t.company;
      account.append(avatar(t.initials, "sm"));
      if (!rail) {
        const who = el("span", "nv-user-copy");
        who.append(el("strong", "", t.company), el("span", "", t.role));
        account.append(who);
        const chev = icon("expand", "inline");
        if (chev) account.append(chev);
      }
      side.append(head, nav, el("span", "nv-spacer"), foot, account);
    }

    function paintPage() {
      const entry = SIDEBAR.find((item) => item.id === page) || SIDEBAR[0];
      pageEl.replaceChildren();
      const crumb = el("nav", "nv-crumb");
      crumb.setAttribute("aria-label", t.lang === "ar" ? "مسار التنقل" : "Breadcrumb");
      crumb.append(el("span", "", t.home));
      const sep = icon("next", "inline");
      if (sep) crumb.append(sep);
      const here = el("span", "", entry[t.lang]);
      here.setAttribute("aria-current", "page");
      crumb.append(here);
      const header = el("div", "nv-page-head");
      const titles = el("div", "nv-page-titles");
      titles.append(el("h3", "nv-title", entry[t.lang]), el("p", "nv-page-note", entry[`${t.lang}Note`]));
      const actions = el("div", "nv-page-actions");
      if (window.createButton) {
        actions.append(createButton({ label: t.export, variant: "secondary", size: "md" }));
        const action = entry[`${t.lang}Action`];
        if (action) actions.append(createButton({ label: action, variant: "primary", size: "md" }));
      }
      header.append(titles, actions);
      pageEl.append(crumb, header);
      if (window.createTabs) pageEl.append(createTabs({ label: entry[t.lang], options: t.tabs, value: t.tabs[0] }));
      const table = el("div", "nv-table");
      for (let index = 0; index < 4; index += 1) {
        const row = el("div", "nv-table-row");
        row.append(el("span", "nv-bone", ""), el("span", "nv-bone", ""), el("span", "nv-bone", ""), el("span", "nv-bone nv-chip", ""), el("span", "nv-bone", ""));
        row.querySelectorAll(".nv-bone").forEach((bone) => bone.setAttribute("aria-hidden", "true"));
        table.append(row);
      }
      pageEl.append(table);
    }

    function paint() {
      stage.dataset.mode = mode;
      paintModes(modes, mode);
      paintSide();
      paintPage();
      if (restore) focusKey(root, restore);
      restore = "";
    }

    stage.addEventListener("keydown", (event) => {
      if (event.target.closest("input, textarea") || event.metaKey || event.ctrlKey || event.altKey) return;
      const letter = event.key.toUpperCase();
      if (pending && Date.now() - pending < 1200) {
        pending = 0;
        const entry = SIDEBAR.find((item) => item.key === `G ${letter}`);
        if (entry) {
          event.preventDefault();
          go(entry.id);
        }
        return;
      }
      pending = letter === "G" ? Date.now() : 0;
    });

    paint();
    root.append(toolbar, stage);
    return root;
  }

  /* Mobile top bar. Standard: back, title, one action. Large title: big title below the bar. Modal: close, title, Done. */
  function mobileBar(options) {
    const t = copy(options.locale);
    const bar = el("div", "nv-appbar");
    bar.dataset.type = options.type || "standard";
    bar.dataset.scrolled = options.scrolled ? "true" : "false";
    bar.dataset.style = options.style || "solid";
    const edge = el("span", "nv-scroll-edge");
    edge.setAttribute("aria-hidden", "true");
    const row = el("div", "nv-appbar-row");
    const start = el("span", "nv-appbar-slot");
    if (options.type === "modal") start.append(iconButton("close", t.close));
    else if (options.back) start.append(iconButton(options.platform === "android" ? "back" : "previous", t.back));
    const title = el("strong", "nv-appbar-title", options.title);
    const end = el("span", "nv-appbar-slot");
    if (options.type === "modal") {
      end.append(window.createButton ? createButton({ label: t.done, variant: "ghost", size: "sm" }) : el("span", "", t.done));
    } else {
      end.append(iconButton("notifications", t.notifications));
    }
    row.append(start, title, end);
    bar.append(edge, row);
    if (options.type === "large" && options.showLarge) {
      const large = el("div", "nv-large", options.title);
      large.setAttribute("aria-hidden", "true");
      bar.append(large);
    }
    return bar;
  }

  /* Tab bar item. Docked: icon over label. Floating: icon only, the active one is an ink pill with its label. */
  function tabItem(entry, t, options) {
    const label = entry[t.lang];
    const node = button("nv-tabitem", "", options.onClick, options.key);
    node.dataset.on = options.on ? "true" : "false";
    if (options.on) node.setAttribute("aria-current", "page");
    if (options.state) {
      node.dataset.state = options.state;
      node.tabIndex = -1;
    }
    node.setAttribute("aria-label", entry.count ? `${label}, ${entry.count}` : label);
    const wrap = el("span", "nv-tabitem-icon");
    const glyph = icon(entry.id, "nav");
    if (glyph) wrap.append(glyph);
    if (entry.count) wrap.append(counter(entry.count, "alert"));
    node.append(wrap, el("span", "nv-tabitem-label", label));
    return node;
  }

  function tabBar(t, options) {
    const nav = el("nav", "nv-tabbar");
    nav.dataset.layout = options.layout || "docked";
    nav.setAttribute("aria-label", t.tabbar);
    const pill = el("div", "nv-tabbar-pill");
    TABBAR.forEach((entry) => {
      pill.append(tabItem(entry, t, {
        on: entry.id === options.current,
        key: `${options.prefix || "tab"}-${entry.id}`,
        onClick: () => options.onPick && options.onPick(entry.id),
      }));
    });
    nav.append(pill);
    return nav;
  }

  function statusBar(t) {
    const bar = el("div", "nv-statusbar");
    bar.setAttribute("aria-hidden", "true");
    const signal = el("span", "nv-signal");
    signal.append(el("i"), el("i"), el("i"), el("i"));
    bar.append(el("span", "nv-time", t.time), el("span", "nv-island"), el("span", "nv-status-icons"));
    bar.lastChild.append(signal, el("span", "nv-battery"));
    return bar;
  }

  function createPhone(options = {}) {
    const t = copy(options.locale);
    const state = {
      platform: options.platform || "ios",
      type: options.type || "large",
      layout: options.layout || "docked",
      style: options.style || "solid",
      tab: "cards",
      scrolled: false,
    };
    const device = el("div", "nv-device");
    const scroller = el("div", "nv-device-scroll");
    const barHost = el("div", "nv-device-bar");
    const tabHost = el("div", "nv-device-tabs");
    const indicator = el("span", "nv-home-indicator");
    indicator.setAttribute("aria-hidden", "true");
    device.append(statusBar(t), scroller, barHost, tabHost, indicator);
    let restore = "";

    function title() {
      const entry = TABBAR.find((item) => item.id === state.tab);
      return entry[t.lang];
    }

    function paintBar() {
      device.dataset.platform = state.platform;
      device.dataset.type = state.type;
      device.dataset.layout = state.layout;
      device.dataset.style = state.style;
      device.dataset.scrolled = state.scrolled ? "true" : "false";
      barHost.replaceChildren(mobileBar({
        locale: t.lang,
        platform: state.platform,
        type: state.type,
        scrolled: state.scrolled,
        style: state.style,
        title: title(),
      }));
    }

    function paintContent() {
      scroller.replaceChildren();
      if (state.type === "large") scroller.append(el("h3", "nv-large", title()));
      const list = el("div", "nv-device-list");
      const rows = { home: 9, cards: 8, payments: 9, inbox: 10 }[state.tab];
      for (let index = 0; index < rows; index += 1) {
        const row = el("div", "nv-list-row");
        row.setAttribute("aria-hidden", "true");
        const copyCol = el("span", "nv-list-copy");
        copyCol.append(el("span", "nv-bone"), el("span", "nv-bone nv-short"));
        row.append(el("span", "nv-bone nv-dot-bone"), copyCol, el("span", "nv-bone nv-end-bone"));
        list.append(row);
      }
      scroller.append(list);
    }

    function paintTabs() {
      tabHost.replaceChildren(tabBar(t, {
        layout: state.layout,
        current: state.tab,
        prefix: `phone-${t.lang}`,
        onPick(id) {
          if (id === state.tab) {
            scroller.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          state.tab = id;
          state.scrolled = false;
          restore = `phone-${t.lang}-${id}`;
          paint();
          scroller.scrollTop = 0;
        },
      }));
    }

    function paint() {
      paintBar();
      paintContent();
      paintTabs();
      if (restore) focusKey(device, restore);
      restore = "";
    }

    scroller.addEventListener("scroll", () => {
      const threshold = state.type === "large" ? scroller.querySelector(".nv-large").offsetHeight : 1;
      const next = scroller.scrollTop > threshold - 8;
      if (next === state.scrolled) return;
      state.scrolled = next;
      paintBar();
    });

    paint();
    device.set = (key, value) => {
      state[key] = value;
      state.scrolled = false;
      paint();
      scroller.scrollTop = 0;
    };
    return device;
  }

  function createNavMobile(options = {}) {
    const t = copy(options.locale);
    const root = el("div", "nv-stack");
    const phone = createPhone({ locale: t.lang, type: options.type, layout: options.layout, platform: options.platform });
    if (options.controls === false) {
      root.append(phone);
      return root;
    }
    const wrap = el("div", "nv-mobile-live");
    const controls = el("div", "nv-controls");
    const rows = [
      ["Platform", "platform", [["iOS", "ios"], ["Android", "android"]], "ios"],
      ["Top bar", "type", [["Standard", "standard"], ["Large title", "large"]], "large"],
      ["Tab bar", "layout", [["Docked", "docked"], ["Floating", "floating"]], "docked"],
      ["Style", "style", [["Solid", "solid"], ["Glass", "glass"]], "solid"],
    ];
    rows.forEach(([label, key, values, value]) => {
      const row = el("div", "nv-control");
      row.append(el("span", "nv-control-label", label));
      if (window.createButtonGroup) {
        row.append(createButtonGroup({
          kind: "segment",
          size: "sm",
          label,
          options: values.map(([text, id]) => ({ label: text, value: id })),
          value,
          onChange: (next) => phone.set(key, next),
        }));
      }
      controls.append(row);
    });
    const notes = el("div", "nv-specs");
    [
      ["iOS", "Top bar 52 pt, large title 96 pt. Tab bar 58 pt above the home indicator. Centred title, chevron back. VoiceOver reads \"Payments, 4, tab, 3 of 4\"."],
      ["Android", "Top bar 64 dp, large title 112 dp. Tab bar 80 dp above the system navigation bar. Title at the start, arrow back. contentDescription \"Payments, 4 new\"."],
      ["Scrolling", "At the top the bar has no fill. Once the list scrolls, it gets the surface and a hairline, and a large title moves into the bar."],
      ["Glass", "iOS only: a frosted bar with blur 24 and a top highlight, no hairline, and a fade under the bar. Android keeps a tonal bar with no blur and a solid tab bar."],
    ].forEach(([name, text]) => {
      const spec = el("div", "nv-spec");
      spec.append(el("strong", "", name), el("p", "", text));
      notes.append(spec);
    });
    const side = el("div", "nv-stack");
    side.append(controls, notes);
    wrap.append(phone, side);
    root.append(wrap);
    return root;
  }

  function createNavTopBars() {
    const root = el("div", "nv-topbar-grid");
    const head = el("div", "nv-topbar-head");
    head.append(el("span", ""), el("span", "", "iOS · 52 pt"), el("span", "", "Android · 64 dp"));
    root.append(head);
    [
      ["Standard · top", { type: "standard", back: true }],
      ["Standard · scrolled", { type: "standard", back: true, scrolled: true }],
      ["Large title · top", { type: "large", back: true, showLarge: true }],
      ["Large title · scrolled", { type: "large", back: true, scrolled: true }],
      ["Modal", { type: "modal", scrolled: true }],
      ["Glass · scrolled", { type: "standard", back: true, scrolled: true, style: "glass" }],
    ].forEach(([caption, spec]) => {
      const row = el("div", "nv-topbar-line");
      row.append(el("span", "nv-topbar-caption", caption));
      ["ios", "android"].forEach((platform) => {
        const frame = el("div", "nv-bar-frame");
        frame.dataset.platform = platform;
        frame.append(mobileBar({ ...spec, platform, title: "Cards" }));
        row.append(frame);
      });
      root.append(row);
    });
    return root;
  }

  function createNavStates() {
    const t = copy("en");
    const root = el("div", "nv-stack");
    const dashboard = SIDEBAR[0];
    const groups = [
      ["Sidebar item · expanded", "nv-state-row", [["Default", ""], ["Hover", "hover"], ["Active", "active"], ["Focus", "focus"], ["Disabled", "disabled"]].map(([name, state]) => {
        const cell = el("div", "nv-state-cell");
        cell.dataset.wide = "true";
        cell.append(sideItem({ ...dashboard, count: "" }, t, false, state === "active", null, state || "default"), el("span", "", name));
        return cell;
      })],
      ["Sidebar item · rail", "nv-state-row", [["Default", ""], ["Hover", "hover"], ["Active", "active"], ["Focus", "focus"], ["Disabled", "disabled"]].map(([name, state]) => {
        const cell = el("div", "nv-state-cell");
        const rail = el("div", "nv-rail-sample");
        rail.append(sideItem({ ...dashboard, count: "" }, t, true, state === "active", null, state || "default"));
        cell.append(rail, el("span", "", name));
        return cell;
      })],
      ["Tab bar item", "nv-state-row", [["Docked · default", "docked", false, ""], ["Docked · active", "docked", true, ""], ["Docked · pressed", "docked", false, "pressed"], ["Floating · default", "floating", false, ""], ["Floating · active", "floating", true, ""], ["Floating · pressed", "floating", false, "pressed"]].map(([name, layout, on, state]) => {
        const cell = el("div", "nv-state-cell");
        const nav = el("div", "nv-tabbar nv-tabbar-sample");
        nav.dataset.layout = layout;
        nav.append(tabItem({ ...TABBAR[0] }, t, { on, state: state || "default" }));
        cell.append(nav, el("span", "", name));
        return cell;
      })],
      ["Mobile top bar · large title", "nv-state-row", [["Top of the list", false], ["Scrolled", true]].map(([name, scrolled]) => {
        const cell = el("div", "nv-state-cell");
        cell.dataset.wide = "true";
        const frame = el("div", "nv-bar-frame");
        frame.dataset.platform = "ios";
        frame.append(mobileBar({ type: "large", back: true, scrolled, showLarge: !scrolled, title: "Cards" }));
        cell.append(frame, el("span", "", name));
        return cell;
      })],
    ];
    groups.forEach(([title, className, cells]) => {
      const block = el("div", "nv-panel");
      block.append(el("span", "nv-kicker", title));
      const row = el("div", className);
      row.append(...cells);
      block.append(row);
      root.append(block);
    });
    return root;
  }

  function createNavMobileWeb() {
    const t = copy("en");
    const root = el("div", "nv-stack");
    let page = "transfers";
    const drawers = [false, false];
    let restore = "";
    const phones = el("div", "nv-phones");
    const variants = [
      ["A · drawer only", false, "Simplest. Everything lives in the drawer; good when people use one or two areas per visit."],
      ["B · drawer + bottom bar", true, "Four most used areas one tap away; Menu opens the same drawer for the rest. Recommended for daily users."],
    ];
    const tabs = [["Home", "dashboard", "home"], ["Activity", "transactions", "transactions"], ["Pay", "transfers", "transfers"], ["Cards", "cards", "cards"], ["Menu", null, "menu"]];

    function go(next, key) {
      page = next;
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
      const entry = SIDEBAR.find((item) => item.id === page) || SIDEBAR[0];
      frames.forEach((phone, index) => {
        const bottom = variants[index][1];
        const open = drawers[index];
        phone.replaceChildren();
        phone.append(el("span", "nv-url", "business.hala.com"));
        const bar = el("div", "nv-top");
        const menu = iconButton("menu", "Open menu", () => { drawers[index] = true; restore = `close-${index}`; paint(); }, `open-${index}`);
        menu.setAttribute("aria-expanded", open ? "true" : "false");
        const bell = iconButton("notifications", t.notifications);
        bar.append(menu, el("strong", "", entry.en), bell, avatar(t.user, "sm"));
        const body = el("div", "nv-phone-body");
        body.append(el("span", "nv-crumb", `${t.home} › ${entry.en}`));
        body.append(el("span", "nv-bone"), el("span", "nv-bone nv-short"), el("span", "nv-bone nv-short"), el("span", "nv-bone nv-short"));
        phone.append(bar, body);
        if (bottom) {
          const nav = el("nav", "nv-tabbar");
          nav.dataset.layout = "docked";
          nav.setAttribute("aria-label", "Primary");
          const pill = el("div", "nv-tabbar-pill");
          tabs.forEach(([label, dest, glyph]) => {
            const on = Boolean(dest && page === dest);
            const node = button("nv-tabitem", "", () => {
              if (!dest) { drawers[index] = true; restore = `close-${index}`; paint(); return; }
              go(dest, `tab-${index}-${label}`);
            }, `tab-${index}-${label}`);
            node.dataset.on = on ? "true" : "false";
            if (on) node.setAttribute("aria-current", "page");
            const wrap = el("span", "nv-tabitem-icon");
            const mark = icon(glyph, "nav");
            if (mark) wrap.append(mark);
            node.append(wrap, el("span", "nv-tabitem-label", label));
            pill.append(node);
          });
          nav.append(pill);
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
        const close = iconButton("close", "Close menu", () => { drawers[index] = false; restore = `open-${index}`; paint(); }, `close-${index}`);
        dHead.append(logo(true), close);
        const search = el("div", "nv-drawer-search");
        const searchIcon = icon("search", "inline");
        if (searchIcon) search.append(searchIcon);
        search.append(document.createTextNode(t.search));
        const nav = el("nav", "nv-nav");
        [["main", ""], ["business", t.business], ["foot", ""]].forEach(([group, title]) => {
          const block = el("div", "nv-group");
          if (title) block.append(el("span", "nv-kicker", title));
          SIDEBAR.filter((item) => item.group === group).forEach((item) => {
            const row = sideItem({ ...item, key: "" }, t, false, item.id === page, () => go(item.id, `open-${index}`));
            row.dataset.key = `m-${index}-${item.id}`;
            block.append(row);
          });
          nav.append(block);
        });
        const account = el("div", "nv-account-row");
        account.append(avatar(t.initials, "sm"));
        const who = el("span", "nv-user-copy");
        who.append(el("strong", "", t.company), el("span", "", t.role));
        account.append(who);
        drawer.append(dHead, search, nav, account);
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
      ["Breakpoint", "Below 600 px: drawer. 600–1023 px: the 80 rail. 1024 px and up: the 272 sidebar."],
      ["Top bar", "56 px. Menu 44 px at the start, page title, notifications and avatar at the end."],
      ["Drawer", "86% width, max 320 px. Slides from the start edge. Scrim closes it."],
      ["Rows", "Same Sidebar items, groups and order as desktop. 44 px rows, no nesting."],
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

    const top = el("div", "nv-panel");
    const topHead = el("header");
    const topCopy = el("div");
    topCopy.append(el("h3", "", "Web top bar · 72 px"), el("p", "", "Search (⌘K opens the Command menu) at the start; account switcher, notifications with a dot and the avatar at the end. The page title lives in the page, not the bar."));
    topHead.append(topCopy, live("Live · open notifications"));
    const topFrame = el("div", "nv-frame");
    topFrame.append(createNavWebTopBar());
    top.append(topHead, topFrame);

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
      const text = el("div");
      text.append(el("strong", "", name), el("span", "", detail));
      prod.append(tile, text);
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

    const tabsCard = el("div", "nv-panel");
    const tabsCopy = el("div");
    tabsCopy.append(el("h3", "", "Section tabs · under the page title"), el("p", "", "For sibling views of one object, like a card's details. These are the Tabs component; see the Tabs page."));
    tabsCard.append(tabsCopy);
    if (window.createTabs) tabsCard.append(createTabs({ label: "Purchase card", options: ["Overview", "Limits", "Settings", "Activity"], value: "Overview" }));

    root.append(top, market, flow, tabsCard);
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
    ].forEach(([heading, items]) => {
      const col = el("div", "nv-col");
      col.append(el("strong", "", heading));
      items.forEach((link) => col.append(el("span", "", link)));
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

  function createNavGuide() {
    const root = el("div", "nv-stack");
    const table = el("div");
    const head = el("div", "nv-which");
    ["Context", "Web", "Mobile", "Notes"].forEach((label) => head.append(el("span", "", label)));
    table.append(head);
    [
      ["Hala Business app", "Sidebar + web top bar", "Tab bar (4) + mobile top bar", "Sidebar becomes the 80 rail on tablet"],
      ["Marketing site", "Marketing header + full footer", "Header with menu sheet", "Products in a mega menu"],
      ["Task flow", "Flow header, no sidebar", "Modal top bar: close, title, Done", "Remove all other navigation"],
      ["Object detail", "Breadcrumb + Tabs (Hug)", "Back + Tabs (Fill)", "Tabs for sibling views only"],
      ["Forms", "Sticky action footer", "Action bar above the keyboard", "Appears with unsaved changes"],
      ["Long app page", "Slim app footer", "None", "Legal links and status only"],
    ].forEach(([context, web, mobile, notes]) => {
      const row = el("div", "nv-wrow");
      row.append(el("strong", "", context), el("span", "", web), el("span", "", mobile), el("span", "", notes));
      table.append(row);
    });
    const rules = el("div", "nv-rules");
    [
      ["Keep 4 tabs in the mobile tab bar and 5–8 main items in the sidebar.", "Add a fifth tab or nest menus inside the sidebar."],
      ["Collapse to the 80 rail on tablet and show labels as tooltips.", "Hide the sidebar completely on tablet or truncate labels in the rail."],
      ["Put the sidebar on the right in Arabic and mirror back arrows.", "Mirror the logo, counters, close icons or amounts."],
      ["Keep labels identical across sidebar, tab bar, page titles and breadcrumbs.", "Show app navigation inside task flows; use the flow header or a modal top bar."],
    ].forEach(([yes, no], index) => {
      const card = el("div", "nv-rule");
      card.append(el("span", "nv-kicker", String(index + 1).padStart(2, "0")));
      [[true, yes], [false, no]].forEach(([ok, text]) => {
        const line = el("div", "nv-rule-line");
        line.dataset.ok = ok ? "true" : "false";
        const textCol = el("div");
        textCol.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
        line.append(el("i", "", ok ? "✓" : "×"), textCol);
        card.append(line);
      });
      rules.append(card);
    });
    root.append(table, rules);
    return root;
  }

  window.createNavShell = createNavShell;
  window.createNavWebTopBar = createNavWebTopBar;
  window.createNavMobile = createNavMobile;
  window.createNavTopBars = createNavTopBars;
  window.createNavStates = createNavStates;
  window.createNavMobileWeb = createNavMobileWeb;
  window.createNavHeaders = createNavHeaders;
  window.createNavFooters = createNavFooters;
  window.createNavGuide = createNavGuide;
})();
