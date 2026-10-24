(function () {
  const page = document.querySelector('[data-page="dropdown"]');
  if (!page || !window.createSelect) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-ddn="${name}"]`);
  }

  function pairs(host, items) {
    items.forEach(([yes, no], index) => {
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

  const banks = [
    ["SNB", "Saudi National Bank", "NCBKSAJE"],
    ["RJHI", "Al Rajhi Bank", "RJHISARI"],
    ["RIBL", "Riyad Bank", "RIBLSARI"],
    ["SABB", "Saudi Awwal Bank", "SABBSARI"],
  ];
  const branches = [
    ["Olaya", "4 POS"],
    ["Al Malqa", "2 POS"],
    ["Jeddah Corniche", "3 POS"],
    ["Khobar Mall", "1 POS"],
  ];

  const states = mount("states");
  [
    ["Select", createSelect({ kind: "select", label: "Transfer type", value: "Local", options: ["Local", "International", "Between accounts"].map((label) => ({ label, value: label })) })],
    ["Combobox", createSelect({ kind: "combobox", label: "Bank", placeholder: "Type the name or SWIFT", options: banks.map(([value, label, code]) => ({ value, label, code })) })],
    ["Multi-select", createSelect({ kind: "multi", label: "Branches", options: branches.map(([label, meta]) => ({ label, value: label, meta })), value: ["Olaya", "Al Malqa"], emptyLabel: "All branches", countLabel: (count, total) => `${count} of ${total} selected` })],
  ].forEach(([name, node]) => {
    const card = el("div", "ddn-card");
    card.append(el("span", "ddn-kicker", name), node);
    states.append(card);
  });

  const menus = mount("menus");
  menus.append(createSelect({
    kind: "combobox",
    label: "Bank",
    placeholder: "Type the name or SWIFT",
    options: banks.map(([value, label, code], index) => ({
      value,
      label,
      code,
      disabled: index === 3,
      reason: index === 3 ? "Not available on your plan" : undefined,
    })),
  }));

  mount("contacts").append(createSelect({
    kind: "select",
    label: "Contact method",
    value: "Email",
    options: [
      { label: "Email", value: "Email" },
      { label: "SMS", value: "SMS" },
      { label: "WhatsApp", value: "WhatsApp", disabled: true, reason: "Not available on your plan" },
    ],
  }));

  const arabic = mount("arabic");
  const wrap = el("div", "ddn-card");
  wrap.dir = "rtl";
  wrap.lang = "ar";
  wrap.style.fontFamily = "var(--font-arabic)";
  wrap.append(
    createSelect({ kind: "combobox", label: "البنك", placeholder: "اكتب الاسم أو رمز السويفت", options: banks.map(([value, label, code]) => ({ value, label, code })) }),
    el("p", "", "التقارير تشمل هذه الفروع"),
  );
  arabic.append(wrap);

  pairs(mount("rules"), [
    ["Use Select up to 8 options. Switch to Combobox with search for long lists like banks.", "Make people scroll a 30-item list with no search."],
    ["Say why an option is disabled: “Not available on your plan”.", "Grey out options with no reason, or hide them silently."],
    ["Show picked values as tags, with “2 of 5 selected” and Clear all in the menu.", "Join values into one cut-off line like “Olaya, Al Malqa, Jed…”."],
    ["Mirror the whole field in Arabic: chevron left, tags right to left, codes in mono.", "Keep the chevron on the right in RTL, or translate SWIFT codes."],
  ]);
})();
