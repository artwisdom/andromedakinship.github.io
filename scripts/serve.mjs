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
    if(process.env.ANDROMEDA_QA==='1' && path==='/assets/storm-clouds-v2.jpg' && String(req.headers.referer||'').includes('qa=missing-clouds')) { res.writeHead(404).end(); return; }
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
      if (mode === 'scene-debug' || mode === 'missing-clouds') document = document.replace('</head>', `<script>
        const originalContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          const gl = originalContext.call(this, type, ...args);
          if (!gl || !/webgl/.test(type)) return gl;
          const draw = gl.drawArrays.bind(gl), canvas = this; let calls = 0, armed = false, held = null, clock = 0;
          const locations = new Map(), getLocation = gl.getUniformLocation.bind(gl), setFloat = gl.uniform1f.bind(gl), setVector = gl.uniform4fv.bind(gl);
          gl.getUniformLocation = (program,name) => { const location = getLocation(program,name); if(location) locations.set(location,name); return location; };
          gl.uniform1f = (location,value) => { const name = locations.get(location); if(name === 'uTime') { clock = value; if(held) value = held.time; canvas.dataset.sceneTime = value; } if(name === 'uProgress') canvas.dataset.sceneProgress = value; if(name === 'uReveal') canvas.dataset.systemReveal = value; if(name === 'uCloudBlend') canvas.dataset.cloudDetail = value; setFloat(location,value); };
          gl.uniform4fv = (location,value) => { if(locations.get(location)==='uFlash') { if(armed && !held && value[3]>.55) { held={time:clock,flash:[...value]}; peak.textContent='QA: release cloud glow'; } if(held) value=held.flash; canvas.dataset.cloudFlash=JSON.stringify([...value]); } setVector(location,value); };
          const peak = document.createElement('button'); peak.textContent = 'QA: freeze next cloud glow'; peak.type = 'button'; peak.id = 'qa-storm-peak'; peak.setAttribute('aria-pressed','false'); peak.style.cssText = 'position:fixed;top:115px;left:15px;z-index:1000;color:white;background:#11243c;padding:12px;border:1px solid white'; peak.addEventListener('click',() => { armed=!armed; held=null; peak.textContent=armed?'QA: waiting for cloud glow':'QA: freeze next cloud glow'; peak.setAttribute('aria-pressed',String(armed)); }); document.body.append(peak);
          const example=document.createElement('button'); example.textContent='QA: sample cloud glow'; example.style.cssText='position:fixed;top:173px;left:15px;z-index:1000;color:white;background:#11243c;padding:12px;border:1px solid white'; example.addEventListener('click',async()=>{ const {stormFlash,FLASH_INTERVAL_SECONDS}=await import('/assets/galaxy.js'); const time=25*FLASH_INTERVAL_SECONDS+.3; held={time,flash:stormFlash(time)}; armed=true; peak.textContent='QA: release cloud glow'; peak.setAttribute('aria-pressed','true'); }); document.body.append(example);
          const flight=document.createElement('div'); flight.style.cssText='position:fixed;bottom:45px;left:15px;z-index:1000;display:flex;flex-wrap:wrap;gap:4px;max-width:calc(100% - 30px)';
          for(const [label,progress] of [['Galaxy',.55],['Dive',.72],['Distant world',.825],['Approach',.9],['Orbit',1]]) { const button=document.createElement('button'); button.textContent='QA flight: '+label; button.style.cssText='color:white;background:#11243c;border:1px solid white;padding:8px'; button.addEventListener('click',()=>window.scrollTo({top:progress*(document.getElementById('introduction').offsetTop-window.innerHeight*1.15),behavior:'instant'})); flight.append(button); } document.body.append(flight);
          gl.drawArrays = (...values) => { draw(...values); calls++; canvas.dataset.drawCalls = calls; canvas.dataset.glError = gl.getError(); canvas.dataset.tabHidden = document.hidden;
            if (calls % 2 === 0 && calls < 5) { const p = new Uint8Array(4); gl.readPixels(Math.floor(canvas.width*.775),Math.floor(canvas.height*.54),1,1,gl.RGBA,gl.UNSIGNED_BYTE,p); canvas.dataset.sample = Array.from(p).join(','); }
          };
          return gl;
        };
      </script></head>`);
      if (mode === 'reduced-motion') document = document.replace('</head>', '<style>html{scroll-behavior:auto!important}*,*::before,*::after{transition:none!important;animation:none!important}</style><script>const nativeMatchMedia = window.matchMedia.bind(window); window.matchMedia = query => { const result = nativeMatchMedia(query); if (query.includes("prefers-reduced-motion")) Object.defineProperty(result, "matches", { value:true }); return result; };</script></head>');
      content = Buffer.from(document);
    }
    if (process.env.ANDROMEDA_QA === '1' && extname(file) === '.html' && requestURL.searchParams.get('qa') === 'accessibility') {
      content = Buffer.from(content.toString().replace('</body>', `<script src="/node_modules/axe-core/axe.min.js"></script><script>
        window.addEventListener('load', () => {
          const button = document.createElement('button'); button.id = 'qa-audit-run'; button.textContent = 'Run local accessibility audit'; button.style.cssText = 'position:fixed;bottom:60px;right:15px;z-index:1000;color:white;background:#11243c;padding:12px;border:1px solid white'; document.body.append(button);
          const output = document.createElement('script'); output.type = 'application/json'; output.id = 'qa-audit-result'; document.body.append(output);
          const run = async () => { button.disabled = true; output.textContent = 'running';
            try { const r = await axe.run(document, { runOnly: { type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] } }); output.textContent = JSON.stringify({version:r.testEngine.version,violations:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),passes:r.passes.length}); } catch(e) { output.textContent = JSON.stringify({error:e.message}); } button.disabled = false;
          }; button.addEventListener('click',run); run();
        });
      </script></body>`));
    }
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Andromeda preview: http://127.0.0.1:${port}`));
