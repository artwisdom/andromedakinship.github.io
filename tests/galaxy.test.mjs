import test from 'node:test';
import assert from 'node:assert/strict';
import { createGalaxy } from '../assets/galaxy.js';

function environment({ shaderOK = true } = {}) {
  const descriptors = new Map();
  const define = (name, value) => { descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name)); Object.defineProperty(globalThis, name, { value, writable: true, configurable: true }); };
  const frames = new Map(), events = new Map(), classes = new Set();
  let frameId = 0, draws = 0;
  const document = { hidden: false, addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) };
  define('innerWidth', 1440); define('innerHeight', 900); define('devicePixelRatio', 3);
  define('navigator', { hardwareConcurrency: 8 }); define('document', document);
  define('window', { addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) });
  define('requestAnimationFrame', callback => { frames.set(++frameId, callback); return frameId; });
  define('cancelAnimationFrame', id => frames.delete(id));
  const noop = () => {};
  const gl = new Proxy({ getShaderParameter: () => shaderOK, getProgramParameter: () => true, createShader: () => ({}), createProgram: () => ({}), createBuffer: () => ({}), getAttribLocation: () => 0, getUniformLocation: (_, name) => name, drawArrays: () => { draws++; } }, { get: (object, key) => key in object ? object[key] : /^[A-Z_]+$/.test(String(key)) ? 1 : noop });
  const canvas = { width: 0, height: 0, getContext: () => gl, parentElement: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } }, addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) };
  return { canvas, frames, events, classes, document, draws: () => draws, restore() { for (const [name, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } } };
}

test('unavailable WebGL returns the static fallback without throwing', () => {
  assert.equal(createGalaxy({ getContext: () => null }), null);
  assert.equal(createGalaxy({ getContext: () => { throw new Error('No GPU'); } }), null);
});
test('shader failure does not break the homepage', () => {
  const env = environment({ shaderOK: false });
  try { assert.equal(createGalaxy(env.canvas), null); assert.equal(env.frames.size, 0); assert.equal(env.classes.size, 0); } finally { env.restore(); }
});
test('reduced motion renders one still frame and schedules no animation', () => {
  const env = environment();
  try {
    const galaxy = createGalaxy(env.canvas, { reducedMotion: true });
    assert.equal(env.frames.size, 0); assert.equal(env.draws(), 1); assert.ok(env.classes.has('ready'));
    galaxy.update(500); galaxy.pointer(1, 1); assert.equal(env.frames.size, 0);
    assert.equal(env.canvas.width, 2160); // Desktop DPR capped at 1.5, not the device's 3.
    galaxy.destroy();
  } finally { env.restore(); }
});
test('pause and resume cancel and restart exactly one frame loop', () => {
  const env = environment();
  try {
    const galaxy = createGalaxy(env.canvas); assert.equal(env.frames.size, 1);
    galaxy.setMotion({ paused: true }); assert.equal(env.frames.size, 0);
    galaxy.setMotion({ paused: false }); galaxy.update(0); assert.equal(env.frames.size, 1);
    galaxy.destroy(); assert.equal(env.frames.size, 0);
  } finally { env.restore(); }
});
test('scrolling below the scene and hiding the tab both stop rendering', () => {
  const env = environment();
  try {
    const galaxy = createGalaxy(env.canvas); galaxy.update(3000); assert.equal(env.frames.size, 0);
    galaxy.update(0); assert.equal(env.frames.size, 1);
    env.document.hidden = true; env.events.get('visibilitychange')(); assert.equal(env.frames.size, 0);
    env.document.hidden = false; env.events.get('visibilitychange')(); assert.equal(env.frames.size, 1);
    galaxy.destroy();
  } finally { env.restore(); }
});
test('a lost graphics context restores the fallback and stops the loop', () => {
  const env = environment();
  try {
    const galaxy = createGalaxy(env.canvas); let prevented = false;
    env.events.get('webglcontextlost')({ preventDefault() { prevented = true; } });
    assert.ok(prevented); assert.equal(env.frames.size, 0); assert.ok(!env.classes.has('ready'));
    galaxy.update(0); assert.equal(env.frames.size, 0); galaxy.destroy();
  } finally { env.restore(); }
});
