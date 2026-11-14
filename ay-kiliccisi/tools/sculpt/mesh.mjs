// Turns a sculpt (parts of signed-distance clay) into a game mesh:
// sparse voxel grid -> surface nets -> projection onto the true surface -> meshoptimizer simplification ->
// per-vertex normal, painted colour (material + variation + edge wear + cavity dirt + baked occlusion),
// material channel (gloss, metal, glow) and up to 4 smooth skin weights.
import { MeshoptSimplifier } from 'meshoptimizer';
import { fbm } from './sdf.mjs';

const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);
const inBB = (b, x, y, z, p) => x >= b[0] - p && x <= b[3] + p && y >= b[1] - p && y <= b[4] + p && z >= b[2] - p && z <= b[5] + p;
const bbHit = (a, b, p) => a[0] - p <= b[3] && a[3] + p >= b[0] && a[1] - p <= b[4] && a[4] + p >= b[1] && a[2] - p <= b[5] && a[5] + p >= b[2];
const sat = (x) => Math.max(0, Math.min(1, x));

export async function sculpt(M) {
  await MeshoptSimplifier.ready;
  const vox = M.voxel || 0.007, parts = M.parts.map((p, i) => ({ ...p, i, k: p.k ?? 0.012, op: p.op || 'add' }));
  // scene bounds
  let bb = null; for (const p of parts) if (p.op === 'add') bb = bb ? [Math.min(bb[0], p.sdf.bb[0]), Math.min(bb[1], p.sdf.bb[1]), Math.min(bb[2], p.sdf.bb[2]), Math.max(bb[3], p.sdf.bb[3]), Math.max(bb[4], p.sdf.bb[4]), Math.max(bb[5], p.sdf.bb[5])] : p.sdf.bb.slice();
  const pad = 3 * vox; const o = [bb[0] - pad, bb[1] - pad, bb[2] - pad];
  const B = 8, nb = [0, 1, 2].map((a) => Math.ceil((bb[a + 3] - bb[a] + 2 * pad) / (vox * B))), n = nb.map((v) => v * B + 1);
  const NX = n[0], NY = n[1], NZ = n[2], idx = (i, j, k) => (k * NY + j) * NX + i, F = new Float32Array(NX * NY * NZ);
  // field evaluated with only the parts near a point
  const evalList = (list, x, y, z) => { let d = 1e9; for (const p of list) { if (p.op === 'add') d = smin(d, p.sdf.d(x, y, z), p.k); } for (const p of list) if (p.op === 'sub') d = smax(d, -p.sdf.d(x, y, z), p.k); return d; };
  const blockList = new Array(nb[0] * nb[1] * nb[2]); const bid = (a, b, c) => (c * nb[1] + b) * nb[0] + a;
  const half = Math.sqrt(3) * B * vox * 0.5; let active = 0;
  for (let c = 0; c < nb[2]; c++) for (let b = 0; b < nb[1]; b++) for (let a = 0; a < nb[0]; a++) {
    const lo = [o[0] + a * B * vox, o[1] + b * B * vox, o[2] + c * B * vox], hi = [lo[0] + B * vox, lo[1] + B * vox, lo[2] + B * vox], bbk = [...lo, ...hi];
    const list = parts.filter((p) => bbHit(p.sdf.bb, bbk, p.k + 2 * vox)); blockList[bid(a, b, c)] = list;
    const cx = (lo[0] + hi[0]) / 2, cy = (lo[1] + hi[1]) / 2, cz = (lo[2] + hi[2]) / 2, dc = list.length ? evalList(list, cx, cy, cz) : 1e9;
    const full = Math.abs(dc) < half + 2 * vox; if (full) active++;
    for (let k = 0; k <= B; k++) for (let j = 0; j <= B; j++) for (let i = 0; i <= B; i++) { const gi = idx(a * B + i, b * B + j, c * B + k);
      if (full) F[gi] = evalList(list, lo[0] + i * vox, lo[1] + j * vox, lo[2] + k * vox); else if (F[gi] === 0) F[gi] = dc === 1e9 ? 1 : dc; }
  }
  const listAt = (x, y, z) => { const a = Math.min(nb[0] - 1, Math.max(0, Math.floor((x - o[0]) / (B * vox)))), b = Math.min(nb[1] - 1, Math.max(0, Math.floor((y - o[1]) / (B * vox)))), c = Math.min(nb[2] - 1, Math.max(0, Math.floor((z - o[2]) / (B * vox)))); return blockList[bid(a, b, c)]; };
  const field = (x, y, z) => { const l = listAt(x, y, z); return l.length ? evalList(l, x, y, z) : 1; };
  // surface nets
  const cellV = new Int32Array((NX - 1) * (NY - 1) * (NZ - 1)).fill(-1), cid = (i, j, k) => (k * (NY - 1) + j) * (NX - 1) + i;
  const P = [], E = [[0, 0, 0, 1, 0, 0], [0, 1, 0, 1, 1, 0], [0, 0, 1, 1, 0, 1], [0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 1, 1], [1, 0, 1, 1, 1, 1], [0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 0, 1], [0, 1, 0, 0, 1, 1], [1, 1, 0, 1, 1, 1]];
  for (let k = 0; k < NZ - 1; k++) for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
    let neg = 0; for (let c = 0; c < 8; c++) if (F[idx(i + (c & 1), j + (c >> 1 & 1), k + (c >> 2))] < 0) neg++; if (neg === 0 || neg === 8) continue;
    let sx = 0, sy = 0, sz = 0, m = 0; for (const e of E) { const a = F[idx(i + e[0], j + e[1], k + e[2])], b = F[idx(i + e[3], j + e[4], k + e[5])]; if ((a < 0) === (b < 0)) continue; const t = a / (a - b);
      sx += e[0] + (e[3] - e[0]) * t; sy += e[1] + (e[4] - e[1]) * t; sz += e[2] + (e[5] - e[2]) * t; m++; }
    cellV[cid(i, j, k)] = P.length / 3; P.push(o[0] + (i + sx / m) * vox, o[1] + (j + sy / m) * vox, o[2] + (k + sz / m) * vox);
  }
  const I = [];
  for (let k = 1; k < NZ - 1; k++) for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) { const a = F[idx(i, j, k)];
    for (let ax = 0; ax < 3; ax++) { const b = F[idx(i + (ax === 0), j + (ax === 1), k + (ax === 2))]; if ((a < 0) === (b < 0)) continue;
      // the four cells around this edge
      let c; if (ax === 0) c = [cid(i, j - 1, k - 1), cid(i, j, k - 1), cid(i, j, k), cid(i, j - 1, k)]; else if (ax === 1) c = [cid(i - 1, j, k - 1), cid(i - 1, j, k), cid(i, j, k), cid(i, j, k - 1)]; else c = [cid(i - 1, j - 1, k), cid(i, j - 1, k), cid(i, j, k), cid(i - 1, j, k)];
      const v = c.map((q) => cellV[q]); if (v.some((q) => q < 0)) continue; if (a < 0) I.push(v[0], v[1], v[2], v[0], v[2], v[3]); else I.push(v[0], v[2], v[1], v[0], v[3], v[2]); } }
  const grad = (x, y, z, e) => { const gx = field(x + e, y, z) - field(x - e, y, z), gy = field(x, y + e, z) - field(x, y - e, z), gz = field(x, y, z + e) - field(x, y, z - e), l = Math.hypot(gx, gy, gz) || 1; return [gx / l, gy / l, gz / l]; };
  // pull vertices onto the real surface (sharper plates and edges than plain surface nets)
  for (let it = 0; it < 2; it++) for (let v = 0; v < P.length; v += 3) { const x = P[v], y = P[v + 1], z = P[v + 2], d = field(x, y, z); if (Math.abs(d) > vox) continue; const g = grad(x, y, z, vox * 0.5); P[v] -= g[0] * d; P[v + 1] -= g[1] * d; P[v + 2] -= g[2] * d; }
  const rawTris = I.length / 3;
  // simplify
  const pos = new Float32Array(P), idx32 = new Uint32Array(I);
  const target = Math.min(I.length, (M.tris || 12000) * 3);
  const [simp] = MeshoptSimplifier.simplify(idx32, pos, 3, target, M.err ?? 0.004, []);
  const remap = new Int32Array(P.length / 3).fill(-1), V = []; const outI = [];
  for (const q of simp) { if (remap[q] < 0) { remap[q] = V.length / 3; V.push(P[q * 3], P[q * 3 + 1], P[q * 3 + 2]); } outI.push(remap[q]); }
  // attributes
  const nv = V.length / 3, UV = new Float32Array(nv * 2), MASK = new Float32Array(nv), N = new Float32Array(nv * 3), C = new Float32Array(nv * 3), MT = new Float32Array(nv * 4), J = new Uint8Array(nv * 4), W = new Float32Array(nv * 4);
  const boneIx = (name) => { const i = M.bones.indexOf(name); if (i < 0) throw new Error(M.name + ': unknown bone ' + name); return i; };
  for (let v = 0; v < nv; v++) {
    const x = V[v * 3], y = V[v * 3 + 1], z = V[v * 3 + 2], g = grad(x, y, z, vox * 0.6); N[v * 3] = g[0]; N[v * 3 + 1] = g[1]; N[v * 3 + 2] = g[2];
    // which part is this vertex on (closest add part; ties blend)
    const near = []; for (const p of listAt(x, y, z)) if (p.op === 'add' || p.paintSub) near.push([p, p.sdf.d(x, y, z)]);
    if (!near.length) for (const p of parts) if (p.op === 'add') near.push([p, p.sdf.d(x, y, z)]);
    near.sort((a, b) => a[1] - b[1]); const top = near[0][0], dmin = near[0][1];
    // material: the closest part, decals on top
    let matName = top.mat; for (const dc of M.decals || []) if (inBB(dc.sdf.bb, x, y, z, 0.002) && dc.sdf.d(x, y, z) < 0 && (!dc.on || dc.on.includes(top.mat)) && (!dc.onPart || dc.onPart.includes(top.name))) matName = dc.mat;
    const mt = M.mats[matName]; if (!mt) throw new Error(M.name + ': unknown material ' + matName);
    // occlusion and curvature from the field
    let occ = 0; const hs = [0.012, 0.03, 0.06, 0.1, 0.16], ws = [0.32, 0.26, 0.2, 0.14, 0.08];
    for (let s = 0; s < 5; s++) { const h = hs[s], d = field(x + g[0] * h, y + g[1] * h, z + g[2] * h); occ += Math.max(0, h - d) / h * ws[s]; }
    const ao = Math.max(0.2, 1 - occ * 1.6), e = 0.007, d0 = field(x, y, z);
    const lap = (field(x + e, y, z) + field(x - e, y, z) + field(x, y + e, z) + field(x, y - e, z) + field(x, y, z + e) + field(x, y, z - e) - 6 * d0) / (e * e);
    const convex = sat((lap - 18) / 70), cavity = sat((-lap - 6) / 45);
    const fq = mt.freq || 18, vr = 1 + (mt.var ?? 0.12) * fbm(x * fq, y * fq, z * fq, 3);
    let c = mt.col.map((q) => q * vr);
    if (mt.col2) { const t = sat(0.5 + fbm(x * (mt.freq2 || 6) + 3, y * (mt.freq2 || 6), z * (mt.freq2 || 6), 2) * (mt.mix2 || 1.4)); c = c.map((q, i) => q + (mt.col2[i] - q) * t); }
    if (mt.grad) { const t = sat((y - mt.grad[0]) / (mt.grad[1] - mt.grad[0])); c = c.map((q, i) => q * (mt.grad[2][i] + (1 - mt.grad[2][i]) * t)); } // darker towards the bottom (hem, boots)
    const wear = mt.wear ?? 0, edge = mt.edge || [1, 1, 1]; c = c.map((q, i) => q + (edge[i] * Math.max(q, 0.35) * 1.6 - q) * convex * wear);
    c = c.map((q) => q * (1 - (mt.dirt ?? 0.35) * cavity)); c = c.map((q) => q * (0.35 + 0.65 * ao));
    C[v * 3] = c[0]; C[v * 3 + 1] = c[1]; C[v * 3 + 2] = c[2];
    MT[v * 4] = mt.gloss ?? 0.2; MT[v * 4 + 1] = mt.metal ?? 0; MT[v * 4 + 2] = mt.em ?? 0; MT[v * 4 + 3] = mt.tint ?? (mt.metal ? 1 : 0);
    if (M.uv) { const t = M.uv(x, y, z, top); if (t) { UV[v * 2] = t[0]; UV[v * 2 + 1] = t[1]; MASK[v] = t[2] || 0; } }
    // skin weights
    const acc = new Map(), addW = (b, w) => acc.set(b, (acc.get(b) || 0) + w);
    const use = top.rigid ? [near[0]] : near.filter((q) => q[1] - dmin < 0.12);
    for (const [p, d] of use) { const s = Math.exp(-Math.max(0, d - dmin) / (p.tau || 0.022)); const bl = p.boneFn ? p.boneFn(x, y, z) : [[p.bone, 1]]; for (const [b, w] of bl) addW(boneIx(b), w * s); }
    const ws4 = [...acc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4); const tot = ws4.reduce((a, q) => a + q[1], 0);
    ws4.forEach(([b, w], k) => { J[v * 4 + k] = b; W[v * 4 + k] = w / tot; });
  }
  return { name: M.name, nv, P: new Float32Array(V), N, C, M: MT, J, W, UV, MASK, I: new Uint16Array(outI), info: { voxels: NX * NY * NZ, activeBlocks: active, rawTris, tris: outI.length / 3, verts: nv } };
}

