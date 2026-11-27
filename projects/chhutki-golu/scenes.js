// =====================================================================
//  "छुटकी और गोलू" — episode test: the monkey steals the laddoos (silent cartoon, ~40 s)
//  Chhutki's power is her brain: monkeys copy what they see, so she makes him copy her and drop the pot.
//  (The trick comes from the old Indian folk tale of the cap-seller and the monkeys.)
// =====================================================================
const CONFIG = { storyScenes: [], endExtra: 3 };
const CAST = {};
const CHHUTKI = { age: 'child', female: true, skin: '#c98a5e', hair: 'braids', clip: '#e8331c', topStyle: 'frock', top: '#ffb020', bottom: '#ffb020', bottomStyle: 'frock', border: '#e8331c', earrings: true, bindi: true };
let NOW = 0;
const GROUND = 930;
const seg = (T, a, b) => clamp((T - a) / (b - a));          // 0..1 progress between a and b
const inT = (T, a, b) => T >= a && T < b;

// ---------------- background (cached) ----------------
let BGC = null;
function villageBase() {
  rect(0, 0, W, 620, lg(0, 0, 0, 620, [[0, '#6cc4f5'], [1, '#d6f0ff']]));
  light(1650, 170, 300, '255,240,170', .6); circ(1650, 170, 70, '#fff3b0');
  for (const [cx, cy, s] of [[300, 150, 1], [900, 110, .8], [1350, 210, .7]]) { ctx.globalAlpha = .9; for (const [dx, r] of [[-60, 40], [0, 58], [60, 44], [110, 32]]) circ(cx + dx * s, cy, r * s, '#ffffff'); ctx.globalAlpha = 1; }
  ctx.fillStyle = '#9cc98a'; ctx.beginPath(); ctx.moveTo(0, 600); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 520 + Math.sin(x * .005) * 40 + Math.sin(x * .013) * 14); ctx.lineTo(W, 640); ctx.lineTo(0, 640); ctx.fill();
  // far huts
  for (const [x, s] of [[1380, .7], [1520, .6], [1760, .75], [260, .55]]) {
    ctx.save(); ctx.translate(x, 600); ctx.scale(s, s);
    rect(-60, -70, 120, 70, '#e8cfa0'); poly([-78, -70, 78, -70, 0, -132], '#a0522d'); rect(-12, -44, 24, 44, '#5a3420'); ctx.restore();
  }
  rect(0, 600, W, 480, lg(0, 600, 0, 1080, [[0, '#8fcf5f'], [1, '#5fa03a']]));
  // field rows
  for (let i = 0; i < 9; i++) { const y = 640 + i * 18; ctx.globalAlpha = .25; line(0, y, W, y + 6, 3, '#4f8a2a'); } ctx.globalAlpha = 1;
  // path
  poly([1180, 1080, 1480, 1080, 1120, 640, 1060, 640], '#d8bf8a');
  // grass tufts
  const r = rng(5);
  for (let i = 0; i < 70; i++) { const x = r() * W, y = 700 + r() * 380; for (let k = -1; k <= 1; k++) curve(x, y, x + k * 6, y - 14, x + k * 12, y - 22, 3, '#4f9a2c'); }
  // flowers
  for (let i = 0; i < 30; i++) { const x = r() * W, y = 720 + r() * 340; circ(x, y, 6, ['#ffd23f', '#ff6b6b', '#ffffff'][i % 3]); circ(x, y, 2.5, '#f08a1a'); }
}
function bg() {
  if (!BGC) { BGC = document.createElement('canvas'); BGC.width = W; BGC.height = H; const o = ctx; ctx = BGC.getContext('2d'); villageBase(); ctx = o; }
  ctx.drawImage(BGC, 0, 0);
}
function tree(T, shake) {
  const sx = shake ? Math.sin(T * 60) * 8 * shake : 0;
  // trunk + branch
  poly([660, GROUND, 750, GROUND, 735, 380, 680, 380], '#7a4a26'); line(700, 600, 712, 800, 5, '#5e381c');
  ctx.save(); ctx.translate(sx * .3, 0);
  ctx.lineCap = 'round'; ctx.strokeStyle = '#7a4a26'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(715, 500); ctx.quadraticCurveTo(950, 430, 1250, 440); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = '#5e381c'; ctx.beginPath(); ctx.moveTo(760, 480); ctx.quadraticCurveTo(950, 430, 1180, 437); ctx.stroke();
  for (const [x, y, r] of [[1235, 410, 46], [1190, 392, 36], [1270, 425, 30]]) circ(x + sx, y, r, '#3f8f38');
  ctx.restore();
  // crown
  ctx.save(); ctx.translate(sx, 0);
  for (const [cx, cy, r, c] of [[600, 300, 190, '#2f7a2f'], [480, 360, 140, '#368536'], [760, 330, 150, '#368536'], [560, 180, 140, '#3f8f38'], [700, 210, 130, '#3f8f38'], [860, 400, 90, '#3f8f38']]) circ(cx, cy, r, c);
  const rr = rng(4); for (let i = 0; i < 26; i++) { const a = rr() * 6.28, d = rr() * 170; circ(610 + Math.cos(a) * d * 1.2, 290 + Math.sin(a) * d * .8, 9, 'rgba(255,255,255,.08)'); }
  for (const [x, y] of [[520, 300], [640, 380], [720, 250], [470, 420], [800, 400], [590, 200]]) mango(x, y, .8);
  ctx.restore();
}
function basket(x, y) {
  ell(x, y, 80, 14, 'rgba(0,0,0,.18)');
  for (const [dx, dy] of [[-40, -66], [0, -74], [38, -64], [-18, -86], [20, -90]]) mango(x + dx, y + dy, .75, dx * .01);
  ctx.beginPath(); ctx.moveTo(x - 80, y - 60); ctx.lineTo(x + 80, y - 60); ctx.lineTo(x + 60, y); ctx.lineTo(x - 60, y); ctx.closePath(); ctx.fillStyle = '#b07a3a'; ctx.fill();
  for (let i = 0; i < 4; i++) line(x - 76 + i * 3, y - 46 + i * 14, x + 76 - i * 3, y - 46 + i * 14, 3, '#8a5a24');
}

