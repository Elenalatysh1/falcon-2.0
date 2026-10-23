(function () {
  const page = document.querySelector('[data-page="money-entry"]');
  if (!page || !window.createAmountEntry) return;

  const BALANCE = 45000;
  const RECIPIENTS = [
    { name: "Almarai", nameAr: "المراعي", initials: "AS", tone: 1, account: "SA44 2000 •••• 8812 · Al Rajhi", accountAr: "الراجحي · SA44 2000 •••• 8812" },
    { name: "STC", initials: "ST", tone: 2, account: "SA03 8000 •••• 2210 · SNB", accountAr: "الأهلي · SA03 8000 •••• 2210" },
    { name: "Khamis", nameAr: "خميس", initials: "KT", tone: 3, account: "SA61 0500 •••• 0457 · Alinma", accountAr: "الإنماء · SA61 0500 •••• 0457" },
    { name: "Faisal", nameAr: "فيصل", initials: "FA", tone: 4, account: "SA12 1000 •••• 3391 · Riyad Bank", accountAr: "بنك الرياض · SA12 1000 •••• 3391" },
  ];
  const CONTACTS = {
    en: [
      { value: "almarai-supply", label: "Almarai Supply Co.", code: "SA44 •••• 8812 · Al Rajhi", initials: "AS", mark: "contact" },
      { value: "almarai-restaurants", label: "Almarai Restaurants", code: "SA03 •••• 2210 · SNB", initials: "AR", mark: "contact" },
      { value: "almarai-dairy", label: "Almarai Dairy", code: "SA61 •••• 0457 · Alinma", initials: "AD", mark: "contact" },
    ],
    ar: [
      { value: "almarai-supply", label: "شركة المراعي للتوريد", code: "SA44 •••• 8812 · الراجحي", initials: "شم", mark: "contact" },
      { value: "almarai-restaurants", label: "مطاعم المراعي", code: "SA03 •••• 2210 · الأهلي", initials: "مم", mark: "contact" },
      { value: "almarai-dairy", label: "المراعي للألبان", code: "SA61 •••• 0457 · الإنماء", initials: "مل", mark: "contact" },
    ],
  };
  const T = {
    en: {
      title: "Send money",
      sub: "Pay a supplier or another business from your Hala account.",
      to: "To",
      toValue: "Almarai Supply Co.",
      toHint: "Search by name, IBAN or phone",
      reference: "Reference (optional)",
      referenceHint: "As written on your CR",
      draft: "Changes stay a draft until you submit.",
      cancel: "Cancel",
      submit: "Save and submit",
      next: "Continue",
      combobox: "Recipient combobox on web",
      search: "Search by name, IBAN or phone",
    },
    ar: {
      title: "إرسال الأموال",
      sub: "ادفع لمورد أو منشأة أخرى من حسابك في هلا.",
      to: "إلى",
      toValue: "شركة المراعي للتوريد",
      toHint: "ابحث بالاسم أو الآيبان أو رقم الجوال",
      reference: "المرجع (اختياري)",
      referenceHint: "كما هو في السجل التجاري",
      draft: "تبقى التغييرات مسودة حتى ترسلها.",
      cancel: "إلغاء",
      submit: "حفظ وإرسال",
      next: "متابعة",
      combobox: "اختيار المستفيد على الويب",
      search: "ابحث بالاسم أو الآيبان أو رقم الجوال",
    },
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-me="${name}"]`);
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

  function transferForm(lang = "en") {
    const t = T[lang];
    const root = el("div", "med-web");
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const head = el("div", "med-head");
    head.append(el("h3", "med-title", t.title), el("p", "med-sub", t.sub));

    const card = el("div", "med-card");
    const submit = createButton({ label: t.submit, variant: "primary", size: "md" });
    const amount = createAmountEntry({
      value: 1250,
      balance: BALANCE,
      lang,
      onChange: (_, state) => { submit.disabled = state !== "filled"; },
    });
    card.append(
      createInput({ label: t.to, value: t.toValue, leadingIcon: "search", hint: t.toHint }),
      amount,
      createInput({ label: t.reference, value: "INV-2026-1043", hint: t.referenceHint, mono: true }),
    );
    submit.disabled = amount.getState() !== "filled";

    const bar = el("div", "med-bar");
    const actions = el("div", "med-actions");
    actions.append(createButton({ label: t.cancel, variant: "secondary", size: "md" }), submit);
    bar.append(el("span", "med-note", t.draft), actions);
    root.append(head, card, bar);
    return root;
  }

  function combobox(lang = "en") {
    const t = T[lang];
    const panel = el("div", "med-combo");
    panel.lang = lang;
    panel.dir = lang === "ar" ? "rtl" : "ltr";
    const select = createSelect({
      kind: "combobox",
      label: t.to,
      placeholder: t.search,
      query: lang === "ar" ? "المر" : "Alm",
      value: "almarai-supply",
      options: CONTACTS[lang],
    });
    select.dataset.state = "focus";
    panel.append(el("strong", "med-combo-title", t.combobox), select, el("span", "med-hint", t.toHint));
    return panel;
  }

  function sendMoney(lang = "en", options = {}) {
    const t = T[lang];
    const body = el("div", "med-send");
    body.lang = lang;
    body.dir = lang === "ar" ? "rtl" : "ltr";
    const strip = createRecipientStrip({ recipients: RECIPIENTS, selected: "Almarai", lang });
    const next = createButton({ label: t.next, variant: "primary", size: "lg" });
    next.classList.add("med-wide");
    const amount = createAmountEntry({
      value: options.value == null ? 1250 : options.value,
      balance: BALANCE,
      keypad: true,
      lang,
      onChange: (_, state) => { next.disabled = state !== "filled"; },
    });
    next.disabled = amount.getState() !== "filled";
    const keypad = createKeypad({ type: "amount", lang, onKey: (kind, digit) => amount.press(kind === "digit" ? "digit" : kind, digit) });
    const foot = el("div", "med-foot");
    foot.append(next, keypad);
    body.append(strip, amount, foot);
    return body;
  }

  function pinEntry() {
    const body = el("div", "med-pin");
    let code = "482";
    const host = el("div", "med-otp");
    function paint() {
      host.replaceChildren(createOtp({
        length: 6,
        value: code,
        active: Math.min(code.length, 5),
        interactive: false,
        title: "Enter the code",
        description: "Sent by SMS to +966 50 ••• •• 26",
      }));
    }
    paint();
    const resend = el("p", "med-resend");
    resend.append(document.createTextNode("Didn't get it? Resend in "), el("span", "med-mono", "0:40"));
    const keypad = createKeypad({
      type: "pin",
      style: "keys",
      label: "PIN keypad",
      onKey: (kind, digit) => {
        if (kind === "digit" && code.length < 6) code += digit;
        if (kind === "delete") code = code.slice(0, -1);
        paint();
      },
    });
    const top = el("div", "med-pin-top");
    top.append(host, resend);
    body.append(top, keypad);
    return body;
  }

  function phone(title, body, caption, options = {}) {
    const card = el("figure", "lst-phone-card");
    const screen = el("div", "lst-phone med-phone");
    if (options.lang === "ar") {
      screen.dir = "rtl";
      screen.lang = "ar";
    }
    const bar = el("div", "med-phone-bar");
    const close = createButton({ variant: "ghost", size: "sm", icon: "close", iconOnly: true, ariaLabel: options.lang === "ar" ? "إغلاق" : "Close" });
    bar.append(close, el("span", "med-phone-title", title), createButton({ label: options.lang === "ar" ? "تم" : "Done", variant: "ghost", size: "sm", role: "inline" }));
    screen.append(bar, body);
    card.append(screen, el("figcaption", "lst-caption", caption));
    return card;
  }

  function fillWeb() {
    const host = mount("web");
    const split = el("div", "med-split");
    split.append(transferForm(), combobox());
    host.append(block("Transfer form · recipient combobox, Amount entry with quick amounts, reference and the action bar", split, "Live · type an amount"));
  }

  function fillMobile() {
    mount("mobile").append(
      phone("Send money", sendMoney(), "iOS · Recipient strip, Amount entry and the Amount keypad"),
      phone("Enter PIN", pinEntry(), "Android · PIN keypad with Keys and letters"),
      phone("إرسال الأموال", sendMoney("ar"), "Arabic · the keypad and the amount do not mirror", { lang: "ar" }),
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

  function keyRow() {
    const row = el("div", "med-keys");
    [["digit", "default"], ["digit", "pressed"], ["digit", "disabled"], ["delete", "default"], ["delete", "pressed"], ["delete", "disabled"], ["biometric", "default"], ["biometric", "pressed"], ["biometric", "disabled"]].forEach(([kind, state]) => {
      const cell = el("div", "dtd-state med-key-cell");
      cell.append(createKey({ kind, digit: "1", state: state === "default" ? "specimen" : state }), el("span", "lst-kicker", `${kind} · ${state}`));
      row.append(cell);
    });
    return row;
  }

  function fillComponents() {
    mount("components").append(
      specimen("Amount entry", "Entering how much to send, pay or request.", "App: top of Send money above the Keypad. Web: inside the transfer form card.", "Empty shows a grey 0; Filled; Error when it exceeds the balance (red and the reason). The caption shows the available balance; quick amounts use the existing amount Chip. The number never mirrors.", createAmountEntry({ value: 1250, balance: BALANCE })),
      specimen("Keypad", "In-app number entry on phone and iPad.", "Under Amount entry (Amount, Plain), PIN screens (PIN, Keys), phone number entry (Phone, Keys).", "Western digits only. Never mirrors in Arabic, like the system keypads. Fills the screen width.", createKeypad({ type: "amount" })),
      specimen("Recipient strip", "Picking who to send to in the app.", "Top of Send money, under the mobile top bar.", "New and recent recipients, one Selected, and the chosen account in mono. On web use the Dropdown field (Combobox) with Contact options instead.", createRecipientStrip({ recipients: RECIPIENTS, selected: "Almarai" })),
      specimen("Key", "Internal part. Don't place it directly.", "Inside Keypad.", "Digit, Decimal, Delete, Empty and Biometric × Default, Pressed and Disabled × Plain and Keys.", keyRow()),
    );
  }

  function stateCell(name, node) {
    const cell = el("div", "dtd-state med-state");
    cell.append(node, el("span", "lst-kicker", name));
    return cell;
  }

  function fillStates() {
    const host = mount("states");
    const pads = el("div", "med-grid");
    ["plain", "keys"].forEach((style) => ["amount", "pin", "phone"].forEach((type) => {
      pads.append(stateCell(`${type} · ${style}`, createKeypad({ type, style, label: `${type} keypad, ${style}` })));
    }));
    host.append(block("Keypad · Amount, PIN, Phone × Plain, Keys", pads));

    host.append(block("Key · Default, Pressed, Disabled", keyRow()));

    const entries = el("div", "med-grid");
    entries.dataset.cols = "2";
    [["", "Empty"], ["1250", "Filled"], ["52000", "Error"]].forEach(([value, name]) => {
      ["en", "ar"].forEach((lang) => {
        entries.append(stateCell(`${name} · ${lang === "ar" ? "RTL" : "LTR"}`, createAmountEntry({ value, balance: BALANCE, lang })));
      });
    });
    host.append(block("Amount entry · Empty, Filled, Error in both directions", entries, "Live · type"));

    const chips = el("div", "dtd-row");
    [false, true].forEach((selected) => {
      const chip = createButton({ label: "1,000", variant: "ghost", size: "sm", role: "amount", selected });
      chip.prepend(Object.assign(el("span", "list-sar"), { ariaHidden: "true" }));
      chips.append(stateCell(selected ? "Selected" : "Default", chip));
    });
    host.append(block("Chip (role amount) · Default and Selected — the existing Button, reused", chips));

    const strips = el("div", "med-grid");
    strips.dataset.cols = "2";
    strips.append(
      stateCell("LTR", createRecipientStrip({ recipients: RECIPIENTS, selected: "Almarai" })),
      stateCell("RTL", createRecipientStrip({ recipients: RECIPIENTS, selected: "Almarai", lang: "ar" })),
    );
    host.append(block("Recipient strip · LTR and RTL", strips, "Live · arrow keys"));
  }

  function fillArabic() {
    const host = mount("arabic");
    const split = el("div", "med-split");
    split.append(transferForm("ar"), combobox("ar"));
    host.append(block("Arabic · the form mirrors, the amount and its digits do not", split, "Live"));
  }

  function fillResponsive() {
    const host = mount("responsive");
    const stack = el("div", "dtd-stack");
    const frame = el("div", "dtd-frame med-frame");
    frame.dataset.width = "desktop";
    function paint(width) {
      frame.dataset.width = width;
      frame.replaceChildren(width === "desktop" ? transferForm() : sendMoney());
    }
    paint("desktop");
    stack.append(
      segment("Breakpoint", [["desktop", "Web"], ["tablet", "iPad app · 760"], ["mobile", "Phone app · 390"]], "desktop", paint),
      frame,
    );
    host.append(block("Web uses the form and combobox; the iPad and phone apps use the strip and the in-app keypad", stack, "Live · width"));
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "AmountEntry, Keypad, Key, RecipientStrip", "Amount entry is a text input with inputmode decimal, aria-invalid and the caption as its description · quick amounts are the amount Chip with aria-pressed · the web uses a Combobox for recipients and the system keyboard · Keypad and Recipient strip are for the app"],
      ["iOS", "Same names · TextField with .keyboardType(.decimalPad) hidden behind a custom Keypad, ScrollView strip", "Keys are 56 pt pill buttons with .sensoryFeedback(.selection) · VoiceOver reads \"1,250.00 Saudi riyals, more than your available balance\" · the keypad keeps its layout in Arabic · press scale on --motion-instant"],
      ["Android", "Same names · BasicTextField with a custom Keypad, LazyRow strip", "Keys are 56 dp with ripple and HapticFeedbackType.TextHandleMove · contentDescription on Delete and Face ID · the keypad sets layoutDirection Ltr in Arabic · honours the animator duration scale"],
    ].forEach(([platform, api, notes]) => {
      const line = el("div", "lst-platform");
      line.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(line);
    });
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Show the available balance under the amount and turn it red only when the amount is over it.", "Let people continue with an amount over the balance, or hide the reason."],
      ["Keep the keypad in Western digits and the same layout in Arabic.", "Mirror the keypad or switch to Arabic-Indic digits — muscle memory breaks."],
      ["Pick the recipient first; show their account in mono under the strip.", "Ask for the amount before people can see who receives it."],
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
