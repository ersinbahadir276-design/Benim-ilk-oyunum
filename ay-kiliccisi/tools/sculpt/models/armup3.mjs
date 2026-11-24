// Forge upgrade +3 «Usta İşi»: Hask the smith inlays the plate. The engraved grooves on the breastplate are filled with
// silver, a row of silver bosses runs over each pauldron dome, and twisted silver bands ring the vambraces and greaves.
// Shown on top of whatever armour is worn (the base plate is the same under every armour type), from +3 upward.
import { v3, rot, sphere, tube, torus, U, symX } from '../sdf.mjs';
import { base, mirror } from './_armor.mjs';

// a twisted band: a torus whose cross-section wobbles, so it reads as a rope of silver rather than a plain ring
export function rope(c, R, r, Rm, n = 14) {
  const t = torus(c, R, r, Rm), w = torus(c, R, r * 0.55, Rm);
  return { d: (x, y, z) => { const p = [x - c[0], y - c[1], z - c[2]], q = Rm ? [Rm[0] * p[0] + Rm[3] * p[1] + Rm[6] * p[2], Rm[1] * p[0] + Rm[4] * p[1] + Rm[7] * p[2], Rm[2] * p[0] + Rm[5] * p[1] + Rm[8] * p[2]] : p;
      const a = Math.atan2(q[2], q[0]), k = 0.5 + 0.5 * Math.cos(a * n * 2 + Math.atan2(q[1], Math.hypot(q[0], q[2]) - R) * 2);
      return t.d(x, y, z) * k + w.d(x, y, z) * (1 - k); }, bb: t.bb };
}

export default function armup3(ALL) {
  const { B, bones, onto, pFn } = base(ALL), P = [];
  const L = (p) => { p.side = 1; P.push(p); return p; }, C = (p) => { P.push(p); return p; };

  // ---- silver inlay in the breastplate engraving (same paths as hero.mjs `engr`, a hair thinner so it sits in the groove)
  C({ name: 'inlay', mat: 'silver', bone: 'UpperChest', rigid: true, k: 0.002, sdf: U(0, symX(tube([[0.02, 1.62, 0.2], [0.11, 1.52, 0.17], [0.15, 1.4, 0.13]], () => 0.0047, 0.002)),
    symX(tube([[0.05, 1.36, 0.19], [0.13, 1.33, 0.15]], () => 0.0043, 0.002))) });

  // ---- five silver bosses over the pauldron dome, each landed on the plate by marching toward the shoulder
  const ctr = [0.27, 1.66, 0], studs = [];
  for (const s of [-0.62, -0.31, 0, 0.31, 0.62]) { const d = v3.norm([0.5, 0.85, s]), p = onto('pauldron', v3.add(ctr, v3.mul(d, 0.45)), v3.mul(d, -1), 0);
    studs.push(sphere(p, 0.0115)); }
  L({ name: 'studs', mat: 'silver', boneFn: pFn, rigid: true, k: 0.001, sdf: U(0, ...studs) });

  // ---- twisted bands: vambrace (outer radius of the shell at that x, minus a hair so the rope is half sunk)
  const vR = (x) => 0.066 - (x - 0.55) / 0.185 * 0.01 + 0.0095 - 0.0015;
  L({ name: 'armRope', mat: 'silver', bone: 'leftLowerArm', rigid: true, k: 0.002, sdf: U(0, rope([0.6, 1.652, 0], vR(0.6), 0.0045, rot.z(Math.PI / 2)), rope([0.69, 1.652, 0], vR(0.69), 0.0045, rot.z(Math.PI / 2))) });
  const gR = (y) => { const t = (0.58 - y) / 0.43; return [0.083 - t * 0.018 + 0.011 - 0.0015, 0.005 + t * 0.005]; };
  L({ name: 'legRope', mat: 'silver', bone: 'leftLowerLeg', rigid: true, k: 0.002, sdf: U(0, ...[0.45, 0.25].map((y) => { const [R, z] = gR(y); return rope([0.099, y, z], R, 0.005); })) });

  mirror(P);
  return {
    name: 'armup3', voxel: 0.003, tris: 3500, err: 0.002, bones, parts: P,
    mats: { silver: { col: [0.72, 0.74, 0.8], gloss: 0.9, metal: 1, wear: 0.25, edge: [0.95, 0.96, 1.0], var: 0.05, freq: 40, dirt: 0.25, tint: 0 } },
  };
}
