(function () {
  const page = document.querySelector('[data-page="time-picker"]');
  if (!page || !window.createTimeFields) return;

  const which = [
    ["Fixed steps (15–60 min)", "Web: slot list with type-to-filter · Mobile: same list in a sheet"],
    ["Exact minutes", "Web: hour / minute columns · iOS: wheel · Android: clock dial"],
    ["Opening hours", "Per-day toggle + from–to ranges, split shifts"],
    ["Filter by time", "Time range inside the date range picker, 30 min steps"],
    ["Known exact time", "Typed field with mask hh:mm"],
  ];

  const rules = [
    [true, "Always show the time zone once on the page: \"Riyadh time (GMT+3)\"."],
    [true, "Let people type the time as well as pick it."],
    [true, "Mark times that change the outcome, e.g. \"Next day\" after the cut-off."],
    [true, "Validate ranges: closing must be after opening; use \"+1\" past midnight."],
    [true, "Offer quick choices (Now, 9:00 AM) before the full picker."],
    [true, "Use Mono for times so digits align in lists."],
    [false, "Don't use minute steps of 1 when 5 or 30 is enough."],
    [false, "Don't mix 12h and 24h on one screen."],
    [false, "Don't hide AM/PM in 12h format."],
    [false, "Don't use a picker for durations; use a number field with units."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-time="${name}"]`);
  }

  mount("states").append(createTimeFields());
  const web = el("div", "tp-pair");
  web.append(createTimeSlots(), createTimeColumns());
  mount("web").append(web);
  mount("hours").append(createOpeningHours());
  const phones = el("div", "tp-phones");
  phones.append(createTimeWheel(), createTimeDial());
  mount("mobile").append(phones);

  const card = el("div", "tp-which");
  which.forEach(([name, copy]) => {
    const row = el("div", "tp-which-row");
    row.append(el("strong", "", name), el("span", "", copy));
    card.append(row);
  });
  const ruleGrid = el("div", "tp-rules");
  rules.forEach(([ok, text]) => {
    const rule = el("div", "tp-rule");
    const mark = el("span", "tp-rule-mark", ok ? "✓" : "×");
    mark.dataset.ok = ok ? "true" : "false";
    rule.append(mark, el("span", "", text));
    ruleGrid.append(rule);
  });
  const bottom = el("div", "tp-bottom");
  bottom.append(card, ruleGrid);
  mount("rules").append(bottom);
})();
