(function () {
  const page = document.querySelector('[data-page="button-groups"]');
  if (!page || !window.createButtonGroup) return;

  const guide = [
    ["Segmented control", "Switches between views of the same content. One always selected.", "Day · Week · Month"],
    ["Single-choice chips", "Pick one value from a short set. Works like a radio group.", "SAR 5k · 10k · 25k"],
    ["Filter chips", "Turn several options on or off. Any number, including none.", "mada · Visa · Apple Pay"],
    ["Attached buttons", "Separate actions on one object, grouped to save space.", "Edit · Duplicate · Delete"],
    ["Action pair", "Primary and secondary action at the end of a form or dialog.", "Cancel · Save"],
  ];

  const sizes = [
    ["sm", "Small", "H 32 · 13 px · 72 w", ["Day", "Week", "Month"], "Day", "Chart range", "Chart headers, inside cards and tables."],
    ["md", "Medium", "H 40 · 14 px · 104 w", ["Overview", "Activity", "Statements"], "Activity", "Page section", "Default. Page sections and drawers."],
    ["lg", "Large", "H 48 · 15 px · 130 w", ["Local", "International"], "Local", "Transfer type", "Mobile and key choices, e.g. transfer type."],
  ];

  const states = [
    ["Default", "", "Unselected segment"],
    ["Hover", "hover", "Web only"],
    ["Focus", "focus", "Arrow keys move"],
    ["Pressed", "pressed", "Mobile tap"],
    ["Disabled", "disabled", "Whole group only"],
  ];

  const amounts = [
    { label: "5k", value: "5,000" },
    { label: "10k", value: "10,000" },
    { label: "25k", value: "25,000" },
    { label: "50k", value: "50,000" },
    { label: "Custom", value: "custom" },
  ];

  const methods = ["mada", "Visa", "Mastercard", "Apple Pay", "STC Pay", "Tap on Phone"];

  const views = [
    { label: "Bar chart", value: "bar", icon: "bar-chart" },
    { label: "Line chart", value: "line", icon: "line-chart" },
    { label: "Table", value: "table", icon: "category" },
  ];

  const bars = [40, 62, 48, 80, 56, 90, 70, 84];

  const formats = [
    { label: "PDF", value: "PDF", description: "Statement layout, signed" },
    { label: "CSV", value: "CSV", description: "For Excel and accounting" },
    { label: "MT940", value: "MT940", description: "For ERP import" },
  ];

  const pairs = [
    ["Form or dialog", [
      { label: "Cancel", variant: "secondary" },
      { label: "Save changes", variant: "primary" },
    ]],
    ["Destructive confirmation", [
      { label: "Keep card", variant: "secondary" },
      { label: "Freeze card", variant: "destructive" },
    ]],
    ["Drawer with approval", [
      { label: "Reject", variant: "secondary" },
      { label: "Approve", variant: "ink" },
    ]],
    ["Multi-step flow", [
      { label: "Save draft", variant: "ghost" },
      { label: "Back", variant: "secondary" },
      { label: "Continue", variant: "primary" },
    ]],
  ];

  const transfers = [
    ["Local", "To any Saudi bank", "Arrives within minutes via sarie."],
    ["International", "SWIFT, 40+ currencies", "Arrives in 1–3 business days."],
    ["Own", "Between your accounts", "Instant and free."],
  ];

  const rules = [
    [true, "Keep labels short and parallel: \"Day · Week · Month\"."],
    [true, "Segments in one group are the same width."],
    [true, "One primary per group at most. Everything else is outline or text."],
    [true, "Show the selected count on filter chips and a way to clear them."],
    [false, "Don't use a segmented control for actions; it only switches views."],
    [false, "Don't put more than 5 segments; use tabs or a dropdown."],
    [false, "Don't mix gradient and outline buttons inside one attached group."],
    [false, "Don't place Cancel on the right on web or the bottom-first on mobile."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-button-groups="${name}"]`);
  }

  function fillGuide() {
    const root = mount("guide");
    guide.forEach(([title, copy, example]) => {
      const card = el("div", "grp-guide-card");
      const text = el("p", "", copy);
      card.append(el("strong", "", title), text, el("span", "grp-example", example));
      root.append(card);
    });
  }

  function fillSizes() {
    const root = mount("sizes");
    sizes.forEach(([size, name, spec, labels, value, label, use]) => {
      const row = el("div", "grp-size");
      const title = el("div", "grp-name");
      title.append(el("span", "", name), el("span", "grp-spec", spec));
      const sample = el("div", "grp-sample");
      sample.append(createButtonGroup({
        kind: "segment",
        size,
        label,
        options: labels,
        value,
      }));
      row.append(title, sample, el("span", "grp-use", use));
      root.append(row);
    });
  }

  function fillStates() {
    const root = mount("states");
    states.forEach(([name, state, note]) => {
      const card = el("div", "grp-state");
      card.append(el("span", "grp-kicker", name));
      card.append(createButtonGroup({
        kind: "segment",
        size: "sm",
        label: `${name} segment`,
        options: ["Day", "Week"],
        value: "Day",
        state,
      }));
      card.append(el("span", "grp-hint", note));
      root.append(card);
    });
  }

  function fillAmounts() {
    const readout = mount("amount-value");
    mount("amounts").append(createButtonGroup({
      kind: "choice",
      label: "Monthly card limit",
      align: "center",
      options: amounts,
      value: "10,000",
      onChange(value) {
        readout.textContent = value === "custom" ? "SAR —" : `SAR ${value}`;
      },
    }));
  }

  function fillFilters() {
    const readout = mount("filter-count");
    function paint(values) {
      readout.textContent = values.length ? `${values.length} selected` : "All methods";
    }
    mount("filters").append(createButtonGroup({
      kind: "filter",
      label: "Payment methods",
      options: methods,
      value: ["mada", "Visa"],
      onChange: paint,
    }));
    paint(["mada", "Visa"]);
  }

  function fillIcons() {
    const label = mount("view-label");
    const chart = mount("chart");
    bars.forEach((height) => {
      const bar = el("span", "grp-bar");
      bar.style.height = `${height}%`;
      bar.dataset.height = String(height);
      chart.append(bar);
    });
    function paint(value) {
      const view = views.find((item) => item.value === value) || views[0];
      label.textContent = view.label;
      chart.dataset.view = value;
      chart.querySelectorAll(".grp-bar").forEach((bar) => {
        bar.style.height = value === "bar" ? `${bar.dataset.height}%` : "";
      });
    }
    mount("views").append(createButtonGroup({
      kind: "icon",
      label: "Chart view",
      options: views,
      value: "bar",
      onChange: paint,
    }));
    paint("bar");
  }

  function fillAttached() {
    mount("toolbar").append(createButtonGroup({
      kind: "attached",
      label: "Transfer actions",
      options: [
        { label: "Edit", icon: "edit" },
        { label: "Duplicate", icon: "copy" },
        { label: "Delete", icon: "delete", tone: "danger" },
      ],
    }));
    mount("pager").append(createButtonGroup({
      kind: "attached",
      shape: "tile",
      label: "Statement month",
      options: [
        { icon: "previous", iconOnly: true, ariaLabel: "Previous" },
        { label: "Oct 2026", inert: true },
        { icon: "next", iconOnly: true, ariaLabel: "Next" },
      ],
    }));
  }

  function fillSplit() {
    const message = mount("split-message");
    let exported = "";
    mount("split").append(createButtonGroup({
      kind: "split",
      label: "Export statement",
      variant: "primary",
      action: "Export",
      value: "PDF",
      menuLabel: "More export formats",
      options: formats,
      onAction(value) {
        exported = value;
        message.textContent = `Exported as ${exported}. The main button remembers the last format.`;
      },
    }));
    mount("split").append(createButtonGroup({
      kind: "split",
      label: "Save draft",
      variant: "secondary",
      action: "Save draft",
      menuLabel: "More actions",
    }));
    message.textContent = "The main part runs the default; the arrow opens alternatives.";
  }

  function fillPairs() {
    const root = mount("pairs");
    pairs.forEach(([context, options]) => {
      const row = el("div", "grp-pair");
      row.append(el("span", "", context));
      row.append(createButtonGroup({
        kind: "pair",
        label: context,
        options,
      }));
      root.append(row);
    });
    mount("mobile-pair").append(createButtonGroup({
      kind: "pair",
      layout: "stack",
      label: "Review transfer",
      options: [
        { label: "Send SAR 25,000", variant: "primary", size: "lg" },
        { label: "Edit details", variant: "ghost", size: "lg" },
      ],
    }));
  }

  function fillMobile() {
    const title = mount("transfer-title");
    const copy = mount("transfer-copy");
    function paint(value) {
      const row = transfers.find((item) => item[0] === value) || transfers[0];
      title.textContent = row[1];
      copy.textContent = row[2];
    }
    mount("mobile-segment").append(createButtonGroup({
      kind: "segment",
      block: true,
      label: "Transfer type",
      options: transfers.map((item) => item[0]),
      value: "Local",
      onChange: paint,
    }));
    paint("Local");
    mount("sheet").append(createButtonGroup({
      kind: "split",
      presentation: "sheet",
      block: true,
      size: "lg",
      label: "Download statement",
      action: "Download",
      value: "PDF",
      menuLabel: "More formats",
      options: [
        { label: "Download CSV", value: "CSV" },
        { label: "Send by email", value: "Email" },
      ],
    }));
  }

  function fillArabic() {
    const root = mount("arabic");
    root.append(createButtonGroup({
      kind: "segment",
      size: "md",
      label: "قسم الصفحة",
      options: ["نظرة عامة", "النشاط", "الكشوفات"],
      value: "نظرة عامة",
    }));
    root.append(createButtonGroup({
      kind: "choice",
      label: "حد البطاقة الشهري",
      options: [
        { label: "5 آلاف", value: "5,000" },
        { label: "10 آلاف", value: "10,000" },
        { label: "25 ألف", value: "25,000" },
        { label: "50 ألف", value: "50,000" },
        { label: "مخصص", value: "custom" },
      ],
      value: "10,000",
    }));
    const row = el("div", "grp-rtl-row");
    row.append(
      createButtonGroup({
        kind: "attached",
        label: "إجراءات التحويل",
        options: [
          { label: "تعديل" },
          { label: "تكرار" },
          { label: "حذف", tone: "danger" },
        ],
      }),
      createButtonGroup({
        kind: "split",
        label: "تصدير الكشف",
        variant: "primary",
        action: "تصدير",
        value: "PDF",
        menuLabel: "صيغ تصدير أخرى",
        options: [
          { label: "PDF", value: "PDF", description: "تنسيق الكشف، موقّع" },
          { label: "CSV", value: "CSV", description: "لبرنامج Excel والمحاسبة" },
          { label: "MT940", value: "MT940", description: "للاستيراد في نظام ERP" },
        ],
      }),
      createButtonGroup({
        kind: "split",
        label: "حفظ كمسودة",
        variant: "secondary",
        action: "حفظ كمسودة",
        menuLabel: "إجراءات أخرى",
      })
    );
    root.append(row);
    root.append(createButtonGroup({
      kind: "pair",
      label: "تذييل النموذج",
      options: [
        { label: "إلغاء", variant: "secondary" },
        { label: "حفظ التغييرات", variant: "primary" },
      ],
    }));
  }

  function fillRules() {
    const root = mount("rules");
    rules.forEach(([ok, text]) => {
      const card = el("div", "grp-rule");
      const mark = el("span", "grp-mark", ok ? "✓" : "×");
      mark.dataset.ok = ok ? "true" : "false";
      card.append(mark, el("span", "", text));
      root.append(card);
    });
  }

  fillGuide();
  fillSizes();
  fillStates();
  fillAmounts();
  fillFilters();
  fillIcons();
  fillAttached();
  fillSplit();
  fillPairs();
  fillMobile();
  fillArabic();
  fillRules();
})();
