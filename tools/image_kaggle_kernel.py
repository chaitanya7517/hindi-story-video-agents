"""Runs ON KAGGLE (free T4 GPU): picture agent. Two models, both free for commercial use and downloadable without a login:
  flux: FLUX.1-schnell (Apache-2.0; open copy unsloth/FLUX.1-schnell + city96 GGUF Q5 so it fits the T4) - follows prompts best
  sdxl: Stable Diffusion XL base 1.0 (Open RAIL++-M) + MIT fp16 VAE fix - fallback
JOBS (filled in by tools/kaggle_images.py): [{id, prompt, w, h, seed}]  ->  /kaggle/working/out/<id>.png"""
import json, os, subprocess, sys, time
JOBS = json.loads(r'''__JOBS__''')
t0 = time.time()
os.environ.update(HF_HOME="/tmp/hf", USE_TF="0", USE_JAX="0", USE_FLAX="0")
MODEL = "__MODEL__"   # "flux" (FLUX.1-schnell, Apache-2.0, open copy by unsloth + city96 GGUF) or "sdxl"
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "diffusers", "accelerate", "gguf", "sentencepiece", "protobuf"], check=True)
import torch
NEG = "photo, photorealistic, 3d render, ugly, deformed face, extra fingers, extra limbs, bad anatomy, blurry, low quality, text, watermark, logo, signature, nsfw"
if MODEL == "flux":
    from diffusers import FluxPipeline, FluxTransformer2DModel, GGUFQuantizationConfig
    R, dt = "unsloth/FLUX.1-schnell", torch.bfloat16
    tr = FluxTransformer2DModel.from_single_file("https://huggingface.co/city96/FLUX.1-schnell-gguf/blob/main/flux1-schnell-Q5_K_S.gguf",
                                                 quantization_config=GGUFQuantizationConfig(compute_dtype=dt), torch_dtype=dt, config=R, subfolder="transformer")
    pipe = FluxPipeline.from_pretrained(R, transformer=tr, torch_dtype=dt)
    pipe.enable_model_cpu_offload()
    run = lambda j: pipe(j["prompt"], width=j.get("w", 1344), height=j.get("h", 768), num_inference_steps=4, guidance_scale=0.0, max_sequence_length=256,
                         generator=torch.Generator("cpu").manual_seed(j.get("seed", 7))).images[0]
else:
    from diffusers import StableDiffusionXLPipeline, AutoencoderKL, DPMSolverMultistepScheduler
    vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", vae=vae, torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True)
    run = lambda j: pipe(prompt=j["prompt"], negative_prompt=NEG, width=j.get("w", 1344), height=j.get("h", 768), num_inference_steps=30, guidance_scale=6.5,
                         generator=torch.Generator("cuda").manual_seed(j.get("seed", 7))).images[0]
print(f"loaded in {time.time() - t0:.0f}s, cuda {torch.cuda.is_available()}", flush=True)
os.makedirs("/kaggle/working/out", exist_ok=True)
for j in JOBS:
    t1 = time.time()
    img = run(j)
    img.save(f"/kaggle/working/out/{j['id']}.png"); print("image", j["id"], f"{time.time() - t1:.0f}s", flush=True)
print(f"done {len(JOBS)} images in {time.time() - t0:.0f}s", flush=True)
