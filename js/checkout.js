/* ============================================================
   Readily: checkout page (mock payment)
   ============================================================ */

(function () {
  const account = requireRole("member");
  if (!account) return;

  const cartIds = Store.getCart(account.id);
  if (!cartIds.length) {
    goTo("cart.html");
    return;
  }

  const summary = document.getElementById("checkoutSummary");
  const form = document.getElementById("checkoutForm");
  const nameField = document.getElementById("ckName");
  const numberField = document.getElementById("ckNumber");
  const expiryField = document.getElementById("ckExpiry");
  const cvcField = document.getElementById("ckCvc");
  const submitBtn = document.getElementById("ckSubmit");

  nameField.value = account.name;

  function renderSummary() {
    const books = Store.getCart(account.id).map(id => Store.getBook("store", id)).filter(Boolean);
    const total = Store.cartTotal(account.id);
    summary.innerHTML = `
      <h3>Order Summary</h3>
      ${books.map(b => `<div class="summary-row"><span>${b.title}</span><span>${Store.formatPrice(b.price)}</span></div>`).join("")}
      <div class="summary-row total"><span>Total</span><span>${Store.formatPrice(total)}</span></div>
    `;
  }
  renderSummary();

  numberField.addEventListener("input", () => {
    const digits = numberField.value.replace(/\D/g, "").slice(0, 16);
    numberField.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
  expiryField.addEventListener("input", () => {
    let v = expiryField.value.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    expiryField.value = v;
  });

  function setError(field, on) { field.closest(".field").classList.toggle("error", on); }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    [numberField, expiryField, cvcField].forEach(f => setError(f, false));

    let hasError = false;
    if (numberField.value.replace(/\D/g, "").length !== 16) { setError(numberField, true); hasError = true; }
    if (!/^\d{2}\/\d{2}$/.test(expiryField.value)) { setError(expiryField, true); hasError = true; }
    if (!/^\d{3,4}$/.test(cvcField.value)) { setError(cvcField, true); hasError = true; }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Processing…";
    setTimeout(() => {
      const order = Store.checkout(account.id);
      Sound.stamp();
      Confetti.burst(submitBtn, 24);
      goTo(`order-confirmation.html?order=${order.id}`);
    }, 650);
  });
})();
