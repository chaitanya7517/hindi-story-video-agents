"""Extra voice worker: makes missing voice lines from the END of the story backwards,
so it can run beside tools/audio.py (which goes forwards). Files are written atomically.
Usage: python tools/voice_worker.py <project> [threads]"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import torch
torch.set_num_threads(int(sys.argv[2]) if len(sys.argv) > 2 else 2)
import voice_f5
from audio import trim, sane_length

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
proj = os.path.join(ROOT, "projects", sys.argv[1])
shots = json.load(open(os.path.join(proj, "4-storyboard.json")))["shots"]
chars = {c["name"]: c for c in json.load(open(os.path.join(proj, "3-characters.json")))["characters"]}
adir = os.path.join(proj, "audio", "lines"); os.makedirs(adir, exist_ok=True)
jobs = [(s["id"], i, l) for s in shots for i, l in enumerate(s["lines"])][::-1]
for sid, i, line in jobs:
    out = os.path.join(adir, f"{sid}-{i}.wav")
    if os.path.exists(out) or os.path.exists(out + ".busy"):
        continue
    open(out + ".busy", "w").close()          # tell the other worker this line is taken
    c = chars[line["speaker"]]
    for attempt in range(2):
        tmp = out + ".part.wav"
        voice_f5.speak(line["text"], os.path.join(ROOT, c["ref"]), c["ref_text"], tmp)
        trim(tmp)
        if sane_length(tmp, line["text"]):
            break
    os.replace(tmp, out); os.remove(out + ".busy")
    print("voice", os.path.basename(out), flush=True)
    # stop when the forward worker has caught up (all lines exist)
    if all(os.path.exists(os.path.join(adir, f"{s}-{k}.wav")) for s, k, _ in jobs):
        break
