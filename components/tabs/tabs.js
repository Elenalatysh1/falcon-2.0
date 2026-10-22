/**
 * Tabs. Load this script after components/tabs/tabs.css.
 *
 * createTabs({ label, options, value, fit, state, onChange })
 *
 * options: [{ label, value, count, disabled, panel }]
 * fit: "hug" (web page headers and drawers) or "fill" (mobile, equal widths).
 * More than 4 options scroll the row; on web prefer a menu instead.
 * state: "default" | "hover" | "active" | "pressed" | "focus" | "disabled" renders one inert specimen tab.
 * count shows a counter only when it is above 0.
 * panel is an element; the tab names it, and only the selected panel is shown.
 * Arrow keys move and select, Home and End jump. Right and Left follow the reading direction.
 */
(function () {
  let uid = 0;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null && text !== "") node.textContent = text;
    return node;
  }

  function normalize(options) {
    return (options || []).map((item, index) => {
      if (typeof item === "string") return { label: item, value: item };
      return { ...item, label: item.label ?? "", value: item.value ?? item.label ?? index };
    });
  }

  function step(key, isRtl) {
    if (key === "Home") return "first";
    if (key === "End") return "last";
    if (key === "ArrowRight") return isRtl ? -1 : 1;
    if (key === "ArrowLeft") return isRtl ? 1 : -1;
    return 0;
  }

  function createTab(item) {
    const tab = el("button", "tab");
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.dataset.value = item.value;
    const content = el("span", "tab-content");
    content.append(el("span", "tab-label", item.label));
    if (Number(item.count) > 0) content.append(el("span", "tab-counter", String(item.count)));
    const underline = el("span", "tab-underline");
    underline.setAttribute("aria-hidden", "true");
    tab.append(content, underline);
    if (item.disabled) tab.disabled = true;
    return tab;
  }

  function createTabs(options = {}) {
    const items = normalize(options.options);
    const specimen = !!options.state;
    const root = el("div", "tabs");
    root.setAttribute("role", "tablist");
    root.setAttribute("aria-orientation", "horizontal");
    if (options.label) root.setAttribute("aria-label", options.label);
    root.dataset.fit = options.fit === "fill" ? "fill" : "hug";
    if (items.length > 4) root.dataset.scroll = "true";

    let current = items.findIndex((item) => item.value === options.value && !item.disabled);
    if (current < 0) current = items.findIndex((item) => !item.disabled);

    const id = `tabs-${++uid}`;
    const tabs = items.map((item, index) => {
      const tab = createTab(item);
      tab.id = `${id}-tab-${index}`;
      if (specimen) {
        tab.dataset.state = options.state;
        tab.tabIndex = -1;
        if (options.state === "disabled") tab.setAttribute("aria-disabled", "true");
      }
      if (item.panel) {
        if (!item.panel.id) item.panel.id = `${id}-panel-${index}`;
        item.panel.classList.add("tab-panel");
        item.panel.setAttribute("role", "tabpanel");
        item.panel.setAttribute("aria-labelledby", tab.id);
        item.panel.tabIndex = 0;
        tab.setAttribute("aria-controls", item.panel.id);
      }
      tab.addEventListener("click", () => {
        if (specimen || tab.disabled) return;
        select(index, false);
      });
      root.append(tab);
      return tab;
    });

    function paint() {
      tabs.forEach((tab, index) => {
        const on = index === current;
        if (!specimen) {
          tab.setAttribute("aria-selected", on ? "true" : "false");
          tab.tabIndex = on ? 0 : -1;
        } else {
          tab.setAttribute("aria-selected", options.state === "active" ? "true" : "false");
        }
        if (items[index].panel) items[index].panel.hidden = !on;
      });
    }

    function select(index, focus) {
      if (index < 0 || index === current) {
        if (focus && tabs[index]) tabs[index].focus();
        return;
      }
      current = index;
      paint();
      if (focus) {
        tabs[index].focus();
        tabs[index].scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      if (options.onChange) options.onChange(items[index].value, items[index]);
    }

    root.addEventListener("keydown", (event) => {
      if (specimen) return;
      const move = step(event.key, getComputedStyle(root).direction === "rtl");
      if (!move) return;
      const enabled = tabs.filter((tab) => !tab.disabled);
      const at = enabled.indexOf(document.activeElement);
      if (!enabled.length || at < 0) return;
      let next = at;
      if (move === "first") next = 0;
      else if (move === "last") next = enabled.length - 1;
      else next = (at + move + enabled.length) % enabled.length;
      event.preventDefault();
      select(tabs.indexOf(enabled[next]), true);
    });

    paint();
    root.select = (value) => select(items.findIndex((item) => item.value === value), false);
    return root;
  }

  window.createTabs = createTabs;
})();
