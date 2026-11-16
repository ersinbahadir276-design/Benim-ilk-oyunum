// Kayıt sistemi: oyuncu, ilerleme, envanter ve yoldaşları localStorage'a yazar / geri yükler.
import { ITEMS } from './animal.js';
import { SPECIES } from './creatures.js';

export const SAVE_KEY = 'yaban-yoldaslari-save-v1';
export const SAVE_VERSION = 1;

// tarayıcı depolaması kapalı/gizli modda hata atabilir: hepsi try/catch içinde
const store = () => { try { return window.localStorage; } catch { return null; } };

export function serialize(g) {
  const P = g.player;
  return {
    v: SAVE_VERSION, t: Date.now(),
    player: { x: +P.x.toFixed(2), z: +P.z.toFixed(2), yaw: +P.yaw.toFixed(3), hp: Math.max(1, Math.round(P.alive ? P.hp : P.hpMax)) },
    progress: g.progress.toJSON(),
    inv: { items: { ...g.inv.items }, sel: g.inv.sel },
    petCounter: { ...g.petCounter },
    pets: g.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, level: p.level, xp: p.xp, hunger: Math.round(p.hunger), hp: Math.round(p.hp), stay: !!p.stay })),
  };
}

// doğrulanmış veriyi oyuna uygular. Geçersizse false.
export function applySave(g, d) {
  if (!d || d.v !== SAVE_VERSION || !d.player) return false;
  const P = g.player;
  g.progress.load(d.progress);
  // envanter: yalnızca bilinen eşyalar ve geçerli sayılar
  const items = {}; for (const [k, v] of Object.entries(d.inv?.items || {})) if (ITEMS[k] && Number.isFinite(v) && v > 0) items[k] = Math.min(999, Math.floor(v));
  items.flute = 1; g.inv.items = items; g.inv.sel = items[d.inv?.sel] ? d.inv.sel : 'flute'; g.inv.dirty = true;
  // oyuncu
  const fin = (n, def) => (Number.isFinite(n) ? n : def);
  P.x = fin(d.player.x, 0); P.z = fin(d.player.z, 4); P.yaw = fin(d.player.yaw, Math.PI); P.vy = 0; P.y = P.groundY();
  P.hp = Math.min(P.hpMax, Math.max(1, fin(d.player.hp, P.hpMax)));
  // mevcut yoldaşları kaldır, kayıttakileri yeniden oluştur
  for (const p of [...g.pets]) g.dropAnimal(p);
  g.petCounter = {}; for (const [k, v] of Object.entries(d.petCounter || {})) if (SPECIES[k]) g.petCounter[k] = v | 0;
  (d.pets || []).filter((p) => SPECIES[p.kind]?.tame).slice(0, 5).forEach((p, i) => {
    const a = Math.PI * 2 * i / 5, x = P.x + Math.sin(a) * 3, z = P.z + Math.cos(a) * 3;
    g.addAnimal(p.kind, x, z).restorePet(p);
  });
  g.buildHotbar(); return true;
}

export function writeSave(g, s = store()) { if (!s) return false; try { s.setItem(SAVE_KEY, JSON.stringify(serialize(g))); return true; } catch { return false; } }
export function readSave(s = store()) { if (!s) return null; try { const d = JSON.parse(s.getItem(SAVE_KEY)); return d && d.v === SAVE_VERSION ? d : null; } catch { return null; } }
export function clearSave(s = store()) { try { s?.removeItem(SAVE_KEY); } catch { /* yok say */ } }
