// Erkek kahraman: VRoid anime avatarı + Quaternius "Universal Animation Library" klipleri.
// Klipler kaynak iskeletten (UE tarzı manken) kahramanın iskeletine çalışma anında aktarılır (retarget).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SpringBoneSystem } from './springbone.js';

const SIDE = (l, r) => (s) => (s === 'l' ? l : r);
const MAP = { pelvis: 'J_Bip_C_Hips', spine_01: 'J_Bip_C_Spine', spine_02: 'J_Bip_C_Chest', spine_03: 'J_Bip_C_UpperChest', neck_01: 'J_Bip_C_Neck', Head: 'J_Bip_C_Head' };
for (const s of ['l', 'r']) {
  const S = s.toUpperCase();
  Object.assign(MAP, {
    [`clavicle_${s}`]: `J_Bip_${S}_Shoulder`, [`upperarm_${s}`]: `J_Bip_${S}_UpperArm`, [`lowerarm_${s}`]: `J_Bip_${S}_LowerArm`, [`hand_${s}`]: `J_Bip_${S}_Hand`,
    [`thigh_${s}`]: `J_Bip_${S}_UpperLeg`, [`calf_${s}`]: `J_Bip_${S}_LowerLeg`, [`foot_${s}`]: `J_Bip_${S}_Foot`, [`ball_${s}`]: `J_Bip_${S}_ToeBase`,
  });
  for (const [a, b] of [['index', 'Index'], ['middle', 'Middle'], ['ring', 'Ring'], ['pinky', 'Little'], ['thumb', 'Thumb']])
    for (const i of [1, 2, 3]) MAP[`${a}_0${i}_${s}`] = `J_Bip_${S}_${b}${i}`;
}

const loader = new GLTFLoader();
const load = (url) => new Promise((res, rej) => loader.load(url, res, undefined, rej));

function toonify(root) {
  // VRM'in MToon malzemeleri standart yükleyicide "unlit" gelir; sahne ışığına tepki versin diye toon'a çevir.
  const grad = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.frustumCulled = false;
    const conv = (m) => {
      const t = new THREE.MeshToonMaterial({ map: m.map, color: m.color, gradientMap: grad, transparent: m.transparent, alphaTest: m.alphaTest, side: m.side, depthWrite: m.depthWrite, opacity: m.opacity });
      t.name = m.name; return t;
    };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
}

