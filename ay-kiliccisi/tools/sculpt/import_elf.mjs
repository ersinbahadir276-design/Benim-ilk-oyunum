// Demon Queen = "body base low poly elf" (Yamato, CC BY 4.0) + horns, long hair and a simple dark dress.
// Measures the elf's joints from its mesh, fits the game's 16-bone human rig to them, simplifies the mesh,
// skins it by distance to the bone segments, sculpts the extras on the same bones and writes cache/king.bin
// plus tools/sculpt/king_rig.json (K proportions + bind angles the game uses).
// node tools/sculpt/import_elf.mjs <elf.glb>
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import { MeshoptSimplifier } from 'meshoptimizer';
import { sculpt, pack } from './mesh.mjs';
import { v3, rot, sphere, cone, tube, ellipsoid, plane, horn, U, I, shell, disp, symX, fbm, grow } from './sdf.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
await MeshoptSimplifier.ready;
// ---------- read the glb
const b = fs.readFileSync(process.argv[2]), jl = b.readUInt32LE(12), J = JSON.parse(b.subarray(20, 20 + jl).toString()), BIN = b.subarray(20 + jl + 8);
const acc = (i) => { const a = J.accessors[i], v = J.bufferViews[a.bufferView], n = { SCALAR: 1, VEC3: 3, VEC2: 2 }[a.type], off = (v.byteOffset || 0) + (a.byteOffset || 0);
  const T = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array }[a.componentType]; return new T(BIN.buffer.slice(BIN.byteOffset + off, BIN.byteOffset + off + a.count * n * T.BYTES_PER_ELEMENT)); };
let Pl = [], Il = [], o = 0; for (const m of J.meshes) for (const p of m.primitives) { const x = acc(p.attributes.POSITION), ix = acc(p.indices); Pl.push(x); Il.push(Array.from(ix, (q) => q + o)); o += x.length / 3; }
const nv0 = o, P0 = new Float32Array(nv0 * 3); { let k = 0; for (const x of Pl) { P0.set(x, k); k += x.length; } }
const I0 = new Uint32Array(Il.flat());
// z-up -> y-up, real height 1.78 m, feet on y=0
let ymin = 1e9, ymax = -1e9; for (let i = 0; i < nv0; i++) { ymin = Math.min(ymin, P0[i * 3 + 2]); ymax = Math.max(ymax, P0[i * 3 + 2]); }
const S = 1.78 / (ymax - ymin), W = new Float32Array(nv0 * 3);
for (let i = 0; i < nv0; i++) { W[i * 3] = P0[i * 3] * S; W[i * 3 + 1] = (P0[i * 3 + 2] - ymin) * S; W[i * 3 + 2] = -P0[i * 3 + 1] * S; }
// ---------- measure joints from slices
const slice = (y0, y1, f) => { let n = 0, s = [0, 0, 0]; for (let i = 0; i < nv0; i++) { const x = W[i * 3], y = W[i * 3 + 1], z = W[i * 3 + 2]; if (y >= y0 && y < y1 && f(x, y, z)) { s[0] += x; s[1] += y; s[2] += z; n++; } } return n ? s.map((q) => q / n) : null; };
const zc = slice(0.9, 1.1, () => true)[2];
const legC = (y) => slice(y - 0.01, y + 0.01, (x) => x > 0.01 && x < 0.19);
// widest arm point: arms are the points far from the torso
const armPts = []; for (let i = 0; i < nv0; i++) { const x = W[i * 3], y = W[i * 3 + 1]; if (x > 0.17 && y > 0.75 && y < 1.5) armPts.push([x, y, W[i * 3 + 2]]); }
const armAt = (y) => { const q = armPts.filter((p) => Math.abs(p[1] - y) < 0.012); if (!q.length) return null; const mx = Math.max(...q.map((p) => p[0])), r = q.filter((p) => p[0] > mx - 0.07); return [r.reduce((a, p) => a + p[0], 0) / r.length, y, r.reduce((a, p) => a + p[2], 0) / r.length]; };
const H = 1.78, ankle = legC(0.08), knee = legC(0.47), hipJ = legC(0.86);
const shoulder = [0.16 * H / 1.78 * 1.0, 1.43, zc], wrist = armAt(0.86) || [0.36, 0.86, zc], elbow = armAt(1.13) || [0.28, 1.13, zc];
const neckY = 1.5, headC = slice(1.6, 1.7, () => true);
// ---------- fit the game rig (humanDef layout)
const rootY = hipJ[1] + 0.04, spineY = rootY + 0.06, torso = (shoulder[1] - spineY) / 0.88, sh = shoulder[0], hw = hipJ[0];
const ua = v3.len(v3.sub(elbow, shoulder)), fa = v3.len(v3.sub(wrist, elbow)), th = v3.len(v3.sub(knee, hipJ)), sh2 = rootY - 0.06 - th;
const armA = Math.atan2(wrist[0] - shoulder[0], shoulder[1] - wrist[1]), legA = Math.atan2(ankle[0] - hipJ[0], hipJ[1] - ankle[1]);
const K = { torso, ua, fa, th, sh2, sh, hw }, bind = { 3: [0, 0, armA], 6: [0, 0, -armA], 9: [0, 0, legA], 12: [0, 0, -legA] };
const def = [{ p: -1, o: [0, 0, 0] }, { p: 0, o: [0, 0.06, 0] }, { p: 1, o: [0, torso, 0] }, { p: 1, o: [sh, torso * 0.88, 0] }, { p: 3, o: [0, -ua, 0] }, { p: 4, o: [0, -fa, 0] }, { p: 1, o: [-sh, torso * 0.88, 0] }, { p: 6, o: [0, -ua, 0] }, { p: 7, o: [0, -fa, 0] },
  { p: 0, o: [hw, -0.04, 0] }, { p: 9, o: [0, -th, 0] }, { p: 10, o: [0, -sh2, 0] }, { p: 0, o: [-hw, -0.04, 0] }, { p: 12, o: [0, -th, 0] }, { p: 13, o: [0, -sh2, 0] }, { p: 2, o: [0, 0.02, 0.06] }];
