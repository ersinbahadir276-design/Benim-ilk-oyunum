// Shared humanoid sculpt for the 16-bone game rig (villagers, guards, quest givers, goblins, the Demon King).
// The rig is bound in an A-pose (shoulders rZ ±.55, hips rZ ±.06) — the game uses the same HBIND table.
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, mirrorX, symX, move, fbm, noise } from '../sdf.mjs';

export const BONES = ['root', 'spine', 'head', 'lSh', 'lEl', 'lWr', 'rSh', 'rEl', 'rWr', 'lHip', 'lKnee', 'lFoot', 'rHip', 'rKnee', 'rFoot', 'jaw'];
const HBIND = { 3: [0, 0, 0.55], 6: [0, 0, -0.55], 9: [0, 0, 0.06], 12: [0, 0, -0.06] };
export function fk(def) { const WR = [], WP = []; def.forEach((b, i) => { const e = HBIND[i], R = e ? rot.eul(e[0], e[1], e[2]) : [1, 0, 0, 0, 1, 0, 0, 0, 1];
  if (b.p < 0) { WR[i] = R; WP[i] = [0, 0, 0]; } else { WR[i] = rot.mul(WR[b.p], R); WP[i] = v3.add(WP[b.p], ap(WR[b.p], b.o)); } }); return { WR, WP }; }
const ap = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];

