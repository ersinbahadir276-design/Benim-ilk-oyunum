// İlerleme ve kayıt: oyuncu deneyimi (XP) / seviye sistemi ve localStorage kayıt-yükleme.
import { SPECIES } from './creatures.js';
import { ITEMS } from './animal.js';

export const MAX_LEVEL = 30;
// seviye n'den n+1'e geçmek için gereken XP
export const xpToNext = (lv) => Math.round(50 + 35 * (lv - 1) + 6 * (lv - 1) ** 2);
// türe göre XP ödülü: avlamak ve evcilleştirmek (evcilleştirme daha değerli)
export const killXP = (kind) => Math.max(4, Math.round(SPECIES[kind].hp / 6));
export const tameXP = (kind) => { const s = SPECIES[kind]; return Math.round(15 + s.hp / 4 + (s.tame?.steps || 1) * 5); };
export const GATHER_XP = 2;

export class Progression {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; this.total = 0; }
  get need() { return xpToNext(this.level); }
  get frac() { return this.level >= MAX_LEVEL ? 1 : this.xp / this.need; }
  // seviyeye bağlı oyuncu istatistikleri
  static stats(lv) { return { hpMax: 100 + (lv - 1) * 12, staminaMax: 100 + (lv - 1) * 4, dmgMul: 1 + (lv - 1) * 0.07, petBonus: 1 + (lv - 1) * 0.04 }; }
  get stats() { return Progression.stats(this.level); }
  apply(heal = false) {
    const P = this.g.player, s = this.stats; if (!P) return;
    P.hpMax = s.hpMax; P.staminaMax = s.staminaMax; P.dmgMul = s.dmgMul;
    if (heal) { P.hp = P.hpMax; P.stamina = P.staminaMax; } else { P.hp = Math.min(P.hp, P.hpMax); P.stamina = Math.min(P.stamina, P.staminaMax); }
  }
  gain(n, reason) {
    if (n <= 0 || this.level >= MAX_LEVEL) return 0;
    this.xp += n; this.total += n; let ups = 0;
    while (this.level < MAX_LEVEL && this.xp >= this.need) { this.xp -= this.need; this.level++; ups++; }
    if (this.level >= MAX_LEVEL) this.xp = 0;
    const P = this.g.player; if (P) this.g.floatText(`+${n} XP`, P, '#9fe6ff');
    if (ups) {
      this.apply(true); const s = this.stats;
      this.g.msg(`⭐ Seviye ${this.level}! Can ${s.hpMax}, dayanıklılık ${s.staminaMax}, hasar ×${s.dmgMul.toFixed(2)}`);
      this.g.ui.levelUp?.();
    } else if (reason) this.g.lastXP = reason;
    this.g.save?.dirty();
    return ups;
  }
}

/* ---------------- kayıt */
export const SAVE_KEY = 'yaban-yoldaslari-save-v1';
const store = () => { try { return window.localStorage; } catch { return null; } };

export function serialize(g) {
  const P = g.player;
  return {
    v: 1, t: Date.now(), time: g.time,
    level: g.prog.level, xp: g.prog.xp, total: g.prog.total,
    player: { x: +P.x.toFixed(2), z: +P.z.toFixed(2), hp: Math.round(P.hp), stamina: Math.round(P.stamina) },
    inv: { ...g.inv.items }, sel: g.inv.sel, petCounter: { ...g.petCounter },
    pets: g.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, hp: Math.round(p.hp), hunger: Math.round(p.hunger), stay: !!p.stay, x: +p.x.toFixed(2), z: +p.z.toFixed(2) })),
  };
}

// Kaydı doğrula: bozuk ya da eski biçimli veriyi oyuna sokma.
export function validate(d) {
  if (!d || d.v !== 1 || typeof d.level !== 'number' || !d.player) return null;
  const num = (v, lo, hi, def) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def);
  const out = { level: Math.round(num(d.level, 1, MAX_LEVEL, 1)), total: num(d.total, 0, 1e9, 0), time: num(d.time, 0, 1e9, 0) };
  out.xp = num(d.xp, 0, xpToNext(out.level) - 1, 0);
  out.player = { x: num(d.player.x, -190, 190, 0), z: num(d.player.z, -190, 190, 4), hp: num(d.player.hp, 1, 1e4, 100), stamina: num(d.player.stamina, 0, 1e4, 100) };
  out.inv = {}; for (const [k, v] of Object.entries(d.inv || {})) if (ITEMS[k] && Number.isFinite(v) && v > 0) out.inv[k] = Math.min(999, Math.floor(v));
  out.inv.flute = 1; out.sel = ITEMS[d.sel] ? d.sel : 'meat';
  out.petCounter = {}; for (const [k, v] of Object.entries(d.petCounter || {})) if (SPECIES[k] && Number.isFinite(v)) out.petCounter[k] = Math.max(0, Math.floor(v));
  out.pets = (Array.isArray(d.pets) ? d.pets : []).filter((p) => p && SPECIES[p.kind]?.tame && p.kind !== 'ogre').slice(0, 5).map((p) => ({
    kind: p.kind, name: String(p.name || SPECIES[p.kind].name).slice(0, 40), hp: num(p.hp, 1, 1e5, 50), hunger: num(p.hunger, 0, 100, 70), stay: !!p.stay, x: num(p.x, -190, 190, 0), z: num(p.z, -190, 190, 0),
  }));
  return out;
}

export class SaveSystem {
  constructor(game, { autosave = 20 } = {}) { this.g = game; this.every = autosave; this.t = autosave; this.changed = false; }
  dirty() { this.changed = true; }
  has() { return !!store()?.getItem(SAVE_KEY); }
  peek() { try { return validate(JSON.parse(store()?.getItem(SAVE_KEY) || 'null')); } catch { return null; } }
  write() { const s = store(); if (!s) return false; try { s.setItem(SAVE_KEY, JSON.stringify(serialize(this.g))); this.changed = false; this.t = this.every; return true; } catch { return false; } }
  clear() { store()?.removeItem(SAVE_KEY); }
  update(dt) { this.t -= dt; if (this.t <= 0) { this.t = this.every; if (this.g.player?.alive) this.write(); } }
  // kaydı oyuna uygula; başarılıysa true
  load(data = this.peek()) {
    const d = data && 'v' in data ? validate(data) : data; if (!d) return false;
    const g = this.g, P = g.player;
    g.prog.level = d.level; g.prog.xp = d.xp; g.prog.total = d.total; g.prog.apply(false);
    g.time = d.time;
    P.x = d.player.x; P.z = d.player.z; P.hp = Math.min(P.hpMax, d.player.hp); P.stamina = Math.min(P.staminaMax, d.player.stamina); P.snapToGround?.();
    g.inv.items = { ...d.inv }; g.inv.sel = d.sel; g.inv.dirty = true;
    [...g.pets].forEach((p) => g.removePet(p, false));
    g.petCounter = { ...d.petCounter };
    for (const sp of d.pets) {
      // aynı türden yabani bir hayvanı yoldaş yap; yoksa yenisini doğur
      let a = g.animals.filter((x) => x.kind === sp.kind && !x.tamed && !x.dead).sort((p, q) => Math.hypot(p.x - sp.x, p.z - sp.z) - Math.hypot(q.x - sp.x, q.z - sp.z))[0];
      if (!a) a = g.spawnAnimal(sp.kind, sp.x, sp.z);
      a.x = sp.x; a.z = sp.z; a.restorePet(sp);
    }
    g.buildHotbar(); return true;
  }
}
