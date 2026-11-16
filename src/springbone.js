// VRM 0.x "secondaryAnimation" yay kemikleri (saç ve palto eteği fiziği).
// UniVRM'in VRMSpringBone mantığının sade bir uyarlaması: her kemiğin ucu (tail) bir parçacık gibi
// eylemsizlik + sertlik + yerçekimi ile hareket eder, uzunluğu sabit tutulur, küre çarpıştırıcılardan itilir.
// Sabit 60 Hz alt adımlarla çalışır (kare hızından bağımsız). Animasyon karıştırıcısı bu kemiklere dokunmaz.
import * as THREE from 'three';

const STEP = 1 / 60, MAX_STEPS = 4;
const _v = new THREE.Vector3(), _rest = new THREE.Vector3(), _qa = new THREE.Quaternion(), _I = new THREE.Quaternion(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4();
const nodeObj = (root, json, i) => root.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(json.nodes[i]?.name || ''));

export class SpringBoneSystem {
  // inertia: karakterin dünya hareketinin (koşu, dönüş) ne kadarının saç/eteğe gecikme olarak yansıyacağı (0 = VRM "center" davranışı)
  // minDrag: VRM verisinde sönümsüz (drag 0) gruplar 60 Hz'de sonsuz salınır; en az bu kadar sönüm uygulanır
  // maxAngle: ucun dinlenme yönünden en fazla sapması (radyan) — palto bacağın içinden geçmesin, saç ters dönmesin
  constructor(model, gltfJson, { inertia = 0.35, maxDeltaMove = 0.5, minDrag = 0.12, maxAngle = 1.0, coatMaxAngle = 0.75 } = {}) {
    this.joints = []; this.colliderGroups = []; this.inertia = inertia; this.maxDeltaMove = maxDeltaMove;
    this.acc = 0; this.centerPrev = null; this.enabled = true;
    const sa = gltfJson?.extensions?.VRM?.secondaryAnimation;
    if (!sa) return;
    model.updateMatrixWorld(true);
    const scale = model.getWorldScale(new THREE.Vector3()).x;
    for (const cg of sa.colliderGroups || []) {
      const node = nodeObj(model, gltfJson, cg.node);
      this.colliderGroups.push(node ? cg.colliders.map((c) => ({ node, offset: new THREE.Vector3(c.offset.x, c.offset.y, c.offset.z), radius: c.radius * scale, world: new THREE.Vector3() })) : []);
    }
    const seen = new Set();
    for (const g of sa.boneGroups || []) {
      const cols = (g.colliderGroups || []).flatMap((i) => this.colliderGroups[i] || []);
      this.center = this.center || (g.center >= 0 ? nodeObj(model, gltfJson, g.center) : null);
      const params = {
        stiffness: g.stiffiness ?? g.stiffness ?? 1, drag: Math.max(minDrag, g.dragForce ?? 0.4),
        maxAngle: (g.comment || '').includes('Tops') || g.colliderGroups?.length === 0 ? coatMaxAngle : maxAngle, hitRadius: (g.hitRadius ?? 0.02) * scale,
        gravity: new THREE.Vector3(g.gravityDir?.x ?? 0, g.gravityDir?.y ?? -1, g.gravityDir?.z ?? 0).multiplyScalar(g.gravityPower ?? 0), cols,
      };
      for (const bi of g.bones) { const b = nodeObj(model, gltfJson, bi); if (b) this.setup(b, params, seen); }
    }
    this.colliders = [...new Set(this.colliderGroups.flat())];
  }

  setup(bone, params, seen) {
    if (seen.has(bone)) return; seen.add(bone);
    const child = bone.children.find((c) => c.isBone || c.type === 'Object3D' || c.isObject3D);
    const tailLocal = child ? child.position.clone() : bone.position.clone().normalize().multiplyScalar(0.07);
    if (tailLocal.lengthSq() < 1e-10) tailLocal.set(0, 0.07, 0);
    const tailWorld = bone.localToWorld(tailLocal.clone());
    const headWorld = bone.getWorldPosition(new THREE.Vector3());
    this.joints.push({
      bone, ...params, localRot: bone.quaternion.clone(), axis: tailLocal.clone().normalize(), length: tailWorld.distanceTo(headWorld),
      cur: tailWorld.clone(), prev: tailWorld.clone(),
    });
    for (const c of bone.children) this.setup(c, params, seen);
  }

