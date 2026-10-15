/**
 * Status badges, counts, dots, feature labels, trends, and removable tags.
 * Load lucide UMD, then this script.
 *
 * createBadge({
 *   label, tone, variant, size, icon, value, key,
 *   dismissible, onDismiss, ring, caps, mono
 * })
 *
 * variant: subtle | outline | solid | dot | feature | trend | count | presence | tag | frosted
 * tone: settled | pending | processing | scheduled | declined | refunded | frozen | draft | expired
 *       brand | info | warning | error | neutral | ink | gradient | count | online | offline | up | down | flat
 * size: lg | md | sm
 */
(function () {
  const catalog = {
    calendar: "calendar",
    cards: "credit-card",
    chat: "message-circle",
    close: "x",
    confirm: "check",
    ecommerce: "shopping-cart",
    edit: "pencil",
    error: "circle-x",
    expired: "circle-alert",
    freeze: "snowflake",
    home: "house",
    notifications: "bell",
    pending: "clock",
    refund: "undo-2",
    refresh: "refresh-cw",
    transfers: "send",
  };

  const toneIcon = {
    settled: "confirm",
    pending: "pending",
    processing: "refresh",
    scheduled: "calendar",
    declined: "error",
    refunded: "refund",
    frozen: "freeze",
    draft: "edit",
    expired: "expired",
    up: "arrow-up-right",
    down: "arrow-down-right",
    flat: "minus",
    verified: "confirm",
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

  function pip() {
    const dot = document.createElement("span");
    dot.className = "badge-pip";
    return dot;
  }

  function createBadge(options = {}) {
    const {
      label = "",
      tone = "settled",
      variant = "subtle",
      size = "md",
      icon = false,
      value,
      key,
      dismissible = false,
      onDismiss,
      ring = false,
      caps = false,
      mono = false,
      surface,
    } = options;

    const node = document.createElement("span");
    node.className = "badge";
    node.dataset.tone = tone;
    node.dataset.variant = variant;
    node.dataset.size = size;
    if (ring) node.dataset.ring = "true";
    if (caps) node.dataset.caps = "true";
    if (mono) node.dataset.mono = "true";
    if (surface) node.dataset.surface = surface;

    if (variant === "count") {
      const count = Number(value) || 0;
      node.textContent = count > 99 ? "99+" : String(count);
      return node;
    }

    if (variant === "presence") {
      if (tone === "verified") {
        const glyph = drawIcon("confirm");
        if (glyph) node.append(glyph);
      }
      return node;
    }

    if (variant === "dot") {
      node.textContent = label;
      return node;
    }

    if (icon === "dot") {
      node.append(pip());
    } else if (icon) {
      const name = icon === true ? toneIcon[tone] : icon;
      const glyph = drawIcon(name);
      if (glyph) node.append(glyph);
    }

    if (variant === "tag") {
      if (key) {
        const name = document.createElement("span");
        name.className = "badge-key";
        name.textContent = `${key}:`;
        node.append(name);
      }
      const valueNode = document.createElement("b");
      valueNode.className = "badge-value";
      valueNode.textContent = label;
      node.append(valueNode);
      if (dismissible) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "badge-remove";
        button.setAttribute("aria-label", `Remove ${label}`);
        const glyph = drawIcon("close");
        if (glyph) button.append(glyph);
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          if (onDismiss) onDismiss();
        });
        node.append(button);
      }
      return node;
    }

    if (label) node.append(document.createTextNode(label));
    return node;
  }

  window.createBadge = createBadge;
  window.drawBadgeIcon = drawIcon;
})();
