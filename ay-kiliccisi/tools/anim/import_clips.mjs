// Quaternius "Universal Animation Library" (CC0) clips -> Kael's skeleton (data/anims.js).
// node tools/anim/import_clips.mjs ../assets/models/hero_anims1.glb
// No three.js: the GLB is parsed by hand, every mapped bone is sampled at 30 fps, and the motion is retargeted as a
// world-space rotation DELTA from the source T-pose. Our rig's rest pose is a T-pose with identity rotations, so
// G_ours(t) = C * W_src(t) * W_src(T)^-1 * C^-1 and R_local = G_parent^-1 * G_bone.
// Each loop is rotated so frame 0 = left foot furthest forward (clips blend in phase), and its ground speed is
// measured from the planted foot so the game can play it without foot sliding.
import fs from 'fs';
const file = process.argv[2] || new URL('../../../assets/models/hero_anims1.glb', import.meta.url).pathname;
const OUT = new URL('../../data/anims.js', import.meta.url).pathname;
const FPS = 30;
const CLIPS = { idle: 'Idle_Loop', walk: 'Walk_Loop', jog: 'Jog_Fwd_Loop', sprint: 'Sprint_Loop', cidle: 'Crouch_Idle_Loop', cwalk: 'Crouch_Fwd_Loop' };
// our bone -> source bone (UE mannequin names)
const MAP = { Hips: 'pelvis', Spine: 'spine_01', Chest: 'spine_02', UpperChest: 'spine_03', Neck: 'neck_01', Head: 'Head' };
for (const [S, s] of [['left', 'l'], ['right', 'r']]) Object.assign(MAP, { [S + 'Shoulder']: 'clavicle_' + s, [S + 'UpperArm']: 'upperarm_' + s, [S + 'LowerArm']: 'lowerarm_' + s, [S + 'Hand']: 'hand_' + s,
  [S + 'UpperLeg']: 'thigh_' + s, [S + 'LowerLeg']: 'calf_' + s, [S + 'Foot']: 'foot_' + s, [S + 'Toes']: 'ball_' + s });
// our hierarchy (parent of each driven bone; Root/Hips parent is identity)
const PAR = { Hips: null, Spine: 'Hips', Chest: 'Spine', UpperChest: 'Chest', Neck: 'UpperChest', Head: 'Neck' };
for (const S of ['left', 'right']) Object.assign(PAR, { [S + 'Shoulder']: 'UpperChest', [S + 'UpperArm']: S + 'Shoulder', [S + 'LowerArm']: S + 'UpperArm', [S + 'Hand']: S + 'LowerArm',
  [S + 'UpperLeg']: 'Hips', [S + 'LowerLeg']: S + 'UpperLeg', [S + 'Foot']: S + 'LowerLeg', [S + 'Toes']: S + 'Foot' });
const BONES = Object.keys(MAP);

// ---------------------------------------------------------------- GLB
const buf = fs.readFileSync(file), jl = buf.readUInt32LE(12), J = JSON.parse(buf.subarray(20, 20 + jl).toString());
const binOff = 20 + jl + 8;
const NC = { SCALAR: 1, VEC3: 3, VEC4: 4, MAT4: 16 };
function acc(i) { const a = J.accessors[i], bv = J.bufferViews[a.bufferView], n = NC[a.type], o = binOff + (bv.byteOffset || 0) + (a.byteOffset || 0), out = new Float32Array(a.count * n);
  const st = bv.byteStride || 0;
  for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) {
    if (a.componentType === 5126) out[k * n + c] = buf.readFloatLE(o + (st ? k * st : k * n * 4) + c * 4);
    else if (a.componentType === 5122) out[k * n + c] = Math.max(-1, buf.readInt16LE(o + (st ? k * st : k * n * 2) + c * 2) / 32767);
    else if (a.componentType === 5120) out[k * n + c] = Math.max(-1, buf.readInt8(o + (st ? k * st : k * n) + c) / 127);
    else throw new Error('componentType ' + a.componentType); }
  return out; }

// ---------------------------------------------------------------- math (quat = [x,y,z,w], mat4 column-major)
const qmul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const qinv = (a) => [-a[0], -a[1], -a[2], a[3]];
const qnorm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
function slerp(a, b, t) { let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; if (d < 0) { b = b.map((v) => -v); d = -d; }
  if (d > 0.9995) return qnorm(a.map((v, i) => v + (b[i] - v) * t)); const th = Math.acos(d), s = Math.sin(th);
  return a.map((v, i) => (v * Math.sin((1 - t) * th) + b[i] * Math.sin(t * th)) / s); }
