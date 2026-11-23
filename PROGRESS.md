# PROGRESS — Benim İlk Oyunum (zamanlanmış geliştirme günlüğü)

Ana oyun: **Ay Kılıççısı: Kara Zırh** (`ay-kiliccisi/`, sitede `index.html`). Eski evcilleştirme oyunu: `yaban.html` (`src/`).
Ayrıntılı tasarım/teknik günlük: `ay-kiliccisi/PROGRESS.md`. Bu dosya, zamanlanmış görevin özellik listesini izler.

## Özellik listesi (öncelik sırası) — dürüst durum

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Sürüyor.** Kael heykel modeli (SDF hattı, ~21k üçgen, 58 kemik) var. Zırh detay geçişi 1 yapıldı (aşağıda). Kalan: miğfer silueti, eldiven/kol detayları, yakın çekim yüz/miğfer içi, LOD. |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen: hepsi kodla poz + IK; anahtar kareli klip sistemi yok; duruşa özgü pozlar yok. |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha, kraliçe (elf gövdesi + saç GLB'si); diğer GLB'lerden yalnızca iskelet oranları. |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin (3 tür), timsah, ejderha. Geyik/kuş, zindan yaratıkları yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: `yaban.html`'de 13 tür evcilleştirme var; Ay Kılıççısı'nda kurt besleme + Veyra yoldaş YZ. |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter, seviye/yetenek). Kalan: harita genişletme, zindanlar. |
| 7 | Android performansı ve mobil kontroller | Kısmen: PlayStation düzeni dokunmatik düğmeler, 30 m dış çizgi sınırı. Gerçek cihazda test edilemedi; HUD düzenleyici yok. |

## Tamamlananlar
- (Henüz hiçbir özellik tamamen bitmedi.)

## Çalıştırma günlüğü
### 2026-11-23 — Özellik 1: kahraman zırhı detay geçişi
- Göğüs zırhına kabartma bronz işleme eklendi: göğsün ortasında **hilal ay amblemi** (oyunun adı Ay Kılıççısı) ve etrafında iki yay şeklinde hale. Eski oyma çizgiler plakaya 5 mm gömülüydü ve oyun mesafesinde hiç görünmüyordu; kaldırıldı.
- Göğüs ortasına ışık yakalayan **omurga sırtı**, karın üstüne **sivri uçlu bronz kenarlı plackart** plakası.
- Miğfer: yanan T yarığının çevresine **bronz çerçeve**, miğferin alt kenarına bronz bant.
- Uyluk zırhının (cuisse) alt kenarına bronz bant.
- Üçgen bütçesi telefon için aynı tutuldu (~21,2k; önce 21,0k).
- Araç düzeltmesi: `tools/sculpt/cache` git'te yok; tek bir modeli yeniden heykel etmek diğer modelleri `data/models.js`'ten silerdi. Bu çalıştırmada önbellek `data/models.js`'ten çıkarılıp bayt bayt aynı geri birleştirildiği doğrulandı (yöntem `ay-kiliccisi/PROGRESS.md`'de).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7; oyun içi ekran görüntüsü (s-hero) kontrol edildi.

## Sıradaki öncelikler
1. Kahraman (özellik 1) devam: miğfer silueti (yanaklık/çene plakası ile daha belirgin gaga), eldivenlerde parmak eklem plakaları, pelerinde arma; sonra özellik 1'i bitmiş say.
2. Özellik 2: duruşlara özgü saldırı pozları (Taş/Su/Rüzgâr/Ay) ve kombo bitirici animasyonları.
3. Özellik 4: geyik/kuş gibi çevre hayvanları.
