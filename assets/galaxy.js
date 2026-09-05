// An original, deterministic spiral galaxy. Native scrolling moves the camera;
// the page never captures or replaces wheel/touch scrolling.
const vertexSource = `
attribute vec3 aPosition;
attribute vec3 aColor;
attribute float aSize;
uniform float uTime;
uniform float uProgress;
uniform float uAspect;
uniform float uDpr;
uniform float uMobile;
uniform vec2 uPointer;
varying vec3 vColor;
varying float vOpacity;
void main() {
  vec3 p = aPosition;
  float starField = step(20.0, aSize);
  float rotation = uTime * 0.012 + uProgress * 0.42;
  float ca = cos(rotation), sa = sin(rotation);
  p.xy = mat2(ca, -sa, sa, ca) * p.xy;
  float tilt = 1.01 - uProgress * 0.68 + uPointer.y * 0.035;
  p.yz = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * p.yz;
  float roll = -0.40 + uProgress * 0.18 + uPointer.x * 0.025;
  p.xy = mat2(cos(roll), -sin(roll), sin(roll), cos(roll)) * p.xy;
  float depth = 10.5 + p.z;
  float scale = mix(1.74, 1.25, uMobile) + uProgress * 0.10;
  vec2 center = vec2(mix(0.43, 0.24, uMobile) - uProgress * 0.34, mix(0.04, -0.40, uMobile) + uProgress * 0.15);
  vec2 xy = (p.xy * scale / depth) / vec2(uAspect, 1.0) + center;
  xy += uPointer * vec2(0.010, 0.007);
  if (starField > 0.5) {
    xy = aPosition.xy + uPointer * 0.004;
    gl_PointSize = (aSize - 20.0) * uDpr;
    vOpacity = 0.34 + aPosition.z * 0.05;
  } else {
    gl_PointSize = clamp(aSize * uDpr * (10.0 / depth), 0.65, 22.0 * uDpr);
    vOpacity = mix(0.56, 0.35, smoothstep(3.5, 6.4, length(aPosition.xy))) * min(1.0, 1.5 / aSize);
  }
  gl_Position = vec4(xy, 0.5, 1.0);
  vColor = aColor;
}`;

const fragmentSource = `
precision mediump float;
varying vec3 vColor;
varying float vOpacity;
void main() {
  vec2 point = gl_PointCoord * 2.0 - 1.0;
  float radius = dot(point, point);
  if (radius > 1.0) discard;
  float light = exp(-radius * 4.0) * (1.0 - smoothstep(0.48, 1.0, radius));
  gl_FragColor = vec4(vColor * light * vOpacity, light * vOpacity);
}`;

