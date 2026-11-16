# PROGRESS — otomatik geliştirme oturumları

Bu dosya zamanlanmış geliştirme çalışmalarının özetidir. Ayrıntılı yol haritası ve tasarım notları:
`ay-kiliccisi/PROGRESS.md` (asıl oyun, site açılışı `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).
Eski evcilleştirme oyunu `yaban.html` + `src/` olarak duruyor.

## Tamamlananlar
_(Bir özellik ancak gerçekten bitince buraya taşınır.)_

## Özellik durumu (öncelik sırasıyla)
| # | Özellik | Durum |
|---|---|---|
| 1 | Yüksek kaliteli erkek kahraman (Kael, Kara Zırh) | **Sürüyor.** SDF heykel modeli oyunda (58 kemik, ~21k üçgen). Bu oturumda zırh hikâyeye bağlandı (aşağıda). Kalan: kullanıcının yeni görünümü onaylaması, omuzluk/kol zırhının yenilenmesi, uzak LOD. |
| 2 | Gerçekçi 3B karakter animasyonları | Açık. Tüm hareketler kodla üretilen pozlar + IK; anahtar kareli klip sistemi yok, duruşa özgü pozlar ve kombo bitiricileri bekliyor. |
| 3 | Kullanıcının GLB modellerinin entegrasyonu | Kısmen. Ejderha (klipleriyle), elf gövdesi (Şeytan Kraliçe), saç GLB'si, şövalye heykeli oyunda. Kawaiope (Arknights tarzı kız) ve wolf_puppy iskeletine geçiş bekliyor. |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen. Kurt, goblin (3 tür), timsah, ejderha. Geyik/kuş, zindan yaratıkları (iskelet, örümcek, golem…) yok. |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen. Görüş konisi + uyarı yayılması, sürü/kamp davranışı, Veyra yoldaş YZ'si, kurt besleme. Eski oyunda 14 türlük evcilleştirme var; ana oyuna taşınmadı. |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Çekirdek var (2,8 km harita, 4 duruşlu dövüş, ganimet, demirci, yetenek, görevler). Dünya genişletme (liman, kasaba, lonca, zindanlar) açık. |
| 7 | Android performansı ve mobil kontroller | Kısmen. Dokunmatik PS düzeni, dikey/yatay yerleşim, 30 m ötesi dış çizgi kapalı. HUD düzenleyici, grafik ayarı, gerçek cihaz testi yok. |

## Oturum günlüğü
### 2026-11-16 — Kahraman: «Hırlayan» zırh detayları + net ışıma
- **Göğüs zırhına bronz kurt başı** (Hırlayan, zırhtaki kurt ruhu): kulaklar, kaş çıkıntıları, burun, dişler; gözleri yanıyor.
- **Lanet çatlakları:** kurdun gözlerinden sol göğse yayılan oyuk çatlaklar, içleri kor gibi parlıyor. Işıma oyundaki
  öfke çubuğuna zaten bağlı (`HERO.glow`), yani çatlaklar öfkeyle birlikte nabız gibi atıyor.
- **Miğfer:** vizörün alt kenarına kurt dişleri.
- **Heykel hattı (`tools/sculpt/mesh.mjs`):** `crisp: true` işaretli çıkartmalar için meshoptimizer
  `simplifyWithAttributes` kullanılıyor; sadeleştirme ışıyan bölgelerin sınırını koruyor. Önce T-yarığın ışıması büyük
  üçgenlere yayılıp turuncu bir leke gibi görünüyordu, artık keskin bir T.
- **`tools/sculpt/seed-cache.mjs`:** `data/models.js` içindeki modelleri önbelleğe açar. Önceden önbellek boşken
  `build.mjs hero` çalıştırmak `data/models.js` dosyasını yalnızca kahramanla eziyordu (diğer 15 model siliniyordu).
- Testler: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7 geçti, sayfa hatası yok; s-hero oyun içi ekran görüntüleri incelendi.

## Sıradaki öncelikler
1. Kahraman: omuzluk ve kol zırhını kurt temasına bağla (pençe biçimli dirsek, kürk kol bağı); kullanıcı geri bildirimi.
2. Animasyon: anahtar kareli klip sistemi (ağır vuruş, kombo bitirici, duruşa özgü hamle/saplama) + harmanlama.
3. GLB: kurtları wolf_puppy iskeletine, Arknights tarzı kızı Kawaiope iskeletine geçir.
