"""Runs ON KAGGLE (free T4 GPU): picture agent. Makes story illustrations with Stable Diffusion XL base 1.0
(CreativeML Open RAIL++-M licence: commercial use allowed) + the MIT fp16 VAE fix. Both download without a login.
(FLUX.1-schnell is better but needs a Hugging Face login on Kaggle; we can switch later.)
JOBS (filled in by tools/kaggle_images.py): [{id, prompt, w, h, seed}]  ->  /kaggle/working/out/<id>.png"""
import json, os, subprocess, sys, time
JOBS = json.loads(r'''__JOBS__''')
t0 = time.time()
os.environ.update(HF_HOME="/tmp/hf", USE_TF="0", USE_JAX="0", USE_FLAX="0")
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "diffusers", "accelerate"], check=True)
import torch
from diffusers import StableDiffusionXLPipeline, AutoencoderKL, DPMSolverMultistepScheduler
vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", vae=vae, torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True)
NEG = "photo, photorealistic, 3d render, ugly, deformed face, extra fingers, extra limbs, bad anatomy, blurry, low quality, text, watermark, logo, signature, nsfw"
print(f"loaded in {time.time() - t0:.0f}s, cuda {torch.cuda.is_available()}", flush=True)
os.makedirs("/kaggle/working/out", exist_ok=True)
for j in JOBS:
    t1 = time.time()
    img = pipe(prompt=j["prompt"], negative_prompt=NEG, width=j.get("w", 1344), height=j.get("h", 768), num_inference_steps=30, guidance_scale=6.5,
               generator=torch.Generator("cuda").manual_seed(j.get("seed", 7))).images[0]
    img.save(f"/kaggle/working/out/{j['id']}.png"); print("image", j["id"], f"{time.time() - t1:.0f}s", flush=True)
print(f"done {len(JOBS)} images in {time.time() - t0:.0f}s", flush=True)
