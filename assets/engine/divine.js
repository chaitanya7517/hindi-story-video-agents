// =====================================================================
//  Divine & festival characters for the engine (load AFTER engine.js)
//  - balGanesh(): child Ganesh ji who walks, talks, eats, blesses, dances
//  - mushakChar(): Mooshak standing up, talking (front view)
//  - extra props: gold plate, thali, coin chest, chandelier, chariot
//  Drawn with care and respect: kind faces, no harm, no mockery of the gods.
// =====================================================================

// ---------- Bal Ganesh ----------
// o: { t, name, talk, mood, pose: stand|walk|eat|bless|fold|dance|sit, dir (1 = facing right), belly 0..1,
//      item: 'plate'|'modak'|'coin'|'rice' (held in the eating hand), gaze, chew }
function balGanesh(x, y, s, o = {}) {
  const t = o.t || 0, pose = o.pose || 'stand', d = o.dir || 1, seed = 3;
  const sk = '#f39a55', skD = '#d8783a', skL = '#ffc08a', gold = '#f2c14e', goldD = '#c79422';
  const walk = pose === 'walk', dance = pose === 'dance', sit = pose === 'sit' || pose === 'eat';
  const bob = walk ? -Math.abs(Math.sin(t * 8)) * 7 : dance ? -Math.abs(Math.sin(t * 6)) * 18 : Math.sin(t * 2 + seed) * 2;
  const bel = 1 + (o.belly || 0) * .35;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(0, 2, 90 * bel, 12, 'rgba(0,0,0,0.22)');
  ctx.translate(0, bob);
  // ----- legs + dhoti -----
  const sw = walk ? Math.sin(t * 8) * 16 : dance ? Math.sin(t * 6) * 12 : 0;
  if (sit) {
    ell(0, -34, 92 * bel, 34, '#f4c20d'); rect(-92 * bel, -12, 184 * bel, 8, '#c0392b');
    for (const k of [-1, 1]) { ell(k * 70 * bel, -14, 30, 16, sk); circ(k * 88 * bel, -10, 5, gold); }
  } else {
    for (const k of [-1, 1]) {
      const fx = k * 30 + k * (k > 0 ? -sw : sw);
      limb(k * 30, -70, fx, -8, 34, 28, sk);
      ell(fx + k * 6, -4, 22, 10, skD); circ(fx, -16, 5, gold); circ(fx + 8, -16, 5, gold);
    }
    ell(0, -84, 72 * bel, 40, '#f4c20d');
    poly([-60 * bel, -84, 60 * bel, -84, 46, -50, -46, -50], '#f4c20d');
    rect(-58, -56, 116, 7, '#c0392b');
  }
  const hipY = sit ? -40 : -84;
  // ----- body (big round belly) -----
  const by = hipY - 66;
  ell(0, by, 70 * bel, 72 * bel, sk);
  ell(-18, by - 18, 30 * bel, 28 * bel, 'rgba(255,255,255,0.13)');
  circ(0, by + 22 * bel, 6, skD);
  rect(-70 * bel, hipY - 16, 140 * bel, 20, '#f4c20d'); for (let k = -3; k <= 3; k++) circ(k * 18 * bel, hipY - 6, 4, '#c0392b');
  // red sash (janeu-like) across the chest
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, by, 70 * bel, 72 * bel, 0, 0, 6.3); ctx.clip();
  line(-48, by - 70, 60, by + 40, 12, '#d6332b'); ctx.restore();
  // gold necklace
  for (let k = 0; k < 9; k++) { const a = Math.PI * (k / 8); circ(Math.cos(a) * 40, by - 62 + Math.sin(a) * 26, 6, k % 2 ? gold : '#e74c3c'); }
  // ----- arms -----
  const shY = by - 52, LS = [-46, shY], RS = [46, shY];
  let hl = [-74 * bel, by + 30], hr = [74 * bel, by + 30], bl = 1, br = -1;
  const mouthP = [d * 14, -232];
  if (pose === 'eat') { // eating hand goes plate -> mouth -> plate
    const c = (Math.sin(t * 5.2) + 1) / 2, ph = d > 0 ? 'hr' : 'hl';
    const p = lerp2([d * 92, hipY - 30], [d * 30, -236], ease(c));
    if (d > 0) { hr = p; br = -1; } else { hl = p; bl = 1; }
  }
  if (pose === 'bless') { hr = [70, shY - 64]; br = 1; }
  if (pose === 'fold') { hl = [-6, shY + 40]; hr = [6, shY + 40]; }
  if (dance) { const w = Math.sin(t * 6); hl = [-110, shY - 40 + w * 20]; hr = [110, shY - 40 - w * 20]; bl = -1; br = 1; }
  if (pose === 'stand' && o.talk && !o.hands) { hr = [92 + Math.sin(t * 2.6) * 8, shY + 30 + Math.sin(t * 3.3) * 12]; br = 1; }
  if (o.hands) { if (o.hands.l) hl = o.hands.l; if (o.hands.r) hr = o.hands.r; }
  arm(LS[0], LS[1], hl[0], hl[1], bl, sk, sk, 30, 15, 150, 0);
  arm(RS[0], RS[1], hr[0], hr[1], br, sk, sk, 30, 15, 150, 0);
  for (const p of [hl, hr]) circ(p[0], p[1] - 4, 5, gold);
  const eatHand = d > 0 ? hr : hl;
  if (o.item === 'plate') goldPlate(eatHand[0], eatHand[1] - 6, .55, { bitten: o.bite || 0 });
  else if (o.item === 'modak') modak(eatHand[0], eatHand[1] - 12, .8);
  else if (o.item === 'coin') { circ(eatHand[0], eatHand[1] - 10, 12, gold); circ(eatHand[0], eatHand[1] - 10, 8, goldD); }
  else if (o.item === 'rice') { ell(eatHand[0], eatHand[1] - 8, 16, 9, '#fff8e8'); }
  // ----- head -----
  const hy = -262, R = 56;
  const flap = Math.sin(t * 3 + seed) * .12;
  for (const k of [-1, 1]) {
    ctx.save(); ctx.translate(k * 52, hy + 4); ctx.rotate(k * (.15 + flap));
    ell(k * 24, 0, 50, 62, sk); ell(k * 26, 2, 35, 46, '#f7b2a0'); ctx.restore();
  }
  ell(0, hy, R, R * .96, sk);
  ell(-14, hy - 22, 22, 14, 'rgba(255,255,255,0.15)');
  // crown (mukut)
  ctx.beginPath(); ctx.moveTo(-44, hy - 40); ctx.lineTo(-34, hy - 92); ctx.lineTo(-16, hy - 72); ctx.lineTo(0, hy - 118); ctx.lineTo(16, hy - 72); ctx.lineTo(34, hy - 92); ctx.lineTo(44, hy - 40); ctx.closePath();
  ctx.fillStyle = lg(0, hy - 118, 0, hy - 40, [[0, '#ffe58a'], [1, goldD]]); ctx.fill();
  rect(-46, hy - 50, 92, 14, gold); for (const k of [-26, 0, 26]) circ(k, hy - 43, 4.5, '#e74c3c'); circ(0, hy - 96, 6, '#2ecc71');
  // tilak
  rrect(-5, hy - 36, 10, 24, 4, '#c0182a'); circ(0, hy - 10, 4, gold);
  // eyes
  const mood = o.mood || 'happy', blink = ((t + seed) % 3.7) < .13, lk = (o.gaze || 0) * 3;
  for (const k of [-1, 1]) {
    const ex = k * 21, ey = hy + 2;
    if (blink) line(ex - 7, ey, ex + 7, ey, 3, '#2a160c');
    else if (mood === 'full' || o.smileEyes) { ctx.beginPath(); ctx.arc(ex, ey + 4, 8, Math.PI * 1.15, Math.PI * 1.85); ctx.strokeStyle = '#2a160c'; ctx.lineWidth = 3.5; ctx.stroke(); }
    else { ell(ex + lk, ey, 8, 10, '#2a160c'); circ(ex + lk + 3, ey - 4, 3, '#fff'); }
    const brw = mood === 'hungry' ? k * .3 : mood === 'surprised' ? 0 : -k * .08;
    ctx.save(); ctx.translate(ex, ey - 16 - (mood === 'surprised' ? 5 : 0)); ctx.rotate(brw); line(-10, 0, 10, 0, 3, '#7a3a14'); ctx.restore();
    circ(k * 36, hy + 18, 9, 'rgba(240,96,110,0.35)');
  }
  // mouth (left of the trunk base, viewer side opposite to the trunk curl)
  const mx = -d * 20, my = hy + 34;
  const chewing = o.chew || pose === 'eat';
  const op = o.talk ? 3 + Math.abs(Math.sin(t * 15)) * 6 : chewing ? 2 + Math.abs(Math.sin(t * 10.4)) * 5 : 0;
  if (op > 0) ell(mx, my, 9, op, '#6e1c1f');
  else { ctx.beginPath(); ctx.arc(mx, my - 6, 9, .3, Math.PI - .3); ctx.strokeStyle = '#6e1c1f'; ctx.lineWidth = 3; ctx.stroke(); }
  // tusks: one whole, one broken (Ekadanta)
  poly([-d * 12, hy + 26, -d * 26, hy + 44, -d * 14, hy + 40], '#fffaf0');
  poly([d * 12, hy + 26, d * 18, hy + 33, d * 10, hy + 34], '#fffaf0');
  // trunk: tapered chain that curls to one side and sways
  const sway = Math.sin(t * 2.2 + seed) * 6, curl = o.talk ? Math.sin(t * 4) * 5 : 0;
  const pts = [[0, hy + 8], [d * 4, hy + 34], [d * 2, hy + 60], [d * 10, hy + 84], [d * 28 + sway, hy + 94], [d * 42 + sway, hy + 82 + curl], [d * 40 + sway, hy + 68 + curl]];
  const ws = [30, 28, 25, 22, 18, 14, 11];
  for (let k = 0; k < pts.length - 1; k++) limb(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], ws[k], ws[k + 1], sk);
  for (let k = 1; k < 5; k++) { const p = pts[k]; curve(p[0] - 9, p[1] - 2, p[0], p[1] + 3, p[0] + 9, p[1] - 2, 2, skD); }
  if (o.item === 'modak' && o.trunkModak) modak(pts[6][0], pts[6][1] - 14, .6);
  ctx.restore();
  if (o.name) POS_CUR[o.name] = [x, y + (hy + bob) * s, 50 * s];
}

