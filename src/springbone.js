// VRM 0.x "secondaryAnimation" yay kemikleri (saç, ceket eteği) için hafif fizik.
// UniVRM'in Verlet tabanlı algoritmasının sadeleştirilmiş JS uygulaması; harici bağımlılık yok.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _m = new THREE.Matrix4(), _s = new THREE.Vector3();
const STEP = 1 / 60; // sabit adım: kare hızından bağımsız, kararlı sonuç
// Benzetim karakter köküne göre yapılır (UniVRM "center"): koşu/dönüş hızı saçı 180° savurmaz.
// Hızın etkisi yerine hava akımı terimi eklenir: saç ve etek koşarken geriye doğru açılır.
const WIND = 0.05;
// Oyun ayarı: VRoid değerleri sakin sahneler içindir; depar sırasındaki kalça sarsıntısında (≈2.5 g)
// yerçekimsiz/sönümsüz ceket ters döner. Sertlik artırılır, en az sönüm verilir ve açı sınırlanır.
const TUNE = { stiffness: 2, minDrag: 0.25, cloth: { gravity: 0.35, maxAngle: 70 }, hair: { gravity: 0, maxAngle: 80 } };
const _m2 = new THREE.Matrix4(), _p = new THREE.Vector3();

class Joint {
  constructor(bone, child, group) {
    this.bone = bone; this.g = group;
    this.restRot = bone.quaternion.clone();
    bone.updateWorldMatrix(true, true);
    if (child) this.axis = child.position.clone();
    else { // uç kemik: ebeveyn yönünde 7 cm sanal kuyruk (UniVRM ile aynı)
      const lp = bone.position.clone();
      this.axis = lp.lengthSq() > 1e-10 ? lp.normalize().multiplyScalar(0.07) : new THREE.Vector3(0, 0.07, 0);
    }
    this.localLen = this.axis.length();
    this.axis.normalize();
    this.tail = bone.localToWorld(this.axis.clone().multiplyScalar(this.localLen));
    this.prev = this.tail.clone();
  }
  worldLen() { this.bone.matrixWorld.decompose(_v, _q, _s); return this.localLen * _s.x; }
  reset() {
    this.bone.quaternion.copy(this.restRot); this.bone.updateMatrixWorld(true);
    this.bone.localToWorld(this.tail.copy(this.axis).multiplyScalar(this.localLen)); this.prev.copy(this.tail);
  }
}

