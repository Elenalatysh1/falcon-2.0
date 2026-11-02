const scroll = document.querySelector(".docs-scroll");
const side = document.querySelector(".docs-side");
const pages = new Map([...document.querySelectorAll(".doc-page")].map((page) => [page.dataset.page, page]));

function linkName(link) {
  const label = link.querySelector("[data-label]");
  return label ? label.textContent : link.textContent;
}

function catalogGroups() {
  return [...document.querySelectorAll(".docs-group")].filter((group) => /^(All Components|Patterns)$/.test(group.querySelector(".docs-group-btn span")?.textContent.trim()));
}

catalogGroups().forEach((group) => {
  const list = group.querySelector(".docs-group-list");
  [...list.querySelectorAll(".docs-link")]
    .sort((a, b) => linkName(a).localeCompare(linkName(b), "en", { sensitivity: "base" }))
    .forEach((link) => list.append(link));
});

function pageTitle(route) {
  const exact = document.querySelector(`.docs-link[href="#${route.page}${route.section ? `/${route.section}` : ""}"]`);
  if (exact) return linkName(exact);
  const link = document.querySelector(`.docs-link[href="#${route.page}"]`);
  return link ? linkName(link) : "HALA DNA";
}

const aliases = {
  styles: { page: "colors", section: "" },
  checkbox: { page: "selection", section: "" },
  radio: { page: "selection", section: "selection-radio" },
  switch: { page: "selection", section: "selection-toggle" },
  tables: { page: "data-tables", section: "" },
  confirm: { page: "confirm-auth", section: "" },
  auth: { page: "confirm-auth", section: "" },
  "drop-down": { page: "dropdown", section: "" },
  upload: { page: "file-upload", section: "" },
};

function resolve(hash) {
  const raw = hash.replace(/^#/, "");
  if (!raw) return { page: "introduction", section: "" };
  const [first, second] = raw.split("/");
  if (aliases[first]) {
    const alias = aliases[first];
    return { page: alias.page, section: second || alias.section };
  }
  if (pages.has(first)) return { page: first, section: second || "" };
  const section = document.getElementById(first);
  const owner = section && section.closest(".doc-page");
  if (owner) return { page: owner.dataset.page, section: first };
  return { page: "introduction", section: "" };
}

const themeKey = "hala-dna-docs-theme";
const themedPages = new Set(
  [...document.querySelectorAll(".docs-group")]
    .filter((group) => /^(All Components|Patterns)$/.test(group.querySelector(".docs-group-btn span")?.textContent.trim()))
    .flatMap((group) => [...group.querySelectorAll(".docs-link")].map((link) => link.getAttribute("href").slice(1).split("/")[0]))
);
let theme = localStorage.getItem(themeKey) === "dark" ? "dark" : "light";

function applyTheme(pageId) {
  if (themedPages.has(pageId)) scroll.dataset.theme = theme;
  else delete scroll.dataset.theme;
  document.querySelectorAll("[data-theme-switch] button").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.mode === theme ? "true" : "false");
  });
}

