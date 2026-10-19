(function () {
  const page = document.querySelector('[data-page="filters"]');
  if (!page || !window.createFilterPill) return;

  const pills = [
    ["default", "Status", "Default", "No value set"],
    ["hover", "Status", "Hover", "Web only"],
    ["open", "Status", "Open", "Popover showing"],
    ["applied", "Status: Settled", "Applied · one", "Value in the label, × clears", true],
    ["count", "Branch", "Applied · many", "Count badge", false, 2],
    ["disabled", "Terminal", "Disabled", "Not available for this view"],
  ];

  const diff = [
    ["Apply", "Instantly on every change", "Collected in the sheet, one Apply button"],
    ["Entry", "Filter pills + More filters drawer", "Chip row + filter icon with count"],
    ["Applied", "Tags under the bar + Clear all", "Badge on the icon, chips highlighted"],
    ["Result count", "Next to the tags", 'In the Apply button: "Show 5 results"'],
    ["Empty", 'Empty state with "clear all filters"', 'Inline message with "Reset filters"'],
  ];

  const areas = [
    ["Transactions", [["Date", true], ["Status", true], ["Method", true], ["Type", false], ["Branch", false], ["Card", false], ["Amount", false]]],
    ["POS sales chart", [["Period", true], ["Compare", true], ["Channel", true], ["Branch", false], ["Terminal", false]]],
    ["Cards", [["Status", true], ["Holder", true], ["Type", false], ["Team", false]]],
    ["Transfers", [["Status", true], ["Date", true], ["Beneficiary", false], ["Amount", false]]],
    ["Payroll", [["Month", true], ["Department", false], ["Status", false]]],
  ];

  const rules = [
    [true, 'Show at most 3 filters in the bar. Put the rest in "More filters".'],
    [true, 'Put the value in the filter label once set: "Status: Settled", "Branch · 2".'],
    [true, 'Always show applied filters, the result count and "Clear all".'],
    [true, "Web: apply on change. Mobile sheet: apply with one button that shows the count."],
    [true, "Keep filters when people open a row and come back."],
    [true, "Chart series toggles double as the legend."],
    [false, "Don't let the last chart series be turned off silently; explain why the chart is empty."],
    [false, "Don't use dropdown-selects for filters with 2–4 options; use chips or segments."],
    [false, "Don't reset filters when the user changes the search text."],
    [false, 'Don\'t show "0 results" without a way out.'],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-filters="${name}"]`);
  }

  function block(kicker, node, note) {
    const card = el("div", "flt-block");
    card.append(el("span", "flt-label", kicker), node, el("p", "flt-note", note));
    return card;
  }

  const pillGrid = el("div", "flt-specimens");
  pills.forEach(([state, label, name, hint, clear, count]) => {
    const specimen = el("div", "flt-specimen");
    specimen.append(
      createFilterPill({ label, state, clear, count }),
      el("strong", "", name),
      el("span", "flt-hint", hint),
    );
    pillGrid.append(specimen);
  });
  const panel = el("div", "flt-panel");
  panel.append(el("span", "flt-label", "Filter pill states"), pillGrid);
  mount("pills").append(panel);

  const blocks = el("div", "flt-blocks");
  blocks.append(
    block("Multi-select popover", createBranchMenu(), "Checkboxes, counts per option, search over 7 options. Changes apply instantly."),
    block("Amount range", createAmountMenu(), "Presets first, slider and fields stay in sync. Amounts in Mono."),
    block("Quick filters · segmented + chips", createQuickFilters(), "For the 1–2 filters people use most. One tap, always visible, no popover."),
  );
  mount("blocks").append(blocks);
  mount("transactions").append(createTransactionFilters());

  const split = el("div", "flt-split");
  split.append(createSalesFilters(), createCardFilters());
  mount("chart").append(split);
  mount("mobile").append(createActivityFilters());

  const compare = el("div", "flt-side");
  compare.append(el("span", "flt-label", "Web vs mobile"));
  const head = el("div", "flt-diff-head");
  ["", "Web", "Mobile"].forEach((label) => head.append(el("span", "", label)));
  compare.append(head);
  diff.forEach(([name, web, mobile]) => {
    const row = el("div", "flt-diff-row");
    row.append(el("strong", "", name), el("span", "", web), el("span", "", mobile));
    compare.append(row);
  });

  const guide = el("div", "flt-side");
  guide.append(el("span", "flt-label", "What each area filters by"));
  areas.forEach(([name, filters]) => {
    const area = el("div", "flt-area");
    const row = el("div", "flt-area-row");
    filters.forEach(([label, primary]) => {
      const chip = el("span", "flt-area-chip", label);
      if (primary) chip.dataset.primary = "true";
      row.append(chip);
    });
    area.append(el("strong", "", name), row);
    guide.append(area);
  });
  guide.append(el("p", "flt-note", 'Green = shown in the bar or chip row. Gray = in "More filters".'));

  const aside = el("div", "flt-aside");
  aside.append(compare, guide);
  mount("aside").append(aside);

  const ruleGrid = el("div", "flt-rules");
  rules.forEach(([ok, text]) => {
    const card = el("div", "flt-rule");
    const mark = el("span", "flt-rule-mark", ok ? "✓" : "×");
    mark.dataset.ok = ok ? "true" : "false";
    card.append(mark, el("span", "", text));
    ruleGrid.append(card);
  });
  mount("rules").append(ruleGrid);
})();
