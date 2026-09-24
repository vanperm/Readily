/* ============================================================
   Readily: book detail page — 3D reader + borrow/buy panel
   Controls book.html directly (no modal — this is a real page
   with its own URL). Adapted from the archived Reading Room
   project's book3d.js.
   ============================================================ */

(function () {
  const params = new URLSearchParams(location.search);
  const bookType = params.get("type") === "store" ? "store" : "library";
  const bookId = params.get("id");

  const panelRoot = document.getElementById("bookDetailPanel");
  const notFound = document.getElementById("notFoundState");
  const closedView = document.getElementById("bmClosed");
  const readerView = document.getElementById("bmReader");
  const leftCol = document.getElementById("bmLeft");
  const rightCol = document.getElementById("bmRight");
  const panelInfo = document.getElementById("bmPanel");
  const indicatorEl = document.getElementById("bmIndicator");
  const prevBtn = document.getElementById("bmPrev");
  const nextBtn = document.getElementById("bmNext");
  const hintEl = document.getElementById("bmHint");

  let book = null;
  let leaves = [];
  let pageIndex = 0;
  let activeLoan = null;

  const book0 = Store.getBook(bookType, bookId);
  if (!book0) {
    panelRoot.hidden = true;
    notFound.hidden = false;
    return;
  }
  book = book0;
  panelRoot.hidden = false;
  document.getElementById("pageTitle").textContent = `Readily · ${book.title}`;

  /* ── leaf content ── */

  function titlePlate(b) {
    return `<div class="static-plate title-plate">
      <div class="tp-title">${b.title}</div>
      <div class="tp-author">${b.author.toUpperCase()}</div>
      <div class="tp-rule"></div>
      <div class="tp-edition">Readily · Preview Edition</div>
    </div>`;
  }
  function epigraphPlate(b) {
    return `<div class="static-plate">
      <div class="page-heading">Epigraph</div>
      <p class="page-text no-dropcap" style="font-style:italic;text-align:center">&ldquo;${b.epigraph}&rdquo;</p>
    </div>`;
  }
  function textPlate(heading, text) {
    return `<div class="static-plate" style="align-items:stretch;text-align:left;justify-content:flex-start">
      ${heading ? `<div class="page-heading">${heading}</div>` : ""}
      <div class="page-text">${text}</div>
    </div>`;
  }
  function exLibrisPlate() {
    return `<div class="static-plate">
      <div class="exlibris">
        <div class="el-mark">Ex Libris · Readily</div>
        <div class="el-name-line"></div>
        <p>this copy belongs, for a little while, to whoever is reading it now</p>
      </div>
    </div>`;
  }
  function endPlate() {
    const cta = bookType === "library" ? "Borrow this book from the panel to keep reading." : "Buy this book from the panel to keep reading anytime.";
    return `<div class="static-plate end-plate">
      <div class="ep-label">End of preview</div>
      <p>${cta}</p>
    </div>`;
  }
  function cardPlate(headLabel, rows) {
    return `<div class="static-plate">
      <div class="due-card">
        <div class="dc-head">${headLabel} &nbsp;&middot;&nbsp; ${book.call}</div>
        <table><tbody>${rows}</tbody></table>
      </div>
    </div>`;
  }

  function buildLeaves() {
    const p = book.pages;
    leaves = [
      { i: 0, front: titlePlate(book), back: epigraphPlate(book) },
      { i: 1, front: textPlate("Chapter One", p[0]), back: textPlate("", p[1]) },
      { i: 2, front: endPlate(), back: ledgerCard() }
    ];
    rightCol.innerHTML = leaves.map(l => `
      <div class="leaf" data-leaf="${l.i}">
        <div class="leaf-face front">${l.front}</div>
        <div class="leaf-face back">${l.back}</div>
      </div>
    `).join("");
    leftCol.innerHTML = exLibrisPlate();
    rightCol.insertAdjacentHTML("afterbegin", `<div class="static-plate" style="z-index:-1"></div>`);
    pageIndex = 0;
  }

  function ledgerCard() {
    if (bookType === "library") {
      const loans = Store.loansForBook(book.id);
      let rows = "";
      for (let r = 0; r < 4; r++) {
        const loan = loans[r];
        if (loan) {
          const acct = Store.getAccount(loan.memberId);
          rows += `<tr><td class="stamped">${Store.formatDate(loan.dueAt)}</td><td class="stamped">${acct ? acct.name : "A reader"}</td></tr>`;
        } else {
          rows += `<tr><td>&nbsp;</td><td>&nbsp;</td></tr>`;
        }
      }
      return cardPlate("DATE DUE", rows);
    }
    const orders = Store.getOrders().filter(o => o.items.some(i => i.bookId === book.id));
    let rows = "";
    for (let r = 0; r < 4; r++) {
      const order = orders[r];
      if (order) {
        const acct = Store.getAccount(order.memberId);
        rows += `<tr><td class="stamped">${Store.formatDate(order.purchasedAt)}</td><td class="stamped">${acct ? acct.name : "A reader"}</td></tr>`;
      } else {
        rows += `<tr><td>&nbsp;</td><td>&nbsp;</td></tr>`;
      }
    }
    return cardPlate("PURCHASED", rows);
  }

  function layoutLeaves() {
    const total = leaves.length;
    document.querySelectorAll("#bmRight .leaf").forEach(el => {
      const i = Number(el.dataset.leaf);
      const flipped = i < pageIndex;
      el.classList.toggle("flipped", flipped);
      el.style.zIndex = flipped ? i + 1 : total - i;
    });
    const pageTotal = total * 2;
    const pageNow = Math.min(pageIndex * 2, pageTotal);
    indicatorEl.textContent = `Page ${pageNow} of ${pageTotal}`;
    prevBtn.disabled = pageIndex === 0;
    nextBtn.disabled = pageIndex === total;
  }

  function turn(dir) {
    const total = leaves.length;
    const next = pageIndex + dir;
    if (next < 0 || next > total) return;
    pageIndex = next;
    layoutLeaves();
    Sound.pageTurn();
    if (activeLoan) Store.updateReadingProgress(activeLoan.id, pageIndex);
  }

  function openBookAnimation(skipAnim) {
    if (skipAnim) {
      closedView.style.display = "none";
      readerView.classList.add("show");
      return;
    }
    closedView.classList.add("opening");
    hintEl.style.opacity = "0";
    Sound.open();
    setTimeout(() => {
      closedView.style.display = "none";
      readerView.classList.add("show");
    }, 480);
  }

  function resetToClosed() {
    readerView.classList.remove("show");
    closedView.style.display = "flex";
    closedView.classList.remove("opening");
    hintEl.style.opacity = "1";
    pageIndex = 0;
    layoutLeaves();
    Sound.close();
  }

  document.getElementById("bmCover").addEventListener("click", () => openBookAnimation(false));
  document.getElementById("bmCover").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBookAnimation(false); }
  });
  document.getElementById("bmCloseBook").addEventListener("click", resetToClosed);
  prevBtn.addEventListener("click", () => turn(-1));
  nextBtn.addEventListener("click", () => turn(1));
  window.addEventListener("keydown", (e) => {
    if (!readerView.classList.contains("show")) return;
    if (e.key === "ArrowRight") turn(1);
    if (e.key === "ArrowLeft") turn(-1);
  });

  /* ── info panel ── */

  function goLogin() {
    goTo(`login.html?next=${encodeURIComponent(`book.html?type=${bookType}&id=${bookId}`)}`);
  }

  function favButtonHtml(account) {
    const on = account && account.role === "member" && Store.isFavorite(account.id, bookType, book.id);
    return `<button type="button" class="fav-btn${on ? " on" : ""}" id="bmFavBtn" aria-pressed="${on}" aria-label="Toggle favorite" title="Favorite this book">
      <svg viewBox="0 0 24 24" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.1C.5 8.4 2.4 5 6 5c2 0 3.5 1.1 4.5 2.6C11.5 6.1 13 5 15 5c3.6 0 5.5 3.4 4 6.9C19.5 16.4 12 21 12 21Z"/></svg>
    </button>`;
  }

  function wireFav(account) {
    const btn = document.getElementById("bmFavBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!account || account.role !== "member") { goLogin(); return; }
      const on = Store.toggleFavorite(account.id, bookType, book.id);
      Sound.click();
      Toast.show(on ? `Added "${book.title}" to your favorites.` : `Removed "${book.title}" from your favorites.`);
      renderPanel();
    });
  }

  function renderPanel() {
    const account = Store.getSession();
    panelInfo.style.setProperty("--accent", genreColor(book.genre));

    const priceOrAvail = bookType === "store"
      ? `<div class="meta-item"><div class="k">Price</div><div class="v">${Store.formatPrice(book.price)}</div></div>`
      : `<div class="meta-item"><div class="k">Loan period</div><div class="v">${LOAN_DAYS} days</div></div>`;

    panelInfo.innerHTML = `
      ${favButtonHtml(account)}
      <div class="genre-tag">${book.genre} &middot; ${book.year}</div>
      <h2>${book.title}</h2>
      <div class="by">by ${book.author}</div>
      <p class="blurb">${book.blurb}</p>
      <div class="meta-row">
        <div class="meta-item"><div class="k">Call number</div><div class="v">${book.call}</div></div>
        ${priceOrAvail}
        <div class="meta-item"><div class="k">Type</div><div class="v">${bookType === "library" ? "Library (borrow)" : "Store (buy)"}</div></div>
      </div>
      <div class="card-widget" id="bmCardWidget"></div>
    `;
    wireFav(account);

    const widget = document.getElementById("bmCardWidget");
    if (bookType === "library") renderLibraryWidget(widget, account);
    else renderStoreWidget(widget, account);
  }

  function renderLibraryWidget(widget, account) {
    if (!account) {
      widget.innerHTML = `
        <div class="cw-head"><div class="cw-title">Read this for free</div></div>
        <p class="cw-note">Log in to borrow this book for ${LOAN_DAYS} days, free.</p>
        <button class="btn btn-primary btn-block" id="bmLoginBtn">Log In to Borrow</button>
      `;
      document.getElementById("bmLoginBtn").addEventListener("click", goLogin);
      return;
    }
    if (account.role !== "member") {
      widget.innerHTML = `<div class="cw-note">Only member accounts can borrow books.</div>`;
      return;
    }

    activeLoan = Store.activeLoanFor(account.id, book.id);
    const avail = Store.availableLicenses(book);

    if (activeLoan) {
      const days = Store.daysUntilDue(activeLoan);
      const finished = Store.getReadingGoal(account.id).finishedBookIds.includes(book.id);
      widget.innerHTML = `
        <div class="cw-head"><div class="cw-title">Your loan</div></div>
        <div class="loan-status">
          <div class="ls-text">On loan to you, due <span class="ls-due">${Store.formatDate(activeLoan.dueAt)}</span>
            ${days < 0 ? ` &middot; <strong style="color:var(--danger)">${Math.abs(days)}d overdue</strong>` : ""}
            ${activeLoan.renewals ? ` &middot; renewed ${activeLoan.renewals}x` : ""}
          </div>
        </div>
        <div class="finish-btn-row" style="margin-top:14px">
          <button class="btn btn-outline btn-sm" id="bmRenewBtn">Renew (+14d)</button>
          <button class="btn btn-danger btn-sm" id="bmReturnBtn">Return</button>
        </div>
        ${!finished ? `<button class="btn btn-gold btn-sm btn-block" id="bmFinishBtn" style="margin-top:10px">Mark as Finished</button>` : `<div class="cw-note" style="margin-top:10px">✓ Counted toward your reading goal.</div>`}
      `;
      document.getElementById("bmRenewBtn").addEventListener("click", () => {
        const r = Store.renewLoan(activeLoan.id, 14);
        if (r) { Sound.stamp(); Toast.show(`Renewed! New due date ${Store.formatDate(r.dueAt)}.`); renderPanel(); }
      });
      document.getElementById("bmReturnBtn").addEventListener("click", () => {
        Store.returnLoan(activeLoan.id);
        Sound.success();
        Toast.show(`Returned "${book.title}". Added to your Reading History.`);
        renderPanel();
      });
      const finishBtn = document.getElementById("bmFinishBtn");
      if (finishBtn) finishBtn.addEventListener("click", () => {
        Store.markFinished(account.id, book.id);
        Sound.success();
        Confetti.burst(finishBtn, 18);
        Toast.show("Nice! Counted toward your reading goal.");
        renderPanel();
      });
    } else if (avail > 0) {
      if (Store.borrowLimitReached(account.id)) {
        widget.innerHTML = `
          <div class="cw-head"><div class="cw-title">Borrowing limit reached</div></div>
          <div class="cw-note">You have 5 books out already. Return one from <a href="my-books.html" style="color:var(--primary)">My Books</a> before borrowing another.</div>
        `;
        return;
      }
      widget.innerHTML = `
        <div class="cw-head">
          <div class="cw-title">Borrow this book</div>
          <div class="cw-avail"><span class="dot"></span>${avail} of ${book.licenses} copies free</div>
        </div>
        <button class="btn btn-primary btn-block" id="bmBorrowBtn">Borrow for ${LOAN_DAYS} days &mdash; free</button>
        <div class="cw-note">Borrowed to your account: ${account.name}. No fees, ever.</div>
        <div class="stamp-burst" id="bmStamp">DUE<br>${new Date(Date.now() + LOAN_DAYS * 86400000).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</div>
      `;
      document.getElementById("bmBorrowBtn").addEventListener("click", () => {
        const btn = document.getElementById("bmBorrowBtn");
        const stamp = document.getElementById("bmStamp");
        btn.disabled = true;
        // Store.borrow() fires "loans-changed" synchronously, which this
        // page listens for and re-renders the panel immediately — so by
        // the time this handler resumes, btn/stamp are already detached
        // from the DOM. Capture them first and burst from the stable
        // panel container, not the (about to be replaced) button.
        const loan = Store.borrow(book.id, account.id);
        if (!loan) { Toast.show("Sorry, the last copy was just taken."); renderPanel(); return; }
        if (stamp) stamp.classList.add("go");
        Sound.stamp();
        Confetti.burst(panelInfo, 26);
        setTimeout(() => { Toast.show(`"${book.title}" is yours until ${Store.formatDate(loan.dueAt)}.`); renderPanel(); }, 650);
      });
    } else {
      const onWaitlist = Store.isOnWaitlist(book.id, account.id);
      const waitCount = Store.waitlistCountFor(book.id);
      widget.innerHTML = `
        <div class="cw-head">
          <div class="cw-title">${onWaitlist ? "You're on the waitlist" : "Join the waitlist"}</div>
          <div class="cw-avail out"><span class="dot"></span>All ${book.licenses} copies checked out</div>
        </div>
        <div class="cw-note" style="margin-bottom:12px">${onWaitlist ? "We'll hold the next returned copy for you." : "Every copy is out with another reader. Reserve the next one returned."}</div>
        <button class="btn ${onWaitlist ? "btn-outline" : "btn-primary"} btn-block" id="bmWaitBtn">${onWaitlist ? "Leave Waitlist" : "Join Waitlist"}</button>
        <div style="margin-top:10px;font-size:.8rem;color:var(--ink-3);text-align:center">${waitCount > 0 ? `${waitCount} reader${waitCount === 1 ? "" : "s"} currently in line` : "Be first in line"}</div>
      `;
      document.getElementById("bmWaitBtn").addEventListener("click", () => {
        if (onWaitlist) Store.removeFromWaitlist(book.id, account.id);
        else Store.joinWaitlist(book.id, account.id);
        Sound.stamp();
        Toast.show(onWaitlist ? "Left the waitlist." : `Reserved! We'll hold the next copy of "${book.title}" for you.`);
        renderPanel();
      });
    }
  }

  function renderStoreWidget(widget, account) {
    if (!account) {
      widget.innerHTML = `
        <div class="cw-head"><div class="cw-title">Buy this book</div></div>
        <div class="price-display">${Store.formatPrice(book.price)}</div>
        <p class="cw-note" style="margin-top:10px">Log in to buy this book and keep it in your library, forever.</p>
        <button class="btn btn-primary btn-block" id="bmLoginBtn">Log In to Buy</button>
      `;
      document.getElementById("bmLoginBtn").addEventListener("click", goLogin);
      return;
    }
    if (account.role !== "member") {
      widget.innerHTML = `<div class="cw-note">Only member accounts can buy books.</div>`;
      return;
    }
    if (Store.ownsBook(account.id, book.id)) {
      const finished = Store.getReadingGoal(account.id).finishedBookIds.includes(book.id);
      widget.innerHTML = `
        <div class="cw-head"><div class="cw-title">You own this book</div></div>
        <div class="cw-note">Purchased &middot; yours to read anytime.</div>
        ${!finished ? `<button class="btn btn-gold btn-block" id="bmFinishBtn" style="margin-top:12px">Mark as Finished</button>` : `<div class="cw-note" style="margin-top:10px">✓ Counted toward your reading goal.</div>`}
      `;
      const finishBtn = document.getElementById("bmFinishBtn");
      if (finishBtn) finishBtn.addEventListener("click", () => {
        Store.markFinished(account.id, book.id);
        Sound.success();
        Confetti.burst(finishBtn, 18);
        Toast.show("Nice! Counted toward your reading goal.");
        renderPanel();
      });
      return;
    }
    const inCart = Store.getCart(account.id).includes(book.id);
    widget.innerHTML = `
      <div class="cw-head"><div class="cw-title">Buy this book</div></div>
      <div class="price-display">${Store.formatPrice(book.price)}</div>
      <div class="finish-btn-row" style="margin-top:14px">
        <button class="btn btn-outline btn-block" id="bmCartBtn" ${inCart ? "disabled" : ""}>${inCart ? "In Cart" : "Add to Cart"}</button>
        <button class="btn btn-primary btn-block" id="bmBuyNowBtn">Buy Now</button>
      </div>
      <div class="cw-note">Yours forever, no due dates.</div>
    `;
    document.getElementById("bmCartBtn").addEventListener("click", () => {
      Store.addToCart(account.id, book.id);
      Sound.click();
      Toast.show(`Added "${book.title}" to your cart.`);
      renderPanel();
    });
    document.getElementById("bmBuyNowBtn").addEventListener("click", () => {
      Store.addToCart(account.id, book.id);
      goTo("checkout.html");
    });
  }

  /* ── init ── */

  document.getElementById("bmCoverTitle").textContent = book.title;
  document.getElementById("bmCoverAuthor").textContent = book.author.toUpperCase();
  document.getElementById("bmEmblem").innerHTML = EMBLEMS[book.emblem] || "";
  document.getElementById("bmCoverArt").innerHTML = renderCoverArt(book.id);
  document.getElementById("bmCover").querySelector(".front-face").style.background = book.cover;

  buildLeaves();
  renderPanel();

  const sessionForProgress = Store.getSession();
  if (sessionForProgress && sessionForProgress.role === "member" && bookType === "library") {
    activeLoan = Store.activeLoanFor(sessionForProgress.id, book.id);
    if (activeLoan && activeLoan.progressPage > 0) {
      pageIndex = Math.min(activeLoan.progressPage, leaves.length);
      openBookAnimation(true);
      layoutLeaves();
    } else {
      resetToClosed();
    }
  } else {
    resetToClosed();
  }

  window.addEventListener("readily:loans-changed", renderPanel);
  window.addEventListener("readily:waitlist-changed", renderPanel);
  window.addEventListener("readily:favorites-changed", renderPanel);
  window.addEventListener("readily:orders-changed", renderPanel);
  window.addEventListener("readily:cart-changed", renderPanel);
})();
