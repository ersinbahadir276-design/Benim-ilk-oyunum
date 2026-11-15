// İlerleme sistemi: oyuncu ve yoldaş deneyim puanı (XP) / seviye, seviye bonusları ve kayıt (localStorage).
import { ITEMS } from './animal.js';
import { SPECIES } from './creatures.js';
import { Quests } from './quests.js';

export const SAVE_KEY = 'yaban-yoldaslari-save-v1';
export const PLAYER_MAX = 30, PET_MAX = 20;

// seviye L'den L+1'e geçmek için gereken XP
export const xpNeed = (L) => Math.round(40 + 35 * Math.pow(L - 1, 1.4));

// oyuncu bonusları
export const playerHpMax = (L) => 100 + 12 * (L - 1);
export const playerDmgMul = (L) => 1 + 0.08 * (L - 1);
// yoldaş bonusları (türün temel değerleri üzerine)
export const petHpMul = (L) => 1 + 0.1 * (L - 1);
export const petDmgMul = (L) => 1 + 0.1 * (L - 1);

// ödüller
export const killXP = (spec) => Math.max(4, Math.round(spec.hp * 0.35));
export const tameXP = (spec) => Math.round(25 + spec.hp * 0.3);
export const GATHER_XP = 2;

export class Progress {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; this.saveT = 20; this.enabled = true; this.quests = new Quests(game); this.qT = 0; }

  /* ---------------- oyuncu */
  applyPlayer(heal = false) {
    const P = this.g.player; const frac = P.hp / P.hpMax;
    P.hpMax = playerHpMax(this.level); P.dmgMul = playerDmgMul(this.level);
    P.hp = heal ? P.hpMax : Math.min(P.hpMax, Math.max(P.hp, frac * P.hpMax));
  }
  gain(n, src) {
    if (n <= 0 || this.level >= PLAYER_MAX) return;
    this.xp += n; const P = this.g.player;
    if (src) this.g.floatText(`+${n} XP`, src, '#9fe0ff');
    let up = false;
    while (this.level < PLAYER_MAX && this.xp >= xpNeed(this.level)) { this.xp -= xpNeed(this.level); this.level++; up = true; }
    if (this.level >= PLAYER_MAX) this.xp = 0;
    if (up) {
      this.applyPlayer(true);
      this.g.msg(`⭐ Seviye ${this.level}! Can ${P.hpMax}, saldırı gücü x${P.dmgMul.toFixed(2)}.`);
      this.g.floatText(`SEVİYE ${this.level}`, P, '#ffd75e');
    }
  }
  get frac() { return this.level >= PLAYER_MAX ? 1 : this.xp / xpNeed(this.level); }

  /* ---------------- yoldaşlar */
  initPet(a, level = 1, xp = 0) {
    a.level = level; a.xp = xp; this.applyPet(a, false);
  }
  applyPet(a, heal) {
    const frac = a.hp / a.hpMax;
    a.hpMax = Math.round(a.spec.hp * petHpMul(a.level)); a.dmgMul = petDmgMul(a.level);
    a.hp = heal ? a.hpMax : Math.min(a.hpMax, frac * a.hpMax);
  }
  resetPet(a) { const frac = a.hp / a.hpMax; a.level = 1; a.xp = 0; a.dmgMul = 1; a.hpMax = a.spec.hp; a.hp = Math.min(a.hpMax, frac * a.hpMax); }
  petGain(a, n) {
    if (!a.tamed || a.dead || n <= 0 || a.level >= PET_MAX) return;
    a.xp += n; let up = false;
    while (a.level < PET_MAX && a.xp >= xpNeed(a.level)) { a.xp -= xpNeed(a.level); a.level++; up = true; }
    if (a.level >= PET_MAX) a.xp = 0;
    if (up) { this.applyPet(a, true); this.g.msg(`⭐ ${a.petName} seviye ${a.level} oldu!`); this.g.floatText(`Sv ${a.level}`, a, '#ffd75e'); }
  }

  /* ---------------- olaylar */
  onKill(victim, from) {
    const xp = killXP(victim.spec), P = this.g.player;
    if (from === P) { this.gain(xp, victim); for (const p of this.g.pets) if (!p.dead && p.dist(P) < 30) this.petGain(p, Math.round(xp * 0.3)); }
    else if (from?.tamed) { this.petGain(from, xp); this.gain(Math.round(xp * 0.5), victim); }
    this.quests.onKill(victim);
  }
  onPetHit(pet, dmg) { this.petGain(pet, Math.max(1, Math.round(dmg * 0.25))); }
  onTame(a) { this.gain(tameXP(a.spec), a); this.quests.onTame(a); }
  onGather(node, item, n = 1) { this.gain(GATHER_XP); if (item) this.quests.onGather(item, n); }

  /* ---------------- kayıt */
  snapshot() {
    const g = this.g, P = g.player;
    return {
      v: 1, time: Date.now(),
      player: { x: +P.x.toFixed(2), z: +P.z.toFixed(2), hp: Math.round(P.alive ? P.hp : P.hpMax), level: this.level, xp: this.xp },
      inv: { items: { ...g.inv.items }, sel: g.inv.sel },
      petCounter: { ...g.petCounter }, quests: this.quests.snapshot(),
      pets: g.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, level: p.level || 1, xp: p.xp || 0, hunger: Math.round(p.hunger), hp: +(p.hp / p.hpMax).toFixed(3), stay: !!p.stay })),
    };
  }
  save() {
    if (!this.enabled) return false;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.snapshot())); return true; } catch { return false; }
  }
  static read() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
  static clear() { try { localStorage.removeItem(SAVE_KEY); } catch { /* yok */ } }

  // kaydı oyuna uygula. makeAnimal(kind, x, z) yeni bir hayvan döndürür.
  restore(d, makeAnimal) {
    if (!d || d.v !== 1) return false;
    const g = this.g, P = g.player;
    this.level = Math.min(PLAYER_MAX, Math.max(1, d.player?.level | 0 || 1)); this.xp = Math.max(0, +d.player?.xp || 0);
    if (Number.isFinite(d.player?.x) && Number.isFinite(d.player?.z)) { P.x = d.player.x; P.z = d.player.z; }
    this.applyPlayer(true); if (Number.isFinite(d.player?.hp)) P.hp = Math.min(P.hpMax, Math.max(1, d.player.hp));
    if (d.inv?.items) { const items = {}; for (const [k, v] of Object.entries(d.inv.items)) if (ITEMS[k] && v > 0) items[k] = v | 0; items.flute = 1; g.inv.items = items; if (ITEMS[d.inv.sel]) g.inv.sel = d.inv.sel; g.inv.dirty = true; }
    g.petCounter = { ...(d.petCounter || {}) }; this.quests.restore(d.quests);
    let i = 0;
    for (const s of (d.pets || []).slice(0, 5)) {
      if (!SPECIES[s.kind]?.tame) continue;
      // aynı türden bir yabaniyi dünyadan çıkar (nüfus sabit kalsın; ejderha tek)
      const wi = g.animals.findIndex((a) => a.kind === s.kind && !a.tamed);
      if (wi >= 0) { const w = g.animals[wi]; g.scene.remove(w.c.root); g.animals.splice(wi, 1); }
      const ang = P.yaw + Math.PI + (i++ - 2) * 0.6, a = makeAnimal(s.kind, P.x + Math.sin(ang) * 3, P.z + Math.cos(ang) * 3);
      a.tamed = true; a.petName = s.name || a.spec.name; a.stay = !!s.stay; a.hunger = Math.min(100, Math.max(0, +s.hunger || 70));
      a.altGoal = a.alt = a.spec.kind === 'bird' ? 4 : 0;
      this.initPet(a, Math.min(PET_MAX, Math.max(1, s.level | 0 || 1)), Math.max(0, +s.xp || 0));
      a.hp = Math.max(1, a.hpMax * Math.min(1, Math.max(0.05, +s.hp || 1)));
      a.set('follow'); g.pets.push(a);
    }
    return true;
  }
  update(dt) {
    this.qT -= dt; if (this.qT <= 0) { this.qT = 0.5; this.quests.update(); }
    this.saveT -= dt;
    if (this.saveT <= 0) { this.saveT = 20; this.save(); }
  }
}
