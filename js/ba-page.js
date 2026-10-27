/* ============================================================
   Before & After, the page
   Every documented pair gets its own slider: drag the handle,
   or focus it and use the arrow keys. The same markup and the
   same .ba styles as the home page section, one per job.
   ============================================================ */
(() => {
  "use strict";
  const root = document.getElementById("baPage");
  const inner = root && root.querySelector(".section__inner");

  const JOBS = [
    {
      key: "bath-marble",
      span: "Bathroom renovation",
      title: "Yellow tile to marble",
      place: "Kingston, PA",
      before:
        "Original 1960s yellow tile and a cast tub, cracked and leaking at the walls",
      after:
        "Floor-to-ceiling marble-look porcelain, glass shower and a new comfort-height toilet",
    },
    {
      key: "walk-in-shower",
      span: "Took in the closet next door",
      title: "Cramped stall to walk-in",
      place: "Kingston, PA",
      before: "A shoulder-wide stall with three exposed valves",
      after:
        "Nearly double the footprint: rain head, cove lighting, built-in bench and a lit niche",
    },
    {
      key: "porch-bath",
      span: "New room inside the footprint",
      title: "Porch to master bathroom",
      place: "Kingston, PA",
      before: "An unheated, enclosed side porch",
      after: "A full master bathroom: insulated, tiled, plumbed and lit",
    },
    {
      key: "basement",
      span: "Framed, insulated, finished",
      title: "Bare basement to finished level",
      place: "Kingston, PA",
      before: "Open joists, bare block walls and a dirt-stained slab",
      after: "A finished lower level with a full bathroom and walk-in shower",
    },
    {
      key: "commercial-bath",
      span: "Two bathrooms, one job",
      title: "Commercial bath, gutted",
      place: "Kingston, PA",
      before: "Demolition: fixtures out, walls opened to the studs",
      after: "Floating vanity, backlit mirror and a tiled tub surround",
    },
    {
      key: "garage-apartment",
      span: "Change of use, permitted",
      title: "Garage to two apartments",
      place: "Kingston, PA",
      before: "A storage garage with a broken slab and open ceiling",
      after: "One of two new rental units: kitchen, laundry and plank floors",
    },
  ];

  if (inner)
    JOBS.forEach((j, i) => {
      const row = document.createElement("article");
      row.className = "bap__row";
      row.innerHTML = `
      <div class="ba" style="--x: 50%">
        <img class="ba__before" src="assets/transform/${j.key}-before.jpg"
          alt="Before: ${j.before}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async">
        <img class="ba__after" src="assets/transform/${j.key}-after.jpg"
          alt="After: ${j.after}" loading="${i < 2 ? "eager" : "lazy"}" decoding="async">
        <span class="ba__tag ba__tag--before">Before</span>
        <span class="ba__tag ba__tag--after">After</span>
        <input class="ba__range" type="range" min="0" max="100" value="50" step="0.5"
          aria-label="${j.title}: move to compare before and after">
        <span class="ba__handle" aria-hidden="true"></span>
      </div>
      <div class="bap__info">
        <p class="bap__span">${j.span}</p>
        <h2 class="bap__name">${j.title}</h2>
        <p class="bap__place">${j.place}</p>
        <dl class="tf__caps">
          <div><dt>Before</dt><dd class="tf__cap">${j.before}</dd></div>
          <div><dt>After</dt><dd class="tf__cap">${j.after}</dd></div>
        </dl>
      </div>`;

      inner.appendChild(row);
    });

  // Every slider answers the drag, and sweeps on its own until it is
  // touched: in view it reveals the after, then the before, then
  // settles back to the middle. The first real interaction stops it
  // for good and hands the divider to the visitor.
  document.querySelectorAll(".ba").forEach((frame) => {
    const range = frame.querySelector(".ba__range");
    if (!range || range.dataset.wired) return;
    range.dataset.wired = "1";

    const paint = () => frame.style.setProperty("--x", range.value + "%");
    paint();

    let manual = false;
    const takeOver = () => {
      if (manual) return;
      manual = true;
      // start from wherever the sweep had reached, so nothing jumps
      const at = getComputedStyle(frame).getPropertyValue("--x").trim();
      const pct = parseFloat(at);
      if (!Number.isNaN(pct)) range.value = String(Math.round(pct));
      frame.classList.remove("ba--auto");
      paint();
    };

    ["pointerdown", "touchstart", "keydown", "wheel"].forEach((ev) =>
      range.addEventListener(ev, takeOver, { passive: true }),
    );
    range.addEventListener("input", () => {
      takeOver();
      paint();
    });

    if (window.IntersectionObserver) {
      new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (manual) return;
            frame.classList.toggle("ba--auto", e.isIntersecting);
          });
        },
        { threshold: 0.35 },
      ).observe(frame);
    } else {
      frame.classList.add("ba--auto");
    }
  });
})();
