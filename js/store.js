/* ============================================================
   Readily: data & persistence layer
   Everything lives in localStorage under the "readily:" prefix.
   No backend, no database. Every mutation dispatches a
   "readily:*-changed" CustomEvent so open pages/tabs stay in
   sync, the same pattern the archived Reading Room project used.
   ============================================================ */

const K = {
  accounts: "readily:accounts",
  session: "readily:session",
  customLibrary: "readily:custom-library-books",
  customStore: "readily:custom-store-books",
  libraryOverrides: "readily:library-overrides",
  storeOverrides: "readily:store-overrides",
  removed: "readily:removed-books",
  loans: "readily:loans",
  history: "readily:history",
  waitlist: "readily:waitlist",
  favorites: "readily:favorites",
  goals: "readily:reading-goals",
  cart: "readily:cart",
  orders: "readily:orders"
};

const LOAN_DAYS = 14;
const BORROW_LIMIT = 5;

const DEMO_ACCOUNTS = [
  { id: "acct-member-demo", role: "member", name: "Alex Rivera", email: "alex@readily.demo", password: "demo1234", cardNo: "RD-10042", joinedAt: "2025-01-06T00:00:00.000Z" },
  { id: "acct-librarian-demo", role: "librarian", name: "Naomi Ferreira", email: "librarian@readily.demo", password: "demo1234", joinedAt: "2024-11-01T00:00:00.000Z" },
  { id: "acct-store-demo", role: "store-staff", name: "Diego Salazar", email: "staff@readily.demo", password: "demo1234", joinedAt: "2024-11-01T00:00:00.000Z" }
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Could not read ${key}`, e);
    return fallback;
  }
}
function writeJson(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Could not write ${key}`, e);
  }
}
function fire(name) {
  window.dispatchEvent(new CustomEvent(`readily:${name}`));
}
function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const Store = {
  /* ───────────────────────── accounts / session ───────────────────────── */

  getAccounts() {
    const saved = readJson(K.accounts, null);
    if (saved) return saved;
    // First-ever load: seed localStorage with a fresh copy so we never
    // mutate the DEMO_ACCOUNTS constant itself (accounts.push() below
    // would otherwise corrupt future resetDemo() reseeds).
    const seeded = DEMO_ACCOUNTS.map(a => ({ ...a }));
    writeJson(K.accounts, seeded);
    return seeded;
  },

  findAccountByEmail(email) {
    const e = (email || "").trim().toLowerCase();
    return this.getAccounts().find(a => a.email.toLowerCase() === e) || null;
  },

  getAccount(id) {
    return this.getAccounts().find(a => a.id === id) || null;
  },

  createMemberAccount({ name, email, password, cardNo }) {
    if (this.findAccountByEmail(email)) return { ok: false, reason: "taken" };
    const accounts = this.getAccounts();
    const account = {
      id: newId("acct"),
      role: "member",
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      cardNo: cardNo && cardNo.trim() ? cardNo.trim() : `RD-${Math.floor(10000 + Math.random() * 89999)}`,
      joinedAt: new Date().toISOString()
    };
    accounts.push(account);
    writeJson(K.accounts, accounts);
    fire("accounts-changed");
    return { ok: true, account };
  },

  updateAccountProfile(accountId, { name, email }) {
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === accountId);
    if (!account) return { ok: false };
    const newEmail = email.trim().toLowerCase();
    if (newEmail !== account.email && accounts.some(a => a.id !== accountId && a.email.toLowerCase() === newEmail)) {
      return { ok: false, reason: "taken" };
    }
    account.name = name.trim();
    account.email = newEmail;
    writeJson(K.accounts, accounts);
    fire("accounts-changed");
    fire("session-changed");
    return { ok: true, account };
  },

  changePassword(accountId, currentPassword, newPassword) {
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === accountId);
    if (!account) return { ok: false };
    if (account.password !== currentPassword) return { ok: false, reason: "wrong-password" };
    account.password = newPassword;
    writeJson(K.accounts, accounts);
    return { ok: true };
  },

  login(email, password) {
    const account = this.findAccountByEmail(email);
    if (!account || account.password !== password) return { ok: false, reason: "invalid" };
    if (account.suspended) return { ok: false, reason: "suspended" };
    writeJson(K.session, { accountId: account.id });
    fire("session-changed");
    return { ok: true, account };
  },

  setAccountSuspended(accountId, suspended) {
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    account.suspended = !!suspended;
    writeJson(K.accounts, accounts);
    fire("accounts-changed");
  },

  logout() {
    localStorage.removeItem(K.session);
    fire("session-changed");
  },

  getSession() {
    const s = readJson(K.session, null);
    if (!s) return null;
    const account = this.getAccount(s.accountId);
    return account || null;
  },

  /* ───────────────────────── catalog: library books ───────────────────────── */

  _removedSet() {
    return new Set(readJson(K.removed, []));
  },

  getLibraryBooks() {
    const custom = readJson(K.customLibrary, []);
    const overrides = readJson(K.libraryOverrides, {});
    const removed = this._removedSet();
    return [...LIBRARY_BOOKS, ...custom]
      .filter(b => !removed.has(`library:${b.id}`))
      .map(b => ({ ...b, licenses: overrides[b.id] !== undefined ? overrides[b.id] : b.licenses }));
  },

  getStoreBooks() {
    const custom = readJson(K.customStore, []);
    const overrides = readJson(K.storeOverrides, {});
    const removed = this._removedSet();
    return [...STORE_BOOKS, ...custom]
      .filter(b => !removed.has(`store:${b.id}`))
      .map(b => ({ ...b, price: overrides[b.id] !== undefined ? overrides[b.id] : b.price }));
  },

  getBook(type, id) {
    const list = type === "store" ? this.getStoreBooks() : this.getLibraryBooks();
    return list.find(b => b.id === id) || null;
  },

  getAllBooksFlat() {
    return [
      ...this.getLibraryBooks().map(b => ({ ...b, type: "library" })),
      ...this.getStoreBooks().map(b => ({ ...b, type: "store" }))
    ];
  },

  addLibraryBook(data) {
    const custom = readJson(K.customLibrary, []);
    const id = newId("lib");
    const palette = [
      "linear-gradient(155deg,#5a4636 0%,#382c22 60%,#1f1811 100%)",
      "linear-gradient(155deg,#3f5a72 0%,#243a4e 60%,#12202c 100%)",
      "linear-gradient(155deg,#5c4f38 0%,#3a3122 60%,#211b12 100%)",
      "linear-gradient(155deg,#3f6b52 0%,#254a37 60%,#122a1e 100%)",
      "linear-gradient(155deg,#8a4a63 0%,#5a2c3f 60%,#341825 100%)"
    ];
    const book = {
      id,
      title: data.title.trim(),
      author: data.author.trim(),
      genre: data.genre || "Fiction",
      year: Number(data.year) || new Date().getFullYear(),
      blurb: data.blurb ? data.blurb.trim() : "A new addition to the library shelves.",
      call: data.call ? data.call.trim() : `LIB ${Math.floor(100 + Math.random() * 800)} ${data.author.slice(0, 3).toUpperCase()}`,
      licenses: Math.max(1, Number(data.licenses) || 3),
      spine: "#27272A",
      cover: palette[Math.floor(Math.random() * palette.length)],
      emblem: data.emblem || "leaf",
      epigraph: data.epigraph ? data.epigraph.trim() : "Every book begins on the shelf it is given.",
      pages: Array.isArray(data.pages) && data.pages.length === 2 ? data.pages : [
        data.excerpt || `The opening pages of ${data.title} are still being catalogued, but the story inside is ready to be read.`,
        "The rest of this title continues for readers who borrow it, one chapter at a time."
      ]
    };
    custom.push(book);
    writeJson(K.customLibrary, custom);
    fire("catalog-changed");
    return book;
  },

  addStoreBook(data) {
    const custom = readJson(K.customStore, []);
    const id = newId("store");
    const palette = [
      "linear-gradient(155deg,#8a6a3a 0%,#5c4526 60%,#332614 100%)",
      "linear-gradient(155deg,#a87c3f 0%,#6b4f24 60%,#3a2a12 100%)",
      "linear-gradient(155deg,#454560 0%,#2a2a3c 60%,#161620 100%)",
      "linear-gradient(155deg,#2f4a36 0%,#1a2e20 60%,#0c1a11 100%)",
      "linear-gradient(155deg,#8a5a44 0%,#5c3a2a 60%,#332014 100%)"
    ];
    const book = {
      id,
      title: data.title.trim(),
      author: data.author.trim(),
      genre: data.genre || "Fiction",
      year: Number(data.year) || new Date().getFullYear(),
      blurb: data.blurb ? data.blurb.trim() : "A new title on the shop shelves.",
      call: data.call ? data.call.trim() : `STR ${Math.floor(100 + Math.random() * 800)} ${data.author.slice(0, 3).toUpperCase()}`,
      price: Math.max(0.99, Number(data.price) || 12.99),
      spine: "#27272A",
      cover: palette[Math.floor(Math.random() * palette.length)],
      emblem: data.emblem || "compass",
      epigraph: data.epigraph ? data.epigraph.trim() : "Every book begins on the shelf it is given.",
      pages: Array.isArray(data.pages) && data.pages.length === 2 ? data.pages : [
        data.excerpt || `The opening pages of ${data.title} are still being catalogued, but the story inside is ready to be read.`,
        "The rest of this title continues for readers who buy it, one chapter at a time."
      ]
    };
    custom.push(book);
    writeJson(K.customStore, custom);
    fire("catalog-changed");
    return book;
  },

  updateLibraryBook(id, patch) {
    if (patch.licenses !== undefined) {
      const overrides = readJson(K.libraryOverrides, {});
      overrides[id] = Math.max(0, Number(patch.licenses));
      writeJson(K.libraryOverrides, overrides);
    }
    fire("catalog-changed");
  },

  updateStoreBook(id, patch) {
    if (patch.price !== undefined) {
      const overrides = readJson(K.storeOverrides, {});
      overrides[id] = Math.max(0, Number(patch.price));
      writeJson(K.storeOverrides, overrides);
    }
    fire("catalog-changed");
  },

  removeBook(type, id) {
    const removed = readJson(K.removed, []);
    const key = `${type}:${id}`;
    if (!removed.includes(key)) removed.push(key);
    writeJson(K.removed, removed);
    fire("catalog-changed");
  },

  /* ───────────────────────── circulation: loans ───────────────────────── */

  getLoans() {
    return readJson(K.loans, []);
  },
  getLoansForMember(memberId) {
    return this.getLoans().filter(l => l.memberId === memberId);
  },
  loansForBook(bookId) {
    return this.getLoans().filter(l => l.bookId === bookId);
  },
  availableLicenses(book) {
    if (!book) return 0;
    return Math.max(0, book.licenses - this.loansForBook(book.id).length);
  },
  activeLoanFor(memberId, bookId) {
    return this.getLoans().find(l => l.memberId === memberId && l.bookId === bookId) || null;
  },
  borrowLimitReached(memberId) {
    return this.getLoansForMember(memberId).length >= BORROW_LIMIT;
  },

  borrow(bookId, memberId) {
    const book = this.getBook("library", bookId);
    if (!book) return null;
    if (this.borrowLimitReached(memberId)) return null;
    if (this.availableLicenses(book) <= 0) return null;

    const now = new Date();
    const due = new Date(now.getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000);
    const loan = {
      id: newId("loan"),
      bookId,
      memberId,
      borrowedAt: now.toISOString(),
      dueAt: due.toISOString(),
      progressPage: 0,
      renewals: 0
    };
    const loans = this.getLoans();
    loans.push(loan);
    writeJson(K.loans, loans);
    this.removeFromWaitlist(bookId, memberId);
    fire("loans-changed");
    return loan;
  },

  renewLoan(loanId, extraDays = 14) {
    const loans = this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return null;
    loan.dueAt = new Date(new Date(loan.dueAt).getTime() + extraDays * 86400000).toISOString();
    loan.renewals = (loan.renewals || 0) + 1;
    writeJson(K.loans, loans);
    fire("loans-changed");
    return loan;
  },

  updateReadingProgress(loanId, pageIndex) {
    const loans = this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    loan.progressPage = pageIndex;
    writeJson(K.loans, loans);
  },

  returnLoan(loanId, opts = {}) {
    const loans = this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return null;
    writeJson(K.loans, loans.filter(l => l.id !== loanId));

    const history = readJson(K.history, []);
    const entry = {
      id: newId("hist"),
      bookId: loan.bookId,
      bookType: "library",
      memberId: loan.memberId,
      borrowedAt: loan.borrowedAt,
      returnedAt: new Date().toISOString(),
      rating: 0
    };
    history.unshift(entry);
    writeJson(K.history, history);

    if (opts.markFinished !== false) this.markFinished(loan.memberId, loan.bookId);

    fire("loans-changed");
    fire("history-changed");
    return entry;
  },

  getHistory() {
    return readJson(K.history, []);
  },
  getHistoryForMember(memberId) {
    return this.getHistory().filter(h => h.memberId === memberId);
  },
  setHistoryRating(historyId, rating) {
    const history = this.getHistory();
    const entry = history.find(h => h.id === historyId);
    if (entry) {
      entry.rating = Math.max(1, Math.min(5, Number(rating)));
      writeJson(K.history, history);
      fire("history-changed");
    }
  },

  /* ───────────────────────── waitlist ───────────────────────── */

  getWaitlist() {
    return readJson(K.waitlist, []);
  },
  waitlistCountFor(bookId) {
    return this.getWaitlist().filter(w => w.bookId === bookId).length;
  },
  isOnWaitlist(bookId, memberId) {
    return this.getWaitlist().some(w => w.bookId === bookId && w.memberId === memberId);
  },
  joinWaitlist(bookId, memberId) {
    const list = this.getWaitlist();
    if (list.some(w => w.bookId === bookId && w.memberId === memberId)) return;
    list.push({ id: newId("wait"), bookId, memberId, joinedAt: new Date().toISOString() });
    writeJson(K.waitlist, list);
    fire("waitlist-changed");
  },
  removeFromWaitlist(bookId, memberId) {
    const list = this.getWaitlist();
    const next = list.filter(w => !(w.bookId === bookId && w.memberId === memberId));
    if (next.length !== list.length) {
      writeJson(K.waitlist, next);
      fire("waitlist-changed");
    }
  },

  /* ───────────────────────── favorites ───────────────────────── */

  getFavorites(memberId) {
    return readJson(K.favorites, []).filter(f => f.memberId === memberId);
  },
  isFavorite(memberId, bookType, bookId) {
    return readJson(K.favorites, []).some(f => f.memberId === memberId && f.bookType === bookType && f.bookId === bookId);
  },
  toggleFavorite(memberId, bookType, bookId) {
    const list = readJson(K.favorites, []);
    const idx = list.findIndex(f => f.memberId === memberId && f.bookType === bookType && f.bookId === bookId);
    if (idx >= 0) {
      list.splice(idx, 1);
      writeJson(K.favorites, list);
      fire("favorites-changed");
      return false;
    }
    list.push({ memberId, bookType, bookId, addedAt: new Date().toISOString() });
    writeJson(K.favorites, list);
    fire("favorites-changed");
    return true;
  },

  /* ───────────────────────── reading goal ───────────────────────── */

  getReadingGoal(memberId, year = new Date().getFullYear()) {
    const goals = readJson(K.goals, {});
    const g = goals[memberId];
    if (g && g.year === year) return g;
    return { year, target: 0, finishedBookIds: [] };
  },
  setReadingGoalTarget(memberId, target, year = new Date().getFullYear()) {
    const goals = readJson(K.goals, {});
    const existing = goals[memberId] && goals[memberId].year === year ? goals[memberId] : { year, target: 0, finishedBookIds: [] };
    existing.target = Math.max(1, Number(target) || 1);
    existing.year = year;
    goals[memberId] = existing;
    writeJson(K.goals, goals);
    fire("goals-changed");
  },
  markFinished(memberId, bookId, year = new Date().getFullYear()) {
    const goals = readJson(K.goals, {});
    const existing = goals[memberId] && goals[memberId].year === year ? goals[memberId] : { year, target: 0, finishedBookIds: [] };
    if (!existing.finishedBookIds.includes(bookId)) existing.finishedBookIds.push(bookId);
    goals[memberId] = existing;
    writeJson(K.goals, goals);
    fire("goals-changed");
  },

  /* ───────────────────────── cart & orders (store books) ───────────────────────── */

  getCart(memberId) {
    const carts = readJson(K.cart, {});
    return carts[memberId] || [];
  },
  addToCart(memberId, bookId) {
    const carts = readJson(K.cart, {});
    const cart = carts[memberId] || [];
    if (!cart.includes(bookId)) cart.push(bookId);
    carts[memberId] = cart;
    writeJson(K.cart, carts);
    fire("cart-changed");
  },
  removeFromCart(memberId, bookId) {
    const carts = readJson(K.cart, {});
    carts[memberId] = (carts[memberId] || []).filter(id => id !== bookId);
    writeJson(K.cart, carts);
    fire("cart-changed");
  },
  clearCart(memberId) {
    const carts = readJson(K.cart, {});
    carts[memberId] = [];
    writeJson(K.cart, carts);
    fire("cart-changed");
  },
  cartTotal(memberId) {
    return this.getCart(memberId).reduce((sum, id) => {
      const b = this.getBook("store", id);
      return sum + (b ? b.price : 0);
    }, 0);
  },

  getOrders() {
    return readJson(K.orders, []);
  },
  getOrdersForMember(memberId) {
    return this.getOrders().filter(o => o.memberId === memberId);
  },
  ownsBook(memberId, bookId) {
    return this.getOrdersForMember(memberId).some(o => o.items.some(i => i.bookId === bookId));
  },
  checkout(memberId) {
    const cart = this.getCart(memberId);
    if (!cart.length) return null;
    const items = cart.map(id => {
      const b = this.getBook("store", id);
      return { bookId: id, price: b ? b.price : 0 };
    });
    const order = {
      id: newId("order"),
      memberId,
      items,
      total: items.reduce((s, i) => s + i.price, 0),
      purchasedAt: new Date().toISOString()
    };
    const orders = this.getOrders();
    orders.push(order);
    writeJson(K.orders, orders);
    this.clearCart(memberId);
    fire("orders-changed");
    return order;
  },

  /* ───────────────────────── formatting helpers ───────────────────────── */

  daysUntilDue(loan) {
    return Math.ceil((new Date(loan.dueAt).getTime() - Date.now()) / 86400000);
  },
  formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  },
  formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
  },
  formatPrice(n) {
    return `$${Number(n).toFixed(2)}`;
  },

  /* ───────────────────────── demo reset ───────────────────────── */

  resetDemo() {
    Object.values(K).forEach(key => localStorage.removeItem(key));
    writeJson(K.accounts, DEMO_ACCOUNTS);
    fire("accounts-changed");
    fire("session-changed");
    fire("catalog-changed");
    fire("loans-changed");
    fire("history-changed");
    fire("waitlist-changed");
    fire("favorites-changed");
    fire("goals-changed");
    fire("cart-changed");
    fire("orders-changed");
  }
};
