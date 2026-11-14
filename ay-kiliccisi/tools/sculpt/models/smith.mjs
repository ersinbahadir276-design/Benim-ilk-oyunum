import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
import { apron, hammer } from './_props.mjs';
export default (ALL) => humanoid(ALL, 'smith', { hr: 0.105, belly: 1, beard: 1.0, hairStyle: 'bald', decals: eyeDecals, forearmMat: 'skin', cuffs: false, extras: [apron, hammer],
  mats: mats({ skin: [0.78, 0.55, 0.42], c1: [0.32, 0.22, 0.16], c2: [0.24, 0.2, 0.17], hair: [0.14, 0.1, 0.08] }) });
