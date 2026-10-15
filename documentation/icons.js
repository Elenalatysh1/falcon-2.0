const iconPage = document.querySelector('[data-page="icons"]') || document;
const sizeKeys = ["inline", "default", "nav", "feature"];
const colors = [
  ["Ink", "var(--text-primary)"],
  ["Tertiary", "var(--text-tertiary)"],
  ["Green 600", "var(--brand-600)"],
  ["Danger", "var(--status-danger)"],
];

const groups = [
  ["NAVIGATION", [
    ["Dashboard", "dashboard", ["LayoutDashboard"]],
    ["Transactions", "transactions", ["ArrowLeftRight"]],
    ["Transfers", "transfers", ["Send"]],
    ["Payroll", "payroll", ["CalendarDays"]],
    ["Cards", "cards", ["CreditCard"]],
    ["SADAD", "sadad", ["ReceiptText", "Receipt"]],
    ["POS", "pos", ["Smartphone"]],
    ["eCommerce", "ecommerce", ["ShoppingCart"]],
    ["Invoicing", "invoicing", ["FileText"]],
    ["Food delivery", "food-delivery", ["UtensilsCrossed"]],
    ["Locations", "locations", ["MapPin"]],
    ["Users", "users", ["Users"]],
    ["Documents", "documents", ["Files"]],
    ["Help", "help", ["CircleHelp", "HelpCircle"]],
    ["Settings", "settings", ["Settings"]],
  ]],
  ["MONEY", [
    ["Account", "account", ["Landmark"]],
    ["Wallet", "wallet", ["Wallet"]],
    ["Cash", "cash", ["Banknote"]],
    ["Savings", "savings", ["PiggyBank"]],
    ["Income", "income", ["ArrowDownLeft"]],
    ["Outgoing", "outgoing", ["ArrowUpRight"]],
    ["Trend up", "trend-up", ["TrendingUp"]],
    ["Trend down", "trend-down", ["TrendingDown"]],
    ["Bar chart", "bar-chart", ["ChartColumn", "BarChart3"]],
    ["Line chart", "line-chart", ["ChartLine", "LineChart"]],
    ["Percent", "percent", ["Percent"]],
    ["Refund", "refund", ["Undo2"]],
    ["QR pay", "qr-pay", ["QrCode"]],
    ["Contactless", "contactless", ["Nfc"]],
  ]],
  ["ACTIONS", [
    ["Add", "add", ["Plus"]],
    ["Close", "close", ["X"]],
    ["Confirm", "confirm", ["Check"]],
    ["Edit", "edit", ["Pencil"]],
    ["Delete", "delete", ["Trash2"]],
    ["Copy", "copy", ["Copy"]],
    ["Download", "download", ["Download"]],
    ["Upload", "upload", ["Upload"]],
    ["Share", "share", ["Share2"]],
    ["Filter", "filter", ["ListFilter", "Filter"]],
    ["Adjust", "adjust", ["SlidersHorizontal"]],
    ["Search", "search", ["Search"]],
    ["Refresh", "refresh", ["RefreshCw"]],
    ["More", "more", ["Ellipsis", "MoreHorizontal"]],
    ["Open link", "open-link", ["ExternalLink"]],
  ]],
  ["SECURITY", [
    ["Lock", "lock", ["Lock"]],
    ["Unlock", "unlock", ["LockOpen", "Unlock"]],
    ["Verified", "verified", ["ShieldCheck"]],
    ["Fingerprint", "fingerprint", ["Fingerprint"]],
    ["Face ID", "face-id", ["ScanFace"]],
    ["Show", "show", ["Eye"]],
    ["Hide", "hide", ["EyeOff"]],
    ["Freeze", "freeze", ["Snowflake"]],
    ["Key", "key", ["KeyRound"]],
    ["Sign out", "sign-out", ["LogOut"]],
  ]],
  ["STATUS", [
    ["Success", "success", ["CircleCheck", "CheckCircle2"]],
    ["Error", "error", ["CircleX", "XCircle"]],
    ["Warning", "warning", ["TriangleAlert", "AlertTriangle"]],
    ["Info", "info", ["Info"]],
    ["Pending", "pending", ["Clock"]],
    ["Notifications", "notifications", ["Bell"]],
    ["Muted", "muted", ["BellOff"]],
    ["Offline", "offline", ["WifiOff"]],
  ]],
  ["BUSINESS AND CONTENT", [
    ["Company", "company", ["Building2"]],
    ["Shop", "shop", ["Store"]],
    ["Delivery", "delivery", ["Truck"]],
    ["Product", "product", ["Package"]],
    ["Tag", "tag", ["Tag"]],
    ["Calendar", "calendar", ["Calendar"]],
    ["Camera", "camera", ["Camera"]],
    ["Image", "image", ["Image"]],
    ["Attachment", "attachment", ["Paperclip"]],
    ["Email", "email", ["Mail"]],
    ["Phone", "phone", ["Phone"]],
    ["Chat", "chat", ["MessageCircle"]],
    ["Language", "language", ["Globe"]],
    ["Support", "support", ["Headset", "Headphones"]],
    ["Gift", "gift", ["Gift"]],
  ]],
  ["ARROWS", [
    ["Back", "back", ["ArrowLeft"]],
    ["Forward", "forward", ["ArrowRight"]],
    ["Expand", "expand", ["ChevronDown"]],
    ["Next", "next", ["ChevronRight"]],
    ["Previous", "previous", ["ChevronLeft"]],
    ["Collapse", "collapse", ["ChevronUp"]],
    ["Sort", "sort", ["ArrowUpDown"]],
    ["Sidebar", "sidebar", ["PanelLeft"]],
  ]],
];

