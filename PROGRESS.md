# PROGRESS — zamanlanmış geliştirme çalıştırmaları

Bu dosya her zamanlanmış çalıştırmanın başında okunur. Ayrıntılı oyun yol haritası ve tasarım notları:
`ay-kiliccisi/PROGRESS.md` (asıl oyun: Ay Kılıççısı, kökteki `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html`).
Eski evcilleştirme oyunu `yaban.html` + `src/` olarak duruyor.

## Özellik listesi (durum)

| Özellik | Durum | Not |
| --- | --- | --- |
| Yüksek kaliteli erkek kahraman | **devam ediyor** | Kael heykel modeli (SDF hattı). Zırh yeniden tasarımı 1. geçiş yapıldı (aşağıda). Kalan: kask vizörü/ışıma, pelerin ve kürk detayı, yakın çekim yüz/kask kalitesi |
| Gerçekçi 3B karakter animasyonları | kısmen | Kodla üretilen pozlar + IK; anahtar kareli klip sistemi yok |
| Gönderilen GLB modellerin entegrasyonu | kısmen | Ejderha, elf gövdesi (Kraliçe), saç, şövalye heykeli oyunda; diğerlerinden yalnızca iskelet oranları |
| Birden çok hayvan ve yaratık | kısmen | Kurt, goblin, büyük goblin, timsah, ejderha (+ eski oyunda 14 tür); zindan yaratıkları yok |
| Yaratık evcilleştirme ve yapay zekâ | kısmen | Görüş/duyma sistemi, Veyra yoldaş YZ'si; Ay Kılıççısı'nda evcilleştirme yok (eski oyunda var) |
| Açık dünya, dövüş, envanter, ilerleme | büyük ölçüde | 2,8 km harita, Tsushima tarzı dövüş, ganimet/envanter, seviye/yetenek; harita genişletme bekliyor |
| Android performansı ve mobil kontroller | kısmen | Dokunmatik düzen, dikey/yatay; gerçek cihazda test edilmedi |

## Tamamlananlar
- (henüz listeden tamamen biten özellik yok)

## Çalıştırma günlüğü

### 2026-11-23 — Kahraman zırhı, 1. geçiş (ağır siluet)
- Sorun: ekran görüntülerinde Kael ince ve uzun bacaklı, beli sıkışık görünüyordu.
- `tools/sculpt/models/hero.mjs`: alt katman uzuvları ve pelvis kalınlaştırıldı; uyluk (cuisse), diz (poleyn),
  baldır (greave), üst kol, dirsek, ön kol plakaları ~%10–12 büyütüldü; omuzluklar ~%15 büyük ve alt lamı daha
  aşağıda; ön kalça plakaları geniş ve uzun; **yeni yan kalça plakaları** (iki lam + perçin); bel lamları, kemer,
  toka ve demir ayakkabılar büyütüldü. Model 23k üçgen / 10.5k köşe.
- `tools/sculpt/build.mjs`: önbellek eksikse `data/models.js`'ten doldurulur → tek model yeniden yapılınca diğerleri
  (ör. dışarıdan aktarılan `king`) artık kaybolmuyor. `tools/sculpt/cache/` git dışı bırakıldı.
- Yeni test: `ay-kiliccisi/test/s-hero-close.js` (bel/bacak yakın çekim: bekleme, koşu, çömelme).
- Testler: s-mech 47/47, s-loop 71/71, s-hero ve s-hero-close hatasız, s-perf eskisiyle aynı düzeyde.

## Sonraki öncelikler
1. Kahraman (devam): kask vizörü T-yarığı ışımasını incelt (yakında kırmızı leke gibi görünüyor), kürk yakayı
   daha hacimli yap, pelerine ikinci katman/yırtık kenar; sonra özelliği tamamlandı say.
2. Gerçekçi animasyonlar: kahramana anahtar kareli klip sistemi (bekleme nefesi, koşu, kombo) + harmanlama.
3. Gönderilen GLB'ler: iskeleti olan modellerin (kawaiope, gwyndolin) oyunda kullanımı.
