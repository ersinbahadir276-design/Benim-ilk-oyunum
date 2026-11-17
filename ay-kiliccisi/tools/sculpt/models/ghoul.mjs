// Ghoul (Hortlak): a starved corpse, skin stretched over a skull, hunched, long arms ending in black claws, burial rags.
import { humanoid, mats } from '../lib/humanoid.mjs';
import { v3, cone, horn, ellipsoid, plane, U, I, shell, disp, symX, fbm, noise } from '../sdf.mjs';
const claws = (c) => { for (const [W, s] of [[5, 1], [8, -1]]) { const cl = [];
  for (const k of [-1, 0, 1]) { const a = c.at(W, [k * 0.022, -0.07, 0.02]); cl.push(horn([a, c.at(W, [k * 0.03, -0.15, 0.05]), c.at(W, [k * 0.032, -0.21, 0.1])], 0.012, 0.002)); }
  c.add({ name: 'claws' + s, mat: 'claw', bone: c.N(W), rigid: true, k: 0.004, sdf: U(0.004, ...cl) }); }
  const y = 0.06 + c.T * 0.72, ch = c.chestR;
  c.add({ name: 'ribsSkin', mat: 'skin', bone: 'spine', rigid: true, k: 0.004, sdf: U(0, ...[0, 1, 2].map((i) => I(0.004, shell(ellipsoid([0, y - 0.02, 0.006], [ch[0] * 1.05, ch[1] * 1.05, ch[2] * 1.12]), 0.006), plane([0, y + 0.02 - i * 0.06, 0], [0, 1, 0.3]), plane([0, y - 0.005 - i * 0.06, 0], [0, -1, -0.3]), plane([0, 0, 0.02], [0, 0, -1])))) });
  c.add({ name: 'rags', mat: 'c1', tau: 0.03, k: 0.006, sdf: I(0.004, shell(disp(cone([0, 0.05, 0], [0, -0.36, 0.02], 0.11, 0.2), (x, yy, z) => 0.016 * fbm(x * 18, yy * 4, z * 18, 2), 0.02), 0.006), plane([0, 0.05, 0], [0, 1, 0]), { d: (x, yy, z) => -0.3 - 0.1 * noise(x * 26, 0, z * 26) - yy, bb: [-1, -1, -1, 1, 1, 1] }),
    boneFn: (x, yy) => { const d = Math.max(0, Math.min(1, -yy / 0.34)), t = Math.max(0, Math.min(1, (x + 0.08) / 0.16)); return [['root', 1 - d * 0.6], ['lHip', d * 0.6 * t], ['rHip', d * 0.6 * (1 - t)]]; } }); };
export default (ALL) => { const M = mats({ skin: [0.46, 0.5, 0.42], c1: [0.24, 0.21, 0.17], c2: [0.2, 0.18, 0.15], hair: [0.12, 0.12, 0.1], extra: { glow: { col: [0.7, 1.4, 0.3], em: 1 }, claw: { col: [0.08, 0.07, 0.06], gloss: 0.6 } } });
  M.skin = { col: [0.46, 0.5, 0.42], col2: [0.33, 0.36, 0.32], freq2: 9, var: 0.22, freq: 40, gloss: 0.3, dirt: 0.7 };
  const m = humanoid(ALL, 'villager', { hr: 0.1, skull: true, limb: 0.62, torso: 0.66, tunic: false, noBelt: true, cuffs: false, torsoMat: 'skin', armMat: 'skin', legMat: 'skin', pelvisMat: 'c1', bootMat: 'skin', tris: 6500, voxel: 0.0052, extras: [claws], mats: M });
  m.name = 'ghoul'; return m; };
