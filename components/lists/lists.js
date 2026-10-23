/**
 * Lists. Load vendor/hala-icons.js and components/badges/badges.js first,
 * then components/lists/lists.css and this script.
 *
 * createList({ label, items, divided })              Container: role="list", one cell per row.
 * createListItem({ title, subtitle, meta, leading, value, trailing, selected, disabled, state, onClick, href, end })
 *   leading: { icon, tone } for an icon tile, or { initials, tone } for an avatar. tone 1–5 for avatars.
 *   trailing: "chevron" (default when the row opens something), "check", "none".
 *   lines follow the copy: title only, + subtitle, + meta.
 * createTransactionRow({ merchant, detail, amount, flow, status, density, initials, tone, masked, currency, state, onClick, end })
 *   A List item preset. flow: "in" | "out" | "declined". status: { label, tone } from createBadge.
 *   density: "default" (two lines, status visible) | "compact" (one line, 48 tall). Declined always shows its badge.
 * createListHeader({ label, total, sticky })          Groups rows (by day, by type). total is a signed number.
 * createDetailRow({ label, value, style })            Label and value. style: "text" | "mono" | "amount" | "total".
 * createListSkeleton({ rows, leading })               Loading state: bone rows with the same rhythm.
 * createAmount(value, { signed, kind, size, masked, maskedLabel, currency })  Riyal sign (or currency: "code" for SAR),
 *   + / − sign, mono digits that never mirror. size: "xl" | "l" | "m" | "s" | "xs". masked keeps the sign, hides the digits.
 *
 * state: "default" | "hover" | "pressed" | "focus" | "disabled" | "selected" renders an inert specimen.
 */
