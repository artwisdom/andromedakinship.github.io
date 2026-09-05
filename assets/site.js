import { APPLE_LOOKUP, normalizeApps, sortApps, filterRecords, renderApp, renderProject } from './catalog.js';
import { createGalaxy } from './galaxy.js';
import { enableAppFlips } from './qr.js';

document.documentElement.classList.add('js');
const $ = selector => document.querySelector(selector);
const snapshot = JSON.parse($('#app-snapshot').textContent);
const web = JSON.parse($('#project-snapshot').textContent);
let apps = snapshot.apps;
let category = 'all';
let appInteracted = false;
let pendingApps = null;

function markFreshApps() {
  $('[data-app-count]').innerHTML = `${apps.length}<span>↗</span>`;
  $('[data-app-total]').textContent = apps.length;
  $('#app-source').textContent = `Live U.S. App Store ratings · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Ratings are not download counts.`;
}

// Controls only appear after their static fallbacks are ready.
document.querySelectorAll('[data-enhanced]').forEach(element => { element.hidden = false; });
function updateProjects() {
  const projects = filterRecords(web.projects, $('#project-search').value, category);
  $('#project-grid').innerHTML = projects.map(renderProject).join('');
  $('#project-results').textContent = `${projects.length} of ${web.projects.length} projects`;
  $('#project-empty').hidden = projects.length > 0;
}
document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.category;
  document.querySelectorAll('.filters button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  updateProjects();
}));
$('#project-search').addEventListener('input', updateProjects);

function updateApps() {
  if (pendingApps) { apps = pendingApps; pendingApps = null; markFreshApps(); }
  const order = $('#app-sort').value;
  const filtered = sortApps(filterRecords(apps, $('#app-search').value), order);
  $('#app-grid').innerHTML = filtered.map(renderApp).join('');
  $('#app-results').textContent = `${filtered.length} of ${apps.length} apps`;
  $('#app-empty').hidden = filtered.length > 0;
  $('#ranking-note').textContent = order === 'newest' ? 'Ordered by original U.S. App Store release date, newest first.' : order === 'rating' ? 'Ordered by average U.S. App Store rating. Unrated apps appear last.' : 'Popularity = number of U.S. App Store ratings. Ties show newer releases first.';
}
for (const [selector, event] of [['#app-sort', 'change'], ['#app-search', 'input']]) $(selector).addEventListener(event, () => { appInteracted = true; updateApps(); });
enableAppFlips($('#app-grid'), () => { appInteracted = true; });

// Best-effort refresh. A complete, indexable snapshot is already in the HTML.
// Never remove saved apps because of a partial/region-specific Apple response.
async function refreshApps() {
  try {
    const response = await fetch(APPLE_LOOKUP, { signal: AbortSignal.timeout(6500), credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error('App Store unavailable');
    const fresh = normalizeApps(await response.json(), snapshot.apps);
    const freshIds = new Set(fresh.map(app => app.id));
    if (snapshot.apps.some(app => !freshIds.has(app.id))) throw new Error('App Store snapshot incomplete');
    // Do not move cards beneath someone already exploring the collection.
    const inUse = appInteracted || $('#app-grid').contains(document.activeElement) || $('#apps').getBoundingClientRect().top < innerHeight;
    if (inUse) { pendingApps = fresh; return; }
    apps = fresh; updateApps();
    markFreshApps();
  } catch { /* The dated, verified snapshot stays visible. No empty/error-only page. */ }
}
refreshApps();

const menu = $('.menu-toggle');
const nav = $('#main-nav');
menu.hidden = false;
function setMenu(open, returnFocus = false) {
  menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); document.body.classList.toggle('menu-open', open);
  document.querySelectorAll('main, .site-footer, .scene-control').forEach(element => { element.inert = open; });
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (menu.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') { setMenu(false, true); return; }
  if (event.key === 'Tab') {
    const links = [...nav.querySelectorAll('a')];
    if (event.shiftKey && document.activeElement === menu) { event.preventDefault(); links.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menu.focus(); }
  }
});
matchMedia('(min-width: 721px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = motionPreference.matches;
try { paused ||= localStorage.getItem('andromeda.motion') === 'paused'; } catch { /* Storage may be blocked. */ }
let galaxy = null;
try { galaxy = createGalaxy($('#galaxy'), { reducedMotion: motionPreference.matches, paused }); } catch { /* Static galaxy remains. */ }
const motionButtons = [$('#motion-toggle'), $('#scene-toggle')];
function syncMotion() {
  document.body.classList.toggle('motion-paused', paused);
  document.documentElement.classList.toggle('motion-paused', paused);
  for (const button of motionButtons) {
    button.hidden = !galaxy;
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Resume galaxy animation' : 'Pause galaxy animation');
  }
  $('#motion-toggle').innerHTML = paused ? 'Resume motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
  $('.scene-control-icon').textContent = paused ? '▷' : 'Ⅱ';
  $('.scene-control-text').textContent = paused ? 'Resume motion' : 'Pause motion';
  galaxy?.setMotion({ paused, reducedMotion: motionPreference.matches && paused });
}
motionButtons.forEach(button => button.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem('andromeda.motion', paused ? 'paused' : 'playing'); } catch { /* Preference is optional. */ }
  syncMotion();
}));
motionPreference.addEventListener('change', event => { paused = event.matches; syncMotion(); });
syncMotion();

let scrollFrame = 0;
function onScroll() {
  scrollFrame = 0;
  const y = scrollY;
  $('.site-header').classList.toggle('is-scrolled', y > 72);
  const height = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  document.documentElement.style.setProperty('--reading-progress', String(Math.min(1, y / height)));
  document.documentElement.style.setProperty('--universe-opacity', String(Math.max(.08, 1 - y / (innerHeight * 1.75))));
  $('#scene-toggle').classList.toggle('at-content', y > innerHeight * 1.5);
  galaxy?.update(y);
}
window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll); }, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
if (matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', event => { galaxy?.pointer((event.clientX / innerWidth - .5) * 2, (.5 - event.clientY / innerHeight) * 2); }, { passive: true });
window.addEventListener('pagehide', () => galaxy?.setMotion({ paused: true }));
window.addEventListener('pageshow', () => { syncMotion(); onScroll(); });
onScroll();
