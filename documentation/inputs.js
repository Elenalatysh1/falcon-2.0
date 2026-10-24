(function () {
  const page = document.querySelector('[data-page="inputs"]');
  if (!page || !window.createInput) return;

  const banks = [
    ["SNB", "Saudi National Bank", "NCBKSAJE", "snb"],
    ["RJHI", "Al Rajhi Bank", "RJHISARI", "rajhi"],
    ["RIBL", "Riyad Bank", "RIBLSARI", "riyad"],
    ["SABB", "Saudi Awwal Bank", "SABBSARI", "sabb"],
    ["ALBI", "Bank Albilad", "ALBISARI", "albilad"],
    ["INMA", "Alinma Bank", "INMASARI", "alinma"],
  ];
  const branches = [
    ["Olaya", "4 POS"],
    ["Al Malqa", "2 POS"],
    ["Jeddah Corniche", "3 POS"],
    ["Khobar Mall", "1 POS"],
    ["Online store", "0 POS"],
  ];
  const anatomy = [
    ["①", "Container", "H 60 · radius 8 · 1 px #D9D9D9"],
    ["②", "Label", "11 px when floating, 16 px as placeholder"],
    ["③", "Value", "16 px · numbers in IBM Plex Mono"],
    ["④", "Trailing slot", "Copy, clear, show/hide, status icon"],
    ["⑤", "Helper / error", "13 px · one line where possible"],
  ];
  const states = [
    ["Empty", "border #D9D9D9", "empty", "Company name (English)", "", "As written on your CR", "Label sits inside as the placeholder."],
    ["Hover", "border #A9B5B0", "hover", "Company name (English)", "", "As written on your CR", "Web only. Cursor changes to text."],
    ["Focus", "1.5 px ink + ring", "focus", "Company name (English)", "Khamis Ara", "As written on your CR", "Label floats up, caret in brand green."],
    ["Filled", "border #D9D9D9", "filled", "Company name (English)", "Khamis Arabia Trading Co", "", "Resting state after input."],
    ["Error", "border + label #E02424", "error", "Mobile number", "50 333 12", "Enter 9 digits starting with 5", "Shown on blur or submit. Says how to fix it."],
    ["Success", "check icon", "success", "CR number", "2346041544", "Verified with Wathq", "Only after a server check, not for format."],
    ["Disabled", "fill #F4F6F5", "disabled", "Number of locations", "3–10", "Turn off \"Apply to all CRs\" to edit", "Explain why it is locked."],
    ["Read-only", "no border change", "readonly", "Commercial registration", "Khamis Arabia Trading Co", "From Wathq · contact support to change", "Selectable and copyable, not editable."],
  ];
  const otpStates = [
    ["Empty", "", "", -1],
    ["Active", "482", "", 3],
    ["Error", "482910", "error", -1],
    ["Success", "482913", "success", -1],
    ["Locked", "", "disabled", -1],
  ];
  const rules = [
    ["Keep labels short and visible. The floating label replaces a separate placeholder.", "Disable a field without a helper line explaining why."],
    ["Validate on blur or submit, not on every keystroke. Clear the error as soon as the value is valid.", "Split IBAN or phone into several fields. Format one field as the user types."],
    ["Write error text that says how to fix it: \"Enter 9 digits starting with 5\".", "Show the helper line and the error message together."],
    ["Use the right keyboard on mobile: numeric for OTP, phone and amount.", "Write SAR or ر.س in amounts. Use the Riyal sign before the number."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-inputs="${name}"]`);
  }

  function tag(text) {
    return el("span", "in-tag", text || "Live");
  }

  function field(options) {
    return createInput(options);
  }

  function fillAnatomy() {
    const root = mount("anatomy");
    const sample = el("div", "in-sample");
    sample.append(
      el("span", "in-mark in-mark-label", "① ②"),
      el("span", "in-mark in-mark-slot", "④"),
      el("span", "in-mark in-mark-value", "③"),
      field({
        label: "Settlement IBAN",
        value: "SA03 8000 0000 6080",
        mono: true,
        state: "focus",
        trailingIcon: "copy",
      }),
    );
    const side = el("div");
    side.append(sample, el("p", "in-help", "⑤ Must match the CR owner's bank account."));
    const parts = el("div", "in-parts");
    anatomy.forEach(([mark, name, copy]) => {
      const part = el("div", "in-part");
      const text = el("div");
      text.append(el("strong", "", name), el("span", "", copy));
      part.append(el("b", "", mark), text);
      parts.append(part);
    });
    root.append(side, parts);
  }

  function fillStates() {
    const root = mount("states");
    states.forEach(([name, spec, state, label, value, hint, note]) => {
      const card = el("div", "in-card");
      const top = el("div", "in-card-top");
      top.append(el("span", "in-kicker", name), el("span", "in-spec", spec));
      card.append(top, field({
        label,
        value,
        hint,
        state,
        fill: state === "error" ? "error" : "",
      }), el("p", "in-note", note));
      root.append(card);
    });

    const live = el("div", "in-panel in-split");
    live.append(field({
      label: "Company name (English)",
      hint: "As written on your CR",
      validate(value, { touched }) {
        if (touched && value.trim().length > 0 && value.trim().length < 3) {
          return { error: "Name must be at least 3 characters" };
        }
        return { hint: "As written on your CR" };
      },
    }));
    const copy = el("div", "in-copy");
    copy.append(tag(), el("span", "", "Click the field, type, then click away. Leave it with fewer than 3 characters to see the error; it checks on blur, not while typing."));
    live.append(copy);
    mount("live-name").append(live);
  }

  function fillPassword() {
    const root = mount("password");
    const live = el("div", "in-panel");
    live.append(tag(), field({
      type: "password",
      label: "Create password",
      value: "Hala2026",
      placeholder: "At least 8 characters",
      strength: true,
    }));
    const sign = el("div", "in-panel");
    sign.append(el("span", "in-kicker", "Sign-in · hidden, error, confirm"));
    sign.append(field({
      label: "Password",
      value: "••••••••••",
      mask: "strong",
      state: "filled",
      trailingIcon: "show",
    }));
    const confirm = el("div", "in-sign");
    confirm.append(field({
      label: "Confirm password",
      value: "•••••••",
      mask: "strong",
      state: "error",
      fill: "error",
      hint: "Passwords don't match",
      trailingIcon: "show",
    }));
    sign.append(confirm);
    const meta = el("div", "in-meta");
    meta.append(el("span", "", "3 attempts left before a 15-minute lock"), el("a", "in-link", "Forgot password?"));
    meta.lastChild.href = "#inputs/inputs-password";
    sign.append(meta);
    root.append(live, sign);
  }

  function fillOtp() {
    const root = mount("otp");
    const live = el("div", "in-panel");
    const head = el("div", "in-row");
    head.append(tag(), el("span", "in-code", "demo code 123456"));
    live.append(head, createOtp({
      title: "Enter the code",
      description: "Sent by SMS to +966 50 ••• •• 26",
      match: "123456",
      countdown: 42,
    }));
    const board = el("div", "in-panel");
    board.append(el("span", "in-kicker", "States"));
    const list = el("div", "in-otp-list");
    otpStates.forEach(([name, value, status, active]) => {
      const row = el("div", "in-otp-state");
      row.append(el("span", "in-kicker in-otp-name", name), createOtp({
        value,
        status,
        active,
        interactive: false,
      }));
      list.append(row);
    });
    board.append(list);
    root.append(live, board);
  }

  function fillDropdowns() {
    const root = mount("dropdowns");
    const select = el("div", "in-panel in-drop");
    const selectHead = el("div", "in-row");
    selectHead.append(el("span", "in-kicker", "Select"), tag());
    const legend = el("div", "in-legend");
    [
      ["Hover", "#F2F6F4"],
      ["Selected", "tint + check"],
      ["Disabled", "gray + reason"],
      ["Keys", "↑ ↓ Enter Esc"],
    ].forEach(([name, detail]) => {
      const item = el("span");
      item.append(el("b", "", name), document.createTextNode(` · ${detail}`));
      legend.append(item);
    });
    select.append(selectHead, createSelect({
      label: "Transfer purpose",
      value: "Supplier payment",
      options: [
        { label: "Supplier payment", value: "Supplier payment" },
        { label: "Salaries", value: "Salaries" },
        { label: "Rent", value: "Rent" },
        { label: "Family support", value: "Family support", disabled: true, reason: "Not for this account" },
        { label: "Other", value: "Other" },
      ],
    }), legend);

    const combo = el("div", "in-panel in-drop");
    const comboHead = el("div", "in-row");
    comboHead.append(el("span", "in-kicker", "Searchable combobox"), tag());
    const bank = createSelect({
      kind: "combobox",
      label: "Beneficiary bank",
      placeholder: "Search banks",
      value: "SNB",
      limit: 4,
      emptyTitle: (query) => `No banks match "${query}"`,
      emptyHint: "Check the spelling or enter the IBAN; we'll find the bank.",
      options: banks.map(([value, label, code, mark]) => ({
        value,
        label,
        code,
        mark,
        initials: value.slice(0, 2),
      })),
    });
    bank.dataset.state = "focus";
    combo.append(comboHead, bank);

    const multi = el("div", "in-panel in-drop");
    const multiHead = el("div", "in-row");
    multiHead.append(el("span", "in-kicker", "Multi-select"), tag());
    multi.append(multiHead, createSelect({
      kind: "multi",
      label: "Branches",
      value: ["Olaya", "Al Malqa"],
      emptyLabel: "All branches",
      countLabel: (count, total) => (count ? `${count} of ${total} selected` : "Showing all"),
      options: branches.map(([label, meta]) => ({ value: label, label, meta })),
    }));
    root.append(select, combo, multi);
  }

  function fillSpecial() {
    const root = mount("special");
    const phone = el("div", "in-card");
    phone.append(el("span", "in-kicker", "Phone · live"), field({
      label: "Mobile number",
      value: "50 333 12",
      format: "phone",
      prefix: "+966",
      placeholder: "5X XXX XXXX",
      phone: { success: "Matches Absher record", error: "Enter 9 digits starting with 5" },
    }));
    const iban = el("div", "in-card");
    iban.append(el("span", "in-kicker", "IBAN · live"), field({
      label: "IBAN",
      value: "SA03 8000 0000 6080 1016 7519",
      format: "iban",
      placeholder: "SA00 0000 0000 0000 0000 0000",
      iban: {
        banks: { 80: "Al Rajhi", 10: "SNB", 20: "Riyad Bank", 45: "SAB", 15: "Albilad", "05": "Alinma" },
        done: "24 characters · bank detected from the IBAN",
      },
    }));
    const amount = el("div", "in-card");
    amount.append(el("span", "in-kicker", "Amount · live"), field({
      label: "Amount",
      value: "25,000.00",
      format: "amount",
      suffix: "SAR",
      placeholder: "0.00",
      amount: {
        limit: 175000,
        available: "Available SAR 175,000.00",
        over: "More than your available SAR 175,000.00",
      },
    }));
    const date = el("div", "in-card");
    date.append(
      el("span", "in-kicker", "Date"),
      field({
        label: "Date of birth",
        value: "12 / 12 / 1991",
        mono: true,
        state: "filled",
        trailingIcon: "calendar",
        trailingTone: "secondary",
      }),
      el("span", "in-caption", "DD / MM / YYYY · Gregorian or Hijri toggle in the picker"),
    );
    const note = el("div", "in-card");
    note.append(el("span", "in-kicker", "Textarea · live"), field({
      type: "textarea",
      label: "Note to beneficiary",
      value: "Invoice INV-2041, September supplies",
      placeholder: "Visible on their statement",
      maxLength: 140,
    }));
    const file = el("div", "in-card");
    file.append(el("span", "in-kicker", "File upload · empty, uploading, done"));
    file.append(createUpload({
      state: "empty",
      title: "Drop CR document or browse",
      browse: "browse",
      hint: "PDF, JPG · up to 10 MB",
    }));
    file.append(createUpload({ state: "uploading", file: "VAT-certificate.pdf", progress: "64%" }));
    file.append(createUpload({ state: "done", file: "CR-2346041544.pdf", meta: "1.2 MB" }));
    root.append(phone, iban, amount, date, note, file);
  }

  function fillCompact() {
    const root = mount("compact");
    const panel = el("div", "in-panel in-toolbar");
    const filters = el("div", "in-toolbar-row");
    const search = field({
      size: "md",
      shape: "pill",
      float: false,
      leadingIcon: "search",
      placeholder: "Search transactions",
      kbd: "⌘K",
    });
    search.classList.add("in-search");
    const status = field({
      size: "md",
      shape: "pill",
      float: false,
      label: "Status",
      value: "Settled",
      emphasis: true,
      state: "filled",
      trailingIcon: "expand",
    });
    const terminal = field({
      size: "md",
      shape: "pill",
      float: false,
      label: "Terminal",
      value: "All",
      emphasis: true,
      state: "filled",
      trailingIcon: "expand",
    });
    const min = field({
      size: "md",
      shape: "pill",
      float: false,
      label: "Min",
      value: "SAR 500",
      mono: true,
      state: "focus",
    });
    filters.append(search, status, terminal, min);
    const dense = el("div", "in-toolbar-row");
    const filter = field({
      size: "sm",
      float: false,
      leadingIcon: "search",
      placeholder: "Filter by name or IBAN",
    });
    filter.classList.add("in-filter");
    const bad = field({
      size: "sm",
      float: false,
      value: "SAR -20",
      mono: true,
      state: "error",
      fill: "error",
    });
    bad.classList.add("in-mini");
    bad.querySelector("input").setAttribute("aria-label", "Amount");
    const off = field({
      size: "sm",
      float: false,
      value: "Disabled",
      state: "disabled",
    });
    off.classList.add("in-mini");
    off.querySelector("input").setAttribute("aria-label", "Disabled field");
    dense.append(filter, bad, off, el("span", "in-caption", "S 36 · radius 10 · in tables and side panels"));
    panel.append(filters, dense);
    root.append(panel);
  }

  function fillSelection() {
    if (!window.createChoice) return;
    const root = mount("selection");
    const rows = [
      ["Checkbox", [
        ["checkbox", {}],
        ["checkbox", { checked: true }],
        ["checkbox", { mixed: true }],
        ["checkbox", { checked: true, state: "focus" }],
        ["checkbox", { error: true }],
        ["checkbox", { disabled: true }],
      ], ["Off", "On", "Mixed", "Focus", "Error", "Disabled"]],
      ["Radio", [
        ["radio", {}],
        ["radio", { checked: true }],
        ["radio", { checked: true, state: "focus" }],
        ["radio", { checked: true, disabled: true }],
      ], ["Off", "On", "Focus", "Disabled"]],
      ["Toggle", [
        ["switch", {}],
        ["switch", { checked: true }],
        ["switch", { checked: true, disabled: true }],
      ], ["Off", "On", "Disabled"]],
    ];
    rows.forEach(([name, items, labels]) => {
      const row = el("div", "in-choice-row");
      const set = el("div", "in-choice-set");
      items.forEach(([kind, options], index) => {
        const item = el("div", "in-choice");
        item.append(createChoice({ kind, visual: true, ...options }), el("span", "in-choice-name", labels[index]));
        set.append(item);
      });
      row.append(el("strong", "", name), set);
      root.append(row);
    });
  }

  function fillArabic() {
    const root = mount("arabic");
    if (!root) return;
    const wrap = el("div", "in-special");
    wrap.dir = "rtl";
    wrap.lang = "ar";
    wrap.style.fontFamily = "var(--font-arabic)";
    wrap.append(
      field({ label: "اسم المنشأة", value: "شركة خميس العربية للتجارة", hint: "كما هو في السجل التجاري" }),
      field({ label: "رقم الجوال", value: "50 333 12", format: "phone", prefix: "+966", error: "أدخل 9 أرقام تبدأ بـ 5", state: "error" }),
      field({ label: "كلمة المرور", type: "password", value: "Hala2026!", hint: "8 أحرف على الأقل" }),
      field({ label: "المبلغ", value: "25000", format: "amount", amount: { available: "المتاح 175,000.00" } }),
    );
    const otp = createOtp({
      title: "أدخل الرمز",
      description: "أُرسل برسالة نصية إلى +966 50 ••• •• 26",
      value: "482",
      active: 3,
      interactive: false,
      lang: "ar",
      prompt: "لم يصلك الرمز؟",
      resendLabel: "إعادة الإرسال",
      resendIn: "إعادة الإرسال",
    });
    root.append(wrap, otp);
  }

  function fillUsage() {
    const root = mount("usage");
    rules.forEach(([yes, no], index) => {
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

  fillAnatomy();
  fillStates();
  fillPassword();
  fillOtp();
  fillDropdowns();
  fillSpecial();
  fillCompact();
  fillSelection();
  fillArabic();
  fillUsage();
})();
