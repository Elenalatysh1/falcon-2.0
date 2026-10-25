(function () {
  const page = document.querySelector('[data-page="progress"]');
  if (!page || !window.createStepper || !window.createSpendMeter) return;

  const STEPS = {
    en: ["Recipient", "Amount", "Review", "Approval", "Confirm"],
    ar: ["المستفيد", "المبلغ", "المراجعة", "الموافقة", "التأكيد"],
  };
  const METERS = [
    { spent: 12000, limit: 20000, note: { en: "Resets 1 Nov", ar: "يتجدد 1 نوفمبر" } },
    { spent: 18000, limit: 20000 },
    { spent: 21200, limit: 20000 },
    { spent: 12000, limit: 20000, status: "frozen" },
  ];
  const CHECKLIST = {
    en: [
      { title: "Order placed", description: "Done 14 Oct", status: "done" },
      { title: "Card printed", description: "Done 18 Oct", status: "done" },
      { title: "Activate your card", description: "Tap Activate when the card arrives.", status: "current", action: "Activate" },
      { title: "Set your PIN", description: "Available after activation.", status: "upcoming", action: "Set PIN" },
    ],
    ar: [
      { title: "تم الطلب", description: "تم في 14 أكتوبر", status: "done" },
      { title: "طُبعت البطاقة", description: "تم في 18 أكتوبر", status: "done" },
      { title: "فعّل بطاقتك", description: "اضغط تفعيل عند وصول البطاقة.", status: "current", action: "تفعيل" },
      { title: "عيّن الرقم السري", description: "متاح بعد التفعيل.", status: "upcoming", action: "تعيين" },
    ],
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-pg="${name}"]`);
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

  function meter(spec, lang = "en") {
    return createSpendMeter({ spent: spec.spent, limit: spec.limit, status: spec.status, note: spec.note && spec.note[lang], lang });
  }

  function meters(lang, list = METERS) {
    const grid = el("div", "pgd-meters");
    list.forEach((spec) => grid.append(meter(spec, lang)));
    return grid;
  }

  function checklist(lang = "en") {
    const root = createProgressChecklist({ lang, steps: CHECKLIST[lang] });
    return root;
  }

  function stepperFlow(lang = "en", count = 4) {
    const wrap = el("div", "pgd-flow");
    const stepper = createStepper({ steps: STEPS[lang].slice(0, count), current: 2, lang, label: lang === "ar" ? "خطوات التحويل" : "Transfer steps" });
    const actions = el("div", "pgd-actions");
    const back = createButton({ label: lang === "ar" ? "رجوع" : "Back", variant: "secondary", size: "sm" });
    const next = createButton({ label: lang === "ar" ? "متابعة" : "Continue", variant: "primary", size: "sm" });
    function sync() {
      const current = stepper.getCurrent();
      back.disabled = current === 1;
      next.disabled = current === count;
    }
    back.addEventListener("click", () => { stepper.setCurrent(stepper.getCurrent() - 1); sync(); });
    next.addEventListener("click", () => { stepper.setCurrent(stepper.getCurrent() + 1); sync(); });
    sync();
    actions.append(back, next);
    wrap.append(stepper, actions);
    return wrap;
  }

  function tones() {
    const stack = el("div", "pgd-bars");
    [["brand", 72], ["warning", 90], ["error", 100], ["neutral", 40]].forEach(([tone, value]) => {
      stack.append(createProgressBar({ tone, value, size: "m", label: `${tone} ${value}%` }));
    });
    return stack;
  }

  function fillWeb() {
    const host = mount("web");
    host.append(block("Stepper · transfer flow at Desktop", stepperFlow(), "Live · Back and Continue"));
    host.append(block("Spend meter · Normal, Near limit, Over limit, Frozen", meters("en")));

    const split = el("div", "pgd-split");
    const check = el("div", "pgd-card");
    let list = checklist();
    const reset = createButton({ label: "Reset", variant: "ghost", size: "sm", icon: "refresh" });
    reset.addEventListener("click", () => {
      const next = checklist();
      list.replaceWith(next);
      list = next;
    });
    check.append(list, reset);
    const bars = el("div", "pgd-card");
    bars.append(tones());
    split.append(check, bars);
    host.append(block("Progress checklist and Progress bar tones", split, "Live · Activate"));
  }

  function phone(title, body, caption) {
    const card = el("figure", "lst-phone-card");
    const screen = el("div", "lst-phone");
    const bar = el("div", "lst-phone-bar");
    bar.append(el("span", "lst-phone-large", title));
    const scroll = el("div", "lst-phone-scroll pgd-phone");
    scroll.append(...[].concat(body));
    screen.append(bar, scroll);
    card.append(screen, el("figcaption", "lst-caption", caption));
    return card;
  }

  function fillMobile() {
    const host = mount("mobile");
    const details = createDetails([
      { label: "To", value: "Almarai Supply Co." },
      { label: "From", value: "Main account •• 4410" },
      { label: "Arrives", value: "Today, before 5 pm" },
      { label: "Reference", value: "INV-2026-1043" },
    ]);
    const stack = el("div", "pgd-stack");
    METERS.slice(0, 3).forEach((spec) => stack.append(meter(spec)));
    host.append(
      phone("Send money", [createStepper({ steps: STEPS.en.slice(0, 4), current: 2, label: "Transfer steps" }), details], "iOS · Stepper at Mobile: Step 2 of 4 with segments"),
      phone("Card limits", stack, "Android · Spend meters stack"),
      phone("Activate card", checklist(), "iOS · Progress checklist, finished in place"),
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

  function markers() {
    const row = el("div", "dtd-row");
    ["done", "current", "upcoming", "error"].forEach((status) => row.append(createStepMarker({ status, number: 1 })));
    return row;
  }

  function fillComponents() {
    const host = mount("components");
    host.append(
      specimen("Progress bar", "Showing how far along something is, or how much of a limit is used.", "Inside Spend meter, Progress checklist, upload rows, onboarding cards on web and mobile.", "Pick Tone and Size, then Value 0–100. It stretches to its container; the value stays a percentage. In Arabic it fills from the right.", tones()),
      specimen("Spend meter", "Spend against a limit or budget, with what is left.", "Card limits tab, budgets, team spend cards; mobile card detail.", "Near limit from 80%. Over limit shows the overage. Frozen when the card is frozen. Amounts use Amount text with the Riyal sign; never type \"SAR\".", meter(METERS[1])),
      specimen("Stepper", "Multi-step flows: transfer, payroll run, onboarding, card order.", "Under the Page header on web; under the mobile top bar on phones.", "3 to 5 steps with one or two word names. Desktop shows every label; below 800 it switches to \"Step 2 of 4\" with segments.", createStepper({ steps: STEPS.en.slice(0, 3), current: 2 })),
      specimen("Progress checklist", "Progress the user completes in place: activate card, KYC, set PIN.", "Side panel or card on web; full width on mobile home.", "3, 4 or 5 steps, each with a Status. One Current step at a time; only Current and Error show an action.", checklist()),
      specimen("Step marker", "Internal part. Don't place it directly.", "Inside Stepper and Progress checklist.", "Done shows a check, Current a green ring and number, Upcoming a grey ring, Error a red cross.", markers()),
    );
  }

  function stateCell(name, node) {
    const cell = el("div", "dtd-state pgd-state");
    cell.append(node, el("span", "lst-kicker", name));
    return cell;
  }

  function checklistStep(status) {
    const steps = [
      { title: "Activate your card", description: "Tap Activate when the card arrives.", status, action: status === "error" ? "Retry" : "Activate" },
      { title: "", status: "upcoming" },
    ];
    const root = createProgressChecklist({ steps });
    return root.querySelector(".pg-check-step");
  }

  function fillStates() {
    const host = mount("states");
    const grid = el("div", "pgd-tone-grid");
    ["s", "m", "l"].forEach((size) => {
      ["brand", "warning", "error", "neutral"].forEach((tone) => grid.append(stateCell(`${tone} · ${size.toUpperCase()}`, createProgressBar({ tone, size, value: 60, label: `${tone} ${size}` }))));
    });
    host.append(block("Progress bar · tone × size (value 60)", grid));

    const values = el("div", "pgd-tone-grid");
    values.dataset.cols = "3";
    [0, 20, 40, 60, 80, 100].forEach((value) => values.append(stateCell(String(value), createProgressBar({ value, label: `${value}%` }))));
    host.append(block("Progress bar · value 0 → 100", values));

    const markerRow = el("div", "dtd-states");
    ["done", "current", "upcoming", "error"].forEach((status) => markerRow.append(stateCell(status, createStepMarker({ status, number: 1 }))));
    host.append(block("Step marker · Done, Current, Upcoming, Error", markerRow));

    const steps = el("div", "pgd-check-states");
    ["done", "current", "upcoming", "error"].forEach((status) => {
      const list = el("ol", "pg-check-steps");
      list.append(checklistStep(status));
      steps.append(stateCell(status, list));
    });
    host.append(block("Checklist step · status", steps));

    host.append(block("Spend meter · status", meters("en")));

    const flow = el("div", "pgd-stack");
    [1, 2, 3, 4].forEach((current) => flow.append(createStepper({ steps: STEPS.en.slice(0, 4), current })));
    host.append(block("Stepper · current 1 → 4 (Desktop)", flow));
  }

  function fillArabic() {
    const host = mount("arabic");
    const wrap = el("div", "pgd-ar");
    wrap.dir = "rtl";
    wrap.lang = "ar";
    const split = el("div", "pgd-split");
    const card = el("div", "pgd-card");
    card.append(checklist("ar"));
    const bars = el("div", "pgd-card");
    bars.append(tones());
    split.append(card, bars);
    wrap.append(stepperFlow("ar"), meters("ar"), split);
    host.append(block("Arabic · right to left", wrap, "Live"));
  }

  function fillResponsive() {
    const host = mount("responsive");
    const stack = el("div", "dtd-stack");
    const frame = el("div", "dtd-frame pgd-frame");
    frame.dataset.width = "desktop";
    frame.append(createStepper({ steps: STEPS.en, current: 3 }), meter(METERS[1]));
    stack.append(
      segment("Breakpoint", [["desktop", "Desktop"], ["tablet", "Tablet · 760"], ["mobile", "Mobile · 390"]], "desktop", (value) => { frame.dataset.width = value; }),
      frame,
    );
    host.append(block("Breakpoint · the Stepper switches to Step 3 of 5 below 800; meters re-flow", stack, "Live · width"));
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "Progress bar, Spend meter, Stepper, Progress checklist, Step marker", "role progressbar with aria-valuenow, or aria-valuetext for money · Stepper is an ordered list with aria-current=\"step\" · the container query switches to Step 2 of 4 below 800 · fills slide on transform with --motion-standard"],
      ["iOS", "Same names · ProgressView(value:) with a custom style, HStack stepper", "Step 2 of 4 with segments on iPhone; full labels on iPad · VoiceOver reads \"Amount, step 2 of 4, current\" · fills animate with .spring(duration: 0.3, bounce: 0) and turn into a fade with Reduce Motion"],
      ["Android", "Same names · LinearProgressIndicator with HALA DNA colours, Row stepper", "Segments on phones, labels from 840 dp · semantics { progressBarRangeInfo } and stateDescription on each step · emphasized easing for fills, honouring the animator duration scale"],
    ].forEach(([platform, api, notes]) => {
      const line = el("div", "lst-platform");
      line.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(line);
    });
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Show one Current step at a time; keep step names to one or two words.", "Use a stepper for a single form, or for more than 5 steps. Split the flow instead."],
      ["Use Warning from 80% of a limit and Error only once it is exceeded.", "Colour normal progress orange or red to make it stand out."],
      ["Let the breakpoint switch the Stepper to \"Step 2 of 4\" on phones.", "Squeeze the horizontal stepper onto a phone or hide its labels by hand."],
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
