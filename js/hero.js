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
  const house = hero.querySelector(
    ".heroo__house:not(.heroo__house--closed):not(.heroo__house--exploded)",
  );
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
  hero.classList.add("heroo-js"); // the caps prelude only arms with the engine

  // ---- scroll: close, open, disassemble, reassemble, hand off ----
  const closed = hero.querySelector(".heroo__house--closed");
  const exploded = hero.querySelector(".heroo__house--exploded");
  const seg = (p, a, b) => smooth(clamp01((p - a) / (b - a)));
  function paint() {
    const r = hero.getBoundingClientRect();
    const span = r.height - vpH();
    const p = span > 0 ? clamp01(-r.top / span) : 0;

    // 1) the facade dissolves: the house opens
    const open = seg(p, 0, 0.26);
    if (closed) {
      closed.style.opacity = (1 - open).toFixed(3);
      closed.style.transform = "scale(" + (1 + 0.06 * open).toFixed(4) + ")";
    }

    // 2) the room pins arrive one by one
    pins.forEach((pin, k) => {
      const vis = zoomed ? pin === zoomed : p >= 0.26 + k * 0.035 && p < 0.44;
      pin.style.opacity = zoomed ? "" : vis ? 1 : 0;
      pin.style.pointerEvents = vis || zoomed ? "" : "none";
    });

    // 3) the house disassembles into floating floors, holds, and
    //    4) reassembles on the way out
    const apart = seg(p, 0.46, 0.64) * (1 - seg(p, 0.78, 0.92));
    if (exploded && !zoomed) {
      exploded.style.opacity = apart.toFixed(3);
      exploded.style.transform =
        "scale(" + (0.965 + 0.035 * apart).toFixed(4) + ")";
      house.style.opacity = (1 - apart * 0.96).toFixed(3);
    } else if (exploded) {
      exploded.style.opacity = 0;
      house.style.opacity = 1;
    }

    // 5) the finale: title and model leave together, and the next
    //    section is cued to rise and meet them
    const hand = seg(p, 0.88, 1);
    if (hand > 0.1 && zoomed) setZoom(null);
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
