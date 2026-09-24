/* ============================================================
   Readily: motion layer, powered by Motion (motion.dev).
   Pure enhancement — nothing here is pre-hidden via CSS, so if
   this module fails to load (offline, CDN down), every page still
   renders and functions normally, just without the entrance
   animation. Scroll reveals fire once per element, then unsubscribe.
   ============================================================ */

import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const easeOut = [0.16, 1, 0.3, 1];

function heroEntrance() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const els = [...hero.children].filter(el => !el.classList.contains("hero-blob"));
  if (!els.length) return;
  animate(els, { opacity: [0, 1], y: [14, 0] }, { duration: 0.5, delay: stagger(0.07), easing: easeOut });
}

function revealGrids() {
  const groups = [
    [".catalog-grid", ".book-card"],
    [".loan-list", ".loan-card"],
    [".admin-grid-stats", ".stat-card"],
    [".explorer-shelf", ".explorer-book"]
  ];
  groups.forEach(([containerSel, itemSel]) => {
    document.querySelectorAll(containerSel).forEach((container) => {
      const stop = inView(container, () => {
        const items = container.querySelectorAll(itemSel);
        if (items.length) {
          animate(items, { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, delay: stagger(0.035), easing: easeOut });
        }
        if (stop) stop();
      }, { amount: 0.1 });
    });
  });
}

function revealStandalone() {
  document.querySelectorAll(".auth-shell, .receipt-card, .book-detail-panel, .admin-section, .goal-widget").forEach((el) => {
    const stop = inView(el, () => {
      animate(el, { opacity: [0, 1], y: [12, 0] }, { duration: 0.45, easing: easeOut });
      if (stop) stop();
    }, { amount: 0.1 });
  });
}

function watchModals() {
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    const card = backdrop.querySelector(".modal-card");
    if (!card) return;
    const observer = new MutationObserver(() => {
      if (!backdrop.hasAttribute("hidden")) {
        animate(card, { opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.22, easing: easeOut });
      }
    });
    observer.observe(backdrop, { attributes: true, attributeFilter: ["hidden"] });
  });
}

function run() {
  if (reduceMotion) return;
  heroEntrance();
  revealGrids();
  revealStandalone();
  watchModals();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", run);
} else {
  run();
}
