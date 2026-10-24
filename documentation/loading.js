(function () {
  const page = document.querySelector('[data-page="loading"]');
  if (!page || !window.createLoadingGuide) return;

  const rules = [
    ["Match skeletons to the real layout and replace them in place.", "Put a spinner over a whole table, or let the layout jump when data lands."],
    ["Show skeletons after 300 ms; switch to an error state after 10 s.", "Keep skeletons on screen forever when a request fails."],
    ["Pulse slowly (1.2 s) and stop under Reduce motion.", "Use a fast shimmer or skeletons for buttons and actions."],
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

  const arabic = mount("arabic");
  if (arabic) {
    const wrap = el("div");
    wrap.dir = "rtl";
    wrap.lang = "ar";
    wrap.style.fontFamily = "var(--font-arabic)";
    wrap.append(el("span", "ld-kicker", "العمليات · جارٍ التحميل"), createListSkeleton({ rows: 3 }));
    arabic.append(wrap);
  }

  const ruleGrid = el("div", "ld-rules");
  rules.forEach(([yes, no], index) => {
    const card = el("div", "lst-rule");
    card.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
    [[true, yes], [false, no]].forEach(([ok, text]) => {
      const line = el("div", "lst-rule-line");
      line.dataset.ok = ok ? "true" : "false";
      line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
      card.append(line);
    });
    ruleGrid.append(card);
  });
  const block = el("div", "ld-rules-block");
  block.append(createLoadingTimeline(), ruleGrid);
  mount("rules").append(block);
})();