// Kahraman için ayak IK'si: eğimli arazide ayaklar zemine oturur, kalça gerektiği kadar alçalır,
// ayak tabanı zemin eğimine yatırılır. Animasyon (mixer) her karede bacakları yeniden yazdığı için
// düzeltme birikmez; her kare animasyon pozunun üstüne uygulanır.
import * as THREE from 'three';

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _t = new THREE.Vector3();
const _ac = new THREE.Vector3(), _ab = new THREE.Vector3(), _at = new THREE.Vector3(), _ba = new THREE.Vector3(), _bc = new THREE.Vector3();
const _ax0 = new THREE.Vector3(), _ax1 = new THREE.Vector3(), _fwd = new THREE.Vector3(), _n = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion(), _r0 = new THREE.Quaternion(), _r1 = new THREE.Quaternion(), _r2 = new THREE.Quaternion(), _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qf = new THREE.Quaternion(), _qt = new THREE.Quaternion();
const clampAcos = (x) => Math.acos(Math.min(1, Math.max(-1, x)));

// Kemiğin dünya dönüşünü ayarla (ebeveyn uzayına çevirerek).
export function setWorldQuat(bone, qWorld) {
  bone.parent.getWorldQuaternion(_q).invert();
  bone.quaternion.copy(_q.multiply(qWorld));
  bone.updateMatrixWorld(true);
}

// İki kemikli analitik IK (D. Holden yöntemi): a = uyluk, b = diz, c = ayak bileği, hedef t.
// pole: dizin bükülme yönü için ipucu (karakterin önü). Kemik uzunlukları değişmez, yalnızca dönüş.
export function solveTwoBone(A, B, C, target, pole) {
  A.getWorldPosition(_a); B.getWorldPosition(_b); C.getWorldPosition(_c); _t.copy(target);
  const lab = _b.distanceTo(_a), lcb = _c.distanceTo(_b);
  const lat = Math.min(Math.max(_t.distanceTo(_a), 0.01), (lab + lcb) * 0.999);
  _ac.subVectors(_c, _a).normalize(); _ab.subVectors(_b, _a).normalize(); _at.subVectors(_t, _a).normalize();
  _ba.subVectors(_a, _b).normalize(); _bc.subVectors(_c, _b).normalize();
  const acab0 = clampAcos(_ac.dot(_ab)), babc0 = clampAcos(_ba.dot(_bc)), acat0 = clampAcos(_ac.dot(_at));
  const acab1 = clampAcos((lcb * lcb - lab * lab - lat * lat) / (-2 * lab * lat));
  const babc1 = clampAcos((lat * lat - lab * lab - lcb * lcb) / (-2 * lab * lcb));
  // bükülme ekseni: diz düz olsa bile tanımlı kalsın diye ön yöne küçük bir pay eklenir
  _ax0.crossVectors(_ac, _ab.addScaledVector(pole, 0.05)).normalize();
  _ax1.crossVectors(_ac, _at); const l1 = _ax1.length();
  _r0.setFromAxisAngle(_ax0, acab1 - acab0);
  _r1.setFromAxisAngle(_ax0, babc1 - babc0);
  if (l1 > 1e-6) _r2.setFromAxisAngle(_ax1.multiplyScalar(1 / l1), acat0); else _r2.identity();
  A.getWorldQuaternion(_qa); B.getWorldQuaternion(_qb);
  const qa = _qa.premultiply(_r0).premultiply(_r2);
  const qb = _qb.premultiply(_r1).premultiply(_r0).premultiply(_r2);
  setWorldQuat(A, qa); setWorldQuat(B, qb);
}

export class FootIK {
  // ground(x, z) -> zemin yüksekliği
  constructor(root, ground, { maxDrop = 0.4, maxRaise = 0.45, maxTilt = 0.45 } = {}) {
    this.root = root; this.ground = ground; this.maxDrop = maxDrop; this.maxRaise = maxRaise; this.maxTilt = maxTilt;
    const g = (n) => root.getObjectByName(n);
    this.hips = g('J_Bip_C_Hips');
    this.legs = ['L', 'R'].map((S) => ({ up: g(`J_Bip_${S}_UpperLeg`), knee: g(`J_Bip_${S}_LowerLeg`), foot: g(`J_Bip_${S}_Foot`), off: 0, tilt: new THREE.Quaternion() }));
    this.pelvis = 0; this.weight = 0; this.enabled = true;
    this.debug = { offsets: [0, 0], pelvis: 0 };
  }
  reset() { this.pelvis = 0; this.weight = 0; for (const L of this.legs) { L.off = 0; L.tilt.identity(); } }
  normal(x, z, out) {
    const e = 0.25, G = this.ground;
    return out.set(G(x - e, z) - G(x + e, z), 2 * e, G(x, z - e) - G(x, z + e)).normalize();
  }
  // active: ayak IK'si uygulanmalı mı (yerde, takla/zıplama/ölüm değil). Mixer'dan ve kök konumlandıktan sonra çağrılır.
  update(dt, active) {
    const k = Math.min(1, dt * 14);
    this.weight += ((active && this.enabled ? 1 : 0) - this.weight) * Math.min(1, dt * 8);
    const rootY = this.root.position.y, w = this.weight;
    if (w < 0.001) { this.pelvis = 0; return; }
    this.root.updateMatrixWorld(true);
    // her ayağın altındaki zeminin kök zeminine göre farkı
    let lo = 0;
    for (const L of this.legs) {
      L.foot.getWorldPosition(_c);
      const want = THREE.MathUtils.clamp(this.ground(_c.x, _c.z) - rootY, -this.maxDrop, this.maxRaise);
      L.off += (want - L.off) * k; lo = Math.min(lo, L.off);
    }
    // kalça: aşağıdaki ayağa uzanabilsin diye alçalır
    this.pelvis += (lo - this.pelvis) * k;
    const drop = this.pelvis * w;
    if (Math.abs(drop) > 1e-5) {
      this.hips.getWorldPosition(_t); _t.y += drop;
      this.hips.parent.worldToLocal(_t); this.hips.position.copy(_t); this.hips.updateMatrixWorld(true);
    }
    _fwd.set(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
    this.legs.forEach((L, i) => {
      L.foot.getWorldQuaternion(_qf); // animasyonun ayak yönü (dünya)
      L.foot.getWorldPosition(_t);
      // kalça indiği için ayak da indi: animasyondaki yüksekliğe zemin farkını ekle
      _t.y += (L.off * w) - drop;
      solveTwoBone(L.up, L.knee, L.foot, _t, _fwd);
      // ayak tabanını zemin eğimine yatır (sınırlı açı)
      this.normal(_t.x, _t.z, _n);
      _qt.setFromUnitVectors(_up, _n);
      const ang = 2 * Math.acos(Math.min(1, Math.abs(_qt.w)));
      if (ang > this.maxTilt) _qt.slerp(_r2.identity(), 1 - this.maxTilt / ang);
      L.tilt.slerp(_qt, k);
      _q.identity().slerp(L.tilt, w);
      setWorldQuat(L.foot, _qf.premultiply(_q));
      this.debug.offsets[i] = L.off;
    });
    this.debug.pelvis = drop;
  }
}
