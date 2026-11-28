(() => {
  const c = mainCtx; c.setTransform(1, 0, 0, 1, 0, 0);
  // scared kids, big, on the left (crop of picture p01)
  const im = IMG.p01, s = 2.05; c.drawImage(im, 560 - 600 * s, 640 - 420 * s, im.width * s, im.height * s);
  // the mysterious glowing orchard girl (from p02) in a round "window" on the right
  const g2 = IMG.p02; c.save(); c.beginPath(); c.arc(1560, 640, 330, 0, 7); c.clip();
  const s2 = 2.4; c.drawImage(g2, 1560 - 725 * s2, 640 - 560 * s2, g2.width * s2, g2.height * s2);
  const gl = c.createRadialGradient(1560, 700, 0, 1560, 700, 220); gl.addColorStop(0, 'rgba(255,230,120,.55)'); gl.addColorStop(1, 'rgba(255,230,120,0)'); c.fillStyle = gl; c.fillRect(1200, 300, 720, 720);
  c.restore(); c.lineWidth = 14; c.strokeStyle = '#ff2d2d'; c.beginPath(); c.arc(1560, 640, 330, 0, 7); c.stroke();
  // red arrow from kids to the window
  c.save(); c.fillStyle = '#ff2d2d'; c.strokeStyle = '#fff'; c.lineWidth = 6; c.translate(1110, 700); c.rotate(-.12);
  c.beginPath(); c.moveTo(-90, -22); c.lineTo(40, -22); c.lineTo(40, -55); c.lineTo(115, 0); c.lineTo(40, 55); c.lineTo(40, 22); c.lineTo(-90, 22); c.closePath(); c.stroke(); c.fill(); c.restore();
  // top darkening for text
  const tg = c.createLinearGradient(0, 0, 0, 330); tg.addColorStop(0, 'rgba(0,0,20,.8)'); tg.addColorStop(1, 'rgba(0,0,20,0)'); c.fillStyle = tg; c.fillRect(0, 0, W, 330);
  const big = (txt, x, y, size, fill, rot = 0) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.font = `800 ${size}px Baloo`; c.textAlign = 'center'; c.lineJoin = 'round';
    c.lineWidth = size * .26; c.strokeStyle = '#120018'; c.strokeText(txt, 0, 0);
    c.lineWidth = size * .1; c.strokeStyle = '#fff'; c.strokeText(txt, 0, 0);
    c.fillStyle = fill; c.fillText(txt, 0, 0); c.restore();
  };
  big('आधी रात को…', 1330, 170, 120, '#7fe0ff', -.03);
  big('पायल किसकी?', 1290, 1010, 170, '#ffe11f', -.03);
  // channel badge + episode tag
  c.font = '800 52px Baloo'; const txt = 'बालूराम की कहानियाँ', w = c.measureText(txt).width + 60;
  c.fillStyle = '#7a1fa2'; c.beginPath(); c.roundRect(40, 40, w, 86, 43); c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke();
  c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(txt, 70, 102);
  c.fillStyle = '#ff2d2d'; c.beginPath(); c.roundRect(40, 150, 200, 76, 38); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.fillText('भाग 1', 80, 206);
})();
