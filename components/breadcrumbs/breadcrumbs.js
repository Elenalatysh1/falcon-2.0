/**
 * Breadcrumbs. Load lucide UMD, then this script.
 *
 * createBreadcrumbAnatomy()
 * createBreadcrumbHeader()
 * createCollapsedBreadcrumb()
 * createTruncatedBreadcrumb()
 * createNarrowBreadcrumb()
 * createArabicBreadcrumb()
 * createMobileBreadcrumbs()
 *
 * Web trails link every level except the current page. More than four
 * levels collapse the middle. Mobile uses a back button instead.
 */
(function () {
  const MIRROR = new Set(["chevron-right", "chevron-left", "arrow-left", "corner-down-right"]);

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

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function live(label) {
    return el("span", "bc-live", label || "Live");
  }

  function separator() {
    const node = el("span", "bc-sep");
    node.setAttribute("aria-hidden", "true");
    const glyph = icon("chevron-right");
    if (glyph) node.append(glyph);
    return node;
  }

  function crumb(label, { current, onClick, home } = {}) {
    const wrap = el("span", "bc-crumb");
    const node = el(current || !onClick ? "span" : "button", current ? "bc-current" : "bc-link");
    if (!current && onClick) node.type = "button";
    if (current) node.setAttribute("aria-current", "page");
    if (home) {
      const mark = icon("home", "inline");
      if (mark) node.append(mark);
    }
    if (typeof label === "string") node.append(document.createTextNode(label));
    else node.append(label);
    if (onClick) node.addEventListener("click", onClick);
    wrap.append(node);
    return wrap;
  }

  function fillNav(nav, items) {
    nav.replaceChildren();
    items.forEach((item, index) => {
      if (index) nav.append(separator());
      nav.append(crumb(item.label, item));
    });
  }

  function createBreadcrumbAnatomy() {
    const root = el("div", "bc-stage");
    root.dataset.sample = "true";
    const nav = el("nav", "bc-nav");
    nav.setAttribute("aria-label", "Breadcrumb");
    const home = el("span", "bc-home", "Dashboard");
    const mark = icon("home", "inline");
    if (mark) home.prepend(mark);
    nav.append(home, separator(), el("span", "bc-link", "Cards"), separator());
    const current = el("span", "bc-current", "Marketing card •• 4417");
    current.setAttribute("aria-current", "page");
    nav.append(current);
    const parts = el("div", "bc-parts");
    [
      ["Link", "Cards", "link", "Earlier level. Tertiary text."],
      ["Hover", "Cards", "hover", "Ink text, underline."],
      ["Focus", "Cards", "focus", "Keyboard ring around the link."],
      ["Current", "Marketing card", "current", "Ink, semibold, not a link. aria-current=\"page\"."],
      ["Separator", "", "separator", "Chevron, decorative, hidden from screen readers."],
    ].forEach(([name, text, state, copy]) => {
      const card = el("div", "bc-part");
      card.append(el("span", "bc-overline", name));
      const sample = el("span", "bc-sample", text);
      sample.dataset.state = state;
      if (state === "separator") {
        const glyph = icon("chevron-right");
        if (glyph) sample.append(glyph);
      }
      card.append(sample, el("p", "", copy));
      parts.append(card);
    });
    root.append(nav, parts);
    return root;
  }

  function createBreadcrumbHeader() {
    const pages = [
      {
        label: "Dashboard",
        title: "Good morning, Abdulaziz",
        sub: "Khamis Arabia Trading Co",
        action: "New transfer",
        primary: true,
        items: [
          ["Cards", "5 cards · 1 frozen", 1],
          ["Transactions", "248 this month"],
          ["POS", "9 terminals"],
        ],
      },
      {
        label: "Cards",
        title: "Cards",
        sub: "5 cards · SAR 42,000 monthly limit",
        action: "Create card",
        items: [
          ["Marketing card", "•• 4417 · Omar Bakr", 2],
          ["Operations card", "•• 2086 · Frozen"],
          ["Travel card", "•• 7731 · Omar Bakr"],
        ],
      },
      {
        label: "Marketing card",
        title: "Marketing card",
        sub: "•• 4417 · Omar Bakr · Active",
        action: "Freeze card",
        items: [
          ["Transactions", "38 this month", 3],
          ["Limits", "SAR 5,000 / month"],
          ["Settings", "Online, ATM, abroad"],
        ],
      },
      {
        label: "Transactions",
        title: "Transactions",
        sub: "Marketing card •• 4417 · October",
        action: "Export",
        items: [
          ["Careem", "− 38.50 · Yesterday"],
          ["Jarir Bookstore", "− 1,249.00 · Today"],
          ["Google Ads", "− 2,000.00 · 12 Oct"],
        ],
      },
    ];
    let level = 3;
    const root = el("div", "bc-stage");
    const head = el("div", "bc-head");
    head.dataset.end = "true";
    head.append(live("Live"));
    const canvas = el("div", "bc-canvas");
    const nav = el("nav", "bc-nav");
    nav.setAttribute("aria-label", "Breadcrumb");
    const body = el("div", "");

    function paint() {
      const page = pages[level];
      fillNav(nav, pages.slice(0, level + 1).map((item, index) => ({
        label: item.label,
        current: index === level,
        onClick: index === level ? null : () => {
          level = index;
          paint();
        },
      })));
      body.replaceChildren();
      const heading = el("div", "bc-heading");
      const copy = el("div", "");
      copy.append(el("h3", "", page.title), el("p", "", page.sub));
      const action = el("span", "bc-action", page.action);
      if (page.primary) action.dataset.primary = "true";
      heading.append(copy, action);
      const tiles = el("div", "bc-tiles");
      page.items.forEach(([title, sub, to]) => {
        const tile = el(to == null ? "div" : "button", "bc-tile");
        if (to != null) {
          tile.type = "button";
          tile.addEventListener("click", () => {
            level = to;
            paint();
          });
        }
        tile.append(el("strong", "", title), el("span", "", sub));
        tiles.append(tile);
      });
      body.append(heading, tiles);
    }

    canvas.append(nav, body);
    root.append(head, canvas);
    paint();
    return root;
  }

  function createCollapsedBreadcrumb() {
    const root = el("div", "bc-stage");
    const head = el("div", "bc-head");
    head.append(el("span", "bc-kicker", "Collapsed middle"), live("Live"));
    const nav = el("nav", "bc-nav");
    nav.setAttribute("aria-label", "Breadcrumb");
    const slot = el("span", "bc-slot");
    const more = el("button", "bc-more", "…");
    more.type = "button";
    more.setAttribute("aria-label", "Show hidden levels");
    const menu = el("div", "bc-menu");
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    [
      ["Accept payments", "1"],
      ["POS", "2"],
    ].forEach(([label, depth]) => {
      const item = el("button", "bc-item", label);
      item.type = "button";
      item.setAttribute("role", "menuitem");
      item.dataset.level = depth;
      const branch = icon("corner-down-right");
      if (branch) item.prepend(branch);
      item.addEventListener("click", () => {
        open = false;
        paint();
        more.focus();
      });
      menu.append(item);
    });
    slot.append(more, menu);
    let open = false;
    function paint() {
      more.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
    }
    more.addEventListener("click", (event) => {
      event.stopPropagation();
      open = !open;
      paint();
    });
    document.addEventListener("click", (event) => {
      if (!open || slot.contains(event.target)) return;
      open = false;
      paint();
    });
    root.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !open) return;
      open = false;
      paint();
      more.focus();
    });
    nav.replaceChildren(
      crumb("Dashboard"),
      separator(),
      slot,
      separator(),
      crumb("Jeddah Corniche"),
      separator(),
    );
    const current = el("span", "bc-current", "Terminal T-0412");
    current.setAttribute("aria-current", "page");
    nav.append(current);
    root.append(head, nav, el("p", "bc-note", "Full path: Dashboard › Accept payments › POS › Jeddah Corniche › Terminal T-0412"));
    paint();
    return root;
  }

  function createTruncatedBreadcrumb() {
    const root = el("div", "bc-stage");
    root.append(el("span", "bc-kicker", "Truncated name"));
    const nav = el("nav", "bc-nav");
    nav.setAttribute("aria-label", "Breadcrumb");
    const name = el("span", "bc-clip", "Khamis Arabia Trading and Contracting Company");
    name.title = "Khamis Arabia Trading and Contracting Company";
    const current = el("span", "bc-current", "TRF-88213");
    current.setAttribute("aria-current", "page");
    nav.append(el("span", "bc-link", "Transfers"), separator(), name, separator(), current);
    root.append(nav, el("p", "bc-note", "Hover the middle crumb to see the full name."));
    return root;
  }

  function createNarrowBreadcrumb() {
    const root = el("div", "bc-stage");
    root.append(el("span", "bc-kicker", "< 600 px · parent only"));
    const frame = el("div", "bc-narrow");
    const back = el("span", "bc-parent", "Cards");
    const glyph = icon("chevron-left", "inline");
    if (glyph) back.prepend(glyph);
    frame.append(back, el("strong", "", "Marketing card"));
    root.append(frame, el("p", "bc-note", "Link color, leading chevron. The label is the parent name, not \"Back\"."));
    return root;
  }

  function createArabicBreadcrumb() {
    const root = el("div", "bc-stage");
    root.dir = "rtl";
    const kicker = el("span", "bc-kicker", "Arabic · RTL");
    kicker.dir = "ltr";
    const nav = el("nav", "bc-nav");
    nav.setAttribute("aria-label", "مسار التنقل");
    const current = el("span", "bc-current");
    current.setAttribute("aria-current", "page");
    current.append(document.createTextNode("بطاقة التسويق "));
    const number = el("bdi", "bc-num", "•• 4417");
    number.dir = "ltr";
    current.append(number);
    nav.append(el("span", "bc-link", "الرئيسية"), separator(), el("span", "bc-link", "البطاقات"), separator(), current);
    const note = el("p", "bc-note", "الأرقام تبقى من اليسار إلى اليمين داخل المسار.");
    root.append(kicker, nav, note);
    return root;
  }

  function createMobileBreadcrumbs() {
    const screens = [
      {
        title: "Cards",
        rows: [
          ["Marketing card", "•• 4417 · Active", 1],
          ["Operations card", "•• 2086 · Frozen"],
          ["Travel card", "•• 7731 · Active"],
        ],
      },
      {
        title: "Marketing card",
        rows: [
          ["Transactions", "38 this month", 2],
          ["Limits", "SAR 5,000 / month"],
          ["Card settings", "Online, ATM, abroad"],
        ],
      },
      {
        title: "Transactions",
        rows: [
          ["Careem", "− 38.50 · Yesterday"],
          ["Jarir Bookstore", "− 1,249.00 · Today"],
          ["Google Ads", "− 2,000.00 · 12 Oct"],
        ],
      },
    ];
    let depth = 1;
    const root = el("div", "bc-phones");
    const notes = [
      "Parent name next to the chevron; switch to \"Back\" if it is longer than 12 characters. Swipe from the left edge also goes back.",
      "Arrow icon, title beside it. The system back gesture and button do the same.",
    ];

    function phone(platform) {
      const card = el("div", "bc-stage bc-phone-card");
      const head = el("div", "bc-head");
      head.append(el("span", "bc-kicker", platform === "ios" ? "iOS · back with parent name" : "Android · top app bar"), live("Live"));
      const device = el("div", "bc-phone");
      const bar = el("div", "bc-bar");
      const screen = el("div", "bc-screen");
      device.append(bar, screen);
      card.append(head, device, el("p", "bc-note", notes[platform === "ios" ? 0 : 1]));
      card.paint = () => {
        const page = screens[depth];
        const parent = depth > 0 ? screens[depth - 1].title : "";
        bar.replaceChildren();
        bar.dataset.align = platform === "ios" ? "center" : "start";
        if (depth > 0) {
          const back = el("button", "bc-back");
          back.type = "button";
          back.dataset.platform = platform;
          back.setAttribute("aria-label", `Back to ${parent}`);
          const glyph = icon(platform === "ios" ? "chevron-left" : "arrow-left");
          if (glyph) back.append(glyph);
          if (platform === "ios") back.append(document.createTextNode(parent.length > 12 ? "Back" : parent));
          back.addEventListener("click", () => {
            depth -= 1;
            paint();
          });
          bar.append(back);
        }
        const title = el("span", "bc-bar-title", platform === "ios" && depth === 0 ? "" : page.title);
        bar.append(title);
        if (platform === "ios" && depth > 0) bar.append(el("span", "bc-balance"));
        screen.replaceChildren();
        if (platform === "ios" && depth === 0) screen.append(el("h3", "bc-large", page.title));
        const rows = el("div", "bc-rows");
        page.rows.forEach(([name, sub, to]) => {
          const row = el(to == null ? "div" : "button", "bc-row");
          if (to != null) {
            row.type = "button";
            row.addEventListener("click", () => {
              depth = to;
              paint();
            });
          }
          const copy = el("div", "");
          copy.append(el("strong", "", name), el("span", "", sub));
          row.append(copy);
          if (to != null) {
            const next = icon("chevron-right");
            if (next) row.append(next);
          }
          rows.append(row);
        });
        screen.append(rows);
      };
      return card;
    }

    const ios = phone("ios");
    const android = phone("android");
    function paint() {
      ios.paint();
      android.paint();
    }
    root.append(ios, android);
    paint();
    return root;
  }

  window.createBreadcrumbAnatomy = createBreadcrumbAnatomy;
  window.createBreadcrumbHeader = createBreadcrumbHeader;
  window.createCollapsedBreadcrumb = createCollapsedBreadcrumb;
  window.createTruncatedBreadcrumb = createTruncatedBreadcrumb;
  window.createNarrowBreadcrumb = createNarrowBreadcrumb;
  window.createArabicBreadcrumb = createArabicBreadcrumb;
  window.createMobileBreadcrumbs = createMobileBreadcrumbs;
})();