function retarget(srcRoot, srcClips, hero) {
  const mixer = new THREE.AnimationMixer(srcRoot);
  const pairs = [];
  for (const [sn, tn] of Object.entries(MAP)) {
    const s = srcRoot.getObjectByName(sn), t = hero.getObjectByName(tn);
    if (s && t) pairs.push({ s, t });
  }
  // hiyerarşi sırası: ebeveynler önce
  const depth = (o) => { let d = 0; while (o.parent) { d++; o = o.parent; } return d; };
  pairs.sort((a, b) => depth(a.t) - depth(b.t));
  const q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), v = new THREE.Vector3();
  // referans (T-poz) dünya dönüşleri
  const tpose = srcClips.find((c) => c.name === 'A_TPose');
  const act = mixer.clipAction(tpose); act.play(); mixer.setTime(0); srcRoot.updateMatrixWorld(true);
  hero.updateMatrixWorld(true);
  for (const p of pairs) {
    p.sRefInv = p.s.getWorldQuaternion(new THREE.Quaternion()).invert();
    p.tRef = p.t.getWorldQuaternion(new THREE.Quaternion());
    p.world = new THREE.Quaternion();
    p.parent = pairs.find((x) => x.t === p.t.parent);
    p.parentRest = p.t.parent.getWorldQuaternion(new THREE.Quaternion());
  }
  const hips = pairs[0];
  const srcHipY = hips.s.getWorldPosition(new THREE.Vector3()).y;
  const tgtHipY = hips.t.getWorldPosition(new THREE.Vector3()).y;
  const hipParentInv = new THREE.Matrix4().copy(hips.t.parent.matrixWorld).invert();
  const scale = tgtHipY / srcHipY;
  act.stop();
  const out = {};
  const FPS = 30;
  for (const clip of srcClips) {
    if (clip.name === 'A_TPose') continue;
    const a = mixer.clipAction(clip); a.play();
    const n = Math.max(2, Math.round(clip.duration * FPS) + 1);
    const times = new Float32Array(n);
    const rot = pairs.map(() => new Float32Array(n * 4));
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = Math.min(clip.duration, i / FPS); times[i] = t;
      mixer.setTime(t); srcRoot.updateMatrixWorld(true);
      pairs.forEach((p, k) => {
        p.s.getWorldQuaternion(q).multiply(p.sRefInv).multiply(p.tRef); // hedef dünya dönüşü
        p.world.copy(q);
        q2.copy(p.parent ? p.parent.world : p.parentRest).invert().multiply(q);
        if (i > 0) { const o = (i - 1) * 4, r = rot[k]; if (r[o] * q2.x + r[o + 1] * q2.y + r[o + 2] * q2.z + r[o + 3] * q2.w < 0) q2.set(-q2.x, -q2.y, -q2.z, -q2.w); }
        q2.toArray(rot[k], i * 4);
      });
      hips.s.getWorldPosition(v).multiplyScalar(scale).applyMatrix4(hipParentInv).toArray(pos, i * 3);
    }
    a.stop(); mixer.uncacheAction(clip);
    const tracks = pairs.map((p, k) => new THREE.QuaternionKeyframeTrack(p.t.name + '.quaternion', times, rot[k]));
    tracks.push(new THREE.VectorKeyframeTrack(hips.t.name + '.position', times, pos));
    out[clip.name] = new THREE.AnimationClip(clip.name, clip.duration, tracks);
  }
  return out;
}

function makeSword() {
  const g = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.95, 0.008).translate(0, 0.56, 0), new THREE.MeshStandardMaterial({ color: 0xdfe8f5, metalness: 0.9, roughness: 0.25 }));
  const pa = blade.geometry.attributes.position; // uç sivriltme
  for (let i = 0; i < pa.count; i++) if (pa.getY(i) > 1) pa.setX(i, pa.getX(i) > 0 ? 0.017 : 0.012), pa.setY(i, pa.getX(i) > 0.015 ? 1.0 : 1.06);
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 12).translate(0, 0.085, 0), new THREE.MeshStandardMaterial({ color: 0xc9a23a, metalness: 0.8, roughness: 0.4 }));
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.015, 0.24, 8).translate(0, -0.04, 0), new THREE.MeshStandardMaterial({ color: 0x1b1b2a, roughness: 0.8 }));
  g.add(blade, guard, grip); g.traverse((o) => { o.castShadow = true; });
  return g;
}

export async function loadHero(base = 'assets/models/') {
  const [vrm, a1, a2] = await Promise.all([load(base + 'hero.glb'), load(base + 'hero_anims1.glb'), load(base + 'hero_anims2.glb')]);
  const root = new THREE.Group(); root.name = 'hero';
  const model = vrm.scene; model.rotation.y = Math.PI; // VRM0 -Z'ye bakar
  root.add(model); toonify(model);
  root.updateMatrixWorld(true);
  const clips = { ...retarget(a1.scene, a1.animations, root), ...retarget(a2.scene, a2.animations, root) };
  // T-poz dinlenme durumuna dön
  const sword = makeSword();
  const hand = root.getObjectByName('J_Bip_R_Hand');
  sword.position.set(-0.07, -0.02, 0.02); sword.rotation.set(Math.PI / 2, 0, 0);
  hand.add(sword);
  const mixer = new THREE.AnimationMixer(root);
  // saç ve palto eteği için VRM yay kemikleri (dinlenme pozunda kurulmalı)
  const spring = new SpringBoneSystem(model, vrm.parser.json);
  return { root, model, clips, mixer, sword, spring, head: root.getObjectByName('J_Bip_C_Head') };
}
