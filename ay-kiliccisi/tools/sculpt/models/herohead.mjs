// Kael without his helm (story scenes, rest at a shrine, or the "show helm" setting turned off): a weathered man in
// his thirties. Square jaw, heavy brow, a nose broken once, short dark hair swept back with cropped sides, a trimmed
// beard, amber eyes, and an old scar that cuts through the left eyebrow down to the cheekbone.
// Sculpted on the hero skeleton (eye bones at y 1.906, z 0.1) so it sits where the helm was; the game hides the helm
// triangles (everything skinned only to Head) and draws this mesh instead.
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, U, Sub, I, shell, grow, disp, symX, fbm, noise } from '../sdf.mjs';

export default function herohead(ALL) {
  const SK = ALL.hero, bones = SK.bones.map((b) => b.n), P = [];
  const C = (p) => { P.push(p); return p; };
  const E = SK.bones.find((b) => b.n === 'LeftEye').r; // [0.035, 1.906, 0.1]
  const ey = E[1], ex = E[0], ez = E[2] - 0.011, er = 0.0122;

  // ---------------------------------------------------------------- skull and face forms
  const cranium = ellipsoid([0, ey + 0.02, -0.012], [0.073, 0.09, 0.097]);
  const temples = symX(plane([0.069, 0, 0], [1, 0, 0.08])); // flattened sides, a man's squarer head
  const face = ellipsoid([0, ey - 0.03, 0.03], [0.064, 0.074, 0.074]);
  const jaw = box([0, ey - 0.075, 0.03], [0.052, 0.026, 0.05], rot.x(-0.18), 0.022);
  const jawAngle = symX(ellipsoid([0.05, ey - 0.075, -0.0], [0.014, 0.022, 0.026]));
  const chin = ellipsoid([0, ey - 0.098, 0.082], [0.024, 0.018, 0.017]);
  const cheek = symX(ellipsoid([0.045, ey - 0.022, 0.07], [0.022, 0.013, 0.02], rot.z(0.3)));
  const brow = U(0.01, ellipsoid([0, ey + 0.019, 0.086], [0.055, 0.011, 0.016]), symX(ellipsoid([0.03, ey + 0.016, 0.092], [0.021, 0.008, 0.013])));
  // the nose: straight bridge with a small bump where it was broken, a strong tip, flared wings
  const nose = U(0.006, cone([0, ey + 0.004, 0.1], [0, ey - 0.042, 0.124], 0.0085, 0.0105), sphere([0.0015, ey - 0.012, 0.113], 0.0075),
    sphere([0, ey - 0.043, 0.12], 0.0118), symX(ellipsoid([0.0135, ey - 0.047, 0.11], [0.009, 0.0075, 0.009])));
  const nostrils = symX(ellipsoid([0.0075, ey - 0.054, 0.114], [0.0042, 0.003, 0.006], rot.y(0.4)));
  // lips: a firm, fairly thin mouth with a philtrum groove
  const lipU = ellipsoid([0, ey - 0.068, 0.1], [0.021, 0.0055, 0.0085]), lipL = ellipsoid([0, ey - 0.076, 0.097], [0.019, 0.006, 0.0085]);
  const mouthLine = box([0, ey - 0.0718, 0.106], [0.022, 0.0011, 0.012], null, 0.0008);
  const philtrum = box([0, ey - 0.06, 0.112], [0.0028, 0.006, 0.004], null, 0.002);
  // almond eye openings: the cut exposes the recessed eyeball; the head surface around it forms the lids
  const lidMass = symX(ellipsoid([ex, ey + 0.0005, ez + 0.005], [0.019, 0.0135, 0.0125]));
  const sockets = symX(ellipsoid([ex + 0.001, ey + 0.0005, ez + 0.016], [0.0158, 0.0056, 0.012], rot.z(-0.08)));
  const lidCrease = symX(tube([[ex - 0.014, ey + 0.0085, ez + 0.017], [ex, ey + 0.0105, ez + 0.019], [ex + 0.015, ey + 0.0075, ez + 0.014]], () => 0.0012, 0.001));
  const ears = symX(ellipsoid([0.073, ey - 0.008, -0.008], [0.011, 0.03, 0.019], rot.y(0.35)));
  const earBowl = symX(ellipsoid([0.08, ey - 0.012, -0.003], [0.004, 0.019, 0.011], rot.y(0.35)));
  const head = Sub(0.004, U(0.016, I(0.02, cranium, temples), face, jaw, jawAngle, chin, cheek, brow, lidMass, nose, ears, lipU, lipL),
    sockets, lidCrease, nostrils, mouthLine, philtrum, earBowl);
  // fine skin: pores and creases (very small, so the shading breaks up without bumpy geometry)
  C({ name: 'head', mat: 'skin', bone: 'Head', rigid: true, k: 0.012, sdf: head });

  // ---------------------------------------------------------------- neck: covers the leather under-layer, blends into the Neck bone
  const neck = U(0.02, cone([0, 1.7, -0.004], [0, ey - 0.06, 0.004], 0.067, 0.058), ellipsoid([0, 1.79, 0.052], [0.011, 0.014, 0.01]),
    symX(cone([0.035, 1.72, 0.035], [0.012, 1.81, 0.06], 0.012, 0.009))); // sternocleidomastoid cords
  C({ name: 'neck', mat: 'skin', tau: 0.03, k: 0.02, sdf: neck, boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (y - 1.78) / 0.07)); return [['Head', t], ['Neck', 1 - t]]; } });

  // ---------------------------------------------------------------- eyes (set back under the brow: a hard, tired look)
  const eyes = symX(sphere([ex, ey, ez], er));
  C({ name: 'eye', mat: 'eye', bone: 'Head', rigid: true, k: 0, sdf: eyes });
  // iris and pupil are real geometry (flattened discs on the eyeball), so they stay crisp after mesh reduction
  const look = (o, r, t) => symX(ellipsoid([ex, ey - 0.0005, ez + er - o], [r, r, t]));
  C({ name: 'iris', mat: 'iris', bone: 'Head', rigid: true, k: 0, sdf: look(0.0006, 0.0056, 0.0016) });
  C({ name: 'pupil', mat: 'pupil', bone: 'Head', rigid: true, k: 0, sdf: look(-0.0004, 0.0024, 0.0009) });

  // ---------------------------------------------------------------- hair: cropped sides, longer top swept back
  const hairCap = I(0.01, grow(I(0.02, cranium, temples), 0.0065),
    plane([0, ey + 0.05, 0.075], [0, -0.55, 0.835]), // hairline, a little high at the temples
    symX(plane([0.05, ey + 0.035, 0.06], [0.55, -0.35, 0.76])),
    plane([0, ey - 0.03, -0.02], [0, -1, -0.35]), // nape
    symX(plane([0.06, ey + 0.004, 0.0], [0.15, -1, 0.35]))); // above the ears
  const top = I(0.012, ellipsoid([0, ey + 0.083, -0.012], [0.062, 0.03, 0.095]), plane([0, 0, 0.088], [0, -0.4, 1]));
  const strands = (x, y, z) => 0.0016 * Math.sin(x * 420 + 6 * fbm(x * 30, y * 30, z * 8, 2)) + 0.0012 * fbm(x * 90, y * 90, z * 25, 2);
  C({ name: 'hair', mat: 'hair', bone: 'Head', rigid: true, k: 0.012, sdf: disp(U(0.03, hairCap, top), strands, 0.003) });

  // ---------------------------------------------------------------- trimmed beard + moustache (a shell over the jaw line)
  const beardZone = U(0.015, jaw, chin, jawAngle, face);
  const beardShell = I(0.004, shell(beardZone, 0.0032, 0.003), plane([0, ey - 0.042, 0], [0, 1, 0.55]), plane([0, 0, -0.012], [0, 0, -1]),
    symX(plane([0.05, ey - 0.03, 0.07], [0.35, 0.8, 0.3])));
  const mouthHole = ellipsoid([0, ey - 0.072, 0.105], [0.022, 0.009, 0.02]);
  const moustache = symX(tube([[0.002, ey - 0.0595, 0.112], [0.014, ey - 0.062, 0.108], [0.023, ey - 0.072, 0.1]], (t) => 0.0034 - t * 0.0015, 0.003));
  const beardD = disp(U(0.003, Sub(0.003, beardShell, mouthHole), moustache), (x, y, z) => 0.0011 * fbm(x * 260, y * 120, z * 260, 2), 0.0015);
  C({ name: 'beard', mat: 'beard', bone: 'Head', rigid: true, k: 0.003, sdf: beardD });

  // ---------------------------------------------------------------- painted details (decals): iris, pupil, brows, scar, stubble shadow
  const browL = (s) => tube([[s * 0.012, ey + 0.0175, 0.1035], [s * 0.031, ey + 0.0195, 0.1035], [s * 0.052, ey + 0.016, 0.092]], (t) => 0.0034 - t * 0.0012, 0.002);
  // eyebrows: thick, low and straight; the left one is split by the scar
  const scar = tube([[0.047, ey + 0.035, 0.093], [0.041, ey + 0.012, 0.106], [0.044, ey - 0.012, 0.098], [0.049, ey - 0.03, 0.086]], () => 0.0022, 0.002);
  const scarGap = cone([0.035, ey + 0.03, 0.12], [0.05, ey - 0.03, 0.08], 0.0035);
  C({ name: 'brows', mat: 'brow', bone: 'Head', rigid: true, k: 0.0015, sdf: disp(U(0, Sub(0.001, browL(1), scarGap), browL(-1)), (x, y, z) => 0.0007 * noise(x * 500, y * 500, z * 200), 0.001) });
  return {
    name: 'herohead', voxel: 0.0022, tris: 10000, err: 0.0012, bones, parts: P,
    decals: [
      { mat: 'scar', sdf: scar, onPart: ['head', 'beard'] },
      { mat: 'lip', sdf: U(0.002, lipU, lipL), onPart: ['head'] },
    ],
    mats: {
      skin: { col: [0.72, 0.53, 0.42], col2: [0.64, 0.44, 0.36], freq2: 9, var: 0.06, freq: 40, gloss: 0.22, dirt: 0.12 },
      lip: { col: [0.6, 0.38, 0.33], gloss: 0.32, var: 0.05, freq: 60 },
      scar: { col: [0.82, 0.62, 0.55], gloss: 0.4, var: 0.05, freq: 80 },
      brow: { col: [0.13, 0.09, 0.07], var: 0.25, freq: 200, gloss: 0.15 },
      hair: { col: [0.12, 0.085, 0.065], col2: [0.06, 0.045, 0.035], freq2: 40, var: 0.3, freq: 160, gloss: 0.42, dirt: 0.55 },
      beard: { col: [0.15, 0.105, 0.08], col2: [0.08, 0.06, 0.045], freq2: 60, var: 0.3, freq: 220, gloss: 0.2, dirt: 0.5 },
      eye: { col: [0.88, 0.85, 0.8], gloss: 0.7, dirt: 0.2 },
      iris: { col: [0.62, 0.38, 0.1], gloss: 0.85, em: 0.08 },
      pupil: { col: [0.02, 0.015, 0.01], gloss: 0.9 },
    },
  };
}
