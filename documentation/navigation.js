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
  mount("guide").append(createNavGuide());
})();
