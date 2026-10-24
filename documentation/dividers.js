(function () {
  const page = document.querySelector('[data-page="dividers"]');
  if (!page || !window.createDivider) return;

  const catalog = {
    close: "x",
    confirm: "check",
    download: "download",
    next: "chevron-right",
  };

  const mirror = new Set(["chevron-right"]);

  const people = [
    ["AB", "Al Baik · Olaya", "12:41 · mada", "+ 86.25"],
    ["JB", "Jarir Bookstore", "11:08 · Visa", "− 1,249.00"],
    ["NT", "Nour Trading", "09:30 · Transfer", "− 25,000.00"],
  ];

  const ladder = [
    {
      n: "1",
      k: "Space",
      v: "24–32 px between groups. Enough for most pages.",
      bg: "subtle",
      gap: "loose",
      bars: [
        ["20", "badge", "tint"],
        ["20", "badge", "tint"],
        ["20", "badge", "tint"],
      ],
    },
    {
      n: "2",
      k: "Cards",
      v: "White card on mint-gray. For separate objects: KPIs, accounts.",
      bg: "canvas",
      gap: "cards",
      bars: [
        ["28", "compact", "card"],
        ["28", "compact", "card"],
        ["28", "compact", "card"],
      ],
    },
    {
      n: "3",
      k: "Lines",
      v: "1 px between rows of one list on a single card.",
      bg: "card",
      lines: true,
      bars: [
        ["30", "", "card"],
        ["30", "", "card"],
        ["30", "", "card"],
      ],
    },
    {
      n: "4",
      k: "Tinted band",
      v: "Background change for a whole section, e.g. totals or table header.",
      bg: "card",
      bars: [
        ["30", "top", "subtle"],
        ["30", "", "card"],
        ["30", "bottom", "brand"],
      ],
    },
  ];

  const lines = [
    ["Subtle", "#EEF2F0 · on white", "card", "subtle", "Default between list rows and inside cards."],
    ["Default", "#E1E8E5 · on white", "card", "default", "Card edges, labelled dividers, section breaks."],
    ["Strong", "#C9D4D0 · on white", "card", "strong", "Table header bottom and focused regions only."],
    ["On tint", "#DDE6E2 · on #F4F7F6", "subtle", "tint", "Lines inside gray containers and mobile lists."],
    ["Dashed", "#D7E0DC · 1 px dash", "card", "dashed", "Before a total, empty drop zones."],
    ["On dark", "rgba(255,255,255,.12)", "inverse", "inverse", "Ink cards and dark mode."],
  ];

  const days = [
    ["Today", "− 26,162.75", [
      ["AB", "Al Baik · Olaya", "+ 86.25"],
      ["JB", "Jarir Bookstore", "− 1,249.00"],
      ["NT", "Nour Trading", "− 25,000.00"],
    ]],
    ["Yesterday", "+ 381.50", [
      ["CA", "Careem", "− 38.50"],
      ["OS", "Online store #2041", "+ 420.00"],
    ]],
  ];

  const spacing = [
    ["Label and its field", "6 px", "6 pt", "6"],
    ["Rows inside a group", "0 + line", "0 + line", "0"],
    ["Cards in a grid", "12 px", "8 pt", "12"],
    ["Groups on a page", "24 px", "24 pt", "24"],
    ["Page sections", "56 px", "32 pt", "56"],
  ];

  const rules = [
    ["Try space first, then cards, then a line. Use one method per group.", "Put a line under a card edge or around every card."],
    ["Inset list lines to the text, not the icon. No line after the last row.", "Use dividers thicker than 1 px or in brand green."],
    ["Use 1 px on web and 0.5 pt hairlines on mobile.", "Separate a heading from its content with a line."],
    ["Label a divider when it marks a change: a date, “or”, unread.", "Stack two lines; a section break replaces the row line."],
  ];

  const peopleAr = [
    ["بك", "البيك · العليا", "12:41 · مدى", "+ 86.25"],
    ["جر", "مكتبة جرير", "11:08 · فيزا", "− 1,249.00"],
    ["نت", "نور للتجارة", "09:30 · تحويل", "− 25,000.00"],
  ];

  const scrollItems = ["Al Baik · Olaya", "Jarir Bookstore", "Nour Trading", "Careem", "Online store", "STC Pay", "Panda", "Tamimi", "Uber", "Aramex"];

  function pascal(kebab) {
    return kebab
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  function icon(name, size) {
    const iconSet = window.halaIcons;
    if (!iconSet || !name) return null;
    const kebab = catalog[name] || name;
    const node = iconSet.icons[pascal(kebab)];
    if (!node) return null;
    const svg = iconSet.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    if (size) svg.dataset.size = size;
    svg.style.strokeWidth = "var(--icon-stroke)";
    if (mirror.has(kebab)) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-dividers="${name}"]`);
  }

  function amount(value, className) {
    return el("span", className || "dv-amount", value);
  }

  function fillHierarchy() {
    const root = mount("hierarchy");
    ladder.forEach((item) => {
      const card = el("div", "dv-card");
      const sketch = el("div", "dv-sketch");
      sketch.dataset.bg = item.bg;
      if (item.gap) sketch.dataset.gap = item.gap;
      item.bars.forEach((bar, index) => {
        if (item.lines && index > 0) {
          sketch.append(createDivider({ tone: "default" }));
        }
        const row = el("span", "dv-bar");
        row.dataset.h = bar[0];
        if (bar[1]) row.dataset.radius = bar[1];
        row.dataset.bg = bar[2];
        sketch.append(row);
      });
      const name = el("div", "dv-name");
      name.append(el("span", "dv-index", item.n), el("strong", "", item.k));
      card.append(sketch, name, el("span", "", item.v));
      root.append(card);
    });
  }

  function fillLines() {
    const root = mount("lines");
    lines.forEach(([name, spec, surface, tone, use]) => {
      const row = el("div", "dv-line");
      const label = el("div");
      label.append(el("strong", "", name), el("span", "dv-spec", spec));
      const well = el("div", "dv-well");
      well.dataset.surface = surface;
      well.append(createDivider({ tone }));
      row.append(label, well, el("p", "", use));
      root.append(row);
    });
  }

  function personRow(person, last, hairline) {
    const row = el("div", hairline ? "dv-activity-row" : "dv-row");
    row.append(el("span", hairline ? "dv-avatar-sm" : "dv-avatar", person[0]));
    const main = el("div", hairline ? "dv-activity-main" : "dv-row-main");
    if (hairline) {
      main.append(el("span", "dv-merchant", person[1]), amount(person[2]));
    } else {
      const copy = el("div", "dv-copy");
      copy.append(el("span", "dv-merchant", person[1]), el("span", "dv-sub", person[2]));
      main.append(copy, amount(person[3]));
    }
    if (!last) {
      main.append(createDivider({
        tone: hairline ? "tint" : "subtle",
        weight: hairline ? "hairline" : "regular",
      }));
    }
    row.append(main);
    return row;
  }

  function fillInset() {
    const root = mount("inset");

    const inset = el("div", "dv-panel dv-panel-inset");
    inset.append(el("span", "dv-kicker", "Inset · aligned to text"));
    const list = el("div", "dv-list");
    people.forEach((person, index) => {
      list.append(personRow(person, index === people.length - 1, false));
    });
    inset.append(list, el("p", "dv-note", "Inset = avatar 40 + gap 12 = 52 px from the content edge. No line under the last row."));

    const bleed = el("div", "dv-panel dv-panel-inset");
    bleed.append(el("span", "dv-kicker", "Full-bleed · between sections"));
    const receipt = el("div", "dv-bleed");
    const head = el("div", "dv-bleed-head");
    head.append(el("strong", "", "Order summary"), el("span", "", "3 items"));
    const body = el("div", "dv-bleed-body");
    const goods = el("div");
    goods.append(el("span", "", "Smart POS × 3"), amount("237.00"));
    const vat = el("div", "dv-muted");
    vat.append(el("span", "", "VAT 15%"), amount("35.55"));
    body.append(goods, vat);
    const total = el("div", "dv-total");
    total.append(el("span", "", "Total"), amount("272.55"));
    receipt.append(
      head,
      createDivider({ tone: "subtle" }),
      body,
      createDivider({ tone: "dashed", inset: "section" }),
      total,
    );
    bleed.append(receipt, el("p", "dv-note", "Solid line between sections; dashed only before a total, like a receipt."));

    const bad = el("div", "dv-panel dv-panel-inset");
    bad.append(el("span", "dv-kicker", "Don't · line + card + space"));
    const misuse = el("div", "dv-misuse");
    people.forEach((person) => {
      const row = el("div", "dv-misuse-row");
      row.append(el("span", "", person[1]), amount(person[3]));
      misuse.append(row);
    });
    bad.append(misuse, el("p", "dv-note", "Three ways of separating at once. Pick one: cards with gaps, or rows with lines."));
    bad.querySelector(".dv-note").dataset.tone = "danger";

    root.append(inset, bleed, bad);
  }

  function fillLabels() {
    const root = mount("labels");

    const labelled = el("div", "dv-panel dv-panel-copy");
    const stack = el("div", "dv-label-stack");
    labelled.append(stack);
    stack.append(
      el("span", "dv-kicker", "With label"),
      createDivider({ tone: "default", label: "or continue with" }),
      createDivider({ tone: "default", label: "Yesterday", labelStyle: "overline", align: "start" }),
      createDivider({ tone: "default", label: "12 new transactions", labelStyle: "chip" }),
      createDivider({ tone: "danger", label: "Unread from here" }),
    );

    const inline = el("div", "dv-panel dv-panel-copy");
    const facts = el("div", "dv-inline-stack");
    inline.append(facts);
    facts.append(el("span", "dv-kicker", "Inline · dot and vertical"));

    const place = el("div", "dv-facts");
    const meta = el("span", "dv-meta");
    meta.append(
      el("span", "", "12:41"),
      createDivider({ variant: "dot" }),
      el("span", "", "mada •• 3301"),
      createDivider({ variant: "dot" }),
      el("span", "", "Terminal 04"),
    );
    place.append(el("span", "dv-fact-title", "Al Baik · Olaya"), meta);

    const stats = el("div", "dv-stats");
    [
      ["Balance", "175,000"],
      ["Pending", "25,000"],
      ["Cards", "8"],
    ].forEach(([label, value], index) => {
      if (index) stats.append(createDivider({ variant: "vertical", tone: "default" }));
      const stat = el("span", "dv-stat");
      stat.append(el("span", "", label), el("b", "", value));
      stats.append(stat);
    });

    const tools = el("div", "dv-toolbar");
    tools.append(el("span", "dv-chip", "Filters"), createDivider({ variant: "vertical", tone: "control", size: "toolbar" }));
    const download = el("span", "dv-icon-btn");
    const glyph = icon("download", "inline");
    if (glyph) download.append(glyph);
    tools.append(download);

    facts.append(
      place,
      stats,
      tools,
      el("p", "dv-note", "Dot: 3 px, #9AACA6, 6 px gaps. Vertical line: 1 px, 60% of the row height, for stats and toolbar groups."),
    );
    root.append(labelled, inline);
  }

  function chevron(quiet) {
    const meta = el("span", "dv-setting-meta");
    if (quiet) meta.dataset.tone = "quiet";
    const mark = icon("next", "inline");
    if (mark) meta.append(mark);
    return meta;
  }

  function setting(label, meta, last) {
    const row = el("div", "dv-setting");
    row.append(el("span", "", label));
    if (typeof meta === "string") {
      const value = el("span", "dv-setting-meta");
      value.append(el("span", "", meta));
      const mark = icon("next", "inline");
      if (mark && meta !== "On") value.append(mark);
      row.append(value);
    } else {
      row.append(meta);
    }
    if (!last) row.append(createDivider({ tone: "tint", weight: "hairline" }));
    return row;
  }

  function fillMobile() {
    const root = mount("mobile");

    const settings = el("div", "dv-panel");
    settings.append(el("span", "dv-kicker", "Grouped list · settings"));
    const settingsPhone = el("div", "dv-phone");
    settingsPhone.append(el("span", "dv-group-label", "Security"));
    const security = el("div", "dv-group");
    security.append(
      setting("Face ID", "On", false),
      setting("Change password", chevron(true), false),
      setting("Trusted devices", "2", true),
    );
    settingsPhone.append(security, el("span", "dv-group-label", "Account"));
    const account = el("div", "dv-group");
    account.append(setting("Language", "English", true));
    settingsPhone.append(account);
    settings.append(settingsPhone, el("p", "dv-note", "0.5 pt hairline, inset 16 pt from the left, running to the right edge. 24 pt gap plus caption between groups."));

    const activity = el("div", "dv-panel");
    activity.append(el("span", "dv-kicker", "Activity · date separators"));
    const activityPhone = el("div", "dv-phone");
    days.forEach(([day, sum, rows]) => {
      const group = el("div", "dv-day");
      const head = el("div", "dv-day-head");
      head.append(el("strong", "", day), el("span", "dv-sum", sum));
      const card = el("div", "dv-activity");
      rows.forEach((row, index) => {
        card.append(personRow([row[0], row[1], row[2]], index === rows.length - 1, true));
      });
      group.append(head, card);
      activityPhone.append(group);
    });
    activity.append(activityPhone, el("p", "dv-note", "The date header is the separator between days. The total on the right gives the label a job."));

    const edge = el("div", "dv-panel");
    edge.append(el("span", "dv-kicker", "Scroll edge · sticky header"));
    const frame = el("div", "dv-scroll-frame");
    const sticky = el("div", "dv-sticky");
    const line = createDivider({ tone: "strong", weight: "hairline", visible: false });
    sticky.append(el("span", "", "Transactions"), line);
    const scroller = el("div", "dv-scroller");
    scroller.tabIndex = 0;
    scroller.setAttribute("aria-label", "Transactions");
    scrollItems.forEach((name, index) => {
      const row = el("div", "dv-scroll-row");
      const sign = index % 3 ? "− " : "+ ";
      row.append(el("span", "", name), amount(sign + (80 + index * 37.5).toFixed(2)));
      scroller.append(row);
    });
    frame.append(sticky, scroller);
    const note = el("p", "dv-note");
    note.append(document.createTextNode("Scroll the list: the header line shows only once content goes under it. Live: "));
    const state = el("span", "", "at top, no line");
    note.append(state, document.createTextNode("."));
    const threshold = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--space-1")) || 0;
    scroller.addEventListener("scroll", () => {
      const on = scroller.scrollTop > threshold;
      line.dataset.visible = on ? "true" : "false";
      state.textContent = on ? "line visible" : "at top, no line";
    });
    edge.append(frame, note);
    root.append(settings, activity, edge);
  }

  function fillSpacing() {
    const root = mount("spacing");
    const head = el("div", "dv-space dv-space-head");
    ["Between", "Web", "Mobile", "Scale"].forEach((label) => head.append(el("b", "", label)));
    root.append(head);
    spacing.forEach(([name, web, mobile, scale]) => {
      const row = el("div", "dv-space");
      row.append(el("span", "", name), el("b", "", web), el("b", "", mobile));
      const bar = el("span", "dv-scale");
      bar.dataset.scale = scale;
      row.append(bar);
      root.append(row);
    });
  }

  function fillArabic() {
    const root = mount("arabic");
    if (!root) return;
    const inset = el("div", "dv-panel dv-panel-inset");
    inset.dir = "rtl";
    inset.lang = "ar";
    inset.style.fontFamily = "var(--font-arabic)";
    inset.append(el("span", "dv-kicker", "صفوف مُزاحة"));
    const list = el("div", "dv-list");
    peopleAr.forEach((person, index) => {
      list.append(personRow(person, index === peopleAr.length - 1, false));
    });
    inset.append(list);

    const labelled = el("div", "dv-panel dv-panel-copy");
    labelled.dir = "rtl";
    labelled.lang = "ar";
    labelled.style.fontFamily = "var(--font-arabic)";
    const stack = el("div", "dv-label-stack");
    labelled.append(stack);
    stack.append(
      el("span", "dv-kicker", "مقسّمات بعنوان"),
      createDivider({ tone: "default", label: "أو تابع باستخدام" }),
      createDivider({ tone: "default", label: "أمس", labelStyle: "overline", align: "start" }),
      createDivider({ tone: "default", label: "12 عملية جديدة", labelStyle: "chip" }),
      createDivider({ tone: "danger", label: "غير مقروء من هنا" }),
    );
    root.append(inset, labelled);
  }

  function fillRules() {
    const root = mount("rules");
    rules.forEach(([yes, no], index) => {
      const card = el("div", "lst-rule");
      card.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
      [[true, yes], [false, no]].forEach(([ok, text]) => {
        const line = el("div", "lst-rule-line");
        line.dataset.ok = ok ? "true" : "false";
        line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
        card.append(line);
      });
      root.append(card);
    });
  }

  fillHierarchy();
  fillLines();
  fillInset();
  fillLabels();
  fillMobile();
  fillSpacing();
  fillArabic();
  fillRules();
})();
