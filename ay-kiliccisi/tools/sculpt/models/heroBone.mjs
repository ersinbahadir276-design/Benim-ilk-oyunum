// "Kemik Zırh" overlay: trophies of the hunt lashed over the black plate — a ribcage over the breastplate,
// beast skulls capping both pauldrons, a jawbone on the belt and bone spurs along the forearms.
import { v3, sphere, cone, ellipsoid, horn, tube, box, U, Sub, I, shell, disp, fbm, noise, symX } from '../sdf.mjs';
import { setup, mirror } from './_heroSet.mjs';
export default function heroBone(ALL) {
  const { P, L, C, slab, zcut, xcut, pFn, bones } = setup(ALL);
  const pit = (a, amp = 0.0025) => disp(a, (x, y, z) => amp * fbm(x * 90, y * 90, z * 90, 2), amp * 1.5);
  // ribcage: sternum + four ribs a side, hugging the breastplate (front surface z≈0.18–0.2)
  const sternum = tube([[0, 1.63, 0.19], [0, 1.52, 0.215], [0, 1.4, 0.212]], (t) => 0.014 - t * 0.004);
  const ribs = []; for (let i = 0; i < 4; i++) { const y = 1.6 - i * 0.055, w = 1 - i * 0.04;
    ribs.push(tube([[0.01, y, 0.214], [0.08 * w, y - 0.012, 0.205], [0.15 * w, y - 0.035, 0.168], [0.2 * w, y - 0.065, 0.1]], (t) => 0.0105 - t * 0.0045)); }
  C({ name: 'ribs', mat: 'bone', bone: 'UpperChest', rigid: true, k: 0.008, sdf: pit(U(0.008, sternum, symX(U(0, ...ribs)))) });
  C({ name: 'ribLashing', mat: 'leather', bone: 'UpperChest', rigid: true, k: 0, sdf: U(0, ...[1.58, 1.47].map((y) => box([0, y, 0.215], [0.022, 0.006, 0.012], null, 0.004))) });
  // beast skull on each pauldron: cranium, brow ridge, eye sockets, snout pointing out along the arm, two horns
  const sc = [0.3, 1.775, 0.0];
  const cran = U(0.025, ellipsoid(sc, [0.075, 0.06, 0.08]), cone(v3.add(sc, [0.05, -0.01, 0]), v3.add(sc, [0.15, -0.035, 0]), 0.05, 0.026));
  const brow = cone(v3.add(sc, [0.03, 0.025, -0.05]), v3.add(sc, [0.03, 0.025, 0.05]), 0.017, 0.017);
  const sockets = U(0, ...[-1, 1].map((s) => sphere(v3.add(sc, [0.05, 0.008, s * 0.052]), 0.022)));
  const nasal = U(0, ...[-1, 1].map((s) => ellipsoid(v3.add(sc, [0.15, -0.025, s * 0.01]), [0.012, 0.01, 0.006])));
  L({ name: 'skull', mat: 'bone', boneFn: pFn, rigid: true, k: 0.01, sdf: pit(Sub(0.006, U(0.012, cran, brow), sockets, nasal)) });
  L({ name: 'skullDark', mat: 'socket', boneFn: pFn, rigid: true, k: 0, sdf: U(0, ...[-1, 1].map((s) => sphere(v3.add(sc, [0.038, 0.008, s * 0.05]), 0.016))) });
  const sh = (s) => horn([v3.add(sc, [-0.01, 0.04, s * 0.045]), v3.add(sc, [-0.05, 0.1, s * 0.08]), v3.add(sc, [-0.03, 0.17, s * 0.1]), v3.add(sc, [0.02, 0.2, s * 0.09])], 0.02, 0.003);
  L({ name: 'skullHorns', mat: 'horn', boneFn: pFn, rigid: true, k: 0.008, sdf: disp(U(0, sh(-1), sh(1)), (x, y, z) => 0.002 * Math.sin((y - sc[1]) * 160), 0.0025) });
  const teeth = []; for (let i = 0; i < 4; i++) for (const s of [-1, 1]) teeth.push(horn([v3.add(sc, [0.09 + i * 0.018, -0.05, s * (0.022 - i * 0.003)]), v3.add(sc, [0.092 + i * 0.018, -0.072, s * (0.022 - i * 0.003)])], 0.0065, 0.0015));
  L({ name: 'skullTeeth', mat: 'bone', boneFn: pFn, rigid: true, k: 0, sdf: U(0, ...teeth) });
  // bone spurs along the top of each forearm
  L({ name: 'spurs', mat: 'bone', bone: 'leftLowerArm', rigid: true, k: 0.004, sdf: pit(U(0.004, ...[0.57, 0.62, 0.67].map((x, i) => horn([[x, 1.705, -0.005], [x - 0.02, 1.745 - i * 0.006, -0.012], [x - 0.05, 1.77 - i * 0.008, -0.02]], 0.016 - i * 0.002, 0.002)))) });
  // knee caps: a split jaw strapped to each poleyn
  L({ name: 'kneeJaw', mat: 'bone', boneFn: () => [['leftLowerLeg', 0.55], ['leftUpperLeg', 0.45]], rigid: true, k: 0.006, sdf: pit(I(0.004, shell(ellipsoid([0.099, 0.665, 0.055], [0.06, 0.05, 0.06]), 0.008), zcut(0.085, -1), slab(0.62, 0.72))) });
  // jawbone over the belt buckle
  const jaw = I(0.004, shell(ellipsoid([0, 1.085, 0.13], [0.085, 0.03, 0.08]), 0.011), zcut(0.17, -1));
  const jt = []; for (let i = -3; i <= 3; i++) { const x = i * 0.021, z = 0.2 - 0.0025 * i * i; jt.push(horn([[x, 1.095, z], [x, 1.13, z + 0.003]], 0.0075, 0.0015)); }
  C({ name: 'jaw', mat: 'bone', bone: 'Hips', rigid: true, k: 0.004, sdf: pit(U(0.003, jaw, ...jt)) });
  return {
    name: 'heroBone', voxel: 0.005, tris: 6000, err: 0.005, bones, parts: mirror(P),
    mats: {
      bone: { col: [0.74, 0.69, 0.58], col2: [0.5, 0.45, 0.36], freq2: 18, gloss: 0.32, var: 0.18, freq: 70, dirt: 0.75, tint: 0 },
      horn: { col: [0.3, 0.26, 0.22], col2: [0.58, 0.52, 0.42], freq2: 9, var: 0.18, freq: 60, gloss: 0.45, dirt: 0.5, tint: 0 },
      socket: { col: [0.05, 0.035, 0.03], gloss: 0.05, tint: 0 },
      leather: { col: [0.22, 0.14, 0.085], gloss: 0.3, var: 0.2, freq: 45, dirt: 0.5, tint: 0 },
    },
  };
}
