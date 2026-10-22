const read = (node, name) => getComputedStyle(node).getPropertyValue(name).trim();

const value = (name) => read(document.documentElement, name);

const hexOf = (node, name) => read(node, name).toUpperCase();

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
    const slot = document.querySelector('[data-page="colors"] [data-copied]');
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

function themed(mode, className) {
  const node = el("div", className);
  node.dataset.theme = mode;
  return node;
}

const modes = [["light", "Light mode"], ["dark", "Dark mode"]];

/* Colors */

const palettes = [
  ["Brand", "Logo, primary actions, links, focus and selection.", [
    ["green/500", "--brand-500", "Logo, app icon"],
    ["green/550", "--brand-600", "Selected, checkboxes"],
    ["green/700", "--brand-700", "Pressed primary"],
    ["green/800", "--brand-800", "Links, tertiary"],
    ["green/300", "--brand-300", "Chart fills"],
    ["green/100", "--brand-100", "Success tint, chips"],
    ["green/25", "--brand-50", "Soft highlight"],
  ]],
  ["Text", "Text uses ink at several strengths. Never pure black.", [
    ["text/primary", "--text-primary", "Headings, body"],
    ["text/secondary", "--text-secondary", "Descriptions"],
    ["text/tertiary", "--text-tertiary", "Captions, meta"],
    ["text/label", "--text-label", "Section labels"],
    ["text/disabled", "--text-disabled", "Disabled text"],
  ]],
  ["Surfaces", "Cards sit on the canvas. Gray containers sit inside cards.", [
    ["background/canvas", "--surface-canvas", "Page background"],
    ["background/primary", "--surface-card", "Cards, modals"],
    ["background/subtle", "--surface-subtle", "Inside cards"],
    ["background/sunken", "--surface-sunken", "Icon tiles, tracks"],
    ["background/hover", "--surface-hover", "Row hover"],
    ["background/inverse", "--surface-inverse", "Tooltips, dark cards"],
  ]],
  ["Borders", "Pick by how strong the edge needs to be.", [
    ["border/quiet", "--border-subtle", "Dividers"],
    ["border/default", "--border-default", "Card edges"],
    ["border/button", "--border-control", "Outline buttons"],
    ["border/input", "--border-input", "Text fields"],
    ["border/strong", "--border-strong", "Table header"],
  ]],
  ["Status", "Strong colors for icons and marks. Status only.", [
    ["success", "--status-success", "Settled, done"],
    ["warning", "--status-warning", "Pending"],
    ["error", "--status-error", "Errors, declined"],
    ["danger", "--status-danger", "Destructive"],
    ["info", "--status-info", "Information"],
    ["scheduled", "--status-scheduled", "Scheduled"],
    ["count", "--status-count", "Unread counts"],
  ]],
  ["Charts", "Order for chart series. Green first, then blue, amber, purple.", [
    ["chart/1", "--chart-1", "Main series"],
    ["chart/2", "--chart-2", "Comparison"],
    ["chart/3", "--chart-3", "Third"],
    ["chart/4", "--chart-4", "Fourth"],
    ["chart/grid", "--chart-grid", "Grid lines"],
  ]],
  ["Component states", "Hover, pressed, selected and disabled fills used by controls.", [
    ["text/on-action", "--text-on-brand", "Text and icons on the green button"],
    ["text/on-inverse", "--text-on-inverse", "Text on ink buttons and tooltips"],
    ["text/selected", "--text-selected", "Selected and applied controls"],
    ["background/inverse-hover", "--surface-inverse-hover", "Ink button hover and pressed"],
    ["background/pressed", "--surface-pressed", "Pressed secondary, quiet and ghost"],
    ["border/control-hover", "--border-control-hover", "Secondary button hover border"],
    ["action/soft-hover", "--brand-100-hover", "Tonal button hover"],
    ["action/soft-pressed", "--brand-100-pressed", "Tonal button pressed"],
    ["error/soft", "--status-error-tint", "Destructive button background"],
    ["error/soft-hover", "--status-error-tint-hover", "Destructive button hover"],
    ["error/soft-pressed", "--status-error-tint-pressed", "Destructive button pressed"],
    ["background/selected", "--surface-selected", "Selected row in menus and lists"],
    ["background/disabled", "--surface-disabled", "Disabled buttons, chips and tiles"],
    ["action/ghost-text", "--brand-800", "Ghost button text and icons"],
    ["control/border", "--control-border", "Checkbox and radio border, off"],
    ["control/on-pressed", "--control-on-pressed", "Checked control while pressed"],
    ["control/track-pressed", "--control-track-pressed", "Toggle track while pressed, off"],
    ["control/track-hover", "--control-track-hover", "Toggle track on hover, off"],
    ["error/track", "--status-error-track", "Toggle track in error, off"],
    ["control/knob", "--control-knob", "Toggle knob, stays light in both modes"],
  ]],
  ["Status colours", "Each status has a tint, text and border for badges, alerts and rows.", [
    ["status/success/tint", "--status-success-tint", "Settled · subtle background"],
    ["status/success/text", "--status-success-text", "Settled · text"],
    ["status/success/border", "--status-success-border", "Settled · outline"],
    ["status/success/on-inverse", "--status-success-on-inverse", "Success dot on dark card art"],
    ["status/warning/tint", "--status-warning-tint", "Pending · subtle background"],
    ["status/warning/text", "--status-warning-text", "Pending · text"],
    ["status/warning/border", "--status-warning-border", "Pending · outline"],
    ["status/warning/solid", "--status-warning-solid", "Pending · solid"],
    ["status/processing/fg", "--status-processing", "Processing · icon and dot"],
    ["status/processing/tint", "--status-processing-tint", "Processing · subtle background"],
    ["status/processing/border", "--status-processing-border", "Processing · outline"],
    ["status/processing/solid", "--status-processing-solid", "Processing · solid"],
    ["status/scheduled/tint", "--status-scheduled-tint", "Scheduled · subtle background"],
    ["status/scheduled/text", "--status-scheduled-text", "Scheduled · text"],
    ["status/scheduled/border", "--status-scheduled-border", "Scheduled · outline"],
    ["status/error/tint", "--status-error-tint", "Declined · subtle background"],
    ["status/error/text", "--status-error-text", "Declined · text"],
    ["status/error/border", "--status-error-border", "Declined · outline"],
    ["status/info/tint", "--status-info-tint", "Frozen · subtle background"],
    ["status/info/text", "--status-info-text", "Frozen · text"],
    ["status/info/border", "--status-info-border", "Frozen · outline"],
    ["status/neutral/text", "--status-neutral-text", "Refunded · text"],
    ["status/neutral/border", "--status-neutral-border", "Refunded · outline"],
    ["status/neutral/solid", "--status-neutral-solid", "Refunded · solid"],
    ["status/expired/fg", "--status-expired", "Expired · icon and dot"],
    ["status/expired/solid", "--status-expired-solid", "Expired · solid"],
    ["status/expired/tint", "--status-expired-tint", "Expired · subtle background"],
    ["status/expired/text", "--status-expired-text", "Expired · text"],
    ["status/expired/border", "--status-expired-border", "Expired · outline"],
    ["status/draft/solid", "--status-draft-solid", "Draft · solid"],
    ["status/online", "--status-online", "Online presence dot"],
  ]],
  ["Input colours", "Field borders and backgrounds by state.", [
    ["input/border-hover", "--border-input-hover", "Field border on hover"],
    ["input/border-muted", "--border-input-muted", "Disabled and read-only field border"],
    ["input/border-quiet", "--border-input-quiet", "Rule ticks and checks, off"],
    ["input/divider", "--border-input-divider", "Divider inside a field (prefix)"],
    ["text/placeholder", "--text-placeholder", "Label sitting inside an empty field"],
    ["text/hint", "--text-hint", "Helper line under a field"],
    ["input/bg-disabled", "--surface-input-disabled", "Disabled field background"],
    ["input/bg-readonly", "--surface-input-readonly", "Read-only field background"],
    ["input/bg-error", "--surface-input-error", "Field background in error"],
    ["input/bg-success", "--surface-input-success", "Field and OTP background on success"],
  ]],
];

