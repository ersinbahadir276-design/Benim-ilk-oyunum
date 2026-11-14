// VRM 0.x eklentileri: saç/ceket yay kemikleri (secondaryAnimation) ve yüz ifadeleri (blendShapeMaster).
// @pixiv/three-vrm kullanmadan, UniVRM'in VRMSpringBone mantığının sade bir uyarlaması.
import * as THREE from 'three';

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _m1 = new THREE.Matrix4();

class Joint {
  constructor(bone, child, g, center) {
    this.bone = bone; this.child = child; this.g = g; this.center = center;
    this.initLocalRot = bone.quaternion.clone();
    this.boneAxis = child.position.clone().normalize();
    bone.updateMatrixWorld(true);
    this.length = bone.getWorldPosition(_v1).distanceTo(child.getWorldPosition(_v2));
    this.tail = new THREE.Vector3(); this.prevTail = new THREE.Vector3();
    this.reset();
  }
  // kuyruk konumları merkez (Root) uzayında tutulur: oyuncu hızla koşunca saç savrulup kopmasın
  toCenter(v) { return v.applyMatrix4(_m1.copy(this.center.matrixWorld).invert()); }
  fromCenter(v) { return v.applyMatrix4(this.center.matrixWorld); }
  reset() {
    this.bone.quaternion.copy(this.initLocalRot); this.bone.updateMatrixWorld(true);
    this.toCenter(this.child.getWorldPosition(this.tail)); this.prevTail.copy(this.tail);
  }
  step(dt, colliders) {
    const { bone, g } = this;
    const parentRot = bone.parent.getWorldQuaternion(_q1);
    const pos = bone.getWorldPosition(_v3);
    const cur = this.fromCenter(_v1.copy(this.tail)), prev = this.fromCenter(_v2.copy(this.prevTail));
    // atalet + sertlik (dinlenme yönüne çekme) + yerçekimi
    const next = cur.clone().addScaledVector(prev.sub(cur).negate(), 1 - g.drag);
    const restDir = this.boneAxis.clone().applyQuaternion(_q2.copy(parentRot).multiply(this.initLocalRot));
    next.addScaledVector(restDir, g.stiffness * dt).addScaledVector(g.gravityDir, g.gravityPower * dt);
    next.sub(pos).setLength(this.length).add(pos);
    for (const c of colliders) {
      const r = g.hitRadius + c.radius, d = next.distanceTo(c.pos);
      if (d < r) { next.sub(c.pos).setLength(r).add(c.pos).sub(pos).setLength(this.length).add(pos); }
    }
    this.prevTail.copy(this.tail); this.tail.copy(this.toCenter(next.clone()));
    // kemiği yeni kuyruk yönüne döndür
    const want = next.sub(pos).applyQuaternion(_q2.copy(parentRot).multiply(this.initLocalRot).invert()).normalize();
    bone.quaternion.copy(this.initLocalRot).multiply(_q2.setFromUnitVectors(this.boneAxis, want));
    bone.updateMatrixWorld(true);
  }
}

export class SpringBones {
  constructor(joints, colliders) { this.joints = joints; this.colliders = colliders; this.acc = 0; this.enabled = true; }
  reset() { for (const j of this.joints) j.reset(); }
  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    for (const c of this.colliders) { c.pos.copy(c.offset).applyMatrix4(c.node.matrixWorld); c.radius = c.r * c.node.getWorldScale(_v1).x; }
    // sabit 60 Hz adımlar: düşük FPS'li telefonlarda da kararlı; çok uzun karelerde (sekme arka plandaydı) sıfırla
    if (dt > 0.25) { this.reset(); this.acc = 0; return; }
    this.acc += dt; let n = 0;
    while (this.acc >= 1 / 60 && n < 4) { this.acc -= 1 / 60; n++; for (const j of this.joints) j.step(1 / 60, j.colliders); }
    if (n === 4) this.acc = 0;
  }
}

async function node(parser, i) { return parser.getDependency('node', i); }

