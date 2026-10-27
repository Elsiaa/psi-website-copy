/* ============================================================
   How We Build — clay build scrub
   Seven photographs of one handcrafted clay diorama, the same
   lot built from staked dirt to keys. Scroll position scrubs
   through them with a crossfade; the step list, tick rail and
   completion meter track the active stage. Reduced motion (or
   no runway) pins the finished house and lists the steps.
   ============================================================ */
(() => {
  "use strict";

  const runway = document.getElementById("psRunway");
  if (!runway) return;

  const frames = [...runway.querySelectorAll(".ps-frame")];
  const items = [...runway.querySelectorAll(".ps-item")];
  const jumps = [...runway.querySelectorAll(".ps-item__btn")];
  const N = frames.length;
  if (!N) return;

  const vpH = () => document.documentElement.clientHeight;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setStage(f) {
    // f is a float 0..N-1. Each stage holds crisp for about a third
    // of its span (the dwell); the crossfade runs eased between the
    // dwells, and the incoming photograph settles from a touch
    // larger, so every stage reads as an arrival instead of a blur.
    const DWELL = 0.44;
    const i = Math.max(0, Math.min(N - 1, f));
    const lo = Math.floor(i);
    const hi = Math.min(N - 1, lo + 1);
    const t = i - lo;
    let e = t <= DWELL ? 0 : t >= 1 - DWELL ? 1 : (t - DWELL) / (1 - 2 * DWELL);
    e = e * e * (3 - 2 * e); // smoothstep
    frames.forEach((img, k) => {
      if (k === lo) {
        img.style.opacity = 1;
        img.style.zIndex = 1;
        img.style.transform = "none";
      } else if (k === hi) {
        img.style.opacity = e;
        img.style.zIndex = 2;
        img.style.transform = "scale(" + (1.02 - 0.02 * e).toFixed(4) + ")";
      } else {
        img.style.opacity = 0;
        img.style.zIndex = 0;
        img.style.transform = "none";
      }
    });
    const active = e > 0.5 ? hi : lo;
    items.forEach((it, k) => {
      it.classList.toggle("is-on", k === active);
      it.classList.toggle("is-done", k < active);
    });
  }

  if (reduce.matches) {
    setStage(N - 1);
    return;
  }
  runway.classList.add("is-pinned");

  function progress() {
    const r = runway.getBoundingClientRect();
    const span = r.height - vpH();
    if (span <= 0) return N - 1;
    return Math.max(0, Math.min(1, -r.top / span)) * (N - 1);
  }
  // Synchronous on purpose: seven opacity writes are cheap, and
  // rAF never fires in hidden or throttled documents.
  function onScroll() {
    setStage(progress());
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });

  // the index is the navigation: click a stage to scroll to it
  jumps.forEach((b) => {
    b.addEventListener("click", () => {
      const k = +b.dataset.go;
      const r = runway.getBoundingClientRect();
      const span = r.height - vpH();
      const target = scrollY + r.top + (k / (N - 1)) * span;
      scrollTo({ top: target, behavior: "smooth" });
    });
  });

  // paint the right stage even before the first scroll event,
  // including when the document loads mid-page or hidden
  setStage(progress());
})();
