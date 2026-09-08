/* ============================================================
   PSI support assistant
   Honest by design: every answer comes from copy already on
   this site. The engine below retrieves and ranks that copy;
   it never generates a fact. Anything it cannot ground is
   routed to the phone or the quote form.

   The system:
   - a knowledge base of fine-grained entries, each a fact the
     site states, tagged with the terms people use to ask for it
   - a retrieval engine: normalisation, light stemming, a
     synonym map, weighted term scoring with phrase bonuses and
     an evidence threshold
   - compound questions split and answered part by part
   - conversation persists for the visit (sessionStorage); typing
     paced to answer length and skipped for reduced motion;
     focus is trapped in the open panel
   ============================================================ */
(() => {
  "use strict";

  const PHONE_HTML =
    '<a href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a>';
  const EMAIL_HTML =
    '<a href="mailto:info@psiconstructionpa.com">info@psiconstructionpa.com</a>';
  const STORE = "psi-sbot-v2";

  /* ---------------- knowledge base ----------------
     k: retrieval terms (asked-with words)  q: canonical question
     a: the answer, verbatim from site copy  */
  const KB = [
    {
      id: "areas",
      k: "area areas where town towns city cities kingston wilkes barre pittston exeter serve serving located location travel far distance county luzerne local nearby region cover",
      q: "What areas do you work in?",
      a:
        "Our office is at 190 Wyoming Street in Wilkes-Barre, and most of our " +
        "jobs are in Kingston, Wilkes-Barre, West Pittston, Exeter, and the " +
        "surrounding Luzerne County towns. If you are just outside that, call " +
        PHONE_HTML +
        " and we will tell you straight whether we are the right fit.",
    },
    {
      id: "quote",
      k: "quote estimate estimates price prices pricing cost costs charge much money pay budget consultation free bid proposal start begin hire book",
      q: "How do I get a quote?",
      a:
        "Two ways. Run through the <a href='contact.html'>quote request</a>, " +
        "a few multiple-choice questions with a “not sure yet” option on " +
        "every one, and we turn up already knowing the job. Or call " +
        PHONE_HTML +
        ". The consultation is free.",
    },
    {
      id: "landlords",
      k: "landlord landlords property manager managers management rental rentals tenant tenants turnover turnovers unit units portfolio apartment apartments building buildings compliance",
      q: "Do you work with landlords?",
      a:
        "Yes. Turnovers between tenants, plumbing and electrical repairs, " +
        "drywall and finish work, flooring, doors and hardware, carpentry, " +
        "and the recurring items that keep a building in shape and in " +
        "compliance.",
    },
    {
      id: "permits",
      k: "permit permits permitting inspection inspections inspector inspectors township code codes compliance paperwork approvals zoning legal",
      q: "Do you handle permits?",
      a:
        "Yes. We pull the permits and deal with the township and the " +
        "inspectors, so you are not chasing paperwork while the job is " +
        "running.",
    },
    {
      id: "design",
      k: "architect architects architectural engineer engineers engineering design designer designers plans drawings blueprint blueprints structural",
      q: "Do you work with architects and engineers?",
      a:
        "Depending on the job we use our own people plus outside engineers, " +
        "architects, and designers. We work out where professional design " +
        "actually earns its cost, rather than running up design fees.",
    },
    {
      id: "publicbid",
      k: "public bid bids bidding pennbid municipal municipality county institutional institution government prevailing wage school district commercial contract",
      q: "Do you bid public work?",
      a:
        "Yes, including projects issued through PennBid, county and municipal " +
        "vendor lists, and architect-managed bid lists. Prevailing wage and " +
        "documentation compliance are handled where they apply.",
    },
    {
      id: "updates",
      k: "progress update updates happening communication communicate status track tracking software informed schedule timeline manage managed walkthrough responsible",
      q: "How will I know what is happening on my job?",
      a:
        "You get one point of responsibility from planning through the final " +
        "walkthrough. Behind that, we run software we built ourselves that " +
        "tracks progress, open items, and documentation, so the crew and the " +
        "office see the same picture. It costs you nothing extra.",
    },
    {
      id: "examples",
      k: "photo photos picture pictures example examples portfolio gallery previous past projects built jobs proof documented map pins",
      q: "Can I see examples of your work?",
      a:
        "There are 248 photographs across 14 documented jobs in " +
        "<a href='index.html#projects'>Where We’ve Built</a>. Click any pin " +
        "on the map, or any photograph, to open that job.",
    },
    {
      id: "reviews",
      k: "review reviews google rating rated stars reputation trust trusted recommend testimonials feedback",
      q: "What do your reviews say?",
      a:
        "We hold a 4.9 rating on Google across 11 public reviews. All of " +
        "them are in the <a href='index.html#reviews'>reviews section</a>, " +
        "unedited.",
    },
    {
      id: "services",
      k: "service services build builds building do offer offering capabilities work types renovation renovations remodel remodeling construction general contractor",
      q: "What do you build?",
      a:
        "Ground-up new homes, additions, whole-home renovations, basement " +
        "build-outs, concrete and foundation work, framing and structural " +
        "carpentry, bathroom and interior remodels, repairs and property " +
        "maintenance, and institutional or public-bid work. " +
        "<a href='index.html#capabilities'>What We Build</a> shows each one " +
        "on a real job.",
    },
    {
      id: "newhomes",
      k: "new home homes house houses ground up custom build lot land",
      q: "Do you build new homes?",
      a:
        "Yes, ground-up new construction is core work for us. The " +
        "<a href='index.html#process'>How We Build</a> section walks a real " +
        "PSI build from filed plans to keys, stage by stage.",
    },
    {
      id: "additions",
      k: "addition additions extension extend expand add room second story",
      q: "Do you build additions?",
      a:
        "Yes. Additions and whole-home renovations are listed in " +
        "<a href='index.html#capabilities'>What We Build</a>, with " +
        "photographs from documented jobs behind each one.",
    },
    {
      id: "bathrooms",
      k: "bathroom bathrooms bath shower tub tile vanity interior remodel kitchen kitchens basement basements finish finished",
      q: "Do you do bathrooms, kitchens, and basements?",
      a:
        "Bathroom and interior remodels and basement build-outs are both " +
        "core services. Interior work rides on the same crew and the same " +
        "management as our structural jobs.",
    },
    {
      id: "concrete",
      k: "concrete foundation foundations footing footers slab excavation dig digging masonry structural framing carpentry frame",
      q: "Do you do concrete and structural work?",
      a:
        "Yes: concrete and foundation work, and framing and structural " +
        "carpentry, with our own crew. The " +
        "<a href='index.html#process'>How We Build</a> sequence shows the " +
        "excavation, footings, foundation, and framing stages on a real job.",
    },
    {
      id: "repairs",
      k: "repair repairs fix fixes maintenance maintain small handyman drywall flooring doors hardware plumbing electrical",
      q: "Do you take small repairs and maintenance?",
      a:
        "Yes. Repairs and property maintenance are a listed service: " +
        "plumbing and electrical repairs, drywall and finish work, flooring, " +
        "doors and hardware, and carpentry.",
    },
    {
      id: "process",
      k: "process how steps stages sequence plan planning excavation foundation framing roof windows finish keys built stage",
      q: "What does your process look like?",
      a:
        "The <a href='index.html#process'>How We Build</a> section walks a " +
        "real PSI project from filed plans through excavation, foundation, " +
        "framing, dry-in, and finish to keys. Scroll through it and you see " +
        "the house go up stage by stage.",
    },
    {
      id: "contact",
      k: "hours open call phone number reach contact email office address visit talk person speak text",
      q: "How do I reach you?",
      a:
        "Call or text " +
        PHONE_HTML +
        ", or email " +
        EMAIL_HTML +
        ". The " +
        "office is at 190 Wyoming St, Wilkes-Barre, PA 18705, with visits " +
        "available upon request.",
    },
  ];

  const FALLBACK =
    "That one deserves a person, and I only repeat what this site can back " +
    "up. Call " +
    PHONE_HTML +
    " or use the " +
    "<a href='contact.html'>quote form</a> and we will come back with a " +
    "real answer.";

  const GREETING =
    "Hello. Ask about our work, our process, or getting a quote.";

  /* ---------------- retrieval engine ---------------- */
  const SYN = {
    price: "cost",
    prices: "cost",
    pricing: "cost",
    expensive: "cost",
    cheap: "cost",
    charge: "cost",
    fee: "cost",
    fees: "cost",
    estimate: "quote",
    estimates: "quote",
    proposal: "quote",
    bathrooms: "bathroom",
    kitchens: "kitchen",
    basements: "basement",
    remodeling: "remodel",
    remodelling: "remodel",
    reno: "renovation",
    renos: "renovation",
    renovate: "renovation",
    pics: "photo",
    pix: "photo",
    images: "photo",
    image: "photo",
    contractor: "services",
    contractors: "services",
    guys: "crew",
    team: "crew",
    crew: "updates",
    timeline: "updates",
    schedule: "updates",
    long: "updates",
    rating: "review",
    ratings: "review",
    stars: "review",
    wilkesbarre: "wilkes",
    "wilkes-barre": "wilkes",
  };
  const STOP = new Set(
    (
      "a an the and or but if so of to in on at for with do does did you your " +
      "yours we our us i me my is are was were be been it its this that what " +
      "which who whom how when where why can could would should will shall " +
      "may might must have has had get got about there here they them then " +
      "than any some all no not dont cant wont am"
    ).split(" "),
  );
  const stem = (w) =>
    w.length > 4
      ? w.replace(/(ings?|ers?|ies|ied|ily|ations?|s)$/, "")
      : w.replace(/s$/, "");

  function tokens(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w))
      .map((w) => SYN[w] || w)
      .map(stem);
  }

  /* Each entry's index is built once: term -> weight. Terms from the
     canonical question weigh more than the broad retrieval terms. */
  const INDEX = KB.map((e) => {
    const w = new Map();
    tokens(e.k).forEach((t) => w.set(t, Math.max(w.get(t) || 0, 1)));
    tokens(e.q).forEach((t) => w.set(t, 3));
    return { e, w };
  });

  function retrieve(text) {
    const qs = tokens(text);
    if (!qs.length) return [];
    const scored = INDEX.map(({ e, w }) => {
      let score = 0,
        hits = 0;
      for (const t of new Set(qs)) {
        if (w.has(t)) {
          score += w.get(t);
          hits += 1;
        } else {
          for (const k of w.keys()) {
            if (
              k.length > 3 &&
              t.length > 3 &&
              (k.startsWith(t) || t.startsWith(k))
            ) {
              score += 0.5;
              hits += 0.5;
              break;
            }
          }
        }
      }
      // phrase bonus: the canonical question nearly contained in the ask
      const qq = tokens(e.q);
      const contained = qq.filter((t) => qs.includes(t)).length;
      if (qq.length && contained / qq.length > 0.7) score += 4;
      return { e, score, hits };
    })
      .filter((r) => r.score >= 2 || (r.score >= 1 && qs.length <= 4))
      .sort((a, b) => b.score - a.score);
    return scored;
  }

  /* Compound questions: split on connectors and answer each part. */
  function answerParts(text) {
    const parts = text
      .split(/\?|(?:\band\b(?=\s+(?:do|does|can|how|what|where|is|are)))/i)
      .map((p) => p && p.trim())
      .filter((p) => p && p.length > 3);
    const seen = new Set();
    const hits = [];
    for (const p of parts.length ? parts : [text]) {
      const r = retrieve(p);
      if (r.length && !seen.has(r[0].e.id)) {
        seen.add(r[0].e.id);
        hits.push(r[0]);
      }
      if (hits.length === 2) break;
    }
    if (!hits.length) {
      const r = retrieve(text);
      if (r.length) hits.push(r[0]);
    }
    return hits;
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- persistence ---------------- */
  const loadState = () => {
    try {
      return JSON.parse(sessionStorage.getItem(STORE)) || {};
    } catch (e) {
      return {};
    }
  };
  const state = Object.assign({ msgs: [] }, loadState());
  const save = () => {
    try {
      sessionStorage.setItem(
        STORE,
        JSON.stringify({ msgs: state.msgs.slice(-40) }),
      );
    } catch (e) {
      /* private mode: works, just forgets */
    }
  };

  /* ---------------- widget ---------------- */
  const root = document.createElement("div");
  root.className = "sbot";
  root.innerHTML = `
    <button class="sbot__fab" type="button" aria-expanded="false"
      aria-controls="sbotPanel" aria-label="Questions? Ask PSI">
      <img src="assets/logo/psi-logo.png" alt="" />
    </button>
    <section class="sbot__panel" id="sbotPanel" role="dialog" aria-modal="false"
      aria-label="PSI support assistant" hidden>
      <header class="sbot__head">
        <p class="sbot__eyebrow">Support</p>
        <p class="sbot__title">Ask PSI</p>
        <div class="sbot__tools">
          <button class="sbot__close" type="button" aria-label="Close">&times;</button>
        </div>
      </header>
      <div class="sbot__log" role="log" aria-live="polite"></div>
      <div class="sbot__chips"></div>
      <form class="sbot__form">
        <input class="sbot__input" type="text" autocomplete="off" maxlength="240"
          placeholder="Type a question…" aria-label="Type a question" />
        <button class="sbot__send" type="submit">Ask</button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const fab = root.querySelector(".sbot__fab");
  const panel = root.querySelector(".sbot__panel");
  const log = root.querySelector(".sbot__log");
  const chips = root.querySelector(".sbot__chips");
  const form = root.querySelector(".sbot__form");
  const input = root.querySelector(".sbot__input");

  function bubble(m) {
    const b = document.createElement("div");
    b.className = "sbot__msg sbot__msg--" + m.who;
    b.innerHTML = m.html;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  }

  function record(html, who) {
    const m = { html, who, ts: Date.now() };
    state.msgs.push(m);
    save();
    bubble(m);
  }

  function reply(html, thenChips) {
    const delay = reduce.matches ? 0 : Math.min(1400, 350 + html.length * 2.5);
    if (delay) {
      const t = document.createElement("div");
      t.className = "sbot__msg sbot__msg--psi sbot__typing";
      t.innerHTML = "<i></i><i></i><i></i>";
      log.appendChild(t);
      log.scrollTop = log.scrollHeight;
      setTimeout(() => {
        t.remove();
        record(html, "psi");
        if (thenChips) renderChips(thenChips);
      }, delay);
    } else {
      record(html, "psi");
      if (thenChips) renderChips(thenChips);
    }
  }

  function renderChips(ids) {
    chips.innerHTML = "";
    const list = ids
      ? KB.filter((t) => ids.includes(t.id))
      : [KB[1], KB[9], KB[0]];
    list.slice(0, 3).forEach((t) => {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "sbot__chip";
      c.textContent = t.q;
      c.addEventListener("click", () => ask(t.q));
      chips.appendChild(c);
    });
    const call = document.createElement("a");
    call.className = "sbot__chip sbot__chip--call";
    call.href = "tel:5703388774";
    call.textContent = "Call 570-338-8PSI";
    chips.appendChild(call);
  }

  function suggestions(usedIds) {
    return KB.filter((t) => !usedIds.includes(t.id))
      .slice(0, 6)
      .sort(() => 0)
      .map((t) => t.id)
      .slice(0, 3);
  }

  function ask(text) {
    record(text.replace(/</g, "&lt;"), "you");
    const exact = KB.find((t) => t.q === text);
    const hits = exact ? [{ e: exact }] : answerParts(text);
    const money = /\b(cost|price|much|afford|budget|charge)/i.test(text);
    if (money && !hits.some((h) => h.e.id === "quote") && hits.length < 2) {
      hits.push({ e: KB.find((t) => t.id === "quote") });
    }
    if (hits.length) {
      const html = hits.map((h) => h.e.a).join("<hr class='sbot__hr'>");
      reply(html, suggestions(hits.map((h) => h.e.id)));
    } else {
      reply(FALLBACK, ["quote", "contact", "examples"]);
    }
  }

  /* ---------------- open/close with a focus trap ---------------- */
  let open = false;
  const focusables = () =>
    [...panel.querySelectorAll("button, a, input")].filter(
      (e) => e.offsetParent !== null,
    );

  const setOpen = (next) => {
    open = next;
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    root.classList.toggle("sbot--open", open);
    if (open) {
      if (!log.children.length) {
        if (state.msgs.length) {
          state.msgs.forEach(bubble);
          renderChips();
        } else {
          reply(GREETING, null);
          renderChips();
        }
      }
      input.focus({ preventScroll: true });
    } else {
      fab.focus({ preventScroll: true });
    }
  };

  fab.addEventListener("click", () => setOpen(!open));
  root
    .querySelector(".sbot__close")
    .addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "Tab") {
      const f = focusables();
      if (!f.length) return;
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    ask(v);
  });
})();
