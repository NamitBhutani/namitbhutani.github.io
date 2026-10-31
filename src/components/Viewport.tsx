import * as React from "react";

// A live viewport with three small simulations, one per strand of my work:
//  photo   , stress fringes in a loaded disk, summed over 32 wavelengths (the PG 2026 paper)
//  splats  , 12K Gaussian splats with outline selection and painting (my DGP Houdini tool)
//  terrain , a domain-warped 3D noise field, ray-marched (procLan)
// Plain WebGL2, no libraries. It renders only while on screen, freezes time under
// prefers-reduced-motion, and follows the header's Wireframe / Solid / Rendered buttons.

type SceneId = "photo" | "splats" | "terrain";

const SCENES: { id: SceneId; label: string; object: string }[] = [
  { id: "photo", label: "Photoelasticity", object: "Disk" },
  { id: "splats", label: "Splats", object: "Colonnade" },
  { id: "terrain", label: "Terrain", object: "Noise field" },
];

const link = "text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary";

type SplatStats = { subject: number; context: number; parts: string };

function Caption({ id, total }: { id: SceneId; total: number }) {
  if (id === "photo")
    return (
      <>
        Stress in a disk squeezed between two jaws, seen through a dark-field circular polariscope. Each
        pixel sums 32 wavelengths of white light; my{" "}
        <a className={link} href="/photoelasticity">Pacific Graphics paper</a> renders this effect in
        real time for 3D objects. Drag sideways to turn the load, up and down to change it.
      </>
    );
  if (id === "splats")
    return (
      <>
        A small version of the <a className={link} href="#research">Houdini selection tool</a> I build
        at DGP, on {total.toLocaleString()} Gaussian splats sorted back to front every frame. Draw round a
        part and it becomes the subject (magenta), while everything else you picked, at any depth, is its
        context (cyan). Shift-drag adds a part, Ctrl+Shift-drag removes one, and the Paint brush only
        touches the subject. Here the parts are known in advance; the real tool finds them with SAM and
        DINO features. Right-drag or Alt-drag to orbit.
      </>
    );
  return (
    <>
      A domain-warped 3D noise field, ray-marched every frame, so it can hold the overhangs and caves a
      heightmap cannot.{" "}
      <a className={link} href="https://github.com/NamitBhutani/procLan" target="_blank" rel="noopener noreferrer">
        procLan
      </a>{" "}
      meshes the same kind of field with Marching Cubes. Drag to look around.
    </>
  );
}

/* ---------------- shaders ---------------- */

const FULLSCREEN_VS = `#version 300 es
void main(){
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const PHOTO_FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uAngle; uniform float uLoad; uniform int uMode;
uniform vec3 uBg; uniform vec3 uFg; uniform vec3 uAccent;
uniform vec3 uCmf[32];
out vec4 o;
vec3 enc(vec3 c){ c = clamp(c, 0.0, 1.0); return mix(12.92*c, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  float S = 0.40*uRes.y;
  vec2 p = (gl_FragCoord.xy - 0.5*uRes)/S;
  float px = 1.0/S;
  float r = length(p);
  float ca = cos(uAngle), sa = sin(uAngle);
  vec2 q = vec2(ca*p.x + sa*p.y, -sa*p.x + ca*p.y);      // point in the load frame
  // Disk of radius 1 under diametral compression (classical elasticity solution).
  float x = q.x, y = q.y, a = 1.0 - y, b = 1.0 + y;
  float r1 = max(x*x + a*a, 1e-4), r2 = max(x*x + b*b, 1e-4);
  float r1s = r1*r1, r2s = r2*r2;
  float sx  = -2.0*(a*x*x/r1s + b*x*x/r2s - 0.5);
  float sy  = -2.0*(a*a*a/r1s + b*b*b/r2s - 0.5);
  float txy =  2.0*(a*a*x/r1s - b*b*x/r2s);
  float N = sqrt((sx - sy)*(sx - sy) + 4.0*txy*txy)*uLoad;  // fringe order at 550 nm
  vec3 disk;
  if (uMode == 0) {
    vec3 xyz = vec3(0.0);
    for (int i = 0; i < 32; i++) {
      float l = 400.0 + (float(i) + 0.5)*9.375;
      float s = sin(3.14159265*N*550.0/l);
      xyz += uCmf[i]*s*s;                                     // dark field, I = sin^2(delta/2)
    }
    vec3 lin = mat3(3.2406, -0.9689, 0.0557, -1.5372, 1.8758, -0.2040, -0.4986, 0.0415, 1.0570)*xyz*0.85;
    lin = mix(lin, vec3(0.5*0.85), smoothstep(10.0, 18.0, N)); // high orders wash out to grey
    disk = enc(lin);
  } else if (uMode == 1) {
    float s = sin(3.14159265*N);
    disk = mix(vec3(0.9*s*s), vec3(0.45), smoothstep(10.0, 18.0, N));
  } else {
    float fw = max(fwidth(N), 1e-4);
    float dl = (0.5 - abs(fract(N) - 0.5))/fw;
    float line = (1.0 - clamp(dl - 0.5, 0.0, 1.0))*(1.0 - smoothstep(8.0, 12.0, N));
    disk = mix(uBg*1.3 + 0.02, uFg, line);
  }
  float inside = 1.0 - smoothstep(1.0 - px, 1.0 + px, r);
  vec3 col = mix(uBg, disk, inside);
  float rim = 1.0 - smoothstep(0.0, 1.5*px, abs(r - 1.0));
  col = mix(col, mix(uBg, uFg, 0.6), rim*0.7);
  float jx = 0.22 - abs(q.x), jy = min(abs(q.y) - 1.0, 1.09 - abs(q.y));
  col = mix(col, uAccent, clamp(min(jx, jy)/px + 0.5, 0.0, 1.0));
  o = vec4(col, 1.0);
}`;

