"""Runs ON KAGGLE (free T4 GPU): motion agent. Turns a still story picture into a short moving clip with
Wan2.2-TI2V-5B (Apache-2.0, free for commercial use, no login). JOBS filled in by tools/kaggle_motion.py:
[{id, prompt, image_b64 (jpg), w, h, frames}]  ->  /kaggle/working/out/<id>.mp4"""
import base64, io, json, os, subprocess, sys, time
JOBS = json.loads(r'''__JOBS__''')
t0 = time.time()
os.environ.update(HF_HOME="/tmp/hf", USE_TF="0", USE_JAX="0", USE_FLAX="0")
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "diffusers", "accelerate", "ftfy", "imageio", "imageio-ffmpeg"], check=True)
import torch
from PIL import Image
from diffusers import WanImageToVideoPipeline, AutoencoderKLWan
from diffusers.utils import export_to_video
R = "Wan-AI/Wan2.2-TI2V-5B-Diffusers"
vae = AutoencoderKLWan.from_pretrained(R, subfolder="vae", torch_dtype=torch.float32)
pipe = WanImageToVideoPipeline.from_pretrained(R, vae=vae, torch_dtype=torch.bfloat16)
pipe.enable_model_cpu_offload()
try: pipe.vae.enable_tiling()
except Exception: pass
print(f"loaded in {time.time() - t0:.0f}s cuda {torch.cuda.is_available()}", flush=True)
os.makedirs("/kaggle/working/out", exist_ok=True)
NEG = "blurry, distorted face, deformed hands, extra limbs, flicker, jitter, text, watermark, static, still image, low quality"
for j in JOBS:
    t1 = time.time()
    img = Image.open(io.BytesIO(base64.b64decode(j["image_b64"]))).convert("RGB").resize((j["w"], j["h"]))
    frames = pipe(image=img, prompt=j["prompt"], negative_prompt=NEG, width=j["w"], height=j["h"], num_frames=j["frames"],
                  num_inference_steps=j.get("steps", 30), guidance_scale=5.0, generator=torch.Generator("cpu").manual_seed(7)).frames[0]
    export_to_video(frames, f"/kaggle/working/out/{j['id']}.mp4", fps=24)
    print("clip", j["id"], f"{time.time() - t1:.0f}s", flush=True)
print(f"done {len(JOBS)} clips in {time.time() - t0:.0f}s", flush=True)
