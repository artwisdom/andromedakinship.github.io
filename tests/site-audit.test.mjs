import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { renderSupportPages, supportPath } from '../scripts/support.mjs';
import { partitionProjects } from '../assets/catalog.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFile(resolve(root,path),'utf8');
const snapshot = JSON.parse(await read('data/apps.json'));
const resources = JSON.parse(await read('data/app-support.json'));
const groups = partitionProjects(JSON.parse(await read('data/projects.json')).projects);
const hub = await read('support.html');

test('Purchase AppFactory is available at the top and leads to the existing sale section', async () => {
  const html=await read('index.html');
  for(const section of [html.match(/<header\b[^]*?<\/header>/)[0],html.match(/<section class="hero"[^]*?<\/section>/)[0]]) {
    assert.match(section,/<a[^>]*href="#appfactory"[^>]*>Purchase AppFactory /);
  }
  assert.match(html,/<section[^>]*id="appfactory"/);
  assert.match(html,/mailto:info@andromedakinship.com\?subject=AppFactory%20Acquisition%20Inquiry/);
});

test('support directory includes every saved app, with companion sites separated from products', () => {
  assert.equal((hub.match(/class="support-entry"/g)||[]).length,snapshot.apps.length);
  for (const app of snapshot.apps) assert.ok(hub.includes(`id="app-${app.id}"`));
  for (const p of groups['app-support']) assert.ok(hub.includes(p.url));
  assert.match(hub,/not to this portfolio website/);
  assert.doesNotMatch(hub,/Our apps store your data on your device/);
});

test('four previously missing App Store support endpoints now identify the right app', async () => {
  const repairs = resources.entries.filter(e=>e.repairSupport); assert.equal(repairs.length,4);
  for (const entry of repairs) {
    const html = await read(entry.support.slice(1)), app = snapshot.apps.find(a=>a.id===entry.appId);
    assert.ok(html.includes(app.name)); assert.ok(html.includes(entry.privacy)); assert.ok(html.includes(entry.terms));
    assert.ok(html.includes(`https://andromedakinship.com${entry.support}`));
    assert.match(html,/mailto:support@andromedakinship.com\?subject=/);
  }
});

test('support output validates local paths and escapes text before rendering', () => {
  for (const bad of ['//evil.test/x.html','/../secret.html','/legal/%2e%2e/key.html','javascript:bad','/legal/privacy.html" onmouseover="bad','/private/key.txt']) assert.throws(()=>supportPath(bad));
  const malicious = {...snapshot,apps:snapshot.apps.map((a,i)=>i? a : {...a,name:'<script>bad</script>'})};
  const pages = renderSupportPages(malicious,resources,groups['app-support'],'0123456789ab');
  assert.ok(pages.get('support.html').includes('&lt;script&gt;bad&lt;/script&gt;'));
  assert.ok(!pages.get('support.html').includes('<script>bad</script>'));
  assert.throws(()=>renderSupportPages(snapshot,{entries:[{appId:-1}]},[],'0123456789ab'));
  assert.throws(()=>renderSupportPages(snapshot,{entries:[resources.entries[0],resources.entries[0]]},[],'0123456789ab'));
});

async function htmlFiles(dir='') {
  const output=[];
  for (const item of await readdir(resolve(root,dir),{withFileTypes:true})) {
    if (item.name.startsWith('.') || ['node_modules','artifacts','src','tests','docs','scripts'].includes(item.name)) continue;
    const path=[dir,item.name].filter(Boolean).join('/');
    if (item.isDirectory()) output.push(...await htmlFiles(path)); else if (item.name.endsWith('.html')&&!item.name.startsWith('google')) output.push(path);
  }
  return output;
}

