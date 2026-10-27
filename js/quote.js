/* ============================================================
   PSI Quote Request Questionnaire — engine
   Guided, branching, multiple-choice flow per the provided spec:
   - Q0 project-type gateway routes into one of 10 flows
   - "Other / Need guidance" always available as a fallback
   - Visual progress bar ("Question X of Y")
   - Skip logic (e.g., no shower-niche question for tub-only)
   - Universal intake block at the end of every flow
   - Compiles all answers into a single intake email
   ============================================================ */
(() => {
  "use strict";
  const DATA = window.PSI_QUOTE;
  const root = document.getElementById("quoteApp");
  if (!root || !DATA) return;

  const state = {
    stage: "gateway", // gateway | flow | intake | done
    flowKey: null,
    gatewayChoice: null,
    group: null, // the category chosen on the first gateway step
    qIndex: 0,
    answers: [], // [{q, a}]
    keyed: {}, // answers by question id (for skip logic)
    intake: {},
    intakeStep: 0,
  };

  function activeQuestions() {
    const flow = DATA.flows[state.flowKey];
    if (!flow) return [];
    return flow.questions.filter((q) => !(q.skipIf && q.skipIf(state.keyed)));
  }

  function totalSteps() {
    // questions in the active flow + 1 intake step
    return (state.flowKey ? activeQuestions().length : 0) + 1;
  }

  function render() {
    root.innerHTML = "";
    const stages = {
      gateway: renderGateway,
      flow: renderQuestion,
      intake: renderIntake,
      done: renderDone,
    };
    (stages[state.stage] || renderGateway)();
    save();
  }

  // ---------------- Saving where you got to ----------------
  // Every render is written down, so closing the tab, or coming here
  // from a card on the home page, picks up at the same question. A
  // sent request clears it: the next visit starts fresh.
  const STORE = "psi-quote-progress";
  function save() {
    try {
      if (state.stage === "done") return localStorage.removeItem(STORE);
      localStorage.setItem(
        STORE,
        JSON.stringify({
          stage: state.stage,
          flowKey: state.flowKey,
          gatewayChoice: state.gatewayChoice,
          group: state.group ? state.group.label : null,
          qIndex: state.qIndex,
          answers: state.answers,
          keyed: state.keyed,
          intake: state.intake,
          intakeStep: state.intakeStep,
        }),
      );
    } catch (e) {
      /* private mode: it just will not remember */
    }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || !d.stage || d.stage === "done") return false;
      if (d.flowKey && !DATA.flows[d.flowKey]) return false;
      Object.assign(state, {
        stage: d.stage,
        flowKey: d.flowKey || null,
        gatewayChoice: d.gatewayChoice || null,
        group:
          (DATA.gateway.groups || []).find((g) => g.label === d.group) || null,
        qIndex: d.qIndex || 0,
        answers: Array.isArray(d.answers) ? d.answers : [],
        keyed: d.keyed || {},
        intake: d.intake || {},
        intakeStep: d.intakeStep || 0,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
  function reset() {
    Object.assign(state, {
      stage: "gateway",
      flowKey: null,
      gatewayChoice: null,
      group: null,
      qIndex: 0,
      answers: [],
      keyed: {},
      intake: {},
      intakeStep: 0,
    });
    render();
  }

  // ---------------- Starting from somewhere else ----------------
  // A service card hands over its job: the gateway is answered with
  // the card's own label and the matching flow opens at question one.
  // A card with no flow of its own goes to the intake with the label.
  function startWith(label, flowKey) {
    const flow = flowKey && DATA.flows[flowKey] ? flowKey : null;
    Object.assign(state, {
      stage: flow ? "flow" : "intake",
      flowKey: flow,
      gatewayChoice: label,
      group: null,
      qIndex: 0,
      answers: [{ q: DATA.gateway.q, a: label }],
      keyed: {},
      intake: state.intake || {},
      intakeStep: 0,
    });
    render();
  }
  window.PSI_QUOTE_START = startWith;
  // the service cards' Get a quote buttons link to #quote and carry the
  // job; the link still scrolls there on its own
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-job]");
    if (!a) return;
    startWith(a.dataset.job, a.dataset.flow || null);
  });

  function progressBlock(stepNum, total, label) {
    const wrap = el("div", "quote__progress");
    const lab = el("div", "quote__progress-label");
    lab.textContent = label || `Question ${stepNum} of ${total}`;
    const bar = el("div", "quote__progress-bar");
    const fill = el("div", "quote__progress-fill");
    fill.style.width = Math.round((stepNum / total) * 100) + "%";
    bar.appendChild(fill);
    wrap.append(lab, bar);
    if (state.stage !== "gateway" || state.group) {
      const again = el("button", "quote__restart", "Start over");
      again.type = "button";
      again.addEventListener("click", reset);
      wrap.appendChild(again);
    }
    return wrap;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function optionButtons(options, onPick) {
    const list = el("div", "quote__opts");
    options.forEach((label) => {
      const b = el("button", "quote__opt", label);
      b.type = "button";
      b.addEventListener("click", () => onPick(label));
      list.appendChild(b);
    });
    return list;
  }

  function backButton(handler) {
    const b = el("button", "quote__back", "← Back");
    b.type = "button";
    b.addEventListener("click", handler);
    return b;
  }

  // ---------------- Gateway (Q0) ----------------
  function renderGateway() {
    const groups = DATA.gateway.groups || [];
    const pick = (label) => {
      const opt = DATA.gateway.options.find((o) => o.label === label);
      state.gatewayChoice = label;
      state.answers = [{ q: DATA.gateway.q, a: label }];
      state.keyed = {};
      state.qIndex = 0;
      if (opt && opt.flow) {
        state.flowKey = opt.flow;
        state.stage = "flow";
      } else {
        // "Multiple of the above" / "Not sure yet" — straight to intake
        state.flowKey = null;
        state.stage = "intake";
        state.intakeStep = 0;
      }
      render();
    };

    // Step one: a category. Twelve answers at once was a wall; five
    // doors is a choice. A category holding a single job opens it
    // directly, and never becomes the "group" to come back to, so
    // Back out of its first question lands on the categories again.
    if (!state.group) {
      root.appendChild(progressBlock(0, 1, "Let's scope your project"));
      root.appendChild(el("h3", "quote__q", DATA.gateway.q));
      const list = el("div", "quote__opts");
      groups.forEach((g) => {
        const b = el("button", "quote__opt quote__opt--group");
        b.type = "button";
        b.appendChild(el("span", "quote__opt-label", g.label));
        if (g.hint) b.appendChild(el("span", "quote__opt-hint", g.hint));
        b.addEventListener("click", () => {
          if (g.options.length === 1) return pick(g.options[0]);
          state.group = g;
          render();
        });
        list.appendChild(b);
      });
      root.appendChild(list);
      return;
    }

    // Step two: the specific job inside that category.
    root.appendChild(progressBlock(0, 1, state.group.label));
    root.appendChild(el("h3", "quote__q", "Which of these is closest?"));
    root.appendChild(optionButtons(state.group.options, pick));
    const controls = el("div", "quote__controls");
    controls.appendChild(
      backButton(() => {
        state.group = null;
        render();
      }),
    );
    root.appendChild(controls);
  }

  // ---------------- Flow questions ----------------
  function renderQuestion() {
    const qs = activeQuestions();
    if (state.qIndex >= qs.length) {
      state.stage = "intake";
      state.intakeStep = 0;
      return render();
    }
    const q = qs[state.qIndex];
    const total = totalSteps();

    root.appendChild(progressBlock(state.qIndex + 1, total));
    root.appendChild(el("h3", "quote__q", q.q));
    if (q.note) root.appendChild(el("p", "quote__note", "(" + q.note + ")"));

    const opts = q.opts.concat(
      q.opts.includes(DATA.fallbackOption) ? [] : [DATA.fallbackOption],
    );
    root.appendChild(
      optionButtons(opts, (label) => {
        state.answers.push({ q: q.q, a: label });
        if (q.id) state.keyed[q.id] = label;
        state.qIndex++;
        render();
      }),
    );

    const controls = el("div", "quote__controls");
    controls.appendChild(
      backButton(() => {
        if (state.qIndex === 0) {
          state.stage = "gateway";
          state.answers = [];
          state.keyed = {};
        } else {
          state.qIndex--;
          const removed = state.answers.pop();
          const prevQ = qs[state.qIndex];
          if (prevQ && prevQ.id) delete state.keyed[prevQ.id];
          void removed;
        }
        render();
      }),
    );
    root.appendChild(controls);
  }

  // ---------------- Universal intake block ----------------
  // The contact details come in four short steps -- one thing to do
  // per screen -- instead of nine fields on one scroll. Any field the
  // data adds later that no step names lands on the last one.
  const INTAKE_STEPS = [
    { title: "Who should we ask for?", keys: ["name"] },
    {
      title: "How do we reach you?",
      keys: ["phone", "email", "contactMethod", "bestTime"],
    },
    { title: "Where is the project?", keys: ["address"] },
    { title: "Anything else?", keys: [] },
  ];
  function intakeSteps() {
    const named = new Set(INTAKE_STEPS.flatMap((st) => st.keys));
    const rest = DATA.intake.map((f) => f.key).filter((k) => !named.has(k));
    return INTAKE_STEPS.map((st, i) =>
      i === INTAKE_STEPS.length - 1
        ? { ...st, keys: st.keys.concat(rest) }
        : st,
    ).filter((st) => st.keys.some((k) => DATA.intake.some((f) => f.key === k)));
  }

  function renderIntake() {
    const steps = intakeSteps();
    state.intakeStep = Math.max(
      0,
      Math.min(steps.length - 1, state.intakeStep),
    );
    const step = steps[state.intakeStep];
    const last = state.intakeStep === steps.length - 1;
    const total = totalSteps();
    root.appendChild(
      progressBlock(
        total,
        total,
        `Last step ${state.intakeStep + 1} of ${steps.length}`,
      ),
    );
    root.appendChild(el("h3", "quote__q", step.title));

    const form = el("form", "quote__form");
    const fields = step.keys
      .map((k) => DATA.intake.find((f) => f.key === k))
      .filter(Boolean);
    fields.forEach((f) => {
      const field = el("div", "quote__field");
      const label = el("label", null, f.label + (f.required ? " *" : ""));
      label.setAttribute("for", "qf_" + f.key);
      field.appendChild(label);
      let input;
      if (f.type === "select") {
        input = document.createElement("select");
        f.opts.forEach((o) => {
          const op = document.createElement("option");
          op.value = op.textContent = o;
          input.appendChild(op);
        });
      } else if (f.type === "textarea") {
        input = document.createElement("textarea");
      } else {
        input = document.createElement("input");
        input.type = f.type;
        if (f.type === "file") {
          input.multiple = true;
          input.accept = "image/*";
        }
      }
      input.id = "qf_" + f.key;
      if (f.required) input.required = true;
      if (f.type !== "file" && state.intake[f.key] != null) {
        input.value = state.intake[f.key];
      }
      if (f.type !== "file") {
        input.addEventListener("input", () => {
          state.intake[f.key] = input.value;
          save();
        });
      }
      field.appendChild(input);
      form.appendChild(field);
    });

    const controls = el("div", "quote__controls");
    controls.appendChild(
      backButton(() => {
        if (state.intakeStep > 0) {
          state.intakeStep--;
        } else if (state.flowKey) {
          state.stage = "flow";
          state.qIndex = Math.max(0, activeQuestions().length - 1);
          state.answers.pop();
        } else {
          state.stage = "gateway";
          state.answers = [];
        }
        render();
      }),
    );
    const next = el(
      "button",
      "btn btn--accent",
      last ? "Review & send request" : "Next",
    );
    next.type = "submit";
    controls.appendChild(next);
    form.appendChild(controls);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      fields.forEach((f) => {
        const input = document.getElementById("qf_" + f.key);
        if (!input) return;
        if (f.type === "file") {
          state.intake[f.key] = Array.from(input.files || [])
            .map((x) => x.name)
            .join(", ");
        } else {
          state.intake[f.key] = input.value.trim();
        }
      });
      if (last) {
        state.stage = "done";
      } else {
        state.intakeStep++;
      }
      render();
    });

    root.appendChild(form);
    // the first field is the thing to do on this screen
    const first = form.querySelector("input, select, textarea");
    if (first && first.type !== "file") first.focus({ preventScroll: true });
  }

  function renderDone() {
    const summary = buildSummary();
    const flow = state.flowKey ? DATA.flows[state.flowKey] : null;
    const subject =
      "Quote Request — " +
      (flow ? flow.title : state.gatewayChoice) +
      (state.intake.name ? " — " + state.intake.name : "");

    const done = el("div", "quote__done");
    done.appendChild(el("h3", null, "Here's your request"));
    const p = el("p", "body-copy");
    p.style.margin = "0 auto 18px";
    p.textContent =
      "Review the summary below, then send it to us. Your email app will open pre-filled" +
      (state.intake.photos
        ? " — please attach your selected photos before sending."
        : ".");
    done.appendChild(p);
    root.appendChild(done);

    const pre = el("div", "quote__summary");
    pre.textContent = summary;
    root.appendChild(pre);

    const controls = el("div", "quote__controls");
    controls.appendChild(
      backButton(() => {
        state.stage = "intake";
        state.intakeStep = intakeSteps().length - 1;
        render();
      }),
    );

    const btns = el("div");
    btns.style.display = "flex";
    btns.style.gap = "10px";
    btns.style.flexWrap = "wrap";
    const copyBtn = el("button", "btn btn--ghost", "Copy summary");
    copyBtn.type = "button";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(summary).then(() => {
        copyBtn.textContent = "Copied ✓";
      });
    });
    const send = el("a", "btn btn--accent", "Send to PSI");
    send.href =
      "mailto:info@psiconstructionpa.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(summary);
    btns.append(copyBtn, send);
    controls.appendChild(btns);
    root.appendChild(controls);
  }

  const params = new URLSearchParams(location.search);
  if (params.get("flow") || params.get("job")) {
    startWith(params.get("job") || params.get("flow"), params.get("flow"));
  } else {
    load();
    render();
  }
})();
