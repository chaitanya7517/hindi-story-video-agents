"""Picture agent manager (runs here): sends image prompts to the free Kaggle GPU, waits, saves the pictures.
Usage: python tools/kaggle_images.py <project> <prompts.json> --user <kaggle_username>
prompts.json: {"style": "...appended to every prompt...", "characters": {"Meera": "description", ...},
               "images": [{"id": "p01", "prompt": "... {Meera} ...", "seed": 1}]}   ({Name} is replaced by the character description)"""
import json, os, shutil, subprocess, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KPY = os.environ.get("KAGGLE_PY", "/tmp/claude-0/kenv/bin/python")
WORK = os.environ.get("KAGGLE_WORK", "/tmp/claude-0/kaggle-work")
def kg(*a, check=True):
    r = subprocess.run([KPY, os.path.join(ROOT, "tools", "kaggle_cli.py"), *a], capture_output=True, text=True); out = (r.stdout + r.stderr).strip()
    if check and r.returncode: raise SystemExit(f"kaggle {' '.join(a)} failed:\n{out[-1500:]}")
    return out
def main(project, pfile, user):
    P = json.load(open(pfile)); proj = os.path.join(ROOT, "projects", project); outd = os.path.join(proj, "images"); os.makedirs(outd, exist_ok=True)
    jobs = []
    for im in P["images"]:
        if os.path.exists(os.path.join(outd, im["id"] + ".png")): continue
        p = im["prompt"]
        for n, d in P.get("characters", {}).items(): p = p.replace("{" + n + "}", d)
        jobs.append({"id": im["id"], "prompt": p + ", " + P.get("style", ""), "seed": im.get("seed", 7), "w": im.get("w", 1344), "h": im.get("h", 768)})
    if not jobs: print("all images exist"); return
    kd = os.path.join(WORK, "img-kernel"); shutil.rmtree(kd, ignore_errors=True); os.makedirs(kd)
    code = open(os.path.join(ROOT, "tools", "image_kaggle_kernel.py")).read().replace("__JOBS__", json.dumps(jobs, ensure_ascii=False).replace("'''", ""))
    open(os.path.join(kd, "image_agent.py"), "w").write(code)
    kref = f"{user}/hindi-image-agent"
    json.dump({"id": kref, "title": "hindi-image-agent", "code_file": "image_agent.py", "language": "python", "kernel_type": "script",
               "is_private": True, "enable_gpu": True, "enable_internet": True, "dataset_sources": []}, open(os.path.join(kd, "kernel-metadata.json"), "w"))
    print(kg("kernels", "push", "-p", kd, "--accelerator", "NvidiaTeslaT4")[-300:])
    t0 = time.time()
    while True:
        time.sleep(30); s = kg("kernels", "status", kref, check=False).lower()
        print(f"[{(time.time() - t0) / 60:.0f} min] {s[-80:]}", flush=True)
        if "complete" in s or "error" in s or "cancel" in s: break
    od = os.path.join(WORK, "img-output"); shutil.rmtree(od, ignore_errors=True); os.makedirs(od)
    kg("kernels", "output", kref, "-p", od, check=False)
    got = 0
    for root, _, files in os.walk(od):
        for f in files:
            if f.endswith(".png"): shutil.copy(os.path.join(root, f), os.path.join(outd, f)); got += 1
    print(f"saved {got} images to {outd}")
    for root, _, files in os.walk(od):
        for f in files:
            if f.endswith(".log"): print(open(os.path.join(root, f)).read()[-2500:])
if __name__ == "__main__":
    a = sys.argv[1:]; main(a[0], a[1], a[a.index("--user") + 1])
