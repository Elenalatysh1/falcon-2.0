(function () {
  const page = document.querySelector('[data-page="loading"]');
  if (!page || !window.createLoadingGuide) return;

  const rules = [
    [true, "Wait 300 ms before showing any loader; if it's faster, show nothing."],
    [true, "Once shown, keep a loader at least 500 ms so it doesn't flicker."],
    [true, "Match skeletons to the real layout and keep known labels visible."],
    [true, "Load sections independently; never block the whole page for one slow widget."],
    [true, "Disable a loading button and keep its width; prevent double payments."],
    [true, "Add aria-busy and a \"Loading\" label for screen readers."],
    [false, "Don't use a full-screen spinner for content that has a layout."],
    [false, "Don't show skeletons for more than 10 s; switch to an error with Retry."],
    [false, "Don't mix skeletons and spinners in the same area."],
    [false, "Don't animate skeletons when the user prefers reduced motion; keep them still and gray."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-load="${name}"]`);
  }

  mount("which").append(createLoadingGuide());
  mount("parts").append(createSkeletonParts());
  mount("screens").append(createSkeletonScreens());
  mount("spinners").append(createLoadingIndicators());

  const controls = el("div", "ld-pair");
  controls.append(createLoadingButtons(), createLoadingFields());
  mount("buttons").append(controls);

  mount("mobile").append(createLoadingPhones());

  const ruleGrid = el("div", "ld-rules");
  rules.forEach(([ok, text]) => {
    const rule = el("div", "ld-rule");
    const mark = el("span", "ld-rule-mark", ok ? "✓" : "×");
    mark.dataset.ok = ok ? "true" : "false";
    rule.append(mark, el("span", "", text));
    ruleGrid.append(rule);
  });
  const block = el("div", "ld-rules-block");
  block.append(createLoadingTimeline(), ruleGrid);
  mount("rules").append(block);
})();