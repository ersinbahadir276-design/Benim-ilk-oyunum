# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış geliştirme görevinin kaydıdır. Asıl oyun **Ay Kılıççısı** (`ay-kiliccisi/`, yayın: kök `index.html`).
Ayrıntılı teknik günlük ve yol haritası: `ay-kiliccisi/PROGRESS.md`.

## Özellik listesi (öncelik sırasıyla)

| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | Devam ediyor: SDF heykel model (58 kemik, ~23k üçgen) var; zırh yeniden tasarımı adım adım sürüyor |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı (bu tur listesinde); hepsi kodla üretilen pozlar + IK, anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha, elf gövdesi (Şeytan Kraliçe), saç GLB'si bağlı; diğerlerinden yalnızca iskelet oranları alındı |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin (3 tür), timsah, ejderha; geyik/kuş/zindan yaratıkları yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: görüş/duyma yapay zekâsı var; Ay Kılıççısı'nda evcilleştirme yok (eski oyun `yaban.html`'de vardı) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var: 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter/yetenek/demirci; harita genişletme ve zindanlar eksik |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik PlayStation düzeni, 30 m dış çizgi kesimi; HUD düzenleyici ve grafik ayarları yok, gerçek cihazda test edilmedi |

Hiçbir özellik henüz "tamamlandı" olarak işaretlenmedi.

## Tamamlananlar

- (henüz tamamlanmış özellik yok)

## Tur günlüğü

### Tur 1 — 2026-11-25 · Özellik 1: erkek kahraman
- Kökte bu PROGRESS.md dosyası oluşturuldu (önceden yoktu).
- `ay-kiliccisi/tools/sculpt/models/hero.mjs`:
  - **Dizlikler (greave) yeniden heykellendi:** arkada baldır şişkinliği olan biçimli incik (eskiden düz koni = "silindir" görünümü),
    diz altında öne açılan kenar, ön sırt, üstte ve altta bronz bant, perçinler. Alt bacak artık gövdeyle orantılı ve kalın.
  - **Ön tabard (savaş bezi):** kemerden sarkan kızıl kumaş, yıpranmış V etek, kıvrımlar, bronz "kurt gözü" mühür;
    kalçaya bağlı, aşağıya doğru iki bacağa eşit ağırlıkla dağılıyor (koşarken yırtılmıyor, ekranda kontrol edildi).
  - Üçgen bütçesi 21k → 23k (22 972 üçgen, 10 743 köşe).
- `data/models.js` yeniden üretildi (yalnızca `hero` değişti; diğer modeller önbellekten birebir aynı), `dist/` ve kök `index.html` yeniden derlendi.
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-hero ve s-perf hatasız (yazılımsal WebGL; gerçek telefonda ölçülmedi).
- Not: `tools/sculpt/cache/` git'te yok. Tek model yeniden üretmeden önce mevcut `data/models.js` içindeki tüm modeller önbelleğe
  açılmalı, yoksa diğer modeller dosyadan düşer (bu turda öyle yapıldı).

## Sıradaki öncelikler
1. Özellik 1 devamı: kol zırhını (rerebrace/vambrace) aynı biçimli yaklaşımla kalınlaştır; miğfer yüz plakası ve göğüste
   oyma/kabartma; pelerin için yay-kütle (fizik) ikincil hareket; eldiven parmak ayrıntısı. Sonra yakın plan ekran görüntüleriyle kullanıcı onayı.
2. Özellik 2: kahraman için anahtar kareli klip sistemi (bekleme nefesi, ağırlık aktarımı, koşu döngüsü, saldırı öncesi hazırlık) + ayak IK.
3. Özellik 3: kullanıcı GLB'lerinden bağlanmamış olanların (berserk_armor, kawaiope) durumunu yeniden değerlendir.
