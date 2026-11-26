// =====================================================================
//  "गणेश जी और टूटा पुल" — scenes for the reusable engine (assets/engine/engine.js)
//  Scene numbers = scene numbers in 2-script.json. Actions are timed to spoken lines with L(scene, lineIndex).
// =====================================================================
const CONFIG = { storyScenes: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], endExtra: 4 };

const CAST = {
  Dadi: { hindi: 'दादी', color: '#ffd166', look: { age: 'old', female: true, skin: '#c98a5e', hair: 'bun', hairCol: '#e8e6e0', glasses: true, bindi: true, topStyle: 'saree', top: '#f3e6c8', pallu: '#efe0bd', bottom: '#f3e6c8', bottomStyle: 'saree', border: '#8a1c1c', earrings: true } },
  Pari: { hindi: 'परी', color: '#ff9ecb', look: { age: 'child', female: true, skin: '#d29a6c', hair: 'bob', clip: '#ff5fa2', topStyle: 'frock', top: '#ff8fb8', bottom: '#ff8fb8', bottomStyle: 'frock', border: '#3fae5a', earrings: true } },
  Monu: { hindi: 'मोनू', color: '#8fd3ff', look: { age: 'child', skin: '#c98a5e', hair: 'messy', topStyle: 'kurta', top: '#7ec8f0', bottom: '#f4f1ea', bottomStyle: 'pyjama' } },
  Golu: { hindi: 'गोलू', color: '#ffb347', look: { age: 'child', skin: '#b97a4c', hair: 'spiky', topStyle: 'vest', top: '#f28c28', bottom: '#a8925f', bottomStyle: 'shorts', belly: .5 } },
  Meena: { hindi: 'मीना', color: '#9be7a5', look: { age: 'child', female: true, skin: '#c08050', hair: 'plait', ribbon: '#d8262e', topStyle: 'choli', top: '#f5c518', bottom: '#2e9e5b', bottomStyle: 'ghagra', border: '#c0392b', earrings: true } },
  Baba: { hindi: 'बाबा', color: '#ffd27a', look: { age: 'old', skin: '#c98a5e', hair: 'turban', turban: '#f2b705', turbanTail: true, topStyle: 'kurta', top: '#f3e9d2', bottom: '#f3e9d2', bottomStyle: 'dhoti', belly: 1, bigEars: true, tilak: true, shawl: '#e8781e', mala: '#c0392b', mustache: 1, mustacheCol: '#dcdcdc' } },
  Ramdin: { hindi: 'रामदीन', color: '#ff8a80', look: { age: 'adult', skin: '#a86a43', hair: 'turban', turban: '#c0392b', topStyle: 'kurta', top: '#f4f1ea', waistcoat: '#7a4a2a', bottom: '#f4f1ea', bottomStyle: 'dhoti', mustache: 2 } },
  Shyamlal: { hindi: 'श्यामलाल', color: '#b5e48c', look: { age: 'adult', skin: '#b07a50', hair: 'turban', turban: '#2e8b57', topStyle: 'kurta', top: '#f4f1ea', bottom: '#f4f1ea', bottomStyle: 'dhoti', beard: '#a0a0a0', mustache: 1, mustacheCol: '#a0a0a0' } },
};
// extra villagers / children (fixed looks so they stay the same)
const EXTRA = (() => {
  const r = rng(77), tops = ['#e74c3c', '#3498db', '#9b59b6', '#16a085', '#e67e22', '#d35400', '#2980b9', '#c0392b'], skins = ['#c98a5e', '#b0744a', '#d29a6c', '#a86a43'];
  return [...Array(16)].map((_, i) => {
    const kid = i < 10, fem = i % 2 === 0;
    return { age: kid ? 'child' : 'adult', female: fem, skin: skins[i % 4], hair: fem ? (kid ? 'braids' : 'bun') : (i % 3 ? 'short' : 'turban'), turban: tops[(i + 3) % 8],
      topStyle: fem ? (kid ? 'frock' : 'saree') : 'kurta', top: tops[i % 8], bottom: fem ? tops[(i + 2) % 8] : '#f0ebe0', bottomStyle: fem ? (kid ? 'frock' : 'saree') : (kid ? 'shorts' : 'dhoti'), border: '#f1c40f', pallu: tops[(i + 1) % 8] };
  });
})();
let NOW = 0;
function who(name, x, y, s, o = {}) { const c = CAST[name]; person(x, y, s, { name, look: c.look, t: NOW, talk: speakerAt(NOW) === name && !o.mute, seed: name.length, ...o }); }
function extra(i, x, y, s, o = {}) { person(x, y, s, { look: EXTRA[i % EXTRA.length], t: NOW, seed: i * 1.3, ...o }); }

