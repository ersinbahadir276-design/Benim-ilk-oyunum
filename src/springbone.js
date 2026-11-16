// VRM 0.x "secondaryAnimation" yay kemikleri (saç, ceket eteği) — UniVRM'in VRMSpringBone algoritmasının sade bir uyarlaması.
// GLB'deki VRM uzantısını okur; her kemik ucunu Verlet integrasyonuyla sallar, küre çarpıştırıcılarla gövdeye girmesini engeller.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3();

class Joint {
  constructor(bone, child, settings) {
    this.bone = bone; this.s = settings;
    this.initLocalRot = bone.quaternion.clone();
    bone.updateMatrixWorld(true);
    let localTail;
    if (child) localTail = child.position.clone();
    else {
      // uç kemik: ebeveyn→kemik yönünde 7 cm sanal uç (UniVRM ile aynı)
      const wp = bone.getWorldPosition(new THREE.Vector3()), pp = bone.parent.getWorldPosition(new THREE.Vector3());
      const tailW = wp.clone().add(wp.clone().sub(pp).normalize().multiplyScalar(0.07));
      localTail = bone.worldToLocal(tailW);
    }
    this.boneAxis = localTail.clone().normalize();
    this.localTail = localTail;
    this.curTail = new THREE.Vector3(); this.prevTail = new THREE.Vector3();
    this.length = 0;
    this.reset();
  }
  reset() {
    const b = this.bone; b.quaternion.copy(this.initLocalRot); b.updateMatrixWorld(true);
    this.curTail.copy(this.localTail).applyMatrix4(b.matrixWorld); this.prevTail.copy(this.curTail);
    this.length = this.curTail.distanceTo(b.getWorldPosition(_v));
  }
  update(dt, colliders) {
    const b = this.bone, s = this.s;
    b.parent.matrixWorld.decompose(_v2, _q, _s); // _q: ebeveynin dünya dönüşü
    b.quaternion.copy(this.initLocalRot); b.updateMatrixWorld(false);
    const head = _v2.setFromMatrixPosition(b.matrixWorld).clone();
    // sertlik: dinlenme yönüne doğru çekiş; ataletin sönümlü korunumu; yerçekimi
    const restDir = _v.copy(this.boneAxis).applyQuaternion(_q2.copy(_q).multiply(this.initLocalRot));
    const next = this.curTail.clone()
      .addScaledVector(_s.subVectors(this.curTail, this.prevTail), 1 - s.drag)
      .addScaledVector(restDir, s.stiffness * dt)
      .addScaledVector(s.gravityDir, s.gravityPower * dt);
    next.sub(head).normalize().multiplyScalar(this.length).add(head);
    for (const c of colliders) {
      const r = s.hitRadius + c.r, d = next.distanceTo(c.p);
      if (d < r) { next.sub(c.p).normalize().multiplyScalar(r).add(c.p); next.sub(head).normalize().multiplyScalar(this.length).add(head); }
    }
    this.prevTail.copy(this.curTail); this.curTail.copy(next);
    // kemiği yeni uca doğru döndür (yerel uzayda)
    const to = next.sub(head).normalize();
    _q2.setFromUnitVectors(restDir.normalize(), to); // dünya uzayında ek dönüş
    // yeni dünya dönüşü = _q2 * parentRot * initLocal → yerel = parentRot⁻¹ * yeni dünya
    const world = _q2.multiply(_q.clone().multiply(this.initLocalRot));
    b.quaternion.copy(_q.invert().multiply(world));
    b.updateMatrixWorld(false);
    for (const ch of b.children) ch.updateMatrixWorld(true);
  }
}

export class SpringBones {
  constructor(joints, colliderGroups) { this.joints = joints; this.colliderGroups = colliderGroups; this.lastRoot = null; this.acc = 0; }

  static async fromGLTF(gltf) {
    const vrm = gltf.parser.json.extensions?.VRM, sa = vrm?.secondaryAnimation;
    if (!sa) return null;
    const node = (i) => gltf.parser.getDependency('node', i);
    gltf.scene.updateMatrixWorld(true);
    const colliderGroups = [];
    for (const cg of sa.colliderGroups || []) {
      const obj = await node(cg.node);
      // VRM0 ofsetleri Unity koordinatında: Z ekseni ters
      colliderGroups.push({ obj, spheres: cg.colliders.map((c) => ({ off: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z), radius: c.radius, p: new THREE.Vector3(), r: 0 })) });
    }
    const joints = [];
    for (const g of sa.boneGroups || []) {
      const gd = g.gravityDir || { x: 0, y: -1, z: 0 };
      const settings = {
        stiffness: g.stiffiness ?? g.stiffness ?? 1, drag: g.dragForce ?? 0.4, hitRadius: g.hitRadius ?? 0.02,
        gravityPower: g.gravityPower ?? 0, gravityDir: new THREE.Vector3(gd.x, gd.y, -gd.z),
        colliders: (g.colliderGroups || []).map((i) => colliderGroups[i]).filter(Boolean),
      };
      settings.noColliders = settings.colliders.length === 0;
      for (const bi of g.bones || []) {
        const root = await node(bi);
        const walk = (b) => {
          const kids = b.children.filter((c) => !c.isMesh);
          joints.push({ j: new Joint(b, kids[0] || null, settings), settings });
          for (const k of kids) walk(k);
        };
        walk(root);
      }
    }
    return new SpringBones(joints, colliderGroups);
  }

  /** Ceket eteği gibi çarpıştırıcısız gruplara ek küreler bağla. */
  addColliders(obj, spheres, filter = () => true) {
    const cg = { obj, spheres: spheres.map(([x, y, z, radius]) => ({ off: new THREE.Vector3(x, y, z), radius, p: new THREE.Vector3(), r: 0 })) };
    this.colliderGroups.push(cg);
    for (const { settings } of this.joints) if (filter(settings) && !settings.colliders.includes(cg)) { settings.colliders.push(cg); settings.spheres = null; }
  }

  reset() { for (const { j } of this.joints) j.reset(); }

  update(dt, rootPos) {
    // ışınlanma (yeniden doğma vb.) sonrası saçın uçmasını önle
    if (rootPos) {
      if (this.lastRoot && this.lastRoot.distanceToSquared(rootPos) > 4) { this.lastRoot.copy(rootPos); this.reset(); return; }
      (this.lastRoot ||= new THREE.Vector3()).copy(rootPos);
    }
    // sabit adım (60 Hz), kare başına en fazla 4 adım: düşük FPS'te de kararlı
    this.acc = Math.min(this.acc + dt, 4 / 60);
    while (this.acc >= 1 / 60) {
      this.acc -= 1 / 60;
      for (const cg of this.colliderGroups) {
        cg.obj.matrixWorld.decompose(_v, _q, _s);
        for (const sp of cg.spheres) { sp.p.copy(sp.off).applyMatrix4(cg.obj.matrixWorld); sp.r = sp.radius * _s.x; }
      }
      for (const { j, settings } of this.joints) j.update(1 / 60, settings.spheres ||= settings.colliders.flatMap((cg) => cg.spheres));
    }
  }
}
