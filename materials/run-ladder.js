// node materials/run-ladder.js - runs the real browser engine on the shipped sample, prints the canon as JSON.
// Money in millions of yen, 2 dp; percentages 1 dp; rounding is floor(x*k+0.5)/k in both languages.
const fs = require("fs"), path = require("path");
const M = require(path.join(__dirname, "..", "assets", "spa-live.js"));
const src = fs.readFileSync(path.join(__dirname, "..", "assets", "spa-sample.js"), "utf8");
const win = {}; new Function("window", src)(win);
const S = win.SPA_SAMPLE;
const rd = (x, k) => Math.floor(x * k + 0.5) / k;
const my = (x) => rd(x / 1e6, 100), pc = (x) => rd(x * 100, 10);
const rung = (r) => ({ forecast: my(r.forecast), lo: my(r.lo), hi: my(r.hi), actual: my(r.actual), error: my(r.error), pct: pc(r.pct),
  covered: r.covered, bias: pc(r.bias), mape: pc(r.mape), coverage: r.coverage });
const L = M.ladder(S);
const C = M.conversion(S), Y = M.cycle(S), K = M.survival(S, S.asOf, [7, 14, 30, 60, 90, 150]);
const hub = M.replays(S, { probs: "hubspot" }), qHub = M.quarter(S, S.draws[0], { probs: "hubspot" });
const out = {
  selfTest: M.selfTest(S),
  meta: S.meta,
  quarter: { deals: L.quarter.deals, nWon: L.quarter.nWon, pipeline: my(L.quarter.pipeline), stageCount: L.quarter.stageCount,
    perRep: L.quarter.perRep.map((p) => ({ commit: my(p.commit), best: my(p.best), actual: my(p.actual), deals: p.deals })) },
  stageTable: { count: L.stageTable.count, won: L.stageTable.won, p: L.stageTable.p.map(pc) },
  history: { n: L.history.n, nWon: L.history.nWon, pooled: pc(L.history.pooled), maxC: L.history.maxC, conv: L.history.conv.map(pc) },
  rung1_rep: rung(L.rung1), rung2_stage: rung(L.rung2), rung3_hist: rung(L.rung3), rung4_hist_happy: rung(L.rung4),
  happy: { stage: rung(L.happy.stage), rep: rung(L.happy.rep), overshoot: my(L.happy.overshoot), overshootPct: pc(L.happy.overshootPct) },
  whale: { amount: my(L.whale.amount), actual: my(L.whale.actual), slipped: my(L.whale.slipped), covered: L.whale.covered, coverage: L.whale.coverage },
  reps: L.replays.reps.map((r) => ({ name: r.name, commitAt: r.commitAt, ratio: rd(r.ratio, 100), error: pc(r.error) })),
  hubspot: { forecast: my(qHub.stage.point), lo: my(qHub.stage.lo), hi: my(qHub.stage.hi), bias: pc(hub.stage.bias), mape: pc(hub.stage.mape), coverage: hub.stage.covered },
  conversion: { cohort2018: pc(C.cohort2018), leads2018: C.leads2018, wins2018: C.wins2018, firstWonDay: C.firstWonDay, lastWonDay: C.lastWonDay,
    months: C.months.map((m) => [m.month, m.leads, m.cohortWins, pc(m.cohort), m.periodWins, pc(m.period)]),
    byOrigin: C.byOrigin.map((o) => [o.origin, o.leads, o.wins, pc(o.rate)]) },
  cycle: { n: Y.n, mean: rd(Y.mean, 10), p25: Y.p25, median: Y.median, p75: Y.p75, p90: rd(Y.p90, 10), max: Y.max, buckets: Y.buckets.map((b) => b.n) },
  survival: { n: K.n, naive: pc(K.naive), truth: pc(K.truth), at: K.at.map((a) => [a.day, pc(a.km)]) },
};
console.log(JSON.stringify(out, null, 1));
