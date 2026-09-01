/* ============================================================
   Scroll-scrubbed hero sequence
   - Deterministic mapping: scroll progress -> frame index
   - Canvas cover-rendering with focal-point protection
   - Prioritised progressive preloading (poster first, then
     coarse-to-fine so early scrubbing never hits a gap)
   - requestAnimationFrame render loop, decoupled from scroll
   - prefers-reduced-motion: static final architectural frame
   ============================================================ */

(() => {
  "use strict";

  // ------------------------------------------------------------------
  // Configuration (kept in one place; frame data injected at build time)
  // ------------------------------------------------------------------
  const CONFIG = {
    frameCount: window.HERO_FRAME_COUNT || 0,   // set by frames-manifest.js
    framePath: (i) =>
      `assets/hero-sequence/frame-${String(i + 1).padStart(4, "0")}.webp`,
    scrollLengthVh: 340,        // virtual scroll runway for the pinned hero
    settleTailPct: 0.06,        // last 6% of scroll holds the final frame
    // Normalised focal point of the house in the source frames.
    // Cover-cropping keeps this point sensibly placed at any aspect.
    focalX: 0.50,
    focalY: 0.42,
    // Frame-scrub smoothing: how quickly the drawn frame chases the
    // scroll-mapped target. High enough to feel direct, low enough to
    // absorb discrete wheel steps. (~0 lag at trackpad speeds)
    smoothing: 14,              // higher = snappier (units: 1/s)
  };

  const hero = document.getElementById("hero");
  const canvas = document.getElementById("heroCanvas");
  const poster = document.getElementById("heroPoster");
  const loader = document.getElementById("heroLoader");
  const loaderBar = document.getElementById("heroLoaderBar");
  if (!hero || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ------------------------------------------------------------------
  // Reduced motion: shortest respectful path — show the finished
  // architectural composition, no scrub, no pin.
  // ------------------------------------------------------------------
  if (reducedMotion.matches) {
    hero.style.height = "100svh";
    if (CONFIG.frameCount > 0) {
      poster.src = CONFIG.framePath(CONFIG.frameCount - 1);
      poster.style.objectPosition = "50% 50%";
    }
    if (loader) loader.remove();
    return;
  }

  hero.style.setProperty("--hero-scroll-length", CONFIG.scrollLengthVh + "vh");
  document.documentElement.style.setProperty(
    "--hero-scroll-length", CONFIG.scrollLengthVh + "vh");

  // ------------------------------------------------------------------
  // Frame store + progressive loader
  // ------------------------------------------------------------------
  const N = CONFIG.frameCount;
  const frames = new Array(N).fill(null);      // ImageBitmap | HTMLImageElement
  const loadState = new Array(N).fill(0);      // 0 idle, 1 loading, 2 ready
  let readyCount = 0;
  let firstFrameReady = false;

  const supportsBitmap = "createImageBitmap" in window;

  function loadFrame(i, priority) {
    if (i < 0 || i >= N || loadState[i] !== 0) return Promise.resolve();
    loadState[i] = 1;
    return fetch(CONFIG.framePath(i), { priority: priority || "auto" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      })
      .then((blob) =>
        supportsBitmap
          ? createImageBitmap(blob)
          : new Promise((res, rej) => {
              const img = new Image();
              img.onload = () => res(img);
              img.onerror = rej;
              img.src = URL.createObjectURL(blob);
            })
      )
      .then((bmp) => {
        frames[i] = bmp;
        loadState[i] = 2;
        readyCount++;
        if (i === 0) firstFrameReady = true;
        onFrameArrived(i);
      })
      .catch(() => { loadState[i] = 0; }); // transient failure -> retryable
  }

  // Coarse-to-fine order: frame 0, last frame, then successive halvings.
  // Any scroll position finds a nearby loaded frame long before the
  // full set arrives.
  function coarseToFineOrder(n) {
    const order = [];
    const seen = new Uint8Array(n);
    const push = (i) => { if (i >= 0 && i < n && !seen[i]) { seen[i] = 1; order.push(i); } };
    push(0); push(n - 1);
    let step = Math.max(1, Math.floor(n / 2));
    while (step >= 1) {
      for (let i = 0; i < n; i += step) push(i);
      if (step === 1) break;
      step = Math.floor(step / 2);
    }
    return order;
  }

  const loadOrder = coarseToFineOrder(N);
  let orderCursor = 0;
  const MAX_INFLIGHT = 6;
  let inflight = 0;

  function pump() {
    while (inflight < MAX_INFLIGHT && orderCursor < loadOrder.length) {
      const i = loadOrder[orderCursor++];
      if (loadState[i] !== 0) continue;
      inflight++;
      loadFrame(i).finally(() => { inflight--; pump(); });
    }
  }

  // Nearest loaded frame at or around the requested index.
  function nearestReady(target) {
    if (loadState[target] === 2) return target;
    for (let d = 1; d < N; d++) {
      if (target - d >= 0 && loadState[target - d] === 2) return target - d;
      if (target + d < N && loadState[target + d] === 2) return target + d;
    }
    return -1;
  }

  // ------------------------------------------------------------------
  // Canvas sizing (devicePixelRatio-aware, memory-capped)
  // ------------------------------------------------------------------
  let cw = 0, ch = 0, dpr = 1;

  function resize() {
    // Cap backing store: sequence frames are 1920px wide, so >2x their
    // density buys nothing and costs memory on Retina displays.
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth;
    ch = canvas.clientHeight;
    const bw = Math.round(cw * dpr);
    const bh = Math.round(ch * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    drawnFrame = -1; // force redraw at new size
  }

  // Cover-draw with focal-point bias.
  function draw(idx) {
    const img = frames[idx];
    if (!img) return;
    const iw = img.width, ih = img.height;
    const scale = Math.max((cw * dpr) / iw, (ch * dpr) / ih);
    const dw = iw * scale, dh = ih * scale;
    const maxX = dw - cw * dpr, maxY = dh - ch * dpr;
    const dx = -Math.min(maxX, Math.max(0, CONFIG.focalX * dw - (cw * dpr) / 2));
    const dy = -Math.min(maxY, Math.max(0, CONFIG.focalY * dh - (ch * dpr) / 2));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ------------------------------------------------------------------
  // Scroll mapping + render loop
  // ------------------------------------------------------------------
  let targetFloat = 0;   // scroll-mapped fractional frame
  let currentFloat = 0;  // smoothed fractional frame actually drawn
  let drawnFrame = -1;
  let lastT = performance.now();
  let canvasLive = false;

  function scrollProgress() {
    const rect = hero.getBoundingClientRect();
    const runway = hero.offsetHeight - window.innerHeight;
    if (runway <= 0) return 1;
    const p = -rect.top / runway;
    return Math.min(1, Math.max(0, p));
  }

  function frameForProgress(p) {
    // Hold the final frame through the settle tail so the pin releases
    // on a stationary image (no snap into the next section).
    const usable = 1 - CONFIG.settleTailPct;
    const q = Math.min(1, p / usable);
    return q * (N - 1);
  }

  function onFrameArrived(i) {
    if (loaderBar) {
      loaderBar.style.width = ((readyCount / N) * 100).toFixed(1) + "%";
    }
    if (readyCount === N) hero.classList.add("hero--loaded");
    // If the frame that just arrived is what the viewer is waiting on,
    // repaint immediately.
    if (Math.abs(i - targetFloat) < 1.5) drawnFrame = -1;
  }

  function stepOnce(dt) {
    const p = scrollProgress();
    hero.style.setProperty("--hero-progress", p.toFixed(4));
    targetFloat = frameForProgress(p);

    // Exponential chase: framerate-independent, sub-frame accurate.
    const k = 1 - Math.exp(-CONFIG.smoothing * dt);
    currentFloat += (targetFloat - currentFloat) * k;
    if (Math.abs(targetFloat - currentFloat) < 0.02) currentFloat = targetFloat;

    const want = Math.round(currentFloat);
    const idx = nearestReady(want);

    if (idx >= 0) {
      if (!canvasLive && firstFrameReady) {
        canvasLive = true;
        hero.classList.add("hero--canvas-live");
      }
      if (idx !== drawnFrame) {
        draw(idx);
        drawnFrame = idx;
      }
    }
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    stepOnce(dt);
    requestAnimationFrame(tick);
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  if (N === 0) {
    // Manifest missing — leave the poster; nothing else to do.
    if (loader) loader.remove();
    return;
  }

  // Debug/QA hook (read-only introspection; no runtime cost).
  Object.defineProperty(window, "__hero", {
    value: {
      get progress() { return scrollProgress(); },
      get target() { return targetFloat; },
      get current() { return currentFloat; },
      get drawn() { return drawnFrame; },
      get ready() { return readyCount; },
      get total() { return N; },
      step(dt) { stepOnce(dt || 1 / 60); },
    },
  });

  window.addEventListener("resize", resize, { passive: true });
  resize();
  pump();
  requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(tick); });
})();
