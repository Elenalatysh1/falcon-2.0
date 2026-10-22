(function () {
  const page = document.querySelector('[data-page="fintech"]');
  if (!page || !window.createButton || !window.createInput || !window.createBadge || !window.createOtp) return;

  const AVAILABLE = 45000;
  const APPROVAL = 20000;
  const catalog = {
    confirm: "check",
    error: "x",
    income: "arrow-down-left",
    info: "info",
    next: "chevron-right",
    outgoing: "arrow-up-right",
    warning: "triangle-alert",
  };
  const banks = {
    "05": "Alinma Bank",
    10: "Saudi National Bank",
    15: "Bank AlBilad",
    20: "Riyad Bank",
    30: "Arab National Bank",
    45: "SAB",
    55: "Banque Saudi Fransi",
    60: "Bank AlJazira",
    65: "Saudi Investment Bank",
    80: "Al Rajhi Bank",
  };
  const transactions = [
    ["Al Baik · Olaya", "POS sale · Terminal T-0412", "mada •• 3301", "Today, 12:41", "", 86.25, "AB", "warning", "pill", "in"],
    ["Jarir Bookstore", "Card purchase · Marketing", "Visa •• 4417", "Today, 11:08", "", -1249, "JB", "error", "pill", ""],
    ["Nour Trading", "Transfer · Invoice INV-2041", "Al Rajhi · SA03 •• 7519", "Today, 09:30", "Pending", -25000, "AR", "ink", "tile", "out"],
    ["Careem", "Card purchase · Operations", "Visa •• 2086", "Today, 08:15", "Refunded", 38.5, "CA", "brand", "pill", "in"],
    ["Amazon.sa", "Online purchase", "Visa •• 4417", "Today, 07:52", "Declined", -420, "AM", "warning", "pill", ""],
    ["Payroll · October", "42 employees · WPS", "SNB · SA44 •• 1230", "Sun, 18 Oct", "Scheduled", -186400, "PR", "info", "tile", "out"],
  ];
  const statusTone = { Pending: "pending", Declined: "declined", Refunded: "neutral", Scheduled: "scheduled" };
  const store = { currency: "symbol", hide: false, tx: 2, step: 1, failed: false, approval: ["approved", "pending"], nafath: "wait", nafathLeft: 60 };
  let amountField;
  let continueButton;
  let mobileHelp;
  let mobileFigure;
  const chips = [];

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size) {
    const iconSet = window.halaIcons;
    const kebab = catalog[name] || name;
    if (!iconSet || !iconSet.icons[pascal(kebab)]) return null;
    const svg = iconSet.createElement(iconSet.icons[pascal(kebab)]);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    if (size) svg.dataset.size = size;
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-ft="${name}"]`);
  }

  function fmt(value) {
    return Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function readAmount() {
    if (!amountField) return 0;
    const input = amountField.querySelector("input");
    return parseFloat(String(input.value || "").replace(/,/g, "")) || 0;
  }

  function money(value, signed) {
    if (store.hide) return "••••••";
    const sign = signed && value > 0 ? "+ " : signed && value < 0 ? "− " : "";
    return `${sign}${fmt(value)}`;
  }

  function currencyMark(size) {
    if (store.currency === "code") return el("span", "ft-code", "SAR");
    const mark = el("span", "ft-sar");
    mark.dataset.size = size;
    mark.setAttribute("role", "img");
    mark.setAttribute("aria-label", "Saudi Riyal");
    return mark;
  }

  function amountText(value, sizeClass, tone, signed) {
    const row = el("span", `ft-amount ${sizeClass}`);
    if (!store.hide) row.append(currencyMark(sizeClass === "ft-hero" ? "hero" : sizeClass === "ft-large" ? "large" : sizeClass === "ft-medium" ? "medium" : sizeClass === "ft-inline" ? "inline" : "row"));
    const num = el("span", "ft-num", money(value, signed));
    if (tone) num.dataset.tone = tone;
    if (tone === "disabled") num.dataset.strike = "true";
    row.append(num);
    return row;
  }

  function live() {
    return createBadge({ label: "Live", variant: "feature", tone: "brand", size: "sm" });
  }

  function button(options, onClick) {
    const node = createButton(options);
    if (onClick) node.addEventListener("click", onClick);
    return node;
  }

  function writeAmount(next) {
    const input = amountField.querySelector("input");
    input.value = next;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function amountState() {
    const value = readAmount();
    const over = value > AVAILABLE;
    const approve = !over && value > APPROVAL;
    const empty = value <= 0;
    return { value, over, approve, empty };
  }

  function paintChips() {
    const { value } = amountState();
    chips.forEach(({ node, amount }) => {
      const on = value === amount;
      node.dataset.variant = on ? "ink" : "secondary";
      node.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function paintContinue() {
    if (!continueButton) return;
    const { value, over, approve, empty } = amountState();
    continueButton.disabled = over || empty;
    continueButton.dataset.variant = over || empty ? "secondary" : "primary";
    const label = continueButton.querySelector(".button-label");
    if (label) {
      label.textContent = over ? "Not enough balance" : empty ? "Enter amount" : approve ? "Continue · needs approval" : "Continue";
    }
    if (mobileHelp) {
      const hint = amountField.querySelector(".input-hint");
      mobileHelp.textContent = hint ? hint.textContent : "";
      mobileHelp.dataset.tone = amountField.dataset.error === "true" ? "error" : amountField.dataset.warning === "true" ? "warning" : "";
    }
    if (mobileFigure) {
      mobileFigure.replaceChildren(amountText(value, "ft-hero", over ? "disabled" : ""));
    }
  }

  function paintDisplays() {
    const sizes = mount("sizes");
    const variants = mount("variants");
    const arabic = mount("arabic");
    sizes.replaceChildren();
    variants.replaceChildren();
    arabic.replaceChildren();
    [
      ["Hero", "--type-amount-transfer", "ft-hero", 175000, "Account balance on Home and account pages. One per screen."],
      ["Large", "--type-amount-xl", "ft-large", 25000, "Review totals, success screens, card spend."],
      ["Medium", "--type-amount-drawer", "ft-medium", 1249, "KPI cards, list totals, chart tooltips."],
      ["Row", "--type-amount-m", "type-amount-m", 86.25, "Transaction rows and table cells. Currency often sits in the column header instead."],
      ["Inline", "--type-body-s-size", "ft-inline", 38.5, "Inside a sentence: “You sent SAR 38.50 to Careem.”"],
    ].forEach(([name, token, size, value, use]) => {
      const row = el("div", "ft-size-row");
      const meta = el("div");
      meta.append(el("strong", "", name), el("span", "ft-spec", token));
      row.append(meta, amountText(value, size), el("p", "ft-use", use));
      sizes.append(row);
    });
    [
      ["Money in", 86.25, "in", true, "", "Green and a plus sign. The only time an amount is colored."],
      ["Money out", -1249, "", true, "", "Ink with a true minus (U+2212). Never red for normal spending."],
      ["Pending", -25000, "muted", true, "Pending", "Muted until it settles. The balance says what is still pending."],
      ["Declined", -420, "disabled", true, "Declined", "Struck through: it never left the account."],
      ["Refund", 38.5, "in", true, "Refund", "Money in, labelled so it is not mistaken for income."],
      ["Foreign", 1200, "", false, "≈ SAR 4,503.00", "Original currency first, the SAR equivalent beside it."],
      ["Hidden", 0, "", false, "", "After Hide balances, or in a screenshot. The width stays fixed."],
      ["Zero", 0, "muted", false, "", "Show 0.00, not a dash, when a total is truly zero."],
    ].forEach(([name, value, tone, signed, tag, copy]) => {
      const card = el("div", "rule");
      const row = name === "Foreign"
        ? el("span", "ft-amount type-amount-m", store.hide ? "••••••" : "USD 1,200.00")
        : name === "Hidden"
          ? el("span", "ft-amount type-amount-m", "••••••")
          : amountText(value, "type-amount-m", tone, signed);
      if (tag && name !== "Foreign") row.append(createBadge({ label: tag, tone: statusTone[tag] || "neutral", size: "sm" }));
      if (name === "Foreign" && !store.hide) row.append(createBadge({ label: tag, tone: "neutral", size: "sm" }));
      card.append(el("span", "kicker quiet", name), row, el("span", "ft-use", copy));
      variants.append(card);
    });
    arabic.append(el("span", "kicker quiet", "Arabic · RTL"));
    arabic.append(el("span", "ft-quiet", "الرصيد المتاح"));
    const hero = amountText(175000, "ft-hero");
    hero.setAttribute("dir", "ltr");
    arabic.append(hero);
    arabic.append(el("p", "ft-use", "المبالغ تبقى بالأرقام اللاتينية ومن اليسار إلى اليمين، والعملة قبل الرقم."));
  }

  function avatar(initials, tone, shape) {
    const node = el("span", "ft-avatar", initials);
    node.dataset.tone = tone;
    if (shape) node.dataset.shape = shape;
    return node;
  }

  function direction(kind) {
    const node = el("span", "ft-dir");
    node.dataset.dir = kind;
    const glyph = icon(kind === "in" ? "income" : "outgoing", "inline");
    if (glyph) node.append(glyph);
    return node;
  }

  function paintRows() {
    const list = mount("rows");
    const mobile = mount("mobile-rows");
    list.replaceChildren();
    mobile.replaceChildren();
    transactions.forEach((item, index) => {
      const [name, detail, method, time, status, value, initials, tone, shape, dir] = item;
      const row = el("button", "ft-tx");
      row.type = "button";
      row.setAttribute("aria-pressed", store.tx === index ? "true" : "false");
      const who = el("div", "ft-who");
      const face = avatar(initials, tone, shape);
      if (dir) face.append(direction(dir));
      const copy = el("div", "ft-who-copy");
      copy.append(el("strong", "", name), el("span", "", `${detail} · ${time}`));
      who.append(face, copy);
      const amountTone = status === "Declined" ? "disabled" : status === "Pending" || status === "Scheduled" ? "muted" : value > 0 ? "in" : "";
      const amount = amountText(value, "type-amount-m", amountTone, true);
      amount.classList.add("ft-amount-cell");
      const state = el("span");
      if (status) state.append(createBadge({ label: status, tone: statusTone[status], size: "sm" }));
      const more = el("span");
      const glyph = icon("next", "inline");
      if (glyph) more.append(glyph);
      row.append(who, el("span", "ft-method", method), state, amount, more);
      row.addEventListener("click", () => {
        store.tx = index;
        paintRows();
      });
      list.append(row);

      if (index < 5) {
        const mobileRow = el("div", "ft-mobile-row");
        const mobileFace = avatar(initials, tone, shape);
        const text = el("div", "ft-who-copy");
        text.append(el("strong", "ft-mobile-name", name), el("span", "ft-mobile-sub", `${time.replace("Today, ", "")} · ${method.split(" · ")[0]}`));
        const side = el("div", "ft-side-amount");
        side.append(amountText(value, "type-amount-m", amountTone, true));
        if (status) side.append(createBadge({ label: status, tone: statusTone[status], size: "sm" }));
        mobileRow.append(mobileFace, text, side);
        mobile.append(mobileRow);
      }
    });
  }

  function paintReview() {
    const { value, over, approve, empty } = amountState();
    const web = mount("review");
    const sheet = mount("sheet");
    web.replaceChildren();
    sheet.replaceChildren();
    const amountLabel = store.hide ? "SAR ••••••" : `SAR ${fmt(value)}`;
    const rows = [
      ["From", "Main account", "SA57 •• 1951 · balance " + (store.hide ? "••••••" : "SAR 45,000.00"), true],
      ["To", "Nour Trading Co", "Al Rajhi Bank · SA03 •• 7519", true],
      ["Amount", amountLabel, "", true],
      ["Fee", "Free", "Local transfer via sarie", false],
      ["VAT", store.hide ? "••••••" : "SAR 0.00", "15% on fees", true],
      ["Arrives", approve ? "After approval, within minutes" : "Today, within minutes", approve ? "Abdulaziz Ali approves first" : "Sun–Thu 24/7 via sarie", false],
      ["Reference", "TRF-88213", "Invoice INV-2041", true],
    ];
    const list = el("div", "ft-review");
    rows.forEach(([key, main, sub, mono]) => {
      const row = el("div", "ft-review-row");
      const valueNode = el("div", "ft-review-value");
      const primary = el("strong", mono ? "ft-mono" : "", main);
      if (key === "Fee") primary.dataset.tone = "success";
      if (key === "Amount" && over) primary.dataset.tone = "error";
      valueNode.append(primary);
      if (sub) valueNode.append(el("span", mono && key !== "To" ? "ft-mono" : "", sub));
      row.append(el("span", "ft-review-key", key), valueNode);
      if (key === "Amount") {
        row.append(button({ label: "Edit", variant: "ghost", size: "sm" }, () => {
          location.hash = "#fintech-input";
        }));
      } else if (key === "Reference") {
        row.append(button({ label: "Copy", variant: "ghost", size: "sm", icon: "copy" }, async () => {
          try { await navigator.clipboard.writeText("TRF-88213"); } catch (error) { /* clipboard may be blocked */ }
        }));
      } else row.append(el("span"));
      list.append(row);
    });
    const total = el("div", "ft-total");
    total.append(el("strong", "", "Total debited"), el("span", "ft-large ft-mono", amountLabel));
    list.append(total);
    const note = window.createFeedback ? createFeedback({
      kind: "alert",
      tone: over ? "error" : approve ? "warning" : "neutral",
      title: over ? "Amount is above your available balance. Edit the amount to continue." : approve ? "This transfer needs approval. We'll send it as soon as Abdulaziz approves." : "Transfers can't be cancelled once sent. Check the IBAN before you continue.",
      icon: over ? "error" : approve ? "warning" : "info",
    }) : el("p", "ft-use", "");
    const actions = el("div", "ft-actions");
    actions.append(button({
      label: over ? "Not enough balance" : approve ? "Send for approval" : `Send ${amountLabel}`,
      variant: over || empty ? "secondary" : "primary",
      disabled: over || empty,
    }));
    web.append(list, note, actions);

    const hero = el("div", "ft-sheet-hero");
    hero.append(el("span", "ft-quiet", "You're sending"), el("span", "ft-large ft-mono", store.hide ? "••••••" : fmt(value)), el("span", "", "to Nour Trading"));
    const sheetRows = el("div", "ft-sheet-list");
    [
      ["From", "Main •• 1951"],
      ["Bank", "Al Rajhi Bank"],
      ["IBAN", "SA03 •• 7519"],
      ["Fee", "Free"],
      ["Arrives", approve ? "After approval" : "Within minutes"],
    ].forEach(([key, text]) => {
      const row = el("div", "ft-sheet-row");
      row.append(el("span", "", key), el("span", key === "IBAN" || key === "From" ? "ft-mono" : "", text));
      sheetRows.append(row);
    });
    const confirm = button({
      label: over ? "Not enough balance" : approve ? "Send for approval" : "Confirm with OTP",
      variant: over || empty ? "secondary" : "primary",
      block: true,
      disabled: over || empty,
    });
    sheet.append(el("span", "ft-handle"), hero, sheetRows, confirm);
    const caption = page.querySelector("[data-ft='timeline-caption']");
    if (caption) caption.textContent = `Transfer TRF-88213 · ${amountLabel} to Nour Trading`;
  }

  function stepMark(state) {
    const mark = el("span", "ft-step-mark");
    mark.dataset.state = state;
    if (state === "done") {
      const glyph = icon("confirm", "inline");
      if (glyph) mark.append(glyph);
    } else if (state === "failed") {
      const glyph = icon("error", "inline");
      if (glyph) mark.append(glyph);
    } else mark.append(el("span", "ft-dot"));
    return mark;
  }

  function timelineModel() {
    const events = [
      ["Created", "Omar Bakr", "09:30"],
      ["Approved", "Abdulaziz Ali", "09:42"],
      ["Sent to bank", "via sarie", "09:43"],
      ["Received", "Nour Trading · Al Rajhi", "09:44"],
    ];
    return events.map(([title, who, time], index) => {
      const failed = store.failed && index === 2;
      const done = !failed && index < store.step && !(store.failed && index > 2);
      const current = !store.failed && index === store.step;
      let state = "upcoming";
      if (failed) state = "failed";
      else if (done) state = "done";
      else if (current) state = "current";
      return {
        title: failed ? "Returned" : title,
        who: failed ? "Beneficiary bank rejected it" : who,
        time: done || failed ? time : current ? "In progress" : "—",
        state,
        line: done && index + 1 < store.step && !store.failed,
        last: index === events.length - 1,
      };
    });
  }

  function paintTimeline() {
    const track = mount("timeline");
    const vertical = mount("timeline-mobile");
    const headline = mount("timeline-head");
    track.replaceChildren();
    vertical.replaceChildren();
    const heads = ["", "Waiting for Abdulaziz to approve", "Approved · sending to Al Rajhi Bank", "Sent · arrives within minutes", "Received by Nour Trading at 09:44"];
    headline.textContent = store.failed ? "Returned · the amount is back in your account" : heads[store.step];
    headline.dataset.tone = store.failed ? "error" : store.step === 4 ? "success" : "";
    timelineModel().forEach((item) => {
      const column = el("div");
      const rail = el("div", "ft-who");
      rail.append(stepMark(item.state));
      if (!item.last) {
        const line = el("span", "ft-step-line");
        line.dataset.on = item.line ? "true" : "false";
        rail.append(line);
      }
      const copy = el("div", "ft-step-copy");
      copy.dataset.state = item.state;
      const time = el("span", "ft-time", item.time);
      if (item.state === "current") time.dataset.tone = "now";
      copy.append(el("strong", "", item.title), el("span", "", item.who), time);
      column.append(rail, copy);
      track.append(column);

      const row = el("div", "ft-vstep");
      row.dataset.state = item.state;
      const vrail = el("div", "ft-vrail");
      vrail.append(stepMark(item.state));
      if (!item.last) {
        const line = el("span", "ft-vline");
        line.dataset.on = item.line ? "true" : "false";
        vrail.append(line);
      }
      const body = el("div", "ft-who");
      body.append(copy.cloneNode(true));
      row.append(vrail, body);
      vertical.append(row);
    });
    const next = mount("timeline-next");
    if (next) next.disabled = store.failed || store.step >= 4;
  }

  function paintApproval() {
    const [finance, owner] = store.approval;
    const rejected = owner === "rejected";
    const done = owner === "approved";
    const root = mount("approval");
    const status = mount("approval-status");
    const hint = mount("approval-hint");
    const actions = mount("approval-actions");
    const comment = mount("approval-comment");
    root.replaceChildren();
    const people = [
      ["Omar Bakr", "Requester", "OB", "warning", "submitted", "09:30"],
      ["Sara Al-Qahtani", "Finance manager", "SQ", "scheduled", finance, "09:42"],
      ["Abdulaziz Ali", "Owner", "AA", "info", owner, done || rejected ? "Just now" : "Since 09:42"],
      ["Hala", done ? "Sent via sarie" : rejected ? "Not sent" : "Sends the transfer", "H", "ink", done ? "sent" : rejected ? "cancelled" : "upcoming", done ? "Just now" : ""],
    ];
    const labels = { submitted: "Submitted", approved: "Approved", pending: "Waiting", rejected: "Rejected", sent: "Sent", cancelled: "Cancelled", upcoming: "Next" };
    const tones = { submitted: "neutral", approved: "settled", pending: "pending", rejected: "declined", sent: "settled", cancelled: "neutral", upcoming: "neutral" };
    people.forEach((person, index) => {
      const [name, role, initials, tone, state, time] = person;
      const node = el("div", "ft-node");
      const card = el("div", "ft-node-card");
      const face = avatar(initials, tone, initials === "H" ? "tile" : "pill");
      face.classList.add("ft-node-mark");
      face.dataset.state = state === "pending" ? "current" : state === "rejected" || state === "cancelled" ? "failed" : state === "approved" || state === "submitted" || state === "sent" ? "done" : "upcoming";
      card.append(face, el("strong", "", name), el("span", "ft-quiet", role), createBadge({ label: labels[state], tone: tones[state], size: "sm" }), el("span", "ft-time", time));
      node.append(card);
      if (index < people.length - 1) {
        const line = el("span", "ft-node-line");
        const linked = index === 0 || (index === 1 && (done || rejected)) || (index === 2 && done);
        line.dataset.on = linked ? "true" : "false";
        node.append(line);
      }
      root.append(node);
    });
    status.replaceChildren(createBadge({
      label: done ? "Approved · sent" : rejected ? "Rejected" : "1 of 2 approved",
      tone: done ? "settled" : rejected ? "declined" : "pending",
    }));
    hint.textContent = done ? "Omar and Sara were notified. The transfer was sent at once." : rejected ? "Omar was notified with the reason and can edit and resubmit." : "Abdulaziz has been waiting 2 h. Reminders go out after 4 h.";
    actions.replaceChildren();
    if (!done && !rejected) {
      actions.append(
        button({ label: "Reject", variant: "destructive", size: "md" }, () => {
          store.approval = [finance, "rejected"];
          paintApproval();
        }),
        button({ label: "Approve as Abdulaziz", variant: "ink", size: "md" }, () => {
          store.approval = [finance, "approved"];
          store.step = Math.max(store.step, 2);
          paintApproval();
          paintTimeline();
        })
      );
    } else {
      actions.append(button({ label: "Reset", variant: "secondary", size: "md" }, () => {
        store.approval = ["approved", "pending"];
        paintApproval();
      }));
    }
    comment.replaceChildren();
    if (rejected) {
      comment.append(createFeedback({
        kind: "alert",
        tone: "error",
        title: "Abdulaziz Ali rejected",
        description: "Please attach the signed invoice and resubmit.",
      }));
    }
  }

  function ibanCheck(bban) {
    const moved = `${bban}SA00`.replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55));
    let mod = 0;
    for (const char of moved) mod = (mod * 10 + Number(char)) % 97;
    return String(98 - mod).padStart(2, "0");
  }

  function makeIban(bank, account) {
    const body = `${bank}${account}`;
    return `SA${ibanCheck(body)}${body}`;
  }

  function fillIban(value) {
    const input = page.querySelector("[data-ft='iban-field'] input");
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function paintNafath() {
    const root = mount("nafath");
    if (!root) return;
    root.replaceChildren();
    const waiting = store.nafath === "wait";
    const approved = store.nafath === "done";
    const expired = store.nafath === "expired";
    const stack = el("div", "ft-nafath");
    stack.append(el("h3", "type-heading-m", approved ? "Approved in Nafath" : expired ? "Request expired" : "Approve in the Nafath app"));
    stack.append(el("p", "ft-use", approved ? "Identity confirmed. Sending the transfer now." : expired ? "No approval within 60 seconds. Send a new request." : "Open Nafath on your phone and choose the number below."));
    if (waiting) stack.append(el("span", "ft-nafath-num type-amount-xl", "42"));
    if (approved) {
      const mark = el("span", "ft-step-mark");
      mark.dataset.state = "done";
      const glyph = icon("confirm");
      if (glyph) mark.append(glyph);
      stack.append(mark);
    }
    const meter = el("div", "ft-meter");
    const track = el("span", "ft-meter-track");
    const fill = el("span", "ft-meter-fill");
    fill.style.width = approved ? "100%" : `${(store.nafathLeft / 60) * 100}%`;
    fill.dataset.tone = approved ? "" : expired ? "error" : store.nafathLeft < 15 ? "warning" : "";
    track.append(fill);
    const timer = el("span", "ft-time", approved ? "Done" : expired ? "Expired" : `0:${String(store.nafathLeft).padStart(2, "0")} left`);
    meter.append(track, timer);
    stack.append(meter);
    const actions = el("div", "ft-actions");
    if (waiting) {
      actions.append(button({ label: "Approve in Nafath", variant: "ink", size: "md" }, () => {
        store.nafath = "done";
        paintNafath();
      }));
    }
    actions.append(button({ label: expired || approved ? "Send new request" : "Send again", variant: "secondary", size: "md" }, () => {
      store.nafath = "wait";
      store.nafathLeft = 60;
      paintNafath();
    }));
    stack.append(actions);
    root.append(stack);
  }

  const settings = mount("settings");
  settings.append(el("span", "kicker quiet", "Page settings"));
  settings.append(createButtonGroup({
    kind: "segment",
    size: "sm",
    label: "Currency",
    value: "symbol",
    options: [
      { label: "Riyal symbol", value: "symbol" },
      { label: "SAR code", value: "code" },
    ],
    onChange(value) {
      store.currency = value;
      paintDisplays();
      paintRows();
      paintReview();
      paintContinue();
    },
  }));
  const hideSlot = el("span");
  settings.append(hideSlot);
  function paintHide() {
    hideSlot.replaceChildren(button({
      label: store.hide ? "Show balances" : "Hide balances",
      icon: store.hide ? "show" : "hide",
      variant: "secondary",
      size: "sm",
    }, () => {
      store.hide = !store.hide;
      paintHide();
      paintDisplays();
      paintRows();
      paintReview();
      paintContinue();
    }));
  }
  paintHide();
  const note = el("span", "ft-note");
  const mark = el("span", "ft-sar");
  mark.dataset.size = "inline";
  note.append(mark, document.createTextNode("Official Saudi Riyal sign · media/sar-symbol.svg"));
  settings.append(note);

  paintDisplays();

  const inputCard = mount("input");
  amountField = createInput({
    label: "Amount",
    value: "25000",
    format: "amount",
    prefix: "SAR",
    placeholder: "0.00",
    emphasis: true,
    amount: {
      limit: AVAILABLE,
      approval: APPROVAL,
      available: "Free · arrives within minutes via sarie. Available SAR 45,000.00",
      approvalNote: "Above SAR 20,000.00 needs approval from Abdulaziz Ali.",
      over: "Above your available balance. Lower the amount or add money.",
    },
    onChange() {
      paintChips();
      paintContinue();
      paintReview();
    },
  });
  inputCard.append(amountField);
  const chipRow = el("div", "ft-chips");
  [[1000, "1,000"], [5000, "5,000"], [10000, "10,000"], [AVAILABLE, "Max"]].forEach(([amount, label]) => {
    const node = button({ label, variant: "secondary", size: "sm" }, () => writeAmount(String(amount)));
    chips.push({ node, amount });
    chipRow.append(node);
  });
  inputCard.append(chipRow);
  const states = el("div", "ft-states");
  [
    ["Format", "success", "Separators as you type. Two decimals, nine digits."],
    ["Approval", "warning", "Over 20,000: an amber note, and the transfer can still be sent."],
    ["Error", "error", "Over the balance: the field turns red and the button stops."],
    ["Paste", "info", "“SAR 1,250.5” pastes as 1,250.50."],
  ].forEach(([name, tone, copy]) => {
    const card = el("div", "ft-state");
    card.dataset.tone = tone;
    card.append(el("span", "kicker quiet", name), el("span", "ft-use", copy));
    states.append(card);
  });
  inputCard.append(states);

  const phone = mount("keypad");
  phone.append(el("strong", "", "To Nour Trading"));
  mobileFigure = el("div", "ft-phone-amount");
  phone.append(mobileFigure);
  mobileHelp = el("p", "ft-help");
  phone.append(mobileHelp);
  const keys = el("div", "ft-keys");
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].forEach((key) => {
    keys.append(button({
      label: key === "del" ? "Delete" : key,
      variant: "secondary",
      size: "md",
      ariaLabel: key === "del" ? "Delete" : key === "." ? "Decimal point" : key,
    }, () => {
      const current = String(amountField.querySelector("input").value || "").replace(/,/g, "");
      writeAmount(key === "del" ? current.slice(0, -1) : current + key);
    }));
  });
  phone.append(keys);
  continueButton = button({ label: "Continue", variant: "primary", block: true });
  phone.append(continueButton);

  paintRows();
  const rules = mount("row-rules");
  [
    ["1", "Leading tile", "A person or merchant is a circle. A bank or account is a rounded square. Transfers add a small direction mark."],
    ["2", "Title", "Counterparty name, one line, truncated."],
    ["3", "Subtitle", "What it was, then the time. On mobile: time, then method."],
    ["4", "Status", "Only exceptions: Pending, Declined, Refunded, Scheduled. Settled shows nothing."],
    ["5", "Amount", "Mono, signed, and aligned to the end. Green only for money in."],
    ["6", "Hit area", "The whole row opens details. A drawer on web, a new screen on mobile."],
    ["7", "Grouping", "Group by day with mono captions: Today, Yesterday, 14 Oct."],
  ].forEach(([number, title, copy]) => {
    const row = el("div", "ft-rule");
    row.append(el("span", "ft-index", number), el("strong", "", title), el("span", "ft-use", copy));
    rules.append(row);
  });

  paintReview();
  const timelineActions = mount("timeline-actions");
  const nextEvent = button({ label: "Next event", variant: "ink", size: "sm" }, () => {
    if (store.failed || store.step >= 4) return;
    store.step += 1;
    paintTimeline();
  });
  nextEvent.dataset.ft = "timeline-next";
  timelineActions.append(
    nextEvent,
    button({ label: "Simulate return", variant: "destructive", size: "sm" }, () => {
      store.failed = true;
      store.step = Math.max(store.step, 2);
      paintTimeline();
    }),
    button({ label: "Reset", variant: "secondary", size: "sm" }, () => {
      store.step = 1;
      store.failed = false;
      paintTimeline();
    })
  );
  paintTimeline();
  const stepStates = mount("step-states");
  [
    ["Done", "done", "Green fill and a check. The time is shown."],
    ["Current", "current", "Green ring and “In progress”."],
    ["Upcoming", "upcoming", "Gray ring, gray text, no time."],
    ["Failed", "failed", "Red fill and a cross. The headline says where the money is."],
    ["Scheduled", "scheduled", "A future date on the first step."],
  ].forEach(([name, state, copy]) => {
    const row = el("div", "ft-rule");
    row.append(stepMark(state), el("strong", "", name), el("span", "ft-use", copy));
    stepStates.append(row);
  });

  paintApproval();
  const compact = mount("compact");
  [
    ["Transfer · SAR 25,000", "1 of 2", "pending", [["SQ", "scheduled"], ["AA", "info"]]],
    ["Card limit · SAR 10,000", "Waiting", "pending", [["AA", "info"]]],
    ["Payroll · October", "2 of 2", "settled", [["SQ", "scheduled"], ["AA", "info"]]],
  ].forEach(([label, state, tone, faces]) => {
    const row = el("div", "ft-compact");
    const stack = el("div", "ft-stack");
    faces.forEach(([initials, faceTone]) => stack.append(avatar(initials, faceTone)));
    row.append(stack, el("span", "", label), createBadge({ label: state, tone, size: "sm" }));
    compact.append(row);
  });
  const chainTypes = mount("chain-types");
  [
    ["Sequential", "Finance, then Owner. Each person sees it only when it is their turn. Used above SAR 20,000."],
    ["Any of a group", "“Any 1 of 2 finance managers.” Show the group as one step with stacked avatars."],
    ["Self-approval blocked", "The requester can never approve their own request, even with the role."],
  ].forEach(([title, copy]) => {
    const row = el("div", "ft-line");
    row.append(el("strong", "", title), el("span", "ft-use", copy));
    chainTypes.append(row);
  });

  const otpMount = mount("otp");
  const otpSwitch = el("div");
  const otpBody = el("div");
  otpMount.append(otpSwitch, otpBody);
  function showOtp(mode) {
    otpBody.replaceChildren();
    if (mode === "nafath") {
      const slot = el("div");
      slot.dataset.ft = "nafath";
      otpBody.append(slot);
      paintNafath();
      return;
    }
    otpBody.append(createOtp({
      title: "Enter the 6-digit code",
      description: "Sent to +966 50 •• ••26 to confirm the transfer to Nour Trading.",
      match: "123456",
      verified: "Transfer confirmed. Sending now.",
      wrong: "Wrong code. Attempts left, then Nafath.",
      countdown: 30,
    }));
  }
  otpSwitch.append(createButtonGroup({
    kind: "segment",
    size: "sm",
    label: "Confirmation",
    value: "sms",
    options: [
      { label: "SMS code", value: "sms" },
      { label: "Nafath app", value: "nafath" },
    ],
    onChange: showOtp,
  }));
  showOtp("sms");
  const otpStates = mount("otp-states");
  [
    ["Empty", "", "", "Focus on the first box. Numeric keypad."],
    ["Typing", "482", "filled", "Focus moves on. Backspace moves back."],
    ["Error", "111111", "error", "Red, then it clears. Attempts are counted."],
    ["Success", "123456", "success", "Green, then the screen moves on."],
    ["Locked", "", "disabled", "Five minutes after 3 wrong codes. Offer Nafath."],
  ].forEach(([name, value, status, copy]) => {
    const row = el("div", "ft-otp-row");
    const sample = createOtp({ length: 6, value, status, interactive: false, active: name === "Typing" ? 3 : -1 });
    const text = el("div");
    text.append(el("strong", "", name), el("span", "ft-use", copy));
    row.append(sample, text);
    otpStates.append(row);
  });
  setInterval(() => {
    if (store.nafath !== "wait" || !mount("nafath")) return;
    store.nafathLeft = Math.max(0, store.nafathLeft - 1);
    if (store.nafathLeft === 0) store.nafath = "expired";
    if (mount("nafath")) paintNafath();
  }, 1000);

  const ibanField = createInput({
    label: "IBAN",
    format: "iban",
    placeholder: "SA00 0000 0000 0000 0000 0000",
    iban: { banks, check: true, done: "Checksum matches. The account name is checked on the next step." },
  });
  mount("iban-field").append(ibanField);
  const samples = mount("iban-samples");
  const goodRajhi = makeIban("80", "000000608010167519");
  const goodSnb = makeIban("10", "000012345678901234");
  [
    ["Al Rajhi · valid", goodRajhi],
    ["SNB · valid", goodSnb],
    ["Wrong digit", `${goodRajhi.slice(0, 23)}${(Number(goodRajhi[23]) + 1) % 10}`],
    ["Too short", goodRajhi.slice(0, 15)],
    ["Clear", ""],
  ].forEach(([label, value]) => {
    samples.append(button({ label, variant: "secondary", size: "sm" }, () => fillIban(value)));
  });
  const parts = mount("iban-parts");
  [
    ["Country", "SA", "brand"],
    ["Check", "03", "warning"],
    ["Bank", "80", "info"],
    ["Account · 18 digits", "0000 0060 8010 1675 19", "neutral"],
  ].forEach(([name, value, tone]) => {
    const part = el("span", "ft-part");
    const chip = createBadge({ label: value, tone, size: "sm" });
    part.append(chip, el("span", "", name));
    parts.append(part);
  });
  const bankList = mount("banks");
  Object.entries(banks).forEach(([code, name]) => {
    const row = el("div", "ft-bank");
    row.append(avatar(name.slice(0, 2).toUpperCase(), "ink", "tile"), el("span", "ft-spec", code), el("span", "", name));
    bankList.append(row);
  });

  const ruleList = mount("rules");
  [
    [true, "Render every amount with the amount styles, never as ad-hoc text."],
    [true, "Show the available balance next to any amount the user types."],
    [true, "Every money movement ends with a review summary: total, fees, and arrival time."],
    [true, "Say what happens next in the status headline, in plain words."],
    [true, "Show who approves, and why, before the user submits."],
    [true, "Mask IBANs and card numbers on review and history. Show the full number only on demand."],
    [false, "Don't color normal spending red. Red means a problem."],
    [false, "Don't clear an OTP the user can still correct. Clear it only after a wrong full code."],
    [false, "Don't let the requester approve their own request."],
    [false, "Don't accept an IBAN without the checksum check."],
  ].forEach(([ok, text]) => {
    const card = el("div", "rule ft-do");
    const markNode = el("span", "ft-do-mark");
    markNode.dataset.ok = ok ? "true" : "false";
    const glyph = icon(ok ? "confirm" : "error", "inline");
    if (glyph) markNode.append(glyph);
    card.append(markNode, el("span", "", text));
    ruleList.append(card);
  });

  const signRules = mount("sign-rules");
  [
    ["Size", "Match the number's cap height. Use the amount token next to it, not a one-off size."],
    ["Spacing", "Keep a small gap between the sign and the number. They never touch."],
    ["Color", "Same as the number, or muted beside a hero balance. Green only with money in."],
    ["Placement", "Before the number, in English and Arabic."],
    ["Fallback", "Use SAR in SMS, plain email, CSV, and anywhere the symbol can't render."],
    ["Don't", "Don't use the old riyal ligature, redraw the sign, or mix the sign and SAR on one screen."],
  ].forEach(([title, copy]) => {
    const row = el("div", "ft-line");
    row.append(el("strong", "", title), el("span", "ft-use", copy));
    signRules.append(row);
  });
  const formats = mount("formats");
  [
    ["Sign", "− 1,249.00", "-1249.00"],
    ["Decimals", "25,000.00", "25000"],
    ["Separators", "175,000.00", "175.000,00"],
    ["Currency", "Riyal sign or SAR, before", "86.25 SR"],
    ["Large values", "SAR 1.2M, charts only", "SAR 1,2 million"],
    ["Figures", "tabular-nums", "proportional"],
    ["Copy", "Send SAR 25,000.00", "Send money"],
  ].forEach(([title, ok, no]) => {
    const row = el("div", "ft-format");
    row.append(el("strong", "", title), el("span", "ft-ok", ok), el("span", "ft-no", no));
    formats.append(row);
  });

  paintChips();
  paintContinue();
  paintReview();
})();
