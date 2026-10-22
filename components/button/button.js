/**
 * Button. Load vendor/hala-icons.js, then this script.
 * Names match icons/api.js: download, next, back, refresh.
 *
 * createButton({
 *   label, variant, size, icon, iconPosition,
 *   iconOnly, shape, touch, block,
 *   disabled, loading, state, ariaLabel
 * })
 */
(function () {
  const catalog = {
    add: "plus",
    back: "arrow-left",
    calendar: "calendar",
    cards: "credit-card",
    close: "x",
    confirm: "check",
    copy: "copy",
    download: "download",
    expand: "chevron-down",
    file: "file",
    filter: "list-filter",
    forward: "arrow-right",
    hide: "eye-off",
    more: "ellipsis",
    next: "chevron-right",
    pos: "smartphone",
    notifications: "bell",
    previous: "chevron-left",
    refresh: "refresh-cw",
    sadad: "receipt-text",
    share: "share-2",
    show: "eye",
    transfers: "send",
    upload: "upload",
    users: "users",
    adjust: "sliders-horizontal",
    cash: "banknote",
    freeze: "snowflake",
    language: "globe",
    lock: "lock",
    key: "key-round",
    pending: "clock",
    delivery: "truck",
  };

  const mirror = new Set(["arrow-left", "arrow-right", "chevron-left", "chevron-right", "send"]);

  function pascal(kebab) {
    return kebab
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  function drawIcon(name) {
    const iconSet = window.halaIcons;
    if (!iconSet) return null;
    const kebab = catalog[name] || name;
    const node = iconSet.icons[pascal(kebab)];
    if (!node) return null;
    const svg = iconSet.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    svg.style.strokeWidth = "var(--icon-stroke)";
    if (mirror.has(kebab)) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function createButton(options = {}) {
    const {
      label = "",
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "leading",
      trailingIcon,
      badge,
      dot = false,
      iconOnly = false,
      quiet = false,
      shape,
      touch = false,
      block = false,
      stack = false,
      role,
      selected = false,
      disabled = false,
      loading = false,
      state,
      ariaLabel,
      type = "button",
    } = options;

    const button = document.createElement("button");
    button.type = type;
    button.className = "button";
    button.dataset.variant = variant;
    button.dataset.size = size;
    if (iconOnly) button.dataset.iconOnly = "true";
    if (quiet) button.dataset.quiet = "true";
    if (shape) button.dataset.shape = shape;
    if (touch) button.dataset.touch = "true";
    if (block) button.dataset.block = "true";
    if (state) button.dataset.state = state;
    if (stack) button.dataset.stack = "true";
    if (role) button.dataset.role = role;
    if (selected) button.dataset.selected = "true";
    if (selected || role === "chip" || role === "segment" || role === "amount") {
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    }

    const glyph = icon ? drawIcon(icon) : null;
    const trail = trailingIcon ? drawIcon(trailingIcon) : null;
    const text = document.createElement("span");
    text.className = "button-label";
    text.textContent = label;

    if (stack && glyph) {
      const disc = document.createElement("span");
      disc.className = "button-disc";
      disc.append(glyph);
      button.append(disc);
      if (label) button.append(text);
    } else {
      if (glyph && iconPosition !== "trailing") button.append(glyph);
      if (!iconOnly && label) button.append(text);
      if (glyph && iconPosition === "trailing") button.append(glyph);
      if (trail) button.append(trail);
      if (badge) {
        const mark = document.createElement("span");
        mark.className = "button-badge";
        mark.textContent = badge;
        button.append(mark);
      }
    }

    if (dot) {
      const pip = document.createElement("span");
      pip.className = "button-dot";
      button.append(pip);
    }

    const spinner = document.createElement("span");
    spinner.className = "button-spinner";
    spinner.setAttribute("aria-hidden", "true");
    const spinIcon = drawIcon("refresh");
    if (spinIcon) spinner.append(spinIcon);
    button.append(spinner);

    if (iconOnly) button.setAttribute("aria-label", ariaLabel || label);
    if (disabled) button.disabled = true;
    if (loading) {
      button.dataset.loading = "true";
      button.setAttribute("aria-busy", "true");
      button.setAttribute("aria-disabled", "true");
    }
    return button;
  }

  window.createButton = createButton;
})();
