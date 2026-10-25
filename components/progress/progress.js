/**
 * HALA DNA Progress & steppers: Progress bar, Spend meter, Stepper, Progress checklist,
 * and the Step marker part. Load button.js and lists.js before this script.
 *
 * createProgressBar({ value, tone, size, label })
 *   tone "brand" | "warning" | "error" | "neutral", size "s" | "m" | "l". RTL fills from the right.
 * createSpendMeter({ label, spent, limit, status, note, lang })
 *   status "normal" | "near" | "over" | "frozen"; without it, Near limit starts at 80%.
 * createStepper({ steps, current, lang, label })
 *   3–5 steps. Below 800 it becomes "Step 2 of 4" with segments. root.setCurrent(n).
 * createProgressChecklist({ title, steps, lang, onAction })
 *   steps [{ title, description, status, action }], one Current at a time.
 * createStepMarker({ status, number })
 *   status "done" | "current" | "upcoming" | "error".
 */
(function () {
  const COPY = {
    en: {
      of: "of",
      left: "left",
      used: (percent) => `${percent}% used`,
      over: "Over by",
      frozen: "Frozen — spending is paused",
      step: (index, count) => `Step ${index} of ${count}`,
      done: (count, total) => `${count} of ${total} done`,
      status: { done: "completed", current: "current", upcoming: "not started", error: "needs attention" },
      progress: "Progress",
      spent: (spent, limit) => `${spent} of ${limit} Saudi riyals used`,
    },
    ar: {
      of: "من",
      left: "متبقٍ",
      used: (percent) => `استُخدم ${percent}%`,
      over: "تجاوز بمقدار",
      frozen: "مجمّدة — الإنفاق متوقف",
      step: (index, count) => `الخطوة ${index} من ${count}`,
      done: (count, total) => `تم ${count} من ${total}`,
      status: { done: "مكتملة", current: "الحالية", upcoming: "لم تبدأ", error: "تحتاج انتباهك" },
      progress: "التقدم",
      spent: (spent, limit) => `استُخدم ${spent} من ${limit} ريال سعودي`,
    },
  };
  const TONE = { normal: "brand", near: "warning", over: "error", frozen: "neutral" };
  const NOTE_ICON = { near: "warning", over: "error", frozen: "lock" };

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

  function cue(node) {
    node.removeAttribute("data-motion");
    void node.offsetWidth;
    node.dataset.motion = "true";
    node.addEventListener("animationend", () => node.removeAttribute("data-motion"), { once: true });
  }

  function format(value) {
    return Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function createProgressBar(options = {}) {
    const { tone = "brand", size = "m", label } = options;
    const bar = el("span", "pg-bar");
    bar.dataset.tone = tone;
    bar.dataset.size = size;
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    if (label) bar.setAttribute("aria-label", label);
    const fill = el("span", "pg-fill");
    bar.append(fill);
    bar.setValue = (value) => {
      const percent = clamp(value);
      bar.style.setProperty("--pg-value", String(percent));
      bar.setAttribute("aria-valuenow", String(percent));
    };
    bar.setTone = (next) => { bar.dataset.tone = next; };
    bar.setValue(options.value || 0);
    return bar;
  }

  function createStepMarker(options = {}) {
    const { status = "upcoming", number = 1, lang = "en" } = options;
    const marker = el("span", "pg-marker");
    marker.dataset.status = status;
    marker.setAttribute("role", "img");
    marker.setAttribute("aria-label", `${number}, ${COPY[lang === "ar" ? "ar" : "en"].status[status]}`);
    if (status === "done") marker.append(icon("check", "badge"));
    else if (status === "error") marker.append(icon("x", "badge"));
    else marker.append(el("span", "pg-marker-number", String(number)));
    return marker;
  }

  function amount(value, kind, size) {
    return window.createAmount ? window.createAmount(value, { kind, size }) : el("span", "pg-mono", format(value));
  }

  function createSpendMeter(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const { label = lang === "ar" ? "الحد الشهري" : "Monthly limit", spent = 0, limit = 1 } = options;
    const ratio = spent / limit;
    const status = options.status || (ratio > 1 ? "over" : ratio >= 0.8 ? "near" : "normal");
    const meter = el("div", "pg-meter");
    meter.dataset.status = status;
    if (options.lang) meter.lang = lang;

    const top = el("div", "pg-meter-top");
    const values = el("span", "pg-meter-values");
    values.append(amount(spent, "plain", "s"), el("span", "pg-meter-of", copy.of), amount(limit, "muted", "s"));
    top.append(el("span", "pg-meter-label", label), values);

    const bar = createProgressBar({ value: ratio * 100, tone: TONE[status], size: "m" });
    bar.setAttribute("aria-label", label);
    bar.setAttribute("aria-valuetext", copy.spent(format(spent), format(limit)));

    const note = el("p", "pg-meter-note");
    const glyph = NOTE_ICON[status] && icon(NOTE_ICON[status], "inline");
    if (glyph) note.append(glyph);
    if (status === "frozen") note.append(el("span", "pg-meter-tone", copy.frozen));
    else if (status === "over") note.append(el("span", "pg-meter-tone", copy.over), amount(spent - limit, "plain", "xs"));
    else {
      const suffix = status === "near" ? copy.used(clamp(ratio * 100)) : options.note;
      note.append(amount(limit - spent, "plain", "xs"), el("span", status === "near" ? "pg-meter-tone" : "pg-meter-quiet", suffix ? `${copy.left} · ${suffix}` : copy.left));
    }
    meter.append(top, bar, note);
    return meter;
  }

  function createStepper(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const steps = (options.steps || []).slice(0, 5);
    const root = el("div", "pg-stepper");
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", options.label || copy.progress);
    if (options.lang) root.lang = lang;
    let current = Math.max(1, Math.min(steps.length, options.current || 1));

    const list = el("ol", "pg-steps");
    const compact = el("div", "pg-compact");
    const line = el("p", "pg-compact-line");
    const segments = el("div", "pg-segments");
    segments.setAttribute("aria-hidden", "true");
    compact.append(line, segments);
    root.append(list, compact);

    function status(index) {
      if (options.error === index) return "error";
      return index < current ? "done" : index === current ? "current" : "upcoming";
    }

    function paint(changed) {
      list.replaceChildren();
      steps.forEach((name, i) => {
        const index = i + 1;
        const state = status(index);
        if (i > 0) {
          const connector = el("li", "pg-connector");
          connector.setAttribute("aria-hidden", "true");
          connector.dataset.done = index <= current ? "true" : "false";
          list.append(connector);
        }
        const item = el("li", "pg-step");
        item.dataset.status = state;
        if (state === "current") item.setAttribute("aria-current", "step");
        const marker = createStepMarker({ status: state, number: index, lang });
        if (changed && changed.includes(index)) cue(marker);
        item.append(marker, el("span", "pg-step-label", name));
        list.append(item);
      });
      line.replaceChildren(el("span", "pg-compact-count", copy.step(current, steps.length)), el("span", "pg-compact-dot", "·"), el("span", "pg-compact-name", steps[current - 1]));
      if (segments.children.length !== steps.length) segments.replaceChildren(...steps.map(() => el("span", "pg-segment")));
      [...segments.children].forEach((segment, i) => { segment.dataset.done = i < current ? "true" : "false"; });
    }

    root.setCurrent = (next) => {
      const target = Math.max(1, Math.min(steps.length, next));
      if (target === current) return;
      const changed = [current, target];
      current = target;
      paint(changed);
    };
    root.getCurrent = () => current;
    paint();
    return root;
  }

  function createProgressChecklist(options = {}) {
    const lang = options.lang === "ar" ? "ar" : "en";
    const copy = COPY[lang];
    const steps = (options.steps || []).map((step) => ({ ...step }));
    const root = el("section", "pg-check");
    if (options.lang) root.lang = lang;
    const head = el("div", "pg-check-head");
    const titleRow = el("div", "pg-check-title-row");
    const title = el("h3", "pg-check-title", options.title || (lang === "ar" ? "جهّز بطاقتك" : "Get your card ready"));
    const count = el("span", "pg-check-count");
    titleRow.append(title, count);
    const bar = createProgressBar({ size: "s", label: title.textContent });
    head.append(titleRow, bar);
    const list = el("ol", "pg-check-steps");
    root.append(head, list);

    function paint(changed) {
      const done = steps.filter((step) => step.status === "done").length;
      count.textContent = copy.done(done, steps.length);
      bar.setValue((done / steps.length) * 100);
      bar.setAttribute("aria-valuetext", count.textContent);
      list.replaceChildren();
      steps.forEach((step, i) => {
        const item = el("li", "pg-check-step");
        item.dataset.status = step.status;
        if (step.status === "current") item.setAttribute("aria-current", "step");
        const rail = el("span", "pg-check-rail");
        const marker = createStepMarker({ status: step.status, number: i + 1, lang });
        if (changed && changed.includes(i)) cue(marker);
        rail.append(marker);
        if (i < steps.length - 1) rail.append(el("span", "pg-check-line"));
        const body = el("div", "pg-check-body");
        body.append(el("span", "pg-check-step-title", step.title));
        if (step.description) body.append(el("span", "pg-check-desc", step.description));
        if (step.action && (step.status === "current" || step.status === "error") && window.createButton) {
          const action = el("div", "pg-check-action");
          const button = window.createButton({ label: step.action, variant: step.status === "error" ? "secondary" : "primary", size: "sm" });
          button.dataset.key = `action-${i}`;
          button.addEventListener("click", () => {
            if (options.onAction) options.onAction(i, step);
            else complete(i);
          });
          action.append(button);
          if (changed && changed.includes(i)) action.dataset.motion = "rise";
          body.append(action);
        }
        item.append(rail, body);
        list.append(item);
      });
    }

    function complete(index) {
      const focused = document.activeElement && root.contains(document.activeElement);
      steps[index].status = "done";
      const next = steps.findIndex((step, i) => i > index && step.status === "upcoming");
      if (next !== -1) steps[next].status = "current";
      paint([index, next]);
      if (focused) {
        const target = list.querySelector("button");
        if (target) target.focus();
        else {
          title.tabIndex = -1;
          title.focus();
        }
      }
    }

    root.complete = complete;
    root.reset = (next) => {
      next.forEach((step, i) => { steps[i].status = step.status; });
      paint();
    };
    paint();
    return root;
  }

  window.createProgressBar = createProgressBar;
  window.createSpendMeter = createSpendMeter;
  window.createStepper = createStepper;
  window.createProgressChecklist = createProgressChecklist;
  window.createStepMarker = createStepMarker;
})();
