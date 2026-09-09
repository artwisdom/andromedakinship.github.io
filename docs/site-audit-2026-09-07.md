# Andromeda Kinship — site audit and galaxy upgrade

Audit date: September 7, 2026 Eastern. The final App Store snapshot refresh crossed midnight UTC on September 8.

The main audit records the first revised preview. The follow-up section at the end records the owner's subsequent request for a more dramatic close-up.

## Outcome and release status

The owner approved publication of the final galaxy-to-planet preview on September 8, 2026. Production was left unchanged during the audit and visual review. The sections below preserve those pre-release findings; publication uses the existing `website` branch and requires a completed GitHub Pages build plus matching public assets.

The portfolio now distinguishes 18 public websites/tools, four research or preview projects, two app-support/companion sites, and one newsletter. All 25 verified U.S. App Store apps remain represented. The galaxy has been rebuilt with a close-up perspective camera, volumetric-looking dust, depth-positioned stars, and a native-scroll journey through its spiral arms.

Working folder: `/Users/michaeldube/Desktop/APPS/andromedakinship.github.io`. Repository: `artwisdom/andromedakinship.github.io`. Production source: the `website` branch, root directory, GitHub Pages behind the existing Cloudflare-served custom domain. Starting commit: `046b95f215b62f93d3b9d343fc8934e3323b1529`. The working tree was clean before this work.

## What was audited

- All 25 destinations already listed in the portfolio: current public responses, redirects, page descriptions, and whether the site offers a public website/tool, a preview, app support, or a newsletter.
- All 64 local visitor-facing HTML pages: homepage, support directory, nine app-specific support pages, 42 policy pages, and 11 RegPing pages. Templates and Google's verification file are excluded from this count.
- App catalog completeness against Apple's U.S. developer lookup, popularity labels, official listing URLs, saved-snapshot resilience, and all 25 QR cards.
- Homepage metadata and structured data; local links/assets throughout the published HTML; headings, landmarks, contrast, keyboard behavior, mobile reflow, and failure modes.
- The original galaxy implementation, rendering budget, scroll/pause behavior, motion preferences, failure cleanup, and dependency footprint.

This is an audit of this public portfolio and its local pages, not a complete inventory of the owner's GitHub or Cloudflare accounts. A destination returning HTTP 200 establishes reachability, not payment readiness, data correctness, revenue, delivery reliability, or legal compliance.

## Findings and corrections

Priorities here describe visitor impact: P1 = materially misleading or broken; P2 = important clarity, accessibility, or reliability improvement.

| Priority | Finding | Correction in this preview |
| --- | --- | --- |
| P1 | Kitchen Ledger and Scrap Metal Intel were counted as websites although their pages mainly contain app information, support, and policies. | Removed from the website count/grid; retained as clearly labeled app companions in the support directory. |
| P1 | Four support addresses advertised by App Store listings returned HTTP 404. | Created the missing pages at their exact existing addresses, each identifying the correct app and linking its existing policies. |
| P1 | Generic homepage and RegPing “Privacy”/“Terms” links led to SellCraft-specific documents. | Replaced misleading generic labels with “App support & policies” and a directory that explicitly identifies app-specific documents. No website-wide legal policy was invented. |
| P1 | The general support FAQ asserted that all apps store/delete data the same way without app-specific evidence. | Removed those blanket assertions; directs visitors to the relevant app's settings, policy, or support contact. |
| P2 | Research, prelaunch destinations, and a newsletter inflated the website collection. | Four projects now appear under “Research & what's next”; Dealer Ops Daily has a separate newsletter callout. |
| P2 | DutyMesh used an older redirecting preview address. | Updated to the direct branded destination, `https://usedutymesh.com/`, labeled as an evidence library rather than a complete landed-cost product. |
| P2 | Legacy documents had missing main landmarks and low-contrast text/links. | Applied presentation-only fixes to 42 policy pages and five existing support pages. All policy wording, dates, titles, and body links are verified unchanged. |
| P2 | The RegPing homepage and FDA page skipped heading levels; some inline links relied on color. | Corrected heading structure without changing appearance and underlined prose links. |
| P2 | The saved-app refresh could accept an equal-size response that silently omitted an existing app. | It now checks existing app IDs, not just the response count, before replacing the saved snapshot. |