const WR = [], WP = []; def.forEach((d, i) => { const e = bind[i], R = e ? rot.eul(...e) : [1, 0, 0, 0, 1, 0, 0, 0, 1];
  if (d.p < 0) { WR[i] = R; WP[i] = [0, 0, 0]; } else { WR[i] = rot.mul(WR[d.p], R); const m = WR[d.p], q = d.o; WP[i] = v3.add(WP[d.p], [m[0] * q[0] + m[1] * q[1] + m[2] * q[2], m[3] * q[0] + m[4] * q[1] + m[5] * q[2], m[6] * q[0] + m[7] * q[1] + m[8] * q[2]]); } });
// model space: root at origin
for (let i = 0; i < nv0; i++) { W[i * 3 + 1] -= rootY; W[i * 3 + 2] -= zc; }
// ---------- simplify the elf, then skin by distance to bone segments
const [simp] = MeshoptSimplifier.simplify(I0, W, 3, 9000 * 3, 0.01, []);
const remap = new Int32Array(nv0).fill(-1), V = [], IX = []; for (const q of simp) { if (remap[q] < 0) { remap[q] = V.length / 3; V.push(W[q * 3], W[q * 3 + 1], W[q * 3 + 2]); } IX.push(remap[q]); }
const nv = V.length / 3, N = new Float32Array(nv * 3);
for (let t = 0; t < IX.length; t += 3) { const [a, b2, c] = [IX[t], IX[t + 1], IX[t + 2]], pa = V.slice(a * 3, a * 3 + 3), n = v3.cross(v3.sub(V.slice(b2 * 3, b2 * 3 + 3), pa), v3.sub(V.slice(c * 3, c * 3 + 3), pa)); for (const k of [a, b2, c]) for (let d = 0; d < 3; d++) N[k * 3 + d] += n[d]; }
for (let i = 0; i < nv; i++) { const n = v3.norm([N[i * 3], N[i * 3 + 1], N[i * 3 + 2]]); N.set(n, i * 3); }
const segs = [[0, WP[0], WP[1]], [1, WP[1], v3.add(WP[2], [0, -0.02, 0])], [2, WP[2], v3.add(WP[2], [0, 0.3, 0])], [3, WP[3], WP[4]], [4, WP[4], WP[5]], [5, WP[5], v3.add(WP[5], v3.mul(v3.norm(v3.sub(WP[5], WP[4])), 0.18))],
  [6, WP[6], WP[7]], [7, WP[7], WP[8]], [8, WP[8], v3.add(WP[8], v3.mul(v3.norm(v3.sub(WP[8], WP[7])), 0.18))], [9, WP[9], WP[10]], [10, WP[10], WP[11]], [11, WP[11], v3.add(WP[11], [0, -0.06, 0.15])], [12, WP[12], WP[13]], [13, WP[13], WP[14]], [14, WP[14], v3.add(WP[14], [0, -0.06, 0.15])]];
