# PROGRESS — zamanlanmış geliştirme görevi

Bu dosya her zamanlanmış çalışmada okunur ve güncellenir. Ana oyun: `ay-kiliccisi/` (ayrıntılı yol haritası:
`ay-kiliccisi/PROGRESS.md`). Site açılışı `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası.

## Özellik listesi (öncelik sırası)
| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman | **Devam ediyor** — heykel modeli var (Kael, Kara Zırh); miğfer + tabar iyileştirildi. Kalan: zırh yeniden tasarımı (kullanıcı isteği), kahraman GPU deri/LOD |
| 2 | Gerçekçi 3B karakter animasyonları | Başlanmadı — tüm hareketler kodla üretilen pozlar; anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen — ejderha, elf gövdesi (kraliçe), saç GLB'si bağlı; diğerlerinden yalnızca iskelet oranları |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen — kurt, goblin (3 tür), timsah, ejderha; geyik/kuş/zindan yaratıkları yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen — Ay Kılıççısı'nda görüş/duyma yapay zekâsı var, evcilleştirme yok (eski `yaban.html` oyununda var) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var — 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli envanter, seviye/ekipman |
| 7 | Android performansı ve mobil kontroller | Kısmen — dokunmatik PlayStation düzeni var; gerçek cihazda test edilemedi, HUD düzenleyici yok |

## Tamamlananlar
- (Henüz hiçbir özellik tam olarak tamamlanmış sayılmıyor.)

## Çalışma günlüğü
### 2026-11-24 — Özellik 1 (kahraman)
- `tools/sculpt/mesh.mjs`: isteğe bağlı malzeme-duyarlı sadeleştirme (`preserve`). Ham köşelere malzeme rengi + ışıma
  özniteliği verilip `simplifyWithAttributes` kullanılıyor; plaka/bronz/kumaş sınırları ve parlayan ayrıntılar
  büyük üçgenlere yayılmıyor. Yalnızca `preserve` tanımlayan modeller etkilenir (bu çalışmada yalnızca kahraman).
- `tools/sculpt/models/hero.mjs`: miğferin T-yarığı yeniden yapıldı — bronz kabartma çerçeve, kara oyuk (`void`),
  dibinde iki yanan göz (önceden turuncu ışıma yüzün yarısına yayılıyordu); alın bandı; kemerden sarkan kızıl
  tabar (kıvrımlar, yırtık uç, bronz kenar, ay arması; kalça/bacak ağırlıklı).
- Kahraman 21.0k → 22.8k üçgen (9.8k → 10.7k köşe). Çizim hazırlık süresi değişmedi (s-perf).
- Testler: s-mech 47/47, s-stance 11/11, s-loop 71/71 (bir çalışmada Kırık Diş saldırı çeşitliliği testi
  rastgelelik yüzünden 70/71 verdi; tekrar iki çalışmada geçti — kararsız test, değişiklikle ilgisiz).
- Not: `tools/sculpt/cache/` depoda yok; tek model yeniden yapılmadan önce `data/models.js` içinden çıkarılmalı
  (yoksa `models.js` yalnızca yeni modeli içerir; kraliçe `king.bin` kullanıcının GLB'sinden gelir, yeniden üretilemez).

## Sıradaki öncelikler
1. Kahraman: miğfer altındaki nefes delikleri hâlâ pürüzlü; omuz/göğüs zırhının siluetini yenile (kullanıcının
   "zırhı yeniden tasarla" isteği); kahramanı CPU deriden GPU deriye geçirmek (58 kemik > 22 sınırı — kemik
   azaltma ya da doku tabanlı kemik matrisi gerekir).
2. Özellik 2: kahramana anahtar kareli klip sistemi (bekleme/yürüme/koşu/saldırı) + IK ile ayak kilidi.
3. Kararsız `s-loop` Kırık Diş testini sabit tohumla deterministik yap.
