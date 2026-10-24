(function () {
  const page = document.querySelector('[data-page="avatars"]');
  if (!page || !window.createAvatar) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-av="${name}"]`);
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

  const people = [
    ["AB", 1, "Al Baik · Olaya", "Today, 12:41", 86.25, "in"],
    ["JB", 2, "Jarir Bookstore", "Today, 11:08", -1249, "out"],
    ["NT", 3, "Nour Trading", "Today, 09:30", -25000, "out"],
  ];

  const live = mount("live");
  const list = createList({
    items: people.map(([initials, tone, title, subtitle, amount, flow]) => createListItem({
      title,
      subtitle,
      leading: { initials, tone },
      side: createAmount(amount, { signed: true, kind: flow === "in" ? "credit" : "plain", size: "s" }),
      trailing: "none",
    })),
  });
  live.append(list);

  const sizes = mount("sizes");
  [["xs", "XS · 24"], ["s", "S · 32"], ["m", "M · 38"], ["l", "L · 56"], ["xl", "XL · 64"]].forEach(([size, label]) => {
    const card = el("div", "av-card");
    card.append(createAvatar({ initials: "AA", tone: 4, size }), el("span", "av-kicker", label));
    sizes.append(card);
  });

  const strip = mount("strip");
  const row = el("div", "av-row");
  [["+", 5, "New"], ["AB", 1, "Al Baik"], ["NT", 3, "Nour"], ["JB", 2, "Jarir"]].forEach(([initials, tone, label], index) => {
    const item = el("button", "av-card");
    item.type = "button";
    if (index === 1) item.dataset.selected = "true";
    item.append(createAvatar({ initials, tone, size: "l" }), el("span", "", label));
    row.append(item);
  });
  strip.append(row);

  const mobile = mount("mobile");
  const phone = el("div", "av-card");
  phone.append(el("span", "av-kicker", "Activity · phone"), createList({
    items: people.map(([initials, tone, title, subtitle, amount, flow]) => createListItem({
      title,
      subtitle,
      leading: { initials, tone },
      side: createAmount(amount, { signed: true, kind: flow === "in" ? "credit" : "plain", size: "s" }),
      trailing: "none",
    })),
  }));
  mobile.append(phone);

  const arabic = mount("arabic");
  const wrap = el("div");
  wrap.dir = "rtl";
  wrap.lang = "ar";
  wrap.style.fontFamily = "var(--font-arabic)";
  wrap.append(createList({
    items: [
      createListItem({ title: "البيك · العليا", subtitle: "اليوم، 12:41", leading: { initials: "ب", tone: 1 }, side: createAmount(86.25, { signed: true, kind: "credit", size: "s" }), trailing: "none" }),
      createListItem({ title: "جرير", subtitle: "اليوم، 11:08", leading: { initials: "ج", tone: 2 }, side: createAmount(-1249, { signed: true, size: "s" }), trailing: "none" }),
    ],
  }));
  arabic.append(wrap);

  pairs(mount("rules"), [
    ["Keep one avatar tint per person or company across every screen.", "Use avatar tints to signal status — that is the Status badge’s job."],
    ["Use initials from the name the user sees (two letters, Latin or Arabic).", "Mix photos and initials in the same list without a reason."],
    ["Give the recipient strip a 44/48 tap area and one selected item.", "Select several recipients in the strip; use a list with checkboxes instead."],
  ]);
})();