const grads = [
  ["Primary button", "Action/Primary", "--gradient-primary", "One primary per screen."],
  ["Card · emerald", "Gradient/Card", "--gradient-card", "Corporate card art."],
  ["Haze", "Gradient/Haze", "--gradient-haze", "Onboarding and sign-in background."],
  ["Approved banner", "Gradient/Approved", "--gradient-approved", "Verified company card (KYB)."],
];

const cardArt = [
  ["Purchase", "card/purchase/*", "--gradient-card", "--text-on-brand", "Emerald, white text"],
  ["Corporate", "card/corporate/*", "--gradient-card-ink", "--text-on-brand", "Ink, lime product line"],
  ["Platinum", "card/platinum/*", "--gradient-card-metal", "--text-primary", "Metal, ink text"],
];

const rules = {
  colors: [
    ["Use action/primary (--brand-600) for buttons, borders and focus.", "Use green/500 (Hala green) for text below 18 px. It is for the logo and app icon."],
    ["Use text/primary for reading text on the page.", "Use inverse text on the page background."],
    ["Pair each status with its soft background and its text token.", "Signal an error with color alone and no words."],
  ],
  roles: [
    ["Use background/inverse for tooltips and snackbars, with background/primary text on it.", "Use background/inverse as a page or card background."],
    ["Layer surfaces: background/canvas for the page, background/primary for cards, background/subtle inside cards, background/sunken for tiles and tracks.", "Put a card on a surface of the same color, or skip a layer."],
    ["Show status with words and its color: success, warning, error or info.", "Signal status with color alone."],
  ],
  type: [
    ["Use Display for covers and marketing.", "Use Display for a screen title inside the app."],
    ["Use Title/XLarge for the page title and Title/Large for section titles.", "Set a local font size for a screen title."],
    ["Set amounts, IBANs and codes in a Number style (Hala Mono). The Riyal is in the font at U+E100 and U+20C1.", "Set amounts in a word style such as Body/Medium, or take the Riyal from another font."],
  ],
  space: [
    ["Use a space token for gaps and padding, like space/16 (--space-4).", "Type a value like 15, or use an off-scale step outside its component."],
    ["Use size/control (--size-control) for button and control height. It becomes 52 on mobile by itself.", "Type 44 into a button height. It stays 44 on mobile and fails the tap target."],
    ["Use the radius the component owns: inputs radius/8, cards radius/20, buttons pill.", "Type a corner value like 14 instead of using a radius token."],
  ],
  shadows: [
    ["Leave cards flat on the canvas. Elevation means something floats above the page.", "Add a shadow to every card to separate it from the canvas."],
    ["Pick the level by what floats: Floating for toasts and menus, Overlay for modals and date pickers, Dialog for the command menu.", "Use a black or hand-made shadow on Light screens. Light shadows are ink-tinted with a negative spread."],
    ["Use the glow only under the gradient primary button.", "Blur the page behind an overlay. Use the backdrop color only."],
    ["On Dark mode screens, use the Dark set. Dark surfaces also step lighter as they rise.", "Use the Light shadows on Dark mode. Ink-tinted shadows disappear on a dark background."],
  ],
  motion: [
    ["Keep feedback instant (100 ms) and let big surfaces glide (300–480 ms).", "Slow down hover and press, or add bounce to routine actions."],
    ["Exit faster than you enter: about 65% of the enter time.", "Play the enter animation backwards for exits."],
    ["Fade the backdrop first, then bring the panel in 50 ms later.", "Blur the page behind an overlay."],
    ["Swap movement for a short fade when reduce motion is on.", "Let heights jump; animate them or keep them fixed."],
  ],
};

