import test from 'node:test';
import assert from 'node:assert/strict';
import { createGalaxy, galaxyView, galaxyProgress, systemArrival, PLANET_CENTER, PLANET_RADIUS } from '../assets/galaxy.js';

function environment({ shaderOK = true } = {}) {
  const descriptors = new Map();
  const define = (name, value) => { descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name)); Object.defineProperty(globalThis, name, { value, writable: true, configurable: true }); };
  const frames = new Map(), events = new Map(), classes = new Set(), uniforms = new Map();
  let frameId = 0, draws = 0;
  const document = { hidden: false, addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) };
  define('innerWidth', 1440); define('innerHeight', 900); define('devicePixelRatio', 3);
  define('navigator', { hardwareConcurrency: 8 }); define('document', document);
  define('window', { addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) });
  define('requestAnimationFrame', callback => { frames.set(++frameId, callback); return frameId; });
  define('cancelAnimationFrame', id => frames.delete(id));
  const noop = () => {};
  const gl = new Proxy({ getShaderParameter: () => shaderOK, getProgramParameter: () => true, createShader: () => ({}), createProgram: () => ({}), createBuffer: () => ({}), getAttribLocation: () => 0, getUniformLocation: (_, name) => name, uniform1f: (name,value) => uniforms.set(name,value), uniform3fv: (name,value) => uniforms.set(name,[...value]), drawArrays: () => { draws++; } }, { get: (object, key) => key in object ? object[key] : /^[A-Z_]+$/.test(String(key)) ? 1 : noop });
  const canvas = { width: 0, height: 0, getContext: () => gl, parentElement: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } }, addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) };
  return { canvas, frames, events, classes, uniforms, document, draws: () => draws, step(now) { const callbacks=[...frames.values()]; frames.clear(); callbacks.forEach(callback=>callback(now)); }, restore() { for (const [name, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } } };
}

test('unavailable WebGL returns the static fallback without throwing', () => {
  assert.equal(createGalaxy({ getContext: () => null }), null);
  assert.equal(createGalaxy({ getContext: () => { throw new Error('No GPU'); } }), null);
});
test('shader failure does not break the homepage', () => {
  const env = environment({ shaderOK: false });
  try { assert.equal(createGalaxy(env.canvas), null); assert.equal(env.frames.size, 0); assert.equal(env.classes.size, 0); } finally { env.restore(); }
});
test('reduced motion renders one two-pass still frame and schedules no animation', () => {
  const env = environment();
  try {
    const galaxy = createGalaxy(env.canvas, { reducedMotion: true });
    assert.equal(env.frames.size, 0); assert.equal(env.draws(), 2); assert.ok(env.classes.has('ready'));
    galaxy.update(500); galaxy.pointer(1, 1); assert.equal(env.frames.size, 0);
    assert.equal(env.canvas.width, 1600); // The dust renderer is capped at 1.6 million pixels.
    assert.equal(env.canvas.height, 1000);
    galaxy.destroy();
  } finally { env.restore(); }
});

test('camera flies substantially closer with a finite orthonormal perspective basis', () => {
  const first = galaxyView(0), last = galaxyView(1);
  assert.ok(last.camera[2] < first.camera[2] / 2);
  assert.notDeepEqual(last.camera, first.camera);
  const dot = (a,b) => a.reduce((sum,n,i) => sum+n*b[i],0);
  for (const p of [0,.2,.5,.8,1]) for (const mobile of [true,false]) {
    const view = galaxyView(p,mobile,[.8,-.6]);
    for (const v of Object.values(view)) assert.ok(v.every(Number.isFinite));
    for (const basis of [view.right,view.up,view.forward]) assert.ok(Math.abs(Math.hypot(...basis)-1)<1e-10);
    assert.ok(Math.abs(dot(view.right,view.up))<1e-10);
    assert.ok(Math.abs(dot(view.forward,view.up))<1e-10);
    assert.ok(Math.abs(dot(view.forward,view.right))<1e-10);
  }
  assert.deepEqual(galaxyView(-5),first); assert.deepEqual(galaxyView(8),last); assert.deepEqual(galaxyView(NaN),first);
});

test('pause really freezes the frame, including scroll and pointer input', () => {
  const env = environment();
  try {
    const galaxy = createGalaxy(env.canvas); galaxy.setMotion({paused:true}); const draws = env.draws();
    galaxy.update(600); galaxy.pointer(1,1); galaxy.setMotion({paused:true});
    assert.equal(env.draws(),draws); assert.equal(env.frames.size,0); galaxy.destroy();
  } finally { env.restore(); }
});

test('the dramatic flyby curves around the core and descends toward the star system', () => {
  const first=galaxyView(0), middle=galaxyView(.5), last=galaxyView(1);
  assert.ok(Math.hypot(...last.camera)<1.6);
  assert.ok(last.camera[2] <= .5);
  assert.ok(middle.camera[0]>Math.max(first.camera[0],last.camera[0])+1);
  for (let i=0;i<=100;i++) {
    const view=galaxyView(i/100);
    assert.ok(view.camera[2]>PLANET_CENTER[2]); assert.ok(view.forward[2]<0);
  }
});

