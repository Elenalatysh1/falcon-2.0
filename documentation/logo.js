(function () {
const logoPage = document.querySelector('[data-page="logo"]');

const WORDMARK = "../media/type=full, color=brand.svg";
const SYMBOL = "../media/type=short, color=brand.svg";

function logoEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function logoImg(kind, className) {
  const img = document.createElement("img");
  img.src = kind === "word" ? WORDMARK : SYMBOL;
  img.alt = "";
  if (className) img.className = className;
  return img;
}

function logoMark(kind, color, label) {
  const mark = logoEl("span", "lg-logo");
  mark.dataset.kind = kind;
  mark.dataset.color = color;
  mark.setAttribute("role", "img");
  mark.setAttribute("aria-label", label || (kind === "word" ? "HALA" : "Hala symbol"));
  return mark;
}

function fillUses() {
  const root = logoPage.querySelector("[data-logo='uses']");
  if (!root) return;
  [
    ["Green on white", "card", "brand", "green/500 on background/primary"],
    ["White on green", "brand", "white", "background/primary on green/700"],
    ["White on ink", "ink", "white", "background/primary on text/primary"],
    ["Green on mint", "mint", "brand-dark", "green/700 on green/100"],
    ["One color · print only", "card", "ink", "text/primary on background/primary"],
  ].forEach(([name, ground, color, tokens]) => {
    const item = logoEl("div", "lg-use-item");
    const tile = logoEl("div", "lg-use");
    tile.dataset.ground = ground;
    tile.append(logoMark("word", color));
    item.append(tile, logoEl("strong", "", name), logoEl("span", "lg-meta", tokens));
    root.append(item);
  });
}

function fillProduct() {
  const root = logoPage.querySelector("[data-logo='product']");
  if (!root) return;
  [
    ["Web header", "Wordmark", "24 px", "Left-aligned, links to home"],
    ["Sidebar · expanded", "Wordmark", "22 px", ""],
    ["Sidebar · collapsed", "Symbol", "28 px", ""],
    ["Mobile sign-in", "Wordmark", "32 px", ""],
    ["Mobile home header", "Symbol", "28 px", ""],
    ["Launch screen", "Symbol", "64 pt", "Centered. No loading text or tagline"],
  ].forEach(([place, logo, height, note]) => {
    const row = logoEl("div", "lg-file");
    row.append(logoEl("strong", "", place), logoEl("span", "", logo), logoEl("span", "lg-meta", height), logoEl("span", "", note));
    root.append(row);
  });
}

function fillSchemes() {
  const root = logoPage.querySelector("[data-logo='schemes']");
  if (!root) return;
  ["dark", "light"].forEach((surface) => {
    const panel = logoEl("div", "lg-scheme-panel");
    panel.dataset.surface = surface;
    ["mada", "Visa", "Mastercard", "Apple Pay", "Google Pay"].forEach((name) => {
      const mark = logoEl("span", "lg-scheme", name);
      mark.dataset.wide = name.length > 4 ? "true" : "false";
      panel.append(mark);
    });
    root.append(panel);
  });
}

function fillRules() {
  const root = logoPage.querySelector("[data-logo='rules']");
  if (!root) return;
  [
    ["Use the supplied logo components and files.", "Redraw, retype, stretch or recolor the logo."],
    ["Below 80 px wide, switch from the wordmark to the symbol.", "Shrink the wordmark below 80 px."],
    ["Use green on white or mint, and white on green, ink or photos.", "Put green on a busy photo or on another strong color."],
    ["Keep at least 2x clear space on every side (x = H stem width).", "Let text or other shapes enter the clear space."],
  ].forEach(([doText, dontText], index) => {
    const row = logoEl("div", "lg-pair");
    row.append(logoEl("span", "lg-pair-index", String(index + 1).padStart(2, "0")));
    [["do", "Do", doText], ["dont", "Don’t", dontText]].forEach(([kind, label, text]) => {
      const card = logoEl("div", "lg-pair-card");
      card.dataset.kind = kind;
      card.append(logoEl("span", "lg-pair-label", label), logoEl("p", "", text));
      row.append(card);
    });
    root.append(row);
  });
}

function fillExports() {
  const root = logoPage.querySelector("[data-logo='exports']");
  if (!root) return;
  [
    ["rail", "1024\nApp Store"],
    ["input", "180\n@3x"],
    ["web", "120\n@2x"],
    ["switch-sm", "87\nSettings"],
    ["switch", "60\nNotifications"],
  ].forEach(([box, label]) => {
    const item = logoEl("div", "lg-specimen");
    const tile = logoEl("div", "lg-export");
    tile.dataset.box = box;
    tile.append(logoImg("symbol", "lg-on-fill"));
    item.append(tile, logoEl("span", "lg-meta", label));
    root.append(item);
  });
}

function fillHome() {
  const root = logoPage.querySelector("[data-logo='home']");
  if (!root) return;
  [
    ["Hala", true],
    ["Mail", false],
    ["Calendar", false],
    ["Photos", false],
    ["Maps", false],
    ["Notes", false],
    ["Wallet", false],
    ["Settings", false],
  ].forEach(([label, hala]) => {
    const item = logoEl("div", "lg-home-item");
    const icon = logoEl("div", "lg-home-icon");
    if (hala) {
      icon.dataset.hala = "true";
      icon.append(logoImg("symbol", "lg-on-fill"));
    }
    item.append(icon, logoEl("span", "", label));
    root.append(item);
  });
}

function fillMasks() {
  const root = logoPage.querySelector("[data-logo='masks']");
  if (!root) return;
  [
    ["Circle", "50%"],
    ["Squircle", "30%"],
    ["Rounded", "var(--radius-l)"],
    ["Teardrop", "50% 50% 50% var(--radius-control)"],
  ].forEach(([label, radius]) => {
    const item = logoEl("div", "lg-specimen");
    const tile = logoEl("div", "lg-mask");
    tile.style.borderRadius = radius;
    tile.append(logoImg("symbol", "lg-on-fill"));
    item.append(tile, logoEl("span", "lg-meta", label));
    root.append(item);
  });
}

function fillFavs() {
  const root = logoPage.querySelector("[data-logo='favs']");
  if (!root) return;
  [
    ["16", "16"],
    ["32", "32"],
    ["48", "48"],
    ["touch", "180\napple-touch"],
    ["mask", "512\nmaskable"],
  ].forEach(([box, label]) => {
    const item = logoEl("div", "lg-specimen");
    const tile = logoEl("div", "lg-fav");
    tile.dataset.box = box;
    tile.append(logoImg("symbol", "lg-on-fill"));
    item.append(tile, logoEl("span", "lg-meta", label));
    root.append(item);
  });
}

function fillFiles() {
  const root = logoPage.querySelector("[data-logo='files']");
  if (!root) return;
  [
    ["hala-wordmark.svg", "vector", "SVG", "Green, white and black versions"],
    ["hala-symbol.svg", "vector", "SVG", "Green, white and black versions"],
    ["AppIcon.png", "1024 × 1024", "PNG", "iOS: no transparency, no rounded corners"],
    ["AppIcon-dark / tinted.png", "1024 × 1024", "PNG", "iOS 18: transparent background for dark, grayscale for tinted"],
    ["ic_launcher_foreground.xml", "108 × 108 dp", "Vector", "Android: symbol inside 66 dp safe circle"],
    ["ic_launcher_background", "#009A78", "Color", "Android background layer"],
    ["ic_launcher_monochrome.xml", "108 × 108 dp", "Vector", "Android 13+ themed icons"],
    ["play-store-icon.png", "512 × 512", "PNG", "Google Play listing"],
    ["favicon.svg + favicon.ico", "16, 32, 48", "SVG + ICO", "SVG for modern browsers, ICO as fallback"],
    ["apple-touch-icon.png", "180 × 180", "PNG", "iPhone “Add to Home Screen”"],
    ["icon-512-maskable.png", "512 × 512", "PNG", "PWA; symbol inside the middle 80%"],
    ["og-image.png", "1200 × 630", "PNG", "Link previews in WhatsApp, Slack, X, LinkedIn"],
  ].forEach(([file, size, format, note]) => {
    const row = logoEl("div", "lg-file");
    row.append(logoEl("span", "", file), logoEl("span", "", size), logoEl("span", "", format), logoEl("span", "", note));
    root.append(row);
  });
}

if (logoPage) {
  fillUses();
  fillProduct();
  fillSchemes();
  fillRules();
  fillExports();
  fillHome();
  fillMasks();
  fillFavs();
  fillFiles();
}
})();
