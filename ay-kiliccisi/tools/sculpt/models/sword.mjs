// The hero's greatsword in a canonical frame: blade along +z (1.5 m nominal), width along y, thickness along x.
// The game rescales blade length/width per item and tints the blade (material tint channel).
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, symX, fbm, noise } from '../sdf.mjs';
export default function sword() {
  const P = [], z0 = 0.15, L = 1.5, W = 0.068;
  const blade = I(0.002, { d: (x, y, z) => { const t = Math.max(0, Math.min(1, (z - z0) / (L - z0))), w = W * (t < 0.86 ? 1 - t * 0.18 : (1 - t) / 0.14 * 0.84), th = 0.016 * (1 - t * 0.4);
      return Math.max(Math.abs(y) - w, Math.abs(x) - th * (1 - Math.abs(y) / Math.max(w, 1e-4) * 0.7), z0 - z, z - L); }, bb: [-0.03, -0.08, z0, 0.03, 0.08, L] });
  const fuller = box([0, 0, 0.62], [0.02, 0.011, 0.42], null, 0.006);
  P.push({ name: 'blade', mat: 'steel', bone: 'hand', rigid: true, k: 0.003, sdf: Sub(0.003, blade, symX(move(fuller, [0.018, 0, 0])), symX(move(fuller, [-0.018, 0, 0]))) });
  P.push({ name: 'fuller', mat: 'fuller', bone: 'hand', rigid: true, k: 0.002, sdf: I(0.002, grow(blade, 0.0), box([0, 0, 0.62], [0.03, 0.009, 0.4], null, 0.004)) });
  P.push({ name: 'guard', mat: 'iron', bone: 'hand', rigid: true, k: 0.008, sdf: U(0.01, box([0, 0, 0.135], [0.026, 0.13, 0.022], null, 0.01), horn([[0, 0.12, 0.13], [0, 0.18, 0.11], [0, 0.22, 0.06]], 0.022, 0.006), horn([[0, -0.12, 0.13], [0, -0.18, 0.11], [0, -0.22, 0.06]], 0.022, 0.006), ellipsoid([0, 0, 0.17], [0.024, 0.045, 0.03])) });
  P.push({ name: 'gem', mat: 'gem', bone: 'hand', rigid: true, k: 0.002, sdf: symX(sphere([0.024, 0, 0.14], 0.012)) });
  P.push({ name: 'grip', mat: 'leather', bone: 'hand', rigid: true, k: 0.004, sdf: disp(cone([0, 0, -0.26], [0, 0, 0.12], 0.02, 0.021), (x, y, z) => 0.0025 * Math.abs(Math.sin(z * 95)), 0.003) });
  P.push({ name: 'pommel', mat: 'bronze', bone: 'hand', rigid: true, k: 0.008, sdf: U(0.006, ellipsoid([0, 0, -0.29], [0.034, 0.034, 0.03]), cone([0, 0, -0.32], [0, 0, -0.35], 0.016, 0.006)) });
  return { name: 'sword', voxel: 0.0024, tris: 3500, err: 0.0012, bones: ['hand'], parts: P,
    mats: { steel: { col: [0.5, 0.5, 0.53], gloss: 0.8, metal: 1, wear: 0.6, edge: [1, 1, 1.05], dirt: 0.35, var: 0.06, freq: 60, tint: 1 }, fuller: { col: [0.32, 0.32, 0.35], gloss: 0.7, metal: 1, tint: 1 },
      iron: { col: [0.14, 0.14, 0.16], gloss: 0.6, metal: 1, wear: 0.6, edge: [0.6, 0.6, 0.65], tint: 0 }, gem: { col: [1.3, 0.12, 0.08], gloss: 0.9, em: 0.5, tint: 0 },
      leather: { col: [0.22, 0.14, 0.08], gloss: 0.3, var: 0.2, freq: 60, tint: 0 }, bronze: { col: [0.45, 0.33, 0.15], gloss: 0.75, metal: 1, wear: 0.5, edge: [1, 0.85, 0.5], tint: 0 } } };
}
import { move } from '../sdf.mjs';
