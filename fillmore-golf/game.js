'use strict';
/* Fillmore Golf Club, Locke NY. Single player stroke play on terrain built from
   USGS 3DEP lidar, NYS orthoimagery and GolfTraxx GPS hole positions. */
(async function () {
const C = window.COURSE;
const $ = id => document.getElementById(id);
const loadMsg = $('load-msg');

/* ---------------- data ---------------- */
async function unz(b64) {
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const s = new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
let COVER, HGT;
try {
  if (!window.DecompressionStream) throw new Error('no DecompressionStream');
  COVER = await unz(C.cover);
  const hb = await unz(C.heights);
  const d = new Int16Array(hb.buffer, 0, hb.byteLength >> 1);
  HGT = new Float32Array(C.hW * C.hH);
  for (let j = 0; j < C.hH; j++) {
    let acc = 0;
    for (let i = 0; i < C.hW; i++) { const k = j * C.hW + i; acc += d[k]; HGT[k] = C.hBase + acc / 100; }
  }
} catch (e) {
  loadMsg.textContent = 'This browser could not load the course data. Try a current version of Chrome, Safari, Edge or Firefox.';
  return;
}

const HW = C.hW, HH = C.hH, HC = C.hc, CW = C.cW, CH = C.cH, CC = C.cc;
/* box-blurred copy of the terrain, used only for drawing contour lines */
const HSM = (() => {
  const a = Float32Array.from(HGT), b = new Float32Array(a.length), R = 3;
  for (let pass = 0; pass < 2; pass++) {
    for (let j = 0; j < HH; j++) { let s = 0, n = 0; const o = j * HW;
      for (let i = -R; i < HW; i++) { if (i + R < HW) { s += a[o + i + R]; n++; } if (i - R - 1 >= 0) { s -= a[o + i - R - 1]; n--; } if (i >= 0) b[o + i] = s / n; } }
    for (let i = 0; i < HW; i++) { let s = 0, n = 0;
      for (let j = -R; j < HH; j++) { if (j + R < HH) { s += b[(j + R) * HW + i]; n++; } if (j - R - 1 >= 0) { s -= b[(j - R - 1) * HW + i]; n--; } if (j >= 0) a[j * HW + i] = s / n; } }
  }
  return a;
})();
const GSM = (() => {
  const g = new Float32Array(HW * HH);
  for (let j = 1; j < HH - 1; j++) for (let i = 1; i < HW - 1; i++) {
    const k = j * HW + i; g[k] = Math.hypot(HSM[k + 1] - HSM[k - 1], HSM[k + HW] - HSM[k - HW]) / (2 * HC);
  }
  return g;
})();
let SHADE = null;
function buildShade() {
  SHADE = new Float32Array(HW * HH);
  const exag = 3.2, e = 1;
  for (let j = 0; j < HH; j++) for (let i = 0; i < HW; i++) {
    const i0 = i > e ? i - e : 0, i1 = i < HW - 1 - e ? i + e : HW - 1, j0 = j > e ? j - e : 0, j1 = j < HH - 1 - e ? j + e : HH - 1;
    const gx = (HGT[j * HW + i1] - HGT[j * HW + i0]) / ((i1 - i0) * HC), gy = (HGT[j1 * HW + i] - HGT[j0 * HW + i]) / ((j1 - j0) * HC);
    const gvx = -HD[1] * gx + HD[0] * gy, gvy = -(HD[0] * gx + HD[1] * gy);
    const nx = -gvx * exag, ny = -gvy * exag, nl = Math.hypot(nx, ny, 1);
    const lam = (nx * LIGHT[0] + ny * LIGHT[1] + LIGHT[2]) / nl;
    SHADE[j * HW + i] = Math.max(0.45, Math.min(1.5, 0.25 + 0.75 * lam / LIGHT[2]));
  }
}
function gridAt(A, x, y) {
  let fx = x / HC - 0.5, fy = y / HC - 0.5;
  if (fx < 0) fx = 0; else if (fx > HW - 1.001) fx = HW - 1.001;
  if (fy < 0) fy = 0; else if (fy > HH - 1.001) fy = HH - 1.001;
  const i = fx | 0, j = fy | 0, ax = fx - i, ay = fy - j, k = j * HW + i;
  return (A[k] * (1 - ax) + A[k + 1] * ax) * (1 - ay) + (A[k + HW] * (1 - ax) + A[k + HW + 1] * ax) * ay;
}
function hAt(x, y) {
  let fx = x / HC - 0.5, fy = y / HC - 0.5;
  if (fx < 0) fx = 0; else if (fx > HW - 1.001) fx = HW - 1.001;
  if (fy < 0) fy = 0; else if (fy > HH - 1.001) fy = HH - 1.001;
  const i = fx | 0, j = fy | 0, ax = fx - i, ay = fy - j, k = j * HW + i;
  return (HGT[k] * (1 - ax) + HGT[k + 1] * ax) * (1 - ay) + (HGT[k + HW] * (1 - ax) + HGT[k + HW + 1] * ax) * ay;
}
function grad(x, y) {
  const e = 0.5;
  return [(hAt(x + e, y) - hAt(x - e, y)) / (2 * e), (hAt(x, y + e) - hAt(x, y - e)) / (2 * e)];
}

const ROUGH = 0, FAIR = 1, GREEN = 2, FRINGE = 3, TEE = 4, SAND = 5, WATER = 6, WOODS = 7,
  ROAD = 8, PATH = 9, BLDG = 10, LONG = 11, CREEK = 12, GRAVEL = 13;
function cvAt(x, y) {
  const i = Math.floor(x / CC), j = Math.floor(y / CC);
  if (i < 0 || j < 0 || i >= CW || j >= CH) return 0x80 | WOODS;
  return COVER[j * CW + i];
}
const cls = v => v & 31, isOB = v => (v & 0x80) !== 0;
/* bilinear majority vote between the four nearest cells, gives smooth edges when zoomed in */
function cvSmooth(x, y) {
  const fx = x / CC - 0.5, fy = y / CC - 0.5, i = Math.floor(fx), j = Math.floor(fy), ax = fx - i, ay = fy - j;
  const c00 = cvAt((i + 0.5) * CC, (j + 0.5) * CC), c10 = cvAt((i + 1.5) * CC, (j + 0.5) * CC);
  const c01 = cvAt((i + 0.5) * CC, (j + 1.5) * CC), c11 = cvAt((i + 1.5) * CC, (j + 1.5) * CC);
  if (c00 === c10 && c00 === c01 && c00 === c11) return c00;
  const w = [(1 - ax) * (1 - ay), ax * (1 - ay), (1 - ax) * ay, ax * ay], c = [c00, c10, c01, c11];
  let best = c00, bw = -1;
  for (let a = 0; a < 4; a++) { let t = 0; for (let b = 0; b < 4; b++) if (c[b] === c[a]) t += w[b]; if (t > bw) { bw = t; best = c[a]; } }
  return best;
}
const isWet = k => k === WATER || k === CREEK;

/* e: bounce restitution, fr: impact friction, mu: rolling resistance, lie: distance factor, err: dispersion factor */
const SURF = [
  { n: 'Rough',      e: .20, fr: .85, mu: .40, lie: .86, err: 1.3 },
  { n: 'Fairway',    e: .30, fr: .78, mu: .14, lie: 1,   err: 1 },
  { n: 'Green',      e: .24, fr: .72, mu: .075, lie: 1,  err: 1 },
  { n: 'Fringe',     e: .26, fr: .78, mu: .11, lie: 1,   err: 1 },
  { n: 'Tee box',    e: .30, fr: .78, mu: .14, lie: 1,   err: 1 },
  { n: 'Bunker',     e: .03, fr: .97, mu: 1.6, lie: .74, err: 1.4 },
  { n: 'Water',      e: 0,   fr: 1,   mu: 5,   lie: 0,   err: 1 },
  { n: 'Trees',      e: .16, fr: .88, mu: .55, lie: .6,  err: 1.8 },
  { n: 'Road',       e: .55, fr: .45, mu: .035, lie: 1,  err: 1 },
  { n: 'Cart path',  e: .52, fr: .5,  mu: .045, lie: 1,  err: 1 },
  { n: 'Building',   e: .35, fr: .6,  mu: .3,  lie: .5,  err: 2 },
  { n: 'Long grass', e: .12, fr: .9,  mu: .7,  lie: .7,  err: 1.6 },
  { n: 'Creek',      e: 0,   fr: 1,   mu: 5,   lie: 0,   err: 1 },
  { n: 'Gravel',     e: .4,  fr: .6,  mu: .25, lie: .9,  err: 1.2 },
];

/* trees: x, y, crown radius, height, type (1 = pine) */
const TREES = [], TG = new Map(), TGS = 12, NOTREES = [];
for (let i = 0; i < C.trees.length; i += 5) {
  const t = { x: C.trees[i], y: C.trees[i + 1], r: C.trees[i + 2], h: C.trees[i + 3], pine: C.trees[i + 4] === 1, id: i / 5 };
  t.g = hAt(t.x, t.y); t.cb = t.pine ? 0.12 * t.h : 0.33 * t.h;
  TREES.push(t);
  const i0 = Math.floor((t.x - t.r) / TGS), i1 = Math.floor((t.x + t.r) / TGS);
  const j0 = Math.floor((t.y - t.r) / TGS), j1 = Math.floor((t.y + t.r) / TGS);
  for (let a = i0; a <= i1; a++) for (let b = j0; b <= j1; b++) {
    const k = a * 4096 + b; let l = TG.get(k); if (!l) TG.set(k, l = []); l.push(t);
  }
}
const treesNear = (x, y) => TG.get(Math.floor(x / TGS) * 4096 + Math.floor(y / TGS)) || NOTREES;
/* 0 = clear, 1 = inside foliage, 2 = trunk */
function inTree(t, x, y, z) {
  const dx = x - t.x, dy = y - t.y, d2 = dx * dx + dy * dy;
  if (d2 > t.r * t.r) return 0;
  const rel = z - t.g;
  if (rel < 0 || rel > t.h) return 0;
  const d = Math.sqrt(d2);
  if (rel < t.cb) return d < 0.2 + t.h * 0.01 ? 2 : 0;
  if (t.pine) return d < t.r * (t.h - rel) / (t.h - t.cb) ? 1 : 0;
  const zc = (t.cb + t.h) / 2, a = (t.h - t.cb) / 2;
  return (d / t.r) ** 2 + ((rel - zc) / a) ** 2 < 1 ? 1 : 0;
}

/* ---------------- clubs and flight ---------------- */
const G = 9.81, KD = 0.0048, YD = 1.09361, FT = 3.28084, CUP = 0.054;
const CLUBS = [
  { n: 'Driver', carry: 230, ang: 12, L: .0027, bite: .07, roll: 0.1 },
  { n: '3 Wood', carry: 210, ang: 12.5, L: .0030, bite: .10, roll: 0.08 },
  { n: '5 Wood', carry: 195, ang: 13.5, L: .0034, bite: .13, roll: 0.07 },
  { n: '4 Hybrid', carry: 183, ang: 14.5, L: .0037, bite: .16, roll: 0.06 },
  { n: '5 Iron', carry: 172, ang: 15.5, L: .0040, bite: .19, roll: 0.05 },
  { n: '6 Iron', carry: 162, ang: 17, L: .0043, bite: .22, roll: 0.04 },
  { n: '7 Iron', carry: 152, ang: 19, L: .0046, bite: .26, roll: 0.035 },
  { n: '8 Iron', carry: 140, ang: 21.5, L: .0050, bite: .30, roll: 0.03 },
  { n: '9 Iron', carry: 128, ang: 24, L: .0053, bite: .34, roll: 0.025 },
  { n: 'P Wedge', carry: 115, ang: 27, L: .0056, bite: .40, roll: 0.02 },
  { n: 'G Wedge', carry: 100, ang: 30, L: .0058, bite: .45, roll: 0.01 },
  { n: 'S Wedge', carry: 85, ang: 33, L: .0059, bite: .50, roll: 0 },
  { n: 'Putter', putter: true },
];
const PUTTER = CLUBS.length - 1;

function accel(b, wx, wy, out) {
  // wind is stronger with height above the ground (power-law profile, 10 m reference)
  const hw = Math.pow(Math.max(b.z - (b.g0 || 0), 0.5) / 10, 0.2) * 1.15;
  const rx = b.vx - wx * hw, ry = b.vy - wy * hw, rz = b.vz;
  const sp = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1e-9, hs = Math.hypot(rx, ry) || 1e-9;
  const hdx = rx / hs, hdy = ry / hs;
  let ax = -KD * sp * rx, ay = -KD * sp * ry, az = -KD * sp * rz - G;
  const lm = b.L * (b.v0 || sp);  // backspin lift ~ spin x airspeed, spin set at launch
  ax += lm * -rz * hdx; ay += lm * -rz * hdy; az += lm * hs;
  const sm = b.S * sp * sp;       // side force, right of travel = (-dy, dx)
  ax += sm * -hdy; ay += sm * hdx;
  out[0] = ax; out[1] = ay; out[2] = az;
}
const ACC = [0, 0, 0];
function integrate(b, dt, wx, wy) {
  accel(b, wx, wy, ACC);
  b.vx += ACC[0] * dt; b.vy += ACC[1] * dt; b.vz += ACC[2] * dt;
  b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
  const k = Math.exp(-dt / 7); b.L *= k; b.S *= k;
}
/* carry table per club on flat ground, no wind, so partial swings map to distance */
for (const c of CLUBS) {
  if (c.putter) continue;
  const tab = [];
  for (let v = 3; v <= 90; v += 1.5) {
    const b = { x: 0, y: 0, z: 0, g0: 0, v0: v, vx: v * Math.cos(c.ang * Math.PI / 180), vy: 0, vz: v * Math.sin(c.ang * Math.PI / 180), L: c.L, S: 0 };
    let t = 0;
    while (t < 20) { integrate(b, 1 / 120, 0, 0); t += 1 / 120; if (b.z < 0) break; }
    tab.push([v, b.x]);
  }
  c.tab = tab;
}
function vForCarry(c, m) {
  const t = c.tab;
  if (m <= t[0][1]) return t[0][0] * m / Math.max(t[0][1], 0.01);
  for (let i = 1; i < t.length; i++) if (t[i][1] >= m) {
    const a = t[i - 1], b = t[i]; return a[0] + (b[0] - a[0]) * (m - a[1]) / (b[1] - a[1]);
  }
  return t[t.length - 1][0];
}

/* ---------------- random ---------------- */
const rnd = Math.random;
let NORAND = false;
function randn() {
  if (NORAND) return 0; let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function h2(i, j) { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const a = h2(i, j), b = h2(i + 1, j), c = h2(i, j + 1), d = h2(i + 1, j + 1);
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/* ---------------- settings and storage ---------------- */
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
const settings = Object.assign({ speed: 'normal', season: 'summer', sound: true, topo: true }, lsGet('fgc_settings', {}));
const saveSettings = () => lsSet('fgc_settings', settings);
const METER_T = { relaxed: 1.45, normal: 1.1, fast: 0.8 };

/* ---------------- sound ---------------- */
let AC = null;
function audio() {
  if (!settings.sound) return null;
  try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; }
  return AC;
}
function noiseBurst(dur, freq, q, gain, type) {
  const ac = audio(); if (!ac) return;
  const n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (rnd() * 2 - 1) * Math.pow(1 - i / n, 3);
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = ac.createGain(); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(ac.destination); src.start();
}
function tone(freq, dur, gain, when) {
  const ac = audio(); if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + (when || 0);
  o.frequency.value = freq; o.type = 'sine';
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
}
const SFX = {
  hit: () => { noiseBurst(0.09, 2400, 0.8, 0.9); tone(180, 0.08, 0.25); },
  putt: () => { noiseBurst(0.05, 1800, 1.5, 0.35); },
  tree: () => { noiseBurst(0.12, 700, 1.2, 0.7); tone(320, 0.06, 0.15); },
  splash: () => { noiseBurst(0.5, 900, 0.4, 0.8, 'lowpass'); },
  cup: () => { tone(900, 0.05, 0.25); tone(700, 0.05, 0.22, 0.07); tone(520, 0.08, 0.2, 0.15); },
  land: () => { noiseBurst(0.06, 400, 1, 0.3); },
};

/* ---------------- canvas and camera ---------------- */
const cv = $('view'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
}
window.addEventListener('resize', resize); resize();

let hole = null;                 // current hole record
let HD = [0, -1];                // hole direction (unit, world)
const toV = (x, y) => [-HD[1] * x + HD[0] * y, -(HD[0] * x + HD[1] * y)];
const fromV = (X, Y) => [-HD[1] * X - HD[0] * Y, HD[0] * X - HD[1] * Y];
const vecToV = (x, y) => toV(x, y);

const cam = { vx: 0, vy: 0, s: 2, tvx: 0, tvy: 0, ts: 2, zoom: 1, panX: 0, panY: 0, mode: 'aim' };
const TOPPAD = () => (W < 520 ? 150 : 120), BOTPAD = () => 150;
function screenCenter() { return [W / 2, TOPPAD() + (H - TOPPAD() - BOTPAD()) / 2]; }
function w2s(x, y) { const [X, Y] = toV(x, y), [cx, cy] = screenCenter(); return [(X - cam.vx) * cam.s + cx, (Y - cam.vy) * cam.s + cy]; }
function s2w(sx, sy) { const [cx, cy] = screenCenter(); return fromV((sx - cx) / cam.s + cam.vx, (sy - cy) / cam.s + cam.vy); }

/* ---------------- prerendered layers ---------------- */
const SUMMER = ['#35602a', '#3f6c2e', '#4a7431', '#335c29', '#527d36'];
const AUTUMN = ['#b8412c', '#d0702c', '#d9a53a', '#c4552a', '#8f3a28', '#e0b84a', '#6f8a3a', '#a8602c'];
const PINES = ['#1f3b2a', '#23412d', '#1b3526', '#284a31'];
function hexRGB(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
const BASE = {};
[[ROUGH, '#4e7b39'], [FAIR, '#67a649'], [GREEN, '#79c25a'], [FRINGE, '#5f9e45'], [TEE, '#6bab4c'], [SAND, '#e2d3a0'],
 [WATER, '#2e6376'], [WOODS, '#34522a'], [ROAD, '#5b5b58'], [PATH, '#b6ae9e'], [BLDG, '#7b7e80'], [LONG, '#6c7a3f'],
 [CREEK, '#3a6a73'], [GRAVEL, '#a29a8a']].forEach(([k, c]) => BASE[k] = hexRGB(c));
const LIGHT = (() => { const l = [-0.55, -0.75, 0.9], n = Math.hypot(...l); return l.map(v => v / n); })();

function shadeInto(data, tdata, cw, ch, vx0, vy0, ppm, rowOff) {
  const pxm = 1 / ppm, jit = Math.min(0.9, 0.35 * ppm * CC) * CC;
  for (let py = 0; py < ch; py++) {
    const vy = vy0 + (py + 0.5) * pxm;
    for (let px = 0; px < cw; px++) {
      const vx = vx0 + (px + 0.5) * pxm;
      const w = fromV(vx, vy), x = w[0], y = w[1];
      const o = (py * cw + px) * 4;
      const ay = py + rowOff, jx = (h2(px * 7 + 3, ay * 13 + 1) - 0.5) * jit, jy = (h2(px * 11 + 5, ay * 3 + 7) - 0.5) * jit;
      const v = cvSmooth(x + jx, y + jy), k = cls(v);
      if (tdata) {
        if (k === GREEN || k === FRINGE || isWet(k)) tdata[o + 3] = 0;
        else {
          const gm = gridAt(GSM, x, y) + 1e-4, t = gridAt(HSM, x, y);
          const f = Math.abs(t - Math.round(t)), idx = Math.round(t) % 5 === 0;
          const wpx = f / gm * ppm, lw = idx ? 0.9 : 0.5;
          const a = wpx < lw ? 1 : wpx < lw + 0.8 ? (lw + 0.8 - wpx) / 0.8 : 0;
          tdata[o] = 20; tdata[o + 1] = 30; tdata[o + 2] = 16; tdata[o + 3] = Math.round(a * (idx ? 170 : 110));
        }
      }
      let [r, gg, b] = BASE[k];
      let m = 1;
      const n1 = vnoise(x * 0.25, y * 0.25), n2 = vnoise(x * 1.3, y * 1.3);
      if (k === FAIR || k === TEE) { m *= (Math.floor(vx / 7) & 1) ? 1.05 : 0.96; m *= 0.95 + n1 * 0.1; }
      else if (k === GREEN) { m *= (Math.floor(vx / 2) & 1) ? 1.03 : 0.98; m *= 0.97 + n2 * 0.06; }
      else if (k === FRINGE) { m *= 0.96 + n2 * 0.06; }
      else if (k === ROUGH) { m *= 0.9 + n1 * 0.14 + n2 * 0.06; }
      else if (k === LONG || k === WOODS) { m *= 0.8 + n1 * 0.25 + n2 * 0.15; }
      else if (k === SAND) { m *= 0.95 + h2(px, ay) * 0.08; }
      else if (isWet(k)) { m *= 0.9 + n1 * 0.12 + n2 * 0.05; }
      else { m *= 0.94 + n2 * 0.1; }
      if (!isWet(k)) m *= gridAt(SHADE, x, y);
      if (isOB(v) && k !== ROAD) m *= 0.8;
      data[o] = Math.min(255, r * m); data[o + 1] = Math.min(255, gg * m); data[o + 2] = Math.min(255, b * m); data[o + 3] = 255;
      if (!isOB(v)) {
        const e = Math.max(0.45, 0.8 / ppm);
        if (isOB(cvAt(x + e, y)) || isOB(cvAt(x - e, y)) || isOB(cvAt(x, y + e)) || isOB(cvAt(x, y - e))) {
          if ((Math.floor((vx + vy) / 2.2) & 1) === 0) { data[o] = 245; data[o + 1] = 245; data[o + 2] = 240; }
        }
      }
      if (isOB(v) && k !== ROAD && k !== BLDG) { const l = (data[o] + data[o + 1] + data[o + 2]) / 3; data[o] = data[o] * .75 + l * .25; data[o + 1] = data[o + 1] * .75 + l * .25; data[o + 2] = data[o + 2] * .75 + l * .25; }
    }
  }
}

function drawTrees(g, vx0, vy0, ppm, x0, y0, x1, y1) {
  const list = [];
  for (const t of TREES) {
    const [X, Y] = toV(t.x, t.y);
    if (X < x0 - t.r - 20 || X > x1 + t.r + 20 || Y < y0 - t.r - 20 || Y > y1 + t.r + 20) continue;
    list.push([t, (X - vx0) * ppm, (Y - vy0) * ppm]);
  }
  const sdx = -LIGHT[0], sdy = -LIGHT[1];
  g.fillStyle = 'rgba(8,22,10,0.30)';
  for (const [t, X, Y] of list) {
    const off = t.h * 0.45 * ppm, r = t.r * ppm;
    g.beginPath(); g.ellipse(X + sdx * off, Y + sdy * off, r, r * 0.92, 0, 0, Math.PI * 2); g.fill();
  }
  list.sort((a, b) => a[0].h - b[0].h);
  const autumn = settings.season === 'autumn';
  for (const [t, X, Y] of list) {
    const r = t.r * ppm, s1 = h2(t.id, 17), s2 = h2(t.id, 29), s3 = h2(t.id, 41);
    if (t.pine) {
      const base = PINES[Math.floor(s1 * PINES.length)];
      star(g, X, Y, r, r * 0.58, 9, s2 * 6.28, shadeHex(base, 0.85));
      star(g, X - r * 0.12, Y - r * 0.14, r * 0.72, r * 0.42, 8, s3 * 6.28, base);
      star(g, X - r * 0.2, Y - r * 0.24, r * 0.4, r * 0.22, 7, s1 * 6.28, shadeHex(base, 1.3));
    } else {
      let base;
      if (autumn) base = s1 < 0.22 ? SUMMER[Math.floor(s2 * SUMMER.length)] : AUTUMN[Math.floor(s2 * AUTUMN.length)];
      else base = SUMMER[Math.floor(s2 * SUMMER.length)];
      g.fillStyle = shadeHex(base, 0.72); circ(g, X, Y, r);
      for (let i = 0; i < 6; i++) {
        const a = s3 * 6.28 + i * 1.05, d = r * 0.42;
        g.fillStyle = shadeHex(base, 0.9 + 0.06 * (i % 3)); circ(g, X + Math.cos(a) * d, Y + Math.sin(a) * d, r * 0.55);
      }
      g.fillStyle = shadeHex(base, 1.06); circ(g, X - r * 0.22, Y - r * 0.26, r * 0.48);
      g.fillStyle = shadeHex(base, 1.14); circ(g, X - r * 0.32, Y - r * 0.36, r * 0.2);
    }
  }
}
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, 0.5), 0, Math.PI * 2); g.fill(); }
function star(g, x, y, ro, ri, n, rot, col) {
  g.fillStyle = col; g.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i & 1 ? ri : ro; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.fill();
}
const _shadeCache = new Map();
function shadeHex(h, m) {
  const key = h + m; let v = _shadeCache.get(key); if (v) return v;
  const [r, g, b] = hexRGB(h); v = `rgb(${Math.min(255, r * m) | 0},${Math.min(255, g * m) | 0},${Math.min(255, b * m) | 0})`;
  _shadeCache.set(key, v); return v;
}

async function makeLayer(vx0, vy0, wM, hM, ppm, withTopo, token) {
  const cw = Math.ceil(wM * ppm), ch = Math.ceil(hM * ppm);
  const base = document.createElement('canvas'); base.width = cw; base.height = ch;
  const g = base.getContext('2d'); const id = g.createImageData(cw, ch);
  let topo = null, tg = null, td = null;
  if (withTopo) { topo = document.createElement('canvas'); topo.width = cw; topo.height = ch; tg = topo.getContext('2d'); td = tg.createImageData(cw, ch); }
  const rows = Math.max(8, Math.floor(160000 / cw));
  for (let r0 = 0; r0 < ch; r0 += rows) {
    const n = Math.min(rows, ch - r0), off = r0 * cw * 4, len = n * cw * 4;
    shadeInto(id.data.subarray(off, off + len), td ? td.data.subarray(off, off + len) : null, cw, n, vx0, vy0 + r0 / ppm, ppm, r0);
    await new Promise(r => setTimeout(r, 0));
    if (token !== buildToken) return null;
  }
  g.putImageData(id, 0, 0);
  if (td) tg.putImageData(td, 0, 0);
  drawTrees(g, vx0, vy0, ppm, vx0, vy0, vx0 + wM, vy0 + hM);
  return { base, topo, vx0, vy0, ppm, wM, hM };
}
let buildToken = 0;
let layerHole = null, layerGreen = null, layerBack = null;

/* ---------------- round state ---------------- */
const HOLES = C.holes;
let round = null;   // { holes:[indices], idx, scores:[], putts:[], pins:[] , kind }
let ball = null, shot = null, state = 'title', pin = null;
let strokes = 0, putts = 0, ci = 0, aim = null, clubManual = false;
let wind = { x: 0, y: 0, mph: 0 };
let lastShotYds = null, lastMsg = '';
let trail = [];

function newWind() {
  const mph = Math.max(0, Math.min(16, 3 + rnd() * 9 + randn() * 2));
  const a = rnd() * Math.PI * 2, ms = mph / 2.237;
  wind = { x: Math.cos(a) * ms, y: Math.sin(a) * ms, mph: Math.round(mph) };
}
function holePath(h) { return [h.tee, h.aim, h.gc]; }
function holeYds(h) { return h.yds; }
function elevFt(a, b) { return (hAt(b[0], b[1]) - hAt(a[0], a[1])) * FT; }
function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

function startRound(kind) {
  const idx = kind === 'front' ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : kind === 'back' ? [9, 10, 11, 12, 13, 14, 15, 16, 17] : [...Array(18).keys()];
  round = { kind, holes: idx, i: 0, scores: [], putts: [], pins: idx.map(n => Math.floor(rnd() * HOLES[n].pins.length)) };
  saveRound();
  startHole();
}
function saveRound() { if (round) lsSet('fgc_round', round); }
function clearRound() { try { localStorage.removeItem('fgc_round'); } catch (e) { } }

function startHole() {
  const n = round.holes[round.i]; hole = HOLES[n]; hole.n = n + 1;
  const d = [hole.gc[0] - hole.tee[0], hole.gc[1] - hole.tee[1]], l = Math.hypot(d[0], d[1]);
  HD = [d[0] / l, d[1] / l];
  pin = hole.pins[round.pins[round.i] % hole.pins.length];
  strokes = 0; putts = 0; lastShotYds = null; trail = [];
  ball = { x: hole.tee[0], y: hole.tee[1], z: hAt(hole.tee[0], hole.tee[1]), mode: 'rest', onTee: true };
  newWind();
  showIntro();
  // build the hole layer while the intro card is up
  layerHole = null; layerGreen = null; layerBack = null;
  setTimeout(buildLayers, 30);
}
async function buildLayers() {
  const token = ++buildToken, h0 = hole;
  buildShade();
  const pts = holePath(hole).map(p => toV(p[0], p[1]));
  const x0 = Math.min(...pts.map(p => p[0])) - 130, x1 = Math.max(...pts.map(p => p[0])) + 130;
  const y0 = Math.min(...pts.map(p => p[1])) - 100, y1 = Math.max(...pts.map(p => p[1])) + 60;
  const ppm = Math.min(2.6, 2600 / Math.max(x1 - x0, y1 - y0));
  const lh = await makeLayer(x0, y0, x1 - x0, y1 - y0, ppm, true, token);
  if (!lh || token !== buildToken) return;
  layerHole = lh;
  const btn = $('intro-go'); if (btn && hole === h0) { btn.disabled = false; btn.textContent = 'Tee off'; }
  const gv = toV(hole.gc[0], hole.gc[1]);
  const lg = await makeLayer(gv[0] - 30, gv[1] - 30, 60, 60, 14, false, token);
  if (!lg || token !== buildToken) return;
  layerGreen = lg;
  const corners = [[0, 0], [C.cW * CC, 0], [0, C.cH * CC], [C.cW * CC, C.cH * CC]].map(p => toV(p[0], p[1]));
  const bx0 = Math.min(...corners.map(p => p[0])), bx1 = Math.max(...corners.map(p => p[0]));
  const by0 = Math.min(...corners.map(p => p[1])), by1 = Math.max(...corners.map(p => p[1]));
  const lb = await makeLayer(bx0, by0, bx1 - bx0, by1 - by0, 0.55, false, token);
  if (!lb || token !== buildToken) return;
  layerBack = lb;
}

/* ---------------- shot setup ---------------- */
function lieClass() { return cls(cvAt(ball.x, ball.y)); }
function lieName() { return ball.onTee ? 'Tee box' : SURF[lieClass()].n; }
function onPuttingSurface() { const k = lieClass(); return !ball.onTee && (k === GREEN || (k === FRINGE && dist([ball.x, ball.y], pin) < 15)); }
function lieMult(club) {
  if (ball.onTee) return 1;
  const k = lieClass(); let m = SURF[k].lie;
  if (k === SAND && club >= 9 && club <= 11) m = 0.9;
  if (club === 0) m *= 0.88;
  return m;
}
function playsLike(from, to) {
  return dist(from, to) + (hAt(to[0], to[1]) - hAt(from[0], from[1])) * 1.0;
}
function pickClub(target) {
  const d = playsLike([ball.x, ball.y], target);
  if (onPuttingSurface()) return PUTTER;
  for (let i = CLUBS.length - 2; i >= 0; i--) {
    if (i === 0 && !ball.onTee) continue;
    if (CLUBS[i].carry / YD * lieMult(i) >= d * 0.97) return i;
  }
  return ball.onTee ? 0 : 1;
}
function defaultAim() {
  const b = [ball.x, ball.y];
  if (onPuttingSurface()) return pin.slice();
  const maxClub = ball.onTee ? 0 : 1;
  const reach = CLUBS[maxClub].carry / YD * lieMult(maxClub);
  if (playsLike(b, pin) <= reach + 8) return pin.slice();
  // lay up along the hole's route
  const P = holePath(hole); let best = null, bestErr = 1e9;
  for (let s = 0; s < P.length - 1; s++) {
    const a = P[s], c = P[s + 1], L = dist(a, c);
    for (let t = 0; t <= L; t += 2) {
      const p = [a[0] + (c[0] - a[0]) * t / L, a[1] + (c[1] - a[1]) * t / L];
      if (dist(p, pin) >= dist(b, pin)) continue;
      const e = Math.abs(dist(b, p) - reach);
      if (e < bestErr) { bestErr = e; best = p; }
    }
  }
  return best ? centreOnFairway(best) : pin.slice();
}
function centreOnFairway(p) {
  const dx = p[0] - ball.x, dy = p[1] - ball.y, l = Math.hypot(dx, dy) || 1, rx = -dy / l, ry = dx / l;
  let run = [], bestRun = [];
  for (let o = -22; o <= 22; o += 1) {
    const q = [p[0] + rx * o, p[1] + ry * o];
    if (cls(cvAt(q[0], q[1])) === FAIR) { run.push(o); if (run.length > bestRun.length) bestRun = run.slice(); } else run = [];
  }
  if (bestRun.length < 6) return p;
  const o = (bestRun[0] + bestRun[bestRun.length - 1]) / 2;
  return [p[0] + rx * o, p[1] + ry * o];
}
function setupShot() {
  aim = defaultAim(); clubManual = false; trail = [];
  ci = pickClub(aim);
  if (ci === PUTTER) aim = pin.slice();
  cam.zoom = 1; cam.panX = cam.panY = 0; cam.mode = ci === PUTTER ? 'putt' : 'aim';
  state = 'aim'; meter.phase = 'idle';
  updateHUD();
}
function setAim(p) {
  aim = p;
  if (!clubManual) ci = pickClub(aim);
  if (onPuttingSurface()) ci = PUTTER;
  cam.mode = ci === PUTTER ? 'putt' : 'aim';
  updateHUD();
}
function rotateAim(deg) {
  const a = deg * Math.PI / 180, dx = aim[0] - ball.x, dy = aim[1] - ball.y;
  aim = [ball.x + dx * Math.cos(a) - dy * Math.sin(a), ball.y + dx * Math.sin(a) + dy * Math.cos(a)];
  updateHUD();
}
/* flat-green equivalent length of a putt: rolling friction plus the pull of the slope */
function puttEquiv() {
  const d = dist([ball.x, ball.y], aim), dh = hAt(aim[0], aim[1]) - hAt(ball.x, ball.y);
  return Math.max(0.3, d + 0.35 + (5 / 7) * dh / SURF[GREEN].mu);
}
function puttRange() {
  const d = puttEquiv() * 1.3;
  for (const r of [3, 5, 8, 12, 18, 25, 35]) if (d <= r) return r;
  return 45;
}

/* ---------------- swing meter ---------------- */
const meter = { phase: 'idle', t0: 0, pos: 0, power: 0, acc: 0 };
const MMIN = -0.18, MMAX = 1.1;
const mPct = p => (p - MMIN) / (MMAX - MMIN) * 100;
function meterClick() {
  if (state !== 'aim') return;
  audio();
  const now = performance.now() / 1000;
  if (meter.phase === 'idle') { meter.phase = 'up'; meter.t0 = now; meter.pos = 0; $('m-p').classList.add('hidden'); return; }
  if (meter.phase === 'up') {
    meter.power = Math.max(0.02, meter.pos);
    if (ci === PUTTER) { meter.phase = 'idle'; strike(meter.power, randn() * 0.012); return; }
    meter.phase = 'down'; meter.t0 = now; $('m-p').classList.remove('hidden'); $('m-p').style.left = mPct(meter.power) + '%';
    return;
  }
  if (meter.phase === 'down') { meter.phase = 'idle'; strike(meter.power, meter.pos); }
}
function meterTick() {
  if (state !== 'aim' || meter.phase === 'idle') return;
  const now = performance.now() / 1000, T = METER_T[settings.speed] || 1.1;
  if (meter.phase === 'up') {
    meter.pos = (now - meter.t0) / T;
    if (meter.pos >= MMAX) { meter.pos = MMAX; meter.power = MMAX; if (ci === PUTTER) { meter.phase = 'idle'; strike(1, randn() * 0.012); return; } meter.phase = 'down'; meter.t0 = now; $('m-p').classList.remove('hidden'); $('m-p').style.left = mPct(MMAX) + '%'; }
  } else if (meter.phase === 'down') {
    meter.pos = meter.power - (now - meter.t0) / T * 1.15;
    if (meter.pos <= MMIN) { meter.phase = 'idle'; strike(meter.power, MMIN); return; }
  }
  $('m-mark').style.left = mPct(meter.pos) + '%';
}

/* ---------------- striking ---------------- */
function strike(power, acc) {
  const c = CLUBS[ci], from = [ball.x, ball.y];
  const k = ball.onTee ? TEE : lieClass(), s = SURF[k];
  strokes++;
  shot = { from, fromZ: ball.z, club: ci, startLie: k, bounces: 0, tree: false, lastDry: from.slice(), maxZ: 0, t: 0, fast: false, onTee: ball.onTee };
  const dx = aim[0] - ball.x, dy = aim[1] - ball.y, base = Math.atan2(dy, dx);
  ball.onTee = false; trail = [[ball.x, ball.y, 0]];
  if (c.putter) {
    putts++;
    const range = puttRange(), mu = SURF[GREEN].mu;
    const v = Math.sqrt(2 * mu * G * power * range) * (1 + randn() * 0.012);
    const a = base + acc * 0.5 + randn() * 0.004;
    Object.assign(ball, { vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 0, L: 0, S: 0, mode: 'roll' });
    shot.bite = 0; SFX.putt();
  } else {
    let err = s.err * (power > 1 ? 1 + (power - 1) * 6 : 1);
    const pf = power <= 1 ? power : 1 + (power - 1) * 0.5;
    let carry = c.carry / YD * pf * lieMult(ci) * (1 + randn() * 0.018 * err);
    let ang = c.ang;
    if (k === ROUGH) ang -= 1;
    if (k === SAND) { ang += 5; }
    if (k === WOODS) { ang = Math.min(ang, 8); carry *= 0.8; }
    const v = vForCarry(c, carry);
    const dir = base + acc * 0.06 + randn() * 0.012 * err;
    const hv = v * Math.cos(ang * Math.PI / 180);
    Object.assign(ball, {
      vx: Math.cos(dir) * hv, vy: Math.sin(dir) * hv, vz: v * Math.sin(ang * Math.PI / 180),
      L: c.L * (k === ROUGH || k === LONG ? 0.75 : 1), S: -acc * 0.011 + randn() * 0.0005 * err, mode: 'fly', v0: v, g0: hAt(ball.x, ball.y)
    });
    ball.z += 0.03;
    shot.bite = k === ROUGH || k === LONG || k === WOODS ? c.bite * 0.3 : c.bite;
    SFX.hit();
  }
  shot.power = power; shot.acc = acc;
  state = 'flight'; cam.mode = c.putter ? 'putt' : 'flight'; cam.panX = cam.panY = 0;
  updateHUD();
}

/* ---------------- simulation ---------------- */
function simStep(dt) {
  const b = ball;
  if (b.mode === 'fly') {
    const ox = b.x, oy = b.y;
    integrate(b, dt, wind.x, wind.y);
    shot.maxZ = Math.max(shot.maxZ, b.z - hAt(b.x, b.y));
    const kk = cls(cvAt(b.x, b.y)), ob = isOB(cvAt(b.x, b.y));
    if (!isWet(kk) && !ob) shot.lastDry = [b.x, b.y];
    // trees
    const step = Math.hypot(b.x - ox, b.y - oy, b.vz * dt);
    for (const t of treesNear(b.x, b.y)) {
      const r = inTree(t, b.x, b.y, b.z);
      if (r === 1) {
        if (rnd() < 1 - Math.exp(-(t.pine ? 0.5 : 0.35) * step)) {
          const sp = Math.hypot(b.vx, b.vy, b.vz), f = 0.18 + rnd() * 0.3;
          b.vx = (b.vx / sp * 0.4 + (rnd() - 0.5)) * sp * f; b.vy = (b.vy / sp * 0.4 + (rnd() - 0.5)) * sp * f; b.vz = (rnd() - 0.6) * sp * f * 0.6;
          b.L *= 0.2; b.S = 0; shot.tree = true; SFX.tree(); break;
        }
      } else if (r === 2) {
        const nx = b.x - t.x, ny = b.y - t.y, nl = Math.hypot(nx, ny) || 1, vn = (b.vx * nx + b.vy * ny) / nl;
        if (vn < 0) { b.vx -= 1.6 * vn * nx / nl; b.vy -= 1.6 * vn * ny / nl; b.vx *= 0.6; b.vy *= 0.6; shot.tree = true; SFX.tree(); }
      }
    }
    if (Math.abs(b.x) > 5000 || Math.abs(b.y) > 5000) return finishOB();
    const gz = hAt(b.x, b.y);
    if (b.z <= gz) {
      if (dist([b.x, b.y], pin) < CUP * 1.4 && b.vz > -14) return holed();
      return bounce(b, gz);
    }
  } else if (b.mode === 'roll') {
    const ox = b.x, oy = b.y, v = cvAt(b.x, b.y), k = cls(v), s = SURF[k];
    if (isWet(k)) return hazard();
    const g = grad(b.x, b.y), sp = Math.hypot(b.vx, b.vy);
    const sl = Math.hypot(g[0], g[1]) * 5 / 7;
    if (sp < 0.03 && sl < s.mu) { b.vx = b.vy = 0; b.mode = 'rest'; if (dist([b.x, b.y], pin) < CUP + 0.012) return holed(); return settle(); }
    let ax = -5 / 7 * G * g[0], ay = -5 / 7 * G * g[1];
    if (sp > 1e-6) { ax -= s.mu * G * b.vx / sp; ay -= s.mu * G * b.vy / sp; }
    const nvx = b.vx + ax * dt, nvy = b.vy + ay * dt;
    if (sp > 1e-6 && nvx * b.vx + nvy * b.vy < 0 && sl < s.mu) { b.vx = b.vy = 0; b.mode = 'rest'; if (dist([b.x, b.y], pin) < CUP + 0.012) return holed(); return settle(); }
    b.vx = nvx; b.vy = nvy; b.x += b.vx * dt; b.y += b.vy * dt; b.z = hAt(b.x, b.y);
    if (!isWet(k) && !isOB(v)) shot.lastDry = [ox, oy];
    // cup
    const px = pin[0] - ox, py = pin[1] - oy, sx = b.x - ox, sy = b.y - oy, sl2 = sx * sx + sy * sy;
    const t = sl2 > 0 ? Math.max(0, Math.min(1, (px * sx + py * sy) / sl2)) : 0;
    const cd = Math.hypot(ox + sx * t - pin[0], oy + sy * t - pin[1]), spn = Math.hypot(b.vx, b.vy);
    if (cd < CUP + 0.006) {
      if (spn < 1.35) return holed();
      if (spn < 1.9 && cd < CUP * 0.7) { const a = (rnd() - 0.5) * 1.4, c = Math.cos(a), si = Math.sin(a); const vx = b.vx; b.vx = (vx * c - b.vy * si) * 0.55; b.vy = (vx * si + b.vy * c) * 0.55; SFX.putt(); }
    }
  }
}
function bounce(b, gz) {
  b.z = gz;
  const v = cvAt(b.x, b.y), k = cls(v);
  if (isWet(k)) return hazard();
  const s = SURF[k], g = grad(b.x, b.y);
  let nx = -g[0], ny = -g[1], nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
  const sp = Math.hypot(b.vx, b.vy, b.vz), vn = b.vx * nx + b.vy * ny + b.vz * nz;
  if (vn >= 0) { b.z = gz + 0.01; return; }
  let tx = b.vx - vn * nx, ty = b.vy - vn * ny, tz = b.vz - vn * nz;
  const steep = Math.min(1, 1.4 * -vn / sp);
  const bite = shot.bounces === 0 ? shot.bite * (k === GREEN ? 0.8 : (k === FAIR || k === FRINGE || k === TEE) ? 0.45 : 0.25) : 0;
  const keep = Math.max(0, 1 - s.fr * steep - bite);
  tx *= keep; ty *= keep; tz *= keep;
  const out = -vn * s.e;
  b.vx = tx + out * nx; b.vy = ty + out * ny; b.vz = tz + out * nz;
  if (shot.bounces === 0) { shot.carry = dist(shot.from, [b.x, b.y]); SFX.land(); }
  shot.bounces++;
  b.L *= 0.2; b.S *= 0.1;
  if (out < 1.1 || shot.bounces > 12) { b.mode = 'roll'; b.vz = 0; }
  b.z = gz + 0.002;
}
function nearestPlayable(p, notCloserThan) {
  const dPin = notCloserThan ? dist(p, pin) : 0;
  for (let r = 0; r <= 40; r += 0.5) {
    const n = Math.max(1, Math.round(r * 2));
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, q = [p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r];
      const v = cvAt(q[0], q[1]), k = cls(v);
      if (isOB(v) || isWet(k) || k === BLDG || k === ROAD) continue;
      if (notCloserThan && dist(q, pin) < dPin - 0.5) continue;
      return q;
    }
  }
  return shot.from.slice();
}
function placeBall(p) { ball.x = p[0]; ball.y = p[1]; ball.z = hAt(p[0], p[1]); ball.vx = ball.vy = ball.vz = 0; ball.mode = 'rest'; }
function hazard() {
  SFX.splash();
  const ld = shot.lastDry, back = [shot.from[0] - ld[0], shot.from[1] - ld[1]], bl = Math.hypot(back[0], back[1]) || 1;
  const drop = nearestPlayable([ld[0] + back[0] / bl * 2, ld[1] + back[1] / bl * 2], true);
  strokes++;
  endShot('Water hazard', 'Penalty stroke. Drop taken.', drop, true);
}
function finishOB() {
  strokes++;
  endShot('Out of bounds', 'Stroke and distance. Replay from the last spot.', shot.from.slice(), true);
  ball.onTee = shot.onTee;
}
function settle() {
  const v = cvAt(ball.x, ball.y), k = cls(v);
  if (isOB(v)) return finishOB();
  if (k === BLDG) { strokes++; return endShot('Unplayable', 'Penalty stroke. Drop taken.', nearestPlayable([ball.x, ball.y], true), true); }
  const yds = dist(shot.from, [ball.x, ball.y]) * YD;
  lastShotYds = Math.round(yds);
  let title = SURF[k].n, sub;
  if (CLUBS[shot.club].putter) {
    const ft = dist([ball.x, ball.y], pin) * FT;
    title = ft < 3 ? 'Tap in' : 'Missed';
    sub = ft < 2 ? `${Math.max(1, Math.round(ft * 12))} in left` : `${Math.round(ft)} ft left`;
  } else {
    sub = `${lastShotYds} yds${shot.tree ? ', clipped the trees' : ''}`;
  }
  endShot(title, sub, null, false);
}
function endShot(title, sub, place, penalty) {
  if (place) placeBall(place);
  ball.mode = 'rest';
  state = 'result';
  toast(title, sub, penalty ? 2000 : 1300);
  updateHUD();
  if (strokes >= 10) { setTimeout(() => finishHole(true), 1400); return; }
  setTimeout(() => { if (state === 'result') setupShot(); }, penalty ? 1800 : 1100);
}
const NAMES = { '-3': 'Albatross', '-2': 'Eagle', '-1': 'Birdie', '0': 'Par', '1': 'Bogey', '2': 'Double bogey', '3': 'Triple bogey', '4': 'Quadruple bogey' };
function holed() {
  ball.mode = 'rest'; placeBall(pin); ball.z -= 0.05;
  SFX.cup();
  if (CLUBS[shot.club].putter) lastShotYds = null;
  finishHole(false);
}
function finishHole(pickedUp) {
  state = 'holed';
  const diff = strokes - hole.par;
  const name = strokes === 1 ? 'Hole in one' : pickedUp ? 'Picked up' : (NAMES[diff] || `${diff > 0 ? '+' : ''}${diff}`);
  round.scores[round.i] = strokes; round.putts[round.i] = putts;
  saveRound();
  toast(name, `${strokes} stroke${strokes === 1 ? '' : 's'} on hole ${hole.n}`, 2200);
  updateHUD();
  setTimeout(showHoleDone, 1700);
}

/* ---------------- camera targets ---------------- */
function fitPoints(pts, minS, maxS) {
  const v = pts.map(p => toV(p[0], p[1]));
  let x0 = Math.min(...v.map(p => p[0])), x1 = Math.max(...v.map(p => p[0]));
  let y0 = Math.min(...v.map(p => p[1])), y1 = Math.max(...v.map(p => p[1]));
  const aw = W - 40, ah = H - TOPPAD() - BOTPAD() - 20;
  const s = Math.max(minS, Math.min(maxS, aw / Math.max(x1 - x0, 1), ah / Math.max(y1 - y0, 1)));
  return [(x0 + x1) / 2, (y0 + y1) / 2, s];
}
function updateCamTarget() {
  if (!hole) return;
  const b = [ball.x, ball.y];
  let t;
  if (cam.mode === 'overview') t = fitPoints([...holePath(hole), b], 0.3, 40);
  else if (cam.mode === 'putt') { const d = dist(b, pin), m = Math.max(6, d * 0.3); t = fitPoints([[b[0] - m, b[1] - m], [b[0] + m, b[1] + m], [pin[0] - m, pin[1] - m], [pin[0] + m, pin[1] + m], aim || pin], 4, 30); }
  else if (cam.mode === 'flight') t = fitPoints([shot.from, aim, b], 0.5, 6);
  else { const a = aim || pin; t = fitPoints([b, a, [a[0] + 14, a[1] + 14], [a[0] - 14, a[1] - 14]], 0.5, 6.5); }
  cam.tvx = t[0] + cam.panX; cam.tvy = t[1] + cam.panY; cam.ts = t[2] * cam.zoom;
}

/* ---------------- drawing ---------------- */
function drawLayer(L, alphaTopo) {
  if (!L) return;
  const [cx, cy] = screenCenter();
  const x = (L.vx0 - cam.vx) * cam.s + cx, y = (L.vy0 - cam.vy) * cam.s + cy, w = L.wM * cam.s, h = L.hM * cam.s;
  ctx.drawImage(L.base, x, y, w, h);
  if (alphaTopo > 0 && L.topo) { ctx.globalAlpha = alphaTopo; ctx.drawImage(L.topo, x, y, w, h); ctx.globalAlpha = 1; }
}
function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#1c3020'; ctx.fillRect(0, 0, W, H);
  if (!hole || !layerHole) return;
  ctx.imageSmoothingEnabled = true;
  drawLayer(layerBack, 0);
  drawLayer(layerHole, settings.topo ? 0.5 : 0);
  if (cam.s > 5 && layerGreen) drawLayer(layerGreen, 0);
  if (state === 'aim' && ci === PUTTER) drawSlopes();
  drawPin();
  if (state === 'aim') drawAim();
  drawTrail();
  drawBall();
}
function drawPin() {
  const [x, y] = w2s(pin[0], pin[1]);
  const r = Math.max(2.2, CUP * cam.s);
  ctx.fillStyle = '#0d0d0d'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  const L = Math.max(22, Math.min(70, 2.2 * cam.s * 0.9));
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L * 0.5, y + L * 0.35); ctx.stroke();
  ctx.strokeStyle = '#f4f1e6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - L); ctx.stroke();
  ctx.fillStyle = '#d8392b'; ctx.beginPath(); ctx.moveTo(x, y - L); ctx.lineTo(x + L * 0.42, y - L * 0.84); ctx.lineTo(x, y - L * 0.68); ctx.closePath(); ctx.fill();
}
function drawAim() {
  const [bx, by] = w2s(ball.x, ball.y), [ax, ay] = w2s(aim[0], aim[1]);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([7, 6]);
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ax, ay); ctx.stroke(); ctx.setLineDash([]);
  if (ci !== PUTTER) {
    const c = CLUBS[ci], cr = c.carry / YD * lieMult(ci) * cam.s, ang = Math.atan2(ay - by, ax - bx);
    ctx.strokeStyle = 'rgba(224,182,74,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.arc(bx, by, cr, ang - 0.22, ang + 0.22); ctx.stroke(); ctx.setLineDash([]);
    const rr = Math.max(8, dist([ball.x, ball.y], aim) * 0.045 * cam.s);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ax, ay, rr, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax - rr * 0.5, ay); ctx.lineTo(ax + rr * 0.5, ay); ctx.moveTo(ax, ay - rr * 0.5); ctx.lineTo(ax, ay + rr * 0.5); ctx.stroke();
  } else {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ax, ay, 4, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function drawSlopes() {
  // downhill arrows across the green, 1.5 m apart
  const sp = 1.2, R = Math.max(12, dist([ball.x, ball.y], pin) + 6);
  const gv = toV(pin[0], pin[1]), bv = toV(ball.x, ball.y);
  const cx = (gv[0] + bv[0]) / 2, cy = (gv[1] + bv[1]) / 2;
  ctx.save(); ctx.lineWidth = 1.6;
  for (let X = Math.floor((cx - R) / sp) * sp; X <= cx + R; X += sp) for (let Y = Math.floor((cy - R) / sp) * sp; Y <= cy + R; Y += sp) {
    const w = fromV(X, Y), k = cls(cvAt(w[0], w[1]));
    if (k !== GREEN) continue;
    const g = grad(w[0], w[1]), m = Math.hypot(g[0], g[1]); if (m < 0.004) continue;
    const gvv = vecToV(-g[0] / m, -g[1] / m), L = (0.25 + 0.75 * Math.min(1, m / 0.04)) * sp * 0.45 * cam.s;
    const [sx, sy] = w2s(w[0], w[1]), ex = sx + gvv[0] * L, ey = sy + gvv[1] * L;
    const t = Math.min(1, m / 0.04);
    ctx.strokeStyle = `rgba(${Math.round(120 + 135 * t)},${Math.round(220 - 150 * t)},${Math.round(255 - 205 * t)},0.8)`;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath(); ctx.moveTo(sx - gvv[0] * L * 0.3, sy - gvv[1] * L * 0.3); ctx.lineTo(ex, ey); ctx.stroke();
    const hx = -gvv[1] * 3, hy = gvv[0] * 3;
    ctx.beginPath(); ctx.moveTo(ex + gvv[0] * 3, ey + gvv[1] * 3); ctx.lineTo(ex + hx, ey + hy); ctx.lineTo(ex - hx, ey - hy); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function drawTrail() {
  if (trail.length < 2) return;
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
  trail.forEach((p, i) => { const [x, y] = w2s(p[0], p[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.stroke(); ctx.restore();
}
function drawBall() {
  const gz = hAt(ball.x, ball.y), hgt = Math.max(0, ball.z - gz);
  const [x, y] = w2s(ball.x, ball.y);
  const r = Math.max(2.6, 0.021 * cam.s * 1.8) * (1 + hgt / 22);
  const off = hgt * 0.5 * cam.s * 0.25;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + off * -LIGHT[0] * 2, y + off * -LIGHT[1] * 2, r * 0.95, r * 0.8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
}

/* ---------------- HUD ---------------- */
function fmtScore(d) { return d === 0 ? 'E' : d > 0 ? '+' + d : String(d); }
function roundToPar() {
  let s = 0, p = 0; round.scores.forEach((v, i) => { if (v != null) { s += v; p += HOLES[round.holes[i]].par; } }); return [s, s - p];
}
function updateHUD() {
  if (!hole) return;
  $('h-title').textContent = `Hole ${hole.n}`;
  $('h-sub').textContent = `Par ${hole.par} · ${hole.yds} yds · Hcp ${hole.hcp}`;
  const [tot, tp] = roundToPar();
  $('s-total').textContent = fmtScore(tp);
  $('s-sub').textContent = `${state === 'holed' ? 'Holed in ' + strokes : 'Stroke ' + (strokes + 1)} · ${tot} total`;
  $('w-speed').textContent = `${wind.mph} mph`;
  drawWind();
  const b = [ball.x, ball.y], pd = dist(b, pin), pe = elevFt(b, pin);
  const ev = Math.abs(pe) < 1 ? 'level' : `${pe > 0 ? '<span class="up">up</span>' : '<span class="down">down</span>'} ${Math.round(Math.abs(pe))} ft`;
  let html;
  if (ci === PUTTER || onPuttingSurface()) {
    html = `<div class="row"><span class="k">To hole</span><b>${pd * FT < 2 ? Math.max(1, Math.round(pd * FT * 12)) + ' in' : Math.round(pd * FT) + ' ft'}</b></div>
            <div class="row"><span class="k">Slope</span><span>${Math.abs(pe) < 0.2 ? 'flat' : (pe > 0 ? 'uphill ' : 'downhill ') + Math.abs(pe).toFixed(1) + ' ft'}</span></div>
            <div class="row"><span class="k">Lie</span><span>${lieName()}</span></div>`;
  } else {
    const ad = aim ? dist(b, aim) * YD : 0, pl = aim ? playsLike(b, aim) * YD : 0;
    html = `<div class="row"><span class="k">To pin</span><b>${Math.round(pd * YD)} yds</b></div>
            <div class="row"><span class="k">Elev</span><span>${ev}</span></div>
            <div class="row"><span class="k">Aim</span><span>${Math.round(ad)} yds, plays ${Math.round(pl)}</span></div>
            <div class="row"><span class="k">Lie</span><span>${lieName()}</span></div>`;
  }
  if (lastShotYds != null) html += `<div class="row"><span class="k">Last shot</span><span>${lastShotYds} yds</span></div>`;
  $('info-card').innerHTML = html;
  const c = CLUBS[ci];
  $('c-name').textContent = c.n;
  if (c.putter) $('c-dist').textContent = `${Math.round(puttRange() * FT)} ft max`;
  else $('c-dist').textContent = `${Math.round(c.carry * lieMult(ci))} yds`;
  $('swing-btn').disabled = state !== 'aim';
  $('swing-btn').textContent = c.putter ? 'PUTT' : 'SWING';
  // meter guide: suggested power tick
  let sug = null;
  if (aim && state === 'aim') {
    if (c.putter) sug = puttEquiv() / puttRange();
    else sug = playsLike(b, aim) / (c.carry / YD * lieMult(ci) * (dist(aim, pin) < 12 ? 1 + c.roll : 1));
  }
  const z = $('m-zone');
  if (c.putter) { z.style.display = 'none'; } else { z.style.display = ''; z.style.left = mPct(-0.035) + '%'; z.style.width = (mPct(0.035) - mPct(-0.035)) + '%'; }
  $('m-full').style.left = mPct(sug != null ? Math.min(MMAX, sug) : 1) + '%';
  $('m-left').textContent = state === 'aim' ? (c.putter ? 'Tap PUTT to start, tap again to set pace' : 'Tap to start, tap for power, tap on the line') : '';
  $('m-right').textContent = sug != null ? `Suggested ${Math.round(Math.min(sug, 1.1) * 100)}%` : '';
  if (meter.phase === 'idle') { $('m-mark').style.left = mPct(0) + '%'; }
}
function drawWind() {
  const wc = $('wind-canvas'), g = wc.getContext('2d');
  g.clearRect(0, 0, 68, 68);
  g.strokeStyle = 'rgba(236,228,205,0.25)'; g.lineWidth = 2; g.beginPath(); g.arc(34, 34, 30, 0, 7); g.stroke();
  if (wind.mph < 1) return;
  const v = vecToV(wind.x, wind.y), l = Math.hypot(v[0], v[1]), ux = v[0] / l, uy = v[1] / l;
  g.strokeStyle = '#e0b64a'; g.fillStyle = '#e0b64a'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(34 - ux * 20, 34 - uy * 20); g.lineTo(34 + ux * 14, 34 + uy * 14); g.stroke();
  g.beginPath(); g.moveTo(34 + ux * 24, 34 + uy * 24); g.lineTo(34 + ux * 10 - uy * 9, 34 + uy * 10 + ux * 9); g.lineTo(34 + ux * 10 + uy * 9, 34 + uy * 10 - ux * 9); g.closePath(); g.fill();
}
let toastTimer = 0;
function toast(t, sub, ms) {
  const el = $('toast'); el.innerHTML = `${t}${sub ? `<small>${sub}</small>` : ''}`; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms || 1300);
}
function showHUD(on) { ['hud-top', 'hud-bottom', 'icons'].forEach(id => $(id).classList.toggle('hidden', !on)); }

/* ---------------- overlays ---------------- */
function sheet(html) { $('sheet').innerHTML = html; $('overlay').classList.remove('hidden'); }
function closeSheet() { $('overlay').classList.add('hidden'); }
function seg(name, opts, cur) {
  return `<div class="seg" data-seg="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${v === cur ? 'on' : ''}">${l}</button>`).join('')}</div>`;
}
function bindSegs() {
  document.querySelectorAll('[data-seg]').forEach(s => s.querySelectorAll('button').forEach(b => b.onclick = () => {
    const k = s.dataset.seg; let v = b.dataset.v; if (v === 'true') v = true; if (v === 'false') v = false;
    settings[k] = v; saveSettings();
    s.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    if (k === 'season' && hole && layerHole) buildLayers();
  }));
}
function optionsHTML() {
  return `<div class="opt"><span>Swing meter</span>${seg('speed', [['relaxed', 'Relaxed'], ['normal', 'Normal'], ['fast', 'Fast']], settings.speed)}</div>
  <div class="opt"><span>Trees</span>${seg('season', [['summer', 'Summer'], ['autumn', 'Autumn']], settings.season)}</div>
  <div class="opt"><span>Sound</span>${seg('sound', [[true, 'On'], [false, 'Off']], settings.sound)}</div>`;
}
const HELP = `<div class="help">
<p><b>Aim:</b> tap the map where you want the ball to go. Fine tune with the curved arrows. The club is picked for you, change it with the arrows beside it.</p>
<p><b>Swing:</b> tap SWING (or press Space) to start the meter. Tap again to set power, the gold tick shows the suggested power for your aim point. Tap a third time as the marker comes back over the white zone. Early pulls it left and hooks, late pushes it right and slices.</p>
<p><b>Putt:</b> two taps, start and pace. Arrows on the green point downhill, red is steeper.</p>
<p><b>Hills:</b> elevation is real lidar. "Plays" yardage adds about a yard for every 3 ft of climb. Balls kick and roll off slopes.</p>
<p><b>Rules:</b> white dashed line is out of bounds, stroke and distance. Water and the creek cost a stroke with a drop where it went in. Trees knock balls down. Max 10 strokes a hole.</p>
<p>Drag to pan, pinch or scroll to zoom. VIEW shows the whole hole, TOPO toggles contour lines (1 m, about 3 ft).</p></div>`;
const CREDITS = `<div class="credits">Built from public data: elevation and tree heights from USGS 3DEP lidar (Cayuga/Oswego Counties 2018), course surfaces traced from NYS ITS orthoimagery, tee and green positions from GolfTraxx GPS data, course boundary from OpenStreetMap contributors (ODbL). Pars and handicaps from Hole19. Fan-made game, not affiliated with or endorsed by Fillmore Golf Club.</div>`;

function bestKey(kind) { return 'fgc_best_' + kind; }
function showTitle() {
  state = 'title'; showHUD(false);
  const saved = lsGet('fgc_round', null);
  const b18 = lsGet(bestKey('all'), null), bf = lsGet(bestKey('front'), null), bb = lsGet(bestKey('back'), null);
  const best = [b18 != null ? `18 holes: ${b18.s} (${fmtScore(b18.d)})` : '', bf != null ? `Front: ${bf.s}` : '', bb != null ? `Back: ${bb.s}` : ''].filter(Boolean).join(' · ');
  const tot = HOLES.reduce((a, h) => a + h.yds, 0);
  sheet(`<h1>Fillmore Golf Club</h1>
  <p style="margin-top:0">Locke, New York &middot; 18 holes &middot; Par 71 &middot; ${tot.toLocaleString()} yds</p>
  <p>Every hill, tree, pond and the creek is placed from real survey data. Up to 300 feet of elevation change across the property.</p>
  ${best ? `<p><b style="color:var(--ink)">Best:</b> ${best}</p>` : ''}
  ${saved && saved.scores && saved.i < saved.holes.length ? `<button class="btn" id="t-resume">Resume round (hole ${HOLES[saved.holes[saved.i]] ? saved.holes[saved.i] + 1 : ''})</button>` : ''}
  <button class="btn ${saved ? 'alt' : ''}" id="t-18">Play 18 holes</button>
  <div class="btn-row"><button class="btn alt" id="t-f9">Front 9</button><button class="btn alt" id="t-b9">Back 9</button></div>
  <div style="margin-top:14px">${optionsHTML()}</div>
  <details style="margin-top:10px"><summary style="cursor:pointer;color:var(--ink-dim);font-size:14px">How to play</summary>${HELP}</details>
  ${CREDITS}`);
  bindSegs();
  const go = k => () => { closeSheet(); clearRound(); startRound(k); };
  $('t-18').onclick = go('all'); $('t-f9').onclick = go('front'); $('t-b9').onclick = go('back');
  const r = $('t-resume'); if (r) r.onclick = () => { closeSheet(); round = saved; startHole(); };
}
function showIntro() {
  state = 'intro'; showHUD(false);
  const e = elevFt(hole.tee, hole.gc);
  const el = Math.abs(e) < 3 ? 'Plays about level to the green.' : `Plays ${Math.round(Math.abs(e))} ft ${e > 0 ? 'uphill' : 'downhill'} to the green.`;
  sheet(`<p style="margin:0;text-transform:uppercase;letter-spacing:.1em;font-size:12px">Hole ${round.i + 1} of ${round.holes.length}</p>
  <h1>Hole ${hole.n}</h1>
  <div class="intro-stats"><div><b>${hole.par}</b><span>Par</span></div><div><b>${hole.yds}</b><span>Yards</span></div><div><b>${hole.hcp}</b><span>Handicap</span></div></div>
  <p>${el} Wind ${wind.mph} mph.</p>
  <button class="btn" id="intro-go" disabled>Walking to the tee...</button>`);
  $('intro-go').onclick = () => {
    closeSheet(); showHUD(true); setupShot();
    const t = fitPoints(holePath(hole), 0.3, 40); cam.vx = t[0]; cam.vy = t[1]; cam.s = t[2];
    cam.mode = 'overview'; setTimeout(() => { if (state === 'aim' && cam.mode === 'overview') cam.mode = ci === PUTTER ? 'putt' : 'aim'; }, 2600);
  };
}
function scorecardHTML() {
  const rows = (from, to, label) => {
    const idx = []; for (let i = from; i < to; i++) idx.push(i);
    let ps = 0, ss = 0, anyS = false;
    const head = `<tr><th class="l">${label}</th>${idx.map(i => `<th>${i + 1}</th>`).join('')}<th>Tot</th></tr>`;
    const par = `<tr><td class="l">Par</td>${idx.map(i => { ps += HOLES[i].par; return `<td>${HOLES[i].par}</td>`; }).join('')}<td>${ps}</td></tr>`;
    const yd = `<tr><td class="l">Yds</td>${idx.map(i => `<td style="font-size:11px">${HOLES[i].yds}</td>`).join('')}<td style="font-size:11px">${idx.reduce((a, i) => a + HOLES[i].yds, 0)}</td></tr>`;
    const sc = `<tr class="tot"><td class="l">You</td>${idx.map(i => {
      const k = round ? round.holes.indexOf(i) : -1, v = k >= 0 ? round.scores[k] : null;
      if (v == null) return '<td></td>'; anyS = true; ss += v; const d = v - HOLES[i].par;
      return `<td class="${d < 0 ? 'b' : d > 0 ? 'bo' : ''}">${v}</td>`;
    }).join('')}<td>${anyS ? ss : ''}</td></tr>`;
    return `<table class="sc">${head}${par}${yd}${sc}</table>`;
  };
  return rows(0, 9, 'Out') + rows(9, 18, 'In');
}
function showScorecard(back) {
  const [tot, tp] = roundToPar();
  sheet(`<h2>Scorecard</h2><p style="margin:0">${tot} strokes, ${fmtScore(tp)}</p>${scorecardHTML()}<button class="btn" id="sc-close">Back to the course</button>`);
  $('sc-close').onclick = () => { closeSheet(); if (back) back(); };
}
function showHoleDone() {
  const last = round.i >= round.holes.length - 1;
  const [tot, tp] = roundToPar();
  sheet(`<h2>Hole ${hole.n}: ${strokes} (${fmtScore(strokes - hole.par)})</h2>
  <p style="margin:0">${putts} putt${putts === 1 ? '' : 's'} &middot; Round: ${tot}, ${fmtScore(tp)}</p>
  ${scorecardHTML()}
  <button class="btn" id="hd-next">${last ? 'Finish round' : 'Next hole'}</button>`);
  $('hd-next').onclick = () => {
    closeSheet();
    if (last) return showDone();
    round.i++; saveRound(); startHole();
  };
}
function showDone() {
  state = 'done'; showHUD(false);
  const [tot, tp] = roundToPar(), k = bestKey(round.kind), prev = lsGet(k, null);
  let nb = false; if (!prev || tot < prev.s) { lsSet(k, { s: tot, d: tp }); nb = true; }
  clearRound();
  const tp2 = round.putts.reduce((a, b) => a + (b || 0), 0);
  sheet(`<h1>${tot} <span style="font-size:22px;color:var(--ink-dim)">(${fmtScore(tp)})</span></h1>
  <p style="margin-top:0">${round.holes.length} holes at Fillmore &middot; ${tp2} putts${nb ? ' &middot; <b style="color:var(--accent)">New best</b>' : prev ? ` &middot; Best ${prev.s}` : ''}</p>
  ${scorecardHTML()}
  <button class="btn" id="d-again">Play again</button><button class="btn alt" id="d-menu">Main menu</button>`);
  $('d-again').onclick = () => { closeSheet(); startRound(round.kind); };
  $('d-menu').onclick = () => { closeSheet(); hole = null; showTitle(); };
}
function showMenu() {
  if (state === 'flight') return;
  const prevState = state;
  sheet(`<h2>Paused</h2>${optionsHTML()}
  <button class="btn" id="mn-resume">Resume</button>
  <button class="btn alt" id="mn-card">Scorecard</button>
  <details style="margin-top:10px"><summary style="cursor:pointer;color:var(--ink-dim);font-size:14px">How to play</summary>${HELP}</details>
  <button class="btn alt" id="mn-quit">Quit to main menu</button>${CREDITS}`);
  bindSegs();
  $('mn-resume').onclick = () => { closeSheet(); state = prevState; };
  $('mn-card').onclick = () => showScorecard(() => { state = prevState; });
  $('mn-quit').onclick = () => { closeSheet(); saveRound(); hole = null; showTitle(); };
  state = 'paused';
}

/* ---------------- input ---------------- */
$('swing-btn').addEventListener('click', e => { e.preventDefault(); meterClick(); });
$('club-prev').onclick = () => { if (state !== 'aim' || meter.phase !== 'idle') return; ci = Math.max(0, ci - 1); clubManual = true; cam.mode = ci === PUTTER ? 'putt' : 'aim'; updateHUD(); };
$('club-next').onclick = () => { if (state !== 'aim' || meter.phase !== 'idle') return; ci = Math.min(PUTTER, ci + 1); clubManual = true; cam.mode = ci === PUTTER ? 'putt' : 'aim'; updateHUD(); };
$('aim-l').onclick = () => { if (state === 'aim' && meter.phase === 'idle') rotateAim(ci === PUTTER ? -0.5 : -1); };
$('aim-r').onclick = () => { if (state === 'aim' && meter.phase === 'idle') rotateAim(ci === PUTTER ? 0.5 : 1); };
$('btn-view').onclick = () => { if (!hole) return; cam.mode = cam.mode === 'overview' ? (ci === PUTTER ? 'putt' : state === 'flight' ? 'flight' : 'aim') : 'overview'; cam.zoom = 1; cam.panX = cam.panY = 0; };
$('btn-topo').onclick = () => { settings.topo = !settings.topo; saveSettings(); $('btn-topo').classList.toggle('on', settings.topo); };
$('btn-topo').classList.toggle('on', settings.topo);
$('btn-menu').onclick = showMenu;
$('score-card').onclick = () => { if (state === 'aim') { const p = state; state = 'paused'; showScorecard(() => { state = p; }); } };
window.addEventListener('keydown', e => {
  if (!$('overlay').classList.contains('hidden')) return;
  if (e.code === 'Space') { e.preventDefault(); if (state === 'flight') shot.fast = true; else meterClick(); }
  else if (state === 'aim' && meter.phase === 'idle') {
    if (e.code === 'ArrowLeft') rotateAim(ci === PUTTER ? -0.5 : -1);
    else if (e.code === 'ArrowRight') rotateAim(ci === PUTTER ? 0.5 : 1);
    else if (e.code === 'ArrowUp') $('club-prev').onclick();
    else if (e.code === 'ArrowDown') $('club-next').onclick();
  }
  if (e.code === 'KeyV') $('btn-view').onclick();
  if (e.code === 'KeyT') $('btn-topo').onclick();
});
const ptrs = new Map(); let gesture = null;
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (ptrs.size === 1) gesture = { type: 'tap', sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY };
  else if (ptrs.size === 2) { const p = [...ptrs.values()]; gesture = { type: 'pinch', d: Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]), z: cam.zoom }; }
});
cv.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (!gesture) return;
  if (gesture.type === 'pinch' && ptrs.size === 2) { const p = [...ptrs.values()], d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); cam.zoom = Math.max(0.3, Math.min(6, gesture.z * d / gesture.d)); return; }
  if (gesture.type === 'tap' && Math.hypot(e.clientX - gesture.sx, e.clientY - gesture.sy) > 9) gesture.type = 'pan';
  if (gesture.type === 'pan') {
    cam.panX -= (e.clientX - gesture.lx) / cam.s; cam.panY -= (e.clientY - gesture.ly) / cam.s;
    cam.vx -= (e.clientX - gesture.lx) / cam.s; cam.vy -= (e.clientY - gesture.ly) / cam.s;
    gesture.lx = e.clientX; gesture.ly = e.clientY;
  }
});
function endPtr(e) {
  if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
  if (gesture && gesture.type === 'tap' && ptrs.size === 0) {
    if (state === 'aim' && meter.phase === 'idle') setAim(s2w(e.clientX, e.clientY));
    else if (state === 'flight') shot.fast = true;
  }
  if (ptrs.size === 0) gesture = null;
}
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); cam.zoom = Math.max(0.3, Math.min(6, cam.zoom * Math.exp(-e.deltaY * 0.0015))); }, { passive: false });

/* ---------------- main loop ---------------- */
let lastT = performance.now();
function frame(t) {
  const dtr = Math.min(0.05, (t - lastT) / 1000); lastT = t;
  meterTick();
  if (state === 'flight' && ball.mode !== 'rest') {
    const speed = (shot.fast ? 5 : ball.mode === 'fly' ? 1.7 : 1.4), sub = 1 / 240;
    let n = Math.ceil(dtr * speed / sub);
    while (n-- > 0 && state === 'flight' && ball.mode !== 'rest') simStep(sub);
    const lt = trail[trail.length - 1];
    if (!lt || dist(lt, [ball.x, ball.y]) > 0.6) trail.push([ball.x, ball.y, ball.z]);
    if (state === 'flight' && ball.mode === 'roll' && CLUBS[shot.club].putter === undefined && cam.mode === 'flight') {
      if (cls(cvAt(ball.x, ball.y)) === GREEN) cam.mode = 'putt';
    }
  }
  if (hole) {
    updateCamTarget();
    const k = 1 - Math.exp(-dtr * 4);
    if (!gesture || gesture.type !== 'pan') { cam.vx += (cam.tvx - cam.vx) * k; cam.vy += (cam.tvy - cam.vy) * k; }
    cam.s = Math.exp(Math.log(cam.s) + (Math.log(cam.ts) - Math.log(cam.s)) * k);
  }
  draw();
  requestAnimationFrame(frame);
}
if (/[?&]debug/.test(location.search)) window.__fgc = {
  go(n, list) { closeSheet(); const h = list || [...Array(18).keys()]; round = { kind: 'all', holes: h, i: list ? 0 : n, scores: [], putts: [], pins: h.map(() => 0) }; startHole(); },
  tee() { $('intro-go').click(); },
  view(m) { cam.mode = m; cam.zoom = 1; cam.panX = cam.panY = 0; },
  place(x, y) { placeBall([x, y]); ball.onTee = false; setupShot(); },
  hit(p, a) { strike(p, a); },
  test(o) { NORAND = true; if (o.wind) wind = { x: o.wind[0], y: o.wind[1], mph: Math.round(Math.hypot(o.wind[0], o.wind[1]) * 2.237) }; placeBall(o.at); ball.onTee = !!o.tee; state = 'aim'; aim = o.aim; ci = CLUBS.findIndex(c => c.n === o.club); strike(o.power || 1, 0); },
  get shot() { return shot && { carry: shot.carry, from: shot.from, maxZ: shot.maxZ, bounces: shot.bounces }; },
  async map(ppm) {
    HD = [0, -1]; buildShade(); const tok = ++buildToken;
    const L = await makeLayer(0, 0, C.cW * CC, C.cH * CC, ppm, true, tok);
    const c = document.createElement('canvas'); c.width = L.base.width; c.height = L.base.height;
    const g = c.getContext('2d'); g.drawImage(L.base, 0, 0); g.globalAlpha = 0.45; g.drawImage(L.topo, 0, 0);
    return c.toDataURL('image/png');
  },
  get state() { return { state, ball: { ...ball }, pin, strokes, club: CLUBS[ci].n, aim, hole: hole && hole.n }; },
};
$('loading').classList.add('hidden');
showTitle();
requestAnimationFrame(frame);
})();
