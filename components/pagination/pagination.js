/**
 * Pagination. Load vendor/hala-icons.js and button.js first.
 *
 * createPagination({ page, pages, total, size, sizes, kind, lang, onPage, onSize, onMore })
 *   kind: "table" | "dots" | "step" | "more"
 * createListEnd({ kind, lang, onRetry })
 *   kind: "more" | "start" | "empty" | "error"
 */
(function () {
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function glyph(name) {
    const set = window.halaIcons;
    const kebab = { previous: "chevron-left", next: "chevron-right" }[name] || name;
    const key = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    if (!set || !set.icons[key]) return null;
    const svg = set.createElement(set.icons[key]);
    svg.classList.add("hala-icon");
    if (kebab.includes("chevron")) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  const COPY = {
    en: {
      range: (start, end, total) => `${start}–${end} of ${total}`,
      perPage: "Rows",
      prev: "Previous",
      next: "Next",
      more: "Load more",
      start: "You reached the start of your account",
      empty: "No more results for these filters",
      error: "Couldn't load more.",
      retry: "Try again",
    },
    ar: {
      range: (start, end, total) => `${start}–${end} من ${total}`,
      perPage: "الصفوف",
      prev: "السابق",
      next: "التالي",
      more: "تحميل المزيد",
      start: "وصلت إلى بداية حسابك",
      empty: "لا مزيد من النتائج لهذه الفلاتر",
      error: "تعذّر تحميل المزيد.",
      retry: "حاول مرة أخرى",
    },
  };

  function createPagination(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const kind = options.kind || "table";
    const page = options.page || 1;
    const pages = Math.max(1, options.pages || 1);
    const size = options.size || 10;
    const total = options.total || pages * size;
    const start = (page - 1) * size + 1;
    const end = Math.min(page * size, total);

    if (kind === "dots") {
      const nav = el("nav", "pgz-dots");
      nav.setAttribute("aria-label", lang === "ar" ? "الصفحات" : "Pages");
      for (let index = 1; index <= pages; index += 1) {
        const dot = el("button", "pgz-dot");
        dot.type = "button";
        if (index === page) dot.setAttribute("aria-current", "page");
        dot.setAttribute("aria-label", String(index));
        if (options.onPage) dot.addEventListener("click", () => options.onPage(index));
        nav.append(dot);
      }
      return nav;
    }

    if (kind === "step") {
      const nav = el("nav", "pgz-step");
      const prev = createButton({ label: copy.prev, variant: "secondary", size: "sm", icon: "previous" });
      const next = createButton({ label: copy.next, variant: "secondary", size: "sm", icon: "next", iconPosition: "trailing" });
      prev.disabled = page <= 1;
      next.disabled = page >= pages;
      if (options.onPage) {
        prev.addEventListener("click", () => options.onPage(page - 1));
        next.addEventListener("click", () => options.onPage(page + 1));
      }
      nav.append(prev, el("span", "pgz-count", `${page} / ${pages}`), next);
      return nav;
    }

    if (kind === "more") {
      const wrap = el("div", "pgz-more");
      const button = createButton({ label: copy.more, variant: "secondary", size: "md" });
      if (options.onMore) button.addEventListener("click", options.onMore);
      wrap.append(button, el("span", "pgz-range", copy.range(1, end, total)));
      return wrap;
    }

    const nav = el("div", "pgz-table");
    nav.append(el("span", "pgz-range", copy.range(start, end, total)));
    const pagesRow = el("nav", "pgz-pages");
    pagesRow.setAttribute("aria-label", lang === "ar" ? "الصفحات" : "Pagination");
    const prev = el("button", "pgz-step-btn");
    prev.type = "button";
    prev.setAttribute("aria-label", copy.prev);
    prev.disabled = page <= 1;
    const prevIcon = glyph("previous");
    if (prevIcon) prev.append(prevIcon);
    if (options.onPage) prev.addEventListener("click", () => options.onPage(page - 1));
    pagesRow.append(prev);
    const shown = new Set([1, pages, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pages));
    let last = 0;
    [...shown].sort((a, b) => a - b).forEach((value) => {
      if (value - last > 1) pagesRow.append(el("span", "pgz-gap", "…"));
      const button = el("button", "pgz-page", String(value));
      button.type = "button";
      if (value === page) button.setAttribute("aria-current", "page");
      if (options.onPage) button.addEventListener("click", () => options.onPage(value));
      pagesRow.append(button);
      last = value;
    });
    const next = el("button", "pgz-step-btn");
    next.type = "button";
    next.setAttribute("aria-label", copy.next);
    next.disabled = page >= pages;
    const nextIcon = glyph("next");
    if (nextIcon) next.append(nextIcon);
    if (options.onPage) next.addEventListener("click", () => options.onPage(page + 1));
    pagesRow.append(next);
    nav.append(pagesRow);
    const sizes = el("div", "pgz-sizes");
    sizes.append(el("span", "", copy.perPage));
    (options.sizes || [10, 25, 50]).forEach((value) => {
      const button = el("button", "pgz-size", String(value));
      button.type = "button";
      if (value === size) button.setAttribute("aria-current", "true");
      if (options.onSize) button.addEventListener("click", () => options.onSize(value));
      sizes.append(button);
    });
    nav.append(sizes);
    return nav;
  }

  function createListEnd(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const kind = options.kind || "empty";
    const node = el("div", "pgz-end");
    node.dataset.kind = kind;
    node.append(el("p", "", copy[kind] || copy.empty));
    if (kind === "error") {
      const retry = createButton({ label: copy.retry, variant: "ghost", size: "sm" });
      if (options.onRetry) retry.addEventListener("click", options.onRetry);
      node.append(retry);
    }
    return node;
  }

  window.createPagination = createPagination;
  window.createListEnd = createListEnd;
})();
