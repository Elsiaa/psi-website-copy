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
  const steps = [...runway.querySelectorAll(".ps-step")];
  const ticks = [...runway.querySelectorAll(".ps-tick-btn")];
  const count = document.getElementById("psCount");
  const N = frames.length;
  if (!N) return;

  const vpH = () => document.documentElement.clientHeight;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setStage(f) {
    // f is a float 0..N-1. Stages dwell, then hand over by fading
    // through the page itself: the outgoing photograph dissolves
    // fully before the incoming one rises, so two frames never
    // ghost over each other and the motion stays silky.
    const DWELL = 0.22;
    const i = Math.max(0, Math.min(N - 1, f));
    const lo = Math.floor(i);
    const hi = Math.min(N - 1, lo + 1);
    const t = i - lo;
    let e = t <= DWELL ? 0 : t >= 1 - DWELL ? 1 : (t - DWELL) / (1 - 2 * DWELL);
    e = e * e * (3 - 2 * e); // smoothstep
    const out = Math.min(1, e * 2); // first half: outgoing leaves
    const inn = Math.max(0, e * 2 - 1); // second half: incoming arrives
    frames.forEach((img, k) => {
      if (k === lo) {
        img.style.opacity = (1 - out).toFixed(3);
        img.style.zIndex = 1;
        img.style.transform =
          out > 0 ? "scale(" + (1 + 0.012 * out).toFixed(4) + ")" : "none";
      } else if (k === hi) {
        img.style.opacity = inn.toFixed(3);
        img.style.zIndex = 2;
        img.style.transform =
          inn < 1 ? "scale(" + (1.018 - 0.018 * inn).toFixed(4) + ")" : "none";
      } else {
        img.style.opacity = 0;
        img.style.zIndex = 0;
      }
    });
    const active = e > 0.5 ? hi : lo;
    const live = frames[N - 1];
    if (live && live.tagName === "VIDEO") {
      if (active === N - 1 && live.paused) {
        live.play().catch(() => {});
      } else if (active !== N - 1 && !live.paused) {
        live.pause();
      }
    }
    steps.forEach((st, k) => st.classList.toggle("is-on", k === active));
    ticks.forEach((b, k) => b.classList.toggle("is-on", k === active));
    if (count) count.textContent = active + 1 + " / " + N;
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

  // tick rail: jump the scroll to a stage
  ticks.forEach((b) => {
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
