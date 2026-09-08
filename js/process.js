/* ============================================================
   PSI Construction — the build
   Seven photographs of one project, shot from the same camera.
   Scroll position cross-dissolves between them, so the job runs
   forward under the reader's finger and backwards just as
   cleanly. Nothing animates on a timer.
   ============================================================ */
(() => {
  "use strict";

  const runway = document.getElementById("psRunway");
  if (!runway) return;

  const frames = [...runway.querySelectorAll(".ps-frame")];
  const steps = [...runway.querySelectorAll(".ps-step")];
  const ticks = [...runway.querySelectorAll(".ps-tick-btn")];
  if (!frames.length) return;

  const N = frames.length;
  const SEG = 1 / N;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  // the dissolve happens in the last third of each stage, so each
  // photograph gets a beat of stillness before it hands over
  const FADE_FROM = 0.66;
  const smooth = (t) => t * t * (3 - 2 * t);

  let pinned = false,
    ticking = false,
    last = -1,
    near = true;

  const canPin = () => !reduce.matches && window.innerHeight >= 560;

  const paint = (p) => {
    const idx = Math.min(N - 1, Math.floor(p / SEG));
    const local = cl((p - idx * SEG) / SEG);
    const over =
      local <= FADE_FROM ? 0 : smooth((local - FADE_FROM) / (1 - FADE_FROM));

    for (let k = 0; k < N; k++) {
      // frames below the current one stay opaque and simply sit behind it
      frames[k].style.opacity =
        k < idx ? 1 : k === idx ? 1 : k === idx + 1 ? over : 0;
    }

    const stage = over > 0.5 ? Math.min(N - 1, idx + 1) : idx;
    steps.forEach((el, i) => el.classList.toggle("is-on", i === stage));
    ticks.forEach((el, i) => {
      el.classList.toggle("is-on", i === stage);
      el.classList.toggle("is-done", i < stage);
    });
  };

  const measure = () => {
    pinned = canPin();
    runway.classList.toggle("is-pinned", pinned);
    if (!pinned) {
      runway.style.height = "";
      last = -1;
      frames.forEach((f, i) => (f.style.opacity = i === N - 1 ? 1 : 0));
      steps.forEach((el) => el.classList.add("is-on"));
      return;
    }
    const w = window.innerWidth;
    const per = w >= 900 ? 0.5 : w >= 600 ? 0.44 : 0.38;
    runway.style.height = Math.round(window.innerHeight * (1 + N * per)) + "px";
    render(true);
  };

  const render = (force) => {
    if (!pinned) return;
    const span = runway.offsetHeight - window.innerHeight;
    const p = span <= 0 ? 0 : cl(-runway.getBoundingClientRect().top / span);
    if (!force && Math.abs(p - last) < 0.0004) return;
    last = p;
    paint(p);
  };

  const onScroll = () => {
    if (!near) return;
    // rAF does not fire in a hidden document; paint straight away there
    if (document.visibilityState === "hidden") return render(false);
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render(false);
      ticking = false;
    });
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) {
          // warm the remaining frames so a dissolve never lands on a blank
          frames.forEach((f) => {
            if (f.loading === "lazy") f.loading = "eager";
          });
          render(true);
        }
      },
      { rootMargin: "150% 0px" },
    ).observe(runway);
  }

  ticks.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!pinned) return;
      const span = runway.offsetHeight - window.innerHeight;
      const mid = (i + 0.4) * SEG;
      window.scrollTo({
        top: runway.offsetTop + span * mid,
        behavior: "smooth",
      });
    });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  document.addEventListener("visibilitychange", () => render(true));
  if (reduce.addEventListener) reduce.addEventListener("change", measure);
  window.addEventListener("load", measure);
  measure();
})();
