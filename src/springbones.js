// VRM 0.x "secondaryAnimation" yay kemikleri (saç, ceket eteği) — UniVRM SpringBone algoritmasının sade bir uyarlaması.
// Her kemik zinciri Verlet integrasyonuyla kuyruk ucunu takip eder; sertlik dinlenme yönüne çeker,
// sürükleme ataleti söndürür, küre çarpıştırıcılar (kafa, gövde, kollar, bacaklar) içinden geçmeyi önler.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _m = new THREE.Matrix4(), _qI = new THREE.Quaternion();

class Joint {
  constructor(bone, tailLocal, group, center) {
    this.bone = bone; this.g = group; this.center = center;
    this.initRot = bone.quaternion.clone();
    this.axis = tailLocal.clone().normalize();
    bone.updateMatrixWorld(true);
    const wTail = tailLocal.clone().applyMatrix4(bone.matrixWorld);
    this.length = bone.getWorldPosition(_v).distanceTo(wTail);
    this.tailLocal = tailLocal;
    this.cur = new THREE.Vector3(); this.prev = new THREE.Vector3();
    this._pos = new THREE.Vector3(); this._wc = new THREE.Vector3(); this._wp = new THREE.Vector3(); this._next = new THREE.Vector3();
    this.reset();
  }
  // kuyruğu dinlenme konumuna geri koy (ışınlanma, yeniden doğma)
  reset() {
    this.bone.quaternion.copy(this.initRot); this.bone.updateMatrixWorld(true);
    const w = _v.copy(this.tailLocal).applyMatrix4(this.bone.matrixWorld);
    this.toCenter(w, this.cur); this.prev.copy(this.cur);
  }
  toCenter(w, out) { return this.center ? out.copy(w).applyMatrix4(_m.copy(this.center.matrixWorld).invert()) : out.copy(w); }
  toWorld(c, out) { return this.center ? out.copy(c).applyMatrix4(this.center.matrixWorld) : out.copy(c); }
  update(dt, colliders) {
    const b = this.bone, g = this.g;
    // matrisler güncel varsayılır: çağıran kökü güncelledi, ebeveyn zincir halkaları önce işlendi
    const pos = this._pos.setFromMatrixPosition(b.matrixWorld);
    const parentRot = b.parent.getWorldQuaternion(this._pq || (this._pq = new THREE.Quaternion()));
    const cur = this.toWorld(this.cur, this._wc), prev = this.toWorld(this.prev, this._wp);
    // Verlet: atalet + sertlik + yerçekimi
    const next = this._next.copy(cur).add(_v.subVectors(cur, prev).multiplyScalar(1 - g.drag));
    next.add(_v.copy(this.axis).applyQuaternion(_q2.copy(parentRot).multiply(this.initRot)).multiplyScalar(g.stiffness * dt));
    next.add(_v.copy(g.gravityDir).multiplyScalar(g.gravity * dt));
    next.sub(pos).normalize().multiplyScalar(this.length).add(pos);
    // çarpışma: kuyruk küre içine girdiyse yüzeye it
    for (const c of colliders) {
      const r = g.hitRadius + c.radius, d2 = next.distanceToSquared(c.world);
      if (d2 < r * r) {
        next.sub(c.world).normalize().multiplyScalar(r).add(c.world);
        next.sub(pos).normalize().multiplyScalar(this.length).add(pos);
      }
    }
    // açı sınırı: dinlenme yönünden en fazla maxAngle sap (koşuda saç/etek ters dönmesin)
    const rest = _v.copy(this.axis).applyQuaternion(_q2.copy(parentRot).multiply(this.initRot));
    const dir = _v2.subVectors(next, pos).divideScalar(this.length);
    const ang = Math.acos(Math.max(-1, Math.min(1, rest.dot(dir))));
    if (ang > g.maxAngle) {
      _q.slerpQuaternions(_qI, _q.setFromUnitVectors(rest, dir), g.maxAngle / ang);
      next.copy(rest).applyQuaternion(_q).multiplyScalar(this.length).add(pos);
    }
    this.toCenter(cur, this.prev); this.toCenter(next, this.cur);
    // dönüş: dinlenme ekseninden yeni kuyruk yönüne
    const to = _v2.subVectors(next, pos).applyQuaternion(_q2.copy(parentRot).multiply(this.initRot).invert()).normalize();
    b.quaternion.copy(this.initRot).multiply(_q.setFromUnitVectors(this.axis, to));
    b.updateMatrixWorld(true);
  }
}

