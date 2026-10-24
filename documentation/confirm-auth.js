(function () {
  const page = document.querySelector('[data-page="confirm-auth"]');
  if (!page || !window.createConfirmDialog) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-ca="${name}"]`);
  }

  function block(label, node, tag) {
    const wrap = el("div", "dtd-block");
    const head = el("div", "dtd-block-head");
    head.append(el("span", "dtd-kicker", label));
    if (tag) head.append(el("span", "dtd-live", tag));
    wrap.append(head, node);
    return wrap;
  }

  function segment(label, options, current, onPick) {
    const group = el("div", "dtd-segment");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", label);
    function paint() {
      group.replaceChildren();
      options.forEach(([value, text]) => {
        const button = el("button", "dtd-seg", text);
        button.type = "button";
        button.setAttribute("role", "radio");
        button.setAttribute("aria-checked", value === current ? "true" : "false");
        button.addEventListener("click", () => {
          current = value;
          paint();
          onPick(value);
          group.querySelector('[aria-checked="true"]').focus();
        });
        group.append(button);
      });
    }
    paint();
    return group;
  }

  function side(lang) {
    const ar = lang === "ar";
    const nav = el("nav", "ca-side");
    const brand = el("img", "ca-wordmark");
    brand.src = "../media/type=full, color=brand.svg";
    brand.alt = "Hala";
    nav.append(brand);
    [["transfers", "Transfers", "التحويلات"], ["cards", "Cards", "البطاقات"], ["approvals", "Approvals", "الاعتمادات"]].forEach(([id, en, arLabel]) => {
      const item = el("a", "ca-nav", ar ? arLabel : en);
      item.href = "#";
      item.dataset.on = id === "transfers" ? "true" : "false";
      nav.append(item);
    });
    return nav;
  }

  function form(lang) {
    const ar = lang === "ar";
    const card = el("div", "ca-card");
    card.append(el("h3", "ca-title", ar ? "تحويل جديد" : "New transfer"));
    [
      [ar ? "إلى" : "To", ar ? "شركة المراعي للتوريد" : "Almarai Supply Co."],
      [ar ? "من" : "From", ar ? "هلا للأعمال •• 1951" : "Hala Business •• 1951"],
      [ar ? "الغرض" : "Purpose", ar ? "دفعة مورّد" : "Supplier payment"],
    ].forEach(([label, value]) => {
      const row = el("div", "ca-form-row");
      row.append(el("span", "", label), el("strong", "", value));
      card.append(row);
    });
    const total = el("div", "ca-form-row");
    total.append(el("span", "", ar ? "الإجمالي" : "Total"), createAmount(8250, { size: "m" }));
    card.append(total);
    return card;
  }

  function transfers(lang, step) {
    const ar = lang === "ar";
    const root = el("div", "ca-app");
    root.lang = lang;
    root.dir = ar ? "rtl" : "ltr";
    const main = el("div", "ca-main");
    const pageEl = el("div", "ca-page");
    pageEl.append(form(lang));
    if (step === "waiting") pageEl.append(createWaitingApproval({ lang }));
    if (window.createNavWebTopBar) main.append(createNavWebTopBar({ locale: lang }), pageEl);
    else main.append(pageEl);
    root.append(side(lang), main);
    if (step !== "waiting") {
      const dialog = createConfirmDialog({ lang, step: step || "review", contained: true });
      root.append(dialog);
    }
    return root;
  }

  function phone(title, body, caption, lang) {
    const card = el("figure", "lst-phone-card");
    const screen = el("div", "lst-phone");
    screen.lang = lang || "en";
    screen.dir = lang === "ar" ? "rtl" : "ltr";
    const bar = el("div", "lst-phone-bar");
    bar.append(el("span", "lst-phone-title", title));
    const scroll = el("div", "lst-phone-scroll");
    scroll.append(body);
    screen.append(bar, scroll);
    card.append(screen, el("figcaption", "lst-caption", caption));
    return card;
  }

  function receipt(lang, platform) {
    const wrap = el("div", "ca-wait");
    if (window.createReceiptCard) {
      wrap.append(createReceiptCard({
        state: "review",
        amount: 8250,
        recipient: lang === "ar" ? "شركة المراعي للتوريد" : "Almarai Supply Co.",
        bank: lang === "ar" ? "مصرف الراجحي" : "Al Rajhi Bank",
        iban: "SA03 8000 0000 6080 1016 7519",
        date: lang === "ar" ? "٢١ أكتوبر ٢٠٢٦" : "21 Oct 2026",
        fee: 0,
        lang,
        onConfirm(root) {
          root.setState("pending");
        },
      }));
    } else {
      wrap.append(createBiometricConfirm({ platform, lang }));
    }
    return wrap;
  }

  function fillWeb() {
    const host = mount("web");
    const frame = el("div", "dtd-frame");
    let step = "review";
    function paint() {
      frame.replaceChildren(transfers("en", step));
      const dialog = frame.querySelector(".ca-overlay");
      if (!dialog) return;
      dialog.addEventListener("click", (event) => {
        const button = event.target.closest(".button");
        if (!button) return;
        if (dialog.getStep() === "verify" && button.dataset.variant === "primary") {
          step = "waiting";
          paint();
        }
      });
    }
    paint();
    host.append(block("Transfers page · Confirm dialog in App shell Overlay. Continue opens Verify; Confirm transfer shows waiting.", frame, "Live · review, then verify"));
  }

  function fillMobile() {
    const host = mount("mobile");
    host.append(
      phone("Review", receipt("en", "ios"), "iOS · Confirm with Face ID", "en"),
      phone("Review", receipt("en", "android"), "Android · fingerprint", "en"),
      phone("Waiting", createWaitingApproval({ lang: "en" }), "Waiting for approval", "en"),
      phone("Card ready", (() => {
        const stack = el("div", "ca-wait");
        stack.append(createWalletBadge({ wallet: "apple" }), createWalletBadge({ wallet: "google" }));
        return stack;
      })(), "Wallet badges · placeholder", "en"),
    );
  }

  function fillStates() {
    const host = mount("states");
    const dialogs = el("div", "ca-states");
    [
      ["Review · LTR", "en", "review"],
      ["Review · RTL", "ar", "review"],
      ["Verify · LTR", "en", "verify"],
      ["Verify · RTL", "ar", "verify"],
    ].forEach(([name, lang, step]) => {
      const card = el("div", "ca-state");
      card.append(el("span", "dtd-kicker", name), createConfirmDialog({ lang, step, contained: true }));
      dialogs.append(card);
    });
    host.append(block("Confirm dialog · Review / Verify · LTR + RTL", dialogs, "Live"));

    const receiptRow = el("div", "ca-pair");
    if (window.createReceiptCard) {
      receiptRow.append(createReceiptCard({
        state: "review",
        amount: 8250,
        recipient: "Almarai Supply Co.",
        bank: "Al Rajhi Bank",
        iban: "SA03 8000 0000 6080 1016 7519",
        date: "21 Oct 2026",
        fee: 0,
      }));
    }
    host.append(block("Receipt card · Review with Face ID — existing component, button now Ink + face-id", receiptRow));

    const biometrics = el("div", "ca-pair");
    biometrics.append(
      createBiometricConfirm({ platform: "ios" }),
      createBiometricConfirm({ platform: "android" }),
    );
    host.append(block("Biometric confirm · Button Ink + face-id / fingerprint — existing Button", biometrics));

    const wallets = el("div", "ca-pair");
    wallets.append(
      createWalletBadge({ wallet: "apple", lang: "en" }),
      createWalletBadge({ wallet: "google", lang: "en" }),
      createWalletBadge({ wallet: "apple", lang: "ar" }),
      createWalletBadge({ wallet: "google", lang: "ar" }),
    );
    host.append(block("Wallet badge · Apple / Google · LTR + RTL — placeholder, lives on Logos", wallets));

    host.append(block("Second approver · Result hero Info — existing component", createWaitingApproval({ lang: "en" })));
  }

  function fillArabic() {
    mount("arabic").append(
      block("Arabic · dialog over Transfers. Amounts, IBAN and OTP stay LTR.", transfers("ar", "review"), "Live"),
      phone("مراجعة التحويل", receipt("ar", "ios"), "تطبيق · عربي", "ar"),
      phone("بانتظار الموافقة", createWaitingApproval({ lang: "ar" }), "بانتظار الموافقة", "ar"),
    );
  }

  function fillResponsive() {
    const host = mount("responsive");
    const stack = el("div", "dtd-stack");
    const frame = el("div", "dtd-frame");
    function paint(width) {
      frame.dataset.width = width;
      if (width === "desktop") frame.replaceChildren(transfers("en", "review"));
      else if (width === "tablet") frame.replaceChildren(receipt("en", "ios"));
      else frame.replaceChildren(receipt("en", "ios"));
    }
    paint("desktop");
    stack.append(
      segment("Breakpoint", [["desktop", "Web"], ["tablet", "iPad app · 760"], ["mobile", "Phone app · 390"]], "desktop", paint),
      frame,
    );
    host.append(block("Web confirms in a dialog with an OTP; the iPad and phone app confirm on the review screen with biometrics.", stack, "Live · width"));
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "ConfirmDialog, WaitingApproval", "Two-step dialog in App shell Overlay · Review with the second-approver notice, then OTP · Back keeps entered data · amounts use createAmount so digits never mirror"],
      ["iOS", "Same names · ReceiptCard, BiometricConfirm", "Review screen with Confirm with Face ID · fall back to PIN · Wallet badge is Apple only · VoiceOver names the amount and the approver · 44 pt targets · Honour accessibilityReduceMotion"],
      ["Android", "Same names", "Confirm with fingerprint · 48 dp targets · contentDescription on Face/fingerprint and OTP boxes · amounts set layoutDirection Ltr · Honour the animator duration scale"],
    ].forEach(([platform, api, notes]) => {
      const line = el("div", "lst-platform");
      line.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(line);
    });
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Show the full summary and the approver notice before the final confirm.", "Tell people about a second approver only after they confirm."],
      ["Use Face ID or fingerprint on the last button and fall back to PIN.", "Ask for biometrics and an OTP for the same small action."],
      ["Use the official Apple and Google Wallet badges, one per platform.", "Show both wallet badges or redraw the brand marks."],
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

  fillWeb();
  fillMobile();
  fillStates();
  fillArabic();
  fillResponsive();
  fillPlatforms();
  fillRules();
})();
