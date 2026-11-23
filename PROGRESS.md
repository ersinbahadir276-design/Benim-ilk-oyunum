# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış geliştirme rutininin ilerlemesini izler. Oyunun ayrıntılı yol haritası ve oturum günlüğü:
`ay-kiliccisi/PROGRESS.md` (asıl oyun: Ay Kılıççısı, kaynak `ay-kiliccisi/src`, teslim `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html`).

## Özellik listesi (öncelik sırası)
| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman karakteri | **Devam ediyor**. Kael SDF heykel modeli var (~23k üçgen, 58 kemik); bu tur kimlik detayları eklendi. Kalan: kask açık/yüz, zırh setlerine göre görünüm, yakın plan malzeme kalitesi |
| 2 | Gerçekçi 3B karakter animasyonları | Başlamadı. Tüm hareketler kodla pozlanıyor, anahtar kareli klip sistemi yok |
| 3 | Gönderilen GLB modellerin entegrasyonu | Kısmen. Ejderha, elf gövdesi (Şeytan Kraliçe), saç GLB'si oyunda; `assets/models/hero*.glb`, `fox.glb` eski oyunda (yaban.html) |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen. Kurt, goblin (3 tür), timsah, ejderha; iskelet/örümcek/golem yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen. Kurt besleme, Veyra yoldaş YZ'si; yaban.html'de 13 türlük evcilleştirme var ama ana oyunda yok |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem, seviye/stat/ganimet) |
| 7 | Android performansı ve mobil kontroller | Kısmen. PlayStation düzenli dokunmatik düğmeler, 30 m dış çizgi sınırı; gerçek cihazda test yok, HUD düzenleyici yok |

## Tamamlanan
- (henüz tümüyle bitmiş özellik yok)

## Tur günlüğü
### 2026-11-23 (tur 1, özellik 1: kahraman)
- Root `PROGRESS.md` oluşturuldu. Açık issue yok, çalışma ağacı temizdi.
- `ay-kiliccisi/tools/sculpt/models/hero.mjs`: Kael'in zırhına "Ay Kılıççısı" kimliği:
  - göğüs plakasında bronz **hilal arması** + mavi ay taşı (yeni `gem` malzemesi)
  - sağ omuzdan sol böğre (sırttan da dolanan) deri **kılıç kayışı**, bronz dikiş perçinleri ve tokası
  - kemerden dize inen, saçaklı uçlu, kıvrımlı kızıl **ön etek bezi** (kalça + bacak ağırlıklı, koşarken bacakla açılıyor)
  - sol böğürde ve sağ arkada perçinli **kemer keseleri**
  - üçgen bütçesi 21k → 23k (22 996 üçgen, 10 770 köşe)
- Yalnızca kahraman yeniden üretildi; diğer modeller birebir aynı. `tools/sculpt/build.mjs` artık gitignore'daki önbellek boşsa onu `data/models.js`'ten dolduruyor (önceden tek model üretmek diğer modelleri siliyordu).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7; s-hero ekran görüntüleri (duruş, koşu, ağır saldırı) kontrol edildi.

## Sıradaki öncelikler
1. Kahraman (özellik 1) devam: kask açılabilir yüz (erkek yüz heykeli + boyalı yüz dokusu, `FACES`/`faceTex` hattı), köy/hikâye sahnelerinde kasksız görünüm; yakın planda zırh plakalarında çizik/oyma detayını artırmak.
2. Özellik 2: kahramana anahtar kareli klip sistemi (boşta nefes, yürüme/koşu döngüsü, saldırı klipleri) + harmanlama.
3. Not: `tools/sculpt/cache/` depoda yok; `build.mjs` artık eksik önbelleği `data/models.js`'ten kendisi dolduruyor, tek model (`node tools/sculpt/build.mjs hero`) güvenle yeniden üretilebilir (önce `cd tools/sculpt && npm install`).
