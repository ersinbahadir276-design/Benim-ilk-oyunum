// Plague rat (Veba Sıçanı): dog-sized, hunched back, mangy fur, long bare tail, yellow incisors, red bead eyes. Wolf rig (12 bones).
import { v3, sphere, cone, tube, ellipsoid, horn, U, Sub, disp, symX, fbm } from '../sdf.mjs';
export default function rat(ALL) { const { WHIP, W_UP, W_LO } = ALL.wolf, bones = ['body', 'head', 'jaw', 'tail', 'leg0', 'leg1', 'leg2', 'leg3', 'low0', 'low1', 'low2', 'low3'];
  const DY = -0.3, HD = [0, 0.3 + DY, 0.76], JW = v3.add(HD, [0, -0.055, 0.1]), P = [], fur = (a, amp = 0.01) => disp(a, (x, y, z) => amp * fbm(x * 30, y * 30, z * 30, 3), amp * 1.4);
  P.push({ name: 'body', mat: 'fur', tau: 0.08, k: 0.06, sdf: fur(U(0.12, ellipsoid([0, 0.02 + DY, 0.32], [0.2, 0.2, 0.3]), ellipsoid([0, 0.08 + DY, -0.12], [0.26, 0.27, 0.4]), ellipsoid([0, 0.02 + DY, -0.5], [0.2, 0.2, 0.2]))),
    boneFn: (x, y, z) => { const t = Math.max(0, Math.min(1, (z - 0.45) / 0.3)), r = Math.max(0, Math.min(1, (-z - 0.5) / 0.2)); return [['head', t * 0.6], ['tail', r * 0.4], ['body', 1 - t * 0.6 - r * 0.4]]; } });
  P.push({ name: 'head', mat: 'fur', bone: 'head', rigid: true, k: 0.04, sdf: fur(U(0.05, ellipsoid(v3.add(HD, [0, 0, 0.02]), [0.13, 0.12, 0.15]), cone(v3.add(HD, [0, -0.01, 0.1]), v3.add(HD, [0, -0.04, 0.32]), 0.09, 0.035)), 0.006) });
  P.push({ name: 'nose', mat: 'pink', bone: 'head', rigid: true, k: 0.004, sdf: sphere(v3.add(HD, [0, -0.035, 0.345]), 0.028) });
  P.push({ name: 'ears', mat: 'pink', bone: 'head', rigid: true, k: 0.006, sdf: symX(Sub(0.004, ellipsoid(v3.add(HD, [0.09, 0.12, -0.02]), [0.065, 0.07, 0.025]), ellipsoid(v3.add(HD, [0.09, 0.12, 0.0]), [0.05, 0.055, 0.02]))) });
  P.push({ name: 'eyes', mat: 'eye', bone: 'head', rigid: true, k: 0.002, sdf: symX(sphere(v3.add(HD, [0.075, 0.04, 0.12]), 0.024)) });
  P.push({ name: 'teeth', mat: 'tooth', bone: 'jaw', rigid: true, k: 0.002, sdf: symX(cone(v3.add(HD, [0.012, -0.06, 0.3]), v3.add(HD, [0.012, -0.12, 0.31]), 0.012, 0.008)) });
  P.push({ name: 'tail', mat: 'pink', bone: 'tail', k: 0.01, sdf: tube([[0, 0.02 + DY, -0.62], [0, -0.06 + DY, -0.85], [0.06, -0.2 + DY, -1.1], [0.15, -0.36 + DY, -1.32], [0.1, -0.42 + DY, -1.5]], (t) => 0.045 * (1 - t) + 0.006) });
  WHIP.forEach((hp, l) => { const s = Math.sign(hp[0]), top = [hp[0], hp[1] + DY, hp[2]], knee = v3.add(top, [s * 0.03, -0.17, hp[3] < 0 ? 0.05 : -0.08]), foot = [hp[0] + s * 0.04, -0.72, hp[2] + 0.04];
    P.push({ name: 'up' + l, mat: 'fur', tau: 0.03, k: 0.03, sdf: fur(cone(v3.add(top, [s * 0.03, 0.05, 0]), knee, 0.1, 0.045), 0.006), boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (top[1] + 0.05 - y) / 0.12)); return [['leg' + l, t], ['body', 1 - t]]; } });
    P.push({ name: 'lo' + l, mat: 'pink', bone: 'low' + l, rigid: true, k: 0.015, sdf: U(0.015, cone(knee, foot, 0.035, 0.02), ellipsoid(v3.add(foot, [0, 0.01, 0.04]), [0.04, 0.02, 0.06]), ...[-1, 0, 1].map((k) => horn([v3.add(foot, [k * 0.025, 0, 0.08]), v3.add(foot, [k * 0.035, -0.015, 0.12])], 0.01))) }); });
  return { name: 'rat', voxel: 0.0075, tris: 6500, err: 0.002, bones, parts: P, decals: [],
    mats: { fur: { col: [0.3, 0.26, 0.22], col2: [0.18, 0.15, 0.13], freq2: 14, var: 0.28, freq: 90, gloss: 0.15, dirt: 0.6 }, pink: { col: [0.72, 0.5, 0.48], col2: [0.5, 0.33, 0.32], freq2: 20, var: 0.15, gloss: 0.4 },
      eye: { col: [1.4, 0.15, 0.1], em: 0.8, gloss: 0.9 }, tooth: { col: [0.85, 0.7, 0.3], gloss: 0.5 } } }; }
