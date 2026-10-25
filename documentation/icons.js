(function () {
const iconPage = document.querySelector('[data-page="icons"]') || document;
const iconSet = window.halaIcons;
const sizeKeys = ["inline", "default", "nav", "feature"];
const colors = [
  ["Ink", "var(--text-primary)", "default"],
  ["Tertiary", "var(--text-tertiary)", ""],
  ["Green 600", "var(--action-primary)", ""],
  ["Danger", "var(--status-danger)", ""],
];

const groups = [
  ["NAVIGATION", [
    ["Dashboard", "dashboard"],
    ["Transactions", "transactions"],
    ["Transfers", "transfers"],
    ["Payroll", "payroll"],
    ["Cards", "cards"],
    ["SADAD", "sadad"],
    ["POS", "pos"],
    ["eCommerce", "ecommerce"],
    ["Invoicing", "invoicing"],
    ["Food delivery", "food-delivery"],
    ["Locations", "locations"],
    ["Users", "users"],
    ["Documents", "documents"],
    ["Help", "help"],
    ["Settings", "settings"],
  ]],
  ["MONEY", [
    ["Account", "account"],
    ["Wallet", "wallet"],
    ["Cash", "cash"],
    ["Savings", "savings"],
    ["Income", "income"],
    ["Outgoing", "outgoing"],
    ["Trend up", "trend-up"],
    ["Trend down", "trend-down"],
    ["Bar chart", "bar-chart"],
    ["Line chart", "line-chart"],
    ["Percent", "percent"],
    ["Refund", "refund"],
    ["QR pay", "qr-pay"],
    ["Contactless", "contactless"],
  ]],
  ["ACTIONS", [
    ["Add", "add"],
    ["Close", "close"],
    ["Confirm", "confirm"],
    ["Edit", "edit"],
    ["Delete", "delete"],
    ["Copy", "copy"],
    ["Download", "download"],
    ["Upload", "upload"],
    ["Share", "share"],
    ["Filter", "filter"],
    ["Adjust", "adjust"],
    ["Search", "search"],
    ["Refresh", "refresh"],
    ["More", "more"],
    ["Open link", "open-link"],
    ["Link", "link-2"],
  ]],
  ["SECURITY", [
    ["Lock", "lock"],
    ["Unlock", "unlock"],
    ["Verified", "verified"],
    ["Fingerprint", "fingerprint"],
    ["Face ID", "face-id"],
    ["Show", "show"],
    ["Hide", "hide"],
    ["Freeze", "freeze"],
    ["Key", "key"],
    ["Sign out", "sign-out"],
  ]],
  ["STATUS", [
    ["Success", "success"],
    ["Error", "error"],
    ["Warning", "warning"],
    ["Info", "info"],
    ["Pending", "pending"],
    ["Notifications", "notifications"],
    ["Muted", "muted"],
    ["Offline", "offline"],
  ]],
  ["BUSINESS AND CONTENT", [
    ["Company", "company"],
    ["Shop", "shop"],
    ["Delivery", "delivery"],
    ["Product", "product"],
    ["Tag", "tag"],
    ["Calendar", "calendar"],
    ["Camera", "camera"],
    ["Image", "image"],
    ["Attachment", "attachment"],
    ["Email", "email"],
    ["Phone", "phone"],
    ["Chat", "chat"],
    ["Language", "language"],
    ["Support", "support"],
    ["24h support", "support-24"],
    ["Gift", "gift"],
  ]],
  ["ARROWS", [
    ["Back", "back"],
    ["Forward", "forward"],
    ["Expand", "expand"],
    ["Next", "next"],
    ["Previous", "previous"],
    ["Collapse", "collapse"],
    ["Sort", "sort"],
    ["Sidebar", "sidebar"],
  ]],
];

const state = { size: 1, color: 0, query: "" };
let copiedTimer = 0;

const iconSizes = {
  inline: "--icon-inline",
  default: "--icon-default",
  nav: "--icon-nav",
  feature: "--icon-feature",
};

function pascal(kebab) {
  return kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function halaName(key) {
  return iconSet.catalog[key] || key;
}

function isLucide(key) {
  return iconSet.icons[pascal(halaName(key))].set === "lucide";
}

function icon(name, options = {}) {
  const kebab = halaName(name);
  const node = iconSet.icons[pascal(kebab)];
  if (!node) throw new Error(`Unknown HALA DNA icon "${name}"`);
  const size = iconSizes[options.size] ? options.size : "default";
  const svg = iconSet.createElement(node);
  svg.classList.add("hala-icon");
  svg.dataset.size = size;
  svg.dataset.icon = kebab;
  svg.style.width = `var(${iconSizes[size]})`;
  svg.style.height = `var(${iconSizes[size]})`;
  if (options.tone) svg.dataset.tone = options.tone;
  if (iconSet.mirror.has(kebab)) svg.dataset.mirror = "true";
  if (options.active) svg.dataset.active = "true";
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

function draw(name, { size = "default", active = false, tone, px, flip } = {}) {
  const svg = icon(name, { size, active, tone });
  if (px) {
    const length = typeof px === "number" ? `${px}px` : px;
    svg.style.width = length;
    svg.style.height = length;
  }
  if (flip) svg.classList.add("is-flipped");
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
  const rows = [
    ["GRID", `${grid} × ${grid}`, "Hala DNA canvas, scaled to 16, 20, 22 or 28"],
    ["STYLE", "Twotone fill", "Filled shapes in two tones. No strokes."],
    ["TONES", "primary · secondary", "icon/primary and icon/secondary"],
    ["COLOR", "currentColor", "Inherit text color; never hard-code"],
    ["SOURCE", "HALA DNA", "1,027 icons on the Figma Source board"],
  ];
  const host = iconPage.querySelector("[data-specs]");
  rows.forEach(([k, v, d]) => {
    const card = el("div", "spec");
    card.append(el("span", "kicker quiet", k), el("b", "", v), el("span", "sub", d));
    host.append(card);
  });
}

function anatomy() {
  mount(iconPage.querySelector("[data-anatomy]"), draw("cards", { tone: "default", px: "100%" }));
}

function tones() {
  const host = iconPage.querySelector("[data-tones]");
  const rows = [
    ["default", "Default · text/primary + text/tertiary", true],
    ["secondary", "Secondary · text/secondary + text/tertiary", false],
    ["", "One color · currentColor for both tones", false],
  ];
  rows.forEach(([tone, label, hala]) => {
    const row = el("div", hala ? "stroke-row is-hala" : "stroke-row");
    const icons = el("div", "stroke-icons");
    ["transactions", "cards", "notifications"].forEach((name) => {
      icons.append(draw(name, tone ? { tone } : {}));
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
  const samples = ["home", "transfers", "cards", "search", "settings"];
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
    const matches = items.filter(([label, key]) => {
      if (!q) return true;
      return [label, name, key, halaName(key)].join(" ").toLowerCase().includes(q);
    });
    if (!matches.length) return;
    shown += matches.length;
    const group = el("div", "group");
    group.append(el("span", "group-name", `${name} · ${items.length}`));
    const grid = el("div", "icon-grid");
    matches.forEach(([label, key]) => {
      const [, color, tone] = colors[state.color];
      const button = el("button", "icon-cell");
      button.type = "button";
      button.title = `${key} · ${halaName(key)}`;
      button.style.color = color;
      button.append(draw(key, { size: sizeKeys[state.size], tone }));
      const text = el("span");
      text.append(el("span", "label", label), el("span", "code", key));
      if (isLucide(key)) text.append(el("span", "set-tag", "LUCIDE"));
      button.append(text);
      button.addEventListener("click", () => {
        showCopied(key);
        const clipboard = navigator.clipboard;
        if (clipboard) clipboard.writeText(key).catch(() => {});
      });
      grid.append(button);
    });
    group.append(grid);
    host.append(group);
  });
  empty.hidden = !q || shown > 0;
  empty.textContent = `No approved icon matches "${state.query}". Find it on the HALA DNA Icons page in Figma, then ask design to add it to the set.`;
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
    ["Brand tile", "Selected item, promoted feature", "var(--action-soft)", "var(--action-primary)", "sparkles", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Success", "Settled, verified, done", "var(--action-soft)", "var(--action-primary)", "success", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Warning", "Pending, needs action", "var(--status-warning-tint)", "var(--status-warning)", "pending", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Error", "Declined, failed", "var(--status-error-tint)", "var(--status-danger)", "error", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["Info", "Frozen, information", "var(--status-info-tint)", "var(--status-info)", "freeze", "var(--surface-card)", "var(--text-primary)", "var(--text-tertiary)"],
    ["On gradient", "White icon on primary or card art", "rgba(255,255,255,.18)", "var(--text-on-brand)", "cards", "var(--gradient-card)", "var(--text-on-brand)", "var(--brand-300)"],
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
    add: () => draw("add"),
    download: () => draw("download", { px: 18 }),
    more: () => draw("more"),
    account: () => draw("account"),
    next: () => draw("next", { px: 18 }),
    search: () => draw("search", { px: 18 }),
    close: () => draw("close", { size: "inline" }),
    confirm: () => draw("success", { px: 14 }),
    freeze: () => draw("freeze", { px: 14 }),
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
    ["Check", "success"],
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

function tinted(color, node) {
  const wrap = el("span");
  wrap.style.color = color;
  wrap.append(node);
  return wrap;
}

function labelButton(label, name, after) {
  const button = el("span", "btn-secondary");
  const glyph = draw(name, { px: 18 });
  if (after) button.append(document.createTextNode(label), glyph);
  else button.append(glyph, document.createTextNode(label));
  return button;
}

function practice() {
  const host = iconPage.querySelector("[data-dos]");
  const cards = [
    [true, "Use one size across a row of icons.", () => [
      draw("transfers"),
      draw("cards"),
      draw("notifications"),
    ]],
    [false, "Mix sizes or strokes in the same row.", () => [
      draw("transfers", { px: 14 }),
      draw("cards", { px: 28 }),
      draw("notifications"),
    ]],
    [true, "Color icons with the text color or a status color.", () => [
      tinted("var(--action-primary)", draw("success", { px: "var(--size-badge)" })),
      tinted("var(--status-danger)", draw("error", { px: "var(--size-badge)" })),
    ]],
    [false, "Use status colors for decoration.", () => [
      tinted("var(--status-warning)", draw("transfers", { px: "var(--size-badge)" })),
      tinted("var(--status-info)", draw("cards", { px: "var(--size-badge)" })),
    ]],
    [true, "Put the icon before the label. Icon-only buttons need a tooltip.", () => {
      const row = el("span", "tip");
      const button = el("span", "btn-icon");
      button.append(draw("download", { px: 18 }));
      row.append(button, el("span", "tip-bubble", "Download"));
      return [labelButton("Export", "download"), row];
    }],
    [false, "Put icons after the label, except arrows (→) and menus (⌄).", () => [
      labelButton("Export", "download", true),
    ]],
    [true, "Mirror icons that show direction in Arabic: back, next, send.", () => [
      draw("back", { size: "nav", flip: true }),
      draw("next", { size: "nav", flip: true }),
      draw("transfers", { size: "nav", flip: true }),
    ]],
    [false, "Mirror objects and symbols: search, check, bell, card.", () => [
      draw("search", { size: "nav", flip: true }),
      draw("notifications", { size: "nav", flip: true }),
      draw("cards", { size: "nav", flip: true }),
    ]],
  ];
  cards.forEach(([ok, text, demo]) => {
    const card = el("div", "do-card");
    const stage = el("div", "do-stage");
    demo().forEach((node) => stage.append(node));
    stage.append(el("span", ok ? "mark ok" : "mark no", ok ? "✓" : "×"));
    card.append(stage, el("p", "", `${ok ? "Do" : "Don't"}: ${text}`));
    host.append(card);
  });
}

function developers() {
  const rows = [
    ["Web", "<script src=\"vendor/hala-icons.js\"></script>\n\nimport { icon } from './icons/api.js';\n\nbutton.append(icon('transfers'));\ntile.append(icon('cards', { tone: 'default' }));", "HALA DNA names come from icons/api.js. Both tones use currentColor unless you pass a tone."],
    ["Web · React", "const HalaIcon = ({ name, size = 'default', ...p }) =>\n  <span ref={(n) => n && n.replaceChildren(\n    icon(name, { size }))} {...p} />;", "Wrap icon() once. Keep the HALA DNA name and size tokens as props."],
    ["iOS · Android native", "# Figma: HALA DNA · Icons · Source\n# Export SVG at 16 × 16, keep both tones\n# iOS: Assets as Symbol Image\n# Android: import as Vector Asset", "Export only the icons on this page. Keep the kebab-case names, e.g. ic_credit_card."],
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

if (!iconSet || !iconSet.icons) {
  const note = iconPage.querySelector("[data-groups]");
  if (note) note.textContent = "Hala icons did not load. Open this page from the HALA DNA folder.";
} else {
  specs();
  anatomy();
  tones();
  sizes();
  toolbar();
  library();
  tiles();
  components();
  direction();
  practice();
  developers();
}
})();
