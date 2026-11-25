# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin özet takibidir. Ayrıntılı oyun günlüğü: `ay-kiliccisi/PROGRESS.md`
(aktif oyun: **Ay Kılıççısı**, `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası; eski oyun `yaban.html`).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel modeli var; zırh yeniden tasarımı başladı (oturum R1) |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı — tüm hareketler kodla üretilen pozlar; anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerinin entegrasyonu | Kısmen — ejderha, elf gövdesi (kraliçe), saç GLB'si bağlı; diğerlerinden yalnızca iskelet oranları |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha; zindan yaratıkları yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — Veyra yoldaş YZ'si, kurt besleme; evcil yaratık sistemi Ay Kılıççısı'nda yok |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var — ayrıntı `ay-kiliccisi/PROGRESS.md` |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik düzen, kalite seviyeleri; gerçek cihazda test edilmedi |

## Tamamlanan (rutin)

### Oturum R1 — 2026-11-25 — Özellik 1: kahraman zırhı, siluet geçişi
- `tools/sculpt/models/hero.mjs`: bel lamelleri ve kemer daraltıldı (V gövde), tasset'ler daha dar/kısa ve dışa açılan
  lameller (etek görünümü kalktı), kalın bronz bant yerine en alt lamelde ince bronz kenar, uyluk ve cuisse inceltildi,
  vizör T-yarığı daraltıldı (çizgi film gibi büyük kızıl parıltı yerine keskin yarık), üçgen bütçesi 21k → 22.5k.
- `data/models.js` yeniden üretildi (yalnızca kahraman yeniden heykellendi; diğer modeller önbellekten aynen alındı).
- Test düzeltmesi: `test/s-ui.js` SALDIR basılı tutma testi 2,5 sn bekliyordu; oyun yüklemeyi 1,3 sn'de kendisi
  bıraktığı için test eski davranışı ölçüyordu (bu oturumdan önce de başarısızdı). Örnek alma 0,7 sn'ye çekildi.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7 (kayıt testi 4 koşudan 1'inde zamanlamaya bağlı
  başarısız — önceden var olan kararsızlık), s-perf hatasız.

## Sıradaki öncelikler
1. Özellik 1 devam: göğüs zırhına ön sırt/kabartma ve göbek plakası, pauldron'ları kahramana özgü siluete çekme,
   miğfer + yüz: miğfersiz/vizör açık görünüm seçeneği (kahramanın yüzü hiç görünmüyor), pelerin uzunluğu.
2. Özellik 2: kahraman için anahtar kareli klip sistemi (poz kareleri + harmanlama + ayak IK) — yürüme/koşu döngüsü ilk.
3. `s-ui.js` kayıt testinin kararsızlığı (yeniden yüklemeden önce kaydın bitmesini beklemeli).

## Notlar
- Model önbelleği (`tools/sculpt/cache/`) git'te yok. Tek model yeniden yaparken diğerleri kaybolmasın diye önce:
  `cd ay-kiliccisi/tools/sculpt && npm install && mkdir -p cache && node -e 'const fs=require("fs"),z=require("zlib");const t=fs.readFileSync("../../data/models.js","utf8");for(const m of t.matchAll(/^(\w+):"([^"]+)",$/gm))fs.writeFileSync("cache/"+m[1]+".bin",z.gunzipSync(Buffer.from(m[2],"base64")))'`
  sonra `node --max-old-space-size=6000 build.mjs hero`, ardından `python3 tools/build.py` ve `cp dist/ay-kiliccisi.html ../index.html`.
