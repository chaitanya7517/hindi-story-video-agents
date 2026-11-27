// =====================================================================
//  "बाल गणेश और कुबेर का घमंड" — scenes (engine.js + divine.js)
//  Scene numbers = scene numbers in 2-script.json. Actions are timed to spoken lines with L(scene, line).
// =====================================================================
const CONFIG = { storyScenes: [1, 3, 4, 6, 7, 9, 10, 11], endExtra: 5 };

const CAST = {
  Dadi: { hindi: 'दादी', color: '#ffd166', look: { age: 'old', female: true, skin: '#c98a5e', hair: 'bun', hairCol: '#e8e6e0', glasses: true, bindi: true, topStyle: 'saree', top: '#f3e6c8', pallu: '#efe0bd', bottom: '#f3e6c8', bottomStyle: 'saree', border: '#8a1c1c', earrings: true } },
  Pari: { hindi: 'परी', color: '#ff9ecb', look: { age: 'child', female: true, skin: '#d29a6c', hair: 'bob', clip: '#ff5fa2', topStyle: 'frock', top: '#ff8fb8', bottom: '#ff8fb8', bottomStyle: 'frock', border: '#3fae5a', earrings: true } },
  Monu: { hindi: 'मोनू', color: '#8fd3ff', look: { age: 'child', skin: '#c98a5e', hair: 'messy', topStyle: 'kurta', top: '#7ec8f0', bottom: '#f4f1ea', bottomStyle: 'pyjama' } },
  Ganesh: { hindi: 'बाल गणेश', color: '#ffb347' },
  Mushak: { hindi: 'मूषक', color: '#d8b48c' },
  Kuber: { hindi: 'कुबेर', color: '#f7d046', look: { age: 'adult', skin: '#c68a5a', hair: 'short', crown: '#c79422', topStyle: 'kurta', top: '#6c2a8c', bottom: '#e8b020', bottomStyle: 'dhoti', belly: 1.6, mustache: 2, jewels: true, earrings: true, shawl: '#e0a82c' } },
  Shiv: { hindi: 'भगवान शिव', color: '#9fd8ff', look: { age: 'adult', skin: '#7fa8d6', hair: 'bun', hairCol: '#3b2414', jata: true, snake: true, tripundra: true, topStyle: 'vest', top: '#7fa8d6', bottom: '#d9822b', bottomStyle: 'dhoti', mala: '#7a2e14', earrings: true } },
  Parvati: { hindi: 'माता पार्वती', color: '#ff8a80', look: { age: 'adult', female: true, skin: '#e0a274', hair: 'long', crown: '#c79422', topStyle: 'saree', top: '#c0182a', pallu: '#e04a3a', bottom: '#c0182a', bottomStyle: 'saree', border: '#f2c14e', bindi: true, earrings: true, mala: '#f2c14e' } },
  Sevak: { hindi: 'सेवक', color: '#b5e48c', look: { age: 'adult', skin: '#b07a50', hair: 'turban', turban: '#2e8b57', topStyle: 'kurta', top: '#f4f1ea', bottom: '#f4f1ea', bottomStyle: 'dhoti', mustache: 1 } },
};
let NOW = 0;
const talking = n => speakerAt(NOW) === n;
function who(name, x, y, s, o = {}) { const c = CAST[name]; person(x, y, s, { name, look: c.look, t: NOW, talk: talking(name) && !o.mute, seed: name.length, ...o }); }
function gan(x, y, s, o = {}) { balGanesh(x, y, s, { name: 'Ganesh', t: NOW, talk: talking('Ganesh'), ...o }); }
function mush(x, y, s, o = {}) { mushakChar(x, y, s, { name: 'Mushak', t: NOW, talk: talking('Mushak'), ...o }); }
const on = (sc, k) => NOW >= L(sc, k);
const during = (sc, k) => NOW >= L(sc, k) && NOW <= LE(sc, k) + .2;
function walkPos(T, t0, t1, a, b) { const k = clamp((T - t0) / Math.max(.1, t1 - t0)); return { x: lerp(a, b, ease(k)), walk: k > 0 && k < 1 }; }
function petals(T) { for (let i = 0; i < 60; i++) { const x = (i * 211 + Math.sin(T + i) * 60) % W, y = (i * 97 + T * 90) % (H + 40) - 20; ell(x, y, 7, 4, ['#ff9a1a', '#ffd21a', '#ff5a5a'][i % 3], T + i); } }
function burst(x, y, k, n = 10) { if (k <= 0 || k >= 1) return; for (let i = 0; i < n; i++) { const a = i / n * 6.283; sparkle(x + Math.cos(a) * 90 * k, y + Math.sin(a) * 70 * k, 14 * (1 - k), 1 - k); } }

