// =====================================================================
//  animals.js — cartoon animal characters + comic effects (load after engine.js)
//  goat(x, y, s, o)   : Golu the goat. (x, y) = point on the ground between his feet.
//  monkey(x, y, s, o) : cheeky monkey, front view. (x, y) = bottom (feet / seat).
//  Effects: mango, strawHat, steam, dizzyStars, bubble, speedLines, dust, hayPile, motionArc
// =====================================================================

// ---------- props ----------
function mango(x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ell(0, 0, 22, 28, lg(-20, -20, 20, 25, [[0, '#ffd23f'], [.6, '#f9a21a'], [1, '#e2671a']]));
  ell(-7, -9, 6, 9, 'rgba(255,255,255,.35)', -.4);
  line(0, -27, 3, -36, 4, '#5a3a1a'); ell(11, -36, 11, 5, '#3f9a3a', -.4);
  ctx.restore();
}
function strawHat(x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ell(0, 0, 62, 15, '#d9a93c'); ell(0, -3, 58, 11, '#f0c95a');
  ctx.beginPath(); ctx.moveTo(-34, -2); ctx.quadraticCurveTo(-34, -46, 0, -48); ctx.quadraticCurveTo(34, -46, 34, -2); ctx.closePath(); ctx.fillStyle = '#f0c95a'; ctx.fill();
  for (let i = -26; i <= 26; i += 9) line(i, -4, i * .7, -42, 1.5, 'rgba(160,110,30,.45)');
  ctx.fillStyle = '#d6332b'; ctx.fillRect(-34, -16, 68, 11);
  ctx.restore();
}
function steam(x, y, t, a = 1) {   // angry steam puffs rising from the head
  if (a <= 0) return;
  for (let i = 0; i < 6; i++) {
    const k = ((t * 1.6 + i / 6) % 1), side = i % 2 ? 1 : -1;
    ctx.globalAlpha = a * (1 - k) * .9; circ(x + side * (20 + k * 50), y - k * 120, 14 + k * 26, '#ffffff'); ctx.globalAlpha = 1;
  }
}
function dizzyStars(x, y, t, r = 60, a = 1) {
  if (a <= 0) return;
  for (let i = 0; i < 4; i++) {
    const ang = t * 5 + i * 1.57, px = x + Math.cos(ang) * r, py = y + Math.sin(ang) * r * .3;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(px, py); ctx.rotate(t * 4); ctx.beginPath();
    for (let k = 0; k < 10; k++) { const rr = k % 2 ? 7 : 17, aa = k * Math.PI / 5; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
    ctx.closePath(); ctx.fillStyle = '#ffd21f'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#c47a00'; ctx.stroke(); ctx.restore();
  }
}
function bubble(x, y, ch, a = 1, s = 1) {   // "?" or "!" pop bubble
  if (a <= 0) return;
  const p = Math.min(1, a * 1.6), sc = s * (p < 1 ? .4 + .6 * p + Math.sin(p * Math.PI) * .25 : 1);
  ctx.save(); ctx.globalAlpha = Math.min(1, a * 2); ctx.translate(x, y); ctx.scale(sc, sc);
  circ(0, 0, 46, '#fff'); poly([-14, 36, 8, 40, -26, 66], '#fff');
  ctx.lineWidth = 5; ctx.strokeStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 6.2832); ctx.stroke();
  ctx.font = '800 64px Baloo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ch === '!' ? '#e8331c' : '#2a6cd6'; ctx.fillText(ch, 0, 4);
  ctx.restore();
}
function speedLines(x, y, dir, a = 1) {
  if (a <= 0) return;
  for (let i = 0; i < 6; i++) { const yy = y - 150 + i * 30, len = 80 + (i * 37) % 70; ctx.globalAlpha = a * .7; line(x - dir * (60 + (i * 23) % 40), yy, x - dir * (60 + len + (i * 23) % 40), yy, 5, '#ffffff'); }
  ctx.globalAlpha = 1;
}
function dust(x, y, k, n = 7) {    // puff of dust, k: 0..1 life
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) { const a = Math.PI + i / (n - 1) * Math.PI; ctx.globalAlpha = (1 - k) * .8; circ(x + Math.cos(a) * 90 * k, y + Math.sin(a) * 40 * k - 10, 18 + 22 * k, '#e9dcc0'); }
  ctx.globalAlpha = 1;
}
function impact(x, y, k) {        // "bonk" burst
  if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(.5 + k, .5 + k); ctx.globalAlpha = 1 - k; ctx.beginPath();
  for (let i = 0; i < 16; i++) { const r = i % 2 ? 40 : 90, a = i * Math.PI / 8; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fillStyle = '#fff6b0'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#f08a1a'; ctx.stroke(); ctx.restore();
}
function hayPile(x, y, s = 1, front = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!front) {
    ctx.beginPath(); ctx.moveTo(-170, 0); ctx.quadraticCurveTo(-150, -150, 0, -165); ctx.quadraticCurveTo(150, -150, 170, 0); ctx.closePath();
    ctx.fillStyle = lg(0, -165, 0, 0, [[0, '#f4d36a'], [1, '#c99a2e']]); ctx.fill();
    for (let i = 0; i < 40; i++) { const a = (i * 2.39) % 3.14, r = 60 + (i * 37) % 100; line(Math.cos(a) * r * .9, -Math.sin(a) * r * .9, Math.cos(a) * r * .9 + 12, -Math.sin(a) * r * .9 - 18, 2.5, 'rgba(150,100,20,.55)'); }
  } else {   // front lip drawn over a character sitting "in" the pile
    ctx.beginPath(); ctx.moveTo(-170, 0); ctx.quadraticCurveTo(-120, -70, 0, -75); ctx.quadraticCurveTo(120, -70, 170, 0); ctx.closePath();
    ctx.fillStyle = lg(0, -75, 0, 0, [[0, '#f2cf62'], [1, '#c99a2e']]); ctx.fill();
    for (let i = 0; i < 18; i++) { const xx = -150 + i * 17; line(xx, -20 - (i * 13) % 40, xx + 10, -50 - (i * 7) % 30, 2.5, 'rgba(150,100,20,.6)'); }
  }
  ctx.restore();
}

