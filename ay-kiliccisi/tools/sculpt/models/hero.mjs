// Kael "Kara Zırh" — blackened plate with bronze trim, a beaked great helm with a burning T-slit and swept horns,
// wolf-fur mantle, layered pauldrons, mitten gauntlets and a tattered crimson cape. Built on the game's T-pose
// skeleton (proportions measured from berserk_armor's bones; every surface here is our own design).
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, mirrorX, symX, fbm, noise } from '../sdf.mjs';

export default function hero(ALL) {
  const SK = ALL.hero, B = {}; SK.bones.forEach((b) => { B[b.n] = b.r; });
  const bones = SK.bones.map((b) => b.n), P = [];
  const L = (part) => { part.side = 1; P.push(part); return part; }, C = (part) => { P.push(part); return part; };
  const slab = (y0, y1) => I(0, plane([0, y1, 0], [0, 1, 0]), plane([0, y0, 0], [0, -1, 0]));
  const zcut = (z0, dir) => plane([0, 0, z0], [0, 0, dir]); // dir=-1 keeps z>z0, dir=1 keeps z<z0
  const xcut = (x0, dir) => plane([x0, 0, 0], [dir, 0, 0]);
  const fingerW = (seg) => (x, y, z) => ['Index', 'Middle', 'Ring', 'Little'].map((f) => { const zf = B['left' + f + 'Proximal'][2]; return ['left' + f + seg, Math.exp(-Math.pow((z - zf) / 0.016, 2)) + 1e-4]; });

  // ------------------------------------------------------------ under-layer (only seen at the joints)
  C({ name: 'torso', mat: 'mail', bone: 'Chest', tau: 0.05, sdf: U(0.06, ellipsoid([0, 1.42, 0], [0.19, 0.27, 0.135]), ellipsoid([0, 1.57, 0], [0.23, 0.12, 0.145])) });
  C({ name: 'pelvis', mat: 'leather', bone: 'Hips', tau: 0.04, sdf: ellipsoid([0, 1.1, 0], [0.175, 0.13, 0.13]) });
  C({ name: 'neck', mat: 'leather', bone: 'Neck', sdf: cone([0, 1.64, 0], [0, 1.83, 0.01], 0.068, 0.062) });
  L({ name: 'uarm', mat: 'mail', bone: 'leftUpperArm', sdf: cone([0.19, 1.652, 0], B.leftLowerArm, 0.07, 0.056) });
  L({ name: 'farm', mat: 'leather', bone: 'leftLowerArm', sdf: cone(B.leftLowerArm, B.leftHand, 0.054, 0.044) });
  L({ name: 'thigh', mat: 'mail', bone: 'leftUpperLeg', tau: 0.035, sdf: cone([0.099, 1.08, 0], B.leftLowerLeg, 0.095, 0.068) });
  L({ name: 'shin', mat: 'leather', bone: 'leftLowerLeg', sdf: cone(B.leftLowerLeg, [0.099, 0.12, 0], 0.064, 0.05) });

  // ------------------------------------------------------------ cuirass: keeled breastplate (two-sphere lens), V-taper, back plate
  const lens = I(0.03, sphere([0.14, 1.47, -0.31], 0.52), sphere([-0.14, 1.47, -0.31], 0.52));
  const bodyE = ellipsoid([0, 1.48, -0.005], [0.27, 0.27, 0.2]);
  const taper = symX(plane([0.285, 1.66, 0], [0.36, -0.13, 0]));
  const neckHole = cone([0, 1.6, 0.02], [0, 1.9, 0.04], 0.098, 0.13), armHoles = symX(sphere([0.315, 1.645, 0], 0.1));
  const cuirSolid = I(0.012, lens, bodyE, taper, slab(1.3, 1.69));
  const engr = U(0, symX(tube([[0.02, 1.62, 0.2], [0.11, 1.52, 0.17], [0.15, 1.4, 0.13]], () => 0.0055)), symX(tube([[0.05, 1.36, 0.19], [0.13, 1.33, 0.15]], () => 0.005)));
  const cuirass = Sub(0.008, cuirSolid, neckHole, armHoles, engr);
  C({ name: 'cuirass', mat: 'plate', bone: 'UpperChest', rigid: true, k: 0.006, sdf: cuirass });
  C({ name: 'cuirRim', mat: 'trim', bone: 'UpperChest', rigid: true, k: 0.003, sdf: Sub(0.004, U(0, I(0.004, grow(cuirSolid, 0.006), slab(1.3, 1.322)), I(0.004, grow(cuirSolid, 0.006), shell(neckHole, 0.012))), neckHole, armHoles) });
  for (let i = 0; i < 3; i++) { const y1 = 1.315 - i * 0.05;
    C({ name: 'lame' + i, mat: 'plate', bone: i < 2 ? 'Spine' : 'Hips', rigid: true, k: 0.004, sdf: I(0.006, ellipsoid([0, 1.21, 0.005], [0.2 + i * 0.006, 0.23, 0.162 + i * 0.006]), slab(y1 - 0.056, y1)) }); }
  const beltE = ellipsoid([0, 1.13, 0.005], [0.212, 0.12, 0.172]);
  C({ name: 'belt', mat: 'leather', bone: 'Hips', rigid: true, k: 0.004, sdf: I(0.004, beltE, slab(1.103, 1.153)) });
  C({ name: 'buckle', mat: 'trim', bone: 'Hips', rigid: true, k: 0.003, sdf: Sub(0.003, box([0, 1.128, 0.178], [0.046, 0.034, 0.014], null, 0.008), box([0, 1.128, 0.19], [0.026, 0.015, 0.02], null, 0.004)) });
  C({ name: 'beltRivets', mat: 'rivet', bone: 'Hips', rigid: true, k: 0, sdf: U(0, ...[-1.25, -0.8, 0.8, 1.25, 2.2, 2.6, 3.0, 3.4, 3.8].map((a) => sphere([Math.sin(a) * 0.214, 1.128, 0.005 + Math.cos(a) * 0.174], 0.0085))) });
  // rear mail skirt and front tassets (three lames over each thigh)
  C({ name: 'skirt', mat: 'mail', tau: 0.05, sdf: I(0.006, shell(ellipsoid([0, 1.0, 0], [0.205, 0.22, 0.17]), 0.008), slab(0.93, 1.11), zcut(0.0, 1)),
    boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (x + 0.06) / 0.12)), d = Math.max(0, Math.min(1, (1.08 - y) / 0.15)); return [['Hips', 1 - d * 0.75], ['leftUpperLeg', d * 0.75 * t], ['rightUpperLeg', d * 0.75 * (1 - t)]]; } });
  for (let i = 0; i < 3; i++) { const y1 = 1.105 - i * 0.062, e = ellipsoid([0.1, 1.0, 0.02], [0.15 + i * 0.006, 0.3, 0.16 + i * 0.006]);
    L({ name: 'tasset' + i, mat: i === 2 ? 'trim' : 'plate', tau: 0.02, k: 0.004, sdf: I(0.005, shell(e, 0.007), slab(y1 - 0.07, y1), zcut(-0.02, -1), xcut(0.012, -1)), boneFn: () => [['leftUpperLeg', 0.55 + i * 0.15], ['Hips', 0.45 - i * 0.15]] }); }

  // ------------------------------------------------------------ the moon-sword's mark: keel ridge and a raised crescent on the breastplate
  const moonC = [0, 1.48, 0.0], moon = Sub(0.006, sphere(moonC, 0.075), sphere(v3.add(moonC, [0.032, 0.022, 0]), 0.064));
  const moonMark = I(0.003, grow(cuirSolid, 0.009), shell(cuirSolid, 0.02), { d: (x, y, z) => moon.d(x, y, 0), bb: [-0.09, 1.39, 0.1, 0.09, 1.57, 0.3] }, zcut(0.1, -1));
  C({ name: 'moonMark', mat: 'trim', bone: 'UpperChest', rigid: true, k: 0.003, sdf: moonMark });
  // crimson tabard hanging from the belt between the tassets, bronze-edged hem
  const tabY0 = 1.11, tabY1 = 0.6;
  const tabSurf = disp(ellipsoid([0, 0.98, 0.0], [0.2, 0.5, 0.222]), (x, y) => 0.004 * Math.sin(x * 70) * Math.max(0, (tabY0 - y) / 0.5), 0.005);
  const tabHem = (x) => tabY1 + 0.04 * Math.abs(x) / 0.12 + 0.012 * noise(x * 60, 0.5, 2.3);
  const tabard = I(0.004, shell(tabSurf, 0.006), symX(plane([0.062, 1.1, 0], [1, 0.1, 0])), { d: (x, y) => tabHem(x) - y, bb: [-1, tabY1, -1, 1, 3, 1] }, slab(0, tabY0), zcut(0.06, -1));
  const tabFn = (x, y) => { const d = Math.max(0, Math.min(1, (1.08 - y) / 0.3)), t = Math.max(0, Math.min(1, (x + 0.07) / 0.14)); return [['Hips', 1 - d * 0.8], ['leftUpperLeg', d * 0.8 * t + 1e-4], ['rightUpperLeg', d * 0.8 * (1 - t) + 1e-4]]; };
  C({ name: 'tabard', mat: 'cloth', tau: 0.03, k: 0.004, sdf: tabard, boneFn: tabFn });
  C({ name: 'tabardHem', mat: 'trim', tau: 0.03, k: 0.003, sdf: I(0.003, grow(tabard, 0.002), { d: (x, y) => y - tabHem(x) - 0.018, bb: [-1, 0, -1, 1, 3, 1] }), boneFn: tabFn });
  // leather pouch on the left hip with a bronze clasp
  L({ name: 'pouch', mat: 'leather', bone: 'Hips', rigid: true, k: 0.008, sdf: U(0.006, box([0.19, 1.07, 0.06], [0.026, 0.045, 0.034], rot.y(0.5), 0.012), I(0.004, box([0.19, 1.104, 0.06], [0.03, 0.014, 0.038], rot.y(0.5), 0.008), plane([0, 1.095, 0], [0, -1, 0.0]))) });
  L({ name: 'pouchClasp', mat: 'trim', bone: 'Hips', rigid: true, k: 0, sdf: sphere([0.19 + 0.033 * Math.sin(0.5), 1.09, 0.06 + 0.033 * Math.cos(0.5)], 0.008) });

  // ------------------------------------------------------------ gorget and wolf-fur mantle
  C({ name: 'gorget', mat: 'plate', tau: 0.03, k: 0.006, sdf: Sub(0.006, U(0.004, ...[0, 1].map((i) => I(0.004, shell(cone([0, 1.6, 0], [0, 1.79, 0.015], 0.125 - i * 0.022, 0.092 - i * 0.016), 0.007), slab(1.64 + i * 0.065, 1.7 + i * 0.065)))), cone([0, 1.6, 0.0], [0, 1.85, 0.03], 0.07, 0.066)),
    boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (y - 1.65) / 0.12)); return [['Neck', t], ['UpperChest', 1 - t]]; } });
  const tufts = [];
  for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, cx = Math.sin(a) * 0.2, cz = Math.cos(a) * 0.165 - 0.025, back = Math.cos(a) < 0.2;
    tufts.push(ellipsoid([cx, 1.695 + 0.012 * Math.sin(i * 2.7), cz], [0.07, 0.05, 0.07], rot.y(a)));
    if (back || Math.abs(Math.sin(a)) > 0.7) { const o = [Math.sin(a) * 0.255, 1.66, Math.cos(a) * 0.21 - 0.03]; tufts.push(horn([o, v3.add(o, [Math.sin(a) * 0.04, -0.07, Math.cos(a) * 0.04]), v3.add(o, [Math.sin(a) * 0.05, -0.14 - (i % 3) * 0.02, Math.cos(a) * 0.06])], 0.034, 0.006)); } }
  const fur = disp(U(0.03, ...tufts, ellipsoid([0, 1.6, -0.19], [0.26, 0.13, 0.065])), (x, y, z) => 0.011 * fbm(x * 55, y * 12, z * 55, 3) + 0.005 * noise(x * 170, y * 25, z * 170), 0.018);
  C({ name: 'fur', mat: 'fur', bone: 'UpperChest', tau: 0.012, k: 0.02, sdf: Sub(0.01, fur, cone([0, 1.6, 0.0], [0, 1.85, 0.03], 0.082, 0.078)) });

  // ------------------------------------------------------------ pauldrons
  const shJ = [0.235, 1.665, 0], tilt = rot.z(-0.45);
  const pd = (s, dy, dx) => ellipsoid(v3.add(shJ, [0.035 + dx, dy, 0]), [0.135 * s, 0.11 * s, 0.14 * s], tilt);
  const cutDome = plane(v3.add(shJ, [0, -0.03, 0]), [-0.45, -1, 0]);
  const dome = I(0.006, shell(pd(1, 0.025, 0), 0.011), cutDome, xcut(0.135, -1), zcut(0.115, 1));
  const lame1 = I(0.006, shell(pd(1.08, -0.035, 0.02), 0.01), slab(1.54, 1.645), xcut(0.17, -1));
  const lame2 = I(0.006, shell(pd(1.15, -0.095, 0.04), 0.01), slab(1.48, 1.58), xcut(0.2, -1));
  const pFn = () => [['leftUpperArm', 0.62], ['leftShoulder', 0.38]];
  L({ name: 'pauldron', mat: 'plate', boneFn: pFn, rigid: true, k: 0.004, sdf: U(0.004, dome, lame1, lame2) });
  L({ name: 'pauldronTrim', mat: 'trim', boneFn: pFn, rigid: true, k: 0.003, sdf: U(0, I(0.004, shell(pd(1.0, 0.025, 0), 0.015), cutDome, plane(v3.add(shJ, [0, -0.008, 0]), [0.45, 1, 0]), xcut(0.135, -1)),
    I(0.004, shell(pd(1.15, -0.095, 0.04), 0.014), slab(1.48, 1.495), xcut(0.2, -1))) });
  L({ name: 'pauldronSpikes', mat: 'plate', boneFn: pFn, rigid: true, k: 0.012, sdf: U(0.006, horn([[0.29, 1.76, -0.02], [0.33, 1.83, -0.05], [0.36, 1.9, -0.1]], 0.024), horn([[0.33, 1.73, 0.05], [0.38, 1.78, 0.07], [0.43, 1.82, 0.07]], 0.019)) });
  L({ name: 'pauldronRivets', mat: 'rivet', boneFn: pFn, rigid: true, k: 0, sdf: U(0, ...[0, 1, 2, 3, 4].map((i) => { const a = -1 + i * 0.5; return sphere(v3.add(shJ, [0.05 + 0.115 * Math.cos(a), 0.035, 0.12 * Math.sin(a)]), 0.0095); })) });

  // ------------------------------------------------------------ arms: rerebrace, couter + fan, vambrace, mitten gauntlet
  const el = B.leftLowerArm;
  L({ name: 'rerebrace', mat: 'plate', bone: 'leftUpperArm', rigid: true, k: 0.006, sdf: I(0.004, shell(cone([0.3, 1.652, 0], [0.47, 1.652, 0], 0.083, 0.073), 0.0095), xcut(0.31, -1), xcut(0.465, 1)) });
  L({ name: 'couter', mat: 'plate', boneFn: () => [['leftLowerArm', 0.5], ['leftUpperArm', 0.5]], rigid: true, k: 0.005, sdf: U(0.008,
    I(0.004, shell(ellipsoid(el, [0.068, 0.072, 0.075]), 0.0095), zcut(-0.028, 1)), I(0.004, shell(ellipsoid(v3.add(el, [0, 0, -0.062]), [0.07, 0.07, 0.028], rot.x(0.2)), 0.008), zcut(-0.062, 1)),
    horn([v3.add(el, [0, 0, -0.08]), v3.add(el, [0.015, 0.008, -0.115]), v3.add(el, [0.04, 0.015, -0.14])], 0.016)) });
  L({ name: 'vambrace', mat: 'plate', bone: 'leftLowerArm', rigid: true, k: 0.005, sdf: U(0.006, I(0.004, shell(cone([0.55, 1.652, 0], [0.735, 1.652, 0], 0.066, 0.056), 0.0095), xcut(0.56, -1), xcut(0.73, 1)),
    I(0.003, cone([0.58, 1.712, 0], [0.71, 1.704, 0], 0.011, 0.009), slab(1.695, 1.73))) });
  L({ name: 'cuff', mat: 'trim', bone: 'leftLowerArm', rigid: true, k: 0.004, sdf: I(0.004, shell(cone([0.705, 1.652, 0], [0.77, 1.652, 0], 0.06, 0.07), 0.0075), xcut(0.712, -1), xcut(0.765, 1)) });
  L({ name: 'palm', mat: 'leather', bone: 'leftHand', rigid: true, k: 0.01, sdf: box([0.81, 1.646, 0.0], [0.052, 0.023, 0.047], null, 0.016) });
  L({ name: 'handPlate', mat: 'plate', bone: 'leftHand', rigid: true, k: 0.005, sdf: U(0.006, I(0.004, shell(ellipsoid([0.8, 1.64, 0], [0.07, 0.046, 0.058]), 0.008), slab(1.656, 1.7)),
    cone([0.855, 1.672, 0.046], [0.855, 1.672, -0.046], 0.011, 0.011)) });
  const kx = [B.leftMiddleProximal[0], B.leftMiddleIntermediate[0], B.leftMiddleDistal[0], B.leftMiddleDistal[0] + 0.028];
  ['Proximal', 'Intermediate', 'Distal'].forEach((seg, s) => {
    L({ name: 'mitt' + seg, mat: 'plate', boneFn: fingerW(seg), rigid: false, tau: 0.004, k: 0.004, sdf: U(0.004, box([(kx[s] + kx[s + 1]) / 2, 1.648, -0.001], [(kx[s + 1] - kx[s]) / 2 + 0.002, 0.016 - s * 0.001, 0.046 - s * 0.002], null, 0.013),
      I(0.003, box([(kx[s] + kx[s + 1]) / 2 - 0.004, 1.652, -0.001], [(kx[s + 1] - kx[s]) / 2 + 0.003, 0.018, 0.048 - s * 0.002], null, 0.014), slab(1.655, 1.7))) }); });
  const th = ['Proximal', 'Intermediate', 'Distal'].map((s) => B['leftThumb' + s]), tt = v3.add(th[2], v3.mul(v3.norm(v3.sub(th[2], th[1])), 0.03));
  [[th[0], th[1], 'Proximal'], [th[1], th[2], 'Intermediate'], [th[2], tt, 'Distal']].forEach(([a, b, s]) => L({ name: 'thumb' + s, mat: 'plate', bone: 'leftThumb' + s, rigid: true, k: 0.004, sdf: cone(a, b, 0.016, 0.014) }));

  // ------------------------------------------------------------ legs
  const kn = B.leftLowerLeg, an = B.leftFoot, toe = B.leftToes;
  L({ name: 'cuisse', mat: 'plate', bone: 'leftUpperLeg', rigid: true, k: 0.006, sdf: U(0.004, I(0.005, shell(cone([0.099, 0.99, 0.005], [0.099, 0.71, 0.01], 0.112, 0.088), 0.0095), zcut(-0.035, -1), slab(0.71, 0.99)),
    I(0.003, cone([0.099, 0.97, 0.118], [0.099, 0.74, 0.096], 0.0095, 0.008), zcut(0.08, -1))) });
  L({ name: 'poleyn', mat: 'plate', boneFn: () => [['leftLowerLeg', 0.55], ['leftUpperLeg', 0.45]], rigid: true, k: 0.005, sdf: U(0.008,
    I(0.004, shell(ellipsoid(v3.add(kn, [0, 0, 0.03]), [0.077, 0.082, 0.072]), 0.0095), zcut(-0.01, -1)), I(0.004, shell(ellipsoid(v3.add(kn, [0.068, 0, 0.0]), [0.024, 0.072, 0.066]), 0.008), xcut(0.078, -1)),
    horn([v3.add(kn, [0, 0.0, 0.095]), v3.add(kn, [0, 0.02, 0.125]), v3.add(kn, [0, 0.045, 0.142])], 0.015)) });
  L({ name: 'greave', mat: 'plate', bone: 'leftLowerLeg', rigid: true, k: 0.006, sdf: U(0.006, I(0.004, shell(cone([0.099, 0.58, 0.005], [0.099, 0.15, 0.01], 0.08, 0.062), 0.0095), slab(0.15, 0.58)),
    I(0.003, cone([0.099, 0.57, 0.084], [0.099, 0.17, 0.068], 0.0105, 0.0085), zcut(0.06, -1))) });
  L({ name: 'greaveTrim', mat: 'trim', bone: 'leftLowerLeg', rigid: true, k: 0.003, sdf: I(0.003, shell(cone([0.099, 0.58, 0.005], [0.099, 0.15, 0.01], 0.083, 0.065), 0.011), slab(0.55, 0.568)) });
  const foot = U(0.03, ellipsoid([an[0], 0.075, 0.02], [0.063, 0.075, 0.105]), cone([an[0], 0.06, 0.05], [an[0], 0.04, toe[2] + 0.06], 0.058, 0.026));
  const footFn = (x, y, z) => { const t = Math.max(0, Math.min(1, (z - 0.08) / 0.06)); return [['leftFoot', 1 - t], ['leftToes', t]]; };
  L({ name: 'sabaton', mat: 'plate', tau: 0.02, k: 0.008, sdf: I(0.004, foot, plane([0, 0.0, 0], [0, -1, 0])), boneFn: footFn });
  L({ name: 'sabatonLames', mat: 'plate', tau: 0.02, k: 0.003, sdf: U(0, ...[0, 1, 2].map((i) => I(0.003, shell(grow(foot, 0.006 + i * 0.002), 0.004), I(0, plane([0, 0, 0.06 + i * 0.035], [0, 0, 1]), plane([0, 0, 0.035 + i * 0.035], [0, 0, -1])), plane([0, 0.035, 0], [0, -1, 0])))), boneFn: footFn });
  L({ name: 'sole', mat: 'leather', tau: 0.02, k: 0.006, sdf: I(0.004, grow(foot, 0.006), plane([0, 0.022, 0], [0, 1, 0]), plane([0, 0.0, 0], [0, -1, 0])), boneFn: footFn });

  // ------------------------------------------------------------ the great helm: flat-sided skull, beaked visor with a keel, T-slit, fin crest, swept horns
  const skull = I(0.03, ellipsoid([0, 1.935, -0.012], [0.128, 0.145, 0.152]), box([0, 1.93, 0], [0.114, 0.2, 0.2]));
  const prow = I(0.008, ellipsoid([0, 1.885, 0.035], [0.118, 0.12, 0.165]), symX(plane([0, 0, 0.205], [0.5, 0, 0.866])), slab(1.775, 2.0), box([0, 1.9, 0], [0.116, 0.2, 0.3]));
  // visor: a shallow recessed eye band (no deep channels), two narrow scowling eye slits that glow, round breaths
  const eyeBand = I(0.004, box([0, 1.903, 0.2], [0.1, 0.019, 0.06], null, 0.006), plane([0, 0, 0.152], [0, 0, -1]));
  const eye = (s) => box([s * 0.042, 1.904, 0.17], [0.03, 0.0055, 0.04], rot.z(s * -0.16), 0.002);
  const slits = U(0, eye(1), eye(-1));
  const breaths = U(0, ...[-1, 1].flatMap((s) => [0, 1, 2].flatMap((i) => [0, 1].map((j) => sphere([s * (0.03 + i * 0.019), 1.848 - j * 0.02 - i * 0.004, 0.2], 0.0062)))));
  const helm = Sub(0.004, U(0.02, skull, prow), eyeBand, breaths, cone([0, 1.6, 0.0], [0, 1.8, 0.0], 0.07, 0.068), plane([0, 1.785, 0], [0, 1, -0.3]));
  const eyesD = Sub(0.002, I(0.004, U(0.02, skull, prow), plane([0, 0, 0.135], [0, 0, -1])), slits);
  C({ name: 'visorEyes', mat: 'plate', bone: 'Head', rigid: true, k: 0.004, sdf: I(0.002, eyesD, box([0, 1.903, 0.2], [0.098, 0.017, 0.06])) });
  C({ name: 'eyeGlow', mat: 'glow', bone: 'Head', rigid: true, k: 0, sdf: I(0, U(0.02, skull, prow), grow(slits, -0.0008), plane([0, 0, 0.142], [0, 0, -1])) });
  C({ name: 'helm', mat: 'plate', bone: 'Head', rigid: true, k: 0.01, sdf: helm });
  C({ name: 'brow', mat: 'trim', bone: 'Head', rigid: true, k: 0.006, sdf: U(0.008, cone([0, 1.928, 0.19], [0.118, 1.945, 0.075], 0.011, 0.009), cone([0, 1.928, 0.19], [-0.118, 1.945, 0.075], 0.011, 0.009)) });
  C({ name: 'crest', mat: 'plate', bone: 'Head', rigid: true, k: 0.008, sdf: I(0.003, ellipsoid([0, 1.935, -0.02], [0.04, 0.163, 0.17]), box([0, 2.0, -0.02], [0.0085, 0.12, 0.2], null, 0.003), plane([0, 2.0, 0], [0, -1, 0.2])) });
  C({ name: 'bevor', mat: 'plate', bone: 'Head', rigid: true, k: 0.004, sdf: U(0.004, ...[0, 1].map((i) => I(0.004, shell(ellipsoid([0, 1.8 - i * 0.03, 0.02], [0.118 - i * 0.008, 0.08, 0.14 - i * 0.008]), 0.008), slab(1.77 - i * 0.032, 1.805 - i * 0.032), zcut(-0.03, -1)))) });
  C({ name: 'neckGuard', mat: 'plate', bone: 'Head', rigid: true, k: 0.004, sdf: U(0.004, ...[0, 1].map((i) => I(0.004, shell(ellipsoid([0, 1.86 - i * 0.04, -0.02], [0.13 + i * 0.008, 0.11, 0.155 + i * 0.008]), 0.008), zcut(-0.02, 1), slab(1.78 - i * 0.04, 1.84 - i * 0.04)))) });
  const hornPts = [[0.11, 1.97, 0.02], [0.165, 2.0, -0.03], [0.215, 2.06, -0.095], [0.235, 2.14, -0.17], [0.215, 2.2, -0.24]];
  C({ name: 'horns', mat: 'horn', bone: 'Head', rigid: true, k: 0.014, sdf: symX(disp(horn(hornPts, 0.037, 0.004), (x, y, z) => 0.0028 * Math.sin(Math.hypot(x - 0.11, y - 1.97, z - 0.02) * 115), 0.003)) });
  C({ name: 'helmRivets', mat: 'rivet', bone: 'Head', rigid: true, k: 0, sdf: symX(U(0, sphere([0.115, 1.925, 0.05], 0.0085), sphere([0.115, 1.89, -0.04], 0.0085), sphere([0.11, 1.97, -0.06], 0.0085))) });

  // ------------------------------------------------------------ tattered cape (folds shaped before the shell so the cloth never tears into strips)
  const y0 = 1.63, y1 = 0.5;
  const folds = (x, y, z) => { const t = Math.max(0, Math.min(1, (y0 - y) / (y0 - y1))), a = Math.atan2(x, -z); return t * (0.016 * Math.sin(a * 9 + 1.2 * fbm(x * 3, y * 2, 0, 2)) + 0.008 * fbm(x * 9, y * 4, z * 9, 2)); };
  const hemCut = { d: (x, y, z) => (y1 + 0.03 + 0.07 * Math.max(0, fbm(x * 9, 0.3, z * 9, 3)) + 0.045 * Math.max(0, noise(x * 26, 1.7, z * 26))) - y, bb: [-1, y1, -1, 1, 3, 1] };
  const capeD = I(0.004, shell(disp(cone([0, y0, 0.03], [0, y1, 0.1], 0.232, 0.41), folds, 0.03), 0.0075), zcut(-0.13, 1), hemCut, slab(0, y0 + 0.02));
  const holes = U(0, ellipsoid([0.12, 0.66, -0.36], [0.03, 0.045, 0.1]), ellipsoid([-0.19, 0.76, -0.3], [0.022, 0.035, 0.1]));
  C({ name: 'cape', mat: 'cloth', k: 0.01, tau: 0.03, sdf: Sub(0.004, capeD, holes), boneFn: (x, y) => { const t = (y0 - y) / (y0 - y1);
    if (y > y0 - 0.08) return [['UpperChest', 1]]; return [['CapeA', Math.max(0, 1 - t * 2.2) + 1e-3], ['CapeB', Math.max(0, 1 - Math.abs(t - 0.5) * 2.2)], ['CapeC', Math.max(0, t * 2.2 - 1.2)]]; } });

  // ------------------------------------------------------------ mirror the left side
  const swap = (n) => n.startsWith('left') ? 'right' + n.slice(4) : n.startsWith('right') ? 'left' + n.slice(5) : n;
  for (const p of P.slice()) if (p.side) P.push({ ...p, side: 0, name: p.name + 'R', sdf: mirrorX(p.sdf), bone: p.bone && swap(p.bone), boneFn: p.boneFn && ((x, y, z) => p.boneFn(-x, y, z).map(([b, w]) => [swap(b), w])) });

  return {
    name: 'hero', voxel: 0.005, tris: 21000, err: 0.0014, bones, parts: P,
    mats: {
      plate: { col: [0.2, 0.205, 0.235], gloss: 0.62, metal: 1, wear: 0.55, edge: [0.7, 0.72, 0.78], dirt: 0.45, var: 0.1, freq: 22 },
      trim: { col: [0.42, 0.3, 0.13], gloss: 0.72, metal: 1, wear: 0.55, edge: [1.0, 0.82, 0.45], var: 0.12, freq: 30, tint: 0 },
      rivet: { col: [0.5, 0.47, 0.42], gloss: 0.8, metal: 1, wear: 0.4, tint: 0 },
      mail: { col: [0.24, 0.24, 0.26], gloss: 0.5, metal: 0.85, var: 0.45, freq: 180, dirt: 0.5 },
      leather: { col: [0.24, 0.155, 0.095], gloss: 0.28, var: 0.22, freq: 45, dirt: 0.5 },
      fur: { col: [0.3, 0.27, 0.24], col2: [0.12, 0.11, 0.1], freq: 40, freq2: 14, var: 0.32, gloss: 0.04, dirt: 0.6 },
      cloth: { col: [0.42, 0.06, 0.07], col2: [0.24, 0.035, 0.04], freq2: 5, var: 0.15, freq: 30, gloss: 0.12, dirt: 0.55, grad: [0.5, 1.2, [0.5, 0.5, 0.5]] },
      horn: { col: [0.36, 0.32, 0.28], col2: [0.6, 0.55, 0.46], freq2: 9, var: 0.18, freq: 60, gloss: 0.45, dirt: 0.5 },
      glow: { col: [1.0, 0.34, 0.12], em: 1, gloss: 0 },
    },
  };
}
