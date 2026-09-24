/* ============================================================
   Readily: page-transition loader
   A static multi-page site has no client-side router, so "page
   transitions" are simulated: show a branded interstitial, wait a
   beat, then do the real navigation. Every internal <a> click is
   intercepted automatically below; a handful of programmatic
   redirects across the other JS files call goTo() directly instead
   of assigning location.href. Must load before every other script
   on the page (goTo is called synchronously by some of them).
   ============================================================ */

const PAGE_LABELS = {
  "index.html": "Home",
  "browse.html": "Browse",
  "explorer.html": "Explorer",
  "my-books.html": "My Books",
  "cart.html": "Cart",
  "checkout.html": "Checkout",
  "order-confirmation.html": "Your Order",
  "book.html": "Book Details",
  "profile.html": "Profile",
  "login.html": "Log In",
  "signup.html": "Sign Up",
  "librarian.html": "Librarian Desk",
  "store-staff.html": "Store Staff"
};

function rrLabelForUrl(url) {
  const path = url.split("?")[0].split("/").pop();
  return PAGE_LABELS[path] || "Readily";
}

function rrLoaderEl() {
  return document.getElementById("rrPageLoader");
}

/** Two visual modes: a known destination shows the spinner ring with a
 *  specific label ("Loading Browse…"); no known destination (a plain
 *  reload, or the initial page arrival) shows just the Readily mark,
 *  clean, with no "Loading…" text underneath. */
function rrShowLoader(label) {
  const el = rrLoaderEl();
  if (!el) return;
  const markEl = el.querySelector(".rr-loader-mark");
  const ringEl = el.querySelector(".rr-loader-ring");
  const textEl = el.querySelector(".rr-loader-text");
  if (markEl) markEl.hidden = !!label;
  if (ringEl) ringEl.hidden = !label;
  if (textEl) {
    textEl.hidden = !label;
    if (label) textEl.textContent = `Loading ${label}…`;
  }
  el.classList.remove("rr-hide");
}

function rrHideLoader() {
  const el = rrLoaderEl();
  if (el) el.classList.add("rr-hide");
}

/** Navigate with a brief branded loading interstitial. Use this instead
 *  of a raw `location.href = url` assignment anywhere in the app. */
function goTo(url) {
  rrShowLoader(rrLabelForUrl(url));
  setTimeout(() => { location.href = url; }, 420);
}

(function () {
  // Arrival leg (including a plain Cmd+R reload): the loader ships
  // visible (no rr-hide class) already showing the generic mode (Readily
  // mark + "Loading…") so it covers first paint with no destination
  // context to claim. Fade it out once this page is ready.
  function reveal() {
    setTimeout(rrHideLoader, 320);
  }
  if (document.readyState === "complete") reveal();
  else window.addEventListener("load", reveal);

  // Departure leg: intercept internal link clicks site-wide so every
  // <a href="*.html"> gets the same loading interstitial, with zero
  // markup changes needed on individual links.
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || a.target === "_blank" || a.hasAttribute("download")) return;
    e.preventDefault();
    goTo(href);
  }, true);
})();
