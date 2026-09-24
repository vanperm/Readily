/* ============================================================
   Readily: Virtual Library Explorer
   Books grouped into scrollable "shelves" by genre — a spatial
   alternative to the search-and-filter grid on Browse.
   ============================================================ */

(function () {
  const root = document.getElementById("aisles");

  function bookHtml(book) {
    return `
      <div class="explorer-book" data-type="${book.type}" data-id="${book.id}" tabindex="0" role="button" aria-label="View ${book.title}">
        <div class="cov" style="background:${book.cover}">
          ${renderCoverArt(book.id)}
          <div class="cov-title">${book.title}</div>
        </div>
        <div class="explorer-shelf-board"></div>
      </div>
    `;
  }

  function render() {
    const all = Store.getAllBooksFlat();
    const genres = [...new Set(all.map(b => b.genre))].sort();

    root.innerHTML = genres.map(genre => {
      const books = all.filter(b => b.genre === genre);
      return `
        <div class="explorer-aisle">
          <h2 style="color:${genreColor(genre)}">${genre}</h2>
          <div class="desc">${books.length} title${books.length === 1 ? "" : "s"} &middot; ${books.filter(b => b.type === "library").length} to borrow, ${books.filter(b => b.type === "store").length} to buy</div>
          <div class="explorer-shelf">${books.map(bookHtml).join("")}</div>
        </div>
      `;
    }).join("");

    root.querySelectorAll(".explorer-book").forEach((el, i) => {
      const open = () => { Sound.click(); goTo(`book.html?type=${el.dataset.type}&id=${el.dataset.id}`); };
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      el.addEventListener("mouseenter", () => Sound.bookHover(i));
    });
  }

  window.addEventListener("readily:catalog-changed", render);
  render();
})();
