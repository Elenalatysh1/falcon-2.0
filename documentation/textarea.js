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
    ["Use a textarea when the answer may run past one line.", "Use a textarea for short values like names or numbers."],
    ["Show the counter only when there is a limit.", "Cut the text off silently at the limit."],
    ["Let the field grow with the text, up to a sensible height.", "Make the user scroll inside a tiny box."],
    ["Keep the helper line short, under the field.", "Show the helper and the error message together."],
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
  rules.forEach(([yes, no], index) => {
    const rule = el("div", "lst-rule");
    rule.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
    [[true, yes], [false, no]].forEach(([ok, text]) => {
      const line = el("div", "lst-rule-line");
      line.dataset.ok = ok ? "true" : "false";
      line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
      rule.append(line);
    });
    ruleGrid.append(rule);
  });
  const bottom = el("div", "ta-bottom");
  bottom.append(card, ruleGrid);
  mount("rules").append(bottom);

  const arabic = mount("arabic");
  if (arabic && window.createArabicArea) arabic.append(createArabicArea());
})();
