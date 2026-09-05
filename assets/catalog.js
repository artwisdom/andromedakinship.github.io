// Shared by the static build and progressive enhancement in the browser.
export const DEVELOPER_ID = 1858655640;
export const APPLE_LOOKUP = `https://itunes.apple.com/lookup?id=${DEVELOPER_ID}&entity=software&country=us&limit=200`;

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function safeURL(value, allowedHosts = []) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (allowedHosts.length && !allowedHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) return '';
    return url.href;
  } catch { return ''; }
}

export function normalizeApps(response, knownApps = []) {
  if (!Array.isArray(response?.results)) throw new Error('Invalid App Store response');
  const known = new Map(knownApps.map(app => [app.id, app]));
  const unique = new Map();
  for (const app of response.results) {
    if (app.wrapperType !== 'software' || Number(app.artistId) !== DEVELOPER_ID || !Number.isSafeInteger(app.trackId) || !app.trackName) continue;
    const url = safeURL(app.trackViewUrl, ['apps.apple.com']);
    const icon = safeURL(app.artworkUrl512 || app.artworkUrl100, ['mzstatic.com']);
    if (!url || !icon) continue;
    const previous = known.get(app.trackId);
    unique.set(app.trackId, {
      id: app.trackId, name: app.trackName, genre: app.primaryGenreName || 'App', icon, url,
      description: previous?.description || String(app.description || '').split(/\n/)[0].slice(0, 240),
      rating: Number.isFinite(Number(app.averageUserRating)) ? Math.min(5, Math.max(0, Number(app.averageUserRating))) : 0,
      count: Number.isFinite(Number(app.userRatingCount)) ? Math.max(0, Math.floor(Number(app.userRatingCount))) : 0,
      released: String(app.releaseDate || '').slice(0, 10),
      updated: String(app.currentVersionReleaseDate || '').slice(0, 10)
    });
  }
  if (!unique.size) throw new Error('No verified developer apps returned');
  return [...unique.values()];
}

export function sortApps(apps, order = 'popular') {
  const recent = (a, b) => (b.released || '').localeCompare(a.released || '') || a.name.localeCompare(b.name);
  return [...apps].sort((a, b) => order === 'newest' ? recent(a, b)
    : order === 'rating' ? Number(b.count > 0) - Number(a.count > 0) || b.rating - a.rating || b.count - a.count || recent(a, b)
    : b.count - a.count || recent(a, b));
}

export function filterRecords(records, query = '', category = 'all') {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return records.filter(item => (category === 'all' || item.category === category)
    && words.every(word => `${item.name} ${item.description} ${item.genre || item.category || ''}`.toLocaleLowerCase().includes(word)));
}

export const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';

export function renderProject(project, index) {
  const url = safeURL(project.url);
  if (!url) throw new Error(`Invalid project URL: ${project.id}`);
  const status = project.status === 'Live' ? '' : `<span class="project-status">${escapeHTML(project.status)}</span>`;
  return `<article class="project-card" data-category="${escapeHTML(project.category)}" data-project="${escapeHTML(project.id)}">
    <a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="project-link">
      <div class="project-top"><span class="project-monogram" aria-hidden="true">${escapeHTML(project.monogram)}</span><span class="project-category">${escapeHTML(project.category)}</span>${arrow}</div>
      <h3>${escapeHTML(project.name)}</h3><p>${escapeHTML(project.description)}</p>
      <div class="project-bottom"><span class="project-domain">${escapeHTML(new URL(url).hostname.replace(/^www\./, ''))}</span>${status}<span class="sr-only"> (opens in a new tab)</span></div>
    </a>
  </article>`;
}

export function renderApp(app, index) {
  const url = safeURL(app.url, ['apps.apple.com']);
  const icon = safeURL(app.icon, ['mzstatic.com']);
  if (!url || !icon) throw new Error(`Invalid app URL: ${app.id}`);
  const rating = app.count > 0
    ? `<span class="app-rating"><span aria-hidden="true">★</span> ${app.rating.toFixed(1)} <span class="sr-only">out of 5,</span><span class="rating-count">${app.count.toLocaleString('en-US')} ${app.count === 1 ? 'rating' : 'ratings'}</span></span>`
    : '<span class="app-unrated">Not yet rated</span>';
  return `<article class="app-card" data-app-id="${app.id}">
    <a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">
      <div class="app-top"><img src="${escapeHTML(icon)}" width="56" height="56" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="app-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${arrow}</div>
      <h3>${escapeHTML(app.name)}</h3><span class="app-genre">${escapeHTML(app.genre)}</span><p>${escapeHTML(app.description)}</p>
      <div class="app-bottom">${rating}<span class="sr-only"> · View on the App Store (opens in a new tab)</span></div>
    </a>
  </article>`;
}
