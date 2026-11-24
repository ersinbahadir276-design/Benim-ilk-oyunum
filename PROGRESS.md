# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya her otomatik çalıştırmada okunur ve güncellenir. Aktif oyun: **Ay Kılıççısı** (`ay-kiliccisi/`,
ayrıntılı yol haritası `ay-kiliccisi/PROGRESS.md`). Kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası.

Derleme / test:
- Kahraman modeli: `cd ay-kiliccisi && node --max-old-space-size=6000 tools/sculpt/build.mjs hero`
  (önce `tools/sculpt/cache/` yoksa `data/models.js` içindeki modeller oraya açılmalı — aksi hâlde diğer modeller kaybolur;
  açma betiği aşağıda), sonra `python3 tools/build.py`, sonra `cp dist/ay-kiliccisi.html ../index.html`.
- Testler: `NODE_PATH=$(npm root -g) node test/harness.js test/s-mech.js` (47), `s-loop.js` (71), `s-stance.js` (11), `s-ui.js` (7), `s-perf.js`.
- Model görüntüleme: `node test/view.js hero <çıktı> yaw,pitch,dist,ty`.

Önbelleği açma: `node -e "const fs=require('fs'),z=require('zlib');for(const m of fs.readFileSync('data/models.js','utf8').matchAll(/^(\w+):\"([^\"]+)\"/gm))fs.writeFileSync('tools/sculpt/cache/'+m[1]+'.bin',z.gunzipSync(Buffer.from(m[2],'base64')))"`

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Devam ediyor** — Kael SDF heykel modeli var; zırh yeniden tasarımı başladı (çalıştırma 1) |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı (tüm pozlar kodla; anahtar kareli klip sistemi yok) |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, kraliçe elf gövdesi + saç; diğerleri yalnızca iskelet oranı) |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen (kurt, goblin, timsah, ejderha) |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen (kurt besleme, Veyra yoldaş YZ) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (bkz. ay-kiliccisi/PROGRESS.md) |
| 7 | Android performansı ve mobil kontroller | Kısmen (dokunmatik düzen var; gerçek cihazda test edilmedi) |

## Tamamlananlar
_(Henüz hiçbir özellik tamamen bitmiş olarak işaretlenmedi.)_

## Çalıştırma günlüğü

### Çalıştırma 1 — 2026-11-24
Özellik 1 (kahraman) — kullanıcının bekleyen isteği "kahraman zırhını yeniden tasarla" ilerletildi:
- Göğüs zırhına kabartma **hilal arması** (bronz) ve içinde **parlayan ay taşı** (yeni `moon` ışıma malzemesi).
- Göğüs ortasında dövülmüş **omurga sırtı**.
- Sol omuzdan sağ kalçaya **çapraz deri kayış** (baldric), bronz toka ve perçinler — simetriyi kırıp heykel yerine kişi gibi okunmasını sağlar.
- Kemerde iki **deri kese** (metal kapaklı) ve arkada bronz **matara**.
- Her omuzluğun tepesinde burgulu bronz **sırt** (mirror ile iki yanda).
- Üçgen bütçesi 21k → 24k (kask ve göğüs yüzeyleri daha az köşeli). CPU deri maliyeti testte belirgin değişmedi.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-perf hatasız.

## Sıradaki öncelikler
1. Kahraman (devam): kaskı yeniden şekillendir (şu an yumru gibi; daha keskin vizör, yüz plakası hatları), omuzlukları
   küçült/katmanlandır, bacak zırhına oluk (fluting) ekle; isteğe bağlı kasksız yüz modeli (oyuncunun yüzünü görmesi için).
2. Sonra özellik 2: kahramana anahtar kareli klip sistemi (bekleme nefesi, yürüme/koşu döngüsü, saldırı pozları) + harmanlama.
3. Gerçek Android cihazda performans ölçümü hâlâ yapılamıyor.
