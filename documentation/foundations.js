const css = () => getComputedStyle(document.documentElement);

const value = (name) => css().getPropertyValue(name).trim();

const tokenName = (variable) => variable.replace(/^--/, "").replace("-", "/");

const hex = (variable) => value(variable).toUpperCase();

function lum(color) {
  const h = color.replace("#", "");
  const channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const linear = channels.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function ratio(a, b) {
  const x = lum(a);
  const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function grade(r) {
  if (r >= 7) return "AAA";
  if (r >= 4.5) return "AA";
  return "Large";
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function copyText(text) {
  const done = () => {
    const slot = document.querySelector('[data-page="styles"] [data-copied]');
    slot.textContent = `Copied ${text}`;
    clearTimeout(copyText.timer);
    copyText.timer = setTimeout(() => {
      slot.textContent = "";
    }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(done);
    return;
  }
  done();
}

const palettes = [
  ["Brand", "Logo, primary buttons, links, focus and selection.", [
    ["Hala green", "--brand-500", "Logo, app icon. Not for text below 18 px."],
    ["Green 600", "--brand-600", "Selected states, checkboxes, toggles, chart line."],
    ["Green 700", "--brand-700", "Gradient start, pressed primary."],
    ["Green 800 · link", "--brand-800", "Text links and tertiary buttons."],
    ["Mint 300", "--brand-300", "Chart fills, illustrations, decorative."],
    ["Mint 100", "--brand-100", "Success tint, selected rows, chips on."],
    ["Mint 50", "--brand-50", "Hover on selected, soft highlight."],
  ]],
  ["Ink and text", "Text uses ink at three strengths. Never pure black.", [
    ["Ink", "--text-primary", "Headings, body, values, dark buttons."],
    ["Secondary", "--text-secondary", "Descriptions, supporting text."],
    ["Tertiary", "--text-tertiary", "Captions, meta, helper text, icons."],
    ["Muted label", "--text-label", "Mono section labels (UPPERCASE)."],
    ["Disabled", "--text-disabled", "Disabled text and placeholder icons."],
  ]],
  ["Surfaces", "White cards sit on the mint-gray canvas. Gray containers sit inside cards.", [
    ["Canvas", "--surface-canvas", "App and page background."],
    ["Card", "--surface-card", "Cards, sidebar, modals, inputs."],
    ["Subtle", "--surface-subtle", "Containers inside cards, mobile screen bg."],
    ["Sunken", "--surface-sunken", "Icon tiles, avatars, segmented track."],
    ["Hover", "--surface-hover", "Row and button hover on white."],
    ["Inverse", "--surface-inverse", "Tooltips, dark cards, selected pills."],
  ]],
  ["Borders", "All borders are 1 px. Pick by how strong the edge needs to be.", [
    ["Divider", "--border-subtle", "List rows, inside cards."],
    ["Default", "--border-default", "Card edges, labelled dividers."],
    ["Control", "--border-control", "Outline buttons, chips, steppers."],
    ["Input", "--border-input", "Text fields at rest."],
    ["Strong", "--border-strong", "Table header, sheet handle."],
  ]],
  ["Status", "Each status has a strong color for icons and a tint + text pair for badges and alerts.", [
    ["Success", "--status-success", "Settled, verified, done.", "--status-success-tint", "--status-success-text"],
    ["Warning", "--status-warning", "Pending, needs action.", "--status-warning-tint", "--status-warning-text"],
    ["Error", "--status-error", "Field errors, declined.", "--status-error-tint", "--status-error-text"],
    ["Danger", "--status-danger", "Destructive buttons and menu items."],
    ["Info", "--status-info", "Frozen, information.", "--status-info-tint", "--status-info-text"],
    ["Scheduled", "--status-scheduled", "Scheduled payments.", "--status-scheduled-tint", "--status-scheduled-text"],
    ["Badge red", "--status-count", "Notification counts and unread dots only."],
  ]],
  ["Data visualisation", "Order for chart series. Green first, then blue, amber, purple.", [
    ["Series 1", "--chart-1", "Main series, income, POS sales."],
    ["Series 2", "--chart-2", "Comparison, previous period."],
    ["Series 3", "--chart-3", "Third category."],
    ["Series 4", "--chart-4", "Fourth category."],
    ["Grid line", "--chart-grid", "Axes and grid lines."],
  ]],
];

const grads = [
  ["Primary button", "--gradient-primary", "One primary per screen."],
  ["Card · emerald", "--gradient-card", "Default corporate card art."],
  ["Haze", "--gradient-haze", "Onboarding and sign-in background."],
  ["Approved banner", "--gradient-approved", "Verified company card (KYB)."],
];

const pairs = [
  ["Ink on white", "--text-primary", "--surface-card"],
  ["Secondary on white", "--text-secondary", "--surface-card"],
  ["Tertiary on canvas", "--text-tertiary", "--surface-canvas"],
  ["White on green 700", "--text-on-brand", "--brand-700"],
  ["Link on white", "--brand-800", "--surface-card"],
  ["Success text on tint", "--status-success-text", "--status-success-tint"],
  ["Warning text on tint", "--status-warning-text", "--status-warning-tint"],
  ["Error text on tint", "--status-error-text", "--status-error-tint"],
];

const families = [
  ["Interface", "IBM Plex Sans", "--font-sans", "Aa", "Business banking for Saudi companies", "300 · 400 · 500 · 600 · 700", "ltr"],
  ["Numbers and labels", "IBM Plex Mono", "--font-mono", "0 1", "SAR 175,000.00 · SA57 •• 1951", "400 · 500 · 600", "ltr"],
  ["Arabic", "IBM Plex Sans Arabic", "--font-arabic", "أب", "خدمات مصرفية للشركات", "400 · 500 · 600 · 700", "rtl"],
];

const scale = [
  ["display", "Page hero, onboarding", "Welcome", "48/52 · 700", "34/40 · 700"],
  ["heading-xl", "Page title", "Transactions", "34/40 · 700", "28/34 · 700"],
  ["heading-l", "Section title", "Recent activity", "26/32 · 700", "22/28 · 700"],
  ["heading-m", "Card and modal title", "Add beneficiary", "18/24 · 700", "19/24 · 700"],
  ["body-l", "Intro paragraphs", "We check the IBAN with the bank before saving.", "17/26 · 400", "17/24 · 400"],
  ["body-m", "Default UI text", "Payments you send and receive appear here.", "15/22 · 400", "16/22 · 400"],
  ["body-s", "Descriptions, helper", "Must be registered to the owner's ID.", "13.5/20 · 400", "14/20 · 400"],
  ["label-m", "Buttons, row titles", "Continue", "15/20 · 600", "16/20 · 600"],
  ["caption", "Meta, timestamps", "Today, 12:41 · mada", "12.5/16 · 400", "13/16 · 400"],
  ["overline", "Section labels", "Accept payments", "11/14 · 500 · +12%", "11/14 · 500 · +12%"],
  ["amount-xl", "Balances, totals", "SAR 175,000.00", "32/36 · 600", "30/34 · 600"],
  ["amount-m", "List amounts, IBANs", "− 25,000.00", "15/20 · 500", "15/20 · 500"],
];

const typeRules = [
  ["Numbers in Mono", "Amounts, IBANs, card digits, dates and codes use Plex Mono so columns line up."],
  ["Amount format", 'Sign, space, thousands comma, 2 decimals: "− 25,000.00". Currency SAR before the number.'],
  ["Weights", "Use 400, 500, 600 and 700. 300 is only for the HALA wordmark in headers."],
  ["Mobile minimum", "Body 16 pt on iOS and Android to avoid zoom and to meet Dynamic Type."],
];

const arMap = [
  ["heading/xl", "34/40 · 700", "36/48 · 700", "+2 px, line height ×1.35"],
  ["heading/m", "18/24 · 700", "19/28 · 700", "+1 px"],
  ["body/m", "15/22 · 400", "16/28 · 400", "Line height 1.75 for readability"],
  ["body/s", "13.5/20 · 400", "14.5/24 · 400", ""],
  ["label/m", "15/20 · 600", "16/24 · 600", "Buttons keep 600"],
  ["overline", "11 Mono caps", "12/16 · 600", "No caps or letter-spacing in Arabic"],
];

const rtl = [
  ["Mirror the layout", "Sidebar right, back arrow points right, progress fills right to left."],
  ["Don't mirror", "Numbers, IBANs, card numbers, charts' time axis, media controls, the logo."],
  ["Icons", "Mirror direction icons (arrows, send). Keep symbols as is (check, search, bell)."],
  ["Gradients", "Reverse button gradients so the darker side stays at the start."],
  ["Letter-spacing", "Never add letter-spacing to Arabic; it breaks the connected letters."],
  ["Mixed text", "Wrap numbers and Latin names in a direction-isolated span (unicode-bidi: isolate)."],
];

const space = [
  ["--space-1", "Icon to text in a badge"],
  ["--space-2", "Chip gap, icon to label"],
  ["--space-3", "Card grid gap, row gap"],
  ["--space-4", "Card padding (compact), mobile margin"],
  ["--space-5", "Modal padding"],
  ["--space-6", "Card padding, group gap"],
  ["--space-7", "Large card padding"],
  ["--space-8", "Page side padding (web)"],
  ["--space-10", "Onboarding column gap"],
  ["--space-12", "Header to first section"],
  ["--space-14", "Between page sections"],
];

const pads = [
  ["Button", "0 20 · icon gap 8"],
  ["Input", "0 14 · label gap 2"],
  ["Chip / badge", "0 12 / 0 10"],
  ["Card · web", "24 28"],
  ["Card · mobile", "16"],
  ["Modal", "20 · footer 14 20 18"],
  ["List row", "14 0 · inset 52"],
];

const heights = [
  ["Badge", "--size-badge", "var(--radius-pill)", "var(--brand-100)"],
  ["Small", "--size-sm", "var(--radius-pill)", "var(--border-default)"],
  ["Default", "--size-md", "var(--radius-pill)", "var(--border-strong)"],
  ["Web primary", "--size-control-web", "var(--radius-pill)", "var(--brand-300)"],
  ["Mobile", "--size-control-mobile", "var(--radius-pill)", "var(--brand-600)"],
  ["Input", "--size-input", "var(--radius-s)", "var(--text-primary)"],
];

const radii = [
  ["--radius-xs", "Checkbox inner, chart bars"],
  ["--radius-s", "Inputs, small tiles"],
  ["--radius-m", "Icon tiles, menu items, day cells"],
  ["--radius-l", "Inner cards, list groups"],
  ["--radius-xl", "Cards, modals, mobile groups"],
  ["--radius-2xl", "Page cards, sidebar"],
  ["--radius-sheet", "Bottom sheet top, mobile screen"],
  ["--radius-pill", "Buttons, chips, badges, toggles"],
];

const shadows = [
  ["Flat", "--shadow-0", "Default card on canvas. No shadow."],
  ["Raised", "--shadow-1", "Hover on clickable cards, segmented pill."],
  ["Floating", "--shadow-2", "Toasts, menus, popovers."],
  ["Overlay", "--shadow-3", "Modals, date pickers, sidebar."],
  ["Dialog", "--shadow-4", "Command menu, large modals."],
  ["Primary glow", "--shadow-brand", "Gradient primary button only."],
];

const motion = [
  ["--motion-instant", "--ease-out", "Hover, color, press"],
  ["--motion-fast", "--ease-out", "Backdrop fade, tooltip"],
  ["--motion-standard", "--ease-standard", "Drawer, toggle, segment pill"],
  ["--motion-emphasis", "--ease-standard", "Accordion, chevron, card lift"],
  ["--motion-sheet", "--ease-sheet", "Bottom sheet, full-screen modal"],
];

const icons = [
  ["Inline", "--icon-inline", "--icon-tile-inline", "--radius-s"],
  ["Default", "--icon-default", "--icon-tile-default", "--radius-m"],
  ["Nav", "--icon-nav", "--icon-tile-nav", "--radius-m"],
  ["Feature", "--icon-feature", "--icon-tile-feature", "--radius-l"],
];

const breakpoints = [
  ["Mobile", "< 600", "Native app or 1 column, 16 margin"],
  ["Tablet", "600–1023", "2 columns, sidebar collapsed"],
  ["Desktop", "1024–1439", "Sidebar 272 + 12-column grid"],
  ["Wide", "≥ 1440", "Content max-width 1240"],
  ["Sidebar rail", "80", "Collapsed sidebar width"],
];

const layout = [
  ["Content max width", "1240 px"],
  ["Grid", "12 columns · gap 12"],
  ["Sidebar", "272 / 80 px"],
  ["Top bar", "72 px"],
  ["Mobile tab bar", "84 pt incl. home bar"],
  ["Touch target", "≥ 44 pt (iOS) · 48 dp (Android)"],
];

function renderPalettes(root) {
  palettes.forEach(([name, desc, items]) => {
    const block = el("div", "stack");
    const title = el("div", "group-title");
    title.append(el("strong", "", name), el("span", "", desc));
    const grid = el("div", "swatches");
    items.forEach(([label, variable, use, tint, ink]) => {
      if (tint) use = `${use} Tint ${hex(tint)} · text ${hex(ink)}.`;
      const color = hex(variable);
      const onWhite = ratio(color, hex("--surface-card"));
      const onInk = ratio(color, hex("--text-primary"));
      const onLight = onWhite >= onInk;
      const button = el("button", "swatch");
      button.type = "button";
      button.title = `Copy ${color}`;
      button.addEventListener("click", () => copyText(color));
      const chip = el("span", "swatch-color");
      chip.style.background = `var(${variable})`;
      const ratioLabel = el("span", "swatch-ratio", `${(onLight ? onWhite : onInk).toFixed(1)}:1`);
      ratioLabel.style.color = onLight ? "var(--text-on-brand)" : "var(--text-primary)";
      chip.append(ratioLabel);
      const body = el("span", "swatch-body");
      body.append(
        el("span", "swatch-name", label),
        el("span", "tok", tokenName(variable)),
        el("span", "mono", color),
        el("span", "use", use),
      );
      button.append(chip, body);
      grid.append(button);
    });
    block.append(title, grid);
    root.append(block);
  });
}

function renderGrads(root) {
  grads.forEach(([name, variable, use]) => {
    const row = el("div", "grad-row");
    const chip = el("span", "grad-chip");
    chip.style.background = `var(${variable})`;
    const copy = el("div", "grad-copy");
    copy.append(el("span", "grad-name", name), el("span", "mono ellipsis", value(variable)), el("span", "use", use));
    row.append(chip, copy);
    root.append(row);
  });
}

function renderPairs(root) {
  pairs.forEach(([name, fg, bg]) => {
    const r = ratio(hex(fg), hex(bg));
    const row = el("div", "pair-row");
    const chip = el("span", "pair-chip", "Aa");
    chip.style.background = `var(${bg})`;
    chip.style.color = `var(${fg})`;
    const score = el("span", "tok", `${r.toFixed(1)}:1 ${grade(r)}`);
    if (r < 4.5) score.style.color = "var(--status-warning)";
    row.append(chip, el("span", "pair-copy", name), score);
    root.append(row);
  });
}

function renderFamilies(root) {
  families.forEach(([role, name, variable, glyph, sample, weights, dir]) => {
    const card = el("div", "family");
    card.append(el("span", "kicker quiet", role));
    const mark = el("span", "glyph", glyph);
    mark.style.fontFamily = `var(${variable})`;
    mark.dir = dir;
    const line = el("span", "family-sample", sample);
    line.style.fontFamily = `var(${variable})`;
    line.dir = dir;
    card.append(mark, el("span", "family-name", name), line, el("span", "mono", weights));
    root.append(card);
  });
}

function renderScale(root) {
  const head = el("div", "scale table-head");
  ["Token", "Sample", "Web", "Mobile"].forEach((label) => head.append(el("span", "", label)));
  root.append(head);
  scale.forEach(([id, use, sample, web, mobile]) => {
    const row = el("div", "scale");
    const name = el("div", "stack");
    name.style.gap = "var(--space-1)";
    name.append(el("span", "tok", id.replace("-", "/")), el("span", "use", use));
    const specimen = el("span", "sample", sample);
    specimen.style.fontFamily = `var(--type-${id}-family)`;
    specimen.style.fontSize = `var(--type-${id}-size)`;
    specimen.style.fontWeight = `var(--type-${id}-weight)`;
    specimen.style.letterSpacing = `var(--type-${id}-tracking)`;
    specimen.style.lineHeight = `var(--type-${id}-line)`;
    specimen.style.textTransform = `var(--type-${id}-transform)`;
    row.append(name, specimen, el("span", "mono mono-strong", web), el("span", "mono mono-strong", mobile));
    root.append(row);
  });
}

function renderRules(root, rows) {
  rows.forEach(([title, body]) => {
    const card = el("div", "rule");
    card.append(el("strong", "", title), el("span", "use", body));
    root.append(card);
  });
}

function renderArTable(root) {
  const head = el("div", "ar-table table-head");
  ["Style", "English", "Arabic", "Note"].forEach((label) => head.append(el("span", "", label)));
  root.append(head);
  arMap.forEach(([style, en, ar, note]) => {
    const row = el("div", "ar-table");
    row.append(el("span", "label", style), el("span", "mono mono-strong", en), el("span", "mono mono-strong", ar), el("span", "use", note));
    root.append(row);
  });
}

function renderSpace(root) {
  space.forEach(([variable, use]) => {
    const row = el("div", "space-row");
    const bar = el("span", "bar");
    bar.style.width = `var(${variable})`;
    const wrap = el("div", "bar-wrap");
    wrap.append(bar, el("span", "use ellipsis", use));
    row.append(el("span", "tok", tokenName(variable)), el("span", "mono mono-strong", value(variable)), wrap);
    root.append(row);
  });
}

function renderPairsList(root, rows) {
  rows.forEach(([name, spec]) => {
    const row = el("div", "pad-row");
    row.append(el("span", "", name), el("span", "", spec));
    root.append(row);
  });
}

function renderHeights(root) {
  heights.forEach(([name, variable, radius, background]) => {
    const item = el("div", "height");
    const mark = document.createElement("i");
    mark.style.height = `var(${variable})`;
    mark.style.borderRadius = radius;
    mark.style.background = background;
    item.append(mark, el("span", "mono mono-strong", value(variable)), el("span", "use", name));
    root.append(item);
  });
}

function renderRadius(root) {
  radii.forEach(([variable, use]) => {
    const card = el("div", "radius-card");
    const shape = el("span", "radius-shape");
    shape.style.borderRadius = `var(${variable})`;
    const meta = el("div", "between");
    meta.append(el("span", "tok", tokenName(variable)), el("span", "mono mono-strong", value(variable)));
    card.append(shape, meta, el("span", "use", use));
    root.append(card);
  });
}

function renderShadows(root) {
  shadows.forEach(([name, variable, use]) => {
    const card = el("div", "shadow-card");
    card.style.boxShadow = `var(${variable})`;
    const meta = el("div", "between");
    meta.append(el("span", "grad-name", name), el("span", "tok", tokenName(variable)));
    card.append(meta, el("span", "use", use), el("span", "mono", value(variable)));
    root.append(card);
  });
}

function renderMotion(root) {
  motion.forEach(([duration, ease, use]) => {
    const row = el("div", "motion-row");
    const track = el("div", "track");
    const dot = el("span", "dot");
    dot.style.transition = `transform ${value(duration)} ${value(ease)}`;
    track.append(dot);
    row.append(el("span", "tok", tokenName(duration)), el("span", "mono mono-strong", value(duration)), track, el("span", "use", use));
    root.append(row);
  });
}

function renderIcons(root) {
  icons.forEach(([name, size, tile, radius]) => {
    const item = el("div", "icon");
    const box = el("span", "icon-tile");
    box.style.width = `var(${tile})`;
    box.style.height = `var(${tile})`;
    box.style.borderRadius = `var(${radius})`;
    box.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"></path></svg>`;
    box.querySelector("svg").style.width = `var(${size})`;
    box.querySelector("svg").style.height = `var(${size})`;
    item.append(box, el("span", "mono mono-strong", value(size)), el("span", "use", name));
    root.append(item);
  });
}

function renderBreakpoints(root) {
  breakpoints.forEach(([name, range, use]) => {
    const row = el("div", "bp-row");
    row.append(el("span", "label", name), el("span", "mono mono-strong", range), el("span", "use", use));
    root.append(row);
  });
}

renderPalettes(document.querySelector("[data-palettes]"));
renderGrads(document.querySelector("[data-grads]"));
renderPairs(document.querySelector("[data-pairs]"));
renderFamilies(document.querySelector("[data-families]"));
renderScale(document.querySelector("[data-scale]"));
renderRules(document.querySelector("[data-type-rules]"), typeRules);
renderArTable(document.querySelector("[data-ar]"));
renderRules(document.querySelector("[data-rtl]"), rtl);
renderSpace(document.querySelector("[data-space]"));
renderPairsList(document.querySelector("[data-pads]"), pads);
renderHeights(document.querySelector("[data-heights]"));
renderRadius(document.querySelector("[data-radius]"));
renderShadows(document.querySelector("[data-shadows]"));
renderMotion(document.querySelector("[data-motion]"));
renderIcons(document.querySelector("[data-icons]"));
renderBreakpoints(document.querySelector("[data-bps]"));
renderPairsList(document.querySelector("[data-layout]"), layout);

document.querySelectorAll(".motion-row").forEach((row, index) => {
  const dot = row.querySelector(".dot");
  const [duration, ease] = motion[index];
  dot.style.transition = `transform ${value(duration)} ${value(ease)}, opacity var(--motion-fast) var(--ease-out)`;
});

document.querySelector("[data-play]").addEventListener("click", () => {
  document.querySelectorAll(".motion-row").forEach((row) => row.classList.remove("is-on"));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".motion-row").forEach((row) => row.classList.add("is-on"));
    });
  });
});
