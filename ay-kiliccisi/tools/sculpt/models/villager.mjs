import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
export default (ALL) => humanoid(ALL, 'villager', { hr: 0.105, hairStyle: 'short', decals: eyeDecals, mats: mats({ skin: [0.86, 0.66, 0.52], c1: [0.55, 0.36, 0.22], c2: [0.33, 0.3, 0.26], hair: [0.3, 0.2, 0.12] }) });