// ---------- Mooshak, standing and talking (front view) ----------
function mushakChar(x, y, s, o = {}) {
  const t = o.t || 0, seed = 5, mood = o.mood || 'happy', dance = o.pose === 'dance', run = o.pose === 'run';
  const fur = '#a8764f', furL = '#d2a47c', pink = '#f2a7b5';
  const bob = dance || run ? -Math.abs(Math.sin(t * (run ? 12 : 7))) * 14 : Math.sin(t * 3 + seed) * 2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  ell(0, 2, 46, 8, 'rgba(0,0,0,0.22)');
  ctx.translate(0, bob);
  // tail
  ctx.beginPath(); ctx.moveTo(18, -24); ctx.bezierCurveTo(70, -10, 80, -70, 52 + Math.sin(t * 4) * 8, -92); ctx.lineWidth = 6; ctx.strokeStyle = '#8a5a3a'; ctx.lineCap = 'round'; ctx.stroke();
  // feet + body
  const st = run ? Math.sin(t * 12) * 8 : 0;
  ell(-16 + st, -4, 16, 8, '#8a5a3a'); ell(16 - st, -4, 16, 8, '#8a5a3a');
  ell(0, -50, 36, 46, fur); ell(0, -42, 24, 32, furL);
  // arms
  let hl = [-32, -46], hr = [32, -46];
  if (o.talk) hr = [40 + Math.sin(t * 3) * 6, -72 + Math.sin(t * 4) * 8];
  if (dance) { const w = Math.sin(t * 7); hl = [-48, -96 + w * 10]; hr = [48, -96 - w * 10]; }
  if (o.pose === 'shock') { hl = [-22, -118]; hr = [22, -118]; }
  if (o.pose === 'fold') { hl = [-4, -70]; hr = [4, -70]; }
  limb(-26, -72, hl[0], hl[1], 11, 8, fur); limb(26, -72, hr[0], hr[1], 11, 8, fur);
  circ(hl[0], hl[1], 6, pink); circ(hr[0], hr[1], 6, pink);
  if (o.modak) modak(hr[0] + 4, hr[1] - 10, .5);
  // head
  const hy = -112;
  for (const k of [-1, 1]) { circ(k * 30, hy - 26, 22, fur); circ(k * 30, hy - 26, 14, pink); }
  ell(0, hy, 34, 30, fur);
  ell(0, hy + 12, 20, 14, furL);
  circ(0, hy + 4, 6, '#e88a9a');
  for (const k of [-1, 1]) { line(k * 8, hy + 8, k * 34, hy + 2, 1.2, '#5a3a2a'); line(k * 8, hy + 10, k * 34, hy + 14, 1.2, '#5a3a2a'); }
  const blink = ((t + seed) % 3.3) < .12;
  for (const k of [-1, 1]) {
    if (blink) line(k * 12 - 5, hy - 8, k * 12 + 5, hy - 8, 2.5, '#1a0d05');
    else if (mood === 'shock') { circ(k * 12, hy - 8, 7, '#fff'); circ(k * 12, hy - 8, 3.5, '#1a0d05'); }
    else { ell(k * 12, hy - 8, 5, 6.5, '#1a0d05'); circ(k * 12 + 2, hy - 10, 1.6, '#fff'); }
  }
  rrect(-3, hy - 30, 6, 12, 3, '#c0182a');
  const op = o.talk ? 2 + Math.abs(Math.sin(t * 16)) * 5 : 0;
  if (op) ell(0, hy + 18, 6, op, '#6e1c1f');
  else if (mood === 'shock') ell(0, hy + 20, 5, 7, '#6e1c1f');
  else { ctx.beginPath(); ctx.arc(0, hy + 14, 6, .3, Math.PI - .3); ctx.strokeStyle = '#6e1c1f'; ctx.lineWidth = 2.2; ctx.stroke(); }
  line(-4, hy + 18, -4, hy + 24, 3, '#fff'); line(4, hy + 18, 4, hy + 24, 3, '#fff');
  ctx.restore();
  if (o.name) POS_CUR[o.name] = [x, y + (hy + bob) * s, 30 * s];
}

