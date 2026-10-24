(function () {
  const page = document.querySelector('[data-page="feedback"]');
  if (!page || !window.createFeedback) return;

  const s = {
    hidden: {},
    notifs: [0, 1, 2],
    nNext: 3,
    read: { 2: true, 4: true, 5: true },
    tab: 0,
    toasts: [],
    tNext: 1,
    snack: null,
    benes: [0, 1, 2],
    banner: 0,
    inbox: [0, 1, 2, 3],
    swiped: null,
  };

  const tones = ["success", "info", "warning", "error", "neutral"];
  const styles = ["subtle", "outline", "filled"];
  const alerts = {
    success: ["Payroll sent", "42 salaries are on their way. Most banks credit them within 2 hours.", "View report"],
    info: ["New: instant settlement", "Get POS sales in your account in seconds for 0.2% per sale.", "Turn on"],
    warning: ["Daily limit almost reached", "SAR 46,000 of SAR 50,000 used today. Limits reset at midnight.", "Request higher limit"],
    error: ["Transfer failed", "The beneficiary bank rejected the IBAN. No money left your account.", "Edit transfer"],
  };
  const tasks = [
    { tone: "warning", title: "Approve 3 transfers", desc: "SAR 48,200 waiting for your approval since 9:12 am.", primary: "Review", secondary: "Later", time: "now" },
    { tone: "info", title: "VAT certificate expiring", desc: "Upload the new certificate within 5 days to keep your limits.", primary: "Upload", secondary: "Dismiss", time: "12m" },
    { avatar: "OB", title: "Omar Bakr requested a card", desc: "Virtual card, SAR 5,000 monthly limit, Marketing.", primary: "Approve", secondary: "Decline", time: "1h" },
    { tone: "error", title: "POS terminal offline", desc: "Olaya · counter 2 has not connected for 2 hours.", primary: "Troubleshoot", secondary: "Dismiss", time: "2h" },
    { tone: "success", title: "Payroll ready to send", desc: "October salaries for 42 employees are checked and ready.", primary: "Send payroll", secondary: "Later", time: "3h" },
  ];
  const centerItems = [
    ["Today", 0, "warning", "Approve 3 transfers", "SAR 48,200 waiting since 9:12 am", "10:24"],
    ["Today", 1, "success", "Payment received", "SAR 1,250 from POS Olaya · counter 1", "10:02"],
    ["Today", 2, "info", "Statement ready", "September statement for SA57 •• 1951", "08:00"],
    ["Earlier", 3, "error", "Card payment declined", "Amazon SA · insufficient card limit", "Yesterday"],
    ["Earlier", 4, "success", "Payroll sent", "September salaries · 41 employees", "Mon"],
    ["Earlier", 5, "neutral", "New sign-in", "Chrome on macOS · Riyadh", "Sun"],
  ];
  const people = [
    ["KA", "Khalid Al-Harbi", "SA44 •• 7519"],
    ["NT", "Nour Trading", "SA03 •• 6080"],
    ["FM", "Faisal Motors", "SA12 •• 2433"],
  ];
  const banners = [
    ["Payment received", "SAR 1,250.00 from POS Olaya · counter 1"],
    ["Settlement arrived", "SAR 18,430.50 credited to SA57 •• 1951"],
    ["Card used abroad", "USD 84.00 at Uber, Dubai. Not you? Freeze the card."],
  ];
  const inboxItems = [
    ["warning", "Approve 2 transfers", "Before 3 pm to arrive today", "10:24", false],
    ["success", "Payment received", "SAR 1,250 from POS Olaya", "10:02", false],
    ["info", "New statement", "September · SA57 •• 1951", "08:00", true],
    ["error", "Card payment declined", "Amazon SA · card limit reached", "Mon", true],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-feedback="${name}"]`);
  }

  function icon(name) {
    const node = drawFeedbackIcon(name);
    return node;
  }

  function button(label, variant, onClick, glyph) {
    const node = createButton({ label, variant, size: "sm", icon: glyph || "" });
    node.addEventListener("click", onClick);
    return node;
  }

  function fillGuide() {
    const root = mount("guide");
    const head = el("div", "fb-table");
    ["Component", "Use for", "Where", "Duration", "Platform"].forEach((label) => head.append(el("span", "", label)));
    root.append(head);
    [
      ["Inline alert", "Something about this page or form: a problem, a limit, a requirement.", "In the page, near the cause", "Until fixed", "Web + mobile"],
      ["Page banner", "Account-wide or system-wide: maintenance, expiring CR.", "Top of the page", "Until fixed", "Web + mobile"],
      ["Notification", "A task that needs action: approvals, documents, offline POS.", "Top-right stack + center", "Until closed", "Web"],
      ["Toast", "Confirmation of what the user just did.", "Bottom-right", "4 s · 6 s with action", "Web"],
      ["Snackbar", "Confirmation on mobile, often with Undo.", "Bottom, above tab bar", "4 s", "Mobile"],
      ["In-app banner", "Something that happened in the background: payment received.", "Top of the screen", "4 s, swipe up", "Mobile"],
    ].forEach((cells) => {
      const row = el("div", "fb-guide");
      cells.forEach((text, index) => row.append(index ? el("span", "", text) : el("strong", "", text)));
      root.append(row);
    });
  }

  function fillTones() {
    const root = mount("tones");
    const swatch = {
      success: ["--status-success", "--status-success-tint", "--status-success-border", "--status-success-text"],
      info: ["--status-info", "--status-info-tint", "--status-info-border", "--status-info-text"],
      warning: ["--status-warning-solid", "--status-warning-tint", "--status-warning-border", "--status-warning-text"],
      error: ["--status-error", "--status-error-tint", "--status-error-track", "--status-error-text"],
      neutral: ["--surface-inverse", "--surface-sunken", "--border-default", "--text-primary"],
    };
    tones.forEach((tone) => {
      const card = el("div", "fb-tone");
      const name = el("div", "fb-tone-name", tone.charAt(0).toUpperCase() + tone.slice(1));
      const badge = el("span", "feedback");
      badge.dataset.kind = "tone";
      badge.dataset.tone = tone;
      const well = el("span", "feedback-well");
      const glyph = drawFeedbackIcon(tone === "neutral" ? "info" : tone);
      if (glyph) well.append(glyph);
      badge.append(well);
      name.prepend(badge);
      const grid = el("div", "fb-swatches");
      ["Solid", "Tint", "Border", "Text"].forEach((label, index) => {
        const item = el("div");
        const chip = el("span", "fb-swatch");
        chip.style.background = `var(${swatch[tone][index]})`;
        item.append(chip, el("span", "", label));
        grid.append(item);
      });
      card.append(name, grid);
      root.append(card);
    });
  }

  function fillAlertCols() {
    const root = mount("alert-cols");
    [
      ["Subtle", "Default. Inside pages and forms."],
      ["Outline", "On tinted or busy backgrounds."],
      ["Filled", "Highest urgency. One per page."],
    ].forEach(([title, copy]) => {
      const item = el("div");
      item.append(el("span", "fb-kicker", title), el("p", "", copy));
      root.append(item);
    });
  }

  function fillAlerts() {
    const root = mount("alerts");
    root.replaceChildren();
    Object.keys(alerts).forEach((tone) => {
      styles.forEach((style) => {
        const id = tone + style;
        if (s.hidden[id]) {
          root.append(el("div"));
          return;
        }
        root.append(createFeedback({
          kind: "alert",
          tone,
          style,
          title: alerts[tone][0],
          description: alerts[tone][1],
          action: alerts[tone][2],
          dismissible: true,
          onDismiss: () => {
            s.hidden[id] = true;
            fillAlerts();
          },
        }));
      });
    });
  }

  function fillCompact() {
    const root = mount("compact");
    [
      ["success", "CR verified with Wathq", ""],
      ["info", "Settlement arrives tomorrow, 9 am", "Change"],
      ["warning", "VAT certificate expires in 5 days", "Upload"],
      ["error", "IBAN must be 24 characters", ""],
    ].forEach(([tone, title, action]) => {
      root.append(createFeedback({ kind: "compact", tone, title, action }));
    });
  }

  function fillBanners() {
    const root = mount("banners");
    root.append(createFeedback({
      kind: "banner",
      tone: "warning",
      style: "inverse",
      title: "Scheduled maintenance",
      description: "· Transfers pause Friday 2:00–3:00 am. POS keeps working.",
      action: "Details",
      dismissible: true,
    }));
    root.append(createFeedback({
      kind: "banner",
      tone: "warning",
      icon: "invoicing",
      title: "Your CR expires in 12 days.",
      description: "Renew it on Wathq to keep transfers above SAR 50,000.",
      action: "Renew CR",
    }));
  }

  function taskNode(id) {
    const item = tasks[id % tasks.length];
    return createFeedback({
      kind: "notification",
      tone: item.tone || "neutral",
      title: item.title,
      description: item.desc,
      action: item.primary,
      secondary: item.secondary,
      time: item.time,
      avatar: item.avatar || "",
      dismissible: true,
      onDismiss: () => {
        s.notifs = s.notifs.filter((value) => value !== id);
        fillStack();
      },
      onSecondary: () => {
        s.notifs = s.notifs.filter((value) => value !== id);
        fillStack();
      },
    });
  }

  function fillStack() {
    const root = mount("stack");
    root.replaceChildren();
    const visible = s.notifs.slice(0, 3);
    if (!visible.length) {
      const empty = el("div", "fb-empty");
      const tile = el("span", "fb-empty-icon");
      const glyph = icon("success");
      if (glyph) tile.append(glyph);
      empty.append(tile, el("strong", "", "You're up to date"), el("span", "", "New tasks will stack here."));
      root.append(empty);
      return;
    }
    visible.forEach((id) => root.append(taskNode(id)));
    if (s.notifs.length > 3) root.append(el("span", "fb-more", `+${s.notifs.length - 3} more in notification center`));
  }

  function fillCenter() {
    const root = mount("center");
    root.replaceChildren();
    const unread = centerItems.filter((item) => !s.read[item[1]]).length;
    const head = el("div", "fb-center-head");
    const tabs = el("div", "fb-tabs");
    [["All", 0], ["Unread", 1]].forEach(([label, index]) => {
      const tab = el("button", "fb-tab", index ? `${label} ${unread}` : label);
      tab.type = "button";
      tab.setAttribute("aria-selected", s.tab === index ? "true" : "false");
      tab.addEventListener("click", () => {
        s.tab = index;
        fillCenter();
      });
      tabs.append(tab);
    });
    const mark = el("button", "fb-mark", "Mark all read");
    mark.type = "button";
    mark.disabled = unread === 0;
    mark.addEventListener("click", () => {
      centerItems.forEach((item) => { s.read[item[1]] = true; });
      fillCenter();
    });
    head.append(tabs, mark);
    root.append(head);
    const shown = centerItems.filter((item) => s.tab === 0 || !s.read[item[1]]);
    if (!shown.length) {
      const empty = el("div", "fb-empty");
      empty.style.padding = "var(--space-10)";
      const tile = el("span", "fb-empty-icon");
      const glyph = icon("confirm");
      if (glyph) tile.append(glyph);
      empty.append(tile, el("strong", "", "No unread notifications"), el("span", "", "Switch to All to see earlier ones."));
      root.append(empty);
    }
    ["Today", "Earlier"].forEach((group) => {
      const items = shown.filter((item) => item[0] === group);
      if (!items.length) return;
      root.append(el("div", "fb-group", group));
      items.forEach(([, id, tone, title, desc, time]) => {
        const row = createFeedback({
          kind: "inbox",
          tone,
          title,
          description: desc,
          time,
          unread: !s.read[id],
          onActivate: () => {
            s.read[id] = true;
            fillCenter();
          },
        });
        root.append(row);
      });
    });
    const foot = el("div", "fb-center-foot");
    foot.append(el("span", "", "View all activity"), el("span", "", "Notification settings"));
    root.append(foot);
  }

  function fireToast(tone, title, description, action, options = {}) {
    const id = s.tNext;
    s.tNext += 1;
    const dur = options.dur ?? (tone === "error" ? 0 : action ? 6000 : 4000);
    s.toasts = [...s.toasts, {
      id, tone, title, description, action: action || "", at: Date.now(), dur, loading: !!options.loading, paused: false,
    }].slice(-3);
    syncToasts();
    return id;
  }

  function syncToasts() {
    const host = mount("toasts");
    const now = Date.now();
    s.toasts = s.toasts.filter((item) => item.dur === 0 || item.paused || now - item.at < item.dur);
    const signature = s.toasts.map((item) => `${item.id}:${item.tone}:${item.loading}:${item.title}`).join("|");
    if (host.dataset.signature !== signature) {
      host.dataset.signature = signature;
      host.replaceChildren();
      s.toasts.forEach((item) => {
        const node = createFeedback({
          kind: "toast",
          tone: item.tone,
          title: item.title,
          description: item.description,
          action: item.action,
          loading: item.loading,
          dismissible: true,
          onDismiss: () => {
            s.toasts = s.toasts.filter((toast) => toast.id !== item.id);
            syncToasts();
          },
        });
        node.dataset.id = String(item.id);
        node.addEventListener("mouseenter", () => {
          if (!item.dur || item.paused) return;
          item.rem = item.dur - (Date.now() - item.at);
          item.paused = true;
          node.dataset.paused = "true";
        });
        node.addEventListener("mouseleave", () => {
          if (!item.paused) return;
          item.paused = false;
          item.at = Date.now() - (item.dur - (item.rem ?? item.dur));
          delete node.dataset.paused;
        });
        host.append(node);
      });
    }
    s.toasts.forEach((item) => {
      const node = host.querySelector(`[data-id="${item.id}"]`);
      if (!node) return;
      const left = !item.dur || item.paused ? 0 : Math.max(0, 1 - (Date.now() - item.at) / item.dur);
      node.style.setProperty("--feedback-progress", String(left));
    });
  }

  function fillToastButtons() {
    const root = mount("toast-buttons");
    [
      ["Success", "--status-success", () => fireToast("success", "Beneficiary added", "Khalid Al-Harbi · Al Rajhi Bank")],
      ["With action", "--status-success", () => fireToast("success", "Invoice sent", "INV-2041 to Nour Trading", "Copy link")],
      ["Info", "--status-info", () => fireToast("info", "Export started", "We'll email the CSV when it's ready.")],
      ["Error", "--status-error", () => fireToast("error", "Couldn't freeze card", "Check your connection and try again.", "Retry")],
      ["Loading → success", "--text-disabled", () => {
        const id = fireToast("neutral", "Sending SAR 25,000…", "To Nour Trading · SNB", "", { loading: true, dur: 0 });
        setTimeout(() => {
          s.toasts = s.toasts.map((item) => (item.id === id
            ? { ...item, tone: "success", title: "SAR 25,000 sent", description: "Arrives within minutes.", loading: false, at: Date.now(), dur: 4000 }
            : item));
          syncToasts();
        }, 1600);
      }],
    ].forEach(([label, token, fire]) => {
      const node = button(label, "secondary", fire);
      const dot = el("span", "fb-dot");
      dot.style.setProperty("--fb-dot", `var(${token})`);
      node.prepend(dot);
      root.append(node);
    });
  }

  function fillToastStatic() {
    const root = mount("toast-static");
    [
      ["Default", "success", "Changes saved", ""],
      ["With action", "success", "Card frozen", "Undo"],
      ["Info", "info", "Statement is generating", ""],
      ["Error · stays", "error", "Upload failed", "Retry"],
    ].forEach(([label, tone, title, action]) => {
      const item = el("div");
      item.append(el("span", "fb-kicker", label), createFeedback({ kind: "toast", tone, title, action, dismissible: true }));
      root.append(item);
    });
  }

  function showSnack(message, glyph, undo) {
    s.snack = { message, glyph, undo, at: Date.now() };
    fillSnack();
  }

  function fillPeople() {
    const root = mount("people");
    root.replaceChildren();
    if (!s.benes.length) {
      root.append(el("span", "fb-help", "No beneficiaries. Undo to bring them back."));
      return;
    }
    s.benes.forEach((id) => {
      const [initials, name, iban] = people[id];
      const row = el("div", "fb-person");
      const copy = el("div");
      copy.append(el("strong", "", name), el("span", "", iban));
      const copyBtn = el("button", "fb-icon-btn");
      copyBtn.type = "button";
      copyBtn.setAttribute("aria-label", "Copy IBAN");
      const copyIcon = icon("copy");
      if (copyIcon) copyBtn.append(copyIcon);
      copyBtn.addEventListener("click", () => showSnack("IBAN copied", "confirm"));
      const deleteBtn = el("button", "fb-icon-btn");
      deleteBtn.type = "button";
      deleteBtn.dataset.danger = "true";
      deleteBtn.setAttribute("aria-label", "Delete");
      const deleteIcon = icon("delete");
      if (deleteIcon) deleteBtn.append(deleteIcon);
      deleteBtn.addEventListener("click", () => {
        const previous = s.benes.slice();
        s.benes = s.benes.filter((value) => value !== id);
        fillPeople();
        showSnack(`${name} deleted`, "delete", previous);
      });
      const avatar = el("span", "fb-avatar", initials);
      row.append(avatar, copy, copyBtn, deleteBtn);
      root.append(row);
    });
  }

  function fillSnack() {
    const root = mount("snack");
    root.replaceChildren();
    if (!s.snack) return;
    const left = Math.max(0, 1 - (Date.now() - s.snack.at) / 4000);
    if (left === 0) {
      s.snack = null;
      return;
    }
    const node = createFeedback({
      kind: "snackbar",
      tone: "success",
      title: s.snack.message,
      icon: s.snack.glyph,
      action: s.snack.undo ? "Undo" : "",
      progress: left,
      onAction: () => {
        if (s.snack && s.snack.undo) s.benes = s.snack.undo;
        s.snack = null;
        fillPeople();
        fillSnack();
      },
    });
    root.append(node);
  }

  function fillPush() {
    const root = mount("push");
    root.replaceChildren();
    const [title, description] = banners[s.banner];
    root.append(createFeedback({
      kind: "push",
      tone: "success",
      title,
      description,
      time: "now",
      avatar: "H",
    }));
  }

  function fillMobileAlerts() {
    const root = mount("mobile-alerts");
    const warning = createFeedback({
      kind: "alert",
      tone: "warning",
      title: "2 transfers need approval",
      description: "before 3 pm to arrive today.",
      action: "Review now",
    });
    const success = createFeedback({
      kind: "compact",
      tone: "success",
      title: "Your account is fully verified.",
    });
    root.append(warning, success);
  }

  function fillInbox() {
    const root = mount("inbox");
    root.replaceChildren();
    if (!s.inbox.length) {
      const empty = el("div", "fb-empty");
      empty.style.padding = "var(--space-10) var(--space-4)";
      const tile = el("span", "fb-empty-icon");
      const glyph = icon("inbox");
      if (glyph) tile.append(glyph);
      empty.append(tile, el("strong", "", "Inbox zero"), el("span", "", "Nothing needs your attention."));
      empty.append(button("Restore demo", "tonal", () => {
        s.inbox = [0, 1, 2, 3];
        s.swiped = null;
        fillInbox();
      }));
      root.append(empty);
      return;
    }
    s.inbox.forEach((id) => {
      const [tone, title, desc, time, read] = inboxItems[id];
      const wrap = el("div", "fb-swipe");
      const done = el("span", "fb-done", "Done");
      const glyph = icon("confirm");
      if (glyph) done.prepend(glyph);
      const row = createFeedback({
        kind: "inbox",
        tone,
        title,
        description: desc,
        time,
        unread: !read,
        onActivate: () => {
          if (s.swiped === id) {
            s.inbox = s.inbox.filter((value) => value !== id);
            s.swiped = null;
          } else {
            s.swiped = id;
          }
          fillInbox();
        },
      });
      if (s.swiped === id) row.dataset.swiped = "true";
      wrap.append(done, row);
      root.append(wrap);
    });
  }

  function fillActions() {
    const root = mount("actions");
    if (!root) return;
    root.append(
      createFeedback({
        kind: "notification",
        tone: "warning",
        title: "Approve 3 transfers",
        description: "SAR 48,200 waiting for your approval since 9:12 am.",
        action: "Review",
        secondary: "Later",
        time: "now",
      }),
      createFeedback({
        kind: "notification",
        tone: "warning",
        title: "Approve 3 transfers",
        description: "SAR 48,200 waiting for your approval since 9:12 am.",
        action: "Add details",
        secondary: "Dismiss",
        time: "now",
      }),
    );
  }

  function fillArabic() {
    const root = mount("arabic");
    if (!root) return;
    const wrap = el("div", "fb-alerts");
    wrap.dir = "rtl";
    wrap.lang = "ar";
    wrap.style.fontFamily = "var(--font-arabic)";
    wrap.append(
      createFeedback({
        kind: "alert",
        tone: "warning",
        title: "تجديد السجل",
        description: "ينتهي سجلك التجاري خلال 12 يوماً. جدّده عبر واثق لتبقى التحويلات فوق 50,000 متاحة.",
      }),
      createFeedback({
        kind: "alert",
        tone: "error",
        title: "فشل التحويل",
        description: "رفض بنك المستفيد رقم الآيبان. لم يُخصم أي مبلغ من حسابك.",
        action: "تعديل التحويل",
      }),
      createFeedback({
        kind: "notification",
        tone: "warning",
        title: "اعتماد 3 تحويلات",
        description: "بانتظار اعتمادك 48,200 منذ 9:12 ص.",
        action: "مراجعة",
        secondary: "لاحقاً",
        time: "الآن",
      }),
    );
    root.append(wrap);
  }

  function fillRules() {
    const root = mount("rules");
    [
      ["Say what happened and what to do next: “Transfer failed. Edit the IBAN and try again.”", "Use a toast for something the user must act on. Use a notification or an inline alert."],
      ["Let errors stay until the user closes them or fixes the cause.", "Make error messages disappear on a timer."],
      ["Show at most 3 notifications or toasts at once; older ones move to the notification centre.", "Stack a snackbar on top of a bottom sheet or the keyboard; wait until it closes."],
      ["Use role=\"alert\" for errors and role=\"status\" for everything else, so screen readers announce them.", "Rely on colour alone. Every tone has its own icon."],
    ].forEach(([yes, no], index) => {
      const card = el("div", "lst-rule");
      card.append(el("span", "lst-kicker", String(index + 1).padStart(2, "0")));
      [[true, yes], [false, no]].forEach(([ok, text]) => {
        const line = el("div", "lst-rule-line");
        line.dataset.ok = ok ? "true" : "false";
        line.append(el("strong", "", ok ? "Do" : "Don't"), el("p", "", text));
        card.append(line);
      });
      root.append(card);
    });
  }

  fillGuide();
  fillTones();
  fillAlertCols();
  fillAlerts();
  fillCompact();
  fillBanners();
  fillStack();
  fillCenter();
  fillToastButtons();
  fillToastStatic();
  fillPeople();
  fillSnack();
  fillPush();
  fillMobileAlerts();
  fillInbox();
  fillActions();
  fillArabic();
  fillRules();

  mount("reset-alerts").append(button("Show closed alerts", "secondary", () => {
    s.hidden = {};
    fillAlerts();
  }));
  mount("add-task").append(button("New task", "ink", () => {
    s.notifs = [s.nNext, ...s.notifs];
    s.nNext += 1;
    fillStack();
  }, "add"));
  mount("clear-tasks").append(button("Close all", "secondary", () => {
    s.notifs = [];
    fillStack();
  }));
  mount("simulate").append(button("Simulate payment", "secondary", () => {
    s.banner = (s.banner + 1) % banners.length;
    fillPush();
  }));

  setInterval(() => {
    if (s.toasts.length) syncToasts();
    if (s.snack) fillSnack();
  }, 100);
})();
