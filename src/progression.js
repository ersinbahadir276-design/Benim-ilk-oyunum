// İlerleme sistemi: oyuncu deneyimi/seviyesi, yoldaş bağ seviyesi ve kayıt (save/load).
import { floorY } from './world.js';

// Oyun döngüsünden bağımsız tutuldu; Game nesnesine yalnızca kancalar (hook) üzerinden bağlanır.

export const MAX_LEVEL = 20, MAX_BOND = 10, SAVE_KEY = 'yaban-yoldaslari-save-v1';

// L → L+1 için gereken deneyim
export const xpNeed = (L) => Math.round(60 + 45 * (L - 1) + 6 * (L - 1) ** 2);
// yoldaş bağı: B → B+1 için gereken bağ puanı
export const bondNeed = (B) => 30 + 25 * (B - 1);

// Seviyeye göre oyuncu nitelikleri (saf fonksiyon: kayıttan geri yüklemede de aynı sonuç)
export function playerStats(L) {
  const k = L - 1;
  return { hpMax: 100 + 12 * k, staminaMax: 100 + 5 * k, dmgMul: 1 + 0.07 * k, regen: 1.2 + 0.1 * k };
}
// Bağ seviyesine göre yoldaş çarpanları
export function bondStats(B) { const k = B - 1; return { hpMul: 1 + 0.08 * k, dmgMul: 1 + 0.06 * k }; }

// Öldürme ödülü: türün canına ve tehlikesine göre
export const killXP = (spec) => Math.round(spec.hp * 0.22 + spec.dmg * 0.9 + 4);
// Evcilleştirme ödülü: zorluk = adım sayısı + türün gücü
export const tameXP = (spec) => Math.round(20 + spec.hp * 0.25 + (spec.tame?.steps || 1) * 8);

