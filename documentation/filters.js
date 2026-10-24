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
    ["Show at most 3 filters in the bar; put the rest in More filters.", "Use a dropdown for a filter with 2–4 options; use chips or segments."],
    ["Put the value in the label once set: “Status: Settled”, “Branch · 2”.", "Reset filters when the search text changes."],
    ["Always show applied filters, the result count and Clear all.", "Show “0 results” without a way out."],
    ["Let series toggles double as the chart legend.", "Turn the last chart series off silently; say why the chart is empty."],
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

  const aside = el("div", "flt-aside");
  aside.append(compare);
  mount("aside").append(aside);

  const guide = el("div", "flt-side");
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
  mount("areas").append(guide);

  const arabic = mount("arabic");
  if (arabic) {
    const wrap = el("div", "flt-panel");
    wrap.dir = "rtl";
    wrap.lang = "ar";
    wrap.style.fontFamily = "var(--font-arabic)";
    const row = el("div", "flt-specimens");
    [["الحالة: مكتمل", true], ["الفرع", false, 2], ["فلاتر أخرى"]].forEach(([label, applied, count]) => {
      row.append(createFilterPill({ label, state: applied ? "applied" : "default", clear: applied, count }));
    });
    wrap.append(el("span", "flt-label", "3 من 8 عمليات"), row);
    arabic.append(wrap);
  }

  rules.forEach(([yes, no], index) => {
    const card = el("div", "lst-rule");
    card.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
    [[true, yes], [false, no]].forEach(([ok, text]) => {
      const line = el("div", "lst-rule-line");
      line.dataset.ok = ok ? "true" : "false";
      line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
      card.append(line);
    });
    mount("rules").append(card);
  });
})();
