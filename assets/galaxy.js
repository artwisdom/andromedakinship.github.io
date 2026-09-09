// Original 3D artwork, not an astronomical simulation. Luminous dust, dark lanes
// and a nearby star system share one perspective camera. Native scroll moves it.
export const PLANET_CENTER = Object.freeze([.28,1.32,.16]);
export const PLANET_RADIUS = .075;
const quadVertex = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() { vUv = aPosition * .5 + .5; gl_Position = vec4(aPosition, 0., 1.); }
`;
const cameraUniforms = `
uniform vec3 uCamera, uRight, uUp, uForward;
uniform vec2 uOffset;
uniform float uAspect, uTime, uProgress, uDpr, uMobile, uTravel, uArrival;
`;
const dustFragment = `
precision highp float;
varying vec2 vUv;
${cameraUniforms}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + 1.), f.x), f.y);
}
float clouds(vec2 p) { return noise(p) * .56 + noise(p * 2.13 + 7.1) * .29 + noise(p * 4.57) * .15; }
void main() {
  vec2 uv = (vUv * 2. - 1. - uOffset) * vec2(uAspect, 1.) / 1.85;
  vec3 ray = normalize(uForward + uv.x * uRight + uv.y * uUp);
  // Intersect both faces of the dust volume: once inside, rays above the plane
  // still see nearby clouds rather than a hard, artificial horizon cutout.
  float rayZ = abs(ray.z) < .001 ? (ray.z < 0. ? -.001 : .001) : ray.z;
  float slabA = (-1.4 - uCamera.z) / rayZ;
  float slabB = (1.4 - uCamera.z) / rayZ;
  float entry = max(0., min(slabA,slabB));
  float leave = min(30., max(slabA,slabB));
  if (leave <= entry) { gl_FragColor = vec4(.002,.004,.011,1); return; }
  float steps = mix(12., 8., uMobile);
  float stepLength = min(1.2, (leave - entry) / steps);
  float angle = uTime * .007 + uProgress * .32;
  mat2 spin = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec3 light = vec3(0.); float transmission = 1.;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= steps) break;
    vec3 p = uCamera + ray * (entry + (float(i) + .5) * stepLength);
    p.xy = spin * p.xy;
    float r = length(p.xy);
    float warp = noise(p.xy * .8 + p.z * .45);
    float spiral = atan(p.y, p.x) - r * 1.08 + sin(r * .7) * .22 + (warp - .5) * .46;
    float arm = pow(.5 + .5 * cos(spiral * 2.), 4.);
    // Multiple detail scales stay visible as the camera enters the inner arms.
    float grain = clouds(p.xy * 3.1 + p.z * vec2(1.7,-1.2));
    float fine = noise(p.xy * 17. + p.z * 5.);
    float disk = exp(-abs(p.z) * 5.3) * exp(-r * .24) * (1. - smoothstep(6., 8.4, r));
    float wisps = (.11 + arm * 1.9) * (.12 + pow(grain, 1.6) * 2.5) * disk;
    float filament = pow(max(0., 1. - abs(grain - .52) * 9.), 3.) * arm * disk;
    float core = exp(-r * r * 2.2 - p.z * p.z * 4.);
    float lane = pow(.5 + .5 * cos(spiral * 2. + .46 + (grain - .5) * .55), 15.) * disk * (grain + fine * .7) * 3.5;
    vec3 color = mix(vec3(1., .48, .18), vec3(.12, .38, 1.), smoothstep(.55, 3.4, r));
    color = mix(color, vec3(.78, .19, .53), smoothstep(.61, .82, grain) * smoothstep(1.3, 4., r) * .72);
    vec3 emission = color * wisps * 2.1 + vec3(.28,.62,1.) * filament * .42 + vec3(1.,.73,.37) * core * 4.2;
    light += transmission * emission * stepLength;
    transmission *= exp(-(wisps * .3 + lane) * stepLength);
  }
  float closest = max(0., dot(-uCamera, ray));
  float coreDistance = length(uCamera + ray * closest);
  light += vec3(.26, .14, .07) * exp(-coreDistance * 1.7);
  // A restrained anamorphic glow is anchored to the actual projected core.
  float coreDepth = max(.1, dot(-uCamera, uForward));
  vec2 coreScreen = vec2(dot(-uCamera,uRight) / uAspect, dot(-uCamera,uUp)) * 1.85 / coreDepth + uOffset;
  vec2 flare = (vUv * 2. - 1. - coreScreen) * vec2(uAspect,1.);
  light += vec3(.3,.48,.8) * exp(-abs(flare.y) * 110.) * exp(-abs(flare.x) * 1.15) * .32;
  light = 1. - exp(-light * 1.35);
  gl_FragColor = vec4(light * mix(1.,.14,uArrival), 1.);
}`;
const starVertex = `
attribute vec3 aPosition, aColor;
attribute float aSize;
${cameraUniforms}
varying vec3 vColor;
varying float vOpacity, vBright, vStretch;
varying vec2 vAxis;
void main() {
  vec3 p = aPosition;
  bool field = aSize > 20.;
  if (!field) {
    float angle = -(uTime * .007 + uProgress * .32);
    p.xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xy;
  }
  vec3 relative = p - uCamera;
  float depth = dot(relative, uForward);
  vec2 projected = vec2(dot(relative, uRight) * 1.85 / uAspect, dot(relative, uUp) * 1.85);
  gl_Position = vec4(projected + uOffset * depth, 0., depth);
  float size = field ? aSize - 20. : aSize;
  vStretch = field ? 1. + uTravel * 3.8 : 1.;
  vAxis = normalize(projected + vec2(.0001));
  gl_PointSize = clamp(size * uDpr * 9. * sqrt(vStretch) / max(.35, depth), .65, mix(56.,40.,uMobile) * uDpr);
  vOpacity = smoothstep(.2, 1.2, depth) * (field ? .9 : mix(.58,.24,uProgress)) * mix(1.,field ? .4 : .12,uArrival);
  vBright = step(2.3, size);
  vColor = aColor;
  if (depth < .18) { gl_Position = vec4(2., 2., 2., 1.); vOpacity = 0.; }
}`;
const starFragment = `
precision mediump float;
varying vec3 vColor;
varying float vOpacity, vBright, vStretch;
varying vec2 vAxis;
void main() {
  vec2 sprite = gl_PointCoord * 2. - 1.;
  vec2 p = vec2(dot(sprite,vAxis), dot(sprite,vec2(-vAxis.y,vAxis.x))) * vec2(1. / sqrt(vStretch),sqrt(vStretch));
  float r = dot(p, p);
  if (r > 1.) discard;
  float point = exp(-r * 5.) * (1. - smoothstep(.55, 1., r));
  float rays = (exp(-abs(p.x) * 36.) + exp(-abs(p.y) * 36.)) * exp(-r * 3.) * .16 * vBright;
  gl_FragColor = vec4(vColor * (point + rays) * vOpacity, point * vOpacity);
}`;
// Analytic spheres and a ring plane use the same world-space rays as the dust.
// The premultiplied-alpha pass occludes background stars on the planet's night
// side, places rings in front/behind correctly, and needs no downloaded texture.
const systemFragment = `
precision highp float;
varying vec2 vUv;
${cameraUniforms}
const vec3 planet = vec3(${PLANET_CENTER.join(',')});
const float radius = ${PLANET_RADIUS};
const vec3 sun = vec3(-.14,1.14,.30);
float hash3(vec3 p) {
  p = fract(p * .1031); p += dot(p,p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float noise3(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float textureField(vec3 p) {
  return noise3(p) * .56 + noise3(p*2.03+7.) * .28 + noise3(p*4.11-3.) * .16;
}
float sphereHit(vec3 origin, vec3 ray, vec3 center, float size) {
  vec3 relative = origin-center; float b = dot(relative,ray);
  float h = b*b - dot(relative,relative) + size*size;
  if (h < 0.) return -1.;
  float nearHit = -b-sqrt(h); return nearHit > .00001 ? nearHit : -1.;
}
vec4 over(vec4 front, vec4 back) { return front + back * (1.-front.a); }
void main() {
  vec2 uv = (vUv*2.-1.-uOffset) * vec2(uAspect,1.) / 1.85;
  vec3 ray = normalize(uForward + uv.x*uRight + uv.y*uUp);
  vec4 result = vec4(0.);
  float planetHit = sphereHit(uCamera,ray,planet,radius);
  float sunAhead = dot(sun-uCamera,ray);
  float sunDistance = length((sun-uCamera)-ray*max(0.,sunAhead));
  if (sunAhead > 0.) {
    float corona = exp(-max(0.,sunDistance-.027)*105.) * .36 + exp(-sunDistance*35.) * .07;
    result.rgb += vec3(1.,.58,.22) * corona;
    float sunHit = sphereHit(uCamera,ray,sun,.027);
    if (sunHit > 0.) {
      vec3 normal = normalize(uCamera+ray*sunHit-sun);
      float granules = textureField(normal*22.+uTime*.025);
      vec3 photosphere = mix(vec3(1.,.39,.08),vec3(1.,.92,.62),.4+granules*.6);
      photosphere *= .55+.45*pow(max(0.,dot(normal,-ray)),.25);
      result = vec4(photosphere,1.);
    }
  }
  // The atmosphere exists around the sphere, not as a flat screen-space halo.
  float closest = max(0.,dot(planet-uCamera,ray));
  float separation = length(uCamera+ray*closest-planet)/radius;
  if (closest > 0. && separation > 1.) {
    vec3 limbNormal = normalize(uCamera+ray*closest-planet);
    float illumination = .15+.85*max(0.,dot(limbNormal,normalize(sun-planet)));
    float atmosphere = exp(-(separation-1.)*48.)*.5 + exp(-(separation-1.)*14.)*.06;
    result.rgb += vec3(.12,.58,1.) * atmosphere * illumination;
  }
  vec3 axis = normalize(vec3(-.10,.18,.98));
  float ringDenominator = dot(ray,axis), ringHit = -1.;
  vec4 ringColor = vec4(0.);
  if (abs(ringDenominator) > .0001) {
    ringHit = dot(planet-uCamera,axis)/ringDenominator;
    if (ringHit > 0.) {
      vec3 point = uCamera+ray*ringHit;
      float r = length(point-planet)/radius;
      if (r > 1.32 && r < 2.38) {
        float grain = noise3((point-planet)/radius*110.);
        float bands = .5+.5*sin(r*235.+sin(r*67.)*1.8);
        float edge = smoothstep(1.32,1.4,r)*(1.-smoothstep(2.25,2.38,r));
        float division = smoothstep(.006,.025,abs(r-1.94));
        float opacity = (.17+.32*bands+.09*grain)*edge*division;
        vec3 color = mix(vec3(.2,.36,.48),vec3(.8,.66,.47),.35+.4*bands);
        vec3 lightDirection = normalize(sun-point);
        float shadow = sphereHit(point+lightDirection*.0001,lightDirection,planet,radius) > 0. ? .09 : 1.;
        color *= (.55+.45*abs(dot(axis,lightDirection))) * shadow;
        ringColor = vec4(color*opacity,opacity);
      }
    }
  }
  if (planetHit < 0. || ringHit > planetHit) result = over(ringColor,result);
  if (planetHit > 0.) {
    vec3 point = uCamera+ray*planetHit, normal = normalize(point-planet);
    vec3 tangent = normalize(cross(vec3(0,1,0),axis));
    vec3 p = vec3(dot(normal,tangent),dot(normal,cross(axis,tangent)),dot(normal,axis));
    float spin = uTime*.021;
    p.xy = mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*p.xy;
    float turbulence = textureField(p*5.4);
    float fine = uMobile > .5 ? noise3(p*42.) : textureField(p*58.);
    float belts = .5+.5*sin(p.z*43.+turbulence*6.+fine*.8);
    float ribbons = .5+.5*sin(p.z*145.+turbulence*17.);
    vec3 albedo = mix(vec3(.016,.085,.16),vec3(.10,.43,.47),smoothstep(.1,.75,belts));
    albedo = mix(albedo,vec3(.72,.56,.34),smoothstep(.70,.95,belts)*.72);
    albedo = mix(albedo,vec3(.56,.75,.77),smoothstep(.72,.91,fine)*.48);
    albedo *= .76+.24*ribbons;
    vec3 stormCenter = normalize(vec3(.25,-.86,.37));
    float stormDistance = length(p-stormCenter);
    float storm = 1.-smoothstep(.10,.23,stormDistance);
    float swirl = .5+.5*sin(atan(p.z-stormCenter.z,p.x-stormCenter.x)*3.+stormDistance*100.);
    albedo = mix(albedo,mix(vec3(.14,.25,.31),vec3(.78,.60,.36),swirl),storm*.82);
    vec3 lightDirection = normalize(sun-point);
    float day = max(0.,dot(normal,lightDirection));
    float rim = pow(1.-max(0.,dot(normal,-ray)),3.4);
    vec3 color = albedo*(vec3(.035,.065,.11)+vec3(1.8,1.57,1.25)*day);
    color += vec3(.045,.33,.7)*rim*(.16+day);
    color = pow(max(vec3(0.),color),vec3(.8));
    result = over(vec4(color,1.),result);
  }
  if (planetHit > 0. && ringHit > 0. && ringHit < planetHit) result = over(ringColor,result);
  gl_FragColor = result * smoothstep(0.,.09,uArrival);
}`;
const clamp01 = value => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const mix = (a, b, t) => a + (b - a) * t;
const ease = value => { const t=clamp01(value); return t*t*(3-2*t); };
const curve = (a, b, c, d, t) => a * (1-t) ** 3 + 3 * b * t * (1-t) ** 2 + 3 * c * t * t * (1-t) + d * t ** 3;
const normalize = v => { const length = Math.hypot(...v) || 1; return v.map(x => x / length); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function galaxyProgress(scroll, end, height) {
  return clamp01(scroll / Math.max(1,end - Math.max(1,height) * 1.15));
}

export function systemArrival(progress) { return ease((clamp01(progress)-.46)/.54); }

// All render passes use this testable camera basis. Nearby stars exhibit real
// depth-dependent parallax rather than moving as a screen-space wallpaper.
export function galaxyView(value, mobile = false, pointer = [0, 0]) {
  const progress = clamp01(value), t = ease(progress/.64), arrival = systemArrival(progress);
  const [px,py] = [0,1].map(i => Math.max(-1,Math.min(1,Number.isFinite(pointer[i]) ? pointer[i] : 0)));
  // Galactic scale gives way to an exponential approach to a single world.
  // Orbiting changes the view without ever moving the camera inside the sphere.
  const parallax = mix(.62,.18,t);
  const wideCamera = [curve(-1.8,5.,3.9,1.1,t) + px * parallax, curve(-6.8,-6.6,-1.6,-.72,t) + py * parallax * .55, curve(6.4,4.8,.95,.48,t)];
  const relative = wideCamera.map((v,i)=>v-PLANET_CENTER[i]);
  const approach = normalize([.26+px*.13,-.87,.42+py*.09]);
  const direction = normalize(normalize(relative).map((v,i)=>mix(v,approach[i],arrival)));
  const distance = Math.exp(mix(Math.log(Math.hypot(...relative)),Math.log(PLANET_RADIUS*(mobile?3.15:1.85)),arrival));
  const camera = PLANET_CENTER.map((v,i)=>v+direction[i]*distance);
  const wideTarget = [mix(0,.25,t) + px * .18, mix(0,1.6,t) + py * .12, 0];
  const target = wideTarget.map((v,i)=>mix(v,PLANET_CENTER[i],arrival));
  const forward = normalize(target.map((x, i) => x - camera[i]));
  const baseRight = normalize(cross(forward, [0, 0, 1]));
  const baseUp = cross(baseRight, forward), roll = mix(-.4,.08,t) + px * .025;
  const right = baseRight.map((v, i) => v * Math.cos(roll) + baseUp[i] * Math.sin(roll));
  const up = baseUp.map((v, i) => v * Math.cos(roll) - baseRight[i] * Math.sin(roll));
  return { camera, forward, right, up, offset: [mix(mix(mobile ? .28 : .5,.06,t),mobile ? .12 : .34,arrival), mix(mix(mobile ? -.43 : .08,.16,t),mobile ? -.16 : -.28,arrival)] };
}

export function createGalaxy(canvas, { reducedMotion = false, paused = false } = {}) {
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch { return null; }
  if (!gl) return null;
  const programs = [], buffers = [], shaders = [];
  function cleanup() {
    buffers.forEach(buffer => gl.deleteBuffer(buffer)); programs.forEach(program => gl.deleteProgram(program)); shaders.forEach(shader => gl.deleteShader(shader));
  }
  function compile(type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Galaxy shader unavailable');
    shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Galaxy shader unavailable');
    return shader;
  }
  function makeProgram(vertex, fragment) {
    const program = gl.createProgram();
    if (!program) throw new Error('Galaxy unavailable');
    programs.push(program);
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Galaxy unavailable');
    const keys = ['uCamera', 'uRight', 'uUp', 'uForward', 'uOffset', 'uAspect', 'uTime', 'uProgress', 'uDpr', 'uMobile', 'uTravel', 'uArrival'];
    return { program, uniforms: Object.fromEntries(keys.map(key => [key, gl.getUniformLocation(program, key)])) };
  }
  let dust, stars, system, quadBuffer, starBuffer;
  const lowPower = Boolean(navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4));
  const mobileInitially = innerWidth < 720;
  const count = lowPower ? 12000 : mobileInitially ? 22000 : 44000;
  const fieldCount = lowPower || mobileInitially ? 280 : 720;
  try {
    dust = makeProgram(quadVertex, dustFragment); stars = makeProgram(starVertex, starFragment); system = makeProgram(quadVertex,systemFragment);
    let seed = 20260907;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const normal = () => Math.sqrt(-2 * Math.log(Math.max(.00001, random()))) * Math.cos(2 * Math.PI * random());
    const data = new Float32Array((count + fieldCount) * 7);
    for (let i = 0; i < count; i++) {
      const core = random() < .19;
      const r = core ? Math.sqrt(-Math.log(Math.max(.00001, random()))) * .63 : .2 + Math.pow(random(), .65) * 7.8;
      const theta = core || random() < .25 ? random() * Math.PI * 2 : Math.floor(random() * 2) * Math.PI + r * 1.08 - Math.sin(r * .7) * .22 + normal() * (.19 + Math.sin(r * 2.5) * .035);
      const z = normal() * (core ? .35 : .11 + r * .012);
      const outer = Math.min(1, r / 4), special = random() < .025;
      const color = special ? [.65, .8, 1] : [1 - outer * .46, .79 - outer * .08, .53 + outer * .47];
      const size = special ? 2.2 + random() * 3.2 : .65 + Math.pow(random(), 5) * 2.1;
      data.set([Math.cos(theta) * r, Math.sin(theta) * r, z, ...color, size], i * 7);
    }
    // Field stars occupy real depth in front of and behind the galaxy.
    for (let i = 0; i < fieldCount; i++) {
      const near = random() < .6, warm = random() < .18;
      const position = near ? [random()*14-7,random()*14-9,random()*5.5+.25] : [random()*34-17,random()*26-13,random()*24-13];
      data.set([...position, ...(warm ? [1,.78,.5] : [.65+random()*.25,.82,1]), 20.8+Math.pow(random(),3)*3.2], (count+i)*7);
    }
    starBuffer = gl.createBuffer(); quadBuffer = gl.createBuffer();
    if (starBuffer) buffers.push(starBuffer);
    if (quadBuffer) buffers.push(quadBuffer);
    if (!starBuffer || !quadBuffer) throw new Error('Galaxy buffers unavailable');
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  } catch { cleanup(); return null; }
  shaders.forEach(shader => gl.deleteShader(shader)); shaders.length = 0;
  gl.disable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 1);
  const attribute = (program, name, size, stride, offset) => {
    const location = gl.getAttribLocation(program, name);
    if (location >= 0) { gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset); }
  };
  let frame = 0, time = 0, last = 0, lastDraw = 0, progress = 0, targetProgress = 0, travel = 0, visible = true, lost = false, destroyed = false;
  let width = 1, height = 1, dpr = 1;
  const pointer = [0, 0], targetPointer = [0, 0];
  const state = { paused, reducedMotion };
  const active = () => !state.paused && !state.reducedMotion && visible && !document.hidden && !lost && !destroyed;
  function uniforms(renderer, view) {
    gl.useProgram(renderer.program);
    for (const key of ['camera', 'right', 'up', 'forward']) gl.uniform3fv(renderer.uniforms[`u${key[0].toUpperCase()}${key.slice(1)}`], view[key]);
    gl.uniform2f(renderer.uniforms.uOffset, ...view.offset);
    for (const [key, value] of Object.entries({ uAspect: width / height, uTime: time, uProgress: progress, uDpr: dpr, uMobile: width < 720 || lowPower ? 1 : 0, uTravel: travel, uArrival: systemArrival(progress) })) gl.uniform1f(renderer.uniforms[key], value);
  }
  function draw() {
    if (lost || destroyed) return;
    const view = galaxyView(progress, width < 720, pointer);
    gl.clear(gl.COLOR_BUFFER_BIT); gl.disable(gl.BLEND);
    uniforms(dust, view); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    for (const name of ['aPosition', 'aColor', 'aSize']) {
      const location = gl.getAttribLocation(stars.program, name); if (location >= 0) gl.disableVertexAttribArray(location);
    }
    attribute(dust.program, 'aPosition', 2, 0, 0); gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    uniforms(stars, view); gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
    for (const [name, size, offset] of [['aPosition', 3, 0], ['aColor', 3, 12], ['aSize', 1, 24]]) attribute(stars.program, name, size, 28, offset);
    gl.drawArrays(gl.POINTS, 0, count + fieldCount);
    if (systemArrival(progress) > .0001) {
      gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      uniforms(system,view); gl.bindBuffer(gl.ARRAY_BUFFER,quadBuffer);
      for (const name of ['aPosition','aColor','aSize']) {
        const location=gl.getAttribLocation(stars.program,name); if(location>=0) gl.disableVertexAttribArray(location);
      }
      attribute(system.program,'aPosition',2,0,0); gl.drawArrays(gl.TRIANGLES,0,6);
    }
  }
  function tick(now) {
    frame = 0;
    if (!active()) { last = 0; return; }
    // 30fps artwork; native input and scrolling remain independent.
    if (now - lastDraw >= 31) {
      const elapsed = last ? Math.min((now - last) / 1000, .07) : 0;
      time += elapsed; last = now; lastDraw = now;
      const advance = (targetProgress - progress) * .085;
      progress += advance;
      travel += (Math.min(1,Math.abs(advance)*85) - travel) * .16;
      pointer.forEach((value, i) => { pointer[i] += (targetPointer[i] - value) * .055; });
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function start() { if (!frame && active()) frame = requestAnimationFrame(tick); }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function resize() {
    width = Math.max(1, innerWidth); height = Math.max(1, innerHeight);
    // Bound pixel fill for the dust volume, including on retina/large screens.
    dpr = Math.min(devicePixelRatio || 1, width < 720 || lowPower ? 1 : 1.25, Math.sqrt(1600000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height); draw();
  }
  function visibility() { if (active()) start(); else stop(); }
  function contextLost(event) { event.preventDefault(); lost = true; stop(); canvas.parentElement.classList.remove('ready'); }
  const onResize = () => { if (!destroyed) { resize(); start(); } };
  window.addEventListener('resize', onResize, { passive: true }); document.addEventListener('visibilitychange', visibility);
  canvas.addEventListener('webglcontextlost', contextLost);
  resize(); canvas.parentElement.classList.add('ready'); start();
  return {
    get available() { return !lost && !destroyed; },
    update(scroll, end = innerHeight * 2.5) {
      // Arrive before the content enters the viewport, giving the closest view
      // room to breathe instead of hiding it behind the next section.
      targetProgress = galaxyProgress(scroll,end,innerHeight);
      visible = scroll < end + innerHeight * .3;
      if (active()) start(); else stop();
    },
    pointer(x, y) { if (active()) { targetPointer[0] = Math.max(-1, Math.min(1, x || 0)); targetPointer[1] = Math.max(-1, Math.min(1, y || 0)); } },
    setMotion(next) { Object.assign(state, next); if (active()) start(); else stop(); },
    destroy() {
      if (destroyed) return;
      destroyed = true; stop(); cleanup(); canvas.parentElement.classList.remove('ready');
      window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', visibility); canvas.removeEventListener('webglcontextlost', contextLost);
    }
  };
}
