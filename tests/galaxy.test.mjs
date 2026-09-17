import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createGalaxy, galaxyView, galaxyProgress, systemArrival, systemReveal, stormRegion, stormFlash, FLASH_INTERVAL_SECONDS, PLANET_CENTER, PLANET_RADIUS, STORM_TEXTURE_URL, CITY_DISTRICTS, CITY_TOWER_TOPS, CITY_LIGHT_PALETTE, CITY_SKYLINE } from '../assets/galaxy.js';

function environment({ shaderOK = true } = {}) {
  const descriptors = new Map();
  const define = (name, value) => { descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name)); Object.defineProperty(globalThis, name, { value, writable: true, configurable: true }); };
  const frames = new Map(), events = new Map(), classes = new Set(), uniforms = new Map(), images=[], uploads=[];
  let frameId = 0, draws = 0, deletedTextures=0, mipmaps=0;
  const document = { hidden: false, createElement: () => ({getContext:()=>({drawImage:()=>{}})}), addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) };
  define('Image',class { constructor() { images.push(this); } });
  define('innerWidth', 1440); define('innerHeight', 900); define('devicePixelRatio', 3);
  define('navigator', { hardwareConcurrency: 8 }); define('document', document);
  define('window', { addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) });
  define('requestAnimationFrame', callback => { frames.set(++frameId, callback); return frameId; });
  define('cancelAnimationFrame', id => frames.delete(id));
  const noop = () => {};
  const gl = new Proxy({ createTexture:()=>({}),deleteTexture:()=>deletedTextures++,texImage2D:(...values)=>uploads.push(values),generateMipmap:()=>mipmaps++,getShaderParameter: () => shaderOK, getProgramParameter: () => true, createShader: () => ({}), createProgram: () => ({}), createBuffer: () => ({}), getAttribLocation: () => 0, getUniformLocation: (_, name) => name, uniform1f: (name,value) => uniforms.set(name,value), uniform3fv: (name,value) => uniforms.set(name,[...value]), uniform4fv: (name,value) => uniforms.set(name,[...value]), drawArrays: () => { draws++; } }, { get: (object, key) => key in object ? object[key] : /^[A-Z_]+$/.test(String(key)) ? 1 : noop });
  const canvas = { width: 0, height: 0, getContext: () => gl, parentElement: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } }, addEventListener: (type, callback) => events.set(type, callback), removeEventListener: type => events.delete(type) };
  return { canvas, frames, events, classes, uniforms, document, images,uploads,deletedTextures:()=>deletedTextures,mipmaps:()=>mipmaps,draws: () => draws, step(now) { const callbacks=[...frames.values()]; frames.clear(); callbacks.forEach(callback=>callback(now)); }, restore() { for (const [name, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } } };
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
  assert.equal(systemArrival(0),0); assert.equal(systemArrival(.55),0); assert.equal(systemArrival(1),1);
  assert.equal(systemArrival(NaN),0);
  for(const p of [.46,.55,.64,.70,.775,.9,.98,1]) {
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

test('the weather region covers about two fifths of the sphere, leaving calmer surface elsewhere', () => {
  let coverage=0;
  for(let i=0;i<10000;i++) {
    const z=1-2*(i+.5)/10000, r=Math.sqrt(1-z*z), angle=i*Math.PI*(3-Math.sqrt(5));
    coverage+=stormRegion([r*Math.cos(angle),r*Math.sin(angle),z]);
  }
  assert.ok(coverage/10000>.38&&coverage/10000<.41);
});

test('three separated settlements stay in the storm region with barely exposed crowns', () => {
  assert.equal(CITY_DISTRICTS.length,3); assert.equal(CITY_TOWER_TOPS.length,3);
  assert.ok(Object.isFrozen(CITY_DISTRICTS)&&Object.isFrozen(CITY_TOWER_TOPS));
  let footprint=0;
  for(const [i,city] of CITY_DISTRICTS.entries()) {
    assert.ok(Object.isFrozen(city)&&Object.isFrozen(city.center));
    assert.ok(city.center.every(Number.isFinite)); assert.ok(stormRegion(city.center)>.99);
    assert.ok(city.size>.05&&city.size<.16); footprint+=city.size**2/4;
    for(const other of CITY_DISTRICTS.slice(i+1)) {
      const normalized=c=>c.center.map(v=>v/Math.hypot(...c.center));
      assert.ok(Math.hypot(...normalized(city).map((v,k)=>v-normalized(other)[k]))>city.size+other.size);
    }
  }
  assert.ok(footprint<.015,'Cities occupy a small part of the world, not a planet-wide grid.');
  for(const height of CITY_TOWER_TOPS) assert.ok(height>.018&&height<=.026);
});

test('only one restrained crown per settlement remains with muted light colors', () => {
  assert.equal(CITY_SKYLINE.length,1); assert.ok(Object.isFrozen(CITY_SKYLINE));
  assert.deepEqual(CITY_SKYLINE[0].offset,[0,0]); assert.equal(CITY_SKYLINE[0].height,1);
  for(const tower of CITY_SKYLINE) {
    assert.ok(Object.isFrozen(tower)&&Object.isFrozen(tower.offset));
    assert.ok(tower.height>0&&tower.height<=1); assert.ok(tower.width>.001&&tower.width<.003);
    assert.deepEqual(tower.offset,[0,0],'The tiny crown stays in the settlement center.');
  }
  assert.equal(CITY_DISTRICTS.length*CITY_SKYLINE.length,3,'The miniature skyline clusters are removed.');
  assert.equal(CITY_LIGHT_PALETTE.length,4); assert.ok(Object.isFrozen(CITY_LIGHT_PALETTE));
  for(const color of CITY_LIGHT_PALETTE) {
    assert.ok(Object.isFrozen(color)); assert.equal(color.length,3);
    assert.ok(color.every(n=>Number.isFinite(n)&&n>=0&&n<=1));
    assert.ok(Math.max(...color)-Math.min(...color)<.5,'City colors remain muted rather than neon.');
  }
  assert.equal(new Set(CITY_LIGHT_PALETTE.map(c=>c.join(','))).size,4);
});

test('cities use filtered surface detail, cloud transmission, and depth-tested radial towers', async () => {
  const source=await readFile(new URL('../assets/galaxy.js',import.meta.url),'utf8');
  assert.match(source,/vec3 p=planetFrame\(normal\)/);
  assert.match(source,/vec3 cp=planetFrame\(cloudNormal\)/);
  assert.match(source,/float transmission=exp\(-cover\*4\.0\)/);
  assert.match(source,/mix\(color,neighborhood\*\.031,smoothstep\(\.12,\.85,pixel\)\)/);
  assert.doesNotMatch(source,/float floors|floors=mix|float ribs|occupied=mix/,'Visible facade detail must not return.');
  assert.match(source,/cityLights\/\(1\.\+cityLights\*3\.5\)/,'Soft highlight rolloff prevents sharp luminous cutouts.');
  assert.match(source,/part\.w>0\.&&part\.w<ground/);
  assert.match(source,/smoothstep\(\.0175,\.024,point\.z\)/);
  assert.match(source,/for\(int tier=0;tier<2;tier\+\+\)/);
  assert.match(source,/inout float ground/);
  assert.match(source,/ground=hit\.w/,'The crown must respect the shared depth limit.');
  const env=environment();
  try {
    const galaxy=createGalaxy(env.canvas); galaxy.update(2200,3200);
    for(let i=1;i<=200;i++) env.step(i*40);
    const draws=env.draws(); env.step(8040); assert.equal(env.draws()-draws,3);
    assert.equal(env.uniforms.get('uPixelSpan'),2/(1.85*env.canvas.height));
    galaxy.destroy();
  } finally { env.restore(); }
});

test('city growth uses warped neighborhoods and offset lights without a repeated street grid', async () => {
  const source=await readFile(new URL('../assets/galaxy.js',import.meta.url),'utf8');
  const city=source.slice(source.indexOf('vec3 cityWindows('),source.indexOf('// Ray/box intersection'));
  assert.match(city,/shift=vec2\(hash3/,'Individual light positions must not sit at regular cell centers.');
  assert.match(city,/vec2 q=uv\+\(vec2\(noise3/,'Street and light coordinates follow the same nonlinear warp.');
  assert.match(city,/growth=exp\(-dot\(a,a\)/,'The footprint has several asymmetric growth centers.');
  assert.match(city,/city\*=smoothstep\(\.025,\.085,cut\)/,'Dark undeveloped gaps interrupt the urban footprint.');
  assert.doesNotMatch(city,/float route|float feeders|float streets/,'Road-level linework is not drawn at orbital distance.');
  assert.match(city,/downtown=exp\(-dot\(uv,uv\)\*24\.\)/,'The brightest core is centered on the main tower base.');
  assert.equal((city.match(/cityWindows\(q\*/g)||[]).length,2,'Two softened light fields suggest settlement density.');
  assert.match(city,/cityTint\(hash3/,'Individual lights use the multi-color palette.');
  assert.doesNotMatch(city,/avenues=abs\(fract|blocks=uv\*|inCell=fract|hubPoint=fract/);
  assert.doesNotMatch(city,/uTime/,'City lights must stay steady instead of flickering randomly each frame.');
});

test('lightning frequency is 50–75 percent higher than the previous 0.82-second schedule', () => {
  const increase=.82/FLASH_INTERVAL_SECONDS-1;
  assert.ok(increase>=.5&&increase<=.75);
  assert.equal(FLASH_INTERVAL_SECONDS,.5);
});

test('near-continuous cloud glows vary timing and position while retaining short dark gaps', () => {
  for(const value of [NaN,Infinity,-Infinity,-5,0]) assert.equal(stormFlash(value)[3],0);
  const positions=new Set(), onsets=new Set(), durations=new Set();
  const steps=Math.round(FLASH_INTERVAL_SECONDS*1000);
  const darkTailSteps=Math.floor(steps*.02), maxStepChange=1.5/(steps*.195)+.0001;
  let activeSamples=0;
  for(let slot=0;slot<100;slot++) {
    let previous=0, rises=0, first=-1, last=-1;
    for(let step=0;step<steps;step++) {
      const [x,y,z,value]=stormFlash(slot*FLASH_INTERVAL_SECONDS+step/1000);
      assert.ok(value>=0&&value<=1); assert.ok(Math.abs(value-previous)<maxStepChange);
      if(previous<=.5&&value>.5) rises++;
      if(value>0) {
        activeSamples++; if(first<0) first=step; last=step;
        assert.ok(stormRegion([x,y,z])>.99); assert.ok(Math.abs(Math.hypot(x,y,z)-1)<1e-10);
      }
      if(step>=steps-darkTailSteps) assert.equal(value,0,'Every event ends before a new position can light.');
      previous=value;
    }
    assert.equal(rises,1);
    assert.ok(first>0&&last<steps-darkTailSteps);
    onsets.add(first); durations.add(last-first);
    positions.add(stormFlash((slot+.6)*FLASH_INTERVAL_SECONDS).slice(0,3).join(','));
  }
  assert.equal(positions.size,100);
  assert.ok(onsets.size>steps*.05&&durations.size>steps*.02,'Both onset and duration must vary.');
  const activeFraction=activeSamples/(100*steps);
  assert.ok(activeFraction>.85&&activeFraction<.90,'A patch glows for most of the cycle, with a brief dark interval.');
});

test('orbital lightning is diffuse cloud illumination, with no drawn bolts or global flash envelope', async () => {
  const source=await readFile(new URL('../assets/galaxy.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/strikePath|uStormPulse|float trunk|float fork/);
  assert.match(source,/cloudLight\(cp\)\*max\(cover,\.35\*region\)/);
  assert.match(source,/exp\(-distance2\*1900\.\)/);
});

test('the planet is tiny at first reveal, after a much deeper descent, without changing final scale', () => {
  const distance=p=>Math.hypot(...galaxyView(p).camera.map((v,i)=>v-PLANET_CENTER[i]));
  assert.equal(PLANET_RADIUS,.000075);
  assert.equal(systemReveal(.70),0); assert.ok(systemReveal(.74)>.5); assert.equal(systemReveal(1),1); assert.equal(systemReveal(NaN),0);
  assert.ok(distance(.55)/distance(.775)>50,'The world stays at stellar scale through the overlapping reveal.');
  for(const p of [.70,.74,.775,.79]) {
    const apparentHeight=1.85*PLANET_RADIUS/Math.sqrt(distance(p)**2-PLANET_RADIUS**2);
    assert.ok(apparentHeight<.03,'The first visible world must occupy less than 3% of viewport height.');
  }
  assert.ok(distance(.80)/distance(.90)>15,'Magnification accelerates rapidly through the final approach.');
  for(const mobile of [true,false]) for(const p of [.70,.8,.86,.94,1]) {
    const view=galaxyView(p,mobile);
    const direction=view.camera.map((v,i)=>PLANET_CENTER[i]-v), length=Math.hypot(...direction);
    assert.ok(view.forward.reduce((sum,v,i)=>sum+v*direction[i]/length,0)>.999999);
  }
});

test('local cloud detail loads only after travel begins, fades in, and uses filtered mipmaps', () => {
  const env=environment();
  try {
    const galaxy=createGalaxy(env.canvas);
    assert.equal(env.images.length,0); assert.equal(env.uploads.length,1);
    galaxy.update(2200,3200); for(let i=1;i<=50;i++) env.step(i*40);
    assert.equal(env.images.length,1); assert.equal(env.images[0].src,STORM_TEXTURE_URL);
    assert.equal(env.uniforms.get('uCloudBlend'),0);
    env.images[0].onload(); assert.equal(env.uploads.length,2); assert.equal(env.mipmaps(),1);
    assert.equal(env.uploads[1].at(-1).width,2048);
    env.step(2040); assert.ok(env.uniforms.get('uCloudBlend')>0&&env.uniforms.get('uCloudBlend')<.1);
    for(let i=52;i<=150;i++) env.step(i*40);
    assert.ok(env.uniforms.get('uCloudBlend')>.99);
    galaxy.destroy(); assert.equal(env.deletedTextures(),1); assert.equal(env.images[0].onload,null);
  } finally { env.restore(); }
});

test('failed, hidden, paused, or late cloud loads cannot restart motion or break procedural fallback', () => {
  const env=environment();
  try {
    const galaxy=createGalaxy(env.canvas); galaxy.update(2200,3200);
    for(let i=1;i<=60;i++) env.step(i*40);
    env.images[0].onerror(); assert.equal(env.uniforms.get('uCloudBlend'),0);
    env.document.hidden=true; env.events.get('visibilitychange')(); const hiddenDraws=env.draws();
    env.images[0].onload(); env.step(8000); assert.equal(env.draws(),hiddenDraws); assert.equal(env.frames.size,0);
    env.document.hidden=false; env.events.get('visibilitychange')();
    galaxy.setMotion({paused:true}); const draws=env.draws(); env.images[0].onload(); env.step(9000);
    assert.equal(env.draws(),draws); assert.equal(env.frames.size,0);
    const late=env.images[0].onload; galaxy.destroy(); const uploads=env.uploads.length; late();
    assert.equal(env.uploads.length,uploads); assert.equal(env.frames.size,0);
  } finally { env.restore(); }
});

test('phone artwork is sharper without exceeding the pixel budget; reduced motion skips the texture', () => {
  const env=environment();
  try {
    globalThis.innerWidth=390; globalThis.innerHeight=844;
    const galaxy=createGalaxy(env.canvas,{reducedMotion:true});
    assert.equal(env.canvas.width,683); assert.equal(env.canvas.height,1477);
    assert.ok(env.canvas.width*env.canvas.height<1600000);
    galaxy.update(2200,3200); env.step(2000); assert.equal(env.images.length,0); galaxy.destroy();
  } finally { env.restore(); }
});

test('cloud and lightning time freeze when paused or hidden, including resize', () => {
  const env=environment();
  try {
    const galaxy=createGalaxy(env.canvas); galaxy.update(2200,3200);
    for(let i=1;i<=96;i++) env.step(i*40);
    assert.equal(env.uniforms.get('uFlash').length,4);
    assert.ok(env.uniforms.get('uFlash')[3]>0,'Pause must also preserve an actively illuminated patch.');
    const time=env.uniforms.get('uTime'),flash=env.uniforms.get('uFlash');
    galaxy.setMotion({paused:true}); const draws=env.draws();
    env.step(5000); galaxy.update(800); galaxy.pointer(-1,1);
    assert.equal(env.draws(),draws); assert.equal(env.uniforms.get('uTime'),time);
    env.events.get('resize')();
    assert.deepEqual(env.uniforms.get('uFlash'),flash); assert.equal(env.uniforms.get('uTime'),time);
    galaxy.setMotion({paused:false}); env.document.hidden=true; env.events.get('visibilitychange')(); env.step(6000);
    assert.equal(env.uniforms.get('uTime'),time); assert.equal(env.frames.size,0);
    env.document.hidden=false; env.events.get('visibilitychange')(); env.step(10000);
    assert.equal(env.uniforms.get('uTime'),time,'Returning to a tab must not jump the storm clock.');
    galaxy.destroy();
  } finally { env.restore(); }
});

test('reduced motion begins without lightning and does not advance its clock', () => {
  const env=environment();
  try {
    const galaxy=createGalaxy(env.canvas,{reducedMotion:true});
    galaxy.update(2200,3200); env.step(10000); env.events.get('resize')();
    assert.equal(env.uniforms.has('uFlash'),false); assert.equal(stormFlash(0)[3],0); assert.equal(env.uniforms.get('uTime'),0);
    assert.equal(env.frames.size,0); galaxy.destroy();
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
