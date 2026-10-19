(function () {
  const page = document.querySelector('[data-page="textarea"]');
  if (!page || !window.createTextAreaStates) return;

  const which = [
    ["Name, IBAN, amount", "Input", false],
    ["Transfer reference (≤ 35)", "Input", false],
    ["Transfer note (≤ 140)", "Text area", true],
    ["Rejection reason", "Text area", true],
    ["Support message", "Text area", true],
    ["Address", "Several inputs", false],
  ];

  const rules = [
    [true, "Use when the answer can be longer than one line or 60 characters."],
    [true, "Show an example in the placeholder, never the instructions."],
    [true, "Start at 3 lines and grow to 8; then scroll."],
    [true, "Show the counter only near the limit; let people type past it and say how much to cut."],
    [true, "Validate on blur or submit, not while typing."],
    [true, "Mark it \"optional\" when not required."],
    [false, "Don't use a text area for structured data (amounts, dates, IBANs)."],
    [false, "Don't clear what the user typed after an error."],
    [false, "Don't use font below 16 on mobile."],
    [false, "Don't submit on Enter in multi-line fields; use ⌘/Ctrl + Enter on web."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-textarea="${name}"]`);
  }

  mount("states").append(createTextAreaStates());

  const live = el("div", "ta-split");
  live.append(createTextAreaLive(), createTextAreaAnatomy());
  mount("live").append(live);

  const variants = el("div", "ta-variants");
  variants.append(createRejectNote(), createCommentComposer(), createTermsArea(), createArabicArea());
  mount("variants").append(variants);

  const phones = el("div", "ta-phones");
  phones.append(createCardRequestPhone(), createSupportComposer());
  mount("mobile").append(phones);

  const card = el("div", "ta-which");
  card.append(el("span", "ta-kicker", "Input or text area?"));
  which.forEach(([name, value, area]) => {
    const row = el("div", "ta-which-row");
    if (area) row.dataset.area = "true";
    row.append(el("span", "", name), el("span", "", value));
    card.append(row);
  });
  const ruleGrid = el("div", "ta-rules");
  rules.forEach(([ok, text]) => {
    const rule = el("div", "ta-rule");
    const mark = el("span", "ta-rule-mark", ok ? "✓" : "×");
    mark.dataset.ok = ok ? "true" : "false";
    rule.append(mark, el("span", "", text));
    ruleGrid.append(rule);
  });
  const bottom = el("div", "ta-bottom");
  bottom.append(card, ruleGrid);
  mount("rules").append(bottom);
})();
