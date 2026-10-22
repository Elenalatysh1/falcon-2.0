/**
 * Accordions. Load vendor/hala-icons.js and selection.js, then this script.
 *
 * createAccordion({
 *   variant: "divided" | "card" | "compact" | "grouped" | "detail",
 *   exclusive, interactive,
 *   items: [{
 *     title, subtitle, meta, icon, body, lines, options,
 *     open, disabled, loading, state
 *   }]
 * })
 *
 * lines: [{ label, value, mono }]
 * options: [{ label, checked }]  — compact filters, rendered as checkboxes
 * state: "collapsed" | "hover" | "focus" | "expanded" | "loading" | "disabled"
 */
(function () {
  const catalog = {
    cards: "credit-card",
    close: "x",
    confirm: "check",
    expand: "chevron-down",
    language: "globe",
    loader: "loader-circle",
    notifications: "bell",
  };

  let nextId = 0;

  function uid(prefix) {
    nextId += 1;
    return `${prefix}-${nextId}`;
  }

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

  function setOpen(item, open) {
    item.dataset.open = open ? "true" : "false";
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
    if (panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function syncCheck(choice, checked) {
    choice.dataset.checked = checked ? "true" : "false";
    choice.setAttribute("aria-checked", checked ? "true" : "false");
    const box = choice.querySelector(".choice-box");
    if (!box) return;
    box.querySelectorAll(".hala-icon").forEach((icon) => icon.remove());
    if (checked && window.drawChoiceIcon) {
      const mark = window.drawChoiceIcon("confirm");
      if (mark) box.append(mark);
    }
  }

  function createAccordion(options = {}) {
    const {
      variant = "divided",
      exclusive = variant === "divided" || variant === "grouped",
      interactive = true,
      items = [],
    } = options;

    const root = document.createElement("div");
    root.className = "accordion";
    root.dataset.variant = variant;

    const triggers = [];

    items.forEach((item) => {
      const open = item.state === "expanded" || (!item.state && !!item.open);
      const disabled = item.state === "disabled" || !!item.disabled;
      const loading = item.state === "loading" || !!item.loading;
      const id = uid("accordion");
      const row = document.createElement("div");
      row.className = "accordion-item";
      if (item.state) row.dataset.state = item.state;
      if (disabled) row.dataset.disabled = "true";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "accordion-trigger";
      trigger.id = `${id}-trigger`;
      trigger.setAttribute("aria-controls", `${id}-panel`);
      if (item.state === "hover" || item.state === "focus") trigger.dataset.state = item.state;
      if (!interactive) trigger.tabIndex = -1;
      if (disabled) trigger.disabled = true;

      if (item.icon) {
        const tile = document.createElement("span");
        tile.className = "accordion-icon";
        const glyph = drawIcon(item.icon);
        if (glyph) tile.append(glyph);
        trigger.append(tile);
      }

      const copy = document.createElement("span");
      copy.className = "accordion-copy";
      const title = document.createElement("span");
      title.className = "accordion-title";
      title.id = `${id}-title`;
      title.textContent = item.title || "";
      copy.append(title);
      if (item.subtitle) {
        const sub = document.createElement("span");
        sub.className = "accordion-sub";
        sub.textContent = item.subtitle;
        copy.append(sub);
      }
      trigger.append(copy);

      if (item.meta && variant !== "detail") {
        const meta = document.createElement("span");
        meta.className = "accordion-meta";
        meta.textContent = item.meta;
        trigger.append(meta);
      }

      if (variant === "detail" && item.meta) {
        const aside = document.createElement("span");
        aside.className = "accordion-aside";
        aside.textContent = item.meta;
        trigger.append(aside);
      }

      let count = null;
      if (variant === "compact" && item.options) {
        count = document.createElement("span");
        count.className = "accordion-count";
        trigger.append(count);
      }

      if (loading) {
        const spin = document.createElement("span");
        spin.className = "accordion-spinner";
        const glyph = drawIcon("loader");
        if (glyph) spin.append(glyph);
        trigger.append(spin);
      }

      const chevron = document.createElement("span");
      chevron.className = "accordion-chevron";
      const mark = drawIcon("expand");
      if (mark) chevron.append(mark);
      trigger.append(chevron);

      const panel = document.createElement("div");
      panel.className = "accordion-panel";
      panel.id = `${id}-panel`;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", title.id);
      const inner = document.createElement("div");
      inner.className = "accordion-panel-inner";

      if (item.body) {
        const body = document.createElement("p");
        body.className = "accordion-body";
        body.textContent = item.body;
        inner.append(body);
      }

      if (item.lines) {
        const lines = document.createElement("div");
        lines.className = "accordion-lines";
        item.lines.forEach((line) => {
          const rowLine = document.createElement("div");
          rowLine.className = "accordion-line";
          if (line.mono) rowLine.dataset.mono = "true";
          const name = document.createElement("span");
          name.textContent = line.label;
          const value = document.createElement("span");
          value.textContent = line.value;
          rowLine.append(name, value);
          lines.append(rowLine);
        });
        inner.append(lines);
      }

      if (item.options && window.createChoice) {
        const list = document.createElement("div");
        list.className = "accordion-options";
        const choices = item.options.map((option) => {
          const choice = window.createChoice({
            kind: "checkbox",
            label: option.label,
            checked: !!option.checked,
            onChange: () => {
              const next = choice.dataset.checked !== "true";
              syncCheck(choice, next);
              refreshCount();
            },
          });
          list.append(choice);
          return choice;
        });
        inner.append(list);

        function refreshCount() {
          const selected = choices.filter((choice) => choice.dataset.checked === "true").length;
          if (!count) return;
          count.hidden = selected === 0;
          count.textContent = String(selected);
        }
        refreshCount();
      }

      if (item.content instanceof Node) inner.append(item.content);

      panel.append(inner);
      row.append(trigger, panel);
      setOpen(row, open && !disabled);
      root.append(row);
      if (interactive && !disabled) triggers.push(trigger);

      trigger.addEventListener("click", () => {
        if (!interactive || disabled) return;
        const next = row.dataset.open !== "true";
        if (next && exclusive) {
          [...root.children].forEach((sibling) => {
            if (sibling !== row) setOpen(sibling, false);
          });
        }
        setOpen(row, next);
      });
    });

    root.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const current = event.target.closest(".accordion-trigger");
      const index = triggers.indexOf(current);
      if (index < 0) return;
      const next = event.key === "ArrowDown" ? triggers[index + 1] : triggers[index - 1];
      if (!next) return;
      event.preventDefault();
      next.focus();
    });

    return root;
  }

  window.createAccordion = createAccordion;
  window.drawAccordionIcon = drawIcon;
})();
