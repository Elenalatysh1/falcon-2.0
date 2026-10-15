(function () {
  const page = document.querySelector('[data-page="button"]');
  if (!page || !window.createButton) return;

  const state = { range: 1, chips: { Settled: true }, amount: 2 };

  const sizes = [
    ["Large", "H 52 · 16/600 · px 28", "lg", "Mobile main actions, full width at the bottom of the screen."],
    ["Medium", "H 44 · 15/600 · px 22", "md", "Web forms, dialogs and onboarding."],
    ["Small", "H 36 · 13.5/500 · px 14", "sm", "Dashboard toolbars and card headers."],
    ["X-small", "H 28 · 12.5/600 · px 10", "xs", "Table rows and inline actions. Web only."],
  ];

  const variants = [
    ["Primary", "primary", "Confirm", "The main action. One per screen."],
    ["Ink", "ink", "Continue", "Neutral main action when the gradient competes with a card or chart."],
    ["Secondary", "secondary", "Cancel", "Next to a primary, or for less important actions."],
    ["Tonal", "tonal", "Top up", "Helpful actions inside cards: Top up, Add CR."],
    ["Ghost", "ghost", "Skip", "Low emphasis: View all, Skip, Edit."],
    ["Destructive", "destructive", "Freeze", "Freeze card, delete, cancel order. Ask to confirm first."],
  ];

  const states = ["Default", "Hover", "Pressed", "Focus", "Loading", "Disabled"];

  const stateSpecs = [
    ["Default", "Resting look. Primary has a soft green shadow."],
    ["Hover", "Web only. Slightly lighter; 150 ms ease."],
    ["Pressed", "Darker, scales to 97%, shadow drops. On mobile this is the tap feedback."],
    ["Focus", "Keyboard only. 2 px green ring with a 3 px white gap."],
    ["Loading", "Label swaps to a spinner; width stays fixed so the layout does not jump. Not clickable."],
    ["Disabled", "Gray fill, 4.5:1 label. Explain nearby why it is disabled."],
  ];

  const rules = [
    [true, "One primary button per screen. Pair it with Secondary or Ghost."],
    [true, 'Labels are verbs that name the result: "Send SAR 25,000", not "OK".'],
    [true, "On mobile, keep main actions at the bottom within thumb reach, full width."],
    [true, "The arrow button is only for moving between steps, and always has an aria-label."],
    [false, "Don't put two gradient buttons side by side."],
    [false, "Don't use X-small on mobile; tap areas must be at least 44 × 44."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-button="${name}"]`);
  }

  function fillSizes() {
    const root = mount("sizes");
    sizes.forEach(([name, spec, size, use]) => {
      const row = el("div", "btn-size");
      const title = el("div", "btn-name");
      title.append(el("span", "", name), el("span", "btn-spec", spec));
      const samples = el("div", "btn-row");
      samples.append(createButton({ label: "Continue", variant: "primary", size }));
      samples.append(createButton({ label: "Export", variant: "secondary", size, icon: "download" }));
      samples.append(createButton({ label: "Next", variant: "tonal", size, icon: "forward", iconPosition: "trailing" }));
      samples.append(createButton({ variant: "ink", size, icon: "forward", iconOnly: true, ariaLabel: "Next" }));
      row.append(title, samples, el("span", "btn-use", use));
      root.append(row);
    });
  }

  function fillVariants() {
    const root = mount("variants");
    variants.forEach(([name, variant, label, use]) => {
      const row = el("div", "btn-variant");
      const copy = el("div", "btn-variant-copy");
      copy.append(el("strong", "", name), el("span", "btn-help", use));
      row.append(copy);
      states.forEach((nameState, index) => {
        const cell = el("div", "btn-cell");
        const key = nameState.toLowerCase();
        const button = createButton({
          label,
          variant,
          size: "lg",
          state: key === "hover" || key === "pressed" || key === "focus" ? key : "",
          loading: key === "loading",
          disabled: key === "disabled",
        });
        if (index) button.tabIndex = -1;
        cell.append(button);
        row.append(cell);
      });
      root.append(row);
    });
  }

  function fillSpecs() {
    const root = mount("specs");
    stateSpecs.forEach(([title, copy]) => {
      const card = el("div", "btn-spec-card");
      card.append(el("strong", "", title), el("span", "btn-help", copy));
      root.append(card);
    });
  }

  function fillArrows() {
    const shapes = mount("arrow-shapes");
    [
      ["Wide 120×54\nweb onboarding", { shape: "wide", size: "lg" }],
      ["56 · mobile", { size: "lg", touch: true }],
      ["44 · web", { size: "md" }],
      ["36 · compact", { size: "sm" }],
    ].forEach(([label, options]) => {
      const item = el("div", "btn-arrow");
      item.append(createButton({ variant: "primary", icon: "forward", iconOnly: true, ariaLabel: "Next step", ...options }));
      item.append(el("span", "btn-caption", label));
      shapes.append(item);
    });

    const directions = mount("arrow-variants");
    [
      ["Gradient", { variant: "primary", icon: "forward", ariaLabel: "Next step" }],
      ["Ink", { variant: "ink", icon: "forward", ariaLabel: "Next step" }],
      ["Tonal", { variant: "tonal", icon: "forward", ariaLabel: "Next step" }],
      ["Outline", { variant: "secondary", icon: "forward", ariaLabel: "Next step" }],
      ["Back", { variant: "secondary", icon: "back", quiet: true, ariaLabel: "Back" }],
    ].forEach(([label, options]) => {
      const item = el("div", "btn-arrow");
      item.append(createButton({ size: "lg", iconOnly: true, ...options }));
      item.append(el("span", "btn-caption", label));
      directions.append(item);
    });

    const arrowStates = mount("arrow-states");
    states.forEach((name, index) => {
      const key = name.toLowerCase();
      const item = el("div", "btn-arrow");
      const button = createButton({
        variant: "primary",
        size: "lg",
        shape: "wide",
        icon: "forward",
        iconOnly: true,
        ariaLabel: "Next step",
        state: key === "hover" || key === "pressed" || key === "focus" ? key : "",
        loading: key === "loading",
        disabled: key === "disabled",
      });
      button.tabIndex = -1;
      item.append(button, el("span", "kicker quiet", name));
      arrowStates.append(item);
    });
  }

  function fillToolbar() {
    const root = mount("toolbar");
    root.append(
      createButton({ label: "Filter", variant: "secondary", size: "sm", icon: "filter", badge: "2" }),
      createButton({ label: "1 – 14 Oct", variant: "secondary", size: "sm", icon: "calendar", trailingIcon: "expand" }),
      createButton({ label: "Export", variant: "secondary", size: "sm", icon: "download" }),
      createButton({ label: "New transfer", variant: "ink", size: "sm", icon: "add" })
    );
  }

  function fillRanges() {
    const root = mount("ranges");
    root.replaceChildren();
    ["7D", "30D", "90D", "12M"].forEach((label, index) => {
      const button = createButton({
        label,
        variant: "ghost",
        size: "xs",
        role: "segment",
        selected: state.range === index,
      });
      button.addEventListener("click", () => {
        state.range = index;
        fillRanges();
      });
      root.append(button);
    });
  }

  function fillInline() {
    const root = mount("inline");
    root.append(
      createButton({ label: "Approve", variant: "tonal", size: "xs" }),
      createButton({ label: "Review", variant: "secondary", size: "xs" }),
      createButton({ label: "Reject", variant: "destructive", size: "xs" }),
      createButton({ label: "View all", variant: "ghost", size: "xs", icon: "next", iconPosition: "trailing" })
    );
  }

  function fillIconButtons() {
    const root = mount("icon-buttons");
    [
      ["More", "more", { quiet: true }],
      ["Refresh", "refresh", {}],
      ["Download", "download", { variant: "secondary" }],
      ["Expand", "expand", {}],
      ["Close", "close", {}],
    ].forEach(([label, icon, options]) => {
      root.append(createButton({
        variant: "ghost",
        size: "sm",
        shape: "tile",
        icon,
        iconOnly: true,
        ariaLabel: label,
        ...options,
      }));
    });
  }

  function fillChips() {
    const root = mount("chips");
    root.replaceChildren();
    ["Settled", "Pending", "Refunds", "mada"].forEach((label) => {
      const on = !!state.chips[label];
      const button = createButton({
        label,
        variant: "secondary",
        size: "xs",
        role: "chip",
        selected: on,
        icon: on ? "confirm" : "",
      });
      button.addEventListener("click", () => {
        state.chips[label] = !state.chips[label];
        fillChips();
      });
      root.append(button);
    });
  }

  function fillQuick() {
    const root = mount("quick");
    [
      ["Transfer", "transfers", "primary"],
      ["Pay bills", "file", "tonal"],
      ["Top up", "add", "tonal"],
      ["More", "layout-grid", "tonal"],
    ].forEach(([label, icon, variant]) => {
      root.append(createButton({ label, icon, variant, size: "lg", stack: true }));
    });
  }

  function fillTopbar() {
    const root = mount("topbar");
    root.append(
      createButton({ variant: "ghost", size: "md", shape: "round", icon: "previous", iconOnly: true, ariaLabel: "Back" }),
      createButton({ variant: "ghost", size: "md", shape: "round", icon: "close", iconOnly: true, ariaLabel: "Close" }),
      createButton({ variant: "ghost", size: "md", shape: "round", icon: "notifications", iconOnly: true, ariaLabel: "Notifications", dot: true }),
      createButton({ label: "Done", variant: "ghost", size: "sm", role: "inline" })
    );
  }

  function fillAmounts() {
    const root = mount("amounts");
    root.replaceChildren();
    ["5,000", "10,000", "25,000"].forEach((label, index) => {
      const button = createButton({
        label,
        variant: "ghost",
        size: "sm",
        role: "amount",
        selected: state.amount === index,
      });
      button.addEventListener("click", () => {
        state.amount = index;
        fillAmounts();
      });
      root.append(button);
    });
  }

  function fillMobileInline() {
    const root = mount("mobile-inline");
    root.append(
      createButton({ label: "Copy IBAN", variant: "tonal", size: "sm", role: "inline", icon: "copy" }),
      createButton({ label: "Share", variant: "secondary", size: "sm", role: "inline", icon: "share" }),
      createButton({ label: "See all", variant: "ghost", size: "sm", role: "inline" })
    );
  }

  function fillRules() {
    const root = mount("rules");
    rules.forEach(([ok, text]) => {
      const card = el("div", "btn-rule");
      const mark = el("span", "btn-mark", ok ? "✓" : "×");
      mark.dataset.ok = ok ? "true" : "false";
      card.append(mark, el("span", "", text));
      root.append(card);
    });
  }

  fillSizes();
  fillVariants();
  fillSpecs();
  fillArrows();
  fillToolbar();
  fillRanges();
  fillInline();
  fillIconButtons();
  fillChips();
  fillQuick();
  fillTopbar();
  fillAmounts();
  fillMobileInline();
  fillRules();
})();
