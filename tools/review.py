"""Reviewer agent: checks the rendered video and writes review.md.
Usage: python3 tools/review.py <project> [video file name]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
import gemini as g

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate",
                          "-of", "json", path], capture_output=True, text=True).stdout
    return json.loads(out)


def silences(path, min_len=2.5):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", f"silencedetect=n=-45dB:d={min_len}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(starts, ends + [None] * (len(starts) - len(ends))))


def main(name, video="draft.mp4"):
    proj = os.path.join(ROOT, "projects", name)
    path = os.path.join(proj, "output", video)
    tl = json.load(open(os.path.join(proj, "6-timeline.json")))
    shots = {s["id"]: s for s in json.load(open(os.path.join(proj, "4-storyboard.json")))["shots"]}
    chars = json.load(open(os.path.join(proj, "3-characters.json")))

    # 1. technical checks (no AI needed)
    info = probe(path)
    dur = float(info["format"]["duration"])
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    has_audio = any(s["codec_type"] == "audio" for s in info["streams"])
    sil = [s for s in silences(path) if s[0] < tl["duration"] - 1]
    tech = [
        ("Resolution is 1920x1080", v["width"] == 1920 and v["height"] == 1080, f"{v['width']}x{v['height']}"),
        ("Has a sound track", has_audio, ""),
        ("Length matches the voice track", abs(dur - (tl["duration"] + 2.5)) < 1.5, f"{dur:.1f}s"),
        ("No silence longer than 2.5s during the story", not sil, ", ".join(f"{a:.1f}s" for a, _ in sil)),
    ]

    # 1b. voice check: listen to each shot's audio in the final video
    eng = []
    for s in tl["shots"]:
        w = os.path.join(proj, "review_frames", f"{s['id']}.wav"); os.makedirs(os.path.dirname(w), exist_ok=True)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{s['start']:.2f}", "-to", f"{s['end']:.2f}", "-i", path,
                        "-ac", "1", "-ar", "24000", w], check=True)
        if g.sounds_english(w)[0]:
            eng.append(s["id"])
    tech.append(("Voices are Hindi only (no English heard)", not eng, ", ".join(eng)))

    # 2. visual checks: one frame per shot, judged by the reviewer model
    fdir = os.path.join(proj, "review_frames"); os.makedirs(fdir, exist_ok=True)
    frames, desc = [], []
    for s in tl["shots"]:
        t = (s["start"] + s["end"]) / 2
        f = os.path.join(fdir, f"{s['id']}.jpg")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t:.2f}", "-i", path, "-frames:v", "1", "-vf", "scale=960:-2", f], check=True)
        frames.append(f)
        desc.append(f"{s['id']} (frame {len(frames)}): {shots[s['id']]['visual']}  | spoken: "
                    + " / ".join(l["text"] for l in s["lines"]))
    system = open(os.path.join(ROOT, "agents", "09-reviewer.md")).read()
    prompt = ("This is a 2D cartoon (HTML-drawn) children's video, so judge it as a simple cartoon, not a photo.\n"
              "Also check that the Hindi subtitle at the bottom is readable and not cut off.\n\n"
              f"Character sheet:\n{json.dumps(chars['characters'], ensure_ascii=False)}\n\n"
              "Shots, in the same order as the attached frames:\n" + "\n".join(desc))
    vis = g.text_json(system, prompt, images=frames)

    # 3. write the report
    ok_tech = all(p for _, p, _ in tech)
    ok_vis = all(s.get("pass") for s in vis["shots"])
    md = [f"# Review: {name}/{video}", "", f"**Overall: {'PASS' if ok_tech and ok_vis else 'NEEDS FIXES'}**", "",
          "## Technical", ""]
    md += [f"- {'✅' if p else '❌'} {n} {('(' + d + ')') if d else ''}" for n, p, d in tech]
    md += ["", "## Each shot", "", "| Shot | Result | Problem | Fix hint |", "|---|---|---|---|"]
    md += [f"| {s['id']} | {'✅' if s.get('pass') else '❌'} | {s.get('problem', '')} | {s.get('fix_hint', '')} |" for s in vis["shots"]]
    md += ["", "## Reviewer summary", "", vis.get("overall", "")]
    open(os.path.join(proj, "7-review.md"), "w").write("\n".join(md) + "\n")
    print("\n".join(md))


if __name__ == "__main__":
    main(*sys.argv[1:])