const TERRAIN_FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uYaw; uniform float uPitch; uniform int uMode;
uniform vec3 uBg; uniform vec3 uFg; uniform vec3 uAccent;
out vec4 o;
float hash(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x + p.y + p.z)); }
float noise(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f*f*(3.0 - 2.0*f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float s = 0.0, a = 0.5; for (int k = 0; k < 4; k++){ s += a*noise(p); p = p*2.02 + vec3(3.1, 1.7, 4.3); a *= 0.5; } return s; }
float dens(vec3 p){                                   // > 0 is solid
  vec3 q = p*0.32;
  q.xz += 1.6*vec2(noise(p*0.11), noise(p*0.11 + 7.3));  // domain warp
  float d = (fbm(q) - 0.47)*4.0 - p.y*(p.y > 0.0 ? 0.7 : 0.42);  // thinner up high, fewer floating blobs
  return max(d, -(p.y + 2.2)*2.0);
}
vec3 gradAt(vec3 p){
  const vec2 e = vec2(0.035, 0.0);
  return vec3(dens(p + e.xyy) - dens(p - e.xyy), dens(p + e.yxy) - dens(p - e.yxy), dens(p + e.yyx) - dens(p - e.yyx))/(2.0*e.x);
}
const vec3 SUN = vec3(-0.74, 0.55, 0.39);           // normalised below
vec3 skyCol(vec3 rd, vec3 sun){                      // linear radiance
  float h = clamp(rd.y, 0.0, 1.0);
  vec3 c = mix(vec3(0.60, 0.66, 0.74), vec3(0.09, 0.19, 0.42), pow(h, 0.5));
  float s = max(dot(rd, sun), 0.0);
  return c + vec3(1.0, 0.86, 0.7)*(0.25*pow(s, 6.0) + 2.0*pow(s, 600.0));
}
float softShadow(vec3 p, vec3 l){
  float res = 1.0, t = 0.12;
  for (int i = 0; i < 18; i++){
    float d = dens(p + l*t);
    res = min(res, clamp(-d*2.5, 0.0, 1.0));
    if (res < 0.02) break;
    t += 0.18 + t*0.18;
  }
  return res;
}
float ambientOcc(vec3 p, vec3 n, float g){            // how much denser than open air it is just above the surface
  float o = 0.0;
  for (int i = 1; i <= 4; i++){
    float h = 0.18*float(i);
    o += clamp((dens(p + n*h) + g*h)/(g*h), 0.0, 1.0);
  }
  return clamp(1.0 - 0.3*o, 0.25, 1.0);
}
vec3 aces(vec3 x){ return clamp((x*(2.51*x + 0.03))/(x*(2.43*x + 0.59) + 0.14), 0.0, 1.0); }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes)/uRes.y;
  vec3 sun = normalize(SUN);
  vec3 ro = vec3(0.0, 2.9, uTime*0.9);
  float cy = cos(uYaw), sy = sin(uYaw), cp = cos(uPitch), sp = sin(uPitch);
  vec3 fw = vec3(sy*cp, sp, cy*cp);
  vec3 rt = normalize(cross(vec3(0,1,0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(fw*1.3 + uv.x*rt + uv.y*up);
  float t = 0.3, prev = t, hit = -1.0;
  for (int i = 0; i < 90; i++){
    vec3 p = ro + rd*t; float d = dens(p);
    if (d > 0.0){ hit = t; break; }
    if (p.y > 4.5 && rd.y > 0.0) break;
    prev = t;
    t += clamp(-d*0.35, 0.04, 0.6) + t*0.008;
    if (t > 34.0) break;
  }
  vec3 sky = skyCol(rd, sun);
  vec3 col = sky;
  if (hit > 0.0){
    float a = prev, b = hit;
    for (int k = 0; k < 5; k++){ float m = 0.5*(a + b); if (dens(ro + rd*m) > 0.0) b = m; else a = m; }
    t = b; vec3 p = ro + rd*t;
    vec3 g = gradAt(p); float gl = max(length(g), 1e-3);
    vec3 n = -g/gl;
    float dif = clamp(dot(n, sun), 0.0, 1.0);
    float sh = dif > 0.0 ? softShadow(p + n*0.04, sun) : 0.0;
    float ao = ambientOcc(p, n, gl);
    vec3 skyAmb = mix(vec3(0.16, 0.13, 0.10), vec3(0.32, 0.45, 0.72), 0.5 + 0.5*n.y);   // ground bounce to sky
    float back = clamp(dot(n, normalize(vec3(-sun.x, 0.0, -sun.z))), 0.0, 1.0);
    vec3 light = vec3(1.0, 0.9, 0.78)*3.2*dif*sh + skyAmb*ao + vec3(0.18, 0.14, 0.1)*back*ao*0.5;
    vec3 alb;
    if (uMode == 0){
      float strata = 0.5 + 0.5*sin(p.y*7.0 + 3.0*noise(p*0.8));
      vec3 rock = mix(vec3(0.20, 0.17, 0.14), vec3(0.34, 0.29, 0.23), strata*0.6 + 0.4*noise(p*4.0));
      float moss = smoothstep(0.6, 0.85, n.y)*smoothstep(-2.0, -0.6, p.y);
      alb = mix(rock, vec3(0.10, 0.17, 0.06), moss);
    } else if (uMode == 1){
      alb = vec3(0.3);
    } else {
      vec3 cc = p*2.0; vec3 fwv = max(fwidth(cc), vec3(1e-4));
      vec3 dl = (0.5 - abs(fract(cc) - 0.5))/fwv;
      float line = 1.0 - clamp(min(min(dl.x, dl.y), dl.z), 0.0, 1.0);
      vec3 c = mix(uBg*1.4 + 0.02, uFg, line*0.8);
      o = vec4(mix(c, uBg, 1.0 - exp(-t*0.075)), 1.0); return;
    }
    col = alb*light;
    float fog = 1.0 - exp(-max(t - 6.0, 0.0)*0.02);   // clear up close, light haze far off
    vec3 fogCol = skyCol(normalize(vec3(rd.x, 0.02, rd.z)), sun);
    col = mix(col, fogCol, fog);
  } else if (uMode == 2){
    o = vec4(uBg, 1.0); return;
  }
  if (uMode == 1) col = vec3(dot(col, vec3(0.3, 0.59, 0.11)));
  col = aces(col*0.9);
  o = vec4(pow(col, vec3(1.0/2.2)), 1.0);
}`;

const SPLAT_VS = `#version 300 es
layout(location=0) in vec2 aCorner;
layout(location=1) in vec3 aPos;
layout(location=2) in vec3 aCol;
layout(location=3) in float aScale;
layout(location=4) in float aSel;
uniform mat4 uVP; uniform vec2 uRes; uniform float uFocal;
out vec2 vUV; out vec3 vCol; out float vSel;
void main(){
  vec4 c = uVP*vec4(aPos, 1.0);
  float rpx = clamp(aScale*uFocal/max(c.w, 0.01), 0.7, 40.0);
  c.xy += aCorner*3.0*rpx*2.0/uRes*c.w;
  gl_Position = c;
  vUV = aCorner*3.0; vCol = aCol; vSel = aSel;
}`;

const SPLAT_FS = `#version 300 es
precision highp float;
in vec2 vUV; in vec3 vCol; in float vSel;   // vSel 0 none, 1 subject, 2 context
uniform int uMode; uniform vec3 uFg;
const vec3 SUBJ = vec3(1.0, 0.27, 0.83), CTX = vec3(0.22, 0.86, 1.0);
out vec4 o;
void main(){
  float r2 = dot(vUV, vUV);
  vec3 tint = vSel > 1.5 ? CTX : SUBJ;
  float on = vSel > 0.5 ? 1.0 : 0.0;
  if (uMode == 2){
    float a = exp(-pow((sqrt(r2) - 2.0)*5.0, 2.0))*0.55;
    if (a < 0.01) discard;
    o = vec4(mix(uFg, tint, on)*a, a); return;
  }
  float a = 0.92*exp(-0.5*r2);
  if (a < 0.004) discard;
  vec3 c = vCol;
  if (uMode == 1) c = vec3(dot(c, vec3(0.3, 0.59, 0.11)));
  c = mix(c, tint, on*0.6);
  o = vec4(c*a, a);
}`;

/* ---------------- helpers ---------------- */

function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  const loc: Record<string, WebGLUniformLocation | null> = {};
  return { p, u: (n: string) => (n in loc ? loc[n] : (loc[n] = gl.getUniformLocation(p, n))) };
}

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// CIE 1931 colour matching functions, Wyman et al. 2013 multi-lobe fit,
// normalised so constant intensity integrates to D65 white.
function cmfTable() {
  const g = (x: number, m: number, s1: number, s2: number) => {
    const t = (x - m) / (x < m ? s1 : s2);
    return Math.exp(-0.5 * t * t);
  };
  const rows: number[][] = [];
  const sum = [0, 0, 0];
  for (let i = 0; i < 32; i++) {
    const l = 400 + (i + 0.5) * 9.375;
    const X = 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
    const Y = 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
    const Z = 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);
    rows.push([X, Y, Z]);
    sum[0] += X; sum[1] += Y; sum[2] += Z;
  }
  const white = [0.9505, 1.0, 1.089];
  return new Float32Array(rows.flatMap((r) => r.map((v, k) => (v * white[k]) / sum[k])));
}

// A small "captured" colonnade as splats, with a part id per splat
// (0 ground, 1 to 5 columns, 6 beam) and its lighting kept apart from its colour.
const PART_NAMES = ["ground", "column 1", "column 2", "column 3", "column 4", "column 5", "beam"];
function makeSplats(n: number) {
  const rnd = mulberry32(7);
  const pos: number[] = [], base: number[] = [], shade: number[] = [], scl: number[] = [], obj: number[] = [];
  const light = [-0.5, 0.75, 0.45];
  const ll = Math.hypot(...light);
  const add = (x: number, y: number, z: number, nx: number, ny: number, nz: number, b: number[], s: number, o: number) => {
    const sh = 0.5 + 0.5 * Math.max(0, (nx * light[0] + ny * light[1] + nz * light[2]) / ll);
    pos.push(x, y, z);
    base.push(b[0], b[1], b[2]);
    shade.push(sh * (0.82 + 0.18 * rnd()));
    scl.push(s * (0.75 + 0.5 * rnd()));
    obj.push(o);
  };
  const stone = [0.92, 0.84, 0.7], ground = [0.42, 0.47, 0.42];
  for (let i = 0; i < 3800; i++) add(-5.5 + 11 * rnd(), 0, -1.8 + 3.6 * rnd(), 0, 1, 0, ground, 0.075, 0);
  [-4, -2, 0, 2, 4].forEach((cx, k) => {
    for (let i = 0; i < 1050; i++) {
      const th = rnd() * Math.PI * 2, h = rnd() * 2.0;
      const r = h > 1.9 ? 0.38 : 0.28;
      add(cx + r * Math.cos(th), h, r * Math.sin(th), Math.cos(th), 0, Math.sin(th), stone, 0.05, k + 1);
    }
  });
  const faces = [
    { a: 9.2 * 0.8, f: () => [-4.6 + 9.2 * rnd(), 2.45, -0.4 + 0.8 * rnd(), 0, 1, 0] },
    { a: 9.2 * 0.4, f: () => [-4.6 + 9.2 * rnd(), 2.05 + 0.4 * rnd(), 0.4, 0, 0, 1] },
    { a: 9.2 * 0.4, f: () => [-4.6 + 9.2 * rnd(), 2.05 + 0.4 * rnd(), -0.4, 0, 0, -1] },
    { a: 9.2 * 0.8, f: () => [-4.6 + 9.2 * rnd(), 2.05, -0.4 + 0.8 * rnd(), 0, -1, 0] },
  ];
  const total = faces.reduce((s, f) => s + f.a, 0);
  while (pos.length / 3 < n) {
    let u = rnd() * total;
    const face = faces.find((f) => (u -= f.a) < 0) ?? faces[0];
    const [x, y, z, nx, ny, nz] = face.f();
    add(x, y, z, nx, ny, nz, stone, 0.05, 6);
  }
  return {
    pos: new Float32Array(pos.slice(0, n * 3)),
    base: new Float32Array(base.slice(0, n * 3)),
    shade: new Float32Array(shade.slice(0, n)),
    scl: new Float32Array(scl.slice(0, n)),
    obj: new Uint8Array(obj.slice(0, n)),
  };
}

function perspective(fovy: number, aspect: number, n: number, f: number) {
  const t = 1 / Math.tan(fovy / 2);
  return new Float32Array([t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]);
}
function lookAt(e: number[], c: number[]) {
  const z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]];
  const zl = Math.hypot(...z); z[0] /= zl; z[1] /= zl; z[2] /= zl;
  const x = [z[2], 0, -z[0]]; // cross((0,1,0), z)
  const xl = Math.hypot(...x); x[0] /= xl; x[2] /= xl;
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  const d = (a: number[]) => a[0] * e[0] + a[1] * e[1] + a[2] * e[2];
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -d(x), -d(y), -d(z), 1]);
}
function mul(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
}

/* ---------------- component ---------------- */

const N_SPLATS = 12000;
const BRUSH = 26; // css px
const PAINTS: { name: string; c: [number, number, number] }[] = [
  { name: "Terracotta", c: [0.86, 0.42, 0.28] },
  { name: "Verdigris", c: [0.36, 0.7, 0.6] },
  { name: "Lapis", c: [0.3, 0.42, 0.85] },
];

type Tool = "select" | "paint";

export function Viewport() {
  const [scene, setScene] = React.useState<SceneId>("photo");
  const [tool, setTool] = React.useState<Tool>("select");
  const [paint, setPaint] = React.useState(0);
  const [stats, setStats] = React.useState<SplatStats>({ subject: 0, context: 0, parts: "" });
  const [failed, setFailed] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const brushRef = React.useRef<HTMLDivElement>(null);
  const lassoRef = React.useRef<SVGPolygonElement>(null);
  const sceneRef = React.useRef(scene);
  const toolRef = React.useRef(tool);
  const paintRef = React.useRef(paint);
  const actions = React.useRef({ swap: () => {}, clear: () => {} });
  sceneRef.current = scene;
  toolRef.current = tool;
  paintRef.current = paint;

  // ?scene=splats|terrain opens that scene (shareable links, screenshots).
  React.useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("scene");
    if (s === "photo" || s === "splats" || s === "terrain") setScene(s);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) { setFailed(true); return; }
    let photo: ReturnType<typeof program>, terrain: ReturnType<typeof program>, splat: ReturnType<typeof program>;
    try {
      photo = program(gl, FULLSCREEN_VS, PHOTO_FS);
      terrain = program(gl, FULLSCREEN_VS, TERRAIN_FS);
      splat = program(gl, SPLAT_VS, SPLAT_FS);
    } catch (err) {
      console.error(err);
      setFailed(true);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cmf = cmfTable();

    // Theme colours, read from the CSS tokens through a 1x1 canvas so oklch() resolves to sRGB.
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const css = (name: string): [number, number, number] => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = "#000";
      probe.fillStyle = v;
      probe.fillRect(0, 0, 1, 1);
      const d = probe.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
    let colors = { bg: css("--background"), fg: css("--foreground"), accent: css("--primary") };
    let mode = 0;
    const readTheme = () => {
      const s = document.documentElement.dataset.shading;
      mode = s === "solid" ? 1 : s === "wireframe" ? 2 : 0;
      colors = { bg: css("--background"), fg: css("--foreground"), accent: mode === 0 ? css("--primary") : css("--select") };
    };
    readTheme();
    const themeObs = new MutationObserver(readTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-shading"] });

    // Splats: geometry, current colour (base or paint, times lighting), selection tag.
    const S = makeSplats(N_SPLATS);
    const col = new Float32Array(N_SPLATS * 3);
    const resetColours = () => {
      for (let i = 0; i < N_SPLATS; i++)
        for (let k = 0; k < 3; k++) col[i * 3 + k] = S.base[i * 3 + k] * S.shade[i];
    };
    resetColours();
    const tag = new Uint8Array(N_SPLATS); // 0 none, 1 subject, 2 context
    const scr = new Float32Array(N_SPLATS * 3); // screen x, y (css px), clip w
    const keys = new Float64Array(N_SPLATS);
    const inst = new Float32Array(N_SPLATS * 8);
    const emptyVao = gl.createVertexArray();
    const splatVao = gl.createVertexArray();
    gl.bindVertexArray(splatVao);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const instBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferData(gl.ARRAY_BUFFER, inst.byteLength, gl.DYNAMIC_DRAW);
    for (const [loc, size, off] of [[1, 3, 0], [2, 3, 12], [3, 1, 24], [4, 1, 28]]) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 32, off);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindVertexArray(null);

    const report = () => {
      let subject = 0, context = 0;
      const parts = new Set<number>();
      for (let i = 0; i < N_SPLATS; i++) {
        if (tag[i] === 1) { subject++; parts.add(S.obj[i]); }
        else if (tag[i] === 2) context++;
      }
      setStats({ subject, context, parts: [...parts].sort().map((p) => PART_NAMES[p]).join(", ") });
    };

    // Which splats are in front: a coarse screen-space depth buffer of 8 px cells.
    const visible = () => {
      const cell = 8, gw = Math.ceil(canvas.clientWidth / cell) + 1, gh = Math.ceil(canvas.clientHeight / cell) + 1;
      const depth = new Float32Array(gw * gh).fill(Infinity);
      const idx = new Int32Array(N_SPLATS).fill(-1);
      for (let i = 0; i < N_SPLATS; i++) {
        const w = scr[i * 3 + 2];
        if (w <= 0) continue;
        const cx = Math.floor(scr[i * 3] / cell), cy = Math.floor(scr[i * 3 + 1] / cell);
        if (cx < 0 || cy < 0 || cx >= gw || cy >= gh) continue;
        const c = cy * gw + cx;
        idx[i] = c;
        if (w < depth[c]) depth[c] = w;
      }
      const vis = new Uint8Array(N_SPLATS);
      for (let i = 0; i < N_SPLATS; i++) if (idx[i] >= 0 && scr[i * 3 + 2] <= depth[idx[i]] + 0.3) vis[i] = 1;
      return vis;
    };

    // Every splat under the outline, at any depth.
    const inside = (poly: number[]) => {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let k = 0; k < poly.length; k += 2) {
        x0 = Math.min(x0, poly[k]); x1 = Math.max(x1, poly[k]);
        y0 = Math.min(y0, poly[k + 1]); y1 = Math.max(y1, poly[k + 1]);
      }
      const res = new Uint8Array(N_SPLATS);
      const n = poly.length / 2;
      for (let i = 0; i < N_SPLATS; i++) {
        if (scr[i * 3 + 2] <= 0) continue;
        const x = scr[i * 3], y = scr[i * 3 + 1];
        if (x < x0 || x > x1 || y < y0 || y > y1) continue;
        let c = false;
        for (let a = 0, b = n - 1; a < n; b = a++) {
          const ya = poly[a * 2 + 1], yb = poly[b * 2 + 1];
          if ((ya > y) !== (yb > y) && x < ((poly[b * 2] - poly[a * 2]) * (y - ya)) / (yb - ya) + poly[a * 2]) c = !c;
        }
        if (c) res[i] = 1;
      }
      return res;
    };

    // The part you drew round: the one whose visible splats the outline covers most completely.
    // (The real tool asks SAM what one thing is; here the parts are known.)
    const partUnder = (ins: Uint8Array, vis: Uint8Array) => {
      const inV = new Array(PART_NAMES.length).fill(0), allV = new Array(PART_NAMES.length).fill(0);
      for (let i = 0; i < N_SPLATS; i++) {
        if (!vis[i]) continue;
        allV[S.obj[i]]++;
        if (ins[i]) inV[S.obj[i]]++;
      }
      let best = -1, score = 0;
      for (let p = 0; p < inV.length; p++) {
        if (inV[p] < 12) continue;
        const s = inV[p] / allV[p] + inV[p] * 1e-6;
        if (s > score) { score = s; best = p; }
      }
      return best;
    };

    const finishOutline = (poly: number[], how: "new" | "add" | "remove") => {
      if (poly.length < 6) return;
      const ins = inside(poly);
      const part = partUnder(ins, visible());
      if (how === "new") {
        tag.fill(0);
        if (part >= 0) for (let i = 0; i < N_SPLATS; i++) if (ins[i]) tag[i] = S.obj[i] === part ? 1 : 2;
      } else if (part >= 0) {
        // Amendments only change splats already in the selection.
        for (let i = 0; i < N_SPLATS; i++) {
          if (!ins[i] || S.obj[i] !== part) continue;
          if (how === "add" && tag[i] === 2) tag[i] = 1;
          if (how === "remove" && tag[i] === 1) tag[i] = 2;
        }
      }
      report();
    };

    const paintAt = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      const mx = cx - r.left, my = cy - r.top;
      const vis = visible();
      let hasSubject = false;
      for (let i = 0; i < N_SPLATS; i++) if (tag[i] === 1) { hasSubject = true; break; }
      const c = PAINTS[paintRef.current].c;
      for (let i = 0; i < N_SPLATS; i++) {
        if (!vis[i] || (hasSubject && tag[i] !== 1)) continue;
        const dx = scr[i * 3] - mx, dy = scr[i * 3 + 1] - my;
        const d2 = dx * dx + dy * dy;
        if (d2 > BRUSH * BRUSH) continue;
        const f = 0.55 * (1 - d2 / (BRUSH * BRUSH)); // soft brush
        for (let k = 0; k < 3; k++) col[i * 3 + k] += (c[k] * S.shade[i] - col[i * 3 + k]) * f;
      }
    };

    actions.current = {
      swap: () => {
        for (let i = 0; i < N_SPLATS; i++) if (tag[i]) tag[i] = tag[i] === 1 ? 2 : 1;
        report();
      },
      clear: () => {
        tag.fill(0);
        resetColours();
        report();
      },
    };

    // Interaction state
    const st = { angle: 0, load: 0.55, yaw: 0.6, pitch: 0.32, tYaw: 0, tPitch: -0.22 };
    let drag: null | { x: number; y: number; kind: "orbit" | "outline" | "paint" | "other"; how: "new" | "add" | "remove"; poly: number[] } = null;
    let touched = false; // the colonnade turns on its own until someone touches it

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const drawOutline = (poly: number[]) => {
      const el = lassoRef.current;
      if (!el) return;
      let pts = "";
      for (let k = 0; k < poly.length; k += 2) pts += `${poly[k]},${poly[k + 1]} `;
      el.setAttribute("points", pts);
    };

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      let kind: "orbit" | "outline" | "paint" | "other" = "other";
      if (sceneRef.current === "splats") {
        touched = true;
        if (e.button === 2 || e.altKey || e.pointerType === "touch") kind = "orbit";
        else kind = toolRef.current === "paint" ? "paint" : "outline";
      }
      const how = e.shiftKey ? (e.ctrlKey || e.metaKey ? "remove" : "add") : "new";
      drag = { x: e.clientX, y: e.clientY, kind, how, poly: kind === "outline" ? local(e) : [] };
      if (kind === "paint") paintAt(e.clientX, e.clientY);
    };
    const onMove = (e: PointerEvent) => {
      const b = brushRef.current;
      if (b) {
        const [x, y] = local(e);
        const show = sceneRef.current === "splats" && toolRef.current === "paint" && e.pointerType === "mouse";
        b.style.opacity = show ? "1" : "0";
        b.style.transform = `translate(${x - BRUSH}px, ${y - BRUSH}px)`;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      const s = sceneRef.current;
      if (s === "photo") {
        st.angle += dx * 0.008;
        st.load = Math.min(2.5, Math.max(0.15, st.load * Math.exp(-dy * 0.006)));
      } else if (s === "terrain") {
        st.tYaw += dx * 0.006;
        st.tPitch = Math.min(0.5, Math.max(-0.8, st.tPitch - dy * 0.005));
      } else if (drag.kind === "orbit") {
        st.yaw -= dx * 0.008;
        st.pitch = Math.min(1.2, Math.max(0.05, st.pitch + dy * 0.006));
      } else if (drag.kind === "paint") {
        paintAt(e.clientX, e.clientY);
      } else if (drag.kind === "outline") {
        const [x, y] = local(e);
        const p = drag.poly;
        if (Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) > 3) { p.push(x, y); drawOutline(p); }
      }
    };
    const onUp = () => {
      if (drag?.kind === "outline") {
        finishOutline(drag.poly, drag.how);
        drawOutline([]);
      }
      drag = null;
    };
    const onLeave = () => { if (brushRef.current) brushRef.current.style.opacity = "0"; };
    const onDbl = () => { if (sceneRef.current === "splats") { tag.fill(0); report(); } };
    const onCtx = (e: Event) => e.preventDefault();
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("dblclick", onDbl);
    canvas.addEventListener("contextmenu", onCtx);

    let onScreen = true;
    const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; });
    io.observe(canvas);

    let raf = 0, last = performance.now(), time = 0, rendered = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!onScreen || document.hidden) return;
      if (!reduce) time += dt;
      else if (rendered && !drag) return; // reduced motion, draw only on interaction
      rendered = true;

      const s = sceneRef.current;
      const scale = s === "terrain" ? 0.5 : Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      const { bg, fg, accent } = colors;

      if (s === "photo" || s === "terrain") {
        const P = s === "photo" ? photo : terrain;
        gl.disable(gl.BLEND);
        gl.useProgram(P.p);
        gl.bindVertexArray(emptyVao);
        gl.uniform2f(P.u("uRes"), w, h);
        gl.uniform1i(P.u("uMode"), mode);
        gl.uniform3fv(P.u("uBg"), bg);
        gl.uniform3fv(P.u("uFg"), fg);
        gl.uniform3fv(P.u("uAccent"), accent);
        if (s === "photo") {
          gl.uniform1f(P.u("uAngle"), st.angle + (reduce ? 0 : 0.12 * Math.sin(time * 0.3)));
          gl.uniform1f(P.u("uLoad"), st.load * (reduce ? 1 : 0.8 + 0.2 * Math.sin(time * 0.7)));
          gl.uniform3fv(P.u("uCmf"), cmf);
        } else {
          gl.uniform1f(P.u("uTime"), time + 4.0);
          gl.uniform1f(P.u("uYaw"), st.tYaw);
          gl.uniform1f(P.u("uPitch"), st.tPitch);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        return;
      }

      // Splats: orbit camera, sort back to front, draw instanced quads.
      if (!touched && !reduce) st.yaw += dt * 0.12;
      const target = [0, 1.0, 0], dist = 9.5;
      const eye = [
        target[0] + dist * Math.cos(st.pitch) * Math.sin(st.yaw),
        target[1] + dist * Math.sin(st.pitch),
        target[2] + dist * Math.cos(st.pitch) * Math.cos(st.yaw),
      ];
      const fov = (50 * Math.PI) / 180;
      const VP = mul(perspective(fov, w / h, 0.1, 60), lookAt(eye, target));
      const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
      for (let i = 0; i < N_SPLATS; i++) {
        const x = S.pos[i * 3], y = S.pos[i * 3 + 1], z = S.pos[i * 3 + 2];
        const cw = VP[3] * x + VP[7] * y + VP[11] * z + VP[15];
        const cx = VP[0] * x + VP[4] * y + VP[8] * z + VP[12];
        const cy = VP[1] * x + VP[5] * y + VP[9] * z + VP[13];
        scr[i * 3] = ((cx / cw + 1) / 2) * cssW;
        scr[i * 3 + 1] = ((1 - cy / cw) / 2) * cssH;
        scr[i * 3 + 2] = cw;
        keys[i] = Math.floor(Math.max(0, 60 - cw) * 256) * 16384 + i; // far first
      }
      keys.sort();
      for (let j = 0; j < N_SPLATS; j++) {
        const i = keys[j] % 16384, o = j * 8;
        inst[o] = S.pos[i * 3]; inst[o + 1] = S.pos[i * 3 + 1]; inst[o + 2] = S.pos[i * 3 + 2];
        inst[o + 3] = col[i * 3]; inst[o + 4] = col[i * 3 + 1]; inst[o + 5] = col[i * 3 + 2];
        inst[o + 6] = S.scl[i]; inst[o + 7] = tag[i];
      }
      gl.clearColor(bg[0], bg[1], bg[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(splat.p);
      gl.bindVertexArray(splatVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst);
      gl.uniformMatrix4fv(splat.u("uVP"), false, VP);
      gl.uniform2f(splat.u("uRes"), w, h);
      gl.uniform1f(splat.u("uFocal"), (h / 2) / Math.tan(fov / 2));
      gl.uniform1i(splat.u("uMode"), mode);
      gl.uniform3fv(splat.u("uFg"), fg);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, N_SPLATS);
      gl.bindVertexArray(null);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObs.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("dblclick", onDbl);
      canvas.removeEventListener("contextmenu", onCtx);
    };
  }, []);

  const current = SCENES.find((s) => s.id === scene)!;
  const tab =
    "h-7 px-2.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground aria-selected:bg-primary aria-selected:text-primary-foreground";
  const tb =
    "h-6 px-2 text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-foreground/15 aria-pressed:text-foreground";

  return (
    <section id="viewport" className="panel" aria-label="Interactive viewport">
      <div className="panel-h pr-1.5" tabIndex={0} aria-expanded="true">
        <span className="flex-1">Viewport</span>
        <div role="tablist" aria-label="Scene" className="flex ring-1 ring-foreground/15">
          {SCENES.map((s) => (
            <button key={s.id} role="tab" type="button" aria-selected={scene === s.id} className={tab} onClick={() => setScene(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className={
            "block w-full aspect-[4/3] sm:aspect-[16/7] " +
            (scene === "splats" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing")
          }
          style={{ touchAction: "pan-y" }}
          aria-label={`${current.label} simulation`}
        />
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
          <polygon ref={lassoRef} points="" fill="rgb(255 70 212 / 0.08)" stroke="rgb(255 70 212)" strokeWidth="1.2" strokeDasharray="5 3" />
        </svg>
        <div
          ref={brushRef}
          aria-hidden="true"
          style={{ width: BRUSH * 2, height: BRUSH * 2 }}
          className="pointer-events-none absolute left-0 top-0 rounded-full ring-1 ring-foreground/80 opacity-0 transition-opacity"
        />
        <div aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 font-mono text-[11px] leading-snug text-foreground/70">
          User Perspective
          <br />
          (1) Scene | {current.object}
        </div>
        {scene === "splats" && (
          <>
            <div className="absolute right-2 top-2 flex flex-wrap justify-end items-center gap-1.5 font-mono text-[11px]">
              <div className="flex ring-1 ring-foreground/15 bg-background/70 backdrop-blur">
                <button type="button" className={tb} aria-pressed={tool === "select"} onClick={() => setTool("select")}>Select</button>
                <button type="button" className={tb} aria-pressed={tool === "paint"} onClick={() => setTool("paint")}>Paint</button>
              </div>
              {tool === "paint" && (
                <div className="flex items-center gap-1 h-6 px-1.5 ring-1 ring-foreground/15 bg-background/70 backdrop-blur">
                  {PAINTS.map((p, k) => (
                    <button
                      key={p.name}
                      type="button"
                      title={p.name}
                      aria-label={`${p.name} paint`}
                      aria-pressed={paint === k}
                      onClick={() => setPaint(k)}
                      className="size-3.5 rounded-full ring-offset-1 ring-offset-background aria-pressed:ring-1 aria-pressed:ring-foreground"
                      style={{ background: `rgb(${p.c.map((v) => Math.round(v * 255)).join(" ")})` }}
                    />
                  ))}
                </div>
              )}
              <div className="flex ring-1 ring-foreground/15 bg-background/70 backdrop-blur">
                <button type="button" className={tb} onClick={() => actions.current.swap()} title="Swap subject and context">Swap</button>
                <button type="button" className={tb} onClick={() => actions.current.clear()} title="Clear the selection and paint">Clear</button>
              </div>
            </div>
            <div aria-live="polite" className="pointer-events-none absolute left-3 bottom-2.5 font-mono text-[11px] leading-snug text-foreground/80">
              <span style={{ color: "rgb(255 70 212)" }}>●</span> Subject {stats.subject.toLocaleString()}
              {stats.parts && <span className="text-foreground/60"> ({stats.parts})</span>}
              {"  "}
              <span style={{ color: "rgb(56 219 255)" }}>●</span> Context {stats.context.toLocaleString()}
            </div>
          </>
        )}
        {failed && (
          <div className="absolute inset-0 grid place-items-center p-6 text-sm text-muted-foreground">
            This viewport needs WebGL2.
          </div>
        )}
      </div>
      <p className="px-5 md:px-6 py-3.5 border-t border-border text-sm leading-relaxed text-muted-foreground">
        <Caption id={scene} total={N_SPLATS} />
      </p>
    </section>
  );
}