export class SpringBones {
  constructor() { this.joints = []; this.groups = []; this.colliderGroups = []; this.enabled = true; }

  // gltf: GLTFLoader sonucu (VRM 0.x uzantısı parser.json içinde okunur)
  static fromGLTF(gltf) {
    const sb = new SpringBones();
    const ext = gltf.parser.json.extensions?.VRM?.secondaryAnimation;
    if (!ext) return sb;
    const byIndex = new Map();
    gltf.scene.traverse((o) => { const a = gltf.parser.associations.get(o); if (a && a.nodes !== undefined && !byIndex.has(a.nodes)) byIndex.set(a.nodes, o); });
    // ofsetler düğümün yerel uzayında; UniVRM dışa aktarımı Z dönüşümünü zaten uyguluyor (dinlenme pozunda en az iç içe geçme bu şekilde)
    sb.colliderGroups = (ext.colliderGroups || []).map((cg) => ({
      node: byIndex.get(cg.node),
      spheres: cg.colliders.map((c) => ({ offset: new THREE.Vector3(c.offset.x, c.offset.y, c.offset.z), radius: c.radius, world: new THREE.Vector3() })),
    })).filter((cg) => cg.node);
    gltf.scene.updateMatrixWorld(true);
    (ext.boneGroups || []).forEach((bg, gi) => {
      const g = {
        name: bg.comment || 'grup' + gi, stiffness: bg.stiffiness ?? 1, gravity: bg.gravityPower ?? 0, drag: bg.dragForce ?? 0.4,
        gravityDir: new THREE.Vector3(bg.gravityDir?.x ?? 0, bg.gravityDir?.y ?? -1, bg.gravityDir?.z ?? 0),
        hitRadius: bg.hitRadius ?? 0.02,
        // VRM0'da yok; uç durumlarda (depar, takla) zincirin ters dönmesini önleyen güvenlik sınırı
        maxAngle: /skirt|upperarm/i.test(bg.comment || '') ? 1.2 : 1.0,
        colliders: (bg.colliderGroups || []).map((i) => sb.colliderGroups[i]).filter(Boolean),
        center: bg.center >= 0 ? byIndex.get(bg.center) : null,
        joints: [],
      };
      g.spheres = g.colliders.flatMap((c) => c.spheres);
      const walk = (bone) => {
        const kids = bone.children;
        // kuyruk: ilk çocuk; yaprak kemikte UniVRM gibi 7 cm uzatılmış sanal uç
        const tail = kids.length ? kids[0].position.clone()
          : bone.position.clone().normalize().multiplyScalar(0.07 / Math.max(1e-6, bone.getWorldScale(_v).x));
        if (tail.lengthSq() > 1e-10) g.joints.push(new Joint(bone, tail, g, g.center));
        for (const k of kids) walk(k);
      };
      for (const bi of bg.bones || []) { const b = byIndex.get(bi); if (b) walk(b); }
      sb.groups.push(g); sb.joints.push(...g.joints);
    });
    return sb;
  }

  reset() { for (const j of this.joints) j.reset(); }

  // root: karakterin kök nesnesi; animasyon ve konum uygulandıktan sonra çağrılmalı
  update(dt, root) {
    if (!this.enabled || !this.joints.length) return;
    root.updateMatrixWorld(true);
    // değişken kare süresinde kararlı kalsın: 1/60'lık alt adımlar, en fazla 4
    dt = Math.min(dt, 1 / 15);
    const steps = Math.max(1, Math.min(4, Math.ceil(dt * 60))), h = dt / steps;
    for (let s = 0; s < steps; s++) {
      for (const cg of this.colliderGroups) {
        for (const sp of cg.spheres) sp.world.copy(sp.offset).applyMatrix4(cg.node.matrixWorld);
      }
      for (const g of this.groups) for (const j of g.joints) j.update(h, g.spheres);
    }
  }
}
