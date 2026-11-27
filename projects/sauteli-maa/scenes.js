// =====================================================================
//  "सौतेली माँ और गरीब बेटी" — sample: AI storybook pictures (FLUX) with slow Ken Burns camera moves,
//  narration + character voices, subtitles and soft music. One picture per shot (storyboard "image").
// =====================================================================
const CONFIG = { storyScenes: [], endExtra: 3 };
const CAST = { Dadi: { hindi: '' }, Meera: { hindi: 'मीरा', color: '#8fd3ff' }, Amma: { hindi: 'अम्मा', color: '#ffd166' } };
let NOW = 0;
const IMG = {};
const imgReady = (async () => {
  for (const id of ['p01', 'p02', 'p03', 'p04', 'p05']) {
    const im = new Image(); im.src = `/projects/sauteli-maa/images/${id}.png`;
    try { await im.decode(); IMG[id] = im; } catch (e) { console.log('missing', id); }
  }
})();
const _setup = window.setup;
window.setup = async d => { await imgReady; window.SB = Object.fromEntries(d.storyboard.shots.map(s => [s.id, s])); return _setup(d); };

// Ken Burns: each shot slowly zooms in or out and drifts; the direction alternates so cuts feel alive.
const MOVES = [[1.0, 1.12, -20, 10], [1.14, 1.02, 30, -10], [1.02, 1.15, 25, 15], [1.12, 1.0, -25, -5], [1.0, 1.1, 0, -15]];
function picture(id, k, move) {
  const im = IMG[id]; if (!im) { rect(0, 0, W, H, '#222'); return; }
  const [z0, z1, dx, dy] = move, e = ease(k) * .7 + k * .3, z = lerp(z0, z1, e);
  const base = Math.max(W / im.width, H / im.height), w = im.width * base * z, h = im.height * base * z;
  ctx.drawImage(im, W / 2 - w / 2 + dx * (e - .5) * 2, H / 2 - h / 2 + dy * (e - .5) * 2, w, h);
}
const SCENES = {};
for (let n = 1; n <= 5; n++) SCENES[n] = {
  cam: [960, 540, 1], camAt: () => [960, 540, 1],
  draw(T, sh) {
    NOW = T;
    const k = clamp((T - sh.start + .5) / (sh.end - sh.start + 1));
    picture(SB[sh.id].image, k, MOVES[(n - 1) % MOVES.length]);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
};
function overlays(T) {
  if (T < 5) { const a = Math.min(clamp((T - .5) / .6), 1 - clamp((T - 4) / .8)); bigText('सौतेली माँ और गरीब बेटी', 150, a, 110); }
}
