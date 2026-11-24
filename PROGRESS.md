# PROGRESS — zamanlanmış geliştirme oturumları

Bu dosya zamanlanmış görevin özellik listesini izler. Oyunun ayrıntılı yol haritası ve tasarım notları:
`ay-kiliccisi/PROGRESS.md` (asıl oyun: Ay Kılıççısı; kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).
Eski oyun (Yaban Yoldaşları) `yaban.html` + `src/` olarak duruyor; yeni iş Ay Kılıççısı'nda yapılıyor.

## Özellik listesi (öncelik sırasıyla)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — SDF heykel modeli oyunda; zırh yeniden tasarımı sürüyor |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı (prosedürel pozlar var; duruşa özgü pozlar eksik) |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, elf gövdesi, saç GLB'si oyunda; diğerleri yalnızca iskelet oranı) |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen (kurt, goblin, timsah, ejderha) |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen (kurt besleme, Veyra yoldaş YZ) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (bkz. ay-kiliccisi/PROGRESS.md); dünya genişletme sürüyor |
| 7 | Android performansı ve mobil kontroller | Kısmen (dokunmatik PS düzeni, 30 m dış çizgi sınırı; gerçek cihazda test yok) |

## Tamamlananlar
_(Henüz hiçbir özellik tamamen bitmiş olarak işaretlenmedi.)_

## Oturum günlüğü

### 2026-11-24 — Kahraman zırhı, 1. adım
Özellik 1 üzerinde çalışıldı (`ay-kiliccisi/tools/sculpt/models/hero.mjs`, `data/models.js` yeniden üretildi):
- **Plackart:** göğüs zırhının üstüne binen sivri (V) üst kenarlı ikinci karın plakası, bronz kenar şeridi, 4 perçin,
  ortada sırt (keel). Fıçı gibi görünen gövde silueti kırıldı.
- **Miğfer:** yanlardan dışarı taşan düz bronz çubuk kaldırıldı; yerine miğfer yüzeyini izleyen alın bandı ve
  vizörü çerçeveleyen iki yanak sırtı (bronz). Nefes delikleri yukarı alınıp kısaltıldı (vizörün alt kenarını kemirmesin).
- **Baldırlık:** arkada iki deri kayış + dış yanda bronz tokalar.
- Üçgen sayısı ~21k'da kaldı (21 092). Testler: s-mech 47/47, s-loop 71/71, s-hero ekran görüntüleri hatasız.
- Not: `build.mjs` önbellekteki tüm modelleri birleştirir; önbellek git'te yok. Tek model derlemeden önce
  mevcut `data/models.js` önbelleğe açıldı (gzip+base64 → `tools/sculpt/cache/*.bin`), böylece diğer modeller korundu.

## Sıradaki öncelikler
1. Kahraman (devam): sırt plakası detayı (pelerin altında), pauldron'ları daha az şişkin yapmak, tasset'lerin
   "üst üste lastik" görünümünü kırmak (sivri alt kenar, kabartma), dizlik/baldırlık ön sırtları, kılıç kını.
   Bitince yüz açıkken (miğfersiz) kahraman portresi için yüz modeli düşünülebilir.
2. Duruşlara özgü pozlar/animasyonlar (hamle, saplama), kombo bitirici efektleri.
3. Kalan GLB'lerin entegrasyonu ve yeni yaratık türleri (iskelet, örümcek, golem).