// ---------------- backgrounds (cached) ----------------
const BG = {};
function cache(name, fn) { const c = mkCanvas(); const old = ctx; ctx = c.getContext('2d'); fn(); ctx = old; BG[name] = c; }
function buildBackgrounds() {
  for (const m of ['evening', 'night']) cache('court_' + m, () => courtBase(m));
  cache('hall', hallBase); cache('city', cityBase);
  for (const m of ['day', 'evening']) cache('kailash_' + m, () => kailashBase(m));
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
}
function hallBase() {
  // walls: royal red with gold arches and pillars
  rect(0, 0, W, 720, lg(0, 0, 0, 720, [[0, '#5e1422'], [1, '#9b2c3a']]));
  for (let i = 0; i < 6; i++) {
    const ax = 160 + i * 320;
    rrect(ax - 110, 210, 220, 500, [110, 110, 0, 0], '#3a0d16');
    ctx.save(); ctx.beginPath(); ctx.roundRect(ax - 110, 210, 220, 500, [110, 110, 0, 0]); ctx.clip();
    for (let y = 220; y < 710; y += 28) for (let x = ax - 110; x < ax + 110; x += 28) { ctx.beginPath(); ctx.arc(x + 14, y + 14, 10, 0, 6.3); ctx.strokeStyle = 'rgba(242,193,78,0.35)'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.restore();
    ctx.lineWidth = 12; ctx.strokeStyle = '#f2c14e'; ctx.beginPath(); ctx.roundRect(ax - 110, 210, 220, 500, [110, 110, 0, 0]); ctx.stroke();
  }
  for (let i = 0; i < 7; i++) { const px = i * 320; rect(px - 26, 120, 52, 600, lg(px - 26, 0, px + 26, 0, [[0, '#a8761c'], [.5, '#ffe08a'], [1, '#a8761c']])); rect(px - 36, 690, 72, 30, '#c79422'); rect(px - 36, 120, 72, 26, '#c79422'); }
  rect(0, 90, W, 40, '#c79422'); for (let x = 20; x < W; x += 60) circ(x, 110, 9, '#e74c3c');
  // marble floor in perspective + red carpet
  rect(0, 720, W, 360, lg(0, 720, 0, H, [[0, '#efe6d6'], [1, '#d8c8ae']]));
  ctx.strokeStyle = 'rgba(150,120,80,0.25)'; ctx.lineWidth = 2;
  for (const yy of [760, 820, 900, 1000]) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
  for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(960 + k * 100, 720); ctx.lineTo(960 + k * 200, H); ctx.stroke(); }
  poly([760, 720, 1160, 720, 1360, H, 560, H], '#a3172a'); poly([775, 720, 1145, 720, 1330, H, 590, H], '#c0243a');
  line(775, 720, 590, H, 8, '#f2c14e'); line(1145, 720, 1330, H, 8, '#f2c14e');
  // throne (left back) and treasury door (right)
  ctx.save(); ctx.translate(380, 760); ctx.scale(.85, .85);
  ctx.beginPath(); ctx.ellipse(0, -170, 130, 170, 0, Math.PI, 0); ctx.fillStyle = lg(0, -340, 0, 0, [[0, '#ffe58a'], [1, '#b8841e']]); ctx.fill();
  rrect(-120, -150, 240, 90, 20, '#c0243a'); rrect(-140, -70, 280, 70, 10, '#d8a62e'); for (const k of [-110, 110]) rect(k - 12, -150, 24, 150, '#c79422'); circ(0, -280, 16, '#2ecc71');
  ctx.restore();
  rrect(1600, 380, 250, 400, [125, 125, 0, 0], lg(1600, 0, 1850, 0, [[0, '#a8761c'], [.5, '#ffd76a'], [1, '#a8761c']]));
  rrect(1630, 420, 190, 360, [95, 95, 0, 0], '#8a5a14'); for (let y = 470; y < 780; y += 60) line(1640, y, 1810, y, 5, '#c79422');
  circ(1725, 600, 26, '#f2c14e'); rect(1715, 600, 20, 34, '#6b4a10');
  // gold vases and lamps
  for (const vx of [60, 1550]) { ell(vx, 690, 34, 44, '#d8a62e'); rect(vx - 14, 630, 28, 30, '#d8a62e'); for (let k = 0; k < 5; k++) circ(vx - 16 + k * 8, 618 - (k % 2) * 10, 9, ['#ff8c1a', '#ffd21a', '#ff5a5a'][k % 3]); }
}
function cityBase() {
  rect(0, 0, W, 760, lg(0, 0, 0, 760, [[0, '#8fd0f5'], [1, '#fff1cc']]));
  light(1500, 180, 300, '255,240,190', .6);
  // snow peaks (Himalaya) far away
  for (const [x, h, w] of [[200, 330, 380], [560, 380, 420], [980, 300, 360], [1400, 360, 420], [1780, 320, 360]]) {
    poly([x - w, 600, x, 600 - h, x + w, 600], '#a9bdd6'); poly([x - w * .35, 600 - h * .65, x, 600 - h, x + w * .35, 600 - h * .65, x + w * .1, 600 - h * .58, x - w * .12, 600 - h * .62], '#ffffff');
  }
  // golden city skyline
  const r = rng(12);
  for (let i = 0; i < 16; i++) {
    const x = 40 + i * 122 + r() * 30, h = 120 + r() * 160, w = 70 + r() * 40, base = 700;
    rect(x - w / 2, base - h, w, h, lg(x - w / 2, 0, x + w / 2, 0, [[0, '#c98f1e'], [.5, '#ffe08a'], [1, '#c98f1e']]));
    ctx.beginPath(); ctx.ellipse(x, base - h, w * .55, w * .55, 0, Math.PI, 0); ctx.fillStyle = '#f2c14e'; ctx.fill();
    line(x, base - h - w * .55, x, base - h - w * .55 - 30, 4, '#c79422'); poly([x, base - h - w * .55 - 30, x + 22, base - h - w * .55 - 22, x, base - h - w * .55 - 14], '#e74c3c');
    for (let y = base - h + 30; y < base - 20; y += 40) rect(x - 8, y, 16, 22, 'rgba(120,60,10,0.45)');
  }
  // terrace (foreground)
  rect(0, 700, W, 380, lg(0, 700, 0, H, [[0, '#f6efe2'], [1, '#e2d4bc']]));
  ctx.strokeStyle = 'rgba(160,130,90,0.3)'; ctx.lineWidth = 2; for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(960 + k * 100, 700); ctx.lineTo(960 + k * 200, H); ctx.stroke(); }
  rect(0, 690, W, 22, '#d8a62e'); for (let x = 10; x < W; x += 46) { rect(x, 640, 14, 52, '#f2c14e'); circ(x + 7, 636, 9, '#f2c14e'); } rect(0, 624, W, 14, '#d8a62e');
}
function kailashBase(m) {
  const ev = m === 'evening';
  rect(0, 0, W, 800, lg(0, 0, 0, 800, ev ? [[0, '#3b3a7a'], [.6, '#c9789a'], [1, '#f6b38a']] : [[0, '#6cb6ec'], [1, '#e6f4ff']]));
  // Mount Kailash peak behind
  poly([560, 760, 960, 120, 1360, 760], ev ? '#8c86b0' : '#b5c8e2');
  poly([820, 330, 960, 120, 1100, 330, 1040, 300, 990, 350, 930, 300, 880, 350], '#ffffff');
  for (const [x, h, w] of [[150, 360, 420], [1750, 380, 430], [420, 250, 300], [1500, 270, 320]]) { poly([x - w, 820, x, 820 - h, x + w, 820], ev ? '#9a90b8' : '#c8d8ec'); poly([x - w * .3, 820 - h * .7, x, 820 - h, x + w * .3, 820 - h * .7, x, 820 - h * .62], '#ffffff'); }
  // snowy ground
  rect(0, 760, W, 320, lg(0, 760, 0, H, ev ? [[0, '#e6dcef'], [1, '#c7bad8']] : [[0, '#ffffff'], [1, '#dde9f6']]));
  const r = rng(8); for (let i = 0; i < 30; i++) ell(r() * W, 800 + r() * 260, 40 + r() * 80, 8 + r() * 10, ev ? 'rgba(120,100,150,0.12)' : 'rgba(140,170,210,0.18)');
  // the flat rock with the tiger skin (seat of Shiv ji)
  ell(820, 900, 330, 70, ev ? '#7d7290' : '#9aa6b8'); ell(820, 880, 310, 55, ev ? '#9488aa' : '#b6c1d0');
  ell(760, 878, 150, 34, '#e08a2c'); for (let k = -4; k <= 4; k++) curve(760 + k * 30, 852, 765 + k * 30, 878, 760 + k * 30, 905, 5, '#3a2210');
  // a pine tree
  for (const [tx, ts] of [[180, 1], [1820, .9]]) { rect(tx - 10, 760 - 40 * ts, 20, 60 * ts, '#5a3a20'); for (let k = 0; k < 4; k++) poly([tx - (90 - k * 18) * ts, (760 - 30 - k * 70) * 1, tx, (760 - 130 - k * 70) * 1, tx + (90 - k * 18) * ts, (760 - 30 - k * 70)], ev ? '#2f5a4a' : '#2f7a4a'); }
}

