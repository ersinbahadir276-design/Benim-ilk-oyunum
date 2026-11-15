// Kahramanın yürüme döngüsü: klip yer hızı ölçümü, hız–adım eşlemesi (faz senkronlu karışım)
// ve FootIK için basma (stance) tespiti. Klipler retarget edildiği için yer hızları kaynağa göre değişir;
// bu yüzden sabit sayı yerine yüklemede klipten ölçülür.
import * as THREE from 'three';

const _v = new THREE.Vector3();

// Faz senkronlu bir klip karışımını ayrı bir mixer'la örnekler: kök uzayında ayak bilekleri.
// layers: [{ clip, w, plantL }] — her klibin zamanı = ((faz + plantL) mod 1) · süre.
// Döner: { stride (bir döngüde kat edilen yol, m), hMin, S (örnekler) }.
// Basan ayak: zemine yakın (en alçak yüksekliğin 9 cm içinde; topuk kalkarken bilek yükselir) ve geriye (−z)
// giden ayak. Adım boyu = bu karelerdeki faz başına süpürmenin ortancası: basışın ortası baskın olur, klibin yavaş
// iniş (touchdown) kareleri sonucu düşürmez. (Koşu/deparda havada kalma evresi olduğu için "alçaktaki ayak"
// ölçütü tek başına yetmez.)
const FEET = ['J_Bip_L_Foot', 'J_Bip_R_Foot'];
export function sampleBlend(root, layers, N = 120) {
  const feet = FEET.map((n) => root.getObjectByName(n));
  const sp = root.position.clone(), sq = root.quaternion.clone();
  root.position.set(0, 0, 0); root.quaternion.identity(); root.updateMatrixWorld(true);
  const mixer = new THREE.AnimationMixer(root);
  const acts = layers.map((l) => { const a = mixer.clipAction(l.clip); a.play(); a.setEffectiveWeight(l.w); a.timeScale = 0; return a; });
  const S = [];
  for (let i = 0; i <= N; i++) {
    layers.forEach((l, k) => { acts[k].time = (((i / N) + (l.plantL || 0)) % 1) * l.clip.duration; });
    mixer.update(0); root.updateMatrixWorld(true);
    S.push(feet.map((f) => root.worldToLocal(f.getWorldPosition(_v)).clone()));
  }
  layers.forEach((l, k) => { acts[k].stop(); mixer.uncacheAction(l.clip); }); mixer.uncacheRoot(root);
  root.position.copy(sp); root.quaternion.copy(sq); root.updateMatrixWorld(true);
  const hMin = Math.min(...S.map((s) => Math.min(s[0].y, s[1].y))), v = [];
  for (let i = 0; i < N; i++) for (let k = 0; k < 2; k++) {
    const dz = S[i + 1][k].z - S[i][k].z;
    if (dz < 0 && Math.max(S[i][k].y, S[i + 1][k].y) < hMin + 0.09) v.push(-dz * N);
  }
  v.sort((x, y) => x - y);
  return { stride: v.length ? v[Math.floor(v.length / 2)] : 1, hMin, S };
}

// Tek klip: { dur, speed (ts=1'de m/sn), stride, plantL (sol ayağın basma fazı 0..1), hMin }
export function analyzeGait(root, clip) {
  const { stride, hMin, S } = sampleBlend(root, [{ clip, w: 1, plantL: 0 }]);
  // sol ayağın en önde olduğu faz ≈ topuk basışı
  let best = -1e9, plantL = 0; for (let i = 0; i < S.length - 1; i++) if (S[i][0].z > best) { best = S[i][0].z; plantL = i / (S.length - 1); }
  return { dur: clip.duration, speed: stride / clip.duration, stride, plantL, hMin, track: S.slice(0, -1).map((f) => [f[0].z, f[0].y, f[1].z, f[1].y]) };
}

