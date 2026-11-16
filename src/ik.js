// Kahraman için ayak IK'si: eğimli arazide ayaklar zemine oturur, kalça gerektiği kadar alçalır,
// ayak tabanı zemin eğimine yatırılır. Yürüme döngüsünde basan ayak dünyada kilitlenir (ayak kaymaz). Animasyon (mixer) her karede bacakları yeniden yazdığı için
// düzeltme birikmez; her kare animasyon pozunun üstüne uygulanır.
import * as THREE from 'three';

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _t = new THREE.Vector3();
const _ac = new THREE.Vector3(), _ab = new THREE.Vector3(), _at = new THREE.Vector3(), _ba = new THREE.Vector3(), _bc = new THREE.Vector3();
const _ax0 = new THREE.Vector3(), _ax1 = new THREE.Vector3(), _fwd = new THREE.Vector3(), _n = new THREE.Vector3(), _pole = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
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
      locked: false, lockW: 0, lockP: new THREE.Vector3(), prevZ: null, hMin: 0.12, spent: false, slip: 0,
      // yerinde duruş: ayak dünyada sabit (P, yön H); gövde dönünce ya da itilince adım atılarak yeniden yerleşir
      pw: 0, pOn: false, P: new THREE.Vector3(), H: 0, step: null, lift: 0, lastP: new THREE.Vector3(), lastH: 0, hasLast: false }));
    // bacak boyu (uyluk + baldır), aşırı gerilme sınırı için
    root.updateMatrixWorld(true);
    this.legs.forEach((L) => { L.up.getWorldPosition(_a); L.knee.getWorldPosition(_b); L.foot.getWorldPosition(_c); L.len = _a.distanceTo(_b) + _b.distanceTo(_c); });
    this.lockEnabled = true; this.lockApply = true; this.slipMax = 0.16; this.maxLockDrop = 0.06; this.lockDrop = 0; this.stats = { locks: 0, releases: 0 };
    this.pelvis = 0; this.weight = 0; this.enabled = true;
    this.debug = { offsets: [0, 0], pelvis: 0, lockDrop: 0 };
    // yerinde dönüş / duruş adımları: hata eşiği (m, rad), adım süresi
    this.plantDist = 0.13; this.plantAng = 0.5; this.stepCool = 0; this.stepStats = { steps: 0, snaps: 0 };
    // ağırlık aktarımı: adımda kalça (ve onunla üst gövde) yana, basan ayağın üstüne kayar. stepPre: ayak kalkmadan
    // önce ağırlığın kaymaya başladığı süre; shiftFrac: kalça–basan ayak yanal uzaklığının ne kadarı; shiftMax: sınır (m)
    this.stepPre = 0.07; this.shiftFrac = 0.6; this.shiftMax = 0.065; this.shift = new THREE.Vector3(); this.shiftV = new THREE.Vector3(); this.shiftOn = true;
    this.debug.shift = 0;
  }
  reset() { this.shift.set(0, 0, 0); this.shiftV.set(0, 0, 0); this.pelvis = 0; this.weight = 0; this.lockDrop = 0; this.stepCool = 0; for (const L of this.legs) { L.off = 0; L.tilt.identity(); L.locked = false; L.lockW = 0; L.prevZ = null; L.spent = false; L.pw = 0; L.pOn = false; L.step = null; L.lift = 0; L.hasLast = false; } }
  // Ayakta dururken (bekleme/çömelme) ayaklar dünyada sabit durur. Gövde dönerse, itilirse ya da koşudan durulunca
  // animasyonun istediği duruştan uzaklaşan ayak, bir seferde tek ayak olmak üzere kısa bir adımla yeni yerine taşınır
  // (yerinde dönüş adımı / duruşa yerleşme). Hata: yatay uzaklık / plantDist ile yön farkı / plantAng'ın büyüğü.
  _plant(dt, plant, yaw) {
    this.stepCool -= dt;
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    for (const L of this.legs) {
      L.pw += ((plant ? 1 : 0) - L.pw) * Math.min(1, dt * (plant ? 10 : 16));
      if (!plant && L.pw < 0.01) { L.pw = 0; L.pOn = false; L.step = null; L.lift = 0; continue; }
      L.foot.getWorldPosition(_c); L.want = L.want || new THREE.Vector3(); L.want.copy(_c);
      if (!L.pOn) {
        // önceki karenin gösterilen ayak konumundan başla (yürüme kilidinden kesintisiz geçiş)
        L.pOn = true; L.step = null;
        if (L.hasLast && Math.hypot(L.lastP.x - _c.x, L.lastP.z - _c.z) < 0.6) { L.P.copy(L.lastP); L.H = L.lastH; } else { L.P.copy(_c); L.H = yaw; }
      }
    }
    if (!plant) { this.shift.multiplyScalar(Math.max(0, 1 - dt * 12)); this.shiftV.set(0, 0, 0); return; }
    // aşırı uzaklaşma (ışınlanma, güçlü itilme): adım atmadan yeniden yerleş
    for (const L of this.legs) if (Math.hypot(L.P.x - L.want.x, L.P.z - L.want.z) > 0.7) { L.P.copy(L.want); L.H = yaw; L.step = null; this.stepStats.snaps++; }
    const err = (L) => {
      L.up.getWorldPosition(_b);
      const d = Math.hypot(L.P.x - L.want.x, L.P.z - L.want.z), hd = Math.hypot(L.P.x - _b.x, L.P.z - _b.z);
      return Math.max(d / this.plantDist, Math.abs(wrap(L.H - yaw)) / this.plantAng, hd / (L.len * 0.42));
    };
    // tek ayak adım atar; hata çok büyükse (hızlı dönüş) diğer ayak ilk adımın ikinci yarısında kalkabilir
    const busy = this.legs.find((L) => L.step);
    if ((!busy && this.stepCool <= 0) || (busy && busy.step.t > busy.step.dur * 0.55)) {
      let best = null, be = busy ? 1.6 : 1;
      for (const L of this.legs) { if (L.step) continue; const e = err(L); if (e > be) { be = e; best = L; } }
      if (best) {
        const d = Math.hypot(best.P.x - best.want.x, best.P.z - best.want.z);
        best.step = { t: this.shiftOn ? -this.stepPre : 0, dur: THREE.MathUtils.clamp(0.2 + d * 0.45, 0.2, 0.36), from: best.P.clone(), H0: best.H, h: Math.min(0.09, 0.035 + d * 0.2) };
        this.stepStats.steps++;
      }
    }
    for (const L of this.legs) {
      const S = L.step; L.lift = 0; if (!S) continue;
      S.t += dt; const u = THREE.MathUtils.clamp(S.t / S.dur, 0, 1), e = u * u * (3 - 2 * u);
      L.P.lerpVectors(S.from, L.want, e); L.H = S.H0 + wrap(yaw - S.H0) * e; L.lift = S.h * Math.sin(Math.PI * u);
      if (u >= 1) { L.step = null; L.H = yaw; this.stepCool = 0.06; }
    }
    // ağırlık aktarımı hedefi: adım atan her ayak için karşısındaki (basan) ayağa doğru, gövdenin yan ekseninde.
    // İki adım üst üste binerse (hızlı dönüş) katkılar toplanır; hedef yandan yana sıçramaz.
    _t.set(0, 0, 0);
    if (this.shiftOn) {
      this.hips.getWorldPosition(_b);
      const rx = Math.cos(yaw), rz = -Math.sin(yaw); // gövdenin sağ ekseni
      let lat = 0;
      for (const sw of this.legs) {
        const S = sw.step; if (!S) continue; const sup = this.legs.find((L) => L !== sw);
        // zarf: ön hazırlıkta (t<0) yükselir, adımın son %40'ında iner
        const a = THREE.MathUtils.clamp((S.t + this.stepPre) / (this.stepPre + S.dur * 0.15), 0, 1), b = THREE.MathUtils.clamp((S.dur - S.t) / (S.dur * 0.4), 0, 1);
        const env = Math.min(a * a * (3 - 2 * a), b * b * (3 - 2 * b));
        lat += ((sup.P.x - _b.x) * rx + (sup.P.z - _b.z) * rz) * this.shiftFrac * env;
      }
      lat = THREE.MathUtils.clamp(lat, -this.shiftMax, this.shiftMax);
      _t.set(rx * lat, 0, rz * lat);
    }
    // kritik sönümlü yay: kalça hızında sıçrama olmaz
    const om = 11, h = Math.min(dt, 0.05);
    this.shiftV.x += (om * om * (_t.x - this.shift.x) - 2 * om * this.shiftV.x) * h; this.shiftV.z += (om * om * (_t.z - this.shift.z) - 2 * om * this.shiftV.z) * h;
    this.shift.x += this.shiftV.x * h; this.shift.z += this.shiftV.z * h;
  }
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
  update(dt, active, lockable = false, speed = 0, plant = false) {
    const k = Math.min(1, dt * 14);
    this.weight += ((active && this.enabled ? 1 : 0) - this.weight) * Math.min(1, dt * 8);
    const rootY = this.root.position.y, w = this.weight;
    if (w < 0.001) { this.pelvis = 0; this.shift.set(0, 0, 0); this.shiftV.set(0, 0, 0); for (const L of this.legs) { L.locked = false; L.lockW = 0; L.prevZ = null; L.pw = 0; L.pOn = false; L.step = null; L.hasLast = false; } return; }
    this.root.updateMatrixWorld(true);
    const yaw = this.root.rotation.y;
    this._plant(dt, plant && active && this.enabled, yaw);
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
    const drop = (this.pelvis - this.lockDrop) * w, sx = this.shift.x * w, sz = this.shift.z * w;
    if (Math.abs(drop) + Math.abs(sx) + Math.abs(sz) > 1e-5) {
      this.hips.getWorldPosition(_t); _t.y += drop; _t.x += sx; _t.z += sz;
      this.hips.parent.worldToLocal(_t); this.hips.position.copy(_t); this.hips.updateMatrixWorld(true);
    }
    _fwd.set(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
    this.legs.forEach((L, i) => {
      L.foot.getWorldQuaternion(_qf); // animasyonun ayak yönü (dünya)
      L.foot.getWorldPosition(_t);
      // kalça indiği için ayak da indi: animasyondaki yüksekliğe zemin farkını ekle
      _t.y += (L.off * w) - drop; _t.x -= sx; _t.z -= sz; // kalça kaydırması ayağı taşımasın
      // kilitli ayak: yatay konum dünyada sabit (yükseklik animasyondan: topuk kalkışı korunur)
      const lw = this.lockApply ? L.lockW * w : 0; // lockApply=false: basış tespiti çalışır ama kilit uygulanmaz (ölçüm için)
      if (lw > 1e-3) { _t.x += (L.lockP.x - _t.x) * lw; _t.z += (L.lockP.z - _t.z) * lw; }
      // yerinde duruş: yatay konum ve ayak yönü dünyada sabit, adımda yay çizerek kalkar
      const pw = L.pw * w; let dH = 0;
      if (pw > 1e-3) {
        _t.x += (L.P.x - _t.x) * pw; _t.z += (L.P.z - _t.z) * pw; _t.y += L.lift * pw;
        dH = THREE.MathUtils.clamp(Math.atan2(Math.sin(L.H - yaw), Math.cos(L.H - yaw)), -0.9, 0.9) * pw;
      }
      // diz, ayağın baktığı yön ile gövde yönü arasına bükülür
      const pole = dH ? _pole.set(Math.sin(yaw + dH * 0.5), 0, Math.cos(yaw + dH * 0.5)) : _fwd;
      solveTwoBone(L.up, L.knee, L.foot, _t, pole);
      if (dH) _qf.premultiply(_qa.setFromAxisAngle(_up, dH));
      // ayak tabanını zemin eğimine yatır (sınırlı açı)
      this.normal(_t.x, _t.z, _n);
      _qt.setFromUnitVectors(_up, _n);
      const ang = 2 * Math.acos(Math.min(1, Math.abs(_qt.w)));
      if (ang > this.maxTilt) _qt.slerp(_r2.identity(), 1 - this.maxTilt / ang);
      L.tilt.slerp(_qt, k);
      _q.identity().slerp(L.tilt, w);
      setWorldQuat(L.foot, _qf.premultiply(_q));
      L.lastP.copy(_t); L.lastH = yaw + dH; L.hasLast = true;
      this.debug.offsets[i] = L.off;
    });
    this.debug.pelvis = drop; this.debug.lockDrop = this.lockDrop; this.debug.shift = Math.hypot(sx, sz);
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
