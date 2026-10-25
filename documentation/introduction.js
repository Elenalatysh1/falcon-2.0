/* Introduction. Placeholder page, marked Draft. */
(function () {
  const page = document.querySelector('[data-page="introduction"]');
  if (!page || page.childElementCount) return;

  const routes = {
    "Hala Foundations.dc.html": "#colors",
    "Hala Foundations.dc.html#space": "#space",
    "Hala Foundations.dc.html#radius": "#space/space-radius",
    "Hala Foundations.dc.html#motion": "#motion",
    "Hala Logo.dc.html": "#logo",
    "Hala Icons.dc.html": "#icons",
    "Hala Buttons.dc.html": "#button",
    "Hala Button Groups.dc.html": "#button-groups",
    "Hala Badges.dc.html": "#badges",
    "Hala Command Menu.dc.html": "#command-menu",
    "Hala Inputs.dc.html": "#inputs",
    "Hala Selection Controls.dc.html": "#selection",
    "Hala Date Pickers.dc.html": "#date-pickers",
    "Hala Accordions.dc.html": "#accordions",
    "Hala Dividers.dc.html": "#dividers",
    "Hala Overlays.dc.html": "#overlays",
    "Hala Feedback.dc.html": "#feedback",
  };

  const icons = {
    Buttons: "add",
    "Button groups": "filter",
    Badges: "verified",
    "Command menu": "search",
    Inputs: "edit",
    "Text area": "documents",
    "Selection controls": "confirm",
    "Date pickers": "calendar",
    "Time picker": "pending",
    "File upload": "upload",
    Tables: "dashboard",
    Filters: "filter",
    Pagination: "more",
    Breadcrumbs: "open-link",
    Accordions: "collapse",
    Dividers: "more",
    Overlays: "notifications",
    Feedback: "notifications",
    Progress: "trend-up",
    "Empty states": "documents",
    Patterns: "help",
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function glyph(name) {
    if (typeof icon !== "function") return null;
    try { return icon(name, { size: "default" }); }
    catch (error) { return null; }
  }

  function draft() {
    return window.createBadge
      ? window.createBadge({ label: "Draft", tone: "draft", size: "sm" })
      : el("span", "badge", "Draft");
  }

  function card(className) {
    return el("div", className || "gs-card");
  }

  const root = el("div", "gs");
  const hero = el("section", "gs-hero");
  const inner = el("div", "gs-hero-inner");
  const brand = el("div", "gs-brand");
  const mark = el("span", "gs-mark", "H");
  brand.append(mark, el("span", "gs-brand-name", "HALA DNA"), el("span", "gs-pill", "Hala design system"), draft());
  const meta = el("div", "gs-brand");
  meta.append(brand, el("span", "gs-quiet", "v2.0 · October 2026"));
  const title = el("h1", "", "HALA DNA");
  const lede = el("p", "gs-hero-copy", "The design system behind Hala Business, the banking and payments app for Saudi companies. It covers web and mobile in English and Arabic, from the brand foundations to complete flows.");
  const actions = el("div", "gs-actions");
  const start = window.createButton
    ? window.createButton({ label: "Start with foundations", variant: "primary", size: "md" })
    : el("a", "", "Start with foundations");
  start.addEventListener("click", () => { location.hash = "#colors"; });
  const browse = window.createButton
    ? window.createButton({ label: "Browse components", variant: "secondary", size: "md" })
    : el("a", "", "Browse components");
  browse.addEventListener("click", () => { location.hash = "#button"; });
  actions.append(start, browse);
  const stats = el("div", "gs-stats");
  [["26", "documented pages"], ["30+", "components"], ["2", "platforms · web, iOS/Android"], ["2", "languages · EN, AR"], ["85", "approved icons"]].forEach(([value, label]) => {
    const item = el("div", "gs-stat");
    item.append(el("strong", "", value), el("span", "", label));
    stats.append(item);
  });
  inner.append(meta, title, lede, actions, stats);
  hero.append(inner);

  const what = el("section", "gs-block gs-split");
  what.id = "introduction-what";
  const whatCopy = el("div", "");
  whatCopy.append(el("p", "gs-kicker", "01 · What it is"), el("h2", "", "One system, two platforms, two languages."));
  const prose = el("div", "gs-prose");
  prose.append(
    el("p", "", "HALA DNA is the shared language for everyone building Hala Business: designers, engineers, product and content. It sets out how the product looks, how it behaves and how it speaks."),
    el("p", "", "Each component page shows every state, live examples you can use, mobile versions, and rules for when to use it and when not to. The values on those pages come from one token file.")
  );
  const covers = el("div", "gs-grid");
  [["Foundations", "Color, type, spacing, radius, elevation, motion, icons, illustrations, logo."], ["Components", "From buttons to tables, each with every state, web and mobile versions, and rules."], ["Patterns", "How components combine: filters, flows, confirmations, dashboards."], ["Screens", "Moodboards and reference screens for web and mobile."]].forEach(([name, copy]) => {
    const item = card("gs-mini");
    item.append(el("strong", "", name), el("span", "", copy));
    covers.append(item);
  });
  what.append(whatCopy, prose);
  const whatWrap = el("section", "gs-block");
  whatWrap.id = "introduction-what";
  what.removeAttribute("id");
  const whatGrid = el("div", "gs-split");
  whatGrid.append(whatCopy, el("div", ""));
  whatGrid.lastChild.append(prose, covers);
  whatWrap.append(whatGrid);

  const principles = el("section", "gs-block");
  principles.id = "introduction-principles";
  principles.append(el("p", "gs-kicker", "02 · Principles"), el("h2", "", "What every screen should do"));
  const principleGrid = el("div", "gs-principles");
  [
    ["01", "Money first, always clear", "Balances, amounts and statuses are the most important content. Numbers use Plex Mono, have a sign and two decimals, and are never decorated.", "− 25,000.00 · Pending"],
    ["02", "One main action", "Each screen has one gradient button. Everything else is secondary, so the next step is always obvious.", "Send SAR 25,000"],
    ["03", "Calm by default", "White cards on a mint-gray background. Color is used only for status, data and the brand mark, never for decoration.", "#EEF3F1 · #FFFFFF"],
    ["04", "Say what happens", "Buttons are verbs, errors say how to fix them, and anything that moves money shows what happens next.", "“Arrives the next business day”"],
    ["05", "Built for Saudi business", "Arabic and English are equally important. The layout mirrors for right-to-left, the week starts on Sunday, banks close Friday and Saturday, and VAT is always shown.", "RTL · SAR · 15% VAT"],
    ["06", "Same on every screen", "One set of tokens and one component library. Web follows desktop patterns and mobile follows iOS and Android, but they look and read the same.", "Web · iOS · Android"],
  ].forEach(([number, name, copy, example]) => {
    const item = card("gs-card");
    item.append(el("span", "gs-principle-no", number), el("h3", "", name), el("p", "", copy), el("span", "gs-example", example));
    principleGrid.append(item);
  });
  principles.append(principleGrid);

  const blocks = el("section", "gs-block");
  blocks.id = "introduction-foundations";
  blocks.append(el("p", "gs-kicker", "03 · Foundations at a glance"), el("h2", "", "The building blocks"));
  const foundTop = el("div", "gs-found");
  const color = el("a", "gs-card");
  color.href = "#colors";
  const colorHead = el("div", "gs-spread");
  colorHead.append(el("strong", "", "Color"), el("span", "gs-open", "Open →"));
  const swatches = el("div", "gs-swatches");
  [["var(--brand-500)", "Hala green"], ["var(--surface-inverse)", ""], ["var(--surface-canvas)", ""], ["var(--action-soft)", ""], ["var(--brand-300)", ""]].forEach(([fill, label]) => {
    const swatch = el("span", "gs-swatch", label);
    swatch.style.background = fill;
    if (!label) swatch.style.color = "transparent";
    swatches.append(swatch);
  });
  const dots = el("div", "gs-dots");
  ["var(--chart-1)", "var(--status-warning)", "var(--status-error)", "var(--status-info)", "var(--chart-4)"].forEach((fill) => {
    const dot = el("i", "");
    dot.style.background = fill;
    dots.append(dot);
  });
  color.append(colorHead, swatches, dots, el("span", "gs-note", "Brand, ink, surfaces, borders, status and chart colors, with contrast checked."));
  const type = el("a", "gs-card");
  type.href = "#typography";
  const typeHead = el("div", "gs-spread");
  typeHead.append(el("strong", "", "Typography"), el("span", "gs-open", "Open →"));
  const sample = el("div", "gs-type-sample");
  sample.append(el("b", "", "Aa"), el("em", "", "01"), el("span", "", "أب"));
  type.append(typeHead, sample, el("span", "gs-amount", "SAR 175,000.00"), el("span", "gs-note", "IBM Plex Sans, Plex Mono for numbers, Plex Sans Arabic."));
  foundTop.append(color, type);
  const foundGrid = el("div", "gs-grid");
  [
    ["Spacing", "Spacing and layout", "4 px base, 11 steps, 12-column grid, breakpoints.", "#space"],
    ["Shape", "Radius and elevation", "Soft corners, pill buttons, tinted shadows.", "#space/space-radius"],
    ["Motion", "Motion", "Smooth springs, seven durations, reduced motion.", "#motion"],
    ["Brand", "Logo", "Wordmark, symbol, app icons, favicons.", "#logo"],
    ["Icons", "Icons", "Hala twotone set, 85 approved icons.", "#icons"],
    ["Art", "Illustrations", "Glass spot illustrations for every state.", ""],
  ].forEach(([tag, name, copy, href]) => {
    const item = href ? el("a", "gs-mini") : card("gs-mini");
    if (href) item.href = href;
    item.append(el("span", "gs-kicker", tag), el("strong", "", name), el("span", "", copy));
    if (!href) item.append(draft());
    foundGrid.append(item);
  });
  blocks.append(foundTop, foundGrid);

  const library = el("section", "gs-block");
  library.id = "introduction-library";
  const libHead = el("div", "gs-title-row");
  const libTitles = el("div", "");
  libTitles.append(el("p", "gs-kicker", "04 · Components"), el("h2", "", "Library"));
  libHead.append(libTitles, el("span", "gs-note", "Every page has states, live demos, web and mobile versions, and rules."));
  const groups = el("div", "gs-library");
  [
    ["Actions", [["Buttons", "Primary, secondary, arrow, sizes", "Hala Buttons.dc.html"], ["Button groups", "Segmented, chips, split", "Hala Button Groups.dc.html"], ["Badges", "Status, counters, tags", "Hala Badges.dc.html"], ["Command menu", "⌘K search and actions", "Hala Command Menu.dc.html"]]],
    ["Inputs", [["Inputs", "Text, IBAN, phone, OTP, password", "Hala Inputs.dc.html"], ["Text area", "Notes, reasons, comments", ""], ["Selection controls", "Checkbox, radio, toggle, cards", "Hala Selection Controls.dc.html"], ["Date pickers", "Single, range, wheel", "Hala Date Pickers.dc.html"], ["Time picker", "Slots, columns, hours, dial", ""], ["File upload", "Dropzone, KYB slots, CSV", ""]]],
    ["Data and navigation", [["Tables", "16 cell types, bulk actions", ""], ["Filters", "Transactions, charts, cards", ""], ["Pagination", "Pages, load more, infinite", ""], ["Breadcrumbs", "Web paths, mobile back", ""], ["Accordions", "FAQ, settings, details", "Hala Accordions.dc.html"], ["Dividers", "Separators and spacing", "Hala Dividers.dc.html"]]],
    ["Overlays and feedback", [["Overlays", "Modals, drawers, sheets", "Hala Overlays.dc.html"], ["Feedback", "Alerts, toasts, notifications", "Hala Feedback.dc.html"], ["Progress", "Tasks, steps, usage, goals", ""], ["Empty states", "First use, no results, errors", ""]]],
    ["Guidance", [["Patterns", "Do and don't, 10 combinations", ""]]],
  ].forEach(([group, items]) => {
    const block = el("div", "");
    block.append(el("p", "gs-group-label", group));
    const grid = el("div", "gs-libs");
    items.forEach(([name, copy, source]) => {
      const href = routes[source];
      const item = href ? el("a", "gs-lib") : el("div", "gs-lib");
      if (href) item.href = href;
      const tile = el("span", "gs-lib-icon");
      const drawn = glyph(icons[name] || "help");
      if (drawn) tile.append(drawn);
      const text = el("div", "");
      text.append(el("strong", "", name), el("span", "", copy));
      item.append(tile, text);
      if (href) item.append(el("span", "gs-arrow", "→"));
      else item.append(draft());
      grid.append(item);
    });
    block.append(grid);
    groups.append(block);
  });
  library.append(libHead, groups);

  const startSection = el("section", "gs-block");
  startSection.id = "introduction-start";
  startSection.append(el("p", "gs-kicker", "05 · How to use it"), el("h2", "", "Getting started"));
  const roles = el("div", "gs-roles");
  [
    ["Designers", ["Start from Foundations and use tokens, never raw values.", "Copy components from their page; check every state is covered.", "Read the rules section before combining components.", "Design mobile and Arabic versions with the web version, not after it."]],
    ["Engineers", ["Map tokens to your theme: CSS variables on web, theme files on mobile.", "Use Hala icons through icons/api.js and Plex fonts from Google Fonts.", "Use the live demos to check behavior: focus, errors, loading.", "Support RTL from the start with logical properties."]],
    ["Product and content", ["Use Patterns to choose the right flow and feedback.", "Write buttons as verbs and errors as fixes.", "Format money as “SAR 25,000.00”, dates as DD/MM/YYYY.", "Ask for new components in #hala-dna-design before building one-offs."]],
  ].forEach(([name, steps]) => {
    const item = card();
    item.append(el("h3", "", name));
    const list = el("ol", "gs-steps");
    steps.forEach((step, index) => {
      const row = el("li", "");
      row.append(el("span", "gs-num", String(index + 1)), el("span", "", step));
      list.append(row);
    });
    item.append(list);
    roles.append(item);
  });
  const naming = el("div", "gs-ink");
  const namingCopy = el("div", "");
  namingCopy.append(el("h3", "", "Naming"), el("p", "", "Tokens are named by role, not by value, so they can change without breaking anything. Components use the same names in Figma and in code."));
  const code = el("pre", "gs-code", "brand/600        #0B8F6E   selected, toggles\ntext/secondary   #4A615A   descriptions\nsurface/canvas   #EEF3F1   page background\nradius/xl        20px      cards, modals\nshadow/2                   floating menus, toasts\nmotion/standard  240ms     drawers, sheets");
  naming.append(namingCopy, code);
  startSection.append(roles, naming);

  const news = el("section", "gs-block");
  const newsGrid = el("div", "gs-pair");
  const fresh = card();
  fresh.id = "introduction-new";
  fresh.append(el("p", "gs-kicker", "06 · What's new in 2.0"), el("h2", "", "What's new in 2.0"));
  [["brand", "Arabic and right-to-left rules on every page, using IBM Plex Sans Arabic."], ["brand", "Mobile versions for every component, following iOS and Android conventions."], ["brand", "Hala twotone icon set from HALA DNA, replacing Lucide."], ["brand", "Glass spot illustrations for empty, error and success states."], ["info", "Softer surfaces: white cards on mint-gray, pill buttons, floating drawers."], ["info", "Amounts and IDs use Plex Mono everywhere."]].forEach(([tone, text], index) => {
    const row = el("div", "gs-news");
    const label = index < 4 ? "New" : "Changed";
    row.append(window.createBadge ? window.createBadge({ label, tone, size: "sm" }) : el("span", "", label), el("span", "", text));
    fresh.append(row);
  });
  const refs = card();
  refs.id = "introduction-screens";
  refs.append(el("p", "gs-kicker", "07 · Reference screens"), el("h2", "", "Reference screens"));
  [["Dashboard · web", "Sidebar, KPIs, charts, tasks", ""], ["UI moodboard · web", "Charts, forms, cards, onboarding, POS flow", ""], ["UI moodboard · mobile", "Home, cards, order a card", ""], ["Foundations", "All tokens in one place", "#colors"], ["Logo", "Brand mark usage", "#logo"]].forEach(([name, copy, href]) => {
    const row = href ? el("a", "gs-ref") : el("div", "gs-ref");
    if (href) row.href = href;
    const text = el("div", "");
    text.append(el("strong", "", name), el("span", "", copy));
    row.append(text);
    if (href) row.append(el("span", "gs-open", "→"));
    else row.append(draft());
    refs.append(row);
  });
  newsGrid.append(fresh, refs);
  news.append(newsGrid);

  const foot = el("footer", "gs-foot");
  const footBrand = el("div", "gs-brand");
  footBrand.append(el("strong", "", "HALA DNA"), el("span", "", "· Hala design system"));
  foot.append(footBrand, el("span", "", "Questions or a component you need? Ask the design team in #hala-dna-design."));

  root.append(hero, whatWrap, principles, blocks, library, startSection, news, foot);
  page.append(root);
})();
