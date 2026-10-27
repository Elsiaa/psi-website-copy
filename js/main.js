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
  const LOGO_SWITCH_AT = 0.24;
  const heroEl = document.getElementById("hero");
  // The hero's geometry only changes when the viewport does. Reading
  // offsetHeight inside the scroll handler forced a layout on every
  // event, right after the hero's own handler had dirtied it — the
  // classic thrash. Measure on resize instead, and scroll off numbers.
  let heroTop = 0;
  let heroH = 0;
  let solidAt = 40;
  let logoAt = 0;
  const measure = () => {
    if (!heroEl) return;
    heroTop = heroEl.getBoundingClientRect().top + window.scrollY;
    heroH = heroEl.offsetHeight;
    const runway = heroH - window.innerHeight;
    solidAt = heroTop + heroH - window.innerHeight * 0.5;
    logoAt = runway > 0 ? heroTop + runway * LOGO_SWITCH_AT : heroTop;
  };
  let lastSolid = null;
  let lastDark = null;
  const onScroll = () => {
    const y = window.scrollY;
    // No hero (inner pages): the bar is solid from the start, so the
    // full-colour mark is always the right one.
    const solid = heroEl ? y > solidAt : true;
    const dark = heroEl ? y >= logoAt : true;
    if (solid !== lastSolid) {
      nav.classList.toggle("nav--solid", solid);
      lastSolid = solid;
    }
    if (dark !== lastDark) {
      nav.classList.toggle("nav--darklogo", dark);
      lastDark = dark;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      measure();
      onScroll();
    },
    { passive: true },
  );
  measure();
  onScroll();

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
    {
      author: "Schneur Polter",
      stars: 5,
      html: `Had a great experience with PSI Construction. I worked directly with Saadya, and he was professional, responsive, and a pleasure to deal with throughout the entire process. <strong>Communication was excellent, everything was handled smoothly, and the quality of the work was top-notch.</strong> You can tell they genuinely care about their clients and stand behind their work. Highly recommend PSI Construction, and especially Saadya!`,
    },
    {
      author: "Mendel Polter",
      stars: 5,
      html: `PSI Construction in Kingston, PA did a great job on my project. They were professional, reliable, and paid close attention to the details. <strong>The work was completed on time and I&rsquo;m very happy with the results.</strong> I&rsquo;d definitely recommend them to anyone looking for quality construction work.`,
    },
    {
      author: "Jonathan Hale",
      stars: 5,
      html: `<strong>Legendary work! Absolutely recommend these guys!</strong> Efficient, clear, and on point! And yes Saadya&hellip; the measurements were right the first time. &#128514;`,
    },
    {
      author: "Moshe Polter",
      stars: 5,
      html: `Great company, <strong>very efficient and easy to work with.</strong> I recommend for all of your construction needs!`,
    },
  ];

  // ---- the reviews: a deck you swipe through ----
  const rTrack = document.getElementById("rvwTrack");
  const rReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (rTrack) {
    const initials = (name) =>
      name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("");

    rTrack.innerHTML = reviews
      .map(
        (r) => `
      <figure class="rvw__card">
        <blockquote class="rvw__quote">\u201C${r.html}\u201D</blockquote>
        <figcaption class="rvw__by">
          <span class="rvw__avatar" aria-hidden="true">${initials(r.author)}</span>
          <span class="rvw__who">
            <b>${r.author}</b>
            <i>Google review \u00B7 <span class="rvw__meta-stars">${"\u2605".repeat(
              r.stars,
            )}</span></i>
          </span>
        </figcaption>
      </figure>`,
      )
      .join("");

    // It carries itself until someone takes the wheel, then it is
    // theirs: no card sliding out from under a half-read quote.
    let rTimer = null;
    let taken = false;
    const pause = () => {
      if (rTimer) clearInterval(rTimer);
      rTimer = null;
    };
    const stopAuto = () => {
      taken = true;
      pause();
    };
    const stepOne = () => {
      const card = rTrack.firstElementChild;
      if (!card) return;
      const gap = parseFloat(getComputedStyle(rTrack).columnGap) || 0;
      const stride = card.getBoundingClientRect().width + gap;
      const atEnd =
        rTrack.scrollLeft + rTrack.clientWidth >= rTrack.scrollWidth - 4;
      rTrack.scrollTo({
        left: atEnd ? 0 : rTrack.scrollLeft + stride,
        behavior: "smooth",
      });
    };
    // Only while the deck is actually on screen: nothing to gain from
    // sliding cards nobody is looking at, and it keeps the smooth
    // scroll off the main thread while the reader is elsewhere.
    const play = () => {
      if (taken || rTimer || rReduce.matches) return;
      rTimer = setInterval(stepOne, 7000);
    };
    new IntersectionObserver(([e]) => (e.isIntersecting ? play() : pause()), {
      threshold: 0.4,
    }).observe(rTrack);
    ["pointerdown", "touchstart", "wheel", "keydown"].forEach((ev) =>
      rTrack.addEventListener(ev, stopAuto, { passive: true, once: true }),
    );
  }

  // Aggregate score in the badge, computed from the cards themselves.
  const gAvg = reviews.reduce((t, r) => t + r.stars, 0) / reviews.length;
  const gRating = document.getElementById("gRating");
  const gStars = document.getElementById("gStars");
  if (gRating) gRating.textContent = (Math.round(gAvg * 10) / 10).toFixed(1);
  if (gStars) {
    gStars.textContent =
      "★".repeat(Math.round(gAvg)) + "☆".repeat(5 - Math.round(gAvg));
    gStars.setAttribute(
      "aria-label",
      `Rated ${(Math.round(gAvg * 10) / 10).toFixed(1)} out of 5`,
    );
  }
})();

