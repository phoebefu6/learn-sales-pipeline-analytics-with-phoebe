"""Compare the node engine canon with the Python reference, by value.
Usage: python3 materials/compare-ladder.py [--plant]   (exit 0 = every shared number identical)
--plant adds 0.1 percent to one Python-side input (the stage table's top probability) to prove
the comparison can fail. node prints one extra key, selfTest, which is reported then excluded."""
import json, os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
node = json.loads(subprocess.check_output(["node", os.path.join(here, "run-ladder.js")]))
if "--plant" in sys.argv:
    code = open(os.path.join(here, "spa_reference.py")).read().replace(
        'return dict(count=cnt, won=won, p=[(won[k] / cnt[k] if cnt[k] else 0) for k in range(5)])',
        'return dict(count=cnt, won=won, p=[(won[k] / cnt[k] if cnt[k] else 0) * (1.001 if k == 4 else 1) for k in range(5)])')
    assert "1.001" in code, "plant failed to apply"
    py = json.loads(subprocess.check_output([sys.executable, "-c", code.replace('HERE = os.path.dirname(os.path.abspath(__file__))', 'HERE = %r' % here)]))
else:
    py = json.loads(subprocess.check_output([sys.executable, os.path.join(here, "spa_reference.py")]))
st = node.pop("selfTest", None)
print("node selfTest:", st)
diffs = []
def walk(a, b, p=""):
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)): walk(a.get(k), b.get(k), p + "." + k)
    elif isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        for i, (x, y) in enumerate(zip(a, b)): walk(x, y, f"{p}[{i}]")
    elif a != b: diffs.append((p, a, b))
walk(node, py)
for d in diffs[:40]: print("DIFF", *d)
print("identical" if not diffs and st and st.get("ok") else "MISMATCH", "-", len(diffs), "differences")
sys.exit(1 if diffs or not (st and st.get("ok")) else 0)
