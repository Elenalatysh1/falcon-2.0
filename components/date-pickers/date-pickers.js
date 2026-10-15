/**
 * Date pickers. Load lucide UMD and components/button/button.js, then this script.
 *
 * createDatePicker({ value, open, onChange }) — single date, type or pick.
 * createDateRange({ start, end, onChange }) — presets and two months.
 * createDateSheet({ value, onChange }) — mobile sheet calendar.
 * createDateWheel({ value, onChange }) — date-of-birth wheel.
 *
 * Dates are [year, monthIndex, day]. Today in the examples is 15 Oct 2026.
 * Weeks start on Sunday. Transfer dates skip the past and Friday–Saturday.
 */
(function () {
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WEEK = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const TODAY = [2026, 9, 15];

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function drawIcon(name) {
    const lucide = window.lucide;
    if (!lucide || !name) return null;
    const node = lucide.icons[pascal(name)];
    if (!node) return null;
    const svg = lucide.createElement(node);
    svg.classList.add("hala-icon");
    svg.dataset.icon = name;
    svg.style.strokeWidth = "var(--icon-stroke)";
    if (name === "chevron-left" || name === "chevron-right") svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function key(date) {
    return date[0] * 10000 + date[1] * 100 + date[2];
  }

  function same(a, b) {
    return !!a && !!b && key(a) === key(b);
  }

  function fmt(date) {
    if (!date) return "";
    return `${String(date[2]).padStart(2, "0")}/${String(date[1] + 1).padStart(2, "0")}/${date[0]}`;
  }

  function parse(value) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const probe = new Date(year, month, day);
    if (probe.getFullYear() !== year || probe.getMonth() !== month || probe.getDate() !== day) return null;
    return [year, month, day];
  }

  function mask(value) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  function cells(year, month) {
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < first; i += 1) out.push(null);
    for (let day = 1; day <= days; day += 1) out.push(day);
    while (out.length % 7) out.push(null);
    return out;
  }

  function shift(year, month, delta) {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    return [nextYear, nextMonth];
  }

  function weekday(date) {
    return new Date(date[0], date[1], date[2]).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function blocked(date) {
    const stamp = key(date);
    const dow = new Date(date[0], date[1], date[2]).getDay();
    return stamp < key(TODAY) || dow === 5 || dow === 6;
  }

  function button(label, variant, size, icon, aria, trailing) {
    if (window.createButton) {
      return window.createButton({
        label,
        variant,
        size,
        icon,
        trailingIcon: trailing,
        iconOnly: !!icon && !label,
        ariaLabel: aria || label,
      });
    }
    const node = el("button", "", label || aria);
    node.type = "button";
    if (aria) node.setAttribute("aria-label", aria);
    return node;
  }

  function weekRow(labels = WEEK) {
    const row = el("div", "date-week");
    labels.forEach((name) => row.append(el("span", "", name)));
    return row;
  }

  function navButton(direction, onClick) {
    const node = button("", "secondary", "sm", direction === "prev" ? "chevron-left" : "chevron-right", direction === "prev" ? "Previous month" : "Next month");
    node.classList.add("date-nav");
    node.addEventListener("click", onClick);
    return node;
  }

  function dayButton(date, flags, onPick) {
    const node = el("button", "date-cell", String(date[2]));
    node.type = "button";
    node.setAttribute("aria-label", `${date[2]} ${MONTHS[date[1]]}`);
    if (flags.selected) node.dataset.selected = "true";
    if (flags.today) node.dataset.today = "true";
    if (flags.past) node.dataset.past = "true";
    if (flags.inRange) node.dataset.in = "true";
    if (flags.disabled) node.disabled = true;
    node.addEventListener("click", () => {
      if (!flags.disabled && onPick) onPick(date);
    });
    return node;
  }

  function bindGrid(grid, onMove) {
    grid.addEventListener("keydown", (event) => {
      const buttons = [...grid.querySelectorAll(".date-cell")];
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      let step = 0;
      if (event.key === "ArrowRight") step = 1;
      else if (event.key === "ArrowLeft") step = -1;
      else if (event.key === "ArrowDown") step = 7;
      else if (event.key === "ArrowUp") step = -7;
      else return;
      event.preventDefault();
      let next = current + step;
      while (next >= 0 && next < buttons.length && buttons[next].disabled) next += Math.sign(step);
      if (buttons[next] && !buttons[next].disabled) buttons[next].focus();
      else if (onMove) onMove(step > 0 ? 1 : -1);
    });
  }

  function createDatePicker(options = {}) {
    let value = options.value || [2026, 9, 18];
    let month = value[1];
    let year = value[0];
    let open = options.open !== false;

    const root = el("div", "date-picker");
    const field = window.createInput ? window.createInput({
      label: "Transfer date",
      value: fmt(value),
      hint: `${weekday(value)} · arrives the same day`,
      trailingIcon: "calendar",
      mono: true,
      inputMode: "numeric",
      onChange: (next) => {
        const parsed = parse(next);
        if (!parsed) return;
        value = parsed;
        month = parsed[1];
        year = parsed[0];
        syncHint(next);
        renderGrid();
        if (options.onChange) options.onChange(value);
      },
    }) : el("div");
    const control = field.querySelector("input");
    const trail = field.querySelector(".input-trail");
    if (trail) {
      const opener = el("button", "input-trail");
      opener.type = "button";
      opener.setAttribute("aria-label", "Open calendar");
      opener.setAttribute("aria-expanded", open ? "true" : "false");
      while (trail.firstChild) opener.append(trail.firstChild);
      trail.replaceWith(opener);
      opener.addEventListener("click", (event) => {
        event.stopPropagation();
        open = !open;
        syncOpen();
      });
    }
    if (control) {
      control.autocomplete = "off";
      control.addEventListener("input", () => {
        const next = mask(control.value);
        if (next !== control.value) control.value = next;
      }, true);
    }

    const pop = el("div", "date-popover");
    const head = el("div", "date-head");
    const title = el("span", "date-month");
    const grid = el("div", "date-grid");
    grid.setAttribute("role", "grid");
    grid.setAttribute("aria-label", "Transfer date");
    const foot = el("div", "date-popover-foot");
    const nextDay = button("Next business day", "ghost", "sm");
    nextDay.classList.add("date-link");
    const done = button("Done", "ink", "sm");
    head.append(
      navButton("prev", () => {
        [year, month] = shift(year, month, -1);
        renderGrid();
      }),
      title,
      navButton("next", () => {
        [year, month] = shift(year, month, 1);
        renderGrid();
      }),
    );
    foot.append(nextDay, done);
    pop.append(head, weekRow(), grid, foot);
    root.append(field, pop);

    function syncHint(text) {
      const hint = field.querySelector(".input-hint");
      const parsed = parse(text || (control ? control.value : ""));
      if (!hint) return;
      if (parsed && blocked(parsed)) {
        const name = new Date(parsed[0], parsed[1], parsed[2]).toLocaleDateString("en-GB", { weekday: "long" });
        hint.textContent = `${name}: banks are closed. Pick Sun–Thu.`;
        field.dataset.error = "true";
      } else if (parsed) {
        hint.textContent = `${weekday(parsed)} · arrives the same day`;
        field.dataset.error = "false";
      } else {
        hint.textContent = "Pick a date";
        field.dataset.error = "false";
      }
    }

    function syncOpen() {
      pop.hidden = !open;
      field.dataset.open = open ? "true" : "false";
      const opener = field.querySelector("button.input-trail");
      if (opener) opener.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function renderGrid() {
      title.textContent = `${MONTHS[month]} ${year}`;
      grid.replaceChildren();
      cells(year, month).forEach((day) => {
        if (!day) {
          grid.append(el("span", ""));
          return;
        }
        const date = [year, month, day];
        const past = key(date) < key(TODAY);
        grid.append(dayButton(date, {
          selected: same(date, value),
          today: same(date, TODAY),
          past,
          disabled: blocked(date),
        }, (picked) => {
          value = picked;
          if (control) control.value = fmt(picked);
          syncHint(fmt(picked));
          renderGrid();
          if (options.onChange) options.onChange(value);
        }));
      });
    }

    nextDay.addEventListener("click", () => {
      value = [2026, 9, 18];
      month = 9;
      year = 2026;
      if (control) control.value = fmt(value);
      syncHint(fmt(value));
      renderGrid();
      if (options.onChange) options.onChange(value);
    });
    done.addEventListener("click", () => {
      open = false;
      syncOpen();
    });
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        open = false;
        syncOpen();
      }
    });
    bindGrid(grid, (dir) => {
      [year, month] = shift(year, month, dir);
      renderGrid();
    });

    renderGrid();
    syncOpen();
    return root;
  }

  function createDateRange(options = {}) {
    let start = options.start || [2026, 9, 1];
    let end = options.end || [2026, 9, 14];
    let hover = null;
    let cursor = 8;
    let preset = null;

    const presets = [
      ["Today", [2026, 9, 15], [2026, 9, 15]],
      ["Yesterday", [2026, 9, 14], [2026, 9, 14]],
      ["Last 7 days", [2026, 9, 9], [2026, 9, 15]],
      ["This month", [2026, 9, 1], [2026, 9, 15]],
      ["Last month", [2026, 8, 1], [2026, 8, 30]],
      ["Last 90 days", [2026, 6, 18], [2026, 9, 15]],
      ["Custom", null, null],
    ];

    const root = el("div", "date-range");
    const trigger = button("Pick dates", "secondary", "md", "calendar", "Pick dates", "chevron-up");
    trigger.classList.add("date-range-trigger");
    const panel = el("div", "date-range-panel");
    const side = el("div", "date-presets");
    const main = el("div", "date-months");
    const months = el("div", "date-month-pair");
    const foot = el("div", "date-range-foot");
    const startBox = el("span", "date-readout");
    const endBox = el("span", "date-readout");
    const days = el("span", "date-days");
    const actions = el("div", "date-range-actions");
    const clear = button("Clear", "secondary", "md");
    const apply = button("Apply", "primary", "md");
    actions.append(clear, apply);
    foot.append(startBox, el("span", "", "–"), endBox, days, actions);
    main.append(months, foot);
    panel.append(side, main);
    root.append(trigger, panel);

    function label() {
      if (preset && preset !== "Custom") return preset;
      if (start && end) {
        const short = (date) => new Date(date[0], date[1], date[2]).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        return `${short(start)} – ${short(end)}`;
      }
      return "Pick dates";
    }

    function span() {
      const endKey = end ? key(end) : hover && start ? key(hover) : null;
      const startKey = start ? key(start) : null;
      if (!startKey) return [null, null];
      if (!endKey) return [startKey, startKey];
      return [Math.min(startKey, endKey), Math.max(startKey, endKey)];
    }

    function renderMonth(year, month, index) {
      const block = el("div", "");
      const head = el("div", "date-month-head");
      const title = el("span", "date-month", `${MONTHS[month]} ${year}`);
      const prev = navButton("prev", () => {
        cursor -= 1;
        render();
      });
      const next = navButton("next", () => {
        cursor = Math.min(cursor + 1, 9);
        render();
      });
      prev.dataset.slot = index === 0 ? "on" : "off";
      next.dataset.slot = index === 1 ? "on" : "off";
      head.append(prev, title, next);
      const grid = el("div", "date-grid");
      const [lo, hi] = span();
      cells(year, month).forEach((day, cellIndex) => {
        const band = el("div", "date-band");
        if (!day) {
          grid.append(band);
          return;
        }
        const date = [year, month, day];
        const stamp = key(date);
        const future = stamp > key(TODAY);
        const edge = stamp === lo || stamp === hi;
        const inside = lo && hi && stamp > lo && stamp < hi;
        const dow = cellIndex % 7;
        if (edge && lo !== hi && stamp === lo) band.dataset.edge = "start";
        if (edge && lo !== hi && stamp === hi) band.dataset.edge = "end";
        if (inside) band.dataset.in = "true";
        if (inside && dow === 0) band.dataset.round = "start";
        if (inside && dow === 6) band.dataset.round = "end";
        const cell = dayButton(date, {
          selected: edge,
          today: same(date, TODAY),
          inRange: inside,
          disabled: future,
        }, (picked) => {
          const pickedKey = key(picked);
          if (!start || end) {
            start = picked;
            end = null;
          } else if (key(start) <= pickedKey) {
            end = picked;
          } else {
            end = start;
            start = picked;
          }
          hover = null;
          preset = null;
          render();
          if (options.onChange) options.onChange({ start, end });
        });
        cell.addEventListener("mouseenter", () => {
          if (start && !end && !same(hover, date)) {
            hover = date;
            render();
          }
        });
        band.append(cell);
        grid.append(band);
      });
      block.append(head, weekRow(), grid);
      return block;
    }

    function render() {
      const triggerLabel = trigger.querySelector(".button-label");
      if (triggerLabel) triggerLabel.textContent = label();
      else trigger.textContent = label();
      side.replaceChildren();
      presets.forEach(([name, a, b]) => {
        const on = preset ? preset === name : !!(start && end && a && same(a, start) && same(b, end));
        const item = el("button", "date-preset", name);
        item.type = "button";
        item.setAttribute("aria-pressed", on ? "true" : "false");
        item.addEventListener("click", () => {
          if (a) {
            start = a;
            end = b;
            preset = name;
            cursor = a[1] === 9 ? 8 : a[1] + (a[0] - 2026) * 12;
          } else {
            preset = "Custom";
            start = null;
            end = null;
          }
          hover = null;
          render();
          if (options.onChange) options.onChange({ start, end, preset });
        });
        side.append(item);
      });
      const first = ((cursor % 12) + 12) % 12;
      const firstYear = 2026 + Math.floor(cursor / 12);
      const second = (first + 1) % 12;
      const secondYear = first === 11 ? firstYear + 1 : firstYear;
      months.replaceChildren(renderMonth(firstYear, first, 0), renderMonth(secondYear, second, 1));
      startBox.textContent = start ? fmt(start) : "Start";
      endBox.textContent = end ? fmt(end) : start ? "Pick end date" : "End";
      startBox.dataset.empty = start ? "false" : "true";
      endBox.dataset.empty = end ? "false" : "true";
      startBox.dataset.active = start ? "false" : "true";
      endBox.dataset.active = start && !end ? "true" : "false";
      const count = start && end ? Math.round((new Date(end[0], end[1], end[2]) - new Date(start[0], start[1], start[2])) / 86400000) + 1 : 0;
      days.textContent = count ? `${count} day${count > 1 ? "s" : ""}` : "";
      apply.disabled = !(start && end);
    }

    clear.addEventListener("click", () => {
      start = null;
      end = null;
      preset = "Custom";
      hover = null;
      render();
    });
    render();
    return root;
  }

  function createDateSheet(options = {}) {
    let value = options.value || [2026, 9, 18];
    let month = value[1];
    const quick = [
      ["Next business day", [2026, 9, 18]],
      ["In a week", [2026, 9, 22]],
      ["End of month", [2026, 9, 29]],
    ];
    const root = el("div", "date-sheet");
    root.append(el("span", "date-handle"));
    const title = el("div", "date-sheet-title");
    const heading = el("strong", "", "Send on");
    const current = el("span", "");
    title.append(heading, current);
    const chips = el("div", "date-quick");
    const head = el("div", "date-head");
    const monthTitle = el("span", "date-month");
    const grid = el("div", "date-grid");
    const confirm = button("Confirm date", "primary", "lg");
    confirm.classList.add("date-confirm");
    head.append(
      navButton("prev", () => {
        month = Math.max(9, month - 1);
        render();
      }),
      monthTitle,
      navButton("next", () => {
        month = Math.min(11, month + 1);
        render();
      }),
    );
    root.append(title, chips, head, weekRow(WEEK.map((name) => name[0])), grid, confirm);

    function render() {
      current.textContent = fmt(value);
      monthTitle.textContent = `${MONTHS[month]} 2026`;
      chips.replaceChildren();
      quick.forEach(([name, date]) => {
        const on = same(date, value);
        const chip = button(name, on ? "ink" : "secondary", "sm");
        chip.addEventListener("click", () => {
          value = date;
          month = date[1];
          render();
          if (options.onChange) options.onChange(value);
        });
        chips.append(chip);
      });
      grid.replaceChildren();
      cells(2026, month).forEach((day) => {
        if (!day) {
          grid.append(el("span", ""));
          return;
        }
        const date = [2026, month, day];
        grid.append(dayButton(date, {
          selected: same(date, value),
          today: same(date, TODAY),
          past: key(date) < key(TODAY),
          disabled: blocked(date),
        }, (picked) => {
          value = picked;
          render();
          if (options.onChange) options.onChange(value);
        }));
      });
    }

    render();
    return root;
  }

  function createDateWheel(options = {}) {
    let value = options.value || [1991, 11, 12];
    const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));
    const months = MONTHS.map((name) => name.slice(0, 3));
    const years = Array.from({ length: 80 }, (_, index) => String(2008 - index));
    const root = el("div", "date-wheel");
    root.append(el("span", "date-handle"));
    const title = el("div", "date-wheel-title");
    const current = el("span", "");
    title.append(el("strong", "", "Date of birth"), current);
    const wheels = el("div", "date-wheels");
    wheels.append(el("span", "date-wheels-mark"));
    const note = el("p", "date-wheel-note");
    const done = button("Done", "primary", "lg");
    done.classList.add("date-confirm");
    let locking = false;
    const columns = [days, months, years].map((list, index) => {
      const column = el("div", "date-column");
      column.tabIndex = 0;
      column.setAttribute("aria-label", ["Day", "Month", "Year"][index]);
      column.append(el("div", "date-column-pad"));
      list.forEach((label) => column.append(el("div", "date-wheel-item", label)));
      column.append(el("div", "date-column-pad"));
      column.addEventListener("scroll", () => {
        if (locking) return;
        const item = column.querySelector(".date-wheel-item");
        const height = item ? item.getBoundingClientRect().height : 0;
        if (!height) return;
        const next = Math.max(0, Math.min(list.length - 1, Math.round(column.scrollTop / height)));
        const copy = value.slice();
        if (index === 0) copy[2] = next + 1;
        if (index === 1) copy[1] = next;
        if (index === 2) copy[0] = 2008 - next;
        if (copy[0] === value[0] && copy[1] === value[1] && copy[2] === value[2]) return;
        value = copy;
        paint();
        if (options.onChange) options.onChange(value);
      });
      column.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        const item = column.querySelector(".date-wheel-item");
        const height = item ? item.getBoundingClientRect().height : 0;
        column.scrollTop += event.key === "ArrowDown" ? height : -height;
      });
      wheels.append(column);
      return column;
    });
    root.append(title, wheels, note, done);

    function age() {
      return 2026 - value[0] - (value[1] > 9 || (value[1] === 9 && value[2] > 15) ? 1 : 0);
    }

    function paint() {
      current.textContent = fmt(value);
      note.textContent = `Age ${age()}. Must be 18 or older to own a business account.`;
      const indexes = [value[2] - 1, value[1], 2008 - value[0]];
      columns.forEach((column, index) => {
        [...column.querySelectorAll(".date-wheel-item")].forEach((item, itemIndex) => {
          item.dataset.on = itemIndex === indexes[index] ? "true" : "false";
        });
      });
    }

    function align() {
      locking = true;
      const indexes = [value[2] - 1, value[1], 2008 - value[0]];
      columns.forEach((column, index) => {
        const item = column.querySelector(".date-wheel-item");
        const height = item ? item.getBoundingClientRect().height : 0;
        if (height) column.scrollTop = indexes[index] * height;
      });
      locking = false;
    }

    paint();
    const seen = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        align();
        seen.disconnect();
      }
    });
    seen.observe(root);
    return root;
  }

  window.createDatePicker = createDatePicker;
  window.createDateRange = createDateRange;
  window.createDateSheet = createDateSheet;
  window.createDateWheel = createDateWheel;
  window.createDateCell = function createDateCell(state, label) {
    const node = el("span", "date-cell date-cell-sample", label);
    node.dataset.state = state;
    return node;
  };
})();
