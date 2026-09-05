# Andromeda Kinship

The source for **https://andromedakinship.com/**.

## Correct project and production source

- Repository: `artwisdom/andromedakinship.github.io`
- Production branch: `website`, root directory
- Hosting: GitHub Pages, with the custom domain served through Cloudflare
- Working folder: `/Users/michaeldube/Desktop/APPS/andromedakinship.github.io`
- Last upstream change before this redesign: `69f0248aa084a5551abff70a392808a9a87ee87d` (Casewright policy naming)

Confirm the remote, branch, clean/dirty state, and current GitHub Pages source before a release. A similarly named folder is not evidence that it owns production.

## Edit and preview

Requires Node.js 20 or newer. Building and previewing need no package installation. `npm ci --ignore-scripts` installs the one test-only dependency for independent QR decoding. No build service, paid font service, animation subscription, or QR subscription is required.

```sh
npm run build
npm run dev
```

The local preview is available at `http://127.0.0.1:4173`. Reload after a change; this small server does not use hot reloading.

Edit these source files:

- `src/index.template.html`: homepage structure, copy, and metadata
- `assets/site.css`: layout, responsive design, and brand typography
- `assets/site.js`: navigation, search, sorting, and motion preferences
- `assets/galaxy.js`: original WebGL galaxy and scroll-driven camera
- `assets/catalog.js`: shared normalization, sorting, filtering, and safe HTML rendering
- `assets/qr.js`: locally generated App Store QR codes and accessible card-flip controls
- `data/projects.json`: verified public website directory, including explicit early-stage labels
- `data/apps.json`: dated U.S. App Store snapshot and curated app descriptions

`npm run build` produces `index.html` and `assets/site.bundle.js`. Commit those generated files with their source changes. The homepage is static HTML: the full collections, meaningful links, and metadata are present before JavaScript runs. One versioned JavaScript bundle keeps shared code from getting mixed across cached releases.

## Brand and content rules

The owner-supplied Fiverr logo is used unchanged in `assets/brand/andromeda-kinship.svg`. Its guide specifies **Libre Baskerville 400**, black, and white. The site uses that typeface with Inter for reading text. Fonts are self-hosted; their OFL licenses are in `assets/fonts/`. `favicon.svg` reuses the exact supplied symbol paths without the lettering, framed on white for small sizes. The PNG (32px), ICO (16/32/48px), and Apple touch icon (180px) are raster exports of that SVG. Icon links are versioned to refresh cached older designs after a release.

Andromeda Kinship is the independent studio/umbrella. **Bay State Sites** is the separate website-design, hosting, and care brand. Website-service inquiries should point to `https://baystatesites.com/`.

Only verified public projects belong in the portfolio. A public reference/preview does not make its unreleased data or transaction features live. Keep private prototypes, internal tools, customer records, account details, financial reporting, and credentials out of the public catalog and this repository. Client sites are not automatically owned portfolio ventures.

The September 4, 2026 directory contains 25 verified public web destinations and 25 live U.S. App Store apps. Research used current public pages, authenticated GitHub repository metadata, and existing project/domain records. A complete Cloudflare account inventory was unavailable; do not claim that this directory independently proves every domain in that account is included.

App popularity means **U.S. App Store rating count**, not installs, usage, or revenue. Ties use original release date, then name. Unrated apps do not receive an invented score. Each page load attempts a fresh lookup from the verified developer (ID `1858655640`), validates official Apple destinations, and retains the complete dated snapshot if Apple fails or returns an incomplete catalog. It avoids reshuffling cards while someone is already using the app section.

To refresh the saved snapshot:

```sh
npm run refresh:apps
npm run build
npm test
```

Review new app names and descriptions before publishing. The refresh refuses to silently remove saved apps. The rendered collection can be sorted by popularity, original release date, or average rating.

Each app card has a **Show QR code** button, a **Back to app** button, and direct App Store links on both sides. QR images are generated only when requested, encode the card's exact official Apple URL, and use black modules on white with a four-module clear border. No third-party QR endpoint, expiring short link, or tracking redirect is involved. New apps returned by the existing Apple refresh automatically receive the same controls. Search and sorting reset cards to their fronts.

The encoder is [Project Nayuki's QR Code generator v1.8.0](https://github.com/nayuki/QR-Code-generator/releases/tag/v1.8.0), vendored in `assets/vendor/qrcodegen.js` with its MIT license intact; adaptations are an ES-module export and removal of trailing whitespace. It is included in the site's versioned bundle, so no runtime CDN dependency is added. The pinned, development-only [jsQR decoder](https://github.com/cozmo/jsQR) independently scans SVG-derived pixels for every app during tests; it is never included in the browser bundle.

## Accessibility and resilient motion

- Native scrolling; no scroll hijacking, autoplay sound, tracking pixels, or sign-up overlay.
- The decorative scene is ignored by assistive technology, capped at 30 frames per second, and stopped below its useful viewing area or when the tab is hidden.
- Reduced-motion preferences start with a still scene. Explicit pause/resume controls remember only this device-local preference.
- WebGL failure leaves the galaxy photograph and all page content usable. JavaScript failure leaves the complete static catalogs and navigation usable.
- Search/filter changes announce concise result counts. The mobile menu supports keyboard navigation, Escape, focus containment, and an inert background.
- Card flips use real buttons, transfer focus to the visible side, make the hidden side inert, and return to the front on Escape. Reduced-motion and the site's pause setting remove the flip transition. Without JavaScript, all normal App Store links remain usable and QR controls stay hidden.

The existing M31 photograph is by Adam Evans, licensed CC BY 2.0, with visible attribution. It remains the static fallback and existing social-preview image. The animated scene is an artistic interpretation, not an astronomical simulation.

## Checks and release

```sh
npm run check
git diff --check
```

Run `npm ci --ignore-scripts` once before tests in a fresh checkout. The checks include independent QR decoding for all 25 saved apps, focus/inert-state behavior, safe destinations, and icon format/content verification.

For local failure-mode checks only, start the preview with `ANDROMEDA_QA=1 npm run dev`. The query modes `?qa=no-js`, `?qa=no-webgl`, `?qa=offline-apps`, and `?qa=reduced-motion` simulate failures/preferences in the local preview. They are not generated into the public homepage.

Before an authorized release, check desktop/mobile layouts, keyboard navigation, both catalog searches, all sort options, pause/resume, failure fallbacks, and existing legal/support pages. Preserve unrelated changes. The release flow is a reviewed commit followed by a push to `website`; do not change DNS or migrate the hosting project. Confirm the provider's completed build references that commit, then check the public homepage and versioned asset contents. A successful local build or push alone is not proof that the live site updated.

App-specific support and policy folders, the shared `legal/` pages, and all `regping/` routes are intentionally preserved by the redesign.
