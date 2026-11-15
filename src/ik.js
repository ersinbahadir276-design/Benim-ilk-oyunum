// Kahraman için ayak IK'si: eğimli arazide ayaklar zemine oturur, kalça gerektiği kadar alçalır,
// ayak tabanı zemin eğimine yatırılır. Yürüme döngüsünde basan ayak dünyada kilitlenir (ayak kaymaz). Animasyon (mixer) her karede bacakları yeniden yazdığı için
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
    this.legs = ['L', 'R'].map((S) => ({ up: g(`J_Bip_${S}_UpperLeg`), knee: g(`J_Bip_${S}_LowerLeg`), foot: g(`J_Bip_${S}_Foot`), off: 0, tilt: new THREE.Quaternion(),
      locked: false, lockW: 0, lockP: new THREE.Vector3(), prevZ: null, hMin: 0.12, spent: false, slip: 0 }));
    // bacak boyu (uyluk + baldır), aşırı gerilme sınırı için
    root.updateMatrixWorld(true);
    this.legs.forEach((L) => { L.up.getWorldPosition(_a); L.knee.getWorldPosition(_b); L.foot.getWorldPosition(_c); L.len = _a.distanceTo(_b) + _b.distanceTo(_c); });
    this.lockEnabled = true; this.lockApply = true; this.slipMax = 0.16; this.maxLockDrop = 0.06; this.lockDrop = 0; this.stats = { locks: 0, releases: 0 };
    this.pelvis = 0; this.weight = 0; this.enabled = true;
    this.debug = { offsets: [0, 0], pelvis: 0, lockDrop: 0 };
  }
  reset() { this.pelvis = 0; this.weight = 0; this.lockDrop = 0; for (const L of this.legs) { L.off = 0; L.tilt.identity(); L.locked = false; L.lockW = 0; L.prevZ = null; L.spent = false; } }
  normal(x, z, out) {
    const e = 0.25, G = this.ground;
    return out.set(G(x - e, z) - G(x + e, z), 2 * e, G(x, z - e) - G(x, z + e)).normalize();
  }
  // Basma tespiti (animasyon pozundan, kök uzayında): ayak bileği kendi en alçak yüksekliğine yakın ve köke göre
  // geriye gidiyorsa ayak yerdedir. Kilit: basışın başında ayağın dünya konumu saklanır ve basış boyunca IK hedefi
  // olur. Bacak aşırı gerilirse ya da animasyondan çok uzaklaşırsa kilit o basış için bırakılır ve ayak yumuşakça
  // animasyona döner.
  _stance(L, dt, lockable, speed) {
    L.foot.getWorldPosition(_c); _a.copy(_c); this.root.worldToLocal(_a);
    const h = _a.y, vz = L.prevZ == null ? 0 : (_a.z - L.prevZ) / Math.max(dt, 1e-4); L.prevZ = _a.z;
    L.hMin = Math.min(h, L.hMin + dt * 0.02);
    // giriş: ayak alçakta ve köke göre en az gövde hızının yarısıyla geriye süpürüyor (klibin yavaş iniş kareleri
    // kilitlenmez); devam: biraz daha yüksekte ve hâlâ geriye gidiyor
    const down = L.locked ? h < L.hMin + 0.11 && vz < 0.25 : h < L.hMin + 0.05 && vz < -Math.max(0.05, speed * 0.5);
    L.need = 0;
    if (lockable && this.lockEnabled && down && !L.spent) {
      if (!L.locked) { L.locked = true; L.lockP.copy(_c); this.stats.locks++; }
      else {
        L.slip = Math.hypot(L.lockP.x - _c.x, L.lockP.z - _c.z);
        // erişim: kilit noktası bacak boyunun ötesindeyse kalça birkaç cm alçalır (gerçek yürüyüşte de olur);
        // bu da yetmiyorsa kilit bırakılır
        L.up.getWorldPosition(_b);
        const reach = L.len * 0.995, hd = Math.hypot(L.lockP.x - _b.x, L.lockP.z - _b.z), dv = _b.y - _c.y;
        L.need = hd < reach ? Math.max(0, dv - Math.sqrt(reach * reach - hd * hd)) : 1;
        const why = L.slip > this.slipMax ? 'slip' : L.need > this.maxLockDrop ? 'stretch' : null;
        if (why) {
          L.locked = false; L.spent = true; L.need = 0; this.stats.releases++; this.stats[why] = (this.stats[why] || 0) + 1;
          if (h < L.hMin + 0.08) this.stats.early = (this.stats.early || 0) + 1; // topuk kalkmadan bırakıldı
        }
      }
    } else { L.locked = false; if (!down) L.spent = false; }
    L.lockW += ((L.locked ? 1 : 0) - L.lockW) * Math.min(1, dt * (L.locked ? 40 : 12));
    if (!lockable || !this.lockEnabled) { L.lockW = 0; L.spent = false; }
  }
  // active: ayak IK'si uygulanmalı mı (yerde, takla/zıplama/ölüm değil); lockable: yürüme döngüsü (ayak kilidi);
  // speed: gövde hızı (m/sn).
  // Mixer'dan ve kök konumlandıktan sonra çağrılır.
  update(dt, active, lockable = false, speed = 0) {
    const k = Math.min(1, dt * 14);
    this.weight += ((active && this.enabled ? 1 : 0) - this.weight) * Math.min(1, dt * 8);
    const rootY = this.root.position.y, w = this.weight;
    if (w < 0.001) { this.pelvis = 0; for (const L of this.legs) { L.locked = false; L.lockW = 0; L.prevZ = null; } return; }
    this.root.updateMatrixWorld(true);
    let need = 0;
    for (const L of this.legs) { this._stance(L, dt, lockable && active, speed); need = Math.max(need, L.need * L.lockW); }
    this.lockDrop += (need - this.lockDrop) * Math.min(1, dt * (need > this.lockDrop ? 30 : 8));
    // her ayağın altındaki zeminin kök zeminine göre farkı
    let lo = 0;
    for (const L of this.legs) {
      L.foot.getWorldPosition(_c);
      const want = THREE.MathUtils.clamp(this.ground(_c.x, _c.z) - rootY, -this.maxDrop, this.maxRaise);
      L.off += (want - L.off) * k; lo = Math.min(lo, L.off);
    }
    // kalça: aşağıdaki ayağa uzanabilsin diye alçalır
    this.pelvis += (lo - this.pelvis) * k;
    const drop = (this.pelvis - this.lockDrop) * w;
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
      // kilitli ayak: yatay konum dünyada sabit (yükseklik animasyondan: topuk kalkışı korunur)
      const lw = this.lockApply ? L.lockW * w : 0; // lockApply=false: basış tespiti çalışır ama kilit uygulanmaz (ölçüm için)
      if (lw > 1e-3) { _t.x += (L.lockP.x - _t.x) * lw; _t.z += (L.lockP.z - _t.z) * lw; }
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
    this.debug.pelvis = drop; this.debug.lockDrop = this.lockDrop;
  }
}

