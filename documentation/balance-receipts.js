(function () {
  const page = document.querySelector('[data-page="balance-receipts"]');
  if (!page || !window.createBalanceHero) return;

  const BALANCE = 45000;
  const RECEIVED = 2530;
  const IBAN = "SA57 3010 •••• 1951";
  const ACTIVITY = [
    { merchant: "Al Baik · Olaya", merchantAr: "البيك · العليا", detail: "12:41 · mada •• 3301", detailAr: "12:41 · مدى •• 3301", amount: 820.5, flow: "out", status: "Pending", statusAr: "معلّق", tone: 1, initials: "AS" },
    { merchant: "Al Baik · Olaya", merchantAr: "البيك · العليا", detail: "12:41 · mada •• 3301", detailAr: "12:41 · مدى •• 3301", amount: 1240, flow: "in", status: "Settled", statusAr: "مُسدَّد", tone: 1, initials: "AS" },
    { merchant: "Al Baik · Olaya", merchantAr: "البيك · العليا", detail: "12:41 · mada •• 3301", detailAr: "12:41 · مدى •• 3301", amount: 820.5, flow: "out", status: "Pending", statusAr: "معلّق", tone: 1, initials: "AS" },
  ];
  const TONE = { Pending: "pending", Settled: "settled" };
  const RECEIPT = {
    en: { amount: 1250, recipient: "Mohammed Alotaibi", bank: "Al Rajhi Bank", iban: "SA03 8000 •••• 4519", date: "19 Oct 2026, 12:41", reference: "TRX-4471-0938", fee: 0 },
    ar: { amount: 1250, recipient: "محمد العتيبي", bank: "مصرف الراجحي", iban: "SA03 8000 •••• 4519", date: "19 أكتوبر 2026، 12:41", reference: "TRX-4471-0938", fee: 0 },
  };
  const T = {
    en: {
      recent: "Recent activity",
      dashboard: "Dashboard",
      print: "Transfer receipt",
      printSub: "Hala Payments · Riyadh, Saudi Arabia",
      printNote: "Generated 19 Oct 2026, 12:42. Keep this receipt for your records. For help, contact Hala support in the app.",
      home: "Home",
      review: "Review transfer",
      sent: "Transfer sent",
      back: "Back",
      share: "Share",
      cards: "Cards",
      payments: "Payments",
      inbox: "Inbox",
      drawer: "Al Baik · Olaya",
      problem: "Report a problem",
      download: "Download receipt",
    },
    ar: {
      recent: "آخر العمليات",
      dashboard: "لوحة التحكم",
      print: "إيصال التحويل",
      printSub: "هلا للمدفوعات · الرياض، المملكة العربية السعودية",
      printNote: "أُنشئ في 19 أكتوبر 2026، 12:42. احتفظ بهذا الإيصال لسجلاتك. للمساعدة، تواصل مع دعم هلا في التطبيق.",
      home: "الرئيسية",
      review: "مراجعة التحويل",
      sent: "تم التحويل",
      back: "رجوع",
      share: "مشاركة",
      cards: "البطاقات",
      payments: "المدفوعات",
      inbox: "الوارد",
      drawer: "البيك · العليا",
      problem: "الإبلاغ عن مشكلة",
      download: "تنزيل الإيصال",
    },
  };
  const NAV = [
    ["dashboard", "Dashboard", "لوحة التحكم"],
    ["transactions", "Transactions", "العمليات"],
    ["transfers", "Transfers", "التحويلات"],
    ["payroll", "Payroll", "الرواتب"],
    ["cards", "Cards", "البطاقات"],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-br="${name}"]`);
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

  function activity(lang, options = {}) {
    const ar = lang === "ar";
    return createList({
      label: T[ar ? "ar" : "en"].recent,
      items: ACTIVITY.map((row) => createTransactionRow({
        merchant: ar ? row.merchantAr : row.merchant,
        detail: ar ? row.detailAr : row.detail,
        initials: row.initials,
        tone: row.tone,
        amount: row.amount,
        flow: row.flow,
        status: { label: ar ? row.statusAr : row.status, tone: TONE[row.status] },
        onClick: options.onPick ? () => options.onPick(row) : undefined,
      })),
    });
  }

  function receipt(state, lang, extras) {
    const card = createReceiptCard({
      state,
      lang,
      ...RECEIPT[lang === "ar" ? "ar" : "en"],
      onConfirm: (root) => root.setState("success"),
      ...extras,
    });
    return card;
  }

  function side(lang) {
    const ar = lang === "ar";
    const nav = el("nav", "brd-side");
    nav.setAttribute("aria-label", ar ? "هلا للأعمال" : "Hala Business");
    const brand = el("img", "brd-wordmark");
    brand.src = "../media/type=full, color=brand.svg";
    brand.alt = "Hala";
    nav.append(brand);
    NAV.forEach(([id, en, arLabel], index) => {
      const item = el("a", "brd-nav-item", ar ? arLabel : en);
      item.href = "#";
      item.dataset.on = index === 0 ? "true" : "false";
      if (id === "transactions") item.append(el("span", "brd-count", "4"));
      nav.append(item);
    });
    return nav;
  }

  function dashboard(lang, options = {}) {
    const ar = lang === "ar";
    const t = T[ar ? "ar" : "en"];
    const root = el("div", "brd-app");
    root.lang = lang;
    root.dir = ar ? "rtl" : "ltr";
    const main = el("div", "brd-main");
    const pageEl = el("div", "brd-page");
    const header = createBalanceHeader({
      balance: BALANCE,
      trend: 8.1,
      lang,
      remember: options.remember,
      masked: options.masked,
    });
    const card = el("section", "brd-activity");
    card.append(el("h3", "brd-section", t.recent), activity(lang, options));
    pageEl.append(header, card);
    if (window.createNavWebTopBar) main.append(createNavWebTopBar({ locale: lang }), pageEl);
    else main.append(pageEl);
    root.append(side(lang), main);
    return root;
  }

  function fillDrawer(drawer, lang) {
    const ar = lang === "ar";
    const t = T[ar ? "ar" : "en"];
    drawer.body.replaceChildren();
    const head = el("div", "brd-tx-head");
    head.append(el("strong", "", t.drawer), createAmount(86.25, { signed: true, kind: "credit", size: "l" }));
    if (window.createBadge) head.append(createBadge({ label: ar ? "مُسدَّد" : "Settled", tone: "settled", variant: "subtle", size: "sm" }));
    drawer.body.append(head, createDetails([
      { label: ar ? "التاريخ" : "Date", value: ar ? "15 أكتوبر، 12:41 · مدى •• 3301" : "15 Oct, 12:41 · mada •• 3301", style: "mono" },
      { label: ar ? "البطاقة" : "Card", value: ar ? "التسويق •• 4417" : "Marketing •• 4417", style: "mono" },
      { label: ar ? "الجهاز" : "Terminal", value: ar ? "العليا · 04" : "Olaya · 04" },
      { label: ar ? "المرجع" : "Reference", value: "TX-2026-1015-0412", style: "mono" },
      { label: ar ? "الفئة" : "Category", value: ar ? "مطاعم" : "Restaurants" },
    ]));
    drawer.footer.replaceChildren(
      createButton({ label: t.problem, variant: "ghost", size: "md" }),
      createButton({ label: t.download, variant: "secondary", size: "md" }),
    );
    drawer.activity.replaceChildren(el("p", "brd-quiet", ar ? "لا نشاط سابق على هذه البطاقة اليوم." : "No earlier activity on this card today."));
  }

  function dashboardWithDrawer(lang) {
    const stage = el("div", "brd-stage");
    const app = dashboard(lang);
    const drawer = createOverlay({ kind: "drawer", title: T[lang === "ar" ? "ar" : "en"].drawer, contained: true, open: true });
    fillDrawer(drawer, lang);
    stage.append(app, drawer);
    return stage;
  }

  function printable(lang) {
    const t = T[lang === "ar" ? "ar" : "en"];
    const sheet = el("article", "brd-a4");
    sheet.lang = lang;
    sheet.dir = lang === "ar" ? "rtl" : "ltr";
    const head = el("header", "brd-letterhead");
    const mark = el("img");
    mark.src = "../media/type=short, color=brand.svg";
    mark.alt = "";
    const titles = el("div", "");
    titles.append(el("strong", "", t.print), el("p", "", t.printSub));
    head.append(mark, titles);
    const card = receipt("success", lang, { showActions: false });
    card.style.setProperty("--br-notch", "var(--surface-card)");
    sheet.append(head, card, el("p", "brd-print-note", t.printNote));
    return sheet;
  }

  function tabs(lang, current) {
    const t = T[lang === "ar" ? "ar" : "en"];
    const bar = el("nav", "brd-tabs");
    bar.setAttribute("aria-label", t.home);
    const icons = { home: "home", cards: "cards", payments: "transfers", inbox: "notifications" };
    [["home", t.home], ["cards", t.cards], ["payments", t.payments], ["inbox", t.inbox]].forEach(([id, label], index) => {
      const item = el("button", "brd-tab");
      item.type = "button";
      item.dataset.on = id === current ? "true" : "false";
      const set = window.halaIcons;
      if (set) {
        const kebab = set.catalog[icons[id]] || icons[id];
        const pascal = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
        if (set.icons[pascal]) {
          const svg = set.createElement(set.icons[pascal]);
          svg.classList.add("hala-icon");
          svg.dataset.size = "nav";
          svg.setAttribute("aria-hidden", "true");
          item.append(svg);
        }
      }
      item.append(el("span", "", label));
      if (index > 1) item.append(el("span", "brd-count", "4"));
      bar.append(item);
    });
    return bar;
  }

  function home(lang, options = {}) {
    const t = T[lang === "ar" ? "ar" : "en"];
    const body = el("div", "brd-home");
    body.lang = lang;
    body.dir = lang === "ar" ? "rtl" : "ltr";
    body.append(
      createAccountHeader({
        style: options.compact ? "compact" : "greeting",
        lang,
        company: lang === "ar" ? "خميس العربية للتجارة" : options.compact ? "Business" : "Khamis Arabia Trading",
        greeting: lang === "ar" ? "صباح الخير" : "Good morning",
      }),
      createBalanceHero({
        style: options.hero || "card",
        balance: BALANCE,
        received: RECEIVED,
        label: options.hero === "plain" ? (lang === "ar" ? "هلا للأعمال · محمد" : "Hala Business · Muhammad") : undefined,
        iban: IBAN,
        lang,
        masked: options.masked,
        remember: options.remember,
      }),
      el("h3", "brd-section", t.recent),
      activity(lang),
    );
    return body;
  }

  function reviewPhone(lang, state) {
    const t = T[lang === "ar" ? "ar" : "en"];
    const body = el("div", "brd-review");
    body.lang = lang;
    body.dir = lang === "ar" ? "rtl" : "ltr";
    const card = receipt(state, lang);
    if (state === "review") card.setAttribute("data-live", "true");
    body.append(card);
    return { body, title: state === "review" ? t.review : t.sent, card };
  }

  function phone(title, body, caption, options = {}) {
    const card = el("figure", "lst-phone-card");
    const screen = el("div", "lst-phone brd-phone");
    if (options.lang === "ar") {
      screen.dir = "rtl";
      screen.lang = "ar";
    }
    const status = el("div", "brd-status-bar", "9:41");
    screen.append(status);
    if (options.bar === "nav") {
      const bar = el("div", "brd-phone-bar");
      bar.append(
        createButton({ variant: "ghost", size: "sm", icon: "back", iconOnly: true, ariaLabel: options.lang === "ar" ? T.ar.back : T.en.back }),
        el("span", "brd-phone-title", title),
        createButton({ variant: "ghost", size: "sm", icon: "share", iconOnly: true, ariaLabel: options.lang === "ar" ? T.ar.share : T.en.share }),
      );
      screen.append(bar);
    }
    const scroll = el("div", "lst-phone-scroll brd-scroll");
    scroll.append(body);
    screen.append(scroll);
    if (options.tabs) screen.append(tabs(options.lang || "en", "home"));
    card.append(screen, el("figcaption", "lst-caption", caption));
    return card;
  }

  function fillWeb() {
    const host = mount("web");
    host.append(
      block("Dashboard · Balance header, then recent activity. The eye remembers the choice.", dashboard("en", { remember: "hala-dna-br-web" }), "Live · hide the balance"),
      block("Dashboard · transaction drawer opened from a row", dashboardWithDrawer("en"), "Live · close the drawer"),
      block("Printable receipt · A4. The same Receipt card, without actions.", printable("en")),
    );
  }

  function fillMobile() {
    const review = reviewPhone("en", "review");
    mount("mobile").append(
      phone(T.en.home, home("en", { remember: "hala-dna-br-home" }), "iOS · Account header Greeting and Balance hero Card", { tabs: true }),
      phone(review.title, review.body, "Review transfer · Receipt card. Confirm moves it to Success", { bar: "nav" }),
      phone(T.en.sent, reviewPhone("en", "success").body, "Transfer sent · same rows, Share and Download PDF", { bar: "nav" }),
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

  function fillComponents() {
    mount("components").append(
      specimen("Balance hero", "Showing the balance at the top of the app Home.", "App Home, first block under the Account header (Plain on the page, Card on a coloured surface).", "Shown / Hidden toggles masking with the eye. Show trend adds the change vs last month. Digits stay LTR in Arabic.", createBalanceHero({ style: "card", balance: BALANCE, received: RECEIVED, iban: IBAN })),
      specimen("Account header", "The top bar of the app: who is signed in and which company.", "App Home (Greeting) and inner tabs (Compact).", "The switcher is the existing Chip with chevron. Compact adds support and settings icon buttons.", createAccountHeader({ style: "greeting" })),
      specimen("Balance header", "The top of the web dashboard.", "Web Desktop, first row of App shell Content.", "Actions wrap under the balance when narrow. Arabic starts from the right; the amount stays LTR.", createBalanceHeader({ balance: BALANCE, trend: 8.1 })),
      specimen("Receipt card", "Reviewing a transfer before confirming it, and the receipt after.", "App: Content of the success screen. Web: the Overlay drawer.", "Review has Confirm; Success has Share and Download PDF; Pending has Track. Rows are Detail row with Amount and Total styles.", receipt("success", "en")),
      specimen("Perforated divider", "Separating a receipt header from its details.", "Inside Receipt card, or any ticket-like card.", "Stretch to the card width. Notches use the page behind so they look cut out.", createPerforatedDivider()),
    );
  }

  function stateCell(name, node) {
    const cell = el("div", "dtd-state brd-state");
    cell.append(node, el("span", "lst-kicker", name));
    return cell;
  }

  function fillStates() {
    const host = mount("states");
    const heroes = el("div", "brd-grid");
    heroes.dataset.cols = "2";
    [["plain", false, "Plain · shown"], ["plain", true, "Plain · hidden"], ["card", false, "Card · shown"], ["card", true, "Card · hidden"]].forEach(([style, masked, name]) => {
      heroes.append(stateCell(name, createBalanceHero({
        style,
        balance: BALANCE,
        received: RECEIVED,
        iban: IBAN,
        masked,
        label: style === "plain" ? "Hala Business · Muhammad" : undefined,
      })));
    });
    host.append(block("Balance hero · Plain / Card × Shown / Hidden", heroes, "Live · the eye"));

    const headers = el("div", "brd-grid");
    headers.dataset.cols = "2";
    [["greeting", "en", "Greeting · LTR"], ["greeting", "ar", "Greeting · RTL"], ["compact", "en", "Compact · LTR"], ["compact", "ar", "Compact · RTL"]].forEach(([style, lang, name]) => {
      headers.append(stateCell(name, createAccountHeader({
        style,
        lang,
        company: lang === "ar" ? (style === "compact" ? "الأعمال" : "خميس العربية للتجارة") : (style === "compact" ? "Business" : "Khamis Arabia Trading"),
      })));
    });
    host.append(block("Account header · Greeting / Compact · LTR + RTL", headers));

    const balances = el("div", "brd-grid");
    balances.dataset.cols = "1";
    balances.append(
      stateCell("Shown", createBalanceHeader({ balance: BALANCE, trend: 8.1 })),
      stateCell("Hidden", createBalanceHeader({ balance: BALANCE, trend: 8.1, masked: true })),
    );
    host.append(block("Balance header · Shown / Hidden", balances, "Live · the eye"));

    const receipts = el("div", "brd-grid");
    ["review", "success", "pending"].forEach((state) => {
      receipts.append(stateCell(state, receipt(state, "en")));
    });
    host.append(block("Receipt card · Review / Success / Pending", receipts, "Live · Confirm"));

    const rows = el("div", "brd-grid");
    rows.dataset.cols = "2";
    rows.append(
      stateCell("Amount", createDetails([{ label: "Fee", value: 0, style: "amount" }])),
      stateCell("Total", createDetails([{ label: "Total", value: 1250, style: "total" }])),
    );
    host.append(block("Detail row · Amount / Total — existing Lists component, two new styles", rows));
    host.append(block("Perforated divider", createPerforatedDivider()));
  }

  function fillArabic() {
    const host = mount("arabic");
    const review = reviewPhone("ar", "success");
    const phones = el("div", "brd-phones");
    phones.append(
      phone("الرئيسية", home("ar", { remember: "hala-dna-br-home-ar" }), "Home · Arabic. The amount stays left to right.", { lang: "ar", tabs: true }),
      phone("الرصيد مخفي", home("ar", { masked: true }), "Home · balance hidden · Arabic", { lang: "ar", tabs: true }),
      phone(T.ar.sent, review.body, "Transfer sent · Arabic", { lang: "ar", bar: "nav" }),
    );
    host.append(
      block("Arabic · the dashboard drawer. Labels follow Arabic; the amount, IBAN and reference stay left to right.", dashboardWithDrawer("ar"), "Live"),
      phones,
    );
  }

  function fillResponsive() {
    const host = mount("responsive");
    const stack = el("div", "dtd-stack");
    const frame = el("div", "dtd-frame brd-frame");
    function paint(width) {
      frame.dataset.width = width;
      if (width === "desktop") frame.replaceChildren(dashboard("en"));
      else if (width === "tablet") frame.replaceChildren(home("en", { compact: true, hero: "plain" }));
      else frame.replaceChildren(home("en", { remember: "hala-dna-br-phone" }));
    }
    paint("desktop");
    stack.append(
      segment("Breakpoint", [["desktop", "Web"], ["tablet", "iPad app · 760"], ["mobile", "Phone app · 390"]], "desktop", paint),
      frame,
    );
    host.append(block("Web uses Balance header; the app uses Account header with Balance hero on both iPad and phone", stack, "Live · width"));
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "BalanceHeader, ReceiptCard, PerforatedDivider", "Balance header sits in App shell Content · the eye is an icon button with aria-pressed · Receipt card fills the existing Overlay drawer · printable A4 reuses Receipt card without actions · amounts use createAmount so digits never mirror"],
      ["iOS", "Same names · AccountHeader, BalanceHero, ReceiptCard", "Account header Greeting on Home, Compact on inner tabs · Balance hero Card on Home, Plain on iPad · the eye is 44 pt including the hit area · VoiceOver reads \"45,000.00 Saudi riyals\" or \"Balance hidden\" · notches sample the canvas behind the card"],
      ["Android", "Same names · AccountHeader, BalanceHero, ReceiptCard", "Same hierarchy · 48 dp targets · contentDescription on the eye, Copy IBAN and Confirm with Face ID · the IBAN and reference set layoutDirection Ltr · honours the animator duration scale"],
    ].forEach(([platform, api, notes]) => {
      const line = el("div", "lst-platform");
      line.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(line);
    });
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Let people hide the balance with the eye, and keep the choice next time.", "Show the balance with no way to mask it on a shared screen."],
      ["Use the same Receipt card for review and for the receipt, rows in the same order.", "Reorder or drop rows between review and receipt — people compare them."],
      ["Keep amounts, IBAN and reference in mono and left-to-right, also in Arabic.", "Mirror the IBAN or switch to Arabic-Indic digits on a receipt."],
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
