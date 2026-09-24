/* ============================================================
   Readily: cover illustrations
   AI-generated cover art (one image per title, see img/covers/),
   matched to each book's title/author printed on the artwork
   itself — see data.js for the title/author/genre/blurb text
   written to match each cover.
   ============================================================ */

const EMBLEMS = {
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 20c8-1 14-7 15-16-9 1-15 7-15 16Z"/><path d="M5 19c3-4 7-8 12-11"/></svg>',
  orbit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="2.4"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="4.2" ry="10" transform="rotate(35 12 12)"/></svg>',
  quill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M20 4c-7 1-13 6-15 15 9-2 14-8 15-15Z"/><path d="M5 19l3-3"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6 6-2Z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 17c0-6 1-10 6-10s6 4 6 10H6Z"/><path d="M4 17h16"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  window: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 3v18M6 21h12"/><path d="M4 7h6M14 7h6"/><path d="M4 7l-2.5 5a2.5 2.5 0 0 0 5 0L4 7ZM20 7l-2.5 5a2.5 2.5 0 0 0 5 0L20 7Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 3l2.4 6.5L21 11l-5 4.2L17.5 21 12 17.3 6.5 21 8 15.2 3 11l6.6-1.5L12 3Z"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="4.2"/><path d="M11 11l9 9M16 16l3-3M18 18l2.5-2.5"/></svg>'
};

// The 16 original catalog titles each have a matching image in
// img/covers/; books added later through the librarian/store-staff
// intake form don't, and fall back to the plain background color
// already set on the cover element (book.cover) — same fallback the
// old per-title SVG art used when a bookId had no entry.
const COVER_PHOTO_IDS = new Set([
  "orchard-glass", "long-orbit", "marguerite-letters", "cartographers-daughter",
  "quiet-ledger", "hollow-bell", "sonnets-rented-room", "house-remembers",
  "tiny-habits-architecture", "currency-of-calm", "salt-road", "stolen-manuscript",
  "weight-of-small-decisions", "gilded-terrace", "seven-summers", "hollow-crest"
]);

function renderCoverArt(bookId, extraClass) {
  if (!COVER_PHOTO_IDS.has(bookId)) return "";
  return `<img class="cover-art-svg${extraClass ? " " + extraClass : ""}" src="img/covers/${bookId}.jpg" alt="" aria-hidden="true" loading="lazy">`;
}
