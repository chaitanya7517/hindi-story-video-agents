// =====================================================================
//  "गोलू और बंदर" — 1-minute silent cartoon test (engine.js + animals.js)
//  No dialogue: everything is told by action, faces, music and sound effects.
//  One continuous scene; the camera is directed with camAt(T). All times are in seconds.
// =====================================================================
const CONFIG = { storyScenes: [], endExtra: 3 };
const CAST = {};
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
const ANCHOR = [1140, 430];            // where the monkey sits on the branch
// falling mangoes after the head-butt: [x, startY, startTime, restX]
const DROPS = [[860, 330, 31.45, 880], [1030, 380, 31.6, 1030], [600, 420, 31.8, 560], [1140, 60, 31.62, 1290], [760, 300, 31.95, 790]];
function dropPos(d, T) {
  const [x, y0, t0, rx] = d, g = 2400;
  if (T < t0) return null;
  const tt = T - t0;
  if (d === DROPS[3]) {                  // this one bonks the monkey's head at ~32.0 and bounces off to the right
    const hitT = .34; if (tt < hitT) return [x, y0 + .5 * g * tt * tt, tt * 6];
    const u = tt - hitT; const y = 200 - 500 * u + .5 * g * u * u; return [lerp(x, rx, Math.min(1, u / .9)), Math.min(915, y), tt * 8];
  }
  const y = y0 + .5 * g * tt * tt; if (y < 915) return [x, y, tt * 5];
  const tl = Math.sqrt((915 - y0) * 2 / g), u = tt - tl, b = Math.max(0, 220 * u - .5 * g * u * u);   // one small bounce
  return [lerp(x, rx, Math.min(1, u * 3)), 915 - b, tl * 5 + Math.min(u, .3) * 4];
}
function goluState(T) {
  let x = 1240, d = -1, pose = 'eat', mood = 'happy', look = 0, hat = true, mangoIn = false, gaze = 0;
  if (T >= 17) { pose = 'stand'; }
  if (T >= 19.0) hat = false;
  if (T >= 19.2) { look = 1; gaze = 0; }
  if (T >= 22) mood = 'shock';
  if (T >= 23.4) { mood = 'angry'; look = .3; }
  if (inT(T, 24.5, 28)) pose = 'stomp';
  if (inT(T, 28, 29.6)) { pose = 'back'; x = lerp(1240, 1560, ease(seg(T, 28, 29.6))); }
  if (T >= 29.6) x = 1560;
  if (inT(T, 29.6, 30.4)) pose = 'stomp';
  if (inT(T, 30.4, 31.2)) { pose = 'charge'; x = lerp(1560, 862, seg(T, 30.4, 31.2) ** 1.4); }
  if (T >= 31.2) { x = lerp(862, 900, ease(seg(T, 31.2, 31.6))); pose = T < 33 ? 'dazed' : 'stand'; mood = T < 33.5 ? 'shock' : 'happy'; look = T < 33 ? 0 : .4; }
  if (T >= 35) { d = 1; look = 0; }
  if (T >= 36.5) { hat = true; mood = 'smug'; }
  if (T >= 41) { mood = 'sad'; }
  if (T >= 44) { mood = 'happy'; }
  if (inT(T, 44.6, 45.6)) pose = 'eat';
  if (T >= 45.4) mangoIn = true;
  if (inT(T, 45.8, 47.8)) { pose = 'walk'; x = lerp(900, 1140, ease(seg(T, 45.8, 47.8))); }
  if (T >= 47.8) x = 1140;
  if (T >= 48.6) { mangoIn = false; mood = 'love'; }
  if (T >= 50) mood = 'happy';
  if (inT(T, 53, 55.5)) mood = 'laugh';
  if (T >= 55.5) { mood = 'happy'; gaze = 1; }
  if (T >= 57.2) mood = 'shock';
  if (T >= 58.2) mood = 'laugh';
  return { x, d, pose, mood, look, hat, mangoIn, gaze };
}
const hatOnGolu = g => [g.x + g.d * 94, GROUND - 240 + (g.pose === 'eat' ? 130 : 0)];

