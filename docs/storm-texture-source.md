# Dark-world cloud texture

Created September 9, 2026 for the owner's request for finer, darker storm clouds and an Exegol-like atmosphere. This is original generated artwork, not a downloaded film still or game texture. The official visual reference was https://www.starwars.com/databank/exegol. No Star Wars branding, characters, ships, or names were added to the public website.

## Asset and method

- Built-in image-generation tool; no CLI/API fallback or new paid service.
- Production asset: `assets/storm-clouds-v2.jpg`.
- Native generated dimensions: **1254 × 1254**. The prompt requested 2048 × 2048, but the output did not have those dimensions; do not describe it as native 2K or 4K.
- Original generated PNG: `/Users/michaeldube/.codex/generated_images/01a06a2a-82f1-7801-beee-2745673f068d/exec-7026303e-78a5-4f93-8eaa-8fb6751c2978.png` (original retained).
- Production JPEG is a quality-90 format conversion using macOS `sips`, not a new artistic edit. The browser resamples into a 1024- or 2048-pixel power-of-two GPU texture for filtered mipmaps. That does not invent source detail.
- Three-axis blended mapping avoids globe-coordinate seams and polar pinching. Mirrored wrapping avoids a hard jump at tile boundaries; perfect source-edge continuity is not claimed.
- The asset loads only after travel begins, fades into the procedural fallback, uses no remote image service at runtime, and shares the generated release's cache version. Texture bytes are included in the build fingerprint.

## Final generation prompt

Use case: stylized-concept. Asset type: seamless grayscale storm-cloud texture for a real-time 3D planet shader, not a finished planet image. Create a photorealistic, production-quality 2048 x 2048 square overhead cloud-density map: turbulent cumulonimbus and layered anvil clouds viewed straight down from orbit, large continuous storm fronts, smaller billowing towers, delicate feathered cirrus edges, smooth flowing folds, dark cavities and thin drifting veils. Intricate natural detail at several scales, convincing soft volumetric depth. Overall ominous, oppressive storm-world atmosphere. Render in neutral grayscale: cloud masses silver-gray, thick tops pale gray, gaps charcoal to black. Balanced local shading with no strong directional sun. The entire image is a continuous flat cloud field, all four edges seamlessly tile, no focal central hurricane, no repeating patterns. No sphere, horizon, stars, space background, terrain, rocks, cities, spacecraft, lightning bolts, sparks, text, logos, borders, or watermark. Avoid coarse noise, crystalline textures, oversharpening, painterly strokes, grain, pixelation and fluffy cartoon blobs. This will be mapped onto a dark planet, independently lit and animated in code.

## Rendering direction

The design review favored discernible storm fronts and fine internal structure over high-contrast procedural grain. The cloud deck is sampled above the surface, with a separately drifting veil and offset cloud-shadow sampling. The surface, light, rings, and atmospheric halo use a restrained charcoal/blue-violet palette. Regional storm coverage and isolated, soft lightning events remain in place.

The planet reveal begins at 70% of journey progress (previously 76%). The final approach begins slightly earlier; galactic dust and stars recede over a longer overlap. The tiny initial planet scale and the final orbital viewing distances are retained.

Publication was authorized by the owner on September 9 after requesting final visual checks. This source record is not a production release receipt.
