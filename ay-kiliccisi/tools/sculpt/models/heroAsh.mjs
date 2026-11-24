// "Kül Zırh" overlay: the armour has been through the dragon's fire — charred spikes crown the helm, molten seams
// glow across breastplate, pauldrons, vambraces and greaves, and burnt tatters hang from the belt.
import { v3, sphere, cone, ellipsoid, horn, tube, U, Sub, I, shell, disp, fbm, noise, symX } from '../sdf.mjs';
import { setup, mirror } from './_heroSet.mjs';
export default function heroAsh(ALL) {
  const { P, L, C, slab, zcut, xcut, pFn, bones } = setup(ALL);
  const vein = (pts, r = 0.0042) => tube(pts, (t) => r * (1 - 0.35 * t));
  // crown of five charred spikes rising behind the helm horns
  const spikes = []; for (let i = -2; i <= 2; i++) { const a = i * 0.42, base = [Math.sin(a) * 0.1, 2.01 - Math.abs(i) * 0.02, -0.05 - Math.cos(a) * 0.06];
    spikes.push(horn([base, v3.add(base, [Math.sin(a) * 0.03, 0.07 - Math.abs(i) * 0.012, -0.04]), v3.add(base, [Math.sin(a) * 0.05, 0.15 - Math.abs(i) * 0.025, -0.07])], 0.022 - Math.abs(i) * 0.003, 0.003)); }
  C({ name: 'crown', mat: 'char', bone: 'Head', rigid: true, k: 0.012, sdf: disp(U(0.01, ...spikes, I(0.004, shell(ellipsoid([0, 1.96, -0.05], [0.12, 0.06, 0.12]), 0.01), slab(1.97, 2.01), zcut(-0.02, 1))), (x, y, z) => 0.003 * fbm(x * 80, y * 80, z * 80, 2), 0.004) });
  C({ name: 'crownEmber', mat: 'ember', bone: 'Head', rigid: true, k: 0, sdf: U(0, ...[-2, -1, 0, 1, 2].map((i) => { const a = i * 0.42; return sphere([Math.sin(a) * 0.1, 2.005 - Math.abs(i) * 0.02, -0.05 - Math.cos(a) * 0.06 + 0.012], 0.007); })) });
  // molten seams on the breastplate: a branching crack from the sternum outwards (sits just proud of the plate)
  const chest = symX(U(0, vein([[0.005, 1.62, 0.188], [0.03, 1.55, 0.198], [0.02, 1.48, 0.2], [0.05, 1.41, 0.19]], 0.0048),
    vein([[0.03, 1.55, 0.198], [0.09, 1.53, 0.188], [0.15, 1.5, 0.155]]), vein([[0.02, 1.48, 0.2], [0.08, 1.44, 0.19], [0.12, 1.38, 0.17]], 0.0038)));
  C({ name: 'seams', mat: 'ember', bone: 'UpperChest', rigid: true, k: 0, sdf: chest });
  // seams on pauldron domes, vambraces and greaves (radius just outside each plate)
  L({ name: 'pSeam', mat: 'ember', boneFn: pFn, rigid: true, k: 0, sdf: U(0, vein([[0.27, 1.79, 0.07], [0.3, 1.77, 0.02], [0.33, 1.76, -0.04], [0.36, 1.72, -0.09]]), vein([[0.3, 1.77, 0.02], [0.36, 1.73, 0.05]], 0.0034)) });
  L({ name: 'vSeam', mat: 'ember', bone: 'leftLowerArm', rigid: true, k: 0, sdf: vein([[0.565, 1.717, 0.012], [0.62, 1.714, -0.006], [0.67, 1.711, 0.01], [0.72, 1.708, -0.004]], 0.0036) });
  L({ name: 'gSeam', mat: 'ember', bone: 'leftLowerLeg', rigid: true, k: 0, sdf: U(0, vein([[0.08, 0.56, 0.089], [0.11, 0.48, 0.086], [0.09, 0.38, 0.082], [0.115, 0.27, 0.074]]), vein([[0.11, 0.48, 0.086], [0.15, 0.44, 0.068]], 0.0032)) });
  // burnt tatters: front and back strips from the belt, ragged hems, charred dark at the bottom
  const strip = (z, dir) => { const y0 = 1.11, y1 = 0.74; const hem = { d: (x, y, zz) => (y1 + 0.08 * Math.max(0, fbm(x * 14, 0.5, zz * 14 + z, 3)) + 0.04 * Math.max(0, noise(x * 40, 3.3, zz * 40))) - y, bb: [-1, y1, -1, 1, 2, 1] };
    return I(0.004, shell(disp(ellipsoid([0, 1.0, 0.0], [0.215, 0.4, 0.19]), (x, y) => 0.006 * Math.sin(x * 70) * Math.max(0, (1.05 - y) * 3), 0.008), 0.007), zcut(z, dir), hem, slab(0, y0), xcut(0.085, 1), xcut(-0.085, -1)); };
  const clothFn = (x, y) => { const d = Math.max(0, Math.min(1, (1.07 - y) / 0.25)), t = Math.max(0, Math.min(1, (x + 0.085) / 0.17)); return [['Hips', 1 - d * 0.6], ['leftUpperLeg', d * 0.6 * t], ['rightUpperLeg', d * 0.6 * (1 - t)]]; };
  C({ name: 'tatterF', mat: 'ashcloth', k: 0.006, tau: 0.03, sdf: strip(0.1, -1), boneFn: clothFn });
  C({ name: 'tatterB', mat: 'ashcloth', k: 0.006, tau: 0.03, sdf: strip(-0.1, 1), boneFn: clothFn });
  return {
    name: 'heroAsh', voxel: 0.005, tris: 5000, err: 0.005, bones, parts: mirror(P),
    mats: {
      char: { col: [0.09, 0.085, 0.085], col2: [0.22, 0.12, 0.07], freq2: 20, gloss: 0.25, metal: 0.3, var: 0.3, freq: 80, dirt: 0.6, tint: 0 },
      ember: { col: [1.0, 0.42, 0.12], em: 1, gloss: 0, tint: 0 },
      ashcloth: { col: [0.3, 0.28, 0.27], col2: [0.07, 0.06, 0.06], freq2: 6, var: 0.2, freq: 30, gloss: 0.08, dirt: 0.7, grad: [0.75, 1.1, [0.25, 0.22, 0.2]], tint: 0 },
    },
  };
}