function renderPalettes(board) {
  board.replaceChildren();
  const card = hexOf(board, "--surface-card");
  const ink = hexOf(board, "--text-primary");
  palettes.forEach(([name, desc, items]) => {
    const block = el("div", "stack");
    const title = el("div", "group-title");
    title.append(el("strong", "", name), el("span", "", desc));
    const grid = el("div", "swatches");
    items.forEach(([figma, variable, use]) => {
      const color = hexOf(board, variable);
      const onCard = ratio(color, card);
      const onInk = ratio(color, ink);
      const useCard = onCard >= onInk;
      const button = el("button", "swatch");
      button.type = "button";
      button.title = `Copy ${color}`;
      button.addEventListener("click", () => copyText(color));
      const chip = el("span", "swatch-color");
      chip.style.background = `var(${variable})`;
      const ratioLabel = el("span", "swatch-ratio", `${(useCard ? onCard : onInk).toFixed(1)}:1`);
      ratioLabel.style.color = useCard ? "var(--surface-card)" : "var(--text-primary)";
      chip.append(ratioLabel);
      const body = el("span", "swatch-body");
      body.append(
        el("span", "swatch-name", figma),
        el("span", "tok", variable),
        el("span", "mono", color),
        el("span", "use", use),
      );
      button.append(chip, body);
      grid.append(button);
    });
    block.append(title, grid);
    board.append(block);
  });
}

function setupModes(board) {
  const buttons = document.querySelectorAll("[data-mode-switch] button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      board.dataset.theme = button.dataset.mode;
      buttons.forEach((item) => item.setAttribute("aria-pressed", item === button ? "true" : "false"));
      renderPalettes(board);
    });
  });
  board.dataset.theme = "light";
  renderPalettes(board);
}

function renderGrads(root) {
  grads.forEach(([name, figma, variable, use]) => {
    const row = el("div", "grad-row");
    const chip = el("span", "grad-chip");
    chip.style.background = `var(${variable})`;
    const copy = el("div", "grad-copy");
    copy.append(el("span", "grad-name", name), el("span", "tok", `${figma} · ${variable}`), el("span", "use", use));
    row.append(chip, copy);
    root.append(row);
  });
}

function renderCardArt(root) {
  cardArt.forEach(([name, figma, gradient, ink, use]) => {
    const item = el("div", "stack");
    item.style.gap = "var(--space-2)";
    const art = el("div", "art", "•••• 3399");
    art.style.background = `var(${gradient})`;
    art.style.color = `var(${ink})`;
    item.append(art, el("span", "grad-name", name), el("span", "tok", `${figma} · ${gradient}`), el("span", "use", use));
    root.append(item);
  });
}

function renderRules(root, rows) {
  rows.forEach(([good, bad], index) => {
    const row = el("div", "dd-row");
    const yes = el("div", "rule");
    yes.append(el("span", "kicker", "Do"), el("p", "", good));
    const no = el("div", "rule");
    no.append(el("span", "kicker danger", "Don’t"), el("p", "", bad));
    row.append(el("span", "dd-num", String(index + 1).padStart(2, "0")), yes, no);
    root.append(row);
  });
}

/* Color roles */

function tipSample() {
  return el("span", "role-tip", "Saved");
}

function layerSample() {
  const canvas = el("div", "role-canvas");
  const card = el("div", "role-card");
  const subtle = el("div", "role-subtle");
  subtle.append(document.createTextNode("Card"), el("span", "", "Subtle container inside"));
  card.append(el("span", "role-tile"), subtle);
  canvas.append(card);
  return canvas;
}

function avatarSample() {
  const row = el("div", "role-avatars");
  ["AS", "ST", "KT", "FA", "MO"].forEach((initials, index) => {
    const avatar = el("span", "role-avatar", initials);
    avatar.style.background = `var(--avatar-tint-${index + 1})`;
    avatar.style.color = `var(--avatar-text-${index + 1})`;
    row.append(avatar);
  });
  row.append(el("span", "role-badge", "Frozen"));
  return row;
}

const roles = [
  ["Tooltip and snackbar", "Use background/inverse for the surface. The words on it are background/primary.", "background/inverse + background/primary", tipSample,
    (node) => `Contrast ${ratio(hexOf(node, "--surface-inverse"), hexOf(node, "--surface-card")).toFixed(1)}:1`],
  ["Surfaces and layers", "Cards sit on the canvas. Gray containers sit inside cards. Sunken is for icon tiles and tracks.", "background/canvas → primary → subtle → sunken", layerSample,
    (node) => `Card against canvas ${ratio(hexOf(node, "--surface-card"), hexOf(node, "--surface-canvas")).toFixed(1)}:1`],
  ["Avatars and frozen", "Initials sit on avatar/tint-1…5 with the matching avatar/text. These are decorative, not status. A frozen card or account uses status/frozen.", "avatar/tint-1…5 + avatar/text-1…5 · status/frozen/*", avatarSample,
    (node) => {
      const lowest = Math.min(...[1, 2, 3, 4, 5].map((n) => ratio(hexOf(node, `--avatar-tint-${n}`), hexOf(node, `--avatar-text-${n}`))));
      return `Lowest contrast ${lowest.toFixed(1)}:1 (${grade(lowest)})`;
    }],
];

function renderRoles(root) {
  roles.forEach(([name, desc, tokens, sample, measure]) => {
    const block = el("div", "stack");
    const title = el("div", "group-title");
    title.append(el("strong", "", name), el("span", "", desc));
    const grid = el("div", "cols-2");
    modes.forEach(([mode, label]) => {
      const panel = themed(mode, "panel mode-panel");
      const note = el("span", "use");
      const area = el("div", "sample-area");
      area.append(sample());
      panel.append(el("span", "kicker quiet", label), el("span", "tok", tokens), note, area);
      grid.append(panel);
      requestAnimationFrame(() => {
        note.textContent = measure(panel);
      });
    });
    block.append(title, grid);
    root.append(block);
  });
}

/* Typography */

const families = [
  ["Interface", "Hala DS Font", "--font-sans", "Aa", "Business banking for Saudi companies", "300 · 400 · 500 · 600 · 700", "ltr"],
  ["Numbers and codes", "Hala Mono", "--font-mono", "0 1", "− 25,000.00 · SA57 •• 1951", "400 · 500 · 600", "ltr"],
  ["Arabic", "Hala DS Font", "--font-arabic", "أب", "خدمات مصرفية للشركات", "400 · 500 · 600 · 700", "rtl"],
];

