/**
 * Button groups. Load lucide UMD and components/button/button.js, then this script.
 *
 * createButtonGroup({
 *   kind: "segment" | "choice" | "filter" | "icon" | "attached" | "split" | "pair",
 *   label, options, value, size, variant, layout, shape, align,
 *   block, disabled, state, action, presentation, commit, menuLabel,
 *   onChange, onAction
 * })
 *
 * options: [{ label, value, icon, description, variant, size, tone, iconOnly, ariaLabel, inert }]
 * Segment, choice, and icon keep one selection. Filter keeps many.
 * Split uses Falcon buttons for the action and the menu chevron.
 * Attached groups and action pairs use createButton.
 */
(function () {
  const catalog = {
    "bar-chart": "chart-column",
    "line-chart": "chart-line",
    table: "table",
    edit: "pencil",
    duplicate: "copy",
    copy: "copy",
    delete: "trash-2",
    expand: "chevron-down",
    previous: "chevron-left",
    next: "chevron-right",
    confirm: "check",
  };

  const mirror = new Set(["chevron-left", "chevron-right", "arrow-left", "arrow-right"]);

  function pascal(kebab) {
    return kebab
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  function iconName(name) {
    if (!name) return "";
    return catalog[name] || name;
  }

  function drawIcon(name) {
    const lucide = window.lucide;
    if (!lucide || !name) return null;
    const kebab = iconName(name);
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

  function normalize(options) {
    return (options || []).map((item, index) => {
      if (typeof item === "string") return { label: item, value: item };
      return {
        ...item,
        label: item.label ?? "",
        value: item.value ?? item.label ?? index,
      };
    });
  }

  function rtl(node) {
    return getComputedStyle(node).direction === "rtl";
  }

  function step(key, isRtl) {
    if (key === "Home") return "first";
    if (key === "End") return "last";
    if (key === "ArrowDown") return 1;
    if (key === "ArrowUp") return -1;
    if (key === "ArrowRight") return isRtl ? -1 : 1;
    if (key === "ArrowLeft") return isRtl ? 1 : -1;
    return 0;
  }

  function bindArrows(group, selector, onPick) {
    group.addEventListener("keydown", (event) => {
      if (group.dataset.disabled === "true" || group.dataset.state) return;
      const move = step(event.key, rtl(group));
      if (!move) return;
      const items = [...group.querySelectorAll(selector)].filter((item) => !item.disabled);
      const current = items.indexOf(document.activeElement);
      if (!items.length || current < 0) return;
      let next = current;
      if (move === "first") next = 0;
      else if (move === "last") next = items.length - 1;
      else next = (current + move + items.length) % items.length;
      event.preventDefault();
      onPick(next, true);
    });
  }

  function nameGroup(group, role, label) {
    if (role) group.setAttribute("role", role);
    if (label) group.setAttribute("aria-label", label);
  }

  function lockSpecimen(group, state, disabled) {
    if (state) group.dataset.state = state;
    if (disabled || state === "disabled") {
      group.dataset.disabled = "true";
      group.setAttribute("aria-disabled", "true");
    }
  }

  function createSegment(options) {
    const items = normalize(options.options);
    const specimen = !!options.state;
    const disabled = !!options.disabled || options.state === "disabled";
    let current = items.findIndex((item) => item.value === options.value);
    if (current < 0) current = 0;

    const group = el("div", "button-group");
    group.dataset.kind = "segment";
    if (options.size) group.dataset.size = options.size;
    if (options.block) group.dataset.block = "true";
    nameGroup(group, "tablist", options.label);
    group.setAttribute("aria-orientation", "horizontal");
    group.style.setProperty("--segment-count", String(items.length || 1));
    group.style.setProperty("--segment-index", String(Math.max(current, 0)));
    lockSpecimen(group, options.state, options.disabled);

    const pill = el("span", "button-group-pill");
    pill.setAttribute("aria-hidden", "true");
    group.append(pill);

    const tabs = items.map((item, index) => {
      const tab = el("button", "button-group-segment", item.label);
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.dataset.value = item.value;
      const on = index === current;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = specimen || disabled || !on ? -1 : 0;
      if (disabled) tab.disabled = true;
      tab.addEventListener("click", () => {
        if (specimen || group.dataset.disabled === "true") return;
        select(index, false);
      });
      group.append(tab);
      return tab;
    });

    function select(index, focus) {
      current = index;
      group.style.setProperty("--segment-index", String(index));
      tabs.forEach((tab, tabIndex) => {
        const on = tabIndex === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });
      if (focus && tabs[index]) tabs[index].focus();
      if (options.onChange) options.onChange(items[index].value, items[index]);
    }

    bindArrows(group, ".button-group-segment", select);
    return group;
  }

  function createChoice(options) {
    const items = normalize(options.options);
    const specimen = !!options.state;
    const disabled = !!options.disabled;
    let current = items.findIndex((item) => item.value === options.value);
    if (current < 0) current = 0;

    const group = el("div", "button-group");
    group.dataset.kind = "choice";
    if (options.align) group.dataset.align = options.align;
    nameGroup(group, "radiogroup", options.label);
    lockSpecimen(group, options.state, disabled);

    const radios = items.map((item, index) => {
      const radio = el("button", "button-group-choice", item.label);
      radio.type = "button";
      radio.setAttribute("role", "radio");
      radio.dataset.value = item.value;
      const on = index === current;
      radio.setAttribute("aria-checked", on ? "true" : "false");
      radio.tabIndex = specimen || disabled || !on ? -1 : 0;
      if (disabled) radio.disabled = true;
      radio.addEventListener("click", () => {
        if (specimen || disabled) return;
        select(index, false);
      });
      group.append(radio);
      return radio;
    });

    function select(index, focus) {
      current = index;
      radios.forEach((radio, radioIndex) => {
        const on = radioIndex === index;
        radio.setAttribute("aria-checked", on ? "true" : "false");
        radio.tabIndex = on ? 0 : -1;
      });
      if (focus && radios[index]) radios[index].focus();
      if (options.onChange) options.onChange(items[index].value, items[index]);
    }

    bindArrows(group, ".button-group-choice", select);
    return group;
  }

  function createFilter(options) {
    const items = normalize(options.options);
    const selected = new Set(Array.isArray(options.value) ? options.value : []);
    const group = el("div", "button-group");
    group.dataset.kind = "filter";
    nameGroup(group, "group", options.label);

    function render(focusValue) {
      group.replaceChildren();
      items.forEach((item) => {
        const on = selected.has(item.value);
        const button = window.createButton({
          label: item.label,
          variant: "secondary",
          size: "sm",
          role: "filter",
          selected: on,
          icon: on ? "confirm" : "",
        });
        button.dataset.value = item.value;
        button.setAttribute("aria-pressed", on ? "true" : "false");
        button.addEventListener("click", () => {
          if (selected.has(item.value)) selected.delete(item.value);
          else selected.add(item.value);
          const next = [...selected];
          render(item.value);
          if (options.onChange) options.onChange(next, item);
        });
        group.append(button);
      });
      if (focusValue) {
        const next = group.querySelector(`[data-value="${CSS.escape(String(focusValue))}"]`);
        if (next) next.focus();
      }
    }

    render();
    return group;
  }

  function createIcons(options) {
    const items = normalize(options.options);
    let current = items.findIndex((item) => item.value === options.value);
    if (current < 0) current = 0;
    const group = el("div", "button-group");
    group.dataset.kind = "icon";
    nameGroup(group, "group", options.label);

    const buttons = items.map((item, index) => {
      const button = window.createButton({
        variant: "ghost",
        size: "sm",
        role: "segment",
        icon: iconName(item.icon),
        iconOnly: true,
        ariaLabel: item.label,
        selected: index === current,
      });
      button.title = item.label;
      button.dataset.value = item.value;
      button.addEventListener("click", () => select(index, false));
      group.append(button);
      return button;
    });

    function paint(focus) {
      buttons.forEach((button, index) => {
        const on = index === current;
        if (on) button.dataset.selected = "true";
        else delete button.dataset.selected;
        button.setAttribute("aria-pressed", on ? "true" : "false");
        button.tabIndex = on ? 0 : -1;
      });
      if (focus && buttons[current]) buttons[current].focus();
    }

    function select(index, focus) {
      current = index;
      paint(focus);
      if (options.onChange) options.onChange(items[index].value, items[index]);
    }

    paint(false);
    bindArrows(group, ".button", select);
    return group;
  }

  function createAttached(options) {
    const items = normalize(options.options);
    const group = el("div", "button-group");
    group.dataset.kind = "attached";
    if (options.shape) group.dataset.shape = options.shape;
    nameGroup(group, "group", options.label);
    items.forEach((item) => {
      if (item.inert) {
        group.append(el("span", "button-group-readout", item.label));
        return;
      }
      const button = window.createButton({
        label: item.iconOnly ? "" : item.label,
        variant: item.variant || "secondary",
        size: item.size || (item.iconOnly ? "sm" : "md"),
        icon: iconName(item.icon),
        iconOnly: !!item.iconOnly,
        ariaLabel: item.ariaLabel || (item.iconOnly ? item.label : ""),
      });
      if (item.tone) button.dataset.groupTone = item.tone;
      if (item.iconOnly) button.title = item.ariaLabel || item.label;
      group.append(button);
    });
    return group;
  }

  function createSplit(options) {
    const items = normalize(options.options);
    const presentation = options.presentation || "menu";
    const commit = options.commit !== false && presentation !== "sheet";
    let current = options.value || "";
    const group = el("div", "button-group");
    group.dataset.kind = "split";
    group.dataset.variant = options.variant || "primary";
    group.dataset.presentation = presentation;
    group.dataset.open = "false";
    if (options.size) group.dataset.size = options.size;
    if (options.block) group.dataset.block = "true";
    nameGroup(group, "group", options.label);

    const bar = el("div", "button-group-bar");
    const main = window.createButton({
      label: labelText(),
      variant: options.variant || "primary",
      size: options.size || "md",
    });
    main.addEventListener("click", () => {
      setOpen(false);
      if (options.onAction) options.onAction(current);
    });
    const divider = el("span", "button-group-divider");
    divider.setAttribute("aria-hidden", "true");
    const chevron = window.createButton({
      variant: options.variant || "primary",
      size: options.size || "md",
      icon: "expand",
      iconOnly: true,
      ariaLabel: options.menuLabel || "More options",
    });
    chevron.classList.add("button-group-chevron");
    if (items.length) {
      chevron.setAttribute("aria-haspopup", presentation === "sheet" ? "dialog" : "menu");
      chevron.setAttribute("aria-expanded", "false");
    }
    bar.append(main, divider, chevron);
    group.append(bar);

    const menu = el("div", "button-group-menu");
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    const sheet = el("div", "button-group-sheet");
    sheet.hidden = true;
    const sheetGroup = el("div", "button-group-sheet-group");
    sheetGroup.setAttribute("role", presentation === "sheet" ? "menu" : "presentation");
    const scrim = el("button", "button-group-scrim");
    scrim.type = "button";
    scrim.hidden = true;
    scrim.tabIndex = -1;
    scrim.setAttribute("aria-label", "Close");
    const entries = [];

    items.forEach((item) => {
      const button = el("button", "button-group-option");
      button.type = "button";
      button.setAttribute("role", commit ? "menuitemradio" : "menuitem");
      const copy = el("span", "button-group-option-copy");
      copy.append(el("span", "button-group-option-label", item.label));
      if (item.description) copy.append(el("span", "button-group-option-note", item.description));
      button.append(copy);
      if (commit) {
        const mark = el("span", "button-group-mark");
        const icon = drawIcon("confirm");
        if (icon) mark.append(icon);
        button.append(mark);
      }
      button.addEventListener("click", () => choose(item));
      entries.push(button);
    });

    if (presentation === "sheet") {
      sheetGroup.append(...entries);
      const cancel = el("button", "button-group-cancel", "Cancel");
      cancel.type = "button";
      cancel.addEventListener("click", () => {
        setOpen(false);
        chevron.focus();
      });
      sheet.append(sheetGroup, cancel);
      scrim.addEventListener("click", () => {
        setOpen(false);
        chevron.focus();
      });
      group.append(scrim, sheet);
    } else if (entries.length) {
      menu.append(...entries);
      group.append(menu);
    }

    function labelText() {
      if (options.action && current) return `${options.action} ${current}`;
      return options.action || current;
    }

    function paintLabel() {
      const text = main.querySelector(".button-label");
      if (text) text.textContent = labelText();
    }

    function paintMenu() {
      entries.forEach((entry, index) => {
        const on = commit && items[index].value === current;
        if (on) entry.dataset.selected = "true";
        else delete entry.dataset.selected;
        if (commit) {
          entry.setAttribute("aria-checked", on ? "true" : "false");
          const mark = entry.querySelector(".button-group-mark");
          if (mark) mark.hidden = !on;
        }
      });
    }

    function choose(item) {
      if (commit) {
        current = item.value;
        paintLabel();
        paintMenu();
      }
      setOpen(false);
      chevron.focus();
      if (options.onChange) options.onChange(item.value, item);
    }

    let listening = false;
    function onDocClick(event) {
      if (!group.contains(event.target)) setOpen(false);
    }

    function setOpen(open) {
      const next = !!open && items.length > 0;
      group.dataset.open = next ? "true" : "false";
      chevron.setAttribute("aria-expanded", next ? "true" : "false");
      menu.hidden = presentation === "sheet" || !next;
      sheet.hidden = presentation !== "sheet" || !next;
      scrim.hidden = presentation !== "sheet" || !next;
      if (next && !listening && presentation !== "sheet") {
        document.addEventListener("click", onDocClick);
        listening = true;
      }
      if (!next && listening) {
        document.removeEventListener("click", onDocClick);
        listening = false;
      }
      if (next) {
        const selected = entries.find((entry) => entry.dataset.selected === "true") || entries[0];
        if (selected) selected.focus();
      }
    }

    chevron.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(group.dataset.open !== "true");
    });
    chevron.addEventListener("keydown", (event) => {
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length) {
        event.preventDefault();
        setOpen(true);
      }
    });
    group.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || group.dataset.open !== "true") return;
      event.stopPropagation();
      setOpen(false);
      chevron.focus();
    });
    const menuKeys = presentation === "sheet" ? sheet : menu;
    menuKeys.addEventListener("keydown", (event) => {
      const role = commit ? "[role='menuitemradio']" : "[role='menuitem']";
      const buttons = [...menuKeys.querySelectorAll(role)];
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const delta = event.key === "ArrowDown" ? 1 : -1;
        buttons[(index + delta + buttons.length) % buttons.length].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        buttons[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        buttons[buttons.length - 1].focus();
      }
    });

    paintMenu();
    return group;
  }

  function createPair(options) {
    const items = normalize(options.options);
    const layout = options.layout || "row";
    const group = el("div", "button-group");
    group.dataset.kind = "pair";
    group.dataset.layout = layout;
    nameGroup(group, "group", options.label);
    items.forEach((item) => {
      const button = window.createButton({
        label: item.label,
        variant: item.variant || "secondary",
        size: item.size || "md",
        block: layout === "stack",
      });
      group.append(button);
    });
    return group;
  }

  function createButtonGroup(options = {}) {
    const kind = options.kind || "segment";
    if (kind === "segment") return createSegment(options);
    if (kind === "choice") return createChoice(options);
    if (kind === "filter") return createFilter(options);
    if (kind === "icon") return createIcons(options);
    if (kind === "attached") return createAttached(options);
    if (kind === "split") return createSplit(options);
    if (kind === "pair") return createPair(options);
    return createSegment(options);
  }

  window.createButtonGroup = createButtonGroup;
})();
