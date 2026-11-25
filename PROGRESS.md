# PROGRESS — zamanlanmış geliştirme turu

Bu dosya, her çalıştırmada bir özelliği ilerleten zamanlanmış görevin takip dosyasıdır.
Ayrıntılı teknik günlük: `ay-kiliccisi/PROGRESS.md` (asıl oyun: Ay Kılıççısı, `ay-kiliccisi/`).
Kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası; eski oyun `yaban.html`.

## Özellik listesi (öncelik sırası)

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek ana karakter (Kael, Kara Zırh) | **Devam ediyor**: heykel modeli var; zırh yeniden tasarımı 1. geçiş yapıldı (tur 1) |
| 2 | Gerçekçi 3D karakter animasyonları | Başlanmadı (bütün pozlar kodla; anahtar kare klip sistemi yok) |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen: ejderha, elf gövdesi, saç GLB'si oyunda; `assets/models/hero.glb` + Quaternius animasyonları yalnızca eski oyunda |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin, timsah, ejderha; geyik/kuş/zindan yaratıkları yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: Veyra yoldaş YZ; evcilleştirme yalnızca eski oyunda (yaban.html) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var; harita genişletme / zindan eksik |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik düzen var; gerçek cihazda test yok |

## Tamamlananlar
- (henüz listedeki hiçbir özellik tamamen bitmedi)

## Tur günlüğü

### Tur 1 — 2026-11-25 · Özellik 1: Kael'in zırhı, 1. tasarım geçişi
- Kask yüzü yeniden yapıldı: derin T-yarık ve tırtıklı nefes kesikleri (bloklu turuncu leke ve pürüzlü çene) yerine
  sığ göz bandı + iki çatık, ışıyan göz yarığı (`eyeGlow` ışıma malzemesi) + yuvarlak nefes delikleri.
- Göğüs zırhına kabartma bronz **hilal amblemi** (Ay Kılıççısı kimliği).
- Kemerden diz altına inen **kızıl tabard**, bronz etekli; ağırlıkları kalça → iki uyluk arasında harmanlanır (koşarken yırtılmaz).
- Sol ve sağ kalçada bronz tokalı deri **kese**.
- `data/models.js` yeniden üretildi (yalnızca `hero`; diğer 15 model önbellekten aynen), üçgen sayısı ~21k (değişmedi).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-hero ekran görüntüleri hatasız.
- Not: `tools/sculpt/cache/` depoda yok; tek model derlemeden önce önbelleği `data/models.js`'ten çıkarmak gerekir
  (yoksa diğer modeller silinir). Çıkarma regex'i ilk satırdaki `{ad:"…"` girdisini de yakalamalı.

## Sıradaki öncelikler
1. Özellik 1 devam: arka plaka detayı (sırt sırtı, perçin sırası), uyluk/baldır plakalarına kabartma, eldiven parmak eklemleri;
   kask boynuzlarının yüzey kalitesi; uzak mesafe için ikinci (LOD) model.
2. Özellik 1 bitiş ölçütü: önden/yandan/arkadan oyun içi görüntülerde düz silindir parça kalmaması + yakın plan kaskta pürüz olmaması.
3. Ardından özellik 2: kahraman için anahtar kareli klip sistemi (boşta, yürüme, koşu, saldırılar) + harmanlama.
