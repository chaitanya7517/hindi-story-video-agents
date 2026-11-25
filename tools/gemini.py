"""Small helpers for Google Gemini models: text (JSON), images, speech, music.
The API key is added by the network proxy, so none is stored here."""
import base64, json, os, time, wave
import requests

BASE = "https://generativelanguage.googleapis.com/v1beta/models"
TEXT_MODELS = os.environ.get("TEXT_MODELS", "gemini-3.6-flash,gemini-3.5-flash,gemini-3-flash-preview,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-lite-latest").split(",")
IMAGE_MODEL = os.environ.get("IMAGE_MODEL", "gemini-3-pro-image")
TTS_MODELS = os.environ.get("TTS_MODELS", "gemini-3.1-flash-tts-preview,gemini-3.8-flash-tts,gemini-3.8-flash-lite-tts").split(",")
MUSIC_MODEL = os.environ.get("MUSIC_MODEL", "lyria-3-pro-preview")

# Rough cost per call in USD, only for the budget log.
COST = {"text": 0.03, "image": 0.14, "tts": 0.01, "music": 0.10}
spent = {"usd": 0.0, "calls": {}}


def _log(kind):
    spent["usd"] += COST[kind]
    spent["calls"][kind] = spent["calls"].get(kind, 0) + 1


def _headers():
    # On your own computer, set GEMINI_API_KEY (from aistudio.google.com). In the cloud session the proxy adds it.
    key = os.environ.get("GEMINI_API_KEY")
    return {"x-goog-api-key": key} if key else {}


def _call(model, body, tries=4):
    for i in range(tries):
        r = requests.post(f"{BASE}/{model}:generateContent", json=body, headers=_headers(), timeout=600)
        if r.status_code == 200:
            return r.json()
        if r.status_code in (429, 500, 502, 503, 504) and i < tries - 1:
            time.sleep(10 * (i + 1))
            continue
        raise RuntimeError(f"{model} {r.status_code}: {r.text[:500]}")


def _parts(resp):
    try:
        return resp["candidates"][0]["content"]["parts"]
    except (KeyError, IndexError):
        raise RuntimeError(f"No output: {json.dumps(resp)[:500]}")


def _img_part(path):
    mime = "image/png" if path.endswith(".png") else "image/jpeg"
    with open(path, "rb") as f:
        return {"inlineData": {"mimeType": mime, "data": base64.b64encode(f.read()).decode()}}


def text_json(system, prompt, images=()):
    """Run an agent: its instruction file is the system prompt; returns parsed JSON."""
    parts = [{"text": prompt}] + [_img_part(p) for p in images]
    body = {"systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"responseMimeType": "application/json"}}
    for i, m in enumerate(TEXT_MODELS):  # fall back to the next model if one is busy
        try:
            resp = _call(m, body, tries=2)
            break
        except RuntimeError as e:
            if i == len(TEXT_MODELS) - 1:
                raise
            print(f"  {m} busy, trying next model")
    _log("text")
    txt = "".join(p.get("text", "") for p in _parts(resp))
    return json.loads(txt)


def image(prompt, out, refs=(), aspect="16:9"):
    parts = [_img_part(p) for p in refs] + [{"text": prompt}]
    body = {"contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"],
                                 "imageConfig": {"aspectRatio": aspect, "imageSize": "2K"}}}
    resp = _call(IMAGE_MODEL, body)
    _log("image")
    for p in _parts(resp):
        if "inlineData" in p:
            with open(out, "wb") as f:
                f.write(base64.b64decode(p["inlineData"]["data"]))
            return out
    raise RuntimeError("No image returned")


def speech(text, voice, out_wav, direction=None):
    """Speak `text` with a fixed voice. Only the first model gets the style direction:
    the backup models were found to read English directions aloud, so they get the bare text."""
    def body(with_direction):
        prompt = f"{direction}: {text}" if (direction and with_direction) else text
        return {"contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {"responseModalities": ["AUDIO"],
                                     "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    err = None
    for i, m in enumerate(TTS_MODELS):  # next model when one hits its daily free limit
        try:
            resp = _call(m, body(i == 0), tries=1)
            pcm = base64.b64decode(_parts(resp)[0]["inlineData"]["data"])
            break
        except RuntimeError as e:
            err = e
            if "429" not in str(e):
                raise
    else:
        raise err
    _log("tts")
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
    return out_wav


def music(prompt, out):
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["AUDIO"]}}
    resp = _call(MUSIC_MODEL, body)
    _log("music")
    for p in _parts(resp):
        if "inlineData" in p:
            mime = p["inlineData"]["mimeType"]
            data = base64.b64decode(p["inlineData"]["data"])
            ext = ".mp3" if "mp3" in mime or "mpeg" in mime else ".wav"
            if "L16" in mime or "pcm" in mime:  # raw audio
                with wave.open(out + ".wav", "wb") as w:
                    w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000); w.writeframes(data)
                return out + ".wav"
            with open(out + ext, "wb") as f:
                f.write(data)
            return out + ext
    raise RuntimeError("No music returned")


def transcribe(wav_path):
    """Write down exactly what is spoken in an audio clip (used to check voices)."""
    with open(wav_path, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    body = {"contents": [{"role": "user", "parts": [
        {"text": "Transcribe this audio exactly as spoken. Write Hindi words in Devanagari and English words "
                 "in Latin letters. Do not translate. Return JSON {\"transcript\":\"\", \"has_english\": true/false}"},
        {"inlineData": {"mimeType": "audio/wav", "data": data}}]}],
        "generationConfig": {"responseMimeType": "application/json"}}
    for i, m in enumerate(TEXT_MODELS):
        try:
            resp = _call(m, body, tries=2)
            break
        except RuntimeError:
            if i == len(TEXT_MODELS) - 1:
                raise
    _log("text")
    return json.loads("".join(p.get("text", "") for p in _parts(resp)))


def sounds_english(wav_path):
    """True only if English is heard in two separate listens (one listen sometimes writes Hindi in Latin letters)."""
    import re as _re
    for _ in range(2):
        r = transcribe(wav_path)
        if not (r.get("has_english") or _re.search(r"[A-Za-z]{2,}", r.get("transcript", ""))):
            return False, r
    return True, r
