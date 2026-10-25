/**
 * HALA DNA Balance & receipts: Balance hero, Account header, Balance header, Receipt card and the Perforated divider part.
 * Load vendor/hala-icons.js, button.js, badges.js and lists.js (createAmount, createDetails) first.
 *
 * createBalanceHero({ style, balance, received, label, iban, masked, showTrend, remember, lang, onToggle })
 *   style "plain" (on the page) | "card" (on the balance card). remember: a storage key that keeps the masked choice.
 * createAccountHeader({ style, greeting, company, initials, tone, lang, onSwitch })  style "greeting" | "compact".
 * createBalanceHeader({ account, balance, trend, masked, remember, lang, onTopUp, onTransfer })  Web dashboard.
 * createReceiptCard({ state, amount, recipient, bank, iban, date, reference, fee, total, lang, showActions, onConfirm })
 *   state "review" | "success" | "pending". Rows keep the same order in every state; Reference joins after review.
 *   showActions false hides the footer (printable receipt). Returns the root with setState(state).
 * createPerforatedDivider()  Separates a ticket header from its details. Notches read --br-notch (the page behind).
 *
 * Amounts, IBANs and references stay mono and left to right in Arabic.
 */
(function () {
  const COPY = {
    en: {
      available: "Available balance",
      received: "received today",
      show: "Show balance",
      hide: "Hide balance",
      hidden: "Balance hidden",
      copy: "Copy IBAN",
      copied: "Copied",
      vs: "vs last month",
      topUp: "Top up",
      transfer: "Transfer",
      greeting: "Good morning",
      switcher: "Switch account",
      notifications: "Notifications",
      support: "Support",
      settings: "Settings",
      home: "Hala home",
      review: "Review transfer",
      success: "Transfer sent",
      pending: "Transfer pending",
      to: "To",
      bank: "Bank",
      iban: "IBAN",
      date: "Date",
      reference: "Reference",
      fee: "Fee",
      total: "Total",
      confirm: "Confirm with Face ID",
      share: "Share",
      download: "Download PDF",
      track: "Track transfer",
    },
    ar: {
      available: "الرصيد المتاح",
      received: "استُلم اليوم",
      show: "إظهار الرصيد",
      hide: "إخفاء الرصيد",
      hidden: "الرصيد مخفي",
      copy: "نسخ الآيبان",
      copied: "تم النسخ",
      vs: "مقارنة بالشهر الماضي",
      topUp: "إيداع",
      transfer: "تحويل",
      greeting: "صباح الخير",
      switcher: "تبديل الحساب",
      notifications: "الإشعارات",
      support: "الدعم",
      settings: "الإعدادات",
      home: "الرئيسية في هلا",
      review: "مراجعة التحويل",
      success: "تم التحويل",
      pending: "التحويل قيد المعالجة",
      to: "إلى",
      bank: "البنك",
      iban: "الآيبان",
      date: "التاريخ",
      reference: "الرقم المرجعي",
      fee: "الرسوم",
      total: "الإجمالي",
      confirm: "تأكيد ببصمة الوجه",
      share: "مشاركة",
      download: "تحميل PDF",
      track: "تتبع التحويل",
    },
  };
  const STATUS = {
    review: { icon: "sadad", tone: "neutral" },
    success: { icon: "success", tone: "success" },
    pending: { icon: "pending", tone: "warning" },
  };
  const SYMBOL = "../media/type=short, color=brand.svg";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(name, size) {
    const set = window.halaIcons;
    if (!set) return null;
    const kebab = (set.catalog && set.catalog[name]) || name;
    const pascal = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    if (!set.icons[pascal]) return null;
    const svg = set.createElement(set.icons[pascal]);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    svg.dataset.size = size || "default";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function copyFor(lang) {
    return COPY[lang === "ar" ? "ar" : "en"];
  }

  function cue(node, name) {
    node.removeAttribute("data-motion");
    void node.offsetWidth;
    node.dataset.motion = name || "true";
    node.addEventListener("animationend", () => node.removeAttribute("data-motion"), { once: true });
  }

  function scope(root, lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
  }

  function recall(key, fallback) {
    if (!key) return fallback;
    try {
      const stored = window.localStorage.getItem(key);
      return stored == null ? fallback : stored === "true";
    } catch (error) {
      return fallback;
    }
  }

  function keep(key, value) {
    if (!key) return;
    try {
      window.localStorage.setItem(key, String(value));
    } catch (error) {
      /* Private mode: the choice lasts for this page only. */
    }
  }

  /* Eye toggle: aria-pressed is true while the balance is hidden. */
  function visibilityToggle(copy, onDark) {
    const button = window.createButton({ variant: onDark ? "ghost" : "secondary", quiet: !onDark, size: "sm", icon: "show", iconOnly: true, ariaLabel: copy.hide });
    button.classList.add("br-hit", "br-eye");
    button.setAttribute("aria-pressed", "false");
    button.paint = (masked) => {
      button.setAttribute("aria-pressed", masked ? "true" : "false");
      button.setAttribute("aria-label", masked ? copy.show : copy.hide);
      button.title = masked ? copy.show : copy.hide;
      const glyph = icon(masked ? "hide" : "show", "inline");
      const old = button.querySelector(".hala-icon");
      if (glyph && old) old.replaceWith(glyph);
    };
    return button;
  }

  function amount(value, size, masked, copy) {
    return window.createAmount(value, { size, masked, maskedLabel: copy.hidden });
  }

  function trendLine(received, masked, copy) {
    const line = el("p", "br-trend");
    const arrow = icon("collapse", "inline");
    if (arrow) line.append(arrow);
    line.append(amount(received, "xs", masked, copy), el("span", "", copy.received));
    return line;
  }

  function createBalanceHero(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = copyFor(lang);
    const style = options.style === "card" ? "card" : "plain";
    const { balance = 0, received = 0, showTrend = true, remember } = options;
    let masked = recall(remember, Boolean(options.masked));

    const root = el("section", "br-hero");
    root.dataset.style = style;
    scope(root, lang);
    const label = el("p", "br-label", options.label || copy.available);
    label.id = `br-hero-${Math.random().toString(36).slice(2, 8)}`;
    root.setAttribute("aria-labelledby", label.id);
    const toggle = visibilityToggle(copy, style === "card");
    const row = el("div", "br-amount-row");
    const value = el("div", "br-amount");
    const trend = el("div", "br-trend-slot");

    if (style === "card") {
      const top = el("div", "br-card-top");
      top.append(label, toggle);
      row.append(value);
      root.append(top, row);
    } else {
      row.append(value, toggle);
      root.append(label, row);
    }
    if (showTrend) root.append(trend);

    if (style === "card") {
      const account = el("div", "br-account");
      const iban = el("span", "br-iban", options.iban || "SA57 3010 •••• 1951");
      const copyButton = el("button", "br-copy");
      copyButton.type = "button";
      const copyLabel = el("span", "", copy.copy);
      const glyph = icon("copy", "inline");
      if (glyph) copyButton.append(glyph);
      copyButton.append(copyLabel);
      const status = el("span", "br-sr");
      status.setAttribute("aria-live", "polite");
      copyButton.addEventListener("click", () => {
        if (navigator.clipboard) navigator.clipboard.writeText((options.ibanFull || iban.textContent).replace(/\s/g, "")).catch(() => {});
        copyLabel.textContent = copy.copied;
        status.textContent = copy.copied;
        cue(copyButton);
        window.clearTimeout(copyButton.timer);
        copyButton.timer = window.setTimeout(() => {
          copyLabel.textContent = copy.copy;
          status.textContent = "";
        }, 2000);
      });
      account.append(iban, copyButton, status);
      root.append(el("hr", "br-rule"), account);
    }

    function paint() {
      root.dataset.masked = masked ? "true" : "false";
      value.replaceChildren(amount(balance, "xl", masked, copy));
      trend.replaceChildren(trendLine(received, masked, copy));
      toggle.paint(masked);
    }

    toggle.addEventListener("click", () => {
      masked = !masked;
      keep(remember, masked);
      paint();
      cue(value);
      if (options.onToggle) options.onToggle(masked);
    });

    paint();
    root.isMasked = () => masked;
    return root;
  }

  function switcher(label, copy) {
    const chip = window.createButton({ label, variant: "secondary", size: "sm", role: "chip", icon: "expand", iconPosition: "trailing" });
    chip.classList.add("br-hit", "br-switcher");
    chip.removeAttribute("aria-pressed");
    chip.setAttribute("aria-haspopup", "menu");
    chip.setAttribute("aria-expanded", "false");
    chip.setAttribute("aria-label", `${copy.switcher}: ${label}`);
    return chip;
  }

  function iconButton(name, label, options = {}) {
    const button = window.createButton({ variant: "secondary", size: "sm", icon: name, iconOnly: true, ariaLabel: label, dot: options.dot });
    button.classList.add("br-hit");
    button.title = label;
    return button;
  }

  function createAccountHeader(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = copyFor(lang);
    const style = options.style === "compact" ? "compact" : "greeting";
    const root = el("header", "br-account-header");
    root.dataset.style = style;
    scope(root, lang);
    const lead = el("div", "br-lead");
    const actions = el("div", "br-actions");

    if (style === "greeting") {
      const avatar = el("span", "br-avatar", options.initials || "AA");
      avatar.dataset.tone = String(options.tone || 4);
      avatar.setAttribute("aria-hidden", "true");
      const stack = el("div", "br-greeting");
      stack.append(el("span", "br-hello", options.greeting || copy.greeting), switcher(options.company || "Khamis Arabia Trading", copy));
      lead.append(avatar, stack);
      actions.append(iconButton("notifications", copy.notifications, { dot: true }));
    } else {
      const logo = el("a", "br-logo br-hit");
      logo.href = "#";
      logo.setAttribute("aria-label", copy.home);
      const mark = el("img");
      mark.src = SYMBOL;
      mark.alt = "";
      logo.append(mark);
      lead.append(logo, switcher(options.company || (lang === "ar" ? "الأعمال" : "Business"), copy));
      actions.append(
        iconButton("support-24", copy.support),
        iconButton("settings", copy.settings),
        iconButton("notifications", copy.notifications, { dot: true }),
      );
    }
    if (options.onSwitch) lead.querySelector(".br-switcher").addEventListener("click", options.onSwitch);
    root.append(lead, actions);
    return root;
  }

  function createBalanceHeader(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = copyFor(lang);
    const { balance = 0, trend = 0, remember } = options;
    let masked = recall(remember, Boolean(options.masked));

    const root = el("section", "br-balance-header");
    scope(root, lang);
    const row = el("div", "br-bh-row");
    const left = el("div", "br-bh-balance");
    const account = switcher(options.account || (lang === "ar" ? "الحساب الرئيسي •• 1951" : "Main account •• 1951"), copy);
    root.setAttribute("aria-label", options.account || copy.available);
    const amountRow = el("div", "br-amount-row");
    const value = el("div", "br-amount");
    const toggle = visibilityToggle(copy, false);
    amountRow.append(value, toggle);
    const trendRow = el("div", "br-bh-trend");
    const caption = el("span", "br-caption", copy.vs);
    left.append(account, amountRow, trendRow);

    const actions = el("div", "br-bh-actions");
    const topUp = window.createButton({ label: copy.topUp, variant: "secondary", size: "md" });
    const transfer = window.createButton({ label: copy.transfer, variant: "primary", size: "md" });
    if (options.onTopUp) topUp.addEventListener("click", options.onTopUp);
    if (options.onTransfer) transfer.addEventListener("click", options.onTransfer);
    actions.append(topUp, transfer);
    row.append(left, actions);
    root.append(row);

    function paint() {
      root.dataset.masked = masked ? "true" : "false";
      value.replaceChildren(amount(balance, "xl", masked, copy));
      const badge = window.createBadge({ variant: "trend", tone: trend >= 0 ? "up" : "down", icon: true, size: "sm", label: masked ? "••••" : `${Math.abs(trend).toFixed(1)}%` });
      badge.dir = "ltr";
      trendRow.replaceChildren(badge, caption);
      toggle.paint(masked);
    }

    toggle.addEventListener("click", () => {
      masked = !masked;
      keep(remember, masked);
      paint();
      cue(value);
    });

    paint();
    return root;
  }

  function createPerforatedDivider() {
    const node = el("div", "br-perforation");
    node.setAttribute("aria-hidden", "true");
    node.append(el("span", "br-notch"), el("span", "br-dashes"), el("span", "br-notch"));
    return node;
  }

  function createReceiptCard(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = copyFor(lang);
    const root = el("article", "br-receipt");
    scope(root, lang);
    let state = STATUS[options.state] ? options.state : "review";

    function header() {
      const head = el("div", "br-receipt-head");
      const tile = el("span", "br-status");
      tile.dataset.tone = STATUS[state].tone;
      const glyph = icon(STATUS[state].icon, "feature");
      if (glyph) tile.append(glyph);
      tile.setAttribute("aria-hidden", "true");
      const title = el("h3", "br-receipt-title", copy[state]);
      title.id = `br-receipt-${Math.random().toString(36).slice(2, 8)}`;
      root.setAttribute("aria-labelledby", title.id);
      head.append(tile, title, window.createAmount(options.amount || 0, { size: "l" }), el("p", "br-recipient", `${copy.to} ${options.recipient || ""}`));
      return head;
    }

    function rows() {
      const list = [
        { label: copy.bank, value: options.bank },
        { label: copy.iban, value: options.iban, style: "mono" },
        { label: copy.date, value: options.date },
      ];
      if (state !== "review" && options.reference) list.push({ label: copy.reference, value: options.reference, style: "mono" });
      list.push({ label: copy.fee, value: options.fee || 0, style: "amount" });
      list.push({ label: copy.total, value: options.total == null ? (options.amount || 0) + (options.fee || 0) : options.total, style: "total" });
      const details = window.createDetails(list.filter((row) => row.value != null && row.value !== ""));
      details.classList.add("br-details");
      return details;
    }

    function actions() {
      if (options.showActions === false) return null;
      const bar = el("div", "br-receipt-actions");
      if (state === "review") {
        const confirm = window.createButton({ label: copy.confirm, variant: "ink", size: "lg", icon: "face-id", block: true });
        confirm.addEventListener("click", () => {
          if (options.onConfirm) options.onConfirm(root, confirm);
        });
        bar.append(confirm);
      } else if (state === "success") {
        bar.append(
          window.createButton({ label: copy.share, variant: "secondary", size: "md" }),
          window.createButton({ label: copy.download, variant: "secondary", size: "md" }),
        );
      } else {
        bar.append(window.createButton({ label: copy.track, variant: "secondary", size: "md" }));
      }
      return bar;
    }

    function paint(animate) {
      root.dataset.state = state;
      const head = header();
      const bar = actions();
      root.replaceChildren(head, createPerforatedDivider(), rows());
      if (bar) root.append(bar);
      if (animate) {
        cue(head.querySelector(".br-status"));
        cue(root, "swap");
      }
    }

    root.setState = (next) => {
      if (!STATUS[next] || next === state) return;
      state = next;
      paint(true);
    };
    root.getState = () => state;
    paint(false);
    return root;
  }

  window.createBalanceHero = createBalanceHero;
  window.createAccountHeader = createAccountHeader;
  window.createBalanceHeader = createBalanceHeader;
  window.createReceiptCard = createReceiptCard;
  window.createPerforatedDivider = createPerforatedDivider;
})();
