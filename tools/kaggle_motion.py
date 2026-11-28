"""Motion agent manager: sends still pictures + motion prompts to the free Kaggle GPU (tools/motion_kaggle_kernel.py),
waits, and saves the moving clips. Usage: python tools/kaggle_motion.py <project> <motion.json> --user <kaggle_username>
motion.json: {"clips": [{"id": "m01", "image": "images/p02.png", "prompt": "...", "w": 832, "h": 480, "frames": 73}]}"""
import base64, io, json, os, shutil, subprocess, sys, time
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from kaggle_images import kg, ROOT, WORK
def main(project, mfile, user):
    proj = os.path.join(ROOT, "projects", project); outd = os.path.join(proj, "clips"); os.makedirs(outd, exist_ok=True)
    jobs = []
    for c in json.load(open(mfile))["clips"]:
        if os.path.exists(os.path.join(outd, c["id"] + ".mp4")): continue
        w, h = c.get("w", 832), c.get("h", 480)
        b = io.BytesIO(); Image.open(os.path.join(proj, c["image"])).convert("RGB").resize((w, h), Image.LANCZOS).save(b, "JPEG", quality=92)
        jobs.append({"id": c["id"], "prompt": c["prompt"], "image_b64": base64.b64encode(b.getvalue()).decode(), "w": w, "h": h, "frames": c.get("frames", 73), "steps": c.get("steps", 30)})
    if not jobs: print("all clips exist"); return
    kd = os.path.join(WORK, "motion-kernel"); shutil.rmtree(kd, ignore_errors=True); os.makedirs(kd)
    open(os.path.join(kd, "motion_agent.py"), "w").write(open(os.path.join(ROOT, "tools", "motion_kaggle_kernel.py")).read().replace("__JOBS__", json.dumps(jobs)))
    kref = f"{user}/hindi-motion-agent"
    json.dump({"id": kref, "title": "hindi-motion-agent", "code_file": "motion_agent.py", "language": "python", "kernel_type": "script",
               "is_private": True, "enable_gpu": True, "enable_internet": True, "dataset_sources": []}, open(os.path.join(kd, "kernel-metadata.json"), "w"))
    print(kg("kernels", "push", "-p", kd, "--accelerator", "NvidiaTeslaT4")[-200:])
    t0 = time.time()
    while True:
        time.sleep(30); s = kg("kernels", "status", kref, check=False).lower()
        print(f"[{(time.time() - t0) / 60:.0f} min] {s[-40:]}", flush=True)
        if "complete" in s or "error" in s or "cancel" in s: break
    od = os.path.join(WORK, "motion-output"); shutil.rmtree(od, ignore_errors=True); os.makedirs(od)
    kg("kernels", "output", kref, "-p", od, check=False); got = 0
    for r, _, fs in os.walk(od):
        for f in fs:
            if f.endswith(".mp4"): shutil.copy(os.path.join(r, f), os.path.join(outd, f)); got += 1
            if f.endswith(".log"): print(open(os.path.join(r, f)).read()[-2500:])
    print(f"saved {got} clips to {outd}")
if __name__ == "__main__":
    a = sys.argv[1:]; main(a[0], a[1], a[a.index("--user") + 1])