// Faz senkronlu hız karışımı: yürüme ↔ koşu ↔ depar. Kliplerin zamanı doğrudan faza göre ayarlanır,
// böylece iki klip karışırken ayaklar aynı anda basar ve gövde hızı adım boyuna eşit olur (ayak kaymaz).
export class Locomotion {
  constructor(mixer, clips, gaits, root = null) {
    this.mixer = mixer;
    this.g = gaits.map((g) => ({ ...g, act: mixer.clipAction(clips[g.name]) }));
    // karışımın adım boyu doğrusal değildir (koşuda basış döngünün daha küçük bir bölümüdür); komşu klip
    // çiftleri için birkaç karışım oranında ölçülür ve aradaki değerler doğrusal tamamlanır
    this.B = [0.25, 0.5, 0.75];
    // faz hizalama: "en önde sol ayak" her klipte aynı ana denk gelmeyebilir (ör. depar klibinde iniş geç);
    // her klip bir öncekine, iki ayağın ileri–geri ve yükseklik izlerinin çapraz ilintisi en büyük olacak
    // şekilde kaydırılır. Hizasız karışımda ayaklar birbirini götürür ve adım boyu çöker.
    for (let i = 1; i < this.g.length; i++) {
      const A = this.g[i - 1], C = this.g[i]; if (!A.track || !C.track) continue;
      const n = A.track.length, m = C.track.length, norm = (t) => { const mu = [0, 1, 2, 3].map((c) => t.reduce((s, r) => s + r[c], 0) / t.length); const sd = [0, 1, 2, 3].map((c) => Math.sqrt(t.reduce((s, r) => s + (r[c] - mu[c]) ** 2, 0) / t.length) || 1); return t.map((r) => r.map((v, c) => (v - mu[c]) / sd[c])); };
      const a = norm(A.track), c = norm(C.track); let best = -1e9, off = 0;
      for (let d = 0; d < m; d++) {
        let sum = 0; for (let k = 0; k < n; k++) { const pa = ((k / n) + A.plantL) % 1, pc = ((k / n) + d / m) % 1; const ra = a[Math.floor(pa * n) % n], rc = c[Math.floor(pc * m) % m]; sum += ra[0] * rc[0] + ra[1] * rc[1] + ra[2] * rc[2] + ra[3] * rc[3]; }
        if (sum > best) { best = sum; off = d / m; }
      }
      C.plantL = off; C.align = best / n / 4;
    }
    if (root) for (let i = 0; i < this.g.length - 1; i++) {
      const A = this.g[i], C = this.g[i + 1];
      A.next = this.B.map((b) => sampleBlend(root, [{ clip: clips[A.name], w: 1 - b, plantL: A.plantL }, { clip: clips[C.name], w: b, plantL: C.plantL }]).stride);
    }
    this.phase = 0; this.w = 0; this.on = false; this.weights = this.g.map(() => 0);
  }
  // hız → [i, j, karışım]: klip i, kendi hızının 1.25 katına kadar tek başına oynar; oradan klip j'nin
  // hızının 0.85 katına kadar ikisi faz senkronlu karışır.
  pick(s) {
    const g = this.g;
    for (let i = 0; i < g.length - 1; i++) {
      const hi = g[i].speed * 1.25, lo = Math.max(hi + 0.3, g[i + 1].speed * 0.85);
      if (s <= hi) return [i, i, 0];
      if (s < lo) return [i, i + 1, THREE.MathUtils.smoothstep(s, hi, lo)];
    }
    return [g.length - 1, g.length - 1, 0];
  }
  strideAt(i, j, b) {
    const A = this.g[i], C = this.g[j];
    if (i === j || !A.next) return A.stride * (1 - b) + C.stride * b;
    const xs = [0, ...this.B, 1], ys = [A.stride, ...A.next, C.stride];
    let k = 0; while (k < xs.length - 2 && b > xs[k + 1]) k++;
    return ys[k] + (ys[k + 1] - ys[k]) * (b - xs[k]) / (xs[k + 1] - xs[k]);
  }
  start(fade) {
    if (this.on) return; this.on = true; this.fade = fade; this.w = 0;
    for (const x of this.g) { x.act.reset(); x.act.setLoop(THREE.LoopRepeat, Infinity); x.act.timeScale = 0; x.act.enabled = true; x.act.setEffectiveWeight(0); x.act.play(); }
  }
  stop(fade) {
    if (!this.on) return; this.on = false;
    // sönerken klipler doğal hızında akmaya devam etsin (donmasın)
    for (const x of this.g) { x.act.timeScale = x.dur / (this.period || x.dur); if (x.act.getEffectiveWeight() > 0) x.act.fadeOut(fade); else x.act.stop(); }
  }
  // mixer.stopAllAction sonrası (ölüm/yeniden doğma)
  kill() { this.on = false; this.weights.fill(0); }
  // s: gövde hızı (m/sn). Döner: en ağır klibin eylemi.
  update(dt, s) {
    const [i, j, b] = this.pick(s), A = this.g[i], B = this.g[j];
    const stride = this.strideAt(i, j, b);
    // döngü süresi = adım boyu / hız; çok yavaş/hızlı kadansı sınırla (o zaman küçük kayma kalır, ayak kilidi tamamlar)
    const P = THREE.MathUtils.clamp(stride / Math.max(s, 0.05), (A.dur * (1 - b) + B.dur * b) / 1.8, (A.dur * (1 - b) + B.dur * b) / 0.55);
    this.phase = (this.phase + dt / P) % 1; this.period = P; this.blend = [i, j, b];
    this.w = Math.min(1, this.w + dt / Math.max(0.01, this.fade));
    let top = null, tw = -1;
    this.g.forEach((x, k) => {
      const want = (k === i ? 1 - b : 0) + (k === j ? b : 0);
      this.weights[k] += (want - this.weights[k]) * Math.min(1, dt * 12);
      if (want > 0 && this.weights[k] < want * 0.25) this.weights[k] = want * 0.25; // yeni girilen klip geç kalmasın
      const ew = this.weights[k] * this.w;
      x.act.setEffectiveWeight(ew); x.act.timeScale = 0;
      x.act.time = ((this.phase + x.plantL) % 1) * x.dur;
      if (ew > tw) { tw = ew; top = x.act; }
    });
    return top;
  }
}
