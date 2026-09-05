import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.xml': 'application/xml' };
const port = Number(process.env.ANDROMEDA_PORT || 4173);
createServer(async (req, res) => {
  try {
    const requestURL = new URL(req.url, 'http://localhost');
    const path = decodeURIComponent(requestURL.pathname);
    if (path.split('/').some(part => part.startsWith('.'))) { res.writeHead(403).end(); return; }
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(`${root}${sep}`)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    let content = await readFile(file);
    // Explicit localhost-only QA fixtures. These transformations are never built
    // into index.html and do not exist on the static production host.
    if (process.env.ANDROMEDA_QA === '1' && file === resolve(root, 'index.html')) {
      const mode = requestURL.searchParams.get('qa');
      let document = content.toString();
      if (mode === 'no-js') document = document.replace(/<script type="module"[^>]*><\/script>/g, '');
      if (mode === 'no-webgl') document = document.replace('</head>', '<script>const nativeContext = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return /webgl/.test(type) ? null : nativeContext.call(this, type, ...args); };</script></head>');
      if (mode === 'offline-apps') document = document.replace('</head>', '<script>const nativeFetch = window.fetch.bind(window); window.fetch = (...args) => String(args[0]).includes("itunes.apple.com") ? Promise.reject(new Error("Simulated App Store outage")) : nativeFetch(...args);</script></head>');
      if (mode === 'reduced-motion') document = document.replace('</head>', '<style>html{scroll-behavior:auto!important}*,*::before,*::after{transition:none!important;animation:none!important}</style><script>const nativeMatchMedia = window.matchMedia.bind(window); window.matchMedia = query => { const result = nativeMatchMedia(query); if (query.includes("prefers-reduced-motion")) Object.defineProperty(result, "matches", { value:true }); return result; };</script></head>');
      content = Buffer.from(document);
    }
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Andromeda preview: http://127.0.0.1:${port}`));
