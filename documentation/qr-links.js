(function () {
  const page = document.querySelector('[data-page="qr-links"]');
  if (!page || !window.createQrCode) return;

  const DATA = "https://hala.link/albaik-64";
  const T = {
    en: {
      sizes: "One style, three sizes. S for a row, M on Scan to pay, L on a poster.",
      scan: "Scan to pay · the code sits on its own tile.",
      pos: "POS · the same code forced to light tokens so a counter scanner can read it.",
      chip: "Link chip · tap copies the short URL.",
      card: "Payment link card · Share copies; Show QR opens the code.",
      preview: "Link preview · always ink, for chat and social. Not themed.",
    },
    ar: {
      sizes: "أسلوب واحد، ثلاثة أحجام.",
      scan: "امسح للدفع",
      pos: "نقطة البيع · الرمز الفاتح",
      chip: "شريحة الرابط",
      card: "بطاقة رابط الدفع",
      preview: "معاينة الرابط",
    },
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-qr="${name}"]`);
  }

  function block(label, node, tag) {
    const wrap = el("div", "dtd-block");
    const head = el("div", "dtd-block-head");
    head.append(el("span", "dtd-kicker", label));
    if (tag) head.append(el("span", "dtd-live", tag));
    wrap.append(head, node);
    return wrap;
  }

  function specimen(name, when, where, how, node) {
    const card = el("div", "lst-spec");
    const copy = el("div", "lst-spec-copy");
    copy.append(el("h3", "", name));
    [["When", when], ["Where", where], ["How", how]].forEach(([key, value]) => {
      const line = el("p", "");
      line.append(el("strong", "", `${key} `), document.createTextNode(value));
      copy.append(line);
    });
    const stage = el("div", "lst-spec-stage dtd-stage");
    stage.append(node);
    card.append(copy, stage);
    return card;
  }

  function fillScanning() {
    const host = mount("scanning");
    const sizes = el("div", "qrd-row");
    [["s", "S · 136"], ["m", "M · 224"], ["l", "L · 312"]].forEach(([size, label]) => {
      const cell = el("figure", "qrd-size");
      cell.append(createQrCode({ data: DATA, size, logo: true }), el("figcaption", "lst-caption", label));
      sizes.append(cell);
    });
    host.append(block(T.en.sizes, sizes));

    const scans = el("div", "qrd-row");
    scans.append(
      createScanToPay({ lang: "en" }),
      createScanToPay({ lang: "ar" }),
    );
    host.append(block(T.en.scan, scans, "Live"));

    const pos = el("div", "qrd-row");
    pos.append(createScanToPay({ lang: "en", light: true }));
    host.append(block(T.en.pos, pos, "Live · light tokens"));
  }

  function fillSharing() {
    const host = mount("sharing");
    const chips = el("div", "qrd-row");
    chips.append(
      createLinkChip({ lang: "en" }),
      createLinkChip({ lang: "ar" }),
    );
    host.append(block(T.en.chip, chips, "Live · copy"));

    const cards = el("div", "qrd-row");
    cards.append(
      createPaymentLinkCard({ lang: "en" }),
      createPaymentLinkCard({ lang: "ar" }),
    );
    host.append(block(T.en.card, cards, "Live · Share and Show QR"));

    const previews = el("div", "qrd-row");
    previews.append(
      createLinkPreview({ lang: "en" }),
      createLinkPreview({ lang: "ar" }),
    );
    host.append(block(T.en.preview, previews));
  }

  function fillComponents() {
    mount("components").append(
      specimen(
        "QR code",
        "Encoding a short payment URL so a phone or a POS scanner can open it.",
        "Always on its own tile. Scan to pay, a poster, or a row next to a link.",
        "Size S, M or L. Show logo punches a quiet pad for the Hala mark. light=true keeps the Light tokens for POS. Never smaller than S, never stretched, never mirrored.",
        createQrCode({ data: DATA, size: "m", logo: true }),
      ),
      specimen(
        "Scan to pay",
        "Someone is paying in person or from a printed sheet.",
        "Counter display, receipt, or a shared image.",
        "Title, merchant, Amount L, QR M, then the short URL in mono. Arabic flips the card; the amount and URL stay LTR.",
        createScanToPay({ lang: "en" }),
      ),
      specimen(
        "Link chip",
        "A compact short link that people can copy.",
        "Chat, a confirmation, or under an amount.",
        "Domain is secondary, slug is primary, both mono. Tap copies. Show copy adds the copy icon.",
        createLinkChip({ lang: "en" }),
      ),
      specimen(
        "Payment link card",
        "Sharing a request before the other person pays.",
        "Inbox, a transfer review, or a share sheet.",
        "Merchant, expiry, Amount M, the short URL, then Share link and Show QR. Arabic starts from the right.",
        createPaymentLinkCard({ lang: "en" }),
      ),
      specimen(
        "Link preview",
        "The card a chat or social app shows for a Hala link.",
        "WhatsApp, iMessage, Slack — Open Graph only. Export 1200×630.",
        "Always ink and white. Not themed. Title, Amount L, Hala mark.",
        createLinkPreview({ lang: "en" }),
      ),
    );
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "QrCode, ScanToPay, LinkChip, PaymentLinkCard, LinkPreview", "QR draws circles at --qr-dot and ring finders — never a square module. Dark inverts the tile. POS passes light. Chip and Share copy the short URL. Preview ignores theme. Amounts and the URL set direction ltr."],
      ["iOS", "Same names", "CIFilter is not the Hala QR — draw the same circles and finders. Size S is 136 pt; never smaller. VoiceOver reads “QR code for hala.link/albaik-64”. Link preview is a static 1200×630 image. Honour accessibilityReduceMotion."],
      ["Android", "Same names", "Same matrix and geometry. 48 dp targets on Chip, Share and Show QR. POS cameras get the light tokens. contentDescription on the code. layoutDirection Ltr on the amount and the URL. Honour the animator duration scale."],
    ].forEach(([platform, api, notes]) => {
      const line = el("div", "lst-platform");
      line.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(line);
    });
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Put the QR on its own tile. Dark inverts the tile so the code stays scannable.", "Draw the code on brand green or any busy surface. A POS camera will miss it."],
      ["Keep the dots as circles and the finders as rings. Size is S, M or L — never below 136 / 2.5 cm in print.", "Stretch, squash or mirror the code. Square modules and a stock library look are not Hala."],
      ["Encode only the short URL. Use light tokens when a counter scanner must read it.", "Encode a long checkout URL, or invert a POS code with the page theme."],
    ].forEach(([yes, no], index) => {
      const card = el("div", "lst-rule");
      card.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
      [[true, yes], [false, no]].forEach(([ok, text]) => {
        const line = el("div", "lst-rule-line");
        line.dataset.ok = ok ? "true" : "false";
        line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
        card.append(line);
      });
      host.append(card);
    });
  }

  fillScanning();
  fillSharing();
  fillComponents();
  fillPlatforms();
  fillRules();
})();
