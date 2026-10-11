# Agent brief - shared by every fan-out page of learn-sales-pipeline-analytics-with-phoebe

Internal build document, filled from course-builder/references/agent-brief.template.md on
2026-10-11. Never link it from an audience page.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page for YOUR track. Copy its structure, classes, SVG grammar and quiz markup
   EXACTLY, including how many options each question has (4, lettered "A · ", "B · ", ...):
   - Business: `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-sales-pipeline-analytics-with-phoebe/courses/b1-what-a-pipeline-proves.html`
   - Analyst: `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-sales-pipeline-analytics-with-phoebe/courses/a1-the-pipeline-data-model.html`
2. The source map: every verified number, its evidence tier, per-session coverage, the seams, and
   the exact lines each widget prints. Use ONLY its numbers; never invent a statistic; if a fact is
   missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-sales-pipeline-analytics-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-sales-pipeline-analytics-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "<a href="../index.html">learn-sales-pipeline-analytics-with-phoebe</a> /
Business session N of 4" or "... / Analyst session N of 6", #toggle-all, #zoom-toggle) · masthead
(eyebrow "Learn B2B Sales Pipeline Analytics with Phoebe · Business session N of 4" or "· Analyst
session N of 6", h1 with one `<span class="accent">`, .sub, .chip-row with the level chip
"🟢 Business" / "🟡 Business" / "🟠 Business" for b1/b2, b3, b4 and "🟢 Analyst" a1-a2,
"🟡 Analyst" a3-a4, "🟠 Analyst" a5, plus the two audience chips and the time chip exactly as the
template, .agenda a1-a4) · main.wrap · section#intro (Part 0 "Where we start": kicker, .lede,
.legend pills, .callout.win "★ What you walk out with tonight.") · 3 Parts, each
`section.section#part-N` with section-kicker (klabel "Part N · covers ...", h2,
`.tag.concept "N min live"`), a `.lede`, ONE figure, `details.card` accordions (summary:
`.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example` with
`span.ex-pill` "Real world" on the page · section#demo-1 Build-along (kicker
`.tag.demo "★ 22 min · everyone works it through"` on Business pages, `"★ 22 min · everyone builds"`
on Analyst pages, .lede, ONE figure, `.steps > .step`, each with a `.prompt-box.good` carrying a
`span.label`; see your outline for the build-along content) · section#exercise Homework (ol, 4
items) · section#quiz (3 x `.quiz-q data-answer="0-based"`, `p.qtext`, 4 `button.qopt` "A · ...",
`p.qwhy`; one `p.quiz-score` after the last; vary the correct letter across the three) ·
section#official, h2 EXACTLY "What this session teaches, and where it came from",
`.covered > .covered-row` (pill solid ✓ / light ◐ + name + note), then the `.mono` line EXACTLY
"Every fact on this page, and its verification tier, is recorded in the course's source map." ·
section.cheat#cheatsheet (h3 "Business session N cheat sheet <span>· pin this</span>" or "Analyst
session N cheat sheet ...", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next
session" · footer.pagefoot · scripts.

Head: the template's social meta block with this page's own title/description/url;
`<title>Business session N · <Title> - learn sales pipeline analytics with phoebe</title>` (or
Analyst); `<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.
Scripts at the end: Business pages only `<script src="../assets/app.js?v=1"></script>`. Analyst
pages with a widget: exactly as a1, i.e. spa-sample.js?v=1, spa-live.js?v=1, spa-bench.js?v=1, then
app.js?v=1. The widget is `<div class="spa-widget" data-mode="MODE"></div>` placed right after the
build-along .lede, before its figure.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "Analyst session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. Widget numbers: quote ONLY the lines
  listed under "Widget-printed lines" in the map, verbatim. For constructed arithmetic you invent
  (e.g. a capacity plan), show the arithmetic, label it constructed, and check it.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
  Vendor forecast-accuracy surveys: no vendor named with a figure, no percentage quoted.
- Citations in the exact form of the map's appendix; anything marked reported is "reported".
  Never quote Roberge or Kaplan-Meier; paraphrase.
- NEVER "lottery" or "lotteries"; say the mechanism ("decided by row order", "arbitrary", "a
  random draw").
- Default to the English word. No Chinese terms needed here.
- Titles, widget ids and class names must not collide with siblings. Do not reuse these sibling
  titles: "A forecast people actually believe", "Pipeline review", "CRM hygiene", "Measuring a
  forecast", "The methods, without math", "Backtesting & metrics". Do not invent new CSS classes;
  use the template's classes only.
- Running case: Kettle &amp; Co's office-tea B2B arm, a BD lead and four reps (Aiko, Ben, Chiara,
  Dev), constructed, selling office tea subscriptions in Japan, amounts in yen. Never Phoebe's own
  employer, clients or projects. Say "constructed" on the page for every Kettle example.
- The real rows: "real Olist B2B funnel rows (Brazilian marketplace seller acquisition) standing in
  for Kettle's history". Olist has no lost deals and no stage history; never claim otherwise.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): ink `#1B2622` · muted `#535E59` · accent `#5A6D65`