const segD = (p, a, c) => { const ab = v3.sub(c, a), t = Math.max(0, Math.min(1, v3.dot(v3.sub(p, a), ab) / v3.dot(ab, ab))); return v3.len(v3.sub(p, v3.add(a, v3.mul(ab, t)))); };
const Jb = new Uint8Array(nv * 4), Wb = new Float32Array(nv * 4), C = new Float32Array(nv * 3), M = new Float32Array(nv * 4), UV = new Float32Array(nv * 2), MASK = new Float32Array(nv);
const hc = v3.add(WP[2], [0, 0.11, 0.0]), hr = 0.1, skin = [0.86, 0.78, 0.84];
for (let i = 0; i < nv; i++) { const p = [V[i * 3], V[i * 3 + 1], V[i * 3 + 2]];
  const ds = segs.map(([b, a, c]) => { let d = segD(p, a, c); if ((b >= 3 && b <= 8) && Math.abs(p[0]) < 0.15) d += 0.2; if ((b === 9 || b === 10) && p[0] < -0.01) d += 0.2; if ((b === 12 || b === 13) && p[0] > 0.01) d += 0.2; return [b, d]; }).sort((x, y) => x[1] - y[1]);
  const d0 = ds[0][1], w = ds.slice(0, 4).map(([b, d]) => [b, Math.exp(-Math.pow((d - d0) / 0.035, 2))]), tot = w.reduce((a, q) => a + q[1], 0);
  w.forEach(([b2, ww], k) => { Jb[i * 4 + k] = b2; Wb[i * 4 + k] = ww / tot; });
  C.set(skin, i * 3); M.set([0.25, 0, 0, 0], i * 4);
  if (v3.len(v3.sub(p, hc)) < hr * 1.8) { UV[i * 2] = 0.5 + (p[0] - hc[0]) / (2.4 * hr); UV[i * 2 + 1] = 0.5 - (p[1] - hc[1]) / (2.4 * hr); MASK[i] = Math.max(0, Math.min(1, (p[2] - hc[2] - hr * 0.3) / (hr * 0.3))); } }