const scale = [
  ["Display/Large", "display", "Page hero, onboarding", "Welcome", "48/52 · 700", "34/40 · 700"],
  ["Title/XLarge", "heading-xl", "Page title", "Transactions", "34/40 · 700", "28/34 · 700"],
  ["Title/Large", "heading-l", "Section title", "Recent activity", "26/32 · 700", "22/28 · 700"],
  ["Title/Small", "heading-m", "Card and modal title", "Add beneficiary", "18/24 · 700", "19/24 · 700"],
  ["Body/Large", "body-l", "Intro paragraphs", "We check the IBAN with the bank before saving.", "17/26 · 400", "17/24 · 400"],
  ["Body/Regular", "body-m", "Default UI text", "Payments you send and receive appear here.", "15/22 · 400", "16/22 · 400"],
  ["Body/Small", "body-s", "Descriptions, helper", "Must be registered to the owner’s ID.", "14/20 · 400", "14/20 · 400"],
  ["Label/Medium", "label-m", "Buttons, row titles", "Continue", "15/20 · 600", "16/20 · 600"],
  ["Caption/Regular", "caption", "Meta, timestamps", "Today, 12:41 · mada", "13/16 · 400", "13/16 · 400"],
  ["Overline/Regular", "overline", "Section labels", "Accept payments", "11/14 · 500", "11/14 · 500"],
  ["Number/Large", "amount-xl", "Balances, totals", "175,000.00", "32/36 · 600", "30/34 · 600"],
  ["Number/Medium", "amount-m", "List amounts, IBANs", "− 25,000.00", "15/20 · 500", "15/20 · 500"],
];

const typeRules = [
  ["Numbers in Mono", "Amounts, IBANs, card digits, dates and codes use a Number style (Hala Mono) so columns line up."],
  ["Amount format", "Sign, space, thousands comma, 2 decimals: “− 25,000.00”. The Riyal sign comes before the number."],
  ["Weights", "Use 400, 500, 600 and 700. 300 is only for the HALA wordmark in headers."],
  ["Mobile minimum", "Body 16 pt on iOS and Android to avoid zoom and to meet Dynamic Type."],
];

const arMap = [
  ["Title/XLarge", "34/40 · 700", "36/48 · 700", "+2 px, line height ×1.35"],
  ["Title/Small", "18/24 · 700", "19/28 · 700", "+1 px"],
  ["Body/Regular", "15/22 · 400", "16/28 · 400", "Line height 1.75 for readability"],
  ["Body/Small", "14/20 · 400", "15/24 · 400", "+1 px, taller line"],
  ["Label/Medium", "15/20 · 600", "16/24 · 600", "Buttons keep 600"],
  ["Overline/Regular", "11/14 · 500", "12/16 · 500", "No caps or letter-spacing in Arabic"],
];

const rtl = [
  ["Mirror the layout", "Sidebar right, back arrow points right, progress fills right to left."],
  ["Don’t mirror", "Numbers, IBANs, card numbers, charts’ time axis, media controls, the logo."],
  ["Icons", "Mirror direction icons (arrows, send). Keep symbols as is (check, search, bell)."],
  ["Gradients", "Reverse button gradients so the darker side stays at the start."],
  ["Letter-spacing", "Never add letter-spacing to Arabic; it breaks the connected letters."],
  ["Mixed text", "Wrap numbers and Latin names in a direction-isolated span (unicode-bidi: isolate)."],
];

const typeModes = [
  ["Display/Large", "48 / 52", "34 / 40", "48 / 52", "34 / 40"],
  ["Title/XLarge", "34 / 40", "28 / 34", "36 / 48", "36 / 48"],
  ["Title/Large", "26 / 32", "22 / 28", "26 / 32", "22 / 28"],
  ["Title/Medium", "20 / 26"],
  ["Title/Small", "18 / 24", "19 / 24", "19 / 28", "19 / 28"],
  ["Body/Large", "17 / 26", "17 / 24", "17 / 26", "17 / 24"],
  ["Body/Regular", "15 / 22", "16 / 22", "16 / 28", "16 / 28"],
  ["Body/Medium", "16 / 22"],
  ["Body/Small", "14 / 20", "14 / 20", "15 / 24", "15 / 24"],
  ["Label/Medium", "15 / 20", "16 / 20", "16 / 24", "16 / 24"],
  ["Label/Small Strong", "14 / 20"],
  ["Label/Regular", "14 / 20"],
  ["Caption/Large", "13 / 18"],
  ["Caption/Regular", "13 / 16"],
  ["Overline/Regular", "11 / 14", "11 / 14", "12 / 16", "12 / 16"],
  ["Label/Badge", "11 / 14"],
  ["Number/Large", "32 / 36", "30 / 34", "32 / 36", "30 / 34"],
  ["Number/Medium", "15 / 20"],
  ["Number/Drawer", "28 / 32"],
  ["Number/Transfer", "38 / 42"],
  ["Number/Keypad", "26 / 32"],
  ["Mono/Caption", "13 / 18"],
];

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
    card.append(mark, el("span", "family-name", name), line, el("span", "mono", `${weights} · ${variable}`));
    root.append(card);
  });
}

