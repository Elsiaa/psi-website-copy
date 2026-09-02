/* ============================================================
   PSI Construction — process row
   The section pins while vertical scroll is translated into
   horizontal travel across the ten stages. Runway height is
   derived from the real track width so the last card lands
   exactly as the section releases.

   Fails open: without JS, on a narrow or short viewport, or
   under reduced motion, the runway loses .is-pinned and the row
   becomes an ordinary horizontal swipe.
   ============================================================ */
(() => {
  "use strict";

  const runway = document.getElementById("processRunway");
  const track = document.getElementById("processTrack");
  const fill = document.getElementById("processFill");
  const count = document.getElementById("processCount");
  if (!runway || !track) return;

  const steps = Array.from(track.children);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let travel = 0; // horizontal distance the track must cover
  let pinned = false;
  let ticking = false;

  const canPin = () =>
    !reduced.matches && window.innerWidth >= 860 && window.innerHeight >= 560;

  const measure = () => {
    pinned = canPin();
    runway.classList.toggle("is-pinned", pinned);

    if (!pinned) {
      runway.style.height = "";
      track.style.transform = "";
      watchSwipe();
      return;
    }

    const viewport = track.parentElement.clientWidth;
    travel = Math.max(0, track.scrollWidth - viewport);

    // One viewport of scroll to read the row, plus the distance it
    // travels — so the pace stays the same whatever the card count.
    runway.style.height = window.innerHeight + travel + "px";
    render();
  };

  const render = () => {
    if (!pinned) return;

    const box = runway.getBoundingClientRect();
    const distance = runway.offsetHeight - window.innerHeight;
    const progress =
      distance <= 0 ? 0 : Math.min(1, Math.max(0, -box.top / distance));

    track.style.transform = "translate3d(" + -travel * progress + "px,0,0)";
    if (fill) fill.style.width = progress * 100 + "%";

    // Mark whichever cards are sitting in the middle of the stage.
    const mid = window.innerWidth / 2;
    let active = 0;
    steps.forEach((step, i) => {
      const r = step.getBoundingClientRect();
      const on =
        r.left < mid + r.width * 0.75 && r.right > mid - r.width * 0.75;
      step.classList.toggle("is-active", on);
      if (r.left <= mid && r.right >= mid) active = i;
    });
    if (count) count.textContent = String(active + 1).padStart(2, "0");
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  };

  // Fallback swipe mode: cards animate only while on screen.
  let swipeIO = null;
  const watchSwipe = () => {
    if (swipeIO || !("IntersectionObserver" in window)) {
      if (!swipeIO) steps.forEach((s) => s.classList.add("is-active"));
      return;
    }
    swipeIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          e.target.classList.toggle("is-active", e.isIntersecting),
        ),
      { root: track.parentElement, rootMargin: "25%" },
    );
    steps.forEach((s) => swipeIO.observe(s));
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  if (reduced.addEventListener) reduced.addEventListener("change", measure);
  window.addEventListener("load", measure);
  measure();
})();