// ---------- Golu the goat ----------
// o: t, dir (1 = faces right), pose ('stand' | 'eat' | 'walk' | 'run' | 'charge' | 'back' | 'stomp' | 'dazed'),
//    mood ('happy' | 'angry' | 'smug' | 'sad' | 'shock' | 'love'), look (-1..1 head turn up), hat (bool), mango (in mouth), blink
function goat(x, y, s, o = {}) {
  const t = o.t || 0, d = o.dir || 1, pose = o.pose || 'stand', mood = o.mood || 'happy';
  const moving = pose === 'walk' || pose === 'run' || pose === 'charge' || pose === 'back';
  const sp = pose === 'run' || pose === 'charge' ? 22 : pose === 'back' ? 9 : 10;
  const bob = moving ? -Math.abs(Math.sin(t * sp)) * (pose === 'walk' || pose === 'back' ? 6 : 14) : pose === 'stomp' ? -Math.abs(Math.sin(t * 14)) * 10 : Math.sin(t * 2.2) * 2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * d, s);
  ell(0, 4, 120, 16, 'rgba(0,0,0,.18)');
  ctx.translate(0, bob);
  const lean = pose === 'charge' ? .12 : pose === 'eat' ? .04 : 0; ctx.rotate(lean);
  // legs (back pair darker)
  const legs = [[-62, 0], [-38, 1.6], [40, .8], [64, 2.4]];
  legs.forEach(([lx, ph], i) => {
    const sw = moving ? Math.sin(t * sp + ph) * (pose === 'run' || pose === 'charge' ? 34 : 16) : pose === 'stomp' && i === 2 ? -Math.abs(Math.sin(t * 14)) * 30 : 0;
    const lift = moving ? Math.max(0, Math.sin(t * sp + ph)) * 16 : pose === 'stomp' && i === 2 ? Math.abs(Math.sin(t * 14)) * 24 : 0;
    const col = i === 1 || i === 3 ? '#d8d0c2' : '#ece6dc';
    limb(lx, -82, lx + sw, -lift - bob * 0, 17, 13, col);
    rrect(lx + sw - 11, -lift - 14, 22, 16, 5, '#5a4636');
  });
  // tail
  const wag = Math.sin(t * (mood === 'happy' || mood === 'love' ? 9 : 3)) * .5;
  ctx.save(); ctx.translate(-100, -150); ctx.rotate(-.6 + wag); ell(-6, -16, 11, 22, '#f4f0e8'); ctx.restore();
  // body + fluff
  ell(0, -120, 104, 64, '#f7f4ee');
  for (let i = 0; i < 7; i++) circ(-84 + i * 28, -170 - Math.sin(i * 1.3) * 5, 24, '#fbf9f4');
  ell(10, -96, 70, 26, 'rgba(0,0,0,.05)');
  // head position by pose
  let hx = 98, hy = -200, hr = 0;
  if (pose === 'eat') { const ch = Math.sin(t * 7) * 4; hx = 128; hy = -70 + ch; hr = .5; }
  if (pose === 'charge') { hx = 132; hy = -132; hr = .55; }
  if (pose === 'dazed') { hr = Math.sin(t * 3) * .15; }
  const look = o.look || 0; hy -= look * 14; hr -= look * .35;
  // neck
  ctx.beginPath(); ctx.moveTo(52, -160); ctx.quadraticCurveTo(hx - 20, hy + 10, hx - 10, hy + 30); ctx.lineTo(hx + 18, hy + 34); ctx.quadraticCurveTo(hx, hy + 70, 86, -110); ctx.closePath(); ctx.fillStyle = '#f7f4ee'; ctx.fill();
  // collar + bell
  ctx.save(); ctx.translate(hx - 18, hy + 52); ctx.rotate(hr * .5 - .5); rrect(-26, -7, 52, 14, 7, '#d6332b'); circ(0, 16, 12, '#f2c230'); circ(0, 20, 3.5, '#8a5a10'); ctx.restore();
  // head
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(hr);
  // horns
  ctx.lineCap = 'round';
  curve(-14, -36, -30, -72, -2, -80, 11, '#c9ad7a'); curve(10, -38, 2, -76, 30, -80, 11, '#d8be8a');
  // back ear
  ell(-40, -14, 30, 13, '#e3d8c6', -.5);
  ell(0, 0, 50, 43, '#f9f6f0');
  // snout
  ell(40, 18, 34, 27, '#efe5d6');
  ell(58, 8, 4, 3, '#7a5a48'); ell(48, 6, 4, 3, '#7a5a48');
  // mouth
  ctx.lineCap = 'round';
  const chew = pose === 'eat' ? Math.sin(t * 14) * 4 : 0;
  if (o.mango) { mango(62, 34, .9, .3); }
  else if (mood === 'angry') { curve(28, 34, 44, 26, 62, 34, 4, '#5a3a2a'); }
  else if (mood === 'shock') { ell(46, 34, 9, 12, '#5a2a2a'); }
  else if (mood === 'sad') { curve(28, 38, 44, 28, 62, 38, 4, '#5a3a2a'); }
  else if (mood === 'laugh') { ctx.beginPath(); ctx.moveTo(26, 26); ctx.quadraticCurveTo(46, 60 + Math.abs(Math.sin(t * 12)) * 6, 66, 24); ctx.closePath(); ctx.fillStyle = '#7a2a2a'; ctx.fill(); ell(46, 40, 10, 6, '#ff8a8a'); }
  else { curve(26, 30 + chew * .3, 44, 42 + chew, 64, 28, 4, '#5a3a2a'); }
  // beard
  poly([22, 40, 40, 42, 30, 78 + Math.sin(t * 3) * 3], '#e8e0d2');
  // eye
  const blink = ((t + 1.7) % 3.3) < .12 && mood !== 'shock';
  const ex = 8, ey = -10;
  if (mood === 'love') { heart(ex, ey, 1.1, '#ff3b6b'); }
  else if (mood === 'smug' || blink || mood === 'laugh') { ctx.lineWidth = 4.5; ctx.strokeStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(ex, ey + (mood === 'smug' ? 2 : 4), 12, Math.PI * 1.1, Math.PI * 1.9, mood === 'smug'); ctx.stroke(); if (mood === 'smug') line(ex - 12, ey - 4, ex + 13, ey - 6, 5, '#2a1a10'); }
  else {
    const big = mood === 'shock' ? 1.25 : 1;
    ell(ex, ey, 15 * big, 19 * big, '#ffffff'); ctx.lineWidth = 2.5; ctx.strokeStyle = '#3a2a20'; ctx.beginPath(); ctx.ellipse(ex, ey, 15 * big, 19 * big, 0, 0, 6.2832); ctx.stroke();
    const px = ex + 4 + (o.gaze || 0) * 4, py = ey + 2 - look * 6;
    circ(px, py, 8 * (mood === 'shock' ? .7 : 1), '#2a1a10'); circ(px + 3, py - 3, 2.5, '#fff');
    if (mood === 'angry') { ctx.lineWidth = 7; line(ex - 18, ey - 30, ex + 16, ey - 18, 7, '#5a3a2a'); }
    if (mood === 'sad') { line(ex - 16, ey - 22, ex + 14, ey - 30, 5, '#5a3a2a'); }
  }
  // front ear (floppy)
  ell(-26, -4, 28, 12, '#e9dfd0', .9 + Math.sin(t * 2) * .05); ell(-24, -2, 18, 6, '#f3b9b0', .9);
  if (o.hat) strawHat(-4, -40, .95, -.12);
  ctx.restore();
  ctx.restore();
  if (o.name) POS_CUR[o.name] = [x + hx * s * d, y + hy * s, 50 * s];
}

