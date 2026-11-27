// Thumbnail: Bal Ganesh happily biting Kuber's golden plate, Kuber in shock, coins flying. Big faces, few words.
(() => {
  NOW = 3.3; ctx = mainCtx; ctx.setTransform(1, 0, 0, 1, 0, 0);
  const c = ctx, W = 1920, H = 1080;
  // bright sunburst background (warm gold/orange)
  const g = c.createRadialGradient(700, 560, 50, 700, 560, 1300); g.addColorStop(0, '#bff3ff'); g.addColorStop(.3, '#2fb4f0'); g.addColorStop(1, '#0a1f5c');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.translate(700, 560);
  for (let i = 0; i < 28; i++) { c.rotate(6.2832 / 28); if (i % 2) continue; c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(1800, -110); c.lineTo(1800, 110); c.fill(); }
  c.restore();
  // flying coins
  const coin = (x, y, r, rot) => { c.save(); c.translate(x, y); c.rotate(rot); ell(0, 0, r, r * .8, '#b8860b'); ell(0, -3, r * .9, r * .72, '#ffd84a'); ell(0, -3, r * .55, r * .42, '#f0b81c'); c.restore(); };
  [[1180, 300, 34, .3], [1050, 180, 26, -.5], [1290, 620, 30, .8], [300, 260, 28, .2], [180, 700, 36, -.3], [1080, 820, 24, .5], [420, 140, 22, 1]].forEach(a => coin(...a));
  for (let i = 0; i < 14; i++) sparkle(150 + (i * 397) % 1300, 120 + (i * 251) % 800, 18 + (i % 3) * 8, .9);
  // Kuber (right, shocked, hands on head)
  const halo = (x, y, r) => { const h = c.createRadialGradient(x, y, 0, x, y, r); h.addColorStop(0, 'rgba(255,255,240,.75)'); h.addColorStop(1, 'rgba(255,255,240,0)'); c.fillStyle = h; c.fillRect(x - r, y - r, 2 * r, 2 * r); };
  halo(1560, 740, 520);
  who('Kuber', 1560, 1520, 1.85, { pose: 'shout', dir: -1, mood: 'surprised', gaze: -1, talk: false });
  // Bal Ganesh (left/center, big), biting the plate
  gan(700, 1230, 2.25, { pose: 'sit', dir: 1, mood: 'happy', smileEyes: true, hands: { r: [70, -150] }, talk: false });
  goldPlate(905, 850, 1.25, { bitten: .55 });
  for (let i = 0; i < 5; i++) ell(1010 + i * 22, 760 - i * 30, 9, 6, '#ffd84a');   // crumbs flying from the bite
  // title text
  const big = (txt, x, y, size, fill, rot = 0) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.font = `800 ${size}px Baloo`; c.textAlign = 'center'; c.lineJoin = 'round';
    c.lineWidth = size * .26; c.strokeStyle = '#2a0800'; c.strokeText(txt, 0, 0);
    c.lineWidth = size * .1; c.strokeStyle = '#fff'; c.strokeText(txt, 0, 0);
    c.fillStyle = fill; c.fillText(txt, 0, 0); c.restore();
  };
  big('सोने की थाली', 1430, 200, 150, '#ffe11f', -.04);
  big('खा गए!', 1470, 380, 185, '#ff3b1f', -.04);
  // channel badge
  c.font = '800 52px Baloo'; const txt = 'बालूराम की कहानियाँ', w = c.measureText(txt).width + 60;
  c.fillStyle = '#7a1fa2'; c.beginPath(); c.roundRect(40, 40, w, 86, 43); c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke();
  c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(txt, 70, 102);
})();
