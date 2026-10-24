(function () {
  const page = document.querySelector('[data-page="pagination"]');
  if (!page || !window.createPagination) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-pgz="${name}"]`);
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

  const which = [
    ["Numbered pages", "Tables on web. Users jump, compare and come back to page 7.", "Transactions, statements, users"],
    ["Load more", "Short feeds where totals matter less. Button at the end.", "Dashboard activity, comments"],
    ["Infinite scroll", "Mobile lists. Loads the next batch before the end.", "Mobile activity, notifications"],
    ["Previous / next", "Step through items one by one.", "Transaction detail, receipts"],
  ];

  const guide = mount("which");
  which.forEach(([title, body, use]) => {
    const card = el("div", "pgz-card");
    card.append(el("strong", "", title), el("p", "", body), el("span", "pgz-kicker", use));
    guide.append(card);
  });

  const table = mount("table");
  let pageNo = 5;
  function paintTable() {
    table.replaceChildren(createPagination({
      kind: "table",
      page: pageNo,
      pages: 25,
      total: 248,
      size: 10,
      onPage: (next) => { pageNo = next; paintTable(); },
    }));
  }
  paintTable();

  const states = mount("states");
  [
    ["Default", {}],
    ["Hover", { state: "hover" }],
    ["Current", { current: true }],
    ["Focus", { state: "focus" }],
    ["Disabled", { disabled: true }],
  ].forEach(([label, flags]) => {
    const card = el("div", "pgz-card");
    const button = el("button", "pgz-page", "5");
    button.type = "button";
    if (flags.current) button.setAttribute("aria-current", "page");
    if (flags.disabled) button.disabled = true;
    if (flags.state) button.dataset.state = flags.state;
    card.append(el("span", "pgz-kicker", label), button);
    states.append(card);
  });

  const narrow = el("div", "pgz-card");
  narrow.dataset.width = "narrow";
  narrow.append(createPagination({ kind: "table", page: 5, pages: 25, total: 248, size: 10 }));
  mount("responsive").append(narrow);

  mount("variants").append(
    createPagination({ kind: "step", page: 3, pages: 12 }),
    createPagination({ kind: "more", page: 1, pages: 8, total: 86, size: 10 }),
  );

  mount("dots").append(createPagination({ kind: "dots", page: 2, pages: 4 }));

  const ends = mount("ends");
  ["more", "start", "empty", "error"].forEach((kind) => ends.append(createListEnd({ kind })));

  const phones = mount("mobile");
  const phone = el("div", "pgz-card");
  phone.append(el("span", "pgz-kicker", "Infinite scroll"), createListSkeleton({ rows: 2 }), createListEnd({ kind: "more" }));
  phones.append(phone);

  const arabic = mount("arabic");
  const wrap = el("div", "pgz-card");
  wrap.dir = "rtl";
  wrap.lang = "ar";
  wrap.style.fontFamily = "var(--font-arabic)";
  wrap.append(
    createPagination({ kind: "table", page: 5, pages: 25, total: 248, size: 10, lang: "ar" }),
    createListEnd({ kind: "error", lang: "ar" }),
    createListEnd({ kind: "start", lang: "ar" }),
    createListEnd({ kind: "empty", lang: "ar" }),
  );
  arabic.append(wrap);

  pairs(mount("rules"), [
    ["Show the range and total: “41–50 of 248”. Keep the page in the URL so Back and shared links work.", "Use infinite scroll for web tables that people export or audit."],
    ["Reset to page 1 when filters or search change.", "Put pagination above and below the same table."],
    ["On mobile, prefetch before the end and show skeleton rows.", "Hide the arrows on the first or last page; disable them."],
    ["Keep the first visible row in view when rows per page changes.", "Lose scroll position when someone opens a row and comes back."],
  ]);
})();
