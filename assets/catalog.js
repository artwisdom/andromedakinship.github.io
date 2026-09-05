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
  if (!url || !icon || !Number.isSafeInteger(app.id) || app.id < 1) throw new Error(`Invalid app URL or ID: ${app.id}`);
  const rating = app.count > 0
    ? `<span class="app-rating"><span aria-hidden="true">★</span> ${app.rating.toFixed(1)} <span class="sr-only">out of 5,</span><span class="rating-count">${app.count.toLocaleString('en-US')} ${app.count === 1 ? 'rating' : 'ratings'}</span></span>`
    : '<span class="app-unrated">Not yet rated</span>';
  return `<article class="app-card" data-app-id="${app.id}">
    <div class="app-card-inner">
    <div class="app-face app-front" id="app-front-${app.id}">
    <a class="app-primary-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">
      <div class="app-top"><img src="${escapeHTML(icon)}" width="56" height="56" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="app-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${arrow}</div>
      <h3>${escapeHTML(app.name)}</h3><span class="app-genre">${escapeHTML(app.genre)}</span><p>${escapeHTML(app.description)}</p>
      <div class="app-bottom">${rating}<span class="sr-only"> · View on the App Store (opens in a new tab)</span></div>
    </a>
    <button class="app-flip-button" type="button" data-show-qr aria-label="Show QR code for ${escapeHTML(app.name)}" aria-controls="app-qr-${app.id}" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 19h2v2h-2z" stroke="currentColor" stroke-width="1.5"/><path d="M21 14v3M14 21h3M12 3v3M3 12h3" stroke="currentColor" stroke-width="1.5"/></svg>Show QR code<span aria-hidden="true">↻</span></button>
    </div>
    <div class="app-face app-back" id="app-qr-${app.id}" aria-hidden="true" inert>
      <span class="app-qr-eyebrow">From your screen to your phone</span>
      <p class="app-qr-name">${escapeHTML(app.name)}</p>
      <div class="app-qr-image" data-qr-image></div>
      <p class="app-qr-help">Scan with your phone camera.</p>
      <a class="app-store-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Open App Store ${arrow}<span class="sr-only"> for ${escapeHTML(app.name)} (opens in a new tab)</span></a>
      <button class="app-return-button" type="button" data-hide-qr aria-label="Back to app details for ${escapeHTML(app.name)}"><span aria-hidden="true">↶</span>Back to app</button>
    </div>
    </div>
  </article>`;
}
