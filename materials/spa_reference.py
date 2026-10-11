#!/usr/bin/env python3
"""Independent Python reference for assets/spa-live.js. Reads assets/spa-sample.js, recomputes
the whole ladder, prints the same JSON as materials/run-ladder.js (minus selfTest).
Usage: python3 materials/spa_reference.py"""
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "..", "assets", "spa-sample.js")).read()
S = json.loads(src[src.index("window.SPA_SAMPLE = ") + 20:].rstrip().rstrip(";"))
R = S["rows"]; N = len(R["o"]); ASOF, PRIOR, Q = S["asOf"], S["priorAsOf"], S["q"]
Z80 = 1.2816
MONTHS = ["2017-06", "2017-07", "2017-08", "2017-09", "2017-10", "2017-11", "2017-12",
          "2018-01", "2018-02", "2018-03", "2018-04", "2018-05"]
MSTART = [-214, -184, -153, -122, -92, -61, -31, 0, 31, 59, 90, 120, 151]

def rd(x, k): return math.floor(x * k + 0.5) / k
def my(x): return rd(x / 1e6, 100)
def pc(x): return rd(x * 100, 10)
def won_by(w, d): return w != -1 and w < d

def history():
    no = len(S["origins"]); leads = [0] * no; wins = [0] * no; cyc = []; tot = 0; totw = 0
    for i in range(N):
        if R["c"][i] < 0 or R["c"][i] >= 59: continue
        leads[R["o"][i]] += 1; tot += 1
        if won_by(R["w"][i], ASOF): wins[R["o"][i]] += 1; totw += 1; cyc.append(R["w"][i] - R["c"][i])
    pooled = totw / tot
    conv = [(wins[k] / leads[k] if leads[k] >= 40 else pooled) for k in range(no)]
    cyc.sort(); F = [sum(1 for c in cyc if c <= t) / len(cyc) for t in range(cyc[-1] + 1)]
    return dict(conv=conv, pooled=pooled, n=tot, nWon=totw, F=F, maxC=cyc[-1])

def cdf(H, t): return 0 if t < 0 else 1 if t >= len(H["F"]) else H["F"][t]
def hist_p(H, i):
    a = ASOF - R["c"][i]; co = H["conv"][R["o"][i]]
    Fa, Fb = cdf(H, a), cdf(H, a + Q)
    return co * (Fb - Fa) / (1 - co * Fa)

def stage_table():
    cnt = [0] * 5; won = [0] * 5
    for i in range(N):
        if R["c"][i] < 0 or R["c"][i] >= 59 or R["st"][i] == 0: continue
        s = R["st"][i] - 1; cnt[s] += 1
        if PRIOR <= R["w"][i] < PRIOR + Q: won[s] += 1
    return dict(count=cnt, won=won, p=[(won[k] / cnt[k] if cnt[k] else 0) for k in range(5)])

def band(m, v):
    sd = math.sqrt(v); return dict(point=m, lo=max(0, m - Z80 * sd), hi=m + Z80 * sd)
def in_band(b, x): return b["lo"] <= x <= b["hi"]

def quarter(idx, H, T, happy=False, probs=None):
    P = S["hubspotDefault"] if probs == "hubspot" else T["p"]
    commit = best = swm = swv = hm = hv = actual = whale = 0.0; nwon = 0
    per = [dict(commit=0.0, best=0.0, actual=0.0, deals=0) for _ in S["reps"]]
    pipe = 0.0; sc = [0] * 5
    for i in idx:
        s = R["st"][i]
        if happy and R["hp"][i] == 1: s = min(5, s + 1)
        a = R["amt"][i] * 10000; r = R["rep"][i]; T0 = S["reps"][r]["commitAt"]
        pipe += a; sc[s - 1] += 1; per[r]["deals"] += 1
        if s >= T0: commit += a; per[r]["commit"] += a
        elif s == T0 - 1: best += a; per[r]["best"] += a
        ps = P[s - 1]; swm += ps * a; swv += ps * (1 - ps) * a * a
        ph = hist_p(H, i); hm += ph * a; hv += ph * (1 - ph) * a * a
        if ASOF <= R["w"][i] < ASOF + Q:
            actual += a; nwon += 1; per[r]["actual"] += a
            if a > whale: whale = a
    return dict(rep=dict(point=commit, lo=commit, hi=commit + best), stage=band(swm, swv), hist=band(hm, hv),
                actual=actual, slipped=actual - whale, whale=whale, nWon=nwon, deals=len(idx), pipeline=pipe, stageCount=sc, perRep=per)

