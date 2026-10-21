/* PSI upgrade: proof-strip count-up. Numbers are written in the markup,
   so the page reads correctly with no script or with reduced motion. */
(() => {
  "use strict";
  const els = [...document.querySelectorAll("[data-count]")];
  if (!els.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, n = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now();
      (function step(t) {
        const k = Math.min(1, (t - t0) / 1300), v = n * (1 - Math.pow(1 - k, 3));
        el.textContent = v.toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
})();
