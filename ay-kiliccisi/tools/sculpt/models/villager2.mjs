import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
export default (ALL) => humanoid(ALL, 'villager2', { hr: 0.102, dress: true, hairStyle: 'long', decals: eyeDecals, iris: [0.15, 0.3, 0.2], mats: mats({ skin: [0.92, 0.74, 0.62], c1: [0.36, 0.45, 0.32], c2: [0.5, 0.42, 0.3], hair: [0.55, 0.36, 0.18], iris: [0.15, 0.3, 0.2] }) });