METHODS = ["rep", "stage", "hist"]
def score(q, m, slip=False):
    A = q["slipped"] if slip else q["actual"]; b = q[m]
    return dict(forecast=b["point"], lo=b["lo"], hi=b["hi"], actual=A, error=b["point"] - A, pct=(b["point"] - A) / A, covered=in_band(b, A))

def replays(happy=False, slip=False, probs=None):
    H = history(); T = stage_table(); out = {m: dict(err=0.0, abs=0.0, covered=0) for m in METHODS}
    reps = [dict(commit=0.0, actual=0.0, abs=0.0) for _ in S["reps"]]; sumA = 0.0
    for d in S["draws"]:
        q = quarter(d, H, T, happy, probs); sumA += q["slipped"] if slip else q["actual"]
        for m in METHODS:
            sc = score(q, m, slip); out[m]["err"] += sc["error"]; out[m]["abs"] += abs(sc["error"]); out[m]["covered"] += 1 if sc["covered"] else 0
        for r, p in enumerate(q["perRep"]):
            reps[r]["commit"] += p["commit"]; reps[r]["actual"] += p["actual"]; reps[r]["abs"] += abs(p["commit"] - p["actual"])
    for m in METHODS: out[m]["bias"] = out[m]["err"] / sumA; out[m]["mape"] = out[m]["abs"] / sumA
    out["reps"] = [dict(name=S["reps"][r]["name"], commitAt=S["reps"][r]["commitAt"], ratio=x["commit"] / x["actual"] if x["actual"] else 0, error=x["abs"] / x["actual"]) for r, x in enumerate(reps)]
    return out

def rung(sc, RR, m):
    return dict(forecast=my(sc["forecast"]), lo=my(sc["lo"]), hi=my(sc["hi"]), actual=my(sc["actual"]), error=my(sc["error"]), pct=pc(sc["pct"]),
                covered=sc["covered"], bias=pc(RR[m]["bias"]), mape=pc(RR[m]["mape"]), coverage=RR[m]["covered"])

def conversion():
    rows = [dict(leads=0, cw=0, pw=0) for _ in range(12)]
    def month_of(d):
        for k in range(12):
            if MSTART[k] <= d < MSTART[k + 1]: return k
        return -1
    for i in range(N):
        mc = month_of(R["c"][i]); rows[mc]["leads"] += 1
        if R["w"][i] != -1:
            rows[mc]["cw"] += 1; mw = month_of(R["w"][i])
            if mw >= 0: rows[mw]["pw"] += 1
    byo = {o: [0, 0] for o in range(len(S["origins"]))}; L = W = 0
    for i in range(N):
        if R["c"][i] < 0: continue
        byo[R["o"][i]][0] += 1; L += 1
        if R["w"][i] != -1: byo[R["o"][i]][1] += 1; W += 1
    bo = sorted(byo.items(), key=lambda kv: -kv[1][0])
    wd = [w for w in R["w"] if w != -1]
    return dict(cohort2018=pc(W / L), leads2018=L, wins2018=W, firstWonDay=min(wd), lastWonDay=max(wd),
                months=[[MONTHS[k], r["leads"], r["cw"], pc(r["cw"] / r["leads"]), r["pw"], pc(r["pw"] / r["leads"])] for k, r in enumerate(rows)],
                byOrigin=[[S["origins"][o], v[0], v[1], pc(v[1] / v[0])] for o, v in bo])

def quantile(s, q):
    p = (len(s) - 1) * q; lo, hi = math.floor(p), math.ceil(p); return s[lo] + (s[hi] - s[lo]) * (p - lo)

