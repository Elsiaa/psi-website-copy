/* ============================================================
   Hero: the build itself
   Seven clay frames of one diorama, staked lot to finished home,
   scrubbed by the runway as a continuous crossfade. The headline
   holds the whole way; the finished house then hands off into
   What We Build, which rises to meet it. Synchronous scroll
   math, immune to rAF throttling.
   ============================================================ */
(() => {
  "use strict";
  const hero = document.querySelector(".hero--open");
  if (!hero) return;
  const copy = hero.querySelector(".heroo__copy");
  const stage = hero.querySelector(".heroo__stagewrap");
  const frames = [...hero.querySelectorAll(".hb__frame")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!copy || !stage || frames.length < 2) return;

  const vpH = () => document.documentElement.clientHeight;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => v * v * (3 - 2 * v);
  const seg = (p, a, b) => smooth(clamp01((p - a) / (b - a)));
  const N = frames.length;

  if (reduce.matches) {
    frames.forEach((f, k) => (f.style.opacity = k === N - 1 ? 1 : 0));
    return;
  }
  hero.classList.add("heroo-js");

  function paint() {
    const r = hero.getBoundingClientRect();
    const span = r.height - vpH();
    const p = span > 0 ? clamp01(-r.top / span) : 0;

    // the build: a continuous crossfade across the seven frames
    const f = clamp01(p / 0.86) * (N - 1);
    const lo = Math.floor(Math.min(f, N - 1 - 1e-6));
    const t = f - lo;
    frames.forEach((img, k) => {
      img.style.opacity = k === lo ? 1 : k === lo + 1 ? t.toFixed(3) : 0;
      img.style.zIndex = k === lo ? 1 : k === lo + 1 ? 2 : 0;
    });

    // the finale: headline and model leave together, next section cued
    const hand = seg(p, 0.88, 1);
    copy.style.opacity = (1 - hand).toFixed(3);
    copy.style.transform = "translateY(" + (-hand * 56).toFixed(1) + "px)";
    stage.style.transform =
      "translateY(" +
      (-hand * 6).toFixed(2) +
      "svh) scale(" +
      (1 - 0.16 * hand).toFixed(4) +
      ")";
    stage.style.opacity = (1 - hand * 0.9).toFixed(3);
    const caps = document.getElementById("capabilities");
    if (caps) caps.classList.toggle("caps--in", p >= 0.9);
  }
  addEventListener("scroll", paint, { passive: true });
  addEventListener("resize", paint, { passive: true });
  paint();
})();
