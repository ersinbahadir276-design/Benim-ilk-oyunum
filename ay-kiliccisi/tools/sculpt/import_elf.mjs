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
const hc = [0, 1.665 - rootY, 0.014], hr = 0.095, skin = [0.95, 0.84, 0.8];
for (let i = 0; i < nv; i++) { const p = [V[i * 3], V[i * 3 + 1], V[i * 3 + 2]];
  const ds = segs.map(([b, a, c]) => { let d = segD(p, a, c); if ((b >= 3 && b <= 8) && Math.abs(p[0]) < 0.15) d += 0.2; if ((b === 9 || b === 10) && p[0] < -0.01) d += 0.2; if ((b === 12 || b === 13) && p[0] > 0.01) d += 0.2; return [b, d]; }).sort((x, y) => x[1] - y[1]);
  const d0 = ds[0][1], w = ds.slice(0, 4).map(([b, d]) => [b, Math.exp(-Math.pow((d - d0) / 0.035, 2))]), tot = w.reduce((a, q) => a + q[1], 0);
  w.forEach(([b2, ww], k) => { Jb[i * 4 + k] = b2; Wb[i * 4 + k] = ww / tot; });
  // outfit painted on the body: long gloves, thigh boots, leggings, corset with a V neckline, collar
  const [px, py, pz] = p, shX = WP[3][0] - 0.025, kneeY = WP[10][1], chestY = WP[1][1] + torso * 0.62, waistY = WP[1][1] + 0.02;
  let leather = false, armor = false;
  if (Math.abs(px) > shX && py < WP[3][1] + 0.02) leather = true;                        // arms + hands
  if (py < WP[9][1] - 0.02) leather = py < kneeY + 0.2 || pz < 0.0 || Math.abs(px) < 0.05; // boots to mid-thigh, leggings behind
  if (py >= WP[9][1] - 0.02 && py < chestY + 0.11) { const v = pz > 0.02 && py > chestY - 0.04 && Math.abs(px) < 0.012 + (py - (chestY - 0.04)) * 0.5; leather = !v; armor = py > waistY && py < chestY - 0.02 && pz > 0.0 && !v; }
  if (py > WP[2][1] - 0.07 && py < WP[2][1] + 0.03) leather = true;                        // collar band
  const hd = v3.len(v3.sub(p, hc)); if (hd < hr * 1.6 && Math.abs(px) < 0.085 && (py > hc[1] + 0.06 || (pz < hc[2] - 0.02 && py > hc[1] - 0.06))) { C.set([0.36, 0.07, 0.07], i * 3); M.set([0.3, 0, 0, 0], i * 4); leather = null; }
  if (leather === null) { /* scalp painted in the hair colour */ } else if (leather) { C.set(armor ? [0.11, 0.11, 0.13] : [0.06, 0.055, 0.065], i * 3); M.set(armor ? [0.6, 0.7, 0, 0] : [0.5, 0, 0, 0], i * 4); } else { C.set(skin, i * 3); M.set([0.25, 0, 0, 0], i * 4); }
  if (v3.len(v3.sub(p, hc)) < hr * 1.8) { UV[i * 2] = 0.5 + (p[0] - hc[0]) / (2.4 * hr); UV[i * 2 + 1] = 0.5 - (p[1] - hc[1]) / (2.4 * hr); MASK[i] = Math.max(0, Math.min(1, (p[2] - hc[2] - hr * 0.3) / (hr * 0.3))); } }
