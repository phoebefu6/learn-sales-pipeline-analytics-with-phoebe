/* spa-bench.js - the pipeline widgets. Renders into any element with class "spa-widget":
 *   data-mode="snapshot"    Analyst session 1, rebuild a weekly snapshot from a stage-history log
 *   data-mode="conversion"  Analyst session 2, cohort-based vs period-based conversion (real rows)
 *   data-mode="cycle"       Analyst session 3, cycle-time distribution and the censored curve (real rows)
 *   data-mode="methods"     Analyst session 4, three forecast methods on one quarter
 *   data-mode="accuracy"    Analyst session 5, 20 replays: bias, error, coverage, per rep
 *   data-mode="bench"       Analyst session 6, the forecast honesty bench (rungs, happy ears, whale)
 * Every number is computed by spa-live.js when the page loads or a control changes. */
(function () {
  "use strict";
  var S, L;
  var NAMES = { rep: "Rep commit", stage: "Stage-weighted", hist: "History-based" };
  var REAL = "real Olist B2B funnel rows (Brazilian marketplace seller acquisition) standing in for Kettle's history";

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function rd(x, k) { return Math.floor(x * k + 0.5) / k; }
  function my(x) { return rd(x / 1e6, 100).toFixed(2); }
  function pc(x) { return rd(x * 100, 10).toFixed(1) + "%"; }
  function sg(x, f) { return (x > 0 ? "+" : x < 0 ? "-" : "") + f(Math.abs(x)); }
  function kind(parent, real, text) {
    var p = el("p", "spa-honesty");
    p.appendChild(el("span", "spa-kind " + (real ? "is-real" : "is-constructed"), real ? "real rows" : "constructed"));
    p.appendChild(document.createTextNode(text)); parent.appendChild(p); return p;
  }
  function both(parent, text) {
    var p = el("p", "spa-honesty");
    p.appendChild(el("span", "spa-kind is-real", "real rows"));
    p.appendChild(el("span", "spa-kind is-constructed", "constructed"));
    p.appendChild(document.createTextNode(text)); parent.appendChild(p); return p;
  }
  function table(head, rows, opts) {
    var w = el("div", "mk-tablewrap"), t = el("table", "mk-table spa-table");
    if (opts && opts.narrow) t.style.minWidth = "30rem";
    var tr = el("tr"); head.forEach(function (h) { tr.appendChild(el("th", null, h)); }); var th = el("thead"); th.appendChild(tr); t.appendChild(th);
    var tb = el("tbody");
    rows.forEach(function (r) {
      var row = el("tr", r.cls || null);
      r.cells.forEach(function (c) { var td = el("td", c && c.cls ? c.cls : null, c && c.t != null ? c.t : c); row.appendChild(td); });
      tb.appendChild(row);
    });
    t.appendChild(tb); w.appendChild(t); return w;
  }
  function check(parent, label, onChange) {
    var lab = el("label", "mb-ctl"), inp = document.createElement("input"); inp.type = "checkbox";
    inp.setAttribute("aria-label", label);
    inp.addEventListener("change", function () { onChange(inp.checked); });
    lab.appendChild(inp); lab.appendChild(document.createTextNode(label)); parent.appendChild(lab); return inp;
  }
  function select(parent, label, options, value, onChange) {
    var lab = el("label", "mb-ctl"); lab.appendChild(document.createTextNode(label + " "));
    var s = document.createElement("select"); s.setAttribute("aria-label", label);
    options.forEach(function (o) { var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
    s.value = value; s.addEventListener("change", function () { onChange(s.value); });
    lab.appendChild(s); parent.appendChild(lab); return s;
  }
  function metric(box, value, label) {
    var m = el("div", "mb-metric"); m.appendChild(el("span", "mb-mvalue", value)); m.appendChild(el("span", "mb-mlabel", label)); box.appendChild(m);
  }

  /* range rows: band, point, actual, optional slipped actual */
  function ranges(q, slip) {
    var box = el("div", "spa-ranges"), max = q.actual;
    L.METHODS.forEach(function (m) { max = Math.max(max, q[m].hi); });
    max *= 1.08;
    var x = function (v) { return (100 * v / max).toFixed(2) + "%"; };
    L.METHODS.forEach(function (m) {
      var b = q[m], row = el("div", "spa-rrow");
      row.appendChild(el("span", null, NAMES[m]));
      var tr = el("span", "spa-rtrack"), band = el("i"); band.style.left = x(b.lo); band.style.width = "calc(" + x(b.hi - b.lo) + " + 2px)"; tr.appendChild(band);
      var pt = el("b"); pt.style.left = x(b.point); tr.appendChild(pt);
      var ac = el("u"); ac.style.left = x(q.actual); tr.appendChild(ac);
      if (slip) { var sl = el("s"); sl.style.left = x(q.slipped); tr.appendChild(sl); }
      row.appendChild(tr);
      var A = slip ? q.slipped : q.actual, hit = A >= b.lo && A <= b.hi;
      var v = el("span", "spa-rval"); v.appendChild(el("strong", null, my(b.point) + "m"));
      v.appendChild(document.createTextNode(" (" + my(b.lo) + " to " + my(b.hi) + ") · " + (hit ? "covers" : "misses") + " " + my(A)));
      row.appendChild(v); box.appendChild(row);
    });
    var lg = el("div", "spa-legend");
    lg.appendChild(el("span", "lg-band", "range")); lg.appendChild(el("span", "lg-point", "forecast")); lg.appendChild(el("span", "lg-actual", "what really closed"));
    if (slip) lg.appendChild(el("span", "lg-slip", "after the whale slips"));
    var wrap = el("div"); wrap.appendChild(lg); wrap.appendChild(box); return wrap;
  }

  /* ---------- a1 snapshot ---------- */
  function buildSnapshot(root) {
    var wrap = el("div", "mb-wrap"); wrap.appendChild(el("h4", null, "Rebuild the pipeline as it stood in any week"));
    kind(wrap, false, "Kettle & Co's stage-history log: eight deals, 32 events, weeks 0 to 12. Constructed so two deals go backwards.");
    var ctl = el("div", "mb-ctls"); wrap.appendChild(ctl);
    var lab = el("label", "mb-ctl mb-range"); lab.appendChild(document.createTextNode("Snapshot at week"));
    var inp = document.createElement("input"); inp.type = "range"; inp.min = "0"; inp.max = "12"; inp.step = "1"; inp.value = "6"; inp.setAttribute("aria-label", "Snapshot week");
    var out = el("b", null, "6"); lab.appendChild(inp); lab.appendChild(out); ctl.appendChild(lab);
    var verdict = el("div", "mb-verdict is-ok"); wrap.appendChild(verdict);
    var tbox = el("div"); wrap.appendChild(tbox);
    var back = L.regressions();
    wrap.appendChild(el("p", "mb-hint", "Went backwards in the log: " + back.map(function (b) { return b.id + " (week " + b.week + ", " + b.from + " to " + b.to + ")"; }).join("; ") + ". A CRM that stores only the current stage keeps neither move."));
    root.appendChild(wrap);
    function render() {
      var w = parseInt(inp.value, 10); out.textContent = String(w);
      var snap = L.snapshot(w), now = L.snapshot(12), nowBy = {};
      now.deals.forEach(function (d) { nowBy[d.id] = d.state; });
      verdict.textContent = "Week " + w + ": " + snap.open + " open, " + snap.won + " won, " + snap.lost + " lost. The CRM today shows " + now.open + " open, " + now.won + " won, " + now.lost + " lost.";
      tbox.innerHTML = "";
      tbox.appendChild(table(["Deal", "Stage in week " + w, "What the CRM shows today"], snap.deals.map(function (d) {
        return { cells: [d.id, d.state, { t: nowBy[d.id], cls: nowBy[d.id] !== d.state ? "is-miss" : null }] };
      }), { narrow: true }));
    }
    inp.addEventListener("input", render); render();
  }

  /* ---------- a2 conversion ---------- */
  function buildConversion(root) {
    var C = L.conversion(S);
    var wrap = el("div", "mb-wrap"); wrap.appendChild(el("h4", null, "Conversion two ways: by the month a lead arrived, and by the month a deal closed"));
    kind(wrap, true, REAL + ". 8,000 leads, 842 won. The closed-deal log starts on 5 December 2017.");
    var ctl = el("div", "mb-ctls"); wrap.appendChild(ctl);
    var st = { view: "months" };
    select(ctl, "Show", [["months", "By month: cohort vs period"], ["origin", "By origin: 2018 cohort"]], "months", function (v) { st.view = v; render(); });
    var verdict = el("div", "mb-verdict is-ok"); wrap.appendChild(verdict);
    var tbox = el("div"); wrap.appendChild(tbox);
    var hint = el("p", "mb-hint", ""); wrap.appendChild(hint);
    root.appendChild(wrap);
    function render() {
      tbox.innerHTML = "";
      if (st.view === "months") {
        verdict.textContent = "2018 cohort (January to May): " + C.leads2018.toLocaleString("en-US") + " leads, " + C.wins2018 + " won, " + pc(C.cohort2018) + ".";
        tbox.appendChild(table(["First contact", "Leads", "Won, ever (cohort)", "Cohort rate", "Wins dated this month", "Period rate"], C.months.map(function (m) {
          return { cells: [m.month, String(m.leads), String(m.cohortWins), { t: pc(m.cohort), cls: m.cohort < 0.06 ? "is-miss" : null }, String(m.periodWins), pc(m.period)] };
        })));
        hint.textContent = "Cohort rate: of the leads first contacted that month, the share that ever won. Period rate: wins dated that month divided by leads arriving that month. Every 2017 cohort sits under 6% because the deal log only starts in December 2017, not because those buyers said no.";
      } else {
        verdict.textContent = "Same 2018 cohort, split by where the lead came from. Best and worst differ by more than five-fold.";
        tbox.appendChild(table(["Origin", "Leads", "Won", "Rate"], C.byOrigin.map(function (o) { return { cells: [o.origin, String(o.leads), String(o.wins), pc(o.rate)] }; }), { narrow: true }));
        hint.textContent = "\"unknown\" converts best. That is a tracking question before it is a channel insight: leads with no recorded origin may be the ones a rep entered by hand after a conversation.";
      }
    }
    render();
  }

  /* ---------- a3 cycle ---------- */
  function buildCycle(root) {
    var Y = L.cycle(S), K = L.survival(S, S.asOf, [7, 14, 30, 60, 90, 150]);
    var wrap = el("div", "mb-wrap"); wrap.appendChild(el("h4", null, "How long a won deal took, and what an open deal still might do"));
    kind(wrap, true, REAL + ". Days from first contact to won, all 842 won deals.");
    var mt = el("div", "mb-metrics"); wrap.appendChild(mt);
    metric(mt, Y.median + " days", "median"); metric(mt, String(Y.p75), "75th percentile");
    metric(mt, rd(Y.p90, 10).toFixed(1), "90th percentile"); metric(mt, rd(Y.mean, 10).toFixed(1), "mean, pulled up by the tail");
    var max = 0; Y.buckets.forEach(function (b) { max = Math.max(max, b.n); });
    var h = el("div", "spa-hist"), hl = el("div", "spa-hlab");
    Y.buckets.forEach(function (b) {
      var bar = el("div"); bar.style.height = (100 * b.n / max).toFixed(1) + "%"; bar.appendChild(el("span", null, String(b.n))); h.appendChild(bar);
      hl.appendChild(el("span", null, b.to > 1000 ? b.from + "+ d" : b.from + "-" + b.to + " d"));
    });
    h.setAttribute("role", "img"); h.setAttribute("aria-label", "Won deals by days to close: " + Y.buckets.map(function (b) { return b.n; }).join(", "));
    wrap.appendChild(h); wrap.appendChild(hl);
    var ctl = el("div", "mb-ctls"); wrap.appendChild(ctl);
    var verdict = el("div", "mb-verdict is-ok"); wrap.appendChild(verdict);
    var tbox = el("div"); wrap.appendChild(tbox);
    root.appendChild(wrap);
    verdict.textContent = "2018 leads seen on 1 June 2018: " + pc(K.naive) + " won so far. The survival curve says " + pc(K.at[K.at.length - 1].km) + " by day 150. Known later: " + pc(K.truth) + ".";
    tbox.appendChild(table(["Day since first contact", "Cumulative win share (Kaplan-Meier)"], K.at.map(function (a) { return { cells: ["day " + a.day, pc(a.km)] }; }), { narrow: true }));
    wrap.appendChild(el("p", "mb-hint", "Leads contacted in May had only days to close by 1 June; counting them as not-won drags the naive share down. Kaplan-Meier lets each lead count only for the days it was watched. It cannot see past the longest watch, so it still undershoots the share known by November."));
  }

  /* ---------- a4 methods ---------- */
  function buildMethods(root) {
    var st = { probs: "own" }, H = L.history(S), T = L.stageTable(S), idx = S.draws[0];
    var wrap = el("div", "mb-wrap"); wrap.appendChild(el("h4", null, "One quarter, three forecasts"));
    both(wrap, REAL + ": origin, first contact and real outcome per lead. Constructed: stages, amounts, reps, and the 300-deal draw.");
    var ctl = el("div", "mb-ctls"); wrap.appendChild(ctl);
    select(ctl, "Stage probabilities", [["own", "Kettle's own, from last quarter"], ["hubspot", "HubSpot default pipeline (20/40/60/80/90)"]], "own", function (v) { st.probs = v; render(); });
    var verdict = el("div", "mb-verdict is-ok"); wrap.appendChild(verdict);
    var rbox = el("div"); wrap.appendChild(rbox);
    var tbox = el("div"); wrap.appendChild(tbox);
    wrap.appendChild(el("p", "mb-hint", "Rep commit range: commit to commit plus best case. Stage-weighted and history-based ranges: 80% band, normal approximation (modelled). Millions of yen; the quarter is 1 June to 30 August 2018."));
    root.appendChild(wrap);
    function render() {
      var q = L.quarter(S, idx, { H: H, T: T, probs: st.probs });
      verdict.className = "mb-verdict " + (st.probs === "hubspot" ? "is-bad" : "is-ok");
      verdict.textContent = "Pipeline " + my(q.pipeline) + "m yen across " + q.deals + " deals. What really closed: " + my(q.actual) + "m yen, " + q.nWon + " deals.";
      rbox.innerHTML = ""; rbox.appendChild(ranges(q, false));
      tbox.innerHTML = "";
      tbox.appendChild(table(["Stage", "Deals", "Kettle's own probability", "HubSpot default"], S.stages.map(function (s, k) {
        return { cells: [(k + 1) + " · " + s, String(q.stageCount[k]), pc(T.p[k]), pc(S.hubspotDefault[k])] };
      }), { narrow: true }));
    }
    render();
  }

  /* ---------- a5 accuracy ---------- */
  function buildAccuracy(root) {
    var st = { happy: false };
    var wrap = el("div", "mb-wrap"); wrap.appendChild(el("h4", null, "Twenty replays of the quarter: bias, error and coverage"));
    both(wrap, REAL + ": who really closed. Constructed: each replay draws a different 300 deals from the same 3,465 open leads, with constructed stages, amounts and reps.");
    var ctl = el("div", "mb-ctls"); wrap.appendChild(ctl);
    check(ctl, "Happy ears: reps move 30% of deals up one stage", function (v) { st.happy = v; render(); });
    var verdict = el("div", "mb-verdict is-ok"); wrap.appendChild(verdict);
    var tbox = el("div"); wrap.appendChild(tbox);
    var rbox = el("div"); wrap.appendChild(rbox);
    wrap.appendChild(el("p", "mb-hint", "Bias: total forecast minus total actual, over total actual. Error: average miss, ignoring sign, over the average actual. Coverage: replays whose actual fell inside the method's range. Call ratio: a rep's total commit over what that rep really closed."));
    root.appendChild(wrap);
    function render() {
      var R = L.replays(S, { happy: st.happy });
      verdict.className = "mb-verdict " + (st.happy ? "is-bad" : "is-ok");
      verdict.textContent = "Average quarter: " + my(R.meanActual) + "m yen really closed. Smallest error: history-based, " + pc(R.hist.mape) + (st.happy ? ". Happy ears on: stage-weighted and rep commit drift up; history-based does not read stages." : ".");
      tbox.innerHTML = "";
      tbox.appendChild(table(["Method", "Bias (20 quarters)", "Error (20 quarters)", "Range covered actual"], L.METHODS.map(function (m) {
        return { cells: [NAMES[m], sg(R[m].bias, pc), pc(R[m].mape), { t: R[m].covered + " of " + R.n, cls: R[m].covered >= 14 ? "is-hit" : "is-miss" }] };
      }), { narrow: true }));
      rbox.innerHTML = "";
      rbox.appendChild(table(["Rep", "Commits at stage", "Call ratio", "Error per quarter"], R.reps.map(function (r) {
        return { cells: [r.name, r.commitAt > 5 ? "only once signed" : String(r.commitAt) + " and above", rd(r.ratio, 100).toFixed(2), pc(r.error)] };
      }), { narrow: true }));
    }
    render();
  }

  /* ---------- a6 bench ---------- */
  var RUNGS = [
    { id: 1, m: "rep", happy: false, name: "1 · Rep commit", note: "Each rep's Commit category, summed. Range: commit to commit plus best case." },
    { id: 2, m: "stage", happy: false, name: "2 · Stage-weighted", note: "Amount times Kettle's own stage-to-win rate from last quarter." },
    { id: 3, m: "hist", happy: false, name: "3 · History-based", note: "Real conversion by origin times the real cycle-time curve, for each deal's age." },
    { id: 4, m: "hist", happy: true, anti: true, name: "4 · History-based, happy ears on", note: "Reps inflate 30% of deals by one stage. Watch which forecasts move." }
  ];
  function buildBench(root) {
    var st = { rung: 3, whale: false }, H = L.history(S), T = L.stageTable(S), idx = S.draws[0];
    var R0 = L.replays(S, {}), Rh = L.replays(S, { happy: true }), Rs = L.replays(S, { slip: true }), Rhs = L.replays(S, { happy: true, slip: true });
    var wrap = el("div", "mb-wrap"); wrap.appendChild(el("h4", null, "The forecast honesty bench"));
    both(wrap, REAL + ": origin, first contact and what really closed between 1 June and 30 August 2018. Constructed: Kettle's stages, amounts, reps and the 300-deal draw. Ranges are 80% bands under a normal approximation (modelled).");
    var pre = el("div", "mb-presets"); wrap.appendChild(pre);
    var buttons = RUNGS.map(function (r) {
      var b = el("label", "mb-preset" + (r.anti ? " is-anti" : "")), inp = document.createElement("input");
      inp.type = "radio"; inp.name = "spa-rung"; inp.checked = r.id === st.rung; b.appendChild(inp);
      var name = el("span", "mb-pname", r.name); b.appendChild(name); if (r.anti) name.appendChild(el("em", "mb-anti", " · anti-lever"));
      b.appendChild(el("span", "mb-pnote", r.note));
      inp.addEventListener("change", function () { if (inp.checked) { st.rung = r.id; render(); } });
      pre.appendChild(b); return b;
    });
    var ctl = el("div", "mb-ctls"); wrap.appendChild(ctl);
    var brk = el("button", "mb-break", "Break it: the whale slips"); brk.type = "button";
    brk.setAttribute("aria-pressed", "false");
    brk.addEventListener("click", function () { st.whale = !st.whale; brk.setAttribute("aria-pressed", String(st.whale)); brk.textContent = st.whale ? "Undo: the whale closes on time" : "Break it: the whale slips"; render(); });
    ctl.appendChild(brk);
    var verdict = el("div", "mb-verdict is-ok"); wrap.appendChild(verdict);
    var mt = el("div", "mb-metrics"); wrap.appendChild(mt);
    var rbox = el("div"); wrap.appendChild(rbox);
    var tbox = el("div"); wrap.appendChild(tbox);
    var hint = el("p", "mb-hint", ""); wrap.appendChild(hint);
    root.appendChild(wrap);
    function render() {
      var r = RUNGS[st.rung - 1];
      buttons.forEach(function (b, k) { b.classList.toggle("is-on", k === st.rung - 1); });
      var q = L.quarter(S, idx, { H: H, T: T, happy: r.happy }), q0 = L.quarter(S, idx, { H: H, T: T });
      var RR = st.whale ? (r.happy ? Rhs : Rs) : (r.happy ? Rh : R0);
      var sc = L.score(q, r.m, st.whale);
      verdict.className = "mb-verdict " + (sc.covered && Math.abs(sc.pct) < 0.25 ? "is-good" : Math.abs(sc.pct) < 0.5 ? "is-ok" : "is-bad");
      verdict.textContent = NAMES[r.m] + ": " + my(sc.forecast) + "m yen against " + my(sc.actual) + "m that really closed (" + sg(sc.pct, pc) + "). Range " + my(sc.lo) + " to " + my(sc.hi) + (sc.covered ? ", covers it." : ", misses it.");
      mt.innerHTML = "";
      metric(mt, sg(sc.error / 1e6, function (x) { return rd(x, 100).toFixed(2) + "m"; }), "error this quarter, yen");
      metric(mt, sg(RR[r.m].bias, pc), "bias over 20 replays");
      metric(mt, pc(RR[r.m].mape), "error over 20 replays");
      metric(mt, RR[r.m].covered + " of 20", "replays inside the range");
      rbox.innerHTML = ""; rbox.appendChild(ranges(q, st.whale));
      tbox.innerHTML = "";
      tbox.appendChild(table(["Method", "Forecast", "Range", "Actual", "Error", "Bias (20)", "Error (20)", "Coverage"], L.METHODS.map(function (m) {
        var s2 = L.score(q, m, st.whale);
        return { cells: [NAMES[m], my(s2.forecast), my(s2.lo) + " to " + my(s2.hi), my(s2.actual), { t: sg(s2.pct, pc), cls: Math.abs(s2.pct) < 0.25 ? "is-hit" : "is-miss" }, sg(RR[m].bias, pc), pc(RR[m].mape), RR[m].covered + " of 20"] };
      })));
      var tips = [];
      if (r.happy) tips.push("Happy ears on: stage-weighted moves from " + my(q0.stage.point) + " to " + my(q.stage.point) + "m, an overshoot of " + my(q.stage.point - q0.stage.point) + "m yen (" + pc((q.stage.point - q0.stage.point) / q.actual) + " of what closed). History-based does not read stages, so it stays at " + my(q.hist.point) + ".");
      if (st.whale) tips.push("The biggest deal that really closed (" + my(q.whale) + "m yen) slips to next quarter: actual falls from " + my(q.actual) + " to " + my(q.slipped) + ". Still covered: " + (L.METHODS.filter(function (m) { return q.slipped >= q[m].lo && q.slipped <= q[m].hi; }).map(function (m) { return NAMES[m]; }).join(", ") || "none") + ".");
      if (!tips.length) tips.push("Millions of yen. Error = forecast minus actual. Pick a rung, then switch on the anti-lever and the break button.");
      hint.textContent = tips.join(" ");
    }
    render();
  }

  function boot() {
    S = window.SPA_SAMPLE; L = window.SPA;
    if (!S || !L) return;
    var st = L.selfTest(S);
    if (!st.ok && window.console) console.warn("spa self-test failed", st.fails);
    var map = { snapshot: buildSnapshot, conversion: buildConversion, cycle: buildCycle, methods: buildMethods, accuracy: buildAccuracy, bench: buildBench };
    Array.prototype.forEach.call(document.querySelectorAll(".spa-widget"), function (n) {
      var f = map[n.getAttribute("data-mode")]; if (f) f(n);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