// ---------------- backgrounds ----------------
const BG = {};
function cache(name, fn) { const c = mkCanvas(); const old = ctx; ctx = c.getContext('2d'); fn(); ctx = old; BG[name] = c; }
const SKY = {
  morning: [['#9fd8f7', 0], ['#fdf1c7', 1]], noon: [['#6fc3f0', 0], ['#cfeefe', 1]], afternoon: [['#7fc6ee', 0], ['#ffe2a8', 1]],
  evening: [['#3a3a7c', 0], ['#f0a070', 1]], night: [['#070d2c', 0], ['#1e2a5a', 1]], storm: [['#1a1f2e', 0], ['#3c4452', 1]], festival: [['#8ccff5', 0], ['#fff0c8', 1]],
};
function buildBackgrounds() {
  for (const tod of Object.keys(SKY)) cache('river_' + tod, () => riverBase(tod));
  for (const m of ['evening', 'night']) cache('court_' + m, () => courtBase(m));
  cache('temple', templeBase);
}
const dim = tod => tod === 'night' ? .45 : tod === 'storm' ? .55 : tod === 'evening' ? .8 : 1;
function tint(hex, k) { return darker(hex, k); }
function riverBase(tod) {
  const k = dim(tod), [a, b] = SKY[tod];
  rect(0, 0, W, 470, lg(0, 0, 0, 470, [[0, a[0]], [1, b[0]]]));
  if (tod === 'morning' || tod === 'festival') light(300, 230, 260, '255,230,160', .5);
  // far hills
  ctx.fillStyle = tint('#7fae6a', k * .9); ctx.beginPath(); ctx.moveTo(0, 430); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 380 + Math.sin(x * .006) * 30 + Math.sin(x * .017) * 10); ctx.lineTo(W, 470); ctx.lineTo(0, 470); ctx.fill();
  // temple hill (right)
  ctx.fillStyle = tint('#6e9a58', k); ctx.beginPath(); ctx.moveTo(1450, 470); ctx.quadraticCurveTo(1700, 180, 1920, 330); ctx.lineTo(1920, 470); ctx.fill();
  templeSmall(1720, 268, .9, k);
  // banks
  poly([0, 430, 830, 430, 560, 1080, 0, 1080], lg(0, 430, 0, 1080, [[0, tint('#8dbb5f', k)], [1, tint('#5f8f3c', k)]]));
  poly([1090, 430, 1920, 430, 1920, 1080, 1360, 1080], lg(0, 430, 0, 1080, [[0, tint('#8dbb5f', k)], [1, tint('#5f8f3c', k)]]));
  poly([830, 430, 852, 430, 590, 1080, 560, 1080], tint('#9a7a52', k)); poly([1068, 430, 1090, 430, 1360, 1080, 1330, 1080], tint('#9a7a52', k));
  // paths
  poly([300, 1080, 420, 1080, 650, 610, 610, 610], tint('#c9a873', k * .95)); poly([1500, 1080, 1620, 1080, 1310, 610, 1270, 610], tint('#c9a873', k * .95));
  // villages
  const r = rng(9);
  for (let i = 0; i < 6; i++) hut(80 + i * 105, 445 + (i % 2) * 18, .55 + r() * .15, k, ['#c98a5e', '#d9a066', '#b7794a'][i % 3]);
  for (let i = 0; i < 5; i++) hut(1150 + i * 110, 450 + (i % 2) * 16, .55 + r() * .15, k, ['#d9a066', '#c98a5e', '#e0b080'][i % 3]);
  // bushes, rocks
  for (let i = 0; i < 18; i++) { const x = r() < .5 ? r() * 500 : 1450 + r() * 470, y = 620 + r() * 420; ell(x, y, 30 + r() * 40, 18 + r() * 14, tint(['#4f8a35', '#5f9a40', '#3f7a2c'][i % 3], k)); }
}
function hut(x, y, s, k, wall) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(-60, -70, 120, 70, tint(wall, k)); poly([-75, -70, 75, -70, 0, -130], tint('#8a4a2a', k)); for (let i = -60; i < 60; i += 14) line(i, -70, i * .5, -122, 2, tint('#6a3a1a', k));
  rect(-12, -44, 24, 44, tint('#4a2c18', k)); ctx.restore();
}
function templeSmall(x, y, s, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(-70, -60, 140, 60, tint('#f2e2c4', k)); poly([-50, -60, 50, -60, 0, -170], tint('#f0d9a8', k)); for (let i = 1; i < 5; i++) line(-50 + i * 6, -60 - i * 22, 50 - i * 6, -60 - i * 22, 3, tint('#d8b47a', k));
  rect(-16, -40, 32, 40, tint('#8a3a1a', k)); line(0, -170, 0, -215, 3, '#6b4a2a'); poly([0, -215, 40, -203, 0, -190], '#ff8c1a');
  ctx.restore();
}
function courtBase(m) {
  const n = m === 'night';
  rect(0, 0, W, 340, n ? lg(0, 0, 0, 340, [[0, '#070d2c'], [1, '#1e2a5a']]) : lg(0, 0, 0, 340, [[0, '#3a3a7c'], [.6, '#b4677a'], [1, '#f0a070']]));
  rect(0, 335, W, 490, n ? '#4b5478' : '#e4d8c6');
  const r = rng(3); for (let i = 0; i < 60; i++) ell(r() * W, 340 + r() * 420, 30 + r() * 60, 12 + r() * 20, n ? 'rgba(20,25,60,0.12)' : 'rgba(160,130,100,0.08)');
  rect(0, 750, W, 75, n ? '#5d3a3a' : '#a8492b');
  rrect(1010, 470, 200, 355, [100, 100, 0, 0], n ? '#1b1420' : '#3a2416');
  ctx.lineWidth = 14; ctx.strokeStyle = n ? '#3d2a22' : '#6b4226'; ctx.beginPath(); ctx.roundRect(1010, 470, 200, 355, [100, 100, 0, 0]); ctx.stroke();
  rect(0, 825, W, 255, n ? '#3e2e36' : '#b8683f');
  ctx.strokeStyle = n ? 'rgba(0,0,0,0.25)' : 'rgba(90,40,15,0.3)'; ctx.lineWidth = 2;
  for (const yy of [860, 905, 960, 1025]) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
  for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(960 + k * 90, 825); ctx.lineTo(960 + k * 190, H); ctx.stroke(); }
  rrect(90, 640, 150, 190, 8, n ? '#6a5a70' : '#d9c2a0'); rect(80, 630, 170, 22, n ? '#7a6a80' : '#c9ae86');
  for (let k = 0; k < 9; k++) ell(165 + (k - 4) * 14, 600 - k % 3 * 20, 12, 22, n ? '#2c5a3a' : '#3f8c3c', (k - 4) * .2);
  rect(0, 300, W, 40, n ? '#3a2618' : '#6a4226'); rect(0, 336, W, 8, 'rgba(0,0,0,0.25)');
  for (const px of [40, 1880]) rect(px - 18, 300, 36, 530, n ? '#3a2618' : '#6a4226');
  // rangoli
  ctx.save(); ctx.translate(960, 1010); ctx.scale(1, .3);
  for (const [q, c] of [[150, '#d93a6a'], [115, '#f4b400'], [80, '#2fae54'], [45, '#ffffff']]) { ctx.beginPath(); for (let k = 0; k <= 24; k++) { const a = k / 24 * 6.283, d = q * (k % 2 ? .85 : 1); k ? ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d) : ctx.moveTo(d, 0); } ctx.fillStyle = n ? c + 'aa' : c; ctx.fill(); }
  ctx.restore();
}
function templeBase() {
  rect(0, 0, W, H, lg(0, 0, 0, H, [[0, '#7a5a40'], [1, '#4a3424']]));
  rrect(560, 120, 800, 760, [400, 400, 0, 0], '#3a2618'); rrect(600, 160, 720, 720, [360, 360, 0, 0], lg(0, 160, 0, 880, [[0, '#ffe3a3'], [1, '#e0a050']]));
  for (const px of [420, 1500]) { rect(px - 40, 100, 80, 800, '#d8c3a0'); for (let y = 140; y < 880; y += 90) rect(px - 46, y, 92, 14, '#b89a70'); }
  rect(0, 880, W, 200, lg(0, 880, 0, H, [[0, '#9a8268'], [1, '#6a5640']]));
  for (let x = 0; x < W; x += 120) line(x, 880, x - 60, H, 2, 'rgba(0,0,0,0.15)');
  rrect(720, 760, 480, 120, 10, '#8a3a1a'); rect(700, 860, 520, 26, '#6a2a10');
}

