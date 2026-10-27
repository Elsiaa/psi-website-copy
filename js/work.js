/* ============================================================
   Our Work
   The hero cycles the build (a stand-in until the finished
   animation lands), the map drops a pin on every documented
   job, and the gallery lays out every photograph, grouped by
   job, with a lightbox.
   ============================================================ */
(() => {
  "use strict";
  const projects = window.PSI_PROJECTS || [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- hero: the range of the work, shuffled ---- */
  const stage = document.getElementById("workStage");
  if (stage) {
    const SCENES = 15;
    const order = Array.from({ length: SCENES }, (_, i) => i + 1);
    for (let i = order.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1));
      [order[i], order[k]] = [order[k], order[i]];
    }
    const frames = order.map((n, i) => {
      const img = document.createElement("img");
      img.src =
        "assets/work-hero/scene-" + String(n).padStart(2, "0") + ".webp";
      img.alt = "";
      // only the first two matter for the first paint
      if (i > 1) img.loading = "lazy";
      img.decoding = "async";
      stage.appendChild(img);
      return img;
    });
    let f = 0;
    const show = (k) =>
      frames.forEach((img, i) => (img.style.opacity = i === k ? 1 : 0));
    show(0);
    if (!reduce && frames.length > 1) {
      setInterval(() => {
        f = (f + 1) % frames.length;
        show(f);
      }, 1700);
    }
  }

  /* ---- the jobs: anything with photographs ---- */
  const jobs = projects
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => Array.isArray(p.gallery) && p.gallery.length);

  /* ---- map ---- */
  const mapEl = document.getElementById("projectMap");
  let map = null;
  const markers = [];
  if (mapEl && window.L) {
    // panning off on touch, so a finger swiping over the map scrolls
    // the page rather than dragging the map under it
    map = L.map(mapEl, {
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
    });
    map.attributionControl.setPrefix(
      '<a href="https://leafletjs.com">Leaflet</a>',
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    projects.forEach((p) => {
      const isOffice = p.name === "PSI Construction, Office";
      const m = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="pin${isOffice ? " pin--office" : ""}"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 18],
        }),
        keyboard: false,
      }).addTo(map);
      m.bindPopup(
        `<strong>${p.type || "Previous project"}</strong><br>${p.city}`,
      );
      if (!isOffice) {
        m.on("click", () => openJob(p.id));
      }
      markers.push(m);
    });

    const bounds = L.latLngBounds(projects.map((p) => [p.lat, p.lng])).pad(
      0.08,
    );
    map.fitBounds(bounds);
    let drove = false;
    ["pointerdown", "wheel", "touchstart"].forEach((ev) =>
      mapEl.addEventListener(ev, () => (drove = true), { passive: true }),
    );
    if (window.ResizeObserver) {
      let lw = 0,
        lh = 0;
      new ResizeObserver(() => {
        const w = mapEl.clientWidth,
          h = mapEl.clientHeight;
        if (!w || !h) return;
        if (Math.abs(w - lw) < 8 && Math.abs(h - lh) < 8) return;
        lw = w;
        lh = h;
        map.invalidateSize();
        if (!drove) map.fitBounds(bounds);
      }).observe(mapEl);
    }
  }

  /* ---- the gallery: one card per job, searchable ---- */
  const host = document.getElementById("workJobs");
  const search = document.getElementById("workSearch");
  const count = document.getElementById("workCount");
  const empty = document.getElementById("workEmpty");
  const cards = [];
  let flat = [];
  let scope = null; // the job the lightbox is walking, or null for all

  if (host) {
    host.className = "wgrid";
    jobs.forEach(({ p }) => {
      const shots = p.gallery;
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "wjob";
      tile.id = "job-" + p.id;
      tile.innerHTML =
        `<span class="wjob__media">` +
        `<img class="wjob__cover" src="${shots[0].src}" alt="" loading="lazy" decoding="async">` +
        `<span class="wjob__count">${shots.length}</span>` +
        `</span>` +
        `<span class="wjob__body">` +
        `<span class="wjob__name">${p.type || "Previous project"}</span>` +
        `<span class="wjob__meta">${p.city}</span>` +
        `</span>`;
      host.appendChild(tile);

      const set = shots.map((g) => ({
        src: g.src,
        cap: g.cap || p.type || "",
      }));
      tile.addEventListener("click", () => openSet(set, 0));

      cards.push({
        p,
        card: tile,
        set,
        hay: [p.type, p.city, p.desc, ...shots.map((g) => g.cap || "")]
          .join(" ")
          .toLowerCase(),
      });
    });
  }

  function openJob(id) {
    const c = cards.find((x) => x.p.id === id);
    if (!c) return;
    c.card.scrollIntoView({ behavior: "smooth", block: "center" });
    openSet(c.set, 0);
  }

  function filter() {
    const q = (search ? search.value : "").trim().toLowerCase();
    let shown = 0;
    cards.forEach((c) => {
      const hit = !q || c.hay.includes(q);
      c.card.hidden = !hit;
      if (hit) shown += 1;
    });
    if (count)
      count.textContent =
        shown + (shown === 1 ? " job" : " jobs") + (q ? " matching" : "");
    if (empty) empty.hidden = shown > 0;
  }
  if (search) search.addEventListener("input", filter);
  filter();

  /* ---- lightbox: walks the job it was opened from ---- */
  const box = document.getElementById("wlb");
  const bImg = document.getElementById("wlbImg");
  const bCap = document.getElementById("wlbCap");
  let at = 0;
  function paint() {
    const s = flat[at];
    if (!s) return;
    bImg.src = s.src;
    bImg.alt = s.cap;
    bCap.textContent = s.cap + "  \u00B7  " + (at + 1) + " / " + flat.length;
  }
  function openSet(set, k) {
    flat = set;
    at = k;
    paint();
    box.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() {
    box.hidden = true;
    document.body.style.overflow = "";
  }
  const step = (d) => {
    if (!flat.length) return;
    at = (at + d + flat.length) % flat.length;
    paint();
  };
  if (host && box) {
    box.querySelector(".wlb__close").addEventListener("click", close);
    box
      .querySelector(".wlb__nav--prev")
      .addEventListener("click", () => step(-1));
    box
      .querySelector(".wlb__nav--next")
      .addEventListener("click", () => step(1));
    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }
})();
