/**
 * Falcon icon API. Hala icons from the HALA DNA Figma set, twotone and filled.
 * A few names Hala does not draw stay on Lucide 0.453.0 (ISC).
 * Import foundations.css, then:
 *
 *   import { icon } from "./icons/api.js";
 *   button.append(icon("transfers"));
 *   row.append(icon("search", { size: "inline" }));
 *   tile.append(icon("cards", { tone: "default" }));
 */

import "../vendor/hala-icons.js";

const { icons, createElement, mirror } = globalThis.halaIcons;

/** Falcon name → Hala icon name (or a kept Lucide name). */
export const catalog = globalThis.halaIcons.catalog;

const sizes = {
  inline: "--icon-inline",
  default: "--icon-default",
  nav: "--icon-nav",
  feature: "--icon-feature",
};

const tones = new Set(["default", "secondary"]);

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
 * @param {string} name Falcon name (`transfers`) or Hala name (`send-2`)
 * @param {{ size?: "inline" | "default" | "nav" | "feature", active?: boolean, tone?: "default" | "secondary" }} options
 *   tone shows the two Hala tones. Without it, both tones use currentColor.
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
  if (tones.has(options.tone)) svg.dataset.tone = options.tone;
  if (mirror.has(found.kebab)) svg.dataset.mirror = "true";
  if (options.active) svg.dataset.active = "true";
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

export function iconNames() {
  return Object.keys(catalog);
}