// ---------------- river set (animated parts) ----------------
const DECK = 600;
function water(T, tod) {
  const k = dim(tod), storm = tod === 'storm';
  ctx.save(); ctx.beginPath(); ctx.moveTo(852, 430); ctx.lineTo(1068, 430); ctx.lineTo(1330, 1080); ctx.lineTo(590, 1080); ctx.closePath(); ctx.clip();
  rect(560, 430, 800, 650, lg(0, 430, 0, 1080, [[0, tint(storm ? '#3a5a6a' : '#7cc4e4', k)], [1, tint(storm ? '#24404c' : '#3d8fbf', k)]]));
  const sp = storm ? 3 : 1;
  for (let i = 0; i < 40; i++) { const y = 440 + ((i * 47 + T * 40 * sp) % 640), w = 20 + (y - 430) * .12, x = 960 + Math.sin(i * 7.3) * (y - 400) * .3; line(x - w, y, x + w, y, 2 + (y - 430) / 200, `rgba(255,255,255,${storm ? .35 : .25})`); }
  ctx.restore();
}
function bridge(T, st) {
  // st: {mode:'old'|'broken'|'build'|'new', pL, pR, log (0..1 raised), deco}
  const fresh = st.mode === 'build' || st.mode === 'new', wood = fresh ? '#c8a26a' : '#8a6a48', dark = fresh ? '#9a7848' : '#5e4630';
  const x0 = 640, x1 = 1280, gapL = 932, gapR = 988;
  const spans = [];
  if (st.mode === 'old' || st.mode === 'new') spans.push([x0, x1]);
  if (st.mode === 'broken') spans.push([x0, 860], [1060, x1]);
  if (st.mode === 'build') { spans.push([x0, lerp(x0, gapL, st.pL)]); spans.push([lerp(x1, gapR, st.pR), x1]); }
  for (const px of [760, 860, 1060, 1160]) if (spans.some(([a, b]) => px >= a && px <= b)) rect(px - 8, DECK, 16, 120, dark);
  for (const [a, b] of spans) {
    if (b - a < 2) continue;
    rect(a, DECK - 12, b - a, 16, wood); for (let x = a; x < b; x += 22) line(x, DECK - 12, x, DECK + 4, 2, dark);
    line(a, DECK - 52, b, DECK - 52, 5, dark); for (let x = a; x <= b; x += 60) line(x, DECK - 52, x, DECK - 12, 4, dark);
  }
  if (st.mode === 'broken') { for (const [x, a] of [[860, .5], [1060, -.6]]) { ctx.save(); ctx.translate(x, DECK - 4); ctx.rotate(a); rect(0, -6, 60 * Math.sign(a) * -1, 12, wood); ctx.restore(); } }
  if (st.mode === 'build' || st.mode === 'new') logPiece(lerp(960, 960, 1), st.mode === 'new' ? DECK - 4 : lerp(780, DECK - 4, st.log || 0), st.mode === 'new' ? 0 : (1 - (st.log || 0)) * .08 * Math.sin(T * 3));
  if (st.deco) { marigoldString(x0, DECK - 52, x1, DECK - 52, 24, T); for (const px of [700, 960, 1220]) { line(px, DECK - 52, px, DECK - 90, 3, '#6b4a2a'); light(px, DECK - 98, 40, '255,200,90', st.night ? .7 : .3); circ(px, DECK - 98, 9, '#ffcf5a'); } }
}
function logPiece(x, y, ang) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); rrect(-120, -14, 240, 28, 14, '#7a5230'); ell(-120, 0, 8, 14, '#c49a6a'); ell(120, 0, 8, 14, '#c49a6a'); for (let k = -90; k < 100; k += 45) line(k, -10, k + 20, -8, 2, '#5a3a20'); ctx.restore(); }
function mangoTree(x, y, s, k) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rect(-22, -220, 44, 220, tint('#6b4426', k)); for (const [cx, cy, r] of [[0, -300, 150], [-110, -250, 100], [110, -250, 100], [-60, -370, 100], [70, -370, 100]]) circ(cx, cy, r, tint('#3f8a3a', k)); const rr = rng(4); for (let i = 0; i < 16; i++) ell(-150 + rr() * 300, -380 + rr() * 220, 9, 12, tint('#f2b134', k)); ctx.restore(); }
function rain(T, a = 1) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.strokeStyle = `rgba(200,220,255,${.45 * a})`; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 260; i++) { const x = (i * 137.3 + T * 300) % (W + 200) - 100, y = (i * 91.7 + T * 1400) % (H + 100) - 50; ctx.moveTo(x, y); ctx.lineTo(x - 12, y + 34); } ctx.stroke(); ctx.restore(); }
function lightning(T) { const p = (T * .23) % 1; if (p < .04) { shade(.55 - p * 10, '235,240,255'); return true; } return false; }
function petals(T, a = 1) { for (let i = 0; i < 60; i++) { const x = (i * 211 + Math.sin(T + i) * 60) % W, y = (i * 97 + T * 90) % (H + 40) - 20; ell(x, y, 7, 4, ['#ff9a1a', '#ffd21a', '#ff5a5a'][i % 3] + (a < 1 ? '' : ''), T + i); } }
function riverSet(T, tod, st, extraFn) {
  NOW = T; ctx.drawImage(BG['river_' + tod], 0, 0);
  water(T, tod);
  if (tod === 'night') { stars(T); moon(1560, 140, 50); }
  if (extraFn && extraFn.behind) extraFn.behind();
  bridge(T, st);
}
function walkPos(T, t0, t1, a, b) { const k = clamp((T - t0) / Math.max(.1, t1 - t0)); return { x: lerp(a, b, k), walk: k > 0 && k < 1 }; }

