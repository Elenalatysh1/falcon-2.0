(function () {
  const page = document.querySelector('[data-page="lists"]');
  if (!page || !window.createListItem) return;

  const DAYS = [
    { en: "Today · 19 Oct", ar: "اليوم · ١٩ أكتوبر", total: 12136, rows: [
      { id: "albaik", merchant: "Al Baik · Olaya", ar: "البيك · العليا", time: "12:41", method: "mada •• 3301", amount: 64, flow: "out", status: "Pending", tone: 4, category: "Food and drinks" },
      { id: "almarai", merchant: "Almarai Supply Co.", ar: "المراعي للتوريد", time: "10:05", method: "Transfer", amount: 12500, flow: "in", status: "Settled", tone: 2, category: "Sales" },
      { id: "stc", merchant: "STC Pay top-up", ar: "شحن STC Pay", time: "09:12", method: "Visa •• 1951", amount: 300, flow: "out", status: "Pending", tone: 3, category: "Wallet" },
    ] },
    { en: "Yesterday · 18 Oct", ar: "أمس · ١٨ أكتوبر", total: 1191.5, rows: [
      { id: "jarir", merchant: "Jarir Bookstore", ar: "مكتبة جرير", time: "18:30", method: "Visa •• 1951", amount: 1149, flow: "declined", status: "Declined", tone: 1, category: "Office" },
      { id: "careem", merchant: "Careem", ar: "كريم", time: "08:44", method: "mada •• 3301", amount: 42.5, flow: "out", status: "Settled", tone: 5, category: "Travel" },
    ] },
  ];
  const TONE = { Pending: "pending", Settled: "settled", Declined: "declined" };
  const AR_STATUS = { Pending: "قيد المعالجة", Settled: "مكتملة", Declined: "مرفوضة" };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-lists="${name}"]`);
  }

  function status(row, ar) {
    return { label: ar ? AR_STATUS[row.status] : row.status, tone: TONE[row.status] };
  }

  function txRow(row, options = {}) {
    const ar = options.ar;
    return createTransactionRow({
      merchant: ar ? row.ar : row.merchant,
      detail: `${row.time} · ${row.method}`,
      initials: row.merchant.split(/[\s·]+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase(),
      tone: row.tone,
      amount: row.amount,
      flow: row.flow,
      status: row.flow === "in" && options.compact ? null : status(row, ar),
      density: options.compact ? "compact" : "default",
      selected: options.selected,
      key: options.key,
      onClick: options.onClick,
    });
  }

  function dayList(options = {}) {
    const items = [];
    DAYS.forEach((day) => {
      items.push(createListHeader({ label: options.ar ? day.ar : day.en, total: day.total, sticky: options.sticky }));
      day.rows.forEach((row) => items.push(txRow(row, { ...options, selected: options.selected === row.id, key: `tx-${row.id}`, onClick: options.onPick ? () => options.onPick(row) : null })));
    });
    return createList({ label: options.ar ? "العمليات" : "Transactions", items });
  }

  function detail(row, options = {}) {
    const root = el("div", "lst-detail");
    const head = el("div", "lst-detail-head");
    const avatar = el("span", "list-avatar", row.merchant.split(/[\s·]+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase());
    avatar.dataset.tone = String(row.tone);
    avatar.dataset.size = "l";
    head.append(avatar, el("strong", "lst-detail-name", row.merchant));
    head.append(createAmount(row.flow === "in" ? row.amount : -row.amount, { signed: true, size: "m", kind: row.flow === "declined" ? "muted" : row.flow === "in" ? "credit" : "plain" }));
    if (window.createBadge) head.append(createBadge({ label: row.status, tone: TONE[row.status], variant: "subtle", size: "sm" }));
    root.append(head, createDetails([
      { label: "Date", value: `19 Oct 2026, ${row.time}`, style: "mono" },
      { label: "Method", value: row.method, style: "mono" },
      { label: "Category", value: row.category },
      { label: "Reference", value: `TX-${row.time.replace(":", "")}-${row.tone}04`, style: "mono" },
    ]));
    if (window.createButton) {
      const actions = el("div", "lst-detail-actions");
      actions.append(createButton({ label: "Download receipt", variant: "secondary", size: options.compact ? "md" : "md", icon: "download" }));
      actions.append(createButton({ label: "Report a problem", variant: "ghost", size: "md" }));
      root.append(actions);
    }
    return root;
  }

  function fillWeb() {
    const host = mount("web");
    let current = DAYS[0].rows[0];
    const listHost = el("div", "lst-web-list");
    const side = el("aside", "lst-web-detail");
    side.setAttribute("aria-live", "polite");
    function paint(motion) {
      const list = dayList({ selected: current.id, onPick: (row) => { current = row; paint(true); focusRow(row.id); } });
      listHost.replaceChildren(list);
      const next = detail(current);
      if (motion) next.dataset.motion = "enter";
      side.replaceChildren(next);
    }
    function focusRow(id) {
      const target = listHost.querySelector(`[data-key="tx-${id}"]`);
      if (target) target.focus();
    }
    paint(false);
    host.append(listHost, side);
  }

  function phone(title, body, caption, options = {}) {
    const card = el("figure", "lst-phone-card");
    const screen = el("div", "lst-phone");
    if (options.dir) {
      screen.dir = options.dir;
      screen.lang = "ar";
    }
    const bar = el("div", "lst-phone-bar");
    bar.append(el("span", options.large ? "lst-phone-large" : "lst-phone-title", title));
    const scroll = el("div", "lst-phone-scroll");
    scroll.append(body);
    screen.append(bar, scroll);
    card.append(screen, el("figcaption", "lst-caption", caption));
    return card;
  }

  function settings(ar) {
    const rows = ar
      ? [["cards", "إعدادات البطاقة", "الحدود والرمز والتجميد"], ["bell", "الإشعارات", "المدفوعات والموافقات"], ["users", "الفريق", "٦ أعضاء"], ["shield-check", "الأمان", "آخر تسجيل دخول اليوم", "حُدّث قبل يومين"]]
      : [["cards", "Card settings", "Limits, PIN and freeze"], ["bell", "Notifications", "Payments and approvals"], ["users", "Team", "6 members"], ["shield-check", "Security", "Last sign-in today", "Updated 2 days ago"]];
    return createList({
      label: ar ? "الإعدادات" : "Settings",
      divided: true,
      items: rows.map(([glyph, title, subtitle, meta]) => createListItem({ title, subtitle, meta, leading: { icon: glyph }, onClick: () => {} })),
    });
  }

  function fillMobile() {
    const host = mount("mobile");
    host.append(
      phone("Activity", dayList({ compact: true }), "iOS · Home · compact rows", { large: true }),
      phone("Transactions", dayList({ sticky: true }), "Android · Transactions · sticky day headers"),
      phone("Settings", settings(false), "iOS and Android · settings list"),
    );
  }

  function specimen(name, when, how, node) {
    const card = el("div", "lst-spec");
    const copy = el("div", "lst-spec-copy");
    copy.append(el("h3", "", name), el("p", "", when), el("p", "lst-quiet", how));
    const stage = el("div", "lst-spec-stage");
    stage.append(node);
    card.append(copy, stage);
    return card;
  }

  function fillComponents() {
    const host = mount("components");
    const oneTwoThree = el("div", "lst-stack");
    oneTwoThree.append(
      createListItem({ title: "Card settings", leading: { icon: "cards" }, onClick: () => {} }),
      createListItem({ title: "Card settings", subtitle: "Limits, PIN and freeze", leading: { icon: "cards" }, onClick: () => {} }),
      createListItem({ title: "Card settings", subtitle: "Limits, PIN and freeze", meta: "Updated 2 days ago", leading: { icon: "cards" }, onClick: () => {} }),
      createListItem({ title: "International use", subtitle: "Purchase card", value: "On", leading: { icon: "wallet" } }),
    );
    const flows = el("div", "lst-stack");
    flows.append(
      txRow(DAYS[0].rows[1], {}),
      txRow(DAYS[0].rows[0], {}),
      txRow(DAYS[1].rows[0], {}),
      txRow(DAYS[0].rows[0], { compact: true }),
      txRow(DAYS[1].rows[0], { compact: true }),
    );
    const headers = el("div", "lst-stack");
    headers.append(createListHeader({ label: "Today · 19 Oct", total: 12136 }), createListHeader({ label: "Yesterday · 18 Oct", total: 1191.5, sticky: true }), createListHeader({ label: "Cards" }));
    const details = createDetails([
      { label: "Method", value: "Bank transfer" },
      { label: "Reference", value: "TRF-88213", style: "mono" },
      { label: "Fee", value: 0, style: "amount" },
      { label: "Total", value: 25000, style: "total" },
    ]);
    host.append(
      specimen("List item", "Settings, menus, accounts, inbox: any row that opens something or shows a value.", "1–3 lines from the copy you pass. Leading is an icon tile or an avatar; trailing is a chevron, a check when selected, or a value.", oneTwoThree),
      specimen("Transaction row", "Every money movement: activity, statements on mobile, search results.", "A List item preset. In is green with +, Out is primary with −, Declined is muted and struck through and always keeps its badge. Compact is one line and 48 tall.", flows),
      specimen("List header", "Groups rows by day, type or status.", "Overline label with an optional muted total. Sticky on long mobile lists.", headers),
      specimen("Detail row", "Key–value facts: receipts, review summaries, drawers.", "Text, Mono (IBANs, references, dates), Amount and Total. Rendered as a description list.", details),
    );
  }

  function stateCell(name, note, node) {
    const cell = el("div", "lst-state");
    cell.append(node, el("span", "lst-kicker", name), el("span", "lst-quiet", note));
    return cell;
  }

  function fillStates() {
    const host = mount("states");
    const base = { title: "Card settings", subtitle: "Limits, PIN and freeze", leading: { icon: "cards" } };
    [
      ["Default", "Rest", "default"],
      ["Hover", "Web only · surface/hover", "hover"],
      ["Pressed", "Touch and click · scale 0.97", "pressed"],
      ["Focus", "Keyboard · 2 px ring", "focus"],
      ["Selected", "Pickers · check at the end", "selected"],
      ["Disabled", "text/disabled · not focusable", "disabled"],
    ].forEach(([name, note, state]) => host.append(stateCell(name, note, createListItem({ ...base, state }))));
    host.append(stateCell("Loading", "Skeleton rows keep the rhythm", createListSkeleton({ rows: 1 })));
  }

  function fillArabic() {
    const host = mount("arabic");
    host.append(
      phone("النشاط", dayList({ compact: false, ar: true }), "العربية · الأيام والمجاميع", { dir: "rtl" }),
      phone("الإعدادات", settings(true), "العربية · قائمة الإعدادات", { dir: "rtl" }),
    );
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "List, List item, Transaction row, List header, Detail row", "44 px min row · hover and focus ring · ul/li with role list · rows are buttons or links · Detail rows are dl/dt/dd"],
      ["iOS", "List (.plain / .insetGrouped), same component names", "44 pt min row · swipe actions with .swipeActions · Section headers pin on scroll · VoiceOver reads title, subtitle, amount, then status"],
      ["Android", "LazyColumn with ListItem, same component names", "48 dp min row (Compact stays 48) · stickyHeader for days · ripple on press · contentDescription merges the row"],
    ].forEach(([platform, api, notes]) => {
      const row = el("div", "lst-platform");
      row.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(row);
    });
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Group transactions by day and show the day's total in the header.", "Mix dates inside one long ungrouped list."],
      ["Show the amount with the Riyal sign and its + / − sign at the end of the row.", "Write \"SAR\", colour-code without a sign, or mirror the digits in Arabic."],
      ["Use Compact rows for dense feeds and Default when status matters.", "Hide a Declined status in a Compact row; it must stay visible."],
      ["Build rows from List item. Transaction row and settings rows are presets of it.", "Draw a one-off row with its own padding and type for a single screen."],
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
  fillPlatforms();
  fillRules();
})();
