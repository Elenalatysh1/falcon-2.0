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

function tokenHex(name) {
  const probe = logoEl("i");
  probe.style.color = `var(${name})`;
  probe.hidden = true;
  logoPage.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  const parts = color.match(/\d+/g);
  if (!parts || parts.length < 3) return color;
  return `#${parts.slice(0, 3).map((part) => Number(part).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function fillSwatches() {
  const root = logoPage.querySelector("[data-logo='swatches']");
  if (!root) return;
  const swatches = [
    ["Hala green", "--brand-500", "Logo, app icon"],
    ["Ink", "--text-primary", "Dark backgrounds"],
    ["Mint", "--brand-100", "Light tinted backgrounds"],
    ["White", "--surface-card", "Logo on green, ink, photos"],
  ];
  swatches.forEach(([name, token, use]) => {
    const card = logoEl("div", "lg-swatch");
    const chip = logoEl("span", "lg-chip");
    chip.style.background = `var(${token})`;
    const copy = logoEl("div");
    copy.append(logoEl("strong", "", name), logoEl("span", "lg-meta", tokenHex(token)), logoEl("span", "", use));
    card.append(chip, copy);
    root.append(card);
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

function fillDonts() {
  const root = logoPage.querySelector("[data-logo='donts']");
  if (!root) return;
  [
    ["Don't stretch or squash", "card", "lg-stretch"],
    ["Don't rotate", "card", "lg-tilt"],
    ["Don't change the color", "card", "lg-hue"],
    ["Don't add shadows or effects", "card", "lg-glow"],
    ["Don't use green on green or low contrast", "brand", ""],
    ["Don't outline or box it", "card", "lg-box"],
  ].forEach(([text, ground, treatment]) => {
    const card = logoEl("div", "lg-dont");
    const stage = logoEl("div", "lg-dont-stage");
    stage.dataset.ground = ground;
    const img = logoImg("word", treatment);
    stage.append(img, logoEl("span", "lg-cross", "×"));
    card.append(stage, logoEl("p", "", text));
    root.append(card);
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
  fillSwatches();
  fillExports();
  fillHome();
  fillMasks();
  fillFavs();
  fillDonts();
  fillFiles();
}
