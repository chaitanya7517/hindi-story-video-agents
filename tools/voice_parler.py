"""Free Hindi voices with AI4Bharat Indic Parler-TTS (Apache-2.0, runs on CPU, no daily limit).
Usage (test):  python tools/voice_parler.py out.wav "voice description" "हिंदी पंक्ति"
Needs: torch, torchaudio (CPU builds), parler-tts, soundfile; Hugging Face read token for the model."""
import sys, time
import torch, soundfile as sf
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

import os
# Local copies (downloaded once with curl; see README). Falls back to the Hugging Face names.
MODEL = os.environ.get("PARLER_MODEL", "/tmp/claude-0/models/indic-parler-tts")
DESC_TOKENIZER = os.environ.get("PARLER_DESC_TOKENIZER", "/tmp/claude-0/models/flan-t5-large")
if not os.path.isdir(MODEL): MODEL = "ai4bharat/indic-parler-tts"
if not os.path.isdir(DESC_TOKENIZER): DESC_TOKENIZER = "google/flan-t5-large"
_m = {}


def load():
    if not _m:
        torch.set_num_threads(max(1, torch.get_num_threads()))
        model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL).eval()
        _m["model"] = model
        _m["tok"] = AutoTokenizer.from_pretrained(MODEL)
        _m["dtok"] = AutoTokenizer.from_pretrained(DESC_TOKENIZER)
    return _m


def speak(text, description, out_wav, seed=7):
    m = load()
    torch.manual_seed(seed)  # same seed -> same voice character every time
    d = m["dtok"](description, return_tensors="pt")
    p = m["tok"](text, return_tensors="pt")
    with torch.inference_mode():
        audio = m["model"].generate(input_ids=d.input_ids, attention_mask=d.attention_mask,
                                    prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
    sf.write(out_wav, audio.cpu().numpy().squeeze(), m["model"].config.sampling_rate)
    return out_wav


if __name__ == "__main__":
    t0 = time.time(); load(); print(f"model loaded in {time.time() - t0:.0f}s", flush=True)
    t0 = time.time(); speak(sys.argv[3], sys.argv[2], sys.argv[1]); print(f"spoke in {time.time() - t0:.0f}s")
