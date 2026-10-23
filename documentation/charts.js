(function () {
  const page = document.querySelector('[data-page="charts"]');
  if (!page || !window.createChartCard) return;

  const BRANCHES = [
    { label: "Olaya, Riyadh", labelAr: "العليا، الرياض", amount: 412600, share: 100 },
    { label: "Tahlia, Jeddah", labelAr: "التحلية، جدة", amount: 286400, share: 69 },
    { label: "Corniche, Dammam", labelAr: "الكورنيش، الدمام", amount: 198200, share: 48 },
    { label: "King Fahd, Riyadh", labelAr: "الملك فهد، الرياض", amount: 154800, share: 38 },
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-ch="${name}"]`);
  }

  function block(label, node, tag) {
    const wrap = el("div", "dtd-block");
    const head = el("div", "dtd-block-head");
    head.append(el("span", "dtd-kicker", label));
    if (tag) head.append(el("span", "dtd-live", tag));
    wrap.append(head, node);
    return wrap;
  }

  function segment(label, options, current, onPick) {
    const group = el("div", "dtd-segment");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", label);
    function paint() {
      group.replaceChildren();
      options.forEach(([value, text]) => {
        const button = el("button", "dtd-seg", text);
        button.type = "button";
        button.setAttribute("role", "radio");
        button.setAttribute("aria-checked", value === current ? "true" : "false");
        button.addEventListener("click", () => {
          current = value;
          paint();
          onPick(value);
          group.querySelector('[aria-checked="true"]').focus();
        });
        group.append(button);
      });
    }
    paint();
    return group;
  }

  function specimen(name, when, where, how, node) {
    const card = el("div", "lst-spec");
    const copy = el("div", "lst-spec-copy");
    copy.append(el("h3", "", name));
    [["When", when], ["Where", where], ["How", how]].forEach(([key, value]) => {
      const line = el("p", "");
      line.append(el("strong", "", `${key} `), document.createTextNode(value));
      copy.append(line);
    });
    const stage = el("div", "lst-spec-stage dtd-stage");
    stage.append(node);
    card.append(copy, stage);
    return card;
  }

  function side(lang) {
    const ar = lang === "ar";
    const nav = el("nav", "chd-side");
    const brand = el("img", "chd-wordmark");
    brand.src = "../media/type=full, color=brand.svg";
    brand.alt = "Hala";
    nav.append(brand);
    [["dashboard", "Dashboard", "لوحة التحكم"], ["analytics", "Analytics", "التحليلات"], ["transactions", "Transactions", "العمليات"]].forEach(([id, en, arLabel], index) => {
      const item = el("a", "chd-nav", ar ? arLabel : en);
      item.href = "#";
      item.dataset.on = id === "analytics" || index === 1 ? "true" : "false";
      nav.append(item);
    });
    return nav;
  }

  function schemes(lang) {
    const box = el("section", "chd-panel");
    box.append(el("h3", "chd-h", lang === "ar" ? "المبيعات حسب الشبكة" : "Sales by card scheme"), createShareBar({ lang }));
    return box;
  }

  function branches(lang) {
    const box = el("section", "chd-panel");
    const head = el("div", "chd-panel-head");
    head.append(el("h3", "chd-h", lang === "ar" ? "أعلى الفروع" : "Top branches"));
    if (window.createButton) head.append(createButton({ label: lang === "ar" ? "عرض الكل" : "See all", variant: "ghost", size: "sm" }));
    box.append(head);
    BRANCHES.forEach((row) => box.append(createRankedRow({ ...row, lang })));
    return box;
  }

  function analytics(lang, empty) {
    const ar = lang === "ar";
    const root = el("div", "chd-app");
    root.lang = lang;
    root.dir = ar ? "rtl" : "ltr";
    const main = el("div", "chd-main");
    const pageEl = el("div", "chd-page");
    pageEl.append(
      !empty && lang !== "ar" && window.createSalesFilters
        ? createSalesFilters()
        : createChartCard({ platform: "web", state: empty ? "empty" : "default", lang }),
      schemes(lang),
      branches(lang),
    );
    if (window.createNavWebTopBar) main.append(createNavWebTopBar({ locale: lang }), pageEl);
    else main.append(pageEl);
    root.append(side(lang), main);
    return root;
  }

  function salesApp(lang, extras) {
    const wrap = el("div", "chd-app-sales");
    wrap.lang = lang;
    wrap.dir = lang === "ar" ? "rtl" : "ltr";
    const counts = [7, 12, 12, 12];
    let period = 0;
    const ranges = el("div", "chd-ranges");
    const host = el("div", "chd-sales-chart");
    function paintRanges() {
      ranges.replaceChildren();
      ["7D", "1M", "3M", "1Y"].forEach((label, index) => {
        const chip = window.createButton
          ? createButton({ label, variant: "secondary", size: "sm", role: "chip", selected: index === period })
          : el("button", "", label);
        chip.addEventListener("click", () => {
          period = index;
          paintRanges();
          paintChart();
        });
        ranges.append(chip);
      });
    }
    function paintChart() {
      host.replaceChildren(createChartCard({
        platform: "app",
        lang,
        count: counts[period],
        ...extras,
      }));
    }
    paintRanges();
    paintChart();
    wrap.append(ranges, host, schemes(lang), branches(lang));
    return wrap;
  }

  function phone(title, body, caption, lang) {
    const card = el("figure", "lst-phone-card");
    const screen = el("div", "lst-phone chd-phone");
    screen.lang = lang || "en";
    screen.dir = lang === "ar" ? "rtl" : "ltr";
    screen.append(el("div", "chd-status", "9:41"));
    const bar = el("div", "chd-phone-bar");
    bar.append(el("span", "chd-phone-title", title));
    screen.append(bar);
    const scroll = el("div", "lst-phone-scroll chd-scroll");
    scroll.append(body);
    screen.append(scroll);
    card.append(screen, el("figcaption", "lst-caption", caption));
    return card;
  }

  function fillWeb() {
    mount("web").append(
      block("Analytics · Chart card with a hovered bar, then Share bar and Ranked row.", analytics("en"), "Live · tap a bar"),
      block("The same page with no sales yet.", analytics("en", true)),
    );
  }

  function fillMobile() {
    mount("mobile").append(
      phone("Sales", salesApp("en"), "iOS · range switch, compact Chart card, schemes and branches", "en"),
      phone("Sales", salesApp("en", { selected: 6 }), "Tapped bar shows its value", "en"),
      phone("Sales", salesApp("en", { state: "empty" }), "Empty period", "en"),
    );
  }

  function fillComponents() {
    mount("components").append(
      specimen("Chart card", "Showing a total over time with its trend.", "Web: Analytics and dashboard pages (full width). App: Sales tab, under the range switch.", "Default or Empty. Web header is the existing Chart filter header; app shows the total, Trend and two Key stats. Digits stay LTR in Arabic.", createChartCard({ platform: "web" })),
      specimen("Bar chart", "Comparing a value across days, months or hours.", "Inside Chart card, or on its own in a card.", "7, 12 or 24 bars. Swap one to Selected for tap or hover. Latest period is on the left in Arabic.", createBarChart({ count: 7 })),
      specimen("Share bar", "Showing parts of a whole, like sales by card scheme.", "Under the chart card, or inside a card detail.", "Set each segment width; the last one fills. Max 5 segments; group the rest as Other.", createShareBar()),
      specimen("Ranked row", "Top-N lists such as top branches or merchants.", "Below the share bar, 3 to 5 rows plus See all.", "Leader bar = 100; others are their share of the leader. Amount is Riyal + mono. Reuses Progress bar.", createRankedRow({ label: "Olaya, Riyadh", amount: 412600, share: 100 })),
    );
  }

  function fillStates() {
    const host = mount("states");
    const bars = el("div", "chd-bar-states");
    ["default", "current", "selected", "muted"].forEach((state) => {
      const col = el("div", "chd-bar-cell");
      const chart = createBarChart({ values: [0.4, 0.55, 0.92], labels: ["A", "B", "C"], selected: state === "selected" ? 2 : undefined });
      if (state === "muted") {
        [...chart.querySelectorAll(".ch-bar")].forEach((bar, index) => {
          bar.dataset.state = index === 2 ? "current" : "muted";
        });
      }
      col.append(chart, el("span", "lst-kicker", state));
      bars.append(col);
    });
    host.append(block("_Bar · Default / Current / Selected / Muted", bars, "Live · tap"));

    const counts = el("div", "dtd-stack");
    const frame = el("div", "chd-count");
    function paint(count) {
      frame.replaceChildren(createBarChart({ count: Number(count), lang: "en" }), createBarChart({ count: Number(count), lang: "ar" }));
    }
    paint(7);
    counts.append(segment("Count", [["7", "7 days"], ["12", "12 months"], ["24", "24 hours"]], "7", paint), frame);
    host.append(block("Bar chart · 7 / 12 / 24 · LTR + RTL", counts, "Live · count"));

    const cards = el("div", "chd-grid");
    cards.append(
      createChartCard({ platform: "web" }),
      createChartCard({ platform: "web", state: "empty" }),
      createChartCard({ platform: "app" }),
      createChartCard({ platform: "app", state: "empty" }),
    );
    host.append(block("Chart card · Web / App · Default / Empty", cards));

    const pair = el("div", "chd-row");
    pair.append(createShareBar({ lang: "en" }), createShareBar({ lang: "ar" }));
    host.append(block("Share bar · LTR + RTL", pair));

    const ranks = el("div", "chd-col");
    ranks.append(createRankedRow({ lang: "en" }), createRankedRow({ lang: "ar", labelAr: "العليا، الرياض" }));
    host.append(block("Ranked row · LTR + RTL — Progress bar reused", ranks));
  }

  function fillArabic() {
    mount("arabic").append(
      block("Arabic · latest period on the left; amounts stay LTR.", analytics("ar"), "Live"),
      phone("المبيعات", salesApp("ar"), "App · Arabic", "ar"),
    );
  }

  function fillResponsive() {
    const host = mount("responsive");
    const stack = el("div", "dtd-stack");
    const frame = el("div", "dtd-frame chd-frame");
    function paint(width) {
      frame.dataset.width = width;
      if (width === "desktop") frame.replaceChildren(analytics("en"));
      else if (width === "tablet") frame.replaceChildren(salesApp("en"));
      else frame.replaceChildren(salesApp("en"));
    }
    paint("desktop");
    stack.append(
      segment("Breakpoint", [["desktop", "Web"], ["tablet", "iPad app · 760"], ["mobile", "Phone app · 390"]], "desktop", paint),
      frame,
    );
    host.append(block("Web uses the Chart card with the filter header; iPad and phone use the compact card under a range switch.", stack, "Live · width"));
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "ChartCard, BarChart, ShareBar, RankedRow", "Chart card sits in App shell Content · hover or click a bar for the value · header is the existing Chart filter (period, compare, series) · amounts use createAmount so digits never mirror"],
      ["iOS", "Same names", "Compact Chart card under a range switch · tap a bar for its value, tap outside to clear · VoiceOver reads “Thursday, 226,500 Saudi riyals” · 44 pt targets · Honour accessibilityReduceMotion"],
      ["Android", "Same names", "Same hierarchy · 48 dp targets · contentDescription on each bar and Share segment · amounts set layoutDirection Ltr · Honour the animator duration scale"],
    ].forEach(([platform, api, notes]) => {
      const line = el("div", "lst-platform");
      line.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(line);
    });
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Start bars at zero and keep one colour for past periods; highlight only the latest or tapped bar.", "Cut the axis or colour every bar differently — it exaggerates small changes."],
      ["Group small shares into Other and keep segments to five or fewer.", "Show ten thin segments nobody can read or tap."],
      ["Show the value on hover or tap in Riyal and mono, and the same total in the header.", "Make people estimate values from bar height alone."],
    ].forEach(([yes, no], index) => {
      const card = el("div", "lst-rule");
      card.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
      [[true, yes], [false, no]].forEach(([ok, text]) => {
        const line = el("div", "lst-rule-line");
        line.dataset.ok = ok ? "true" : "false";
        line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
        card.append(line);
      });
      host.append(card);
    });
  }

  fillWeb();
  fillMobile();
  fillComponents();
  fillStates();
  fillArabic();
  fillResponsive();
  fillPlatforms();
  fillRules();
})();