// ---------------- props ----------------
function cycle(x, y, s, col = '#d6202e') { // Monu's new red bicycle
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const wx of [-95, 95]) { ctx.beginPath(); ctx.arc(wx, -62, 58, 0, 6.3); ctx.lineWidth = 9; ctx.strokeStyle = '#222'; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#aaa'; for (let k = 0; k < 8; k++) { const a = k / 8 * 3.1416; ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 54, -62 + Math.sin(a) * 54); ctx.lineTo(wx - Math.cos(a) * 54, -62 - Math.sin(a) * 54); ctx.stroke(); } circ(wx, -62, 7, '#888'); }
  line(-95, -62, -10, -62, 9, col); line(-10, -62, 60, -150, 9, col); line(-95, -62, -40, -150, 9, col); line(-40, -150, 60, -150, 9, col); line(60, -150, 95, -62, 9, col);
  line(-40, -150, -48, -172, 7, '#333'); rrect(-78, -184, 62, 16, 8, '#222');
  line(60, -150, 70, -190, 7, '#555'); line(48, -192, 96, -188, 7, '#333');
  circ(-10, -62, 14, '#555');
  ctx.restore();
}
function charpai(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const k of [-1, 1]) { rect(k * 190 - 8, -110, 16, 110, '#6b4426'); } rect(-210, -120, 420, 22, '#7d5131'); ctx.strokeStyle = '#d8c39a'; ctx.lineWidth = 3; for (let i = -190; i < 190; i += 16) { ctx.beginPath(); ctx.moveTo(i, -118); ctx.lineTo(i + 12, -100); ctx.stroke(); } ctx.restore(); }
function sevakCarry(T, t0, t1, from, to, food = 1) { // a servant walks in carrying a thali on his head
  const k = clamp((T - t0) / Math.max(.1, t1 - t0)); if (k <= 0 || k >= 1) return;
  const x = lerp(from, to, k < .5 ? ease(k * 2) : 1 - ease((k - .5) * 2));
  who('Sevak', x, 975, .95, { pose: 'carry', walk: true, mute: true, item: k < .5 ? 'thali' : null });
}
function swag(T, a) { // red silk curtains along the top of the hall
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 7; i++) { const x0 = i * 320 - 160, sw = 6 * Math.sin(T * 1.2 + i); ctx.beginPath(); ctx.moveTo(x0, 130); ctx.quadraticCurveTo(x0 + 160, 260 + sw, x0 + 320, 130); ctx.lineTo(x0 + 320, 150); ctx.quadraticCurveTo(x0 + 160, 230 + sw, x0, 150); ctx.fillStyle = '#c0243a'; ctx.fill(); line(x0 + 10, 160, x0 + 160, 250 + sw, 3, '#f2c14e'); }
  for (const sx of [0, W]) { ctx.beginPath(); ctx.moveTo(sx, 120); ctx.quadraticCurveTo(sx + (sx ? -150 : 150), 400, sx + (sx ? -60 : 60), 720); ctx.lineTo(sx, 720); ctx.fillStyle = '#b01e34'; ctx.fill(); }
  ctx.restore();
}