// compact binary: header + int16 positions, int8 normals, u8 colour, u8 material, u8 joints, u8 weights, u16 index
export function pack(m) {
  const nv = m.nv, ni = m.I.length; let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let v = 0; v < nv; v++) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], m.P[v * 3 + a]); hi[a] = Math.max(hi[a], m.P[v * 3 + a]); }
  const sc = lo.map((l, a) => (hi[a] - l) / 65535 || 1);
  const size = 8 + 24 + nv * (6 + 3 + 3 + 4 + 4 + 4) + ni * 2 + nv * 5, buf = new ArrayBuffer(size + (size % 4 ? 4 - size % 4 : 0)), dv = new DataView(buf); let q = 0;
  dv.setUint32(q, nv, true); q += 4; dv.setUint32(q, ni, true); q += 4; for (let a = 0; a < 3; a++) { dv.setFloat32(q, lo[a], true); q += 4; } for (let a = 0; a < 3; a++) { dv.setFloat32(q, sc[a], true); q += 4; }
  for (let i = 0; i < nv * 3; i++) { dv.setUint16(q, Math.round((m.P[i] - lo[i % 3]) / sc[i % 3]), true); q += 2; }
  for (let i = 0; i < nv * 3; i++) dv.setInt8(q++, Math.round(Math.max(-1, Math.min(1, m.N[i])) * 127));
  for (let i = 0; i < nv * 3; i++) dv.setUint8(q++, Math.round(Math.max(0, Math.min(1, m.C[i] / 1.6)) * 255));
  for (let i = 0; i < nv * 4; i++) dv.setUint8(q++, Math.round(Math.max(0, Math.min(1, m.M[i])) * 255));
  for (let i = 0; i < nv * 4; i++) dv.setUint8(q++, m.J[i]);
  for (let v = 0; v < nv; v++) { const w = [0, 1, 2, 3].map((k) => Math.round(m.W[v * 4 + k] * 255)); w[0] += 255 - (w[0] + w[1] + w[2] + w[3]); for (let k = 0; k < 4; k++) dv.setUint8(q++, Math.max(0, w[k])); }
  for (let i = 0; i < ni; i++) { dv.setUint16(q, m.I[i], true); q += 2; }
  for (let i = 0; i < nv * 2; i++) { dv.setUint16(q, Math.round(Math.max(0, Math.min(1, m.UV[i])) * 65535), true); q += 2; }
  for (let i = 0; i < nv; i++) dv.setUint8(q++, Math.round(Math.max(0, Math.min(1, m.MASK[i])) * 255));
  return new Uint8Array(buf);
}
