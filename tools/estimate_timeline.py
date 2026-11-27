"""Estimated timeline (before voices exist) so scenes can be built and previewed early.
Same spacing as tools/audio.py; real voice lengths are used where a line already exists.
Usage: python3 tools/estimate_timeline.py <project>"""
import json, os, sys, wave
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAP, TAIL, LEAD = .35, .8, .6
proj = os.path.join(ROOT, "projects", sys.argv[1])
shots = json.load(open(os.path.join(proj, "4-storyboard.json")))["shots"]
t, tl = LEAD, {"estimated": True, "shots": []}
for s in shots:
    sh = {"id": s["id"], "start": t, "lines": []}
    for i, l in enumerate(s["lines"]):
        f = os.path.join(proj, "audio", "lines", f"{s['id']}-{i}.wav")
        if os.path.exists(f):
            with wave.open(f) as w: d = w.getnframes() / w.getframerate()
        else: d = len(l["text"]) / 11.0
        sh["lines"].append({"speaker": l["speaker"], "text": l["text"], "start": t, "end": t + d}); t += d + GAP
    t += TAIL - GAP; sh["end"] = t; tl["shots"].append(sh)
tl["duration"] = t
json.dump(tl, open(os.path.join(proj, "6-timeline.json"), "w"), ensure_ascii=False, indent=1)
print(f"estimated {t:.0f} s ({t/60:.1f} min)")