// ---------- extras sculpted on the same bones: horns, long black hair, simple dark dress
const BN = ['root', 'spine', 'head', 'lSh', 'lEl', 'lWr', 'rSh', 'rEl', 'rWr', 'lHip', 'lKnee', 'lFoot', 'rHip', 'rKnee', 'rFoot', 'jaw'];
const Hh = (q) => v3.add(hc, q), y0 = WP[1][1] + torso * 0.82, legLen = -WP[11][1];
const parts = [
  { name: 'horns', mat: 'horn', bone: 'head', rigid: true, k: 0.01, sdf: symX(horn([Hh([0.045, 0.07, 0.03]), Hh([0.09, 0.13, -0.02]), Hh([0.13, 0.19, 0.0]), Hh([0.14, 0.26, 0.05])], 0.022, 0.003)) },
  { name: 'hair', mat: 'hair', bone: 'head', rigid: true, k: 0.02, sdf: disp(U(0.02, I(0.01, ellipsoid(Hh([0, 0.02, -0.015]), [0.1, 0.115, 0.115]), plane(Hh([0, 0.06, 0.05]), [0, -0.6, 0.8]))), (x, y, z) => 0.004 * fbm(x * 70, y * 12, z * 70, 2), 0.005) },
  { name: 'hairFall', mat: 'hair', tau: 0.04, k: 0.03, sdf: disp(U(0.04, ellipsoid(Hh([0, -0.12, -0.08]), [0.095, 0.16, 0.05]), cone(Hh([0, -0.2, -0.1]), [0, WP[1][1] - 0.05, -0.14], 0.09, 0.07)), (x, y, z) => 0.004 * fbm(x * 70, y * 8, z * 70, 2), 0.005),
    boneFn: (x, y) => y > WP[2][1] ? [['head', 1]] : [['spine', 1]] },
  { name: 'dress', mat: 'dress', tau: 0.03, k: 0.006, sdf: I(0.004, shell(disp(cone([0, y0, 0.005], [0, -legLen + 0.03, 0.0], 0.14, 0.27), (x, y, z) => Math.max(0, -y) * 0.04 * Math.sin(Math.atan2(x, z) * 9), 0.02), 0.006), plane([0, y0, 0], [0, 1, 0]), plane([0, -legLen + 0.03, 0], [0, -1, 0])),
    boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (x + 0.08) / 0.16)); if (y > WP[1][1]) return [['spine', 1]]; const d = Math.max(0, Math.min(1, -y / (legLen * 0.6))); return [['root', 1 - d * 0.6], ['lHip', d * 0.6 * t], ['rHip', d * 0.6 * (1 - t)]]; } },
  { name: 'straps', mat: 'dress', bone: 'spine', tau: 0.02, k: 0.004, sdf: symX(tube([[0.06, y0 - 0.02, 0.09], [0.08, WP[3][1] + 0.02, 0.0], [0.06, y0 - 0.02, -0.08]], () => 0.009)) },
];
const extra = await sculpt({ name: 'kingExtras', voxel: 0.005, tris: 4500, err: 0.0015, bones: BN, parts, decals: [],
  mats: { horn: { col: [0.08, 0.05, 0.07], col2: [0.4, 0.06, 0.06], freq2: 12, var: 0.15, gloss: 0.7 }, hair: { col: [0.07, 0.05, 0.09], col2: [0.04, 0.03, 0.05], freq2: 30, var: 0.25, freq: 80, gloss: 0.4 },
    dress: { col: [0.12, 0.03, 0.07], col2: [0.28, 0.03, 0.06], freq2: 4, var: 0.12, gloss: 0.35, grad: [-1.0, 0.0, [0.55, 0.55, 0.55]] } } });
// ---------- merge and write
const off = nv, n2 = extra.nv, cat = (a, b2) => { const r = new a.constructor(a.length + b2.length); r.set(a); r.set(b2, a.length); return r; };
const merged = { nv: nv + n2, P: cat(new Float32Array(V), extra.P), N: cat(N, extra.N), C: cat(C, extra.C), M: cat(M, extra.M), J: cat(Jb, extra.J), W: cat(Wb, extra.W), UV: cat(UV, extra.UV), MASK: cat(MASK, extra.MASK), I: cat(new Uint16Array(IX), Uint16Array.from(extra.I, (q) => q + off)) };
fs.writeFileSync(path.join(here, 'cache/king.bin'), pack(merged));
fs.writeFileSync(path.join(here, 'king_rig.json'), JSON.stringify({ K, bind, armA, legA, src: 'body base low poly elf — Yamato (Sketchfab), CC BY 4.0' }));
console.log('queen', { nv: merged.nv, tris: merged.I.length / 3, K: Object.fromEntries(Object.entries(K).map(([k, q]) => [k, +q.toFixed(3)])), armA: +armA.toFixed(2), legA: +legA.toFixed(2), shoulder, elbow, wrist, hipJ, knee, ankle });