export class Progression {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; this.total = 0; this.tamedKinds = {}; this.kills = 0; }

  // oyuncuya seviye niteliklerini uygula (can oranını korur)
  applyStats(heal = false) {
    const P = this.g.player, s = playerStats(this.level), frac = P.hp / P.hpMax;
    P.hpMax = s.hpMax; P.staminaMax = s.staminaMax; P.dmgMul = s.dmgMul; P.regen = s.regen;
    P.hp = heal ? P.hpMax : Math.min(P.hpMax, Math.max(1, frac * P.hpMax));
    P.stamina = Math.min(P.stamina, P.staminaMax);
  }
  gain(n, src) {
    if (n <= 0 || this.level >= MAX_LEVEL) { if (this.level >= MAX_LEVEL) this.total += n; return 0; }
    this.xp += n; this.total += n; let ups = 0;
    if (src && this.g.player) this.g.floatText(`+${n} XP`, this.g.player, '#9fe0ff');
    while (this.level < MAX_LEVEL && this.xp >= xpNeed(this.level)) { this.xp -= xpNeed(this.level); this.level++; ups++; }
    if (this.level >= MAX_LEVEL) this.xp = 0;
    if (ups) {
      this.applyStats(true);
      const s = playerStats(this.level);
      this.g.msg(`⭐ Seviye ${this.level}! Can ${s.hpMax}, saldırı ×${s.dmgMul.toFixed(2)}`);
      this.g.floatText(`SEVİYE ${this.level}`, this.g.player, '#ffd75e');
    }
    this.g.ui.levelDirty = true;
    return ups;
  }
  // olay kancaları
  onKill(animal) { this.kills++; this.gain(killXP(animal.spec), 'kill'); }
  onTameStep(animal) { this.gain(6, 'trust'); }
  onTame(animal) {
    const first = !this.tamedKinds[animal.kind]; this.tamedKinds[animal.kind] = (this.tamedKinds[animal.kind] || 0) + 1;
    const n = tameXP(animal.spec) * (first ? 2 : 1); if (first) this.g.msg(`📖 Yeni tür evcilleştirildi: ${animal.spec.name} (ilk kez ×2 XP)`);
    this.gain(n, 'tame');
  }
  onGather() { this.gain(3, 'gather'); }
  onFeedPet(pet) { this.bond(pet, 6); }
  onPetKill(pet, victim) { this.bond(pet, Math.round(killXP(victim.spec) * 0.6)); this.gain(Math.round(killXP(victim.spec) * 0.5), 'pet'); }

  // yoldaş bağı
  initPet(pet, bond = 1, bxp = 0) { pet.bond = bond; pet.bondXP = bxp; this.applyBond(pet); }
  applyBond(pet) {
    const s = bondStats(pet.bond || 1), frac = pet.hp / pet.hpMax;
    pet.hpMax = Math.round(pet.spec.hp * s.hpMul); pet.dmgMul = s.dmgMul; pet.hp = Math.max(1, frac * pet.hpMax);
  }
  bond(pet, n) {
    if (!pet.tamed || pet.dead) return 0;
    if ((pet.bond || 1) >= MAX_BOND) return 0;
    pet.bondXP = (pet.bondXP || 0) + n; let ups = 0;
    while (pet.bond < MAX_BOND && pet.bondXP >= bondNeed(pet.bond)) { pet.bondXP -= bondNeed(pet.bond); pet.bond++; ups++; }
    if (pet.bond >= MAX_BOND) pet.bondXP = 0;
    if (ups) { this.applyBond(pet); pet.hp = pet.hpMax; this.g.msg(`💞 ${pet.petName} ile bağın güçlendi: Bağ ${pet.bond}`); this.g.floatText(`BAĞ ${pet.bond}`, pet, '#ff9fd0'); }
    return ups;
  }

  /* ---------------- kayıt */
  serialize() {
    const g = this.g, P = g.player;
    return {
      v: 1, t: Date.now(),
      player: { level: this.level, xp: this.xp, total: this.total, kills: this.kills, hp: Math.round(P.hp), x: +P.x.toFixed(2), z: +P.z.toFixed(2), yaw: +P.yaw.toFixed(3) },
      tamedKinds: { ...this.tamedKinds },
      inv: { ...g.inv.items }, sel: g.inv.sel,
      petCounter: { ...g.petCounter },
      pets: g.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, bond: p.bond || 1, bondXP: p.bondXP || 0, hunger: Math.round(p.hunger), hp: Math.round(p.hp), stay: !!p.stay })),
      nodes: g.world.nodes.map((n) => (n.ready ? 0 : Math.round(n.timer))),
    };
  }
  // Kayıt verisini oyuna uygula. Döndürür: geri yüklenen yoldaş sayısı.
  apply(d) {
    if (!d || d.v !== 1) return -1;
    const g = this.g, P = g.player, pl = d.player || {};
    this.level = Math.min(MAX_LEVEL, Math.max(1, pl.level | 0 || 1)); this.xp = Math.max(0, pl.xp || 0); this.total = pl.total || 0; this.kills = pl.kills || 0;
    this.tamedKinds = { ...(d.tamedKinds || {}) };
    this.applyStats(true); if (pl.hp > 0) P.hp = Math.min(P.hpMax, pl.hp);
    if (Number.isFinite(pl.x) && Number.isFinite(pl.z)) { P.x = pl.x; P.z = pl.z; P.yaw = pl.yaw || 0; P.vy = 0; P.y = floorY(P.x, P.z, 0.95); }
    if (d.inv) { g.inv.items = { flute: 1 }; for (const [k, v] of Object.entries(d.inv)) if (v > 0) g.inv.items[k] = v | 0; g.inv.sel = d.sel; g.inv.dirty = true; }
    if (Array.isArray(d.nodes)) d.nodes.forEach((t, i) => { const n = g.world.nodes[i]; if (n && t > 0) { n.ready = false; n.timer = t; n.fruit.visible = false; } });
    // yoldaşlar: aynı türden yabani bir bireyi yoldaş olarak geri getir
    [...g.pets].forEach((p) => g.removePet(p, false));
    let restored = 0;
    for (const sp of (d.pets || []).slice(0, 5)) {
      const a = g.animals.filter((x) => x.kind === sp.kind && !x.tamed && !x.dead).sort((p, q) => p.dist(P) - q.dist(P))[0];
      if (!a) continue;
      const ang = restored * 1.2; a.x = P.x + Math.sin(ang) * 2.5; a.z = P.z + Math.cos(ang) * 2.5;
      a.becomePet(true); a.petName = sp.name || a.petName; a.hunger = Math.min(100, Math.max(5, sp.hunger ?? 70)); a.stay = !!sp.stay;
      this.initPet(a, Math.min(MAX_BOND, Math.max(1, sp.bond | 0 || 1)), sp.bondXP || 0); if (sp.hp > 0) a.hp = Math.min(a.hpMax, sp.hp);
      restored++;
    }
    g.petCounter = { ...(d.petCounter || {}) };
    g.ui.levelDirty = true;
    return restored;
  }
  save(store = globalThis.localStorage) { try { store.setItem(SAVE_KEY, JSON.stringify(this.serialize())); return true; } catch { return false; } }
  load(store = globalThis.localStorage) { try { const s = store.getItem(SAVE_KEY); return s ? this.apply(JSON.parse(s)) : -1; } catch { return -1; } }
  static hasSave(store = globalThis.localStorage) { try { return !!store.getItem(SAVE_KEY); } catch { return false; } }
  static clear(store = globalThis.localStorage) { try { store.removeItem(SAVE_KEY); } catch { /* yok */ } }
}
