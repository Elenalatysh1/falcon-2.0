/**
 * Text area. Load lucide UMD and button.js, then this script.
 *
 * createTextArea({ label, value, placeholder, hint, optional, maxLength, state, error, count, tone, caret, lock, grip, visual, minRows, maxRows, grow, resize, dir })
 * createTextAreaStates()
 * createTextAreaLive()
 * createTextAreaAnatomy()
 * createRejectNote()
 * createCommentComposer()
 * createTermsArea()
 * createArabicArea()
 * createCardRequestPhone()
 * createSupportComposer()
 *
 * The field grows from 3 to 8 lines, then scrolls. The counter appears at
 * 80% of the limit. Errors show after the field is left, not while typing.
 */
(function () {
  const LINE = {
    min: 3,
    max: 8,
    near: 0.8,
  };

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size) {
    const lucide = window.lucide;
    if (!lucide || !name) return null;
    const node = lucide.icons[pascal(name)];
    if (!node) return null;
    const svg = lucide.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = name;
    if (size) svg.dataset.size = size;
    svg.style.strokeWidth = "var(--icon-stroke)";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function liveBadge(label) {
    return el("span", "ta-live", label || "Live");
  }

  function button(label, variant, extra) {
    const node = window.createButton
      ? createButton({ label, variant, size: "xs", ...(extra || {}) })
      : el("button", "", label);
    node.type = "button";
    return node;
  }

  function fit(area) {
    const style = getComputedStyle(area);
    const line = parseFloat(style.lineHeight) || 0;
    const min = line * (Number(area.dataset.min) || LINE.min);
    const max = line * (Number(area.dataset.max) || LINE.max);
    area.style.height = "auto";
    const next = Math.min(max, Math.max(min, area.scrollHeight));
    area.style.height = `${next}px`;
    area.style.overflowY = area.scrollHeight > max + 1 ? "auto" : "hidden";
  }

  function createTextArea(options = {}) {
    const {
      label = "",
      value = "",
      placeholder = "",
      hint = "",
      optional = false,
      maxLength = 0,
      state = "",
      error = "",
      count = "",
      tone = "",
      caret = false,
      lock = false,
      grip = true,
      visual = false,
      showCount = "auto",
      minRows = LINE.min,
      maxRows = LINE.max,
      grow = false,
      resize = "",
      dir = "",
      onChange,
      onBlur,
    } = options;

    const root = el("div", "ta-field");
    if (state) root.dataset.state = state;
    if (error) root.dataset.error = "true";
    const box = el(visual ? "div" : "label", "ta-box");
    const labelNode = el("span", "ta-label", label);
    if (optional) labelNode.append(el("span", "ta-opt", "· optional"));
    box.append(labelNode);

    let area = null;
    if (visual) {
      const shown = value || placeholder;
      const text = el("span", "ta-value", shown);
      if (!value && placeholder) text.dataset.placeholder = "true";
      if (caret) text.append(el("span", "ta-caret"));
      box.append(text);
    } else {
      area = document.createElement("textarea");
      area.className = "ta-area";
      area.rows = minRows;
      area.dataset.min = String(minRows);
      area.dataset.max = String(maxRows);
      if (placeholder) area.placeholder = placeholder;
      if (dir) area.dir = dir;
      if (resize) area.dataset.resize = resize;
      area.value = value;
      box.append(area);
    }
    if (lock) {
      const mark = el("span", "ta-lock");
      const glyph = icon("lock", "inline");
      if (glyph) mark.append(glyph);
      box.append(mark);
    }
    if (visual && grip && state !== "disabled" && state !== "readonly") box.append(el("span", "ta-grip"));

    const meta = el("div", "ta-meta");
    const hintNode = el("p", "ta-hint", error || hint);
    const countNode = el("p", "ta-count", count);
    if (count) {
      countNode.dataset.show = "true";
      if (tone) countNode.dataset.tone = tone;
    }
    meta.append(hintNode, countNode);
    root.append(box, meta);

    if (!area) return root;

    let focused = false;
    let touched = false;

    function paint(next) {
      const length = next.length;
      const over = maxLength > 0 && length > maxLength;
      const near = maxLength > 0 && length >= maxLength * LINE.near;
      const showError = over && (touched || !focused);
      root.dataset.error = showError ? "true" : "false";
      area.setAttribute("aria-invalid", showError ? "true" : "false");
      hintNode.textContent = showError
        ? `${length - maxLength} characters too long. Shorten it to send.`
        : hint;
      if (maxLength) {
        countNode.textContent = `${length} / ${maxLength}`;
        countNode.dir = "ltr";
        countNode.dataset.show = showCount === "always" || near ? "true" : "false";
        countNode.dataset.tone = over ? "over" : near ? "warn" : "";
      }
      if (grow) fit(area);
    }

    area.addEventListener("focus", () => {
      focused = true;
      paint(area.value);
    });
    area.addEventListener("blur", () => {
      focused = false;
      touched = true;
      paint(area.value);
      if (onBlur) onBlur(area.value);
    });
    area.addEventListener("input", () => {
      paint(area.value);
      if (onChange) onChange(area.value);
    });
    root.taSet = (next, markTouched) => {
      area.value = next;
      if (markTouched) touched = true;
      paint(next);
      if (onChange) onChange(next);
    };
    root.taValue = () => area.value;
    root.taFocus = () => area;
    paint(value);
    if (grow) requestAnimationFrame(() => fit(area));
    return root;
  }

  function createTextAreaStates() {
    const grid = el("div", "ta-states");
    const rows = [
      ["Default · empty", "Reason for card", "", "Tell your manager what the card is for", true, "", "Shown to the approver", "", ""],
      ["Hover", "Reason for card", "", "Tell your manager what the card is for", true, "hover", "Web only", "", ""],
      ["Focused · typing", "Reason for card", "Google Ads and Meta campaigns for Q4", "", false, "focus", "Shown to the approver", "", ""],
      ["Filled", "Reason for card", "Google Ads and Meta campaigns for Q4.\nMonthly budget around SAR 4,000.", "", false, "filled", "Shown to the approver", "", ""],
      ["Near limit", "Note to beneficiary", "Payment for invoice INV-2041 and the October delivery to Olaya, Malqa and Jeddah", "", false, "focus", "Appears on their statement", "128 / 140", "warn"],
      ["Error", "Reason for rejecting", "", "", false, "error", "Add a reason so Omar knows what to fix.", "0 / 500", "over"],
      ["Disabled", "Invoice terms", "Payment due within 30 days.", "", false, "disabled", "Set by your admin", "", ""],
      ["Read only", "Approver comment", "Approved. Please attach the receipt by Thursday.", "", false, "readonly", "Omar Bakr · 14 Oct, 11:20", "", ""],
    ];
    rows.forEach(([kicker, label, value, placeholder, optional, state, hint, count, tone]) => {
      const card = el("div", "ta-state");
      card.append(el("span", "ta-overline", kicker));
      card.append(createTextArea({
        label,
        value,
        placeholder,
        optional,
        hint,
        state,
        error: state === "error" ? hint : "",
        count,
        tone,
        caret: state === "focus" && kicker.startsWith("Focused"),
        lock: state === "readonly",
        grip: state !== "disabled" && state !== "readonly",
        visual: true,
      }));
      grid.append(card);
    });
    return grid;
  }

  function createTextAreaLive() {
    const root = el("div", "ta-stage");
    const head = el("div", "ta-head");
    head.append(el("span", "ta-kicker", "Transfer note · max 140"), liveBadge("Live · type"));
    const field = createTextArea({
      label: "Note to beneficiary",
      value: "Payment for invoice INV-2041. ",
      placeholder: "e.g. Invoice INV-2041, October rent",
      hint: "Appears on their bank statement. Optional.",
      maxLength: 140,
      grow: true,
    });
    const samples = [
      ["Short", "Rent October"],
      ["Near limit", "Payment for invoice INV-2041 and the October delivery to Olaya, Malqa and Jeddah branches. Thank you."],
      ["Too long", "Payment for invoice INV-2041 and the October delivery to our Olaya, Malqa and Jeddah branches, including assembly and two extra chairs. Thank you for the quick service."],
      ["Clear", ""],
    ];
    const tryRow = el("div", "ta-try");
    tryRow.append(el("span", "", "Try:"));
    samples.forEach(([label, value]) => {
      const chip = button(label, "secondary");
      chip.addEventListener("click", () => field.taSet(value, true));
      tryRow.append(chip);
    });
    root.append(head, field, tryRow);
    return root;
  }

  function createTextAreaAnatomy() {
    const root = el("div", "ta-stage");
    root.append(el("span", "ta-kicker", "Anatomy"));
    [
      ["1", "Container", "1 px border, radius 8, padding 10 14. Min 3 lines."],
      ["2", "Label", "11 px inside the top. \"· optional\" when not required."],
      ["3", "Text", "15 / 24. Placeholder shows an example."],
      ["4", "Resize", "Auto-grow 3 to 8 lines on web and mobile. Manual grip only in admin tools."],
      ["5", "Helper", "12.5 px below, left. Replaced by the error message."],
      ["6", "Counter", "Mono, right. Shows from 80% of the limit; amber, then red."],
      ["7", "Focus", "1.5 px ink border and a 3 px soft ring."],
    ].forEach(([number, name, copy]) => {
      const row = el("div", "ta-anatomy");
      row.append(el("span", "ta-num", number), el("strong", "", name), el("span", "", copy));
      root.append(row);
    });
    return root;
  }

  function createRejectNote() {
    const root = el("div", "ta-stage");
    const head = el("div", "ta-head");
    head.append(el("span", "ta-kicker", "Reject approval · quick reasons"), liveBadge("Live"));
    const dialog = el("div", "ta-dialog");
    dialog.append(el("h3", "", "Reject transfer to Nour Trading?"), el("p", "", "SAR 25,000.00 · requested by Omar Bakr"));
    const reasons = ["Wrong amount", "Missing invoice", "Not in budget"];
    let value = "";
    let tried = false;
    let done = false;
    const chips = el("div", "ta-chips");
    const field = createTextArea({
      label: "Reason · required",
      placeholder: "Tell Omar what to change",
      hint: "Pick a quick reason or write your own.",
      minRows: 3,
      maxRows: 6,
      grow: true,
      onChange: (next) => {
        value = next;
        done = false;
        paint();
      },
    });
    const actions = el("div", "ta-actions");
    const cancel = button("Cancel", "secondary", { size: "md" });
    const reject = button("Reject transfer", "destructive", { size: "md" });
    cancel.addEventListener("click", () => {
      value = "";
      tried = false;
      done = false;
      field.taSet("", false);
      paint();
    });
    reject.addEventListener("click", () => {
      if (!value.trim()) {
        tried = true;
        done = false;
      } else {
        done = true;
        tried = false;
      }
      paint();
    });
    actions.append(cancel, reject);

    function paint() {
      [...chips.children].forEach((chip) => {
        chip.setAttribute("aria-pressed", value.startsWith(chip.textContent) ? "true" : "false");
      });
      const hint = field.querySelector(".ta-hint");
      field.dataset.success = done ? "true" : "false";
      field.dataset.error = tried && !value.trim() ? "true" : "false";
      if (done) hint.textContent = "Rejected. Omar was notified with your reason.";
      else if (tried && !value.trim()) hint.textContent = "Add a reason so Omar knows what to fix.";
      else hint.textContent = "Pick a quick reason or write your own.";
    }

    reasons.forEach((label) => {
      const chip = el("button", "ta-chip", label);
      chip.type = "button";
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", () => {
        value = `${label}. `;
        done = false;
        tried = false;
        field.taSet(value, false);
        paint();
      });
      chips.append(chip);
    });
    dialog.append(chips, field, actions);
    root.append(head, dialog);
    return root;
  }

  function createCommentComposer() {
    const root = el("div", "ta-stage");
    const head = el("div", "ta-head");
    head.append(el("span", "ta-kicker", "Comment · toolbar + attach"), liveBadge("Live · ⌘ Enter"));
    const thread = el("div", "ta-thread");
    const comments = [{
      name: "Omar Bakr", initials: "OB", tone: "warning", time: "11:20",
      text: "Receipt attached. This was for the Q4 campaign kickoff.",
    }];
    let draft = "";
    const composer = el("div", "ta-composer");
    const area = document.createElement("textarea");
    area.className = "ta-area";
    area.rows = 2;
    area.dataset.min = "2";
    area.dataset.max = "6";
    area.placeholder = "Write a comment… use @ to mention";
    const tools = el("div", "ta-tools");
    const send = el("button", "ta-send");
    send.type = "button";
    send.setAttribute("aria-label", "Send");
    send.append(document.createTextNode("Send"));
    const plane = icon("send", "inline");
    if (plane) send.append(plane);

    function paintThread() {
      thread.replaceChildren();
      comments.forEach((comment) => {
        const row = el("div", "ta-comment");
        const avatar = el("span", "ta-avatar", comment.initials);
        avatar.dataset.tone = comment.tone;
        const bubble = el("div", "ta-bubble");
        const who = el("strong", "", comment.name);
        who.append(el("span", "", ` · ${comment.time}`));
        bubble.append(who, el("p", "", comment.text));
        row.append(avatar, bubble);
        thread.append(row);
      });
    }

    function paintSend() {
      const ready = draft.trim().length > 0;
      send.dataset.ready = ready ? "true" : "false";
      send.setAttribute("aria-disabled", ready ? "false" : "true");
      fit(area);
    }

    function insert(text) {
      const start = area.selectionStart ?? draft.length;
      const end = area.selectionEnd ?? draft.length;
      draft = draft.slice(0, start) + text + draft.slice(end);
      area.value = draft;
      const caret = start + text.length;
      paintSend();
      area.focus();
      area.setSelectionRange(caret, caret);
    }

    function submit() {
      if (!draft.trim()) return;
      comments.push({
        name: "Abdulaziz Ali",
        initials: "AA",
        tone: "info",
        time: "now",
        text: draft.trim(),
      });
      draft = "";
      area.value = "";
      paintThread();
      paintSend();
      area.focus();
    }

    [
      ["Mention", "at-sign", "@Omar "],
      ["Attach", "paperclip", "[receipt.pdf] "],
      ["Emoji", "smile", "👍 "],
      ["Bullet list", "list", "\n• "],
    ].forEach(([label, name, text]) => {
      const tool = el("button", "ta-tool");
      tool.type = "button";
      tool.setAttribute("aria-label", label);
      tool.title = label;
      const glyph = icon(name, "inline");
      if (glyph) tool.append(glyph);
      tool.addEventListener("click", () => insert(text));
      tools.append(tool);
    });
    send.addEventListener("click", submit);
    area.addEventListener("input", () => {
      draft = area.value;
      paintSend();
    });
    area.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    });
    tools.append(send);
    composer.append(area, tools);
    paintThread();
    paintSend();
    root.append(head, thread, composer);
    return root;
  }

  function createTermsArea() {
    const root = el("div", "ta-stage");
    root.append(el("span", "ta-kicker", "Fixed height · invoice terms"));
    const text = `1. Payment due within 30 days of the invoice date.
2. Late payments incur a 2% monthly fee.
3. Goods remain the property of Khamis Arabia until paid in full.
4. Disputes are handled under the laws of the Kingdom of Saudi Arabia.
5. Prices include 15% VAT unless stated otherwise.
6. Returns are accepted within 14 days in original packaging.`;
    root.append(createTextArea({
      label: "Terms and conditions",
      value: text,
      minRows: 6,
      maxRows: 12,
      resize: "vertical",
      hint: "For long, saved text people edit rarely. Fixed 6 lines, scrolls, the user can drag to resize vertically.",
    }));
    return root;
  }

  function createArabicArea() {
    const root = el("div", "ta-stage");
    root.dir = "rtl";
    const kicker = el("span", "ta-kicker", "Arabic · RTL");
    kicker.dir = "ltr";
    const text = "دفعة الفاتورة INV-2041 لشهر أكتوبر";
    const field = createTextArea({
      label: "ملاحظة للمستفيد",
      value: text,
      dir: "auto",
      maxLength: 140,
      showCount: "always",
      hint: "تظهر في كشف حساب المستفيد",
    });
    field.dir = "rtl";
    field.lang = "ar";
    const note = el("p", "ta-note", "استخدم dir=\"auto\" ليتبع اتجاه النص لغة الكتابة. حجم الخط 16 وارتفاع السطر 28.");
    note.dir = "rtl";
    note.lang = "ar";
    root.append(kicker, field, note);
    return root;
  }

  function createCardRequestPhone() {
    const root = el("div", "ta-stage ta-phone-card");
    const head = el("div", "ta-head");
    head.append(el("span", "ta-kicker", "Form field · keyboard open"), liveBadge("Live · tap field"));
    const phone = el("div", "ta-phone");
    let open = false;
    const body = el("div", "ta-phone-body");
    const type = el("div", "ta-fake");
    type.append(el("span", "", "Card type"), el("strong", "", "Virtual"));
    const limit = el("div", "ta-fake");
    const amount = el("strong", "", "SAR 5,000");
    amount.dataset.mono = "true";
    limit.append(el("span", "", "Monthly limit"), amount);
    const field = el("button", "ta-phone-field");
    field.type = "button";
    const why = el("small", "", "Why do you need it?");
    const answer = el("span", "", "e.g. Ad spend for Q4 campaigns");
    field.append(why, answer);
    const meta = el("div", "ta-meta");
    const hint = el("p", "ta-hint", "Your manager sees this");
    const count = el("p", "ta-count", "");
    meta.append(hint, count);
    body.append(type, limit, field, meta);
    const foot = el("div", "ta-phone-foot");
    foot.append(el("div", "ta-continue", "Continue"));
    const keys = el("div", "ta-keys");
    const bar = el("div", "ta-keys-bar");
    const done = el("button", "", "Done");
    done.type = "button";
    bar.append(el("span", "", "Marketing"), el("span", "", "campaigns"), done);
    keys.append(bar);
    ["qwertyuiop", "asdfghjkl", "zxcvbnm"].forEach((row) => {
      const line = el("div", "ta-key-row");
      row.split("").forEach((key) => line.append(el("span", "", key)));
      keys.append(line);
    });

    function paint() {
      phone.dataset.open = open ? "true" : "false";
      field.setAttribute("aria-expanded", open ? "true" : "false");
      answer.textContent = open ? "Marketing campaigns" : "e.g. Ad spend for Q4 campaigns";
      answer.dataset.placeholder = open ? "false" : "true";
      answer.replaceChildren(document.createTextNode(answer.textContent));
      if (open) answer.append(el("span", "ta-caret"));
      count.textContent = open ? "19 / 300" : "";
      count.dataset.show = open ? "true" : "false";
      if (open) phone.append(keys);
      else keys.remove();
    }

    function toggle() {
      open = !open;
      paint();
    }
    field.addEventListener("click", toggle);
    done.addEventListener("click", toggle);
    const barTop = el("div", "ta-phone-bar");
    const back = el("span", "ta-back");
    const chevron = icon("chevron-left");
    if (chevron) back.append(chevron);
    barTop.append(back, el("h3", "ta-phone-title", "Request a card"));
    phone.append(barTop, body, foot);
    paint();
    root.append(head, phone);
    return root;
  }

  function createSupportComposer() {
    const root = el("div", "ta-stage ta-phone-card");
    root.append(el("span", "ta-kicker", "Chat composer · support"));
    const phone = el("div", "ta-phone");
    const bar = el("div", "ta-chat-bar");
    bar.append(el("span", "ta-support", "H"));
    const who = el("div", "ta-who");
    who.append(el("strong", "", "Hala support"), el("span", "", "Replies in about 2 min"));
    bar.append(who);
    const chat = el("div", "ta-chat");
    const them = el("p", "ta-msg", "Hi Abdulaziz, how can we help today?");
    them.dataset.side = "them";
    const me = el("p", "ta-msg", "A card payment to Careem shows twice on my statement.");
    me.dataset.side = "me";
    chat.append(them, me);
    const compose = el("div", "ta-compose");
    const add = el("span", "ta-round");
    add.dataset.tone = "sunken";
    const plus = icon("plus");
    if (plus) add.append(plus);
    const pill = el("div", "ta-pill", "It was on 13 Oct at 22:10, the amount is 38.50 each time. Can you check and refund one of them?");
    const send = el("span", "ta-round");
    send.dataset.tone = "brand";
    const plane = icon("send");
    if (plane) send.append(plane);
    compose.append(add, pill, send);
    phone.append(bar, chat, compose);
    root.append(phone, el("p", "ta-note", "Pill-shaped, grows to 5 lines. Send is active only when there is text. Return adds a new line; Send sends."));
    return root;
  }

  window.createTextArea = createTextArea;
  window.createTextAreaStates = createTextAreaStates;
  window.createTextAreaLive = createTextAreaLive;
  window.createTextAreaAnatomy = createTextAreaAnatomy;
  window.createRejectNote = createRejectNote;
  window.createCommentComposer = createCommentComposer;
  window.createTermsArea = createTermsArea;
  window.createArabicArea = createArabicArea;
  window.createCardRequestPhone = createCardRequestPhone;
  window.createSupportComposer = createSupportComposer;
})();
