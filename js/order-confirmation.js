/* ============================================================
   Readily: order confirmation / receipt
   ============================================================ */

(function () {
  const account = requireRole("member");
  if (!account) return;

  const params = new URLSearchParams(location.search);
  const orderId = params.get("order");
  const order = Store.getOrdersForMember(account.id).find(o => o.id === orderId);
  const card = document.getElementById("receiptCard");

  if (!order) {
    card.innerHTML = `
      <h1>No order found</h1>
      <p style="color:var(--ink-2)">We couldn't find that receipt. Head back to browsing.</p>
      <a href="browse.html" class="btn btn-primary" style="margin-top:16px">Back to Browsing</a>
    `;
    return;
  }

  const books = order.items.map(i => Store.getBook("store", i.bookId)).filter(Boolean);

  card.innerHTML = `
    <div class="receipt-check">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h1>Order confirmed</h1>
    <p style="color:var(--ink-2);font-size:13.5px;margin-bottom:22px">Purchased ${Store.formatDateTime(order.purchasedAt)} &middot; added to your library</p>
    <div style="text-align:left;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:14px 0;margin-bottom:16px">
      ${books.map(b => `<div class="summary-row"><span>${b.title}</span><span>${Store.formatPrice(b.price)}</span></div>`).join("")}
      <div class="summary-row total"><span>Total</span><span>${Store.formatPrice(order.total)}</span></div>
    </div>
    <a href="my-books.html" class="btn btn-primary btn-block">Go to My Books</a>
    <a href="browse.html" class="btn btn-ghost" style="margin-top:10px;display:inline-block">Keep Browsing</a>
  `;
})();
