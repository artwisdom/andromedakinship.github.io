import { escapeHTML, safeURL } from '../assets/catalog.js';

export function supportPath(value) {
  if (typeof value !== 'string' || !/^\/(?:[a-z0-9-]+\/)+[a-z0-9-]+\.html$/.test(value)) throw new Error('Invalid local support path');
  return value;
}

// A resource directory, not replacement legal language. Existing app policies
// keep their exact URLs and contents; old document names are stated explicitly.
export function renderSupportPages(snapshot, resources, companions, version) {
  const entries = new Map();
  for (const entry of resources.entries) {
    if (entries.has(entry.appId) || !snapshot.apps.some(a => a.id === entry.appId)) throw new Error('Unknown or duplicate support app');
    for (const key of ['privacy', 'terms', 'support']) if (entry[key]) supportPath(entry[key]);
    entries.set(entry.appId, entry);
  }
  const shell = (title, description, path, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#05080f"><title>${escapeHTML(title)} — Andromeda Kinship</title><meta name="description" content="${escapeHTML(description)}"><link rel="canonical" href="https://andromedakinship.com${path}"><link rel="icon" href="/favicon.svg?v=${version}" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css?v=${version}"></head>
<body class="support-page"><a class="skip-link" href="#main">Skip to content</a><header class="support-header section-wrap"><a href="/" class="support-brand"><img src="/assets/brand/andromeda-kinship.svg" width="224" height="109" alt="Andromeda Kinship"></a><a class="text-link" href="/#apps">Back to the apps <span aria-hidden="true">↗</span></a></header><main class="section-wrap" id="main">${body}</main><footer class="support-footer section-wrap"><a href="/">Andromeda Kinship</a><a href="mailto:support@andromedakinship.com">Email app support</a><span>© ${snapshot.verifiedAt.slice(0,4)} Andromeda Kinship</span></footer></body></html>\n`;
  const contact = name => `<a class="button button-light" href="mailto:support@andromedakinship.com?subject=${encodeURIComponent(`${name} support`)}">Email support <span aria-hidden="true">↗</span></a>`;
  const policyLinks = entry => [['privacy', 'Privacy policy'], ['terms', 'Terms of use'], ['support', 'App support']].filter(([key]) => entry?.[key]).map(([key, label]) => `<a href="${entry[key]}">${label}</a>`).join('');
  const rows = [...snapshot.apps].sort((a,b) => a.name.localeCompare(b.name)).map(app => {
    const entry = entries.get(app.id);
    const official = safeURL(app.url, ['apps.apple.com']); if (!official) throw new Error('Invalid App Store support destination');
    return `<li class="support-entry" id="app-${app.id}"><h3>${escapeHTML(app.name)}</h3>${entry?.documentName ? `<p class="document-note">Policy documents use the name “${escapeHTML(entry.documentName)}”.</p>` : ''}<div class="support-links">${policyLinks(entry)}<a href="${escapeHTML(official)}" target="_blank" rel="noopener noreferrer">App Store listing<span class="sr-only"> for ${escapeHTML(app.name)} (opens in a new tab)</span></a></div>${entry ? '' : '<p class="document-note">Use the app’s official listing for its developer privacy-policy link, or email us for help.</p>'}</li>`;
  }).join('\n');
  const companionLinks = companions.map(p => {
    const url = safeURL(p.url); if (!url) throw new Error('Invalid companion URL');
    return `<li><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.name)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a><p>${escapeHTML(p.description)}</p></li>`;
  }).join('');
  const pages = new Map();
  pages.set('support.html', shell('App support & policies', 'Find support, companion pages, and app-specific privacy and terms links for Andromeda Kinship apps.', '/support.html', `
<section class="support-intro"><p class="eyebrow">HERE WHEN YOU NEED US</p><h1>App support.<br><em>A clearer next step.</em></h1><p>Tell us which app you’re using and what you need help with. Please don’t send passwords, payment details, or sensitive information from your app.</p>${contact('Andromeda Kinship app')}</section>
<section class="support-companions" aria-labelledby="companions-title"><h2 id="companions-title">App companion pages</h2><p>Information, support, and legal resources for the apps—not standalone browser tools.</p><ul>${companionLinks}</ul></section>
<section aria-labelledby="policies-title"><h2 id="policies-title">Find your app</h2><p class="support-section-note">Each policy below applies to the named app, not to this portfolio website. Some documents retain an earlier app name; that name is shown beside the link. Existing legal documents have not been rewritten.</p><ul class="support-list">${rows}</ul></section>
<section class="support-help" aria-labelledby="help-title"><h2 id="help-title">A few helpful starting points</h2><h3>Purchases and subscriptions</h3><p>Use your Apple account’s subscription settings to manage an App Store subscription. If your app offers Restore Purchases, look in its settings or upgrade screen. Contact us if you need help finding it.</p><h3>Data, exports, and deletion</h3><p>Storage and account features vary by app. Check that app’s settings and privacy policy, or contact support for instructions specific to your app. We do not assume every app stores or deletes data in the same way.</p></section>`));
  for (const entry of resources.entries.filter(e => e.repairSupport)) {
    const app = snapshot.apps.find(a => a.id === entry.appId);
    pages.set(entry.support.slice(1), shell(`${app.name} support`, `Contact support and find the privacy policy and terms for ${app.name}.`, entry.support, `<section class="support-intro"><p class="eyebrow">ANDROMEDA KINSHIP / APP SUPPORT</p><h1>${escapeHTML(app.name)}<br><em>How can we help?</em></h1><p>For questions, bugs, or help with this app, email support. Include the app name, app version, and a short description. Please do not include passwords, payment details, or sensitive app data.</p>${contact(app.name)}</section><section class="support-help"><h2>App documents</h2>${entry.documentName ? `<p>These existing documents use the name “${escapeHTML(entry.documentName)}”.</p>` : ''}<div class="support-links">${policyLinks({ privacy:entry.privacy,terms:entry.terms })}<a href="/support.html">All app support</a></div></section>`));
  }
  return pages;
}
