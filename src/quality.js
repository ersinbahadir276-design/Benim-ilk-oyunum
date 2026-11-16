// Görüntü kalitesi ve mobil performans: ön ayarlar, uyarlanabilir çözünürlük, FPS ölçümü.
// Saf mantık (FrameGovernor, pickAutoPreset) DOM'a dokunmaz; testlerden doğrudan çağrılabilir.

export const PRESETS = {
  // pr: en yüksek piksel oranı · minScale: uyarlanabilir çözünürlüğün inebileceği alt sınır (pr ile çarpılır)
  // shadow: gölge haritası boyutu (0 = gölge yok) · shadowExt: gölge kutusunun yarı genişliği (m)
  // fogFar / camFar: görüş mesafesi · sleep: bu mesafeden uzak yabani hayvanlar uyur
  // lod / lodSkip: bu mesafeden uzak hayvanların iskelet animasyonu her lodSkip karede bir güncellenir
  low:    { name: 'Düşük',  pr: 1.0,  minScale: 0.6, aa: false, shadow: 0,    shadowExt: 24, fogFar: 150, camFar: 230, sleep: 90,  lod: 30, lodSkip: 3 },
  medium: { name: 'Orta',   pr: 1.25, minScale: 0.7, aa: true,  shadow: 1024, shadowExt: 28, fogFar: 205, camFar: 330, sleep: 115, lod: 50, lodSkip: 2 },
  high:   { name: 'Yüksek', pr: 1.75, minScale: 0.8, aa: true,  shadow: 2048, shadowExt: 38, fogFar: 260, camFar: 600, sleep: 130, lod: 80, lodSkip: 2 },
};
export const ORDER = ['low', 'medium', 'high'];
const KEY = 'yabanYoldaslari.quality';

// Cihaza göre başlangıç ön ayarı. env: { touch, ua, cores, memory, width, height }
export function pickAutoPreset(env) {
  const mobile = env.touch || /Android|iPhone|iPad|Mobile/i.test(env.ua || '');
  if (!mobile) return (env.cores && env.cores <= 2) ? 'medium' : 'high';
  const weak = (env.memory && env.memory <= 3) || (env.cores && env.cores <= 4);
  return weak ? 'low' : 'medium';
}

// Kare sürelerini 1 sn'lik pencerelerde toplar; düşük FPS sürerse 'down', uzun süre bol FPS varsa 'up' önerir.
export class FrameGovernor {
  constructor({ low = 40, high = 56, downWindows = 2, upWindows = 6, cooldown = 3 } = {}) {
    Object.assign(this, { low, high, downWindows, upWindows, cooldown });
    this.reset();
  }
  reset() { this.acc = 0; this.frames = 0; this.badN = 0; this.goodN = 0; this.cool = 0; this.fps = 0; }
  // dt: gerçek kare süresi (sn). Dönüş: 'down' | 'up' | null
  push(dt) {
    if (!(dt > 0) || dt > 0.5) return null;   // sekme arka plandaydı ya da duraklama: ölçme
    this.acc += dt; this.frames++; this.cool -= dt;
    if (this.acc < 1) return null;
    this.fps = this.frames / this.acc; this.acc = 0; this.frames = 0;
    if (this.fps < this.low) { this.badN++; this.goodN = 0; } else if (this.fps > this.high) { this.goodN++; this.badN = 0; } else { this.badN = 0; this.goodN = 0; }
    if (this.cool > 0) return null;
    if (this.badN >= this.downWindows) { this.badN = 0; this.cool = this.cooldown; return 'down'; }
    if (this.goodN >= this.upWindows) { this.goodN = 0; this.cool = this.cooldown; return 'up'; }
    return null;
  }
}

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function store(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* gizli sekme vb. */ } }

export class Quality {
  constructor(env, { adaptive = true } = {}) {
    const saved = load();
    this.choice = saved.choice in PRESETS || saved.choice === 'auto' ? saved.choice : 'auto';
    this.showFps = !!saved.fps;
    this.autoPreset = pickAutoPreset(env);
    this.level = this.choice === 'auto' ? this.autoPreset : this.choice;
    this.scale = 1; this.adaptive = adaptive; this.gov = new FrameGovernor();
    this.devicePR = env.dpr || 1; this.changes = 0;
  }
  get p() { return PRESETS[this.level]; }
  pixelRatio() { const p = this.p; return Math.max(0.5, Math.min(this.devicePR, p.pr) * this.scale); }

  // Oyunun renderer/sahne/kamera/güneşine ön ayarı uygula
  apply(g) {
    const p = this.p, r = g.renderer, sun = g.sun;
    r.setPixelRatio(this.pixelRatio()); r.setSize(innerWidth, innerHeight);
    if (p.shadow) {
      if (sun.shadow.mapSize.x !== p.shadow) { sun.shadow.mapSize.set(p.shadow, p.shadow); sun.shadow.map?.dispose(); sun.shadow.map = null; }
      Object.assign(sun.shadow.camera, { left: -p.shadowExt, right: p.shadowExt, top: p.shadowExt, bottom: -p.shadowExt }); sun.shadow.camera.updateProjectionMatrix();
    }
    sun.castShadow = !!p.shadow;
    g.scene.fog.far = p.fogFar; g.scene.fog.near = p.fogFar * 0.27;
    g.camera.far = p.camFar; g.camera.updateProjectionMatrix();
    this.changes++;
  }

  set(choice, g) {
    this.choice = choice; this.level = choice === 'auto' ? this.autoPreset : choice; this.scale = 1; this.gov.reset();
    store({ choice, fps: this.showFps }); if (g) this.apply(g);
  }
  setShowFps(v) { this.showFps = v; store({ choice: this.choice, fps: v }); }

  // Her karede gerçek dt ile çağrılır; gerekirse çözünürlüğü / ön ayarı değiştirir. Değişiklik olduysa true.
  tick(dtReal, g) {
    if (!this.adaptive) { this.gov.push(dtReal); return false; }
    const act = this.gov.push(dtReal); if (!act) return false;
    const p = this.p;
    if (act === 'down') {
      if (this.scale > p.minScale + 1e-3) this.scale = Math.max(p.minScale, +(this.scale - 0.1).toFixed(2));
      else if (this.choice === 'auto' && ORDER.indexOf(this.level) > 0) { this.level = ORDER[ORDER.indexOf(this.level) - 1]; this.scale = 1; }
      else return false;
    } else {
      if (this.scale >= 1) return false;   // ön ayar kendiliğinden yükseltilmez (titreşmeyi önler)
      this.scale = Math.min(1, +(this.scale + 0.1).toFixed(2));
    }
    if (g) this.apply(g);
    return true;
  }
  label() { return `${this.p.name}${this.choice === 'auto' ? ' (oto)' : ''} · ${Math.round(this.pixelRatio() * 100)}%`; }
}
