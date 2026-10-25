/**
 * HALA DNA Payment cards: Payment card, Card mini, Card carousel, Design option and Card offer summary.
 * Artwork comes from the HALA DNA _Card face (media/cards/*.svg); label, last four and scheme are live text.
 * Load selection.js and lists.js before this script.
 *
 * createPaymentCard({ product, size, state, label, last4, ribbon, lang, onAdd })
 *   size "full" | "medium". state "active" | "frozen" | "inactive" | "expired" | "placeholder".
 *   The card never mirrors in Arabic.
 * createCardMini({ product, size })  size "s" | "m" | "l". Art only.
 * createCardCarousel({ cards, style, lang, label })  style "carousel" | "fanned".
 * createDesignOptions({ options, selected, onChange, lang, label }) and createDesignOption({ ..., state })
 * createCardOfferSummary({ product, name, type, facts, reference, fees, lang })
 */
(function () {
  const ART = "../media/cards/";
  const PRODUCTS = {
    purchase: { name: "Purchase card", ar: "بطاقة المشتريات", scheme: "Visa", surface: "dark" },
    expense: { name: "Expense card", ar: "بطاقة المصاريف", scheme: "Visa", surface: "light" },
    corporate: { name: "Corporate card", ar: "بطاقة الشركات", scheme: "Visa", surface: "dark" },
    cash: { name: "Cash card", ar: "بطاقة النقد", scheme: "mada", surface: "light" },
    platinum: { name: "Platinum card", ar: "البطاقة البلاتينية", scheme: "Visa", surface: "light" },
    sdb: { name: "SDB Business card", ar: "بطاقة بنك التنمية الاجتماعية", scheme: "Visa", surface: "dark" },
    "hurr-sadu": { name: "Hurr Business · Sadu", ar: "حُر للأعمال · السدو", scheme: "Visa", surface: "dark", hurr: true },
    "hurr-najdi": { name: "Hurr Business · Najdi", ar: "حُر للأعمال · نجدي", scheme: "Visa", surface: "dark", hurr: true },
    "hurr-nafud": { name: "Hurr Business · Nafud", ar: "حُر للأعمال · النفود", scheme: "Visa", surface: "light", hurr: true },
    "hurr-asiri": { name: "Hurr Business · Asiri", ar: "حُر للأعمال · عسيري", scheme: "Visa", surface: "light", hurr: true },
  };
  const COPY = {
    en: {
      states: { frozen: "Frozen", inactive: "Not activated", expired: "Expired" },
      ending: (scheme, last4) => `${scheme} ending ${last4}`,
      add: "Add a card",
      cards: "Cards",
      card: (index, count) => `Card ${index} of ${count}`,
      total: "Total",
      reference: "Reference number",
    },
    ar: {
      states: { frozen: "مجمّدة", inactive: "غير مفعّلة", expired: "منتهية" },
      ending: (scheme, last4) => `${scheme} تنتهي بـ ${last4}`,
      add: "أضف بطاقة",
      cards: "البطاقات",
      card: (index, count) => `البطاقة ${index} من ${count}`,
      total: "الإجمالي",
      reference: "الرقم المرجعي",
    },
  };
  const STATE_ICON = { frozen: "freeze", inactive: "clock", expired: "calendar" };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(name, size) {
    const set = window.halaIcons;
    if (!set) return null;
    const kebab = (set.catalog && set.catalog[name]) || name;
    const pascal = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    if (!set.icons[pascal]) return null;
    const svg = set.createElement(set.icons[pascal]);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    svg.dataset.size = size || "inline";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function copyFor(lang) {
    return COPY[lang === "ar" ? "ar" : "en"];
  }

  function art(product) {
    const image = el("img", "pay-art");
    image.src = `${ART}${product}.svg`;
    image.alt = "";
    image.decoding = "async";
    image.draggable = false;
    return image;
  }

  function productName(product, lang) {
    const spec = PRODUCTS[product] || PRODUCTS.purchase;
    return lang === "ar" ? spec.ar : spec.name;
  }

  function createPaymentCard(options = {}) {
    const { product = "purchase", size = "full", state = "active", label = "Digital", last4 = "3399", lang = "en" } = options;
    const spec = PRODUCTS[product] || PRODUCTS.purchase;
    const copy = copyFor(lang);
    const card = el(state === "placeholder" ? "button" : "div", "pay-card");
    card.dataset.size = size;
    card.dataset.state = state;
    card.dir = "ltr";

    if (state === "placeholder") {
      card.type = "button";
      const face = el("span", "pay-face pay-empty");
      const glyph = icon("add", "default");
      if (glyph) face.append(glyph);
      face.append(el("span", "pay-empty-label", options.addLabel || copy.add));
      face.lang = lang;
      face.dir = lang === "ar" ? "rtl" : "ltr";
      card.append(face);
      if (options.onAdd) card.addEventListener("click", options.onAdd);
      return card;
    }

    card.dataset.product = product;
    card.dataset.surface = spec.surface;
    card.setAttribute("role", "img");
    const status = copy.states[state];
    card.setAttribute("aria-label", [productName(product, lang), copy.ending(spec.scheme, last4), status].filter(Boolean).join(", "));

    const face = el("span", "pay-face");
    face.setAttribute("aria-hidden", "true");
    face.append(art(product));
    if (!spec.hurr && label) face.append(el("span", "pay-label", label));
    const number = el("span", "pay-number");
    number.append(el("span", "pay-dots", "••••"), el("span", "pay-last", last4));
    const scheme = el("span", "pay-scheme", spec.scheme);
    face.append(number, scheme);
    if (options.ribbon) face.append(el("span", "pay-ribbon", options.ribbon));
    if (status) {
      face.append(el("span", "pay-tint"));
      const badge = el("span", "pay-badge");
      badge.lang = lang;
      badge.dir = lang === "ar" ? "rtl" : "ltr";
      const glyph = icon(STATE_ICON[state], "inline");
      if (glyph) badge.append(glyph);
      badge.append(el("span", "", status));
      face.append(badge);
    }
    card.append(face);
    return card;
  }

  function createCardMini(options = {}) {
    const { product = "purchase", size = "m" } = options;
    const mini = el("span", "pay-mini");
    mini.dataset.size = size;
    mini.append(art(product));
    if (options.label) {
      mini.setAttribute("role", "img");
      mini.setAttribute("aria-label", options.label);
    } else mini.setAttribute("aria-hidden", "true");
    return mini;
  }

  function dots(count, label, onPick) {
    const group = el("div", "pay-dots-nav");
    group.setAttribute("role", "tablist");
    group.setAttribute("aria-label", label);
    const buttons = Array.from({ length: count }, (_, index) => {
      const button = el("button", "pay-dot");
      button.type = "button";
      button.setAttribute("role", "tab");
      button.addEventListener("click", () => onPick(index, true));
      button.addEventListener("keydown", (event) => {
        const rtl = getComputedStyle(group).direction === "rtl";
        const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key];
        if (!step) return;
        event.preventDefault();
        onPick((index + step + count) % count, true);
      });
      group.append(button);
      return button;
    });
    group.update = (current, focus) => {
      buttons.forEach((button, index) => {
        const on = index === current;
        button.setAttribute("aria-selected", on ? "true" : "false");
        button.tabIndex = on ? 0 : -1;
        if (on && focus) button.focus();
      });
    };
    group.buttons = buttons;
    return group;
  }

  function createCardCarousel(options = {}) {
    const { cards = [], style = "carousel", lang = "en" } = options;
    const copy = copyFor(lang);
    const root = el("section", "pay-carousel");
    root.dataset.style = style;
    root.setAttribute("aria-roledescription", "carousel");
    root.setAttribute("aria-label", options.label || copy.cards);
    const stage = el("div", "pay-stage");
    const slides = cards.map((spec, index) => {
      const slide = el("div", "pay-slide");
      slide.setAttribute("role", "tabpanel");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", copy.card(index + 1, cards.length));
      slide.append(createPaymentCard({ ...spec, size: "full", lang }));
      stage.append(slide);
      return slide;
    });
    let current = 0;
    const nav = dots(cards.length, copy.cards, (index, focus) => go(index, focus));
    nav.buttons.forEach((button, index) => {
      const id = `pay-slide-${Math.random().toString(36).slice(2, 8)}-${index}`;
      slides[index].id = id;
      button.setAttribute("aria-controls", id);
      button.setAttribute("aria-label", copy.card(index + 1, cards.length));
    });

    function paintFan() {
      slides.forEach((slide, index) => {
        const depth = (index - current + slides.length) % slides.length;
        slide.style.setProperty("--pay-depth", String(depth));
        slide.dataset.front = depth === 0 ? "true" : "false";
        slide.dataset.behind = depth > 2 ? "true" : "false";
        slide.hidden = false;
        slide.inert = depth !== 0;
      });
    }

    function go(index, focus) {
      current = index;
      if (style === "fanned") paintFan();
      else {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reduceMotion === "true";
        const slide = slides[index];
        stage.scrollTo({ left: slide.offsetLeft - (stage.clientWidth - slide.clientWidth) / 2, behavior: reduce ? "auto" : "smooth" });
      }
      nav.update(current, focus);
    }

    if (style === "carousel") {
      let frame;
      stage.addEventListener("scroll", () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const middle = stage.getBoundingClientRect().left + stage.clientWidth / 2;
          let best = 0;
          let distance = Infinity;
          slides.forEach((slide, index) => {
            const box = slide.getBoundingClientRect();
            const gap = Math.abs(box.left + box.width / 2 - middle);
            if (gap < distance) { distance = gap; best = index; }
          });
          if (best !== current) {
            current = best;
            nav.update(current, false);
          }
        });
      }, { passive: true });
    } else {
      stage.addEventListener("click", () => go((current + 1) % slides.length, false));
      paintFan();
    }
    nav.update(current, false);
    root.append(stage, nav);
    root.go = go;
    return root;
  }

  function optionContent(option, lang) {
    const copy = el("span", "pay-option-copy");
    copy.append(el("span", "pay-option-title", lang === "ar" ? option.titleAr || option.title : option.title));
    const sub = lang === "ar" ? option.subtitleAr || option.subtitle : option.subtitle;
    if (sub) copy.append(el("span", "pay-option-sub", sub));
    return copy;
  }

  function radioVisual(checked) {
    if (window.createChoice) return window.createChoice({ kind: "radio", visual: true, checked });
    return el("span", "pay-radio");
  }

  function createDesignOption(options = {}) {
    const { product = "hurr-sadu", state = "default", lang = "en" } = options;
    const row = el("span", "pay-option");
    row.dataset.state = state;
    row.dir = lang === "ar" ? "rtl" : "ltr";
    row.lang = lang;
    row.append(createCardMini({ product, size: "m" }), optionContent(options, lang), radioVisual(state === "selected"));
    return row;
  }

  function createDesignOptions(options = {}) {
    const { lang = "en" } = options;
    const list = options.options || [];
    let selected = Math.max(0, list.findIndex((option) => option.product === options.selected));
    const group = el("div", "pay-options");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", options.label || (lang === "ar" ? "تصميم البطاقة" : "Card design"));

    function paint(focus) {
      group.replaceChildren();
      list.forEach((option, index) => {
        const on = index === selected;
        const row = el("button", "pay-option");
        row.type = "button";
        row.setAttribute("role", "radio");
        row.setAttribute("aria-checked", on ? "true" : "false");
        row.tabIndex = on ? 0 : -1;
        row.dataset.state = on ? "selected" : "default";
        row.append(createCardMini({ product: option.product, size: "m" }), optionContent(option, lang), radioVisual(on));
        row.addEventListener("click", () => pick(index, true));
        row.addEventListener("keydown", (event) => {
          const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
          if (!step) return;
          event.preventDefault();
          pick((index + step + list.length) % list.length, true);
        });
        group.append(row);
        if (on && focus) row.focus();
      });
    }

    function pick(index, focus) {
      if (index === selected) return;
      selected = index;
      paint(focus);
      if (options.onChange) options.onChange(list[index], index);
    }

    paint(false);
    group.getSelected = () => list[selected];
    return group;
  }

  function createCardOfferSummary(options = {}) {
    const { product = "platinum", lang = "en" } = options;
    const copy = copyFor(lang);
    const root = el("section", "pay-offer");
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.lang = lang;
    root.setAttribute("aria-label", options.name || productName(product, lang));

    const head = el("div", "pay-offer-head");
    const name = el("div", "pay-offer-name");
    name.append(el("span", "pay-offer-title", options.name || productName(product, lang)));
    if (options.type) name.append(el("span", "pay-offer-sub", options.type));
    head.append(createCardMini({ product, size: "m" }), name);

    const facts = el("dl", "pay-offer-facts");
    (options.facts || []).forEach(([key, value]) => {
      const fact = el("div", "pay-offer-fact");
      fact.append(el("dt", "", key), el("dd", "", value));
      facts.append(fact);
    });

    const parts = [head, el("hr", "pay-offer-rule"), facts];
    if (options.reference) {
      const ref = el("dl", "pay-offer-facts");
      const fact = el("div", "pay-offer-fact");
      fact.append(el("dt", "", copy.reference), el("dd", "pay-offer-mono", options.reference));
      ref.append(fact);
      parts.push(ref);
    }

    const fees = el("dl", "pay-offer-fees");
    let total = 0;
    (options.fees || []).forEach((fee) => {
      total += fee.amount;
      const line = el("div", "pay-offer-line");
      if (fee.tone) line.dataset.tone = fee.tone;
      const value = el("dd", "");
      value.append(window.createAmount(fee.amount, { kind: "muted", size: "s", signed: fee.amount < 0 }));
      line.append(el("dt", "", fee.label), value);
      fees.append(line);
    });
    const totalLine = el("div", "pay-offer-line pay-offer-total");
    const totalValue = el("dd", "");
    totalValue.append(window.createAmount(total, { size: "s" }));
    totalLine.append(el("dt", "", options.totalLabel || copy.total), totalValue);
    parts.push(el("hr", "pay-offer-rule"), fees, el("hr", "pay-offer-rule"), totalLine);
    root.append(...parts);
    return root;
  }

  window.PAYMENT_CARD_PRODUCTS = PRODUCTS;
  window.createPaymentCard = createPaymentCard;
  window.createCardMini = createCardMini;
  window.createCardCarousel = createCardCarousel;
  window.createDesignOption = createDesignOption;
  window.createDesignOptions = createDesignOptions;
  window.createCardOfferSummary = createCardOfferSummary;
})();
