# Official course map - learn-sales-pipeline-analytics-with-phoebe ("B2B Sales Pipeline Analytics")

Internal build document. Never link it from an audience page. Built 2026-10-11.
Bucket data, d3, audience both (BD / sales leaders, and data analysts). Two tracks, 10 sessions x
45 min: Business b1-b4 (no code) + Analyst a1-a6 (hands-on, browser widgets on real rows). a6 is the
bench. Running case: **Kettle & Co's office-tea B2B arm** (constructed, labelled on every page and
widget): one BD lead and four account reps (Aiko, Ben, Chiara, Dev) selling office tea
subscriptions in Japan, amounts in yen. It continues learn-market-sizing-with-phoebe a3 (office tea
as a proxy-sizing problem): this course asks "can we actually win it, and when?".

## Evidence tiers

- **read-at-source**: opened on 2026-10-11 and read myself.
- **reported**: known from secondary summaries or reputation; pages say "reported", paraphrase only,
  never quote, never attach a number.
- **constructed**: invented for teaching, labelled on the page and on the widget.

## Verified facts

### F1. Olist marketing funnel (read-at-source: Kaggle dataset API page + the files themselves)
"Marketing Funnel by Olist", Kaggle, licence CC BY-NC-SA 4.0, last updated 2018-11-16. The page
says the MQLs were randomly sampled from a larger set and requested contact between 2017-06-01 and
2018-06-01. Files read: 8,000 MQL rows (first_contact_date 2017-06-14 to 2018-05-31; origin) and
842 closed-deal rows (won_date 2017-12-05 to 2018-11-14; business_segment, lead_type, sdr_id, sr_id;
declared_monthly_revenue mostly 0). Olist is a Brazilian marketplace; the "deals" are sellers it
recruited. There are NO lost deals and NO stage history in the data. One won row has a won date 2
days before its first contact (cycle clipped to 0; a3 teaches it as a logging defect).
Licence is non-commercial share-alike: the course ships derived integer arrays only.
Widget line (exact): "real Olist B2B funnel rows (Brazilian marketplace seller acquisition) standing
in for Kettle's history".

### F2. HubSpot deal stages and forecast categories (read-at-source, re-verify before delivery)
- knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines: "each stage has an
  associated probability that indicates the likelihood of closing deals in that stage"; the default
  pipeline's stages and probabilities: Appointment scheduled 20%, Qualified to buy 40%,
  Presentation scheduled 60%, Decision maker bought-in 80%, Contract sent 90%, Closed won 100%,
  Closed lost 0%. Stage probability drives the "weighted amount".
