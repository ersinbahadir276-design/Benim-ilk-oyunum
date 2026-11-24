# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya zamanlanmış görevin her çalıştırmada okuduğu özet listedir. Ayrıntılı tasarım günlüğü ve yol haritası:
`ay-kiliccisi/PROGRESS.md` (asıl oyun: Ay Kılıççısı; kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Sürüyor** — SDF heykel modeli var; zırh yeniden tasarımı parça parça ilerliyor |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen — prosedürel insan iskeleti + duruş pozları var; duruşa özgü hamleler, ayak IK'sı yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf (Şeytan Kraliçe), saç GLB'si bağlı; diğerlerinden yalnızca iskelet oranları |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin, büyük goblin, timsah, ejderha; zindan yaratıkları yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş/uyarı AI, Veyra yoldaş AI; evcilleştirme yalnızca eski oyunda (yaban.html) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi, seviye/ekipman; harita büyütme, lonca, zindanlar bekliyor |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik PS düzeni, dikey/yatay, 30 m dış çizgi kesimi; gerçek cihazda test edilmedi, LOD yok |

## Tamamlananlar
- (Bu dosyadan önceki işler `ay-kiliccisi/PROGRESS.md` oturum 1–7'de.)

## Çalıştırma günlüğü
### 2026-11-24 — Kahraman zırhı: bacaklar yeniden tasarlandı
- `tools/sculpt/models/hero.mjs`: düz koni bacak zırhı yerine
  - **Kuşe (uyluk):** kas çıkıntılı uyluk biçimi üzerinde üst üste binen 3 ön lam, orta sırt, bronz üst/alt kenar, yan perçinler
  - **Dizlik:** kubbe + yan kanat (kalp yerine düzgün yelpaze), üstte eklem lamı (uyluk/baldır arası ağırlıklı)
  - **Baldırlık:** baldır şişkinliği + önde iki küreden mercek ile sivri omurga, önde bronz şerit, üst/alt bronz bant, dış yanda menteşe perçinleri
- Model yeniden heykellendi (21 434 üçgen, 10 137 köşe), yalnızca `hero` girişi `data/models.js` içinde değiştirildi
  (DİKKAT: `build.mjs` önbellekte olmayan modelleri dosyadan siler; diğer modellerin `cache/*.bin` dosyaları depoda yok —
  tek model yeniden kurulurken girişi elle birleştir).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-hero ekran görüntüleri (koşu/ağır saldırı/blok) deri kırığı yok.

## Sıradaki öncelikler
1. Kahraman zırhı devam: eldivenler (eklemli parmak plakaları, mitten yerine), omuzluklar (katman kenarları, kabartma),
   göğüs zırhı kabartması; ardından kahramanı "tamamlandı" saymak için kullanıcı onayı.
2. Animasyon: duruşlara özgü pozlar (Ay/Su/Rüzgâr hamleleri), ayak–zemin IK.
3. Zindan yaratıkları (iskelet, örümcek) — `ay-kiliccisi/PROGRESS.md` DÜNYA DİREKTİFİ sırası.
