// Forge upgrade +5 «Ay İşçiliği» (the game's namesake): a gilded crescent moon cradling a glowing moonstone on the
// breastplate, a smaller gilded crescent on the helm's brow, gold rondels with moonstones on both knees and a gold rim
// along each pauldron's lower edge. Moonstones use the glow channel; the game gives this overlay its own pale
// moonlight emission, so it stays blue-white even while the rage glow turns the rest of the armour red.
import { v3, sphere, cone, ellipsoid, torus, U, Sub, I, plane, rot } from '../sdf.mjs';
import { base, mirror } from './_armor.mjs';

export default function armup5(ALL) {
  const { B, bones, onto, pFn } = base(ALL), P = [];
  const L = (p) => { p.side = 1; P.push(p); return p; }, C = (p) => { P.push(p); return p; };
  // a crescent standing proud of a surface point p with outward normal n: a disc minus an offset disc (horns up)
  const crescent = (p, n, r, th, cut = 0.9, off = 0.27) => { const up = v3.norm(v3.sub([0, 1, 0], v3.mul(n, n[1])));
    const disc = (c, rr, t0, t1) => cone(v3.add(c, v3.mul(n, t0)), v3.add(c, v3.mul(n, t1)), rr, rr);
    return Sub(0.0015, disc(p, r, -0.004, th), disc(v3.add(p, v3.mul(up, r * off)), r * cut, -0.01, th + 0.01)); };
  const hollow = (p, n, r, off = 0.27) => v3.add(p, v3.mul(v3.norm(v3.sub([0, 1, 0], v3.mul(n, n[1]))), r * off));

  // ---- chest: crescent + moonstone, on a thin gold backing ring
  const cP = onto('cuirass', [0, 1.5, 0.4], [0, 0, -1], 0), cN = [0, 0.08, 1];
  C({ name: 'moonChest', mat: 'gold', bone: 'UpperChest', rigid: true, k: 0.002, sdf: U(0.002, crescent(cP, cN, 0.048, 0.011), torus(v3.add(cP, [0, 0, 0.002]), 0.058, 0.0035, rot.x(Math.PI / 2))) });
  C({ name: 'stoneChest', mat: 'moon', bone: 'UpperChest', rigid: true, k: 0.001, sdf: ellipsoid(v3.add(hollow(cP, cN, 0.048), [0, 0.002, 0.004]), [0.024, 0.024, 0.012]) });

  // ---- helm brow: small crescent above the brow ridge
  const hP = onto('helm', [0, 1.985, 0.4], [0, -0.1, -1], 0), hN = v3.norm([0, 0.25, 1]);
  C({ name: 'moonHelm', mat: 'gold', bone: 'Head', rigid: true, k: 0.002, sdf: crescent(hP, hN, 0.026, 0.008) });
  C({ name: 'stoneHelm', mat: 'moon', bone: 'Head', rigid: true, k: 0.001, sdf: sphere(v3.add(hollow(hP, hN, 0.026), v3.mul(hN, 0.002)), 0.011) });

  // ---- knee rondels: gold rings with a moonstone, on the front of the poleyn
  const kY = B.leftLowerLeg[1], kP = onto('poleyn', [0.099, kY, 0.4], [0, 0, -1], 0);
  const knee = () => [['leftLowerLeg', 0.55], ['leftUpperLeg', 0.45]];
  L({ name: 'rondel', mat: 'gold', boneFn: knee, rigid: true, k: 0.002, sdf: Sub(0.001, cone(v3.add(kP, [0, 0, -0.004]), v3.add(kP, [0, 0, 0.008]), 0.032, 0.028), cone(v3.add(kP, [0, 0, 0.004]), v3.add(kP, [0, 0, 0.02]), 0.02, 0.02)) });
  L({ name: 'kneeStone', mat: 'moon', boneFn: knee, rigid: true, k: 0.001, sdf: ellipsoid(v3.add(kP, [0, 0, 0.006]), [0.017, 0.017, 0.009]) });

  // ---- pauldron gold rim: a thin band hugging the dome's lower edge (points landed on the plate, joined by a tube)
  const ctr = [0.27, 1.66, 0], rim = [];
  for (let i = 0; i <= 10; i++) { const s = -0.95 + i * 0.19, d = v3.norm([0.85, 0.12, s]); rim.push(onto('pauldron', v3.add(ctr, v3.mul(d, 0.45)), v3.mul(d, -1), 0.003)); }
  const tubeOf = (pts, r) => U(0.002, ...pts.slice(1).map((p, i) => cone(pts[i], p, r, r)));
  L({ name: 'pdRim', mat: 'gold', boneFn: pFn, rigid: true, k: 0.002, sdf: tubeOf(rim, 0.0055) });

  mirror(P);
  return {
    name: 'armup5', voxel: 0.003, tris: 4000, err: 0.002, bones, parts: P,
    mats: {
      gold: { col: [0.85, 0.62, 0.22], gloss: 0.9, metal: 1, wear: 0.3, edge: [1.0, 0.9, 0.6], var: 0.06, freq: 40, dirt: 0.3, tint: 0 },
      moon: { col: [0.62, 0.78, 1.0], em: 1, gloss: 0.6, tint: 0 },
    },
  };
}
