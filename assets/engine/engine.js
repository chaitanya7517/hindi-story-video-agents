// =====================================================================
//  Story animation engine (reusable for every project)
//  - drawing helpers, people with real elbows/hands, Mooshak, Ganesh murti, props
//  - camera director (follows the speaking character), subtitles, title & moral cards
//  - window.setup(data) / window.frame(t) used by tools/render.js
//  A project adds scenes.js that defines: SETS, SCENES, CAST, CONFIG
// =====================================================================
const W = 1920, H = 1080;
const mainCanvas = document.getElementById('c');
const mainCtx = mainCanvas.getContext('2d');
let ctx = mainCtx;
const mkCanvas = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = [mkCanvas(), mkCanvas()];

// ---------- math & drawing helpers ----------
function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const lerp2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
function circ(x, y, r, f) { ctx.beginPath(); ctx.arc(x, y, Math.max(r, .1), 0, 6.2832); ctx.fillStyle = f; ctx.fill(); }
function ell(x, y, rx, ry, f, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(rx, .1), Math.max(ry, .1), rot, 0, 6.2832); ctx.fillStyle = f; ctx.fill(); }
function rect(x, y, w, h, f) { ctx.fillStyle = f; ctx.fillRect(x, y, w, h); }
function rrect(x, y, w, h, r, f) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = f; ctx.fill(); }
function poly(p, f) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); ctx.fillStyle = f; ctx.fill(); }
function line(x1, y1, x2, y2, w, c) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.stroke(); }
function curve(x1, y1, cx, cy, x2, y2, w, c) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.stroke(); }
function lg(x1, y1, x2, y2, stops) { const g = ctx.createLinearGradient(x1, y1, x2, y2); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function light(x, y, r, rgb, a) {
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.4, `rgba(${rgb},${a * .35})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function shade(a, rgb = '12,18,52') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(${rgb},${a})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function darker(hex, f = .8) { const n = parseInt(hex.slice(1), 16); const d = c => Math.round(c * f); return `rgb(${d(n >> 16)},${d(n >> 8 & 255)},${d(n & 255)})`; }
function sparkle(x, y, r, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,226,140,${a})`; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); ctx.restore(); }
function heart(x, y, s, c) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-14, -4, -8, -16, 0, -8); ctx.bezierCurveTo(8, -16, 14, -4, 0, 6); ctx.fillStyle = c; ctx.fill(); ctx.restore(); }

// limb = tapered segment with round ends
function limb(x1, y1, x2, y2, w1, w2, col) {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  ctx.beginPath(); ctx.moveTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); ctx.lineTo(x2 + nx * w2 / 2, y2 + ny * w2 / 2);
  ctx.lineTo(x2 - nx * w2 / 2, y2 - ny * w2 / 2); ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); circ(x1, y1, w1 / 2, col); circ(x2, y2, w2 / 2, col);
}
function hand(x, y, ang, r, skin, side) {
  const sd = darker(skin, .8);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ell(r * .55, 0, r * 1.05, r * .78, skin);
  ell(r * .35, side * r * .72, r * .5, r * .26, skin, side * .7);
  ctx.strokeStyle = sd; ctx.lineWidth = Math.max(1, r * .12); ctx.lineCap = 'round';
  for (const k of [-.32, 0, .32]) { ctx.beginPath(); ctx.moveTo(r * 1.15, k * r); ctx.lineTo(r * 1.5, k * r * 1.1); ctx.stroke(); }
  ctx.restore();
}
// Arm with two bones solved by IK (fixed lengths => no stretching, elbows bend naturally).
// sleeve: fraction of the whole arm covered by cloth (0 = bare arm, 1 = full sleeve)
function arm(sx, sy, hx, hy, bend, sleeveCol, skin, w, hr, len, sleeve) {
  const a = len * .52, b = len * .48;
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 1; const ux = dx / d, uy = dy / d;
  d = Math.min(d, a + b - .5); hx = sx + ux * d; hy = sy + uy * d;
  const A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)) * (bend >= 0 ? 1 : -1);
  const ex = sx + (ux * Math.cos(A) - uy * Math.sin(A)) * a, ey = sy + (ux * Math.sin(A) + uy * Math.cos(A)) * a;
  limb(ex, ey, hx, hy, w * .78, w * .6, skin);
  limb(sx, sy, ex, ey, w * .95, w * .8, skin);
  if (sleeve > 0) {
    const s1 = Math.min(1, sleeve / .52), s2 = clamp((sleeve - .52) / .48);
    limb(sx, sy, lerp(sx, ex, s1), lerp(sy, ey, s1), w * 1.08, w * .98, sleeveCol);
    if (s2 > 0) limb(ex, ey, lerp(ex, hx, s2), lerp(ey, hy, s2), w * .98, w * .85, sleeveCol);
  }
  hand(hx, hy, Math.atan2(hy - ey, hx - ex), hr, skin, bend >= 0 ? 1 : -1);
  return [hx, hy];
}

