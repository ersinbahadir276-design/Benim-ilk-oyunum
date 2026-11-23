// «Kurt Postlu Zırh» overlay: grey wolf pelts thrown over the pauldrons with the forepaws' claws hanging in front,
// fur bracers and shin wraps tied with rawhide, a fang necklace across the breastplate and a wolf tail at the left hip.
import { v3, rot, sphere, cone, tube, ellipsoid, plane, horn, torus, U, Sub, I, shell, disp, fbm, noise } from '../sdf.mjs';
import { base, mirror } from './_armor.mjs';

export default function armwolf(ALL) {
  const { B, bones, onto, pFn } = base(ALL), P = [];
  const L = (p) => { p.side = 1; P.push(p); return p; }, C = (p) => { P.push(p); return p; };
  const furD = (a, s = 1) => disp(a, (x, y, z) => s * (0.012 * fbm(x * 60, y * 18, z * 60, 3) + 0.005 * noise(x * 190, y * 40, z * 190)), 0.02 * s);

  // ---- pelt over each pauldron: a thick fur pad that follows the dome, ragged lower edge
  const shJ = [0.235, 1.665, 0], tilt = rot.z(-0.45);
  const pad = ellipsoid(v3.add(shJ, [0.05, 0.035, 0]), [0.165, 0.12, 0.175], tilt);
  const rag = { d: (x, y, z) => (1.64 + 0.035 * fbm(x * 14, z * 14, 0.5, 2) + 0.02 * noise(x * 40, 2.1, z * 40)) - y, bb: [-1, 1.55, -1, 1, 3, 1] };
  L({ name: 'pelt', mat: 'fur', boneFn: pFn, rigid: true, k: 0.01, sdf: furD(I(0.01, shell(pad, 0.018), rag, plane([0.14, 0, 0], [-1, 0, 0]))) });
  // the paws: two strips of hide falling over the front and back of the arm, each ending in claws
  for (const zs of [1, -1]) {
    const top = [0.31, 1.74, zs * 0.12], mid = [0.34, 1.64, zs * 0.15], end = [0.35, 1.55, zs * 0.155];
    L({ name: 'paw' + (zs > 0 ? 'F' : 'B'), mat: 'fur', boneFn: pFn, rigid: true, k: 0.008, sdf: furD(U(0.02, tube([top, mid, end], (t) => 0.03 - t * 0.008), ellipsoid(end, [0.03, 0.026, 0.022])), 0.6) });
    L({ name: 'claws' + (zs > 0 ? 'F' : 'B'), mat: 'claw', boneFn: pFn, rigid: true, k: 0.002, sdf: U(0, ...[-1, 0, 1].map((i) => { const o = v3.add(end, [i * 0.016, -0.018, zs * 0.012]);
      return horn([o, v3.add(o, [i * 0.004, -0.022, zs * 0.008]), v3.add(o, [i * 0.006, -0.036, zs * 0.0]) ], 0.0065, 0.0012); })) });
  }

  // ---- fur bracers (over the vambrace) with two rawhide ties
  L({ name: 'bracer', mat: 'fur', bone: 'leftLowerArm', rigid: true, k: 0.01, sdf: furD(I(0.008, cone([0.575, 1.652, 0], [0.7, 1.652, 0], 0.09, 0.082), plane([0.58, 0, 0], [-1, 0, 0]), plane([0.695, 0, 0], [1, 0, 0])), 0.8) });
  L({ name: 'bracerTies', mat: 'hide', bone: 'leftLowerArm', rigid: true, k: 0.002, sdf: U(0, torus([0.6, 1.652, 0], 0.097, 0.006, rot.z(Math.PI / 2)), torus([0.672, 1.652, 0], 0.092, 0.006, rot.z(Math.PI / 2))) });

  // ---- shin wraps over the greaves
  L({ name: 'shinFur', mat: 'fur', bone: 'leftLowerLeg', rigid: true, k: 0.01, sdf: furD(I(0.008, cone([0.099, 0.53, 0.008], [0.099, 0.27, 0.01], 0.102, 0.09), plane([0, 0.53, 0], [0, 1, 0]), plane([0, 0.27, 0], [0, -1, 0])), 0.8) });
  L({ name: 'shinTies', mat: 'hide', bone: 'leftLowerLeg', rigid: true, k: 0.002, sdf: U(0, torus([0.099, 0.5, 0.008], 0.108, 0.007), torus([0.099, 0.4, 0.009], 0.104, 0.007), torus([0.099, 0.3, 0.01], 0.099, 0.007)) });

  // ---- fang necklace: a cord that lies on the breastplate under the fur mantle, five fangs hanging from it
  const cord = []; for (let i = 0; i <= 10; i++) { const a = -0.95 + 1.9 * i / 10, x = Math.sin(a) * 0.2, y = 1.6 - 0.075 * Math.cos(a);
    cord.push(onto('cuirass', [x, y, 0.45], [0, 0, -1], 0.006)); }
  C({ name: 'cord', mat: 'hide', bone: 'UpperChest', rigid: true, k: 0.002, sdf: tube(cord, () => 0.0045, 0.003) });
  C({ name: 'fangs', mat: 'claw', bone: 'UpperChest', rigid: true, k: 0.002, sdf: U(0, ...[2, 4, 5, 6, 8].map((i) => { const o = cord[i], len = i === 5 ? 0.095 : 0.065;
    return horn([o, v3.add(o, [0, -len * 0.5, 0.012]), v3.add(o, [0, -len, 0.004])], i === 5 ? 0.015 : 0.012, 0.0015); })) });

  // ---- wolf tail on the left hip, tied to the belt
  const tail = [[0.2, 1.1, -0.07], [0.245, 1.0, -0.09], [0.26, 0.86, -0.085], [0.25, 0.72, -0.06], [0.235, 0.62, -0.04]];
  C({ name: 'tail', mat: 'fur', tau: 0.05, k: 0.01, sdf: furD(tube(tail, (t) => 0.026 + 0.03 * Math.sin(Math.min(1, t * 1.25) * Math.PI) * (1 - t * 0.4), 0.02), 1.1),
    boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (1.08 - y) / 0.4)); return [['Hips', 1 - t * 0.55], ['leftUpperLeg', t * 0.55]]; } });
  C({ name: 'tailTie', mat: 'hide', bone: 'Hips', rigid: true, k: 0.002, sdf: torus([0.2, 1.09, -0.07], 0.03, 0.007, rot.x(0.3)) });

  mirror(P);
  return {
    name: 'armwolf', voxel: 0.005, tris: 6000, err: 0.005, bones, parts: P,
    mats: {
      fur: { col: [0.42, 0.4, 0.37], col2: [0.16, 0.15, 0.14], freq: 50, freq2: 11, var: 0.35, gloss: 0.05, dirt: 0.6, tint: 0 },
      hide: { col: [0.36, 0.25, 0.16], gloss: 0.25, var: 0.2, freq: 60, dirt: 0.5, tint: 0 },
      claw: { col: [0.78, 0.74, 0.64], col2: [0.42, 0.38, 0.3], freq2: 25, gloss: 0.5, var: 0.1, dirt: 0.6, tint: 0 },
    },
  };
}
