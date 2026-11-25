"""Free Hindi voice cloning with AI4Bharat IndicF5 (MIT licence, runs on CPU).
Each character gets a short reference recording (5-12 s) + its exact Hindi text;
the model then speaks any new line in that voice.
Only use reference voices you have permission to use (your own recordings, family with consent,
or voices you generated yourself)."""
import os, sys, time
import numpy as np, soundfile as sf

MODEL = os.environ.get("F5_MODEL", "/tmp/claude-0/models/IndicF5")
_m = {}


def load():
    if "model" not in _m:
        import torch, torchaudio
        def sf_load(path, *a, **k):   # torchaudio 2.11 needs torchcodec for load(); soundfile does the same job
            data, sr = sf.read(path, dtype="float32", always_2d=True)
            return torch.from_numpy(data.T.copy()), sr
        torchaudio.load = sf_load
        import huggingface_hub
        orig = huggingface_hub.hf_hub_download
        def local_first(repo_id, filename, **kw):   # the model code fetches vocab.txt; use our local copy
            f = os.path.join(repo_id, filename)
            return f if os.path.exists(f) else orig(repo_id, filename, **kw)
        huggingface_hub.hf_hub_download = local_first
        from transformers import AutoModel
        cwd = os.getcwd(); os.chdir(MODEL)          # model code reads files relative to its folder
        try:
            model = AutoModel.from_pretrained(MODEL, trust_remote_code=True)
            # transformers renames weights called gamma/beta while loading -> load the file directly so all match
            from safetensors.torch import load_file
            missing, unexpected = model.load_state_dict(load_file(os.path.join(MODEL, "model.safetensors")), strict=False)
            assert not unexpected, unexpected[:5]
            _m["model"] = model.eval()
        finally:
            os.chdir(cwd)
    return _m["model"]


def speak(text, ref_audio, ref_text, out_wav):
    model = load()
    audio = model(text, ref_audio_path=os.path.abspath(ref_audio), ref_text=ref_text)
    audio = np.asarray(audio, dtype=np.float32)
    if audio.dtype == np.int16 or np.abs(audio).max() > 1.5:
        audio = audio / 32768.0
    sf.write(out_wav, audio, 24000)
    return out_wav


if __name__ == "__main__":
    t0 = time.time(); load(); print(f"loaded in {time.time() - t0:.0f}s", flush=True)
    out, ref, ref_text, text = sys.argv[1:5]
    t0 = time.time(); speak(text, ref, ref_text, out); print(f"spoke in {time.time() - t0:.0f}s")
