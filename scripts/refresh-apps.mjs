import { readFile, writeFile } from 'node:fs/promises';
import { APPLE_LOOKUP, normalizeApps } from '../assets/catalog.js';

const path = new URL('../data/apps.json', import.meta.url);
const previous = JSON.parse(await readFile(path, 'utf8'));
const response = await fetch(APPLE_LOOKUP, { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`Apple lookup failed: ${response.status}`);
const apps = normalizeApps(await response.json(), previous.apps);
// Refuse a surprising shrink: review removals before changing the saved catalog.
if (apps.length < previous.apps.length) throw new Error('The App Store returned fewer apps. Review removals manually; the snapshot was not changed.');
await writeFile(path, `${JSON.stringify({ ...previous, verifiedAt: new Date().toISOString().slice(0, 10), apps }, null, 2)}\n`);
console.log(`Saved ${apps.length} verified apps. Review new descriptions, then run npm run build and npm test.`);