### Corrected portfolio classification

All 25 existing destinations resolved successfully during the audit, including followed redirects. “Website” below means useful public web content or functionality, not certification of every advertised backend service.

| Project | Classification | What the current public destination represents |
| --- | --- | --- |
| [BenchCalcs](https://benchcalcs.com/) | Website/tool | Practical browser calculators and explanations. |
| [GovWait](https://govwait.com/) | Website/tool | Official processing-time references and dated history. |
| [CarSales Tracker Pro](https://carsalestrackerpro.com/) | Website/tool + app | Commission calculators, pay-plan guidance, and web deal-tracking content. Its web tools justify its presence in both collections. |
| [LeaseWorth](https://leaseworth.app/) | Website/tool + app | Browser-based lease-cost comparison tools, alongside the app. |
| [RuleGrid](https://rulegrid.dev/) | Website/tool | Source-linked short-term rental rules and research. |
| [StatuteRates](https://statuterates.com/) | Website/tool | Statutory-rate references and calculators. |
| [RenewMark](https://renewmark.app/) | Website/tool | Trademark deadline lookup and monitoring information; checkout/delivery not tested. |
| [FunderFit](https://funderfit.co/) | Website/tool | Public funder matching and research. |
| [PayBeacon](https://travelpaybeacon.com/) | Website/tool | Travel-healthcare benchmarks and offer comparisons. |
| [DwellDocket](https://dwelldocket.com/) | Website/tool | Source-linked security-deposit rules. |
| [CrawlLedger](https://crawlledger.net/) | Website/tool | Public crawler-policy evidence and checking tools. |
| [ProvenDay](https://provenday.com/) | Website/tool | Business-day and settlement-date tools. |
| [HitchMargin](https://hitchmargin.com/) | Website/tool | Payload and towing worksheets. |
| [Fountain Pen Register](https://fountainpenregister.com/) | Website/reference | Pen identification and documented model history, not a public price-history service. |
| [DubeTools](https://dubetools.com/) | Website/tool | Browser table/CSV utilities and guides. |
| [Compliance Ghost](https://complianceghost.com/) | Website/resources | Compliance-documentation resources and service information. |
| [RegPing](https://andromedakinship.com/regping/) | Website/product information | Regulatory-monitoring product pages and guides; bot operation and payments not tested. |
| [Bay State Sites](https://baystatesites.com/) | Website/services | The separate website-design, hosting, and care brand. |
| [Hookferry](https://hookferry.com/) | Prelaunch | Automation-bridge launch information; not presented as accepting live payments. |
| [Permit Archive](https://permitarchive.com/) | Research/source guides | Public guides; unreleased permit records are not represented as public. |
| [The Rate Archive](https://theratearchive.com/) | Research/source index | Public college source references; private tuition observations are not represented as public. |
| [DutyMesh](https://usedutymesh.com/) | Evidence library | Public tariff evidence; not represented as a complete landed-cost calculator. |
| [Kitchen Ledger](https://artwisdom.github.io/kitchenledger-web/) | App companion | App landing page, support, privacy policy, and terms. |
| [ScrapMetal Intel](https://artwisdom.github.io/scrapmetalintel-web/) | App support | Product introduction, policies, and contact details; not a browser pricing tool. |
| [Dealer Ops Daily](https://dealer-ops-daily.beehiiv.com/) | Newsletter | Briefing subscription page; delivery cadence was not independently verified. |

### App and support verification

Apple's [official developer lookup](https://itunes.apple.com/lookup?id=1858655640&entity=software&country=us&limit=200) returned the same 25 software IDs as the saved catalog, with no missing or additional apps. The refreshed snapshot includes current version dates/artwork for Scrap Metal Intel and Sqftly while preserving editorial descriptions. Popularity remains explicitly **U.S. App Store rating count**, not downloads, active users, or revenue.

The 25 individual App Store HTML listings were also requested: 17 returned successfully and eight were rate-limited with HTTP 429. The latter were Kitchen Ledger, Lope, Cadence, Redstring, Sqftly, SellCraft, Casewright, and Fundline. They are not classified as broken; their presence in the catalog was verified through Apple's lookup. No attempt was made to bypass the rate limit.

These four existing public support addresses returned 404 and are repaired locally:

| App | Preserved support address |
| --- | --- |
| Sashline | `/window-door-sales-tracker-pro/support.html` |
| Coilworth | `/mattress-sales-tracker-pro/support.html` |
| Vintry | `/wine-spirits-sales-tracker-pro/support.html` |
| Appliance Sales Tracker Pro | `/appliance-sales-tracker-pro/support.html` |

The new support directory includes every saved app. It directly maps 14 apps to verified or locally identified policy documents; the other entries retain their official App Store listing and support contact instead of guessing a policy URL. Older policy names are disclosed where applicable: Showfloor, Mattress Sales Tracker Pro, Pool Sales Tracker Pro, Window & Door Sales Tracker, and Wine & Spirits Sales Tracker. Their legal text was not silently renamed.

Existing extensionless `/support` and `/haggle/privacy` addresses were also checked on the public host and returned 200; unnecessary redirects were not introduced.

## Design and experience review

The supplied logo, company typography, clear calls to action, and separate Bay State Sites identity were retained. The previous background had insufficient depth and visual proximity for the requested experience. The new scene gives the galaxy a much larger presence while keeping the portfolio easy to reach.

- Original two-pass WebGL artwork: a sampled dust volume plus thousands of stars sharing one perspective camera. Foreground stars have genuine depth-based parallax.
- A short native-scroll passage moves closer through the arms. Collection buttons bypass it; there is no scroll hijacking, sound, signup overlay, or new tracking service.
- A warm core, cooler blue arms, and restrained colored dust preserve the cosmic identity. Dark reading layers protect text readability.
- Pause genuinely freezes the scene. Reduced-motion preferences start with a still frame. Graphics failure restores the credited galaxy photograph.
- Rendering is capped at 30 frames per second and 1.6 million pixels, with lower density/resolution on phones. Work stops when the tab is hidden or the scene is out of view.
- No paid animation service, runtime 3D framework, remote texture dependency, or additional monthly cost was introduced.

## Verification results

| Check | Result |
| --- | --- |
| Generated build consistency, automated tests, whitespace validation | `npm run check` and `git diff --check` pass; 78 tests. |
| Local HTML links/assets | All checked same-origin references across the 64 visitor-facing pages resolve, including existing extensionless policy URLs. |
| Structured data and heading order | All local JSON-LD blocks parse; checked heading sequences do not skip levels. This is not a rich-result eligibility guarantee. |
| Policy integrity | All 42 pre-change semantic fingerprints match: titles, visible wording including dates, and body links unchanged. |
| Automated accessibility | Final scans across 64 pages found zero automatic violations. The homepage and 11 RegPing pages still have incomplete checks requiring human judgment, primarily contrast on complex backgrounds. |
| Legacy policy/support accessibility | All 42 policies, the directory, four new support pages, and five older support pages finished with zero violations and zero incomplete checks. |
| Keyboard interaction | Mobile menu, Escape/focus return, project filters/search, app sorting/search, and research disclosure tested. All 25 QR flips tested with keyboard controls and hidden-side focus protection. |
| Independent QR decoding | All 25 QR codes decode to their exact official App Store URL. No third-party QR endpoint or redirect. |
| Responsive layout | No horizontal overflow in the tested 320, 390, 640, 768, 1024, and 1440 CSS-pixel layouts. Desktop and phone compositions visually inspected. |
| Failure modes | JavaScript disabled, WebGL unavailable, Apple lookup unavailable, and reduced motion each retain all 18 websites and 25 saved apps. |
| Motion lifecycle | Automated checks cover a closer, valid camera basis; pause; visibility; leaving the scene; context loss; shader failure; and cleanup. |
| Dependencies | Two pinned test-only dependencies; package audit reported zero known vulnerabilities at audit time. This is not a security certification. |
| Generated asset sizes | JavaScript bundle: 77,548 bytes / 22,612 gzip. Main CSS: 48,877 bytes / 11,835 gzip. Shared legacy-document CSS: 626 bytes / 364 gzip. |

Accessibility work was guided by WCAG 2.1 AA checks: keyboard access and focus behavior, semantic relationships/headings, text contrast, reflow, and motion controls. Automated scans used the local, development-only [axe-core](https://github.com/dequelabs/axe-core) package. Complex-background contrast was also visually reviewed; a full manual assistive-technology audit is still distinct from these checks.

### Code-review assessment

- **Correctness:** Explicit project types prevent inflated website counts. Complete-ID checks protect the saved app fallback. Static HTML keeps the catalogs available before JavaScript.
- **Security:** Generated text is escaped, public URLs are validated, local support paths are restricted before file access, and untrusted App Store responses cannot inject arbitrary destinations. No credentials or server-side account changes were involved.
- **Performance:** The renderer has explicit resolution/frame budgets, visibility cleanup, fewer mobile samples, and no heavyweight rendering dependency. These limits are verified in code/tests; sustained physical-phone battery or thermal performance was not measured.
- **Maintainability:** Source catalogs remain separate from generated HTML, support pages share a generator, and policy fingerprints guard against accidental legal copy changes. README documents the source files, checks, and release procedure.

## Remaining review items and limits

1. **Kitchen Ledger's separate companion site still says “Coming soon to iOS,” although its App Store app is available.** That page lives outside this repository. Its classification here is fixed; changing its copy needs work in its own project.
2. **A portfolio-specific and RegPing-specific privacy explanation has not been established by this audit.** Removing links mislabeled as general policies does not create a replacement privacy policy. Actual data practices and appropriate wording need separate review before making compliance claims.
3. **Several policies still use earlier app names.** The directory makes the relationship visible, but renaming legal documents or asserting updated data practices requires app-specific confirmation. No legal wording or dates were changed here.
4. **Eight App Store HTML pages were rate-limited.** All 25 apps were verified in Apple's developer lookup, but the audit does not claim every listing's current detailed policy/support markup was retrieved successfully.
5. **Other products were checked as portfolio destinations, not end-to-end businesses.** Payment flows, bot runtime, email delivery, private datasets, app behavior, ownership of every account/domain, and factual/legal correctness of external product content were not audited.
6. **Manual testing limits:** No VoiceOver/NVDA session, actual browser 200% zoom run, or physical-phone performance profiling was performed. Narrow-layout testing is not a substitute for every zoom or assistive-technology scenario.

## Next step

The owner has reviewed and approved the final [local preview](http://127.0.0.1:4173/). Use the existing `website`-branch release flow and verify the exact commit, completed GitHub Pages build, and public homepage/assets. No hosting migration, DNS change, Search Console submission, or account action is needed for this release.

## Follow-up: dramatic close-up pass — September 7 Eastern

The owner liked the revised preview and requested a substantially closer, more dramatic, interactive galaxy. This pass changes the artwork and its immediate presentation; the audited project classifications, apps, policy wording, and support repairs remain intact. At the time of this follow-up, it was local and unpublished.

### Design review and response

The existing logo, typography, portfolio navigation, and clear reading layer work well. The remaining visual opportunity was proximity: the camera still felt outside the galaxy, and the deepest view arrived as the following content covered it.

| Finding | Priority | Implemented response |
| --- | --- | --- |
| The close-up still resembles an external view. | Moderate | A curved approach and descent to 0.48 scene units above the dust plane. The final camera is 1.40 units from the center versus 4.79 previously, approximately 3.4 times closer. These are artwork coordinates, not astronomical measurements. |
| The last view is covered by the next section too quickly. | Moderate | Arrive while the entire viewport is still in the galaxy passage; hold that camera position before the collection introduction appears. |
| Depth and pointer interaction are too subtle. | Moderate | Stronger bounded parallax, more nearby field stars, and scroll-responsive star trails that settle when scrolling stops. |
| The approach needs more detail and richer light. | Moderate | Finer dust filaments, dark absorption lanes, saturated blue/violet arms, a warm core, and a core-anchored horizontal glow. Proper two-sided volume intersections prevent an artificial horizon cutout inside the clouds. |
| Visitors may miss the mouse interaction. | Minor | A concise desktop cue appears only when the interactive artwork is available and moving. Still/fallback modes retain appropriate wording. |

The reading order stays logo/navigation, headline, collection links, then the optional galaxy passage. The passage uses the same serif/sans-serif palette and restrained dark text surfaces. Native scrolling and direct collection links remain intact. No new service, subscription, remote image, runtime library, or monthly charge was introduced.

### Follow-up checks

- 82 automated tests pass, including new coverage for the close camera, curved path, bounded pointer input, scroll-trail settling, and arrival before the content enters the viewport. Existing policy-integrity and QR tests still pass.
- The build is current and the whitespace check passes.
- Desktop/phone accessibility scans report no automatic violations; complex-background contrast remains an incomplete check requiring human judgment, as in the initial audit. This is not a full manual accessibility certification.
- The tested 320, 390, 768, and 1280 CSS-pixel layouts have no horizontal overflow, and the revised heading fits its container.
- Pause/resume does not change page height. WebGL failure, reduced-motion simulation, and JavaScript failure retain all 18 websites and 25 apps. The OS reduced-motion CSS and no-JavaScript layout shorten the optional passage; an ordinary pause does not cause a layout jump.
- The same 30-frame-per-second and 1.6-million-pixel caps remain, with fewer stars/samples on smaller or lower-power devices. Sustained physical-phone performance and battery use were not measured.

The design-critique process drove the closer camera, earlier full-screen arrival, interaction cue, and preservation of readable content. This preview still requires the owner's publication approval.

## Follow-up: arrival at a single world — September 8

The owner requested an even closer destination, almost at a single star or planet. The design review identified the remaining gap: the previous journey enlarged the galaxy but did not arrive at an individual object. The new ending approaches an original blue-green ringed planet, illuminated by a nearby star, while preserving the successful opening composition and portfolio navigation.

- One continuous perspective camera transitions from the galactic flyby into an exponential approach. The final position is 1.85 planet radii from its center on desktop and 3.15 on phones, allowing a large foreground world without moving through its surface.
- The planet has procedural cloud bands and storm detail, a shaded day/night boundary, and an atmospheric rim. Its rings pass correctly in front of and behind it and receive the planet's shadow. Opaque planet shading prevents background stars from showing through its night side.
- The star has a visible photosphere and corona during the approach. The galaxy's brightness recedes as the local star system becomes the focal point. These are original artistic objects, not representations of a verified exoplanet or a physically scaled astronomical journey.
- The rendering adds one composited pass only when the approach begins. It keeps the existing frame/resolution limits, reduces fine surface sampling on small/lower-power devices, and introduces no remote texture, runtime dependency, or paid service.
- The four visual phases now distinguish the wide view, spiral passage, nearby star, and final planetary arrival. Direct collection links, existing text hierarchy, and motion controls remain intact.
- 85 automated tests pass, including new checks for approach continuity, planet clearance under extreme pointer input, mobile framing distance, and pausing the additional rendering pass. Existing catalog, support, policy-integrity, and QR checks still pass. The generated build is current and the whitespace check passes.
- The desktop and narrow-screen close-up were visually reviewed. The 320, 390, 768, and 1280 CSS-pixel layouts have no horizontal overflow. Desktop and phone-width accessibility scans report no automatic violations; complex-background contrast still requires human judgment. Pause/resume returns to its original state without changing the page height.
- WebGL failure, reduced-motion simulation, and JavaScript failure retain all 18 websites and 25 apps. No broken graphics effect replaces the underlying portfolio content.

These checks were performed on the unpublished local preview before the owner's publication approval. Sustained physical-device performance and a full manual assistive-technology audit remain outside the verification performed here.