// ---------------- the story, as positions over time ----------------
const ANCHOR = [1140, 430], CS = 1.1;   // monkey's seat on the branch; Chhutki's size
const potInHands = (x) => [x, GROUND - 175 * CS];
function chhutkiState(T) {
  let x = 1080, pose = 'stand', mood = 'happy', walk = false, hands = { l: [-22, -170], r: [22, -170] }, hasPot = true, hat = 'head', gaze = 0, dir = 1;
  if (T < 6.2) { x = lerp(240, 1080, seg(T, 0, 6.2)); walk = T < 6.2; }
  if (T >= 8.0) { hasPot = false; mood = 'surprised'; hands = { l: [-60, -330], r: [60, -330] }; }
  if (T >= 9.6) { mood = 'angry'; hands = { l: [-40, -120], r: [40, -120] }; }
  if (inT(T, 11, 13)) { pose = 'jump'; hands = { l: [-40, -330], r: [40, -330] }; }
  if (inT(T, 13, 17)) { hands = { l: [-48, -110], r: [48, -110] }; }
  if (T >= 14.2 && T < 17) mood = 'worried';
  if (T >= 17) { mood = 'worried'; hands = { l: [-40, -120], r: [14, -268] }; gaze = 1; }   // thinking, hand on chin
  if (T >= 18.8) { mood = 'happy'; }
  if (T >= 20.5) { hands = { l: [-40, -120], r: [40, -120] }; gaze = 0; }
  if (inT(T, 21, 23)) { hat = 'wave'; hands = { l: [-40, -120], r: [56 + Math.sin(T * 9) * 12, -335] }; }
  if (inT(T, 23, 25)) { hat = 'head'; hands = { l: [-30, -330], r: [30, -330] }; }
  if (inT(T, 25, 26)) { hat = 'hand'; hands = { l: [-40, -120], r: [80, -250] }; }
  if (T >= 26) { hat = T < 26.6 ? 'fly' : 'ground'; hands = { l: [-40, -120], r: [80, -150] }; }
  if (T >= 27.6) { mood = 'happy'; hands = { l: [-40, -150], r: [40, -150] }; }
  if (T >= 29.2) { hasPot = true; hands = { l: [-22, -170], r: [22, -170] }; }
  if (inT(T, 30, 32)) pose = 'jump';
  if (inT(T, 32.5, 34.5)) { mood = 'happy'; gaze = 0; }
  if (inT(T, 33.3, 33.8)) hands = { l: [-22, -170], r: [50, -330] };   // tosses a laddoo up
  return { x, pose, mood, walk, hands, hasPot, hat, gaze, dir };
}
function goluState(T) {
  let x = lerp(-40, 820, seg(T, .5, 6.6)), d = 1, pose = T < 6.6 ? 'walk' : 'stand', mood = 'happy', look = 0;
  if (T >= 8.0) mood = 'shock';
  if (T >= 9.6) { mood = 'angry'; d = -1; }
  if (inT(T, 10.5, 12.5)) pose = 'stomp';
  if (inT(T, 12.5, 13.5)) { pose = 'back'; x = lerp(820, 1010, ease(seg(T, 12.5, 13.5))); }
  if (T >= 13.5) x = 1010;
  if (inT(T, 13.5, 14.1)) { pose = 'charge'; x = lerp(1010, 862, seg(T, 13.5, 14.1) ** 1.4); }
  if (T >= 14.1) { x = lerp(862, 900, ease(seg(T, 14.1, 14.5))); pose = T < 16.5 ? 'dazed' : 'stand'; mood = T < 16.5 ? 'shock' : 'sad'; }
  if (T >= 18.8) mood = 'happy';
  if (inT(T, 23.5, 25.5)) { pose = 'walk'; d = 1; x = lerp(900, 1190, ease(seg(T, 23.5, 25.5))); }
  if (T >= 25.5) { x = 1190; d = 1; look = .6; }
  if (T >= 27.6) { mood = 'shock'; look = 0; }
  if (T >= 28.2) mood = 'happy';
  if (inT(T, 30, 32)) pose = 'stomp';
  if (T >= 32) mood = 'happy';
  if (T >= 34.6) mood = 'love';
  return { x, d, pose, mood, look };
}
function monkeyState(T) {
  const M = { t: T, name: 'Bandar' };
  let mx = ANCHOR[0], my = ANCHOR[1];
  if (T < 6.8) Object.assign(M, { pose: T > 4 ? 'sneak' : 'sit', mood: 'cheeky', gaze: -1 });
  else if (T < 9.2) {
    const down = ease(seg(T, 6.8, 7.8)), up = ease(seg(T, 8.2, 9.2));
    Object.assign(M, { pose: 'hang', mood: T < 8 ? 'cheeky' : 'happy', rot: Math.PI * (down - up), noShadow: true, hold: T >= 8.0 ? 'potHang' : null });
  }
  else if (T < 10.5) Object.assign(M, { pose: T > 9.5 ? 'eat' : 'sit', mood: 'happy', hold: T > 9.5 ? null : 'pot' });
  else if (T < 14.1) Object.assign(M, { pose: 'laugh', mood: 'happy', hold: 'pot' });
  else if (T < 15.2) Object.assign(M, { pose: 'sit', mood: 'shock', hold: 'pot', rot: Math.sin(T * 40) * .12 * (1 - seg(T, 14.1, 15.2)) });
  else if (T < 21) Object.assign(M, { pose: 'laugh', mood: 'happy', hold: 'pot' });
  else if (T < 23) Object.assign(M, { pose: 'sit', mood: 'happy', hold: T > 21.5 ? 'potUp' : 'pot' });           // copies: waves the pot
  else if (T < 25) Object.assign(M, { pose: 'sit', mood: 'happy', potHead: T > 23.5, hold: T > 23.5 ? null : 'pot' });   // copies: pot on head
  else if (T < 26.8) Object.assign(M, { pose: 'sit', mood: 'cheeky', hold: 'pot' });
  else if (T < 27.6) Object.assign(M, { pose: 'throw', mood: 'happy' });                                          // copies: throws it!
  else if (T < 29.5) Object.assign(M, { pose: 'sit', mood: 'shock' });
  else if (T < 34.4) Object.assign(M, { pose: 'sad', mood: 'sad' });
  else if (T < 36) Object.assign(M, { pose: 'sit', mood: 'love', hold: 'laddoo' });
  else Object.assign(M, { pose: 'wave', mood: 'happy' });
  return [mx, my, M];
}