// ---------- people ----------
const AGE = {
  child: { head: 47, leg: 112, torso: 118, sh: 33, arm: 106, w: 17, hr: 9 },
  adult: { head: 54, leg: 212, torso: 218, sh: 56, arm: 212, w: 24, hr: 12 },
  old: { head: 52, leg: 192, torso: 200, sh: 50, arm: 196, w: 22, hr: 11 },
};
const SLEEVE = { kurta: .78, vest: 0, frock: .22, choli: .3, saree: .3 };
// Where each named character's head is (world coords), kept per set - used by the camera
const POSMAP = {}; let POS_CUR = {};
function person(x, y, s, o) {
  const L = o.look, A = AGE[L.age || 'adult'], t = o.t || 0, pose = o.pose || 'stand';
  const skin = L.skin || '#c18457', top = L.top || '#e8d9b8', topD = darker(top, .82), bot = L.bottom || '#6b4328';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const seed = o.seed || 0;
  const bob = o.walk ? -Math.abs(Math.sin(t * 8 + seed)) * 6 : pose === 'dance' ? -Math.abs(Math.sin(t * 6 + seed)) * 16 : pose === 'jump' ? -Math.abs(Math.sin(t * 7 + seed)) * 30 : Math.sin(t * 2 + seed) * 1.5;
  let hipY = pose === 'sit' ? -A.leg * .5 : pose === 'sitfloor' ? -A.leg * .22 : pose === 'kneel' ? -A.leg * .45 : -A.leg;
  if (pose === 'fallen') hipY = -A.leg * .18;
  hipY += bob;
  const shY = hipY - A.torso, headY = shY - 12 - A.head;
  ell(0, 2, A.sh * 2.1, A.head * .24, 'rgba(0,0,0,0.22)');
  // ----- legs / lower clothes -----
  const skirt = ['ghagra', 'saree', 'frock'].includes(L.bottomStyle);
  const fx = A.sh * .45, sw = o.walk ? Math.sin(t * 8 + seed) * A.sh * .3 : 0;
  const footCol = L.feet || '#6b3d22';
  if (pose === 'sit' || pose === 'fallen') {
    for (const k of [-1, 1]) { ell(k * fx * 1.2, hipY + 8, A.sh * .55, A.head * .42, L.bottomStyle === 'shorts' ? bot : skirt ? bot : bot); limb(k * fx * 1.3, hipY + 14, k * fx * 1.4, -6, A.w * 1.2, A.w * .95, skirt || L.bottomStyle === 'shorts' ? skin : bot); ell(k * fx * 1.5, -3, A.w * .95, A.w * .4, footCol); }
    if (skirt) { poly([-A.sh * 1.1, hipY - 10, A.sh * 1.1, hipY - 10, A.sh * 1.4, hipY + A.leg * .45, -A.sh * 1.4, hipY + A.leg * .45], bot); }
  } else if (pose === 'sitfloor') {
    ell(0, hipY + 16, A.sh * 2.5, A.head * .55, skirt ? bot : bot); ell(-A.sh * 1.4, hipY + 28, A.w, A.w * .45, skin); ell(A.sh * 1.4, hipY + 28, A.w, A.w * .45, skin);
  } else if (pose === 'kneel') {
    limb(-fx, hipY, -fx * 1.2, -12, A.w * 2.1, A.w * 1.7, bot); ell(-fx * 2.2, -10, A.sh * .8, A.w * .6, bot); ell(-fx * 3.5, -5, A.w, A.w * .4, footCol);
    limb(fx, hipY, fx * 2.4, hipY + A.leg * .05, A.w * 2, A.w * 1.7, bot); limb(fx * 2.4, hipY + A.leg * .05, fx * 2.5, -6, A.w * 1.6, A.w * 1.3, bot); ell(fx * 2.8, -3, A.w, A.w * .4, footCol);
  } else {
    const spread = pose === 'pull' ? A.sh * .9 : fx;
    for (const k of [-1, 1]) {
      const fxk = k * spread + k * sw * (k > 0 ? -1 : 1);
      if (L.bottomStyle === 'shorts') { limb(k * fx, hipY, lerp(k * fx, fxk, .45), hipY + A.leg * .42, A.w * 1.5, A.w * 1.3, bot); limb(lerp(k * fx, fxk, .45), hipY + A.leg * .42, fxk, -6, A.w * .95, A.w * .8, skin); }
      else if (skirt) limb(k * fx * .7, hipY + A.leg * .4, fxk * .8, -6, A.w * .95, A.w * .8, skin);
      else limb(k * fx, hipY, fxk, -6, L.bottomStyle === 'dhoti' ? A.w * 1.9 : A.w * 1.35, L.bottomStyle === 'dhoti' ? A.w * 1.5 : A.w * 1.1, bot);
      ell(fxk * (skirt ? .8 : 1) + k * 4, -3, A.w * .95, A.w * .4, footCol);
    }
    if (skirt) { const hem = L.bottomStyle === 'frock' ? hipY + A.leg * .5 : -14; poly([-A.sh * .95, hipY - A.torso * .12, A.sh * .95, hipY - A.torso * .12, A.sh * 1.45, hem, -A.sh * 1.45, hem], bot); if (L.border) rect(-A.sh * 1.45, hem - 10, A.sh * 2.9, 10, L.border); }
  }
  // ----- upper body (can lean) -----
  const lean = o.lean != null ? o.lean : pose === 'pull' ? (o.dir || 1) * -.22 + (o.strain ? Math.sin(t * 25) * .03 : 0) : 0;
  ctx.save(); if (lean) { ctx.translate(0, hipY); ctx.rotate(lean); ctx.translate(0, -hipY); }
  // hair behind
  const hairC = L.hairCol || '#1c1411';
  if (L.hair === 'bob') ell(0, headY + 10, A.head * 1.18, A.head * 1.12, hairC);
  if (L.hair === 'bun') { circ(0, headY - A.head * .95, A.head * .42, hairC); ell(0, headY - 4, A.head * 1.08, A.head * 1.06, hairC); }
  if (L.hair === 'plait' || L.hair === 'long') ell(0, headY + 4, A.head * 1.1, A.head * 1.12, hairC);
  // torso
  const belly = L.belly || 0, ts = L.topStyle || 'kurta';
  const hem = ts === 'vest' ? hipY + 8 : ts === 'frock' || ts === 'choli' ? hipY - A.torso * .1 : ts === 'saree' ? hipY + 20 : hipY + A.leg * .3;
  const hw = A.sh + 12 + belly * 26;
  ctx.beginPath(); ctx.moveTo(-A.sh, shY); ctx.quadraticCurveTo(-hw - 6, lerp(shY, hem, .55), -hw, hem); ctx.lineTo(hw, hem); ctx.quadraticCurveTo(hw + 6, lerp(shY, hem, .55), A.sh, shY); ctx.closePath();
  ctx.fillStyle = lg(-hw, 0, hw, 0, [[0, topD], [.32, top], [.68, top], [1, topD]]); ctx.fill();
  if (belly) { ell(0, hipY - A.torso * .28, A.sh + belly * 34, A.torso * .3 + belly * 16, top); ell(-8, hipY - A.torso * .36, A.sh * .5, A.torso * .12, 'rgba(255,255,255,0.12)'); }
  if (L.pattern) { const r = rng(5); for (let i = 0; i < 14; i++) { const px = (r() - .5) * hw * 1.5, py = lerp(shY + 25, hem - 10, r()); for (let k = 0; k < 5; k++) circ(px + Math.cos(k * 1.26) * 3, py + Math.sin(k * 1.26) * 3, 1.8, L.pattern); } }
  if (ts === 'kurta') line(0, shY + 6, 0, shY + A.torso * .32, 3, topD);
  if (ts === 'vest') { line(-6, shY + 4, -6, hem - 4, 3, topD); }
  if (ts === 'saree') { ctx.beginPath(); ctx.moveTo(-A.sh * .7, shY - 2); ctx.lineTo(-A.sh * .2, shY - 2); ctx.lineTo(hw, hem - 30); ctx.lineTo(hw - 40, hem); ctx.closePath(); ctx.fillStyle = L.pallu || top; ctx.fill(); line(-A.sh * .2, shY - 2, hw, hem - 30, 7, L.border || '#8a1c1c'); }
  if (L.waistcoat) poly([-A.sh, shY + 4, -A.sh * .25, shY + 4, -A.sh * .2, hipY, -hw * .95, hipY, -hw * .98, lerp(shY, hipY, .5)], L.waistcoat), poly([A.sh, shY + 4, A.sh * .25, shY + 4, A.sh * .2, hipY, hw * .95, hipY, hw * .98, lerp(shY, hipY, .5)], L.waistcoat);
  if (L.shawl) { ctx.beginPath(); ctx.moveTo(-A.sh - 4, shY - 4); ctx.lineTo(-A.sh * .3, shY - 6); ctx.lineTo(hw + 4, lerp(shY, hem, .78)); ctx.lineTo(hw - 30, lerp(shY, hem, .95)); ctx.closePath(); ctx.fillStyle = L.shawl; ctx.fill(); }
  if (L.jewels) for (let j = 0; j < 3; j++) for (let k = 0; k < 13; k++) { const a = Math.PI * (k / 12); circ(Math.cos(a) * A.sh * (.5 + j * .14), shY + 8 + Math.sin(a) * A.torso * (.18 + j * .09), 4.5, j === 1 ? '#e74c3c' : '#f2c14e'); }
  if (L.mala) for (let k = 0; k < 12; k++) { const a = Math.PI * (k / 11); circ(Math.cos(a) * A.sh * .55, shY + 6 + Math.sin(a) * A.torso * .25, 3.5, L.mala); }
  rect(-A.head * .24, shY - 16, A.head * .48, 22, darker(skin, .85));
  // ----- arms -----
  const LS = [-A.sh, shY + 10], RS = [A.sh, shY + 10], reach = A.arm;
  const rest = k => pose === 'sit' || pose === 'sitfloor' ? [k * A.sh * .55, hipY + 4] : [k * (A.sh + 8 + belly * 22), shY + reach * .985];
  let hl = rest(-1), hr = rest(1), bl = 1, br = -1;
  const dir = o.dir || 1;
  switch (pose) {
    case 'fold': hl = [-5, shY + reach * .42]; hr = [5, shY + reach * .42]; bl = 1; br = -1; break;
    case 'pull': hl = [dir * reach * .55, shY + reach * .55]; hr = [dir * reach * .8, shY + reach * .5]; bl = dir > 0 ? -1 : 1; br = dir > 0 ? -1 : 1; break;
    case 'carry': hl = [-A.sh * .7, headY - A.head - 18]; hr = [A.sh * .7, headY - A.head - 18]; bl = -1; br = 1; break;
    case 'dance': case 'jump': { const w = Math.sin(t * 6 + seed); hl = [-A.sh - reach * .4, shY - reach * .35 + w * 20]; hr = [A.sh + reach * .4, shY - reach * .35 - w * 20]; bl = -1; br = 1; break; }
    case 'point': hl = rest(-1); hr = [dir * reach * .98, shY + 4]; if (dir < 0) { hl = [-reach * .98, shY + 4]; hr = rest(1); bl = -1; } br = 1; break;
    case 'cross': hl = [A.sh * .55, shY + A.torso * .42]; hr = [-A.sh * .55, shY + A.torso * .48]; bl = -1; br = 1; break;
    case 'tie': { const m = Math.sin(t * 4) * 8; hl = [-A.sh * .4, hipY - 6 + m]; hr = [A.sh * .5, hipY - 10 - m]; bl = 1; br = -1; break; }
    case 'give': hr = [dir * reach * .85, shY + reach * .55]; br = dir > 0 ? -1 : 1; break;
    case 'hold': hl = [-A.sh * .45, shY + reach * .62]; hr = [A.sh * .45, shY + reach * .62]; break;
    case 'angry': hl = [-hw - 4, hipY - 18]; hr = [dir * reach * .9, shY - 10 + Math.sin(t * 9) * 10]; br = 1; break;
    case 'shout': hl = [-A.sh * .4, headY + A.head * .6]; hr = [A.sh * .4, headY + A.head * .6]; bl = -1; br = 1; break;
    case 'fallen': hl = [-A.sh - 30, hipY + 10]; hr = [A.sh + 30, hipY + 10]; break;
    case 'hug': hl = [dir * reach * .7, shY + reach * .55]; hr = [dir * reach * .9, shY + reach * .35]; bl = -dir; br = -dir; break;
    default: if (o.talk && !o.hands) { hr = [A.sh + 26 + Math.sin(t * 2.6) * 8, shY + reach * .42 + Math.sin(t * 3.3) * 12]; br = 1; }
  }
  if (o.hands) { if (o.hands.l) hl = o.hands.l; if (o.hands.r) hr = o.hands.r; }
  const slv = SLEEVE[ts] ?? .7;
  const ph = [];
  ph[0] = arm(LS[0], LS[1], hl[0], hl[1], bl, topD, skin, A.w, A.hr, reach, slv);
  if (o.item) drawItem(o.item, hl, hr, A, t);
  ph[1] = arm(RS[0], RS[1], hr[0], hr[1], br, topD, skin, A.w, A.hr, reach, slv);
  if (o.itemR) drawItem(o.itemR, hr, hr, A, t, true);
  // ----- head -----
  const R = A.head, ear = L.bigEars ? 1.7 : 1;
  for (const k of [-1, 1]) ell(k * R * .95, headY + 6, R * .2 * ear, R * .26 * ear, skin);
  if (L.earrings) for (const k of [-1, 1]) circ(k * R * .96, headY + R * .38, 4, '#f2c14e');
  circ(0, headY, R, skin);
  const hc = hairC;
  if (L.hair === 'bob') { ctx.beginPath(); ctx.moveTo(-R * 1.08, headY + R * .5); ctx.quadraticCurveTo(-R * 1.15, headY - R * 1.25, 0, headY - R * 1.12); ctx.quadraticCurveTo(R * 1.15, headY - R * 1.25, R * 1.08, headY + R * .5); ctx.quadraticCurveTo(R * .9, headY - R * .55, 0, headY - R * .55); ctx.quadraticCurveTo(-R * .9, headY - R * .55, -R * 1.08, headY + R * .5); ctx.fillStyle = hc; ctx.fill(); if (L.clip) ell(R * .5, headY - R * .72, 12, 6, L.clip, .4); }
  else if (L.hair === 'turban') { const tc = L.turban || '#e0b020'; ell(0, headY - R * .62, R * 1.12, R * .62, tc); ell(0, headY - R * .95, R * .95, R * .5, darker(tc, .92)); for (let k = 0; k < 4; k++) curve(-R * 1.05, headY - R * (.35 + k * .2), 0, headY - R * (.75 + k * .2), R * 1.05, headY - R * (.45 + k * .18), 3, darker(tc, .78)); if (L.turbanTail) ell(R * .9, headY - R * .5, R * .18, R * .45, tc, -.4); }
  else if (L.hair === 'spiky' || L.hair === 'messy' || L.hair === 'short') {
    ell(0, headY - R * .62, R * 1.02, R * .55, hc);
    const n = L.hair === 'spiky' ? 7 : 5;
    for (let k = 0; k < n; k++) { const a = Math.PI * (1.08 + k * .84 / (n - 1)); const bx = Math.cos(a) * R * .95, by = headY + Math.sin(a) * R * .95; poly([bx - 9, by + 6, bx + 9, by + 6, bx * 1.2, by - (L.hair === 'spiky' ? 22 : 12)], hc); }
    ell(-R * .92, headY - R * .1, R * .16, R * .38, hc); ell(R * .92, headY - R * .1, R * .16, R * .38, hc);
    if (L.grey) for (const gx of [-.5, -.15, .4]) line(gx * R, headY - R * 1.05, gx * R + 8, headY - R * .7, 2, '#9a9a9a');
  } else if (L.hair === 'bun' || L.hair === 'plait' || L.hair === 'long') {
    ctx.beginPath(); ctx.moveTo(-R * 1.04, headY + R * .1); ctx.quadraticCurveTo(-R * 1.04, headY - R * 1.28, 0, headY - R * 1.12); ctx.quadraticCurveTo(R * 1.04, headY - R * 1.28, R * 1.04, headY + R * .1); ctx.quadraticCurveTo(R * .7, headY - R * .7, R * .06, headY - R * .7); ctx.quadraticCurveTo(-R * .7, headY - R * .7, -R * 1.04, headY + R * .1); ctx.fillStyle = hc; ctx.fill();
    line(0, headY - R * 1.1, 0, headY - R * .72, 2, darker(hc === '#e8e6e0' ? '#d0d0d0' : '#333333', .6));
  }
  // divine / royal extras (optional look fields)
  if (L.jata) { // Shiv ji: tall matted-hair bun, crescent moon, Ganga stream, rudraksha band
    ell(0, headY - R * 1.15, R * .5, R * .62, hairC); ell(0, headY - R * 1.62, R * .34, R * .36, hairC);
    for (let k = 0; k < 7; k++) circ(-R * .42 + k * R * .14, headY - R * .86, R * .07, '#7a2e14');
    ctx.beginPath(); ctx.arc(R * .32, headY - R * 1.42, R * .22, -1.9, 1.2); ctx.lineWidth = R * .08; ctx.strokeStyle = '#fdf6dc'; ctx.stroke();
    curve(-R * .2, headY - R * 1.9, -R * .55, headY - R * 2.2, -R * .35, headY - R * 2.55, R * .07, 'rgba(160,220,255,0.85)');
  }
  if (L.crown) { const cg = L.crown, cy = headY - R * .78;
    ctx.beginPath(); ctx.moveTo(-R * .82, cy); ctx.lineTo(-R * .66, cy - R * .78); ctx.lineTo(-R * .3, cy - R * .48); ctx.lineTo(0, cy - R * 1.1); ctx.lineTo(R * .3, cy - R * .48); ctx.lineTo(R * .66, cy - R * .78); ctx.lineTo(R * .82, cy); ctx.closePath();
    ctx.fillStyle = lg(0, cy - R * 1.1, 0, cy, [[0, '#ffe58a'], [1, cg]]); ctx.fill();
    rect(-R * .86, cy - R * .14, R * 1.72, R * .26, '#f2c14e'); for (const k of [-.5, 0, .5]) circ(k * R, cy - R * .01, R * .08, k ? '#2e86de' : '#e74c3c'); circ(0, cy - R * .72, R * .1, '#2ecc71');
  }
  if (L.snake) { // a calm green snake resting around the neck
    ctx.beginPath(); ctx.moveTo(-A.sh * .9, shY + 4); ctx.quadraticCurveTo(0, shY + A.torso * .3, A.sh * .9, shY + 4); ctx.lineWidth = 11; ctx.strokeStyle = '#3f8f4a'; ctx.stroke();
    ell(A.sh * .95, shY - 8, 12, 9, '#3f8f4a'); circ(A.sh * .99, shY - 10, 2, '#111');
  }
  // face
  const mood = o.mood || 'happy', kid = L.age === 'child', er = kid ? [8.5, 11] : [7, 8.5];
  const blink = ((t + seed * 1.7) % 4.1) < .13 || o.closedEyes, lk = (o.gaze || 0) * 3;
  for (const k of [-1, 1]) {
    const ex = k * R * .38, ey = headY + R * .05;
    if (blink) line(ex - 8, ey, ex + 8, ey, 3, '#2a160c');
    else if (o.smileEyes) { ctx.beginPath(); ctx.arc(ex, ey + 4, 8, Math.PI * 1.15, Math.PI * 1.85); ctx.strokeStyle = '#2a160c'; ctx.lineWidth = 3; ctx.stroke(); }
    else { ell(ex + lk, ey, er[0], er[1], '#2a160c'); circ(ex + lk + er[0] * .35, ey - er[1] * .4, er[0] * .35, '#fff'); }
    const br = mood === 'angry' ? -k * .35 : mood === 'sad' || mood === 'worried' ? k * .3 : mood === 'surprised' ? 0 : -k * .06;
    ctx.save(); ctx.translate(ex, ey - R * .3 - (mood === 'surprised' ? 6 : 0)); ctx.rotate(br); line(-R * .2, 0, R * .2, 0, L.age === 'adult' && !L.female ? 5 : 3, L.browCol || '#2a160c'); ctx.restore();
    if (kid || L.female) circ(k * R * .6, headY + R * .42, R * .17, 'rgba(240,96,110,0.32)');
    if (L.age === 'old') { line(k * R * .58, headY + R * .02, k * R * .72, headY + R * .1, 1.5, darker(skin, .75)); line(k * R * .55, headY + R * .5, k * R * .45, headY + R * .66, 1.5, darker(skin, .75)); }
  }
  if (L.glasses) { ctx.strokeStyle = '#b8902a'; ctx.lineWidth = 2.6; for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * R * .38, headY + R * .05, R * .26, 0, 6.3); ctx.stroke(); } line(-R * .12, headY + R * .02, R * .12, headY + R * .02, 2.5, '#b8902a'); }
  ctx.beginPath(); ctx.arc(0, headY + R * .26, R * .1, .2, Math.PI - .2); ctx.strokeStyle = darker(skin, .75); ctx.lineWidth = 2.5; ctx.stroke();
  if (L.bindi) circ(0, headY - R * .42, R * .07, '#c0182a');
  if (L.tripundra) { for (const k of [-1, 0, 1]) line(-R * .32, headY - R * .5 + k * R * .1, R * .32, headY - R * .5 + k * R * .1, 3, '#f4f1ea'); circ(0, headY - R * .5, R * .06, '#c0182a'); }
  if (L.tilak) { rrect(-R * .06, headY - R * .62, R * .12, R * .36, 4, '#d4202a'); circ(0, headY - R * .2, R * .05, '#f5c542'); }
  const my = headY + R * .55;
  if (o.talk) { const op = 2 + Math.abs(Math.sin(t * 15 + seed)) * 5; ctx.beginPath(); ctx.moveTo(-R * .22, my - 4); ctx.quadraticCurveTo(0, my, R * .22, my - 4); ctx.quadraticCurveTo(R * .16, my + op * 1.6, 0, my + op * 1.7); ctx.quadraticCurveTo(-R * .16, my + op * 1.6, -R * .22, my - 4); ctx.fillStyle = '#6e1c1f'; ctx.fill(); }
  else if (mood === 'sad' || mood === 'worried') { ctx.beginPath(); ctx.arc(0, my + 12, R * .18, Math.PI + .5, -.5); ctx.strokeStyle = '#6e1c1f'; ctx.lineWidth = 3.5; ctx.stroke(); }
  else if (mood === 'angry') line(-R * .18, my + 2, R * .18, my + 2, 4, '#6e1c1f');
  else if (mood === 'surprised') ell(0, my + 4, R * .1, R * .14, '#6e1c1f');
  else { ctx.beginPath(); ctx.arc(0, my - 8, R * .24, .35, Math.PI - .35); ctx.strokeStyle = '#6e1c1f'; ctx.lineWidth = 3.5; ctx.stroke(); }
  if (L.mustache) { const mc = L.mustacheCol || '#1b1715', big = L.mustache === 2; ell(-R * .26, my - 10, R * .3, R * (big ? .13 : .09), mc, .25); ell(R * .26, my - 10, R * .3, R * (big ? .13 : .09), mc, -.25); if (big) { curve(-R * .5, my - 12, -R * .7, my - 30, -R * .55, my - 34, 5, mc); curve(R * .5, my - 12, R * .7, my - 30, R * .55, my - 34, 5, mc); } }
  if (L.beard) { ctx.beginPath(); ctx.moveTo(-R * .8, headY + R * .3); ctx.quadraticCurveTo(-R * .6, headY + R * 1.45, 0, headY + R * 1.5); ctx.quadraticCurveTo(R * .6, headY + R * 1.45, R * .8, headY + R * .3); ctx.quadraticCurveTo(R * .4, headY + R * .95, 0, headY + R * .95); ctx.quadraticCurveTo(-R * .4, headY + R * .95, -R * .8, headY + R * .3); ctx.fillStyle = L.beard; ctx.fill(); }
  // front plait over the shoulder
  if (L.hair === 'plait') { for (let k = 0; k < 7; k++) ell(R * .78 + k * 1.5, headY + R * .7 + k * 22, 12, 13, hairC); circ(R * .78 + 10, headY + R * .7 + 160, 8, L.ribbon || '#d8262e'); }
  if (L.hair === 'braids') for (const k of [-1, 1]) { for (let j = 0; j < 5; j++) ell(k * R * 1.02, headY + R * .4 + j * 19, 11, 12, hairC); circ(k * R * 1.02, headY + R * .4 + 100, 7, L.ribbon || '#d8262e'); }
  ctx.restore();
  // record head position for the camera
  if (o.name) POS_CUR[o.name] = [x, y + headY * s, A.head * s];
  ctx.restore();
}
function drawItem(item, hl, hr, A, t, right) {
  const p = right ? hr : lerp2(hl, hr, .5);
  if (item === 'modak') modak(p[0], p[1] - 10, .9);
  else if (item === 'potli') potli(p[0], p[1] + 20, 1);
  else if (item === 'stick') line(p[0], p[1] - 60, p[0] + 8, p[1] + 150, 8, '#6b4a2a');
  else if (item === 'bamboo') { ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(-.35); rrect(-150, -7, 300, 14, 7, '#c9b25a'); for (let k = -2; k <= 2; k++) rect(k * 60 - 2, -8, 4, 16, '#9c8840'); ctx.restore(); }
  else if (item === 'jhalar') {}
  else if (item === 'trishul') { const q = right ? hr : hl; line(q[0], q[1] - 260, q[0], q[1] + 170, 7, '#8a8f99'); for (const k of [-1, 0, 1]) { line(q[0] + k * 26, q[1] - 300 + Math.abs(k) * 10, q[0] + k * 26, q[1] - 250, 6, '#b8bec8'); poly([q[0] + k * 26 - 7, q[1] - 300 + Math.abs(k) * 10, q[0] + k * 26 + 7, q[1] - 300 + Math.abs(k) * 10, q[0] + k * 26, q[1] - 326 + Math.abs(k) * 10], '#b8bec8'); } line(q[0] - 30, q[1] - 250, q[0] + 30, q[1] - 250, 6, '#b8bec8'); circ(q[0], q[1] - 236, 9, '#c0392b'); }
  else if (item === 'pot') { ell(p[0], p[1] + 6, 30, 28, '#c79422'); ell(p[0], p[1] - 18, 18, 7, '#f2c14e'); for (let k = 0; k < 5; k++) circ(p[0] - 12 + k * 6, p[1] - 22 - (k % 2) * 4, 5, '#ffe58a'); }
  else if (item === 'ricebowl') { ell(p[0], p[1] + 4, 30, 14, '#c79422'); ell(p[0], p[1] - 2, 26, 9, '#fff8e8'); for (let k = 0; k < 8; k++) circ(p[0] - 18 + k * 5, p[1] - 4 - (k % 3) * 2, 2.2, '#f0e0c0'); }
  else if (item === 'thali') thali(p[0], p[1] - 4, .55, 1);
}

