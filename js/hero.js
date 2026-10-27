/* ============================================================
   Hero: the open house
   Scroll builds the house: the cutaway reveals floor by floor
   as the runway scrubs, each room's pin arriving with its
   storey; then the handoff scales the finished house toward
   What We Build. Tap any room to glide into a close-up.
   Synchronous scroll math, immune to rAF throttling.
   ============================================================ */
(() => {
  "use strict";
  const hero = document.querySelector(".hero--open");
  if (!hero) return;
  const copy = hero.querySelector(".heroo__copy");
  const stage = hero.querySelector(".heroo__stagewrap");
  const house = hero.querySelector(".heroo__house:not(.heroo__house--closed)");
  const cap = document.getElementById("herooCap");
  const pins = [...hero.querySelectorAll(".heroo__pin")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!copy || !stage || !house) return;

  const vpH = () => document.documentElement.clientHeight;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => v * v * (3 - 2 * v);

  // ---- tap any room ----
  let zoomed = null;
  function setZoom(pin) {
    zoomed = pin;
    stage.classList.toggle("is-zoomed", !!pin);
    pins.forEach((p) => p.classList.toggle("is-active", p === pin));
    if (pin) {
      house.style.transformOrigin =
        pin.dataset.zx + "% " + pin.dataset.zy + "%";
      house.style.transform = "scale(2.1)";
      if (cap) cap.innerHTML = pin.dataset.cap;
    } else {
      house.style.transform = "none";
      if (cap) cap.innerHTML = "";
    }
  }
  pins.forEach((pin) => {
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      setZoom(zoomed === pin ? null : pin);
    });
  });
  stage.addEventListener("click", (e) => {
    if (zoomed && !e.target.closest(".heroo__pin")) setZoom(null);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && zoomed) setZoom(null);
  });

  if (reduce.matches) return; // everything stays visible and still

  // ---- scroll: the house opens, then hands off ----
  const closed = hero.querySelector(".heroo__house--closed");
  function paint() {
    const r = hero.getBoundingClientRect();
    const span = r.height - vpH();
    const p = span > 0 ? clamp01(-r.top / span) : 0;

    // phase one: scrolling dissolves the facade into the open house
    const openAmt = smooth(clamp01(p / 0.5));
    if (closed) {
      closed.style.opacity = (1 - openAmt).toFixed(3);
      closed.style.transform = "scale(" + (1 + 0.07 * openAmt).toFixed(4) + ")";
    }

    // the room pins arrive once the house is open, one after another
    pins.forEach((pin, k) => {
      const vis = zoomed ? pin === zoomed : p >= 0.5 + k * 0.07;
      pin.style.opacity = zoomed ? "" : vis ? 1 : 0;
      pin.style.pointerEvents = vis || zoomed ? "" : "none";
    });

    // phase two: the finished house hands off to the next section
    const hand = smooth(clamp01((p - 0.62) / 0.38));
    if (hand > 0.3 && zoomed) setZoom(null);
    copy.style.opacity = Math.max(0, 1 - hand * 1.9).toFixed(3);
    copy.style.transform = "translateY(" + (-hand * 48).toFixed(1) + "px)";
    stage.style.transform =
      "translateY(" +
      (hand * 10).toFixed(2) +
      "svh) scale(" +
      (1 - 0.2 * hand).toFixed(4) +
      ")";
  }
  addEventListener("scroll", paint, { passive: true });
  addEventListener("resize", paint, { passive: true });
  paint();
})();