(function () {
  const MIRROR = new Set(["chevron-right", "chevron-left", "arrow-swap-horizontal", "send"]);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null && text !== "") node.textContent = text;
    return node;
  }

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size) {
    const set = window.halaIcons;
    if (!set || !name || !set.icons[pascal(name)]) return null;
    const svg = set.createElement(set.icons[pascal(name)]);
    svg.classList.add("hala-icon");
    svg.dataset.icon = name;
    if (size) svg.dataset.size = size;
    if (MIRROR.has(name)) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function format(value) {
    return Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function createAmount(value, options = {}) {
    const node = el("span", "list-amount");
    const kind = options.kind || (options.signed && value > 0 ? "credit" : "plain");
    node.dataset.kind = kind;
    node.dataset.size = options.size || "s";
    let mark;
    if (options.currency === "code") mark = el("span", "list-code", "SAR");
    else mark = el("span", "list-sar");
    mark.setAttribute("aria-hidden", "true");
    if (options.masked) {
      node.dataset.masked = "true";
      node.append(mark, el("span", "list-digits", "••••••"));
      node.setAttribute("aria-label", options.maskedLabel || "Amount hidden");
      return node;
    }
    const sign = options.signed ? (value > 0 ? "+" : "−") : "";
    node.append(mark, el("span", "list-digits", `${sign}${format(value)}`));
    node.setAttribute("aria-label", `${sign === "−" ? "minus " : sign === "+" ? "plus " : ""}${format(value)} Saudi riyals`);
    return node;
  }

  function leadingNode(leading) {
    if (!leading) return null;
    if (leading.initials) {
      const avatar = el("span", "list-avatar", leading.initials);
      avatar.dataset.tone = String(leading.tone || 1);
      avatar.setAttribute("aria-hidden", "true");
      return avatar;
    }
    const tile = el("span", "list-tile");
    const glyph = icon(leading.icon || "cards");
    if (glyph) tile.append(glyph);
    tile.setAttribute("aria-hidden", "true");
    return tile;
  }

  function createListItem(options = {}) {
    const specimen = Boolean(options.state);
    const interactive = Boolean(options.onClick || options.href) || specimen;
    const tag = options.href ? "a" : interactive ? "button" : "div";
    const row = el(tag, "list-item");
    if (tag === "button") row.type = "button";
    if (options.href) row.href = options.href;
    if (options.key) row.dataset.key = options.key;
    row.dataset.lines = String(1 + (options.subtitle ? 1 : 0) + (options.meta ? 1 : 0));
    if (options.density) row.dataset.density = options.density;
    const selected = Boolean(options.selected || options.state === "selected");
    if (selected) {
      row.dataset.selected = "true";
      if (tag === "button") row.setAttribute("aria-pressed", "true");
    }
    if (options.disabled || options.state === "disabled") {
      if (tag === "button") row.disabled = true;
      row.setAttribute("aria-disabled", "true");
    }
    if (specimen) {
      row.dataset.state = options.state;
      row.tabIndex = -1;
    }
    if (options.onClick && !specimen) row.addEventListener("click", options.onClick);

    const lead = options.leadingNode || leadingNode(options.leading);
    if (lead) row.append(lead);

    const copy = el("span", "list-copy");
    copy.append(el("span", "list-title", options.title));
    if (options.subtitle) copy.append(el("span", "list-subtitle", options.subtitle));
    if (options.meta) copy.append(el("span", "list-meta", options.meta));
    row.append(copy);

    if (options.side) row.append(options.side);
    else if (options.value) row.append(el("span", "list-value", options.value));

    const trailing = options.trailing || (selected ? "check" : interactive && !options.end ? "chevron" : "none");
    if (trailing === "chevron" || trailing === "check") {
      const glyph = icon(trailing === "check" ? "check" : "chevron-right");
      if (glyph) {
        const end = el("span", "list-trailing");
        end.dataset.kind = trailing;
        end.append(glyph);
        row.append(end);
      }
    }
    if (!options.end) return row;
    const cell = el("div", "list-with-end");
    cell.append(row, options.end);
    return cell;
  }

  function createTransactionRow(options = {}) {
    const flow = options.flow || "out";
    const compact = options.density === "compact";
    const side = el("span", "list-side");
    const kind = flow === "declined" ? "muted" : flow === "in" ? "credit" : "plain";
    side.append(createAmount(flow === "in" ? Math.abs(options.amount) : -Math.abs(options.amount), {
      signed: true,
      kind,
      size: compact ? "xs" : "s",
      masked: options.masked,
      currency: options.currency,
    }));
    const showStatus = options.status && (!compact || flow === "declined");
    if (showStatus && window.createBadge) {
      side.append(createBadge({ label: options.status.label, tone: options.status.tone, variant: "subtle", size: "sm", icon: Boolean(options.status.icon) }));
    }
    const row = createListItem({
      ...options,
      title: options.merchant,
      subtitle: compact ? "" : options.detail,
      leading: { initials: options.initials || initials(options.merchant), tone: options.tone },
      side,
      trailing: "none",
      density: compact ? "compact" : "default",
    });
    (row.classList.contains("list-item") ? row : row.querySelector(".list-item")).dataset.flow = flow;
    return row;
  }

  function initials(name) {
    return String(name || "").split(/[\s·]+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  }

  function createListHeader(options = {}) {
    const head = el("div", "list-header");
    head.setAttribute("role", "heading");
    head.setAttribute("aria-level", String(options.level || 3));
    if (options.sticky) head.dataset.sticky = "true";
    head.append(el("span", "list-header-label", options.label));
    if (typeof options.total === "number") head.append(createAmount(options.total, { kind: "muted", size: "xs" }));
    return head;
  }

  function createDetailRow(options = {}) {
    const style = options.style || "text";
    const row = el("div", "list-detail");
    row.dataset.style = style;
    const label = el("dt", "list-detail-label", options.label);
    const value = el("dd", "list-detail-value");
    if (style === "amount" || style === "total") value.append(createAmount(Number(options.value), { size: style === "total" ? "m" : "s" }));
    else value.textContent = options.value;
    row.append(label, value);
    return row;
  }

  function createDetails(rows) {
    const list = el("dl", "list-details");
    rows.forEach((row) => list.append(row.nodeType ? row : createDetailRow(row)));
    return list;
  }

  function createList(options = {}) {
    const list = el("ul", "list");
    list.setAttribute("role", "list");
    if (options.label) list.setAttribute("aria-label", options.label);
    if (options.divided) list.dataset.divided = "true";
    (options.items || []).forEach((item, index) => {
      if (item.classList && item.classList.contains("list-header")) {
        const cell = el("li", "list-cell");
        cell.dataset.kind = "header";
        cell.append(item);
        list.append(cell);
        return;
      }
      const cell = el("li", "list-cell");
      cell.style.setProperty("--list-order", String(Math.min(index, 4)));
      cell.append(item);
      list.append(cell);
    });
    return list;
  }

  function createListSkeleton(options = {}) {
    const rows = options.rows || 4;
    const list = el("div", "list list-skeleton");
    list.setAttribute("role", "status");
    list.setAttribute("aria-label", options.label || "Loading");
    for (let index = 0; index < rows; index += 1) {
      const row = el("div", "list-item");
      row.dataset.lines = "2";
      row.setAttribute("aria-hidden", "true");
      if (options.leading !== false) row.append(el("span", "list-bone list-bone-lead"));
      const copy = el("span", "list-copy");
      copy.append(el("span", "list-bone list-bone-title"), el("span", "list-bone list-bone-sub"));
      row.append(copy, el("span", "list-bone list-bone-end"));
      list.append(row);
    }
    return list;
  }

  window.createList = createList;
  window.createListItem = createListItem;
  window.createTransactionRow = createTransactionRow;
  window.createListHeader = createListHeader;
  window.createDetailRow = createDetailRow;
  window.createDetails = createDetails;
  window.createListSkeleton = createListSkeleton;
  window.createAmount = createAmount;
})();
