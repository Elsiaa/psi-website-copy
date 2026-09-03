/* ============================================================
   PSI Construction — the build
   The process section pins while vertical scroll assembles
   55 Reynolds Street phase by phase: progress maps to phases
   1-10, cumulative .on-N classes reveal each layer, and the
   copy panel follows.

   Fails open: no JS, a short/narrow viewport, or reduced motion
   drops the pin and shows the finished house over a step list.
   ============================================================ */
(() => {
  "use strict";

  const runway = document.getElementById("processRunway");
  const scene = document.getElementById("processScene");
  const fill = document.getElementById("processFill");
  const count = document.getElementById("processCount");
  if (!runway || !scene) return;

  const steps = Array.from(scene.querySelectorAll(".bstep"));
  const PHASES = 10;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let pinned = false;
  let ticking = false;
  let lastPhase = -1;

  const canPin = () =>
    !reduced.matches && window.innerWidth >= 860 && window.innerHeight >= 560;

  const measure = () => {
    pinned = canPin();
    runway.classList.toggle("is-pinned", pinned);

    if (!pinned) {
      runway.style.height = "";
      for (let n = 1; n <= PHASES; n++) scene.classList.remove("on-" + n);
      lastPhase = -1;
      return;
    }

    // A bit over half a viewport per phase: long enough to read each
    // stage, short enough that the pin never feels stuck.
    runway.style.height = window.innerHeight * (PHASES * 0.55 + 1) + "px";
    render();
  };

  const render = () => {
    if (!pinned) return;

    const distance = runway.offsetHeight - window.innerHeight;
    const progress =
      distance <= 0
        ? 1
        : Math.min(
            1,
            Math.max(0, -runway.getBoundingClientRect().top / distance),
          );

    // Phase 1 lights immediately; the last sliver holds phase 10.
    const phase = Math.min(PHASES, 1 + Math.floor(progress * PHASES * 0.999));

    if (phase !== lastPhase) {
      for (let n = 1; n <= PHASES; n++)
        scene.classList.toggle("on-" + n, n <= phase);
      steps.forEach((el, i) => el.classList.toggle("is-on", i === phase - 1));
      if (count) count.textContent = String(phase).padStart(2, "0");
      lastPhase = phase;
    }
    if (fill) fill.style.width = progress * 100 + "%";
  };

  const onScroll = () => {
    // rAF never fires in a hidden document (background tab, hidden
    // preview pane), which would freeze the scene mid-build; render
    // synchronously there and let rAF pace the visible case.
    if (document.visibilityState === "hidden") {
      render();
      return;
    }
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  document.addEventListener("visibilitychange", () => render());
  if (reduced.addEventListener) reduced.addEventListener("change", measure);
  window.addEventListener("load", measure);
  measure();
})();
