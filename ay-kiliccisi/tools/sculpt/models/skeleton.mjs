// Skeleton warrior: bare bones, a rib cage, glowing sockets, a tattered loincloth and a notched sword.
import { humanoid, mats } from '../lib/humanoid.mjs';
import { v3, cone, ellipsoid, box, plane, U, I, shell, disp, symX, fbm, noise } from '../sdf.mjs';
export const bones = (c) => { const ch = c.chestR, y = 0.06 + c.T * 0.72;
  c.add({ name: 'ribs', mat: 'skin', bone: 'spine', rigid: true, k: 0.004, sdf: U(0, ...[0, 1, 2, 3].map((i) => I(0.004, shell(ellipsoid([0, y - 0.02, 0.0], [ch[0] * 1.9, ch[1] * 1.15, ch[2] * 1.9]), 0.009), plane([0, y + 0.1 - i * 0.065, 0], [0, 1, 0.25]), plane([0, y + 0.075 - i * 0.065, 0], [0, -1, -0.25])))) });
  c.add({ name: 'pelvisBone', mat: 'skin', bone: 'root', rigid: true, k: 0.01, sdf: symX(ellipsoid([0.07, 0.0, 0], [0.085, 0.07, 0.06])) });
  c.add({ name: 'rag', mat: 'c1', tau: 0.03, k: 0.006, sdf: I(0.004, shell(disp(cone([0, 0.04, 0], [0, -0.3, 0.02], 0.1, 0.17), (x, yy, z) => 0.012 * fbm(x * 20, yy * 5, z * 20, 2), 0.014), 0.006), plane([0, 0.04, 0], [0, 1, 0]), { d: (x, yy, z) => -0.26 - 0.06 * noise(x * 30, 0, z * 30) - yy, bb: [-2, -2, -2, 2, 2, 2] }),
    boneFn: (x, yy) => { const d = Math.max(0, Math.min(1, -yy / 0.3)), t = Math.max(0, Math.min(1, (x + 0.08) / 0.16)); return [['root', 1 - d * 0.6], ['lHip', d * 0.6 * t], ['rHip', d * 0.6 * (1 - t)]]; } }); };
export const rustySword = (c) => { const R = 8; c.add({ name: 'grip', mat: 'leather', bone: 'rWr', rigid: true, k: 0.003, sdf: cone(c.at(R, [0, -0.06, -0.08]), c.at(R, [0, -0.06, 0.07]), 0.016, 0.015) });
  c.add({ name: 'blade', mat: 'steel', bone: 'rWr', rigid: true, k: 0.003, sdf: U(0.004, I(0.002, ellipsoid(c.at(R, [0, -0.06, 0.5]), [0.036, 0.009, 0.44], c.WR[R]), plane(c.at(R, [0, -0.06, 0.08]), v3.norm([-c.WR[R][2], -c.WR[R][5], -c.WR[R][8]]))), box(c.at(R, [0, -0.06, 0.08]), [0.08, 0.014, 0.012], c.WR[R], 0.005)) }); };
export const skMats = (cloth) => mats({ skin: [0.82, 0.79, 0.68], c1: cloth, c2: cloth, hair: [0.2, 0.2, 0.2], extra: { glow: { col: [0.4, 1.3, 1.1], em: 1 }, steel: { col: [0.36, 0.33, 0.3], gloss: 0.55, metal: 1, wear: 0.5, edge: [0.8, 0.75, 0.7], dirt: 0.6 } } });
export default (ALL) => { const m = humanoid(ALL, 'villager', { hr: 0.1, skull: true, limb: 0.42, torso: 0.5, tunic: false, noBelt: true, cuffs: false, torsoMat: 'skin', armMat: 'skin', legMat: 'skin', pelvisMat: 'skin', bootMat: 'skin', tris: 6500, voxel: 0.0052,
  extras: [bones, rustySword], mats: skMats([0.3, 0.2, 0.16]) }); m.name = 'skeleton'; return m; };
