import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stat } from 'node:fs/promises';
import { escapeHTML, safeURL, normalizeApps, sortApps, filterRecords, renderApp, renderProject, DEVELOPER_ID } from '../assets/catalog.js';

const snapshot = JSON.parse(await readFile(new URL('../data/apps.json', import.meta.url)));
const projects = JSON.parse(await readFile(new URL('../data/projects.json', import.meta.url))).projects;
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const live = { wrapperType: 'software', artistId: DEVELOPER_ID, trackId: 123, trackName: 'New App', primaryGenreName: 'Business', trackViewUrl: 'https://apps.apple.com/us/app/test/id123', artworkUrl512: 'https://is1-ssl.mzstatic.com/test.jpg', userRatingCount: 7, averageUserRating: 4.5, releaseDate: '2026-09-01T12:00:00Z', currentVersionReleaseDate: '2026-09-02T12:00:00Z', description: 'A useful new app.\nMore copy.' };

test('HTML escaping treats markup as text', () => assert.equal(escapeHTML('<img src="x" onerror=\'bad\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt;&amp;'));
test('external URLs must be HTTPS and may not include credentials', () => {
  for (const bad of ['javascript:alert(1)', 'data:text/html,bad', 'http://example.com', 'https://secret@example.com', '/relative']) assert.equal(safeURL(bad), '');
  assert.equal(safeURL('https://example.com/'), 'https://example.com/');
});
test('Apple host allowlisting excludes lookalike hosts', () => {
  assert.equal(safeURL('https://apps.apple.com.bad.test/id123', ['apps.apple.com']), '');
  assert.equal(safeURL('https://badmzstatic.com/a.jpg', ['mzstatic.com']), '');
  assert.ok(safeURL('https://is1-ssl.mzstatic.com/a.jpg', ['mzstatic.com']));
});
test('normalization includes only this developer and validates official destinations', () => {
  const result = normalizeApps({ results: [live, { ...live, trackId: 124, artistId: 99 }, { ...live, trackId: 125, trackViewUrl: 'https://evil.test' }, { ...live, trackId: 126, artworkUrl512: 'javascript:bad' }] });
  assert.equal(result.length, 1); assert.equal(result[0].name, 'New App'); assert.equal(result[0].released, '2026-09-01');
});
test('normalization deduplicates and preserves edited descriptions', () => {
  const result = normalizeApps({ results: [live, live] }, [{ id: 123, description: 'Editorial summary.' }]);
  assert.equal(result.length, 1); assert.equal(result[0].description, 'Editorial summary.');
});
test('invalid or empty App Store responses fail closed', () => {
  for (const response of [null, {}, { results: [] }, { results: [{ ...live, artistId: 2 }] }]) assert.throws(() => normalizeApps(response));
});
test('ratings are finite and clamped to the rating scale', () => {
  const [app] = normalizeApps({ results: [{ ...live, userRatingCount: -2, averageUserRating: 9 }] });
  assert.equal(app.count, 0); assert.equal(app.rating, 5);
  const [invalid] = normalizeApps({ results: [{ ...live, userRatingCount: Infinity, averageUserRating: Infinity }] });
  assert.equal(invalid.count, 0); assert.equal(invalid.rating, 0);
});
test('popularity sorts by rating count, not star average, without mutating input', () => {
  const input = [{ id: 1, name: 'A', count: 2, rating: 5 }, { id: 2, name: 'B', count: 12, rating: 3 }];
  assert.deepEqual(sortApps(input).map(a => a.id), [2, 1]); assert.equal(input[0].id, 1);
});
test('equal rating counts use original release date, not update date', () => {
  const input = [{ name: 'Older', count: 0, released: '2026-06-01', updated: '2026-09-04' }, { name: 'Newer', count: 0, released: '2026-09-02', updated: '2026-09-02' }];
  assert.equal(sortApps(input)[0].name, 'Newer'); assert.equal(sortApps(input, 'newest')[0].name, 'Newer');
});
test('highest-rated sort leaves unrated apps at the end', () => {
  const input = [{ name: 'Unrated', count: 0, rating: 5 }, { name: 'Rated', count: 2, rating: 3 }];
  assert.equal(sortApps(input, 'rating')[0].name, 'Rated');
});
test('search is case-insensitive and combines category and query', () => {
  assert.equal(filterRecords(projects, 'FUNDER').length, 1);
  assert.equal(filterRecords(projects, 'funder', 'Tools').length, 0);
  assert.ok(filterRecords(projects, '', 'Data').length > 4);
});
test('unrated cards do not manufacture scores', () => {
  const app = snapshot.apps.find(a => a.count === 0);
  const card = renderApp(app, 0); assert.match(card, /Not yet rated/); assert.doesNotMatch(card, /app-rating|out of 5/);
});
test('card content is escaped, with lazy icons and explicit external-link context', () => {
  const card = renderApp({ ...snapshot.apps[0], name: '<script>alert(1)</script>' }, 0);
  assert.match(card, /&lt;script&gt;/); assert.doesNotMatch(card, /<script>/); assert.match(card, /loading="lazy"/); assert.match(card, /noopener noreferrer/);
});
test('all 25 public apps are in the static HTML before JavaScript', () => {
  assert.equal(snapshot.apps.length, 25);
  assert.equal((html.match(/class="app-card"/g) || []).length, snapshot.apps.length);
  assert.equal(new Set(snapshot.apps.map(a => a.id)).size, snapshot.apps.length);
  for (const app of snapshot.apps) assert.ok(html.includes(`data-app-id="${app.id}"`));
});
test('all 25 verified websites are in the static HTML', () => {
  assert.equal(projects.length, 25); assert.equal((html.match(/class="project-card"/g) || []).length, projects.length);
  for (const project of projects) { assert.ok(html.includes(`data-project="${project.id}"`)); assert.doesNotThrow(() => renderProject(project)); }
});
test('saved popularity order starts with CarSales and rating counts never increase', () => {
  const ordered = sortApps(snapshot.apps); assert.equal(ordered[0].id, 6756135308);
  for (let i = 1; i < ordered.length; i++) assert.ok(ordered[i].count <= ordered[i - 1].count);
  assert.ok(html.indexOf('data-app-id="6756135308"') < html.indexOf('data-app-id="6763932885"'));
});
test('latest September releases are included by current public store name', () => {
  assert.ok(snapshot.apps.some(a => a.name.startsWith('Casewright') && a.released === '2026-09-02'));
  assert.ok(snapshot.apps.some(a => a.name.startsWith('Thresh') && a.released === '2026-09-02'));
});
test('prelaunch and research ventures are not represented as live products', () => {
  for (const id of ['hookferry', 'permitarchive', 'ratearchive', 'dutymesh']) {
    const item = projects.find(p => p.id === id); assert.notEqual(item.status, 'Live'); assert.match(renderProject(item), /project-status/);
  }
});
test('correct domains and separate Bay State Sites positioning are preserved', () => {
  assert.equal(projects.find(p => p.id === 'funderfit').url, 'https://funderfit.co/');
  assert.equal(projects.find(p => p.id === 'baystatesites').url, 'https://baystatesites.com/');
  assert.doesNotMatch(html, /Andromeda Kinship (designs|builds and maintains)|Websites Built &amp; Maintained/);
  assert.match(html, /dedicated brand for website design/);
});
test('homepage anchors are unique and every local fragment resolves', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]); assert.equal(new Set(ids).size, ids.length);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), `Missing anchor ${id}`);
});
test('original legal URLs and AppFactory inquiry remain available', async () => {
  for (const path of ['legal/privacy-policy.html', 'legal/terms-of-service.html', 'regping/index.html', 'cabinet-sales-tracker-pro/privacy.html']) {
    assert.ok((await readFile(new URL(`../${path}`, import.meta.url))).length > 0);
  }
  assert.match(html, /id="appfactory"/); assert.match(html, /AppFactory%20Acquisition%20Inquiry/);
});
test('document metadata has one canonical origin and valid organization JSON', () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1); assert.match(html, /rel="canonical" href="https:\/\/andromedakinship.com\/"/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1]);
  assert.equal(schema.name, 'Andromeda Kinship'); assert.ok(schema.logo.endsWith('/assets/brand/andromeda-kinship.svg'));
});
test('embedded catalogs are JSON data, with no unresolved build tokens', () => {
  assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);
  for (const id of ['app-snapshot', 'project-snapshot']) assert.doesNotThrow(() => JSON.parse(html.match(new RegExp(`<script id="${id}" type="application/json">([^]*?)<\\/script>`))[1]));
});