function renderScale(root) {
  const head = el("div", "scale table-head");
  ["Style", "Sample", "Web", "Mobile"].forEach((label) => head.append(el("span", "", label)));
  root.append(head);
  scale.forEach(([figma, id, use, sample, web, mobile]) => {
    const row = el("div", "scale");
    const name = el("div", "stack");
    name.style.gap = "var(--space-1)";
    name.append(el("span", "swatch-name", figma), el("span", "tok", `--type-${id}`), el("span", "use", use));
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

function renderNotes(root, rows) {
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

function renderTypeModes(root) {
  const head = el("div", "mode-row table-head");
  ["Style", "Web", "Mobile", "Arabic web", "Arabic mobile"].forEach((label) => head.append(el("span", "", label)));
  root.append(head);
  typeModes.forEach(([name, web, ...rest]) => {
    const row = el("div", "mode-row");
    row.append(el("span", "label", name), el("span", "mono mono-strong", web));
    [0, 1, 2].forEach((index) => {
      const cell = rest[index] || web;
      const node = el("span", "mono mono-strong", cell);
      if (cell === web) node.classList.add("is-same");
      row.append(node);
    });
    root.append(row);
  });
}

/* Space, radius, size and stroke */

const space = [
  ["space/4", "--space-1", "Icon to text in a badge"],
  ["space/8", "--space-2", "Chip gap, icon to label"],
  ["space/12", "--space-3", "Card grid gap, row gap"],
  ["space/16", "--space-4", "Card padding (compact), mobile margin"],
  ["space/20", "--space-5", "Modal padding"],
  ["space/24", "--space-6", "Card padding, group gap"],
  ["space/28", "--space-7", "Large card padding"],
  ["space/32", "--space-8", "Page side padding (web)"],
  ["space/40", "--space-10", "Onboarding column gap"],
  ["space/48", "--space-12", "Header to first section"],
  ["space/56", "--space-14", "Between page sections"],
];

const pads = [
  ["Button", "space/20 · gap space/8", "0 20 · icon gap 8"],
  ["Input", "space/14 · gap space/2", "0 14 · label gap 2"],
  ["Chip / badge", "space/12 / space/10", "0 12 / 0 10"],
  ["Feature badge", "space/7", "0 7"],
  ["Card · web", "layout/card-padding-y · x", "24 28"],
  ["Card · mobile", "Same tokens, mobile", "16"],
  ["Modal", "space/20 · footer 14, 20, 18", "20 · footer 14 20 18"],
  ["List row", "space/14 · inset space/52", "14 0 · inset 52"],
  ["Command menu", "space/18", "0 18"],
  ["Page edge", "layout/page-padding", "32 · mobile 16"],
];

const heights = [
  ["Badge", "--size-badge", "var(--brand-100)"],
  ["Small", "--size-sm", "var(--border-default)"],
  ["Default", "--size-md", "var(--border-strong)"],
  ["Web primary", "--size-control-web", "var(--brand-300)"],
  ["Mobile", "--size-control-mobile", "var(--brand-600)"],
  ["Input", "--size-input", "var(--text-primary)"],
];

const radii = [
  ["radius/4", "--radius-xs", "Checkbox inner, chart bars"],
  ["radius/8", "--radius-s", "Inputs, small tiles"],
  ["radius/12", "--radius-m", "Icon tiles, menu items, day cells"],
  ["radius/16", "--radius-l", "Inner cards, list groups"],
  ["radius/20", "--radius-xl", "Cards, modals, mobile groups"],
  ["radius/24", "--radius-2xl", "Page cards, sidebar"],
  ["radius/28", "--radius-sheet", "Bottom sheet top, mobile screen"],
  ["radius/pill", "--radius-pill", "Buttons, chips, badges, toggles"],
];

const steps = [
  ["space/2", "--gap-input-label", "--gap-input-label · --gap-day", "Input label to field, calendar days"],
  ["space/6", "--icon-gap-inline", "--icon-gap-inline", "Inline icon to text"],
  ["space/7", "--pad-badge-feature-x", "--pad-badge-feature-x", "Feature badge padding"],
  ["space/10", "--pad-badge-x", "--pad-badge-x · --icon-gap-default", "Badge padding, default icon gap"],
  ["space/14", "--pad-input-x", "--pad-input-x · --pad-row-y", "Input padding, row padding, modal footer top"],
  ["space/18", "--pad-command-x", "--pad-command-x", "Modal footer bottom, command menu padding"],
  ["space/52", "--inset-row", "--inset-row", "Row text inset after a leading icon"],
];

const strokes = [
  ["stroke/0-5", "--border-width-hairline", "Hairline dividers, command menu"],
  ["stroke/1", "--border-width", "Default border on cards, inputs, buttons"],
  ["stroke/1-5", "--border-check", "Checkbox and radio rings, focused input border, today ring"],
  ["stroke/2", "--border-width-emphasis", "Emphasis: selected badges, active inputs, focus ring"],
  ["stroke/1-7", "--icon-stroke", "Lucide fallback icon stroke"],
  ["stroke/2-2", "--icon-stroke-active", "Active Lucide fallback stroke"],
];

const sizes = [
  ["Controls", [
    ["size/control", "--size-control", "Buttons and controls. Web 44, mobile 52.", "44 · 52"],
    ["size/control-mobile", "--size-control-mobile", "Mobile value behind size/control"],
    ["size/input", "--size-input", "Text inputs with a floating label"],
    ["size/field-small", "--size-input-sm", "Compact inputs and search"],
    ["size/md", "--size-md", "Medium buttons and icon buttons"],
    ["size/sm", "--size-sm", "Small buttons and icon buttons"],
    ["size/badge", "--size-badge", "Badges"],
    ["size/switch", "--size-switch", "Switch height"],
    ["size/switch-small", "--size-switch-sm", "Small switch width"],
    ["size/check", "--size-check", "Checkbox and radio"],
    ["size/otp", "--size-otp", "OTP field height"],
    ["size/otp-box", "--size-otp-box", "One OTP digit box"],
    ["size/segment-small", "--size-segment-sm", "Segmented control, small segment"],
    ["size/segment-medium", "--size-segment-md", "Segmented control, medium segment"],
    ["size/segment-large", "--size-segment-lg", "Segmented control, large segment"],
    ["size/presence", "--size-presence", "Online dot on avatars"],
    ["size/badge-dot", "--size-badge-dot", "Status dot in badges"],
    ["size/badge-dot-large", "--size-badge-dot-lg", "Large status dot"],
    ["size/divider-dot", "--size-divider-dot", "Dot between inline items"],
    ["size/handle-bar", "--size-handle-bar", "Sheet handle height"],
  ]],
  ["Icons and icon tiles", [
    ["size/icon-badge-small", "--icon-badge-sm", "Icon in a small badge"],
    ["size/icon-trend", "--icon-badge-trend", "Trend arrow in badges"],
    ["size/icon-badge", "--icon-badge", "Icon in a badge"],
    ["size/icon-badge-large", "--icon-badge-lg", "Icon in a large badge"],
    ["size/icon-inline", "--icon-inline", "Icon next to text"],
    ["size/icon-default", "--icon-default", "Default icon"],
    ["size/icon-nav", "--icon-nav", "Navigation icon"],
    ["size/icon-feature", "--icon-feature", "Feature icon"],
    ["size/icon-tile-inline", "--icon-tile-inline", "Inline icon tile, radius/8"],
    ["size/icon-tile-default", "--icon-tile-default", "Default icon tile, radius/12"],
    ["size/icon-tile-nav", "--icon-tile-nav", "Nav icon tile, radius/12"],
    ["size/icon-tile-feature", "--icon-tile-feature", "Feature icon tile, radius/16"],
  ]],
  ["Overlays and layout", [
    ["size/popover", "--size-popover", "Popover width"],
    ["size/tooltip", "--size-tooltip", "Tooltip max width"],
    ["size/date-presets", "--size-presets", "Date preset list width"],
    ["size/calendar", "--size-calendar", "Calendar width"],
    ["size/modal-small", "--size-modal-s", "Small modal"],
    ["size/modal-confirm", "--size-modal-confirm", "Confirm dialog"],
    ["size/dropdown", "--size-dropdown-panel", "Dropdown panel"],
    ["size/drawer", "--size-drawer", "Drawer"],
    ["size/modal-medium", "--size-modal-m", "Medium modal"],
    ["size/command", "--size-command", "Command menu width"],
    ["size/command-field", "--size-command-field", "Command menu search height"],
    ["size/drawer-edit", "--size-drawer-edit", "Edit drawer"],
    ["size/modal-large", "--size-modal-l", "Large modal"],
    ["layout/content-max", "--layout-content-max", "Max content width"],
    ["layout/card-min", "--layout-card-min", "Smallest card in a grid"],
    ["layout/sidebar", "--layout-sidebar", "Sidebar"],
    ["layout/sidebar-rail", "--layout-sidebar-rail", "Collapsed sidebar"],
    ["layout/topbar", "--layout-topbar", "Top bar height"],
    ["layout/tabbar", "--layout-tabbar", "Mobile tab bar height"],
    ["layout/columns", "--layout-grid-columns", "Grid columns (a count, not px)"],
    ["layout/gutter", "--layout-grid-gap", "Grid gutter"],
  ]],
  ["Touch targets", [
    ["target/web", "--target-web", "Smallest clickable area on web"],
    ["target/ios", "--target-ios", "Smallest tap area on iOS"],
    ["target/android", "--target-android", "Smallest tap area on Android"],
  ]],
  ["Avatars and cards", [
    ["size/avatar-xs", "--size-avatar-xs", "Avatar in dense rows and stacks"],
    ["size/avatar-s", "--size-avatar-s", "Avatar in list rows"],
    ["size/avatar-m", "--size-avatar-m", "Default avatar"],
    ["size/avatar-l", "--size-avatar-l", "Recipient picker, receipt header"],
    ["size/avatar-xl", "--size-avatar-xl", "Profile and account header"],
    ["size/card-full", "--size-card-full-width", "Payment card on a phone screen (ratio 1.586)", "", "--size-card-full-height"],
    ["size/card-medium", "--size-card-medium-width", "Card in a carousel or stack", "", "--size-card-medium-height"],
    ["size/card-mini", "--size-card-mini-width", "Card thumbnail in lists and receipts", "", "--size-card-mini-height"],
  ]],
];

const platform = [
  ["platform/target", "44 / 48", "Smallest tap area. Wrap small visuals (×, dots, Copy) to this."],
  ["platform/topbar/height", "52 / 64", "Standard top bar"],
  ["platform/topbar/large", "96 / 112", "Large-title top bar before scroll"],
  ["platform/tabbar/height", "84 / 80", "Tab bar or navigation bar incl. home indicator"],
  ["platform/handle/width", "36 / 32", "Sheet grabber / drag handle width"],
  ["platform/handle/height", "5 / 4", "Sheet grabber / drag handle height"],
  ["platform/sheet/radius", "28 / 28", "Top corners of a bottom sheet"],
  ["platform/snackbar/offset", "16 / 88", "Gap from the bottom: Android sits above the nav bar"],
];

const iconSizes = [
  ["Inline", "inline", "--icon-inline", "--icon-tile-inline", "--icon-tile-radius-inline"],
  ["Default", "default", "--icon-default", "--icon-tile-default", "--icon-tile-radius-default"],
  ["Nav", "nav", "--icon-nav", "--icon-tile-nav", "--icon-tile-radius-nav"],
  ["Feature", "feature", "--icon-feature", "--icon-tile-feature", "--icon-tile-radius-feature"],
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

const px = (variable) => value(variable).replace("px", "");

function renderSpace(root) {
  space.forEach(([figma, variable, use]) => {
    const row = el("div", "space-row");
    const bar = el("span", "bar");
    bar.style.width = `var(${variable})`;
    const wrap = el("div", "bar-wrap");
    wrap.append(bar, el("span", "use ellipsis", `${variable} · ${use}`));
    row.append(el("span", "tok", figma), el("span", "mono mono-strong", value(variable)), wrap);
    root.append(row);
  });
}

function renderPads(root) {
  pads.forEach(([name, tokens, spec]) => {
    const row = el("div", "pad-row");
    const label = el("span", "stack");
    label.style.gap = "0";
    label.append(el("span", "", name), el("span", "tok", tokens));
    row.append(label, el("span", "", spec));
    root.append(row);
  });
}

function renderList(root, rows) {
  rows.forEach(([name, spec]) => {
    const row = el("div", "pad-row");
    row.append(el("span", "", name), el("span", "", spec));
    root.append(row);
  });
}

function renderHeights(root) {
  heights.forEach(([name, variable, background]) => {
    const item = el("div", "height");
    const mark = document.createElement("i");
    mark.style.height = `var(${variable})`;
    mark.style.borderRadius = variable === "--size-input" ? "var(--radius-s)" : "var(--radius-pill)";
    mark.style.background = background;
    item.append(mark, el("span", "mono mono-strong", value(variable)), el("span", "use", name));
    root.append(item);
  });
}

function renderRadius(root) {
  radii.forEach(([figma, variable, use]) => {
    const card = el("div", "radius-card");
    const shape = el("span", "radius-shape");
    shape.style.borderRadius = `var(${variable})`;
    const meta = el("div", "between");
    meta.append(el("span", "tok", figma), el("span", "mono mono-strong", value(variable)));
    card.append(shape, meta, el("span", "use", `${variable} · ${use}`));
    root.append(card);
  });
}

function tokenHead(root, labels) {
  const head = el("div", "token-row table-head");
  labels.forEach((label) => head.append(el("span", "", label)));
  root.append(head);
}

function renderSteps(root) {
  tokenHead(root, ["Token", "Value", "CSS variable", "Use"]);
  steps.forEach(([figma, variable, code, use]) => {
    const row = el("div", "token-row");
    row.append(el("span", "tok", figma), el("span", "mono mono-strong", px(variable)), el("span", "mono", code), el("span", "use", use));
    root.append(row);
  });
}

function renderStroke(root) {
  strokes.forEach(([figma, variable, use]) => {
    const card = el("div", "radius-card");
    const line = el("span", "stroke-line");
    const mark = document.createElement("i");
    mark.style.height = variable.startsWith("--icon") ? `calc(var(${variable}) * 1px)` : `var(${variable})`;
    line.append(mark);
    const meta = el("div", "between");
    meta.append(el("span", "tok", figma), el("span", "mono mono-strong", px(variable)));
    card.append(line, meta, el("span", "use", `${variable} · ${use}`));
    root.append(card);
  });
}

function renderSizes(root) {
  tokenHead(root, ["Token", "Value", "CSS variable", "Use"]);
  sizes.forEach(([group, rows]) => {
    root.append(el("div", "table-group", group));
    rows.forEach(([figma, variable, use, fixed, second]) => {
      const shown = fixed || (second ? `${px(variable)}×${px(second)}` : px(variable));
      const code = second ? `${variable} · ${second}` : variable;
      const row = el("div", "token-row");
      row.append(el("span", "tok", figma), el("span", "mono mono-strong", shown), el("span", "mono", code), el("span", "use", use));
      root.append(row);
    });
  });
}

function renderPlatform(root) {
  const head = el("div", "token-row table-head");
  ["Token", "iOS / Android", "Use"].forEach((label) => head.append(el("span", "", label)));
  head.lastChild.style.gridColumn = "span 2";
  root.append(head);
  platform.forEach(([figma, spec, use]) => {
    const row = el("div", "token-row");
    const note = el("span", "use", use);
    note.style.gridColumn = "span 2";
    row.append(el("span", "tok", figma), el("span", "mono mono-strong", spec), note);
    root.append(row);
  });
}

function drawIcon(size) {
  const svg = window.halaIcons.createElement(window.halaIcons.icons.Send);
  svg.classList.add("hala-icon");
  svg.setAttribute("data-size", size);
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

function renderIcons(root) {
  iconSizes.forEach(([name, size, variable, tile, radius]) => {
    const item = el("div", "icon");
    const box = el("span", "icon-tile");
    box.style.width = `var(${tile})`;
    box.style.height = `var(${tile})`;
    box.style.borderRadius = `var(${radius})`;
    if (window.halaIcons && window.halaIcons.icons) box.append(drawIcon(size));
    item.append(box, el("span", "mono mono-strong", value(variable)), el("span", "use", name));
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

/* Shadows */

const shadows = [
  ["Flat", "none", "none", "--shadow-0", "Default card on canvas. No shadow."],
  ["Raised", "Shadow/Raised", "Shadow/Dark/Raised", "--shadow-1", "Hover on clickable cards, segmented pill."],
  ["Floating", "Shadow/Floating", "Shadow/Dark/Floating", "--shadow-2", "Toasts, menus, popovers."],
  ["Overlay", "Shadow/Overlay", "Shadow/Dark/Overlay", "--shadow-3", "Modals, date pickers, sidebar."],
  ["Dialog", "Shadow/Dialog", "Shadow/Dark/Dialog", "--shadow-4", "Command menu, large modals."],
  ["Primary glow", "Shadow/Brand", "Shadow/Dark/Brand", "--shadow-brand", "Gradient primary button only."],
  ["Card lift", "Shadow/Card", "Shadow/Dark/Card", "--shadow-card", "Payment card resting on the canvas."],
  ["Floating tab bar", "Shadow/Tabbar", "Shadow/Dark/Tabbar", "--shadow-tabbar", "Floating pill tab bar over content."],
];

function renderShadows(root) {
  modes.forEach(([mode, label], index) => {
    const stage = themed(mode, "stage");
    const kicker = el("span", "kicker quiet", label);
    kicker.style.gridColumn = "1 / -1";
    stage.append(kicker);
    const notes = [];
    shadows.forEach(([name, light, dark, variable, use]) => {
      const card = el("div", "shadow-card");
      card.style.boxShadow = `var(${variable})`;
      const meta = el("div", "between");
      meta.append(el("span", "grad-name", name), el("span", "tok", index ? dark : light));
      const spec = el("span", "mono");
      notes.push([spec, variable]);
      card.append(meta, el("span", "use", `${variable} · ${use}`), spec);
      stage.append(card);
    });
    root.append(stage);
    requestAnimationFrame(() => {
      notes.forEach(([spec, variable]) => {
        spec.textContent = read(stage, variable);
      });
    });
  });
}

/* Motion */

const motion = [
  ["motion/instant", "--motion-instant", "--ease-out", "Hover, color, press"],
  ["motion/fast", "--motion-fast", "--ease-standard", "Tooltip, backdrop fade"],
  ["motion/standard", "--motion-standard", "--ease-standard", "Toggle, segment pill, toast"],
  ["motion/modal", "--motion-modal", "--ease-standard", "Modal and alert dialog"],
  ["motion/emphasis", "--motion-emphasis", "--ease-standard", "Accordion, chevron"],
  ["motion/drawer", "--motion-drawer", "--ease-standard", "Drawer"],
  ["motion/sheet", "--motion-sheet", "--ease-sheet", "Bottom sheet, full-screen modal"],
];

const curves = [
  ["Smooth spring", "spring · bounce 0 · --ease-standard", "Enter, move, resize: drawers, modals, toggles, accordions, toasts. Slows down naturally, never overshoots."],
  ["Exit", "spring · bounce 0 · 65% of enter", "Anything leaving, about 65% of the enter time: modal 200, drawer 250, sheet 310 ms (--motion-modal-exit, --motion-drawer-exit, --motion-sheet-exit)."],
  ["Light spring", "spring · bounce 0.1 · 480 ms · --ease-sheet", "Bottom sheets and full-screen modals on mobile. A hint of bounce, like iOS sheets."],
];

const animations = [
  ["Motion/Modal/In", "Fade + scale 96 → 100%", "320 ms", "Smooth spring", "Modal and alert dialog open"],
  ["Motion/Modal/Out", "Fade + scale 100 → 96%", "200 ms", "Smooth spring", "Modal close"],
  ["Motion/Drawer/In", "Slide in from the end (right), 480 px", "380 ms", "Smooth spring", "Drawer open, LTR"],
  ["Motion/Drawer/Out", "Slide out to the end", "250 ms", "Smooth spring", "Drawer close, LTR"],
  ["Motion/Drawer/In · RTL", "Slide in from the left", "380 ms", "Smooth spring", "Drawer open, Arabic"],
  ["Motion/Drawer/Out · RTL", "Slide out to the left", "250 ms", "Smooth spring", "Drawer close, Arabic"],
  ["Motion/Sheet/In", "Slide up from the bottom with overshoot", "480 ms", "Light spring (0.1)", "Bottom sheet, full-screen modal"],
  ["Motion/Sheet/Out", "Slide down", "310 ms", "Smooth spring", "Sheet close"],
  ["Motion/Backdrop/In", "Fade in", "200 ms", "Ease-in-out", "Scrims"],
  ["Motion/Backdrop/Out", "Fade out", "130 ms", "Ease-in-out", "Scrims"],
  ["Motion/Tooltip/In", "Fade + 4 px rise", "200 ms", "Ease-out + spring", "Tooltips"],
  ["Motion/Toast/In", "Fade + 16 px rise", "300 ms", "Smooth spring", "Toasts and snackbars"],
  ["Motion/Toast/Out", "Fade out", "200 ms", "Ease-in-out", "Toast dismiss"],
  ["Motion/Chevron/Turn", "Rotate 0 → 180°", "350 ms", "Smooth spring", "Accordion and dropdown chevrons"],
  ["Motion/Reduced/In", "Fade only", "200 ms", "Ease-in-out", "Any entrance when reduce motion is on"],
];

const reduce = [
  ["Movement", "Slides, scales and springs become a fade."],
  ["Timing", "200 ms ease-in-out for everything."],
  ["Loops", "Spinners and shimmer stop; show static progress."],
  ["Never", "Remove the feedback itself — only the movement."],
];

function renderMotion(root) {
  motion.forEach(([figma, duration, ease, use]) => {
    const row = el("div", "motion-row");
    const track = el("div", "track");
    const dot = el("span", "dot");
    dot.style.transition = `transform var(${duration}) var(${ease}), opacity var(--motion-fast) var(--ease-out)`;
    track.append(dot);
    row.append(el("span", "tok", figma), el("span", "mono mono-strong", value(duration)), track, el("span", "use", `${duration} · ${use}`));
    root.append(row);
  });
}

function renderCurves(root) {
  curves.forEach(([title, spec, body]) => {
    const card = el("div", "rule");
    card.append(el("strong", "", title), el("span", "tok", spec), el("span", "use", body));
    root.append(card);
  });
}

function renderAnimations(root) {
  const head = el("div", "anim-row table-head");
  ["Style", "What it does", "Time", "Curve", "Use for"].forEach((label) => head.append(el("span", "", label)));
  root.append(head);
  animations.forEach(([style, what, time, curve, use]) => {
    const row = el("div", "anim-row");
    row.append(el("span", "tok", style), el("span", "", what), el("span", "mono mono-strong", time), el("span", "use", curve), el("span", "use", use));
    root.append(row);
  });
}

const page = (id) => document.querySelector(`[data-page="${id}"]`);
const slot = (id, hook) => page(id).querySelector(hook);

setupModes(slot("colors", "[data-palettes]"));
renderGrads(slot("colors", "[data-grads]"));
renderCardArt(slot("colors", "[data-card-art]"));
renderRoles(slot("color-roles", "[data-roles]"));
renderFamilies(slot("typography", "[data-families]"));
renderScale(slot("typography", "[data-scale]"));
renderNotes(slot("typography", "[data-type-rules]"), typeRules);
renderArTable(slot("typography", "[data-ar]"));
renderNotes(slot("typography", "[data-rtl]"), rtl);
renderTypeModes(slot("typography", "[data-type-modes]"));
renderSpace(slot("space", "[data-space]"));
renderPads(slot("space", "[data-pads]"));
renderHeights(slot("space", "[data-heights]"));
renderRadius(slot("space", "[data-radius]"));
renderIcons(slot("space", "[data-icons]"));
renderBreakpoints(slot("space", "[data-bps]"));
renderList(slot("space", "[data-layout]"), layout);
renderSteps(slot("space", "[data-steps]"));
renderStroke(slot("space", "[data-stroke]"));
renderSizes(slot("space", "[data-sizes]"));
renderPlatform(slot("space", "[data-platform]"));
renderShadows(slot("shadows", "[data-shadows]"));
renderMotion(slot("motion", "[data-motion]"));
renderCurves(slot("motion", "[data-curves]"));
renderAnimations(slot("motion", "[data-anim]"));
renderNotes(slot("motion", "[data-reduce]"), reduce);

document.querySelectorAll("[data-rules]").forEach((root) => renderRules(root, rules[root.dataset.rules]));

slot("motion", "[data-play]").addEventListener("click", () => {
  const rows = page("motion").querySelectorAll(".motion-row");
  rows.forEach((row) => row.classList.remove("is-on"));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      rows.forEach((row) => row.classList.add("is-on"));
    });
  });
});
