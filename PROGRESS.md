# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya her zamanlanmış çalıştırmanın başında okunur ve sonunda güncellenir.
Aktif oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, ayrıntılı teknik günlük `ay-kiliccisi/PROGRESS.md`). Kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası. Eski oyun `yaban.html`.
Derleme: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Test: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<senaryo>.js`

## Tamamlananlar
_(Bir özellik ancak gerçekten bittiğinde buraya taşınır.)_

## Özellik durumu (öncelik sırasıyla)
| # | Özellik | Durum | Kalan |
|---|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Kısmen.** Kael: SDF heykel modeli (~21k üçgen, plaka/deri/kürk/pelerin malzemeleri, yanan miğfer yarığı). | Kullanıcının istediği "zırhı yeniden tasarla" işi **kullanıcıdan tasarım yönü bekliyor** (referans/tarif yok); yüzü açık/miğfersiz görünüm yok; pelerin fiziği yok. |
| 2 | Gerçekçi 3B karakter animasyonu | **Devam ediyor** (çalıştırma 1'de başladı). Yürüme/koşu/depar anahtar pozlu döngüler, bekleme, arazi ayak IK'sı bitti. | Dövüş hareketlerini anahtar pozlu kliplere çevirme (şimdi 2 noktalı lerp), dönüşte gövde yatması, başla/dur geçişleri, pelerin ikincil hareketi, NPC/goblin yürüyüşünü aynı sisteme taşıma. |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha (kendi klipleri), elf gövdesi (kraliçe), saç GLB'si oyunda; diğer GLB'lerden yalnızca iskelet oranları. | Kawaiope/Arknights tarzı kız, wolf_puppy iskeleti (kullanıcı listesinde). |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, timsah, ejderha, goblinler (Ay Kılıççısı); 14 tür eski `yaban.html`'de. | İskelet, örümcek, golem, hortlak, geyik/kuş. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: kurt besleme/güven → yoldaş; görüş konisi + uyarı yayılması; Veyra fayda puanlı yapay zekâ. | Diğer türler için evcilleştirme, yoldaş komutları. |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, duruşlar, ganimet, 7 sekmeli sistem penceresi, seviye/yetenek). | Dünya direktifi: liman/kasaba, lonca, zindanlar (bkz. `ay-kiliccisi/PROGRESS.md`). |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik PlayStation düzeni, dikey/yatay yerleşim, 30 m ötesi dış çizgi kapalı. | Gerçek cihazda test edilemedi; HUD düzenleyici, grafik kalite ayarı yok. |

## Çalıştırma günlüğü
### Çalıştırma 1 — 2026-11-24
- Dosya yoktu, oluşturuldu. Açık değişiklik yoktu (temiz çalışma ağacı).
- Özellik 1'in kalan işi (zırh yeniden tasarımı) kullanıcı tasarım yönü olmadan yapılamaz → özellik 2'ye geçildi.
- **Yapıldı (özellik 2):** `ay-kiliccisi/src/32-gait.js`
  - Anahtar pozlu yürüyüş / hafif koşu / depar döngüleri (topuk vuruşu, yüklenme, orta duruş, itiş, salınım), periyodik Catmull-Rom, hıza göre harmanlama; kalça yalpası/dönmesi, kol karşı salınımı.
  - Bekleme: nefes, ayaktan ayağa ağırlık aktarma, etrafa bakma, yorgun soluma.
  - Arazi ayak IK'sı: iki kemikli bacak IK, kalça alçak ayağa iner, ayak eğime yatar.
  - Ölçüm (eğim 0.34): IK yokken ayak 15 cm'ye kadar gömülüyor / 11 cm havada kalıyordu; şimdi < 1 mm.
- Testler: yeni `s-gait.js` 15/15; `s-mech` 47/47, `s-loop` 71/71, `s-stance` 11/11, `s-ui` 7/7, `s-save` 1/1; `s-perf` kare başına mantık 0.09–0.17 ms.

## Sıradaki öncelikler
1. Özellik 2 devam: hafif/ağır saldırı ve kaçınmayı anahtar pozlu kliplere çevir (hazırlık → vuruş → takip → toparlanma), dönüşte gövde yatması, başla/dur geçişleri.
2. Özellik 2: pelerin için basit yay (spring) ikincil hareket.
3. Özellik 1: kullanıcıdan zırh tasarımı için referans/tarif iste; gelince `tools/sculpt/models/hero.mjs` üzerinden yeniden yap.