function trishulStand(x, y, s) { // Shiv ji's trident planted in the snow beside him
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  line(0, 0, 0, -560, 8, '#8a8f99'); line(-34, -520, 34, -520, 7, '#b8bec8');
  for (const k of [-1, 0, 1]) { line(k * 34, -520, k * 34, -600 + Math.abs(k) * 14, 7, '#b8bec8'); poly([k * 34 - 9, -600 + Math.abs(k) * 14, k * 34 + 9, -600 + Math.abs(k) * 14, k * 34, -632 + Math.abs(k) * 14], '#b8bec8'); }
  ell(0, -490, 14, 22, '#c0392b'); line(-12, -480, 12, -470, 3, '#f2c14e');
  ctx.restore();
}
function shivLap(x, y, s) { // crossed legs in tiger-skin cloth, drawn in front of the body
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(0, -26, 150, 44, '#d9822b'); for (let k = -4; k <= 4; k++) curve(k * 30 - 6, -60, k * 30 + 4, -28, k * 30 - 4, 6, 5, '#3a2210');
  ell(-118, -10, 34, 15, '#7fa8d6'); ell(118, -10, 34, 15, '#7fa8d6');
  ell(-40, -52, 26, 16, '#7fa8d6'); ell(40, -52, 26, 16, '#7fa8d6');
  ctx.restore();
}

