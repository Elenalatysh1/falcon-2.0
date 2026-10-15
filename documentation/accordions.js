(function () {
  const page = document.querySelector('[data-page="accordions"]');
  if (!page || !window.createAccordion) return;

  const faq = [
    ["How long do transfers take?", "Between Hala accounts: instantly. To other Saudi banks: within minutes via sarie. International: 1–3 business days."],
    ["When do POS sales reach my account?", "Next business day by default. With instant settlement, within seconds for 0.2% per transaction."],
    ["Can I set limits for each card?", "Yes. Admins set daily, monthly and per-transaction limits for each card and can change them any time."],
    ["Which documents do I need?", "Your CR, the owner's national ID or Iqama, and the VAT certificate if you are registered."],
  ];

  const anatomy = [
    ["1", "Leading icon (optional)", "40 × 40 tile. Use in settings and cards, not in FAQs."],
    ["2", "Title and subtitle", "Title 16/600. Subtitle 13/400 summarises what is inside."],
    ["3", "Meta (optional)", "A badge or count, e.g. \"3 set\". Updates when content changes."],
    ["4", "Chevron", "18 px, right-aligned, rotates 180° in 300 ms."],
    ["5", "Content", "Indented to the title. Height animates; never jumps."],
    ["6", "Hit area", "The full row: min 56 px web, 64 px mobile."],
  ];

  const states = [
    ["Collapsed", "bg white · 15/500", "Default.", { state: "collapsed" }],
    ["Hover", "bg #F7FAF9", "Web only. Cursor pointer on the whole row.", { state: "hover" }],
    ["Focus", "3 px ring rgba(11,143,110,.25)", "Keyboard. Enter or Space toggles; arrow keys move between headers.", { state: "focus" }],
    ["Expanded", "title 600 · chevron 180°", "aria-expanded is true. Title becomes semibold.", { state: "expanded" }],
    ["Loading", "spinner before chevron", "Content fetched on first open, e.g. card transactions.", { state: "loading" }],
    ["Disabled", "45% opacity", "Section not available for this role. Add a reason in the subtitle.", { state: "disabled" }],
  ];

  const sizes = [
    ["Header height", "56 px", "44 px", "64 pt"],
    ["Title", "15 / 500", "11 Mono caps", "16 / 500"],
    ["Subtitle", "13 / 400", "—", "14 / 400"],
    ["Padding", "16 px", "2 px", "16 pt"],
    ["Chevron", "18 px", "16 px", "16 on 28 circle"],
    ["Corner radius", "16 px (card)", "—", "20 pt (card)"],
    ["Animation", "300 ms", "300 ms", "300 ms + haptic"],
  ];

  const when = [
    ["FAQs and help", "Many questions where people look for one answer. Divided style, one open at a time."],
    ["Settings groups", "Related controls behind a clear summary. Card style, several open."],
    ["Filters", "Long filter lists in a drawer or bottom sheet. Compact style with counts."],
    ["Secondary details", "Fees, approvals and references in transaction details. Main facts stay visible above."],
  ];

  const rules = [
    [true, "Write titles people scan for: \"Card limits\", not \"More\"."],
    [true, "Show a summary in the subtitle or meta so people don't need to open it."],
    [true, "Open the most relevant section by default, e.g. the one with an error."],
    [true, "Keep state when the user leaves and comes back."],
    [false, "Don't hide the primary action or required fields inside a collapsed section."],
    [false, "Don't nest accordions more than one level."],
    [false, "Don't use for 1–2 short items; just show them."],
    [false, "Don't use as navigation between pages; use tabs or the sidebar."],
  ];

  const mobileSpecs = [
    ["Touch target", "Full row, 64 pt minimum height."],
    ["Chevron", "On a 28 pt circle that turns ink when open, so the open state is clear at a glance."],
    ["Haptics", "Light impact on open and close (iOS UIImpactFeedback, Android CLOCK_TICK)."],
    ["Scrolling", "When a section opens below the fold, scroll so its header stays visible."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-accordions="${name}"]`);
  }

  function faqItems(list, openIndex) {
    return list.map(([title, body], index) => ({ title, body, open: index === openIndex }));
  }

  function live(kicker, note) {
    const card = el("div", "ac-panel");
    const head = el("div", "ac-panel-head");
    head.append(el("span", "ac-kicker", kicker), el("span", "ac-live", "Live"));
    card.append(head, el("span", "ac-caption", note));
    return card;
  }

  function fillAnatomy() {
    const sample = mount("anatomy");
    const frame = createAccordion({
      variant: "card",
      interactive: false,
      items: [{
        title: "Card limits",
        subtitle: "Daily, monthly and per transaction",
        meta: "3 set",
        icon: "cards",
        open: true,
        lines: [
          { label: "Daily", value: "SAR 5,000", mono: true },
          { label: "Monthly", value: "SAR 40,000", mono: true },
        ],
      }],
    });
    const notes = el("div", "ac-notes");
    anatomy.forEach(([n, title, body]) => {
      const row = el("div", "ac-note-row");
      const copy = el("div");
      copy.append(el("strong", "", title), el("span", "", body));
      row.append(el("span", "ac-num", n), copy);
      notes.append(row);
    });
    const split = el("div", "ac-split");
    split.append(frame, notes);
    sample.append(split);
  }

  function fillStates() {
    const root = mount("states");
    states.forEach(([name, spec, use, item]) => {
      const row = el("div", "ac-state");
      const label = el("div");
      label.append(el("strong", "", name), el("span", "ac-spec-label", spec));
      const preview = el("div", "ac-state-card");
      preview.append(createAccordion({
        variant: "divided",
        interactive: false,
        items: [{
          title: "How long do transfers take?",
          body: "Between Hala accounts: instantly. To other Saudi banks: within minutes via sarie.",
          ...item,
        }],
      }));
      row.append(label, preview, el("p", "", use));
      root.append(row);
    });
  }

  function fillVariants() {
    const root = mount("variants");
    const divided = live("A · Divided · FAQ, help", "One open at a time");
    divided.append(createAccordion({
      variant: "divided",
      exclusive: true,
      items: faqItems(faq, 0),
    }));

    const cards = live("B · Cards · Settings, forms", "Several can be open");
    cards.append(createAccordion({
      variant: "card",
      exclusive: false,
      items: [
        {
          title: "Card limits",
          subtitle: "Daily, monthly and per transaction",
          icon: "cards",
          open: true,
          lines: [
            { label: "Daily", value: "SAR 5,000", mono: true },
            { label: "Monthly", value: "SAR 40,000", mono: true },
            { label: "Per transaction", value: "SAR 2,500", mono: true },
          ],
        },
        {
          title: "Where it works",
          subtitle: "Online, in store, abroad",
          icon: "language",
          lines: [
            { label: "Online", value: "On", mono: true },
            { label: "In store", value: "On", mono: true },
            { label: "Abroad", value: "Off", mono: true },
          ],
        },
        {
          title: "Notifications",
          subtitle: "Push and email",
          icon: "notifications",
          lines: [
            { label: "Every payment", value: "Push", mono: true },
            { label: "Declined payment", value: "Push + email", mono: true },
          ],
        },
      ],
    }));

    const compact = live("C · Compact · Filters, sidebar", "Header shows how many are selected");
    compact.append(createAccordion({
      variant: "compact",
      exclusive: false,
      items: [
        {
          title: "Status",
          open: true,
          options: [
            { label: "Settled", checked: true },
            { label: "Pending", checked: false },
            { label: "Declined", checked: false },
          ],
        },
        {
          title: "Method",
          options: [
            { label: "mada", checked: true },
            { label: "Visa", checked: false },
            { label: "Apple Pay", checked: false },
          ],
        },
        {
          title: "Branch",
          options: [
            { label: "Olaya", checked: false },
            { label: "Al Malqa", checked: false },
            { label: "Jeddah Corniche", checked: false },
          ],
        },
      ],
    }));
    root.append(divided, cards, compact);
  }

  function fillMobile() {
    const root = mount("mobile");
    const help = live("Grouped list · Help", "One open at a time");
    const device = el("div", "ac-device");
    device.append(el("h3", "", "Help"), el("span", "ac-group-label", "Payments"));
    device.append(createAccordion({
      variant: "grouped",
      exclusive: true,
      items: faqItems(faq.slice(0, 3), 1),
    }));
    help.append(device);

    const detail = live("Card · Transaction details", "Several can be open");
    const sheet = el("div", "ac-device");
    const hero = el("div", "ac-hero");
    hero.append(
      el("span", "ac-avatar", "NT"),
      el("span", "ac-party", "Nour Trading"),
      el("span", "ac-amount", "− 25,000.00"),
    );
    if (window.createBadge) {
      hero.append(createBadge({ label: "Pending approval", tone: "pending", variant: "subtle" }));
    }
    sheet.append(hero, createAccordion({
      variant: "detail",
      exclusive: false,
      items: [
        {
          title: "Details",
          meta: "Today, 09:30",
          open: true,
          lines: [
            { label: "From", value: "Main · SA57 •• 1951", mono: true },
            { label: "To", value: "SA03 •• 6080", mono: true },
            { label: "Reference", value: "INV-2026-0912", mono: true },
          ],
        },
        {
          title: "Approvals",
          meta: "1 of 2",
          lines: [
            { label: "Omar Bakr", value: "Approved" },
            { label: "Abdulaziz Ali", value: "Waiting" },
          ],
        },
        {
          title: "Fees",
          meta: "SAR 0.00",
          lines: [
            { label: "Transfer fee", value: "Free", mono: true },
            { label: "VAT", value: "0.00", mono: true },
          ],
        },
      ],
    }));
    detail.append(sheet);
    root.append(help, detail);

    const specs = mount("mobile-specs");
    mobileSpecs.forEach(([title, body]) => {
      const card = el("div", "ac-spec");
      card.append(el("strong", "", title), el("span", "", body));
      specs.append(card);
    });
  }

  function fillSizes() {
    const root = mount("sizes");
    const head = el("div", "ac-size");
    ["Property", "Web · default", "Web · compact", "Mobile"].forEach((label) => {
      head.append(el("b", "", label));
    });
    root.append(head);
    sizes.forEach((row) => {
      const line = el("div", "ac-size");
      row.forEach((cell, index) => line.append(el(index ? "span" : "strong", "", cell)));
      root.append(line);
    });
  }

  function fillWhen() {
    const use = mount("when");
    when.forEach(([title, body]) => {
      const card = el("div", "ac-card");
      card.append(el("strong", "", title), el("span", "", body));
      use.append(card);
    });
    const rulesRoot = mount("rules");
    rules.forEach(([ok, text]) => {
      const card = el("div", "ac-rule");
      const mark = el("span", "ac-mark");
      mark.dataset.ok = ok ? "true" : "false";
      const glyph = window.drawAccordionIcon(ok ? "confirm" : "close");
      if (glyph) mark.append(glyph);
      card.append(mark, el("span", "", text));
      rulesRoot.append(card);
    });
  }

  fillAnatomy();
  fillStates();
  fillVariants();
  fillMobile();
  fillSizes();
  fillWhen();
})();