export class SpringBones {
  /** gltf: GLTFLoader sonucu (parser.json.extensions.VRM içermeli) */
  constructor(gltf) {
    this.root = gltf.scene; this.lastCenter = null; this.vel = new THREE.Vector3(); this.lastPos = new THREE.Vector3(); this.joints = []; this.colliders = []; this.enabled = true; this.acc = 0;
    const ext = gltf.parser.json.extensions?.VRM?.secondaryAnimation; if (!ext) return;
    const byIndex = new Map();
    gltf.scene.traverse((o) => { const a = gltf.parser.associations.get(o); if (a && a.nodes !== undefined && !o.isMesh) byIndex.set(a.nodes, o); });
    const groups = (ext.colliderGroups || []).map((cg) => {
      const node = byIndex.get(cg.node); if (!node) return [];
      // VRM0 ofsetleri Unity eksenlerinde: Z ters çevrilir
      return cg.colliders.map((c) => { const col = { node, offset: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z), radius: c.radius, world: new THREE.Vector3(), r: c.radius }; this.colliders.push(col); return col; });
    });
    const seen = new Set();
    for (const bg of ext.boneGroups || []) {
      const group = {
        stiffness: bg.stiffiness ?? 1, gravity: bg.gravityPower ?? 0, drag: bg.dragForce ?? 0.4, hitRadius: bg.hitRadius ?? 0.02,
        gravityDir: new THREE.Vector3(bg.gravityDir?.x ?? 0, bg.gravityDir?.y ?? -1, -(bg.gravityDir?.z ?? 0)).normalize(),
        colliders: (bg.colliderGroups || []).flatMap((i) => groups[i] || []), name: bg.comment || 'hair',
      };
      const isCloth = (bg.bones || []).some((i) => /Skirt|Coat|Cloth|Bust/i.test(byIndex.get(i)?.name || '')), t = isCloth ? TUNE.cloth : TUNE.hair;
      group.kind = isCloth ? 'cloth' : 'hair';
      group.stiffness *= TUNE.stiffness; group.drag = Math.max(group.drag, TUNE.minDrag); group.gravity = Math.max(group.gravity, t.gravity);
      group.cosMax = Math.cos(t.maxAngle * Math.PI / 180); group.sinMax = Math.sin(t.maxAngle * Math.PI / 180);
      for (const bi of bg.bones || []) {
        const root = byIndex.get(bi); if (!root) continue;
        const walk = (b) => {
          if (seen.has(b)) return; seen.add(b);
          const kids = b.children.filter((c) => !c.isMesh);
          this.joints.push(new Joint(b, kids[0], group));
          for (const k of kids) walk(k);
        };
        walk(root);
      }
    }
    const depth = (o) => { let d = 0; while (o.parent) { d++; o = o.parent; } return d; };
    this.joints.sort((a, b) => depth(a.bone) - depth(b.bone)); // ebeveynler önce
  }
  get count() { return this.joints.length; }
  reset() {
    this.root.updateWorldMatrix(true, true); for (const j of this.joints) j.reset(); this.acc = 0;
    this.lastCenter = this.root.matrixWorld.clone(); this.lastPos.setFromMatrixPosition(this.lastCenter); this.vel.set(0, 0, 0);
  }
  /** Animasyon karıştırıcısından ve kök konumlandırmadan SONRA çağrılmalı. */
  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    this.root.updateWorldMatrix(true, true);
    if (!this.lastCenter) this.reset();
    // kuyrukları kökün bu karedeki hareketiyle birlikte taşı
    _m.copy(this.root.matrixWorld).multiply(_m2.copy(this.lastCenter).invert());
    for (const j of this.joints) { j.tail.applyMatrix4(_m); j.prev.applyMatrix4(_m); }
    this.lastCenter.copy(this.root.matrixWorld);
    _p.setFromMatrixPosition(this.lastCenter);
    if (dt > 0) this.vel.lerp(_v.copy(_p).sub(this.lastPos).divideScalar(dt), Math.min(1, dt * 8));
    this.lastPos.copy(_p);
    this.acc = Math.min(this.acc + dt, STEP * 4); // donmalardan sonra patlamayı önle
    if (this.acc < STEP) { this.apply(); return; }
    while (this.acc >= STEP) { this.acc -= STEP; this.step(STEP); }
  }
  step(dt) {
    for (const c of this.colliders) { c.world.copy(c.offset).applyMatrix4(c.node.matrixWorld); c.node.matrixWorld.decompose(_v, _q, _s); c.r = c.radius * _s.x; }
    for (const j of this.joints) {
      const b = j.bone, g = j.g, p = b.parent;
      b.quaternion.copy(j.restRot); b.updateMatrixWorld(false);
      const head = _c.setFromMatrixPosition(b.matrixWorld);
      const len = j.worldLen();
      // kemiğin dinlenme yönü (ebeveyn dönüşü × başlangıç yerel dönüşü)
      p.getWorldQuaternion(_q2); _q2.multiply(j.restRot);
      const restDir = _w.copy(j.axis).applyQuaternion(_q2);
      // Verlet: atalet + sertlik + yerçekimi
      const next = _v.copy(j.tail).sub(j.prev).multiplyScalar(1 - g.drag).add(j.tail)
        .addScaledVector(restDir, g.stiffness * dt).addScaledVector(g.gravityDir, g.gravity * dt).addScaledVector(this.vel, -WIND * dt);
      next.sub(head).normalize();
      const cos = next.dot(restDir);
      if (cos < g.cosMax) { // açı sınırı: dinlenme yönü etrafında koni
        next.addScaledVector(restDir, -cos); if (next.lengthSq() < 1e-10) next.set(restDir.y, -restDir.x, 0).cross(restDir);
        next.normalize().multiplyScalar(g.sinMax).addScaledVector(restDir, g.cosMax);
      }
      next.multiplyScalar(len).add(head);
      for (const c of g.colliders) { // küre çarpıştırıcılarından it
        const rr = c.r + g.hitRadius * _s.x, d = next.distanceTo(c.world);
        if (d < rr && d > 1e-6) { next.sub(c.world).multiplyScalar(rr / d).add(c.world); next.sub(head).normalize().multiplyScalar(len).add(head); }
      }
      if (!Number.isFinite(next.x + next.y + next.z)) { j.reset(); continue; }
      j.prev.copy(j.tail); j.tail.copy(next);
      this.orient(j, head, _q2);
    }
  }
  apply() { // ara karelerde yalnızca son kuyruk konumlarına göre yönlendir
    this.root.updateWorldMatrix(true, true);
    for (const j of this.joints) {
      j.bone.quaternion.copy(j.restRot); j.bone.updateMatrixWorld(false);
      j.bone.parent.getWorldQuaternion(_q2); _q2.multiply(j.restRot);
      this.orient(j, _c.setFromMatrixPosition(j.bone.matrixWorld), _q2);
    }
  }
  orient(j, head, restWorldQ) {
    const to = _w.copy(j.tail).sub(head).applyQuaternion(_q.copy(restWorldQ).invert()).normalize();
    _q.setFromUnitVectors(j.axis, to);
    j.bone.quaternion.copy(j.restRot).multiply(_q);
    j.bone.updateMatrixWorld(true);
  }
}
