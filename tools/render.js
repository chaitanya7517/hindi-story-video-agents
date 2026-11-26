// Render tool: opens projects/<name>/animation.html in a headless browser,
// captures every frame and encodes the MP4 with the voice track.
// Usage: node tools/render.js <project> [--stills] [--fps 30] [--from S --to S]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const name = args[0];
const opt = k => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : null; };
const FPS = Number(opt('--fps') || 30);
const proj = path.join(ROOT, 'projects', name);
const J = f => JSON.parse(fs.readFileSync(path.join(proj, f), 'utf8'));

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exitCode = 1; });
  await page.goto(`http://127.0.0.1:${port}/projects/${name}/animation.html`);
  const script = J('2-script.json');
  const end = await page.evaluate(d => window.setup(d), { timeline: J('6-timeline.json'), storyboard: J('4-storyboard.json'), title: script.title, moral: script.moral });
  const shots = J('6-timeline.json').shots;

  if (args.includes('--stills')) { // one picture from the middle of each shot, for review
    const dir = path.join(proj, 'preview'); fs.mkdirSync(dir, { recursive: true });
    const at = opt('--at');  // e.g. --at 110,112.5 to look at exact moments
    const times = at ? at.split(',').map(x => ['t' + x, Number(x)])
      : shots.map(s => [s.id, (s.start + s.end) / 2]).concat([['title', 2.5], ['end', end - 2.6]]);
    for (const [id, t] of times) {
      const url = await page.evaluate(([t]) => window.frame(t, 0.9), [t]);
      fs.writeFileSync(path.join(dir, `${id}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
      console.log('still', id, t.toFixed(1));
    }
  } else {
    const from = Number(opt('--from') || 0), to = Number(opt('--to') || end);
    const out = path.join(proj, 'output'); fs.mkdirSync(out, { recursive: true });
    const file = path.join(out, opt('--out') || 'draft.mp4');
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-ss', String(from), '-i', path.join(proj, 'audio', 'voice.wav'),
      '-af', 'apad', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round((to - from) * FPS), t0 = Date.now();
    for (let f = 0; f < n; f++) {
      const url = await page.evaluate(([t]) => window.frame(t, 0.93), [from + f / FPS]);
      if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (f % (FPS * 10) === 0) console.log(`frame ${f}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log('wrote', file);
  }
  await browser.close(); server.close();
})();
