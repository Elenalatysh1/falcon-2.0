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
    ["Show the time zone once on the page: “Riyadh time (GMT+3)”.", "Use minute steps of 1 when 5 or 30 is enough."],
    ["Let people type the time as well as pick it, and offer quick picks (Now, 9:00 AM) first.", "Mix 12-hour and 24-hour on one screen, or hide AM/PM in 12-hour."],
    ["Mark times that change the outcome: “Next day” after the cut-off, “+1” past midnight.", "Accept a closing time before the opening time; validate the range."],
    ["Use Hala Mono for times so digits align in lists and columns.", "Use a time picker for a duration; use a number field with units."],
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
  mount("which").append(card);

  const arabic = mount("arabic");
  if (arabic) {
    const wrap = el("div", "tp-ar");
    wrap.dir = "rtl";
    wrap.lang = "ar";
    wrap.style.fontFamily = "var(--font-arabic)";
    wrap.append(el("p", "", "تصل الرواتب في نفس اليوم."), el("p", "", "كل الأوقات بتوقيت الرياض (GMT+3). الأوقات بعد منتصف الليل تظهر \"+1\"."));
    arabic.append(wrap);
  }

  rules.forEach(([yes, no], index) => {
    const rule = el("div", "lst-rule");
    rule.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
    [[true, yes], [false, no]].forEach(([ok, text]) => {
      const line = el("div", "lst-rule-line");
      line.dataset.ok = ok ? "true" : "false";
      line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
      rule.append(line);
    });
    mount("rules").append(rule);
  });
})();
