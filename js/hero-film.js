/* ============================================================
   Scroll-driven hero film
   One H.264 file (keyframe every 8 frames, so any seek is cheap)
   replaces the 193-frame WebP sequence: ~25MB of stills and up to
   1.6GB of decoded bitmaps become one ~8MB file and one decoder.
   - scroll progress -> video.currentTime, eased
   - chapters fade in and out at fixed points of the film
   - three encodes: 1080p landscape, 720p landscape (small screens
     and the framed preview on elsiaa.com), 3:4 portrait for phones
   - prefers-reduced-motion: the finished frame, no pin, no fetch
   ============================================================ */
(() => {
  "use strict";
  const hero = document.getElementById("hero");
  if (!hero) return;
  const video = document.getElementById("heroVideo");
  const poster = document.getElementById("heroPoster");
  const loader = document.getElementById("heroLoader");
  const loaderBar = document.getElementById("heroLoaderBar");
  const chapters = [...hero.querySelectorAll("[data-from]")];
  const mq = (q) => window.matchMedia(q).matches;

  const portrait = mq("(max-width: 760px) and (orientation: portrait)");
  let framed = false;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }
  const small = portrait || mq("(max-width: 1100px)") || (framed && mq("(pointer: coarse)"));
  const src = portrait
    ? "assets/hero/walkthrough-portrait.mp4"
    : small
      ? "assets/hero/walkthrough-720.mp4"
      : "assets/hero/walkthrough.mp4";
  const runwayVh = portrait ? 520 : small ? 560 : 640;
  if (portrait) hero.classList.add("hero--phone");

  const still = () => {
    hero.classList.add("hero--still", "hero--film-still");
    hero.style.height = "100svh";
    chapters.forEach((c, i) => {
      c.style.opacity = i === chapters.length - 1 ? 1 : 0;
    });
    if (loader) loader.remove();
  };

  if (mq("(prefers-reduced-motion: reduce)") || !video) {
    if (poster) poster.src = portrait ? "assets/hero/end-portrait.jpg" : "assets/hero/end.jpg";
    still();
    return;
  }

  hero.style.setProperty("--hero-scroll-length", runwayVh + "vh");
  document.documentElement.style.setProperty("--hero-scroll-length", runwayVh + "vh");
  if (poster && portrait) poster.src = "assets/hero/start-portrait.jpg";

  let dur = 0, cur = 0, ready = false;
  const setLoad = (f) => { if (loaderBar) loaderBar.style.width = Math.max(4, f * 100).toFixed(1) + "%"; };

  const attach = (url) => {
    video.src = url;
    const mark = () => {
      if (ready || video.readyState < 2) return;
      ready = true;
      hero.classList.add("hero--canvas-live", "hero--loaded");
    };
    video.addEventListener("loadedmetadata", () => {
      dur = video.duration;
      try { video.currentTime = cur || 0.001; } catch (e) {}
    }, { once: true });
    video.addEventListener("loadeddata", mark);
    video.addEventListener("seeked", mark);
    video.addEventListener("error", still, { once: true });
    video.load();
    video.pause();
  };

  // Stream so the loader shows real progress, then hand the whole file to
  // the element as a blob: seeking a local blob never waits on the network.
  fetch(src)
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      const total = +r.headers.get("content-length") || 0;
      if (!r.body || !total) return r.blob();
      const reader = r.body.getReader();
      const parts = [];
      let got = 0;
      const pump = () => reader.read().then(({ done, value }) => {
        if (done) return new Blob(parts, { type: "video/mp4" });
        parts.push(value); got += value.length; setLoad(got / total);
        return pump();
      });
      return pump();
    })
    .then((b) => attach(URL.createObjectURL(b)))
    .catch(() => attach(src));

  const progress = () => {
    const r = hero.getBoundingClientRect();
    const run = hero.offsetHeight - window.innerHeight;
    return run <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / run));
  };

  let last = -1, lastT = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    const p = progress();
    const r = hero.getBoundingClientRect();
    const onscreen = r.bottom > -200 && r.top < window.innerHeight + 200;
    if (onscreen && dur) {
      const target = Math.min(1, p / 0.96) * (dur - 0.05); // last 4% holds the final frame
      cur += (target - cur) * (1 - Math.exp(-12 * dt));
      if (Math.abs(target - cur) < 0.004) cur = target;
      if (Math.abs(video.currentTime - cur) > 0.012 && !video.seeking) {
        try { video.currentTime = cur; } catch (e) {}
      }
    }
    if (p !== last) {
      last = p;
      hero.style.setProperty("--hero-progress", p.toFixed(4));
      for (const c of chapters) {
        const a = +c.dataset.from, b = +c.dataset.to, f = 0.05;
        let o = p < a - f || p > b + f ? 0 : p < a ? (p - (a - f)) / f : p > b ? 1 - (p - b) / f : 1;
        if (b >= 1 && p > a) o = 1;
        c.style.opacity = o.toFixed(3);
        c.style.transform = `translate3d(0,${((1 - o) * 26 * (p < a ? 1 : -1)).toFixed(1)}px,0)`;
        c.inert = o < 0.1;
        c.setAttribute("aria-hidden", o < 0.1 ? "true" : "false");
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  Object.defineProperty(window, "__hero", {
    value: { get progress() { return progress(); }, get time() { return video.currentTime; }, get duration() { return dur; }, get ready() { return ready; } },
  });
})();
