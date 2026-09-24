/* ============================================================
   Readily: confetti burst
   A small celebratory particle burst for "it worked" moments
   (borrowing, buying). Plain DOM + WAAPI, no canvas.
   ============================================================ */

const Confetti = (() => {
  const COLORS = ["#09090B", "#4F46E5", "#059669", "#DB2777", "#D97706", "#52525B"];

  function burst(originEl, count = 22) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = originEl && originEl.getBoundingClientRect
      ? originEl.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      const size = 5 + Math.random() * 5;
      const isCircle = Math.random() > 0.5;
      piece.style.width = size + "px";
      piece.style.height = (isCircle ? size : size * 1.6) + "px";
      piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (isCircle) piece.style.borderRadius = "50%";
      piece.style.left = originX + "px";
      piece.style.top = originY + "px";
      document.body.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 110;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 40;
      const rot = (Math.random() - 0.5) * 720;
      const duration = 700 + Math.random() * 500;

      if (typeof piece.animate === "function") {
        try {
          const anim = piece.animate([
            { transform: "translate(-50%,-50%) translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
            { transform: `translate(-50%,-50%) translate(${dx}px, ${dy - 40}px) rotate(${rot}deg) scale(1)`, opacity: 1, offset: 0.55 },
            { transform: `translate(-50%,-50%) translate(${dx * 1.15}px, ${dy + 160}px) rotate(${rot * 1.3}deg) scale(.7)`, opacity: 0 }
          ], { duration, easing: "cubic-bezier(.2,.7,.3,1)" });
          anim.onfinish = () => piece.remove();
        } catch (e) { /* animation unsupported in this environment, fall through to cleanup below */ }
      }
      setTimeout(() => piece.remove(), duration + 100);
    }
  }

  return { burst };
})();
