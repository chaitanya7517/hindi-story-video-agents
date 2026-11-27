"""Runs ON KAGGLE (free T4 GPU): picture agent. Makes story illustrations with FLUX.1-schnell (Apache-2.0, free for
commercial use), 4-step model in a compressed (GGUF) form so it fits the free GPU.
JOBS (filled in by tools/kaggle_images.py): [{id, prompt, w, h, seed}]  ->  /kaggle/working/out/<id>.png"""
import json, os, subprocess, sys, time
JOBS = json.loads(r'''__JOBS__''')
t0 = time.time()
os.environ.update(HF_HOME="/tmp/hf", USE_TF="0", USE_JAX="0", USE_FLAX="0")
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "diffusers>=0.32", "gguf", "accelerate", "sentencepiece", "protobuf"], check=True)
import torch
from diffusers import FluxPipeline, FluxTransformer2DModel, GGUFQuantizationConfig, AutoencoderKL, FlowMatchEulerDiscreteScheduler
from transformers import CLIPTextModel, CLIPTokenizer, T5EncoderModel, T5TokenizerFast
R, dt = "black-forest-labs/FLUX.1-schnell", torch.bfloat16
tr = FluxTransformer2DModel.from_single_file("https://huggingface.co/city96/FLUX.1-schnell-gguf/blob/main/flux1-schnell-Q5_K_S.gguf",
                                             quantization_config=GGUFQuantizationConfig(compute_dtype=dt), torch_dtype=dt, config=R, subfolder="transformer")
pipe = FluxPipeline(scheduler=FlowMatchEulerDiscreteScheduler.from_pretrained(R, subfolder="scheduler"),
                    text_encoder=CLIPTextModel.from_pretrained(R, subfolder="text_encoder", torch_dtype=dt), tokenizer=CLIPTokenizer.from_pretrained(R, subfolder="tokenizer"),
                    text_encoder_2=T5EncoderModel.from_pretrained(R, subfolder="text_encoder_2", torch_dtype=dt), tokenizer_2=T5TokenizerFast.from_pretrained(R, subfolder="tokenizer_2"),
                    vae=AutoencoderKL.from_pretrained(R, subfolder="vae", torch_dtype=dt), transformer=tr)
pipe.enable_model_cpu_offload()
print(f"loaded in {time.time() - t0:.0f}s, cuda {torch.cuda.is_available()}", flush=True)
os.makedirs("/kaggle/working/out", exist_ok=True)
for j in JOBS:
    t1 = time.time()
    img = pipe(j["prompt"], width=j.get("w", 1344), height=j.get("h", 768), num_inference_steps=4, guidance_scale=0.0, max_sequence_length=256,
               generator=torch.Generator("cpu").manual_seed(j.get("seed", 7))).images[0]
    img.save(f"/kaggle/working/out/{j['id']}.png"); print("image", j["id"], f"{time.time() - t1:.0f}s", flush=True)
print(f"done {len(JOBS)} images in {time.time() - t0:.0f}s", flush=True)