// ---------- the monkey ----------
// o: t, pose ('sit' | 'stand' | 'sneak' | 'laugh' | 'dizzy' | 'fall' | 'sad' | 'eat' | 'hang' | 'wave'),
//    rot (whole body rotation), hat (on head), hold ('hat' | 'mango'), mood ('cheeky' | 'happy' | 'shock' | 'dizzy' | 'sad' | 'love'), bump, flip
function monkey(x, y, s, o = {}) {
  const t = o.t || 0, pose = o.pose || 'sit', mood = o.mood || 'cheeky';
  const fur = '#8a5530', furD = '#6e4224', skin = '#efc79a';
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s * (o.flip ? -1 : 1), s);
  const sitting = pose === 'sit' || pose === 'sad' || pose === 'eat' || pose === 'dizzy' || pose === 'laugh';
  const bob = pose === 'laugh' ? -Math.abs(Math.sin(t * 12)) * 8 : pose === 'sneak' ? -Math.abs(Math.sin(t * 6)) * 5 : Math.sin(t * 2.4) * 2;
  if (!o.noShadow && !o.rot) ell(0, 4, 70, 11, 'rgba(0,0,0,.18)');
  ctx.translate(0, bob);
  // tail
  ctx.lineCap = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = furD; ctx.beginPath();
  const tw = Math.sin(t * 2.5) * 12;
  ctx.moveTo(30, -30); ctx.bezierCurveTo(110, -20 + tw, 120, -120, 80, -140 - tw); ctx.bezierCurveTo(60, -150, 55, -120, 72, -118); ctx.stroke();
  // legs
  if (sitting) { ell(-30, -18, 30, 20, fur); ell(30, -18, 30, 20, fur); ell(-46, -6, 18, 10, skin); ell(46, -6, 18, 10, skin); }
  else {
    const st = pose === 'sneak' ? Math.sin(t * 6) * 14 : pose === 'fall' ? 20 : 0;
    limb(-20, -70, -30 - st, 0, 16, 13, fur); limb(20, -70, 30 + st, 0, 16, 13, fur);
    ell(-34 - st, -4, 18, 9, skin); ell(34 + st, -4, 18, 9, skin);
  }
  const baseY = sitting ? -30 : -68;
  // body
  ell(0, baseY - 52, 48, 58, fur); ell(0, baseY - 44, 32, 40, skin);
  // arms: hands positions by pose
  const sh = [[-40, baseY - 86], [40, baseY - 86]];
  let hl = [-58, baseY - 30], hr = [58, baseY - 30];
  if (pose === 'sneak') { const r = Math.sin(t * 10) * 6; hl = [-14 + r, baseY - 76]; hr = [14 - r, baseY - 80]; }   // rubbing hands
  if (pose === 'laugh') { hl = [-30, baseY - 48 + Math.sin(t * 12) * 4]; hr = [70, baseY - 140 + Math.sin(t * 12) * 6]; }
  if (pose === 'fall' || mood === 'shock') { hl = [-92, baseY - 160]; hr = [92, baseY - 160]; }
  if (pose === 'dizzy') { hl = [-70, baseY - 20]; hr = [70, baseY - 20]; }
  if (pose === 'sad') { hl = [-20, baseY - 20]; hr = [20, baseY - 20]; }
  if (pose === 'eat' || o.hold === 'mango') { hl = [-16, baseY - 108]; hr = [16, baseY - 108]; }
  if (pose === 'hang') { hl = [-70, baseY + 20]; hr = [64, baseY + 26]; }
  if (pose === 'wave') { hr = [86, baseY - 150 + Math.sin(t * 10) * 10]; }
  if (o.hold === 'hat' && pose !== 'hang') hr = [80, baseY - 120];
  if (o.hands) { if (o.hands.l) hl = o.hands.l; if (o.hands.r) hr = o.hands.r; }
  limb(sh[0][0], sh[0][1], hl[0], hl[1], 14, 11, fur); limb(sh[1][0], sh[1][1], hr[0], hr[1], 14, 11, fur);
  circ(hl[0], hl[1], 12, skin); circ(hr[0], hr[1], 12, skin);
  // head
  const hy = baseY - 150, tilt = pose === 'dizzy' ? Math.sin(t * 3) * .2 : pose === 'sad' ? .12 : pose === 'sneak' ? -.08 : 0;
  ctx.save(); ctx.translate(0, hy); ctx.rotate(tilt);
  circ(-56, -2, 22, fur); circ(56, -2, 22, fur); circ(-56, -2, 13, skin); circ(56, -2, 13, skin);
  circ(0, 0, 56, fur);
  poly([-8, -54, 4, -76, 10, -52], furD); poly([4, -54, 20, -72, 18, -50], furD);   // hair tuft
  ell(-18, -6, 23, 25, skin); ell(18, -6, 23, 25, skin); ell(0, 22, 38, 26, skin);
  // eyes
  const blink = ((t + .6) % 2.9) < .12;
  const eye = (ex) => {
    if (mood === 'dizzy') { ctx.lineWidth = 3.5; ctx.strokeStyle = '#2a1a10'; ctx.beginPath(); for (let a = 0; a < 12; a += .3) ctx.lineTo(ex + Math.cos(a + t * 8) * a * .9, -8 + Math.sin(a + t * 8) * a * .9); ctx.stroke(); return; }
    if (mood === 'love') { heart(ex, -8, .8, '#ff3b6b'); return; }
    if (blink || mood === 'happy' || pose === 'laugh') { ctx.lineWidth = 4; ctx.strokeStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(ex, -4, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); return; }
    const big = mood === 'shock' ? 1.3 : 1;
    ell(ex, -8, 11 * big, 13 * big, '#fff'); circ(ex + (o.gaze || 0) * 4, -6 + (o.lookUp ? -4 : 0), 6.5, '#2a1a10'); circ(ex + 2 + (o.gaze || 0) * 4, -9, 2, '#fff');
    if (mood === 'cheeky') { ctx.fillStyle = skin; ctx.fillRect(ex - 13, -24, 26, 10); line(ex - 12, -14, ex + 12, -15, 3.5, '#5a3a20'); }   // half-lidded sneaky eyes
    if (mood === 'sad') line(ex - 10, -26, ex + 10, -22 + (ex < 0 ? -6 : 6), 4, '#4a2a14');
  };
  eye(-18); eye(18);
  ell(-6, 14, 3.5, 2.5, '#4a2a14'); ell(6, 14, 3.5, 2.5, '#4a2a14');
  // mouth
  if (pose === 'laugh' || mood === 'happy') { ctx.beginPath(); ctx.moveTo(-22, 24); ctx.quadraticCurveTo(0, 56 + (pose === 'laugh' ? Math.abs(Math.sin(t * 12)) * 6 : 0), 22, 24); ctx.closePath(); ctx.fillStyle = '#7a2a2a'; ctx.fill(); rect(-14, 24, 28, 6, '#fff'); }
  else if (mood === 'shock') ell(0, 34, 9, 13, '#5a2020');
  else if (mood === 'sad' || mood === 'dizzy') curve(-16, 38, 0, 26, 16, 38, 4, '#4a2a14');
  else if (pose === 'eat') { const c = Math.abs(Math.sin(t * 12)) * 5; ell(0, 32, 10, 4 + c, '#5a2020'); }
  else { curve(-20, 26, 2, 42, 24, 22, 4, '#4a2a14'); }   // cheeky grin
  if (o.bump) { circ(10, -52, 16, '#d8826a'); circ(6, -56, 5, 'rgba(255,255,255,.4)'); }
  if (o.hat) strawHat(0, -44, .85, .1);
  if (o.straw) for (let i = 0; i < 7; i++) line(-40 + i * 13, -44 - (i % 3) * 6, -30 + i * 13, -70 - (i * 7) % 14, 3, '#e0b040');
  ctx.restore();
  // held items (drawn over hands)
  if (o.hold === 'hat') strawHat(hr[0], hr[1] - 14, .85, .3);
  if (o.hold === 'mango' || pose === 'eat') mango(0, baseY - 118, .9);
  ctx.restore();
  if (o.name) POS_CUR[o.name] = [x, y + (baseY + hy) * s, 56 * s];
}
