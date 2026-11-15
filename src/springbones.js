// VRM 0.x "secondaryAnimation" yay kemikleri: saç ve ceket eteği fiziği.
// UniVRM'in Verlet tabanlı algoritmasının sade bir uygulaması. Model verisindeki
// sertlik / sürükleme / yerçekimi / çarpışma küresi değerlerini kullanır.
import * as THREE from 'three';

const MAX_DT = 1 / 20;        // takılmalarda tek adımda aşırı savrulma olmasın
const LEAF_TAIL = 0.07;       // çocuğu olmayan uç kemik için sanal kuyruk uzunluğu (UniVRM ile aynı)
const TELEPORT = 2.5;         // bir karede bu kadar (m) yer değiştiren kök için zinciri sıfırla
// Kökün (oyuncunun) yer değiştirme ve dönüşünün bu kadarı ataletten düşülür. 0: saf dünya uzayı
// (koşarken saç/etek savrulup ters döner), 1: tamamen karakter uzayı (koşu hiç hissedilmez).
const LOCOMOTION_COMP = 0.9;
const MIN_DRAG = 0.12;        // modelde sürükleme 0 olan gruplar (ceket eteği) sönümsüz salınmasın
// Oyun ayarı: koşu klipleri kalçayı adım başına ~25 cm zıplatıyor; modelin sertliği bunun için
// yetersiz kalıp 7 cm'lik saç eklemleri ters dönüyordu.
const STIFF_MUL = 2.0;
// Ceket eteği kemikleri modelde baldıra (diz altı) bağlı ve çarpışma küresi yok: depar
// klibinin topuk vuruşunda bacağın içinden geçecek kadar geride kalmasın diye daha sert/sönümlü.
const CLOTH = { test: /^J_Sec_/, stiffMul: 5.0, minDrag: 0.35 };

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _wp = new THREE.Vector3(), _dm = new THREE.Matrix4();

class Joint {
  constructor(bone, child, s) {
    this.bone = bone; this.s = s;
    this.restQ = bone.quaternion.clone();
    // kemiğin yerel uzayında kuyruk (çocuk) konumu
    this.localTail = child ? child.position.clone()
      : bone.position.lengthSq() > 1e-10 ? bone.position.clone().normalize().multiplyScalar(LEAF_TAIL) : new THREE.Vector3(0, LEAF_TAIL, 0);
    this.axis = this.localTail.clone().normalize();
    this.tail = new THREE.Vector3(); this.prev = new THREE.Vector3();
    this.len = this.localTail.length();
  }
  reset() {
    this.bone.quaternion.copy(this.restQ); this.bone.updateMatrixWorld(true);
    this.tail.copy(this.localTail).applyMatrix4(this.bone.matrixWorld); this.prev.copy(this.tail);
  }
  step(dt) {
    const b = this.bone, s = this.s;
    b.matrixWorld.decompose(_wp, _q, _v); // _wp: kemiğin dünya konumu
    this.len = _v2.copy(this.localTail).applyMatrix4(b.matrixWorld).distanceTo(_wp); // ölçekli kuyruk uzunluğu
    b.parent.getWorldQuaternion(_q2);                      // ebeveyn dünya dönüşü
    _q.copy(_q2).multiply(this.restQ);                     // dinlenme dünya dönüşü
    // atalet + sönüm
    const next = _v.copy(this.tail).sub(this.prev).multiplyScalar(1 - s.drag).add(this.tail);
    // sertlik: dinlenme yönüne geri çekme
    next.add(_v2.copy(this.axis).applyQuaternion(_q).multiplyScalar(s.stiffness * dt));
    // yerçekimi
    if (s.gravityPower) next.addScaledVector(s.gravityDir, s.gravityPower * dt);
    // uzunluğu koru
    next.sub(_wp).normalize().multiplyScalar(this.len).add(_wp);
    // çarpışma küreleri (kafa, gövde, kollar): kuyruk küreye girmesin
    for (const c of s.colliders) {
      const r = c.radius + s.hitRadius, d = next.distanceTo(c.world);
      if (d < r && d > 1e-6) {
        next.sub(c.world).multiplyScalar(r / d).add(c.world);
        next.sub(_wp).normalize().multiplyScalar(this.len).add(_wp);
      }
    }
    this.prev.copy(this.tail); this.tail.copy(next);
    // kuyruğa bakacak yerel dönüşü uygula
    _v2.copy(next).sub(_wp).applyQuaternion(_q.invert()).normalize();
    b.quaternion.copy(this.restQ).multiply(_q2.setFromUnitVectors(this.axis, _v2));
    b.updateMatrixWorld(true);
  }
}