// ---------------- palace hall state machine ----------------
// what has Bal Ganesh eaten by time T?
function hallState(T, sc) {
  const st = { curtains: 1, chand: 1, plates: 1, coins: 0 };
  if (sc === 9 || sc === 11) {
    st.plates = sc === 11 ? 0 : 1 - ease((T - L(9, 1)) / (LE(9, 1) - L(9, 1)));
    const e = sc === 11 ? 1 : ease((T - L(9, 4) - .6) / 2.5); st.curtains = 1 - e; st.chand = 1 - ease((T - L(9, 4) - 2.2) / 1.5) * (sc === 11 ? 0 : 1); if (sc === 11) st.chand = 0;
    if (sc === 9 && T > L(9, 7) + 1.5) st.coins = 1 - ease((T - L(9, 9) - .5) / (LE(9, 9) - L(9, 9) - .5));
  }
  return st;
}
function hall(T, sc) {
  NOW = T; ctx.drawImage(BG.hall, 0, 0);
  const st = hallState(T, sc);
  swag(T, st.curtains); if (st.curtains < 1 && st.curtains > 0) for (let i = 0; i < 8; i++) sparkle(200 + i * 220, 200 + 40 * Math.sin(i), 12, st.curtains);
  chandelier(960, 290, .95, T, st.chand); burst(960, 380, 1 - st.chand, 12);
  for (let i = 0; i < 8; i++) { diya(140 + i * 240, 735, .8, { t: T }); }
  return st;
}
function diya(x, y, s, o = {}) {
  const t = o.t || 0; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(0, 0, 26, 10, '#a0522d'); ell(0, -4, 22, 7, '#c8693a');
  const f = 1 + .08 * Math.sin(t * 13 + x);
  light(0, -22, 60, '255,190,90', .35);
  ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(0, -30 * f, 6, -8); ctx.fillStyle = '#ffb020'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-3, -8); ctx.quadraticCurveTo(0, -20 * f, 3, -8); ctx.fillStyle = '#fff3a0'; ctx.fill();
  ctx.restore();
}

// ---------------- courtyard frame ----------------
function courtyardFrame(T, night) {
  NOW = T; ctx.drawImage(BG['court_' + (night ? 'night' : 'evening')], 0, 0);
  if (night) { stars(T, .8); moon(1650, 120, 40); }
  cycle(1560, 905, .95);
  charpai(960, 912, 1.1);
  who('Pari', 760, 905, 1, { pose: 'sit', gaze: 1, mood: 'happy' }); who('Dadi', 960, 905, 1, { pose: 'sit' }); who('Monu', 1160, 905, 1, { pose: 'sit', gaze: -1 });
  charpaiFront(960, 1000, 1.1);
  diya(620, 1030, 1, { t: T });
  if (night) { shade(.12); light(640, 1000, 420, '255,190,110', .35); light(960, 700, 600, '255,190,110', .15); }
}

