/**
 * Text fields, password, OTP, select, combobox, multi-select, and file upload.
 * Load vendor/hala-icons.js, then this script.
 *
 * createInput({
 *   label, value, hint, placeholder, error, success,
 *   disabled, readOnly, type, size, shape, mono, float,
 *   prefix, suffix, kbd, leadingIcon, trailingIcon, trailingTone,
 *   state, fill, mask, strength, format, phone, iban, amount,
 *   maxLength, rows, validate, onChange
 * })
 *
 * createOtp({ length, value, title, description, match, verified, wrong, countdown, status, active, interactive })
 * createSelect({ kind, label, value, options, placeholder, limit, emptyTitle, emptyHint, emptyLabel, countLabel })
 *   combobox options: { value, label, code, initials, mark } — mark is a bank id or "contact" for a person.
 * createUpload({ state, title, browse, hint, file, progress, meta })
 *
 * size: lg | md | sm
 * state: empty | hover | focus | filled | error | success | disabled | readonly
 */
(function () {
  const catalog = {
    alert: "circle-alert",
    calendar: "calendar",
    close: "x",
    confirm: "check",
    copy: "copy",
    expand: "chevron-down",
    hide: "eye-off",
    lock: "lock",
    search: "search",
    show: "eye",
    upload: "upload",
  };

  const passwordRules = [
    [(value) => value.length >= 8, "8+ characters"],
    [(value) => /[A-Z]/.test(value), "One uppercase"],
    [(value) => /\d/.test(value), "One number"],
    [(value) => /[^A-Za-z0-9]/.test(value), "One symbol"],
  ];

  const levels = ["weak", "weak", "fair", "good", "strong"];
  let nextId = 0;

  function uid(prefix) {
    nextId += 1;
    return `${prefix}-${nextId}`;
  }

  function pascal(kebab) {
    return kebab
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  function drawIcon(name, size) {
    const iconSet = window.halaIcons;
    if (!iconSet || !name) return null;
    const kebab = catalog[name] || name;
    const node = iconSet.icons[pascal(kebab)];
    if (!node) return null;
    const svg = iconSet.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
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

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatPhone(value, length) {
    const d = digits(value).slice(0, length);
    return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
  }

  function formatIban(value, length) {
    const raw = String(value || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, length);
    return raw.replace(/(.{4})/g, "$1 ").trim();
  }

  function ibanValid(raw) {
    if (!/^SA\d{22}$/.test(raw)) return false;
    const moved = `${raw.slice(4)}${raw.slice(0, 4)}`.replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55));
    let mod = 0;
    for (const char of moved) mod = (mod * 10 + Number(char)) % 97;
    return mod === 1;
  }

  function formatAmount(value) {
    const raw = String(value || "").replace(/[^\d.]/g, "");
    const parts = raw.split(".");
    const head = (parts[0] || "").replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${head}.${parts[1].slice(0, 2)}` : head;
  }

  function createInput(options = {}) {
    const {
      label = "",
      value = "",
      hint = "",
      placeholder = "",
      disabled = false,
      readOnly = false,
      type = "text",
      size = "lg",
      shape,
      mono = false,
      prefix,
      suffix,
      kbd,
      leadingIcon,
      trailingIcon,
      trailingTone,
      state,
      fill,
      mask,
      strength = false,
      format,
      phone = {},
      iban = {},
      amount = {},
      maxLength,
      rows = 3,
      inputMode,
      validate,
      onChange,
      alwaysFloat = false,
      emphasis = false,
    } = options;

    const float = options.float != null ? options.float : size === "lg" && type !== "search";
    const locked = Boolean(state);
    const fieldId = uid("input");
    const hintId = uid("hint");
    const root = el("div", "input");
    root.dataset.type = type;
    root.dataset.size = size;
    root.dataset.float = float ? "true" : "false";
    if (shape) root.dataset.shape = shape;
    if (mono || format === "phone" || format === "iban" || format === "amount") root.dataset.mono = "true";
    if (format) root.dataset.format = format;
    if (strength) root.dataset.strength = "true";
    if (emphasis) root.dataset.emphasis = "value";
    if (prefix) root.dataset.prefix = "true";
    if (state) root.dataset.state = state;
    if (fill) root.dataset.fill = fill;
    if (locked) root.dataset.locked = "true";
    if (disabled || state === "disabled") root.dataset.disabled = "true";
    if (readOnly || state === "readonly") root.dataset.readonly = "true";
    if (mask) root.dataset.mask = mask === true ? "true" : mask;

    const box = el(type === "textarea" ? "label" : "div", "input-box");
    if (type === "textarea") box.htmlFor = fieldId;

    if (prefix) {
      const lead = el("span", "input-prefix", prefix);
      const chevron = drawIcon("expand", "badge");
      if (chevron) lead.append(chevron);
      box.append(lead);
    }
    if (leadingIcon) {
      const trail = el("span", "input-trail");
      const glyph = drawIcon(leadingIcon, size === "lg" ? "check" : "inline");
      if (glyph) trail.append(glyph);
      box.append(trail);
    }

    const body = el(type === "textarea" ? "span" : "label", "input-body");
    if (type !== "textarea") body.htmlFor = fieldId;
    const labelNode = el("span", "input-label", label);
    labelNode.id = `${fieldId}-label`;
    const line = el("span", "input-line");
    const control = document.createElement(type === "textarea" ? "textarea" : "input");
    control.className = type === "textarea" ? "input-area" : "input-value";
    control.id = fieldId;
    if (type !== "textarea") {
      control.type = type === "password" ? "password" : "text";
      if (type === "password") control.autocomplete = "new-password";
    } else {
      control.rows = rows;
    }
    if (placeholder) control.placeholder = placeholder;
    if (label) control.setAttribute("aria-labelledby", labelNode.id);
    else if (placeholder) control.setAttribute("aria-label", placeholder);
    if (maxLength) control.maxLength = maxLength;
    if (inputMode) control.inputMode = inputMode;
    if (format === "phone") control.inputMode = "numeric";
    if (format === "amount") control.inputMode = "decimal";
    if (disabled || state === "disabled") control.disabled = true;
    if (locked || readOnly || state === "readonly") {
      control.readOnly = true;
      control.tabIndex = -1;
    }
    line.append(control);
    const caret = el("span", "input-caret");
    caret.setAttribute("aria-hidden", "true");
    line.append(caret);
    if (label && float !== false) body.append(labelNode);
    else if (label && float === false) body.append(labelNode);
    body.append(line);
    box.append(body);

    const suffixNode = el("span", "input-suffix");
    suffixNode.hidden = true;
    box.append(suffixNode);
    const bankNode = el("span", "input-bank");
    bankNode.hidden = true;
    box.append(bankNode);
    if (kbd) box.append(el("span", "input-kbd", kbd));

    const statusNode = el("span", "input-status");
    statusNode.hidden = true;
    box.append(statusNode);

    let revealed = false;
    let action = null;
    if (type === "password" && !locked) {
      root.dataset.action = "true";
      root.dataset.mask = "true";
      action = el("button", "input-action");
      action.type = "button";
      action.setAttribute("aria-label", "Show password");
      box.append(action);
    } else if (trailingIcon) {
      const trail = el("span", "input-trail");
      if (trailingTone) trail.dataset.tone = trailingTone;
      const glyph = drawIcon(trailingIcon, "inline");
      if (size === "lg") {
        const full = drawIcon(trailingIcon);
        if (full) trail.append(full);
      } else if (glyph) trail.append(glyph);
      box.append(trail);
    }

    const hintNode = el("p", "input-hint");
    hintNode.id = hintId;
    control.setAttribute("aria-describedby", hintId);
    const countNode = type === "textarea" ? el("p", "input-count") : null;
    const meter = strength ? el("div", "input-meter") : null;
    const bars = strength ? el("div", "input-bars") : null;
    const strengthLabel = strength ? el("span", "input-strength") : null;
    const rules = strength ? el("div", "input-rules") : null;
    if (meter) {
      for (let i = 0; i < 4; i += 1) bars.append(el("span", "input-bar"));
      meter.append(bars, strengthLabel);
    }
    if (rules) {
      passwordRules.forEach(([, text]) => {
        const row = el("span", "input-rule");
        const tick = el("span", "input-tick");
        const mark = drawIcon("confirm", "presence");
        if (mark) tick.append(mark);
        row.append(tick, document.createTextNode(text));
        rules.append(row);
      });
    }

    root.append(box);
    if (options.hint != null || validate || format) root.append(hintNode);
    else hintNode.hidden = true;
    if (countNode) root.append(countNode);
    if (meter) root.append(meter);
    if (rules) root.append(rules);

    if (!float && !label) labelNode.hidden = true;

    let touched = false;
    let focused = false;

    function setStatus(kind) {
      statusNode.replaceChildren();
      statusNode.hidden = !kind;
      statusNode.dataset.status = kind || "";
      if (kind === "success") {
        const mark = drawIcon("confirm", "sm");
        if (mark) statusNode.append(mark);
      } else if (kind === "error") {
        const mark = drawIcon("alert");
        if (mark) statusNode.append(mark);
      } else if (kind === "lock") {
        const mark = drawIcon("lock", "check");
        if (mark) statusNode.append(mark);
      }
    }

    function paintPassword(current) {
      if (!strength) return;
      const checks = passwordRules.map(([test]) => test(current));
      const score = checks.filter(Boolean).length;
      const level = current ? levels[score] : "";
      [...bars.children].forEach((bar, index) => {
        const on = current && index < Math.max(1, score);
        bar.dataset.level = on ? level : "";
      });
      strengthLabel.textContent = current ? ["Weak", "Weak", "Fair", "Good", "Strong"][score] : "";
      strengthLabel.dataset.level = level;
      [...rules.children].forEach((row, index) => {
        row.dataset.ok = checks[index] ? "true" : "false";
      });
    }

    function paintToggle() {
      if (!action) return;
      action.replaceChildren();
      const glyph = drawIcon(revealed ? "show" : "hide");
      if (glyph) action.append(glyph);
      action.setAttribute("aria-label", revealed ? "Hide password" : "Show password");
      root.dataset.mask = revealed ? "false" : "true";
      control.type = revealed ? "text" : "password";
    }

    function syncFloat() {
      if (!float) {
        root.dataset.floated = "false";
        return;
      }
      if (alwaysFloat || state === "focus" || state === "filled" || state === "error" || state === "success" || state === "disabled" || state === "readonly") {
        root.dataset.floated = "true";
        return;
      }
      if (state === "empty" || state === "hover") {
        root.dataset.floated = "false";
        return;
      }
      root.dataset.floated = focused || control.value.length > 0 ? "true" : "false";
    }

    function applyMessage(result) {
      if (locked) {
        if (hintNode.parentNode) hintNode.textContent = hint;
        root.dataset.error = state === "error" ? "true" : "false";
        root.dataset.success = state === "success" ? "true" : "false";
        control.setAttribute("aria-invalid", state === "error" ? "true" : "false");
        if (!trailingIcon && size === "lg") {
          if (state === "error") setStatus("error");
          else if (state === "success") setStatus("success");
          else if (state === "readonly") setStatus("lock");
        }
        return;
      }
      const message = result.error || result.success || result.hint || hint;
      if (hintNode.parentNode) hintNode.textContent = message;
      const erred = Boolean(result.error);
      const ok = Boolean(result.success);
      root.dataset.error = erred ? "true" : "false";
      root.dataset.success = ok ? "true" : "false";
      root.dataset.warning = result.warning ? "true" : "false";
      control.setAttribute("aria-invalid", erred ? "true" : "false");
      if (hintNode.parentNode) hintNode.setAttribute("role", erred ? "alert" : "status");
      if (result.status) setStatus(result.status);
      else if (!result.keepStatus) setStatus("");
    }

    function derived(current) {
      if (format === "phone") {
        const length = phone.length || 9;
        const d = digits(current);
        const ok = new RegExp(`^5\\d{${length - 1}}$`).test(d);
        const bad = d.length > 0 && !ok && (d[0] !== "5" || d.length >= length);
        return {
          error: bad ? (phone.error || "Enter 9 digits starting with 5") : "",
          success: ok ? (phone.success || "Matches Absher record") : "",
          hint: bad || ok ? "" : `${Math.max(length - d.length, 0)} digits to go`,
          status: ok ? "success" : "",
        };
      }
      if (format === "iban") {
        const length = iban.length || 24;
        const raw = current.replace(/\s/g, "");
        const code = raw.slice(4, 6);
        const bank = (iban.banks || {})[code] || "";
        bankNode.hidden = !bank;
        bankNode.textContent = bank;
        const done = raw.length === length;
        if (iban.check && done && touched && !ibanValid(raw)) {
          return {
            error: iban.invalid || "This IBAN doesn't pass the check. Look for a mistyped digit.",
            status: "error",
          };
        }
        if (iban.check && done && ibanValid(raw)) {
          return {
            success: bank ? `${bank} · checksum matches` : "Checksum matches",
            status: "success",
          };
        }
        return {
          hint: done ? (iban.done || "24 characters · bank detected from the IBAN") : `${raw.length}/${length} characters`,
        };
      }
      if (format === "amount") {
        const number = parseFloat(current.replace(/,/g, "")) || 0;
        const over = amount.limit != null && number > amount.limit;
        const approve = !over && amount.approval != null && number > amount.approval;
        return {
          error: over ? (amount.over || "") : "",
          hint: over ? "" : approve ? (amount.approvalNote || "") : (amount.available || ""),
          warning: approve,
        };
      }
      if (validate) return validate(current, { touched }) || {};
      return { hint };
    }

    function paint() {
      const current = control.value;
      if (suffix) {
        suffixNode.hidden = false;
        suffixNode.textContent = suffix;
      }
      paintPassword(current);
      if (countNode && maxLength) {
        countNode.textContent = `${current.length}/${maxLength}`;
        countNode.dataset.warn = current.length > 120 ? "true" : "false";
      }
      applyMessage(derived(current));
      syncFloat();
    }

    function write(next, fromUser) {
      let formatted = next;
      if (format === "phone") formatted = formatPhone(next, phone.length || 9);
      if (format === "iban") formatted = formatIban(next, iban.length || 24);
      if (format === "amount") formatted = formatAmount(next);
      control.value = formatted;
      paint();
      if (fromUser && onChange) onChange(formatted);
    }

    control.addEventListener("focus", () => {
      focused = true;
      syncFloat();
    });
    control.addEventListener("blur", () => {
      focused = false;
      touched = true;
      paint();
    });
    control.addEventListener("input", () => {
      write(control.value, true);
    });
    if (action) {
      action.addEventListener("click", () => {
        revealed = !revealed;
        paintToggle();
        control.focus();
      });
      paintToggle();
    }
    box.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      if (!locked && !control.disabled) control.focus();
    });

    if (state === "error") root.dataset.error = "true";
    if (state === "success") root.dataset.success = "true";
    write(value, false);
    return root;
  }

  function createOtp(options = {}) {
    const {
      length = 6,
      value = "",
      title = "",
      description = "",
      match,
      verified = "Code verified",
      wrong = "Wrong code. 2 attempts left.",
      countdown = null,
      status = "",
      active = -1,
      interactive = true,
    } = options;

    const root = el("div", "otp");
    if (status) root.dataset.status = status;
    const chars = String(value || "").replace(/\D/g, "").slice(0, length).split("");
    while (chars.length < length) chars.push("");

    if (title || description) {
      const intro = el("div", "otp-intro");
      if (title) intro.append(el("p", "otp-title", title));
      if (description) intro.append(el("span", "otp-desc", description));
      root.append(intro);
    }

    const boxes = el("div", "otp-boxes");
    boxes.setAttribute("role", "group");
    boxes.setAttribute("aria-label", title || "One-time code");
    const inputs = [];

    chars.forEach((char, index) => {
      if (!interactive) {
        const box = el("span", "otp-box otp-static", char);
        if (char) box.dataset.filled = "true";
        if (index === active) {
          box.dataset.current = "true";
          box.append(el("span", "otp-caret"));
        }
        boxes.append(box);
        return;
      }
      const box = document.createElement("input");
      box.className = "otp-box";
      box.type = "text";
      box.inputMode = "numeric";
      box.maxLength = 1;
      box.autocomplete = index === 0 ? "one-time-code" : "off";
      box.setAttribute("aria-label", `Digit ${index + 1} of ${length}`);
      box.value = char;
      if (char) box.dataset.filled = "true";
      inputs.push(box);
      boxes.append(box);
    });
    root.append(boxes);

    if (!interactive) return root;

    const msg = el("p", "otp-msg");
    msg.setAttribute("role", "status");
    const resend = el("div", "otp-resend");
    resend.append(document.createTextNode("Didn't get it?"));
    const resendBtn = el("button", "otp-resend-btn", "Resend code");
    resendBtn.type = "button";
    const timer = el("span", "otp-timer");
    resend.append(resendBtn, timer);
    root.append(msg, resend);

    let remaining = countdown;
    let clock = null;

    function paintTimer() {
      const waiting = remaining > 0;
      resendBtn.hidden = waiting;
      timer.hidden = !waiting;
      if (waiting) timer.textContent = `Resend in 0:${String(remaining).padStart(2, "0")}`;
    }

    function read() {
      return inputs.map((box) => box.value).join("");
    }

    function paintStatus() {
      const code = read();
      inputs.forEach((box) => {
        box.dataset.filled = box.value ? "true" : "false";
      });
      if (code.length < length || match == null) {
        root.dataset.status = "";
        msg.textContent = "";
        msg.dataset.tone = "";
        return;
      }
      const ok = code === match;
      root.dataset.status = ok ? "success" : "error";
      msg.textContent = ok ? verified : wrong;
      msg.dataset.tone = ok ? "success" : "error";
      msg.setAttribute("role", ok ? "status" : "alert");
    }

    function focusAt(index) {
      const box = inputs[Math.max(0, Math.min(length - 1, index))];
      if (box) box.focus();
    }

    function writeDigits(text, start) {
      const next = text.replace(/\D/g, "");
      if (!next) return;
      next.slice(0, length - start).split("").forEach((char, offset) => {
        inputs[start + offset].value = char;
      });
      focusAt(Math.min(length - 1, start + next.length));
      paintStatus();
    }

    inputs.forEach((box, index) => {
      box.addEventListener("focus", () => box.select());
      box.addEventListener("input", () => {
        const raw = box.value.replace(/\D/g, "");
        if (raw.length > 1) {
          box.value = "";
          writeDigits(raw, index);
          return;
        }
        box.value = raw;
        if (raw && index < length - 1) focusAt(index + 1);
        paintStatus();
      });
      box.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !box.value && index > 0) {
          inputs[index - 1].value = "";
          focusAt(index - 1);
          paintStatus();
          event.preventDefault();
        }
        if (event.key === "ArrowLeft" && index > 0) focusAt(index - 1);
        if (event.key === "ArrowRight" && index < length - 1) focusAt(index + 1);
      });
      box.addEventListener("paste", (event) => {
        const text = (event.clipboardData && event.clipboardData.getData("text")) || "";
        if (!text) return;
        event.preventDefault();
        inputs.forEach((item) => { item.value = ""; });
        writeDigits(text, 0);
      });
    });

    if (countdown != null) {
      paintTimer();
      clock = setInterval(() => {
        if (remaining > 0) remaining -= 1;
        paintTimer();
        if (remaining <= 0) clearInterval(clock);
      }, 1000);
    } else {
      resend.hidden = true;
    }

    resendBtn.addEventListener("click", () => {
      inputs.forEach((box) => { box.value = ""; });
      remaining = 59;
      paintStatus();
      paintTimer();
      clearInterval(clock);
      clock = setInterval(() => {
        if (remaining > 0) remaining -= 1;
        paintTimer();
        if (remaining <= 0) clearInterval(clock);
      }, 1000);
      focusAt(0);
    });

    return root;
  }

  function createSelect(options = {}) {
    const {
      kind = "select",
      label = "",
      placeholder = "",
      options: items = [],
      limit,
      emptyTitle,
      emptyHint = "",
      emptyLabel = "",
      countLabel,
    } = options;

    let value = options.value;
    let query = options.query || "";
    let open = false;
    let active = 0;

    function checkMark() {
      const wrap = el("span", "input-check");
      const glyph = drawIcon("confirm", "inline");
      if (glyph) wrap.append(glyph);
      return wrap;
    }
    const root = el("div", "input");
    root.dataset.kind = kind;
    root.dataset.size = "lg";
    root.dataset.float = "true";
    root.dataset.floated = "true";

    const box = kind === "select" ? el("button", "input-box") : el("div", "input-box");
    if (kind === "select") {
      box.type = "button";
      box.setAttribute("aria-haspopup", "listbox");
      box.setAttribute("aria-expanded", "false");
    }
    let search = null;
    if (kind === "combobox") {
      const trail = el("span", "input-trail");
      const glyph = drawIcon("search", "check");
      if (glyph) trail.append(glyph);
      box.append(trail);
    }
    const body = el(kind === "select" ? "span" : "label", "input-body");
    const labelNode = el("span", "input-label", label);
    body.append(labelNode);
    const valueNode = el("span", kind === "select" ? "input-value" : "input-tags");
    if (kind === "combobox") {
      search = document.createElement("input");
      search.className = "input-value";
      search.type = "text";
      search.placeholder = placeholder;
      search.autocomplete = "off";
      search.setAttribute("aria-label", label || placeholder || "Search");
      search.setAttribute("role", "combobox");
      search.setAttribute("aria-expanded", "true");
      search.setAttribute("aria-autocomplete", "list");
      const line = el("span", "input-line");
      line.append(search);
      body.append(line);
    } else if (kind === "select") {
      body.append(valueNode);
    } else {
      body.append(valueNode);
    }
    box.append(body);

    const clearBtn = el("button", "input-clear");
    clearBtn.type = "button";
    clearBtn.setAttribute("aria-label", "Clear");
    const clearIcon = drawIcon("close", "badge");
    if (clearIcon) clearBtn.append(clearIcon);
    clearBtn.hidden = true;
    if (kind === "combobox") box.append(clearBtn);
    if (kind === "select") {
      const chevron = drawIcon("expand");
      if (chevron) {
        chevron.classList.add("input-chevron");
        box.append(chevron);
      }
    }

    const menu = el("div", "input-menu");
    menu.setAttribute("role", "listbox");
    if (kind === "multi") menu.setAttribute("aria-multiselectable", "true");
    if (kind === "select") menu.hidden = true;
    if (label) menu.setAttribute("aria-label", label);

    const footer = kind === "multi" ? el("div", "input-footer") : null;
    const clearAll = kind === "multi" ? el("button", "input-text-btn", "Clear all") : null;
    const count = kind === "multi" ? el("span", "input-count-label") : null;
    if (clearAll) {
      clearAll.type = "button";
      footer.append(clearAll, count);
    }

    root.append(box, menu);
    if (footer) root.append(footer);

    function selectedSet() {
      return new Set(Array.isArray(value) ? value : []);
    }

    function visibleItems() {
      if (kind !== "combobox") return items;
      const q = query.trim().toLowerCase();
      const found = items.filter((item) => {
        if (!q) return true;
        return item.label.toLowerCase().includes(q) || String(item.code || "").toLowerCase().includes(q);
      });
      return limit ? found.slice(0, limit) : found;
    }

    function enabledItems() {
      return visibleItems().filter((item) => !item.disabled);
    }

    function paint() {
      if (kind === "select") {
        const current = items.find((item) => item.label === value || item.value === value);
        valueNode.textContent = current ? current.label : value || "";
        box.setAttribute("aria-expanded", open ? "true" : "false");
        root.dataset.open = open ? "true" : "false";
        menu.hidden = !open;
      }
      if (kind === "combobox") {
        clearBtn.hidden = !query;
        if (search.value !== query) search.value = query;
      }
      if (kind === "multi") {
        const chosen = items.filter((item) => selectedSet().has(item.value));
        valueNode.replaceChildren();
        if (!chosen.length) valueNode.append(el("span", "input-placeholder", emptyLabel));
        chosen.forEach((item) => {
          const tag = el("span", "input-tag", item.label);
          const remove = el("button", "input-tag-remove");
          remove.type = "button";
          remove.setAttribute("aria-label", `Remove ${item.label}`);
          const glyph = drawIcon("close", "sm");
          if (glyph) remove.append(glyph);
          remove.addEventListener("click", () => {
            value = [...selectedSet()].filter((entry) => entry !== item.value);
            paint();
          });
          tag.append(remove);
          valueNode.append(tag);
        });
        const total = items.length;
        count.textContent = countLabel ? countLabel(chosen.length, total) : "";
      }

      const list = visibleItems();
      menu.replaceChildren();
      if (kind === "combobox" && !list.length) {
        const empty = el("div", "input-empty");
        empty.append(el("strong", "", emptyTitle ? emptyTitle(query) : "No matches"));
        if (emptyHint) empty.append(el("span", "", emptyHint));
        menu.append(empty);
        return;
      }
      list.forEach((item, index) => {
        const option = el("button", "input-option");
        option.type = "button";
        option.setAttribute("role", "option");
        const on = kind === "multi" ? selectedSet().has(item.value) : value === item.value || value === item.label;
        option.setAttribute("aria-selected", on ? "true" : "false");
        if (item.disabled) option.disabled = true;
        if (open && index === active) option.dataset.active = "true";
        if (kind === "combobox") {
          const mark = el("span", "input-mark", item.initials || item.label.slice(0, 2));
          if (item.mark) mark.dataset.mark = item.mark;
          const copy = el("span", "input-option-copy");
          copy.append(el("span", "", item.label));
          if (item.code) copy.append(el("span", "input-option-code", item.code));
          option.append(mark, copy);
        } else if (kind === "multi") {
          const check = el("span", "input-box-check");
          check.dataset.on = on ? "true" : "false";
          if (on) {
            const glyph = drawIcon("confirm", "sm");
            if (glyph) check.append(glyph);
          }
          option.append(check, el("span", "input-option-label", item.label));
          if (item.meta) option.append(el("span", "input-option-meta", item.meta));
        } else {
          option.append(el("span", "", item.label));
          if (on) option.append(checkMark());
          else if (item.disabled && item.reason) option.append(el("span", "input-option-reason", item.reason));
        }
        if (kind === "combobox" && on) option.append(checkMark());
        option.addEventListener("click", () => {
          if (item.disabled) return;
          if (kind === "multi") {
            const next = selectedSet();
            if (next.has(item.value)) next.delete(item.value);
            else next.add(item.value);
            value = [...next];
          } else if (kind === "combobox") {
            value = item.value;
            query = item.label;
          } else {
            value = item.label;
            open = false;
          }
          paint();
        });
        menu.append(option);
      });
    }

    function move(step) {
      const list = enabledItems();
      if (!list.length) return;
      const labels = visibleItems();
      let index = active;
      for (let i = 0; i < labels.length; i += 1) {
        index = (index + step + labels.length) % labels.length;
        if (!labels[index].disabled) {
          active = index;
          break;
        }
      }
      paint();
    }

    if (kind === "select") {
      box.addEventListener("click", () => {
        open = !open;
        if (open) {
          active = Math.max(0, visibleItems().findIndex((item) => item.label === value));
        }
        paint();
      });
      box.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!open) open = true;
          else move(1);
          paint();
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          if (open) move(-1);
          paint();
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!open) {
            open = true;
            paint();
          } else {
            const item = visibleItems()[active];
            if (item && !item.disabled) {
              value = item.label;
              open = false;
              paint();
            }
          }
        } else if (event.key === "Escape") {
          open = false;
          paint();
        }
      });
      document.addEventListener("pointerdown", (event) => {
        if (!open || root.contains(event.target)) return;
        open = false;
        paint();
      });
    }

    if (search) {
      search.addEventListener("input", () => {
        query = search.value;
        active = 0;
        paint();
      });
      clearBtn.addEventListener("click", () => {
        query = "";
        paint();
        search.focus();
      });
    }

    if (clearAll) {
      clearAll.addEventListener("click", () => {
        value = [];
        paint();
      });
    }

    paint();
    return root;
  }

  function createUpload(options = {}) {
    const {
      state = "empty",
      title = "Drop CR document or browse",
      browse = "browse",
      hint = "",
      file = "",
      progress = "",
      meta = "",
    } = options;
    const root = el("div", "file-upload");
    root.dataset.state = state;

    if (state === "empty") {
      const drop = el("div", "file-upload-drop");
      const tile = el("span", "file-upload-icon");
      const glyph = drawIcon("upload", "check");
      if (glyph) tile.append(glyph);
      const copy = el("span", "file-upload-copy");
      const heading = el("span", "file-upload-title");
      const [before, after] = title.split(browse);
      heading.append(document.createTextNode(before));
      heading.append(el("span", "file-upload-link", browse));
      if (after) heading.append(document.createTextNode(after));
      copy.append(heading);
      if (hint) copy.append(el("span", "file-upload-hint", hint));
      drop.append(tile, copy);
      root.append(drop);
      return root;
    }

    if (state === "uploading") {
      const row = el("div", "file-upload-row");
      row.dataset.progress = "true";
      const line = el("div", "file-upload-line");
      line.append(el("span", "", file), el("span", "", progress));
      const track = el("span", "file-upload-track");
      const bar = el("span", "file-upload-bar");
      bar.style.setProperty("--upload-progress", progress);
      track.append(bar);
      row.append(line, track);
      root.append(row);
      return root;
    }

    const row = el("div", "file-upload-row");
    const pip = el("span", "input-status");
    pip.dataset.status = "success";
    const mark = drawIcon("confirm", "sm");
    if (mark) pip.append(mark);
    const name = el("span", "file-upload-name");
    name.append(document.createTextNode(file));
    if (meta) name.append(el("span", "file-upload-meta", ` · ${meta}`));
    row.append(pip, name, el("span", "file-upload-remove", "Remove"));
    root.append(row);
    return root;
  }

  window.createInput = createInput;
  window.createOtp = createOtp;
  window.createSelect = createSelect;
  window.createUpload = createUpload;
  window.drawInputIcon = drawIcon;
})();
