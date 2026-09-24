/* ============================================================
   Readily: Store Staff dashboard controller
   ============================================================ */

(function () {
  const account = requireRole("store-staff");
  if (!account) return;

  const tabs = document.querySelectorAll(".tab-btn");
  const panels = {
    orders: document.getElementById("panelOrders"),
    catalog: document.getElementById("panelCatalog"),
    customers: document.getElementById("panelCustomers"),
    reports: document.getElementById("panelReports")
  };

  function renderStats() {
    const books = Store.getStoreBooks();
    const orders = Store.getOrders();
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const customers = new Set(orders.map(o => o.memberId));
    document.getElementById("statTitles").textContent = books.length;
    document.getElementById("statOrders").textContent = orders.length;
    document.getElementById("statRevenue").textContent = Store.formatPrice(revenue);
    document.getElementById("statCustomers").textContent = customers.size;
  }

  function renderOrders() {
    const orders = [...Store.getOrders()].sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));
    const body = document.getElementById("ordersBody");
    if (!orders.length) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--ink-3)">No orders yet.</td></tr>`;
      return;
    }
    body.innerHTML = orders.map(o => {
      const buyer = Store.getAccount(o.memberId);
      const titles = o.items.map(i => { const b = Store.getBook("store", i.bookId); return b ? b.title : "Removed title"; }).join(", ");
      return `
        <tr>
          <td><code style="font-family:var(--mono);font-size:.8rem">${o.id}</code></td>
          <td>${buyer ? buyer.name : "Unknown"}<div style="font-size:.75rem;color:var(--ink-3)">${buyer ? buyer.email : ""}</div></td>
          <td style="max-width:280px">${titles}</td>
          <td>${Store.formatPrice(o.total)}</td>
          <td>${Store.formatDate(o.purchasedAt)}</td>
        </tr>
      `;
    }).join("");
  }

  function renderCatalog() {
    const books = Store.getStoreBooks();
    const body = document.getElementById("catalogBody");
    body.innerHTML = books.map(book => `
      <tr>
        <td><strong>${book.title}</strong><div style="font-size:.75rem;color:var(--ink-3)">by ${book.author}</div></td>
        <td>${book.genre} &middot; ${book.year}</td>
        <td><code style="font-family:var(--mono);font-size:.82rem">${book.call}</code></td>
        <td><input type="number" min="0.99" step="0.01" value="${book.price}" data-price="${book.id}" style="width:90px;padding:6px 8px;border:1.5px solid var(--line);border-radius:6px;font-family:var(--sans)"></td>
        <td style="text-align:right">
          <a class="btn btn-outline btn-sm" href="book.html?type=store&id=${book.id}" target="_blank" rel="noopener">Preview</a>
          <button class="btn btn-ghost btn-sm" data-remove="${book.id}">Remove</button>
        </td>
      </tr>
    `).join("");

    body.querySelectorAll("[data-price]").forEach(input => input.addEventListener("change", () => {
      const val = Number(input.value);
      if (val > 0) {
        Store.updateStoreBook(input.dataset.price, { price: val });
        Sound.click();
        Toast.show("Price updated.");
        renderReports();
      }
    }));
    body.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => {
      Store.removeBook("store", btn.dataset.remove);
      Sound.click();
      Toast.show("Removed from the catalog.");
      renderAll();
    }));
  }

  function renderCustomers(filter = "") {
    const orders = Store.getOrders();
    const byCustomer = {};
    orders.forEach(o => {
      if (!byCustomer[o.memberId]) byCustomer[o.memberId] = { count: 0, total: 0 };
      byCustomer[o.memberId].count += 1;
      byCustomer[o.memberId].total += o.total;
    });
    const q = filter.trim().toLowerCase();
    let rows = Object.entries(byCustomer).map(([memberId, stats]) => ({ account: Store.getAccount(memberId), ...stats })).filter(r => r.account);
    if (q) rows = rows.filter(r => r.account.name.toLowerCase().includes(q) || r.account.email.toLowerCase().includes(q));
    rows.sort((a, b) => b.total - a.total);

    const body = document.getElementById("customersBody");
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:32px;color:var(--ink-3)">No purchases yet.</td></tr>`;
      return;
    }
    body.innerHTML = rows.map(r => `
      <tr>
        <td><strong>${r.account.name}</strong><div style="font-size:.75rem;color:var(--ink-3)">${r.account.email}</div></td>
        <td>${r.count}</td>
        <td>${Store.formatPrice(r.total)}</td>
      </tr>
    `).join("");
  }

  function renderReports() {
    const orders = Store.getOrders();
    const counts = {};
    orders.forEach(o => o.items.forEach(i => {
      if (!counts[i.bookId]) counts[i.bookId] = { qty: 0, revenue: 0 };
      counts[i.bookId].qty += 1;
      counts[i.bookId].revenue += i.price;
    }));
    const ranked = Object.entries(counts).sort((a, b) => b[1].qty - a[1].qty).slice(0, 10);
    const body = document.getElementById("reportsBody");
    if (!ranked.length) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--ink-3)">No sales yet.</td></tr>`;
      return;
    }
    body.innerHTML = ranked.map(([bookId, stats], i) => {
      const book = Store.getBook("store", bookId);
      if (!book) return "";
      return `<tr><td>${i + 1}</td><td><strong>${book.title}</strong></td><td>${book.genre}</td><td>${stats.qty}</td><td>${Store.formatPrice(stats.revenue)}</td></tr>`;
    }).join("");
  }

  function renderAll() {
    renderStats();
    renderOrders();
    renderCatalog();
    renderCustomers(document.getElementById("customerSearch").value);
    renderReports();
  }

  tabs.forEach(btn => btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.toggle("active", b === btn));
    Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== btn.dataset.tab; });
    Sound.click();
  }));

  document.getElementById("customerSearch").addEventListener("input", (e) => renderCustomers(e.target.value));

  const intakeModal = document.getElementById("intakeModal");
  document.getElementById("btnOpenIntake").addEventListener("click", () => { intakeModal.hidden = false; Sound.click(); });
  document.getElementById("btnCancelIntake").addEventListener("click", () => { intakeModal.hidden = true; });
  document.getElementById("intakeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("newTitle").value.trim();
    const author = document.getElementById("newAuthor").value.trim();
    if (!title || !author) { Toast.show("Please enter at least a title and author."); return; }
    const book = Store.addStoreBook({
      title, author,
      genre: document.getElementById("newGenre").value,
      year: document.getElementById("newYear").value,
      price: document.getElementById("newPrice").value,
      blurb: document.getElementById("newBlurb").value,
      excerpt: document.getElementById("newExcerpt").value
    });
    Sound.stamp();
    Toast.show(`Added "${book.title}" to the store catalog.`);
    e.target.reset();
    intakeModal.hidden = true;
    renderAll();
  });

  const resetModal = document.getElementById("resetModal");
  document.getElementById("btnResetDemo").addEventListener("click", () => { resetModal.hidden = false; });
  document.getElementById("btnCancelReset").addEventListener("click", () => { resetModal.hidden = true; });
  document.getElementById("btnConfirmReset").addEventListener("click", () => {
    Store.resetDemo();
    goTo("index.html");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { intakeModal.hidden = true; resetModal.hidden = true; }
  });

  window.addEventListener("readily:orders-changed", renderAll);
  window.addEventListener("readily:catalog-changed", renderAll);

  renderAll();
})();