export function createGalaxy(canvas, { reducedMotion = false, paused = false } = {}) {
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' }); } catch { return null; }
  if (!gl) return null;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Galaxy shader unavailable'); }
    return shader;
  };
  let program, vertex, fragment;
  try {
    vertex = compile(gl.VERTEX_SHADER, vertexSource); fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Galaxy unavailable');
  } catch { return null; }
  gl.deleteShader(vertex); gl.deleteShader(fragment);
  gl.useProgram(program);
  let seed = 20260319;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(0.00001, random()))) * Math.cos(2 * Math.PI * random());
  const mobileInitially = innerWidth < 720;
  const lowPower = navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
  const count = lowPower ? 16000 : mobileInitially ? 28000 : 65000;
  const fieldCount = mobileInitially ? 190 : 390;
  const data = new Float32Array((count + fieldCount) * 7);
  for (let i = 0; i < count; i++) {
    const core = random() < 0.26;
    const r = core ? Math.sqrt(-Math.log(Math.max(.00001, random()))) * .63 : 0.16 + Math.pow(random(), 0.70) * 6.05;
    const arm = Math.floor(random() * 2) * Math.PI;
    const scatter = random() < 0.45;
    const theta = core || scatter ? random() * Math.PI * 2 : arm + r * 1.13 + normal() * (0.16 + 0.11 / (r + 0.4));
    const width = core ? .29 : .065 + .09 * Math.exp(-r);
    const x = Math.cos(theta) * r, y = Math.sin(theta) * r, z = normal() * width;
    const outward = Math.min(1, r / 3.0);
    const special = random() < .018;
    const color = special ? [0.64, 0.76, 1] : [1 - outward * .60, .76 - outward * .17, .46 + outward * .45];
    const brightness = .75 + random() * .65;
    // Mostly pinprick stars; a few soft, larger points supply an optical glow.
    const size = special ? 2.5 + random() * 3.5 : core && random() < .015 ? 8 + random() * 8 : .7 + Math.pow(random(), 4) * 2.5;
    data.set([x, y, z, color[0] * brightness, color[1] * brightness, color[2] * brightness, size], i * 7);
  }
  for (let i = 0; i < fieldCount; i++) data.set([random() * 2 - 1, random() * 2 - 1, random(), .64, .74, .88, 20.6 + random() * 1.8], (count + i) * 7);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  for (const [name, size, offset] of [['aPosition', 3, 0], ['aColor', 3, 12], ['aSize', 1, 24]]) {
    const attribute = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 28, offset);
  }
  const uniforms = Object.fromEntries(['uTime', 'uProgress', 'uAspect', 'uDpr', 'uMobile', 'uPointer'].map(key => [key, gl.getUniformLocation(program, key)]));
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.disable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
  let frame = 0, time = 0, last = 0, lastDraw = 0, progress = 0, targetProgress = 0, visible = true, lost = false;
  let pointer = [0, 0], targetPointer = [0, 0];
  const state = { paused, reducedMotion };
  const active = () => !state.paused && !state.reducedMotion && visible && !document.hidden && !lost;
  let width = 0, height = 0, dpr = 1;
  function draw() {
    if (lost) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.uTime, time); gl.uniform1f(uniforms.uProgress, progress); gl.uniform1f(uniforms.uAspect, width / height);
    gl.uniform1f(uniforms.uDpr, dpr); gl.uniform1f(uniforms.uMobile, width < 720 ? 1 : 0); gl.uniform2f(uniforms.uPointer, pointer[0], pointer[1]);
    gl.drawArrays(gl.POINTS, 0, count + fieldCount);
  }
  function tick(now) {
    frame = 0;
    if (!active()) { last = 0; return; }
    // Limit the decorative scene to 30fps; native scroll and page input remain independent.
    if (now - lastDraw >= 31) {
      time += last ? Math.min((now - last) / 1000, .05) : 0;
      last = now; lastDraw = now;
      progress += (targetProgress - progress) * .075;
      pointer = pointer.map((value, index) => value + (targetPointer[index] - value) * .025);
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function start() { if (!frame && active()) frame = requestAnimationFrame(tick); }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function resize() {
    width = innerWidth; height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, width < 720 || lowPower ? 1.25 : 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height); draw();
  }
  function visibility() { if (active()) start(); else stop(); }
  function contextLost(event) { event.preventDefault(); lost = true; stop(); canvas.parentElement.classList.remove('ready'); }
  const onResize = () => { resize(); start(); };
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  canvas.addEventListener('webglcontextlost', contextLost);
  resize(); canvas.parentElement.classList.add('ready'); start();
  return {
    update(scroll) {
      targetProgress = Math.min(1, Math.max(0, scroll / Math.max(1, innerHeight * 1.35)));
      visible = scroll < innerHeight * 2.5;
      if (active()) start(); else stop();
    },
    pointer(x, y) { if (active()) targetPointer = [x, y]; },
    setMotion(next) { Object.assign(state, next); if (active()) start(); else { stop(); pointer = [0, 0]; draw(); } },
    destroy() { stop(); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', visibility); canvas.removeEventListener('webglcontextlost', contextLost); gl.deleteBuffer(buffer); gl.deleteProgram(program); }
  };
}
