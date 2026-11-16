import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
import { hood, bowBack } from './_props.mjs';
export default (ALL) => humanoid(ALL, 'hunter', { hr: 0.103, hairStyle: 'bun', decals: eyeDecals, extras: [(c) => hood(c, true), bowBack],
  mats: mats({ skin: [0.9, 0.72, 0.6], c1: [0.24, 0.34, 0.2], c2: [0.3, 0.24, 0.16], hair: [0.5, 0.27, 0.1], iris: [0.3, 0.45, 0.2] }) });
