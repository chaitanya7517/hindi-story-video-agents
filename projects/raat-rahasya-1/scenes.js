// =====================================================================
//  Episode 1 "आधी रात को आम के बाग़ में पायल किसकी?" — FLUX storybook pictures with slow camera moves,
//  Wan2.2 motion clips (played slowed at the start of their shot, then held), night fireflies,
//  narration + character voices, subtitles and music. A soft cross-fade on every picture change.
// =====================================================================
const CONFIG = { storyScenes: [], endExtra: 3 };
const CAST = { Dadi: { hindi: '' }, Monu: { hindi: 'मोनू', color: '#ffd166' }, Pari: { hindi: 'परी', color: '#ff9ecf' },
  Chintu: { hindi: 'चिंटू', color: '#ff8a65' }, Gauri: { hindi: 'गौरी', color: '#9be7a1' }, Amma: { hindi: 'गौरी की माँ', color: '#8fd3ff' } };
const P = '/projects/raat-rahasya-1/';
const NIGHT = new Set(["p01", "p02", "p09", "p10", "p11", "p12", "p13", "p14", "p15", "p19", "p20", "p21", "p22", "p23", "p24", "p25", "p26", "p27", "p34"]);
const IMG = {}, CLIP = {};
const load = src => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
const ready = (async () => {
  const ids = Array.from({ length: 34 }, (_, i) => 'p' + String(i + 1).padStart(2, '0'));
  await Promise.all(ids.map(async id => { const im = await load(P + 'images/' + id + '.png'); if (im) IMG[id] = im; else console.log('missing', id); }));
  const clips = await (await fetch(P + 'motion.json')).json();
  for (const c of clips.clips) {
    const fr = [];
    for (let f = 1; f <= 200; f++) { const im = await load(P + 'clips/' + c.id + '/' + String(f).padStart(4, '0') + '.jpg'); if (!im) break; fr.push(im); }
    if (fr.length) CLIP[c.id] = fr;
  }
})();
const _setup = window.setup;
window.setup = async d => {
  await ready;
  for (const s of d.storyboard.shots) s.set = s.id;            // every picture change gets the engine's cross-fade
  window.SB = Object.fromEntries(d.storyboard.shots.map(s => [s.id, s]));
  return _setup(d);
};
// Slow camera: each shot zooms in or out and drifts a little; the direction changes shot to shot.
const MOVES = [[1.0, 1.12, -20, 10], [1.14, 1.02, 30, -10], [1.02, 1.15, 25, 15], [1.12, 1.0, -25, -5], [1.0, 1.1, 0, -15], [1.1, 1.0, 20, 12]];
function cover(im, k, move) {
  const [z0, z1, dx, dy] = move, e = ease(k) * .7 + k * .3, z = lerp(z0, z1, e);
  const base = Math.max(W / im.width, H / im.height), w = im.width * base * z, h = im.height * base * z;
  ctx.drawImage(im, W / 2 - w / 2 + dx * (e - .5) * 2, H / 2 - h / 2 + dy * (e - .5) * 2, w, h);
}
const CLIP_SPEED = .6;  // 49 frames @24fps played at 0.6x -> about 3.4 s of motion
function fireflies(T, n = 26) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const r1 = Math.sin(i * 91.7) * .5 + .5, r2 = Math.sin(i * 47.3) * .5 + .5;
    const x = (r1 * W + Math.sin(T * .3 + i) * 60 + T * 6 * (i % 2 ? 1 : -1)) % W, y = H * (.35 + .55 * r2) + Math.sin(T * .5 + i * 2) * 40;
    const a = .35 + .65 * Math.max(0, Math.sin(T * 1.7 + i * 3.1));
    const g = ctx.createRadialGradient(x, y, 0, x, y, 16); g.addColorStop(0, `rgba(255,245,150,${a})`); g.addColorStop(1, 'rgba(255,220,80,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 16, y - 16, 32, 32);
  }
  ctx.restore();
}
const SCENES = {};
for (let n = 1; n <= 8; n++) SCENES[n] = {
  cam: [960, 540, 1], camAt: () => [960, 540, 1],
  draw(T, sh) {
    const s = SB[sh.id], k = clamp((T - sh.start + .5) / (sh.end - sh.start + 1)), mv = MOVES[parseInt(sh.id.slice(1)) % MOVES.length];
    const fr = s.clip && CLIP[s.clip];
    if (fr) { const f = Math.min(fr.length - 1, Math.max(0, Math.floor((T - sh.start) * 24 * CLIP_SPEED))); cover(fr[f], k, [mv[0], mv[1] * .97, mv[2] * .5, mv[3] * .5]); }
    else if (IMG[s.image]) cover(IMG[s.image], k, mv);
    else { rect(0, 0, W, H, '#111'); }
    if (NIGHT.has(s.image)) fireflies(T);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
};
function overlays(T) {
  if (T < 6) { const a = Math.min(clamp((T - .8) / .6), 1 - clamp((T - 5) / .8)); bigText('आधी रात को बाग़ में पायल किसकी?', 140, a, 96); }
  const end = END - 3;
  if (T > end - 9 && T < end) { const a = Math.min(clamp((T - (end - 9)) / .6), 1 - clamp((T - (end - .8)) / .8)); bigText('अगली रात: पुराने कुएँ का रहस्य…', 140, a, 84); }
}
