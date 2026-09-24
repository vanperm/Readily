/* ============================================================
   Readily: Librarian Desk controller
   ============================================================ */

(function () {
  const account = requireRole("librarian");
  if (!account) return;

  const tabs = document.querySelectorAll(".tab-btn");
  const panels = {
    circulation: document.getElementById("panelCirculation"),
    catalog: document.getElementById("panelCatalog"),
    members: document.getElementById("panelMembers"),
    reports: document.getElementById("panelReports")
  };

  function renderStats() {
    const books = Store.getLibraryBooks();
    const loans = Store.getLoans();
    const members = Store.getAccounts().filter(a => a.role === "member");
    document.getElementById("statTitles").textContent = books.length;
    document.getElementById("statLoans").textContent = loans.length;
    const overdue = loans.filter(l => Store.daysUntilDue(l) < 0).length;
    document.getElementById("statOverdue").textContent = overdue;
    document.getElementById("statCardOverdue").classList.toggle("alert", overdue > 0);
    document.getElementById("statMembers").textContent = members.length;
  }

  function renderCirculation() {
    const loans = Store.getLoans().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
    const body = document.getElementById("circulationBody");
    if (!loans.length) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--ink-3)">No active loans right now.</td></tr>`;
      return;
    }
    body.innerHTML = loans.map(loan => {
      const book = Store.getBook("library", loan.bookId);
      const borrower = Store.getAccount(loan.memberId);
      const days = Store.daysUntilDue(loan);
      let status = '<span class="status-pill active">Active</span>';
      if (days < 0) status = `<span class="status-pill overdue">${Math.abs(days)}d Overdue</span>`;
      else if (days <= 3) status = `<span class="status-pill soon">${days}d Left</span>`;
      return `
        <tr>
          <td><strong>${book ? book.title : "Unknown"}</strong><div style="font-size:.75rem;color:var(--ink-3)">${book ? book.call : ""}</div></td>
          <td>${borrower ? borrower.name : "Unknown"}<div style="font-size:.75rem;color:var(--ink-3)">${borrower ? borrower.email : ""}</div></td>
          <td>${Store.formatDate(loan.dueAt)}</td>
          <td>${status}</td>
          <td style="text-align:right">
            <button class="btn btn-secondary btn-sm" data-renew="${loan.id}">+14d</button>
            <button class="btn btn-danger btn-sm" data-return="${loan.id}">Return</button>
          </td>
        </tr>
      `;
    }).join("");

    body.querySelectorAll("[data-return]").forEach(btn => btn.addEventListener("click", () => {
      const loan = Store.getLoans().find(l => l.id === btn.dataset.return);
      const book = loan ? Store.getBook("library", loan.bookId) : null;
      Store.returnLoan(btn.dataset.return);
      Sound.success();
      Toast.show(`Checked in: "${book ? book.title : "book"}" returned to the shelf.`);
      renderAll();
    }));
    body.querySelectorAll("[data-renew]").forEach(btn => btn.addEventListener("click", () => {
      const r = Store.renewLoan(btn.dataset.renew, 14);
      if (r) { Sound.stamp(); Toast.show(`Renewed. New due date ${Store.formatDate(r.dueAt)}.`); renderAll(); }
    }));
  }

  function renderCatalog() {
    const books = Store.getLibraryBooks();
    const body = document.getElementById("catalogBody");
    body.innerHTML = books.map(book => {
      const avail = Store.availableLicenses(book);
      return `
        <tr>
          <td><strong>${book.title}</strong><div style="font-size:.75rem;color:var(--ink-3)">by ${book.author}</div></td>
          <td>${book.genre} &middot; ${book.year}</td>
          <td><code style="font-family:var(--mono);font-size:.82rem">${book.call}</code></td>
          <td>
            <div class="stock-stepper">
              <button class="stock-btn" data-delta="-1" data-id="${book.id}">&minus;</button>
              <strong style="min-width:20px;text-align:center">${book.licenses}</strong>
              <button class="stock-btn" data-delta="1" data-id="${book.id}">&plus;</button>
            </div>
          </td>
          <td><span class="status-pill ${avail === 0 ? "overdue" : "active"}">${avail === 0 ? "All Out" : `${avail} free`}</span></td>
          <td style="text-align:right">
            <a class="btn btn-outline btn-sm" href="book.html?type=library&id=${book.id}" target="_blank" rel="noopener">Preview</a>
            <button class="btn btn-ghost btn-sm" data-remove="${book.id}">Remove</button>
          </td>
        </tr>
      `;
    }).join("");

    body.querySelectorAll("[data-delta]").forEach(btn => btn.addEventListener("click", () => {
      const book = Store.getBook("library", btn.dataset.id);
      const next = Math.max(0, book.licenses + Number(btn.dataset.delta));
      Store.updateLibraryBook(btn.dataset.id, { licenses: next });
      Sound.click();
      Toast.show(`License count updated: ${next}.`);
      renderAll();
    }));
    body.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => {
      Store.removeBook("library", btn.dataset.remove);
      Sound.click();
      Toast.show("Removed from the catalog.");
      renderAll();
    }));
  }

  function renderMembers(filter = "") {
    const members = Store.getAccounts().filter(a => a.role === "member");
    const q = filter.trim().toLowerCase();
    const filtered = q ? members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) : members;
    const body = document.getElementById("membersBody");
    if (!filtered.length) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--ink-3)">No members match that search.</td></tr>`;
      return;
    }
    body.innerHTML = filtered.map(m => `
      <tr>
        <td><strong>${m.name}</strong><div style="font-size:.75rem;color:var(--ink-3)">${m.email}</div></td>
        <td><code style="font-family:var(--mono);font-size:.82rem">${m.cardNo}</code></td>
        <td>${Store.getLoansForMember(m.id).length}</td>
        <td>${Store.getHistoryForMember(m.id).length}</td>
        <td>${m.suspended ? '<span class="status-pill overdue">Suspended</span>' : '<span class="status-pill active">Active</span>'}</td>
        <td style="text-align:right"><button class="btn ${m.suspended ? "btn-outline" : "btn-danger"} btn-sm" data-toggle-suspend="${m.id}">${m.suspended ? "Reactivate" : "Suspend"}</button></td>
      </tr>
    `).join("");

    body.querySelectorAll("[data-toggle-suspend]").forEach(btn => btn.addEventListener("click", () => {
      const id = btn.dataset.toggleSuspend;
      const m = Store.getAccount(id);
      Store.setAccountSuspended(id, !m.suspended);
      Sound.click();
      Toast.show(m.suspended ? "Member reactivated." : "Member suspended.");
      renderMembers(document.getElementById("memberSearch").value);
      renderStats();
    }));
  }

  function renderReports() {
    const loans = Store.getLoans();
    const history = Store.getHistory();
    const counts = {};
    [...loans, ...history].forEach(l => { counts[l.bookId] = (counts[l.bookId] || 0) + 1; });
    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const body = document.getElementById("reportsBody");
    if (!ranked.length) {
      body.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--ink-3)">No borrowing activity yet.</td></tr>`;
      return;
    }
    body.innerHTML = ranked.map(([bookId, count], i) => {
      const book = Store.getBook("library", bookId);
      if (!book) return "";
      return `<tr><td>${i + 1}</td><td><strong>${book.title}</strong></td><td>${book.genre}</td><td>${count}</td></tr>`;
    }).join("");
  }

  function renderAll() {
    renderStats();
    renderCirculation();
    renderCatalog();
    renderMembers(document.getElementById("memberSearch").value);
    renderReports();
  }

  tabs.forEach(btn => btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.toggle("active", b === btn));
    Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== btn.dataset.tab; });
    Sound.click();
  }));

  document.getElementById("memberSearch").addEventListener("input", (e) => renderMembers(e.target.value));

  /* intake modal */
  const intakeModal = document.getElementById("intakeModal");
  document.getElementById("btnOpenIntake").addEventListener("click", () => { intakeModal.hidden = false; Sound.click(); });
  document.getElementById("btnCancelIntake").addEventListener("click", () => { intakeModal.hidden = true; });
  document.getElementById("intakeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("newTitle").value.trim();
    const author = document.getElementById("newAuthor").value.trim();
    if (!title || !author) { Toast.show("Please enter at least a title and author."); return; }
    const book = Store.addLibraryBook({
      title, author,
      genre: document.getElementById("newGenre").value,
      year: document.getElementById("newYear").value,
      licenses: document.getElementById("newLicenses").value,
      blurb: document.getElementById("newBlurb").value,
      excerpt: document.getElementById("newExcerpt").value
    });
    Sound.stamp();
    Toast.show(`Added "${book.title}" to the library catalog.`);
    e.target.reset();
    intakeModal.hidden = true;
    renderAll();
  });

  /* reset demo */
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

  window.addEventListener("readily:loans-changed", renderAll);
  window.addEventListener("readily:catalog-changed", renderAll);
  window.addEventListener("readily:accounts-changed", renderAll);

  renderAll();
})();