// ---------------- courtyard helpers ----------------
function mandap(x, y, s, deco, murti, T) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const k of [-1, 1]) { rect(k * 200 - 12, -440, 24, 440, '#3f8a3a'); for (let j = 0; j < 4; j++) ell(k * 200 + k * 30, -380 + j * 70, 40, 14, '#4fa84a', k * .6); }
  poly([-240, -440, 240, -440, 200, -500, -200, -500], '#c0392b'); rect(-240, -450, 480, 16, '#f1c40f');
  const n = Math.round(deco * 6); for (let i = 0; i < n; i++) marigoldString(-220, -430 + i * 4, 220, -430 + i * 4, 30 + i * 14, T);
  rrect(-110, -150, 220, 150, 6, '#8a1c1c'); rect(-120, -160, 240, 20, '#f1c40f');
  if (murti) ganeshMurti(0, -160, .33, { t: T, glow: .3 });
  if (deco > .9) for (const k of [-150, 150]) { diya(k, -2, .8, { t: T }); light(k + 40, -30, 80, '255,200,90', .4); }
  ctx.restore();
}
function courtyardFrame(T, night = true) {
  NOW = T; ctx.drawImage(BG['court_' + (night ? 'night' : 'evening')], 0, 0);
  if (night) { stars(T, .8); moon(1650, 120, 40); }
  mandap(1640, 900, .85, .5, false, T);
  charpai(960, 912, 1.1);
  who('Pari', 760, 905, 1, { pose: 'sit', gaze: 1 }); who('Dadi', 960, 905, 1, { pose: 'sit' }); who('Monu', 1160, 905, 1, { pose: 'sit', gaze: -1 });
  charpaiFront(960, 1000, 1.1);
  diya(620, 1030, 1, { t: T });
  if (night) { shade(.12); light(640, 1000, 420, '255,190,110', .35); light(960, 700, 600, '255,190,110', .15); }
}

