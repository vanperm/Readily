/* ============================================================
   Readily: shared chrome — account menu, nav badges,
   sound toggle, and the role guard every protected page calls.
   ============================================================ */

const ICON_SOUND_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 8.5a5 5 0 0 1 0 7"/><path d="M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICON_SOUND_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>';
const ICON_USER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>';
const ICON_BOOK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V6a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2Z"/><path d="M20 19.5V6a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2Z"/></svg>';
const ICON_LOGOUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';

function roleHome(role) {
  if (role === "librarian") return "librarian.html";
  if (role === "store-staff") return "store-staff.html";
  return "index.html";
}

/** Call at the top of a protected page's controller script.
 *  roles: a role string or array of allowed roles.
 *  Returns the account if allowed, otherwise redirects and returns null. */
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  const account = Store.getSession();
  if (!account) {
    const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
    goTo(`login.html?next=${next}`);
    return null;
  }
  if (!allowed.includes(account.role)) {
    goTo(roleHome(account.role));
    return null;
  }
  return account;
}

function initials(name) {
  return (name || "?").trim().split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function renderAccountArea() {
  const slot = document.getElementById("accountMenuSlot");
  if (!slot) return;
  const account = Store.getSession();

  if (!account) {
    slot.innerHTML = `
      <div class="nav-cta">
        <a href="signup.html" class="btn-nav-ghost">Sign Up</a>
        <a href="login.html" class="btn-nav-solid">Log In</a>
      </div>
    `;
    return;
  }

  const roleLabel = account.role === "librarian" ? "Librarian" : account.role === "store-staff" ? "Store Staff" : "Member";
  const loanCount = account.role === "member" ? Store.getLoansForMember(account.id).length : 0;
  const memberItems = account.role === "member"
    ? `
      <a href="profile.html" class="ad-item">${ICON_USER}<span class="ad-label">Profile</span></a>
      <a href="my-books.html" class="ad-item">${ICON_BOOK}<span class="ad-label">My Books</span>${loanCount > 0 ? `<span class="ad-badge">${loanCount} out</span>` : ""}</a>
      <div class="ad-divider"></div>
    `
    : "";

  slot.innerHTML = `
    <div class="account-menu" id="accountMenu">
      <button type="button" class="account-btn" id="accountMenuBtn">
        <span class="account-avatar">${initials(account.name)}</span>
        <span>${account.name.split(" ")[0]}</span>
      </button>
      <div class="account-dropdown">
        <div class="ad-header">
          <span class="account-avatar">${initials(account.name)}</span>
          <div>
            <div class="ad-name">${account.name}</div>
            <div class="ad-email">${roleLabel} &middot; ${account.email}</div>
          </div>
        </div>
        ${memberItems}
        <button type="button" data-action="logout" class="ad-item danger">${ICON_LOGOUT}<span class="ad-label">Log out</span></button>
      </div>
    </div>
  `;

  const menu = document.getElementById("accountMenu");
  const btn = document.getElementById("accountMenuBtn");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("open") && !menu.contains(e.target)) menu.classList.remove("open");
  });
  slot.querySelector('[data-action="logout"]').addEventListener("click", () => {
    Store.logout();
    goTo("index.html");
  });
}

function updateNavBadges() {
  const account = Store.getSession();
  const loanBadge = document.getElementById("navLoanCount");
  if (loanBadge) {
    const n = account && account.role === "member" ? Store.getLoansForMember(account.id).length : 0;
    loanBadge.textContent = n;
    loanBadge.style.display = n > 0 ? "inline-block" : "none";
  }
  const cartBadge = document.getElementById("navCartCount");
  if (cartBadge) {
    const n = account && account.role === "member" ? Store.getCart(account.id).length : 0;
    cartBadge.textContent = n;
    cartBadge.style.display = n > 0 ? "inline-block" : "none";
  }
}

function showSoundFeedback(muted) {
  let badge = document.getElementById("soundFeedbackBadge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "soundFeedbackBadge";
    badge.className = "sound-feedback-badge";
    document.body.appendChild(badge);
  }
  badge.innerHTML = muted ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> Audio Muted' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Audio Active';
  badge.classList.remove("show");
  void badge.offsetWidth;
  badge.classList.add("show");
  clearTimeout(badge._timer);
  badge._timer = setTimeout(() => badge.classList.remove("show"), 1800);
}

/** Measures the actual rendered nav-bar height and exposes it as a CSS
 *  custom property, so sticky elements below it (e.g. .controls on
 *  Browse) can position flush against it without a hardcoded guess. */