export async function buildSpringBones(gltf) {
  const vrm = gltf.parser.json.extensions?.VRM, sa = vrm?.secondaryAnimation;
  if (!sa) return new SpringBones([], []);
  const groupColliders = [];
  for (const cg of sa.colliderGroups || []) {
    const n = await node(gltf.parser, cg.node);
    // VRM0 ofsetleri Unity uzayında (ters Z): z'yi çevir
    groupColliders.push(cg.colliders.map((c) => ({ node: n, offset: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z), r: c.radius, radius: c.radius, pos: new THREE.Vector3() })));
  }
  const joints = [], allColliders = new Set();
  gltf.scene.updateMatrixWorld(true);
  for (const bg of sa.boneGroups || []) {
    const center = bg.center >= 0 ? await node(gltf.parser, bg.center) : gltf.scene;
    const gd = bg.gravityDir || { x: 0, y: -1, z: 0 };
    const g = { stiffness: bg.stiffiness ?? 1, drag: bg.dragForce ?? 0.4, gravityPower: bg.gravityPower ?? 0, gravityDir: new THREE.Vector3(gd.x, gd.y, -gd.z).normalize(), hitRadius: bg.hitRadius ?? 0.02 };
    const colliders = (bg.colliderGroups || []).flatMap((i) => groupColliders[i] || []);
    colliders.forEach((c) => allColliders.add(c));
    const walk = (b) => { for (const c of b.children) { if (c.isMesh) continue; joints.push(Object.assign(new Joint(b, c, g, center), { colliders })); walk(c); } };
    for (const bi of bg.bones) walk(await node(gltf.parser, bi));
  }
  // her eklem yalnızca kendi grubunun çarpıştırıcılarıyla çarpışır (j.colliders)
  const sb = new SpringBones(joints, [...allColliders]);
  return sb;
}

// Yüz ifadeleri: göz kırpma + duruma göre ifade (öfke, acı, sevinç...).
export class Expressions {
  constructor(groups) { this.groups = groups; this.weights = {}; this.target = {}; this.blinkT = 2 + Math.random() * 3; this.blink = 0; this.mood = null; this.moodT = 0; }
  has(name) { return !!this.groups[name]; }
  set(name, w) {
    const g = this.groups[name]; if (!g) return;
    for (const b of g) for (const m of b.meshes) if (m.morphTargetInfluences) m.morphTargetInfluences[b.index] = (b.weight / 100) * w;
    this.weights[name] = w;
  }
  // kısa süreli ifade: say('angry', 0.6)
  say(mood, time = 0.8) { if (!this.has(mood)) return; this.mood = mood; this.moodT = time; }
  update(dt, persistent = null) {
    this.moodT -= dt;
    const want = this.moodT > 0 ? this.mood : persistent;
    for (const n of ['angry', 'sorrow', 'joy', 'fun', 'surprised']) {
      const cur = this.weights[n] || 0, tgt = n === want ? 1 : 0;
      if (cur !== tgt || tgt) this.set(n, cur + (tgt - cur) * Math.min(1, dt * 10));
    }
    // göz kırpma (ifade gözleri zaten kısıyorsa kırpma yarım)
    this.blinkT -= dt;
    if (this.blinkT <= 0) { this.blink += dt / 0.07; if (this.blink >= 2) { this.blink = 0; this.blinkT = 1.8 + Math.random() * 4; } }
    const closed = want === 'dead' ? 1 : this.blink > 0 ? 1 - Math.abs(1 - this.blink) : 0;
    const damp = want && want !== 'dead' ? 0.4 : 1;
    this.set('blink', closed * damp);
  }
}

export async function buildExpressions(gltf) {
  const vrm = gltf.parser.json.extensions?.VRM, bsm = vrm?.blendShapeMaster;
  const groups = {};
  if (!bsm) return new Expressions(groups);
  const meshCache = {};
  for (const bg of bsm.blendShapeGroups || []) {
    const key = (bg.presetName && bg.presetName !== 'unknown' ? bg.presetName : bg.name).toLowerCase();
    groups[key] = [];
    for (const b of bg.binds || []) {
      if (!(b.mesh in meshCache)) {
        const m = await gltf.parser.getDependency('mesh', b.mesh); const list = [];
        // yükleyici sahnede kopya üretebilir: sahnedeki gerçek örnekleri ada göre bul
        const names = new Set(); (m.isMesh ? [m] : m.children).forEach((c) => names.add(c.name));
        gltf.scene.traverse((o) => { if (o.isMesh && o.morphTargetInfluences && names.has(o.name)) list.push(o); });
        meshCache[b.mesh] = list;
      }
      groups[key].push({ meshes: meshCache[b.mesh], index: b.index, weight: b.weight });
    }
  }
  return new Expressions(groups);
}
