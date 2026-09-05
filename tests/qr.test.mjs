import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import jsQR from 'jsqr';
import { createAppQR, setAppFlipped, enableAppFlips } from '../assets/qr.js';
import { renderApp } from '../assets/catalog.js';

const snapshot = JSON.parse(await readFile(new URL('../data/apps.json', import.meta.url)));

// Rasterize the actual SVG path, not the encoder's matrix, for an independent decoder.
function scanSVG(svg) {
  const size = Number(svg.match(/viewBox="0 0 (\d+) \d+"/)[1]);
  const scale = 4;
  const width = size * scale;
  const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
  const path = svg.match(/<path d="([^"]+)" fill="#000"/)[1];
  const points = [...path.matchAll(/M(\d+),(\d+)h1v1h-1z/g)];
  assert.ok(points.length > 100);
  for (const [, column, row] of points) {
    const x = Number(column), y = Number(row);
    assert.ok(x >= 4 && y >= 4 && x < size - 4 && y < size - 4, 'Four-module quiet zone');
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const offset = ((y * scale + dy) * width + x * scale + dx) * 4;
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 0;
    }
  }
  return jsQR(pixels, width, width, { inversionAttempts: 'dontInvert' });
}

for (const app of snapshot.apps) {
  test(`QR independently decodes to the exact App Store listing: ${app.name}`, () => {
    const svg = createAppQR(app.url, app.name);
    assert.equal(scanSVG(svg)?.data, app.url);
    assert.match(svg, /role="img" aria-label="QR code for /);
    assert.match(svg, /fill="#fff"/);
    assert.doesNotMatch(svg, /<image|<script|<foreignObject/);
  });
}

test('fresh apps can generate QR codes without a new deployment', () => {
  const url = 'https://apps.apple.com/us/app/new-app/id1234567890?uo=4';
  assert.equal(scanSVG(createAppQR(url, 'A new app'))?.data, url);
});
test('QR destinations reject unsafe, lookalike, or excessive URLs', () => {
  for (const url of ['javascript:alert(1)', 'https://apps.apple.com.evil.test/id1', 'http://apps.apple.com/id1', 'https://secret@apps.apple.com/id1', 'https://example.com/', `https://apps.apple.com/${'a'.repeat(2100)}`]) {
    assert.throws(() => createAppQR(url, 'App'));
  }
});
test('QR labels treat app names as text', () => {
  const svg = createAppQR(snapshot.apps[0].url, '<img onerror="bad">');
  assert.match(svg, /&lt;img onerror=&quot;bad&quot;&gt;/);
  assert.doesNotMatch(svg, /<img|<script/);
});
test('each card has separate navigation and flip controls, with a safely hidden back', () => {
  for (const app of snapshot.apps) {
    const card = renderApp(app, 0);
    assert.match(card, new RegExp(`aria-controls="app-qr-${app.id}" aria-expanded="false"`));
    assert.match(card, new RegExp(`id="app-qr-${app.id}" aria-hidden="true" inert`));
    assert.equal((card.match(/type="button"/g) || []).length, 2);
    for (const [, anchor] of card.matchAll(/<a\b[^>]*>([^]*?)<\/a>/g)) assert.doesNotMatch(anchor, /<button/);
    assert.match(card, /Open App Store/);
  }
  assert.throws(() => renderApp({ ...snapshot.apps[0], id: '"><script>' }, 0));
});

function mockCard() {
  const events = [];
  const node = name => ({
    inert: name === 'back',
    setAttribute: (key, value) => events.push([name, key, value]),
    removeAttribute: key => events.push([name, 'remove', key]),
    focus: options => events.push([name, 'focus', options])
  });
  const front = node('front'), back = node('back'), show = node('show'), hide = node('hide');
  let qrContent = '', renders = 0;
  const target = { get firstElementChild() { return qrContent ? {} : null; }, set innerHTML(value) { qrContent = value; renders++; } };
  const elements = { '.app-front': front, '.app-back': back, '[data-show-qr]': show, '[data-hide-qr]': hide, '[data-qr-image]': target, '.app-primary-link': { href: snapshot.apps[0].url }, h3: { textContent: snapshot.apps[0].name } };
  const card = { querySelector: selector => elements[selector], classList: { toggle: (name, value) => events.push(['card', name, value]) } };
  return { card, front, back, events, renders: () => renders };
}
test('flip transfers focus before hiding the old face and generates a QR only once', () => {
  const { card, front, back, events, renders } = mockCard();
  setAppFlipped(card, true);
  assert.equal(front.inert, true); assert.equal(back.inert, false);
  assert.ok(events.findIndex(e => e[0] === 'hide' && e[1] === 'focus') < events.findIndex(e => e[0] === 'front' && e[1] === 'aria-hidden'));
  assert.ok(events.some(e => e[0] === 'show' && e[1] === 'aria-expanded' && e[2] === 'true'));
  setAppFlipped(card, false);
  assert.equal(front.inert, false); assert.equal(back.inert, true);
  assert.ok(events.some(e => e[0] === 'show' && e[1] === 'focus'));
  setAppFlipped(card, true);
  assert.equal(renders(), 1);
});
test('delegated controls survive replacing cards; Escape returns to the front', () => {
  const listeners = {};
  let interactions = 0;
  enableAppFlips({ addEventListener: (event, handler) => { listeners[event] = handler; }, contains: () => true }, () => interactions++);
  const { card, front } = mockCard();
  const button = { closest: () => card, hasAttribute: () => true };
  listeners.click({ target: { closest: () => button } });
  assert.equal(front.inert, true); assert.equal(interactions, 1);
  let prevented = false;
  listeners.keydown({ key: 'Escape', target: { closest: () => card }, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true); assert.equal(front.inert, false);
});
test('no-JavaScript and motion preferences retain usable card faces', async () => {
  const css = await readFile(new URL('../assets/site.css', import.meta.url), 'utf8');
  assert.match(css, /\.app-flip-button \{ display: none/);
  assert.match(css, /\.app-back \{ display: none/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.app-card-inner \{ transition: none/);
  assert.match(css, /\.motion-paused \.app-card-inner \{ transition: none/);
  assert.match(css, /\.app-qr-image \{ forced-color-adjust: none/);
});
test('favicon reuses the exact supplied logo symbol, with small raster fallbacks and cache-busted links', async () => {
  const read = file => readFile(new URL(`../${file}`, import.meta.url));
  const logo = (await read('assets/brand/andromeda-kinship.svg')).toString();
  const symbol = logo.match(/<svg[^>]*id="5555_1"[^>]*>([^]*?)<\/svg>/)[1];
  const favicon = (await read('favicon.svg')).toString();
  assert.ok(favicon.includes(symbol));
  assert.match(favicon, /viewBox="0 0 64 64"/);
  const png = await read('assets/brand/favicon-32.png');
  assert.equal(png.readUInt32BE(16), 32); assert.equal(png.readUInt32BE(20), 32);
  const touch = await read('apple-touch-icon.png');
  assert.equal(touch.readUInt32BE(16), 180); assert.equal(touch.readUInt32BE(20), 180);
  const ico = await read('favicon.ico');
  assert.equal(ico.readUInt16LE(2), 1); assert.equal(ico.readUInt16LE(4), 3);
  assert.deepEqual([ico[6], ico[22], ico[38]], [16, 32, 48]);
  assert.ok(ico.length < 10000);
  const html = (await read('index.html')).toString();
  assert.match(html, /href="\/favicon\.svg\?v=[0-9a-f]{12}"/);
  assert.match(html, /href="\/favicon\.ico\?v=[0-9a-f]{12}"/);
});
