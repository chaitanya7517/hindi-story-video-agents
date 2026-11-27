"""Music & sound agent: makes original background music and sound effects with code (no samples,
no copyright issues), then mixes them under the voices.
- music follows each scene's mood (projects/<p>/music.json: {"moods": {"1": "comic", ...}, "sfx": [[scene, line, offset_s, "name"], ...]})
- music is ducked (quieter) while someone speaks
Output: projects/<p>/audio/mix.wav (used by tools/render.js when it exists)
Usage: python tools/music.py <project>"""
import json, os, sys, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
rnd = np.random.default_rng(7)
SA = 146.83                                   # Sa = D3
SCALE = [0, 2, 4, 7, 9]                       # Bhupali-like pentatonic: S R G P D (bright, happy)
def hz(step, octave=0): return SA * 2 ** ((SCALE[step % 5] + 12 * (step // 5) + 12 * octave) / 12)
def env(n, a=.01, r=.3):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-3)); return e * np.exp(-t / max(r, 1e-3))
def tone(f, dur, harm=(1,), amps=(1,), a=.01, r=.3, vib=0):
    n = int(dur * SR); t = np.arange(n) / SR; ph = 2 * np.pi * f * t
    if vib: ph += vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / .4)
    y = sum(am * np.sin(h * ph) for h, am in zip(harm, amps)); return y * env(n, a, r)
def add(buf, y, at):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(y)); buf[i:j] += y[:j - i]
# ---- instruments ----
def tanpura(buf, t0, t1, vol=.10):
    seq, t, k = [7, 12, 12, 0], t0, 0
    while t < t1:
        f = SA * 2 ** (seq[k % 4] / 12) / 2
        add(buf, vol * tone(f, 3.5, harm=range(1, 14), amps=[1 / h ** .9 for h in range(1, 14)], a=.02, r=1.6), t); t += .75; k += 1
def flute(buf, t0, t1, bpm=70, vol=.07, octave=2, seed=1, density=.75):
    r = np.random.default_rng(seed); t, step = t0, 5
    while t < t1 - .5:
        d = 60 / bpm * r.choice([1, 1, 2, .5, 1.5])
        if r.random() < density:
            step = int(np.clip(step + r.choice([-2, -1, -1, 1, 1, 2, 0]), 0, 9))
            y = tone(hz(step, octave - 1), d * 1.1, harm=(1, 2, 3), amps=(1, .25, .08), a=.06, r=d * .9, vib=.8)
            y += .03 * r.standard_normal(len(y)) * env(len(y), .02, .08)           # breath
            add(buf, vol * y, t)
        t += d
def pluck(buf, t0, t1, bpm=120, vol=.08, seed=2):  # playful pizzicato (santoor-like)
    r = np.random.default_rng(seed); t, step = t0, 4
    while t < t1:
        d = 60 / bpm * r.choice([.5, .5, 1])
        step = int(np.clip(step + r.choice([-1, 1, 2, -2]), 0, 9))
        add(buf, vol * tone(hz(step, 1), .6, harm=(1, 2, 3, 4), amps=(1, .5, .3, .15), a=.003, r=.18), t); t += d
def tabla(buf, t0, t1, bpm=90, vol=.16, pattern="dha ge na ti na ka dhi na"):
    beat, t, i = 60 / bpm / 2, t0, 0; bols = pattern.split()
    while t < t1:
        b = bols[i % len(bols)]; n = int(.5 * SR); tt = np.arange(n) / SR
        bass = np.sin(2 * np.pi * (70 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
        ring = np.sin(2 * np.pi * 420 * tt) * np.exp(-tt * 14) + .4 * np.sin(2 * np.pi * 1000 * tt) * np.exp(-tt * 30)
        y = (bass * (1 if b in ("dha", "ge", "dhi") else 0) + ring * (.8 if b in ("dha", "na", "ti", "dhi") else .3) + (.2 * rnd.standard_normal(n) * np.exp(-tt * 60) if b in ("ka", "ti") else 0))
        add(buf, vol * y * (1.2 if i % len(bols) == 0 else .8), t); t += beat; i += 1
def bell(buf, at, vol=.12, f=880):
    n = int(3 * SR); tt = np.arange(n) / SR
    add(buf, vol * sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt * d) for m, a, d in ((1, 1, 1.2), (2.76, .5, 2), (5.4, .25, 3), (8.9, .1, 4))), at)
# ---- sound effects ----
def sfx(name):
    n = lambda s: int(s * SR)
    if name == "whoosh":
        k = n(1.4); tt = np.arange(k) / SR; x = rnd.standard_normal(k); y = np.convolve(x, np.ones(30) / 30, "same")
        return .5 * y * np.sin(np.pi * tt / 1.4) ** 2
    if name == "crunch":
        out = np.zeros(n(1.2))
        for j in range(5): k = n(.09); tt = np.arange(k) / SR; add(out, .5 * rnd.standard_normal(k) * np.exp(-tt * 40), j * .2)
        return out
    if name == "munch":
        out = np.zeros(n(1.6))
        for j in range(4): k = n(.12); tt = np.arange(k) / SR; add(out, .35 * np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 30) + .12 * rnd.standard_normal(k) * np.exp(-tt * 50), j * .32)
        return out
    if name == "sparkle":
        out = np.zeros(n(1.6))
        for j, f in enumerate([1568, 1976, 2349, 2637, 3136]): add(out, .18 * tone(f, .8, a=.002, r=.25), j * .08)
        return out
    if name == "coins":
        out = np.zeros(n(1.5))
        for j in range(14): add(out, .12 * tone(rnd.uniform(2500, 4200), .25, harm=(1, 2.7), amps=(1, .4), a=.001, r=.06), rnd.uniform(0, 1.1))
        return out
    if name == "boing":
        k = n(.7); tt = np.arange(k) / SR; return .4 * np.sin(2 * np.pi * (200 + 300 * np.sin(tt * 18) * np.exp(-tt * 3)) * tt) * np.exp(-tt * 4)
    if name == "gong":
        out = np.zeros(n(4)); bell(out, 0, .35, 220); return out
    if name == "sting":   # title hit: tabla 'dha' + bell
        out = np.zeros(n(2.5)); tabla(out, 0, .3, bpm=60, vol=.5, pattern="dha"); bell(out, 0, .25, 587); return out
    if name == "laugh":   # light comic run up
        out = np.zeros(n(1.2))
        for j, st in enumerate([0, 2, 4, 5, 7]): add(out, .15 * tone(hz(st, 1), .3, harm=(1, 2), amps=(1, .3), a=.002, r=.12), j * .09)
        return out
    raise ValueError(name)
