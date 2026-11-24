// Greatsword forge upgrade +5 «Ay İşçiliği» (drawn together with swup3): two hair-thin rails of moonlight frame the
// silver runes down the fuller, a gilded crescent cradles the guard's gem on both faces, and the pommel carries a
// glowing moonstone in a gold bezel on each side. Moon parts use the glow channel; the game lights this overlay
// with the same pale moonlight as the armour's +5 trim.
import { v3, cone, ellipsoid, torus, plane, U, I, Sub, symX, rot } from '../sdf.mjs';
import { onFace } from './_swordup.mjs';

export default function swup5() {
  const P = [];
  // moonlight rails at the fuller's edges (y = ±0.0105), from just above the guard to near the tip of the runes
  const rail = (y) => { const pts = []; for (let i = 0; i <= 16; i++) pts.push(onFace(y, 0.235 + (0.735 * i) / 16, 0.0006));
    return U(0.0005, ...pts.slice(1).map((p, i) => cone(pts[i], p, 0.0016, 0.0016))); };
  P.push({ name: 'rails', mat: 'moon', bone: 'hand', rigid: true, k: 0.001, sdf: symX(U(0.001, rail(0.0105), rail(-0.0105))) });
  // gilded crescent around the guard gem (gem: sphere at x = ±0.024, z = 0.14, r = 0.012); horns point up the blade
  const c = [0.024, 0, 0.143], n = [1, 0, 0], up = [0, 0, 1], r = 0.027;
  // flat disc facing +x (cone() has round caps, so it would make a ball): cylinder of radius rr, x from p+t0 to p+t1
  const disc = (p, rr, t0, t1) => ({ d: (x, y, z) => Math.max(Math.hypot(y - p[1], z - p[2]) - rr, p[0] + t0 - x, x - p[0] - t1),
    bb: [p[0] + t0, p[1] - rr, p[2] - rr, p[0] + t1, p[1] + rr, p[2] + rr] });
  const cres = Sub(0.001, disc(c, r, -0.002, 0.009), disc(v3.add(c, v3.mul(up, r * 0.3)), r * 0.86, -0.01, 0.02));
  P.push({ name: 'crescent', mat: 'gold', bone: 'hand', rigid: true, k: 0.001, sdf: symX(cres) });
  // pommel moonstones (pommel: ellipsoid at z = -0.29, r = 0.034) set in gold bezels on both faces, gold finial below
  // (clipped at the pommel's underside so its round top doesn't leave a hidden surface inside the pommel)
  const pz = -0.29;
  P.push({ name: 'bezel', mat: 'gold', bone: 'hand', rigid: true, k: 0.001, sdf: symX(torus([0.03, 0, pz], 0.017, 0.0038, rot.z(Math.PI / 2))) });
  P.push({ name: 'stone', mat: 'moon', bone: 'hand', rigid: true, k: 0.001, sdf: symX(I(0.001, ellipsoid([0.031, 0, pz], [0.009, 0.0155, 0.0155]), plane([0.0285, 0, 0], [-1, 0, 0]))) });
  P.push({ name: 'finial', mat: 'gold', bone: 'hand', rigid: true, k: 0.002, sdf: U(0.002, I(0.001, cone([0, 0, -0.318], [0, 0, -0.352], 0.019, 0.004), plane([0, 0, -0.316], [0, 0, 1])), torus([0, 0, -0.318], 0.017, 0.004, rot.x(Math.PI / 2))) });
  return { name: 'swup5', voxel: 0.0011, tris: 4000, err: 0.0006, bones: ['hand'], parts: P,
    mats: { gold: { col: [0.85, 0.62, 0.22], gloss: 0.9, metal: 1, wear: 0.3, edge: [1.0, 0.9, 0.6], var: 0.06, freq: 40, dirt: 0.3, tint: 0 },
      moon: { col: [0.62, 0.78, 1.0], em: 1, gloss: 0.6, tint: 0 } } };
}
