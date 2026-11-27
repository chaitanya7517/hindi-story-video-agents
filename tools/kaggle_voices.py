"""Voice agent on Kaggle's free GPU (manager side, runs here).
1. finds voice lines that don't exist yet
2. uploads them (text + each character's reference clip) as the private dataset <user>/voice-jobs
3. runs the private GPU notebook <user>/hindi-voice-agent (tools/voice_kaggle_kernel.py)
4. downloads the voices, trims silence, checks speaking speed, and saves them into audio/lines/
The model itself is uploaded once as the private dataset <user>/indicf5-model (--setup-model).
Usage: python tools/kaggle_voices.py <project> --user <kaggle_username> [--setup-model] [--collect]
--collect: don't start a new run, just wait for the running one and save its voices"""
import json, os, shutil, subprocess, sys, time, wave
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KPY = os.environ.get("KAGGLE_PY", "/tmp/claude-0/kenv/bin/python")
WORK = os.environ.get("KAGGLE_WORK", "/tmp/claude-0/kaggle-work")
MODEL_DIR = os.environ.get("F5_MODEL", "/tmp/claude-0/models/IndicF5")

def kg(*args, check=True):
    r = subprocess.run([KPY, os.path.join(ROOT, "tools", "kaggle_cli.py"), *args], capture_output=True, text=True)
    out = (r.stdout + r.stderr).strip()
    if check and r.returncode: raise SystemExit(f"kaggle {' '.join(args)} failed:\n{out[-1500:]}")
    return out

def meta(path, d): json.dump(d, open(os.path.join(path, "dataset-metadata.json" if "licenses" in d else "kernel-metadata.json"), "w"), indent=1)

def wait_dataset(ref):
    for _ in range(120):
        s = kg("datasets", "status", ref, check=False)
        if "ready" in s.lower(): return
        time.sleep(10)
    raise SystemExit(f"dataset {ref} not ready: {s}")

def setup_model(user):
    ref = f"{user}/indicf5-model"
    if "ready" in kg("datasets", "status", ref, check=False).lower(): print("model dataset already there"); return
    d = os.path.join(WORK, "model"); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    for f in ("model.safetensors", "config.json", "model.py"):   # files are read through the link
        os.symlink(os.path.join(MODEL_DIR, f), os.path.join(d, f))
    for f in ("checkpoints", "f5_tts"):                            # folders get packed: copy them (small)
        shutil.copytree(os.path.join(MODEL_DIR, f), os.path.join(d, f))
    meta(d, {"title": "indicf5-model", "id": ref, "licenses": [{"name": "other"}]})
    print(kg("datasets", "create", "-p", d, "--dir-mode", "tar"))
    wait_dataset(ref)

def main(project, user, collect=False):
    from audio import trim, sane_length
    proj = os.path.join(ROOT, "projects", project)
    shots = json.load(open(os.path.join(proj, "4-storyboard.json")))["shots"]
    chars = {c["name"]: c for c in json.load(open(os.path.join(proj, "3-characters.json")))["characters"]}
    adir = os.path.join(proj, "audio", "lines"); os.makedirs(adir, exist_ok=True)
    jd = os.path.join(WORK, "jobs")
    if not collect: shutil.rmtree(jd, ignore_errors=True); os.makedirs(os.path.join(jd, "refs"))
    jobs = []
    for s in shots:
        for i, l in enumerate(s["lines"]):
            lid = f"{s['id']}-{i}"
            if os.path.exists(os.path.join(adir, lid + ".wav")): continue
            c = chars[l["speaker"]]; ref = "refs/" + os.path.basename(c["ref"])
            if not collect and not os.path.exists(os.path.join(jd, ref)): shutil.copy(os.path.join(ROOT, c["ref"]), os.path.join(jd, ref))
            jobs.append({"id": lid, "text": l["text"], "ref": ref, "ref_text": c["ref_text"]})
    if not jobs: print("all voice lines exist"); return
    kref = f"{user}/hindi-voice-agent"
    if collect:   # a run is already going: just wait for it and save what it made
        return wait_and_save(kref, jobs, adir)
    json.dump(jobs, open(os.path.join(jd, "jobs.json"), "w"), ensure_ascii=False, indent=1)
    ref = f"{user}/voice-jobs"
    meta(jd, {"title": "voice-jobs", "id": ref, "licenses": [{"name": "other"}]})
    exists = "ready" in kg("datasets", "status", ref, check=False).lower()
    print(kg("datasets", "version", "-p", jd, "-m", f"{project} {len(jobs)} lines", "--dir-mode", "tar") if exists else kg("datasets", "create", "-p", jd, "--dir-mode", "tar"))
    wait_dataset(ref); time.sleep(20)
    kd = os.path.join(WORK, "kernel"); shutil.rmtree(kd, ignore_errors=True); os.makedirs(kd)
    shutil.copy(os.path.join(ROOT, "tools", "voice_kaggle_kernel.py"), kd)
    meta(kd, {"id": kref, "title": "hindi-voice-agent", "code_file": "voice_kaggle_kernel.py", "language": "python", "kernel_type": "script",
              "is_private": True, "enable_gpu": True, "enable_internet": True, "dataset_sources": [f"{user}/indicf5-model", ref]})
    print(kg("kernels", "push", "-p", kd, "--accelerator", "NvidiaTeslaT4"))
    wait_and_save(kref, jobs, adir)

def wait_and_save(kref, jobs, adir):
    from audio import trim, sane_length
    t0 = time.time()
    while True:
        time.sleep(30); s = kg("kernels", "status", kref, check=False).lower()
        print(f"[{(time.time() - t0) / 60:.0f} min] {s[-120:]}", flush=True)
        if "complete" in s or "error" in s or "cancel" in s: break
    od = os.path.join(WORK, "output"); shutil.rmtree(od, ignore_errors=True); os.makedirs(od)
    print(kg("kernels", "output", kref, "-p", od, check=False)[-600:])
    got = bad = 0
    for j in jobs:
        f = None
        for root, _, files in os.walk(od):
            if j["id"] + ".wav" in files: f = os.path.join(root, j["id"] + ".wav")
        dst = os.path.join(adir, j["id"] + ".wav")
        if not f or os.path.exists(dst): continue
        trim(f)
        if sane_length(f, j["text"]): shutil.move(f, dst + ".part.wav"); os.replace(dst + ".part.wav", dst); got += 1
        else: bad += 1
    print(f"saved {got} new lines, {bad} failed the speed check (CPU workers will redo them)")
    if "error" in s: print(kg("kernels", "output", kref, "-p", od, check=False)[-300:])

if __name__ == "__main__":
    a = sys.argv[1:]; user = a[a.index("--user") + 1]
    if "--setup-model" in a: setup_model(user)
    if a[0] != "--setup-model": main(a[0], user, "--collect" in a)
