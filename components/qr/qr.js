/**
 * Falcon QR & links: QR code, Scan to pay, Link chip, Payment link card, Link preview.
 * Load vendor/hala-icons.js, lists.js (createAmount), button.js and encode.js first.
 *
 * createQrCode({ data, size, logo, light })
 *   size "s" | "m" | "l". logo punches a quiet pad for the Hala mark. light uses --qr-*-light for POS.
 * createScanToPay({ title, merchant, amount, link, lang, light })
 * createLinkChip({ domain, slug, showCopy, lang })
 * createPaymentLinkCard({ merchant, expiry, domain, slug, amount, initials, tone, lang, onShare, onShowQr })
 * createLinkPreview({ title, amount, lang })  Always ink on white type — not themed.
 *
 * Encode only the short URL. Amounts and the URL stay left to right in Arabic.
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const SAMPLE = "https://hala.link/albaik-64";
  const MARK = "../media/type=short, color=brand.svg";
  const WORDMARK = "../media/type=full, color=brand.svg";

  const COPY = {
    en: {
      scan: "Scan to pay",
      merchant: "Al Baik · Olaya",
      pay: "Pay Al Baik · Olaya",
      expiry: "Expires in 24h",
      share: "Share link",
      showQr: "Show QR",
      copied: "Link copied",
      copy: "Copy link",
      hideQr: "Hide QR",
    },
    ar: {
      scan: "امسح للدفع",
      merchant: "البيك · العليا",
      pay: "ادفع للبيك · العليا",
      expiry: "ينتهي خلال 24 ساعة",
      share: "مشاركة الرابط",
      showQr: "عرض رمز QR",
      copied: "تم نسخ الرابط",
      copy: "نسخ الرابط",
      hideQr: "إخفاء الرمز",
    },
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) text !== "" && (node.textContent = text);
    return node;
  }

  function svgEl(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size) {
    const set = window.halaIcons;
    if (!set || !name) return null;
    const kebab = (set.catalog && set.catalog[name]) || name;
    const node = set.icons[pascal(kebab)];
    if (!node) return null;
    const svg = set.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    if (size) svg.dataset.size = size;
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function token(name, fallback) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : fallback;
  }

  function href(domain, slug, data) {
    if (data) return data;
    if (domain && slug) return `https://${domain}/${slug}`;
    return SAMPLE;
  }

  function parseLink(data) {
    try {
      const url = new URL(data || SAMPLE);
      return { domain: url.host, slug: url.pathname.replace(/^\//, "") };
    } catch {
      return { domain: "hala.link", slug: "albaik-64" };
    }
  }

  function toast(message) {
    if (!window.createFeedback) return;
    const host = document.querySelector("[data-qr-toast]") || document.body;
    const note = createFeedback({ kind: "toast", tone: "success", title: message, dismissible: true });
    host.replaceChildren(note);
    window.setTimeout(() => { if (note.parentNode === host) note.remove(); }, 2400);
  }

  function copyText(text, lang) {
    const message = COPY[lang === "ar" ? "ar" : "en"].copied;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast(message), () => toast(message));
      return;
    }
    toast(message);
  }

  function isFinder(row, col, n) {
    const box = (x, y) => row >= y && row < y + 7 && col >= x && col < x + 7;
    return box(0, 0) || box(n - 7, 0) || box(0, n - 7);
  }

  function drawQr(modules, logo) {
    const n = modules.length;
    const svg = svgEl("svg", { viewBox: `0 0 ${n} ${n}`, fill: "none" });
    svg.setAttribute("role", "img");
    const dot = (token("--qr-dot", 0.84) / 2);
    const padRatio = token("--qr-logo", 0.26);
    const radiusRatio = token("--qr-logo-radius", 0.28);
    const markRatio = token("--qr-logo-mark", 0.8);
    const pad = n * padRatio;
    const padX = (n - pad) / 2;
    const mark = pad * markRatio;
    const markX = (n - mark) / 2;
    function inPad(row, col) {
      if (!logo) return false;
      const x = col + 0.5;
      const y = row + 0.5;
      return x >= padX && x <= padX + pad && y >= padX && y <= padX + pad;
    }
    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        if (!modules[row][col] || isFinder(row, col, n) || inPad(row, col)) continue;
        svg.append(svgEl("circle", { class: "qr-dot", cx: col + 0.5, cy: row + 0.5, r: dot }));
      }
    }
    const outer = token("--qr-eye-outer", 1.8);
    const hole = token("--qr-eye-hole", 1);
    const inner = token("--qr-eye-inner", 0.9);
    function finder(x, y) {
      svg.append(
        svgEl("rect", { class: "qr-eye", x, y, width: 7, height: 7, rx: outer, ry: outer }),
        svgEl("rect", { class: "qr-eye-hole", x: x + 1, y: y + 1, width: 5, height: 5, rx: hole, ry: hole }),
        svgEl("rect", { class: "qr-eye-centre", x: x + 2, y: y + 2, width: 3, height: 3, rx: inner, ry: inner }),
      );
    }
    finder(0, 0);
    finder(n - 7, 0);
    finder(0, n - 7);
    if (logo) {
      svg.append(svgEl("rect", {
        class: "qr-logo-pad",
        x: padX,
        y: padX,
        width: pad,
        height: pad,
        rx: pad * radiusRatio,
        ry: pad * radiusRatio,
      }));
      const image = svgEl("image", { href: MARK, x: markX, y: markX, width: mark, height: mark, preserveAspectRatio: "xMidYMid meet" });
      svg.append(image);
    }
    return svg;
  }

  function createQrCode(options = {}) {
    const size = options.size === "s" || options.size === "l" ? options.size : "m";
    const data = options.data || SAMPLE;
    const logo = options.logo !== false;
    const encoded = window.encodeQr ? encodeQr(data) : { modules: [] };
    const root = el("div", "qr-code");
    root.dataset.size = size;
    if (options.light) root.dataset.light = "true";
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", `QR code for ${data}`);
    if (encoded.modules && encoded.modules.length) root.append(drawQr(encoded.modules, logo));
    root.dataset.version = String(encoded.version || "");
    return root;
  }

  function createScanToPay(options = {}) {
    const ar = options.lang === "ar";
    const copy = COPY[ar ? "ar" : "en"];
    const link = options.link || parseLink(options.data);
    const data = href(link.domain, link.slug, options.data);
    const root = el("article", "qr-scan");
    root.lang = ar ? "ar" : "en";
    root.dir = ar ? "rtl" : "ltr";
    const wordmark = el("img", "qr-wordmark");
    wordmark.src = WORDMARK;
    wordmark.alt = "Hala";
    const title = el("h2", "qr-scan-title", options.title || copy.scan);
    const merchant = el("p", "qr-scan-merchant", options.merchant || copy.merchant);
    const amount = window.createAmount
      ? createAmount(options.amount == null ? 64 : options.amount, { size: "l" })
      : el("p", "", "64.00");
    const code = createQrCode({ data, size: "m", logo: true, light: options.light });
    code.dataset.bordered = "true";
    const url = el("p", "qr-link", `${link.domain}/${link.slug}`);
    url.dir = "ltr";
    root.append(wordmark, title, merchant, amount, code, url);
    return root;
  }

  function createLinkChip(options = {}) {
    const ar = options.lang === "ar";
    const copy = COPY[ar ? "ar" : "en"];
    const domain = options.domain || "hala.link";
    const slug = options.slug || "albaik-64";
    const data = href(domain, slug, options.data);
    const showCopy = options.showCopy !== false;
    const root = el("button", "qr-chip");
    root.type = "button";
    root.lang = ar ? "ar" : "en";
    root.dir = ar ? "rtl" : "ltr";
    root.setAttribute("aria-label", `${copy.copy} ${domain}/${slug}`);
    const mark = el("img", "qr-chip-mark");
    mark.src = MARK;
    mark.alt = "";
    const text = el("span", "qr-chip-text");
    text.dir = "ltr";
    text.append(el("span", "qr-chip-domain", `${domain}/`), el("span", "qr-chip-slug", slug));
    root.append(mark, text);
    if (showCopy) {
      const glyph = icon("copy") || icon("link-2");
      if (glyph) root.append(glyph);
    }
    root.addEventListener("click", () => copyText(data, ar ? "ar" : "en"));
    return root;
  }

  function createPaymentLinkCard(options = {}) {
    const ar = options.lang === "ar";
    const copy = COPY[ar ? "ar" : "en"];
    const domain = options.domain || "hala.link";
    const slug = options.slug || "albaik-64";
    const data = href(domain, slug, options.data);
    const root = el("article", "qr-card");
    root.lang = ar ? "ar" : "en";
    root.dir = ar ? "rtl" : "ltr";
    const head = el("div", "qr-card-head");
    const avatar = el("span", "qr-card-avatar", options.initials || "AB");
    avatar.dataset.tone = String(options.tone || 1);
    avatar.setAttribute("aria-hidden", "true");
    const who = el("div", "qr-card-who");
    who.append(
      el("strong", "qr-card-merchant", options.merchant || copy.merchant),
      el("span", "qr-card-expiry", options.expiry || copy.expiry),
    );
    const amount = window.createAmount
      ? createAmount(options.amount == null ? 64 : options.amount, { size: "m" })
      : el("span", "", "64.00");
    head.append(avatar, who, amount);
    const field = el("div", "qr-card-link");
    const lead = icon("link-2");
    if (lead) field.append(lead);
    const url = el("span", "qr-link", `${domain}/${slug}`);
    url.dir = "ltr";
    field.append(url);
    const copyBtn = window.createButton
      ? createButton({ variant: "ghost", size: "sm", icon: "copy", iconOnly: true, ariaLabel: copy.copy })
      : el("button", "qr-icon-btn", copy.copy);
    if (!window.createButton) copyBtn.type = "button";
    copyBtn.addEventListener("click", () => copyText(data, ar ? "ar" : "en"));
    field.append(copyBtn);
    const actions = el("div", "qr-card-actions");
    const share = window.createButton
      ? createButton({ label: copy.share, variant: "primary", size: "md" })
      : el("button", "", copy.share);
    const show = window.createButton
      ? createButton({ label: copy.showQr, variant: "secondary", size: "md" })
      : el("button", "", copy.showQr);
    const shareIcon = icon("share");
    if (shareIcon) share.prepend(shareIcon);
    const qrIcon = icon("qr-pay");
    if (qrIcon) show.prepend(qrIcon);
    share.addEventListener("click", () => {
      if (options.onShare) options.onShare(data, root);
      else copyText(data, ar ? "ar" : "en");
    });
    show.addEventListener("click", () => {
      if (options.onShowQr) {
        options.onShowQr(data, root);
        return;
      }
      const open = root.querySelector(".qr-card-pop");
      if (open) {
        open.remove();
        show.querySelector(".button-label") && (show.querySelector(".button-label").textContent = copy.showQr);
        return;
      }
      const pop = el("div", "qr-card-pop");
      pop.append(createQrCode({ data, size: "m", logo: true }));
      root.append(pop);
      show.querySelector(".button-label") && (show.querySelector(".button-label").textContent = copy.hideQr);
    });
    actions.append(share, show);
    root.append(head, field, actions);
    return root;
  }

  function createLinkPreview(options = {}) {
    const ar = options.lang === "ar";
    const copy = COPY[ar ? "ar" : "en"];
    const root = el("article", "qr-preview");
    root.lang = ar ? "ar" : "en";
    root.dir = ar ? "rtl" : "ltr";
    const mark = el("img", "qr-preview-mark");
    mark.src = MARK;
    mark.alt = "Hala";
    const title = el("h2", "qr-preview-title", options.title || copy.pay);
    const amount = window.createAmount
      ? createAmount(options.amount == null ? 64 : options.amount, { size: "l" })
      : el("p", "", "64.00");
    root.append(mark, title, amount);
    return root;
  }

  window.createQrCode = createQrCode;
  window.createScanToPay = createScanToPay;
  window.createLinkChip = createLinkChip;
  window.createPaymentLinkCard = createPaymentLinkCard;
  window.createLinkPreview = createLinkPreview;
})();
