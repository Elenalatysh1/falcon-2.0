(function () {
  const page = document.querySelector('[data-page="command-menu"]');
  if (!page || !window.createCommandMenu) return;

  const states = [
    ["Empty query", "Recent items, top actions and Go to with shortcuts. Never a blank box."],
    ["Typing", "Results filter on every key; the matched text is highlighted. First result is pre-selected."],
    ["Scoped", "Tab picks a scope (Transactions, People, Cards, Documents). Backspace on empty removes it."],
    ["Loading", "Spinner in the field while server results load. Local results show immediately."],
    ["No results", "Says what was searched, suggests what to try, offers support."],
    ["Running", "Enter runs the action and closes the menu. Actions with a form open it pre-filled."],
  ];

  const specs = [
    ["Open", "⌘K / Ctrl K anywhere, or the search field in the top bar. Opens 56 px from the top, not centered, so results grow downward."],
    ["Width", "640 px, max height 70% of the screen. Backdrop 35% ink."],
    ["Field", "64 px tall, 17 px text, search icon left, ESC hint right."],
    ["Rows", "48 px. 32 px icon tile, title 14.5/500, subtitle 12.5, meta right in Mono."],
    ["Groups", "Order: Recent, Actions, Go to, Transactions, People, Cards, Documents. Max 12 rows total."],
    ["Actions", "Green tile for create actions, red tile for risky ones (freeze). Shortcut shown on the right."],
    ["Footer", "44 px keyboard hints. Live result count or status on the right."],
    ["Access", "role=\"combobox\" on the field, listbox for results, aria-activedescendant follows the highlight."],
  ];

  const mobileSpecs = [
    ["Entry", "Search field on Home and a search icon in the tab bar's top screens."],
    ["Layout", "Full screen. Field 44 pt in the top bar, Cancel on the right."],
    ["Scopes", "Chips under the field replace Tab. One at a time; tap again to clear."],
    ["Rows", "56 pt with 36 pt avatar or tile. Swipe left on a result for quick actions."],
    ["Keyboard", "Opens with the keyboard up; return key reads \"Search\"."],
    ["Android", "Back button closes search. Same layout as iOS."],
  ];

  const rules = [
    [true, "Show something useful before typing: recent items and top actions."],
    [true, "Search names, IBANs, amounts and card last 4 digits."],
    [true, "Keep the same shortcut letters as the sidebar (G + D for Dashboard)."],
    [true, "Hide results the user's role can't open."],
    [false, "Don't run money actions straight from Enter; open the flow pre-filled."],
    [false, "Don't show full card numbers or balances of other users."],
    [false, "Don't center the menu vertically; it jumps as results change."],
    [false, "Don't use it as the only way to reach a page."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-command="${name}"]`);
  }

  function icon(name) {
    const lucide = window.lucide;
    if (!lucide) return null;
    const node = lucide.icons[name];
    if (!node) return null;
    const svg = lucide.createElement(node);
    svg.classList.add("hala-icon");
    svg.style.strokeWidth = "var(--icon-stroke)";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  const menu = createCommandMenu({ shortcut: true, label: "Command menu" });
  const presets = [
    ["Empty", "", null],
    ['"nour"', "nour", null],
    ["Scope: Cards", "", "Cards"],
    ["No results", "zzz", null],
  ];

  function fillPresets() {
    const host = mount("presets");
    const row = el("div", "cm-presets");
    presets.forEach(([label, query, scope]) => {
      const button = window.createButton
        ? createButton({ label, variant: "secondary", size: "xs" })
        : el("button", "", label);
      if (!window.createButton) button.type = "button";
      button.addEventListener("click", () => menu.setQuery(query, scope));
      row.append(button);
    });
    host.append(row);
  }

  function fillStage() {
    const stage = el("div", "cm-stage");
    const app = el("div", "cm-app");
    const side = el("span", "cm-side");
    const main = el("div", "cm-main");
    const search = el("div", "cm-search", "Search or jump to…");
    const glyph = icon("Search");
    if (glyph) search.prepend(glyph);
    search.append(el("span", "cm-kbd", "⌘K"));
    const cards = el("div", "cm-cards");
    cards.append(el("span", "cm-block"), el("span", "cm-block"), el("span", "cm-block"));
    main.append(search, cards, el("span", "cm-block cm-block-tall"));
    app.append(side, main);
    stage.append(app, el("div", "cm-scrim"), menu);
    mount("stage").append(stage);
  }

  function fillStates() {
    const grid = el("div", "cm-states");
    states.forEach(([name, copy]) => {
      const card = el("div", "cm-state");
      card.append(el("span", "cm-kicker", name), el("span", "cm-copy", copy));
      grid.append(card);
    });
    mount("states").append(grid);
  }

  function fillSpecs() {
    const table = el("div", "cm-table");
    specs.forEach(([name, copy]) => {
      const row = el("div", "cm-row");
      row.append(el("strong", "", name), el("span", "cm-copy", copy));
      table.append(row);
    });
    mount("anatomy").append(table);
  }

  function fillMobile() {
    const phones = el("div", "cm-phones");
    const entry = el("div", "cm-phone-card");
    entry.append(el("span", "cm-kicker", "1 · Entry on Home"));
    const home = el("div", "cm-phone");
    const bar = el("div", "cm-home-bar");
    bar.append(el("strong", "", "Home"), el("span", "cm-avatar"));
    const pill = el("div", "cm-search-pill", "Search Hala");
    const glyph = icon("Search");
    if (glyph) pill.prepend(glyph);
    home.append(bar, pill, el("span", "cm-hero"), el("span", "cm-line"), el("span", "cm-note", "Tap the field, or pull down on Home. The field moves up into the search screen."));
    entry.append(home);

    const live = el("div", "cm-phone-card");
    const head = el("div", "cm-live-head");
    head.append(el("span", "cm-kicker", "2 · Search screen"), el("span", "cm-live", "Live"));
    const screen = el("div", "cm-phone cm-phone-search");
    screen.append(createCommandMenu({ variant: "mobile" }));
    live.append(head, screen);

    const specsCard = el("div", "cm-phone-card cm-specs-card");
    specsCard.append(el("span", "cm-kicker", "Mobile specs"));
    const specsGrid = el("div", "cm-specs");
    mobileSpecs.forEach(([name, copy]) => {
      const card = el("div", "cm-spec");
      card.append(el("strong", "", name), el("span", "cm-copy", copy));
      specsGrid.append(card);
    });
    specsCard.append(specsGrid);
    phones.append(entry, live, specsCard);
    mount("mobile").append(phones);
  }

  function fillRules() {
    const grid = el("div", "cm-rules");
    rules.forEach(([ok, text]) => {
      const card = el("div", "cm-rule");
      const mark = el("span", "cm-mark", ok ? "✓" : "×");
      mark.dataset.ok = ok ? "true" : "false";
      card.append(mark, el("span", "", text));
      grid.append(card);
    });
    mount("rules").append(grid);
  }

  fillPresets();
  fillStage();
  fillStates();
  fillSpecs();
  fillMobile();
  fillRules();
})();
