(function () {
  const page = document.querySelector('[data-page="date-pickers"]');
  if (!page || !window.createDatePicker || !window.createInput) return;

  const fields = [
    ["Empty", { label: "Date of birth", placeholder: "DD/MM/YYYY", hint: "Type or pick", trailingIcon: "calendar", state: "empty" }],
    ["Focused · typing", { label: "Date of birth", value: "12/12/19", hint: "Slashes are added for you", trailingIcon: "calendar", state: "focus", mono: true }],
    ["Filled", { label: "Transfer date", value: "18/10/2026", hint: "Sunday", trailingIcon: "calendar", state: "filled", mono: true }],
    ["Error", { label: "Transfer date", value: "17/10/2026", hint: "Saturday: banks are closed. Pick Sun–Thu.", trailingIcon: "calendar", state: "error", fill: "error", mono: true }],
    ["Disabled", { label: "Statement date", value: "30/09/2026", hint: "Set by the bank", trailingIcon: "calendar", state: "disabled", mono: true }],
    ["Read only", { label: "Account opened", value: "03/03/2024", state: "readonly", mono: true }],
  ];

  const cellStates = [
    ["default", "12", "Default", "Available day"],
    ["hover", "12", "Hover", "Web only"],
    ["today", "15", "Today", "Green ring, semibold"],
    ["selected", "18", "Selected", "Ink fill, white text"],
    ["focus", "19", "Focus", "Keyboard ring"],
    ["range", "21", "In range", "Between start and end"],
    ["past", "9", "Past", "Struck through"],
    ["unavailable", "23", "Unavailable", "Weekend or holiday"],
  ];

  const which = [
    ["One date, near future", "Popover calendar", "Sheet calendar + quick chips", "Schedule transfer, invoice due date"],
    ["Date range", "Presets + two months", "Preset chips, then sheet calendar", "Transaction filter, statement period"],
    ["Far past date", "Typed field with mask", "Wheel in a sheet", "Date of birth, CR issue date"],
    ["Month only", "Month grid popover", "Month wheel", "Statements, payroll month"],
    ["Exact known date", "Typed field", "Typed field, numeric keyboard", "ID expiry from a document"],
  ];

  const rules = [
    ["Allow typing as well as picking. Format DD/MM/YYYY.", "Use a calendar for a date of birth; it takes dozens of taps."],
    ["Disable dates that can’t work and say why in the helper text.", "Make people pick a range when a preset covers it."],
    ["Mark today with a ring, not a fill, so it doesn’t look selected.", "Mix Hijri and Gregorian in one picker; show Hijri as a secondary line."],
    ["Show the weekday next to the chosen date: “Sunday, 18 October”.", "Close the range picker after the first click."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-dates="${name}"]`);
  }

  function fillFields() {
    const grid = el("div", "dp-fields");
    fields.forEach(([name, spec]) => {
      const card = el("div", "dp-state");
      card.append(el("span", "dp-kicker", name), createInput(spec));
      grid.append(card);
    });
    mount("fields").append(grid);
  }

  function fillSingle() {
    const split = el("div", "dp-split");
    const live = el("div", "dp-card");
    const head = el("div", "dp-head");
    head.append(el("span", "dp-kicker", "Schedule transfer"), el("span", "dp-live", "Live"));
    live.append(head, createDatePicker({ open: true }));
    const states = el("div", "dp-card");
    states.append(el("span", "dp-kicker", "Day cell states · 40 × 40"));
    const cells = el("div", "dp-cells");
    cellStates.forEach(([state, label, name, copy]) => {
      const card = el("div", "dp-cell");
      card.append(createDateCell(state, label), el("strong", "", name), el("span", "", copy));
      cells.append(card);
    });
    states.append(cells);
    split.append(live, states);
    mount("single").append(split);
  }

  function fillRange() {
    const card = el("div", "dp-card");
    const head = el("div", "dp-head");
    head.append(el("span", "dp-kicker", "Transactions filter"), el("span", "dp-live", "Live"));
    card.append(head, createDateRange());
    mount("range").append(card);
  }

  function phone(title, live, backTitle, node) {
    const card = el("div", "dp-phone-card");
    const head = el("div", "dp-head");
    head.append(el("span", "dp-kicker", title), el("span", "dp-live", live));
    const frame = el("div", "dp-phone");
    const back = el("div", "dp-phone-back");
    back.append(el("strong", "", backTitle), el("span", "dp-ghost"));
    frame.append(back, el("div", "dp-scrim"));
    const sheet = el("div", "dp-sheet");
    sheet.append(node);
    frame.append(sheet);
    card.append(head, frame);
    return card;
  }

  function fillMobile() {
    const grid = el("div", "dp-phones");
    grid.append(
      phone("Sheet · schedule", "Live", "New transfer", createDateSheet()),
      phone("Wheel · date of birth", "Live · scroll", "Owner details", createDateWheel()),
    );
    mount("mobile").append(grid);
  }

  function fillWhich() {
    const table = el("div", "dp-table");
    const head = el("div", "dp-head-row");
    ["Case", "Web", "Mobile", "Example"].forEach((label) => head.append(el("span", "", label)));
    table.append(head);
    which.forEach((row) => {
      const line = el("div", "dp-row");
      row.forEach((cell, index) => line.append(el(index ? "span" : "strong", "", cell)));
      table.append(line);
    });
    mount("which").append(table);
  }

  function fillRules() {
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
  }

  function fillArabic() {
    const root = mount("arabic");
    if (!root) return;
    const wrap = el("div", "dp-card");
    wrap.dir = "rtl";
    wrap.lang = "ar";
    wrap.style.fontFamily = "var(--font-arabic)";
    wrap.append(el("span", "dp-kicker", "جدولة تحويل"), createDatePicker({ open: true }));
    root.append(wrap);
  }

  fillFields();
  fillSingle();
  fillRange();
  fillMobile();
  fillWhich();
  fillArabic();
  fillRules();
})();