test('the final camera is close to one planet without entering its surface at any pointer extreme', () => {
  for (const mobile of [false,true]) for (const x of [-1,0,1]) for (const y of [-1,0,1]) {
    const view=galaxyView(1,mobile,[x,y]);
    const distance=Math.hypot(...view.camera.map((v,i)=>v-PLANET_CENTER[i]));
    assert.ok(Math.abs(distance/PLANET_RADIUS-(mobile?3.15:1.85))<1e-10);
  }
  for(let i=0;i<=200;i++) {
    const view=galaxyView(i/200,false,[1,-1]);
    assert.ok(Math.hypot(...view.camera.map((v,j)=>v-PLANET_CENTER[j]))>PLANET_RADIUS*1.8);
  }
});

test('the star-system arrival blends continuously from the galactic camera', () => {
  assert.equal(systemArrival(0),0); assert.equal(systemArrival(.46),0); assert.equal(systemArrival(1),1);
  assert.equal(systemArrival(NaN),0);
  for(const p of [.46,.64,1]) {
    const before=galaxyView(p-.00001),after=galaxyView(p);
    assert.ok(Math.hypot(...after.camera.map((v,i)=>v-before.camera[i]))<.002);
  }
});

test('the planet adds one composited draw only on approach, and pause freezes that pass too', () => {
  const env=environment();
  try {
    const galaxy=createGalaxy(env.canvas);
    assert.equal(env.draws(),2); assert.equal(env.uniforms.get('uArrival'),0);
    galaxy.update(2200,3200);
    for(let i=1;i<=200;i++) env.step(i*40);
    const before=env.draws(); env.step(8040);
    assert.equal(env.draws()-before,3); assert.ok(env.uniforms.get('uArrival')>.99);
    galaxy.setMotion({paused:true}); const pausedDraws=env.draws(); galaxy.pointer(1,1); env.step(8080);
    assert.equal(env.draws(),pausedDraws); assert.equal(env.frames.size,0); galaxy.destroy();
  } finally { env.restore(); }
});

test('pointer look-around is noticeable but bounded, including invalid input', () => {
  const left=galaxyView(0,false,[-1,0]), right=galaxyView(0,false,[1,0]);
  assert.ok(right.camera[0]-left.camera[0]>1);
  assert.deepEqual(galaxyView(.5,false,[-99,99]),galaxyView(.5,false,[-1,1]));
  assert.deepEqual(galaxyView(.5,false,[NaN,Infinity]),galaxyView(.5));
});

test('foreground travel trails respond to scrolling and settle without continuous streaking', () => {
  const env=environment();
  try {
    const galaxy=createGalaxy(env.canvas);
    assert.equal(env.uniforms.get('uTravel'),0);
    galaxy.update(1400,3200); env.step(40);
    assert.ok(env.uniforms.get('uTravel')>0); assert.ok(env.uniforms.get('uTravel')<=1);
    for (let i=2;i<=180;i++) env.step(i*40);
    assert.ok(env.uniforms.get('uTravel')<.001);
    galaxy.setMotion({paused:true}); const value=env.uniforms.get('uTravel'); galaxy.update(0);
    assert.equal(env.uniforms.get('uTravel'),value); assert.equal(env.frames.size,0);
    galaxy.destroy();
  } finally { env.restore(); }
});

test('the closest view arrives while the full viewport is still inside the galaxy passage', () => {
  const env=environment();
  try {
    const galaxy=createGalaxy(env.canvas), end=3200;
    assert.equal(galaxyProgress(end-innerHeight*1.15,end,innerHeight),1);
    assert.equal(galaxyProgress(0,end,innerHeight),0);
    assert.equal(galaxyProgress(NaN,end,innerHeight),0);
    galaxy.update(end-innerHeight*1.15,end);
    for (let i=1;i<=200;i++) env.step(i*40);
    const actual=env.uniforms.get('uCamera'), expected=galaxyView(1).camera;
    actual.forEach((value,i)=>assert.ok(Math.abs(value-expected[i])<.00001));
    assert.ok(env.frames.size===1); galaxy.destroy();
  } finally { env.restore(); }
});

test('destroy is idempotent and cannot restart a render loop', () => {
  const env = environment();
  try {
    const galaxy = createGalaxy(env.canvas); galaxy.destroy(); galaxy.destroy();
    galaxy.update(0); galaxy.setMotion({paused:false}); assert.equal(env.frames.size,0); assert.equal(env.events.size,0);
  } finally { env.restore(); }
});

test('the scene uses the actual passage end rather than a fixed page height', () => {
  const env = environment();
  try {
    const galaxy = createGalaxy(env.canvas); galaxy.update(2800,3200); assert.equal(env.frames.size,1);
    galaxy.update(3600,3200); assert.equal(env.frames.size,0); galaxy.destroy();
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
    assert.equal(galaxy.available,false);
    galaxy.update(0); assert.equal(env.frames.size, 0); galaxy.destroy();
  } finally { env.restore(); }
});
