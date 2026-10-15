(function () {
  const page = document.querySelector('[data-page="overlays"]');
  if (!page || !window.createOverlay) return;

  const decide = [
    ["Must the user decide before continuing?", "Modal or confirmation"],
    ["Is it irreversible or about money above a limit?", "Confirmation"],
    ["Do they need the list in view while reading?", "Drawer"],
    ["Is it 2–6 actions on one row or card?", "Menu (web) · action sheet (mobile)"],
    ["Is it a choice on mobile?", "Bottom sheet"],
    ["Is it reversible?", "No dialog: snackbar with Undo"],
  ];

  const modalSpecs = [
    ["Widths", "S 400 for one field or a confirmation · M 560 default · L 720 for forms with 4+ fields."],
    ["Structure", "Title + one-line description, body, footer with Cancel left of the primary."],
    ["Scrolling", "Only the body scrolls. Header and footer get a divider when content scrolls."],
    ["Errors", "Keep the modal open, show an inline alert on top and the field error."],
    ["Loading", "Primary shows a spinner and stays the same width; Cancel stays enabled."],
  ];

  const drawerSpecs = [
    ["Widths", "480 px to read · 640 px to edit. Full height, attached to the right edge."],
    ["Backdrop", "22% ink. Clicking it closes, unless there are unsaved changes."],
    ["Footer", "Fixed at the bottom; primary on the right. Disabled until something changes."],
    ["One at a time", "Opening another row replaces the content; never stack drawers."],
    ["Motion", "240 ms slide with ease-out; backdrop fades in 160 ms."],
  ];

  const mobileCopy = {
    sheet: ["Bottom sheet", "For choices and short forms. Three heights: peek, half and full. Tap the handle to try the heights. Swipe down or tap outside to close.", [["Handle", "40 × 5 at the top; drag or tap to resize. Also a × for accessibility."], ["Heights", "Peek 38% · half 58% · full 92%. Opens at the height its content needs."], ["Action", "Primary button fixed at the bottom, above the home indicator."], ["Keyboard", "Sheet moves up with the keyboard; never covers the focused field."]]],
    action: ["Action sheet", "For 2–6 actions on one item. The title names the item; destructive actions are red and last; Cancel is separate.", [["Order", "Most used first, destructive last."], ["Cancel", "Always present, separate block, bold."], ["iOS / Android", "Same design on both; Android back button acts as Cancel."], ["Not for", "Choosing values. Use a bottom sheet with radios instead."]]],
    full: ["Full-screen modal", "For tasks with several steps or a keyboard: new transfer, card request, uploading documents.", [["Header", "× on the left, title in the middle, step count on the right."], ["Leaving", "× with typed data asks \"Discard transfer?\" first."], ["Steps", "Each step is a screen inside the modal; Back goes to the previous step."], ["Motion", "Slides up 320 ms; the page behind scales to 96%."]]],
    alert: ["Alert dialog", "Centered and small. Only for confirmations and critical errors. Two buttons stacked full width.", [["Buttons", "Stacked: action on top, Cancel below as a text button."], ["Copy", "Title is the question; one sentence on the result."], ["Never", "Forms, lists or more than two buttons."], ["Backdrop", "Tapping outside does nothing; the user must choose."]]],
  };

  const behave = [
    ["Focus", "Move focus into the overlay on open, keep it there, return it to the trigger on close."],
    ["Escape", "Esc closes modals, drawers and menus. Android back does the same on mobile."],
    ["Scroll lock", "The page behind doesn't scroll while a modal or sheet is open."],
    ["Labels", "role=\"dialog\", aria-modal and aria-labelledby on the title."],
    ["Motion", "Modal 200 ms fade + scale 96→100%. Drawer 240 ms slide. Sheet 320 ms spring. Respect reduced motion."],
    ["Backdrop", "Modal 45% ink · drawer 22% · sheet 42%. Never blur the page behind."],
  ];

  const rules = [
    [true, "Use the least interruptive layer that works; most actions need none."],
    [true, "One overlay at a time. Confirmations inside a drawer replace its footer."],
    [true, "Primary action names the result: \"Add beneficiary\", not \"OK\"."],
    [true, "Keep typed data when an error happens; never close the modal on failure."],
    [false, "Don't open a modal from a modal, or a sheet from a sheet."],
    [false, "Don't use a modal just to show a success message; use a toast or success screen."],
  ];

  const transactions = [
    ["Al Baik · Olaya", "+ 86.25"],
    ["Jarir Bookstore", "− 1,249.00"],
    ["Nour Trading", "− 25,000.00"],
    ["Careem", "− 38.50"],
    ["Online store #2041", "+ 420.00"],
    ["STC Pay top-up", "+ 5,000.00"],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-overlays="${name}"]`);
  }

  function specs(list) {
    const grid = el("div", "ov-specs");
    list.forEach(([name, copy]) => {
      const card = el("div", "ov-spec");
      card.append(el("strong", "", name), el("span", "ov-copy", copy));
      grid.append(card);
    });
    return grid;
  }

  function fillGuide() {
    const table = el("div", "ov-table");
    const head = el("div", "ov-guide-head");
    ["Component", "Use when", "Blocks page", "Closes by", "Platform"].forEach((label) => head.append(el("span", "", label)));
    table.append(head);
    (window.overlayGuide || []).forEach(([name, use, block, tone, close, platform]) => {
      const row = el("div", "ov-guide");
      const blocks = el("span", "ov-block");
      const dot = el("span", "ov-dot");
      dot.dataset.tone = tone;
      blocks.append(dot, document.createTextNode(block));
      row.append(el("strong", "", name), el("span", "ov-copy", use), blocks, el("span", "ov-copy", close), el("span", "", platform));
      table.append(row);
    });
    const decision = el("div", "ov-decide");
    decision.append(el("span", "ov-kicker", "Quick decision"));
    const questions = el("div", "ov-questions");
    decide.forEach(([question, answer]) => {
      const card = el("div", "ov-q");
      card.append(el("span", "", question), el("strong", "", `→ ${answer}`));
      questions.append(card);
    });
    decision.append(questions);
    mount("guide").append(table, decision);
  }

  function fakePage() {
    const fake = el("div", "ov-fake");
    fake.append(el("span", "ov-bar"));
    const tiles = el("div", "ov-tiles");
    tiles.append(el("span", "ov-tile"), el("span", "ov-tile"), el("span", "ov-tile"));
    fake.append(tiles, el("span", "ov-tile ov-tile-tall"));
    return fake;
  }

  function fillModal() {
    const card = el("div", "ov-card");
    const bar = el("div", "ov-toolbar");
    const live = el("span", "ov-live", "Live");
    const chips = el("div", "ov-chips");
    bar.append(live, chips);
    const stage = el("div", "ov-stage");
    stage.append(fakePage());
    let current = null;
    const presets = [
      ["s", "Small · 400"],
      ["m", "Medium · 560"],
      ["l", "Large · 720"],
      ["err", "With error"],
      ["load", "Submitting"],
      ["del", "Destructive"],
    ];
    function show(preset, trigger) {
      if (current) current.remove();
      current = createOverlay({ kind: "modal", preset, contained: true, open: true, trigger });
      stage.append(current);
    }
    presets.forEach(([preset, label]) => {
      const button = createButton({ label, variant: preset === "m" ? "ink" : "secondary", size: "sm" });
      button.addEventListener("click", () => {
        [...chips.children].forEach((child) => {
          child.dataset.variant = "secondary";
        });
        button.dataset.variant = "ink";
        show(preset, button);
      });
      chips.append(button);
    });
    card.append(bar, stage, specs(modalSpecs));
    show("m");
    mount("modal").append(card);
  }

  function fillDrawer() {
    const card = el("div", "ov-card");
    const bar = el("div", "ov-toolbar");
    bar.append(el("span", "ov-live", "Live · click a row"), el("span", "ov-copy", "Edit the note, then try to close the drawer."));
    const stage = el("div", "ov-stage");
    const list = el("div", "ov-list");
    const drawer = createOverlay({ kind: "drawer", title: "Transaction", contained: true, open: false });
    let saved = "";
    const merchant = el("div", "ov-merchant");
    const name = el("strong", "");
    const amount = el("em", "");
    merchant.append(name, amount);
    if (window.createBadge) merchant.append(createBadge({ label: "Settled", tone: "settled" }));
    const facts = el("div", "ov-facts");
    [["Date", "Today, 12:41"], ["Method", "mada •• 3301"]].forEach(([label, value]) => {
      const row = el("div", "overlay-kv-row");
      row.append(el("span", "", label), el("b", "", value));
      facts.append(row);
    });
    const note = el("label", "ov-note");
    note.append(el("span", "", "Note"));
    const area = el("textarea");
    area.rows = 2;
    area.addEventListener("input", () => {
      drawer.setDirty(area.value !== saved);
      note.dataset.dirty = area.value !== saved ? "true" : "false";
      save.disabled = area.value === saved;
    });
    note.append(area);
    const detail = el("div", "ov-detail");
    detail.append(merchant, facts, note);
    drawer.body.append(detail);
    drawer.activity.append(el("p", "ov-copy", "No earlier activity on this card today."));
    const download = createButton({ label: "Download receipt", variant: "secondary", size: "md" });
    const save = createButton({ label: "Save note", variant: "primary", size: "md" });
    save.disabled = true;
    save.addEventListener("click", () => {
      saved = area.value;
      note.dataset.dirty = "false";
      drawer.setDirty(false);
      save.disabled = true;
    });
    drawer.footer.append(download, save);
    transactions.forEach(([merchantName, value]) => {
      const row = el("button", "ov-tx");
      row.type = "button";
      row.append(el("span", "", merchantName), el("span", "", value));
      row.addEventListener("click", () => {
        [...list.children].forEach((child) => child.removeAttribute("aria-current"));
        row.setAttribute("aria-current", "true");
        name.textContent = merchantName;
        amount.textContent = value;
        area.value = "";
        note.dataset.dirty = "false";
        saved = "";
        drawer.setDirty(false);
        save.disabled = true;
        drawer.open();
      });
      list.append(row);
    });
    stage.append(list, drawer);
    card.append(bar, stage, specs(drawerSpecs));
    mount("drawer").append(card);
  }

  function fillPops() {
    const grid = el("div", "ov-pops");
    const menuCard = el("div", "ov-pop");
    const head = el("div", "ov-head");
    head.append(el("span", "ov-kicker", "Row menu"), el("span", "ov-live", "Live"));
    const row = el("div", "ov-row");
    row.append(el("span", "", "Marketing card •• 4417"));
    const more = createButton({ icon: "more", iconOnly: true, variant: "ghost", size: "sm", ariaLabel: "Card actions" });
    const menu = createOverlay({ kind: "menu", open: false });
    more.addEventListener("click", () => menu.toggle(more));
    row.append(more, menu);
    menuCard.append(head, row);

    const pop = el("div", "ov-pop");
    pop.append(el("span", "ov-kicker", "Popover · date range"));
    const trigger = createButton({ label: "1 – 14 Oct", variant: "secondary", size: "sm", trailingIcon: "collapse" });
    trigger.classList.add("ov-range");
    const cal = el("div", "ov-cal");
    const chips = el("div", "ov-cal-chips");
    [["Today", false], ["This month", true], ["Last 90 days", false]].forEach(([label, on]) => {
      chips.append(createButton({ label, variant: on ? "ink" : "secondary", size: "xs" }));
    });
    const days = el("div", "ov-days");
    for (let day = 1; day <= 14; day += 1) {
      const cell = el("span", "ov-day", String(day));
      if (day === 1 || day === 14) cell.dataset.edge = "true";
      else cell.dataset.in = "true";
      days.append(cell);
    }
    const actions = el("div", "ov-cal-actions");
    actions.append(createButton({ label: "Cancel", variant: "secondary", size: "xs" }), createButton({ label: "Apply", variant: "ink", size: "xs" }));
    cal.append(chips, days, actions);
    pop.append(trigger, cal);

    const tip = el("div", "ov-pop");
    tip.append(el("span", "ov-kicker", "Tooltip · hover the icon"));
    const line = el("div", "ov-tip-row", "Available balance");
    line.append(createOverlay({ kind: "tooltip", label: "About available balance", text: "Balance minus pending card holds." }));
    tip.append(line, el("span", "ov-copy", "Dark ink, max 240 px, one or two lines. Appears after 300 ms on hover or on keyboard focus. Never put links or buttons in a tooltip."));
    grid.append(menuCard, pop, tip);
    mount("pops").append(grid);
  }

  function fillMobile() {
    const wrap = el("div", "");
    const bar = el("div", "ov-toolbar");
    bar.append(el("span", "ov-live", "Live"));
    const switcher = el("div", "ov-switch");
    const layout = el("div", "ov-mobile");
    const phone = el("div", "ov-phone");
    const back = el("div", "ov-phone-back");
    back.append(el("strong", "", "Cards"), el("span", "ov-card-art"), el("span", "ov-line"), el("span", "ov-line"));
    phone.append(back);
    const copy = el("div", "");
    const title = el("h3", "type-heading-m");
    const desc = el("p", "ov-copy");
    const specHost = el("div", "");
    copy.append(el("div", "ov-copy-card"), specHost);
    const card = copy.querySelector(".ov-copy-card");
    let current = null;
    const kinds = [["sheet", "Bottom sheet"], ["action", "Action sheet"], ["full", "Full screen"], ["alert", "Alert"]];
    function show(kind) {
      if (current) current.remove();
      current = createOverlay({ kind, contained: true, open: true });
      phone.append(current);
      const [heading, text, rows] = mobileCopy[kind];
      card.replaceChildren(el("span", "ov-kicker", heading), el("p", "ov-copy", text));
      specHost.replaceChildren();
      const grid = el("div", "ov-specs");
      rows.forEach(([name, body]) => {
        const item = el("div", "ov-behave-card");
        item.append(el("strong", "", name), el("span", "ov-copy", body));
        grid.append(item);
      });
      specHost.append(grid);
      [...switcher.children].forEach((child) => {
        child.dataset.variant = child.dataset.kind === kind ? "ink" : "secondary";
      });
    }
    kinds.forEach(([kind, label]) => {
      const button = createButton({ label, variant: kind === "sheet" ? "ink" : "secondary", size: "sm" });
      button.dataset.kind = kind;
      button.addEventListener("click", () => show(kind));
      switcher.append(button);
    });
    bar.append(switcher);
    layout.append(phone, copy);
    wrap.append(bar, layout);
    show("sheet");
    mount("mobile").append(wrap);
  }

  function fillRules() {
    const grid = el("div", "ov-behave");
    behave.forEach(([name, copy]) => {
      const card = el("div", "ov-behave-card");
      card.append(el("strong", "", name), el("span", "ov-copy", copy));
      grid.append(card);
    });
    const rulesGrid = el("div", "ov-rules");
    rules.forEach(([ok, text]) => {
      const card = el("div", "ov-rule");
      const mark = el("span", "ov-mark", ok ? "✓" : "×");
      mark.dataset.ok = ok ? "true" : "false";
      card.append(mark, el("span", "", text));
      rulesGrid.append(card);
    });
    mount("rules").append(grid, rulesGrid);
  }

  fillGuide();
  fillModal();
  fillDrawer();
  fillPops();
  fillMobile();
  fillRules();
})();