// spec: { hr, skin, c1, c2, hair, flags... } — see models/*.mjs
export function humanoid(ALL, kind, S) {
  const def = S.def || ALL.kinds[kind], BN = S.bones || BONES, { WR, WP } = fk(def), P = [], hr = S.hr || 0.105; let faceUV = null;
  const at = (b, p) => v3.add(WP[b], ap(WR[b], p)); // a point in a bone's local frame (rest axes: limbs hang along -y)
  const add = (p) => { P.push(p); return p; };
  const side = (fn) => { fn(1, 3, 4, 5, 9, 10, 11, 'l'); fn(-1, 6, 7, 8, 12, 13, 14, 'r'); };
  const N = (i) => BN[i];
  const T = def[2].o[1], sh = Math.abs(def[3].o[0]), big = S.big ? 1 : 0, gob = S.gob ? 1 : 0;
  const shY = WP[3][1], headB = WP[2], hc = v3.add(headB, [0, hr * 0.95, 0]);
  const legLen = -WP[11][1];
  // ---------------------------------------------------------------- torso + clothing
  const bt = S.bulk ?? big, chestR = [sh * 0.98 + bt * 0.06, T * 0.36, 0.12 + bt * 0.12 + (S.belly ? 0.02 : 0)], waistR = [sh * (S.waist || 0.85) + bt * 0.05 + (S.belly ? 0.05 : 0), T * 0.34, 0.11 + bt * 0.12 + (S.belly ? 0.08 : 0)];
  const hunch = gob ? 0.06 + big * 0.08 : 0;
  const chest = ellipsoid([0, 0.06 + T * 0.72, hunch * 0.3], chestR, gob ? rot.x(0.25) : null), waist = ellipsoid([0, 0.06 + T * 0.3, (S.belly ? 0.03 : 0)], waistR), pelvis = ellipsoid([0, -0.01, 0], [sh * (S.waist || 0.86) + bt * 0.06, 0.12, 0.115 + bt * 0.1]);
  const torso = U(0.07, chest, waist);
  const spineW = (x, y) => { const t = Math.max(0, Math.min(1, (y - 0.0) / (T * 0.45))); return [['spine', t], ['root', 1 - t]]; };
  add({ name: 'torso', mat: S.torsoMat || 'c1', boneFn: spineW, tau: 0.05, sdf: torso });
  add({ name: 'pelvis', mat: S.pelvisMat || 'c2', bone: 'root', tau: 0.04, sdf: pelvis });
  // shoulders (deltoids) so the arm joins the torso like a body, not a tube
  side((s, sb, eb) => add({ name: 'delt' + s, mat: S.armMat || S.torsoMat || 'c1', boneFn: () => [[N(sb), 0.6], ['spine', 0.4]], tau: 0.03, sdf: ellipsoid(at(sb, [0, -0.025, 0]), [0.052 + big * 0.075, 0.055 + big * 0.06, 0.05 + big * 0.065]) }));
  // neck
  add({ name: 'neck', mat: 'skin', boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (y - (headB[1] - 0.04)) / 0.08)); return [['head', t], ['spine', 1 - t]]; }, sdf: cone(v3.add(headB, [0, -0.07, gob ? 0.02 : 0]), v3.add(headB, [0, hr * 0.5, gob ? 0.03 : 0]), 0.045 + big * 0.05, 0.04 + big * 0.045) });
  if (!gob && !S.noBelt) { const by = 0.03; add({ name: 'belt', mat: 'leather', bone: 'root', rigid: true, k: 0.004, sdf: I(0.004, grow(ellipsoid([0, by, S.belly ? 0.02 : 0], [waistR[0] * 0.98, 0.1, waistR[2] * 1.0]), 0.01), I(0, plane([0, by + 0.024, 0], [0, 1, 0]), plane([0, by - 0.024, 0], [0, -1, 0]))) });
    add({ name: 'buckle', mat: 'metal', bone: 'root', rigid: true, k: 0.003, sdf: box([0, by, waistR[2] + 0.012 + (S.belly ? 0.02 : 0)], [0.026, 0.02, 0.008], null, 0.005) }); }
  // tunic hem / skirt
  if (S.tunic !== false && !gob) { const y0 = 0.05, y1 = S.dress ? -legLen + 0.06 : -0.3;
    const skirt = I(0.005, shell(disp(cone([0, y0, 0.0], [0, y1, 0.01], waistR[0] * 1.02, S.dress ? 0.3 : 0.2), (x, y, z) => Math.max(0, -y) * 0.05 * Math.sin(Math.atan2(x, z) * 9), 0.03), 0.007), I(0, plane([0, y0, 0], [0, 1, 0]), plane([0, y1, 0], [0, -1, 0])));
    add({ name: 'skirt', mat: S.skirtMat || S.torsoMat || 'c1', tau: 0.03, sdf: skirt, boneFn: (x, y) => { const d = Math.max(0, Math.min(1, -y / (S.dress ? legLen * 0.6 : 0.3))), t = Math.max(0, Math.min(1, (x + 0.08) / 0.16));
      if (S.dress && y < -legLen * 0.55) { const k = Math.min(1, (-legLen * 0.55 - y) / 0.2); return [['lKnee', k * t * 0.5], ['rKnee', k * (1 - t) * 0.5], ['lHip', (1 - k * 0.5) * t * 0.6], ['rHip', (1 - k * 0.5) * (1 - t) * 0.6], ['root', 0.4]]; }
      return [['root', 1 - d * 0.7], ['lHip', d * 0.7 * t], ['rHip', d * 0.7 * (1 - t)]]; } }); }
  // ---------------------------------------------------------------- arms and hands
  side((s, sb, eb, wb, hb, kb, fb, L) => {
    const sp = WP[sb], ep = WP[eb], wp = WP[wb];
    add({ name: L + 'ua', mat: S.armMat || S.torsoMat || 'c1', bone: N(sb), sdf: cone(sp, ep, 0.05 + big * 0.07, 0.042 + big * 0.06) });
    add({ name: L + 'fa', mat: S.forearmMat || S.armMat || S.torsoMat || 'c1', bone: N(eb), sdf: cone(ep, wp, 0.042 + big * 0.06, 0.033 + big * 0.048) });
    if (S.cuffs !== false && !gob) add({ name: L + 'cuff', mat: 'c2', bone: N(eb), rigid: true, k: 0.004, sdf: I(0.003, grow(cone(ep, wp, 0.045, 0.036), 0.004), plane(at(wb, [0, 0.05, 0]), ap(WR[wb], [0, -1, 0])), plane(at(wb, [0, 0.015, 0]), ap(WR[wb], [0, 1, 0]))) });
    // hand: palm + mitten of fingers + thumb (fingers curl with the wrist bone only)
    const hs = 1 + big * 0.9 + gob * 0.2;
    add({ name: L + 'palm', mat: 'skin', bone: N(wb), rigid: true, k: 0.012, sdf: U(0.012, ellipsoid(at(wb, [0, -0.045 * hs, 0.005]), [0.022 * hs, 0.042 * hs, 0.034 * hs]),
      box(at(wb, [0, -0.1 * hs, 0.012]), [0.017 * hs, 0.035 * hs, 0.03 * hs], WR[wb], 0.013 * hs), cone(at(wb, [0.004 * s, -0.04 * hs, 0.03 * hs]), at(wb, [0.012 * s, -0.08 * hs, 0.05 * hs]), 0.011 * hs, 0.009 * hs)) });
    if (gob) add({ name: L + 'claws', mat: 'horn', bone: N(wb), rigid: true, k: 0.004, sdf: U(0, ...[-1, 0, 1].map((i) => horn([at(wb, [0, -0.125 * hs, 0.012 + i * 0.016 * hs]), at(wb, [0, -0.15 * hs, 0.025 + i * 0.018 * hs]), at(wb, [0, -0.165 * hs, 0.04 + i * 0.02 * hs])], 0.008 * hs))) });
    // legs: trousers / skin, knee, boots
    const hp = WP[hb], kp = WP[kb], ap2 = WP[fb];
    add({ name: L + 'th', mat: S.legMat || 'c2', bone: N(hb), tau: 0.03, sdf: cone(v3.add(hp, [0, 0.02, 0]), kp, 0.07 + big * 0.08, 0.052 + big * 0.07) });
    add({ name: L + 'sh', mat: S.legMat || 'c2', bone: N(kb), sdf: cone(kp, ap2, 0.05 + big * 0.07, 0.038 + big * 0.055) });
    const fl = 0.12 + big * 0.07 + gob * 0.04, foot = U(0.03, ellipsoid(v3.add(ap2, [0, -0.02, 0.01]), [0.045 + big * 0.045, 0.045 + big * 0.03, 0.06 + big * 0.05]), cone(v3.add(ap2, [0, -0.03, 0.03]), v3.add(ap2, [0, -0.045 + big * 0.0, fl]), 0.042 + big * 0.04, 0.03 + big * 0.03));
    const footP = I(0.006, foot, plane(v3.add(ap2, [0, -0.07 - big * 0.025, 0]), [0, -1, 0]));
    if (gob) add({ name: L + 'foot', mat: 'skin', bone: N(fb), k: 0.02, sdf: footP });
    else { add({ name: L + 'boot', mat: S.bootMat || 'leather', bone: N(fb), k: 0.01, tau: 0.025, sdf: footP });
      add({ name: L + 'bootShaft', mat: S.bootMat || 'leather', boneFn: (x, y) => [[N(kb), 1], [N(fb), Math.max(0, 1 - (y - ap2[1]) / 0.08)]], k: 0.008, sdf: I(0.004, grow(cone(kp, ap2, 0.052 + big * 0.07, 0.041 + big * 0.055), 0.007), plane(v3.add(ap2, [0, 0.16, 0]), [0, 1, 0])) });
      add({ name: L + 'sole', mat: 'sole', bone: N(fb), k: 0.006, sdf: I(0.004, grow(foot, 0.005), plane(v3.add(ap2, [0, -0.055 - big * 0.025, 0]), [0, 1, 0]), plane(v3.add(ap2, [0, -0.072 - big * 0.025, 0]), [0, -1, 0])) }); }
  });
  // ---------------------------------------------------------------- head and face
  const H = (p) => v3.add(hc, p), hb = (p) => v3.add(headB, p);
  if (!gob && !S.demon) {
    const cranium = ellipsoid(H([0, hr * 0.06, -hr * 0.04]), [hr * 0.9, hr * 1.02, hr * 0.98]);
    const face = U(hr * 0.3, ellipsoid(H([0, -hr * 0.28, hr * 0.14]), [hr * 0.74, hr * 0.66, hr * 0.78]), sphere(H([0, -hr * 0.7, hr * 0.42]), hr * 0.22)); // soft egg shape, small chin: no brow ridge, no eye sockets
    const nose = ellipsoid(H([0, -hr * 0.2, hr * 0.93]), [hr * 0.07, hr * 0.09, hr * 0.09]);
    const sockets = symX(ellipsoid(H([hr * 0.34, hr * 0.02, hr * 0.93]), [hr * 0.2, hr * 0.1, hr * 0.08]));
    const ears = symX(ellipsoid(H([hr * 0.9, -hr * 0.05, -hr * 0.02]), [hr * 0.1, hr * 0.22, hr * 0.15], rot.y(0.3)));
    // the face is painted (eyes, brows, lips) through a front projection; the sculpt gives the forms
    faceUV = (x, y, z, top) => Math.hypot(x - hc[0], y - hc[1], z - hc[2]) < hr * 1.7 ? [0.5 + (x - hc[0]) / (2.4 * hr), 0.5 - (y - hc[1]) / (2.4 * hr), top.name === 'head' ? Math.max(0, Math.min(1, (z - hc[2] - hr * 0.25) / (hr * 0.3))) : 0] : null;
    add({ name: 'head', mat: 'face', bone: 'head', rigid: true, k: 0.02, sdf: U(hr * 0.2, cranium, face, U(hr * 0.12, nose, ears)) });
    // hair
    if (S.hairStyle !== 'bald') { const long = S.hairStyle === 'long', bun = S.hairStyle === 'bun';
      const cap = I(0.012, grow(cranium, hr * 0.09), plane(H([0, hr * 0.5, hr * 0.5]), [0, -0.6, 0.8]), plane(H([0, -hr * (long ? 1.6 : 0.3), hr * 0.3]), [0, -1, long ? 0 : 0.42]), plane(H([0, -hr * 0.1, hr * 0.3]), [0, -0.25, 0.97]));
      const extra = long ? ellipsoid(H([0, -hr * 0.9, -hr * 0.62]), [hr * 0.92, hr * 1.1, hr * 0.42]) : bun ? sphere(H([0, hr * 0.5, -hr * 0.95]), hr * 0.38) : null; // long hair falls behind the ears, never over the cheeks
      const hairD = disp(extra ? U(hr * 0.3, cap, extra) : cap, (x, y, z) => 0.006 * fbm(x * 70, y * 16, z * 70, 2), 0.008);
      add({ name: 'hair', mat: 'hair', tau: 0.02, k: 0.01, sdf: hairD, boneFn: (x, y) => long && y < hc[1] - hr * 0.6 ? [['head', 0.4], ['spine', 0.6]] : [['head', 1]] }); }
    if (S.beard) add({ name: 'beard', mat: 'hair', bone: 'head', rigid: true, k: 0.02, sdf: Sub(0.006, disp(U(0.03, ellipsoid(H([0, -hr * 0.62, hr * 0.62]), [hr * 0.62, hr * 0.62 * S.beard, hr * 0.42]), symX(ellipsoid(H([hr * 0.55, -hr * 0.35, hr * 0.45]), [hr * 0.22, hr * 0.42, hr * 0.3]))), (x, y, z) => 0.007 * fbm(x * 60, y * 22, z * 60, 2), 0.009), box(H([0, -hr * 0.47, hr * 0.95]), [hr * 0.2, hr * 0.03, hr * 0.15], null, 0.004)) });
  }
  if (gob) { // big skull, heavy brow, long hooked nose, wide mouth with fangs, huge ears, yellow eyes — the jaw opens
    const g = hr;
    const skull = U(g * 0.25, ellipsoid(H([0, g * 0.05, -g * 0.1]), [g * 0.85, g * 0.82, g * 0.9]), ellipsoid(H([0, g * 0.25, g * 0.45]), [g * 0.72, g * 0.22, g * 0.32]));
    const snout = U(g * 0.12, ellipsoid(H([0, -g * 0.32, g * 0.48]), [g * 0.6, g * 0.36, g * 0.48]), cone(H([0, g * 0.1, g * 0.78]), H([0, -g * 0.22, g * 1.22]), g * 0.11, g * 0.08), sphere(H([0, -g * 0.28, g * 1.18]), g * 0.1));
    const ears = symX(Sub(0.004, disp(ellipsoid(H([g * 1.25, g * 0.25, -g * 0.15]), [g * 0.6, g * 0.2, g * 0.04], rot.mul(rot.z(-0.35), rot.y(0.35))), (x, y, z) => 0.004 * noise(x * 60, y * 60, z * 60), 0.005),
      ellipsoid(H([g * 1.2, g * 0.25, -g * 0.11]), [g * 0.5, g * 0.12, g * 0.03], rot.mul(rot.z(-0.35), rot.y(0.35)))));
    const sockets = symX(ellipsoid(H([g * 0.32, g * 0.12, g * 0.72]), [g * 0.2, g * 0.14, g * 0.15]));
    const mouth = box(H([0, -g * 0.5, g * 0.72]), [g * 0.48, g * 0.03, g * 0.4], rot.x(-0.1), 0.004);
    add({ name: 'head', mat: 'skin', tau: 0.012, k: 0.025, sdf: Sub(0.006, U(g * 0.12, skull, snout, ears), sockets, mouth), boneFn: (x, y, z) => { const j = y < hc[1] - g * 0.5 && z > hc[2] + g * 0.1 ? 1 : 0; return j ? [['jaw', 1]] : [['head', 1]]; } });
    add({ name: 'eyes', mat: 'eyeY', bone: 'head', rigid: true, k: 0.003, sdf: symX(sphere(H([g * 0.32, g * 0.1, g * 0.62]), g * 0.15)) });
    add({ name: 'fangs', mat: 'tooth', boneFn: (x, y) => [[y < hc[1] - g * 0.52 ? 'jaw' : 'head', 1]], rigid: true, k: 0.003, sdf: U(0, ...[-1, 1].map((s) => horn([H([s * g * 0.3, -g * 0.48, g * 0.95]), H([s * g * 0.31, -g * 0.6, g * 0.97]), H([s * g * 0.29, -g * 0.7, g * 0.95])], g * 0.06)),
      ...[-1, 1].map((s) => horn([H([s * g * (0.38 + big * 0.05), -g * 0.56, g * 0.9]), H([s * g * 0.4, -g * (0.42 - big * 0.2), g * 0.95]), H([s * g * 0.44, -g * (0.3 - big * 0.35), g * 0.92])], g * (0.05 + big * 0.04)))) });
    // loincloth, straps, bone necklace
    add({ name: 'loin', mat: 'c1', tau: 0.03, k: 0.006, sdf: I(0.004, shell(disp(cone([0, 0.06, 0], [0, -0.22 - big * 0.12, 0.02], waistR[0], waistR[0] * 1.25), (x, y, z) => 0.01 * fbm(x * 20, y * 5, z * 20, 2), 0.012), 0.007), I(0, plane([0, 0.05, 0], [0, 1, 0]), { d: (x, y, z) => -0.2 - big * 0.12 - 0.04 * noise(x * 30, 0, z * 30) - y, bb: [-2, -2, -2, 2, 2, 2] })),
      boneFn: (x, y) => { const d = Math.max(0, Math.min(1, -y / 0.25)), t = Math.max(0, Math.min(1, (x + 0.08) / 0.16)); return [['root', 1 - d * 0.6], ['lHip', d * 0.6 * t], ['rHip', d * 0.6 * (1 - t)]]; } });
    add({ name: 'strap', mat: 'leather', bone: 'spine', rigid: false, tau: 0.03, k: 0.004, sdf: tube([[-chestR[0] * 0.9, 0.06 + T * 0.95, -0.02], [0, 0.06 + T * 0.62, chestR[2] * 1.02 + hunch * 0.3], [chestR[0] * 0.95, 0.06 + T * 0.3, 0.02]], () => 0.014 + big * 0.01) });
  }
  if (S.demon) { // the Demon King: long horned skull, burning eyes, jaw of fangs
    const g = hr;
    const skull = U(g * 0.2, ellipsoid(H([0, g * 0.08, -g * 0.05]), [g * 0.85, g * 1.05, g * 0.95]), ellipsoid(H([0, -g * 0.45, g * 0.32]), [g * 0.62, g * 0.55, g * 0.62]), ellipsoid(H([0, g * 0.18, g * 0.72]), [g * 0.7, g * 0.14, g * 0.22]));
    const cheek = symX(ellipsoid(H([g * 0.48, -g * 0.22, g * 0.55]), [g * 0.22, g * 0.32, g * 0.3]));
    const sockets = symX(ellipsoid(H([g * 0.32, g * 0.02, g * 0.82]), [g * 0.2, g * 0.11, g * 0.14], rot.z(-0.25)));
    add({ name: 'head', mat: 'skin', bone: 'head', rigid: true, k: 0.02, sdf: Sub(0.006, U(g * 0.15, skull, cheek), sockets, box(H([0, -g * 0.62, g * 0.82]), [g * 0.32, g * 0.02, g * 0.15], null, 0.004)) });
    add({ name: 'eyes', mat: 'glow', bone: 'head', rigid: true, k: 0.003, sdf: symX(ellipsoid(H([g * 0.32, g * 0.01, g * 0.76]), [g * 0.15, g * 0.07, g * 0.1], rot.z(-0.25))) });
    const crown = []; for (let i = 0; i < 7; i++) { const a = (i / 6 - 0.5) * 2.3, hx = Math.sin(a) * g * 0.9, hz = Math.cos(a) * g * 0.55 - g * 0.1, up = i === 3 ? 0.14 : 0.04 * Math.cos(a * 2);
      crown.push(horn([H([hx, g * 0.75, hz]), H([hx * 1.35, g * (1.45 + up * 5), hz * 1.1 - 0.05]), H([hx * 1.5, g * (2.1 + up * 9), hz * 0.9 - 0.15])], g * 0.17)); }
    add({ name: 'crown', mat: 'horn', bone: 'head', rigid: true, k: 0.02, sdf: U(0.01, ...crown, I(0.004, shell(ellipsoid(H([0, g * 0.62, -g * 0.05]), [g * 0.95, g * 0.4, g * 1.0]), 0.012), I(0, plane(H([0, g * 0.75, 0]), [0, 1, 0]), plane(H([0, g * 0.55, 0]), [0, -1, 0])))) });
    add({ name: 'teeth', mat: 'tooth', bone: 'head', rigid: true, k: 0.003, sdf: U(0, ...[-2, -1, 0, 1, 2].map((i) => horn([H([i * g * 0.11, -g * 0.6, g * 0.92 - Math.abs(i) * 0.02]), H([i * g * 0.11, -g * 0.72, g * 0.93 - Math.abs(i) * 0.02])], g * 0.04))) });
  }
  // ---------------------------------------------------------------- role extras
  for (const f of S.extras || []) f({ add, at, WP, WR, hc, hr, T, sh, big, chestR, waistR, legLen, H, N, side, headB });
  return { name: kind, uv: faceUV, voxel: S.voxel || 0.0058, tris: S.tris || 7000, err: S.err ?? 0.0018, bones: BN, parts: P, decals: S.decals ? S.decals({ H, hr }) : [], mats: S.mats };
}