// ---------------- scenes ----------------
const SCENES = {
  frame: { cam: [960, 640, 1.08], closeZoom: 1.45, draw(T) { courtyardFrame(T, true); } },

  1: { cam: [960, 600, 1.0], draw(T) {
    NOW = T; ctx.drawImage(BG.court_evening, 0, 0);
    mandap(1700, 900, .8, .25, false, T);
    charpai(560, 912, 1.05);
    const call = L(1, 4) + 1.2, arrive = call + 2.6;
    who('Dadi', 560, 905, 1, { pose: 'sit', gaze: T < call ? 1 : 0 });
    if (T < call) charpaiFront(560, 1000, 1.05);
    if (T < call) {
      const tug = Math.sin(T * 3) * 10;
      who('Monu', 1150 + tug, 935, 1, { pose: 'pull', dir: 1, strain: true, mood: 'angry' });
      who('Pari', 1450 + tug, 935, 1, { pose: 'pull', dir: -1, strain: true, mood: 'angry' });
      marigoldString(1235 + tug, 760, 1370 + tug, 760, 14, T);
    } else {
      const m = walkPos(T, call, arrive, 1150, 780), p = walkPos(T, call, arrive, 1450, 340);
      const sat = T >= arrive;
      who('Monu', m.x, sat ? 905 : 935, 1, { pose: sat ? 'sit' : 'stand', walk: m.walk, gaze: -1 });
      who('Pari', p.x, sat ? 905 : 935, 1, { pose: sat ? 'sit' : 'stand', walk: p.walk, gaze: 1, mood: T > L(1, 5) - .3 ? 'surprised' : 'happy' });
      if (T < arrive + 1) marigoldString(1500, 1040, 1640, 1050, 8, T);
      charpaiFront(560, 1000, 1.05);
    }
  } },

  2: { cam: [960, 520, 1.0], camAt: T => T > L(2, 2) && T < LE(2, 2) ? [960, 560, 1.6] : T > L(2, 1) && T < LE(2, 1) ? [500, 470, 1.4] : null, draw(T) {
    riverSet(T, 'morning', { mode: 'old' });
    // potter making the murti in Rampur
    extra(11, 420, 520, .42, { pose: 'sitfloor' }); ganeshMurti(500, 520, .12, { t: T });
    const fest = T > L(2, 2) - .5 && T < L(2, 3) + 1;
    for (let i = 0; i < 6; i++) { const x = fest ? 700 + i * 105 : (700 + ((T * 30 + i * 140) % 560)); extra(i + 2, x, DECK, .4, { pose: fest ? 'dance' : 'stand', walk: !fest }); }
    if (fest) { bridge(T, { mode: 'old', deco: true }); petals(T); }
    for (let i = 0; i < 3; i++) extra(10 + i, 120 + i * 190, 1010, .75, { pose: fest ? 'dance' : 'stand', gaze: 1 });
    for (let i = 0; i < 3; i++) extra(5 + i, 1430 + i * 190, 1010, .75, { pose: fest ? 'dance' : 'stand', gaze: -1 });
  } },

  3: { cam: [640, 540, 1.25], draw(T) {
    riverSet(T, 'noon', { mode: 'old' });
    mangoTree(580, 650, .9, 1);
    const part = T > L(3, 3) + 2;
    const r = walkPos(T, L(3, 3) + 2, L(3, 3) + 6, 470, 230), sx = walkPos(T, L(3, 3) + 2, L(3, 3) + 7, 690, 1300);
    const sy = sx.x < 900 ? lerp(660, DECK, clamp((sx.x - 690) / 210)) : DECK, ss = lerp(.7, .42, clamp((sx.x - 690) / 210));
    who('Ramdin', r.x, 660, .7, { pose: T > L(3, 1) && T < LE(3, 2) + .5 ? 'angry' : 'stand', dir: 1, mood: 'angry', walk: r.walk });
    who('Shyamlal', sx.x, sy, ss, { pose: T > L(3, 2) && T < LE(3, 2) + .5 ? 'angry' : 'stand', dir: -1, mood: 'angry', walk: sx.walk });
    if (part) { who('Golu', 250, 990, .95, { pose: 'cross', mood: 'sad', mute: true }); who('Meena', 1680, 990, .95, { pose: 'cross', mood: 'sad', mute: true }); }
    for (let i = 0; i < 6; i++) ell(520 + i * 25, 640 + (i % 2) * 6, 8, 10, '#f2b134');
  } },

  4: { cam: [960, 560, 1.0], camAt: T => T > L(4, 1) && T < LE(4, 1) + 1 ? [960, 620, 1.55] : null, draw(T) {
    const br = L(4, 1) + 2.8;
    riverSet(T, 'storm', { mode: T < br ? 'old' : 'broken' });
    if (T >= br && T < br + 3) { const k = (T - br) / 3; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(880 + i * 40, DECK + k * k * 260); ctx.rotate(k * (i - 2) * 1.2); rect(-30, -6, 60, 12, '#8a6a48'); ctx.restore(); } if (k > .6) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(960, 860, 60 + (k - .6) * 500 + i * 30, 12 + i * 6, 0, 0, 6.3); ctx.strokeStyle = `rgba(255,255,255,${(1 - k) * .8})`; ctx.lineWidth = 3; ctx.stroke(); } }
    rain(T); const flash = lightning(T); if (flash) { line(1300, 0, 1250, 160, 6, '#fff'); line(1250, 160, 1320, 260, 5, '#fff'); }
    shade(.15);
  } },

  5: { cam: [960, 600, 1.0], draw(T) {
    riverSet(T, 'morning', { mode: 'broken' });
    for (let i = 0; i < 3; i++) extra(10 + i, 150 + i * 110, 900, .8, { mood: 'angry', pose: i === 1 ? 'shout' : 'stand' });
    for (let i = 0; i < 3; i++) extra(5 + i, 1530 + i * 120, 900, .8, { mood: 'angry', pose: i === 1 ? 'shout' : 'stand' });
    who('Ramdin', 470, 930, 1, { pose: T < LE(5, 0) + .3 ? 'angry' : 'stand', dir: 1, mood: 'angry' });
    who('Shyamlal', 1450, 930, 1, { pose: T > L(5, 1) && T < LE(5, 1) + .3 ? 'angry' : 'stand', dir: -1, mood: 'angry' });
    const kids = T > L(5, 3) - .5;
    if (kids) { who('Golu', 690, 980, .95, { mood: 'sad' }); who('Meena', 1240, 980, .95, { mood: 'sad' }); }
  } },

  6: { cam: [420, 640, 1.25], draw(T) {
    riverSet(T, 'afternoon', { mode: 'broken' });
    const b = walkPos(T, L(6, 0) + .5, LE(6, 0) - .5, -150, 250), seated = T > LE(6, 0) - .3;
    const by = 960, bs = .95;
    who('Baba', b.x, by, bs, { pose: seated ? 'tie' : 'stand', walk: b.walk, mood: 'happy', smileEyes: !speakerAt(T) || speakerAt(T) !== 'Baba' ? seated : false });
    mouse(b.x + 52 * bs, by - (seated ? 330 : 402) * bs, .55, { t: T });
    if (seated) { ctx.save(); ctx.translate(b.x, by - 70); for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(-.1 + i * .06); rrect(-150, -6 + i * 10, 300, 12, 6, '#c9b25a'); ctx.restore(); } ctx.restore(); }
    const g = walkPos(T, L(6, 4) - 1, L(6, 4) + 1, 540, 450);
    const gotRope = T > LE(6, 7);
    who('Golu', g.x, 990, .95, { walk: g.walk, gaze: -1, mood: T < L(6, 6) ? 'surprised' : 'happy', pose: gotRope ? 'hold' : 'stand' });
    if (T > L(6, 7) + .5 && !gotRope) curve(b.x + 120, by - 200, (b.x + g.x) / 2, by - 140, g.x - 30, 990 - 150, 4, '#c8a060');
    if (gotRope) curve(g.x - 20, 990 - 140, g.x + 60, 1040, g.x + 140, 1060, 4, '#c8a060');
  } },

  7: { cam: [960, 620, 1.05], draw(T) {
    const s0 = SCENE_START[7], dur = (LE(7, 3) - s0) || 1;
    const pL = .2 + .55 * clamp((T - s0) / dur), pR = .55 * clamp((T - L(7, 2)) / (LE(7, 3) - L(7, 2) || 1));
    riverSet(T, 'noon', { mode: 'build', pL, pR, log: 0 });
    who('Baba', 330, 720, .62, { pose: 'tie', mute: false });
    mouse(330 + 32, 720 - 205, .35, { t: T });
    for (let i = 0; i < 3; i++) { const ph = (T * .18 + i * .33) % 1, x = ph < .5 ? lerp(430, 640, ph * 2) : lerp(640, 430, (ph - .5) * 2); i === 0 ? who('Golu', x, 660 + i * 22, .55, { walk: true, item: 'bamboo', pose: 'hold' }) : extra(i * 2, x, 660 + i * 22, .55, { walk: true, item: 'bamboo', pose: 'hold' }); }
    if (T > L(7, 1)) for (let i = 0; i < 3; i++) { const on = T > L(7, 3) || i === 0; if (!on) continue; const ph = (T * .2 + i * .33) % 1, x = ph < .5 ? lerp(1290, 1500, ph * 2) : lerp(1500, 1290, (ph - .5) * 2); i === 0 ? who('Meena', T < LE(7, 2) ? 1380 : x, 660 + i * 22, .55, { walk: T >= LE(7, 2), item: T >= LE(7, 2) ? 'bamboo' : null, pose: T < LE(7, 2) ? 'shout' : 'hold' }) : extra(i * 2 + 1, x, 660 + i * 22, .55, { walk: true, item: 'bamboo', pose: 'hold' }); }
  } },

  8: { cam: [960, 640, 1.3], draw(T) {
    const slip = L(8, 7) + 2;
    riverSet(T, 'afternoon', { mode: 'build', pL: 1, pR: 1, log: 0 });
    const leftPull = T > L(8, 2) && T < slip, rightPull = T > L(8, 4) && T < L(8, 5);
    const fallen = T > slip;
    // ropes from the log to both teams
    if (!fallen) curve(840, 780, 760, 740, 690, 600, 4, '#c8a060'); curve(1080, 780, 1160, 740, 1240, 600, 4, '#c8a060');
    const lp = { pose: fallen ? 'fallen' : 'pull', dir: 1, strain: leftPull }, rp = { pose: 'pull', dir: -1, strain: rightPull };
    who('Golu', 640, 660, .58, { ...lp, mood: T > L(8, 5) ? 'angry' : 'worried' }); extra(0, 580, 665, .55, lp); extra(4, 520, 670, .55, lp);
    who('Meena', 1290, 660, .58, { ...rp, mood: T > L(8, 5) ? 'angry' : 'worried' }); extra(1, 1350, 665, .55, rp); extra(3, 1410, 670, .55, rp);
    who('Baba', 300, 760, .62, { pose: 'stand' }); mouse(300 + 32, 760 - 250, .35, { t: T });
    if (fallen && T < slip + 2) { const k = (T - slip) / 2; ctx.beginPath(); ctx.ellipse(960, 800, 60 + k * 200, 10 + k * 20, 0, 0, 6.3); ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 3; ctx.stroke(); }
  } },

  9: { cam: [960, 640, 1.3], camAt: T => T > L(9, 0) && T < LE(9, 0) ? [lerp(700, 1250, clamp((T - L(9, 0)) / (LE(9, 0) - L(9, 0)))), 640, 1.9] : T > L(9, 8) && T < L(9, 8) + 4 ? [960, 640, 1.2] : null, draw(T) {
    const lift = ease((T - L(9, 8) - .3) / 2.6), done = lift >= 1;
    riverSet(T, 'afternoon', { mode: 'build', pL: 1, pR: 1, log: lift });
    const pulling = T > L(9, 8) - .2 && !done;
    // rope across the river (the mouse runs on it)
    curve(660, 640, 960, 700, 1270, 640, 4, '#c8a060');
    const u = clamp((T - L(9, 0)) / ((LE(9, 0) - L(9, 0)) || 1)), mx = lerp(660, 1270, u), my = 640 + 4 * 60 * u * (1 - u) * .5;
    if (T < L(9, 2)) mouse(mx, my, .4, { t: T, run: u > 0 && u < 1, modak: true });
    else mouse(1250, 668, .4, { t: T });
    const team = (x0, d, nm, mood) => { const o = { pose: pulling ? 'pull' : done ? 'jump' : 'stand', dir: d, strain: pulling, mood }; nm ? who(nm, x0, 670, .58, o) : 0; };
    team(640, 1, 'Golu', done ? 'happy' : 'happy'); extra(0, 580, 675, .55, { pose: pulling ? 'pull' : done ? 'jump' : 'stand', dir: 1, strain: pulling }); extra(4, 520, 680, .55, { pose: pulling ? 'pull' : done ? 'jump' : 'stand', dir: 1, strain: pulling });
    who('Meena', 1290, 670, .58, { pose: pulling ? 'pull' : done ? 'jump' : T > L(9, 2) ? 'hold' : 'stand', dir: -1, strain: pulling, item: T > L(9, 2) && !pulling && !done ? 'modak' : null });
    extra(1, 1350, 675, .55, { pose: pulling ? 'pull' : done ? 'jump' : 'stand', dir: -1, strain: pulling }); extra(3, 1410, 680, .55, { pose: pulling ? 'pull' : done ? 'jump' : 'stand', dir: -1, strain: pulling });
    who('Baba', 300, 760, .62, { pose: done ? 'fold' : 'stand', smileEyes: done }); if (T > L(9, 2)) mouse(300 + 32, 760 - 250, .35, { t: T });
    if (done) for (let i = 0; i < 20; i++) sparkle(960 + Math.cos(i * 2.4) * (80 + (T * 60 + i * 30) % 200), 560 - ((T * 50 + i * 20) % 150), 6, .8);
  } },

  10: { cam: [960, 540, 2.0], closeZoom: 2.4, draw(T) {
    riverSet(T, 'night', { mode: 'new', deco: true, night: true });
    const modaks = T > L(10, 1) + 2;
    who('Baba', 960, DECK + 2, .5, { pose: 'sitfloor', item: T > L(10, 1) && !modaks ? 'potli' : null });
    who('Golu', 880, DECK + 4, .42, { pose: 'sitfloor', gaze: 1, itemR: modaks ? 'modak' : null, hands: modaks ? { r: [40, -200] } : null });
    who('Meena', 1040, DECK + 4, .42, { pose: 'sitfloor', gaze: -1, itemR: modaks ? 'modak' : null });
    for (let i = 0; i < 4; i++) extra(i, [800, 1120, 760, 1170][i], DECK + 6, .38, { pose: 'sitfloor', itemR: modaks ? 'modak' : null });
    mouse(985, DECK - 6, .25, { t: T });
    shade(.2); light(960, 560, 300, '255,200,120', .35);
    for (let i = 0; i < 14; i++) { const x = 700 + (i * 97 % 520) + Math.sin(T * .5 + i) * 30, y = 450 + (i * 53 % 160) + Math.cos(T * .6 + i) * 20; light(x, y, 14, '200,255,120', .5); }
    if (T > L(10, 4)) for (let i = 0; i < 3; i++) { const u = (T * .25 + i * .33) % 1; heart(960 + Math.sin(u * 8 + i) * 50, 520 - u * 120, .8 + u, `rgba(255,110,140,${1 - u})`); }
  } },

  11: { cam: [960, 600, 1.0], camAt: T => T > L(11, 1) && T < LE(11, 1) ? [960, 560, 1.5] : T > L(11, 5) - .5 ? [960, 780, 1.45] : null, draw(T) {
    riverSet(T, 'festival', { mode: 'new', deco: true });
    const s0 = SCENE_START[11], pk = clamp((T - s0 - 2) / ((LE(11, 1) - s0) || 1)), px = lerp(700, 1240, pk);
    // palanquin with the murti, carried by children
    for (const d of [-60, 60]) extra(d < 0 ? 0 : 1, px + d, DECK, .42, { pose: 'carry', walk: pk < 1 });
    rrect(px - 70, DECK - 210, 140, 16, 6, '#8a3a1a'); ganeshMurti(px, DECK - 215, .13, { t: T }); poly([px - 80, DECK - 300, px + 80, DECK - 300, px, DECK - 340], '#c0392b');
    who('Golu', px - 120, DECK, .42, { pose: 'dance', mute: true }); who('Meena', px + 120, DECK, .42, { pose: 'dance', mute: true });
    petals(T);
    const sh = walkPos(T, L(11, 3) - .2, L(11, 3) + 2.5, 1500, 1050), ra = walkPos(T, L(11, 4) - .2, L(11, 4) + 2.5, 450, 880);
    const hug = T > L(11, 5) + .5;
    who('Ramdin', hug ? 900 : ra.x, 950, 1, { walk: ra.walk, pose: hug ? 'hug' : 'stand', dir: 1, mood: T < L(11, 3) ? 'surprised' : 'happy', gaze: 1 });
    who('Shyamlal', hug ? 1030 : sh.x, 950, 1, { walk: sh.walk, pose: hug ? 'hug' : 'fold', dir: -1, mood: 'happy', gaze: -1 });
    for (let i = 0; i < 2; i++) { extra(12 + i, 120 + i * 120, 980, .85, { pose: hug ? 'dance' : 'stand' }); extra(14 + i, 1650 + i * 130, 980, .85, { pose: hug ? 'dance' : 'stand' }); }
  } },

  12: { cam: [960, 560, 1.0], camAt: T => T > L(12, 3) + .5 && T < LE(12, 3) ? [960, 480, 1.3] : null, draw(T) {
    NOW = T; ctx.drawImage(BG.temple, 0, 0);
    for (const bx of [700, 1220]) { line(bx, 0, bx, 140, 3, '#8a6a2a'); ell(bx, 160, 26, 34, '#d4a52a'); circ(bx, 190, 7, '#8a6a2a'); }
    marigoldString(600, 200, 1320, 200, 90, T); marigoldString(620, 240, 1300, 240, 110, T, ['#ff5a5a', '#ffd21a']);
    const smile = ease((T - L(12, 3) - 1) / 1.5), glow = Math.max(smile, ease((T - L(12, 5)) / 2));
    ganeshMurti(960, 770, .95, { t: T, smile, glow });
    for (const dx of [-300, 300]) { diya(960 + dx, 870, 1.1, { t: T }); light(960 + dx + 40, 840, 120, '255,200,90', .45); }
    if (T > L(12, 2) + 1) mouse(1080, 880, .7, { t: T, flip: true, modak: true });
    for (let i = 0; i < 4; i++) extra(10 + i, [160, 300, 1620, 1760][i], 1040, .9, { pose: T > L(12, 5) ? 'fold' : 'stand' });
    const lookAround = T > L(12, 1) && T < LE(12, 1) ? Math.sin(T * 3) : 0;
    who('Golu', 560, 1040, 1, { gaze: lookAround, pose: T > L(12, 5) ? 'fold' : 'stand', mood: T > L(12, 4) - .3 && T < L(12, 5) ? 'surprised' : 'happy' });
    who('Meena', 1360, 1040, 1, { pose: T > L(12, 3) && T < LE(12, 3) ? 'point' : T > L(12, 5) ? 'fold' : 'stand', dir: -1, mood: T > L(12, 3) ? 'surprised' : 'happy', gaze: -1 });
  } },

  13: { cam: [960, 640, 1.08], closeZoom: 1.45, draw(T) {
    courtyardFrame(T, true);
  } },

  14: { cam: [960, 620, 1.0], draw(T) {
    NOW = T; ctx.drawImage(BG.court_night, 0, 0); stars(T, .8); moon(1650, 120, 40);
    mandap(960, 900, 1.05, 1, true, T);
    charpai(330, 960, .9); who('Dadi', 330, 955, .9, { pose: 'sit', smileEyes: !speakerAt(T) }); charpaiFront(330, 1040, .9);
    const cheer = T > L(14, 2);
    who('Pari', 700, 1010, 1, { pose: cheer ? 'jump' : 'fold' }); who('Monu', 1220, 1010, 1, { pose: cheer ? 'jump' : 'fold' });
    shade(.1); light(960, 650, 700, '255,190,110', .3);
    if (cheer) petals(T);
  } },
};

