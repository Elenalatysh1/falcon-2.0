/**
 * Confirm & auth. Load vendor/hala-icons.js, button.js, inputs.js,
 * feedback.js, lists.js (createAmount, createDetails), progress.js, then this script.
 *
 * createConfirmDialog({
 *   step: "review" | "verify",
 *   lang, contained, open,
 *   recipient, from, purpose, amount, fee, approver, limit, phone, match,
 *   onCancel, onContinue, onBack, onConfirm
 * })
 *
 * createWaitingApproval({ lang, approver, amount })
 * createBiometricConfirm({ platform: "ios" | "android", lang, onConfirm })
 * createWalletBadge({ wallet: "apple" | "google", lang })
 */
(function () {
  const COPY = {
    en: {
      step1: "Step 1 of 2",
      review: "Review transfer",
      to: "To",
      from: "From",
      purpose: "Purpose",
      fee: "Fee",
      total: "Total",
      noticeTitle: "Second approval needed",
      notice: (amount, approver) => `Over ${amount}, so ${approver} is asked to approve once you confirm.`,
      cancel: "Cancel",
      continue: "Continue",
      step2: "Step 2 of 2",
      verify: "Confirm with code",
      otpTitle: "Enter the code",
      otpDesc: (phone) => `Sent by SMS to ${phone}`,
      prompt: "Didn't get it?",
      resend: "Resend code",
      resendIn: "Resend in",
      back: "Back",
      confirm: "Confirm transfer",
      waiting: "Waiting for approval",
      waitingDesc: (approver) => `${approver} has been asked to approve this transfer.`,
      you: "You confirmed",
      youDesc: "The transfer is waiting for a second approval.",
      approver: "Approver",
      approverDesc: (name) => `${name} has been notified.`,
      sent: "Sent",
      sentDesc: "The beneficiary is paid after approval.",
      face: "Confirm with Face ID",
      finger: "Confirm with fingerprint",
      apple: "Add to Apple Wallet",
      google: "Add to Google Wallet",
    },
    ar: {
      step1: "الخطوة 1 من 2",
      review: "مراجعة التحويل",
      to: "إلى",
      from: "من",
      purpose: "الغرض",
      fee: "الرسوم",
      total: "الإجمالي",
      noticeTitle: "تحتاج موافقة ثانية",
      notice: (amount, approver) => `المبلغ أكثر من ${amount}، لذلك سيُطلب من ${approver} الموافقة بعد تأكيدك.`,
      cancel: "إلغاء",
      continue: "متابعة",
      step2: "الخطوة 2 من 2",
      verify: "تأكيد برمز التحقق",
      otpTitle: "أدخل الرمز",
      otpDesc: (phone) => `أُرسل برسالة نصية إلى ${phone}`,
      prompt: "لم يصلك الرمز؟",
      resend: "إعادة الإرسال",
      resendIn: "إعادة الإرسال",
      back: "رجوع",
      confirm: "تأكيد التحويل",
      waiting: "بانتظار الموافقة",
      waitingDesc: (approver) => `تم طلب موافقة ${approver} على هذا التحويل.`,
      you: "أكّدت",
      youDesc: "التحويل بانتظار موافقة ثانية.",
      approver: "المعتمد",
      approverDesc: (name) => `تم إشعار ${name}.`,
      sent: "أُرسل",
      sentDesc: "يُدفع للمستفيد بعد الموافقة.",
      face: "تأكيد ببصمة الوجه",
      finger: "تأكيد ببصمة الإصبع",
      apple: "أضف إلى Apple Wallet",
      google: "أضف إلى Google Wallet",
    },
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function money(value, size) {
    if (window.createAmount) return window.createAmount(value, { size: size || "s" });
    return el("span", "ca-mono", Number(value).toFixed(2));
  }

  function formatPlain(value) {
    return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function scope(node, lang) {
    node.lang = lang;
    node.dir = lang === "ar" ? "rtl" : "ltr";
    if (lang === "ar") node.style.fontFamily = "var(--font-arabic)";
  }

  function createConfirmDialog(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const recipient = options.recipient || (lang === "ar" ? "شركة المراعي للتوريد" : "Almarai Supply Co.");
    const from = options.from || (lang === "ar" ? "هلا للأعمال •• 1951" : "Hala Business •• 1951");
    const purpose = options.purpose || (lang === "ar" ? "دفعة مورّد" : "Supplier payment");
    const amount = options.amount == null ? 8250 : options.amount;
    const fee = options.fee == null ? 0 : options.fee;
    const approver = options.approver || (lang === "ar" ? "فيصل أ." : "Faisal A.");
    const limit = options.limit == null ? 5000 : options.limit;
    const phone = options.phone || "+966 50 ••• •• 26";
    const match = options.match || "482913";
    let step = options.step === "verify" ? "verify" : "review";

    const overlay = el("div", "overlay ca-overlay");
    overlay.dataset.kind = "modal";
    overlay.dataset.size = "confirm";
    overlay.dataset.open = options.open === false ? "false" : "true";
    overlay.dataset.dismiss = "explicit";
    if (options.contained !== false) overlay.dataset.contained = "true";
    scope(overlay, lang);

    const scrim = el("button", "overlay-scrim");
    scrim.type = "button";
    scrim.setAttribute("aria-label", copy.cancel);
    overlay.append(scrim);

    const panel = el("div", "overlay-panel ca-dialog");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    overlay.append(panel);

    function paint() {
      panel.replaceChildren();
      const head = el("header", "ca-head");
      const stepLabel = el("p", "ca-step", step === "review" ? copy.step1 : copy.step2);
      const title = el("h2", "ca-title", step === "review" ? copy.review : copy.verify);
      title.id = `ca-title-${Math.random().toString(36).slice(2, 8)}`;
      panel.setAttribute("aria-labelledby", title.id);
      head.append(stepLabel, title);
      panel.append(head);

      const body = el("div", "ca-body");
      if (step === "review") {
        if (window.createDetails) {
          body.append(createDetails([
            { label: copy.to, value: recipient },
            { label: copy.from, value: from, style: "mono" },
            { label: copy.purpose, value: purpose },
            { label: copy.fee, value: fee, style: "amount" },
            { label: copy.total, value: amount + fee, style: "total" },
          ]));
        }
        if (window.createFeedback && amount > limit) {
          const limitText = copy.notice(formatPlain(limit), approver);
          body.append(createFeedback({
            kind: "alert",
            tone: "info",
            style: "subtle",
            title: copy.noticeTitle,
            description: limitText,
          }));
        }
      } else if (window.createOtp) {
        body.append(createOtp({
          title: copy.otpTitle,
          description: copy.otpDesc(phone),
          match,
          countdown: 40,
          lang,
          prompt: copy.prompt,
          resendLabel: copy.resend,
          resendIn: copy.resendIn,
          onComplete(code) {
            if (code === match && options.onConfirm) options.onConfirm(overlay);
          },
        }));
      }
      panel.append(body);

      const foot = el("footer", "ca-foot");
      if (step === "review") {
        const cancel = createButton({ label: copy.cancel, variant: "secondary", size: "lg" });
        const next = createButton({ label: copy.continue, variant: "primary", size: "lg" });
        cancel.addEventListener("click", () => {
          if (options.onCancel) options.onCancel(overlay);
          else overlay.setOpen(false);
        });
        next.addEventListener("click", () => {
          if (options.onContinue) options.onContinue(overlay);
          overlay.setStep("verify");
        });
        foot.append(cancel, next);
      } else {
        const back = createButton({ label: copy.back, variant: "secondary", size: "lg" });
        const submit = createButton({ label: copy.confirm, variant: "primary", size: "lg" });
        back.addEventListener("click", () => {
          if (options.onBack) options.onBack(overlay);
          overlay.setStep("review");
        });
        submit.addEventListener("click", () => {
          if (options.onConfirm) options.onConfirm(overlay);
        });
        foot.append(back, submit);
      }
      panel.append(foot);
      overlay.dataset.step = step;
      overlay.dataset.entering = "";
      requestAnimationFrame(() => overlay.removeAttribute("data-entering"));
    }

    overlay.setStep = (next) => {
      step = next === "verify" ? "verify" : "review";
      paint();
    };
    overlay.getStep = () => step;
    overlay.setOpen = (open) => {
      overlay.dataset.open = open ? "true" : "false";
    };
    scrim.addEventListener("click", () => {
      if (options.onCancel) options.onCancel(overlay);
    });
    paint();
    return overlay;
  }

  function createWaitingApproval(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const approver = options.approver || (lang === "ar" ? "فيصل أ." : "Faisal A.");
    const root = el("section", "ca-wait");
    scope(root, lang);
    if (window.createFeedback) {
      root.append(createFeedback({
        kind: "alert",
        tone: "info",
        style: "subtle",
        title: copy.waiting,
        description: copy.waitingDesc(approver),
      }));
    } else {
      root.append(el("h3", "ca-title", copy.waiting), el("p", "ca-lede", copy.waitingDesc(approver)));
    }
    if (window.createProgressChecklist) {
      root.append(createProgressChecklist({
        lang,
        title: copy.waiting,
        steps: [
          { title: copy.you, description: copy.youDesc, status: "done" },
          { title: copy.approver, description: copy.approverDesc(approver), status: "current" },
          { title: copy.sent, description: copy.sentDesc, status: "upcoming" },
        ],
      }));
    }
    return root;
  }

  function createBiometricConfirm(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const ios = options.platform !== "android";
    const button = createButton({
      label: ios ? copy.face : copy.finger,
      variant: "ink",
      size: options.size || "lg",
      icon: ios ? "face-id" : "fingerprint",
      block: options.block !== false,
    });
    scope(button, lang);
    if (options.onConfirm) button.addEventListener("click", () => options.onConfirm(button));
    return button;
  }

  function createWalletBadge(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const apple = options.wallet !== "google";
    const button = createButton({
      label: apple ? copy.apple : copy.google,
      variant: "ink",
      size: options.size || "md",
      icon: apple ? "cards" : "cards",
    });
    button.classList.add("ca-wallet");
    button.dataset.wallet = apple ? "apple" : "google";
    scope(button, lang);
    return button;
  }

  window.createConfirmDialog = createConfirmDialog;
  window.createWaitingApproval = createWaitingApproval;
  window.createBiometricConfirm = createBiometricConfirm;
  window.createWalletBadge = createWalletBadge;
})();
