(function () {
  const page = document.querySelector('[data-page="badges"]');
  if (!page || !window.createBadge) return;

  const statuses = [
    ["settled", "Settled", "Money is in the account"],
    ["pending", "Pending", "Waiting for the bank or approval"],
    ["processing", "Processing", "Being sent right now"],
    ["scheduled", "Scheduled", "Will run on a set date"],
    ["declined", "Declined", "Rejected, no money moved"],
    ["refunded", "Refunded", "Returned to the customer"],
    ["frozen", "Frozen", "Card temporarily blocked"],
    ["draft", "Draft", "Saved, not submitted"],
    ["expired", "Expired", "Link or document no longer valid"],
  ];
  const sizes = [
    ["lg", "Large", "H 28 · 13/600 · px 12", "Page headers, card details, mobile detail screens."],
    ["md", "Medium", "H 24 · 12.5/600 · px 10", "Default. Lists, cards, plan options."],
    ["sm", "Small", "H 20 · 11/600 · px 8", "Sidebar counts, mobile list rows, dense tables."],
  ];
  const styleNames = [
    ["Subtle", "Default"],
    ["Outline", "On tinted surfaces"],
    ["Solid", "Detail headers, one per view"],
    ["Dot", "Tables and dense lists"],
  ];
  const filters = [
    ["Status", "Settled"],
    ["Method", "mada"],
    ["Branch", "Olaya"],
    ["Amount", "Over SAR 500"],
  ];
  const teams = [
    ["Marketing", "scheduled"],
    ["Operations", "processing"],
    ["Finance", "info"],
    ["Sales", "warning"],
    ["Admin", "neutral"],
  ];
  const rows = [
    ["Al Baik · Olaya", "Today, 12:41", "mada •• 3301", "+ 86.25", true],
    ["Jarir Bookstore", "Today, 11:08", "Visa •• 4417", "− 1,249.00", false],
    ["Nour Trading", "Today, 09:30", "Transfer", "− 25,000.00", false],
    ["Careem", "Yesterday", "Visa •• 4417", "− 38.50", false],
    ["Online store #2041", "Yesterday", "Apple Pay", "+ 420.00", true],
  ];
  const mobileRows = [
    ["Al Baik · Olaya", "Today, 12:41", "+ 86.25", 0, true],
    ["Nour Trading", "Today, 09:30", "− 25,000.00", 1, false],
    ["Monthly rent", "Sun 18 Oct", "− 12,000.00", 3, false],
    ["Careem", "Yesterday", "− 38.50", 4, false],
    ["Online store #2041", "Yesterday", "+ 420.00", 0, true],
    ["Jarir Bookstore", "Mon", "− 1,249.00", 5, false],
  ];
  const chips = [
    ["All", null],
    ["Settled", 0],
    ["Pending", 1],
    ["Scheduled", 3],
    ["Declined", 4],
  ];
  const detailTones = ["settled", "pending", "declined", "refunded"];
  const tabbar = [
    ["home", "Home", 0, true],
    ["cards", "Cards", 0, false],
    ["transfers", "Payments", 3, false],
    ["notifications", "Inbox", 4, false],
  ];

  const s = {
    n: 4,
    tags: [0, 1, 2, 3],
    rowSt: [0, 1, 3, 4, 2],
    detail: 0,
    chip: 0,
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-badges="${name}"]`);
  }

  function icon(name) {
    return drawBadgeIcon(name);
  }

  function initials(name) {
    return name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  }

  function badge(options) {
    return createBadge(options);
  }

  function fillSizes() {
    const root = mount("sizes");
    root.replaceChildren();
    sizes.forEach(([size, name, spec, use]) => {
      const row = el("div", "bd-size");
      const copy = el("div", "bd-name", name);
      copy.append(el("span", "bd-spec", spec));
      const samples = el("div", "bd-row");
      samples.append(
        badge({ tone: "settled", size, icon: "dot", label: "Settled" }),
        badge({ tone: "pending", size, icon: true, label: "Pending" }),
        badge({ variant: "feature", tone: "brand", size, label: "NEW" }),
        badge({ variant: "count", tone: "ink", size, value: 12 }),
      );
      row.append(copy, samples, el("span", "bd-use", use));
      root.append(row);
    });
  }

  function fillStatuses() {
    const cols = mount("status-cols");
    cols.replaceChildren();
    cols.append(el("span"));
    styleNames.forEach(([name, use]) => {
      const item = el("div");
      item.append(el("span", "bd-kicker", name), el("p", "", use));
      cols.append(item);
    });
    const root = mount("statuses");
    root.replaceChildren();
    statuses.forEach(([tone, name, when]) => {
      const row = el("div", "bd-status");
      const copy = el("div", "bd-name", name);
      copy.append(el("span", "", when));
      row.append(copy);
      ["subtle", "outline", "solid"].forEach((variant) => {
        const cell = el("div");
        cell.append(badge({ tone, variant, icon: true, label: name }));
        row.append(cell);
      });
      const dot = el("div");
      dot.append(badge({ tone, variant: "dot", label: name }));
      row.append(dot);
      root.append(row);
    });
  }

  function fillCounters() {
    const root = mount("counters");
    root.replaceChildren();
    const bell = el("span", "bd-anchor");
    const bellIcon = icon("notifications");
    if (bellIcon) bell.append(bellIcon);
    if (s.n > 0) bell.append(badge({ variant: "count", tone: "count", size: "sm", value: s.n, ring: true }));
    const chat = el("span", "bd-anchor");
    const chatIcon = icon("chat");
    if (chatIcon) chat.append(chatIcon);
    chat.append(badge({ variant: "presence", tone: "count" }));
    const online = el("span", "bd-anchor", "AA");
    online.dataset.art = "info";
    online.append(badge({ variant: "presence", tone: "online", size: "lg" }));
    const offline = el("span", "bd-anchor", "OB");
    offline.dataset.art = "warm";
    offline.append(badge({ variant: "presence", tone: "offline", size: "lg" }));
    const step = el("div", "bd-step");
    const fewer = createButton({ icon: "minus", iconOnly: true, variant: "secondary", size: "xs", ariaLabel: "Fewer" });
    const more = createButton({ icon: "add", iconOnly: true, variant: "secondary", size: "xs", ariaLabel: "More" });
    const big = createButton({ label: "120", variant: "secondary", size: "xs" });
    fewer.addEventListener("click", () => { s.n = Math.max(0, s.n - 1); fillCounters(); fillTabs(); });
    more.addEventListener("click", () => { s.n += 1; fillCounters(); fillTabs(); });
    big.addEventListener("click", () => { s.n = 120; fillCounters(); fillTabs(); });
    step.append(fewer, el("span", "bd-count", String(s.n)), more, big);
    const marks = el("div", "bd-marks");
    marks.append(bell, chat, online, offline, step);
    root.append(marks);
  }

  function fillNav() {
    const root = mount("nav");
    root.replaceChildren();
    [
      ["transfers", "Transfers", badge({ variant: "count", tone: "warning", size: "sm", value: 3 })],
      ["ecommerce", "eCommerce", badge({ variant: "feature", tone: "brand", label: "NEW" })],
      ["cards", "Cards", badge({ variant: "presence", tone: "online", size: "sm" })],
    ].forEach(([name, label, mark], index) => {
      const row = el("div", "bd-nav-row");
      if (index === 1) row.dataset.on = "true";
      const glyph = icon(name);
      if (glyph) row.append(glyph);
      row.append(el("span", "", label), mark);
      root.append(row);
    });
  }

  function fillTabs() {
    const root = mount("tabs");
    root.replaceChildren();
    tabbar.forEach(([name, label, count, on]) => {
      const tab = el("span", "bd-tab");
      if (on) tab.dataset.on = "true";
      const wrap = el("span");
      const glyph = icon(name);
      if (glyph) wrap.append(glyph);
      const shown = name === "notifications" ? s.n : count;
      if (shown > 0) wrap.append(badge({ variant: "count", tone: "count", size: "sm", value: shown, ring: true }));
      tab.append(wrap, label);
      root.append(tab);
    });
  }

  function fillTags() {
    const root = mount("tags");
    root.replaceChildren();
    s.tags.forEach((index) => {
      const [key, label] = filters[index];
      root.append(badge({
        variant: "tag",
        key,
        label,
        dismissible: true,
        onDismiss: () => {
          s.tags = s.tags.filter((value) => value !== index);
          fillTags();
        },
      }));
    });
    if (s.tags.length) {
      const clear = el("button", "bd-clear", "Clear all");
      clear.type = "button";
      clear.addEventListener("click", () => { s.tags = []; fillTags(); });
      root.append(clear);
    } else {
      root.append(el("span", "bd-muted", "No filters applied."));
      const restore = el("button", "bd-clear", "Restore");
      restore.type = "button";
      restore.addEventListener("click", () => { s.tags = [0, 1, 2, 3]; fillTags(); });
      root.append(restore);
    }
  }

  function fillTeams() {
    const root = mount("teams");
    root.replaceChildren();
    teams.forEach(([label, tone]) => root.append(badge({ tone, label })));
  }

  function fillTable() {
    const root = mount("table");
    root.replaceChildren();
    rows.forEach(([merchant, time, method, amount, incoming], index) => {
      const tone = statuses[s.rowSt[index]][0];
      const name = statuses[s.rowSt[index]][1];
      const row = el("div", "bd-table-row");
      const who = el("div", "bd-merchant");
      who.append(el("strong", "", merchant), el("span", "", time));
      const amt = el("span", "bd-amt", amount);
      if (incoming) amt.dataset.in = "true";
      const cycle = el("button", "bd-cycle");
      cycle.type = "button";
      cycle.setAttribute("aria-label", `Change status for ${merchant}`);
      cycle.append(badge({ variant: "dot", tone, label: name }));
      cycle.addEventListener("click", () => {
        s.rowSt[index] = (s.rowSt[index] + 1) % statuses.length;
        fillTable();
        fillActivity();
      });
      row.append(who, el("span", "bd-method", method), amt, cycle);
      root.append(row);
    });
  }

  function fillActivity() {
    const root = mount("activity");
    root.replaceChildren();
    rows.forEach(([merchant, time, , amount, incoming], index) => {
      const tone = statuses[s.rowSt[index]][0];
      const name = statuses[s.rowSt[index]][1];
      const row = el("div", "bd-person");
      row.append(el("span", "bd-anchor", initials(merchant)));
      const copy = el("div", "bd-copy");
      copy.append(el("strong", "", merchant), el("span", "", time));
      const side = el("div", "bd-side");
      if (incoming) side.dataset.in = "true";
      side.append(el("span", "", amount), badge({ tone, size: "sm", label: name }));
      row.append(copy, side);
      root.append(row);
    });
  }

  function fillDetail() {
    const root = mount("detail");
    root.replaceChildren();
    const tone = detailTones[s.detail];
    const name = statuses.find((item) => item[0] === tone)[1];
    root.append(badge({ tone, size: "lg", icon: true, label: name }));
    const picks = mount("detail-picks");
    picks.replaceChildren();
    ["Settled", "Pending", "Declined", "Refunded"].forEach((label, index) => {
      const button = createButton({
        label,
        variant: "secondary",
        size: "xs",
        role: "chip",
        selected: s.detail === index,
      });
      button.addEventListener("click", () => { s.detail = index; fillDetail(); });
      picks.append(button);
    });
  }

  function syncChipFade(root) {
    const max = root.scrollWidth - root.clientWidth;
    if (max <= 1) {
      root.dataset.fade = "none";
      return;
    }
    const offset = Math.abs(root.scrollLeft);
    const lead = offset > 1;
    const trail = offset < max - 1;
    root.dataset.fade = lead && trail ? "both" : lead ? "lead" : trail ? "trail" : "none";
  }

  let chipFadeBound = false;

  function bindChipFade(root) {
    if (chipFadeBound) return;
    chipFadeBound = true;
    root.addEventListener("scroll", () => syncChipFade(root), { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(() => syncChipFade(root)).observe(root);
    }
  }

  function fillChips() {
    const root = mount("chips");
    root.replaceChildren();
    chips.forEach(([label, status], index) => {
      const count = status == null ? mobileRows.length : mobileRows.filter((row) => row[3] === status).length;
      const button = createButton({
        label,
        variant: "secondary",
        role: "chip",
        selected: s.chip === index,
      });
      button.append(badge({
        variant: "count",
        tone: s.chip === index ? "inverse" : "neutral",
        value: count,
        mono: true,
      }));
      button.addEventListener("click", () => { s.chip = index; fillChips(); fillFiltered(); });
      root.append(button);
    });
    bindChipFade(root);
    syncChipFade(root);
  }

  function fillFiltered() {
    const root = mount("filtered");
    root.replaceChildren();
    const status = chips[s.chip][1];
    const shown = mobileRows.filter((row) => status == null || row[3] === status);
    if (!shown.length) {
      root.append(el("div", "bd-empty", "No transactions with this status."));
      return;
    }
    shown.forEach(([merchant, time, amount, toneIndex, incoming]) => {
      const tone = statuses[toneIndex][0];
      const name = statuses[toneIndex][1];
      const row = el("div", "bd-person");
      row.append(el("span", "bd-anchor", initials(merchant)));
      const copy = el("div", "bd-copy");
      copy.append(el("strong", "", merchant), el("span", "", time));
      const side = el("div", "bd-side");
      if (incoming) side.dataset.in = "true";
      side.append(el("span", "", amount), badge({ tone, size: "sm", label: name }));
      row.append(copy, side);
      root.append(row);
    });
  }

  function fillRules() {
    const root = mount("rules");
    [
      ["One colour per status everywhere: Settled is always green, Pending always amber.", "Make badges clickable. If it does something, it’s a chip or button."],
      ["Pair colour with an icon or dot so the status reads without colour.", "Put more than two badges next to one title."],
      ["Keep labels to one or two words. Put details in a tooltip or the detail screen.", "Show counts over 99. Write 99+ instead."],
      ["Use red counters only for items that need action; use a dot for new.", "Use a red counter just to say something is new."],
    ].forEach(([yes, no], index) => {
      const card = el("div", "lst-rule");
      card.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
      [[true, yes], [false, no]].forEach(([ok, text]) => {
        const line = el("div", "lst-rule-line");
        line.dataset.ok = ok ? "true" : "false";
        line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
        card.append(line);
      });
      root.append(card);
    });
  }

  function fillArabic() {
    const root = mount("arabic");
    if (!root) return;
    const wrap = el("div", "bd-row");
    wrap.dir = "rtl";
    wrap.lang = "ar";
    wrap.style.fontFamily = "var(--font-arabic)";
    wrap.append(
      badge({ tone: "settled", icon: true, label: "مكتمل" }),
      badge({ tone: "pending", icon: true, label: "قيد الانتظار" }),
      badge({ variant: "trend", tone: "up", icon: true, label: "12.4%" }),
      badge({ tone: "brand", icon: true, label: "موثّق" }),
    );
    root.append(wrap);
  }

  function fillExtras() {
    const trends = mount("trends");
    [["up", "12.4%"], ["down", "3.1%"], ["flat", "0.0%"]].forEach(([tone, label]) => {
      trends.append(badge({ variant: "trend", tone, icon: true, label }));
    });
    mount("kpi-trend").append(badge({ variant: "trend", tone: "up", size: "sm", icon: true, label: "12.4%" }));
    const verified = badge({ tone: "brand", icon: true, label: "Verified" });
    verified.dataset.seal = "true";
    const verify = mount("verify");
    verify.append(
      verified,
      badge({ tone: "warning", label: "Verification pending" }),
      badge({ tone: "error", label: "Documents needed" }),
    );
    mount("art-active").replaceWith(badge({ variant: "frosted", tone: "settled", icon: "dot", label: "Active" }));
    mount("art-frozen").replaceWith(badge({ variant: "frosted", tone: "frozen", icon: true, label: "Frozen", surface: "light" }));
    const profile = mount("profile");
    if (profile) profile.append(badge({ variant: "presence", tone: "verified" }));
  }

  fillExtras();
  fillSizes();
  fillStatuses();
  fillCounters();
  fillNav();
  fillTabs();
  fillTags();
  fillTeams();
  fillTable();
  fillActivity();
  fillDetail();
  fillChips();
  fillFiltered();
  fillArabic();
  fillRules();
})();