test('all published local HTML links and assets resolve, including legacy app documents', async () => {
  let checked=0;
  for (const path of await htmlFiles()) {
    const html=await read(path);
    for (const [,attribute] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:mailto:|data:|tel:)/.test(attribute)) continue;
      const url=new URL(attribute.replace(/&amp;/g,'&'),`https://andromedakinship.com/${path}`);
      if (url.origin!=='https://andromedakinship.com') continue;
      const target=decodeURIComponent(url.pathname).replace(/^\//,'');
      let found=false;
      // GitHub Pages supports the existing extensionless app-policy addresses.
      for (const candidate of [target,`${target}.html`]) { try { const info=await stat(resolve(root,candidate)); if (info.isDirectory()) await stat(resolve(root,candidate,'index.html')); found=true; break; } catch {} }
      assert.ok(found,`${path} links to missing ${url.pathname}`); checked++;
    }
  }
  assert.ok(checked>180);
});

test('homepage does not label SellCraft policies as the portfolio privacy or terms', async () => {
  const html=await read('index.html');
  assert.doesNotMatch(html,/<a href="\/legal\/(?:privacy-policy|terms-of-service)\.html">(?:Privacy|Terms)<\/a>/);
  assert.match(html,/<a href="\/support.html">App support &amp; policies<\/a>/);
});

test('rendering budgets remain bounded and no remote 3D library or tracker is added', async () => {
  const galaxy=await read('assets/galaxy.js');
  assert.match(galaxy,/Math.sqrt\(1600000 \/ \(width \* height\)\)/);
  assert.match(galaxy,/now - lastDraw >= 31/);
  assert.doesNotMatch(galaxy,/https?:|addEventListener\(['"]wheel/);
  const bundle=await read('assets/site.bundle.js'); assert.ok(Buffer.byteLength(bundle)<95000);
});

test('cloud artwork is a bounded local image included in release cache invalidation', async () => {
  const data=await readFile(resolve(root,'assets/storm-clouds-v2.jpg'));
  assert.equal(data.readUInt16BE(0),0xffd8); assert.ok(data.length<600000);
  let dimensions;
  for(let offset=2;offset<data.length-9;) {
    assert.equal(data[offset],0xff); const marker=data[offset+1],size=data.readUInt16BE(offset+2);
    if(marker===0xc0||marker===0xc2) { dimensions=[data.readUInt16BE(offset+7),data.readUInt16BE(offset+5)]; break; }
    if(marker===0xda) break; offset+=size+2;
  }
  assert.deepEqual(dimensions,[1254,1254]);
  assert.match(await read('scripts/build.mjs'),/update\(cloudAsset\)/);
  assert.match(await read('assets/galaxy.js'),/STORM_TEXTURE_URL\+new URL\(import.meta.url\).search/);
});

test('all 42 policy titles, wording, dates, and body links match the pre-audit baseline', async () => {
  const baseline=JSON.parse(await read('tests/policy-integrity.json'));
  assert.equal(Object.keys(baseline).length,42);
  for (const [path,expected] of Object.entries(baseline)) {
    const html=await read(path),body=html.match(/<body[^>]*>([^]*?)<\/body>/i)[1];
    const semantic={title:html.match(/<title[^>]*>([^]*?)<\/title>/i)[1],text:body.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(),links:[...body.matchAll(/href="([^"]+)"/g)].map(m=>m[1])};
    assert.equal(createHash('sha256').update(JSON.stringify(semantic)).digest('hex'),expected,`${path}: policy content changed; requires explicit review`);
    assert.equal((html.match(/<main\b/g)||[]).length,1); assert.match(html,/assets\/document\.css\?v=/);
  }
});

test('all local structured-data blocks parse without errors', async () => {
  for (const path of await htmlFiles()) {
    const html=await read(path);
    for (const [,source] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/g)) assert.doesNotThrow(()=>JSON.parse(source),path);
  }
});

test('headings across the published pages do not skip a level', async () => {
  for (const path of await htmlFiles()) {
    const html=await read(path); let previous=0;
    for (const [,number] of html.matchAll(/<h([1-6])\b/g)) {const level=Number(number); assert.ok(level<=previous+1,`${path}: h${previous} to h${level}`); previous=level;}
  }
});
