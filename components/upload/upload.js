/**
 * File upload. Load vendor/hala-icons.js and button.js first.
 *
 * createDropzone({ label, hint, accept, state, lang })
 * createFileRow({ name, size, state, progress, onRemove })
 * createDocumentSlot({ label, hint, state, file, lang })
 */
(function () {
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function glyph(name) {
    const set = window.halaIcons;
    const kebab = { upload: "upload", documents: "file", alert: "alert-circle", close: "x" }[name] || name;
    const key = kebab.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
    if (!set || !set.icons[key]) return null;
    const svg = set.createElement(set.icons[key]);
    svg.classList.add("hala-icon");
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function createDropzone(options = {}) {
    const ar = options.lang === "ar";
    const node = el("div", "upl-drop");
    node.dataset.state = options.state || "empty";
    const tile = el("span", "upl-tile");
    const mark = glyph(options.state === "error" ? "alert" : "upload");
    if (mark) tile.append(mark);
    node.append(
      tile,
      el("strong", "", options.label || (ar ? "أسقط الملف هنا أو اختر" : "Drop a file here or choose")),
      el("p", "", options.hint || (ar ? "PDF أو JPG · حتى 10 MB" : "PDF or JPG · up to 10 MB")),
    );
    return node;
  }

  function createFileRow(options = {}) {
    const row = el("div", "upl-row");
    row.dataset.state = options.state || "done";
    const tile = el("span", "upl-tile");
    const mark = glyph(options.state === "error" ? "alert" : "documents");
    if (mark) tile.append(mark);
    const copy = el("div", "upl-copy");
    copy.append(el("strong", "", options.name || "payroll.csv"), el("span", "", options.size || "248 KB"));
    row.append(tile, copy);
    if (options.state === "progress") {
      const bar = el("span", "upl-bar");
      const fill = el("span", "upl-fill");
      fill.style.width = `${options.progress || 42}%`;
      bar.append(fill);
      copy.append(bar, el("span", "", `${options.progress || 42}%`));
    }
    if (options.state === "error") copy.append(el("span", "upl-error", options.error || "File is over 10 MB. Compress it and try again."));
    const remove = el("button", "upl-x");
    remove.type = "button";
    remove.setAttribute("aria-label", "Remove");
    const close = glyph("close");
    if (close) remove.append(close);
    if (options.onRemove) remove.addEventListener("click", options.onRemove);
    row.append(remove);
    return row;
  }

  function createDocumentSlot(options = {}) {
    const ar = options.lang === "ar";
    const slot = el("div", "upl-slot");
    slot.dataset.state = options.state || "empty";
    slot.append(el("strong", "", options.label || (ar ? "السجل التجاري" : "Commercial registration")));
    if (options.file) slot.append(createFileRow({ ...options.file, onRemove: options.onRemove }));
    else slot.append(el("p", "", options.hint || (ar ? "PDF أو صورة · حتى 10 MB" : "PDF or photo · up to 10 MB")));
    return slot;
  }

  window.createDropzone = createDropzone;
  window.createFileRow = createFileRow;
  window.createDocumentSlot = createDocumentSlot;
})();
