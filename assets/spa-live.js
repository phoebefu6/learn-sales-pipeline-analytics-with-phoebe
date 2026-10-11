/* spa-live.js - the forecast honesty engine for learn-sales-pipeline-analytics-with-phoebe.
 * Pure functions over window.SPA_SAMPLE (assets/spa-sample.js). Runs in the browser and in node.
 * materials/spa_reference.py mirrors every function line for line; materials/compare-ladder.py
 * checks the two agree by value.
 * REAL: origin, first-contact day, won day for 8,000 Olist marketing funnel rows.
 * CONSTRUCTED (seeded, labelled on every widget): stage, amount, rep, happy flag, draws, the
 * a1 event log. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SPA = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var Z80 = 1.2816;
  var MONTHS = ["2017-06", "2017-07", "2017-08", "2017-09", "2017-10", "2017-11", "2017-12",
    "2018-01", "2018-02", "2018-03", "2018-04", "2018-05"];
  var MONTH_START = [-214, -184, -153, -122, -92, -61, -31, 0, 31, 59, 90, 120, 151];

  function isWonBy(w, day) { return w !== -1 && w < day; }

  /* ---------- history: training cohort (first contact Jan-Feb 2018), seen as of the as-of date ---------- */
  function history(S) {
    var R = S.rows, n = R.o.length, no = S.origins.length;
    var leads = [], wins = [], i, k, cyc = [], tot = 0, totW = 0;
    for (k = 0; k < no; k++) { leads.push(0); wins.push(0); }
    for (i = 0; i < n; i++) {
      if (R.c[i] < 0 || R.c[i] >= 59) continue;
      leads[R.o[i]] += 1; tot += 1;
      if (isWonBy(R.w[i], S.asOf)) { wins[R.o[i]] += 1; totW += 1; cyc.push(R.w[i] - R.c[i]); }
    }
    var pooled = totW / tot, conv = [];
    for (k = 0; k < no; k++) conv.push(leads[k] >= 40 ? wins[k] / leads[k] : pooled);
    cyc.sort(function (a, b) { return a - b; });
    var maxC = cyc[cyc.length - 1], F = [];
    var j = 0;
    for (var t = 0; t <= maxC; t++) { while (j < cyc.length && cyc[j] <= t) j++; F.push(j / cyc.length); }
    return { leads: leads, wins: wins, conv: conv, pooled: pooled, n: tot, nWon: totW, F: F, maxC: maxC };
  }
  function cdf(H, t) { return t < 0 ? 0 : t >= H.F.length ? 1 : H.F[t]; }
  function histP(S, H, i) {
    var a = S.asOf - S.rows.c[i], co = H.conv[S.rows.o[i]];
    var Fa = cdf(H, a), Fb = cdf(H, a + S.q);
    return co * (Fb - Fa) / (1 - co * Fa);
  }

  /* ---------- stage table: prior quarter (as of 2018-03-01), in-quarter win share by stage ---------- */
  function stageTable(S) {
    var R = S.rows, n = R.o.length, cnt = [0, 0, 0, 0, 0], won = [0, 0, 0, 0, 0], i;
    for (i = 0; i < n; i++) {
      if (R.c[i] < 0 || R.c[i] >= 59 || R.st[i] === 0) continue;
      var s = R.st[i] - 1; cnt[s] += 1;
      if (R.w[i] >= S.priorAsOf && R.w[i] < S.priorAsOf + S.q) won[s] += 1;
    }
    var p = [];
    for (var k = 0; k < 5; k++) p.push(cnt[k] ? won[k] / cnt[k] : 0);
    return { count: cnt, won: won, p: p };
  }

  function band(mean, v) { var sd = Math.sqrt(v); return { point: mean, lo: Math.max(0, mean - Z80 * sd), hi: mean + Z80 * sd }; }
  function inBand(b, x) { return x >= b.lo && x <= b.hi; }

  /* ---------- one quarter: the three methods against what really closed ---------- */
  function quarter(S, idx, opt) {
    opt = opt || {};
    var R = S.rows, H = opt.H || history(S), T = opt.T || stageTable(S);
    var probs = opt.probs === "hubspot" ? S.hubspotDefault : T.p;
    var commit = 0, best = 0, swM = 0, swV = 0, hM = 0, hV = 0, actual = 0, whale = 0, whaleRow = -1;
    var perRep = S.reps.map(function () { return { commit: 0, best: 0, actual: 0, deals: 0 }; });
    var pipe = 0, nWon = 0, stageCount = [0, 0, 0, 0, 0];
    for (var j = 0; j < idx.length; j++) {
      var i = idx[j], s = R.st[i];
      if (opt.happy && R.hp[i] === 1) s = Math.min(5, s + 1);
      var a = R.amt[i] * 10000, r = R.rep[i], T0 = S.reps[r].commitAt;
      pipe += a; stageCount[s - 1] += 1; perRep[r].deals += 1;
      if (s >= T0) { commit += a; perRep[r].commit += a; }
      else if (s === T0 - 1) { best += a; perRep[r].best += a; }
      var ps = probs[s - 1]; swM += ps * a; swV += ps * (1 - ps) * a * a;
      var ph = histP(S, H, i); hM += ph * a; hV += ph * (1 - ph) * a * a;
      if (R.w[i] >= S.asOf && R.w[i] < S.asOf + S.q) {
        actual += a; nWon += 1; perRep[r].actual += a;
        if (a > whale) { whale = a; whaleRow = i; }
      }
    }
    return {
      rep: { point: commit, lo: commit, hi: commit + best },
      stage: band(swM, swV), hist: band(hM, hV),
      actual: actual, slipped: actual - whale, whale: whale, whaleRow: whaleRow,
      nWon: nWon, deals: idx.length, pipeline: pipe, stageCount: stageCount, perRep: perRep
    };
  }

  var METHODS = ["rep", "stage", "hist"];
  function score(q, m, slip) {
    var A = slip ? q.slipped : q.actual, b = q[m];
    return { forecast: b.point, lo: b.lo, hi: b.hi, actual: A, error: b.point - A, pct: (b.point - A) / A, covered: inBand(b, A) };
  }

  /* ---------- 20 replays of the quarter: bias, error, coverage ----------
   * bias  = total (forecast - actual) / total actual over the replays (signed)
   * error = mean |forecast - actual| / mean actual (scaled absolute error, sign-free)
   * covered = replays whose actual fell inside the method's range */
  function replays(S, opt) {
    opt = opt || {};
    var H = history(S), T = stageTable(S), out = {}, reps = S.reps.map(function () { return { commit: 0, actual: 0, abs: 0 }; });
    var sumA = 0;
    METHODS.forEach(function (m) { out[m] = { err: 0, abs: 0, covered: 0, pcts: [] }; });
    for (var d = 0; d < S.draws.length; d++) {
      var q = quarter(S, S.draws[d], { H: H, T: T, happy: opt.happy, probs: opt.probs });
      sumA += opt.slip ? q.slipped : q.actual;
      METHODS.forEach(function (m) {
        var sc = score(q, m, opt.slip);
        out[m].err += sc.error; out[m].abs += Math.abs(sc.error); out[m].covered += sc.covered ? 1 : 0; out[m].pcts.push(sc.pct);
      });
      q.perRep.forEach(function (p, r) { reps[r].commit += p.commit; reps[r].actual += p.actual; reps[r].abs += Math.abs(p.commit - p.actual); });
    }
    var N = S.draws.length;
    METHODS.forEach(function (m) { out[m].bias = out[m].err / sumA; out[m].mape = out[m].abs / sumA; });
    out.reps = reps.map(function (x, r) { return { name: S.reps[r].name, commitAt: S.reps[r].commitAt, ratio: x.commit / x.actual, error: x.abs / x.actual }; });
    out.n = N; out.meanActual = sumA / N;
    return out;
  }

  /* ---------- the ladder (a6) ---------- */
  function ladder(S) {
    var H = history(S), T = stageTable(S), idx = S.draws[0];
    var q = quarter(S, idx, { H: H, T: T }), qh = quarter(S, idx, { H: H, T: T, happy: true });
    var R0 = replays(S, {}), Rh = replays(S, { happy: true }), Rs = replays(S, { slip: true });
    var rung = function (qq, m, RR) { var sc = score(qq, m); return Object.assign(sc, { bias: RR[m].bias, mape: RR[m].mape, coverage: RR[m].covered }); };
    return {
      quarter: q,
      rung1: rung(q, "rep", R0), rung2: rung(q, "stage", R0), rung3: rung(q, "hist", R0),
      rung4: rung(qh, "hist", Rh),
      happy: { stage: rung(qh, "stage", Rh), rep: rung(qh, "rep", Rh),
        overshoot: qh.stage.point - q.stage.point, overshootPct: (qh.stage.point - q.stage.point) / q.actual },
      whale: { amount: q.whale, actual: q.actual, slipped: q.slipped,
        covered: METHODS.map(function (m) { return { m: m, covered: inBand(q[m], q.slipped) }; }),
        coverage: METHODS.map(function (m) { return { m: m, covered: Rs[m].covered }; }) },
      replays: R0, stageTable: T, history: { conv: H.conv, pooled: H.pooled, n: H.n, nWon: H.nWon, maxC: H.maxC }
    };
  }

  /* ---------- a2: cohort-based vs period-based conversion ---------- */
  function conversion(S) {
    var R = S.rows, n = R.o.length, rows = [], i, m;
    for (m = 0; m < 12; m++) rows.push({ month: MONTHS[m], leads: 0, cohortWins: 0, periodWins: 0 });
    var dataEnd = 0;
    for (i = 0; i < n; i++) if (R.w[i] > dataEnd) dataEnd = R.w[i];
    function monthOf(d) { for (var k = 0; k < 12; k++) if (d >= MONTH_START[k] && d < MONTH_START[k + 1]) return k; return -1; }
    for (i = 0; i < n; i++) {
      var mc = monthOf(R.c[i]); rows[mc].leads += 1;
      if (R.w[i] !== -1) { rows[mc].cohortWins += 1; var mw = monthOf(R.w[i]); if (mw >= 0) rows[mw].periodWins += 1; }
    }
    rows.forEach(function (r) { r.cohort = r.cohortWins / r.leads; r.period = r.periodWins / r.leads; });
    var byO = S.origins.map(function (o) { return { origin: o, leads: 0, wins: 0 }; });
    var all = { leads: 0, wins: 0 };
    for (i = 0; i < n; i++) {
      if (R.c[i] < 0) continue;
      byO[R.o[i]].leads += 1; all.leads += 1;
      if (R.w[i] !== -1) { byO[R.o[i]].wins += 1; all.wins += 1; }
    }
    byO.forEach(function (x) { x.rate = x.wins / x.leads; });
    byO.sort(function (a, b) { return b.leads - a.leads; });
    var first = 1e9; for (i = 0; i < n; i++) if (R.w[i] !== -1 && R.w[i] < first) first = R.w[i];
    return { months: rows, byOrigin: byO, cohort2018: all.wins / all.leads, leads2018: all.leads, wins2018: all.wins, firstWonDay: first, lastWonDay: dataEnd };
  }

  /* ---------- a3: cycle time, and the open-deal survival curve ---------- */
  function quantile(sorted, q) { var p = (sorted.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo); }
  function cycle(S) {
    var R = S.rows, n = R.o.length, c = [], i, sum = 0;
    for (i = 0; i < n; i++) if (R.w[i] !== -1) { c.push(R.w[i] - R.c[i]); sum += R.w[i] - R.c[i]; }
    c.sort(function (a, b) { return a - b; });
    var buckets = [[0, 7], [7, 14], [14, 30], [30, 60], [60, 90], [90, 180], [180, 10000]].map(function (b) {
      var k = 0; c.forEach(function (x) { if (x >= b[0] && x < b[1]) k++; }); return { from: b[0], to: b[1], n: k };
    });
    return { n: c.length, mean: sum / c.length, p25: quantile(c, 0.25), median: quantile(c, 0.5), p75: quantile(c, 0.75), p90: quantile(c, 0.9), max: c[c.length - 1], buckets: buckets };
  }
  /* Kaplan-Meier on time-to-win for the 2018 cohort as seen on the as-of date. A lead not won by
   * then is censored at its age. Returns cumulative win share at the requested days. */
  function survival(S, asOf, days) {
    var R = S.rows, n = R.o.length, ev = [], i;
    asOf = asOf == null ? S.asOf : asOf;
    var naiveW = 0, trueW = 0, N = 0;
    for (i = 0; i < n; i++) {
      if (R.c[i] < 0 || R.c[i] >= asOf) continue;
      N += 1;
      if (isWonBy(R.w[i], asOf)) { ev.push([R.w[i] - R.c[i], 1]); naiveW += 1; }
      else ev.push([asOf - R.c[i], 0]);
      if (R.w[i] !== -1) trueW += 1;
    }
    ev.sort(function (a, b) { return a[0] - b[0] || b[1] - a[1]; });
    var surv = 1, atRisk = ev.length, curve = [], k = 0;
    var maxT = days[days.length - 1];
    for (var t = 0; t <= maxT; t++) {
      var d = 0, cen = 0;
      while (k < ev.length && ev[k][0] === t) { if (ev[k][1]) d++; else cen++; k++; }
      if (atRisk > 0 && d > 0) surv *= (1 - d / atRisk);
      atRisk -= d + cen;
      curve.push(1 - surv);
    }
    return { n: N, naive: naiveW / N, truth: trueW / N, at: days.map(function (x) { return { day: x, km: curve[x] }; }) };
  }

  /* ---------- a1: a constructed event log, and the snapshot it rebuilds ---------- */
  var EVENTS = [
    ["K-101", 0, 1], ["K-101", 2, 2], ["K-101", 5, 3], ["K-101", 8, 4], ["K-101", 11, 6],
    ["K-102", 0, 1], ["K-102", 3, 2], ["K-102", 6, 3], ["K-102", 9, 2], ["K-102", 12, 7],
    ["K-103", 1, 1], ["K-103", 4, 2], ["K-103", 7, 3], ["K-103", 9, 4], ["K-103", 10, 5],
    ["K-104", 1, 1], ["K-104", 5, 2], ["K-104", 10, 7],
    ["K-105", 2, 1], ["K-105", 4, 2], ["K-105", 6, 3], ["K-105", 8, 4], ["K-105", 12, 5],
    ["K-106", 3, 1], ["K-106", 6, 2], ["K-106", 11, 3],
    ["K-107", 4, 1], ["K-107", 5, 2], ["K-107", 7, 4], ["K-107", 10, 3],
    ["K-108", 6, 1], ["K-108", 9, 2]
  ];
  var STATE = ["", "Contacted", "Need confirmed", "Tasting trial", "Proposal", "Contract out", "Won", "Lost"];
  function snapshot(week) {
    var cur = {};
    EVENTS.forEach(function (e) { if (e[1] <= week) cur[e[0]] = e[2]; });
    var ids = Object.keys(cur).sort(), open = 0, won = 0, lost = 0;
    ids.forEach(function (k) { if (cur[k] === 6) won++; else if (cur[k] === 7) lost++; else open++; });
    return { week: week, deals: ids.map(function (k) { return { id: k, state: STATE[cur[k]], code: cur[k] }; }), open: open, won: won, lost: lost };
  }
  function regressions() {
    var last = {}, back = [];
    EVENTS.forEach(function (e) { if (last[e[0]] && e[2] < last[e[0]] && e[2] <= 5) back.push({ id: e[0], week: e[1], from: STATE[last[e[0]]], to: STATE[e[2]] }); last[e[0]] = e[2]; });
    return back;
  }

  /* ---------- on-load self-test: checks the engine can report a worse number ---------- */
  function selfTest(S) {
    var L = ladder(S), fails = [];
    if (!(L.happy.overshoot > 0)) fails.push("happy ears must raise the stage-weighted forecast");
    if (L.rung4.forecast !== L.rung3.forecast) fails.push("happy ears must not move the history-based forecast");
    if (!(L.whale.slipped < L.whale.actual)) fails.push("the whale must be a deal that really closed");
    if (L.quarter.deals !== 300) fails.push("draw size");
    var p = stageTable(S).p;
    for (var k = 1; k < 5; k++) if (!(p[k] >= p[k - 1])) fails.push("stage table must rise with stage");
    return { ok: fails.length === 0, fails: fails };
  }

  return { history: history, histP: histP, stageTable: stageTable, quarter: quarter, score: score,
    replays: replays, ladder: ladder, conversion: conversion, cycle: cycle, survival: survival,
    snapshot: snapshot, regressions: regressions, events: EVENTS, selfTest: selfTest, METHODS: METHODS, MONTHS: MONTHS };
}));
