/* How to use. Placeholder page, marked Draft. */
(function () {
  const page = document.querySelector('[data-page="how-to-use"]');
  if (!page || page.childElementCount) return;

  const tokens = `:root {
  --brand-500: #009A78;  --brand-600: #0B8F6E;
  --brand-700: #0A7559;  --brand-800: #0E7C62;
  --brand-100: #E3F6EF;  --brand-50: #F3FBF8;
  --gradient-primary: linear-gradient(90deg,#0A7559,#2C957A);
  --text-primary: #0C1F1A;  --text-secondary: #4A615A;
  --text-tertiary: #5E7770; --text-disabled: #9AACA6;
  --surface-canvas: #EEF3F1; --surface-card: #FFFFFF;
  --surface-subtle: #F4F7F6; --surface-inverse: #0C1F1A;
  --border-subtle: #EEF2F0;  --border-control: #D7E0DC;
  --radius-s: 8px; --radius-m: 12px; --radius-xl: 20px;
  --radius-2xl: 24px; --radius-pill: 999px;
  --font-sans: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --font-arabic: 'IBM Plex Sans Arabic', sans-serif;
}
[dir="rtl"] body { font-family: var(--font-arabic); }`;

  const fonts = `<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">

.num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }`;

  const iconCode = `<script src="vendor/hala-icons.js"></script>
import { icon } from './icons/api.js';

button.append(icon('transfers'));
row.append(icon('search', { size: 'inline' }));
tile.append(icon('cards', { tone: 'default' }));`;

  const rtl = `/* logical properties, never left/right */
.row   { padding-inline: 16px; margin-inline-start: 8px; }
.badge { inset-inline-end: 0; }

[dir="rtl"] .icon-dir { transform: scaleX(-1); }

<bdi dir="ltr" class="num">SA57 •• 1951</bdi>

const sar = n => (n < 0 ? '− ' : '+ ') +
  Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 });`;

  const rules = `# HALA DNA — Hala design system rules

You are building UI for Hala Business (Saudi business banking).
Follow HALA DNA exactly. If unsure, ask instead of inventing.

## Tokens
- Use CSS variables from styles/foundations.css. Never hard-code hex, px radius or shadows.
- Canvas var(--surface-canvas), cards var(--surface-card), radius var(--radius-xl) for cards.
- Primary action = var(--gradient-primary), pill radius, var(--shadow-brand). ONE per screen.

## Type
- IBM Plex Sans for UI, IBM Plex Mono for amounts, IBANs, card digits, dates and codes.
- Arabic: IBM Plex Sans Arabic, no letter-spacing.
- Money: "− 25,000.00" / "+ 86.25", "SAR" before the number, 2 decimals.

## Icons
- Hala twotone icons from HALA DNA through icons/api.js, sizes 16/20/22/28. Use the approved list.
- Icon-only buttons need an accessible name and a tooltip.

## RTL and accessibility
- Logical properties only. Mirror direction icons.
- Wrap numbers in <bdi dir="ltr">. Touch targets at least 44. Respect reduced motion.

## Saudi specifics
- Week starts Sunday. Banks closed Friday and Saturday. VAT is 15%. Times in Riyadh.
- Dates DD/MM/YYYY.`;

  const tools = [
    ["Cursor", ".cursor/rules/hala-dna-system.mdc", "---\ndescription: HALA DNA design system\nglobs: [\"**/*.tsx\",\"**/*.css\"]\nalwaysApply: true\n---\n\n"],
    ["Claude Code", "CLAUDE.md", ""],
    ["Copilot / others", ".github/copilot-instructions.md", ""],
  ];

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

  function copyControl(text) {
    const button = window.createButton
      ? window.createButton({ label: "Copy", variant: "secondary", size: "xs" })
      : el("button", "", "Copy");
    button.type = "button";
    button.classList.add("gs-copy");
    button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(text); } catch (error) { /* clipboard may be blocked */ }
      const label = button.querySelector(".button-label");
      if (label) label.textContent = "Copied";
      else button.textContent = "Copied";
      window.setTimeout(() => {
        if (label) label.textContent = "Copy";
        else button.textContent = "Copy";
      }, 1500);
    });
    return button;
  }

  function codeBlock(text, soft) {
    const wrap = el("div", "");
    wrap.style.position = "relative";
    const pre = el("pre", soft ? "gs-code gs-code-soft" : "gs-code gs-code-dark", text);
    wrap.append(pre, copyControl(text));
    return wrap;
  }

  const root = el("div", "gs");
  const hero = el("section", "gs-hero");
  hero.dataset.guide = "true";
  const inner = el("div", "gs-hero-inner");
  const brand = el("div", "gs-brand");
  const home = el("a", "gs-brand");
  home.href = "#introduction";
  const mark = el("span", "gs-mark", "H");
  home.append(mark, el("span", "gs-brand-name", "HALA DNA"), el("span", "gs-quiet", "/ How to use"));
  brand.append(home, draft(), el("span", "gs-quiet", "Guide · v2.0"));
  const title = el("h1", "", "How to use HALA DNA");
  const lede = el("p", "gs-hero-copy", "Practical setup for the three groups who build with HALA DNA: engineers writing the code, AI coding assistants like Cursor and Claude Code, and designers working in Figma. Copy the setup, then use tokens everywhere.");
  const jumps = el("div", "gs-jumps");
  [["Developers", "Tokens, fonts, icons, RTL", "#how-to-use/developers", "settings"], ["AI assistants", "Cursor, Claude Code, Copilot", "#how-to-use/assistants", "help"], ["Designers", "Figma setup, handoff, review", "#how-to-use/designers", "edit"], ["Product and content", "Copy, formats, requests", "#how-to-use/content", "documents"]].forEach(([name, copy, href, iconName]) => {
    const item = el("a", "gs-jump");
    item.href = href;
    const tile = el("span", "gs-jump-icon");
    const drawn = glyph(iconName);
    if (drawn) tile.append(drawn);
    const text = el("div", "");
    text.append(el("strong", "", name), el("span", "", copy));
    item.append(tile, text);
    jumps.append(item);
  });
  inner.append(brand, title, lede, jumps);
  hero.append(inner);

  const golden = el("section", "gs-block");
  golden.id = "how-essentials";
  golden.append(el("p", "gs-kicker", "For everyone · the 5 things that matter most"), el("h2", "", "The 5 things that matter most"));
  const goldenGrid = el("div", "gs-grid");
  [["1", "Tokens, not values", "Use brand/600, never #0B8F6E."], ["2", "One primary per screen", "The gradient button is the single next step."], ["3", "Money in Mono", "“− 25,000.00” with sign and two decimals."], ["4", "RTL from day one", "Logical properties, mirrored arrows, Arabic font."], ["5", "Every state", "Default, hover, focus, error, disabled, loading, empty."]].forEach(([number, name, copy]) => {
    const item = el("div", "gs-mini");
    item.append(el("span", "gs-principle-no", number), el("strong", "", name), el("span", "", copy));
    goldenGrid.append(item);
  });
  golden.append(goldenGrid);

  const dev = el("section", "gs-block");
  dev.id = "developers";
  dev.append(el("p", "gs-kicker", "01 · Developers"), el("h2", "", "Set up once, then use tokens everywhere"), el("p", "gs-lead", "Tokens come first. Components only reference tokens, never hex values, so a theme change or an Arabic layout needs no component changes."));
  const devPanel = el("div", "gs-panel gs-dev");
  [["1", "Add the tokens", "Paste into your global CSS. On mobile, mirror the same names in the theme file.", "styles/foundations.css", tokens], ["2", "Load the fonts", "Three families. Use Mono with tabular numbers for anything people compare or copy.", "index.html", fonts], ["3", "Wrap the icons", "Hala icons with HALA DNA names. Only use icons from the approved set on the Icons page.", "icons/api.js", iconCode], ["4", "Support Arabic and money formats", "Logical CSS properties, flipped direction icons, and one shared money formatter.", "styles/rtl.css", rtl]].forEach(([number, name, copy, file, code]) => {
    const step = el("div", "");
    const head = el("div", "gs-step-head");
    head.append(el("span", "gs-num", number), el("h3", "", name));
    step.append(head, el("p", "gs-lead", copy), el("span", "gs-file", file), codeBlock(code));
    devPanel.append(step);
  });
  const side = el("div", "gs-pair");
  const checks = ["Uses tokens only, no raw hex or px", "Hover, focus-visible, active, disabled states", "Error and empty states with clear copy", "Loading uses skeletons, not spinners on content", "Keyboard: Tab order, Enter and Space, Esc closes", "Touch targets at least 44 on mobile", "Works in RTL with Arabic text", "Respects reduced motion"];
  const checkCard = el("div", "gs-panel gs-check");
  const checkHead = el("div", "gs-spread");
  const sum = el("span", "gs-sum", `0 of ${checks.length} done`);
  checkHead.append(el("h3", "", "Component checklist"), sum);
  checkCard.append(checkHead);
  let done = 0;
  checks.forEach((text) => {
    const row = el("button", "gs-check-row");
    row.type = "button";
    row.dataset.on = "false";
    const box = el("span", "gs-box", "");
    const label = el("span", "", text);
    row.append(box, label);
    row.addEventListener("click", () => {
      const on = row.dataset.on !== "true";
      row.dataset.on = on ? "true" : "false";
      box.textContent = on ? "✓" : "";
      done += on ? 1 : -1;
      sum.textContent = `${done} of ${checks.length} done`;
    });
    checkCard.append(row);
  });
  const map = el("div", "gs-panel gs-map");
  map.append(el("h3", "", "Platform mapping"));
  [["Web", "Angular and CSS variables from foundations.css. Hala icons."], ["iOS", "SwiftUI. The same token names as Color and Font extensions. Sheets for overlays."], ["Android", "Jetpack Compose. The same token names in a HALA DNA theme. Sheets for overlays."], ["Email / PDF", "Inline styles with the same values. Plex with a system fallback."]].forEach(([name, copy]) => {
    const row = el("div", "gs-map-row");
    row.append(el("b", "", name), el("span", "", copy));
    map.append(row);
  });
  side.append(checkCard, map);
  dev.append(devPanel, side);

  const ai = el("section", "gs-block");
  ai.id = "assistants";
  ai.append(el("p", "gs-kicker", "02 · AI assistants"), el("h2", "", "Teach Cursor and Claude Code the system"), el("p", "gs-lead", "AI tools follow the rules you give them. Put the HALA DNA rules file in the repo, link the token file, and ask for one component at a time. Then review the result against the checklist."));
  const rulesCard = el("div", "gs-panel gs-card");
  const rulesHead = el("div", "gs-spread");
  rulesHead.append(el("h3", "", "Rules file"));
  const switcher = el("div", "gs-switch");
  const path = el("span", "gs-file", tools[0][1]);
  const rulesHost = el("div", "");
  function showTool(index) {
    [...switcher.children].forEach((child, childIndex) => {
      child.dataset.on = childIndex === index ? "true" : "false";
      child.dataset.variant = childIndex === index ? "secondary" : "ghost";
    });
    path.textContent = tools[index][1];
    rulesHost.replaceChildren(codeBlock(`${tools[index][2]}${rules}`));
  }
  tools.forEach(([label], index) => {
    const button = window.createButton
      ? window.createButton({ label, variant: index === 0 ? "secondary" : "ghost", size: "sm" })
      : el("button", "", label);
    button.type = "button";
    button.dataset.on = index === 0 ? "true" : "false";
    button.addEventListener("click", () => showTool(index));
    switcher.append(button);
  });
  rulesHead.append(switcher);
  rulesCard.append(rulesHead, path);
  showTool(0);
  rulesCard.append(rulesHost);

  const prompts = el("div", "gs-pair");
  const promptCard = el("div", "gs-panel gs-card");
  promptCard.append(el("h3", "", "Prompt templates"));
  [["Build a component", "Build a TransferAmountInput using HALA DNA.\nRead the HALA DNA rules and styles/foundations.css.\nInclude default, focus, filled, error (“Amount is above your daily limit”), and disabled.\nAmount in Mono, SAR prefix, RTL support."], ["Build a screen", "Build the “Order POS terminals” step 1 screen, web.\nUse HALA DNA components only: selection cards, a live order summary with VAT 15%, one primary button.\nNo new colors."], ["Review my code", "Review this file against HALA DNA.\nList hard-coded values, missing states, RTL issues, accessibility issues, and more than one primary button."], ["Mobile version", "Convert this web table to the HALA DNA mobile pattern:\nlist rows, amount and status on the right, 64 pt rows, 16 pt margins."]].forEach(([name, text]) => {
    const item = el("div", "gs-prompt");
    const head = el("header", "");
    const button = window.createButton
      ? window.createButton({ label: "Copy", variant: "secondary", size: "xs" })
      : el("button", "", "Copy");
    button.type = "button";
    button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(text); } catch (error) { /* ignore */ }
      const label = button.querySelector(".button-label");
      if (label) label.textContent = "Copied";
      window.setTimeout(() => { if (label) label.textContent = "Copy"; }, 1500);
    });
    head.append(el("strong", "", name), button);
    item.append(head, el("p", "", text));
    promptCard.append(item);
  });
  const aside = el("div", "");
  aside.style.display = "flex";
  aside.style.flexDirection = "column";
  aside.style.gap = "var(--space-3)";
  const context = el("div", "gs-panel gs-card");
  context.append(el("h3", "", "Give the AI this context"));
  [["@rules", "hala-dna-system.mdc or CLAUDE.md, always on"], ["@tokens", "styles/foundations.css"], ["@component", "An existing HALA DNA component as an example"], ["@screenshot", "The HALA DNA page for that component"], ["@data", "Real field names and sample values"]].forEach(([name, copy]) => {
    const row = el("div", "gs-line");
    row.append(el("strong", "gs-ok", name), el("span", "", copy));
    context.append(row);
  });
  const review = el("div", "gs-panel gs-card");
  review.append(el("h3", "", "Review AI output for"));
  ["Hard-coded colors or sizes instead of tokens", "Two gradient buttons on one screen", "Amounts not in Mono or missing decimals", "left / right instead of logical properties", "Missing focus, disabled or error states", "Invented icons or icons outside the approved set"].forEach((text) => {
    const row = el("div", "gs-line");
    row.append(el("span", "gs-bang", "!"), el("span", "", text));
    review.append(row);
  });
  aside.append(context, review);
  prompts.append(promptCard, aside);
  ai.append(rulesCard, prompts);

  const design = el("section", "gs-block");
  design.id = "designers";
  design.append(el("p", "gs-kicker", "03 · Designers"), el("h2", "", "Work in Figma the way the code works"), el("p", "gs-lead", "Use Figma variables with the same names as the code tokens, and components with the same properties, so handoff is mostly a name check."));
  const designGrid = el("div", "gs-three");
  const setup = el("div", "gs-panel gs-card");
  setup.append(el("h3", "", "Library setup"));
  [["Enable the library", "Turn on HALA DNA in Assets. Don't detach components."], ["Use variables", "Colors, radius and spacing as variables with code names (brand/600, radius/xl)."], ["Use text styles", "The same names as the type scale."], ["Set modes", "Light, plus an Arabic mode that swaps the font and mirrors auto layout."], ["Start from templates", "Web page with sidebar, mobile screen with tab bar, modal, drawer, sheet."]].forEach(([name, copy], index) => {
    const row = el("div", "gs-line");
    row.append(el("span", "gs-num", String(index + 1)), el("div", ""));
    row.lastChild.append(el("strong", "", name), el("span", "", copy));
    setup.append(row);
  });
  const tree = el("div", "gs-panel gs-card");
  tree.append(el("h3", "", "File structure"), el("pre", "gs-code gs-code-soft gs-tree", "HALA DNA (library)\n├─ 00 Cover\n├─ 01 Foundations\n├─ 02 Icons\n├─ 03 Components\n├─ 04 Patterns\n└─ 05 Templates\n\nProduct file\n├─ Ready for dev\n├─ In review\n└─ Exploration"), el("span", "gs-note", "Component names match code: Button, Input, Overlay."));
  const handoff = el("div", "gs-panel gs-card");
  handoff.append(el("h3", "", "Handoff checklist"));
  ["Every state designed, including empty, error and loading", "Web and mobile frames, or a note saying why not", "Arabic frame for any new layout", "Only library components and variables", "Real copy, real amounts with SAR and decimals", "Interactions noted: what opens, what closes, what animates", "Edge cases: long names, 0 results, limit reached", "Linked to the ticket"].forEach((text) => {
    const row = el("div", "gs-line");
    row.append(el("span", "gs-num", "✓"), el("span", "", text));
    handoff.append(row);
  });
  designGrid.append(setup, tree, handoff);
  const flow = el("div", "gs-panel gs-card");
  flow.append(el("h3", "", "When to make something new"));
  const flowGrid = el("div", "gs-grid");
  [["1", "Reuse", "An existing component covers it. Use it as is.", ""], ["2", "Configure", "Same component, different props or content.", ""], ["3", "Compose", "Combine components following Patterns.", "info"], ["4", "Propose", "Truly new: share the use case with the design team before building.", "warning"]].forEach(([number, name, copy, tone]) => {
    const item = el("div", "gs-flow");
    if (tone) item.dataset.tone = tone;
    item.append(el("span", "gs-principle-no", number), el("b", "", name), el("span", "", copy));
    flowGrid.append(item);
  });
  flow.append(flowGrid);
  design.append(designGrid, flow);

  const content = el("section", "gs-block");
  content.id = "content";
  content.append(el("p", "gs-kicker", "04 · Product and content"), el("h2", "", "Words and formats"));
  const tables = el("div", "gs-pair");
  const formats = el("div", "gs-panel gs-card");
  [["Money", "SAR 25,000.00", "25000 SR"], ["Signed amount", "− 1,249.00", "-1249"], ["Date", "14/10/2026", "10/14/2026"], ["Relative date", "Today, 12:41", "14 Oct 2026 12:41:07"], ["Time", "04:00 PM", "16:00:00"], ["IBAN", "SA57 •• 1951", "SA5700000000001951"], ["Card", "•• 4417", "XXXX-XXXX-XXXX-4417"]].forEach(([name, ok, no]) => {
    const row = el("div", "gs-table");
    row.append(el("b", "", name), el("span", "gs-ok", ok), el("span", "gs-no", no));
    formats.append(row);
  });
  const words = el("div", "gs-panel gs-card");
  [["Buttons are verbs", "Send SAR 25,000", "OK"], ["Errors say how to fix", "Saudi IBANs have 24 characters", "Invalid input"], ["Say what happens next", "Arrives next business day", "Success!"], ["Sentence case", "Add beneficiary", "Add Beneficiary"], ["Use names, not IDs", "Freeze Marketing card?", "Freeze card #2086?"], ["No blame", "We couldn't reach the bank", "You entered wrong data"]].forEach(([name, ok, no]) => {
    const row = el("div", "gs-news");
    const text = el("div", "");
    text.append(el("strong", "", name));
    const pair = el("div", "gs-line");
    pair.append(el("span", "gs-ok", `✓ ${ok}`), el("span", "gs-no", `× ${no}`));
    text.append(pair);
    row.append(text);
    words.append(row);
  });
  tables.append(formats, words);
  content.append(tables);

  const ask = el("section", "gs-block");
  const band = el("div", "gs-ask");
  const askCopy = el("div", "");
  askCopy.append(el("h2", "", "Need something HALA DNA doesn't have?"), el("p", "", "Check Patterns first. If it's still missing, share the use case, a screenshot and which platforms need it with the design team. New components ship with every state, on web and mobile."));
  const back = window.createButton
    ? window.createButton({ label: "Back to HALA DNA", variant: "primary", size: "md" })
    : el("a", "", "Back to HALA DNA");
  back.addEventListener("click", () => { location.hash = "#introduction"; });
  band.append(askCopy, back);
  ask.append(band);

  root.append(hero, golden, dev, ai, design, content, ask);
  page.append(root);
})();
