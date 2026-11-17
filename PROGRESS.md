# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış geliştirme görevinin kaydıdır. Oyunun ayrıntılı günlüğü ve yol haritası
`ay-kiliccisi/PROGRESS.md` içinde (oturum 1–7 + bu turlar). Yayındaki oyun: kök `index.html`
(= `ay-kiliccisi/dist/ay-kiliccisi.html`). Eski oyun `yaban.html` + `src/`.

## Özellik listesi (zamanlanmış görev)

| Özellik | Durum |
| --- | --- |
| Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — heykel model oyunda; zırh iyileştirmesi 1. tur yapıldı (aşağıda) |
| Gerçekçi 3D karakter animasyonları | Başlanmadı (pozlar kodla; anahtar kareli klip sistemi yok) |
| Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, elf gövdesi, saç GLB; diğerleri yalnızca iskelet oranı) |
| Çok sayıda hayvan ve yaratık | Kısmen (kurt, goblin, okçu, büyük goblin, timsah, ejderha) |
| Yaratık evcilleştirme ve yapay zekâ | Kısmen (kurt besleme, Veyra yoldaş YZ; evcilleştirme sistemi yok) |
| Açık dünya, savaş, envanter, ilerleme | Büyük ölçüde var (bkz. ay-kiliccisi/PROGRESS.md); zindan/lonca yok |
| Android performansı ve mobil kontroller | Kısmen (dokunmatik PS düzeni; gerçek cihazda ölçülmedi) |

## Tamamlananlar
- (Henüz bu listeden tamamen biten özellik yok.)

## Tur günlüğü

### Tur 1 — 2026-11-17 · Kahraman zırhı, 1. geçiş
- `tools/sculpt/models/hero.mjs`:
  - Göğüs zırhına kas zırhı (muscle cuirass) kabartması: anahtar sırtına yumuşak birleşen iki göğüs kubbesi.
  - Bel daraltıldı (karın lamları ve kemer daha dar) → kahramanca V silueti.
  - Baldır zırhına (greave) baldır kası şişkinliği; düz silindir görünümü kalktı.
  - Miğfer alın çizgisi kafanın dışına taşan iki çubuk gibi görünüyordu → miğfer yüzeyinde bitiyor.
- `data/models.js` yeniden üretildi (yalnızca `hero` değişti; diğer 15 model bayt bayt aynı, doğrulandı).
- `dist/ay-kiliccisi.html` ve kök `index.html` yeniden derlendi.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-hero ekran görüntüleri hatasız.
- Not: `tools/sculpt/cache/` depoda yok (gitignore'a eklendi). Tek modeli yeniden üretmeden önce mevcut
  `data/models.js` içindeki bütün modeller cache'e açılmalı, yoksa build.mjs diğer modelleri siler
  (ilk girdi `{` ile başlar, regex buna dikkat etmeli).

## Sıradaki öncelikler
1. Kahraman (devam): miğfer altındaki çene/nefes deliği kenarları pürüzlü; ayak bileğindeki sabaton lamları
   dikenli görünüyor; eldivenler çubuk gibi; pelerin arkadan düz. Ardından yüz/miğfersiz varyant istenirse.
2. Gerçekçi animasyon: kahraman için anahtar kareli klip sistemi + harmanlama + ayak IK (ANALIZ.md §3).
3. Kullanıcı istekleri (ay-kiliccisi/PROGRESS.md): kurtları wolf_puppy iskeletine geçirme, köylüleri yeni görünüşe.
