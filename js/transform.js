/* ============================================================
   Before & After — real PSI jobs, drag (or arrow-key) to reveal.
   Each tab is a documented job; "See all photos" hands off to the
   existing job viewer through main.js's [data-project][data-open]
   click delegate, so there is one viewer on the page, not two.
   ============================================================ */
(() => {
  "use strict";
  const root = document.getElementById("transformations");
  if (!root) return;

  const JOBS = [
    { key: "bath-marble", project: 16, tab: "Bathroom", title: "Yellow tile to marble", place: "Kingston, PA",
      before: "Original 1960s yellow tile and a cast tub, cracked and leaking at the walls",
      after: "Floor-to-ceiling marble-look porcelain, glass shower and a new comfort-height toilet",
      span: "Bathroom renovation" },
    { key: "walk-in-shower", project: 1, tab: "Shower", title: "Cramped stall to walk-in", place: "Kingston, PA",
      before: "A shoulder-wide stall with three exposed valves",
      after: "Nearly double the footprint: rain head, cove lighting, built-in bench and a lit niche",
      span: "Took in the closet next door" },
    { key: "porch-bath", project: 7, tab: "Porch to bath", title: "Porch to master bathroom", place: "Kingston, PA",
      before: "An unheated, enclosed side porch",
      after: "A full master bathroom: insulated, tiled, plumbed and lit",
      span: "New room inside the footprint" },
    { key: "basement", project: 3, tab: "Basement", title: "Bare basement to finished level", place: "Kingston, PA",
      before: "Open joists, bare block walls and a dirt-stained slab",
      after: "A finished lower level with a full bathroom and walk-in shower",
      span: "Framed, insulated, finished" },
    { key: "commercial-bath", project: 27, tab: "Commercial", title: "Commercial bath, gutted", place: "Kingston, PA",
      before: "Demolition: fixtures out, walls opened to the studs",
      after: "Floating vanity, backlit mirror and a tiled tub surround",
      span: "Two bathrooms, one job" },
    { key: "garage-apartment", project: 15, tab: "Garage", title: "Garage to two apartments", place: "Kingston, PA",
      before: "A storage garage with a broken slab and open ceiling",
      after: "One of two new rental units: kitchen, laundry and plank floors",
      span: "Change of use, permitted" },
  ];

  const frame = root.querySelector(".ba");
  const imgB = root.querySelector(".ba__before");
  const imgA = root.querySelector(".ba__after");
  const range = root.querySelector(".ba__range");
  const tabs = root.querySelector(".tf__tabs");
  const title = root.querySelector(".tf__title");
  const place = root.querySelector(".tf__place");
  const capB = root.querySelector(".tf__cap--before");
  const capA = root.querySelector(".tf__cap--after");
  const span = root.querySelector(".tf__span");
  const open = root.querySelector(".tf__open");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const projects = window.PSI_PROJECTS || [];

  JOBS.forEach((j, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tf__tab";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.tabIndex = i === 0 ? 0 : -1;
    b.dataset.i = i;
    b.textContent = j.tab;
    tabs.appendChild(b);
  });

  const setX = (v) => {
    v = Math.max(0, Math.min(100, v));
    frame.style.setProperty("--x", v + "%");
    range.value = v;
  };
  range.addEventListener("input", () => setX(+range.value));

  // dragging anywhere on the photo, not only the handle
  let dragging = false;
  const fromEvent = (e) => {
    const r = frame.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  };
  frame.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    frame.classList.add("is-dragging");
    setX(fromEvent(e));
  });
  window.addEventListener("pointermove", (e) => dragging && setX(fromEvent(e)));
  window.addEventListener("pointerup", () => {
    dragging = false;
    frame.classList.remove("is-dragging");
  });

  let cur = -1;
  function show(i, animate) {
    if (i === cur) return;
    cur = i;
    const j = JOBS[i];
    [...tabs.children].forEach((t, k) => {
      t.setAttribute("aria-selected", k === i ? "true" : "false");
      t.tabIndex = k === i ? 0 : -1;
    });
    frame.classList.add("is-swapping");
    const go = () => {
      imgB.src = `assets/transform/${j.key}-before.jpg`;
      imgA.src = `assets/transform/${j.key}-after.jpg`;
      imgB.alt = "Before: " + j.before;
      imgA.alt = "After: " + j.after;
      title.textContent = j.title;
      place.textContent = j.place;
      capB.textContent = j.before;
      capA.textContent = j.after;
      span.textContent = j.span;
      const p = projects[j.project];
      const n = p && p.gallery ? p.gallery.length : 0;
      open.dataset.project = j.project;
      open.dataset.open = j.project;
      open.textContent = n ? `See all ${n} photos from this job →` : "See this job →";
      setX(50);
      requestAnimationFrame(() => frame.classList.remove("is-swapping"));
      if (animate && !reduce) sweep();
    };
    if (animate && !reduce) setTimeout(go, 180);
    else go();
  }

  // a single reveal sweep shows the visitor the photo is live
  function sweep() {
    const t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / 1400);
      // swing toward "after", back past "before", settle in the middle
      setX(50 - Math.sin(k * Math.PI * 2) * 36 * (1 - k * 0.5));
      if (k < 1 && !dragging) requestAnimationFrame(step);
      else if (!dragging) setX(50);
    })(t0);
  }

  tabs.addEventListener("click", (e) => {
    const b = e.target.closest(".tf__tab");
    if (b) show(+b.dataset.i, true);
  });
  tabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (cur + (e.key === "ArrowRight" ? 1 : JOBS.length - 1)) % JOBS.length;
    show(n, true);
    tabs.children[n].focus();
  });

  show(0, false);
  // first time the section is seen, sweep once
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => {
        if (en.isIntersecting) { io.disconnect(); sweep(); }
      }),
      { threshold: 0.55 },
    );
    io.observe(frame);
  }
  // preload the rest once idle so tab switches are instant
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
  idle(() => JOBS.slice(1).forEach((j) => {
    new Image().src = `assets/transform/${j.key}-before.jpg`;
    new Image().src = `assets/transform/${j.key}-after.jpg`;
  }));
})();
