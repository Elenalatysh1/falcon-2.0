/**
 * Falcon icon API. Lucide 0.453.0, drawn with the Hala stroke and sizes.
 * Import foundations.css, then:
 *
 *   import { icon } from "./icons/api.js";
 *   button.append(icon("transfers"));
 *   row.append(icon("search", { size: "inline" }));
 */

import { createElement, icons } from "../node_modules/lucide/dist/esm/lucide.js";

export const LUCIDE_VERSION = "0.453.0";

/** Hala name → Lucide kebab-case name. */
export const catalog = {
  dashboard: "layout-dashboard",
  home: "house",
  transactions: "arrow-left-right",
  transfers: "send",
  payroll: "calendar-days",
  cards: "credit-card",
  sadad: "receipt-text",
  pos: "smartphone",
  ecommerce: "shopping-cart",
  invoicing: "file-text",
  "food-delivery": "utensils-crossed",
  locations: "map-pin",
  users: "users",
  documents: "files",
  help: "circle-help",
  settings: "settings",
  account: "landmark",
  wallet: "wallet",
  cash: "banknote",
  savings: "piggy-bank",
  income: "arrow-down-left",
  outgoing: "arrow-up-right",
  "trend-up": "trending-up",
  "trend-down": "trending-down",
  "bar-chart": "chart-column",
  "line-chart": "chart-line",
  percent: "percent",
  refund: "undo-2",
  "qr-pay": "qr-code",
  contactless: "nfc",
  add: "plus",
  close: "x",
  confirm: "check",
  edit: "pencil",
  delete: "trash-2",
  copy: "copy",
  download: "download",
  upload: "upload",
  share: "share-2",
  filter: "list-filter",
  adjust: "sliders-horizontal",
  search: "search",
  refresh: "refresh-cw",
  more: "ellipsis",
  "open-link": "external-link",
  lock: "lock",
  unlock: "lock-open",
  verified: "shield-check",
  fingerprint: "fingerprint",
  "face-id": "scan-face",
  show: "eye",
  hide: "eye-off",
  freeze: "snowflake",
  key: "key-round",
  "sign-out": "log-out",
  success: "circle-check",
  error: "circle-x",
  warning: "triangle-alert",
  info: "info",
  pending: "clock",
  notifications: "bell",
  muted: "bell-off",
  offline: "wifi-off",
  company: "building-2",
  shop: "store",
  delivery: "truck",
  product: "package",
  tag: "tag",
  calendar: "calendar",
  camera: "camera",
  image: "image",
  attachment: "paperclip",
  email: "mail",
  phone: "phone",
  chat: "message-circle",
  language: "globe",
  support: "headset",
  gift: "gift",
  sparkles: "sparkles",
  back: "arrow-left",
  forward: "arrow-right",
  expand: "chevron-down",
  next: "chevron-right",
  previous: "chevron-left",
  collapse: "chevron-up",
  sort: "arrow-up-down",
  sidebar: "panel-left",
};

const sizes = {
  inline: "--icon-inline",
  default: "--icon-default",
  nav: "--icon-nav",
  feature: "--icon-feature",
};

/** Direction icons. CSS flips these when the page is RTL. */
const mirror = new Set([
  "arrow-left",
  "arrow-right",
  "chevron-left",
  "chevron-right",
  "send",
  "log-out",
  "undo-2",
  "panel-left",
]);

function pascal(kebab) {
  return kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function resolve(name) {
  const kebab = catalog[name] || name;
  const node = icons[pascal(kebab)];
  return node ? { kebab, node } : null;
}

/**
 * @param {string} name Hala name (`transfers`) or Lucide kebab name (`send`)
 * @param {{ size?: "inline" | "default" | "nav" | "feature", active?: boolean }} options
 * @returns {SVGElement}
 */
export function icon(name, options = {}) {
  const found = resolve(name);
  if (!found) throw new Error(`Unknown Falcon icon "${name}"`);
  const size = sizes[options.size] ? options.size : "default";
  const svg = createElement(found.node);
  svg.classList.add("hala-icon");
  svg.dataset.size = size;
  svg.dataset.icon = found.kebab;
  svg.style.width = `var(${sizes[size]})`;
  svg.style.height = `var(${sizes[size]})`;
  svg.style.strokeWidth = options.active ? "var(--icon-stroke-active)" : "var(--icon-stroke)";
  if (mirror.has(found.kebab)) svg.dataset.mirror = "true";
  if (options.active) svg.dataset.active = "true";
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

export function iconNames() {
  return Object.keys(catalog);
}