test('every local homepage asset and legal link resolves to a real file', async () => {
  const paths = new Set([...html.matchAll(/(?:href|src)="(\/[^"?#]+)(?:\?[^"#]*)?"/g)].map(m => m[1]));
  for (const path of paths) {
    const file = new URL(`..${path}`, import.meta.url); const info = await stat(file);
    assert.ok(info.isFile() || info.isDirectory(), path);
  }
});

test('production contains neither QA fixtures nor unversioned module imports', async () => {
  assert.doesNotMatch(html, /Simulated App Store outage|nativeContext|nativeMatchMedia|qa=no-/);
  assert.match(html, /site\.bundle\.js\?v=[0-9a-f]{12}/);
  const bundle = await readFile(new URL('../assets/site.bundle.js', import.meta.url), 'utf8');
  assert.doesNotMatch(bundle, /^import /m);
});

test('principal text and card palettes meet the WCAG AA 4.5:1 contrast threshold', () => {
  const luminance = hex => {
    const [r, g, b] = hex.match(/[a-f0-9]{2}/gi).map(part => parseInt(part, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * b;
  };
  for (const [foreground, background] of [['f4f2ec','05080f'], ['a6afbd','0b1019'], ['a9b6ca','111b2a'], ['365449','c7d6cf'], ['c8b6ca','17141d'], ['bbcddb','0e2030'], ['ecd3aa','111b2a']]) {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    assert.ok((values[0] + .05) / (values[1] + .05) >= 4.5, `${foreground} on ${background}`);
  }
});
