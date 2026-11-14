# İlerleme (PROGRESS)

Zamanlanmış geliştirme çalıştırmalarının kaydı. Her çalıştırma bir sonraki öncelikten devam eder.

## Tamamlanan

- (PR #1 öncesi) Dünya ve bölgeler, VRoid erkek kahraman + Quaternius klip retarget'ı, 14 tür, yapay zekâ, türe özgü evcilleştirme, yoldaş sistemi, envanter/toplama, dokunmatik kontroller, 51 oynanış testi.
- **2026-11-14 — Erkek kahraman kalitesi: saç ve palto eteği fiziği**
  - `src/springbone.js`: VRM 0.x `secondaryAnimation` verisini okuyan Verlet tabanlı yay kemiği sistemi (sertlik, sürtünme, yerçekimi, küre çarpıştırıcılar, ışınlanmada sıfırlama, NaN'sız sabit kemik boyu).
  - `src/hero.js`: 34 yay eklemi (7 saç zinciri + 6 palto eteği zinciri) bağlandı; etek için uyluk/baldır/kalça çarpıştırıcıları eklendi (modelde yoktu).
  - `src/player.js`, `test/model-viewer.js`: fizik her karede animasyondan sonra güncellenir.
  - `test/run-tests.mjs`: artık ayrı HTTP sunucusu gerekmez (Playwright route ile depodan sunar).
  - 5 yeni test (yükleme, ataletle salınım, kararlılık, etek–bacak çarpışması, ışınlanma sıfırlaması). Sonuç: 56/56.

## Özellik durumu

| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman | Büyük ölçüde tamam — model, toon malzemeler, saç/etek fiziği var. Eksik: yüz ifadeleri (VRM blendshape: göz kırpma, acı/öfke ifadesi), göz takibi. |
| Gerçekçi 3B karakter animasyonları | Kısmi — kahraman retarget klipleri + crossfade var. Eksik: ayak IK (eğimli zemin), kahraman için vurulma/tepki klibi kullanımı, prosedürel hayvanlarda ayak kilidi. |
| Gönderilen GLB modellerin entegrasyonu | Kısmi — ejderha ve tilki bağlı; diğer 12 tür için GLB gönderilmedi (beklemede). Ejderha uçuşu yok. |
| Çok sayıda hayvan ve yaratık | Tamam (14 tür) — görsel kalite prosedürel modellerde düşük. |
| Evcilleştirme ve yapay zekâ | Tamam (türe özgü yöntemler, yoldaş takip/savaş/açlık). Eksik: ata binme. |
| Açık dünya, savaş, envanter, ilerleme | Kısmi — dünya/savaş/envanter var. Eksik: oyuncu seviyesi/deneyim, yoldaş seviyesi, kayıt (save), görevler. |
| Android performansı ve mobil kontroller | Kısmi — dokunmatik kontroller var. Eksik: düşük kalite profili (gölge/piksel oranı/görüş mesafesi), FPS ölçümü. |

## Sıradaki öncelikler

1. Kahraman yüz ifadeleri: VRM `blendShapeMaster` ile otomatik göz kırpma, hasar alınca acı ifadesi, saldırıda öfke (kahraman özelliğini kapatır).
2. Kahraman ayak IK'sı (eğimli zeminde ayakların yere oturması) ve vurulma tepkisi (`Hit_Chest` klibi).
3. İlerleme sistemi: deneyim/seviye ve kayıt (localStorage).
4. Android: otomatik kalite profili ve FPS sayacı.
