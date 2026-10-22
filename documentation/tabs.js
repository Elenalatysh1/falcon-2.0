(function () {
  const page = document.querySelector('[data-page="tabs"]');
  if (!page || !window.createTabs) return;

  const web = [
    ["Overview", [
      ["Card", "•••• 4821", true],
      ["Holder", "Nour Trading Co."],
      ["Status", "Active"],
      ["Available", "SAR 18,400.00", true],
    ]],
    ["Limits", [
      ["Monthly limit", "SAR 25,000.00", true],
      ["Per transaction", "SAR 5,000.00", true],
      ["Spent this month", "SAR 6,600.00", true],
    ]],
    ["Settings", [
      ["Online payments", "On"],
      ["International use", "On"],
      ["ATM withdrawals", "Off"],
    ]],
    ["Activity", [
      ["Oct 21 · Office supplies", "SAR 1,240.00", true],
      ["Oct 19 · Cloud hosting", "SAR 3,180.00", true],
      ["Oct 14 · Courier", "SAR 2,180.00", true],
    ]],
  ];

  const inbox = [
    ["Tasks", 3, [
      ["Approve transfer", "Nour Trading · due today"],
      ["Review invoice", "INV-2041 · due Oct 30"],
      ["Confirm beneficiary", "Al Noor Logistics"],
    ]],
    ["Updates", 4, [
      ["Card limit raised", "Purchase card · today"],
      ["Statement ready", "September 2026"],
      ["Payroll sent", "42 employees"],
      ["New sign-in", "Riyadh · Chrome on Mac"],
    ]],
  ];

  const card = [
    ["Overview", [["Available", "SAR 18,400.00", true], ["Status", "Active"]]],
    ["Limits", [["Monthly", "SAR 25,000.00", true], ["Per transaction", "SAR 5,000.00", true]]],
    ["Settings", [["Online payments", "On"], ["ATM withdrawals", "Off"]]],
  ];

  const platforms = [
    ["Web", "Tabs fit=\"hug\"", "44 px min height", "role tablist, tab and tabpanel · aria-selected · 2 px focus ring", "Hover in secondary. Arrow keys move and switch, Home and End jump."],
    ["iOS", "Tabs fit=\"fill\"", "44 pt min height", "VoiceOver reads \"Tasks, 3, tab, 1 of 2\" with the selected trait", "Pressed shows the grey underline. More than 4 tabs scroll the row."],
    ["Android", "Tabs fit=\"fill\"", "48 dp min height", "contentDescription \"Tasks, 3 new\" · Role.Tab with selected state", "Pressed shows the grey underline instead of a ripple. More than 4 tabs scroll the row."],
  ];

  const states = [
    ["Default", "default", "Tertiary label"],
    ["Hover", "hover", "Web only"],
    ["Active", "active", "Primary · 2 px line"],
    ["Pressed", "pressed", "Mobile tap"],
    ["Focus", "focus", "Keyboard only"],
    ["Disabled", "disabled", "text/disabled"],
  ];

  const rules = [
    ["Use tabs for 2–4 views of the same object, switched in place.", "Use tabs as steps in a flow or as filters. Use a stepper or chips."],
    ["Keep labels short (one or two words) and in sentence case.", "Mix icon-only and text tabs, or let labels wrap to two lines."],
    ["Show a counter only when something needs attention.", "Put counters on every tab, or show 0."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-tabs="${name}"]`);
  }

  function rows(list, kind) {
    const panel = el("div", "tbs-rows");
    panel.dataset.kind = kind || "pairs";
    list.forEach(([label, value, mono]) => {
      const row = el("div", "tbs-row");
      const end = el("span", "tbs-value", value);
      if (mono) end.dataset.mono = "true";
      row.append(el("span", "tbs-key", label), end);
      panel.append(row);
    });
    return panel;
  }

  function live(name, fit, label, data, kind) {
    const host = mount(`${name}-panels`);
    const options = data.map((item) => {
      const list = item[item.length - 1];
      const panel = rows(list, kind);
      host.append(panel);
      return { label: item[0], count: typeof item[1] === "number" ? item[1] : 0, panel };
    });
    mount(name).append(createTabs({ label, fit, options, value: options[0].label }));
  }

  function fillPlatforms() {
    const root = mount("platforms");
    platforms.forEach(([platform, api, target, a11y, behavior]) => {
      const row = el("div", "tbs-platform");
      const title = el("div", "tbs-name");
      title.append(el("span", "", platform), el("span", "tbs-spec", api));
      const access = el("div", "tbs-cell");
      access.append(el("span", "tbs-spec", target), el("span", "", a11y));
      row.append(title, access, el("span", "tbs-use", behavior));
      root.append(row);
    });
  }

  function fillStates() {
    const root = mount("states");
    states.forEach(([name, state, note]) => {
      const cell = el("div", "tbs-state");
      cell.append(createTabs({
        label: `${name} tab`,
        options: [{ label: "Tasks", count: 4 }],
        state,
      }));
      cell.append(el("span", "tbs-kicker", name), el("span", "tbs-hint", note));
      root.append(cell);
    });
  }

  function fillArabic() {
    const root = mount("arabic");
    const web = el("div", "tbs-panel-card");
    const page = el("div", "tbs-page");
    page.dir = "rtl";
    page.lang = "ar";
    page.append(el("span", "tbs-page-title", "بطاقة المشتريات"));
    page.append(createTabs({
      label: "أقسام البطاقة",
      options: ["نظرة عامة", "الحدود", "الإعدادات"],
      value: "نظرة عامة",
    }));
    web.append(el("span", "tbs-kicker", "Web · Hug"), page);

    const mobile = el("div", "tbs-panel-card");
    const phone = el("div", "tbs-phone");
    phone.dir = "rtl";
    phone.lang = "ar";
    phone.append(el("span", "tbs-phone-title", "الوارد"));
    phone.append(createTabs({
      label: "الوارد",
      fit: "fill",
      options: [
        { label: "المهام", count: 3 },
        { label: "التحديثات", count: 4 },
      ],
      value: "المهام",
    }));
    mobile.append(el("span", "tbs-kicker", "Mobile · Fill"), phone);
    root.append(web, mobile);
  }

  function fillRules() {
    const root = mount("rules");
    rules.forEach(([yes, no], index) => {
      const card = el("div", "tbs-rule");
      card.append(el("span", "tbs-kicker", String(index + 1).padStart(2, "0")));
      [[true, yes], [false, no]].forEach(([ok, text]) => {
        const line = el("div", "tbs-rule-line");
        const mark = el("span", "tbs-mark", ok ? "✓" : "×");
        mark.dataset.ok = ok ? "true" : "false";
        const copy = el("div", "tbs-rule-copy");
        copy.append(el("span", "tbs-rule-label", ok ? "Do" : "Don't"), el("span", "", text));
        line.append(mark, copy);
        card.append(line);
      });
      root.append(card);
    });
  }

  live("web", "hug", "Purchase card sections", web);
  live("inbox", "fill", "Inbox", inbox, "list");
  live("card", "fill", "Purchase card sections", card);
  fillPlatforms();
  fillStates();
  fillArabic();
  fillRules();
})();
