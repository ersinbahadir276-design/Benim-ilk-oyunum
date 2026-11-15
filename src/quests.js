// Görev sistemi: sıralı bir görev zinciri. Aynı anda en fazla 3 görev etkin (listede sırası gelen ilk 3
// tamamlanmamış görev). İlerleme oyun olaylarından (evcilleştirme, öldürme, toplama, seviye, yoldaş sayısı)
// gelir; ödül XP ve eşyadır. Durum kayda (Progress.snapshot) yazılır.
import { ITEMS } from './animal.js';
import { SPECIES } from './creatures.js';

// type: tame (kind ya da 'any'), kill (kind ya da 'any'; oyuncu ya da yoldaşın öldürmesi), gather (eşya adedi),
// level (oyuncu seviyesi), pets (aynı anda yoldaş sayısı), petLevel (herhangi bir yoldaşın seviyesi)
export const QUESTS = [
  { id: 'rabbit', title: 'İlk Dost', type: 'tame', kind: 'rabbit', n: 1, xp: 30, items: { carrot: 3 } },
  { id: 'berries', title: 'Orman Sofrası', type: 'gather', item: 'berry', n: 6, xp: 20, items: { apple: 2 } },
  { id: 'deer', title: 'Ürkek Geyik', type: 'tame', kind: 'deer', n: 1, xp: 45, items: { berry: 4 } },
  { id: 'wolves', title: 'Sürü Tehlikesi', type: 'kill', kind: 'wolf', n: 2, xp: 60, items: { meat: 3 } },
  { id: 'pack', title: 'Küçük Sürü', type: 'pets', n: 3, xp: 70, items: { honey: 1 } },
  { id: 'honey', title: 'Tatlı Ödül', type: 'gather', item: 'honey', n: 2, xp: 40, items: { meat: 2 } },
  { id: 'horse', title: 'Rüzgâr Gibi', type: 'tame', kind: 'horse', n: 1, xp: 80, items: { apple: 3 } },
  { id: 'lvl5', title: 'Yetişkin Avcı', type: 'level', n: 5, xp: 0, items: { fish: 3, honey: 1 } },
  { id: 'bond', title: 'Sadık Yoldaş', type: 'petLevel', n: 5, xp: 90, items: { meat: 4 } },
  { id: 'croc', title: 'Göl Bekçisi', type: 'tame', kind: 'crocodile', n: 1, xp: 110, items: { fish: 3 } },
  { id: 'moon', title: 'Ay Işığı', type: 'gather', item: 'moonstone', n: 2, xp: 80, items: { meat: 3 } },
  { id: 'shadow', title: 'Gölgelerin Efendisi', type: 'tame', kind: 'shadowbeast', n: 1, xp: 160, items: { moonstone: 1 } },
  { id: 'ogre', title: 'Dev Avı', type: 'kill', kind: 'ogre', n: 1, xp: 180, items: { honey: 2, meat: 4 } },
  { id: 'dragon', title: 'Ejder Binicisi', type: 'tame', kind: 'dragon', n: 1, xp: 400, items: {} },
];
export const ACTIVE_MAX = 3;
const BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

export function questText(q) {
  const sp = q.kind && q.kind !== 'any' ? SPECIES[q.kind].name : 'hayvan';
  switch (q.type) {
    case 'tame': return q.n > 1 ? `${q.n} ${sp} evcilleştir` : `Bir ${sp.toLocaleLowerCase('tr')} evcilleştir`;
    case 'kill': return `${q.n} ${sp.toLocaleLowerCase('tr')} yen`;
    case 'gather': return `${q.n} ${ITEMS[q.item].name.toLocaleLowerCase('tr')} topla`;
    case 'level': return `Seviye ${q.n}'e ulaş`;
    case 'pets': return `Aynı anda ${q.n} yoldaşın olsun`;
    case 'petLevel': return `Bir yoldaşını seviye ${q.n}'e çıkar`;
  }
  return q.title;
}
export function rewardText(q) {
  const parts = []; if (q.xp) parts.push(`${q.xp} XP`);
  for (const [k, v] of Object.entries(q.items || {})) parts.push(`${v} ${ITEMS[k].icon}`);
  return parts.join(' · ');
}

export class Quests {
  constructor(game) { this.g = game; this.done = new Set(); this.count = {}; this.dirty = true; }

  get active() { const out = []; for (const q of QUESTS) { if (this.done.has(q.id)) continue; out.push(q); if (out.length >= ACTIVE_MAX) break; } return out; }
  get allDone() { return this.done.size >= QUESTS.length; }
  // görevin şu anki ilerlemesi (sayaç ya da anlık durum)
  progress(q) {
    const g = this.g;
    if (q.type === 'level') return Math.min(q.n, g.prog.level);
    if (q.type === 'pets') return Math.min(q.n, g.pets.filter((p) => !p.dead).length);
    if (q.type === 'petLevel') return Math.min(q.n, Math.max(0, ...g.pets.map((p) => p.level || 1)));
    return Math.min(q.n, this.count[q.id] || 0);
  }
  _bump(match, n = 1) {
    for (const q of this.active) if (match(q)) { this.count[q.id] = (this.count[q.id] || 0) + n; this.dirty = true; }
    this.check();
  }
  onTame(a) { this._bump((q) => q.type === 'tame' && (q.kind === 'any' || q.kind === a.kind)); }
  onKill(victim) { this._bump((q) => q.type === 'kill' && (q.kind === 'any' || q.kind === victim.kind)); }
  onGather(item, n) { this._bump((q) => q.type === 'gather' && q.item === item, n); }

  // etkin görevleri tamamla, ödülleri ver. Bir görev bitince sıradaki etkinleşir; o da zaten tamamsa
  // (ör. seviye görevi) aynı çağrıda biter.
  check() {
    for (let guard = 0; guard < QUESTS.length; guard++) {
      const q = this.active.find((x) => this.progress(x) >= x.n); if (!q) return;
      this.complete(q);
    }
  }
  complete(q) {
    const g = this.g; this.done.add(q.id); delete this.count[q.id]; this.dirty = true;
    for (const [k, v] of Object.entries(q.items || {})) g.inv.add(k, v);
    g.msg(`📜 Görev tamamlandı: ${q.title}! Ödül: ${rewardText(q) || '—'}`);
    if (q.xp) g.prog.gain(q.xp, g.player);
    const nx = this.active[ACTIVE_MAX - 1]; if (nx && !this.allDone) g.msg(`📜 Yeni görev: ${nx.title} — ${questText(nx)}`);
    if (this.allDone) g.msg('🏆 Bütün görevler tamamlandı!');
  }
  update() { this.check(); }

  snapshot() { return { done: [...this.done], count: { ...this.count } }; }
  restore(d) {
    this.done = new Set((d?.done || []).filter((id) => BY_ID[id]));
    this.count = {}; for (const [k, v] of Object.entries(d?.count || {})) if (BY_ID[k] && Number.isFinite(v) && v > 0) this.count[k] = Math.min(BY_ID[k].n, v | 0);
    this.dirty = true;
  }
  reset() { this.done.clear(); this.count = {}; this.dirty = true; }
}