function compose(t, q, s) { const [x, y, z, w] = q, m = new Float64Array(16);
  m[0] = (1 - 2 * (y * y + z * z)) * s[0]; m[1] = 2 * (x * y + z * w) * s[0]; m[2] = 2 * (x * z - y * w) * s[0];
  m[4] = 2 * (x * y - z * w) * s[1]; m[5] = (1 - 2 * (x * x + z * z)) * s[1]; m[6] = 2 * (y * z + x * w) * s[1];
  m[8] = 2 * (x * z + y * w) * s[2]; m[9] = 2 * (y * z - x * w) * s[2]; m[10] = (1 - 2 * (x * x + y * y)) * s[2];
  m[12] = t[0]; m[13] = t[1]; m[14] = t[2]; m[15] = 1; return m; }
function m4mul(a, b) { const o = new Float64Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
function m4quat(m) { const c = [0, 1, 2].map((i) => { const l = Math.hypot(m[i * 4], m[i * 4 + 1], m[i * 4 + 2]); return [m[i * 4] / l, m[i * 4 + 1] / l, m[i * 4 + 2] / l]; });
  const m00 = c[0][0], m10 = c[0][1], m20 = c[0][2], m01 = c[1][0], m11 = c[1][1], m21 = c[1][2], m02 = c[2][0], m12 = c[2][1], m22 = c[2][2], tr = m00 + m11 + m22;
  let q; if (tr > 0) { const s = 0.5 / Math.sqrt(tr + 1); q = [(m21 - m12) * s, (m02 - m20) * s, (m10 - m01) * s, 0.25 / s]; }
  else if (m00 > m11 && m00 > m22) { const s = 2 * Math.sqrt(1 + m00 - m11 - m22); q = [0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s]; }
  else if (m11 > m22) { const s = 2 * Math.sqrt(1 + m11 - m00 - m22); q = [(m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s]; }
  else { const s = 2 * Math.sqrt(1 + m22 - m00 - m11); q = [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s]; }
  return qnorm(q); }

// ---------------------------------------------------------------- scene graph + sampling
const N = J.nodes, parent = N.map(() => -1); N.forEach((n, i) => (n.children || []).forEach((c) => { parent[c] = i; }));
const byName = {}; N.forEach((n, i) => { byName[n.name] = i; });
function poseAt(anim, t) { // local TRS for every node at time t
  const L = N.map((n) => ({ t: n.translation || [0, 0, 0], r: n.rotation || [0, 0, 0, 1], s: n.scale || [1, 1, 1] }));
  for (const ch of anim.channels) { const sm = anim.samplers[ch.sampler], T = acc(sm.input), V = acc(sm.output), n = ch.target.path === 'rotation' ? 4 : 3;
    const cub = sm.interpolation === 'CUBICSPLINE', get = (k) => { const o = cub ? (k * 3 + 1) * n : k * n; return Array.from(V.subarray(o, o + n)); };
    let k = 0; while (k < T.length - 2 && T[k + 1] < t) k++;
    let v; if (t <= T[0]) v = get(0); else if (t >= T[T.length - 1]) v = get(T.length - 1);
    else { const u = sm.interpolation === 'STEP' ? 0 : (t - T[k]) / (T[k + 1] - T[k]), a = get(k), b = get(k + 1); v = n === 4 ? slerp(a, b, u) : a.map((x, i) => x + (b[i] - x) * u); }
    const key = { translation: 't', rotation: 'r', scale: 's' }[ch.target.path]; if (key) L[ch.target.node][key] = v; }
  const W = []; const world = (i) => { if (W[i]) return W[i]; const l = compose(L[i].t, L[i].r, L[i].s); return (W[i] = parent[i] < 0 ? l : m4mul(world(parent[i]), l)); };
  N.forEach((_, i) => world(i)); return W; }
const animByName = {}; for (const a of J.animations) animByName[a.name] = a;
const pos = (m) => [m[12], m[13], m[14]];
const durOf = (a) => Math.max(...a.samplers.map((s) => { const T = acc(s.input); return T[T.length - 1]; }));

// reference T-pose; frame conversion C: our left is +x and we face +z
const REF = poseAt(animByName.A_TPose, 0);
const lx = pos(REF[byName.hand_l])[0], C = lx > 0 ? [0, 0, 0, 1] : [0, 1, 0, 0]; // 180 deg about y when the source faces -z
const conv = (q) => qmul(qmul(C, q), qinv(C)), convP = (p) => (lx > 0 ? p : [-p[0], p[1], -p[2]]);
const refInv = {}; for (const b of BONES) refInv[b] = qinv(m4quat(REF[byName[MAP[b]]]));
const srcHipY = pos(REF[byName.pelvis])[1];
// our hip height (data/rigs.js hero proportions, same formula as heroProportions())
const RIGS = Function(fs.readFileSync(new URL('../../data/rigs.js', import.meta.url), 'utf8') + ';return RIGS')();
const R = RIGS.hero, ourHipY = R.thigh + R.shin + 0.095 + 0.02, SC = ourHipY / srcHipY;
console.log('source', file.split('/').pop(), 'faces', lx > 0 ? '+z' : '-z', 'hipY', srcHipY.toFixed(3), 'scale', SC.toFixed(3));

const out = {};
for (const [key, name] of Object.entries(CLIPS)) {
  const a = animByName[name]; if (!a) { console.log('missing', name); continue; }
  const dur = durOf(a), n = Math.max(2, Math.round(dur * FPS));
  const frames = [];
  for (let f = 0; f < n; f++) { const W = poseAt(a, (f / n) * dur), G = {}, loc = {};
    for (const b of BONES) G[b] = conv(qmul(m4quat(W[byName[MAP[b]]]), refInv[b]));
    for (const b of BONES) loc[b] = PAR[b] ? qmul(qinv(G[PAR[b]]), G[b]) : G[b];
    const hp = convP(pos(W[byName.pelvis])), fl = convP(pos(W[byName.foot_l])), fr = convP(pos(W[byName.foot_r]));
    frames.push({ loc, hip: hp.map((v) => v * SC), fl: fl.map((v) => v * SC), fr: fr.map((v) => v * SC) }); }
  // ground speed from the planted (lower) foot, relative to the pelvis (works for in-place and root-motion clips)
  const minY = Math.min(...frames.map((f) => Math.min(f.fl[1], f.fr[1])));
  const v = []; for (let f = 0; f < n; f++) { const A = frames[f], B = frames[(f + 1) % n]; const low = A.fl[1] < A.fr[1] ? 'fl' : 'fr'; if (A[low][1] > minY + 0.09) continue;
    const dz = (B[low][2] - B.hip[2]) - (A[low][2] - A.hip[2]); if (Math.abs(dz) < 0.6) v.push(-dz * FPS); }
  const vp = v.filter((x) => x > 0.3).sort((x, y) => x - y); const speed = vp.length ? vp[Math.floor(vp.length * 0.7)] : 0; // touch-down/lift-off frames drag the median down
  // phase: frame 0 = left foot furthest forward
  let f0 = 0; if (speed > 0.2) { let best = -1e9; frames.forEach((fr, i) => { const z = fr.fl[2] - fr.hip[2]; if (z > best) { best = z; f0 = i; } }); }
  const rot = frames.slice(f0).concat(frames.slice(0, f0));
  const hip0 = frames.reduce((s, fr) => s + fr.hip[1], 0) / n;
  // pack: per frame, per bone 4 int16; hip dy (mm, relative to our rest hip height) int16
  const q = new Int16Array(n * BONES.length * 4), hy = new Int16Array(n);
  rot.forEach((fr, f) => { BONES.forEach((b, k) => { let qq = fr.loc[b]; if (f > 0) { const o = ((f - 1) * BONES.length + k) * 4; if (q[o] * qq[0] + q[o + 1] * qq[1] + q[o + 2] * qq[2] + q[o + 3] * qq[3] < 0) qq = qq.map((x) => -x); }
    for (let c = 0; c < 4; c++) q[(f * BONES.length + k) * 4 + c] = Math.round(qq[c] * 32767); });
    hy[f] = Math.round((fr.hip[1] - ourHipY) * 1000); });
  out[key] = { n, dur: +dur.toFixed(4), speed: +speed.toFixed(3), q: Buffer.from(q.buffer).toString('base64'), hy: Buffer.from(hy.buffer).toString('base64') };
  console.log(key.padEnd(7), name.padEnd(18), 'frames', n, 'dur', dur.toFixed(2), 'speed', speed.toFixed(2), 'm/s', 'hip mean dy', ((hip0 - ourHipY) * 100).toFixed(1), 'cm');
}
const js = '// Hareket klipleri: Quaternius "Universal Animation Library" (CC0 1.0), Kael\'in iskeletine aktarıldı (tools/anim/import_clips.mjs).\n' +
  'const ANIMS=' + JSON.stringify({ src: 'Quaternius Universal Animation Library (CC0)', fps: FPS, bones: BONES, clips: out }) + ';\n';
fs.writeFileSync(OUT, js); console.log(OUT, (js.length / 1024).toFixed(1), 'KB');
