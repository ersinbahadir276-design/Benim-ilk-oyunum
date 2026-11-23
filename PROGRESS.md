# PROGRESS — otomatik geliştirme turları

Bu dosya zamanlanmış geliştirme turlarının özetidir. Ayrıntılı oturum günlüğü ve tasarım notları:
`ay-kiliccisi/PROGRESS.md`. Asıl oyun: `ay-kiliccisi/` (yayındaki `index.html` = `ay-kiliccisi/dist/ay-kiliccisi.html`).
Eski oyun «Yaban Yoldaşları» `yaban.html` + `src/` altında duruyor.

## Özellik listesi (öncelik sırası) ve durum

| # | Özellik | Durum |
| --- | --- | --- |
| 1 | Yüksek kaliteli erkek kahraman | **Devam ediyor**: Kael heykel modeli (~21k üçgen, PBR); zırh türü katmanları (tur 1); demirci +3/+5 süsleri (tur 2). Kalan: miğfersiz kafa/yüz, uzak LOD |
| 2 | Gerçekçi 3B karakter animasyonları | Devam ediyor: prosedürel pozlar + kol IK, pelerin kemikleri. Kalan: ayak IK (eğimli zemin), duruşa özgü hamleler |
| 3 | Gönderilen GLB modellerinin entegrasyonu | Kısmen: ejderha, kraliçenin saçı, elf gövdesi, iskelet oranları. Kalan: zindan yaratıkları için yeni GLB gelirse |
| 4 | Çok sayıda hayvan ve yaratık | Kısmen: kurt, goblin (3 tür), timsah, ejderha. Kalan: iskelet, örümcek, golem, hortlak |
| 5 | Yaratık evcilleştirme ve yapay zekâ | Kısmen: görüş/duyma AI, Veyra yoldaş AI, kurt besleme. Kalan: Ay Kılıççısı'nda evcilleştirme döngüsü |
| 6 | Açık dünya, dövüş, envanter, ilerleme | Büyük ölçüde var (2,8 km harita, 4 duruş, ganimet, demirci, seviye). Kalan: harita genişletme, lonca, zindanlar |
| 7 | Android performansı ve mobil kontroller | Kısmen: dokunmatik PS düzeni, 30 m dış çizgi sınırı. Kalan: gerçek cihaz testi, LOD |

## Tamamlananlar

### Tur 1 (2026-11-23) — Özellik 1: kahraman zırh katmanları
- Her zırh türü artık kahramanın **siluetini** değiştiriyor (önceden yalnızca renk tonu değişiyordu):
  - **Kurt Postlu Zırh** (`armwolf`): omuzlarda kurt postu, pençeli ön ayaklar, kürk bilekler ve baldır sargıları,
    göğüste diş kolye, sol kalçada kurt kuyruğu.
  - **Kemik Zırh** (`armbone`): göğüs zırhına bağlı kaburga kafesi, omuzlarda boynuzlu hayvan kafatasları,
    önkolda kemik dikenler, dizlerde kafatası kapaklar, kemerde kemik şeritler.
  - **Kül Zırh** (`armash`): göğüste ve omuzlarda parlayan kor çatlakları, obsidyen kıymıklar, miğferin
    arkasında kömürleşmiş diken taç (uçları kor), kol ve bacaklarda erimiş rün halkaları; kor parıltısı öfke
    çubuğuyla birlikte nabız gibi atıyor.
- Yöntem: `tools/sculpt/models/arm*.mjs` + ortak `_armor.mjs`. Parçalar, `hero.mjs` içindeki zırh yüzeylerine
  ışın yürütmeyle yerleştiriliyor (havada durmuyor, plakanın içine gömülmüyor). Her katman ~5–6k üçgen, toplam +190 KB.
- Oyunda: `buildArmorOverlay()` (`src/52-items.js`) kuşanınca katmanı kahramanın iskeletine deri olarak ekler,
  değiştirince eskisini temizler.
- Hata düzeltmesi: `tools/sculpt/build.mjs` yalnızca önbellekteki modellerle `data/models.js`'i yeniden yazıyordu;
  önbellek depoya girmediği için temiz bir klonda tek model derlemek diğer 15 modeli silerdi. Artık var olan
  kayıtlar korunuyor.
- Görüntüleyici: `test/viewer.html?m=hero+armwolf` birden çok modeli birlikte çizer.
- Test: `test/s-armor.js` 10/10 (takma, çıkarma, sızıntı yok, iskeletle hareket, öfke parıltısı).

### Tur 2 (2026-11-23) — Özellik 1: demirci yükseltmesi zırhta görünüyor
- Not: önceki turların her biri `main`'den ayrı dal açmıştı, işler birikmiyordu. Bu tur son turun dalı
  (`ccr-70a30f22-8xlo0y`, zırh katmanları) üzerine kuruldu; o turun işi bu dalda da var.
- **+3 «Usta İşi»** (`tools/sculpt/models/armup3.mjs`, ~3.5k üçgen): göğüs zırhının oyma çizgileri gümüş kakmayla
  dolduruldu, her omuzluğun kubbesinde 5 gümüş perçin (ışın yürütmeyle plakaya oturur), kol ve baldır zırhında
  burgulu gümüş halat bantlar.
- **+5 «Ay İşçiliği»** (`armup5.mjs`, ~4k üçgen; +3 işiyle birlikte çizilir): göğüste ışıyan ay taşını kucaklayan
  altın hilal + altın halka, miğfer alnında küçük hilal ve ay taşı, dizlerde ay taşlı altın rozetler, omuzluk alt
  kenarında altın şerit. Ay taşları kendi soluk mavi ışığını kullanır; öfkede zırh kızarırken mavi kalır.
- Oyunda (`src/52-items.js`): katman kodu genelleştirildi (`overlaySkin` birden çok modeli tek deriye birleştirir,
  `dropSkin`); süs katmanı zırh türü katmanından bağımsız (Kurt Postlu +5 = kurt postu + ay süsü). Yükseltme,
  kuşanma ve zırh değişiminde kendini yeniler, eskisi temizlenir. Demirci sekmesinde süslerin hangi seviyede
  çıktığı yazıyor.
- Test: yeni `test/s-armup.js` 12/12 (+2'de yok, +3'te armup3, +5'te ikisi tek deri, iskeletle hareket, ay taşı
  ışığı öfkeden bağımsız, zırh değişiminde sızıntı yok). Diğerleri: s-armor 10/10, s-mech 47/47, s-loop 71/71,
  s-stance 11/11. Ekran görüntüleri `ay-kiliccisi/test/out/armup-*.jpg`.

## Sıradaki öncelikler
1. Özellik 1 devamı: miğfersiz kafa/yüz (hikâye sahneleri için; en büyük kalan iş), uzak mesafe LOD (telefon).
   Silah için de +3/+5 görünümü (kılıçta rün oyması, +5 ay ışıltısı) düşünülebilir.
2. Özellik 2: eğimli zeminde ayak IK, duruşa özgü saldırı pozları (ANALIZ.md AŞAMA 1 kalanı).
3. Özellik 4: zindan yaratıkları (iskelet, örümcek) — yeni heykel modelleri.