// ---------- Mooshak (side view mouse) ----------
function mouse(x, y, s, o = {}) {
  const t = o.t || 0, run = o.run ? Math.sin(t * 22) : 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  curve(-30, -10, -70, -40 + run * 6, -95, -12, 4, '#9b6b4a');
  for (const k of [-14, 14]) limb(k, -6, k + run * 6 * (k > 0 ? 1 : -1), 4, 7, 5, '#8a5a3a');
  ell(0, -18, 34, 20, '#a87650'); ell(4, -12, 24, 10, '#c79a76');
  ell(34, -28, 18, 15, '#a87650'); poly([44, -34, 66, -24, 44, -18], '#a87650'); circ(66, -24, 3.5, '#e88a9a');
  ell(28, -44, 9, 11, '#a87650'); ell(28, -44, 5.5, 7, '#f2a7b5');
  circ(42, -31, 3.3, '#1a0d05'); circ(43, -32, 1.1, '#fff');
  for (const k of [-1, 1]) line(58, -24, 74, -24 + k * 6, 1, '#5a3a2a');
  if (o.modak) modak(70, -18, .55);
  ctx.restore();
}
function modak(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-20, 12); ctx.quadraticCurveTo(-24, -6, 0, -26); ctx.quadraticCurveTo(24, -6, 20, 12); ctx.quadraticCurveTo(0, 18, -20, 12);
  ctx.fillStyle = lg(0, -26, 0, 14, [[0, '#fff6dc'], [1, '#e8c98c']]); ctx.fill();
  for (const k of [-12, -4, 4, 12]) curve(k * .4, -22, k, -4, k * 1.3, 12, 1.5, 'rgba(160,120,60,0.6)');
  ctx.restore();
}
function potli(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ell(0, 10, 34, 30, '#c0392b'); poly([-14, -14, 14, -14, 22, -30, -22, -30], '#c0392b'); line(-16, -14, 16, -14, 4, '#f1c40f'); for (let k = 0; k < 6; k++) circ(-22 + k * 9, 14, 2.5, '#f1c40f'); ctx.restore(); }

