/**
 * Divider. Load this script after dividers.css.
 *
 * createDivider({
 *   tone: "subtle" | "default" | "strong" | "tint" | "control" | "dashed" | "inverse" | "danger",
 *   variant: "line" | "vertical" | "label" | "dot",
 *   weight: "regular" | "hairline",
 *   label, labelStyle: "text" | "overline" | "chip",
 *   align: "center" | "start",
 *   size: "stat" | "toolbar",
 *   inset: false | "text" | "section",
 *   visible: true
 * })
 *
 * A divider separates content. It is not a button.
 */
(function () {
  function rule() {
    const line = document.createElement("span");
    line.className = "divider-rule";
    line.setAttribute("aria-hidden", "true");
    return line;
  }

  function createDivider(options = {}) {
    const {
      tone = "subtle",
      variant,
      weight = "regular",
      label = "",
      labelStyle = "text",
      align = "center",
      size,
      inset = false,
      visible = true,
    } = options;

    const kind = variant || (label ? "label" : "line");
    const node = document.createElement(kind === "line" ? "hr" : "span");
    node.className = "divider";
    node.dataset.variant = kind;
    node.dataset.tone = tone;
    node.dataset.weight = weight;

    if (kind === "vertical") {
      node.setAttribute("role", "separator");
      node.setAttribute("aria-orientation", "vertical");
      if (size) node.dataset.size = size;
    } else if (kind === "dot") {
      node.setAttribute("aria-hidden", "true");
    } else if (kind === "label") {
      node.setAttribute("role", "separator");
      node.dataset.align = align;
      node.dataset.label = labelStyle;
      if (label) node.setAttribute("aria-label", label);
      const text = document.createElement("span");
      text.className = "divider-label";
      text.textContent = label;
      text.setAttribute("aria-hidden", "true");
      if (align !== "start") node.append(rule());
      node.append(text);
      node.append(rule());
    }

    if (inset) node.dataset.inset = inset === true ? "text" : inset;
    if (!visible) node.dataset.visible = "false";
    return node;
  }

  window.createDivider = createDivider;
})();
