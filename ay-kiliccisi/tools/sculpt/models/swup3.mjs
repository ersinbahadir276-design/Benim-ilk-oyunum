// Greatsword forge upgrade +3 «Usta İşi»: Hask inlays a line of silver runes down both faces of the fuller,
// binds the grip with twisted silver wire and caps it with two silver collars. Shown on any sword from +3 up.
import { cone, torus, U, symX, rot } from '../sdf.mjs';
import { runeStrokes } from './_swordup.mjs';

export default function swup3() {
  const P = [];
  const runes = U(0.0015, ...runeStrokes(0.0009).map(([a, b]) => cone(a, b, 0.0024, 0.0024)));
  P.push({ name: 'runes', mat: 'silver', bone: 'hand', rigid: true, k: 0.001, sdf: symX(runes) });
  // grip wire: a double helix over the leather (grip radius ≈ 0.0205), half sunk so it reads as a wrap, not a coil spring
  const wire = [];
  for (const ph of [0, Math.PI]) { const n = 72, pts = [];
    for (let i = 0; i <= n; i++) { const z = -0.245 + (0.35 * i) / n, a = ph + (z + 0.245) * 2 * Math.PI * 7 / 0.35; pts.push([Math.cos(a) * 0.0212, Math.sin(a) * 0.0212, z]); }
    for (let i = 0; i < n; i++) wire.push(cone(pts[i], pts[i + 1], 0.0021, 0.0021)); }
  P.push({ name: 'wire', mat: 'silver', bone: 'hand', rigid: true, k: 0.001, sdf: U(0.0005, ...wire) });
  // collars at both ends of the grip (torus axis turned onto the grip's z axis)
  P.push({ name: 'collars', mat: 'silver', bone: 'hand', rigid: true, k: 0.002, sdf: U(0.001, torus([0, 0, 0.108], 0.0225, 0.0042, rot.x(Math.PI / 2)), torus([0, 0, -0.252], 0.023, 0.0045, rot.x(Math.PI / 2))) });
  return { name: 'swup3', voxel: 0.0011, tris: 5000, err: 0.0006, bones: ['hand'], parts: P,
    mats: { silver: { col: [0.78, 0.8, 0.86], gloss: 0.92, metal: 1, wear: 0.2, edge: [1, 1, 1.05], var: 0.04, freq: 60, dirt: 0.2, tint: 0 } } };
}
