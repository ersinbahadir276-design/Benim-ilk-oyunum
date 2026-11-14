// VRM 0.x "secondaryAnimation" yay kemikleri: saç ve palto eteği için ikincil hareket (Verlet).
// Algoritma VRM spesifikasyonundaki / UniVRM'deki SpringBone ile aynıdır:
//   kuyruk = kuyruk + (kuyruk - öncekiKuyruk)·(1 - sürtünme) + dinlenmeYönü·sertlik·dt + yerçekimi·dt
//   ardından kemik uzunluğuna sabitlenir ve küre çarpıştırıcılardan dışarı itilir.
// Veriler hero.glb içindeki VRM uzantısından okunur; ek dosya gerekmez.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _head = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
const MAX_DT = 1 / 30; // büyük kare atlamalarında patlamayı önlemek için alt adımlara bölünür

class Joint {
  constructor(bone, child, p) {
    this.bone = bone; this.p = p; // p: { stiffness, gravityPower, gravityDir, drag, radius, colliders }
    this.restQ = bone.quaternion.clone();
    this.restLocal = bone.matrix.clone();
    // kuyruğun kemik yerel uzayındaki konumu (yaprak kemikte 7 cm'lik sanal uç)
    this.localTail = child ? child.position.clone() : bone.position.clone().normalize().multiplyScalar(0.07);
    if (this.localTail.lengthSq() < 1e-10) this.localTail.set(0, -0.07, 0);
    this.axis = this.localTail.clone().normalize();
    this.tail = new THREE.Vector3(); this.prev = new THREE.Vector3(); this.len = 0;
  }
  reset() {
    const b = this.bone; b.quaternion.copy(this.restQ); b.updateMatrixWorld(true);
    this.tail.copy(this.localTail).applyMatrix4(b.matrixWorld); this.prev.copy(this.tail);
    this.len = _v.setFromMatrixPosition(b.matrixWorld).distanceTo(this.tail);
  }
  step(dt, colliders) {
    const b = this.bone, par = b.parent, p = this.p;
    _m.multiplyMatrices(par.matrixWorld, this.restLocal);
    const head = _head.setFromMatrixPosition(_m);
    // dinlenme yönü: ebeveynin şu anki dönüşü × kemiğin dinlenme dönüşü × kemik ekseni
    par.getWorldQuaternion(_q).multiply(this.restQ);
    const next = _v2.copy(this.tail).sub(this.prev).multiplyScalar(1 - p.drag).add(this.tail);
    next.addScaledVector(_v3.copy(this.axis).applyQuaternion(_q), p.stiffness * dt);
    next.addScaledVector(p.gravityDir, p.gravityPower * dt);
    // uzunluk sabitleme
    next.sub(head).normalize().multiplyScalar(this.len).add(head);
    // küre çarpıştırıcılar
    for (const c of colliders) {
      if (!p.colliders.has(c.group)) continue;
      const r = c.radius + p.radius, d = next.distanceTo(c.world);
      if (d < r && d > 1e-6) {
        next.sub(c.world).multiplyScalar(r / d).add(c.world);
        next.sub(head).normalize().multiplyScalar(this.len).add(head);
      }
    }
    this.prev.copy(this.tail); this.tail.copy(next);
    // kuyruğa bakacak yerel dönüşü hesapla
    const to = _v3.copy(next).applyMatrix4(_m.invert()).normalize();
    b.quaternion.copy(this.restQ).multiply(_q.setFromUnitVectors(this.axis, to));
    b.updateMatrixWorld(true);
  }
}

export class SpringBones {
  // json: gltf.parser.json, nodeOf: (nodeIndex) => Object3D
  constructor(json, nodeOf, extraColliders = []) {
    this.joints = []; this.colliders = []; this.enabled = true;
    const sa = json?.extensions?.VRM?.secondaryAnimation;
    if (!sa) return;
    (sa.colliderGroups || []).forEach((g, gi) => {
      const node = nodeOf(g.node);
      // VRM0 çarpıştırıcı ofsetleri Unity uzayında: glTF'e çevirmek için Z ters çevrilir
      for (const c of g.colliders) this.colliders.push({ group: gi, node, offset: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z), radius: c.radius, world: new THREE.Vector3() });
    });
    // VRM'de paltonun bacak çarpıştırıcısı yok: koşarken etek bacakların içinden geçmesin diye ek grup
    const extraGroup = (sa.colliderGroups || []).length;
    for (const c of extraColliders) this.colliders.push({ group: extraGroup, node: c.node, offset: c.offset.clone(), radius: c.radius, world: new THREE.Vector3() });
    for (const g of sa.boneGroups || []) {
      const cols = new Set(g.colliderGroups || []);
      const isCoat = g.bones.some((i) => /Skirt|Coat/i.test(nodeOf(i)?.name || ''));
      if (isCoat && extraColliders.length) cols.add(extraGroup);
      const gd = g.gravityDir || { x: 0, y: -1, z: 0 };
      const p = { stiffness: g.stiffiness ?? g.stiffness ?? 1, gravityPower: g.gravityPower ?? 0, gravityDir: new THREE.Vector3(gd.x, gd.y, gd.z).normalize(), drag: Math.min(1, Math.max(0, g.dragForce ?? 0.4)), radius: g.hitRadius ?? 0.02, colliders: cols };
      // sürtünmesiz (drag=0) gruplar sonsuza dek salınır; palto için hafif sönüm ekle
      if (p.drag < 0.15) p.drag = 0.15;
      const walk = (bone) => {
        const kids = bone.children.filter((c) => c.isBone);
        if (kids.length) for (const k of kids) { this.joints.push(new Joint(bone, k, p)); walk(k); }
        else this.joints.push(new Joint(bone, null, p));
      };
      for (const i of g.bones) { const b = nodeOf(i); if (b) walk(b); }
    }
  }
  // center: karakter kökü. Kökün hareketi (yürüme/dönme) kuyruklara (1 - inertia) oranında taşınır;
  // böylece depar sırasında saç başın üstünden ters dönmez (VRM 1.0'daki "center" uzayının karşılığı).
  setCenter(obj, inertia = 0.3) { this.center = obj; this.inertia = inertia; this.ready = false; }
  reset() { for (const j of this.joints) j.reset(); if (this.center) (this.prevC ||= new THREE.Matrix4()).copy(this.center.matrixWorld); }
  update(dt) {
    if (!this.enabled || !this.joints.length || !(dt > 0)) return;
    if (!this.ready) { this.reset(); this.ready = true; }
    else if (this.center) {
      const M = _m.copy(this.prevC).invert().premultiply(this.center.matrixWorld), w = 1 - this.inertia;
      for (const j of this.joints) {
        j.tail.lerp(_v.copy(j.tail).applyMatrix4(M), w); j.prev.lerp(_v.copy(j.prev).applyMatrix4(M), w);
      }
      this.prevC.copy(this.center.matrixWorld);
    }
    const n = Math.min(4, Math.ceil(dt / MAX_DT)), h = dt / n;
    for (let s = 0; s < n; s++) {
      for (const c of this.colliders) c.world.copy(c.offset).applyMatrix4(c.node.matrixWorld);
      for (const j of this.joints) j.step(h, this.colliders);
    }
  }
}