export class SpringBones {
  /** @param gltf GLTFLoader sonucu (VRM 0.x uzantısı olan) */
  constructor(gltf) {
    this.joints = []; this.colliders = []; this.enabled = true; this.ready = false;
    this.anchor = null; this.lastAnchor = new THREE.Vector3(); this.lastAnchorInv = new THREE.Matrix4(); this.root = gltf.scene;
    const sa = gltf.parser.json.extensions?.VRM?.secondaryAnimation; if (!sa) return;
    const nodeOf = new Map();
    for (const [obj, a] of gltf.parser.associations) if (a && a.nodes !== undefined && obj.isObject3D) nodeOf.set(a.nodes, obj);
    // VRM0 Unity koordinatı kullanır: z ekseni ters
    const groups = (sa.colliderGroups || []).map((g) => {
      const node = nodeOf.get(g.node); if (!node) return [];
      return (g.colliders || []).map((c) => {
        const col = { node, offset: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z), radius: c.radius, world: new THREE.Vector3() };
        this.colliders.push(col); return col;
      });
    });
    const seen = new Set();
    for (const g of sa.boneGroups || []) {
      const gd = g.gravityDir || { x: 0, y: -1, z: 0 };
      const cloth = (g.bones || []).some((bi) => CLOTH.test.test(nodeOf.get(bi)?.name || ''));
      const s = { stiffness: (g.stiffiness ?? g.stiffness ?? 1) * (cloth ? CLOTH.stiffMul : STIFF_MUL),
        drag: Math.max(cloth ? CLOTH.minDrag : MIN_DRAG, g.dragForce ?? 0.4), gravityPower: g.gravityPower || 0,
        gravityDir: new THREE.Vector3(gd.x, gd.y, -gd.z).normalize(), hitRadius: g.hitRadius || 0.02,
        colliders: (g.colliderGroups || []).flatMap((i) => groups[i] || []) };
      for (const bi of g.bones || []) {
        const root = nodeOf.get(bi); if (!root) continue;
        root.traverse((bone) => {
          if (!bone.isBone || seen.has(bone)) return; seen.add(bone);
          this.joints.push(new Joint(bone, bone.children.find((c) => c.isBone) || null, s));
        });
      }
    }
  }
  get count() { return this.joints.length; }
  reset() {
    this.root.updateWorldMatrix(true, true);
    for (const j of this.joints) j.reset();
    this.ready = true; if (this.anchor) { this.anchor.getWorldPosition(this.lastAnchor); this.lastAnchorInv.copy(this.anchor.matrixWorld).invert(); }
  }
  /** Mikser ve kök dönüşümü güncellendikten sonra her karede çağrılır. */
  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    if (!this.ready) { this.reset(); return; }
    this.root.updateWorldMatrix(true, true); // ebeveynler dahil: kök bu karede taşındı
    if (this.anchor) {
      const p = this.anchor.getWorldPosition(_v);
      if (p.distanceTo(this.lastAnchor) > TELEPORT) { this.reset(); return; } // ışınlanma/yeniden doğma
      // Kökün bu karedeki hareketinin (yer değiştirme + dönüş) çoğunu zincire de uygula:
      // koşu ve ani dönüşlerde saç/etek ters dönecek kadar savrulmasın.
      _dm.copy(this.anchor.matrixWorld).multiply(this.lastAnchorInv);
      for (const j of this.joints) {
        j.tail.lerp(_v2.copy(j.tail).applyMatrix4(_dm), LOCOMOTION_COMP);
        j.prev.lerp(_v2.copy(j.prev).applyMatrix4(_dm), LOCOMOTION_COMP);
      }
      this.lastAnchor.copy(p); this.lastAnchorInv.copy(this.anchor.matrixWorld).invert();
    }
    for (const c of this.colliders) c.world.copy(c.offset).applyMatrix4(c.node.matrixWorld);
    // UniVRM gibi kare başına tek adım. Alt adımlama yanlıştı: tüm alt adımlar aynı poza baktığı
    // için kök hareketi ilk adımda sıçrama, sonrakilerde sahte atalet olarak görünüyordu.
    dt = Math.min(dt, MAX_DT); if (dt <= 0) return;
    for (const j of this.joints) j.step(dt);
  }
}
