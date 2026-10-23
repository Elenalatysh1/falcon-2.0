/**
 * Falcon Money entry: Amount entry, Keypad (with the Key part) and Recipient strip.
 * Load vendor/hala-icons.js, lists.js (createAmount) and button.js (amount chips) first.
 *
 * createAmountEntry({ value, balance, quickAmounts, showQuick, showCaption, keypad, lang, state, onChange })
 *   value is a string or number. keypad: true when an in-app Keypad drives it (no system keyboard).
 *   Returns the root with press(kind, digit), setValue(value), getValue() and getState().
 * createKeypad({ type, style, lang, label, onKey })  type "amount" | "pin" | "phone". style "plain" | "keys".
 *   Digits are Western and the layout never mirrors.
 * createKey({ kind, digit, letters, style, state })  kind "digit" | "decimal" | "delete" | "empty" | "biometric".
 * createRecipientStrip({ recipients, selected, showAccount, lang, label, onSelect, onNew })
 */
(function () {
  const COPY = {
    en: {
      available: "Available",
      over: "More than your available balance",
      amount: "Amount in Saudi riyals",
      quick: "Quick amounts",
      keypad: "Keypad",
      decimal: "Decimal point",
      remove: "Delete",
      biometric: "Use Face ID",
      to: "To",
      add: "New",
      addLabel: "New recipient",
    },
    ar: {
      available: "المتاح",
      over: "أكثر من رصيدك المتاح",
      amount: "المبلغ بالريال السعودي",
      quick: "مبالغ سريعة",
      keypad: "لوحة الأرقام",
      decimal: "فاصلة عشرية",
      remove: "حذف",
      biometric: "استخدم بصمة الوجه",
      to: "إلى",
      add: "جديد",
      addLabel: "مستفيد جديد",
    },
  };
  const LETTERS = ["", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];
  const BOTTOM = {
    amount: ["decimal", "0", "delete"],
    pin: ["biometric", "0", "delete"],
    phone: ["empty", "0", "delete"],
  };

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

  function cue(node) {
    node.removeAttribute("data-motion");
    void node.offsetWidth;
    node.dataset.motion = "true";
    node.addEventListener("animationend", () => node.removeAttribute("data-motion"), { once: true });
  }

  function sar(className) {
    const mark = el("span", `list-sar ${className || ""}`.trim());
    mark.setAttribute("aria-hidden", "true");
    return mark;
  }

  /* Raw amount text: digits, one point, two decimals at most, no leading zeros. */
  function clean(text) {
    let value = String(text == null ? "" : text).replace(/[^\d.]/g, "");
    const dot = value.indexOf(".");
    if (dot >= 0) value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, "").slice(0, 2);
    const [whole, decimals] = value.split(".");
    const trimmed = whole.replace(/^0+(?=\d)/, "");
    if (dot < 0) return trimmed;
    return `${trimmed || "0"}.${decimals || ""}`;
  }

  function display(raw) {
    if (!raw) return "";
    const [whole, decimals] = raw.split(".");
    const grouped = Number(whole || 0).toLocaleString("en-US");
    return raw.includes(".") ? `${grouped}.${decimals}` : grouped;
  }

  function money(value) {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function createAmountEntry(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = copyFor(lang);
    const { balance, showQuick = true, showCaption = true, keypad = false } = options;
    const quick = options.quickAmounts || [1000, 5000, 10000];
    let raw = options.value == null || options.value === "" ? "" : clean(Number(clean(options.value)).toFixed(2));
    let state = "empty";

    const root = el("div", "me-amount");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const row = el("label", "me-amount-row");
    row.dir = "ltr";
    const input = el("input", "me-amount-input");
    input.type = "text";
    input.inputMode = keypad ? "none" : "decimal";
    input.autocomplete = "off";
    input.placeholder = "0";
    input.setAttribute("aria-label", copy.amount);
    if (options.state) input.readOnly = true;
    row.append(sar("me-amount-sign"), input);
    root.append(row);

    const caption = el("p", "me-caption");
    caption.id = `me-caption-${Math.random().toString(36).slice(2, 8)}`;
    input.setAttribute("aria-describedby", caption.id);
    if (showCaption) root.append(caption);

    const chips = el("div", "me-quick");
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", copy.quick);
    const buttons = quick.map((amount) => {
      const button = window.createButton({ label: amount.toLocaleString("en-US"), variant: "ghost", size: "sm", role: "amount" });
      button.prepend(sar());
      button.setAttribute("aria-label", `${amount.toLocaleString("en-US")} Saudi riyals`);
      button.addEventListener("click", () => {
        raw = clean(amount.toFixed(2));
        paint();
        cue(row);
      });
      chips.append(button);
      return button;
    });
    if (showQuick) root.append(chips);

    function value() {
      return parseFloat(raw) || 0;
    }

    function paint() {
      const amount = value();
      state = options.state || (!raw ? "empty" : balance != null && amount > balance ? "error" : "filled");
      root.dataset.state = state;
      const shown = display(raw);
      if (input.value !== shown) input.value = shown;
      input.setAttribute("aria-invalid", state === "error" ? "true" : "false");
      caption.replaceChildren();
      if (state === "error") {
        caption.setAttribute("role", "alert");
        caption.textContent = copy.over;
      } else {
        caption.removeAttribute("role");
        caption.append(el("span", "", copy.available));
        if (balance != null) caption.append(window.createAmount(balance, { kind: "muted", size: "xs" }));
      }
      buttons.forEach((button, index) => {
        const on = raw !== "" && amount === quick[index];
        button.dataset.selected = on ? "true" : "false";
        button.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (options.onChange) options.onChange(amount, state);
    }

    input.addEventListener("input", () => {
      raw = clean(input.value);
      paint();
      input.setSelectionRange(input.value.length, input.value.length);
    });
    input.addEventListener("blur", () => {
      if (!raw || options.state) return;
      raw = clean(value().toFixed(2));
      paint();
    });

    root.press = (kind, digit) => {
      if (kind === "delete") raw = raw.slice(0, -1).replace(/^0$/, "");
      else if (kind === "decimal") { if (!raw.includes(".")) raw = `${raw || "0"}.`; }
      else if (kind === "digit") {
        const decimals = raw.split(".")[1];
        if (decimals != null && decimals.length >= 2) return;
        raw = clean(raw + digit);
      }
      paint();
    };
    root.setValue = (next) => {
      raw = clean(next);
      paint();
    };
    root.getValue = value;
    root.getState = () => state;
    root.input = input;
    paint();
    return root;
  }

  function createKey(options = {}) {
    const { kind = "digit", digit = "1", style = "plain", state, lang = "en" } = options;
    const copy = copyFor(lang);
    if (kind === "empty") {
      const blank = el("span", "me-key");
      blank.dataset.kind = "empty";
      blank.dataset.style = style;
      blank.setAttribute("aria-hidden", "true");
      return blank;
    }
    const key = el("button", "me-key");
    key.type = "button";
    key.dataset.kind = kind;
    key.dataset.style = style;
    if (state) {
      key.dataset.state = state;
      key.tabIndex = -1;
    }
    if (state === "disabled") key.disabled = true;
    if (kind === "digit") {
      key.append(el("span", "me-key-digit", digit));
      if (options.letters) {
        const letters = el("span", "me-key-letters", options.letters);
        letters.setAttribute("aria-hidden", "true");
        key.append(letters);
      }
    } else if (kind === "decimal") {
      key.append(el("span", "me-key-digit", "."));
      key.setAttribute("aria-label", copy.decimal);
    } else {
      const glyph = icon(kind === "delete" ? "backspace" : "face-id", "nav");
      if (glyph) key.append(glyph);
      key.setAttribute("aria-label", kind === "delete" ? copy.remove : copy.biometric);
    }
    return key;
  }

  function createKeypad(options = {}) {
    const { type = "amount", style = "plain", lang = "en" } = options;
    const copy = copyFor(lang);
    const pad = el("div", "me-keypad");
    pad.dataset.type = type;
    pad.dataset.style = style;
    pad.dir = "ltr";
    pad.setAttribute("role", "group");
    pad.setAttribute("aria-label", options.label || copy.keypad);
    const letters = style === "keys" && type !== "amount";
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ kind: "digit", digit: String(n), letters: letters ? LETTERS[n - 1] : "" }));
    BOTTOM[type].forEach((entry) => keys.push(/\d/.test(entry) ? { kind: "digit", digit: entry } : { kind: entry }));
    keys.forEach((spec) => {
      const key = createKey({ ...spec, style, lang, state: options.state });
      if (key.tagName === "BUTTON" && options.onKey) key.addEventListener("click", () => options.onKey(spec.kind, spec.digit));
      pad.append(key);
    });
    return pad;
  }

  function createRecipientStrip(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = copyFor(lang);
    const recipients = options.recipients || [];
    const { showAccount = true } = options;
    let selected = Math.max(0, recipients.findIndex((recipient) => recipient.name === options.selected));

    const root = el("div", "me-strip");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const label = el("span", "me-strip-label", options.label || copy.to);
    label.id = `me-strip-${Math.random().toString(36).slice(2, 8)}`;
    const list = el("div", "me-strip-list");
    const group = el("div", "me-strip-group");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-labelledby", label.id);
    const account = el("p", "me-strip-account");
    account.setAttribute("aria-live", "polite");

    const add = el("button", "me-recipient");
    add.type = "button";
    add.dataset.kind = "new";
    add.setAttribute("aria-label", copy.addLabel);
    const addRing = el("span", "me-ring");
    const addDisc = el("span", "me-new");
    const plus = icon("add", "default");
    if (plus) addDisc.append(plus);
    addRing.append(addDisc);
    add.append(addRing, el("span", "me-recipient-name", copy.add));
    if (options.onNew) add.addEventListener("click", options.onNew);
    list.append(add, group);

    const items = recipients.map((recipient, index) => {
      const item = el("button", "me-recipient");
      item.type = "button";
      item.setAttribute("role", "radio");
      const ring = el("span", "me-ring");
      const avatar = el("span", "me-avatar", recipient.initials);
      avatar.dataset.tone = String(recipient.tone || (index % 4) + 1);
      avatar.setAttribute("aria-hidden", "true");
      const check = el("span", "me-check");
      const mark = icon("check", "inline");
      if (mark) check.append(mark);
      ring.append(avatar, check);
      item.append(ring, el("span", "me-recipient-name", lang === "ar" ? recipient.nameAr || recipient.name : recipient.name));
      item.addEventListener("click", () => pick(index, false));
      item.addEventListener("keydown", (event) => {
        const rtl = root.dir === "rtl";
        const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 }[event.key];
        if (!step) return;
        event.preventDefault();
        pick((index + step + recipients.length) % recipients.length, true);
      });
      group.append(item);
      return item;
    });

    function paint() {
      items.forEach((item, index) => {
        const on = index === selected;
        item.setAttribute("aria-checked", on ? "true" : "false");
        item.tabIndex = on ? 0 : -1;
        item.dataset.selected = on ? "true" : "false";
      });
      const current = recipients[selected];
      account.textContent = current ? (lang === "ar" ? current.accountAr || current.account : current.account) || "" : "";
    }

    function pick(index, focus) {
      const changed = index !== selected;
      selected = index;
      paint();
      if (focus) items[index].focus();
      if (changed) {
        cue(items[index].querySelector(".me-check"));
        if (options.onSelect) options.onSelect(recipients[index], index);
      }
    }

    root.append(label, list);
    if (showAccount) root.append(account);
    paint();
    root.getSelected = () => recipients[selected];
    return root;
  }

  window.createAmountEntry = createAmountEntry;
  window.createKeypad = createKeypad;
  window.createKey = createKey;
  window.createRecipientStrip = createRecipientStrip;
  window.formatMoney = money;
})();
