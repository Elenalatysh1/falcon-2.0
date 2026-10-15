(function () {
  const page = document.querySelector('[data-page="selection"]');
  if (!page || !window.createChoice) return;

  const s = {
    kids: { a: true, b: true, c: false, d: false },
    terms: false,
    termsTried: false,
    apply: true,
    radio: "daily",
    inl: "Virtual",
    tg: { online: true, nfc: true, intl: false, atm: false, freeze: false },
    tgLoad: null,
    confirm: false,
    biz: 1,
    plan: 1,
    tiles: { pos: true, ecom: true },
    segL: 0,
    segS: 1,
    choice: 1,
    filters: { Settled: true, mada: true },
    mTg: { online: true, nfc: true, intl: false, freeze: false, push: true, email: false },
    mLoad: null,
    mToast: "",
    mPrev: null,
    mSheet: true,
    mSch: "daily",
    mSeg: 0,
    mCard: 0,
    mLim: 1,
    mSt: { Settled: true },
    mBr: { Olaya: true, "Al Malqa": true },
  };
  let toastTimer;

  const terminals = [
    ["a", "Olaya · counter 1", "TID 40021187"],
    ["b", "Olaya · counter 2", "TID 40021188"],
    ["c", "Al Malqa · drive-thru", "TID 40021301"],
    ["d", "Jeddah Corniche", "TID 40021455"],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-selection="${name}"]`);
  }

  function live(title) {
    const row = el("div", "sel-title");
    row.append(el("span", "sel-kicker", title), el("span", "sel-live", "Live"));
    return row;
  }

  function fillMatrix() {
    const root = mount("matrix");
    const groups = [
      ["checkbox", [
        ["Checkbox · off", "18 · radius 5", false],
        ["Checkbox · on", "fill brand/600", true],
        ["Checkbox · mixed", "parent, some on", "mixed"],
      ]],
      ["radio", [
        ["Radio · off", "18 · circle", false],
        ["Radio · on", "dot 8", true],
      ]],
      ["switch", [
        ["Toggle · off", "44 × 26", false],
        ["Toggle · on", "brand gradient", true],
      ]],
    ];
    const states = [
      ["", {}],
      ["hover", { state: "hover" }],
      ["pressed", { state: "pressed" }],
      ["focus", { state: "focus" }],
      ["disabled", { disabled: true }],
      ["error", { error: true }],
    ];
    groups.forEach(([kind, rows]) => {
      const sheet = el("div", "sel-sheet");
      rows.forEach(([name, spec, value], index) => {
        const row = el("div", "sel-matrix");
        if (!index) row.style.borderTopColor = "transparent";
        const title = el("div", "sel-name", name);
        title.append(el("span", "", spec));
        row.append(title);
        states.forEach(([, options]) => {
          const cell = el("div", "sel-cell");
          cell.append(createChoice({
            kind,
            bare: true,
            checked: value === true,
            mixed: value === "mixed",
            ...options,
          }));
          row.append(cell);
        });
        sheet.append(row);
      });
      root.append(sheet);
    });
  }

  function fillSpecs() {
    const root = mount("specs");
    [
      ["Hover", "Web only. Border darkens to text/secondary; on-state fill to brand/700."],
      ["Pressed", "Soft green halo. Also the tap feedback on mobile."],
      ["Focus", "Keyboard only. 2 px green ring with a white gap."],
      ["Disabled", "Grayed out, label at 4.5:1. Explain why nearby."],
      ["Error", "Red border, plus a message under the group saying what to do."],
      ["Mixed", "Only for a parent checkbox. Tapping it turns all children on."],
    ].forEach(([title, copy]) => {
      const card = el("div", "sel-spec");
      card.append(el("strong", "", title), el("span", "sel-help", copy));
      root.append(card);
    });
  }

  function fillTree() {
    const root = mount("tree");
    root.replaceChildren();
    const onCount = terminals.filter(([id]) => s.kids[id]).length;
    const all = onCount === terminals.length;
    const some = onCount > 0 && !all;
    root.append(createChoice({
      kind: "checkbox",
      label: "All terminals",
      sub: `${onCount} of ${terminals.length}`,
      checked: all,
      mixed: some,
      onChange: () => {
        const next = !all;
        terminals.forEach(([id]) => { s.kids[id] = next; });
        fillTree();
      },
    }));
    const kids = el("div", "sel-kids");
    terminals.forEach(([id, label, tid]) => {
      kids.append(createChoice({
        kind: "checkbox",
        label,
        sub: tid,
        checked: !!s.kids[id],
        onChange: () => {
          s.kids[id] = !s.kids[id];
          fillTree();
        },
      }));
    });
    root.append(kids);
  }

  function fillTerms() {
    const root = mount("terms");
    root.replaceChildren();
    const choice = createChoice({
      kind: "checkbox",
      checked: s.terms,
      error: s.termsTried && !s.terms,
      onChange: () => {
        s.terms = !s.terms;
        fillTerms();
      },
    });
    const copy = el("span", "choice-copy");
    const label = el("span", "choice-label");
    label.append("I agree to the ");
    label.append(el("span", "sel-link", "POS rental terms"));
    label.append(" and confirm the business details are correct.");
    copy.append(label);
    choice.append(copy);
    root.append(choice);
    if (s.termsTried && !s.terms) root.append(el("p", "sel-error", "Accept the terms to place the order."));
    const button = createButton({
      label: s.termsTried && s.terms ? "Order placed" : "Place order",
      variant: "primary",
      size: "md",
    });
    button.addEventListener("click", () => {
      s.termsTried = true;
      fillTerms();
    });
    root.append(button);
    const inline = el("div", "sel-inline");
    inline.append(el("span", "sel-kicker", "Inline · apply to all CRs"));
    inline.append(createChoice({
      kind: "checkbox",
      label: "Apply this information to all CRs",
      checked: s.apply,
      onChange: () => {
        s.apply = !s.apply;
        fillTerms();
      },
    }));
    root.append(inline);
  }

  function fillRadios() {
    const root = mount("radios");
    root.replaceChildren();
    [
      ["instant", "Instant", "Sales land in your account in seconds", "0.2%"],
      ["daily", "Daily", "Next business day at 9 am", "Free"],
      ["weekly", "Weekly", "Every Sunday, one transfer", "Free"],
      ["manual", "On request", "Available on the Enterprise plan", "", true],
    ].forEach(([id, label, sub, fee, disabled]) => {
      root.append(createChoice({
        kind: "radio",
        label,
        sub,
        extra: fee,
        checked: s.radio === id,
        disabled: !!disabled,
        onChange: () => {
          s.radio = id;
          fillRadios();
        },
      }));
    });
  }

  function fillPay() {
    const root = mount("pay");
    ["Me", "Beneficiary"].forEach((label) => {
      root.append(createChoice({ kind: "radio", label, error: true }));
    });
  }

  function fillInline() {
    const root = mount("inline");
    root.replaceChildren();
    ["Virtual", "Physical"].forEach((label) => {
      root.append(createChoice({
        kind: "radio",
        label,
        checked: s.inl === label,
        onChange: () => {
          s.inl = label;
          fillInline();
        },
      }));
    });
  }

  function fillToggles() {
    const root = mount("toggles");
    root.replaceChildren();
    [
      ["online", "Online payments", "Websites and apps", "language"],
      ["nfc", "Contactless", "Tap to pay up to SAR 300", "contactless"],
      ["intl", "International", "Waits for the server", "language"],
      ["atm", "ATM withdrawals", "Locked by the account admin", "cards", true],
      ["freeze", "Freeze all cards", "Asks to confirm first", "freeze"],
    ].forEach(([id, label, sub, icon, locked]) => {
      const loading = s.tgLoad === id;
      root.append(createChoice({
        kind: "switch",
        label,
        sub: loading ? "Updating…" : sub,
        icon,
        checked: !!s.tg[id],
        disabled: !!locked || loading,
        loading,
        danger: id === "freeze",
        onChange: () => {
          if (id === "freeze" && !s.tg.freeze) {
            s.confirm = true;
            fillConfirm();
            return;
          }
          if (id === "intl") {
            s.tgLoad = id;
            fillToggles();
            setTimeout(() => {
              s.tgLoad = null;
              s.tg.intl = !s.tg.intl;
              fillToggles();
            }, 900);
            return;
          }
          s.tg[id] = !s.tg[id];
          fillToggles();
        },
      }));
    });
  }

  function fillConfirm() {
    const root = mount("confirm");
    root.replaceChildren();
    if (!s.confirm) {
      root.append(el("span", "sel-kicker", "Behaviour"));
      root.append(el("p", "sel-help", "“International” waits for the server. “Freeze all cards” asks to confirm before switching. “ATM withdrawals” is locked by the account admin."));
      return;
    }
    root.append(el("strong", "", "Freeze all cards?"));
    root.append(el("p", "sel-help", "All 8 team cards stop working right away, including subscriptions. You can unfreeze at any time."));
    const actions = el("div", "sel-row");
    const cancel = createButton({ label: "Cancel", variant: "secondary", size: "md" });
    const ok = createButton({ label: "Freeze cards", variant: "destructive", size: "md" });
    cancel.addEventListener("click", () => {
      s.confirm = false;
      fillConfirm();
    });
    ok.addEventListener("click", () => {
      s.tg.freeze = true;
      s.confirm = false;
      fillToggles();
      fillConfirm();
    });
    actions.append(cancel, ok);
    root.append(actions);
  }

  function fillSwitchSizes() {
    const root = mount("switch-sizes");
    [
      ["lg", "L 52×32 · mobile"],
      ["md", "M 44×26 · web"],
      ["sm", "S 34×20 · tables"],
    ].forEach(([size, label]) => {
      const row = el("div", "sel-size");
      row.append(createChoice({ kind: "switch", bare: true, checked: true, size: size === "md" ? "" : size }));
      row.append(el("span", "", label));
      root.append(row);
    });
  }

  function fillCardStates() {
    const root = mount("card-states");
    [
      ["Default", ""],
      ["Hover", "hover"],
      ["Selected", "selected"],
      ["Focus", "focus"],
      ["Disabled", "disabled"],
      ["Error", "error"],
    ].forEach(([name, state]) => {
      const item = el("div", "sel-state");
      const card = el("div", "sel-mini");
      if (state === "selected" || state === "focus") card.dataset.on = "true";
      if (state) card.dataset.state = state;
      const well = el("span", "sel-well");
      const icon = drawChoiceIcon("cards");
      if (icon) well.append(icon);
      const radio = createChoice({ kind: "radio", visual: true, checked: state === "selected" || state === "focus", error: state === "error", disabled: state === "disabled" });
      card.append(well, radio);
      item.append(card, el("span", "sel-kicker", name));
      root.append(item);
    });
  }

  function fillBiz() {
    const root = mount("biz");
    root.replaceChildren();
    [
      ["Shop", "Retail stores and boutiques", ""],
      ["Restaurant", "Restaurants, cafés, cloud kitchens", "soft"],
      ["Supplier", "Wholesale and B2B services", "ink"],
      ["Corporate", "Spend, payroll and teams", "approved"],
    ].forEach(([name, desc, art], index) => {
      const card = el("button", "sel-photo");
      card.type = "button";
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", s.biz === index ? "true" : "false");
      const picture = el("span", "sel-art");
      if (art) picture.dataset.art = art;
      const copy = el("span", "sel-photo-copy");
      copy.append(el("strong", "", name), el("span", "", desc));
      card.append(picture, copy);
      card.addEventListener("click", () => {
        s.biz = index;
        fillBiz();
      });
      root.append(card);
    });
  }

  function fillPlans() {
    const root = mount("plans");
    root.replaceChildren();
    [
      ["Monthly rental", "Cancel anytime", "SAR 99", "per month", ""],
      ["Annual rental", "Billed yearly, 20% less", "SAR 79", "per month", "Save 20%"],
      ["Buy outright", "12-month warranty", "SAR 1,450", "one-time", ""],
    ].forEach(([name, desc, price, unit, tag], index) => {
      const card = el("button", "sel-plan");
      card.type = "button";
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", s.plan === index ? "true" : "false");
      card.append(createChoice({ kind: "radio", visual: true, checked: s.plan === index }));
      const copy = el("span", "choice-copy");
      const title = el("strong", "", name);
      if (tag) title.append(el("span", "sel-tag", tag));
      copy.append(title, el("span", "", desc));
      const cost = el("span", "sel-price");
      cost.append(el("strong", "", price), el("span", "", unit));
      card.append(copy, cost);
      card.addEventListener("click", () => {
        s.plan = index;
        fillPlans();
      });
      root.append(card);
    });
  }

  function fillTiles() {
    const root = mount("tiles");
    root.replaceChildren();
    [
      ["pos", "POS terminals", "In-store payments", "pos"],
      ["ecom", "eCommerce", "Website checkout", "ecommerce"],
      ["inv", "Invoicing", "Payment links", "invoicing"],
      ["cards", "Corporate cards", "Team spend", "cards"],
      ["pay", "Payroll", "WPS salaries", "payroll"],
      ["food", "Food delivery", "Coming in 2027", "food-delivery", true],
    ].forEach(([id, label, sub, icon, locked]) => {
      const on = !!s.tiles[id];
      const card = el("button", "sel-tile");
      card.type = "button";
      card.setAttribute("role", "checkbox");
      card.setAttribute("aria-checked", on ? "true" : "false");
      if (locked) card.disabled = true;
      const top = el("span", "sel-tile-top");
      const well = el("span", "sel-well");
      const glyph = drawChoiceIcon(icon);
      if (glyph) well.append(glyph);
      top.append(well, createChoice({ kind: "checkbox", visual: true, checked: on, disabled: !!locked }));
      card.append(top, el("strong", "", label), el("span", "", sub));
      card.addEventListener("click", () => {
        if (locked) return;
        s.tiles[id] = !s.tiles[id];
        fillTiles();
      });
      root.append(card);
    });
    const count = Object.values(s.tiles).filter(Boolean).length;
    mount("tiles-count").textContent = `${count} selected · you can change this later`;
  }

  function segmented(root, labels, key, size) {
    root.replaceChildren();
    labels.forEach((label, index) => {
      const button = createButton({
        label,
        variant: "ghost",
        size,
        role: "segment",
        selected: s[key] === index,
      });
      button.addEventListener("click", () => {
        s[key] = index;
        segmented(root, labels, key, size);
      });
      root.append(button);
    });
  }

  function fillChoice() {
    const root = mount("choice");
    root.replaceChildren();
    ["Today", "This week", "This month", "Custom"].forEach((label, index) => {
      const button = createButton({
        label,
        variant: s.choice === index ? "ink" : "secondary",
        size: "sm",
      });
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", s.choice === index ? "true" : "false");
      button.addEventListener("click", () => {
        s.choice = index;
        fillChoice();
      });
      root.append(button);
    });
  }

  function fillFilters() {
    const root = mount("filters");
    root.replaceChildren();
    ["Settled", "Pending", "Refunded", "mada", "Visa"].forEach((label) => {
      const on = !!s.filters[label];
      const button = createButton({
        label,
        variant: "secondary",
        size: "sm",
        role: "filter",
        selected: on,
        icon: on ? "confirm" : "",
      });
      button.addEventListener("click", () => {
        s.filters[label] = !s.filters[label];
        fillFilters();
      });
      root.append(button);
    });
  }

  function setMobile(id, value, label) {
    clearTimeout(toastTimer);
    s.mPrev = { id, value: !value };
    s.mTg[id] = value;
    s.mToast = `${label} ${value ? "on" : "off"}`;
    toastTimer = setTimeout(() => {
      s.mToast = "";
      fillMobileToggles();
    }, 2600);
    fillMobileToggles();
  }

  function fillMobileToggles() {
    const root = mount("mobile-toggles");
    root.replaceChildren();
    [
      ["Card controls", [
        ["freeze", "Freeze card", "Stops all payments right away"],
        ["online", "Online payments", "Websites and apps"],
        ["nfc", "Contactless", "Tap to pay up to SAR 300"],
        ["intl", "International", "Saves to the server first"],
      ]],
      ["Alerts", [
        ["push", "Push notifications", "Every payment, instantly"],
        ["email", "Email summary", "Daily at 8 pm"],
      ]],
    ].forEach(([group, items]) => {
      const block = el("div", "sel-list");
      block.append(el("span", "sel-kicker", group));
      items.forEach(([id, label, sub]) => {
        const loading = s.mLoad === id;
        block.append(createChoice({
          kind: "switch",
          size: "lg",
          label,
          sub: loading ? "Updating…" : sub,
          checked: !!s.mTg[id],
          loading,
          danger: id === "freeze",
          disabled: loading,
          onChange: () => {
            if (id === "intl") {
              s.mLoad = id;
              fillMobileToggles();
              setTimeout(() => {
                s.mLoad = null;
                setMobile(id, !s.mTg.intl, label);
              }, 900);
              return;
            }
            setMobile(id, !s.mTg[id], label);
          },
        }));
      });
      root.append(block);
    });
    if (s.mToast) {
      const toast = el("div", "sel-toast");
      toast.append(el("span", "", s.mToast));
      const undo = el("button", "", "Undo");
      undo.type = "button";
      undo.addEventListener("click", () => {
        if (s.mPrev) s.mTg[s.mPrev.id] = s.mPrev.value;
        s.mToast = "";
        fillMobileToggles();
      });
      toast.append(undo);
      root.append(toast);
    }
  }

  function fillSheet() {
    const root = mount("sheet");
    root.replaceChildren();
    if (!s.mSheet) {
      const open = createButton({ label: "Open sheet", variant: "secondary", size: "md" });
      open.addEventListener("click", () => {
        s.mSheet = true;
        fillSheet();
      });
      root.append(open);
      return;
    }
    root.append(el("span", "sel-kicker", "Settlement schedule"));
    [
      ["instant", "Instant", "In seconds · 0.2% per sale"],
      ["daily", "Daily", "Next business day · free"],
      ["weekly", "Weekly", "Every Sunday · free"],
    ].forEach(([id, label, sub]) => {
      root.append(createChoice({
        kind: "radio",
        label,
        sub,
        checked: s.mSch === id,
        onChange: () => {
          s.mSch = id;
          fillSheet();
        },
      }));
    });
    const save = createButton({ label: "Save schedule", variant: "primary", size: "md", block: true });
    save.addEventListener("click", () => {
      s.mSheet = false;
      fillSheet();
    });
    root.append(save);
  }

  function fillMobileCards() {
    const root = mount("mobile-cards");
    root.replaceChildren();
    const track = el("div", "sel-track");
    ["Virtual", "Physical"].forEach((label, index) => {
      const button = createButton({
        label,
        variant: "ghost",
        size: "sm",
        role: "segment",
        selected: s.mSeg === index,
      });
      button.addEventListener("click", () => {
        s.mSeg = index;
        s.mCard = 0;
        fillMobileCards();
      });
      track.append(button);
    });
    root.append(track);
    const cards = s.mSeg === 0
      ? [["Virtual", "Ready in seconds · online only", ""], ["Virtual · single use", "New number after each payment", "soft"], ["Subscriptions", "Locked to one merchant", "approved"]]
      : [["Physical · Mint", "Delivered in 3–5 days", "soft"], ["Physical · Ink", "Metal finish", "ink"], ["Physical · Emerald", "Delivered in 3–5 days", ""]];
    cards.forEach(([name, sub, art], index) => {
      const card = el("button", "sel-plan");
      card.type = "button";
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", s.mCard === index ? "true" : "false");
      const picture = el("span", "sel-art");
      if (art) picture.dataset.art = art;
      picture.style.height = "var(--space-10)";
      picture.style.width = "var(--space-14)";
      picture.style.borderRadius = "var(--radius-s)";
      picture.style.flex = "none";
      const copy = el("span", "choice-copy");
      copy.append(el("strong", "", name), el("span", "", sub));
      card.append(picture, copy, createChoice({ kind: "radio", visual: true, checked: s.mCard === index }));
      card.addEventListener("click", () => {
        s.mCard = index;
        fillMobileCards();
      });
      root.append(card);
    });
  }

  function fillLimits() {
    const root = mount("limits");
    root.replaceChildren();
    ["5,000", "10,000", "25,000", "Custom"].forEach((label, index) => {
      const button = createButton({
        label,
        variant: s.mLim === index ? "ink" : "secondary",
        size: "sm",
      });
      button.addEventListener("click", () => {
        s.mLim = index;
        fillLimits();
      });
      root.append(button);
    });
  }

  function fillStatus() {
    const root = mount("status");
    root.replaceChildren();
    ["Settled", "Pending", "Refunded", "Declined"].forEach((label) => {
      const on = !!s.mSt[label];
      const button = createButton({
        label,
        variant: "secondary",
        size: "sm",
        role: "filter",
        selected: on,
        icon: on ? "confirm" : "",
      });
      button.addEventListener("click", () => {
        s.mSt[label] = !s.mSt[label];
        fillStatus();
        fillResults();
      });
      root.append(button);
    });
  }

  function fillBranches() {
    const root = mount("branches");
    root.replaceChildren();
    const branches = [["Olaya", 48], ["Al Malqa", 31], ["Jeddah Corniche", 27], ["Khobar Mall", 22]];
    const allOn = branches.every(([name]) => s.mBr[name]);
    const some = branches.some(([name]) => s.mBr[name]);
    const rows = [["All branches", branches.reduce((sum, item) => sum + item[1], 0), true], ...branches.map(([name, count]) => [name, count, false])];
    rows.forEach(([label, count, isAll]) => {
      const on = isAll ? allOn : !!s.mBr[label];
      root.append(createChoice({
        kind: "checkbox",
        label,
        extra: String(count),
        checked: on,
        mixed: isAll && some && !allOn,
        onChange: () => {
          if (isAll) branches.forEach(([name]) => { s.mBr[name] = !allOn; });
          else s.mBr[label] = !s.mBr[label];
          fillBranches();
          fillResults();
        },
      }));
    });
  }

  function fillResults() {
    const branches = [["Olaya", 48], ["Al Malqa", 31], ["Jeddah Corniche", 27], ["Khobar Mall", 22]];
    const selected = branches.filter(([name]) => s.mBr[name]);
    const statusCount = Object.values(s.mSt).filter(Boolean).length;
    const base = selected.length ? selected.reduce((sum, item) => sum + item[1], 0) : 128;
    const results = Math.round(base * (statusCount ? statusCount / 4 + 0.25 : 1));
    const host = mount("results");
    if (!host) return;
    let button = host.querySelector(".button");
    const text = `Show ${results} transactions`;
    if (!button) {
      button = createButton({ label: text, variant: "primary", size: "md", block: true });
      host.append(button);
    } else {
      button.querySelector(".button-label").textContent = text;
    }
  }

  function fillNotes() {
    const root = mount("notes");
    [
      ["Tap area", "Rows are at least 52 px high. The visible control can be smaller than the target."],
      ["Toggle L", "52 × 32 with a 26 px knob. Changes apply instantly, with an Undo toast."],
      ["Bottom sheets", "For any choice with more than 3 options or a long description."],
      ["Selected card", "2 px green border, a soft green shadow, and a filled radio on the right."],
      ["Haptics", "Light tap when a toggle, radio, or checkbox changes."],
      ["iOS and Android", "One shared design. Only the system gesture that closes a sheet differs."],
    ].forEach(([title, copy]) => {
      const card = el("div", "sel-note");
      card.append(el("strong", "", title), el("span", "", copy));
      root.append(card);
    });
  }

  function fillRules() {
    const root = mount("rules");
    [
      [true, "Toggle: the change happens immediately, such as card controls and notifications."],
      [true, "Checkbox: the choice is saved with a button, or it confirms consent."],
      [true, "Radio or plan cards: exactly one option. Preselect the safest default."],
      [true, "Selection cards: when options need a picture, price, or description."],
      [false, "Don't use a toggle inside a form that has a Save button."],
      [false, "Don't mix radios and checkboxes in one group."],
    ].forEach(([ok, text]) => {
      const card = el("div", "sel-rule");
      const mark = el("span", "sel-mark", ok ? "✓" : "×");
      mark.dataset.ok = ok ? "true" : "false";
      card.append(mark, el("span", "", text));
      root.append(card);
    });
  }

  fillMatrix();
  fillSpecs();
  fillTree();
  fillTerms();
  fillRadios();
  fillInline();
  fillPay();
  fillToggles();
  fillConfirm();
  fillSwitchSizes();
  fillCardStates();
  fillBiz();
  fillPlans();
  fillTiles();
  segmented(mount("seg-l"), ["Sales", "Refunds", "Payouts"], "segL", "md");
  segmented(mount("seg-s"), ["7D", "30D", "90D", "12M"], "segS", "sm");
  fillChoice();
  fillFilters();
  fillMobileToggles();
  fillSheet();
  fillMobileCards();
  fillLimits();
  fillStatus();
  fillBranches();
  fillResults();
  fillNotes();
  fillRules();

  const reset = mount("reset");
  if (reset) {
    reset.addEventListener("click", () => {
      s.mSt = {};
      s.mBr = {};
      fillStatus();
      fillBranches();
      fillResults();
    });
  }
})();