themedPages.forEach((pageId) => {
  const head = pages.get(pageId)?.querySelector(".head");
  if (!head) return;
  const group = document.createElement("div");
  group.className = "nav";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Theme");
  group.dataset.themeSwitch = "";
  [["light", "Light"], ["dark", "Dark"]].forEach(([mode, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.mode = mode;
    button.textContent = label;
    button.addEventListener("click", () => {
      theme = mode;
      localStorage.setItem(themeKey, mode);
      applyTheme(pageId);
    });
    group.append(button);
  });
  head.append(group);
});

function show() {
  const route = resolve(location.hash);
  const page = pages.get(route.page);
  applyTheme(route.page);
  pages.forEach((item) => {
    item.hidden = item !== page;
  });
  const href = route.section ? `#${route.page}/${route.section}` : `#${route.page}`;
  const links = [...document.querySelectorAll(".docs-link")];
  const matched = links.some((link) => link.getAttribute("href") === href);
  links.forEach((link) => {
    const value = link.getAttribute("href");
    const on = matched ? value === href : value === `#${route.page}`;
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const current = document.querySelector(".docs-link[aria-current='page']");
  if (current && !current.hidden) {
    const group = current.closest(".docs-group");
    const toggle = group?.querySelector(".docs-group-btn");
    const list = group?.querySelector(".docs-group-list");
    if (toggle && list) {
      toggle.setAttribute("aria-expanded", "true");
      list.hidden = false;
    }
    current.scrollIntoView({ block: "nearest" });
  }
  query = "";
  input.value = "";
  active = 0;
  closeFinder();
  placeFinder(page);
  buildPageNav(page, route.page, route.section);
  document.title = `${pageTitle(route)} · HALA DNA`;
  side.classList.remove("is-open");
  if (route.section) {
    const target = document.getElementById(route.section);
    if (target) target.scrollIntoView({ block: "start" });
  } else {
    scroll.scrollTop = 0;
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function searchIcon() {
  const iconSet = window.halaIcons;
  const node = iconSet && iconSet.icons && iconSet.icons.Search;
  if (!node) return null;
  const svg = iconSet.createElement(node);
  svg.classList.add("hala-icon");
  svg.dataset.icon = "search";
  svg.style.strokeWidth = "var(--icon-stroke)";
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

function initials(title) {
  const parts = title.split(/\s+/).filter(Boolean);
  return ((parts[0] || "").charAt(0) + (parts[1] || "").charAt(0)).toUpperCase();
}

const finderItems = catalogGroups().flatMap((group) => {
  const label = group.querySelector(".docs-group-btn span").textContent.trim();
  const name = label === "All Components" ? "COMPONENTS" : "PATTERNS";
  return [...group.querySelectorAll(".docs-link")].map((link) => ({
    group: name,
    title: linkName(link),
    href: link.getAttribute("href"),
  }));
});

const finder = el("div", "docs-find");
const menu = el("div", "command-menu");
menu.dataset.variant = "web";
menu.dataset.open = "false";
menu.setAttribute("role", "search");
const listId = "docs-find-list";
const field = el("div", "command-menu-field");
const icon = searchIcon();
if (icon) field.append(icon);
const input = el("input", "command-menu-input");
input.type = "text";
input.placeholder = "Search components and patterns";
input.setAttribute("role", "combobox");
input.setAttribute("aria-autocomplete", "list");
input.setAttribute("aria-expanded", "false");
input.setAttribute("aria-controls", listId);
input.setAttribute("aria-label", "Search components and patterns");
input.autocomplete = "off";
input.spellcheck = false;
const clear = el("button", "command-menu-kbd", "ESC");
clear.type = "button";
clear.setAttribute("aria-label", "Clear search");
field.append(input, clear);
const panel = el("div", "docs-find-panel");
const results = el("div", "command-menu-results");
results.id = listId;
results.setAttribute("role", "listbox");
results.setAttribute("aria-label", "Components and patterns");
const foot = el("div", "command-menu-foot");
[["↑↓", "Move"], ["↵", "Open"], ["ESC", "Clear"]].forEach(([key, label]) => {
  const hint = el("span", "command-menu-hint");
  hint.append(el("span", "command-menu-kbd", key), document.createTextNode(label));
  foot.append(hint);
});
const statusNode = el("span", "command-menu-status");
statusNode.setAttribute("role", "status");
foot.append(statusNode);
panel.append(results, foot);
menu.append(field, panel);
const pageNav = el("nav", "nav docs-page-nav");
pageNav.setAttribute("aria-label", "On this page");
finder.append(pageNav, menu);
let sectionWatcher;

let query = "";
let active = 0;
let shown = finderItems;

function openFinder() {
  menu.dataset.open = "true";
  input.setAttribute("aria-expanded", "true");
}

function closeFinder() {
  menu.dataset.open = "false";
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
}

function placeFinder(page) {
  const head = page.querySelector(":scope > .head");
  const hero = page.querySelector(".gs-hero");
  if (head) head.after(finder);
  else if (hero) hero.after(finder);
  else page.prepend(finder);
}

function sectionId(heading) {
  if (heading.id) return heading.id;
  const section = heading.closest("[id]");
  return section ? section.id : "";
}

function sectionFromHref(href) {
  const raw = (href || "").replace(/^#/, "");
  const parts = raw.split("/");
  return parts[1] || parts[0];
}

function buildPageNav(page, pageId, current) {
  if (sectionWatcher) sectionWatcher.disconnect();
  sectionWatcher = null;
  pageNav.replaceChildren();
  const authored = page.querySelector(":scope > .head > nav.nav");
  const headings = [...page.querySelectorAll("h2")].filter((heading) => sectionId(heading));
  if (authored && authored.querySelector("a")) {
    [...authored.querySelectorAll("a")].forEach((source) => {
      const link = source.cloneNode(true);
      link.dataset.section = sectionFromHref(link.getAttribute("href"));
      pageNav.append(link);
    });
  } else {
    headings.forEach((heading, index) => {
      const id = sectionId(heading);
      const link = document.createElement("a");
      link.href = `#${pageId}/${id}`;
      link.dataset.section = id;
      const number = String(index + 1).padStart(2, "0");
      link.append(el("span", "kicker", number), document.createTextNode(` ${heading.textContent.trim()}`));
      pageNav.append(link);
    });
  }
  pageNav.hidden = pageNav.childElementCount === 0;
  const mark = (id) => {
    pageNav.querySelectorAll("a").forEach((link) => {
      if (id && link.dataset.section === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };
  mark(current);
  if (!headings.length) return;
  const offset = Math.round(finder.getBoundingClientRect().height);
  sectionWatcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      mark(sectionId(entry.target));
    });
  }, { root: scroll, rootMargin: `-${offset}px 0px -60% 0px`, threshold: 0 });
  headings.forEach((heading) => sectionWatcher.observe(heading));
}

function titleNode(title) {
  const node = el("span", "command-menu-title");
  const q = query.trim();
  const at = q ? title.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) {
    node.textContent = title;
    return node;
  }
  node.append(
    document.createTextNode(title.slice(0, at)),
    el("b", "command-menu-hit", title.slice(at, at + q.length)),
    document.createTextNode(title.slice(at + q.length))
  );
  return node;
}

function paintFinder() {
  const q = query.trim().toLowerCase();
  shown = finderItems.filter((item) => !q || item.title.toLowerCase().includes(q));
  if (active >= shown.length) active = 0;
  results.replaceChildren();
  if (!shown.length) {
    const empty = el("div", "command-menu-empty");
    empty.append(
      el("span", "command-menu-empty-title", `No results for “${query.trim()}”`),
      el("span", "command-menu-empty-hint", "Try a component or pattern name.")
    );
    results.append(empty);
    statusNode.textContent = "No results";
    input.removeAttribute("aria-activedescendant");
    return;
  }
  let groupName = "";
  shown.forEach((item, index) => {
    if (item.group !== groupName) {
      groupName = item.group;
      const group = el("div", "command-menu-group");
      group.append(el("div", "command-menu-label", groupName));
      results.append(group);
    }
    const row = el("button", "command-menu-row");
    row.type = "button";
    row.id = `docs-find-option-${index}`;
    row.setAttribute("role", "option");
    row.setAttribute("aria-selected", index === active ? "true" : "false");
    const tile = el("span", "command-menu-tile", initials(item.title));
    const copy = el("span", "command-menu-copy");
    copy.append(titleNode(item.title), el("span", "command-menu-sub", item.group === "COMPONENTS" ? "Component" : "Pattern"));
    row.append(tile, copy);
    row.addEventListener("mouseenter", () => {
      active = index;
      markActive(false);
    });
    row.addEventListener("click", () => openItem(item));
    results.lastElementChild.append(row);
  });
  statusNode.textContent = shown.length === 1 ? "1 result" : `${shown.length} results`;
  const current = results.querySelector('[aria-selected="true"]');
  if (current) input.setAttribute("aria-activedescendant", current.id);
}

function revealRow(row) {
  const box = row.getBoundingClientRect();
  const frame = panel.getBoundingClientRect();
  if (box.top < frame.top) panel.scrollTop -= frame.top - box.top;
  else if (box.bottom > frame.bottom) panel.scrollTop += box.bottom - frame.bottom;
}

function markActive(reveal) {
  results.querySelectorAll(".command-menu-row").forEach((row, index) => {
    row.setAttribute("aria-selected", index === active ? "true" : "false");
    if (index === active) {
      input.setAttribute("aria-activedescendant", row.id);
      if (reveal) revealRow(row);
    }
  });
}

function openItem(item) {
  query = "";
  input.value = "";
  closeFinder();
  input.blur();
  if (location.hash === item.href) show();
  else location.hash = item.href;
}

input.addEventListener("focus", () => {
  openFinder();
  paintFinder();
});
input.addEventListener("input", () => {
  query = input.value;
  active = 0;
  openFinder();
  paintFinder();
});
input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    if (!shown.length) return;
    event.preventDefault();
    openFinder();
    active = event.key === "ArrowDown" ? (active + 1) % shown.length : (active - 1 + shown.length) % shown.length;
    markActive(true);
  } else if (event.key === "Enter") {
    if (!shown.length) return;
    event.preventDefault();
    openItem(shown[active]);
  } else if (event.key === "Escape") {
    event.preventDefault();
    if (query) {
      query = "";
      input.value = "";
      active = 0;
      paintFinder();
    } else {
      closeFinder();
      input.blur();
    }
  }
});
clear.addEventListener("click", () => {
  if (query) {
    query = "";
    input.value = "";
    active = 0;
    openFinder();
    paintFinder();
    input.focus();
  } else {
    closeFinder();
    input.blur();
  }
});
document.addEventListener("pointerdown", (event) => {
  if (!finder.contains(event.target)) closeFinder();
});
pageNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeFinder();
});

document.querySelectorAll(".docs-group-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.nextElementSibling.hidden = !open;
  });
});

document.querySelector("[data-menu]").addEventListener("click", () => {
  side.classList.toggle("is-open");
});

window.addEventListener("hashchange", show);
show();