// ---------- Ganesh ji murti (drawn with care and respect) ----------
function ganeshMurti(x, y, s, o = {}) {
  const t = o.t || 0, smile = o.smile || 0, glow = o.glow || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow > 0) { light(0, -230, 420 * (1 + .05 * Math.sin(t * 2)), '255,200,90', .55 * glow); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + t * .3; sparkle(Math.cos(a) * 240, -230 + Math.sin(a) * 200, 6 + 4 * Math.sin(t * 3 + i), glow); } }
  const sk = '#f08a3c', skD = '#d26a22', gold = '#f2c14e', goldD = '#c79422';
  // halo
  circ(0, -250, 175, 'rgba(255,214,120,0.35)'); ctx.lineWidth = 8; ctx.strokeStyle = gold; ctx.beginPath(); ctx.arc(0, -250, 170, Math.PI * .95, Math.PI * 2.05); ctx.stroke();
  // lotus seat
  for (let k = -4; k <= 4; k++) { ctx.save(); ctx.translate(k * 34, 0); ctx.rotate(k * .12); ell(0, -16, 24, 34, k % 2 ? '#f48fb1' : '#f06292'); ctx.restore(); }
  rrect(-170, -10, 340, 40, 10, '#b5651d');
  // legs (seated) + dhoti
  ell(0, -60, 150, 55, '#e8b020'); ell(-70, -40, 60, 26, sk); ell(70, -40, 60, 26, sk);
  // belly & body
  ell(0, -160, 105, 110, sk); ell(0, -140, 90, 85, darker(sk, 1.04)); circ(0, -130, 7, skD);
  rect(-108, -96, 216, 26, '#e8b020'); // waist cloth
  poly([-60, -250, 60, -250, 30, -200, -30, -200], '#c0392b'); // upper cloth
  for (let k = 0; k < 9; k++) { const a = Math.PI * (k / 8); circ(Math.cos(a) * 62, -248 + Math.sin(a) * 58, 6, k % 2 ? gold : '#e74c3c'); }
  // arms: right hand blessing (abhaya), left hand holding modak bowl
  arm(-82, -230, -150, -170, 1, sk, sk, 34, 22, 150, 0);
  arm(82, -230, 140, -120, -1, sk, sk, 34, 22, 160, 0);
  rrect(118, -126, 70, 22, 10, gold); modak(140, -134, .9); modak(165, -132, .8);
  ctx.save(); ctx.translate(-158, -218); ell(0, 0, 26, 34, sk); for (let k = -1; k <= 2; k++) rrect(-18 + k * 11, -52, 10, 30, 5, sk); circ(0, 2, 6, '#c0392b'); ctx.restore();
  for (const k of [-1, 1]) for (const yy of [-200, -160]) circ(k * (k < 0 ? 150 : 140), yy + (k < 0 ? 0 : 50), 9, gold);
  // ears
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 120, -330, 82, 100, k * .25, 0, 6.3); ctx.fillStyle = sk; ctx.fill(); ell(k * 125, -330, 58, 74, '#f6a466', k * .25); }
  // head
  ell(0, -335, 92, 88, sk);
  // trunk curving to Ganesh ji's left (viewer's right)
  ctx.beginPath(); ctx.moveTo(-28, -300); ctx.quadraticCurveTo(-34, -210, 10, -190); ctx.quadraticCurveTo(70, -175, 72, -215); ctx.quadraticCurveTo(64, -232, 50, -220); ctx.quadraticCurveTo(46, -200, 18, -212); ctx.quadraticCurveTo(10, -250, 28, -300); ctx.closePath(); ctx.fillStyle = sk; ctx.fill();
  for (let k = 0; k < 6; k++) curve(-24 + k * 2, -280 + k * 14, 0, -276 + k * 14, 24 - k * 2, -280 + k * 14, 2, skD);
  // tusk
  poly([30, -275, 50, -262, 34, -266], '#fffaf0');
  // eyes (they smile when smile=1)
  for (const k of [-1, 1]) {
    if (smile > .5) { ctx.beginPath(); ctx.arc(k * 38, -338, 12, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = '#2a160c'; ctx.lineWidth = 4; ctx.stroke(); }
    else { ell(k * 38, -340, 9, 11, '#fff'); circ(k * 38, -339, 6, '#2a160c'); }
    curve(k * 26, -362, k * 38, -370, k * 52, -362, 3, '#2a160c');
  }
  // tilak + crown
  rrect(-6, -400, 12, 40, 5, '#c0182a'); circ(0, -372, 6, gold);
  ctx.beginPath(); ctx.moveTo(-80, -405); ctx.lineTo(-62, -500); ctx.lineTo(-30, -470); ctx.lineTo(0, -560); ctx.lineTo(30, -470); ctx.lineTo(62, -500); ctx.lineTo(80, -405); ctx.closePath();
  ctx.fillStyle = lg(0, -560, 0, -405, [[0, '#ffe58a'], [1, goldD]]); ctx.fill();
  rect(-82, -420, 164, 22, gold); for (const k of [-50, 0, 50]) circ(k, -409, 7, '#e74c3c'); circ(0, -520, 9, '#2ecc71');
  if (smile > 0) light(0, -320, 160, '255,220,150', .25 * smile);
  ctx.restore();
}