// ---------------- scenes ----------------
const SCENES = {
  frame: { cam: [960, 640, 1.08], closeZoom: 1.4, draw(T) { courtyardFrame(T, true); } },

  // 1. cold-open teaser: Bal Ganesh biting a golden plate, Kuber panicking
  1: { cam: [960, 640, 1.12], closeZoom: 1.3, draw(T) {
    hall(T, 1);
    const bite = .7 * ease((T - L(1, 0) - .4) / Math.max(1, LE(1, 2) - L(1, 0)));
    gan(900, 935, 1.05, { pose: 'sit', dir: 1, item: 'plate', bite, chew: true, mood: 'hungry', hands: { r: [70, -150] } });
    who('Kuber', 1330, 985, 1, { pose: T < LE(1, 0) ? 'shout' : 'angry', dir: -1, mood: 'surprised', gaze: -1 });
    mush(620, 985, 1.15, { pose: talking('Mushak') ? 'shock' : 'stand', mood: 'shock' });
  } },

  2: { cam: [960, 620, 1.0], closeZoom: 1.4, draw(T) {
    NOW = T; ctx.drawImage(BG.court_evening, 0, 0);
    charpai(520, 912, 1.05);
    const call = L(2, 5), arrive = call + 2.4;
    who('Dadi', 520, 905, 1, { pose: 'sit', gaze: 1, mood: T > L(2, 3) && T < L(2, 5) ? 'worried' : 'happy' });
    if (T < arrive) {
      cycle(1380, 945, 1);
      const m = walkPos(T, call, arrive, 1180, 720), p = walkPos(T, call, arrive, 1540, 330);
      who('Monu', m.x, 945, 1, { pose: T < call && talking('Monu') ? 'point' : 'stand', dir: 1, walk: m.walk, gaze: T < L(2, 3) ? 1 : -1, mood: T < L(2, 3) ? 'happy' : 'happy' });
      who('Pari', p.x, 945, 1, { pose: 'stand', walk: p.walk, gaze: -1 });
      charpaiFront(520, 1000, 1.05);
    } else {
      cycle(1380, 945, 1);
      who('Monu', 720, 905, 1, { pose: 'sit', gaze: -1, mood: T > L(2, 8) ? 'happy' : 'surprised' });
      who('Pari', 330, 905, 1, { pose: 'sit', gaze: 1 });
      charpaiFront(520, 1000, 1.05);
    }
    diya(980, 1030, 1, { t: T });
  } },

  // 3. Alakapuri: the golden city of Kuber
  3: { cam: [960, 560, 1.0], closeZoom: 1.25,
    camAt: T => T < LE(3, 2) ? [lerp(560, 1360, ease((T - L(3, 0)) / (LE(3, 2) - L(3, 0)))), 470, 1.25] : null,
    draw(T) {
      NOW = T; ctx.drawImage(BG.city, 0, 0);
      // pearl fountains
      for (const fx of [330, 1600]) { ell(fx, 880, 120, 30, '#7fc4e4'); ell(fx, 876, 104, 22, '#bfe6f6'); for (let i = 0; i < 18; i++) { const ph = (T * .9 + i / 18) % 1, a = (i / 18 - .5) * 1.6; circ(fx + Math.sin(a) * 140 * ph, 870 - 220 * ph + 260 * ph * ph, 5, '#fffdf4'); } }
      for (let i = 0; i < 10; i++) sparkle(100 + i * 190, 300 + 80 * Math.sin(i * 2), 10 + 5 * Math.sin(T * 3 + i), .8);
      const laugh = during(3, 5);
      who('Kuber', 1060, 990, 1.05, { pose: laugh ? 'dance' : during(3, 7) ? 'point' : 'stand', dir: -1, item: laugh ? null : 'pot', gaze: -1 });
      who('Sevak', 700, 985, .95, { pose: during(3, 4) ? 'fold' : 'stand', gaze: 1, mood: 'happy' });
    } },

  // 4. Kailash: Shiv ji, Mata Parvati, Bal Ganesh and Mooshak; Kuber arrives in his golden chariot
  4: { cam: [960, 640, 1.0], closeZoom: 1.25, draw(T) { kailash(T, 4); } },
  5: { cam: [960, 640, 1.08], closeZoom: 1.4, draw(T) { courtyardFrame(T, false); } },

  // 6. arrival at the palace
  6: { cam: [960, 600, 1.0], closeZoom: 1.25, draw(T) {
    hall(T, 6);
    const enter = L(6, 2) - .5, seat = L(6, 3) - .3;
    const g = walkPos(T, enter, seat, 300, 900), k = walkPos(T, enter, seat, 140, 1330), m = walkPos(T, enter, seat, 60, 620);
    if (T > enter) {
      const sat = T > seat;
      gan(g.x, 935 + (sat ? 0 : 40), 1.05, { pose: sat ? 'sit' : 'walk', dir: 1, mood: on(6, 3) ? 'hungry' : 'happy' });
      who('Kuber', k.x, 985, 1, { walk: k.walk, pose: during(6, 2) && !k.walk ? 'point' : 'stand', dir: -1, gaze: -1 });
      mush(m.x, 985, 1.15, { pose: m.walk ? 'run' : 'stand' });
    }
    if (T < enter) { sevakCarry(T, L(6, 1), LE(6, 1), -100, 900); }
    if (on(6, 5)) { thali(1050, 915, .62, 1); }
    sevakCarry(T, L(6, 5) - 1, LE(6, 5) + 1.5, -100, 900);
  } },

  // 7. the feast: plate after plate disappears
  7: { cam: [960, 620, 1.05], closeZoom: 1.25, draw(T) {
    hall(T, 7);
    const t0 = L(7, 0), n = Math.max(0, Math.floor((T - t0) / 3.2)), f = 1 - ((T - t0) / 3.2 - n);
    const empty = T > L(7, 8) + .5;  // kitchen and store are empty
    for (let i = 0; i < Math.min(n, 14); i++) { ell(560 - (i % 2) * 30, 1000 - i * 9, 60, 20, '#c79422'); ell(560 - (i % 2) * 30, 996 - i * 9, 54, 16, '#f2c14e'); }
    gan(900, 935, 1.05, { pose: empty ? 'sit' : 'eat', dir: 1, mood: on(7, 7) ? 'hungry' : 'happy', belly: clamp((T - t0) / 60) * .4 });
    thali(1050, 915, .62, empty ? 0 : f);
    const worried = on(7, 6);
    who('Kuber', 1360, 985, 1, { pose: worried ? (during(7, 7) ? 'shout' : 'stand') : during(7, 2) || during(7, 3) ? 'point' : 'stand', dir: -1, mood: worried ? 'worried' : 'happy', gaze: -1 });
    mush(640, 985, 1.15, { pose: during(7, 5) ? 'shock' : 'stand', modak: during(7, 8) });
    for (let i = 0; i < n && T < L(7, 6); i++) sevakCarry(T, t0 + i * 3.2 - 1.4, t0 + i * 3.2 + 1.6, -100, 860);
    if (during(7, 6) || during(7, 10)) who('Sevak', 250, 985, .95, { pose: 'shout', mood: 'surprised', gaze: 1 });
  } },

  8: { cam: [960, 640, 1.08], closeZoom: 1.4, draw(T) { courtyardFrame(T, true); } },

  // 9. Bal Ganesh eats the palace: plates, curtains, chandelier, coins
  9: { cam: [960, 620, 1.05], closeZoom: 1.25, draw(T) {
    const st = hall(T, 9);
    const leave = L(9, 10) + .5, door = LE(9, 10) + .5;
    const plateNow = T > L(9, 0) && T < LE(9, 1) + .3;
    const g = walkPos(T, leave, door, 900, 1500);
    const standing = T > leave;
    if (st.coins > 0) coinChest(1160, 990, .9, st.coins);
    gan(g.x, standing ? 975 : 935, 1.05, { pose: standing ? (g.walk ? 'walk' : 'stand') : (on(9, 4) && T < LE(9, 4) || T > L(9, 9) && T < LE(9, 9)) ? 'eat' : 'sit', dir: 1,
      item: plateNow ? 'plate' : T > L(9, 8) && T < LE(9, 9) ? 'coin' : null, bite: ease((T - L(9, 1)) / (LE(9, 1) - L(9, 1))), mood: 'hungry', belly: .4, chew: plateNow });
    if (st.plates > .02) { ell(1040, 960, 62 * st.plates, 22 * st.plates, '#c79422'); ell(1040, 956, 56 * st.plates, 18 * st.plates, '#f2c14e'); }
    const run = L(9, 11) + 1.5, k = walkPos(T, run, run + 2.5, 1360, -200);
    if (T < run + 2.6) who('Kuber', k.x, 985, 1, { walk: k.walk, pose: k.walk ? 'stand' : during(9, 2) ? 'shout' : during(9, 6) ? 'fold' : during(9, 7) ? 'give' : 'angry', dir: -1,
      mood: T > L(9, 9) && T < LE(9, 9) + 1 ? 'surprised' : 'worried', gaze: -1 });
    const mg = walkPos(T, leave + .4, door + .4, 640, 1350);
    mush(mg.x, 985, 1.15, { pose: mg.walk ? 'run' : during(9, 5) ? 'shock' : 'stand', mood: on(9, 5) ? 'shock' : 'happy' });
  } },

  // 10. Kuber begs at Kailash; Mata Parvati gives a handful of rice
  10: { cam: [960, 640, 1.0], closeZoom: 1.25, draw(T) { kailash(T, 10); } },

  // 11. the handful of rice, given with love, fills Bal Ganesh
  11: { cam: [1000, 620, 1.05], closeZoom: 1.25, draw(T) {
    hall(T, 11);
    const k = walkPos(T, L(11, 0), L(11, 0) + 3, -150, 1180);
    const fed = T > L(11, 2) + 2.5;
    gan(1520, 975, 1.05, { pose: T > L(11, 2) + 1 && T < L(11, 3) ? 'eat' : T > L(11, 8) ? 'dance' : T > L(11, 6) ? 'bless' : 'stand', dir: -1, item: T > L(11, 2) && T < L(11, 3) ? 'rice' : null,
      mood: fed ? 'full' : 'hungry', belly: .4 });
    if (fed) { light(1520, 760, 300, '255,210,120', .16 * ease((T - L(11, 3)) / 1.5)); burst(1520, 700, (T - L(11, 3)) / 1.6, 14); }
    who('Kuber', k.x, 985, 1, { walk: k.walk, pose: k.walk ? 'stand' : T < L(11, 4) ? 'kneel' : T > L(11, 8) ? 'dance' : 'fold', dir: 1, item: T < L(11, 3) && !k.walk ? 'ricebowl' : null,
      mood: T < L(11, 3) ? 'worried' : 'happy', gaze: 1, hands: !k.walk && T < L(11, 3) ? { l: [40, -330], r: [110, -320] } : null });
    mush(1760, 985, 1.15, { pose: T > L(11, 8) ? 'dance' : during(11, 4) ? 'shock' : 'stand', mood: during(11, 4) ? 'shock' : 'happy', flip: true });
    if (T > L(11, 8)) petals(T);
  } },

  // 12. back in the courtyard: Monu learns, everyone cheers
  12: { cam: [960, 640, 1.08], closeZoom: 1.4, draw(T) {
    NOW = T; ctx.drawImage(BG.court_night, 0, 0); stars(T, .8); moon(1650, 120, 40);
    cycle(1560, 905, .95);
    charpai(960, 912, 1.1);
    const cheer = on(12, 6);
    who('Dadi', 960, 905, 1, { pose: 'sit', smileEyes: !talking('Dadi') && on(12, 4) });
    if (cheer) { who('Pari', 700, 1000, 1, { pose: 'jump' }); who('Monu', 1240, 1000, 1, { pose: 'jump' }); }
    else { who('Pari', 760, 905, 1, { pose: 'sit', gaze: 1 }); who('Monu', 1160, 905, 1, { pose: 'sit', gaze: -1, mood: during(12, 1) ? 'sad' : 'happy' }); }
    charpaiFront(960, 1000, 1.1);
    diya(620, 1030, 1, { t: T }); diya(1300, 1030, 1, { t: T });
    shade(.1); light(960, 650, 700, '255,190,110', .3);
    if (cheer) petals(T);
  } },
};

