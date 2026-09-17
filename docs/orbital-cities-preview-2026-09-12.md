# Orbital cities — September 16, 2026 release notes

The owner approved publication on September 16, 2026 after reviewing the local preview. Preview work began from commit `5acdcc6`; release preparation preserves the subsequent Plankwise privacy and terms addition in `dfb3fb0`. The original request added cities beneath the clouds. September 13 feedback simplified excessive detail to restore a distant orbital impression. On September 16, the owner approved that appearance and requested only 50–75% more lightning occurrences; the interval now gives 64% more events. AppFactory copy, navigation, catalogs, branding, and legal/support wording remain unchanged by this release.

## Artwork

- Three separate districts are anchored to the rotating planet, not to the screen. They occupy a small part of the sphere, leaving the dark world and storm front dominant.
- Two filtered light fields suggest population without making individual streets legible. Muted warm, icy-blue, and violet tones blend gradually; earlier saturation and sharp light boundaries are reduced. Asymmetric growth centers, irregular outskirts, and dark gaps remain. Stronger cloud attenuation and soft highlight rolloff keep the lights subordinate to the cloud cover.
- The nine-building miniature skyline is replaced by one tiny crown per settlement. Heights are now 0.026, 0.024, and 0.023 planet radii, just above the existing 1.018-radius cloud shell; width is 0.0022 radii. Only two simple tiers remain, with very faint crown light. All facade stripes, lit floors, and ribs are removed. Radial intersections, ground-depth checks, cloud concealment, and distance fading remain. Proportions are artistic, not an astronomical or engineering-scale model.
- The night palette, cloud artwork, rings, camera path, and final viewing distances are retained. Lightning remains localized with unchanged brightness and spatial distribution. Its interval is now 0.5 seconds instead of 0.82 seconds, with jittered 0.4275–0.4425-second glows and a brief dark gap. A cycle-relative fade prevents the faster events from overlapping or being abruptly cut off. No film artwork, new raster texture, third-party dependency, or additional network request was added.
- Earlier review removed aligned grids and round growth masks; the subsequent dense/tall version introduced too much readable architecture. The latest design review prioritizes viewing scale: settlement glow instead of miniature buildings. The original detailed storm clouds are not blurred or replaced, and no random per-frame city flicker is introduced.

## Engineering boundaries

- City work remains within the existing third compositing pass. The same pixel cap, frame-rate cap, motion clock, pause controls, reduced-motion handling, and hidden-tab stop behavior apply.
- Unresolved lights blend into averages earlier, and tiny crowns fade rather than turning into sharp subpixel lines. Explicit road and facade detail is no longer rendered.
- Uncompressed generated JavaScript is 100,729 bytes (asset version `6abd67befcf3`). The 101,000-byte ceiling remains in place. Frame-rate, pixel-fill, draw-pass, and external-dependency limits remain unchanged.
- Generated homepage and support files differ only in shared asset-version references. Source content files and existing artwork are unchanged.

## Verification

- Release preflight on September 16 reran the production build, current-build check, all 102 tests, and `git diff --check` successfully. The GitHub Pages source was confirmed as `website` at `/`, with the existing `andromedakinship.com` domain. These are pre-publication checks; deployment completion also requires a matching provider build and independent live-asset verification.
- 102 automated tests pass, including the requested frequency increase, smooth lightning fades and dark gaps, settlement spacing/coverage, bounded tiny crowns, muted colors, shared surface transforms, cloud masking, filtered lights, ground-depth checks, the unchanged three-pass renderer, and regression checks excluding visible street/facade detail.
- Desktop and fresh 390-pixel phone previews compiled and rendered the new artwork without reported graphics errors. No phone horizontal overflow was observed. Approach and close-up views were inspected; this is browser viewport testing, not a physical-device battery/performance certification.
- Existing tests continue to cover pause/resize/hidden-tab behavior, texture failure, reduced motion, catalog/QR behavior, and all 42 policy-content fingerprints.
- The earlier September 12 manual pause check kept scene time and render count unchanged; automated pause tests still pass after simplification. The temporary phone viewport override was reset after inspection.
