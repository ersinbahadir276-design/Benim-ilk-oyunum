// "Kurt Postlu Zırh" overlay: a whole wolf pelt over the shoulders — the wolf's head rides the left pauldron,
// the hide falls down the back over the cape, fang necklace on the breastplate, fur wraps on forearms and shins.
import { v3, rot, sphere, cone, ellipsoid, horn, tube, U, Sub, I, shell, disp, fbm, noise } from '../sdf.mjs';
import { setup, mirror, backFn } from './_heroSet.mjs';
export default function heroWolf(ALL) {
  const { B, P, L, C, slab, zcut, xcut, pFn, bones } = setup(ALL);
  const furD = (a, amp = 0.012) => disp(a, (x, y, z) => amp * fbm(x * 50, y * 14, z * 50, 3) + amp * 0.45 * noise(x * 160, y * 30, z * 160), amp * 1.6);
  const neck = cone([0, 1.6, 0.0], [0, 1.86, 0.03], 0.09, 0.085);
  // heavy pelt yoke across both shoulders (wider and higher than the base mantle)
  const yoke = I(0.01, shell(ellipsoid([0, 1.69, -0.02], [0.34, 0.13, 0.235]), 0.03), slab(1.6, 1.84));
  C({ name: 'yoke', mat: 'fur', tau: 0.03, k: 0.02, sdf: Sub(0.012, furD(yoke, 0.014), neck),
    boneFn: (x) => { const t = Math.max(0, Math.min(1, (Math.abs(x) - 0.16) / 0.12)), s = x > 0 ? 'left' : 'right'; return [['UpperChest', 1 - t * 0.7], [s + 'Shoulder', t * 0.3], [s + 'UpperArm', t * 0.4]]; } });
  // the hide down the back, ragged hem with two hind-leg flaps
  const y0 = 1.66, y1 = 1.02;
  const hem = { d: (x, y, z) => (y1 + 0.06 * Math.max(0, fbm(x * 11, 0.7, z * 11, 3)) + 0.05 * Math.max(0, noise(x * 30, 2.1, z * 30))) - y, bb: [-1, y1, -1, 1, 3, 1] };
  const hide = I(0.004, shell(cone([0, y0, 0.03], [0, y1, 0.07], 0.262, 0.345), 0.011), zcut(-0.11, 1), hem, slab(0, y0 + 0.02));
  const legs = U(0, ...[-1, 1].map((s) => I(0.004, shell(cone([0, y0, 0.03], [0, y1 - 0.16, 0.08], 0.262, 0.37), 0.011), zcut(-0.11, 1), slab(y1 - 0.16, y1 + 0.02), xcut(s * 0.2, -s), xcut(s * 0.31, s))));
  C({ name: 'hide', mat: 'fur', k: 0.01, tau: 0.03, sdf: furD(U(0.01, hide, legs), 0.009), boneFn: backFn(y0, y1 - 0.16) });
  // the wolf's head on the left shoulder, muzzle forward, ears up, fangs over the pauldron
  const hc = [0.29, 1.8, 0.04];
  const skull = U(0.03, ellipsoid(hc, [0.085, 0.07, 0.095]), cone(v3.add(hc, [0, -0.01, 0.06]), v3.add(hc, [0, -0.035, 0.2]), 0.055, 0.03), ellipsoid(v3.add(hc, [0, -0.045, 0.1]), [0.05, 0.03, 0.08]));
  const ears = U(0, ...[-1, 1].map((s) => horn([v3.add(hc, [s * 0.045, 0.05, -0.02]), v3.add(hc, [s * 0.06, 0.1, -0.03]), v3.add(hc, [s * 0.065, 0.135, -0.05])], 0.026, 0.004)));
  const sockets = U(0, ...[-1, 1].map((s) => sphere(v3.add(hc, [s * 0.042, 0.018, 0.08]), 0.017)));
  const head = Sub(0.006, furD(U(0.02, skull, ears), 0.008), sockets);
  C({ name: 'wolfHead', mat: 'fur', boneFn: pFn, rigid: true, k: 0.012, sdf: head });
  C({ name: 'wolfNose', mat: 'nose', boneFn: pFn, rigid: true, k: 0.004, sdf: ellipsoid(v3.add(hc, [0, -0.028, 0.205]), [0.022, 0.016, 0.014]) });
  C({ name: 'wolfEyes', mat: 'eye', boneFn: pFn, rigid: true, k: 0, sdf: U(0, ...[-1, 1].map((s) => sphere(v3.add(hc, [s * 0.042, 0.016, 0.074]), 0.011))) });
  const fangs = U(0, ...[-1, 1].map((s) => horn([v3.add(hc, [s * 0.026, -0.06, 0.17]), v3.add(hc, [s * 0.027, -0.09, 0.172])], 0.008, 0.002)));
  C({ name: 'wolfFangs', mat: 'tooth', boneFn: pFn, rigid: true, k: 0, sdf: fangs });
  // fang necklace across the breastplate
  const cord = tube([[-0.135, 1.645, 0.13], [-0.07, 1.585, 0.185], [0, 1.565, 0.2], [0.07, 1.585, 0.185], [0.135, 1.645, 0.13]], () => 0.0045);
  C({ name: 'cord', mat: 'leather', bone: 'UpperChest', rigid: true, k: 0, sdf: cord });
  const teeth = []; for (let i = -3; i <= 3; i++) { const x = i * 0.034, y = 1.567 + 0.0028 * i * i, z = 0.2 - 0.0016 * i * i; teeth.push(horn([[x, y, z + 0.004], [x * 1.05, y - 0.03, z + 0.012], [x * 1.08, y - 0.055 + Math.abs(i) * 0.004, z + 0.016]], 0.0095 - Math.abs(i) * 0.0009, 0.0015)); }
  C({ name: 'teeth', mat: 'tooth', bone: 'UpperChest', rigid: true, k: 0, sdf: U(0, ...teeth) });
  // fur wraps: forearm and shin
  L({ name: 'armFur', mat: 'fur', bone: 'leftLowerArm', k: 0.01, sdf: furD(I(0.006, shell(cone([0.55, 1.652, 0], [0.7, 1.652, 0], 0.083, 0.074), 0.016), xcut(0.56, -1), xcut(0.69, 1)), 0.007) });
  L({ name: 'armStrap', mat: 'leather', bone: 'leftLowerArm', rigid: true, k: 0, sdf: U(0, ...[0.59, 0.66].map((x) => I(0, shell(cone([x - 0.01, 1.652, 0], [x + 0.01, 1.652, 0], 0.088, 0.086), 0.006), xcut(x - 0.007, -1), xcut(x + 0.007, 1)))) });
  L({ name: 'shinFur', mat: 'fur', bone: 'leftLowerLeg', k: 0.01, sdf: furD(I(0.006, shell(cone([0.099, 0.585, 0.005], [0.099, 0.4, 0.008], 0.1, 0.088), 0.016), slab(0.4, 0.58)), 0.007) });
  return {
    name: 'heroWolf', voxel: 0.005, tris: 7000, err: 0.005, bones, parts: mirror(P),
    mats: {
      fur: { col: [0.34, 0.31, 0.28], col2: [0.13, 0.12, 0.11], freq: 42, freq2: 12, var: 0.34, gloss: 0.05, dirt: 0.55, tint: 0 },
      leather: { col: [0.22, 0.14, 0.085], gloss: 0.3, var: 0.2, freq: 45, dirt: 0.5, tint: 0 },
      tooth: { col: [0.86, 0.82, 0.7], gloss: 0.5, var: 0.1, freq: 60, dirt: 0.4, tint: 0 },
      nose: { col: [0.05, 0.045, 0.045], gloss: 0.7, tint: 0 },
      eye: { col: [0.9, 0.62, 0.2], em: 1, gloss: 0, tint: 0 },
    },
  };
}
