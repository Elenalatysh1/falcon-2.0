(function () {
  const page = document.querySelector('[data-page="empty-states"]');
  if (!page || !window.createEmptyAnatomy) return;

  function mount(name) {
    return page.querySelector(`[data-empty="${name}"]`);
  }

  mount("anatomy").append(createEmptyAnatomy());
  mount("charts").append(createEmptyCharts());
  mount("tables").append(createEmptyTable());
  mount("widgets").append(createEmptyWidgets());
  mount("pages").append(createEmptyPages());
  mount("mobile").append(createEmptyPhones());
  mount("writing").append(createEmptyWriting());

  const arabic = mount("arabic");
  if (arabic) {
    const card = document.createElement("div");
    card.className = "es-card";
    card.dir = "rtl";
    card.lang = "ar";
    card.style.fontFamily = "var(--font-arabic)";
    card.style.textAlign = "center";
    card.style.padding = "var(--pad-card-y) var(--pad-card-x)";
    const title = document.createElement("strong");
    title.textContent = "لا بطاقات بعد";
    const copy = document.createElement("p");
    copy.textContent = "اطلب بطاقة افتراضية للبدء في الإنفاق.";
    copy.style.margin = "0";
    copy.style.color = "var(--text-secondary)";
    const action = window.createButton
      ? createButton({ label: "طلب بطاقة", variant: "primary", size: "md" })
      : document.createElement("span");
    card.append(window.createIconTile ? createIconTile({ icon: "cards", size: "feature", tone: "brand" }) : document.createElement("span"), title, copy, action);
    arabic.append(card);
  }

  const rules = [
    ["Say what will appear here and how to get it.", "Write only “No data” or leave a blank table."],
    ["Offer one action that creates the first item.", "Add two or three competing buttons."],
    ["For empty search or filter results, offer “Clear filters”.", "Show the first-use empty state when filters hid everything."],
  ];
  const host = mount("rules");
  if (host) {
    rules.forEach(([yes, no], index) => {
      const card = document.createElement("div");
      card.className = "lst-rule";
      const kicker = document.createElement("span");
      kicker.className = "lst-kicker";
      kicker.textContent = String(index + 1).padStart(2, "0");
      card.append(kicker);
      [[true, yes], [false, no]].forEach(([ok, text]) => {
        const line = document.createElement("div");
        line.className = "lst-rule-line";
        line.dataset.ok = ok ? "true" : "false";
        const strong = document.createElement("strong");
        strong.textContent = ok ? "Do" : "Don't";
        const p = document.createElement("p");
        p.textContent = text;
        line.append(strong, p);
        card.append(line);
      });
      host.append(card);
    });
  }
})();