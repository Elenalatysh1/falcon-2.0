/**
 * Checkbox, radio, and switch.
 * Load lucide UMD, then this script.
 *
 * createChoice({
 *   kind: "checkbox" | "radio" | "switch",
 *   label, sub, extra, icon,
 *   checked, mixed, disabled, error, danger, loading,
 *   state, size, bare, onChange
 * })
 */
(function () {
  const catalog = {
    cards: "credit-card",
    cash: "banknote",
    confirm: "check",
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
    const lucide = window.lucide;
    if (!lucide || !name) return null;
    const kebab = catalog[name] || name;
    const node = lucide.icons[pascal(kebab)];
    if (!node) return null;
    const svg = lucide.createElement(node);
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

  window.createChoice = createChoice;
  window.drawChoiceIcon = drawIcon;
})();
