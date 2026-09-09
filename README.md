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

Requires Node.js 20 or newer. Building and previewing need no package installation. `npm ci --ignore-scripts` installs two pinned, test-only dependencies: jsQR for independent QR decoding and axe-core for local accessibility scans. Neither ships in the live bundle. No build service, paid font service, animation subscription, or QR subscription is required.

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
- `data/app-support.json` and `scripts/support.mjs`: verified policy mappings and generated support pages
- `assets/document.css`: readability/landmark support for legacy documents without changing legal wording

`npm run build` produces `index.html`, `assets/site.bundle.js`, `support.html`, and four repaired app-specific support pages. Commit those generated files with their source changes. The homepage is static HTML: the full collections, meaningful links, and metadata are present before JavaScript runs. One versioned JavaScript bundle keeps shared code from getting mixed across cached releases.

## Brand and content rules

The owner-supplied Fiverr logo is used unchanged in `assets/brand/andromeda-kinship.svg`. Its guide specifies **Libre Baskerville 400**, black, and white. The site uses that typeface with Inter for reading text. Fonts are self-hosted; their OFL licenses are in `assets/fonts/`. `favicon.svg` reuses the exact supplied symbol paths without the lettering, framed on white for small sizes. The PNG (32px), ICO (16/32/48px), and Apple touch icon (180px) are raster exports of that SVG. Icon links are versioned to refresh cached older designs after a release.

Andromeda Kinship is the independent studio/umbrella. **Bay State Sites** is the separate website-design, hosting, and care brand. Website-service inquiries should point to `https://baystatesites.com/`.

Only verified public projects belong in the portfolio. A public reference/preview does not make its unreleased data or transaction features live. Keep private prototypes, internal tools, customer records, account details, financial reporting, and credentials out of the public catalog and this repository. Client sites are not automatically owned portfolio ventures.

The September 7, 2026 audit checked all 25 existing public destinations and separated them by purpose: 18 websites/tools, 4 previews or research projects, 2 app-support/companion sites, and 1 newsletter. Only the first group contributes to the website count. `kind` is required and the build rejects an unknown classification. CarSales and LeaseWorth legitimately appear in both web and app collections because their websites offer browser tools. Kitchen Ledger and ScrapMetal Intel do not count as standalone websites. DutyMesh now links directly to `https://usedutymesh.com/`.

The current snapshot retains all 25 verified U.S. App Store apps (refreshed September 8 UTC / September 7 Eastern). A complete Cloudflare account inventory was not performed; do not claim the directory proves every domain or private project is included. See `docs/site-audit-2026-09-07.md` for scope, evidence, and unresolved content-review items.

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
- The decorative scene is ignored by assistive technology, capped at 30 frames per second, and stopped below its useful viewing area or when the tab is hidden. The renderer combines a ray-marched dust volume with depth-positioned stars and a shared perspective camera; a third, composited pass adds the nearby star and planet only during the approach. The optional galaxy passage uses native page scrolling and can be bypassed by the hero's collection links.
- Desktop resolution is capped at 1.25 device-pixel ratio and 1.6 million pixels; mobile uses at most 1.0 DPR, fewer stars, and fewer volume samples. No remote texture, 3D framework, or postprocessing service is needed.
- The cinematic pass follows a curved galactic approach, then an exponential descent toward one original ringed planet. Analytic sphere/ring intersections provide opaque surface shading, front/back ring placement, the planet's shadow on its rings, a nearby star, and atmospheric glow. Surface detail is procedural and uses fewer noise samples on smaller/lower-power devices. The last camera position is 1.85 planet radii from its center on desktop and 3.15 on narrow screens; pointer orbit remains outside its surface.
- The camera reaches that final position before the next content section enters the viewport. Nearby field-star trails respond to scroll movement and settle when scrolling stops; pointer parallax is bounded. The decorative passage is longer for the flight and shorter under reduced motion or without JavaScript. Pausing never changes the page height.
- Reduced-motion preferences start with a still scene. Explicit pause/resume controls remember only this device-local preference.
- WebGL failure leaves the galaxy photograph and all page content usable. JavaScript failure leaves the complete static catalogs and navigation usable.
- Search/filter changes announce concise result counts. The mobile menu supports keyboard navigation, Escape, focus containment, and an inert background.
- Card flips use real buttons, transfer focus to the visible side, make the hidden side inert, and return to the front on Escape. Reduced-motion and the site's pause setting remove the flip transition. Without JavaScript, all normal App Store links remain usable and QR controls stay hidden.

The existing M31 photograph is by Adam Evans, licensed CC BY 2.0, with visible attribution. It remains the static fallback and existing social-preview image. The animated scene is an artistic interpretation, not an astronomical simulation.

The 42 legacy policy pages and five existing app-support pages receive presentation-only accessibility improvements. `tests/policy-integrity.json` fingerprints each policy's title, visible wording (including dates), and body links before those changes. Do not regenerate these baselines to hide a changed policy; an intentional legal/content update requires its own review. The general support page no longer implies that every app stores/deletes data identically. SellCraft's policies are explicitly app-specific, not the portfolio's or RegPing's general privacy/terms pages.

## Checks and release

```sh
npm run check
git diff --check
```

Run `npm ci --ignore-scripts` once before tests in a fresh checkout. The checks include independent QR decoding for all 25 saved apps, focus/inert-state behavior, safe destinations, and icon format/content verification.

For local failure-mode checks only, start the preview with `ANDROMEDA_QA=1 npm run dev`. The query modes `?qa=no-js`, `?qa=no-webgl`, `?qa=offline-apps`, and `?qa=reduced-motion` simulate failures/preferences in the local preview. They are not generated into the public homepage.

`?qa=accessibility` adds a localhost-only axe-core scan and a rerun button to any HTML page; the JSON result is in `#qa-audit-result`. Wait for `#qa-audit-run:not([disabled])` before reading it. `?qa=scene-debug` exposes graphics errors, sample pixels, and draw calls on the local canvas for diagnosis. These checks are development fixtures only. Automated passes do not replace manual assistive-technology testing or a legal/commercial review of the apps.

Before an authorized release, check desktop/mobile layouts, keyboard navigation, both catalog searches, all sort options, pause/resume, failure fallbacks, and existing legal/support pages. Preserve unrelated changes. The release flow is a reviewed commit followed by a push to `website`; do not change DNS or migrate the hosting project. Confirm the provider's completed build references that commit, then check the public homepage and versioned asset contents. A successful local build or push alone is not proof that the live site updated.

App-specific support and policy folders, the shared `legal/` pages, and all `regping/` routes are intentionally preserved by the redesign.