function initStickyNavOffset() {
  const bar = document.querySelector(".ledger-bar");
  if (!bar) return;
  const setOffset = () => document.documentElement.style.setProperty("--nav-h", `${bar.offsetHeight}px`);
  setOffset();
  window.addEventListener("resize", setOffset);
}

function initSoundToggle() {
  const toggle = document.getElementById("soundToggle");
  if (!toggle) return;
  const paint = () => {
    const muted = Sound.isMuted();
    toggle.setAttribute("aria-pressed", (!muted).toString());
    toggle.setAttribute("aria-label", muted ? "Audio feedback is muted. Click to turn on." : "Audio feedback is on. Click to mute.");
    toggle.innerHTML = muted ? ICON_SOUND_OFF : ICON_SOUND_ON;
  };
  paint();
  toggle.addEventListener("click", () => {
    const muted = Sound.toggle();
    paint();
    showSoundFeedback(muted);
    if (!muted) Sound.click();
  });
}

function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  const paint = () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-pressed", dark.toString());
    toggle.setAttribute("aria-label", dark ? "Dark mode is on. Click to switch to light mode." : "Light mode is on. Click to switch to dark mode.");
  };
  paint();
  toggle.addEventListener("click", () => {
    // Same branded interstitial used for page navigations (rrShowLoader/
    // rrHideLoader, from page-loader.js) — the theme flip happens while
    // the screen is covered, so it reads as a deliberate transition
    // instead of an instant, jarring color swap.
    //
    // The loader's normal background/badge come from --bg/--brand-plaque,
    // which only take their new value the instant data-theme flips. If
    // that flip happens mid-transition (as it must, since it's the whole
    // point), whichever moment the browser repaints can briefly show the
    // OLD theme's backdrop paired with logic meant for the new one — the
    // "two combinations in one transition" glitch. To guarantee exactly
    // one background+icon pairing for the whole animation, the target
    // theme's colors are set inline up front instead of read live off
    // the cascade, then cleared once the real theme has taken over.
    const loaderEl = document.getElementById("rrPageLoader");
    const markImg = loaderEl && loaderEl.querySelector(".rr-loader-mark img");
    if (typeof rrShowLoader !== "function" || !loaderEl || !markImg) { toggleTheme(); return; }
    const goingDark = document.documentElement.getAttribute("data-theme") !== "dark";
    const markEl = loaderEl.querySelector(".rr-loader-mark");
    loaderEl.style.background = goingDark ? "#0B0B0D" : "#FAFAFA";
    markEl.style.background = "transparent";
    markEl.style.boxShadow = "none";
    markImg.src = goingDark ? "img/logo-mark.png" : "img/logo-mark-dark.png";

    rrShowLoader();
    setTimeout(() => {
      toggleTheme();
      setTimeout(() => {
        rrHideLoader();
        setTimeout(() => {
          // Hand the loader back to its normal CSS-variable-driven look
          // for the next plain page navigation.
          loaderEl.style.background = "";
          markEl.style.background = "";
          markEl.style.boxShadow = "";
          markImg.src = "img/logo-mark.png";
        }, 350);
      }, 220);
    }, 340);
  });

  function toggleTheme() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) {
      document.documentElement.removeAttribute("data-theme");
      try { localStorage.setItem("readily:theme", "light"); } catch (e) {}
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      try { localStorage.setItem("readily:theme", "dark"); } catch (e) {}
    }
    paint();
    Sound.click();
  }

  const nudge = document.getElementById("themeNudge");
  if (nudge) nudge.addEventListener("click", () => toggle.click());
}

/** Animates a number counting up inside el's textContent. */
function animateCount(el, target, duration = 450) {
  if (!el) return;
  const start = Number(el.dataset.countFrom || 0);
  if (start === target) { el.textContent = target; return; }
  const startTime = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (p < 1) requestAnimationFrame(tick);
    else el.dataset.countFrom = target;
  }
  requestAnimationFrame(tick);
}

/** Shared by every page with a .hero-photo hero (see index/browse/
 *  explorer.html) — crossfades through whichever #heroBgSlides slides
 *  that page defines. No-ops if the page has none. */
function initHeroSlideshow() {
  const slides = document.querySelectorAll("#heroBgSlides .hero-bg-slide");
  if (slides.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove("active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("active");
  }, 8000);
}

function initNav() {
  renderAccountArea();
  updateNavBadges();
  initSoundToggle();
  initThemeToggle();
  initStickyNavOffset();
  initHeroSlideshow();
  window.addEventListener("readily:session-changed", () => { renderAccountArea(); updateNavBadges(); });
  window.addEventListener("readily:loans-changed", () => { renderAccountArea(); updateNavBadges(); });
  window.addEventListener("readily:cart-changed", updateNavBadges);
}

document.addEventListener("DOMContentLoaded", initNav);
