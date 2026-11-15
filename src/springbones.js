// VRM 0.x "secondaryAnimation" yay kemikleri: saç ve palto eteği fiziği.
// Model dosyasındaki kemik grupları (sertlik, yerçekimi, sürtünme, çarpışma yarıçapı) ve çarpıştırıcı küreleri
// olduğu gibi okunur; çözüm three-vrm'in Verlet yaklaşımıyla aynıdır. Animasyon klipleri bu kemiklere dokunmaz.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4(), _mi = new THREE.Matrix4(), _s = new THREE.Vector3();
const _id = new THREE.Quaternion();
const LEAF_TAIL = 0.07; // VRM0: çocuğu olmayan kemiğin sanal kuyruk uzunluğu

class Joint {
  constructor(bone, child, set) {
    this.bone = bone; this.set = set; // set: { stiffness, gravityPower, gravityDir, dragForce, hitRadius, colliders }
    this.initQ = bone.quaternion.clone();
    this.initM = new THREE.Matrix4().compose(bone.position, bone.quaternion, bone.scale);
    // kuyruğun kemik-yerel konumu
    const local = child ? child.position.clone() : bone.position.clone().normalize().multiplyScalar(LEAF_TAIL);
    if (local.lengthSq() < 1e-10) local.set(0, LEAF_TAIL, 0);
    this.axis = local.clone().normalize();
    this.localTail = local;
    this.tail = new THREE.Vector3(); this.prev = new THREE.Vector3(); this.len = 0;
    this.reset();
  }
  reset() {
    const b = this.bone; b.quaternion.copy(this.initQ); b.updateMatrixWorld(true);
    this.tail.copy(this.localTail).applyMatrix4(b.matrixWorld); this.prev.copy(this.tail);
    this.len = this.tail.distanceTo(_v.setFromMatrixPosition(b.matrixWorld));
  }
  update(dt) {
    const b = this.bone, s = this.set, parentW = b.parent.matrixWorld;
    // dinlenme pozundaki kemik çerçevesi (ebeveyn şu anki haliyle)
    _m.multiplyMatrices(parentW, this.initM);
    const head = _v.setFromMatrixPosition(b.matrixWorld);
    _m.decompose(_v2, _q, _s);
    const axisW = _v2.copy(this.axis).applyQuaternion(_q); // dünya uzayında dinlenme ekseni
    // Verlet: eylemsizlik + sertlik (dinlenme yönüne çekiş) + yerçekimi
    const next = new THREE.Vector3().subVectors(this.tail, this.prev).multiplyScalar(1 - s.dragForce).add(this.tail)
      .addScaledVector(axisW, s.stiffness * dt).addScaledVector(s.gravityDir, s.gravityPower * dt);
    next.sub(head).normalize().multiplyScalar(this.len).add(head);
    // çarpışma: kuyruğu çarpıştırıcı kürelerin dışına it
    for (const c of s.colliders) {
      const r = s.hitRadius + (c.rWorld ?? c.r), d = next.distanceTo(c.w);
      if (d < r && d > 1e-6) { next.sub(c.w).multiplyScalar(r / d).add(c.w); next.sub(head).normalize().multiplyScalar(this.len).add(head); }
    }
    // kuyruğu dinlenme çerçevesine taşı, eksenden kuyruğa dönüşü bul
    const to = _v2.copy(next).applyMatrix4(_mi.copy(_m).invert()).normalize();
    _q.setFromUnitVectors(this.axis, to);
    // salınım konisi: kumaş/saç gövdenin içinden dolanıp ters dönmesin
    const ang = 2 * Math.acos(Math.min(1, Math.abs(_q.w)));
    if (ang > s.maxAngle) {
      _q2.copy(_id).slerp(_q, s.maxAngle / ang); _q.copy(_q2);
      next.copy(this.axis).applyQuaternion(_q).multiplyScalar(this.localTail.length()).applyMatrix4(_m);
      next.sub(head).normalize().multiplyScalar(this.len).add(head);
    }
    this.prev.copy(this.tail); this.tail.copy(next);
    b.quaternion.copy(this.initQ).multiply(_q);
    b.updateMatrixWorld(true);
  }
}

