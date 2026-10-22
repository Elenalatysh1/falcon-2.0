(function () {
  const page = document.querySelector('[data-page="banking"]');
  if (!page || !window.createButton || !window.createInput || !window.createBadge || !window.createChoice || !window.createButtonGroup || !window.createFeedback) return;

  const tones = ["brand", "info", "warning", "scheduled", "error"];
  const banks = { "05": "Alinma Bank", 10: "SNB", 20: "Riyad Bank", 45: "SAB", 80: "Al Rajhi Bank" };
  const seed = [
    ["b1", "Nour Trading Co", "Al Rajhi Bank", "7519", true],
    ["b2", "Jarir Bookstore", "SNB", "2210", true],
    ["b3", "Omar Bakr", "Riyad Bank", "0846", true],
    ["b4", "Gulf Logistics LLC", "Emirates NBD", "3391", false],
    ["b5", "Sara Al-Qahtani", "Alinma Bank", "5127", true],
  ];
  const limits = [
    ["ads", "Advertising", 3120],
    ["travel", "Travel", 410],
    ["soft", "Software", 1490],
  ];
  const toggles = [
    ["online", "Online payments", "Websites and apps", "language"],
    ["atm", "ATM withdrawals", "Cash in Saudi Arabia", "cash"],
    ["abroad", "Payments abroad", "Foreign currency, 2.5% FX fee", "language"],
  ];
  const payments = [
    ["p1", "Nour Trading Co", "INV-2041", 25000],
    ["p2", "Gulf Logistics LLC", "INV-2052", 18400],
    ["p3", "Jarir Bookstore", "PO-7781", 8900],
    ["p4", "Al Safi Catering", "INV-118", 4650.5],
    ["p5", "Elm Software", "SUB-OCT", 12000],
    ["p6", "Omar Bakr", "Expense claim", 2349.75],
  ];
  const store = {
    q: "",
    sel: "b1",
    adding: false,
    extra: [],
    frozen: false,
    rev: {},
    auth: "",
    pin: "",
    lim: { ads: 5000, travel: 3000, soft: 1500 },
    tg: { online: true, atm: false, abroad: true },
    spent: 3720,
    funded: false,
    rows: {},
    done: {},
    up: "idle",
    ft: "local",
  };
  let toastTimer;
  let uploadTimer;
  let nameField;
  let ibanField;
  let amountField;
  let feeGroup;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-bk="${name}"]`);
  }

  function money(value) {
    return Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  function icon(name) {
    const iconSet = window.halaIcons;
    const map = { confirm: "check", error: "x" };
    const kebab = map[name] || name;
    const pascal = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    if (!iconSet || !iconSet.icons[pascal]) return null;
    const svg = iconSet.createElement(iconSet.icons[pascal]);
    svg.classList.add("hala-icon");
    svg.dataset.size = "inline";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function button(options, onClick) {
    const node = createButton(options);
    if (onClick) node.addEventListener("click", onClick);
    return node;
  }

  function live(label) {
    return createBadge({ label: label || "Live", variant: "feature", tone: "brand", size: "sm" });
  }

  function people() {
    return seed.concat(store.extra).map((row, index) => ({
      id: row[0], name: row[1], bank: row[2], last4: row[3], verified: row[4], tone: tones[index % tones.length],
    }));
  }

  function filtered() {
    const q = store.q.trim().toLowerCase();
    return people().filter((person) => !q || person.name.toLowerCase().includes(q) || person.bank.toLowerCase().includes(q) || person.last4.includes(q));
  }

  function selected() {
    return people().find((person) => person.id === store.sel) || people()[0];
  }

  function revealed(key) {
    return store.rev[key] > Date.now();
  }

  function secs(key) {
    return Math.max(0, Math.ceil((store.rev[key] - Date.now()) / 1000));
  }

  function toast(message) {
    const slot = mount("toast");
    slot.replaceChildren(createFeedback({ kind: "toast", tone: "success", title: message }));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => slot.replaceChildren(), 2600);
  }

  function grant(key) {
    store.auth = "";
    store.pin = "";
    store.rev[key] = Date.now() + 30000;
    paintPin();
    paintCard();
    paintMask();
  }

  function hide(key) {
    delete store.rev[key];
    paintCard();
    paintMask();
  }

  function ask(key) {
    if (revealed(key)) {
      hide(key);
      return;
    }
    store.auth = key;
    store.pin = "";
    paintPin();
  }

  function meterTone(ratio, warnAt) {
    if (ratio >= 1) return "error";
    if (ratio >= warnAt) return "warning";
    return "success";
  }

  function personButton(person, compact) {
    const row = el("button", compact ? "bk-mobile-row" : "bk-person");
    row.type = "button";
    row.dataset.on = person.id === store.sel ? "true" : "false";
    const face = el("span", "bk-avatar", initials(person.name));
    face.dataset.tone = person.tone;
    const copy = el("div", "bk-person-copy");
    copy.append(el("strong", compact ? "" : "bk-ellipsis", person.name));
    copy.append(el("span", "", compact ? `${person.verified ? "Verified" : "Unverified"} · •• ${person.last4}` : `${person.bank} · •• ${person.last4}`));
    row.append(face, copy);
    if (!compact) {
      row.append(createBadge({
        label: person.verified ? "Verified" : "Unverified",
        tone: person.verified ? "settled" : "warning",
        size: "sm",
      }));
    } else if (person.id === store.sel) {
      const mark = icon("confirm");
      if (mark) row.append(mark);
    }
    row.addEventListener("click", () => {
      store.sel = person.id;
      paintPeople();
    });
    return row;
  }

  function paintPeople() {
    const list = filtered();
    const count = mount("count");
    count.textContent = store.q.trim() ? `${list.length} of ${people().length}` : `${people().length} saved`;
    const box = mount("list");
    box.replaceChildren();
    list.forEach((person) => box.append(personButton(person)));
    const empty = mount("empty");
    empty.hidden = list.length > 0;
    empty.replaceChildren(el("strong", "", `No beneficiary matches “${store.q}”`), el("span", "bk-quiet", "Check the spelling or add them as a new beneficiary."));
    const mobile = mount("mobile-list");
    mobile.replaceChildren();
    list.forEach((person) => mobile.append(personButton(person, true)));
    const person = selected();
    const card = mount("selected");
    card.replaceChildren();
    const who = el("div", "bk-selected");
    const face = el("span", "bk-avatar", initials(person.name));
    face.dataset.tone = person.tone;
    const copy = el("div", "bk-person-copy");
    copy.append(el("strong", "", person.name), el("span", "", person.bank));
    who.append(face, copy);
    const note = createFeedback({
      kind: "alert",
      tone: person.verified ? "success" : "warning",
      title: person.verified ? "The name matches the account holder at the bank." : "The name isn't confirmed with their bank yet. You can still pay after you confirm the details.",
    });
    card.append(who, el("span", "bk-mono", `SA•• •••• •••• •••• •••• ${person.last4}`), note);
  }

  function paintAdd() {
    mount("add-form").hidden = !store.adding;
    const label = mount("add-label");
    if (label) label.textContent = store.adding ? "Cancel new beneficiary" : "Add new beneficiary";
  }

  function saveBeneficiary() {
    const name = nameField.querySelector("input").value.trim();
    const raw = ibanField.querySelector("input").value.replace(/\s/g, "").toUpperCase();
    nameField.querySelector("input").dispatchEvent(new Event("blur", { bubbles: true }));
    ibanField.querySelector("input").dispatchEvent(new Event("blur", { bubbles: true }));
    if (!name || !/^SA\d{22}$/.test(raw)) return;
    const id = `n${Date.now()}`;
    const bank = banks[raw.slice(4, 6)] || "Saudi bank";
    store.extra.push([id, name, bank, raw.slice(-4), false]);
    store.sel = id;
    store.adding = false;
    store.q = "";
    const search = mount("search").querySelector("input");
    if (search) search.value = "";
    nameField.querySelector("input").value = "";
    ibanField.querySelector("input").value = "";
    paintAdd();
    paintPeople();
    toast("Beneficiary added. Name check in progress.");
  }

  function fillExample() {
    const name = nameField.querySelector("input");
    const iban = ibanField.querySelector("input");
    name.value = "Al Safi Catering";
    name.dispatchEvent(new Event("input", { bubbles: true }));
    iban.value = "SA4480000001234567890123";
    iban.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function paintCard() {
    const on = revealed("card");
    const art = mount("card-art");
    art.dataset.frozen = store.frozen ? "true" : "false";
    art.querySelector("[data-bk-frozen]").hidden = !store.frozen;
    const number = mount("card-number");
    const expiry = mount("card-expiry");
    const cvv = mount("card-cvv");
    number.textContent = on ? "4532 8810 2290 4417" : "•••• •••• •••• 4417";
    expiry.textContent = on ? "09/29" : "••/••";
    cvv.textContent = on ? "382" : "•••";
    const show = mount("card-show");
    const showLabel = show.querySelector(".button-label");
    if (showLabel) showLabel.textContent = on ? `Hide · ${secs("card")}s` : "Show details";
    const freeze = mount("card-freeze");
    const freezeLabel = freeze.querySelector(".button-label");
    if (freezeLabel) freezeLabel.textContent = store.frozen ? "Unfreeze" : "Freeze";
    freeze.dataset.variant = store.frozen ? "ink" : "secondary";
    mount("controls").dataset.muted = store.frozen ? "true" : "false";
    const mobileShow = mount("mobile-show");
    const mobileShowLabel = mobileShow && mobileShow.querySelector(".button-label");
    if (mobileShowLabel) mobileShowLabel.textContent = on ? `Hide · ${secs("card")}s` : "Details";
    const mobileFreeze = mount("mobile-freeze");
    const mobileFreezeLabel = mobileFreeze && mobileFreeze.querySelector(".button-label");
    if (mobileFreezeLabel) mobileFreezeLabel.textContent = store.frozen ? "Unfreeze" : "Freeze";
    const mobileNumber = mount("mobile-card-number");
    if (mobileNumber) mobileNumber.textContent = number.textContent;
    const mobileArt = mount("mobile-art");
    if (mobileArt) {
      mobileArt.dataset.frozen = store.frozen ? "true" : "false";
      const veil = mobileArt.querySelector("[data-bk-frozen]");
      if (veil) veil.hidden = !store.frozen;
    }
  }

  function paintToggles() {
    const root = mount("toggles");
    root.replaceChildren();
    toggles.forEach(([key, label, sub, glyph]) => {
      const row = el("div", "bk-switch");
      const choice = createChoice({
        kind: "switch",
        label,
        sub,
        icon: glyph,
        checked: store.tg[key],
        disabled: store.frozen,
        onChange() {
          store.tg[key] = !store.tg[key];
          paintToggles();
        },
      });
      row.append(choice);
      root.append(row);
    });
  }

  function paintLimits() {
    const root = mount("limits");
    const total = Object.values(store.lim).reduce((sum, value) => sum + value, 0);
    mount("limit-total").textContent = `SAR ${money(total)}`;
    root.replaceChildren();
    limits.forEach(([key, label, spent]) => {
      const cap = store.lim[key];
      const ratio = cap ? spent / cap : 1;
      const tone = ratio >= 1 ? "error" : ratio >= 0.85 ? "warning" : "success";
      const block = el("div", "bk-limit");
      const line = el("div", "bk-limit-line");
      line.append(el("strong", "", label));
      const step = el("div", "bk-step");
      step.append(
        button({ label: "−", variant: "secondary", size: "sm", ariaLabel: `Decrease ${label}` }, () => changeLimit(key, -500)),
        el("span", "bk-mono", cap.toLocaleString("en-US")),
        button({ label: "+", variant: "secondary", size: "sm", ariaLabel: `Increase ${label}` }, () => changeLimit(key, 500))
      );
      line.append(step);
      const track = el("span", "bk-meter-track");
      const fill = el("span", "bk-meter-fill");
      fill.dataset.tone = tone;
      fill.style.width = `${Math.min(100, ratio * 100)}%`;
      track.append(fill);
      const copy = ratio >= 1
        ? `SAR ${money(spent)} spent. Limit reached, payments declined.`
        : `SAR ${money(spent)} of ${money(cap)}. ${Math.round(ratio * 100)}% used.`;
      block.append(line, track, el("span", "", copy));
      root.append(block);
    });
  }

  function changeLimit(key, delta) {
    if (store.frozen) return;
    store.lim[key] = Math.max(0, Math.min(20000, store.lim[key] + delta));
    paintLimits();
  }

  function paintMeter() {
    const spent = store.spent;
    const ratio = spent / 5000;
    const tone = meterTone(ratio, 0.75);
    mount("meter-spent").textContent = money(spent);
    const fill = mount("meter-fill");
    fill.dataset.tone = tone;
    fill.style.width = `${Math.min(100, ratio * 100)}%`;
    const foot = mount("meter-foot");
    foot.dataset.tone = tone;
    foot.replaceChildren(
      el("strong", "", ratio >= 1 ? "Limit reached. Payments declined." : ratio >= 0.75 ? "Close to limit" : "On track"),
      el("span", "", ratio >= 1 ? `SAR ${money(spent - 5000)} over` : `SAR ${money(5000 - spent)} left`)
    );
    const mobile = mount("mobile-meter");
    if (mobile) {
      mobile.querySelector("[data-fill]").style.width = fill.style.width;
      mobile.querySelector("[data-fill]").dataset.tone = tone;
      mobile.querySelector("[data-spent]").textContent = money(spent);
      mobile.querySelector("[data-state]").textContent = `${foot.querySelector("strong").textContent} · ${foot.querySelector("span").textContent}`;
    }
  }

  function paintPayroll() {
    const have = store.funded ? 340000 : 268400;
    const pct = Math.round((have / 340000) * 100);
    const ring = mount("ring");
    ring.style.setProperty("--pct", `${pct}%`);
    ring.style.setProperty("--tone", store.funded ? "var(--status-success)" : "var(--status-warning-solid)");
    ring.querySelector("span").textContent = `${pct}%`;
    mount("payroll-title").textContent = store.funded ? "Payroll fully funded" : "Payroll not fully funded";
    mount("payroll-have").textContent = `${money(have)} of 340,000.00`;
    const msg = mount("payroll-msg");
    msg.textContent = store.funded ? "42 salaries will be paid on 25 Oct." : "Add SAR 71,600.00 by 24 Oct, 11:59 PM.";
    msg.dataset.tone = store.funded ? "success" : "warning";
    const action = mount("payroll-action");
    const label = action.querySelector(".button-label");
    if (label) label.textContent = store.funded ? "Reset demo" : "Add SAR 71,600.00";
    action.dataset.variant = store.funded ? "secondary" : "primary";
  }

  function pending() {
    return payments.filter((row) => !store.done[row[0]]);
  }

  function selectedPayments() {
    return pending().filter((row) => store.rows[row[0]]);
  }

  function paintBulk() {
    const open = pending();
    const chosen = selectedPayments();
    const allOn = open.length > 0 && chosen.length === open.length;
    const some = chosen.length > 0 && !allOn;
    const head = mount("bulk-all");
    head.replaceChildren(createChoice({
      kind: "checkbox",
      bare: true,
      label: "Select all",
      checked: allOn,
      mixed: some,
      onChange() {
        store.rows = {};
        if (!allOn) open.forEach((row) => { store.rows[row[0]] = true; });
        paintBulk();
      },
    }));
    const body = mount("bulk-rows");
    body.replaceChildren();
    payments.forEach((row) => body.append(bulkRow(row)));
    const count = chosen.length;
    const total = chosen.reduce((sum, row) => sum + row[3], 0);
    const bar = mount("bulk-bar");
    bar.dataset.open = count ? "true" : "false";
    bar.querySelector("[data-count]").textContent = `${count} selected`;
    bar.querySelector("[data-total]").textContent = `SAR ${money(total)}`;
    bar.querySelector("[data-approve]").textContent = `Approve ${count}`;
    mount("bulk-reset").hidden = Object.keys(store.done).length === 0;
    const mobile = mount("mobile-bulk");
    mobile.replaceChildren();
    payments.forEach((row) => mobile.append(bulkRow(row, true)));
    const mobileBar = mount("mobile-bar");
    mobileBar.hidden = count === 0;
    mobileBar.querySelector("[data-count]").textContent = `${count} selected · SAR ${money(total)}`;
    mount("mobile-select").textContent = count ? "Clear" : "Select";
  }

  function bulkRow(row, compact) {
    const [id, name, ref, amount] = row;
    const done = store.done[id];
    const on = !!store.rows[id];
    const line = el("div", compact ? "bk-mobile-row" : "bk-row bk-grid");
    line.dataset.on = on ? "true" : "false";
    line.dataset.done = done ? "true" : "false";
    const choice = createChoice({
      kind: "checkbox",
      bare: true,
      label: name,
      checked: on,
      disabled: !!done,
      onChange() { toggleRow(id); },
    });
    choice.addEventListener("click", (event) => event.stopPropagation());
    const amountNode = el("span", "bk-mono", money(amount));
    if (compact) {
      const copy = el("div", "bk-person-copy");
      copy.append(el("strong", "", name), el("span", "", ref));
      line.append(choice, copy, amountNode);
    } else {
      line.append(choice, el("span", "bk-ellipsis", name), el("span", "bk-mono bk-quiet", ref), amountNode);
      amountNode.classList.add("bk-end");
      const badge = createBadge({
        label: done || "Pending",
        tone: done === "Approved" ? "settled" : done === "Rejected" ? "declined" : "pending",
        size: "sm",
      });
      badge.classList.add("bk-end");
      line.append(badge);
      line.addEventListener("click", () => toggleRow(id));
    }
    if (compact) line.addEventListener("click", () => toggleRow(id));
    return line;
  }

  function toggleRow(id) {
    if (store.done[id]) return;
    store.rows[id] = !store.rows[id];
    if (!store.rows[id]) delete store.rows[id];
    paintBulk();
  }

  function act(status, message) {
    const chosen = selectedPayments();
    const total = chosen.reduce((sum, row) => sum + row[3], 0);
    chosen.forEach((row) => { store.done[row[0]] = status; });
    store.rows = {};
    paintBulk();
    toast(message.replace("{n}", String(chosen.length)).replace("{t}", money(total)));
  }

  function paintUpload() {
    ["idle", "checking", "report", "done"].forEach((state) => {
      mount(`up-${state}`).hidden = store.up !== state;
    });
  }

  function readAmount() {
    const input = amountField && amountField.querySelector("input");
    return parseFloat(String(input ? input.value : "0").replace(/,/g, "")) || 0;
  }

  function paintFee() {
    const amount = readAmount();
    const intl = store.ft === "intl";
    const fee = intl ? 35 : 0.5;
    const vat = Math.round(fee * 15) / 100;
    const rows = mount("fee-rows");
    rows.replaceChildren();
    [
      ["Transfer amount", `SAR ${money(amount)}`],
      [intl ? "SWIFT fee" : "Transfer fee (SARIE)", money(fee)],
      ["VAT 15% on fee", money(vat)],
    ].forEach(([key, value]) => {
      const line = el("div", "bk-fee-line");
      line.append(el("span", "", key), el("span", "bk-mono", value));
      rows.append(line);
    });
    const total = el("div", "bk-fee-line bk-total");
    total.append(el("span", "", "Total debited"), el("span", "bk-mono", `SAR ${money(amount + fee + vat)}`));
    rows.append(total);
    mount("fee-note").textContent = intl
      ? "The recipient's bank may deduct its own charges. The exchange rate is on the next step."
      : "Arrives in seconds, 24 hours a day.";
  }

  function paintMask() {
    const root = mount("mask");
    const rows = [
      ["iban", "Account IBAN", "Your own main account", "SA03 8000 0000 6080 1016 7519", "SA03 •••• •••• •••• •••• 7519", "Low", "Tap to show", false],
      ["card", "Card number · Marketing", "Full number, expiry and CVV", "4532 8810 2290 4417", "•••• •••• •••• 4417", "Medium", "PIN or Face ID", true],
      ["salary", "Salary · Omar Bakr", "Payroll and HR data", "SAR 18,500.00", "SAR ••,•••.••", "High", "Re-auth, access logged", true],
    ];
    root.replaceChildren();
    rows.forEach(([key, label, how, full, masked, level, detail, auth]) => {
      const on = revealed(key);
      const tone = level === "Low" ? "settled" : level === "Medium" ? "warning" : "error";
      const line = el("div", "bk-mask");
      const copy = el("div", "bk-person-copy");
      copy.append(el("strong", "", label), el("span", "", how));
      line.append(
        copy,
        el("span", "bk-mono bk-ellipsis", on ? full : masked),
        createBadge({ label: `${level} · ${detail}`, tone, size: "sm" }),
        button({
          label: on ? `Hide · ${secs(key)}s` : "Show",
          icon: on ? "hide" : "show",
          variant: "secondary",
          size: "sm",
        }, () => (auth ? ask(key) : (on ? hide(key) : grant(key))))
      );
      root.append(line);
    });
  }

  function paintPin() {
    const dialog = mount("pin");
    dialog.hidden = !store.auth;
    if (!store.auth) return;
    mount("pin-title").textContent = store.auth === "salary" ? "Show salary" : "Show card details";
    mount("pin-copy").textContent = store.auth === "salary"
      ? "Enter your PIN. This view is recorded in the audit log."
      : "Enter your 4-digit PIN. Any 4 digits work in this demo.";
    [...mount("pin-dots").children].forEach((dot, index) => {
      dot.dataset.on = index < store.pin.length ? "true" : "false";
    });
  }

  function pressPin(digit) {
    if (digit === "del") {
      store.pin = store.pin.slice(0, -1);
      paintPin();
      return;
    }
    store.pin = (store.pin + digit).slice(0, 4);
    paintPin();
    if (store.pin.length === 4) {
      const key = store.auth;
      setTimeout(() => grant(key), 180);
    }
  }

  const search = createInput({
    label: "Search beneficiaries",
    type: "search",
    size: "md",
    leadingIcon: "search",
    placeholder: "Search name, bank or last 4 digits",
    onChange(value) {
      store.q = value;
      paintPeople();
    },
  });
  mount("search").append(search);

  mount("add").append(button({
    label: "Add new beneficiary",
    icon: "add",
    variant: "ghost",
    size: "md",
  }, () => {
    store.adding = !store.adding;
    paintAdd();
  }));
  mount("add").querySelector(".button-label").dataset.bk = "add-label";

  nameField = createInput({
    label: "Beneficiary name",
    placeholder: "As it appears on their account",
    validate(value, ctx) {
      if (!ctx.touched) return {};
      if (!String(value).trim()) return { error: "Enter the name on their account." };
      return {};
    },
  });
  ibanField = createInput({
    label: "IBAN",
    format: "iban",
    placeholder: "SA00 0000 0000 0000 0000 0000",
    iban: { banks, check: true, done: "We'll check the name after saving." },
  });
  const form = mount("add-form");
  form.append(nameField, ibanField);
  const formActions = el("div", "bk-actions");
  formActions.append(
    button({ label: "Fill example", variant: "ghost", size: "sm" }, fillExample),
    button({ label: "Save and select", variant: "primary", size: "md" }, saveBeneficiary)
  );
  form.append(formActions);

  [
    ["Verified", "settled", "Name matched with the receiving bank. Pay as normal."],
    ["Unverified", "warning", "Name not confirmed yet or didn't match. Ask for confirmation before sending."],
    ["New", "info", "First payment to this beneficiary. Show a one-time warning and a cooling-off notice if required."],
  ].forEach(([label, tone, copy]) => {
    const row = el("div", "bk-line");
    row.append(createBadge({ label, tone, size: "sm" }), el("span", "bk-sub", copy));
    mount("states").append(row);
  });

  const art = mount("card-art");
  const image = el("img");
  image.src = "../media/hala-purchase-card.svg";
  image.alt = "Hala purchase card";
  const frozen = el("div", "bk-frozen");
  frozen.dataset.bkFrozen = "true";
  frozen.hidden = true;
  frozen.append(createBadge({ label: "Frozen", tone: "info", icon: "freeze" }));
  art.append(image, frozen);
  const mobileArt = mount("mobile-art");
  const mobileImage = image.cloneNode(true);
  const mobileFrozen = frozen.cloneNode(true);
  mobileArt.append(mobileImage, mobileFrozen);

  mount("card-actions").append(
    button({ label: "Show details", icon: "show", variant: "secondary", size: "md" }, () => ask("card")),
    button({ label: "Freeze", icon: "freeze", variant: "secondary", size: "md" }, () => {
      store.frozen = !store.frozen;
      toast(store.frozen ? "Card frozen. New payments are declined." : "Card unfrozen. Payments work again.");
      paintCard();
      paintToggles();
    })
  );
  mount("card-actions").children[0].dataset.bk = "card-show";
  mount("card-actions").children[1].dataset.bk = "card-freeze";

  mount("mobile-actions").append(
    button({ label: "Details", icon: "show", variant: "secondary", size: "sm" }, () => ask("card")),
    button({ label: "Freeze", icon: "freeze", variant: "secondary", size: "sm" }, () => {
      store.frozen = !store.frozen;
      toast(store.frozen ? "Card frozen. New payments are declined." : "Card unfrozen. Payments work again.");
      paintCard();
      paintToggles();
    }),
    button({ label: "Limits", icon: "adjust", variant: "secondary", size: "sm" })
  );
  mount("mobile-actions").children[0].dataset.bk = "mobile-show";
  mount("mobile-actions").children[1].dataset.bk = "mobile-freeze";

  mount("meter").append(Object.assign(document.createElement("input"), {
    className: "bk-range",
    type: "range",
    min: "0",
    max: "5400",
    step: "20",
    value: String(store.spent),
    ariaLabel: "Spent amount",
  }));
  mount("meter").querySelector("input").addEventListener("input", (event) => {
    store.spent = Number(event.target.value);
    paintMeter();
  });

  const segments = [
    ["Advertising", 52000, "success"],
    ["Events", 21500, "info"],
    ["Travel", 14200, "scheduled"],
    ["Software", 9800, "warning"],
    ["Remaining", 22500, "neutral"],
  ];
  const splitBar = mount("split-bar");
  const legend = mount("split-legend");
  segments.forEach(([label, value, tone]) => {
    const seg = el("span", "bk-seg");
    seg.dataset.tone = tone;
    seg.style.width = `${(value / 120000) * 100}%`;
    seg.title = label;
    splitBar.append(seg);
    const item = el("div", "bk-legend");
    const swatch = el("span", "bk-swatch");
    swatch.dataset.tone = tone;
    item.append(swatch, el("span", "", label), el("span", "bk-mono", money(value)), el("span", "bk-mono bk-quiet", `${Math.round((value / 120000) * 100)}%`));
    legend.append(item);
  });

  mount("payroll-slot").append(button({ label: "Add SAR 71,600.00", variant: "primary", block: true }, () => {
    store.funded = !store.funded;
    if (store.funded) toast("SAR 71,600.00 moved from Savings. Payroll is funded.");
    paintPayroll();
  }));
  mount("payroll-slot").querySelector(".button").dataset.bk = "payroll-action";

  mount("bulk-actions").append(
    button({ label: "Clear", variant: "ghost", size: "sm" }, () => { store.rows = {}; paintBulk(); }),
    button({ label: "Export", variant: "secondary", size: "sm" }, () => toast(`${selectedPayments().length} payments exported to CSV`)),
    button({ label: "Reject", variant: "destructive", size: "sm" }, () => act("Rejected", "{n} payments rejected. Requesters were notified.")),
    button({ label: "Approve", variant: "primary", size: "sm" }, () => act("Approved", "{n} payments approved · SAR {t}"))
  );
  mount("bulk-actions").lastElementChild.querySelector(".button-label").dataset.approve = "true";

  mount("bulk-reset").append(button({ label: "Reset demo", variant: "ghost", size: "sm" }, () => {
    store.done = {};
    store.rows = {};
    paintBulk();
  }));

  mount("mobile-bulk-actions").append(
    button({ label: "Reject", variant: "destructive", size: "md" }, () => act("Rejected", "{n} payments rejected. Requesters were notified.")),
    button({ label: "Approve", variant: "primary", size: "md" }, () => act("Approved", "{n} payments approved · SAR {t}"))
  );
  mount("mobile-select").addEventListener("click", () => {
    if (selectedPayments().length) store.rows = {};
    else pending().forEach((row) => { store.rows[row[0]] = true; });
    paintBulk();
  });

  mount("up-idle").append(button({
    label: "Upload payroll_oct.csv",
    icon: "upload",
    variant: "secondary",
    size: "lg",
  }, () => {
    store.up = "checking";
    paintUpload();
    clearTimeout(uploadTimer);
    uploadTimer = setTimeout(() => {
      store.up = "report";
      paintUpload();
    }, 1500);
  }));
  const idle = mount("up-idle").querySelector(".button");
  idle.classList.add("bk-drop");
  idle.append(el("span", "bk-quiet", "CSV or XLSX, up to 2,000 rows. Click to try."));

  [
    ["Rows checked", "48", ""],
    ["Ready to pay", "45", "success"],
    ["Need fixing", "3", "error"],
    ["Total (ready)", "318,250.00", ""],
  ].forEach(([label, value, tone]) => {
    const stat = el("div", "bk-stat");
    if (tone) stat.dataset.tone = tone;
    stat.append(el("span", "", label), el("strong", "", value));
    mount("up-stats").append(stat);
  });
  [
    ["12", "IBAN", "SA44 2000 0001 2345 6789 012", "Has 23 characters. Saudi IBANs have 24."],
    ["27", "Amount", "(empty)", "Add the salary amount."],
    ["41", "Employee ID", "E-1033", "Same employee as row 18. Remove one."],
  ].forEach(([row, column, value, message]) => {
    const line = el("div", "bk-error");
    line.append(el("span", "bk-mono", `Row ${row}`), el("span", "bk-quiet", column), el("span", "bk-mono bk-ellipsis", value), el("span", "bk-fix", message));
    mount("up-errors").append(line);
  });
  mount("up-actions").append(
    button({ label: "Upload again", variant: "ghost", size: "md" }, () => { store.up = "idle"; paintUpload(); }),
    button({ label: "Download errors", icon: "download", variant: "secondary", size: "md" }, () => toast("payroll_oct_errors.csv downloaded")),
    button({ label: "Continue with 45 rows", variant: "primary", size: "md" }, () => {
      store.up = "done";
      paintUpload();
      toast("45 salaries sent for approval");
    })
  );
  mount("up-done").append(
    createFeedback({ kind: "alert", tone: "success", title: "45 salaries ready for approval", description: "SAR 318,250.00. 3 rows saved as a draft to fix later." }),
    button({ label: "Reset demo", variant: "ghost", size: "sm" }, () => { store.up = "idle"; paintUpload(); })
  );

  amountField = createInput({
    label: "Amount",
    value: "25000",
    format: "amount",
    prefix: "SAR",
    emphasis: true,
    onChange() { paintFee(); },
  });
  mount("fee-input").append(amountField);
  feeGroup = createButtonGroup({
    kind: "segment",
    size: "sm",
    label: "Transfer type",
    value: "local",
    options: [
      { label: "Local · instant", value: "local" },
      { label: "International", value: "intl" },
    ],
    onChange(value) {
      store.ft = value;
      paintFee();
    },
  });
  mount("fee-type").append(feeGroup);

  [
    ["Subtotal", "12,400.00", ""],
    ["Discount", "− 400.00", "success"],
    ["Taxable amount", "12,000.00", ""],
    ["VAT 15%", "1,800.00", ""],
  ].forEach(([label, value, tone]) => {
    const line = el("div", "bk-fee-line");
    const amount = el("span", "bk-mono", value);
    if (tone === "success") amount.dataset.tone = "success";
    line.append(el("span", "", label), amount);
    mount("invoice").append(line);
  });
  const invoiceTotal = el("div", "bk-fee-line bk-total");
  invoiceTotal.append(el("span", "", "Total incl. VAT"), el("span", "bk-mono", "SAR 13,800.00"));
  mount("invoice").append(invoiceTotal);

  const keys = mount("pin-keys");
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].forEach((key) => {
    if (!key) {
      keys.append(el("span", ""));
      return;
    }
    keys.append(button({
      label: key === "del" ? "Delete" : key,
      variant: "secondary",
      size: "md",
      ariaLabel: key === "del" ? "Delete" : key,
    }, () => pressPin(key)));
  });
  mount("pin-face").append(button({ label: "Use Face ID", icon: "lock", variant: "secondary", block: true }, () => grant(store.auth)));
  mount("pin-cancel").append(button({ label: "Cancel", variant: "ghost", size: "sm" }, () => {
    store.auth = "";
    store.pin = "";
    paintPin();
  }));
  mount("pin").addEventListener("click", (event) => {
    if (event.target === mount("pin")) {
      store.auth = "";
      store.pin = "";
      paintPin();
    }
  });

  [
    [true, "Beneficiary", "Search name, bank and last 4 digits. Show the verification state on every row."],
    [false, "Beneficiary", "Don't make people leave the transfer to add a new beneficiary."],
    [true, "Card", "Put freeze, reveal and limits next to the card. Freeze takes effect instantly."],
    [false, "Card", "Don't show the full card number or CVV without PIN or Face ID."],
    [true, "Meters", "Always show the amount and what's left, not just a bar. Change color at 75% and 100%."],
    [false, "Meters", "Don't use more than 5 segments in a split. Group the rest as Other."],
    [true, "Bulk", "Show the count and the total in the bar. Name the action with the count: Approve 3."],
    [false, "Bulk", "Don't let people select rows that can't be acted on."],
    [true, "Upload", "Summary first, then errors with the row, column and how to fix. Allow continuing with the valid rows."],
    [true, "Fees", "Show the amount, the fee, VAT at 15% on the fee, and the total before confirming."],
    [true, "Masking", "Hide sensitive numbers by default. Hide them again after 30 seconds or when the app goes to the background."],
    [false, "Masking", "Don't mask what people need to check, like the last 4 digits or the beneficiary name."],
  ].forEach(([ok, name, text]) => {
    const card = el("div", "rule bk-do");
    const mark = el("span", "bk-do-mark");
    mark.dataset.ok = ok ? "true" : "false";
    const glyph = icon(ok ? "confirm" : "error");
    if (glyph) mark.append(glyph);
    const copy = el("div", "bk-person-copy");
    copy.append(el("span", "kicker quiet", name), el("span", "", text));
    card.append(mark, copy);
    mount("rules").append(card);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    store.rev = {};
    paintCard();
    paintMask();
  });
  setInterval(() => {
    if (!Object.keys(store.rev).length) return;
    const now = Date.now();
    Object.keys(store.rev).forEach((key) => {
      if (store.rev[key] <= now) delete store.rev[key];
    });
    paintCard();
    paintMask();
  }, 1000);

  paintPeople();
  paintAdd();
  paintCard();
  paintToggles();
  paintLimits();
  paintMeter();
  paintPayroll();
  paintBulk();
  paintUpload();
  paintFee();
  paintMask();
  paintPin();
})();
