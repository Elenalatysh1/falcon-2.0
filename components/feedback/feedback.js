/**
 * Alerts, banners, notifications, toasts, and snackbars.
 * Load vendor/hala-icons.js, then this script. Button actions use createButton when it is loaded.
 *
 * createFeedback({
 *   kind: "alert" | "compact" | "banner" | "notification" | "toast" | "snackbar" | "inbox" | "push",
 *   tone: "success" | "info" | "warning" | "error" | "neutral",
 *   style: "subtle" | "outline" | "filled" | "inverse",
 *   title, description, action, secondary, time, avatar, icon,
 *   loading, progress, unread, dismissible,
 *   onAction, onSecondary, onDismiss, onActivate
 * })
 */
(function () {
  const catalog = {
    add: "plus",
    close: "x",
    confirm: "check",
    copy: "copy",
    delete: "trash-2",
    error: "circle-x",
    inbox: "inbox",
    info: "info",
    invoicing: "file-text",
    notifications: "bell",
    refresh: "refresh-cw",
    success: "circle-check",
    warning: "triangle-alert",
  };

  const toneIcon = {
    success: "success",
    info: "info",
    warning: "warning",
    error: "error",
    neutral: "info",
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

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function stop(event, fn) {
    event.stopPropagation();
    if (fn) fn();
  }

  function pill(label, onClick) {
    const button = el("button", "feedback-pill", label);
    button.type = "button";
    button.addEventListener("click", (event) => stop(event, onClick));
    return button;
  }

  function buttonAction(label, variant, onClick) {
    let button;
    if (window.createButton) {
      button = createButton({ label, variant, size: "sm" });
    } else {
      button = el("button", "feedback-pill", label);
      button.type = "button";
    }
    button.addEventListener("click", (event) => stop(event, onClick));
    return button;
  }

  function createFeedback(options = {}) {
    const {
      kind = "alert",
      tone = "info",
      style = "subtle",
      title = "",
      description = "",
      action = "",
      secondary = "",
      time = "",
      avatar = "",
      icon,
      loading = false,
      progress,
      unread = false,
      dismissible = false,
      onAction,
      onSecondary,
      onDismiss,
      onActivate,
    } = options;

    const root = document.createElement(kind === "inbox" ? "button" : "div");
    if (root.tagName === "BUTTON") root.type = "button";
    root.className = "feedback";
    root.dataset.kind = kind;
    root.dataset.tone = tone;
    if (style) root.dataset.style = style;
    if (loading) root.dataset.loading = "true";
    if (kind === "inbox") root.dataset.unread = unread ? "true" : "false";
    if (kind === "alert" || kind === "banner" || kind === "toast" || kind === "snackbar" || kind === "push") {
      root.setAttribute("role", tone === "error" ? "alert" : "status");
    }

    const glyphName = loading ? "refresh" : icon || (kind === "snackbar" ? "confirm" : toneIcon[tone]);
    const glyph = drawIcon(glyphName);

    if (kind === "toast") {
      const mark = el("span", "feedback-mark");
      if (glyph) mark.append(glyph);
      root.append(mark);
    } else if (kind === "notification" && avatar) {
      root.append(el("span", "feedback-avatar", avatar));
    } else if (kind === "push") {
      root.append(el("span", "feedback-avatar", avatar || "H"));
    } else if (kind === "notification" || kind === "inbox") {
      const well = el("span", "feedback-well");
      if (glyph) well.append(glyph);
      root.append(well);
    } else if (glyph) {
      const holder = el("span", "feedback-icon");
      holder.append(glyph);
      root.append(holder);
    }

    const copy = el("span", "feedback-copy");
    const inline = kind === "compact" || kind === "banner" || kind === "snackbar";
    if (inline) {
      if (title) copy.append(el("span", "feedback-title", title));
    } else if (title || time) {
      const row = el("span", "feedback-head");
      if (title) row.append(el("span", "feedback-title", title));
      if (time) row.append(el("span", "feedback-time", time));
      copy.append(row);
    }
    if (description && kind !== "compact" && kind !== "snackbar") {
      copy.append(el("span", "feedback-desc", description));
    }
    if (kind === "snackbar" && title) {
      /* title already added */
    }

    if (action && (kind === "alert" || kind === "compact" || kind === "toast")) {
      const link = el("button", "feedback-link", action);
      link.type = "button";
      link.addEventListener("click", (event) => stop(event, onAction));
      copy.append(link);
    }

    if (kind === "notification" && (action || secondary)) {
      const actions = el("span", "feedback-actions");
      if (action) actions.append(buttonAction(action, "ink", onAction));
      if (secondary) actions.append(buttonAction(secondary, "ghost", onSecondary || onDismiss));
      copy.append(actions);
    }

    root.append(copy);
    if (kind === "banner" && action) root.append(pill(action, onAction));
    if (kind === "snackbar" && action) {
      const undo = el("button", "feedback-undo", action);
      undo.type = "button";
      undo.addEventListener("click", (event) => stop(event, onAction));
      root.append(undo);
    }

    if (kind === "inbox") {
      root.append(el("span", "feedback-dot"));
      root.addEventListener("click", () => {
        if (onActivate) onActivate();
      });
    }

    if (dismissible && kind !== "inbox") {
      const close = el("button", "feedback-close");
      close.type = "button";
      close.setAttribute("aria-label", "Dismiss");
      const x = drawIcon("close");
      if (x) close.append(x);
      close.addEventListener("click", (event) => stop(event, onDismiss));
      root.append(close);
    }

    if (kind === "toast" || kind === "snackbar") {
      const bar = el("span", "feedback-progress");
      if (progress != null) root.style.setProperty("--feedback-progress", String(progress));
      root.append(bar);
    }

    return root;
  }

  window.createFeedback = createFeedback;
  window.drawFeedbackIcon = drawIcon;
})();
