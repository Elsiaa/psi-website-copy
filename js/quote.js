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
    qIndex: 0,
    answers: [], // [{q, a}]
    keyed: {}, // answers by question id (for skip logic)
    intake: {},
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
    if (state.stage === "gateway") return renderGateway();
    if (state.stage === "flow") return renderQuestion();
    if (state.stage === "intake") return renderIntake();
    if (state.stage === "done") return renderDone();
  }

  function progressBlock(stepNum, total, label) {
    const wrap = el("div", "quote__progress");
    const lab = el("div", "quote__progress-label");
    lab.textContent = label || `Question ${stepNum} of ${total}`;
    const bar = el("div", "quote__progress-bar");
    const fill = el("div", "quote__progress-fill");
    fill.style.width = Math.round((stepNum / total) * 100) + "%";
    bar.appendChild(fill);
    wrap.append(lab, bar);
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
    root.appendChild(progressBlock(0, 1, "Let's scope your project"));
    root.appendChild(el("h3", "quote__q", DATA.gateway.q));
    root.appendChild(
      optionButtons(
        DATA.gateway.options.map((o) => o.label),
        (label) => {
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
          }
          render();
        },
      ),
    );
  }

  // ---------------- Flow questions ----------------
  function renderQuestion() {
    const qs = activeQuestions();
    if (state.qIndex >= qs.length) {
      state.stage = "intake";
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
  function renderIntake() {
    const total = totalSteps();
    root.appendChild(
      progressBlock(
        total,
        total,
        state.flowKey
          ? `Last step — Question ${total} of ${total}`
          : "Last step — how do we reach you?",
      ),
    );
    root.appendChild(el("h3", "quote__q", "Almost done — contact details"));

    const form = el("form", "quote__form");
    DATA.intake.forEach((f) => {
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
      field.appendChild(input);
      form.appendChild(field);
    });

    const controls = el("div", "quote__controls");
    controls.appendChild(
      backButton(() => {
        if (state.flowKey) {
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
    const submit = el("button", "btn", "Review & Send Request");
    submit.type = "submit";
    controls.appendChild(submit);
    form.appendChild(controls);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      DATA.intake.forEach((f) => {
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
      state.stage = "done";
      render();
    });

    root.appendChild(form);
  }

  // ---------------- Summary + send ----------------
  function buildSummary() {
    const flow = state.flowKey ? DATA.flows[state.flowKey] : null;
    const lines = [];
    lines.push("PSI CONSTRUCTION — QUOTE REQUEST");
    lines.push("Project type: " + (flow ? flow.title : state.gatewayChoice));
    lines.push("");
    lines.push("— Project details —");
    state.answers.forEach((a) => lines.push(a.q + "\n  → " + a.a));
    lines.push("");
    lines.push("— Contact —");
    const labels = {
      name: "Full name",
      email: "Email",
      phone: "Phone",
      contactMethod: "Preferred contact",
      address: "Project address",
      bestTime: "Best time to reach",
      heard: "How they heard about PSI",
      notes: "Notes",
      photos: "Photos to attach",
    };
    Object.keys(labels).forEach((k) => {
      if (state.intake[k]) lines.push(labels[k] + ": " + state.intake[k]);
    });
    return lines.join("\n");
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
        render();
      }),
    );

    const btns = el("div");
    btns.style.display = "flex";
    btns.style.gap = "10px";
    const copyBtn = el("button", "btn btn--ghost", "Copy Summary");
    copyBtn.type = "button";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(summary).then(() => {
        copyBtn.textContent = "Copied ✓";
      });
    });
    const send = el("a", "btn", "Send to PSI");
    send.href =
      "mailto:info@psiconstructionpa.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(summary);
    btns.append(copyBtn, send);
    controls.appendChild(btns);
    root.appendChild(controls);
  }

  render();
})();
