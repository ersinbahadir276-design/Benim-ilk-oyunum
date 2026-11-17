# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış geliştirme görevinin kaydıdır. Asıl oyun **Ay Kılıççısı** (`ay-kiliccisi/`); ayrıntılı
oturum günlüğü ve yol haritası `ay-kiliccisi/PROGRESS.md` içinde. Kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası.

## Özellik listesi (öncelik sırası) ve dürüst durum

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | **Sürüyor.** Kael heykel modeli (58 kemik, ~23,8k üçgen) oyunda. Zırh yeniden tasarımı 1. geçiş bitti (göğüs). Kalan: kollar/bacaklar silueti, köşeli gölgelendirme, yüz/miğfer seçeneği |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen. Bütün hareketler kodla üretilen pozlar + IK; anahtar kareli klip sistemi ve harmanlama yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen. Ejderha, elf gövdesi (Şeytan Kraliçe), saç GLB'si oyunda; diğer GLB'lerden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen. Kurt, goblin (3 tür), timsah, ejderha. Geyik/kuş, iskelet/örümcek/golem yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen. Görüş/uyarı yapay zekâsı, Veyra yoldaş YZ'si var; Ay Kılıççısı'nda evcil yaratık sistemi yok (eski `yaban.html` oyununda vardı) |
| 6 | Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, duruşlar, ganimet, seviye, demirci). Kalan: harita genişletme, zindanlar |
| 7 | Android performansı ve mobil kontroller | Dokunmatik düzen var; gerçek cihazda test edilmedi |

## Tamamlananlar
_(Henüz listeden tamamen bitmiş özellik yok — yukarıdaki tabloya bakın.)_

## Tur günlüğü

### Tur 1 — 2026-11-17 (özellik 1: kahraman)
- Kahraman zırhı yeniden tasarımı, 1. geçiş (`ay-kiliccisi/tools/sculpt/models/hero.mjs`):
  - Göğüs zırhı artık düz fıçı değil: iki göğüs plakası + ortada sırt (omurga) çizgisi.
  - Göğüste **hilal (ay) arması**: kabartma bronz, oyuğunda ışıyan ay taşı (oyunun adı Ay Kılıççısı).
  - Eski oyma çizgileri delik gibi görünüyordu → kaldırıldı, yerine bronz kakma çıkartma.
  - Kemerden sarkan **kızıl önlük (tabard)**: pelerinle aynı kumaş, bronz kenar, çentikli etek; kalça + iki bacağa ağırlıklı, koşarken bacakla birlikte oynuyor.
  - Kürk yaka daha az diken diken (ince gürültü azaltıldı).
  - Üçgen bütçesi 21k → 23,8k (11 084 köşe).
- Hata yakalandı ve düzeltildi: modelleri yeniden paketlerken `bigGoblin` ve `croc` düşüyordu, oyun bunu sessizce eski modele düşerek gizliyordu. Yeni test `ay-kiliccisi/test/s-modelset.js` 16 modelin hepsinin açıldığını denetliyor (`__G.MODEL` test için açıldı).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7, s-modelset 3/3, s-perf hatasız.

## Sıradaki öncelikler
1. Kahraman 2. geçiş: kol ve bacak zırhlarının silueti (uyluk plakaları kutu gibi, baldırlar boru gibi), daha yumuşak gölgelendirme (köşe normalleri), göğüsteki kakma çizgisinin görünür olması (doku ya da daha yoğun ağ).
2. Ardından özellik 2: kahraman için anahtar kareli klip sistemi + harmanlama (bekleme, yürüme, koşu, saldırılar).