const state = { size: 1, color: 0, query: "" };
let copiedTimer = 0;

function kebabOf(pascal) {
  return pascal
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

const catalog = {};

function remember(key, aliases) {
  const found = aliases.find((name) => lucide.icons[name]);
  catalog[key] = kebabOf(found || aliases[0]);
}

groups.forEach(([, items]) => {
  items.forEach(([, key, aliases]) => remember(key, aliases));
});
remember("home", ["House", "Home"]);
remember("sparkles", ["Sparkles"]);

const iconSizes = {
  inline: "--icon-inline",
  default: "--icon-default",
  nav: "--icon-nav",
  feature: "--icon-feature",
};

const mirrorNames = new Set([
  "arrow-left",
  "arrow-right",
  "chevron-left",
  "chevron-right",
  "send",
  "log-out",
  "undo-2",
  "panel-left",
]);

function pascal(kebab) {
  return kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function icon(name, options = {}) {
  const kebab = catalog[name] || name;
  const node = lucide.icons[pascal(kebab)];
  if (!node) throw new Error(`Unknown Falcon icon "${name}"`);
  const size = iconSizes[options.size] ? options.size : "default";
  const svg = lucide.createElement(node);
  svg.classList.add("hala-icon");
  svg.dataset.size = size;
  svg.dataset.icon = kebab;
  svg.style.width = `var(${iconSizes[size]})`;
  svg.style.height = `var(${iconSizes[size]})`;
  svg.style.strokeWidth = options.active ? "var(--icon-stroke-active)" : "var(--icon-stroke)";
  if (mirrorNames.has(kebab)) svg.dataset.mirror = "true";
  if (options.active) svg.dataset.active = "true";
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

function draw(name, { size = "default", active = false, px, stroke, flip, fill } = {}) {
  const svg = icon(name, { size, active });
  if (px) {
    const length = typeof px === "number" ? `${px}px` : px;
    svg.style.width = length;
    svg.style.height = length;
  }
  if (stroke) svg.style.strokeWidth = String(stroke);
  if (flip) svg.classList.add("is-flipped");
  if (fill) svg.style.fill = fill;
  return svg;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function mount(slot, node) {
  slot.replaceChildren(node);
}

function specs() {
  const root = getComputedStyle(document.documentElement);
  const grid = root.getPropertyValue("--icon-grid").trim();
  const stroke = root.getPropertyValue("--icon-stroke").trim();
  const rows = [
    ["GRID", `${grid} × ${grid}`, "Lucide default canvas"],
    ["STROKE", stroke, "Set strokeWidth={1.7}. Lucide default is 2."],
    ["CAPS / JOINS", "round", "Lucide default, keep it"],
    ["COLOR", "currentColor", "Inherit text color; never hard-code"],
    ["LICENSE", "ISC", "Free for commercial use"],
  ];
  const host = iconPage.querySelector("[data-specs]");
  rows.forEach(([k, v, d]) => {
    const card = el("div", "spec");
    card.append(el("span", "kicker quiet", k), el("b", "", v), el("span", "sub", d));
    host.append(card);
  });
}

function anatomy() {
  const svg = draw("cards", {
    px: "calc((var(--icon-grid) - 4) * var(--space-2))",
  });
  mount(iconPage.querySelector("[data-anatomy]"), svg);
}

function strokes() {
  const host = iconPage.querySelector("[data-strokes]");
  const rows = [
    ["1.5", "1.5 · too light", false],
    [null, "1.7 · Hala", true],
    ["2", "2 · Lucide default, heavy", false],
  ];
  rows.forEach(([stroke, label, hala]) => {
    const row = el("div", hala ? "stroke-row is-hala" : "stroke-row");
    const icons = el("div", "stroke-icons");
    ["transactions", "cards", "notifications"].forEach((name) => {
      icons.append(draw(name, stroke ? { stroke } : {}));
    });
    row.append(icons, el("span", "stroke-label", "Transfers"), el("span", "stroke-meta", label));
    host.append(row);
  });
}

function sizes() {
  const host = iconPage.querySelector("[data-sizes]");
  const rows = [
    ["Inline · 16", "16 px · tile 28", "inline", "--icon-tile-inline", "--icon-tile-radius-inline", "--icon-gap-inline", "Inside badges, small buttons, table cells, input adornments."],
    ["Default · 20", "20 px · tile 36", "default", "--icon-tile-default", "--icon-tile-radius-default", "--icon-gap-default", "Buttons, list rows, menus, sidebar items."],
    ["Navigation · 22", "22 px · tile 40", "nav", "--icon-tile-nav", "--icon-tile-radius-nav", "--icon-gap-nav", "Mobile tab bar and top bar actions."],
    ["Feature · 28", "28 px · tile 56", "feature", "--icon-tile-feature", "--icon-tile-radius-feature", "--icon-gap-feature", "Quick actions, empty-state tiles, product cards."],
  ];
  const samples = ["home", "transfers", "wallet", "search", "settings"];
  rows.forEach(([name, spec, size, tile, radius, gap, use]) => {
    const row = el("div", "size-row");
    const title = el("div", "size-name");
    title.append(el("span", "", name), el("span", "mono", spec));
    const tileEl = el("span", "size-tile");
    tileEl.style.width = `var(${tile})`;
    tileEl.style.height = `var(${tile})`;
    tileEl.style.borderRadius = `var(${radius})`;
    tileEl.append(draw("cards", { size }));
    const icons = el("div", "size-row-icons");
    icons.style.gap = `var(${gap})`;
    samples.forEach((sample) => icons.append(draw(sample, { size })));
    row.append(title, tileEl, icons, el("span", "hint", use));
    host.append(row);
  });
}

function showCopied(code) {
  const node = iconPage.querySelector("[data-copied]");
  node.textContent = `Copied "${code}"`;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    node.textContent = "";
  }, 1500);
}

function library() {
  const host = iconPage.querySelector("[data-groups]");
  const empty = iconPage.querySelector("[data-empty]");
  const q = state.query.trim().toLowerCase();
  host.replaceChildren();
  let shown = 0;
  groups.forEach(([name, items]) => {
    const matches = items.filter(([label, , aliases]) => {
      if (!q) return true;
      const blob = [label, name, ...aliases, ...aliases.map(kebabOf)].join(" ").toLowerCase();
      return blob.includes(q);
    });
    if (!matches.length) return;
    shown += matches.length;
    const group = el("div", "group");
    group.append(el("span", "group-name", name));
    const grid = el("div", "icon-grid");
    matches.forEach(([label, key]) => {
      const code = catalog[key];
      const button = el("button", "icon-cell");
      button.type = "button";
      button.title = code;
      button.style.color = colors[state.color][1];
      button.append(draw(key, { size: sizeKeys[state.size] }));
      const text = el("span");
      text.append(el("span", "label", label), el("span", "code", code));
      button.append(text);
      button.addEventListener("click", () => {
        showCopied(code);
        const clipboard = navigator.clipboard;
        if (clipboard) clipboard.writeText(code).catch(() => {});
      });
      grid.append(button);
    });
    group.append(grid);
    host.append(group);
  });
  empty.hidden = !q || shown > 0;
  empty.textContent = `No Hala icon matches "${state.query}". Check lucide.dev, then ask design to add it to the set.`;
}

function toolbar() {
  iconPage.querySelector("[data-count]").textContent = String(
    groups.reduce((sum, [, items]) => sum + items.length, 0),
  );
  mount(iconPage.querySelector("[data-search-icon]"), draw("search", { size: "inline" }));
  const search = iconPage.querySelector("[data-search]");
  search.addEventListener("input", () => {
    state.query = search.value;
    library();
  });

  const sizesHost = iconPage.querySelector("[data-size-switch]");
  ["16", "20", "22", "28"].forEach((label, index) => {
    const button = el("button", "", label);
    button.type = "button";
    button.setAttribute("aria-pressed", index === state.size ? "true" : "false");
    button.addEventListener("click", () => {
      state.size = index;
      sizesHost.querySelectorAll("button").forEach((item, i) => {
        item.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
      library();
    });
    sizesHost.append(button);
  });

  const colorsHost = iconPage.querySelector("[data-colors]");
  colors.forEach(([name, color], index) => {
    const button = el("button");
    button.type = "button";
    button.title = name;
    button.setAttribute("aria-label", name);
    button.style.background = color;
    button.setAttribute("aria-pressed", index === state.color ? "true" : "false");
    button.addEventListener("click", () => {
      state.color = index;
      colorsHost.querySelectorAll("button").forEach((item, i) => {
        item.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
      library();
    });
    colorsHost.append(button);
  });
}

function tiles() {
  const rows = [
    ["Neutral tile", "Default for list rows and quick actions", "var(--surface-sunken)", "var(--text-primary)", "account", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Brand tile", "Selected item, promoted feature", "var(--brand-100)", "var(--brand-600)", "sparkles", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Success", "Settled, verified, done", "var(--brand-100)", "var(--brand-600)", "success", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Warning", "Pending, needs action", "var(--status-warning-tint)", "var(--status-warning)", "pending", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Error", "Declined, failed", "var(--status-error-tint)", "var(--status-danger)", "error", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Info", "Frozen, information", "var(--status-info-tint)", "var(--status-info)", "freeze", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["On gradient", "White icon on primary or card art", "rgba(255,255,255,.18)", "var(--text-on-brand)", "wallet", "var(--gradient-card)", "var(--text-on-brand)", "var(--brand-300)"],
    ["On ink", "Tooltips, dark cards", "rgba(255,255,255,.1)", "var(--text-on-brand)", "lock", "var(--surface-inverse)", "var(--text-on-brand)", "var(--text-disabled)"],
  ];
  const host = iconPage.querySelector("[data-tiles]");
  rows.forEach(([title, copy, tileBg, tileFg, name, card, titleColor, copyColor]) => {
    const tile = el("div", "tile");
    tile.style.background = card;
    const iconBox = el("span", "tile-icon");
    iconBox.style.background = tileBg;
    iconBox.style.color = tileFg;
    iconBox.append(draw(name, { size: "nav" }));
    const heading = el("strong", "", title);
    heading.style.color = titleColor;
    const text = el("p", "", copy);
    text.style.color = copyColor;
    tile.append(iconBox, heading, text);
    host.append(tile);
  });
}

function components() {
  const slots = {
    add: () => draw("add", { stroke: "2" }),
    download: () => draw("download", { px: 18 }),
    more: () => draw("more"),
    account: () => draw("account"),
    next: () => draw("next", { px: 18 }),
    search: () => draw("search", { px: 18 }),
    close: () => draw("close", { size: "inline" }),
    confirm: () => draw("confirm", { px: 14, stroke: "2.4" }),
    freeze: () => draw("freeze", { px: 14, stroke: "2" }),
  };
  iconPage.querySelectorAll("#components [data-icon]").forEach((slot) => {
    const make = slots[slot.dataset.icon];
    if (make) slot.append(make());
  });

  const tabs = [
    ["Home", "home", true],
    ["Cards", "cards", false],
    ["Payments", "transfers", false],
    ["More", "more", false],
  ];
  const host = iconPage.querySelector("[data-tabs]");
  tabs.forEach(([label, name, on]) => {
    const tab = el("span", on ? "tab is-on" : "tab");
    tab.append(draw(name, { size: "nav", active: on }), document.createTextNode(label));
    host.append(tab);
  });
}

function direction() {
  const flip = [
    ["Back", "back"],
    ["Next", "next"],
    ["Send", "transfers"],
    ["Sign out", "sign-out"],
    ["Undo", "refund"],
    ["Sidebar", "sidebar"],
  ];
  const keep = [
    ["Search", "search"],
    ["Check", "confirm"],
    ["Bell", "notifications"],
    ["Card", "cards"],
    ["Clock", "pending"],
    ["Chart", "bar-chart"],
  ];
  const mirror = iconPage.querySelector("[data-rtl-flip]");
  flip.forEach(([label, name]) => {
    const item = el("div", "mirror-item");
    const pair = el("div", "mirror-pair");
    pair.append(draw(name, { size: "nav" }), el("span", "arrow", "→"), draw(name, { size: "nav", flip: true }));
    item.append(pair, el("span", "", label));
    mirror.append(item);
  });
  const steady = iconPage.querySelector("[data-rtl-keep]");
  keep.forEach(([label, name]) => {
    const item = el("div", "mirror-item");
    item.append(draw(name, { size: "nav" }), el("span", "", label));
    steady.append(item);
  });
}

function practice() {
  const host = iconPage.querySelector("[data-dos]");
  const cards = [
    [true, "Use one size and stroke across a row of icons.", () => [
      draw("transfers"),
      draw("wallet"),
      draw("notifications"),
    ]],
    [false, "Don't mix sizes or strokes in the same row.", () => [
      draw("transfers", { px: 16, stroke: "1.2" }),
      draw("wallet", { px: 26, stroke: "2.6" }),
      draw("notifications"),
    ]],
    [true, "Color icons with the text color or a status color.", () => {
      const ok = el("span");
      ok.style.color = "var(--brand-600)";
      ok.append(draw("success", { px: "var(--size-badge)" }));
      const bad = el("span");
      bad.style.color = "var(--status-danger)";
      bad.append(draw("error", { px: "var(--size-badge)" }));
      return [ok, bad];
    }],
    [false, "Don't use gradients, fills or random colors on icons.", () => {
      const pink = el("span");
      pink.style.color = "#E879F9";
      pink.append(draw("transfers", { px: "var(--size-badge)" }));
      const amber = el("span");
      amber.style.color = "#F59E0B";
      amber.append(draw("wallet", { px: "var(--size-badge)", fill: "#FDE68A" }));
      return [pink, amber];
    }],
    [true, "Pair icon-only buttons with a tooltip.", () => {
      const row = el("span", "tip");
      const button = el("span", "btn-icon");
      button.append(draw("download", { px: 18 }));
      row.append(button, el("span", "tip-bubble", "Download"));
      return [row];
    }],
    [false, "Don't mix Lucide with other icon sets or emoji.", () => {
      const emoji = el("span", "", "💳");
      emoji.style.fontSize = "var(--icon-nav)";
      emoji.style.lineHeight = "1";
      const block = el("span");
      block.style.width = "var(--icon-nav)";
      block.style.height = "var(--icon-nav)";
      block.style.borderRadius = "var(--radius-xs)";
      block.style.background = "var(--text-primary)";
      return [draw("transfers", { size: "nav" }), emoji, block];
    }],
  ];
  cards.forEach(([ok, text, demo]) => {
    const card = el("div", "do-card");
    const stage = el("div", "do-stage");
    demo().forEach((node) => stage.append(node));
    stage.append(el("span", ok ? "mark ok" : "mark no", ok ? "✓" : "×"));
    card.append(stage, el("p", "", text));
    host.append(card);
  });
}

function developers() {
  const rows = [
    ["Web · React", "npm i lucide-react@0.453.0\n\nimport { Send } from 'lucide-react';\n\n<Send size={20} strokeWidth={1.7}\n  absoluteStrokeWidth={false} />", "Make a <HalaIcon> wrapper with size 20 and stroke 1.7 as defaults."],
    ["Flutter", "flutter pub add lucide_icons_flutter\n\nIcon(LucideIcons.send,\n  size: 20, color: ink)", "Flutter icon fonts have a fixed stroke. If 1.7 matters, import the SVGs with flutter_svg instead."],
    ["iOS · Android native", "npm i lucide-static@0.453.0\n# icons/*.svg → set stroke-width=\"1.7\"\n# iOS: add to Assets as Symbol Image\n# Android: import as Vector Asset", "Convert only the icons on this page. Keep the kebab-case names, e.g. ic_credit_card."],
  ];
  const host = iconPage.querySelector("[data-dev]");
  rows.forEach(([title, code, note]) => {
    const card = el("div", "dev");
    const pre = el("pre");
    pre.textContent = code;
    card.append(el("strong", "", title), pre, el("span", "hint", note));
    host.append(card);
  });
}

if (!window.lucide || !window.lucide.icons) {
  const note = iconPage.querySelector("[data-groups]");
  if (note) note.textContent = "Lucide did not load. Open this page from the Falcon 2.0 folder.";
} else {
  specs();
  anatomy();
  strokes();
  sizes();
  toolbar();
  library();
  tiles();
  components();
  direction();
  practice();
  developers();
}