// ---------- extras sculpted on the same bones: horns, long black hair, simple dark dress
const BN = ['root', 'spine', 'head', 'lSh', 'lEl', 'lWr', 'rSh', 'rEl', 'rWr', 'lHip', 'lKnee', 'lFoot', 'rHip', 'rKnee', 'rFoot', 'jaw'];
const Hh = (q) => v3.add(hc, q), y0 = WP[1][1] + torso * 0.82, legLen = -WP[11][1];
const shL = WP[3], chestY2 = WP[1][1] + torso * 0.62, hipY = WP[9][1] + 0.06, kneeY2 = WP[10][1];
const skirtEdge = (x, y, z) => { const a = Math.atan2(x, z), jag = 0.05 * Math.abs(Math.sin(a * 6)); return (kneeY2 + 0.12 - jag - (Math.abs(a) > 2.2 ? 0.12 : 0)) - y; };
const parts = [
  // ram horns curling around the ears
  { name: 'horns', mat: 'horn', bone: 'head', rigid: true, k: 0.01, sdf: symX(disp(horn([Hh([0.06, 0.085, 0.02]), Hh([0.11, 0.115, -0.04]), Hh([0.16, 0.085, -0.085]), Hh([0.185, 0.02, -0.06]), Hh([0.17, -0.03, 0.0]), Hh([0.13, -0.025, 0.05]), Hh([0.11, 0.01, 0.06])], 0.03, 0.006),
    (x, y, z) => 0.0025 * Math.sin(Math.hypot(x, y - hc[1], z) * 220), 0.003)) },
  // long straight crimson hair, bangs, front locks
  { name: 'hair', mat: 'hair', bone: 'head', rigid: true, k: 0.02, sdf: disp(U(0.02, I(0.01, ellipsoid(Hh([0, 0.025, -0.02]), [0.1, 0.128, 0.122]), plane(Hh([0, 0.045, 0.085]), [0, -0.5, 0.86])), symX(ellipsoid(Hh([0.078, -0.03, -0.01]), [0.03, 0.1, 0.07]))), (x, y, z) => 0.0035 * Math.abs(Math.sin(x * 260 + z * 140)) + 0.002 * fbm(x * 120, y * 8, z * 120, 2), 0.005) },
  { name: 'bangs', mat: 'hair', bone: 'head', rigid: true, k: 0.006, sdf: U(0.004, ...Array.from({ length: 12 }, (_, j) => { const x = -0.066 + j * 0.012 + (j >= 6 ? 0.006 : -0.006), cv = Math.sign(x) * 0.006; return horn([Hh([x * 0.85, 0.1, 0.08]), Hh([x * 1.0 + cv, 0.075, 0.103]), Hh([x * 1.08 + cv * 1.6, 0.05 - (j % 3) * 0.004, 0.108])], 0.009, 0.002); })) },
  { name: 'strands', mat: 'hair', tau: 0.04, k: 0.012, sdf: U(0.006, ...Array.from({ length: 10 }, (_, j) => { const a = -1.2 + j * 0.27, s = Math.sin(a), c = Math.cos(a); return horn([Hh([s * 0.105, -0.02, c * -0.11]), Hh([s * 0.12, -0.18, c * -0.13]), [s * 0.12, WP[1][1] + 0.05 - (j % 3) * 0.04, -0.12 * c - 0.04]], 0.016, 0.003); })), boneFn: (x, y) => y > WP[2][1] ? [['head', 1]] : [['spine', 1]] },
  { name: 'locks', mat: 'hair', tau: 0.04, k: 0.02, sdf: symX(disp(horn([Hh([0.085, 0.03, 0.06]), Hh([0.1, -0.12, 0.06]), [0.13, chestY2, 0.07], [0.13, chestY2 - 0.22, 0.05]], 0.03, 0.008), (x, y, z) => 0.003 * fbm(x * 80, y * 10, z * 80, 2), 0.004)), boneFn: (x, y) => y > WP[2][1] ? [['head', 1]] : [['head', 0.3], ['spine', 0.7]] },
  { name: 'hairFall', mat: 'hair', tau: 0.04, k: 0.03, sdf: disp(U(0.04, ellipsoid(Hh([0, -0.08, -0.09]), [0.11, 0.16, 0.06]), cone(Hh([0, -0.18, -0.11]), [0, WP[1][1] - 0.12, -0.15], 0.11, 0.09)), (x, y, z) => 0.004 * fbm(x * 70, y * 8, z * 70, 2), 0.005),
    boneFn: (x, y) => y > WP[2][1] ? [['head', 1]] : [['spine', 1]] },
  // high collar with a red gem, layered shoulder plates
  { name: 'collar', mat: 'leather', bone: 'spine', tau: 0.02, k: 0.006, sdf: I(0.004, shell(cone(v3.add(WP[2], [0, -0.06, 0.01]), v3.add(WP[2], [0, 0.07, 0.0]), 0.06, 0.07), 0.006), plane(v3.add(WP[2], [0, 0.08, 0]), [0, 1, 0]), plane(v3.add(WP[2], [0, -0.07, 0]), [0, -1, 0])) },
  { name: 'gem', mat: 'gem', bone: 'spine', rigid: true, k: 0.003, sdf: ellipsoid(v3.add(WP[2], [0, -0.075, 0.075]), [0.016, 0.022, 0.01]) },
  { name: 'pauld', mat: 'armor', tau: 0.02, k: 0.004, sdf: symX(U(0.004, ...[0, 1].map((k) => I(0.004, shell(ellipsoid(v3.add(shL, [0.02 + k * 0.012, -0.01 - k * 0.04, 0]), [0.07 + k * 0.008, 0.05, 0.065 + k * 0.008], rot.z(-0.5)), 0.006), plane(v3.add(shL, [0, -0.03 - k * 0.04, 0]), [-0.5, -1, 0]))))),
    boneFn: (x) => [[x > 0 ? 'lSh' : 'rSh', 0.7], ['spine', 0.3]] },
  // open-front layered skirt with pointed armoured plates
  { name: 'skirt', mat: 'leather', tau: 0.03, k: 0.006, sdf: I(0.004, shell(disp(cone([0, hipY, 0.0], [0, kneeY2 - 0.05, 0.0], 0.16, 0.25), (x, y, z) => Math.max(0, hipY - y) * 0.05 * Math.sin(Math.atan2(x, z) * 8), 0.02), 0.006), plane([0, hipY, 0], [0, 1, 0]),
      { d: skirtEdge, bb: [-2, -2, -2, 2, 2, 2] }, { d: (x, y, z) => -(Math.abs(x) - 0.03 - Math.max(0, hipY - 0.05 - y) * 0.5) * (z > 0 ? 1 : -1) * (z > 0 ? 1 : 0) - (z > 0 ? 0 : 1), bb: [-2, -2, -2, 2, 2, 2] }),
    boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (x + 0.08) / 0.16)), d = Math.max(0, Math.min(1, (hipY - y) / 0.4)); return [['root', 1 - d * 0.65], ['lHip', d * 0.65 * t], ['rHip', d * 0.65 * (1 - t)]]; } },
  { name: 'tassets', mat: 'armor', tau: 0.03, k: 0.004, sdf: symX(U(0, ...[0, 1].map((k) => I(0.004, shell(ellipsoid([0.1, hipY - 0.1 - k * 0.07, 0.02], [0.12 + k * 0.01, 0.16, 0.13 + k * 0.01]), 0.006), plane([0, hipY - 0.02 - k * 0.07, 0], [0, 1, 0]), { d: (x, y, z) => (hipY - 0.15 - k * 0.07 - 0.04 * Math.abs(Math.sin(x * 40))) - y, bb: [-2, -2, -2, 2, 2, 2] }, plane([0, 0, -0.02], [0, 0, -1]))))),
    boneFn: (x, y) => [[x > 0 ? 'lHip' : 'rHip', 0.6], ['root', 0.4]] },
  { name: 'belt', mat: 'armor', bone: 'root', rigid: true, k: 0.004, sdf: I(0.003, shell(ellipsoid([0, hipY, 0.0], [0.15, 0.08, 0.12]), 0.008), plane([0, hipY + 0.02, 0], [0, 1, 0]), plane([0, hipY - 0.015, 0], [0, -1, 0])) },
  // boot tops
  { name: 'bootTop', mat: 'armor', tau: 0.02, k: 0.004, sdf: symX(I(0.003, shell(cone([WP[9][0], kneeY2 + 0.26, 0.0], [WP[10][0], kneeY2 + 0.12, 0.0], 0.072, 0.065), 0.006), plane([0, kneeY2 + 0.22, 0], [0, 1, 0]), plane([0, kneeY2 + 0.19, 0], [0, -1, 0]))), boneFn: (x) => [[x > 0 ? 'lHip' : 'rHip', 1]] },
];
const DROP = ['hair', 'bangs', 'strands', 'locks', 'hairFall', 'skirt', 'tassets', 'belt']; // hair now comes from the hair GLB; no skirt armour
for (let i = parts.length - 1; i >= 0; i--) if (DROP.includes(parts[i].name)) parts.splice(i, 1);
const extra = await sculpt({ name: 'kingExtras', voxel: 0.0045, tris: 7000, err: 0.0012, bones: BN, parts, decals: [],
  mats: { horn: { col: [0.13, 0.12, 0.13], col2: [0.24, 0.22, 0.22], freq2: 16, var: 0.15, gloss: 0.5, dirt: 0.6 }, hair: { col: [0.5, 0.07, 0.07], col2: [0.3, 0.035, 0.04], freq2: 30, var: 0.25, freq: 80, gloss: 0.45 },
    leather: { col: [0.06, 0.055, 0.065], var: 0.12, freq: 60, gloss: 0.5 }, armor: { col: [0.12, 0.12, 0.14], gloss: 0.65, metal: 0.8, wear: 0.5, edge: [0.6, 0.6, 0.65], var: 0.1 }, gem: { col: [1.4, 0.12, 0.1], em: 0.8, gloss: 0.9 } } });
// ---------- merge and write
const off = nv, n2 = extra.nv, cat = (a, b2) => { const r = new a.constructor(a.length + b2.length); r.set(a); r.set(b2, a.length); return r; };
const merged = { nv: nv + n2, P: cat(new Float32Array(V), extra.P), N: cat(N, extra.N), C: cat(C, extra.C), M: cat(M, extra.M), J: cat(Jb, extra.J), W: cat(Wb, extra.W), UV: cat(UV, extra.UV), MASK: cat(MASK, extra.MASK), I: cat(new Uint16Array(IX), Uint16Array.from(extra.I, (q) => q + off)) };
fs.writeFileSync(path.join(here, 'cache/king.bin'), pack(merged));
fs.writeFileSync(path.join(here, 'king_rig.json'), JSON.stringify({ K, bind, armA, legA, src: 'body base low poly elf — Yamato (Sketchfab), CC BY 4.0' }));
console.log('queen', { nv: merged.nv, tris: merged.I.length / 3, K: Object.fromEntries(Object.entries(K).map(([k, q]) => [k, +q.toFixed(3)])), armA: +armA.toFixed(2), legA: +legA.toFixed(2), shoulder, elbow, wrist, hipJ, knee, ankle });
