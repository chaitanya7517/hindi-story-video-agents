// Thumbnail tool: draws a clean story frame (no subtitles) at time T, then big Hindi title text.
// Usage: node tools/thumbnail.js <project> <T> <out.jpg> ["line1"] ["line2"] ["badge"]
// Without text it just saves the clean frame (to pick a background).
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const [name, T, out, l1, l2, badge] = process.argv.slice(2);
const proj = path.join(ROOT, 'projects', name);
const J = f => JSON.parse(fs.readFileSync(path.join(proj, f), 'utf8'));
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(p).pipe(res);
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/projects/${name}/animation.html`);
  const s = J('2-script.json');
  await page.evaluate(d => window.setup(d), { timeline: J('6-timeline.json'), storyboard: J('4-storyboard.json'), title: s.title, moral: s.moral });
  const url = await page.evaluate(async ([t, l1, l2, badge]) => {
    window.subtitle = () => {}; window.overlays = null;
    await document.fonts.load('800 100px Baloo', 'गणेश');
    window.drawFrame(t);
    const c = mainCanvas.getContext('2d');
    if (l1) {
      const g = c.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.45, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
      const big = (txt, y, size, fill) => {
        c.font = `800 ${size}px Baloo`; c.textAlign = 'center'; c.lineJoin = 'round';
        c.lineWidth = size * .2; c.strokeStyle = '#3a1200'; c.strokeText(txt, 960, y);
        c.fillStyle = fill; c.fillText(txt, 960, y);
      };
      if (l2) big(l1, 215, 190, '#ffd21f'); else big(l1, 185, 165, '#ffd21f');
      if (l2) big(l2, 410, 170, '#ffffff');
      if (badge) {
        c.font = '800 70px Baloo'; const w = c.measureText(badge).width + 80;
        c.fillStyle = '#e8401c'; c.beginPath(); c.roundRect(960 - w / 2, 925, w, 115, 58); c.fill();
        c.lineWidth = 8; c.strokeStyle = '#fff'; c.stroke();
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(badge, 960, 1005);
      }
    }
    return mainCanvas.toDataURL('image/jpeg', .92);
  }, [Number(T), l1, l2, badge]);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  await b.close(); server.close();
})();
