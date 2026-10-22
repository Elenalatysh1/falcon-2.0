const scroll = document.querySelector(".docs-scroll");
const stage = document.querySelector(".docs-stage");
const toc = document.querySelector("[data-toc]");
const tocList = document.querySelector("[data-toc-list]");
const side = document.querySelector(".docs-side");
const pages = new Map([...document.querySelectorAll(".doc-page")].map((page) => [page.dataset.page, page]));
let watcher;

function linkName(link) {
  const label = link.querySelector("[data-label]");
  return label ? label.textContent : link.textContent;
}

function pageTitle(route) {
  const exact = document.querySelector(`.docs-link[href="#${route.page}${route.section ? `/${route.section}` : ""}"]`);
  if (exact) return linkName(exact);
  const link = document.querySelector(`.docs-link[href="#${route.page}"]`);
  return link ? linkName(link) : "Falcon 2.0";
}

const aliases = {
  styles: { page: "colors", section: "" },
  checkbox: { page: "selection", section: "" },
  radio: { page: "selection", section: "selection-radio" },
  switch: { page: "selection", section: "selection-toggle" },
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

function sectionId(heading) {
  if (heading.id) return heading.id;
  const section = heading.closest("[id]");
  return section ? section.id : "";
}

function buildToc(page, pageId) {
  if (watcher) watcher.disconnect();
  tocList.replaceChildren();
  const headings = [...page.querySelectorAll("h2")].filter((heading) => sectionId(heading));
  toc.hidden = headings.length === 0;
  stage.classList.toggle("is-plain", headings.length === 0);
  headings.forEach((heading) => {
    const link = document.createElement("a");
    link.href = `#${pageId}/${sectionId(heading)}`;
    link.textContent = heading.textContent;
    tocList.append(link);
  });
  if (!headings.length) return;
  watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const current = `#${pageId}/${sectionId(entry.target)}`;
      tocList.querySelectorAll("a").forEach((link) => {
        if (link.getAttribute("href") === current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { root: scroll, rootMargin: "0px 0px -70% 0px", threshold: 0 });
  headings.forEach((heading) => watcher.observe(heading));
}

const themeKey = "falcon-docs-theme";
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
  if (current) {
    const group = current.closest(".docs-group");
    const toggle = group?.querySelector(".docs-group-btn");
    const list = group?.querySelector(".docs-group-list");
    if (toggle && list) {
      toggle.setAttribute("aria-expanded", "true");
      list.hidden = false;
    }
    current.scrollIntoView({ block: "nearest" });
  }
  buildToc(page, route.page);
  document.title = `${pageTitle(route)} · Falcon 2.0`;
  side.classList.remove("is-open");
  if (route.section) {
    const target = document.getElementById(route.section);
    if (target) target.scrollIntoView({ block: "start" });
  } else {
    scroll.scrollTop = 0;
  }
}

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
