// İlerleme sistemi: oyuncu ve yoldaş deneyim/seviye, seviye bonusları ve kayıt (localStorage).
import { ITEMS } from './animal.js';

export const SAVE_KEY = 'yaban-yoldaslari-save-v1';
export const MAX_LEVEL = 30, PET_MAX_LEVEL = 20;
// seviye l → l+1 için gereken XP
export const xpNeed = (l) => Math.round(40 * Math.pow(l, 1.5));
// türün öldürülme / evcilleştirilme ödülleri (can ve hasara göre)
export const killXP = (spec) => Math.round(spec.hp / 5 + spec.dmg);
export const tameXP = (spec) => 20 + killXP(spec) * 2;
export const GATHER_XP = 2;

// oyuncu seviye bonusları
export const playerStats = (lvl) => ({ hpMax: 100 + (lvl - 1) * 10, dmgMul: 1 + (lvl - 1) * 0.08, stMax: 100 + (lvl - 1) * 4 });
// yoldaş seviye bonusları
export const petMul = (lvl) => 1 + (lvl - 1) * 0.1;

export class Progress {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; this.kills = 0; this.tames = 0; this.saveT = 30; this.dirty = true; }
  get need() { return xpNeed(this.level); }
  get dmgMul() { return playerStats(this.level).dmgMul; }

  /* ---------------- oyuncu */
  gain(n, why) {
    if (n <= 0 || this.level >= MAX_LEVEL) return;
    this.xp += n; this.dirty = true;
    const P = this.g.player; if (why) this.g.floatText(`+${n} XP`, P, '#9fd8ff');
    while (this.level < MAX_LEVEL && this.xp >= this.need) {
      this.xp -= this.need; this.level++;
      this.applyStats(true);
      this.g.msg(`⭐ Seviye ${this.level}! Can ${P.hpMax}, saldırı +%${Math.round((this.dmgMul - 1) * 100)}.`);
      this.g.floatText(`SEVİYE ${this.level}`, P, '#ffd75e');
    }
    if (this.level >= MAX_LEVEL) this.xp = 0;
  }
  applyStats(heal) {
    const P = this.g.player, s = playerStats(this.level);
    P.hpMax = s.hpMax; P.stMax = s.stMax; if (heal) { P.hp = P.hpMax; P.stamina = P.stMax; }
    P.hp = Math.min(P.hp, P.hpMax);
  }

  /* ---------------- yoldaş */
  initPet(p, lvl = 1, xp = 0) { p.level = lvl; p.xp = xp; this.applyPet(p); }
  applyPet(p) { const f = p.hpMax ? p.hp / p.hpMax : 1; p.hpMax = Math.round(p.spec.hp * petMul(p.level)); p.hp = p.hpMax * f; p.dmgMul = petMul(p.level); }
  petGain(p, n) {
    if (!p.tamed || p.dead || n <= 0 || p.level >= PET_MAX_LEVEL) return;
    p.xp += n; this.dirty = true;
    while (p.level < PET_MAX_LEVEL && p.xp >= xpNeed(p.level)) {
      p.xp -= xpNeed(p.level); p.level++; this.applyPet(p); p.hp = p.hpMax;
      this.g.msg(`🐾 ${p.petName} seviye ${p.level} oldu! (can ${p.hpMax}, saldırı x${p.dmgMul.toFixed(1)})`);
      this.g.floatText(`Sv ${p.level}`, p, '#ffd75e');
    }
  }

  /* ---------------- olaylar */
  onKill(a, from) {
    const g = this.g, xp = killXP(a.spec);
    if (from !== g.player && !from?.tamed) return;
    this.kills++; this.gain(xp, true);
    // savaşan yoldaşlar ödülü paylaşır; son vuruşu yapan fazladan alır
    for (const p of g.pets) if (!p.dead && (p === from || p.target === a || p.dist(a) < 14)) this.petGain(p, p === from ? xp : Math.ceil(xp * 0.6));
  }
  onTame(a) { this.tames++; this.gain(tameXP(a.spec), true); if (!a.level) this.initPet(a); }
  onGather() { this.gain(GATHER_XP, false); }

  /* ---------------- kayıt */
  snapshot() {
    const g = this.g, P = g.player;
    return {
      v: 1, t: Date.now(), level: this.level, xp: this.xp, kills: this.kills, tames: this.tames,
      player: { x: +P.x.toFixed(2), z: +P.z.toFixed(2), hp: Math.round(P.alive ? P.hp : P.hpMax) },
      inv: { ...g.inv.items }, sel: g.inv.sel, petCounter: { ...g.petCounter },
      pets: g.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, level: p.level || 1, xp: p.xp || 0, hunger: Math.round(p.hunger), hp: +(p.hp / p.hpMax).toFixed(3), stay: !!p.stay })),
    };
  }
  save(store = localStorage) {
    try { store.setItem(SAVE_KEY, JSON.stringify(this.snapshot())); this.dirty = false; this.savedAt = Date.now(); return true; } catch { return false; }
  }
  static read(store = localStorage) {
    try { const d = JSON.parse(store.getItem(SAVE_KEY)); return validSave(d) ? d : null; } catch { return null; }
  }
  static clear(store = localStorage) { try { store.removeItem(SAVE_KEY); } catch { /* yok say */ } }
  // kaydı oyuna uygula; makePet(kind, x, z) yeni bir hayvan döndürür
  load(d, makePet) {
    const g = this.g, P = g.player;
    this.level = Math.min(MAX_LEVEL, Math.max(1, d.level | 0)); this.xp = Math.max(0, +d.xp || 0); this.kills = d.kills | 0; this.tames = d.tames | 0;
    this.applyStats(false);
    P.x = d.player.x; P.z = d.player.z; P.hp = Math.min(P.hpMax, Math.max(1, d.player.hp)); P.y = 0;
    g.inv.items = {}; for (const [k, n] of Object.entries(d.inv)) if (ITEMS[k] && n > 0) g.inv.items[k] = Math.floor(n);
    if (!g.inv.items.flute) g.inv.items.flute = 1; if (d.sel && g.inv.items[d.sel]) g.inv.sel = d.sel; g.inv.dirty = true;
    g.petCounter = { ...d.petCounter };
    for (const s of d.pets.slice(0, 5)) {
      const a = makePet(s.kind, P.x + (Math.random() - 0.5) * 4, P.z - 2 - Math.random() * 2); if (!a) continue;
      a.tamed = true; a.petName = s.name; a.hunger = Math.min(100, Math.max(0, s.hunger)); a.stay = !!s.stay; a.altGoal = a.spec.kind === 'bird' ? 4 : 0;
      this.initPet(a, Math.min(PET_MAX_LEVEL, Math.max(1, s.level | 0)), Math.max(0, +s.xp || 0)); a.hp = a.hpMax * Math.min(1, Math.max(0.1, s.hp));
      a.set('follow'); g.pets.push(a);
    }
    this.dirty = false;
  }
  update(dt) { this.saveT -= dt; if (this.saveT <= 0) { this.saveT = 30; if (this.autosave) this.save(); } }
}

export function validSave(d) {
  return !!d && d.v === 1 && Number.isFinite(d.level) && d.player && Number.isFinite(d.player.x) && Number.isFinite(d.player.z) && d.inv && typeof d.inv === 'object' && Array.isArray(d.pets);
}
