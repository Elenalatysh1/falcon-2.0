/**
 * Time picker. Load lucide UMD, button.js and selection.js, then this script.
 *
 * createTimeFields()
 * createTimeSlots()
 * createTimeColumns()
 * createOpeningHours()
 * createTimeWheel()
 * createTimeDial()
 *
 * Times use 12-hour Mono by default. Slots step 30 minutes. Columns and the
 * Android dial step 5 minutes. The iOS wheel scrolls to a value.
 */
(function () {
  const DAY = 24 * 60;
  const CUTOFF = 16 * 60;
  const STEP = 30;

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

  function live(label) {
    return el("span", "tp-live", label || "Live");
  }

  function clock(button) {
    const glyph = icon("clock");
    const node = button ? el("button", "tp-clock") : el("span", "tp-clock");
    if (button) {
      node.type = "button";
      node.setAttribute("aria-label", "Open time list");
    }
    if (glyph) node.append(glyph);
    return node;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function format12(minutes) {
    const normalized = ((minutes % DAY) + DAY) % DAY;
    const hour = Math.floor(normalized / 60);
    const minute = normalized % 60;
    const suffix = hour < 12 ? "AM" : "PM";
    const hour12 = hour % 12 || 12;
    return `${pad(hour12)}:${pad(minute)} ${suffix}`;
  }

  function formatClock(minutes, overnight) {
    return format12(minutes) + (overnight ? " +1" : "");
  }

  function stepTime(minutes) {
    return minutes + STEP > DAY + 180 ? 300 : minutes + STEP;
  }

  function centerIn(list, selected) {
    if (!list || !selected || !list.clientHeight) return;
    const delta = selected.getBoundingClientRect().top - list.getBoundingClientRect().top - (list.clientHeight - selected.offsetHeight) / 2;
    list.scrollTop += delta;
  }

  function whenShown(node, fn) {
    queueMicrotask(() => {
      const page = node.closest("[data-page]");
      const run = () => {
        if (!page || page.hasAttribute("hidden")) return false;
        fn();
        return true;
      };
      if (run()) return;
      const observer = new MutationObserver(() => {
        if (run()) observer.disconnect();
      });
      if (page) observer.observe(page, { attributes: true, attributeFilter: ["hidden"] });
    });
  }

  function createTimeFields() {
    const grid = el("div", "tp-fields");
    const rows = [
      ["Empty", "Opening time", "hh:mm", true, "", "Riyadh time"],
      ["Focused · typing", "Opening time", "09:3", false, "focus", "Colon is added for you"],
      ["Filled", "Opening time", "09:30 AM", false, "", "Riyadh time"],
      ["Error", "Closing time", "08:00 AM", false, "error", "Must be after the opening time (09:30 AM)."],
      ["Disabled", "Cut-off time", "04:00 PM", false, "disabled", "Set by the bank"],
      ["Read only", "Last payroll run", "10:42 AM", false, "readonly", "1 Oct 2026"],
    ];
    rows.forEach(([kicker, label, value, placeholder, state, help]) => {
      const card = el("div", "tp-card");
      card.append(el("span", "tp-overline", kicker));
      const field = el("div", "tp-field");
      if (state) field.dataset.state = state;
      const copy = el("div", "tp-field-copy");
      copy.append(el("span", "tp-label", label));
      const shown = el("span", "tp-value", value);
      if (placeholder) shown.dataset.placeholder = "true";
      copy.append(shown);
      field.append(copy, clock(false));
      card.append(field, el("p", "tp-help", help));
      grid.append(card);
    });
    return grid;
  }

  function createTimeSlots() {
    const root = el("div", "tp-stage");
    root.dataset.tall = "true";
    const head = el("div", "tp-head");
    head.append(el("span", "tp-kicker", "Schedule transfer · slots"), live("Live"));
    const quick = el("div", "tp-quick");
    const anchor = el("div", "tp-anchor");
    const field = el("div", "tp-field");
    const copy = el("div", "tp-field-copy");
    copy.append(el("span", "tp-label", "Send at"));
    const input = el("input", "tp-input");
    input.type = "text";
    input.placeholder = "hh:mm";
    input.setAttribute("aria-label", "Send at");
    input.setAttribute("autocomplete", "off");
    copy.append(input);
    const toggle = clock(true);
    field.append(copy, toggle);
    const help = el("p", "tp-help");
    help.setAttribute("aria-live", "polite");
    const menu = el("div", "tp-menu");
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Time slots");
    anchor.append(field, help, menu);
    const callout = el("div", "tp-callout");
    const info = icon("info");
    if (info) callout.append(info);
    const note = el("span");
    note.append("Local transfers sent after ");
    note.append(el("b", "", "4:00 PM"));
    note.append(" arrive the next business day. Those slots are marked \"Next day\".");
    callout.append(note);

    const slots = [];
    for (let time = 7 * 60; time <= 22 * 60; time += STEP) slots.push(time);
    const shortcuts = [
      ["Now", 14 * 60 + 30],
      ["9:00 AM", 9 * 60],
      ["12:00 PM", 12 * 60],
      ["Before cut-off", 15 * 60 + 30],
    ];
    let slot = 10 * 60;
    let query = null;
    let open = true;

    function matches(time, text) {
      if (!text) return true;
      const typed = text.replace(/\s/g, "").toLowerCase();
      const twelve = format12(time).replace(/\s/g, "").toLowerCase();
      const twenty = `${pad(Math.floor(time / 60))}:${pad(time % 60)}`;
      return twelve.includes(typed) || twenty.includes(typed);
    }

    function pick(time) {
      slot = time;
      query = null;
      open = false;
      paint();
      input.focus();
    }

    function paint() {
      const shown = query == null ? format12(slot) : query;
      if (document.activeElement !== input || input.value !== shown) input.value = shown;
      field.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      const late = slot >= CUTOFF;
      help.textContent = late ? "After the cut-off · arrives Sun 18 Oct" : "Arrives within minutes · Thu 15 Oct";
      help.dataset.tone = late ? "warn" : "";
      quick.replaceChildren();
      shortcuts.forEach(([label, time]) => {
        const chip = el("button", "tp-chip", label);
        chip.type = "button";
        chip.setAttribute("aria-pressed", slot === time ? "true" : "false");
        chip.addEventListener("click", () => pick(time));
        quick.append(chip);
      });
      menu.hidden = !open;
      menu.replaceChildren();
      const visible = slots.filter((time) => matches(time, query == null ? "" : query));
      if (!visible.length) {
        menu.append(el("div", "tp-empty", "No slot matches. Use hh:mm, e.g. 09:30."));
      }
      visible.forEach((time) => {
        const option = el("button", "tp-option");
        option.type = "button";
        option.setAttribute("role", "option");
        const on = time === slot;
        option.setAttribute("aria-selected", on ? "true" : "false");
        option.append(el("span", "", format12(time)));
        if (time >= CUTOFF) option.append(el("span", "tp-next", "Next day"));
        if (on) {
          const mark = el("span", "tp-check");
          const glyph = icon("check", "inline");
          if (glyph) mark.append(glyph);
          option.append(mark);
        }
        option.addEventListener("click", () => pick(time));
        option.addEventListener("keydown", (event) => {
          const options = [...menu.querySelectorAll('[role="option"]')];
          const index = options.indexOf(option);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const next = event.key === "ArrowDown" ? Math.min(options.length - 1, index + 1) : Math.max(0, index - 1);
            options[next].focus();
          }
          if (event.key === "Enter") {
            event.preventDefault();
            pick(time);
          }
        });
        menu.append(option);
      });
      if (open) {
        whenShown(menu, () => centerIn(menu, menu.querySelector('[aria-selected="true"]')));
      }
    }

    input.addEventListener("focus", () => {
      input.select();
      query = "";
      open = true;
      paint();
    });
    input.addEventListener("input", () => {
      let value = input.value.replace(/[^\d:apmAPM ]/g, "");
      if (/^\d{3,}$/.test(value)) value = `${value.slice(0, 2)}:${value.slice(2, 4)}`;
      query = value;
      open = true;
      if (input.value !== value) input.value = value;
      paint();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" && open) {
        event.preventDefault();
        menu.querySelector('[role="option"]')?.focus();
      }
      if (event.key === "Escape") {
        query = null;
        open = false;
        paint();
      }
    });
    toggle.addEventListener("click", () => {
      open = !open;
      query = null;
      paint();
      if (open) input.focus();
    });
    document.addEventListener("click", (event) => {
      if (!open || anchor.contains(event.target) || quick.contains(event.target)) return;
      query = null;
      open = false;
      paint();
    });
    root.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !open) return;
      query = null;
      open = false;
      paint();
      input.focus();
    });

    root.append(head, quick, anchor, callout);
    paint();
    return root;
  }

  function createTimeColumns() {
    const root = el("div", "tp-stage");
    const head = el("div", "tp-head");
    head.append(el("span", "tp-kicker", "Exact time · columns"));
    const tools = el("div", "tp-tools");
    const seg = el("div", "tp-seg");
    tools.append(seg, live("Live"));
    head.append(tools);
    const field = el("div", "tp-field");
    field.dataset.state = "focus";
    const copy = el("div", "tp-field-copy");
    copy.append(el("span", "tp-label", "Payroll run time"));
    const value = el("span", "tp-value");
    value.setAttribute("aria-live", "polite");
    copy.append(value);
    field.append(copy, clock(false));
    const columns = el("div", "tp-columns");
    const note = el("p", "tp-note", "Minutes in steps of 5. Selected value in ink, keyboard arrows move between items.");
    let hour = 9;
    let minute = 30;
    let suffix = "AM";
    let format = 12;
    let focusKey = "";

    function hour24() {
      if (format === 24) return hour;
      return (hour % 12) + (suffix === "PM" ? 12 : 0);
    }

    function paint() {
      const display = format === 12 ? `${pad(hour)}:${pad(minute)} ${suffix}` : `${pad(hour)}:${pad(minute)}`;
      value.textContent = display;
      columns.dataset.format = String(format);
      seg.replaceChildren();
      [12, 24].forEach((mode) => {
        const button = el("button", "", `${mode}h`);
        button.type = "button";
        button.setAttribute("aria-pressed", format === mode ? "true" : "false");
        button.addEventListener("click", () => {
          if (format === mode) return;
          const current = hour24();
          format = mode;
          if (mode === 24) hour = current;
          else {
            hour = (current % 12) || 12;
            suffix = current < 12 ? "AM" : "PM";
          }
          focusKey = "";
          paint();
        });
        seg.append(button);
      });
      const lists = [
        ["Hour", format === 12 ? Array.from({ length: 12 }, (_, index) => index + 1) : Array.from({ length: 24 }, (_, index) => index), hour, (next) => { hour = next; }],
        ["Min", Array.from({ length: 12 }, (_, index) => index * 5), minute, (next) => { minute = next; }],
      ];
      if (format === 12) lists.push(["", ["AM", "PM"], suffix, (next) => { suffix = next; }]);
      const row = el("div", "tp-col-row");
      lists.forEach(([name, items, current, set], column) => {
        const col = el("div", "tp-col");
        col.append(el("span", "tp-col-name", name));
        const list = el("div", "tp-col-list");
        list.setAttribute("role", "listbox");
        list.setAttribute("aria-label", name || "AM or PM");
        items.forEach((item) => {
          const tick = el("button", "tp-tick", item === "AM" || item === "PM" ? String(item) : pad(item));
          tick.type = "button";
          tick.setAttribute("role", "option");
          const on = item === current;
          tick.setAttribute("aria-selected", on ? "true" : "false");
          tick.dataset.key = `${column}-${item}`;
          tick.addEventListener("click", () => {
            focusKey = tick.dataset.key;
            set(item);
            paint();
          });
          tick.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            const buttons = [...list.querySelectorAll("button")];
            const index = buttons.indexOf(tick);
            const next = event.key === "ArrowDown" ? Math.min(buttons.length - 1, index + 1) : Math.max(0, index - 1);
            buttons[next].click();
          });
          list.append(tick);
        });
        col.append(list);
        row.append(col);
      });
      const foot = el("div", "tp-col-foot");
      const now = el("button", "tp-now", "Now");
      now.type = "button";
      now.addEventListener("click", () => {
        focusKey = "";
        if (format === 12) {
          hour = 2;
          minute = 30;
          suffix = "PM";
        } else {
          hour = 14;
          minute = 30;
        }
        paint();
      });
      foot.append(now, el("span", "tp-done", "Done"));
      columns.replaceChildren(row, foot);
      whenShown(columns, () => {
        if (focusKey) {
          const next = columns.querySelector(`[data-key="${CSS.escape(focusKey)}"]`);
          if (!next) return;
          next.focus();
          centerIn(next.parentElement, next);
          return;
        }
        columns.querySelectorAll(".tp-col-list").forEach((list) => {
          centerIn(list, list.querySelector('[aria-selected="true"]'));
        });
      });
    }

    root.append(head, field, columns, note);
    paint();
    return root;
  }

  function createOpeningHours() {
    const root = el("div", "tp-stage");
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let days = [
      [[9 * 60, 23 * 60]],
      [[9 * 60, 23 * 60]],
      [[9 * 60, 23 * 60]],
      [[9 * 60, 23 * 60]],
      [[9 * 60, DAY + 60]],
      [[13 * 60, DAY + 60]],
      null,
    ];
    let focusKey = "";
    const head = el("div", "tp-hours-head");
    const titles = el("div", "");
    titles.append(el("h3", "", "Olaya branch · opening hours"));
    const summary = el("p", "");
    summary.setAttribute("aria-live", "polite");
    titles.append(summary);
    const actions = el("div", "tp-hours-actions");
    const copy = window.createButton
      ? createButton({ label: "Copy Sunday to all days", variant: "secondary", size: "sm" })
      : el("button", "", "Copy Sunday to all days");
    copy.type = "button";
    copy.addEventListener("click", () => {
      if (!days[0]) return;
      const source = days[0].map((range) => [...range]);
      days = days.map((ranges) => (ranges ? source.map((range) => [...range]) : ranges));
      focusKey = "";
      paint();
    });
    actions.append(copy, live("Live"));
    head.append(titles, actions);
    const list = el("div", "");
    const note = el("p", "tp-note tp-foot-note", "Click a time to move it forward by 30 minutes (demo). Ranges past midnight show \"+1\": 06:00 PM – 02:00 AM +1.");

    function paint() {
      const openCount = days.filter(Boolean).length;
      summary.textContent = `Open ${openCount} days · closed ${7 - openCount}`;
      list.replaceChildren();
      days.forEach((ranges, index) => {
        const open = !!ranges;
        const today = index === 4;
        const row = el("div", "tp-day");
        row.dataset.open = open ? "true" : "false";
        if (today) row.dataset.today = "true";
        row.append(el("span", "tp-day-name", today ? `${names[index]} · today` : names[index]));
        const toggle = window.createChoice
          ? createChoice({
            kind: "switch",
            bare: true,
            checked: open,
            label: `Open on ${names[index]}`,
            onChange: () => {
              days[index] = open ? null : [[9 * 60, 23 * 60]];
              focusKey = `switch-${index}`;
              paint();
            },
          })
          : el("button", "", open ? "On" : "Off");
        toggle.tabIndex = 0;
        toggle.dataset.key = `switch-${index}`;
        row.append(toggle);
        const times = el("div", "tp-ranges");
        if (!open) {
          times.append(el("span", "tp-closed", "Closed"));
        } else {
          const invalid = ranges.some(([start, end]) => end <= start);
          ranges.forEach(([start, end], range) => {
            const group = el("div", "tp-range");
            const bad = end <= start;
            const from = el("button", "tp-time", formatClock(start, false));
            from.type = "button";
            from.title = "Click to change";
            from.dataset.key = `from-${index}-${range}`;
            from.setAttribute("aria-label", `${names[index]} opening ${formatClock(start, false)}`);
            if (bad) from.dataset.error = "true";
            from.addEventListener("click", () => {
              days[index] = ranges.map((item, itemIndex) => (itemIndex === range ? [stepTime(item[0]) % DAY, item[1]] : [...item]));
              focusKey = from.dataset.key;
              paint();
            });
            const to = el("button", "tp-time", formatClock(end, end >= DAY));
            to.type = "button";
            to.title = "Click to change";
            to.dataset.key = `to-${index}-${range}`;
            to.setAttribute("aria-label", `${names[index]} closing ${formatClock(end, end >= DAY)}`);
            if (bad) to.dataset.error = "true";
            to.addEventListener("click", () => {
              days[index] = ranges.map((item, itemIndex) => (itemIndex === range ? [item[0], stepTime(item[1])] : [...item]));
              focusKey = to.dataset.key;
              paint();
            });
            group.append(from, el("span", "tp-dash", "–"), to);
            if (ranges.length > 1) {
              const remove = el("button", "tp-remove");
              remove.type = "button";
              remove.dataset.key = `remove-${index}-${range}`;
              remove.setAttribute("aria-label", "Remove range");
              const glyph = icon("x", "inline");
              if (glyph) remove.append(glyph);
              remove.addEventListener("click", () => {
                days[index] = ranges.filter((_, itemIndex) => itemIndex !== range);
                focusKey = "";
                paint();
              });
              group.append(remove);
            }
            times.append(group);
          });
          if (ranges.length < 2) {
            const add = el("button", "tp-split", "+ Split shift");
            add.type = "button";
            add.dataset.key = `add-${index}`;
            add.addEventListener("click", () => {
              const end = ranges[0][1] > CUTOFF ? ranges[0][1] : 23 * 60;
              days[index] = [[ranges[0][0], 14 * 60], [CUTOFF, end]];
              focusKey = add.dataset.key;
              paint();
            });
            times.append(add);
          }
          if (invalid) times.append(el("span", "tp-day-error", "Closing must be after opening"));
        }
        row.append(times);
        list.append(row);
      });
      if (focusKey) root.querySelector(`[data-key="${CSS.escape(focusKey)}"]`)?.focus();
    }

    root.append(head, list, note);
    paint();
    return root;
  }

  function createTimeWheel() {
    const root = el("div", "tp-stage tp-phone-card");
    const head = el("div", "tp-head");
    head.append(el("span", "tp-kicker", "iOS · wheel"), live("Live · scroll"));
    const phone = el("div", "tp-phone");
    const ghost = el("div", "tp-ghost");
    ghost.append(el("strong", "", "Schedule payroll"), el("span", ""));
    const sheet = el("div", "tp-sheet");
    sheet.append(el("span", "tp-grab"));
    const bar = el("div", "tp-sheet-head");
    const readout = el("span", "");
    readout.setAttribute("aria-live", "polite");
    bar.append(el("strong", "", "Run at"), readout);
    const wheels = el("div", "tp-wheels");
    wheels.append(el("span", "tp-band"));
    const note = el("p", "tp-sheet-note");
    const hours = Array.from({ length: 12 }, (_, index) => index + 1);
    const minutes = Array.from({ length: 12 }, (_, index) => index * 5);
    const suffixes = ["AM", "PM"];
    let hour = 9;
    let minute = 30;
    let suffix = "AM";
    const columns = [
      { name: "Hour", items: hours, get: () => hour, set: (value) => { hour = value; } },
      { name: "Minute", items: minutes, get: () => minute, set: (value) => { minute = value; } },
      { name: "AM or PM", items: suffixes, get: () => suffix, set: (value) => { suffix = value; } },
    ];

    function twentyFour() {
      return (hour % 12) + (suffix === "PM" ? 12 : 0);
    }

    function paintLabels() {
      readout.textContent = `${pad(hour)}:${pad(minute)} ${suffix}`;
      note.textContent = twentyFour() >= 16
        ? "After 4:00 PM · salaries arrive next business day"
        : "Salaries arrive the same day";
      columns.forEach((column) => {
        const index = column.items.indexOf(column.get());
        [...column.node.children].forEach((item, itemIndex) => {
          if (!item.dataset.item) return;
          item.dataset.on = itemIndex - 1 === index ? "true" : "false";
        });
      });
    }

    columns.forEach((column) => {
      const scroller = el("div", "tp-wheel");
      scroller.tabIndex = 0;
      scroller.setAttribute("aria-label", column.name);
      scroller.append(el("div", "tp-wheel-pad"));
      column.items.forEach((item) => {
        const row = el("div", "tp-wheel-item", column.name === "Minute" || column.name === "Hour" ? pad(item) : String(item));
        row.dataset.item = "true";
        scroller.append(row);
      });
      scroller.append(el("div", "tp-wheel-pad"));
      column.node = scroller;
      let lock = false;
      scroller.addEventListener("scroll", () => {
        if (lock) return;
        const item = scroller.querySelector("[data-item]");
        const size = item ? item.offsetHeight : 0;
        if (!size) return;
        const index = Math.max(0, Math.min(column.items.length - 1, Math.round(scroller.scrollTop / size)));
        if (column.items[index] === column.get()) return;
        column.set(column.items[index]);
        paintLabels();
      });
      scroller.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        const index = column.items.indexOf(column.get());
        const next = event.key === "ArrowDown"
          ? Math.min(column.items.length - 1, index + 1)
          : Math.max(0, index - 1);
        column.set(column.items[next]);
        paintLabels();
        const item = scroller.querySelector("[data-item]");
        const size = item ? item.offsetHeight : 0;
        lock = true;
        scroller.scrollTop = next * size;
        lock = false;
      });
      wheels.append(scroller);
    });
    sheet.append(bar, wheels, note, el("div", "tp-confirm", "Done"));
    phone.append(ghost, el("div", "tp-scrim"), sheet);
    root.append(head, phone);
    paintLabels();
    whenShown(phone, () => {
      columns.forEach((column) => {
        const item = column.node.querySelector("[data-item]");
        const size = item ? item.offsetHeight : 0;
        column.node.scrollTop = column.items.indexOf(column.get()) * size;
      });
    });
    return root;
  }

  function createTimeDial() {
    const root = el("div", "tp-stage tp-phone-card");
    const head = el("div", "tp-head");
    head.append(el("span", "tp-kicker", "Android · clock dial"), live("Live · tap"));
    const phone = el("div", "tp-phone tp-dial-phone");
    const dialog = el("div", "tp-dialog");
    dialog.append(el("p", "", "Select time"));
    const readout = el("div", "tp-readout");
    const hourButton = el("button", "tp-big");
    hourButton.type = "button";
    hourButton.setAttribute("aria-label", "Hour");
    const minuteButton = el("button", "tp-big");
    minuteButton.type = "button";
    minuteButton.setAttribute("aria-label", "Minute");
    const ampm = el("div", "tp-ampm");
    readout.append(hourButton, el("span", "tp-colon", ":"), minuteButton, ampm);
    const dial = el("div", "tp-dial");
    const hand = el("span", "tp-hand");
    dial.append(hand, el("span", "tp-hub"));
    const foot = el("div", "tp-dial-foot");
    const key = el("span", "tp-key");
    key.title = "Type time";
    const keyboard = icon("keyboard");
    if (keyboard) key.append(keyboard);
    const actions = el("div", "tp-dial-actions");
    actions.append(el("span", "", "Cancel"), el("span", "", "OK"));
    foot.append(key, actions);
    let mode = "hour";
    let hour = 4;
    let minute = 0;
    let suffix = "PM";

    function paint() {
      hourButton.textContent = pad(hour);
      minuteButton.textContent = pad(minute);
      hourButton.setAttribute("aria-pressed", mode === "hour" ? "true" : "false");
      minuteButton.setAttribute("aria-pressed", mode === "minute" ? "true" : "false");
      ampm.replaceChildren();
      ["AM", "PM"].forEach((label) => {
        const button = el("button", "", label);
        button.type = "button";
        button.setAttribute("aria-pressed", suffix === label ? "true" : "false");
        button.addEventListener("click", () => {
          suffix = label;
          paint();
        });
        ampm.append(button);
      });
      const numbers = mode === "hour"
        ? Array.from({ length: 12 }, (_, index) => (index === 0 ? 12 : index))
        : Array.from({ length: 12 }, (_, index) => index * 5);
      dial.querySelectorAll(".tp-num").forEach((node) => node.remove());
      numbers.forEach((number, index) => {
        const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
        const button = el("button", "tp-num", mode === "hour" ? String(number) : pad(number));
        button.type = "button";
        button.style.left = `calc(50% + ${Math.cos(angle) * 40}%)`;
        button.style.top = `calc(50% + ${Math.sin(angle) * 40}%)`;
        const selected = mode === "hour" ? number === hour : number === minute;
        button.setAttribute("aria-selected", selected ? "true" : "false");
        button.addEventListener("click", () => {
          if (mode === "hour") {
            hour = number;
            mode = "minute";
          } else minute = number;
          paint();
        });
        dial.append(button);
      });
      const degrees = mode === "hour" ? (hour % 12) * 30 : (minute / 5) * 30;
      hand.style.transform = `rotate(${degrees}deg)`;
    }

    hourButton.addEventListener("click", () => {
      mode = "hour";
      paint();
    });
    minuteButton.addEventListener("click", () => {
      mode = "minute";
      paint();
    });
    dialog.append(readout, dial, foot);
    phone.append(dialog);
    root.append(head, phone);
    paint();
    return root;
  }

  window.createTimeFields = createTimeFields;
  window.createTimeSlots = createTimeSlots;
  window.createTimeColumns = createTimeColumns;
  window.createOpeningHours = createOpeningHours;
  window.createTimeWheel = createTimeWheel;
  window.createTimeDial = createTimeDial;
})();