// title, story-name and moral cards
function overlays(T) {
  bigText('गणेश जी और टूटा पुल', 200, T < 5 ? 1 : 1 - ease((T - 5) / 1));
  if (T < 6) { ctx.save(); ctx.globalAlpha = T < 5 ? 1 : 1 - ease(T - 5); ctx.textAlign = 'center'; ctx.font = '800 54px Baloo'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#5a2310'; ctx.lineWidth = 8; ctx.strokeText('दादी की कहानी', W / 2, 310); ctx.fillText('दादी की कहानी', W / 2, 310); ctx.restore(); }
  const tl = L(1, 6); if (T > tl + 1.2 && T < tl + 6) bigText('गणेश जी और टूटा पुल', 220, Math.min(ease((T - tl - 1.2) / .6), 1 - ease((T - tl - 5) / 1)), 110);
  if (SCENE_LINES[14]) { const m0 = L(14, 0), m1 = LE(14, 0); if (T > m0 - .3 && T < m1 + 1.5) card('सीख', DATA.moral, Math.min(ease((T - m0 + .3) / .8), 1 - ease((T - m1 - .5) / 1))); }
  const e = END - (CONFIG.endExtra || 4); if (T > e) bigText('गणपति बप्पा मोरया!', 520, ease((T - e) / 1), 130);
}