// ---------- common props ----------
function charpaiFront(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const k of [-1, 1]) rect(k * 200 - 9, -112, 18, 112, '#5e3a20'); rect(-212, -118, 424, 18, '#6b4426'); rect(-212, -104, 424, 4, 'rgba(0,0,0,0.25)'); ctx.restore(); }
function charpai(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const k of [-1, 1]) { rect(k * 190 - 8, -110, 16, 110, '#6b4426'); } rect(-210, -120, 420, 22, '#7d5131'); ctx.strokeStyle = '#d8c39a'; ctx.lineWidth = 3; for (let i = -190; i < 190; i += 16) { ctx.beginPath(); ctx.moveTo(i, -118); ctx.lineTo(i + 12, -100); ctx.stroke(); } ctx.restore(); }
function marigoldString(x1, y1, x2, y2, sag, t, cols = ['#ff9a1a', '#ffd21a']) {
  const n = Math.max(6, Math.round(Math.hypot(x2 - x1, y2 - y1) / 16));
  for (let k = 0; k <= n; k++) { const u = k / n, x = lerp(x1, x2, u), y = lerp(y1, y2, u) + 4 * sag * u * (1 - u) + Math.sin(t * 2 + k) * 1.5; circ(x, y, 8, cols[k % cols.length]); circ(x - 2, y - 2, 3, 'rgba(255,255,255,0.35)'); }
}
function diya(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-34, -10); ctx.quadraticCurveTo(-30, 20, 0, 18); ctx.quadraticCurveTo(28, 18, 36, -8); ctx.lineTo(54, -20); ctx.quadraticCurveTo(20, -6, -34, -10);
  ctx.fillStyle = lg(0, -20, 0, 20, [[0, '#c9643a'], [1, '#8f3f1d']]); ctx.fill(); ell(2, -11, 34, 7, '#7a3518');
  if (o.lit !== false) { const t = o.t || 0, f = 1 + .09 * Math.sin(t * 23) + .05 * Math.sin(t * 37), h = 36 * f; ctx.beginPath(); ctx.moveTo(38, -22); ctx.quadraticCurveTo(58, -24 - h * .4, 46 + Math.sin(t * 9) * 3, -24 - h); ctx.quadraticCurveTo(30, -24 - h * .4, 38, -22); ctx.fillStyle = lg(0, -24 - h, 0, -22, [[0, 'rgba(255,170,40,0.9)'], [.6, '#ffd75e'], [1, '#fff6d0']]); ctx.fill(); }
  ctx.restore();
}
const STARS = (() => { const r = rng(42); return [...Array(170)].map(() => ({ x: r() * W, y: r() * 560, r: .6 + r() * 1.8, p: r() * 6.3 })); })();
function stars(t, a = 1) { for (const s of STARS) circ(s.x, s.y, s.r, `rgba(255,255,240,${(0.45 + 0.4 * Math.sin(t * 2 + s.p)) * a})`); }
function moon(x, y, r) { light(x, y, r * 4, '200,210,255', .35); circ(x, y, r, '#fdf6dc'); circ(x - r * .25, y - r * .15, r * .17, 'rgba(200,190,160,0.4)'); circ(x + r * .3, y + r * .3, r * .12, 'rgba(200,190,160,0.4)'); }

