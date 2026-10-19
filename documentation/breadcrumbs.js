(function () {
  const page = document.querySelector('[data-page="breadcrumbs"]');
  if (!page || !window.createBreadcrumbAnatomy) return;

  const rules = [
    [true, "Use on web pages two or more levels deep: detail pages, settings sub-pages."],
    [true, "Start from the section root (Dashboard, Cards), not from \"Home\" plus the company name."],
    [true, "Use the same names as the sidebar and page titles."],
    [true, "Make every crumb a link except the current page."],
    [true, "Collapse the middle with \"…\" after 4 levels."],
    [true, "On narrow web, show only the parent as a back link."],
    [false, "Don't use breadcrumbs for steps in a flow; use a progress bar."],
    [false, "Don't show breadcrumbs on top-level pages; the sidebar already says where you are."],
    [false, "Don't add breadcrumbs in the mobile app; use the back button."],
    [false, "Don't truncate the current page name."],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-crumbs="${name}"]`);
  }

  mount("states").append(createBreadcrumbAnatomy());
  mount("header").append(createBreadcrumbHeader());

  const long = el("div", "bc-pair");
  long.append(createCollapsedBreadcrumb(), createTruncatedBreadcrumb());
  mount("long").append(long);

  const narrow = el("div", "bc-pair");
  narrow.append(createNarrowBreadcrumb(), createArabicBreadcrumb());
  mount("narrow").append(narrow);

  mount("mobile").append(createMobileBreadcrumbs());

  const ruleGrid = el("div", "bc-rules");
  rules.forEach(([ok, text]) => {
    const rule = el("div", "bc-rule");
    const mark = el("span", "bc-rule-mark", ok ? "✓" : "×");
    mark.dataset.ok = ok ? "true" : "false";
    rule.append(mark, el("span", "", text));
    ruleGrid.append(rule);
  });
  mount("rules").append(ruleGrid);
})();