· accent-deep `#34443E` · accent-soft `#BFCBC5` · accent-50 `#EEF2F0` · faint `#C9D2CE` · hairline
`#E3E8E5` · copper (contrast) `#8C4A1E` · copper-ink `#5C2F10` · copper-50 `#FBEFE6` · `#FFFFFF` ·
universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" role="img" aria-label="the data, not the
  shape">` > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom - takeaway</figcaption>`.
  Grow H, never W.
- Prefix unique per figure, used for every class and id: `<page id><letter>`, e.g. `b2a`, `b2b`,
  `b2c`, `b2d` (b2's four figures), `a3a` ... Never reuse another page's prefix.
- `<defs>` holds three things with the figure prefix P: a wobble filter `id="PSk"`
  (`feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` +
  `feDisplacementMap scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%"
  width="106%" height="106%"`), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one
  accent line, opacity .5), an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, ink stroke
  1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#1B2622" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation (-4 to 4 degrees for
  hand-placed items, under 1 for panels). Fills: white, accent-50, the hachure for "the pile" or "the
  data", and the copper ONLY for the one thing the figure is about. One doodle anchor per figure,
  simple strokes, never a mascot. Text classes: `.PH` 800 12px ink heading · `.PL` 600 12px ink
  label · `.PS` 400 11px muted · `.PB` 800 11px copper-ink · `.PV` 800 16-20px accent-deep value ·
  `.PW` 800 12px white on a fill (copper or accent only) · `.PA` 700 11px accent-deep axis caption ·
  `.PN` 400 12px muted note. Hand-stacked items must not overlap as painted rects (the gate flags a
  pile). Text over a hachure fill sits on a white rect placed OUTSIDE the filtered group.
- ALL `<text>` outside any filtered group, sans stack, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it by
  8px. No path may cross a text label (the gate flags line-through-text). When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along. Draw the MECHANISM (the stage mix behind a
  coverage ratio; who signs which half of the forecast contract; a rep's ramp curve against quota;
  cohort rows vs period columns; a censored deal leaving the risk set; three methods reading three
  fields; twenty replays as dots around zero), never a metaphor literally, never decoration.

## Voice and honesty

Every Part gets a real-world story: the real Olist rows where the map has a fact, otherwise a
constructed Kettle story labelled "Constructed Kettle &amp; Co example". Kettle numbers that a
widget prints are quoted from the map; other Kettle numbers are constructed arithmetic and say so.
Velocity, "3x coverage" and forecast categories are conventions: teach them as such.

## Cross-links (absolute URLs)

- AI for selling, the rep's side of pipeline review, CRM hygiene with AI:
  https://phoebefu6.github.io/learn-ai-sales-with-phoebe/ ; https://phoebefu6.github.io/learn-ai-sales-with-phoebe/courses/a3-forecast-you-can-trust.html ;
  https://phoebefu6.github.io/learn-ai-sales-with-phoebe/courses/b9-pipeline-review.html ;
  https://phoebefu6.github.io/learn-ai-sales-with-phoebe/courses/b8-crm-hygiene.html
- Forecasting models: https://phoebefu6.github.io/learn-timeseries-forecasting-with-phoebe/
- Same Olist funnel used for budget and CAC: https://phoebefu6.github.io/learn-marketing-with-phoebe/courses/04-the-funnel-bench.html
- Ownership map (never re-teach it): https://phoebefu6.github.io/learn-marketing-analytics-with-phoebe/courses/p2-the-ownership-map.html
- Sizing: https://phoebefu6.github.io/learn-market-sizing-with-phoebe/ ; from size to plan:
  https://phoebefu6.github.io/learn-market-sizing-with-phoebe/courses/b4-from-size-to-plan.html ;
  office tea proxy: https://phoebefu6.github.io/learn-market-sizing-with-phoebe/courses/a3-analogy-and-proxy.html
- Renewal and churn: https://phoebefu6.github.io/learn-customer-retention-with-phoebe/
- Win rate as a lever in a metric tree: https://phoebefu6.github.io/learn-metric-decomposition-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chains and session titles

Business: b1 What a pipeline is evidence of → b2 Reading a pipeline review → b3 Who owns the
forecast → b4 From pipeline to plan (b4's next: "Next: The pipeline data model →" to
a1-the-pipeline-data-model.html).
Analyst: a1 The pipeline data model → a2 Conversion done honestly → a3 Velocity and cycle time →
a4 Three forecast methods → a5 Bias, error and the track record → a6 The forecast honesty bench.
Files: b2-reading-a-pipeline-review.html, b3-who-owns-the-forecast.html, b4-from-pipeline-to-plan.html,
a2-conversion-done-honestly.html, a3-velocity-and-cycle-time.html, a4-three-forecast-methods.html,
a5-measuring-forecast-error.html.
Footer left: "Business session N of 4 · learn-sales-pipeline-analytics-with-phoebe · by Phoebe Fu
&nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "<a href="PREV">← Prev: <title></a> &nbsp;·&nbsp; <a href="NEXT">Next: <title> →</a>".

Session titles (exact, sentence case, one accent span in h1): as above.