def cycle():
    c = sorted(R["w"][i] - R["c"][i] for i in range(N) if R["w"][i] != -1)
    b = [(0, 7), (7, 14), (14, 30), (30, 60), (60, 90), (90, 180), (180, 10000)]
    return dict(n=len(c), mean=rd(sum(c) / len(c), 10), p25=quantile(c, .25), median=quantile(c, .5), p75=quantile(c, .75),
                p90=rd(quantile(c, .9), 10), max=c[-1], buckets=[sum(1 for x in c if lo <= x < hi) for lo, hi in b])

def survival(days):
    ev = []; nw = tw = n = 0
    for i in range(N):
        if R["c"][i] < 0 or R["c"][i] >= ASOF: continue
        n += 1
        if won_by(R["w"][i], ASOF): ev.append((R["w"][i] - R["c"][i], 1)); nw += 1
        else: ev.append((ASOF - R["c"][i], 0))
        if R["w"][i] != -1: tw += 1
    ev.sort(key=lambda e: (e[0], -e[1]))
    surv = 1.0; risk = len(ev); curve = []; k = 0
    for t in range(days[-1] + 1):
        d = cen = 0
        while k < len(ev) and ev[k][0] == t:
            if ev[k][1]: d += 1
            else: cen += 1
            k += 1
        if risk > 0 and d > 0: surv *= (1 - d / risk)
        risk -= d + cen; curve.append(1 - surv)
    return dict(n=n, naive=pc(nw / n), truth=pc(tw / n), at=[[x, pc(curve[x])] for x in days])

def main():
    H = history(); T = stage_table(); d0 = S["draws"][0]
    q = quarter(d0, H, T); qh = quarter(d0, H, T, happy=True)
    R0 = replays(); Rh = replays(happy=True); Rs = replays(slip=True); Rhub = replays(probs="hubspot"); qhub = quarter(d0, H, T, probs="hubspot")
    out = dict(
        meta=S["meta"],
        quarter=dict(deals=q["deals"], nWon=q["nWon"], pipeline=my(q["pipeline"]), stageCount=q["stageCount"],
                     perRep=[dict(commit=my(p["commit"]), best=my(p["best"]), actual=my(p["actual"]), deals=p["deals"]) for p in q["perRep"]]),
        stageTable=dict(count=T["count"], won=T["won"], p=[pc(x) for x in T["p"]]),
        history=dict(n=H["n"], nWon=H["nWon"], pooled=pc(H["pooled"]), maxC=H["maxC"], conv=[pc(x) for x in H["conv"]]),
        rung1_rep=rung(score(q, "rep"), R0, "rep"), rung2_stage=rung(score(q, "stage"), R0, "stage"),
        rung3_hist=rung(score(q, "hist"), R0, "hist"), rung4_hist_happy=rung(score(qh, "hist"), Rh, "hist"),
        happy=dict(stage=rung(score(qh, "stage"), Rh, "stage"), rep=rung(score(qh, "rep"), Rh, "rep"),
                   overshoot=my(qh["stage"]["point"] - q["stage"]["point"]), overshootPct=pc((qh["stage"]["point"] - q["stage"]["point"]) / q["actual"])),
        whale=dict(amount=my(q["whale"]), actual=my(q["actual"]), slipped=my(q["slipped"]),
                   covered=[dict(m=m, covered=in_band(q[m], q["slipped"])) for m in METHODS],
                   coverage=[dict(m=m, covered=Rs[m]["covered"]) for m in METHODS]),
        reps=[dict(name=r["name"], commitAt=r["commitAt"], ratio=rd(r["ratio"], 100), error=pc(r["error"])) for r in R0["reps"]],
        hubspot=dict(forecast=my(qhub["stage"]["point"]), lo=my(qhub["stage"]["lo"]), hi=my(qhub["stage"]["hi"]),
                     bias=pc(Rhub["stage"]["bias"]), mape=pc(Rhub["stage"]["mape"]), coverage=Rhub["stage"]["covered"]),
        conversion=conversion(), cycle=cycle(), survival=survival([7, 14, 30, 60, 90, 150]))
    print(json.dumps(out, indent=1))

if __name__ == "__main__":
    main()
