/**
 * Overlays. Load lucide UMD, button.js, and inputs.js, then this script.
 *
 * createOverlay({
 *   kind: "modal" | "drawer" | "menu" | "tooltip" | "sheet" | "action" | "fullscreen" | "alert",
 *   preset, title, description, contained, open, dismiss,
 *   onClose, onSubmit
 * })
 *
 * Escape, the scrim, and the close button dismiss modals, drawers, menus, and sheets.
 * Alerts and explicit confirmations stay until a button is chosen.
 * Focus moves into the dialog and returns to the trigger on close.
 */
(function () {
  const stack = [];
  const snaps = ["peek", "half", "full"];
  const modalPresets = {
    s: { size: "s", title: "Rename card", description: "Only your team sees this name.", fields: [["Card name", "Marketing team"]], primary: "Save" },
    m: { size: "m", title: "Add beneficiary", description: "We check the IBAN with the bank before saving.", fields: [["Full name", "Khalid Al-Harbi"], ["IBAN", "SA44 2000 0001 2345 6789 7519"], ["Nickname (optional)", "Khalid · supplier"]], primary: "Add beneficiary" },
    l: { size: "l", title: "Export statement", description: "Choose the account, period and format.", fields: [["Account", "SA57 •• 1951 · Main"], ["Period", "1 Sep – 30 Sep 2026"], ["Format", "PDF"], ["Language", "English"], ["Send copy to", "finance@khamis.sa"]], primary: "Export" },
    err: { size: "m", title: "Add beneficiary", description: "We check the IBAN with the bank before saving.", fields: [["Full name", "Khalid Al-Harbi"], ["IBAN", "SA44 2000 0001 2345 6789 7510", true]], primary: "Try again", error: "The bank rejected this IBAN. Check it and try again." },
    load: { size: "m", title: "Add beneficiary", description: "We check the IBAN with the bank before saving.", fields: [["Full name", "Khalid Al-Harbi"], ["IBAN", "SA44 2000 0001 2345 6789 7519"]], primary: "Checking…", loading: true },
    del: { size: "confirm", title: "Delete beneficiary?", description: "Khalid Al-Harbi will be removed. Scheduled transfers to him are cancelled.", fields: [], primary: "Delete", danger: true, cancel: "Keep" },
  };

  const catalog = {
    close: "x",
    delete: "trash-2",
    info: "circle-alert",
    show: "eye",
    edit: "pencil",
    "line-chart": "chart-line",
    freeze: "snowflake",
    more: "ellipsis",
  };
  const mirror = new Set([]);

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
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
    if (mirror.has(kebab)) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function btn(label, variant, extra) {
    if (window.createButton) return window.createButton({ label, variant, size: "md", ...extra });
    const node = el("button", "", label);
    node.type = "button";
    return node;
  }

  function focusables(node) {
    return [...node.querySelectorAll("button, input, textarea, select, a[href], [tabindex]")].filter((item) => !item.disabled && item.tabIndex !== -1 && !item.closest("[hidden]"));
  }

  function openLayers() {
    return stack.filter((item) => item.dataset.open === "true" && !item.closest("[hidden]"));
  }

  function onDocKey(event) {
    const open = openLayers();
    if (!open.length) return;
    const focused = open.find((item) => item.contains(document.activeElement));
    const top = focused || open[open.length - 1];
    if (event.key === "Escape") {
      if (top.dataset.dismiss === "explicit") return;
      event.preventDefault();
      top.requestClose();
      return;
    }
    if (event.key !== "Tab" || !focused) return;
    const items = focusables(top.panel || top);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!window.__falconOverlayKeys) {
    window.addEventListener("keydown", onDocKey);
    window.__falconOverlayKeys = true;
  }

  function shell(options) {
    const root = el("div", "overlay");
    root.dataset.kind = options.kind;
    root.dataset.open = options.open === false ? "false" : "true";
    if (options.contained) root.dataset.contained = "true";
    if (options.dismiss) root.dataset.dismiss = options.dismiss;
    const scrim = el("button", "overlay-scrim");
    scrim.type = "button";
    scrim.setAttribute("aria-label", "Close");
    const panel = el("div", "overlay-panel");
    const titleId = `overlay-title-${Math.random().toString(36).slice(2, 7)}`;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", titleId);
    panel.tabIndex = -1;
    root.append(scrim, panel);
    root.panel = panel;
    root.scrim = scrim;
    root.titleId = titleId;
    let trigger = null;
    let dirty = false;

    function remember() {
      trigger = options.trigger || document.activeElement;
    }

    function finishClose() {
      root.dataset.open = "false";
      root.dataset.leaving = "false";
      const index = stack.indexOf(root);
      if (index >= 0) stack.splice(index, 1);
      if (trigger && trigger.focus) trigger.focus();
      if (options.onClose) options.onClose();
    }

    root.requestClose = () => {
      if (root.dataset.open !== "true") return;
      if (dirty && root.showAsk) {
        root.showAsk();
        return;
      }
      root.dataset.leaving = "true";
      window.setTimeout(finishClose, 180);
    };
    root.open = () => {
      remember();
      root.dataset.leaving = "false";
      root.dataset.open = "true";
      if (!stack.includes(root)) stack.push(root);
      window.setTimeout(() => {
        const field = panel.querySelector("input, textarea, button");
        if (field) field.focus();
        else panel.focus();
      }, 0);
    };
    root.setDirty = (value) => {
      dirty = !!value;
    };
    scrim.addEventListener("click", () => {
      if (root.dataset.dismiss === "explicit") return;
      root.requestClose();
    });
    if (root.dataset.open === "true") stack.push(root);
    return root;
  }

  function header(root, title, description, danger) {
    const head = el("div", "overlay-head");
    if (danger) {
      const mark = el("span", "overlay-mark");
      const icon = drawIcon("delete");
      if (icon) mark.append(icon);
      head.append(mark);
    }
    const copy = el("div", "overlay-copy");
    const heading = el("h3", "overlay-title", title);
    heading.id = root.titleId;
    copy.append(heading);
    if (description) copy.append(el("p", "overlay-desc", description));
    const close = btn("", "secondary", { icon: "close", iconOnly: true, size: "sm", ariaLabel: "Close" });
    close.classList.add("overlay-close");
    close.addEventListener("click", () => root.requestClose());
    head.append(copy, close);
    return head;
  }

  function footer(root, primary, cancel, extra) {
    const foot = el("div", "overlay-foot");
    const dismiss = btn(cancel || "Cancel", "secondary");
    const submit = btn(primary || "Save", extra && extra.danger ? "destructive" : "primary", { loading: !!(extra && extra.loading) });
    dismiss.addEventListener("click", () => root.requestClose());
    submit.addEventListener("click", () => {
      if (extra && extra.loading) return;
      if (optionsSubmit(root)) return;
      root.requestClose();
    });
    foot.append(dismiss, submit);
    return foot;
  }

  function optionsSubmit(root) {
    return root.onSubmit && root.onSubmit() === false;
  }

  function fieldBox(label, value, error) {
    const field = el("div", "overlay-field");
    if (error) field.dataset.error = "true";
    const name = el("span", "", error ? "IBAN not found at the bank" : label);
    const val = el("b", "", value);
    if (label === "IBAN") val.dataset.mono = "true";
    field.append(name, val);
    return field;
  }

  function fields(list) {
    const wrap = el("div", "overlay-body");
    list.forEach(([label, value, error]) => wrap.append(fieldBox(label, value, error)));
    return wrap;
  }

  function createModal(options) {
    const preset = modalPresets[options.preset || "m"];
    const root = shell({ ...options, kind: "modal" });
    root.dataset.size = preset.size;
    if (preset.loading) root.dataset.busy = "true";
    const head = header(root, preset.title, preset.description, preset.danger);
    const body = fields(preset.fields, preset.loading);
    if (preset.error) {
      const alert = el("div", "overlay-alert", preset.error);
      const icon = drawIcon("info");
      if (icon) alert.prepend(icon);
      body.prepend(alert);
    }
    if (preset.fields.length > 2) {
      head.dataset.divided = "true";
    }
    const foot = footer(root, preset.primary, preset.cancel, preset);
    if (preset.fields.length > 2) foot.dataset.divided = "true";
    if (!preset.fields.length && !preset.error) body.hidden = true;
    root.panel.append(head, body, foot);
    root.onSubmit = options.onSubmit;
    return root;
  }

  function createDrawer(options) {
    const root = shell({ ...options, kind: "drawer", open: options.open });
    const head = header(root, options.title || "Transaction", "");
    const tabs = el("div", "overlay-tabs");
    tabs.setAttribute("role", "tablist");
    let tab = 0;
    const panels = [el("div", "overlay-body"), el("div", "overlay-body")];
    panels[1].hidden = true;
    ["Details", "Activity"].forEach((label, index) => {
      const button = el("button", "overlay-tab", label);
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.addEventListener("click", () => {
        tab = index;
        panels.forEach((panel, panelIndex) => {
          panel.hidden = panelIndex !== index;
        });
        [...tabs.children].forEach((child, childIndex) => {
          child.setAttribute("aria-selected", childIndex === index ? "true" : "false");
        });
      });
      tabs.append(button);
    });
    const foot = el("div", "overlay-foot");
    const ask = el("div", "overlay-ask");
    ask.hidden = true;
    const card = el("div", "overlay-ask-card");
    card.append(el("strong", "", "Discard your note?"), el("p", "", "Your changes to the note aren't saved yet."));
    const actions = el("div", "overlay-ask-actions");
    const keep = btn("Keep editing", "secondary");
    const discard = btn("Discard", "destructive");
    keep.addEventListener("click", () => {
      ask.hidden = true;
    });
    discard.addEventListener("click", () => {
      root.setDirty(false);
      ask.hidden = true;
      root.requestClose();
    });
    actions.append(keep, discard);
    card.append(actions);
    ask.append(card);
    root.showAsk = () => {
      ask.hidden = false;
      keep.focus();
    };
    root.panel.append(head, tabs, panels[0], panels[1], foot, ask);
    root.body = panels[0];
    root.activity = panels[1];
    root.footer = foot;
    root.onSubmit = options.onSubmit;
    return root;
  }

  function createMenu(options) {
    const root = el("div", "overlay-menu");
    root.setAttribute("role", "menu");
    root.hidden = options.open === false;
    const items = options.items || [
      ["View details", "show"],
      ["Rename", "edit"],
      ["Change limit", "line-chart"],
      ["Freeze", "freeze", true],
    ];
    items.forEach(([label, icon, danger]) => {
      const item = el("button", "overlay-menu-item", label);
      item.type = "button";
      item.setAttribute("role", "menuitem");
      if (danger) item.dataset.danger = "true";
      const glyph = drawIcon(icon);
      if (glyph) item.prepend(glyph);
      item.addEventListener("click", () => {
        root.hidden = true;
        root.dataset.open = "false";
        const index = stack.indexOf(root);
        if (index >= 0) stack.splice(index, 1);
        if (options.onSelect) options.onSelect(label);
      });
      root.append(item);
    });
    root.dataset.kind = "menu";
    root.dataset.open = root.hidden ? "false" : "true";
    root.toggle = (anchor) => {
      if (anchor) root.anchor = anchor;
      root.hidden = !root.hidden;
      root.dataset.open = root.hidden ? "false" : "true";
      if (root.anchor) root.anchor.setAttribute("aria-expanded", root.hidden ? "false" : "true");
      if (!root.hidden) {
        if (!stack.includes(root)) stack.push(root);
        const first = root.querySelector("button");
        if (first) first.focus();
      } else {
        const index = stack.indexOf(root);
        if (index >= 0) stack.splice(index, 1);
        if (root.anchor && root.anchor.focus) root.anchor.focus();
      }
    };
    document.addEventListener("pointerdown", (event) => {
      if (root.hidden) return;
      if (root.contains(event.target)) return;
      if (root.anchor && root.anchor.contains(event.target)) return;
      root.requestClose();
    });
    root.requestClose = () => {
      if (!root.hidden) root.toggle();
    };
    root.panel = root;
    return root;
  }

  function createTooltip(options) {
    const root = el("span", "overlay-tip");
    const trigger = el("button", "overlay-tip-trigger");
    trigger.type = "button";
    trigger.setAttribute("aria-label", options.label || "More information");
    const icon = drawIcon("info");
    if (icon) trigger.append(icon);
    const bubble = el("span", "overlay-tip-bubble", options.text || "Balance minus pending card holds.");
    bubble.setAttribute("role", "tooltip");
    bubble.hidden = true;
    let timer = 0;
    function show() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        bubble.hidden = false;
      }, 300);
    }
    function hide() {
      window.clearTimeout(timer);
      bubble.hidden = true;
    }
    trigger.addEventListener("mouseenter", show);
    trigger.addEventListener("mouseleave", hide);
    trigger.addEventListener("focus", show);
    trigger.addEventListener("blur", hide);
    root.append(trigger, bubble);
    return root;
  }

  function createSheet(options) {
    const root = shell({ ...options, kind: "sheet", open: options.open !== false });
    let snap = 1;
    root.dataset.snap = snaps[snap];
    const handle = el("button", "overlay-handle");
    handle.type = "button";
    handle.setAttribute("aria-label", "Resize sheet");
    handle.append(el("span", ""));
    const head = el("div", "overlay-head");
    const heading = el("h3", "overlay-title", "Pay from");
    heading.id = root.titleId;
    const snapLabel = el("span", "overlay-snap", "HALF");
    head.append(heading, snapLabel);
    const list = el("div", "overlay-sheet-list");
    list.setAttribute("role", "radiogroup");
    list.setAttribute("aria-label", "Pay from");
    const accounts = [
      ["Main account", "SA57 •• 1951 · SAR 175,000"],
      ["Payroll", "SA12 •• 2433 · SAR 82,400"],
      ["Savings", "SA88 •• 0412 · SAR 310,000"],
      ["Branch Jeddah", "SA30 •• 7710 · SAR 12,900"],
    ];
    let selected = 0;
    function paintAccounts() {
      list.replaceChildren();
      accounts.forEach(([name, detail], index) => {
        const row = el("button", "overlay-account");
        row.type = "button";
        row.setAttribute("role", "radio");
        row.setAttribute("aria-checked", index === selected ? "true" : "false");
        const text = el("span", "overlay-account-copy");
        text.append(el("strong", "", name), el("span", "", detail));
        const radio = el("span", "overlay-radio");
        radio.append(el("i", ""));
        row.append(text, radio);
        row.addEventListener("click", () => {
          selected = index;
          paintAccounts();
        });
        list.append(row);
      });
    }
    paintAccounts();
    const foot = el("div", "overlay-foot");
    const confirm = btn("Confirm", "primary", { size: "lg" });
    confirm.addEventListener("click", () => root.requestClose());
    foot.append(confirm);
    handle.addEventListener("click", () => {
      snap = (snap + 1) % snaps.length;
      root.dataset.snap = snaps[snap];
      snapLabel.textContent = snaps[snap].toUpperCase();
    });
    root.panel.append(handle, head, list, foot);
    return root;
  }

  function createAction(options) {
    const root = shell({ ...options, kind: "action", open: options.open !== false });
    const card = el("div", "overlay-action-card");
    card.append(el("div", "overlay-action-title", "Marketing card •• 4417"));
    [["Show card details", false], ["Change limit", false], ["Rename", false], ["Freeze card", true]].forEach(([label, danger]) => {
      const row = el("button", "overlay-action", label);
      row.type = "button";
      if (danger) row.dataset.danger = "true";
      row.addEventListener("click", () => root.requestClose());
      card.append(row);
    });
    const cancel = el("button", "overlay-cancel", "Cancel");
    cancel.type = "button";
    cancel.addEventListener("click", () => root.requestClose());
    root.panel.append(card, cancel);
    return root;
  }

  function createFull(options) {
    const root = shell({ ...options, kind: "fullscreen", open: options.open !== false });
    const head = el("div", "overlay-head");
    const close = btn("", "secondary", { icon: "close", iconOnly: true, size: "sm", ariaLabel: "Close" });
    close.classList.add("overlay-close");
    close.addEventListener("click", () => root.requestClose());
    const copy = el("div", "overlay-copy");
    const heading = el("h3", "overlay-title", "New transfer");
    heading.id = root.titleId;
    copy.append(heading);
    head.append(close, copy, el("span", "overlay-step", "1/3"));
    const body = el("div", "overlay-body");
    body.append(fieldBox("Beneficiary", "Nour Trading"));
    const amount = el("div", "overlay-amount");
    amount.append(el("span", "overlay-kv", "Amount"), el("strong", "", "25,000"), el("span", "", "Available SAR 175,000.00"));
    body.append(amount);
    const foot = el("div", "overlay-foot");
    const next = btn("Continue", "primary", { size: "lg" });
    next.addEventListener("click", () => root.requestClose());
    foot.append(next);
    root.panel.append(head, body, foot);
    return root;
  }

  function createAlert(options) {
    const root = shell({ ...options, kind: "alert", dismiss: "explicit", open: options.open !== false });
    const card = el("div", "overlay-alert-card");
    card.setAttribute("role", "alertdialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-labelledby", root.titleId);
    const body = el("div", "overlay-body");
    const mark = el("span", "overlay-mark");
    const icon = drawIcon("info");
    if (icon) mark.append(icon);
    const heading = el("h3", "overlay-title", "Freeze this card?");
    heading.id = root.titleId;
    body.append(mark, heading, el("p", "overlay-desc", "Payments on •• 4417 stop right away."));
    const freeze = btn("Freeze card", "destructive");
    const keep = btn("Keep active", "ghost");
    freeze.addEventListener("click", () => {
      root.dataset.dismiss = "any";
      root.requestClose();
    });
    keep.addEventListener("click", () => {
      root.dataset.dismiss = "any";
      root.requestClose();
    });
    body.append(freeze, keep);
    card.append(body);
    root.panel.append(card);
    root.panel.removeAttribute("role");
    return root;
  }

  function createOverlay(options = {}) {
    const kind = options.kind === "full" ? "fullscreen" : (options.kind || "modal");
    if (kind === "drawer") return createDrawer(options);
    if (kind === "menu") return createMenu(options);
    if (kind === "tooltip") return createTooltip(options);
    if (kind === "sheet") return createSheet(options);
    if (kind === "action") return createAction(options);
    if (kind === "fullscreen") return createFull(options);
    if (kind === "alert") return createAlert(options);
    return createModal(options);
  }

  window.createOverlay = createOverlay;
  window.overlayGuide = [
    ["Modal dialog", "A short task or decision that must be finished first: add beneficiary, rename card.", "Yes", "danger", "Cancel, ×, Esc, backdrop", "Web"],
    ["Confirmation", "Before an irreversible or costly action: delete, freeze all cards, send above limit.", "Yes", "danger", "Explicit button only", "Web + mobile"],
    ["Drawer", "Details or editing while keeping the list visible: transaction detail, filters, card settings.", "Partly", "partial", "×, Esc, backdrop", "Web"],
    ["Popover / menu", "A few options tied to one element: row actions, date range, column picker.", "No", "brand", "Click outside, Esc, select", "Web"],
    ["Tooltip", "One-line explanation of an icon or term. Never actions or essential info.", "No", "brand", "Mouse leaves, blur", "Web"],
    ["Bottom sheet", "Choices or short forms on mobile: pick account, filters, share IBAN.", "Partly", "partial", "Swipe down, ×, backdrop", "Mobile"],
    ["Full-screen modal", "Multi-step or long tasks on mobile: new transfer, card request, KYB upload.", "Yes", "danger", "Back / ×, asks if unsaved", "Mobile"],
    ["Action sheet", "2–6 actions on one item on mobile: freeze, rename, report card.", "Yes", "danger", "Select, Cancel, swipe", "Mobile"],
  ];
})();
