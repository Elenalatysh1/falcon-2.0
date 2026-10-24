(function () {
  const page = document.querySelector('[data-page="amounts"]');
  if (!page || !window.createAmount) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-am="${name}"]`);
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

  const live = mount("live");
  const kpi = el("div", "am-card");
  kpi.append(el("span", "am-kicker", "POS sales · 30 days"), createAmount(184320, { size: "l" }));
  if (window.createBadge) kpi.append(createBadge({ variant: "trend", tone: "up", icon: true, label: "12.4%" }));
  live.append(kpi, createList({
    items: [
      createListItem({ title: "Al Baik · Olaya", leading: { initials: "AB", tone: 1 }, side: createAmount(86.25, { signed: true, kind: "credit", size: "s" }), trailing: "none" }),
      createListItem({ title: "Jarir Bookstore", leading: { initials: "JB", tone: 2 }, side: createAmount(-1249, { signed: true, size: "s" }), trailing: "none" }),
    ],
  }));

  const sizes = mount("sizes");
  [["xs", "Caption · 13"], ["s", "Medium · 15"], ["m", "Drawer · 28"], ["l", "Large · 32"], ["xl", "Transfer · 38"]].forEach(([size, label]) => {
    const card = el("div", "am-card");
    card.append(el("span", "am-kicker", label), createAmount(25000, { size }));
    sizes.append(card);
  });

  const states = mount("states");
  const row = el("div", "am-row");
  [
    ["Credit", createAmount(86.25, { signed: true, kind: "credit", size: "m" })],
    ["Debit", createAmount(-1249, { signed: true, size: "m" })],
    ["Muted", createAmount(184320, { kind: "muted", size: "m" })],
    ["Masked", createAmount(184320, { masked: true, size: "m" })],
  ].forEach(([name, node]) => {
    const card = el("div", "am-card");
    card.append(el("span", "am-kicker", name), node);
    row.append(card);
  });
  states.append(row);

  const mobile = mount("mobile");
  const phone = el("div", "am-card");
  phone.append(el("span", "am-kicker", "POS sales · 30 days"), createAmount(184320, { size: "l" }));
  if (window.createBadge) phone.append(createBadge({ variant: "trend", tone: "up", icon: true, label: "12.4%" }));
  phone.append(createList({
    items: [
      createListItem({ title: "Al Baik · Olaya", leading: { initials: "AB", tone: 1 }, side: createAmount(86.25, { signed: true, kind: "credit", size: "s" }), trailing: "none" }),
      createListItem({ title: "Jarir Bookstore", leading: { initials: "JB", tone: 2 }, side: createAmount(-1249, { signed: true, size: "s" }), trailing: "none" }),
    ],
  }));
  mobile.append(phone);

  const arabic = mount("arabic");
  const wrap = el("div", "am-card");
  wrap.dir = "rtl";
  wrap.lang = "ar";
  wrap.style.fontFamily = "var(--font-arabic)";
  wrap.append(el("span", "am-kicker", "آخر العمليات"), createAmount(-25000, { signed: true, size: "l" }));
  arabic.append(wrap);

  pairs(mount("rules"), [
    ["Use Amount text for every amount: Riyal sign + mono digits.", "Type “SAR” or an amount by hand in a text layer."],
    ["Right-align amounts in rows and tables, in both directions.", "Flip the sign to the right of the number in Arabic."],
    ["Hide every amount at once with Masked when the balance is hidden.", "Hide the balance but leave the trend or card balances visible."],
  ]);
})();
