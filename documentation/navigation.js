(function () {
  const page = document.querySelector('[data-page="navigation"]');
  if (!page || !window.createNavShell) return;

  function mount(name) {
    return page.querySelector(`[data-nav="${name}"]`);
  }

  mount("shell").append(createNavShell());
  mount("mobile").append(createNavMobile());
  mount("top-bars").append(createNavTopBars());
  mount("liquid").append(createNavLiquidBars());
  mount("states").append(createNavStates());
  mount("arabic").append(
    createNavShell({ locale: "ar" }),
    createNavMobile({ locale: "ar", controls: false })
  );
  mount("mobile-web").append(createNavMobileWeb());
  mount("headers").append(createNavHeaders());
  mount("footers").append(createNavFooters());
  mount("motion").append(createNavMotion());
  mount("guide").append(createNavGuide());

  const rules = [
    ["Keep 4 tabs in the mobile tab bar and 5–8 main items in the sidebar.", "Add a fifth tab or nest menus inside the sidebar."],
    ["Collapse to the 80 rail on tablet and show labels as tooltips.", "Hide the sidebar completely on tablet or truncate labels in the rail."],
    ["Put the sidebar on the right in Arabic and mirror back arrows.", "Mirror the logo, counters, close icons or amounts."],
  ];
  const host = mount("rules");
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
      const label = document.createElement("strong");
      label.textContent = ok ? "Do" : "Don't";
      const copy = document.createElement("p");
      copy.textContent = text;
      line.append(label, copy);
      card.append(line);
    });
    host.append(card);
  });
})();
