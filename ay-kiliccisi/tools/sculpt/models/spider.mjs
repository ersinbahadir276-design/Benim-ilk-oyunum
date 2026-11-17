// Giant cave spider on the wolf rig (12 bones): each of the four wolf legs drives a pair of spider legs.
import { v3, rot, sphere, cone, tube, ellipsoid, horn, U, Sub, disp, symX, fbm } from '../sdf.mjs';
export default function spider(ALL) { const { WHIP, W_UP, W_LO } = ALL.wolf, bones = ['body', 'head', 'jaw', 'tail', 'leg0', 'leg1', 'leg2', 'leg3', 'low0', 'low1', 'low2', 'low3'];
  const DY = -0.2, HD0 = [0, 0.3, 0.76], HD = [0, 0.3 + DY, 0.76], JW = v3.add(HD, [0, -0.055, 0.1]), P = [], hairy = (a, amp = 0.006) => disp(a, (x, y, z) => amp * fbm(x * 40, y * 40, z * 40, 2), amp * 1.3);
  P.push({ name: 'thorax', mat: 'chitin', bone: 'body', tau: 0.05, sdf: hairy(ellipsoid([0, 0.02 + DY, 0.28], [0.24, 0.17, 0.3])) });
  P.push({ name: 'abdomen', mat: 'chitin', bone: 'tail', tau: 0.08, k: 0.05, sdf: hairy(U(0.08, ellipsoid([0, 0.12 + DY, -0.36], [0.36, 0.3, 0.46]), sphere([0, 0.05 + DY, -0.82], 0.1)), 0.01), boneFn: (x, y, z) => { const t = Math.max(0, Math.min(1, (-z - 0.05) / 0.3)); return [['tail', t * 0.5], ['body', 1 - t * 0.5]]; } });
  P.push({ name: 'head', mat: 'chitin', bone: 'head', rigid: true, k: 0.03, sdf: hairy(ellipsoid(v3.add(HD, [0, -0.12, -0.12]), [0.16, 0.12, 0.17])) });
  const eyes = []; for (const [x, y, z, r] of [[0.045, -0.05, 0.02, 0.03], [0.1, -0.07, -0.01, 0.024], [0.03, -0.1, 0.04, 0.02], [0.13, -0.1, -0.05, 0.018]]) eyes.push(symX(sphere(v3.add(HD, [x, y, z]), r)));
  P.push({ name: 'eyes', mat: 'eye', bone: 'head', rigid: true, k: 0.002, sdf: U(0, ...eyes) });
  P.push({ name: 'fangs', mat: 'fang', bone: 'jaw', rigid: true, k: 0.004, sdf: symX(U(0.004, cone(v3.add(JW, [0.05, -0.02, -0.02]), v3.add(JW, [0.055, -0.1, 0.03]), 0.03, 0.02), horn([v3.add(JW, [0.055, -0.1, 0.03]), v3.add(JW, [0.04, -0.17, 0.05]), v3.add(JW, [0.015, -0.21, 0.03])], 0.02))) });
  WHIP.forEach((hp, l) => { const s = Math.sign(hp[0]), top = [hp[0], hp[1] + DY, hp[2]];
    for (const dz of [0.1, -0.1]) { const k2 = [hp[0] + s * 0.5, 0.32, hp[2] + dz * 2.6], f2 = [hp[0] + s * 1.02, -0.72, hp[2] + dz * 3.8];
      P.push({ name: 'up' + l + dz, mat: 'leg', tau: 0.03, k: 0.03, sdf: cone(v3.add(top, [s * 0.02, 0.04, dz]), k2, 0.05, 0.032), boneFn: (x) => { const t = Math.max(0, Math.min(1, (Math.abs(x) - 0.14) / 0.12)); return [['leg' + l, t], ['body', 1 - t]]; } });
      P.push({ name: 'lo' + l + dz, mat: 'leg', bone: 'low' + l, rigid: true, k: 0.02, sdf: U(0.01, cone(k2, f2, 0.032, 0.014), sphere(k2, 0.04)) }); } });
  return { name: 'spider', voxel: 0.0075, tris: 7000, err: 0.002, bones, parts: P,
    decals: [{ mat: 'mark', sdf: U(0.05, ellipsoid([0, 0.4 + DY, -0.3], [0.1, 0.1, 0.2]), ellipsoid([0, 0.38 + DY, -0.55], [0.16, 0.1, 0.07])), on: ['chitin'] }],
    mats: { chitin: { col: [0.13, 0.11, 0.14], col2: [0.22, 0.16, 0.2], freq2: 12, var: 0.2, gloss: 0.5, dirt: 0.5 }, leg: { col: [0.1, 0.09, 0.11], gloss: 0.55, wear: 0.4, edge: [0.5, 0.4, 0.45] }, mark: { col: [0.9, 0.12, 0.1], gloss: 0.5, em: 0.25 },
      eye: { col: [1.4, 0.2, 0.15], em: 0.9, gloss: 0.9 }, fang: { col: [0.2, 0.08, 0.08], gloss: 0.7 } } }; }
