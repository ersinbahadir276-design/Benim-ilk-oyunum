# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin özetidir. Ayrıntılı oyun yol haritası ve oturum günlüğü:
[`ay-kiliccisi/PROGRESS.md`](ay-kiliccisi/PROGRESS.md). Oyun kaynağı `ay-kiliccisi/`, yayın kopyası kök `index.html`.

## Özellik listesi (rutin önceliği)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — SDF heykel modeli var; zırh yeniden tasarımı başladı (aşağıda) |
| 2 | Gerçekçi 3B karakter animasyonları | Kısmen — dövüş/duruş animasyonları var; duruşa özgü pozlar, kombo bitirici, yönlü saldırı eksik |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf kraliçe, saç GLB'si oyunda; diğerlerinden yalnızca iskelet oranları |
| 4 | Çoklu hayvan ve yaratık | Kısmen — kurt, goblin, timsah, ejderha; iskelet/örümcek/golem vb. yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — görüş/uyarı yapay zekâsı, Veyra yoldaşı; evcilleştirme yalnızca eski `yaban.html` oyununda |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — harita genişletme, zindanlar, lonca eksik |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik düzen var; gerçek cihazda test edilemedi, LOD yok |

## Tamamlananlar
- (Önceki oturumlar: bkz. `ay-kiliccisi/PROGRESS.md`, oturum 2–7.)

## Rutin çalışmaları

### 2026-11-23 — Kahraman zırhı yeniden tasarımı, 1. adım
- Göğüs zırhı artık dövülmüş "kas zırhı": iki göğüs plakası + karın sırtı kabartması (`tools/sculpt/models/hero.mjs`).
- Göğüs ortasında tarikatın işareti: tunç **hilal ay amblemi** ve ortasında yuvarlak ay topuzu (oyunun adı Ay Kılıççısı).
- Kurt kürkü pelerin yakası: 30 → 36 tutam, arka/yanlarda daha uzun sarkan tutamlar; pürüzlü yüksek frekans gürültüsü
  azaltıldı (yakından tırtıklı görünüyordu).
- Bacaklar inceltildi (uyluk, uyluk zırhı, ön etek plakaları) — eskisi fıçı gibi duruyordu.
- Model yeniden heykellendi (20 724 üçgen, önceki 20 996), `data/models.js` yalnızca `hero` satırı değişti; oyun derlendi,
  kök `index.html` güncellendi.
- Testler: s-mech 47/47, s-stance 11/11, s-loop 71/71, s-models ve s-hero ekran görüntüleri hatasız.
- Not: `tools/sculpt/cache/` git'te yok; yeni bir oturumda tek model yeniden heykellenmeden önce mevcut modeller
  `data/models.js`'ten cache'e açılmalı (aksi halde build.mjs yalnızca o modeli yazar ve diğerleri kaybolur).
  Açma komutu `ay-kiliccisi/PROGRESS.md` içinde.

## Sıradaki öncelikler
1. Kahraman zırhı 2. adım: ön etek plakaları (tassets) hâlâ kutu gibi — kademeli, kenarı kıvrık plakalar; omuzluklara hilal
   kabartması; kask yüzünde çene/ağız hattı; pelerin arka yüzüne amblem.
2. Kahraman yüz/zırh tamamlandıktan sonra #1'i bitti say; ardından #2: duruşa özgü pozlar (Taş/Rüzgâr/Ay/Su),
   kombo bitirici efektleri, yönlü saldırı.
3. #4 için gece yaratıkları (iskelet, hortlak) — `ay-kiliccisi/PROGRESS.md` Aşama 3.