// ---------------- scene ----------------
const SCENES = {
  1: {
    cam: [960, 540, 1],
    camAt(T) {
      const keys = [[0, [960, 540, 1.0]], [6, [960, 540, 1.0]], [9, [1110, 430, 1.55]], [13, [1110, 430, 1.6]], [15, [1110, 580, 1.3]], [17, [1170, 600, 1.45]],
        [26, [1300, 680, 1.35]], [30, [1150, 580, 1.02]], [34.5, [1150, 600, 1.05]], [37, [1150, 700, 1.4]], [41, [1250, 740, 1.5]],
        [44, [1150, 740, 1.45]], [48, [1250, 730, 1.65]], [53, [1260, 730, 1.7]], [58, [1260, 730, 1.7]], [60, [1240, 680, 1.4]]];
      let k = keys[0][1]; for (const [t, c] of keys) if (T >= t) k = c; return k;
    },
    draw(T) {
      NOW = T;
      const shake = inT(T, 31.2, 31.9) ? 1 - seg(T, 31.2, 31.9) : 0;
      if (shake) ctx.translate(Math.sin(T * 90) * 14 * shake, Math.cos(T * 77) * 10 * shake);
      bg(); basket(420, 940);
      hayPile(1500, GROUND);
      const g = goluState(T);
      // ---- monkey ----
      const M = { t: T, name: 'Bandar' };
      let mx = ANCHOR[0], my = ANCHOR[1], ms = .95, inHay = false;
      if (T < 9) Object.assign(M, { pose: 'sit', mood: T > 5.5 ? 'cheeky' : 'happy', gaze: -.5 });
      else if (T < 17) Object.assign(M, { pose: 'sneak', mood: 'cheeky', gaze: -1, lookUp: false });
      else if (T < 20.6) {      // swing down by the tail, grab the hat, swing back up
        const down = ease(seg(T, 17, 18.2)), up = ease(seg(T, 19.4, 20.6));
        Object.assign(M, { pose: 'hang', mood: T < 19.4 ? 'cheeky' : 'happy', rot: Math.PI * (down - up), noShadow: true, hold: T >= 19.0 ? 'hat' : null });
      }
      else if (T < 31.2) Object.assign(M, { pose: inT(T, 21, 24.5) ? 'laugh' : 'sit', mood: T > 26 ? 'cheeky' : 'happy', hat: true, gaze: -1 });
      else if (T < 32.0) Object.assign(M, { pose: 'sit', mood: 'shock', hat: true, hands: { l: [-70, -150], r: [70, -150] } });
      else if (T < 32.8) Object.assign(M, { pose: 'dizzy', mood: 'dizzy', hat: T < 32.9, bump: true });
      else if (T < 34.2) {      // falls, tumbling, into the hay pile
        const k = seg(T, 32.8, 34.2);
        mx = lerp(ANCHOR[0], 1500, k); my = lerp(ANCHOR[1], 880, k) - 260 * Math.sin(Math.PI * k) * (1 - k);
        Object.assign(M, { pose: 'fall', mood: 'shock', rot: k * Math.PI * 3, noShadow: true, bump: true });
      }
      else if (T < 41.5) { mx = 1500; my = 905; inHay = true; Object.assign(M, { pose: 'dizzy', mood: 'dizzy', bump: true, straw: true, noShadow: true }); }
      else {
        const k = ease(seg(T, 41.5, 42.2)); mx = lerp(1500, 1330, k); my = lerp(905, GROUND, k) - Math.sin(Math.PI * k) * 120; ms = .95;
        Object.assign(M, { pose: 'sad', mood: 'sad', bump: true, gaze: -1 });
        if (T >= 48.6) Object.assign(M, { pose: 'sit', mood: 'love', hold: 'mango' });
        if (T >= 50) Object.assign(M, { pose: 'eat', mood: 'happy', hold: null });
        if (T >= 53) Object.assign(M, { pose: 'laugh', mood: 'happy' });
        if (inT(T, 55.5, 57.6)) {   // sneaky hand reaches for Golu's hat
          const hp = hatOnGolu(g), reach = ease(seg(T, 55.6, 57.0));
          Object.assign(M, { pose: 'sit', mood: 'cheeky', gaze: -1, hands: { l: [lerp(-58, (hp[0] - mx) / ms, reach), lerp(-60, (hp[1] - my) / ms + 8, reach)] } });
        }
        if (T >= 57.6) Object.assign(M, { pose: 'wave', mood: 'happy', hands: null });
        if (T >= 58.4) Object.assign(M, { pose: 'laugh', mood: 'happy' });
      }
      // monkey on/under the branch is drawn before the tree's leaves tip? -> after tree so he's visible
      tree(T, shake);
      // ground mangoes and falling mangoes
      DROPS.forEach((d, i) => { if (i === 1 && T >= 45.4) return; const p = dropPos(d, T); if (p) mango(p[0], p[1], .85, p[2]); });
      const monkeyFront = T >= 42;   // once they sit side by side, the monkey is in front (so his sneaky hand shows)
      if (!monkeyFront) monkey(mx, my, ms, M);
      if (inHay) hayPile(1500, GROUND, 1, true);
      // flying hat
      if (inT(T, 32.9, 36.5)) {
        const k = seg(T, 32.9, 36.5), dest = hatOnGolu({ ...g, x: 900, d: 1, pose: 'stand' });
        strawHat(lerp(ANCHOR[0], dest[0], k), lerp(ANCHOR[1] - 230, dest[1], k) - 420 * Math.sin(Math.PI * k), .9, k * 12.6);
      }
      // Golu
      goat(g.x, GROUND, 1, { t: T, name: 'Golu', dir: g.d, pose: g.pose, mood: g.mood, look: g.look, hat: g.hat, mango: g.mangoIn, gaze: g.gaze });
      if (monkeyFront) monkey(mx, my, ms, M);
      // ---- effects ----
      const gh = [g.x + g.d * 100, GROUND - 230];
      bubble(gh[0] + g.d * 10, gh[1] - 150, '?', inT(T, 19.6, 21.6) ? seg(T, 19.6, 20.2) : 0);
      bubble(gh[0], gh[1] - 150, '!', inT(T, 22, 23.4) ? seg(T, 22, 22.4) : 0);
      steam(gh[0] - g.d * 10, gh[1] - 60, T, inT(T, 23.4, 31.2) ? 1 : 0);
      if (inT(T, 30.4, 31.2)) speedLines(g.x + 60, GROUND - 60, -1, 1);
      dust(g.x + 120, GROUND, seg(T, 30.4, 31.0));
      impact(735, 780, seg(T, 31.2, 31.7));
      dizzyStars(900 - 100, GROUND - 270, T, 55, inT(T, 31.3, 33) ? 1 : 0);
      impact(ANCHOR[0], ANCHOR[1] - 210, seg(T, 31.95, 32.35));
      dizzyStars(ANCHOR[0], ANCHOR[1] - 230, T, 50, inT(T, 32, 32.8) ? 1 : 0);
      dizzyStars(1500, 905 - 230, T, 55, inT(T, 34.2, 41.5) ? 1 : 0);
      dust(1500, GROUND - 40, seg(T, 34.2, 34.9), 9);
      if (inT(T, 36.4, 37.4)) { const k = seg(T, 36.4, 37.4), p = hatOnGolu(g); for (let i = 0; i < 8; i++) { const a = i * .785; sparkle(p[0] + Math.cos(a) * 80 * k, p[1] - 20 + Math.sin(a) * 50 * k, 16 * (1 - k), 1 - k); } }
      if (inT(T, 48.6, 50.5)) { const k = seg(T, 48.6, 50.5); for (let i = 0; i < 4; i++) heart(1230 + i * 40, 600 - k * 160 - i * 25, .9, `rgba(255,70,110,${1 - k})`); }
      bubble(gh[0] - 20, gh[1] - 160, '!', inT(T, 57.2, 58.6) ? seg(T, 57.2, 57.6) : 0);
    },
  },
};

function overlays(T) {
  if (T < 5) { const a = Math.min(seg(T, .8, 1.4), 1 - seg(T, 4, 4.8)); bigText('गोलू और बंदर', 170, a, 140); }
  if (T > 59) { const a = seg(T, 59, 59.8); ctx.fillStyle = `rgba(20,10,0,${.45 * a})`; ctx.fillRect(0, 0, W, H); bigText('फिर मिलेंगे!', 540, a, 150); }
}
