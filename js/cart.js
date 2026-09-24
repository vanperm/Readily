/* ============================================================
   Readily: cart page
   ============================================================ */

(function () {
  const account = requireRole("member");
  if (!account) return;

  const layout = document.getElementById("cartLayout");
  const meta = document.getElementById("cartMeta");

  function render() {
    const cartIds = Store.getCart(account.id);
    const books = cartIds.map(id => Store.getBook("store", id)).filter(Boolean);
    meta.textContent = books.length ? `${books.length} item${books.length === 1 ? "" : "s"} ready to check out` : "Nothing here yet";

    if (!books.length) {
      layout.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <strong>Your cart is empty</strong>
          <p>Find a book in the store and add it to your cart.</p>
          <a href="browse.html?type=store" class="btn btn-primary btn-sm" style="margin-top:14px;display:inline-block">Browse the Store</a>
        </div>
      `;
      return;
    }

    const itemsHtml = books.map(b => `
      <div class="cart-item" data-id="${b.id}">
        <div class="cc" style="background:${b.cover}"></div>
        <div>
          <h4>${b.title}</h4>
          <div style="font-size:12.5px;color:var(--ink-2)">${b.author}</div>
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <span class="price">${Store.formatPrice(b.price)}</span>
          <button class="btn btn-ghost btn-sm" data-remove="${b.id}">Remove</button>
        </div>
      </div>
    `).join("");

    const total = Store.cartTotal(account.id);

    layout.innerHTML = `
      <div>${itemsHtml}</div>
      <div class="summary-panel">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Items (${books.length})</span><span>${Store.formatPrice(total)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>Instant &middot; digital</span></div>
        <div class="summary-row total"><span>Total</span><span>${Store.formatPrice(total)}</span></div>
        <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:16px">Proceed to Checkout</a>
      </div>
    `;

    layout.querySelectorAll("[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        Store.removeFromCart(account.id, btn.dataset.remove);
        Sound.click();
        Toast.show("Removed from cart.");
        render();
      });
    });
  }

  window.addEventListener("readily:cart-changed", render);
  render();
})();
