# PROGRESS — Yaban Yoldaşları

Zamanlanmış geliştirme çalışmalarının kaydı. Her çalışma bu dosyayı okur, sıradaki eksik özelliği ilerletir ve burayı günceller.

## Özellik durumu

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | 🟡 Devam ediyor | VRoid avatar + toon malzeme + kılıç var. **Saç/etek yay fiziği eklendi (2026-11-15).** Eksik: VRM yüz ifadeleri (göz kırpma, hasar/öfke yüzü, dudak), göz/kafa hedefe bakışı. |
| 2 | Gerçekçi 3B karakter animasyonları | 🟡 Kısmen | Kahramana 21 retarget klip + crossfade. Eksik: ayak IK (eğimde ayak kayması), kök hareketi (root motion) hız eşlemesi, prosedürel hayvanlarda ayak kilidi. |
| 3 | Gönderilen GLB modellerin entegrasyonu | 🟡 Kısmen | Ejderha (gönderilen) ve tilki bağlı. Diğer 12 tür için GLB gönderilmedi; `GLBCreature` hazır. Ejderha uçuşu kullanılmıyor. |
| 4 | Çok sayıda hayvan ve yaratık | 🟢 Temel hali tamam | 14 tür. Kalite iyileştirmesi #3'e bağlı. |
| 5 | Evcilleştirme ve yapay zekâ | 🟢 Temel hali tamam | Türe özgü yöntemler, yoldaş takip/savaş/açlık. Eksik: yoldaş komutları (saldır/hedef), sürü davranışı. |
| 6 | Açık dünya, savaş, envanter, ilerleme | 🟡 Kısmen | Dünya/bölgeler, kombo savaş, envanter var. **Eksik: ilerleme (XP/seviye), kayıt sistemi, görevler, ata binme, gece/gündüz.** |
| 7 | Android performansı ve mobil kontroller | 🟡 Kısmen | Dokunmatik çubuk + butonlar var. Eksik: kalite ayarı (gölge/çözünürlük/yay fiziği kapatma), dokunmatik kamera döndürme testi, FPS ölçümü. |

## Tamamlanan işler

### 2026-11-15 — Kahraman: VRM yay kemiği (saç & ceket eteği) fiziği
- `src/springbone.js` (yeni): VRM 0.x `secondaryAnimation` verisini okuyan Verlet yay fiziği (UniVRM algoritması uyarlaması). Sertlik, sürükleme, yerçekimi, kemik başına isabet yarıçapı, küre çarpıştırıcılar (kafa, boyun, gövde, kollar — 22 küre), 60 Hz sabit alt adım (kare hızından bağımsız; mobilde 30 fps'de de aynı davranış), ışınlanma/yeniden doğmada otomatik sıfırlama.
- 34 eklem simüle ediliyor: 20 saç eklemi (7 zincir) + 14 ceket eteği eklemi (6 zincir). Modelde sürüklemesi 0 olan etek grubu sonsuza dek salınıyordu → en az 0.2 sönüm uygulandı.
- `src/hero.js`: `hero.update(dt)` = mikser + yay fiziği; `hero.springs` dışa açıldı. `src/player.js`: kök konumu fizikten önce ayarlanıyor (saç gerçek dünya hareketine tepki veriyor).
- `test/run-tests.mjs`: artık yerel HTTP sunucusu gerektirmiyor (Playwright yönlendirmesiyle dosyalar diskten sunuluyor; `URL=` ile eski yol hâlâ çalışıyor).
- `test/gameplay-test.js`: 6 yeni test (zincir kurulumu, koşarken savrulma, uzunluk korunumu/NaN yok, durunca dinlenmeye dönüş, saçın kafaya girmemesi, ışınlanma sıfırlaması). **57/57 test geçti, konsol hatası yok.**
- `test/model-viewer.html?m=hero&nospring` ile fizik kapalı karşılaştırma yapılabilir.

## Sıradaki öncelikler
1. **Kahraman (#1):** VRM `blendShapeMaster` ifadeleri — otomatik göz kırpma, hasar alınca acı yüzü, saldırıda öfke yüzü, ölümde göz kapama; kafanın odaktaki hayvana bakması (look-at). Bunlar bitince #1 tamamlandı sayılabilir.
2. **Animasyon (#2):** ayak IK (zemin yüksekliğine göre), dönüşlerde gövde eğilmesi.
3. **Mobil (#7):** düşük kalite modu (gölge kapalı, pixelRatio ≤ 1.5, yay fiziği yarım hız), FPS sayacı.
4. **İlerleme (#6):** XP/seviye ve localStorage kayıt sistemi.