export class SpringBones {
  constructor(root, json, nodeOf, extraColliders = []) {
    this.root = root; this.joints = []; this.colliderGroups = []; this.enabled = true; this.lastPos = new THREE.Vector3();
    const sa = json?.extensions?.VRM?.secondaryAnimation; if (!sa) return;
    for (const g of sa.colliderGroups || []) {
      const node = nodeOf(g.node); if (!node) { this.colliderGroups.push([]); continue; }
      this.colliderGroups.push(g.colliders.map((c) => ({ node, off: new THREE.Vector3(c.offset.x, c.offset.y, c.offset.z), r: c.radius, w: new THREE.Vector3() })));
    }
    this.extra = extraColliders.map((c) => ({ ...c, w: new THREE.Vector3() }));
    this.allColliders = [...this.colliderGroups.flat(), ...this.extra];
    for (const g of sa.boneGroups || []) {
      const gd = g.gravityDir || { x: 0, y: -1, z: 0 };
      const set = {
        stiffness: g.stiffiness ?? g.stiffness ?? 1, gravityPower: g.gravityPower || 0, dragForce: g.dragForce ?? 0.4, hitRadius: g.hitRadius || 0.02,
        gravityDir: new THREE.Vector3(gd.x, gd.y, gd.z).normalize(),
        colliders: [...(g.colliderGroups || []).flatMap((i) => this.colliderGroups[i] || [])],
        maxAngle: 1.2,
      };
      // palto eteği için model grup tanımında çarpıştırıcı yok: bacaklara kendi kürelerimizi ekle (eteğin bacaktan geçmesini önler)
      if (g.comment === 'TopsUpperArm' || !set.colliders.length) set.colliders.push(...this.extra);
      // eteğin koşarken yukarı uçmasını engellemek için hafif yerçekimi
      // Modelde eteğin sürtünmesi 0 (hiç sönüm yok): koşarken enerji birikip kumaş ters döner. Sönüm ve hafif yerçekimi ekle.
      if (/Skirt/.test(nodeOf(g.bones[0])?.name || '')) { set.gravityPower = Math.max(set.gravityPower, 0.3); set.dragForce = Math.max(set.dragForce, 0.45); set.maxAngle = 0.95; }
      const walk = (bone) => {
        const kids = bone.children.filter((c) => c.isBone || c.type === 'Bone' || c.type === 'Object3D');
        this.joints.push(new Joint(bone, kids[0] || null, set));
        kids.forEach(walk);
      };
      for (const bi of g.bones) { const b = nodeOf(bi); if (b) walk(b); }
    }
    root.updateMatrixWorld(true); root.getWorldPosition(this.lastPos);
  }
  get count() { return this.joints.length; }
  reset() { this.root.updateMatrixWorld(true); this.joints.forEach((j) => j.reset()); this.root.getWorldPosition(this.lastPos); }
  // Animasyon karıştırıcısından ve kök dönüşümünden SONRA çağrılmalı.
  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    this.root.updateMatrixWorld(true);
    // ışınlanma/yeniden doğma: zinciri sıfırla, yoksa saç sahne boyunca savrulur
    const p = this.root.getWorldPosition(_v);
    const jumped = p.distanceTo(this.lastPos) > 3; this.lastPos.copy(p);
    if (jumped) { this.reset(); return; }
    for (const c of this.allColliders) {
      const sc = c.node.getWorldScale(_s).x;
      c.w.copy(c.off).applyMatrix4(c.node.matrixWorld); c.rWorld = c.r * sc;
    }
    // sabit adımlarla çöz: düşük kare hızında (Android) bile kararlı kalsın
    const step = 1 / 60; let t = Math.min(dt, 0.1);
    while (t > 1e-4) { const h = Math.min(step, t); for (const j of this.joints) j.update(h); t -= h; }
  }
}

// Kahramanın düğüm indisi → Object3D eşlemesi ve bacak çarpıştırıcıları ile kurulum.
export function createHeroSprings(root, gltf) {
  const byIndex = new Map();
  gltf.scene.traverse((o) => { const a = gltf.parser.associations.get(o); if (a && a.nodes !== undefined && !byIndex.has(a.nodes)) byIndex.set(a.nodes, o); });
  const nodeOf = (i) => byIndex.get(i);
  const legs = [];
  for (const S of ['L', 'R']) {
    const up = root.getObjectByName(`J_Bip_${S}_UpperLeg`), lo = root.getObjectByName(`J_Bip_${S}_LowerLeg`);
    if (!up || !lo) continue;
    const knee = lo.position.clone();
    for (const f of [0.15, 0.5, 0.85]) legs.push({ node: up, off: knee.clone().multiplyScalar(f), r: 0.085 - f * 0.02 });
    legs.push({ node: lo, off: new THREE.Vector3(0, 0, 0), r: 0.06 });
  }
  return new SpringBones(root, gltf.parser.json, nodeOf, legs);
}
