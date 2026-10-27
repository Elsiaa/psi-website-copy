/* ============================================================
   Hero: the open house
   The cutaway house carries the hero, then hands off: as the
   short runway scrolls out, the copy lifts away and the house
   scales down toward What We Build, which rises to meet it.
   Synchronous scroll math, immune to rAF throttling.
   ============================================================ */
(() => {
  "use strict";
  const hero = document.querySelector(".hero--open");
  if (!hero) return;
  const copy = hero.querySelector(".heroo__copy");
  const stage = hero.querySelector(".heroo__stagewrap");
  const pins = [...hero.querySelectorAll(".heroo__pin")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || !copy || !stage) return;

  const vpH = () => document.documentElement.clientHeight;

  function paint() {
    const r = hero.getBoundingClientRect();
    const span = r.height - vpH();
    const p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
    const e = p * p * (3 - 2 * p);
    copy.style.opacity = Math.max(0, 1 - e * 1.9).toFixed(3);
    copy.style.transform = "translateY(" + (-e * 48).toFixed(1) + "px)";
    stage.style.transform =
      "translateY(" +
      (e * 10).toFixed(2) +
      "svh) scale(" +
      (1 - 0.2 * e).toFixed(4) +
      ")";
    const pinO = Math.max(0, 1 - e * 2.4).toFixed(3);
    pins.forEach((pin) => (pin.style.opacity = pinO));
  }

  addEventListener("scroll", paint, { passive: true });
  addEventListener("resize", paint, { passive: true });
  paint();
})();
