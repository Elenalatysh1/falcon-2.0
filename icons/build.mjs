/**
 * Builds vendor/hala-icons.js from the Hala icon paths exported from Figma
 * (HALA DNA 0.2, page Icons) in icons/source/*.json.
 *
 *   npm run build:icons
 *
 * Source format: { "hala-name": [[tone, rule, d], ...] }
 *   tone 1 = icon/primary, tone 2 = icon/secondary, rule "e" = evenodd.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourceDir = path.join(root, "icons/source");

const hala = {};
for (const file of fs.readdirSync(sourceDir).filter((f) => /^batch-\d+\.json$/.test(f)).sort()) {
  Object.assign(hala, JSON.parse(fs.readFileSync(path.join(sourceDir, file), "utf8")));
}

/** sums.json holds an FNV-1a hash of each icon's paths, computed in Figma. */
const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36);
};
const sums = JSON.parse(fs.readFileSync(path.join(sourceDir, "sums.json"), "utf8"));
const checked = new Set();
for (const [figmaName, sum] of Object.entries(sums)) {
  const name = figmaName.split("/")[1];
  if (!hala[name]) throw new Error(`${figmaName}: in sums.json but not exported`);
  if (hash(JSON.stringify(hala[name])) !== sum) throw new Error(`${figmaName}: paths do not match Figma`);
  checked.add(name);
}
for (const name of Object.keys(hala)) {
  if (!checked.has(name)) throw new Error(`${name}: no Figma checksum in sums.json`);
}

/** Falcon name → icon, as mapped on the Figma Icons showcase. */
const catalog = {
  dashboard: "category",
  home: "home",
  transactions: "arrow-swap-horizontal",
  transfers: "send-2",
  payroll: "calendar-2",
  cards: "credit-card",
  sadad: "receipt",
  pos: "smartphone",
  ecommerce: "shopping-cart",
  invoicing: "document-text",
  "food-delivery": "coffee",
  locations: "map-pin",
  users: "people",
  documents: "document-copy",
  help: "message-question",
  settings: "setting-2",
  account: "landmark",
  wallet: "wallet",
  cash: "circle-dollar",
  savings: "piggy-bank",
  income: "arrow-down",
  outgoing: "arrow-up",
  "trend-up": "trending-up",
  "trend-down": "trending-down",
  "bar-chart": "chart",
  "line-chart": "chart-line",
  percent: "percent",
  refund: "undo",
  "qr-pay": "scan-barcode",
  contactless: "wifi",
  add: "add",
  close: "close-circle",
  confirm: "tick-square",
  edit: "edit-2",
  delete: "trash",
  copy: "copy",
  download: "import",
  upload: "export",
  share: "share",
  filter: "filter",
  adjust: "setting-4",
  search: "search-normal",
  refresh: "refresh",
  more: "ellipsis",
  "open-link": "link",
  lock: "lock",
  unlock: "unlock",
  verified: "verify",
  fingerprint: "finger-scan",
  "face-id": "scan",
  show: "eye",
  hide: "eye-slash",
  freeze: "snowflake",
  key: "key",
  "sign-out": "logout",
  success: "tick-circle",
  error: "close-circle",
  warning: "danger",
  info: "info-circle",
  pending: "clock",
  notifications: "bell",
  muted: "bell-slash",
  offline: "wifi-square",
  company: "office-badge",
  shop: "shopping-bag",
  delivery: "truck",
  product: "box",
  tag: "tag",
  calendar: "calendar",
  camera: "camera",
  image: "gallery",
  attachment: "paperclip",
  email: "mail",
  phone: "phone",
  chat: "comment",
  language: "language-square",
  support: "message-question",
  gift: "gift",
  sparkles: "magic-star",
  back: "arrow-left",
  forward: "arrow-right",
  expand: "arrow-down",
  next: "arrow-chevron-right",
  previous: "arrow-chevron-left",
  collapse: "arrow-up",
  sort: "sort",
  sidebar: "menu",
};

/** Direction icons. CSS flips these when the page is RTL. */
const mirror = [
  "arrow-left",
  "arrow-right",
  "arrow-chevron-left",
  "arrow-chevron-right",
  "chevron-left",
  "chevron-right",
  "line-arrow-left",
  "line-arrow-right",
  "send-2",
  "logout",
  "undo",
  "menu",
];

/** Lucide names that components already use → Hala icon. */
const aliases = {
  "arrow-down-left": "arrow-down",
  "arrow-down-right": "arrow-down",
  "arrow-left-right": "arrow-swap-horizontal",
  "arrow-up-down": "sort",
  "arrow-up-right": "arrow-up",
  "at-sign": "at",
  banknote: "circle-dollar",
  "bar-chart": "chart",
  "bell-off": "bell-slash",
  "calendar-days": "calendar-2",
  "chart-column": "chart",
  check: "check-2",
  "circle-alert": "circle-exclamation",
  "circle-check": "tick-circle",
  "circle-help": "message-question",
  "circle-x": "close-circle",
  "columns-3": "layout-columns-3",
  "corner-down-right": "line-arrow-right",
  "external-link": "link",
  "eye-off": "eye-slash",
  "file-text": "document-text",
  "file-warning": "file-exclamation",
  files: "document-copy",
  fingerprint: "finger-scan",
  headset: "message-question",
  house: "home",
  image: "gallery",
  inbox: "tray",
  info: "info-circle",
  "key-round": "key",
  "layout-dashboard": "category",
  "layout-grid": "layout-cells",
  "line-chart": "chart-line",
  list: "list-ul",
  "list-filter": "filter",
  "lock-open": "unlock",
  "log-out": "logout",
  "message-circle": "comment",
  nfc: "wifi",
  package: "box",
  "panel-left": "menu",
  pencil: "edit-2",
  plus: "add",
  "qr-code": "scan-barcode",
  "receipt-text": "receipt",
  "refresh-cw": "refresh",
  "scan-face": "scan",
  search: "search-normal",
  "search-x": "search-status",
  send: "send-2",
  settings: "setting-2",
  "share-2": "share",
  "shield-check": "verify",
  "sliders-horizontal": "setting-4",
  smile: "face-smile",
  sparkles: "magic-star",
  store: "shopping-bag",
  table: "layout-header-cells",
  "trash-2": "trash",
  "triangle-alert": "danger",
  "undo-2": "undo",
  "user-plus": "user-add",
  users: "people",
  "utensils-crossed": "coffee",
  "wifi-off": "wifi-square",
  x: "xmark",
  download: "import",
  upload: "export",
  "building-2": "office-badge",
};