/* ============================================================
   Mobile navigation
   The links become a panel below 760px. Kept honest about the
   things a panel has to get right: focus, Escape, the back of
   the page not scrolling underneath, and never staying open when
   the layout returns to the desktop row.
   ============================================================ */
(() => {
  "use strict";
  const nav = document.getElementById("topNav");
  const toggle = document.getElementById("navToggle");
  const panel = document.getElementById("navLinks");
  const scrim = document.getElementById("navScrim");
  if (!nav || !toggle || !panel) return;

  const phone = window.matchMedia("(max-width: 760px)");
  let open = false;

  const setOpen = (next) => {
    open = next;
    nav.classList.toggle("nav--open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (scrim) scrim.hidden = !open;
    // hold the page still while the panel is up
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const first = panel.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener("click", () => setOpen(!open));
  if (scrim) scrim.addEventListener("click", () => setOpen(false));

  // a link tap should navigate and dismiss, not leave the panel hanging
  panel.addEventListener("click", (e) => {
    if (e.target.closest("a") && open) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      toggle.focus();
    }
  });

  // rotating to landscape must not strand an open panel over a desktop row
  const sync = () => {
    if (!phone.matches && open) setOpen(false);
  };
  if (phone.addEventListener) phone.addEventListener("change", sync);
  window.addEventListener("resize", sync);

  // ---------------- Previous Projects ----------------
  const projects = window.PSI_PROJECTS || [];
  const office = window.PSI_OFFICE;
  const mapEl = document.getElementById("projectMap");
  if (!mapEl || !projects.length || typeof L === "undefined") return;

  // On a touch screen a finger landing on the map used to pan the map
  // instead of the page, so the page felt stuck. Panning is off there;
  // the pins stay tappable and the zoom buttons still work.
  const touch = L.Browser.mobile;
  const map = L.map(mapEl, { scrollWheelZoom: false, dragging: !touch });
  // Leaflet 1.9 puts a Ukrainian flag in its attribution prefix; keep the
  // required Leaflet and OpenStreetMap credits, drop the flag.
  map.attributionControl.setPrefix(
    '<a href="https://leafletjs.com">Leaflet</a>',
  );
  // CARTO's light basemap: quiet greys that sit on the white site,
  // with the red pins carrying the color.
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  ).addTo(map);

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
        ? `<strong>${p.type || "Previous project"}</strong><br>` +
            (p.type
              ? `<em style="color:#d60000;font-style:normal;font-weight:600">${p.type}</em><br>`
              : "") +
            `${p.city}` +
            (p.desc
              ? `<span style="display:block;margin-top:6px;max-width:240px">${p.desc}</span>`
              : "") +
            `<button class="case__open" data-project="${i}" data-open="${i}">See these photos &rarr;</button>`
        : `<strong>${p.type || "Previous project"}</strong><br>${p.city}`,
    );
    m.on("click", () => select(i, "map"));
    // hovering a pin lights its card, exactly as the cards light the pins
    m.on("mouseover", () => select(i, "hover"));
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

  // The container's size settles after fonts and the compact layout
  // land, and Leaflet keeps the zoom it computed for the old box. Any
  // meaningful size change refits the pins, until the visitor takes
  // the wheel themselves.
  let userDrove = false;
  ["pointerdown", "wheel", "touchstart"].forEach((ev) =>
    mapEl.addEventListener(ev, () => (userDrove = true), { passive: true }),
  );
  if (window.ResizeObserver) {
    let lastW = 0;
    let lastH = 0;
    const ro = new ResizeObserver(() => {
      const w = mapEl.clientWidth;
      const h = mapEl.clientHeight;
      if (!w || !h) return;
      if (Math.abs(w - lastW) < 8 && Math.abs(h - lastH) < 8) return;
      lastW = w;
      lastH = h;
      map.invalidateSize();
      if (!userDrove) map.fitBounds(allBounds);
    });
    ro.observe(mapEl);
  }

  // ---- the job index: one card per documented job ----
  const jobsGrid = document.getElementById("jobsGrid");

  function buildJobs() {
    jobsGrid.innerHTML = "";
    projects.forEach((p, i) => {
      const count =
        Array.isArray(p.gallery) && p.gallery.length
          ? p.gallery.length
          : p.img
            ? 1
            : 0;
      if (!count) return;
      const card = document.createElement("button");
      card.type = "button";
      card.className = "job";
      card.dataset.job = i;
      card.innerHTML =
        '<span class="job__media">' +
        '<img loading="lazy" src="' +
        p.img +
        '" alt="' +
        (p.caption || p.type || "PSI project") +
        '">' +
        '<span class="job__count"><b>' +
        count +
        "</b> " +
        (count === 1 ? "photo" : "photos") +
        "</span>" +
        "</span>" +
        '<span class="job__body">' +
        '<span class="job__name">' +
        (p.type || "Previous project") +
        "</span>" +
        '<span class="job__type">' +
        p.city +
        "</span>" +
        "</span>";
      jobsGrid.appendChild(card);
    });
  }

  jobsGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".job");
    if (!card) return;
    const i = +card.dataset.job;
    select(i, "card");
    openViewer(i, 0);
  });

  // Hovering a card lights its pin, so the grid and the map read as one
  // instrument rather than two widgets sharing a section.
  jobsGrid.addEventListener("pointerover", (e) => {
    const card = e.target.closest(".job");
    if (card) select(+card.dataset.job, "hover");
  });

  // tabbing through the cards lights the pins just like the pointer does
  jobsGrid.addEventListener("focusin", (e) => {
    const card = e.target.closest(".job");
    if (card) select(+card.dataset.job, "hover");
  });

  // The map holds still while the visitor is driving it themselves.
  const MAP_HOLD = 10000;
  let mapHeldUntil = 0;
  const mapHeld = () => Date.now() < mapHeldUntil;
  const holdMap = () => {
    mapHeldUntil = Date.now() + MAP_HOLD;
  };
  ["pointerdown", "wheel", "touchstart", "keydown", "dblclick"].forEach((ev) =>
    map.getContainer().addEventListener(ev, holdMap, { passive: true }),
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
    <button class="viewer__arrow viewer__arrow--next" data-vstep="1" aria-label="Next photo">&rarr;</button>
    <div class="viewer__foot">
      <div class="viewer__thumbs" role="tablist" aria-label="Photographs in this job"></div>
      <p class="viewer__count"></p>
    </div>`;
  document.body.appendChild(viewer);
  const vRail = viewer.querySelector(".viewer__rail");
  const vThumbs = viewer.querySelector(".viewer__thumbs");
  const vCount = viewer.querySelector(".viewer__count");
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
    viewer.querySelector(".viewer__eyebrow").textContent = p.city;
    viewer.querySelector(".viewer__title").textContent =
      p.type || "Previous project";
    viewer.querySelector(".viewer__desc").textContent = p.desc || "";
    vThumbs.innerHTML = list
      .map(function (g, k) {
        return (
          '<button class="viewer__thumb" data-vgo="' +
          k +
          '" role="tab" aria-label="Photo ' +
          (k + 1) +
          '"><img src="' +
          g.src +
          '" alt=""></button>'
        );
      })
      .join("");
    vRail.innerHTML = list
      .map(
        (g) => `
      <figure class="viewer__fig">
        <div class="viewer__imgwrap">
          <img src="${g.src}" alt="${g.cap || p.type}">
          ${g.phase ? `<span class="viewer__phase viewer__phase--${g.phase}">${g.phase}</span>` : ""}
          ${g.cap ? `<figcaption class="viewer__cap">${g.cap}</figcaption>` : ""}
        </div>
      </figure>`,
      )
      .join("");
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("viewer-lock");
    requestAnimationFrame(() => {
      vPos = Math.min(vRail.children.length - 1, Math.max(0, startAt || 0));
      const fig = vRail.children[vPos];
      if (fig) vRail.scrollLeft = Math.max(0, fig.offsetLeft - V_PAD);
      paintViewerChrome();
    });
    vHeldUntil = 0;
    vPlay();
    viewer.querySelector(".viewer__close").focus();
  }

  function closeViewer() {
    vStop();
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
    paintViewerChrome();
  }

  function paintViewerChrome() {
    const n = vRail.children.length;
    if (vCount) vCount.textContent = n ? vPos + 1 + " / " + n : "";
    if (vThumbs) {
      [...vThumbs.children].forEach(function (t, k) {
        t.classList.toggle("is-on", k === vPos);
        t.setAttribute("aria-selected", k === vPos ? "true" : "false");
      });
      const on = vThumbs.children[vPos];
      if (on)
        on.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: "smooth",
        });
    }
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

  // Dragging or wheeling the rail moves scrollLeft without goViewer(), so
  // once the scroll settles, adopt whichever photo actually snapped in.
  let vSettle = null;
  vRail.addEventListener(
    "scroll",
    () => {
      if (Date.now() >= vHeldUntil) return; // programmatic scroll: vPos is authoritative
      clearTimeout(vSettle);
      vSettle = setTimeout(() => {
        const figs = [...vRail.children];
        if (!figs.length) return;
        let best = 0,
          bestDist = Infinity;
        figs.forEach((f, k) => {
          const d = Math.abs(f.offsetLeft - V_PAD - vRail.scrollLeft);
          if (d < bestDist) {
            bestDist = d;
            best = k;
          }
        });
        if (best !== vPos) {
          vPos = best;
          paintViewerChrome();
        }
      }, 160);
    },
    { passive: true },
  );

  viewer.addEventListener("click", (e) => {
    if (e.target.closest("[data-vclose]")) return closeViewer();
    const th = e.target.closest("[data-vgo]");
    if (th) {
      vHeldUntil = Date.now() + V_NUDGE_HOLD;
      return goViewer(+th.dataset.vgo);
    }
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
    if (current >= 0) {
      markers[current].setIcon(pinIcon(false, hasCase(projects[current])));
      markers[current].setZIndexOffset(0);
    }
    current = i;
    const p = projects[i];

    // Pin: lit, and above the cluster so it reads at Kingston's density
    markers[i].setIcon(pinIcon(true, hasCase(p)));
    markers[i].setZIndexOffset(1000);

    // Card
    const cards = jobsGrid.querySelectorAll(".job");
    cards.forEach((c) => c.classList.toggle("is-active", +c.dataset.job === i));
    const active = jobsGrid.querySelector(".job.is-active");
    if (active && source === "map")
      active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    // Scrolling the photos flies the map to that job and zooms in, so the lit
    // pin is actually readable — at full extent it is hard to see what changed.
    // No popup though: that would cover the map on every step.
    if (source === "hover") {
      // light the pin, but never fly the map on a hover
      return;
    }
    if (source !== "map" && source !== "init") focusPin(i, null, true);
    if (source !== "init" && source !== "card") markers[i].openPopup();

    // Clicking a pin opens that job's photographs full screen.
    if (source === "map") openViewer(i, 0);
  }

  // force is for moves the visitor actually asked for — clicking a pin or a
  // job. Everything else is the slideshow driving, and that yields while they
  // have hold of the map.
  function focusPin(i, zoom, force) {
    if (!force && mapHeld()) return;
    const p = projects[i];
    map.flyTo(
      [p.lat, p.lng],
      zoom || Math.min(Math.max(map.getZoom(), 14.5), 15),
      {
        duration: 0.9,
      },
    );
  }

  buildJobs();
  select(0, "init");
})();

/* ---- service cards: a tap flips them where there is no hover ---- */
(() => {
  const rail = document.getElementById("svcRail");
  if (!rail) return;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  rail.addEventListener("click", (e) => {
    const card = e.target.closest(".svc");
    if (!card || e.target.closest("a")) return;
    if (fine) return; // the pointer already flips it
    const open = !card.classList.contains("is-flipped");
    rail.querySelectorAll(".svc.is-flipped").forEach((c) => {
      c.classList.remove("is-flipped");
      const b = c.querySelector(".svc__btn");
      if (b) b.tabIndex = -1;
    });
    card.classList.toggle("is-flipped", open);
    const btn = card.querySelector(".svc__btn");
    if (btn) btn.tabIndex = open ? 0 : -1;
  });
  // keyboard: focusing into a card makes its button reachable
  rail.addEventListener("focusin", (e) => {
    const card = e.target.closest(".svc");
    if (!card) return;
    const btn = card.querySelector(".svc__btn");
    if (btn) btn.tabIndex = 0;
  });
})();
