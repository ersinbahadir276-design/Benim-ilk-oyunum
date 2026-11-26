# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin özellik listesini izler. Aktif oyun: **Ay Kılıççısı** (`ay-kiliccisi/`,
kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası). Ayrıntılı tasarım/oturum günlüğü:
`ay-kiliccisi/PROGRESS.md`. Eski oyun `yaban.html` (Yaban Yoldaşları) artık geliştirilmiyor.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Devam ediyor** — SDF heykel modeli var; zırh yeniden tasarımı başladı (aşağıda) |
| 2 | Gerçekçi 3B karakter animasyonları | Başlamadı (hepsi kodla poz; anahtar kare klip sistemi yok) |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen (ejderha, elf gövdesi, saç GLB'si; iskelet oranları) |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen (kurt, goblin, okçu, büyük goblin, timsah, ejderha) |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen (kurt besleme, Veyra yoldaş YZ'si, görüş/uyarı) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, 4 duruş, ganimet, seviye, demirci) |
| 7 | Android performansı ve mobil kontroller | Kısmen (PS düzeni dokunmatik, 30 m dış çizgi sınırı; gerçek cihazda test yok) |

## Tamamlananlar
- (henüz rutin listesinden tamamen biten özellik yok)

## Çalıştırma günlüğü

### 2026-11-26 — Özellik 1: kahraman zırhı yeniden tasarımı (1. adım)
`ay-kiliccisi/tools/sculpt/models/hero.mjs`, yeniden heykel → `data/models.js`, `dist/`, kök `index.html`:
- Bel: üst üste yığılmış kalın "lastik" halkalar yerine aşağı doğru açılan, birbirinin üstüne binen ince plakalar + perçinler (+ altında deri bel katmanı).
- Göğüs: oyunun adına uygun kabartma **hilal + dikey kılıç** amblemi (bronz).
- Önde kemerden sarkan, kenarı altın şeritli, yırtık etekli **kızıl tabard** (pelerinle uyumlu); kalça + iki uyluk kemiğine ağırlıklı, koşarken bacakları izliyor.
- Miğfer yarığı daraltıldı (turuncu ışıma lekesi küçüldü, T daha keskin).
- Baldır zırhı: düz silindir yerine baldır kavisi.
- Not: `tools/sculpt/cache/` git'te yok; yeni oturumda önce `data/models.js` çözülerek cache doldurulmalı
  (aksi halde kral modeli — depoda olmayan elf GLB'sinden — kaybolur). Komut `ay-kiliccisi/PROGRESS.md` içinde.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7 (bir koşuda 6/7 — kararsız test, değişiklik öncesi sürümde de 7/7; tekrar koşuda geçti). s-hero ekran görüntüleri kontrol edildi.

## Sıradaki öncelikler
1. Özellik 1 devam: kollar/uyluklar hâlâ silindirik (pazıbent ve uyluk zırhına kas kavisi, dirsek/diz ayrıntısı), göğüs plakasına daha belirgin omurga/kas formu, miğfer alt yarısının (çene/nefes delikleri) temizlenmesi, kılıç kını/sırt askısı. Sonra yakın plan portre testi.
2. Özellik 2: kahraman için anahtar kareli klip sistemi (bekleme, yürüyüş, koşu, 3'lü kombo) + harmanlama.
3. Özellik 7: gerçek Android ölçümü yapılamıyor; s-perf.js ile düşük kalite modu (gölgesiz, daha az çimen) ayarı.