  get count() { return this.joints.length; }

  reset() {
    for (const j of this.joints) {
      j.bone.quaternion.copy(j.localRot); j.bone.updateMatrixWorld(true);
      j.bone.localToWorld(j.cur.copy(j.axis).multiplyScalar(j.length / j.bone.getWorldScale(_v).x)); j.prev.copy(j.cur);
    }
    this.centerPrev = null; this.acc = 0;
  }

  // Animasyon ve kök dönüşümü uygulandıktan sonra çağrılır.
  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    const root = this.joints[0].bone; let top = root; while (top.parent) top = top.parent;
    top.updateMatrixWorld(true);
    // merkez (karakter kökü) bu karede ne kadar hareket etti: parçacıkları (1 - inertia) oranında birlikte taşı
    if (this.center) {
      const cm = this.center.matrixWorld;
      if (this.centerPrev) {
        _m.copy(this.centerPrev).invert().premultiply(cm);
        const jump = _v.setFromMatrixPosition(_m).length() > this.maxDeltaMove; // ışınlanma / yeniden doğma
        const k = jump ? 1 : 1 - this.inertia;
        for (const j of this.joints) for (const p of [j.cur, j.prev]) { _v2.copy(p).applyMatrix4(_m); p.lerp(_v2, k); }
      }
      this.centerPrev = (this.centerPrev || new THREE.Matrix4()).copy(cm);
    }
    this.acc = Math.min(this.acc + dt, STEP * MAX_STEPS);
    for (const c of this.colliders) c.world.copy(c.offset).applyMatrix4(c.node.matrixWorld);
    while (this.acc >= STEP) { this.acc -= STEP; this.step(STEP); }
    // son adımın sonucunu kemik dönüşlerine yaz (alt adım sayısı 0 olsa da poz animasyonu takip etsin)
    for (const j of this.joints) this.apply(j);
  }

  step(dt) {
    for (const j of this.joints) {
      const b = j.bone, parent = b.parent;
      parent.getWorldQuaternion(_q);
      const head = _v.copy(b.position).applyMatrix4(parent.matrixWorld);
      // sertlik: dinlenme yönüne çekiş
      _rest.copy(j.axis).applyQuaternion(_q.multiply(j.localRot)); // dinlenme yönü (dünya)
      const stiff = _v2.copy(_rest).multiplyScalar(j.stiffness * dt);
      const next = new THREE.Vector3().subVectors(j.cur, j.prev).multiplyScalar(1 - j.drag).add(j.cur).add(stiff).addScaledVector(j.gravity, dt);
      next.sub(head).normalize();
      const ang = Math.acos(THREE.MathUtils.clamp(next.dot(_rest), -1, 1));
      if (ang > j.maxAngle) { _qa.setFromUnitVectors(_rest, next); _I.identity().slerp(_qa, j.maxAngle / ang); next.copy(_rest).applyQuaternion(_I); }
      next.multiplyScalar(j.length).add(head);
      for (const c of j.cols) {
        const r = j.hitRadius + c.radius, d = next.distanceTo(c.world);
        if (d < r && d > 1e-6) { next.sub(c.world).multiplyScalar(r / d).add(c.world); next.sub(head).normalize().multiplyScalar(j.length).add(head); }
      }
      j.prev.copy(j.cur); j.cur.copy(next);
      this.apply(j);
    }
  }

  apply(j) {
    const b = j.bone, parent = b.parent;
    parent.getWorldQuaternion(_q).multiply(j.localRot); // dinlenme dünya dönüşü
    const head = b.getWorldPosition(_v);
    const from = _v2.copy(j.axis).applyQuaternion(_q);
    const to = head.negate().add(j.cur).normalize();
    _q2.setFromUnitVectors(from, to).multiply(_q); // yeni dünya dönüşü
    parent.getWorldQuaternion(_q).invert();
    b.quaternion.copy(_q.multiply(_q2));
    b.updateMatrixWorld(true);
  }
}
