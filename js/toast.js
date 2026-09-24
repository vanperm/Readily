/* ============================================================
   Readily: toast notifications
   ============================================================ */

const Toast = (() => {
  function region() {
    let el = document.getElementById("toast-region");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-region";
      document.body.appendChild(el);
    }
    return el;
  }

  function show(message) {
    const r = region();
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="dot"></span><span>${message}</span>`;
    r.appendChild(t);
    setTimeout(() => {
      t.classList.add("leave");
      setTimeout(() => t.remove(), 320);
    }, 3200);
  }

  return { show };
})();
