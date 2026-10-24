(function () {
  const page = document.querySelector('[data-page="icon-tiles"]');
  if (!page || !window.createIconTile) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-it="${name}"]`);
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
  const shortcuts = el("div", "it-grid");
  [
    ["cash", "Send money", "12 this week"],
    ["cards", "Cards", "4 active"],
    ["pos", "POS", "8 terminals"],
    ["payroll", "Team", "6 people"],
  ].forEach(([name, title, count]) => {
    shortcuts.append(createNavTile({ icon: name, title, count }));
  });
  live.append(shortcuts);

  const sizes = mount("sizes");
  [["inline", "Inline · 28"], ["default", "Default · 36"], ["nav", "Nav · 40"], ["feature", "Feature · 56"]].forEach(([size, label]) => {
    const card = el("div", "it-card");
    card.append(createIconTile({ icon: "cards", size }), el("span", "it-kicker", label));
    sizes.append(card);
  });

  const tones = mount("tones");
  const row = el("div", "it-row");
  [["brand", "Brand"], ["neutral", "Neutral"], ["info", "Info"], ["warning", "Warning"], ["error", "Error"]].forEach(([tone, label]) => {
    const card = el("div", "it-card");
    card.append(createIconTile({ icon: "cards", size: "default", tone: tone === "neutral" ? "" : tone }), el("span", "it-kicker", label));
    row.append(card);
  });
  tones.append(row);

  const mobile = mount("mobile");
  const phone = el("div", "it-card");
  const home = el("div", "it-grid");
  [
    ["cash", "Send money", "12 this week"],
    ["cards", "Cards", "4 active"],
    ["pos", "POS", "8 terminals"],
    ["payroll", "Team", "6 people"],
  ].forEach(([name, title, count]) => {
    home.append(createNavTile({ icon: name, title, count }));
  });
  phone.append(el("span", "it-kicker", "Home shortcuts"), home);
  mobile.append(phone);

  const arabic = mount("arabic");
  const wrap = el("div");
  wrap.dir = "rtl";
  wrap.lang = "ar";
  wrap.style.fontFamily = "var(--font-arabic)";
  wrap.append(createList({
    items: [
      createListItem({ title: "تحويل", subtitle: "آخر العمليات", leading: { icon: "send" } }),
      createListItem({ title: "البطاقات", subtitle: "4 نشطة", leading: { icon: "cards" } }),
    ],
  }));
  arabic.append(wrap);

  pairs(mount("rules"), [
    ["Use a tone only when the icon means a status (Info, Warning, Error).", "Colour tiles by category to make a list look lively."],
    ["One Lucide icon per tile, centred, at the matching icon size.", "Put text, numbers or two icons inside a tile."],
    ["Use Neutral or Brand for plain rows and shortcuts.", "Use Error tiles for anything that is not a problem."],
  ]);
})();
