/**
 * Loading. Load vendor/hala-icons.js, then this script.
 *
 * createLoadingGuide()
 * createSkeletonParts()
 * createSkeletonScreens()
 * createLoadingIndicators()
 * createLoadingButtons()
 * createLoadingFields()
 * createLoadingPhones()
 * createLoadingTimeline()
 *
 * Skeletons share one timer. Reload shows the skeleton, then the content.
 * A loading button cannot be pressed again until it finishes.
 */
(function () {
  const SKELETON_MS = 1800;
  const HOLD_MS = 1600;
  const session = { loaded: false, started: false, timer: 0, listeners: new Set() };

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size) {
    const iconSet = window.halaIcons;
    if (!iconSet || !name) return null;
    const node = iconSet.icons[pascal(name)];
    if (!node) return null;
    const svg = iconSet.createElement(node);
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
    return el("span", "ld-live", label || "Live");
  }

  function bone(width, height, radius) {
    const node = el("span", "ld-bone");
    node.setAttribute("aria-hidden", "true");
    if (width) node.style.width = width;
    if (height) node.style.height = height;
    if (radius) node.style.borderRadius = radius;
    return node;
  }

  function spinner(size, tone, labeled) {
    const node = el("span", "ld-spin");
    if (size) node.dataset.size = size;
    if (tone) node.dataset.tone = tone;
    if (labeled === false) node.setAttribute("aria-hidden", "true");
    else {
      node.setAttribute("role", "status");
      node.setAttribute("aria-label", "Loading");
    }
    return node;
  }

  function dots(small) {
    const node = el("span", "ld-dots");
    node.setAttribute("aria-hidden", "true");
    if (small) node.dataset.size = "sm";
    for (let i = 0; i < 3; i += 1) {
      const dot = el("span", "ld-dot");
      dot.style.setProperty("--ld-i", String(i));
      node.append(dot);
    }
    return node;
  }

  function bar(options) {
    const node = el("span", "ld-bar");
    if (options && options.thin) node.dataset.thin = "true";
    if (options && options.short) node.dataset.short = "true";
    node.setAttribute("role", "progressbar");
    node.setAttribute("aria-label", "Loading");
    node.append(el("span", "ld-bar-fill"));
    return node;
  }

  function fade(node, index) {
    const wrap = el("div", "ld-fade");
    if (index) wrap.style.setProperty("--ld-i", String(index));
    wrap.append(node);
    return wrap;
  }

  function emit() {
    session.listeners.forEach((fn) => fn(session.loaded));
  }

  function reloadSkeletons() {
    clearTimeout(session.timer);
    session.loaded = false;
    emit();
    session.timer = setTimeout(() => {
      session.loaded = true;
      emit();
    }, SKELETON_MS);
  }

  function watch(fn) {
    session.listeners.add(fn);
    if (!session.started) {
      session.started = true;
      reloadSkeletons();
    } else fn(session.loaded);
  }

  function lines(widths, height) {
    const col = el("div", "ld-lines");
    widths.forEach((width) => col.append(bone(width, height || "var(--type-overline-size)")));
    return col;
  }

  function createLoadingGuide() {
    const root = el("div", "ld-cards");
    const items = [
      ["Under 300 ms", "Nothing", "Show the result directly. A flash of loader feels slower than none.", el("span", "ld-dash", "—")],
      ["0.3 – 1 s · known layout", "Skeleton", "Pages, lists, cards, charts. Shows the shape of what is coming.", lines(["70%", "100%", "45%"])],
      ["0.3 – 3 s · small area", "Spinner", "Inside a button, a field, a refresh, or a small widget.", spinner("guide")],
      ["Background action", "Inline dots or top bar", "Saving, syncing, switching account. Doesn't block the screen.", null],
      ["Over 3 s", "Progress bar", "Uploads, payroll runs, exports. Show percent and time left.", null],
    ];
    items.forEach(([time, name, copy, demo]) => {
      const card = el("div", "ld-card");
      const well = el("div", "ld-well");
      if (name === "Inline dots or top bar") {
        const stack = el("div", "ld-lines");
        stack.style.alignItems = "center";
        stack.append(bar({ thin: true, short: true }), dots());
        well.append(stack);
      } else if (name === "Progress bar") {
        const meter = el("div", "ld-meter");
        const track = el("span", "ld-meter-track");
        track.append(el("span", "ld-meter-fill"));
        meter.append(track, el("span", "ld-meter-label", "62% · 12 s left"));
        meter.setAttribute("role", "progressbar");
        meter.setAttribute("aria-valuenow", "62");
        meter.setAttribute("aria-valuemin", "0");
        meter.setAttribute("aria-valuemax", "100");
        meter.setAttribute("aria-label", "62 percent, 12 seconds left");
        well.append(meter);
      } else well.append(demo);
      card.append(well, el("span", "ld-time", time), el("strong", "", name), el("p", "", copy));
      root.append(card);
    });
    return root;
  }

  function createSkeletonParts() {
    const root = el("div", "ld-parts");
    const samples = [
      ["Text line", "H 10–12 · r 6 · 40–90% width", lines(["85%", "60%"])],
      ["Heading", "H 22 · r 8 · 50% width", bone("55%", "var(--type-body-m-line)", "var(--radius-s)")],
      ["Amount", "H 26 · r 8 · Mono width", bone("70%", "var(--type-title-line)", "var(--radius-s)")],
      ["Avatar", "40 × 40 · circle", bone("var(--size-md)", "var(--size-md)", "var(--radius-pill)")],
      ["Icon tile", "40 × 40 · r 12", bone("var(--size-md)", "var(--size-md)", "var(--radius-m)")],
      ["Badge", "H 22 · pill · 64 w", bone("calc(var(--space-14) + var(--space-2))", "var(--size-badge-feature)", "var(--radius-pill)")],
      ["Button", "H 40 · pill · 120 w", bone("calc(var(--space-14) * 2 + var(--space-2))", "var(--size-md)", "var(--radius-pill)")],
      ["Card / media", "r 16–20 · real ratio", bone("100%", "var(--space-14)", "var(--radius-control)")],
    ];
    samples.forEach(([name, spec, sample]) => {
      const part = el("div", "ld-part");
      const preview = el("div", "ld-preview");
      preview.append(sample);
      part.append(preview, el("strong", "", name), el("span", "ld-spec", spec));
      root.append(part);
    });
    return root;
  }

  function chart() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 300 120");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("ld-chart");
    svg.setAttribute("aria-hidden", "true");
    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", "M0 100 C30 92 50 80 80 78 S130 56 160 50 210 30 240 34 280 16 300 12 L300 120 L0 120Z");
    area.classList.add("ld-chart-area");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", "M0 100 C30 92 50 80 80 78 S130 56 160 50 210 30 240 34 280 16 300 12");
    line.classList.add("ld-chart-line");
    svg.append(area, line);
    return svg;
  }

  function chartBars() {
    const wrap = el("div", "ld-bars");
    [38, 52, 44, 66, 58, 74, 62, 80, 70, 88, 76, 92].forEach((height, index) => {
      const column = bone(null, `${height}%`, "var(--radius-badge)");
      column.style.setProperty("--ld-i", String(index));
      wrap.append(column);
    });
    return wrap;
  }

  function initials(name) {
    return name.split(" ").map((word) => word[0]).join("").slice(0, 2);
  }

  const ROWS = [
    ["Al Baik · Olaya", "Today, 12:41", "+ 86.25", "Settled", "settled"],
    ["Jarir Bookstore", "Today, 11:08", "− 1,249.00", "Settled", "settled"],
    ["Nour Trading", "Today, 09:30", "− 25,000.00", "Pending", "pending"],
    ["Careem", "Yesterday", "− 38.50", "Settled", "settled"],
    ["Online store #2041", "Yesterday", "+ 420.00", "Settled", "settled"],
  ];

  const MERCHANT = [
    "calc(var(--space-14) * 2 + var(--space-7))",
    "calc(var(--space-12) * 2 + var(--space-6))",
    "calc(var(--space-14) * 2 - var(--space-1))",
    "calc(var(--space-10) * 2)",
    "calc(var(--space-14) * 2 + var(--space-10))",
  ];
  const AMOUNTS = [
    "calc(var(--space-14) + var(--space-1))",
    "calc(var(--space-10) * 2)",
    "calc(var(--space-14) + var(--space-10) + var(--space-1))",
    "calc(var(--space-12) + var(--gap-day))",
    "calc(var(--space-14) + var(--space-2))",
  ];

  function tableRow(cells) {
    const row = el("div", "ld-trow");
    cells.forEach((cell) => row.append(cell));
    return row;
  }

  function createSkeletonScreens() {
    const root = el("div", "ld-stack");
    const toolbar = el("div", "ld-toolbar");
    const reload = el("button", "ld-reload", "Reload examples");
    reload.type = "button";
    const glyph = icon("refresh-cw", "inline");
    if (glyph) reload.prepend(glyph);
    reload.addEventListener("click", reloadSkeletons);
    toolbar.append(reload);

    const dash = el("div", "ld-stage");
    const dashHead = el("div", "ld-head");
    dashHead.append(el("span", "ld-kicker", "Dashboard · KPI + chart"), live());
    const kpis = el("div", "ld-kpis");
    const kpiSlots = ["Balance", "POS sales", "To approve"].map((label) => {
      const card = el("div", "ld-kpi");
      const slot = el("div", "");
      card.append(el("span", "", label), slot);
      kpis.append(card);
      return slot;
    });
    const panel = el("div", "ld-panel");
    const panelHead = el("div", "ld-panel-head");
    panelHead.append(el("strong", "", "POS sales"), el("span", "", "Last 30 days"));
    const chartSlot = el("div", "ld-chart-slot");
    panel.append(panelHead, chartSlot);
    dash.append(dashHead, kpis, panel);

    const card = el("div", "ld-stage");
    const cardHead = el("div", "ld-head");
    cardHead.append(el("span", "ld-kicker", "Card details"), live());
    const cardSlot = el("div", "ld-facts");
    card.append(cardHead, cardSlot);

    const tableCard = el("div", "ld-stage");
    const tableHead = el("div", "ld-head");
    tableHead.append(el("span", "ld-kicker", "Transactions table"), live());
    const table = el("div", "ld-table");
    const columns = el("div", "ld-thead");
    ["Merchant", "Date", "Amount", "Status"].forEach((name) => columns.append(el("span", "", name)));
    const body = el("div", "");
    table.append(columns, body);
    tableCard.append(tableHead, table);

    const values = ["SAR 175,000.00", "SAR 184,320.00", "3"];
    const facts = [
      ["Holder", "Omar Bakr", false],
      ["Monthly limit", "SAR 5,000.00", true],
      ["Spent this month", "SAR 3,287.50", true],
    ];
    const factWidths = [
      "calc(var(--space-10) * 2)",
      "calc(var(--space-14) * 2 - var(--space-1))",
      "calc(var(--space-14) + var(--space-10) + var(--space-1))",
    ];

    function paint(loaded) {
      kpiSlots.forEach((slot, index) => {
        slot.replaceChildren(loaded
          ? fade(el("span", "ld-amount", values[index]))
          : bone("75%", "var(--type-body-m-line)", "var(--radius-s)"));
      });
      chartSlot.replaceChildren(loaded ? fade(chart()) : chartBars());
      if (loaded) {
        const face = el("div", "ld-face");
        face.append(el("strong", "", "Marketing card"), el("span", "", "•• 4417"));
        const block = el("div", "ld-facts");
        block.append(face);
        facts.forEach(([label, value, mono]) => {
          const row = el("div", "ld-fact");
          const amount = el("b", "", value);
          if (mono) amount.dataset.mono = "true";
          row.append(el("span", "", label), amount);
          block.append(row);
        });
        cardSlot.replaceChildren(fade(block));
      } else {
        const block = el("div", "ld-facts");
        const shell = bone(null, null, "var(--radius-group)");
        shell.classList.add("ld-face-bone");
        block.append(shell);
        facts.forEach(([label], index) => {
          const row = el("div", "ld-fact");
          row.append(el("span", "", label), bone(factWidths[index], "var(--type-compact-size)"));
          block.append(row);
        });
        cardSlot.replaceChildren(block);
      }
      body.replaceChildren();
      ROWS.forEach((row, index) => {
        if (!loaded) {
          const who = el("div", "ld-who");
          who.append(bone("var(--icon-tile-default)", "var(--icon-tile-default)", "var(--radius-pill)"), bone(MERCHANT[index], "var(--space-3)"));
          const amount = el("div", "ld-end");
          amount.append(bone(AMOUNTS[index], "var(--space-3)"));
          body.append(tableRow([
            who,
            bone("calc(var(--space-10) * 2)", "var(--space-3)"),
            amount,
            bone("calc(var(--space-14) + var(--space-4))", "var(--space-3)"),
          ]));
          return;
        }
        const who = el("div", "ld-who");
        who.append(el("span", "ld-avatar", initials(row[0])), el("strong", "", row[0]));
        const amount = el("span", "ld-amt", row[2]);
        if (row[2].startsWith("+")) amount.dataset.in = "true";
        const status = el("span", "ld-status", row[3]);
        const pip = el("span", "ld-pip");
        pip.dataset.tone = row[4];
        status.prepend(pip);
        body.append(fade(tableRow([who, el("span", "ld-when", row[1]), amount, status]), index));
      });
    }

    watch(paint);
    const grid = el("div", "ld-screens");
    grid.append(dash, card);
    root.append(toolbar, grid, tableCard);
    return root;
  }

  function createLoadingIndicators() {
    const root = el("div", "ld-trio");
    const ring = el("div", "ld-stage");
    ring.append(el("span", "ld-kicker", "Ring · 16 / 20 / 32"));
    const sizes = el("div", "ld-actions");
    const ink = el("span", "ld-ink");
    ink.append(spinner("pull", "inverse"));
    sizes.append(spinner("sm"), spinner(), spinner("lg"), ink);
    ring.append(sizes, el("p", "ld-note", "Green on light surfaces, white on ink or gradient. 0.8 s per turn, linear."));

    const inline = el("div", "ld-stage");
    inline.append(el("span", "ld-kicker", "Inline · saving and syncing"));
    const saving = el("span", "ld-inline");
    saving.append(dots(true), document.createTextNode("Saving changes"));
    const syncing = el("span", "ld-inline");
    syncing.append(spinner("sm", null, false), document.createTextNode("Syncing with Wathq…"));
    const saved = el("span", "ld-inline");
    saved.dataset.done = "true";
    const mark = icon("check", "inline");
    if (mark) saved.append(mark);
    saved.append(document.createTextNode("Saved · just now"));
    inline.append(saving, syncing, saved);

    const top = el("div", "ld-stage");
    top.append(el("span", "ld-kicker", "Top bar · page change"));
    const frame = el("div", "ld-top");
    const strip = el("div", "ld-top-bar");
    strip.append(bar({ thin: true }));
    const title = el("div", "ld-top-title");
    title.append(el("span", "ld-mark"), el("span", "", "Transactions"));
    frame.append(strip, title);
    top.append(frame, el("p", "ld-note", "3 px at the very top. Starts after 300 ms; the old page stays visible until the new one is ready."));
    root.append(ring, inline, top);
    return root;
  }

  function runJob(button, ms, onBusy, onDone, onReset) {
    if (button.dataset.busy === "true") return;
    button.dataset.busy = "true";
    button.setAttribute("aria-busy", "true");
    onBusy();
    setTimeout(() => {
      button.dataset.busy = "false";
      button.removeAttribute("aria-busy");
      onDone();
      setTimeout(onReset, HOLD_MS);
    }, ms);
  }

  function createLoadingButtons() {
    const root = el("div", "ld-stage");
    const head = el("div", "ld-head");
    head.append(el("span", "ld-kicker", "Buttons"), live());
    const row = el("div", "ld-actions");

    const send = el("button", "ld-btn");
    send.type = "button";
    send.dataset.variant = "primary";
    const sendLabel = el("span", "ld-btn-label", "Send SAR 25,000");
    const sendSpin = spinner(null, "inverse", false);
    sendSpin.classList.add("ld-btn-spin");
    sendSpin.hidden = true;
    send.append(sendSpin, sendLabel);
    send.addEventListener("click", () => {
      runJob(send, SKELETON_MS, () => {
        sendSpin.hidden = false;
      }, () => {
        sendSpin.hidden = true;
        sendLabel.replaceChildren();
        const mark = icon("check", "inline");
        if (mark) sendLabel.append(mark);
        sendLabel.append(document.createTextNode("Sent"));
      }, () => {
        sendLabel.replaceChildren(document.createTextNode("Send SAR 25,000"));
      });
    });

    const exportBtn = el("button", "ld-btn");
    exportBtn.type = "button";
    exportBtn.dataset.variant = "secondary";
    const exportSpin = spinner("sm", null, false);
    exportSpin.hidden = true;
    const exportLabel = el("span", "ld-btn-label", "Export CSV");
    exportBtn.append(exportSpin, exportLabel);
    exportBtn.addEventListener("click", () => {
      runJob(exportBtn, HOLD_MS, () => {
        exportSpin.hidden = false;
        exportLabel.textContent = "Exporting";
      }, () => {
        exportSpin.hidden = true;
        exportLabel.textContent = "Downloaded";
      }, () => {
        exportLabel.textContent = "Export CSV";
      });
    });

    const refresh = el("button", "ld-btn");
    refresh.type = "button";
    refresh.dataset.variant = "icon";
    refresh.setAttribute("aria-label", "Refresh");
    const refreshIcon = icon("refresh-cw");
    if (refreshIcon) refresh.append(refreshIcon);
    refresh.addEventListener("click", () => {
      runJob(refresh, 1200, () => {}, () => {}, () => {});
    });

    row.append(send, exportBtn, refresh);
    root.append(head, row, el("p", "ld-note", "Primary: spinner replaces the label, width fixed. Secondary: spinner before a present-tense label (\"Exporting\"). Icon: the icon itself spins."));
    return root;
  }

  function createLoadingFields() {
    const root = el("div", "ld-stage");
    root.append(el("span", "ld-kicker", "Fields · checking a value"));
    const iban = el("div", "ld-field");
    const ibanCopy = el("div", "");
    const ibanValue = el("b", "", "SA03 8000 0000 6080 1016 7519");
    ibanValue.dataset.mono = "true";
    ibanCopy.append(el("small", "", "IBAN"), ibanValue);
    iban.append(ibanCopy, spinner("field", null, false));
    const search = el("div", "ld-field");
    const searchCopy = el("div", "");
    searchCopy.append(el("small", "", "Search beneficiaries"), el("b", "", "Nour"));
    search.append(searchCopy, spinner("field", null, false));
    const menu = el("div", "ld-menu");
    menu.setAttribute("aria-hidden", "true");
    [["60%", "35%"], ["45%", "50%"], ["70%", "30%"]].forEach(([name, meta]) => {
      const option = el("div", "ld-option");
      option.append(
        bone("var(--size-sm)", "var(--size-sm)", "var(--radius-pill)"),
        lines([name, meta], "var(--space-3)"),
      );
      menu.append(option);
    });
    root.append(iban, el("p", "ld-note", "Looking up the account holder…"), search, menu);
    return root;
  }

  const ACTIVITY = [
    ["Careem", "Yesterday", "− 38.50"],
    ["Al Baik", "Yesterday", "+ 86.25"],
    ["Jarir", "12 Oct", "− 1,249.00"],
    ["STC Pay", "11 Oct", "− 200.00"],
  ];

  function activityRow(index, real) {
    const row = el("div", "ld-mrow");
    if (!real) {
      const copy = el("div", "ld-lines");
      copy.append(
        bone(["65%", "50%", "72%", "58%"][index % 4], "var(--space-3)"),
        bone("35%", "var(--space-3)"),
      );
      row.append(bone("var(--size-md)", "var(--size-md)", "var(--radius-pill)"), copy, bone("calc(var(--space-14) + var(--space-2))", "var(--type-hint-size)"));
      return row;
    }
    const copy = el("div", "");
    copy.append(el("strong", "", real[0]), el("em", "", real[1]));
    row.append(el("span", "ld-mavatar", real[0].slice(0, 2).toUpperCase()), copy, el("span", "ld-mamt", real[2]));
    return row;
  }

  function createLoadingPhones() {
    const root = el("div", "ld-phones");
    const homeCard = el("div", "ld-stage ld-phone-card");
    const homeHead = el("div", "ld-head");
    homeHead.append(el("span", "ld-kicker", "Home · first load"), live());
    const home = el("div", "ld-phone");
    home.dataset.pad = "true";
    const homeBody = el("div", "ld-home");
    home.append(homeBody);
    homeCard.append(homeHead, home);

    function paint(loaded) {
      const name = loaded
        ? fade(el("p", "ld-company", "Khamis Arabia"))
        : bone("60%", "var(--space-6)", "var(--radius-s)");
      const balance = el("div", "ld-balance");
      const figure = loaded
        ? fade(el("strong", "", "175,000.00"))
        : bone("75%", "var(--size-sm)", "var(--radius-s)");
      const chips = el("div", "ld-chips");
      ["Transfer", "Pay", "Cards"].forEach((label) => chips.append(el("span", "", label)));
      balance.append(el("span", "ld-hello", "Available balance"), figure, chips);
      const rows = el("div", "ld-rows");
      ACTIVITY.slice(0, 3).forEach((item, index) => {
        rows.append(loaded ? fade(activityRow(index, item), index) : activityRow(index));
      });
      homeBody.replaceChildren(el("p", "ld-hello", "Good morning"), name, balance, el("p", "ld-block-title", "Recent activity"), rows);
    }
    watch(paint);

    const pullCard = el("div", "ld-stage ld-phone-card");
    pullCard.append(el("span", "ld-kicker", "Pull to refresh"));
    const pull = el("div", "ld-phone");
    pull.append(el("h3", "ld-phone-title", "Activity"));
    const pullSpin = el("div", "ld-pull");
    pullSpin.append(spinner("pull", "quiet"));
    const dim = el("div", "ld-rows");
    dim.dataset.dim = "true";
    ACTIVITY.forEach((item, index) => dim.append(activityRow(index, item)));
    pull.append(pullSpin, dim);
    pullCard.append(pull);

    const moreCard = el("div", "ld-stage ld-phone-card");
    moreCard.append(el("span", "ld-kicker", "Loading more · end of list"));
    const more = el("div", "ld-phone");
    more.dataset.end = "true";
    const older = el("div", "ld-rows");
    ACTIVITY.slice(0, 3).forEach((item, index) => older.append(activityRow(index, item)));
    const foot = el("div", "ld-more", "Loading older transactions");
    foot.prepend(spinner("field", null, false));
    foot.setAttribute("role", "status");
    more.append(older, foot);
    moreCard.append(more);

    root.append(homeCard, pullCard, moreCard);
    return root;
  }

  function createLoadingTimeline() {
    const root = el("div", "ld-timeline");
    [
      ["0 – 300 ms", "Show nothing", "quiet"],
      ["300 ms", "Loader appears", "border"],
      ["1 s", "Skeleton holds", "soft"],
      ["3 s", "Show progress", "mid"],
      ["10 s+", "Offer background or Retry", "strong"],
    ].forEach(([label, copy, tone]) => {
      const tick = el("div", "ld-tick");
      tick.dataset.tone = tone;
      tick.append(el("i", ""), el("strong", "", label), el("span", "", copy));
      root.append(tick);
    });
    return root;
  }

  window.createLoadingGuide = createLoadingGuide;
  window.createSkeletonParts = createSkeletonParts;
  window.createSkeletonScreens = createSkeletonScreens;
  window.createLoadingIndicators = createLoadingIndicators;
  window.createLoadingButtons = createLoadingButtons;
  window.createLoadingFields = createLoadingFields;
  window.createLoadingPhones = createLoadingPhones;
  window.createLoadingTimeline = createLoadingTimeline;
  window.reloadLoadingExamples = reloadSkeletons;
})();
