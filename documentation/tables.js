(function () {
  const page = document.querySelector('[data-page="tables"]');
  if (!page || !window.createSpendTable) return;

  const specs = [
    ["Header", "H 44 · Mono 11 caps"],
    ["Row · compact", "48"],
    ["Row · default", "60"],
    ["Row · relaxed", "72"],
    ["Cell padding", "0 16 · gap 14"],
    ["Divider", "1 px"],
    ["Selected row", "Brand tint"],
    ["Hover row", "Surface hover"],
    ["Mobile row", "≥ 64 pt"],
    ["Swipe action", "76–84 pt wide"],
  ];

  const rules = [
    [true, "Right-align amounts and numbers so decimals line up."],
    [true, "Put the main identifier first and actions last."],
    [true, "Show one action button per row; move the rest into ⋯."],
    [true, "Replace the toolbar with bulk actions while rows are selected."],
    [true, "Keep the header sticky when the table scrolls."],
    [true, "On mobile, convert rows into list items or cards."],
    [false, "Don't use zebra stripes; use dividers and hover."],
    [false, "Don't center text columns."],
    [false, "Don't show more than 8 columns; let users hide columns instead."],
    [false, "Don't put a full table on mobile, except statements with a fixed first column."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-tables="${name}"]`);
  }

  mount("cells").append(createCellTypes());
  mount("spend").append(createSpendTable());

  const split = el("div", "tbl-split");
  split.append(createTeamTable(), createInvoiceTable());
  const more = el("div", "tbl-stack");
  more.append(split, createTableStates());
  mount("more").append(more);

  const phones = el("div", "tbl-phones");
  phones.append(createReviewList(), createTerminalCards(), createStatementTable());
  mount("mobile").append(phones);

  const specCard = el("div", "tbl-specs");
  specs.forEach(([name, value]) => {
    const row = el("div", "tbl-spec");
    row.append(el("span", "", name), el("span", "", value));
    specCard.append(row);
  });
  const ruleGrid = el("div", "tbl-rules");
  rules.forEach(([ok, text]) => {
    const card = el("div", "tbl-rule");
    const mark = el("span", "tbl-rule-mark", ok ? "✓" : "×");
    mark.dataset.ok = ok ? "true" : "false";
    card.append(mark, el("span", "", text));
    ruleGrid.append(card);
  });
  const bottom = el("div", "tbl-bottom");
  bottom.append(specCard, ruleGrid);
  mount("rules").append(bottom);
})();