MOODS = {
    "soft":   lambda b, a, z, s: (tanpura(b, a, z, .07), flute(b, a + 1, z, 64, .05, 2, s, .55)),
    "royal":  lambda b, a, z, s: (tanpura(b, a, z, .07), flute(b, a, z, 84, .06, 2, s, .8), tabla(b, a, z, 84, .10)),
    "divine": lambda b, a, z, s: (tanpura(b, a, z, .10), flute(b, a + 2, z, 52, .05, 2, s, .5), [bell(b, t, .05, 587) for t in np.arange(a + 1, z, 7)]),
    "comic":  lambda b, a, z, s: (pluck(b, a, z, 132, .07, s), tabla(b, a, z, 132, .11, "dha dha ti na")),
    "playful":lambda b, a, z, s: (pluck(b, a, z, 112, .06, s), tabla(b, a, z, 112, .09)),
    "joy":    lambda b, a, z, s: (tanpura(b, a, z, .06), pluck(b, a, z, 120, .06, s), flute(b, a, z, 120, .05, 2, s + 9, .7), tabla(b, a, z, 120, .11)),
}
def read_wav(p):
    with wave.open(p) as w: sr, x = w.getframerate(), np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x
def main(name):
    proj = os.path.join(ROOT, "projects", name)
    cfg = json.load(open(os.path.join(proj, "music.json")))
    tl = json.load(open(os.path.join(proj, "6-timeline.json")))
    sb = {s["id"]: s for s in json.load(open(os.path.join(proj, "4-storyboard.json")))["shots"]}
    end = tl["duration"] + cfg.get("end_extra", 5)
    scenes = {}
    for s in tl["shots"]:
        sc = sb[s["id"]]["scene"]; a, z = scenes.get(sc, (s["start"], s["end"])); scenes[sc] = (min(a, s["start"]), max(z, s["end"]))
    lines = {}
    for s in tl["shots"]:
        for l in s["lines"]: lines.setdefault(sb[s["id"]]["scene"], []).append(l)
    music = np.zeros(int((end + 3) * SR))
    keys = sorted(scenes); 
    for i, sc in enumerate(keys):
        a, z = scenes[sc]; z = end if i == len(keys) - 1 else scenes[keys[i + 1]][0]
        seg = np.zeros(len(music)); MOODS[cfg["moods"][str(sc)]](seg, a, z + .8, sc * 13)
        fade = np.ones(len(music)); ia, iz = int(a * SR), int((z + .8) * SR)
        fade[:ia] = 0; fade[iz:] = 0; r = int(.8 * SR)
        fade[ia:ia + r] *= np.linspace(0, 1, r)[:len(fade[ia:ia + r])]; fade[max(0, iz - r):iz] *= np.linspace(1, 0, r)[:len(fade[max(0, iz - r):iz])]
        music += seg * fade
    # duck music under speech (smooth)
    duck = np.ones(len(music))
    for s in tl["shots"]:
        for l in s["lines"]: duck[int((l["start"] - .15) * SR):int((l["end"] + .1) * SR)] = cfg.get("duck", .35)
    k = int(.25 * SR); duck = np.convolve(duck, np.ones(k) / k, "same")
    music *= duck * cfg.get("music_gain", 1.0)
    fx = np.zeros(len(music))
    for e in cfg.get("sfx", []):
        if len(e) == 2: add(fx, sfx(e[1]) * cfg.get("sfx_gain", .8), e[0]); continue   # [seconds, name] for silent cartoons
        sc, li, off, nm = e
        L = lines.get(sc, []); 
        if not L: continue
        l = L[min(li, len(L) - 1)]; t = (l["end"] if off < 0 else l["start"]) + off
        add(fx, sfx(nm) * cfg.get("sfx_gain", .8), max(0, t))
    vp = os.path.join(proj, "audio", "voice.wav")
    voice = read_wav(vp) if os.path.exists(vp) else np.zeros(1)   # music-only test before voices exist
    out = np.zeros(len(music)); out[:len(voice)] += voice; out += music + fx
    out[-int(3 * SR):] *= np.linspace(1, 0, int(3 * SR))
    peak = np.abs(out).max()
    a = np.abs(out); out = np.where(a > .85, np.sign(out) * (.85 + .13 * np.tanh((a - .85) / .13)), out)   # soft limiter: rare loud peaks are rounded off, voices stay loud
    with wave.open(os.path.join(proj, "audio", "mix.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
    print(f"mix.wav {len(out) / SR:.1f}s, peak {peak:.2f}, voice rms {np.sqrt((voice ** 2).mean()):.3f}, music rms {np.sqrt((music ** 2).mean()):.3f}")
if __name__ == "__main__":
    main(sys.argv[1])