/** Kept on Lucide, as in the Figma Lucide category, plus icons Hala does not draw. */
const lucideKept = [
  "landmark",
  "wallet",
  "piggy-bank",
  "trending-up",
  "trending-down",
  "truck",
  "mail",
  "phone",
  "linkedin",
  "loader-circle",
];

const pascal = (kebab) => kebab.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");

for (const [from, to] of Object.entries(aliases)) {
  if (!hala[to]) throw new Error(`Alias ${from} → ${to}: no Hala icon "${to}"`);
}
for (const [from, to] of Object.entries(catalog)) {
  if (!hala[to] && !lucideKept.includes(to)) throw new Error(`Catalog ${from} → ${to}: not drawn`);
}

const lucide = {};
for (const name of lucideKept) {
  const file = path.join(root, "node_modules/lucide/dist/esm/icons", `${name}.js`);
  const src = fs.readFileSync(file, "utf8");
  const body = src.slice(src.indexOf("defaultAttributes,") + "defaultAttributes,".length, src.lastIndexOf("];"));
  lucide[name] = JSON.parse(body.replace(/(\w+):/g, '"$1":').replace(/,\s*$/, "").trim());
}

const out = `/**
 * Hala icons. Generated by icons/build.mjs from the HALA DNA Figma icon set.
 * Do not edit by hand. Load this script, then use window.halaIcons:
 *
 *   const svg = halaIcons.createElement(halaIcons.icons.Send2);
 *
 * Keys are PascalCase. Hala names (Send2), the Lucide names components
 * already use (Send, Plus, X) and Falcon names (Transfers) all work. Names Hala does not draw stay on
 * Lucide 0.453.0 (ISC). Missing names are collected in halaIcons.missing.
 */
(function (global) {
  const NS = "http://www.w3.org/2000/svg";
  const hala = ${JSON.stringify(hala)};
  const aliases = ${JSON.stringify(aliases)};
  const lucide = ${JSON.stringify(lucide)};
  const catalog = ${JSON.stringify(catalog)};
  const mirror = ${JSON.stringify(mirror)};

  const pascal = (kebab) => kebab.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  const table = {};
  for (const name of Object.keys(lucide)) table[pascal(name)] = { set: "lucide", name, children: lucide[name] };
  for (const name of Object.keys(hala)) table[pascal(name)] = { set: "hala", name, paths: hala[name] };
  for (const [from, to] of Object.entries(aliases)) table[pascal(from)] = table[pascal(to)];
  for (const [from, to] of Object.entries(catalog)) if (!table[pascal(from)]) table[pascal(from)] = table[pascal(to)];

  const missing = new Set();
  const icons = new Proxy(table, {
    get(target, key) {
      if (typeof key === "string" && !(key in target)) missing.add(key);
      return target[key];
    },
  });

  function createElement(node) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("xmlns", NS);
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.dataset.set = node.set;
    if (node.set === "hala") {
      svg.setAttribute("viewBox", "0 0 16 16");
      svg.setAttribute("fill", "currentColor");
      svg.setAttribute("stroke", "none");
      for (const [tone, rule, d] of node.paths) {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        path.setAttribute("stroke", "none");
        path.setAttribute("fill", "currentColor");
        if (rule === "e") {
          path.setAttribute("fill-rule", "evenodd");
          path.setAttribute("clip-rule", "evenodd");
        }
        if (tone === 2) {
          path.dataset.tone = "secondary";
          path.style.fill = "var(--icon-secondary, currentColor)";
        }
        svg.append(path);
      }
    } else {
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      for (const [tag, attrs] of node.children) {
        const child = document.createElementNS(NS, tag);
        for (const [key, value] of Object.entries(attrs)) child.setAttribute(key, value);
        svg.append(child);
      }
    }
    return svg;
  }

  global.halaIcons = {
    icons,
    createElement,
    missing,
    catalog: { ...catalog },
    mirror: new Set(mirror),
    names: () => Object.keys(hala),
    aliases: () => ({ ...aliases }),
    lucideKept: () => Object.keys(lucide),
  };
})(typeof window !== "undefined" ? window : globalThis);
`;

fs.writeFileSync(path.join(root, "vendor/hala-icons.js"), out);
console.log(`vendor/hala-icons.js: ${Object.keys(hala).length} Hala, ${Object.keys(aliases).length} aliases, ${lucideKept.length} Lucide kept`);