// ---------- timeline, camera, rendering ----------
let SHOTS = [], LINES = [], END = 0, DATA = null;
const SCENE_START = {}, SCENE_LINES = {};
function lineAt(T) { for (const l of LINES) if (T >= l.start && T <= l.end + .15) return l; return null; }
function speakerAt(T) { const l = lineAt(T); return l ? l.speaker : null; }
// L(scene, k): start time of the k-th line of a scene; E(scene,k): its end
const L = (sc, k) => (SCENE_LINES[sc][Math.min(k, SCENE_LINES[sc].length - 1)] || { start: 1e9 }).start;
const LE = (sc, k) => (SCENE_LINES[sc][Math.min(k, SCENE_LINES[sc].length - 1)] || { end: 1e9 }).end;
const since = (T, sc, k, dur = 1) => ease((T - L(sc, k)) / dur);
function shotAt(T) { let i = 0; for (let k = 0; k < SHOTS.length; k++) if (T >= SHOTS[k].start) i = k; return i; }

// Camera: wide by default; glides to whoever is talking (if they are on screen in this set)
const sceneKey = sh => sh.set === 'courtyard' && SETS_STORY[sh.scene] ? 'frame' : sh.scene;
// Who the camera should be on: the current speaker is HELD through the short pauses between lines
// (no zoom-out/zoom-in "pumping"), very short lines (< 1.6 s) don't move the camera,
// and after 1.5 s of silence it eases back to the wide shot.
function camSpeaker(T) {
  let best = null;
  for (const l of LINES) {
    if (l.start > T) break;
    if (l.end - l.start >= 1.6 || (best && best.speaker === l.speaker)) best = l;
  }
  return best && T - best.end < 1.5 ? best.speaker : null;
}
function camTarget(key, T) {
  const sc = SCENES[key] || {}, base = sc.cam || [960, 540, 1];
  const custom = sc.camAt && sc.camAt(T); if (custom) return [custom[0], custom[1], Math.min(custom[2], 1.75)];
  const sp = camSpeaker(T), P = POSMAP[key] || {};
  if (sp && P[sp]) { const [x, y, R] = P[sp]; return [x, y + R * 2.1, clamp((sc.closeZoom || 1.25) * 54 / R, 1.05, 1.7)]; }
  return base;
}
// Smooth camera: weighted average of where the camera wants to be over a 3-second window
// (Hann/bell-shaped weights, starting 0.6 s ahead) -> every move eases in and eases out, like a real dolly.
const CAM_N = 24, CAM_BACK = 2.4, CAM_AHEAD = 0.6;
const CAM_W = Array.from({ length: CAM_N }, (_, k) => Math.sin(Math.PI * (k + .5) / CAM_N) ** 2);
function cameraFor(i, T) {
  const key = sceneKey(SHOTS[i]); let j = i; while (j > 0 && sceneKey(SHOTS[j - 1]) === key && SHOTS[j - 1].scene === SHOTS[i].scene) j--;
  let k2 = i; while (k2 < SHOTS.length - 1 && sceneKey(SHOTS[k2 + 1]) === key && SHOTS[k2 + 1].scene === SHOTS[i].scene) k2++;
  const t0 = SHOTS[j].start, t1 = SHOTS[k2].end;
  let x = 0, y = 0, lz = 0, ws = 0;
  for (let k = 0; k < CAM_N; k++) {
    const t = clamp(T + CAM_AHEAD - (CAM_BACK + CAM_AHEAD) * k / (CAM_N - 1), t0, t1), w = CAM_W[k];
    const c = camTarget(key, t); x += c[0] * w; y += c[1] * w; lz += Math.log(c[2]) * w; ws += w;
  }
  x /= ws; y /= ws; const z = Math.exp(lz / ws) * (1 + .01 * Math.sin(T * .2));   // zoom averaged in log space = even speed
  let tx = W / 2 - x * z, ty = H / 2 - y * z;
  tx = Math.min(0, Math.max(W - W * z, tx)); ty = Math.min(0, Math.max(H - H * z, ty));
  return [z, tx, ty];
}
const SETS_STORY = {};
function renderShot(i, T, canvas) {
  const old = ctx; ctx = canvas.getContext('2d');
  const sh = SHOTS[i], key = sceneKey(sh);
  POS_CUR = POSMAP[key] = POSMAP[key] || {};
  const [z, tx, ty] = cameraFor(i, T);
  ctx.setTransform(z, 0, 0, z, tx, ty);
  (SCENES[key] || SCENES.frame).draw(T, sh);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (SETS_STORY[sh.scene] && key !== 'frame') storyVignette();
  ctx = old;
}
function storyVignette() { const g = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * .95); g.addColorStop(0, 'rgba(60,30,0,0)'); g.addColorStop(1, 'rgba(60,30,0,0.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

// ---------- text overlays ----------
function chunks(text, max = 44) { const w = text.split(' '), out = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > max && cur) { out.push(cur.trim()); cur = x; } else cur += ' ' + x; } if (cur.trim()) out.push(cur.trim()); return out; }
function subtitle(T) {
  const l = lineAt(T); if (!l || l.noSub) return;
  const cs = chunks(l.text), tot = cs.reduce((a, c) => a + c.length, 0); let acc = l.start, part = cs[cs.length - 1];
  for (const c of cs) { const d = (l.end - l.start) * c.length / tot; if (T < acc + d) { part = c; break; } acc += d; }
  const who = CAST[l.speaker] || {}, label = who.hindi ? who.hindi + ': ' : '';
  ctx.textBaseline = 'middle'; ctx.font = '800 52px Baloo'; const lw = ctx.measureText(label).width; ctx.font = '700 52px Baloo'; const tw = ctx.measureText(part).width + lw;
  rrect(W / 2 - tw / 2 - 32, 958, tw + 64, 84, 22, 'rgba(10,8,20,0.62)');
  let x = W / 2 - tw / 2;
  if (label) { ctx.font = '800 52px Baloo'; ctx.fillStyle = who.color || '#ffd166'; ctx.fillText(label, x, 1001); x += lw; }
  ctx.font = '700 52px Baloo'; ctx.fillStyle = '#fff'; ctx.fillText(part, x, 1001);
}
function bigText(text, y, a, size = 120) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `800 ${size}px Baloo`; ctx.lineWidth = size / 8; ctx.strokeStyle = '#5a2310'; ctx.lineJoin = 'round'; ctx.strokeText(text, W / 2, y);
  ctx.fillStyle = lg(0, y - size / 2, 0, y + size / 2, [[0, '#fff3b0'], [1, '#ffb43c']]); ctx.fillText(text, W / 2, y); ctx.restore();
}
function card(title, body, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = []; let cur = ''; for (const p of body.split(' ')) { if ((cur + ' ' + p).length > 34 && cur) { lines.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) lines.push(cur);
  const h = 130 + lines.length * 66;
  rrect(W / 2 - 640, 60, 1280, h, 40, 'rgba(255,246,224,0.95)'); ctx.lineWidth = 8; ctx.strokeStyle = '#e08a1e'; ctx.beginPath(); ctx.roundRect(W / 2 - 640, 60, 1280, h, 40); ctx.stroke();
  ctx.font = '800 64px Baloo'; ctx.fillStyle = '#c2410c'; ctx.fillText(title, W / 2, 120);
  ctx.font = '700 54px Baloo'; ctx.fillStyle = '#3b2412'; lines.forEach((l, k) => ctx.fillText(l, W / 2, 200 + k * 66));
  ctx.restore();
}

// ---------- public API for tools/render.js ----------
window.setup = async (d) => {
  DATA = d;
  const meta = Object.fromEntries(d.storyboard.shots.map(s => [s.id, s]));
  SHOTS = d.timeline.shots.map(s => ({ ...s, scene: meta[s.id].scene, set: meta[s.id].set || meta[s.id].location }));
  LINES = SHOTS.flatMap(s => s.lines.map(l => ({ ...l, scene: s.scene })));
  for (const s of SHOTS) { if (!(s.scene in SCENE_START)) SCENE_START[s.scene] = s.start; }
  for (const l of LINES) (SCENE_LINES[l.scene] = SCENE_LINES[l.scene] || []).push(l);
  for (const k of (CONFIG.storyScenes || [])) SETS_STORY[k] = true;
  END = d.timeline.duration + (CONFIG.endExtra || 3);
  for (const w of ['700', '800']) { await document.fonts.load(`${w} 52px Baloo`, 'गणेश'); await document.fonts.load(`${w} 52px Baloo`, 'abc'); }
  if (window.buildBackgrounds) buildBackgrounds();
  return END;
};
const XF = .5;
window.drawFrame = (T) => {
  ctx = mainCtx; ctx.setTransform(1, 0, 0, 1, 0, 0);
  const i = shotAt(T), sh = SHOTS[i];
  const prev = i > 0 ? SHOTS[i - 1] : null;
  const cut = prev && (prev.set !== sh.set || prev.scene !== sh.scene);
  renderShot(i, T, BUF[0]);
  if (cut && T - sh.start < XF) { renderShot(i - 1, T, BUF[1]); ctx.drawImage(BUF[1], 0, 0); ctx.globalAlpha = ease((T - sh.start) / XF); ctx.drawImage(BUF[0], 0, 0); ctx.globalAlpha = 1; }
  else ctx.drawImage(BUF[0], 0, 0);
  if (T < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - T})`; ctx.fillRect(0, 0, W, H); }
  if (window.overlays) overlays(T);
  subtitle(T);
  if (T > END - 2) { ctx.fillStyle = `rgba(0,0,0,${ease((T - (END - 2)) / 2)})`; ctx.fillRect(0, 0, W, H); }
};
window.frame = (T, q) => { window.drawFrame(T); return mainCanvas.toDataURL('image/jpeg', q || .92); };
