"""Manager: runs the agents in order for one video project.
Usage: python3 tools/run.py <project> --minutes 2 [--until storyboard|prompts] [--theme "..."]
Each step saves its output in projects/<project>/ and is skipped if that file exists,
so a step can be redone by deleting its file."""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import gemini as g

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = ("Gemini voices (all speak Hindi): Sulafat (warm female), Achernar (soft female), "
          "Leda (youthful female), Kore (firm female), Puck (upbeat male), Achird (friendly male), "
          "Charon (deep calm male), Iapetus (clear male), Enceladus (breathy male), Gacrux (mature female)")


def agent(name):
    with open(os.path.join(ROOT, "agents", name)) as f:
        return f.read()


def step(proj, filename, make):
    path = os.path.join(proj, filename)
    if os.path.exists(path):
        print(f"skip  {filename} (exists)")
        return json.load(open(path))
    print(f"run   {filename} ...", flush=True)
    data = make()
    json.dump(data, open(path, "w"), ensure_ascii=False, indent=2)
    return data


def image_prompt(shot, chars, style, locs):
    who = "\n".join(f"- {c['name']}: {c['look']}" for c in chars if c["name"] in shot["characters"])
    loc = next((l["look"] for l in locs if l["id"] == shot["location"]), shot["location"])
    return (f"{style}\n\nLocation: {loc}\n\nCharacters in this shot (keep exactly this look):\n{who or '- none'}\n\n"
            f"Shot: {shot['visual']}\n\nWide 16:9 frame. No text, letters or watermarks.")


def main():
    a = argparse.ArgumentParser()
    a.add_argument("project")
    a.add_argument("--minutes", type=float, default=2)
    a.add_argument("--theme", default="Indian village life, moral story for kids")
    a.add_argument("--until", default="prompts")
    o = a.parse_args()
    proj = os.path.join(ROOT, "projects", o.project)
    os.makedirs(proj, exist_ok=True)

    idea = step(proj, "1-idea.json", lambda: g.text_json(
        agent("01-idea.md"), f"Theme: {o.theme}. Story is told in Hindi."))
    chosen = idea["ideas"][idea["chosen"]]

    script = step(proj, "2-script.json", lambda: g.text_json(
        agent("02-script.md"), f"Length: {o.minutes} minutes.\nIdea: {json.dumps(chosen, ensure_ascii=False)}"))

    chars = step(proj, "3-characters.json", lambda: g.text_json(
        agent("04-characters-style.md"),
        f"{VOICES}\n\nScript:\n{json.dumps(script, ensure_ascii=False)}"))

    shots = step(proj, "4-storyboard.json", lambda: g.text_json(
        agent("03-storyboard.md"),
        f"characters.json:\n{json.dumps(chars, ensure_ascii=False)}\n\nScript:\n{json.dumps(script, ensure_ascii=False)}"))
    if o.until == "storyboard":
        return

    # Image agent, part 1: build the exact prompt for every shot (no credits spent).
    with open(os.path.join(proj, "5-image-prompts.md"), "w") as f:
        for s in shots["shots"]:
            f.write(f"## {s['id']}\n\n{image_prompt(s, chars['characters'], chars['style'], chars['locations'])}\n\n")
    print("wrote 5-image-prompts.md")
    print(f"approx spend so far: ${g.spent['usd']:.2f} (free tier)")


if __name__ == "__main__":
    main()
