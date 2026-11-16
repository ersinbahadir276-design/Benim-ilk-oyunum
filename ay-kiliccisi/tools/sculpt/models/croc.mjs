// Swamp crocodile on the game's 16-bone croc rig (rest pose: legs sprawled sideways, identity rotations).
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, symX, fbm, noise } from '../sdf.mjs';

export default function croc(ALL) {
  const def = ALL.croc, WP = []; def.forEach((b, i) => { WP[i] = b.p < 0 ? [0, 0, 0] : v3.add(WP[b.p], b.o); });
  const bones = ['body', 'chest', 'head', 'jaw', 't1', 't2', 't3', 't4', 'flU', 'flL', 'frU', 'frL', 'blU', 'blL', 'brU', 'brL'];
  const P = [], HD = WP[2], JW = WP[3], H = (p) => v3.add(HD, p), J = (p) => v3.add(JW, p);
  const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // spine weights: body -> chest forward, body -> t1..t4 backward, smooth around each pivot
  const pivots = [[WP[7][2], 't4'], [WP[6][2], 't3'], [WP[5][2], 't2'], [WP[4][2], 't1'], [0.3, 'body'], [WP[1][2] + 0.2, 'chest']];
  const spineW = (x, y, z) => { const out = []; for (let i = 0; i < pivots.length - 1; i++) { const [z0, b0] = pivots[i], [z1] = pivots[i + 1]; const w = sst(z0 - 0.12, z0 + 0.12, z) * (1 - sst(z1 - 0.12, z1 + 0.12, z)); if (w > 0.001) out.push([b0, w]); }
    if (z < pivots[0][0]) out.push(['t4', 1]); const wc = sst(pivots[5][0] - 0.15, pivots[5][0] + 0.15, z); if (wc > 0.001) out.push(['chest', wc]); return out.length ? out : [['body', 1]]; };
  const scaleD = (a, amp = 0.004) => disp(a, (x, y, z) => amp * (Math.abs(Math.sin(x * 55)) * Math.abs(Math.sin(z * 45)) - 0.3) + amp * 0.6 * fbm(x * 30, y * 30, z * 30, 2), amp * 1.4);
  // body + neck, flat belly
  const body = I(0.04, U(0.12, ellipsoid([0, 0.01, -0.05], [0.3, 0.17, 0.62]), ellipsoid([0, 0.01, 0.48], [0.26, 0.15, 0.36]), ellipsoid([0, 0.02, 0.85], [0.19, 0.12, 0.28])), plane([0, -0.14, 0], [0, -1, 0]));
  P.push({ name: 'body', mat: 'scale', tau: 0.08, k: 0.05, sdf: scaleD(body), boneFn: spineW });
  // tail: chain of laterally flattened ellipsoids
  const tz = [-0.5, -0.8, -1.1, -1.4, -1.7, -2.0, -2.3, -2.55, -2.75], tail = U(0.1, ...tz.map((z, i) => { const r = 0.22 * (1 - i / (tz.length + 0.5)); return ellipsoid([0, 0.0 - i * 0.004, z], [r * 0.72, r * 0.9, 0.24]); }));
  P.push({ name: 'tail', mat: 'scale', tau: 0.08, k: 0.08, sdf: scaleD(tail), boneFn: spineW });
  // back scutes: two rows on the body, merging into a single crest on the tail
  const sc = []; for (let i = 0; i < 14; i++) { const z = 0.75 - i * 0.1, w = 0.07 + 0.03 * Math.sin(i * 0.4); for (const s of [-1, 1]) sc.push(box([s * w, 0.155 - Math.abs(z - 0.1) * 0.03, z], [0.028, 0.022, 0.04], rot.z(s * 0.15), 0.008)); }
  for (let i = 0; i < 18; i++) { const z = -0.62 - i * 0.12, r = 0.2 * (1 - (i / 20)); for (const s of i < 9 ? [-1, 1] : [0]) sc.push(I(0.003, box([s * r * 0.35, r * 0.82, z], [0.012, 0.05 * (1 - i / 22), 0.045], null, 0.006), plane([0, 0, z], [0, -0.6, 0.8]))); }
  P.push({ name: 'scutes', mat: 'scute', tau: 0.05, k: 0.012, sdf: U(0, ...sc), boneFn: spineW });
  // head: flat wedge skull, long snout, raised eyes and nostrils
  const upper = I(0.02, U(0.06, ellipsoid(H([0, 0.0, 0.1]), [0.17, 0.09, 0.2]), cone(H([0, 0.0, 0.1]), H([0, -0.005, 0.66]), 0.15, 0.07)), plane(H([0, -0.02, 0]), [0, -1, 0]));
  P.push({ name: 'head', mat: 'scale', bone: 'head', rigid: true, k: 0.02, sdf: scaleD(U(0.03, upper, symX(sphere(H([0.085, 0.075, 0.07]), 0.045)), sphere(H([0, 0.03, 0.63]), 0.04)), 0.003) });
  P.push({ name: 'eyes', mat: 'eye', bone: 'head', rigid: true, k: 0.004, sdf: symX(ellipsoid(H([0.09, 0.09, 0.085]), [0.028, 0.02, 0.03])) });
  // jaw
  P.push({ name: 'jaw', mat: 'belly', bone: 'jaw', rigid: true, k: 0.02, sdf: I(0.02, U(0.05, ellipsoid(J([0, -0.02, 0.05]), [0.15, 0.06, 0.2]), cone(J([0, -0.02, 0.05]), J([0, -0.025, 0.62]), 0.13, 0.06)), plane(J([0, 0.0, 0]), [0, 1, 0])) });
  const teeth = (top) => { const t = []; for (let i = 0; i < 9; i++) { const z = 0.14 + i * 0.058, w = 0.13 - i * 0.008; for (const s of [-1, 1]) { const b = top ? H([s * w, -0.02, z]) : J([s * (w - 0.01), 0.0, z + 0.03]); t.push(horn([b, v3.add(b, [0, top ? -0.035 : 0.035, 0.004])], 0.011)); } } return U(0, ...t); };
  P.push({ name: 'teethU', mat: 'tooth', bone: 'head', rigid: true, k: 0.002, sdf: teeth(true) });
  P.push({ name: 'teethL', mat: 'tooth', bone: 'jaw', rigid: true, k: 0.002, sdf: teeth(false) });
  // legs: upper + lower sprawled along x, flat feet with toes and claws
  [[8, 9, 'flU', 'flL'], [10, 11, 'frU', 'frL'], [12, 13, 'blU', 'blL'], [14, 15, 'brU', 'brL']].forEach(([u, l, bu, bl]) => { const s = Math.sign(WP[u][0]), a = WP[u], k = WP[l], back = u >= 12, foot = v3.add(k, [s * (back ? 0.26 : 0.22), -0.05, 0.02]);
    P.push({ name: bu, mat: 'scale', tau: 0.04, k: 0.06, sdf: scaleD(cone(v3.add(a, [-s * 0.05, 0, 0]), k, back ? 0.11 : 0.09, 0.06)), boneFn: (x) => { const t = sst(Math.abs(a[0]) - 0.02, Math.abs(a[0]) + 0.1, Math.abs(x)); return [[bu, t], [u < 12 ? 'chest' : 'body', 1 - t]]; } });
    P.push({ name: bl, mat: 'scale', bone: bl, tau: 0.03, k: 0.04, sdf: scaleD(U(0.04, cone(k, foot, 0.06, 0.045), ellipsoid(v3.add(foot, [s * 0.03, -0.02, 0.03]), [0.07, 0.025, 0.07])), 0.003) });
    P.push({ name: bl + 'Toes', mat: 'scale', bone: bl, rigid: true, k: 0.02, sdf: U(0.01, ...[-1.5, -0.5, 0.5, 1.5].map((i) => cone(v3.add(foot, [s * 0.03, -0.03, 0.05]), v3.add(foot, [s * (0.05 + i * 0.03), -0.04, 0.14 - Math.abs(i) * 0.02]), 0.016, 0.01))) });
    P.push({ name: bl + 'Claws', mat: 'claw', bone: bl, rigid: true, k: 0.002, sdf: U(0, ...[-1.5, -0.5, 0.5, 1.5].map((i) => horn([v3.add(foot, [s * (0.05 + i * 0.03), -0.04, 0.14 - Math.abs(i) * 0.02]), v3.add(foot, [s * (0.055 + i * 0.033), -0.05, 0.17 - Math.abs(i) * 0.02])], 0.009))) }); });
  return {
    name: 'croc', voxel: 0.0075, tris: 8000, err: 0.0012, bones, parts: P,
    decals: [{ mat: 'belly', sdf: U(0.06, ellipsoid([0, -0.17, 0.0], [0.26, 0.08, 0.95]), ellipsoid([0, -0.13, -1.2], [0.14, 0.08, 1.0]), ellipsoid(H([0, -0.06, 0.3]), [0.14, 0.03, 0.4])), on: ['scale'] },
      { mat: 'pupil', sdf: symX(ellipsoid(H([0.09, 0.093, 0.112]), [0.005, 0.016, 0.006])), on: ['eye'] }],
    mats: {
      scale: { col: [0.27, 0.34, 0.19], col2: [0.17, 0.22, 0.12], freq2: 4, var: 0.25, freq: 40, gloss: 0.35, dirt: 0.55 },
      belly: { col: [0.62, 0.6, 0.44], col2: [0.5, 0.48, 0.35], freq2: 10, var: 0.15, freq: 30, gloss: 0.25, dirt: 0.45 },
      scute: { col: [0.15, 0.19, 0.11], var: 0.2, freq: 40, gloss: 0.3, wear: 0.4, edge: [0.6, 0.65, 0.45], dirt: 0.6 },
      tooth: { col: [0.92, 0.88, 0.74], gloss: 0.4 }, claw: { col: [0.12, 0.11, 0.09], gloss: 0.4 },
      eye: { col: [1.3, 1.0, 0.25], gloss: 0.9, em: 0.3 }, pupil: { col: [0.02, 0.02, 0.02], gloss: 0.9 },
    },
  };
}
