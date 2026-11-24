# PROGRESS — otomatik geliştirme rutini

Bu dosya zamanlanmış "Game development continuous task" rutininin defteridir. Her çalıştırmada okunur.
Asıl oyun: **Ay Kılıççısı** (`ay-kiliccisi/`, kök `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html` kopyası).
Ayrıntılı tasarım/yol haritası: `ay-kiliccisi/PROGRESS.md`. Eski oyun: `yaban.html` (Yaban Yoldaşları).

## Özellik listesi (rutinin öncelik sırası)

| # | Özellik | Durum | Not |
| --- | --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | **devam ediyor** | Kael heykel modeli (21k üçgen) var; zırh setleri artık görünüşü değiştiriyor (oturum 8). Kalan: Kara Plaka tabanının yeniden tasarımı (kullanıcı istedi), yüz/miğfer açık varyantı |
| 2 | Gerçekçi 3B karakter animasyonları | yapılmadı | Prosedürel pozlar var; duruşa özgü hamleler, kombo bitirici, yönlü saldırı eksik |
| 3 | Gönderilen GLB modellerin entegrasyonu | kısmen | Ejderha, saç, elf (kraliçe), iskelet oranları kullanıldı; kalanlar `ay-kiliccisi/PROGRESS.md` "Modeller" tablosunda |
| 4 | Çok sayıda hayvan ve yaratık | kısmen | Kurt, goblin, timsah, ejderha; iskelet/örümcek/golem/hortlak yok |
| 5 | Yaratık evcilleştirme ve yapay zekâ | kısmen | Kurt besleme, Veyra yoldaş YZ; Ay Kılıççısı'nda genel evcilleştirme yok (Yaban'da var) |
| 6 | Açık dünya, dövüş, envanter, ilerleme | büyük ölçüde | 2,8 km harita, Tsushima tarzı dövüş, 7 sekmeli sistem penceresi; zindanlar/lonca yok |
| 7 | Android performansı ve mobil kontroller | kısmen | Dokunmatik PS düzeni, LOD/dış çizgi kısıtı; gerçek cihazda ölçülmedi |

## Tamamlananlar
- (henüz rutin listesinden tamamen biten özellik yok)

## Çalıştırma günlüğü

### 2026-11-24 — oturum 8 (özellik 1: kahraman)
- Zırh setleri artık sadece renk değil, **kendi heykel katmanlarını** giyiyor (`tools/sculpt/models/heroWolf|heroBone|heroAsh.mjs`,
  ortak yardımcı `_heroSet.mjs`), Kael'in iskeletine derilenmiş, Kara Plaka gövdesinin üstüne çizilir:
  - **Kurt Postlu Zırh** (~7k üçgen): omuzlarda kalın post, sol omuzda kurt başı (kulak, kehribar göz, diş), sırtta pelerinin
    üstüne düşen post + arka bacak parçaları, göğüste diş kolye, ön kol ve baldırda kürk sargı.
  - **Kemik Zırh** (~6k): göğüs kafesi (iman tahtası + 4 kaburga), iki omuzda boynuzlu canavar kafatası, ön kolda kemik
    mahmuzlar, dizde çene kemiği, kemerde dişli çene.
  - **Kül Zırh** (~5k): miğferin arkasında 5 kömürleşmiş diken + korlar, göğüs/omuz/ön kol/baldırda parlayan erimiş çatlaklar
    (titrer, Öfke'de alevlenir), kemerden sarkan yanık paçavralar.
- Oyunda `buildArmorSet()` (52-items.js) kuşanılan zırh tabanına göre katmanı kurar/kaldırır (kılıç takasıyla aynı yol, sızıntı yok).
- Yeni test `ay-kiliccisi/test/s-armorset.js` (8/8). Regresyon: s-mech 47/47, s-loop 71/71 (bir kez "Gölge Adımı" testi
  rastgele düştü, iki yeniden denemede ve HEAD'de geçti — kararsız test), s-stance 11/11, s-save 1/1, s-perf hatasız.
- Not: `build.mjs` yalnızca `cache/` içindekileri birleştirir; temiz klonda önce `data/models.js`'ten cache'i doldur
  (komut `ay-kiliccisi/PROGRESS.md` oturum 8 notunda).

## Sıradaki öncelikler
1. Özellik 1 devam: Kara Plaka taban zırhını yeniden tasarla (kullanıcı isteği) — daha okunur siluet, pelerin/miğfer detayı;
   nadirliğe göre katman detayı (Destansı/Efsanevi'de ışıma) düşünülebilir.
2. Özellik 2: duruşlara özgü saldırı pozları (Taş/Rüzgâr/Su/Ay), kombo bitirici efektleri, yürüme/koşu döngüsünde ağırlık aktarımı.
3. Özellik 4: zindan yaratıkları (iskelet, örümcek) — heykel hattı ile.
4. s-loop "Gölge Adımı" testini kararlı hale getir (rastgele düşman/eşya etkisi).