function kailash(T, sc) {
  NOW = T; const ev = sc === 10; ctx.drawImage(BG['kailash_' + (ev ? 'evening' : 'day')], 0, 0);
  // gentle falling snow
  for (let i = 0; i < 50; i++) { const x = (i * 197 + Math.sin(T * .5 + i) * 40) % W, y = (i * 83 + T * 40) % H; circ(x, y, 2 + (i % 3), 'rgba(255,255,255,0.7)'); }
  const meditate = sc === 4 && T < L(4, 2);
  trishulStand(560, 905, 1);
  who('Shiv', 720, 880, 1.02, { pose: 'sitfloor', closedEyes: meditate, mood: 'happy', gaze: 1 });
  shivLap(720, 880, 1.02);
  if (!meditate) light(720, 520, 260, '200,230,255', .12);
  const gives = sc === 10 && T > L(10, 6) && T < L(10, 6) + 2.5;
  who('Parvati', 960, 885, .95, { pose: gives ? 'give' : 'sitfloor', dir: 1, item: sc === 10 && T > L(10, 6) - 1 && T < L(10, 6) + 2 ? 'ricebowl' : null, gaze: sc === 4 && on(4, 12) ? 1 : 1 });
  if (sc === 4) {
    // the golden chariot flies in and lands
    const a = ease((T - L(4, 1)) / Math.max(1, LE(4, 3) - L(4, 1)));
    vimana(lerp(2300, 1730, a), lerp(150, 880, a), .78, T);
    const out = L(4, 4) - .6, k = walkPos(T, out, out + 1.8, 1700, 1480);
    const leave = L(4, 14), gx = walkPos(T, leave, leave + 3, 1160, 1640), mx = walkPos(T, leave + .3, leave + 3.3, 1300, 1760);
    if (T < L(4, 2)) { gan(1250, 975, 1, { pose: 'dance', dir: -1 }); mush(1420, 980, 1.1, { pose: 'run', flip: Math.sin(T) > 0 }); }
    else {
      gan(gx.x, 975, 1, { pose: gx.walk ? 'walk' : during(4, 12) ? 'stand' : 'stand', dir: on(4, 12) && !on(4, 14) ? -1 : 1, mood: on(4, 12) ? 'hungry' : 'happy', gaze: on(4, 12) ? -1 : 1 });
      mush(mx.x, 980, 1.1, { pose: mx.walk ? 'run' : during(4, 2) ? 'shock' : during(4, 14) ? 'dance' : 'stand', mood: during(4, 2) ? 'shock' : 'happy' });
    }
    if (T > out) who('Kuber', k.x, 985, 1, { walk: k.walk, pose: k.walk ? 'stand' : during(4, 4) ? 'fold' : during(4, 6) ? 'point' : 'stand', dir: -1, gaze: -1, mood: during(4, 11) ? 'surprised' : 'happy' });
  } else {
    const k = walkPos(T, L(10, 0) - 1.5, L(10, 0) + .8, 2100, 1260);
    who('Kuber', k.x, 985, 1, { walk: k.walk, pose: k.walk ? 'stand' : T > L(10, 6) + 1.5 ? 'hold' : 'kneel', dir: -1, item: T > L(10, 6) + 1.8 ? 'ricebowl' : null, mood: T > L(10, 5) ? 'sad' : 'worried', gaze: -1 });
  }
}

