/* ============================================================
   PSI Construction — the build
   55 Reynolds Street assembles as the section scrolls. Every
   animated value is a pure function of scroll progress, so the
   build scrubs backwards exactly as it ran forwards and nothing
   keeps moving once the reader stops.

   Cheap by construction: transforms, opacity and dash offsets
   only, one rAF that runs solely while the section is on screen.
   ============================================================ */
(() => {
  "use strict";

  const runway = document.getElementById("psRunway");
  const stage = runway && runway.querySelector(".ps-stage");
  if (!runway || !stage) return;

  const scene = runway.querySelector(".ps-scene");
  const steps = [...runway.querySelectorAll(".ps-step")];
  const ticks = [...runway.querySelectorAll(".ps-tick-btn")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // stage boundaries in progress space
  const S = [0, 0.14, 0.28, 0.43, 0.6, 0.75, 0.88, 1.0001];

  /* ---------- maths ---------- */
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const at = (p, a, b) => cl((p - a) / (b - a));
  const out = (t) => 1 - Math.pow(1 - t, 3);
  /** piecewise keyframes: kf(t, [[pos, value], ...]) */
  const kf = (t, pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [t0, v0] = pts[i],
        [t1, v1] = pts[i + 1];
      if (t <= t1) {
        const u = t1 === t0 ? 1 : cl((t - t0) / (t1 - t0));
        return v0 + (v1 - v0) * out(u);
      }
    }
    return pts[pts.length - 1][1];
  };

  const back = (t) => {
    const c = 1.9;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  };

  /* ---------- element cache ---------- */
  const q = (sel) => [...scene.querySelectorAll(sel)];
  const one = (sel) => scene.querySelector(sel);

  // windows get a warm pane laid over the cold one, lit at handover
  q(".op").forEach((g) => {
    const glass = g.querySelector(".glass");
    if (!glass) return;
    const lit = glass.cloneNode(false);
    lit.setAttribute("class", "lit");
    lit.setAttribute("fill", "url(#psLit)");
    lit.style.opacity = "0";
    glass.after(lit);
  });

  // dash-drawn paths: measure once, drive the offset later
  const dashed = q(
    ".ps-foot, .ps-elev, .ps-string, .ps-track, .sys-pipe, .sys-wire",
  ).map((el) => {
    const len = el.getTotalLength ? el.getTotalLength() : 0;
    el.style.strokeDasharray = el.classList.contains("ps-elev")
      ? `${len} ${len}` // overrides the CSS dash pattern while drawing
      : `${len} ${len}`;
    return { el, len };
  });

  const tracks = [];
  /** t: 0..1 across [a,b]; fn writes the element's state */
  const add = (els, a, b, fn, spread = 0, gate = false) => {
    const list = typeof els === "string" ? q(els) : els ? [els] : [];
    if (!list.length) return;
    // gate: a later track that retires an element must stay out of the way
    // until its range opens, or its "1 - t" reads as fully visible at p = 0
    tracks.push({ list, a, b, fn, spread, gate });
  };

  const fade = (el, t) => (el.style.opacity = t);
  const rise = (dy) => (el, t) => {
    const e = out(t);
    el.style.opacity = t;
    el.style.transform = `translateY(${(1 - e) * dy}px)`;
  };
  const grow = (el, t) => {
    el.style.opacity = t > 0 ? 1 : 0;
    el.style.transform = `scaleY(${out(t)})`;
  };
  const drop = (dy) => (el, t) => {
    el.style.opacity = t > 0.02 ? 1 : 0;
    el.style.transform = `translateY(${(1 - back(t)) * dy}px)`;
  };
  const pop = (el, t) => {
    el.style.opacity = t > 0.02 ? 1 : 0;
    el.style.transform = `scale(${Math.max(0, back(t))})`;
  };

  /* ---------- 01 plan ---------- */
  add(".ps-ao", 0.0, 0.06, fade);
  add(".ps-foot", 0.01, 0.07, null);
  add(".stake", 0.03, 0.1, pop, 0.6);
  add(".ps-string", 0.07, 0.12, null);
  add(".ps-elev", 0.05, 0.14, null);
  add(".ps-dim", 0.1, 0.15, fade);

  /* ---------- 02 site preparation ---------- */
  add(".ps-track", 0.15, 0.21, null);

  // the machine tracks in, digs three passes, then tracks out again
  add(".ps-exc", 0.14, 0.33, (el, t) => {
    const x = kf(t, [
      [0, 210],
      [0.16, 0],
      [0.82, 0],
      [1, 250],
    ]);
    // fade as it tracks out so it never lingers past the scene edge
    const away = t < 0.84 ? 1 : cl(1 - (t - 0.84) / 0.13);
    el.style.opacity = t > 0.01 ? away : 0;
    el.style.transform = `translateX(${x}px)`;
  });

  // one dig cycle per pass: reach out, curl, lift, dump
  const cycle = (v) => [
    [0, v.rest],
    [0.2, v.reach],
    [0.34, v.dig],
    [0.5, v.lift],
    [0.58, v.rest],
    [0.72, v.reach],
    [0.82, v.dig],
    [0.92, v.lift],
    [1, v.rest],
  ];
  add(".exc-boom", 0.17, 0.3, (el, t) => {
    el.style.transform = `rotate(${kf(t, cycle({ rest: -10, reach: 9, dig: 12, lift: -15 }))}deg)`;
  });
  add(".exc-stick", 0.17, 0.3, (el, t) => {
    el.style.transform = `rotate(${kf(t, cycle({ rest: 0, reach: 26, dig: 6, lift: -22 }))}deg)`;
  });
  add(".exc-bucket", 0.17, 0.3, (el, t) => {
    el.style.transform = `rotate(${kf(t, cycle({ rest: 0, reach: 22, dig: -38, lift: -30 }))}deg)`;
  });

  // the hole deepens with each scoop rather than sliding open
  add(".ps-pit", 0.17, 0.3, (el, t) => {
    el.style.opacity = 1;
    el.style.transform = `scaleY(${kf(t, [
      [0, 0],
      [0.34, 0.34],
      [0.5, 0.4],
      [0.82, 0.82],
      [0.95, 1],
      [1, 1],
    ])})`;
  });
  // and the spoil grows on the swing away from the cut
  add(".ps-spoil", 0.17, 0.31, (el, t) => {
    const g = kf(t, [
      [0, 0],
      [0.5, 0.45],
      [0.62, 0.5],
      [0.92, 1],
      [1, 1],
    ]);
    el.style.opacity = g > 0 ? 1 : 0;
    el.style.transform = `scaleY(${g})`;
  });
  // the drawing has served its purpose once the ground is open
  add(".ps-elev", 0.22, 0.3, (el, t) => (el.style.opacity = 1 - t), 0, true);
  add(".stake", 0.24, 0.31, (el, t) => (el.style.opacity = 1 - t), 0.4, true);
  add(".ps-string", 0.22, 0.28, (el, t) => (el.style.opacity = 1 - t), 0, true);
  add(".ps-dim", 0.26, 0.33, (el, t) => (el.style.opacity = 1 - t), 0, true);

  /* ---------- 03 foundation ---------- */
  add(".fdn__ftg", 0.29, 0.34, grow);
  add(".fdn__p", 0.33, 0.43, grow, 0.7); // walls go up off the footing
  add(".fdn__slab", 0.4, 0.44, fade);
  add(".ps-backfill", 0.41, 0.47, fade); // earth goes back around the walls
  add(".ps-spoil", 0.41, 0.47, (el, t) => (el.style.opacity = 1 - t), 0, true);
  add(
    ".ps-track",
    0.4,
    0.46,
    (el, t) => (el.style.opacity = 1 - t * 0.8),
    0,
    true,
  );

  /* ---------- 04 framing ---------- */
  add(".fl1", 0.44, 0.47, rise(14));
  add(".s1 .stud", 0.46, 0.5, grow, 0.8);
  add(".fl2", 0.5, 0.525, rise(14));
  add(".s2 .stud", 0.515, 0.555, grow, 0.8);
  add(".fl3", 0.552, 0.575, rise(14));
  add(".s3 .stud", 0.565, 0.6, grow, 0.8);
  add(".sw .stud", 0.5, 0.56, grow, 0.7);
  add(".ps-beam:not(.wing)", 0.59, 0.625, drop(52)); // ridge beam lands
  add(".ps-beam.wing", 0.6, 0.635, drop(34));

  /* ---------- 05 systems, then the shell closes ---------- */
  add(".sys-pipe", 0.6, 0.66, null);
  add(".sys-wire", 0.62, 0.68, null);
  add(".sys-duct", 0.645, 0.68, rise(10));
  add(".sys-node", 0.66, 0.69, pop);
  add(".ps-batt", 0.66, 0.72, fade);
  add(".ps-cap:not(.wing)", 0.68, 0.72, drop(34)); // roof settles into place
  add(".ps-cap.wing", 0.7, 0.735, drop(30));
  add(".ps-stamp", 0.71, 0.75, pop); // rough-in signed off
  add(".ps-holes", 0.66, 0.7, fade);

  /* ---------- 06 skin, then openings ---------- */
  add(".ps-wall:not(.wing)", 0.7, 0.79, (el, t) => {
    el.style.opacity = 1;
    el.style.transform = `scaleY(${out(t)})`;
    el.style.transformOrigin = "50% 100%";
  });
  add(".ps-wall.wing", 0.74, 0.82, (el, t) => {
    el.style.opacity = 1;
    el.style.transform = `scaleY(${out(t)})`;
    el.style.transformOrigin = "50% 100%";
  });
  add(".ps-reveal", 0.79, 0.83, fade);
  add(".ps-holes", 0.78, 0.83, (el, t) => (el.style.opacity = 1 - t), 0, true);
  add(".op", 0.78, 0.9, pop, 0.72); // windows click into their openings

  /* ---------- 07 handover ---------- */
  add(".ps-walk", 0.88, 0.92, fade);
  add(".shrub", 0.89, 0.96, pop, 0.6);
  add(".ps-tree", 0.9, 0.97, pop);
  add(".lit", 0.93, 1.0, (el, t) => (el.style.opacity = t * 0.9));
  add(".ps-lamp", 0.94, 1.0, fade);

  /* ---------- paint ---------- */
  const paint = (p) => {
    for (const tr of tracks) {
      if (tr.gate && p < tr.a) continue;
      const n = tr.list.length;
      for (let i = 0; i < n; i++) {
        const el = tr.list[i];
        let a = tr.a,
          b = tr.b;
        if (tr.spread && n > 1) {
          const span = (b - a) * (1 - tr.spread);
          const off = ((b - a) * tr.spread * i) / (n - 1);
          a = tr.a + off;
          b = a + span;
        }
        const t = at(p, a, b);
        if (tr.fn) tr.fn(el, t);
        else {
          // dash-drawn stroke
          const d = dashed.find((x) => x.el === el);
          if (d) {
            el.style.opacity = 1;
            el.style.strokeDashoffset = d.len * (1 - out(t));
          }
        }
      }
    }

    let stage7 = 0;
    for (let i = 0; i < 7; i++) if (p >= S[i]) stage7 = i;
    steps.forEach((el, i) => el.classList.toggle("is-on", i === stage7));
    ticks.forEach((el, i) => {
      el.classList.toggle("is-on", i === stage7);
      el.classList.toggle("is-done", i < stage7);
    });
  };

  /* ---------- scroll wiring ---------- */
  let pinned = false,
    ticking = false,
    last = -1,
    visible = true;

  // Phones get the build too: the scene is the hero there. Only a very
  // short viewport, or a reader who asked for less motion, opts out.
  const canPin = () => !reduce.matches && window.innerHeight >= 560;

  const measure = () => {
    pinned = canPin();
    runway.classList.toggle("is-pinned", pinned);
    if (!pinned) {
      runway.style.height = "";
      last = -1;
      paint(1); // the finished house, with every stage listed beneath it
      steps.forEach((el) => el.classList.add("is-on"));
      return;
    }
    const w = window.innerWidth;
    const per = w >= 900 ? 0.48 : w >= 600 ? 0.42 : 0.36; // less scroll on a phone
    runway.style.height = Math.round(window.innerHeight * (1 + 7 * per)) + "px";
    render(true);
  };

  const render = (force) => {
    if (!pinned) return;
    const span = runway.offsetHeight - window.innerHeight;
    const p = span <= 0 ? 0 : cl(-runway.getBoundingClientRect().top / span);
    if (!force && Math.abs(p - last) < 0.0002) return; // idle: draw nothing
    last = p;
    paint(p);
  };

  const onScroll = () => {
    if (!visible) return;
    // rAF never fires in a hidden document, which would freeze the build
    // mid-assembly; paint straight away there and let rAF pace the rest.
    if (document.visibilityState === "hidden") {
      render(false);
      return;
    }
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render(false);
      ticking = false;
    });
  };

  // only listen while the section is anywhere near the viewport
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) render(true);
      },
      { rootMargin: "120% 0px" },
    ).observe(runway);
  }

  ticks.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!pinned) return;
      const mid = (S[i] + S[i + 1]) / 2;
      const span = runway.offsetHeight - window.innerHeight;
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
  window.addEventListener("load", () => measure());
  measure();
})();