// Yaratıklar (tilki, ejderha, Mağara Devi) için ortak basma kilidi. Basış animasyon pozundan, gövde (pivot) uzayında
// tespit edilir: bacak ucu kendi en alçak yüksekliğine yakın ve gövdeye göre en az gövde hızının yarısıyla geriye
// gidiyorsa ayak yerdedir. Basış boyunca ucun yatay dünya konumu sabit tutulur (yükseklik animasyondan gelir).
// Bacak aşırı gerilirse ya da kayma birikirse kilit o basışta bırakılır, ayak yumuşakça animasyona döner.
//  l: bacak durumu (locked, lockW, lockP, hMin, prevZ, spent, slip alanları burada tutulur)
//  local: ucun gövde uzayındaki animasyon konumu, world: dünya konumu, hip: bacak kökünün dünya konumu
//  reach: bacak boyu, can: yürüyüş döngüsünde mi, stats: { locks, releases, early }
export function stanceLock(l, local, world, hip, reach, dt, speed, can, stats) {
  const h = local.y, vz = l.prevZ == null ? 0 : (local.z - l.prevZ) / Math.max(dt, 1e-4); l.prevZ = local.z;
  l.hMin = l.hMin == null ? h : Math.min(h, l.hMin + dt * reach * 0.02);
  const down = l.locked ? h < l.hMin + reach * 0.13 && vz < speed * 0.15 : h < l.hMin + reach * 0.06 && vz < -Math.max(0.05, speed * 0.5);
  l.slip = 0;
  if (can && down && !l.spent) {
    if (!l.locked) { l.locked = true; l.lockP.copy(world); stats.locks++; }
    else {
      l.slip = Math.hypot(l.lockP.x - world.x, l.lockP.z - world.z);
      // erişim: kilit noktası bacak boyunun ötesindeyse gövde biraz alçalabilir (en çok boyun %6'sı; düz bacaklı
      // yürüyüşte basışın başında olağan). Bu da yetmiyorsa ya da ayak animasyondan çok uzaklaştıysa kilit bırakılır.
      const hd = Math.hypot(l.lockP.x - hip.x, l.lockP.z - hip.z), dv = hip.y - world.y;
      const need = hd < reach ? Math.max(0, dv - Math.sqrt(reach * reach - hd * hd)) : Infinity;
      if (l.slip > reach * 0.4 || need > reach * 0.06) {
        l.locked = false; l.spent = true; stats.releases++;
        if (h < l.hMin + reach * 0.04) stats.early++;
      }
    }
  } else { l.locked = false; if (!down) l.spent = false; }
  if (!can) { l.spent = false; l.prevZ = null; }
  l.lockW += ((l.locked ? 1 : 0) - l.lockW) * Math.min(1, dt * (l.locked ? 40 : 12));
  if (!can && l.lockW < 1e-3) l.lockW = 0;
}
