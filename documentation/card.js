(function () {
  const page = document.querySelector('[data-page="card"]');
  if (!page || !window.createButton || !window.createBadge || !window.createInput || !window.createButtonGroup) return;

  const art = {
    green: "../media/hala-purchase-card.svg",
    ink: "../media/hala-card-ink.svg",
    lime: "../media/hala-card-lime.svg",
  };
  const designs = [
    ["Purchase · Digital", "Visa Business", art.green],
    ["Purchase · Physical", "Visa Platinum", art.ink],
    ["Cash · Digital", "mada", art.lime],
  ];
  const madaBins = ["588845", "440647", "446404", "457865", "968208", "636120", "417633", "468540", "529415", "543357"];
  const store = { rev: false, auth: false, revAt: 0, copied: "", lang: "en", pan: "" };
  let copyTimer;
  let authTimer;
  let panInput;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-bc="${name}"]`);
  }

  function icon(name) {
    const iconSet = window.halaIcons;
    const map = {
      confirm: "check",
      error: "x",
      close: "x",
      freeze: "snowflake",
      lock: "lock",
      key: "key-round",
      pending: "clock",
      delivery: "truck",
      refresh: "refresh-cw",
      copy: "copy",
      "face-id": "scan-face",
    };
    const kebab = map[name] || name;
    const pascal = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    if (!iconSet || !iconSet.icons[pascal]) return null;
    const svg = iconSet.createElement(iconSet.icons[pascal]);
    svg.classList.add("hala-icon");
    svg.dataset.size = "inline";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function button(options, onClick) {
    const node = createButton(options);
    if (onClick) node.addEventListener("click", onClick);
    return node;
  }

  function image(src, alt) {
    const node = el("img", "bcard-art");
    node.src = src;
    node.alt = alt || "";
    return node;
  }

  function luhn(value) {
    let sum = 0;
    let alt = false;
    for (let i = value.length - 1; i >= 0; i -= 1) {
      let digit = Number(value[i]);
      if (alt) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function complete(base) {
    for (let digit = 0; digit < 10; digit += 1) {
      const next = base + digit;
      if (luhn(next)) return next;
    }
    return `${base}0`;
  }

  function revealed() {
    return store.rev && Date.now() - store.revAt < 60000;
  }

  function left() {
    return Math.max(0, 60 - Math.floor((Date.now() - store.revAt) / 1000));
  }

  function paintAnatomy() {
    const root = mount("anatomy");
    const stage = el("div", "bcard-stage");
    stage.append(image(art.green, "Hala Purchase Card, Visa Business"));
    [["1", "101%", "6%"], ["2", "101%", "24%"], ["3", "93%", "72%"], ["4", "3%", "12%"], ["5", "3%", "82%"]].forEach(([n, x, y]) => {
      const pin = el("span", "bcard-pin", n);
      pin.dataset.float = "true";
      pin.style.left = x;
      pin.style.top = y;
      stage.append(pin);
    });
    const list = el("div");
    [
      ["1", "Hala logo", "Top-right. Neon green on dark green, silver on ink, ink on lime."],
      ["2", "Product name", "“Purchase card” or “Cash card” under the logo, in the logo color."],
      ["3", "Network mark", "Official file, bottom-right: Visa with the tier, or mada."],
      ["4", "Card type", "“Digital Card” or “Physical Card”, top-left, in white."],
      ["5", "Empty zone", "Bottom-left stays clear. The H pattern stays low-contrast behind everything."],
    ].forEach(([n, key, value]) => {
      const row = el("div", "bcard-line");
      row.append(el("span", "bcard-pin", n), el("strong", "", key), el("span", "bcard-quiet", value));
      list.append(row);
    });
    const grid = el("div", "bcard-split");
    grid.append(stage, list);
    const allowed = el("div", "card bcard-stack");
    allowed.append(el("span", "bcard-kicker", "Allowed on the art"));
    ["Hala logo and card design", "Network mark (mada, Visa, Mastercard)", "Product label: Business, Debit, Corporate", "Last 4 digits", "Contactless icon, optional"].forEach((item) => {
      const row = el("span", "bcard-check", item);
      const glyph = icon("confirm");
      if (glyph) row.prepend(glyph);
      allowed.append(row);
    });
    const banned = el("div", "card bcard-stack");
    banned.append(el("span", "bcard-kicker", "Never shown on the art"));
    banned.querySelector(".bcard-kicker").dataset.tone = "error";
    const chips = el("div", "bcard-never");
    ["Cardholder name", "Full card number", "BIN", "Expiry date", "CVV / CVC", "Chip", "Magnetic stripe", "Hologram", "Signature panel", "Fake embossing"].forEach((label) => {
      chips.append(createBadge({ label, tone: "error", size: "sm" }));
    });
    banned.append(chips, el("span", "bcard-quiet", "Visa bans the name, full number and expiry, real or placeholder, plus the chip and hologram. Mastercard also removes the CVC, signature panel and stripe."));
    const pair = el("div", "bcard-pair");
    pair.append(allowed, banned);
    root.append(grid, pair);
  }

  function paintKinds() {
    const root = mount("kinds");
    [
      ["Submitted card art", "Strict · reviewed", "warning", true, [
        ["For", "Apple Pay, Google Pay, Visa and Mastercard review."],
        ["File", "1536 × 969 px PNG, landscape."],
        ["Corners", "Square. The wallet rounds them."],
        ["Style", "Flat. No shading, 3D, emboss or photos."],
      ]],
      ["In-app card", "Same rules · more freedom", "settled", false, [
        ["For", "Cards tab, card details, payment pickers."],
        ["Match", "Must look like the wallet card people see at checkout."],
        ["Corners", "Radius token: 16 on a list, 20 on a hero."],
        ["Extras", "Name, nickname, limits and actions go outside the card."],
      ]],
    ].forEach(([title, tag, tone, flat, points]) => {
      const card = el("div", "card bcard-kind");
      const head = el("div", "bcard-head");
      head.append(el("strong", "", title), createBadge({ label: tag, tone, size: "sm" }));
      const preview = el("div", "bcard-preview");
      preview.dataset.flat = flat ? "true" : "false";
      const picture = image(art.lime, "Hala Cash Card");
      picture.dataset.flat = flat ? "true" : "false";
      preview.append(picture);
      card.append(head, preview);
      points.forEach(([key, value]) => {
        const row = el("div", "bcard-spec");
        row.append(el("strong", "", key), el("span", "bcard-quiet", value));
        card.append(row);
      });
      root.append(card);
    });
  }

  function paintDesigns() {
    const root = mount("designs");
    designs.forEach(([name, use, src]) => {
      const card = el("div", "bcard-design");
      card.append(image(src, name));
      const row = el("div", "bcard-head");
      row.append(el("strong", "", name), el("span", "bcard-mono bcard-quiet", use));
      card.append(row);
      root.append(card);
    });
    const rules = mount("marks");
    [
      ["Position", "Top-right, or top-left. Visible when cards stack. Never bottom-left."],
      ["Color", "Full color on screen. No grayscale, recolor or redraw. Official files only."],
      ["Clear space", "mada: one third of the logo width. Mastercard: one quarter of one circle's width."],
      ["Minimum", "mada 60 px wide. Mastercard 36 px generic, 54 px for a replica."],
      ["Co-badge", "mada plus a network: confirm the layout with Saudi Payments or the processor."],
      ["Contrast", "Neutral background behind cards. The mint-gray canvas works."],
    ].forEach(([key, value]) => {
      const item = el("div", "bcard-stack");
      item.append(el("span", "bcard-kicker", key), el("span", "", value));
      rules.append(item);
    });
  }

  function paintStates() {
    const root = mount("states");
    const rows = [
      ["Pending activation", "Arrived or created. Needs an OTP and a PIN.", "key", "warning", "Activate card", "pending", art.green],
      ["Active", "Ready to use. No badge needed in lists.", "confirm", "success", "Freeze", "", art.ink],
      ["Frozen", "Temporarily blocked by the holder or an admin.", "freeze", "info", "Unfreeze", "frozen", art.lime],
      ["Locked", "Three wrong PINs. Unlock in the app.", "lock", "error", "Reset PIN", "locked", art.green],
      ["Shipped", "Physical card on the way. Track delivery.", "delivery", "info", "Track", "shipped", art.ink],
      ["Expired", "Past expiry. A replacement is ordered automatically.", "pending", "neutral", "See new card", "expired", art.lime],
      ["Cancelled", "Permanently closed. Kept 90 days in history.", "close", "neutral", "Remove from list", "cancelled", art.green],
      ["Replaced", "Lost or damaged. The new card has new digits.", "refresh", "neutral", "Go to new card", "replaced", art.ink],
    ];
    rows.forEach(([name, copy, glyph, tone, cta, veil, src]) => {
      const card = el("div", "bcard-state");
      const frame = el("div", "bcard-frame");
      const picture = el("img");
      picture.src = src;
      picture.alt = "";
      frame.append(picture);
      if (veil) {
        const cover = el("div", "bcard-veil");
        cover.dataset.tone = veil;
        frame.append(cover);
      }
      const pill = el("span", "bcard-status", name);
      pill.dataset.tone = tone;
      const mark = icon(glyph);
      if (mark) pill.prepend(mark);
      frame.append(pill);
      const text = el("div", "bcard-stack");
      text.append(el("strong", "", name), el("span", "bcard-quiet", copy), el("span", "bcard-cta", cta));
      card.append(frame, text);
      root.append(card);
    });
  }

  function secret(id, label, full, mask) {
    const on = revealed();
    const copied = store.copied === id;
    const row = el("div", "bcard-field");
    row.append(el("span", "bcard-key", label), el("span", "bcard-value", on ? full : mask));
    if (on) {
      row.append(button({
        label: copied ? "Copied" : "Copy",
        icon: "copy",
        variant: "secondary",
        size: "sm",
        ariaLabel: `Copy ${label}`,
      }, () => copyField(id, full.replace(/\s|\//g, ""))));
    }
    return row;
  }

  function copyField(id, value) {
    if (navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {});
    store.copied = id;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      store.copied = "";
      paintReveal();
    }, 1400);
    paintReveal();
  }

  function showDetails() {
    if (revealed()) {
      store.rev = false;
      store.auth = false;
      paintReveal();
      return;
    }
    store.auth = true;
    paintReveal();
    clearTimeout(authTimer);
    authTimer = setTimeout(() => {
      store.auth = false;
      store.rev = true;
      store.revAt = Date.now();
      paintReveal();
    }, 1100);
  }

  function paintReveal() {
    if (store.rev && !revealed()) store.rev = false;
    const on = revealed();
    const fields = [
      ["pan", "Card number", "4716 2210 8093 7731", "•••• •••• •••• 7731"],
      ["exp", "Expiry", "09 / 29", "•• / ••"],
      ["cvv", "CVV", "418", "•••"],
    ];
    const web = mount("reveal-fields");
    const mobile = mount("reveal-mobile");
    web.replaceChildren();
    mobile.replaceChildren();
    fields.forEach((row) => {
      web.append(secret(...row));
      mobile.append(secret(...row));
    });
    const auth = page.querySelectorAll(".bcard-auth");
    auth.forEach((node) => { node.hidden = !store.auth; });
    const msg = mount("reveal-msg");
    msg.textContent = on ? `Hides in ${left()} s. Only you can see this.` : "Details are hidden. Face ID or PIN to reveal.";
    msg.dataset.tone = on ? "success" : "";
    const timer = mount("reveal-timer");
    timer.hidden = !on;
    if (on) timer.style.setProperty("--pct", `${(left() / 60) * 100}%`);
    const label = mount("reveal-toggle").querySelector(".button-label");
    if (label) label.textContent = on ? "Hide details" : "Show details";
    const mobileLabel = mount("reveal-mobile-toggle").querySelector(".button-label");
    if (mobileLabel) mobileLabel.textContent = on ? `Hide · ${left()} s` : "Show details with Face ID";
    mount("reveal-mobile-toggle").dataset.variant = on ? "secondary" : "primary";
  }

  function paintSizes() {
    const root = mount("sizes");
    [
      ["hero", "Hero", "100% · min 280", "Card details screen, full width."],
      ["selector", "Selector", "220 px", "Choosing a card in a payment flow."],
      ["list", "List", "96 px", "Card lists. Wide enough for the 60 px mada logo."],
    ].forEach(([size, name, spec, use]) => {
      const item = el("div", "bcard-size bcard-stack");
      item.dataset.size = size;
      item.append(image(art.green, ""));
      item.append(el("strong", "", name), el("span", "bcard-mono bcard-quiet", spec), el("span", "bcard-quiet", use));
      root.append(item);
    });
    const pile = el("div", "bcard-stack");
    const stack = el("div", "bcard-pile");
    [[art.lime, "0"], [art.ink, "var(--size-control)"], [art.green, "calc(var(--size-control) * 2)"]].forEach(([src, top]) => {
      const picture = el("img");
      picture.src = src;
      picture.alt = "";
      picture.style.top = top;
      stack.append(picture);
    });
    pile.append(stack, el("strong", "", "Stacked"), el("span", "bcard-mono bcard-quiet", "Top strip at least 44"), el("span", "bcard-quiet", "Only after the full card was seen. Marks stay fully visible."));
    root.append(pile);
  }

  function paintRow() {
    const arabic = store.lang === "ar";
    const box = mount("accept");
    box.dir = arabic ? "rtl" : "ltr";
    box.replaceChildren();
    box.append(el("strong", "", arabic ? "نقبل" : "We accept"));
    const marks = el("div", "bcard-marks");
    ["mada", "VISA", "Mastercard", "Apple Pay", "STC Pay"].forEach((label, index) => {
      const mark = el("span", "bcard-mark", label);
      if (index === 0) mark.dataset.first = "true";
      marks.append(mark);
    });
    box.append(marks, el("span", "bcard-quiet", arabic ? "مدى أولاً على اليمين، وكل الشعارات بنفس الحجم." : "mada first on the left, every mark the same size."));
  }

  function networkOf(digits) {
    if (digits.length >= 6 && madaBins.includes(digits.slice(0, 6))) return "mada";
    if (/^4/.test(digits)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
    return "";
  }

  function writePan(value, commit) {
    const digits = String(value).replace(/\D/g, "").slice(0, 16);
    const pretty = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    const input = panInput.querySelector("input");
    if (input.value !== pretty) {
      input.value = pretty;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (commit) input.dispatchEvent(new Event("blur"));
  }

  function cardRow(name, who, last, src, ratio, spent, frozen) {
    const row = el("div", "bcard-row");
    const mini = el("div", "bcard-mini");
    const picture = el("img");
    picture.src = src;
    picture.alt = "";
    mini.append(picture);
    if (frozen) {
      const dot = el("span", "bcard-freeze-dot");
      const glyph = icon("freeze");
      if (glyph) dot.append(glyph);
      mini.append(dot);
    }
    const copy = el("div", "bcard-stack");
    const title = el("div", "bcard-head");
    title.append(el("strong", "", name));
    if (frozen) title.append(createBadge({ label: "Frozen", tone: "info", size: "sm" }));
    const meter = el("div", "bcard-meter");
    const track = el("span", "bcard-meter-track");
    const fill = el("span", "bcard-meter-fill");
    fill.style.width = `${Math.round(ratio * 100)}%`;
    if (ratio > 0.85) fill.dataset.tone = "warning";
    track.append(fill);
    meter.append(track, el("span", "bcard-mono bcard-quiet", spent));
    copy.append(title, el("span", "bcard-quiet", `${who} · •• ${last}`), meter);
    row.append(mini, copy);
    return row;
  }

  function paintLists() {
    const english = [
      ["Main card", "Abdulaziz Ali", "4821", art.green, 0.42, "SAR 4,200 / 10,000", false],
      ["Marketing – Ads", "Omar Bakr", "7731", art.lime, 0.88, "SAR 4,400 / 5,000", false],
      ["Operations", "Sara Al-Qahtani", "2086", art.ink, 0.2, "SAR 600 / 3,000", true],
    ];
    const arabic = [
      ["البطاقة الرئيسية", "عبدالعزيز علي", "4821", art.green, 0.42, "SAR 4,200 / 10,000", false],
      ["التسويق – إعلانات", "عمر بكر", "7731", art.lime, 0.88, "SAR 4,400 / 5,000", false],
      ["العمليات", "سارة القحطاني", "2086", art.ink, 0.2, "SAR 600 / 3,000", true],
    ];
    mount("list").replaceChildren(...english.map((row) => cardRow(...row)));
    mount("list-ar").replaceChildren(...arabic.map((row) => cardRow(...row)));
  }

  function paintRules() {
    [
      [true, "Use only official network logo files, in full color."],
      [true, "Place the network mark top-right and keep the bottom-left empty."],
      [true, "Show only the last 4 digits by default."],
      [true, "Put the name, nickname and limits outside the card."],
      [true, "Show states with an overlay badge, not by greying the mark."],
      [true, "List mada first, at the same size as the other networks."],
      [false, "Don't put a name, full number, expiry, CVV, chip or stripe on the card art."],
      [false, "Don't mirror the card art or the mada logo in Arabic."],
      [false, "Don't show full card details without Face ID or PIN, or for more than 60 seconds."],
      [false, "Don't write “Mada”, “MADA” or “mada credit card”."],
    ].forEach(([ok, text]) => {
      const card = el("div", "rule bcard-do");
      const mark = el("span", "bcard-do-mark");
      mark.dataset.ok = ok ? "true" : "false";
      const glyph = icon(ok ? "confirm" : "error");
      if (glyph) mark.append(glyph);
      card.append(mark, el("span", "", text));
      mount("rules").append(card);
    });
    [
      "Exact layout and sizes for co-badged mada plus Visa or Mastercard card art.",
      "Latest approved logo files from mada, Visa and Mastercard.",
      "mada card art rules for Apple Pay and Google Pay.",
      "Each wallet's own card-art rules on top of the network rules.",
      "The production BIN table from the card processor.",
    ].forEach((text) => {
      const item = el("span", "bcard-check", text);
      mount("confirm").append(item);
    });
  }

  paintAnatomy();
  paintKinds();
  paintDesigns();
  paintStates();
  paintSizes();
  paintLists();
  paintRules();

  mount("reveal-toggle-slot").append(button({ label: "Show details", icon: "show", variant: "ink", size: "md" }, showDetails));
  mount("reveal-toggle-slot").querySelector(".button").dataset.bc = "reveal-toggle";
  mount("reveal-mobile-slot").append(button({ label: "Show details with Face ID", icon: "show", variant: "primary", block: true }, showDetails));
  mount("reveal-mobile-slot").querySelector(".button").dataset.bc = "reveal-mobile-toggle";
  page.querySelectorAll(".bcard-auth").forEach((node) => {
    const face = icon("face-id");
    if (face) node.prepend(face);
  });

  mount("lang").append(createButtonGroup({
    kind: "segment",
    size: "sm",
    label: "Language",
    value: "en",
    options: [
      { label: "English", value: "en" },
      { label: "العربية", value: "ar" },
    ],
    onChange(value) {
      store.lang = value;
      paintRow();
    },
  }));
  paintRow();

  [
    ["Bilingual", "One logo with Arabic and English. The same on Arabic and English screens. Never mirrored."],
    ["Proportion", "3 to 1, width to height."],
    ["Clear space", "One third of the logo width on every side."],
    ["Minimum", "60 px wide on screen."],
    ["Symbol only", "Only when there is no room and mada is clear from context."],
    ["On dark", "Use the white-wordmark version. All-white and all-black are not for cards."],
    ["Don't", "No white box, recolor, stretch, effects, rotation, redraw, or a flip for vertical."],
    ["In copy", "Always lowercase “mada”. “mada card” or “mada debit card”, never “mada account” or “credit”."],
  ].forEach(([key, value]) => {
    const row = el("div", "bcard-spec");
    row.append(el("strong", "", key), el("span", "bcard-quiet", value));
    mount("mada").append(row);
  });
  mount("mada-colors").append(el("span", "bcard-quiet", "Official mada colors, kept as a reference and not added to the Falcon palette: blue #00A3E0, green #84BD00, black #1D1D1B."));

  [
    ["mada in the middle", ["VISA", "mada", "Mastercard"], false],
    ["mada smaller", ["mada", "VISA", "Mastercard"], true],
  ].forEach(([title, labels, small]) => {
    const card = el("div", "bcard-bad-card");
    card.append(el("span", "bcard-kicker", title));
    card.querySelector(".bcard-kicker").dataset.tone = "error";
    const row = el("div", "bcard-marks");
    labels.forEach((label) => {
      const mark = el("span", "bcard-mark", label);
      if (small && label === "mada") mark.dataset.small = "true";
      row.append(mark);
    });
    card.append(row);
    mount("bad-rows").append(card);
  });

  panInput = createInput({
    label: "Card number",
    placeholder: "0000 0000 0000 0000",
    inputMode: "numeric",
    mono: true,
    maxLength: 19,
    validate(value, meta) {
      const digits = String(value || "").replace(/\D/g, "").slice(0, 16);
      store.pan = digits;
      const network = networkOf(digits);
      const full = digits.length === 16;
      const valid = full && luhn(digits);
      const mada = network === "mada";
      const net = mount("pan-net");
      if (net) {
        net.hidden = !network;
        net.textContent = network;
      }
      if (meta.touched && digits.length && !valid) {
        return { error: !full ? `Card numbers have 16 digits. ${16 - digits.length} to go.` : "This number doesn't look right. Check for a mistyped digit." };
      }
      if (valid) return { success: `${mada ? "mada debit card" : network === "VISA" ? "Visa card" : "Mastercard"} recognised.` };
      if (mada) return { hint: "mada card detected. mada is used even when the card is also Visa or Mastercard." };
      return { hint: "The network is detected from the first 6 digits." };
    },
    onChange(value) {
      writePan(value, false);
    },
  });
  panInput.querySelector("input").autocomplete = "cc-number";
  const net = el("span", "bcard-net");
  net.dataset.bc = "pan-net";
  net.hidden = true;
  panInput.querySelector(".input-box").append(net);
  mount("pan-field").append(panInput);

  [
    ["mada (co-badged)", complete(`440647${"123456789"}`)],
    ["Visa", complete(`4111${"11111111111"}`)],
    ["Mastercard", complete(`5425${"23310001000"}`)],
    ["Mistyped", "4406471234567899"],
  ].forEach(([label, value]) => {
    mount("samples").append(button({ label, variant: "secondary", size: "sm" }, () => writePan(value, true)));
  });

  paintReveal();
  setInterval(() => {
    if (store.rev) paintReveal();
  }, 1000);
})();
