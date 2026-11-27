// Custom thumbnail tool: runs a project's own drawing code (characters posed big, close-up) instead of a video frame.
// Usage: node tools/thumb_custom.js <project> <draw.js> <out.jpg>
// draw.js runs inside the project's animation page, so it can use every character and prop function (who, gan, mush, person, ...).
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const [name, drawFile, out] = process.argv.slice(2);
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
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/projects/${name}/animation.html`);
  const s = J('2-script.json');
  await page.evaluate(d => window.setup(d), { timeline: J('6-timeline.json'), storyboard: J('4-storyboard.json'), title: s.title, moral: s.moral });
  await page.evaluate(() => document.fonts.load('800 100px Baloo', 'गणेश'));
  await page.addScriptTag({ content: fs.readFileSync(drawFile, 'utf8') });
  const url = await page.evaluate(() => mainCanvas.toDataURL('image/jpeg', .93));
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  await b.close(); server.close(); console.log('wrote', out);
})();
