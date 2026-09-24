/* ============================================================
   Readily: My Books — Loans, Purchased, Favorites,
   Reading History, Reading Goal.
   ============================================================ */

(function () {
  const account = requireRole("member");
  if (!account) return;

  const tabs = document.querySelectorAll(".tab-btn");
  const panels = {
    loans: document.getElementById("panelLoans"),
    purchased: document.getElementById("panelPurchased"),
    favorites: document.getElementById("panelFavorites"),
    history: document.getElementById("panelHistory"),
    goal: document.getElementById("panelGoal")
  };
  const meta = document.getElementById("pageMeta");

  function coverHtml(book) {
    return `<div class="loan-cover" style="background:${book.cover}">${renderCoverArt(book.id, "small")}<span>${book.title}</span></div>`;
  }

  function dueTag(loan) {
    const days = Store.daysUntilDue(loan);
    let cls = "";
    let label = `Due in ${days} day${days === 1 ? "" : "s"}`;
    if (days < 0) { cls = "over"; label = `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`; }
    else if (days <= 3) cls = "soon";
    return `<span class="due-tag ${cls}">${label} &middot; ${Store.formatDate(loan.dueAt)}</span>`;
  }

  function renderLoans() {
    const loans = Store.getLoansForMember(account.id).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
    document.getElementById("badgeLoans").textContent = loans.length;
    if (!loans.length) {
      panels.loans.innerHTML = `<div class="empty-state"><strong>No active loans</strong><p>Borrow a book from the library and it will show up here.</p><a href="browse.html?type=library" class="btn btn-primary btn-sm" style="margin-top:14px;display:inline-block">Browse the Library</a></div>`;
      return;
    }
    panels.loans.innerHTML = loans.map(loan => {
      const book = Store.getBook("library", loan.bookId);
      if (!book) return "";
      return `
        <div class="loan-card" data-loan="${loan.id}" style="--accent:${genreColor(book.genre)}">
          ${coverHtml(book)}
          <div class="loan-body">
            <h3>${book.title}</h3>
            <div class="author">${book.author}</div>
            <div class="loan-tags">${dueTag(loan)}${loan.renewals ? `<span class="tag">renewed ${loan.renewals}x</span>` : ""}</div>
          </div>
          <div class="loan-actions">
            <a class="btn btn-outline btn-sm" href="book.html?type=library&id=${book.id}">Read</a>
            <button class="btn btn-secondary btn-sm" data-renew="${loan.id}">Renew (+14d)</button>
            <button class="btn btn-danger btn-sm" data-return="${loan.id}">Return</button>
          </div>
        </div>
      `;
    }).join("");

    panels.loans.querySelectorAll("[data-renew]").forEach(btn => btn.addEventListener("click", () => {
      const r = Store.renewLoan(btn.dataset.renew, 14);
      if (r) { Sound.stamp(); Toast.show(`Renewed! New due date ${Store.formatDate(r.dueAt)}.`); renderLoans(); }
    }));
    panels.loans.querySelectorAll("[data-return]").forEach(btn => btn.addEventListener("click", () => {
      const card = btn.closest(".loan-card");
      card.classList.add("leaving");
      Confetti.burst(btn, 16);
      Sound.success();
      setTimeout(() => { Store.returnLoan(btn.dataset.return); Toast.show("Returned. Added to your Reading History."); renderLoans(); renderHistory(); }, 260);
    }));
  }

  function renderPurchased() {
    const orders = Store.getOrdersForMember(account.id);
    const bookIds = [...new Set(orders.flatMap(o => o.items.map(i => i.bookId)))];
    const books = bookIds.map(id => Store.getBook("store", id)).filter(Boolean);
    document.getElementById("badgePurchased").textContent = books.length;
    if (!books.length) {
      panels.purchased.innerHTML = `<div class="empty-state"><strong>Nothing purchased yet</strong><p>Buy a book from the store and it's yours to keep.</p><a href="browse.html?type=store" class="btn btn-primary btn-sm" style="margin-top:14px;display:inline-block">Browse the Store</a></div>`;
      return;
    }
    const goal = Store.getReadingGoal(account.id);
    panels.purchased.innerHTML = books.map(book => `
      <div class="loan-card" style="--accent:${genreColor(book.genre)}">
        ${coverHtml(book)}
        <div class="loan-body">
          <h3>${book.title}</h3>
          <div class="author">${book.author}</div>
          <div class="loan-tags"><span class="due-tag">Owned &middot; ${Store.formatPrice(book.price)}</span>${goal.finishedBookIds.includes(book.id) ? `<span class="tag">✓ finished</span>` : ""}</div>
        </div>
        <div class="loan-actions">
          <a class="btn btn-outline btn-sm" href="book.html?type=store&id=${book.id}">Read</a>
        </div>
      </div>
    `).join("");
  }

  function renderFavorites() {
    const favs = Store.getFavorites(account.id);
    document.getElementById("badgeFavorites").textContent = favs.length;
    if (!favs.length) {
      panels.favorites.innerHTML = `<div class="empty-state"><strong>No favorites yet</strong><p>Tap the heart on any book to save it here.</p><a href="browse.html" class="btn btn-primary btn-sm" style="margin-top:14px;display:inline-block">Browse Books</a></div>`;
      return;
    }
    panels.favorites.innerHTML = favs.map(f => {
      const book = Store.getBook(f.bookType, f.bookId);
      if (!book) return "";
      return `
        <div class="loan-card" style="--accent:${genreColor(book.genre)}">
          ${coverHtml(book)}
          <div class="loan-body">
            <h3>${book.title}</h3>
            <div class="author">${book.author}</div>
            <div class="loan-tags"><span class="due-tag">${f.bookType === "library" ? "Library" : Store.formatPrice(book.price)}</span></div>
          </div>
          <div class="loan-actions">
            <a class="btn btn-outline btn-sm" href="book.html?type=${f.bookType}&id=${book.id}">View</a>
            <button class="btn btn-ghost btn-sm" data-unfav="${f.bookType}|${book.id}">Remove</button>
          </div>
        </div>
      `;
    }).join("");

    panels.favorites.querySelectorAll("[data-unfav]").forEach(btn => btn.addEventListener("click", () => {
      const [type, id] = btn.dataset.unfav.split("|");
      Store.toggleFavorite(account.id, type, id);
      Sound.click();
      renderFavorites();
    }));
  }

  function renderStars(historyId, rating) {
    let html = '<div class="star-rating" role="radiogroup" aria-label="Rating">';
    for (let s = 1; s <= 5; s++) html += `<span class="star${s <= rating ? " filled" : ""}" data-history="${historyId}" data-star="${s}" role="button" aria-label="${s} star">&#9733;</span>`;
    return html + "</div>";
  }

  function renderHistory() {
    const history = Store.getHistoryForMember(account.id);
    document.getElementById("badgeHistory").textContent = history.length;
    if (!history.length) {
      panels.history.innerHTML = `<div class="empty-state"><strong>No reading history yet</strong><p>Books you return from the library will land here so you can rate them.</p></div>`;
      return;
    }
    panels.history.innerHTML = history.map(entry => {
      const book = Store.getBook("library", entry.bookId);
      if (!book) return "";
      return `
        <div class="loan-card" data-history="${entry.id}" style="--accent:${genreColor(book.genre)}">
          ${coverHtml(book)}
          <div class="loan-body">
            <h3>${book.title}</h3>
            <div class="author">${book.author}</div>
            <div class="loan-tags" style="margin-bottom:8px"><span class="due-tag">Returned &middot; ${Store.formatDate(entry.returnedAt)}</span></div>
            <div style="display:flex;align-items:center;gap:8px;font-size:.85rem"><span style="color:var(--ink-3)">Your rating:</span>${renderStars(entry.id, entry.rating || 0)}</div>
          </div>
          <div class="loan-actions"><a class="btn btn-outline btn-sm" href="book.html?type=library&id=${book.id}">Read Again</a></div>
        </div>
      `;
    }).join("");

    panels.history.querySelectorAll(".star").forEach(star => star.addEventListener("click", () => {
      Store.setHistoryRating(star.dataset.history, Number(star.dataset.star));
      Sound.click();
      renderHistory();
    }));
  }

  function ringSvg(finished, target) {
    const r = 26, c = 2 * Math.PI * r;
    const pct = target > 0 ? Math.min(1, finished / target) : 0;
    return `
      <svg class="goal-ring" viewBox="0 0 64 64">
        <circle class="track" cx="32" cy="32" r="${r}"></circle>
        <circle class="prog" cx="32" cy="32" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"></circle>
      </svg>
    `;
  }

  function renderGoal() {
    const goal = Store.getReadingGoal(account.id);
    const finishedBooks = goal.finishedBookIds.map(id => Store.getBook("library", id) || Store.getBook("store", id)).filter(Boolean);
    panels.goal.innerHTML = `
      <div class="goal-widget">
        ${ringSvg(goal.finishedBookIds.length, goal.target)}
        <div class="goal-text">
          <strong>${goal.finishedBookIds.length} of ${goal.target || "—"} books finished in ${goal.year}</strong>
          <span>Mark a book "Finished" from its page to count it here.</span>
        </div>
      </div>
      <div class="field" style="max-width:280px;margin-top:20px">
        <label for="goalTarget">This year's goal</label>
        <input type="number" id="goalTarget" min="1" max="365" value="${goal.target || ""}" placeholder="e.g. 12">
      </div>
      <button class="btn btn-primary btn-sm" id="goalSaveBtn">Save Goal</button>

      ${finishedBooks.length ? `
        <h3 style="font-family:var(--serif);margin-top:32px">Finished this year</h3>
        <div class="loan-list" style="padding-top:10px">
          ${finishedBooks.map(b => `
            <div class="loan-card" style="--accent:${genreColor(b.genre)}">
              ${coverHtml(b)}
              <div class="loan-body"><h3>${b.title}</h3><div class="author">${b.author}</div></div>
            </div>
          `).join("")}
        </div>
      ` : ""}
    `;
    document.getElementById("goalSaveBtn").addEventListener("click", () => {
      const val = Number(document.getElementById("goalTarget").value);
      if (val > 0) {
        Store.setReadingGoalTarget(account.id, val);
        Sound.success();
        Toast.show(`Reading goal set to ${val} books for ${goal.year}.`);
        renderGoal();
      }
    });
  }

  function renderAll() {
    meta.textContent = `Signed in as ${account.name}`;
    renderLoans();
    renderPurchased();
    renderFavorites();
    renderHistory();
    renderGoal();
  }

  function selectTab(tabKey) {
    const btn = [...tabs].find(b => b.dataset.tab === tabKey);
    if (!btn) return;
    tabs.forEach(b => { b.classList.toggle("active", b === btn); b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
    Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== tabKey; });
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      selectTab(btn.dataset.tab);
      Sound.click();
    });
  });

  const requestedTab = new URLSearchParams(location.search).get("tab");
  if (requestedTab && panels[requestedTab]) selectTab(requestedTab);

  window.addEventListener("readily:loans-changed", renderAll);
  window.addEventListener("readily:history-changed", renderAll);
  window.addEventListener("readily:favorites-changed", renderAll);
  window.addEventListener("readily:orders-changed", renderAll);
  window.addEventListener("readily:goals-changed", renderAll);

  renderAll();
})();