- knowledge.hubspot.com/forecast/set-up-the-forecast-tool (page says last updated 2026-09-09):
  forecast categories Not forecasted, Pipeline ("low likelihood of closing"), Best case ("moderate
  likelihood"), Commit ("high likelihood of closing and have been committed to the forecast"),
  Closed won. Categories can be mapped from deal stage automatically. Weighted amount = amount x
  deal probability. The same page elsewhere lists "Most likely" among default categories: the page
  is inconsistent with itself; do not teach a fixed list beyond Pipeline / Best case / Commit.
### F3. Salesforce opportunity stages and forecast categories (reported)
Salesforce help pages would not render. Third-party guides report the standard categories Pipeline,
Best Case, Commit, Closed, Omitted, each stage carrying a default probability and a forecast
category. Pages say "reported" and give no Salesforce percentages.
### F4. Kaplan-Meier (reported)
E. L. Kaplan and Paul Meier, "Nonparametric Estimation from Incomplete Observations", Journal of the
American Statistical Association, 1958 (reported). Use as a shape and a method: product of
(1 - events / at risk) over time, censored rows leave the risk set without counting as failures.
### F5. Mark Roberge (reported)
The Sales Acceleration Formula (2015): scale hiring only when your own numbers show readiness.
Paraphrase as his stance, "reported", no numbers attributed.
### F6. "3x coverage" (principle, no single origin found)
Pipeline coverage = open pipeline amount / quota for the period. "3x" circulates as a rule of
thumb; no primary source was found. Teach it as a convention whose arithmetic is 1 / (expected
in-period win share of pipeline): 3x is only right if a third of the pipeline closes in the
period. Sibling learn-metric-decomposition b9 uses "3x coverage at a 25% win rate" as a worked
example (not a sourced claim); do not contradict it, extend it.
### F7. Forecast accuracy surveys (contested, principle)
Vendor surveys (forecasting and revenue-intelligence vendors, analyst firms) publish figures on how
few sales forecasts land within a band. Method and sample are usually not published and the
publisher sells the fix. Teach the disagreement: some leaders use them as an outside anchor, others
treat them as marketing. No vendor named with a figure, no percentage quoted.

## Real numbers from the rows (node engine = Python reference)

- Data range: first won day is 2017-12-05 (day -27 from 2018-01-01); last won 2018-11-14 (day 317).
- Cohort-based vs period-based conversion by first-contact month (leads, cohort wins, cohort %,
  wins dated in that month, period %):
  2017-07 239, 2, 0.8, 0, 0.0 | 2017-10 416, 14, 3.4, 0, 0.0 | 2017-12 200, 11, 5.5, 3, 1.5 |
  2018-01 1141, 152, 13.3, 73, 6.4 | 2018-02 1028, 149, 14.5, 113, 11.0 | 2018-03 1174, 167, 14.2,
  147, 12.5 | 2018-04 1352, 183, 13.5, 207, 15.3 | 2018-05 1303, 130, 10.0, 122, 9.4.
  2017 cohorts look dead because the closed-deal log starts 2017-12-05 (a logging artefact, not
  buyers). 2018 cohort (Jan-May): 5,998 leads, 781 won, 13.0%.
- Conversion by origin, 2018 cohort (leads, wins, %): organic_search 1736, 255, 14.7; paid_search
  1182, 175, 14.8; social 1051, 66, 6.3; unknown 813, 168, 20.7; direct_traffic 380, 54, 14.2; email
  347, 14, 4.0; referral 211, 24, 11.4; other 114, 4, 3.5; display 75, 5, 6.7; (blank) 48, 13, 27.1;
  other_publicities 41, 3, 7.3. ("unknown" converting best is a tracking question, not a channel.)
- Cycle time, first contact to won, all 842: median 14 days, p25 5, p75 54.75, p90 161.9, mean
  48.4, max 427. Buckets 0-7: 249, 7-14: 163, 14-30: 135, 30-60: 97, 60-90: 47, 90-180: 83, 180+: 68.
  Mean is 3.5x the median: report medians and percentiles.
- Censoring (2018 cohort seen on 2018-06-01, 5,998 leads): won-so-far share 10.5%; Kaplan-Meier
  cumulative win share by day 7 4.7%, 14 7.1%, 30 9.4%, 60 11.0%, 90 11.8%, 150 12.5%; eventual
  share known by Nov 2018 13.0%. KM fixes unequal follow-up; it cannot see past the longest follow-up.
- History (training cohort Jan-Feb 2018 as seen on 2018-06-01): 2,169 leads, 268 won by then
  (12.4%; 301 eventually); longest observed cycle 126 days. Origins under 40 leads use the pooled
  12.4%.

## Constructed (Kettle & Co, seeded 20181011, labelled on every widget)

Stages 1-5: Contacted, Need confirmed, Tasting trial, Proposal, Contract out (buyer commitments).
Stage per open deal built from the deal's REAL outcome (rule in materials/build-spa-sample.py), so
stages carry signal but are not perfect. Amounts lognormal, median 360,000 yen. Reps commit at
stage: Aiko 5, Ben 4 (optimist), Chiara 5, Dev 6 (commits nothing until signed; sandbagger). Best
case = one stage below the commit line. Happy ears: 30% of deals below stage 5 carry a flag; on,
they move up one stage. Quarter = 2018-06-01 to 2018-08-30 (91 days). Open pool = 3,465 real leads
first contacted Mar-May 2018 and not won by 2018-06-01; each replay draws 300 of them; draw 0 is
"this quarter". 20 replays.
Stage table (Kettle's own, from the prior quarter as of 2018-03-01, in-quarter win share by
stage, counts / won / %): 1022 / 0 / 0.0; 507 / 3 / 0.6; 240 / 15 / 6.3; 149 / 27 / 18.1; 79 / 51 / 64.6.
This quarter: 300 deals, pipeline 168.21m yen, stage counts 153 / 78 / 39 / 19 / 11, 7 deals won.
Per rep this quarter (commit / best case / actual, m yen): Aiko 3.55 / 4.61 / 3.28; Ben 3.37 /
4.84 / 0.91; Chiara 0.94 / 4.29 / 0.51; Dev 0 / 2.76 / 1.16.

## Bench canon (node `materials/run-ladder.js` = python `materials/spa_reference.py`; full dump `materials/canon.json`)

`python3 materials/compare-ladder.py` compares by parsed value: 0 differences, exit 0 (2026-10-11);
`--plant` (top stage probability x 1.001 on the Python side) reports 10 differences, exit 1.
Millions of yen 2 dp; percentages 1 dp. Bias = total (forecast - actual) / total actual over 20
replays; error = mean |forecast - actual| / mean actual; coverage = replays (of 20) whose actual
fell inside the method's range. Ranges: rep commit = commit to commit + best case; stage-weighted
and history-based = 80% band (point +/- 1.2816 sd, normal approximation, labelled).

| Rung | Forecast (range) | Actual | Error this quarter | Bias (20) | Error (20) | Coverage |
|---|---|---|---|---|---|---|
| 1 rep commit | 7.86 (7.86 to 24.36) | 5.86 | +2.00, +34.1% | +33.9% | 48.2% | 4 of 20 |
| 2 stage-weighted | 8.60 (5.48 to 11.72) | 5.86 | +2.74, +46.8% | +62.7% | 68.2% | 10 of 20 |
| 3 history-based | 5.01 (2.03 to 8.00) | 5.86 | -0.85, -14.5% | +18.6% | 38.8% | 17 of 20 |
| 4 history-based + happy ears | 5.01 (2.03 to 8.00), unchanged | 5.86 | -0.85 | +18.6% | 38.8% | 17 of 20 |

Happy ears on: stage-weighted 11.38 (7.56 to 15.21), overshoots its honest self by 2.79m yen =
47.5% of the actual; error this quarter +94.3%; bias +134.0%; coverage 3 of 20. Rep commit 10.67
(+82.1%), bias +121.5%, coverage 0 of 20. History-based does not read stages, so it does not move:
that is both its protection and its blind spot (it cannot see a real late-stage signal either).
Whale slips: the biggest deal that really closed (2.11m yen) moves to next quarter; actual 5.86 ->
3.75. Only history-based's range (2.03 to 8.00) still covers it; rep commit (floor 7.86) and
stage-weighted (from 5.48) do not. Over 20 replays with the whale slipping: rep 2, stage 3,
history 13 of 20 covered.
Reps over 20 replays (commit / actual, error): Aiko 0.98, 68.0%; Ben 4.60, 360.1%; Chiara 1.45,
69.7%; Dev 0.00, 100.0%. Aiko is unbiased and still misses by two thirds in a typical quarter:
"unbiased and useless" in one row.
HubSpot default probabilities (20/40/60/80/90) on the same deals: stage-weighted 63.64 (55.56 to
71.72) against 5.86; bias +1207.1%; coverage 0 of 20. Default probabilities are a placeholder for
your own history, not a forecast.
Why history-based still runs +18.6% over 20 replays: the May 2018 cohort converted 10.0% against
13-14% for Jan-Apr (real); a history-based forecast assumes the next quarter behaves like the last.

Engine self-test (on load): happy ears must raise stage-weighted; must not move history-based; the
whale must be a deal that really closed; draw size 300; the stage table must rise with stage.

## Per-session coverage

Business (no code):
- **b1 What a pipeline is evidence of.** Stages as buyer commitments, not rep activity; the four
  numbers (deals, win rate, deal size, cycle time); the velocity identity: pipeline velocity =
  deals x win rate x average deal size / cycle length (a convention, no single origin; teach as
  arithmetic). Kettle numbers constructed; Olist medians real (14-day median, 48.4 mean).
- **b2 Reading a pipeline review.** Coverage ratios (F6), stale deals (a3's ages), pulled forward
  and pushed out deals, the stage mix (153 of 300 at stage 1). Link learn-ai-sales b9 for the rep
  side.
- **b3 Who owns the forecast.** BD lead owns the number and the commit; data owns the method, the
  range and the error rate. The forecast contract (one page). Link Marketing Analytics p2.
- **b4 From pipeline to plan.** Capacity and ramp (constructed arithmetic only), Roberge (reported),
  evidence gate: own win rate, own cycle, own forecast error over past quarters. Link Market Sizing b4.

Analyst (hands-on):
- **a1 The pipeline data model.** Opportunity table, stage-history (event) table, weekly snapshots;
  the CRM's current state overwrites history; rebuild snapshots from events. Widget: snapshot
  (constructed 8-deal log, K-101 to K-108; K-102 and K-107 go backwards).
- **a2 Conversion done honestly.** Cohort vs period, the log-start artefact, origin, survivorship in
  won-only tables (Olist ships only won deals with details). Widget: conversion (real).
- **a3 Velocity and cycle time.** Distributions, median vs mean, percentiles, KM as a shape with
  censoring (10.5 / 12.5 / 13.0). Widget: cycle (real).
- **a4 Forecast methods.** Rep commit, stage-weighted (own table vs HubSpot defaults), history-based.
  Widget: methods.
- **a5 Measuring forecast accuracy.** Replays, bias vs error, per-rep call ratio, coverage of ranges.
  Widget: accuracy.
- **a6 The forecast honesty bench.** Full ladder, happy ears, whale slips.

## Seams (absolute links, say them out loud)

- https://phoebefu6.github.io/learn-ai-sales-with-phoebe/ owns AI for selling; its pages
  courses/a3-forecast-you-can-trust.html ("A forecast people actually believe"),
  courses/b9-pipeline-review.html (pipeline review from the rep side), courses/b8-crm-hygiene.html.
- https://phoebefu6.github.io/learn-timeseries-forecasting-with-phoebe/ owns forecasting models.
- https://phoebefu6.github.io/learn-marketing-with-phoebe/courses/04-the-funnel-bench.html uses the
  same Olist funnel for budget and CAC; this course uses it for cycle time and forecasting.
- https://phoebefu6.github.io/learn-marketing-analytics-with-phoebe/courses/p2-the-ownership-map.html
  owns the ownership map.
- https://phoebefu6.github.io/learn-market-sizing-with-phoebe/ owns sizing (a3 office tea, b4 plan).
- https://phoebefu6.github.io/learn-customer-retention-with-phoebe/ owns renewal and churn.
- learn-experimentation and learn-metric-decomposition mention win rate as a lever in a tree; here
  win rate is measured, by cohort, with its lag.

## Not covered (honest list)

- Forecasting models (ARIMA, Prophet, ML): Timeseries Forecasting owns them.
- AI forecasting tools and revenue-intelligence products: AI Sales owns them.
- Lost-deal reasons: Olist has no lost deals; not taught from data.
- Quota setting and compensation design.
- Renewal, expansion and churn after the deal: Customer Retention.
- Salesforce default stage probabilities (not read at source).
- Any vendor forecast-accuracy percentage.

## Corrections to the course block

- Bias and error are computed over 20 seeded replays of the quarter (different 300-deal draws from
  the same real open pool), because one quarter has an error but no bias.
- History-based is immune to happy ears by construction (it reads origin and age, not stage); rung 4
  therefore prints the same number as rung 3, and the overshoot is printed for stage-weighted.
- Palette: the brief's #2F4F4A sits within Delta E 2000 of 6.1 of two siblings; no hue near it
  clears 10. The shipped primary is sage slate #5A6D65 (nearest learn-yoga-theory #4C7355,
  Delta E 2000 10.0, CIE76 11.3).

## Citation appendix (the exact forms pages use)

1. Olist, "Marketing Funnel by Olist", Kaggle dataset, CC BY-NC-SA 4.0. Read at source.
2. HubSpot Knowledge Base, "Set up and customize pipelines" and "Set up the forecast tool". Read at source, October 2026.
3. Salesforce Help, opportunity stages and forecast categories. Reported.
4. Kaplan and Meier, "Nonparametric Estimation from Incomplete Observations", JASA, 1958. Reported.
5. Mark Roberge, The Sales Acceleration Formula, 2015. Reported.

## Widget-printed lines (verified in the served page 2026-10-11; pages may quote ONLY these)

- a2 conversion (default "By month"): "2018 cohort (January to May): 5,998 leads, 781 won, 13.0%." Table
  rows as in "Real numbers" above. "By origin" view verdict: "Same 2018 cohort, split by where the
  lead came from. Best and worst differ by more than five-fold."
- a3 cycle: tiles "14 days" median, "54.75" p75, "161.9" p90, "48.4" mean; histogram 249 / 163 /
  135 / 97 / 47 / 83 / 68 for 0-7, 7-14, 14-30, 30-60, 60-90, 90-180, 180+ days. Verdict: "2018 leads
  seen on 1 June 2018: 10.5% won so far. The survival curve says 12.5% by day 150. Known later:
  13.0%." KM table day 7 4.7%, 14 7.1%, 30 9.4%, 60 11.0%, 90 11.8%, 150 12.5%.
- a4 methods: verdict "Pipeline 168.21m yen across 300 deals. What really closed: 5.86m yen, 7
  deals." Range rows: "7.86m (7.86 to 24.36) · misses 5.86 | 8.60m (5.48 to 11.72) · covers 5.86 |
  5.01m (2.03 to 8.00) · covers 5.86". HubSpot default selected: stage-weighted "63.64m (55.56 to
  71.72) · misses 5.86". Stage table: 1 Contacted 153 deals, own 0.0%, HubSpot 20.0%; 2 Need
  confirmed 78, 0.6%, 40.0%; 3 Tasting trial 39, 6.3%, 60.0%; 4 Proposal 19, 18.1%, 80.0%; 5 Contract
  out 11, 64.6%, 90.0%.
- a5 accuracy: verdict "Average quarter: 4.57m yen really closed. Smallest error: history-based,
  38.8%." Methods (bias, error, coverage): Rep commit +33.9%, 48.2%, 4 of 20; Stage-weighted +62.7%,
  68.2%, 10 of 20; History-based +18.6%, 38.8%, 17 of 20. Reps (commits at, call ratio, error): Aiko
  5 and above, 0.98, 68.0%; Ben 4 and above, 4.60, 360.1%; Chiara 5 and above, 1.45, 69.7%; Dev only
  once signed, 0.00, 100.0%. Happy ears checkbox on: Rep commit +121.5%, 121.5%, 0 of 20;
  Stage-weighted +134.0%, 134.0%, 3 of 20; History-based unchanged; reps Aiko 1.69, 97.8%; Ben 8.15,
  715.1%; Chiara 2.18, 129.0%; Dev 0.00, 100.0%.
- a6 bench: as in the canon table above (verified identical in the served page).
- b2 derived from the engine's draw 0 (node, 2026-10-11, not printed by a widget, arithmetic shown on
  the page): stage 2+ amount 87.68m yen across 147 deals; at the 30 August review, 64 of 300 deals
  were first contacted on or before 22 March 2018 (older than 161.9 days) and still open. The
  6.0m target, pushed-out and pulled-forward tallies on b2 are constructed.
- a5's title is "Bias, error and the track record" (file a5-measuring-forecast-error.html): the
  proposed "Measuring forecast accuracy" sat too close to Timeseries Forecasting's "Measuring a forecast".