// shared material builder
export function mats(o) {
  return {
    skin: { col: o.skin, var: 0.08, freq: 30, gloss: 0.18, dirt: 0.25 },
    face: { col: o.skin, var: 0.02, freq: 20, gloss: 0.16, dirt: 0, ao: 0.12 },   // clean, evenly lit face (the painted features carry the expression)
    c1: { col: o.c1, col2: o.c1b || o.c1.map((q) => q * 0.75), freq2: 6, var: 0.18, freq: 60, gloss: 0.1, dirt: 0.5 },
    c2: { col: o.c2, col2: o.c2b || o.c2.map((q) => q * 0.78), freq2: 6, var: 0.16, freq: 60, gloss: 0.1, dirt: 0.5 },
    hair: { col: o.hair, col2: o.hair.map((q) => q * 0.6), freq2: 30, var: 0.25, freq: 80, gloss: 0.35, dirt: 0.6 },
    leather: { col: [0.26, 0.17, 0.1], var: 0.2, freq: 45, gloss: 0.3, dirt: 0.5 },
    sole: { col: [0.12, 0.09, 0.07], var: 0.1, gloss: 0.1 },
    metal: { col: [0.5, 0.48, 0.44], gloss: 0.75, metal: 1, wear: 0.4, tint: 0 },
    steel: { col: [0.45, 0.47, 0.52], gloss: 0.7, metal: 1, wear: 0.5, edge: [0.9, 0.92, 1], dirt: 0.4 },
    gold: { col: [0.62, 0.45, 0.16], gloss: 0.8, metal: 1, wear: 0.5, edge: [1, 0.9, 0.5] },
    wood: { col: [0.4, 0.27, 0.15], col2: [0.28, 0.18, 0.1], freq2: 25, var: 0.25, freq: 90, gloss: 0.2, dirt: 0.5 },
    eye: { col: [0.92, 0.9, 0.86], gloss: 0.6 }, iris: { col: o.iris || [0.22, 0.14, 0.08], gloss: 0.8 }, pupil: { col: [0.03, 0.02, 0.02], gloss: 0.9 },
    eyeY: { col: [1.2, 0.95, 0.2], gloss: 0.7, em: 0.35 }, tooth: { col: [0.9, 0.86, 0.72], gloss: 0.4 }, horn: { col: o.horn || [0.3, 0.26, 0.22], col2: [0.55, 0.5, 0.42], freq2: 12, var: 0.2, gloss: 0.45 },
    lip: { col: o.skin.map((q, i) => q * [0.8, 0.55, 0.55][i]), gloss: 0.3 }, glow: { col: [1.4, 0.4, 0.15], em: 1 },
    ...(o.extra || {}),
  };
}
// eyes: iris + pupil decals on the eye spheres
export const eyeDecals = ({ H, hr }) => [{ mat: 'iris', sdf: symX(sphere(H([hr * 0.34, -hr * 0.01, hr * 0.92]), hr * 0.075)), on: ['eye'] }, { mat: 'pupil', sdf: symX(sphere(H([hr * 0.34, -hr * 0.01, hr * 0.93]), hr * 0.035)), on: ['eye'] }];
