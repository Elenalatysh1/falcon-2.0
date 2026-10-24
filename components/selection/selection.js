/**
 * Checkbox, radio, and switch.
 * Load vendor/hala-icons.js, then this script.
 *
 * createChoice({
 *   kind: "checkbox" | "radio" | "switch",
 *   label, sub, extra, icon,
 *   checked, mixed, disabled, error, danger, loading,
 *   state, size, bare, onChange
 * })
 *
 * createNavTile({ icon, title, count, disabled, onClick })
 */
(function () {
  const catalog = {
    cards: "credit-card",
    cash: "banknote",
    confirm: "check",
    next: "chevron-right",
    contactless: "nfc",
    ecommerce: "shopping-cart",
    "food-delivery": "utensils-crossed",
    freeze: "snowflake",
    adjust: "sliders-horizontal",
    invoicing: "file-text",
    language: "globe",
    payroll: "users",
    pos: "smartphone",
    refresh: "refresh-cw",
  };

  function pascal(kebab) {
    return kebab
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  function drawIcon(name) {
    const iconSet = window.halaIcons;
    if (!iconSet || !name) return null;
    const kebab = catalog[name] || name;
    const node = iconSet.icons[pascal(kebab)];
    if (!node) return null;
    const svg = iconSet.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    svg.style.strokeWidth = "var(--icon-stroke)";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function createChoice(options = {}) {
    const {
      kind = "checkbox",
      label = "",
      sub = "",
      extra = "",
      icon,
      checked = false,
      mixed = false,
      disabled = false,
      error = false,
      danger = false,
      loading = false,
      state,
      size,
      bare = false,
      visual = false,
      onChange,
    } = options;

    const choice = document.createElement(visual ? "span" : "button");
    if (!visual) choice.type = "button";
    choice.className = bare || visual ? "choice choice-bare" : "choice";
    choice.dataset.kind = kind;
    choice.dataset.checked = checked ? "true" : "false";
    if (mixed) choice.dataset.mixed = "true";
    if (disabled) choice.dataset.disabled = "true";
    if (error) choice.dataset.error = "true";
    if (danger) choice.dataset.danger = "true";
    if (loading) choice.dataset.loading = "true";
    if (state) choice.dataset.state = state;
    if (size) choice.dataset.size = size;
    if (!visual) {
      choice.setAttribute("role", kind === "switch" ? "switch" : kind === "radio" ? "radio" : "checkbox");
      choice.setAttribute("aria-checked", mixed ? "mixed" : checked ? "true" : "false");
    }
    if (!visual && (disabled || loading)) choice.disabled = true;
    if (!visual && bare) choice.tabIndex = -1;
    if (label) choice.setAttribute("aria-label", label);

    const box = document.createElement("span");
    box.className = "choice-box";
    if (kind === "switch") {
      const knob = document.createElement("span");
      knob.className = "choice-knob";
      if (loading) {
        const spin = drawIcon("refresh");
        if (spin) knob.append(spin);
      }
      box.append(knob);
    } else if (kind === "radio") {
      const dot = document.createElement("span");
      dot.className = "choice-dot";
      box.append(dot);
    } else if (mixed) {
      const dash = document.createElement("span");
      dash.className = "choice-dash";
      box.append(dash);
    } else if (checked) {
      const mark = drawIcon("confirm");
      if (mark) box.append(mark);
    }
    choice.append(box);

    if (!bare && (label || sub || icon)) {
      if (icon) {
        const glyph = drawIcon(icon);
        if (glyph) {
          glyph.classList.add("choice-glyph");
          choice.append(glyph);
        }
      }
      const copy = document.createElement("span");
      copy.className = "choice-copy";
      if (label) {
        const title = document.createElement("span");
        title.className = "choice-label";
        title.textContent = label;
        copy.append(title);
      }
      if (sub) copy.append(Object.assign(document.createElement("span"), { className: "choice-sub", textContent: sub }));
      choice.append(copy);
    }
    if (extra) {
      const fee = document.createElement("span");
      fee.className = "choice-extra";
      fee.textContent = extra;
      choice.append(fee);
    }

    if (!bare && label) choice.removeAttribute("aria-label");

    if (!visual) choice.addEventListener("click", () => {
      if (disabled || loading || state) return;
      if (onChange) onChange();
    });
    return choice;
  }

  function createNavTile(options = {}) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "choice-nav";
    if (options.disabled) {
      tile.disabled = true;
      tile.dataset.disabled = "true";
    }
    tile.setAttribute("aria-label", options.title || "");
    const well = document.createElement("span");
    well.className = "choice-nav-well";
    const glyph = drawIcon(options.icon);
    if (glyph) well.append(glyph);
    const copy = document.createElement("span");
    copy.className = "choice-nav-copy";
    if (options.title) {
      const title = document.createElement("span");
      title.className = "choice-label";
      title.textContent = options.title;
      copy.append(title);
    }
    if (options.count) {
      const count = document.createElement("span");
      count.className = "choice-sub";
      count.textContent = options.count;
      copy.append(count);
    }
    tile.append(well, copy);
    const chevron = drawIcon("next");
    if (chevron) {
      chevron.dataset.mirror = "true";
      chevron.classList.add("choice-nav-chevron");
      tile.append(chevron);
    }
    if (options.onClick) tile.addEventListener("click", options.onClick);
    return tile;
  }

  window.createChoice = createChoice;
  window.createNavTile = createNavTile;
  window.drawChoiceIcon = drawIcon;
})();
