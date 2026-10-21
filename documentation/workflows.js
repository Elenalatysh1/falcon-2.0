(function () {
  const page = document.querySelector('[data-page="workflows"]');
  if (!page || !window.createButton || !window.createBadge) return;

  const catalog = {
    cards: "credit-card",
    confirm: "check",
    forward: "arrow-right",
    pos: "smartphone",
    transfers: "send",
    users: "users",
  };
  const mirror = new Set(["arrow-right", "send"]);
  const actors = {
    Employee: ["warning", "EM"],
    Manager: ["info", "MG"],
    Admin: ["brand", "AD"],
    Owner: ["brand", "OW"],
    Hala: ["ink", "H"],
    "New user": ["scheduled", "NU"],
    Courier: ["neutral", "CR"],
    Finance: ["info", "FI"],
  };
  const statuses = {
    Draft: "draft",
    Pending: "pending",
    Approved: "settled",
    Rejected: "declined",
    Processing: "processing",
    Shipped: "info",
    Active: "settled",
    Frozen: "frozen",
    Invited: "scheduled",
    Expired: "expired",
    Sent: "settled",
    Scheduled: "scheduled",
    Failed: "declined",
    Delivered: "info",
    Blocked: "declined",
  };

  const web = ["Web", "Mobile"];
  const desk = ["Web"];
  const phone = ["Mobile"];

  function step(title, summary, actor, platforms, screen, components, detail, rules, errors, type) {
    return { title, summary, actor, platforms, screen, components, detail, rules, errors, type };
  }

  const workflows = [
    {
      name: "Request a card",
      icon: "cards",
      goal: "An employee asks for a company card with a limit; a manager approves; Hala issues it and the employee activates it.",
      meta: [["Time", "2 min + approval"], ["Steps", "7"], ["Approval", "1 level"], ["Platforms", "Web, iOS, Android"]],
      actors: [["Employee", "Requests and activates"], ["Manager", "Approves or rejects"], ["Hala", "Issues and ships"]],
      steps: [
        step("Choose card type", "Virtual or physical", "Employee", web, "Cards › Request", ["Selection cards", "Progress bar"], "Two selection cards. Virtual is ready instantly; physical arrives in 3–5 business days.", ["Virtual preselected", "Physical needs a delivery address"], [["Card limit reached", "Company has the maximum number of cards; banner with link to Settings."]]),
        step("Set limit and purpose", "Amount chips + reason", "Employee", web, "Cards › Request › Limit", ["Amount input", "Chips", "Text area"], "Monthly limit with chips (5k, 10k, 25k) and a short reason the approver will read.", ["Limit ≤ company policy", "Reason required above SAR 10,000"], [["Above policy", 'Amber note: "Needs Owner approval".']]),
        step("Review and submit", "Check details", "Employee", web, "Review", ["Review summary", "Primary button"], "Card type, holder, limit, merchant categories and who will approve.", ["Shows approver by name"], [["Network error", "Keep draft; retry button."]]),
        step("Approve?", "Manager decides", "Manager", web, "Approvals", ["Approval chain", "Drawer", "Text area"], "Manager gets a push and sees the request in Approvals with the reason.", ["Reject needs a reason", "Cannot approve own request"], [["No response 24 h", "Reminder, then escalate to Owner."]], "decision"),
        step("Issue card", "Hala creates it", "Hala", web, "—", ["Status timeline"], "Virtual card is created in seconds; physical card is produced and handed to courier.", ["Card frozen until activation"], [["Issuer down", 'Status "Delayed", notify both.']]),
        step("Activate", "Set PIN, add to wallet", "Employee", phone, "Cards › Activate", ["OTP input", "PIN input"], "Confirm with OTP, set a 4-digit PIN, offer Apple Pay and Google Pay.", ["PIN not 1234 or 0000"], [["Wrong OTP 3×", "Locked 5 min; Nafath option."]]),
        step("Card active", "Ready to use", "Hala", web, "Cards › Detail", ["Badge", "Toast"], "Card shows Active; employee and manager are notified.", [], [], "end"),
      ],
      statuses: [["Draft", "Saved, not submitted"], ["Pending", "Waiting for approval"], ["Rejected", "With reason; can resubmit"], ["Processing", "Being issued"], ["Shipped", "Physical card on the way"], ["Active", "Ready to use"]],
      notifications: [["Card request to approve", "Manager", "Push"], ["Card approved", "Employee", "Push"], ["Card shipped", "Employee", "SMS"], ["Card active", "Employee, Manager", "In-app"]],
      permissions: [["Request", "Any employee"], ["Approve", "Manager, Owner"], ["Set limits above policy", "Owner"], ["Freeze or cancel", "Holder, Admin"]],
    },
    {
      name: "Order POS terminal",
      icon: "pos",
      goal: "A business orders terminals, picks a plan, assigns them to branches and pays; Hala delivers and installs them.",
      meta: [["Time", "4 min"], ["Steps", "7"], ["Delivery", "3–5 days"], ["Platforms", "Web, iOS, Android"]],
      actors: [["Admin", "Orders and pays"], ["Hala", "Delivers and activates"], ["Courier", "Installs on site"]],
      steps: [
        step("Choose terminals", "Model + quantity", "Admin", web, "POS › Order", ["Selection cards", "Stepper", "Order summary"], "Smart POS, Mini, Tap on Phone with quantity steppers and a live summary.", ["At least 1 terminal", "Total with VAT always visible"], [["Out of stock", 'Card shows "Back in 2 weeks"; still orderable.']]),
        step("Pick a plan", "Rent or buy", "Admin", web, "POS › Order › Plan", ["Radio cards", "Toggle"], "Monthly, annual (20% less) or buy; instant settlement toggle.", ["Fees shown per terminal"], []),
        step("Assign branches", "Where each goes", "Admin", web, "POS › Order › Branches", ["Stepper", "Inline alert"], "Spread terminals across branches; on-site contact and delivery window.", ["Sum must equal ordered quantity"], [["Mismatch", "Amber alert; Continue disabled with reason."]]),
        step("Review and pay", "Agree to terms", "Admin", web, "POS › Order › Review", ["Review summary", "Checkbox", "OTP input"], "Full order, fees, VAT, payment account; confirm with OTP.", ["Terms must be accepted"], [["Low balance", 'Error with "Add money".']]),
        step("Prepare and ship", "Configured per branch", "Hala", web, "POS › Orders", ["Status timeline"], "Terminals are configured with branch names and shipped.", [], [["Delay", "New date and reason shown on the order."]]),
        step("Install", "On-site activation", "Courier", phone, "—", ["SMS"], "Courier texts the contact, installs and runs a test transaction.", ["Contact confirms with code"], [["Nobody on site", "Reschedule link by SMS."]]),
        step("Terminals live", "Accepting payments", "Hala", web, "POS › Terminals", ["Badge", "Notification"], "Each terminal shows Active and its first sale.", [], [], "end"),
      ],
      statuses: [["Draft", "Order not placed"], ["Processing", "Being prepared"], ["Shipped", "With courier"], ["Delivered", "Installed"], ["Active", "Taking payments"]],
      notifications: [["Order placed", "Admin", "Email"], ["Out for delivery", "Branch contact", "SMS"], ["Terminal active", "Admin", "Push"]],
      permissions: [["Order terminals", "Admin, Owner"], ["Assign to branch", "Admin"], ["Pay", "Owner, Finance"]],
    },
    {
      name: "Add a user",
      icon: "users",
      goal: "An admin invites a team member with a role and limits; the person accepts, verifies identity and gets access.",
      meta: [["Time", "1 min + invitee"], ["Steps", "6"], ["Invite valid", "7 days"], ["Platforms", "Web"]],
      actors: [["Admin", "Invites and sets role"], ["New user", "Accepts and verifies"], ["Hala", "Checks identity"]],
      steps: [
        step("Enter details", "Name, mobile, email", "Admin", desk, "Users › Invite", ["Inputs", "Phone input"], "Full name, Saudi mobile and work email.", ["Mobile +966 5XXXXXXXX", "No duplicate users"], [["Already a user", "Inline error with link to their profile."]]),
        step("Choose role", "Permissions preset", "Admin", desk, "Users › Invite › Role", ["Radio cards", "Accordion"], "Viewer, Employee, Manager, Admin; expand to see exactly what each can do.", ["Only Owner can add Admins"], []),
        step("Set limits", "Spending and approvals", "Admin", desk, "Users › Invite › Limits", ["Amount input", "Toggle"], "Daily transfer limit, card request rights, approval rights.", ["Limit ≤ inviter's limit"], []),
        step("Confirm", "OTP for admin action", "Admin", desk, "Review", ["Review summary", "OTP input"], "Review and confirm with OTP; invite is sent.", ["New Admin role needs Nafath"], [["Wrong OTP", "Attempts left; lockout after 3."]]),
        step("Accept invite", "Verify with Nafath", "New user", web, "Invite link", ["Nafath", "Password"], "Opens link, verifies with Nafath, sets password and Face ID.", ["Name must match national ID"], [["Expired link", "Ask admin to resend."], ["Name mismatch", "Admin is asked to correct."]], "decision"),
        step("User active", "Access granted", "Hala", web, "Users", ["Badge", "Toast"], "User shows Active; admin is notified.", [], [], "end"),
      ],
      statuses: [["Invited", "Waiting for the person"], ["Expired", "Link older than 7 days"], ["Active", "Can sign in"], ["Blocked", "Access removed"]],
      notifications: [["Invitation", "New user", "SMS"], ["Invite accepted", "Admin", "In-app"], ["New admin added", "Owner", "Email"]],
      permissions: [["Invite users", "Admin, Owner"], ["Add Admins", "Owner"], ["Remove users", "Admin, Owner"]],
    },
    {
      name: "Send a transfer",
      icon: "transfers",
      goal: "A user sends money to a beneficiary; large amounts go through approval; the recipient receives it.",
      meta: [["Time", "1 min"], ["Steps", "6"], ["Approval", "Over SAR 20,000"], ["Platforms", "Web, iOS, Android"]],
      actors: [["Employee", "Creates transfer"], ["Finance", "Approves"], ["Hala", "Sends via sarie"]],
      steps: [
        step("Pick beneficiary", "Saved or new IBAN", "Employee", web, "Transfers › New", ["Search", "IBAN field"], "Recent and saved beneficiaries; add new with IBAN and bank detection.", ["IBAN checksum", "New beneficiary needs OTP"], [["Invalid IBAN", "Inline error, keep input."]]),
        step("Enter amount", "With available balance", "Employee", web, "Transfers › Amount", ["Amount input"], "Amount, reference and optional note.", ["≤ available balance", "≤ daily limit"], [["Over balance", "Red error; button disabled."]]),
        step("Review", "Fees and arrival", "Employee", web, "Review", ["Review summary"], "From, to, amount, fee, VAT, arrival time.", ["Shows approver when needed"], []),
        step("Approve?", "Over SAR 20,000", "Finance", web, "Approvals", ["Approval chain"], "Sequential approval with reasons on reject.", ["Requester cannot approve"], [["Rejected", "Requester edits and resubmits."]], "decision"),
        step("Send", "Via sarie", "Hala", web, "—", ["Status timeline"], "Sent instantly Sun–Thu, 24/7 via sarie.", [], [["Returned", "Funds back; reason shown."]]),
        step("Received", "Confirmed", "Hala", web, "Transactions", ["Toast", "Receipt"], "Status Sent; downloadable receipt.", [], [], "end"),
      ],
      statuses: [["Draft", "Not submitted"], ["Pending", "Waiting for approval"], ["Scheduled", "Will send later"], ["Sent", "Delivered to bank"], ["Failed", "Returned with reason"]],
      notifications: [["Transfer to approve", "Finance", "Push"], ["Transfer sent", "Employee", "Push"], ["Receipt", "Employee", "Email"]],
      permissions: [["Create transfer", "Employee and up"], ["Approve", "Finance, Owner"], ["Add beneficiary", "Manager and up"]],
    },
  ];

  const rules = [
    ["01", "Show progress", "Every flow over 2 steps has a progress bar and a clear step name."],
    ["02", "Review before commit", "Money, cards, users: always a review step before the final action."],
    ["03", "Approval is visible", "Requester sees who must approve and the status, any time."],
    ["04", "Save drafts", "Leaving mid-flow keeps a draft; closing asks only if something was entered."],
    ["05", "OTP for risk", "New beneficiary, limit increase, new admin: confirm with OTP."],
    ["06", "Notify both sides", "Requester and approver get push and in-app; email for final results."],
    ["07", "Recoverable errors", "Explain the reason and the fix; keep what was entered."],
    ["08", "Same flow, both platforms", "Same steps and names on web and mobile; only layout changes."],
  ];

  const state = { workflow: 0, step: 0 };

  function pascal(kebab) {
    return kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function icon(name, size) {
    const lucide = window.lucide;
    const kebab = catalog[name] || name;
    if (!lucide || !lucide.icons[pascal(kebab)]) return null;
    const svg = lucide.createElement(lucide.icons[pascal(kebab)]);
    svg.classList.add("hala-icon");
    svg.dataset.icon = kebab;
    if (size) svg.dataset.size = size;
    if (mirror.has(kebab)) svg.dataset.mirror = "true";
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-wf="${name}"]`);
  }

  function actorTone(name) {
    return (actors[name] || actors.Hala)[0];
  }

  function kind(item) {
    if (item.type === "decision") return "decision";
    if (item.type === "end") return "end";
    if (item.actor === "Hala") return "system";
    return "step";
  }

  function badge(options) {
    return createBadge(options);
  }

  function action(options, onClick) {
    const button = createButton(options);
    button.addEventListener("click", onClick);
    return button;
  }

  function reveal(node) {
    const scroller = node.closest(".wf-flow");
    if (!scroller) return;
    const view = scroller.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    if (box.left < view.left) scroller.scrollLeft -= view.left - box.left;
    else if (box.right > view.right) scroller.scrollLeft += box.right - view.right;
  }

  function render(focus) {
    const current = workflows[state.workflow];
    const tabs = mount("tabs");
    const summary = mount("summary");
    const flow = mount("flow");
    const detail = mount("step");
    const records = mount("records");
    tabs.replaceChildren();
    summary.replaceChildren();
    flow.replaceChildren();
    detail.replaceChildren();
    records.replaceChildren();

    workflows.forEach((item, index) => {
      const on = index === state.workflow;
      const tab = action({
        label: item.name,
        variant: on ? "ink" : "secondary",
        size: "md",
        icon: item.icon,
      }, () => {
        state.workflow = index;
        state.step = 0;
        render(`tab-${index}`);
      });
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.dataset.focus = `tab-${index}`;
      tabs.append(tab);
    });

    const card = el("div", "card wf-summary wf-enter");
    const lead = el("div", "wf-lead");
    const title = el("div", "wf-title");
    const mark = el("span", "wf-mark");
    const glyph = icon(current.icon, "nav");
    if (glyph) mark.append(glyph);
    title.append(mark, el("h3", "wf-name type-heading-l", current.name));
    const meta = el("div", "wf-meta");
    current.meta.forEach(([key, value]) => {
      meta.append(badge({ variant: "tag", key, label: value }));
    });
    lead.append(title, el("p", "wf-goal type-body-m", current.goal), meta);

    const people = el("div", "wf-actors");
    people.append(el("span", "kicker quiet", "Actors"));
    current.actors.forEach(([name, description]) => {
      const row = el("div", "wf-actor");
      const avatar = el("span", "wf-avatar", (actors[name] || actors.Hala)[1]);
      avatar.dataset.tone = actorTone(name);
      const copy = el("div", "wf-person");
      copy.append(el("strong", "", name), el("span", "", description));
      row.append(avatar, copy);
      people.append(row);
    });
    card.append(lead, people);
    summary.append(card);

    const track = el("div", "wf-track");
    current.steps.forEach((item, index) => {
      const wrap = el("div", "wf-step-wrap");
      const on = index === state.step;
      const node = el("button", "wf-step");
      node.type = "button";
      node.dataset.kind = kind(item);
      node.dataset.focus = `step-${index}`;
      node.setAttribute("aria-pressed", on ? "true" : "false");
      const top = el("div", "wf-step-top");
      top.append(
        el("span", "wf-index", String(index + 1).padStart(2, "0")),
        badge({ label: item.actor, tone: actorTone(item.actor), size: "sm" })
      );
      const platforms = el("div", "wf-plats");
      item.platforms.forEach((platform) => {
        platforms.append(badge({ label: platform, variant: "feature", tone: "neutral", size: "sm" }));
      });
      node.append(top, el("span", "wf-step-title", item.title), el("span", "wf-step-copy", item.summary), platforms);
      node.addEventListener("click", () => {
        state.step = index;
        render(`step-${index}`);
      });
      wrap.append(node);
      if (index < current.steps.length - 1) {
        const arrow = el("span", "wf-arrow");
        const forward = icon("forward", "default");
        if (forward) arrow.append(forward);
        wrap.append(arrow);
      }
      track.append(wrap);
    });
    const scroller = el("div", "card wf-flow");
    scroller.append(track);
    flow.append(scroller);

    const item = current.steps[state.step];
    const panel = el("div", "card wf-detail wf-enter");
    const copy = el("div", "wf-copy-stack");
    const eyebrow = el("div", "wf-step-top");
    eyebrow.append(
      el("span", "kicker", `Step ${String(state.step + 1).padStart(2, "0")}`),
      badge({ label: item.actor, tone: actorTone(item.actor), size: "sm" }),
      el("span", "wf-screen", item.screen)
    );
    const chips = el("div", "wf-chips");
    item.components.forEach((name) => {
      chips.append(badge({ label: name, variant: "outline", tone: "neutral", size: "sm" }));
    });
    const components = el("div", "wf-copy-stack");
    components.append(el("span", "kicker quiet", "Components"), chips);
    const actions = el("div", "wf-actions");
    const previous = action({
      label: "Previous",
      variant: "secondary",
      size: "md",
      icon: "back",
      disabled: state.step === 0,
    }, () => {
      if (state.step === 0) return;
      state.step -= 1;
      render("previous");
    });
    previous.dataset.focus = "previous";
    const next = action({
      label: "Next step",
      variant: "ink",
      size: "md",
      icon: "forward",
      iconPosition: "trailing",
      disabled: state.step === current.steps.length - 1,
    }, () => {
      if (state.step === current.steps.length - 1) return;
      state.step += 1;
      render("next");
    });
    next.dataset.focus = "next";
    actions.append(previous, next);
    copy.append(eyebrow, el("h3", "wf-step-name type-heading-m", item.title), el("p", "wf-long type-body-m", item.detail), components, actions);

    const side = el("div", "wf-side");
    if (item.rules.length) {
      const well = el("div", "wf-well");
      well.dataset.tone = "success";
      well.append(el("span", "kicker", "Validation and rules"));
      item.rules.forEach((rule) => {
        const row = el("div", "wf-check");
        const tick = icon("confirm", "inline");
        if (tick) row.append(tick);
        row.append(el("span", "", rule));
        well.append(row);
      });
      side.append(well);
    }
    if (item.errors.length) {
      const well = el("div", "wf-well");
      well.dataset.tone = "error";
      well.append(el("span", "kicker", "Errors and edge cases"));
      item.errors.forEach(([titleText, body]) => {
        const row = el("div", "wf-error");
        row.append(el("strong", "", titleText), el("span", "", body));
        well.append(row);
      });
      side.append(well);
    }
    panel.append(copy);
    if (side.childElementCount) panel.append(side);
    detail.append(panel);

    const columns = [
      ["Statuses", current.statuses.map(([label, text]) => {
        const row = el("div", "wf-line");
        row.append(badge({ label, tone: statuses[label] || "neutral", size: "sm" }), el("span", "wf-status-copy", text));
        return row;
      })],
      ["Notifications sent", current.notifications.map(([label, to, channel]) => {
        const row = el("div", "wf-line");
        row.dataset.layout = "start";
        const note = el("div", "wf-note");
        note.append(el("strong", "", label), el("span", "", `To ${to}`));
        row.append(badge({ label: channel, variant: "feature", tone: "info", size: "sm" }), note);
        return row;
      })],
      ["Permissions", current.permissions.map(([label, who]) => {
        const row = el("div", "wf-line wf-perm");
        row.append(el("span", "", label), el("b", "", who));
        return row;
      })],
    ];
    columns.forEach(([heading, lines]) => {
      const column = el("div", "card wf-record");
      const list = el("div", "wf-lines");
      lines.forEach((line) => list.append(line));
      column.append(el("span", "wf-card-title", heading), list);
      records.append(column);
    });

    const selected = flow.querySelector('[aria-pressed="true"]');
    if (selected) reveal(selected);
    if (focus) {
      const target = page.querySelector(`[data-focus="${focus}"]`);
      if (target) target.focus();
    }
  }

  const legend = mount("legend");
  [["step", "Person does it"], ["system", "Hala does it"], ["decision", "Decision"], ["end", "End state"]].forEach(([name, label]) => {
    const item = el("span", "wf-legend-item");
    const key = el("span", "wf-key");
    key.dataset.kind = name;
    item.append(key, document.createTextNode(label));
    legend.append(item);
  });

  const ruleList = mount("rules");
  rules.forEach(([number, title, text]) => {
    const card = el("div", "rule");
    card.append(el("span", "kicker", number), el("strong", "", title), el("span", "wf-rule-copy", text));
    ruleList.append(card);
  });

  render();
})();
