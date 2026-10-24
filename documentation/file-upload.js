(function () {
  const page = document.querySelector('[data-page="file-upload"]');
  if (!page || !window.createDropzone) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function mount(name) {
    return page.querySelector(`[data-upl="${name}"]`);
  }

  function pairs(host, items) {
    items.forEach(([yes, no], index) => {
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

  mount("dropzone").append(
    createDropzone({}),
    createDropzone({ state: "error", hint: "PDF or JPG · up to 10 MB. This file is 18 MB." }),
  );

  const compact = mount("compact");
  compact.append(
    createFileRow({ name: "CR-Khamis.pdf", size: "1.2 MB", state: "done" }),
    createFileRow({ name: "payroll-oct.csv", size: "248 KB", state: "progress", progress: 62 }),
    createFileRow({ name: "receipt.jpg", size: "12 MB", state: "error", error: "File is over 10 MB. Compress it and try again." }),
  );

  const slots = mount("slots");
  slots.append(
    createDocumentSlot({ label: "Commercial registration", state: "empty" }),
    createDocumentSlot({ label: "National ID / Iqama", state: "done", file: { name: "id-front.jpg", size: "640 KB", state: "done" } }),
    createDocumentSlot({ label: "VAT certificate", hint: "Optional · PDF or photo" }),
  );

  mount("import").append(
    createDropzone({ label: "Drop the payroll CSV", hint: "CSV · columns: name, IBAN, amount" }),
    createFileRow({ name: "payroll-oct.csv", size: "248 KB · 42 rows", state: "done" }),
  );

  const mobile = mount("mobile");
  mobile.append(createDropzone({ label: "Take a photo or choose a file", hint: "Camera first for receipts and IDs" }));

  const arabic = mount("arabic");
  const wrap = el("div");
  wrap.dir = "rtl";
  wrap.lang = "ar";
  wrap.style.fontFamily = "var(--font-arabic)";
  wrap.append(
    createDropzone({ lang: "ar" }),
    createFileRow({ name: "payroll-oct.csv", size: "248 KB", state: "progress", progress: 62 }),
    createDocumentSlot({ lang: "ar", label: "السجل التجاري" }),
  );
  arabic.append(wrap);

  pairs(mount("rules"), [
    ["State types, size and count limits before the user chooses a file.", "Write “Upload failed”. Say why and what to do."],
    ["Show progress and time left for anything over 1 MB, and let users cancel.", "Clear other files when one fails, or drop the failed one silently."],
    ["Use one slot per required document so missing items are obvious.", "Start payroll or transfers from a file until every row is checked."],
    ["On mobile, offer the camera first for receipts and IDs.", "Write “SAR” in totals. Use the Riyal sign with mono numbers."],
  ]);
})();
