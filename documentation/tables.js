(function () {
  const page = document.querySelector('[data-page="data-tables"]');
  if (!page || !window.createDataTable || !window.createTransactionRow) return;

  const ROWS = window.DATA_TABLE_ROWS;
  const TONE = { Settled: "settled", Pending: "pending", Processing: "processing", Scheduled: "scheduled", Declined: "declined", Refunded: "refunded" };
  const AR = { Settled: "مُسدَّد", Pending: "معلّق", Declined: "مرفوضة", Refunded: "مُسترد" };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-dt="${name}"]`);
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

  function reviewButton(row) {
    const button = createButton({ label: "Review", variant: "secondary", size: "sm" });
    button.setAttribute("aria-label", `Review ${row.name}`);
    return button;
  }

  function approvals(density) {
    const total = ROWS.reduce((sum, row) => sum + Math.abs(row.amount), 0);
    return createColumnTable({
      label: "Approvals",
      density,
      rows: ROWS,
      columns: [
        { type: "checkbox" },
        { type: "avatar", label: "Requester" },
        { type: "date", label: "Requested", sort: "desc" },
        { type: "status", label: "Status", priority: "desktop" },
        { type: "amount", label: "Amount" },
        { type: "slot", label: "Action", render: reviewButton },
        { type: "actions" },
      ],
      footer: { label: `Total · ${ROWS.length} transactions`, total },
    });
  }

  function fillWeb() {
    const host = mount("web");
    host.append(block("Preset · filtered, sorted by date", createDataTable({ applied: false }), "Live · filter, sort, select, page"));

    const densityHost = el("div", "dtd-stack");
    let density = "default";
    const table = el("div");
    table.append(approvals(density));
    densityHost.append(
      segment("Table density", [["compact", "Compact · 44"], ["default", "Default · 56"], ["comfortable", "Comfortable · 64"]], density, (value) => {
        density = value;
        table.replaceChildren(approvals(density));
      }),
      table,
    );
    host.append(block("Custom · Slot column (buttons), 10 rows, footer total · Table density", densityHost, "Live · density"));

    const widthHost = el("div", "dtd-stack");
    const frame = el("div", "dtd-frame");
    frame.dataset.width = "desktop";
    frame.append(createDataTable());
    widthHost.append(
      segment("Table breakpoint", [["desktop", "Desktop"], ["tablet", "Tablet · 760"], ["mobile", "Mobile · 390"]], "desktop", (value) => { frame.dataset.width = value; }),
      frame,
    );
    host.append(block("Table breakpoint · Tablet moves date and method under the merchant; Mobile also drops the outline", widthHost, "Live · width"));
  }

  function txRow(row, ar) {
    const declined = row.status === "Declined";
    return createTransactionRow({
      merchant: ar ? row.ar : row.name,
      detail: `${row.time} · ${row.last ? `${ar ? (row.method === "visa" ? "فيزا" : "مدى") : row.method === "visa" ? "Visa" : "mada"} •• ${row.last}` : ar ? "تحويل بنكي" : "Bank transfer"}`,
      initials: row.name.split(/[\s·]+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase(),
      tone: row.tone,
      amount: Math.abs(row.amount),
      flow: declined ? "declined" : row.amount > 0 ? "in" : "out",
      status: { label: ar ? AR[row.status] || row.status : row.status, tone: TONE[row.status], icon: true },
    });
  }

  function dayList(ar) {
    const items = [
      createListHeader({ label: ar ? "اليوم · 19 أكتوبر" : "Today · 19 Oct", total: 2124.5 }),
      ...ROWS.slice(0, 3).map((row) => txRow(row, ar)),
      createListHeader({ label: ar ? "أمس · 18 أكتوبر" : "Yesterday · 18 Oct", total: 2124.5 }),
      ...ROWS.slice(3, 6).map((row) => txRow(row, ar)),
    ];
    return createList({ label: ar ? "العمليات" : "Transactions", items, divided: true });
  }

  function phone(title, body, caption, options = {}) {
    const card = el("figure", "lst-phone-card");
    const screen = el("div", "lst-phone");
    if (options.ar) {
      screen.dir = "rtl";
      screen.lang = "ar";
    }
    const bar = el("div", "lst-phone-bar");
    bar.append(el("span", "lst-phone-large", title));
    const scroll = el("div", "lst-phone-scroll");
    scroll.append(body);
    screen.append(bar, scroll);
    card.append(screen, el("figcaption", "lst-caption", caption));
    return card;
  }

  function fillMobile() {
    const host = mount("mobile");
    host.append(
      phone("Transactions", dayList(false), "iOS · Transaction rows"),
      phone("العمليات", dayList(true), "Android · Arabic · Transaction rows", { ar: true }),
      phone("Transactions", createDataTable({ state: "loading", filters: false }), "iOS · Data table · Loading at Mobile"),
      phone("Transactions", createDataTable(), "Android · Data table at Mobile · filters, compact pagination"),
    );
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

  function row(...nodes) {
    const wrap = el("div", "dtd-row");
    wrap.append(...nodes);
    return wrap;
  }

  function fillComponents() {
    const host = mount("components");
    const bulk = createDataTable({ selected: ["albaik-0", "stc-2", "careem-4"], filters: false });
    const filters = createDataTable({ applied: true });
    host.append(
      specimen("Table header cell", "Top of every Table column.", "Web tables at 600 px and wider.", "Overline label. Sorted shows the arrow; one sorted column at a time. Align End for amounts. Height and padding follow Table density.",
        row(createHeaderCell({ label: "Merchant", sort: "none" }), createHeaderCell({ label: "Date", sort: "desc" }), createHeaderCell({ label: "Amount", sort: "none", align: "end" }))),
      specimen("Table cell", "Inside a Table column, one per row.", "Web tables.", "Type sets the content: Text, Two-line, Avatar, Date, Amount, Status, Checkbox, Actions or Slot. State (Default, Hover, Selected) is set per row.",
        row(...["avatar", "date", "status", "amount"].map((type) => createTableCell({ type, row: ROWS[0] })))),
      specimen("Slot", "Custom content inside a Table cell (Type = Slot).", "Any column that needs a control.", "Prefer Amount, Status badge, Avatar, Button, Toggle or Icon button. Any HALA DNA component works.",
        row(createTableCell({ type: "slot" }), createTableCell({ type: "slot", node: reviewButton(ROWS[0]) }))),
      specimen("Table column", "Custom web-only tables: admin, reports, settings.", "Side by side in a row.", "Add a column, set its Type, give it a Priority so it hides at Tablet. Tables that must work on mobile use Responsive rows instead.",
        el("p", "lst-quiet", "See the approvals table in Web · live: seven columns, Status has Priority Desktop only.")),
      specimen("Responsive row", "Data tables that also ship on mobile: Transactions, Cards, Payroll.", "Inside the Data table preset.", "Below 800 the date and method move under the merchant and the status moves under the amount. The merchant, amount and row menu stay aligned.",
        el("p", "lst-quiet", "Switch Table breakpoint in Web · live to see it restack.")),
      specimen("Bulk bar", "While one or more rows are selected.", "Replaces the filters above the table.", "Count first, then actions; Destructive goes last, Clear ends the bar. Keep to three actions.", bulk.querySelector(".dt-top")),
      specimen("Table filters", "Above every Data table.", "Web pages and phone screens.", "Built from Filters: search, filter pills, applied tags with Clear all, and the result count. On Mobile the pills wrap under the search.", filters.querySelector(".dt-top")),
    );
  }

  function stateCell(name, node) {
    const cell = el("div", "dtd-state");
    cell.append(node, el("span", "lst-kicker", name));
    return cell;
  }

  function fillStates() {
    const host = mount("states");
    const headers = el("div", "dtd-states");
    [["Default", { label: "Merchant" }], ["Hover", { label: "Merchant", state: "hover" }], ["Focus", { label: "Merchant", state: "focus" }], ["Sorted", { label: "Date", sort: "desc" }], ["Align end", { label: "Amount", align: "end" }]]
      .forEach(([name, options]) => headers.append(stateCell(name, createHeaderCell(options))));
    host.append(block("Header cell", headers));
    ["default", "hover", "selected"].forEach((state) => {
      const grid = el("div", "dtd-states dtd-cells");
      ["avatar", "two-line", "text", "date", "status", "amount", "checkbox", "actions", "slot"].forEach((type) => {
        grid.append(stateCell(type.replace("-", " "), createTableCell({ type, row: ROWS[1], state: state === "default" ? undefined : state })));
      });
      host.append(block(`Cell · ${state}`, grid));
    });
    host.append(block("Bulk bar", createDataTable({ selected: ["albaik-0", "stc-2", "careem-4"], filters: false }).querySelector(".dt-top")));
    host.append(block("Data table · Loading", createDataTable({ state: "loading", filters: false })));
    host.append(block("Data table · Empty", createDataTable({ state: "empty", filters: false, live: true })));
    host.append(block("Data table · Error", createDataTable({ state: "error", filters: false }), "Live · Try again"));
  }

  function fillArabic() {
    const host = mount("arabic");
    host.append(block("العربية · مُفلترة", createDataTable({ lang: "ar", applied: true }), "Live"));
    host.append(block("العربية · 3 محددة", createDataTable({ lang: "ar", selected: ["albaik-0", "stc-2", "careem-4"] })));
  }

  function fillPlatforms() {
    const host = mount("platforms");
    [
      ["Web", "Data table, Table column, Table header cell, Table cell, Responsive row, Bulk bar, Table filters", "Rows 44 / 56 / 64 by Table density · 44 px targets for checkbox, sort, row menu and pages · role table, row, columnheader with aria-sort · container queries restack below 800 and drop the outline at 600"],
      ["iOS", "Same names · List with Transaction rows, Table on iPad", "44 pt rows minimum · swipe actions replace the row menu · EditMode for bulk selection · VoiceOver reads merchant, amount, status, then date"],
      ["Android", "Same names · LazyColumn with Responsive rows", "48 dp rows minimum (Compact stays 48) · long-press starts selection and shows the bulk bar in the top app bar · contentDescription merges the row"],
    ].forEach(([platform, api, notes]) => {
      const line = el("div", "lst-platform");
      line.append(el("strong", "", platform), el("span", "lst-mono", api), el("span", "", notes));
      host.append(line);
    });
  }

  function fillMore() {
    const host = mount("more");
    const split = el("div", "tbl-split");
    split.append(createTeamTable(), createInvoiceTable());
    const phones = el("div", "tbl-phones");
    phones.append(createReviewList(), createTerminalCards(), createStatementTable());
    host.append(createSpendTable(), split, phones);
  }

  function fillRules() {
    const host = mount("rules");
    [
      ["Build from Table columns and change Type, Priority or Content.", "Detach the table or draw cells by hand: you lose density, breakpoints and updates."],
      ["End-align amounts in mono with the Riyal sign and their + / − sign.", "Centre amounts, drop the sign, or mirror the digits in Arabic."],
      ["Give every column a Priority and switch to Transaction rows under 600 px.", "Squeeze or horizontally scroll the full table on a phone."],
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
  fillComponents();
  fillStates();
  fillArabic();
  fillPlatforms();
  fillMore();
  fillRules();
})();
