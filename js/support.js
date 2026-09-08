/* ============================================================
   PSI support assistant
   Self-contained: every answer is drawn from copy already on
   this site (the FAQ, services, and contact details). Anything
   it cannot answer is routed to the phone or the quote form,
   never guessed. No network, no third-party script.
   ============================================================ */
(() => {
  "use strict";

  const PHONE_HTML =
    '<a href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a>';

  // Answers mirror the FAQ section verbatim; keywords route to them.
  const TOPICS = [
    {
      k: /area|where|town|kingston|wilkes|pittston|exeter|serve|located|far/i,
      q: "What areas do you work in?",
      a:
        "Our office is at 190 Wyoming Street in Wilkes-Barre, and most of our " +
        "jobs are in Kingston, Wilkes-Barre, West Pittston, Exeter, and the " +
        "surrounding Luzerne County towns. If you are just outside that, call " +
        "and we will tell you straight whether we are the right fit.",
    },
    {
      k: /quote|estimate|price|cost|how much|consult/i,
      q: "How do I get a quote?",
      a:
        "Two ways. Run through the <a href='contact.html'>quote request</a> " +
        "and answer a few multiple-choice questions, every one of which has a " +
        "“not sure yet” option, and we turn up already knowing the " +
        "job. Or call " +
        PHONE_HTML +
        ". The consultation is free.",
    },
    {
      k: /landlord|property manager|rental|tenant|turnover|portfolio|maintenance|repair/i,
      q: "Do you work for landlords and property managers?",
      a:
        "Yes. Turnovers between tenants, plumbing and electrical repairs, " +
        "drywall and finish work, flooring, doors and hardware, carpentry, " +
        "and the recurring items that keep a building in shape and in " +
        "compliance.",
    },
    {
      k: /permit|inspect|township|code|paperwork/i,
      q: "Do you handle permits and inspections?",
      a:
        "Yes. We pull the permits and deal with the township and the " +
        "inspectors, so you are not chasing paperwork while the job is " +
        "running.",
    },
    {
      k: /architect|engineer|design|plans|drawing/i,
      q: "Do you work with architects and engineers?",
      a:
        "Depending on the job we use our own people plus outside engineers, " +
        "architects, and designers. We work out where professional design " +
        "actually earns its cost and price those services competitively, " +
        "rather than running up design fees.",
    },
    {
      k: /public|bid|pennbid|municipal|county|institution|prevailing/i,
      q: "Do you bid public and institutional work?",
      a:
        "Yes, including projects issued through PennBid, county and municipal " +
        "vendor lists, and architect-managed bid lists. Prevailing wage and " +
        "documentation compliance are handled as part of the job where they " +
        "apply.",
    },
    {
      k: /progress|update|happening|communicat|status|track/i,
      q: "How will I know what is happening on my job?",
      a:
        "You get one point of responsibility from planning through the final " +
        "walkthrough. Behind that, we run software we built ourselves that " +
        "tracks progress, open items, and documentation, so the crew and the " +
        "office see the same picture. It costs you nothing extra.",
    },
    {
      k: /photo|picture|example|portfolio|previous|project|work you|gallery|review/i,
      q: "Can I see examples of your work?",
      a:
        "There are 248 photographs across 14 documented jobs in the " +
        "<a href='index.html#projects'>Where We’ve Built</a> section. " +
        "Click any pin on the map or any photograph to open that job. Our " +
        "<a href='index.html#reviews'>Google reviews</a> are public as well.",
    },
    {
      k: /service|build|bathroom|kitchen|basement|addition|renovat|concrete|foundation|framing|new home|commercial/i,
      q: "What do you build?",
      a:
        "Ground-up new homes, additions, whole-home renovations, basement " +
        "build-outs, concrete and foundation work, framing and structural " +
        "carpentry, bathroom and interior remodels, repairs and property " +
        "maintenance, and institutional or public-bid work. The " +
        "<a href='index.html#capabilities'>What We Build</a> section shows " +
        "each one on a real job.",
    },
    {
      k: /hour|open|call|phone|number|reach|contact|email/i,
      q: "How do I reach you?",
      a:
        "Call or text " +
        PHONE_HTML +
        ", or email " +
        "<a href='mailto:info@psiconstructionpa.com'>info@psiconstructionpa.com</a>. " +
        "The office is at 190 Wyoming St, Wilkes-Barre, PA 18705, with visits " +
        "available upon request.",
    },
  ];

  const FALLBACK =
    "That one deserves a person. Call " +
    PHONE_HTML +
    " or use the " +
    "<a href='contact.html'>quote form</a> and we will come back to you " +
    "with a real answer.";

  /* ---------- widget ---------- */
  const root = document.createElement("div");
  root.className = "sbot";
  root.innerHTML = `
    <button class="sbot__fab" type="button" aria-expanded="false"
      aria-controls="sbotPanel" aria-label="Questions? Ask PSI">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8.4L4 21V6a2 2 0 0 1 2-2z" transform="translate(-2 -1)"/></svg>
    </button>
    <section class="sbot__panel" id="sbotPanel" role="dialog"
      aria-label="PSI support assistant" hidden>
      <header class="sbot__head">
        <p class="sbot__title">Questions? Ask PSI</p>
        <p class="sbot__sub">Answers come from this site. Anything else, we point you to a person.</p>
        <button class="sbot__close" type="button" aria-label="Close">&times;</button>
      </header>
      <div class="sbot__log" aria-live="polite"></div>
      <div class="sbot__chips"></div>
      <form class="sbot__form">
        <input class="sbot__input" type="text" autocomplete="off"
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

  const say = (html, who) => {
    const b = document.createElement("div");
    b.className = "sbot__msg sbot__msg--" + who;
    b.innerHTML = html;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  };

  const renderChips = () => {
    chips.innerHTML = "";
    TOPICS.slice(0, 4).forEach((t) => {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "sbot__chip";
      c.textContent = t.q;
      c.addEventListener("click", () => answer(t.q));
      chips.appendChild(c);
    });
    const call = document.createElement("a");
    call.className = "sbot__chip sbot__chip--call";
    call.href = "tel:5703388774";
    call.textContent = "Call 570-338-8PSI";
    chips.appendChild(call);
  };

  function answer(text) {
    say(text.replace(/</g, "&lt;"), "you");
    const hit =
      TOPICS.find((t) => t.q === text) || TOPICS.find((t) => t.k.test(text));
    say(hit ? hit.a : FALLBACK, "psi");
  }

  let open = false;
  const setOpen = (next) => {
    open = next;
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    root.classList.toggle("sbot--open", open);
    if (open) {
      if (!log.children.length) {
        say(
          "Hello. Ask about our work, our process, or getting a quote — " +
            "or tap a question below.",
          "psi",
        );
        renderChips();
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
    if (e.key === "Escape" && open) setOpen(false);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    answer(v);
  });
})();
