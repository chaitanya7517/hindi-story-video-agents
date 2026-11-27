"""Runs ON KAGGLE (free GPU). Makes every voice line listed in the jobs dataset with AI4Bharat IndicF5.
Inputs (Kaggle datasets attached to this notebook):
  <user>/indicf5-model  : the IndicF5 model folder (MIT licence)
  <user>/voice-jobs     : jobs.json [{id, text, ref, ref_text}] + refs/*.wav
Output: /kaggle/working/out/<id>.wav (24 kHz) - downloaded by tools/kaggle_voices.py"""
import glob, json, os, subprocess, sys, time
t0 = time.time()
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "git+https://github.com/ai4bharat/IndicF5.git", "transformers==4.46.1"], check=True)
import numpy as np, soundfile as sf, torch, torchaudio

MODEL = os.path.dirname(glob.glob("/kaggle/input/**/model.safetensors", recursive=True)[0])
JOBS = os.path.dirname(glob.glob("/kaggle/input/**/jobs.json", recursive=True)[0])
OUT = "/kaggle/working/out"; os.makedirs(OUT, exist_ok=True)
print("model", MODEL, "jobs", JOBS, "cuda", torch.cuda.is_available(), flush=True)

def sf_load(path, *a, **k):  # same loader as tools/voice_f5.py
    data, sr = sf.read(path, dtype="float32", always_2d=True)
    return torch.from_numpy(data.T.copy()), sr
torchaudio.load = sf_load
import huggingface_hub
orig = huggingface_hub.hf_hub_download
def local_first(repo_id, filename, **kw):
    f = os.path.join(repo_id, filename)
    return f if os.path.exists(f) else orig(repo_id, filename, **kw)
huggingface_hub.hf_hub_download = local_first
from transformers import AutoModel
from safetensors.torch import load_file
os.chdir(MODEL)
model = AutoModel.from_pretrained(MODEL, trust_remote_code=True)
missing, unexpected = model.load_state_dict(load_file(os.path.join(MODEL, "model.safetensors")), strict=False)
assert not unexpected, unexpected[:5]
model = model.eval()
print(f"loaded in {time.time() - t0:.0f}s", flush=True)

jobs = json.load(open(os.path.join(JOBS, "jobs.json")))
for j in jobs:
    t1 = time.time()
    with torch.inference_mode():
        audio = model(j["text"], ref_audio_path=os.path.join(JOBS, j["ref"]), ref_text=j["ref_text"])
    audio = np.asarray(audio, dtype=np.float32)
    if np.abs(audio).max() > 1.5: audio = audio / 32768.0
    sf.write(os.path.join(OUT, j["id"] + ".wav"), audio, 24000)
    print("voice", j["id"], f"{time.time() - t1:.1f}s", flush=True)
print(f"done {len(jobs)} lines in {time.time() - t0:.0f}s", flush=True)