const SCENES = {
  1: {
    cam: [960, 560, 1.05],
    camAt(T) {
      const keys = [[0, [900, 560, 1.08]], [4.5, [1020, 560, 1.15]], [6.4, [1110, 540, 1.3]], [9.2, [1120, 430, 1.5]], [10.5, [1050, 580, 1.2]],
        [12.5, [960, 600, 1.12]], [14.1, [940, 580, 1.08]], [17, [1080, 640, 1.6]], [20.8, [1110, 540, 1.12]], [25.8, [1150, 560, 1.05]],
        [28, [1150, 700, 1.4]], [31.5, [1100, 600, 1.2]], [34, [1120, 520, 1.3]], [36.5, [1060, 560, 1.12]]];
      let k = keys[0][1]; for (const [t, c] of keys) if (T >= t) k = c; return k;
    },
    draw(T) {
      NOW = T;
      const shake = inT(T, 14.1, 14.8) ? 1 - seg(T, 14.1, 14.8) : 0;
      if (shake) ctx.translate(Math.sin(T * 90) * 14 * shake, Math.cos(T * 77) * 10 * shake);
      bg(); basket(420, 940);
      const c = chhutkiState(T), g = goluState(T), [mx, my, M] = monkeyState(T);
      tree(T, shake);
      monkey(mx, my, .95, M);
      // the falling pot (monkey drops it at 26.8 -> lands on Golu's back at 27.6)
      if (inT(T, 26.8, 27.6)) { const k = seg(T, 26.8, 27.6); laddooPot(lerp(mx + 40, 1180, k), lerp(my - 100, GROUND - 190, k * k) - Math.sin(Math.PI * k) * 60, 1, k * 6); }
      goat(g.x, GROUND, 1, { t: T, name: 'Golu', dir: g.d, pose: g.pose, mood: g.mood, look: g.look });
      if (inT(T, 27.6, 29.2)) laddooPot(1180, GROUND - 205 + Math.abs(Math.sin((T - 27.6) * 9)) * -20 * (1 - seg(T, 27.6, 28.4)), 1);
      // Chhutki
      person(c.x, GROUND, CS, { name: 'Chhutki', look: CHHUTKI, t: T, walk: c.walk, pose: c.pose, mood: c.mood, hands: c.hands, gaze: c.gaze, seed: 3 });
      const hd = POS_CUR.Chhutki, hand = h => [c.x + h[0] * CS, GROUND + h[1] * CS + (c.pose === 'jump' ? -Math.abs(Math.sin(T * 7 + 3)) * 30 * CS : 0)];
      if (c.hasPot) { const p = hand([0, c.hands.l[1] - 4]); laddooPot(p[0], p[1], 1); }
      if (c.hat === 'head' && hd) strawHat(hd[0], hd[1] - hd[2] * .72, .85, -.05);
      if (c.hat === 'wave' || c.hat === 'hand') { const p = hand(c.hands.r); strawHat(p[0], p[1] - 10, .85, Math.sin(T * 9) * .3); }
      if (c.hat === 'fly') { const k = seg(T, 26, 26.6), p = hand([80, -250]); strawHat(lerp(p[0], 1290, k), lerp(p[1], GROUND - 8, k) - Math.sin(Math.PI * k) * 120, .85, k * 8); }
      if (c.hat === 'ground') strawHat(1290, GROUND - 8, .85, .15);
      // tossed laddoo
      if (inT(T, 33.6, 34.4)) { const k = seg(T, 33.6, 34.4), p = hand([50, -330]); laddoo(lerp(p[0], mx, k), lerp(p[1], my - 120, k) - Math.sin(Math.PI * k) * 160, 1.3); }
      // ---- effects ----
      if (hd) {
        bubble(hd[0] + 20, hd[1] - 150, '!', inT(T, 8.1, 9.4) ? seg(T, 8.1, 8.5) : 0);
        steam(hd[0], hd[1] - 70, T, inT(T, 9.6, 14) ? 1 : 0);
        bulb(hd[0] + 10, hd[1] - 170, inT(T, 18.8, 20.6) ? seg(T, 18.8, 19.3) : 0);
        if (inT(T, 30, 32.5)) for (let i = 0; i < 3; i++) heart(hd[0] - 60 + i * 60, hd[1] - 110 - ((T * 60 + i * 30) % 80), .8, '#ff4f7a');
      }
      const gh = [g.x + g.d * 100, GROUND - 230];
      steam(gh[0], gh[1] - 60, T, inT(T, 9.6, 14.1) ? 1 : 0);
      if (inT(T, 13.5, 14.1)) speedLines(g.x + 60, GROUND - 60, -1, 1);
      impact(735, 780, seg(T, 14.1, 14.6));
      dizzyStars(800, GROUND - 270, T, 55, inT(T, 14.2, 16.5) ? 1 : 0);
      dust(1290, GROUND, seg(T, 26.6, 27.2), 5);
      impact(1180, GROUND - 210, seg(T, 27.6, 28.0));
      bubble(mx + 30, my - 300, '!', inT(T, 27.7, 29.3) ? seg(T, 27.7, 28.1) : 0);
      if (inT(T, 34.4, 36)) { const k = seg(T, 34.4, 36); for (let i = 0; i < 3; i++) heart(mx - 40 + i * 40, my - 260 - k * 120 - i * 20, .8, `rgba(255,70,110,${1 - k})`); }
    },
  },
};

function overlays(T) {
  if (T < 5) { const a = Math.min(seg(T, .6, 1.2), 1 - seg(T, 4, 4.8)); bigText('छुटकी और गोलू', 170, a, 140); }
  if (T > 37) { const a = seg(T, 37, 37.8); ctx.fillStyle = `rgba(20,10,0,${.45 * a})`; ctx.fillRect(0, 0, W, H); bigText('फिर मिलेंगे!', 540, a, 150); }
}
