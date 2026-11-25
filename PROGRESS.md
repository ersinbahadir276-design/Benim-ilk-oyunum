# PROGRESS — otomatik geliştirme turu (zamanlanmış görev)

Asıl oyun: `ay-kiliccisi/` (Ay Kılıççısı: Kara Zırh). Ayrıntılı yol haritası ve oturum günlüğü: `ay-kiliccisi/PROGRESS.md`.
Kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası (her derlemeden sonra kopyalanmalı).

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | DEVAM EDİYOR — Kael heykel modeli oyunda; zırh yeniden tasarımı başladı (tur 1) |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı (tüm pozlar kodla; anahtar kareli klip sistemi yok) |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, elf gövdesi + saç GLB'si kraliçede; diğerleri yalnız iskelet oranı) |
| 4 | Birden çok hayvan ve yaratık | Kısmen (kurt, timsah, ejderha, goblinler) |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen (kurt besleme, Veyra yoldaş YZ) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var; dünya genişletme sürüyor |
| 7 | Android performansı ve mobil kontroller | Kısmen (dokunmatik düzen var, gerçek cihazda test yok) |

## Tamamlanan

(Henüz listeden tamamen biten özellik yok.)

## Tur günlüğü

### Tur 1 — 2026-11-25 · Özellik 1: kahraman
- Kask yeniden tasarlandı: geniş, ışığı taşan T yarığı yerine kaşları çatık iki dar göz yarığı (kızıl ışıma), kırık
  görünen ince nefes deliklerinin yerine delinmiş yuvarlak delikler, şakaktan açılan yanak siperleri, daha belirgin tepe sırtı.
- Göğüs zırhına bronz hilal ay arması (oyunun adı) ve yıldız perçinleri, göğüs ortasında omurga şeridi.
- Belin önüne bronz kenarlı kızıl peştamal (bacaklara ağırlıklı, yürürken sallanır), sağ kalçaya deri kese.
- Model ~21 bin üçgen (bütçe aynı), dosya boyutu değişmedi (+1 KB).
- Araç: `tools/sculpt/restore-cache.mjs` — taze klonda tek model derlemeden önce önbelleği `data/models.js`'ten
  geri açar (yoksa `build.mjs hero` diğer 15 modeli siler; `king` yeniden heykellenemez).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 6/7. Kalan 1 hata ÖNCEDEN VARDI (değişiklik öncesi
  kodda da başarısız): "SALDIR basılı tut = yükleme" testi, 7. oturumdaki PlayStation düzeninden sonra eskimiş.

## Sıradaki öncelikler
1. Kahraman (devam): kol/omuz zırhı ve eldivenler hâlâ blok gibi; kolçak oyma, pelerin yırtık kenarı, oyun içi yakın çekim
   kontrolü; kasksız yüz seçeneği (yüzü görünen erkek kahraman) değerlendirilmeli.
2. `s-ui.js` ağır saldırı testini yeni düğme düzenine göre güncelle (△ = ağır).
3. Sonra özellik 2: kahraman için anahtar kareli animasyon klipleri + harmanlama.
