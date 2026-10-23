(function () {
  const page = document.querySelector('[data-page="payment-cards"]');
  if (!page || !window.createPaymentCard) return;

  const PRODUCTS = Object.keys(window.PAYMENT_CARD_PRODUCTS);
  const WALLET = [
    { product: "purchase", title: "Purchase card", owner: "Operations", last4: "3399", state: "active", spent: 12000, limit: 20000 },
    { product: "expense", title: "Expense card", owner: "Frozen", last4: "7710", state: "frozen", spent: 4200, limit: 10000 },
    { product: "hurr-sadu", title: "Hurr Business", owner: "Faisal A.", last4: "7710", state: "active", spent: 18000, limit: 20000 },
  ];
  const DESIGNS = [
    { product: "hurr-sadu", title: "Sadu · Bedouin weave", subtitle: "السدو — نجد" },
    { product: "hurr-najdi", title: "Najdi parapet · Diriyah", subtitle: "الدرعية" },
    { product: "hurr-nafud", title: "Nafud dunes · Empty Quarter", subtitle: "الربع الخالي" },
    { product: "hurr-asiri", title: "Al-Qatt Al-Asiri · Asir", subtitle: "القط العسيري" },
  ];
  const OFFER = {
    product: "platinum",
    name: "Platinum Purchase Card",
    type: "Physical · pre-printed",
    facts: [["Delivery", "3 business days"], ["Delivery fee", "Free"]],
    reference: "042917001824",
    fees: [
      { label: "Issuance fee", amount: 100 },
      { label: "VAT (15%)", amount: 15 },
      { label: "Launch offer", amount: -115, tone: "success" },
    ],
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-pc="${name}"]`);
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

  function actionRow(iconName, title, subtitle, onClick) {
    return createListItem({ title, subtitle, leading: { icon: iconName }, onClick: onClick || (() => {}) });
  }

  function cardsPage(lang = "en") {
    const ar = lang === "ar";
    const root = el("div", "pcd-web");
    root.dir = ar ? "rtl" : "ltr";
    root.lang = lang;
    const wallet = WALLET.map((card) => ({ ...card }));
    let current = 0;

    const main = el("div", "pcd-main");
    const head = el("div", "pcd-head");
    head.append(el("h3", "pcd-title", ar ? "البطاقات" : "Cards"), el("p", "pcd-sub", ar ? "بطاقات الشركة وحدودها وحالتها." : "Company cards, their limits and status."));
    const grid = el("div", "pcd-grid");
    const list = el("div", "pcd-list");
    main.append(head, grid, list);

    const panel = el("aside", "pcd-panel");
    panel.setAttribute("aria-label", ar ? "تفاصيل البطاقة" : "Card details");

    const names = {
      purchase: ar ? "بطاقة المشتريات" : "Purchase card",
      expense: ar ? "بطاقة المصاريف" : "Expense card",
      "hurr-sadu": ar ? "حُر للأعمال" : "Hurr Business",
    };
    const owner = (card) => (card.state === "frozen" ? (ar ? "مجمّدة" : "Frozen") : ar && card.owner === "Operations" ? "العمليات" : ar && card.owner === "Faisal A." ? "فيصل أ." : card.owner);

    function paint(focusKey) {
      grid.replaceChildren(...[
        { product: "purchase", state: wallet[0].state, last4: "3399" },
        { product: "expense", state: wallet[1].state, last4: "7710" },
        { product: "corporate", state: "inactive", last4: "1024" },
      ].map((spec) => createPaymentCard({ ...spec, size: "medium", lang })));

      list.replaceChildren(...wallet.map((card, index) => {
        const row = createListItem({
          title: names[card.product],
          subtitle: `${owner(card)} · •••• ${card.last4}`,
          leadingNode: createCardMini({ product: card.product, size: "s" }),
          selected: index === current,
          key: `card-${index}`,
          onClick: () => { current = index; paint(`card-${index}`); },
        });
        row.dataset.key = `card-${index}`;
        return row;
      }));

      const card = wallet[current];
      const frozen = card.state === "frozen";
      panel.replaceChildren(
        createPaymentCard({ product: card.product, state: card.state, last4: card.last4, lang }),
        createSpendMeter({ spent: card.spent, limit: card.limit, status: frozen ? "frozen" : undefined, lang }),
        actionRow(frozen ? "lock" : "freeze", frozen ? (ar ? "إلغاء التجميد" : "Unfreeze card") : (ar ? "تجميد البطاقة" : "Freeze card"), frozen ? (ar ? "استئناف الإنفاق" : "Resume spending") : (ar ? "إيقاف كل الإنفاق فوراً" : "Stop all spending instantly"), () => {
          card.state = frozen ? "active" : "frozen";
          paint("freeze");
        }),
        actionRow("settings", ar ? "إعدادات البطاقة" : "Card settings", ar ? "الحدود والرقم السري والتجميد" : "Limits, PIN and freeze"),
      );
      panel.querySelectorAll(".list-item")[0].dataset.key = "freeze";
      if (focusKey) {
        const target = root.querySelector(`[data-key="${focusKey}"]`);
        if (target) target.focus();
      }
    }

    paint();
    root.append(main, panel);
    return root;
  }

  function phone(title, body, caption, footer) {
    const card = el("figure", "lst-phone-card");
    const screen = el("div", "lst-phone");
    const bar = el("div", "lst-phone-bar");
    bar.append(el("span", "lst-phone-large", title));
    const scroll = el("div", "lst-phone-scroll pcd-phone");
    scroll.append(...[].concat(body));
    screen.append(bar, scroll);
    if (footer) {
      const foot = el("div", "pcd-phone-foot");
      foot.append(footer);
      screen.append(foot);
    }
    card.append(screen, el("figcaption", "lst-caption", caption));
    return card;
  }

  function wide(label, variant) {
    const button = createButton({ label, variant: variant || "primary", size: "lg" });
    button.classList.add("pcd-wide");
    return button;
  }

  function fillWeb() {
    mount("web").append(block("Cards page · grid, rows and the detail side panel", cardsPage(), "Live · pick a row, Freeze card"));
  }

  function fillMobile() {
    const host = mount("mobile");
    const carousel = createCardCarousel({ cards: WALLET.map(({ product, last4, state }) => ({ product, last4, state })) });
    const actions = el("div", "pcd-actions");
    actions.append(
      actionRow("freeze", "Freeze card", "Stop all spending instantly"),
      actionRow("cards", "Card details", "Number, expiry and CVV"),
    );

    const preview = el("div", "pcd-preview");
    let pick = DESIGNS[0].product;
    const big = () => createPaymentCard({ product: pick, last4: "7710" });
    let face = big();
    preview.append(face);
    const options = createDesignOptions({
      options: DESIGNS,
      selected: pick,
      onChange: (option) => {
        pick = option.product;
        const next = big();
        face.replaceWith(next);
        face = next;
      },
    });

    const review = [
      createStepper({ steps: ["Card", "Design", "Review"], current: 3, label: "Card request steps" }),
      createCardOfferSummary(OFFER),
      createChoice({ kind: "checkbox", label: "I agree to the card terms and fees." }),
    ];
    const agree = review[2];
    const confirm = wide("Confirm request");
    confirm.disabled = true;
    agree.addEventListener("click", () => {
      const on = agree.dataset.checked !== "true";
      agree.dataset.checked = on ? "true" : "false";
      agree.setAttribute("aria-checked", on ? "true" : "false");
      const box = agree.querySelector(".choice-box");
      box.replaceChildren();
      if (on && window.drawChoiceIcon) box.append(drawChoiceIcon("confirm"));
      confirm.disabled = !on;
    });

    host.append(
      phone("Cards", [carousel, createSpendMeter({ spent: 12000, limit: 20000 }), actions], "iOS · Card carousel with dots, Spend meter and actions"),
      phone("Choose a design", [preview, options], "Android · Design option list, live preview", wide("Use this design")),
      phone("Review request", review, "iOS · Stepper, Card offer summary and the terms checkbox", confirm),
    );
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

  function minis() {
    const row = el("div", "dtd-row");
    ["s", "m", "l"].forEach((size) => row.append(createCardMini({ product: "purchase", size })));
    return row;
  }

  function fillComponents() {
    mount("components").append(
      specimen("Payment card", "Showing one company card with its real artwork and status.", "Card detail, the cards grid on web, the carousel on mobile.", "Pick Product, Size (Full 336 or Medium 264) and State. Only the last four digits change. Frozen, Not activated and Expired add the frosted badge; Placeholder is the Add a card button.", createPaymentCard({ product: "purchase", state: "active", ribbon: "Virtual" })),
      specimen("Card mini", "A card in a row, picker or summary where space is under 120.", "List rows (S), Design option and Card offer summary (M), empty states (L).", "Artwork only: no number, label or badge. Pair it with a title that names the card.", minis()),
      specimen("Card carousel", "More than one card on mobile.", "Top of the Cards tab on iOS and Android.", "Carousel shows one card with neighbours peeking; Fanned stacks them. Dots follow reading direction and are buttons with names.", createCardCarousel({ cards: WALLET.map(({ product, last4, state }) => ({ product, last4, state })) })),
      specimen("Design option", "Choosing a card design before ordering.", "Choose a design step on mobile and in the web order panel.", "A radio row with Card mini M, title and subtitle. One option is always selected.", createDesignOptions({ options: DESIGNS.slice(0, 2), selected: DESIGNS[0].product })),
      specimen("Card offer summary", "The last step before ordering a card.", "Review request on mobile, order side panel on web.", "Card mini, facts, reference number in mono, fee lines and a Total. Discounts use the success text colour with a minus sign.", createCardOfferSummary(OFFER)),
    );
  }

  function stateCell(name, node) {
    const cell = el("div", "dtd-state pcd-state");
    cell.append(node, el("span", "lst-kicker", name));
    return cell;
  }

  function grid(cols) {
    const node = el("div", "pcd-specimens");
    if (cols) node.dataset.cols = String(cols);
    return node;
  }

  function fillStates() {
    const host = mount("states");
    const products = grid();
    PRODUCTS.forEach((product) => products.append(stateCell(window.PAYMENT_CARD_PRODUCTS[product].name, createPaymentCard({ product, size: "medium" }))));
    host.append(block("Product · all 10 at Medium", products));

    const states = grid();
    [["active", "Active"], ["frozen", "Frozen"], ["inactive", "Not activated"], ["expired", "Expired"], ["placeholder", "Placeholder"]].forEach(([state, name]) => {
      states.append(stateCell(name, createPaymentCard({ product: "purchase", state })));
    });
    states.append(stateCell("Show ribbon · Virtual", createPaymentCard({ product: "expense", ribbon: "Virtual" })));
    host.append(block("Payment card · State and ribbon at Full", states));

    const sizes = el("div", "pcd-sizes");
    sizes.append(stateCell("Full · 336", createPaymentCard({ product: "cash", size: "full" })), stateCell("Medium · 264", createPaymentCard({ product: "cash", size: "medium" })));
    ["l", "m", "s"].forEach((size) => sizes.append(stateCell(`Mini ${size.toUpperCase()}`, createCardMini({ product: "cash", size }))));
    host.append(block("Size · Full, Medium and Card mini L, M, S", sizes));

    const options = grid(2);
    [["en", "default"], ["en", "selected"], ["ar", "default"], ["ar", "selected"]].forEach(([lang, state]) => {
      const spec = DESIGNS[0];
      options.append(stateCell(`${state === "selected" ? "Selected" : "Default"} · ${lang === "ar" ? "RTL" : "LTR"}`, createDesignOption({ ...spec, titleAr: "السدو", subtitleAr: "نسيج بدوي", state, lang })));
    });
    host.append(block("Design option · Default and Selected", options));

    const carousels = grid(2);
    const cards = WALLET.map(({ product, last4, state }) => ({ product, last4, state }));
    carousels.append(stateCell("Carousel", createCardCarousel({ cards })), stateCell("Fanned · tap to cycle", createCardCarousel({ cards, style: "fanned" })));
    host.append(block("Card carousel · Style", carousels, "Live"));
  }

  function fillArabic() {
    const host = mount("arabic");
    host.append(block("Arabic · the page mirrors, the card does not", cardsPage("ar"), "Live"));
    const row = grid();
    [["purchase", "active"], ["expense", "frozen"], ["corporate", "inactive"]].forEach(([product, state]) => {
      row.append(createPaymentCard({ product, state, size: "medium", lang: "ar" }));
    });
    row.dir = "rtl";
    host.append(block("Badges in Arabic · Frozen and Not activated", row));
  }

  function fillResponsive() {
    const host = mount("responsive");
    const stack = el("div", "dtd-stack");
    const frame = el("div", "dtd-frame pcd-frame");
    frame.dataset.width = "desktop";
    const cards = el("div", "pcd-grid");
    ["purchase", "expense", "corporate", "cash", "platinum", "sdb"].forEach((product) => cards.append(createPaymentCard({ product, size: "medium" })));
    frame.append(cards);
    stack.append(
      segment("Breakpoint", [["desktop", "Desktop"], ["tablet", "Tablet · 760"], ["mobile", "Mobile · 390"]], "desktop", (value) => { frame.dataset.width = value; }),
      frame,
    );
    host.append(block("Breakpoint · 3 cards per row on Desktop, 2 on Tablet, 1 on Mobile", stack, "Live · width"));
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "Payment card, Card mini, Card carousel, Design option, Card offer summary", "Artwork is an image; label, last four and scheme are live text · the card is role img with \"Purchase card, Visa ending 3399, Frozen\" · Design option is a radiogroup with arrow keys · Placeholder is a button · the card stays left to right inside an RTL page"],
      ["iOS", "Same names · PaymentCard, CardMini, TabView(.page) carousel, Picker rows", "VoiceOver reads the card as one element · the carousel pages with system paging and .spring(duration: 0.32, bounce: 0.2) dots · Frozen uses .ultraThinMaterial under the badge · targets 44 pt"],
      ["Android", "Same names · PaymentCard, CardMini, HorizontalPager, RadioButton rows", "contentDescription on the card · pager snaps with Material 3 emphasized easing and honours the animator duration scale · ripple on Design option and Placeholder · targets 48 dp"],
    ].forEach(([platform, api, notes]) => {
      const line = el("div", "lst-platform");
      line.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(line);
    });
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Keep the chassis identical in Arabic — only the page around the card mirrors.", "Flip the card, move the logo to the left or put the number on the right for RTL."],
      ["Show Frozen, Not activated and Expired with the frosted badge over the real artwork.", "Hide a frozen card or grey it out with no label — people must see which card is affected."],
      ["Edit the last four digits only; use Card mini when space is under 120.", "Scale a full card down into a list row or type a full card number."],
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
