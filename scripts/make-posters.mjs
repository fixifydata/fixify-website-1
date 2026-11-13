// Renders one still (with the explanatory labels baked in) of each 3D scene to assets/scenes/<id>.webp.
// Those stills are what visitors see first, and what people with reduced motion or no WebGL keep seeing.
// Usage (from the scripts/ folder):  BROWSER="C:/Program Files/Google/Chrome/Application/chrome.exe" npm run posters
// Optional: pass scene ids as arguments (analytics app ecommerce server-side consent ad-platforms reporting).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SVC = { analytics: 'analytics-and-tags', app: 'app-tracking', ecommerce: 'ecommerce-tracking', 'server-side': 'server-side-tracking', consent: 'consent-and-privacy', 'ad-platforms': 'ad-platforms', reporting: 'data-and-reporting' };
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SVC);
const BROWSER = process.env.BROWSER;
if (!BROWSER) { console.error('Set BROWSER to the path of Chrome or Edge.'); process.exit(1); }
const T = 2.4, W = 1200, H = 800;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon' };

// tiny static server with clean URLs
const server = http.createServer((q, s) => {
  let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  else if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!fs.existsSync(f)) { s.statusCode = 404; return s.end(); }
  s.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); s.end(fs.readFileSync(f));
}).listen(4173);

// Start the browser ourselves (software WebGL is fine), then connect to it.
const port = 9444, profile = fs.mkdtempSync(path.join(ROOT, '.poster-profile-'));
const proc = spawn(BROWSER, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 4000));
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}` });

for (const id of ids) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000 });
  await page.goto(`http://localhost:4173/services/${SVC[id]}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.setItem('fixify_consent_v1', '{"analytics":false,"ts":1}'));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const data = await page.evaluate(async (id, T, W, H) => {
    const el = document.querySelector('.hero-visual3d'); el.style.width = W + 'px'; el.style.height = H + 'px'; el.style.maxWidth = 'none';
    const m = await import('/assets/js/scene3d.js'); const s = m.mount(el, id); await s.ready; await new Promise(r => setTimeout(r, 800));
    s.renderAt(T);
    const out = document.createElement('canvas'); out.width = W; out.height = H; const x = out.getContext('2d');
    x.drawImage(el.querySelector('canvas'), 0, 0, W, H);
    const S = 2; // posters display at about half size, so labels are drawn at 2x
    for (const L of s.stage.labels) {
      const mt = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(L.el.style.transform); if (!mt) continue;
      const px = parseFloat(mt[1]), py = parseFloat(mt[2]);
      const num = L.el.querySelector('span'), txt = L.el.textContent.replace(num ? num.textContent : '', '');
      x.font = '600 ' + 13 * S + 'px "Instrument Sans", system-ui, sans-serif';
      const tw = x.measureText(txt).width, pad = 11 * S, w = tw + pad * 2 + (num ? 20 * S : 0), h = 29 * S, X = px - w / 2, Y = py - h;
      const bad = L.el.classList.contains('bad'), good = L.el.classList.contains('good');
      x.fillStyle = 'rgba(7,18,51,.82)'; x.strokeStyle = bad ? 'rgba(255,90,95,.9)' : good ? 'rgba(25,195,125,.9)' : 'rgba(255,255,255,.3)'; x.lineWidth = 1.5 * S;
      x.beginPath(); x.roundRect(X, Y, w, h, h / 2); x.fill(); x.stroke();
      let tx = X + pad;
      if (num) { x.fillStyle = '#ffc21a'; x.beginPath(); x.arc(X + 15 * S, Y + h / 2, 9 * S, 0, 7); x.fill(); x.fillStyle = '#0a1a47'; x.font = '700 ' + 11 * S + 'px "Instrument Sans", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(num.textContent, X + 15 * S, Y + h / 2 + 0.5 * S); tx = X + 31 * S; }
      x.textAlign = 'left'; x.textBaseline = 'middle'; x.font = '600 ' + 13 * S + 'px "Instrument Sans", system-ui, sans-serif'; x.fillStyle = bad ? '#ffb3b5' : good ? '#9af0cb' : '#fff'; x.fillText(txt, tx, Y + h / 2 + 0.5 * S);
    }
    return out.toDataURL('image/png');
  }, id, T, W, H);
  const dest = path.join(ROOT, 'assets/scenes', id + '.webp');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(Buffer.from(data.split(',')[1], 'base64')).webp({ quality: 82, alphaQuality: 90 }).toFile(dest);
  await sharp(dest).resize(700).webp({ quality: 80, alphaQuality: 90 }).toFile(dest.replace('.webp', '-700.webp')); // phone-size variant
  console.log('wrote', path.relative(ROOT, dest), fs.statSync(dest).size, 'bytes');
  await page.close();
}
await browser.disconnect(); proc.kill(); server.close(); fs.rmSync(profile, { recursive: true, force: true });
