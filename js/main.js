/* ============================================================
   PSI Construction — homepage behaviour
   - Nav: transparent over hero, solid after
   - Previous Projects: Leaflet map + list + carousel, synchronized
   - Google Reviews carousel
   ============================================================ */
(() => {
  "use strict";

  // ---------------- Nav ----------------
  const nav = document.getElementById("topNav");
  // Point in the hero scrub where the sequence has swung round from the aerial
  // to the front elevation. Past it the image behind the logo is light, so the
  // white mark stops reading and the full-colour one takes over — well before
  // the hero itself ends.
  const LOGO_SWITCH_AT = 0.5;
  const heroProgress = (heroEl) => {
    const runway = heroEl.offsetHeight - window.innerHeight;
    if (runway <= 0) return 1;
    return Math.min(
      1,
      Math.max(0, -heroEl.getBoundingClientRect().top / runway),
    );
  };
  const onScroll = () => {
    const heroEl = document.getElementById("hero");
    const threshold = heroEl
      ? heroEl.offsetHeight - window.innerHeight * 0.5
      : 40;
    nav.classList.toggle("nav--solid", window.scrollY > threshold);
    // No hero (inner pages): the bar is solid from the start, so the
    // full-colour mark is always the right one.
    nav.classList.toggle(
      "nav--darklogo",
      heroEl ? heroProgress(heroEl) >= LOGO_SWITCH_AT : true,
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------- Previous Projects ----------------
  const projects = window.PSI_PROJECTS || [];
  const office = window.PSI_OFFICE;
  const mapEl = document.getElementById("projectMap");
  if (!mapEl || !projects.length || typeof L === "undefined") return;

  const map = L.map(mapEl, { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // A project is a "case study" once it has a photo gallery attached.
  // Those pins are styled differently and open a detail view.
  const hasCase = (p) => Array.isArray(p.gallery) && p.gallery.length > 0;

  const pinIcon = (active, isCase) =>
    L.divIcon({
      className: "",
      html: `<div class="pin${active ? " pin--active" : ""}${isCase ? " pin--case" : ""}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 16],
    });

  // Office marker (distinct, not part of the sync set)
  if (office) {
    L.marker([office.lat, office.lng], {
      icon: L.divIcon({
        className: "",
        html: '<div class="pin pin--office"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    })
      .addTo(map)
      .bindPopup(
        `<strong>${office.name}</strong><br>${office.address}<br><em>Visits available upon request</em>`,
      );
  }

  const markers = projects.map((p, i) => {
    const m = L.marker([p.lat, p.lng], {
      icon: pinIcon(false, hasCase(p)),
    }).addTo(map);
    m.bindPopup(
      hasCase(p)
        ? `<strong>${p.name}</strong><br>` +
            (p.type
              ? `<em style="color:#d60000;font-style:normal;font-weight:600">${p.type}</em><br>`
              : "") +
            `${p.city}` +
            (p.desc
              ? `<span style="display:block;margin-top:6px;max-width:240px">${p.desc}</span>`
              : "") +
            `<button class="case__open" data-project="${i}" data-open="${i}">See these photos &rarr;</button>`
        : `<strong>${p.name}</strong><br>${p.city}`,
    );
    m.on("click", () => select(i, "map"));
    return m;
  });

  // Popups are re-created by Leaflet, so delegate instead of binding per popup.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-project]");
    if (!btn || !btn.dataset.open) return;
    openViewer(+btn.dataset.open, 0);
  });
  const allBounds = L.latLngBounds(projects.map((p) => [p.lat, p.lng])).pad(
    0.08,
  );
  map.fitBounds(allBounds);

  // If the map booted inside a hidden/zero-size container (collapsed panel,
  // background tab), Leaflet's sizing is wrong — refit once real layout lands.
  let fitted = mapEl.clientWidth > 0 && mapEl.clientHeight > 0;
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      if (!fitted && mapEl.clientWidth > 0 && mapEl.clientHeight > 0) {
        fitted = true;
        map.fitBounds(allBounds);
      }
    });
    ro.observe(mapEl);
  }

  const wall = document.getElementById("shotWall");
  const hint = document.getElementById("shotHint");

  // One entry per PHOTOGRAPH. A project with a gallery contributes all of its
  // shots; anything else contributes its single image.
  const shots = [];
  projects.forEach((p, i) => {
    if (Array.isArray(p.gallery) && p.gallery.length) {
      p.gallery.forEach((g, n) =>
        shots.push({ i, p, n, src: g.src, cap: g.cap, phase: g.phase }),
      );
    } else if (p.img) {
      shots.push({ i, p, n: 0, src: p.img, cap: p.caption, phase: null });
    }
  });

  const shuffled = (arr) => {
    const a2 = arr.slice();
    for (let k = a2.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [a2[k], a2[j]] = [a2[j], a2[k]];
    }
    return a2;
  };

  // ---- one photograph at a time, beside the map ----
  // Each slide fills the panel and is cropped to fill it (cover), so a
  // landscape shot loses a little from each side rather than shrinking.
  function renderShots() {
    wall.innerHTML = "";
    shuffled(shots.map((_, k) => k)).forEach((k) => {
      const sh = shots[k];
      const b2 = document.createElement("button");
      b2.type = "button";
      b2.className = "shot";
      b2.dataset.shot = k;
      b2.innerHTML = `
        <img loading="lazy" src="${sh.src}" alt="${sh.cap || sh.p.type || "PSI project"}">
        ${sh.phase ? `<span class="shot__phase shot__phase--${sh.phase}">${sh.phase}</span>` : ""}
        <span class="shot__cap">
          <strong>${sh.p.type || sh.p.city}</strong>
          ${sh.cap ? `<span>${sh.cap}</span>` : ""}
        </span>`;
      wall.appendChild(b2);
    });
  }

  wall.addEventListener("click", (e) => {
    const item = e.target.closest(".shot");
    if (!item) return;
    const sh = shots[+item.dataset.shot];
    select(sh.i, "shots");
    openViewer(sh.i, sh.n);
  });

  // Whichever photograph is on screen, its job's pin grows and lights up on
  // the map — so it is obvious where the shot was taken, and clicking that
  // pin opens the whole job.
  let syncFrame = 0;
  let firstSync = true;
  function syncPinToShot() {
    const el = wall.children[sPos];
    if (!el) return;
    const sh = shots[+el.dataset.shot];
    if (sh && sh.i !== current) select(sh.i, "scroll");
  }
  wall.addEventListener(
    "scroll",
    () => {
      if (syncFrame) return;
      syncFrame = requestAnimationFrame(() => {
        syncFrame = 0;
        syncPinToShot();
      });
    },
    { passive: true },
  );

  // Position is held explicitly and the browser does the alignment.
  // Computing `index * clientWidth` drifted: clientWidth is a rounded
  // integer while the real slide width is fractional, so the error
  // compounded and clipped the caption on one side and leaked the next
  // photograph in on the other.
  let sPos = 0;
  const slideCount = () => wall.children.length;
  // Slide width is fractional (e.g. 435.8px) while offsetLeft and clientWidth
  // both report rounded integers, so any index-times-width or scrollIntoView
  // approach accumulates error and clips the caption. Measure the real width
  // and scroll to the exact fractional offset.
  const slideWidth = () =>
    wall.firstElementChild
      ? wall.firstElementChild.getBoundingClientRect().width
      : wall.getBoundingClientRect().width;
  function goTo(idx) {
    const n = slideCount();
    if (!n) return;
    sPos = ((idx % n) + n) % n; // wrap both ways
    wall.scrollTo({ left: sPos * slideWidth(), behavior: "smooth" });
  }
  const stepShots = (dir) => goTo(sPos + dir);

  // Advances on its own; a click restarts the clock so it does not jump
  // straight after you have chosen a photograph yourself.
  let timer = null;
  const HOLD = 5000;
  function play() {
    stop();
    timer = setInterval(() => stepShots(1), HOLD);
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function nudge(dir) {
    stepShots(dir);
    play();
  }

  // Panning or zooming the map by hand means the visitor is hunting for
  // something specific, and having the map fly off to the next photograph
  // every few seconds makes that job impossible. The photographs keep
  // advancing and the pin still lights up so they can follow along — the map
  // just stops moving itself. Ten quiet seconds and it resumes following.
  // Clicking a pin is an explicit request, so that still zooms.
  const MAP_HOLD = 10000;
  let mapHeldUntil = 0;
  const mapHeld = () => Date.now() < mapHeldUntil;
  const holdMap = () => {
    mapHeldUntil = Date.now() + MAP_HOLD;
  };
  // Listening on the container catches only real input: map.flyTo fires
  // Leaflet's own move and zoom events, which would otherwise hold the map
  // against itself and never let it go.
  ["pointerdown", "wheel", "touchstart", "keydown", "dblclick"].forEach((ev) =>
    map.getContainer().addEventListener(ev, holdMap, { passive: true }),
  );

  document
    .getElementById("shotPrev")
    .addEventListener("click", () => nudge(-1));
  document.getElementById("shotNext").addEventListener("click", () => nudge(1));
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : play(),
  );
  window.addEventListener(
    "resize",
    () => {
      wall.scrollLeft = sPos * slideWidth();
    },
    { passive: true },
  );

  // ---- the full-screen viewer ----
  const viewer = document.createElement("div");
  viewer.className = "viewer";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-hidden", "true");
  viewer.innerHTML = `
    <button class="viewer__close" data-vclose aria-label="Close">&times;</button>
    <div class="viewer__head">
      <p class="viewer__eyebrow"></p>
      <h2 class="viewer__title"></h2>
      <p class="viewer__desc"></p>
    </div>
    <button class="viewer__arrow viewer__arrow--prev" data-vstep="-1" aria-label="Previous photo">&larr;</button>
    <div class="viewer__rail"></div>
    <button class="viewer__arrow viewer__arrow--next" data-vstep="1" aria-label="Next photo">&rarr;</button>`;
  document.body.appendChild(viewer);
  const vRail = viewer.querySelector(".viewer__rail");
  let vReturn = null;

  function openViewer(i, startAt) {
    const p = projects[i];
    const list =
      Array.isArray(p.gallery) && p.gallery.length
        ? p.gallery.map((g) => ({ src: g.src, cap: g.cap, phase: g.phase }))
        : p.img
          ? [{ src: p.img, cap: p.caption, phase: null }]
          : [];
    if (!list.length) return;
    vReturn = document.activeElement;
    viewer.querySelector(".viewer__eyebrow").textContent =
      p.type || "Previous project";
    viewer.querySelector(".viewer__title").textContent = p.name;
    viewer.querySelector(".viewer__desc").textContent = p.desc || "";
    vRail.innerHTML = list
      .map(
        (g) => `
      <figure class="viewer__fig">
        <div class="viewer__imgwrap">
          <img src="${g.src}" alt="${g.cap || p.name}">
          ${g.phase ? `<span class="viewer__phase viewer__phase--${g.phase}">${g.phase}</span>` : ""}
          ${g.cap ? `<figcaption class="viewer__cap">${g.cap}</figcaption>` : ""}
        </div>
      </figure>`,
      )
      .join("");
    stop();
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("viewer-lock");
    requestAnimationFrame(() => {
      vPos = Math.min(vRail.children.length - 1, Math.max(0, startAt || 0));
      const fig = vRail.children[vPos];
      if (fig) vRail.scrollLeft = Math.max(0, fig.offsetLeft - V_PAD);
    });
    vHeldUntil = 0;
    vPlay();
    viewer.querySelector(".viewer__close").focus();
  }

  function closeViewer() {
    vStop();
    play();
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("viewer-lock");
    if (vReturn) vReturn.focus();
  }

  const V_PAD = 24;
  let vPos = 0; // authoritative position in the rail
  function goViewer(k) {
    const figs = vRail.children;
    if (!figs.length) return;
    // Wrap rather than clamp, so the slideshow keeps running round the job
    // instead of stalling on the last photograph.
    vPos = ((k % figs.length) + figs.length) % figs.length;
    vRail.scrollTo({
      left: Math.max(0, figs[vPos].offsetLeft - V_PAD),
      behavior: "smooth",
    });
  }
  // Track position explicitly rather than deriving it from scrollLeft: CSS
  // scroll-snap re-settles the rail after each programmatic scroll, so a
  // measured index disagreed with where we asked to go and "back" stalled.
  const stepViewer = (dir) => goViewer(vPos + dir);

  // The full-screen view runs its own slideshow, on the same terms as the
  // panel beside the map: it advances from wherever you opened it, and backs
  // off for ten seconds whenever you take control yourself.
  const V_HOLD = 5000;
  const V_NUDGE_HOLD = 10000;
  let vTimer = null;
  let vHeldUntil = 0;
  function vPlay() {
    vStop();
    vTimer = setInterval(() => {
      if (Date.now() < vHeldUntil) return; // you are driving; wait it out
      stepViewer(1);
    }, V_HOLD);
  }
  function vStop() {
    if (vTimer) {
      clearInterval(vTimer);
      vTimer = null;
    }
  }
  // Stepping by hand holds the slideshow off without stopping it for good.
  const nudgeViewer = (dir) => {
    vHeldUntil = Date.now() + V_NUDGE_HOLD;
    stepViewer(dir);
  };
  vRail.addEventListener(
    "wheel",
    () => {
      vHeldUntil = Date.now() + V_NUDGE_HOLD;
    },
    { passive: true },
  );
  vRail.addEventListener(
    "pointerdown",
    () => {
      vHeldUntil = Date.now() + V_NUDGE_HOLD;
    },
    { passive: true },
  );

  viewer.addEventListener("click", (e) => {
    if (e.target.closest("[data-vclose]")) return closeViewer();
    const st = e.target.closest("[data-vstep]");
    if (st) return nudgeViewer(+st.dataset.vstep);
    if (e.target === viewer) closeViewer();
  });
  document.addEventListener("keydown", (e) => {
    if (!viewer.classList.contains("is-open")) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight") nudgeViewer(1);
    if (e.key === "ArrowLeft") nudgeViewer(-1);
  });

  let current = -1;

  function select(i, source) {
    if (i === current) {
      // Re-clicking the job that happens to be selected must still open its
      // photo set — otherwise the row goes dead once the shuffle lands on it.
      if (source === "map") openViewer(i, 0);
      focusPin(i, null, source === "map");
      return;
    }
    if (current >= 0)
      markers[current].setIcon(pinIcon(false, hasCase(projects[current])));
    current = i;
    const p = projects[i];

    // Pin
    markers[i].setIcon(pinIcon(true, hasCase(p)));
    // Scrolling the photos flies the map to that job and zooms in, so the lit
    // pin is actually readable — at full extent it is hard to see what changed.
    // No popup though: that would cover the map on every step.
    if (source === "scroll") {
      if (!firstSync) focusPin(i, 16.5);
      firstSync = false;
      return;
    }
    if (source !== "map" && source !== "init") focusPin(i, null, true);
    if (source !== "init") markers[i].openPopup();

    // Clicking a pin opens that job's photographs full screen.
    if (source === "map") openViewer(i, 0);
  }

  // force is for moves the visitor actually asked for — clicking a pin or a
  // job. Everything else is the slideshow driving, and that yields while they
  // have hold of the map.
  function focusPin(i, zoom, force) {
    if (!force && mapHeld()) return;
    const p = projects[i];
    map.flyTo([p.lat, p.lng], zoom || Math.max(map.getZoom(), 16), {
      duration: 0.9,
    });
  }

  renderShots();
  requestAnimationFrame(syncPinToShot);
  play();
  hint.textContent = `${shots.length} photographs across ${new Set(shots.map((x) => x.i)).size} documented jobs — click any photograph, or a pin, to open that job.`;
  select(0, "init");

  // ---------------- Google Reviews carousel ----------------
  const reviews = [
    {
      author: "Yossi Lasker",
      stars: 5,
      html: `We couldn&rsquo;t be happier with our experience working with PSI Construction. They handled a full home remodel and finished our basement, and the results are absolutely fantastic. The team was professional, efficient, and respectful of our home. The project moved along quickly, and the pricing was by far the best we found. <strong>If you&rsquo;re looking for quality work at an honest price, PSI Construction is the way to go.</strong>`,
    },
    {
      author: "Mendel Erlenwein",
      stars: 5,
      html: `Unbelievable work, could not recommend enough! As always, things come up in projects, new design ideas, etc and they came through on every single detail without constantly trying to up the estimate. <strong>Everything was meticulously planned out and executed to perfection,</strong> Great folks to work with and most of all, honest and stand behind their work!`,
    },
    {
      author: "Moshe Dahan",
      stars: 5,
      html: `Had these guys do my guest/office bathroom over in my house. <strong>The job was done and bathroom was usable in three days.</strong> The bosses are super professional and detailed with what goes into each job. Great communication and great work. They quoted me on window replacement and another bathroom remodel and I&rsquo;m going with them for both jobs. Worth every penny working with these guys.`,
    },
    {
      author: "Ben Berkovitz",
      stars: 5,
      html: `PSI Construction did an amazing job on our renovation plus new build project. <strong>They were very patient, transparent, communicative and very professional throughout our entire project.</strong> Their pricing was very competitive, and they completed the project within the expected timeline they gave us. Whenever something came up, they provided us with all the different options we could choose from. I highly recommend them and would hire them again for future projects.`,
    },
    {
      author: "Mikaela",
      stars: 4,
      html: `Great price. PSI came referred to us through friends in the NEPA area. They renovated our guest bath for us in a matter of a few weeks. They were communicative and worked with us to achieve an on-time completion date and <strong>we were extremely impressed with the tile work for the tub area!</strong>`,
    },
    {
      author: "Mushkie Schaeffer",
      stars: 5,
      html: `We had a seamless experience working with PSI on our custom home sauna. Although this was their first sauna project, they proved confidence and execution in their build. <strong>The finished sauna is both functional and spa-like,</strong> due to their research in providing us with the best materials for performance and visuals. We highly recommend them to anyone looking for an in-home sauna room that looks crafted and state-of-the-art!`,
    },
    {
      author: "Miguel Andres Contreras",
      stars: 5,
      html: `<strong>Couldn&rsquo;t be happier with the work, honesty and professionalism.</strong>`,
    },
  ];

  const rTrack = document.getElementById("reviewsTrack");
  reviews.forEach((r) => {
    const card = document.createElement("article");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-card__stars" aria-label="${r.stars} out of 5 stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <p class="review-card__text">&ldquo;${r.html}&rdquo;</p>
      <p class="review-card__author">${r.author}<small>${r.stars} Stars &middot; Google Review</small></p>`;
    rTrack.appendChild(card);
  });

  let rIndex = 0;
  function reviewStep() {
    const card = rTrack.querySelector(".review-card");
    if (!card) return 0;
    return card.getBoundingClientRect().width + 20;
  }
  function maxIndex() {
    const wrap = rTrack.parentElement.getBoundingClientRect().width;
    const visible = Math.max(1, Math.floor(wrap / reviewStep()));
    return Math.max(0, reviews.length - visible);
  }
  function renderReviews() {
    rIndex = Math.min(Math.max(0, rIndex), maxIndex());
    rTrack.style.transform = `translateX(-${rIndex * reviewStep()}px)`;
  }
  document.getElementById("reviewsPrev").addEventListener("click", () => {
    rIndex--;
    renderReviews();
  });
  document.getElementById("reviewsNext").addEventListener("click", () => {
    rIndex++;
    renderReviews();
  });
  window.addEventListener("resize", renderReviews, { passive: true });
})();