// title, story-name, moral and ending cards
function overlays(T) {
  const s2 = SCENE_START[2] || 12;
  if (T > s2 - .2 && T < s2 + 4.5) { const a = Math.min(ease((T - s2 + .2) / .6), 1 - ease((T - s2 - 3.5) / 1)); bigText('बाल गणेश और कुबेर का घमंड', 170, a, 104); ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = '800 56px Baloo'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#5a2310'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.strokeText('दादी की कहानियाँ', W / 2, 270); ctx.fillText('दादी की कहानियाँ', W / 2, 270); ctx.restore(); }
  const tl = L(2, 9); if (T > tl + 1.5 && T < tl + 6) bigText('बाल गणेश और कुबेर का घमंड', 200, Math.min(ease((T - tl - 1.5) / .6), 1 - ease((T - tl - 5) / 1)), 100);
  if (SCENE_LINES[12]) { const m0 = L(12, 4), m1 = LE(12, 4); if (T > m0 - .3 && T < m1 + 1.5) card('सीख', DATA.moral, Math.min(ease((T - m0 + .3) / .8), 1 - ease((T - m1 - .5) / 1))); }
  const e = END - (CONFIG.endExtra || 4); if (T > e) { bigText('गणपति बप्पा मोरया!', 470, ease((T - e) / 1), 130); if (T > e + 1) { ctx.save(); ctx.globalAlpha = ease((T - e - 1) / 1); ctx.textAlign = 'center'; ctx.font = '800 60px Baloo'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#5a2310'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.strokeText('अगली कहानी जल्द ही...', W / 2, 600); ctx.fillText('अगली कहानी जल्द ही...', W / 2, 600); ctx.restore(); } }
}
