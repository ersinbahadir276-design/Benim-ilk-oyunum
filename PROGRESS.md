# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin (her çalışmada bir özellik ilerletir) takip listesidir.
Ana oyun: `ay-kiliccisi/` (Ay Kılıççısı: Kara Zırh). Ayrıntılı oyun günlüğü ve yol haritası: `ay-kiliccisi/PROGRESS.md`.
Eski oyun (Yaban Yoldaşları): `yaban.html` + `src/`.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel model var; zırh yeniden tasarımı 1. adım bitti (bkz. çalışma 1) |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı (rutin) — oyunda prosedürel pozlar var |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, saç GLB, elf gövdesi oyunda; `assets/models/hero*.glb` yalnızca eski oyunda) |
| 4 | Birden çok hayvan ve yaratık | Kısmen (kurt, goblin, timsah, ejderha; eski oyunda 14 tür) |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen (eski oyunda tam; Ay Kılıççısı'nda kurt besleme + Veyra yoldaş YZ) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (bkz. `ay-kiliccisi/PROGRESS.md` aşama 1–2) |
| 7 | Android performansı ve mobil kontroller | Kısmen (dokunmatik PS düzeni, 30 m dış çizgi sınırı; gerçek cihaz testi yok) |

## Tamamlananlar

_(Henüz rutin listesinden tamamen biten özellik yok.)_

## Çalışma günlüğü

### Çalışma 1 — 2026-11-24 · Özellik 1: kahraman zırhı yeniden tasarımı (1. adım)
Kullanıcının bekleyen isteği ("kahraman zırhını yeniden tasarla") ele alındı. `ay-kiliccisi/tools/sculpt/models/hero.mjs`:
- Göğüs zırhına kabartma bronz **hilal + yıldız** arması (oyunun adındaki "Ay"; tarikat işareti).
- Kemerin altından dizlere inen **kızıl savaş önlüğü** (tabard): kıvrımlı kumaş, yırtık etek ucu, bronz üst şerit,
  üstünde hilal aplike. Kalça + iki bacak kemiğine ağırlıklı, yürürken bacaklarla sallanır. Tassetler arasındaki boşluğu kapatır.
- Pelerini tutan **iki bronz toka** ve aralarında **zincir**.
- Kemer takımı: sağ kalçada dikişli **deri kese**, sol kalçada kınında **rondel hançer**.
- Üçgen bütçesi 21k → 23k (gerçek 22,8k). Model yeniden heykellendi, `data/models.js` ve `dist/ay-kiliccisi.html` yeniden üretildi.
- Not: `tools/sculpt/cache/` git'te yok; tek model yeniden yapılırken diğer modeller kaybolmasın diye önce
  `data/models.js` içinden önbellek geri açıldı (komut aşağıda).

Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-perf ve s-hero hatasız (koşarken önlük bacaklarla birlikte hareket ediyor). Kök `index.html` de yeni derlemeyle güncellendi.

## Sıradaki öncelikler
1. Kahraman (devam): miğfer altı yüz seçeneği (miğfersiz sahneler için), sırt kını / kılıç askısı, pelerin fiziği
   (CapeA–C kemiklerine yay benzetimi), uzak mesafe LOD modeli (~8k üçgen) — Android için.
2. Animasyon: duruşa özgü pozlar (hamle/saplama), yürüme/koşu döngüsüne ağırlık aktarımı, el IK'sı.
3. `assets/models/hero*.glb` animasyon kliplerini Ay Kılıççısı iskeletine yeniden hedeflemeyi değerlendir.

## Yardımcı komutlar
```bash
cd ay-kiliccisi
# heykel önbelleğini mevcut data/models.js'ten geri aç (tek model derlemeden önce şart)
node -e 'const fs=require("fs"),z=require("zlib");const s=fs.readFileSync("data/models.js","utf8");fs.mkdirSync("tools/sculpt/cache",{recursive:true});for(const m of s.matchAll(/(\w+):"([^"]+)"/g))fs.writeFileSync("tools/sculpt/cache/"+m[1]+".bin",z.gunzipSync(Buffer.from(m[2],"base64")))'
(cd tools/sculpt && npm install)
node --max-old-space-size=6000 tools/sculpt/build.mjs hero
python3 tools/build.py
NODE_PATH=$(npm root -g) node test/harness.js test/s-mech.js
```
