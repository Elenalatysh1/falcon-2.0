(function () {
  const page = document.querySelector('[data-page="navigation"]');
  if (!page || !window.createNavSidebar) return;

  function mount(name) {
    return page.querySelector(`[data-nav="${name}"]`);
  }

  mount("sidebar").append(createNavSidebar());
  mount("mobile-web").append(createNavMobileWeb());
  mount("headers").append(createNavHeaders());
  mount("footers").append(createNavFooters());
  mount("mobile").append(createNavMobile());
  mount("guide").append(createNavGuide());
})();
