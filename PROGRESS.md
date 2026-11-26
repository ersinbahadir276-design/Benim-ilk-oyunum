# PROGRESS — zamanlanmış geliştirme çalışmaları

Ana oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, yayın: kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).
Ayrıntılı oturum notları: `ay-kiliccisi/PROGRESS.md`. Eski oyun «Yaban Yoldaşları»: `yaban.html` + `src/`.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Sürüyor** — Kael heykel modeli (58 kemik, ~21k üçgen) var; zırh v2'nin miğfer/göğüs/uyluk/kürk kısmı bitti. Kalan: kol-bacak silüeti, pelerin, yakın plan detay |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen — tüm hareketler kodla poz + IK; anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf gövdesi (kraliçe), saç GLB'si oyunda; diğerlerinden yalnız iskelet oranları |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha; iskelet/örümcek/golem vb. yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş/uyarı yapay zekâsı, Veyra yoldaş; Ay Kılıççısı'nda evcilleştirme yok (Yaban'da var) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — harita büyütme, zindanlar, lonca bekliyor |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik düzen + performans testi var; gerçek cihazda test edilmedi |

## Tamamlananlar
- (henüz listedeki bir özellik tamamen bitmedi)

## Çalışma günlüğü
### 2026-11-26
- Özellik 1 ilerletildi: kahraman zırhı v2 (`ay-kiliccisi/tools/sculpt/models/hero.mjs`) — iki eğik akkor göz yarığı + burun sırtı + bronz kaş bandı, sığ nefes delikleri, göğüste kabartma hilal amblemi, açılan koni uyluk plakaları, düzgün kürk. Model yeniden üretildi (`data/models.js`), oyun derlendi, kök `index.html` güncellendi.
- Eskimiş test düzeltildi: `s-ui.js` ağır saldırı yüklemesini 2,5 sn basılı tutarak ölçüyordu; yükleme 1,3 sn'de kendiliğinden bırakıldığı için 0,7 sn'ye indirildi.
- Testler: mech 47/47, loop 71/71, stance 11/11, ui 7/7, assn 5/5, perf hatasız.

## Sıradaki öncelikler
1. Kahraman (özellik 1) bitişi: kol/bacak zırhının silüeti (baldır ve kol "boru" görünümü), pelerin kıvrımları, göz parlamasını uzaktan daha görünür yapmak; sonra özelliği tamamlandı say.
2. Özellik 2: kahramana anahtar kareli klip + harmanlama sistemi (ilk: bekleme, yürüme, hafif kombo).
3. Özellik 4: zindan yaratıkları (iskelet, örümcek) heykel hattıyla.