// ---------- props ----------
function goldPlate(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const b = o.bitten || 0;
  if (b > 0) { // bite marks: clip them away (more bites as b grows) - never paints black
    ctx.beginPath(); ctx.rect(-200, -200, 400, 400);
    const n = Math.ceil(b * 6); for (let k = 0; k < n; k++) { const a = -.6 + k * .42; ctx.moveTo(Math.cos(a) * 70 + 22, Math.sin(a) * 26); ctx.arc(Math.cos(a) * 70, Math.sin(a) * 26, 22, 0, 6.3); }
    if (b >= .98) { ctx.restore(); return; }
    ctx.clip('evenodd');
  }
  ell(0, 0, 70, 26, '#c79422'); ell(0, -4, 64, 22, '#f2c14e'); ell(0, -4, 44, 14, '#ffe58a');
  if (o.food) { const f = o.food; // food heaped on the plate
    if (f > .05) { for (let i = 0; i < Math.round(6 * f); i++) circ(-30 + i * 12, -12 - (i % 2) * 6, 10, ['#f4a020', '#ff8c1a', '#fff3c8', '#e8c98c'][i % 4]); }
    if (f > .5) for (let i = 0; i < 3; i++) modak(-18 + i * 18, -20, .5);
  }
  ctx.restore();
}
function thali(x, y, s, food = 1) { // big thali with katoris
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(0, 0, 120, 40, '#c79422'); ell(0, -5, 112, 35, '#f2c14e');
  if (food > 0) {
    const cols = ['#f6e7c1', '#e8a33c', '#f2d16b', '#9fc95c', '#e2563a'];
    for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; const kx = Math.cos(a) * 62, ky = Math.sin(a) * 18 - 6; ell(kx, ky, 24, 9, '#d9a92c'); if (food > k / 5) ell(kx, ky - 2, 19, 6, cols[k]); }
    if (food > .3) { for (let i = 0; i < 3; i++) circ(-14 + i * 14, -14, 10, '#f4a020'); }
    if (food > .6) modak(0, -24, .55);
  }
  ctx.restore();
}
function coinChest(x, y, s, fill = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(-90, -90, 180, 90, 8, '#7a3d18'); rect(-90, -60, 180, 10, '#c79422'); rect(-8, -70, 16, 24, '#c79422');
  if (fill > 0) { for (let i = 0; i < Math.round(22 * fill); i++) { const cx = -70 + (i * 37 % 140), cy = -92 - (i % 4) * 9; circ(cx, cy, 11, '#f2c14e'); circ(cx, cy, 7, '#d8a62e'); } }
  ctx.restore();
}
function chandelier(x, y, s, t, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  line(0, -400, 0, 0, 4, '#c79422');
  ell(0, 0, 120, 26, '#f2c14e'); ell(0, 30, 80, 20, '#e0b040');
  for (let k = -5; k <= 5; k++) { const px = k * 22; line(px, 10, px, 70 + Math.abs(k) * -4 + 40, 2, 'rgba(255,255,255,0.7)'); circ(px, 120 - Math.abs(k) * 4, 7, k % 2 ? '#bfe8ff' : '#ffffff'); }
  for (let k = 0; k < 6; k++) sparkle(Math.cos(k + t) * 100, 40 + Math.sin(k * 2 + t) * 30, 6 + 3 * Math.sin(t * 3 + k), .9);
  ctx.restore();
}
function vimana(x, y, s, t) { // Kuber's golden flying chariot (Pushpak style)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  light(0, -60, 260, '255,215,120', .35);
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + t; ell(Math.cos(a) * 150, 30 + Math.sin(a) * 14, 18, 10, 'rgba(255,255,255,0.6)'); }
  poly([-170, 0, 170, 0, 130, 50, -130, 50], '#c79422'); rect(-170, -14, 340, 16, '#f2c14e');
  for (let k = -3; k <= 3; k++) rect(k * 48 - 6, -110, 12, 96, '#f2c14e');
  poly([-150, -110, 150, -110, 0, -200], '#e0a82c'); circ(0, -206, 12, '#e74c3c');
  for (let k = -2; k <= 2; k++) circ(k * 60, -130, 9, k % 2 ? '#2ecc71' : '#e74c3c');
  ctx.restore();
}
