"""Audio agent: makes every spoken line, joins them per shot, writes timeline.json.
Usage: python3 tools/audio.py <project>"""
import difflib, json, os, re, subprocess, sys, time, wave
sys.path.insert(0, os.path.dirname(__file__))
import gemini as g

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAP = 0.35      # silence between lines (s)
TAIL = 0.8      # silence at end of each shot (s)
LEAD = 0.6      # silence before the first line of the video (s)

DIRECTION = {
    "Narrator": "Read in Hindi, warmly and slowly, like a loving storyteller for young children",
    "Mithi": "Say in Hindi like a sweet, excited 6-year-old girl",
    "Papa": "Say in Hindi like a kind, gentle, tired father",
    "Uluka": "Say in Hindi like a wise, magical, soft-voiced old owl",
}


def trim(p):
    """Cut silence at the start and end of a voice clip (keeps 0.1 s)."""
    f = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1"
    tmp = p + ".tmp.wav"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", p, "-af",
                    f"{f},areverse,{f},areverse", "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", tmp], check=True)
    os.replace(tmp, p)


def check(path, expected):
    """Audio agent self-check: transcribe the clip, reject English or text that does not match."""
    eng, r = g.sounds_english(path)
    norm = lambda x: re.sub(r"[^\u0900-\u097F]", "", x)  # keep only Devanagari letters
    score = difflib.SequenceMatcher(None, norm(r["transcript"]), norm(expected)).ratio()
    latin = eng
    if not eng and score < 0.75 and re.search(r"[A-Za-z]", r["transcript"]):
        score = 0.75  # Hindi written in Latin letters cannot be compared letter by letter
    ok = not eng and score >= 0.75
    print(f"  check {os.path.basename(path)}: {'ok' if ok else 'BAD'} (match {score:.2f}, english={bool(latin) or r.get('has_english')})")
    return ok


def sane_length(path, text):
    """Free-voice self-check (no API needed): speech speed must look human.
    Catches clips that are cut short, stuck in long silence, or babbling."""
    cps = len(text) / max(wav_len(path), 0.1)
    ok = 4 <= cps <= 22
    print(f"  check {os.path.basename(path)}: {'ok' if ok else 'BAD'} ({cps:.1f} letters/s)")
    return ok


def wav_len(p):
    with wave.open(p) as w:
        return w.getnframes() / w.getframerate()


def main(name, o_check=False):
    proj = os.path.join(ROOT, "projects", name)
    shots = json.load(open(os.path.join(proj, "4-storyboard.json")))["shots"]
    chars = json.load(open(os.path.join(proj, "3-characters.json")))
    voice = {c["name"]: c["voice"] for c in chars["characters"]}
    byname = {c["name"]: c for c in chars["characters"]}
    voice["Narrator"] = voice.get(chars["narrator_voice"], chars["narrator_voice"])
    if chars["narrator_voice"] in byname: byname["Narrator"] = byname[chars["narrator_voice"]]

    def make(line, out, retry=0):
        c = byname.get(line["speaker"], {})
        if c.get("voice") == "f5":       # free voice cloning (AI4Bharat IndicF5) from the character's reference clip
            import voice_f5
            voice_f5.speak(line["text"], os.path.join(ROOT, c["ref"]), c["ref_text"], out)
        elif c.get("voice") == "parler":   # free local voice model (AI4Bharat)
            import voice_parler
            voice_parler.speak(line["text"], c["voice_desc"], out, seed=c.get("seed", 7) + retry * 1000)
        else:                            # Google Gemini voice; Hindi text only (style notes get read aloud)
            g.speech(line["text"], voice[line["speaker"]], out)
    adir = os.path.join(proj, "audio", "lines")
    os.makedirs(adir, exist_ok=True)

    t = LEAD
    timeline = {"shots": []}
    concat = [f"file '{os.path.join(ROOT, 'tools', 'silence.wav')}'"]
    for s in shots:
        shot = {"id": s["id"], "start": t, "lines": []}
        for i, line in enumerate(s["lines"]):
            out = os.path.join(adir, f"{s['id']}-{i}.wav")
            parler = byname.get(line["speaker"], {}).get("voice") in ("parler", "f5")   # local models: speed check
            if os.path.exists(out) and o_check and not parler:
                if not check(out, line["text"]):
                    os.remove(out)
            if not os.path.exists(out):
                for attempt in range(5):
                    try:
                        make(line, out)
                        break
                    except RuntimeError as e:
                        if attempt == 4:
                            raise
                        wait = 40 if "429" in str(e) else 5
                        print(f"  retry in {wait}s: {str(e)[:60]}"); time.sleep(wait)
                trim(out)
                good = (lambda: sane_length(out, line["text"])) if parler else (lambda: check(out, line["text"]))
                if not good():   # one more try, then stop and report
                    os.remove(out)
                    make(line, out, retry=1)
                    trim(out)
                    if not good():
                        raise SystemExit(f"Voice for {out} is still wrong after a retry - please listen and decide.")
                print("voice", out[-12:], flush=True)
            d = wav_len(out)
            shot["lines"].append({"speaker": line["speaker"], "text": line["text"], "start": t, "end": t + d})
            concat += [f"file '{out}'"]
            t += d + GAP
            concat += [f"file '{os.path.join(ROOT, 'tools', 'gap.wav')}'"]
        t += TAIL - GAP
        concat += [f"file '{os.path.join(ROOT, 'tools', 'tail.wav')}'"]
        shot["end"] = t
        timeline["shots"].append(shot)
    timeline["duration"] = t
    json.dump(timeline, open(os.path.join(proj, "6-timeline.json"), "w"), ensure_ascii=False, indent=2)

    # Join all lines and silences into one narration track.
    lst = os.path.join(proj, "audio", "concat.txt")
    open(lst, "w").write("\n".join(concat))
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-c", "copy", os.path.join(proj, "audio", "voice.wav")], check=True)
    print(f"timeline: {len(shots)} shots, {t:.1f} s")


if __name__ == "__main__":
    # silence files at the same format as the voices (24 kHz mono 16-bit)
    for f, d in (("silence.wav", LEAD), ("gap.wav", GAP), ("tail.wav", TAIL - GAP)):
        p = os.path.join(ROOT, "tools", f)
        if not os.path.exists(p):
            subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                            "-t", str(d), "-c:a", "pcm_s16le", p], check=True)
    main(sys.argv[1], o_check='--check' in sys.argv)
