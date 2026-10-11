#!/usr/bin/env python3
"""Writes index.html (landing page) with the knowledge map data serialised by json.dumps.
Internal build script; never linked from an audience page."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
B = [("b1-what-a-pipeline-proves", "What a pipeline is evidence of", "What a pipeline\nis evidence of", "#34D399", ["Stages as buyer acts", "Four numbers", "The velocity identity"]),
     ("b2-reading-a-pipeline-review", "Reading a pipeline review", "Reading a\npipeline review", "#34D399", ["Coverage, decoded", "Stale deals", "Pulled and pushed"]),
     ("b3-who-owns-the-forecast", "Who owns the forecast", "Who owns\nthe forecast", "#FBBF24", ["Number vs method", "The forecast contract", "Error rate owned"]),
     ("b4-from-pipeline-to-plan", "From pipeline to plan", "From pipeline\nto plan", "#FB923C", ["Capacity and ramp", "Scale on evidence", "The readiness gate"])]
A = [("a1-the-pipeline-data-model", "The pipeline data model", "The pipeline\ndata model", "#34D399", ["Events, not states", "The overwrite", "The as-of join"]),
     ("a2-conversion-done-honestly", "Conversion done honestly", "Conversion\ndone honestly", "#34D399", ["Cohort vs period", "The logging lag", "Won-only survivorship"]),
     ("a3-velocity-and-cycle-time", "Velocity and cycle time", "Velocity and\ncycle time", "#FBBF24", ["Median, not mean", "Censored open deals", "The survival curve"]),
     ("a4-three-forecast-methods", "Three forecast methods", "Three forecast\nmethods", "#FBBF24", ["Rep commit", "Stage-weighted", "History-based"]),
     ("a5-measuring-forecast-error", "Bias, error and the track record", "Bias, error and\ntrack record", "#FB923C", ["Bias vs error", "Per-rep call ratio", "Range coverage"]),
     ("a6-the-forecast-honesty-bench", "The forecast honesty bench", "The forecast\nhonesty bench", "#F87171", ["The ladder", "Happy ears", "The whale slips"])]
MM = {"title": "Sales pipeline\nanalytics", "centerColor": "#34443E",
      "sessions": [{"label": s[2], "href": "courses/%s.html" % s[0], "color": s[3],
                    "concepts": [{"label": c, "href": "courses/%s.html" % s[0]} for c in s[4]]} for s in B + A]}
tpl = open(os.path.join(HERE, "index.template.html")).read()
out = tpl.replace("/*MINDMAP*/", "window.MINDMAP_DATA = " + json.dumps(MM, indent=2) + ";")
open(os.path.join(HERE, "..", "index.html"), "w").write(out)
print("index.html written")
