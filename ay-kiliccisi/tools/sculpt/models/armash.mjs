// «Kül Zırh» overlay: the plate has been through dragon fire. Glowing ember seams run through the breastplate and
// pauldrons, obsidian shards jut from the shoulders, a crown of charred spikes rises behind the helm, and molten rune
// bands ring the vambraces and greaves. Ember surfaces use the glow channel, so they pulse with the rage meter.
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, torus, U, Sub, I, disp, noise, fbm } from '../sdf.mjs';
import { base, mirror } from './_armor.mjs';

export default function armash(ALL) {
  const { B, bones, onto, hug, pFn } = base(ALL), P = [];
  const L = (p) => { p.side = 1; P.push(p); return p; }, C = (p) => { P.push(p); return p; };
  // a crack: a jagged polyline projected onto a plate (deterministic jitter so rebuilds match)
  const crack = (part, a, b, n, jit, dir, seed, r0 = 0.0065) => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, p = v3.lerp(a, b, t), j = i === 0 || i === n ? 0 : jit * noise(seed + i * 1.7, seed * 0.3, 0.5);
      pts.push([p[0] + j, p[1] + j * 0.6, p[2]]); }
    return tube(hug(part, pts, dir, 0.0015), (t) => r0 * (1 - t * 0.55), 0.002); };

  // ---- ember seams on the breastplate: a trunk from the gorget down the keel, branching over the chest
  const fwd = (p) => [-p[0] * 0.6, 0, -1];
  const seams = [crack('cuirass', [0.0, 1.62, 0.4], [0.03, 1.36, 0.4], 7, 0.02, fwd, 1.3, 0.007),
    crack('cuirass', [0.01, 1.52, 0.4], [0.17, 1.44, 0.4], 6, 0.018, fwd, 4.1), crack('cuirass', [0.02, 1.45, 0.4], [-0.15, 1.36, 0.4], 6, 0.018, fwd, 7.7),
    crack('cuirass', [0.0, 1.58, 0.4], [-0.13, 1.6, 0.4], 4, 0.012, fwd, 9.2, 0.0055), crack('cuirass', [0.1, 1.48, 0.4], [0.13, 1.37, 0.4], 3, 0.012, fwd, 2.6, 0.005)];
  C({ name: 'chestSeams', mat: 'ember', bone: 'UpperChest', rigid: true, k: 0.002, sdf: U(0.002, ...seams) });
  // charred blisters along the seams
  C({ name: 'char', mat: 'char', bone: 'UpperChest', rigid: true, k: 0.006, sdf: disp(U(0.01, ...[[0.05, 1.5], [-0.08, 1.41], [0.12, 1.46], [0.02, 1.38]].map(([x, y]) => { const p = onto('cuirass', [x, y, 0.4], fwd([x, y, 0]), 0); return ellipsoid(p, [0.024, 0.017, 0.006]); })),
    (x, y, z) => 0.004 * fbm(x * 90, y * 90, z * 90, 2), 0.005) });

  // ---- shoulders: seams over the pauldron dome + a cluster of obsidian shards

  const toPd = (p) => v3.sub([0.27, 1.66, 0], p);
  L({ name: 'pdSeams', mat: 'ember', boneFn: pFn, rigid: true, k: 0.002, sdf: U(0.002, crack('pauldron', [0.24, 1.86, 0.1], [0.4, 1.7, 0.08], 5, 0.014, toPd, 3.3), crack('pauldron', [0.25, 1.86, -0.1], [0.4, 1.68, -0.1], 5, 0.014, toPd, 5.9)) });
  const shard = (o, d, len, w) => { const tip = v3.add(o, v3.mul(v3.norm(d), len)); return U(0.002, cone(o, v3.lerp(o, tip, 0.6), w, w * 0.7), cone(v3.lerp(o, tip, 0.6), tip, w * 0.7, 0.002)); };
  L({ name: 'shards', mat: 'obsidian', boneFn: pFn, rigid: true, k: 0.004, sdf: U(0.006, shard([0.25, 1.78, -0.06], [0.15, 1, -0.45], 0.16, 0.024), shard([0.28, 1.77, -0.09], [0.5, 0.8, -0.55], 0.12, 0.02), shard([0.23, 1.77, -0.03], [-0.1, 1, -0.2], 0.09, 0.016)) });
  L({ name: 'shardGlow', mat: 'ember', boneFn: pFn, rigid: true, k: 0.004, sdf: U(0, sphere([0.255, 1.775, -0.065], 0.03), sphere([0.282, 1.765, -0.092], 0.024)) });

  // ---- crown of charred spikes behind the helm (tips glow)
  const crown = [], tips = [];
  for (let i = 0; i < 7; i++) { const a = Math.PI + (i - 3) * 0.36, dir = [Math.sin(a) * 0.35, 1, Math.cos(a) * 0.55], len = 0.12 - Math.abs(i - 3) * 0.018;
    const o = onto('helm', [Math.sin(a) * 0.3, 2.02, Math.cos(a) * 0.3 - 0.012], [-Math.sin(a), -0.15, -Math.cos(a)], -0.006);
    const t = v3.add(o, v3.mul(v3.norm(dir), len)); crown.push(horn([o, v3.lerp(o, t, 0.5), t], 0.016, 0.002)); tips.push(sphere(v3.lerp(o, t, 0.93), 0.006)); }
  C({ name: 'crown', mat: 'obsidian', bone: 'Head', rigid: true, k: 0.004, sdf: U(0.004, ...crown, torus([0, 2.0, -0.02], 0.118, 0.01, rot.x(-0.35))) });
  C({ name: 'crownTips', mat: 'ember', bone: 'Head', rigid: true, k: 0.001, sdf: U(0, ...tips) });

  // ---- molten rune bands
  const band = (c, r, R) => Sub(0.002, torus(c, r, 0.0055, R), ...[0, 1, 2, 3, 4, 5].map((i) => { const a = i / 6 * Math.PI * 2; return box(v3.add(c, R === undefined ? [Math.sin(a) * r, 0, Math.cos(a) * r] : [0, Math.sin(a) * r, Math.cos(a) * r]), [0.008, 0.008, 0.008], null, 0.002); }));
  L({ name: 'armBands', mat: 'ember', bone: 'leftLowerArm', rigid: true, k: 0.002, sdf: U(0, band([0.6, 1.652, 0], 0.069, rot.z(Math.PI / 2)), band([0.68, 1.652, 0], 0.065, rot.z(Math.PI / 2))) });
  L({ name: 'legBands', mat: 'ember', bone: 'leftLowerLeg', rigid: true, k: 0.002, sdf: U(0, band([0.099, 0.48, 0.007], 0.08), band([0.099, 0.34, 0.009], 0.075)) });
  L({ name: 'thighSeam', mat: 'ember', bone: 'leftUpperLeg', rigid: true, k: 0.002, sdf: crack('cuisse', [0.13, 0.97, 0.4], [0.07, 0.74, 0.4], 5, 0.014, (p) => [-(p[0] - 0.099), 0, -1], 6.4) });

  mirror(P);
  return {
    name: 'armash', voxel: 0.0045, tris: 5000, err: 0.003, bones, parts: P,
    mats: {
      ember: { col: [1.0, 0.5, 0.16], em: 1, gloss: 0, tint: 0 },
      char: { col: [0.06, 0.055, 0.05], col2: [0.16, 0.13, 0.11], freq2: 30, var: 0.3, freq: 80, gloss: 0.15, dirt: 0.4, tint: 0 },
      obsidian: { col: [0.05, 0.045, 0.06], col2: [0.12, 0.1, 0.14], freq2: 12, var: 0.2, freq: 40, gloss: 0.85, metal: 0.4, wear: 0.3, edge: [0.6, 0.3, 0.2], tint: 0 },
    },
  };
}
