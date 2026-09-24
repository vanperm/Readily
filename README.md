# Readily: a library and a bookshop

An HCI final-project prototype inspired by openlibrary.org: some books are
free to **borrow** (temporary, digital lending, due dates, waitlists), others
are for sale to **buy and keep** (permanent ownership, cart, checkout). Three
account types share one login — **Member** (public signup), **Librarian**,
and **Store Staff** — and land on different dashboards depending on who logs
in.

There is no backend and no build step. Everything runs from static files,
with all state kept in the browser's `localStorage`.

## Opening the project

1. Open this folder (`chapter-house/`) directly in VS Code.
2. Because the pages load fonts and use `localStorage`, don't just
   double-click `index.html` from the file explorer (`file://` URLs disable
   storage in some browsers). Instead, serve the folder with any static
   server, for example:
   - VS Code: install the **Live Server** extension, right-click
     `index.html`, choose "Open with Live Server".
   - Or, with Python installed, run `python3 -m http.server 5500` from this
     folder and open `http://localhost:5500`.
3. Start on `index.html`.

## Demo logins

Fixed accounts, reproduced every time you use "Reset for Demo" in either
admin dashboard:

| Role | Email | Password |
|---|---|---|
| Member | `alex@readily.demo` | `demo1234` |
| Librarian | `librarian@readily.demo` | `demo1234` |
| Store Staff | `staff@readily.demo` | `demo1234` |

You can also create a brand-new member account from the Sign Up page.
Librarian and Store Staff accounts are seeded only, not self-serve.

## What to try

- **Browse** the catalog (`browse.html`) — search, filter Library vs. Store,
  filter by genre, sort. No login needed to look around.
- **Preview any book in 3D** (`book.html`) — click a cover, open it, flip
  pages with the arrow buttons or keyboard arrows. Reading is open to
  everyone, even logged out.
- **Borrow a Library book** — free, 14-day loan, resumes where you left off
  next time you open it (reading progress is saved per loan). If every copy
  is out, join the waitlist instead of hitting a dead end.
- **Buy a Store book** — add to cart, check out with a mock payment form
  (no real card is charged), and it's yours forever in **My Books →
  Purchased**.
- **My Books** — tabs for Loans, Purchased, Favorites, Reading History (with
  star ratings), and a yearly Reading Goal with a progress ring.
- **Explorer** (`explorer.html`) — a spatial, shelf-by-genre way to browse
  instead of the search grid.
- **Librarian Desk** (`librarian.html`) — circulation ledger, library
  catalog management (add books, adjust license counts), member search and
  suspend/reactivate, and a most-borrowed report.
- **Store Staff** (`store-staff.html`) — order history, store catalog and
  pricing, customer search, and a best-sellers report.
- **Reset for Demo** — in either admin dashboard, wipes every account, loan,
  order, and catalog edit, then restores the original sample data. Logs
  everyone out. Use it to start a demo run clean.

## File structure

```
chapter-house/
├── index.html              Home — guest landing or personalized member dashboard
├── login.html               Shared login for all three roles
├── signup.html               Member self-registration
├── browse.html               Catalog search / filter / sort
├── book.html                 Book detail + 3D reader + borrow/buy panel
├── cart.html / checkout.html / order-confirmation.html   Buying flow
├── my-books.html             Loans, Purchased, Favorites, History, Reading Goal
├── explorer.html              Virtual shelf-by-genre browse view
├── profile.html               Account settings
├── librarian.html             Librarian dashboard (circulation/catalog/members/reports)
├── store-staff.html           Store staff dashboard (orders/catalog/customers/reports)
├── css/
│   ├── style.css              Design tokens (brown "library" theme), layout, components
│   └── reader.css             The 3D book reader + borrow/buy panel
└── js/
    ├── data.js                 Seed catalog: LIBRARY_BOOKS + STORE_BOOKS
    ├── store.js                 Full data/persistence layer (accounts, loans, orders, …)
    ├── genre-colors.js / art.js  Genre accent colors + cover line-art + emblem icons
    ├── sound.js / toast.js / confetti.js   Shared feedback utilities
    ├── common.js                 Account menu, nav badges, role guard (requireRole)
    ├── login.js / signup.js / profile.js
    ├── browse.js / reader.js / explorer.js
    ├── cart.js / checkout.js / order-confirmation.js
    ├── my-books.js / home.js
    └── librarian.js / store-staff.js
```

## Notes on the content

All book titles, authors, blurbs, and excerpt text are original and
fictional, written for this project. Cover art is CSS gradients plus small
inline SVG icons, so nothing depends on external images (only Google Fonts
are loaded remotely, for typography).

## Design notes

This pass prioritizes UX flow coverage over final visual polish — a later
pass is expected to refine spacing, type, and color further. The palette is
a warm brown "library" theme (parchment background, leather-brown primary,
brass/gold accents), with the two admin dashboards each carrying their own
accent color (reading-lamp green for Librarian, ledger-red for Store Staff)
so a screenshot alone tells you which side of the site you're looking at.
