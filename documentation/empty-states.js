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
})();