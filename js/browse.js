/* ============================================================
   Readily: browse / catalog page
   ============================================================ */

(function () {
  const grid = document.getElementById("catalogGrid");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");
  const sortSelect = document.getElementById("sortSelect");
  const typeToggle = document.getElementById("typeToggle");
  const chipsEl = document.getElementById("genreChips");
  const metaEl = document.getElementById("shelfMeta");

  const params = new URLSearchParams(location.search);
  let activeType = params.get("type") || "all";
  let activeGenre = "All";
  let query = params.get("q") || "";
  let sortMode = "default";
  let lastCount = null;

  if (searchInput) searchInput.value = query;
  if (clearBtn) clearBtn.hidden = query.length === 0;

  function typedBooks() {
    const all = Store.getAllBooksFlat();
    return activeType === "all" ? all : all.filter(b => b.type === activeType);
  }

  function buildChips() {
    const books = typedBooks();
    const uniqueGenres = [...new Set(books.map(b => b.genre))].sort();
    const genres = ["All", ...uniqueGenres];
    chipsEl.innerHTML = genres.map(g => {
      const count = g === "All" ? books.length : books.filter(b => b.genre === g).length;
      const color = g === "All" ? "#09090B" : genreColor(g);
      return `
        <button class="chip${g === activeGenre ? " on" : ""}" data-genre="${g}" style="--chip-color:${color}" aria-label="Filter by ${g}, ${count} titles">
          <span class="chip-dot"></span>${g} <span class="chip-count">${count}</span>
        </button>
      `;
    }).join("");

    chipsEl.querySelectorAll(".chip").forEach((btn, idx) => {
      btn.addEventListener("mouseenter", () => Sound.chipHover(idx));
      btn.addEventListener("click", () => {
        activeGenre = btn.dataset.genre;
        Sound.click();
        buildChips();
        render();
      });
    });
  }

  function cardHtml(book) {
    const accent = genreColor(book.genre);
    let availHtml;
    if (book.type === "library") {
      const avail = Store.availableLicenses(book);
      const waitCount = Store.waitlistCountFor(book.id);
      const isOut = avail === 0;
      availHtml = `<div class="avail${isOut ? " out" : ""}"><span class="dot"></span>${isOut ? (waitCount > 0 ? `Out &middot; ${waitCount} waiting` : "All copies checked out") : `${avail} available to read`}</div>`;
    } else {
      availHtml = `<div class="price">${Store.formatPrice(book.price)}</div>`;
    }

    return `
      <article class="book-card" tabindex="0" data-type="${book.type}" data-id="${book.id}" role="button" aria-label="View ${book.title} by ${book.author}" style="--accent:${accent}">
        <span class="type-badge ${book.type}">${book.type === "library" ? "Borrow" : "Buy"}</span>
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

  function matches(book) {
    const q = query.trim().toLowerCase();
    if (activeGenre !== "All" && book.genre !== activeGenre) return false;
    if (!q) return true;
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.genre.toLowerCase().includes(q) ||
      String(book.year).includes(q) ||
      (book.call && book.call.toLowerCase().includes(q))
    );
  }

  function sortList(list) {
    const copy = [...list];
    switch (sortMode) {
      case "title-asc": return copy.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc": return copy.sort((a, b) => b.title.localeCompare(a.title));
      case "year-desc": return copy.sort((a, b) => b.year - a.year);
      case "year-asc": return copy.sort((a, b) => a.year - b.year);
      case "price-asc": return copy.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc": return copy.sort((a, b) => (b.price || 0) - (a.price || 0));
      default: return copy;
    }
  }

  function render() {
    const filtered = typedBooks().filter(matches);
    const list = sortList(filtered);

    metaEl.innerHTML = `<span class="stat-num" id="statNum">${lastCount === null ? list.length : lastCount}</span> title${list.length === 1 ? "" : "s"} found`;
    animateCount(document.getElementById("statNum"), list.length, 400);
    lastCount = list.length;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <strong>No titles match that search</strong>
          <p>Try another keyword, clear the genre filter, or switch between Library and Store.</p>
          <button class="btn btn-secondary btn-sm" id="resetFiltersBtn" style="margin-top:12px">Clear search &amp; filters</button>
        </div>
      `;
      const resetBtn = grid.querySelector("#resetFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          query = ""; searchInput.value = ""; activeGenre = "All"; activeType = "all";
          if (clearBtn) clearBtn.hidden = true;
          typeToggle.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.type === "all"));
          buildChips();
          render();
        });
      }
      return;
    }

    grid.innerHTML = list.map(cardHtml).join("");
    grid.querySelectorAll(".book-card").forEach((card, i) => {
      const open = () => { Sound.click(); goTo(`book.html?type=${card.dataset.type}&id=${card.dataset.id}`); };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      card.addEventListener("mouseenter", () => Sound.bookHover(i));
    });
  }

  searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    if (clearBtn) clearBtn.hidden = query.length === 0;
    render();
  });
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      query = ""; searchInput.value = ""; clearBtn.hidden = true; searchInput.focus();
      render();
    });
  }

  typeToggle.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeType = btn.dataset.type;
      typeToggle.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === btn));
      activeGenre = "All";
      Sound.click();
      buildChips();
      render();
    });
  });

  sortSelect.addEventListener("change", () => {
    sortMode = sortSelect.value;
    Sound.click();
    render();
  });

  window.addEventListener("readily:loans-changed", render);
  window.addEventListener("readily:catalog-changed", () => { buildChips(); render(); });
  window.addEventListener("readily:waitlist-changed", render);

  buildChips();
  render();
})();
