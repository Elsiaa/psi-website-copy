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
    // f is a float 0..N-1; crossfade the two neighbouring frames
    const i = Math.max(0, Math.min(N - 1, f));
    const lo = Math.floor(i);
    const hi = Math.min(N - 1, lo + 1);
    const t = i - lo;
    frames.forEach((img, k) => {
      img.style.opacity = k === lo ? 1 : k === hi ? t : 0;
      img.style.zIndex = k === lo ? 1 : k === hi ? 2 : 0;
    });
    const active = t > 0.5 ? hi : lo;
    steps.forEach((s, k) => s.classList.toggle("is-on", k === active));
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
