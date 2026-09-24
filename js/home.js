/* ============================================================
   Readily: home page — adapts to login state.
   Guest: marketing landing. Member: personalized dashboard
   summary. Librarian/Store Staff: a banner pointing to their
   own dashboard (index.html is a public page, so no hard guard).
   ============================================================ */

(function () {
  const account = Store.getSession();
  const heroTitle = document.getElementById("heroTitle");
  const heroLede = document.getElementById("heroLede");
  const heroCta = document.getElementById("heroCta");
  const memberPanel = document.getElementById("memberPanel");
  const adminBanner = document.getElementById("adminBanner");

  function cardHtml(book, type) {
    const accent = genreColor(book.genre);
    const availHtml = type === "library"
      ? (() => {
          const avail = Store.availableLicenses(book);
          return `<div class="avail${avail === 0 ? " out" : ""}"><span class="dot"></span>${avail === 0 ? "All copies checked out" : `${avail} available to read`}</div>`;
        })()
      : `<div class="price">${Store.formatPrice(book.price)}</div>`;

    return `
      <article class="book-card" tabindex="0" role="button" aria-label="View ${book.title}" style="--accent:${accent}" onclick="goTo('book.html?type=${type}&id=${book.id}')">
        <span class="type-badge ${type}">${type === "library" ? "Borrow" : "Buy"}</span>
        <div class="mini-cover-wrap">
          <div class="mini-cover" style="background:${book.cover}">
            ${renderCoverArt(book.id)}
            <div class="emblem">${EMBLEMS[book.emblem] || ""}</div>
            <div class="face"><span class="title">${book.title}</span></div>
            <div class="spine-edge"></div>
            <div class="pages-edge"></div>
          </div>
        </div>
        <div class="book-info">
          <div class="genre-tag">${book.genre} &middot; ${book.year}</div>
          <h3>${book.title}</h3>
          <div class="author">${book.author}</div>
          ${availHtml}
        </div>
      </article>
    `;
  }

  function renderRows() {
    document.getElementById("libraryRow").innerHTML = Store.getLibraryBooks().slice(0, 4).map(b => cardHtml(b, "library")).join("");
    document.getElementById("storeRow").innerHTML = Store.getStoreBooks().slice(0, 4).map(b => cardHtml(b, "store")).join("");
  }

  function ringSvg(finished, target) {
    const r = 26, c = 2 * Math.PI * r;
    const pct = target > 0 ? Math.min(1, finished / target) : 0;
    return `<svg class="goal-ring" viewBox="0 0 64 64"><circle class="track" cx="32" cy="32" r="${r}"></circle><circle class="prog" cx="32" cy="32" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"></circle></svg>`;
  }

  if (!account) {
    heroCta.innerHTML = `<a href="signup.html" class="btn btn-primary">Sign Up Free</a><a href="browse.html" class="btn btn-outline">Browse the Catalog</a>`;
  } else if (account.role === "member") {
    heroTitle.textContent = `Welcome back, ${account.name.split(" ")[0]}.`;
    heroLede.textContent = "Here's what's waiting for you, and what's new on the shelves.";
    heroCta.innerHTML = `<a href="browse.html" class="btn btn-primary">Browse the Catalog</a><a href="my-books.html" class="btn btn-outline">My Books</a>`;

    const loans = Store.getLoansForMember(account.id).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
    const goal = Store.getReadingGoal(account.id);
    const continueReading = [...loans].sort((a, b) => (b.progressPage || 0) - (a.progressPage || 0))[0];

    const favCount = Store.getFavorites(account.id).length;
    const cartCount = Store.getCart(account.id).length;

    memberPanel.hidden = false;
    memberPanel.innerHTML = `
      <div class="admin-grid-stats" style="margin-bottom:0">
        <div class="stat-card">
          <span class="sc-label">Active Loans</span><span class="sc-val">${loans.length}</span>
          ${loans.length === 0 ? `<span class="sc-hint">Nothing borrowed yet &middot; <a href="javascript:void 0" onclick="goTo('browse.html?type=library')">browse the library</a></span>` : ""}
        </div>
        <div class="stat-card"><span class="sc-label">Cart Items</span><span class="sc-val">${cartCount}</span></div>
        <div class="stat-card">
          <span class="sc-label">Favorites</span><span class="sc-val">${favCount}</span>
          ${favCount === 0 ? `<span class="sc-hint">Tap the heart on any book to save it</span>` : ""}
        </div>
        <div class="stat-card" style="display:flex;flex-direction:row;align-items:center;gap:14px">
          ${ringSvg(goal.finishedBookIds.length, goal.target)}
          <div style="display:flex;flex-direction:column;gap:2px">
            <span class="sc-label">Reading Goal</span>
            <span class="sc-val" style="font-size:1.3rem">${goal.finishedBookIds.length}/${goal.target || "—"}</span>
            ${!goal.target ? `<span class="sc-hint"><a href="javascript:void 0" onclick="goTo('my-books.html?tab=goal')">Set a goal</a></span>` : ""}
          </div>
        </div>
      </div>
      ${continueReading ? `
        <div class="loan-list" style="padding:20px 0 0">
          <div class="loan-card" style="--accent:${genreColor((Store.getBook("library", continueReading.bookId) || {}).genre || "Fiction")}">
            ${(() => { const b = Store.getBook("library", continueReading.bookId); return b ? `<div class="loan-cover" style="background:${b.cover}">${renderCoverArt(b.id, "small")}<span>${b.title}</span></div>` : ""; })()}
            <div class="loan-body">
              <h3>Continue reading</h3>
              <div class="author">${(Store.getBook("library", continueReading.bookId) || {}).title || ""}</div>
              <div class="loan-tags"><span class="due-tag">Due ${Store.formatDate(continueReading.dueAt)}</span></div>
            </div>
            <div class="loan-actions"><a class="btn btn-primary btn-sm" href="book.html?type=library&id=${continueReading.bookId}">Resume</a></div>
          </div>
        </div>
      ` : ""}
    `;
  } else {
    adminBanner.hidden = false;
    adminBanner.innerHTML = `
      <div class="pill-note" style="margin:20px 0">
        Signed in as ${account.role === "librarian" ? "Librarian" : "Store Staff"} &middot;
        <a href="${roleHome(account.role)}" style="color:var(--primary);font-weight:700">Go to your dashboard &rarr;</a>
      </div>
    `;
    heroCta.innerHTML = `<a href="browse.html" class="btn btn-primary">Browse the Catalog</a>`;
  }

  renderRows();
  window.addEventListener("readily:catalog-changed", renderRows);
})();
